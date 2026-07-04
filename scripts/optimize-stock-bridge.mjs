/**
 * Phase B-14 + B-15 + B-16 — optimize the stock-bridge source photos into
 * web-ready hero + tile derivatives and write them into the live service
 * image pipeline. B-14 wired 6 Waterproofing/Trenchless services; B-15
 * added 4 Snow Removal services plus the /snow-removal/ division-landing
 * hero; B-16 adds 4 Hardscape + 6 Waterproofing + 2 Trenchless services
 * plus the /waterproofing/ and /trenchless/ division-landing heroes.
 *
 * Source-of-truth archive (READ-ONLY — never written here):
 *   docs/stock-bridge/{hardscape,waterproofing,trenchless,snow-removal}/stock-{division}-{slug}-hero-01.jpg
 *
 * Outputs (overwrite in place — the script is idempotent; re-running
 * regenerates byte-for-byte identical derivatives from the same sources):
 *   src/assets/service/hero-{slug}.jpg          16:9 center-crop, 2400px wide, q80  (< 400 KB)
 *   src/assets/service/tiles/{slug}.jpg          4:3 center-crop, 1200px wide, q80
 *   src/assets/division/hero-{division}.jpg     16:9 center-crop, 2400px wide, q80  (< 400 KB) —
 *       division-landing heroes (B-15: snow-removal; B-16: waterproofing,
 *       trenchless); HERO ONLY, no tile derivative.
 *
 * The service slugs map 1:1 to service pages whose imageMap.ts entries
 * resolve by slug (B-14: Waterproofing + Trenchless; B-15: Snow Removal;
 * B-16: Hardscape + the remaining sourced gap services). `sump-pumps`
 * (GAP — no honest free image found) and `missile-boring` (diagram track)
 * stay on their existing placeholders. The pre-existing shared snow assets
 * (hero-snow-removal.jpg, hero-commercial-snow-removal.jpg + their tiles)
 * are NOT touched here — they still serve city-page + blog/resource aliases.
 * The 4 hardscape slugs' ORIGINAL derivatives were preserved under
 * src/assets/service/legacy/ before B-16 first overwrote them (city/project/
 * homepage consumers repointed there — see imageMap.ts).
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
const DIVISION_DIR = resolve(ROOT, 'src', 'assets', 'division');

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
 * The stock-bridge items. `division` selects the source subfolder; the
 * source filename is always `stock-{division}-{slug}-hero-01.jpg`.
 * `heroPosition` / `tilePosition` default to 'centre'; override per-image
 * only when a center crop cuts the key subject (verified visually).
 *
 * B-15 additions:
 *   - 4 Snow Removal service slugs (standard hero + tile, like B-14).
 *   - 1 division-landing item: `heroOut` redirects the hero to the division
 *     asset path and `heroOnly` skips the tile derivative (the landing hero
 *     has no tile surface). Its slug 'division-landing' still resolves the
 *     source via the standard naming convention.
 */
