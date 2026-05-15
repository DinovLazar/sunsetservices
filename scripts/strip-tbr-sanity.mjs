/**
 * Phase B.01 — Strip `[TBR]` markers from every ES Sanity field.
 *
 * Companion to the source-file strip in B.01. Walks every non-system
 * document in the dataset, finds string values containing `[TBR]`
 * (leading prefix, trailing suffix, or standalone), and writes back the
 * cleaned values via `client.patch(id).set(...)`.
 *
 * Idempotent: a second run on a clean dataset produces zero mutations.
 *
 * Run:
 *   node scripts/strip-tbr-sanity.mjs [--dry-run]
 *
 * Requires SANITY_API_WRITE_TOKEN + NEXT_PUBLIC_SANITY_* in .env.local
 * (same setup as scripts/translate-sanity-es.mjs).
 */

import {readFileSync, existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createClient} from '@sanity/client';

// ---------- env loader (mirrors translate-sanity-es.mjs) ----------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

function loadEnvLocal() {
  const envPath = path.join(repoRoot, '.env.local');
  if (!existsSync(envPath)) {
    console.error(`[strip-tbr] ERROR: ${envPath} not found.`);
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

if (!TOKEN || TOKEN === 'REPLACE_ME') {
  console.error('[strip-tbr] ERROR: SANITY_API_WRITE_TOKEN unset.');
  process.exit(1);
}
if (!PROJECT_ID) {
  console.error('[strip-tbr] ERROR: NEXT_PUBLIC_SANITY_PROJECT_ID unset.');
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  token: TOKEN,
  useCdn: false,
});

// ---------- CLI ----------
function parseArgs() {
  const out = {};
  for (const a of process.argv.slice(2)) {
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      out[k] = v === undefined ? true : v;
    }
  }
  return out;
}

const args = parseArgs();
const isDryRun = !!args['dry-run'];

// ---------- Strip helpers ----------

/**
 * Strip `[TBR]` markers from a string. Handles:
 *   - Leading prefix:   `[TBR] Foo` -> `Foo`
 *   - Trailing suffix:  `Foo [TBR]` -> `Foo`
 *   - Standalone:       `[TBR]`     -> ``
 *   - Mid-string:       `Foo [TBR] Bar` -> `Foo Bar` (single-space collapse)
 *
 * Returns the cleaned string. Does not mutate.
 */
function stripFromString(s) {
  if (typeof s !== 'string' || !s.includes('[TBR]')) return s;
  return s
    .replace(/^\[TBR\]\s*/, '')
    .replace(/\s*\[TBR\]\s*$/, '')
    .replace(/\s*\[TBR\]\s*/g, ' ');
}

/**
 * Recursively walk a value. Returns the cleaned value and increments
 * `counts.strings` for every string that actually had `[TBR]` stripped.
 *
 * Preserves system fields starting with `_` verbatim.
 */
function stripDeep(value, counts) {
  if (typeof value === 'string') {
    if (!value.includes('[TBR]')) return value;
    const cleaned = stripFromString(value);
    if (cleaned !== value) counts.strings += 1;
    return cleaned;
  }
  if (Array.isArray(value)) {
    return value.map((v) => stripDeep(v, counts));
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = stripDeep(v, counts);
    }
    return out;
  }
  return value;
}

/**
 * For a document, compute the patch payload: only top-level fields that
 * actually changed (i.e., contained `[TBR]` somewhere within).
 *
 * System fields (those starting with `_`) are skipped — `client.patch.set()`
 * would reject them anyway.
 */
function buildPatch(doc) {
  const counts = {strings: 0};
  const set = {};
  for (const [key, value] of Object.entries(doc)) {
    if (key.startsWith('_')) continue;
    const cleaned = stripDeep(value, counts);
    if (JSON.stringify(cleaned) !== JSON.stringify(value)) {
      set[key] = cleaned;
    }
  }
  return {set, stringsChanged: counts.strings, fieldsChanged: Object.keys(set)};
}

// ---------- Main ----------

async function main() {
  console.log(
    `[strip-tbr] mode=${isDryRun ? 'dry-run' : 'apply'} project=${PROJECT_ID} dataset=${DATASET}`,
  );

  // Pull every non-system doc, both published and drafts. ~200 docs is cheap.
  const query = `*[!(_type match "system.*") && !(_type match "sanity.*")]`;
  const docs = await client.fetch(query);
  console.log(`[strip-tbr] scanned ${docs.length} documents`);

  const byType = new Map();
  for (const d of docs) {
    byType.set(d._type, (byType.get(d._type) || 0) + 1);
  }
  for (const [t, n] of [...byType.entries()].sort()) {
    console.log(`[strip-tbr]   ${t}: ${n}`);
  }

  let touched = 0;
  let stringsTotal = 0;
  const errors = [];

  for (const doc of docs) {
    const {set, stringsChanged, fieldsChanged} = buildPatch(doc);
    if (stringsChanged === 0) continue;
    touched += 1;
    stringsTotal += stringsChanged;
    console.log(
      `[strip-tbr] ${isDryRun ? 'would patch' : 'patching'} ${doc._id} (${doc._type}): ` +
        `${stringsChanged} string(s) across fields ${fieldsChanged.join(', ')}`,
    );
    if (isDryRun) continue;
    try {
      await client.patch(doc._id).set(set).commit({autoGenerateArrayKeys: false});
    } catch (e) {
      console.error(`[strip-tbr] ERROR patching ${doc._id}:`, e?.message ?? e);
      errors.push({id: doc._id, message: e?.message ?? String(e)});
    }
  }

  console.log('');
  console.log(`[strip-tbr] summary:`);
  console.log(`  documents scanned   ${docs.length}`);
  console.log(`  documents ${isDryRun ? 'would touch' : 'touched'}     ${touched}`);
  console.log(`  strings ${isDryRun ? 'would strip' : 'stripped'}      ${stringsTotal}`);
  console.log(`  errors              ${errors.length}`);
  if (errors.length) {
    for (const e of errors) console.log(`    ${e.id}: ${e.message}`);
    process.exit(2);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
