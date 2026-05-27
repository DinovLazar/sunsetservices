import {writeClient} from '@sanity-lib/write-client';
import {pickNextTopic} from '@/lib/automation/blog/topicPicker';
import {generateBlogDraft} from '@/lib/automation/blog/draft';
import {persistBlogDraftPending} from '@/lib/automation/blog/persistDraft';
import {notifyOperator, requestApproval} from '@/lib/telegram/notify';
import {escapeMarkdownV2} from '@/lib/telegram/markdownV2';
import {safeErrorCode, safeLogMeta} from '@/lib/logging/safeError';

/**
 * Shared executor for the monthly blog draft cron path (Phase 2.16).
 *
 * Called by both the real cron route (/api/cron/blog-draft-monthly) and the
 * test route (/api/test/blog-draft-run). The two routes carry different
 * auth secrets and the test route's flag gate, but the actual work is
 * identical — extracting it here keeps the routes thin and ensures the
 * harness exercises the same code path Vercel Cron will.
 *
 * Returns a discriminated union the route layer can stringify directly.
 * Never throws — internal exceptions are caught here and translated to
 * {status:'error',...} responses (plus best-effort notifyOperator).
 */

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export type MonthlyRunResult =
  | {status: 'simulated'; reason: 'feature-flag'}
  | {status: 'noop'; reason: 'no-topics'}
  | {status: 'noop'; reason: 'monthly-lock-exists'; existingDocId: string}
  | {status: 'noop'; reason: 'pending-draft-exists'; existingDocId: string}
  | {status: 'ok'; docId: string; messageId?: number}
  | {status: 'error'; reason: 'telegram-send-failed'}
  | {status: 'error'; reason: 'cron-failed'};

type BlogDraftLockDoc = {
  _id: string;
  _rev: string;
  status?: string;
};

function getMonthlyLockId(now: Date): string {
  return `blogDraftLock-${now.toISOString().slice(0, 7)}`;
}

function isConflictError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const statusCode = 'statusCode' in error ? error.statusCode : undefined;
  const status = 'status' in error ? error.status : undefined;
  return statusCode === 409 || status === 409;
}

async function findRecentPendingDraft(): Promise<{_id: string} | null> {
  const since = new Date(Date.now() - ONE_DAY_MS).toISOString();
  return writeClient.fetch<{_id: string} | null>(
    '*[_type == "blogDraftPending" && status == "pending" && generatedAt > $since] | order(generatedAt desc)[0]{_id}',
    {since},
  );
}

async function claimMonthlyLock(now: Date): Promise<{claimed: boolean; lockId: string}> {
  const lockId = getMonthlyLockId(now);
  const claimedAt = now.toISOString();

  try {
    await writeClient.create({
      _id: lockId,
      _type: 'blogDraftLock',
      claimedAt,
      status: 'claimed',
    });
    return {claimed: true, lockId};
  } catch (err) {
    if (!isConflictError(err)) throw err;
  }

  const existing = await writeClient.fetch<BlogDraftLockDoc | null>(
    '*[_id == $id][0]{_id, _rev, status}',
    {id: lockId},
  );
  if (existing?.status !== 'failed') {
    return {claimed: false, lockId};
  }

  try {
    await writeClient
      .patch(lockId)
      .ifRevisionId(existing._rev)
      .set({claimedAt, status: 'claimed'})
      .unset(['failedAt', 'errorCode'])
      .commit();
    return {claimed: true, lockId};
  } catch (err) {
    if (isConflictError(err)) return {claimed: false, lockId};
    throw err;
  }
}

async function markMonthlyLock(
  lockId: string | null,
  status: 'completed' | 'failed',
  fields: Record<string, string | number | undefined> = {},
): Promise<void> {
  if (!lockId) return;
  const timestampField = status === 'completed' ? 'completedAt' : 'failedAt';
  await writeClient
    .patch(lockId)
    .set({
      status,
      [timestampField]: new Date().toISOString(),
      ...fields,
    })
    .commit();
}

