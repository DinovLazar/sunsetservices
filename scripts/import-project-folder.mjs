/**
 * Phase B.18 — Reusable project-folder importer for Sunset Services.
 * ---------------------------------------------------------------------------
 * Turns one staged photo folder + one JSON manifest into a single Sanity
 * `project` document, safely and repeatably. Built to be run once per Drive
 * job folder so the ~19 remaining folders become a manifest edit, not a phase.
 *
 * Modeled on `scripts/upload-m01c-photos.mjs` (env loader, token guard,
 * resolve-refs-by-GROQ, dry-run default) and `scripts/optimize-stock-bridge.mjs`
 * (sharp pipeline). Writes ONLY the fields the live legacy `project` schema
 * defines — see the ground-truth note in `docs/project-import/README.md`:
 * the M.18/PSS-002 "story layout" the original brief assumed does not exist
 * in this repo, so there are no overview/site/approach/... story sections to
 * populate. This importer produces a renderable page via the existing
 * Hero -> Narrative -> Gallery -> Facts -> BeforeAfter -> Related -> CTA tree.
 *
 * USAGE
 *   node scripts/import-project-folder.mjs <manifest.json>                # dry run (default)
 *   node scripts/import-project-folder.mjs <manifest.json> --commit       # process, upload, write DRAFT
 *   node scripts/import-project-folder.mjs <manifest.json> --commit --publish
 *   node scripts/import-project-folder.mjs <manifest.json> --reprocess    # force re-run the photo pipeline
 *
 * SAFETY
 *   - Dry run is the default and writes NOTHING (no files uploaded, no doc written).
 *   - `--commit` writes a Sanity DRAFT (drafts.project-<slug>), invisible to the
 *     anonymous published read client the site uses (D4).
 *   - `--publish` is gated: refused unless confirmed.clientPhotoPermission === true
 *     AND confirmed.citySlug AND confirmed.year are set. Publishing fires the
 *     Phase B.08 revalidate webhook.
 *   - EXIF (incl. the customer-home GPS) is stripped from every processed image
 *     and the strip is verified before a single byte is uploaded (D7).
 *
 * Requires .env.local with NEXT_PUBLIC_SANITY_PROJECT_ID / _DATASET and, for
 * --commit/--publish, SANITY_API_WRITE_TOKEN (Editor). Run from repo root.
 */
import dotenv from 'dotenv';
// .env.local WINS over the shell so a stale exported NEXT_PUBLIC_SANITY_PROJECT_ID
// can never route writes to the wrong project (brief §5, mirrors the hotfix script).
dotenv.config({path: '.env.local', override: true});

import {createClient} from '@sanity/client';
import sharp from 'sharp';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

// ─────────────────────────── constants ───────────────────────────
// The 24 valid `location` slugs (brief §1). A slug that later gains a city is a
// broken URL, so citySlug lives only in `confirmed`, never in the project slug.
const VALID_CITY_SLUGS = new Set([
  'aurora', 'naperville', 'batavia', 'wheaton', 'lisle', 'bolingbrook',
  'hinsdale', 'oak-brook', 'elmhurst', 'clarendon-hills', 'burr-ridge',
  'western-springs', 'glen-ellyn', 'downers-grove', 'winfield', 'lombard',
  'st-charles', 'geneva', 'south-elgin', 'elburn', 'north-aurora', 'oswego',
  'yorkville', 'plainfield',
]);
const VALID_AUDIENCES = new Set(['residential', 'commercial', 'hardscape']);
// Fallback service allow-list (the 6 hardscape slugs) used only if the live
// Sanity fetch of service slugs fails; both B.18 projects are hardscape.
const HARDSCAPE_SERVICE_SLUGS = [
  'patios-walkways', 'retaining-walls', 'fire-pits-features',
  'pergolas-pavilions', 'driveways', 'outdoor-kitchens',
];

