#!/usr/bin/env node
// Phase B.08 — synthetic verification battery for the Sanity revalidation
// webhook + the flag-gated test route.
//
// Spawns `next start` twice (because the test-route flag-off case requires
// REVALIDATE_TEST_ROUTES_ENABLED to be unset at process boot — env can't be
// toggled per-request once the server is running):
//
//   1. Server A — flag ON. Tests 1-10 (webhook) + 12-14 (test route).
//   2. Server B — flag OFF. Test 11 (test route returns 404 forbidden).
//
// Tests:
//   1. Webhook — missing signature header → 401 missing-signature
//   2. Webhook — invalid signature (wrong secret) → 401 invalid-signature
//   3. Webhook — valid sig + missing _type → 400 missing-doc-type
//   4. Webhook — valid sig + unknown _type → 200 unhandled:true, empty arrays
//   5. Webhook — blogPost with slug → 200 + tags include ['blogPost','faq'] +
//      paths include /blog, /es/blog, /blog/<slug>, /es/blog/<slug>
//   6. Webhook — service with slug → 200 + tags include ['service','faq'] +
//      paths fan out across audience-service + audience + city (× 2 locales)
//   7. Webhook — project with NO slug → 200 + tags ['project'] +
//      paths include /projects + cross-page reads (audience, city, /, /about)
//      and exclude /projects/[slug] (slug-less path drops)
//   8. Webhook — faq → 200 + tags=['faq'] + paths=[]
//   9. Webhook — team → 200 + paths include /about + /es/about
//  10. Webhook — location with slug → 200 + paths include /service-areas,
//      /es/service-areas, /service-areas/<slug>, /es/service-areas/<slug>
//  11. Test route — flag-off → 404 forbidden (spawn B)
//  12. Test route — flag-on + missing auth header → 401 invalid-auth
//  13. Test route — flag-on + wrong secret → 401 invalid-auth
//  14. Test route — flag-on + valid auth + blogPost → 200 same shape as test 5
//
// Harness runtime note: parseBody (next-sanity/webhook) waits 3 seconds
// per valid-signature request for Sanity Content Lake eventual consistency.
// Tests with valid signatures (3, 4, 5, 6, 7, 8, 9, 10) each incur that
// wait — ~24s baked into the total runtime. The production behavior is the
// right default; the harness eats the cost rather than adding a test-only
// env-var override to the production route.
//
// Cleanup: both spawned processes are SIGTERM'd on success and failure paths.
// No external API calls — this harness is pure Next + crypto, no Sanity
// content is touched, no costs incurred.

import {spawn} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {encodeSignatureHeader, SIGNATURE_HEADER_NAME} from '@sanity/webhook';

const APP_PORT_A = 3055;
const APP_PORT_B = 3056;
const APP_BASE_A = `http://127.0.0.1:${APP_PORT_A}`;
const APP_BASE_B = `http://127.0.0.1:${APP_PORT_B}`;

// Deterministic test secrets — kept distinct from any production value so a
// leaked test secret cannot drive a real webhook and vice versa.
const TEST_REVALIDATE_SECRET = 'test-revalidate-secret-' + '0'.repeat(44);
const WRONG_REVALIDATE_SECRET = 'wrong-revalidate-secret-' + '1'.repeat(43);
const TEST_ROUTES_SECRET = 'test-routes-secret-' + '0'.repeat(45);

const results = [];
function record(name, pass, detail) {
  results.push({name, pass, detail});
  console.log(`${pass ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
}

function loadEnvFromFile(path) {
  const env = {...process.env};
  try {
    const text = readFileSync(path, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) env[m[1]] = m[2];
    }
  } catch {
    // .env.local not present — fine for harness; we override the
    // values we need anyway.
  }
  return env;
}

async function waitForServer(url, timeoutMs = 60_000) {
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

async function startAppServer({port, envOverrides}) {
  const env = {
    ...loadEnvFromFile('.env.local'),
    ...envOverrides,
    PORT: String(port),
  };
  const {createRequire} = await import('node:module');
  const requireFromCwd = createRequire(`${process.cwd()}/package.json`);
  const nextPkgPath = requireFromCwd.resolve('next/package.json');
  const nextBin = nextPkgPath.replace(/package\.json$/, 'dist/bin/next');
  const proc = spawn('node', [nextBin, 'start', '-p', String(port)], {
    env,
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let lastErr = '';
  proc.stderr.on('data', (d) => {
    lastErr += String(d);
  });
  // Probe a known route — GET /api/revalidate returns 405 (POST-only),
  // which is fine as a liveness signal.
  try {
    await waitForServer(`http://127.0.0.1:${port}/api/revalidate`, 60_000);
  } catch (e) {
    proc.kill('SIGTERM');
    throw new Error(`${e.message}\n--- server stderr ---\n${lastErr.slice(-2000)}`);
  }
  return proc;
}

