# Phase Polish-01 · Code — Completion Report

**Phase:** Polish-01 — Homepage "What We Do" images · Request-Quote tile images · remove About "The Team" section (standalone polish batch, not a numbered B/M/P phase)
**Date:** 2026-07-04 · **Outcome (one line):** the homepage divisions section and the quote-wizard Step-1 tiles now show a correct, sharp image for every division in EN + ES, and the About page's placeholder-avatar "The Team" section is fully removed in both locales.
**Branch:** `polish/01-images-team-removal` (off fresh `main` @ `8ffc4de`) — **committed + pushed + PR opened; NOT merged. Goran reviews and merges.**
**Author:** Code

---

## 1. What shipped (plain language)

Visitors no longer see mismatched division photos: the homepage "Five divisions. One accountable crew." cards and the Request-a-Quote Step-1 tiles for **Waterproofing**, **Snow Removal**, and **Trenchless** now show images of the actual division's work instead of reused residential/commercial photos (the Snow Removal tile literally showed a summer screened porch; Waterproofing showed the same paver patio as Landscape). The About page no longer shows the "The people you'd be working with" section with EV / NV / M placeholder initial tiles — in English and Spanish.

## 2. Exact image wiring per card/tile (the heart of this phase)

All fixes are **wiring-only** — every image already existed in the repo; **zero new binaries** were added.

### Homepage — "Five divisions" section (`HomeAudienceEntries.tsx`)

The section is Sanity-first: a division card renders the newest Sanity project lead image for that division when one exists, else the bundled fallback. Only the fallbacks were touched.

| Card | Before (fallback) | After (fallback) | What renders live today |
|---|---|---|---|
| Landscape | `home/audience-residential.jpg` | **unchanged** | Sanity project photo (mulch-bed/tree planting) — correct |
| Hardscape | `home/audience-hardscape.jpg` | **unchanged** | Sanity project photo (paver walkway) — correct |
| Waterproofing | `home/audience-residential.jpg` (paver patio — wrong) | `division/hero-waterproofing.jpg` (dry finished basement, stock-bridge B-16) | the new fallback (no waterproofing Sanity projects exist) |
| Snow Removal | `home/audience-commercial.jpg` (summer screened porch — wrong) | `division/hero-snow-removal.jpg` (snow-covered residential street, stock-bridge B-15) | the new fallback |
| Trenchless | `service/legacy/hero-driveways.jpg` (real trenching dig) | **unchanged** (image already correct) | that real photo |

### Request-Quote wizard Step 1 (`WizardStep1Audience.tsx`)

Tiles previously aliased through `DIVISION_META.heroImageKey` to only 3 audience photos. The map is now keyed **per division** (`Record<WizardDivision, StaticImageData>`):

| Tile | Before | After |
|---|---|---|
| Landscape | `audience-residential.jpg` | **unchanged** |
| Hardscape | `audience-hardscape.jpg` | **unchanged** |
| Waterproofing | `audience-residential.jpg` (reused Residential — the pre-launch QA bug) | `division/hero-waterproofing.jpg` |
| Snow Removal | `audience-commercial.jpg` (screened porch) | `division/hero-snow-removal.jpg` |
| Trenchless | `audience-commercial.jpg` (screened porch, duplicated Snow) | `service/legacy/hero-driveways.jpg` (same real trenching photo as the homepage card) |

`DIVISION_META` itself is untouched (division landings still use it); the wizard just no longer routes photos through it.

### Alt text (EN + ES, all six changed keys accurate + generic-honest)

- `home.divisions.waterproofing.alt` + `wizard.division.waterproofing.alt` → the B-16 division-hero alt verbatim ("A clean, dry, well-lit finished basement…" / "Un sótano terminado, limpio, seco y bien iluminado…"). Stock image ⇒ generic, no Sunset/city implication.
- `home.divisions.snow-removal.alt` + `wizard.division.snow-removal.alt` → the B-15 division-hero alt verbatim ("A snow-covered suburban residential street…" / "Una calle residencial suburbana cubierta de nieve…"). Same stock-honesty rule.
- `home.divisions.trenchless.alt` + `wizard.division.trenchless.alt` → corrected to describe the actual photo ("An open trench excavation on a residential property with compaction equipment…"). The old text claimed "at golden hour" (the photo is overcast) — inaccurate flourish removed. This is a real Sunset photo, so no stock-honesty constraint applies, but the location mention was dropped too since the accurate description doesn't need it.

## 3. Definition of Done — evidence per item

