import {writeClient} from '@sanity-lib/write-client';
import {notifyOperator, requestApproval} from '@/lib/telegram/notify';
import {escapeMarkdownV2} from '@/lib/telegram/markdownV2';
import {ensurePlaceholderAsset} from '@/lib/automation/blog/placeholderAsset';
import {extractJobMetadata} from './extractJobMetadata';
import {uploadJobPhotos} from './uploadPhotos';
import {generatePortfolioDraft} from './draft';
import {persistPortfolioDraft} from './persistDraft';

/**
 * On-demand portfolio-draft pipeline orchestrator (Phase 2.17).
 *
 * Triggered by the ServiceM8 webhook's `after()` post-response callback
 * AFTER an inbound `job.completed` event is persisted. Webhook returns
 * 200 fast; this pipeline runs in the background — Anthropic averages
 * ~2 min, well past ServiceM8's HTTP timeout if it were synchronous.
 *
 * Sequence (mirrors the brief, mostly):
 *   1. Feature-flag gate (PORTFOLIO_DRAFT_ENABLED=true required).
 *   2. Resolve the source servicem8Event doc; skip if missing or already
 *      handled (telegramApprovalState != 'not_sent' → terminal).
 *   3. Time-based idempotency: any pending portfolioDraftPending with the
 *      same sourceEventId AND generatedAt > now() - 1 day → noop.
 *   4. Project the metadata from event.payload (JSON-parsed defensively).
 *   5. Download attachment photos best-effort + upload to Sanity assets.
 *   6. Pick featuredImage: first uploaded asset OR the shared Phase 2.16
 *      placeholder asset when zero photos download.
 *   7. Generate the bilingual draft via Anthropic.
 *   8. Persist the draft as a new portfolioDraftPending doc.
 *   9. Build a MarkdownV2 summary and send the Telegram approval request.
 *  10. Patch the doc with telegramMessageId + telegramApprovalLogId.
 *  11. Flip the source event's telegramApprovalState to 'pending'.
 *
 * Errors get a best-effort `notifyOperator` alert + rethrow. The caller
 * (webhook `after()` or test route) converts to a 500. Inside `after()`,
 * the throw is invisible to the ServiceM8 response — the response has
 * already been sent.
 */

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export type PipelineResult =
  | {status: 'simulated'; reason: 'feature-flag'}
  | {status: 'noop'; reason: 'pending-draft-exists'; existingDocId: string}
  | {status: 'noop'; reason: 'source-event-missing'}
  | {status: 'noop'; reason: 'source-event-already-handled'}
  | {
      status: 'ok';
      pendingDocId: string;
      telegramMessageId: number;
      photoStats: {uploaded: number; failed: number};
    };

type SourceEventDoc = {
  _id: string;
  eventId: string;
  payload?: string;
  telegramApprovalState?: string;
};

const SOURCE_EVENT_PROJECTION = `{_id, eventId, payload, telegramApprovalState}`;

function buildTelegramSummary(args: {
  titleEn: string;
  dekEn: string;
  audience: string;
  serviceSlug: string;
  locationSlug: string;
  uploaded: number;
  failed: number;
}): string {
  const dekTruncated =
    args.dekEn.length > 80 ? `${args.dekEn.slice(0, 79).trimEnd()}…` : args.dekEn;
  const lines = [
    `*${escapeMarkdownV2(args.titleEn)}*`,
    '',
    escapeMarkdownV2(dekTruncated),
    '',
    `_Audience:_ ${escapeMarkdownV2(args.audience)}`,
    `_Service:_ ${escapeMarkdownV2(args.serviceSlug)}`,
    `_Location:_ ${escapeMarkdownV2(args.locationSlug)}`,
    `_Photos:_ ${args.uploaded} uploaded${args.failed > 0 ? `, ${args.failed} failed` : ''}`,
  ];
  return lines.join('\n').slice(0, 1000);
}

