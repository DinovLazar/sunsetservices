#!/usr/bin/env node
/**
 * Phase B.07 — Backfill `unsubscribeToken` on pre-existing `newsletterSubscriber` docs.
 *
 * One-shot CLI. Idempotent — second run finds zero matches and exits clean.
 *
 * Query:  *[_type == "newsletterSubscriber" && !defined(unsubscribeToken)]
 * Patch:  client.patch(_id).set({unsubscribeToken: crypto.randomUUID()}).commit()
 *
 * Today the dev window almost certainly has zero real subscribers — the
 * script's job is to exist for the eventual production cutover. Today's
 * expected output is "0 documents needed a token."
 *
 * Run:
 *   node scripts/backfill-newsletter-tokens.mjs
 *   npm run sanity:backfill-unsubscribe-tokens
 *
 * Requires: SANITY_API_WRITE_TOKEN + NEXT_PUBLIC_SANITY_* in .env.local.
 */

import crypto from 'node:crypto';
import {readFileSync, existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createClient} from '@sanity/client';

// ---------- env loader (mirrors translate-sanity-es.mjs / seed-sanity.mjs) ----------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

function loadEnvLocal() {
  const envPath = path.join(repoRoot, '.env.local');
  if (!existsSync(envPath)) {
    console.error(`[backfill-newsletter-tokens] ERROR: ${envPath} not found.`);
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
  console.error('[backfill-newsletter-tokens] ERROR: SANITY_API_WRITE_TOKEN unset.');
  process.exit(1);
}
if (!PROJECT_ID) {
  console.error('[backfill-newsletter-tokens] ERROR: NEXT_PUBLIC_SANITY_PROJECT_ID unset.');
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  token: TOKEN,
  useCdn: false,
});

async function main() {
  console.log('[backfill-newsletter-tokens] querying for docs without unsubscribeToken…');
  const docs = await client.fetch(
    `*[_type == "newsletterSubscriber" && !defined(unsubscribeToken)]{_id, email}`,
  );
  console.log(`[backfill-newsletter-tokens] found ${docs.length} doc(s) needing a token.`);

  if (docs.length === 0) {
    console.log('[backfill-newsletter-tokens] nothing to do — exiting clean.');
    return;
  }

  let patched = 0;
  for (const d of docs) {
    const token = crypto.randomUUID();
    try {
      await client.patch(d._id).set({unsubscribeToken: token}).commit();
      patched += 1;
      console.log(`  ✔ ${d._id} (${d.email}) — token set`);
    } catch (err) {
      console.error(`  ✖ ${d._id} (${d.email}) — patch failed: ${err.message}`);
    }
  }

  console.log(`[backfill-newsletter-tokens] done. ${patched}/${docs.length} doc(s) patched.`);
}

main().catch((err) => {
  console.error(`[backfill-newsletter-tokens] fatal:`, err);
  process.exit(2);
});
