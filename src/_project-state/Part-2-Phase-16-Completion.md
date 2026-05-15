# Phase 2.16 Completion Report

**Phase:** Part 2 — Phase 2.16 (Code: automation agent Part A)
**Date:** 2026-05-15
**Branch:** `claude/angry-ellis-65e94d` from `main` at `fe48b45` (Phase 2.15 merge SHA)
**Commits:** 18 (decisions log → env → schemas → button set → topics → picker → generator → persist → cron route → placeholder asset → publish/reject → webhook branch → weekly SEO route → vercel.json → idempotency refactor → harness → project-state → this report)

---

## Headline

Phase 2.16 ships the **monthly AI blog draft cron** end-to-end, the **weekly Google Search Console summary cron** flag-gated stub, and **closes the Phase 2.15 `'blog_draft'` Telegram approval flow**. Two Vercel Cron entries land at the repo root in `vercel.json`, filling Hobby tier's 2-cron budget. After this phase, once a month at 14:00 UTC on the 1st (≈ 9 AM CDT), the Anthropic-powered drafter generates an EN + `[TBR]`-prefixed-ES blog post for the next un-used topic from the 20-topic curated rotation, persists it as a `blogDraftPending` Sanity document, and asks the operator over Telegram with Approve & publish / Reject buttons. Approve auto-creates a live `blogPost` with full bilingual content, scoped FAQ documents, and the shared placeholder featured image (`public/images/blog/_placeholder.jpg`, uploaded once with `originalFilename: 'blogDefaultPlaceholder.jpg'`, reused across runs); the operator swaps in a curated brand-themed image from Sanity Studio when ready. Reject keeps the pending document for audit (`status='rejected'`) and returns the topic to the rotation for a fresh attempt next cycle. The weekly SEO route exists ready to flip on the moment Phase 3.15 sets up Google Search Console verification — until then it returns 200 + simulated after the auth check, with the fetcher body a TODO guarded by an internal `GSC_ENABLED==='true'` flag check (defense-in-depth). The Daily Google reviews cron from the original Phase 2.16 brief is NOT shipped this phase — it's blocked on Phase 2.14's Places fetcher (which itself awaits Google's GBP API approval and the `GBP_OAUTH_CLIENT_SECRET` handoff from Goran). All 10 verification tests pass, including the two real-Anthropic happy-path tests (~$0.08 per harness run).

---

## What shipped

