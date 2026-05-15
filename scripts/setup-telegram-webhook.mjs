#!/usr/bin/env node
// Phase 2.15 — one-time setWebhook registration with Telegram.
//
// Run ONCE per Vercel environment (Preview, Production) after a fresh
// TELEGRAM_WEBHOOK_SECRET_TOKEN is generated or the public URL changes.
// Examples:
//   npm run telegram:setup -- https://sunsetservices.vercel.app/api/webhooks/telegram
//   npm run telegram:setup -- https://sunsetservices.us/api/webhooks/telegram
//
// Reads TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET_TOKEN from .env.local
// (parent of any worktree). Tells Telegram to deliver ONLY callback_query
// updates — defense-in-depth alongside the webhook receiver's update-type
// sniff. NOT run during phase verification; this is a manual user step.

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
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: node scripts/setup-telegram-webhook.mjs <public-webhook-url>');
    console.error('Example: node scripts/setup-telegram-webhook.mjs https://sunsetservices.vercel.app/api/webhooks/telegram');
    process.exit(1);
  }

  const env = loadEnv('.env.local');
  const token = env.TELEGRAM_BOT_TOKEN;
  const secret = env.TELEGRAM_WEBHOOK_SECRET_TOKEN;
  if (!token) {
    console.error('TELEGRAM_BOT_TOKEN is empty in .env.local');
    process.exit(1);
  }
  if (!secret) {
    console.error('TELEGRAM_WEBHOOK_SECRET_TOKEN is empty in .env.local');
    process.exit(1);
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({
      url,
      secret_token: secret,
      allowed_updates: ['callback_query'],
    }),
  });
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