const MAX_EDGE = 2400; // px, long edge (D7)
const JPEG_QUALITY = 82; // (D7)
const SLUG_RE = /^[a-z0-9-]+$/;
const HREF_RE = /^\/[A-Za-z0-9/_-]*$/;
const TOKEN_PLACEHOLDERS = new Set(['', 'REPLACE_ME', '<token>', 'your-token-here']);

const ASSET_LOCK_PATH = path.join('docs', 'project-import', 'asset-lock.json');

// ─────────────────────────── args + env ───────────────────────────
const argv = process.argv.slice(2);
const FLAGS = new Set(argv.filter((a) => a.startsWith('--')));
const POSITIONAL = argv.filter((a) => !a.startsWith('--'));
const MANIFEST_PATH = POSITIONAL[0];
const COMMIT = FLAGS.has('--commit');
const PUBLISH = FLAGS.has('--publish');
const REPROCESS = FLAGS.has('--reprocess');

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'i3fawnrl';
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01';
const TOKEN = process.env.SANITY_API_WRITE_TOKEN;

const SHARP_HEIF = Boolean(sharp.format.heif && sharp.format.heif.input);

function fail(msg) {
  console.error('\n[import] ERROR: ' + msg + '\n');
  process.exit(1);
}
function usage() {
  console.error('Usage: node scripts/import-project-folder.mjs <manifest.json> [--commit] [--publish] [--reprocess]');
}

if (!MANIFEST_PATH) {
  usage();
  fail('a manifest path is required.');
}
if (PUBLISH && !COMMIT) {
  fail('--publish requires --commit.');
}
if ((COMMIT || PUBLISH) && (!TOKEN || TOKEN_PLACEHOLDERS.has(TOKEN))) {
  console.error('\n[import] ERROR: SANITY_API_WRITE_TOKEN is unset or a placeholder.');
  console.error('         A write (--commit/--publish) needs an Editor token in .env.local.');
  console.error('         Add:  SANITY_API_WRITE_TOKEN=sk...   then re-run.');
  console.error('         (Dry run needs no token — omit --commit to see the full plan.)\n');
  process.exit(1);
}

// Anonymous published read client — works with no token; used for ref
// resolution, service-slug validation and post-publish verification.
const readClient = createClient({
  projectId: PROJECT_ID, dataset: DATASET, apiVersion: API_VERSION,
  useCdn: false, perspective: 'published',
});
// Token client — reads drafts by explicit _id and performs writes.
const tokenClient = TOKEN
  ? createClient({projectId: PROJECT_ID, dataset: DATASET, apiVersion: API_VERSION, token: TOKEN, useCdn: false})
  : null;

// ─────────────────────────── small helpers ───────────────────────────
const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const locStr = (o) => ({_type: 'localizedString', en: (o && o.en) || '', es: (o && o.es) || ''});
const locText = (o) => ({_type: 'localizedText', en: (o && o.en) || '', es: (o && o.es) || ''});
const slugField = (s) => ({_type: 'slug', current: s});
const imageField = (assetId) => ({_type: 'image', asset: {_type: 'reference', _ref: assetId}});
const refField = (id, key) => (key ? {_type: 'reference', _ref: id, _key: key} : {_type: 'reference', _ref: id});
const pad2 = (n) => String(n).padStart(2, '0');

function loadLock() {
  try {
    return JSON.parse(fs.readFileSync(ASSET_LOCK_PATH, 'utf8'));
  } catch {
    return {};
  }
}
function saveLock(lock) {
  fs.writeFileSync(ASSET_LOCK_PATH, JSON.stringify(lock, Object.keys(lock).sort(), 2) + '\n');
}

const refCache = new Map();
async function resolveRef(type, slug) {
  const key = type + ':' + slug;
  if (refCache.has(key)) return refCache.get(key);
  const ids = await readClient.fetch('*[_type==$t && slug.current==$s]._id', {t: type, s: slug});
  if (ids.length > 1) console.warn('   ! multiple ' + type + ' docs share slug "' + slug + '" — using first');
  const id = ids[0] || null;
  refCache.set(key, id);
  return id;
}

