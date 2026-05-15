# Phase 2.17 Completion Report

**Phase:** Part 2 — Phase 2.17 (Code: automation agent Part B — on-demand ServiceM8 → portfolio publish pipeline, Telegram-approval leg)
**Date:** 2026-05-15
**Branch:** `claude/bold-mclaren-4009dc` from `main` at `6fe6326` (Phase 2.16 merge SHA)
**Commits:** 20 (decisions log → env → schemas → extractor → photo uploader → drafter → shared module refactor → persist → orchestrator → webhook trigger → GBP stubs → publish/reject → publish type fix → telegram branch → test routes → drafter robustness fix → harness → off-spec decisions log → project-state → this report)

---

## Headline

Phase 2.17 ships the **Telegram-approval leg of the on-demand ServiceM8 → portfolio publish pipeline** end-to-end. The Phase 2.13 webhook now triggers `runPortfolioDraftPipeline(eventDocId)` via Next 16's `after()` post-response callback once a `job.completed` event lands. The pipeline projects job metadata from the stored payload, downloads attachment photos best-effort, uploads successes to Sanity assets, generates a bilingual portfolio entry via Anthropic Sonnet 4.6, persists as a `portfolioDraftPending` Sanity doc, and asks Erick over Telegram with Approve / Reject buttons. Approve creates a live `project` document immediately (`project-<proposedSlug>` deterministic _id with `createOrReplace` for idempotency), patches both the pending doc and source event to `'approved'`, and calls the GBP write stubs. Reject flips both docs to `'rejected'` (terminal — no auto-retry). The Google Business Profile write legs (`uploadPhotosToGbp` + `createGoogleBusinessPost`) ship as stubs returning `{skipped:true,reason:'gbp-deferred'}` and gate on `GBP_PORTFOLIO_PUBLISH_ENABLED='true'` — they activate when Phase 2.17a wires the real GBP client after Phase 2.14 lands (Google's GBP API approval + Goran's OAuth handoff). The whole pipeline lives behind `PORTFOLIO_DRAFT_ENABLED=false` (Phase 2.17 default) so production stays a no-op until Erick adopts ServiceM8 and the flags flip. All 12 verification tests pass, including the four real-Anthropic happy-path tests (~$0.20 total per harness run).

---

## What shipped

| Step  | What                                                                                           | Files (new / modified)                                                                                                                  |
| ----- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Decisions log: Phase 2.17 plan-of-record (BEFORE any code)                                     | `Sunset-Services-Decisions.md`                                                                                                          |
| 2     | Env vars + Vercel REST upsert: `PORTFOLIO_DRAFT_ENABLED`, `GBP_PORTFOLIO_PUBLISH_ENABLED`      | `.env.local.example`, parent `.env.local`                                                                                               |
| 3     | Sanity schema: `portfolioDraftPending` + `project.automated*` extension; Studio redeployed     | `sanity/schemas/portfolioDraftPending.ts` (new), `sanity/schemas/project.ts`, `sanity/schemas/index.ts`                                  |
| 4     | Job metadata extractor with defensive fallbacks                                                | `src/lib/automation/portfolio/extractJobMetadata.ts` (new)                                                                              |
| 5     | Photo download + Sanity asset upload helper                                                    | `src/lib/automation/portfolio/uploadPhotos.ts` (new)                                                                                    |
| 6     | Anthropic portfolio drafter (Sonnet 4.6, structured JSON, Zod-validated)                       | `src/lib/automation/portfolio/draft.ts` (new)                                                                                           |
| 7     | Shared `toPortableTextBlocks` extraction + Sanity persist helper for portfolio drafts          | `src/lib/automation/shared/toPortableTextBlocks.ts` (new), `src/lib/automation/blog/persistDraft.ts`, `src/lib/automation/portfolio/persistDraft.ts` (new) |
| 8     | Pipeline orchestrator                                                                          | `src/lib/automation/portfolio/runPipeline.ts` (new)                                                                                     |
| 9     | Webhook post-response `after()` trigger                                                        | `src/app/api/webhooks/servicem8/route.ts`                                                                                               |
| 10    | GBP write stubs deferred to 2.17a                                                              | `src/lib/automation/portfolio/gbpPublish.ts` (new)                                                                                      |
| 11    | Publish + reject handlers (live project + audit patches + GBP call)                            | `src/lib/automation/portfolio/publish.ts` (new)                                                                                         |
| 12    | Webhook `'servicem8_portfolio'` decision branch (replaces Phase 2.15 stub)                     | `src/app/api/webhooks/telegram/route.ts`                                                                                                |
| 13    | Test routes (pipeline-run + decision)                                                          | `src/app/api/test/portfolio-pipeline-run/route.ts` (new), `src/app/api/test/portfolio-decision/route.ts` (new)                          |
| 14    | Verification harness — 12 tests, all pass                                                      | `scripts/test-portfolio-automation.mjs` (new)                                                                                           |
| 15    | Build verification — 118 pages green, 2 new ƒ-Dynamic routes, no new TS/ESLint errors          | (no file changes)                                                                                                                       |
| 16    | In-phase off-spec decisions logged                                                             | `Sunset-Services-Decisions.md`                                                                                                          |
| 17    | Project-state updates                                                                          | `src/_project-state/{current-state,file-map,00_stack-and-config}.md`                                                                    |
| 18    | This completion report                                                                         | `src/_project-state/Part-2-Phase-17-Completion.md` (new)                                                                                |

