# Part 2 — Phase 2.13 — Completion Report

**Date:** 2026-05-14
**Phase:** Part 2 — Phase 2.13 (Code: ServiceM8 webhook endpoint + Sanity event queue)
**Status:** Complete (with one documented in-phase off-spec decision — see "Surprises and off-spec decisions" below).
**Headline:** `POST /api/webhooks/servicem8` is shipped behind `SERVICEM8_ENABLED=false`. When the flag flips to `true` (after Erick adopts ServiceM8 and configures the webhook), the route reads the raw request bytes, verifies an HMAC-SHA256 signature against the `x-servicem8-signature` header keyed by `SERVICEM8_WEBHOOK_SECRET`, Zod-validates the body against a minimum-shape schema (literal `job.completed` eventType), and persists the event to Sanity at a deterministic `_id` (`servicem8Event-<slug(eventId)>`) so replays are idempotent. The flag-off branch returns 200 + `{status:'simulated',reason:'feature-flag'}` with no body parse, no signature check, no Sanity write. All 6 prescribed verification tests pass against `localhost:3037`; test document created during Tests 3+4 was verified in Sanity Studio then cleaned. Phase 2.17 (queue consumer — Anthropic drafting + Telegram approval + portfolio publish + GBP publish) inherits this queue unchanged.

---

## What shipped

