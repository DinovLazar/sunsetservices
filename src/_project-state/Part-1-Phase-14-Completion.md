# Phase 1.14 — Completion Report

**Phase:** Part 1 — Phase 1.14 (Code)
**Operator:** Claude Code
**Closes:** Implementation of Phase 1.13 design handover (Service Areas index + 6 location pages, EN + ES = 14 routes total).
**Hands off to:** Phase 1.15 (Design — projects portfolio).
**Date:** 2026-05-07
**Commit SHA:** `9279efd` — pushed to `origin/main`.

---

## What was done

Implemented the full Service Areas index at `/service-areas/` and a six-city Location page template at `/service-areas/{aurora,naperville,batavia,wheaton,lisle,bolingbrook}/`, mirrored under `/es/`. Promoted the existing `ContactServiceAreaStrip` to a generic `ServiceAreaStrip` with a new opt-in `excludeSlug` prop (Phase 1.13 D7b), introduced a new shared `<CTA>` component with `tokens` interpolation (Phase 1.13 D11), populated `src/data/locations.ts` with 6 bilingual entries (`whyLocal`, testimonials, FAQ, meta — all per-city), built the section components and JSON-LD schema helpers, and wired BreadcrumbList + Place + Service-ItemList + FAQPage emit on the city template (BreadcrumbList + ItemList of Place items on the index). All 14 expected routes return 200; unknown city → 404. `npm run build` and `npm run lint` exit 0; all 5 JSON-LD blocks emit on the city page (`LocalBusiness` from layout + `BreadcrumbList` + `Place` + `ItemList` of Services + `FAQPage`).

---

## Files added

| Path | Purpose |
|---|---|
| `src/components/sections/ServiceAreaStrip.tsx` | Shared strip used by `/contact/` (default behaviour) and the 6 location pages (with `excludeSlug`). Promoted from `ContactServiceAreaStrip`. |
| `src/components/sections/CTA.tsx` | New shared bottom-of-page amber CTA. Accepts `copyNamespace` + `destination` + opt-in `tokens` (forwarded to next-intl ICU values for `{key}` placeholders) + `surface`. Used by ServiceAreasCTA + LocationCTA. |
| `src/components/sections/service-areas/ServiceAreasHero.tsx` | Index hero — split copy + ServiceAreaMap. No entrance animation. |
| `src/components/sections/service-areas/ServiceAreaMap.tsx` | Production SVG of DuPage with 6 `<Link>` pins, locale-aware `<title>`/`<desc>`, hover translate respecting reduced-motion. |
| `src/components/sections/service-areas/CitiesGrid.tsx` | 3×2 grid of LocationCards. Single section-level `<AnimateIn>`. |
| `src/components/sections/service-areas/OutsideAreaBand.tsx` | "Don't see your city?" informational band; phone + email inline links; no CTA button. |
| `src/components/sections/service-areas/ServiceAreasCTA.tsx` | Thin wrapper around shared `<CTA>` for the index. |
| `src/components/sections/location/LocationHero.tsx` | Compact split hero with breadcrumb, eyebrow chip, H1, sub, microbar (3 chips), primary green CTA + tel. Photo right (LCP candidate, `priority` + `fetchPriority="high"`). |
| `src/components/sections/location/LocalTrustBand.tsx` | 3 stat cells (years / projects / response time). Cream surface. |
| `src/components/sections/location/LocationServicesGrid.tsx` | 6 service cards mapped from `location.featuredServices` (each entry has slug + audience). Throws at module-eval time on unresolved slug. |
| `src/components/sections/location/LocalProjectsStrip.tsx` | 3 placeholder project tiles. Leading code comment documents the Phase 1.16 D7.A real-projects fallback rule. |
| `src/components/sections/location/LocalTestimonials.tsx` | 5-star testimonial card (locked `.card-testimonial`-style). Quote prose is plain — author + city visible inside card. |
| `src/components/sections/location/WhyLocalPanel.tsx` | Two-column: shared portrait + per-city ~120-word prose. |
| `src/components/sections/location/LocationFaq.tsx` | Wraps locked `<FaqAccordion>` with 4 native `<details>` per city. No per-item motion. |
| `src/components/sections/location/LocationCTA.tsx` | Wraps shared `<CTA>` with `tokens={{city: location.name}}`. White surface. |
| `src/components/ui/LocationCard.tsx` | 4:3 photo card with full-card `<a>`, gradient overlay, city + tagline + ArrowUpRight chip. |
| `src/app/[locale]/service-areas/page.tsx` | Index route. Composes hero/grid/outside/CTA. Emits BreadcrumbList + ItemList of 6 Place items. |
| `src/app/[locale]/service-areas/[city]/page.tsx` | Dynamic city route. `generateStaticParams` returns 6 slugs × 2 locales = 12 paths. Emits BreadcrumbList + Place + ItemList of 6 Service items + FAQPage. |
| `src/data/locations.ts` | Typed bilingual seed for 6 cities — full content per city. |
| `src/lib/schema/location.ts` | JSON-LD builders: `buildServiceAreasItemList`, `buildPlaceSchema`, `buildLocationServicesItemList`, `buildLocationFaqSchema`. |

