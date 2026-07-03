/**
 * Phase B-14 — optimize the 6 stock-bridge source photos into web-ready
 * hero + tile derivatives and write them into the live service image
 * pipeline.
 *
 * Source-of-truth archive (READ-ONLY — never written here):
 *   docs/stock-bridge/{waterproofing,trenchless}/stock-{division}-{slug}-hero-01.jpg
 *
 * Outputs (overwrite in place — the script is idempotent; re-running
 * regenerates byte-for-byte identical derivatives from the same sources):
 *   src/assets/service/hero-{slug}.jpg   16:9 center-crop, 2400px wide, q80  (< 400 KB)
 *   src/assets/service/tiles/{slug}.jpg   4:3 center-crop, 1200px wide, q80
 *
 * The 6 slugs map 1:1 to Waterproofing + Trenchless service pages whose
 * imageMap.ts entries (added this phase) resolve by slug. The other 10
 * new-division services stay on their existing placeholders (diagram track).
 *
 * Alt text for each image is authoritative in
 * docs/stock-bridge/stock-image-manifest.md (wired via services.ts photoAlt).
 *
 * Crop focus is per-image adjustable via `heroPosition` / `tilePosition`
 * (sharp `position` — 'centre' by default). Adjust only when a center crop
 * would cut the key subject, verified visually.
 *
 * Run from repo root:  node scripts/optimize-stock-bridge.mjs
 */

import sharp from 'sharp';
import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SRC_DIR = resolve(ROOT, 'docs', 'stock-bridge');
const SERVICE_DIR = resolve(ROOT, 'src', 'assets', 'service');
const SERVICE_TILE_DIR = resolve(SERVICE_DIR, 'tiles');

// Hero = 16:9 @ 2400px wide; Tile = 4:3 @ 1200px wide.
const HERO_W = 2400;
const HERO_H = Math.round((HERO_W * 9) / 16); // 1350
const TILE_W = 1200;
const TILE_H = Math.round((TILE_W * 3) / 4); // 900
const QUALITY = 80; // starting/target quality
const HERO_MAX_BYTES = 400 * 1024; // hard budget (checklist)
const HERO_TARGET_BYTES = 380 * 1024; // "well under 400 KB" safety margin
const QUALITY_FLOOR = 50; // don't degrade heroes past this to chase bytes

/**
 * The 6 stock-bridge services. `division` selects the source subfolder;
 * the source filename is `stock-{division}-{slug}-hero-01.jpg`.
 * `heroPosition` / `tilePosition` default to 'centre'; override per-image
 * only when a center crop cuts the key subject (verified visually).
 */
const ITEMS = [
  {slug: 'gutter-services', division: 'waterproofing'},
  {slug: 'yard-drainage', division: 'waterproofing'},
  {slug: 'foundation-repair', division: 'waterproofing'},
  {slug: 'trenching-excavation', division: 'trenchless'},
  {slug: 'sewer-line-replacement', division: 'trenchless'},
  {slug: 'conduit-installation', division: 'trenchless'},
];

await Promise.all([
  mkdir(SERVICE_DIR, {recursive: true}),
  mkdir(SERVICE_TILE_DIR, {recursive: true}),
]);

/**
 * Encode a center-cropped derivative. When `maxBytes` is set, the JPEG
 * quality steps down from QUALITY (in steps of 2, down to QUALITY_FLOOR)
 * until the encoded size is at or under `maxBytes` — so each image keeps
 * the highest quality its entropy allows within the byte budget.
 *
 * A few sources are pathologically noisy (fine gravel / soil texture) and
 * can't hit budget even at the quality floor without visible blocking. For
 * those, a light Gaussian blur escalates as a last resort: it shaves the
 * high-frequency sensor grain that costs the most bytes but is imperceptible
 * on a scrim-backed hero (and Next re-optimizes to WebP/AVIF at serve time).
 * Most images never blur (sigma stays 0). Fully deterministic: same source +
 * same params → same bytes on every run.
 */
async function derive({srcPath, outPath, width, height, position, maxBytes}) {
  const cropped = sharp(srcPath)
    .rotate() // honor EXIF orientation before cropping
    .resize(width, height, {fit: 'cover', position: position ?? 'centre'});

  const encode = (sigma) => {
    const pipe = cropped.clone();
    if (sigma > 0) pipe.blur(sigma);
    return pipe.jpeg({quality, progressive: true, mozjpeg: true}).toBuffer();
  };

  let quality = QUALITY;
  let sigma = 0;
  let buf = await encode(sigma);

  if (maxBytes) {
    while (buf.length > maxBytes && quality > QUALITY_FLOOR) {
      quality -= 2;
      buf = await encode(sigma);
    }
    // Still over budget at the quality floor → escalate a light blur.
    while (buf.length > maxBytes && sigma < 1.2) {
      sigma = Math.round((sigma + 0.3) * 10) / 10;
      buf = await encode(sigma);
    }
  }

  // Write the exact encoded buffer — do NOT pipe back through sharp().toFile(),
  // which would re-encode with default (non-mozjpeg) settings and inflate size.
  await writeFile(outPath, buf);
  return {size: buf.length, quality, sigma};
}

const fmtKB = (b) => `${(b / 1024).toFixed(0)} KB`;

console.log('Optimizing 6 stock-bridge photos → hero + tile derivatives…\n');
let heroOverBudget = 0;
for (const {slug, division, heroPosition, tilePosition} of ITEMS) {
  const srcPath = resolve(SRC_DIR, division, `stock-${division}-${slug}-hero-01.jpg`);
  const heroPath = resolve(SERVICE_DIR, `hero-${slug}.jpg`);
  const tilePath = resolve(SERVICE_TILE_DIR, `${slug}.jpg`);

  const hero = await derive({
    srcPath,
    outPath: heroPath,
    width: HERO_W,
    height: HERO_H,
    position: heroPosition,
    maxBytes: HERO_TARGET_BYTES,
  });
  const tile = await derive({
    srcPath,
    outPath: tilePath,
    width: TILE_W,
    height: TILE_H,
    position: tilePosition,
  });

  const overBudget = hero.size > HERO_MAX_BYTES;
  if (overBudget) heroOverBudget++;
  const heroBlur = hero.sigma > 0 ? ` blur${hero.sigma}` : '';
  console.log(
    `  ${slug.padEnd(24)} hero ${HERO_W}×${HERO_H} q${hero.quality}${heroBlur} ${fmtKB(hero.size).padStart(7)}` +
      `${overBudget ? '  ⚠ OVER 400KB' : ''}  ·  tile ${TILE_W}×${TILE_H} q${tile.quality} ${fmtKB(tile.size).padStart(7)}`,
  );
}

console.log('\nDone.');
console.log(`  heroes → ${SERVICE_DIR}`);
console.log(`  tiles  → ${SERVICE_TILE_DIR}`);
if (heroOverBudget > 0) {
  console.error(`\n✗ ${heroOverBudget} hero(es) exceed the 400 KB budget — lower QUALITY or check the source.`);
  process.exit(1);
}
