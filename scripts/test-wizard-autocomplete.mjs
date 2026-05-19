#!/usr/bin/env node
/**
 * Phase B.10 — Verification harness for the Google Places autocomplete on
 * quote wizard Step 4 (`src/components/wizard/WizardStep4Contact.tsx` +
 * `src/lib/google/placesAutocomplete.ts`).
 *
 * Six tests (one server boot — the helper module's hook supports a
 * `window.__SUNSET_PLACES_KEY_OVERRIDE__` test override that lets T6
 * exercise the disabled branch without a second `next build`):
 *
 *   T1  loading → ready transition on Step-4 mount
 *   T2  happy-path 4-field fill from a synthetic Aurora, IL place result
 *   T3  partial fill: missing postal_code preserves manual zip value
 *   T4  `sunset:wizard-event` CustomEvent captured with the right detail
 *   T5  manual entry without place select still works + Next stays enabled
 *   T6  disabled branch via test-override: `data-autocomplete-state="disabled"`,
 *       no helper text, no console errors
 *
 * The real Maps JS API is never called — the harness pre-seeds
 * `window.google.maps.places.Autocomplete` via Playwright's
 * `addInitScript`, and the hook's already-loaded short-circuit picks it
 * up. Zero GCP quota burn.
 *
 * USAGE
 *   npm run build && node scripts/test-wizard-autocomplete.mjs
 *   BASE_URL=https://<preview>.vercel.app node scripts/test-wizard-autocomplete.mjs
 *
 * ENV CONTRACT (same as B.04/B.05/B.06/B.07/B.08/B.09)
 *   BASE_URL              default http://127.0.0.1:3076 (harness boots its own server)
 *   BYPASS_TOKEN          Vercel SSO bypass for Preview (legacy bypass-token flow)
 *   VERCEL_SHARE_TOKEN    Vercel MCP share token (B.07 addition)
 *   SKIP_REMOTE           reserved (parity with prior harnesses)
 *
 * EXIT
 *   0  all tests passed
 *   1  one or more assertion failed
 *   2  harness crashed
 */

import {spawn} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';

const HOST = '127.0.0.1';
const PORT = 3076;
const ENV_BASE_URL = process.env.BASE_URL ? process.env.BASE_URL.replace(/\/$/, '') : null;
const BASE_URL = ENV_BASE_URL || `http://${HOST}:${PORT}`;
const BYPASS_TOKEN = process.env.BYPASS_TOKEN || '';
const SHARE_TOKEN = process.env.VERCEL_SHARE_TOKEN || '';

const results = [];
function record(name, pass, detail) {
  results.push({name, pass, detail});
  console.log(`${pass ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
}

function loadEnvFromFile(path) {
  const env = {};
  try {
    const text = readFileSync(path, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) env[m[1]] = m[2];
    }
  } catch {
    // fine — caller provides what they need
  }
  return env;
}

async function waitForServer(url, timeoutMs = 90_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(url, {method: 'GET'});
      if (r.status > 0) return true;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server at ${url} did not become ready within ${timeoutMs}ms`);
}