const ITEMS = [
  {slug: 'gutter-services', division: 'waterproofing'},
  {slug: 'yard-drainage', division: 'waterproofing'},
  {slug: 'foundation-repair', division: 'waterproofing'},
  {slug: 'trenching-excavation', division: 'trenchless'},
  {slug: 'sewer-line-replacement', division: 'trenchless'},
  {slug: 'conduit-installation', division: 'trenchless'},
  // Phase B-15 — Snow Removal bridge photos (real, replace-by 2027-01-31).
  {slug: 'de-icing', division: 'snow-removal'},
  {slug: 'sidewalk-shoveling', division: 'snow-removal'},
  {slug: 'driveway-snow-removal', division: 'snow-removal'},
  {slug: 'commercial-snow-plowing', division: 'snow-removal'},
  // /snow-removal/ division-landing hero — hero only, no tile.
  {
    slug: 'division-landing',
    division: 'snow-removal',
    heroOut: resolve(DIVISION_DIR, 'hero-snow-removal.jpg'),
    heroOnly: true,
  },
  // Phase B-16 — Hardscape + gap-services bridge photos (real, replace-by
  // 2026-10-01). The 4 hardscape slugs overwrite their placeholder
  // derivatives in place (originals preserved in src/assets/service/legacy/).
  // Two sourced B-16 photos are deliberately ABSENT: the trenchless
  // division-landing hero (readable "BARANGAY AYALA ALABANG" shirt print)
  // and handhole-pull-box (readable Russian signage) failed Code-phase
  // verification — never-acceptable readable/geolocating text; see the
  // Decisions log. Their pages keep their previous imagery.
  {slug: 'retaining-walls', division: 'hardscape'},
  {slug: 'fire-pits-features', division: 'hardscape'},
  {slug: 'driveways', division: 'hardscape'},
  {slug: 'outdoor-kitchens', division: 'hardscape'},
  {slug: 'basement-waterproofing', division: 'waterproofing'},
  {slug: 'window-wells', division: 'waterproofing'},
  {slug: 'crawl-spaces', division: 'waterproofing'},
  {slug: 'concrete-raising', division: 'waterproofing'},
  {slug: 'humidity-control', division: 'waterproofing'},
  {slug: 'radon-mitigation', division: 'waterproofing'},
  {slug: 'pipe-fusing', division: 'trenchless'},
  // /waterproofing/ division-landing hero — hero only, no tile.
  {
    slug: 'division-landing',
    division: 'waterproofing',
    heroOut: resolve(DIVISION_DIR, 'hero-waterproofing.jpg'),
    heroOnly: true,
  },
];

await Promise.all([
  mkdir(SERVICE_DIR, {recursive: true}),
  mkdir(SERVICE_TILE_DIR, {recursive: true}),
  mkdir(DIVISION_DIR, {recursive: true}),
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

console.log(`Optimizing ${ITEMS.length} stock-bridge photos → hero + tile derivatives…\n`);
let heroOverBudget = 0;
for (const {slug, division, heroPosition, tilePosition, heroOut, heroOnly} of ITEMS) {
  const srcPath = resolve(SRC_DIR, division, `stock-${division}-${slug}-hero-01.jpg`);
  const heroPath = heroOut ?? resolve(SERVICE_DIR, `hero-${slug}.jpg`);

  const hero = await derive({
    srcPath,
    outPath: heroPath,
    width: HERO_W,
    height: HERO_H,
    position: heroPosition,
    maxBytes: HERO_TARGET_BYTES,
  });
  const tile = heroOnly
    ? null
    : await derive({
        srcPath,
        outPath: resolve(SERVICE_TILE_DIR, `${slug}.jpg`),
        width: TILE_W,
        height: TILE_H,
        position: tilePosition,
      });

  const overBudget = hero.size > HERO_MAX_BYTES;
  if (overBudget) heroOverBudget++;
  const heroBlur = hero.sigma > 0 ? ` blur${hero.sigma}` : '';
  const tileMsg = tile
    ? `  ·  tile ${TILE_W}×${TILE_H} q${tile.quality} ${fmtKB(tile.size).padStart(7)}`
    : '  ·  (hero-only, no tile)';
  console.log(
    `  ${slug.padEnd(24)} hero ${HERO_W}×${HERO_H} q${hero.quality}${heroBlur} ${fmtKB(hero.size).padStart(7)}` +
      `${overBudget ? '  ⚠ OVER 400KB' : ''}${tileMsg}`,
  );
}

console.log('\nDone.');
console.log(`  heroes → ${SERVICE_DIR}`);
console.log(`  tiles  → ${SERVICE_TILE_DIR}`);
console.log(`  division hero → ${DIVISION_DIR}`);
if (heroOverBudget > 0) {
  console.error(`\n✗ ${heroOverBudget} hero(es) exceed the 400 KB budget — lower QUALITY or check the source.`);
  process.exit(1);
}
