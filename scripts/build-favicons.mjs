/**
 * Phase M.10e Fix 2 — generate the Sunset Services favicon set.
 *
 * Source: `src/assets/brand/logo-horizontal-fullcolor.png` (2000 × 537,
 * RGBA). The leftmost square (537 × 537) carries the circular sun-over-
 * paver mark, which is what we want as the icon — the wordmark on the
 * right squashes unreadably at 16 px. We crop the leftmost square out of
 * the source, then derive three deliverables Next.js' App Router picks up
 * automatically by filename convention:
 *
 *  - `src/app/icon.png`       — 512×512, transparent background. Next
 *                               emits `<link rel="icon" href="/icon.png">`.
 *  - `src/app/apple-icon.png` — 180×180, opaque cream-tinted background
 *                               (iOS deliberately ignores transparency on
 *                               apple-touch-icon and would otherwise show
 *                               the system black behind the mark).
 *  - `src/app/favicon.ico`    — multi-size ICO (16 + 32 + 48). Encoded
 *                               manually so we don't take a dev-only
 *                               dependency on `png-to-ico`.
 *
 * Run: `node scripts/build-favicons.mjs`
 */

import {readFile, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const SOURCE = resolve(ROOT, 'src/assets/brand/logo-horizontal-fullcolor.png');
const OUT_ICON = resolve(ROOT, 'src/app/icon.png');
const OUT_APPLE = resolve(ROOT, 'src/app/apple-icon.png');
const OUT_ICO = resolve(ROOT, 'src/app/favicon.ico');

/** Cream tint behind the apple-touch-icon — matches `--color-bg` from the
 *  homepage cream alternation. iOS ignores PNG alpha on apple-touch-icon
 *  so this lands as the visible backdrop on the iOS home screen. */
const APPLE_BG = {r: 250, g: 247, b: 241, alpha: 1};

/**
 * Pixel-scan-derived bounding box for the circular mark inside the
 * horizontal logo. Established by sampling columns:
 *   - First majority-orange column (wordmark "S"): x = 523
 *   - Largest transparent gap in first 700px:     x ∈ [486, 508]
 * The circular mark therefore ends at x = 485. Extract width 486 captures
 * the circle without any wordmark fragment. If the source logo file is
 * ever replaced and these positions shift, re-run the column scan in
 * `scripts/build-favicons.mjs` history or by hand.
 */
const MARK_RIGHT_EDGE = 486;

async function buildSquareSource() {
  const meta = await sharp(SOURCE).metadata();
  if (!meta.width || !meta.height) {
    throw new Error(`Could not read dimensions of ${SOURCE}`);
  }
  const cropW = MARK_RIGHT_EDGE;
  const cropH = meta.height; // 537
  // Step 1: extract just the circular mark (avoid the wordmark to the right).
  const markStrip = await sharp(SOURCE)
    .extract({left: 0, top: 0, width: cropW, height: cropH})
    .png()
    .toBuffer();

  // Step 2: trim transparent padding around the mark so it fills its
  // bounding box tightly before we downscale.
  let trimmed;
  try {
    trimmed = await sharp(markStrip)
      .trim({background: {r: 0, g: 0, b: 0, alpha: 0}, threshold: 1})
      .png()
      .toBuffer();
  } catch (e) {
    // If nothing to trim (no transparent border) sharp throws; fall back
    // to the un-trimmed strip — the mark already fills the source.
    trimmed = markStrip;
  }

  const trimmedMeta = await sharp(trimmed).metadata();
  if (!trimmedMeta.width || !trimmedMeta.height) {
    throw new Error('Could not measure trimmed mark');
  }
  // Step 3: re-pad to a square canvas so the favicon renders centered at
  // any size (16/32/48/180/512 etc).
  const side = Math.max(trimmedMeta.width, trimmedMeta.height);
  return sharp({
    create: {
      width: side,
      height: side,
      channels: 4,
      background: {r: 0, g: 0, b: 0, alpha: 0},
    },
  })
    .composite([
      {
        input: trimmed,
        gravity: 'center',
      },
    ])
    .png()
    .toBuffer();
}

/** Encode a multi-size ICO from N PNG buffers (16, 32, 48). The ICO header
 *  is 6 bytes; each directory entry is 16 bytes; PNG payloads follow. ICO
 *  natively accepts PNG-encoded images (Vista+ format) which every modern
 *  browser reads. */
function encodeIco(pngBuffers) {
  const count = pngBuffers.length;
  const HEADER = 6;
  const ENTRY = 16;
  const dirSize = HEADER + ENTRY * count;
  const totalSize = dirSize + pngBuffers.reduce((sum, b) => sum + b.byteLength, 0);
  const out = Buffer.alloc(totalSize);
  // ICONDIR
  out.writeUInt16LE(0, 0); // reserved
  out.writeUInt16LE(1, 2); // type: 1 = ICO
  out.writeUInt16LE(count, 4);

  let offset = dirSize;
  pngBuffers.forEach((png, i) => {
    const meta = readPngSize(png);
    const w = meta.width >= 256 ? 0 : meta.width; // 256 is encoded as 0
    const h = meta.height >= 256 ? 0 : meta.height;
    const base = HEADER + i * ENTRY;
    out[base + 0] = w;
    out[base + 1] = h;
    out[base + 2] = 0; // palette
    out[base + 3] = 0; // reserved
    out.writeUInt16LE(1, base + 4); // color planes
    out.writeUInt16LE(32, base + 6); // bits per pixel
    out.writeUInt32LE(png.byteLength, base + 8);
    out.writeUInt32LE(offset, base + 12);
    png.copy(out, offset);
    offset += png.byteLength;
  });
  return out;
}

/** Tiny PNG IHDR reader — `sharp().metadata()` is async so we read the
 *  fixed offsets directly to keep the ICO encode synchronous. */
function readPngSize(buf) {
  // IHDR starts at byte 16: width (4B BE), height (4B BE).
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
  };
}

async function main() {
  console.log(`Source: ${SOURCE}`);
  const squarePng = await buildSquareSource();
  const squareMeta = await sharp(squarePng).metadata();
  console.log(`Square source: ${squareMeta.width}×${squareMeta.height}`);

  // icon.png — 512 with transparent bg
  await sharp(squarePng)
    .resize(512, 512, {fit: 'contain', background: {r: 0, g: 0, b: 0, alpha: 0}})
    .png()
    .toFile(OUT_ICON);
  console.log(`Wrote ${OUT_ICON}`);

  // apple-icon.png — 180 with cream opaque bg, padded a touch so the mark
  // doesn't bleed to the rounded corners iOS applies.
  await sharp(squarePng)
    .resize(160, 160, {fit: 'contain', background: {r: 0, g: 0, b: 0, alpha: 0}})
    .extend({top: 10, bottom: 10, left: 10, right: 10, background: APPLE_BG})
    .flatten({background: APPLE_BG})
    .png()
    .toFile(OUT_APPLE);
  console.log(`Wrote ${OUT_APPLE}`);

  // favicon.ico — multi-size 16/32/48 PNG-encoded
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(
    sizes.map((size) =>
      sharp(squarePng)
        .resize(size, size, {fit: 'contain', background: {r: 0, g: 0, b: 0, alpha: 0}})
        .png()
        .toBuffer(),
    ),
  );
  const ico = encodeIco(pngs);
  await writeFile(OUT_ICO, ico);
  console.log(`Wrote ${OUT_ICO} (${sizes.join('/')}px multi-size)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
