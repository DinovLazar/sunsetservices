import {NextResponse} from 'next/server';
import {writeClient} from '@sanity-lib/write-client';
import {QuoteSubmitSchema, type QuoteSubmitInput} from '@/lib/quote/validation';
import {sendQuoteLeadAlertEmail, sendQuoteVisitorConfirmationEmail} from '@/lib/quote/resend';
import {pushFullLeadToMautic} from '@/lib/quote/mautic';
import {getServiceOptionsForAudience} from '@/data/wizard';

/**
 * POST /api/quote — full Step-5 wizard submission.
 *
 * Phase 2.08 swap: both Resend sends now go through the branded
 * `sendBrandedEmail()` utility. A second send was added — a visitor-facing
 * confirmation (was plaintext lead-alert only at Phase 2.06).
 *
 * Order of operations is unchanged from Phase 2.06:
 *
 *  1. Honor the master flag — when `WIZARD_SUBMIT_ENABLED=false`, return 200
 *     with `status: 'simulated'` and no side effects.
 *  2. Validate. Bad payloads return 400.
 *  3. Honeypot. Populated honeypot → silent 200 (bots don't learn).
 *  4. Write to Sanity FIRST. Lead capture is the most important side effect;
 *     a Resend or Mautic failure must never lose the lead.
 *  5. Mark any matching `quoteLeadPartial` as `converted: true` (best-effort).
 *  6. Send the branded lead-alert email to Erick (best-effort).
 *  7. Send the branded visitor-confirmation email (best-effort).
 *  8. Push to Mautic (no-op while disabled).
 *  9. Succeed as long as at least one of (Sanity, Resend) worked.
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
    return NextResponse.json(
      {
        status: 'error',
        code: 'validation_failed',
        issues: parsed.error.flatten(),
      },
      {status: 400},
    );
  }

  const input = parsed.data;

  // Write to Sanity FIRST so the lead is never lost.
  let sanityDocId: string | null = null;
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
      audience: input.audience,
      services: input.services,
      primaryService: input.primaryService || undefined,
      otherText: input.otherText || undefined,
      details: input.details,
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
    console.error('[/api/quote] Sanity write failed', err);
  }

  const primaryServiceDisplayName = resolvePrimaryServiceDisplayName(input);

  // Branded lead alert to Erick (sandbox-aware routing).
  const alertResult = await sendQuoteLeadAlertEmail(
    input,
    primaryServiceDisplayName,
    sanityDocId ?? '(no Sanity ID — write failed)',
  );
  if (!alertResult.ok) {
    console.error('[/api/quote] lead-alert send failed', alertResult.error);
  }

  // Branded visitor confirmation. In sandbox mode this reroutes to the dev
  // inbox; in production it goes to the visitor's real email.
  const confirmResult = await sendQuoteVisitorConfirmationEmail(input, primaryServiceDisplayName);
  if (!confirmResult.ok) {
    console.error('[/api/quote] visitor-confirmation send failed', confirmResult.error);
  }

  // Push to Mautic (no-op while MAUTIC_ENABLED=false).
  await pushFullLeadToMautic(input).catch((err) =>
    console.error('[/api/quote] Mautic stub error', err),
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

/**
 * Resolve the human-readable service name in the lead's locale. Falls back to
 * the raw slug if the audience/slug pair doesn't match a known service (rare —
 * possible for free-text "other" entries which carry no primaryService).
 */
function resolvePrimaryServiceDisplayName(input: QuoteSubmitInput): string {
  const slug = input.primaryService ?? input.services[0];
  if (!slug) return input.otherText?.trim() || 'a project';
  const options = getServiceOptionsForAudience(input.audience);
  const found = options.find((o) => o.slug === slug);
  if (!found) return slug;
  return found.name[input.locale] ?? found.name.en;
}
