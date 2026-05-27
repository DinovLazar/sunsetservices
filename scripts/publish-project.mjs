/**
 * Targeted single-project publisher.
 *
 * Publishes ONE project document to Sanity from the canonical TS source
 * (`src/data/projects.ts`). Created to restore `/projects/aurora-driveway-apron`,
 * which 404'd because the project existed in the code file but was not present
 * as a published document in the Sanity `production` dataset.
 *
 * This script is a deliberately narrow slice of `scripts/seed-sanity.mjs`:
 * it reuses the exact same client setup, helper functions, _id scheme
 * (`project-<slug>`), and document shape, so the published document is
 * identical to what a full seed run would produce. It touches ONLY the one
 * project you name — no other documents are read, written, or deleted.
 *
 * Run via:   npx tsx scripts/publish-project.mjs
 *            npx tsx scripts/publish-project.mjs --slug=some-other-project
 *
 * Requires:  SANITY_API_WRITE_TOKEN + NEXT_PUBLIC_SANITY_* in .env.local
 *            (the same credentials the seed script uses).
 */

import {readFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createClient} from '@sanity/client';

// ---------- which project to publish ----------
const DEFAULT_SLUG = 'aurora-driveway-apron';
const slugArg = (process.argv.find((a) => a.startsWith('--slug=')) || '').slice('--slug='.length);
const TARGET_SLUG = slugArg || DEFAULT_SLUG;

// ---------- env loader (mirrors seed-sanity.mjs; no dotenv dep) ----------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

function loadEnvLocal() {
  const envPath = path.join(repoRoot, '.env.local');
  if (!existsSync(envPath)) {
    console.error(`[publish] ERROR: ${envPath} not found.`);
    process.exit(1);
  }
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const [, key, val] = m;
    process.env[key] = val.replace(/^['"]|['"]$/g, '');
  }
}

loadEnvLocal();

const TOKEN = process.env.SANITY_API_WRITE_TOKEN;
const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01';

const PLACEHOLDER_TOKEN_PATTERNS = ['REPLACE_ME', '<token>', ''];
if (!TOKEN || PLACEHOLDER_TOKEN_PATTERNS.includes(TOKEN)) {
  console.error('[publish] ERROR: SANITY_API_WRITE_TOKEN is unset or is a placeholder.');
  process.exit(1);
}
if (!PROJECT_ID) {
  console.error('[publish] ERROR: NEXT_PUBLIC_SANITY_PROJECT_ID is unset.');
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  token: TOKEN,
  useCdn: false,
});

// ---------- helpers (mirror seed-sanity.mjs) ----------
function localized(en, es) {
  const out = {_type: 'localizedString', en: en ?? ''};
  if (es != null && es !== '') out.es = es;
  return out;
}
function localizedText(en, es) {
  return localized(en, es);
}

// ---------- build + publish the one project ----------
async function main() {
  console.log(`[publish] Sanity ${PROJECT_ID}/${DATASET} (apiVersion ${API_VERSION})`);
  console.log(`[publish] Target project slug: "${TARGET_SLUG}"`);

  const {PROJECTS} = await import('../src/data/projects.ts');
  const {SERVICES: services} = await import('../src/data/services.ts');

  const p = PROJECTS.find((proj) => proj.slug === TARGET_SLUG);
  if (!p) {
    console.error(`[publish] ERROR: no project with slug "${TARGET_SLUG}" found in src/data/projects.ts.`);
    console.error('         Available slugs:');
    for (const proj of PROJECTS) console.error(`           ${proj.slug}`);
    process.exit(1);
  }

  // Resolve service references exactly as the seed script does: prefer the
  // service whose audience matches the project's audience, else any match.
  const serviceRefs = p.serviceSlugs
    .map((slug) => {
      const matching = services.find((s) => s.slug === slug && s.audience === p.audience);
      const fallback = services.find((s) => s.slug === slug);
      return matching ?? fallback;
    })
    .filter(Boolean)
    .map((s) => ({
      _type: 'reference',
      _ref: `service-${s.audience}-${s.slug}`,
      _key: `svc-${s.audience}-${s.slug}`,
    }));

  const doc = {
    _id: `project-${p.slug}`,
    _type: 'project',
    slug: {_type: 'slug', current: p.slug},
    title: localized(p.title.en, p.title.es),
    audience: p.audience,
    services: serviceRefs,
    city: {_type: 'reference', _ref: `location-${p.citySlug}`},
    year: p.year,
    durationWeeks: p.durationWeeks,
    shortDek: localized(p.shortDek.en, p.shortDek.es),
    narrative: localizedText(p.narrative.en, p.narrative.es),
    materials: [localized(p.materials.en, p.materials.es)],
    leadAlt: localized(p.leadAlt.en, p.leadAlt.es),
    hasBeforeAfter: p.hasBeforeAfter,
  };
  if (p.narrativeHeading) {
    doc.narrativeHeading = localized(p.narrativeHeading.en, p.narrativeHeading.es);
  }
  if (p.hasBeforeAfter) {
    if (p.beforeAlt) doc.beforeAlt = localized(p.beforeAlt.en, p.beforeAlt.es);
    if (p.afterAlt) doc.afterAlt = localized(p.afterAlt.en, p.afterAlt.es);
  }

  console.log(`[publish] Writing document _id="${doc._id}" …`);
  await client.createOrReplace(doc);

  // Read it back (no CDN) to confirm it's queryable as a published document.
  const readBack = await client.fetch(
    `*[_type == "project" && slug.current == $slug][0]{ "slug": slug.current, "title": title.en }`,
    {slug: TARGET_SLUG},
  );

  if (readBack && readBack.slug === TARGET_SLUG) {
    console.log(`[publish] SUCCESS — published "${readBack.title}" (slug: ${readBack.slug}).`);
    console.log('[publish] Next: restart the dev server if running, then re-run:');
    console.log('            npm run validate:a11y');
  } else {
    console.error('[publish] WARNING: write completed but read-back did not return the project.');
    console.error('         The CDN can lag ~60s; try the page again shortly.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[publish] FATAL:', err && err.stack ? err.stack : err);
  process.exit(1);
});
