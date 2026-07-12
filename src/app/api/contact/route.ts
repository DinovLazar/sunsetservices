import * as React from 'react';
import {NextResponse} from 'next/server';
import {writeClient} from '@sanity-lib/write-client';
import {ContactSubmitSchema, type ContactSubmitInput} from '@/lib/contact/contactSchema';
import {pushContactToMautic} from '@/lib/contact/mauticStub';
import {sendBrandedEmail} from '@/lib/email/send';
import {ContactAlertEmail} from '@/lib/email/templates/ContactAlertEmail';
import {ContactConfirmationEmail} from '@/lib/email/templates/ContactConfirmationEmail';
import {notifyOperator} from '@/lib/telegram/notify';
import {describeSanityError, safeLogMeta, sanityErrorDetail} from '@/lib/logging/safeError';

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
  let sanityWriteError: unknown = null;
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
    sanityWriteError = err;
    // Permanent structured error log. Captures the Sanity statusCode +
    // message/description so a Preview/Production runtime log names the real
    // cause out loud (e.g. `statusCode: 401` "permission 'create' required" →
    // the write token is missing or read-only in this Vercel env scope).
    console.error('[/api/contact] Sanity write FAILED', sanityErrorDetail('/api/contact', err));
  }

  // Make the failure LOUD. If the durable write failed, page a human via the
  // Telegram operator bot (Phase 2.15 — no-ops with a log line when
  // TELEGRAM_ENABLED!=true). notifyOperator never throws.
  let leadAlertPaged = false;
  if (sanityDocId === null) {
    const telegramResult = await notifyOperator({
      text: buildWriteFailureAlert(input, sanityWriteError),
    });
    leadAlertPaged = telegramResult.sent;
    if (!telegramResult.sent) {
      console.error('[/api/contact] Telegram write-failure alert not delivered', {
        route: '/api/contact',
        simulated: telegramResult.simulated ?? false,
      });
    }
  }

  // Branded alert to Erick. Pass the nullable docId straight through — the
  // template self-declares a write failure (banner + dropped Studio link)
  // rather than concatenating a fallback string into a broken link. On failure
  // the subject also screams in the inbox list without opening.
  const baseSubject = `New contact — ${input.name}`;
  const alertSubject = sanityDocId ? baseSubject : `⚠️ LEAD NOT SAVED — ${baseSubject}`;
  const alertResult = await sendBrandedEmail({
    to: ERICK_TO,
    intendedRecipient: ERICK_TO,
    subject: alertSubject,
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
      sanityDocId,
      locale: input.locale,
    }),
  });
  if (!alertResult.ok) {
    console.error('[/api/contact] alert send failed', {
      route: '/api/contact',
      errorCode: alertResult.error ?? 'email-send-failed',
      sanityDocId,
    });
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
      console.error('[/api/contact] confirmation send failed', {
        route: '/api/contact',
        errorCode: confirmResult.error ?? 'email-send-failed',
        sanityDocId,
      });
    }
  }

  // Mautic (no-op while MAUTIC_ENABLED=false).
  await pushContactToMautic(input).catch((err) =>
    console.error('[/api/contact] Mautic stub error', safeLogMeta('/api/contact', err, {sanityDocId})),
  );

  // Never fail the visitor over a CMS hiccup: as long as the lead landed
  // SOMEWHERE a human will see (Sanity doc, alert email, or a delivered
  // Telegram page), return success. A 500 is reserved for the case where every
  // sink is down and the lead would truly be lost.
  const anySucceeded = sanityDocId !== null || alertResult.ok || leadAlertPaged;
  if (!anySucceeded) {
    console.error('[/api/contact] all sinks failed — lead may be lost', {
      route: '/api/contact',
      sanityWrite: false,
      emailOk: alertResult.ok,
      telegramPaged: leadAlertPaged,
    });
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

/**
 * Plain-text Telegram alert body for a failed contact-lead write. Carries
 * enough for the operator to act from the message alone — the visitor's name,
 * phone, email, and category, plus the Sanity failure reason. Sent WITHOUT
 * MarkdownV2 so no field needs escaping. Mirrors the /api/quote alert.
 */
function buildWriteFailureAlert(input: ContactSubmitInput, error: unknown): string {
  const {statusCode, message, detail} = describeSanityError(error);
  const reason = [statusCode ? `HTTP ${statusCode}` : null, detail ?? message ?? 'unknown error']
    .filter(Boolean)
    .join(' — ');
  return [
    '🚨 Sunset contact lead NOT saved to Sanity',
    '',
    `Name:  ${input.name}`,
    `Phone: ${input.phone || '—'}`,
    `Email: ${input.email || '—'}`,
    `Category: ${input.category || '—'}`,
    '',
    `Reason: ${reason}`,
    '',
    'The contact-alert email was still sent (flagged as unsaved). Re-enter this lead in Studio by hand and check the Vercel runtime logs.',
  ].join('\n');
}
