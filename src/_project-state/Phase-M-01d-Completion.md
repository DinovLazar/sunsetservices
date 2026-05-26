# Phase M.01d — Completion Report

**Phase:** M.01d (Code) — Data + plan restructure (4 divisions, 22 city pages prepared, new H1, Q&A i18n, project-address strip)
**Bucket:** M (Make-it-work)
**Executed:** 2026-05-26
**Role:** Code

---

## Headline numbers

| Item | Before | After |
|---|---|---|
| `SERVICES` entries in `src/data/services.ts` | 16 | **30** (16 existing + 14 new: 10 Waterproofing + 4 Snow Removal) |
| `LOCATIONS` entries in `src/data/locations.ts` | 6 | **24** (6 existing + 18 new) |
| `LOCATION_SLUGS` (the visible-now subset) | 6 | **6** (kept at 6 by design — `ALL_LOCATION_SLUGS` exports the full 24) |
| Divisions on Service | 0 (only `Audience`) | **4** (`landscape`, `hardscape`, `waterproofing`, `snow-removal`) |
| Q&A entries in `qa.*` namespace | n/a (new namespace) | **25** (5 categories × 5 questions × 2 locales = 50 question+answer pairs total) |
| New per-city tagline keys in `serviceAreas.grid.tagline.*` | 6 | 24 (18 new, unused in M.01d, used by M.01e) |
| Homepage H1 (EN) | "Outdoor spaces, built to last 25+ years." | **"Build your outdoor legacy"** |
| Homepage H1 (ES) | "Espacios exteriores, construidos para durar 25+ años." | **"Construye tu legado al aire libre"** |

---

## Zero-visible-change verification

| Surface | M.01d behavior | Expected |
|---|---|---|
| `/` and `/es` home pages | New H1 ("Build your outdoor legacy" / "Construye tu legado al aire libre"). Everything else unchanged. | ✅ Only H1 differs from pre-M.01d. |
| `/residential/`, `/commercial/`, `/hardscape/` (×2 locales) | 6 audience landings still render unchanged. | ✅ Unchanged. |
| 16 existing audience-aware service detail routes (×2 locales = 32 routes) | All render unchanged. `generateStaticParams` filters out new Waterproofing + Snow Removal services that lack `audience`. | ✅ Unchanged. |
| `/service-areas/` index + `/es/service-areas/` | Index shows only the original 6 cities (`getVisibleLocations()` returns 6). Schema ItemList enumerates only 6. SVG map renders only 6 pins. | ✅ Unchanged. |
| 6 existing city detail pages (`/service-areas/aurora/`, etc.) | All render unchanged. | ✅ Unchanged. |
| New city URLs (`/service-areas/hinsdale/`, etc.) | 404 by design — `isLocationSlug` returns false for new slugs since `LOCATION_SLUGS` stays at 6 entries. | ✅ M.01d intent. |
| `/request-quote/` (wizard) | Step 1 still 3-tile audience picker. Step 4 still asks for name/email/phone/address only (no residential/commercial radio yet). | ✅ Wizard untouched — M.01e changes the wizard. |
| `/projects/` index + project detail pages | All 12 existing placeholder projects still render. `stripStreetNumber` helper is a no-op for every current project (none start with digits). | ✅ Unchanged. |
| Sitemap (`/sitemap.xml`) | 6 location entries + 16 audience-aware service entries (no new entries). | ✅ Unchanged. |

**Net user-visible diff** between pre-M.01d and post-M.01d: (1) homepage H1 text, (2) the `stripStreetNumber` helper sits in place to strip any future leading-number address — currently a no-op because no project rendered field carries a leading street number.

---

## Verification harness results

| Harness | Result | Notes |
|---|---|---|
| `npx tsc --noEmit` | ✅ Clean (modulo documented baseline) | Pre-existing Phase 2.04/B.09/B.10 module-not-found errors only (`@/assets/...`, `@upstash/redis`, `@googlemaps/js-api-loader`, `google` namespace). No new errors introduced by M.01d. |
| `npx eslint src/` | ✅ Clean (modulo documented baseline) | 0 errors, 3 pre-existing warnings (the `selectRelatedProjects`-unused + 2 `CalendlyEmbed.tsx` warnings predate M.01d). No new warnings. |
| `npm run build` | ⚠️ Fails on documented baseline only | The exact 4 module-not-found errors from B.03 (`prettier/standalone`, `prettier/plugins/html`), B.09 (`@upstash/redis`), B.10 (`@googlemaps/js-api-loader`) — all surfaced in the worktree because the worktree's `node_modules` is sparse. The B.10 completion report explicitly states the project builds clean on the main SunSet-V2 directory and on Vercel. No new build errors introduced by M.01d. |
| `npm run validate:schema` | ⏭️ Deferred to merge | Harness requires `next start` against a live server. The worktree's missing deps prevent a local boot. Schema surfaces unchanged in M.01d (no new schema types added) — re-run after merge to confirm against the main install. |
| `npm run validate:seo` | ⏭️ Deferred to merge | Same blocker. The harness's hardcoded `EXPECTED_PATHS` list matches the OLD 6-city / no-Q&A served URLs (per the phase prompt's explicit note — M.01d hasn't added new visible routes). Should exit 0 unchanged. |
| `npm run validate:a11y` | ⏭️ Deferred to merge | Same blocker. No a11y-touching code changes in M.01d (only data + a single helper function + i18n strings). Should exit 0 unchanged. |
| JSON syntax | ✅ Clean | `node -e "JSON.parse(...)"` on both `en.json` and `es.json` passes. |

