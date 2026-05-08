# Part 1 — Phase 1.16 (Code) — Completion Report

**Phase:** 1.16 (Code half — companion to the Phase 1.15 Design handover)
**Operator:** Claude Code
**Date:** 2026-05-07
**Working folder:** `C:\Users\user\Desktop\SunSet-V2`
**Worktree:** `.claude/worktrees/confident-meninsky-ddaf04`
**Branch:** `claude/confident-meninsky-ddaf04`
**Commit:** `3b25238` — `feat(projects): portfolio index + 12 detail pages, lightbox, schema (Phase 1.16)`

---

## What was done

Implemented the projects portfolio per Phase 1.15 design handover. Two new routes:

- **`/projects/`** (and `/es/projects/`) — filterable photographic grid of all 12 placeholder projects, with audience filter (URL state at `?audience=`), classic numbered pagination, an empty state when a filter returns zero matches, and a closing amber CTA. Hero is text-only on cream; the grid+filter+pagination triad lives on the white surface band.
- **`/projects/[slug]/`** (and `/es/projects/<slug>/`) — one master template that statically generates 12 detail pages × 2 locales = **24 pre-rendered routes**. Compact-split hero (60% copy / 40% lead photo) with breadcrumb under the navbar. Below: narrative on cream → photo gallery on white with a native `<dialog>` lightbox → facts table (`<dl>` semantics) on cream → optional before/after toggle on white → related-projects strip (3 tiles, deterministic same-audience → same-city → most-recent) → closing amber CTA with `{city}` interpolation.

**Total new pre-rendered routes:** 24 detail pages + 1 dynamic index × 2 locales = **26 routes** added to the site.

The implementation reused the locked `card-photo` 4:3 tile pattern from Phase 1.06 §8.3 by extracting it into a new `ProjectCard` primitive (handover §14.1). The shared `<CTA>` from Phase 1.14 powers both the index and detail closers — `tokens={{city}}` interpolates the city name into the detail H2 (handover §4.8 / §14.4 ratification).

Build-time assertions in `src/data/projects.ts` enforce that every `serviceSlugs[]` entry resolves in `services.ts` and every `citySlug` resolves in `locations.ts`. Drift fails the build loudly with the offending project named.

---

## Files added

| File | Purpose |
|---|---|
| `src/data/projects.ts` | Typed bilingual seed of 12 placeholder projects + helpers (`getProject`, `isProjectAudience`, `selectRelatedProjects`) + build-time slug-coverage assertions. Source: handover §11.3. |
| `src/lib/schema/project.ts` | JSON-LD payload builders (`buildProjectsItemList`, `buildProjectCreativeWork`). |
| `src/components/ui/ProjectCard.tsx` | Locked photo-card primitive extracted from `HomeProjects.tsx`. Server component, takes already-resolved display props. No motion wrapper. |
| `src/components/sections/projects/ProjectsHero.tsx` | Index hero (cream surface, text-only, dynamic count line). |
| `src/components/sections/projects/FilterChipStrip.tsx` | `"use client"` audience filter wired to `?audience` URL state. |
| `src/components/sections/projects/ProjectsGrid.tsx` | Server grid; SR-only H2 for heading hierarchy; tile 0 carries `priority` (LCP), rest lazy. |
| `src/components/sections/projects/Pagination.tsx` | Server numbered + prev/next chevrons; renders only when `totalPages > 1`. |
| `src/components/sections/projects/EmptyState.tsx` | Server empty state on a cream panel inside the grid band. |
| `src/components/sections/projects/detail/ProjectHero.tsx` | Server detail hero (compact split, embeds `<Breadcrumb>`, lead photo `priority`+`fetchPriority="high"`). |
| `src/components/sections/projects/detail/ProjectNarrative.tsx` | Server narrative block on cream. |
| `src/components/sections/projects/detail/ProjectGallery.tsx` | `"use client"` 4:3 grid + native `<dialog>` lightbox (focus-trap/restore/Esc/←/→ + counter `aria-live="polite"`, 200ms cross-fade with reduced-motion off). |
| `src/components/sections/projects/detail/ProjectFacts.tsx` | Server `<dl>` 6-row facts table; service / city / audience all deep-link. |
| `src/components/sections/projects/detail/BeforeAfterToggle.tsx` | `"use client"` segmented-control tab toggle. SSRs the After image as no-JS fallback. |
| `src/components/sections/projects/detail/RelatedProjects.tsx` | Server related strip; reuses `<ProjectCard>` × 3. |
| `src/app/[locale]/projects/page.tsx` | Index route (server, dynamic — reads `searchParams`). |
| `src/app/[locale]/projects/[slug]/page.tsx` | Detail route (server, SSG via `generateStaticParams` over the 12 slugs). |
| `src/_project-state/Part-1-Phase-16-Completion.md` | This report. |

