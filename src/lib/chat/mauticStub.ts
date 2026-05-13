/**
 * Mautic CRM push stub for chat leads (Phase 2.09).
 *
 * Mirrors the wizard / contact / newsletter Mautic stubs (Phase 2.06–2.08):
 * a single no-op log line when `MAUTIC_ENABLED=false`, and a placeholder TODO
 * for the real implementation. Call sites always await the returned promise
 * but never block the UX on a non-OK result — Mautic is downstream of the
 * Sanity-write durable capture.
 */

export type ChatLeadMauticInput = {
  name: string;
  email: string;
  locale: 'en' | 'es';
  sessionId: string;
  sanityDocId: string | null;
  triggerReason?: string;
};

export type MauticPushResult = {synced: boolean; errorMessage?: string};

const ENABLED = process.env.MAUTIC_ENABLED === 'true';

export async function pushChatLeadToMautic(input: ChatLeadMauticInput): Promise<MauticPushResult> {
  if (!ENABLED) {
    console.log('[Mautic stub] chat lead — Mautic disabled, no-op', {
      email: input.email,
      sessionId: input.sessionId,
      sanityDocId: input.sanityDocId,
    });
    return {synced: false};
  }
  // TODO Phase 2.x — POST to MAUTIC_BASE_URL using MAUTIC_API_KEY.
  return {synced: false, errorMessage: 'Mautic implementation pending Phase 2.x'};
}