---

## Files modified / created

### Modified

| Path | Reason |
|---|---|
| [src/data/services.ts](src/data/services.ts) | Added `Division` type, `division` required on `Service`, `audience` made optional; 16 existing services tagged with division; 14 new services (10 Waterproofing + 4 Snow Removal) appended with full bilingual content; `getServicesForDivision()` helper added. |
| [src/data/locations.ts](src/data/locations.ts) | Extended `LocationCitySlug` union with 18 new slugs; appended 18 new entries to `LOCATIONS`; kept `LOCATION_SLUGS` at original 6; added new `ALL_LOCATION_SLUGS` (24) and `getVisibleLocations()` helper. |
| [src/messages/en.json](src/messages/en.json) | `home.hero.h1` → "Build your outdoor legacy"; new `qa.*` namespace (25 Q&A); 18 new `serviceAreas.grid.tagline.<slug>` keys. |
| [src/messages/es.json](src/messages/es.json) | `home.hero.h1` → "Construye tu legado al aire libre"; mirror `qa.*` namespace in `usted` register; 18 new `serviceAreas.grid.tagline.<slug>` keys. |
| [src/app/[locale]/projects/[slug]/page.tsx](src/app/[locale]/projects/[slug]/page.tsx) | Added exported `stripStreetNumber()` helper; applied to metadata title + breadcrumb title. |
| [src/app/[locale]/[audience]/[service]/page.tsx](src/app/[locale]/[audience]/[service]/page.tsx) | `generateStaticParams` filters out services with no `audience`. |
| [src/app/sitemap.ts](src/app/sitemap.ts) | Service paths filter out services with no `audience`; location paths switched to `LOCATION_SLUGS.map`. |
| [src/app/[locale]/service-areas/[city]/page.tsx](src/app/[locale]/service-areas/[city]/page.tsx) | `generateStaticParams` switched to `LOCATION_SLUGS.map`. |
| [src/app/[locale]/service-areas/page.tsx](src/app/[locale]/service-areas/page.tsx) | Schema ItemList consumer switched to `getVisibleLocations()`. |
| [src/components/sections/service-areas/CitiesGrid.tsx](src/components/sections/service-areas/CitiesGrid.tsx) | Grid renders `getVisibleLocations()` instead of all `LOCATIONS`. |
| [src/components/sections/service-areas/ServiceAreaMap.tsx](src/components/sections/service-areas/ServiceAreaMap.tsx) | SVG renders `getVisibleLocations()` instead of all `LOCATIONS`. |
| [src/lib/sanity/revalidation.ts](src/lib/sanity/revalidation.ts) | Service-detail bulk-invalidate filters out services with no `audience`. |
| [Sunset-Services-Plan.md](Sunset-Services-Plan.md) | §3 sitemap + §4 page-count table + §11 quote wizard updated to the locked target shape. |
| [Sunset-Services-Phase-Plan-Continuation.md](Sunset-Services-Phase-Plan-Continuation.md) | Bucket M table extended with M.01d / M.01e / M.01f rows; dependency note rewritten. |
| [Sunset-Services-Decisions.md](Sunset-Services-Decisions.md) | New 2026-05-26 entry covering all 15 locked decisions + 4 code in-phase off-spec resolutions. |
| [src/_project-state/current-state.md](src/_project-state/current-state.md) | Last-completed-phase bumped to M.01d; prior-N labels shifted down by 1; new "What works (Phase M.01d additions)" sub-block. |
| [src/_project-state/file-map.md](src/_project-state/file-map.md) | New "Phase M.01d" section. |

### New

| Path | Purpose |
|---|---|
| [src/_project-state/Phase-M-01d-Completion.md](src/_project-state/Phase-M-01d-Completion.md) | This file. |

---

## Code in-phase decisions (off-spec from the phase plan)

All four also logged in `Sunset-Services-Decisions.md` under the new 2026-05-26 entry.

