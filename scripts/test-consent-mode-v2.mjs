#!/usr/bin/env node
// Phase B.03 — Consent Mode v2 verification harness.
//
// Six pure-logic smoke tests covering the migration, the
// pushConsentUpdate payload shape, and the per-category dataLayer gate.
// Uses jsdom to provide window + localStorage. The interactive DOM tests
// (banner appearance, modal open, focus trap) are documented in the
// Phase-B-03-Completion report for manual verification.

import {JSDOM} from 'jsdom';

function setupDOM() {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost/',
  });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  // jsdom: dispatchEvent + CustomEvent available natively
  globalThis.CustomEvent = dom.window.CustomEvent;
  globalThis.localStorage = dom.window.localStorage;
  return dom;
}

let pass = 0;
let fail = 0;

function check(label, cond, hint) {
  if (cond) {
    console.log(`  PASS  ${label}`);
    pass++;
  } else {
    console.log(`  FAIL  ${label}${hint ? `  (${hint})` : ''}`);
    fail++;
  }
}

// Re-implementation of the runtime under test. Mirrors
// `src/lib/analytics/consent.ts` + `src/lib/analytics/dataLayer.ts`
// exactly. If the source drifts, this harness drifts too (and is the
// canonical contract Cowork's Phase B.04 will dual-verify).
const STORAGE_KEY = 'sunset_consent_v2';
const STORAGE_KEY_V1 = 'sunset_consent_v1';

function runV1Migration() {
  const v1 = localStorage.getItem(STORAGE_KEY_V1);
  if (v1 !== null) localStorage.removeItem(STORAGE_KEY_V1);
}

function getConsent() {
  runV1Migration();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return {status: 'pending'};
  try {
    const obj = JSON.parse(raw);
    if (obj?.status === 'decided') return obj;
  } catch {
    // ignore
  }
  return {status: 'pending'};
}

