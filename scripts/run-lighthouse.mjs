#!/usr/bin/env node
/**
 * Phase M.02 — Lighthouse performance harness.
 *
 * Mirrors the B.04 / B.05 / B.06 env-var + exit-code + JSON-sidecar contract;
 * runs Lighthouse against a curated sample of routes across one or both
 * form factors (mobile / desktop) and reports the four category scores
 * (Performance / Accessibility / Best Practices / SEO).
 *
 * Reuses `chrome-launcher` + `lighthouse` already pulled in for B.06's
 * a11y harness — no new dependencies.
 *
 * USAGE
 *   node scripts/run-lighthouse.mjs                                   # localhost:3000, both form factors
 *   BASE_URL=https://preview.vercel.app node scripts/run-lighthouse.mjs
 *   BASE_URL=https://preview.vercel.app VERCEL_SHARE_TOKEN=xyz node scripts/run-lighthouse.mjs
 *   node scripts/run-lighthouse.mjs --form-factor=mobile              # mobile only
 *   node scripts/run-lighthouse.mjs --form-factor=desktop             # desktop only
 *   node scripts/run-lighthouse.mjs --only=/                          # one URL only
 *   node scripts/run-lighthouse.mjs --categories=performance          # one category only
 *   node scripts/run-lighthouse.mjs --min-score=90                    # custom score floor
 *
 * EXIT CODE
 *   0  Every measured (URL, form-factor, category) ≥ MIN_SCORE.
 *   1  Any score below MIN_SCORE.
 *   2  Fatal harness error (Chrome failed to launch, etc).
 *
 * OUTPUTS
 *   stdout                                          colored per-URL × form-factor table
 *   scripts/.lighthouse-report.json                 full machine report (gitignored)
 *
 * The committed snapshot of the table for the current phase lives in
 * `src/_project-state/Phase-M-02-Completion.md`.
 *
 * Phase M.02 sample (D2 floor):
 *   - /                                          (home — full-bleed hero, worst Phase 1.07 case)
 *   - /landscape/                                (division landing)
 *   - /landscape/landscape-design/               (service detail)
 *   - /service-areas/aurora/                     (city detail; reused from B.06)
 *   - /blog/dupage-patio-cost-2026/              (blog post)
 *   - /thank-you/?firstName=Test                 (Calendly iframe — heavy third-party)
 *   - /qa/                                       (Q&A page — new template per M.01e)
 */

import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const BYPASS_TOKEN = process.env.BYPASS_TOKEN || '';
// MCP-issued share token wins over BYPASS_TOKEN. Same `_vercel_jwt` cookie
// landing point; different priming query param. Stateless per-request via
// query param (B.06's lesson — cookie-based bypass flaked across many
// Lighthouse calls reusing one Chrome instance).
const SHARE_TOKEN = process.env.VERCEL_SHARE_TOKEN || '';

const REPORT_PATH = resolve('scripts/.lighthouse-report.json');

// CLI flag parsing
const ARG_ONLY = (process.argv.find((a) => a.startsWith('--only=')) || '').slice('--only='.length);
const ARG_FORM = (process.argv.find((a) => a.startsWith('--form-factor=')) || '').slice('--form-factor='.length);
const ARG_CATS = (process.argv.find((a) => a.startsWith('--categories=')) || '').slice('--categories='.length);
const ARG_MIN = Number((process.argv.find((a) => a.startsWith('--min-score=')) || '').slice('--min-score='.length)) || 95;
const MIN_SCORE = ARG_MIN;
const FORM_FACTORS = ARG_FORM
  ? [ARG_FORM]
  : ['mobile', 'desktop'];
const CATEGORIES = ARG_CATS
  ? ARG_CATS.split(',').map((c) => c.trim())
  : ['performance', 'accessibility', 'best-practices', 'seo'];

// ---------------------------------------------------------------------------
// URL sample — D2 floor (7 routes) covering every required template shape.
//
// Per-route shapes:
//   home             — full-bleed hero (worst Phase 1.07 mobile-Perf case)
//   division         — landscape (largest division per locations.ts)
//   service-detail   — landscape/landscape-design (representative)
//   city             — service-areas/aurora (reused from B.06)
//   blog             — known slug from B.06 a11y sample
//   third-party      — /thank-you/ with Calendly iframe
//   qa               — M.01e new template, never profiled
//
// Add more here only if a representative template shape isn't covered.
// ---------------------------------------------------------------------------

