# Project-folder import runbook (Phase B.18)

Turn one Google-Drive job folder + a JSON manifest into one live Sanity
`project` page — safely, repeatably, and without ever committing a photo binary
or leaking a customer's home address. Built so the ~19 remaining hardscape job
folders become a ~15-minute manifest edit instead of a phase.

> **Everything here writes Sanity DRAFTS by default.** Nothing reaches a
> visitor until someone runs an explicit, gated `--publish`.

---

## ⚠️ Read this first — what this importer does and does NOT build

The original B.18 brief assumed a rich "story layout" (Phase M.18 / PSS-002)
with `overview / site / approach / work / feature / result / durability`
sections, an at-a-glance strip, a materials block, a testimonial, a project FAQ
and internal-links — gated by a `hasStory` switch.

**That layout does not exist in this repository.** Verified on 2026-07-23:
`sanity/schemas/project.ts` is the legacy shape; `PROJECT_DETAIL_PROJECTION`
(`sanity/lib/queries.ts`) selects only the legacy fields; the detail page
(`src/app/[locale]/projects/[slug]/page.tsx`) renders a fixed
`Hero → Narrative → Gallery → Facts → BeforeAfter → Related → CTA` tree with no
`hasStory` gate; none of the story components, `project.story.*` i18n keys, or
`galleryEntry.ts` / `projectBlocks.ts` schema files are present; `git log` has no
M.18/PSS-002 commit. See the 2026-07-23 entry in `Sunset-Services-Decisions.md`.

So this importer writes **only the fields the live schema defines**, and each
imported project renders as the existing legacy project page (narrative +
gallery + facts + optional before/after). Building the true story layout —
schema fields, projection, components, i18n — is a **prerequisite phase** that
must land before any "story page" exists. The importer is written so that when
those fields DO exist, extending it is additive (add fields to `buildDoc`).

---

## What a staging folder must look like

The photos are staged on local disk **by hand, outside the repo** — Cowork
sessions cannot save image binaries, and the ~200 MB of originals must never
enter git. The convention (Windows operator box):

```
C:\sunset-photos\import\<folder-id>\
    Before\      After\      Progress\      iPad\      RENDER\      (any subset)
```

- Files directly in the folder root, or under `After\`, are classified **after**.
- `Before\` → before · `Progress\` → progress · `RENDER\` and `iPad\` → render
  (a 3D design render or design screenshot — **not** a photo of built work, D13).
- Nested sub-subfolders (e.g. `After\March 2026\`) are walked recursively and
  inherit the nearest known class.
- HEIC/HEIF, JPEG, PNG, WebP, TIFF are all accepted as source.
- On a **non-Windows** host, edit the manifest's `rawFolder` / `sourceFolder`
  paths to wherever you staged the folder.

**If a staging folder is missing or empty, the importer stops and prints the
exact missing path. It writes nothing.** Do not substitute placeholder imagery.

---

## Step 1 — process the photos + get the worksheet

Run a dry run. On first run (when `_processed/` is absent) the importer walks the
staging folder, **dedupes by SHA-256**, **decodes HEIC** (sharp → `heic-convert`
→ ImageMagick, first that works), **auto-orients, downscales to 2400 px, re-encodes
at JPEG q82, and strips ALL EXIF (incl. the customer-home GPS)** — then
**verifies the strip** before anything is uploaded. It writes the processed JPEGs
to `<folder>\_processed\` and a worksheet at `<folder>\_processed\index.json`.

```bash
node scripts/import-project-folder.mjs docs/project-import/manifests/<id>.json
```

`_processed/` and everything under `C:\sunset-photos\` stay **out of git**.

Open `index.json`. It lists every generated filename, its class, its source
path, and its dimensions — plus the duplicates it dropped. This is your
worksheet for the next step.

The processed filename convention (BG-01 §9.4) is:

```
<primary-service>-<city|dupage>-<year|undated>-<before|after|progress|render>-NN.jpg
```

`dupage` / `undated` are placeholders used until `confirmed.citySlug` /
`confirmed.year` are known — the filename is internal and re-runnable; **the alt
text is what ships.** (Re-run with `--reprocess` after filling `confirmed` to
regenerate the names with the real city/year.)

---

## Step 2 — actually look at every photo, then fill the manifest

**Open each processed image and look at it.** Do not write a word of copy or alt
text about a photo you have not seen. Then edit `docs/project-import/manifests/<id>.json`:

| Field | Rule |
|---|---|
| `slug` | Describes the work. **Never** a house number, street name, client surname, or city (D5). Matches `^[a-z0-9-]+$`. The importer rejects a `\d{3,}` run or any city slug substring. |
| `title` / `shortDek` / `narrativeHeading` / `narrative` | `{en, es}`. Honest, neighborly, design-forward voice (BG-01 §3.3). No "elevate your outdoor living", no "nestled", no unprovable superlatives, no price/discount/"best-in-Chicago"/competitor claims (BG-01 §8.5). Say only what the photos support (D11). `title.en` and `narrative.en` are **required**. |
| `services` | 1–3 real service slugs the job genuinely used. Hardscape: `patios-walkways, retaining-walls, fire-pits-features, pergolas-pavilions, driveways, outdoor-kitchens`. Don't pad. |
| `leadImage` + `leadAlt` | The single strongest establishing shot (never a render). `leadAlt.en` **and** `leadAlt.es` required. |
| `gallery[]` | `{file, alt:{en,es}}`. **Every photo appears exactly once** across leadImage / gallery / before / after — the importer rejects a repeat. Alt is required, specific, describes what's in frame + material/feature. "Project photo" fails. A render's alt must say it is a **3D design rendering** (D13). |
| `hasBeforeAfter` | `true` **only** for a genuine matched pair — same subject, comparable angle, before + after (D10). Otherwise `false`, and put the before shots in `gallery`. |
| `confirmed` | Facts only a human can supply — see Step 3. `null` = the field is **omitted** from the document (renders as "—"), never guessed (D11). |
| `featuredOnHome` | Stays `false` (D9). The homepage hero is chosen by Goran/Lazar, not an import. |
| `seo` | `{title, description}` `{en, es}`, optional. |

**Spanish:** draft it properly — LatAm-MX, `tú` register for marketing copy (per
`Sunset-Services-TRANSLATION_NOTES.md`), not machine-literal. Append every new ES
string to that file under `## §B.18`, marked pending native review (Phase M.03).
Do **not** use a `[TBR]` prefix (retired in Phase B.01).

