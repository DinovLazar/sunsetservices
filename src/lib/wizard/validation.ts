/**
 * Wizard field validators — Phase 1.20.
 *
 * Returns `{ok: true}` or `{ok: false, errorKey}` per field. Error keys map
 * to the `wizard.error.*` namespace in `src/messages/{en,es}.json`. Caller
 * resolves them through `next-intl`. Validation pattern is on-blur + on-Next
 * per D10 (1.11 ContactForm precedent).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DIGITS_ONLY = /\D/g;

export type ValidationResult = {ok: true} | {ok: false; errorKey: string; errorParams?: Record<string, string | number>};

export function validateRequired(value: string | undefined | null): ValidationResult {
  if (typeof value === 'string' && value.trim().length > 0) return {ok: true};
  return {ok: false, errorKey: 'wizard.error.required'};
}

export function validateEmail(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return {ok: false, errorKey: 'wizard.error.required'};
  if (!EMAIL_RE.test(trimmed)) return {ok: false, errorKey: 'wizard.error.email'};
  return {ok: true};
}

/** US 10-digit number after stripping non-digits. */
export function validatePhoneUS(value: string): ValidationResult {
  const digits = (value ?? '').replace(DIGITS_ONLY, '');
  if (digits.length === 0) return {ok: false, errorKey: 'wizard.error.required'};
  if (digits.length !== 10) return {ok: false, errorKey: 'wizard.error.phone'};
  return {ok: true};
}

export function validateZip5(value: string): ValidationResult {
  const digits = (value ?? '').replace(DIGITS_ONLY, '');
  if (digits.length === 0) return {ok: false, errorKey: 'wizard.error.required'};
  if (digits.length !== 5) return {ok: false, errorKey: 'wizard.error.zip'};
  return {ok: true};
}

export function validateMaxChars(value: string, max: number): ValidationResult {
  if ((value ?? '').length > max) {
    return {ok: false, errorKey: 'wizard.error.charLimit', errorParams: {n: max}};
  }
  return {ok: true};
}

/** At least one option must be selected (or "Other" text provided). */
export function validateSelectAtLeastOne(
  selected: ReadonlyArray<string>,
  otherText?: string,
): ValidationResult {
  if (selected.length > 0) return {ok: true};
  if (otherText && otherText.trim().length >= 3) return {ok: true};
  return {ok: false, errorKey: 'wizard.error.selectAny'};
}

/** Single-select required (radio-group / select). */
export function validateSelectOne(value: string | undefined | null): ValidationResult {
  if (typeof value === 'string' && value.trim().length > 0) return {ok: true};
  return {ok: false, errorKey: 'wizard.error.selectOne'};
}

/** Lightweight US phone formatter: `(630) 946-9321`. Hand-rolled, ~30 lines. */
export function formatPhoneUS(input: string): string {
  const digits = (input ?? '').replace(DIGITS_ONLY, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function digitsOnly(input: string, max?: number): string {
  const all = (input ?? '').replace(DIGITS_ONLY, '');
  return max != null ? all.slice(0, max) : all;
}
