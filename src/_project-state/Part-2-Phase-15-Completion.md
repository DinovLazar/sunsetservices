# Part 2 — Phase 2.15 — Completion Report

**Date:** 2026-05-15
**Phase:** Part 2 — Phase 2.15 (Code: Telegram bot infrastructure — operator notifications + approval flows)
**Status:** Complete (with two documented in-phase off-spec decisions — see "Surprises and off-spec decisions" below).
**Headline:** Phase 2.15 ships the plumbing the Phase 2.16/2.17 automation agent uses to talk to the operator over Telegram: send info messages, ask Approve/Reject questions, and receive button taps. The new `POST /api/webhooks/telegram` route is flag-gated by `TELEGRAM_ENABLED=false` and secured by Telegram's `secret_token` (echoed back in the `X-Telegram-Bot-Api-Secret-Token` header; timing-safe compared against `TELEGRAM_WEBHOOK_SECRET_TOKEN`). Outbound: `notifyOperator()` and `requestApproval()` helpers in `src/lib/telegram/notify.ts`. Sanity additions: new `telegramApprovalLog` document type (append-only audit trail, one row per outbound approval) + new `telegramMessageId` field on `servicem8Event`. Approval kind discriminator (`'servicem8_portfolio' | 'blog_draft'`) + 64-byte-safe callback_data codec at `src/lib/telegram/approvals.ts`. One-time `setWebhook` registration script at `scripts/setup-telegram-webhook.mjs` (manual user step after flag flip). Synthetic verification harness at `scripts/test-telegram-bot.mjs` spawns a local mock Telegram API + `next start` twice (flag-on + flag-off) and asserts on mock-captured bodies + Sanity audit rows + event-doc patches. All 10 tests pass; Sanity post-cleanup count is 0. No production caller of `notifyOperator` / `requestApproval` is wired this phase — Phase 2.16 (weekly SEO summary + monthly AI blog draft) and Phase 2.17 (on-demand ServiceM8 portfolio publish) wire the callers. The `'blog_draft'` kind is stub-only — Phase 2.16 extension point (5–10 line change).

---

## What shipped

