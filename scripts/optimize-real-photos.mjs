/**
 * Phase Polish-02 — optimize REAL Sunset project photos into web-ready
 * hero + tile derivatives, mirroring scripts/optimize-stock-bridge.mjs
 * conventions (16:9 hero + 4:3 tile, mozjpeg, adaptive quality to keep
 * every hero < 400 KB, deterministic/idempotent output).
 *
 * Source-of-truth archive (READ-ONLY — never written here):
 *   docs/photos/real/{division}/{name}.jpg   — operator-supplied originals
 *   (manifest: docs/photos/real/manifest.md)
 *
 * Outputs (overwrite in place):
 *   src/assets/service/hero-{slug}.jpg       16:9 center-crop
 *   src/assets/service/tiles/{slug}.jpg       4:3 center-crop, 1200px wide
 *
 * UPSCALE RULE — the deliberate deviation from the 2400px stock standard:
 * some operator originals arrive below full resolution (the fire-pit photo
 * is 1142×846; the full-res original has been requested). A real project
 * photo still beats stock, so we ship it — but never upscale beyond ~1.5×
 * (Lanczos3 resampling). Each item declares `heroWidth` accordingly and is
 * flagged "replace with full-res original when supplied" in the manifest.
 * When the full-res file lands, drop it into docs/photos/real/, raise
 * `heroWidth` to 2400, and re-run.
 *
 * Run from repo root:  node scripts/optimize-real-photos.mjs
 */

import sharp from 'sharp';
import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SRC_DIR = resolve(ROOT, 'docs', 'photos', 'real');
const SERVICE_DIR = resolve(ROOT, 'src', 'assets', 'service');
const SERVICE_TILE_DIR = resolve(SERVICE_DIR, 'tiles');

const TILE_W = 1200;
const TILE_H = 900; // 4:3
const QUALITY = 80;
const HERO_TARGET_BYTES = 380 * 1024; // "well under 400 KB" safety margin
const QUALITY_FLOOR = 50;

/**
 * Real-photo items. `division` selects the source subfolder; `src` is the
 * archived original's filename; `slug` keys the service derivatives.
 * `heroWidth` obeys the ≤1.5× upscale rule against the source width.
 */
const ITEMS = [
  {
    // Operator-supplied real project photo (Google Drive
    // "Firepit with wall pillars & lighting .JPG", 1142×846) — reduced-res;
    // full-res original requested. 1600px hero = 1.40× upscale (≤1.5×).
    slug: 'fire-pits-features',
    division: 'hardscape',
    src: 'firepit-wall-pillars-lighting.jpg',
    heroWidth: 1600,
  },
];

await mkdir(SERVICE_TILE_DIR, {recursive: true});

/** Same adaptive-quality encode as optimize-stock-bridge.mjs. */
async function derive({srcPath, outPath, width, height, position, maxBytes}) {
  const cropped = sharp(srcPath)
    .rotate() // honor EXIF orientation before cropping
    .resize(width, height, {fit: 'cover', position: position ?? 'centre'});

  const encode = () =>
    cropped.clone().jpeg({quality, progressive: true, mozjpeg: true}).toBuffer();

  let quality = QUALITY;
  let buf = await encode();
  if (maxBytes) {
    while (buf.length > maxBytes && quality > QUALITY_FLOOR) {
      quality -= 2;
      buf = await encode();
    }
  }
  // Write the exact encoded buffer — never re-encode through sharp().toFile().
  await writeFile(outPath, buf);
  return {size: buf.length, quality};
}

const fmtKB = (b) => `${(b / 1024).toFixed(0)} KB`;

console.log(`Optimizing ${ITEMS.length} real photo(s) → hero + tile derivatives…\n`);
for (const {slug, division, src, heroWidth, heroPosition, tilePosition} of ITEMS) {
  const srcPath = resolve(SRC_DIR, division, src);
  const heroH = Math.round((heroWidth * 9) / 16);

  const hero = await derive({
    srcPath,
    outPath: resolve(SERVICE_DIR, `hero-${slug}.jpg`),
    width: heroWidth,
    height: heroH,
    position: heroPosition,
    maxBytes: HERO_TARGET_BYTES,
  });
  const tile = await derive({
    srcPath,
    outPath: resolve(SERVICE_TILE_DIR, `${slug}.jpg`),
    width: TILE_W,
    height: TILE_H,
    position: tilePosition,
  });
  console.log(
    `  ${slug}: hero ${heroWidth}×${heroH} q${hero.quality} ${fmtKB(hero.size)} · ` +
      `tile ${TILE_W}×${TILE_H} q${tile.quality} ${fmtKB(tile.size)}`,
  );
}
console.log('\nDone.');
