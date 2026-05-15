/**
 * Consent signals — Phase B.03.
 *
 * Four-category Google Consent Mode v2 schema. Each visitor's choice maps
 * one-to-one to the Consent Mode signal names GTM + GA4 + Ads check before
 * firing tags:
 *
 *   necessary        → not a Consent Mode signal — always granted (legal
 *                      basis: legitimate interest / strictly necessary cookies)
 *   analytics        → analytics_storage
 *   marketing        → ad_storage
 *   personalization  → ad_user_data  AND  ad_personalization  (DM-1 ratification,
 *                      Phase B.02 — surface a single user-facing toggle for the
 *                      two backend signals because they always move together
 *                      for an end user's mental model)
 */
export type ConsentSignals = {
  necessary: true; // always
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
};

/**
 * Visitor consent state. `pending` is the initial state for visitors who
 * have not yet made a choice — the cookie banner shows in that state.
 *
 * `decided` carries the four signals + ISO timestamp of when the choice
 * was made (for audit / re-consent windows).
 */
export type ConsentState =
  | {status: 'pending'}
  | {status: 'decided'; signals: ConsentSignals; decidedAt: string};

/**
 * Default signals applied when "Manage preferences" is opened with no
 * prior choice — Phase B.02 DM-2 ratification: Necessary ON locked,
 * Analytics ON, Marketing OFF, Personalization OFF.
 *
 * Used by:
 *   - `<ConsentPreferencesModal>` initial toggle state.
 *   - The "Reject all" path inverts everything except `necessary`.
 *   - The "Accept all" path sets every non-necessary signal to true.
 */
export const DEFAULT_PREFERENCES: ConsentSignals = {
  necessary: true,
  analytics: true,
  marketing: false,
  personalization: false,
};

export const REJECT_ALL: ConsentSignals = {
  necessary: true,
  analytics: false,
  marketing: false,
  personalization: false,
};

export const ACCEPT_ALL: ConsentSignals = {
  necessary: true,
  analytics: true,
  marketing: true,
  personalization: true,
};