function parseEventPayload(raw: string | undefined): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function runPortfolioDraftPipeline(
  eventDocId: string,
): Promise<PipelineResult> {
  if (process.env.PORTFOLIO_DRAFT_ENABLED !== 'true') {
    console.info(
      `[portfolio-pipeline] PORTFOLIO_DRAFT_ENABLED!=='true' — no-op for eventDocId=${eventDocId}`,
    );
    return {status: 'simulated', reason: 'feature-flag'};
  }

  try {
    const event = await writeClient.fetch<SourceEventDoc | null>(
      `*[_id == $id][0]${SOURCE_EVENT_PROJECTION}`,
      {id: eventDocId},
    );
    if (!event) {
      console.warn(`[portfolio-pipeline] source event missing for ${eventDocId}`);
      return {status: 'noop', reason: 'source-event-missing'};
    }
    if (event.telegramApprovalState && event.telegramApprovalState !== 'not_sent') {
      console.info(
        `[portfolio-pipeline] source event ${eventDocId} already handled (state=${event.telegramApprovalState})`,
      );
      return {status: 'noop', reason: 'source-event-already-handled'};
    }

    const since = new Date(Date.now() - ONE_DAY_MS).toISOString();
    const existing = await writeClient.fetch<{_id: string} | null>(
      '*[_type == "portfolioDraftPending" && sourceEventId == $eid && status == "pending" && generatedAt > $since] | order(generatedAt desc)[0]{_id}',
      {eid: event.eventId, since},
    );
    if (existing) {
      console.info(
        `[portfolio-pipeline] pending draft already exists for eventId=${event.eventId} (docId=${existing._id})`,
      );
      return {status: 'noop', reason: 'pending-draft-exists', existingDocId: existing._id};
    }

    const payloadObject = parseEventPayload(event.payload);
    const metadata = extractJobMetadata(payloadObject);

    const photoResult = await uploadJobPhotos(metadata.attachmentUrls);
    const photoStats = {uploaded: photoResult.uploaded.length, failed: photoResult.failed.length};

    let featuredImage: {_type: 'image'; asset: {_ref: string}};
    if (photoResult.uploaded.length > 0) {
      featuredImage = photoResult.uploaded[0].assetRef;
    } else {
      const {assetId} = await ensurePlaceholderAsset();
      featuredImage = {_type: 'image', asset: {_ref: assetId}};
    }

    const modelUsed =
      process.env.ANTHROPIC_PORTFOLIO_MODEL ??
      process.env.ANTHROPIC_MODEL ??
      'claude-sonnet-4-6';
    const draft = await generatePortfolioDraft({
      jobMetadata: metadata,
      photoCount: photoResult.uploaded.length,
    });

    const {docId: pendingDocId} = await persistPortfolioDraft({
      draft,
      jobMetadata: metadata,
      sourceEventId: event.eventId,
      sourceEventDocId: eventDocId,
      modelUsed,
      featuredImage,
      gallery: photoResult.uploaded.map((u) => u.assetRef),
      photoStats,
    });

    const summary = buildTelegramSummary({
      titleEn: draft.title.en,
      dekEn: draft.dek.en,
      audience: draft.audience,
      serviceSlug: draft.serviceSlug,
      locationSlug: draft.locationSlug,
      uploaded: photoStats.uploaded,
      failed: photoStats.failed,
    });

    const approval = await requestApproval({
      kind: 'servicem8_portfolio',
      targetId: pendingDocId,
      summary,
    });

    let telegramMessageId = -1;
    if (approval.sent && typeof approval.messageId === 'number') {
      telegramMessageId = approval.messageId;
      try {
        await writeClient
          .patch(pendingDocId)
          .set({
            telegramMessageId: approval.messageId,
            telegramApprovalLogId: approval.logDocId,
          })
          .commit();
      } catch (patchErr) {
        console.warn(
          `[portfolio-pipeline] telegramMessageId patch failed for ${pendingDocId}`,
          patchErr,
        );
      }
    } else {
      console.warn(
        `[portfolio-pipeline] requestApproval did not send for ${pendingDocId} (simulated=${approval.simulated ?? false})`,
      );
    }

    try {
      const nowIso = new Date().toISOString();
      await writeClient
        .patch(eventDocId)
        .set({telegramApprovalState: 'pending', lastUpdatedAt: nowIso})
        .commit();
    } catch (patchErr) {
      console.warn(
        `[portfolio-pipeline] source event state patch failed for ${eventDocId}`,
        patchErr,
      );
    }

    return {status: 'ok', pendingDocId, telegramMessageId, photoStats};
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown-error';
    console.error('[portfolio-pipeline] failed:', message);
    await notifyOperator({
      text: `⚠️ Portfolio draft pipeline failed: ${message}`,
    }).catch(() => {
      // notifyOperator never throws; defense-in-depth.
    });
    throw err;
  }
}
