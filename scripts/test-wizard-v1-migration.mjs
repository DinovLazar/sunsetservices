import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import {chromium} from 'playwright';

const PORT = Number(process.env.PORT || 3297);
const ENV_BASE_URL = process.env.BASE_URL;
const BASE_URL = ENV_BASE_URL || `http://127.0.0.1:${PORT}`;

async function waitForServer(url, timeoutMs = 45_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return;
    } catch {
      // keep polling
    }
    await delay(500);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function startLocalServer() {
  const {createRequire} = await import('node:module');
  const requireFromCwd = createRequire(`${process.cwd()}/package.json`);
  const nextPkgPath = requireFromCwd.resolve('next/package.json');
  const nextBin = nextPkgPath.replace(/package\.json$/, 'dist/bin/next');
  const child = spawn('node', [nextBin, 'start', '-p', String(PORT)], {
    cwd: process.cwd(),
    env: {...process.env, PORT: String(PORT)},
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', (chunk) => process.stdout.write(chunk));
  child.stderr.on('data', (chunk) => process.stderr.write(chunk));
  await waitForServer(BASE_URL);
  return child;
}

async function stopLocalServer(child) {
  if (!child) return;
  child.kill('SIGTERM');
  await delay(500);
  if (!child.killed) child.kill('SIGKILL');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  console.log('--- Wizard v1 -> v2 migration fixture ---');
  let server = null;
  if (!ENV_BASE_URL) {
    server = await startLocalServer();
  }

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'sunset_wizard_progress_v1',
        JSON.stringify({
          step1: {audience: 'residential'},
          step2: {
            selectedSlugs: ['old-slug'],
            primarySlug: 'old-slug',
            otherText: '',
          },
          step3: {timeline: 'flex'},
          savedAt: Date.now(),
        }),
      );
    });

    await page.goto(`${BASE_URL}/request-quote/`, {waitUntil: 'domcontentloaded'});
    await page.waitForSelector('form[aria-labelledby="wizard-step1-h2"]', {timeout: 15_000});
    await page.waitForTimeout(1_000);

    const state = await page.evaluate(() => {
      const v1 = window.localStorage.getItem('sunset_wizard_progress_v1');
      const v2raw = window.localStorage.getItem('sunset_wizard_progress_v2');
      const v2 = v2raw ? JSON.parse(v2raw) : null;
      const resumeVisible = Array.from(document.querySelectorAll('button')).some((button) =>
        /^(resume|reanudar)$/i.test(button.textContent?.trim() || ''),
      );
      return {
        v1,
        v2,
        resumeVisible,
        path: window.location.pathname,
        search: window.location.search,
      };
    });

    assert(state.v1 === null, 'legacy v1 key should be removed after migration');
    assert(state.v2?.step1?.division === '', 'residential audience should not infer a division');
    assert(
      Array.isArray(state.v2?.step2?.selectedSlugs) && state.v2.step2.selectedSlugs.length === 0,
      'legacy selectedSlugs should be dropped',
    );
    assert(state.v2?.step2?.primarySlug === '', 'legacy primarySlug should be dropped');
    assert(state.resumeVisible === false, 'empty migrated state should not show Resume toast');
    assert(
      state.path === '/request-quote' || state.path.endsWith('/request-quote/'),
      `visitor should remain on request-quote (got ${state.path})`,
    );
    assert(!/[?&]step=[2-5]\b/.test(state.search), 'visitor should remain on Step 1');

    console.log('PASS v1 residential selectedSlugs migrate to empty v2 state with no Resume toast');
  } finally {
    await browser.close();
    await stopLocalServer(server);
  }
}

main().catch((err) => {
  console.error('FAIL wizard v1 migration fixture:', err?.message ?? err);
  process.exit(1);
});
