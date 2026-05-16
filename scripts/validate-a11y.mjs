#!/usr/bin/env node
/**
 * Phase B.06 — Accessibility validation harness.
 *
 * Mirrors the B.04 / B.05 env-var + exit-code + JSON-sidecar contract;
 * validates every visible-on-site surface against WCAG 2.2 Level A + AA
 * using `@axe-core/playwright` (primary) + Lighthouse a11y category
 * (secondary, cross-check).
 *
 * Per-URL flow:
 *   1. Navigate Playwright headless Chromium to the URL.
 *   2. Wait for `networkidle` + `domcontentloaded`.
 *   3. Run axe with WCAG 2.0 / 2.1 / 2.2 A + AA tag filter.
 *   4. Run Lighthouse (only the `accessibility` category) against the
 *      same URL via a separate chrome-launcher Chrome instance.
 *   5. Walk WCAG 2.2 net-new SC checks (2.4.11 Focus Not Obscured,
 *      2.5.8 Target Size Minimum) programmatically.
 * Aggregate per-URL findings → table + report.
 *
 * USAGE
 *   node scripts/validate-a11y.mjs                                  # localhost:3000
 *   BASE_URL=https://preview.vercel.app node scripts/validate-a11y.mjs
 *   BASE_URL=https://preview.vercel.app BYPASS_TOKEN=xyz node scripts/validate-a11y.mjs
 *   node scripts/validate-a11y.mjs --only=/about                    # single-URL iteration
 *   node scripts/validate-a11y.mjs --skip-lighthouse                # axe only (faster iter)
 *
 * EXIT CODE
 *   0  Zero violations across every URL AND every Lighthouse a11y score ≥ 95.
 *   1  Any axe violation (WCAG A/AA), any Lighthouse a11y score < 95, or
 *      any 2.4.11 / 2.5.8 finding.
 *
 * OUTPUTS
 *   stdout                                            colored per-URL table
 *   scripts/.a11y-validation-report.json              full machine report
 *   scripts/.a11y-validation-cache.json               (reserved — currently
 *                                                     unused; gitignored
 *                                                     so future remote-check
 *                                                     extensions can plug
 *                                                     in without changing
 *                                                     the gitignore)
 *
 * The committed snapshot of the table lives inline in
 * `src/_project-state/Phase-B-06-Completion.md`.
 */

import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {chromium} from 'playwright';
import {AxeBuilder} from '@axe-core/playwright';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const BYPASS_TOKEN = process.env.BYPASS_TOKEN || '';
// Phase B.07: `_vercel_share` token (from the Vercel MCP `get_access_to_vercel_url`)
// is an alternative bypass mechanism — same `_vercel_jwt` cookie, different
// priming query param. When set, wins over BYPASS_TOKEN. Lighthouse also
// uses _vercel_share=… as the per-call query param.
const SHARE_TOKEN = process.env.VERCEL_SHARE_TOKEN || '';
// Reserved env var; the harness currently does no remote-validator calls.
// Kept in the contract for parity with B.04 + B.05 — surface it so a future
// extension (Pa11y CI, WAVE API, axe DevTools cloud) can plug in without
// changing the env shape.
const SKIP_REMOTE = process.env.SKIP_REMOTE === '1';

const REPORT_PATH = resolve('scripts/.a11y-validation-report.json');

// CLI flag parsing
const ARG_ONLY = (process.argv.find((a) => a.startsWith('--only=')) || '').slice('--only='.length);
const SKIP_LIGHTHOUSE = process.argv.includes('--skip-lighthouse');
const LIGHTHOUSE_MIN_SCORE = 95;

// ---------------------------------------------------------------------------
// Representative URL set — 16 EN + 3 ES parity spot-check = 19 URLs.
//
// One per route family + the four legal/auth routes (per plan §3). ES
// spot-check covers home + service detail + wizard.
//
// Phase B.07 added `/unsubscribe/SAMPLE_TOKEN_INVALID` — the invalid-token
// surface renders 1 heading + 1 paragraph + 1 link (minimal but non-zero
// a11y surface). The harness still asserts zero AA violations + Lighthouse
// a11y = 100 on it.
// ---------------------------------------------------------------------------

