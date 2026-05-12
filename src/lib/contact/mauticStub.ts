import type {ContactSubmitInput} from './contactSchema';

/**
 * Mautic CRM stub for contact submissions (Phase 2.08).
 *
 * Same gating + shape as `src/lib/quote/mautic.ts`. Flips on when Erick's
 * Mautic server is live by setting `MAUTIC_ENABLED=true` + populating
 * `MAUTIC_BASE_URL` and `MAUTIC_API_KEY`.
 */

const ENABLED = process.env.MAUTIC_ENABLED === 'true';

export type MauticPushResult = {synced: boolean; errorMessage?: string};

export async function pushContactToMautic(
  input: ContactSubmitInput,
): Promise<MauticPushResult> {
  if (!ENABLED) {
    console.log('[Mautic stub] contact — Mautic disabled, no-op', {
      sessionId: input.sessionId,
    });
    return {synced: false};
  }
  // TODO Phase 2.x — call Mautic API at MAUTIC_BASE_URL.
  return {synced: false, errorMessage: 'Mautic implementation pending Phase 2.x'};
}