export async function executeMonthlyBlogDraftRun(): Promise<MonthlyRunResult> {
  if (process.env.BLOG_DRAFT_CRON_ENABLED !== 'true') {
    return {status: 'simulated', reason: 'feature-flag'};
  }

  let lockId: string | null = null;

  try {
    // Claim the calendar-month lock before picking a topic or calling
    // Anthropic. The post-lock pending-draft check preserves the prior
    // one-day dedup behavior for drafts created before this lock existed.
    const lock = await claimMonthlyLock(new Date());
    lockId = lock.lockId;
    if (!lock.claimed) {
      const existing = await findRecentPendingDraft();
      if (existing) {
        return {status: 'noop', reason: 'pending-draft-exists', existingDocId: existing._id};
      }
      return {status: 'noop', reason: 'monthly-lock-exists', existingDocId: lock.lockId};
    }

    const existing = await findRecentPendingDraft();
    if (existing) {
      await markMonthlyLock(lockId, 'completed', {existingDocId: existing._id});
      return {status: 'noop', reason: 'pending-draft-exists', existingDocId: existing._id};
    }

    const topic = await pickNextTopic();
    if (!topic) {
      await markMonthlyLock(lockId, 'completed', {result: 'no-topics'});
      return {status: 'noop', reason: 'no-topics'};
    }

    const modelUsed = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';
    const draft = await generateBlogDraft(topic);

    const {docId} = await persistBlogDraftPending(draft, topic, modelUsed);
    await writeClient.patch(lock.lockId).set({draftDocId: docId}).commit();

    const wordCount = draft.body.en.reduce((sum, block) => {
      if (block.type === 'p' || block.type === 'h2') {
        return sum + block.text.split(/\s+/).filter(Boolean).length;
      }
      return (
        sum +
        block.items.reduce((s, item) => s + item.split(/\s+/).filter(Boolean).length, 0)
      );
    }, 0);

    const summary = [
      `*${escapeMarkdownV2(draft.title.en)}*`,
      '',
      escapeMarkdownV2(draft.dek.en),
      '',
      `_Topic: ${escapeMarkdownV2(topic.keyword)}_`,
      `_Words: ~${wordCount}_`,
    ]
      .join('\n')
      .slice(0, 1000);

    const approval = await requestApproval({
      kind: 'blog_draft',
      targetId: docId,
      summary,
    });

    if (!approval.sent) {
      console.error(
        `[blog-draft-run] requestApproval failed for docId=${docId} (simulated=${approval.simulated ?? false})`,
      );
      await markMonthlyLock(lockId, 'failed', {draftDocId: docId, errorCode: 'telegram-send-failed'});
      return {status: 'error', reason: 'telegram-send-failed'};
    }

    try {
      await writeClient
        .patch(docId)
        .set({
          telegramMessageId: approval.messageId,
          telegramApprovalLogId: approval.logDocId,
        })
        .commit();
    } catch (patchErr) {
      console.warn(
        `[blog-draft-run] telegramMessageId patch failed for docId=${docId}`,
        safeLogMeta('blog-draft-run', patchErr, {docId}),
      );
    }

    await markMonthlyLock(lockId, 'completed', {draftDocId: docId});
    return {status: 'ok', docId, messageId: approval.messageId};
  } catch (err) {
    const message = safeErrorCode(err);
    console.error('[blog-draft-run] failed:', message);
    await markMonthlyLock(lockId, 'failed', {errorCode: 'cron-failed'}).catch(() => {
      // Preserve the original cron failure response.
    });
    await notifyOperator({text: `⚠️ Blog draft cron failed: ${message}`}).catch(() => {
      // notifyOperator never throws — defense-in-depth.
    });
    return {status: 'error', reason: 'cron-failed'};
  }
}