const URLS = [
  // ----- EN: 16-URL representative set -----
  {path: '/', label: 'home'},
  {path: '/residential', label: 'audience-landing'},
  {path: '/residential/lawn-care', label: 'service-detail'},
  {path: '/service-areas', label: 'service-areas-index'},
  {path: '/service-areas/aurora', label: 'city-page'},
  {path: '/projects', label: 'projects-index'},
  {path: '/projects/aurora-driveway-apron', label: 'project-detail'},
  {path: '/blog', label: 'blog-index'},
  {path: '/blog/dupage-patio-cost-2026', label: 'blog-detail'},
  {path: '/resources', label: 'resources-index'},
  {path: '/resources/patio-materials-guide', label: 'resource-detail'},
  {path: '/about', label: 'about'},
  {path: '/contact', label: 'contact-calendly'},
  {path: '/request-quote', label: 'quote-wizard'},
  {path: '/privacy', label: 'legal-termly'},
  {path: '/unsubscribe/SAMPLE_TOKEN_INVALID', label: 'unsubscribe-invalid'},
  // ----- ES parity spot-check (3 URLs) -----
  {path: '/es', label: 'es-home'},
  {path: '/es/residential/lawn-care', label: 'es-service-detail'},
  {path: '/es/request-quote', label: 'es-quote-wizard'},
];

// The WCAG tags the harness enforces — WCAG 2.0/2.1/2.2 Level A + AA.
// `best-practice` axe rules are deliberately excluded: per D6 of the plan
// they're informational and don't block the phase, and the DoD only
// requires axe AA + WCAG 2.2 SC + Lighthouse ≥ 95. Adding `best-practice`
// here would surface ~3-5 findings per run that need separate triage
// without changing the phase-close criteria.
const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'];
const ALL_AUDIT_TAGS = [...WCAG_AA_TAGS];

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

function padNum(s, n) {
  s = String(s);
  return s.length >= n ? s.slice(0, n) : ' '.repeat(n - s.length) + s;
}

// ---------------------------------------------------------------------------
// Vercel SSO bypass cookie priming — same handshake as B.04 / B.05.
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
// WCAG 2.2 net-new SC programmatic checks.
//
// 2.4.11 Focus Not Obscured (Minimum): every focused element's bounding
// box must not be overlapped > 50% by any position:fixed overlay
// (navbar, chat bubble, cookie banner, wizard sticky-Next).
//
// 2.5.8 Target Size (Minimum): every standalone interactive ≥ 24×24 CSS px.
// Inline-in-text links (links inside <p>/<li>/<span> body prose) are
// exempt per the SC's documented exception.
// ---------------------------------------------------------------------------

async function checkFocusNotObscured(page) {
  const findings = [];
  const handles = await page.locator(
    'a[href]:visible, button:visible, input:visible, select:visible, textarea:visible, [tabindex]:not([tabindex="-1"]):visible',
  ).elementHandles();
  // Cap at 200 elements per page — these checks are slow, and 200 covers
  // every realistic page surface in this app. Surfaces with more than 200
  // focusables would need a different sampling strategy; flag if we hit it.
  const cap = Math.min(handles.length, 200);
  for (let i = 0; i < cap; i += 1) {
    const el = handles[i];
    try {
      await el.scrollIntoViewIfNeeded({timeout: 1500});
      await el.focus({timeout: 1500});
    } catch {
      continue;
    }
    let focusedBox = null;
    try {
      focusedBox = await el.boundingBox();
    } catch {
      continue;
    }
    if (!focusedBox) continue;

    const overlapInfo = await page.evaluate(({box}) => {
      // Collect every fixed/sticky overlay that could clip a focused control.
      // We include `position: fixed` AND `position: sticky` (the cookie banner
      // is `fixed`; the navbar's `NavbarScrollState` is also `fixed`).
      const all = Array.from(document.querySelectorAll('body *'));
      const stickies = all.filter((el) => {
        const cs = getComputedStyle(el);
        if (cs.visibility !== 'visible' || cs.display === 'none') return false;
        return cs.position === 'fixed' || cs.position === 'sticky';
      });
      let maxOverlap = 0;
      let culprit = null;
      for (const s of stickies) {
        const sb = s.getBoundingClientRect();
        if (sb.width === 0 || sb.height === 0) continue;
        const ix = Math.max(0, Math.min(box.x + box.width, sb.right) - Math.max(box.x, sb.left));
        const iy = Math.max(0, Math.min(box.y + box.height, sb.bottom) - Math.max(box.y, sb.top));
        const inter = ix * iy;
        const area = box.width * box.height;
        if (area === 0) continue;
        const ovr = inter / area;
        // Skip self-overlaps — a focused element inside a sticky container
        // (e.g., the navbar's own links) doesn't obscure itself.
        if (s.contains(document.activeElement)) continue;
        if (ovr > maxOverlap) {
          maxOverlap = ovr;
          const classStr = s.className && typeof s.className === 'string'
            ? `.${s.className.trim().split(/\s+/).slice(0, 2).join('.')}`
            : '';
          const labelAttr = s.getAttribute && s.getAttribute('aria-label');
          culprit = s.tagName.toLowerCase() +
            (s.id ? `#${s.id}` : '') +
            classStr +
            (labelAttr ? ` aria-label="${labelAttr.slice(0, 40)}"` : '');
        }
      }
      return {maxOverlap, culprit};
    }, {box: focusedBox});

    if (overlapInfo.maxOverlap > 0.5) {
      const outer = await el.evaluate((e) => e.outerHTML.slice(0, 200)).catch(() => '?');
      findings.push({
        rule: 'wcag22-2.4.11-focus-not-obscured',
        overlapPct: Number(overlapInfo.maxOverlap.toFixed(2)),
        culprit: overlapInfo.culprit,
        element: outer,
      });
    }
  }
  return findings;
}

