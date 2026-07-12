import {NextResponse} from 'next/server';
import {writeClient} from '@sanity-lib/write-client';
import {QuoteSubmitSchema, type QuoteSubmitInput} from '@/lib/quote/validation';
import {sendQuoteLeadAlertEmail, sendQuoteVisitorConfirmationEmail} from '@/lib/quote/resend';
import {pushFullLeadToMautic} from '@/lib/quote/mautic';
import {getServiceOptionsForDivision} from '@/data/wizard';
import {notifyOperator} from '@/lib/telegram/notify';
import {describeSanityError, safeLogMeta, sanityErrorDetail} from '@/lib/logging/safeError';

/**
 * POST /api/quote — full Step-5 wizard submission.
 *
 * Phase M.01e-pt2 swap: payload now carries `division` + `propertyType`
 * (audience field gone). Sanity write + lead-email templates reflect the new
 * shape. Order of operations unchanged from Phase 2.06:
 *
 *  1. Honor the master flag — when `WIZARD_SUBMIT_ENABLED=false`, return 200
 *     with `status: 'simulated'` and no side effects.
 *  2. Validate. Bad payloads return 400.
 *  3. Honeypot. Populated honeypot → silent 200 (bots don't learn).
 *  4. Write to Sanity FIRST. Lead capture is the most important side effect;
 *     a Resend or Mautic failure must never lose the lead.
 *  5. Mark any matching `quoteLeadPartial` as `converted: true` (best-effort).
 *  6. If the Sanity write FAILED: log the full Sanity error (statusCode +
 *     message/description) and fire the Telegram operator alert so a human is
 *     paged — a failed lead must never sit in an inbox looking normal.
 *  7. Send the branded lead-alert email to Erick (best-effort). When the write
 *     failed, the email self-declares it (subject prefix + banner) and still
 *     carries every submitted field so the lead can be re-entered by hand.
 *  8. Send the branded visitor-confirmation email (best-effort).
 *  9. Push to Mautic (no-op while disabled).
 * 10. Succeed as long as at least one sink (Sanity, Resend, or the Telegram
 *     alert) worked — the customer never sees an error because our CMS hiccuped.
 */

