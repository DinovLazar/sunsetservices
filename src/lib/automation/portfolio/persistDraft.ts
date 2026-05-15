import {randomUUID} from 'node:crypto';
import {writeClient} from '@sanity-lib/write-client';
import {
  makeKey,
  toPortableTextBlocks,
} from '@/lib/automation/shared/toPortableTextBlocks';
import type {JobMetadata} from './extractJobMetadata';
import type {PortfolioDraft} from './draft';

/**
 * Sanity persist helper for portfolioDraftPending (Phase 2.17).
 *
 * Mirrors `persistBlogDraftPending` (Phase 2.16) — same deterministic-prefix
 * `_id` pattern (`portfolioDraftPending-<uuid>`), same PortableText
 * conversion via the shared helper. The orchestrator hands the returned
 * docId to `requestApproval({kind:'servicem8_portfolio', targetId: docId})`;
 * the Telegram webhook's `'servicem8_portfolio'` branch reads the doc by ID
 * and routes to `publishPortfolioDraft` / `rejectPortfolioDraft`.
 *
 * `telegramMessageId` + `telegramApprovalLogId` are NOT set here — the
 * orchestrator patches them in after the Telegram send returns. That
 * separation lets `requestApproval` decide whether the doc gets a real
 * Telegram message ID or a sentinel value (e.g. when TELEGRAM_ENABLED=false
 * and the send is simulated).
 */

export type PersistArgs = {
  draft: PortfolioDraft;
  jobMetadata: JobMetadata;
  sourceEventId: string;
  sourceEventDocId: string;
  modelUsed: string;
  featuredImage: {_type: 'image'; asset: {_ref: string}};
  gallery: Array<{_type: 'image'; asset: {_ref: string}}>;
  photoStats?: {uploaded: number; failed: number};
};

function attachImageKeys(
  images: Array<{_type: 'image'; asset: {_ref: string}}>,
): Array<{_key: string; _type: 'image'; asset: {_ref: string}}> {
  return images.map((img) => ({...img, _key: makeKey()}));
}

export async function persistPortfolioDraft(args: PersistArgs): Promise<{docId: string}> {
  const docId = `portfolioDraftPending-${randomUUID()}`;
  const now = new Date().toISOString();

  await writeClient.create({
    _id: docId,
    _type: 'portfolioDraftPending',
    title: args.draft.title,
    dek: args.draft.dek,
    body: {
      en: toPortableTextBlocks(args.draft.body.en),
      es: toPortableTextBlocks(args.draft.body.es),
    },
    audience: args.draft.audience,
    serviceSlug: args.draft.serviceSlug,
    locationSlug: args.draft.locationSlug,
    featuredImage: args.featuredImage,
    gallery: attachImageKeys(args.gallery),
    proposedSlug: {_type: 'slug', current: args.draft.proposedSlug},
    sourceEventId: args.sourceEventId,
    sourceEventDocId: args.sourceEventDocId,
    modelUsed: args.modelUsed,
    generatedAt: now,
    status: 'pending',
    photoStats: args.photoStats,
  });

  // Defensive: surface the jobUuid + address + description as hidden meta
  // for operator audit. (The metadata is already in the source servicem8Event
  // doc, but copying the salient strings here makes Sanity Studio review
  // possible without chasing the cross-ref.) Off-spec from the schema as
  // defined — these fields aren't on portfolioDraftPending. If the operator
  // needs them, they can read from the source event via sourceEventDocId.
  // Left here as a comment marker; not actually written.
  void args.jobMetadata;

  return {docId};
}
