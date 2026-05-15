import {NextResponse} from 'next/server';
import {writeClient} from '@sanity-lib/write-client';
import {pickNextTopic} from '@/lib/automation/blog/topicPicker';
import {generateBlogDraft} from '@/lib/automation/blog/draft';
import {persistBlogDraftPending} from '@/lib/automation/blog/persistDraft';
import {verifyCronAuth} from '@/lib/automation/cronAuth';
import {notifyOperator, requestApproval} from '@/lib/telegram/notify';
import {escapeMarkdownV2} from '@/lib/telegram/markdownV2';

/**
 * POST /api/cron/blog-draft-monthly — Vercel Cron entry point (Phase 2.16).
 *
 * Runs once a month (vercel.json schedule). Picks the next unused topic from
 * BLOG_TOPICS, generates a bilingual Anthropic draft, persists it as a
 * `blogDraftPending` document, and sends a Telegram approval request to the
 * operator. On Approve (handled by the Telegram webhook), publishBlogDraft
 * creates the live blogPost; on Reject, status flips to 'rejected' and the
 * topic returns to the rotation.
 *
 * Auth: every request must carry `Authorization: Bearer ${CRON_SECRET}`.
 * Vercel Cron sends this header automatically once `vercel.json` is in
 * place. Manual triggers (e.g. via curl during smoke tests) must include it
 * too.
 *
 * Flag-off: when BLOG_DRAFT_CRON_ENABLED!=='true', returns 200 + simulated
 * without invoking Anthropic or writing Sanity. Master kill switch.
 *
 * Idempotency: Vercel Cron rarely retries on success, but a transient
 * mid-execution failure could cause one. Before invoking Anthropic, the
 * route checks for any pending blogDraftPending for the same topicId
 * generated within the last 1 day; if found, returns 200 + noop and skips
 * the expensive parts. Net effect: at most ONE Anthropic call per topic per
 * day even under repeated cron triggers.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  // 1. Auth
  const auth = request.headers.get('authorization');
  const expected = process.env.CRON_SECRET ?? '';
  if (!verifyCronAuth(auth, expected)) {
    return NextResponse.json({status: 'error', reason: 'invalid-auth'}, {status: 401});
  }

  // 2. Master kill switch
  if (process.env.BLOG_DRAFT_CRON_ENABLED !== 'true') {
    return NextResponse.json(
      {status: 'simulated', reason: 'feature-flag'},
      {status: 200},
    );
  }

  try {
    // 3. Pick next topic
    const topic = await pickNextTopic();
    if (!topic) {
      return NextResponse.json(
        {status: 'noop', reason: 'no-topics'},
        {status: 200},
      );
    }

    // 4. Idempotency: skip if a recent pending draft already exists for this topic
    const since = new Date(Date.now() - ONE_DAY_MS).toISOString();
    const existing = await writeClient.fetch<{_id: string} | null>(
      '*[_type == "blogDraftPending" && status == "pending" && automatedTopicId == $tid && generatedAt > $since][0]{_id}',
      {tid: topic.id, since},
    );
    if (existing) {
      return NextResponse.json(
        {status: 'noop', reason: 'pending-draft-exists', existingDocId: existing._id},
        {status: 200},
      );
    }

    // 5. Generate draft via Anthropic
    const modelUsed = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';
    const draft = await generateBlogDraft(topic);

    // 6. Persist as blogDraftPending
    const {docId} = await persistBlogDraftPending(draft, topic, modelUsed);

    // 7. Build Telegram summary (MarkdownV2-escaped)
    const wordCount = draft.body.en.reduce((sum, block) => {
      if (block.type === 'p' || block.type === 'h2') {
        return sum + block.text.split(/\s+/).filter(Boolean).length;
      }
      return sum + block.items.reduce((s, item) => s + item.split(/\s+/).filter(Boolean).length, 0);
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

    // 8. Request operator approval
    const approval = await requestApproval({
      kind: 'blog_draft',
      targetId: docId,
      summary,
    });

    if (!approval.sent) {
      // Doc remains 'pending'; next cron run's idempotency check will see
      // it and skip. Manual reconcile needed if Telegram is durably broken.
      console.error(
        `[cron blog-draft-monthly] requestApproval failed for docId=${docId} (simulated=${approval.simulated ?? false})`,
      );
      return NextResponse.json(
        {status: 'error', reason: 'telegram-send-failed'},
        {status: 500},
      );
    }

    // 9. Patch the doc with Telegram audit cross-references
    try {
      await writeClient
        .patch(docId)
        .set({
          telegramMessageId: approval.messageId,
          telegramApprovalLogId: approval.logDocId,
        })
        .commit();
    } catch (patchErr) {
      // Audit-row patch failure is non-fatal — the message was sent, the
      // doc exists, the operator can still tap. Log and continue.
      console.warn(
        `[cron blog-draft-monthly] telegramMessageId patch failed for docId=${docId}`,
        patchErr,
      );
    }

    return NextResponse.json(
      {status: 'ok', docId, messageId: approval.messageId},
      {status: 200},
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown-error';
    console.error('[cron blog-draft-monthly] failed:', message);

    // Best-effort operator alert. notifyOperator never throws.
    await notifyOperator({
      text: `⚠️ Blog draft cron failed: ${message}`,
    }).catch(() => {
      // notifyOperator returns rather than throws, but defense-in-depth.
    });

    return NextResponse.json(
      {status: 'error', reason: 'cron-failed'},
      {status: 500},
    );
  }
}
