/**
 * Chat analytics-event constants — Phase 1.19 §11.4 / Phase 1.20.
 *
 * Used by `data-analytics-event="..."` attributes on interactive elements.
 * Phase 2.11 GTM bridge reads these from the DOM and forwards to dataLayer.
 * Panel-opened / message-streamed events fire as CustomEvents on `document`.
 */

export const CHAT_EVENTS = {
  BUBBLE_CLICKED: 'chat_bubble_clicked',
  /**
   * Phase 2.10: renamed wire value from `chat_panel_opened` to `chat_opened`
   * so it matches the analytics spec at `src/lib/analytics/events.ts` and
   * the GTM tag plan. Constant name kept descriptive (`OPENED`).
   */
  OPENED: 'chat_opened',
  PANEL_CLOSED: 'chat_panel_closed',
  PROMPT_CLICKED: (n: 1 | 2 | 3) => `chat_prompt_clicked_${n}`,
  MESSAGE_SENT: 'chat_message_sent',
  LEAD_CTA_CLICKED: 'chat_lead_cta_clicked',
  LEAD_FORM_SUBMITTED: 'chat_lead_form_submitted',
  HIGH_INTENT_FIRED: 'chat_high_intent_fired',
  /**
   * Phase 2.10 — chat-banner CTA dispatches. Phase 2.09 set the
   * `data-analytics-event` attributes on the high-intent banner Links;
   * Phase 2.10 added the matching CustomEvent dispatch so the
   * AnalyticsBridge sees them too.
   */
  BANNER_BOOK_CLICKED: 'chat_banner_book_clicked',
  BANNER_QUOTE_CLICKED: 'chat_banner_quote_clicked',
  RESET_CLICKED: 'chat_reset_clicked',
} as const;

/** CustomEvent dispatcher for events without a clickable carrier. */
export function fireChatEvent(name: string, detail: Record<string, unknown> = {}): void {
  if (typeof document === 'undefined') return;
  document.dispatchEvent(new CustomEvent('sunset:chat-event', {detail: {name, ...detail}}));
}
