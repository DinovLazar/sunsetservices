#!/usr/bin/env node
/**
 * Phase M.11c — Mobile rendering validation harness.
 *
 * Mirrors the B.04 / B.05 / B.06 env-var + exit-code + JSON-sidecar contract.
 * Drives Playwright headless Chromium across a real-phone viewport matrix and
 * asserts that every representative surface renders with no horizontal
 * overflow / page cutoff, valid (zoomable) viewport meta, and no sub-24px
 * tap target (the B.06 floor). Softer issues (sub-44px targets, sticky
 * coverage, clipped text, oversized images, off-viewport element culprits)
 * are reported as WARNINGS for triage. A full-page screenshot is captured
 * per (viewport, URL) into a gitignored dir for visual evidence.
 *
 * VIEWPORT MATRIX (M.11c-D6)
 *   portrait 320/360/375/390/414 · 667×375 landscape · 390×620 short-height
 *   · 768 (md boundary) · 1280 (desktop no-regression)
 *
 * USAGE
 *   node scripts/validate-mobile.mjs                                  # localhost:3000
 *   BASE_URL=https://preview.vercel.app node scripts/validate-mobile.mjs
 *   BASE_URL=https://preview.vercel.app BYPASS_TOKEN=xyz node scripts/validate-mobile.mjs
 *   BASE_URL=https://preview.vercel.app VERCEL_SHARE_TOKEN=xyz node scripts/validate-mobile.mjs
 *   node scripts/validate-mobile.mjs --only=/contact            # single-URL iteration
 *   node scripts/validate-mobile.mjs --viewport=320             # single-viewport iteration
 *   node scripts/validate-mobile.mjs --no-interactions          # skip the open-then-measure surfaces
 *   node scripts/validate-mobile.mjs --no-screenshots           # skip PNG capture (faster)
 *
 * EXIT CODE
 *   0  Zero ERRORS across the full matrix (warnings allowed, reported).
 *   1  Any ERROR: horizontal scroll, an unclipped element past the viewport,
 *      an invalid viewport meta (user-scalable=no / maximum-scale<5), or a
 *      standalone interactive < 24×24 CSS px (B.06 regression).
 *   2  Harness crashed.
 *
 * OUTPUTS
 *   stdout                                       colored per-(viewport,URL) table
 *   scripts/.mobile-validation-report.json       full machine report (gitignored)
 *   scripts/.mobile-validation-cache.json        reserved (gitignored)
 *   scripts/.mobile-screenshots/<vp>/<slug>.png  per-viewport evidence (gitignored)
 */

import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {chromium} from 'playwright';

// ---------------------------------------------------------------------------
// Config — same env contract as B.04/B.05/B.06/B.07.
// ---------------------------------------------------------------------------

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const BYPASS_TOKEN = process.env.BYPASS_TOKEN || '';
// Phase B.07: `_vercel_share` token (Vercel MCP get_access_to_vercel_url) primes
// the same `_vercel_jwt` cookie via a different query param; wins over BYPASS_TOKEN.
const SHARE_TOKEN = process.env.VERCEL_SHARE_TOKEN || '';
// Reserved for parity with the prior harnesses (no remote-validator calls yet).
const SKIP_REMOTE = process.env.SKIP_REMOTE === '1';

const REPORT_PATH = resolve('scripts/.mobile-validation-report.json');
const SHOTS_DIR = resolve('scripts/.mobile-screenshots');

const ARG_ONLY = (process.argv.find((a) => a.startsWith('--only=')) || '').slice('--only='.length);
const ARG_VP = (process.argv.find((a) => a.startsWith('--viewport=')) || '').slice('--viewport='.length);
const NO_INTERACTIONS = process.argv.includes('--no-interactions');
const NO_SHOTS = process.argv.includes('--no-screenshots');

const IS_LOCAL = /localhost|127\.0\.0\.1/.test(BASE_URL);

// Tap-target thresholds (CSS px). B.06 hard floor = 24; mobile target = 44.
const TAP_FLOOR = 24;
const TAP_TARGET = 44;
// Tolerance for sub-pixel rounding when comparing rects to the viewport edge.
const EDGE_TOL = 2;

// ---------------------------------------------------------------------------
// Viewport matrix (M.11c-D6). `kind` gates which checks run:
//   mobile/mobile-short/tablet → all checks; desktop → overflow-only (regression).
// ---------------------------------------------------------------------------

const VIEWPORTS = [
  {name: '320', w: 320, h: 568, dpr: 2, kind: 'mobile'},
  {name: '360', w: 360, h: 800, dpr: 3, kind: 'mobile'},
  {name: '375', w: 375, h: 812, dpr: 3, kind: 'mobile'},
  {name: '390', w: 390, h: 844, dpr: 3, kind: 'mobile'},
  {name: '414', w: 414, h: 896, dpr: 2, kind: 'mobile'},
  {name: 'land-667x375', w: 667, h: 375, dpr: 3, kind: 'mobile'},
  {name: 'short-390x620', w: 390, h: 620, dpr: 3, kind: 'mobile-short'},
  {name: '768', w: 768, h: 1024, dpr: 2, kind: 'tablet'},
  {name: '1280', w: 1280, h: 800, dpr: 1, kind: 'desktop'},
];

