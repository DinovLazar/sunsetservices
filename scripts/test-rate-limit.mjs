#!/usr/bin/env node
// Phase B.09 — verification harness for the swappable chat rate limiter
// (src/lib/chat/rateLimit.ts).
//
// Tests the rate-limit gate in /api/chat under both backends:
//   T1-T4 — memory backend (CHAT_RATELIMIT_STORE=memory). Always runs.
//   T5-T8 — kv backend (CHAT_RATELIMIT_STORE=kv).
//           Skipped when UPSTASH_REDIS_REST_URL is not set in env — the
//           Marketplace integration must be installed first (Cowork
//           follow-up). A skip is success, not failure.
//
// How we measure rate-limit without calling Anthropic:
//   The route checks the rate limiter BEFORE parsing the request body
//   (src/app/api/chat/route.ts:50). We POST an empty `{}` body. When the
//   limiter ALLOWS the request, the body fails Zod validation and the
//   route returns 400 {status:'invalid'}. When the limiter BLOCKS, the
//   route returns 429 BEFORE the body is parsed. So:
//     allowed → 400 (or any non-429 status; we assert !== 429)
//     blocked → 429 + JSON {reason: 'burst' | 'daily', retryAfter: <s>}
//   Zero source edits, zero Anthropic calls, zero Sanity calls.
//
// Server boots:
//   Memory mode — 2 boots (DAILY_LIMIT=50 for T1-T3, DAILY_LIMIT=2 for T4)
//   KV mode    — 3 boots (T5+T6+T7-A; restart for T7-B; bogus creds for T8)
//
// IP allocation (distinct per test to avoid cross-test contamination — KV
// state persists across server restarts and across harness runs, so we
// also explicitly DEL the test keys before each KV section):
//   T1-T3: 1.2.3.4    T5: 12.12.12.12
//   T4:    5.6.7.8    T6: 13.13.13.13
//                     T7: 14.14.14.14   T8: 15.15.15.15
//
// Cleanup: every spawned server is SIGTERM'd in a `finally`; a 5s timeout
// fallback escalates to SIGKILL. Exit codes: 0 success (including KV
// SKIPPED), 1 some assertion failed, 2 harness crashed.

import {spawn} from 'node:child_process';
import {readFileSync} from 'node:fs';

const HOST = '127.0.0.1';
const PORT_MEM_A = 3061;
const PORT_MEM_B = 3062;
const PORT_KV_A = 3063;
const PORT_KV_B = 3064;
const PORT_KV_C = 3065;

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
    // file absent — fine, callers override what they need
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