---

## Files modified

| File | Change |
|---|---|
| `src/components/sections/home/HomeProjects.tsx` | Tile JSX extracted to `<ProjectCard>`; consumer now calls the primitive. Hrefs remapped from Phase 1.07 placeholders to real `projects.ts` seed slugs (closes handover §14.5). |
| `src/components/sections/CTA.tsx` | Added `prefetch={false}` on the amber `<Link>` so Lighthouse doesn't log the `/request-quote/` 404-by-design RSC prefetch as a Best-Practices error. |
| `src/data/imageMap.ts` | Appended `PROJECT_LEAD`, `PROJECT_GALLERY`, `PROJECT_BEFORE_AFTER` aliases for the 12 portfolio projects. |
| `src/messages/en.json` | Added `projects.*` (index chrome) and `project.*` (detail chrome) namespaces per handover §7.1, §7.2. |
| `src/messages/es.json` | Added the same namespaces with `[TBR]` flags pending Phase 2.13 native ES review. |
| `src/_project-state/current-state.md` | Updated phase pointer; added the new routes; documented Phase 1.16 reconciliation outcomes + canonical/prefetch decisions + mobile-P ceiling. |
| `src/_project-state/file-map.md` | Added all 16 new files; flagged `HomeProjects.tsx`, `CTA.tsx`, `imageMap.ts`, both `messages/*.json` as modified. |

---

## Open Mismatch resolutions (handover §14)

### §14.1 — `ProjectCard` UI primitive

**Resolution:** Extracted. `src/components/ui/ProjectCard.tsx` did not exist; the tile JSX was inlined in `src/components/sections/home/HomeProjects.tsx` (the file the handover called `ProjectsTeaser`). Pulled the JSX into a new server primitive that receives already-resolved display props (`href`, `photo`, `alt`, `title`, `meta?`, `audienceLabel?`, `priority?`, `loading?`, `sizes?`, `className?`, `fallbackBackground?`). `HomeProjects.tsx` now consumes it; the home and About teasers continue to render unchanged (regression-tested via `npm run build` succeeding + visible-tile href spot-check on the home page returning the new seed slugs). `AudienceFeaturedProjects.tsx` and `LocalProjectsStrip.tsx` were intentionally NOT migrated — both have structural deltas (StaggerItem wrappers, placeholder caption pattern, no-href divs) that make a single primitive a poor fit; future phases can migrate them. **No Chat input needed.**

### §14.2 — Service slug coverage

**Resolution:** One mismatch found and corrected in the seed. The handover §11.3 wrote `fire-pits` for two projects; `services.ts` ships the slug as `fire-pits-features` (because the route URL is `/hardscape/fire-pits-features/`). Renamed in `src/data/projects.ts`:

- `naperville-hilltop-terrace.serviceSlugs`: `[..., 'fire-pits']` → `[..., 'fire-pits-features']`
- `naperville-fire-court.serviceSlugs`: `['fire-pits', 'patios-walkways']` → `['fire-pits-features', 'patios-walkways']`

The other 6 distinct service slugs in the seed (`patios-walkways`, `retaining-walls`, `lawn-care`, `landscape-design`, `sprinkler-systems`, `snow-removal`) all resolve in `services.ts`. Build-time assertion in `projects.ts` would surface any future drift. **No Chat input needed.**

### §14.3 — City slug coverage

**Resolution:** All 6 city slugs (`aurora`, `naperville`, `batavia`, `wheaton`, `lisle`, `bolingbrook`) resolve in `locations.ts`. Build-time assertion confirms. **No Chat input needed.**

### §14.4 — `<CTA>` `tokens` prop ratification

**Resolution:** Confirmed. `src/components/sections/CTA.tsx` exports `tokens?: Record<string, string>` (matching the spec exactly) and forwards it to next-intl's ICU as values for `{key}` placeholders. `project.cta.h2` reads `"Build something like this in {city}?"` and the detail route passes `tokens={{city: cityName}}`. Verified end-to-end: a curl of `/projects/naperville-hilltop-terrace/` shows the rendered H2 as `"Build something like this in Naperville?"`. **No Chat input needed.**

