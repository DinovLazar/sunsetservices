#!/usr/bin/env node
/**
 * Phase M.11b — link-integrity validation harness (durable regression gate).
 *
 * Mirrors the B.04 / B.05 / B.06 env-var + exit-code + JSON-sidecar contract.
 * Renders every page with Playwright headless Chromium (the navbar mega-panels
 * and some links are client-rendered, so a plain HTML fetch is not enough),
 * then BFS-crawls every same-origin internal link to exhaustion across BOTH
 * locales and classifies every link instance it finds.
 *
 * SEED SET
 *   Parses ${BASE_URL}/sitemap.xml for every <loc> (already enumerates all
 *   static + dynamic routes incl. the live Sanity project/blog/resource
 *   slugs), then adds the reachable-but-sitemap-excluded routes:
 *     /thank-you/?firstName=Test, /es/thank-you/?firstName=Test,
 *     /unsubscribe/SAMPLE_TOKEN_INVALID (+ /es), and /dev/system (+ /es) if
 *     they still exist.
 *
 * PER LINK INSTANCE (every <a href>, <area href>, <form action>) we record:
 *   source page, anchor text / aria-label, RAW href (as authored — so a
 *   trailing-slash difference is visible), internal/external.
 *   <link rel="canonical|alternate"> are recorded for completeness only;
 *   canonical/hreflang CORRECTNESS is validate:seo's job — we don't double-judge.
 *
 * PER UNIQUE INTERNAL URL (as-linked) — requested once, full redirect chain
 * recorded, classified:
 *     OK                       200, no redirect
 *     REDIRECT_SLASH_ONLY      3xx → final == requested minus a trailing slash
 *     REDIRECT_LOCALE_PREFIX   3xx → final == requested minus the default-locale /en prefix
 *     REDIRECT_DIFFERENT_PAGE  3xx → final path differs beyond slash/locale-prefix
 *     BROKEN                   404 / 410
 *     ERROR                    5xx / network / timeout / redirect loop
 *
 * PER EXTERNAL URL: HEAD (GET fallback), short timeout + 2 retries → OK / DEAD.
 *   Report-only — a third party's dead page can't be fixed at our source.
 *
 * PER HASH LINK (#fragment): load the destination, check getElementById(hash)
 *   (or [name=hash]) → OK / MISSING_ANCHOR.
 *
 * tel: / mailto: — light format + NAP-consistency check (canonical phone
 *   (630) 946-9321, email info@sunsetservices.us). Report-only, low priority.
 *
 * WRONG-DESTINATION HEURISTIC (report-only, feeds triage): an entity→slug map
 *   is built from src/data/{services,locations,divisions}.ts; when a link's
 *   normalized anchor text matches a known entity name but the href's terminal
 *   slug != that entity's slug, we emit POSSIBLE_WRONG_DESTINATION. High
 *   false-positive tolerance by design — triage decides; the harness never
 *   auto-fixes these.
 *
 * USAGE
 *   node scripts/validate-links.mjs                                 # localhost:3000
 *   node scripts/validate-links.mjs --strict                        # also fail on warnings
 *   BASE_URL=https://preview.vercel.app VERCEL_SHARE_TOKEN=xyz node scripts/validate-links.mjs
 *   BASE_URL=https://preview.vercel.app BYPASS_TOKEN=xyz node scripts/validate-links.mjs
 *
 * ENV
 *   BASE_URL              default http://localhost:3000 (trailing slash stripped)
 *   BYPASS_TOKEN          Vercel protection-bypass token
 *   VERCEL_SHARE_TOKEN    Vercel share token — wins over BYPASS_TOKEN; primes ?_vercel_share=
 *   SKIP_REMOTE=1         skip the external-link liveness checks (the only "remote" calls)
 *   CRAWL_FOLLOW=0        do NOT BFS-follow internal links (seed-set only)
 *
 * EXIT CODE
 *   0  Default gate clean: zero internal BROKEN / ERROR / REDIRECT_DIFFERENT_PAGE
 *      / MISSING_ANCHOR (either locale). External DEAD, REDIRECT_SLASH_ONLY, and
 *      POSSIBLE_WRONG_DESTINATION print as WARNINGS but do NOT fail the default
 *      gate (un-fixable / potentially-intentional / heuristic).
 *   1  Default gate found a hard internal failure — OR, under --strict, ANY
 *      warning (slash-only / heuristic-wrong / external dead / NAP / bad-anchor).
 *   2  Fatal harness error.
 *
 * OUTPUTS
 *   stdout                                       colored report grouped by source page
 *   scripts/.links-validation-report.json        full machine report (gitignored)
 *   scripts/.links-validation-cache.json          (reserved — unused; gitignored so a
 *                                                  future remote-link cache can plug in
 *                                                  without changing the gitignore)
 *
 * The committed snapshot of the findings lives in
 * `src/_project-state/Phase-M-11b-Completion.md`.
 */

