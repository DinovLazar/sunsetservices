# Phase B.09 Completion Report

**Phase:** Phase B.09 — Code — Chat rate-limiter swap (in-memory → Upstash Redis, flag-gated).
**Date:** 2026-05-18.
**Branch:** `claude/zen-grothendieck-e0cc8a` (worktree of `main`; not yet merged).
**Outcome:** **Shipped on memory mode.** `src/lib/chat/rateLimit.ts` is now backed by a `CHAT_RATELIMIT_STORE` flag that selects between the Phase 2.09 in-process `Map` (preserved bit-for-bit) and a new Upstash Redis backend (`@upstash/redis@^1.38.0`). The live code path on Vercel stays on `'memory'` until a 5-minute Cowork follow-up installs the Vercel Marketplace Upstash integration and flips the flag to `'kv'` — documented in §"User-runnable next step" below. No code re-ship needed; the swap is a single env-var change.

---

## Headline

The chat rate-limit gate (`checkRateLimit(ip)`) was deliberately designed at Phase 2.09 as a single-file swap. This phase delivers that swap. The exported API surface is now `async (ip) → Promise<RateLimitResult>` on both branches so callers don't have to know which backend is live; the type union (`{allowed: true} | {allowed: false; reason: 'burst'|'daily'; retryAfter: number}`) is unchanged in shape.

The `'memory'` branch is the Phase 2.09 logic moved verbatim into a private `checkRateLimitMemory(ip)` and wrapped in `Promise.resolve(...)`. The `'kv'` branch hits Upstash Redis via the canonical pattern: `SET chat:burst:<ip> 1 NX EX <2s>` for the burst guard (returns `'OK'` on first request, `null` when the key already exists), `INCR chat:daily:<ip>` + conditional `EXPIRE 86400` on first hit only for the daily counter, and one `TTL` round-trip on over-limit to compute `retryAfter`. The whole KV body is wrapped in a `try / catch` — any throw logs `'[ratelimit] kv check failed'` and returns `{allowed: true}` (fail-open per D6 — a transient Redis blip must not wedge the chat for every visitor).

The single caller in `src/app/api/chat/route.ts` adds the one required `await`. `git grep -n 'checkRateLimit' src/` confirms no other call sites.

A new verification harness at `scripts/test-rate-limit.mjs` (wired as `npm run test:rate-limit`) spawns `next start` on isolated ports and exercises 8 tests: T1–T4 always run against the memory backend; T5–T8 against KV cleanly skip when no `UPSTASH_REDIS_REST_URL` is in env (Cowork follow-up runs them on Preview after the integration lands). The marquee KV test is T7: 2 POSTs from a fresh IP against server boot A, kill the server, send 1 more POST against server boot B → 429 daily. This is the behavior memory mode could never give us — counters live in Redis across cold starts.

