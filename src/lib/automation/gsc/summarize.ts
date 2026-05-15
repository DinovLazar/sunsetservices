import {escapeMarkdownV2} from '@/lib/telegram/markdownV2';
import type {WeeklySeoSummary} from './fetch';

/**
 * Telegram-friendly MarkdownV2 summary formatter for the weekly GSC digest.
 *
 * Returns a single message body under Telegram's 4096-char ceiling. Layout:
 *
 *   *SEO summary — last 7 days*
 *
 *   *Totals*
 *   - Clicks: 142
 *   - Impressions: 8,420
 *   - Avg position: 14.2
 *   - CTR: 1.7%
 *
 *   *Top queries*
 *   1. landscaping aurora il — 28 clicks
 *   ...
 *
 *   *Top pages*
 *   1. /residential/ — 34 clicks
 *   ...
 *
 * WoW delta is out of scope this phase — adding it requires persisting last
 * week's totals somewhere (Sanity singleton or KV). Phase 3.x can layer that
 * on top of this formatter without changing its signature.
 *
 * Phase 2.16 default state: this function is NEVER called because
 * GSC_ENABLED=false short-circuits the cron route. It ships ready-to-go
 * for the Phase 3.15 flip.
 */
export function formatSeoSummaryMessage(data: WeeklySeoSummary): string {
  const lines: string[] = [];

  lines.push(`*SEO summary \\— last 7 days*`);
  lines.push(
    `_${escapeMarkdownV2(data.rangeStart)} → ${escapeMarkdownV2(data.rangeEnd)}_`,
  );
  lines.push('');

  lines.push('*Totals*');
  lines.push(`\\- Clicks: ${escapeMarkdownV2(data.totals.clicks.toLocaleString('en-US'))}`);
  lines.push(`\\- Impressions: ${escapeMarkdownV2(data.totals.impressions.toLocaleString('en-US'))}`);
  lines.push(`\\- Avg position: ${escapeMarkdownV2(data.totals.position.toFixed(1))}`);
  lines.push(
    `\\- CTR: ${escapeMarkdownV2((data.totals.ctr * 100).toFixed(2))}%`,
  );
  lines.push('');

  if (data.topQueries.length > 0) {
    lines.push('*Top queries*');
    data.topQueries.slice(0, 10).forEach((row, i) => {
      lines.push(
        `${i + 1}\\. ${escapeMarkdownV2(row.query)} \\— ${row.clicks} clicks`,
      );
    });
    lines.push('');
  }

  if (data.topPages.length > 0) {
    lines.push('*Top pages*');
    data.topPages.slice(0, 10).forEach((row, i) => {
      lines.push(
        `${i + 1}\\. ${escapeMarkdownV2(row.page)} \\— ${row.clicks} clicks`,
      );
    });
  }

  const message = lines.join('\n');
  return message.length > 4000 ? `${message.slice(0, 4000)}\n…` : message;
}