async function stopAppServer(proc) {
  if (!proc) return;
  return new Promise((resolve) => {
    proc.once('exit', () => resolve());
    proc.kill('SIGTERM');
    setTimeout(() => {
      try {
        proc.kill('SIGKILL');
      } catch {}
      resolve();
    }, 5000);
  });
}

function jsonBody(obj) {
  return JSON.stringify(obj);
}

async function signedFetch(url, secret, body, extraHeaders = {}) {
  const timestamp = Date.now();
  const stringified = jsonBody(body);
  const signatureHeader = await encodeSignatureHeader(stringified, timestamp, secret);
  return fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      [SIGNATURE_HEADER_NAME]: signatureHeader,
      ...extraHeaders,
    },
    body: stringified,
  });
}

async function unsignedFetch(url, body) {
  return fetch(url, {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: jsonBody(body),
  });
}

async function expectJson(res, expectedStatus, label) {
  let body;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  const ok = res.status === expectedStatus;
  if (!ok) {
    return {
      ok: false,
      detail: `${label}: expected status ${expectedStatus}, got ${res.status}; body=${JSON.stringify(body)}`,
      body,
    };
  }
  return {ok: true, body};
}

function arrayIncludesAll(haystack, needles) {
  return needles.every((n) => haystack.includes(n));
}

// --- Tests against server A (flag ON) ---