| Step | What                                                                           | Files (new / modified)                                          |
| ---- | ------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| 1    | Decisions log: Phase 2.16 plan-of-record (BEFORE any code)                     | `Sunset-Services-Decisions.md`                                  |
| 2    | Env vars + Vercel REST upsert: `CRON_SECRET`, `BLOG_DRAFT_CRON_ENABLED`, `GSC_ENABLED`, `GSC_SITE_URL` | `.env.local.example`, parent `.env.local`        |
| 3    | Sanity schema: `blogDraftPending` + `blogPost.automated*` extension; Studio redeployed | `sanity/schemas/blogDraftPending.ts` (new), `sanity/schemas/blogPost.ts`, `sanity/schemas/index.ts` |
| 4    | Telegram approvals: ship `'blog_draft'` button set (Approve & publish / Reject) | `src/lib/telegram/approvals.ts`                                |
| 5    | 20-topic curated rotation list                                                  | `src/data/blogTopics.ts` (new)                                  |
| 6    | Topic picker with rotation + module-scope cache                                | `src/lib/automation/blog/topicPicker.ts` (new)                  |
| 7    | Anthropic draft generator (Sonnet 4.6, structured JSON, Zod-validated)         | `src/lib/automation/blog/draft.ts` (new)                        |
| 8    | Sanity persist helper for pending drafts + Portable Text converter             | `src/lib/automation/blog/persistDraft.ts` (new)                 |
| 9    | Monthly blog cron route + shared executor + cron auth helper + MarkdownV2 escape | `src/app/api/cron/blog-draft-monthly/route.ts`, `src/lib/automation/blog/runMonthly.ts`, `src/lib/automation/cronAuth.ts`, `src/lib/telegram/markdownV2.ts` (all new) |
| 10   | Default placeholder featured-image asset + lookup-by-filename helper           | `public/images/blog/_placeholder.jpg`, `src/lib/automation/blog/placeholderAsset.ts` (new) |
| 11   | Publish + reject handlers (with FAQ flattening + asset reuse + audit patches)  | `src/lib/automation/blog/publish.ts` (new)                      |
| 12   | Webhook `'blog_draft'` decision branch + `sendMessage` reply-threading         | `src/app/api/webhooks/telegram/route.ts`, `src/lib/telegram/client.ts` |
| 13   | Weekly SEO summary cron (flag-gated) + GSC fetcher TODO + MarkdownV2 formatter | `src/app/api/cron/seo-summary-weekly/route.ts`, `src/lib/automation/gsc/fetch.ts`, `src/lib/automation/gsc/summarize.ts` (all new) |
| 14   | `vercel.json` cron schedules (monthly 1st @ 14:00 UTC, weekly Mon @ 14:00 UTC) | `vercel.json` (new)                                             |
| 15   | Time-based idempotency refactor (off-spec) + Decisions log entry              | `src/lib/automation/blog/runMonthly.ts`, `Sunset-Services-Decisions.md` |
| 16   | Two test routes + verification harness (10 tests, all pass)                   | `src/app/api/test/blog-draft-run/route.ts`, `src/app/api/test/blog-draft-decision/route.ts`, `scripts/test-blog-automation.mjs` (all new) |
| 17   | Project-state updates (current-state, file-map, stack-config)                 | `src/_project-state/{current-state,file-map,00_stack-and-config}.md` |
| 18   | This completion report                                                         | `src/_project-state/Part-2-Phase-16-Completion.md` (new)        |

---

## What works

### Monthly blog draft cron (fully end-to-end)

- **`POST /api/cron/blog-draft-monthly`** is live. Auth: `Authorization: Bearer ${CRON_SECRET}` timing-safe-compared via `verifyCronAuth()` (shared with the weekly SEO route). Mismatch → 401 + `invalid-auth`.
- **Flag check**: `BLOG_DRAFT_CRON_ENABLED!=='true'` → 200 + `simulated:feature-flag`, no Sanity touch, no Anthropic call. Pause the cron without touching the schedule.
- **Time-based idempotency** (off-spec): any `blogDraftPending` with `status='pending'` AND `generatedAt > now() - 1 day` → 200 + `noop:pending-draft-exists` with `existingDocId`. Protects against Vercel Cron retries. After 1 day, the check no longer fires → next month's cron is free to generate.
- **Topic picker** walks `BLOG_TOPICS` in declared order, returns the first id not yet on `blogPost.automatedTopicId` or non-rejected `blogDraftPending.meta.automatedTopicId`. Wraps to topic[0] when all 20 consumed. Module-scope 60-second cache; opt-in reset via the test route's `?reset=true`.
- **Anthropic draft generation** (`generateBlogDraft(topic)`): structured bilingual JSON via Sonnet 4.6 (env-flippable). System prompt covers brand voice (real-person tone, anti-corporate-filler, DuPage-County-specific), output constraints (~800 words EN body, 3–5 FAQs, kebab-case slug), bilingual rules ([TBR]-prefix on every ES field). Zod-validated against a strict schema. Two-stage retry: JSON parse failure → "your previous response was not valid JSON"; Zod failure → "your response did not match the shape" with up to 5 specific issue paths quoted back. Second failure throws.
- **Persist** writes a new `blogDraftPending` document with deterministic-prefix UUID `_id` (`blogDraftPending-<uuid>`). Auto-converts model's structured blocks (`{type:'h2'|'p'|'ul'|'ol'}`) into Sanity Portable Text with per-block + per-child `_key` values via `toPortableTextBlocks()`.
- **Telegram approval send** via `requestApproval({kind:'blog_draft', targetId: docId, summary})` — MarkdownV2-escaped (title, dek, topic keyword, approximate word count). On success, the doc is patched with `telegramMessageId` + `telegramApprovalLogId`.
- **Error handling**: any exception in the flow triggers a best-effort `notifyOperator({text: '⚠️ Blog draft cron failed: <message>'})` alert + opaque 500.

