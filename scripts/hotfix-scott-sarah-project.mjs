/**
 * Part-2 Hotfix — rename & complete the mis-titled "Scott & Sarah's" project.
 *
 * A single portfolio `project` document was live showing a client's personal
 * name as the title ("Scott & Sarah's"), a blank materials list, and no
 * duration. Marcin sent the real details; this one-off patch puts them onto the
 * document programmatically (reviewable in git) instead of hand-editing Studio.
 *
 * It sets: title (EN/ES), slug, durationWeeks, and a 6-item keyed materials
 * list. It does NOT touch the document `_id` (slug is just a field).
 *
 * SAFE + IDEMPOTENT:
 *   - Never guesses the `_id`. Finds the target by GROQ, matching EITHER its
 *     pre-fix state (title starts "Scott") OR its post-fix state (the new
 *     slug), so a re-run resolves the same document.
 *   - Aborts loudly on zero or multiple distinct base documents.
 *   - Re-running when already fixed prints "already up to date" and writes
 *     nothing (no needless _rev bump).
 *   - If a `drafts.<id>` copy exists, patches it identically so a stale draft
 *     can't later overwrite the fix on Publish.
 *
 * Run via:   npx tsx scripts/hotfix-scott-sarah-project.mjs
 * Requires:  SANITY_API_WRITE_TOKEN (Editor) + NEXT_PUBLIC_SANITY_* in .env.local
 */

import {readFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createClient} from '@sanity/client';

// ---------- env loader (identical to seed-sanity.mjs) ----------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

function loadEnvLocal() {
  const envPath = path.join(repoRoot, '.env.local');
  if (!existsSync(envPath)) {
    console.error(`[hotfix] ERROR: ${envPath} not found.`);
    process.exit(1);
  }
  const raw = readFileSync(envPath, 'utf8');
  // `.env.local` wins over the shell — same rationale as seed-sanity.mjs: a
  // stale globally-exported NEXT_PUBLIC_SANITY_PROJECT_ID must not silently
  // route writes to the wrong project.
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const [, key, val] = m;
    const cleaned = val.replace(/^['"]|['"]$/g, '');
    process.env[key] = cleaned;
  }
}

loadEnvLocal();

const TOKEN = process.env.SANITY_API_WRITE_TOKEN;
const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01';

const PLACEHOLDER_TOKEN_PATTERNS = ['REPLACE_ME', '<token>', ''];
if (!TOKEN || PLACEHOLDER_TOKEN_PATTERNS.includes(TOKEN)) {
  console.error('[hotfix] ERROR: SANITY_API_WRITE_TOKEN is unset or is a placeholder.');
  console.error(
    '        Create one at https://www.sanity.io/manage/personal/project/' +
      (PROJECT_ID ?? 'i3fawnrl') +
      '/api → Tokens (Editor perms), or restore .env.local via `vercel env pull`.',
  );
  process.exit(1);
}
if (!PROJECT_ID) {
  console.error('[hotfix] ERROR: NEXT_PUBLIC_SANITY_PROJECT_ID is unset.');
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  token: TOKEN,
  useCdn: false,
});

// ---------- authoritative desired state (exact strings — do not paraphrase) ----------
const NEW_SLUG = 'granite-fusion-walkway-seating-wall';
const OLD_TITLE_MATCH = 'Scott*'; // pre-fix identity (title.en)

const NEW_TITLE = {
  _type: 'localizedString',
  en: 'Granite Fusion Walkway & Seating Wall',
  es: 'Sendero y muro de asiento — Granite Fusion',
};
const NEW_DURATION_WEEKS = 6;
const NEW_MATERIALS = [
  {
    _type: 'localizedString',
    _key: 'mat-paver',
    en: 'Paver — Unilock Beacon Hill Smooth, Granite Fusion',
    es: 'Adoquín — Unilock Beacon Hill Smooth, color Granite Fusion',
  },
  {
    _type: 'localizedString',
    _key: 'mat-border',
    en: 'Border — Unilock Hollandstone, Charcoal',
    es: 'Borde — Unilock Hollandstone, color Charcoal',
  },
  {
    _type: 'localizedString',
    _key: 'mat-wall',
    en: 'Wall system — Unilock Olde Quarry, Granite',
    es: 'Sistema de muro — Unilock Olde Quarry, color Granite',
  },
  {
    _type: 'localizedString',
    _key: 'mat-coping',
    en: 'Coping — Unilock Umbriano (chamfered), French Grey',
    es: 'Remate (coping) — Unilock Umbriano (biselado), color French Grey',
  },
  {
    _type: 'localizedString',
    _key: 'mat-lighting',
    en: 'Lighting — Kichler',
    es: 'Iluminación — Kichler',
  },
  {
    _type: 'localizedString',
    _key: 'mat-deck',
    en: 'Deck — TimberTech',
    es: 'Terraza (deck) — TimberTech',
  },
];

const DESIRED_SET = {
  title: NEW_TITLE,
  slug: {_type: 'slug', current: NEW_SLUG},
  durationWeeks: NEW_DURATION_WEEKS,
  materials: NEW_MATERIALS,
};

// ---------- helpers ----------
const stripDrafts = (id) => id.replace(/^drafts\./, '');

function materialsEqual(actual) {
  if (!Array.isArray(actual) || actual.length !== NEW_MATERIALS.length) return false;
  return NEW_MATERIALS.every((m, i) => {
    const a = actual[i];
    return a && a._key === m._key && a.en === m.en && a.es === m.es;
  });
}