import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {chromium} from 'playwright';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const BYPASS_TOKEN = process.env.BYPASS_TOKEN || '';
// VERCEL_SHARE_TOKEN (from the Vercel MCP get_access_to_vercel_url) yields the
// same _vercel_jwt cookie as the bypass token but primes via ?_vercel_share=.
// When set, it wins. (Same handshake as B.05 / B.06.)
const SHARE_TOKEN = process.env.VERCEL_SHARE_TOKEN || '';
// Reserved-for-parity env var. Here it does double duty as the kill-switch for
// the external-link liveness checks — the only outbound "remote" calls this
// harness makes — so a constrained/offline run can `SKIP_REMOTE=1`.
const SKIP_REMOTE = process.env.SKIP_REMOTE === '1';
// BFS following is on by default (exhaustive crawl). CRAWL_FOLLOW=0 restricts
// the run to the seed set (faster smoke test).
const CRAWL_FOLLOW = process.env.CRAWL_FOLLOW !== '0';

const STRICT = process.argv.includes('--strict');
const ONLY = (process.argv.find((a) => a.startsWith('--only=')) || '').slice('--only='.length);
const MAX_PAGES = Number(process.env.MAX_PAGES || 1500); // runaway backstop

const REPORT_PATH = resolve('scripts/.links-validation-report.json');

// Production origin the sitemap emits + canonicals point at. Used to (a) map
// sitemap <loc> back to BASE_URL paths and (b) recognise hardcoded absolute
// internal links that should be relative.
const SITE_ORIGIN = 'https://sunsetservices.us';

// NAP canonicals (D8).
const NAP_PHONE_DIGITS = '6309469321';
const NAP_EMAIL = 'info@sunsetservices.us';

const UA = 'Sunset-Services-Link-Harness/M.11b (Playwright + fetch)';

// Reachable-but-sitemap-excluded routes to seed in addition to the sitemap.
const EXTRA_SEED_PATHS = [
  '/thank-you/?firstName=Test',
  '/es/thank-you/?firstName=Test',
  '/unsubscribe/SAMPLE_TOKEN_INVALID',
  '/es/unsubscribe/SAMPLE_TOKEN_INVALID',
  '/dev/system',
  '/es/dev/system',
];

// ---------------------------------------------------------------------------
// Pretty printing (mirrors the other harnesses)
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
// Vercel SSO bypass cookie priming — same handshake as B.05 / B.06.
// ---------------------------------------------------------------------------

let bypassCookieName = '';
let bypassCookieValue = '';

async function primeBypassCookie() {
  if (bypassCookieName) return;
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
  if (m) {
    bypassCookieName = m[1];
    bypassCookieValue = m[2];
  }
}

function cookieHeader() {
  return bypassCookieName ? {Cookie: `${bypassCookieName}=${bypassCookieValue}`} : {};
}

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

const BASE = new URL(BASE_URL);

function toAbsolute(rawHref, pageUrl) {
  try {
    return new URL(rawHref, pageUrl);
  } catch {
    return null;
  }
}

function stripTrailingSlash(pathname) {
  if (pathname === '/') return '/';
  return pathname.replace(/\/+$/, '');
}

// Map a same-site absolute URL to the crawl origin (so a hardcoded
// https://sunsetservices.us/... link is checked against BASE_URL, and the
// sitemap's production <loc>s become localhost paths).
function toCrawlUrl(u) {
  if (u.origin === BASE.origin) return u;
  if (u.origin === SITE_ORIGIN) {
    return new URL(u.pathname + u.search + u.hash, BASE_URL);
  }
  return u;
}

function classifyScheme(rawHref) {
  const h = (rawHref || '').trim();
  if (!h) return 'empty';
  if (h.startsWith('#')) return 'hash';
  if (/^mailto:/i.test(h)) return 'mailto';
  if (/^tel:/i.test(h)) return 'tel';
  if (/^(javascript|data|blob):/i.test(h)) return 'skip';
  return 'http';
}

// Is this absolute URL one we own (internal) — same crawl origin or the
// production origin (a hardcoded absolute internal link)?
function isInternalUrl(u) {
  return u.origin === BASE.origin || u.origin === SITE_ORIGIN;
}

// Crawlable-as-an-HTML-page heuristic: the terminal path segment has no file
// extension, or the path ends in a slash. Assets (.jpg/.pdf/.xml/.txt…) are
// status-checked when linked but never BFS-followed.
function looksLikeHtmlPage(pathname) {
  const last = pathname.replace(/\/+$/, '').split('/').pop() || '';
  if (!last) return true; // ends in slash / root
  return !/\.[a-z0-9]{1,8}$/i.test(last);
}

function terminalSegment(pathname) {
  const segs = stripTrailingSlash(pathname).split('/').filter(Boolean);
  return segs.length ? segs[segs.length - 1] : '';
}

// BFS-visited key: origin + slash-stripped pathname (ignore query + hash so
// ?division=x variants of the same page aren't re-crawled for links).
function visitedKey(u) {
  return `${u.origin}${stripTrailingSlash(u.pathname)}`;
}

