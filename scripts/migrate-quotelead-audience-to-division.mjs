/**
 * Phase M.01e-pt2 — quoteLead schema migration.
 *
 * The Sanity schema field `audience` on `quoteLead` (and `quoteLeadPartial`)
 * was renamed to `division`, and a new required `propertyType` field was
 * added. This idempotent script walks every existing `quoteLead` +
 * `quoteLeadPartial` document and:
 *
 *   1. Reads the old `audience` value:
 *        - 'hardscape'   → division: 'hardscape', propertyType: 'residential'
 *                          (hardscape is overwhelmingly residential per the
 *                           pre-M.01e service breakdown)
 *        - 'residential' → division: null (operator decides per-doc),
 *                          propertyType: 'residential'
 *        - 'commercial'  → division: null (operator decides per-doc),
 *                          propertyType: 'commercial'
 *   2. Unsets `audience` after the mapping lands (so re-running the script
 *      is a no-op).
 *   3. For `quoteLeadPartial`, the same audience → division logic applies
 *      (no propertyType on partials since Step 4 is the PII boundary).
 *
 * Idempotency: re-running the script only touches docs that still carry the
 * old `audience` field. After the first run the docs have `division` (and
 * `propertyType` for full leads), and the conditional skips them.
 *
 * Run via:   npx tsx scripts/migrate-quotelead-audience-to-division.mjs
 * Requires:  SANITY_API_WRITE_TOKEN + NEXT_PUBLIC_SANITY_* in .env.local
 */

import {readFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createClient} from '@sanity/client';

// ---------- env loader ----------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

function loadEnvLocal() {
  const envPath = path.join(repoRoot, '.env.local');
  if (!existsSync(envPath)) {
    console.error(`[migrate-quotelead] ERROR: ${envPath} not found.`);
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

if (!TOKEN || ['REPLACE_ME', '<token>', ''].includes(TOKEN)) {
  console.error('[migrate-quotelead] ERROR: SANITY_API_WRITE_TOKEN missing.');
  process.exit(1);
}
if (!PROJECT_ID) {
  console.error('[migrate-quotelead] ERROR: NEXT_PUBLIC_SANITY_PROJECT_ID missing.');
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  token: TOKEN,
  useCdn: false,
});

// Mapping table. Keys = legacy audience values. Values = new fields.
//
// For 'residential' + 'commercial', `division` is left null because the
// audience doesn't disambiguate which of (landscape | hardscape |
// waterproofing | snow-removal) the lead wanted. The operator picks a
// division per-doc in Sanity Studio after the script runs. This is the
// pragmatic choice — auto-mapping would be wrong half the time.
const AUDIENCE_MAP = {
  hardscape: {division: 'hardscape', propertyType: 'residential'},
  residential: {division: null, propertyType: 'residential'},
  commercial: {division: null, propertyType: 'commercial'},
};

async function migrateFullLeads() {
  const docs = await client.fetch(
    '*[_type == "quoteLead" && defined(audience)]{_id, audience, division, propertyType}',
  );
  console.log(`[migrate-quotelead] full leads to migrate: ${docs.length}`);

  let migrated = 0;
  let skipped = 0;
  for (const d of docs) {
    const mapping = AUDIENCE_MAP[d.audience];
    if (!mapping) {
      console.warn(`[migrate-quotelead] skipping ${d._id} — unknown audience "${d.audience}"`);
      skipped++;
      continue;
    }

    const patch = client.patch(d._id).unset(['audience']);
    // Only set `division` if mapping has one AND the doc doesn't already have one.
    if (mapping.division && !d.division) {
      patch.set({division: mapping.division});
    }
    // Set propertyType if the doc doesn't already have one.
    if (!d.propertyType) {
      patch.set({propertyType: mapping.propertyType});
    }

    await patch.commit({autoGenerateArrayKeys: true});
    migrated++;
  }
  console.log(`[migrate-quotelead] full leads migrated: ${migrated}, skipped: ${skipped}`);
}

async function migratePartialLeads() {
  const docs = await client.fetch(
    '*[_type == "quoteLeadPartial" && defined(audience)]{_id, audience, division}',
  );
  console.log(`[migrate-quotelead] partial leads to migrate: ${docs.length}`);

  let migrated = 0;
  let skipped = 0;
  for (const d of docs) {
    const mapping = AUDIENCE_MAP[d.audience];
    if (!mapping) {
      console.warn(`[migrate-quotelead] skipping partial ${d._id} — unknown audience "${d.audience}"`);
      skipped++;
      continue;
    }
    const patch = client.patch(d._id).unset(['audience']);
    if (mapping.division && !d.division) {
      patch.set({division: mapping.division});
    }
    await patch.commit({autoGenerateArrayKeys: true});
    migrated++;
  }
  console.log(`[migrate-quotelead] partial leads migrated: ${migrated}, skipped: ${skipped}`);
}

async function main() {
  console.log(`[migrate-quotelead] project=${PROJECT_ID} dataset=${DATASET}`);
  await migrateFullLeads();
  await migratePartialLeads();
  console.log('[migrate-quotelead] done.');
}

main().catch((err) => {
  console.error('[migrate-quotelead] fatal', err);
  process.exit(1);
});