const ENABLED = process.env.WIZARD_SUBMIT_ENABLED === 'true';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!ENABLED) {
    return NextResponse.json(
      {
        status: 'simulated',
        message: 'WIZARD_SUBMIT_ENABLED=false — no real submit.',
      },
      {status: 200},
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {status: 'error', code: 'invalid_json'},
      {status: 400},
    );
  }

  // Honeypot check — runs BEFORE Zod so bots get a generic 200 with no
  // field-level error pointing at "honeypot". Silent accept (no side effects).
  const honeypotRaw =
    payload && typeof payload === 'object' && 'honeypot' in payload
      ? (payload as Record<string, unknown>).honeypot
      : '';
  if (typeof honeypotRaw === 'string' && honeypotRaw.length > 0) {
    return NextResponse.json({status: 'ok'}, {status: 200});
  }

  const parsed = QuoteSubmitSchema.safeParse(payload);
  if (!parsed.success) {
    console.info('[/api/quote] validation failed', {
      route: '/api/quote',
      errorCode: 'invalid-payload',
      fields: Object.keys(parsed.error.flatten().fieldErrors),
    });
    return NextResponse.json(
      {status: 'error', reason: 'invalid-payload'},
      {status: 400},
    );
  }

  const input = parsed.data;

  // Phase B.11 — build the Sanity image-reference array from the validated
  // photo asset IDs. Each entry's asset._ref points at a sanity.imageAsset
  // that was uploaded earlier through /api/quote/photo-upload.
  const photosField =
    input.photoAssetIds && input.photoAssetIds.length > 0
      ? input.photoAssetIds.map((id) => ({
          _key: globalThis.crypto.randomUUID(),
          _type: 'image',
          asset: {_type: 'reference', _ref: id},
        }))
      : undefined;

  // Write to Sanity FIRST so the lead is never lost.
  let sanityDocId: string | null = null;
  let sanityWriteError: unknown = null;
  try {
    const doc = await writeClient.create({
      _type: 'quoteLead',
      submittedAt: new Date().toISOString(),
      sessionId: input.sessionId,
      source: 'wizard',
      status: 'new',
      mauticSynced: false,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      address: input.address,
      division: input.division,
      propertyType: input.propertyType,
      services: input.services,
      primaryService: input.primaryService || undefined,
      otherText: input.otherText || undefined,
      details: input.details,
      photos: photosField,
      contactPreferences: input.contactPreferences,
    });
    sanityDocId = doc._id;

    // Best-effort: mark any matching partial as converted.
    await writeClient
      .patch(`quoteLeadPartial-${input.sessionId}`)
      .set({converted: true})
      .commit()
      .catch(() => {
        // Never block on partial linkage.
      });
  } catch (err) {
    sanityWriteError = err;
    // Permanent structured error log. Captures the Sanity statusCode +
    // message/description so a Preview/Production runtime log names the real
    // cause out loud (e.g. `statusCode: 401` "permission 'create' required"
    // → the write token is missing or read-only in this Vercel env scope).
    console.error('[/api/quote] Sanity write FAILED', sanityErrorDetail('/api/quote', err));
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
      console.error('[/api/quote] Telegram write-failure alert not delivered', {
        route: '/api/quote',
        simulated: telegramResult.simulated ?? false,
      });
    }
  }

  const primaryServiceDisplayName = resolvePrimaryServiceDisplayName(input);

  // Branded lead alert to Erick (sandbox-aware routing). Pass the nullable
  // docId straight through — the sender/template self-declare a write failure
  // rather than concatenating a fallback string into a broken Studio link.
  const alertResult = await sendQuoteLeadAlertEmail(
    input,
    primaryServiceDisplayName,
    sanityDocId,
  );
  if (!alertResult.ok) {
    console.error('[/api/quote] lead-alert send failed', {
      route: '/api/quote',
      errorCode: alertResult.error ?? 'email-send-failed',
      sanityDocId,
    });
  }

  // Branded visitor confirmation. In sandbox mode this reroutes to the dev
  // inbox; in production it goes to the visitor's real email.
  const confirmResult = await sendQuoteVisitorConfirmationEmail(input, primaryServiceDisplayName);
  if (!confirmResult.ok) {
    console.error('[/api/quote] visitor-confirmation send failed', {
      route: '/api/quote',
      errorCode: confirmResult.error ?? 'email-send-failed',
      sanityDocId,
    });
  }

  // Push to Mautic (no-op while MAUTIC_ENABLED=false).
  await pushFullLeadToMautic(input).catch((err) =>
    console.error('[/api/quote] Mautic stub error', safeLogMeta('/api/quote', err, {sanityDocId})),
  );

  // Never fail the customer over a CMS hiccup: as long as the lead landed
  // SOMEWHERE a human will see (Sanity doc, lead-alert email, or a delivered
  // Telegram page), return success. A 500 is reserved for the case where every
  // sink is down and the lead would truly be lost.
  const anySucceeded = sanityDocId !== null || alertResult.ok || leadAlertPaged;
  if (!anySucceeded) {
    console.error('[/api/quote] all sinks failed — lead may be lost', {
      route: '/api/quote',
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

/**
 * Resolve the human-readable service name in the lead's locale. Falls back to
 * the raw slug if the division/slug pair doesn't match a known service (rare —
 * possible for free-text "other" entries which carry no primaryService).
 */
function resolvePrimaryServiceDisplayName(input: QuoteSubmitInput): string {
  const slug = input.primaryService ?? input.services[0];
  if (!slug) return input.otherText?.trim() || 'a project';
  const options = getServiceOptionsForDivision(input.division);
  const found = options.find((o) => o.slug === slug);
  if (!found) return slug;
  return found.name[input.locale] ?? found.name.en;
}

/**
 * Plain-text Telegram alert body for a failed lead write. Carries enough for
 * the operator to act from the message alone — the customer's name, phone, and
 * email, plus the Sanity failure reason. Sent WITHOUT MarkdownV2 so no field
 * needs escaping.
 */
function buildWriteFailureAlert(input: QuoteSubmitInput, error: unknown): string {
  const {statusCode, message, detail} = describeSanityError(error);
  const reason = [statusCode ? `HTTP ${statusCode}` : null, detail ?? message ?? 'unknown error']
    .filter(Boolean)
    .join(' — ');
  return [
    '🚨 Sunset quote lead NOT saved to Sanity',
    '',
    `Name:  ${input.firstName} ${input.lastName}`,
    `Phone: ${input.phone}`,
    `Email: ${input.email}`,
    `Division: ${input.division}`,
    '',
    `Reason: ${reason}`,
    '',
    'The lead-alert email was still sent (flagged as unsaved). Re-enter this lead in Studio by hand and check the Vercel runtime logs.',
  ].join('\n');
}
