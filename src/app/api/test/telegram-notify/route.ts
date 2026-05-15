import {NextResponse} from 'next/server';
import {notifyOperator} from '@/lib/telegram/notify';

/**
 * TEST INFRASTRUCTURE — Phase 2.15 verification harness.
 *
 * Thin POST wrapper around `notifyOperator()` so the automated harness
 * (scripts/test-telegram-bot.mjs) can drive the helper through a real
 * HTTP request and observe the simulated mock-server side effects.
 *
 * MUST NOT be used by any production caller. Gated by the explicit
 * TELEGRAM_TEST_ROUTES_ENABLED env var — when anything other than 'true'
 * the route returns 404 + {status:'forbidden'}. The plan's original
 * NODE_ENV-based gate would have made the route inaccessible to the
 * verification harness too (next start sets NODE_ENV=production), so a
 * dedicated flag is used instead. Production + Preview Vercel envs do
 * NOT set this flag — the route ships in the bundle but is dead.
 *
 * Folder name: `test`, not `_test`. Next 16's App Router treats
 * underscore-prefixed folders as private (not routed); using `_test` would
 * prevent the route from existing at all. Both off-spec deviations are
 * documented in the Phase 2.15 completion report.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (process.env.TELEGRAM_TEST_ROUTES_ENABLED !== 'true') {
    return NextResponse.json({status: 'forbidden'}, {status: 404});
  }
  const body = (await request.json().catch(() => ({}))) as {
    text?: string;
    parseMode?: 'MarkdownV2' | 'HTML';
  };
  const text = typeof body.text === 'string' ? body.text : 'test notify';
  const result = await notifyOperator({text, parseMode: body.parseMode});
  return NextResponse.json(result);
}
