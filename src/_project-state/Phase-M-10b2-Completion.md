---
phase: M.10b
title: Content integration — Marcin's brand story + Goran's Q&A library + 7 SEO FAQs (Code)
date: 2026-05-27
status: completed (single branch; operator runs the Sanity seed + does Vercel Preview walk-through)
branch: worktree-claude+m10b-content-integration
---

# Phase M.10b Completion Report — Content integration

> Filename note: `Phase-M-10b2-Completion.md` (not `Phase-M-10b-Completion.md` as the phase prompt asked). The repo already has a committed `Phase-M-10B-Completion.md` (capital B, commit `99adf80`) for the prior `/impeccable:audit` fix-pass. On Windows NTFS + git's `core.ignoreCase=true`, both filenames collide as the same file. Operator picked `Phase-M-10b2-Completion.md` via Chat before this file was created. See `Sunset-Services-Decisions.md` 2026-05-27 §2.1 for context.

## Headline numbers

| Metric | Before M.10b | After M.10b |
|---|---|---|
| `/qa/` categories | 5 | **7** |
| `/qa/` total questions × 2 locales | 25 × 2 = 50 | **28 × 2 = 56** |
| `qa.*` i18n shape | `qa.categories.<key>` = string + flat `qa.questions[]` | `qa.categories.<key>` = `{title, eyebrow, questions[]}` |
| Homepage sections | 7 (Hero, AudienceEntries, ServicesOverview, SocialProof, About, Projects, CTA) | **8** (+ HomeWhySunset between Projects and CTA) |
| `home.whySunset.*` i18n namespace | n/a | **NEW** (eyebrow + h2 + dek + cards[8] × 2 locales) |
| `about.story.*` paragraphs | 3 (p1 + p2 + p3) | **4** (+ p4 brand-values summary × 2 locales) |
| Sanity FAQ docs (after operator runs the seed) | 50 (16 existing services × ~5 each + 14 new services × ~5 + 18 new cities × 4 = the M.01e migration output) | **57** (50 + 7 SEO FAQs) |
| Lucide icons net-new on home | 0 | **8** (Home, Shield, DollarSign, Award, FileCheck, Compass, Heart, TrendingUp) |
| `/qa/` JSON-LD | `BreadcrumbList` only | unchanged (no `FAQPage` — preserves the M.01e locked decision #20) |

## Files written / modified

### New

| Path | Purpose |
|---|---|
| [src/components/sections/home/HomeWhySunset.tsx](src/components/sections/home/HomeWhySunset.tsx) | New homepage band. Server component (matches `HomeProjects.tsx` pattern). 8 brand-value cards rendered from `home.whySunset.cards[]` with a const `ICONS` array mapping `idx → LucideIcon`. Responsive `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`. `card` class on each tile; 44×44 sunset-green-50 disc holds the icon. JSDoc explains the cream-on-cream adjacency trade-off and points at Decisions.md. |
| [scripts/seed-faq-content-integration.mjs](scripts/seed-faq-content-integration.mjs) | Idempotent Sanity seed for 7 SEO FAQs. Modeled on `migrate-faq-to-divisions.mjs` (M.01e). Operator runs `npx tsx scripts/seed-faq-content-integration.mjs` locally with `SANITY_API_WRITE_TOKEN`. Deterministic `_id`s like `faq-seo-paver-patio-cost-illinois`; `createOrReplace` for re-run safety; per-FAQ created/replaced logging. `order: 100 + idx` keeps SEO FAQs sorted to the end of each scope's rendered list. |
| [src/_project-state/Phase-M-10b2-Completion.md](src/_project-state/Phase-M-10b2-Completion.md) | This report. |

### Modified

| Path | Reason |
|---|---|
| [src/app/[locale]/qa/page.tsx](src/app/[locale]/qa/page.tsx) | Rewrote types + iteration loop for the new 7-category shape. `QaCategory` literal union (5 keys) replaced by `CategoryKey = (typeof CATEGORY_ORDER)[number]` (7 keys). `QaQuestion = {id, category, q, a}` replaced by `QaItem = {q, a}` + `QaCategoryData = {title, eyebrow, questions[]}`. `byCategory` Record-bucket-by-category gone (questions now live INSIDE each category in the i18n source). Page reads `t.raw('categories') as Record<CategoryKey, QaCategoryData>` and iterates `CATEGORY_ORDER`. Added an eyebrow above each category H2 to use the new `eyebrow` field. JSDoc updated to point at M.10b and explain `CATEGORY_ORDER` is the single source of display order. |
| [src/app/[locale]/page.tsx](src/app/[locale]/page.tsx) | Imported `HomeWhySunset` and inserted `<HomeWhySunset />` between `<HomeProjects />` and `<HomeCTA />`. No other edits. |
| [src/components/sections/about/AboutBrandStory.tsx](src/components/sections/about/AboutBrandStory.tsx) | Added a 4th `<p>` rendering `{t('p4')}` (same styling as p1/p2/p3: `mt-4`, `text-body-lg`, secondary color, `60ch` max-width). No type / prop changes. |
| [src/messages/en.json](src/messages/en.json) | `qa.*` namespace rewritten — `qa.categories.<7 keys>.{title, eyebrow, questions[]}`. `qa.hero.dek` updated for the new "28 questions" count + 7-category surface. New `home.whySunset.*` namespace inserted between `home.projects` and `home.cta`. `about.story.p4` appended. p1/p2/p3 in `about.story` enriched per Marcin's narrative. |
| [src/messages/es.json](src/messages/es.json) | Parallel changes. `usted` register for `qa.*` per M.01f1 informational-surface matrix; `tú` for `home.whySunset` card bodies (marketing surface), with `whySunset.h2` using a 3rd-person address ("Le respondemos a nuestros clientes...") that reads naturally without forcing direct `tú`. **Also folded in a pre-existing JSON-parse fix:** the file ended with `\n  }\n}` after the valid JSON close (introduced in commit `47a74790` / M.01f1) and failed `JSON.parse` strict-mode; removed the 3 trailing junk lines as part of the M.10b es.json rewrite. |
| [Sunset-Services-Decisions.md](Sunset-Services-Decisions.md) | Appended the new 2026-05-27 entry covering the 4 work units + 8 in-phase decisions. |
| [src/_project-state/current-state.md](src/_project-state/current-state.md) | Last-completed-phase bumped to M.10b with full summary block (dense style matching the M.10 / M.01f1 / M.01e-pt2 entries); prior phases shifted down by 1. New "What works (Phase M.10b additions)" sub-block. Operator-follow-up entry for the Sanity seed run added. |
| [src/_project-state/file-map.md](src/_project-state/file-map.md) | New "Phase M.10b" section listing all new + modified files with one-line descriptions. |

### NOT modified

- `sanity/schemas/faq.ts` — schema unchanged; the existing `scope: string` field validates `service:*` / `city:*` prefixes (and others), which already covers the 7 SEO FAQ scopes. The Studio doesn't need a re-deploy.
- `scripts/validate-schema.mjs`, `scripts/validate-seo.mjs`, `scripts/validate-a11y.mjs` — no new served routes; `EXPECTED_PATHS` in `validate-seo.mjs` already covers `/qa/`. The Q&A page's BreadcrumbList JSON-LD shape is unchanged.
- `src/app/sitemap.ts` — same reason: no new routes.
- `next.config.ts` — no new redirects (no retired URLs).
- `src/data/*.ts` — no data-layer changes.
- `src/lib/schema/*.ts` — no schema-builder changes.
- `package.json` — no new dependencies. The HomeWhySunset icons are all already-imported `lucide-react` exports.

## Verification

| Harness | Result | Notes |
|---|---|---|
| `node -e "JSON.parse(require('fs').readFileSync('src/messages/en.json'))"` | ✅ PASS | Clean. |
| `node -e "JSON.parse(require('fs').readFileSync('src/messages/es.json'))"` | ✅ PASS | Clean **after the pre-existing trailing-junk fix** (3 extra lines introduced in M.01f1, removed in M.10b). |
| EN/ES `qa.categories` key parity | ✅ PASS | Both expose the same 7 keys in the same order: `projectPlanning`, `pricing`, `materials`, `retainingWalls`, `outdoorLiving`, `maintenance`, `trust`. Total 28 Q&As each side. |
| EN/ES `home.whySunset.cards` count | ✅ PASS | 8 cards each side. |
| EN/ES `about.story.p4` present | ✅ PASS | Both. |
| `npx tsc --noEmit` (non-baseline filter) | ✅ PASS | Zero non-baseline errors. The pre-existing worktree-only module-not-found errors (`@/assets/*`, `@upstash/redis`, `@googlemaps/js-api-loader`, `prettier/standalone`, `@react-email/render`, `google.maps` namespace) all still surface; none introduced by M.10b. Same baseline documented in `Phase-M-01d-Completion.md`, `Phase-M-01e-Completion.md`, etc. |
| `npm run lint` | ✅ PASS (0 errors) | 10 pre-existing warnings, none in M.10b files. The `CategoryKey` type in `qa/page.tsx` is referenced (used in the `Record<CategoryKey, QaCategoryData>` cast); not flagged. |
| `node --check scripts/seed-faq-content-integration.mjs` | ✅ PASS | Syntax clean. |
| Browser preview (dev server) | ⏭️ SKIPPED | Operator's existing `next dev` server held port 3000 against the main repo; Next 16 refuses a second concurrent dev server. Operator confirmed via Chat to skip and rely on Vercel Preview post-merge verification. Page logic + i18n + types were all verified by reading the modified files. |
| `npm run validate:schema` | ⏭️ DEFERRED to operator | Requires a running dev server. No new served routes; should pass unchanged. |
| `npm run validate:seo` | ⏭️ DEFERRED to operator | Same. `EXPECTED_PATHS` already covers `/qa/`. |
| `npm run validate:a11y` | ⏭️ DEFERRED to operator | Same. |
| Sanity SEO FAQ seed run | ⏭️ DEFERRED to operator | `npx tsx scripts/seed-faq-content-integration.mjs` with `SANITY_API_WRITE_TOKEN` in `.env.local`. Idempotent; safe to re-run. |

## Visible behavior changes

1. **`/qa/` and `/es/qa/`** render 7 category sections (was 5). 28 Q&As (was 25). New category eyebrow appears above each H2 (e.g. "Planning" above "Project planning & process"). Hero dek copy updated to reflect the 28-question count and 7-category coverage. CTA section unchanged. Visual treatment of accordion items + spacing unchanged.

2. **`/` and `/es/`** show a new 8-card "Why Sunset" section between the Projects band and the bottom CTA. Eyebrow ("Why Sunset" / "Por qué Sunset") + H2 ("We answer to our customers — not outside investors." / "Le respondemos a nuestros clientes — no a inversionistas externos.") + 1-line dek + responsive 4×2 / 2×4 / 1×8 grid of cards. Each card: icon disc + label + 1-sentence body.

3. **`/about/` and `/es/about/`** show a 4th paragraph in the brand-story section, carrying the brand-values summary ("our goal isn't to sell projects — it's to help homeowners make smart investments"). p1/p2/p3 are slightly enriched with Marcin's "locally owned, not investor-backed, long-term relationships" themes, weaving into the existing 25-year history narrative.

4. **Sanity FAQ corpus** gains 7 SEO-targeted documents (after operator runs the seed script) — 5 scoped to `service:hardscape:patios-walkways`, 1 to `city:naperville`, 1 to `service:hardscape:driveways`. They surface on the corresponding service-detail / city-detail pages' FAQ band, sorted to the end of each scope (because `order: 100+`).

## Operator follow-up

1. **Run the Sanity seed:**
   ```
   npx tsx scripts/seed-faq-content-integration.mjs
   ```
   Requires `SANITY_API_WRITE_TOKEN` + `NEXT_PUBLIC_SANITY_*` in `.env.local`. Idempotent — re-runs are no-ops (createOrReplace against deterministic `_id`s).

2. **Re-run the three Bucket-B validation harnesses** against a running dev server or the post-merge Vercel Preview:
   ```
   npm run validate:schema
   npm run validate:seo
   npm run validate:a11y
   ```
   No new served routes; should pass unchanged. The `EXPECTED_PATHS` list in `validate-seo.mjs` already covers `/qa/` (added in M.01e).

3. **Vercel Preview walk-through:**
   - `/qa/` and `/es/qa/` — verify 7 categories render in the expected order, eyebrows appear, all 28 Q&As load.
   - `/` and `/es/` — verify the new Why Sunset section sits between Projects and CTA, icons render, 8 cards in the responsive grid.
   - `/about/` and `/es/about/` — verify p4 renders below p3 in the brand-story band.

4. **Spanish native review (M.03 carry-over):** the new ES strings ship as straight first-pass LatAm Spanish per the M.01f1 lock (no `[TBR]` markers). Erick reviews natively during M.03 alongside the rest of the M.01d/e/e-pt2/M.10 ES content.

## In-phase decisions

Eight decisions surfaced + resolved during execution. Full text in `Sunset-Services-Decisions.md` 2026-05-27 entry §2:

1. Completion-report filename renamed to `Phase-M-10b2-Completion.md` to avoid Windows/git case-insensitive collision with the prior `Phase-M-10B-Completion.md`.
2. HomeWhySunset surface = cream; accepts one cream-cream adjacency with HomeCTA (alternation is impossible at the insertion point with only cream/white).
3. Q&A page `CATEGORY_ORDER` remains the single display-order source; adding a category requires editing both the i18n JSON and the page const.
4. Pre-existing `es.json` trailing-junk (3 lines, M.01f1 commit `47a74790`) fixed as part of this phase so `JSON.parse` passes per the M.10b validation spec.
5. About brand-story grew 3 → 4 paragraphs (the spec said "can grow to 2-3"; interpreted as "growth is permitted"); 4 was right-sized to avoid overstuffing the existing chronology.
6. ES `home.whySunset.h2` uses 3rd-person "Le respondemos" instead of strict `tú` for the H2 line — reads more naturally; card bodies stay `tú`.
7. SEO FAQ ES translations use `usted` per the M.01f1 informational-surface matrix.
8. No deviations from the user's per-FAQ scope table; all 7 use the exact scopes specified.

## Definition of Done check

- [x] `/qa/` namespace restructured to 7 categories × 28 Q&As, EN + ES.
- [x] Q&A page consumes the new shape and renders 7 categories without a hardcoded count.
- [x] HomeWhySunset section component created at `src/components/sections/home/HomeWhySunset.tsx`.
- [x] HomeWhySunset wired into `src/app/[locale]/page.tsx` between Projects and CTA.
- [x] `home.whySunset.*` i18n namespace added in EN + ES with 8 cards each.
- [x] About brand-story enriched (EN + ES) with Marcin's "locally owned / not PE / long-term relationships / smart investments" themes, preserving the 25-year history framing.
- [x] `scripts/seed-faq-content-integration.mjs` written (idempotent; createOrReplace; 7 FAQs with bilingual content and the user's scope tags).
- [x] All 3 root-level state docs updated (`Decisions.md`, `current-state.md`, `file-map.md`).
- [x] `JSON.parse` clean on both messages files (pre-existing trailing-junk in `es.json` fixed).
- [x] `npx tsc --noEmit` shows zero non-baseline errors.
- [x] `npm run lint` shows zero errors.
- [ ] Browser preview verification — **skipped** per operator decision (existing dev server on port 3000 holds the slot; verify on Vercel Preview).
- [ ] `validate:schema|seo|a11y` re-run — **operator step** (no served-route changes; should pass unchanged).
- [ ] Sanity SEO FAQ seed run — **operator step** (idempotent; `npx tsx scripts/seed-faq-content-integration.mjs`).
- [x] Commits in logical chunks (per the user spec; see commit log on the branch).
- [x] PR opened against main, NOT merged.

## Suggested commit message (per logical chunk)

The phase prompt asked for 6 logical commits:
1. `feat(i18n,qa): Phase M.10b — rewrite qa.* namespace to 7 categories / 28 questions`
2. `feat(qa): Phase M.10b — Q&A page reads the new 7-category i18n shape`
3. `feat(home): Phase M.10b — new HomeWhySunset section + home.whySunset.* i18n`
4. `feat(about): Phase M.10b — enrich brand story with Marcin's narrative (p4)`
5. `chore(sanity): Phase M.10b — seed-faq-content-integration.mjs for 7 SEO FAQs`
6. `docs: Phase M.10b — Decisions + Completion + current-state + file-map`

**Phase status:** Complete on branch. Hand off to operator for the 4 follow-up items.
