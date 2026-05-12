import {Resend} from 'resend';
import type {QuoteSubmitInput} from './validation';

/**
 * Resend lead-alert email module (Phase 2.06).
 *
 * Sends a plain-text email to Erick at RESEND_TO_EMAIL whenever a wizard
 * submit lands in Sanity. Reply-To is set to the lead's email so a one-click
 * reply goes straight to the visitor.
 *
 * `from:` uses Resend's sandbox sender `onboarding@resend.dev` at Phase 2.06.
 * Phase 2.08 verifies `sunsetservices.us` and swaps to a branded HTML template.
 *
 * NEVER imported from a client component — `RESEND_API_KEY` is server-only.
 */

const FROM = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
const TO = process.env.RESEND_TO_EMAIL ?? 'info@sunsetservices.us';

export type LeadAlertResult = {ok: boolean; errorMessage?: string};

/** Send the lead-alert email to Erick. Plain-text body at Phase 2.06. */
export async function sendLeadAlertEmail(
  input: QuoteSubmitInput,
  sanityDocId: string,
): Promise<LeadAlertResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {ok: false, errorMessage: 'RESEND_API_KEY not configured'};
  }

  const resend = new Resend(apiKey);
  const subject = `New Quote Request — ${input.firstName} ${input.lastName} (${input.audience})`;
  const body = renderPlainTextBody(input, sanityDocId);

  try {
    const result = await resend.emails.send({
      from: `Sunset Services Quote Wizard <${FROM}>`,
      to: [TO],
      replyTo: input.email,
      subject,
      text: body,
    });
    if (result.error) {
      return {ok: false, errorMessage: result.error.message};
    }
    return {ok: true};
  } catch (err) {
    return {
      ok: false,
      errorMessage: err instanceof Error ? err.message : String(err),
    };
  }
}

function renderPlainTextBody(
  input: QuoteSubmitInput,
  sanityDocId: string,
): string {
  const lines: string[] = [
    'New quote request received.',
    '',
    `Submitted: ${new Date().toISOString()}`,
    '',
    'CONTACT',
    `- Name:    ${input.firstName} ${input.lastName}`,
    `- Email:   ${input.email}`,
    `- Phone:   ${input.phone}`,
    `- Address: ${formatAddress(input)}`,
  ];

  const prefs = input.contactPreferences;
  if (prefs && (prefs.bestTime || prefs.contactMethod)) {
    const parts: string[] = [];
    if (prefs.contactMethod) parts.push(`prefers ${prefs.contactMethod}`);
    if (prefs.bestTime) parts.push(`${prefs.bestTime}`);
    lines.push(`- Prefs:   ${parts.join(', ')}`);
  }

  lines.push('');
  lines.push('PROJECT');
  lines.push(`- Audience: ${input.audience}`);
  lines.push(`- Services: ${input.services.join(', ') || '—'}`);
  if (input.primaryService) lines.push(`- Primary:  ${input.primaryService}`);
  if (input.otherText) lines.push(`- Other:    ${input.otherText}`);

  if (input.details) {
    const d = input.details;
    const detailLines: string[] = [];
    if (d.propertySize) detailLines.push(`- Property size: ${d.propertySize} sq ft`);
    if (d.bedrooms) detailLines.push(`- Bedrooms:      ${d.bedrooms}`);
    if (d.numProperties) detailLines.push(`- Properties:    ${d.numProperties}`);
    if (d.numBuildings) detailLines.push(`- Buildings:     ${d.numBuildings}`);
    if (d.projectType) detailLines.push(`- Project type:  ${d.projectType}`);
    if (d.contract) detailLines.push(`- Contract:      ${d.contract}`);
    if (d.frequency) detailLines.push(`- Frequency:     ${d.frequency}`);
    if (d.spaceType && d.spaceType.length) {
      detailLines.push(`- Space type:    ${d.spaceType.join(', ')}`);
    }
    if (d.dimensions) detailLines.push(`- Dimensions:    ${d.dimensions}`);
    if (d.surface) detailLines.push(`- Surface:       ${d.surface}`);
    if (d.features && d.features.length) {
      detailLines.push(`- Features:      ${d.features.join(', ')}`);
    }
    if (d.timeline) detailLines.push(`- Timeline:      ${d.timeline}`);
    if (d.budget) detailLines.push(`- Budget:        ${d.budget}`);
    if (d.notes) detailLines.push(`- Notes:         ${d.notes}`);

    if (detailLines.length > 0) {
      lines.push('');
      lines.push('DETAILS');
      lines.push(...detailLines);
    }
  }

  lines.push('');
  lines.push(
    `View in Sanity Studio: https://sunsetservices.sanity.studio/desk/quoteLead;${sanityDocId}`,
  );
  lines.push('');
  lines.push('—');
  lines.push(
    'Sent from sunsetservices.us — Phase 2.06 dev template. Branding lands in Phase 2.08.',
  );
  return lines.join('\n');
}

function formatAddress(input: QuoteSubmitInput): string {
  const a = input.address;
  const line1 = [a.street, a.unit].filter(Boolean).join(' ');
  return `${line1}, ${a.city}, ${a.state} ${a.zip}`;
}
