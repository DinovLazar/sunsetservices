#!/usr/bin/env node
/**
 * Phase B.05 — SEO validation harness.
 *
 * Mirrors the B.04 schema harness's env-var + exit-code + JSON-sidecar
 * contract; validates the SEO surface — canonicals, hreflang, sitemap,
 * robots — against the locked rules from the Phase B.05 plan.
 *
 * Per-URL checks:
 *   1. HTTP 200 (with-slash redirects 308 → no-slash is acceptable, but
 *      the no-slash target itself must 200).
 *   2. Exactly one <link rel="canonical"> in <head>.
 *   3. Canonical href has no trailing slash (except scheme://host root).
 *   4. Canonical href equals the no-slash form of the served URL.
 *   5. Three <link rel="alternate" hreflang="..."> tags: en + es + x-default.
 *      No duplicates. No other hreflang values.
 *   6. All three hreflang hrefs are trailing-slash-stripped.
 *   7. The `x-default` href equals the `en` href.
 *   8. Hreflang reciprocity — every URL claimed as a hreflang alternate
 *      appears in the expected fetched set, and the route at that URL
 *      emits matching alternates back.
 *   9. <meta name="robots"> correctness:
 *      - /thank-you/ + /es/thank-you/ → must include `noindex`
 *      - /dev/system + /es/dev/system → must include `noindex`
 *      - every other expected URL → must NOT include `noindex`
 *
 * Sitewide checks:
 *  10. Sitemap completeness — every EXPECTED_URL appears in the sitemap;
 *      no excluded URL does.
 *  11. Sitemap entries no-slash — every <loc> in the sitemap (besides
 *      the bare host root, if present) has no trailing slash.
 *  12. robots.txt sanity — contains an absolute `Sitemap:` line; no broad
 *      `Disallow: /` at the User-agent: * root.
 *  13. Sitemap alternates — each <url> entry has en + es + x-default
 *      <xhtml:link rel="alternate" hreflang="..." href="..."/> children
 *      matching the page-level hreflang.
 *
 * USAGE
 *   node scripts/validate-seo.mjs                                  # localhost:3000
 *   BASE_URL=https://preview.vercel.app node scripts/validate-seo.mjs
 *   BASE_URL=https://preview.vercel.app BYPASS_TOKEN=xyz node scripts/validate-seo.mjs
 *
 * EXIT CODE
 *   0  Zero errors AND zero warnings — required to close Phase B.05.
 *   1  Any error or warning surfaced on any page / sitemap / robots check.
 *
 * OUTPUTS
 *   stdout                                            colored per-URL table
 *   scripts/.seo-validation-report.json               full machine report
 *   scripts/.seo-validation-cache.json                (currently unused;
 *                                                     reserved for future
 *                                                     remote-validator
 *                                                     calls so the file
 *                                                     name lines up with
 *                                                     the gitignore entry)
 *
 * The committed snapshot of the table lives inline in
 * `src/_project-state/Phase-B-05-Completion.md`.
 */

import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const BYPASS_TOKEN = process.env.BYPASS_TOKEN || '';
// Phase B.07: `_vercel_share` token (from the Vercel MCP `get_access_to_vercel_url`)
// produces the same `_vercel_jwt` cookie as `x-vercel-protection-bypass` but
// uses a different priming query param. When set, the share-token path wins.
const SHARE_TOKEN = process.env.VERCEL_SHARE_TOKEN || '';
// Reserved env var; harness currently does no remote-validator calls. Kept
// in the contract for parity with B.04 — surface it so future extensions
// (Google Search Console URL inspection, etc.) can plug in without
// changing the env shape.
const SKIP_REMOTE = process.env.SKIP_REMOTE === '1';

const REPORT_PATH = resolve('scripts/.seo-validation-report.json');

const SITE_ORIGIN = 'https://sunsetservices.us';

// ---------------------------------------------------------------------------
// Expected routes — the harness's hardcoded contract.
//
// The app's sitemap.ts walks these dynamically; this list is the
// independent assertion. Drift between them is a sitemap-completeness
// finding the harness surfaces.
//
// Routes are locale-less for EN (no prefix), `/es`-prefixed for ES. The
// homepage is `/` for EN and `/es` for ES.
// ---------------------------------------------------------------------------