function normalizeText(s) {
  return (s || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

// ---------------------------------------------------------------------------
// Entity → slug map for the wrong-destination heuristic (best-effort).
// ---------------------------------------------------------------------------

async function buildEntityMap() {
  const map = new Map(); // normalizedName -> {kind, slug}
  const collisions = new Set();
  const add = (name, kind, slug) => {
    const key = normalizeText(name);
    if (!key) return;
    if (map.has(key) && map.get(key).slug !== slug) {
      collisions.add(key); // ambiguous name → don't trust it
      return;
    }
    map.set(key, {kind, slug});
  };
  try {
    const {tsImport} = await import('tsx/esm/api');
    const pick = (mod, name) => (mod[name] !== undefined ? mod[name] : mod.default?.[name]);

    const servicesMod = await tsImport('../src/data/services.ts', import.meta.url);
    const SERVICES = pick(servicesMod, 'SERVICES') || [];
    for (const s of SERVICES) {
      for (const n of [s.name?.en, s.name?.es, s.title?.en, s.title?.es]) add(n, 'service', s.slug);
    }

    const locMod = await tsImport('../src/data/locations.ts', import.meta.url);
    const LOCATIONS = pick(locMod, 'LOCATIONS') || [];
    const SURFACED = new Set(pick(locMod, 'SURFACED_LOCATION_SLUGS') || []);
    for (const c of LOCATIONS) {
      if (SURFACED.size === 0 || SURFACED.has(c.slug)) add(c.name, 'city', c.slug);
    }

    const divMod = await tsImport('../src/data/divisions.ts', import.meta.url);
    const DIVISIONS = pick(divMod, 'DIVISIONS') || [];
    for (const d of DIVISIONS) {
      const label = String(d).replace(/-/g, ' '); // 'snow-removal' -> 'snow removal'
      add(label, 'division', String(d));
    }
  } catch (err) {
    console.log(`${C.yellow}note:${C.reset} entity map unavailable (${err.message}); wrong-destination heuristic disabled`);
    return {map: new Map(), collisions};
  }
  for (const k of collisions) map.delete(k);
  return {map, collisions};
}

// ---------------------------------------------------------------------------
// Sitemap seed
// ---------------------------------------------------------------------------

async function fetchSitemapSeeds() {
  const res = await fetch(`${BASE_URL}/sitemap.xml`, {headers: cookieHeader(), redirect: 'follow'});
  if (!res.ok) throw new Error(`sitemap.xml HTTP ${res.status}`);
  const xml = await res.text();
  const locs = [];
  const re = /<loc>\s*([\s\S]*?)\s*<\/loc>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const loc = m[1].trim();
    const u = toAbsolute(loc, SITE_ORIGIN);
    if (u) locs.push(toCrawlUrl(u).href);
  }
  return [...new Set(locs)];
}

// ---------------------------------------------------------------------------
// Playwright render + link extraction
// ---------------------------------------------------------------------------

async function revealMenus(page, deep) {
  // Best-effort: open disclosure menus so any mount-on-interaction links enter
  // the DOM. Most of this app's mega-panels render their <a> in the DOM and
  // toggle visibility, so querySelectorAll already sees them; this is belt &
  // suspenders for the truly mount-on-open ones. SA1's source audit is the
  // safety net. Wrapped so a flaky hover never fails a page.
  try {
    const triggers = await page
      .locator('header [aria-haspopup], header button[aria-expanded], nav [aria-haspopup], nav button[aria-expanded], [data-mobile-menu-trigger], button[aria-controls]')
      .elementHandles();
    const cap = deep ? Math.min(triggers.length, 30) : Math.min(triggers.length, 12);
    for (let i = 0; i < cap; i += 1) {
      try {
        await triggers[i].hover({timeout: 300});
      } catch {}
      try {
        await triggers[i].click({timeout: 300});
      } catch {}
    }
    if (cap > 0) await page.waitForTimeout(deep ? 250 : 120);
  } catch {}
}

async function renderAndExtract(context, pageUrl, deep) {
  const page = await context.newPage();
  const out = {
    pageUrl,
    finalUrl: pageUrl,
    status: null,
    error: null,
    anchors: [],
    areas: [],
    forms: [],
    canonicals: [],
    alternates: [],
    anchorIds: [],
  };
  let nav;
  try {
    // 'commit' is the safest waitUntil for Next dev (HMR sockets can hang
    // 'domcontentloaded' inside goto); we then wait for DOM state separately.
    nav = await page.goto(pageUrl, {waitUntil: 'commit', timeout: 45000});
  } catch (err) {
    out.error = `navigation failed: ${err.message}`;
    await page.close();
    return out;
  }
  out.status = nav ? nav.status() : null;
  out.finalUrl = page.url();
  try {
    await page.waitForLoadState('domcontentloaded', {timeout: 30000});
  } catch {}
  try {
    await page.waitForLoadState('networkidle', {timeout: 8000});
  } catch {
    // analytics/HMR sockets can keep the network busy — DOM is parsed, proceed.
  }
  await revealMenus(page, deep);

  try {
    const extracted = await page.evaluate(() => {
      const txt = (el) => (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120);
      const anchors = Array.from(document.querySelectorAll('a[href]')).map((a) => ({
        href: a.getAttribute('href'), // RAW, as authored
        text: txt(a),
        ariaLabel: a.getAttribute('aria-label') || '',
      }));
      const areas = Array.from(document.querySelectorAll('area[href]')).map((a) => ({
        href: a.getAttribute('href'),
        ariaLabel: a.getAttribute('aria-label') || '',
      }));
      const forms = Array.from(document.querySelectorAll('form[action]')).map((f) => ({
        action: f.getAttribute('action'),
        method: (f.getAttribute('method') || 'get').toLowerCase(),
      }));
      const canonicals = Array.from(document.querySelectorAll('link[rel="canonical"]')).map(
        (l) => l.getAttribute('href'),
      );
      const alternates = Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]')).map(
        (l) => ({hreflang: l.getAttribute('hreflang'), href: l.getAttribute('href')}),
      );
      const ids = Array.from(document.querySelectorAll('[id]')).map((e) => e.id).filter(Boolean);
      const names = Array.from(document.querySelectorAll('[name]'))
        .map((e) => e.getAttribute('name'))
        .filter(Boolean);
      return {anchors, areas, forms, canonicals, alternates, anchorIds: [...new Set([...ids, ...names])]};
    });
    Object.assign(out, extracted);
  } catch (err) {
    out.error = `extract failed: ${err.message}`;
  }
  await page.close();
  return out;
}

