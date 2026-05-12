import * as React from 'react';
import {sendBrandedEmail, type SendBrandedEmailResult} from '@/lib/email/send';
import {QuoteLeadAlertEmail} from '@/lib/email/templates/QuoteLeadAlertEmail';
import {QuoteConfirmationEmail} from '@/lib/email/templates/QuoteConfirmationEmail';
import type {QuoteSubmitInput} from './validation';

/**
 * Quote-route email senders (Phase 2.08).
 *
 * Thin wrappers around `sendBrandedEmail()` that build the right React Email
 * template for each send. NEVER imported from a client component — both rely
 * on `RESEND_API_KEY` which is server-only.
 *
 * The Phase 2.06 plaintext `sendLeadAlertEmail()` was replaced here; routes
 * now call `sendQuoteLeadAlertEmail()` (branded HTML) and
 * `sendQuoteVisitorConfirmationEmail()` (new — visitor receipt).
 */

const TO = process.env.RESEND_TO_EMAIL ?? 'info@sunsetservices.us';

/** Branded lead-alert email to Erick. */
export async function sendQuoteLeadAlertEmail(
  input: QuoteSubmitInput,
  primaryServiceDisplayName: string,
  sanityDocId: string,
): Promise<SendBrandedEmailResult> {
  return sendBrandedEmail({
    to: TO,
    intendedRecipient: TO,
    subject: `New quote — ${input.firstName} ${input.lastName} (${input.audience})`,
    react: React.createElement(QuoteLeadAlertEmail, {
      lead: input,
      primaryServiceDisplayName,
      sanityDocId,
      locale: input.locale,
    }),
  });
}

/** Branded visitor receipt. Routes to the dev inbox in sandbox mode. */
export async function sendQuoteVisitorConfirmationEmail(
  input: QuoteSubmitInput,
  primaryServiceDisplayName: string,
): Promise<SendBrandedEmailResult> {
  const subject =
    input.locale === 'es'
      ? '¡Gracias por tu solicitud!'
      : 'We received your quote request';
  return sendBrandedEmail({
    to: input.email,
    intendedRecipient: input.email,
    subject,
    react: React.createElement(QuoteConfirmationEmail, {
      firstName: input.firstName,
      primaryServiceDisplayName,
      locale: input.locale,
    }),
  });
}
