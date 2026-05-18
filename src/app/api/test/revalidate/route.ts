/**
 * TEST INFRASTRUCTURE — Phase B.08 verification harness.
 *
 * POSTs trigger one revalidation pass via the SAME `revalidateForDocument`
 * helper the production webhook at /api/revalidate uses. Difference: no
 * HMAC signature verification — auth is a Bearer secret on the
 * Authorization header (reuses the Phase 2.16 `TEST_ROUTES_SECRET`, no
 * new test secret introduced).
 *
 * Gated by REVALIDATE_TEST_ROUTES_ENABLED — when anything other than
 * 'true' the route returns 404 + {status:'forbidden'}. The flag is
 * unset on Vercel; the route ships in the bundle but is dead.
 * scripts/test-revalidate-webhook.mjs sets the flag on the spawned test
 * server only.
 *
 * Folder name is 'test', not '_test' — matches the Phase 2.15/2.16/2.17
 * pattern. Next 16's App Router treats underscore-prefixed folders as
 * private (unrouted), so '_test' would prevent the route from existing.
 */

import {NextResponse} from 'next/server';
import {z} from 'zod';
import {verifyCronAuth} from '@/lib/automation/cronAuth';
import {revalidateForDocument, type SanityRevalidationPayload} from '@/lib/sanity/revalidation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z
  .object({
    docType: z.string().min(1),
    slug: z.string().optional(),
    _id: z.string().optional(),
  })
  .strict();

export async function POST(request: Request) {
  if (process.env.REVALIDATE_TEST_ROUTES_ENABLED !== 'true') {
    return NextResponse.json({status: 'forbidden'}, {status: 404});
  }

  const auth = request.headers.get('authorization');
  const expected = process.env.TEST_ROUTES_SECRET ?? '';
  if (!verifyCronAuth(auth, expected)) {
    return NextResponse.json({status: 'error', reason: 'invalid-auth'}, {status: 401});
  }

  let rawPayload: unknown;
  try {
    rawPayload = await request.json();
  } catch {
    return NextResponse.json(
      {status: 'error', reason: 'invalid-payload'},
      {status: 400},
    );
  }

  const parsed = bodySchema.safeParse(rawPayload);
  if (!parsed.success) {
    return NextResponse.json(
      {status: 'error', reason: 'invalid-payload'},
      {status: 400},
    );
  }

  try {
    const payload: SanityRevalidationPayload = {
      _type: parsed.data.docType,
      _id: parsed.data._id,
      slug: parsed.data.slug,
    };
    const result = await revalidateForDocument(payload);
    return NextResponse.json({status: 'ok', ...result});
  } catch (err) {
    console.error('[api/test/revalidate] revalidateForDocument threw', err);
    return NextResponse.json(
      {status: 'error', reason: 'revalidate-failed'},
      {status: 500},
    );
  }
}
