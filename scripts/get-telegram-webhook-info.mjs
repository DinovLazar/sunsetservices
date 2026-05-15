#!/usr/bin/env node
// Phase 2.15 — print the current webhook config Telegram has on file.
// Useful for debugging mismatches between Vercel deployments + DNS cutover.
// Run with: npm run telegram:info

import {readFileSync} from 'node:fs';

function loadEnv(path) {
  const text = readFileSync(path, 'utf8');
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

async function main() {
  const env = loadEnv('.env.local');
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('TELEGRAM_BOT_TOKEN is empty in .env.local');
    process.exit(1);
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
  if (!json.ok) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