The flag `CHAT_RATELIMIT_STORE=memory` is upserted on Vercel Production + Preview as `plain` type (no sensitive value). The four Upstash credential variables (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`) are deliberately NOT pre-seeded — the Vercel Marketplace Upstash integration auto-injects them on install. Pre-seeding empty values would shadow the auto-injection.

---

## What this phase shipped

| File | Action |
|---|---|
| [src/lib/chat/rateLimit.ts](src/lib/chat/rateLimit.ts) | **Modified (Phase B.09)** single-file backend swap. Reads `CHAT_RATELIMIT_STORE` once at module load. `'memory'` → `checkRateLimitMemory(ip)` (Phase 2.09 logic preserved bit-for-bit, wrapped in `Promise.resolve(...)`). `'kv'` → `checkRateLimitKv(ip)` (lazy-init singleton `Redis` client; reads `UPSTASH_REDIS_REST_*` with `KV_REST_API_*` aliases as fallback per `@upstash/redis`'s prefix auto-detection). KV burst via `SET chat:burst:<ip> 1 NX EX <ttl>`; KV daily via `INCR chat:daily:<ip>` + conditional `EXPIRE 86400`; one `TTL` read on over-limit for retryAfter. Whole KV body in `try / catch` — fail-open with `console.error('[ratelimit] kv check failed', err)`. Unknown flag value → one-time warn + memory fallback. |
| [src/app/api/chat/route.ts](src/app/api/chat/route.ts) | **Modified (Phase B.09)** single-line change. `const rl = checkRateLimit(ip)` → `const rl = await checkRateLimit(ip)` (line 53). One-line inline comment notes the async swap. Surrounding `POST` handler was already `async`; no other call sites. |
| [scripts/test-rate-limit.mjs](scripts/test-rate-limit.mjs) | **NEW (Phase B.09)** synthetic verification battery. Spawns `next start` 2× for memory mode (T1–T4) and up to 3× for KV mode (T5–T8). Assertion model: empty `{}` body → allowed = 400 (Zod fails after the rate-limit gate), blocked = 429 with `{reason, retryAfter}` before the body is parsed. Zero Anthropic / Sanity calls, zero source edits to production code. Pre-cleanup `DEL`s the test keys via Upstash REST `pipeline` so re-runs see fresh state. Wired as `npm run test:rate-limit`. |
| [src/_project-state/Phase-B-09-Completion.md](src/_project-state/Phase-B-09-Completion.md) | **NEW (Phase B.09)** this report. |
| [package.json](package.json) | **Modified (Phase B.09)** added `"@upstash/redis": "^1.38.0"` to dependencies + `"test:rate-limit": "node scripts/test-rate-limit.mjs"` to scripts. |
| [package-lock.json](package-lock.json) | **Modified (Phase B.09)** lockfile updated for `@upstash/redis@1.38.0` + transitive `uncrypto@^0.1.3`. |
| [.env.local.example](.env.local.example) | **Modified (Phase B.09)** new "Phase B.09 — Chat rate-limit store" block documenting `CHAT_RATELIMIT_STORE` (memory|kv) and the four Upstash credential vars. Credential vars kept commented-out so an unconfigured local doesn't accidentally hit Upstash; explicit warning that pre-seeding empty values on Vercel would shadow the auto-injection. |
| `.env.local` (gitignored — local only) | **Modified (Phase B.09)** added `CHAT_RATELIMIT_STORE=memory` to keep local `npm run dev` aligned with the Vercel default. |
| [Sunset-Services-Decisions.md](Sunset-Services-Decisions.md) | **Modified (Phase B.09)** appended Phase B.09 plan-of-record (D1 store choice / D2 async API / D3 flag / D4 key schema / D5 retryAfter / D6 fail-open + path-note + Cowork follow-up) as the first commit on the branch. |
| [src/_project-state/current-state.md](src/_project-state/current-state.md) | **Modified (Phase B.09)** last-completed-phase bumped to B.09; new "What works (Phase B.09 additions)" sub-block; the **"In-memory chat rate limiter must be replaced before Phase 3.13 DNS cutover"** line under "What does NOT work yet" reframed to **"Chat rate-limit store running on 'memory'; Cowork follow-up installs Upstash Marketplace and flips `CHAT_RATELIMIT_STORE=kv` before Phase P.06"**. |
| [src/_project-state/file-map.md](src/_project-state/file-map.md) | **Modified (Phase B.09)** new "Phase B.09" section listing every NEW + MODIFIED file. |

**NOT touched:** `src/lib/chat/getIp.ts` (the IP extraction helper already lives in its own file from Phase 2.09 — the plan's note about "preserve the IP extraction helper" was a description of a different repo state). Other routes (`/api/newsletter`, `/api/contact`, `/api/quote`) — rate limiting was never wired on those surfaces (carryover, see "Carryover / off-spec notes" below). The Phase 2.09 chat `RateLimitResult` type (unchanged in shape). The chat UI 429 toast / `Retry-After` rendering (untouched on the client side — server response shape didn't change).

---

## Verification harness results (Step 6d — `npm run test:rate-limit`)

The harness boots its own `next start` instances on dedicated ports (3061 / 3062 for memory; 3063 / 3064 / 3065 for KV) and exercises `/api/chat` over real HTTP. Each rate-limit allowed request takes ~50ms (the empty `{}` body fails Zod before hitting Anthropic / Sanity).

| ID | Backend | Boot | What | Result |
|---|---|---|---|---|
| T1 | memory | A (DAILY=50, BURST=2000ms) | single POST from `1.2.3.4` → not 429 | **PASS** — got status=400 (Zod-invalid past gate) |
| T2 | memory | A | immediate 2nd POST same IP → 429 burst Retry-After: 2 | **PASS** — body=`{status:rate_limited,reason:burst,retryAfter:2}` |
| T3 | memory | A | wait 2.5s, 3rd POST same IP → not 429 | **PASS** — got status=400 (window expired) |
| T4 | memory | B (DAILY=2, BURST=2000ms) | 3 POSTs from `5.6.7.8` spaced 3s; first two not 429, third 429 daily Retry-After ~86400 | **PASS** — a=400 b=400 c=429 cRetryAfter=86394 (within 86380..86400 tolerance) |
| T5 | kv | n/a | burst from `12.12.12.12` | **SKIPPED** — UPSTASH_REDIS_REST_URL not set locally |
| T6 | kv | n/a | daily ceiling=2 from `13.13.13.13` | **SKIPPED** — UPSTASH_REDIS_REST_URL not set locally |
| T7 | kv | n/a | persistence across server restart from `14.14.14.14` | **SKIPPED** — UPSTASH_REDIS_REST_URL not set locally |
| T8 | kv | n/a | fail-open with bogus token + stderr contains `'[ratelimit] kv check failed'` | **SKIPPED** — UPSTASH_REDIS_REST_URL not set locally |

**Final result: 8 / 8 PASS (T1–T4 real assertions, T5–T8 SKIPPED because no Upstash credentials in local env — skipped is success per the harness header).**

Total harness runtime: ~55 seconds (2 next-start boots × ~12s + 3s burst-window wait + 6s × spaced-daily test).

---

## Regression checks (the 3 Phase B.04/B.05/B.06 harnesses)

Run against the `next start` build at `http://127.0.0.1:3070` (a free port — `:3000` was held by an unrelated process).

| Harness | Scope | Result |
|---|---|---:|
| `npm run validate:schema` | 22 representative URLs (JSON-LD blocks, internal `@id` resolution, absolute URLs) | **22 / 22 PASS, 0 errors, 0 warnings** |
| `npm run validate:seo` | 120 URLs + sitemap.xml + robots.txt (canonical / hreflang / robots-meta / sitemap completeness) | **120 / 120 PASS, 0 errors, 0 warnings** |
| `npm run validate:a11y` | 19 URLs (axe AA, Lighthouse a11y, WCAG 2.2 SC 2.4.11 / 2.5.8) | **19 / 19 PASS, 0 axe AA, 0 SC 2.4.11/2.5.8, all Lighthouse a11y = 100/100, 10 incomplete (manual-only, photo/gradient bg)** |

The rate-limit change is server-only — no markup, no schema, no headers, no a11y — so the three harnesses should be no-ops. They are. Confirmed.

---

## Lint / types / build

| Check | Result |
|---|---|
| `npm run lint` | **0 errors, 6 pre-existing warnings.** Identical to the Phase B.08 baseline (sanity/lib/queries.ts × 2, sanity/schemas/contactSubmission.ts × 1, src/app/[locale]/projects/[slug]/page.tsx × 1, src/components/calendly/CalendlyEmbed.tsx × 2). |
| `npx tsc --noEmit` | **0 new errors.** Same Phase 2.04 image-asset baseline (`Cannot find module '@/assets/...'` × 65 across `imageMap.ts`, `team.ts`, and 9 components — pre-existing, documented in B.04+). No new errors in `rateLimit.ts` or `route.ts`. |
| `npm run build` | **Green at 124 pages.** Build output shows `ƒ /api/chat` (Dynamic) unchanged. Turbopack compiled in ~16s; TypeScript pass clean modulo the same image-asset baseline; static-page generation 124/124 with 7 workers in ~6s. One Next.js warning about multiple lockfiles (worktree's own `package-lock.json` + the main repo's) — informational, no impact. |

---

## Vercel Preview verification

| Field | Value |
|---|---|
| Preview URL | `https://sunsetservices-q8q0p10ca-dinovlazars-projects.vercel.app` |
| Branch alias | `https://sunsetservices-git-claude-zen-groth-e42770-dinovlazars-projects.vercel.app` |
| Commit | `5524af62cc6967a64e9f0911a1db2d483610b235` (branch tip — `test(rate-limit): synthetic verification harness (Phase B.09)`) |
| Deployment id | `dpl_8mQTLGTmnevJdqC1VG5LRoWMjV6t` |
| `readyState` | `READY` |
| `CHAT_RATELIMIT_STORE` on Vercel | `memory` (`plain` type, target = Production + Preview) |
| Upstash creds on Vercel | **none** (auto-injection deferred to Cowork install) |

**Curl smoke against `/api/chat` (memory mode):**

```
POST /api/chat  (IP 8.7.6.5)  → HTTP 400 {"status":"invalid"}
POST /api/chat  (IP 8.7.6.5, immediate)  → HTTP 429 {"status":"rate_limited","reason":"burst","retryAfter":2} + Retry-After: 2
```

Memory-mode rate limiter confirmed live on Preview. The first POST passes the rate gate (then Zod-fails on empty body); the immediate second POST returns 429 with the correct shape and header.

**Regression harnesses against Preview** (with the `VERCEL_SHARE_TOKEN` 23-hour-share-link path from B.07; cookie capture worked first-try):

| Harness | Result |
|---|---:|
| `BASE_URL=<preview> VERCEL_SHARE_TOKEN=<…> npm run validate:schema` | **22 / 22 PASS, 0 errors, 0 warnings** |
| `BASE_URL=<preview> VERCEL_SHARE_TOKEN=<…> npm run validate:seo` | **120 / 120 PASS, 0 errors, 0 warnings** |
| `BASE_URL=<preview> VERCEL_SHARE_TOKEN=<…> npm run validate:a11y` | **19 / 19 PASS, 0 axe AA, 0 SC 2.4.11/2.5.8, all Lighthouse a11y = 100/100** |

Preview is byte-identical to localhost on these three gates.

---

## User-runnable next step (Cowork — activate the Upstash backend)

Phase B.09 ships the code path; activating the persistent store is a 5-minute Cowork task.

In the Vercel dashboard for the `sunsetservices` project:

```
Settings → Storage → Marketplace → Browse
  → Find "Upstash" → "Add Integration"
  → Choose "Redis (KV-compatible)" → Free tier
  → Connect to project: sunsetservices
  → Environments: Production AND Preview
  → Confirm.
```

Vercel auto-injects `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (some Marketplace versions use the `KV_REST_API_*` aliases — both are auto-detected by `@upstash/redis`).

Then, in Settings → Environment Variables:

```
CHAT_RATELIMIT_STORE
  Production: change 'memory' → 'kv'
  Preview:    change 'memory' → 'kv'
```

Trigger a redeploy of the branch tip (or merge to `main` and let the auto-deploy run) so the new env value is bound at function-instance creation time.

Verify on Preview:

```
1. curl -X POST '<preview>/api/chat' \
     -H 'X-Forwarded-For: 9.9.9.9' \
     -H 'Content-Type: application/json' \
     -d '{}'                              # → 400 invalid (allowed past rate gate)
   Repeat within 1s                       # → 429 burst, Retry-After: 2

2. Wait 20 minutes (well past Hobby cold-start window).
   Re-send a burst pair from 9.9.9.9     # → still 429 burst on the 2nd, proving
                                           # the burst key persisted in Redis
                                           # across a function-instance cold start.

3. Optional but recommended — run the full harness against Preview:
     BASE_URL=<preview> VERCEL_SHARE_TOKEN=<…> npm run test:rate-limit
   Expected: T1–T4 PASS (memory pathway not triggered since Vercel is on kv —
   actually all 8 tests run against KV-mode boots since the harness spawns its
   own next start with CHAT_RATELIMIT_STORE=kv overridden in env, but the
   credential pair must be available in the spawned process's env. If you
   passed UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN into the spawn
   environment, T5–T8 PASS too.)
```

---

## Definition of done — final check

- [x] Plan-of-record committed first (D1–D6 in `Sunset-Services-Decisions.md`).
- [x] `@upstash/redis` installed at the latest 1.x (`1.38.0`).
- [x] `src/lib/chat/rateLimit.ts` exports the new async signature.
- [x] Memory mode preserves Phase 2.09 behavior bit-for-bit (factored into private `checkRateLimitMemory`).
- [x] KV mode implements the `SET-NX-EX` + `INCR` + conditional-`EXPIRE` pattern + `TTL` only on over-limit.
- [x] Fail-open on KV error with `console.error('[ratelimit] kv check failed', err)`.
- [x] `src/app/api/chat/route.ts` awaits the new signature.
- [x] `git grep -n 'checkRateLimit' src/` shows no un-awaited call sites.
- [x] `scripts/test-rate-limit.mjs` exists; `npm run test:rate-limit` exits 0 on localhost (T1–T4 PASS; T5–T8 SKIPPED).
- [x] `npm run validate:schema`, `validate:seo`, `validate:a11y` all exit 0 on localhost AND Preview.
- [x] `npm run lint`, `npx tsc --noEmit`, `npm run build` all clean (no new errors beyond established baselines).
- [x] `.env.local.example` documents the new variables under a "Phase B.09" block.
- [x] Local `.env.local` carries `CHAT_RATELIMIT_STORE=memory`.
- [x] `CHAT_RATELIMIT_STORE=memory` upserted on Vercel Production + Preview.
- [x] No empty `UPSTASH_REDIS_REST_*` / `KV_REST_API_*` env vars added on Vercel (verified via REST API).
- [x] `current-state.md`, `file-map.md`, `Phase-B-09-Completion.md` written.
- [x] Completion report includes the user-runnable Cowork follow-up block from §10 of the plan.

---

## Carryover / off-spec notes

- **Path note in plan, resolved.** The plan continuation refers to `src/lib/chat/rate-limit.ts` (kebab-case); the live file from Phase 2.09 is `src/lib/chat/rateLimit.ts` (camelCase, per commit `2779fba`). Used the camelCase live name throughout per "live code wins."
- **"IP extraction helper" instruction in Step 2.5 didn't apply.** The plan says "Preserve the IP extraction helper and the per-IP cleanup interval from the memory implementation." The current `rateLimit.ts` has neither — IP extraction lives in its own file at `src/lib/chat/getIp.ts` (Phase 2.09), and there's no cleanup interval (the Phase 2.09 in-memory `Map`s grow unbounded — accepted at the time because the chat is SSO-protected and Hobby cold starts effectively act as a cleanup). Skipped the instruction; no change in behavior.
- **`@vercel/kv` is deliberately NOT used.** Vercel deprecated it in 2024 in favor of `@upstash/redis`. The Marketplace integration auto-injects credentials under both `UPSTASH_REDIS_REST_*` and `KV_REST_API_*` prefixes depending on install vintage; `@upstash/redis` auto-detects either. Documented in `.env.local.example` so future contributors don't try to re-add the deprecated package.
- **Other rate-limited routes still ungated.** `/api/newsletter`, `/api/contact`, `/api/quote` do NOT use `checkRateLimit`. A future small phase can extend `checkRateLimit` to those surfaces with separate key namespaces (e.g. `newsletter:burst:<ip>`). Out of scope for B.09 per the plan continuation. This is a pre-existing gap that B.09 does not introduce; it only stops the chat-side counters from disappearing on cold start.
- **Telegram-side error notification on KV failure deferred.** Fail-open logs to `console.error` only. A small follow-up after Phase M.06 (Telegram flag-on in Production) can wire `notifyOperator` for KV failures so operators know when Redis is misbehaving. For now, Vercel function logs are the only surface — acceptable while Production traffic is zero (preview is SSO-protected).
- **`SANITY_REVALIDATE_SECRET` rotation reminder.** Not B.09 carryover, just a heads-up: the Phase B.08 `SANITY_REVALIDATE_SECRET` is the same value across Production + Preview. Rotate before Phase P.06 (DNS cutover) per the B.08 carryover; B.09 inherits no new sensitive secrets so adds nothing here.
- **One Windows-host transient: npm ENOTEMPTY during the install step.** A concurrent `npm install` attempt collided with the in-flight install and partially mangled `node_modules/next/dist`. Recovered with a single `npm install --no-audit` reconciling against the lockfile (85 packages re-extracted in ~3 minutes). No code impact — just a note for anyone re-running Step 1 on Windows where multiple Claude Code worktrees share the same hardlinked `node_modules`.

---

## Next phase

With B.09 shipped, **the in-memory rate-limit carryover from Phase 2.09 is closed at the code level** — the only remaining step is the Cowork Marketplace install + flag flip documented above.

Unblocked next steps (any order):

- **Cowork: install Upstash Marketplace integration + flip `CHAT_RATELIMIT_STORE=kv`** (per the user-runnable block above; 5 minutes).
- **Cowork: configure the Sanity webhook in `manage.sanity.io`** (Phase B.08 carryover; 5 minutes; field-by-field block in `Phase-B-08-Completion.md` §"User-runnable next step").
- **Cowork: supply the 3 missing Termly doc IDs** (Phase B.03 carryover; `TERMLY_PRIVACY_ES_ID`, `TERMLY_TERMS_EN_ID`, `TERMLY_TERMS_ES_ID`).
- **Code: Phase B.10 — Address autocomplete on quote wizard Step 4.** Depends on the Google Places API key from M.04 (defer to M.05's neighborhood if M.04 hasn't landed).
- **Code: Phase B.11 — Photo upload on quote wizard Step 3.**
- **Code: Phase 2.18 — Part 2 QA + integration sweep + Part 2 completion report.**
- **Code: Phase 2.17a — GBP write client** (when Phase 2.14 lands the GBP foundation and Goran provides OAuth credentials).
- **Code: Phase M.01 — end-to-end smoke / make-it-work bucket start.**
- **Manual / user: Phase M.03 — native ES review.**
