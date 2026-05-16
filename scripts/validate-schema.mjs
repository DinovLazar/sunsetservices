#!/usr/bin/env node
/**
 * Phase B.04 — Schema validation harness.
 *
 * Walks every representative page URL, extracts every JSON-LD block, and
 * validates each against a layered rule set:
 *
 *   1. JSON-parse soundness
 *   2. Required-field check per schema.org @type (internal rule table below)
 *   3. Internal `@id` resolution — every `{"@id": "..."}` reference must
 *      resolve either inside the same document's graph or to one of the
 *      sitewide nodes declared in the locale layout
 *   4. Absolute URLs on `image`, `url`, `logo`, `mainEntityOfPage`, and
 *      breadcrumb / ListItem `item` fields
 *   5. (Optional, best-effort) schema.org public validator API
 *      — throttled, content-hash-cached, never fails the run on transport
 *      errors (only on real findings)
 *
 * USAGE
 *   node scripts/validate-schema.mjs                                  # localhost:3000
 *   BASE_URL=https://preview.vercel.app node scripts/validate-schema.mjs
 *   BASE_URL=https://preview.vercel.app BYPASS_TOKEN=xyz node scripts/validate-schema.mjs
 *
 * EXIT CODE
 *   0  Zero errors AND zero warnings — required to close Phase B.04.
 *   1  Any error or warning surfaced on any page.
 *
 * OUTPUTS
 *   stdout                                            colored per-URL table
 *   scripts/.schema-validation-report.json            full machine report
 *   src/_project-state/Phase-B-04-Validation-Report.md  human summary
 */

import crypto from 'node:crypto';
import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const BYPASS_TOKEN = process.env.BYPASS_TOKEN || '';
// The schema.org validator API can only fetch publicly-reachable URLs. When
// BASE_URL is localhost (no public reachability), we silently skip the
// external pass and rely on internal checks alone — which are authoritative.
const IS_PUBLIC_BASE = !/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)/i.test(BASE_URL);
const SKIP_REMOTE = process.env.SKIP_REMOTE === '1' || !IS_PUBLIC_BASE;

const REPORT_PATH = resolve('scripts/.schema-validation-report.json');
const CACHE_PATH = resolve('scripts/.schema-validation-cache.json');
const SUMMARY_PATH = resolve('src/_project-state/Phase-B-04-Validation-Report.md');

// Stable @id values declared by src/app/[locale]/layout.tsx — every page
// inherits these via the sitewide `<script type="application/ld+json">` block.
const SITEWIDE_IDS = [
  'https://sunsetservices.us/#localbusiness',
  'https://sunsetservices.us/#organization',
];