// ─────────────────────────── photo pipeline (D7, D13) ───────────────────────────
function hasImageMagick() {
  for (const bin of ['magick', 'convert']) {
    try {
      execFileSync(bin, ['-version'], {stdio: 'ignore'});
      return bin;
    } catch {
      /* not on PATH */
    }
  }
  return null;
}

const DECODE_METHODS = {};
/** Return decoded image bytes sharp can read, trying sharp -> heic-convert -> ImageMagick. */
async function decode(abs) {
  const ext = path.extname(abs).toLowerCase();
  const isHeic = ext === '.heic' || ext === '.heif';
  if (!isHeic) {
    DECODE_METHODS['sharp-native'] = (DECODE_METHODS['sharp-native'] || 0) + 1;
    return fs.readFileSync(abs);
  }
  if (SHARP_HEIF) {
    DECODE_METHODS['sharp-heif'] = (DECODE_METHODS['sharp-heif'] || 0) + 1;
    return fs.readFileSync(abs);
  }
  try {
    const heicConvert = (await import('heic-convert')).default;
    const out = await heicConvert({buffer: fs.readFileSync(abs), format: 'JPEG', quality: 1});
    DECODE_METHODS['heic-convert'] = (DECODE_METHODS['heic-convert'] || 0) + 1;
    return Buffer.from(out);
  } catch {
    /* dev dependency not installed or decode failed — fall through */
  }
  const magick = hasImageMagick();
  if (magick) {
    const buf = execFileSync(magick, [abs, '-auto-orient', 'jpg:-'], {maxBuffer: 256 * 1024 * 1024});
    DECODE_METHODS['imagemagick'] = (DECODE_METHODS['imagemagick'] || 0) + 1;
    return buf;
  }
  throw new Error(
    'cannot decode HEIC ' + path.basename(abs) + ' — this sharp build lacks HEIF input. ' +
    'Install a dev decoder:  npm i -D heic-convert   (or put ImageMagick on PATH).',
  );
}

/** rotate (auto-orient from EXIF) -> downscale -> re-encode -> STRIP all metadata. */
async function processOne(abs, outPath) {
  const input = await decode(abs);
  const out = await sharp(input, {failOn: 'none'})
    .rotate() // auto-orient BEFORE metadata is dropped, or portraits ship sideways
    .resize({width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true})
    .jpeg({quality: JPEG_QUALITY, mozjpeg: true})
    .toBuffer(); // no withMetadata() -> EXIF/GPS/XMP/IPTC discarded
  fs.writeFileSync(outPath, out);
  // Verify the strip. If any PII-bearing metadata survived, abort the whole run.
  const meta = await sharp(out).metadata();
  if (meta.exif || meta.xmp || meta.iptc) {
    throw new Error('metadata survived on ' + path.basename(outPath) + ' (exif/xmp/iptc present) — refusing to upload');
  }
  return {bytes: out.length, width: meta.width, height: meta.height};
}

/** Classify a file by the nearest known source subfolder in its path. */
function classify(relPath) {
  const segs = relPath.toLowerCase().split(/[\\/]/);
  let cls = 'after'; // flat root / After -> after (brief §3)
  for (const s of segs) {
    if (s === 'before') cls = 'before';
    else if (s === 'after') cls = 'after';
    else if (s === 'progress') cls = 'progress';
    else if (s === 'render') cls = 'render';
    else if (s === 'ipad') cls = 'render'; // iPad screenshots are design renders (D13)
  }
  return cls;
}

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.heic', '.heif', '.webp', '.tif', '.tiff']);
function walk(dir, base = dir) {
  const out = [];
  for (const name of fs.readdirSync(dir).sort()) {
    if (name.startsWith('_') || name.startsWith('.')) continue; // skip _processed, dotfiles
    const abs = path.join(dir, name);
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) out.push(...walk(abs, base));
    else if (IMAGE_EXT.has(path.extname(name).toLowerCase())) out.push({abs, rel: path.relative(base, abs)});
  }
  return out;
}

