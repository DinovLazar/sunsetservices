import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {writeClient} from '@sanity-lib/write-client';

/**
 * Default placeholder featured-image asset (Phase 2.16).
 *
 * Auto-published blog posts reference a single shared placeholder image
 * until the operator swaps in a curated photo from Sanity Studio. This
 * helper returns the Sanity asset _id (Sanity-generated, content-hash
 * based) and uploads the placeholder file from public/images/blog/ on
 * first call. Subsequent calls find the existing asset by filename.
 *
 * The plan called for a deterministic asset _id like
 * "image-blogDefaultPlaceholder-jpg" passed via `client.assets.upload`
 * options. Sanity's current upload API does NOT accept a custom _id —
 * asset _ids are generated server-side from the content hash. Off-spec
 * decision: look up by `originalFilename` instead (stable across runs
 * because the upload filename is deterministic, and Sanity's content-hash
 * dedup means re-uploading the same bytes always returns the same _id).
 *
 * Module-scope memoization caches the _id for the lifetime of the Vercel
 * function instance — no redundant fetches across multiple Approve taps
 * within the same warm container.
 */

const PLACEHOLDER_FILE_PATH = join(process.cwd(), 'public', 'images', 'blog', '_placeholder.jpg');
const PLACEHOLDER_FILENAME = 'blogDefaultPlaceholder.jpg';

let cachedAssetId: string | null = null;

export async function ensurePlaceholderAsset(): Promise<{assetId: string}> {
  if (cachedAssetId) return {assetId: cachedAssetId};

  // Lookup by originalFilename — deterministic across runs because the upload
  // filename is fixed. Content-hash dedup means even if a future re-upload
  // happens, it lands at the same _id.
  const existing = await writeClient.fetch<{_id: string} | null>(
    '*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id}',
    {filename: PLACEHOLDER_FILENAME},
  );
  if (existing) {
    cachedAssetId = existing._id;
    return {assetId: existing._id};
  }

  const fileBuffer = await readFile(PLACEHOLDER_FILE_PATH);
  const uploaded = await writeClient.assets.upload('image', fileBuffer, {
    filename: PLACEHOLDER_FILENAME,
    contentType: 'image/jpeg',
  });

  cachedAssetId = uploaded._id;
  return {assetId: uploaded._id};
}

/**
 * Test seam — clears the in-memory cache so the harness sees fresh Sanity
 * state between runs. Not part of the production API.
 */
export function _resetPlaceholderCacheForTests(): void {
  cachedAssetId = null;
}
