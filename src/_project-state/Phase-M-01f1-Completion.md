# Phase M.01f1 — Completion Report

**Phase:** M.01f1 — Spanish first-pass polish for all M.01d/e/e-pt2 content
**Role:** Cowork
**Date:** 2026-05-26
**Bucket:** M (Make-it-work)

## One-line outcome

Ran a focused glossary + register + tone consistency pass over every Spanish string first-passed by Code across M.01d / M.01e / M.01e-pt2, locked the canonical project glossary in `Sunset-Services-TRANSLATION_NOTES.md`, and left the Spanish surface coherent and consistent for Erick's native review in M.03. No EN content touched. No code logic changed — only string values.

## Headline numbers

- **Surfaces reviewed:** `src/data/divisions.ts` (no ES strings — copy lives in es.json), `src/data/services.ts` (14 new services), `src/data/locations.ts` (18 new cities), `src/messages/es.json` (qa, home.divisions, division, nav, footer, wizard, serviceAreas namespaces), `src/lib/email/templates/QuoteLeadAlertEmail.tsx`, and the 32 Sanity FAQ docs via their ES source in `scripts/migrate-faq-to-divisions.mjs`.
- **Edits applied:**
  - `services.ts`: 4 service-name glossary fixes (crawl-spaces -> "Espacios Bajo el Piso"; concrete-raising -> "Nivelación de Concreto"; sidewalk-shoveling -> "Limpieza de Aceras"; commercial-snow-plowing -> "Remoción Comercial de Nieve"), each on the name + hero h1; plus 6 "Presupuesto" -> "Estimado" alignments in estimate-context process/pricing steps. (14 changed strings, 28 diff lines.)
  - `es.json`: 4 nav mega-panel labels realigned to the renamed services (crawlSpaces, concreteRaising, sidewalk, commercial). The only es.json edits required.
  - `migrate-faq-to-divisions.mjs`: 3 fixes — 1 `tú`->`usted` leak ("si quieres" -> "si desea"), 2 "el pueblo" -> "el municipio" (governmental sense).
  - `Sunset-Services-TRANSLATION_NOTES.md`: appended the full canonical M.01f1 glossary + register matrix (10 sections).
  - `.gitattributes`: created (LF normalization — see line-ending note below).
- **Glossary terms locked:** 4 division names, 28 service names, 14 common terms, brand/proper-noun list, tone guidance. All in TRANSLATION_NOTES §M.01f1.
- **Files with NO edits needed (verified clean):** `divisions.ts` (no ES strings), `locations.ts` (18 cities — `tú` correct, glossary consistent, no template-twins, city-specific landmarks present), `qa.*` (usted, zero tú-leak), `division.*` (tú, zero usted-leak), `QuoteLeadAlertEmail.tsx` (EN-only by the Phase 2.08/2.09 convention — no ES surface).

## Definition-of-Done check

- [x] `TRANSLATION_NOTES.md` exists with all 10 M.01f1 sections.
- [x] divisions.ts reviewed (no ES strings; division copy is in es.json `division.*`, reviewed there — tú, glossary-locked).
- [x] 14 new services reviewed — tú register, glossary-locked names, "estimado" aligned, plain-spoken.
- [x] 18 new cities reviewed — tú, city-specific `whyLocal`, no template-twins, meta under 160 chars.
- [x] es.json new namespaces reviewed; register matches the matrix; JSON parses cleanly via Node.
- [x] 32 FAQ docs reviewed via their ES source in the migration script; register fixed to usted. (Publish step = operator re-runs the script; see below.)
- [x] Email template Division/Property-type labels verified (EN-only by convention; renders correctly).
- [x] Glossary consistency sweep — 0 lingering old names; locked names consistent across surfaces.
- [x] Register sweep — usted surfaces 0 tú-leak; tú surfaces 0 usted-leak.
- [x] No new `[TBR]` markers.
- [x] No EN content modified (no awkward EN flagged — no EN-Notes sidecar created).
- [x] Completion report (this file).
- [x] state docs + Decisions updated.

## In-phase decisions (logged in TRANSLATION_NOTES §8/§9 too)

1. **driveway = "entradas", not the locked "cocheras".** The established site pervasively uses "entradas"/"Entradas de Auto". Per the boundary rule, new content conformed to "entradas" to avoid mid-site inconsistency. Flagged for Erick.
2. **estimate CTA = established "Presupuesto" left untouched; new content uses "estimado".** The live es.json CTAs say "Presupuesto Gratis" sitewide. New in-scope content (services.ts, locations.ts meta) consistently uses "estimado" per the lock. The sitewide reconciliation is an Erick decision.
3. **"Hardscape" kept in English** on division/nav/footer surfaces (established voice), not the locked "Pavimentos y construcción exterior". Flagged.
4. **Wizard register is mixed by design:** Step 1/2 + shared errors are established `tú`; the Step 4 propertyType block is `usted` (locked decision #4, matching the B.10 contact block). Left as-is, flagged.
5. **FAQ "Sanity docs" publish path:** the 32 FAQ docs' ES content is authored in `scripts/migrate-faq-to-divisions.mjs` (not editable from the Cowork sandbox, which has no Sanity network access). Polished there; operator re-runs the script to publish — `createOrReplace` makes it idempotent.

## Operator action required (to publish FAQ polish to Sanity)

The 3 FAQ Spanish fixes live in the migration script. To push them to the live Sanity dataset, run once from the project root (PowerShell), with `SANITY_API_WRITE_TOKEN` + `NEXT_PUBLIC_SANITY_*` set in `.env.local`:

    npx tsx scripts/migrate-faq-to-divisions.mjs

The script is idempotent (`createOrReplace` with deterministic `_id`s), so re-running only overwrites the affected docs with the polished Spanish.

## Repo-hygiene note (line endings)

On opening the working tree this phase found 271 files showing as modified purely due to a CRLF line-ending conversion (no content change) plus 8 trailing NUL bytes on `es.json` (which made it fail to parse). These were normalized back to LF, `es.json` repaired, and a `.gitattributes` (`* text=auto eol=lf`) added to prevent recurrence. Three unrelated files with genuine uncommitted edits — `ProjectGallery.tsx`, `RelatedProjects.tsx`, `ServiceAreaMap.tsx` — were left untouched per the operator's instruction.

## Verification

- `node -e "JSON.parse(es.json)"` -> OK.
- `node --check scripts/migrate-faq-to-divisions.mjs` -> OK.
- `services.ts` diff vs HEAD = 28 lines (the 14 intended edits) and 0 lingering old names.
- No NUL bytes in any edited file.