---

## Files modified

| Path | Change |
|---|---|
| `src/messages/en.json` | Added `serviceAreas.*` and `location.*` namespaces. |
| `src/messages/es.json` | Added `serviceAreas.*` and `location.*` namespaces with `[TBR]` markers per Phase 1.13 §6 on prose strings (Phase 2.13 native review). |
| `src/data/imageMap.ts` | Added `LOCATION_HERO`, `LOCATION_CARD`, `LOCATION_PROJECT_TILES`, `LOCATION_PORTRAIT` aliases (each city → existing audience/about placeholder for Part 1; Phase 2.04 swap target). |
| `src/app/[locale]/contact/page.tsx` | Retargeted import from `ContactServiceAreaStrip` (deleted) to the promoted `ServiceAreaStrip`. Default behaviour unchanged. |
| `src/_project-state/current-state.md` | Added Phase 1.14 closure block + TODO 1.16 / 2.04 / 2.07 / 2.13 / 2.15 inventories. |
| `src/_project-state/file-map.md` | Added all new component, route, data, schema, and i18n entries. |

## Files removed

| Path | Reason |
|---|---|
| `src/components/sections/contact/ContactServiceAreaStrip.tsx` | Promoted to `src/components/sections/ServiceAreaStrip.tsx` (Phase 1.13 D7b). |

---

## `locations.ts` content notes

| Field | Status | Resolution path |
|---|---|---|
| `geo.lat` / `geo.lng` | Representative public-source values (e.g., Aurora 41.7606 / -88.3201). | Phase 2.07 (Cowork) — confirms map-pin precision. |
| `pin.x` / `pin.y` | Real values from the Phase 1.13 §3.2 production SVG; exact pixel positions per city. | Stable. |
| `trust.yearsServing` / `projectsCompleted` / `responseTimeDays` | Representative placeholders (Aurora 25y/200+/5d, Naperville 25y/120+/5d, etc.). Chose representative numbers over `[TBR]` literals to keep the page presentable; flagged in `current-state.md` for Phase 2.04. | Phase 2.04 (Cowork) — Erick confirms numbers. |
| `featuredServices` | All 6 slugs per city resolve to real entries in `services.ts`. Each entry pairs slug + audience to disambiguate `snow-removal` (residential vs commercial). | Stable. |
| `whyLocal.en` | Original ~95–120-word prose per city, in Erick's voice (no AI corporate-speak). | Stable. |
| `whyLocal.es` | First-pass Spanish draft, prefixed `[TBR]`. | Phase 2.13 native review. |
| `testimonials[].quote` / `attribution` | Placeholder copy with city-specific neighborhood references (e.g., "Sarah K., West Highlands · Naperville"). EN original; ES `[TBR]`. | Phase 2.15 (real Google reviews) for content; Phase 2.13 for ES draft polish if any survive into 2.15. |
| `faq[]` | 4 city-specific Q&As per city per Phase 1.13 D8.A pattern: travel fee, years in city, permit/HOA, city-specific (e.g., Batavia tree-removal ordinance, Lisle commercial scheduling, Naperville HOA approvals). EN original; ES `[TBR]`. | Phase 2.13 native review. |
| `meta.title.en` | All 6 within ≤60-char budget (Aurora 53, Naperville 56, Batavia 53, Wheaton 53, Lisle 51, Bolingbrook 57). | Stable. |
| `meta.description.en` | Pattern: "Family-run landscaping and hardscape in <City>, IL since 2000. <serviceA>, <serviceB>, <serviceC>. Free estimates within <X> days." | Stable. |
| `meta.*.es` | First-pass Spanish drafts, `[TBR]` on description. | Phase 2.13 native review. |
| `hero.photoSlot` | Aliased to existing audience hero placeholder (residential / commercial / hardscape) via `LOCATION_HERO` map in `imageMap.ts`. | Phase 2.04 (Cowork) — real per-city photos sourced from Erick's Drive. |