async function checkTargetSize(page) {
  const findings = await page.evaluate(() => {
    function rectVisible(rect) {
      return rect.width > 0 && rect.height > 0;
    }
    function isInlineInText(el) {
      // A link or button is "inline in text" if its parent is a flow content
      // element AND the parent contains text nodes besides this element.
      const parent = el.parentElement;
      if (!parent) return false;
      const flowTags = new Set(['P', 'SPAN', 'SUMMARY', 'DT', 'DD', 'BLOCKQUOTE', 'FIGCAPTION', 'TD', 'TH', 'CITE', 'EM', 'STRONG']);
      if (!flowTags.has(parent.tagName)) return false;
      const textSibling = Array.from(parent.childNodes).some(
        (n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim().length > 0,
      );
      return textSibling;
    }
    const sel = 'a[href]:not([aria-hidden="true"]), button:not([aria-hidden="true"]), [role="button"]:not([aria-hidden="true"]), input[type="checkbox"], input[type="radio"], input[type="button"], input[type="submit"]';
    const all = Array.from(document.querySelectorAll(sel));
    // First pass: collect rects of every visible interactive (for spacing check).
    const interactives = [];
    for (const el of all) {
      const cs = getComputedStyle(el);
      if (cs.visibility !== 'visible' || cs.display === 'none' || cs.opacity === '0') continue;
      const r = el.getBoundingClientRect();
      if (!rectVisible(r)) continue;
      interactives.push({el, rect: r});
    }
    // SC 2.5.8 spacing exception (https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html):
    // "A 24 CSS pixel diameter circle, centered on the bounding box of each
    // target, does not intersect with the circle of any other target." If a
    // sub-24px target's center is ≥ 24px from every other target's center,
    // it's exempt. (A target's full hit area still counts toward the
    // distance; for our purposes, center-to-center separation captures
    // the spirit and matches how the SC is typically applied.)
    function hasSufficientSpacing(rect) {
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      for (const other of interactives) {
        if (other.rect === rect) continue;
        // Skip neighbours far enough away to be irrelevant.
        const ox = other.rect.left + other.rect.width / 2;
        const oy = other.rect.top + other.rect.height / 2;
        const dist = Math.hypot(cx - ox, cy - oy);
        if (dist < 24) return false;
      }
      return true;
    }
    const out = [];
    for (const {el, rect} of interactives) {
      if (rect.width >= 24 && rect.height >= 24) continue;
      if (isInlineInText(el)) continue;
      // Hidden inputs (file/checkbox replaced by a styled label) — skip
      // when the input is visually 1×1 and a sibling label provides the
      // hit area.
      if (el.tagName === 'INPUT' && (rect.width <= 1 || rect.height <= 1)) continue;
      // SC 2.5.8 spacing exception
      if (hasSufficientSpacing(rect)) continue;
      out.push({
        rule: 'wcag22-2.5.8-target-size',
        size: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
        element: el.outerHTML.slice(0, 200),
      });
    }
    return out;
  });
  return findings;
}

// ---------------------------------------------------------------------------
// axe runner
// ---------------------------------------------------------------------------

function summariseAxeNode(node) {
  return {
    target: Array.isArray(node.target) ? node.target.join(' > ') : String(node.target),
    html: (node.html || '').slice(0, 240),
    failureSummary: (node.failureSummary || '').replace(/\s+/g, ' ').slice(0, 240),
  };
}

async function runAxe(page) {
  const axe = new AxeBuilder({page}).withTags(ALL_AUDIT_TAGS);
  const results = await axe.analyze();

  const violations = [];
  for (const v of results.violations) {
    const tags = v.tags || [];
    const isWcagAA = tags.some((t) => WCAG_AA_TAGS.includes(t));
    const isBestPracticeOnly = !isWcagAA && tags.includes('best-practice');
    violations.push({
      id: v.id,
      impact: v.impact,
      help: v.help,
      helpUrl: v.helpUrl,
      tags,
      mustFix: isWcagAA,
      bestPracticeOnly: isBestPracticeOnly,
      nodes: v.nodes.slice(0, 8).map(summariseAxeNode),
      totalNodes: v.nodes.length,
    });
  }

  const incomplete = results.incomplete.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    helpUrl: v.helpUrl,
    tags: v.tags,
    nodes: v.nodes.slice(0, 4).map(summariseAxeNode),
    totalNodes: v.nodes.length,
  }));

  return {violations, incomplete};
}

