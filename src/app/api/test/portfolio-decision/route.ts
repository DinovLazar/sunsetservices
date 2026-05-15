import {NextResponse} from 'next/server';
import {verifyCronAuth} from '@/lib/automation/cronAuth';
import {
  publishPortfolioDraft,
  rejectPortfolioDraft,
} from '@/lib/automation/portfolio/publish';

/**
 * TEST INFRASTRUCTURE — Phase 2.17 verification harness.
 *
 * POSTs `{pendingDocId, decision: 'approve'|'reject'}` invoke
 * publishPortfolioDraft / rejectPortfolioDraft directly — bypassing the
 * Telegram webhook so the publish/reject logic is exercised in isolation.
 * The Telegram webhook itself is verified by the Phase 2.15 + Phase 2.16
 * harnesses; this route gives Phase 2.17 a dedicated path to drive the
 * Sanity-write side effects without inbound Telegram traffic.
 *
 * Gated by `PORTFOLIO_AUTOMATION_TEST_ROUTES_ENABLED` — when anything
 * other than 'true' the route returns 404 + `{status:'forbidden'}`. Unset
 * on Vercel; ship in the bundle, dead in production.
 *
 * Reuses the Phase 2.16 `TEST_ROUTES_SECRET` for auth.
 *
 * MUST NOT be hit from a production caller.
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

  let body: {pendingDocId?: unknown; decision?: unknown};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({status: 'error', reason: 'invalid-json'}, {status: 400});
  }

  const pendingDocId = typeof body.pendingDocId === 'string' ? body.pendingDocId : '';
  const decision =
    body.decision === 'approve' || body.decision === 'reject' ? body.decision : null;
  if (!pendingDocId || !decision) {
    return NextResponse.json(
      {status: 'error', reason: 'invalid-payload'},
      {status: 400},
    );
  }

  try {
    if (decision === 'approve') {
      const result = await publishPortfolioDraft(pendingDocId);
      const gbpUpload =
        'skipped' in result.gbpUploadResult && result.gbpUploadResult.skipped
          ? `skipped:${result.gbpUploadResult.reason}`
          : 'ok' in result.gbpUploadResult && result.gbpUploadResult.ok
            ? 'ok'
            : 'error';
      const gbpPost =
        'skipped' in result.gbpPostResult && result.gbpPostResult.skipped
          ? `skipped:${result.gbpPostResult.reason}`
          : 'ok' in result.gbpPostResult && result.gbpPostResult.ok
            ? 'ok'
            : 'error';
      return NextResponse.json(
        {status: 'ok', decision: 'approve', projectId: result.projectId, gbpUpload, gbpPost},
        {status: 200},
      );
    }

    await rejectPortfolioDraft(pendingDocId);
    return NextResponse.json({status: 'ok', decision: 'reject'}, {status: 200});
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown-error';
    return NextResponse.json(
      {status: 'error', reason: 'handler-failed', message},
      {status: 500},
    );
  }
}
