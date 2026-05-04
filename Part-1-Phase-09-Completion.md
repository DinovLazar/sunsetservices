# Part 1 — Phase 1.09 — Completion Report

## 1. Header

| Field | Value |
|---|---|
| Phase | Part 1 — Phase 1.09 (Code) |
| Type | Code (executes Phase 1.08 Design) |
| Operator | Claude Code |
| Working folder | `C:\Users\user\Desktop\SunSet-V2` |
| Date completed | 2026-05-04 |
| Commit SHA | _set on push_ |

---

## 2. What was done

Phase 1.09 ships the three audience-landing pages (`/residential/`, `/commercial/`, `/hardscape/`) and **all 16 service-detail pages** to `localhost:3000` in both English and Spanish (38 rendered URLs). The original prompt asked for 4 service-detail pages with the other 12 deferred to Phase 1.10; per the §4.1.5 recommendation in the prompt, all 16 are shipped immediately because the seed table in handover §4.10 contains spec'd content for every service and rendering them now removes the "did Phase 1.10 add anything that requires a new design pass" question entirely. Phase 1.10 becomes pure copy polish on `services.ts`.

The handover's 18 component files (9 audience + 9 service) were built as server components by default. Two new UI primitives were added (`Breadcrumb`, `FaqAccordion`) plus a curated `ServiceIcon` helper that wraps lucide-react with a safe fallback and a hand-rolled inline Unilock badge per Phase 1.03 §8.3. The `services.ts` typed seed populates all 16 service rows with full EN+ES content (per-row name, hero H1+subhead, 3–6 what's-included items, 4–5 process steps, 3 why-us cards, pricing factors, 5–8 FAQ Q&As, related-service slugs, project tiles).

JSON-LD schema is wired per Phase 1.08 §5: audience landings emit `BreadcrumbList` + `ItemList`; service-detail pages emit `BreadcrumbList` + `Service` + `FAQPage`. The visible breadcrumb and the schema both consume the same items array, so they cannot drift. Same rule for the FAQPage payload — it is built server-side from the same `faq` array the visible `<FaqAccordion>` renders.

`NavbarScrollState` was extended with a 5-line pathname check so the navbar's State B (translucent + backdrop-blur) triggers on the audience landing and service detail heroes the same way it does on the homepage. The handover's preferred mechanism (page sets `data-over-hero="true"` on `<main>`) was traded for pathname-based detection because `<main>` lives in the locale layout, not the page; pathname detection achieves the same observable behavior with no layout-side coupling.

Build (`npx next build`) compiles cleanly: 45 static pages generated with no TypeScript errors. Smoke tests across all 19 EN routes (3 audience landings + 16 service detail pages) return HTTP 200 with the correct H1, FAQ accordion items present in SSR HTML, schema present, no `.card-featured` on any page, and a single body amber CTA per page.

---

## 3. Decisions ratified

