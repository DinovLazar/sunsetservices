# Phase M.06 — Cowork Handover (BLOCKED — code fix required before completion)

**Status:** ⛔ NOT complete. All M.06 *configuration* is done and verified, but the
real round-trip smoke test (D3) surfaced a **code bug** in the Telegram approval
message formatting. Per locked decision **D5** ("if anything breaks during smoke …
halt and hand off to Code") and **D4** ("flip Production only AFTER Preview smoke
passes"), Cowork stopped here. **Production was NOT flipped.**

Date: 2026-05-27. Driven from Cowork by the operator (Goran).

---

## TL;DR for the next engineer

The monthly blog cron generates a draft fine, but when it calls
`requestApproval()` the **real Telegram API rejects the MarkdownV2 message**:

```
[telegram] error sendMessage: Bad Request: can't parse entities:
  Can't find end of Italic entity at byte offset 271
[blog-draft-run] requestApproval failed for docId=blogDraftPending-6340cf89-26b6-4570-a414-39c5382b6678 (simulated=false)
```

`simulated=false` confirms the `TELEGRAM_ENABLED` flag is correctly ON — this is
not a config problem. The MarkdownV2 message built in
`src/lib/automation/blog/runMonthly.ts` (the `summary` string, lines ~163–172) +
the `*Monthly AI blog draft*` label prepended in
`src/lib/telegram/notify.ts` (`requestApproval`, lines ~89–97) produces an
unbalanced italic (`_…_`) entity for at least some model-generated content. The
Phase 2.15/2.16 test harness used a **mock** Telegram server that never parsed
MarkdownV2, so this class of bug was never caught.

**Reproduction:** fetch the offending draft and inspect `dek.en` (byte offset
271 lands roughly inside the dek):

```
npx sanity documents get blogDraftPending-6340cf89-26b6-4570-a414-39c5382b6678 --dataset production
```

Likely fix area: the MarkdownV2 assembly/escaping for the approval summary
(`runMonthly.ts` summary + `escapeMarkdownV2` interaction with the `_…_`
italic wrappers, and/or the `.slice(0, 1000)` truncation which counts UTF-16
chars while Telegram counts UTF-8 bytes). Add a real-Telegram (or strict-parser)
assertion to the harness so this is caught in future.

---

## What IS done and verified (configuration — all good)

- **`TELEGRAM_BOT_TOKEN`** populated on Vercel Production + Preview (Sensitive).
  Validated live via `getMe` → `{ok:true}` (the stale "revoked token" comment in
  `.env.local` line 13–15 is WRONG — the token works; that comment should be
  removed).
- **`TELEGRAM_OPERATOR_CHAT_ID`** (`7919658849`, Goran) populated on Vercel
  Production + Preview (Sensitive). Deliverability proven by a direct
  `sendMessage` API call → `{ok:true}` and the operator received the message.
- **`TELEGRAM_WEBHOOK_SECRET_TOKEN`** confirmed already present on both targets.
- **`TELEGRAM_ENABLED`** split per environment:
  - Preview = `true`
  - Production = `false`  ← intentionally still false (D4 — do not flip until smoke passes)
- **Webhook registered** against the Preview branch alias and verified:
  - URL: `https://sunsetservices-git-chore-wire-relat-bbc2d5-dinovlazars-projects.vercel.app/api/webhooks/telegram?x-vercel-protection-bypass=<bypass>`
  - `getWebhookInfo` → `allowed_updates:["callback_query"]`, `pending_update_count:0`.
- **Reachability solved:** Vercel "Standard" Deployment Protection blocks Preview
  URLs from external callers (Telegram, curl). A **Protection Bypass for
  Automation** secret already existed (added 2026-05-16) and was appended to the
  webhook URL + used in the smoke trigger, so Telegram + manual triggers reach the
  function. The cron returning real JSON (not a Vercel login page) confirms this.

## What is NOT done

- ❌ Live approve-tap round-trip (blocked by the code bug above).
- ❌ Production flip (`TELEGRAM_ENABLED=true` on Production) — gated on smoke passing (D4).
- ❌ Production webhook registration.
- ❌ Decisions log + current-state.md "completed" updates.

---

## Deviations from the written M.06 steps (and why)

1. **Smoke driven via the real cron route, not the test route.** The doc's
   `/api/test/blog-draft-run` is hard-gated by `BLOG_AUTOMATION_TEST_ROUTES_ENABLED`,
   which is deliberately unset on Vercel (the route 404s there). The real route
   `/api/cron/blog-draft-monthly` runs the identical `executeMonthlyBlogDraftRun()`
   executor and is authed with `CRON_SECRET` (already on Vercel), so it was used
   instead. Same code path, more realistic.
2. **`TELEGRAM_ENABLED` flipped on Preview before webhook registration**, and a
   single final Preview redeploy, to avoid registering against a deployment URL
   that a later redeploy would invalidate.
3. **Deployment Protection bypass token** appended to the webhook URL + smoke
   trigger (the doc assumed the Preview URL was public; it is not).
4. **Monthly-lock handling:** the doc only anticipated a `pending-draft-exists`
   idempotency case. The executor actually uses a per-calendar-month lock
   (`blogDraftLock-YYYY-MM`). A stale `failed` lock + an orphan unpublished draft
   from an earlier failed send had to be cleared with the Sanity CLI to get a
   clean run.

---

## Current Sanity state (leftover smoke artifacts — left in place for repro)

- `blogDraftLock-2026-05` — status `failed` (claimed 23:30 UTC, send failed).
- `blogDraftPending-6340cf89-26b6-4570-a414-39c5382b6678` — status `pending`,
  unpublished, title "Best Time to Reseed Your Lawn in Aurora, IL". **This is the
  draft whose dek broke MarkdownV2 — keep it for reproduction.**
- No `blogPost` was ever published (the approve-tap never happened).

To clear these once the code is fixed and you want a clean re-test:

```
npx sanity documents delete blogDraftLock-2026-05 blogDraftPending-6340cf89-26b6-4570-a414-39c5382b6678 --dataset production
```

---

## Re-test recipe after the code fix (Preview)

1. Clear the two artifacts above (command in the previous section).
2. Trigger the cron on Preview (the bypass token is required — replace `<bypass>`
   with the `VERCEL_AUTOMATION_BYPASS_SECRET` value from Vercel → Settings →
   Deployment Protection; the `CRON_SECRET` is the value mirrored in `.env.local`):

   ```
   Invoke-WebRequest -Uri "https://sunsetservices-git-chore-wire-relat-bbc2d5-dinovlazars-projects.vercel.app/api/cron/blog-draft-monthly?x-vercel-protection-bypass=<bypass>" -Method POST -Headers @{ Authorization = "Bearer <CRON_SECRET>" } -ContentType "application/json"
   ```

   Expect `{"status":"ok","docId":"…","messageId":…}` and a Telegram message with
   ✅/✋ buttons.
3. Tap **Approve & publish** → confirm the webhook fires, a `blogPost` is created
   with the three `automated*` meta fields, and the matching `blogDraftPending`
   flips to `status:'approved'` with `publishedBlogPostId` set.
4. Clean up the test post + draft + lock.

## Then finish M.06 (Production)

Only after the Preview smoke passes (D4):

1. Set `TELEGRAM_ENABLED=true` on the **Production** target (edit the
   Production-only entry) + redeploy Production.
2. Re-register the webhook against the Production URL
   (`npm run telegram:setup -- https://sunsetservices.vercel.app/api/webhooks/telegram`).
   NOTE: Production `*.vercel.app` is ALSO behind Deployment Protection until the
   custom domain lands (P.06), so the Production webhook will likely need the same
   `?x-vercel-protection-bypass=<bypass>` suffix until then.
3. `npm run telegram:info` to verify, then write the real
   `Phase-M-06-Completion.md` + Decisions + current-state updates.

---

## Also worth fixing while in the code

- `.env.local` lines 13–15 carry a stale comment claiming `TELEGRAM_BOT_TOKEN` is
  the "original revoked token (returns HTTP 401)". It is NOT — `getMe` returns
  `{ok:true}`. Remove the misleading comment to avoid future confusion.