| Step | Outcome |
|---|---|
| 0. Pre-flight | Clean tree on `claude/gallant-mccarthy-d5a783` from `main` at `0241a63` (Phase 2.13 merge SHA). Vercel CLI authenticated (`dinovlazar`). Sanity CLI auth valid. Phase 2.01 prereqs verified — `TELEGRAM_BOT_TOKEN` + `TELEGRAM_OPERATOR_CHAT_ID` present in parent `.env.local`; ServiceM8 webhook route at `src/app/api/webhooks/servicem8/route.ts` present (architectural model for this phase). |
| 1. Decision log | Appended `2026-05-15 — Phase 2.14 deferred → Phase 2.15 runs next` entry to `Sunset-Services-Decisions.md`. Committed FIRST, before any other change. Commit `d5bd8c1`. |
| 2. Env vars | Generated 64-hex `TELEGRAM_WEBHOOK_SECRET_TOKEN` via `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Two new env vars added to `.env.local`, `.env.local.example`, and Vercel (Production + Preview targets via REST upsert, both `plain` type): `TELEGRAM_ENABLED=false` (id `ZEYSU6TLzHrNBv59`), `TELEGRAM_WEBHOOK_SECRET_TOKEN=<64-hex>` (id `XKYeFYLkwzN4PnUG`). Third var `TELEGRAM_API_BASE_URL` documented as optional but NOT set anywhere. Commit `beded32`. |
| 3.a Sanity — servicem8Event extension | `telegramMessageId: number` field added to the Processing group of `sanity/schemas/servicem8Event.ts`. Optional; preview/subtitle unchanged. Commit `381411c`. |
| 3.b Sanity — telegramApprovalLog | New document type at `sanity/schemas/telegramApprovalLog.ts`. Single `meta` group. 9 fields (kind / targetId / sentMessageId / sentChatId / sentAt / decision / decidedAt / operatorChatId / rawCallbackData). Registered in `sanity/schemas/index.ts`. Commit `2694b31`. |
| 4. Telegram types | `src/lib/telegram/types.ts` with `TelegramInlineKeyboardButton`, `TelegramInlineKeyboardMarkup`, `TelegramSendMessageResponse`, `TelegramApiErrorResponse`, `TelegramCallbackQuery`, `TelegramUpdate`. Pure types. Commit `52c1abf`. |
| 5. Low-level client | `src/lib/telegram/client.ts` with `sendMessage`, `answerCallbackQuery`, `editMessageReplyMarkup`. Flag-gated on `TELEGRAM_ENABLED==='true'`. Flag-off → single log line + `{ok:false, simulated:true}` with no HTTP. Flag-on → POST to `<TELEGRAM_API_BASE_URL or 'https://api.telegram.org'>/bot<token>/<method>` with 10-second `AbortSignal.timeout`. Never throws — failures return `{ok:false, error}`. Commit `6adc47f`. |
| 6. Approval domain | `src/lib/telegram/approvals.ts` with `ApprovalKind` union, `encodeCallbackData` (`<kindShort>:<targetId>:<action>`, `kindShort` = `'sm8'`\|`'bd'`), `parseCallbackData` (null on malformed), `buildButtonsForKind` (`servicem8_portfolio` returns Approve/Reject pair; `blog_draft` throws as Phase 2.16 extension point). Commit `e2654f0`. |
| 7. Sanity persist helper | `src/lib/telegram/persistLog.ts` with `createApprovalLog` (writes pending row at send time) + `recordDecision` (patches operator tap). Both trap Sanity errors and return `{error}`. Commit `a6cd8a1`. |
| 8. High-level helpers | `src/lib/telegram/notify.ts` with `notifyOperator({text, parseMode?})` + `requestApproval({kind, targetId, summary})`. Both never throw. `requestApproval` composes MarkdownV2 kind-labeled message, attaches button matrix, sends, writes audit row. Successful send + failed audit write returns `{sent:true, messageId}` without `logDocId` and logs the gap. Commit `46b3a05`. |
| 9. Inbound webhook | `src/app/api/webhooks/telegram/route.ts` with `runtime='nodejs'` + `dynamic='force-dynamic'`. Flag-off → 200 + `simulated:feature-flag`. Flag-on: `crypto.timingSafeEqual` secret check (401 + invalid-secret) → JSON.parse (400 + invalid-json) → Zod-validate `callback_query` branch only (other update types 200 + ignored:unsupported-update-type) → `parseCallbackData` null → 200 + ignored:unparseable-callback-data → idempotency by `telegramApprovalLog.sentMessageId` (200 + ignored:no-matching-log if missing; 200 + deduped:true if already decided) → route by kind. For `servicem8_portfolio`: patch event doc state + processedAt, patch log row via `recordDecision`, `editMessageReplyMarkup` (remove buttons), `answerCallbackQuery` (clear spinner). Sanity/Telegram errors → 500 + opaque persist-failed (Telegram retries on 5xx → dedup branch). Commit `429b4a4`. |
| 10. Scripts | `scripts/setup-telegram-webhook.mjs` (registers webhook URL with `secret_token` + `allowed_updates: ['callback_query']`) + `scripts/get-telegram-webhook-info.mjs` (debug). Wired in `package.json` as `telegram:setup` + `telegram:info`. Manual one-time user steps. Commit `9a31159`. |
| 11. Sanity Studio redeploy | `npm run studio:deploy` succeeded (~30s build). `https://sunsetservices.sanity.studio/`. "Telegram Approval Log" appears in left navigation; `telegramMessageId` field visible in `servicem8Event` processing group. |
| 12. Test routes + harness | `src/app/api/test/telegram-notify/route.ts` + `src/app/api/test/telegram-approval/route.ts` (gated by `TELEGRAM_TEST_ROUTES_ENABLED==='true'` — production + preview return 404). `scripts/test-telegram-bot.mjs` spawns mock Telegram on port 7891 + `next start` twice. All 10 tests passed; Sanity cleanup at end leaves 0 audit rows + 0 test events. Commit `d581112`. |
| 13. Final `npm run build` | Green. 4 new ƒ-Dynamic routes (`/api/webhooks/telegram`, `/api/test/telegram-notify`, `/api/test/telegram-approval`, plus existing `/api/webhooks/servicem8`). 118 static pages unchanged. ESLint clean. |
| 14. Env state reset | Verified `.env.local` ends with `TELEGRAM_ENABLED=false` + populated `TELEGRAM_WEBHOOK_SECRET_TOKEN`. Verified Vercel Production + Preview both show the same. NOTED: `TELEGRAM_BOT_TOKEN` + `TELEGRAM_OPERATOR_CHAT_ID` are EMPTY on Vercel — Phase 2.01 leftover surfaced here, must be repopulated before flag flip. |
| 15. Project-state updates | `current-state.md`, `file-map.md`, `00_stack-and-config.md` all updated. Commit `d840808`. |
| 16. This report | Filed at `src/_project-state/Part-2-Phase-15-Completion.md`. |