---

## What works

### Portfolio-draft pipeline (fully end-to-end, flag-gated)

- **`POST /api/webhooks/servicem8`** unchanged for the happy path (raw-body → signature verify → Zod validate → persist with deterministic `_id`). After the persist, registers an `after()` callback that fires `runPortfolioDraftPipeline(persisted.sanityDocId)`. The webhook response (200 + sanityDocId) ships BEFORE the callback runs — ServiceM8 never waits on the ~30–60-second Anthropic call.
- **`runPortfolioDraftPipeline()`** at `src/lib/automation/portfolio/runPipeline.ts` executes the full sequence:
  1. Feature-flag gate (`PORTFOLIO_DRAFT_ENABLED!=='true'` → `simulated:feature-flag`).
  2. Fetch the source `servicem8Event` doc. Missing → `noop:source-event-missing`. Already handled (`telegramApprovalState !== 'not_sent'`) → `noop:source-event-already-handled`.
  3. Time-based idempotency check — any pending `portfolioDraftPending` with the same `sourceEventId` AND `generatedAt > now() - 1 day` → `noop:pending-draft-exists`.
  4. `extractJobMetadata(event.payload)` — defensively projects jobUuid / description / address / attachment URLs / inferred audience+service+location.
  5. `uploadJobPhotos(metadata.attachmentUrls)` — best-effort download + Sanity asset upload. Returns `{uploaded, failed}`.
  6. Featured-image fallback — first uploaded asset OR Phase 2.16 shared placeholder.
  7. `generatePortfolioDraft({jobMetadata, photoCount})` — Anthropic Sonnet 4.6, structured JSON, Zod-validated.
  8. `persistPortfolioDraft({...})` — writes the new `portfolioDraftPending` doc.
  9. `requestApproval({kind:'servicem8_portfolio', targetId: pendingDocId, summary})` — MarkdownV2 Telegram approval with title + dek + audience + service + location + photo stats.
  10. Patch the pending doc with `telegramMessageId` + `telegramApprovalLogId` (from the approval result).
  11. Flip the source event's `telegramApprovalState` to `'pending'`.
- **Error handling**: any exception triggers a best-effort `notifyOperator({text:'⚠️ Portfolio draft pipeline failed: <message>'})` alert + rethrow. The caller (webhook `after()` or test route) converts to a 500.

### Telegram `'servicem8_portfolio'` approval decision branch (closes Phase 2.15 stub)

