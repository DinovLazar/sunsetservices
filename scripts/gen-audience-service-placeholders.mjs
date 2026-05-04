/**
 * Generate Phase 1.09 audience-landing + service-detail image placeholders.
 *
 * Reuses the gradient + per-pixel-noise approach from
 * `gen-home-placeholders.mjs` (Phase 1.07). Lighthouse's LCP picker
 * excludes "low-entropy / placeholder-looking" images; the noise floor
 * is what lifts the hero placeholders into the realistic-photo bucket.
 *
 * Outputs:
 *   src/assets/audience/hero-{residential,commercial,hardscape}.jpg  (16:9, hero LCP)
 *   src/assets/audience/projects/{slug}-{1,2,3}.jpg                  (4:3, audience-landing project tiles)
 *   src/assets/service/hero-{slug}.jpg                               (16:9, service hero LCP, all 16)
 *   src/assets/service/tiles/{slug}.jpg                              (4:3, audience-landing service-tile photos, all 16)
 *   src/assets/service/projects/{imageKey}.jpg                       (4:3, service-detail featured-project tiles)
 *
 * Run with `node scripts/gen-audience-service-placeholders.mjs` from repo root.
 */

import sharp from 'sharp';
import {mkdir} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const AUDIENCE_DIR = resolve(ROOT, 'src', 'assets', 'audience');
const AUDIENCE_PROJECT_DIR = resolve(AUDIENCE_DIR, 'projects');
const SERVICE_DIR = resolve(ROOT, 'src', 'assets', 'service');
const SERVICE_TILE_DIR = resolve(SERVICE_DIR, 'tiles');
const SERVICE_PROJECT_DIR = resolve(SERVICE_DIR, 'projects');

await Promise.all([
  mkdir(AUDIENCE_DIR, {recursive: true}),
  mkdir(AUDIENCE_PROJECT_DIR, {recursive: true}),
  mkdir(SERVICE_DIR, {recursive: true}),
  mkdir(SERVICE_TILE_DIR, {recursive: true}),
  mkdir(SERVICE_PROJECT_DIR, {recursive: true}),
]);

async function gradientJpeg({width, height, topRgb, bottomRgb, outPath, quality = 65, noise = 18}) {
  const channels = 3;
  const buf = Buffer.alloc(width * height * channels);
  let seed = 0x1234_5678 ^ width ^ (height << 8) ^ outPath.length;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let y = 0; y < height; y++) {
    const t = y / Math.max(1, height - 1);
    const baseR = topRgb[0] + (bottomRgb[0] - topRgb[0]) * t;
    const baseG = topRgb[1] + (bottomRgb[1] - topRgb[1]) * t;
    const baseB = topRgb[2] + (bottomRgb[2] - topRgb[2]) * t;
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const jr = (rand() - 0.5) * 2 * noise;
      const jg = (rand() - 0.5) * 2 * noise;
      const jb = (rand() - 0.5) * 2 * noise;
      buf[idx] = Math.max(0, Math.min(255, Math.round(baseR + jr)));
      buf[idx + 1] = Math.max(0, Math.min(255, Math.round(baseG + jg)));
      buf[idx + 2] = Math.max(0, Math.min(255, Math.round(baseB + jb)));
    }
  }
  await sharp(buf, {raw: {width, height, channels}})
    .jpeg({quality, progressive: true, mozjpeg: true})
    .toFile(outPath);
}

// --- Color palettes per audience / service ---------------------------------

// Audience heroes (per §6.1) — golden-hour lighting tuned per audience.
const AUDIENCE_HERO = {
  residential: {top: [180, 198, 142], bot: [50, 80, 42]},
  commercial: {top: [188, 188, 162], bot: [70, 80, 70]},
  hardscape: {top: [212, 156, 90], bot: [70, 50, 36]},
};

// Service hero + tile palettes — keyed to service mood (warm for fire, cool
// for snow, green for lawn, etc.). Each palette doubles for the hero (16:9)
// and the audience-landing tile (4:3).
const SERVICE_PALETTES = {
  // Residential
  'lawn-care': {top: [160, 200, 120], bot: [50, 90, 48]},
  'landscape-design': {top: [184, 210, 152], bot: [70, 110, 64]},
  'tree-services': {top: [124, 168, 120], bot: [44, 80, 56]},
  'sprinkler-systems': {top: [180, 196, 168], bot: [108, 132, 108]},
  'snow-removal': {top: [228, 232, 236], bot: [156, 168, 184]},
  'seasonal-cleanup': {top: [200, 168, 96], bot: [104, 80, 50]},
  // Commercial
  'landscape-maintenance': {top: [168, 184, 144], bot: [88, 96, 80]},
  'commercial-snow-removal': {top: [218, 222, 230], bot: [140, 152, 168]},
  'property-enhancement': {top: [196, 188, 156], bot: [108, 108, 96]},
  'turf-management': {top: [148, 188, 110], bot: [60, 96, 50]},
  // Hardscape
  'patios-walkways': {top: [196, 158, 116], bot: [102, 76, 52]},
  'retaining-walls': {top: [148, 138, 124], bot: [76, 72, 64]},
  'fire-pits-features': {top: [212, 144, 68], bot: [80, 40, 28]},
  'pergolas-pavilions': {top: [188, 152, 108], bot: [88, 64, 44]},
  driveways: {top: [188, 168, 138], bot: [80, 78, 64]},
  'outdoor-kitchens': {top: [200, 162, 116], bot: [88, 64, 48]},
};