async function startLocalServer() {
  const env = {
    ...process.env,
    ...loadEnvFromFile('.env.local'),
    PORT: String(PORT),
  };

  const {createRequire} = await import('node:module');
  const requireFromCwd = createRequire(`${process.cwd()}/package.json`);
  const nextPkgPath = requireFromCwd.resolve('next/package.json');
  const nextBin = nextPkgPath.replace(/package\.json$/, 'dist/bin/next');
  const proc = spawn('node', [nextBin, 'start', '-p', String(PORT)], {
    env,
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stderrBuf = '';
  proc.stderr.on('data', (d) => {
    stderrBuf += String(d);
  });
  proc.stdout.on('data', () => {
    // drain so the pipe doesn't fill
  });
  try {
    await waitForServer(`http://${HOST}:${PORT}/request-quote`, 90_000);
  } catch (e) {
    proc.kill('SIGTERM');
    throw new Error(`${e.message}\n--- server stderr ---\n${stderrBuf.slice(-2000)}`);
  }
  return {
    proc,
    get stderr() {
      return stderrBuf;
    },
  };
}

async function stopLocalServer(server) {
  if (!server || !server.proc) return;
  return new Promise((resolve) => {
    server.proc.once('exit', () => resolve());
    server.proc.kill('SIGTERM');
    setTimeout(() => {
      try {
        server.proc.kill('SIGKILL');
      } catch {}
      resolve();
    }, 5000);
  });
}

/* ----------------------- Vercel SSO bypass cookie ----------------------- */
let bypassCookieName = '';
let bypassCookieValue = '';

async function primeBypassCookie() {
  if (!ENV_BASE_URL) return;
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

/* ----------------------- Mock + analytics init script ----------------------- */
// Shared init script seeded BEFORE the page loads. It sets up:
//   1. `window.google.maps.places.Autocomplete` mock constructor (the
//      hook's already-loaded short-circuit picks this up, so the real
//      Maps JS API is never called).
//   2. `window.__autocompleteSpy.triggerPlaceChanged(placeResult)` to
//      fire synthetic place_changed events from the test runner.
//   3. `window.__autocompleteSpy.events[]` capturing every
//      `sunset:wizard-event` CustomEvent.
//   4. Optional `window.__SUNSET_PLACES_KEY_OVERRIDE__` (set by T6 only).
function buildInitScript({forceDisabled = false} = {}) {
  // Stringified to ship via addInitScript. Keep self-contained (no closures).
  const body = `
    (function () {
      ${forceDisabled ? 'window.__SUNSET_PLACES_KEY_OVERRIDE__ = "";' : ''}

      // Pre-seed localStorage so the WizardShell's autosave-load offers a
      // "Resume" toast on mount — the harness clicks Resume + Next to land
      // at Step 4. Without this, deep-linking to ?step=4 deflects to Step 1
      // (WizardShell's effectiveStep memo blocks unfilled step1.audience).
      try {
        window.localStorage.setItem(
          'sunset_wizard_progress_v1',
          JSON.stringify({
            step1: {audience: 'residential'},
            step2: {
              selectedSlugs: ['lawn-care'],
              primarySlug: 'lawn-care',
              otherText: '',
            },
            step3: {
              projectType: 'maintenance',
              timeline: 'flex',
              budget: 'unsure',
            },
            savedAt: Date.now(),
          }),
        );
      } catch (e) {
        // localStorage can fail in incognito-ish modes — let the test fail
        // visibly so we know.
      }

      const eventLog = [];
      const listeners = new Map();
      let lastPlace = null;

      function MockAutocomplete(input, options) {
        this._input = input;
        this._options = options;
        if (!window.__autocompleteSpy) {
          window.__autocompleteSpy = {};
        }
        window.__autocompleteSpy.input = input;
        window.__autocompleteSpy.options = options;
        window.__autocompleteSpy.constructorCalled = true;
      }
      MockAutocomplete.prototype.addListener = function (eventName, cb) {
        if (!listeners.has(eventName)) listeners.set(eventName, []);
        listeners.get(eventName).push(cb);
        return { remove: function () {} };
      };
      MockAutocomplete.prototype.getPlace = function () {
        return lastPlace;
      };

      window.google = window.google || {};
      window.google.maps = window.google.maps || {};
      window.google.maps.places = window.google.maps.places || {};
      window.google.maps.places.Autocomplete = MockAutocomplete;
      window.google.maps.event = window.google.maps.event || {
        clearInstanceListeners: function () {},
      };

      // Spy: lets the test runner fire synthetic place_changed events.
      window.__autocompleteSpy = window.__autocompleteSpy || {};
      window.__autocompleteSpy.events = eventLog;
      window.__autocompleteSpy.triggerPlaceChanged = function (place) {
        lastPlace = place;
        const cbs = listeners.get('place_changed') || [];
        cbs.forEach(function (cb) { cb(); });
      };

      document.addEventListener('sunset:wizard-event', function (e) {
        // Detail can be Object or null; clone to avoid live-mutation.
        eventLog.push(JSON.parse(JSON.stringify(e.detail || {})));
      });
    })();
  `;
  return body;
}

/**
 * Walks the wizard from the landing page to Step 4:
 *   landing → click Resume toast → jumps to Step 3 → click Next → Step 4.
 *
 * Relies on the localStorage pre-seed from `buildInitScript()` being in
 * place before navigation. Returns once `[data-autocomplete-state]` is in
 * the DOM (= Step 4 mounted).
 */
async function navigateToStep4(page) {
  await page.goto(`${BASE_URL}/request-quote/`, {waitUntil: 'domcontentloaded', timeout: 30_000});
  // Wait for the resume toast and click "Resume". The WizardResumeToast
  // button text is `wizard.toast.resumeBtn` (EN "Resume" / ES "Reanudar").
  const resumeButton = page.locator('button', {hasText: /^resume$|^reanudar$/i});
  try {
    await resumeButton.first().waitFor({state: 'visible', timeout: 15_000});
  } catch (e) {
    const html = await page.content();
    console.log('  [navigateToStep4] resume button never appeared. Page HTML head (first 400 chars):');
    console.log('  ' + html.replace(/\s+/g, ' ').slice(0, 400));
    throw e;
  }
  await resumeButton.first().click();

  // Wait for Step 3 to actually be mounted. The wizard uses `motion.form`
  // inside `<AnimatePresence mode="wait">`, so the Step 1 form lingers in
  // the DOM during the 200 ms exit animation. Clicking Next mid-transition
  // would submit Step 1 (audience now set) → goToStep(2). Waiting on the
  // form's `aria-labelledby={"wizard-step3-h2"}` confirms Step 3 has
  // completed its enter transition.
  await page.waitForSelector('form[aria-labelledby="wizard-step3-h2"]', {timeout: 15_000});
  await page.waitForURL(/[?&]step=3\b/, {timeout: 15_000});

  // After Step 3 is rendered, click Next to advance to Step 4. The sticky
  // nav's Next button is labeled "Next →" (EN) / "Siguiente →" (ES).
  // Scope the locator to the Step 3 form so we don't accidentally hit a
  // stale Step 1 button during a transition.
  const step3Form = page.locator('form[aria-labelledby="wizard-step3-h2"]');
  const nextButton = step3Form.locator('button', {hasText: /next|siguiente/i});
  await nextButton.first().waitFor({state: 'visible', timeout: 15_000});
  await nextButton.first().click();
  await page.waitForSelector('form[aria-labelledby="wizard-step4-h2"]', {timeout: 15_000});
  await page.waitForURL(/[?&]step=4\b/, {timeout: 15_000});
  // Step 4's autocomplete wrapper should be present.
  try {
    await page.waitForSelector('[data-autocomplete-state]', {timeout: 15_000});
  } catch (e) {
    // Diagnostic: dump the Step 4 form's HTML so we can see what mounted.
    const stepFourHtml = await page.evaluate(() => {
      const f = document.querySelector('form[aria-labelledby="wizard-step4-h2"]');
      return f ? f.outerHTML : '<no step-4 form found>';
    });
    console.log('  [navigateToStep4] data-autocomplete-state never appeared. Step 4 form HTML (first 5000 chars):');
    console.log('  ' + stepFourHtml.replace(/\s+/g, ' ').slice(0, 5000));
    // Also check current URL.
    console.log('  Current URL: ' + page.url());
    throw e;
  }
}

function syntheticAuroraPlace() {
  return {
    address_components: [
      {long_name: '1630', short_name: '1630', types: ['street_number']},
      {long_name: 'Mountain Street', short_name: 'Mountain St', types: ['route']},
      {long_name: 'Aurora', short_name: 'Aurora', types: ['locality', 'political']},
      {long_name: 'Kane County', short_name: 'Kane County', types: ['administrative_area_level_2', 'political']},
      {long_name: 'Illinois', short_name: 'IL', types: ['administrative_area_level_1', 'political']},
      {long_name: 'United States', short_name: 'US', types: ['country', 'political']},
      {long_name: '60505', short_name: '60505', types: ['postal_code']},
    ],
  };
}

function syntheticAuroraPlaceMissingZip() {
  return {
    address_components: [
      {long_name: '1700', short_name: '1700', types: ['street_number']},
      {long_name: 'Galena Boulevard', short_name: 'Galena Blvd', types: ['route']},
      {long_name: 'Aurora', short_name: 'Aurora', types: ['locality', 'political']},
      {long_name: 'Illinois', short_name: 'IL', types: ['administrative_area_level_1', 'political']},
      {long_name: 'United States', short_name: 'US', types: ['country', 'political']},
      // intentionally no postal_code
    ],
  };
}

/* ----------------------- Tests ----------------------- */

async function runHappyPathTests(browser) {
  const context = await browser.newContext();
  if (bypassCookieName) {
    await context.addCookies([
      {name: bypassCookieName, value: bypassCookieValue, url: BASE_URL},
    ]);
  }
  await context.addInitScript({content: buildInitScript()});
  const page = await context.newPage();
  page.on('pageerror', (err) => {
    console.log('  [pageerror]', err.message);
  });

  await navigateToStep4(page);

  // T1 — loading → ready within 10s. With the mock pre-seeded, the hook's
  // already-loaded short-circuit resolves in a microtask, so `ready` lands
  // very quickly. We poll for up to 10s to allow for harness slack.
  let initialState = null;
  try {
    initialState = await page.getAttribute('[data-autocomplete-state]', 'data-autocomplete-state');
  } catch {
    // fine — wrapper might not have rendered yet
  }
  await page.waitForFunction(
    () => document.querySelector('[data-autocomplete-state]')?.getAttribute('data-autocomplete-state') === 'ready',
    null,
    {timeout: 10_000},
  );
  const readyState = await page.getAttribute('[data-autocomplete-state]', 'data-autocomplete-state');
  record(
    'T1 step-4 wrapper transitions to data-autocomplete-state="ready" within 10s',
    readyState === 'ready',
    `initial=${initialState ?? '<missing>'} final=${readyState}`,
  );

  // Confirm the mock Autocomplete constructor ran with the right options.
  const spyInfo = await page.evaluate(() => ({
    called: window.__autocompleteSpy?.constructorCalled === true,
    country: window.__autocompleteSpy?.options?.componentRestrictions?.country,
    types: window.__autocompleteSpy?.options?.types,
    fields: window.__autocompleteSpy?.options?.fields,
  }));
  record(
    'T1.b mock Autocomplete instantiated with country:["us"] + types:["address"]',
    spyInfo.called && Array.isArray(spyInfo.country) && spyInfo.country[0] === 'us' && Array.isArray(spyInfo.types) && spyInfo.types[0] === 'address',
    `called=${spyInfo.called} country=${JSON.stringify(spyInfo.country)} types=${JSON.stringify(spyInfo.types)} fields=${JSON.stringify(spyInfo.fields)}`,
  );

  // T2 — happy-path 4-field fill.
  await page.evaluate((place) => {
    window.__autocompleteSpy.triggerPlaceChanged(place);
  }, syntheticAuroraPlace());
  // Allow React to flush state.
  await page.waitForFunction(
    () => document.querySelector('#wiz-step4-street')?.value === '1630 Mountain Street',
    null,
    {timeout: 5_000},
  );
  const t2Values = await page.evaluate(() => ({
    street: document.querySelector('#wiz-step4-street')?.value,
    city: document.querySelector('#wiz-step4-city')?.value,
    state: document.querySelector('#wiz-step4-state')?.value,
    zip: document.querySelector('#wiz-step4-zip')?.value,
  }));
  const t2Pass =
    t2Values.street === '1630 Mountain Street' &&
    t2Values.city === 'Aurora' &&
    t2Values.state === 'IL' &&
    t2Values.zip === '60505';
  record('T2 place select fills street + city + state + zip', t2Pass, JSON.stringify(t2Values));

  // T4 — `sunset:wizard-event` captured with right detail.
  // (Run T4 before T3 so we can assert against the T2 event without
  // contamination from T3's partial fire.)
  const eventsAfterT2 = await page.evaluate(() => window.__autocompleteSpy.events);
  const addrEvent = eventsAfterT2.find(
    (e) => e.name === 'wizard_address_autocompleted',
  );
  const t4Pass =
    !!addrEvent &&
    addrEvent.step === 4 &&
    addrEvent.source === 'autocomplete';
  record(
    'T4 sunset:wizard-event captured with name=wizard_address_autocompleted, step=4, source=autocomplete',
    t4Pass,
    JSON.stringify(addrEvent ?? eventsAfterT2.slice(-3)),
  );
  // PII defense check — payload must contain zero PII-suspect keys.
  const piiKeys = ['email', 'phone', 'firstName', 'lastName', 'street', 'city', 'state', 'zip', 'address'];
  const piiLeak = addrEvent ? Object.keys(addrEvent).filter((k) => piiKeys.includes(k)) : [];
  record(
    'T4.b address-autocomplete event payload carries zero PII keys',
    piiLeak.length === 0,
    `pii-suspect keys present: ${JSON.stringify(piiLeak)}`,
  );

  // T3 — partial fill: pre-fill zip manually, fire place without postal_code,
  // assert zip is preserved.
  await page.fill('#wiz-step4-zip', '60504');
  await page.evaluate((place) => {
    window.__autocompleteSpy.triggerPlaceChanged(place);
  }, syntheticAuroraPlaceMissingZip());
  await page.waitForFunction(
    () => document.querySelector('#wiz-step4-street')?.value === '1700 Galena Boulevard',
    null,
    {timeout: 5_000},
  );
  const t3Values = await page.evaluate(() => ({
    street: document.querySelector('#wiz-step4-street')?.value,
    city: document.querySelector('#wiz-step4-city')?.value,
    state: document.querySelector('#wiz-step4-state')?.value,
    zip: document.querySelector('#wiz-step4-zip')?.value,
  }));
  const t3Pass =
    t3Values.street === '1700 Galena Boulevard' &&
    t3Values.city === 'Aurora' &&
    t3Values.state === 'IL' &&
    t3Values.zip === '60504';
  record(
    'T3 missing postal_code → street/city/state updated, manual zip 60504 preserved',
    t3Pass,
    JSON.stringify(t3Values),
  );

  // T5 — Manual entry: clear street, type "1234 Fake Lane", assert value
  // matches typed text and the Next button is enabled (validation does not
  // require an autocomplete-sourced street).
  await page.fill('#wiz-step4-street', '1234 Fake Lane');
  // Fill the remaining required fields with valid manual values so Step 4
  // validation passes and Next stays enabled. (firstName / lastName / email
  // / phone / city / state / zip required per WIZARD_STEP_4_FIELDS.)
  await page.fill('#wiz-step4-firstName', 'Test');
  await page.fill('#wiz-step4-lastName', 'Visitor');
  await page.fill('#wiz-step4-email', 'test@example.com');
  await page.fill('#wiz-step4-phone', '6309461234');
  // street already set above
  await page.fill('#wiz-step4-city', 'Aurora');
  // state default 'IL'
  await page.fill('#wiz-step4-zip', '60505');
  // Blur the last field so on-blur validation re-runs.
  await page.evaluate(() => document.activeElement?.blur());
  // Read the Next button state — sticky-nav uses a <button type="button">
  // we identify by its visible text + role.
  const t5Values = await page.evaluate(() => ({
    street: document.querySelector('#wiz-step4-street')?.value,
    firstName: document.querySelector('#wiz-step4-firstName')?.value,
  }));
  const nextDisabled = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, [role="button"]'));
    const next = btns.find((b) => {
      const txt = (b.textContent || '').trim().toLowerCase();
      return /next|siguiente/.test(txt);
    });
    if (!next) return 'no-next-button';
    if (next.hasAttribute('disabled')) return 'has-disabled-attr';
    if (next.getAttribute('aria-disabled') === 'true') return 'aria-disabled';
    return 'enabled';
  });
  record(
    'T5 manual entry "1234 Fake Lane" preserved + Next button enabled',
    t5Values.street === '1234 Fake Lane' && nextDisabled === 'enabled',
    `street=${t5Values.street} firstName=${t5Values.firstName} next=${nextDisabled}`,
  );

  await context.close();
}

async function runDisabledTest(browser) {
  const context = await browser.newContext();
  if (bypassCookieName) {
    await context.addCookies([
      {name: bypassCookieName, value: bypassCookieValue, url: BASE_URL},
    ]);
  }
  await context.addInitScript({content: buildInitScript({forceDisabled: true})});

  const consoleErrors = [];
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(`pageerror: ${err.message}`);
  });

  await navigateToStep4(page);

  // Allow the useEffect to run; the disabled branch derives its initial
  // state from the useState initializer, but React still flushes async.
  await page.waitForFunction(
    () => document.querySelector('[data-autocomplete-state]')?.getAttribute('data-autocomplete-state') === 'disabled',
    null,
    {timeout: 5_000},
  );
  const state = await page.getAttribute('[data-autocomplete-state]', 'data-autocomplete-state');
  const helperPresent = await page.evaluate(() => !!document.querySelector('[data-autocomplete-helper]'));

  // Manual entry must still work in the disabled branch.
  await page.fill('#wiz-step4-street', '999 Disabled Lane');
  const manualValue = await page.evaluate(
    () => document.querySelector('#wiz-step4-street')?.value,
  );

  // Filter out pre-existing console noise unrelated to B.10:
  //   - `MISSING_MESSAGE` next-intl warnings — pre-existing baseline since
  //     the wizard data layer landed in Phase 1.20.
  //   - `Failed to load resource: ... 404` for assets — Phase 2.04
  //     placeholder-image baseline (favicons, missing images).
  // T6 only fails on errors specific to the disabled branch (e.g. a thrown
  // TypeError if the hook tried to load Maps JS without a key).
  const b10ConsoleErrors = consoleErrors.filter(
    (e) => !/MISSING_MESSAGE/.test(e) && !/Failed to load resource.*404/.test(e),
  );
  const passState = state === 'disabled';
  const passNoHelper = !helperPresent;
  const passNoConsole = b10ConsoleErrors.length === 0;
  const passManual = manualValue === '999 Disabled Lane';
  record(
    'T6 disabled branch (empty key): data-autocomplete-state="disabled", no helper, no B.10 console errors, manual entry works',
    passState && passNoHelper && passNoConsole && passManual,
    `state=${state} helperPresent=${helperPresent} b10ConsoleErrors=${b10ConsoleErrors.length} preExistingI18nNoise=${consoleErrors.length - b10ConsoleErrors.length} manualValue=${manualValue}`,
  );
  if (b10ConsoleErrors.length > 0) {
    console.log('  B.10-specific console errors (first 3):');
    for (const e of b10ConsoleErrors.slice(0, 3)) console.log(`    - ${e}`);
  }

  await context.close();
}

