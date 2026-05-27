/**
 * Wizard autosave — Phase 1.20 D9 (B = localStorage Part 1, C deferred).
 *
 * **Strict PII boundary:** Steps 1–3 only (division, services, project
 * details). Step 4 contact data (including propertyType) and Step 5 review
 * data NEVER pass through this module. Stored payload is plaintext and any
 * local browser-extension can read it; this is the trade-off Erick accepted
 * for abandoner recovery.
 *
 * Phase M.01e-pt2 — schema versioning. The Phase 1.20 key
 * `sunset_wizard_progress_v1` carried `step1.audience`; pt2 renamed the
 * field to `step1.division`. To avoid an old reader consuming the new shape
 * (or vice versa) we bump the key to `sunset_wizard_progress_v2`. The
 * `loadStep1to3` function migrates any pre-existing v1 state on first read:
 *   - `audience: 'hardscape'` → `division: 'hardscape'`
 *   - `audience: 'residential' | 'commercial'` → drop (division can't be
 *     inferred from those — the visitor re-picks on Step 1). The legacy
 *     audience value is NOT promoted into Step 4 `propertyType` here
 *     because propertyType lives in Step 4 state which doesn't touch
 *     storage. The shell consumes that mapping at hydration time if needed.
 *
 * 30-day expiry. On stale load → null + clear.
 */

const STORAGE_KEY = 'sunset_wizard_progress_v2';
const LEGACY_KEY = 'sunset_wizard_progress_v1';
const EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export type WizardAutosavePayload = {
  step1: {division: string};
  step2: {selectedSlugs: string[]; primarySlug: string; otherText: string};
  step3: Record<string, string | string[]>;
  savedAt: number;
};

type LegacyAutosavePayload = {
  step1: {audience: string};
  step2: {selectedSlugs: string[]; primarySlug: string; otherText: string};
  step3: Record<string, string | string[]>;
  savedAt: number;
};

const VALID_DIVISIONS = new Set(['landscape', 'hardscape', 'waterproofing', 'snow-removal']);

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
    // 1) v2 — current format
    const v2raw = window.localStorage.getItem(STORAGE_KEY);
    if (v2raw) {
      const parsed = JSON.parse(v2raw) as WizardAutosavePayload;
      if (typeof parsed?.savedAt !== 'number') {
        clearStep1to3();
        return null;
      }
      if (Date.now() - parsed.savedAt > EXPIRY_MS) {
        clearStep1to3();
        return null;
      }
      return parsed;
    }

    // 2) v1 — migrate once, then write v2 + clear v1
    const v1raw = window.localStorage.getItem(LEGACY_KEY);
    if (!v1raw) return null;
    const legacy = JSON.parse(v1raw) as LegacyAutosavePayload;
    if (typeof legacy?.savedAt !== 'number') {
      window.localStorage.removeItem(LEGACY_KEY);
      return null;
    }
    if (Date.now() - legacy.savedAt > EXPIRY_MS) {
      window.localStorage.removeItem(LEGACY_KEY);
      return null;
    }
    const legacyAudience = legacy.step1?.audience ?? '';
    const inferredDivision =
      legacyAudience === 'hardscape' ? 'hardscape' : '';
    const migrated: WizardAutosavePayload = {
      step1: {division: VALID_DIVISIONS.has(inferredDivision) ? inferredDivision : ''},
      step2: {
        selectedSlugs: [],
        primarySlug: '',
        otherText: typeof legacy.step2?.otherText === 'string' ? legacy.step2.otherText : '',
      },
      step3: legacy.step3 ?? {},
      savedAt: legacy.savedAt,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      window.localStorage.removeItem(LEGACY_KEY);
    } catch {
      // ignore quota / blocked errors — the migration result still surfaces
      // to the caller this turn; on the next visit it falls through to the
      // same migration branch again, which is acceptable.
    }
    return migrated;
  } catch {
    clearStep1to3();
    return null;
  }
}

export function clearStep1to3(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_KEY);
  } catch {
    // ignore
  }
}