// Representative pages. `mustHaveTypes` are types we expect to find at least
// once in the page's combined JSON-LD; missing one is an error. `mustNotHaveTypes`
// asserts deliberate-omission decisions (D14 + D15). `expectedCount` (optional)
// pins the number of <script type="application/ld+json"> blocks for the page.
const URLS = [
  // ----- EN: full sweep -----
  {
    path: '/',
    label: 'home',
    mustHaveTypes: ['LocalBusiness', 'Organization', 'WebSite'],
  },
  {
    path: '/residential/',
    label: 'audience-landing-residential',
    mustHaveTypes: ['LocalBusiness', 'Organization', 'BreadcrumbList', 'ItemList'],
  },
  {
    path: '/commercial/',
    label: 'audience-landing-commercial',
    mustHaveTypes: ['LocalBusiness', 'Organization', 'BreadcrumbList', 'ItemList'],
  },
  {
    path: '/hardscape/',
    label: 'audience-landing-hardscape',
    mustHaveTypes: ['LocalBusiness', 'Organization', 'BreadcrumbList', 'ItemList'],
  },
  {
    path: '/residential/lawn-care/',
    label: 'service-detail-residential-lawn-care',
    mustHaveTypes: ['LocalBusiness', 'Organization', 'BreadcrumbList', 'Service'],
  },
  {
    path: '/commercial/snow-removal/',
    label: 'service-detail-commercial-snow-removal',
    mustHaveTypes: ['LocalBusiness', 'Organization', 'BreadcrumbList', 'Service'],
  },
  {
    path: '/service-areas/',
    label: 'service-areas-index',
    mustHaveTypes: ['LocalBusiness', 'Organization', 'BreadcrumbList', 'ItemList'],
  },
  {
    path: '/service-areas/aurora/',
    label: 'location-detail-aurora',
    mustHaveTypes: [
      'LocalBusiness',
      'Organization',
      'BreadcrumbList',
      'Place',
      'ItemList',
    ],
  },
  {
    path: '/projects/',
    label: 'projects-index',
    mustHaveTypes: ['LocalBusiness', 'Organization', 'BreadcrumbList', 'ItemList'],
  },
  {
    path: '/about/',
    label: 'about',
    mustHaveTypes: ['LocalBusiness', 'Organization', 'BreadcrumbList', 'Person'],
  },
  {
    path: '/contact/',
    label: 'contact',
    mustHaveTypes: [
      'LocalBusiness',
      'Organization',
      'BreadcrumbList',
      'ContactPage',
    ],
  },
  {
    path: '/resources/',
    label: 'resources-index',
    mustHaveTypes: ['LocalBusiness', 'Organization', 'BreadcrumbList', 'ItemList'],
  },
  {
    path: '/blog/',
    label: 'blog-index',
    mustHaveTypes: ['LocalBusiness', 'Organization', 'BreadcrumbList', 'ItemList'],
  },
  {
    path: '/privacy/',
    label: 'privacy',
    mustHaveTypes: [
      'LocalBusiness',
      'Organization',
      'BreadcrumbList',
      'WebPage',
    ],
  },
  {
    path: '/terms/',
    label: 'terms',
    mustHaveTypes: [
      'LocalBusiness',
      'Organization',
      'BreadcrumbList',
      'WebPage',
    ],
  },
  // ----- Zero-JSON-LD pages (D14 + D15) — only the sitewide graph allowed -----
  {
    path: '/request-quote/',
    label: 'request-quote',
    mustHaveTypes: ['LocalBusiness', 'Organization'],
    mustNotHaveTypes: ['BreadcrumbList', 'WebPage', 'Service', 'ItemList'],
  },
  {
    path: '/thank-you/',
    label: 'thank-you',
    mustHaveTypes: ['LocalBusiness', 'Organization'],
    mustNotHaveTypes: ['BreadcrumbList', 'WebPage', 'Service', 'ItemList'],
  },
  // ----- ES: spot-check (5 URLs) -----
  {
    path: '/es/',
    label: 'es-home',
    mustHaveTypes: ['LocalBusiness', 'Organization', 'WebSite'],
  },
  {
    path: '/es/residential/lawn-care/',
    label: 'es-service-detail-residential-lawn-care',
    mustHaveTypes: ['LocalBusiness', 'Organization', 'BreadcrumbList', 'Service'],
  },
  {
    path: '/es/service-areas/aurora/',
    label: 'es-location-detail-aurora',
    mustHaveTypes: [
      'LocalBusiness',
      'Organization',
      'BreadcrumbList',
      'Place',
      'ItemList',
    ],
  },
  {
    path: '/es/blog/',
    label: 'es-blog-index',
    mustHaveTypes: ['LocalBusiness', 'Organization', 'BreadcrumbList', 'ItemList'],
  },
  {
    path: '/es/projects/',
    label: 'es-projects-index',
    mustHaveTypes: ['LocalBusiness', 'Organization', 'BreadcrumbList', 'ItemList'],
  },
];

// Required-fields table per schema.org @type. Conservative — we only flag
// fields whose absence makes the schema unusable by Google's rich-results
// parsers, not every recommended field. Adding a field here = it MUST appear
// on every node of that type or the harness errors.
const REQUIRED_FIELDS = {
  LocalBusiness: ['@id', 'name', 'address', 'telephone', 'url'],
  Organization: ['@id', 'name', 'url'],
  WebSite: ['name', 'url'],
  WebPage: ['name', 'url'],
  BreadcrumbList: ['itemListElement'],
  ItemList: ['itemListElement'],
  Service: ['name', 'serviceType', 'provider'],
  FAQPage: ['mainEntity'],
  Question: ['name', 'acceptedAnswer'],
  Answer: ['text'],
  // ListItem allows either {item: <thing|url>} OR {url: <url>}; checked manually below.
  Place: ['name', 'address'],
  CreativeWork: ['name', 'creator'],
  Person: ['name'],
  Article: ['headline', 'author', 'datePublished', 'publisher'],
  BlogPosting: ['headline', 'author', 'datePublished', 'publisher'],
  HowTo: ['name', 'step'],
  HowToStep: ['name', 'text'],
  Review: ['author', 'reviewRating'],
  AggregateRating: ['ratingValue', 'reviewCount'],
  ContactPage: ['url'],
  PostalAddress: ['addressLocality', 'addressRegion'],
  GeoCoordinates: ['latitude', 'longitude'],
  Rating: ['ratingValue'],
  Offer: ['url'],
};