- **Webhook `'servicem8_portfolio'` branch** in `/api/webhooks/telegram` is rewired. `targetId` is now the `portfolioDraftPending._id` (was the source event _id in the Phase 2.15 stub).
- **Approve**: `publishPortfolioDraft(targetId)` reads the pending doc, `createOrReplace`s the live `project` doc with deterministic `_id` (`project-<proposedSlug>`), best-effort GROQ lookup of `services[]` (by `slug.current + audience`) and `city` (by `slug.current`) — skipped on miss so the operator finishes in Studio. Maps draft `dek`→`shortDek`, body PortableText→`narrative` (flattened to localizedText via `joinBodyToText`), `title`→`leadAlt`. Sets `publishedAt` + the three `automated*` meta fields. Patches the pending doc to `status='approved'` with `publishedProjectId`. Flips source event's `telegramApprovalState` to `'approved'`. Calls the GBP write stubs and patches `meta.gbpUploadResult` with the summary string. The webhook then records the decision via `recordDecision`, edits the original Telegram message to remove buttons, answers the callback to clear the spinner, and posts a reply-threaded "✅ Published portfolio entry `<projectId>`\nGBP upload: skipped (gbp-deferred)" follow-up via Telegram's `reply_parameters`.
- **Reject**: `rejectPortfolioDraft(targetId)` flips the pending doc to `'rejected'` with `processedAt` + flips the source event's `telegramApprovalState` to `'rejected'` (terminal — no auto-retry). The webhook records the decision, edits + acks + posts "✋ Portfolio draft rejected. Source event marked as rejected." as a threaded reply.
- **Decision-branch errors return 200 (NOT 500)** with body `{status:'error',reason:'handler-failed',message}` after `notifyOperator` + `answerCallbackQuery('Error — see operator log')`. Suppresses Telegram retries against known-bad state (e.g. the pending doc was already approved on a prior retry). Different policy than the Phase 2.16 `'blog_draft'` branch. Documented in the route's doc comment.
- **Idempotency**: webhook's pre-tap log-row check (`logRow.decision !== 'pending'`) prevents repeated execution of publish/reject when Telegram retries.

### GBP write legs (stubbed; Phase 2.17a)

- **`uploadPhotosToGbp({assetUrls, caption})`** and **`createGoogleBusinessPost({title, body, primaryPhotoAssetUrl, ctaUrl})`** at `src/lib/automation/portfolio/gbpPublish.ts`. Both named functions exported with typed signatures. Both gate on `GBP_PORTFOLIO_PUBLISH_ENABLED='true'` AND credential presence (`GBP_OAUTH_CLIENT_ID` + `GBP_OAUTH_CLIENT_SECRET` + `GBP_OAUTH_REFRESH_TOKEN`). At Phase 2.17 defaults (all unset/false), both return `{skipped:true,reason:'gbp-deferred'}`. TODO comment block at the top points at Phase 2.17a. Call sites in `publish.ts` stay unchanged when 2.17a swaps the bodies.
- **`summarizeGbpResult(result)`** helper converts the typed result to a short audit string (`'skipped:gbp-deferred'` / `'ok'` / `'error:<message>'`) for the pending doc's `gbpUploadResult` field.

### Drafter robustness (in-phase additions)

- **Balance-braces JSON extractor** in `extractJsonString` handles trailing prose after the JSON object. Anthropic occasionally appends commentary after the JSON; the new walker strips fences, finds the first `{`, balances `{`/`}` while tracking quoted strings + escapes, and returns the first complete top-level object.
- **Server-side taxonomy backfill** via `backfillTaxonomy(parsed, metadata)` merges the inferred `audience`/`serviceSlug`/`locationSlug` from `extractJobMetadata` onto the model output BEFORE Zod validation if the model omitted them. Sonnet 4.6 occasionally drops these for sparse descriptions (harness Test 11 reproduced consistently). Hints originate from the deterministic extractor and were also sent to the model in the prompt — backfilling just enforces the "always include all three" contract server-side. Bogus values still trigger the Zod whitelist + corrective-retry path.

### Shared module extraction

- **`src/lib/automation/shared/toPortableTextBlocks.ts`** — exports `toPortableTextBlocks` + `makeKey`. Factored out of Phase 2.16's blog drafter so both blog and portfolio persist helpers use identical PortableText shape. Blog's `persistDraft.ts` re-exports `toPortableTextBlocks` for backwards compatibility.

### Test infrastructure

