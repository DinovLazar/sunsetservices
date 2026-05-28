# Phase M.10c (Code) — Completion Report

> Brand identity quick wins: logo + 4-division labels + rotating hero + `/projects` index addendum. Closes three visible loose ends on the homepage (cluttered old logo, stale 3-audience badges, single-static hero) and brings the `/projects` index in line with the 4-division IA. Date: 2026-05-27. Branch: `worktree-claude+m10c-brand-identity` off `origin/main`.

---

## What shipped

### Homepage (main scope)

1. **Logo swap (D1).** The fullcolor navbar logo at `src/assets/brand/logo-horizontal-fullcolor.png` is now the operator-supplied clean version. Dropped at `public/sunset_logo_white_bg.png` (path differs from the plan's `public/incoming/...` per operator confirmation). The source file was 100 % opaque white (zero transparency, every pixel `alpha=255`). On the homepage hero, the navbar uses `bg-white/[0.78] backdrop-blur-md` over the photo, so a white-background logo would have rendered as a visible white rectangle. **In-phase decision: chroma-key the white background before swap** (operator-chosen, see Decisions.md). Used sharp to set `alpha=0` on any pixel where `R ≥ 240 && G ≥ 240 && B ≥ 240`. Result: 74.1 % of pixels now transparent (vs. 0 % in source); all four corners `(255,255,255,0)`. Aspect ratio is preserved (2000 × 537 → 3.724:1; old 720 × 192 → 3.75:1; ~0.7 % diff, well within the Logo component's `height: 40px; width: auto` constraint). The user's `public/sunset_logo_white_bg.png` source file stays in place (not deleted by this phase — it was added directly under `public/`, not under a transient handoff folder).

2. **Service-card badges → division (D2).** `src/components/sections/home/HomeServicesOverview.tsx` rewired: `audience` field renamed to `division` on each of the 9 curated services (lawn-care/landscape, patios/hardscape, walls/hardscape, design/landscape, trees/landscape, sprinklers/landscape, snow/snow-removal, kitchens/hardscape, fire/hardscape). The per-tile colored dot now reads from a `Record<Division, string>` map mirroring the `[data-division=<slug>]` accent tokens in `globals.css`. The text label uses a second `getTranslations('home.divisions')` call so it can re-use the existing `home.divisions.<slug>.tag` strings (Phase M.01e) — zero new i18n strings added for the badges.

3. **Project-card badges via `getProjectDivision()` (D3 + D10).** New pure function at `src/lib/projects/getProjectDivision.ts`. Signature accepts a partial Project-like shape (works against both `serviceSlugs: string[]` and Sanity's projected `services: [{slug, _id}]`). Resolution order: (1) `audience === 'hardscape'` → `'hardscape'`; (2) first service slug resolves to a Service with a `division` → that division; (3) fallback → `'landscape'`. Wired into `HomeProjects.tsx` (looks up the canonical Project from `src/data/projects.ts` via the inline tile's slug and applies the helper); the badge label uses the same `home.divisions.<slug>.tag` strings as Step 2.