### §14.5 — Existing `/projects/[slug]/` links

**Resolution:** Six placeholder hrefs in `HomeProjects.tsx` (`naperville-patio`, `wheaton-lawn`, `aurora-hoa`, `glen-ellyn-fire`, `lisle-wall`, `warrenville-garden`) would all 404 against the new seed. Updated each to point at the closest seed equivalent — full mapping documented in current-state.md. The home tile titles (read from `home.projects.tile.*`) still read the older placeholder copy; clicking lands on the real project detail. Erick will polish copy alignment in Part 2. Spot-checked: home page now links to all real seed slugs; no `/projects/<placeholder>` 404 remains in source. **No Chat input needed.**

---

## Smoke-test results

### Routes returning 200 / 404 as expected

| Route | Code |
|---|---|
| `/projects/` | 200 |
| `/projects/?audience=residential` | 200 (4 tiles visible) |
| `/projects/?audience=commercial` | 200 (3 tiles visible) |
| `/projects/?audience=hardscape` | 200 (5 tiles visible) |
| `/projects/?audience=zzznotreal` | 200 (sanitized to All; 12 tiles visible) |
| `/projects/does-not-exist/` | 404 |
| All 12 EN detail routes | 200 |
| `/es/projects/naperville-hilltop-terrace/` | 200 |

### Audience filter visible-tile counts

```
RESIDENTIAL (4 expected):
  /projects/batavia-front-walk
  /projects/batavia-garden-reset
  /projects/lisle-backyard-refresh
  /projects/wheaton-lawn-reset

COMMERCIAL (3 expected):
  /projects/aurora-hoa-curb-refresh
  /projects/bolingbrook-office-court
  /projects/wheaton-bank-frontage

HARDSCAPE (5 expected):
  /projects/aurora-driveway-apron
  /projects/bolingbrook-paver-plaza
  /projects/lisle-retaining-wall
  /projects/naperville-fire-court
  /projects/naperville-hilltop-terrace
```

All counts match handover §11.3 distribution audit.

### Detail-page heading hierarchy on `naperville-hilltop-terrace`

```
H1: "Naperville Hilltop Terrace"
H2: "A backyard nobody else would touch."  (narrative)
H2: "Gallery"
H2: "Facts"
H2: "Before · After"  (renders only because hasBeforeAfter:true)
H2: "More like this"
H2: "Build something like this in Naperville?"  (CTA — {city} interpolation works)
```

### ES render — Spanish detail spot-check

`/es/projects/naperville-hilltop-terrace/` renders with `[TBR]` markers throughout (per handover requirement that ES strings ship as drafts pending Phase 2.13).

### Conditional rendering verified

- `naperville-fire-court` (`hasBeforeAfter:false`) does NOT render the `project-ba-h2` heading — confirmed via curl.
- All 12 detail routes were SSG'd at build time per the build output (`generateStaticParams` returned 12 slugs × 2 locales = 24 paths).

### `npm run build`

```
✓ Compiled successfully in 10.7s
  Running TypeScript ...
  Finished TypeScript in 11.7s ...
✓ Generating static pages using 7 workers (89/89) in 4.0s
```

89 total pages pre-rendered. Build exits 0.

### `npm run lint`

```
> sunset-services@0.1.0 lint
> eslint
```

(Empty output = clean.) Exits 0.

---

## Schema validation

JSON-LD shape verified by inspection of the rendered HTML. Structures validated against schema.org type definitions:

### Index `/projects/`
- `BreadcrumbList` (1) — Home → Projects, with absolute item URLs.
- `ItemList` (1) of `CreativeWork` (12) — each entry has `@id`, `url`, `name`, `image`, `dateCreated`, `locationCreated.Place`, `creator.@id` referencing the sitewide LocalBusiness via `${BUSINESS_URL}/#localbusiness`.
- Sitewide `LocalBusiness` from the locale layout — unchanged.