const URLS = [
  {path: '/', label: 'home'},
  {path: '/landscape/', label: 'division-landing'},
  {path: '/landscape/landscape-design/', label: 'service-detail'},
  {path: '/service-areas/aurora/', label: 'city-detail'},
  {path: '/blog/dupage-patio-cost-2026/', label: 'blog-post'},
  {path: '/thank-you/?firstName=Test', label: 'thank-you-calendly'},
  {path: '/qa/', label: 'qa-page'},
];

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

function colorForScore(score) {
  if (score == null) return C.gray;
  if (score >= 95) return C.green;
  if (score >= 90) return C.cyan;
  if (score >= 80) return C.yellow;
  return C.red;
}

// ---------------------------------------------------------------------------
// Lighthouse runner — one Chrome instance reused across all measurements.
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

// Lighthouse defaults per https://developer.chrome.com/docs/lighthouse/performance/lighthouse-performance/
// Mobile: simulated 4G + 4x CPU throttle, 412x823 viewport at 1.75 DPR.
// Desktop: no throttle, 1350x940 viewport at 1.0 DPR.
function lhConfigFor(formFactor) {
  if (formFactor === 'desktop') {
    return {
      formFactor: 'desktop',
      screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false,
      },
      throttlingMethod: 'simulate',
      throttling: {
        rttMs: 40,
        throughputKbps: 10 * 1024,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0,
      },
    };
  }
  // mobile (default) — Lighthouse's documented mobile preset
  return {
    formFactor: 'mobile',
    screenEmulation: {
      mobile: true,
      width: 412,
      height: 823,
      deviceScaleFactor: 1.75,
      disabled: false,
    },
    throttlingMethod: 'simulate',
  };
}

// Per-measurement wall-clock timeout. Lighthouse's internal maxWaitForLoad
// is 45s by default, but on simulated-throttling runs against cold Vercel
// edges we've seen single measurements hang past 10 minutes. The wall-clock
// guard lets one bad URL fail loud instead of stalling the whole sweep.
const PER_MEASUREMENT_TIMEOUT_MS = 180_000;

