import {NextResponse} from 'next/server';
import {writeClient} from '@sanity-lib/write-client';
import {checkRateLimit} from '@/lib/chat/rateLimit';
import {getClientIp} from '@/lib/chat/getIp';
import {
  PHOTO_ALLOWED_MIME,
  PHOTO_MAX_COUNT,
  mimeToExtension,
  sniffPhotoMime,
  validatePhotoSize,
} from '@/lib/quote/photoValidation';
import {safeLogMeta} from '@/lib/logging/safeError';

/**
 * POST /api/quote/photo-upload — wizard Step 3 photo widget (Phase B.11).
 *
 * Multipart/form-data with two fields:
 *   - `file`: File   — the image (JPEG / PNG / HEIC / WebP, ≤ 10 MB)
 *   - `sessionId`: string (UUID v4) — links to the partial-lead breadcrumb
 *
 * Seven-stage guard chain per D14/D16:
 *   1. Feature flag (`WIZARD_PHOTO_UPLOAD_ENABLED`) — 503 + simulated when off
 *   2. Rate limit (chat KV piggyback, scope `'photo-upload'`) — 429 + Retry-After
 *   3. Multipart parse + presence check
 *   4. SessionId UUID validation
 *   5. Size cap (10 MB per D3)
 *   6. Magic-bytes MIME sniff (D6/D18) — trust the BYTES, not Content-Type
 *   7. Aggregate count cap (10 photos per session per D3) — GROQ-query the
 *      quoteLeadPartial doc for this session and count its `photos[]`
 *
 * Success: 200 + {status:'ok', assetId, url, dimensions, originalName, contentType}
 * Failures: opaque body `{status:'error', reason:'<short>'}` — never echoes
 * raw error or Sanity error text. Internal details land in server logs via
 * safeLogMeta() per Phase 2.13 convention.
 */

const ENABLED = process.env.WIZARD_PHOTO_UPLOAD_ENABLED === 'true';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ErrorReason =
  | 'invalid-payload'
  | 'too-large'
  | 'wrong-type'
  | 'too-many'
  | 'upload-failed';

function errorResponse(status: number, reason: ErrorReason): NextResponse {
  return NextResponse.json({status: 'error', reason}, {status});
}

export async function POST(request: Request) {
  // ---------- 1. Feature flag ----------
  if (!ENABLED) {
    return NextResponse.json(
      {status: 'simulated', reason: 'feature-flag'},
      {status: 503},
    );
  }

  // ---------- 2. Rate limit ----------
  const ip = getClientIp(request.headers);
  const rl = await checkRateLimit(ip, 'photo-upload');
  if (!rl.allowed) {
    return NextResponse.json(
      {status: 'rate-limited', reason: rl.reason},
      {status: 429, headers: {'Retry-After': String(rl.retryAfter)}},
    );
  }

  // ---------- 3. Multipart parse ----------
  let form: FormData;
  try {
    form = await request.formData();
  } catch (err) {
    console.info('[photo-upload] multipart parse failed', safeLogMeta('quote-photo-upload', err));
    return errorResponse(400, 'invalid-payload');
  }

  const file = form.get('file');
  const sessionIdRaw = form.get('sessionId');

  if (!(file instanceof File) || file.size === 0) {
    return errorResponse(400, 'invalid-payload');
  }
  if (typeof sessionIdRaw !== 'string' || !UUID_V4_RE.test(sessionIdRaw)) {
    return errorResponse(400, 'invalid-payload');
  }
  const sessionId = sessionIdRaw;

  // ---------- 5. Size cap ----------
  if (!validatePhotoSize(file.size)) {
    return errorResponse(400, 'too-large');
  }

  // ---------- 6. Magic-bytes MIME sniff ----------
  let buffer: Buffer;
  try {
    buffer = Buffer.from(await file.arrayBuffer());
  } catch (err) {
    console.info('[photo-upload] arrayBuffer failed', safeLogMeta('quote-photo-upload', err));
    return errorResponse(400, 'invalid-payload');
  }
  const sniffed = sniffPhotoMime(buffer);
  if (!sniffed) {
    return errorResponse(400, 'wrong-type');
  }

  // Defense-in-depth: the multipart Content-Type SHOULD agree with the sniff,
  // but we trust ONLY the sniff. (Client UI also pre-filters by `accept=`.)
  if (!PHOTO_ALLOWED_MIME.includes(sniffed)) {
    return errorResponse(400, 'wrong-type');
  }

  // ---------- 7. Aggregate count cap ----------
  // Inspect the partial-lead doc for this session BEFORE accepting the
  // upload. If absent → count 0. If present → use its photos.length. D3
  // requires the SERVER-side cap (client mirror is purely UX).
  try {
    const existingCount = await writeClient.fetch<number>(
      `count(*[_id == $id][0].photos)`,
      {id: `quoteLeadPartial-${sessionId}`},
    );
    if (typeof existingCount === 'number' && existingCount >= PHOTO_MAX_COUNT) {
      return errorResponse(400, 'too-many');
    }
  } catch (err) {
    console.info(
      '[photo-upload] aggregate count fetch failed (fail-open)',
      safeLogMeta('quote-photo-upload', err),
    );
    // Fail-open: a transient Sanity blip shouldn't block uploads. The
    // wizard's client-side guard also enforces the cap; this is the
    // backstop, not the only line.
  }

  // ---------- 8. Sanity asset upload ----------
  const ext = mimeToExtension(sniffed);
  const filename = `quote-photo-${globalThis.crypto.randomUUID()}.${ext}`;
  try {
    const asset = await writeClient.assets.upload('image', buffer, {
      filename,
      contentType: sniffed,
    });
    const width = asset.metadata?.dimensions?.width ?? 0;
    const height = asset.metadata?.dimensions?.height ?? 0;
    return NextResponse.json(
      {
        status: 'ok',
        assetId: asset._id,
        url: asset.url,
        dimensions: {width, height},
        originalName: file.name,
        contentType: sniffed,
      },
      {status: 200},
    );
  } catch (err) {
    console.error(
      '[photo-upload] sanity upload failed',
      safeLogMeta('quote-photo-upload', err),
    );
    return errorResponse(500, 'upload-failed');
  }
}