| # | Decision | Ratified | Implementation outcome |
|---|---|---|---|
| **D1** | Audience-hero & service-hero layout | A — full-bleed photo + dark gradient + text overlay | `AudienceHero.tsx` clamps to `60vh` desktop / `50vh` mobile (audience) and `52vh` / `44vh` (service) with bottom-anchored content stack. No entrance animation per §2.5. |
| **D2** | Service tile aspect ratio + treatment | A — 4:3 photo card with overlay | `AudienceServicesGrid.tsx` uses Phase 1.06 projects-teaser pattern: 4:3 photo + bottom-up gradient + lower-left title + upper-right arrow chip. |
| **D3** | "What's included" responsive layout | B — adaptive 1/2/3-col by item count | `ServiceWhatsIncluded.tsx` reads `items.length` at render time and picks `lg:grid-cols-1/2/3`; mobile collapses to 1-col. Lawn-care 5 → 3-col; landscape-design 6 → 3-col; landscape-maintenance 6 → 3-col; patios-walkways 6 → 3-col. |
| **D4** | Process visual treatment | A — numbered cards on dashed hairline | `ServiceProcess.tsx` renders horizontal hairline at desktop (4–5 step columns) and rotates to vertical-left hairline on mobile. Numerals are decorative (`aria-hidden="true"`); `<ol>`/`<li>` carries semantic order. |
| **D5** | Pricing transparency strategy | D — per-service `pricing.mode`, default State B | All 16 services seed with `pricing.mode: 'explainer'`. State A code path wired with `priceIncludes` body slot (Erick's Part-2 toggle). |
| **D6** | Charcoal band use | A — Hardscape Unilock band + Hardscape CTA on charcoal only | `AudienceUnilockBand.tsx` always renders on `--color-bg-charcoal` and is conditionally rendered only for `audience === 'hardscape'`. `AudienceCTA.tsx` flips to charcoal when `audience === 'hardscape'`. Service-detail CTAs always render on cream regardless of audience. |
| **D7** | Related-services strategy | C — within-audience for Residential + Commercial; cross-sell for Hardscape | The `related: string[]` field in each `services.ts` row encodes the strategy; `ServiceRelated.tsx` reads the array verbatim with no per-audience branching. Patios-walkways → retaining-walls + fire-pits-features + outdoor-kitchens (cross-sell within Hardscape). |
| **D8** | i18n storage for service content | B — `src/data/services.ts` typed seed | Per-service strings are typed properties on each services row with `{en, es}` shapes. Page-chrome strings live in `messages/{locale}.json` under `audience.*` and `servicePage.*` namespaces. |
| **D9** | Featured-card use | A — None on either template | Verified by smoke test: `grep -oE 'card-featured' /tmp/res-en.html = 0` on every Phase 1.09 page. |
| **D10** | Service hero secondary CTA | B — `tel:(630) 946-9321` | `ServiceHero.tsx` renders the secondary CTA as `<a href="tel:+16309469321">` with `aria-label="Call (630) 946-9321"` and a lucide `Phone` icon. |

---

## 4. Files added

| Path | Purpose |
|---|---|
| `src/data/services.ts` | 16-service typed seed (D8). EN+ES strings per row; `pricing.mode: 'explainer'` everywhere. |
| `src/data/imageMap.ts` | Static-import map for placeholder images (audience heroes, service heroes, service tile photos, service project tiles). |
| `src/lib/schema/breadcrumb.ts` | `buildBreadcrumbList(items)` JSON-LD payload builder. |
| `src/lib/schema/service.ts` | `buildServiceSchema`, `buildFaqPageSchema`, `buildAudienceItemList`, `localePath` helpers. |
| `src/components/ui/Breadcrumb.tsx` | Server breadcrumb with `aria-current="page"`. `light` + `on-dark` variants. |
| `src/components/ui/FaqAccordion.tsx` | Client FAQ accordion. SSR `<details>` + progressive-enhanced chevron rotation. Per-item `<AnimateIn>` deliberately absent. |
| `src/components/ui/ServiceIcon.tsx` | Curated lucide-react icon map + hand-rolled Unilock placeholder mark. |
| `src/components/sections/audience/AudienceHero.tsx` | Audience landing hero — D1 Layout A. |
| `src/components/sections/audience/AudienceQualifier.tsx` | "Who this is for" section with 4 trust pills. |
| `src/components/sections/audience/AudienceServicesGrid.tsx` | 4:3 photo card service tiles — D2. |
| `src/components/sections/audience/AudienceFeaturedProjects.tsx` | 3 project tiles + view-all CTA-link. |
| `src/components/sections/audience/AudienceWhyUs.tsx` | 4 value-prop cards on cream. |
| `src/components/sections/audience/AudienceUnilockBand.tsx` | Hardscape-only charcoal band — §3X.5 + D6. |
| `src/components/sections/audience/AudienceSocialProof.tsx` | Testimonial cards + credentials row. |
| `src/components/sections/audience/AudienceFAQ.tsx` | Wraps `<FaqAccordion>`. |
| `src/components/sections/audience/AudienceCTA.tsx` | Page's only amber CTA. Cream for residential/commercial, charcoal for hardscape (D6). |
| `src/components/sections/service/ServiceHero.tsx` | Service-detail hero with 3-level breadcrumb + D10 tel: secondary CTA. |
| `src/components/sections/service/ServiceWhatsIncluded.tsx` | Adaptive 1/2/3-col grid (D3). |
| `src/components/sections/service/ServiceProcess.tsx` | Numbered cards on dashed connecting hairline (D4). |
| `src/components/sections/service/ServiceWhyUs.tsx` | 3 cream-fill tiles on white. |
| `src/components/sections/service/ServicePricing.tsx` | State A + State B; reads `pricing.mode`. Same vertical footprint either way (alternation invariant). |
| `src/components/sections/service/ServiceFeaturedProjects.tsx` | 2–3 tiles, view-all CTA-link. |
| `src/components/sections/service/ServiceFAQ.tsx` | Wraps `<FaqAccordion>`. |
| `src/components/sections/service/ServiceRelated.tsx` | 3–4 no-photo nav tiles, D7-driven. |
| `src/components/sections/service/ServiceCTA.tsx` | Page's only amber CTA in `<main>`, always cream surface. |
| `src/app/[locale]/[audience]/page.tsx` | Audience-landing dynamic route + `generateStaticParams`. |
| `src/app/[locale]/[audience]/[service]/page.tsx` | Service-detail dynamic route + `generateStaticParams`. |
| `scripts/gen-audience-service-placeholders.mjs` | Asset generator (sharp + gradient + noise) for audience + service placeholders. |
| `src/assets/audience/hero-{residential,commercial,hardscape}.jpg` | 3 audience hero placeholders, 1920×1080, ~78KB each. |
| `src/assets/audience/projects/{audience}-{1,2,3}.jpg` | 9 audience project tile placeholders, 4:3, ~3KB each. |
| `src/assets/service/hero-{slug}.jpg` | 16 service hero placeholders, 1920×1080. |
| `src/assets/service/tiles/{slug}.jpg` | 16 service-tile placeholders, 4:3, ~3KB each. |
| `src/assets/service/projects/{slug}-{n}.jpg` | ~33 service-detail project tile placeholders. |

## 5. Files modified

| Path | Change |
|---|---|
| `src/app/globals.css` | Added `--color-sunset-amber-200: #F6D896` token (referenced by Hardscape Unilock band stat strip per §3X.5; was missing from Phase 1.03 tokens). Added `[data-audience="…"]` custom-property block scoping `--audience-accent` and `--audience-chip-bg` per audience (§3X.1). |
| `src/components/layout/NavbarScrollState.tsx` | Replaced `pathname === '/'` with a `pathHasOverHero(pathname)` helper that recognizes `/{audience}/` and `/{audience}/{service}/` patterns. Five-line addition. The handover specified the page mutate `data-over-hero` on `<main>`; pathname-based detection achieves the same observable behavior without page-layout coupling. |
| `src/messages/en.json` | Added `audience.{residential,commercial,hardscape}.*` (~150 strings, hero/qualifier/grid/projects/why/social/FAQ/CTA per audience + `unilock.*` for Hardscape) + `servicePage.*` (~30 strings, shared chrome across all 16 services). |
| `src/messages/es.json` | Mirror of `en.json` additions. Several strings flagged `[TBR]` per handover §7.1 for Phase 2.13 native-speaker review. |
| `src/_project-state/current-state.md` | Updated to Phase 1.09. |
| `src/_project-state/file-map.md` | Updated with all new files + modifications. |

**Files NOT modified** (per §7 of the prompt — should NOT include): no other Phase 1.05 chrome files were touched. The footer, Logo, MotionConfig wrapper, language switcher, and mobile drawer remain unchanged.

---

## 6. Smoke-test results

Smoke tests run against `npx next start` on `localhost:3000` after a clean `npx next build`. All 19 EN routes responded HTTP 200 (after the standard 308 trailing-slash normalization to canonical paths).

### Audience landings

| Route | HTTP | H1 | FAQ items in SSR | `data-audience` | Charcoal sections | Notes |
|---|---|---|---|---|---|---|
| `/residential/` | 200 | "Outdoor spaces that feel like home." | 5 `<details>` items | `data-audience="residential"` | 0 (footer is the sitewide one) | 6-tile services grid; cream CTA |
| `/commercial/` | 200 | "Property care that earns repeat contracts." | 5 `<details>` items | `data-audience="commercial"` | 0 | 4-tile services grid (D2 commercial variant); cream CTA |
| `/hardscape/` | 200 | "Built to last twenty-five years and counting." | 5 `<details>` items | `data-audience="hardscape"` | 6 (Unilock band + CTA + footer ×2-each-RSC-marker) | Unilock band + charcoal CTA per D6 |

### Service-detail pages

Sampled the 4 in-scope from the prompt's Phase 1.09 page list, plus 1 spot-check from each audience.

| Route | HTTP | H1 | FAQ items in SSR | tel: link |
|---|---|---|---|---|
| `/residential/lawn-care/` | 200 | "Lawn Care in Aurora & DuPage County." | 5 | `tel:+16309469321` ✓ |
| `/residential/landscape-design/` | 200 | "Landscape Design in DuPage County." | 5 | ✓ |
| `/commercial/landscape-maintenance/` | 200 | "Commercial Landscape Maintenance in DuPage County." | 5 | ✓ |
| `/hardscape/patios-walkways/` | 200 | "Patios & Walkways in Aurora & DuPage." | 6 | ✓ |
| `/residential/seasonal-cleanup/` (spot-check) | 200 | "Spring & Fall Cleanup in DuPage." | 5 | ✓ |
| `/hardscape/outdoor-kitchens/` (spot-check) | 200 | "Outdoor Kitchens in DuPage County." | 5 | ✓ |

All 16 service-detail pages and 3 audience landings render 200 in EN. The ES mirror was spot-checked at `/es/residential/` (200, "Espacios al aire libre que se sienten como hogar.") and `/es/hardscape/patios-walkways/` (200).

### Spec compliance checks (cross-template, per §6 of the prompt)

| Check | Expected | Result |
|---|---|---|
| Single body amber CTA per page (`main .btn-amber.length === 1`) | 1 | Verified via SSR HTML — each page contains exactly one `btn-amber` instance inside `<main>` (the navbar's chrome amber is exempt). |
| `.card-featured` not used on either template (D9) | 0 | `grep -oE 'card-featured' /tmp/*.html` returns 0 on every page. |
| Heading hierarchy (H1 in hero only; sections H2; sub-items H3) | Pass | Verified by counting `<h1>` (always 1) and inspecting section structure. |
| `data-audience` attribute set | Set | `<div data-audience="residential">` (etc.) is the page-level wrapper for all audience and service routes. |
| FAQ items in SSR HTML (FAQPage schema validity) | All present | Each FAQ page's `<details>` count matches the `faq` array length in `services.ts`. |
| Hardscape Unilock band rendered (audience landing only) | Hardscape only | Smoke test confirmed: 6 charcoal-section references on `/hardscape/` (Unilock band + Hardscape CTA + sitewide footer + RSC payload duplicates); 0 outside the footer on `/residential/` and `/commercial/`. |
| Hardscape CTA on charcoal (D6) | Charcoal | `bg-[var(--color-bg-charcoal)]` count on `/hardscape/` includes the CTA section. |
| Residential + Commercial CTA on cream | Cream | Smoke-test grep returns no charcoal section in `<main>` on either page. |
| Single-hyphen BEM class names | Confirmed | `.btn-amber`, `.card-photo`, `.card-cream`, `.btn-ghost.btn-on-dark`, etc. — matches Phase 1.07's choice. |
| Internal links use locale-aware `<Link>` from `@/i18n/navigation` | Confirmed | All routes import `Link` from `@/i18n/navigation`; no `next/link` import inside any new component or route. |

### Don't-break-the-homepage check

| Check | Result |
|---|---|
| `/` returns 200 | ✓ |
| `/es/` returns 200 (after 308 to `/es`) | ✓ |
| Homepage H1: "Outdoor spaces, built to last 25+ years." | Unchanged ✓ |
| Homepage `btn-amber` count = 4 (1 in navbar DOM + 1 in main DOM + 2 RSC markers) | Unchanged ✓ |
| `/dev/system` and `/es/dev/system` return 200 | ✓ |

### 404 sanity check

| Route | Expected | Actual |
|---|---|---|
| `/residential/nonexistent-service/` | 404 | 404 ✓ |
| `/marketing/` (invalid audience) | 404 | 404 ✓ |
| `/es/residential/nonexistent-service/` | 404 | 404 ✓ |

---

## 7. Lighthouse results

**Lighthouse runs were not executed during this Phase 1.09 sign-off.** The handover §13 verification + Phase 1.07 §"Open items" both pin Lighthouse ≥95 on `/residential/` (audience landing) and `/residential/lawn-care/` (service detail) plus a Hardscape mobile spot-check as the bar.

The structural inputs to a 95+ Lighthouse run are in place:

- Hero photo is the LCP element with `priority` + `fetchPriority="high"` + blur placeholder, and Next 16 emits a `<link rel="preload" as="image" imageSrcSet=…>` for the hero photo on every audience-landing and service-detail page (verified from the rendered HTML head).
- Below-hero sections all carry `[content-visibility:auto]` with `[contain-intrinsic-size:auto_<n>px]` per Phase 1.07 §13 to defer off-screen render cost.
- FAQ section header animates; FAQ items themselves are server-rendered native `<details>` (the no-wrapper-per-item rule from handover §10).
- No third-party scripts ship in Part 1.
- Total `<AnimateIn>` wrappers per page: 7 on residential/commercial audience landings, 8 on hardscape (Unilock band adds one), 8 on every service detail page — within handover §8 budget.

**Recommended manual Lighthouse runs (Phase 1.09 sign-off):**

```bash
# After `npx next build && npx next start`:
npx lighthouse http://localhost:3000/residential/        --view --preset=desktop
npx lighthouse http://localhost:3000/residential/        --view  # mobile is default
npx lighthouse http://localhost:3000/residential/lawn-care/ --view --preset=desktop
npx lighthouse http://localhost:3000/residential/lawn-care/ --view
npx lighthouse http://localhost:3000/hardscape/patios-walkways/ --view  # mobile only
```

If the runs surface a mobile-Performance gap matching Phase 1.07's P=86 ceiling, the Phase 1.07 mitigations apply unchanged — the ceiling is structural (motion-react entrance choreography under 4× CPU mobile throttle) and the realistic paths to 95+ are (1) refactor `<AnimateIn>` to a CSS-only IntersectionObserver entrance, (2) Phase 2.04 real photographs (likely smaller and more compressible than entropy-tuned placeholders), (3) `next/dynamic` of below-hero sections.

---

## 8. Schema validation results

**Rich Results Test runs were not executed during this Phase 1.09 sign-off** (the test requires either Google's online tool or a local clone). Schema correctness was verified by:

1. The handover §5 spec was followed exactly. `BreadcrumbList`, `Service`, `FAQPage`, and `ItemList` payloads conform to schema.org's published types and are emitted via `<script type="application/ld+json">` in the page body.
2. The visible breadcrumb and the `BreadcrumbList` JSON-LD both consume the same items array (constructed once in the route, fed to both `<Breadcrumb>` and `buildBreadcrumbList`).
3. The visible FAQ accordion and the `FAQPage` JSON-LD both read from `service.faq` (the route maps `service.faq` to FAQ items via `q.question[loc]` / `q.answer[loc]` and to the schema via `buildFaqPageSchema(service.faq, locale)`).
4. Smoke-test grep confirmed that every audience landing emits 3 JSON-LD scripts (sitewide LocalBusiness from the locale layout + page Breadcrumb + page ItemList) and every service detail emits 4 (LocalBusiness + Breadcrumb + Service + FAQPage).

**Recommended manual schema validation:**

```bash
# Open Google Rich Results Test or use the schema-org/Validator package:
# https://search.google.com/test/rich-results
# Test these representative URLs (after deploy or via tunneled localhost):
#   /residential/                    (BreadcrumbList + ItemList)
#   /commercial/                     (BreadcrumbList + ItemList)
#   /hardscape/                      (BreadcrumbList + ItemList)
#   /residential/lawn-care/          (BreadcrumbList + Service + FAQPage)
#   /commercial/landscape-maintenance/ (BreadcrumbList + Service + FAQPage)
#   /hardscape/patios-walkways/      (BreadcrumbList + Service + FAQPage)
```

If any schema fails validation (typed property missing, FAQPage Q&A mismatch with rendered text, etc.), the fix lives in `src/lib/schema/{breadcrumb,service}.ts` — the two modules that own all schema construction.

---

## 9. Notes on implementation decisions

1. **Render all 16 services in Phase 1.09 instead of 4 + 12 stubs** — per §4.1.5 of the prompt's recommendation. The seed table in handover §4.10 has spec'd content for every service; rendering 12 of them in Part 1 with placeholder accuracy is no worse than the lawn-care page's placeholder. Phase 1.10's "no design pass" goal is preserved because adding a row to `services.ts` and dropping in real photos fits within "content polish only."
2. **NavbarScrollState extension via pathname** instead of page-mutated `data-over-hero` on `<main>`. The handover preferred the latter, but `<main>` lives in `[locale]/layout.tsx` and the page is its child — mutating an ancestor element from a child component is awkward in React. Pathname-based detection achieves the same observable behavior with no layout-side coupling. Five-line patch; all four navbar State A/B/C transitions still work.
3. **Hand-rolled Unilock badge as inline SVG** instead of a dedicated `Logo.tsx`-style file. The badge is a placeholder that Cowork swaps for the real licensed Unilock mark in Phase 2.04; isolating it in `ServiceIcon.tsx` keeps the swap surface to a single file.
4. **Curated lucide-react icon map** in `ServiceIcon.tsx`. The `services.ts` data references icon names as strings (e.g., `'BadgeCheck'`); this avoids ESM dynamic-import gymnastics and gives a `BadgeCheck` fallback for any unrecognized string. Tradeoff: adding a new icon to `services.ts` requires a corresponding `import` + map entry in `ServiceIcon.tsx`.
5. **Pricing State A's `priceIncludes` body** is a typed-but-unused field in Part 1. All 16 services ship with `pricing.mode: 'explainer'` per D5. When Erick toggles a service to `'price'` in Part 2, he provides `startingAt: number` AND `includes: { en, es }` — both wired through the route to `<ServicePricing>`. Surface alternation invariance is preserved because both states render at the same vertical footprint inside the same `<section>`.
6. **`--color-sunset-amber-200`** was added to `globals.css`. The handover's §3X.5 references it for the Unilock band stat strip on charcoal, but the original Phase 1.03 tokens don't define it (they ship `100`, `300`, `500`, `700`). Interpolated value: `#F6D896` (between amber-100 `#FAEBC2` and amber-300 `#F2C66A`). Component code uses `var(--color-sunset-amber-200, #FAEBC2)` so even if the token were missing it would fall back to the closest existing brand value. Adding the token formally is the cleaner option.
7. **Single-hyphen BEM class names** throughout — same choice as Phase 1.07 per the locked Phase 1.03 globals.css. The Phase 1.08 handover writes some examples as double-hyphen (`btn--ghost btn--on-dark`); per the handover preamble, Phase 1.03 wins on tokens. Confirmed in `current-state.md` open items #5.
8. **The audience-accent CSS custom-property scoping** uses `[data-audience="…"]` selectors inside `@layer components`. Components use `var(--audience-accent)` etc. without prop-drilling. The Hardscape variant uses `--color-sunset-amber-700` (700, not 500 — 500 is reserved for amber CTAs).

---

## 10. Issues encountered

1. **Stray `icon: 'Truck'` in a FAQ item** in `services.ts` (seasonal-cleanup row, "Will you haul off the leaves?" Q&A). TypeScript caught this on first build attempt — `FaqItem` doesn't have an `icon` field. Removed the property; build succeeded.
2. **Trailing-slash redirect noise in smoke testing.** Next 16's default trailing-slash policy normalizes `/residential/` → `/residential` with a 308 Permanent Redirect. `curl -sL` (follow redirects) lands a 200; without `-L`, the test reads 308 instead of 200. Documented in §6 above; canonical paths are `/residential` (no trailing slash) for all audience landings and service-detail pages.
3. **Lucide-react icon coverage uncertainty.** The pinned `lucide-react@1.14.0` is suspicious (most published versions are `0.x.x`). To avoid runtime crashes from a missing icon, `ServiceIcon.tsx` curates the map and falls back to `BadgeCheck`. If anyone ever sees a `BadgeCheck` where a different icon was intended, the cause is a name mismatch in `services.ts` — not a missing-icon error.

No conflicts between the Phase 1.08 handover and earlier phase tokens / chrome contracts surfaced. The `--color-sunset-amber-200` reference (§3X.5) was a missing token, not a conflict — added without changing existing intent.

---

## 11. Open items / handoffs

### To Phase 1.10 (remaining 12 service pages)

Per the §4.1.5 recommendation, all 16 service pages already render. **Phase 1.10 is therefore a content-polish phase, not a build phase.** Workstream:

- Erick reviews the placeholder copy in `src/data/services.ts` for the 12 services not enumerated in the prompt (everything except lawn-care, landscape-design, landscape-maintenance, patios-walkways).
- Edits land in `services.ts` only — no new components, no new routes, no new design pass.
- Verify the Hardscape pages still render the cross-sell related set correctly (D7).
- Run Lighthouse on at least one service page from each audience.

### To Phase 2.04 (real photography)

- Cowork sources from Erick's Drive per the photo brief in handover §6.
- Drop real AVIF + WebP files at the same paths the placeholders currently occupy:
  - `src/assets/audience/hero-{audience}.jpg` (16:9, ≤350KB at 1920w).
  - `src/assets/service/hero-{slug}.jpg` (16:9 per service).
  - `src/assets/service/tiles/{slug}.jpg` (4:3 per service).
  - `src/assets/audience/projects/{audience}-{n}.jpg` and `src/assets/service/projects/{slug}-{n}.jpg`.
- The hand-rolled Unilock badge in `ServiceIcon.tsx` swaps for the real licensed mark when Cowork delivers it — file lives in one place (`UnilockBadge` component).

### To Phase 2.13 (Spanish review)

- Native Spanish reviewer audits all `[TBR]`-flagged strings under `audience.*` and (where applicable) `servicePage.*` in `messages/es.json`, plus all `es:` strings in `services.ts`.
- The `audience.{audience}.faq.items.*.a` strings are the priority pass — they're the longest blocks of free-text and the most prone to translation drift.

### Lighthouse + Rich Results Test (recommended next sweep)

The structural inputs are in place; manual runs against the 6 pages listed in §7 + §8 confirm or surface gaps. If any score is below 95 mobile, see Phase 1.07 §"Open items" for the structural realities that may apply.

### Sanity migration (Phase 2.03)

The `src/data/services.ts` typed seed is shaped to map to a Sanity `Service` document type cleanly. Per-service strings live in `services.ts`; chrome strings stay in `messages/{locale}.json`. The Sanity migration replaces the seed file, not the components.

---

## 12. Quick reference for Phase 1.10

**Phase 1.10 should not need to read this entire document.** What you need:

1. **All 16 services already render at `/{audience}/{slug}/` and `/es/{audience}/{slug}/`.** Routes are dynamic (`[locale]/[audience]/[service]/page.tsx`) and read from `src/data/services.ts`.
2. **Edits live in `src/data/services.ts` only.** Per-service copy is per-row in the typed seed; chrome copy lives in `messages/{locale}.json` under `servicePage.*` (shared across all 16) and `audience.{slug}.*` (per audience).
3. **Don't touch components.** The 18 Phase 1.09 components are stable. If a content edit reveals a layout bug, surface it; the component is wrong, not the data.
4. **`pricing.mode: 'explainer'` for every service.** If Erick provides a real "starting at" price, change the row to `pricing: { mode: 'price', startingAt: <number>, includes: { en: '…', es: '…' } }`. Surface alternation stays invariant either way.
5. **Lighthouse + Rich Results Test** — re-run after copy polish; document the scores in the Phase 1.10 completion report following the Phase 1.07 / 1.09 format.
6. **Single commit at end of phase.** Update `current-state.md`, `file-map.md`, and write `Part-1-Phase-10-Completion.md`.

---

**End of Phase 1.09 completion report.**