async function runLighthouse(targetUrl, formFactor) {
  const chrome = await ensureLighthouseChrome();
  // Vercel SSO bypass via QUERY PARAM (B.06's lesson — cookie-based bypass
  // flaked across many Lighthouse calls reusing one Chrome instance).
  // Stateless per-request: every navigation re-asserts the bypass without
  // depending on cookie persistence in Lighthouse's chrome-launcher Chrome.
  let url = targetUrl;
  if (SHARE_TOKEN) {
    const sep = url.includes('?') ? '&' : '?';
    url = `${url}${sep}_vercel_share=${SHARE_TOKEN}`;
  } else if (BYPASS_TOKEN) {
    const sep = url.includes('?') ? '&' : '?';
    url = `${url}${sep}x-vercel-protection-bypass=${BYPASS_TOKEN}&x-vercel-set-bypass-cookie=samesitenone`;
  }

  const cfg = lhConfigFor(formFactor);
  const lhPromise = lighthouse(
    url,
    {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: CATEGORIES,
      ...cfg,
    },
  );
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(`per-measurement timeout (${PER_MEASUREMENT_TIMEOUT_MS / 1000}s)`)),
      PER_MEASUREMENT_TIMEOUT_MS,
    );
  });
  let result;
  try {
    result = await Promise.race([lhPromise, timeoutPromise]);
  } catch (err) {
    // If the measurement timed out, the chrome instance may be in a wedged
    // state — kill it so the next measurement gets a fresh launch.
    if (err && /timeout/i.test(err.message)) {
      await killLighthouseChrome();
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!result || !result.lhr) {
    return {scores: {}, audits: {}, runtimeError: 'lighthouse returned no LHR', metrics: {}};
  }
  const lhr = result.lhr;
  if (lhr.runtimeError && lhr.runtimeError.code) {
    return {
      scores: {},
      audits: {},
      runtimeError: `${lhr.runtimeError.code}: ${lhr.runtimeError.message || ''}`,
      metrics: {},
    };
  }

  const scores = {};
  for (const c of CATEGORIES) {
    const cat = lhr.categories[c];
    scores[c] = cat ? Math.round((cat.score || 0) * 100) : null;
  }

  // Top failing audits per category — useful for diagnosis.
  const audits = {};
  for (const c of CATEGORIES) {
    const cat = lhr.categories[c];
    if (!cat) continue;
    const failing = (cat.auditRefs || [])
      .map((ref) => lhr.audits[ref.id])
      .filter(
        (a) =>
          a &&
          a.score !== null &&
          a.score < 0.9 &&
          a.scoreDisplayMode !== 'notApplicable' &&
          a.scoreDisplayMode !== 'informative' &&
          a.scoreDisplayMode !== 'manual',
      )
      .sort((a, b) => (a.score || 0) - (b.score || 0))
      .slice(0, 8)
      .map((a) => ({
        id: a.id,
        title: a.title,
        score: a.score,
        displayValue: a.displayValue || null,
      }));
    audits[c] = failing;
  }

  // Core Web Vitals + supporting metrics — surface them so the diagnosis
  // table can spot LCP-bound pages from CPU-bound pages at a glance.
  const metrics = {};
  for (const m of ['first-contentful-paint', 'largest-contentful-paint', 'speed-index', 'total-blocking-time', 'cumulative-layout-shift', 'interactive']) {
    const a = lhr.audits[m];
    if (a) {
      metrics[m] = {
        score: a.score,
        numericValue: a.numericValue,
        displayValue: a.displayValue,
      };
    }
  }

  return {scores, audits, runtimeError: null, metrics};
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

function printTable(results) {
  console.log('');
  console.log(`${C.bold}Lighthouse measurement against ${BASE_URL}${C.reset}`);
  console.log(`form-factor: ${FORM_FACTORS.join(' + ')} | categories: ${CATEGORIES.join(', ')} | min-score: ${MIN_SCORE}`);
  console.log('');

  const catHeads = CATEGORIES.map((c) => padNum(catShort(c), 5)).join(' ');
  console.log(
    `${C.bold}${pad('URL', 44)} ${pad('FF', 4)} ${catHeads} ${pad('LCP', 7)} ${pad('TBT', 7)} ${pad('CLS', 6)} status${C.reset}`,
  );
  console.log(C.gray + '-'.repeat(90 + CATEGORIES.length * 6) + C.reset);

  for (const r of results) {
    const catCells = CATEGORIES.map((c) => {
      const sc = r.scores[c];
      const col = colorForScore(sc);
      return `${col}${padNum(sc == null ? '?' : sc, 5)}${C.reset}`;
    }).join(' ');
    const lcp = r.metrics['largest-contentful-paint']?.displayValue || '-';
    const tbt = r.metrics['total-blocking-time']?.displayValue || '-';
    const cls = r.metrics['cumulative-layout-shift']?.displayValue || '-';
    const status = r.belowMin === 0
      ? `${C.green}PASS${C.reset}`
      : `${C.red}FAIL${C.reset}(${r.belowMin})`;
    console.log(
      `${pad(r.path, 44)} ${pad(r.formFactor, 4)} ${catCells} ${pad(lcp, 7)} ${pad(tbt, 7)} ${pad(cls, 6)} ${status}`,
    );
  }

  console.log('');
  // Per-URL failing-audit detail blocks
  for (const r of results) {
    if (r.runtimeError) {
      console.log(`${C.red}runtime error on ${r.path} (${r.formFactor}):${C.reset} ${r.runtimeError}`);
      console.log('');
      continue;
    }
    if (r.belowMin === 0) continue;
    console.log(`${C.bold}${r.path}${C.reset} (${r.formFactor})`);
    for (const c of CATEGORIES) {
      const sc = r.scores[c];
      if (sc == null || sc >= MIN_SCORE) continue;
      console.log(`  ${colorForScore(sc)}${c}=${sc}${C.reset}`);
      const failing = r.audits[c] || [];
      for (const a of failing.slice(0, 5)) {
        const dv = a.displayValue ? ` (${a.displayValue})` : '';
        console.log(`    - ${a.id} — ${a.title}${dv}`);
      }
    }
    console.log('');
  }
}

function catShort(c) {
  // four-letter abbreviations for the four standard categories
  return ({performance: 'perf', accessibility: 'a11y', 'best-practices': 'bp', seo: 'seo'})[c] || c.slice(0, 5);
}

function writeJsonReport(results, totals) {
  mkdirSync(dirname(REPORT_PATH), {recursive: true});
  writeFileSync(
    REPORT_PATH,
    JSON.stringify(
      {
        baseUrl: BASE_URL,
        bypass: Boolean(SHARE_TOKEN || BYPASS_TOKEN),
        formFactors: FORM_FACTORS,
        categories: CATEGORIES,
        minScore: MIN_SCORE,
        only: ARG_ONLY || null,
        generatedAt: new Date().toISOString(),
        totals,
        results,
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
  const targetUrls = ARG_ONLY
    ? URLS.filter((u) => u.path === ARG_ONLY)
    : URLS;
  if (targetUrls.length === 0) {
    console.error(`${C.red}fatal:${C.reset} --only=${ARG_ONLY} did not match any URL in the sample`);
    console.error('Known paths:');
    for (const u of URLS) console.error(`  ${u.path}`);
    process.exit(2);
  }

  console.log(`Measuring ${targetUrls.length} URL(s) × ${FORM_FACTORS.length} form-factor(s) against ${BASE_URL}…`);
  if (SHARE_TOKEN) console.log(`  (Vercel share token via _vercel_share=… query param)`);
  else if (BYPASS_TOKEN) console.log(`  (Vercel automation bypass via x-vercel-protection-bypass)`);

  const results = [];
  for (const entry of targetUrls) {
    for (const ff of FORM_FACTORS) {
      const url = `${BASE_URL}${entry.path}`;
      process.stdout.write(`  ${pad(entry.path, 44)} ${pad(ff, 8)} `);
      let r;
      try {
        const lh = await runLighthouse(url, ff);
        const belowMin = CATEGORIES.filter((c) => lh.scores[c] !== null && lh.scores[c] < MIN_SCORE).length;
        r = {
          path: entry.path,
          label: entry.label,
          finalUrl: url,
          formFactor: ff,
          scores: lh.scores,
          audits: lh.audits,
          metrics: lh.metrics,
          runtimeError: lh.runtimeError,
          belowMin,
        };
      } catch (err) {
        r = {
          path: entry.path,
          label: entry.label,
          finalUrl: url,
          formFactor: ff,
          scores: {},
          audits: {},
          metrics: {},
          runtimeError: `fatal: ${err.message}`,
          belowMin: CATEGORIES.length,
        };
      }
      results.push(r);
      const tag = r.belowMin === 0
        ? `${C.green}OK${C.reset}`
        : `${C.red}FAIL${C.reset}`;
      const scoreStr = CATEGORIES.map((c) => {
        const sc = r.scores[c];
        return `${catShort(c)}=${sc == null ? '?' : sc}`;
      }).join(' ');
      console.log(`${tag} ${scoreStr}`);
    }
  }

  await killLighthouseChrome();

  const totals = {
    measured: results.length,
    belowMinCells: results.reduce((acc, r) => acc + r.belowMin, 0),
    fail: results.filter((r) => r.belowMin > 0 || r.runtimeError).length,
  };

  printTable(results);
  writeJsonReport(results, totals);

  console.log(
    `${C.bold}TOTAL:${C.reset} ${totals.belowMinCells} score cell(s) below ${MIN_SCORE} across ${totals.measured} measurement(s) (${totals.fail} URL × form-factor combinations failed)`,
  );
  console.log(`Report: ${REPORT_PATH}`);

  process.exit(totals.belowMinCells === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(`${C.red}fatal:${C.reset} ${err.stack || err.message}`);
  killLighthouseChrome().finally(() => process.exit(2));
});
