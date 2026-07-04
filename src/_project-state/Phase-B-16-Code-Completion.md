# Phase B-16 · Code — Completion Report

**Phase:** B-16 · Code — Wire the B-16 stock-bridge images into the flagged pages + fix the division-landing hero clipping
**Date:** 2026-07-04
**Branch:** built + verified on `feat/b16-code-images-hero-fix` (off `main`, post-B-16-Cowork merge), then **merged to `main` + pushed per Goran's integration call** (mid-phase Chat instruction "push to main" — the B-15 precedent; see §4)
**Author:** Code

---

## 1. What shipped

**12 of the 14 sourced B-16 images integrated** (the brief's nominal 15 was already 14 after the cowork `sump-pumps` GAP; Code verification rejected 2 more — see §4):

- **11 service pages** got a hero (16:9 2400×1350, < 400 KB) + tile (4:3 1200×900) pair:
  - Hardscape (overwritten in place, originals preserved): `retaining-walls`, `fire-pits-features`, `driveways`, `outdoor-kitchens`
  - Waterproofing (new slug-keyed derivatives, placeholder aliases dropped): `basement-waterproofing`, `window-wells`, `crawl-spaces`, `concrete-raising`, `humidity-control`, `radon-mitigation`
  - Trenchless: `pipe-fusing`
- **1 division landing**: `/waterproofing/` → `src/assets/division/hero-waterproofing.jpg` (hero-only, `heroOut`/`heroOnly`, B-15 pattern), wired via `DIVISION_HERO`; `division.waterproofing.hero.alt` replaced in `messages/{en,es}.json`.
- All 11 wired services carry `photoAlt: {en, es}` — EN verbatim from the manifest, ES drafted (TRANSLATION_NOTES §B.16, pending native review).
- **Legacy preservation:** `src/assets/service/legacy/{hero-*,tiles/*}` holds the 4+4 pre-B-16 hardscape derivatives; every non-service consumer repointed there — `LOCATION_HERO`/`LOCATION_CARD` for oak-brook, clarendon-hills, burr-ridge, lombard, plainfield, yorkville; `PROJECT_LEAD` for naperville-fire-court, aurora-driveway-apron, lisle-retaining-wall; **the homepage trenchless card** (`HomeAudienceEntries.tsx` direct import — found in recon, missed by planning); **missile-boring's `imageKey: 'driveways'` alias** (also found in recon) → new `legacy-driveways` key.
- **AudienceHero clipping fix (all 5 division landings):** `sm:min-h-0 sm:h-[max(50vh,420px)] lg:h-[max(60vh,480px)]` → `sm:min-h-[max(50vh,420px)] lg:min-h-[max(60vh,480px)]`; inline `maxHeight: '720px'` removed (charcoal `backgroundColor` fallback kept); `overflow-hidden`, image layer, gradients, LCP discipline unchanged. Kicker gained the M.10f text-shadow (`0 1px 2px rgba(0,0,0,0.62), 0 2px 10px rgba(0,0,0,0.45)`) at all breakpoints.
- `scripts/optimize-stock-bridge.mjs` `ITEMS` += 12 entries (11 services + 1 hero-only division landing); header docs updated.
- Docs: decisions log (plan-of-record + outcome), manifest change-log entry (append-only), TRANSLATION_NOTES §B.16, current-state.md, file-map.md, this report.

## 2. The two rejected images (flagged for Chat — the headline finding)

Both passed cowork QA but **failed Code-phase verification** with readable, geolocating text — the plan-of-record's never-acceptable class ("visible brand logos/readable plates"; B-15 precedent: the "GENGRAS" decal and "reads European" truck rejections). At the 3464–4240 px source frame the text is small; the 2400×1350 hero crop + desktop render restores it to plainly legible.

1. **`/trenchless/` division-landing hero** (`stock-trenchless-division-landing-hero-01.jpg`): the back-turned worker's red shirt reads **"BARANGAY AYALA ALABANG / FIBER OPTIC PROJECT"** in large white print — geolocates the scene to the Philippines; a second worker's face is turned toward the camera.
2. **`handhole-pull-box`** (`stock-trenchless-handhole-pull-box-hero-01.jpg`): three legible **Russian** signs — "О ПОЖАРЕ ЗВОНИТЬ **101, 112**" (Russian emergency numbers), a red "ПГ" hydrant marker, and a "ВЕДЕТСЯ ВИДЕОНАБЛЮДЕНИЕ" surveillance plaque.

**Handling (GAP-pattern, like sump-pumps; surfaced, not self-ratified):** `handhole-pull-box` keeps its `property-enhancement` placeholder alias and name-fallback alt; `/trenchless/` keeps its audience-alias hero and previous alt in both locales. The two derivatives were deleted and their optimizer entries removed; the source photos remain archived in `docs/stock-bridge/trenchless/` with their manifest rows. **Wiring either back if Chat overrules is ~3 lines + 1 optimizer entry.** Re-sourcing replacements is a Cowork task.

## 3. Definition of Done — evidence per item

- [x] **Wired pages render the new image with manifest-accurate alt (EN + ES).** 13 wired route-pairs (11 services + `/waterproofing` landing + `/trenchless` landing negative-check) × EN/ES verified in **live DOM** (Playwright: exact-string alt + media-src match) **and prerendered HTML** (24 fragments present; the 2 rejected alts + both rejected asset filenames confirmed **absent**). ⚠ Deviation from the brief's "15 pages": sump-pumps (cowork GAP) + the 2 rejected images (§2) = **12 pages with new imagery**.
- [x] **All 5 division landings show full hero content, unclipped, EN + ES, all 6 viewports (incl. 1280×620).** 5 × 2 × 6 = 60 combos: breadcrumb, kicker, H1, subhead, both CTAs each fully inside the hero section box, ≥ 8 px breathing room below the CTA row, no horizontal page overflow — **60/60 PASS**.
- [x] **AudienceHero uses `sm:`/`lg:` min-heights, no 720px cap, kicker has the M.10f shadow.** See the diff; doc-comment updated to match.
- [x] **Optimizer extended, run, idempotent; derivatives at spec; prior derivatives untouched.** Immediate re-run → byte-identical (md5 diff empty). 12 heroes 2400×1350 (145–375 KB, all < 400 KB: 11 service + 1 division), 11 tiles 1200×900; all confirmed by sharp metadata. Full-tree md5 diff vs the pre-phase baseline shows exactly: 8 hardscape overwrites + 23 new files (7 gap-service heroes + 7 gap-service tiles + 1 division hero + 8 legacy copies) — **every B-14/B-15 derivative, brand PNG, and other asset md5-identical**.
- [x] **Gap services resolve by slug; wired services carry `photoAlt {en,es}`; nested project `imageKey`s untouched.** `grep '^    imageKey:' services.ts` → exactly `sump-pumps: 'sprinkler-systems'` (kept, GAP) + `missile-boring: 'legacy-driveways'` (repoint). All 16 nested featured-project `imageKey` references to `{retaining-walls,fire-pits-features,driveways,outdoor-kitchens}-{1,2}` intact.
- [x] **`DIVISION_HERO` += waterproofing; division alt keys in both locales; EN/ES leaf parity.** Parity **1406 = 1406** (keys pre-existed; values replaced). ⚠ `trenchless` deliberately NOT added (§2).
- [x] **Every non-service consumer byte-identical (md5/hash proof) — zero stock on city/project/featured/homepage surfaces.** Legacy files md5-match the pre-phase baselines exactly. Rendered-DOM proof: the 6 city heroes/cards resolve to legacy media hashes ≠ the stock hashes; missile-boring + the homepage trenchless card resolve to the same legacy `hero-driveways` hash; a stock-hash sweep of `/projects` + 3 Sanity project detail pages + `/es/projects` found **zero stock media**. (The 3 placeholder project slugs the brief lists no longer render anywhere — `/projects` is Sanity-driven; their `PROJECT_LEAD` repoints are defensive.)
- [x] **`missile-boring` page untouched** — renders the exact pre-B-16 image via `legacy-driveways` (hash-verified) with unchanged alt.
- [x] **Harnesses pass.** Clean `npm run build` exit 0, **202/202** prerendered, 0 TS errors · `lint` **0 errors** (9 pre-existing warnings) · `tsc --noEmit` **0** · `validate:mobile` **0 errors** · `validate:links` **0 hard failures (0 broken / 0 error, 294 pages crawled)** · `validate:seo` **0/0 (196 URLs + sitemap + robots)** · `validate:schema` **0/0 (24 URLs)** · `test:consent` **23/23**. ⚠ `validate:a11y` was **still mid-run at push time — Goran explicitly instructed "just push to main now" without waiting**; the run continued locally and its result is reported in Chat (low risk: the phase adds descriptive alts, a min-height change, and a text-shadow — no color/contrast/structure changes; the identically-shaped B-15 change passed 0/0).
- [x] **Docs updated.** Decisions log (open + outcome), manifest change-log (append-only), TRANSLATION_NOTES §B.16, current-state.md, file-map.md, this report.
- [x] **Integration.** The plan-of-record said "pushed, not merged — Goran verifies on Preview." Mid-phase, after the interim verification summary (which included the two image rejections), **Goran instructed "push to main"** — so, matching the B-15 precedent, the branch was fast-forwarded into `main` and pushed after all harnesses passed. Goran can still review the two flagged rejections + kicker items on production/`main` and open follow-ups.

## 4. Own decisions / notes surfaced (never self-ratified)

- **Rejected the 2 defective images instead of wiring + flagging** (§2). The binding accuracy rule ("an inaccurate photo is worse than none") + the never-acceptable readable-text rule outweigh the locked wiring plan; the conservative default costs one Preview round-trip to overrule, the alternative risks launching Philippine/Russian signage.
- **`missile-boring` recon catch:** its `imageKey: 'driveways'` alias (missed in planning) would have silently put the stock paver-driveway photo on the diagram-track page. Repointed via a `legacy-driveways` map key — page byte-identical.
- **Homepage recon catch:** `HomeAudienceEntries.tsx` imports `hero-driveways.jpg` directly for the trenchless division card (missed in planning). Repointed to the legacy copy — homepage byte-identical.
- **Kicker legibility (Decision-7 bounded check, flagged for Chat):** with the M.10f shadow applied, waterproofing / hardscape / trenchless read fine over their final images; **snow-removal still reads poorly** (dark-green accent over the photo's dark-foliage band — a dark halo can't fix dark-on-dark); **landscape is the weakest pass** (dark-green accent over bright-green shrubs). No further improvisation per the locked decision. Likely Chat-side fix: lighter per-division kicker accent on imagery, or a localized scrim.
- **Placeholder project pages are retired:** `naperville-fire-court` / `aurora-driveway-apron` / `lisle-retaining-wall` 404 (the `/projects` surface is Sanity-driven since B-11/M-10g). The brief's byte-identical requirement for those rows is satisfied defensively (repointed aliases + md5-identical legacy files) and vacuously (no rendered surface).
- **`legacy/tiles/outdoor-kitchens.jpg`** is preserved on disk per the locked decision but has no consumer, so it is deliberately not imported (would be an unused-import lint error; unreferenced assets aren't bundled).
- **Integration call (Goran, mid-phase).** The brief locked "do not merge — Goran verifies on Vercel Preview, then merges." After the interim verification summary (incl. the two rejections), Goran instructed **"push to main"** in Chat. Resolved exactly like B-15: all harnesses green first, then the branch fast-forwarded into `main` and pushed. Not self-ratified — executed on the operator's explicit instruction.

## 5. Changed files

- `Sunset-Services-Decisions.md` — plan-of-record (commit 1) + outcome entry
- `scripts/optimize-stock-bridge.mjs` — ITEMS += 12; docs
- `src/assets/service/hero-{retaining-walls,fire-pits-features,driveways,outdoor-kitchens}.jpg` + `tiles/{same}.jpg` — overwritten (stock)
- `src/assets/service/hero-{basement-waterproofing,window-wells,crawl-spaces,concrete-raising,humidity-control,radon-mitigation,pipe-fusing}.jpg` + `tiles/{same}.jpg` — new
- `src/assets/service/legacy/**` — new (4 heroes + 4 tiles, byte-identical originals)
- `src/assets/division/hero-waterproofing.jpg` — new
- `src/data/imageMap.ts` — legacy imports + repoints; 7+7 slug entries; `legacy-driveways`; `DIVISION_HERO.waterproofing`
- `src/data/services.ts` — 7 aliases dropped; 11 `photoAlt` blocks; missile-boring alias → `legacy-driveways`; handhole comment
- `src/components/sections/audience/AudienceHero.tsx` — min-height fix + kicker shadow + doc-comment
- `src/components/sections/home/HomeAudienceEntries.tsx` — trenchless-card import → legacy
- `src/messages/{en,es}.json` — `division.waterproofing.hero.alt` replaced (trenchless restored to previous value)
- `Sunset-Services-TRANSLATION_NOTES.md` — §B.16
- `docs/stock-bridge/stock-image-manifest.md` — change-log entry (append-only)
- `src/_project-state/{current-state.md,file-map.md,Phase-B-16-Code-Completion.md}`

**Branch:** `feat/b16-code-images-hero-fix` → fast-forwarded into `main` + pushed (Goran's call). Vercel deploys `main` to production; the branch push also generates a Preview URL in the Vercel dashboard if a side-by-side check is wanted.

## 6. State-sync confirmation

`current-state.md` (new top entry + B-16 Cowork entry), `file-map.md` (imageMap / assets / legacy / division / optimizer / AudienceHero / HomeAudienceEntries bullets) synced to reality in this branch. Decisions log carries both the plan-of-record and the outcome entry. Manifest change-log appended without editing cowork tables.

## 7. Risks / follow-ups (for Chat)

1. **Re-source or re-plan the 2 rejected trenchless images** (`/trenchless/` landing hero + `handhole-pull-box`) — the pages are presentable on their previous imagery, but the operator flagged them originally. Cowork QA should include a **crop-scale readable-text check** (zoom to the 2400-px hero frame) — both defects were invisible at full-frame review scale.
2. **`sump-pumps`** remains the documented cowork GAP (unchanged by this phase).
3. **Kicker legibility on `/snow-removal/`** (poor) and `/landscape/` (weak) — see §4.
4. Replace-by **2026-10-01** now covers 12 more stock assets (manifest).
5. ES `photoAlt` drafts + the two division-alt values await native review (§B.16).