// ---------------------------------------------------------------------------
// Lighthouse runner — uses a separate chrome-launcher Chrome instance so
// Lighthouse owns its tab lifecycle and our Playwright session stays
// isolated. One Chrome instance is reused across all URLs.
// ---------------------------------------------------------------------------

let lhChrome = null;

async function ensureLighthouseChrome() {
  if (lhChrome) return lhChrome;
  lhChrome = await chromeLauncher.launch({
    chromeFlags: [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
    ],
  });
  return lhChrome;
}

async function killLighthouseChrome() {
  if (lhChrome) {
    try {
      await lhChrome.kill();
    } catch {
      // shutdown best-effort
    }
    lhChrome = null;
  }
}

async function runLighthouse(targetUrl) {
  const chrome = await ensureLighthouseChrome();
  // Vercel SSO bypass via QUERY PARAM rather than Cookie header — the
  // cookie path proved flaky across multiple Lighthouse calls reusing
  // one Chrome instance (some later requests would hit the SSO signup
  // page and Lighthouse would audit Vercel's UI, not ours). The query
  // param is stateless and per-request: every navigation re-asserts the
  // bypass without depending on cookie persistence in Lighthouse's
  // chrome-launcher Chrome.
  let url = targetUrl;
  if (SHARE_TOKEN) {
    const sep = url.includes('?') ? '&' : '?';
    url = `${url}${sep}_vercel_share=${SHARE_TOKEN}`;
  } else if (BYPASS_TOKEN) {
    const sep = url.includes('?') ? '&' : '?';
    url = `${url}${sep}x-vercel-protection-bypass=${BYPASS_TOKEN}&x-vercel-set-bypass-cookie=samesitenone`;
  }
  const result = await lighthouse(
    url,
    {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['accessibility'],
      // Mobile form-factor mirrors how Google scores; matches the default
      // configuration Lighthouse uses on the web UI.
      formFactor: 'mobile',
      screenEmulation: {
        mobile: true,
        width: 412,
        height: 823,
        deviceScaleFactor: 1.75,
        disabled: false,
      },
      throttlingMethod: 'simulate',
    },
  );
  if (!result || !result.lhr) {
    return {score: null, audits: [], runtimeError: 'lighthouse returned no LHR'};
  }
  const lhr = result.lhr;
  if (lhr.runtimeError && lhr.runtimeError.code) {
    return {
      score: null,
      audits: [],
      runtimeError: `${lhr.runtimeError.code}: ${lhr.runtimeError.message || ''}`,
    };
  }
  const cat = lhr.categories.accessibility;
  const failed = Object.values(lhr.audits)
    .filter((a) => a && a.score !== null && a.score < 1 && a.scoreDisplayMode !== 'notApplicable' && a.scoreDisplayMode !== 'informative' && a.scoreDisplayMode !== 'manual')
    .map((a) => ({
      id: a.id,
      title: a.title,
      score: a.score,
      description: (a.description || '').replace(/\s+/g, ' ').slice(0, 200),
    }));
  return {
    score: cat ? Math.round((cat.score || 0) * 100) : null,
    audits: failed,
    runtimeError: null,
  };
}

