import {NextRequest} from 'next/server';
import {z} from 'zod';
import {writeClient} from '@sanity-lib/write-client';
import {sendBrandedEmail} from '@/lib/email/send';
import ChatLeadEmail from '@/lib/email/templates/ChatLeadEmail';
import {pushChatLeadToMautic} from '@/lib/chat/mauticStub';
import {notifyOperator} from '@/lib/telegram/notify';
import {describeSanityError, safeLogMeta, sanityErrorDetail} from '@/lib/logging/safeError';

/**
 * POST /api/chat/lead — capture a lead from the AI chat panel (Phase 2.09).
 *
 * Mirrors the Phase 2.06/2.08 durable-first pattern:
 *   1. Backend kill switch (AI_CHAT_ENABLED=false → 200 {status:'simulated'}).
 *      We return simulated rather than 503 here because the panel can still
 *      surface the success confirmation even when the model is unavailable.
 *   2. Honeypot BEFORE Zod — silent 200 (bot doesn't learn which field tripped).
 *   3. Zod-validate.
 *   4. Sanity write FIRST. The lead is the most important side effect.
 *   5. If the write FAILED: log the real Sanity error (statusCode + description)
 *      and page a human via the Telegram operator bot — a failed lead must
 *      never vanish. We no longer 500 + drop the lead here (HF1 pattern).
 *   6. Branded `ChatLeadEmail` via sandbox-aware `sendBrandedEmail()`. When the
 *      write failed the subject is prefixed and the Studio link is dropped.
 *   7. Mautic stub push (no-op while MAUTIC_ENABLED=false).
 *   8. Succeed as long as any sink (Sanity, email, or a delivered Telegram
 *      page) captured the lead; 500 only when all sinks are down.
 *
 * Resend / Mautic failures are logged and never break the API contract.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TranscriptMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().max(4000),
  ts: z.string().datetime().optional(),
});

const ChatLeadSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  locale: z.enum(['en', 'es']).default('en'),
  sessionId: z.string().min(8).max(128),
  transcriptExcerpt: z.array(TranscriptMessageSchema).max(20),
  triggerReason: z.string().max(500).optional(),
  pageContext: z.string().url().optional(),
  honeypot: z.string().optional(),
});

export async function POST(request: NextRequest) {
  if (process.env.AI_CHAT_ENABLED !== 'true') {
    return Response.json({status: 'simulated'}, {status: 200});
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({status: 'invalid'}, {status: 400});
  }

  // Honeypot BEFORE Zod (silent 200 — bot doesn't learn which field tripped it)
  if (body && typeof body === 'object' && 'honeypot' in body) {
    const hp = (body as Record<string, unknown>).honeypot;
    if (typeof hp === 'string' && hp.length > 0) {
      return Response.json({status: 'ok'}, {status: 200});
    }
  }

  let parsed: z.infer<typeof ChatLeadSchema>;
  try {
    parsed = ChatLeadSchema.parse(body);
  } catch {
    return Response.json({status: 'invalid'}, {status: 400});
  }

  // Sanity write — durable-first.
  let sanityDocId: string | null = null;
  let sanityWriteError: unknown = null;
  try {
    const doc = await writeClient.create({
      _type: 'chatLead',
      name: parsed.name,
      email: parsed.email,
      locale: parsed.locale,
      sessionId: parsed.sessionId,
      capturedAt: new Date().toISOString(),
      triggerReason: parsed.triggerReason,
      transcriptExcerpt: parsed.transcriptExcerpt.map((m, i) => ({
        _key: `msg-${i}`,
        _type: 'message',
        role: m.role,
        content: m.content,
        ts: m.ts ?? new Date().toISOString(),
      })),
      pageContext: parsed.pageContext,
      status: 'new',
      mauticSynced: false,
    });
    sanityDocId = doc._id;
  } catch (err) {
    sanityWriteError = err;
    // HF1 pattern: do NOT 500 + drop the lead on a write failure. Log the real
    // Sanity cause, page a human, and still fire the branded email below so the
    // lead is captured somewhere. Mirrors /api/quote + /api/contact.
    console.error('[/api/chat/lead] Sanity write FAILED', sanityErrorDetail('/api/chat/lead', err));
  }

  // Make the failure LOUD — page a human via the Telegram operator bot on a
  // durable-write failure (no-ops with a log line when TELEGRAM_ENABLED!=true).
  // notifyOperator never throws.
  let leadAlertPaged = false;
  if (sanityDocId === null) {
    const telegramResult = await notifyOperator({
      text: buildWriteFailureAlert(parsed, sanityWriteError),
    });
    leadAlertPaged = telegramResult.sent;
    if (!telegramResult.sent) {
      console.error('[/api/chat/lead] Telegram write-failure alert not delivered', {
        route: '/api/chat/lead',
        simulated: telegramResult.simulated ?? false,
      });
    }
  }

  // Branded email (sandbox routing per Phase 2.08 applies). On a write failure
  // the subject screams in the inbox list and the template drops the Studio
  // link (ChatLeadEmail already renders a null sanityDocId with no link).
  const intendedRecipient = process.env.RESEND_TO_EMAIL ?? 'info@sunsetservices.us';
  const baseSubject = `New chat lead — ${parsed.name}`;
  const subject = sanityDocId ? baseSubject : `⚠️ LEAD NOT SAVED — ${baseSubject}`;
  const emailResult = await sendBrandedEmail({
    to: intendedRecipient,
    subject,
    react: ChatLeadEmail({
      name: parsed.name,
      email: parsed.email,
      locale: parsed.locale,
      sessionId: parsed.sessionId,
      transcriptExcerpt: parsed.transcriptExcerpt,
      triggerReason: parsed.triggerReason,
      pageContext: parsed.pageContext,
      sanityDocId,
    }),
    intendedRecipient,
  });
  if (!emailResult.ok) {
    console.error('[/api/chat/lead] Email send failed (non-blocking)', {
      route: '/api/chat/lead',
      errorCode: emailResult.error ?? 'email-send-failed',
      sanityDocId,
    });
  }

  await pushChatLeadToMautic({
    name: parsed.name,
    email: parsed.email,
    locale: parsed.locale,
    sessionId: parsed.sessionId,
    sanityDocId,
    triggerReason: parsed.triggerReason,
  }).catch((err) =>
    console.error(
      '[/api/chat/lead] Mautic stub error',
      safeLogMeta('/api/chat/lead', err, {sanityDocId}),
    ),
  );

  // Never fail the visitor over a CMS hiccup: succeed as long as the lead landed
  // somewhere a human will see (Sanity doc, chat-lead email, or a delivered
  // Telegram page). A 500 is reserved for the true all-sinks-down case.
  const anySucceeded = sanityDocId !== null || emailResult.ok || leadAlertPaged;
  if (!anySucceeded) {
    console.error('[/api/chat/lead] all sinks failed — lead may be lost', {
      route: '/api/chat/lead',
      sanityWrite: false,
      emailOk: emailResult.ok,
      telegramPaged: leadAlertPaged,
    });
    return Response.json({status: 'error'}, {status: 500});
  }

  return Response.json({status: 'ok', sanityDocId}, {status: 200});
}

/**
 * Plain-text Telegram alert body for a failed chat-lead write. Carries enough
 * for the operator to act from the message alone — the visitor's name, email,
 * and session, plus the Sanity failure reason. Sent WITHOUT MarkdownV2 so no
 * field needs escaping. Mirrors the /api/quote + /api/contact alerts.
 */
function buildWriteFailureAlert(
  input: z.infer<typeof ChatLeadSchema>,
  error: unknown,
): string {
  const {statusCode, message, detail} = describeSanityError(error);
  const reason = [statusCode ? `HTTP ${statusCode}` : null, detail ?? message ?? 'unknown error']
    .filter(Boolean)
    .join(' — ');
  return [
    '🚨 Sunset chat lead NOT saved to Sanity',
    '',
    `Name:  ${input.name}`,
    `Email: ${input.email}`,
    `Session: ${input.sessionId}`,
    '',
    `Reason: ${reason}`,
    '',
    'The chat-lead email was still sent (flagged as unsaved). Re-enter this lead in Studio by hand and check the Vercel runtime logs.',
  ].join('\n');
}
