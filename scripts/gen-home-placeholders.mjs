/**
 * Generate Phase 1.07 home-page image placeholders.
 *
 * The real photos are sourced from Erick's Drive in Phase 2.04. These
 * placeholders exist so the page composes correctly, the LCP target
 * has something realistic-sized to measure, and Lighthouse runs honest.
 *
 * Each placeholder is a programmatic gradient — never a real Sunset
 * Services job photo. Bands (top-light → bottom-dark) are tuned for
 * the gradient overlay used on the hero (handover §3.4).
 *
 * Run with `node scripts/gen-home-placeholders.mjs` from the repo root.
 */

import sharp from 'sharp';
import {mkdir} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'src', 'assets', 'home');

await mkdir(OUT, {recursive: true});

/**
 * Build a JPEG with a top→bottom band gradient PLUS per-pixel chroma noise
 * using `sharp`'s raw-pixel ingestion. The noise is critical: Lighthouse's
 * LCP picker excludes "low-entropy / placeholder-looking" images, so a
 * smooth gradient at low file size gets disqualified as the LCP candidate.
 * Adding ~±18 RGB jitter per channel lifts the JPEG entropy enough that
 * Lighthouse treats this as a real photograph.
 */
async function gradientJpeg({
  width,
  height,
  topRgb,
  bottomRgb,
  outPath,
  quality = 70,
  noise = 18,
}) {
  const channels = 3;
  const buf = Buffer.alloc(width * height * channels);
  // Deterministic LCG so the output is reproducible across runs.
  let seed = 0x1234_5678 ^ width ^ (height << 8);
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

const HERO_TOP = [180, 145, 95]; // warm sky / golden hour
const HERO_BOTTOM = [40, 50, 35]; // dark plantings (so bottom 60% is naturally low-key)

const tiles = [
  // Audience tiles — 4:3, generous gradient, ≤80KB target
  {name: 'audience-residential', w: 960, h: 720, top: [148, 178, 110], bot: [60, 92, 50], q: 60},
  {name: 'audience-commercial', w: 960, h: 720, top: [178, 168, 138], bot: [80, 78, 64], q: 60},
  {name: 'audience-hardscape', w: 960, h: 720, top: [200, 160, 116], bot: [82, 60, 40], q: 60},

  // Service tiles — 1:1, smaller; ≤50KB each
  {name: 'service-lawn-care', w: 720, h: 720, top: [140, 184, 100], bot: [56, 96, 48], q: 55},
  {name: 'service-patios', w: 720, h: 720, top: [196, 158, 116], bot: [102, 76, 52], q: 55},
  {name: 'service-walls', w: 720, h: 720, top: [148, 138, 124], bot: [76, 72, 64], q: 55},
  {name: 'service-design', w: 720, h: 720, top: [156, 188, 128], bot: [68, 96, 56], q: 55},
  {name: 'service-trees', w: 720, h: 720, top: [124, 168, 120], bot: [44, 80, 56], q: 55},
  {name: 'service-sprinklers', w: 720, h: 720, top: [180, 196, 168], bot: [108, 132, 108], q: 55},
  {name: 'service-snow', w: 720, h: 720, top: [228, 232, 236], bot: [156, 168, 184], q: 55},
  {name: 'service-kitchens', w: 720, h: 720, top: [188, 152, 108], bot: [88, 64, 44], q: 55},
  {name: 'service-fire', w: 720, h: 720, top: [212, 144, 68], bot: [80, 40, 28], q: 55},

  // Project tiles — 4:3, ≤80KB
  {name: 'project-1-naperville-patio', w: 960, h: 720, top: [192, 156, 116], bot: [92, 68, 48], q: 60},
  {name: 'project-2-wheaton-lawn', w: 960, h: 720, top: [148, 184, 116], bot: [60, 92, 52], q: 60},
  {name: 'project-3-aurora-hoa', w: 960, h: 720, top: [168, 174, 156], bot: [88, 96, 88], q: 60},
  {name: 'project-4-glen-ellyn-fire', w: 960, h: 720, top: [216, 148, 80], bot: [80, 40, 28], q: 60},
  {name: 'project-5-lisle-wall', w: 960, h: 720, top: [148, 138, 124], bot: [76, 72, 64], q: 60},
  {name: 'project-6-warrenville-garden', w: 960, h: 720, top: [156, 188, 128], bot: [68, 96, 56], q: 60},

  // About teaser portrait — 4:5 desktop crop (also serves mobile 1:1 via objectFit)
  {name: 'about-portrait', w: 800, h: 1000, top: [196, 168, 128], bot: [88, 72, 52], q: 65},
];

console.log('Generating hero + tile placeholders…');

await gradientJpeg({
  width: 1920,
  height: 1080,
  topRgb: HERO_TOP,
  bottomRgb: HERO_BOTTOM,
  outPath: resolve(OUT, 'hero.jpg'),
  quality: 82,
  // The hero is the LCP candidate. Lighthouse rejects "low-entropy /
  // placeholder" images, so this gets a more aggressive noise floor than
  // the smaller tiles to land in the realistic-photo bucket.
  noise: 28,
});

for (const t of tiles) {
  await gradientJpeg({
    width: t.w,
    height: t.h,
    topRgb: t.top,
    bottomRgb: t.bot,
    outPath: resolve(OUT, `${t.name}.jpg`),
    quality: t.q,
  });
}

console.log('Done. Files in', OUT);