/* ----------------------- Main ----------------------- */

async function main() {
  console.log('--- Phase B.10 wizard autocomplete harness ---');
  console.log(`BASE_URL=${BASE_URL}`);
  if (SHARE_TOKEN) console.log('using VERCEL_SHARE_TOKEN bypass');
  else if (BYPASS_TOKEN) console.log('using BYPASS_TOKEN bypass');

  let localServer = null;
  if (!ENV_BASE_URL) {
    console.log('[boot] spawning local next start on :' + PORT);
    localServer = await startLocalServer();
  } else {
    await primeBypassCookie();
  }

  let browser = null;
  try {
    browser = await chromium.launch();
    try {
      await runHappyPathTests(browser);
    } catch (e) {
      record('happy-path tests crashed', false, e?.message ?? String(e));
    }
    try {
      await runDisabledTest(browser);
    } catch (e) {
      record('disabled-branch test crashed', false, e?.message ?? String(e));
    }
  } finally {
    if (browser) await browser.close();
    if (localServer) await stopLocalServer(localServer);
  }

  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;
  console.log(`\n--- Summary ---`);
  console.log(`${passed} / ${results.length} PASS, ${failed} FAIL`);
  if (failed > 0) {
    for (const r of results.filter((r) => !r.pass)) {
      console.log(`  ✗ ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('\nharness crashed:', err);
  process.exit(2);
});
