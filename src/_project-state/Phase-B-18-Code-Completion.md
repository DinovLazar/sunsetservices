# Phase B.18 (Code) — Completion Report

**Portfolio: reusable project importer + first-project scaffolding**
Branch `phase/b18-portfolio-first-story-projects` (off `main`; PR open, **not merged**).
Date: 2026-07-23.

---

## TL;DR

The phase's two live-page deliverables **could not be produced in this session**, for reasons the brief's own §2 stop-conditions anticipate, plus one the brief did not: the target layout doesn't exist. What **was** delivered is the reusable, verified machinery the phase is really about — a safe, idempotent, self-verifying importer built against the *actual* schema, plus the manifest/README/lockfile scaffolding — so that authoring the two pages (and the next ~19) is now a photo-viewing-plus-manifest-edit task on a host that has the photos and a write token.

**Nothing was written to Sanity. The live site is byte-unchanged. Published project count is still 10, with 0 drafts visible.**

---

## Four ground-truth corrections (surfaced, not silently ratified)

1. **The M.18 / PSS-002 "story layout" does not exist in this repository.** The brief is built on a `hasStory`-gated layout with `overview / site / approach / work / feature / result / durability` sections, an at-a-glance strip, materials block, testimonial, project FAQ and internal-links. Verified absent on 2026-07-23:
   - `sanity/schemas/project.ts` is the **legacy** shape (`title, narrativeHeading, narrative, materials[], leadImage/leadAlt, gallery[galleryEntry], hasBeforeAfter + before/after, facts{sqft,durationDays,crewSize}, seo`).
   - `PROJECT_DETAIL_PROJECTION` (`sanity/lib/queries.ts:84`) selects only those legacy fields.
   - `src/app/[locale]/projects/[slug]/page.tsx` renders a fixed `Hero → Narrative → Gallery → Facts → BeforeAfter → Related → CTA` tree — **no `hasStory` gate**, none of the story components imported.
   - No `overview/atAGlance/durability/materialsNote/testimonialStatement` anywhere in `sanity/`; no `ProjectStory/projectFact/projectFaq` symbols; `sanity/schemas/objects/galleryEntry.ts` and `projectBlocks.ts` (brief-required reading) **do not exist**; no `project.story.*` i18n keys; `git log --all` has no M.18/PSS-002/story commit.
   - **Resolution (user-approved):** build the importer against the actual legacy schema ("code wins"; brief §3 "the data should fit the schema, not the reverse"). A true story layout is a **prerequisite phase**; B.18's own out-of-scope list forbids creating it here. Imported projects render as the existing legacy project page.

