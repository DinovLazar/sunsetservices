import {writeClient} from '@sanity-lib/write-client';

/**
 * Photo download + Sanity asset upload helper (Phase 2.17).
 *
 * Walks the ServiceM8 attachment URL list, downloads each photo with a
 * 15-second timeout + 10 MB size cap, and uploads successes to Sanity as
 * image assets. Returns a `{uploaded, failed}` split — the caller (the
 * pipeline orchestrator) decides what to do with failures. The pipeline's
 * policy: log + continue. Even zero successful uploads is a valid pipeline
 * outcome — the placeholder asset takes over for `featuredImage`.
 *
 * Sanity's `assets.upload` does NOT accept a custom `_id`, so the helper
 * lets Sanity generate the content-hash-based `_id` itself. Re-uploading
 * the same bytes always returns the same `_id` (content-hash dedup), so
 * repeated ServiceM8 retries against the same attachment URLs are free.
 *
 * Failures are surface-level only — no Anthropic / Telegram / orchestrator
 * code path observes a thrown error from this helper.
 */

const FETCH_TIMEOUT_MS = 15_000;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export type UploadedPhoto = {
  url: string;
  assetId: string;
  assetRef: {_type: 'image'; asset: {_ref: string}};
};

export type FailedPhoto = {
  url: string;
  reason: string;
};

export type PhotoUploadResult = {
  uploaded: UploadedPhoto[];
  failed: FailedPhoto[];
};

function inferFilename(url: string): string {
  try {
    const parsed = new URL(url);
    const last = parsed.pathname.split('/').filter(Boolean).pop();
    if (last && last.length > 0) return last;
  } catch {
    // Malformed URL — fall through to fallback.
  }
  return `servicem8-attachment-${Date.now()}.jpg`;
}

function inferContentType(filename: string, fallback: string | null): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (fallback && fallback.startsWith('image/')) return fallback;
  return 'image/jpeg';
}

async function downloadOne(url: string): Promise<
  | {ok: true; buffer: Buffer; filename: string; contentType: string}
  | {ok: false; reason: string}
> {
  let response: Response;
  try {
    response = await fetch(url, {signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)});
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown-fetch-error';
    return {ok: false, reason: `fetch-failed:${message}`};
  }
  if (!response.ok) {
    return {ok: false, reason: `http-${response.status}`};
  }
  const contentLengthHeader = response.headers.get('content-length');
  if (contentLengthHeader) {
    const declared = Number(contentLengthHeader);
    if (Number.isFinite(declared) && declared > MAX_BYTES) {
      return {ok: false, reason: `oversize:declared=${declared}`};
    }
  }
  let arrayBuffer: ArrayBuffer;
  try {
    arrayBuffer = await response.arrayBuffer();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown-read-error';
    return {ok: false, reason: `read-failed:${message}`};
  }
  if (arrayBuffer.byteLength > MAX_BYTES) {
    return {ok: false, reason: `oversize:actual=${arrayBuffer.byteLength}`};
  }
  const buffer = Buffer.from(arrayBuffer);
  const filename = inferFilename(url);
  const contentType = inferContentType(filename, response.headers.get('content-type'));
  return {ok: true, buffer, filename, contentType};
}

export async function uploadJobPhotos(urls: string[]): Promise<PhotoUploadResult> {
  const uploaded: UploadedPhoto[] = [];
  const failed: FailedPhoto[] = [];

  if (urls.length === 0) return {uploaded, failed};

  for (const url of urls) {
    const downloadResult = await downloadOne(url);
    if (!downloadResult.ok) {
      failed.push({url, reason: downloadResult.reason});
      continue;
    }
    try {
      const asset = await writeClient.assets.upload('image', downloadResult.buffer, {
        filename: downloadResult.filename,
        contentType: downloadResult.contentType,
      });
      uploaded.push({
        url,
        assetId: asset._id,
        assetRef: {_type: 'image', asset: {_ref: asset._id}},
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown-upload-error';
      failed.push({url, reason: `upload-failed:${message}`});
    }
  }

  return {uploaded, failed};
}