4. **Bottom Services-Overview 4-button row (D4).** Replaced the 3-audience CTAs with 4 division CTAs in `HomeServicesOverview.tsx`. Layout: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`. Each button reuses the existing `.btn-secondary btn-md` class. New i18n keys at `home.services.cta.{landscape,hardscape,waterproofing,snow-removal}` — replaced the old `home.services.cta.{residential,commercial,hardscape}` keys.

5. **Rotating hero carousel (D5 + D6).** New client component `src/components/sections/home/HomeHeroCarousel.tsx`. 4 images cycle at 5000 ms intervals over an 800 ms crossfade. The first image (the existing patio hero — `src/assets/home/hero.jpg`) stays as the LCP candidate: it ships with `priority` + `fetchPriority="high"` inside the carousel and is the only frame at `opacity: 1` on first paint. Reduced-motion compliance: when `useReducedMotion()` returns `true`, the rotation interval is never scheduled and only the first frame is visible (D6, WCAG 2.2 SC 2.3.3). The carousel wrapper is `aria-hidden="true"` (decorative imagery; H1 + dek above carry the page's accessible name). `HomeHero.tsx` was rewired to host the carousel inside the existing `absolute inset-0` photo layer; gradient overlays + content stack preserved verbatim.

6. **Hero image selection (D5 §10).** 4 images at 1920 × 1080 each, all from existing asset corpus, all golden-hour or natural daylight:
   - Image 1 (LCP, Hardscape): `src/assets/home/hero.jpg` — existing patio + fire feature
   - Image 2 (Landscape): `src/assets/service/hero-landscape-design.jpg`
   - Image 3 (Snow Removal): `src/assets/service/hero-snow-removal.jpg`
   - Image 4 (Hardscape variety): `src/assets/service/hero-outdoor-kitchens.jpg` — no dedicated Waterproofing photo exists in the corpus, so the rotation deliberately stays on hardscape variety per plan §10 ("Otherwise pick a different hardscape angle").
   Alt strings reuse existing i18n: `home.hero.alt` (image 1), `home.divisions.landscape.alt` (image 2), `home.divisions.snow-removal.alt` (image 3), `home.services.alt.kitchens` (image 4). Zero new alt keys.

### Addendum — `/projects` index (D8–D13)

7. **Filter chip strip → division (D8 + D9 + D11).** `src/app/[locale]/projects/page.tsx` searchParams reader renamed `audience` → `division` (no `?audience=` back-compat alias — pre-launch site). `FilterChipStrip.tsx` rewritten to drive a 4-division single-select filter (Landscape / Hardscape / Waterproofing / Snow Removal). All 4 chips always render (D9) — even when count is 0 (Waterproofing today). The "All · N" chip stays leading. Per-chip counts compute via `getProjectDivision(project, SERVICES)` (D11), so the chip-strip count matches the visible tile badges exactly. Defensive sanitize: any value outside the 4 known division slugs falls back to "All" via `isDivision()` from `src/data/divisions.ts`.

8. **Filter chip strip i18n (D13).** EN `projects.filter.label` = "Filter by division" (was "Filter by audience"). ES = "Filtrar por división" (was "Filtrar por audiencia"). 4 chip labels added; old `residential`/`commercial` chip keys deleted. Page `projects.hero.dek` updated in both locales: EN "Filter by audience, or scroll" → "Filter by division, or scroll"; ES "Filtra por audiencia o desplázate" → "Filtra por división o desplázate". ES division labels use M.01f1 glossary (`Paisajismo`, `Hardscape`, `Impermeabilización`, `Remoción de Nieve`) — **in-phase divergence from the addendum's "ES = English-source for landscape" suggestion**, see Decisions.md.

9. **Project tile badges on `/projects` (D10).** `ProjectsGrid.tsx` now receives a `divisionBySlug: Map<string, Division>` from the server route (computed once per request) and renders the badge via `tTag(division)` instead of `tTag(p.audience)`. The `projects.tag` i18n namespace flipped to division keys: `landscape/hardscape/waterproofing/snow-removal` (uppercase) — replaced old `residential/commercial/hardscape`. ES uses uppercased glossary terms.

10. **Pagination (D8).** `Pagination.tsx` `audience` prop renamed to `division`; URL builder writes `?division=` (was `?audience=`).

11. **`stripStreetNumber` extracted to shared util.** Existing inline helper in `src/app/[locale]/projects/[slug]/page.tsx` (Phase M.01d) moved to `src/lib/projects/stripStreetNumber.ts`. The detail page now imports from the new path. Applied to project tile titles on `/projects` index (optional A-extra item, operator-included) and the project detail hero `<h1>`. No-op for any title that doesn't start with digits (the 7 Sanity projects today have address-bearing titles like "Aurora Driveway Apron" — already street-number-free, no visible change today; defensive).

12. **Other audience-badge surfaces (A6).** Two additional surfaces beyond the homepage and `/projects` index:
   - **`ProjectHero.tsx`** (project detail) — hero badge swapped from `tTag(project.audience)` to `tTag(getProjectDivision(project, SERVICES))`. Title now passes through `stripStreetNumber()`.
   - **`ProjectFacts.tsx`** (project detail) — Facts row label and value migrated: dt key `project.facts.audience` ("Audience") → `project.facts.division` ("Division") in both locales; value computed via `getProjectDivision()`; the row's deep link now uses `/{division}/` (was `audienceHref` derived from `services[0].division` || `audience === 'hardscape'`).
   - **`RelatedProjects.tsx`** — same fix as ProjectsGrid (uses `getProjectDivision()` for the badge label, applies `stripStreetNumber()` to the title).
   - **`LocalProjectsStrip.tsx`** (city pages): inspected — does NOT render an audience badge (uses a different "placeholder caption" pattern); no change needed.
   - **`AudienceServicesGrid.tsx` / `AudienceHero.tsx` / other `sections/audience/*`**: OUT OF SCOPE for this phase. The verification checklist scopes to `src/components/sections/home/` and `src/components/ui/`. The `/audience/` route surface (Residential / Commercial / Hardscape pages from Phase 1.09) is now de-prioritized in favor of the M.01e `/division/` pages but the components still exist; a separate phase should retire or rewire them.

13. **Sanity summary projection extended.** `PROJECT_SUMMARY_PROJECTION` in `sanity/lib/queries.ts` now includes `"serviceSlugs": services[]->slug.current`. The `ProjectSummary` TS type gains a `serviceSlugs: string[]` field (moved from `ProjectDetail` which extended Summary anyway, so the practical effect is that the field is now populated by `getAllProjects()` too — was empty `[]` before). Without this, the `/projects` index would classify every project as `'landscape'` (fallback) because the helper had no slugs to look up. This makes `getProjectDivision()` produce correct chip counts on the index.

---

## Decisions surfaced

All in-phase locked decisions D1–D13 are recorded in `Sunset-Services-Decisions.md` 2026-05-27. The handful of in-phase off-spec calls Code surfaced:

- **D1.a (logo) — chroma-key the white background before swap.** Operator-chosen via in-phase question. Threshold `R/G/B ≥ 240`. Risk: any genuinely white pixel inside the logo design would also become transparent. Inspection of the rendered output shows no internal-white loss — the design has no large pure-white shapes.
- **D6.a (image alts) — re-use existing i18n strings for the 3 new carousel images** instead of adding new keys. Trade-off: the alts are slightly less hero-specific. Justification: the carousel wrapper is `aria-hidden="true"` (decorative), so the alts only affect SEO/search image indexing, where existing alts are still accurate.
- **D7 (brand palette + typography) — DEFERRED.** The brand identity guide BG-01 mandates Sunset Orange `#F28C38` as the primary CTA color, Forest Green `#2E4F4F` for section accents, and Montserrat as the web font. Current site: green-primary + amber-rare-accent + Manrope/Onest fonts. **Documented divergence** so a future phase has a starting point. Out of scope for M.10c.
- **D11 ES glossary divergence — use M.01f1 glossary (`Paisajismo`) instead of addendum's "Landscape" suggestion.** The addendum suggested ES chip = "Landscape" (English-source). The locked M.01f1 glossary and `home.divisions.landscape.tag` (Phase M.01e) use "Paisajismo". For site-wide consistency, the chip label, badge text, and CTA button all use "Paisajismo" in ES.
- **A6.a (Sanity SUMMARY projection extension).** Required to make `getProjectDivision()` produce correct chip counts on `/projects`. Without this, every project would fall through to `'landscape'` (helper fallback). Small data-layer change, no consumer breaks.
- **A6.b (ProjectFacts dt rename).** Original `project.facts.audience` ("Audience" / "Audiencia") renamed to `project.facts.division` ("Division" / "División") so the dt label is consistent with the rendered division value. Old keys removed (orphans).

---

## Verification

### Local — production server (port 3076) against `localhost`

| Check | Result |
| --- | --- |
| Logo file alpha after chroma key | 74.1 % transparent, all corners alpha = 0 |
| Served logo bytes match worktree file | YES — 273 667 bytes both sides |
| `npx tsc --noEmit` | exit 0 (clean) |
| Targeted lint on M.10c files | 0 errors, 1 pre-existing warning (`selectRelatedProjects` unused — predates this phase) |
| `npm run build` | ✓ 176 static pages, 0 errors, 15.8 s compile |
| `validate:schema` | 22/22 PASS, 0 errors, 0 warnings |
| `validate:seo` | 170/174 PASS — 4 pre-existing errors on `/projects/aurora-driveway-apron` (Sanity-data drift, not introduced by M.10c) |
| `validate:a11y` | 19/20 PASS, axe AA 0, Lighthouse all ≥ 97 (mostly 100). 1 failure same `/projects/aurora-driveway-apron` 404 |
| `prefers-reduced-motion` honoured (a11y harness) | OK — `matchMedia` returns true under emulation |

### Homepage rendering (live)

- `Filter by audience` and `Filter by division` text in `/`: 0 audience, 0 division (homepage doesn't use either)
- `home.services` 4 division CTAs render — "All Landscape Services" / "All Hardscape Services" / "All Waterproofing Services" / "All Snow Removal Services"
- Service-card division badges: Hardscape × 10, Landscape × 10, Snow Removal × 5, Waterproofing × 3 (counts include navbar mega-panel + footer + body)
- Hero carousel: 4 distinct hero image URLs in the HTML (`hero.jpg`, `hero-landscape-design.jpg`, `hero-snow-removal.jpg`, `hero-outdoor-kitchens.jpg`)
- ES `/es/` mirrors EN — 4 division CTAs render with `Paisajismo / Hardscape / Impermeabilización / Remoción de Nieve` glossary

### `/projects` index rendering (live)

- `Filter by audience` occurrences in `/projects`: **0** (was 3 before final i18n fix); `Filter by division` × 7
- Chip strip: `All · 7`, `Hardscape · 7`, `Landscape · 0`, `Waterproofing · 0`, `Snow Removal · 0` — all 4 division chips render at count 0 too (D9 confirmed)
- `?division=hardscape` filters correctly (page returns 200 with 7 matching tiles)
- `?division=garbage` falls back to "All" — the All chip carries `aria-pressed="true"` (defensive sanitize works)
- Tile badges on `/projects`: 7 × "HARDSCAPE" (all 7 Sanity projects are hardscape audience or have a hardscape primary service)
- Zero "Residential" / "Commercial" badge text anywhere
- ES `/es/projects/` mirrors EN — 4 chips render with the M.01f1 glossary labels

### Project detail rendering (live, sample `/projects/aurora-area-patio/`)

- Hero badge: "HARDSCAPE" (division-derived) ✓
- Facts dt label: "Division" (was "Audience") ✓
- Facts dd value linked to `/hardscape/` (division-derived href) ✓
- Hero `<h1>` and metadata title pass through `stripStreetNumber()` — no leading numbers visible (no-op today since titles don't start with digits)

---

## Files written / updated

### Replaced
- `src/assets/brand/logo-horizontal-fullcolor.png` — chroma-keyed version of `public/sunset_logo_white_bg.png` written via sharp; 2000 × 537, RGBA, 273 667 bytes. Old transparent 720 × 192 file overwritten.

### New (component code)
- `src/components/sections/home/HomeHeroCarousel.tsx` — client island, 4-image carousel with `useReducedMotion()` compliance
- `src/lib/projects/getProjectDivision.ts` — pure helper, accepts partial Project-like shape, returns Division
- `src/lib/projects/stripStreetNumber.ts` — extracted from `src/app/[locale]/projects/[slug]/page.tsx` for reuse on `/projects` index and detail hero

### Modified (component code)
- `src/components/sections/home/HomeServicesOverview.tsx` — division badges + 4-button CTA row
- `src/components/sections/home/HomeProjects.tsx` — division-derived badges via helper
- `src/components/sections/home/HomeHero.tsx` — wired the carousel + 3 additional image imports + 2 additional `getTranslations` calls for alt strings
- `src/components/sections/projects/FilterChipStrip.tsx` — division-based URL state + 4 chips
- `src/components/sections/projects/ProjectsGrid.tsx` — accepts `divisionBySlug` map + uses `stripStreetNumber()`
- `src/components/sections/projects/Pagination.tsx` — `audience` prop → `division`
- `src/components/sections/projects/detail/RelatedProjects.tsx` — `getProjectDivision()` + `stripStreetNumber()`
- `src/components/sections/projects/detail/ProjectHero.tsx` — division-derived badge + `stripStreetNumber()` on title
- `src/components/sections/projects/detail/ProjectFacts.tsx` — division-derived label + value + href
- `src/app/[locale]/projects/page.tsx` — `?division=` reader + 4-chip counts via helper + filter via helper
- `src/app/[locale]/projects/[slug]/page.tsx` — imports `stripStreetNumber` from new util; division-derived metadata title; inline helper removed

### Modified (data layer)
- `sanity/lib/queries.ts` — `PROJECT_SUMMARY_PROJECTION` adds `"serviceSlugs": services[]->slug.current`
- `sanity/lib/types.ts` — `ProjectSummary.serviceSlugs: string[]` added; `ProjectDetail.serviceSlugs` removed (now inherited from Summary)
- `src/lib/sanity-adapters.ts` — `sanityProjectSummaryToTs` uses `p.serviceSlugs ?? []`

### Modified (i18n)
- `src/messages/en.json`:
  - `home.services.audience.*` — REMOVED (3 keys, was unused after badge swap)
  - `home.services.cta.*` — REPLACED 3 audience keys with 4 division keys
  - `home.projects.tag.*` — flipped 3-audience to 4-division (component no longer reads this; kept consistent)
  - `projects.tag.*` — flipped 3-audience to 4-division (consumed by `ProjectsGrid.tsx` + `RelatedProjects.tsx` + `ProjectHero.tsx` + `ProjectFacts.tsx`)
  - `projects.filter.*` — 4 chip labels + new `label` value
  - `projects.hero.dek` — "Filter by audience" → "Filter by division"
  - `project.facts.audience` → `project.facts.division`
- `src/messages/es.json` — same key migration, LatAm-MX `tú`/`usted` register preserved per M.01f1; ES division labels: `Paisajismo`, `Hardscape`, `Impermeabilización`, `Remoción de Nieve`

### New (state docs)
- `src/_project-state/Phase-M-10c-Completion.md` — this file

### Modified (state + decisions docs)
- `src/_project-state/current-state.md` — Last-completed phase set to M.10c, new "What works" block, removed closed items from "What does NOT work yet"
- `src/_project-state/file-map.md` — appended Phase M.10c additions
- `Sunset-Services-Decisions.md` — 2026-05-27 entry with D1–D13 + in-phase off-spec calls
- `Sunset-Services-TRANSLATION_NOTES.md` — appended Phase M.10c ES additions (4 new `home.services.cta.*` keys + 4 new `projects.filter.*` keys + the `Paisajismo` glossary divergence note)

### Operator's pre-step file (not deleted)
- `public/sunset_logo_white_bg.png` — operator dropped it directly under `public/` (not under the plan's transient `public/incoming/` folder). The phase does not delete this; the operator can remove it manually if desired. Note: while in place, `https://<host>/sunset_logo_white_bg.png` is a public URL that ships the white-background source. Recommend deletion before production launch.

---

## Pre-existing issues surfaced (not introduced by M.10c)

1. **`/projects/aurora-driveway-apron` 404.** The harness's `EXPECTED_PATHS` lists this slug but no matching Sanity project document exists. Validate-SEO + validate-A11y each fail on this one URL. Not caused by M.10c — the harness config and Sanity data have drifted. Fix path: either remove the slug from the harness's expected list OR seed the project in Sanity. Logged for a future small phase.

2. **`npm run lint` runs out of memory.** ESLint config does not ignore `.claude/worktrees/**`, so it tries to scan every worktree's `dist/` output (including 500 KB+ minified Sanity Studio bundles). Pre-existing config issue. Targeted lint on the M.10c-touched files passes clean (0 errors, 1 pre-existing warning).

3. **Next 16 dev-server "single instance per directory tree" check** blocks `next dev` in the worktree when the operator's main-repo dev is running on port 3000. Worktree dev is detected as part of the main-repo tree. Verification used `next start -p 3076` against the production build instead — equivalent for static-page testing. Pre-existing harness ergonomics, not a code issue.

---

## Carryover / operator follow-up

1. **Run all 3 validation harnesses against Vercel Preview** once it deploys: `BASE_URL=<preview-url> npm run validate:schema|seo|a11y`. Expect the same 4 `/aurora-driveway-apron` errors unless the operator removes the slug from the harness configs.

2. **Visual review on Vercel Preview** for: navbar logo on `/` (no white box over hero); hero carousel cycles 4 images at ~5 s intervals; reduced-motion (`prefers-reduced-motion: reduce` in DevTools) freezes the carousel at image 1; `/projects` chip strip shows 4 division chips; ES `/es/` and `/es/projects/` mirror EN.

3. **Decide brand-palette + Montserrat divergence (D7 carryover).** Either schedule a future phase to bring the live site into compliance with BG-01 (Sunset Orange CTAs, Forest Green accents, Montserrat) OR update BG-01 to formally accept the current `green-primary + amber-accent + Manrope/Onest` palette.

4. **Decide `/aurora-driveway-apron` 404 fix path** (re-seed in Sanity OR remove from harness configs).

5. **Optional: delete `public/sunset_logo_white_bg.png`** to avoid shipping the white-bg source on the public URL.

---

## Definition of done — checklist

- [x] Operator pre-step file found (at `public/sunset_logo_white_bg.png` — different path than plan)
- [x] New logo live at canonical fullcolor logo path; chroma-keyed; corners transparent
- [x] Zero residential/commercial badge text on `/` and `/es/`
- [x] Bottom Services-Overview row has 4 division CTAs with working URLs
- [x] Homepage hero rotates 4 distinct images (`prefers-reduced-motion` freezes to image 1 per a11y harness emulation)
- [x] All three Phase B.04/B.05/B.06 regression harnesses ran on localhost (schema 22/22 PASS, SEO 170/174 PASS [4 pre-existing errors], A11y 19/20 PASS [same pre-existing failure])
- [x] Build succeeds — 176 static pages, 0 errors
- [x] `npm run lint` documented (OOMs from worktree-scanning pre-existing config); targeted lint on M.10c files passes clean
- [x] Addendum: `/projects` index has 4 division chips with division-derived counts (Hardscape · 7, others · 0)
- [x] Addendum: `?division=` URL filtering works; `?division=garbage` falls back to All
- [x] Addendum: `Filter by division` heading; zero `Filter by audience` text on `/projects` or `/es/projects/`
- [x] Addendum: Tile badges on `/projects` use `getProjectDivision()` → match the homepage badge labels
- [x] Addendum: Optional `stripStreetNumber` applied to `/projects` index tile titles + project detail hero `<h1>` (operator-included)
- [x] Completion report + Decisions.md + current-state.md + file-map.md + TRANSLATION_NOTES.md all updated
- [ ] Vercel Preview verified — pending push
- [ ] Branch merged into `main` — pending Preview verification