---

## What works (Phase 2.15 additions)

- **`POST /api/webhooks/telegram`** is live and reachable. Flag-off (default) returns 200 + `simulated:feature-flag`; flag-on enforces secret token + Zod + dedup + Sanity patch + Telegram message edit + callback ack.
- **Outbound client** — `sendMessage`, `answerCallbackQuery`, `editMessageReplyMarkup`. All flag-gated; 10-second timeout; never throws.
- **High-level helpers** — `notifyOperator()` (one-way info) + `requestApproval()` (Approve/Reject with audit row). Both never throw; successful send + failed audit write returns `{sent:true}` without `logDocId` and logs the gap.
- **Approval kind discriminator** — `'servicem8_portfolio'` ships; `'blog_draft'` is stub-only and clearly marked as Phase 2.16 extension point.
- **Two Sanity additions** — new `telegramApprovalLog` document type + new `telegramMessageId` field on `servicem8Event`.
- **Test seam** — `TELEGRAM_API_BASE_URL` env var defaults to `https://api.telegram.org`; verification harness overrides to `http://127.0.0.1:7891` so automated tests never hit real Telegram.
- **Setup scripts** — `npm run telegram:setup -- <url>` and `npm run telegram:info`. Run ONCE per Vercel environment.

---

## Build + verification

### `npm run build`

