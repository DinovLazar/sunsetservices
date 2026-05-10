/**
 * Wizard autosave — Phase 1.20 D9 (B = localStorage Part 1, C deferred).
 *
 * **Strict PII boundary:** Steps 1–3 only (audience, services, project
 * details). Step 4 contact data and Step 5 review data NEVER pass through
 * this module. Stored payload is plaintext and any local browser-extension
 * can read it; this is the trade-off Erick accepted for abandoner recovery.
 *
 * 30-day expiry. On stale load → null + clear.
 */

const STORAGE_KEY = 'sunset_wizard_progress_v1';
const EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export type WizardAutosavePayload = {
  step1: {audience: string};
  step2: {selectedSlugs: string[]; primarySlug: string; otherText: string};
  step3: Record<string, string | string[]>;
  savedAt: number;
};

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function saveStep1to3(
  payload: Omit<WizardAutosavePayload, 'savedAt'>,
): void {
  if (!isBrowser()) return;
  try {
    const next: WizardAutosavePayload = {...payload, savedAt: Date.now()};
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage may be full or blocked — silently swallow.
  }
}

export function loadStep1to3(): WizardAutosavePayload | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WizardAutosavePayload;
    if (typeof parsed?.savedAt !== 'number') {
      clearStep1to3();
      return null;
    }
    if (Date.now() - parsed.savedAt > EXPIRY_MS) {
      clearStep1to3();
      return null;
    }
    return parsed;
  } catch {
    clearStep1to3();
    return null;
  }
}

export function clearStep1to3(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