async function startServer({port, envOverrides}) {
  // Merge order: process.env → .env.local → overrides. We want overrides
  // to win (e.g. CHAT_RATELIMIT_STORE) and we want a clean PORT.
  const env = {
    ...process.env,
    ...loadEnvFromFile('.env.local'),
    // Always-set defaults sufficient to get past the kill switch.
    AI_CHAT_ENABLED: 'true',
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || 'dummy-not-called',
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
  let stderrBuf = '';
  proc.stderr.on('data', (d) => {
    stderrBuf += String(d);
  });
  // Probe /api/chat with GET — POST-only route, GET returns 405 which is
  // a fine liveness signal.
  try {
    await waitForServer(`http://${HOST}:${port}/api/chat`, 90_000);
  } catch (e) {
    proc.kill('SIGTERM');
    throw new Error(`${e.message}\n--- server stderr ---\n${stderrBuf.slice(-2000)}`);
  }
  // Expose the running buffer for fail-open stderr inspection.
  return {
    proc,
    port,
    get stderr() {
      return stderrBuf;
    },
  };
}

async function stopServer(server) {
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

async function postChat(port, ip, opts = {}) {
  const res = await fetch(`http://${HOST}:${port}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': ip,
    },
    body: JSON.stringify(opts.body ?? {}),
  });
  let json = null;
  // Only attempt JSON parse on small status codes (400 / 429 / 503) — for
  // 200, the body is an SSE stream we don't want to drain.
  if (res.status !== 200) {
    try {
      json = await res.json();
    } catch {
      json = null;
    }
  } else {
    // Drain the stream to allow the connection to close cleanly. We
    // don't need the content.
    try {
      await res.body?.cancel();
    } catch {
      // ignore
    }
  }
  return {
    status: res.status,
    retryAfter: res.headers.get('retry-after'),
    body: json,
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// -------- Memory mode --------

async function runMemoryTests() {
  console.log('\n--- Memory mode (T1-T4) ---');

  // Boot A: defaults (DAILY_LIMIT=50, BURST=2000ms) — T1, T2, T3
  console.log('[boot] memory server A (DAILY_LIMIT=50, BURST=2000) on :' + PORT_MEM_A);
  const serverA = await startServer({
    port: PORT_MEM_A,
    envOverrides: {
      CHAT_RATELIMIT_STORE: 'memory',
      CHAT_DAILY_LIMIT_PER_IP: '50',
      CHAT_BURST_INTERVAL_MS: '2000',
    },
  });
  try {
    // T1 — single POST → allowed (not 429)
    const r1 = await postChat(PORT_MEM_A, '1.2.3.4');
    record(
      'T1 memory single POST from 1.2.3.4 → allowed (status !== 429)',
      r1.status !== 429,
      `got status=${r1.status} retryAfter=${r1.retryAfter ?? '-'}`,
    );

    // T2 — immediate second POST → 429 burst, Retry-After: 2
    const r2 = await postChat(PORT_MEM_A, '1.2.3.4');
    const t2pass =
      r2.status === 429 &&
      r2.body?.reason === 'burst' &&
      String(r2.retryAfter) === '2';
    record(
      'T2 memory immediate 2nd POST from 1.2.3.4 → 429 burst Retry-After: 2',
      t2pass,
      `status=${r2.status} retryAfter=${r2.retryAfter} body=${JSON.stringify(r2.body)}`,
    );

    // T3 — wait 2.5s, then POST → allowed again
    await sleep(2500);
    const r3 = await postChat(PORT_MEM_A, '1.2.3.4');
    record(
      'T3 memory 3rd POST after 2.5s wait → allowed (status !== 429)',
      r3.status !== 429,
      `got status=${r3.status} retryAfter=${r3.retryAfter ?? '-'}`,
    );
  } finally {
    await stopServer(serverA);
  }

  // Boot B: DAILY_LIMIT=2 — T4
  console.log('[boot] memory server B (DAILY_LIMIT=2, BURST=2000) on :' + PORT_MEM_B);
  const serverB = await startServer({
    port: PORT_MEM_B,
    envOverrides: {
      CHAT_RATELIMIT_STORE: 'memory',
      CHAT_DAILY_LIMIT_PER_IP: '2',
      CHAT_BURST_INTERVAL_MS: '2000',
    },
  });
  try {
    // T4 — three POSTs spaced 3s apart from 5.6.7.8; first two allowed,
    // third → 429 daily with Retry-After in 86380..86400.
    const a = await postChat(PORT_MEM_B, '5.6.7.8');
    await sleep(3000);
    const b = await postChat(PORT_MEM_B, '5.6.7.8');
    await sleep(3000);
    const c = await postChat(PORT_MEM_B, '5.6.7.8');
    const firstTwoOk = a.status !== 429 && b.status !== 429;
    const retryAfterNum = c.retryAfter == null ? NaN : Number(c.retryAfter);
    const thirdOk =
      c.status === 429 &&
      c.body?.reason === 'daily' &&
      Number.isFinite(retryAfterNum) &&
      retryAfterNum >= 86380 &&
      retryAfterNum <= 86400;
    record(
      'T4 memory daily ceiling=2 → first two allowed, third 429 daily Retry-After ~86400',
      firstTwoOk && thirdOk,
      `a=${a.status} b=${b.status} c=${c.status} cRetryAfter=${c.retryAfter} cBody=${JSON.stringify(c.body)}`,
    );
  } finally {
    await stopServer(serverB);
  }
}

// -------- KV mode --------

async function deleteUpstashKeys(ips) {
  // Use the REST API directly so we don't have to import @upstash/redis
  // from the harness — the redis client is exercised by the route under
  // test, not by this script.
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return;
  const keys = ips.flatMap((ip) => [`chat:burst:${ip}`, `chat:daily:${ip}`]);
  // Upstash REST: POST a single multi-key DEL command (pipeline)
  try {
    await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
      body: JSON.stringify(keys.map((k) => ['DEL', k])),
    });
  } catch (e) {
    console.warn('[cleanup] DEL pipeline failed (continuing):', e?.message ?? e);
  }
}

async function runKvTests() {
  const hasCreds = Boolean(
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  );
  if (!hasCreds) {
    console.log(
      '\n--- KV mode (T5-T8): SKIPPED (UPSTASH_REDIS_REST_URL not set; run from Vercel Preview after Cowork installs the Upstash Marketplace integration) ---',
    );
    record('T5 kv burst (skipped — no credentials)', true, 'skipped');
    record('T6 kv daily (skipped — no credentials)', true, 'skipped');
    record('T7 kv persistence-across-restart (skipped — no credentials)', true, 'skipped');
    record('T8 kv fail-open (skipped — no credentials)', true, 'skipped');
    return;
  }

  console.log('\n--- KV mode (T5-T8) ---');
  const allIps = ['12.12.12.12', '13.13.13.13', '14.14.14.14', '15.15.15.15'];
  console.log('[cleanup] deleting Upstash test keys for ' + allIps.join(', '));
  await deleteUpstashKeys(allIps);

  // Boot KV-A: DAILY_LIMIT=2 — T5, T6, T7-phase-A
  console.log('[boot] kv server A (DAILY_LIMIT=2, BURST=2000) on :' + PORT_KV_A);
  const serverA = await startServer({
    port: PORT_KV_A,
    envOverrides: {
      CHAT_RATELIMIT_STORE: 'kv',
      CHAT_DAILY_LIMIT_PER_IP: '2',
      CHAT_BURST_INTERVAL_MS: '2000',
    },
  });
  try {
    // T5 — kv burst from 12.12.12.12
    const r1 = await postChat(PORT_KV_A, '12.12.12.12');
    const r2 = await postChat(PORT_KV_A, '12.12.12.12');
    const t5pass =
      r1.status !== 429 &&
      r2.status === 429 &&
      r2.body?.reason === 'burst' &&
      String(r2.retryAfter) === '2';
    record(
      'T5 kv immediate 2nd POST from 12.12.12.12 → 429 burst Retry-After: 2',
      t5pass,
      `r1=${r1.status} r2=${r2.status}/${r2.retryAfter}/${JSON.stringify(r2.body)}`,
    );

    // T6 — kv daily from 13.13.13.13 (3 spaced 3s)
    const a = await postChat(PORT_KV_A, '13.13.13.13');
    await sleep(3000);
    const b = await postChat(PORT_KV_A, '13.13.13.13');
    await sleep(3000);
    const c = await postChat(PORT_KV_A, '13.13.13.13');
    const t6FirstTwoOk = a.status !== 429 && b.status !== 429;
    const t6RetryAfterNum = c.retryAfter == null ? NaN : Number(c.retryAfter);
    const t6ThirdOk =
      c.status === 429 &&
      c.body?.reason === 'daily' &&
      Number.isFinite(t6RetryAfterNum) &&
      t6RetryAfterNum >= 86380 &&
      t6RetryAfterNum <= 86400;
    record(
      'T6 kv daily ceiling=2 → first two allowed, third 429 daily Retry-After ~86400',
      t6FirstTwoOk && t6ThirdOk,
      `a=${a.status} b=${b.status} c=${c.status}/${c.retryAfter}/${JSON.stringify(c.body)}`,
    );

    // T7 phase A — 2 allowed POSTs from 14.14.14.14 to put daily count at 2.
    // Space them past the burst window so the burst guard doesn't trip.
    const t7a1 = await postChat(PORT_KV_A, '14.14.14.14');
    await sleep(3000);
    const t7a2 = await postChat(PORT_KV_A, '14.14.14.14');
    if (t7a1.status === 429 || t7a2.status === 429) {
      record(
        'T7 kv persistence — phase A setup',
        false,
        `expected both allowed, got a=${t7a1.status} b=${t7a2.status}`,
      );
    } else {
      console.log('[T7 phase A] daily counter for 14.14.14.14 is now 2 in Upstash');
    }
  } finally {
    await stopServer(serverA);
  }

  // Boot KV-B: same DAILY_LIMIT, same store — T7 phase B (verify persistence)
  console.log(
    '[boot] kv server B (DAILY_LIMIT=2, fresh process) on :' + PORT_KV_B + ' — persistence check',
  );
  const serverB = await startServer({
    port: PORT_KV_B,
    envOverrides: {
      CHAT_RATELIMIT_STORE: 'kv',
      CHAT_DAILY_LIMIT_PER_IP: '2',
      CHAT_BURST_INTERVAL_MS: '2000',
    },
  });
  try {
    // After restart, 14.14.14.14's daily counter (held in Redis) should
    // still be 2; the next POST INCRs to 3 → over → 429 daily. The burst
    // key has a 2s TTL and is likely already expired by now (server B
    // boot takes longer than that), so the burst guard won't preempt.
    const r = await postChat(PORT_KV_B, '14.14.14.14');
    const retryAfterNum = r.retryAfter == null ? NaN : Number(r.retryAfter);
    const t7pass =
      r.status === 429 &&
      r.body?.reason === 'daily' &&
      Number.isFinite(retryAfterNum) &&
      retryAfterNum >= 86200 && // wider tolerance: server B boot is slow
      retryAfterNum <= 86400;
    record(
      'T7 kv persistence across restart — same IP still over daily limit',
      t7pass,
      `status=${r.status} retryAfter=${r.retryAfter} body=${JSON.stringify(r.body)}`,
    );
  } finally {
    await stopServer(serverB);
  }

  // Boot KV-C: bogus token — T8 (fail-open)
  console.log(
    '[boot] kv server C (BOGUS token) on :' + PORT_KV_C + ' — fail-open check',
  );
  const serverC = await startServer({
    port: PORT_KV_C,
    envOverrides: {
      CHAT_RATELIMIT_STORE: 'kv',
      UPSTASH_REDIS_REST_URL:
        process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? '',
      UPSTASH_REDIS_REST_TOKEN: 'bogus-token-' + '0'.repeat(40),
      // Also force the KV_* alias so the resolver can't fall back to a
      // real credential pair on installs that have both prefixes.
      KV_REST_API_URL:
        process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? '',
      KV_REST_API_TOKEN: 'bogus-token-' + '0'.repeat(40),
      CHAT_DAILY_LIMIT_PER_IP: '50',
      CHAT_BURST_INTERVAL_MS: '2000',
    },
  });
  try {
    const r = await postChat(PORT_KV_C, '15.15.15.15');
    // Allow a short window for stderr to flush after the request.
    await sleep(500);
    const stderr = serverC.stderr;
    const statusOk = r.status !== 429 && r.status !== 500;
    const stderrOk = stderr.includes('[ratelimit] kv check failed');
    record(
      'T8 kv fail-open on bogus token → not 429/500 + stderr contains "[ratelimit] kv check failed"',
      statusOk && stderrOk,
      `status=${r.status} stderrContainsLog=${stderrOk}`,
    );
  } finally {
    await stopServer(serverC);
  }

  // Final cleanup so a re-run starts from a clean slate.
  console.log('[cleanup] deleting Upstash test keys (post-run)');
  await deleteUpstashKeys(allIps);
}

// -------- Main --------

async function main() {
  console.log('--- Phase B.09 chat rate-limiter harness ---');
  console.log(
    'Assertion model: empty {} body → allowed=400 (Zod fails after the limiter),',
  );
  console.log('blocked=429 with reason+Retry-After. Zero Anthropic/Sanity calls.\n');

  // Run memory tests first — always.
  try {
    await runMemoryTests();
  } catch (e) {
    record('memory-mode boot/run', false, e?.message ?? String(e));
  }

  try {
    await runKvTests();
  } catch (e) {
    record('kv-mode boot/run', false, e?.message ?? String(e));
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