Per-city `featuredServices` pick (D6 mix):

| City | Mix | Slugs |
|---|---|---|
| Aurora (HQ) | 2 hardscape + 2 residential + 2 commercial | patios-walkways, retaining-walls, lawn-care, landscape-design, landscape-maintenance, snow-removal (commercial) |
| Naperville (premium) | 4 hardscape + 2 residential | patios-walkways, retaining-walls, outdoor-kitchens, fire-pits-features, landscape-design, lawn-care |
| Batavia (riverside) | 3 residential + 2 hardscape + 1 commercial | lawn-care, landscape-design, tree-services, patios-walkways, retaining-walls, landscape-maintenance |
| Wheaton (established affluent) | 3 hardscape + 3 residential | patios-walkways, retaining-walls, fire-pits-features, landscape-design, lawn-care, tree-services |
| Lisle (corporate corridor) | 3 commercial + 2 residential + 1 hardscape | landscape-maintenance, snow-removal (commercial), turf-management, lawn-care, sprinkler-systems, patios-walkways |
| Bolingbrook (suburban-commercial mix) | 3 commercial + 3 residential | landscape-maintenance, snow-removal (commercial), property-enhancement, lawn-care, landscape-design, snow-removal (residential) |

---

## Smoke-test results (against `npx next start` on port 3010)

### Routes — status codes

```
200 /service-areas
200 /es/service-areas
200 /service-areas/aurora
200 /service-areas/naperville
200 /service-areas/batavia
200 /service-areas/wheaton
200 /service-areas/lisle
200 /service-areas/bolingbrook
200 /es/service-areas/aurora
200 /es/service-areas/naperville
200 /es/service-areas/batavia
200 /es/service-areas/wheaton
200 /es/service-areas/lisle
200 /es/service-areas/bolingbrook
404 /service-areas/unknown-city
```

### Index page (`/service-areas`) verification

- H1: `Where we work — DuPage County, Illinois.` ✓
- JSON-LD blocks (3 total): `LocalBusiness` (sitewide from layout), `BreadcrumbList`, `ItemList` of 6 Place items ✓
- SVG map renders with 6 `sa-pin` Link elements ✓
- Each pin is a real `<a>` with locale-aware `href` (`/service-areas/<slug>` in EN, `/es/service-areas/<slug>` in ES) ✓
- `<title>` reads "Map of DuPage County showing Sunset Services' six service areas." ✓
- Cities grid renders 6 `LocationCard`s ✓
- OutsideAreaBand renders phone + email inline links ✓
- Single body amber CTA in the bottom CTA section ✓

### Aurora city page (`/service-areas/aurora`) verification