async function runFlagOnTests() {
  // Test 1 — webhook missing signature
  {
    const res = await unsignedFetch(`${APP_BASE_A}/api/revalidate`, {_type: 'blogPost'});
    const r = await expectJson(res, 401, 'T1');
    const ok = r.ok && r.body?.reason === 'missing-signature';
    record(
      'T1 webhook missing signature → 401 missing-signature',
      ok,
      ok ? '' : `got status=${res.status} body=${JSON.stringify(r.body)}`,
    );
  }

  // Test 2 — webhook invalid signature
  {
    const res = await signedFetch(
      `${APP_BASE_A}/api/revalidate`,
      WRONG_REVALIDATE_SECRET,
      {_type: 'blogPost'},
    );
    const r = await expectJson(res, 401, 'T2');
    const ok = r.ok && r.body?.reason === 'invalid-signature';
    record(
      'T2 webhook invalid signature → 401 invalid-signature',
      ok,
      ok ? '' : `got status=${res.status} body=${JSON.stringify(r.body)}`,
    );
  }

  // Test 3 — webhook valid sig + missing _type
  {
    const res = await signedFetch(
      `${APP_BASE_A}/api/revalidate`,
      TEST_REVALIDATE_SECRET,
      {_id: 'foo'},
    );
    const r = await expectJson(res, 400, 'T3');
    const ok = r.ok && r.body?.reason === 'missing-doc-type';
    record(
      'T3 webhook missing _type → 400 missing-doc-type',
      ok,
      ok ? '' : `got status=${res.status} body=${JSON.stringify(r.body)}`,
    );
  }

  // Test 4 — webhook valid sig + unknown _type
  {
    const res = await signedFetch(
      `${APP_BASE_A}/api/revalidate`,
      TEST_REVALIDATE_SECRET,
      {_type: 'totallyMadeUpType', _id: 'foo'},
    );
    const r = await expectJson(res, 200, 'T4');
    const ok =
      r.ok &&
      r.body?.status === 'ok' &&
      r.body?.unhandled === true &&
      Array.isArray(r.body?.revalidatedTags) &&
      r.body.revalidatedTags.length === 0 &&
      Array.isArray(r.body?.revalidatedPaths) &&
      r.body.revalidatedPaths.length === 0;
    record(
      'T4 webhook unknown _type → 200 unhandled:true',
      ok,
      ok ? '' : `body=${JSON.stringify(r.body)}`,
    );
  }

  // Test 5 — webhook blogPost with slug
  {
    const res = await signedFetch(
      `${APP_BASE_A}/api/revalidate`,
      TEST_REVALIDATE_SECRET,
      {_type: 'blogPost', _id: 'b-1', slug: 'my-test-post'},
    );
    const r = await expectJson(res, 200, 'T5');
    const tagsOk = r.ok && arrayIncludesAll(r.body?.revalidatedTags ?? [], ['blogPost', 'faq']);
    const pathsOk =
      r.ok &&
      arrayIncludesAll(r.body?.revalidatedPaths ?? [], [
        '/blog',
        '/es/blog',
        '/blog/my-test-post',
        '/es/blog/my-test-post',
      ]);
    record(
      'T5 webhook blogPost(slug) → tags + EN/ES index + EN/ES detail',
      tagsOk && pathsOk,
      tagsOk && pathsOk
        ? ''
        : `tagsOk=${tagsOk} pathsOk=${pathsOk} body=${JSON.stringify(r.body)}`,
    );
  }

  // Test 6 — webhook service with slug
  {
    const res = await signedFetch(
      `${APP_BASE_A}/api/revalidate`,
      TEST_REVALIDATE_SECRET,
      {_type: 'service', _id: 's-1', slug: 'lawn-care'},
    );
    const r = await expectJson(res, 200, 'T6');
    const tagsOk = r.ok && arrayIncludesAll(r.body?.revalidatedTags ?? [], ['service', 'faq']);
    const paths = r.body?.revalidatedPaths ?? [];
    const pathsOk =
      arrayIncludesAll(paths, [
        '/residential/lawn-care',
        '/commercial/snow-removal',
        '/hardscape/patios-walkways',
        '/residential',
        '/es/residential',
        '/service-areas/aurora',
        '/es/service-areas/aurora',
      ]) &&
      // 16 (audience, slug) pairs from SERVICES + 3 audience landings + 6
      // city pages = 25 EN paths × 2 locales = 50 total.
      paths.length === 50;
    record(
      'T6 webhook service(slug) → tags + 50 fanned-out paths (32 svc-detail + 6 audience + 12 city)',
      tagsOk && pathsOk,
      tagsOk && pathsOk
        ? `total paths=${paths.length}`
        : `tagsOk=${tagsOk} pathsOk=${pathsOk} pathsLen=${paths.length} body=${JSON.stringify(r.body)}`,
    );
  }

  // Test 7 — webhook project with NO slug
  {
    const res = await signedFetch(
      `${APP_BASE_A}/api/revalidate`,
      TEST_REVALIDATE_SECRET,
      {_type: 'project', _id: 'p-1'},
    );
    const r = await expectJson(res, 200, 'T7');
    const tagsOk = r.ok && arrayIncludesAll(r.body?.revalidatedTags ?? [], ['project']);
    const paths = r.body?.revalidatedPaths ?? [];
    const hasIndexEn = paths.includes('/projects');
    const hasIndexEs = paths.includes('/es/projects');
    const hasHome = paths.includes('/') && paths.includes('/es');
    const hasAbout = paths.includes('/about') && paths.includes('/es/about');
    const noDetail = !paths.some((p) => p.startsWith('/projects/') || p.startsWith('/es/projects/'));
    const ok = tagsOk && hasIndexEn && hasIndexEs && hasHome && hasAbout && noDetail;
    record(
      'T7 webhook project(NO slug) → indices + cross-page reads; NO detail paths',
      ok,
      ok
        ? ''
        : `tagsOk=${tagsOk} indexEn=${hasIndexEn} indexEs=${hasIndexEs} home=${hasHome} about=${hasAbout} noDetail=${noDetail} body=${JSON.stringify(r.body)}`,
    );
  }

  // Test 8 — webhook faq
  {
    const res = await signedFetch(
      `${APP_BASE_A}/api/revalidate`,
      TEST_REVALIDATE_SECRET,
      {_type: 'faq', _id: 'f-1'},
    );
    const r = await expectJson(res, 200, 'T8');
    const ok =
      r.ok &&
      Array.isArray(r.body?.revalidatedTags) &&
      r.body.revalidatedTags.length === 1 &&
      r.body.revalidatedTags[0] === 'faq' &&
      Array.isArray(r.body?.revalidatedPaths) &&
      r.body.revalidatedPaths.length === 0;
    record(
      'T8 webhook faq → tags=["faq"], paths=[]',
      ok,
      ok ? '' : `body=${JSON.stringify(r.body)}`,
    );
  }

  // Test 9 — webhook team
  {
    const res = await signedFetch(
      `${APP_BASE_A}/api/revalidate`,
      TEST_REVALIDATE_SECRET,
      {_type: 'team', _id: 't-1'},
    );
    const r = await expectJson(res, 200, 'T9');
    const paths = r.body?.revalidatedPaths ?? [];
    const ok =
      r.ok &&
      r.body?.revalidatedTags?.includes('team') &&
      paths.includes('/about') &&
      paths.includes('/es/about');
    record(
      'T9 webhook team → /about + /es/about',
      ok,
      ok ? '' : `body=${JSON.stringify(r.body)}`,
    );
  }

  // Test 10 — webhook location with slug
  {
    const res = await signedFetch(
      `${APP_BASE_A}/api/revalidate`,
      TEST_REVALIDATE_SECRET,
      {_type: 'location', _id: 'loc-1', slug: 'aurora'},
    );
    const r = await expectJson(res, 200, 'T10');
    const paths = r.body?.revalidatedPaths ?? [];
    const ok =
      r.ok &&
      r.body?.revalidatedTags?.includes('location') &&
      paths.includes('/service-areas') &&
      paths.includes('/es/service-areas') &&
      paths.includes('/service-areas/aurora') &&
      paths.includes('/es/service-areas/aurora');
    record(
      'T10 webhook location(aurora) → /service-areas + /service-areas/aurora (× 2 locales)',
      ok,
      ok ? '' : `body=${JSON.stringify(r.body)}`,
    );
  }

  // Test 12 — test route missing auth
  {
    const res = await fetch(`${APP_BASE_A}/api/test/revalidate`, {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: jsonBody({docType: 'blogPost', slug: 'whatever'}),
    });
    const r = await expectJson(res, 401, 'T12');
    const ok = r.ok && r.body?.reason === 'invalid-auth';
    record(
      'T12 test-route missing auth → 401 invalid-auth',
      ok,
      ok ? '' : `body=${JSON.stringify(r.body)}`,
    );
  }

  // Test 13 — test route wrong secret
  {
    const res = await fetch(`${APP_BASE_A}/api/test/revalidate`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer this-is-not-the-secret',
      },
      body: jsonBody({docType: 'blogPost', slug: 'whatever'}),
    });
    const r = await expectJson(res, 401, 'T13');
    const ok = r.ok && r.body?.reason === 'invalid-auth';
    record(
      'T13 test-route wrong secret → 401 invalid-auth',
      ok,
      ok ? '' : `body=${JSON.stringify(r.body)}`,
    );
  }

  // Test 14 — test route valid auth + blogPost
  {
    const res = await fetch(`${APP_BASE_A}/api/test/revalidate`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${TEST_ROUTES_SECRET}`,
      },
      body: jsonBody({docType: 'blogPost', slug: 'my-test-post'}),
    });
    const r = await expectJson(res, 200, 'T14');
    const tagsOk = r.ok && arrayIncludesAll(r.body?.revalidatedTags ?? [], ['blogPost', 'faq']);
    const pathsOk =
      r.ok &&
      arrayIncludesAll(r.body?.revalidatedPaths ?? [], [
        '/blog',
        '/es/blog',
        '/blog/my-test-post',
        '/es/blog/my-test-post',
      ]);
    record(
      'T14 test-route valid auth + blogPost → 200 + same shape as T5',
      tagsOk && pathsOk,
      tagsOk && pathsOk ? '' : `body=${JSON.stringify(r.body)}`,
    );
  }
}

// --- Tests against server B (flag OFF) ---

async function runFlagOffTests() {
  // Test 11 — test route flag-off
  const res = await fetch(`${APP_BASE_B}/api/test/revalidate`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${TEST_ROUTES_SECRET}`,
    },
    body: jsonBody({docType: 'blogPost'}),
  });
  const r = await expectJson(res, 404, 'T11');
  const ok = r.ok && r.body?.status === 'forbidden';
  record(
    'T11 test-route flag-off → 404 forbidden',
    ok,
    ok ? '' : `status=${res.status} body=${JSON.stringify(r.body)}`,
  );
}

