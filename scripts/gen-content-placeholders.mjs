/**
 * Generate Phase 1.18 Resources + Blog placeholder images.
 *
 * Outputs:
 *   public/images/resources/{slug}.jpg               (16:9, 1280×720, ~150KB)
 *   public/images/blog/{slug}.jpg                    (16:9, 1280×720, ~200KB)
 *   public/images/blog/{slug}-mobile.jpg             (4:3, 800×600, ~120KB)
 *   public/images/resources/placeholder.jpg          (fallback)
 *
 * Reuses the gradient + per-pixel-noise approach from
 * `gen-audience-service-placeholders.mjs` (Phase 1.09). Each entry gets a
 * deterministic seed from the slug so re-runs produce stable bytes.
 *
 * Run with `node scripts/gen-content-placeholders.mjs` from repo root.
 */

import sharp from 'sharp';
import {mkdir} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const RESOURCE_DIR = resolve(ROOT, 'public', 'images', 'resources');
const BLOG_DIR = resolve(ROOT, 'public', 'images', 'blog');

await Promise.all([
  mkdir(RESOURCE_DIR, {recursive: true}),
  mkdir(BLOG_DIR, {recursive: true}),
]);

function hashSeed(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h >>> 0;
}

async function gradientJpeg({
  width,
  height,
  topRgb,
  bottomRgb,
  outPath,
  seed = 0,
  quality = 75,
  noise = 14,
}) {
  const channels = 3;
  const buf = Buffer.alloc(width * height * channels);
  let s = (seed | 0x1234_5678) >>> 0 || 0x1234_5678;
  const rand = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
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

// Color palettes per content slug — picked by category mood.
const RESOURCE_PALETTES = {
  'patio-materials-guide': {top: [196, 162, 124], bot: [88, 72, 56]},
  'how-to-choose-a-landscaper': {top: [164, 188, 152], bot: [80, 100, 80]},
  'lawn-care-glossary': {top: [156, 196, 116], bot: [56, 96, 50]},
  'snow-service-levels-for-pms': {top: [220, 226, 232], bot: [128, 144, 162]},
  'dupage-hardscape-permits': {top: [188, 184, 168], bot: [108, 108, 96]},
};

const BLOG_PALETTES = {
  'dupage-patio-cost-2026': {top: [212, 158, 96], bot: [80, 60, 44]},
  'aurora-spring-lawn-calendar': {top: [180, 210, 140], bot: [60, 100, 56]},
  'why-unilock-premium-pavers': {top: [196, 158, 116], bot: [104, 76, 52]},
  'snow-for-commercial-properties': {top: [216, 224, 232], bot: [120, 138, 158]},
  'sprinkler-tune-up-7-signs': {top: [184, 200, 188], bot: [88, 132, 124]},
};

const PLACEHOLDER = {top: [200, 192, 168], bot: [120, 116, 104]};

console.log('▶ Generating resource thumbnails…');
for (const [slug, palette] of Object.entries(RESOURCE_PALETTES)) {
  const out = resolve(RESOURCE_DIR, `${slug}.jpg`);
  await gradientJpeg({
    width: 1280,
    height: 720,
    topRgb: palette.top,
    bottomRgb: palette.bot,
    outPath: out,
    seed: hashSeed(slug),
  });
  console.log(`   ${slug}.jpg`);
}
await gradientJpeg({
  width: 1280,
  height: 720,
  topRgb: PLACEHOLDER.top,
  bottomRgb: PLACEHOLDER.bot,
  outPath: resolve(RESOURCE_DIR, 'placeholder.jpg'),
  seed: hashSeed('placeholder'),
});
console.log('   placeholder.jpg');

console.log('▶ Generating blog featured images (desktop + mobile)…');
for (const [slug, palette] of Object.entries(BLOG_PALETTES)) {
  await gradientJpeg({
    width: 1280,
    height: 720,
    topRgb: palette.top,
    bottomRgb: palette.bot,
    outPath: resolve(BLOG_DIR, `${slug}.jpg`),
    seed: hashSeed(slug),
  });
  await gradientJpeg({
    width: 800,
    height: 600,
    topRgb: palette.top,
    bottomRgb: palette.bot,
    outPath: resolve(BLOG_DIR, `${slug}-mobile.jpg`),
    seed: hashSeed(`${slug}-mobile`),
  });
  console.log(`   ${slug}.jpg + ${slug}-mobile.jpg`);
}

console.log('Done.');
