import {writeClient} from '@sanity-lib/write-client';
import {ensurePlaceholderAsset} from '@/lib/automation/blog/placeholderAsset';
import {makeKey} from '@/lib/automation/shared/toPortableTextBlocks';
import {
  uploadPhotosToGbp,
  createGoogleBusinessPost,
  summarizeGbpResult,
  type GbpUploadResult,
  type GbpPostResult,
} from './gbpPublish';

/**
 * Publish + reject handlers for portfolioDraftPending (Phase 2.17).
 *
 * Called by the Telegram webhook's 'servicem8_portfolio' branch when the
 * operator taps Approve / Reject. The webhook's pre-tap idempotency check
 * (`logRow.decision !== 'pending'`) prevents repeated execution, so these
 * handlers don't need to dedupe themselves at the log layer — but they
 * DO short-circuit on `status !== 'pending'` for defense-in-depth.
 *
 * Approve flow (mirrors Phase 2.16's blog flow):
 *   1. Read the pending doc; throw if missing or already processed.
 *   2. `createOrReplace` the live `project` document with deterministic
 *      `_id` (`project-<proposedSlug>`). Idempotent across replays. The
 *      project schema's existing fields are populated where the draft
 *      supplies them; lookups for `services[]` + `city` against Sanity
 *      service/location docs by slug are best-effort (skipped on miss
 *      so the operator can finish in Studio).
 *   3. Patch the pending doc to `status='approved'` + `processedAt=now()`
 *      + `publishedProjectId=<project _id>`.
 *   4. Patch the source servicem8Event doc to
 *      `telegramApprovalState='approved'`.
 *   5. Call the GBP stubs (`uploadPhotosToGbp` + `createGoogleBusinessPost`).
 *      Both return `{skipped:true,reason:'gbp-deferred'}` while Phase
 *      2.17a is pending. The summary string is patched onto
 *      `meta.gbpUploadResult` for audit.
 *   6. Return `{projectId, gbpUploadResult, gbpPostResult}`.
 *
 * Reject flow:
 *   1. Read the pending doc; throw if missing or already processed.
 *   2. Patch pending: `status='rejected'`, `processedAt=now()`.
 *   3. Patch source event: `telegramApprovalState='rejected'`.
 *   4. Return `{ok: true}`.
 */

type PortableTextBlock = {
  _type: 'block';
  _key: string;
  style?: string;
  listItem?: 'bullet' | 'number';
  level?: number;
  children: Array<{_type: 'span'; _key: string; text: string; marks: string[]}>;
  markDefs: never[];
};

type LocalizedString = {en: string; es: string};

type LocalizedBody = {en: PortableTextBlock[]; es: PortableTextBlock[]};

type ImageRef = {_type: 'image'; asset: {_ref: string}};

type ImageRefWithKey = ImageRef & {_key?: string};

type PendingDoc = {
  _id: string;
  title: LocalizedString;
  dek?: LocalizedString;
  body: LocalizedBody;
  audience: 'residential' | 'commercial' | 'hardscape';
  serviceSlug?: string;
  locationSlug?: string;
  featuredImage?: ImageRef;
  gallery?: ImageRefWithKey[];
  proposedSlug?: {current: string};
  sourceEventId: string;
  sourceEventDocId: string;
  modelUsed?: string;
  generatedAt: string;
  status: 'pending' | 'approved' | 'rejected';
};

const PENDING_PROJECTION = `{
  _id, title, dek, body, audience, serviceSlug, locationSlug,
  featuredImage, gallery, proposedSlug, sourceEventId, sourceEventDocId,
  modelUsed, generatedAt, status
}`;

function joinBodyToText(blocks: PortableTextBlock[]): string {
  const parts: string[] = [];
  for (const block of blocks) {
    const text = block.children
      .map((c) => c.text)
      .filter(Boolean)
      .join('');
    if (text) parts.push(text);
  }
  return parts.join('\n\n');
}

async function resolveServiceRef(args: {
  slug: string;
  audience: string;
}): Promise<{_type: 'reference'; _ref: string; _key: string} | null> {
  const docId = await writeClient.fetch<string | null>(
    '*[_type == "service" && slug.current == $slug && audience == $audience][0]._id',
    {slug: args.slug, audience: args.audience},
  );
  if (!docId) return null;
  return {_type: 'reference', _ref: docId, _key: makeKey()};
}

async function resolveLocationRef(args: {
  slug: string;
}): Promise<{_type: 'reference'; _ref: string} | null> {
  const docId = await writeClient.fetch<string | null>(
    '*[_type == "location" && slug.current == $slug][0]._id',
    {slug: args.slug},
  );
  if (!docId) return null;
  return {_type: 'reference', _ref: docId};
}

async function buildAssetUrlsForGbp(
  gallery: ImageRefWithKey[],
  featuredImage: ImageRef | undefined,
): Promise<{primary: string; all: string[]}> {
  const refs = featuredImage ? [featuredImage.asset._ref] : [];
  for (const item of gallery) {
    if (item.asset._ref && !refs.includes(item.asset._ref)) refs.push(item.asset._ref);
  }
  if (refs.length === 0) return {primary: '', all: []};
  const ids = await writeClient.fetch<Array<{_id: string; url: string}>>(
    '*[_type == "sanity.imageAsset" && _id in $ids]{_id, url}',
    {ids: refs},
  );
  const urlById = new Map(ids.map((r) => [r._id, r.url]));
  const orderedUrls = refs.map((id) => urlById.get(id)).filter((u): u is string => Boolean(u));
  return {primary: orderedUrls[0] ?? '', all: orderedUrls};
}