- **Two test-only routes**: `/api/test/portfolio-pipeline-run` (drives `runPortfolioDraftPipeline` directly; supports `?probe=extract` query mode that runs `extractJobMetadata` against the body's `payload` field without touching the pipeline) and `/api/test/portfolio-decision` (POST `{pendingDocId, decision}` invokes `publishPortfolioDraft` / `rejectPortfolioDraft` directly, bypassing the Telegram webhook). Both gated by `PORTFOLIO_AUTOMATION_TEST_ROUTES_ENABLED='true'` (unset on Vercel → 404 + forbidden). Reuse Phase 2.16's `TEST_ROUTES_SECRET` — no new shared secret.
- **Verification harness** at `scripts/test-portfolio-automation.mjs` — 12 tests against a mock Telegram on port 7893 + a `next start` test server (multiple flag configurations). Pre-run cleanup sweeps test-prefixed docs. Cleanup at end deletes every tracked doc + stray `telegramApprovalLog` rows. Total Anthropic cost per run: ~$0.20.

---

## Build + verification

`npm run build` — **green at 118 pages**. 2 new ƒ-Dynamic routes registered: `/api/test/portfolio-pipeline-run`, `/api/test/portfolio-decision`. Total ƒ-Dynamic API routes = 16 (14 from Phase 2.16 + 2 new). No new TypeScript errors. No new ESLint errors (the 7 pre-existing lint findings — all in files I did NOT touch — confirmed not regressions by checking out the Phase 2.16 merge SHA `6fe6326` and re-linting unchanged files). No new MISSING_MESSAGE warnings beyond the Phase 2.05 baseline.

### Verification tests (12/12 pass)

| #  | Test                                                                                          | Result | Detail                                                                                                                                                                                                                                                |
| -- | --------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1  | Webhook trigger short-circuit: PORTFOLIO_DRAFT_ENABLED=false → simulated, no Anthropic        | ✓      | `status=200 body={"status":"simulated","reason":"feature-flag"} captures=0`                                                                                                                                                                            |
| 2  | Test-route auth: missing Authorization → 401 + invalid-auth                                   | ✓      | `status=401 body={"status":"error","reason":"invalid-auth"}`                                                                                                                                                                                           |
| 3  | Test-route flag-off: PORTFOLIO_AUTOMATION_TEST_ROUTES_ENABLED unset → 404 + forbidden          | ✓      | `status=404 body={"status":"forbidden"}`                                                                                                                                                                                                               |
| 4  | Happy path (2 photos): real Anthropic + pending lands + 2 gallery + Telegram captures buttons | ✓      | Real Anthropic call, pending doc landed status=pending, sourceEventId matched, gallery.len=2, photoStats={uploaded:2,failed:0}, sourceEvent.state=pending, mock captured 1 sendMessage with 2 buttons starting `sm8:<pendingDocId>:` and ending `:approve`/`:reject` |
| 5  | Happy path (0 photos): real Anthropic + pending lands + featuredImage falls back to placeholder | ✓    | Real Anthropic call, pendingDoc featuredImage._ref == Phase 2.16 placeholder asset _id (`image-648e4685798f5366f028b41f5d829ef82f32a563-1280x720-jpg`), gallery=[], photoStats={uploaded:0,failed:0}                                                  |
| 6  | Idempotency replay: same event within 1 day → noop, no new Anthropic, no new pending          | ✓      | `status=noop reason=source-event-already-handled` (post-Test-4 the source event is in `'pending'` state, which short-circuits before the time-based check fires — either reason satisfies the "no second Anthropic call" intent)                       |
| 7  | Source event already handled: pre-pending state → noop, no Anthropic call                     | ✓      | `status=noop reason=source-event-already-handled captures=0`                                                                                                                                                                                            |
| 8  | Approve handler: project + automated* meta + flipped pending + flipped source + GBP skipped   | ✓      | `projectId=project-<slug>`, pending.status=approved, pending.publishedProjectId=projectId, source.state=approved, gallery.len=2, all 3 automated* fields populated, gbpUpload=`skipped:gbp-deferred`                                                  |
| 9  | Reject handler: pending → rejected, source event → rejected, no project created                | ✓      | Real Anthropic call (fresh pending for Test 9), then reject → pending.status=rejected processedAt set, source.state=rejected                                                                                                                           |
| 10 | GBP stubs return skipped:gbp-deferred when GBP_PORTFOLIO_PUBLISH_ENABLED=false                | ✓      | `pending.gbpUploadResult=skipped:gbp-deferred`                                                                                                                                                                                                          |
| 11 | Photo download best-effort: 1 good + 1 404 → pipeline does not throw, photoStats reflect partial | ✓   | Real Anthropic call, `gallery.len=1`, `photoStats={uploaded:1,failed:1}`                                                                                                                                                                                |
| 12 | Metadata extractor: 4 payloads (full / sparse / empty / malformed) — no throws, correct inference on full | ✓ | Full: `inferredLocationSlug=naperville`, `inferredAudience=hardscape`, `inferredServiceSlug=patios-walkways`; sparse: `inferredAudience=residential`, `inferredServiceSlug=lawn-care`; empty + malformed: all-null fallbacks                       |

Sanity post-run state: 0 `portfolioDraftPending` test docs (cleaned), 0 test `project` docs (cleaned), 0 test `servicem8Event` docs (cleaned), 0 stray `telegramApprovalLog` rows pointing at test targets (swept).

Sanity Studio: new "Portfolio Draft (Pending)" entry visible in `sunsetservices.sanity.studio/` left navigation. `project` schema gained the new readonly "Automation" field group with the three automation fields.

---

## Surprises + off-spec decisions

Five in-phase off-spec decisions, all logged in `Sunset-Services-Decisions.md`:

1. **`portfolioDraftPending.meta.photoStats` object field added.** Plan's Test 11 spec flagged this as potentially off-spec. Added because the harness needed to assert on the failure count for the partial-download test, and surfacing `{uploaded, failed}` on the pending doc lets the operator diagnose flaky ServiceM8 attachment URLs without grepping logs.

2. **Server-side taxonomy backfill in the Anthropic drafter.** Sonnet 4.6 occasionally drops the three taxonomy fields for sparse descriptions (harness Test 11 reproduced this consistently across two separate runs — two consecutive retries both omitted the fields). The `backfillTaxonomy()` helper merges the inferred values onto the model output before Zod validation. Hints originate from the deterministic extractor; backfilling just enforces the "always include all three" contract server-side. Bogus values still trigger Zod whitelist + corrective-retry.

3. **Robust JSON extraction in the drafter.** Replaced the simple Markdown-fence-strip in `extractJsonString` with a balance-braces parser. Added because Anthropic occasionally appended trailing prose after the JSON object (one harness run hit "Unexpected non-whitespace character after JSON at position 2913"). The walker handles quoted strings + escapes and falls back to the original behavior on malformed input.

4. **Project schema field mapping is adaptive.** The existing `project` schema (Phase 1.16) uses `services[]` references and `city` reference — no `serviceSlug` / `locationSlug` fields. `publishPortfolioDraft` looks up service + location docs by slug + audience via GROQ and populates references on hit (skipped on miss; operator finishes in Studio). `dek`→`shortDek`, body PortableText→`narrative` (flattened to localizedText), `title`→`leadAlt`. `publishedAt` is set even though it's not in the schema (Sanity is schemaless at runtime; harmless).

5. **`?probe=extract` query mode on the pipeline-run test route.** Test 12 spec called for unit-style testing of `extractJobMetadata` against 4 hand-crafted payloads. Adding a third test route just for that would have exceeded the plan's "2 new ƒ-Dynamic test routes" count. Instead, the existing route accepts `?probe=extract` which short-circuits at the request-body parse step and calls the extractor directly. Same auth + flag gate.

---

## What's now possible

- **One-tap on-demand portfolio publishing.** Erick gets a Telegram message per ServiceM8 `job.completed` event with a full bilingual portfolio entry preview + Approve / Reject buttons. Approve creates a live SEO-indexed `/projects/<slug>/` page in seconds. Zero CMS work required to maintain a growing portfolio.
- **Defensive against ServiceM8 payload variance.** `extractJobMetadata` falls back to `null` for every field with documented lookup orders. Even a payload missing every assumed field won't crash the pipeline — the model gets the hints it has and the operator can reject + fix in Studio.
- **Best-effort photo handling.** A flaky ServiceM8 attachment URL doesn't fail the whole publish. The pending doc carries `photoStats` so the operator can see what was downloaded vs. lost.
- **Auto-fallback to placeholder image.** Zero successful photo downloads still produces a usable portfolio entry with the shared Phase 2.16 placeholder asset. Operator swaps a curated photo from Sanity Studio post-publish.
- **Audit trail for every auto-published project.** Each `project` carries `automatedSourceEventId` + `automatedGeneratedAt` + `automatedModelUsed`. The matching `portfolioDraftPending` row carries the full pre-publish content + Telegram message IDs + decision timestamps + photo download stats + GBP outcome summary.
- **Phase 2.17a is a single-file follow-up.** When Phase 2.14 lands the GBP write client + Goran provides the OAuth credentials, swapping the two stub bodies in `src/lib/automation/portfolio/gbpPublish.ts` is the entire Phase 2.17a scope. Call sites in `publish.ts` stay unchanged.

---

## What does NOT work yet (carryovers)

- **No real ServiceM8 events flow today.** Erick has not adopted ServiceM8. Both `SERVICEM8_ENABLED` and `PORTFOLIO_DRAFT_ENABLED` are `false` on Vercel; the pipeline activates only when both flip on.
- **GBP photo upload + Google Post creation stubbed.** `uploadPhotosToGbp` and `createGoogleBusinessPost` return `{skipped:true,reason:'gbp-deferred'}` until Phase 2.17a swaps the bodies (after Phase 2.14 lands the GBP write client + Goran's OAuth handoff).
- **ServiceM8 payload shape is an assumption.** Phase 2.13's Zod schema is permissive on `payload.data`; we have no real-traffic sample. Defensive extraction with documented lookup orders, but re-confirm at flag-on time.
- **No ServiceM8 API client yet.** Inline attachment URLs only. If Erick's real ServiceM8 webhook delivers photo references that require an API fetch (vs. embedded URLs), a small ServiceM8 API client addition would be needed. Cross-check at flag-on time.
- **No native ES review of auto-generated portfolio entries** (inherited from Phase 2.12 deferral). The drafter produces idiomatic Latin-American Spanish, prefixed with `[TBR]`. The first-pass ES folds into the Phase 2.12 native-review queue when Phase 2.12 runs.
- **Telegram-side draft editing is out of scope.** Approve / Reject only — no "make it shorter" reply support. Reject is terminal for the source event (no auto-retry).
- **Manual real-Telegram + real-ServiceM8 smoke deferred to post-merge** (and post-Erick-adopts-ServiceM8). The harness mocks Telegram and synthesizes ServiceM8 events; a real-traffic smoke can only happen after Erick adopts ServiceM8 and the flags flip.

---

## Files written or modified

### New files

- `sanity/schemas/portfolioDraftPending.ts` (235 lines)
- `src/lib/automation/portfolio/extractJobMetadata.ts` (184 lines)
- `src/lib/automation/portfolio/uploadPhotos.ts` (128 lines)
- `src/lib/automation/portfolio/draft.ts` (335 lines)
- `src/lib/automation/portfolio/persistDraft.ts` (81 lines)
- `src/lib/automation/portfolio/runPipeline.ts` (231 lines)
- `src/lib/automation/portfolio/gbpPublish.ts` (89 lines)
- `src/lib/automation/portfolio/publish.ts` (289 lines)
- `src/lib/automation/shared/toPortableTextBlocks.ts` (72 lines)
- `src/app/api/test/portfolio-pipeline-run/route.ts` (78 lines)
- `src/app/api/test/portfolio-decision/route.ts` (76 lines)
- `scripts/test-portfolio-automation.mjs` (~600 lines)
- `src/_project-state/Part-2-Phase-17-Completion.md` (this file)

### Modified files

- `sanity/schemas/project.ts` — +1 new "Automation" field group, +3 readonly automation fields
- `sanity/schemas/index.ts` — register `portfolioDraftPending`
- `src/lib/automation/blog/persistDraft.ts` — import + re-export `toPortableTextBlocks` from the new shared module
- `src/app/api/webhooks/servicem8/route.ts` — import `after` from `next/server` + `runPortfolioDraftPipeline`; register `after()` callback in the happy path
- `src/app/api/webhooks/telegram/route.ts` — replace `'servicem8_portfolio'` stub with real Phase 2.17 handler; +2 new imports (`publishPortfolioDraft` + `rejectPortfolioDraft`, `notifyOperator`)
- `.env.local.example` — Phase 2.17 env block
- `Sunset-Services-Decisions.md` — 2 new entries (plan-of-record + in-phase off-spec additions)
- `src/_project-state/current-state.md` — Phase 2.17 sections; phase labels rolled
- `src/_project-state/file-map.md` — 19 new/modified entries
- `src/_project-state/00_stack-and-config.md` — Phase 2.17 section appended

---

## External state changed

- **Sanity Studio redeployed** via `npm run studio:deploy`. New "Portfolio Draft (Pending)" left-nav entry visible at `https://sunsetservices.sanity.studio/`. `project` schema gained the new readonly "Automation" field group (3 fields).
- **Vercel env vars upserted** on Production + Preview targets:
  - `PORTFOLIO_DRAFT_ENABLED=false` (plain, id `WIseQFbqCGYi68mj`)
  - `GBP_PORTFOLIO_PUBLISH_ENABLED=false` (plain, id `4Bw7UctghGS3QusM`)
- **`PORTFOLIO_AUTOMATION_TEST_ROUTES_ENABLED`** documented in `.env.local.example` but deliberately UNSET on Vercel. Only the verification harness sets it on the spawned test server.

---

## Commit log

```
381a6b1 chore(decisions): log Phase 2.17 plan-of-record
f7a2837 chore(env): document Phase 2.17 portfolio pipeline variables
5821c5f feat(sanity-schemas): +portfolioDraftPending; project.automated* (Phase 2.17)
49f143e feat(portfolio-automation): job metadata extractor with defensive fallbacks (Phase 2.17)
876660b feat(portfolio-automation): photo download + Sanity asset upload helper (Phase 2.17)
0f24f9d feat(portfolio-automation): Anthropic draft generator (Phase 2.17)
02bbca5 refactor(automation): extract toPortableTextBlocks to shared module (Phase 2.17)
f53a7e0 feat(portfolio-automation): Sanity persist helper for portfolio drafts (Phase 2.17)
223a261 feat(portfolio-automation): pipeline orchestrator (Phase 2.17)
f1a430e feat(api/webhooks/servicem8): wire post-response portfolio pipeline trigger (Phase 2.17)
7d03454 feat(portfolio-automation): GBP write stubs deferred to Phase 2.17a (Phase 2.17)
31f8f14 feat(portfolio-automation): publish + reject handlers (Phase 2.17)
71f50b1 fix(portfolio-automation): narrow createOrReplace input type (Phase 2.17)
92ac261 feat(api/webhooks/telegram): wire 'servicem8_portfolio' decision branch (Phase 2.17)
fb45b6d feat(api/test): portfolio pipeline + decision routes (Phase 2.17)
a6701e6 fix(portfolio-automation): robust JSON extraction + taxonomy backfill (Phase 2.17)
5be835d test(portfolio-automation): synthetic verification harness (Phase 2.17)
9cd9963 chore(decisions): log Phase 2.17 in-phase off-spec additions
a3dd0db chore(phase-2-17): project-state updates
<this report> chore(phase-2-17): completion report
```

---

## Definition of done — checklist

- [x] Step 1 ran first — Decisions log entry committed BEFORE any code change (`381a6b1`)
- [x] All 12 verification tests pass (12/12 — see Build + verification section above)
- [x] Sanity Studio left navigation shows "Portfolio Draft (Pending)" entry; `project` schema gained the new readonly "Automation" field group
- [x] `PORTFOLIO_DRAFT_ENABLED=false` + `GBP_PORTFOLIO_PUBLISH_ENABLED=false` set on Vercel Production + Preview. `PORTFOLIO_AUTOMATION_TEST_ROUTES_ENABLED` deliberately UNSET on Vercel.
- [x] `.env.local` matches the Vercel shape at end of phase. Test-route flag NOT in `.env.local` after the harness runs.
- [x] Test-created Sanity docs cleaned (post-run count: 0 test `portfolioDraftPending` / 0 test `project` / 0 test `servicem8Event` / 0 stray `telegramApprovalLog` rows pointing at test targets).
- [x] `npm run build` green; 2 new ƒ-Dynamic test routes registered; no new TypeScript errors; no new ESLint errors (7 pre-existing findings confirmed not regressions); no new MISSING_MESSAGE warnings.
- [x] No code path imports from Phase 2.14 (Places API / GBP write client). GBP calls go through the stubbed `gbpPublish.ts` only.
- [x] `'servicem8_portfolio'` webhook branch verified end-to-end via the harness — Tests 8 (Approve creates project) and 9 (Reject flips status).
- [x] Phase 2.16 placeholder asset reused by Test 5 (zero-photo path) — same asset `_id` as the Phase 2.16 verification produced.
- [x] Photo download best-effort verified by Test 11.
- [x] Completion report filed at `src/_project-state/Part-2-Phase-17-Completion.md` (this file).
- [x] `current-state.md`, `file-map.md`, `00_stack-and-config.md` updated.
- [x] Every in-phase off-spec decision has a matching entry in `Sunset-Services-Decisions.md` — (1) plan-of-record at start, (2) five in-phase additions logged at end (photoStats / taxonomy backfill / robust JSON / adaptive schema mapping / probe-mode route).
- [x] Branch pushed; PR ready for merge to `main` (next step after this commit).

---

**Phase 2.17 complete.** Ready for merge to `main`. Phase 2.17a (GBP write-leg implementation) is the one-shot follow-up after Phase 2.14 lands. Phase 2.18 (Part 2 QA + integration sweep + Part 2 completion report) is the next phase.