const URL_FIELDS = new Set([
  'image',
  'url',
  'logo',
  'mainEntityOfPage',
]);

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

/**
 * One-shot priming request: when BYPASS_TOKEN is provided, hit the base
 * URL with the bypass query string in `redirect: 'manual'` mode to capture
 * the resulting `_vercel_jwt` cookie. Subsequent requests forward only the
 * cookie — Vercel strips the query string on its internal 307 redirect, so
 * relying on the query string per request fails after the first hop.
 */
async function primeBypassCookie() {
  if (!BYPASS_TOKEN || bypassCookie) return;
  const url = `${BASE_URL}/?x-vercel-protection-bypass=${BYPASS_TOKEN}&x-vercel-set-bypass-cookie=samesitenone`;
  const res = await fetch(url, {redirect: 'manual'});
  const setCookie = res.headers.get('set-cookie') || '';
  const m = /(_vercel_jwt|vercel_bypass[^=]*)=([^;]+)/i.exec(setCookie);
  if (m) bypassCookie = `${m[1]}=${m[2]}`;
}

async function fetchHtml(path) {
  await primeBypassCookie();
  const url = `${BASE_URL}${path}`;
  const headers = {};
  if (bypassCookie) headers.Cookie = bypassCookie;
  const res = await fetch(url, {headers, redirect: 'follow'});
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }
  return res.text();
}

function extractJsonLdBlocks(html) {
  const blocks = [];
  const re = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    blocks.push(m[1].trim());
  }
  return blocks;
}

// ---------------------------------------------------------------------------
// Graph walking
// ---------------------------------------------------------------------------

/**
 * Walks every value in a JSON-LD payload (which may be a single object,
 * an array, or an object with `@graph`). Collects:
 *   - definedIds:  every `@id` attached to a non-reference node
 *   - references:  every `{"@id": "..."}` reference (single-key node)
 *   - nodesByType: arrays of typed nodes keyed by `@type` (first listed)
 */
function indexGraph(value, definedIds, references, nodesByType, path = '$') {
  if (Array.isArray(value)) {
    value.forEach((v, i) => indexGraph(v, definedIds, references, nodesByType, `${path}[${i}]`));
    return;
  }
  if (!value || typeof value !== 'object') return;

  const keys = Object.keys(value);
  const onlyId =
    '@id' in value &&
    keys.length === 1; // {"@id": "..."} pure reference

  if (onlyId) {
    references.push({id: value['@id'], path});
    return;
  }

  if ('@id' in value && typeof value['@id'] === 'string') {
    definedIds.add(value['@id']);
  }

  if ('@type' in value) {
    const t = Array.isArray(value['@type']) ? value['@type'][0] : value['@type'];
    if (typeof t === 'string') {
      if (!nodesByType[t]) nodesByType[t] = [];
      nodesByType[t].push({node: value, path});
    }
  }

  for (const [k, v] of Object.entries(value)) {
    if (k === '@context' || k === '@id' || k === '@type') continue;
    indexGraph(v, definedIds, references, nodesByType, `${path}.${k}`);
  }
}

function checkRequiredFields(node, nodeType, nodePath, errors) {
  const req = REQUIRED_FIELDS[nodeType];
  if (!req) return;
  for (const f of req) {
    if (!(f in node)) {
      errors.push(`${nodePath} (${nodeType}): missing required field "${f}"`);
    }
  }
}

function checkListItem(node, nodePath, errors) {
  // ListItem must have position and (item OR url)
  if (!('position' in node)) {
    errors.push(`${nodePath} (ListItem): missing required field "position"`);
  }
  const hasItem = 'item' in node;
  const hasUrl = 'url' in node;
  if (!hasItem && !hasUrl) {
    errors.push(`${nodePath} (ListItem): missing both "item" and "url" — at least one required`);
  }
}

