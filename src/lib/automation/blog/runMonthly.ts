import {writeClient} from '@sanity-lib/write-client';
import {pickNextTopic} from '@/lib/automation/blog/topicPicker';
import {generateBlogDraft} from '@/lib/automation/blog/draft';
import {persistBlogDraftPending} from '@/lib/automation/blog/persistDraft';
import {notifyOperator, requestApproval} from '@/lib/telegram/notify';
import {escapeMarkdownV2} from '@/lib/telegram/markdownV2';

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
  | {status: 'noop'; reason: 'pending-draft-exists'; existingDocId: string}
  | {status: 'ok'; docId: string; messageId?: number}
  | {status: 'error'; reason: 'telegram-send-failed'}
  | {status: 'error'; reason: 'cron-failed'};

export async function executeMonthlyBlogDraftRun(): Promise<MonthlyRunResult> {
  if (process.env.BLOG_DRAFT_CRON_ENABLED !== 'true') {
    return {status: 'simulated', reason: 'feature-flag'};
  }

  try {
    // Pre-picker idempotency check: is there ANY pending draft from the last
    // 1 day? Off-spec from the plan's per-topic check — time-based dedup is
    // robust against picker-cache TTL variance (Anthropic calls can run >60s,
    // outlasting the cache window; per-topic dedup would silently fail then).
    // After 1 day, the check no longer fires → the next monthly run is free
    // to generate a new draft. Phase 2.16 Decisions entry documents this.
    const since = new Date(Date.now() - ONE_DAY_MS).toISOString();
    const existing = await writeClient.fetch<{_id: string} | null>(
      '*[_type == "blogDraftPending" && status == "pending" && generatedAt > $since] | order(generatedAt desc)[0]{_id}',
      {since},
    );
    if (existing) {
      return {status: 'noop', reason: 'pending-draft-exists', existingDocId: existing._id};
    }

    const topic = await pickNextTopic();
    if (!topic) return {status: 'noop', reason: 'no-topics'};

    const modelUsed = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';
    const draft = await generateBlogDraft(topic);

    const {docId} = await persistBlogDraftPending(draft, topic, modelUsed);

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
        patchErr,
      );
    }

    return {status: 'ok', docId, messageId: approval.messageId};
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown-error';
    console.error('[blog-draft-run] failed:', message);
    await notifyOperator({text: `⚠️ Blog draft cron failed: ${message}`}).catch(() => {
      // notifyOperator never throws — defense-in-depth.
    });
    return {status: 'error', reason: 'cron-failed'};
  }
}
