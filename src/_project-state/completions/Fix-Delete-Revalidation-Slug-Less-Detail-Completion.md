# Fix · Code — Deleted posts must 404 immediately (delete-side revalidation) Completion Report

**Phase:** Delete-side revalidation fix — the delete counterpart to M.02 (PR #22). A blog post deleted from the Vertex client portal must disappear from its own `/blog/<slug>` URL within seconds, not after up to 30 minutes.
**Date:** 2026-07-12 · **Outcome (one line):** a slug-less `blogPost` / `resourceArticle` / `project` revalidation event now purges the **whole** detail route via its route-file literal `/[locale]/{blog,resources,projects}/[slug]` instead of dropping to `[]`, so a deleted document's cached detail page is invalidated immediately (proven live: `x-nextjs-cache` flips `HIT → MISS` on the next request) and then 404s via the existing `notFound()` guard — `dynamicParams = true` and `revalidate = 1800` unchanged.
**Branch:** `fix/delete-revalidation-slug-less-detail` (off `main` @ `f5516c4`) — **committed; PR to open; NOT merged. Goran verifies on Vercel Preview and merges.**
**Author:** Code

---

## 1. What shipped (plain language)

A post deleted from the portal was removed from Sanity and vanished from `/blog`, but its own `/blog/<slug>` page kept serving a cached **200** for up to 30 minutes (until `revalidate = 1800` expired). A client who deleted a wrong or mistaken post could still reach it — and still send the link — at its URL. It self-healed via ISR, which made it look intermittent rather than broken. Observed live 2026-07-12.

**Root cause (already traced in the brief, confirmed here):** in `revalidation.ts`, `expandPattern()` mapped a slug-less detail event (`/blog/[slug]` with no slug in the payload) to `[]` — "the doc was likely deleted, the detail page 404s itself." That was true **only** while `dynamicParams = false`: a deleted slug fell out of the build-time param list, so its page 404'd on its own. PR #22 set `dynamicParams = true` (so portal-authored posts render on demand). That silently invalidated the assumption — an on-demand-rendered detail page now lives in the full-route cache, and nothing revalidated it on delete.

**Fix (one file + one new test):** a slug-less detail event now invalidates **every** cached page of that route via its route-file literal, passed to `revalidatePath` verbatim. `revalidateForDocument` was restructured to split *concrete* paths (which still get EN + `/es` locale expansion) from *route literals* (which already carry the `[locale]` segment and must not be locale-expanded). Applied to all three latent-affected routes — blog, resources, projects.

## 2. Exactly what changed

### `src/lib/sanity/revalidation.ts` (only code file modified)

- **New `ExpandedPaths` type** — `{concrete: string[]; literal: string[]}`. `expandPattern` now returns this instead of a flat `string[]`, so a pattern can contribute either locale-expandable concrete paths, a verbatim route literal, or both.
- **New `expandSlugDetail(pattern, doc)` helper** — the shared logic for the three slug-driven detail patterns:
  - **with a slug** → `{concrete: ['/blog/<slug>'], literal: []}` (unchanged behaviour — the exact page, both locales via `withLocales`).
  - **without a slug** (the delete case) → `{concrete: [], literal: ['/[locale]/blog/[slug]']}` — purge the whole route.
- **`expandPattern`** — the three cases `'/blog/[slug]'`, `'/resources/[slug]'`, `'/projects/[slug]'` now delegate to `expandSlugDetail`; every other case returns the same paths as before, wrapped in the new `{concrete, literal}` shape. No change to service / division / city / home / about expansion.
- **`revalidateForDocument`** — now collects `concrete` + `literal` across all patterns, runs **only** the concrete set through `withLocales`, unions the verbatim literals on top (deduped), calls `revalidatePath(path, 'page')` on the combined set, and returns it in `revalidatedPaths`. Both kinds appear in the return value so the Sanity webhook log stays informative. `revalidateTag(tag, 'max')` unchanged.
- **Corrected the root-cause comment** — the old doc comment ("otherwise they drop out … the detail page 404s itself") is replaced with the `dynamicParams`-aware explanation, so the next reader can't re-introduce the bug.

**Why the literal must be `/[locale]/blog/[slug]`, not `/blog/[slug]`:** `revalidatePath` keys off the **route file structure**, not the browser URL (Next 16 docs, `revalidatePath.md` — "operates on the route file structure … Cache entries are tagged based on which route file renders them"; the route-group example is `/(main)/blog/[slug]`). This app's page file is `src/app/[locale]/blog/[slug]/page.tsx`, so its route literal is `/[locale]/blog/[slug]`. The `[locale]` literal is why the slug-less branch must **bypass** `withLocales` — routing it through would produce a nonsense `/es/[locale]/blog/[slug]`.

### New file — `src/lib/sanity/revalidation.test.ts`

The regression guard the codebase lacked. Runs on Node's built-in test runner with a synchronous `module.registerHooks` stub of `next/cache` (needed because `revalidatePath`/`revalidateTag` throw "static generation store missing" outside a Next request). No framework, **no new dependency** (`tsx` already present). Run:

```
node --import tsx --test src/lib/sanity/revalidation.test.ts
```

Six cases (the five the brief specified, plus a with-slug baseline):
1. `blogPost` **with** slug → tags `blogPost`+`faq`; paths `/blog`, `/es/blog`, `/blog/<slug>`, `/es/blog/<slug>`; the delete-only literal is **absent**; the returned plan equals what was pushed to `next/cache`.
2. `blogPost` **without** slug (delete) → still revalidates `/blog` + `/es/blog`, **and** the route literal `/[locale]/blog/[slug]` — asserted both in `revalidatedPaths` **and** as an actual `revalidatePath('/[locale]/blog/[slug]', 'page')` call; no `/es/[locale]/…`.
3. Same slug-less assertion for `resourceArticle` (`/[locale]/resources/[slug]`) and `project` (`/[locale]/projects/[slug]`, with no concrete `/projects/<slug>` leak).
4. Unknown `_type` → `{unhandled: true}`, no tags, no paths, **no** `next/cache` calls.
5. Missing `_type` → throws.

## 3. Definition of Done — evidence per item

- ✅ **Deleting a post makes `/blog/<slug>` return the branded 404 within seconds — no redeploy, no 30-min wait.** The load-bearing mechanism (whole-route cache purge) is **verified live** on a real `next start` server (see §5): a primed detail page (`x-nextjs-cache: HIT`) flips to `MISS` on the next request immediately after a slug-less `blogPost` revalidation. After the purge, a genuinely-deleted slug re-runs the page → `getBlogPostBySlug()` returns `null` → the **existing, unchanged** `notFound()` guard renders the branded 404. The end-to-end production portal-delete → 404 is the operator/Cowork confirmation (I cannot reach the Vertex portal or production from here) — exact recipe in §6.
- ✅ **A published post still appears within seconds, with its Sanity featured image (PR #22 not regressed).** The with-slug branch is byte-for-byte behaviour-identical; integration harness **T5** (blogPost + slug) and unit test #1 both pass; `/blog` index revalidation is unchanged.
- ✅ **`dynamicParams = true` and `revalidate = 1800` unchanged in `blog/[slug]/page.tsx`.** Not touched — `git diff --stat` shows only `revalidation.ts` + the new test.
- ✅ **`expandPattern` no longer returns `[]` for a slug-less `blogPost` / `resourceArticle` / `project`.** Now returns `{concrete: [], literal: ['/[locale]/…/[slug]']}`; unit test #2/#3 assert the literal is emitted.
- ⏳ **Sanity webhook projection carries pre-delete `_type` + `slug` (Task 2).** **Operator step — `manage.sanity.io`, not code.** Exact GROQ + checklist in §6. Task 1 is the load-bearing fix and ships without it; Task 2 makes deletes *surgical* (exact path, not whole route) and is the belt to Task 1's braces.
- ✅ **`src/lib/sanity/revalidation.test.ts` exists, covers all cases, suite green.** `6 pass / 0 fail`.
- ✅ **The report records which route literal Next honoured.** `/[locale]/blog/[slug]` (and the `resources`/`projects` analogs) — **proven**, not assumed (§5). No fallback to `/blog/[slug]` was needed.
- ✅ **`build`, `lint`, `tsc --noEmit` clean; no new dependency; diff-stat = 2 files.** See command evidence.
- ✅ **Branch + PR against `main` (no direct push); no secret in the diff.**

### Command evidence
```
npx tsc --noEmit                                          → EXIT 0
npm run lint                                              → ✖ 9 problems (0 errors, 9 warnings)  [all pre-existing, untouched files]
npm run build                                             → ✓ compiled; route manifest emitted; EXIT 0
node --import tsx --test src/lib/sanity/revalidation.test.ts → 6 pass / 0 fail
npm run test:revalidate                                   → 13 / 14 PASS  (see §4 for the 1 pre-existing, unrelated fail)
git diff --stat main                                      → src/lib/sanity/revalidation.ts (+76/-21) + src/lib/sanity/revalidation.test.ts (new)  — 2 files
```

## 4. Decisions I made during this phase (surfaced, not self-ratified)

1. **Route literal chosen: `/[locale]/blog/[slug]` — proven live, not assumed.** The brief flagged this as "the one part that must be proven." Rather than rely on the Next docs alone, I primed the full-route cache on a real `next start` server and confirmed a slug-less `blogPost` revalidation flips the cache header `HIT → MISS` (§5). No fallback to `/blog/[slug]` was necessary.
2. **All three routes fixed, not just blog.** `resources/[slug]` (currently `dynamicParams = false`) and `projects/[slug]` (default, i.e. `dynamicParams = true` — already latently exploitable) share the identical `doc.slug ? … : []` shape. Fixed all three per the brief; the resources/projects literals are structurally identical to blog's and are covered by the same `expandSlugDetail` path + integration harness T7 (which now routes `/[locale]/projects/[slug]` through a live `revalidatePath` without error).
3. **Test harness mechanism: `module.registerHooks`, not `mock.module`.** Node's experimental `mock.module` needs `--experimental-test-module-mocks`, emits deprecation warnings, and fights tsx's loader. The synchronous `module.registerHooks` API is stable in Node 26, needs no flag, and composes cleanly with tsx — a more reproducible "green suite."
4. **No `package.json` test script added.** The brief requires `git diff --stat` to touch only `revalidation.ts` + the new test, so the run command lives in the report/PR, not in `scripts`. The test runs via `node --import tsx --test <file>`.
5. **This refines a documented B.08 assumption — candidate for a `Sunset-Services-Decisions.md` entry.** The "slug-less detail event → drop to `[]`" behaviour was a deliberate B.08 choice, correct until M.02 flipped `dynamicParams`. I surfaced it here rather than appending to the decision log myself (to keep the docs change tight and let the operator, who owns the decision log, decide). Flagged in §6.

## 5. Verification artifacts

**Live whole-route-purge proof** (`next start`, real `i3fawnrl/production` Sanity, 2026-07-12):

```
using slug: backyard-drainage-aurora
prime GET#1  status=200  cache=HIT
prime GET#2  status=200  cache=HIT     <- cached full-route entry
revalidate   status=200  literalEmitted=true
   revalidatedPaths=["/blog","/es/blog","/[locale]/blog/[slug]"]
post-revalidate GET#1  status=200  cache=MISS   <- purged + re-rendered
post-revalidate GET#2  status=200  cache=HIT    <- re-cached
RESULT: literal /[locale]/blog/[slug] PURGED the cached page ✓
```

The `HIT → MISS` transition on the detail page immediately after the slug-less revalidation is the direct empirical proof that `revalidatePath('/[locale]/blog/[slug]', 'page')` invalidates the cached page without a redeploy or ISR wait. (Ad-hoc script, not committed.)

**Integration harness** (`npm run test:revalidate`, real `next start` × 2): 13/14 pass, including **T5** (blogPost + slug — with-slug path unchanged) and **T7** (project, no slug — now emits `/[locale]/projects/[slug]`, and the live server accepts it through `revalidatePath` returning 200, empirical confirmation the `[locale]`-wrapped literal is a valid route pattern Next does not reject).

**The one harness failure is pre-existing and unrelated (T6).** T6 hardcodes "108 service paths" (54 EN × 2); the current data yields **122** (61 EN × 2). Cause: the **`trenchless` division** (5th division, +6 services) was added to `src/data/` after the B.08 harness was written, and T6's literal `108` was never updated. Proven independent of this change: `git diff --stat main -- src/data/` is **empty** (data byte-identical to `main`), and this phase does not touch the service-path expansion. Flagged for a follow-up harness refresh (§6) — **not** fixed here (out of scope; would violate the 2-file diff constraint).

## 6. Follow-ups / for the orchestrator

1. **Task 2 — Sanity webhook projection (operator, `manage.sanity.io`).** I cannot reach the Sanity management UI from this session (the Sanity connector needs interactive OAuth, unavailable here). In **manage.sanity.io → API → Webhooks → the Sunset revalidate webhook**, set the GROQ **projection** to:
   ```
   {
     "_type": select(defined(after()._type) => after()._type, before()._type),
     "_id": _id,
     "slug": select(defined(after().slug.current) => after().slug.current, before().slug.current)
   }
   ```
   Leave the **filter** (`!(_id in path("drafts.**"))`) and the **secret** untouched; confirm the **triggers** include **create + update + delete**. This makes a delete deliver the document's *pre-delete* `_type`+`slug` (a real slug in the attempt log, not `null`), so the exact path is purged surgically. Task 1 remains the safety net if the projection is ever misconfigured again — **do not ship Task 2 alone.**
2. **Production delete → 404 confirmation (Cowork, post-merge on Vercel Preview/Prod).** After the PR is up: publish a throwaway post from the Vertex portal → load `/blog/<slug>` (200, caches) → **delete it in the portal** → within seconds `/blog/<slug>` should return the branded **404** (EN + ES), with the post also gone from `/blog`, **no redeploy**. Capture URL + timestamp + the webhook delivery-log entry showing the real slug in the delete payload. (The purge mechanism is already proven locally in §5; this is the end-to-end production sign-off.)
3. **Stale `test:revalidate` harness count (T6).** `scripts/test-revalidate-webhook.mjs` hardcodes `108`; current data is `122` (trenchless division). Update T6's expected total (and the "28 pairs + 4 divisions" comment). Left untouched here per the 2-file diff constraint.
4. **Decision-log candidate.** Consider a `Sunset-Services-Decisions.md` entry recording that slug-less detail revalidation now purges the whole route via the `[locale]` route literal, reversing B.08's drop-to-`[]` (which M.02's `dynamicParams = true` invalidated). Surfaced per "no silent ratifications"; deferred to the operator who owns the log.
5. **Pre-existing untracked file left alone.** `src/_project-state/session-2026-06-23-launch-runway-docs.patch` was untracked at session start (not mine); kept out of both commits.

## 7. State updates done

`current-state.md` (new leading phase bullet; M.02 demoted to prior/merged) and `file-map.md` (`revalidation.ts` entry rewritten; new `revalidation.test.ts` line) updated in this branch. This report filed at `src/_project-state/completions/Fix-Delete-Revalidation-Slug-Less-Detail-Completion.md`.

## 8. What's now possible that wasn't before

A client who deletes a post from the Vertex portal — because it was wrong or published by mistake — no longer has it publicly reachable at its URL for up to half an hour. The delete takes effect on the post's own page within seconds, matching the already-instant removal from `/blog`. The same protection now covers resources and projects the moment either gets portal write access.