const AUDIENCES = ['residential', 'commercial', 'hardscape'];

const SERVICE_SLUGS = {
  // Mirrors src/data/services.ts. Total: 16 services across 3 audiences.
  residential: [
    'lawn-care',
    'landscape-design',
    'tree-services',
    'sprinkler-systems',
    'snow-removal',
    'seasonal-cleanup',
  ],
  commercial: [
    'landscape-maintenance',
    'snow-removal',
    'property-enhancement',
    'turf-management',
  ],
  hardscape: [
    'patios-walkways',
    'retaining-walls',
    'fire-pits-features',
    'pergolas-pavilions',
    'driveways',
    'outdoor-kitchens',
  ],
};

const CITY_SLUGS = [
  'aurora',
  'naperville',
  'batavia',
  'wheaton',
  'lisle',
  'bolingbrook',
];

const PROJECT_SLUGS = [
  'naperville-hilltop-terrace',
  'naperville-fire-court',
  'aurora-hoa-curb-refresh',
  'aurora-driveway-apron',
  'wheaton-lawn-reset',
  'wheaton-bank-frontage',
  'lisle-retaining-wall',
  'lisle-backyard-refresh',
  'batavia-garden-reset',
  'batavia-front-walk',
  'bolingbrook-office-court',
  'bolingbrook-paver-plaza',
];

const BLOG_SLUGS = [
  'dupage-patio-cost-2026',
  'aurora-spring-lawn-calendar',
  'why-unilock-premium-pavers',
  'snow-for-commercial-properties',
  'sprinkler-tune-up-7-signs',
];

const RESOURCE_SLUGS = [
  'patio-materials-guide',
  'how-to-choose-a-landscaper',
  'lawn-care-glossary',
  'snow-service-levels-for-pms',
  'dupage-hardscape-permits',
];

function buildEnPaths() {
  const out = [];
  out.push('/');
  for (const a of AUDIENCES) {
    out.push(`/${a}`);
    for (const s of SERVICE_SLUGS[a]) {
      out.push(`/${a}/${s}`);
    }
  }
  out.push('/service-areas');
  for (const c of CITY_SLUGS) out.push(`/service-areas/${c}`);
  out.push('/projects');
  for (const p of PROJECT_SLUGS) out.push(`/projects/${p}`);
  out.push('/about');
  out.push('/contact');
  out.push('/resources');
  for (const r of RESOURCE_SLUGS) out.push(`/resources/${r}`);
  out.push('/blog');
  for (const b of BLOG_SLUGS) out.push(`/blog/${b}`);
  out.push('/privacy');
  out.push('/terms');
  out.push('/request-quote');
  return out;
}

const EN_PATHS = buildEnPaths();
const ES_PATHS = EN_PATHS.map((p) => (p === '/' ? '/es' : `/es${p}`));

const EXPECTED_PATHS = [...EN_PATHS, ...ES_PATHS];

// Sitemap exclusions per D6 + plan §1.
// Phase B.07 added `/unsubscribe/SAMPLE_TOKEN_INVALID` + ES variant — the
// page is token-gated + noindex; invalid-token renders 200 with the
// "invalid" state, which is the harness's per-noindex assertion target.
const EXCLUDED_PATHS = new Set([
  '/thank-you',
  '/es/thank-you',
  '/dev/system',
  '/es/dev/system',
  '/unsubscribe/SAMPLE_TOKEN_INVALID',
  '/es/unsubscribe/SAMPLE_TOKEN_INVALID',
]);

// Pages we still fetch (to assert noindex/robots-meta) but exclude from
// the sitemap-completeness assertion.
const NOINDEX_PATHS = new Set([
  '/thank-you',
  '/es/thank-you',
  '/dev/system',
  '/es/dev/system',
  '/unsubscribe/SAMPLE_TOKEN_INVALID',
  '/es/unsubscribe/SAMPLE_TOKEN_INVALID',
]);