- ✅ **`main` pulled fresh before work; work on a feature branch, not merged.** Branched `polish/01-images-team-removal` off `origin/main` @ `8ffc4de` after `git pull` ("Already up to date"). PR opened for Goran; no merge performed.
- ✅ **Typecheck + build pass with no new errors or warnings.** `npm run build` exit 0, all routes prerendered, zero error/warn lines in output (grep-verified).
- ✅ **Homepage: every division card correct + sharp, EN and ES.** Live-DOM check on `/` and `/es/`: all 5 `<img>`s report `complete && naturalWidth > 0`, each resolves to the file in the table above (Sanity CDN for landscape/hardscape; the three static assets for the rest), alts match the new strings in both locales. Screenshots taken of the section (EN) showing the basement + snowy-street + trench images rendering sharp.
- ✅ **Second homepage divisions section:** checked — **none renders.** The homepage has exactly one divisions grid (see §4 for the dead-code finding).
- ✅ **Wizard: every tile correct, EN and ES; Waterproofing no longer reuses Residential.** Live-DOM check on `/request-quote/` and `/es/request-quote/`: 5 tiles, 5 distinct correct files (table above), all loaded, alts correct per locale.
- ✅ **Alt text accurate, non-empty, localized; stock images generic.** Six keys updated in `en.json` + `es.json` (§2); both files parse; no empty alts on these surfaces.
- ✅ **About: team section gone in EN + ES; page flows; no orphans; schema handled.** Live-DOM check on `/about/` + `/es/about/`: no `about-team-h2` section, no "The team"/"El equipo" heading, page renders Hero → Story → Credentials → Projects → CTA with normal spacing (visually inspected — no gap/divider artifacts). JSON-LD on the page is now exactly `LocalBusiness+Organization` (sitewide `@graph`) + `BreadcrumbList` — **zero `Person` nodes**.
- ✅ **No broken image references.** Browser network log across all six visited pages: no 404s (only aborted Google-Analytics beacons during navigation, pre-existing behavior). Console: zero errors.
- ✅ **Grep confirms no remaining references.** `AboutTeam|TeamCard|InitialsAvatar|schema/person|buildPersonSchema|about.team` → zero hits in `src/` outside `_project-state` history docs.
- ✅ **No regression on the three surfaces.** All images serve through `next/image` (static imports with automatic `blurDataURL`, `placeholder="blur"` where the pattern uses it; Sanity-sourced cards keep `placeholder="empty"` as before). Visual pass done on all three pages in both locales.

## 4. Decisions I made during this phase (none self-ratified — all surfaced here)

