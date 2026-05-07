/**
 * Generate Phase 1.12 About-page image placeholders.
 *
 * Reuses the gradient + per-pixel-noise approach from
 * `gen-home-placeholders.mjs` (Phase 1.07) and
 * `gen-audience-service-placeholders.mjs` (Phase 1.09). Lighthouse's LCP
 * picker excludes "low-entropy / placeholder-looking" images; the noise
 * floor is what lifts the hero placeholder into the realistic-photo bucket.
 *
 * Outputs:
 *   src/assets/about/hero.jpg               (16:9, hero LCP, ~1920×1080)
 *   src/assets/about/brand-story.jpg        (4:5 portrait, 800×1000)
 *   src/assets/about/team-erick.jpg         (4:5 portrait, 720×900)
 *   src/assets/about/team-nick.jpg          (4:5 portrait, 720×900)
 *   src/assets/about/team-marcin.jpg        (4:5 portrait, 720×900)
 *
 * Run with `node scripts/gen-about-placeholders.mjs` from repo root.
 *
 * Real photos arrive in Phase 2.04 (Cowork sourcing from Erick's Drive).
 */

import sharp from 'sharp';
import {mkdir} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ABOUT_DIR = resolve(ROOT, 'src', 'assets', 'about');

await mkdir(ABOUT_DIR, {recursive: true});

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

console.log('Generating About hero placeholder (16:9)…');
await gradientJpeg({
  width: 1920,
  height: 1080,
  topRgb: [220, 168, 100],
  bottomRgb: [76, 56, 40],
  outPath: resolve(ABOUT_DIR, 'hero.jpg'),
  quality: 78,
  noise: 26,
});

console.log('Generating About brand-story placeholder (4:5)…');
await gradientJpeg({
  width: 800,
  height: 1000,
  topRgb: [196, 168, 124],
  bottomRgb: [80, 64, 48],
  outPath: resolve(ABOUT_DIR, 'brand-story.jpg'),
  quality: 70,
  noise: 22,
});

const TEAM = [
  ['team-erick', [188, 162, 124], [80, 60, 44]],
  ['team-nick', [196, 184, 152], [88, 76, 60]],
  ['team-marcin', [180, 152, 116], [76, 56, 40]],
];
console.log('Generating About team-card placeholders (4:5)…');
for (const [name, top, bot] of TEAM) {
  await gradientJpeg({
    width: 720,
    height: 900,
    topRgb: top,
    bottomRgb: bot,
    outPath: resolve(ABOUT_DIR, `${name}.jpg`),
    quality: 68,
    noise: 22,
  });
}

console.log('Done.');
