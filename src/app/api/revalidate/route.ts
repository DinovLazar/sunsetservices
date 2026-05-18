/**
 * Phase B.08 — Sanity → Next.js cache invalidation webhook receiver.
 *
 * Sanity Studio is configured (via the manage.sanity.io webhook UI — see
 * Phase-B-08-Completion.md §"User-runnable next step") to POST every
 * publish/update/delete to this route. Each request body is HMAC-SHA256-
 * signed with the shared `SANITY_REVALIDATE_SECRET`; we verify the
 * signature via `parseBody` from `next-sanity/webhook` (a thin wrapper
 * around `@sanity/webhook`'s `isValidSignature`).
 *
 * Body shape (configured by the Sanity webhook projection):
 *   { "_type": <docType>, "_id": <docId>, "slug": <slug.current> }
 *
 * We route through `revalidateForDocument` (the single source of truth
 * for doc-type → cache-tag + page-path mapping) and return what we
 * actually invalidated so the Sanity Studio webhook log surfaces a
 * useful confirmation.
 *
 * Status codes:
 *   200 — happy path (revalidated, OR unhandled doc type; we ack so
 *         Sanity stops retrying unmapped types)
 *   400 — body missing `_type` (malformed projection — fix the
 *         webhook config, retry won't help)
 *   401 — signature missing / invalid (someone is forging webhooks; do
 *         not invalidate anything)
 *   500 — server misconfigured (no secret set) or unexpected throw
 *         (Sanity will retry; signature gate stops the retry from doing
 *         damage if we somehow forgot to set the secret in prod)
 */

import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';
import {parseBody} from 'next-sanity/webhook';
import {revalidateForDocument, type SanityRevalidationPayload} from '@/lib/sanity/revalidation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SanityWebhookBody = {
  _type?: string;
  _id?: string;
  slug?: string;
};

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    console.error('[api/revalidate] missing SANITY_REVALIDATE_SECRET env var');
    return NextResponse.json(
      {status: 'error', reason: 'server-misconfigured'},
      {status: 500},
    );
  }

  let isValidSignature: boolean | null;
  let body: SanityWebhookBody | null;
  try {
    ({isValidSignature, body} = await parseBody<SanityWebhookBody>(request, secret));
  } catch (err) {
    console.error('[api/revalidate] parseBody threw', err);
    return NextResponse.json(
      {status: 'error', reason: 'revalidate-failed'},
      {status: 500},
    );
  }

  // parseBody returns isValidSignature === null when the signature header
  // is absent (and body === null). When the signature is present but does
  // not match the secret, isValidSignature === false.
  if (isValidSignature === null) {
    return NextResponse.json(
      {status: 'error', reason: 'missing-signature'},
      {status: 401},
    );
  }
  if (isValidSignature === false) {
    return NextResponse.json(
      {status: 'error', reason: 'invalid-signature'},
      {status: 401},
    );
  }

  if (!body || typeof body._type !== 'string' || body._type.length === 0) {
    return NextResponse.json(
      {status: 'error', reason: 'missing-doc-type'},
      {status: 400},
    );
  }

  try {
    const payload: SanityRevalidationPayload = {
      _type: body._type,
      _id: body._id,
      slug: body.slug,
    };
    const result = await revalidateForDocument(payload);
    return NextResponse.json({status: 'ok', ...result});
  } catch (err) {
    console.error('[api/revalidate] revalidateForDocument threw', err);
    return NextResponse.json(
      {status: 'error', reason: 'revalidate-failed'},
      {status: 500},
    );
  }
}