export async function publishPortfolioDraft(pendingDocId: string): Promise<{
  projectId: string;
  gbpUploadResult: GbpUploadResult;
  gbpPostResult: GbpPostResult;
}> {
  const pending = await writeClient.fetch<PendingDoc | null>(
    `*[_type == "portfolioDraftPending" && _id == $id][0]${PENDING_PROJECTION}`,
    {id: pendingDocId},
  );
  if (!pending) {
    throw new Error(`portfolioDraftPending not found: ${pendingDocId}`);
  }
  if (pending.status !== 'pending') {
    throw new Error(
      `portfolioDraftPending ${pendingDocId} already processed (status=${pending.status})`,
    );
  }

  const proposedSlug = pending.proposedSlug?.current ?? '';
  if (!proposedSlug) {
    throw new Error(`portfolioDraftPending ${pendingDocId} missing proposedSlug`);
  }

  // Featured image fallback: if for some reason the draft has none, reuse
  // the shared placeholder. Practically the orchestrator already does this,
  // but defense-in-depth keeps Approve idempotent against hand-crafted
  // pending docs.
  let leadImage: ImageRef;
  if (pending.featuredImage) {
    leadImage = pending.featuredImage;
  } else {
    const {assetId} = await ensurePlaceholderAsset();
    leadImage = {_type: 'image', asset: {_ref: assetId}};
  }

  const gallery: Array<{_type: 'galleryEntry'; _key: string; image: ImageRef; alt: LocalizedString}> = [];
  if (pending.gallery) {
    for (const item of pending.gallery) {
      gallery.push({
        _type: 'galleryEntry',
        _key: makeKey(),
        image: {_type: 'image', asset: {_ref: item.asset._ref}},
        alt: pending.title,
      });
    }
  }

  const serviceRef = pending.serviceSlug
    ? await resolveServiceRef({slug: pending.serviceSlug, audience: pending.audience})
    : null;
  const cityRef = pending.locationSlug ? await resolveLocationRef({slug: pending.locationSlug}) : null;

  const projectId = `project-${proposedSlug}`;
  const now = new Date().toISOString();
  const narrativeEn = joinBodyToText(pending.body.en);
  const narrativeEs = joinBodyToText(pending.body.es);

  const projectDoc: Record<string, unknown> = {
    _id: projectId,
    _type: 'project',
    title: pending.title,
    slug: {_type: 'slug', current: proposedSlug},
    audience: pending.audience,
    shortDek: pending.dek,
    narrative: {en: narrativeEn, es: narrativeEs},
    leadImage,
    leadAlt: pending.title,
    publishedAt: now,
    automatedSourceEventId: pending.sourceEventId,
    automatedGeneratedAt: pending.generatedAt,
    automatedModelUsed: pending.modelUsed,
  };
  if (gallery.length > 0) projectDoc.gallery = gallery;
  if (serviceRef) projectDoc.services = [serviceRef];
  if (cityRef) projectDoc.city = cityRef;

  await writeClient.createOrReplace(projectDoc);

  await writeClient
    .patch(pendingDocId)
    .set({
      status: 'approved',
      processedAt: now,
      publishedProjectId: projectId,
    })
    .commit();

  await writeClient
    .patch(pending.sourceEventDocId)
    .set({telegramApprovalState: 'approved', lastUpdatedAt: now})
    .commit();

  // GBP write legs — stubbed until Phase 2.17a. Both return
  // {skipped:true,reason:'gbp-deferred'} as Phase 2.17 defaults.
  const assetUrls = await buildAssetUrlsForGbp(pending.gallery ?? [], pending.featuredImage);
  const gbpUploadResult = await uploadPhotosToGbp({
    assetUrls: assetUrls.all,
    caption: pending.title.en,
  });
  const gbpPostResult = await createGoogleBusinessPost({
    title: pending.title.en,
    body: pending.dek?.en ?? '',
    primaryPhotoAssetUrl: assetUrls.primary,
    ctaUrl: `https://sunsetservices.us/projects/${proposedSlug}`,
  });

  await writeClient
    .patch(pendingDocId)
    .set({gbpUploadResult: summarizeGbpResult(gbpUploadResult)})
    .commit();

  return {projectId, gbpUploadResult, gbpPostResult};
}

export async function rejectPortfolioDraft(
  pendingDocId: string,
): Promise<{ok: true}> {
  const pending = await writeClient.fetch<{
    _id: string;
    status: string;
    sourceEventDocId: string;
  } | null>(
    '*[_type == "portfolioDraftPending" && _id == $id][0]{_id, status, sourceEventDocId}',
    {id: pendingDocId},
  );
  if (!pending) {
    throw new Error(`portfolioDraftPending not found: ${pendingDocId}`);
  }
  if (pending.status !== 'pending') {
    throw new Error(
      `portfolioDraftPending ${pendingDocId} already processed (status=${pending.status})`,
    );
  }

  const now = new Date().toISOString();
  await writeClient
    .patch(pendingDocId)
    .set({status: 'rejected', processedAt: now})
    .commit();

  if (pending.sourceEventDocId) {
    await writeClient
      .patch(pending.sourceEventDocId)
      .set({telegramApprovalState: 'rejected', lastUpdatedAt: now})
      .commit();
  }

  return {ok: true};
}