// ---------------------------------------------------------------------------
// Representative URL set (M.11c §5). Slugs are LIVE published content
// (validated against the sitemap during the M.11c baseline reconcile).
// ---------------------------------------------------------------------------

const STATIC_URLS = [
  {path: '/', slug: 'home'},
  {path: '/es', slug: 'es-home'},
  {path: '/landscape', slug: 'div-landscape'},
  {path: '/hardscape', slug: 'div-hardscape'},
  {path: '/waterproofing', slug: 'div-waterproofing'},
  {path: '/snow-removal', slug: 'div-snow-removal'},
  {path: '/landscape/lawn-care', slug: 'svc-lawn-care'},
  {path: '/hardscape/patios-walkways', slug: 'svc-patios-walkways'},
  {path: '/waterproofing/basement-waterproofing', slug: 'svc-basement-waterproofing'},
  {path: '/snow-removal/driveway-snow-removal', slug: 'svc-driveway-snow-removal'},
  {path: '/service-areas', slug: 'service-areas'},
  {path: '/service-areas/aurora', slug: 'city-aurora'},
  {path: '/service-areas/clarendon-hills', slug: 'city-clarendon-hills'},
  {path: '/projects', slug: 'projects'},
  {path: '/projects/aurora-area-patio', slug: 'project-detail'},
  {path: '/blog', slug: 'blog'},
  {path: '/blog/dupage-patio-cost-2026', slug: 'blog-post'},
  {path: '/resources', slug: 'resources'},
  {path: '/resources/patio-materials-guide', slug: 'resource-article'},
  {path: '/about', slug: 'about'},
  {path: '/contact', slug: 'contact'},
  {path: '/qa', slug: 'qa'},
  {path: '/accessibility', slug: 'accessibility'},
  {path: '/privacy', slug: 'privacy-termly'},
  {path: '/terms', slug: 'terms-fallback'},
  {path: '/request-quote', slug: 'request-quote'},
  {path: '/thank-you/?firstName=Test', slug: 'thank-you'},
  {path: '/unsubscribe/SAMPLE_TOKEN_INVALID', slug: 'unsubscribe-invalid'},
  {path: '/this-route-does-not-exist-404', slug: 'not-found-404'},
  {path: '/es/hardscape/patios-walkways', slug: 'es-svc-patios-walkways'},
  {path: '/es/request-quote', slug: 'es-request-quote'},
];

// ---------------------------------------------------------------------------
// Pretty printing
// ---------------------------------------------------------------------------