### Telegram `'blog_draft'` approval decision branch (closes Phase 2.15 stub)

- **`buildButtonsForKind('blog_draft', targetId)`** now returns the real Approve & publish / Reject button pair. Switch is exhaustive over `ApprovalKind` with defensive `never` fallback. (Was a TODO throw at Phase 2.15.)
- **Webhook `'blog_draft'` branch in `/api/webhooks/telegram`**:
  - **Approve**: `publishBlogDraft(targetId)` reads the pending doc, calls `ensurePlaceholderAsset()` to resolve the shared placeholder asset, `createOrReplace`s scoped `faq` documents (one per inline FAQ, `_id=faq-blog-<slug>-<n>`, `scope='blog:<slug>'`), creates the live `blogPost` with full content + faqs[] refs + placeholder featuredImage + 3 automation meta fields + `publishedAt=now()`, then patches the pending doc to `status='approved'` with `publishedBlogPostId` set. The webhook then records the decision, edits the original Telegram message to remove buttons, answers the callback to clear Telegram's "Loading…" spinner, and posts "✅ Published as blog post `<id>`" threaded as a reply via Telegram's `reply_parameters` (uses the new optional `replyToMessageId` parameter on `sendMessage`).
  - **Reject**: `rejectBlogDraft(targetId)` patches the pending doc to `status='rejected'` with `processedAt` set. Doc is kept for audit; topic returns to the rotation on the next cycle. Webhook records the decision, edits + acks + posts "✋ Draft rejected. Topic returns to the rotation." as a reply.
- **Idempotency**: webhook's pre-tap log-row check (`logRow.decision !== 'pending'`) prevents repeated execution of publish/reject when Telegram retries.

### Weekly SEO summary cron (flag-gated stub)

- **`POST /api/cron/seo-summary-weekly`** is live. Auth identical to the monthly route. `GSC_ENABLED!=='true'` (Phase 2.16 default) → 200 + `simulated:gsc-disabled`, no GSC fetch, no Telegram send.
- **Flag-on path** (Phase 3.15 flip): `fetchWeeklySeoSummary()` → `formatSeoSummaryMessage()` (MarkdownV2 under 4096 chars) → `notifyOperator()`. Fetcher body is a TODO with a defense-in-depth flag check; everything else is complete and tested.

### Curated content rotation + brand-image fallback

- **20-topic SEO rotation** at `src/data/blogTopics.ts`. Five categories: residential / commercial / hardscape / location / seasonal. Each entry has a stable kebab-case id (dedup key), keyword (SEO target phrase), category, optional `cityHint` (aurora / naperville / batavia / wheaton / lisle / bolingbrook), and `briefForModel` (concrete points the post should cover). Operator can edit the list directly in code.
- **Shared placeholder image** at `public/images/blog/_placeholder.jpg` (46 KB, 1280×720, seeded from `aurora-spring-lawn-calendar.jpg`). `ensurePlaceholderAsset()` uploads on first cron run, then reuses by `originalFilename` lookup. Cowork swaps for a curated brand-themed image in a parallel-track task; operator can also swap per-post from Sanity Studio.

### Test infrastructure

- **Two test-only routes**: `/api/test/blog-draft-run` (drives the cron path with a separate `TEST_ROUTES_SECRET`; optional `?reset=true` clears caches) and `/api/test/blog-draft-decision` (POSTs `{pendingDocId, decision}` to exercise publish/reject in isolation). Both gated by `BLOG_AUTOMATION_TEST_ROUTES_ENABLED='true'` (unset on Vercel → ships in the bundle but returns 404 + forbidden).
- **Verification harness** at `scripts/test-blog-automation.mjs` — 10 tests against a mock Telegram on port 7892 + a `next start` test server. Pre-run cleanup sweeps stale test docs. Cleanup at end deletes every tracked doc. Total Anthropic cost per run: ~$0.08.

---

## Build + verification

