import {z} from 'zod';
import {NextResponse} from 'next/server';
import {writeClient} from '@sanity-lib/write-client';
import {getSubscriberByToken} from '@sanity-lib/queries';

/**
 * POST /api/newsletter/unsubscribe — token-gated unsubscribe + resubscribe.
 *
 * Phase B.07 — companion to the `/[locale]/unsubscribe/[token]` page. Body:
 *   { token: string (20..100), action: 'unsubscribe' | 'resubscribe' }
 *
 * Responses (always opaque; never echo the Zod tree or Sanity error):
 *   200 { status: 'ok' }                    — patch landed
 *   200 { status: 'already-unsubscribed' }  — action:unsubscribe + already off the list
 *   200 { status: 'already-subscribed' }    — action:resubscribe + already on the list
 *   400 { status: 'invalid-payload' }       — Zod failed
 *   404 { status: 'invalid-token' }         — no subscriber matches
 *   500 { status: 'persist-failed' }        — Sanity threw on the patch
 *
 * Not gated by `NEWSLETTER_SUBMIT_ENABLED` — once subscribed, the right to
 * leave can't be flag-gated (Phase B.07 D6).
 *
 * Locale-agnostic — the `[locale]/unsubscribe/[token]` page enforces locale
 * via the route segment; the API only needs the (token, action) pair.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z
  .object({
    token: z.string().min(20).max(100),
    action: z.enum(['unsubscribe', 'resubscribe']),
  })
  .strict();

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({status: 'invalid-payload'}, {status: 400});
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({status: 'invalid-payload'}, {status: 400});
  }

  const {token, action} = parsed.data;

  const subscriber = await getSubscriberByToken(token);
  if (!subscriber) {
    return NextResponse.json({status: 'invalid-token'}, {status: 404});
  }

  // Idempotent short-circuits — no patch when the desired state already holds.
  if (action === 'unsubscribe' && subscriber.unsubscribed === true) {
    return NextResponse.json({status: 'already-unsubscribed'}, {status: 200});
  }
  if (action === 'resubscribe' && subscriber.unsubscribed === false) {
    return NextResponse.json({status: 'already-subscribed'}, {status: 200});
  }

  try {
    if (action === 'unsubscribe') {
      await writeClient
        .patch(subscriber._id)
        .set({unsubscribed: true, unsubscribedAt: new Date().toISOString()})
        .commit();
    } else {
      await writeClient
        .patch(subscriber._id)
        .set({unsubscribed: false, subscribedAt: new Date().toISOString()})
        .unset(['unsubscribedAt'])
        .commit();
    }
  } catch (err) {
    console.error('[/api/newsletter/unsubscribe] patch failed', {
      action,
      docId: subscriber._id,
      err,
    });
    return NextResponse.json({status: 'persist-failed'}, {status: 500});
  }

  return NextResponse.json({status: 'ok'}, {status: 200});
}