// --- Generate audience heroes (3 × 1920×1080) ------------------------------

console.log('Generating audience hero placeholders…');
for (const [audience, palette] of Object.entries(AUDIENCE_HERO)) {
  await gradientJpeg({
    width: 1920,
    height: 1080,
    topRgb: palette.top,
    bottomRgb: palette.bot,
    outPath: resolve(AUDIENCE_DIR, `hero-${audience}.jpg`),
    quality: 78,
    noise: 26,
  });
}

// --- Generate audience project tiles (9 × 4:3 960×720) ---------------------

console.log('Generating audience-landing project tiles…');
const AUDIENCE_PROJECT_TILES = [
  ['residential-1', [180, 200, 130], [70, 100, 60]],
  ['residential-2', [196, 192, 140], [86, 110, 70]],
  ['residential-3', [170, 196, 132], [60, 96, 56]],
  ['commercial-1', [184, 184, 156], [88, 96, 88]],
  ['commercial-2', [196, 196, 188], [104, 116, 116]],
  ['commercial-3', [200, 196, 168], [110, 112, 100]],
  ['hardscape-1', [196, 158, 116], [88, 60, 42]],
  ['hardscape-2', [212, 144, 68], [80, 40, 28]],
  ['hardscape-3', [180, 144, 100], [80, 56, 40]],
];
for (const [name, top, bot] of AUDIENCE_PROJECT_TILES) {
  await gradientJpeg({
    width: 960,
    height: 720,
    topRgb: top,
    bottomRgb: bot,
    outPath: resolve(AUDIENCE_PROJECT_DIR, `${name}.jpg`),
    quality: 60,
  });
}

// --- Generate service heroes (16 × 1920×1080) ------------------------------

console.log('Generating service hero placeholders…');
for (const [slug, palette] of Object.entries(SERVICE_PALETTES)) {
  await gradientJpeg({
    width: 1920,
    height: 1080,
    topRgb: palette.top,
    bottomRgb: palette.bot,
    outPath: resolve(SERVICE_DIR, `hero-${slug}.jpg`),
    quality: 78,
    noise: 26,
  });
}

// --- Generate service tiles for audience-landing services grids (16 × 4:3) -

console.log('Generating service tile placeholders…');
for (const [slug, palette] of Object.entries(SERVICE_PALETTES)) {
  await gradientJpeg({
    width: 960,
    height: 720,
    topRgb: palette.top,
    bottomRgb: palette.bot,
    outPath: resolve(SERVICE_TILE_DIR, `${slug}.jpg`),
    quality: 60,
  });
}

// --- Generate service-detail featured-project tiles (4:3) ------------------

console.log('Generating service-detail project tile placeholders…');
const SERVICE_PROJECTS = [
  // Residential
  'lawn-care-1', 'lawn-care-2',
  'landscape-design-1', 'landscape-design-2', 'landscape-design-3',
  'tree-services-1', 'tree-services-2',
  'sprinkler-systems-1', 'sprinkler-systems-2',
  'snow-removal-1', 'snow-removal-2',
  'seasonal-cleanup-1', 'seasonal-cleanup-2',
  // Commercial
  'landscape-maintenance-1', 'landscape-maintenance-2',
  'commercial-snow-removal-1', 'commercial-snow-removal-2',
  'property-enhancement-1', 'property-enhancement-2',
  'turf-management-1', 'turf-management-2',
  // Hardscape
  'patios-walkways-1', 'patios-walkways-2', 'patios-walkways-3',
  'retaining-walls-1', 'retaining-walls-2',
  'fire-pits-features-1', 'fire-pits-features-2',
  'pergolas-pavilions-1', 'pergolas-pavilions-2',
  'driveways-1', 'driveways-2',
  'outdoor-kitchens-1', 'outdoor-kitchens-2',
];

for (const key of SERVICE_PROJECTS) {
  // Pull the service slug out of the imageKey by stripping the trailing `-N`.
  const slug = key.replace(/-\d+$/, '');
  const palette = SERVICE_PALETTES[slug] ?? {top: [180, 180, 160], bot: [80, 80, 70]};
  await gradientJpeg({
    width: 960,
    height: 720,
    topRgb: palette.top,
    bottomRgb: palette.bot,
    outPath: resolve(SERVICE_PROJECT_DIR, `${key}.jpg`),
    quality: 60,
  });
}

console.log('Done.');
console.log(`  audience:  ${AUDIENCE_DIR}`);
console.log(`  service:   ${SERVICE_DIR}`);
