import {NextResponse} from 'next/server';
import {publishBlogDraft, rejectBlogDraft} from '@/lib/automation/blog/publish';

/**
 * TEST INFRASTRUCTURE — Phase 2.16 verification harness.
 *
 * POSTs `{pendingDocId, decision: 'approve'|'reject'}` invoke
 * publishBlogDraft / rejectBlogDraft directly — bypassing the Telegram
 * webhook so the publish/reject logic is exercised in isolation. The
 * webhook itself is verified by the Phase 2.15 harness; this route gives
 * Phase 2.16 a dedicated path to drive the auto-publish + audit-flip
 * side-effects without depending on inbound Telegram traffic.
 *
 * Gated by BLOG_AUTOMATION_TEST_ROUTES_ENABLED — when anything other
 * than 'true' the route returns 404 + {status:'forbidden'}. Unset on
 * Vercel; ship in the bundle, dead in production.
 *
 * MUST NOT be used by any production caller. The Telegram webhook is
 * the production path for approve/reject; this is verification-only.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (process.env.BLOG_AUTOMATION_TEST_ROUTES_ENABLED !== 'true') {
    return NextResponse.json({status: 'forbidden'}, {status: 404});
  }

  let body: {pendingDocId?: unknown; decision?: unknown};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({status: 'error', reason: 'invalid-json'}, {status: 400});
  }

  const pendingDocId = typeof body.pendingDocId === 'string' ? body.pendingDocId : '';
  const decision = body.decision === 'approve' || body.decision === 'reject' ? body.decision : null;
  if (!pendingDocId || !decision) {
    return NextResponse.json(
      {status: 'error', reason: 'invalid-payload'},
      {status: 400},
    );
  }

  try {
    if (decision === 'approve') {
      const result = await publishBlogDraft(pendingDocId);
      return NextResponse.json({status: 'ok', blogPostId: result.blogPostId}, {status: 200});
    }
    await rejectBlogDraft(pendingDocId);
    return NextResponse.json({status: 'ok', decision: 'reject'}, {status: 200});
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown-error';
    return NextResponse.json(
      {status: 'error', reason: 'handler-failed', message},
      {status: 500},
    );
  }
}