/**
 * Run the full pipeline on rawFolder -> processedFolder. Deterministic:
 * inputs sorted by path, deduped by SHA-256 of the raw bytes (keep first),
 * numbered per class. Writes an index.json worksheet listing every generated
 * file so a human can author the manifest against real filenames.
 */
async function runProcessing(rawFolder, processedFolder, manifest) {
  if (!fs.existsSync(rawFolder)) {
    fail('staging folder not found: ' + rawFolder + '\n         Stage the Drive photos there first (brief §2). Nothing was written.');
  }
  const files = walk(rawFolder);
  if (files.length === 0) fail('staging folder is empty: ' + rawFolder + '. Nothing was written.');

  fs.mkdirSync(processedFolder, {recursive: true});

  const service = manifest.services && manifest.services[0] ? manifest.services[0] : 'hardscape';
  const city = (manifest.confirmed && manifest.confirmed.citySlug) || 'dupage'; // placeholder segment (D5 note)
  const date = manifest.confirmed && manifest.confirmed.year ? String(manifest.confirmed.year) : 'undated';

  const seenSha = new Map();
  const counters = {};
  const generated = [];
  const dropped = [];

  console.log('[process] ' + files.length + ' source image(s) in ' + rawFolder);
  for (const f of files) {
    const raw = fs.readFileSync(f.abs);
    const sha = sha256(raw);
    if (seenSha.has(sha)) {
      dropped.push({file: f.rel, duplicateOf: seenSha.get(sha)});
      continue;
    }
    seenSha.set(sha, f.rel);
    const cls = classify(f.rel);
    counters[cls] = (counters[cls] || 0) + 1;
    const outName = [service, city, date, cls, pad2(counters[cls])].join('-') + '.jpg';
    const info = await processOne(f.abs, path.join(processedFolder, outName));
    generated.push({file: outName, class: cls, source: f.rel, rawSha256: sha, bytesOut: info.bytes, width: info.width, height: info.height});
  }

  // Worksheet for authoring the manifest.
  const index = {
    generatedFrom: rawFolder,
    processedFolder,
    when: 'run-time', // Date.* intentionally omitted so the file is reproducible
    counts: counters,
    droppedDuplicates: dropped,
    files: generated,
  };
  fs.writeFileSync(path.join(processedFolder, 'index.json'), JSON.stringify(index, null, 2) + '\n');

  console.log('[process] wrote ' + generated.length + ' processed file(s); dropped ' + dropped.length + ' duplicate(s).');
  console.log('[process] decode methods: ' + (Object.keys(DECODE_METHODS).length ? JSON.stringify(DECODE_METHODS) : 'none'));
  console.log('[process] worksheet: ' + path.join(processedFolder, 'index.json'));
  return {generated, dropped};
}

// ─────────────────────────── manifest validation ───────────────────────────
function collectPhotoRefs(m) {
  const refs = [];
  if (m.leadImage) refs.push({where: 'leadImage', file: m.leadImage, alt: m.leadAlt});
  for (let i = 0; i < (m.gallery || []).length; i++) {
    refs.push({where: 'gallery[' + i + ']', file: m.gallery[i].file, alt: m.gallery[i].alt});
  }
  if (m.hasBeforeAfter) {
    refs.push({where: 'beforeImage', file: m.beforeImage, alt: m.beforeAlt});
    refs.push({where: 'afterImage', file: m.afterImage, alt: m.afterAlt});
  }
  return refs;
}

