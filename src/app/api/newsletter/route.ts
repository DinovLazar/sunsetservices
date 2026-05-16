import crypto from 'node:crypto';
import * as React from 'react';
import {z} from 'zod';
import {NextResponse} from 'next/server';
import {writeClient} from '@sanity-lib/write-client';
import {sendBrandedEmail} from '@/lib/email/send';
import {NewsletterWelcomeEmail} from '@/lib/email/templates/NewsletterWelcomeEmail';
import {canonicalUrl} from '@/lib/seo/urls';

/**
 * POST /api/newsletter — footer newsletter signup (Phase 2.08).
 *
 *  1. Honor master flag NEWSLETTER_SUBMIT_ENABLED — when off, return 200 +
 *     `status: 'simulated'` and no side effects.
 *  2. Honeypot check BEFORE Zod.
 *  3. Zod parse. Bad payload → 400.
 *  4. Check for existing subscriber by email:
 *     - exists + unsubscribed:false → return `already_subscribed`, no email,
 *       no duplicate doc, no state change.
 *     - exists + unsubscribed:true → flip back to unsubscribed:false, update
 *       subscribedAt, re-send welcome.
 *     - not exists → create new doc, send welcome.
 *  5. Branded welcome email (best-effort).
 *  6. Mautic push stub (no-op while disabled).
 *
 * Sanity Studio's async unique-email validator runs at publish time only —
 * the route handler's pre-check is the authoritative guard.
 */

const ENABLED = process.env.NEWSLETTER_SUBMIT_ENABLED === 'true';
const MAUTIC_ENABLED = process.env.MAUTIC_ENABLED === 'true';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Schema = z
  .object({
    email: z.string().email().max(200),
    locale: z.enum(['en', 'es']).default('en'),
    sourcePage: z.string().max(500).optional(),
    honeypot: z.string().max(500),
  })
  .strict();

export async function POST(request: Request) {
  if (!ENABLED) {
    return NextResponse.json(
      {status: 'simulated', message: 'NEWSLETTER_SUBMIT_ENABLED=false — no real submit.'},
      {status: 200},
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({status: 'error', code: 'invalid_json'}, {status: 400});
  }

  // Honeypot first.
  const honeypotRaw =
    payload && typeof payload === 'object' && 'honeypot' in payload
      ? (payload as Record<string, unknown>).honeypot
      : '';
  if (typeof honeypotRaw === 'string' && honeypotRaw.length > 0) {
    return NextResponse.json({status: 'ok'}, {status: 200});
  }

  const parsed = Schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({status: 'error', code: 'invalid_payload'}, {status: 400});
  }

  const {email, locale, sourcePage} = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();
  const now = new Date().toISOString();
  // Phase B.07 — fresh UUID per create + resubscribe. Regenerating on
  // resubscribe naturally invalidates the prior unsubscribe link (the old
  // welcome email's token is no longer in the doc). `already_subscribed`
  // doesn't reach the create/resubscribe branches, so the token is unused
  // there — cheap to generate and not worth branching for.
  const unsubscribeToken = crypto.randomUUID();

  // Look for an existing subscriber by exact email match.
  let existing: {_id: string; unsubscribed?: boolean} | null = null;
  try {
    existing = await writeClient.fetch<{_id: string; unsubscribed?: boolean} | null>(
      `*[_type == "newsletterSubscriber" && email == $email][0]{_id, unsubscribed}`,
      {email: normalizedEmail},
    );
  } catch (err) {
    console.error('[/api/newsletter] existing-lookup failed', err);
  }

  let sanityDocId: string | null = null;
  let shouldSendWelcome = false;
  let alreadySubscribed = false;

  if (existing && existing.unsubscribed === false) {
    alreadySubscribed = true;
    sanityDocId = existing._id;
  } else if (existing && existing.unsubscribed === true) {
    // Resubscribe — flip back, update timestamp, rotate the unsubscribe
    // token (Phase B.07 — invalidates the prior welcome email's link),
    // re-send welcome.
    try {
      const doc = await writeClient
        .patch(existing._id)
        .set({
          unsubscribed: false,
          unsubscribedAt: undefined,
          subscribedAt: now,
          sourcePage: sourcePage || undefined,
          locale,
          unsubscribeToken,
        })
        .commit();
      sanityDocId = doc._id;
      shouldSendWelcome = true;
    } catch (err) {
      console.error('[/api/newsletter] resubscribe patch failed', err);
    }
  } else {
    // Fresh subscriber.
    try {
      const doc = await writeClient.create({
        _type: 'newsletterSubscriber',
        email: normalizedEmail,
        subscribedAt: now,
        sourcePage: sourcePage || undefined,
        locale,
        unsubscribed: false,
        mauticSynced: false,
        unsubscribeToken,
      });
      sanityDocId = doc._id;
      shouldSendWelcome = true;
    } catch (err) {
      console.error('[/api/newsletter] create failed', err);
    }
  }

  if (shouldSendWelcome) {
    const subject =
      locale === 'es'
        ? 'Bienvenido al boletín de Sunset Services'
        : 'Welcome to Sunset Services';
    const unsubscribeUrl = canonicalUrl(`/unsubscribe/${unsubscribeToken}`, locale);
    const sendResult = await sendBrandedEmail({
      to: normalizedEmail,
      intendedRecipient: normalizedEmail,
      subject,
      react: React.createElement(NewsletterWelcomeEmail, {
        email: normalizedEmail,
        locale,
        unsubscribeUrl,
      }),
    });
    if (!sendResult.ok) {
      console.error('[/api/newsletter] welcome send failed', sendResult.error);
    }
  }

  // Mautic stub (no-op while disabled).
  if (MAUTIC_ENABLED) {
    // TODO Phase 2.x — Mautic newsletter sync.
    console.log('[Mautic stub] newsletter — would push', {email: normalizedEmail, locale});
  } else {
    console.log('[Mautic stub] newsletter — Mautic disabled, no-op', {
      email: normalizedEmail,
    });
  }

  return NextResponse.json(
    {
      status: alreadySubscribed ? 'already_subscribed' : 'ok',
      sanityDocId: sanityDocId ?? undefined,
    },
    {status: 200},
  );
}