function isUpToDate(doc) {
  if (!doc) return false;
  return (
    doc.title?.en === NEW_TITLE.en &&
    doc.title?.es === NEW_TITLE.es &&
    doc.slug?.current === NEW_SLUG &&
    doc.durationWeeks === NEW_DURATION_WEEKS &&
    materialsEqual(doc.materials)
  );
}

function snapshot(doc) {
  if (!doc) return null;
  return {
    _id: doc._id,
    _rev: doc._rev,
    title: doc.title ?? null,
    slug: doc.slug ?? null,
    durationWeeks: doc.durationWeeks ?? null,
    materials: doc.materials ?? null,
  };
}

async function main() {
  console.log(`[hotfix] Sanity ${PROJECT_ID}/${DATASET} (apiVersion ${API_VERSION})`);

  // -------- 1. Find the document — never guess its _id --------
  // Match pre-fix (title "Scott*") OR post-fix (the new slug) so a re-run
  // resolves the same document even after the rename.
  const matches = await client.fetch(
    `*[_type == "project" && (title.en match $old || slug.current == $newSlug)]{
      _id, _rev, slug, title, durationWeeks, materials
    }`,
    {old: OLD_TITLE_MATCH, newSlug: NEW_SLUG},
  );

  const baseIds = [...new Set(matches.map((m) => stripDrafts(m._id)))];

  if (baseIds.length === 0) {
    console.error(
      '\n[hotfix] ABORT: zero matching projects (title "Scott*" or slug ' +
        `"${NEW_SLUG}"). Nothing patched.`,
    );
    const all = await client.fetch(
      `*[_type == "project"] | order(title.en asc){_id, "title": title.en, "slug": slug.current}`,
    );
    console.error(`\n[hotfix] All ${all.length} project documents (for a human to identify):`);
    for (const p of all) {
      console.error(`  - ${p._id}  |  title.en="${p.title ?? ''}"  |  slug=${p.slug ?? ''}`);
    }
    process.exit(1);
  }

  if (baseIds.length > 1) {
    console.error('\n[hotfix] ABORT: more than one distinct base document matched. Not guessing.');
    console.error('[hotfix] Candidates:');
    for (const m of matches) {
      console.error(
        `  - ${m._id}  |  title.en="${m.title?.en ?? ''}"  |  slug=${m.slug?.current ?? ''}`,
      );
    }
    process.exit(1);
  }

  const baseId = baseIds[0];
  const publishedDoc = matches.find((m) => m._id === baseId) ?? (await client.getDocument(baseId));
  const draftId = `drafts.${baseId}`;
  const draftDoc = matches.find((m) => m._id === draftId) ?? (await client.getDocument(draftId));
  const hasDraft = Boolean(draftDoc);

  console.log(`\n[hotfix] Resolved target base _id: ${baseId}`);
  console.log(`[hotfix] Draft copy present: ${hasDraft ? 'YES (' + draftId + ')' : 'no'}`);
  console.log(`[hotfix] Old slug: ${publishedDoc?.slug?.current ?? '(none)'}`);

  // -------- 2. BEFORE snapshot (the revert record) --------
  console.log('\n[hotfix] ===== BEFORE (published) =====');
  console.log(JSON.stringify(snapshot(publishedDoc), null, 2));
  if (hasDraft) {
    console.log('\n[hotfix] ===== BEFORE (draft) =====');
    console.log(JSON.stringify(snapshot(draftDoc), null, 2));
  }

  // -------- 3. Patch published (skip if already up to date) --------
  console.log('\n[hotfix] ----- applying patch -----');
  if (isUpToDate(publishedDoc)) {
    console.log(`[hotfix] ✓ published ${baseId} already up to date — no write.`);
  } else {
    await client.patch(baseId).set(DESIRED_SET).commit();
    console.log(`[hotfix] ✔ patched published ${baseId}.`);
  }

  // Patch the draft identically ONLY if one exists.
  if (hasDraft) {
    if (isUpToDate(draftDoc)) {
      console.log(`[hotfix] ✓ draft ${draftId} already up to date — no write.`);
    } else {
      await client.patch(draftId).set(DESIRED_SET).commit();
      console.log(`[hotfix] ✔ patched draft ${draftId}.`);
    }
  } else {
    console.log('[hotfix] no draft copy — nothing extra to patch.');
  }

  // -------- 4. Verify (re-read from the API) --------
  const after = await client.getDocument(baseId);
  console.log('\n[hotfix] ===== AFTER (published, re-read) =====');
  console.log(
    JSON.stringify(
      {
        _id: after?._id,
        title: after?.title,
        slug: after?.slug,
        durationWeeks: after?.durationWeeks,
        materialsCount: Array.isArray(after?.materials) ? after.materials.length : 0,
        materials: after?.materials,
      },
      null,
      2,
    ),
  );

  const checks = [
    ['title.en', after?.title?.en === NEW_TITLE.en],
    ['title.es', after?.title?.es === NEW_TITLE.es],
    ['slug.current', after?.slug?.current === NEW_SLUG],
    ['durationWeeks === 6', after?.durationWeeks === NEW_DURATION_WEEKS],
    ['materials (6 keyed, EN+ES)', materialsEqual(after?.materials)],
  ];
  console.log('\n[hotfix] ----- verification -----');
  let ok = true;
  for (const [label, pass] of checks) {
    console.log(`  ${pass ? '✔' : '✗'} ${label}: ${pass ? 'PASS' : 'FAIL'}`);
    if (!pass) ok = false;
  }

  if (!ok) {
    console.error('\n[hotfix] FAILED: post-write verification did not pass.');
    process.exit(1);
  }
  console.log('\n[hotfix] DONE — document is correct and idempotent.');
}

main().catch((err) => {
  console.error('[hotfix] FAILED:', err);
  process.exit(1);
});