const useColor = process.stdout.isTTY && process.env.NO_COLOR !== '1';
const C = useColor
  ? {reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m', gray: '\x1b[90m', bold: '\x1b[1m'}
  : Object.fromEntries(['reset', 'red', 'green', 'yellow', 'cyan', 'gray', 'bold'].map((k) => [k, '']));

function pad(s, n) {
  s = String(s);
  return s.length >= n ? s.slice(0, n) : s + ' '.repeat(n - s.length);
}

// ---------------------------------------------------------------------------
// Vercel SSO bypass cookie priming — identical handshake to B.05/B.06.
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

function bypassCookieHeader() {
  return bypassCookieName ? `${bypassCookieName}=${bypassCookieValue}` : '';
}

// ---------------------------------------------------------------------------
// The in-page measurement pass. Self-contained (serialized to the page).
// Returns overflow, clipped-content, tap-target, image-overflow + viewport-meta
// findings for the current viewport.
// ---------------------------------------------------------------------------

function measureInPage(opts) {
  const EDGE_TOL = opts.edgeTol;
  const TAP_FLOOR = opts.tapFloor;
  const TAP_TARGET = opts.tapTarget;

  function cssPath(el) {
    if (!el || el.nodeType !== 1) return '?';
    if (el.id) return `#${el.id}`;
    const parts = [];
    let node = el;
    let depth = 0;
    while (node && node.nodeType === 1 && depth < 4) {
      let part = node.tagName.toLowerCase();
      if (node.id) {
        part += `#${node.id}`;
        parts.unshift(part);
        break;
      }
      const cls = (typeof node.className === 'string' ? node.className : '')
        .trim().split(/\s+/).filter(Boolean).slice(0, 2).join('.');
      if (cls) part += `.${cls}`;
      parts.unshift(part);
      node = node.parentElement;
      depth += 1;
    }
    return parts.join('>');
  }

  function isHidden(el) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.visibility === 'collapse' || cs.opacity === '0') return true;
    return false;
  }

  // Walk ancestors: intentionally hidden (aria-hidden / [hidden] / closed <dialog>)?
  function inHiddenSubtree(el) {
    let a = el;
    while (a && a.nodeType === 1) {
      if (a.getAttribute && a.getAttribute('aria-hidden') === 'true') return true;
      if (a.hasAttribute && a.hasAttribute('hidden')) return true;
      if (a.tagName === 'DIALOG' && !a.open) return true;
      a = a.parentElement;
    }
    return false;
  }

  // Walk ancestors: clipped by a horizontal-overflow container?
  function clipAncestor(el) {
    let p = el.parentElement;
    while (p && p.nodeType === 1) {
      const ox = getComputedStyle(p).overflowX;
      if (ox === 'auto' || ox === 'scroll' || ox === 'hidden' || ox === 'clip') return p;
      p = p.parentElement;
    }
    return null;
  }

  const iw = window.innerWidth;
  const docEl = document.documentElement;
  const docClient = docEl.clientWidth;
  const docScroll = docEl.scrollWidth;
  const docOverflow = docScroll - docClient;

  const overflowEls = [];
  const clippedEls = [];
  const imgOverflow = [];
  const all = document.querySelectorAll('body *');
  for (const el of all) {
    if (isHidden(el)) continue;
    if (inHiddenSubtree(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;

    // ---- off-viewport overflow ----
    const overR = r.right - iw;
    const overL = -r.left;
    if (overR > EDGE_TOL || overL > EDGE_TOL) {
      const clip = clipAncestor(el);
      overflowEls.push({
        sel: cssPath(el),
        tag: el.tagName.toLowerCase(),
        over: Math.round(Math.max(overR, overL)),
        right: Math.round(r.right),
        left: Math.round(r.left),
        clipped: Boolean(clip),
        clipBy: clip ? cssPath(clip) : null,
      });
    }

    // ---- clipped real content (truncation) ----
    const cs = getComputedStyle(el);
    const ovY = cs.overflowY;
    const ovX = cs.overflowX;
    const hasClipY = ovY === 'hidden' || ovY === 'clip';
    const hasClipX = ovX === 'hidden' || ovX === 'clip';
    const lineClamp = cs.webkitLineClamp && cs.webkitLineClamp !== 'none';
    const ellipsis = cs.textOverflow === 'ellipsis';
    const hasText = (el.textContent || '').trim().length > 0;
    // Exclude the sr-only / visually-hidden pattern (1px clip box) — it is
    // *intentionally* clipped and would otherwise flood every form page.
    const clsName = typeof el.className === 'string' ? el.className : '';
    const tinyOrHidden = r.width <= 4 || r.height <= 4 || /(^|\s)(sr-only|visually-hidden)(\s|$)/.test(clsName);
    if (hasText && !lineClamp && !ellipsis && !tinyOrHidden) {
      if (hasClipY && el.scrollHeight - el.clientHeight > 4 && el.clientHeight > 8) {
        clippedEls.push({sel: cssPath(el), axis: 'y', over: el.scrollHeight - el.clientHeight});
      } else if (hasClipX && el.scrollWidth - el.clientWidth > 4 && el.clientWidth > 8) {
        clippedEls.push({sel: cssPath(el), axis: 'x', over: el.scrollWidth - el.clientWidth});
      }
    }

    // ---- image / video wider than container or viewport ----
    if (el.tagName === 'IMG' || el.tagName === 'VIDEO') {
      const parent = el.parentElement;
      const pr = parent ? parent.getBoundingClientRect() : null;
      if (r.width - iw > EDGE_TOL || (pr && r.width - pr.width > EDGE_TOL)) {
        imgOverflow.push({
          sel: cssPath(el),
          w: Math.round(r.width),
          parentW: pr ? Math.round(pr.width) : null,
          src: (el.currentSrc || el.src || '').slice(0, 80),
        });
      }
    }
  }

  // ---- tap targets (B.06 SC 2.5.8 logic: inline-in-text + spacing exceptions) ----
  function isInlineInText(el) {
    const parent = el.parentElement;
    if (!parent) return false;
    const flow = new Set(['P', 'SPAN', 'SUMMARY', 'DT', 'DD', 'BLOCKQUOTE', 'FIGCAPTION', 'TD', 'TH', 'CITE', 'EM', 'STRONG', 'LI', 'LABEL']);
    if (!flow.has(parent.tagName)) return false;
    return Array.from(parent.childNodes).some((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim().length > 0);
  }
  const tapSel = 'a[href]:not([aria-hidden="true"]), button:not([aria-hidden="true"]), [role="button"]:not([aria-hidden="true"]), input[type="checkbox"], input[type="radio"], input[type="button"], input[type="submit"], select';
  const interactives = [];
  for (const el of document.querySelectorAll(tapSel)) {
    if (isHidden(el) || inHiddenSubtree(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    // Only consider targets within the current viewport band (visible to a user here).
    if (r.bottom < 0 || r.top > window.innerHeight) continue;
    interactives.push({el, r});
  }
  function spacedEnough(r) {
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    for (const o of interactives) {
      if (o.r === r) continue;
      const ox = o.r.left + o.r.width / 2;
      const oy = o.r.top + o.r.height / 2;
      if (Math.hypot(cx - ox, cy - oy) < TAP_FLOOR) return false;
    }
    return true;
  }
  const tapErrors = [];
  const tapWarnings = [];
  for (const {el, r} of interactives) {
    const small = r.width < TAP_TARGET || r.height < TAP_TARGET;
    if (!small) continue;
    if (isInlineInText(el)) continue;
    if (el.tagName === 'INPUT' && (r.width <= 1 || r.height <= 1)) continue; // styled-label proxy
    const below24 = r.width < TAP_FLOOR || r.height < TAP_FLOOR;
    const rec = {sel: cssPath(el), size: `${Math.round(r.width)}x${Math.round(r.height)}`, html: el.outerHTML.slice(0, 100)};
    if (below24 && !spacedEnough(r)) tapErrors.push(rec);
    else tapWarnings.push(rec);
  }

  // ---- sticky / fixed overlay coverage of primary interactives ----
  const overlays = [];
  for (const el of document.querySelectorAll('body *')) {
    if (isHidden(el)) continue;
    const pos = getComputedStyle(el).position;
    if (pos === 'fixed' || pos === 'sticky') {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) overlays.push({el, r});
    }
  }
  const covered = [];
  for (const {el, r} of interactives) {
    let maxOv = 0;
    let by = null;
    for (const o of overlays) {
      if (o.el === el || o.el.contains(el) || el.contains(o.el)) continue;
      const ix = Math.max(0, Math.min(r.right, o.r.right) - Math.max(r.left, o.r.left));
      const iy = Math.max(0, Math.min(r.bottom, o.r.bottom) - Math.max(r.top, o.r.top));
      const inter = ix * iy;
      const area = r.width * r.height;
      if (area > 0 && inter / area > maxOv) {
        maxOv = inter / area;
        by = cssPath(o.el);
      }
    }
    if (maxOv > 0.5) covered.push({sel: cssPath(el), pct: Math.round(maxOv * 100), by});
  }

  return {
    iw,
    docClient,
    docScroll,
    docOverflow,
    overflowEls: overflowEls.slice(0, 40),
    clippedEls: clippedEls.slice(0, 20),
    imgOverflow: imgOverflow.slice(0, 20),
    tapErrors: tapErrors.slice(0, 30),
    tapWarnings: tapWarnings.slice(0, 30),
    covered: covered.slice(0, 20),
  };
}

// ---------------------------------------------------------------------------
// Viewport-meta check (parsed from the served HTML head once per run).
// ---------------------------------------------------------------------------

async function checkViewportMeta(page) {
  const content = await page.evaluate(() => {
    const m = document.querySelector('meta[name="viewport"]');
    return m ? m.getAttribute('content') : null;
  });
  const out = {content, errors: [], warnings: []};
  if (!content) {
    out.errors.push('no <meta name="viewport"> present');
    return out;
  }
  const lc = content.toLowerCase();
  if (/user-scalable\s*=\s*(no|0)/.test(lc)) out.errors.push('viewport sets user-scalable=no (a11y anti-pattern)');
  const maxScale = /maximum-scale\s*=\s*([0-9.]+)/.exec(lc);
  if (maxScale && parseFloat(maxScale[1]) < 5) out.errors.push(`viewport sets maximum-scale=${maxScale[1]} (<5, a11y anti-pattern)`);
  if (!/width\s*=\s*device-width/.test(lc)) out.warnings.push('viewport missing width=device-width');
  if (!/viewport-fit\s*=\s*cover/.test(lc)) out.warnings.push('viewport missing viewport-fit=cover (env(safe-area-inset-*) will resolve to 0 on notched devices)');
  return out;
}

// ---------------------------------------------------------------------------
// localStorage seed — suppress the consent banner on the STATIC matrix (the
// banner gets its own interaction scenario) and pre-seed wizard progress so
// the wizard scenario can deep-link to later steps (B.10 trick).
// ---------------------------------------------------------------------------

function seedScript() {
  return `(function(){
    try {
      window.localStorage.setItem('sunset_consent_v2', JSON.stringify({
        status:'decided',
        signals:{necessary:true, analytics:false, marketing:false, personalization:false},
        decidedAt:'2026-06-02T00:00:00.000Z'
      }));
    } catch(e){}
  })();`;
}

// ---------------------------------------------------------------------------
// Per (viewport, URL) measurement
// ---------------------------------------------------------------------------

function classify(vp, url, meta, m) {
  const errors = [];
  const warnings = [];
  // 1. Horizontal scroll — the primary cutoff gate (all viewport kinds).
  if (m.docOverflow > 1) {
    errors.push(`horizontal scroll: scrollWidth ${m.docScroll} > clientWidth ${m.docClient} (+${m.docOverflow}px)`);
  }
  // 2. Unclipped element past the viewport → real overflow culprit (error);
  //    clipped (carousel/scroller/body-overflow-hidden) → warning for review.
  const hardOv = m.overflowEls.filter((e) => !e.clipped);
  const softOv = m.overflowEls.filter((e) => e.clipped);
  for (const e of hardOv) errors.push(`element past viewport (+${e.over}px, unclipped): ${e.sel}`);
  for (const e of softOv.slice(0, 8)) warnings.push(`element past viewport (+${e.over}px, clipped by ${e.clipBy}): ${e.sel}`);
  // 5. Tap targets — sub-24 (B.06 floor) error on mobile kinds; sub-44 warning.
  if (vp.kind !== 'desktop') {
    for (const t of m.tapErrors) errors.push(`tap target ${t.size} (<24, B.06 floor): ${t.sel}`);
    for (const t of m.tapWarnings) warnings.push(`tap target ${t.size} (<44 mobile target): ${t.sel}`);
  }
  // 3/4/7 — warnings (triage + screenshots resolve these).
  if (vp.kind !== 'desktop') {
    for (const c of m.clippedEls) warnings.push(`possible clipped content (${c.axis}, +${c.over}px): ${c.sel}`);
    for (const c of m.covered) warnings.push(`interactive ${c.pct}% covered by ${c.by}: ${c.sel}`);
    for (const im of m.imgOverflow) warnings.push(`image wider than container/viewport (${im.w}px): ${im.sel}`);
  }
  // viewport meta (errors/warnings already split)
  for (const e of meta.errors) errors.push(`viewport-meta: ${e}`);
  for (const w of meta.warnings) warnings.push(`viewport-meta: ${w}`);
  return {errors, warnings};
}

async function measureContext(context, vp, entry, metaCache) {
  const url = `${BASE_URL}${entry.path}`;
  const result = {viewport: vp.name, path: entry.path, errors: [], warnings: [], httpStatus: null};
  const page = await context.newPage();
  try {
    let nav;
    try {
      nav = await page.goto(url, {waitUntil: 'commit', timeout: 35000});
    } catch (err) {
      result.errors.push(`navigation failed: ${err.message}`);
      return result;
    }
    result.httpStatus = nav ? nav.status() : null;
    // 404 page is an intentional surface (we measure it); other 5xx are errors.
    if (nav && nav.status() >= 500) {
      result.errors.push(`HTTP ${nav.status()}`);
      return result;
    }
    try {
      await page.waitForLoadState('domcontentloaded', {timeout: 35000});
    } catch (err) {
      result.errors.push(`domcontentloaded never fired: ${err.message}`);
      return result;
    }
    try {
      await page.waitForLoadState('networkidle', {timeout: 6000});
    } catch {
      /* analytics/HMR sockets can keep networkidle from settling; DOM is ready */
    }
    // Settle layout (fonts, lazy images entering the first viewport).
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

    // Viewport meta — once per URL (locale-independent; cache by path).
    let meta = metaCache.get(entry.path);
    if (!meta) {
      meta = await checkViewportMeta(page);
      metaCache.set(entry.path, meta);
    }

    const m = await page.evaluate(measureInPage, {edgeTol: EDGE_TOL, tapFloor: TAP_FLOOR, tapTarget: TAP_TARGET});
    result.metrics = {docOverflow: m.docOverflow, docScroll: m.docScroll, iw: m.iw, overflow: m.overflowEls.length, taps: m.tapErrors.length};
    const {errors, warnings} = classify(vp, entry.path, meta, m);
    result.errors.push(...errors);
    result.warnings.push(...warnings);

    if (!NO_SHOTS) {
      try {
        const dir = resolve(SHOTS_DIR, vp.name);
        mkdirSync(dir, {recursive: true});
        await page.screenshot({path: resolve(dir, `${entry.slug}.png`), fullPage: true});
      } catch {
        /* screenshot best-effort */
      }
    }
  } finally {
    await page.close();
  }
  return result;
}

// ---------------------------------------------------------------------------
// Interaction-driven surfaces (M.11c §5). Best-effort: if a surface can't be
// opened (selector drift / timeout), record a WARNING rather than failing —
// the static matrix is the hard gate. Each measures overflow + (for sheets)
// internal scroll at one stress viewport.
// ---------------------------------------------------------------------------

async function newSeededContext(browser, vp, {seedConsent = true} = {}) {
  const context = await browser.newContext({
    viewport: {width: vp.w, height: vp.h},
    deviceScaleFactor: vp.dpr,
    isMobile: vp.kind !== 'desktop',
    hasTouch: vp.kind !== 'desktop',
    userAgent: 'Sunset-Services-Mobile-Harness/M.11c (Playwright)',
  });
  if (bypassCookieName) {
    const u = new URL(BASE_URL);
    await context.addCookies([{name: bypassCookieName, value: bypassCookieValue, domain: u.hostname, path: '/', secure: u.protocol === 'https:', sameSite: 'None'}]);
  }
  if (seedConsent) await context.addInitScript({content: seedScript()});
  return context;
}

async function measureOpenSurface(page, label, vp) {
  const m = await page.evaluate(measureInPage, {edgeTol: EDGE_TOL, tapFloor: TAP_FLOOR, tapTarget: TAP_TARGET});
  const errors = [];
  const warnings = [];
  if (m.docOverflow > 1) errors.push(`${label}: horizontal scroll (+${m.docOverflow}px)`);
  for (const e of m.overflowEls.filter((x) => !x.clipped)) errors.push(`${label}: element past viewport (+${e.over}px): ${e.sel}`);
  for (const t of m.tapErrors) errors.push(`${label}: tap target ${t.size} (<24): ${t.sel}`);
  for (const t of m.tapWarnings.slice(0, 6)) warnings.push(`${label}: tap target ${t.size} (<44): ${t.sel}`);
  if (!NO_SHOTS) {
    try {
      const dir = resolve(SHOTS_DIR, `interaction-${vp.name}`);
      mkdirSync(dir, {recursive: true});
      await page.screenshot({path: resolve(dir, `${label}.png`)});
    } catch {/* best-effort */}
  }
  return {errors, warnings};
}

async function runInteractions(browser, vp) {
  const out = {viewport: vp.name, scenarios: []};

  // ---- Wizard: deep-link to each step via the B.10 progress pre-seed ----
  {
    const context = await newSeededContext(browser, vp);
    await context.addInitScript({content: `(function(){try{
      window.localStorage.setItem('sunset_wizard_progress_v2', JSON.stringify({
        step1:{division:'landscape'},
        step2:{selectedSlugs:['lawn-care'],primarySlug:'lawn-care',otherText:''},
        step3:{projectType:'maintenance',timeline:'flex',budget:'unsure'},
        savedAt: 1748736000000
      }));
    }catch(e){}})();`});
    const page = await context.newPage();
    const sc = {name: 'wizard', errors: [], warnings: []};
    try {
      await page.goto(`${BASE_URL}/request-quote/`, {waitUntil: 'domcontentloaded', timeout: 35000});
      await page.waitForTimeout(800);
      // Step 1 measure
      let r = await measureOpenSurface(page, 'wizard-step1', vp);
      sc.errors.push(...r.errors); sc.warnings.push(...r.warnings);
      // Resume to step 3 if the toast is offered
      const resume = page.locator('button', {hasText: /^resume$|^reanudar$/i}).first();
      if (await resume.count()) {
        await resume.click({timeout: 5000}).catch(() => {});
        await page.waitForSelector('form[aria-labelledby="wizard-step3-h2"]', {timeout: 10000}).catch(() => {});
        r = await measureOpenSurface(page, 'wizard-step3', vp);
        sc.errors.push(...r.errors); sc.warnings.push(...r.warnings);
        const next = page.locator('form[aria-labelledby="wizard-step3-h2"] button', {hasText: /next|siguiente/i}).first();
        if (await next.count()) {
          await next.click({timeout: 5000}).catch(() => {});
          await page.waitForSelector('form[aria-labelledby="wizard-step4-h2"]', {timeout: 10000}).catch(() => {});
          r = await measureOpenSurface(page, 'wizard-step4', vp);
          sc.errors.push(...r.errors); sc.warnings.push(...r.warnings);
        }
      } else {
        sc.warnings.push('wizard: resume toast not offered (could not deep-link to step 3/4)');
      }
    } catch (err) {
      sc.warnings.push(`wizard: scenario error — ${err.message}`);
    } finally {
      await page.close();
      await context.close();
    }
    out.scenarios.push(sc);
  }

  // ---- Chat panel (mobile bottom-sheet) ----
  {
    const context = await newSeededContext(browser, vp);
    const page = await context.newPage();
    const sc = {name: 'chat-panel', errors: [], warnings: []};
    try {
      await page.goto(`${BASE_URL}/`, {waitUntil: 'domcontentloaded', timeout: 35000});
      await page.waitForTimeout(800);
      const bubble = page.locator('.chat-bubble, button[aria-label*="chat" i], button[aria-label*="charla" i]').first();
      if (await bubble.count()) {
        await bubble.click({timeout: 5000}).catch(() => {});
        await page.waitForTimeout(700);
        const panel = page.locator('.chat-panel, dialog[open]').first();
        if (await panel.count()) {
          const r = await measureOpenSurface(page, 'chat-panel', vp);
          sc.errors.push(...r.errors); sc.warnings.push(...r.warnings);
        } else {
          sc.warnings.push('chat: panel did not open after bubble click');
        }
      } else {
        sc.warnings.push('chat: bubble not found (consent-gated off?)');
      }
    } catch (err) {
      sc.warnings.push(`chat: scenario error — ${err.message}`);
    } finally {
      await page.close();
      await context.close();
    }
    out.scenarios.push(sc);
  }

  // ---- Mobile nav drawer ----
  {
    const context = await newSeededContext(browser, vp);
    const page = await context.newPage();
    const sc = {name: 'nav-drawer', errors: [], warnings: []};
    try {
      await page.goto(`${BASE_URL}/`, {waitUntil: 'domcontentloaded', timeout: 35000});
      await page.waitForTimeout(700);
      const trigger = page.locator('button[aria-label*="menu" i], button[aria-label*="menú" i], [aria-haspopup][aria-expanded]').first();
      if (await trigger.count()) {
        await trigger.click({timeout: 5000}).catch(() => {});
        await page.waitForTimeout(600);
        const r = await measureOpenSurface(page, 'nav-drawer', vp);
        sc.errors.push(...r.errors); sc.warnings.push(...r.warnings);
      } else {
        sc.warnings.push('nav-drawer: menu trigger not found');
      }
    } catch (err) {
      sc.warnings.push(`nav-drawer: scenario error — ${err.message}`);
    } finally {
      await page.close();
      await context.close();
    }
    out.scenarios.push(sc);
  }

  // ---- Cookie consent banner + preferences modal (do NOT seed consent) ----
  {
    const context = await newSeededContext(browser, vp, {seedConsent: false});
    const page = await context.newPage();
    const sc = {name: 'consent', errors: [], warnings: []};
    try {
      await page.goto(`${BASE_URL}/`, {waitUntil: 'domcontentloaded', timeout: 35000});
      await page.waitForTimeout(900);
      const banner = page.locator('.cookie-banner, [aria-label*="consent" i], [aria-label*="cookie" i]').first();
      if (await banner.count()) {
        let r = await measureOpenSurface(page, 'consent-banner', vp);
        sc.errors.push(...r.errors); sc.warnings.push(...r.warnings);
        const manage = page.locator('button', {hasText: /manage|preferenc|personaliz|administrar|preferencias/i}).first();
        if (await manage.count()) {
          await manage.click({timeout: 5000}).catch(() => {});
          await page.waitForTimeout(600);
          r = await measureOpenSurface(page, 'consent-modal', vp);
          sc.errors.push(...r.errors); sc.warnings.push(...r.warnings);
        }
      } else {
        sc.warnings.push('consent: banner not found (already decided?)');
      }
    } catch (err) {
      sc.warnings.push(`consent: scenario error — ${err.message}`);
    } finally {
      await page.close();
      await context.close();
    }
    out.scenarios.push(sc);
  }

  // ---- Project gallery lightbox ----
  {
    const context = await newSeededContext(browser, vp);
    const page = await context.newPage();
    const sc = {name: 'lightbox', errors: [], warnings: []};
    try {
      await page.goto(`${BASE_URL}/projects/aurora-area-patio/`, {waitUntil: 'domcontentloaded', timeout: 35000});
      await page.waitForTimeout(800);
      const thumb = page.locator('button:has(img), [role="button"]:has(img), figure button, .gallery button').first();
      if (await thumb.count()) {
        await thumb.click({timeout: 5000}).catch(() => {});
        await page.waitForTimeout(600);
        const dlg = page.locator('dialog[open], [role="dialog"]').first();
        if (await dlg.count()) {
          const r = await measureOpenSurface(page, 'lightbox', vp);
          sc.errors.push(...r.errors); sc.warnings.push(...r.warnings);
        } else {
          sc.warnings.push('lightbox: dialog did not open after thumbnail click');
        }
      } else {
        sc.warnings.push('lightbox: no gallery thumbnail found');
      }
    } catch (err) {
      sc.warnings.push(`lightbox: scenario error — ${err.message}`);
    } finally {
      await page.close();
      await context.close();
    }
    out.scenarios.push(sc);
  }

  return out;
}

// ---------------------------------------------------------------------------
// Pre-warm (dev cold-compile) — same trick as validate:a11y.
// ---------------------------------------------------------------------------

async function warmUp(urls) {
  const headers = bypassCookieName ? {Cookie: bypassCookieHeader()} : {};
  for (const u of urls) {
    try {
      const res = await fetch(`${BASE_URL}${u.path}`, {headers, redirect: 'follow'});
      await res.arrayBuffer();
    } catch {/* best-effort */}
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  await primeBypassCookie();

  const viewports = ARG_VP ? VIEWPORTS.filter((v) => v.name === ARG_VP || v.name.startsWith(ARG_VP)) : VIEWPORTS;
  const urls = ARG_ONLY ? STATIC_URLS.filter((u) => u.path === ARG_ONLY) : STATIC_URLS;
  if (viewports.length === 0) { console.error(`${C.red}fatal:${C.reset} --viewport=${ARG_VP} matched nothing`); process.exit(2); }
  if (urls.length === 0) { console.error(`${C.red}fatal:${C.reset} --only=${ARG_ONLY} matched nothing`); process.exit(2); }

  console.log(`${C.bold}Mobile validation against ${BASE_URL}${C.reset}`);
  console.log(`  ${viewports.length} viewport(s) × ${urls.length} URL(s)${NO_INTERACTIONS ? '' : ' + interaction surfaces'}`);
  if (SHARE_TOKEN) console.log('  (Vercel share-token bypass primed)');
  else if (BYPASS_TOKEN) console.log(`  (Vercel SSO bypass primed; cookie=${bypassCookieName || '<priming failed>'})`);

  if (IS_LOCAL) {
    process.stdout.write(`  warming up ${urls.length} route(s)… `);
    const t0 = Date.now();
    await warmUp(urls);
    console.log(`done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }

  const browser = await chromium.launch({headless: true});
  const metaCache = new Map();
  const pageResults = [];
  const interactionResults = [];

  try {
    for (const vp of viewports) {
      const context = await newSeededContext(browser, vp);
      process.stdout.write(`  ${C.bold}${pad(vp.name, 14)}${C.reset} `);
      let vpErr = 0;
      let vpWarn = 0;
      for (const entry of urls) {
        let r;
        try {
          r = await measureContext(context, vp, entry, metaCache);
        } catch (err) {
          r = {viewport: vp.name, path: entry.path, errors: [`fatal: ${err.message}`], warnings: []};
        }
        pageResults.push(r);
        vpErr += r.errors.length;
        vpWarn += r.warnings.length;
      }
      await context.close();
      console.log(`${vpErr === 0 ? C.green + 'OK' : C.red + 'FAIL'}${C.reset} (${vpErr} err / ${vpWarn} warn over ${urls.length} URLs)`);

      // Interactions: mobile + short-height only (skip desktop/tablet/landscape).
      if (!NO_INTERACTIONS && !ARG_ONLY && (vp.kind === 'mobile-short' || vp.name === '375' || vp.name === '320')) {
        process.stdout.write(`  ${pad('  ↳ interact', 14)} `);
        let ir;
        try {
          ir = await runInteractions(browser, vp);
        } catch (err) {
          ir = {viewport: vp.name, scenarios: [{name: 'interactions', errors: [`fatal: ${err.message}`], warnings: []}]};
        }
        interactionResults.push(ir);
        const ie = ir.scenarios.reduce((a, s) => a + s.errors.length, 0);
        const iw2 = ir.scenarios.reduce((a, s) => a + s.warnings.length, 0);
        console.log(`${ie === 0 ? C.green + 'OK' : C.red + 'FAIL'}${C.reset} (${ie} err / ${iw2} warn over ${ir.scenarios.length} surfaces)`);
      }
    }
  } finally {
    await browser.close();
  }

  // ---- Totals + report ----
  const totalErrors = pageResults.reduce((a, r) => a + r.errors.length, 0)
    + interactionResults.reduce((a, ir) => a + ir.scenarios.reduce((b, s) => b + s.errors.length, 0), 0);
  const totalWarnings = pageResults.reduce((a, r) => a + r.warnings.length, 0)
    + interactionResults.reduce((a, ir) => a + ir.scenarios.reduce((b, s) => b + s.warnings.length, 0), 0);

  // ---- Detail dump (failures + warnings) ----
  console.log('');
  for (const r of pageResults) {
    if (r.errors.length === 0 && r.warnings.length === 0) continue;
    console.log(`${C.bold}[${r.viewport}] ${r.path}${C.reset}`);
    for (const e of r.errors) console.log(`  ${C.red}E${C.reset}  ${e}`);
    for (const w of r.warnings.slice(0, 12)) console.log(`  ${C.yellow}W${C.reset}  ${w}`);
    if (r.warnings.length > 12) console.log(`     … and ${r.warnings.length - 12} more warnings`);
  }
  for (const ir of interactionResults) {
    for (const s of ir.scenarios) {
      if (s.errors.length === 0 && s.warnings.length === 0) continue;
      console.log(`${C.bold}[${ir.viewport}] interaction:${s.name}${C.reset}`);
      for (const e of s.errors) console.log(`  ${C.red}E${C.reset}  ${e}`);
      for (const w of s.warnings.slice(0, 8)) console.log(`  ${C.yellow}W${C.reset}  ${w}`);
    }
  }

  mkdirSync(dirname(REPORT_PATH), {recursive: true});
  writeFileSync(REPORT_PATH, JSON.stringify({
    baseUrl: BASE_URL,
    generatedAt: new Date().toISOString(),
    bypass: Boolean(BYPASS_TOKEN || SHARE_TOKEN),
    skippedRemote: SKIP_REMOTE,
    viewports: viewports.map((v) => v.name),
    only: ARG_ONLY || null,
    totals: {errors: totalErrors, warnings: totalWarnings},
    pages: pageResults,
    interactions: interactionResults,
  }, null, 2));

  console.log('');
  console.log(`${C.bold}TOTAL:${C.reset} ${totalErrors} errors / ${totalWarnings} warnings`);
  console.log(`Report: ${REPORT_PATH}`);
  if (!NO_SHOTS) console.log(`Screenshots: ${SHOTS_DIR}`);
  process.exit(totalErrors === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(`${C.red}fatal:${C.reset} ${err.stack || err.message}`);
  process.exit(2);
});
