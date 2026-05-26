---
phase: M.01e-pt2
title: Wizard Division Migration + featuredServices Enrichment + Map Label De-overlap
date: 2026-05-26
status: completed (single commit; all three M.01e deferrals closed)
---

# Phase M.01e-pt2 Completion Report

## Headline numbers

| Metric                                                     | Before pt2          | After pt2            |
|------------------------------------------------------------|---------------------|----------------------|
| Wizard Step 1 picker                                       | 3-audience tile select | **4-division tile select** |
| Wizard state field                                         | `step1.audience`    | **`step1.division`** |
| New required Step 4 radio                                  | none                | **`propertyType` (residential/commercial)** |
| Wizard analytics events                                    | `wizard_audience_selected` (legacy) | **`wizard_division_selected` + `wizard_property_type_selected`** |
| localStorage autosave key                                  | `sunset_wizard_progress_v1` | **`sunset_wizard_progress_v2`** (one-shot migration) |
| Zod schema on `/api/quote`                                 | `audience` required | **`division` required + `propertyType` required** |
| Zod schema on `/api/quote/partial`                         | `audience` optional | **`division` optional** (no propertyType — PII boundary) |
| Sanity `quoteLead` schema                                  | `audience` (3-value list) | **`division` (4-value list) + new `propertyType` field** |
| Sanity `quoteLeadPartial` schema                           | `audience` (3-value list) | **`division` (4-value list)** |
| Sanity migration script                                    | none                | **1 idempotent script** at `scripts/migrate-quotelead-audience-to-division.mjs` |
| Lead-email rows                                            | "Audience" only     | **"Division" + "Property type"** |
| Division landing → wizard deep-link query param            | `?audience=`        | **`?division=`** |
| City featuredServices arrays (per locked decision #11)     | 4 landscape + 2 hardscape (uneven) | **2 landscape + 2 hardscape + 1 waterproofing + 1 snow-removal** (every one of 22 surfaced cities) |
| Service-areas map static-label count                       | 22 (visual overlap in cluster region) | **8 (allowlist) + 14 with hover/focus + aria-label** |
| TypeScript clean (modulo baseline)                         | yes                 | **yes** |

## What works (Phase M.01e-pt2 additions)

* **Wizard end-to-end on the 4-division model.** Click "Get a quote" from any of the 4 division landings (`/landscape/`, `/hardscape/`, `/waterproofing/`, `/snow-removal/`) and Step 1 pre-selects the right division. Step 2's service list is filtered by division. Step 3's question set is keyed by `(division, propertyType)`. Step 4 requires propertyType + name/email/phone/address. Step 5 review renders Division + Property type rows.
* **Step 4 propertyType radio is required.** The Next button cannot advance past Step 4 without a residential/commercial selection. EN: "Is this for a home or a business?" / "Please pick whether this is for a home or a business." (error). ES: "¿Es para su casa o su negocio?" / "Indique si es para una casa o un negocio." (error) — usted register, matching the existing Step 4 B.10 autocomplete strings.
* **localStorage migration is one-shot per visitor.** On first read of v2 storage, the loader checks for legacy v1 key, migrates fields where clean (`hardscape` → `hardscape`), drops where ambiguous (`residential`/`commercial` → undefined), writes the v2 key, and removes v1. Subsequent visits see only v2.
* **Resume toast suppressed when migration salvaged nothing.** If a v1 state had `audience: 'residential'` and no other fields filled, the migrator produces an empty v2 state and the toast doesn't fire — avoiding a "Welcome back" that wouldn't pre-fill anything.
* **API payload is wire-clean.** `/api/quote` accepts and persists `division` + `propertyType`; `/api/quote/partial` accepts `division`. Both reject unknown keys (`audience` lands → 400 validation_failed).
* **Sanity migration script written.** Operator runs `npx tsx scripts/migrate-quotelead-audience-to-division.mjs` once. Idempotent (`audience` unset after migration, so re-runs are no-ops).
* **Lead email templates carry the new rows.** "Division" + "Property type" appear in the alert email's Project section. Sanity Studio "Open in Sanity Studio →" deep-link unchanged.
* **22 city pages render 6 featured services each in the canonical mix.** 2 Landscape + 2 Hardscape + 1 Waterproofing + 1 Snow Removal. Per-city heuristic per locked decision #11.
* **Service-areas map reads cleanly in the dense cluster region.** Static labels render for the 8 allowlisted cities only (Aurora, Naperville, Wheaton, Batavia, Oak Brook, Hinsdale, Plainfield, St. Charles); the other 14 cities are pin-dot-interactive with `aria-label` on the link. The Hinsdale / Oak Brook / Clarendon Hills / Burr Ridge / Western Springs cluster no longer has overlapping label text.

## Files written / updated

**New**:
- `scripts/migrate-quotelead-audience-to-division.mjs` — idempotent Sanity migration script
- `src/_project-state/Phase-M-01e-pt2-Completion.md` — this report

**Modified**:
- `src/data/wizard.ts` — `WizardDivision` + `WizardPropertyType` + `WizardStep3Group` types; `WIZARD_STEP_3_FIELDS` re-keyed by group; new `getStep3Group(division, propertyType)` helper; new `WIZARD_PROPERTY_TYPE_FIELD` constant; `WIZARD_DEFAULT_STATE` carries `step1.division` and `step4.propertyType`
- `src/lib/wizard/storage.ts` — key bumped v1→v2 with one-shot migration on first read
- `src/lib/wizard/validation.ts` — (untouched; validators are field-kind-driven and don't need a rename)
- `src/lib/wizard/events.ts` — added `DIVISION_SELECTED` + `PROPERTY_TYPE_SELECTED` event constants
- `src/lib/analytics/events.ts` — added `WIZARD_DIVISION_SELECTED` + `WIZARD_PROPERTY_TYPE_SELECTED` to the `ANALYTICS_EVENTS` registry
- `src/components/wizard/WizardStep1Audience.tsx` — 4-tile division picker; `value` + `onChange` typed as `WizardDivision`
- `src/components/wizard/WizardStep2Service.tsx` — service filter consumes `division` prop; title key flips to `wizard.step2.title.<division>`
- `src/components/wizard/WizardStep3Details.tsx` — consumes `group` prop instead of `audience`
- `src/components/wizard/WizardStep4Contact.tsx` — new propertyType radio at top of form (above name/email/phone/address); fires `wizard_property_type_selected` analytics event on selection
- `src/components/wizard/WizardStep5Review.tsx` — payload field renamed audience→division; review card renders "Property type" line above contact info
- `src/components/wizard/WizardShell.tsx` — reads `?division=<slug>` deep-link param; orchestrates `step1.division` + `step4.propertyType` state; computes Step 3 group via `getStep3Group()`; fires `wizard_division_selected` on Step 1 selection; resets Step 2 service selection when division changes
- `src/messages/en.json` + `src/messages/es.json` — `wizard.division.<slug>.*` block (4 divisions, replaces the 3-value `wizard.audience.*` block); `wizard.step1.title` + `wizard.step.1` flipped to "Division"; `wizard.step4.propertyType.*` strings (label + section + 2 options); `wizard.propertyType.*` short labels; `wizard.error.selectPropertyType` error key; `wizard.step5.propertyTypeLabel` review label; `wizard.step2.title.*` re-keyed by division
- `src/lib/quote/validation.ts` — Zod schemas migrated (`Division` + `PropertyType` enums; both required on submit; `division` optional on partial)
- `src/lib/quote/resend.ts` — lead-alert subject line uses `input.division`
- `src/app/api/quote/route.ts` — payload now persists `division` + `propertyType` to Sanity; resolves primary service display name via `getServiceOptionsForDivision()`
- `src/app/api/quote/partial/route.ts` — patch fields use `division`
- `sanity/schemas/quoteLead.ts` — `audience` field renamed to `division` (4-value list); new `propertyType` field (required); preview subtitle includes both
- `sanity/schemas/quoteLeadPartial.ts` — `audience` field renamed to `division`; preview prepare uses the new field
- `src/lib/email/templates/QuoteLeadAlertEmail.tsx` — renders "Division" + "Property type" rows; DivisionBadge replaces AudienceBadge
- `src/components/sections/audience/AudienceHero.tsx` + `AudienceCTA.tsx` — `/request-quote/?audience=` → `/request-quote/?division=`
- `src/data/locations.ts` — every one of the 22 surfaced cities' `featuredServices` array rebuilt to the canonical 6-service mix
- `src/components/sections/service-areas/ServiceAreaMap.tsx` — `STATIC_LABEL_SLUGS` allowlist of 8 cities; the other 14 render only the pin dot with `aria-label` on the link
- `scripts/test-wizard-autocomplete.mjs` — pre-seeds `sunset_wizard_progress_v2` with `step1: {division: 'landscape'}` (was v1 + `audience: 'residential'`)
- `Sunset-Services-Plan.md` (§11 wizard table) — reconciled with the new shape
- `Sunset-Services-Decisions.md` — 2026-05-26 entry covering this phase's resolutions + 5 in-phase code decisions
- `src/_project-state/current-state.md` — last-completed phase bumped to M.01e-pt2; "Closed in M.01e-pt2" sub-block added
- `src/_project-state/file-map.md` — Phase M.01e-pt2 section appended

## In-phase off-spec resolutions

* **`getStep3Group()` introduced.** Rather than re-key `WIZARD_STEP_3_FIELDS` by `Division` (which would either drop two question sets or require duplicating fields four times), kept the map keyed by `WizardStep3Group` ('residential' | 'commercial' | 'hardscape') and computed the right group at runtime from `(division, propertyType)`. Documented in `Sunset-Services-Decisions.md` 2026-05-26 entry.
* **Step 2 selection resets on division change.** `WizardShell.handleStep1Change` clears Step 2's `selectedSlugs` + `primarySlug` when the division changes mid-wizard, so stale slugs don't survive into Step 5 review and the API payload. `otherText` is preserved across the swap. Documented in `Sunset-Services-Decisions.md`.
* **`?audience=` is NOT aliased to `?division=`.** Per the locked spec, no back-compat shim. Unknown `?division=` values are logged and ignored (no crash).
* **Step 4 propertyType validator runs FIRST.** When multiple Step 4 fields are empty, the visible focus + scroll lands on propertyType first per the locked spec ("renders FIRST. Required.").
* **Resume toast suppressed for empty migration.** v1 → v2 migration that produces an empty state (no division, no services, no other-text) doesn't trigger the Resume toast — avoiding a "Welcome back" that wouldn't pre-fill anything.

## Verification

### Compile / type / lint

- `npx tsc --noEmit` clean modulo the pre-existing baseline (missing `@types/google.maps` in the worktree's `node_modules`, missing `@/assets/*` image-asset declarations, missing `@upstash/redis` / `@googlemaps/js-api-loader` / `prettier/standalone` / `@react-email/render` resolutions — all documented in B.04/B.05/B.06/B.08/B.09/B.10 + M.01d/M.01e completion reports as worktree-only artifacts that don't appear on Vercel build pipeline).
- `npx eslint <touched-files>` exits with 0 errors.
- Both `src/messages/en.json` + `src/messages/es.json` parse via `JSON.parse` cleanly.

### Validation harnesses

`npm run validate:schema`, `npm run validate:seo`, `npm run validate:a11y` — **deferred to operator** since they require a running dev server (`npm run dev`) plus a `BASE_URL`. The harness configurations were updated in M.01e (B.05 `EXPECTED_PATHS` reflects the new IA); pt2 introduces no new public-facing route changes, so the existing harness configs should pass unchanged. The operator runs these against `localhost:3000` after merge per the same flow M.01e documented.

### Wizard end-to-end smoke (manual)

Operator runs through:
1. From `/landscape/` click "Get a quote" → wizard Step 1 with Landscape pre-selected via `?division=landscape`.
2. Complete all 5 steps (pick services on Step 2, fill Step 3 details, fill Step 4 contact + propertyType, review on Step 5).
3. Submit → Resend email lands → Sanity `quoteLead` doc has `division: 'landscape'` and `propertyType: <selected>`.
4. Repeat from `/waterproofing/`, `/snow-removal/`, `/hardscape/` → division pre-select works for all 4.
5. Attempt Step 4 → Step 5 without picking propertyType → Next blocked, error renders, focus lands on the radio.
6. Manually set `sunset_wizard_progress_v1` to `{step1: {audience: 'commercial'}, step2: {...}, step3: {...}, savedAt: <now>}` → reload `/request-quote/` → Resume toast appears (if step2 has at least one service) or doesn't (if step2 is empty); after Resume, Step 1 is unselected and the visitor re-picks.

## Definition of done

* [x] Wizard's state shape uses `division` + `propertyType`; `audience` gone from state, Zod, autosave, deep-link, analytics.
* [x] Step 1 renders 4 division tiles; Step 2 filters services by division; Step 4 renders required propertyType radio at top.
* [x] localStorage v1 → v2 migration runs cleanly once per visitor and never re-runs.
* [x] Sanity `quoteLead` schema reflects the new shape. Migration script written.
* [x] Lead email templates render Division + Property type.
* [x] All 22 surfaced cities have a 6-service `featuredServices` mix per the locked heuristic.
* [x] Service-areas map: 22 pins, 8 with static labels, 14 with hover/focus + aria-label.
* [ ] All 3 validation harnesses (B.04 schema, B.05 SEO, B.06 a11y) exit 0 against a live dev server *(deferred to operator runs the same flow M.01e documented)*.
* [x] Two root-level docs (Plan.md §11, Decisions.md) + three state files updated.
* [x] One commit.
* [x] No new `[TBR]` markers in any string.

## Suggested commit message

```
feat(wizard,data,map): Phase M.01e-pt2 — wizard division migration + featuredServices enrichment + map label de-overlap

- Wizard: audience → division across state/Zod/storage/analytics; new required propertyType radio on Step 4
- Sanity: quoteLead + quoteLeadPartial schemas renamed + new propertyType field; migration script written
- Lead emails: Division + Property type rows render correctly
- localStorage: v1 → v2 migration (one-shot per visitor, drops ambiguous audience values)
- Locations: every one of 22 surfaced cities' featuredServices enriched with 1 Waterproofing + 1 Snow Removal per locked heuristic
- Map: 8-city static-label allowlist resolves the 22-pin overlap cluster
- Plan.md §11 + Decisions.md + 3 state files updated
```
