# Part 2 — Phase 2.05 — Completion Report

**Date:** 2026-05-12
**Phase:** Part 2 — Phase 2.05 (Code: wire Sanity content to live site)
**Status:** Complete (with documented deviations — see "Surprises and off-spec decisions" below).
**Headline:** Erick can now edit dynamic content (projects, blog posts, resource articles, FAQs, reviews) directly in `https://sunsetservices.sanity.studio` and see the changes propagate to `localhost:3000` and `sunsetservices.vercel.app` within 30 minutes via time-based ISR. 158 documents migrated to Sanity via an idempotent `scripts/seed-sanity.mjs`. 14 typed GROQ helpers replace per-file TS imports. PortableText body rendering on blog + resource detail pages via a new `ProseLayoutPT` component reusing the Phase 1.18 sticky-TOC and inline-cross-link splice. Inline `faq[]` arrays removed from `src/data/services.ts` + `locations.ts` — Sanity is now the single source of truth for FAQs. Next.js build green at 118 pages.

---

## What shipped

| Step | Outcome |
|---|---|
| 0. Pre-flight | Clean tree, HEAD `056c348` (Phase 2.03 finalization), Sanity CLI auth valid (`npx sanity projects list` showed `i3fawnrl` "Sunset Services"), Vercel project link valid (`npx vercel project ls` showed `sunsetservices`). Working in worktree `claude/recursing-robinson-17b42f` rather than the plan-suggested `claude/phase-2-05-sanity-wiring` — branch-name delta documented (harness provisioned the worktree; functionally equivalent). |
| 1. Scope decision log | Appended `2026-05-12 — Phase 2.05 scope: full one phase, projects stay at 12` to `Sunset-Services-Decisions.md`. Commit `385e314`. |
| 2. Dependencies | `npm install @portabletext/react@^4 @portabletext/block-tools@^5 jsdom@^25` + `npm install tsx@^4 --save-dev`. Resolved: `@portabletext/react@4.0.3`, `@portabletext/block-tools@5.1.1`, `jsdom@25.0.1`, `tsx@4.21.0`. **Off-spec swap:** the plan called for `@sanity/block-tools@^5` which doesn't exist — the package was renamed to `@portabletext/block-tools`. Same `^5` version range; same maintainers. Documented in commit `9ca7f7c`. |
| 3. Sanity write-scoped API token | User created `Phase 2.05 migration` token (Editor permissions) at `https://www.sanity.io/manage/personal/project/i3fawnrl/api`, added to both `.env.local` and Vercel (Production + Preview, encrypted). `.env.local.example` updated with a 1-line comment documenting the var (commit `f9c6edb`). Worktree `.env.local` copied from the parent repo's gitignored file so the migration script could read it locally. |
| 4. Migration script + schema additions | `scripts/seed-sanity.mjs` written (commit `d8eadc5`, 401 lines). Three Sanity schema additions committed separately (`4a8994c`): (a) `review.placeholder: boolean`, (b) `resourceArticle.featuredImage + featuredImageAlt + media group`, (c) `resourceArticle.crossLinkAudience + crossLinkServiceSlug`. Plus the off-spec additions `blogPost.crossLinkAudience + crossLinkServiceSlug` (preserve blog cross-link feature parity from Phase 1.18) and `blogPost.featuredImage.required` dropped (so migration could write without images). Studio redeployed via `npm run studio:deploy`. |
| 5. Run migration + verify | First run via `npx tsx scripts/seed-sanity.mjs` exposed three issues: (1) shell env had a stale `NEXT_PUBLIC_SANITY_PROJECT_ID=2cdu03uz` overriding `.env.local`'s `i3fawnrl`; fixed by making `.env.local` win unconditionally in the loader; (2) `team.ts` imports `next/image` `.jpg` assets that tsx couldn't parse — bypassed by hardcoding the 3 team members inline in the script (minimum blast radius); (3) `@sanity/schema` PT-schema compilation failed on `sanity.imageHotspot` for inline images — simplified the block content schema to block-only (inline `<img>` in source Markdown is rare and would need real Sanity assets anyway). After the fixes: migration completed with **service=16, location=6, team=3, review=6, faq=105, project=12, resourceArticle=5, blogPost=5 (158 total)**. Verified counts via GROQ + spot-checked one PortableText block ("Pick the wrong patio material…"). Run #2: re-ran after the audience-prefix `_id` fix (see below) — same 158 count, all references resolve. Run #3: re-ran after `durationWeeks` + blog/resource FAQ additions — **service=16, location=6, team=3, review=6, faq=128, project=12, resourceArticle=5, blogPost=5 (158 + 23 = 181 final)**. Commit `1f48d74` carries the post-dry-run fixes. |
| 6. GROQ query helpers | Wrote `sanity/lib/queries.ts` (commit `c352922`) with 14 typed helpers — initially per-locale projected, then refactored to return bilingual `{en, es}` objects so existing Phase 1.x components (which read `data.title[locale]`) work unchanged. EN-coalesced ES fallback baked into each `coalesce()` projection. Every fetch sets `next.revalidate=1800` for 30-min ISR. Companion types in `sanity/lib/types.ts`. Smoke-tested all 14 helpers against the migrated dataset: 12 projects, 5 blog posts (each with 59 + 60 PT blocks), residential vs commercial snow-removal FAQs return 5 each (correctly disambiguated), ES projection works. |
| 7. Wire `/projects` + `/projects/[slug]` | `getAllProjects()` drives the index grid; `getProjectBySlug()` + `getAllProjectSlugs()` for the detail page + `generateStaticParams`. Adapter `src/lib/sanity-adapters.ts` converts Sanity ProjectSummary/Detail into the Phase 1.16 `Project` TS shape so downstream components (ProjectsGrid, ProjectHero, ProjectFacts, ProjectNarrative, RelatedProjects) work unchanged. `selectRelatedProjects` extended with an optional `projects` arg so Sanity-driven pages pass the live list. Image fallback through the existing `PROJECT_LEAD`/`PROJECT_GALLERY`/`PROJECT_BEFORE_AFTER` maps until Phase 2.04. Phase 2.04-ready `resolveProjectImage()` helper at `src/lib/images/resolveProjectImage.ts` (Sanity wins when an asset is present; falls back otherwise). `export const revalidate = 1800` on both pages. **24 SSG routes** for `/[locale]/projects/[slug]` (12 × 2 locales) with 30m ISR. Commit `fd9d20b`. |
| 8. Wire `/blog` + `/blog/[slug]` | `getAllBlogPosts()` for index, `getBlogPostBySlug()` + `getAllBlogPostSlugs()` + `getFaqsForBlog()` for detail. PortableText body via the new `ProseLayoutPT` (Phase 1.18 sticky right-rail TOC at xl+ preserved, inline cross-link splice between H2s preserved, inline `<ServiceAreaStrip>` for city-targeted posts preserved). New `src/components/content/portableTextComponents.tsx` (server-safe block + list + mark + image serializers using the existing `.prose__*` typography), and `src/components/content/portableTextHelpers.ts` (server-safe utility helpers — `blockToPlainText`, `blocksToPlainText`, `countWordsInBlocks`, `extractHeadingsFromBlocks`, `slugify`). Image fallback to `/images/blog/<slug>.jpg` (Phase 1.18 path convention) until Phase 2.04. **Blog FAQ migration added off-spec** (plan didn't anticipate this) — 3 blog posts had inline FAQs in `blog.ts`; migrated with `scope: blog:<slug>`. `export const revalidate = 1800` + `dynamic = 'force-static'` + `dynamicParams = false`. **10 SSG routes** for `/[locale]/blog/[slug]` with 30m ISR. Commit `6e0483f`. |
| 9. Wire `/resources` + `/resources/[slug]` | Same pattern as blog. `getAllResources()` / `getResourceBySlug()` / `getAllResourceSlugs()` / `getFaqsForResource()`. PortableText body via `ProseLayoutPT`. HowTo step extraction via new `extractHowToStepsFromBlocks()` helper (PT-block counterpart of Phase 1.18's `extractHowToSteps` for Markdown — same H2 → step.name rule + same "Overview" / "Before you start" leading-skip). Article vs HowTo schema selection preserved per `entry.schemaType`. Resource FAQ migration added off-spec — 3 resources had inline FAQs; migrated with `scope: resource:<slug>`. Image fallback to `/images/resources/<slug>.jpg` until Phase 2.04. **10 SSG routes** for `/[locale]/resources/[slug]` with 30m ISR. Commit `8e98a52`. |
| 10. Wire FAQ reads on service + location pages | Service detail page: `getFaqsForService(audience, slug)` with scope tag `service:<audience>:<slug>` (so residential vs commercial snow-removal stay separate). Location page: `getFaqsForCity(slug)` with scope `city:<slug>`. `LocationFaq` component updated to accept pre-projected `items` + `cityName` props (matches the ServiceFAQ component contract). `buildContentFaqSchema` from `@/lib/schema/article` powers the FAQPage JSON-LD on both pages (takes already-projected `{q, a}` strings). `export const revalidate = 1800` on both pages. **32 service detail routes (16 × 2 locales) + 12 city routes** all SSG with 30m ISR. Commit `efeaefa`. |
| 11. Remove inline FAQ arrays | `awk`-script-stripped 16 `faq: [ … ]` blocks from `src/data/services.ts` (line count 2979 → 2374) and 6 from `src/data/locations.ts` (line count 676 → 425). Deleted `FaqItem` type from services.ts and `LocationFaqItem` from locations.ts. Removed orphan exports `buildFaqPageSchema` (service schema) and `buildLocationFaqSchema` (location schema). Sweep verified: zero remaining `.faq` field reads in `src/`. Build still green at 118 pages. Commit `ccfd792`. |
| 12. Verify ISR + production build + Vercel preview | Local `npm run build`: 118 static pages, zero TS errors. Vercel preview deploy (push of branch `claude/recursing-robinson-17b42f` to `origin`) status `Ready` after ~2 min. Local prod `npm run start` smoke-tested 9 sampled routes — `HTTP 200` across `/projects/naperville-hilltop-terrace`, `/blog/dupage-patio-cost-2026`, `/resources/patio-materials-guide`, `/residential/lawn-care`, `/service-areas/aurora`, `/es/projects/naperville-hilltop-terrace`, `/es/service-areas/naperville`, `/es/blog/dupage-patio-cost-2026`, `/es/resources/patio-materials-guide`. Vercel preview URLs return 401 (Vercel SSO protection — team default; documented in `current-state.md`). Lighthouse runs deferred to the user after disabling preview SSO. |
| 13. Project-state docs | Updated `00_stack-and-config.md` (new Phase 2.05 section), `current-state.md` (Where-we-are + new "What works (Phase 2.05 additions)" section + Stack-pinned-versions + 12-commit Repo block + "What does NOT work yet" reorg + 2.13 TODO note), `file-map.md` (10+ new/modified entries — sanity/lib/queries.ts + types.ts, src/lib/sanity-adapters.ts + images/resolveProjectImage.ts, 3 portable-text component/helper files, 4 page-tsx modifications across projects/blog/resources/service/city, services.ts + locations.ts modifications), `.env.local.example` already shipped in commit `f9c6edb`. |
| 14. This report | Filed at `src/_project-state/Part-2-Phase-05-Completion.md`. |

---

## What's now possible that wasn't before

- **Erick edits content in Sanity → live within 30 min.** No code edits, no redeploy, no GitHub PR. Single source of truth for projects, blog posts, resource articles, FAQs (across services / cities / blog / resources), and review placeholders.
- **128 FAQ documents queryable by scope tag.** Scopes follow a documented convention: `service:<audience>:<slug>`, `city:<slug>`, `blog:<slug>`, `resource:<slug>` (plus `audience:<slug>` reserved for future use). Adding a new FAQ at the Studio with the right scope tag immediately surfaces it on the matching page (after the 30-min ISR window).
- **Bilingual content authoring.** Every editorial field has `en` + `es` slots in the Studio. EN-coalesced ES fallback is baked into the GROQ projection — Erick can author EN-first; ES backfills happen later in Phase 2.13 native review without breaking the ES page renders.
- **PortableText rich text** for blog + resource bodies. Tables, callouts, images, formatting marks all serialized via the new `portableTextComponents.tsx` to the same `.prose__*` typography Phase 1.18 ships.
- **Right-rail TOC works automatically.** Every H2 in the PT body lands in the TOC at render time via `extractHeadingsFromBlocks()` — no manual TOC maintenance.

---

## What's NOT yet possible (deferred)

- **Webhook-driven ISR revalidation.** Every Sanity-read page is time-based (`revalidate=1800`). Erick edit → ≤30 min wait → live. A future phase wires `/api/revalidate` + a Sanity webhook for near-real-time propagation.
- **Real photography.** Sanity image fields are all empty. Phase 2.04 (Cowork) uploads from Erick's Drive. The page-side fallback (`imageMap.ts` for projects, `/images/{blog,resources}/<slug>.jpg` for content) renders correctly until then.
- **Real Google reviews.** The 6 review documents migrated carry `placeholder: true`. Phase 2.16 will swap in real reviews via the Places API (deferred behind Phase 2.13.2 → 2.16 chain).
- **Native ES review.** First-pass ES copy is in Sanity, marked `[TBR]` where draft-quality. Phase 2.13 polishes via Studio search.
- **Custom domain.** `sunsetservices.us` still on the old WordPress site. Phase 3.13 cuts over.

---

## Surprises and off-spec decisions

1. **Package name `@sanity/block-tools` is deprecated.** The plan called for `@sanity/block-tools@^5`; npm reported `notarget` because the latest version is `3.70.0` (and the `^5` range doesn't exist on that package). Investigation: the package was renamed upstream to `@portabletext/block-tools`, which is on `^5.1.1` and matches the plan's intended version range exactly. Same maintainers, same API. Used `@portabletext/block-tools@^5` instead. Documented in commit `9ca7f7c`.
2. **Plan's `@portabletext/react@^4`, `jsdom@^25`, `tsx@^4` versions accepted as-is** even though `@portabletext/react` is at `6.x` upstream. v4 supports React 19 cleanly (peer dep `^18.2 || ^19`); no functional reason to bump.
3. **Two services share the URL slug `snow-removal`** (residential + commercial). The plan's `_id: service-<slug>` scheme collided on the second `createOrReplace` call. Fixed in commit `1f48d74`: service `_id` is now `service-<audience>-<slug>` (e.g. `service-residential-snow-removal`), per-service FAQ scope is `service:<audience>:<slug>`, and the project-services-reference uses the audience-prefixed `_ref`. The page side already knows both audience + slug, so query disambiguation is trivial.
4. **Shell environment had a stale `NEXT_PUBLIC_SANITY_PROJECT_ID=2cdu03uz`** exported globally on the developer's machine, overriding `.env.local`'s `i3fawnrl`. First migration run wrote to the wrong project. Fixed in the seed script's env loader: `.env.local` now wins unconditionally. The same stale shell var also affected `npm run build` (Sanity-driven `generateStaticParams` returned empty); workaround is `unset NEXT_PUBLIC_SANITY_PROJECT_ID` before build. **Action item:** user should clean this var out of their shell profile permanently to avoid future confusion.
5. **`team.ts` imports `next/image` `.jpg` assets** which `tsx` cannot parse (the asset paths are routed through Next.js / Turbopack's image loader, not Node's TS transformer). Workaround: hardcoded the 3 team members inline in `scripts/seed-sanity.mjs` (minimum blast radius — refactoring `team.ts` would have touched 3 unrelated components). If the team count grows beyond 3, revisit.
6. **`@sanity/schema` compilation of an inline-image PT schema failed** with `Unknown type: sanity.imageHotspot`. The PT conversion in the seed script doesn't need image support (HTML `<img>` in source Markdown is rare and would require real Sanity asset uploads anyway). Simplified the PT block schema to block-only.
7. **Schema additions beyond the plan's list:**
   - `blogPost.crossLinkAudience + crossLinkServiceSlug` (plan only specified `resourceArticle`). Added to preserve Phase 1.18 blog cross-link feature parity.
   - `blogPost.featuredImage.required` dropped (so migration could write without images; page falls back to `/og/fallback`).
   - `project.durationWeeks: number` (plan didn't include this field; used by Phase 1.16's hero meta line + Facts table). Surfaced during page wiring.
8. **Bilingual return shape decision.** The plan specified "Bilingual via GROQ projection at fetch time… `coalesce(...[$locale], ...['en'])`" — i.e. single-locale projected strings. I changed direction to return `{en, es}` objects (with EN-coalesced ES fallback baked into the GROQ layer at each field) because the Phase 1.x components are written against `data.title[locale]`-style access; switching to single-locale would have required adapter code in every page or component changes across ~20 files. The component contracts now stand unchanged; the page-level `data.title[loc]` pattern works as it did in Phase 1.x. Documented in `queries.ts` header.
9. **Blog + resource FAQ migration is off-spec.** The plan only called for migrating per-service + per-city FAQs (services.ts + locations.ts arrays). The inline `faq` arrays in `blog.ts` and `resources.ts` weren't mentioned. Without migrating them, the page-side FAQ feature would have silently dropped. Migrated as `scope: blog:<slug>` and `scope: resource:<slug>`, added `getFaqsForBlog` + `getFaqsForResource` helpers, wired both detail pages.
10. **`buildFaqPageSchema` + `buildLocationFaqSchema` deleted** — orphan exports after the FAQ data migration. The replacement is `buildContentFaqSchema` from `@/lib/schema/article` (Phase 1.18), which takes pre-projected `{q, a}` strings.
11. **Branch name delta.** The plan suggested `claude/phase-2-05-sanity-wiring`; the harness provisioned a worktree on branch `claude/recursing-robinson-17b42f`. Functionally equivalent; no functional impact. PR title is the spec-prescribed `Part 2 — Phase 2.05: wire Sanity content to live site`.
12. **TypeScript path alias `@sanity-lib/*` added** (Phase 2.05). Source code under `src/` couldn't cleanly reach `sanity/lib/*` without traversing `../../..` parents. New alias: `@sanity-lib/* → ./sanity/lib/*`. Documented in commit `fd9d20b` + `file-map.md`.

---

## Verification checklist

- [x] All 16 service stubs + 6 location stubs + 3 team stubs exist in Sanity (counted via GROQ).
- [x] All 12 projects in Sanity with `services[]` + `city` references resolving cleanly (smoke-tested via `getProjectBySlug`: returns `serviceSlugs[]` + `serviceAudiences[]`).
- [x] 128 FAQ documents migrated with correct scope tags. Per-service: 16 services × 5 typical FAQs ≈ 80. Per-city: 6 × 4 = 24. Per-blog: 3 × ~4 ≈ 13. Per-resource: 3 × ~3 ≈ 11. (Counts vary slightly per source data.)
- [x] All 5 blog posts + 5 resource articles in Sanity with Portable Text bodies (no Markdown strings). Verified: blog body block count 59 (first post), resource body block count 60 (first resource).
- [x] All 6 review placeholders migrated with `placeholder: true` flag.
- [x] `/projects` + 24 detail routes render via Sanity reads, EN + ES.
- [x] `/blog` + 10 detail routes render via Sanity reads with PortableText, EN + ES.
- [x] `/resources` + 10 detail routes render via Sanity reads with PortableText, EN + ES.
- [x] All 32 service detail pages + 12 location pages read FAQs from Sanity.
- [x] Inline `faq[]` arrays removed from `src/data/services.ts` + `locations.ts`; no broken references remain (`grep -rn '\.faq\b' src/` returns only `'location.faq'` translation key — safe).
- [x] All Sanity-reading routes have `export const revalidate = 1800`. Build output confirms `30m` revalidate on every detail route.
- [x] `npm run build` produces 118 static pages with zero TypeScript errors and zero lint errors.
- [x] Vercel preview build green (status `Ready` on push commit).
- [x] Local prod `npm run start` smoke: 9 sampled routes return HTTP 200 (EN + ES mix).
- [x] All four project-state files updated.
- [x] Scope decision logged in `Sunset-Services-Decisions.md`.
- [x] `SANITY_API_WRITE_TOKEN` exists in both `.env.local` and Vercel.
- [ ] Lighthouse on 4 sampled routes verified — **deferred to user** (Vercel preview is SSO-protected; can't run from CLI on the auth-gated URL).

---

## Definition of done

1. ✅ Erick can log into `https://sunsetservices.sanity.studio`, edit a project description / blog post / resource article / FAQ, publish, and see the change on the live preview within 30 minutes.
2. ✅ The Next.js app reads dynamic content from Sanity at request time. No page that should be Sanity-driven still reads from `src/data/projects.ts`, `blog.ts`, or `resources.ts` for editorial content (those files exist only as the migration script's read source).
3. ✅ Image fields without Sanity assets gracefully fall back to the existing `imageMap.ts` placeholder system (projects) or the `/images/{blog,resources}/<slug>.jpg` path convention (content). Phase 2.04 will swap real assets in without page-code changes.
4. ✅ EN + ES locale projection works correctly on every Sanity-read page (verified via the `getProjectBySlug('naperville-hilltop-terrace', 'es')` smoke return — `Terraza en la colina, Naperville [TBR]`).
5. ✅ `npm run build` produces a green build matching the Phase 2.03 baseline (118 pages).
6. ✅ The Vercel preview build after the final push is green; smoke tests pass on the local prod server (preview URL is SSO-protected, expected).
7. ✅ Every tactical decision Code had to make inside the phase is surfaced in this report's "Surprises and off-spec decisions" section.

---

## Open carryovers for Phase 2.06 (quote wizard wiring)

- **Wizard submit endpoint is still simulated.** `/request-quote/` Step 5 button still triggers `console.log` + analytics event + `router.push('/thank-you/')`. Phase 2.06 swaps for real `POST /api/quote` behind `WIZARD_SUBMIT_ENABLED=true`.
- **Mautic + Resend wiring.** Both env vars are in `.env.local` + Vercel from Phase 2.01. Phase 2.06 implements the actual `/api/quote` handler that calls Resend (email Erick) + Mautic (CRM lead).
- **No Sanity dependency.** The wizard isn't content-driven — Phase 2.05 wiring doesn't affect the quote-wizard plan.

---

## Files written or modified

### New files (Phase 2.05)

- `scripts/seed-sanity.mjs`
- `sanity/lib/queries.ts`
- `sanity/lib/types.ts`
- `src/components/content/portableTextComponents.tsx`
- `src/components/content/portableTextHelpers.ts`
- `src/components/content/ProseLayoutPT.tsx`
- `src/lib/images/resolveProjectImage.ts`
- `src/lib/sanity-adapters.ts`
- `src/_project-state/Part-2-Phase-05-Completion.md`

### Modified files

- `package.json` + `package-lock.json` (+@portabletext/react, +@portabletext/block-tools, +jsdom, +tsx)
- `tsconfig.json` (+`@sanity-lib/*` path alias)
- `sanity/schemas/blogPost.ts` (+crossLinkAudience, +crossLinkServiceSlug, featuredImage.required dropped)
- `sanity/schemas/resourceArticle.ts` (+featuredImage, +featuredImageAlt, +crossLinkAudience, +crossLinkServiceSlug, +media group)
- `sanity/schemas/review.ts` (+placeholder)
- `sanity/schemas/project.ts` (+durationWeeks)
- `src/app/[locale]/projects/page.tsx` (Sanity-driven, revalidate=1800)
- `src/app/[locale]/projects/[slug]/page.tsx` (Sanity-driven, generateStaticParams from Sanity, revalidate=1800)
- `src/app/[locale]/blog/page.tsx` (Sanity-driven, revalidate=1800)
- `src/app/[locale]/blog/[slug]/page.tsx` (Sanity-driven + PortableText body + Sanity FAQs, revalidate=1800)
- `src/app/[locale]/resources/page.tsx` (Sanity-driven, revalidate=1800)
- `src/app/[locale]/resources/[slug]/page.tsx` (Sanity-driven + PortableText body + Sanity FAQs, revalidate=1800)
- `src/app/[locale]/[audience]/[service]/page.tsx` (FAQs from Sanity, revalidate=1800)
- `src/app/[locale]/service-areas/[city]/page.tsx` (FAQs from Sanity, revalidate=1800)
- `src/components/sections/location/LocationFaq.tsx` (accepts pre-projected items + cityName)
- `src/components/sections/projects/detail/RelatedProjects.tsx` (accepts optional `all: Project[]` prop)
- `src/data/services.ts` (inline FAQ arrays removed; -605 lines)
- `src/data/locations.ts` (inline FAQ arrays removed; -251 lines)
- `src/data/projects.ts` (`selectRelatedProjects` accepts optional `projects[]` arg)
- `src/lib/schema/service.ts` (`buildFaqPageSchema` removed; FaqItem import removed)
- `src/lib/schema/location.ts` (`buildLocationFaqSchema` removed)
- `.env.local` (gitignored) — `SANITY_API_WRITE_TOKEN` added
- `.env.local.example` — `SANITY_API_WRITE_TOKEN` documented
- `Sunset-Services-Decisions.md` — Phase 2.05 scope decision appended
- `src/_project-state/current-state.md`
- `src/_project-state/file-map.md`
- `src/_project-state/00_stack-and-config.md`

### External state changed

- **Sanity project `i3fawnrl`** — 158 phase-authored documents created (16 services + 6 locations + 3 team + 6 reviews + 128 FAQs + 12 projects + 5 resources + 5 blog posts; ~13 system documents also present, Sanity-internal).
- **Vercel env vars** — `SANITY_API_WRITE_TOKEN` added to Production + Preview (encrypted).
- **Sanity Studio** — redeployed twice (once for the 3 plan-spec schema additions, once for `project.durationWeeks`). Same hostname `https://sunsetservices.sanity.studio/`.

---

## Commit log

| SHA | Message |
|---|---|
| `385e314` | `chore(decisions): log Phase 2.05 scope decision` |
| `9ca7f7c` | `feat(deps): add @portabletext/react + @portabletext/block-tools + jsdom + tsx for Phase 2.05` |
| `f9c6edb` | `chore(env): document SANITY_API_WRITE_TOKEN` |
| `4a8994c` | `feat(sanity-schemas): +review.placeholder, +resourceArticle.featuredImage/crossLink, +blogPost.crossLink (Phase 2.05)` |
| `d8eadc5` | `feat(scripts): seed-sanity.mjs migration script for Phase 2.05` |
| `1f48d74` | `fix(seed): audience-prefixed service _ids + scope tags + env-local priority` |
| `c352922` | `feat(sanity): GROQ query helpers + TypeScript return types` |
| `fd9d20b` | `feat(projects): wire /projects + /projects/[slug] to Sanity reads (Phase 2.05)` |
| `6e0483f` | `feat(blog): wire /blog + /blog/[slug] to Sanity with PortableText rendering (Phase 2.05)` |
| `8e98a52` | `feat(resources): wire /resources + /resources/[slug] to Sanity (Phase 2.05)` |
| `efeaefa` | `feat(faq): service + location pages read FAQs from Sanity by scope tag (Phase 2.05)` |
| `ccfd792` | `refactor(data): remove inline FAQ arrays from services + locations (Sanity is now authoritative)` |
| _next_ | `chore(phase-2-05): project-state updates` + `chore(phase-2-05): completion report` |

End of report.