- Breadcrumb: Home / Service Areas / Aurora (last with `aria-current="page"`) ✓
- H1: `Landscaping & Hardscape in Aurora, IL` ✓
- Microbar chips: `25+ years in Aurora`, `200+ local projects`, `within 5 days` ✓
- LocationServicesGrid renders 6 service cards (verified each links to `/<audience>/<slug>/`) ✓
- LocalProjectsStrip renders 3 placeholder tiles with `Aurora, IL` captions ✓
- LocalTestimonials renders the Patricia M. quote with 5-star `aria-label="5 out of 5 stars"` ✓
- WhyLocalPanel renders the Aurora HQ prose ✓
- ServiceAreaStrip with `excludeSlug={'aurora'}` correctly excludes Aurora from its 5 city links (verified via grep: Aurora link appears 1× total — only in the footer; others appear 2× — strip + footer) ✓
- LocationFaq renders 4 native `<details>` (travel fee, years in Aurora, permits, HOA) ✓
- CTA H2: `Let's design your Aurora outdoor space.` (token interpolation via next-intl ICU) ✓
- Hreflang `<link rel="alternate">` emits en + es + x-default ✓
- JSON-LD blocks (5 total): `LocalBusiness` + `BreadcrumbList` + `Place` + `ItemList` of 6 Service items + `FAQPage` ✓
- Single body amber CTA (`btn-amber` count: 1 navbar chrome + 1 body bottom = correct per the rule "navbar amber is chrome and does not count") ✓

### ES Naperville city page (`/es/service-areas/naperville`) verification

- H1: `Paisajismo y Hardscape en Naperville, IL` ✓
- CTA H2: `[TBR] Diseñemos tu espacio exterior en Naperville.` (token interpolation working through next-intl ICU on the `[TBR]`-prefixed Spanish template) ✓
- Hreflang en + es + x-default ✓

### Schema validation

All 5 JSON-LD blocks visually inspected; structures match Phase 1.13 §5 specs. The 5 blocks pasted into Schema.org's validator (https://validator.schema.org/) parse without errors. (Note: `Place.areaServed` references `https://sunsetservices.us/#localbusiness` via `@id`. The sitewide `LocalBusiness` JSON-LD in `src/app/[locale]/layout.tsx` does not currently emit a matching `@id`. This is a pre-existing dangling reference inherited from Phase 1.12's `ContactPage.mainEntity` pattern; Schema.org accepts dangling `@id`s. Surfaced for ratification — out of scope for Phase 1.14.)

### Build + lint

```
$ npm run build
✓ Compiled successfully in 13.7s
✓ Finished TypeScript in 17.0s
✓ Generating static pages using 7 workers (63/63) in 3.7s

Route (app)
├ ● /[locale]/service-areas
│ ├ /en/service-areas
│ └ /es/service-areas
└ ● /[locale]/service-areas/[city]
  ├ /en/service-areas/aurora
  ├ /en/service-areas/naperville
  ├ /en/service-areas/batavia
  └ [+9 more paths]
```

```
$ npm run lint
(exit 0 — no errors, no warnings)
```

### Reduced motion

Verified by code inspection (the AnimateIn primitive is locked to `MotionConfig reducedMotion="user"` from Phase 1.04). Map-pin hover transform is wrapped in `@media (prefers-reduced-motion: reduce) { transform: none }` inside the SVG style block; locked `.card-photo` image-hover scale respects the same global rule.

### `<AnimateIn>` budget

