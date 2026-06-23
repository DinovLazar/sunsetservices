# Phase B.12 — Trenchless & Directional Boring Division — Completion Report

**Date:** 2026-06-24
**Branch:** `phase/b12-trenchless-division` (off `main`, which already carried the M.16 homepage redesign + the stars-only / Calendly-removed state).
**Outcome:** Shipped a fifth, first-class service division — **Trenchless & Directional Boring** (`trenchless`) — built entirely on the existing dynamic division/service templates, surfaced everywhere the four siblings appear, with all validation harnesses green and EN/ES leaf-key parity equal.

---

## 1. What shipped

A new division that is indistinguishable from the four live divisions (landscape / hardscape / waterproofing / snow-removal):

- **6 services**, each a full bilingual `Service` object (5 whatsIncluded · 4 process · 3 whyUs · explainer pricing on `TRENCHLESS_FACTORS` · 2 projects · 3 related · projectsTag), matching the waterproofing sibling structure:
  | # | Service (EN) | Slug | Service (ES, first-pass) |
  |---|---|---|---|
  | 1 | Conduit Installation | `conduit-installation` | Instalación de Conductos |
  | 2 | Trenching & Excavation | `trenching-excavation` | Zanjeo y Excavación |
  | 3 | Sewer Line Replacement | `sewer-line-replacement` | Reemplazo de Línea de Drenaje |
  | 4 | Missile Boring | `missile-boring` | Perforación con Topo Neumático |
  | 5 | Handhole / Pull Box Installation | `handhole-pull-box` | Cajas de Registro y de Tiro |
  | 6 | HDPE Pipe Fusing | `pipe-fusing` | Fusión de Tubería de Polietileno |

- **14 new routes** (landing + 6 services × EN/ES), all prerendered and returning 200:
  `/trenchless` + `/trenchless/{conduit-installation,trenching-excavation,sewer-line-replacement,missile-boring,handhole-pull-box,pipe-fusing}` and the `/es/...` equivalents.

- Division metadata, accent token, dedicated pricing factors, and the full bilingual landing content block.

---

## 2. Cross-reference surfaces touched (every place the four siblings appear)

| Surface | File(s) | What changed |
|---|---|---|
| Division union | `src/data/services.ts` | `Division` += `'trenchless'` |
| Services data | `src/data/services.ts` | `TRENCHLESS_FACTORS` + 6 `Service` objects |
| Division metadata | `src/data/divisions.ts` | `DIVISIONS` append + `DIVISION_META.trenchless` (commercial photo aliases) |
| Accent token | `src/app/globals.css` | `[data-division='trenchless']` → orange-700 / chip orange-50 |
| Icon registry | `src/components/ui/ServiceIcon.tsx` | Registered trenchless icon set (also fixed Construction/Gauge/MapPin fallbacks) |
| Homepage divisions block | `src/components/sections/home/HomeAudienceEntries.tsx` | 5th card; `lg:grid-cols-5` balance |
| Homepage services overview | `src/components/sections/home/HomeServicesOverview.tsx` | `DOT_COLOR` + `DIVISION_CTAS` 5th button; `lg:grid-cols-5` |
| Navbar mega-panel + drawer | `src/lib/constants/navigation.ts`, `src/components/layout/ServicesMegaPanel.tsx` | 6th column (5 divisions + service-areas); `lg:grid-cols-6`; drawer auto-mirrors |
| Footer | `src/lib/constants/navigation.ts` | Trenchless division link (auto-rendered by `FooterLinks`) |
| Quote wizard | `src/components/wizard/WizardStep1Audience.tsx`, `src/data/wizard.ts` | Step-1 tile; `getStep3Group` → `'residential'` |
| Quote API + Sanity | `src/lib/quote/validation.ts`, `sanity/schemas/quoteLead.ts`, `quoteLeadPartial.ts`, `src/lib/email/templates/QuoteLeadAlertEmail.tsx` | Zod enum + two Sanity option lists + lead-email `DIVISION_LABEL` |
| Contact form | `src/components/forms/ContactForm.tsx`, `src/lib/contact/contactSchema.ts`, `sanity/schemas/contactSubmission.ts`, `src/lib/email/templates/ContactAlertEmail.tsx` | select option + Zod enum + Sanity option + alert-email label |
| Wizard storage | `src/lib/wizard/storage.ts` | `VALID_DIVISIONS` += trenchless (was silently rejecting saved trenchless selections) |
| `/projects` filter | `src/app/[locale]/projects/page.tsx`, `src/app/[locale]/projects/[slug]/page.tsx` | counts chip taxonomy + project-detail `divisionLabel` map (exhaustive) |
| Legal prose | `src/content/legal/terms.tsx`, `privacy.tsx` | Service descriptions now list trenchless / directional boring |
| Portfolio automation | `src/lib/automation/portfolio/extractJobMetadata.ts` | 6 trenchless keyword rows for future job classification |
| i18n | `src/messages/en.json`, `es.json` | `division.trenchless.*` landing block + 19 cross-ref keys, EN/ES lockstep |
| Sitemap / JSON-LD / routes | (auto) | `sitemap.ts`, schema builders, and both dynamic routes derive from `DIVISIONS`/`SERVICES` — no edits needed; verified emitting all 14 routes + BreadcrumbList/ItemList/Service |
| Validators | `scripts/validate-{seo,a11y,mobile,schema}.mjs` | path lists extended (`validate-links` auto-imports `DIVISIONS`) |
| TRANSLATION_NOTES | `Sunset-Services-TRANSLATION_NOTES.md` | §M.01f1 division + 6 service ES names + native-review flags |