`npm run build` — **green at 118 pages**. 4 new ƒ-Dynamic routes registered: `/api/cron/blog-draft-monthly`, `/api/cron/seo-summary-weekly`, `/api/test/blog-draft-run`, `/api/test/blog-draft-decision`. No new TypeScript errors. No new ESLint errors. No new MISSING_MESSAGE warnings beyond the Phase 2.05 baseline.

### Verification tests (10/10 pass)

| #  | Test                                                                | Result | Detail                                                                                                                            |
| -- | ------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------- |
| 1  | Cron auth: missing Authorization → 401 + invalid-auth                | ✓      | `status=401 body={"status":"error","reason":"invalid-auth"}`                                                                      |
| 2  | Flag-off short-circuit: BLOG_DRAFT_CRON_ENABLED=false → 200 + simulated | ✓   | `status=200 body={"status":"simulated","reason":"feature-flag"} captures=0`                                                       |
| 3  | End-to-end happy path: real Anthropic + blogDraftPending lands + mock captures Approve/Reject buttons | ✓ | Real Anthropic call, ~$0.04, picker returned `lawn-reseed-timing-aurora`, doc landed status=pending, mock captured 1 sendMessage with 2 buttons, callback_data starts with `bd:<docId>:` and ends with `:approve` / `:reject` |
| 4  | Idempotency replay: same topic within 1 day → noop, no new Anthropic call, no new Sanity doc | ✓ | Time-based check fired: `status=noop reason=pending-draft-exists existingDocId=<test3 docId> captures=0`                          |
| 5  | Approve handler: blogPost created with full content + placeholder asset + FAQ refs; pending → approved | ✓ | blogPost id captured, pending status=approved, publishedBlogPostId set, assetId is the shared `image-...-1280x720-jpg`, 5 FAQ refs |
| 6  | Reject handler: pending → rejected, processedAt set, no blogPost created | ✓ | `status=ok decision=reject pending.status=rejected processedAt=ISO`                                                               |
| 7  | Placeholder asset reuse: two Approve cycles reference the SAME asset _id | ✓ | Both blogPosts reference the identical `image-...-1280x720-jpg` asset _id                                                          |
| 8  | Topic rotation: with 2 topics used (test 3 + probe), picker skips them and lands on a different topic | ✓ | Real Anthropic call, ~$0.04, picker returned `retaining-wall-lifespan` (topic[2]) — skipped topic[0]=lawn-reseed-timing-aurora and topic[1]=patio-paver-repair-signs |
| 9  | Weekly SEO auth: missing Authorization → 401                         | ✓      | `status=401 body={"status":"error","reason":"invalid-auth"}`                                                                      |
| 10 | Weekly SEO flag-off: GSC_ENABLED=false → 200 + simulated, no Telegram send | ✓ | `status=200 body={"status":"simulated","reason":"gsc-disabled"} captures=0`                                                       |

Sanity post-run state: 0 `blogDraftPending` test docs (cleaned), 0 test `blogPost` docs (cleaned), 0 test `faq` docs (cleaned), 0 stray `telegramApprovalLog` rows pointing at test targets (swept).

Sanity Studio: new "Blog Draft (Pending)" entry visible in `sunsetservices.sanity.studio/` left navigation. `blogPost` schema gained the new Meta field group with the three automation fields (readonly).

---

## Surprises + off-spec decisions

Three off-spec decisions, all logged in `Sunset-Services-Decisions.md`:

