import * as React from 'react';
import {sendBrandedEmail, type SendBrandedEmailResult} from '@/lib/email/send';
import {QuoteLeadAlertEmail} from '@/lib/email/templates/QuoteLeadAlertEmail';
import {QuoteConfirmationEmail} from '@/lib/email/templates/QuoteConfirmationEmail';
import {writeClient} from '@sanity-lib/write-client';
import {safeLogMeta} from '@/lib/logging/safeError';
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
 *
 * Phase B.11 — `sendQuoteLeadAlertEmail` now resolves `lead.photoAssetIds`
 * into a `photos` array of `{url, alt}` for the thumbnail grid (D24). The
 * visitor confirmation receives `photoCount` for the one-line acknowledgment.
 */

const TO = process.env.RESEND_TO_EMAIL ?? 'info@sunsetservices.us';

/**
 * Phase B.11 — fetch the Sanity CDN URLs for an array of asset IDs. Used
 * by the lead-alert email at send time. Returns `[]` on Sanity error so a
 * failed lookup doesn't block the email; lead-alert just lands without
 * the thumbnail grid in that case.
 */
async function fetchPhotoUrlsByAssetIds(
  assetIds: string[],
): Promise<Array<{assetId: string; url: string}>> {
  if (assetIds.length === 0) return [];
  try {
    const rows = await writeClient.fetch<Array<{_id: string; url: string}>>(
      `*[_id in $ids]{_id, url}`,
      {ids: assetIds},
    );
    // Preserve the original order of `assetIds` so thumbnails match the
    // visitor's upload sequence.
    const byId = new Map(rows.map((r) => [r._id, r.url] as const));
    return assetIds.flatMap((id) => {
      const url = byId.get(id);
      return url ? [{assetId: id, url}] : [];
    });
  } catch (err) {
    console.error(
      '[resend] sanity photo-url fetch failed',
      safeLogMeta('quote-photo-url-fetch', err),
    );
    return [];
  }
}

/**
 * Branded lead-alert email to Erick. Pass `sanityDocId = null` when the durable
 * Sanity write failed: the subject line is prefixed with a loud "LEAD NOT SAVED"
 * marker (visible in the inbox list without opening) and the template renders
 * its failure banner + drops the Studio link.
 */
export async function sendQuoteLeadAlertEmail(
  input: QuoteSubmitInput,
  primaryServiceDisplayName: string,
  sanityDocId: string | null,
): Promise<SendBrandedEmailResult> {
  const photoAssetIds = input.photoAssetIds ?? [];
  const photoRows = await fetchPhotoUrlsByAssetIds(photoAssetIds);
  const photos = photoRows.map((p, i) => ({
    url: p.url,
    alt: `Project photo ${i + 1}`,
  }));
  const baseSubject = `New quote — ${input.firstName} ${input.lastName} (${input.division})`;
  const subject = sanityDocId ? baseSubject : `⚠️ LEAD NOT SAVED — ${baseSubject}`;
  return sendBrandedEmail({
    to: TO,
    intendedRecipient: TO,
    subject,
    react: React.createElement(QuoteLeadAlertEmail, {
      lead: input,
      primaryServiceDisplayName,
      sanityDocId,
      locale: input.locale,
      photos: photos.length > 0 ? photos : undefined,
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
      photoCount: input.photoAssetIds?.length ?? 0,
    }),
  });
}