Green. 4 ƒ-Dynamic routes registered: `/api/webhooks/telegram`, `/api/test/telegram-notify`, `/api/test/telegram-approval`, plus the existing `/api/webhooks/servicem8`. No static-page count change (`/api/*` routes don't count in the SSG total). ESLint clean on the new files.

### Verification battery (10 tests)

**Phase A — flag-on with mock Telegram server (8 tests):**

1. **notifyOperator → 1 mock sendMessage with chat_id + text.** PASS. Returns `{sent:true, messageId}`. Mock captured one `sendMessage` call with `chat_id=99999` and text containing the test payload.
2. **requestApproval → mock sendMessage with two buttons + Sanity audit row.** PASS. Returns `{sent:true, messageId, logDocId}`. Mock captured one `sendMessage` with 2 inline-keyboard buttons (callback_data starts with `sm8:<targetId>:` and ends with `:approve` / `:reject`). Sanity log row exists with `decision:'pending'`, `kind:'servicem8_portfolio'`, `sentMessageId` matching the returned ID.
3. **Valid callback approve → 200 + edit + ack + Sanity patches.** PASS. POST with valid secret + valid `sm8:<targetId>:approve` body. Returns `{status:'ok', decision:'approve', eventId}`. Mock captured one `editMessageReplyMarkup` and one `answerCallbackQuery`. Log row patched to `decision:'approve'` with `decidedAt`. Event doc's `telegramApprovalState` = `'approved'` with `processedAt` set.
4. **Replay returns 200 + deduped:true with no new mock calls.** PASS. Same body resent. Returns `{status:'ok', deduped:true}`. Mock count unchanged (`editMessageReplyMarkup`=0, `answerCallbackQuery`=0).
5. **Wrong secret returns 401 + invalid-secret with no mock calls.** PASS. Header set to `'wrong-secret'`. Returns 401 + `{status:'error', reason:'invalid-secret'}`. Mock captured nothing.
6. **Invalid JSON returns 400 + invalid-json with no mock calls.** PASS. Body `'not json'`. Returns 400 + `{status:'error', reason:'invalid-json'}`.
7. **Unparseable callback_data returns 200 + ignored.** PASS. Valid envelope, garbage `data` field. Returns 200 + `{status:'ignored', reason:'unparseable-callback-data'}` (stale-message-safe).
8. **Unsupported update type returns 200 + ignored.** PASS. POST with `{update_id, message: {...}}` (no `callback_query`). Returns 200 + `{status:'ignored', reason:'unsupported-update-type'}`.

**Phase B — flag-off short-circuit (2 tests):**

9. **Flag-off webhook returns 200 + simulated:feature-flag with no mock calls.** PASS. Even with arbitrary body + any header. No JSON parse, no secret check, no mock activity.
10. **Flag-off notifyOperator returns sent:false simulated:true with no mock calls.** PASS. Helper short-circuits at the client layer before any HTTP.

**Cleanup:** harness deletes the test `servicem8Event` doc + tracked `telegramApprovalLog` IDs + any straggling logs pointing at the test target. Post-cleanup count: 0 `telegramApprovalLog`, 0 test `servicem8Event`.

### Manual end-to-end Telegram smoke test — NOT RUN

The automated harness covers everything that can be automated. A real-Telegram smoke test (real bot sends a real message → operator taps Approve → Sanity updates) requires (a) a real Telegram chat, (b) a public URL with `setWebhook` registered, and (c) a human tapping a button. This is a user-driven step after the phase merges:

1. On the Preview deployment (or wherever the route is reachable): set `TELEGRAM_ENABLED=true` on Vercel.
2. Repopulate `TELEGRAM_BOT_TOKEN` + `TELEGRAM_OPERATOR_CHAT_ID` on Vercel (currently empty — Phase 2.01 leftover).
3. Run `npm run telegram:setup -- https://<preview-host>/api/webhooks/telegram` once.
4. Use a temporary debug script or wait for Phase 2.16 to produce a real approval. Verify the message arrives, the buttons render, and tapping one updates the corresponding Sanity row.

---

## Surprises and off-spec decisions

### 1. Test routes live at `/api/test/...` not `/api/_test/...`

The plan specified `/api/_test/telegram-notify` and `/api/_test/telegram-approval` as the test-only routes. Next 16's App Router treats folders prefixed with `_` as **private folders** (intentionally NOT routed; see Next 16 docs on project structure). Implementing the plan literally would have prevented the routes from existing at all — the harness's `fetch` against `/api/_test/...` would have hit a 404 because Next never generates a handler.

Resolution: renamed the folder to `test/`. The intent of the plan ("test infrastructure clearly marked, dead in production") is preserved through the route-level production gate (item 2 below).

### 2. Test routes gated by `TELEGRAM_TEST_ROUTES_ENABLED`, not `NODE_ENV !== 'production'`

The plan specified `if (process.env.NODE_ENV === 'production') return Response.json({status:'forbidden'}, {status: 404})`. Combined with the plan's instruction to "spawn `next start` … with TELEGRAM_ENABLED=true", this was internally inconsistent: `next start` always sets `NODE_ENV='production'`, so the gate would have blocked the harness too. The first verification run confirmed: the test routes returned 404 + `{status:'forbidden'}` under the original gate.

Resolution: switched to an explicit `TELEGRAM_TEST_ROUTES_ENABLED='true'` env-var gate. The harness sets this; Vercel Production + Preview do NOT, so the routes return 404 + `forbidden` there. Same end state as the plan's intent ("ship in the bundle but dead in production").

Both deviations are documented inline in the test-route source comments and in `00_stack-and-config.md`'s Phase 2.15 section.

### 3. Phase 2.01 leftover surfaced (not a Phase 2.15 issue, noted for visibility)

During Step 14 verification, the Vercel REST `env list` for Production + Preview showed `TELEGRAM_BOT_TOKEN` and `TELEGRAM_OPERATOR_CHAT_ID` both EMPTY despite being populated in the parent `.env.local`. Either the Phase 2.01 Vercel upsert pass skipped these or they were zeroed later. This phase did NOT touch either var (Phase 2.01 scope), but it must be remediated before the flag flips on Vercel — otherwise live calls would 401 (no token → "/bot/" segment) and `notifyOperator` would log "TELEGRAM_OPERATOR_CHAT_ID is empty" instead of sending.

Logged as a "What does NOT work yet" entry in `current-state.md` so the launch handover catches it.

### 4. Worktree environment maintenance — interrupted `npm install` left empty `prettier/`

Mid-phase, the first build attempt failed because `node_modules/prettier/` was an empty directory (an interrupted install on the parent at some prior point). `prettier` is a transitive dep of `@react-email/render` (used by `resend`). Re-ran `npm install` once at the parent to restore the package, then proceeded. Not caused by Phase 2.15 work but blocked the build until fixed.

---

## What's now possible that wasn't before

- **Phase 2.16 can wire its automation agent callers** by importing `notifyOperator` (weekly SEO summary; error alerts) and `requestApproval({kind: 'servicem8_portfolio', ...})` directly from `@/lib/telegram/notify`. No further code changes in `src/lib/telegram/*` are required.
- **Phase 2.16 can extend the kind registry to add `'blog_draft'`** — the Sanity schema enum + `ApprovalKind` union already include it; only `buildButtonsForKind` in `src/lib/telegram/approvals.ts` needs to grow a non-throwing branch (5–10 lines).
- **Phase 2.17's Telegram approval leg is fully unblocked.** When 2.17 reads a pending `servicem8Event` and wants Erick's Approve/Reject, it calls `requestApproval({kind: 'servicem8_portfolio', targetId: event._id, summary: ...})` and either polls the audit log or waits on the next event-doc poll for the patched `telegramApprovalState`. (Phase 2.17's GBP write leg still waits on Phase 2.14.)
- **The webhook is durable.** Telegram retries on 5xx; idempotency by `sentMessageId` makes replays no-ops. The route never crashes the runtime — every error path is `200|400|401|500` with a single-string `reason`.
- **The harness pattern is reusable.** Future webhook routes or Telegram-using code can drop a new mock endpoint into the `startMockServer` function and re-use the spawn-server / capture / assert / cleanup pattern.

---

## What does NOT work yet (Phase 2.15 carryovers)

- **No production caller of `notifyOperator` / `requestApproval`.** Phase 2.16 wires the weekly SEO summary + monthly AI blog draft callers; Phase 2.17 wires the on-demand ServiceM8 portfolio publish caller. A grep for `notifyOperator|requestApproval` in `src/` returns only definitions + the two test routes.
- **`'blog_draft'` approval kind is stub-only.** The Sanity schema enum + the `ApprovalKind` TS union both include it, but `buildButtonsForKind('blog_draft', ...)` throws and the webhook handler logs + ignores any `'bd:'` callback. Phase 2.16 ships the runtime.
- **`setWebhook` has NOT been called against any Vercel deployment.** The route exists on Production + Preview but Telegram doesn't know about it. Run `npm run telegram:setup -- <public-url>/api/webhooks/telegram` once per environment after flipping the flag.
- **`TELEGRAM_BOT_TOKEN` + `TELEGRAM_OPERATOR_CHAT_ID` are empty on Vercel** (Phase 2.01 leftover). Must be repopulated before flag flip.
- **`TELEGRAM_OPERATOR_CHAT_ID` currently points at Goran, not Erick.** Launch-handover step.
- **Manual end-to-end Telegram smoke test deferred.** Real bot → real chat → real human tap. User-driven step after merge.

---

## Files written or modified

### New files (15)

- `sanity/schemas/telegramApprovalLog.ts`
- `src/lib/telegram/types.ts`
- `src/lib/telegram/client.ts`
- `src/lib/telegram/approvals.ts`
- `src/lib/telegram/persistLog.ts`
- `src/lib/telegram/notify.ts`
- `src/app/api/webhooks/telegram/route.ts`
- `src/app/api/test/telegram-notify/route.ts`
- `src/app/api/test/telegram-approval/route.ts`
- `scripts/setup-telegram-webhook.mjs`
- `scripts/get-telegram-webhook-info.mjs`
- `scripts/test-telegram-bot.mjs`
- `src/_project-state/Part-2-Phase-15-Completion.md` (this report)

(Plan listed 13 new files; the test routes ended up at `/api/test/...` rather than `/api/_test/...` due to the Next 16 private-folder constraint, but the file count + intent are preserved.)

### Modified files

- `Sunset-Services-Decisions.md` (Step 1 — Phase 2.14 deferral entry appended)
- `.env.local.example` (Step 2 — Phase 2.15 block appended)
- `sanity/schemas/servicem8Event.ts` (Step 3.a — `telegramMessageId` field added)
- `sanity/schemas/index.ts` (Step 3.b — `telegramApprovalLog` registered)
- `package.json` (Step 10 — `telegram:setup` + `telegram:info` scripts)
- `src/_project-state/current-state.md` (Step 15)
- `src/_project-state/file-map.md` (Step 15)
- `src/_project-state/00_stack-and-config.md` (Step 15)

### External state changed

- **Vercel:** 2 new env vars upserted on Production + Preview, both `plain`:
  - `TELEGRAM_ENABLED=false` → id `ZEYSU6TLzHrNBv59`
  - `TELEGRAM_WEBHOOK_SECRET_TOKEN=<64-hex>` → id `XKYeFYLkwzN4PnUG`
- **Sanity project `i3fawnrl`:** `telegramApprovalLog` document type deployed to `https://sunsetservices.sanity.studio/`. `telegramMessageId` field added to existing `servicem8Event` schema. Studio rebuild ~30s.
- **Local `.env.local` (parent):** 2 new vars (`TELEGRAM_ENABLED=false`, `TELEGRAM_WEBHOOK_SECRET_TOKEN=<64-hex>`).

---

## Commit log

12 commits on `claude/gallant-mccarthy-d5a783` (plus this completion-report commit pending):

1. `d5bd8c1` — `chore(decisions): log Phase 2.14 deferral + Phase 2.15 plan-of-record`
2. `beded32` — `chore(env): document Phase 2.15 Telegram webhook variables`
3. `381411c` — `feat(sanity-schemas): +telegramMessageId on servicem8Event (Phase 2.15)`
4. `2694b31` — `feat(sanity-schemas): +telegramApprovalLog (Phase 2.15)`
5. `52c1abf` — `feat(telegram): TypeScript types for Telegram Bot API objects (Phase 2.15)`
6. `6adc47f` — `feat(telegram): low-level Bot API client with flag-gated simulation (Phase 2.15)`
7. `e2654f0` — `feat(telegram): approval kind discriminator + callback data codec (Phase 2.15)`
8. `a6cd8a1` — `feat(telegram): Sanity persist helper for approval logs (Phase 2.15)`
9. `46b3a05` — `feat(telegram): notifyOperator + requestApproval high-level helpers (Phase 2.15)`
10. `429b4a4` — `feat(api/webhooks/telegram): inbound callback receiver — flag-gated, secret-verified, idempotent (Phase 2.15)`
11. `9a31159` — `feat(scripts): setup + info scripts for Telegram webhook registration (Phase 2.15)`
12. `d581112` — `test(telegram): synthetic verification harness (Phase 2.15)`
13. `d840808` — `chore(phase-2-15): project-state updates`
14. (pending) — `chore(phase-2-15): completion report` (this report)

---

## Definition of done

- [x] Step 1 executed first — Phase 2.14 deferral entry committed to `Sunset-Services-Decisions.md` (commit `d5bd8c1`) before any other change.
- [x] All 8 Phase A mock-server tests pass.
- [x] Both Phase B flag-off short-circuit tests pass.
- [x] `npm run build` is green.
- [x] New routes appear in the build output: `/api/webhooks/telegram` + `/api/test/telegram-notify` + `/api/test/telegram-approval`, all ƒ-Dynamic.
- [x] No new ESLint errors. No new TS errors.
- [x] Test docs created during verification cleaned up. Sanity post-cleanup count: 0 `telegramApprovalLog`; 0 test `servicem8Event`.
- [x] `.env.local` ends the phase with `TELEGRAM_ENABLED=false` and `TELEGRAM_WEBHOOK_SECRET_TOKEN` populated.
- [x] Vercel Production + Preview both show the two new env vars with the expected values.
- [x] Sanity Studio shows the `telegramApprovalLog` document type in the left navigation and the new `telegramMessageId` field on `servicem8Event` in the processing group.
- [x] No production caller of `notifyOperator` or `requestApproval` exists in the codebase. (Grep returned only definitions + the two `/api/test/*` test routes.)
- [x] Completion report filed at `src/_project-state/Part-2-Phase-15-Completion.md` with all required sections.
- [x] `current-state.md`, `file-map.md`, `00_stack-and-config.md` all updated with Phase 2.15 additions.
- [x] Every in-phase off-spec decision has a matching note in this report (test-route folder name; test-route gate var; Phase 2.01 Vercel leftover surfaced). The Phase 2.14 deferral itself is in `Sunset-Services-Decisions.md` (Step 1's commit).
