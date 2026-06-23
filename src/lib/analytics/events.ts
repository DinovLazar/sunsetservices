// Single source of truth for every dataLayer event Sunset Services fires.
// Cowork's GTM tags in Phase 2.10 Part B reference these event names exactly —
// don't rename without updating GTM.

export const ANALYTICS_EVENTS = {
  // Wizard (Phase 2.06)
  // Step 2 / Hand-off B — fires once when the wizard first mounts (a visitor
  // begins a quote). Counterpart to the quote_submit_succeeded conversion.
  WIZARD_STARTED: 'quote_start', // ← CONVERSION
  WIZARD_STEP_ADVANCED: 'wizard_step_advanced',
  WIZARD_SUBMIT_ATTEMPTED: 'wizard_submit_attempted',
  WIZARD_SUBMIT_SUCCEEDED: 'quote_submit_succeeded', // ← CONVERSION
  WIZARD_SUBMIT_FAILED: 'wizard_submit_failed',
  // Wizard Step 4 — Phase B.10 address autocomplete. Informational, NOT a
  // conversion. Payload {step: 4, source: 'autocomplete'} — zero PII.
  WIZARD_ADDRESS_AUTOCOMPLETED: 'wizard_address_autocompleted',
  // Wizard Step 3 — Phase B.11 photo upload. Informational, NOT a
  // conversion. Fires ONCE per batch (NOT per file) with payload
  // {step: 3, count} — zero PII.
  WIZARD_PHOTOS_UPLOADED: 'wizard_photos_uploaded',
  // Wizard — Phase M.01e-pt2 division migration.
  WIZARD_DIVISION_SELECTED: 'wizard_division_selected',
  WIZARD_PROPERTY_TYPE_SELECTED: 'wizard_property_type_selected',

  // Contact form (Phase 2.08)
  CONTACT_SUBMIT_ATTEMPTED: 'contact_submit_attempted',
  CONTACT_SUBMIT_SUCCEEDED: 'contact_submit_succeeded', // ← CONVERSION
  CONTACT_SUBMIT_FAILED: 'contact_submit_failed',

  // Newsletter (Phase 2.08)
  NEWSLETTER_SUBMIT_ATTEMPTED: 'newsletter_submit_attempted',
  NEWSLETTER_SUBSCRIBED: 'newsletter_subscribed', // ← CONVERSION
  NEWSLETTER_ALREADY_SUBSCRIBED: 'newsletter_already_subscribed',
  NEWSLETTER_SUBMIT_FAILED: 'newsletter_submit_failed',
  // Newsletter unsubscribe (Phase B.07) — informational, not conversion.
  // Payload carries `locale` only — no email, no token, no PII.
  NEWSLETTER_UNSUBSCRIBED: 'newsletter_unsubscribed',
  NEWSLETTER_RESUBSCRIBED_VIA_LINK: 'newsletter_resubscribed_via_link',

  // Chat (Phase 2.09) — none marked as conversion
  CHAT_OPENED: 'chat_opened',
  CHAT_MESSAGE_SENT: 'chat_message_sent',
  CHAT_HIGH_INTENT_FIRED: 'chat_high_intent_fired',
  CHAT_BANNER_BOOK_CLICKED: 'chat_banner_book_clicked',
  CHAT_BANNER_QUOTE_CLICKED: 'chat_banner_quote_clicked',
  CHAT_LEAD_SUBMIT_ATTEMPTED: 'lead_capture_submit_attempted',
  CHAT_LEAD_SUBMIT_SUCCEEDED: 'lead_capture_submit_succeeded',
  CHAT_LEAD_SUBMIT_FAILED: 'lead_capture_submit_failed',

  // Consent (Phase 2.10 binary → Phase B.03 Consent Mode v2)
  CONSENT_ACCEPTED: 'consent_accepted',
  CONSENT_DECLINED: 'consent_declined',
  CONSENT_UPDATE: 'consent_update', // Phase B.03 — fires after every modal Save / Accept all / Reject all
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

// Keys stripped from event payloads before reaching dataLayer.
// Defensive — dispatchers should never include these in the first place.
export const PII_KEYS = new Set([
  'name',
  'email',
  'phone',
  'firstName',
  'lastName',
  'fullName',
  'address',
  'streetAddress',
  'city',
  'state',
  'zipCode',
  'message',
]);