1. **Waterproofing + Snow Removal re-pointed to their stock-bridge division heroes, not real Sunset photos — because no real Sunset photo exists for those divisions.** Locked Decision #1's first choice (real project photo) is impossible: waterproofing has zero real photography (that's why the B-16 stock bridge exists) and snow photography can't exist before the 2026–27 season (B-15's documented rationale). The fallback choice (existing stock-bridge image) was taken, using the exact assets the `/waterproofing/` and `/snow-removal/` landings already render. These carry the manifest replace-by dates (**2026-10-01** waterproofing / **2027-01-31** snow) — when the replacement phases run, these two surfaces must be included. *Alternative rejected:* the old `service/hero-snow-removal.jpg` "snow" asset is actually a mislabeled **summer landscaping photo** (tree in a mulch bed) — using it would have re-created the exact class of bug this phase fixes.
2. **The "second homepage divisions section" does not exist at runtime — it's dead code.** `HomeServicesOverview.tsx` (and `HomeAbout.tsx`) match the brief's description but have been orphaned since the M.16 homepage redesign: imported nowhere, never rendered (confirmed by grep + a live sweep of every homepage section). Per the brief I did **not** delete them — flagging instead: a future cleanup phase could remove both files + their `home.services`/`home.about` message keys, or Chat may want the section restored someday. No image fix applied to it (it renders nowhere to verify against).
3. **Trenchless wizard tile + both trenchless alts fixed as part of the "verify all five" audit.** The brief named Waterproofing/Snow as known offenders; the audit found the trenchless wizard tile equally wrong (screened porch) and the trenchless alt text inaccurate ("golden hour") on both surfaces. Fixed with the same wiring-only approach. *Alternative rejected:* leaving them because they weren't named — contradicts the audit instruction and the alt-accuracy rule.
4. **Landscape + Hardscape cards/tiles left unchanged, with two observations flagged.** (a) Their *fallback* images (`audience-residential/hardscape.jpg`) are real, sharp Sunset photos and the homepage cards currently render Sanity project photos anyway. (b) **Alt-drift observation:** the Landscape alt says "lush front yard… at golden hour" and the Hardscape alt says "seating wall and a stone fire feature at sunset" — neither perfectly describes what renders (the images are correct-division, the prose is aspirational). Out of scope here (those images were not fixed, and the homepage Sanity images change as projects publish); flagged for a future copy pass.
5. **`team.ts` kept (not deleted) — it has a second consumer.** The chat knowledge base (`src/lib/chat/knowledgeBase.ts`) builds its Team digest section from the `team` array with its own embedded bilingual labels/bios. Per the brief's rule ("if team data is referenced elsewhere, leave the data"), the file stays; its header comment was rewritten to document the new reality and the dead `photo` field (which existed only for the removed TeamCard) was trimmed.
6. **`TeamCard.tsx` + `InitialsAvatar.tsx` deleted along with `AboutTeam.tsx`.** Repo-wide grep shows their only consumers were the removed section (AboutTeam → TeamCard → InitialsAvatar). Zero build risk (build passes).
7. **`src/lib/schema/person.ts` deleted; `scripts/validate-schema.mjs` updated.** `buildPersonSchema` existed solely to describe the removed team cards, so the About page's `Person × 3` emission and the builder are both gone. The schema validator **required** `Person` on `/about/` — left as-was it would fail the next QA run, so `'Person'` was dropped from that page's `mustHaveTypes` (the generic `Person: ['name']` rules-table entry stays; it's type-validation infrastructure, not team-specific). Org-level identity is untouched: the sitewide `LocalBusiness` + `Organization` `@graph` never contained Person/founder nodes, and the founder/owner story (Nick Valle → Erick Valle) remains in the About brand-story copy and the chat knowledge base.
8. **`about.team.*` strings removed from both locales; EN/ES leaf parity preserved** (same block removed from each; both files parse).
9. **Pre-existing orphan assets left on disk, flagged:** `src/assets/about/team-{erick,nick,marcin}.jpg` were already unreferenced before this phase (the M.10 initials-avatar change dropped their imports) — they were generated placeholders from `scripts/gen-about-placeholders.mjs`, which still lists them. Deleting binaries wasn't required by this phase's scope, so they stay; a hygiene phase can remove the three files + the generator's team entries.
10. **About-page surface alternation now has one cream-cream seam, accepted as-is.** Removing the white Team section leaves Brand Story (cream) directly above Credentials (cream). Visually inspected: both sections carry their own generous padding and distinct eyebrow/heading rhythm, so there's no gap or broken-spacing artifact — but the strict §2.3 white/cream alternation lock is no longer literal. *Alternative rejected:* flipping AboutCredentials to white — that only moves the seam (Credentials-white would then abut the white Projects teaser) and restyles a section this phase wasn't asked to touch.

## 5. Deviations from the brief

- **"Fix the second homepage section's images" → not applicable** (§4.2 — the section doesn't render; nothing to fix; flagged, not deleted).
- Everything else executed as written. No copy, layout, or other sections touched beyond the three tasks.

## 6. Changed files / deliverables

**Edited:**
- `src/components/sections/home/HomeAudienceEntries.tsx` — waterproofing/snow fallback imports re-pointed; unused `audience-commercial` import dropped; comments updated
- `src/components/wizard/WizardStep1Audience.tsx` — `DIVISION_PHOTO` re-keyed per division; 3 tiles re-pointed; `DIVISION_META` import dropped; docs updated
- `src/messages/en.json` + `src/messages/es.json` — 6 alt keys updated (3 `home.divisions.*` + 3 `wizard.division.*`); `about.team` block removed
- `src/app/[locale]/about/page.tsx` — AboutTeam render + Person JSON-LD emission removed; doc-comment updated
- `src/data/team.ts` — header rewritten (chat-KB-only consumer); dead `photo` field removed
- `scripts/validate-schema.mjs` — `/about/` no longer requires `Person`
- `src/_project-state/{current-state.md,file-map.md,Phase-Polish-01-Completion.md}` + `Sunset-Services-Decisions.md`

**Deleted:**
- `src/components/sections/about/AboutTeam.tsx`
- `src/components/ui/TeamCard.tsx`
- `src/components/ui/InitialsAvatar.tsx`
- `src/lib/schema/person.ts`

**No files added** except this report. **No binaries added, changed, or deleted.**

**Branch / PR:** `polish/01-images-team-removal`, PR opened against `main` — awaiting Goran's review. **Not merged.**

## 7. State updates done

`current-state.md` (new top "Where we are" entry; stale `/about/` six-section + "Team cards show initial avatars" lines corrected) and `file-map.md` (deleted-file entries updated, team.ts/consumer notes corrected) synced in this branch. Decisions log carries the two required entries (team-section removal; wiring-only image fixes). This report filed at `src/_project-state/Phase-Polish-01-Completion.md`.

## 8. Risks, follow-ups, for the orchestrator

1. **Replacement-pass bookkeeping:** the homepage Waterproofing/Snow cards and the matching wizard tiles now render stock-bridge assets — add these two surfaces to the 2026-10-01 (waterproofing) and 2027-01-31 (snow) replacement checklists. (Because they reference the *same files* as the division landings, swapping the file swaps every surface at once; only the alts need a re-check.)
2. **Dead homepage sections:** `HomeServicesOverview.tsx` + `HomeAbout.tsx` + their message keys are orphaned code — decide keep-or-delete (§4.2).
3. **Pre-existing orphan team placeholder JPGs** in `src/assets/about/` + their generator entries (§4.9).
4. **Landscape/Hardscape alt-drift** on the homepage/wizard (aspirational prose vs. actual photos) — a candidate for the next copy pass (§4.4).
5. **If a Sanity project is ever published in the waterproofing or snow-removal division with a lead image, it will override the new fallbacks on the homepage cards** (by design — Sanity-first). The wizard tiles are static and unaffected.

## 9. What's now possible that wasn't before

Every division-selection surface a visitor meets (homepage showcase + quote wizard) shows the right work for the right division in both languages, and the About page no longer undercuts trust with placeholder avatars.
