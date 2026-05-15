import {NextResponse} from 'next/server';
import {timingSafeEqual} from 'node:crypto';
import {z} from 'zod';
import {writeClient} from '@sanity-lib/write-client';
import {parseCallbackData} from '@/lib/telegram/approvals';
import {answerCallbackQuery, editMessageReplyMarkup, sendMessage} from '@/lib/telegram/client';
import {recordDecision} from '@/lib/telegram/persistLog';
import {publishBlogDraft, rejectBlogDraft} from '@/lib/automation/blog/publish';
import {
  publishPortfolioDraft,
  rejectPortfolioDraft,
} from '@/lib/automation/portfolio/publish';
import {notifyOperator} from '@/lib/telegram/notify';
import {escapeMarkdownV2} from '@/lib/telegram/markdownV2';

/**
 * POST /api/webhooks/telegram — Telegram callback_query receiver (Phase 2.15).
 *
 * Flag-gated: when TELEGRAM_ENABLED!=='true' the route returns 200 +
 * {status:'simulated',reason:'feature-flag'} without parsing the body or
 * checking the secret header. Real traffic only flows after the user (a)
 * flips TELEGRAM_ENABLED=true on the target Vercel environment and (b)
 * runs `npm run telegram:setup -- <public-url>/api/webhooks/telegram` once
 * to register the webhook URL with Telegram.
 *
 * Flag-on flow:
 *   1. Verify X-Telegram-Bot-Api-Secret-Token header against
 *      TELEGRAM_WEBHOOK_SECRET_TOKEN with timing-safe compare. 401 on
 *      mismatch, no body parse, no Sanity touch.
 *   2. JSON.parse the body. 400 on failure.
 *   3. Zod validate only the callback_query branch — other update types
 *      (regular message, edited_message, channel_post) return 200 +
 *      ignored:'unsupported-update-type'.
 *   4. Parse callback_data via parseCallbackData. Null → ignore-and-200
 *      (likely a stale message from a previous webhook config).
 *   5. Idempotency check: fetch the telegramApprovalLog row by
 *      sentMessageId. Missing → ignore (we never sent this). Already
 *      decided → 200 + deduped:true (Telegram retries on 5xx).
 *   6. Route by kind:
 *      - 'servicem8_portfolio' (Phase 2.17): targetId is a
 *        portfolioDraftPending._id. On Approve, publishPortfolioDraft()
 *        creates the live `project` doc (createOrReplace with deterministic
 *        _id), patches the pending doc to 'approved', flips the source
 *        servicem8Event's telegramApprovalState to 'approved', and calls
 *        the GBP write stubs (skipped until Phase 2.17a). On Reject,
 *        rejectPortfolioDraft() flips both the pending doc and the source
 *        event to 'rejected'. The webhook edits the original message, acks
 *        the callback, and posts a "Published" / "Rejected" follow-up
 *        linked to the original. Errors → notifyOperator alert + 200 (NOT
 *        500) to suppress Telegram retries against a known-bad state.
 *      - 'blog_draft' (Phase 2.16): on Approve, publishBlogDraft() creates
 *        the live blogPost + scoped faq docs + flips the pending doc to
 *        'approved'. On Reject, rejectBlogDraft() flips the pending doc to
 *        'rejected' (kept for audit). Edit the message, ack, and post a
 *        "Published" / "Rejected" follow-up linked to the original.
 *   7. Sanity/Telegram errors → 500 + opaque persist-failed. Telegram
 *      retries on 5xx; idempotency check (step 5) handles the replay.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const callbackQuerySchema = z.object({
  update_id: z.number(),
  callback_query: z.object({
    id: z.string().min(1),
    from: z.object({
      id: z.number(),
      username: z.string().optional(),
    }),
    message: z.object({
      message_id: z.number(),
      chat: z.object({id: z.number()}),
    }),
    data: z.string().min(1),
  }),
});

const updateTypeSniffSchema = z.object({
  update_id: z.number(),
});

function verifySecretToken(header: string | null, expected: string): boolean {
  if (!header || !expected) return false;
  const headerBuf = Buffer.from(header, 'utf8');
  const expectedBuf = Buffer.from(expected, 'utf8');
  if (headerBuf.length !== expectedBuf.length) return false;
  try {
    return timingSafeEqual(headerBuf, expectedBuf);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (process.env.TELEGRAM_ENABLED !== 'true') {
    console.info('[telegram-webhook] received call with TELEGRAM_ENABLED=false — no-op');
    return NextResponse.json(
      {status: 'simulated', reason: 'feature-flag'},
      {status: 200},
    );
  }

  const headerSecret = request.headers.get('x-telegram-bot-api-secret-token');
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET_TOKEN ?? '';
  if (!verifySecretToken(headerSecret, expectedSecret)) {
    console.warn('[telegram-webhook] invalid secret token');
    return NextResponse.json(
      {status: 'error', reason: 'invalid-secret'},
      {status: 401},
    );
  }

  const rawBody = await request.text();
  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      {status: 'error', reason: 'invalid-json'},
      {status: 400},
    );
  }

  // Sniff the update shape. callback_query is the only update type this phase
  // handles. Other update types (message, edited_message, channel_post,
  // edited_channel_post, …) get a silent 200 — we configured
  // allowed_updates=['callback_query'] in setWebhook, but defense-in-depth.
  const sniff = updateTypeSniffSchema.safeParse(parsedBody);
  if (!sniff.success) {
    return NextResponse.json(
      {status: 'error', reason: 'invalid-payload'},
      {status: 400},
    );
  }

  const hasCallbackQuery =
    typeof parsedBody === 'object' &&
    parsedBody !== null &&
    'callback_query' in parsedBody;
  if (!hasCallbackQuery) {
    return NextResponse.json(
      {status: 'ignored', reason: 'unsupported-update-type'},
      {status: 200},
    );
  }

  const validated = callbackQuerySchema.safeParse(parsedBody);
  if (!validated.success) {
    return NextResponse.json(
      {status: 'error', reason: 'invalid-payload'},
      {status: 400},
    );
  }

  const cq = validated.data.callback_query;
  const decoded = parseCallbackData(cq.data);
  if (!decoded) {
    return NextResponse.json(
      {status: 'ignored', reason: 'unparseable-callback-data'},
      {status: 200},
    );
  }

  // Idempotency: look up the log row by sentMessageId. Missing → never sent
  // by us. Already decided → replay (Telegram retries on 5xx).
  type LogRow = {
    _id: string;
    decision: 'pending' | 'approve' | 'reject';
  };
  let logRow: LogRow | null;
  try {
    logRow = await writeClient.fetch<LogRow | null>(
      '*[_type == "telegramApprovalLog" && sentMessageId == $mid][0]{_id, decision}',
      {mid: cq.message.message_id},
    );
  } catch (err) {
    console.error('[telegram-webhook] log lookup failed', err);
    return NextResponse.json(
      {status: 'error', reason: 'persist-failed'},
      {status: 500},
    );
  }

  if (!logRow) {
    return NextResponse.json(
      {status: 'ignored', reason: 'no-matching-log'},
      {status: 200},
    );
  }
  if (logRow.decision !== 'pending') {
    return NextResponse.json(
      {status: 'ok', deduped: true},
      {status: 200},
    );
  }

  if (decoded.kind === 'blog_draft') {
    try {
      if (decoded.action === 'approve') {
        const result = await publishBlogDraft(decoded.targetId);
        const decisionResult = await recordDecision({
          logDocId: logRow._id,
          decision: 'approve',
          operatorChatId: cq.from.id,
          rawCallbackData: cq.data,
        });
        if (!decisionResult.ok) {
          return NextResponse.json(
            {status: 'error', reason: 'persist-failed'},
            {status: 500},
          );
        }

        // Best-effort Telegram chrome cleanup. Sanity state (the blogPost +
        // patched pending doc + patched log row) is already authoritative.
        const editResult = await editMessageReplyMarkup({
          chatId: cq.message.chat.id,
          messageId: cq.message.message_id,
        });
        if ('error' in editResult && editResult.error) {
          console.warn('[telegram-webhook] editMessageReplyMarkup failed:', editResult.error);
        }
        const ackResult = await answerCallbackQuery({
          callbackQueryId: cq.id,
          text: 'Published.',
        });
        if ('error' in ackResult && ackResult.error) {
          console.warn('[telegram-webhook] answerCallbackQuery failed:', ackResult.error);
        }
        const followupResult = await sendMessage({
          chatId: cq.message.chat.id,
          text: `✅ Published as blog post \`${escapeMarkdownV2(result.blogPostId)}\``,
          parseMode: 'MarkdownV2',
          replyToMessageId: cq.message.message_id,
        });
        if ('error' in followupResult && followupResult.error) {
          console.warn('[telegram-webhook] sendMessage (publish followup) failed:', followupResult.error);
        }

        return NextResponse.json(
          {status: 'ok', decision: 'approve', blogPostId: result.blogPostId},
          {status: 200},
        );
      }

      // action === 'reject'
      await rejectBlogDraft(decoded.targetId);
      const decisionResult = await recordDecision({
        logDocId: logRow._id,
        decision: 'reject',
        operatorChatId: cq.from.id,
        rawCallbackData: cq.data,
      });
      if (!decisionResult.ok) {
        return NextResponse.json(
          {status: 'error', reason: 'persist-failed'},
          {status: 500},
        );
      }

      const editResult = await editMessageReplyMarkup({
        chatId: cq.message.chat.id,
        messageId: cq.message.message_id,
      });
      if ('error' in editResult && editResult.error) {
        console.warn('[telegram-webhook] editMessageReplyMarkup failed:', editResult.error);
      }
      const ackResult = await answerCallbackQuery({
        callbackQueryId: cq.id,
        text: 'Rejected.',
      });
      if ('error' in ackResult && ackResult.error) {
        console.warn('[telegram-webhook] answerCallbackQuery failed:', ackResult.error);
      }
      const followupResult = await sendMessage({
        chatId: cq.message.chat.id,
        text: '✋ Draft rejected\\. Topic returns to the rotation\\.',
        parseMode: 'MarkdownV2',
        replyToMessageId: cq.message.message_id,
      });
      if ('error' in followupResult && followupResult.error) {
        console.warn('[telegram-webhook] sendMessage (reject followup) failed:', followupResult.error);
      }

      return NextResponse.json(
        {status: 'ok', decision: 'reject', pendingDocId: decoded.targetId},
        {status: 200},
      );
    } catch (err) {
      console.error('[telegram-webhook] blog_draft routing failed', err);
      return NextResponse.json(
        {status: 'error', reason: 'persist-failed'},
        {status: 500},
      );
    }
  }

  // servicem8_portfolio routing — Phase 2.17.
  // targetId is the portfolioDraftPending._id (NOT the servicem8Event._id).
  // The publish/reject handlers do all the Sanity writes (project doc,
  // pending status flip, source event terminal state). The webhook is
  // responsible for the Telegram chrome (edit message, ack callback, post
  // follow-up reply) and the audit log decision record.
  if (decoded.kind === 'servicem8_portfolio') {
    try {
      if (decoded.action === 'approve') {
        const result = await publishPortfolioDraft(decoded.targetId);
        const decisionResult = await recordDecision({
          logDocId: logRow._id,
          decision: 'approve',
          operatorChatId: cq.from.id,
          rawCallbackData: cq.data,
        });
        if (!decisionResult.ok) {
          return NextResponse.json(
            {status: 'error', reason: 'persist-failed'},
            {status: 500},
          );
        }

        const editResult = await editMessageReplyMarkup({
          chatId: cq.message.chat.id,
          messageId: cq.message.message_id,
        });
        if ('error' in editResult && editResult.error) {
          console.warn('[telegram-webhook] editMessageReplyMarkup failed:', editResult.error);
        }
        const ackResult = await answerCallbackQuery({
          callbackQueryId: cq.id,
          text: 'Published.',
        });
        if ('error' in ackResult && ackResult.error) {
          console.warn('[telegram-webhook] answerCallbackQuery failed:', ackResult.error);
        }
        const gbpStatusLine =
          'skipped' in result.gbpUploadResult && result.gbpUploadResult.skipped
            ? `\nGBP upload: skipped \\(${escapeMarkdownV2(result.gbpUploadResult.reason)}\\)`
            : '\nGBP upload: see logs';
        const followupResult = await sendMessage({
          chatId: cq.message.chat.id,
          text: `✅ Published portfolio entry \`${escapeMarkdownV2(result.projectId)}\`${gbpStatusLine}`,
          parseMode: 'MarkdownV2',
          replyToMessageId: cq.message.message_id,
        });
        if ('error' in followupResult && followupResult.error) {
          console.warn(
            '[telegram-webhook] sendMessage (portfolio publish followup) failed:',
            followupResult.error,
          );
        }

        return NextResponse.json(
          {status: 'ok', decision: 'approve', projectId: result.projectId},
          {status: 200},
        );
      }

      // action === 'reject'
      await rejectPortfolioDraft(decoded.targetId);
      const decisionResult = await recordDecision({
        logDocId: logRow._id,
        decision: 'reject',
        operatorChatId: cq.from.id,
        rawCallbackData: cq.data,
      });
      if (!decisionResult.ok) {
        return NextResponse.json(
          {status: 'error', reason: 'persist-failed'},
          {status: 500},
        );
      }

      const editResult = await editMessageReplyMarkup({
        chatId: cq.message.chat.id,
        messageId: cq.message.message_id,
      });
      if ('error' in editResult && editResult.error) {
        console.warn('[telegram-webhook] editMessageReplyMarkup failed:', editResult.error);
      }
      const ackResult = await answerCallbackQuery({
        callbackQueryId: cq.id,
        text: 'Rejected.',
      });
      if ('error' in ackResult && ackResult.error) {
        console.warn('[telegram-webhook] answerCallbackQuery failed:', ackResult.error);
      }
      const followupResult = await sendMessage({
        chatId: cq.message.chat.id,
        text: '✋ Portfolio draft rejected\\. Source event marked as rejected\\.',
        parseMode: 'MarkdownV2',
        replyToMessageId: cq.message.message_id,
      });
      if ('error' in followupResult && followupResult.error) {
        console.warn(
          '[telegram-webhook] sendMessage (portfolio reject followup) failed:',
          followupResult.error,
        );
      }

      return NextResponse.json(
        {status: 'ok', decision: 'reject', pendingDocId: decoded.targetId},
        {status: 200},
      );
    } catch (err) {
      console.error('[telegram-webhook] servicem8_portfolio routing failed', err);
      const message = err instanceof Error ? err.message : 'unknown-error';
      await notifyOperator({
        text: `⚠️ Portfolio approval decision failed: ${message}`,
      }).catch(() => {
        // notifyOperator never throws; defense-in-depth.
      });
      // Best-effort ack — clear the operator's spinner before returning.
      await answerCallbackQuery({
        callbackQueryId: cq.id,
        text: 'Error — see operator log',
      }).catch(() => {});
      // Return 200 (NOT 500) so Telegram does NOT retry — the operator
      // already saw the alert and a replay would just spam them.
      return NextResponse.json(
        {status: 'error', reason: 'handler-failed', message},
        {status: 200},
      );
    }
  }

  // Unreachable — the ApprovalKind union is exhaustive. Defensive fallback.
  return NextResponse.json(
    {status: 'ignored', reason: 'unknown-kind'},
    {status: 200},
  );
}