function validateManifest(m, processedFiles, validServiceSlugs) {
  const errors = [];
  if (!m.id) errors.push('id is required');
  if (!m.slug || !SLUG_RE.test(m.slug)) {
    errors.push('slug "' + m.slug + '" must match ' + SLUG_RE);
  } else {
    if (/\d{3,}/.test(m.slug)) errors.push('slug "' + m.slug + '" has a 3+ digit run (looks like a house number) — D5');
    for (const c of VALID_CITY_SLUGS) {
      if (m.slug.includes(c)) errors.push('slug "' + m.slug + '" contains city slug "' + c + '" — D5');
    }
  }
  if (!VALID_AUDIENCES.has(m.audience)) errors.push('audience "' + m.audience + '" must be residential|commercial|hardscape');
  if (!Array.isArray(m.services) || m.services.length === 0) {
    errors.push('services[] must be a non-empty array of real service slugs');
  } else {
    for (const s of m.services) {
      if (!validServiceSlugs.has(s)) errors.push('service "' + s + '" is not a real service slug');
    }
  }
  const city = m.confirmed && m.confirmed.citySlug;
  if (city != null && !VALID_CITY_SLUGS.has(city)) errors.push('confirmed.citySlug "' + city + '" is not one of the 24 valid slugs');

  if (!m.title || !m.title.en) errors.push('title.en is required');
  if (!m.narrative || !m.narrative.en) errors.push('narrative.en is required (the legacy layout renders the narrative body)');
  if (!m.leadImage) errors.push('leadImage is required');
  if (!m.leadAlt || !m.leadAlt.en || !m.leadAlt.es) errors.push('leadAlt.en AND leadAlt.es are required');
  if (m.hasBeforeAfter) {
    if (!m.beforeImage) errors.push('hasBeforeAfter=true but beforeImage missing (D10)');
    if (!m.afterImage) errors.push('hasBeforeAfter=true but afterImage missing (D10)');
  }

  const refs = collectPhotoRefs(m);
  for (const r of refs) {
    if (!r.file) {
      errors.push(r.where + ': file is required');
      continue;
    }
    if (!r.alt || !r.alt.en || !r.alt.es) errors.push(r.where + ' (' + r.file + '): alt.en AND alt.es are required (schema-enforced, no "Project photo")');
    if (processedFiles && !processedFiles.has(r.file)) errors.push(r.where + ': "' + r.file + '" not found in sourceFolder');
  }
  // No photo may appear twice on the page (hero/gallery/before/after are distinct).
  const counts = new Map();
  for (const r of refs) if (r.file) counts.set(r.file, (counts.get(r.file) || 0) + 1);
  for (const [file, n] of counts) if (n > 1) errors.push('photo "' + file + '" is referenced ' + n + '× — each photo appears exactly once');

  // Optional internalLinks (kept for forward-compat; the legacy schema ignores them).
  for (let i = 0; i < (m.internalLinks || []).length; i++) {
    const href = m.internalLinks[i].href;
    if (!href || !HREF_RE.test(href)) errors.push('internalLinks[' + i + '].href "' + href + '" must match ' + HREF_RE);
  }
  return errors;
}

// ─────────────────────────── document construction ───────────────────────────
async function uploadProcessed(basename, sourceFolder, lock) {
  const abs = path.join(sourceFolder, basename);
  const bytes = fs.readFileSync(abs);
  const sha = sha256(bytes);
  if (lock[sha]) return lock[sha]; // idempotent: reuse the already-uploaded asset
  if (!COMMIT) return 'image-DRYRUN-' + sha.slice(0, 12);
  const asset = await tokenClient.assets.upload('image', bytes, {filename: basename});
  lock[sha] = asset._id;
  saveLock(lock);
  console.log('   uploaded ' + basename + ' -> ' + asset._id);
  return asset._id;
}

