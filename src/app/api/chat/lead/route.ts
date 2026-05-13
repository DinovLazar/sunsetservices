import {NextRequest} from 'next/server';
import {z} from 'zod';
import {writeClient} from '@sanity-lib/write-client';
import {sendBrandedEmail} from '@/lib/email/send';
import ChatLeadEmail from '@/lib/email/templates/ChatLeadEmail';
import {pushChatLeadToMautic} from '@/lib/chat/mauticStub';

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
 *   5. Branded `ChatLeadEmail` via sandbox-aware `sendBrandedEmail()`.
 *   6. Mautic stub push (no-op while MAUTIC_ENABLED=false).
 *   7. Return {status:'ok', sanityDocId}.
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
    console.error('[/api/chat/lead] Sanity write failed:', err);
    return Response.json({status: 'error'}, {status: 500});
  }

  // Branded email (sandbox routing per Phase 2.08 applies).
  const intendedRecipient = process.env.RESEND_TO_EMAIL ?? 'info@sunsetservices.us';
  const emailResult = await sendBrandedEmail({
    to: intendedRecipient,
    subject: `New chat lead — ${parsed.name}`,
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
    console.error('[/api/chat/lead] Email send failed (non-blocking):', emailResult.error);
  }

  await pushChatLeadToMautic({
    name: parsed.name,
    email: parsed.email,
    locale: parsed.locale,
    sessionId: parsed.sessionId,
    sanityDocId,
    triggerReason: parsed.triggerReason,
  }).catch((err) => console.error('[/api/chat/lead] Mautic stub error', err));

  return Response.json({status: 'ok', sanityDocId}, {status: 200});
}
