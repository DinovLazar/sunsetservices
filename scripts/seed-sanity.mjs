/**
 * Phase 2.05 — Sanity migration script.
 *
 * Idempotent: re-running produces the same document set (deterministic _ids
 * + createOrReplace).
 *
 * Order matters because of references — services + locations must exist
 * before projects + reviews + faqs reference them.
 *
 * Run via:   npx tsx scripts/seed-sanity.mjs
 * Requires:  SANITY_API_WRITE_TOKEN + NEXT_PUBLIC_SANITY_* in .env.local
 */

import {readFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {marked} from 'marked';
import {JSDOM} from 'jsdom';
import {htmlToBlocks} from '@portabletext/block-tools';
import {Schema} from '@sanity/schema';
import {createClient} from '@sanity/client';

// ---------- env loader (no dotenv dep) ----------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

function loadEnvLocal() {
  const envPath = path.join(repoRoot, '.env.local');
  if (!existsSync(envPath)) {
    console.error(`[seed] ERROR: ${envPath} not found.`);
    process.exit(1);
  }
  const raw = readFileSync(envPath, 'utf8');
  // `.env.local` wins over the shell — important on Windows where developers
  // sometimes have a stale NEXT_PUBLIC_SANITY_PROJECT_ID exported globally
  // that would silently route writes to the wrong project.
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
  console.error('[seed] ERROR: SANITY_API_WRITE_TOKEN is unset or is a placeholder.');
  console.error('       Create one at https://www.sanity.io/manage/personal/project/' + (PROJECT_ID ?? 'i3fawnrl') + '/api → Tokens (Editor perms).');
  process.exit(1);
}
if (!PROJECT_ID) {
  console.error('[seed] ERROR: NEXT_PUBLIC_SANITY_PROJECT_ID is unset.');
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  token: TOKEN,
  useCdn: false,
});

// ---------- Portable Text schema (for Markdown → PT conversion) ----------
// Block-only schema; HTML <img> tags in source Markdown are rare and would
// need real Sanity asset uploads anyway, so we drop them at conversion time.
const ptSchema = Schema.compile({
  name: 'ptSchema',
  types: [
    {
      type: 'object',
      name: 'wrapper',
      fields: [{name: 'body', type: 'array', of: [{type: 'block'}]}],
    },
  ],
});
const blockContentType = ptSchema
  .get('wrapper')
  .fields.find((f) => f.name === 'body').type;

function mdToBlocks(md) {
  if (!md || typeof md !== 'string') return [];
  // marked.parse may return a Promise in async mode; force sync via { async: false }
  const html = marked.parse(md, {async: false, gfm: true, breaks: false});
  if (typeof html !== 'string') {
    throw new Error('marked.parse returned non-string; check async option');
  }
  return htmlToBlocks(html, blockContentType, {
    parseHtml: (h) => new JSDOM(h).window.document,
  });
}

// ---------- helpers ----------
const counts = {
  service: 0,
  location: 0,
  team: 0,
  review: 0,
  faq: 0,
  project: 0,
  resourceArticle: 0,
  blogPost: 0,
};

async function put(doc) {
  process.stdout.write(`  [${doc._type}] ${doc.slug?.current ?? doc._id}\n`);
  await client.createOrReplace(doc);
  counts[doc._type] = (counts[doc._type] ?? 0) + 1;
}

function localized(en, es) {
  const out = {_type: 'localizedString', en: en ?? ''};
  if (es != null && es !== '') out.es = es;
  return out;
}

function localizedText(en, es) {
  // Same shape — uses the localizedText / localizedString objects (both have en + optional es).
  return localized(en, es);
}

