import {NextResponse} from 'next/server';
import {verifyCronAuth} from '@/lib/automation/cronAuth';
import {executeMonthlyBlogDraftRun} from '@/lib/automation/blog/runMonthly';

/**
 * POST /api/cron/blog-draft-monthly — Vercel Cron entry point (Phase 2.16).
 *
 * Runs once a month (vercel.json schedule). Auth check first, then delegates
 * to executeMonthlyBlogDraftRun() which contains the full draft → persist →
 * approve flow. Sharing the executor lets the test route exercise the same
 * code path with a different secret.
 *
 * Auth: `Authorization: Bearer ${CRON_SECRET}`. Vercel Cron sends this
 * automatically once vercel.json registers the schedule.
 *
 * Flag-off: BLOG_DRAFT_CRON_ENABLED!=='true' → 200 + simulated (handled
 * inside the executor; the route just returns whatever it gets).
 *
 * Status mapping:
 *   - simulated/noop → 200
 *   - ok             → 200
 *   - error          → 500
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const auth = request.headers.get('authorization');
  const expected = process.env.CRON_SECRET ?? '';
  if (!verifyCronAuth(auth, expected)) {
    return NextResponse.json({status: 'error', reason: 'invalid-auth'}, {status: 401});
  }

  const result = await executeMonthlyBlogDraftRun();
  const httpStatus = result.status === 'error' ? 500 : 200;
  return NextResponse.json(result, {status: httpStatus});
}
