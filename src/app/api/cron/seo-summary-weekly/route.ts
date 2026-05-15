import {NextResponse} from 'next/server';
import {verifyCronAuth} from '@/lib/automation/cronAuth';
import {fetchWeeklySeoSummary} from '@/lib/automation/gsc/fetch';
import {formatSeoSummaryMessage} from '@/lib/automation/gsc/summarize';
import {notifyOperator} from '@/lib/telegram/notify';

/**
 * POST /api/cron/seo-summary-weekly — Vercel Cron entry point (Phase 2.16).
 *
 * Runs once a week. Two branches gated by GSC_ENABLED:
 *
 *   - GSC_ENABLED=false (Phase 2.16 default): returns 200 + simulated
 *     after the auth check passes. No Google Search Console fetch, no
 *     Telegram send. The route handler IS complete on this branch — only
 *     the fetcher body is a TODO.
 *
 *   - GSC_ENABLED=true (Phase 3.15 flip): fetches the last-7-day summary
 *     via fetchWeeklySeoSummary(), formats it via formatSeoSummaryMessage(),
 *     sends via notifyOperator() with parseMode='MarkdownV2'. Returns 200 +
 *     the resulting Telegram message_id.
 *
 * Auth + flag-off short-circuit mirror the monthly blog cron route. Errors
 * trigger best-effort operator alert and opaque 500.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // 1. Auth
  const auth = request.headers.get('authorization');
  const expected = process.env.CRON_SECRET ?? '';
  if (!verifyCronAuth(auth, expected)) {
    return NextResponse.json({status: 'error', reason: 'invalid-auth'}, {status: 401});
  }

  // 2. Flag-off short-circuit
  if (process.env.GSC_ENABLED !== 'true') {
    return NextResponse.json(
      {status: 'simulated', reason: 'gsc-disabled'},
      {status: 200},
    );
  }

  try {
    const data = await fetchWeeklySeoSummary();
    const message = formatSeoSummaryMessage(data);
    const sendResult = await notifyOperator({
      text: message,
      parseMode: 'MarkdownV2',
    });

    if (!sendResult.sent) {
      return NextResponse.json(
        {status: 'error', reason: 'telegram-send-failed'},
        {status: 500},
      );
    }

    return NextResponse.json(
      {status: 'ok', sentMessageId: sendResult.messageId},
      {status: 200},
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown-error';
    console.error('[cron seo-summary-weekly] failed:', message);
    await notifyOperator({
      text: `⚠️ Weekly SEO cron failed: ${message}`,
    }).catch(() => {
      // notifyOperator returns rather than throws; defense-in-depth.
    });
    return NextResponse.json(
      {status: 'error', reason: 'cron-failed'},
      {status: 500},
    );
  }
}