**QA-2 completeness sweep:** every file that enumerates the four siblings now includes trenchless, except the surfaces deliberately left unchanged per the locked decisions: the per-city `featuredServices` grid (`locations.ts`, `LocationServicesGrid.tsx`) and the `imageMap.ts` aliases (trenchless reuses existing keys, no new entries). Historical one-time migration/seed scripts and dynamic routes (which read `DIVISIONS`) were correctly untouched.

---

## 3. Verification matrix (all against the clean production build)

| Check | Result |
|---|---|
| `npm run build` | ✅ Compiled successfully; 202 static pages incl. all 14 trenchless routes prerendered (verified status 200 in prerender-manifest) |
| `npm run lint` | ✅ 0 errors (9 pre-existing warnings, none introduced) |
| `npx tsc --noEmit` | ✅ 0 source errors |
| `validate:schema` | ✅ 0 errors / 0 warnings — `/trenchless` emits BreadcrumbList + ItemList; `/trenchless/conduit-installation` emits BreadcrumbList + Service (parity with siblings) |
| `validate:seo` | ✅ 0 errors / 0 warnings across 196 URLs — every trenchless route 200, canonical + hreflang + sitemap-completeness correct |
| `validate:a11y` | ✅ 0 errors / 0 warnings across 22 URLs — `/trenchless` + service axe 0, Lighthouse a11y 100 (after the contrast fix below) |
| `validate:mobile` | ✅ 0 errors (977 warnings, all pre-existing/non-blocking; exit 0) |
| `validate:links` | ✅ `hard: 0` (zero broken links); all 14 trenchless routes crawl 200; 0 wrong-destination, 0 ≥400 for trenchless |
| `test:consent` | ✅ 23 passed / 0 failed |
| EN/ES leaf-key parity | ✅ **1335 = 1335** (identical key paths, verified by set comparison) |

