# Phase M.08 · Code — Delete-revalidation, corrected (`delta::operation()`) — Completion Report

**Phase:** M.08 — the correction to PR #23. A post deleted from the Vertex portal must disappear from its own `/blog/<slug>` page within seconds. PR #23 built the right mechanism but wired it to a trigger that never fires in production; this phase rewires it to the real signal.
**Date:** 2026-07-12 · **Author:** Code
**Branch:** `fix/delete-revalidation-operation` (off `origin/main` @ `addf709`) — **committed; PR to open; NOT merged.** Goran verifies on Vercel Preview, applies the Sanity projection change (§"Operator step"), and merges.
**Outcome (one line):** the whole-route detail purge is now keyed on **`operation === 'delete'`** (projected via `delta::operation()`), not on the slug being absent — because the live delete webhook DOES carry the slug, so PR #23's slug-absent trigger was dead code and the deleted page kept serving a cached 200. `operation` is threaded webhook body → payload type → both route handlers → `revalidateForDocument`; it is optional, so with it absent the behaviour is byte-identical to pre-M.08 `main` (safe to ship before the operator edits the webhook).

---

## 1. Why PR #23 didn't work (the record, corrected)

PR #23 was written on this premise, quoted from its own brief:

> "The Sanity delete webhook payload carries no slug, so the detail-page path drops out of the revalidation list."

**That premise is false, and was never verified against the live webhook.** It is now. The evidence (gathered live 2026-07-12; settled, not re-gathered here):

