import {NextResponse} from 'next/server';
import {writeClient} from '@sanity-lib/write-client';
import {QuoteSubmitSchema} from '@/lib/quote/validation';
import {sendLeadAlertEmail} from '@/lib/quote/resend';
import {pushFullLeadToMautic} from '@/lib/quote/mautic';

/**
 * POST /api/quote — full Step-5 wizard submission (Phase 2.06).
 *
 * Order of operations is deliberate:
 *
 *  1. Honor the master flag — when `WIZARD_SUBMIT_ENABLED=false`, return 200
 *     with `status: 'simulated'` and no side effects. The wizard treats that
 *     identically to a successful submit and redirects to /thank-you/, so the
 *     route remains demoable with the backend intentionally off.
 *  2. Validate. Bad payloads return 400 + a flattened Zod error.
 *  3. Honeypot. Zod already requires `honeypot.length === 0`; we re-check
 *     defensively. Populated honeypot → silent 200 (bots don't learn).
 *  4. Write to Sanity FIRST. Lead capture is the most important side effect;
 *     a Resend or Mautic failure must never lose the lead.
 *  5. Mark any matching `quoteLeadPartial` as `converted: true` (best-effort).
 *  6. Send the lead-alert email via Resend (best-effort).
 *  7. Push to Mautic (no-op while disabled).
 *  8. Succeed as long as at least one of (Sanity, Resend) worked. Both dead
 *     → 500 so the wizard surfaces an error.
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

  if (input.honeypot && input.honeypot.length > 0) {
    return NextResponse.json({status: 'ok'}, {status: 200});
  }

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

  // Send email (best-effort).
  const emailResult = await sendLeadAlertEmail(
    input,
    sanityDocId ?? '(no Sanity ID — write failed)',
  );
  if (!emailResult.ok) {
    console.error('[/api/quote] Resend failed', emailResult.errorMessage);
  }

  // Push to Mautic (no-op while MAUTIC_ENABLED=false).
  await pushFullLeadToMautic(input).catch((err) =>
    console.error('[/api/quote] Mautic stub error', err),
  );

  const anySucceeded = sanityDocId !== null || emailResult.ok;
  if (!anySucceeded) {
    return NextResponse.json(
      {status: 'error', code: 'all_sinks_failed'},
      {status: 500},
    );
  }

  return NextResponse.json({status: 'ok', sanityDocId}, {status: 200});
}
