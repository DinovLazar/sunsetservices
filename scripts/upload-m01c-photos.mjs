/**
 * Phase M.01c — Upload curated Sunset Services photos to Sanity.
 *
 * Reads the curation plan + image files produced by Cowork in
 * C:\sunset-photos\processed and:
 *   1. Uploads each curated photo as a Sanity image asset.
 *   2. Creates 7 real project documents (deterministic _id project-<slug>)
 *      with bilingual title/narrative, service + city references resolved
 *      at runtime, gallery entries, lead image, and before/after for
 *      Scott & Sarah's.
 *   3. Uploads team portraits (team assets) and brand logos (media library).
 *   4. Removes the 12 placeholder projects from Phase 1.16.
 *
 * SAFE BY DEFAULT: runs as a DRY RUN and writes nothing. To actually write,
 * add the --commit flag:
 *     node scripts/upload-m01c-photos.mjs            (dry run, shows plan)
 *     node scripts/upload-m01c-photos.mjs --commit   (performs the upload)
 *
 * Requires SANITY_API_WRITE_TOKEN (already in .env.local). Run from repo root.
 */
import dotenv from 'dotenv';
dotenv.config({path: '.env.local'});
import {createClient} from '@sanity/client';
import fs from 'node:fs';
import path from 'node:path';

// ---- config ----------------------------------------------------------------
const COMMIT = process.argv.includes('--commit');
const PHOTOS_ROOT = process.env.PHOTOS_ROOT || 'C:\\sunset-photos\\processed';
const PLAN_PATH = path.join(PHOTOS_ROOT, 'sanity-upload-plan.json');

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'i3fawnrl';
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01';
const TOKEN = process.env.SANITY_API_WRITE_TOKEN;

// Map plan service_tags -> real service slugs in src/data/services.ts
const SERVICE_SLUG_MAP = {
  patios: 'patios-walkways',
  walkways: 'patios-walkways',
  driveways: 'driveways',
  'fire-features': 'fire-pits-features',
  'outdoor-kitchens': 'outdoor-kitchens',
  planting: 'landscape-design',
  hardscape: null, // generic umbrella, no single service doc
};

const PLACEHOLDER_PROJECT_SLUGS = [
  'naperville-hilltop-terrace', 'naperville-fire-court', 'aurora-hoa-curb-refresh',
  'aurora-driveway-apron', 'wheaton-lawn-reset', 'wheaton-bank-frontage',
  'lisle-retaining-wall', 'lisle-backyard-refresh', 'batavia-garden-reset',
  'batavia-front-walk', 'bolingbrook-office-court', 'bolingbrook-paver-plaza',
];

if (!TOKEN || ['', 'REPLACE_ME', '<token>'].includes(TOKEN)) {
  console.error('[upload] ERROR: SANITY_API_WRITE_TOKEN is unset. It should be in .env.local.');
  console.error('         Run with the env loaded, e.g. add it to .env.local then `node -r dotenv/config ...`');
  process.exit(1);
}
if (!fs.existsSync(PLAN_PATH)) {
  console.error('[upload] ERROR: cannot find ' + PLAN_PATH);
  console.error('         Set PHOTOS_ROOT if your processed folder is elsewhere.');
  process.exit(1);
}

const client = createClient({projectId: PROJECT_ID, dataset: DATASET, apiVersion: API_VERSION, token: TOKEN, useCdn: false});
const plan = JSON.parse(fs.readFileSync(PLAN_PATH, 'utf8'));

const loc = (en) => ({_type: 'localizedString', en: en ?? '', es: ''});
const locText = (en) => ({_type: 'localizedText', en: en ?? '', es: ''});
const yearFrom = (win) => {
  const m = (win || '').match(/(20\d\d)/);
  return m ? Number(m[1]) : undefined;
};