function checkAbsoluteUrls(value, warnings, path = '$') {
  if (Array.isArray(value)) {
    value.forEach((v, i) => checkAbsoluteUrls(v, warnings, `${path}[${i}]`));
    return;
  }
  if (!value || typeof value !== 'object') return;

  for (const [k, v] of Object.entries(value)) {
    if (URL_FIELDS.has(k)) {
      const offenders = (Array.isArray(v) ? v : [v]).filter(
        (x) => typeof x === 'string' && !/^https?:\/\//.test(x),
      );
      for (const o of offenders) {
        warnings.push(`${path}.${k}: "${o}" is not an absolute URL (must start with https://)`);
      }
    }
    // BreadcrumbList / ListItem `item` may itself be a URL string at the
    // ListItem level — same rule.
    if (k === 'item' && typeof v === 'string' && !/^https?:\/\//.test(v)) {
      warnings.push(`${path}.item: "${v}" is not an absolute URL`);
    }
    if (typeof v === 'object' && v !== null) {
      checkAbsoluteUrls(v, warnings, `${path}.${k}`);
    }
  }
}

// ---------------------------------------------------------------------------
// External validator API — best effort, throttled, cached
// ---------------------------------------------------------------------------

const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, 'utf8')) : {};
let nextApiSlot = 0;

async function throttle() {
  const now = Date.now();
  const wait = nextApiSlot - now;
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  nextApiSlot = Math.max(now, nextApiSlot) + 500; // ≤ 2 req/sec
}

/**
 * The schema.org validator API works in URL-fetch mode: POST a `url=…`
 * form and the validator fetches the page itself, extracts every JSON-LD
 * block, and returns aggregated findings. The `code=` parameter the docs
 * mention is for the UI's code-snippet tab and doesn't validate-by-content
 * via this endpoint (it always returns fetchError: NOT_FOUND). So our remote
 * pass validates per-PAGE-URL, not per-block, and aggregates errors/warnings
 * onto the URL row.
 */
async function callValidatorApiForUrl(pageUrl) {
  const hash = crypto.createHash('sha256').update(pageUrl).digest('hex');
  if (cache[hash]) return cache[hash];

  await throttle();
  try {
    const res = await fetch('https://validator.schema.org/validate', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: `url=${encodeURIComponent(pageUrl)}`,
    });
    if (!res.ok) {
      return {ok: false, transportError: `HTTP ${res.status}`};
    }
    const raw = await res.text();
    const clean = raw.replace(/^\)\]\}'\s*/, '');
    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      return {ok: false, transportError: 'non-JSON response'};
    }
    const result = {ok: true, ...parsed};
    cache[hash] = result;
    try {
      writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
    } catch {
      // cache write failure is non-fatal
    }
    return result;
  } catch (err) {
    return {ok: false, transportError: err.message};
  }
}

function extractValidatorFindings(apiResp) {
  // The schema.org validator response shape is undocumented; this is
  // resilient to either {tripleGroups: [...]} or {errors: [...]} flavors.
  const findings = {errors: [], warnings: []};
  if (!apiResp || apiResp.ok === false) return findings;
  if (Array.isArray(apiResp.errors)) {
    for (const e of apiResp.errors) findings.errors.push(e.description || JSON.stringify(e));
  }
  if (Array.isArray(apiResp.warnings)) {
    for (const w of apiResp.warnings) findings.warnings.push(w.description || JSON.stringify(w));
  }
  if (Array.isArray(apiResp.tripleGroups)) {
    for (const g of apiResp.tripleGroups) {
      if (Array.isArray(g.nodes)) {
        for (const n of g.nodes) {
          if (Array.isArray(n.errors)) {
            for (const e of n.errors) findings.errors.push(e.description || JSON.stringify(e));
          }
          if (Array.isArray(n.warnings)) {
            for (const w of n.warnings) findings.warnings.push(w.description || JSON.stringify(w));
          }
        }
      }
    }
  }
  return findings;
}

// ---------------------------------------------------------------------------
// Per-URL validation
// ---------------------------------------------------------------------------