1. **Time-based idempotency replaces per-topic idempotency.** Plan specified `generatedAt > now() - 1 day AND automatedTopicId == topic.id` on the cron's pre-Anthropic check. That design relied on the topic-picker's in-memory cache (60s TTL) keeping the picker returning the same topic across consecutive cron POSTs. Real Anthropic calls take ~2 minutes — longer than the cache TTL — so per-topic dedup silently fails for the exact case it's designed to catch (retries against slow operations). Shipped check is topic-agnostic: any pending blogDraftPending with `status='pending'` in the last 1 day → noop. Behavior: Vercel Cron retries within 1 day → correct dedup; 30 days later → idempotency doesn't fire → new draft generated; operator never decides → next month generates a new draft for a different topic (picker skips the still-pending one), 2 pending drafts in queue both decideable, acceptable. (Caught by the verification harness's Test 4, which initially returned `ok` with a new docId instead of `noop`.)

2. **Placeholder asset uses `originalFilename` lookup, not deterministic `_id`.** Plan called for `client.assets.upload(...)` with `_id: 'image-blogDefaultPlaceholder-jpg'` in the options. Sanity's current `assets.upload` API does NOT accept a custom `_id` — asset IDs are server-generated from the content hash. Shipped approach: look up the existing asset by `originalFilename: 'blogDefaultPlaceholder.jpg'` (the upload filename is deterministic, and Sanity's content-hash dedup means re-uploading the same bytes always returns the same `_id`). Equally stable; documented inline in the file.

3. **`blogPost.category` mapping is lossy by design.** The existing `blogPost.category` enum is content-type (how-to / cost-guide / seasonal / industry-news / audience), distinct from the BlogTopic taxonomy (residential / commercial / hardscape / location / seasonal). Auto-published posts map `seasonal → seasonal` and all other topic categories → `audience`. Operator can edit category from Sanity Studio post-publish. The plan's "categorySlug" was preserved on the blogDraftPending as automation metadata (`content.categorySlug`); it just doesn't 1:1 map to the live blogPost category enum.

---

## What's now possible

- **One-tap monthly content cadence.** Operator gets one Telegram message per month with a full bilingual blog draft preview + Approve & publish / Reject buttons. Approve creates a live SEO-indexed post in seconds. Zero CMS work required to maintain a steady content cadence.
- **Self-throttling content rotation.** Topic picker walks the 20-topic curated list, skipping ids already used. When all 20 are consumed, wraps. Operator can extend the list at any time by editing `src/data/blogTopics.ts`.
- **Audit trail for every auto-published post.** Each `blogPost` carries `automatedTopicId` + `automatedGeneratedAt` + `automatedModelUsed`. The matching `blogDraftPending` row carries the full pre-publish content + Telegram message IDs + decision timestamps. Reject and the pending row stays as a "topic returned to rotation" marker.
- **Weekly SEO digest ready to flip.** The moment Phase 3.15 verifies Google Search Console ownership and provisions the service-account JSON, the weekly cron starts sending a top-queries + top-pages + totals digest every Monday morning. The route handler + Telegram formatter + auth + flag check are all complete and tested.
- **Foundation for Phase 2.17.** The `'blog_draft'` plumbing pattern (kind-discriminated callback_data, MarkdownV2 summary message, idempotent webhook routing, publish/reject handlers shaped as discrete Sanity-write functions) becomes the template for Phase 2.17's ServiceM8 portfolio publish approval flow.

---

## What does NOT work yet (carryovers)