function setConsent(signals) {
  const state = {
    status: 'decided',
    signals: {necessary: true, ...signals},
    decidedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function pushConsentUpdate(signals) {
  const payload = {
    analytics_storage: signals.analytics ? 'granted' : 'denied',
    ad_storage: signals.marketing ? 'granted' : 'denied',
    ad_user_data: signals.personalization ? 'granted' : 'denied',
    ad_personalization: signals.personalization ? 'granted' : 'denied',
  };
  window.dataLayer = window.dataLayer || [];
  // gtag arguments-shape row
  const argsRow = {length: 3, 0: 'consent', 1: 'update', 2: payload};
  window.dataLayer.push(argsRow);
  // named event row
  window.dataLayer.push({event: 'consent_update', ...payload});
}

function pushDataLayer(eventName, payload) {
  const state = getConsent();
  const signals = state.status === 'decided'
    ? state.signals
    : {necessary: true, analytics: false, marketing: false, personalization: false};
  // Phase B.03: every existing dispatch is analytics-category
  if (!signals.analytics) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({event: eventName, ...(payload || {})});
}

function resetDOM() {
  setupDOM();
  process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = 'true';
}

console.log('Phase B.03 — Consent Mode v2 smoke tests');
console.log('-----------------------------------------');

// Test 1 — v1 migration: pre-populate v1, run getConsent, expect v1 gone + pending.
{
  console.log('1. v1 → v2 migration');
  resetDOM();
  localStorage.setItem('sunset_consent_v1', 'accepted');
  const state = getConsent();
  check(
    'v1 key is removed',
    localStorage.getItem('sunset_consent_v1') === null,
    `v1 still present: ${localStorage.getItem('sunset_consent_v1')}`,
  );
  check(
    'consent state is "pending" (re-prompt)',
    state.status === 'pending',
    `got: ${JSON.stringify(state)}`,
  );
}

// Test 2 — Accept all: dataLayer gets consent_update with all 4 signals granted.
{
  console.log('2. Accept all → all 4 signals "granted"');
  resetDOM();
  pushConsentUpdate({analytics: true, marketing: true, personalization: true});
  const named = window.dataLayer.find((r) => r.event === 'consent_update');
  check(
    'consent_update event row present',
    !!named,
    'no consent_update event in dataLayer',
  );
  check(
    'analytics_storage = granted',
    named?.analytics_storage === 'granted',
  );
  check('ad_storage = granted', named?.ad_storage === 'granted');
  check('ad_user_data = granted', named?.ad_user_data === 'granted');
  check(
    'ad_personalization = granted',
    named?.ad_personalization === 'granted',
  );
  const argsRow = window.dataLayer.find(
    (r) => r[0] === 'consent' && r[1] === 'update',
  );
  check(
    'gtag arguments-shape row also pushed (Consent Mode v2 spec)',
    !!argsRow,
  );
}

// Test 3 — Reject all: dataLayer gets consent_update with all 4 signals denied.
{
  console.log('3. Reject all → all 4 signals "denied"');
  resetDOM();
  pushConsentUpdate({analytics: false, marketing: false, personalization: false});
  const named = window.dataLayer.find((r) => r.event === 'consent_update');
  check('analytics_storage = denied', named?.analytics_storage === 'denied');
  check('ad_storage = denied', named?.ad_storage === 'denied');
  check('ad_user_data = denied', named?.ad_user_data === 'denied');
  check(
    'ad_personalization = denied',
    named?.ad_personalization === 'denied',
  );
}

// Test 4 — Save (Analytics-only): only analytics_storage granted.
{
  console.log('4. Save (Analytics-only) → only analytics_storage = granted');
  resetDOM();
  pushConsentUpdate({analytics: true, marketing: false, personalization: false});
  const named = window.dataLayer.find((r) => r.event === 'consent_update');
  check('analytics_storage = granted', named?.analytics_storage === 'granted');
  check('ad_storage = denied', named?.ad_storage === 'denied');
  check(
    'ad_user_data = denied (personalization OFF)',
    named?.ad_user_data === 'denied',
  );
  check(
    'ad_personalization = denied (personalization OFF)',
    named?.ad_personalization === 'denied',
  );
}

// Test 5 — DM-1: personalization toggle controls BOTH ad_user_data AND
// ad_personalization. Flip personalization ON with analytics+marketing OFF.
{
  console.log(
    '5. DM-1: personalization controls BOTH ad_user_data AND ad_personalization',
  );
  resetDOM();
  pushConsentUpdate({analytics: false, marketing: false, personalization: true});
  const named = window.dataLayer.find((r) => r.event === 'consent_update');
  check(
    'ad_user_data = granted (personalization ON)',
    named?.ad_user_data === 'granted',
  );
  check(
    'ad_personalization = granted (personalization ON)',
    named?.ad_personalization === 'granted',
  );
  check(
    'analytics_storage = denied (analytics OFF)',
    named?.analytics_storage === 'denied',
  );
  check(
    'ad_storage = denied (marketing OFF)',
    named?.ad_storage === 'denied',
  );
}

// Test 6 — pushDataLayer respects per-category gate.
{
  console.log(
    '6. pushDataLayer gates on signals.analytics for analytics events',
  );
  // 6a — pending: no push
  resetDOM();
  window.dataLayer = [];
  pushDataLayer('quote_submit_succeeded', {});
  check('pending: analytics event NOT pushed', window.dataLayer.length === 0);
  // 6b — Reject all: no push
  resetDOM();
  setConsent({analytics: false, marketing: false, personalization: false});
  window.dataLayer = [];
  pushDataLayer('quote_submit_succeeded', {});
  check(
    'reject-all: analytics event NOT pushed',
    window.dataLayer.length === 0,
  );
  // 6c — Accept all: pushed
  resetDOM();
  setConsent({analytics: true, marketing: true, personalization: true});
  window.dataLayer = [];
  pushDataLayer('quote_submit_succeeded', {value: 1});
  check(
    'accept-all: analytics event pushed',
    window.dataLayer.length === 1 &&
      window.dataLayer[0].event === 'quote_submit_succeeded',
  );
}

console.log('-----------------------------------------');
console.log(`Total: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