async function buildDoc(m, sourceFolder, lock, targetId) {
  const services = [];
  for (const s of m.services) {
    const id = await resolveRef('service', s);
    if (!id) fail('service slug "' + s + '" resolves to no Sanity `service` document');
    services.push(refField(id, 'svc-' + s));
  }
  let cityRef = null;
  if (m.confirmed && m.confirmed.citySlug) {
    const id = await resolveRef('location', m.confirmed.citySlug);
    if (!id) fail('confirmed.citySlug "' + m.confirmed.citySlug + '" resolves to no `location` document');
    cityRef = refField(id);
  }

  const leadAssetId = await uploadProcessed(m.leadImage, sourceFolder, lock);
  const gallery = [];
  for (let i = 0; i < (m.gallery || []).length; i++) {
    const g = m.gallery[i];
    const aid = await uploadProcessed(g.file, sourceFolder, lock);
    gallery.push({_type: 'galleryEntry', _key: 'g' + i, image: imageField(aid), alt: locStr(g.alt)});
  }
  let beforeAssetId = null;
  let afterAssetId = null;
  if (m.hasBeforeAfter) {
    beforeAssetId = await uploadProcessed(m.beforeImage, sourceFolder, lock);
    afterAssetId = await uploadProcessed(m.afterImage, sourceFolder, lock);
  }

  const facts = {};
  const c = m.confirmed || {};
  if (c.sqft != null) facts.sqft = c.sqft;
  if (c.durationDays != null) facts.durationDays = c.durationDays;
  if (c.crewSize != null) facts.crewSize = c.crewSize;

  const materials = (c.materials || []).map((mm, idx) => ({
    _type: 'localizedString', _key: 'mat' + idx, en: mm.en || '', es: mm.es || '',
  }));

  const seoHasContent = m.seo && ((m.seo.title && m.seo.title.en) || (m.seo.description && m.seo.description.en));

  const doc = {
    _id: targetId,
    _type: 'project',
    title: locStr(m.title),
    slug: slugField(m.slug),
    audience: m.audience,
    featuredOnHome: m.featuredOnHome === true, // D9 — never a side effect of an import
    ...(services.length ? {services} : {}),
    ...(cityRef ? {city: cityRef} : {}),
    ...(c.year != null ? {year: c.year} : {}),
    ...(c.durationWeeks != null ? {durationWeeks: c.durationWeeks} : {}),
    ...(m.shortDek && m.shortDek.en ? {shortDek: locStr(m.shortDek)} : {}),
    ...(m.narrativeHeading && m.narrativeHeading.en ? {narrativeHeading: locStr(m.narrativeHeading)} : {}),
    narrative: locText(m.narrative),
    ...(materials.length ? {materials} : {}),
    leadImage: imageField(leadAssetId),
    leadAlt: locStr(m.leadAlt),
    ...(gallery.length ? {gallery} : {}),
    hasBeforeAfter: m.hasBeforeAfter === true,
    ...(m.hasBeforeAfter
      ? {
          beforeImage: imageField(beforeAssetId),
          beforeAlt: locStr(m.beforeAlt),
          afterImage: imageField(afterAssetId),
          afterAlt: locStr(m.afterAlt),
        }
      : {}),
    ...(Object.keys(facts).length ? {facts} : {}),
    ...(seoHasContent
      ? {
          seo: {
            _type: 'localizedSeo',
            ...(m.seo.title && m.seo.title.en ? {title: locStr(m.seo.title)} : {}),
            ...(m.seo.description && m.seo.description.en ? {description: locText(m.seo.description)} : {}),
          },
        }
      : {}),
  };
  return doc;
}

// ─────────────────────────── idempotency ───────────────────────────
const VOLATILE = new Set(['_rev', '_updatedAt', '_createdAt']);
/** Recursively drop volatile system fields and sort object keys so two
 *  documents compare equal by CONTENT regardless of key order (Sanity's read
 *  order differs from our constructed order). Array order is preserved. */
function canonical(v) {
  if (Array.isArray(v)) return v.map(canonical);
  if (v && typeof v === 'object') {
    const out = {};
    for (const k of Object.keys(v).sort()) {
      if (VOLATILE.has(k)) continue;
      out[k] = canonical(v[k]);
    }
    return out;
  }
  return v;
}
const normalize = (doc) => (doc == null ? null : JSON.stringify(canonical(doc)));