// Pages we fetch to verify robots-meta. Append all noindex paths to the
// expected set even though they're not part of EXPECTED_PATHS' "indexable"
// sweep — the harness's robots-meta check distinguishes them by the
// NOINDEX_PATHS membership.
const ROBOTS_META_PATHS = [...EXPECTED_PATHS, ...NOINDEX_PATHS];

// Canonicalization helpers — mirror src/lib/seo/urls.ts behavior so the
// harness's expectations match the helper's output exactly.
function normalizePathToNoSlash(pathname) {
  const cleaned = pathname.split('?')[0].split('#')[0];
  const withLeading = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
  if (withLeading === '/') return '';
  return withLeading.replace(/\/+$/, '');
}

function expectedCanonicalForPath(path) {
  // EN root → site origin; ES root → site origin + /es; otherwise
  // SITE_ORIGIN + path (already no-slash).
  const norm = normalizePathToNoSlash(path);
  return `${SITE_ORIGIN}${norm}`;
}

function expectedHreflangForPath(path) {
  // Strip the /es prefix to derive the locale-less path.
  let pathless = path;
  if (path === '/es') pathless = '/';
  else if (path.startsWith('/es/')) pathless = path.slice(3);

  const norm = normalizePathToNoSlash(pathless);
  const en = `${SITE_ORIGIN}${norm}`;
  const es = `${SITE_ORIGIN}/es${norm}`;
  return {en, es, 'x-default': en};
}

// ---------------------------------------------------------------------------
// Pretty printing
// ---------------------------------------------------------------------------

const useColor = process.stdout.isTTY && process.env.NO_COLOR !== '1';
const C = useColor
  ? {
      reset: '\x1b[0m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      cyan: '\x1b[36m',
      gray: '\x1b[90m',
      bold: '\x1b[1m',
    }
  : Object.fromEntries(
      ['reset', 'red', 'green', 'yellow', 'cyan', 'gray', 'bold'].map((k) => [k, '']),
    );

function pad(s, n) {
  s = String(s);
  return s.length >= n ? s.slice(0, n) : s + ' '.repeat(n - s.length);
}

// ---------------------------------------------------------------------------
// Fetch + extract
// ---------------------------------------------------------------------------

let bypassCookie = '';

async function primeBypassCookie() {
  if (bypassCookie) return;
  let url;
  if (SHARE_TOKEN) {
    url = `${BASE_URL}/?_vercel_share=${SHARE_TOKEN}`;
  } else if (BYPASS_TOKEN) {
    url = `${BASE_URL}/?x-vercel-protection-bypass=${BYPASS_TOKEN}&x-vercel-set-bypass-cookie=samesitenone`;
  } else {
    return;
  }
  const res = await fetch(url, {redirect: 'manual'});
  const setCookie = res.headers.get('set-cookie') || '';
  const m = /(_vercel_jwt|vercel_bypass[^=]*)=([^;]+)/i.exec(setCookie);
  if (m) bypassCookie = `${m[1]}=${m[2]}`;
}

async function fetchOnce(url, {redirect = 'follow'} = {}) {
  await primeBypassCookie();
  const headers = {};
  if (bypassCookie) headers.Cookie = bypassCookie;
  return fetch(url, {headers, redirect});
}

async function fetchHtmlAndStatus(path) {
  // First request: no-redirect so we can detect 308s explicitly. Then
  // follow if needed, recording both the served URL and the final HTML.
  const url = `${BASE_URL}${path}`;
  let res = await fetchOnce(url, {redirect: 'manual'});
  let redirected = false;
  let initialStatus = res.status;
  let initialLocation = null;
  if ([301, 302, 303, 307, 308].includes(res.status)) {
    redirected = true;
    initialLocation = res.headers.get('location') || null;
    res = await fetchOnce(url, {redirect: 'follow'});
  }
  const finalUrl = res.url || url;
  const finalStatus = res.status;
  const html = res.ok ? await res.text() : '';
  return {url, finalUrl, initialStatus, initialLocation, finalStatus, html, redirected};
}

async function fetchTextStatus(path) {
  const url = `${BASE_URL}${path}`;
  const res = await fetchOnce(url, {redirect: 'follow'});
  const text = res.ok ? await res.text() : '';
  return {url: res.url || url, status: res.status, text};
}

// ---------------------------------------------------------------------------
// HTML head parsing (regex-based — works on stream'd HTML, doesn't need
// a DOM dependency; matches Next 16's flat <link> / <meta> emission).
// ---------------------------------------------------------------------------

function extractHeadAttrs(html, selector) {
  // selector is e.g. {tag: 'link', match: {rel: 'canonical'}}
  // or {tag: 'link', match: {rel: 'alternate'}} (multi-result)
  const tag = selector.tag;
  const re = new RegExp(`<${tag}\\b[^>]*>`, 'gi');
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    const attrs = parseAttrs(m[0]);
    let ok = true;
    for (const [k, v] of Object.entries(selector.match || {})) {
      if ((attrs[k] || '').toLowerCase() !== v.toLowerCase()) {
        ok = false;
        break;
      }
    }
    if (ok) out.push(attrs);
  }
  return out;
}

