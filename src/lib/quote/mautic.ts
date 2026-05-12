import type {QuoteSubmitInput, QuotePartialInput} from './validation';

/**
 * Mautic CRM push stub (Phase 2.06).
 *
 * Flipped on when Erick's self-hosted Mautic server is live by setting
 * `MAUTIC_ENABLED=true` + populating `MAUTIC_BASE_URL` and `MAUTIC_API_KEY`.
 * Until then, both functions are no-ops that log a single line so the call
 * sites can be wired exactly as they will work in production.
 *
 * The real implementation will live inside the `// TODO Phase 2.x` block of
 * each function — same shape, same return contract, just adding the network
 * call. Callers should always await the returned promise but never block the
 * UX on a non-OK result (Mautic is downstream of the lead capture; losing a
 * Mautic push is non-fatal).
 */

const ENABLED = process.env.MAUTIC_ENABLED === 'true';

export type MauticPushResult = {synced: boolean; errorMessage?: string};

/** Push a full lead to Mautic. When `MAUTIC_ENABLED=false`, this is a no-op. */
export async function pushFullLeadToMautic(
  input: QuoteSubmitInput,
): Promise<MauticPushResult> {
  if (!ENABLED) {
    console.log('[Mautic stub] full lead — Mautic disabled, no-op', {
      sessionId: input.sessionId,
    });
    return {synced: false};
  }
  // TODO Phase 2.x — call Mautic API at MAUTIC_BASE_URL.
  return {synced: false, errorMessage: 'Mautic implementation pending Phase 2.x'};
}

/** Push a partial-record breadcrumb to Mautic. Same gating. */
export async function pushPartialLeadToMautic(
  input: QuotePartialInput,
): Promise<MauticPushResult> {
  if (!ENABLED) {
    console.log('[Mautic stub] partial — Mautic disabled, no-op', {
      sessionId: input.sessionId,
      step: input.lastStepReached,
    });
    return {synced: false};
  }
  // TODO Phase 2.x — call Mautic API at MAUTIC_BASE_URL.
  return {synced: false, errorMessage: 'Mautic implementation pending Phase 2.x'};
}