// ---------------------------------------------------------------------------
// Internal URL status check (redirect chain via fetch)
// ---------------------------------------------------------------------------

async function checkInternalUrl(absUrl) {
  // absUrl is already mapped to the crawl origin.
  const requested = absUrl.href;
  const chain = [];
  let current = absUrl.href;
  let status = null;
  try {
    for (let hop = 0; hop < 10; hop += 1) {
      const res = await fetch(current, {headers: {...cookieHeader(), 'user-agent': UA}, redirect: 'manual'});
      status = res.status;
      if ([301, 302, 303, 307, 308].includes(status)) {
        const loc = res.headers.get('location');
        if (!loc) return {requested, chain, finalUrl: current, finalStatus: status, klass: 'ERROR', detail: '3xx without Location'};
        const next = new URL(loc, current).href;
        chain.push({from: current, status, to: next});
        current = next;
        continue;
      }
      break;
    }
  } catch (err) {
    return {requested, chain, finalUrl: current, finalStatus: null, klass: 'ERROR', detail: err.message};
  }
  if (chain.length >= 10) {
    return {requested, chain, finalUrl: current, finalStatus: status, klass: 'ERROR', detail: 'redirect chain too long'};
  }

  const finalUrl = current;
  // API / OG handlers: a GET to a POST-only route returns 405 (or 400/403),
  // which proves the endpoint EXISTS. Only 404/410 means a genuinely broken
  // endpoint; 5xx/network is an error. (Form actions point here.)
  let reqPathForApi = '';
  try {
    reqPathForApi = new URL(requested).pathname;
  } catch {}
  if (/^\/(api|og)(\/|$)/.test(reqPathForApi)) {
    if (status === 404 || status === 410) return {requested, chain, finalUrl, finalStatus: status, klass: 'BROKEN'};
    if (status === null || status >= 500) return {requested, chain, finalUrl, finalStatus: status, klass: 'ERROR'};
    return {requested, chain, finalUrl, finalStatus: status, klass: 'OK'};
  }
  if (status === 404 || status === 410) {
    return {requested, chain, finalUrl, finalStatus: status, klass: 'BROKEN'};
  }
  if (status === null || status >= 500) {
    return {requested, chain, finalUrl, finalStatus: status, klass: 'ERROR'};
  }
  if (status >= 200 && status < 300) {
    if (chain.length === 0) return {requested, chain, finalUrl, finalStatus: status, klass: 'OK'};
    // Redirected to a 200. Slash-only or different page?
    let reqPath, finPath;
    try {
      reqPath = stripTrailingSlash(new URL(requested).pathname);
      finPath = stripTrailingSlash(new URL(finalUrl).pathname);
    } catch {
      reqPath = requested;
      finPath = finalUrl;
    }
    if (reqPath === finPath) {
      return {requested, chain, finalUrl, finalStatus: status, klass: 'REDIRECT_SLASH_ONLY'};
    }
    // Default-locale (`/en`) prefix strip: `localePrefix:'as-needed'` 307s
    // `/en/x` → `/x` (same logical page, just the redundant default-locale
    // prefix removed). This is next-intl's standard behavior — a normalization
    // redirect like slash-only, NOT a content change. Classify separately so it
    // doesn't pollute the hard-failure gate.
    const stripEn = (p) => (p === '/en' ? '/' : p.startsWith('/en/') ? p.slice(3) : p);
    if (stripEn(reqPath) === finPath) {
      return {requested, chain, finalUrl, finalStatus: status, klass: 'REDIRECT_LOCALE_PREFIX'};
    }
    return {requested, chain, finalUrl, finalStatus: status, klass: 'REDIRECT_DIFFERENT_PAGE'};
  }
  // Any other terminal status (e.g. 4xx besides 404/410) → treat as ERROR so it
  // surfaces; the report carries the exact code.
  return {requested, chain, finalUrl, finalStatus: status, klass: 'ERROR', detail: `terminal HTTP ${status}`};
}

// ---------------------------------------------------------------------------
// External liveness (report-only)
// ---------------------------------------------------------------------------

async function checkExternalUrl(url) {
  let lastErr = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 9000);
      let res = await fetch(url, {method: 'HEAD', redirect: 'follow', signal: ctrl.signal, headers: {'user-agent': UA}});
      clearTimeout(t);
      // Some hosts reject HEAD — retry once with GET.
      if ([403, 405, 501].includes(res.status)) {
        const ctrl2 = new AbortController();
        const t2 = setTimeout(() => ctrl2.abort(), 11000);
        res = await fetch(url, {method: 'GET', redirect: 'follow', signal: ctrl2.signal, headers: {'user-agent': UA}});
        clearTimeout(t2);
      }
      const ok = res.status >= 200 && res.status < 400;
      return {url, status: res.status, ok};
    } catch (err) {
      lastErr = err.message;
    }
  }
  return {url, status: null, ok: false, error: lastErr};
}