async function main() {
  console.log('--- Phase B.08 revalidation harness ---');
  console.log('Note: parseBody waits 3s per valid-signature request for Sanity');
  console.log('CDN eventual consistency. Tests 3-10 (8 webhook tests) incur the');
  console.log('wait — expect ~30-60s total runtime including server boot.\n');

  let serverA;
  let serverB;
  try {
    console.log('[boot] starting server A (REVALIDATE_TEST_ROUTES_ENABLED=true)');
    serverA = await startAppServer({
      port: APP_PORT_A,
      envOverrides: {
        SANITY_REVALIDATE_SECRET: TEST_REVALIDATE_SECRET,
        REVALIDATE_TEST_ROUTES_ENABLED: 'true',
        TEST_ROUTES_SECRET,
      },
    });
    console.log('[boot] server A ready on :' + APP_PORT_A + '\n');

    await runFlagOnTests();

    console.log('\n[boot] stopping server A, starting server B (flag UNSET)');
    await stopAppServer(serverA);
    serverA = null;

    serverB = await startAppServer({
      port: APP_PORT_B,
      envOverrides: {
        SANITY_REVALIDATE_SECRET: TEST_REVALIDATE_SECRET,
        // Deliberately do NOT set REVALIDATE_TEST_ROUTES_ENABLED — startAppServer
        // merges envOverrides over the loaded .env.local. If .env.local sets it
        // to 'true', force-empty it here so the route's gate trips.
        REVALIDATE_TEST_ROUTES_ENABLED: '',
        TEST_ROUTES_SECRET,
      },
    });
    console.log('[boot] server B ready on :' + APP_PORT_B + '\n');

    await runFlagOffTests();
  } finally {
    await stopAppServer(serverA);
    await stopAppServer(serverB);
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