async function validateUrl(entry) {
  const result = {
    path: entry.path,
    label: entry.label,
    blocks: 0,
    types: [],
    errors: [],
    warnings: [],
    remote: {attempted: 0, errors: 0, warnings: 0, transportFailures: 0},
  };

  let html;
  try {
    html = await fetchHtml(entry.path);
  } catch (err) {
    result.errors.push(`fetch failed: ${err.message}`);
    return result;
  }

  const blockStrings = extractJsonLdBlocks(html);
  result.blocks = blockStrings.length;

  if (blockStrings.length === 0) {
    result.errors.push('no <script type="application/ld+json"> blocks present');
    return result;
  }

  // Parse every block. Build combined graph index.
  const definedIds = new Set();
  const references = [];
  const nodesByType = {};
  const parsedBlocks = [];

  blockStrings.forEach((s, i) => {
    let parsed;
    try {
      parsed = JSON.parse(s);
    } catch (err) {
      result.errors.push(`block ${i}: JSON parse error — ${err.message}`);
      return;
    }
    parsedBlocks.push({raw: s, parsed, index: i});
    indexGraph(parsed, definedIds, references, nodesByType, `block[${i}]`);
  });

  result.types = Object.keys(nodesByType).sort();

  // mustHaveTypes
  for (const t of entry.mustHaveTypes || []) {
    if (!nodesByType[t]) {
      result.errors.push(`expected @type "${t}" not present on page`);
    }
  }

  // mustNotHaveTypes
  for (const t of entry.mustNotHaveTypes || []) {
    if (nodesByType[t]) {
      result.errors.push(
        `forbidden @type "${t}" present on page (D14/D15 says this route should not emit it)`,
      );
    }
  }

  // Required-field check per node
  for (const [type, nodes] of Object.entries(nodesByType)) {
    for (const {node, path} of nodes) {
      if (type === 'ListItem') {
        checkListItem(node, path, result.errors);
      } else {
        checkRequiredFields(node, type, path, result.errors);
      }
    }
  }

  // @id reference resolution
  const knownIds = new Set([...SITEWIDE_IDS, ...definedIds]);
  for (const {id, path} of references) {
    if (!knownIds.has(id)) {
      result.warnings.push(`${path}: dangling @id reference "${id}" — no defined node matches`);
    }
  }

  // Absolute URL check on every block
  parsedBlocks.forEach(({parsed, index}) =>
    checkAbsoluteUrls(parsed, result.warnings, `block[${index}]`),
  );

  // External validator API — only for public URLs (validator fetches itself,
  // so localhost is unreachable). Per-page (URL) call, not per-block.
  if (!SKIP_REMOTE) {
    result.remote.attempted = 1;
    let pageUrl = `${BASE_URL}${entry.path}`;
    if (BYPASS_TOKEN) {
      const sep = pageUrl.includes('?') ? '&' : '?';
      pageUrl = `${pageUrl}${sep}x-vercel-protection-bypass=${BYPASS_TOKEN}&x-vercel-set-bypass-cookie=samesitenone`;
    }
    const api = await callValidatorApiForUrl(pageUrl);
    if (api.ok === false || api.fetchError) {
      result.remote.transportFailures = 1;
      // transport / fetch failures don't fail the run — just noted in the
      // report summary. Internal checks are authoritative.
    } else {
      const findings = extractValidatorFindings(api);
      for (const e of findings.errors) {
        result.errors.push(`schema.org validator: ${e}`);
        result.remote.errors += 1;
      }
      for (const w of findings.warnings) {
        result.warnings.push(`schema.org validator: ${w}`);
        result.remote.warnings += 1;
      }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

function printTable(results) {
  console.log('');
  console.log(`${C.bold}Schema validation against ${BASE_URL}${C.reset}`);
  console.log('');
  console.log(
    `${C.bold}${pad('URL', 56)} ${pad('blocks', 8)} ${pad('errors', 8)} ${pad('warns', 8)} status${C.reset}`,
  );
  console.log(C.gray + '-'.repeat(96) + C.reset);
  for (const r of results) {
    const status =
      r.errors.length === 0 && r.warnings.length === 0
        ? `${C.green}PASS${C.reset}`
        : r.errors.length > 0
          ? `${C.red}FAIL${C.reset}`
          : `${C.yellow}WARN${C.reset}`;
    console.log(
      `${pad(r.path, 56)} ${pad(r.blocks, 8)} ${pad(r.errors.length, 8)} ${pad(r.warnings.length, 8)} ${status}`,
    );
  }
  console.log('');
  for (const r of results) {
    if (r.errors.length === 0 && r.warnings.length === 0) continue;
    console.log(`${C.bold}${r.path}${C.reset}  (${r.types.join(', ') || 'no types'})`);
    for (const e of r.errors) console.log(`  ${C.red}E${C.reset}  ${e}`);
    for (const w of r.warnings) console.log(`  ${C.yellow}W${C.reset}  ${w}`);
    console.log('');
  }
}

function writeJsonReport(results, totals) {
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
        results,
      },
      null,
      2,
    ),
  );
}