// ---------------------------------------------------------------------------
// Main crawl
// ---------------------------------------------------------------------------

async function main() {
  console.log(`${C.bold}Link-integrity crawl against ${BASE_URL}${C.reset}${STRICT ? `  ${C.yellow}[--strict]${C.reset}` : ''}`);
  await primeBypassCookie();
  if ((SHARE_TOKEN || BYPASS_TOKEN) && !bypassCookieName) {
    console.log(`${C.yellow}warning:${C.reset} bypass token set but cookie priming failed — protected pages may 401`);
  }

  const {map: entityMap} = await buildEntityMap();

  // Seed set
  let seeds;
  try {
    seeds = await fetchSitemapSeeds();
  } catch (err) {
    console.error(`${C.red}fatal:${C.reset} ${err.message}`);
    process.exit(2);
  }
  for (const p of EXTRA_SEED_PATHS) seeds.push(new URL(p, BASE_URL).href);
  seeds = [...new Set(seeds)];
  console.log(`  seeds: ${seeds.length} (sitemap + ${EXTRA_SEED_PATHS.length} reachable-excluded extras)`);

  const browser = await chromium.launch({headless: true});
  const context = await browser.newContext({userAgent: UA, viewport: {width: 1366, height: 900}});
  if (bypassCookieName) {
    await context.addCookies([
      {
        name: bypassCookieName,
        value: bypassCookieValue,
        domain: BASE.hostname,
        path: '/',
        secure: BASE.protocol === 'https:',
        sameSite: 'None',
      },
    ]);
  }
  // Pre-decide cookie consent so the banner doesn't overlay nav during reveal.
  await context.addInitScript(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(
          'sunset_consent_v2',
          JSON.stringify({
            status: 'decided',
            signals: {necessary: true, analytics: false, marketing: false, personalization: false},
            decidedAt: '2026-05-31T00:00:00.000Z',
          }),
        );
      }
    } catch {}
  });

  // State
  const linkInstances = []; // {sourcePage, kind, rawHref, text, ariaLabel, internal, resolved}
  const internalTargets = new Map(); // crawlUrlHref -> {raw set, instances[]}
  const externalTargets = new Map(); // href -> instances[]
  const napTargets = new Map(); // href -> instances[]
  const hashLinks = []; // {sourcePage, rawHref, destKey, fragment, text}
  const canonicalRecord = []; // {sourcePage, href} — completeness only
  const alternateRecord = []; // {sourcePage, hreflang, href}
  const pageAnchorIds = new Map(); // visitedKey -> Set(ids)
  const pageErrors = []; // {pageUrl, status, error}

  const visited = new Set();
  const queue = [...seeds];
  let crawledCount = 0;
  let cappedAt = null;

  const recordLink = (sourcePage, rawHref, text, ariaLabel, kind) => {
    const scheme = classifyScheme(rawHref);
    if (scheme === 'empty' || scheme === 'skip') return;

    if (scheme === 'mailto' || scheme === 'tel') {
      const inst = {sourcePage, kind, rawHref, text, ariaLabel, type: scheme};
      linkInstances.push(inst);
      if (!napTargets.has(rawHref)) napTargets.set(rawHref, []);
      napTargets.get(rawHref).push(inst);
      return;
    }
    if (scheme === 'hash') {
      // same-page fragment
      const frag = decodeURIComponent(rawHref.slice(1));
      const destKey = visitedKey(new URL(sourcePage));
      const inst = {sourcePage, kind, rawHref, text, ariaLabel, type: 'hash', destKey, fragment: frag};
      linkInstances.push(inst);
      if (frag) hashLinks.push(inst);
      return;
    }

    // http(s)
    const abs = toAbsolute(rawHref, sourcePage);
    if (!abs) return;
    const internal = isInternalUrl(abs);
    const inst = {sourcePage, kind, rawHref, text, ariaLabel, type: 'http', internal, resolved: abs.href};
    linkInstances.push(inst);

    if (abs.hash) {
      // internal/external link WITH a fragment → also a hash check on the dest
      const crawlAbs = internal ? toCrawlUrl(abs) : abs;
      const frag = decodeURIComponent(abs.hash.slice(1));
      if (frag && internal) {
        hashLinks.push({
          sourcePage,
          kind,
          rawHref,
          text,
          ariaLabel,
          type: 'hash',
          destKey: visitedKey(crawlAbs),
          destUrl: crawlAbs.href,
          fragment: frag,
        });
      }
    }

    if (internal) {
      const crawlAbs = toCrawlUrl(abs);
      const key = crawlAbs.href;
      if (!internalTargets.has(key)) internalTargets.set(key, {url: crawlAbs, instances: []});
      internalTargets.get(key).instances.push(inst);
      // BFS enqueue — only follow <a>/<area> to real HTML pages; never crawl
      // form actions or /api//og handlers (they aren't navigable pages).
      if (
        CRAWL_FOLLOW &&
        (kind === 'a' || kind === 'area') &&
        looksLikeHtmlPage(crawlAbs.pathname) &&
        !/^\/(api|og)(\/|$)/.test(crawlAbs.pathname)
      ) {
        const vk = visitedKey(crawlAbs);
        if (!visited.has(vk) && !queue.includes(crawlAbs.href)) {
          queue.push(crawlAbs.href);
        }
      }
    } else {
      if (!externalTargets.has(abs.href)) externalTargets.set(abs.href, []);
      externalTargets.get(abs.href).push(inst);
    }
  };

  // BFS
  let qi = 0;
  while (qi < queue.length) {
    const pageUrl = queue[qi];
    qi += 1;
    const u = toAbsolute(pageUrl, BASE_URL);
    if (!u) continue;
    const vk = visitedKey(u);
    if (visited.has(vk)) continue;
    visited.add(vk);
    if (crawledCount >= MAX_PAGES) {
      cappedAt = MAX_PAGES;
      break;
    }
    crawledCount += 1;
    process.stdout.write(`  [${String(crawledCount).padStart(4)}] ${pad(u.pathname + u.search, 60)} `);

    const res = await renderAndExtract(context, pageUrl, crawledCount === 1);
    const tag =
      res.error || (res.status && res.status >= 400)
        ? `${C.red}${res.status || 'ERR'}${C.reset}`
        : `${C.green}${res.status || 'ok'}${C.reset}`;
    console.log(`${tag}  (${res.anchors.length} a)`);

    if (res.error) pageErrors.push({pageUrl, status: res.status, error: res.error});
    pageAnchorIds.set(vk, new Set(res.anchorIds || []));
    // also key by final URL (post slash-strip redirect) so hash dest lookups hit
    try {
      pageAnchorIds.set(visitedKey(new URL(res.finalUrl)), new Set(res.anchorIds || []));
    } catch {}

    for (const a of res.anchors) recordLink(res.finalUrl, a.href, a.text, a.ariaLabel, 'a');
    for (const a of res.areas) recordLink(res.finalUrl, a.href, '', a.ariaLabel, 'area');
    for (const f of res.forms) recordLink(res.finalUrl, f.action, '', '', 'form');
    for (const c of res.canonicals) canonicalRecord.push({sourcePage: res.finalUrl, href: c});
    for (const al of res.alternates)
      alternateRecord.push({sourcePage: res.finalUrl, hreflang: al.hreflang, href: al.href});
  }

  console.log(`\n  crawled ${crawledCount} page(s); ${internalTargets.size} unique internal targets, ${externalTargets.size} external, ${hashLinks.length} hash link(s)`);
  if (cappedAt) console.log(`  ${C.yellow}WARNING: hit MAX_PAGES=${cappedAt} crawl cap — coverage truncated. Raise MAX_PAGES and re-run.${C.reset}`);

  // ---- Internal URL status checks ----
  process.stdout.write('  checking internal URLs … ');
  const internalResults = new Map();
  for (const [key, {url}] of internalTargets) {
    internalResults.set(key, await checkInternalUrl(url));
  }
  console.log('done');

  // ---- External liveness ----
  const externalResults = new Map();
  if (!SKIP_REMOTE && externalTargets.size > 0) {
    process.stdout.write(`  checking ${externalTargets.size} external URL(s) … `);
    for (const url of externalTargets.keys()) {
      externalResults.set(url, await checkExternalUrl(url));
    }
    console.log('done');
  } else if (SKIP_REMOTE) {
    console.log('  external checks skipped (SKIP_REMOTE=1)');
  }

  // ---- Hash anchor verification ----
  for (const hl of hashLinks) {
    let ids = pageAnchorIds.get(hl.destKey);
    if (!ids && hl.destUrl) {
      // Destination not crawled — render on demand.
      const r = await renderAndExtract(context, hl.destUrl, false);
      ids = new Set(r.anchorIds || []);
      pageAnchorIds.set(hl.destKey, ids);
    }
    hl.anchorOk = ids ? ids.has(hl.fragment) : false;
    hl.anchorChecked = Boolean(ids);
  }

  // ---- NAP / mailto / tel ----
  const napFindings = [];
  for (const [href, insts] of napTargets) {
    if (/^tel:/i.test(href)) {
      const digits = href.replace(/^tel:/i, '').replace(/[^0-9]/g, '');
      const norm = digits.replace(/^1/, ''); // strip country code
      if (norm !== NAP_PHONE_DIGITS) {
        napFindings.push({href, type: 'tel', issue: `phone digits "${norm}" != canonical ${NAP_PHONE_DIGITS}`, count: insts.length});
      }
    } else if (/^mailto:/i.test(href)) {
      const addr = href.replace(/^mailto:/i, '').split('?')[0].trim().toLowerCase();
      if (addr && addr !== NAP_EMAIL) {
        napFindings.push({href, type: 'mailto', issue: `email "${addr}" != canonical ${NAP_EMAIL}`, count: insts.length});
      }
    }
  }

  // ---- Wrong-destination heuristic ----
  const wrongDest = [];
  if (entityMap.size > 0) {
    for (const inst of linkInstances) {
      if (inst.type !== 'http' || !inst.internal) continue;
      const label = normalizeText(inst.text) || normalizeText(inst.ariaLabel);
      const ent = entityMap.get(label);
      if (!ent) continue;
      let seg;
      try {
        seg = terminalSegment(new URL(inst.resolved).pathname);
      } catch {
        continue;
      }
      if (seg && seg !== ent.slug) {
        wrongDest.push({
          sourcePage: inst.sourcePage,
          anchorText: inst.text || inst.ariaLabel,
          rawHref: inst.rawHref,
          kind: ent.kind,
          expectedSlug: ent.slug,
          actualSlug: seg,
        });
      }
    }
  }

  await context.close();
  await browser.close();

  // ---- Aggregate ----
  const buckets = {OK: 0, REDIRECT_SLASH_ONLY: 0, REDIRECT_LOCALE_PREFIX: 0, REDIRECT_DIFFERENT_PAGE: 0, BROKEN: 0, ERROR: 0};
  for (const r of internalResults.values()) buckets[r.klass] = (buckets[r.klass] || 0) + 1;
  const externalDead = [...externalResults.values()].filter((r) => !r.ok);
  const missingAnchors = hashLinks.filter((h) => h.anchorChecked && !h.anchorOk);
  const uncheckedAnchors = hashLinks.filter((h) => !h.anchorChecked);

  // Hard failures (default gate)
  const hardInternal = [...internalResults.entries()].filter(([, r]) =>
    ['BROKEN', 'ERROR', 'REDIRECT_DIFFERENT_PAGE'].includes(r.klass),
  );
  const hardCount = hardInternal.length + missingAnchors.length + pageErrors.length;
  // Warnings
  const warnCount =
    buckets.REDIRECT_SLASH_ONLY +
    buckets.REDIRECT_LOCALE_PREFIX +
    externalDead.length +
    wrongDest.length +
    napFindings.length +
    uncheckedAnchors.length;

  // ---- Report ----
  printReport({
    internalResults,
    internalTargets,
    externalResults,
    hardInternal,
    missingAnchors,
    uncheckedAnchors,
    externalDead,
    wrongDest,
    napFindings,
    pageErrors,
    buckets,
    crawledCount,
  });

  writeReport({
    buckets,
    hardCount,
    warnCount,
    crawledCount,
    cappedAt,
    internalResults,
    internalTargets,
    externalResults,
    hashLinks,
    wrongDest,
    napFindings,
    pageErrors,
    canonicalRecord,
    alternateRecord,
    linkInstances,
  });

  console.log('');
  console.log(
    `${C.bold}TOTAL:${C.reset} ${hardCount} hard internal failure(s) / ${warnCount} warning(s) across ${crawledCount} page(s)`,
  );
  console.log(
    `  internal: ${C.green}${buckets.OK} OK${C.reset}, ${buckets.REDIRECT_SLASH_ONLY} slash-only, ${buckets.REDIRECT_LOCALE_PREFIX} locale-prefix, ${C.red}${buckets.REDIRECT_DIFFERENT_PAGE} diff-page${C.reset}, ${C.red}${buckets.BROKEN} broken${C.reset}, ${C.red}${buckets.ERROR} error${C.reset}`,
  );
  console.log(
    `  hash: ${missingAnchors.length} missing-anchor, ${uncheckedAnchors.length} unchecked | external: ${externalDead.length} dead/${externalResults.size} | heuristic wrong-dest: ${wrongDest.length} | NAP: ${napFindings.length}`,
  );
  console.log(`Report: ${REPORT_PATH}`);

  const fail = STRICT ? hardCount > 0 || warnCount > 0 : hardCount > 0;
  process.exit(fail ? 1 : 0);
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

