/**
 * Chat / wizard feature flag readers — Phase 1.20.
 *
 * Server-safe (read at module evaluation time, no `window` access).
 * Defaults match the Part-1 development contract:
 *   - chat OFF (bubble doesn't render)
 *   - wizard submit OFF (Submit routes to /thank-you/ via UI sim)
 *   - wizard autosave ON (Steps 1–3 persisted to localStorage)
 *
 * `NEXT_PUBLIC_*` flags are inlined at build time and are safe in client
 * components. `WIZARD_SUBMIT_ENABLED` is server-only (no NEXT_PUBLIC prefix).
 */

export function isAiChatEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AI_CHAT_ENABLED === 'true';
}

export function isWizardSubmitEnabled(): boolean {
  return process.env.WIZARD_SUBMIT_ENABLED === 'true';
}

export function isWizardAutosaveEnabled(): boolean {
  // Default ON — undefined or empty string → true.
  const v = process.env.NEXT_PUBLIC_WIZARD_AUTOSAVE_ENABLED;
  if (v === 'false' || v === '0') return false;
  return true;
}