| Step | Outcome |
|---|---|
| 0. Pre-flight | Clean tree on `claude/magical-nash-ce2238` from `main` at `694a400` (Phase 2.11 final SHA). Vercel CLI authenticated (`dinovlazar`); Sanity CLI auth valid (`npm run studio:deploy` succeeded later). Worktree env wiring documented (worktree has no `node_modules`; Node's upward resolution finds the parent install). |
| 1. Decision log | Appended Phase 2.12 deferral + Phase 2.13 plan-of-record entry to `Sunset-Services-Decisions.md`. Path decision (strip-then-review vs review-then-strip) flagged for user. Commit `1ece4c1`. |
| 2. Env vars | `.env.local.example` gains a new Phase 2.13 block with `SERVICEM8_ENABLED=false` + `SERVICEM8_WEBHOOK_SECRET=` (empty) and full documentation. The orphan `SERVICEM8_ENABLED=false` line in the feature-flags block was consolidated into the new block. Parent `.env.local` updated to the same end state. Vercel Production + Preview targets upserted via REST API (`/v10/projects/{id}/env?upsert=true`): `SERVICEM8_ENABLED` id `FcN3rF3D6ka6bgIk`, `SERVICEM8_WEBHOOK_SECRET` id `33h1znsCQkmvNcr4`. Both `plain` type. Verified via REST `env list`. Commit `3273df7`. |
| 3. Sanity schema | `sanity/schemas/servicem8Event.ts` — 3 field groups (event/processing/meta) with 12 fields. Deterministic-ID pattern enforced by the persist helper. Registered in `sanity/schemas/index.ts`. Commit `0a04014`. |
| 4. Zod schema | `src/lib/servicem8/schema.ts` — `eventId.min(1)` + `eventType: z.literal('job.completed')` + `jobId.min(1)` + `occurredAt: z.string().datetime({offset:true})` + `data: z.record(z.unknown())`. Root in default mode (off-spec — see Surprises #1). Commit `8952d22`. |
| 5. Signature verification | `src/lib/servicem8/verifySignature.ts` — `createHmac('sha256', secret).update(rawBody,'utf8').digest('hex')` + length-mismatch guard + `timingSafeEqual`. Never throws. Commit `358b359`. |
| 6. Sanity persist helper | `src/lib/servicem8/persistEvent.ts` — fetch-by-id, return duplicate-status if exists, else create with status=`pending` + telegramApprovalState=`not_sent` + createdAt + lastUpdatedAt + receivedAt all set to now. `slugifyEventId()` strips characters Sanity rejects in `_id`. Sanity errors propagate. Commit `ee575b7`. |
| 7. Route handler | `src/app/api/webhooks/servicem8/route.ts` — `runtime='nodejs'` + `dynamic='force-dynamic'`. Flag-off early return → raw-body read → signature verify (401) → JSON.parse (400) → Zod validate (400) → persist (200 or duplicate-200, opaque 500 on Sanity error). Zod error tree NOT echoed back. Commit `4d6153c`. |
| 8. Studio redeploy | `npm run studio:deploy` succeeded (~30s build). "ServiceM8 Event" appears in the `sunsetservices.sanity.studio` left navigation, empty of documents. |
| 9. In-phase Zod decision + fix | Caught by `npm run build` TS check: `validated.data.eventId` typed `unknown` due to Zod 3.25's `.passthrough()` + `flatten<T & {[k:string]:unknown}>` mapped-type interaction. Logged in Decisions log; root schema switched from `.passthrough()` to default strip mode. Commit `13c1f75`. |
| 10. Verification battery | `scripts/test-servicem8-webhook.mjs` spawns `next start` twice (flag-off + flag-on). All 6 tests passed on first run. Test document `servicem8Event-test-evt-001` verified in Sanity, then deleted (remaining count: 0). `.env.local` reset to flag-off + empty secret. Commit `99bae7e`. |
| 11. `npm run build` | Green. New `/api/webhooks/servicem8` route registered as ƒ-Dynamic in build output. No static-page count change. |
| 12. Project-state updates | `current-state.md` (Where-we-are bumped + new What works section + 4 new What does NOT work entries + Phase 2.13 commit log), `file-map.md` (7 new file entries + index.ts modification annotation), `00_stack-and-config.md` (full Phase 2.13 section). Commit `4417e5e`. |
| 13. This report | Filed at `src/_project-state/Part-2-Phase-13-Completion.md`. |

---

## What works (Phase 2.13 additions)

- **`POST /api/webhooks/servicem8`** is live and reachable. Flag-off (default) returns 200 + simulated; flag-on enforces HMAC + Zod + dedup + persist.
- **HMAC-SHA256 signature verification** with timing-safe comparison and length-mismatch guard. Mismatched / missing signature → 401 + `invalid-signature` with no Sanity write.
- **Zod-validated payload schema** — minimum shape (`eventId`, literal `'job.completed'` eventType, `jobId`, ISO-8601 `occurredAt`, `data` record). Validation failure → 400 + `invalid-payload` (Zod tree NOT echoed back).
- **Deterministic-ID dedup.** Replays return 200 + `deduped:true` without a second write. Sanity error returns opaque 500 + `persist-failed` (error logged server-side only).
- **`servicem8Event` Sanity document type** visible in Studio left navigation. 3 field groups; deterministic `_id` pattern; receivedAt-desc ordering; reference field for Phase 2.17 to wire `relatedProjectId` later.
- **Two new env vars** documented + provisioned in `.env.local`, `.env.local.example`, and Vercel Production + Preview. Both `plain` type (empty secret until flag-on).
- **Reusable synthetic test harness** at `scripts/test-servicem8-webhook.mjs`. Run after `npm run build` to re-verify the route on future changes.

---

## Build + verification

### `npm run build`

Green. New ƒ-Dynamic route `/api/webhooks/servicem8` added. Static page count unchanged (`/api/*` routes don't count in the SSG total). Phase 2.05 carryover `MISSING_MESSAGE: blog.category.null` warnings unchanged.

### Verification battery (6 tests)

Run: `node scripts/test-servicem8-webhook.mjs` (after `npm run build`).

| # | Setup | Expected | Got |
|---|---|---|---|
| 1 | `SERVICEM8_ENABLED=false`, any body, no signature | 200 + `{status:'simulated',reason:'feature-flag'}` | ✓ matched |
| 2 | `SERVICEM8_ENABLED=true`, valid body, no `x-servicem8-signature` | 401 + `{status:'error',reason:'invalid-signature'}` | ✓ matched |
| 3 | Flag-on, valid body + valid sig (eventId `test-evt-001`) | 200 + `{status:'ok',sanityDocId:'servicem8Event-test-evt-001'}` | ✓ matched |
| 4 | Flag-on, replay Test 3 verbatim | 200 + `{status:'ok',deduped:true,sanityDocId:'servicem8Event-test-evt-001'}` | ✓ matched |
| 5 | Flag-on, `not json` + valid sig (computed on raw bytes) | 400 + `{status:'error',reason:'invalid-json'}` | ✓ matched |
| 6 | Flag-on, `{}` + valid sig | 400 + `{status:'error',reason:'invalid-payload'}` | ✓ matched |

### Sanity verification

After Tests 3 + 4: exactly **1** `servicem8Event` document at `_id=servicem8Event-test-evt-001` with:
- `eventId: 'test-evt-001'`
- `eventType: 'job.completed'`
- `jobId: 'job-001'`
- `signatureValid: true`
- `status: 'pending'`
- `telegramApprovalState: 'not_sent'`
- `receivedAt: '2026-05-14T19:56:09.080Z'` (server-generated at write time)
- `payload: '{"eventId":"test-evt-001","eventType":"job.completed","jobId":"job-001","occurredAt":"2026-05-14T12:00:00.000Z","data":{"photos":[]}}'` (raw body verbatim)

Document deleted after verification. Sanity post-cleanup count: 0 `servicem8Event` docs.

### Local env reset

- `.env.local`: `SERVICEM8_ENABLED=false`, `SERVICEM8_WEBHOOK_SECRET=` (empty). Verified.
- Worktree-temporary `.env.local` (copied in for the `npm run build` page-data-collection step) removed.

---

## Surprises and off-spec decisions

1. **Zod root schema dropped `.passthrough()`** (logged in `Sunset-Services-Decisions.md` 2026-05-14). The plan specified `z.object({...}).passthrough()` on the root with `data: z.record(z.unknown()).passthrough()` on the inner. Build failed at TS check: `validated.data.eventId` is typed `unknown` because Zod 3.25's `.passthrough()` output type intersects the declared shape with `{[k:string]:unknown}` and then runs the result through `objectUtil.flatten`, whose `keyof T`-driven mapped type collapses declared properties to `unknown` (the well-known TS index-signature × mapped-type pathology). Default Zod mode (silent-strip extras) already satisfies the plan's stated rationale ("ServiceM8 can ship extra fields without rejection") and the route stores `rawBody` verbatim as `payload` so extras are preserved on disk regardless of schema mode. Resolution: root is `z.object({...})` (default strip), inner `data` is `z.record(z.unknown())` (already permissive). Behavior unchanged — extras still don't reject the request; they just don't end up in the parsed output (which the route doesn't need them in).
2. **`occurredAt` is in PersistInput but not stored as a separate field.** The plan says "Call `persistServiceM8Event({…, occurredAt})`" but the persist helper writes only the event-group fields per the schema (which don't include `occurredAt`). Resolution: `occurredAt` is preserved verbatim in the `payload` blob; PersistInput accepts it for forward compatibility and to honor the plan's contract; persist helper documents inline that it's intentionally not stored separately. Minor; no decisions-log entry needed.
3. **Test script committed** (`scripts/test-servicem8-webhook.mjs`) as a reusable harness. The plan's verification checklist documented the 6 tests in prose; the harness makes them runnable. Mirrors the Phase 2.05 + 2.11 pattern of committing useful scripts. No decisions-log entry needed.
4. **`SERVICEM8_ENABLED=false` was already in `.env.local.example`** as a forward-looking placeholder (originally added in some earlier phase without documentation). Phase 2.13 consolidated it into the new Phase 2.13 block at the bottom and removed the orphan line. Trivial cleanup; documented in `file-map.md` annotation. No decisions-log entry needed.
5. **Worktree had no `node_modules`** before the verification step. The first `npm run build` succeeded via Node's upward resolution (parent's `node_modules`); the test harness was updated to use `require.resolve('next/package.json')` for the same reason rather than hard-coding the binary path. Worktree-temporary `.env.local` was copied in to make `npm run build`'s page-data-collection step able to instantiate the Sanity write client at module load time; removed after the build + verification completed.

---

## What's now possible that wasn't before

- **Real ServiceM8 webhooks can be received the moment Erick adopts ServiceM8.** Flip `SERVICEM8_ENABLED=true` + populate `SERVICEM8_WEBHOOK_SECRET` with the value ServiceM8 generates → the route starts ingesting events. No code rework. The decision logged 2026-05-10 ("ServiceM8 adoption deferred") set up exactly this future, and Phase 2.13 closes the gap.
- **Replay-safe event ingestion.** ServiceM8's retry-on-5xx behavior is normal across webhook providers; the deterministic `_id` makes every replay a no-op write (returns the existing `sanityDocId` with `deduped:true`). Phase 2.17 reads pending events without worrying about double-processing the same `eventId`.
- **Webhook signature is opt-in for the route** — the route returns 401 on any missing or wrong signature, and never falls through to a Sanity write. When the secret is empty (flag-off + secret-empty), the verifier returns false unconditionally and no event lands. Phase 2.17 consumes only events written under valid signatures, so a misconfiguration can't taint the queue.
- **Phase 2.17 has its input queue.** Pending `servicem8Event` documents with `status='pending'` and `telegramApprovalState='not_sent'` are exactly what Phase 2.17's consumer needs to read. Phase 2.17's drafting agent will project from `payload` (the raw JSON blob) rather than the typed projection in event-group fields, so the schema doesn't need to widen if ServiceM8's body shape evolves.

---

## What does NOT work yet (Phase 2.13 carryovers)

- **No real ServiceM8 events flow today.** Erick has not adopted ServiceM8 — the webhook endpoint is shipped behind `SERVICEM8_ENABLED=false` so it no-ops until adoption. Verified synthetically only.
- **Phase 2.17 (queue consumer) not yet built.** Pending events will sit in the queue waiting for the consumer to read them. Reading is Phase 2.17's job.
- **Signature header name (`x-servicem8-signature`) is an assumption pending confirmation** at flag-on time. ServiceM8's actual webhook configuration UI will spell out the exact header name + signature format. If reality differs, the swap is a one-function change in `src/lib/servicem8/verifySignature.ts`. Likely a Phase 2.17a follow-up if needed.
- **`[TBR]` prefix still visible on ES routes** — inherited from the Phase 2.12 deferral logged 2026-05-14. Two paths forward (strip-then-review vs review-then-strip); hard latest moment to pick a path is before Phase 3.12 (pre-cutover QA).
- **Webhook secret is currently empty** on both `.env.local` and Vercel. When Erick adopts ServiceM8 and the real webhook configures, populate `SERVICEM8_WEBHOOK_SECRET` and re-save the Vercel var with `--sensitive` so it doesn't appear in the dashboard view.

---

## Files written or modified

### New files

- `sanity/schemas/servicem8Event.ts` — Sanity ServiceM8 Event document type (12 fields across event/processing/meta groups).
- `src/lib/servicem8/schema.ts` — Zod validation schema (minimum shape).
- `src/lib/servicem8/verifySignature.ts` — HMAC-SHA256 verifier with timing-safe compare.
- `src/lib/servicem8/persistEvent.ts` — Sanity persist helper with deterministic-ID dedup.
- `src/app/api/webhooks/servicem8/route.ts` — Webhook POST handler (flag-gated, signature-verified, idempotent).
- `scripts/test-servicem8-webhook.mjs` — Synthetic verification harness for the 6 prescribed tests.
- `src/_project-state/Part-2-Phase-13-Completion.md` — this report.

### Modified files

- `sanity/schemas/index.ts` — registered `servicem8Event` in `schemaTypes`.
- `.env.local.example` — new Phase 2.13 block + orphan `SERVICEM8_ENABLED=false` consolidated.
- `Sunset-Services-Decisions.md` — 2 new entries (Phase 2.12 deferral + Zod `.passthrough()` drop).
- `src/_project-state/current-state.md` — Where-we-are bumped, new What works section, new What does NOT work entries, Phase 2.13 commit log.
- `src/_project-state/file-map.md` — 7 new file entries + index.ts annotation.
- `src/_project-state/00_stack-and-config.md` — full Phase 2.13 section.

### External state changed

- **Sanity project `i3fawnrl`** — `servicem8Event` document type deployed to `sunsetservices.sanity.studio` via `npm run studio:deploy`. 1 test document created during Tests 3+4 then deleted; cleanup verified (count returns to 0).
- **Vercel** — 2 new env vars on Production + Preview targets: `SERVICEM8_ENABLED=false` (id `FcN3rF3D6ka6bgIk`), `SERVICEM8_WEBHOOK_SECRET=` (id `33h1znsCQkmvNcr4`). Both `plain` type (secret stays plain until populated with a real value, at which point re-save with `--sensitive`).
- **Parent `.env.local`** — orphan `SERVICEM8_ENABLED=false` (no comment) consolidated into a new Phase 2.13 block with `SERVICEM8_WEBHOOK_SECRET=` (empty). End state matches `.env.local.example`.

---

## Commit log

9 commits on `claude/magical-nash-ce2238` (plus this completion-report commit pending):

1. `1ece4c1` — `chore(decisions): log Phase 2.12 deferral + Phase 2.13 plan-of-record`
2. `3273df7` — `chore(env): document Phase 2.13 ServiceM8 webhook variables`
3. `0a04014` — `feat(sanity-schemas): +servicem8Event (Phase 2.13)`
4. `8952d22` — `feat(servicem8): zod validation schema (Phase 2.13)`
5. `358b359` — `feat(servicem8): HMAC-SHA256 signature verification (Phase 2.13)`
6. `ee575b7` — `feat(servicem8): Sanity persist helper with deterministic-ID dedup (Phase 2.13)`
7. `4d6153c` — `feat(api/webhooks/servicem8): webhook route — flag-gated, signature-verified, idempotent (Phase 2.13)`
8. `13c1f75` — `chore(decisions): log Phase 2.13 Zod root .passthrough() drop + fix schema` (in-phase off-spec decision)
9. `99bae7e` — `test(servicem8): synthetic webhook verification script (Phase 2.13)`
10. `4417e5e` — `chore(phase-2-13): project-state updates`
11. (pending) — `chore(phase-2-13): completion report` (this report)

---

## Definition of done

- [x] Step 1 executed first — Phase 2.12 deferral entry committed to `Sunset-Services-Decisions.md` before any code change.
- [x] All 6 verification tests pass on `localhost:3037`.
- [x] `servicem8Event` document type appears in the `sunsetservices.sanity.studio` left navigation.
- [x] Test document(s) created during Tests 3–4 cleaned up from Sanity (final count: 0).
- [x] `SERVICEM8_ENABLED=false` + empty `SERVICEM8_WEBHOOK_SECRET` set on Vercel Production + Preview.
- [x] `SERVICEM8_ENABLED=false` + empty `SERVICEM8_WEBHOOK_SECRET` reset in local `.env.local` post-testing.
- [x] `npm run build` green — no TS errors, no new ESLint errors. New `/api/webhooks/servicem8` route registered as ƒ-Dynamic.
- [x] No code path in this phase imports Telegram, Anthropic SDK, GBP, Places, or any Phase 2.17 / 2.14 / 2.16 surface. Phase 2.13 ingests + persists only.
- [x] Completion report filed at `src/_project-state/Part-2-Phase-13-Completion.md` with all required sections.
- [x] `current-state.md`, `file-map.md`, `00_stack-and-config.md` updated.
- [x] Every in-phase off-spec decision has a matching entry in `Sunset-Services-Decisions.md` (Zod `.passthrough()` drop logged as a stand-alone entry).