**One real defect caught + fixed by the harness:** `validate:a11y` flagged a serious AA `color-contrast` violation on the 4 `/trenchless` qualifier pills — orange-700 (#B45309) text on the orange-100 chip-bg (#FBE4CC) was **4.08:1** (< 4.5). Fixed by switching the trenchless `--audience-chip-bg` to **orange-50** (#FEF4EA), lifting it to **4.62:1** — and matching the lighter `-50` chip fills hardscape/waterproofing already use. Re-ran a11y → 0 violations.

**Build-cache lesson:** the first (incremental) build served a stale 404 prerender for the `/trenchless` landing (the landing `page.tsx` file was unchanged; only its imported `divisions.ts` changed). A clean `rm -rf .next && npm run build` produced the correct render. All verification above is against the clean build.

**Environment note (not a defect):** `validate:links` does a full Playwright crawl of 270+ pages and intermittently hit a Chromium resource error (`Target.createTarget: Not supported`) when two crawls ran concurrently. The link report still completed with `hard: 0` and every trenchless route resolved 200; `validate:seo` independently confirms all routes 200. No broken links were introduced.

---

## 4. Parallel-agent execution (waves) + conflicts resolved

- **Wave 0 (recon, 1 agent):** produced the full division integration map (every `path:line` where divisions are enumerated). Caught surfaces the brief listed plus extras (`HomeServicesOverview` DOT_COLOR, project-detail `divisionLabel`, `wizard/storage.ts`).
- **Wave 1 (content, 6 parallel agents):** one per service, each writing a single scratch `.ts` file (no shared-file collisions). All returned honesty-flagged summaries; output reviewed field-by-field before integration.
- **Wave 2 (integration, single writer = main thread):** spliced the 6 services into `services.ts` via a deterministic Node script; authored the `division.trenchless.*` landing block + all cross-ref i18n via a self-validating script that asserts unique anchors, re-parses JSON, and proves EN/ES leaf parity.
- **Wave 3 (wiring, 3 parallel agents on disjoint file sets):** wizard/quote, contact, validators/projects — each verified its own typecheck. The navbar + homepage (layout-sensitive) were done on the main thread.
- **Wave 4 (QA):** parallel adversarial content audit (clean) + harness runs + completeness sweep; the contrast fix and completeness fixes applied on the main thread.

**Conflicts:** none — every wave funneled shared-file writes (`services.ts`, `messages/*.json`) through the single integrator; one Wave-3 agent was interrupted mid-run and cleanly re-dispatched (it had already landed 3 of its 5 files; the re-run completed the rest and verified the first 3). Typecheck caught two exhaustive `Record<Division>` maps and an icon-registry gap before any build.

---

## 5. Own decisions surfaced (not specified by the brief)

1. **Trenchless accent = `--color-sunset-orange-700`** (burnt sienna) with chip-bg **orange-50** (changed from -100 for AA). No blue/slate ramp exists in the token layer; orange-700 is the on-brand, earthy/industrial, distinct choice.
2. **Pricing = 3 factors** (not 4) so the shared `servicePage.pricing.explainer.lead` copy ("depends on three things") stays accurate — matches the existing 3-factor blocks.
3. **Short chip/header label "Trenchless" / "Perforación"** in the navbar mega-panel column header, homepage card tag, and `/projects` filter chip (tight chrome where all siblings use 1-word names); the **full "Trenchless & Directional Boring" / "Perforación Direccional y Sin Zanja"** is used on the division landing, footer link, contact dropdown, and wizard tile. A 28-char header would wrap to 3 lines in the 6-column grid — a "bolted-on tell."
4. **Homepage divisions grid `lg:grid-cols-5`; mega-panel `lg:grid-cols-6`; services-overview CTA row `lg:grid-cols-5`** — so 5 cards / 6 columns / 5 buttons each land in one balanced row (verified by screenshot at 1440px: single row, no overflow).
5. **`getStep3Group('trenchless') → 'residential'`** matches the *live* behavior of `landscape`/`waterproofing` (which return `'residential'` unconditionally). The brief's prose said "commercial-by-propertyType," but the live function does not branch on propertyType — **code wins**.
6. **EN meta `<title>` uses the fuller SEO name "Trenchless Drilling & Directional Boring"** (per the brief's "full SEO name" for title/meta); every display surface uses "Trenchless & Directional Boring." ES title = the locked ES label (no "Drilling" equivalent added).
7. **Legal prose + portfolio-automation keyword table** were updated for accuracy/completeness even though the brief didn't name them — the QA-2 sweep flagged them as places the four siblings were enumerated.

---

## 6. Erick-confirms (safe general statements written; confirm specifics)

These were written as honest, general statements; confirm and tighten if desired:

1. **Which of the 6 services Sunset self-performs vs. subcontracts** (esp. missile boring and HDPE fusing) — copy never claims owned equipment or in-house-only.
2. **Equipment ownership** — "a pneumatic piercing tool / the mole" is described as the *method*; no claim Sunset owns specific named/branded equipment.
3. **Any trenchless-specific warranty** — none asserted (process step 4 ends at restoration + photo-log walkthrough, no warranty promise). Add one if it exists.
4. **Licensing/insurance for underground utility / excavation work specifically** — copy uses the sitewide "licensed & insured" line; confirm it covers this trade.
5. **Spanish term choices** — "topo neumático" (missile boring) and "termofusión a tope / electrofusión" are accurate but flagged for native review (see TRANSLATION_NOTES §M.01f1).
6. **Project examples** are honest placeholders (DuPage city + year only, no named jobs/addresses). Swap to real representative jobs when available.

---

## 7. Image-bridge note

**Every trenchless image is a temporary bridge** pending real trenchless photography (BG-01 §9.3). The division hero + project tiles alias the existing **commercial** audience assets via `DIVISION_META`; each service aliases its `imageKey`/project `imageKey` to the closest existing service asset (driveways, retaining-walls, property-enhancement, sprinkler-systems). Alt text is generic and location-true ("Underground utility installation on a DuPage County property…") — it never claims a photo shows a specific trenchless job. **Replacement target:** the next M.01-style photo phase swaps these by editing `imageMap.ts` / `DIVISION_META` only, no consumer changes.

---

## 8. Doc-sync flag

`Sunset-Services-Plan.md` and `A-00 … Brand_Identity_Guide_BG-01.docx` do **not** yet describe the trenchless division (the same documentation gap waterproofing carries per B-09 §7). This is a separate doc-sync task — **not done here** by scope.

---

## 9. Operator follow-ups

1. **Sanity Studio re-deploy** (`npm run studio:deploy`) to publish the new `trenchless` option on the `quoteLead`, `quoteLeadPartial`, and `contactSubmission` schemas so new leads/contacts can be tagged trenchless in the Studio. (Schema source is committed; the deploy is the operator step.)
2. **Service-page FAQ content (Sanity):** trenchless service pages emit `BreadcrumbList` + `Service` schema today. `FAQPage` schema (and the rendered FAQ section) appears automatically once Sanity FAQ docs are added under scope `service:trenchless:<slug>` — same Sanity-driven mechanism as every other service. Requires a Sanity write token (out of scope here). The **division landing** already has its own 5 FAQ items (i18n), matching the siblings.
3. No `quoteLead` audience→division migration needed (trenchless is additive; no legacy values to migrate).
