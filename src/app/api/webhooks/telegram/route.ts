import {NextResponse} from 'next/server';
import {timingSafeEqual} from 'node:crypto';
import {z} from 'zod';
import {writeClient} from '@sanity-lib/write-client';
import {parseCallbackData} from '@/lib/telegram/approvals';
import {answerCallbackQuery, editMessageReplyMarkup} from '@/lib/telegram/client';
import {recordDecision} from '@/lib/telegram/persistLog';

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
 *   6. Route by kind. For servicem8_portfolio, patch the servicem8Event
 *      doc's telegramApprovalState + processedAt, patch the log row,
 *      edit the original Telegram message (remove buttons), and
 *      answerCallbackQuery so Telegram clears the "Loading…" spinner.
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
    // Phase 2.16 ships this handler. Until then, a 'bd:' callback shouldn't
    // exist (buildButtonsForKind throws for blog_draft). If we ever see one,
    // log and ignore.
    console.warn('[telegram-webhook] blog_draft callback received before Phase 2.16');
    return NextResponse.json(
      {status: 'ignored', reason: 'blog-draft-handler-not-implemented'},
      {status: 200},
    );
  }

  // servicem8_portfolio routing
  if (decoded.kind === 'servicem8_portfolio') {
    try {
      const eventDoc = await writeClient.fetch<{_id: string} | null>(
        '*[_type == "servicem8Event" && _id == $id][0]{_id}',
        {id: decoded.targetId},
      );
      if (!eventDoc) {
        return NextResponse.json(
          {status: 'ignored', reason: 'no-matching-event'},
          {status: 200},
        );
      }

      const now = new Date().toISOString();
      const nextState = decoded.action === 'approve' ? 'approved' : 'rejected';

      await writeClient
        .patch(eventDoc._id)
        .set({
          telegramApprovalState: nextState,
          processedAt: now,
          lastUpdatedAt: now,
        })
        .commit();

      const decisionResult = await recordDecision({
        logDocId: logRow._id,
        decision: decoded.action,
        operatorChatId: cq.from.id,
        rawCallbackData: cq.data,
      });
      if (!decisionResult.ok) {
        return NextResponse.json(
          {status: 'error', reason: 'persist-failed'},
          {status: 500},
        );
      }

      // Best-effort Telegram calls — the Sanity state is already authoritative
      // (the log row + the event doc are both patched). Failures here are
      // surfaced in logs but don't fail the webhook — Telegram would retry
      // a 5xx and the idempotency check would dedupe.
      const editResult = await editMessageReplyMarkup({
        chatId: cq.message.chat.id,
        messageId: cq.message.message_id,
      });
      if ('error' in editResult && editResult.error) {
        console.warn('[telegram-webhook] editMessageReplyMarkup failed:', editResult.error);
      }
      const ackResult = await answerCallbackQuery({
        callbackQueryId: cq.id,
        text: 'Recorded',
      });
      if ('error' in ackResult && ackResult.error) {
        console.warn('[telegram-webhook] answerCallbackQuery failed:', ackResult.error);
      }

      return NextResponse.json(
        {status: 'ok', decision: decoded.action, eventId: decoded.targetId},
        {status: 200},
      );
    } catch (err) {
      console.error('[telegram-webhook] servicem8_portfolio routing failed', err);
      return NextResponse.json(
        {status: 'error', reason: 'persist-failed'},
        {status: 500},
      );
    }
  }

  // Unreachable — the ApprovalKind union is exhaustive. Defensive fallback.
  return NextResponse.json(
    {status: 'ignored', reason: 'unknown-kind'},
    {status: 200},
  );
}