2. **The staged photos are not on this host.** Brief expects `C:\sunset-photos\import\providence-pointe\` and `…\wilshire-wojdyla\`. This is a **macOS** host (`/Users/petarjakimov`); a maxdepth-6 search of `$HOME`, `/Users/Shared`, `/Volumes`, `/private/tmp`, `/tmp` found no `sunset-photos` / `providence-pointe` / `wilshire-wojdyla`. Per §2: stopped, wrote nothing, did not substitute placeholders, did not fetch from Drive.

3. **No `SANITY_API_WRITE_TOKEN`.** `.env.local` carries read-only public config; the token is unset in the shell and every env file (only named in `.env.local.example`). Per §2: writes fail loudly; none attempted.

4. **The brief's reference pattern script `scripts/hotfix-scott-sarah-project.mjs` is absent** from the checkout (only `upload-m01c-photos.mjs` is present). The importer was modeled on `upload-m01c-photos.mjs` + `optimize-stock-bridge.mjs` + the live schema instead.

Given (2)+(3), even with a correct schema the write leg is impossible here; given (1), the story-page goal is out of reach until a prerequisite phase lands. The user chose **"build for the real schema"** and **"build code scaffolding now"** after these were surfaced with evidence.

---

## Delivered (committed on the branch)

| Commit | Contents |
|---|---|
| `docs(decisions)` | `Sunset-Services-Decisions.md` — B.18 plan-of-record: the four corrections + import decisions D3/D4/D5/D7/D9/D10/D13 (decisions-first, separate). |
| `feat(b18)` | `scripts/import-project-folder.mjs` + `docs/project-import/{README.md, asset-lock.json, manifests/{providence-pointe,wilshire-wojdyla}.json, screenshots/}`. |
| `fix(b18)` | `scripts/validate-seo.mjs` — stale `scott-and-sarahs` → `granite-fusion-walkway-seating-wall`. |

### `scripts/import-project-folder.mjs` — behaviour

- **Dry-run default** (writes nothing); `--commit` writes a **draft** (`drafts.project-<slug>`); `--commit --publish` promotes and clears the draft; `--reprocess` forces the photo pipeline.
- **Env:** `.env.local` loaded with `override:true` so a stale exported projectId can't misroute writes. Write flags without a valid `SANITY_API_WRITE_TOKEN` → loud, specific failure.
- **Photo pipeline (D7/D13):** recursive walk → classify by nearest known subfolder (`Before/After/Progress/RENDER/iPad`, flat root → after, nested folders inherit) → **SHA-256 dedupe** → **HEIC decode** (sharp-HEIF → `heic-convert` → ImageMagick, first that works) → `.rotate()` auto-orient → resize `fit:inside` 2400px → `jpeg q82 mozjpeg` → **all metadata stripped** → **strip re-verified** (aborts before any upload if EXIF/XMP/IPTC survive) → BG-01 §9.4 rename (`<service>-<city|dupage>-<year|undated>-<class>-NN.jpg`) → writes `_processed/index.json` worksheet.
- **Manifest validation before any byte:** slug regex + no `\d{3,}` house-number run + no city-slug substring (D5); audience/services against live-fetched valid slugs; `confirmed.citySlug` ∈ 24; `title.en`/`narrative.en` required; every photo present in `sourceFolder` with non-empty `alt.en` **and** `alt.es`; **no photo referenced twice** across lead/gallery/before/after; `internalLinks[].href` regex (forward-compat).
- **Idempotent:** deterministic `_id`; assets keyed on processed-bytes SHA-256 in `docs/project-import/asset-lock.json` (reused on re-run); unchanged manifest → deep-canonical compare → **no-op, no `_rev` bump**.
- **Never guesses `_id`:** GROQ slug-collision guard aborts if a *different* doc holds the slug.
- **Omits, never nulls:** a `confirmed` null leaves the field off the document.
- **`--publish` gated:** refused unless `clientPhotoPermission===true` **and** `citySlug` **and** `year`; prints the failing gate; prints the B.08 revalidate reminder.
- **Post-write self-verify:** independent client re-reads the written `_id` and asserts title/slug/narrative/lead-asset/gallery-count/before-after — pass/fail table, fails the run on any FAIL.

---

## Verification (real output)

**Build / static analysis**
```
npm run lint     → exit 0   (0 errors; 9 pre-existing warnings, none in B.18 files)
npx tsc --noEmit → exit 0
npm run build    → exit 0   (Generating static pages ✓ 202/202)   [pre-phase baseline: 202/202 — no new routes]
eslint scripts/import-project-folder.mjs → exit 0
```

**Data integrity (anonymous read; no token used)**
```
count(*[_type=="project"])                                → 10   (unchanged)
count(*[_type=="project" && _id in path("drafts.**")])    → 0    (no writes performed)
granite-fusion-walkway-seating-wall present live, scott-and-sarahs absent  (validate-seo fix verified against live data)
git diff --name-only: 8 files, all text; src/messages/* untouched → EN/ES leaf parity unchanged
```

**Importer exercised end-to-end on synthetic fixtures** (scratchpad, never committed — nothing under `C:\sunset-photos\` or scratch entered git):
```
9 source imgs (Before/After/Progress/RENDER + a byte-identical dup + a real .heic + nested After/March 2026/)
→ 8 processed, 1 duplicate dropped (SHA-256)     [dedupe ✓]
→ decode methods: {"sharp-native":7,"sharp-heif":1}   [HEIC decode ✓]
→ classification: after/before/progress/render correct; nested folder inherited 'after'   [classify ✓]
→ EXIF STRIP: all 8 outputs exif=false xmp=false iptc=false; GPS-bearing input (212 exif bytes) → output 0   [D7 ✓]
→ manifest validation: filled manifest → clean plan; empty template → 5 blocking errors, 0 bytes uploaded   [fail-closed ✓]
→ --commit without token → loud guard   [✓]
→ missing staging folder → "staging folder not found: <path>", nothing written   [§2 stop ✓]
→ re-run reuses existing _processed (no reprocess)   [idempotent-process ✓]
```

**Not runnable in this session (no photos / no token):** actual asset upload, draft write, the `_rev`-unchanged no-op on a real re-run, and the served-HTML rendering + FAQ JSON-LD + screenshot checks. These belong to the write run on the host that has both inputs.

---

## Confirm before publish

Every manifest is a **template**: provenance pre-filled, all copy + the `confirmed` block empty. The importer will not import until these are authored + confirmed. Rows below are what must come from a human before `--publish`.

| Project | Field | Why it's blank | What's needed |
|---|---|---|---|
| providence-pointe | all `title/slug/narrative/alt/gallery` copy | Photos not on this host — no honest copy can be written about unseen photos (D11) | Author from the processed photos: view each, write EN + drafted ES |
| providence-pointe | `confirmed.citySlug` | Folder name is a subdivision ("Providence Pointe"), not a municipality | One of the 24 valid city slugs |
| providence-pointe | `confirmed.year` | Drive timestamps are upload dates, not completion dates | Year the job completed |
| providence-pointe | `confirmed.materials` / `sqft` / `crewSize` / `durationDays` / `durationWeeks` | Not derivable from photos (D11) | Real values from Marcin/Erick, or leave omitted |
| providence-pointe | `confirmed.clientPhotoPermission` | Consent not on file in-repo (BG-01 §9.2) | Confirmed photo-use consent from the Ruvalcaba client |
| providence-pointe | `hasBeforeAfter` + pair | Needs a genuine matched pair judged from the photos (D10) | Set true only with an honest before/after pair |
| wilshire-wojdyla | all copy + full `confirmed` block | Same as above | Same as above |
| wilshire-wojdyla | `sanityDocId` | Left blank so `_id` derives from the privacy-clean slug (not the street/surname) | Set a stable, surname-free `sanityDocId` once the slug is final |
| wilshire-wojdyla | `deferredVideo` | The `After/` MOV set was not enumerated in Drive | Count MOVs on disk; record for the deferred-video phase |

---

## Decisions the brief did not cover (surfaced)

- **Legacy-schema target.** Documented above + in the decision log; the importer is additive-ready for a future story layout.
- **Manifest reshaped to the real schema.** The brief's story-field manifest keys (`overview/site/approach/... /atAGlance/faq/internalLinks/keywords/materialsNote/testimonialStatement`) map to nothing in this repo, so the manifest carries the legacy fields (`narrativeHeading/narrative/materials/facts/seo`). `internalLinks` is still validated for forward-compat but not written.
- **Privacy of the folder name.** `wilshire-wojdyla` embeds a street ("Wilshire") + surname ("Wojdyla"). Kept only in internal provenance (`id`, `rawFolder`/`sourceFolder`, manifest filename — the brief mandates that filename in §8); `sanityDocId` left blank to derive the `_id` from the privacy-clean slug; every shipped/uploaded surface (slug, title, alt, copy, processed filenames) is surname/street/number-free. Flagged so the operator can decide whether to also rename the local staging folder.
- **`validate-seo` scope.** Applied only the verified-independent stale-slug fix; the two new project slugs are **not** added yet (the drafts carry no live slug — adding them would 404 the validator). Other validators hardcode only the valid `aurora-area-patio` path, so none needed changing.
- **HEIC decode path used:** `sharp-heif` — this `sharp@0.34.5` build ships libheif input on this host (`sharp.format.heif.input === true`). **No dev dependency added.** On a host whose sharp lacks HEIF, the importer falls to `heic-convert` (prints `npm i -D heic-convert`) then ImageMagick.
- **Duplicate handling:** the After-folder double-copy the brief warns about is dropped by SHA-256 of raw bytes, keeping the first by path sort; every drop is logged to `index.json.droppedDuplicates`. (Real drop count is produced on the host with the photos.)
- **`RENDER/` and `iPad/`:** classified as `render` and suffixed `-render-`; per D13 a render may appear only where its alt says "3D design rendering", never as `leadImage`/before/after. Whether either folder actually held renders, and whether any were used, is determined during the photo-authoring pass.
- **Work outside the six hardscape services:** cannot be assessed without the photos; the manifest author should widen `services[]` only to what the photos genuinely show.
- **`featuredOnHome` recommendation:** flag stays `false` on both per D9; a homepage-hero recommendation requires seeing the lead shots and is deferred to the authoring pass.

---

## Definition of Done — status

- [x] Decisions appended first, separate commit.
- [x] Importer committed: dry-run default, idempotent, manifest-validating, publish-gated, self-verifying — **against the real (legacy) schema**.
- [x] Both manifests committed as templates (provenance filled; copy pending — cannot be authored without the photos).
- [x] `README.md` + `asset-lock.json` committed.
- [ ] **Both `project` drafts in Sanity** — **BLOCKED** (no photos, no write token this session). The importer produces them from a filled manifest on a host with both.
- [x] `validate-seo` `PROJECT_SLUGS` stale entry corrected.
- [x] Nothing published to production; live site unchanged.
- [x] `TRANSLATION_NOTES.md` §B.18 added (register/glossary for the ES drafts; no strings yet).
- [x] Completion report + state sync; branch pushed; PR open, not merged.
- [ ] Screenshots (2×2×2) — deferred to the write run (nothing renders until a draft exists).

**Net:** the reusable importer and all safety machinery are done and verified; the two pages await the photos + token on the appropriate host, and a real "story layout" awaits a prerequisite phase.