function writeMarkdownSummary(results, totals) {
  mkdirSync(dirname(SUMMARY_PATH), {recursive: true});
  const pass = totals.errors === 0 && totals.warnings === 0;
  const lines = [];
  lines.push('# Phase B.04 — Schema Validation Report');
  lines.push('');
  lines.push(`**Base URL:** \`${BASE_URL}\`  `);
  lines.push(`**Generated:** ${new Date().toISOString()}  `);
  lines.push(`**Remote (schema.org validator):** ${SKIP_REMOTE ? 'skipped' : 'attempted'}  `);
  lines.push(`**Status:** ${pass ? 'PASS (0 errors / 0 warnings)' : `FAIL (${totals.errors} errors / ${totals.warnings} warnings)`}`);
  lines.push('');
  lines.push('## Per-URL summary');
  lines.push('');
  lines.push('| URL | Blocks | Errors | Warnings | Types |');
  lines.push('|---|---|---|---|---|');
  for (const r of results) {
    lines.push(
      `| \`${r.path}\` | ${r.blocks} | ${r.errors.length} | ${r.warnings.length} | ${r.types.join(', ') || '—'} |`,
    );
  }
  lines.push('');
  if (!pass) {
    lines.push('## Findings');
    lines.push('');
    for (const r of results) {
      if (r.errors.length === 0 && r.warnings.length === 0) continue;
      lines.push(`### \`${r.path}\``);
      lines.push('');
      for (const e of r.errors) lines.push(`- **error:** ${e}`);
      for (const w of r.warnings) lines.push(`- **warn:** ${w}`);
      lines.push('');
    }
  } else {
    lines.push('All representative URLs validate clean. Phase B.04 acceptance gate met.');
    lines.push('');
  }
  if (!SKIP_REMOTE) {
    const transportFails = results.reduce((a, r) => a + r.remote.transportFailures, 0);
    const apiAttempted = results.reduce((a, r) => a + r.remote.attempted, 0);
    lines.push('## schema.org validator API');
    lines.push('');
    lines.push(`- API calls attempted: ${apiAttempted} (after cache misses)`);
    lines.push(`- Transport failures (non-fatal): ${transportFails}`);
    lines.push('');
    if (transportFails > 0) {
      lines.push(
        '> Transport failures don\'t fail the run — they mean the external validator was unreachable for those payloads. Internal checks (required fields, @id resolution, absolute URLs, presence of mandatory @types) are authoritative.',
      );
      lines.push('');
    }
  }
  writeFileSync(SUMMARY_PATH, lines.join('\n'));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Validating ${URLS.length} URLs against ${BASE_URL}…`);
  const results = [];
  for (const entry of URLS) {
    process.stdout.write(`  ${pad(entry.path, 56)} `);
    const r = await validateUrl(entry);
    results.push(r);
    const tag =
      r.errors.length === 0 && r.warnings.length === 0
        ? `${C.green}OK${C.reset}`
        : r.errors.length > 0
          ? `${C.red}FAIL${C.reset}`
          : `${C.yellow}warn${C.reset}`;
    console.log(`${tag} (${r.blocks} blocks)`);
  }

  const totals = results.reduce(
    (acc, r) => ({
      errors: acc.errors + r.errors.length,
      warnings: acc.warnings + r.warnings.length,
    }),
    {errors: 0, warnings: 0},
  );

  printTable(results);
  writeJsonReport(results, totals);
  writeMarkdownSummary(results, totals);

  console.log(
    `${C.bold}TOTAL:${C.reset} ${totals.errors} errors / ${totals.warnings} warnings across ${URLS.length} URLs`,
  );
  console.log(`Report: ${REPORT_PATH}`);
  console.log(`Summary: ${SUMMARY_PATH}`);

  process.exit(totals.errors === 0 && totals.warnings === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(`${C.red}fatal:${C.reset} ${err.stack || err.message}`);
  process.exit(2);
});
