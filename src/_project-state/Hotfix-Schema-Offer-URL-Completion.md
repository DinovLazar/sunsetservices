# Hotfix · Schema Offer URL · Code — Completion Report
**Date:** 2026-07-28 · **Outcome (one line):** `npm run validate:schema` is green again — 0 errors / 0 warnings across all 24 URLs — after fixing the B.17 offer catalog's missing `Offer.url` and a harness false positive it exposed.

## 1. What shipped (plain language)
Since Phase B.17 every page carried a machine-readable catalog of all 34 services, but each catalog entry was missing the address of its own offer — the repo's schema checker flagged 818 errors sitewide. Each offer now states its service page URL, and the checker itself was taught to stop wrongly flagging the quote/thank-you pages for content that lives in the (allowed) sitewide block. The schema quality gate that had been silently red since B.17 shipped is now provably green.

## 2. Definition of Done
No phase prompt exists — this is a hotfix; the DoD is the operator directive that opened the session.

- ✅ Emit `url` on each catalog `Offer` (same value as its `itemOffered` Service URL) — evidence: `src/lib/schema/organization.ts` `buildOfferCatalog()` now sets `url: serviceUrl` on every Offer node.
- ✅ Production build exit 0 — evidence: `rm -rf .next && npm run build` completed with full route table output (prebuild `validate:related-links` included).
- ✅ `npm run validate:schema` → 0 errors across 24 URLs — evidence: `TOTAL: 0 errors / 0 warnings across 24 URLs` against a fresh production build served on `localhost:3100`. (Local run = internal checks only; the best-effort schema.org remote pass auto-skips on localhost, which the harness header documents as fine — internal checks are authoritative.)
- ✅ Branch `fix/schema-offer-url` off `origin/main` @ `e5a0e50`, Conventional Commit, PR opened, **not merged** — operator verifies on Vercel Preview.

Verification detail (red → green):
- **Red run (pre-fix, fresh build of `origin/main` code):** `TOTAL: 818 errors / 0 warnings across 24 URLs` — reproduced the reported failure exactly. Breakdown: **816** × `(Offer): missing required field "url"` (34 Offers × 24 URLs, per `REQUIRED_FIELDS.Offer = ['url']` at `scripts/validate-schema.mjs`), **plus 2** × `forbidden @type "Service"` on `/request-quote/` + `/thank-you/` — a second, unreported defect (see §3).
- **Green run (post-fix, fresh build):** 0 errors / 0 warnings, all 24 URLs PASS.
- **Negative control:** temporarily adding `mustNotHaveTypes: ['BreadcrumbList']` to `/landscape/` (which emits a page-level breadcrumb) produced exactly 1 error, proving the narrowed guard still catches real page-level violations. The temp entry was reverted; the final 0-error run is on the exact committed code.
- **Lint:** 0 errors in repo sources. Raw `npm run lint` prints ~1224 errors, but every one comes from stale build artifacts under `.claude/worktrees/nostalgic-mclaren-c98133/.next/` — leftover from another session's worktree, absent on CI/Vercel. Flagged as a separate chore (ESLint ignore for `.claude/**`), not fixed here.

## 3. Decisions I made during this phase
Both logged in `Sunset-Services-Decisions.md` (entry 2026-07-28):

- **The 818 errors were NOT all one pattern — 2 of them needed a harness change, and I made it.** The directive described a single missing-`url` pattern, but the red run showed 816 + 2: the D14/D15 `mustNotHaveTypes` assertion matched the validator's full recursive node index, so the `Service` nodes B.17 legitimately embedded inside the sitewide `hasOfferCatalog` false-positived on `/request-quote/` and `/thank-you/`. I narrowed the assertion to page-level nodes only (paths `block[N]` / `block[N].@graph[M]`), which preserves both D14/D15 intent ("this route emits no JSON-LD of its own") and B.17's catalog. Alternatives rejected: dropping `'Service'` from those two routes (weakens the guard) or stripping `Service` from the catalog (guts B.17). Without this, the stated DoD (0 errors) is unreachable. **Needs operator ratification** — it changes what the harness asserts.
- **`Offer.url` points at the service page, not the quote wizard.** The per-service-page builder (`service.ts`) points its Offer at `/request-quote/?service=<slug>`; the catalog instead duplicates the service page URL per the directive — the catalog's job (B.17) is giving answer engines a page to cite. Accepted downside: redundant `url` on `Offer` + `itemOffered`.

## 4. Deviations from the brief / spec
- Scope grew by one file: `scripts/validate-schema.mjs` (see §3, first decision). Nothing else deviates.
- Not touched despite proximity: the catalog's URLs have no trailing slash while the rest of the site's do (`${SITE_URL}/${division}/${slug}` vs `…/${slug}/` in `service.ts`). Pre-existing B.17 style; the harness doesn't flag it; left alone for scope discipline.

## 5. Changed files / deliverables
- `src/lib/schema/organization.ts` — `buildOfferCatalog()` emits `url` on every Offer (edited).
- `scripts/validate-schema.mjs` — `mustNotHaveTypes` narrowed to page-level nodes + doc comment updated (edited).
- `Sunset-Services-Decisions.md` — 2026-07-28 entry appended.
- `src/_project-state/Hotfix-Schema-Offer-URL-Completion.md` — this report (new).
- `src/_project-state/current-state.md` — hotfix noted (edited).
- Branch: `fix/schema-offer-url` off `origin/main` @ `e5a0e50` · Conventional Commit `fix(seo): …` · PR to open, operator merges after Preview verification.
- NOT included (pre-existing working-tree content left untouched, belongs to Polish-02): uncommitted `scripts/validate-seo.mjs` edits and the untracked `src/_project-state/session-2026-06-23-launch-runway-docs.patch`.

## 6. State updates done (code phases)
- `current-state.md` — updated (hotfix entry).
- `file-map.md` — not touched: no `src/` files added/removed/moved; the two code changes are in-place edits to files already mapped.
- `00_stack-and-config.md` — not touched: no stack or config change.

## 7. Risks, follow-ups, what the next phase needs to know
- **B.17's completion report listed schema verification as "pending" — it is now done** (this report is the evidence). Any future phase that adds a sitewide-graph node type should re-run `validate:schema` before closing; this defect sat unreported since `a3f1d43` because that step was skipped.
- The narrowed `mustNotHaveTypes` no longer sees nested nodes — deliberate, but if a future decision ever needs "type X must appear nowhere at all on route Y," that needs a new assertion kind, not this one.
- Local lint is drowned by stale worktree artifacts under `.claude/worktrees/` — chore chip spawned to add an ESLint ignore.
- Two production `next-server` instances were found running locally on port 3000 during this session (another chat's); verification used a dedicated port-3100 server on a fresh build to avoid stale-build false results. The port-3100 server was stopped at session end.

## 8. What's now possible that wasn't before
The schema quality gate is trustworthy again — 24/24 URLs provably clean — so answer engines get a complete, valid offer catalog, and future schema phases can gate on `validate:schema` without inherited red.
