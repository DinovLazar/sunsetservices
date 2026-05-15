#!/usr/bin/env node
// Phase 2.15 — synthetic verification battery for the Telegram bot wiring.
//
// Spawns:
//   • a local mock Telegram API on http://127.0.0.1:7891 that captures
//     every request body so the harness can assert on it
//   • `next start` with TELEGRAM_API_BASE_URL pointing at the mock,
//     once with TELEGRAM_ENABLED=true (Phase A — 8 tests) and once with
//     TELEGRAM_ENABLED=false (Phase B — flag-off short-circuit)
//
// After all tests pass, the script cleans up Sanity test docs so the
// post-run count of telegramApprovalLog documents is 0 (modulo other
// suites running in parallel — none expected).
//
// Run after `npm run build` from the worktree.

import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {createClient} from 'next-sanity';

const APP_PORT = 3041;
const MOCK_PORT = 7891;
const APP_BASE = `http://127.0.0.1:${APP_PORT}`;
const MOCK_BASE = `http://127.0.0.1:${MOCK_PORT}`;
const TEST_SECRET = 'test-secret-fixed';
const TEST_BOT_TOKEN = '0000000000:fake-token-for-tests';
const TEST_CHAT_ID = '99999';
const TEST_EVENT_ID = 'servicem8Event-test-evt-phase-2-15';