Counted in source:
- **Index page:** 3 wrappers (CitiesGrid, OutsideAreaBand, ServiceAreasCTA's CTA). Hero unanimated. Within Phase 1.13 §8 budget (≤3).
- **City page:** 8 wrappers (LocalTrustBand, LocationServicesGrid, LocalProjectsStrip, LocalTestimonials, WhyLocalPanel, ServiceAreaStrip, LocationFaq, LocationCTA's CTA). Hero unanimated. Within budget (≤8).

---

## Lighthouse

**Note:** Headless Lighthouse runs against `localhost` were not executed in this phase due to the dev environment's lack of a Chrome+lighthouse-cli pipeline. Production build verifies the pages compile and render cleanly with the right structure (SSR-only HTML for everything except the locked `FaqAccordion` and `AnimateIn` islands; no new client components introduced). Page-weight inspection from build output and component composition matches the §10 budget (no third-party scripts, hero photo size pinned to existing audience-hero placeholders ≤80KB, single LCP-priority hero photo on city pages).

The Phase 1.14 prompt's verification checklist asks for ≥95 on all four metrics for `/service-areas/`, `/service-areas/aurora/`, and `/es/service-areas/naperville/` desktop and mobile. **A manual sweep is recommended** — open Chrome DevTools Lighthouse against `npx next start -p 3010` and run desktop + mobile against those three URLs. Expect: desktop ≥95 (no third-party load, no client islands beyond locked Accordion + AnimateIn). Mobile may sit at the Phase 1.07 P=86 ceiling on the city pages because of the hero photo (placeholder shared with audience heroes is already noise-tuned to LCP-realistic, ~78KB). Real photos in Phase 2.04 should not change the picture.

---

## Decisions captured during implementation

1. **Promoted `ContactServiceAreaStrip` → `ServiceAreaStrip` instead of just adding `excludeSlug` in place.** The component is no longer contact-specific; moving it out of `sections/contact/` and renaming makes the call-sites read straight. The contact page import was retargeted; default behaviour (no `excludeSlug`) is identical.
2. **Created a brand-new shared `<CTA>` rather than refactoring `HomeCTA` + `AboutCTA`.** The Phase 1.13 prompt says "the promoted `HomeCTA`," but the actual codebase still has standalone `HomeCTA` and `AboutCTA` (Phase 1.12 deferred the promotion via §11.2 D16 ratification). Migrating them into the new `<CTA>` was out of scope for Phase 1.14 and would have touched 4 call-sites unnecessarily. The new `<CTA>` is what `ServiceAreasCTA` and `LocationCTA` consume; the existing CTAs are untouched. Surfaced in `current-state.md` for Part-2 consolidation.
3. **`tokens` interpolation via next-intl ICU rather than a custom `interpolate()` helper.** The Phase 1.14 prompt suggests a custom regex-based `interpolate(template, tokens)`. Initial implementation used that; first dev-run surfaced `FORMATTING_ERROR: The intl string context variable "city" was not provided to the string "Let's design your {city} outdoor space."` — next-intl's ICU formatter errors out on `{key}` placeholders before the custom interpolator gets the chance to substitute. Rewired the CTA to forward `tokens` directly as next-intl ICU values: `t('h2', tokens ?? {})`. Functionally equivalent; the public prop signature is unchanged (`tokens?: Record<string, string>`).
4. **Each `featuredServices` entry pairs `slug` + `audience`** (not just slug). Required because `snow-removal` exists in both residential and commercial. Encoding the audience in the seed makes the visible service-card link target unambiguous and prevents `getService('snow-removal')` from silently picking the wrong audience's row.
5. **Used representative `trust` numbers (25 years / 60–200+ projects / 5–7 days) instead of `[TBR]` literals.** The seed type accepts `number | '[TBR]'`. Picking real-looking numbers makes the page presentable in Part 1 and renders cleanly in the LocalTrustBand without conditional `[TBR]` fallbacks. Phase 2.04 confirms with Erick.
6. **Reused existing audience-hero placeholders for city heroes via `LOCATION_HERO` aliases.** Generating 6 new city-specific placeholder images would have required a new `gen-location-placeholders.mjs` script and adding 18 raw assets. The aliasing approach matches the strategy services.ts uses for shared slugs (`imageKey`) and lets Phase 2.04 swap in real photos by changing the static-import target — zero code change in components.
7. **Single commit, not split.** The `ServiceAreaStrip` promotion + `<CTA>` introduction are small enough to bundle with the main feature without bloating the diff. Phase 1.14's commit covers the full surface in one atomic change.

---

## Issues encountered

1. **Turbopack + Tailwind v4 dev-mode CSS scanner picked up flight data.** During the dev-mode iteration, an early version of the new CTA threw `FORMATTING_ERROR` when `t('h2')` saw `{city}` without values. Next.js's error boundary rendered the failure into HTML containing React Server Component flight data (`</script><script>self.__next_f.push([1,"--color-sunset-green-300...`). Tailwind v4's content scanner treated the substring as an arbitrary class generator (`text-[var("])</script>...]`) and emitted a malformed utility class into the generated CSS. The malformed class persists in Turbopack's intermediate cache even after `rm -rf .next` and a server restart. **Production build (`npm run build`) is unaffected.** Smoke testing for this report was performed against `npx next start`. The dev-mode regression is an upstream Turbopack/Tailwind v4 issue, not a source-code defect; flagged in `current-state.md` for visibility.
2. **Pre-existing dangling `@id` reference on `LocalBusiness`.** The `Place.areaServed` JSON-LD references `https://sunsetservices.us/#localbusiness` via `@id`. The sitewide LocalBusiness emitted from `src/app/[locale]/layout.tsx` does not carry a matching `@id`. This is the same pattern Phase 1.12 used for `ContactPage.mainEntity` — Schema.org accepts dangling `@id`s, but tightening would help. Surfaced in `current-state.md` for ratification; not fixed in this phase to avoid touching the locale layout.

---

## Open items / handoffs to Phase 1.15+

- **Phase 1.15 is Design.** It produces the projects portfolio mockups (`docs/design-handovers/Part-1-Phase-15-Design-Handover.md`). Phase 1.16 is Code for projects.
- **Phase 1.16 wires the D7.A real-projects fallback.** `LocalProjectsStrip` carries the rule in a leading code comment: prefer real projects from the page's city; if the city has zero in-portfolio projects, fall back to the closest 3 from neighbor cities — but caption each tile with the ACTUAL project city, never the page city. The placeholder `placeholderCaption` i18n key is the seam.
- **Phase 2.04 (Cowork)** swaps real per-city photography (`LOCATION_HERO`, `LOCATION_CARD`, `LOCATION_PROJECT_TILES`) and confirms the per-city stats (`yearsServing`, `projectsCompleted`, `responseTimeDays`) and postal codes.
- **Phase 2.07 (Cowork)** confirms real per-city lat/lng with map-pin precision; optionally swaps the static SVG map for a Google Maps iframe on the index.
- **Phase 2.13** runs native ES review on every `[TBR]`-flagged string in `src/messages/es.json` and `src/data/locations.ts`. The complete inventory is in `current-state.md`.
- **Phase 2.15** replaces placeholder testimonials with real Google reviews via the Places API.
- **Part-2 housekeeping:** consolidate `HomeCTA`, `AboutCTA`, `ServiceCTA`, `AudienceCTA` onto the new shared `<CTA>` (currently used only by Phase 1.14 routes). Tighten the LocalBusiness JSON-LD by adding `@id`.

---

## Quick reference for Phase 1.15 (Design — projects portfolio)

| Repo state at end of Phase 1.14 |
|---|
| **Live routes:** `/`, `/{audience}/{0,1}`, `/about`, `/contact`, `/service-areas`, `/service-areas/{6 cities}` — all in `en` + `es`. |
| **Locked components:** Button (Primary/Amber/Ghost/Secondary), `.card-photo` / `.card-cream` / `.card-featured`, Badge, Breadcrumb, Eyebrow (inline), FaqAccordion, form fields, ServiceAreaStrip, shared CTA. |
| **Section rhythm:** `py-20` desktop / `py-14` mobile, alternating bg / cream, never two adjacent same-surface. |
| **Amber discipline:** one body amber CTA per page (always the bottom CTA section). Navbar amber is chrome and doesn't count. |
| **Motion:** section-level `<AnimateIn>` only; never per-item. Hero unanimated. Reduced-motion respected globally. |
| **Schema:** Sitewide `LocalBusiness` from layout. Per-page additions: BreadcrumbList (always), ItemList (audiences + service areas), Service (service detail), Place (city), FAQPage (audience + service + city), ContactPage (contact), Person × N (about). |
| **Data:** `src/data/services.ts` (16 services), `src/data/locations.ts` (6 cities), `src/data/team.ts` (3 team members). |
| **Helpers:** `src/lib/schema/{breadcrumb,service,person,contactPage,location}.ts`. |

End of Phase 1.14 completion report.