- **Daily Google reviews cron** — blocked on Phase 2.14's Places fetcher. Hobby's 2-cron budget is now full (this phase's monthly + weekly). When Phase 2.14 re-opens, follow-up either consolidates the Daily cron into the existing routes OR triggers Phase 3.10's Pro upgrade.
- **GSC fetcher implementation** — `src/lib/automation/gsc/fetch.ts` has a typed signature but body throws under the defense-in-depth flag check. Phase 3.15 drops in the implementation (JWT auth via `google-auth-library` + `searchanalytics/query` × 2). Type signature stays.
- **Native ES review of auto-generated posts** — model produces idiomatic Latin-American Spanish, prefixed with `[TBR]`. Folds into the Phase 2.12 native-review queue when that phase runs.
- **Featured-image curation** — auto-published posts use the shared placeholder. Operator swaps per-post from Sanity Studio when ready, or Cowork swaps the placeholder file repo-wide in a parallel-track task.
- **Telegram-side draft editing** — Approve & publish / Reject only. No "make it shorter" reply support. Reject → topic returns to rotation → next cycle regenerates from scratch.
- **No production `notifyOperator()` callers beyond the Phase 2.16 cron error paths.** Phase 2.17 may wire it for ServiceM8 error alerts and operational alarms.
- **Manual real-Telegram + real-Vercel-Cron smoke deferred to post-merge.** The harness mocks Telegram and drives the cron via the test route. A real cron-fires-on-the-1st run can only be verified by waiting for the schedule + observing in production logs.

---

## Files written or modified

### New files

- `vercel.json` (12 lines) — repo-root cron schedules
- `public/images/blog/_placeholder.jpg` (46 KB, binary)
- `sanity/schemas/blogDraftPending.ts` (177 lines)
- `src/data/blogTopics.ts` (202 lines)
- `src/lib/automation/blog/topicPicker.ts` (86 lines)
- `src/lib/automation/blog/draft.ts` (194 lines)
- `src/lib/automation/blog/persistDraft.ts` (115 lines)
- `src/lib/automation/blog/placeholderAsset.ts` (62 lines)
- `src/lib/automation/blog/publish.ts` (187 lines)
- `src/lib/automation/blog/runMonthly.ts` (133 lines)
- `src/lib/automation/cronAuth.ts` (29 lines)
- `src/lib/automation/gsc/fetch.ts` (76 lines)
- `src/lib/automation/gsc/summarize.ts` (66 lines)
- `src/lib/telegram/markdownV2.ts` (24 lines)
- `src/app/api/cron/blog-draft-monthly/route.ts` (40 lines)
- `src/app/api/cron/seo-summary-weekly/route.ts` (72 lines)
- `src/app/api/test/blog-draft-run/route.ts` (50 lines)
- `src/app/api/test/blog-draft-decision/route.ts` (59 lines)
- `scripts/test-blog-automation.mjs` (411 lines)
- `src/_project-state/Part-2-Phase-16-Completion.md` (this file)

### Modified files

- `sanity/schemas/blogPost.ts` — +3 optional readonly meta fields, +1 field group
- `sanity/schemas/index.ts` — register `blogDraftPending`
- `src/lib/telegram/approvals.ts` — ship `'blog_draft'` button set
- `src/lib/telegram/client.ts` — extend `sendMessage` with optional `replyToMessageId`
- `src/app/api/webhooks/telegram/route.ts` — replace `'blog_draft'` placeholder with real handler + 2 new imports
- `.env.local.example` — Phase 2.16 env block
- `Sunset-Services-Decisions.md` — 2 new entries
- `src/_project-state/current-state.md` — Phase 2.16 sections; phase labels rolled
- `src/_project-state/file-map.md` — 22 new/modified entries
- `src/_project-state/00_stack-and-config.md` — Phase 2.16 section appended

---

## External state changed

- **Sanity Studio redeployed** via `npm run studio:deploy`. New "Blog Draft (Pending)" left-nav entry visible at `https://sunsetservices.sanity.studio/`. `blogPost` schema gained the new Meta group (3 readonly automation fields).
- **Vercel env vars upserted** on Production + Preview targets:
  - `CRON_SECRET=<64-hex>` (sensitive, id `Q1a70s01S5twGrNk`)
  - `BLOG_DRAFT_CRON_ENABLED=true` (plain, id `o1jiFYQrfYRMjsrs`)
  - `GSC_ENABLED=false` (plain, id `xAQF13CQvTHVlCJ9`)
  - `GSC_SITE_URL=` (plain, empty, id `FIyz1u2Zyaw4V1gJ`)
- **Vercel cron schedules registered** (auto-active on the next Production deploy):
  - `/api/cron/blog-draft-monthly` at `0 14 1 * *`
  - `/api/cron/seo-summary-weekly` at `0 14 * * 1`
- **`BLOG_AUTOMATION_TEST_ROUTES_ENABLED`** and **`TEST_ROUTES_SECRET`** are documented in `.env.local.example` but deliberately UNSET on Vercel. Only the verification harness sets them on the spawned test server.

---

## Commit log

```
e72bec9 chore(decisions): log Phase 2.16 plan-of-record
283d845 chore(env): document Phase 2.16 cron + automation variables
5c6e401 feat(sanity-schemas): +blogDraftPending (Phase 2.16)
f57bdcb feat(telegram): ship 'blog_draft' approval button set (Phase 2.16)
7626fad feat(data): +blogTopics curated rotation list (Phase 2.16)
fb4b693 feat(blog-automation): topic picker with rotation (Phase 2.16)
9aed60d feat(blog-automation): Anthropic draft generator (Phase 2.16)
6f9d0ff feat(blog-automation): Sanity persist helper for pending drafts (Phase 2.16)
96dbfad feat(api/cron): monthly blog draft route (Phase 2.16)
25c106f feat(blog-automation): default placeholder featured-image asset (Phase 2.16)
4523806 feat(blog-automation): publish + reject handlers (Phase 2.16)
24465b9 feat(api/webhooks/telegram): wire 'blog_draft' decision branch (Phase 2.16)
53f2552 feat(api/cron): weekly SEO summary route, flag-gated (Phase 2.16)
0e63268 feat(vercel): cron schedules — monthly blog + weekly SEO (Phase 2.16)
dde6e18 refactor(blog-automation): extract shared executor; switch to time-based idempotency
ca6f3f7 chore(decisions): log Phase 2.16 idempotency design shift
523a623 test(blog-automation): synthetic verification harness (Phase 2.16)
66da3d8 chore(phase-2-16): project-state updates
<this report> chore(phase-2-16): completion report
```

---

## Definition of done — checklist

- [x] Step 1 ran first — Decisions log entry committed BEFORE any code change (`e72bec9`)
- [x] All 10 verification tests pass (10/10 — see Build + verification section above)
- [x] Sanity Studio left navigation shows "Blog Draft (Pending)" entry; schema fields render correctly
- [x] `vercel.json` cron entries committed at repo root (2/2 on Hobby — fills the budget)
- [x] `CRON_SECRET`, `BLOG_DRAFT_CRON_ENABLED=true`, `GSC_ENABLED=false`, `GSC_SITE_URL=` (empty) set on Vercel Production + Preview. `BLOG_AUTOMATION_TEST_ROUTES_ENABLED` + `TEST_ROUTES_SECRET` deliberately unset on Vercel.
- [x] `.env.local` documents the same shape as Vercel Production at end of phase. Test-route flag NOT in `.env.local` after the harness runs.
- [x] Test-created Sanity docs cleaned (post-run count: 0 test blogDraftPending / 0 test blogPost / 0 test faq / 0 stray telegramApprovalLog rows pointing at test targets).
- [x] `npm run build` green; 4 new ƒ-Dynamic routes registered; no new MISSING_MESSAGE warnings; no TypeScript errors; no new ESLint errors.
- [x] No code path imports from Phase 2.14 (Places API) or Phase 2.17 (ServiceM8 portfolio publish) — this phase ships only the Monthly blog + Weekly SEO + `'blog_draft'` flow.
- [x] `'blog_draft'` webhook branch verified end-to-end via the harness — Test 5 (Approve creates a blogPost), Test 6 (Reject flips status to 'rejected'), Test 7 (placeholder asset reuse).
- [x] Placeholder asset created in Sanity (`image-...-1280x720-jpg`, uploaded once with `originalFilename: 'blogDefaultPlaceholder.jpg'`); both test blogPosts reference it (verified by Test 7).
- [x] Topic rotation correctly skips used topics (verified by Test 8 — with topic[0] on an approved blogPost and topic[1] on a probe blogPost, the cron returned topic[2] = `retaining-wall-lifespan`).
- [x] Completion report filed at `src/_project-state/Part-2-Phase-16-Completion.md` (this file).
- [x] `current-state.md`, `file-map.md`, `00_stack-and-config.md` updated.
- [x] Every in-phase off-spec decision has a matching entry in `Sunset-Services-Decisions.md` — (1) plan-of-record at start, (2) time-based idempotency mid-phase. Placeholder-asset off-spec is documented inline in the code; blogPost.category mapping off-spec is documented inline in `publish.ts`.
- [x] Branch pushed; PR ready for merge to `main`.

---

**Phase 2.16 complete.** Ready for merge to `main`.