// resolve a reference _id by querying for a doc of given type whose slug matches
const refCache = new Map();
async function resolveRef(type, slug) {
  if (!slug) return null;
  const key = type + ':' + slug;
  if (refCache.has(key)) return refCache.get(key);
  const id = await client.fetch(
    '*[_type==$t && slug.current==$s][0]._id', {t: type, s: slug});
  refCache.set(key, id || null);
  if (!id) console.warn('   ! no ' + type + ' found for slug "' + slug + '" — reference skipped');
  return id || null;
}

async function uploadImage(absPath, label) {
  if (!fs.existsSync(absPath)) { console.warn('   ! missing file ' + absPath); return null; }
  if (!COMMIT) { console.log('   [dry] would upload ' + label + ' (' + path.basename(absPath) + ')'); return {_id: 'image-DRYRUN-' + path.basename(absPath)}; }
  try {
    const asset = await client.assets.upload('image', fs.createReadStream(absPath), {filename: path.basename(absPath)});
    console.log('   uploaded ' + label + ' -> ' + asset._id);
    return asset;
  } catch (e) {
    console.warn('   ! FAILED to upload ' + label + ' — skipped (' + (e.responseBody ? JSON.parse(e.responseBody).details || e.message : e.message) + ')');
    return null;
  }
}
const imgField = (asset) => ({_type: 'image', asset: {_type: 'reference', _ref: asset._id}});

async function buildProject(p) {
  console.log('\n[project] ' + p.title + '  (slug ' + p.slug + ')');
  const isBA = !!p.before_after;
  const photoDir = path.join(PHOTOS_ROOT, 'projects', p.slug.replace(/^[0-9]+-/, (m) => m)); // dir mirrors slug-ish
  // resolve actual processed folder name from the plan's file basenames
  const services = [];
  for (const tag of (p.service_tags || [])) {
    const sslug = SERVICE_SLUG_MAP[tag];
    if (sslug === undefined) continue;
    if (sslug === null) continue;
    // services use _id service-<audience>-<slug>; resolve by slug across audiences
    const id = await resolveRef('service', sslug);
    if (id) services.push({_type: 'reference', _ref: id, _key: 'svc-' + tag});
  }
  const cityRef = p.city_slug ? await resolveRef('location', p.city_slug) : null;

  const doc = {
    _id: 'project-' + p.slug,
    _type: 'project',
    title: loc(p.title),
    slug: {_type: 'slug', current: p.slug},
    audience: p.audience || 'residential',
    narrative: locText(p.description),
    ...(services.length ? {services} : {}),
    ...(cityRef ? {city: {_type: 'reference', _ref: cityRef}} : {}),
    ...(yearFrom(p.capture_window) ? {year: yearFrom(p.capture_window)} : {}),
    hasBeforeAfter: isBA,
  };

  // gather photo file lists from the dir that actually holds them
  const findDir = (slug) => {
    const base = path.join(PHOTOS_ROOT, 'projects');
    const cands = fs.existsSync(base) ? fs.readdirSync(base) : [];
    // match by leading file prefix used at curation time
    return cands;
  };

  if (isBA) {
    const beforeDir = path.join(PHOTOS_ROOT, 'projects', 'scott-and-sarahs', 'before');
    const afterDir = path.join(PHOTOS_ROOT, 'projects', 'scott-and-sarahs', 'after');
    const gallery = [];
    let lead = null;
    let i = 0;
    for (const ph of p.photos_before || []) {
      const a = await uploadImage(path.join(beforeDir, ph.file), 'before/' + ph.file);
      if (!a) continue;
      if (!lead) { lead = a; doc.leadImage = imgField(a); doc.leadAlt = loc(ph.alt); }
      if (p.photos_before.indexOf(ph) === 0) { doc.beforeImage = imgField(a); doc.beforeAlt = loc(ph.alt); }
      gallery.push({_type: 'galleryEntry', _key: 'g' + (i++), image: imgField(a), alt: loc(ph.alt)});
    }
    let firstAfter = true;
    for (const ph of p.photos_after || []) {
      const a = await uploadImage(path.join(afterDir, ph.file), 'after/' + ph.file);
      if (!a) continue;
      if (firstAfter) { doc.afterImage = imgField(a); doc.afterAlt = loc(ph.alt); firstAfter = false; }
      gallery.push({_type: 'galleryEntry', _key: 'g' + (i++), image: imgField(a), alt: loc(ph.alt)});
    }
    doc.gallery = gallery;
  } else {
    // non-BA: photos live in projects/<dir>. dir name = file prefix (e.g. 1008-homerton)
    const sampleFile = (p.photos && p.photos[0] && p.photos[0].file) || '';
    const dirName = sampleFile.replace(/-\d+\.[a-z]+$/i, '');
    const dir = path.join(PHOTOS_ROOT, 'projects', dirName);
    const gallery = [];
    let lead = null;
    let i = 0;
    for (const ph of p.photos || []) {
      const a = await uploadImage(path.join(dir, ph.file), dirName + '/' + ph.file);
      if (!a) continue;
      if (!lead) { lead = a; doc.leadImage = imgField(a); doc.leadAlt = loc(ph.alt); }
      gallery.push({_type: 'galleryEntry', _key: 'g' + (i++), image: imgField(a), alt: loc(ph.alt)});
    }
    doc.gallery = gallery;
  }

  if (!COMMIT) {
    console.log('   [dry] would createOrReplace project-' + p.slug +
      '  (services=' + (doc.services?.length || 0) + ', city=' + (doc.city ? 'yes' : 'no') +
      ', gallery=' + (doc.gallery?.length || 0) + ', beforeAfter=' + isBA + ')');
  } else {
    await client.createOrReplace(doc);
    console.log('   createOrReplace project-' + p.slug + ' done');
  }
}