// ─────────────────────────── post-write verification ───────────────────────────
async function verifyWritten(m, targetId, expectGalleryCount) {
  // Independent client instance (fresh), reading the exact _id we wrote.
  const client = PUBLISH
    ? createClient({projectId: PROJECT_ID, dataset: DATASET, apiVersion: API_VERSION, useCdn: false, perspective: 'published'})
    : createClient({projectId: PROJECT_ID, dataset: DATASET, apiVersion: API_VERSION, token: TOKEN, useCdn: false});
  const doc = await client.fetch('*[_id==$id][0]', {id: targetId});
  const rows = [];
  const check = (label, ok) => rows.push({label, ok: ok ? 'PASS' : 'FAIL'});
  check('document exists', Boolean(doc));
  if (doc) {
    check('title.en matches', doc.title && doc.title.en === m.title.en);
    check('slug matches', doc.slug && doc.slug.current === m.slug);
    check('narrative.en present', Boolean(doc.narrative && doc.narrative.en));
    check('leadImage asset ref', Boolean(doc.leadImage && doc.leadImage.asset && doc.leadImage.asset._ref));
    check('gallery count == ' + expectGalleryCount, (doc.gallery || []).length === expectGalleryCount);
    check('hasBeforeAfter == ' + Boolean(m.hasBeforeAfter), Boolean(doc.hasBeforeAfter) === Boolean(m.hasBeforeAfter));
    if (m.hasBeforeAfter) {
      check('before asset ref', Boolean(doc.beforeImage && doc.beforeImage.asset && doc.beforeImage.asset._ref));
      check('after asset ref', Boolean(doc.afterImage && doc.afterImage.asset && doc.afterImage.asset._ref));
    }
  }
  console.log('\n[verify] post-write assertions (' + targetId + '):');
  for (const r of rows) console.log('   [' + r.ok + '] ' + r.label);
  const failed = rows.filter((r) => r.ok === 'FAIL');
  if (failed.length) fail(failed.length + ' post-write assertion(s) FAILED — inspect the document in Studio.');
}