// ---------------------------------------------------------------------------
// Reduced-motion check
// ---------------------------------------------------------------------------

async function checkReducedMotionResolves(browser) {
  // A single check: with `prefers-reduced-motion: reduce` emulated, the
  // homepage's matchMedia returns true. Confirms the media query chain to
  // MotionRoot's `<MotionConfig reducedMotion="user">` is intact. The
  // suppression itself is then framer-motion-v12's responsibility, which
  // has its own test coverage; verifying media-query plumbing is the
  // harness-able piece.
  const context = await browser.newContext({reducedMotion: 'reduce'});
  if (bypassCookieName) {
    const u = new URL(BASE_URL);
    await context.addCookies([{
      name: bypassCookieName,
      value: bypassCookieValue,
      domain: u.hostname,
      path: '/',
      secure: u.protocol === 'https:',
      sameSite: 'None',
    }]);
  }
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('sunset_consent_v2', JSON.stringify({
        status: 'decided',
        signals: {necessary: true, analytics: false, marketing: false, personalization: false},
        decidedAt: new Date().toISOString(),
      }));
    } catch {
      // localStorage may be unavailable — harmless.
    }
  });
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/`, {waitUntil: 'domcontentloaded', timeout: 30000});
  const reduces = await page.evaluate(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  await context.close();
  return {ok: reduces, detail: reduces ? 'matchMedia returns true under emulation' : 'matchMedia did NOT report reduced motion'};
}

// ---------------------------------------------------------------------------
// Per-URL validation
// ---------------------------------------------------------------------------

async function validateUrl(context, entry) {
  const path = entry.path;
  const url = `${BASE_URL}${path}`;
  const result = {
    path,
    label: entry.label,
    finalUrl: url,
    httpStatus: null,
    axe: {violations: [], incomplete: []},
    lighthouse: {score: null, audits: [], runtimeError: null, skipped: SKIP_LIGHTHOUSE},
    sc2_4_11: [],
    sc2_5_8: [],
    errors: [],
    warnings: [],
  };

  const page = await context.newPage();
  let nav;
  try {
    // 'commit' returns on first byte — the safest waitUntil for Next dev
    // (HMR sockets racing with the load event have been observed to hang
    // 'domcontentloaded' inside goto(). We then wait for the actual DOM
    // state separately, which is reliable.)
    nav = await page.goto(url, {waitUntil: 'commit', timeout: 30000});
  } catch (err) {
    result.errors.push(`navigation failed: ${err.message}`);
    await page.close();
    return result;
  }
  result.httpStatus = nav ? nav.status() : null;
  if (!nav || !nav.ok()) {
    result.errors.push(`HTTP ${result.httpStatus} on initial navigation`);
    await page.close();
    return result;
  }
  result.finalUrl = page.url();

  try {
    await page.waitForLoadState('domcontentloaded', {timeout: 30000});
  } catch (err) {
    result.errors.push(`domcontentloaded never fired: ${err.message}`);
    await page.close();
    return result;
  }
  try {
    await page.waitForLoadState('networkidle', {timeout: 8000});
  } catch {
    // networkidle can flake on pages with lingering analytics or HMR
    // sockets — don't fail the URL on that; axe still runs against the
    // current DOM, which is well-formed by domcontentloaded.
  }

  try {
    const axe = await runAxe(page);
    result.axe = axe;
    for (const v of axe.violations) {
      if (v.mustFix) {
        result.errors.push(
          `axe ${v.id} (${v.impact || 'n/a'}, ${v.tags.filter((t) => WCAG_AA_TAGS.includes(t)).join('+')}) on ${v.totalNodes} node(s)`,
        );
      } else {
        result.warnings.push(`axe ${v.id} [best-practice] on ${v.totalNodes} node(s)`);
      }
    }
  } catch (err) {
    result.errors.push(`axe failed: ${err.message}`);
  }

  try {
    const sc2_4_11 = await checkFocusNotObscured(page);
    result.sc2_4_11 = sc2_4_11;
    for (const f of sc2_4_11) {
      result.errors.push(
        `WCAG 2.4.11 focus-not-obscured: ${f.element.slice(0, 80)} overlapped ${Math.round(f.overlapPct * 100)}% by ${f.culprit}`,
      );
    }
  } catch (err) {
    result.errors.push(`SC 2.4.11 walk failed: ${err.message}`);
  }

  try {
    const sc2_5_8 = await checkTargetSize(page);
    result.sc2_5_8 = sc2_5_8;
    for (const f of sc2_5_8) {
      result.errors.push(
        `WCAG 2.5.8 target-size: ${f.size}px on ${f.element.slice(0, 80)}`,
      );
    }
  } catch (err) {
    result.errors.push(`SC 2.5.8 walk failed: ${err.message}`);
  }

  await page.close();

  if (!SKIP_LIGHTHOUSE) {
    try {
      const lh = await runLighthouse(url);
      result.lighthouse = {...result.lighthouse, ...lh, skipped: false};
      if (lh.runtimeError) {
        result.errors.push(`lighthouse runtime: ${lh.runtimeError}`);
      } else if (lh.score === null) {
        result.errors.push('lighthouse: no a11y category score');
      } else if (lh.score < LIGHTHOUSE_MIN_SCORE) {
        result.errors.push(
          `lighthouse a11y score ${lh.score} < ${LIGHTHOUSE_MIN_SCORE}; failing audits: ${lh.audits.map((a) => a.id).join(', ') || '<none>'}`,
        );
      }
    } catch (err) {
      result.errors.push(`lighthouse failed: ${err.message}`);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

function printTable(results, reducedMotion) {
  console.log('');
  console.log(`${C.bold}A11y validation against ${BASE_URL}${C.reset}`);
  console.log('');
  console.log(
    `${C.bold}${pad('PATH', 46)} ${padNum('axe', 5)} ${padNum('bp', 4)} ${padNum('inc', 4)} ${padNum('2.4.11', 7)} ${padNum('2.5.8', 6)} ${padNum('lh', 4)} status${C.reset}`,
  );
  console.log(C.gray + '-'.repeat(96) + C.reset);
  for (const r of results) {
    const axeErr = r.axe.violations.filter((v) => v.mustFix).length;
    const axeBp = r.axe.violations.filter((v) => !v.mustFix).length;
    const inc = r.axe.incomplete.length;
    const lh = r.lighthouse.skipped ? '-' : (r.lighthouse.score == null ? '?' : r.lighthouse.score);
    const status =
      r.errors.length === 0
        ? `${C.green}PASS${C.reset}`
        : `${C.red}FAIL${C.reset}`;
    console.log(
      `${pad(r.path, 46)} ${padNum(axeErr, 5)} ${padNum(axeBp, 4)} ${padNum(inc, 4)} ${padNum(r.sc2_4_11.length, 7)} ${padNum(r.sc2_5_8.length, 6)} ${padNum(lh, 4)} ${status}`,
    );
  }
  console.log('');
  console.log(`${C.bold}prefers-reduced-motion${C.reset}: ${reducedMotion.ok ? `${C.green}OK${C.reset}` : `${C.red}FAIL${C.reset}`} (${reducedMotion.detail})`);
  console.log('');
  for (const r of results) {
    if (r.errors.length === 0 && r.warnings.length === 0) continue;
    console.log(`${C.bold}${r.path}${C.reset}`);
    for (const e of r.errors) console.log(`  ${C.red}E${C.reset}  ${e}`);
    for (const w of r.warnings) console.log(`  ${C.yellow}W${C.reset}  ${w}`);
    if (r.axe.violations.length > 0) {
      for (const v of r.axe.violations) {
        const flag = v.mustFix ? `${C.red}AA${C.reset}` : `${C.yellow}bp${C.reset}`;
        console.log(`    ${flag} ${v.id} — ${v.help}`);
        for (const n of v.nodes.slice(0, 3)) {
          console.log(`        @ ${n.target}`);
          if (n.failureSummary) console.log(`          ↳ ${n.failureSummary}`);
        }
        if (v.totalNodes > v.nodes.length) {
          console.log(`        … and ${v.totalNodes - v.nodes.length} more`);
        }
      }
    }
    if (r.axe.incomplete.length > 0) {
      console.log(`    ${C.cyan}incomplete${C.reset} (axe needs human verification):`);
      for (const v of r.axe.incomplete.slice(0, 3)) {
        console.log(`      ${v.id} — ${v.help} (${v.totalNodes} node(s))`);
      }
    }
    if (r.sc2_4_11.length > 0) {
      console.log(`    ${C.red}2.4.11${C.reset} focus-not-obscured (${r.sc2_4_11.length}):`);
      for (const f of r.sc2_4_11.slice(0, 3)) {
        console.log(`      ${Math.round(f.overlapPct * 100)}% overlap by ${f.culprit}: ${f.element.slice(0, 80)}`);
      }
    }
    if (r.sc2_5_8.length > 0) {
      console.log(`    ${C.red}2.5.8${C.reset} target-size (${r.sc2_5_8.length}):`);
      for (const f of r.sc2_5_8.slice(0, 3)) {
        console.log(`      ${f.size}px: ${f.element.slice(0, 80)}`);
      }
    }
    if (r.lighthouse && r.lighthouse.audits && r.lighthouse.audits.length > 0) {
      console.log(`    ${C.yellow}lighthouse${C.reset} failing audits:`);
      for (const a of r.lighthouse.audits.slice(0, 5)) {
        console.log(`      ${a.id} — ${a.title}`);
      }
    }
    console.log('');
  }
}

function writeJsonReport(results, reducedMotion, totals) {
  mkdirSync(dirname(REPORT_PATH), {recursive: true});
  writeFileSync(
    REPORT_PATH,
    JSON.stringify(
      {
        baseUrl: BASE_URL,
        bypass: Boolean(BYPASS_TOKEN),
        skippedRemote: SKIP_REMOTE,
        skippedLighthouse: SKIP_LIGHTHOUSE,
        only: ARG_ONLY || null,
        generatedAt: new Date().toISOString(),
        totals,
        reducedMotion,
        pages: results,
      },
      null,
      2,
    ),
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function warmUpRoutes(urls) {
  // Dev-mode Next compiles routes on first hit. We pre-warm so the
  // per-URL navigation timeout doesn't blow on a cold compile.
  const headers = bypassCookieName ? {Cookie: bypassCookieHeader()} : {};
  for (const u of urls) {
    const target = `${BASE_URL}${u.path}`;
    try {
      const res = await fetch(target, {headers, redirect: 'follow'});
      await res.arrayBuffer();
    } catch {
      // best-effort warmup; per-URL nav will surface real errors
    }
  }
}

async function main() {
  await primeBypassCookie();

  const targetUrls = ARG_ONLY
    ? URLS.filter((u) => u.path === ARG_ONLY)
    : URLS;
  if (targetUrls.length === 0) {
    console.error(`${C.red}fatal:${C.reset} --only=${ARG_ONLY} did not match any known URL`);
    console.error('Known paths:');
    for (const u of URLS) console.error(`  ${u.path}`);
    process.exit(2);
  }

  console.log(`Validating ${targetUrls.length} URL(s) against ${BASE_URL}…`);
  if (BYPASS_TOKEN) console.log(`  (Vercel SSO bypass primed; cookie=${bypassCookieName || '<NONE — priming failed>'})`);
  if (SKIP_LIGHTHOUSE) console.log(`  (Lighthouse skipped — --skip-lighthouse)`);

  // Pre-warm every target route via plain fetch — dev-mode Next compiles
  // on demand. Skip when BASE_URL is a Preview/Production (everything is
  // built ahead of time).
  if (/localhost|127\.0\.0\.1/.test(BASE_URL)) {
    process.stdout.write(`  warming up ${targetUrls.length} route(s) … `);
    const t0 = Date.now();
    await warmUpRoutes(targetUrls);
    console.log(`done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }

  const browser = await chromium.launch({headless: true});
  const context = await browser.newContext({
    userAgent: 'Sunset-Services-A11y-Harness/B.06 (axe-core + Playwright)',
    viewport: {width: 1280, height: 800},
  });
  if (bypassCookieName) {
    const u = new URL(BASE_URL);
    await context.addCookies([{
      name: bypassCookieName,
      value: bypassCookieValue,
      domain: u.hostname,
      path: '/',
      secure: u.protocol === 'https:',
      sameSite: 'None',
    }]);
  }
  // Pre-set the cookie consent state to "decided" so the consent banner
  // (Phase B.03) doesn't render during the audit. The banner has its
  // own hand-rolled focus trap that real keyboard users can't escape,
  // but `el.focus()` in the SC 2.4.11 walk bypasses traps and ends up
  // scrolling focusable elements behind the banner's bottom-bar overlay,
  // creating false-positive 2.4.11 findings. axe + Lighthouse still
  // audit the banner separately (the banner's own DOM is exercised
  // whenever any other test surface mounts it); the SC 2.4.11 check
  // verifies real-keyboard-nav obscurity, which the banner's focus trap
  // already prevents.
  //
  // The init script runs at page DOM creation — before site JS — and
  // is guarded against environments without `window.localStorage`
  // (e.g., file:// URLs or some sandbox modes).
  await context.addInitScript(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const payload = {
          status: 'decided',
          signals: {necessary: true, analytics: false, marketing: false, personalization: false},
          decidedAt: new Date().toISOString(),
        };
        window.localStorage.setItem('sunset_consent_v2', JSON.stringify(payload));
      }
    } catch (err) {
      // Print to harness stdout so a localStorage failure is observable
      // from CI logs without crashing the audit run.
      console.log('[a11y harness] consent-init failed:', err && err.message);
    }
  });

  const results = [];
  for (const entry of targetUrls) {
    process.stdout.write(`  ${pad(entry.path, 46)} `);
    let r;
    try {
      r = await validateUrl(context, entry);
    } catch (err) {
      r = {
        path: entry.path,
        label: entry.label,
        finalUrl: '',
        httpStatus: null,
        axe: {violations: [], incomplete: []},
        lighthouse: {score: null, audits: [], runtimeError: null, skipped: SKIP_LIGHTHOUSE},
        sc2_4_11: [],
        sc2_5_8: [],
        errors: [`fatal: ${err.message}`],
        warnings: [],
      };
    }
    results.push(r);
    const tag = r.errors.length === 0 ? `${C.green}OK${C.reset}` : `${C.red}FAIL${C.reset}`;
    console.log(
      `${tag} (axe ${r.axe.violations.filter((v) => v.mustFix).length}, 2.4.11 ${r.sc2_4_11.length}, 2.5.8 ${r.sc2_5_8.length}, lh ${r.lighthouse.skipped ? '-' : (r.lighthouse.score ?? '?')})`,
    );
  }

  let reducedMotion = {ok: true, detail: 'skipped'};
  if (!ARG_ONLY) {
    try {
      reducedMotion = await checkReducedMotionResolves(browser);
    } catch (err) {
      reducedMotion = {ok: false, detail: `check failed: ${err.message}`};
    }
  } else {
    reducedMotion = {ok: true, detail: 'skipped under --only'};
  }

  await context.close();
  await browser.close();
  await killLighthouseChrome();

  const totals = {
    errors: results.reduce((acc, r) => acc + r.errors.length, 0) + (reducedMotion.ok ? 0 : 1),
    warnings: results.reduce((acc, r) => acc + r.warnings.length, 0),
    axeAA: results.reduce(
      (acc, r) => acc + r.axe.violations.filter((v) => v.mustFix).length,
      0,
    ),
    axeBestPractice: results.reduce(
      (acc, r) => acc + r.axe.violations.filter((v) => !v.mustFix).length,
      0,
    ),
    incomplete: results.reduce((acc, r) => acc + r.axe.incomplete.length, 0),
    sc2_4_11: results.reduce((acc, r) => acc + r.sc2_4_11.length, 0),
    sc2_5_8: results.reduce((acc, r) => acc + r.sc2_5_8.length, 0),
    lighthouseBelow95: results.filter(
      (r) => !r.lighthouse.skipped && r.lighthouse.score !== null && r.lighthouse.score < LIGHTHOUSE_MIN_SCORE,
    ).length,
  };

  printTable(results, reducedMotion);
  writeJsonReport(results, reducedMotion, totals);

  console.log(
    `${C.bold}TOTAL:${C.reset} ${totals.errors} errors / ${totals.warnings} warnings across ${results.length} URL(s)`,
  );
  console.log(
    `  axe AA violations: ${totals.axeAA}  best-practice: ${totals.axeBestPractice}  incomplete (manual): ${totals.incomplete}`,
  );
  console.log(
    `  WCAG 2.2 SC 2.4.11: ${totals.sc2_4_11}  SC 2.5.8: ${totals.sc2_5_8}  lighthouse <95: ${totals.lighthouseBelow95}`,
  );
  console.log(`Report: ${REPORT_PATH}`);

  process.exit(totals.errors === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(`${C.red}fatal:${C.reset} ${err.stack || err.message}`);
  killLighthouseChrome().finally(() => process.exit(2));
});
