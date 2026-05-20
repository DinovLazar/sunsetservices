# Phase M.01b — Completion Report

**Phase ID:** M.01b — Takeout Extraction & Full Inventory
**One-line summary:** Extracted the 78-part Google Takeout set (77 unique, 1 duplicate skipped) directly from D: to `C:\sunset-photos\extracted\` and produced a complete, real-sizes/real-dates inventory of the 2,191-file (~141 GB) photo/video corpus. Output drives M.01c (curation + Sanity upload).

**Date:** 2026-05-20
**Run duration:** ~75 minutes wall — pre-flight ~2 min; extraction 15:19→16:16 (≈57 min, 77 archives via WinRAR); inventory walk + summaries ≈10 s; visual spot-checks + report writing the remainder.

## Disk-space figures

- Before: C: **296.19 GB free** (used 179.8 GB).
- ZIP set on D: **151.32 GB** across 78 files.
- After extraction: C: **144.9 GB free**. The extracted corpus is ~150.9 GB on C:; no copy of the ZIPs was made on C: (extracted directly from D:), so peak C: usage was just the extracted tree.

## Extraction results

- **Extracted: 77 of 78 present ZIPs. Failures: 0. Quarantined: 0.**
- Skipped: `takeout-20251025T163736Z-1-057 (1).zip` — confirmed byte-identical to `-057.zip` (SHA-256 `F5B367CC…17D0`).
- Missing from the source set: parts **002, 010, 067** (the numbering runs 001–080). Lost — accepted per the locked decision; no recovery attempted.
- Extractor: **WinRAR** (7-Zip not installed). Long Takeout paths handled natively; no path-length failures.
- Deviation from prompt: extracted **directly from D: → C:** (no intermediate `zips\` copy). In-spec, faster, half the disk; D:\ untouched. Logged in the decision entry.

## Headline corpus numbers

- Total files (all types): **2,786 — 150.91 GB**
- **Media files: 2,191 — 140.86 GB**  →  photos **835** (jpg 540, heic 204, png 87, webp 3, jpeg 1), RAW **627** (nef 626, dng 1), video **729** (mp4 569, mov 160)
- Media folders: **66**
- Year distribution (true mtime): **2021 = 1** (a stock graphic), **2025 = 2,190**. Active shooting window May–October 2025.
- Earliest media: 2021-10-06 (`…\Stock Elements\vecteezy…jpg`). Latest: 2025-10-06 (`…\Asphalt & Concrete\ASPHALT1\…0067_D.MP4`).
- Top folders by count: EditedPhotos (258), Turf Install (202 RAW), OLD Hardscaping\Photos (131), 1008 Homerton videos (127) + RAW (112), 807/811 Edgewater RAW (92), Tree Removal RAW (88).
- Top folders by size: Turf Install (18.6 GB), `refsproductions` pro turf video (14.5 GB), `SalesIntroVideo.PRV` Premiere cache (13.0 GB), 1008 Homerton (9.2 GB), 807/811 Edgewater (8.6 GB), Tree Removal (8.3 GB).

## Duplicate & manifest findings

- **Duplicate `-057 (1)`:** identical SHA-256 to `-057` → skipped (not extracted). Logged with both hashes in pre-flight output.
- **Manifest:** none found (`archive_browser.html`/`index.html` not present in the archives), so the file-count gap from the 3 missing parts cannot be measured precisely. Estimate ~85 media files lost (~28 media/part × 3).

## Surprises encountered

- **The corpus is far richer than M.01a's partial extraction suggested** — 2,191 media files vs. the ~51 visible before. Real, professionally shot RAW + edited JPGs + drone + vendor video across every service line, organized by job address.
- **Adobe Premiere `.PRV` "Video Previews" inflate the `.mov` count.** ~142 of 160 `.mov` (~14.3 GB) are render-cache fragments (`Rendered - <guid>.mov`), not deliverable footage. Flagged for exclusion in M.01c. Also present: 84 `.prproj`, plus `.pek`/`.cfa` Premiere cache, fonts, and Adobe `.ai/.psd/.indd` design source — all non-media.
- **My sandbox/mount served stale cached views of the live progress log** during the long run (frozen timestamps), even though the host file was advancing — confirmed real progress via File Explorer (which reads the true filesystem). Did not affect the final result; the PowerShell-generated CSV/JSON/summary are authoritative.
- **HEIC volume:** 204 iPhone HEIC, including explicit before/after sets (`Scott & Sarah's` + `…\8 months After`).

## Confirmation: D:\ unchanged

Confirmed. ZIPs were read read-only from `D:\Sunset Shared Drive\MARKETING ZIP Filer\` and extracted to C:. Nothing on D: was created, modified, moved, or deleted. The duplicate hashing also read D: read-only.

## Open questions for Chat (M.01c planning)

1. **Lead with `EditedPhotos`.** 330 curated, retouched, web-ready JPGs (258 + 60 @ 811 Edgewater + 12 @ 807 Edgewater). Pull RAW only where no edited version exists.
2. **HEIC conversion (204 files)** and **RAW export (627 NEF + 1 DNG)** are required pre-Sanity steps — propose batch HEIC→WebP/JPG and a RAW develop/export (many RAWs already have JPG counterparts in `EditedPhotos`, so confirm which RAW folders still need exporting).
3. **Exclusions:** drop the `.PRV` Premiere render-cache (`.mov`, ~14 GB), `GraphicDesign_4Print _ Logos\*` (logos/print/shirts/signs/cards/stock/signatures — though logo PNG/JPEG are useful brand assets), `SocialMediaPostDesigns` (finished graphics), and `AI_generated` (8 Firefly clips). Confirm.
4. **Per-address folders → project pages.** 1008 Homerton N Aurora, 807 & 811 Edgewater Dr, 6135 Belmont Downers Grove, 1227 Colchester Ln Aurora, and client-named Scott & Sarah's map directly onto `/projects/` entries — preserve grouping. The "Unknown Address" patio folder needs Goran to identify the project.
5. **Staff Photos → Team/About page** (crew portraits), not the project portfolio.
6. **Video strategy:** keep `.mp4` job/process clips + drone footage; the vendor `refsproductions` turf set (14.5 GB) and per-address `_Videos` folders are strong but heavy — decide on hosting/compression before any web use.
7. **Missing parts (002/010/067):** if the content matters, a fresh Google Takeout of the still-existing source Drive folder would recover everything. Otherwise accept the ~85-file loss.

## Definition of done — status

Pass. The corpus is extracted onto local disk with real sizes and dates; the inventory is complete enough to plan M.01c without re-extracting; all four state files (`current-state.md`, `file-map.md`, the inventory, this report) are written; `D:\` is unchanged; and the logs under `C:\sunset-photos\logs\` (copy/extract progress, failed-ZIP log, full media CSV, per-folder JSON, sitewide summary) fully document the run.