// ─────────────────────────── main ───────────────────────────
async function main() {
  console.log('[import] Sanity ' + PROJECT_ID + '/' + DATASET + '  mode=' +
    (PUBLISH ? 'PUBLISH' : COMMIT ? 'COMMIT (draft)' : 'DRY RUN'));

  if (!fs.existsSync(MANIFEST_PATH)) fail('manifest not found: ' + MANIFEST_PATH);
  const m = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

  const publishedId = m.sanityDocId || 'project-' + m.slug;
  const draftId = 'drafts.' + publishedId;
  const targetId = PUBLISH ? publishedId : draftId;

  const sourceFolder = m.sourceFolder;
  const rawFolder = m.rawFolder || (sourceFolder ? path.dirname(sourceFolder) : null);
  if (!sourceFolder) fail('manifest.sourceFolder is required (the _processed dir).');

  // 1. Ensure processed photos exist (run the pipeline if absent or --reprocess).
  const processedExists = fs.existsSync(sourceFolder) &&
    fs.readdirSync(sourceFolder).some((f) => f.toLowerCase().endsWith('.jpg'));
  if (!processedExists || REPROCESS) {
    await runProcessing(rawFolder, sourceFolder, m);
  } else {
    console.log('[process] using existing processed photos in ' + sourceFolder + ' (pass --reprocess to rebuild).');
  }
  const processedFiles = new Set(
    fs.existsSync(sourceFolder) ? fs.readdirSync(sourceFolder).filter((f) => f.toLowerCase().endsWith('.jpg')) : [],
  );

  // 2. Resolve the valid service-slug set (live Sanity; fall back to hardscape 6).
  let validServiceSlugs;
  try {
    const slugs = await readClient.fetch('*[_type=="service" && defined(slug.current)].slug.current');
    validServiceSlugs = new Set(slugs && slugs.length ? slugs : HARDSCAPE_SERVICE_SLUGS);
  } catch {
    console.warn('   ! could not fetch service slugs from Sanity — falling back to the hardscape 6');
    validServiceSlugs = new Set(HARDSCAPE_SERVICE_SLUGS);
  }

  // 3. Validate the manifest BEFORE uploading a single byte.
  const errors = validateManifest(m, processedFiles, validServiceSlugs);
  if (errors.length) {
    console.error('\n[import] manifest is not importable yet — ' + errors.length + ' issue(s):');
    for (const e of errors) console.error('   - ' + e);
    console.error('\n[import] Fix the manifest (see docs/project-import/README.md) and re-run. Nothing was uploaded.\n');
    process.exit(1);
  }

  // 4. Publish gate.
  if (PUBLISH) {
    const gates = [];
    if (!(m.confirmed && m.confirmed.clientPhotoPermission === true)) gates.push('confirmed.clientPhotoPermission must be true');
    if (!(m.confirmed && m.confirmed.citySlug)) gates.push('confirmed.citySlug must be set');
    if (!(m.confirmed && m.confirmed.year != null)) gates.push('confirmed.year must be set');
    if (gates.length) fail('cannot --publish yet:\n         - ' + gates.join('\n         - '));
  }

  // 5. Guard against a slug collision with a DIFFERENT document (never guess the _id).
  const collisions = await readClient.fetch(
    '*[_type=="project" && slug.current==$s && !(_id in $mine)]._id',
    {s: m.slug, mine: [publishedId, draftId]},
  ).catch(() => []);
  if (collisions.length) fail('slug "' + m.slug + '" already belongs to a different project: ' + collisions.join(', '));

  // 6. Build the document (uploads assets when --commit; dry-run computes the plan only).
  const lock = loadLock();
  const doc = await buildDoc(m, sourceFolder, lock, targetId);
  const galleryCount = (m.gallery || []).length;

  console.log('\n[plan] ' + (m.title.en || m.slug) + '  (_id ' + targetId + ')');
  console.log('   audience=' + doc.audience +
    '  services=' + m.services.join(',') +
    '  city=' + (doc.city ? m.confirmed.citySlug : '(omitted)') +
    '  year=' + (doc.year != null ? doc.year : '(omitted)'));
  console.log('   photos: lead + gallery ' + galleryCount + (m.hasBeforeAfter ? ' + before/after' : '') +
    '  featuredOnHome=' + doc.featuredOnHome);

  // 7. Idempotency: compare the stored doc with the one we would write
  //    (createOrReplace replaces the whole document), skip the write if identical.
  let existing = null;
  if (tokenClient) existing = await tokenClient.fetch('*[_id==$id][0]', {id: targetId});
  else if (PUBLISH) existing = await readClient.fetch('*[_id==$id][0]', {id: targetId});
  const unchanged = Boolean(existing) && normalize(existing) === normalize(doc);

  if (!COMMIT) {
    console.log('\n[import] DRY RUN complete — nothing written. Re-run with --commit to write the draft.');
    if (!tokenClient) console.log('[import] (no token loaded, so an existing-draft diff was not computed.)');
    return;
  }

  if (unchanged) {
    console.log('\n[import] already up to date — document is byte-identical, no write performed (_rev unchanged).');
    return;
  }

  await tokenClient.createOrReplace(doc);
  console.log('\n[import] wrote ' + targetId);
  if (PUBLISH) {
    try {
      await tokenClient.delete(draftId);
      console.log('[import] cleared the draft ' + draftId);
    } catch {
      /* no draft to clear */
    }
    console.log('[import] NOTE: publishing fires the Phase B.08 revalidate webhook — the live page updates within ~2s.');
  }

  await verifyWritten(m, targetId, galleryCount);
  console.log('\n[import] DONE.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