function shortPath(href) {
  try {
    const u = new URL(href);
    return u.pathname + u.search + u.hash;
  } catch {
    return href;
  }
}

function printReport(r) {
  console.log('');
  if (r.pageErrors.length) {
    console.log(`${C.bold}${C.red}Page render errors (${r.pageErrors.length})${C.reset}`);
    for (const e of r.pageErrors) console.log(`  ${C.red}E${C.reset}  ${shortPath(e.pageUrl)} — ${e.status || ''} ${e.error}`);
    console.log('');
  }

  const hard = r.hardInternal;
  if (hard.length) {
    console.log(`${C.bold}${C.red}Hard internal failures (${hard.length})${C.reset}  — these fail the default gate`);
    for (const [key, res] of hard) {
      const insts = r.internalTargets.get(key)?.instances || [];
      const src = insts.length ? ` ← ${insts.length} link(s), e.g. "${(insts[0].text || insts[0].ariaLabel || '').slice(0, 40)}" on ${shortPath(insts[0].sourcePage)}` : '';
      console.log(`  ${C.red}${pad(res.klass, 22)}${C.reset} ${shortPath(res.requested)}  →  HTTP ${res.finalStatus ?? 'ERR'}${res.detail ? ` (${res.detail})` : ''}`);
      if (res.klass === 'REDIRECT_DIFFERENT_PAGE') console.log(`      ${C.gray}final: ${shortPath(res.finalUrl)}${C.reset}`);
      if (src) console.log(`      ${C.gray}${src}${C.reset}`);
    }
    console.log('');
  }

  if (r.missingAnchors.length) {
    console.log(`${C.bold}${C.red}Missing hash anchors (${r.missingAnchors.length})${C.reset}  — fail the default gate`);
    for (const h of r.missingAnchors) {
      console.log(`  ${C.red}MISSING_ANCHOR${C.reset}  #${h.fragment}  (href "${h.rawHref}" on ${shortPath(h.sourcePage)})`);
    }
    console.log('');
  }

  // Warnings
  const slashOnly = [...r.internalResults.entries()].filter(([, res]) => res.klass === 'REDIRECT_SLASH_ONLY');
  if (slashOnly.length) {
    console.log(`${C.bold}${C.yellow}Trailing-slash-only redirects (${slashOnly.length})${C.reset}  — warning (D4 decision)`);
    for (const [key, res] of slashOnly.slice(0, 40)) {
      const insts = r.internalTargets.get(key)?.instances || [];
      console.log(`  ${C.yellow}308${C.reset} ${shortPath(res.requested)} → ${shortPath(res.finalUrl)}  (${insts.length} link instance(s))`);
    }
    if (slashOnly.length > 40) console.log(`  ${C.gray}… and ${slashOnly.length - 40} more (full list in JSON)${C.reset}`);
    console.log('');
  }

  const localePrefix = [...r.internalResults.entries()].filter(([, res]) => res.klass === 'REDIRECT_LOCALE_PREFIX');
  if (localePrefix.length) {
    console.log(`${C.bold}${C.yellow}Default-locale (/en) prefix redirects (${localePrefix.length})${C.reset}  — warning (next-intl as-needed; D4 decision)`);
    for (const [key, res] of localePrefix.slice(0, 40)) {
      const insts = r.internalTargets.get(key)?.instances || [];
      console.log(`  ${C.yellow}307${C.reset} ${shortPath(res.requested)} → ${shortPath(res.finalUrl)}  (${insts.length} link instance(s))`);
    }
    if (localePrefix.length > 40) console.log(`  ${C.gray}… and ${localePrefix.length - 40} more (full list in JSON)${C.reset}`);
    console.log('');
  }

  if (r.externalDead.length) {
    console.log(`${C.bold}${C.yellow}Dead external links (${r.externalDead.length})${C.reset}  — REPORT-ONLY (fix at the third party / in content)`);
    for (const e of r.externalDead) console.log(`  ${C.yellow}DEAD${C.reset} ${e.status ?? e.error ?? '?'}  ${e.url}`);
    console.log('');
  }

  if (r.wrongDest.length) {
    console.log(`${C.bold}${C.yellow}Possible wrong-destination links (${r.wrongDest.length})${C.reset}  — heuristic, triage decides`);
    for (const w of r.wrongDest.slice(0, 40)) {
      console.log(`  ${C.yellow}?${C.reset} "${w.anchorText}" → ${w.rawHref}  (expected ${w.kind} slug "${w.expectedSlug}", got "${w.actualSlug}") on ${shortPath(w.sourcePage)}`);
    }
    if (r.wrongDest.length > 40) console.log(`  ${C.gray}… and ${r.wrongDest.length - 40} more${C.reset}`);
    console.log('');
  }

  if (r.napFindings.length) {
    console.log(`${C.bold}${C.yellow}NAP / tel / mailto (${r.napFindings.length})${C.reset}  — report-only`);
    for (const n of r.napFindings) console.log(`  ${C.yellow}${n.type}${C.reset} ${n.href} — ${n.issue} (${n.count}×)`);
    console.log('');
  }

  if (r.uncheckedAnchors.length) {
    console.log(`${C.gray}${r.uncheckedAnchors.length} hash link(s) could not be anchor-verified (destination not rendered).${C.reset}`);
  }
}