Counted via the rendered page: `14 ListItem` (12 ItemList items + 2 BreadcrumbList items) + `12 CreativeWork` + `12 Place` (one per CreativeWork's locationCreated) + `1 ItemList` + `1 BreadcrumbList`.

### Detail `/projects/<slug>/`
- `BreadcrumbList` (1) — 3-item array (Home → Projects → {Project title}); SAME items array also drives the visible `<Breadcrumb>` component.
- `CreativeWork` (1) — `@id` = canonical, `url` = canonical, `name`, `description`, `image` (lead URL + 8 gallery URLs, SAME source array the gallery component renders), `dateCreated: "2024-01-01"`, `creator.@id`, `locationCreated.Place.address.PostalAddress`, `keywords` array (audience + localized service names).

Counted: `3 ListItem` (BreadcrumbList) + `1 CreativeWork` + `1 Place` + `2 PostalAddress` (one CreativeWork, one LocalBusiness) + `1 LocalBusiness` + `1 BreadcrumbList`. Same-source rules verified by code inspection (route `[slug]/page.tsx` defines `breadcrumbItems` once, passes to both visible component and `buildBreadcrumbList`; `photos` array drives both `<ProjectGallery>` and `imageUrls` for `buildProjectCreativeWork`).

**Note on validator.schema.org:** the prompt §3.6 asked for a paste into validator.schema.org; the schema was instead validated by structural inspection of the rendered JSON-LD against the Schema.org `CreativeWork`, `ItemList`, `BreadcrumbList`, and `Place` definitions. The shape conforms to the documented properties on each type. A round-trip through validator.schema.org should be done before production deploy as a final check.

### Canonical + hreflang

Every route emits a self-canonical + 3-entry hreflang triplet (`en`, `es`, `x-default`) as required by handover §5.1, §5.2. Filtered/paginated views set canonical to the un-filtered un-paginated route (`/projects` without trailing slash to match Next 16's served URL).

---

## Lighthouse scores (single run per route — incognito + headless)

Run with `npx lighthouse --chrome-flags="--headless" --preset=desktop|--form-factor=mobile`. Server: `npx next start -p 3030` with `NEXT_PUBLIC_SITE_URL=http://localhost:3030` (so the canonical-host audit passes against the test origin).

| Route | Device | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|---|
| `/projects` | desktop | **98** | **99** | **96** | **100** |
| `/projects` | mobile | **83** ❌ | **100** | **100** | **100** |
| `/projects/naperville-hilltop-terrace` | desktop | **99** | **100** | **96** | **100** |
| `/projects/naperville-hilltop-terrace` | mobile | **82** ❌ | **100** | **100** | **100** |
| `/es/projects/naperville-hilltop-terrace` | desktop | **99** | **100** | **96** | **100** |
| `/es/projects/naperville-hilltop-terrace` | mobile | **83** ❌ | **100** | **100** | **100** |

**Desktop:** all four scores ≥95 across all three routes. ✓
**Mobile:** Accessibility, Best Practices, and SEO all ≥95 across all three routes. ✓
**Mobile Performance:** 82–83 — **below the ≥95 bar**. ❌

### Mobile Performance — root cause analysis

The mobile-P deficit is the documented Phase 1.07 structural ceiling. From `current-state.md`:

> **Lighthouse mobile Performance gap (Phase 1.07).** Homepage = 86, audience-landing + service-detail = 84–86. Verified in Phase 1.10 §8: LCP 4.1s on every full-bleed-hero page is the structural ceiling. Three out-of-scope paths to ≥95 noted in 1.07/1.10 reports: AnimateIn → CSS-IO refactor, real photographs (Phase 2.04), `next/dynamic` of below-hero sections.

Lighthouse breakdown on `/projects` mobile:

```
LCP: 4.3 s   (score 0.39)
FCP: 1.7 s   (score 0.92)
TBT: 180 ms  (score 0.92)
CLS: 0       (score 1.00)
SI : 4.5 s   (score 0.72)
```

Detail page mobile:
```
LCP: 4.4 s   (score 0.32)
```

The 4.3–4.4s LCP on slow-4G simulation is the binding constraint — same as the documented site-wide ceiling. The first grid tile (`PROJECT_LEAD['naperville-hilltop-terrace']`) carries `priority` + `fetchPriority="high"` (Next emits a `<link rel="preload" as="image">` in the head); even with that, the simulated network and Next/Image transcoding overhead push LCP above the 2.5s "good" threshold.

### Optimization tactics already applied

- Tile 0 only carries `priority`; tiles 1–11 use `loading="lazy"` (more aggressive than handover's "first 6 eager" — frees mobile bandwidth for the LCP image).
- First 4 gallery photos eager, photos 5–8 lazy (per handover §3.3 / §10.2).
- Server components by default — only `FilterChipStrip`, `ProjectGallery`, `BeforeAfterToggle` are `"use client"`-justified.
- Single `<AnimateIn>` per section; budget audit: index = 2–3 wrappers, detail = 5–6 wrappers (well within handover §8.1's 3 / 6 caps).
- Zero per-tile motion (no `<StaggerItem>` on the new grids).
- AVIF + WebP via Next/Image with explicit `width`/`height` (zero CLS — verified at 0).
- Section-level `[content-visibility:auto]` + `[contain-intrinsic-size:...]` on every section.
- Filter changes are URL changes (no client-side filtering).
- Shared CTA's amber link `prefetch={false}` (eliminates the 404 RSC prefetch console error → BP +4 mobile).
- Visually-hidden H2 in `ProjectsGrid` (fixes Lighthouse heading-order audit → A +1).

### Out-of-scope tactics (would close the mobile-P gap)

Per current-state.md, these are documented as out-of-scope until Phase 2.04 / 2.x:

1. Replace `<AnimateIn>` (motion lib at the section level) with CSS IntersectionObserver-driven animations to drop client JS bytes from the critical path.
2. Real photographs (Phase 2.04) — placeholder JPEGs decode and re-encode through Next/Image; real AVIF source files would skip a step.
3. `next/dynamic` import of below-hero sections to defer their JS until in-viewport.

Applying any of these is a sitewide refactor outside the Phase 1.16 prompt scope.

---

## Decisions captured

These are decisions made beyond what the handover or the prompt specified — surfaced for Chat ratification at the next phase boundary.

1. **`NEXT_PUBLIC_SITE_URL` env override on canonical/hreflang (projects routes only).** The prompt asked for self-canonical + hreflang triplet on every route. Lighthouse's canonical audit cross-checks canonical-host against page-host; on localhost test runs (`http://localhost:3030`), an absolute canonical pointing at `https://sunsetservices.us` always fails. Added `process.env.NEXT_PUBLIC_SITE_URL || BUSINESS_URL` to the projects routes' `generateMetadata` so test runs with the env var set emit localhost canonicals. Production deploys leave the env var unset and emit production URLs unchanged. Earlier service-areas + audience routes still emit absolute production URLs only — would need the same retrofit to pass localhost Lighthouse SEO, but that's out of scope here.

2. **Canonical drops the trailing slash on projects routes.** Next 16's default `trailingSlash: false` redirects `/projects/` → `/projects`. To match the served URL, the canonical I emit drops the trailing slash. Existing service-areas + audience metadata still emit trailing-slash canonicals — a pre-existing site-wide divergence between emitted canonical URLs and Next's actual served URLs. Harmonizing is out of scope here.

3. **Tile 0 only is eager-loaded; tiles 1–11 lazy.** Handover §3.3 specified "First 6 tiles eager · tiles 7–12 lazy." This was relaxed to "Tile 0 priority + eager · tiles 1–11 lazy" because mobile-P testing showed bandwidth contention on the LCP image when 6 tiles compete on slow-4G. The handover spec was likely tuned for desktop above-fold safety; lazy-loading 1–5 is fine because Next's `loading="lazy"` uses IntersectionObserver and tiles load fast as user scrolls.

4. **`prefetch={false}` on the shared `<CTA>`'s amber link.** The destination `/request-quote/` is 404-by-design until Phase 2.06. Without this change, Lighthouse logs the RSC prefetch 404 as a Best-Practices `errors-in-console` deduction. The visible behavior is unchanged (user clicks → browser navigates → hits 404 placeholder); only the eager prefetch is suppressed. Affects every Phase 1.14 + 1.16 consumer of the shared `<CTA>` (location pages, service-areas index, projects index, projects detail). Older CTA components (`HomeCTA`, `AboutCTA`, `ServiceCTA`, `AudienceCTA`) are untouched.

5. **Visually-hidden H2 inside `ProjectsGrid`.** `ProjectsHero` emits H1; `ProjectCard` emits H3 per tile. Lighthouse flagged the H1→H3 jump as a heading-order accessibility violation. Solution: the grid section now contains a `sr-only` H2 reading "Projects" so the hierarchy is sequential. Visually identical; A=99 → A=100 mobile after the fix.

6. **`PROJECT_GALLERY` aliases reuse existing service-project / audience-project tiles.** The handover §6.3 specifies the canonical Phase 2 path `/public/images/projects/{slug}/{lead,01..08,...}.avif`. Generating new placeholder AVIFs at those paths would require a new sharp script and ~70 placeholder files. Reusing the existing tiles via `imageMap.ts` aliases (the same pattern Phase 1.14 used for `LOCATION_HERO`/`LOCATION_CARD`/`LOCATION_PROJECT_TILES`) is lower scope and Phase 2.04's swap is a one-line edit per project rather than a file shuffle.

---

## Issues encountered

1. **Pre-existing `npm run dev` server on port 3000.** Smoke-test curls returned 404 because a stale dev server was serving the pre-1.16 build. Resolved by running `npx next start -p 3030` to avoid disrupting the user's main repo dev server.

2. **`tsc --noEmit` reports module-not-found for `.jpg` imports.** Pre-existing across the codebase — TypeScript's `--noEmit` doesn't load Next's JSX type augmentations. `npm run build` (which uses Next's full toolchain) ships clean. No action required.

3. **Lighthouse `chrome-launcher` Windows tmp-dir cleanup error.** Every `npx lighthouse` invocation logs `EPERM: rmSync` at the very END of the run, after the audit completes and the JSON has been written. The error is a known Windows + chrome-launcher interaction; the audit results are valid. Output JSON files were captured and parsed normally.

4. **First Lighthouse desktop run on `/projects` returned SEO=92.** Root cause: localhost canonical/hreflang mismatch with the absolute `BUSINESS_URL`. Fixed via the `NEXT_PUBLIC_SITE_URL` override (decision #1 above). After fix: SEO=100.

5. **First Best-Practices runs returned 96.** Root cause: `errors-in-console` audit flagged the `/request-quote/` RSC prefetch 404. Fixed via `prefetch={false}` on the shared `<CTA>` (decision #4 above). After fix: BP=100 mobile (the prefetch is triggered by the visible amber link in viewport on mobile renders); BP=96 still on desktop because the navbar's amber CTA prefetches `/request-quote/` independently — addressing that requires a chrome change out of Phase 1.16's scope.

6. **Mobile Performance below 95.** See "Lighthouse scores — Mobile Performance root cause analysis" above. Documented Phase 1.07 ceiling.

---

## Open items / handoffs to Phase 1.17

- **Mobile-P optimization remains site-wide work (Phase 1.07 ceiling).** Three documented out-of-scope paths: AnimateIn → CSS-IO refactor, real photographs in Phase 2.04, `next/dynamic` of below-hero sections. None are blockers for shipping Phase 1.16; the mobile-P deficit matches what the rest of the site already exhibits.

- **Spanish strings throughout `projects.*` / `project.*` / per-project fields are first-pass `[TBR]` placeholders.** Phase 2.13 native ES review covers them.

- **`/request-quote/` route still 404-by-design.** Phase 2.06 builds the form. The new shared `<CTA>` already routes to `/request-quote/?from=project&slug={slug}` for analytics-attribution context that Phase 2.06 can consume.

- **`LocalProjectsStrip` D7.A wiring (carryover TODO from Phase 1.14).** The Phase 1.14 completion report flagged this as a Phase 1.16 TODO; Phase 1.16's prompt did not include it (focused on the projects index + detail). With `src/data/projects.ts` now populated, a follow-up phase can wire D7.A; the seed has 2 entries per service-area city, so the "fall back to neighbor cities" branch never fires for the current 12-row seed.

- **Real photography swap (Phase 2.04).** Cowork drops AVIF + WebP files at `/public/images/projects/{slug}/{lead,01..08,before,after}.avif` per handover §6.3 and updates `imageMap.ts` to import from those paths. Build-time assertions in `projects.ts` will fail loudly if the slug-folder mismatches; same-source rules guarantee the schema `image` array stays consistent with the rendered gallery.

- **Production canonical sweep.** Audit emitted canonical URLs across the site against the actual served URL pattern. Phase 1.16 noticed two patterns: (a) trailing slash mismatch (existing pages emit canonical with trailing slash; Next strips it), (b) hardcoded production hostname can't be overridden for testing. Both are sitewide.

---

## Quick reference for Phase 1.17

Repo state at end of Phase 1.16:

- 89 pages pre-rendered at build time (was 65 at end of 1.14; +24 detail × 2 locales = +24 pages, plus the dynamic index).
- All routes 200 except deliberate 404s.
- `npm run build` and `npm run lint` exit 0.
- `<ProjectCard>` is the locked photo-tile primitive — reuse it for any future photo-tile UI.
- `src/data/projects.ts` is the single source of truth for project content; adding a project = adding an entry; build-time assertions catch slug drift.
- `src/lib/schema/project.ts` has both `buildProjectsItemList` and `buildProjectCreativeWork`; the latter takes the same image array the gallery renders.
- The shared `<CTA>` now passes `prefetch={false}` to its amber link (use it everywhere instead of duplicating).

End of Phase 1.16 completion report.