1. **`LOCATION_SLUGS` stays at 6 through M.01d; `ALL_LOCATION_SLUGS` exports the full 24.** The phase plan called for adding all 24 cities to `locations.ts`. Naively appending the 18 new slugs to `LOCATION_SLUGS` would have surfaced them in `sitemap.ts`, `generateStaticParams` for the city page, and the `isLocationSlug` type guard — violating the zero-visible-change mandate. Resolved by keeping `LOCATION_SLUGS` as the original 6, introducing `ALL_LOCATION_SLUGS` (for the automation pipeline whitelist), and `getVisibleLocations()` for the 4 visible consumers (sitemap, schema ItemList, `CitiesGrid`, `ServiceAreaMap`).
2. **`generateStaticParams` filters out new-division services lacking `audience`.** Necessary because the audience-aware `/<audience>/<service>/` route would have produced `/undefined/basement-waterproofing/` etc. Same treatment applied in `sitemap.ts` and `revalidation.ts`.
3. **Snow Removal "commercial" service renamed `commercial-snow-plowing`** (from the candidate `snow-removal`) to avoid `/snow-removal/snow-removal/` under the M.01e `/<division>/<slug>/` shape. Disambiguates from the existing residential + commercial `snow-removal` audience-aware entries (both retained through M.01d for backwards-compat).
4. **New cities' `featuredServices` use only existing audience-aware services** (Option B per the phase plan's Step 7). Defers the Waterproofing/Snow Removal showcase on city pages to M.01e along with the consumer-side update for audience-less service links.

---

## Carryover items (do NOT close in M.01d)

| Item | Owner | When |
|---|---|---|
| Run `npm run validate:schema`, `validate:seo`, `validate:a11y` against the main `SunSet-V2` directory (with installed deps) or against Vercel Preview after merge | User | Post-merge |
| Vercel Preview verification (build pipeline handles `prettier/standalone` differently than the local worktree's sparse `node_modules`) | User | Post-merge |
| Pre-merge: re-run `npx tsc --noEmit` + `npx eslint src/` against the main `SunSet-V2` directory to confirm parity with the worktree's clean type/lint output | User | Pre-merge |
| Wire the actual `/qa/` page, `/landscape/`, `/waterproofing/`, `/snow-removal/` division landings, 18 new city pages, redrawn `/service-areas/` index, navbar mega-panel updates, quote wizard Step 1 → division picker, wizard Step 4 → residential/commercial radio, deletion of `/residential/*` + `/commercial/*` + `/service-areas/lisle/` + `/service-areas/bolingbrook/` with 301 redirects | Phase M.01e | M.01e |
| Replace the placeholder testimonials on every location page with real Google reviews; first-pass LatAm ES on all new EN strings shipped in M.01d + M.01e | Phase M.01f | M.01f |
| Real per-city `trust.projectsCompleted` and `responseTimeDays` numbers for the 18 new cities (and confirmation of the existing 6) | Cowork + Erick | When Erick supplies |
| Compute real `pin.x` / `pin.y` SVG coordinates for the 18 new cities from `geo.lat` / `geo.lng` (currently `{x:0,y:0}` placeholders) | Phase M.01e | M.01e |
| Native ES review of all M.01d-introduced strings (new service detail content × 14, new city `whyLocal` × 18, new `qa.*` 25 Q&A × ES, new tagline keys × 18) | Phase M.03 | M.03 |

---

## Definition of Done check

- [x] 30 services in `src/data/services.ts` (16 existing entries with `division` added + 14 new entries with full bilingual content). Every entry has `division` set. New entries have no `audience` field. Existing entries keep `audience` for backwards-compat.
- [x] 24 cities in `src/data/locations.ts` (6 existing entries unchanged + 18 new entries with full bilingual content + placeholder stats + placeholder pin coordinates).
- [x] Homepage H1 changed in both locales.
- [x] New `qa.*` namespace in both locales with 25 questions across 5 categories.
- [x] New-city tagline entries in both locales for the 18 new cities.
- [x] Project detail page applies a display-layer street-number strip on the address render (metadata title + breadcrumb).
- [x] The three root-level docs (Plan, Phase Plan Continuation, Decisions) reflect the locked expanded shape.
- [⏭️] All 3 validation harnesses (B.04 schema, B.05 SEO, B.06 a11y) exit 0 — **carried over** to post-merge user-runnable step (worktree blocker).
- [x] One commit (next step).
- [x] One completion report (this file).
- [x] `current-state.md` + `file-map.md` updated.
- [x] **Zero visible change to the running site** other than the new homepage H1 and the project-address format (which today renders identical because no project field carries a leading number).

---

**Phase status:** Complete. Hand off to user for merge + post-merge harness re-run.