Re-run the dry run until it prints a clean plan. It fails, listing every issue,
if anything is missing — **before uploading a single byte.**

---

## Step 3 — the `confirmed` block (needs Marcin / Erick)

These cannot come from the photos. Leave `null` to omit; fill to include:

- `citySlug` — one of the 24 valid `location` slugs.
- `year` — the year the job **completed** (Drive timestamps are upload dates).
- `durationWeeks`, `sqft`, `durationDays`, `crewSize` — omit unless known.
- `materials` — `[{en, es}]`, real product/material names only.
- `clientPhotoPermission` — `true` only with real, on-file consent (BG-01 §9.2).

---

## The three commands

```bash
# 1. DRY RUN (default) — process, validate, print the full plan + a diff. Writes nothing.
node scripts/import-project-folder.mjs docs/project-import/manifests/<id>.json

# 2. WRITE A DRAFT — uploads assets, writes drafts.project-<id>. Invisible to visitors.
node scripts/import-project-folder.mjs docs/project-import/manifests/<id>.json --commit

# 3. PUBLISH — promotes to the live project. GATED (see below). Fires the B.08 revalidate webhook.
node scripts/import-project-folder.mjs docs/project-import/manifests/<id>.json --commit --publish

# optional: force the photo pipeline to re-run (e.g. after setting the real city/year)
node scripts/import-project-folder.mjs docs/project-import/manifests/<id>.json --reprocess
```

- **Requires** `.env.local` with `NEXT_PUBLIC_SANITY_PROJECT_ID` / `_DATASET`,
  and — for `--commit`/`--publish` — `SANITY_API_WRITE_TOKEN` (Editor).
  A write without a token fails loudly. Dry run needs no token.
- **Idempotent.** Asset uploads are keyed on the SHA-256 of the processed bytes,
  recorded in `docs/project-import/asset-lock.json`, so a re-run reuses the asset
  instead of duplicating it. A re-run with an unchanged manifest is a **no-op**
  (`already up to date`, no `_rev` bump). Commit `asset-lock.json` after a
  `--commit` so the uploads are reproducible.
- **`--publish` is refused** unless `confirmed.clientPhotoPermission === true`
  **and** `confirmed.citySlug` **and** `confirmed.year` are set. It prints which
  gate failed. Publishing fires the Phase B.08 webhook — the live page updates
  within ~2s. After publishing, add the new slug to `PROJECT_SLUGS` in
  `scripts/validate-seo.mjs`.

---

## Privacy — non-negotiable

- Every uploaded image has **zero EXIF/GPS** — stripped and re-verified by the
  importer (it aborts the run if any survives). These are photos of private homes.
- No slug, title, alt, heading, body, SEO field, or **uploaded filename** ever
  contains a house number, street name, client surname, or city.
- The staging tree and `_processed/` never enter git. The manifest's `rawFolder`
  / `sourceFolder` / `id` reference the operator's local Drive-named folder for
  provenance only; those are internal and never shipped.

---

## The backlog — remaining job folders

Drive parent: **`3. CompletedHardscape-2025`** — folders `#01`–`#20`. Two are
done through this importer:

| Manifest | Drive folder | Status |
|---|---|---|
| `providence-pointe` | `Providence Pointe - Ruvalcaba` | template scaffolded; copy + `confirmed` pending |
| `wilshire-wojdyla` | `#12 - 1200 Wilshire Dr - Wojdyla` | template scaffolded; copy + `confirmed` pending |

For each remaining `#01`–`#20` folder: stage it on disk, copy a manifest
template, run the three steps above. Enumerate the full `#01`–`#20` list from the
Drive parent as folders are picked up (record the Drive URL in each manifest's
`driveFolderUrl` for provenance).