function parseAttrs(tagStr) {
  const out = {};
  const re = /(\w[\w-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let m;
  while ((m = re.exec(tagStr)) !== null) {
    const key = m[1].toLowerCase();
    const value = m[3] != null ? m[3] : m[4] != null ? m[4] : m[5];
    out[key] = value;
  }
  return out;
}

function extractCanonicals(html) {
  return extractHeadAttrs(html, {tag: 'link', match: {rel: 'canonical'}}).map(
    (a) => a.href,
  );
}

function extractHreflangs(html) {
  return extractHeadAttrs(html, {tag: 'link', match: {rel: 'alternate'}})
    .filter((a) => a.hreflang)
    .map((a) => ({hreflang: a.hreflang, href: a.href}));
}

function extractRobotsMeta(html) {
  const metas = extractHeadAttrs(html, {tag: 'meta', match: {name: 'robots'}});
  return metas.map((a) => (a.content || '').toLowerCase());
}

// ---------------------------------------------------------------------------
// Sitemap XML parsing
// ---------------------------------------------------------------------------

function parseSitemapXml(xml) {
  // Returns Array<{loc: string, lastmod?: string, alternates: Record<string, string>}>
  const urls = [];
  const urlBlockRe = /<url\b[^>]*>([\s\S]*?)<\/url>/gi;
  let m;
  while ((m = urlBlockRe.exec(xml)) !== null) {
    const block = m[1];
    const loc = (/<loc>\s*([\s\S]*?)\s*<\/loc>/i.exec(block) || [])[1];
    const lastmod = (/<lastmod>\s*([\s\S]*?)\s*<\/lastmod>/i.exec(block) || [])[1];
    const alternates = {};
    const altRe = /<xhtml:link\b[^>]*?\s+rel=["']alternate["'][^>]*>/gi;
    let altMatch;
    while ((altMatch = altRe.exec(block)) !== null) {
      const attrs = parseAttrs(altMatch[0]);
      if (attrs.hreflang) alternates[attrs.hreflang] = attrs.href;
    }
    if (loc) urls.push({loc, lastmod, alternates});
  }
  return urls;
}

// ---------------------------------------------------------------------------
// Per-URL validation
// ---------------------------------------------------------------------------

function isNoIndexPath(path) {
  return NOINDEX_PATHS.has(path);
}

async function validateUrlPage(path) {
  const result = {
    path,
    errors: [],
    warnings: [],
    canonical: null,
    hreflang: null,
    robotsMeta: null,
  };

  let fetched;
  try {
    fetched = await fetchHtmlAndStatus(path);
  } catch (err) {
    result.errors.push(`fetch failed: ${err.message}`);
    return result;
  }

  // Check 1 — HTTP 200 on the final response (after any redirect).
  if (fetched.finalStatus !== 200) {
    result.errors.push(
      `final HTTP ${fetched.finalStatus} (initial ${fetched.initialStatus}) for ${fetched.url}`,
    );
    return result;
  }

  // Defensive — if a 308 redirected somewhere unexpected, flag the
  // mismatch so it can't silently mask a routing bug.
  if (fetched.redirected) {
    const expected = `${BASE_URL}${normalizePathToNoSlash(path)}` || BASE_URL;
    if (fetched.finalUrl !== expected) {
      // Acceptable only if the redirect lands on the canonical no-slash form.
      const stripped = fetched.finalUrl.replace(/\/$/, '');
      if (stripped !== expected) {
        result.warnings.push(
          `redirect from ${fetched.url} landed at ${fetched.finalUrl} (expected ${expected})`,
        );
      }
    }
  }

  const html = fetched.html;

  // Check 2 — exactly one canonical
  const canons = extractCanonicals(html);
  if (canons.length === 0) {
    if (!isNoIndexPath(path)) {
      result.errors.push('no <link rel="canonical"> in <head>');
    }
  } else if (canons.length > 1) {
    result.errors.push(`${canons.length} <link rel="canonical"> tags found (expected exactly 1)`);
  }
  const canonical = canons[0] || null;
  result.canonical = canonical;

  // Robots meta first — we use it below to skip canonical / hreflang
  // checks on noindex pages (no canonical or alternates expected).
  const robotsMetaContents = extractRobotsMeta(html);
  result.robotsMeta = robotsMetaContents.join(' | ');

  const isNoIndex = isNoIndexPath(path);

  // Check 9 — robots meta correctness
  if (isNoIndex) {
    if (!robotsMetaContents.some((s) => /\bnoindex\b/.test(s))) {
      result.errors.push(
        `expected <meta name="robots" content="...noindex..."> on noindex route ${path}; got ${
          robotsMetaContents.length === 0 ? '<none>' : JSON.stringify(robotsMetaContents)
        }`,
      );
    }
  } else {
    if (robotsMetaContents.some((s) => /\bnoindex\b/.test(s))) {
      result.errors.push(
        `unexpected noindex on indexable route ${path}: ${JSON.stringify(robotsMetaContents)}`,
      );
    }
  }

  // Skip canonical + hreflang checks on noindex pages.
  if (isNoIndex) {
    return result;
  }

  if (canonical) {
    // Check 3 — no trailing slash (root: host-only OK, plus host+'/es' OK)
    const rootEn = `${SITE_ORIGIN}`;
    const rootEs = `${SITE_ORIGIN}/es`;
    const isAllowedRoot = canonical === rootEn || canonical === rootEs;
    if (!isAllowedRoot && /\/$/.test(canonical)) {
      result.errors.push(`canonical has trailing slash: ${canonical}`);
    }

    // Check 4 — canonical matches served URL (page's own expected canonical)
    const expectedCanon = expectedCanonicalForPath(path);
    if (canonical !== expectedCanon) {
      result.errors.push(`canonical "${canonical}" does not match expected "${expectedCanon}"`);
    }
  }

  // Check 5/6/7 — hreflang completeness + format + x-default = en
  const hreflangs = extractHreflangs(html);
  result.hreflang = Object.fromEntries(hreflangs.map((h) => [h.hreflang, h.href]));
  const expectedHreflang = expectedHreflangForPath(path);

  const seen = new Set();
  let dupErr = false;
  for (const h of hreflangs) {
    if (seen.has(h.hreflang)) {
      result.errors.push(`duplicate hreflang "${h.hreflang}"`);
      dupErr = true;
    }
    seen.add(h.hreflang);
  }
  const requiredHreflangs = ['en', 'es', 'x-default'];
  for (const k of requiredHreflangs) {
    if (!seen.has(k)) result.errors.push(`missing hreflang "${k}"`);
  }
  const extras = [...seen].filter((k) => !requiredHreflangs.includes(k));
  for (const k of extras) {
    result.errors.push(`unexpected hreflang "${k}"`);
  }
  if (!dupErr) {
    for (const k of requiredHreflangs) {
      const href = result.hreflang[k];
      if (!href) continue;
      // Check 6 — no trailing slash
      const rootEn = `${SITE_ORIGIN}`;
      const rootEs = `${SITE_ORIGIN}/es`;
      const isAllowedRoot = href === rootEn || href === rootEs;
      if (!isAllowedRoot && /\/$/.test(href)) {
        result.errors.push(`hreflang "${k}" has trailing slash: ${href}`);
      }
      // Match expected
      const expected = expectedHreflang[k];
      if (expected && href !== expected) {
        result.errors.push(`hreflang "${k}" href "${href}" does not match expected "${expected}"`);
      }
    }
    // Check 7 — x-default === en
    if (result.hreflang.en && result.hreflang['x-default'] && result.hreflang.en !== result.hreflang['x-default']) {
      result.errors.push(
        `x-default "${result.hreflang['x-default']}" does not equal en "${result.hreflang.en}"`,
      );
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Sitemap-level checks
// ---------------------------------------------------------------------------

async function validateSitemap() {
  const result = {errors: [], warnings: [], urlCount: 0, entries: []};
  let resp;
  try {
    resp = await fetchTextStatus('/sitemap.xml');
  } catch (err) {
    result.errors.push(`sitemap fetch failed: ${err.message}`);
    return result;
  }
  if (resp.status !== 200) {
    result.errors.push(`sitemap.xml HTTP ${resp.status}`);
    return result;
  }
  const urls = parseSitemapXml(resp.text);
  result.urlCount = urls.length;
  result.entries = urls.map((u) => ({loc: u.loc, lastmod: u.lastmod, alternates: u.alternates}));

  // Build the expected absolute URLs set (excluding noindex routes).
  const expectedAbs = new Set(
    EXPECTED_PATHS.filter((p) => !EXCLUDED_PATHS.has(p)).map(
      (p) => `${SITE_ORIGIN}${normalizePathToNoSlash(p)}`,
    ),
  );
  // We also expect the bare ES root (`/es` → host/es) — already handled
  // by normalizePathToNoSlash('/es') === '/es' giving SITE_ORIGIN + '/es'.

  const sitemapLocs = new Set(urls.map((u) => u.loc));

  // Check 11 — every <loc> no-slash (except bare host root)
  const rootEn = SITE_ORIGIN;
  for (const u of urls) {
    if (u.loc === rootEn) continue; // single allowed exception
    if (/\/$/.test(u.loc)) {
      result.errors.push(`sitemap <loc> has trailing slash: ${u.loc}`);
    }
  }

  // Check 10 — completeness (every expected URL appears)
  for (const exp of expectedAbs) {
    if (!sitemapLocs.has(exp)) {
      result.errors.push(`sitemap missing expected URL: ${exp}`);
    }
  }
  // Drift — every sitemap URL appears in expected (additive surprises)
  for (const u of urls) {
    if (!expectedAbs.has(u.loc)) {
      result.warnings.push(`sitemap contains unexpected URL: ${u.loc}`);
    }
  }
  // Excluded URLs MUST NOT appear
  const excludedAbs = new Set(
    [...EXCLUDED_PATHS].map((p) => `${SITE_ORIGIN}${normalizePathToNoSlash(p)}`),
  );
  for (const ex of excludedAbs) {
    if (sitemapLocs.has(ex)) {
      result.errors.push(`sitemap contains excluded URL (should be omitted): ${ex}`);
    }
  }

  // Check 13 — each <url> has alternates en + es + x-default matching the
  // page-level hreflang.
  for (const u of urls) {
    const want = expectedHreflangForPath(
      // Recover the path: strip the SITE_ORIGIN prefix.
      u.loc.replace(SITE_ORIGIN, '') || '/',
    );
    for (const k of ['en', 'es', 'x-default']) {
      if (!u.alternates[k]) {
        result.errors.push(`sitemap <url loc="${u.loc}"> missing hreflang "${k}" alternate`);
        continue;
      }
      if (u.alternates[k] !== want[k]) {
        result.errors.push(
          `sitemap <url loc="${u.loc}"> hreflang "${k}" = "${u.alternates[k]}" (expected "${want[k]}")`,
        );
      }
    }
  }

  return result;
}

async function validateRobotsTxt() {
  const result = {errors: [], warnings: [], body: ''};
  let resp;
  try {
    resp = await fetchTextStatus('/robots.txt');
  } catch (err) {
    result.errors.push(`robots.txt fetch failed: ${err.message}`);
    return result;
  }
  if (resp.status !== 200) {
    result.errors.push(`robots.txt HTTP ${resp.status}`);
    return result;
  }
  result.body = resp.text;

  // Check 12 — has an absolute Sitemap line; no broad Disallow: /
  if (!/Sitemap:\s*https?:\/\//i.test(resp.text)) {
    result.errors.push('robots.txt does not contain an absolute Sitemap: line');
  }
  // Inspect each "User-agent: *" section's allow/disallow set.
  // Phase B.07 added an assertion: `/unsubscribe/` AND `/es/unsubscribe/`
  // must both appear in the disallow set (path matching is host-anchored;
  // the EN entry does NOT cover the ES locale prefix).
  const requiredDisallows = ['/unsubscribe/', '/es/unsubscribe/'];
  const blocks = resp.text.split(/\n\s*\n/);
  for (const block of blocks) {
    if (!/User-agent:\s*\*/i.test(block)) continue;
    const disallowedHere = [];
    const lines = block.split(/\r?\n/);
    for (const line of lines) {
      const m = /^\s*Disallow:\s*(.*)\s*$/i.exec(line);
      if (!m) continue;
      const value = m[1].trim();
      if (value === '/' || value === '/*') {
        result.errors.push(`robots.txt has broad "Disallow: ${value}" in User-agent: * block`);
      }
      if (value) disallowedHere.push(value);
    }
    for (const required of requiredDisallows) {
      if (!disallowedHere.includes(required)) {
        result.errors.push(
          `robots.txt User-agent: * block missing "Disallow: ${required}" (Phase B.07 requirement)`,
        );
      }
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Reciprocity check (Check 8)
// ---------------------------------------------------------------------------

function checkReciprocity(pageResults) {
  // For each result that has hreflang, ensure the en and es URLs each
  // appear in the fetched set, and emit the inverse alternate back.
  const errors = [];
  const byCanonical = new Map();
  for (const r of pageResults) {
    if (r.canonical) byCanonical.set(r.canonical, r);
  }
  for (const r of pageResults) {
    if (!r.hreflang) continue;
    const {en, es} = r.hreflang;
    if (en && !byCanonical.has(en)) {
      errors.push(
        `reciprocity: ${r.path} claims en="${en}" but that URL is not in the fetched set`,
      );
    }
    if (es && !byCanonical.has(es)) {
      errors.push(
        `reciprocity: ${r.path} claims es="${es}" but that URL is not in the fetched set`,
      );
    }
    // Inverse-alternate check.
    if (en && byCanonical.has(en)) {
      const peer = byCanonical.get(en);
      if (peer.hreflang) {
        if (peer.hreflang.en !== en) {
          errors.push(
            `reciprocity: ${r.path}'s en peer at ${en} emits en="${peer.hreflang.en}" instead of "${en}"`,
          );
        }
        if (es && peer.hreflang.es !== es) {
          errors.push(
            `reciprocity: ${r.path}'s en peer at ${en} emits es="${peer.hreflang.es}" instead of "${es}"`,
          );
        }
      }
    }
  }
  return errors;
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

function printTable(pageResults, sitemapResult, robotsResult, reciprocityErrors) {
  console.log('');
  console.log(`${C.bold}SEO validation against ${BASE_URL}${C.reset}`);
  console.log('');
  console.log(
    `${C.bold}${pad('PATH', 56)} ${pad('errors', 8)} ${pad('warns', 8)} status${C.reset}`,
  );
  console.log(C.gray + '-'.repeat(96) + C.reset);
  for (const r of pageResults) {
    const status =
      r.errors.length === 0 && r.warnings.length === 0
        ? `${C.green}PASS${C.reset}`
        : r.errors.length > 0
          ? `${C.red}FAIL${C.reset}`
          : `${C.yellow}WARN${C.reset}`;
    console.log(
      `${pad(r.path, 56)} ${pad(r.errors.length, 8)} ${pad(r.warnings.length, 8)} ${status}`,
    );
  }
  console.log('');

  if (sitemapResult.errors.length || sitemapResult.warnings.length) {
    console.log(`${C.bold}sitemap.xml${C.reset}  (${sitemapResult.urlCount} <url> entries)`);
    for (const e of sitemapResult.errors) console.log(`  ${C.red}E${C.reset}  ${e}`);
    for (const w of sitemapResult.warnings) console.log(`  ${C.yellow}W${C.reset}  ${w}`);
    console.log('');
  }
  if (robotsResult.errors.length || robotsResult.warnings.length) {
    console.log(`${C.bold}robots.txt${C.reset}`);
    for (const e of robotsResult.errors) console.log(`  ${C.red}E${C.reset}  ${e}`);
    for (const w of robotsResult.warnings) console.log(`  ${C.yellow}W${C.reset}  ${w}`);
    console.log('');
  }
  if (reciprocityErrors.length) {
    console.log(`${C.bold}hreflang reciprocity${C.reset}`);
    for (const e of reciprocityErrors) console.log(`  ${C.red}E${C.reset}  ${e}`);
    console.log('');
  }
  for (const r of pageResults) {
    if (r.errors.length === 0 && r.warnings.length === 0) continue;
    console.log(`${C.bold}${r.path}${C.reset}`);
    for (const e of r.errors) console.log(`  ${C.red}E${C.reset}  ${e}`);
    for (const w of r.warnings) console.log(`  ${C.yellow}W${C.reset}  ${w}`);
    console.log('');
  }
}

function writeJsonReport(pageResults, sitemapResult, robotsResult, reciprocityErrors, totals) {
  mkdirSync(dirname(REPORT_PATH), {recursive: true});
  writeFileSync(
    REPORT_PATH,
    JSON.stringify(
      {
        baseUrl: BASE_URL,
        bypass: Boolean(BYPASS_TOKEN),
        skippedRemote: SKIP_REMOTE,
        generatedAt: new Date().toISOString(),
        totals,
        sitemap: sitemapResult,
        robots: robotsResult,
        reciprocityErrors,
        pages: pageResults,
      },
      null,
      2,
    ),
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Validating ${ROBOTS_META_PATHS.length} URLs against ${BASE_URL}…`);

  // 1. Sitewide artifacts first — fail fast if these are broken.
  const sitemapResult = await validateSitemap();
  const robotsResult = await validateRobotsTxt();

  // 2. Per-URL HTML walk
  const pageResults = [];
  for (const path of ROBOTS_META_PATHS) {
    process.stdout.write(`  ${pad(path, 56)} `);
    const r = await validateUrlPage(path);
    pageResults.push(r);
    const tag =
      r.errors.length === 0 && r.warnings.length === 0
        ? `${C.green}OK${C.reset}`
        : r.errors.length > 0
          ? `${C.red}FAIL${C.reset}`
          : `${C.yellow}warn${C.reset}`;
    console.log(`${tag}`);
  }

  // 3. Reciprocity — needs the full page set
  const reciprocityErrors = checkReciprocity(pageResults);

  const totals = {
    errors:
      sitemapResult.errors.length +
      robotsResult.errors.length +
      reciprocityErrors.length +
      pageResults.reduce((acc, r) => acc + r.errors.length, 0),
    warnings:
      sitemapResult.warnings.length +
      robotsResult.warnings.length +
      pageResults.reduce((acc, r) => acc + r.warnings.length, 0),
  };

  printTable(pageResults, sitemapResult, robotsResult, reciprocityErrors);
  writeJsonReport(pageResults, sitemapResult, robotsResult, reciprocityErrors, totals);

  console.log(
    `${C.bold}TOTAL:${C.reset} ${totals.errors} errors / ${totals.warnings} warnings across ${ROBOTS_META_PATHS.length} URLs + sitemap + robots`,
  );
  console.log(`Report: ${REPORT_PATH}`);

  process.exit(totals.errors === 0 && totals.warnings === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(`${C.red}fatal:${C.reset} ${err.stack || err.message}`);
  process.exit(2);
});