// ---------- migration ----------
async function main() {
  console.log(`[seed] Sanity ${PROJECT_ID}/${DATASET} (apiVersion ${API_VERSION})`);
  console.log('[seed] Loading TS source data…');

  const services = (await import('../src/data/services.ts')).SERVICES;
  const locationsModule = await import('../src/data/locations.ts');
  const LOCATIONS = locationsModule.LOCATIONS;
  // team.ts imports next/image static .jpg assets which tsx cannot parse.
  // Hardcoded here (3 members, mirrors src/data/team.ts; update both if either changes).
  const team = [
    {slug: 'erick', name: 'Erick Valle', roleKey: 'owner'},
    {slug: 'nick', name: 'Nick Valle', roleKey: 'founder'},
    {slug: 'marcin', name: 'Marcin', roleKey: 'hardscape_lead'},
  ];
  const projectsModule = await import('../src/data/projects.ts');
  const PROJECTS = projectsModule.PROJECTS;
  const blogModule = await import('../src/data/blog.ts');
  const BLOG_POSTS = blogModule.BLOG_POSTS;
  const resourcesModule = await import('../src/data/resources.ts');
  const RESOURCES = resourcesModule.RESOURCES;

  console.log(
    `[seed] Source counts: services=${services.length} locations=${LOCATIONS.length} ` +
      `team=${team.length} projects=${PROJECTS.length} blog=${BLOG_POSTS.length} ` +
      `resources=${RESOURCES.length}`,
  );

  // -------- 1. Service stubs --------
  // _id includes audience because two services share the URL slug
  // (residential/snow-removal AND commercial/snow-removal). Without the
  // audience prefix the second createOrReplace would clobber the first.
  console.log('\n[seed] (1/8) Service stubs');
  for (let i = 0; i < services.length; i++) {
    const s = services[i];
    await put({
      _id: `service-${s.audience}-${s.slug}`,
      _type: 'service',
      slug: {_type: 'slug', current: s.slug},
      title: localized(s.name.en, s.name.es),
      audience: s.audience,
      order: i,
      ...(s.imageKey ? {imageKey: s.imageKey} : {}),
    });
  }

  // -------- 2. Location stubs --------
  console.log('\n[seed] (2/8) Location stubs');
  for (const loc of LOCATIONS) {
    await put({
      _id: `location-${loc.slug}`,
      _type: 'location',
      slug: {_type: 'slug', current: loc.slug},
      name: loc.name,
      geo: {lat: loc.geo.lat, lng: loc.geo.lng},
      pin: {x: loc.pin.x, y: loc.pin.y},
    });
  }

  // -------- 3. Team stubs --------
  console.log('\n[seed] (3/8) Team stubs');
  for (let i = 0; i < team.length; i++) {
    const t = team[i];
    await put({
      _id: `team-${t.slug}`,
      _type: 'team',
      slug: {_type: 'slug', current: t.slug},
      name: t.name,
      // role + bio not localized in TS; leave empty for now.
      role: localized(t.roleKey, undefined),
      order: i,
    });
  }

  // -------- 4. Reviews (placeholders from locations.testimonials) --------
  console.log('\n[seed] (4/8) Reviews (placeholders)');
  for (const loc of LOCATIONS) {
    for (let i = 0; i < loc.testimonials.length; i++) {
      const t = loc.testimonials[i];
      const n = i + 1;
      await put({
        _id: `review-${loc.slug}-${n}`,
        _type: 'review',
        quote: localized(t.quote.en, t.quote.es),
        attribution: localized(t.attribution.en, t.attribution.es),
        rating: t.rating ?? 5,
        source: 'manual',
        placeholder: true,
        city: {_type: 'reference', _ref: `location-${loc.slug}`},
      });
    }
  }

  // -------- 5. FAQs (split from services.faq + locations.faq) --------
  // Per-service scope uses `service:<audience>:<slug>` to keep residential
  // and commercial snow-removal FAQs from being merged at query time.
  console.log('\n[seed] (5/8) FAQs (per-service + per-city)');
  // Per-service
  for (const s of services) {
    if (!Array.isArray(s.faq)) continue;
    for (let i = 0; i < s.faq.length; i++) {
      const item = s.faq[i];
      const n = String(i + 1).padStart(3, '0');
      await put({
        _id: `faq-service-${s.audience}-${s.slug}-${n}`,
        _type: 'faq',
        scope: `service:${s.audience}:${s.slug}`,
        question: localized(item.question.en, item.question.es),
        answer: localized(item.answer.en, item.answer.es),
        order: i,
      });
    }
  }
  // Per-city
  for (const loc of LOCATIONS) {
    if (!Array.isArray(loc.faq)) continue;
    for (let i = 0; i < loc.faq.length; i++) {
      const item = loc.faq[i];
      const n = String(i + 1).padStart(3, '0');
      await put({
        _id: `faq-city-${loc.slug}-${n}`,
        _type: 'faq',
        scope: `city:${loc.slug}`,
        question: localized(item.q.en, item.q.es),
        answer: localized(item.a.en, item.a.es),
        order: i,
      });
    }
  }

  // -------- 6. Projects --------
  console.log('\n[seed] (6/8) Projects');
  for (const p of PROJECTS) {
    // services references: project.serviceSlugs may include slugs that exist in both audiences (e.g. snow-removal).
    // Pick the service whose audience matches the project's audience first; fall back to any match.
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
    await put(doc);
  }

  // -------- 7. Resource articles --------
  console.log('\n[seed] (7/8) Resource articles');
  for (const r of RESOURCES) {
    const bodyEn = mdToBlocks(r.body?.en);
    const bodyEs = mdToBlocks(r.body?.es);
    const doc = {
      _id: `resourceArticle-${r.slug}`,
      _type: 'resourceArticle',
      slug: {_type: 'slug', current: r.slug},
      title: localized(r.title.en, r.title.es),
      dek: localized(r.dek.en, r.dek.es),
      body: {
        _type: 'localizedBody',
        en: bodyEn,
        es: bodyEs,
      },
      category: r.category,
      schemaType: r.schemaType,
    };
    if (r.seoDescription) {
      doc.seo = {
        _type: 'localizedSeo',
        description: localized(r.seoDescription.en, r.seoDescription.es),
      };
    }
    if (r.inlineServiceCrossLink) {
      doc.crossLinkAudience = r.inlineServiceCrossLink.audience;
      doc.crossLinkServiceSlug = r.inlineServiceCrossLink.serviceSlug;
    }
    await put(doc);
  }

  // -------- 8. Blog posts --------
  console.log('\n[seed] (8/8) Blog posts');
  for (const b of BLOG_POSTS) {
    const bodyEn = mdToBlocks(b.body?.en);
    const bodyEs = mdToBlocks(b.body?.es);
    const doc = {
      _id: `blogPost-${b.slug}`,
      _type: 'blogPost',
      slug: {_type: 'slug', current: b.slug},
      title: localized(b.title.en, b.title.es),
      dek: localized(b.dek.en, b.dek.es),
      body: {
        _type: 'localizedBody',
        en: bodyEn,
        es: bodyEs,
      },
      publishedAt: b.publishedAt
        ? new Date(b.publishedAt).toISOString()
        : new Date().toISOString(),
      author: b.byline ?? 'Sunset Services Team',
      category: b.category,
    };
    if (b.seoDescription) {
      doc.seo = {
        _type: 'localizedSeo',
        description: localized(b.seoDescription.en, b.seoDescription.es),
      };
    }
    if (b.inlineLocationCity) doc.citySlug = b.inlineLocationCity;
    if (b.inlineServiceCrossLink) {
      doc.crossLinkAudience = b.inlineServiceCrossLink.audience;
      doc.crossLinkServiceSlug = b.inlineServiceCrossLink.serviceSlug;
    }
    await put(doc);
  }

  // ---------- summary ----------
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log('\nMigration complete.');
  console.log(`  Services (stubs):      ${String(counts.service).padStart(3)}`);
  console.log(`  Locations (stubs):     ${String(counts.location).padStart(3)}`);
  console.log(`  Team (stubs):          ${String(counts.team).padStart(3)}`);
  console.log(`  Reviews:               ${String(counts.review).padStart(3)}`);
  console.log(`  FAQs:                  ${String(counts.faq).padStart(3)}`);
  console.log(`  Projects:              ${String(counts.project).padStart(3)}`);
  console.log(`  Resource articles:     ${String(counts.resourceArticle).padStart(3)}`);
  console.log(`  Blog posts:            ${String(counts.blogPost).padStart(3)}`);
  console.log(`  ${'='.repeat(28)}`);
  console.log(`  Total:                 ${String(total).padStart(3)}`);

  // Spot-check: print the first PT block of the first migrated resource (proves conversion worked)
  if (RESOURCES.length > 0) {
    const first = RESOURCES[0];
    const firstBlock = mdToBlocks(first.body?.en)?.[0];
    if (firstBlock) {
      const preview =
        firstBlock.children?.[0]?.text?.slice(0, 60) ??
        firstBlock._type ??
        '(no text)';
      console.log(`\n[seed] PT spot-check (resource '${first.slug}', block 1): "${preview}…"`);
    }
  }
}

main().catch((err) => {
  console.error('[seed] FAILED:', err);
  process.exit(1);
});
