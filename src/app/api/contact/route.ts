import * as React from 'react';
import {NextResponse} from 'next/server';
import {writeClient} from '@sanity-lib/write-client';
import {ContactSubmitSchema} from '@/lib/contact/contactSchema';
import {pushContactToMautic} from '@/lib/contact/mauticStub';
import {sendBrandedEmail} from '@/lib/email/send';
import {ContactAlertEmail} from '@/lib/email/templates/ContactAlertEmail';
import {ContactConfirmationEmail} from '@/lib/email/templates/ContactConfirmationEmail';

/**
 * POST /api/contact — /contact/ form submission (Phase 2.08).
 *
 * Mirrors the architecture of /api/quote:
 *
 *  1. Honor master flag CONTACT_SUBMIT_ENABLED — when off, return 200 +
 *     `status: 'simulated'` and no side effects.
 *  2. Honeypot check BEFORE Zod (silent 200 — bots don't learn which field
 *     they tripped).
 *  3. Zod parse. Bad payload → 400.
 *  4. Soft D14 enforcement: require at least one of email or phone after
 *     parsing (Zod allows both optional, the route is the final guard).
 *  5. Write to Sanity FIRST so a Resend/Mautic failure never loses the lead.
 *  6. Send branded alert to Erick (best-effort).
 *  7. Send branded confirmation to visitor (best-effort, requires email).
 *  8. Mautic push (no-op while disabled).
 */

const ENABLED = process.env.CONTACT_SUBMIT_ENABLED === 'true';
const ERICK_TO = process.env.RESEND_TO_EMAIL ?? 'info@sunsetservices.us';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!ENABLED) {
    return NextResponse.json(
      {status: 'simulated', message: 'CONTACT_SUBMIT_ENABLED=false — no real submit.'},
      {status: 200},
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({status: 'error', code: 'invalid_json'}, {status: 400});
  }

  // Honeypot first — generic 200, no field-level error.
  const honeypotRaw =
    payload && typeof payload === 'object' && 'honeypot' in payload
      ? (payload as Record<string, unknown>).honeypot
      : '';
  if (typeof honeypotRaw === 'string' && honeypotRaw.length > 0) {
    return NextResponse.json({status: 'ok'}, {status: 200});
  }

  const parsed = ContactSubmitSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {status: 'error', code: 'invalid_payload'},
      {status: 400},
    );
  }

  const input = parsed.data;

  // D14 — require at least one of email or phone. The form enforces this
  // client-side; the API mirrors so a stale form can't slip past.
  const hasEmail = !!input.email && input.email.length > 0;
  const hasPhone = !!input.phone && input.phone.length > 0;
  if (!hasEmail && !hasPhone) {
    return NextResponse.json(
      {status: 'error', code: 'invalid_payload'},
      {status: 400},
    );
  }

  // Write to Sanity FIRST so the lead is never lost.
  let sanityDocId: string | null = null;
  try {
    const doc = await writeClient.create({
      _type: 'contactSubmission',
      submittedAt: new Date().toISOString(),
      sessionId: input.sessionId,
      locale: input.locale,
      userAgent: input.userAgent || undefined,
      referrer: input.referrer || undefined,
      status: 'new',
      mauticSynced: false,
      name: input.name,
      email: input.email || undefined,
      phone: input.phone || undefined,
      category: input.category || undefined,
      message: input.message || undefined,
    });
    sanityDocId = doc._id;
  } catch (err) {
    console.error('[/api/contact] Sanity write failed', err);
  }

  // Branded alert to Erick.
  const alertResult = await sendBrandedEmail({
    to: ERICK_TO,
    intendedRecipient: ERICK_TO,
    subject: `New contact — ${input.name}`,
    react: React.createElement(ContactAlertEmail, {
      submission: {
        name: input.name,
        email: input.email || undefined,
        phone: input.phone || undefined,
        category: input.category || undefined,
        message: input.message ?? '',
        sessionId: input.sessionId,
        referrer: input.referrer,
      },
      sanityDocId: sanityDocId ?? '(no Sanity ID — write failed)',
      locale: input.locale,
    }),
  });
  if (!alertResult.ok) {
    console.error('[/api/contact] alert send failed', alertResult.error);
  }

  // Branded visitor confirmation — only when we have an email to send to.
  let confirmResult: {ok: boolean; error?: string} = {ok: true};
  if (hasEmail && input.email) {
    const firstName = pickFirstName(input.name);
    const subject =
      input.locale === 'es' ? 'Recibimos tu mensaje' : 'We received your message';
    confirmResult = await sendBrandedEmail({
      to: input.email,
      intendedRecipient: input.email,
      subject,
      react: React.createElement(ContactConfirmationEmail, {
        firstName,
        locale: input.locale,
      }),
    });
    if (!confirmResult.ok) {
      console.error('[/api/contact] confirmation send failed', confirmResult.error);
    }
  }

  // Mautic (no-op while MAUTIC_ENABLED=false).
  await pushContactToMautic(input).catch((err) =>
    console.error('[/api/contact] Mautic stub error', err),
  );

  const anySucceeded = sanityDocId !== null || alertResult.ok;
  if (!anySucceeded) {
    return NextResponse.json(
      {status: 'error', code: 'all_sinks_failed'},
      {status: 500},
    );
  }

  return NextResponse.json({status: 'ok', sanityDocId}, {status: 200});
}

function pickFirstName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return 'there';
  const first = trimmed.split(/\s+/)[0];
  // Sanitize for safety even though name came through Zod — keep it short.
  return first.slice(0, 50);
}