function writeReport(data) {
  mkdirSync(dirname(REPORT_PATH), {recursive: true});
  const internal = [...data.internalResults.entries()].map(([key, res]) => ({
    url: shortPath(key),
    ...res,
    requested: shortPath(res.requested),
    finalUrl: shortPath(res.finalUrl),
    instances: (data.internalTargets.get(key)?.instances || []).map((i) => ({
      sourcePage: shortPath(i.sourcePage),
      text: i.text,
      ariaLabel: i.ariaLabel,
      rawHref: i.rawHref,
    })),
  }));
  writeFileSync(
    REPORT_PATH,
    JSON.stringify(
      {
        baseUrl: BASE_URL,
        strict: STRICT,
        skippedRemote: SKIP_REMOTE,
        crawlFollow: CRAWL_FOLLOW,
        generatedAt: new Date().toISOString(),
        totals: {hard: data.hardCount, warnings: data.warnCount, crawledPages: data.crawledCount, cappedAt: data.cappedAt},
        buckets: data.buckets,
        internal,
        external: [...data.externalResults.values()],
        hashLinks: data.hashLinks.map((h) => ({
          sourcePage: shortPath(h.sourcePage),
          fragment: h.fragment,
          rawHref: h.rawHref,
          anchorOk: h.anchorOk,
          anchorChecked: h.anchorChecked,
        })),
        wrongDestination: data.wrongDest,
        nap: data.napFindings,
        pageErrors: data.pageErrors.map((e) => ({pageUrl: shortPath(e.pageUrl), status: e.status, error: e.error})),
        canonicalRecord: data.canonicalRecord,
        alternateRecord: data.alternateRecord,
        linkInstanceCount: data.linkInstances.length,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(`${C.red}fatal:${C.reset} ${err.stack || err.message}`);
  process.exit(2);
});
