// Single source of truth for every dataLayer event Sunset Services fires.
// Cowork's GTM tags in Phase 2.10 Part B reference these event names exactly —
// don't rename without updating GTM.

export const ANALYTICS_EVENTS = {
  // Wizard (Phase 2.06)
  WIZARD_STEP_ADVANCED: 'wizard_step_advanced',
  WIZARD_SUBMIT_ATTEMPTED: 'wizard_submit_attempted',
  WIZARD_SUBMIT_SUCCEEDED: 'quote_submit_succeeded', // ← CONVERSION
  WIZARD_SUBMIT_FAILED: 'wizard_submit_failed',

  // Contact form (Phase 2.08)
  CONTACT_SUBMIT_ATTEMPTED: 'contact_submit_attempted',
  CONTACT_SUBMIT_SUCCEEDED: 'contact_submit_succeeded', // ← CONVERSION
  CONTACT_SUBMIT_FAILED: 'contact_submit_failed',

  // Newsletter (Phase 2.08)
  NEWSLETTER_SUBMIT_ATTEMPTED: 'newsletter_submit_attempted',
  NEWSLETTER_SUBSCRIBED: 'newsletter_subscribed', // ← CONVERSION
  NEWSLETTER_ALREADY_SUBSCRIBED: 'newsletter_already_subscribed',
  NEWSLETTER_SUBMIT_FAILED: 'newsletter_submit_failed',

  // Chat (Phase 2.09) — none marked as conversion
  CHAT_OPENED: 'chat_opened',
  CHAT_MESSAGE_SENT: 'chat_message_sent',
  CHAT_HIGH_INTENT_FIRED: 'chat_high_intent_fired',
  CHAT_BANNER_BOOK_CLICKED: 'chat_banner_book_clicked',
  CHAT_BANNER_QUOTE_CLICKED: 'chat_banner_quote_clicked',
  CHAT_LEAD_SUBMIT_ATTEMPTED: 'lead_capture_submit_attempted',
  CHAT_LEAD_SUBMIT_SUCCEEDED: 'lead_capture_submit_succeeded',
  CHAT_LEAD_SUBMIT_FAILED: 'lead_capture_submit_failed',

  // Calendly (Phase 2.10 new)
  CALENDLY_WIDGET_LOADED: 'calendly_widget_loaded',
  CALENDLY_EVENT_TYPE_VIEWED: 'calendly_event_type_viewed',
  CALENDLY_DATE_AND_TIME_SELECTED: 'calendly_date_and_time_selected',
  CALENDLY_BOOKING_SCHEDULED: 'calendly_booking_scheduled', // ← CONVERSION

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