async function main() {
  console.log('[upload] Sanity ' + PROJECT_ID + '/' + DATASET + '  mode=' + (COMMIT ? 'COMMIT' : 'DRY RUN'));
  console.log('[upload] photos root: ' + PHOTOS_ROOT);

  // 1. projects
  for (const p of plan.projects) await buildProject(p);

  // 2. team
  console.log('\n[team]');
  const teamDir = path.join(PHOTOS_ROOT, 'team');
  let ti = 0;
  for (const ph of plan.team.photos) {
    const a = await uploadImage(path.join(teamDir, ph.file), 'team/' + ph.file);
    if (!a) continue;
    const id = 'team-asset-' + (++ti);
    if (COMMIT) {
      await client.createOrReplace({_id: id, _type: 'team', name: 'Sunset Services crew ' + ti,
        slug: {_type: 'slug', current: 'crew-' + ti}, portrait: imgField(a), portraitAlt: loc(ph.alt), order: 100 + ti});
      console.log('   team doc ' + id);
    } else {
      console.log('   [dry] would create team doc ' + id + ' with portrait ' + ph.file);
    }
  }

  // 3. brand logos -> media library assets (tagged via title)
  console.log('\n[brand]');
  const brandDir = path.join(PHOTOS_ROOT, 'brand');
  for (const b of plan.brand.assets) {
    await uploadImage(path.join(brandDir, b.file), 'brand/' + b.file);
    if (COMMIT) {
      // assets uploaded above; brand tagging is by title/description on the asset.
    }
  }

  // 4. remove the 12 placeholder projects
  console.log('\n[cleanup] placeholder projects');
  for (const slug of PLACEHOLDER_PROJECT_SLUGS) {
    const id = 'project-' + slug;
    if (COMMIT) {
      try { await client.delete(id); console.log('   deleted ' + id); }
      catch (e) { console.log('   (skip ' + id + ': ' + e.message + ')'); }
    } else {
      console.log('   [dry] would delete ' + id);
    }
  }

  console.log('\n[upload] ' + (COMMIT ? 'DONE — committed.' : 'DRY RUN complete. Re-run with --commit to write.'));
}

main().catch((e) => { console.error(e); process.exit(1); });
