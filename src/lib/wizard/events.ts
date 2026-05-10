/**
 * Wizard analytics-event constants — Phase 1.19 §11.4 / Phase 1.20.
 *
 * Used by `data-analytics-event="..."` attributes on interactive elements.
 * Phase 2.11 GTM bridge reads these from the DOM and forwards to dataLayer.
 * Step-viewed + panel-opened events fire as CustomEvents on `document`.
 */

export const WIZARD_EVENTS = {
  STEP_VIEWED: (n: 1 | 2 | 3 | 4 | 5) => `wizard_step_viewed_${n}`,
  STEP_COMPLETED: (n: 1 | 2 | 3 | 4 | 5) => `wizard_step_completed_${n}`,
  SUBMIT_ATTEMPTED: 'wizard_submit_attempted',
  SUBMIT_SUCCEEDED: 'wizard_submit_succeeded',
  SUBMIT_FAILED: 'wizard_submit_failed',
  FIELD_ERROR: (field: string) => `wizard_field_error_${field}`,
  RESUME_OFFERED: 'wizard_resume_offered',
  RESUME_ACCEPTED: 'wizard_resume_accepted',
  RESUME_DISMISSED: 'wizard_resume_dismissed',
  ABANDONED: 'wizard_abandoned',
  BACK_CLICKED: 'wizard_back_clicked',
  SAVE_LINK_CLICKED: 'wizard_save_link_clicked',
  EDIT_STEP: (n: 1 | 2 | 3 | 4 | 5) => `wizard_edit_step_${n}`,
  CALL_LINK_CLICKED: 'wizard_call_link_clicked',
} as const;

/**
 * Fires a CustomEvent the Phase-2.11 GTM bridge can listen for. Used for
 * step-viewed / submit-success events that don't have a click target carrying
 * a `data-analytics-event` attribute.
 */
export function fireWizardEvent(name: string, detail: Record<string, unknown> = {}): void {
  if (typeof document === 'undefined') return;
  document.dispatchEvent(new CustomEvent('sunset:wizard-event', {detail: {name, ...detail}}));
}