const results = [];
function record(name, pass, detail) {
  results.push({name, pass, detail});
  console.log(`${pass ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
}

function loadEnvFromFile(path) {
  const env = {...process.env};
  const text = readFileSync(path, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

const captured = {sendMessage: [], answerCallbackQuery: [], editMessageReplyMarkup: []};
function resetCaptures() {
  captured.sendMessage = [];
  captured.answerCallbackQuery = [];
  captured.editMessageReplyMarkup = [];
}

function startMockServer() {
  let nextMessageId = 5_000_000;
  const server = createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      const path = req.url ?? '';
      let parsed = null;
      try {
        parsed = body ? JSON.parse(body) : null;
      } catch {
        parsed = null;
      }
      if (path.endsWith('/sendMessage')) {
        const id = ++nextMessageId;
        captured.sendMessage.push(parsed);
        res.writeHead(200, {'content-type': 'application/json'});
        res.end(JSON.stringify({ok: true, result: {message_id: id, chat: {id: TEST_CHAT_ID}}}));
        return;
      }
      if (path.endsWith('/answerCallbackQuery')) {
        captured.answerCallbackQuery.push(parsed);
        res.writeHead(200, {'content-type': 'application/json'});
        res.end(JSON.stringify({ok: true, result: true}));
        return;
      }
      if (path.endsWith('/editMessageReplyMarkup')) {
        captured.editMessageReplyMarkup.push(parsed);
        res.writeHead(200, {'content-type': 'application/json'});
        res.end(JSON.stringify({ok: true, result: true}));
        return;
      }
      res.writeHead(404, {'content-type': 'application/json'});
      res.end(JSON.stringify({ok: false, description: 'mock-unhandled'}));
    });
  });
  return new Promise((resolve) => {
    server.listen(MOCK_PORT, '127.0.0.1', () => resolve(server));
  });
}

async function stopMockServer(server) {
  await new Promise((resolve) => server.close(() => resolve()));
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

async function startAppServer(envOverrides) {
  const env = {
    ...loadEnvFromFile('.env.local'),
    ...envOverrides,
    PORT: String(APP_PORT),
  };
  const {createRequire} = await import('node:module');
  const requireFromCwd = createRequire(`${process.cwd()}/package.json`);
  const nextPkgPath = requireFromCwd.resolve('next/package.json');
  const nextBin = nextPkgPath.replace(/package\.json$/, 'dist/bin/next');
  const proc = spawn('node', [nextBin, 'start', '-p', String(APP_PORT)], {
    env,
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let lastErr = '';
  proc.stderr.on('data', (d) => {
    lastErr += String(d);
  });
  try {
    await waitForServer(`${APP_BASE}/api/webhooks/telegram`, 60_000);
  } catch (e) {
    proc.kill('SIGTERM');
    throw new Error(`${e.message}\n--- server stderr ---\n${lastErr.slice(-2000)}`);
  }
  return proc;
}

async function stopAppServer(proc) {
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

function makeSanityClient() {
  const env = loadEnvFromFile('.env.local');
  return createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2024-10-01',
    token: env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
  });
}

async function run() {
  console.log('[harness] starting local mock Telegram server …');
  const mock = await startMockServer();
  const sanity = makeSanityClient();
  const trackedDocIds = [];

  // Seed a synthetic servicem8Event so Test 3's webhook patch has a target.
  console.log(`[harness] creating synthetic servicem8Event ${TEST_EVENT_ID} …`);
  try {
    await sanity.delete(TEST_EVENT_ID).catch(() => {});
    const now = new Date().toISOString();
    await sanity.create({
      _id: TEST_EVENT_ID,
      _type: 'servicem8Event',
      eventId: 'test-evt-phase-2-15',
      eventType: 'job.completed',
      jobId: 'job-test-phase-2-15',
      payload: '{"synthetic":true}',
      signatureValid: true,
      receivedAt: now,
      status: 'pending',
      telegramApprovalState: 'not_sent',
      createdAt: now,
      lastUpdatedAt: now,
    });
  } catch (err) {
    console.error('[harness] failed to seed servicem8Event:', err);
    await stopMockServer(mock);
    process.exit(2);
  }

  // ─────────────── PHASE A: flag-on ───────────────
  console.log('\n[phase A] starting app with TELEGRAM_ENABLED=true …');
  resetCaptures();
  const appA = await startAppServer({
    TELEGRAM_ENABLED: 'true',
    TELEGRAM_BOT_TOKEN: TEST_BOT_TOKEN,
    TELEGRAM_OPERATOR_CHAT_ID: TEST_CHAT_ID,
    TELEGRAM_WEBHOOK_SECRET_TOKEN: TEST_SECRET,
    TELEGRAM_API_BASE_URL: MOCK_BASE,
    TELEGRAM_TEST_ROUTES_ENABLED: 'true',
  });

  let approvalMessageId = null;
  let approvalLogDocId = null;

  try {
    // Test 1 — notifyOperator
    const r1 = await fetch(`${APP_BASE}/api/test/telegram-notify`, {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({text: 'phase 2.15 test ping'}),
    });
    const j1 = await r1.json();
    const send1 = captured.sendMessage[0];
    record(
      'Test 1 — notifyOperator → 1 mock sendMessage with chat_id + text',
      r1.status === 200 &&
        j1.sent === true &&
        typeof j1.messageId === 'number' &&
        captured.sendMessage.length === 1 &&
        String(send1?.chat_id) === TEST_CHAT_ID &&
        typeof send1?.text === 'string' &&
        send1.text.includes('phase 2.15 test ping'),
      `status=${r1.status} body=${JSON.stringify(j1)} captures=${captured.sendMessage.length}`,
    );

    // Test 2 — requestApproval
    resetCaptures();
    const r2 = await fetch(`${APP_BASE}/api/test/telegram-approval`, {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({
        kind: 'servicem8_portfolio',
        targetId: TEST_EVENT_ID,
        summary: 'Synthetic test job',
      }),
    });
    const j2 = await r2.json();
    approvalMessageId = j2.messageId;
    approvalLogDocId = j2.logDocId;
    if (approvalLogDocId) trackedDocIds.push(approvalLogDocId);

    const send2 = captured.sendMessage[0];
    const buttons = send2?.reply_markup?.inline_keyboard?.[0] ?? [];
    const cb0 = buttons[0]?.callback_data ?? '';
    const cb1 = buttons[1]?.callback_data ?? '';

    let logRow = null;
    if (approvalLogDocId) {
      logRow = await sanity.fetch('*[_id == $id][0]', {id: approvalLogDocId});
    }
    record(
      'Test 2 — requestApproval → mock sendMessage with two buttons + Sanity audit row created',
      r2.status === 200 &&
        j2.sent === true &&
        typeof j2.messageId === 'number' &&
        typeof j2.logDocId === 'string' &&
        captured.sendMessage.length === 1 &&
        buttons.length === 2 &&
        cb0.startsWith(`sm8:${TEST_EVENT_ID}:`) &&
        cb1.startsWith(`sm8:${TEST_EVENT_ID}:`) &&
        cb0.endsWith(':approve') &&
        cb1.endsWith(':reject') &&
        logRow &&
        logRow.decision === 'pending' &&
        logRow.kind === 'servicem8_portfolio' &&
        logRow.targetId === TEST_EVENT_ID &&
        logRow.sentMessageId === approvalMessageId,
      `status=${r2.status} body=${JSON.stringify(j2)} captures=${captured.sendMessage.length}`,
    );

    // Test 3 — valid callback approve
    resetCaptures();
    const cbBody = {
      update_id: 1,
      callback_query: {
        id: 'cbq-1',
        from: {id: 42, username: 'tester'},
        message: {message_id: approvalMessageId, chat: {id: Number(TEST_CHAT_ID)}},
        data: `sm8:${TEST_EVENT_ID}:approve`,
      },
    };
    const r3 = await fetch(`${APP_BASE}/api/webhooks/telegram`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-telegram-bot-api-secret-token': TEST_SECRET,
      },
      body: JSON.stringify(cbBody),
    });
    const j3 = await r3.json();
    const logRow3 = await sanity.fetch('*[_id == $id][0]', {id: approvalLogDocId});
    const eventRow3 = await sanity.fetch('*[_id == $id][0]', {id: TEST_EVENT_ID});
    record(
      'Test 3 — valid callback approve → 200 + edit + ack + Sanity log + event patched',
      r3.status === 200 &&
        j3.status === 'ok' &&
        j3.decision === 'approve' &&
        j3.eventId === TEST_EVENT_ID &&
        captured.editMessageReplyMarkup.length === 1 &&
        captured.answerCallbackQuery.length === 1 &&
        logRow3?.decision === 'approve' &&
        typeof logRow3?.decidedAt === 'string' &&
        eventRow3?.telegramApprovalState === 'approved' &&
        typeof eventRow3?.processedAt === 'string',
      `status=${r3.status} body=${JSON.stringify(j3)} edit=${captured.editMessageReplyMarkup.length} ack=${captured.answerCallbackQuery.length}`,
    );

    // Test 4 — replay (idempotent dedup)
    resetCaptures();
    const r4 = await fetch(`${APP_BASE}/api/webhooks/telegram`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-telegram-bot-api-secret-token': TEST_SECRET,
      },
      body: JSON.stringify(cbBody),
    });
    const j4 = await r4.json();
    record(
      'Test 4 — replay returns 200 + deduped:true with no new mock calls',
      r4.status === 200 &&
        j4.status === 'ok' &&
        j4.deduped === true &&
        captured.editMessageReplyMarkup.length === 0 &&
        captured.answerCallbackQuery.length === 0,
      `status=${r4.status} body=${JSON.stringify(j4)} edit=${captured.editMessageReplyMarkup.length} ack=${captured.answerCallbackQuery.length}`,
    );

    // Test 5 — invalid secret
    resetCaptures();
    const r5 = await fetch(`${APP_BASE}/api/webhooks/telegram`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-telegram-bot-api-secret-token': 'wrong-secret',
      },
      body: JSON.stringify(cbBody),
    });
    const j5 = await r5.json();
    record(
      'Test 5 — wrong secret returns 401 + invalid-secret with no mock calls',
      r5.status === 401 &&
        j5.status === 'error' &&
        j5.reason === 'invalid-secret' &&
        captured.editMessageReplyMarkup.length === 0 &&
        captured.answerCallbackQuery.length === 0 &&
        captured.sendMessage.length === 0,
      `status=${r5.status} body=${JSON.stringify(j5)}`,
    );

    // Test 6 — invalid JSON
    resetCaptures();
    const r6 = await fetch(`${APP_BASE}/api/webhooks/telegram`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-telegram-bot-api-secret-token': TEST_SECRET,
      },
      body: 'not json',
    });
    const j6 = await r6.json();
    record(
      'Test 6 — invalid JSON returns 400 + invalid-json with no mock calls',
      r6.status === 400 &&
        j6.status === 'error' &&
        j6.reason === 'invalid-json' &&
        captured.editMessageReplyMarkup.length === 0 &&
        captured.answerCallbackQuery.length === 0,
      `status=${r6.status} body=${JSON.stringify(j6)}`,
    );

    // Test 7 — unparseable callback_data
    resetCaptures();
    const r7 = await fetch(`${APP_BASE}/api/webhooks/telegram`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-telegram-bot-api-secret-token': TEST_SECRET,
      },
      body: JSON.stringify({
        update_id: 2,
        callback_query: {
          id: 'cbq-2',
          from: {id: 42},
          message: {message_id: approvalMessageId, chat: {id: Number(TEST_CHAT_ID)}},
          data: 'garbage-not-our-format',
        },
      }),
    });
    const j7 = await r7.json();
    record(
      'Test 7 — unparseable callback_data returns 200 + ignored:unparseable-callback-data',
      r7.status === 200 &&
        j7.status === 'ignored' &&
        j7.reason === 'unparseable-callback-data' &&
        captured.editMessageReplyMarkup.length === 0 &&
        captured.answerCallbackQuery.length === 0,
      `status=${r7.status} body=${JSON.stringify(j7)}`,
    );

    // Test 8 — unsupported update type (regular message)
    resetCaptures();
    const r8 = await fetch(`${APP_BASE}/api/webhooks/telegram`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-telegram-bot-api-secret-token': TEST_SECRET,
      },
      body: JSON.stringify({
        update_id: 3,
        message: {message_id: 1, chat: {id: 1}, text: 'hello'},
      }),
    });
    const j8 = await r8.json();
    record(
      'Test 8 — unsupported update type returns 200 + ignored:unsupported-update-type',
      r8.status === 200 &&
        j8.status === 'ignored' &&
        j8.reason === 'unsupported-update-type',
      `status=${r8.status} body=${JSON.stringify(j8)}`,
    );
  } finally {
    await stopAppServer(appA);
  }

  // ─────────────── PHASE B: flag-off short-circuit ───────────────
  console.log('\n[phase B] starting app with TELEGRAM_ENABLED=false …');
  resetCaptures();
  const appB = await startAppServer({
    TELEGRAM_ENABLED: 'false',
    TELEGRAM_BOT_TOKEN: TEST_BOT_TOKEN,
    TELEGRAM_OPERATOR_CHAT_ID: TEST_CHAT_ID,
    TELEGRAM_WEBHOOK_SECRET_TOKEN: TEST_SECRET,
    TELEGRAM_API_BASE_URL: MOCK_BASE,
    TELEGRAM_TEST_ROUTES_ENABLED: 'true',
  });

  try {
    // Phase B Test 9 — webhook flag-off
    const rB1 = await fetch(`${APP_BASE}/api/webhooks/telegram`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-telegram-bot-api-secret-token': 'anything',
      },
      body: JSON.stringify({update_id: 99, message: {text: 'x'}}),
    });
    const jB1 = await rB1.json();
    record(
      'Phase B/Test 9 — flag-off webhook returns 200 + simulated:feature-flag, no mock calls',
      rB1.status === 200 &&
        jB1.status === 'simulated' &&
        jB1.reason === 'feature-flag' &&
        captured.editMessageReplyMarkup.length === 0 &&
        captured.answerCallbackQuery.length === 0 &&
        captured.sendMessage.length === 0,
      `status=${rB1.status} body=${JSON.stringify(jB1)}`,
    );

    // Phase B Test 10 — notifyOperator flag-off
    const rB2 = await fetch(`${APP_BASE}/api/test/telegram-notify`, {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({text: 'phase B'}),
    });
    const jB2 = await rB2.json();
    record(
      'Phase B/Test 10 — flag-off notifyOperator returns sent:false simulated:true, no mock calls',
      rB2.status === 200 &&
        jB2.sent === false &&
        jB2.simulated === true &&
        captured.sendMessage.length === 0,
      `status=${rB2.status} body=${JSON.stringify(jB2)}`,
    );
  } finally {
    await stopAppServer(appB);
  }

  await stopMockServer(mock);

  // ─────────────── Cleanup ───────────────
  console.log('\n[harness] cleanup — deleting test docs …');
  try {
    for (const docId of trackedDocIds) {
      await sanity.delete(docId).catch(() => {});
    }
    await sanity.delete(TEST_EVENT_ID).catch(() => {});
    // Belt-and-suspenders: query for any straggling logs pointing at our test target.
    const stragglers = await sanity.fetch(
      '*[_type == "telegramApprovalLog" && targetId == $id]._id',
      {id: TEST_EVENT_ID},
    );
    for (const id of stragglers) {
      await sanity.delete(id).catch(() => {});
    }
  } catch (err) {
    console.warn('[harness] cleanup warning (not fatal):', err?.message ?? err);
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
