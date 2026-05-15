import {NextResponse} from 'next/server';
import {verifyCronAuth} from '@/lib/automation/cronAuth';
import {runPortfolioDraftPipeline} from '@/lib/automation/portfolio/runPipeline';

/**
 * TEST INFRASTRUCTURE — Phase 2.17 verification harness.
 *
 * POSTs `{eventDocId: string}` directly trigger
 * `runPortfolioDraftPipeline(eventDocId)` — the same executor the
 * ServiceM8 webhook's `after()` callback fires. This bypasses the webhook
 * signature + auth flow so the harness can drive the pipeline against
 * synthetic `servicem8Event` docs without forging ServiceM8 HMACs.
 *
 * Gated by `PORTFOLIO_AUTOMATION_TEST_ROUTES_ENABLED` — when anything
 * other than 'true' the route returns 404 + `{status:'forbidden'}`. Unset
 * on Vercel; ships in the bundle but dead in production. The harness
 * sets it ad-hoc on the spawned test server.
 *
 * Reuses the Phase 2.16 `TEST_ROUTES_SECRET` for auth — no new shared
 * secret. The verifyCronAuth helper checks
 * `Authorization: Bearer ${TEST_ROUTES_SECRET}` with a timing-safe
 * compare.
 *
 * MUST NOT be hit from a production caller. The ServiceM8 webhook is the
 * production path for triggering the pipeline; this is verification-only.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (process.env.PORTFOLIO_AUTOMATION_TEST_ROUTES_ENABLED !== 'true') {
    return NextResponse.json({status: 'forbidden'}, {status: 404});
  }

  const auth = request.headers.get('authorization');
  const expected = process.env.TEST_ROUTES_SECRET ?? '';
  if (!verifyCronAuth(auth, expected)) {
    return NextResponse.json({status: 'error', reason: 'invalid-auth'}, {status: 401});
  }

  let body: {eventDocId?: unknown};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({status: 'error', reason: 'invalid-json'}, {status: 400});
  }
  const eventDocId = typeof body.eventDocId === 'string' ? body.eventDocId : '';
  if (!eventDocId) {
    return NextResponse.json(
      {status: 'error', reason: 'invalid-payload'},
      {status: 400},
    );
  }

  try {
    const result = await runPortfolioDraftPipeline(eventDocId);
    return NextResponse.json(result, {status: 200});
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown-error';
    return NextResponse.json(
      {status: 'error', reason: 'pipeline-failed', message},
      {status: 500},
    );
  }
}