1. **Production was running the fix.** Vercel project `sunsetservices` ("Sunset Services Team" scope), `main` @ `addf709` (PR #24), deployed ~40 min before the live test — stale-deploy ruled out.
2. **The delete webhook fires, and its payload CARRIES THE SLUG.** A real portal-delete's Sanity attempt log (project `i3fawnrl`, hook "Site revalidation") returned `revalidatedPaths` including the concrete detail path `/blog/portal-delete-revalidation-live-proof-2026-07-12` (both locales). So `expandSlugDetail()` took its **with-slug branch**; PR #23's slug-absent literal branch **never executed** on this webhook.
3. **The webhook payload can't distinguish a delete from a publish.** Projection `{_type, _id, "slug": slug.current}` — `slug.current` resolves off the pre-delete document. Nothing in the payload says "this was a delete."
4. **The real defect:** in that same call, `revalidatePath('/blog')` DID evict the index (post vanished from `/blog` instantly), while `revalidatePath('/blog/<slug>')` did NOT evict the detail page (cached 200, minutes later). `/blog` is built at build time; `/blog/<slug>` for a portal post is generated **on demand** (`dynamicParams = true` since M.02/PR #22) and cached in the full-route cache. **A concrete-URL `revalidatePath` does not evict an on-demand-generated dynamic page on Vercel; the whole-route literal does** (PR #23 §5 proved this on `next start`: `x-nextjs-cache` HIT → MISS). PR #23's mechanism is right — only its trigger was wrong.

**The correction, in one line:** stop keying the whole-route purge on "the slug is missing"; key it on "this was a delete."

## 2. Exactly what changed (3 code files + 2 test files + 3 docs)

### `src/lib/sanity/revalidation.ts`
- **New `SanityOperation` type** (`'create' | 'update' | 'delete'`) and **`operation?: SanityOperation`** field on `SanityRevalidationPayload` (optional, documented as the `delta::operation()` signal that may lag the deploy).
- **New exported `coerceSanityOperation(value: unknown)`** — narrows an untrusted webhook field to a known operation or `undefined` (the safe, back-compat default).
- **`expandSlugDetail()` rewired.** The one-line behavioural change:
  ```ts
  // before (PR #23): if (doc.slug) { …concrete… } return { literal }
  // after  (M.08):   if (doc.operation !== 'delete' && doc.slug) { …concrete… } return { literal }
  ```
  A publish (create/update, **or no `operation`** — back-compat) with a slug → the concrete page (surgical). A **delete** (regardless of slug), or any slug-less event → the whole-route literal `/[locale]/…/[slug]`. Its doc-comment now records the corrected premise so the next reader can't re-introduce the bug.
- **No change** to `MAPPINGS`, `withLocales`, `expandPattern`'s collection cases, tag handling, or the `{concrete, literal}` split — those are PR #23's correct, load-bearing parts.

### `src/app/api/revalidate/route.ts` (production webhook)
- `SanityWebhookBody` gains `operation?: string`; the body's `operation` is read through `coerceSanityOperation` and threaded into the payload. Body-shape doc-comment updated.

### `src/app/api/test/revalidate/route.ts` (flag-gated test twin)
- Zod schema gains `operation: z.enum(['create','update','delete']).optional()`; threaded into the payload. Nothing else changes (still `.strict()`, still Bearer-gated + flag-gated).

### `src/lib/sanity/revalidation.test.ts` (unit — `node --import tsx --test`)
- **+5 cases** (6 → 11): blogPost/resourceArticle/project **delete-with-slug → whole-route literal** (the RED-before-green regression guard); blogPost **update-with-slug → concrete only, no literal**; blogPost **slug + no `operation` → byte-identical to a publish** (back-compat). New shared `assertPathsWellFormed()` asserts no emitted path contains `null`/`undefined` and no route literal is locale-expanded to `/es/[locale]/…`.

### `scripts/test-revalidate-webhook.mjs` (integration — real `next start`)
- **+1 case (T15):** a `blogPost` DELETE carrying a slug (`operation:'delete'`) through `/api/test/revalidate` → 200, `revalidatedPaths` includes the whole-route literal `/[locale]/blog/[slug]`, no `/es/[locale]/…`, and — critically — the real server **accepts** the literal (a 200 proves `revalidatePath` didn't reject the `[locale]`-wrapped pattern).

### Docs
- `Sunset-Services-Decisions.md` — dated M.08 entry (PR #23's premise was empirically wrong; real trigger is `delta::operation() == 'delete'`; concrete `revalidatePath` doesn't evict an on-demand dynamic page on Vercel, the literal does).
- `current-state.md` — new leading M.08 bullet; PR #23 bullet demoted + flagged as corrected-in-part; B.08 "What works" section updated (operation trigger, test-route schema, harness 15/15).
- `file-map.md` — revalidation.ts / test / both route entries updated.

## 3. TDD — red before green (quoted)

The delete-with-slug tests were added **first**, run against unmodified `origin/main`, and failed exactly as predicted (the code emitted only the concrete path):

```
✖ blogPost DELETE that CARRIES a slug → whole-route literal (regression guard)
  AssertionError [ERR_ASSERTION]: expected route literal /[locale]/blog/[slug] on delete,
  got ["/blog","/es/blog","/blog/my-post","/es/blog/my-post"]
✖ resourceArticle DELETE with a slug → /[locale]/resources/[slug] literal
  got ["/resources","/es/resources","/resources/my-guide","/es/resources/my-guide"]
✖ project DELETE with a slug → /[locale]/projects/[slug] literal, no concrete detail leak
  got [".../projects/my-job",".../es/projects/my-job", …]
ℹ tests 11
ℹ pass 8
ℹ fail 3
```

After the `expandSlugDetail()` change: **`tests 11 · pass 11 · fail 0`.**

## 4. Quality gate — evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **EXIT 0** |
| `npm run lint` | **0 errors, 9 pre-existing warnings** (see note below) |
| `npm run build` | **EXIT 0** — ✓ Compiled successfully; 202/202 static pages; the 3 detail routes (`/[locale]/{blog,resources,projects}/[slug]`) still classify `●` SSG (dynamicParams untouched) |
| `node --import tsx --test src/lib/sanity/revalidation.test.ts` | **11 / 11 PASS** (was 8/11 RED before the fix) |
| `npm run test:revalidate` | **15 / 15 PASS, 0 FAIL** |
| `git diff --stat origin/main -- src/ scripts/` (code+tests) | 5 files: `revalidation.ts` (+73/−…), `revalidation.test.ts` (+144), `revalidate/route.ts`, `test/revalidate/route.ts`, `test-revalidate-webhook.mjs` |

**T6 confirmed passing (asked for explicitly).** PR #23 reported T6 as a pre-existing failure (hardcoded `108` vs the live `122` after the `trenchless` division was added). PR #24 (`addf709`) fixed it by deriving the count from `SERVICES + DIVISIONS + SURFACED_LOCATION_SLUGS × 2`. This run confirms it: `✓ T6 … 122 fanned-out paths (34 service + 5 division + 22 city EN, × 2 locales) — total paths=122`. **T6 passes; no failure to report.**

**Lint note (honest).** The raw `npm run lint` on this machine reports `12281 problems (612 errors, 11669 warnings)` — **all of it from a leftover, gitignored git worktree** at `.claude/worktrees/nostalgic-mclaren-c98133/` (a full duplicate repo copy from a prior Claude Code session, branch `claude/nostalgic-mclaren-c98133`, created 06:50 today; `git check-ignore .claude` confirms it's ignored). It is not part of the tracked repo, not mine, and I left it untouched (it may belong to a concurrent session). The **true tracked-tree lint is 0 errors / 9 pre-existing warnings**, verified two ways: `npx eslint . --ignore-pattern '.claude/**'` → `9 problems (0 errors, 9 warnings)`, and linting the 5 changed files directly → clean. The 9 warnings are all pre-existing `no-unused-vars` in untouched files (`sanity/lib/queries.ts`, `services.ts`, `wizard.ts`, etc.). **Follow-up flagged:** add `.claude/**` to `eslint.config.mjs` `ignores` (alongside the existing `dist/**`) so the gate command isn't polluted by stray worktrees — repo hygiene, out of scope here.

## 5. Operator step — the Sanity projection (copy-paste)

**The code above is inert until the webhook actually sends `operation`.** This is a dashboard change, not code:

```
manage.sanity.io → project "Sunset Services" (i3fawnrl) → API → Webhooks
  → "Site revalidation" → Edit webhook → Projection:
```
```groq
{_type, _id, "slug": slug.current, "operation": delta::operation()}
```

`delta::operation()` is available in GROQ-powered webhook projections and returns `"create" | "update" | "delete"`. **Change nothing else** — triggers stay Create + Update + Delete, the filter (`!(_id in path("drafts.**")) && _type in ["blogPost", "resourceArticle"]`) stays as-is, the secret stays as-is. Until this is applied, the deployed code runs its back-compat path (identical to pre-M.08) and the delete bug persists — the code is correct but waiting on this one field.

## 6. Definition of Done — per item

- ✅ Branch `fix/delete-revalidation-operation` (off `origin/main` @ `addf709`); PR to open; `main` untouched.
- ✅ A test went **RED (8/11) before** the change and **GREEN (11/11) after**; the red run is quoted (§3).
- ✅ `operation` threaded: webhook body → `SanityRevalidationPayload` → both route handlers → `revalidateForDocument`.
- ✅ `operation === 'delete'` emits the route literal for `blogPost`, `resourceArticle`, and `project` (unit + T15).
- ✅ A non-delete event with a slug emits the concrete path and **no** literal (publishes stay surgical) — unit "update-with-slug" + "no-operation" cases.
- ✅ With `operation` absent, behaviour is byte-identical to current `main` — asserted directly (`no operation` case deep-equals the `update` case) and confirmed by every pre-existing unit + T1–T14 harness case staying green.
- ✅ Route literals bypass `withLocales()`; no `/es/[locale]/…` anywhere; no emitted path contains `null`/`undefined` (`assertPathsWellFormed`).
- ✅ Unit **11/11** · `npm run test:revalidate` **15/15** (T6 included, passing).
- ✅ `npm run build` exit 0 · lint **0 errors** (tracked tree; §4 note).
- ✅ The Sanity projection change is in this report as a copy-pasteable §"Operator step" (§5).
- ✅ `Sunset-Services-Decisions.md` appended · `current-state.md` + `file-map.md` updated.
- ✅ No secret committed (public repo — only *where* secrets live is named).

## 7. Decisions I made that the brief didn't spell out (surfaced, not self-ratified)

1. **On delete, emit the literal ONLY (not literal + concrete).** The brief said emitting the concrete path too is harmless; I chose literal-only because the whole-route literal already purges the deleted page and every other cached detail page, so the concrete path is redundant — cleaner return value and cleaner webhook log. The unit tests assert the concrete detail path is *absent* on a delete (`!includes('/resources/my-guide')`, no `/projects/<slug>` leak), locking this choice.
2. **Combined condition `doc.operation !== 'delete' && doc.slug`** rather than a separate `if (operation === 'delete')` block — it handles all six cases (delete±slug, publish±slug, no-op±slug) in one branch with the fewest moving parts, and makes the back-compat property (`operation` absent ⇒ old behaviour) obvious by construction.
3. **Coercion split by route.** The production webhook (untrusted JSON) uses the new `coerceSanityOperation()` guard; the test route (already Zod) uses `z.enum([...]).optional()`. Both yield a correctly-typed `SanityOperation | undefined`; no raw string reaches the payload type.
4. **Branched off `origin/main` (`addf709`), not local `main` (`291a07a`).** Local `main` was one commit behind — it lacked PR #24's T6 fix. Branching off `origin/main` is what makes T6 green here and keeps the diff honest.
5. **Left the stray `.claude/worktrees/` copy in place** and flagged the eslint-ignore follow-up rather than deleting another session's registered worktree (§4 note).
6. **Left the untracked `src/_project-state/session-2026-06-23-launch-runway-docs.patch`** alone — it was untracked at session start (not mine; same call PR #23 made).

## 8. Follow-ups / for the orchestrator

1. **Operator: apply the Sanity projection (§5)** — the fix is inert without it.
2. **Cowork/operator: production delete → 404 sign-off** — the acceptance test in the phase brief's appendix (publish a slug-blank post from the Vertex portal → confirm live → delete → the post's own page returns the branded 404 within seconds, not a cached 200 → the Sanity attempt log's `revalidatedPaths` now contains `/[locale]/blog/[slug]`).
3. **Repo hygiene:** add `.claude/**` to `eslint.config.mjs` `ignores` (§4 note) so `npm run lint` isn't polluted by stray worktrees.
4. **Known, separate, NOT in this phase (per brief):** the broken featured image on portal posts with no image — `resolveBlogImage.ts` always returns a `src`, falling back to `/images/blog/<slug>.jpg`, which 404s for a portal-authored post with no uploaded image. Its own phase.

## 9. What's now possible that wasn't before

Once the operator applies the one-field projection change, a post deleted from the Vertex portal is purged from its own `/blog/<slug>` page within seconds — matching the already-instant removal from `/blog` — instead of serving a cached 200 until `revalidate = 1800` expires. The same protection covers resources and projects. And because `operation` is optional, this can be merged and deployed **before** the projection is touched, with zero behaviour change until it is.
