import {NextResponse} from 'next/server';
import {verifyCronAuth} from '@/lib/automation/cronAuth';
import {executeMonthlyBlogDraftRun} from '@/lib/automation/blog/runMonthly';
import {_resetTopicPickerCacheForTests} from '@/lib/automation/blog/topicPicker';
import {_resetPlaceholderCacheForTests} from '@/lib/automation/blog/placeholderAsset';

/**
 * TEST INFRASTRUCTURE — Phase 2.16 verification harness.
 *
 * POSTs trigger one end-to-end run of the monthly blog cron via the
 * shared executor in src/lib/automation/blog/runMonthly.ts — same code
 * path as /api/cron/blog-draft-monthly but with the auth check pointing
 * at a separate TEST_ROUTES_SECRET env var. This isolates harness
 * traffic from the production CRON_SECRET — a leaked production secret
 * cannot drive this route, and a leaked test secret cannot drive the
 * production cron.
 *
 * Gated by BLOG_AUTOMATION_TEST_ROUTES_ENABLED — when anything other
 * than 'true' the route returns 404 + {status:'forbidden'}. The flag
 * is unset on Vercel; the routes ship in the bundle but are dead.
 * scripts/test-blog-automation.mjs sets the flag on the spawned test
 * server only.
 *
 * Folder name is 'test', not '_test' — matches the Phase 2.15 pattern.
 * Next 16's App Router treats underscore-prefixed folders as private
 * (unrouted), so '_test' would prevent the route from existing at all.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (process.env.BLOG_AUTOMATION_TEST_ROUTES_ENABLED !== 'true') {
    return NextResponse.json({status: 'forbidden'}, {status: 404});
  }

  const auth = request.headers.get('authorization');
  const expected = process.env.TEST_ROUTES_SECRET ?? '';
  if (!verifyCronAuth(auth, expected)) {
    return NextResponse.json({status: 'error', reason: 'invalid-auth'}, {status: 401});
  }

  // Cache reset is OPT-IN via ?reset=true. Default off because the
  // harness needs the natural module-scope cache to hold between two
  // consecutive POSTs to exercise the cron's per-topic idempotency
  // path (the cache keeps the picker returning the same topic, which
  // is what triggers the idempotency check on the second POST).
  //
  // Pass ?reset=true after Sanity-mutating tests so the next picker
  // call re-queries fresh state. Production never hits this route
  // (the flag is unset on Vercel).
  const url = new URL(request.url);
  if (url.searchParams.get('reset') === 'true') {
    _resetTopicPickerCacheForTests();
    _resetPlaceholderCacheForTests();
  }

  const result = await executeMonthlyBlogDraftRun();
  const httpStatus = result.status === 'error' ? 500 : 200;
  return NextResponse.json(result, {status: httpStatus});
}
