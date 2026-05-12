import * as React from 'react';
import {Resend} from 'resend';

/**
 * Shared branded-email utility (Phase 2.08).
 *
 * Single entry point for every Resend send across the app. Implements the
 * sandbox-aware routing pattern documented in Sunset-Services-Decisions.md
 * "2026-05-12 — Phase 2.08: Resend domain verification deferred…":
 *
 * - When `RESEND_DOMAIN_VERIFIED=true`: send normally. No banner, no subject
 *   prefix, no reroute.
 * - When `RESEND_DOMAIN_VERIFIED=false` (the Phase 2.08 default): reroute
 *   every send to `RESEND_TO_EMAIL`, inject `intendedRecipient` into the
 *   React tree so `EmailLayout` renders its sandbox banner, and prefix the
 *   subject with `[SANDBOX → <intended>]` for triage in the dev inbox.
 *
 * Resilience: callers always get `{ ok, messageId?, error? }`; this function
 * never throws. Sanity-write durability (Phase 2.06 pattern) is preserved —
 * a failed email never breaks the API route.
 */

export type SendBrandedEmailArgs = {
  to: string;
  subject: string;
  react: React.ReactElement<{intendedRecipient?: string}>;
  /**
   * The address the email would go to in non-sandbox mode. Pass it equal to
   * `to` from the caller; this function handles the rerouting internally.
   * When omitted, falls back to `to`.
   */
  intendedRecipient?: string;
};

export type SendBrandedEmailResult = {
  ok: boolean;
  messageId?: string;
  error?: string;
};

export async function sendBrandedEmail(
  args: SendBrandedEmailArgs,
): Promise<SendBrandedEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {ok: false, error: 'RESEND_API_KEY not configured'};
  }

  const from = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
  const verified = process.env.RESEND_DOMAIN_VERIFIED === 'true';
  const sandboxTo = process.env.RESEND_TO_EMAIL ?? 'info@sunsetservices.us';

  const intended = args.intendedRecipient ?? args.to;
  const actualTo = verified ? args.to : sandboxTo;
  const subject = verified ? args.subject : `[SANDBOX → ${intended}] ${args.subject}`;
  // Only inject the sandbox banner when rerouting; in non-sandbox mode we
  // never want to surprise visitors with a "this email was originally
  // addressed to you" banner.
  const reactElement = verified
    ? args.react
    : React.cloneElement(args.react, {intendedRecipient: intended});

  const resend = new Resend(apiKey);

  try {
    const result = await resend.emails.send({
      from: `Sunset Services <${from}>`,
      to: [actualTo],
      subject,
      react: reactElement,
    });
    if (result.error) {
      console.error('[sendBrandedEmail] Resend returned error', {
        intended,
        subject,
        message: result.error.message,
      });
      return {ok: false, error: result.error.message};
    }
    return {ok: true, messageId: result.data?.id};
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[sendBrandedEmail] exception', {intended, subject, message});
    return {ok: false, error: message};
  }
}
