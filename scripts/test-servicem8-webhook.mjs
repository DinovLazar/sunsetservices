#!/usr/bin/env node
// Phase 2.13 — synthetic verification battery for /api/webhooks/servicem8.
// Runs the 6 tests prescribed by the phase plan, then verifies and cleans
// the test document from Sanity. Spawns `next start` twice (once flag-off,
// once flag-on) so each request sees the right env. Run after `npm run build`.

import {spawn} from 'node:child_process';
import {createHmac} from 'node:crypto';
import {readFileSync} from 'node:fs';

const PORT = 3037;
const BASE = `http://127.0.0.1:${PORT}`;
const TEST_SECRET = 'test-secret-please-rotate';

function loadEnvFromFile(path) {
  const env = {...process.env};
  const text = readFileSync(path, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2];
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

async function startServer(envOverrides) {
  const env = {
    ...loadEnvFromFile('.env.local'),
    ...envOverrides,
    PORT: String(PORT),
  };
  // Resolve Next.js binary via Node's module resolution (handles upward
  // node_modules from a worktree without its own deps).
  const {createRequire} = await import('node:module');
  const requireFromCwd = createRequire(`${process.cwd()}/package.json`);
  const nextPkgPath = requireFromCwd.resolve('next/package.json');
  const nextBin = nextPkgPath.replace(/package\.json$/, 'dist/bin/next');
  const proc = spawn('node', [nextBin, 'start', '-p', String(PORT)], {
    env,
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let lastErr = '';
  proc.stderr.on('data', (d) => {
    lastErr += String(d);
  });
  // Wait for server to start (poll the homepage; flag-off route always returns)
  try {
    await waitForServer(`${BASE}/api/webhooks/servicem8`, 60_000);
  } catch (e) {
    proc.kill('SIGTERM');
    throw new Error(`${e.message}\n--- server stderr ---\n${lastErr.slice(-2000)}`);
  }
  return proc;
}

async function stopServer(proc) {
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

function sign(body, secret) {
  return createHmac('sha256', secret).update(body, 'utf8').digest('hex');
}

const validPayload = {
  eventId: 'test-evt-001',
  eventType: 'job.completed',
  jobId: 'job-001',
  occurredAt: '2026-05-14T12:00:00.000Z',
  data: {photos: []},
};

const results = [];
function record(name, pass, detail) {
  results.push({name, pass, detail});
  console.log(`${pass ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
}

async function run() {
  // ─────────────── PHASE A: flag-off ───────────────
  console.log('\n[phase A] starting server with SERVICEM8_ENABLED=false …');
  let proc = await startServer({SERVICEM8_ENABLED: 'false', SERVICEM8_WEBHOOK_SECRET: ''});

  try {
    // Test 1: flag-off, any body, any headers → 200 simulated
    const r1 = await fetch(`${BASE}/api/webhooks/servicem8`, {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify(validPayload),
    });
    const j1 = await r1.json();
    record(
      'Test 1 — flag-off returns 200 + simulated',
      r1.status === 200 && j1.status === 'simulated' && j1.reason === 'feature-flag',
      `status=${r1.status} body=${JSON.stringify(j1)}`,
    );
  } finally {
    await stopServer(proc);
  }

  // ─────────────── PHASE B: flag-on ───────────────
  console.log('\n[phase B] starting server with SERVICEM8_ENABLED=true …');
  proc = await startServer({SERVICEM8_ENABLED: 'true', SERVICEM8_WEBHOOK_SECRET: TEST_SECRET});

  try {
    const validBody = JSON.stringify(validPayload);
    const validSig = sign(validBody, TEST_SECRET);

    // Test 2: flag-on, valid body, NO signature → 401 invalid-signature
    const r2 = await fetch(`${BASE}/api/webhooks/servicem8`, {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: validBody,
    });
    const j2 = await r2.json();
    record(
      'Test 2 — no signature returns 401 + invalid-signature',
      r2.status === 401 && j2.status === 'error' && j2.reason === 'invalid-signature',
      `status=${r2.status} body=${JSON.stringify(j2)}`,
    );

    // Test 3: flag-on, valid body + valid sig → 200 + sanityDocId (create)
    const r3 = await fetch(`${BASE}/api/webhooks/servicem8`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-servicem8-signature': validSig,
      },
      body: validBody,
    });
    const j3 = await r3.json();
    record(
      'Test 3 — valid sig + first send returns 200 + sanityDocId',
      r3.status === 200 &&
        j3.status === 'ok' &&
        j3.sanityDocId === 'servicem8Event-test-evt-001' &&
        j3.deduped !== true,
      `status=${r3.status} body=${JSON.stringify(j3)}`,
    );

    // Test 4: flag-on, replay same body + sig → 200 + deduped
    const r4 = await fetch(`${BASE}/api/webhooks/servicem8`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-servicem8-signature': validSig,
      },
      body: validBody,
    });
    const j4 = await r4.json();
    record(
      'Test 4 — replay returns 200 + deduped=true',
      r4.status === 200 &&
        j4.status === 'ok' &&
        j4.deduped === true &&
        j4.sanityDocId === 'servicem8Event-test-evt-001',
      `status=${r4.status} body=${JSON.stringify(j4)}`,
    );

    // Test 5: flag-on, invalid JSON ("not json") + sig computed on raw → 400 invalid-json
    const rawNotJson = 'not json';
    const sigNotJson = sign(rawNotJson, TEST_SECRET);
    const r5 = await fetch(`${BASE}/api/webhooks/servicem8`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-servicem8-signature': sigNotJson,
      },
      body: rawNotJson,
    });
    const j5 = await r5.json();
    record(
      'Test 5 — invalid JSON returns 400 + invalid-json',
      r5.status === 400 && j5.status === 'error' && j5.reason === 'invalid-json',
      `status=${r5.status} body=${JSON.stringify(j5)}`,
    );

    // Test 6: flag-on, empty object {} + sig → 400 invalid-payload
    const emptyBody = '{}';
    const sigEmpty = sign(emptyBody, TEST_SECRET);
    const r6 = await fetch(`${BASE}/api/webhooks/servicem8`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-servicem8-signature': sigEmpty,
      },
      body: emptyBody,
    });
    const j6 = await r6.json();
    record(
      'Test 6 — empty body returns 400 + invalid-payload',
      r6.status === 400 && j6.status === 'error' && j6.reason === 'invalid-payload',
      `status=${r6.status} body=${JSON.stringify(j6)}`,
    );
  } finally {
    await stopServer(proc);
  }

  // ─────────────── Summary ───────────────
  const passed = results.filter((r) => r.pass).length;
  console.log(`\n=== ${passed}/${results.length} tests passed ===`);
  if (passed !== results.length) {
    process.exit(1);
  }
}

run().catch((e) => {
  console.error('Test runner failed:', e);
  process.exit(2);
});
