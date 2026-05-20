# Phase M.01b — Photo Source Inventory (extracted Takeout corpus)

Generated: 2026-05-20T16:16 (extraction + walk), report written 2026-05-20
Source (origin): `D:\Sunset Shared Drive\MARKETING ZIP Filer\` — 78 Google Takeout ZIP parts (export dated 2025-10-25)
Source (analyzed): `C:\sunset-photos\extracted\` — the merged extraction of 77 parts (the confirmed duplicate `-057 (1)` was skipped)
Scope: ZIPs extracted read-only from D: directly to C: (D: untouched). Inventory walk over the extracted tree on C:.

## Tooling note

Unlike M.01a (external drive, no `stat` access), this phase extracted the corpus onto an internal C: drive that both Windows and the analysis tools can fully read — so **byte sizes and true file timestamps below are real**, not inferred.

- Extraction ran natively on Windows via WinRAR (7-Zip not installed) launched through a PowerShell script. ZIPs were read directly from D: and extracted to `C:\sunset-photos\extracted\` — no intermediate copy of the 151 GB ZIP set was made on C: (saves disk + time; D: stays read-only). This is a deliberate, in-spec deviation from the prompt's "copy then extract" step; logged in the decision entry.
- Sizes/dates/counts come from the PowerShell walk (authoritative): `C:\sunset-photos\logs\06-media-files.csv` (every media file), `07-folder-summary.json` (per-folder), `08-summary.txt` (sitewide). Photo spot-checks were done by opening JPGs directly; video folders were spot-checked via `ffmpeg` single-frame thumbnails.

## Executive summary

- **ZIPs extracted: 77 of 78 present (one was the confirmed duplicate). 0 failures, 0 quarantined.** 3 parts (002, 010, 067) were never in the set — lost, accepted per the locked decision.
- **Total files extracted (all types): 2,786 — 150.91 GB.**
- **Media files: 2,191 — 140.86 GB.**
  - Photos: **835**  (jpg 540, heic 204, png 87, webp 3, jpeg 1)
  - RAW: **627**  (nef 626, dng 1)
  - Video: **729**  (mp4 569, mov 160)
- Media folders (folders with ≥1 media file): **66**
- Date range (true file mtime): earliest **2021-10-06** (a stock graphic in `Stock Elements`), latest **2025-10-06** (`Asphalt & Concrete\ASPHALT1` drone clip). **By year: 2021 = 1, 2025 = 2,190.** Effectively the entire working corpus is from **2025** (May–October 2025 is the active shooting window).
- **Duplicate `-057 (1).zip`: confirmed byte-identical** to `-057.zip` (same SHA-256 `F5B367CC…17D0`) → skipped, not extracted.
- **No Takeout manifest** (`archive_browser.html` etc.) was present in the archives, so the exact file-count gap from the 3 missing parts can't be measured. Estimate: ~28 media files per part × 3 ≈ **~85 media files (and proportional non-media) likely lost** to the missing parts.
- Disk: C: had 296 GB free before; **144.9 GB free after** extraction.
- **Big curation flag:** a large share of the 160 `.mov` files (~142, ~14 GB) are Adobe Premiere **`.PRV` "Video Previews"** — render-cache fragments, NOT deliverable footage. The genuinely usable video corpus is the **569 `.mp4`** plus ~18 real `.mov`. See "Items flagged."

### Apparent organization scheme

A Google Takeout of a Google Drive `MARKETING\MEDIA\` tree, cleanly organized by **service line** and, within hardscaping, by **individual job address**:
`Images & Videos\` holds the real job content — `Hardscaping\` (Patios, Driveways, Walkways, Retaining Walls, Water Fountains, kitchen_FirePits, Pergolas), `Landscaping\` (Design&Install, Lawncare & Maintenance/Mowing, Planting_Mulching, Irrigation_Drainage), `Turf Install`, `Tree Removal`, `Asphalt & Concrete`, `PlantsInstall`, `EditedPhotos` (the curated JPG exports), `Staff Photos`, plus per-address folders like `1008 HomertonNAurora_2025` and `807 & 811 EdgewaterDr._2025`. `GraphicDesign_4Print _ Logos\` and `SocialMedia\` hold branding, print, finished social posts, and Premiere project/preview files (not raw job media).

## Folder-by-folder breakdown

Complete list of all 66 media folders, descending by media count. Common prefix `Takeout\Drive\MARKETING\MEDIA\` is stripped; `I&V` = `Images & Videos`. Full per-folder data (incl. sample filenames) is in `C:\sunset-photos\logs\07-folder-summary.json`. "Class" = Sunset-portfolio relevance.

| Folder | Photos | RAW | Video | Size | Date range | Class |
|---|---:|---:|---:|---|---|---|
| I&V\EditedPhotos | 258 | 0 | 0 | 6.5 GB | 2025-07-21→07-23 | **Yes** (edited job JPGs) |
| I&V\Turf Install | 3 | 199 | 0 | 18.6 GB | 2025-05-12→05-25 | **Yes** (RAW shoot) |
| I&V\OLD Sunset Hardscaping Photos\Photos from Projects\Photos | 123 | 0 | 8 | 790 MB | 2025-05-23→06-05 | **Yes** (HEIC job photos) |
| I&V\Hardscaping\Patios\1008 HomertonNAurora_2025\Homerton_Videos | 0 | 0 | 127 | 6.1 GB | 2025-07 | **Yes** (patio build video) |
| I&V\Hardscaping\Patios\1008 HomertonNAurora_2025 | 15 | 96 | 1 | 9.2 GB | 2025-07-24→07-27 | **Yes** (patio job, RAW) |
| SocialMedia\AdobePremierePro Projects\…\SalesIntroVideo.PRV | 0 | 0 | 97 | 13.0 GB | 2025-08 | **No** (Premiere render cache) |
| I&V\Hardscaping\Patios\807 & 811 EdgewaterDr._2025 | 0 | 92 | 0 | 8.6 GB | 2025-07-23 | **Yes** (patio job, RAW) |
| I&V\Tree Removal\Tree Removal Photos | 0 | 88 | 0 | 8.3 GB | 2025-05-19 | **Yes** (RAW) |
| I&V\Hardscaping\Patios\Patio_Videos | 0 | 0 | 67 | 5.0 GB | 2025-05→07 | **Yes** (patio video) |
| I&V\Hardscaping\kitchen_FirePits\Kitchen Firepits_Videos | 0 | 0 | 60 | 5.0 GB | 2025-05→09 | **Yes** (firepit video) |
| I&V\EditedPhotos\811 Edgewater Dr_2025 | 60 | 0 | 0 | 1.6 GB | 2025-07-23 | **Yes** (edited job JPGs) |
| I&V\Hardscaping\kitchen_FirePits | 27 | 29 | 0 | 3.0 GB | 2025-05→07 | **Yes** (firepit job) |
| I&V\Hardscaping\Patios\807 & 811 EdgewaterDr._2025\811 Edgewater_Videos | 0 | 0 | 53 | 2.0 GB | 2025-07-27 | **Yes** (patio video) |
| I&V\Landscaping\Design&Install\Design&Install_Videos\Oswego Before | 0 | 0 | 47 | 7.2 GB | 2025-05→06 | **Yes** (before footage) |
| I&V\Hardscaping\Patios | 46 | 0 | 0 | 637 MB | 2025-05→07 | **Yes** (patio in-progress) |
| I&V\Hardscaping\Patios\Unknown Address | 21 | 0 | 24 | 3.3 GB | 2025-05→08 | **Yes** (HEIC+video; address unknown) |
| I&V\Landscaping\Lawncare & Maintenance\Mowing\Mowing Photos | 0 | 44 | 0 | 4.3 GB | 2025-05-14 | **Yes** (RAW) |
| SocialMedia\AdobePremierePro Projects\…\811Edgewater_2025_Long.PRV | 0 | 0 | 43 | 1.3 GB | 2025-08-21 | **No** (Premiere render cache) |
| I&V\PlantsInstall | 0 | 43 | 0 | 4.2 GB | 2025-05-13 | **Yes** (RAW) |
| GraphicDesign…\Sunset_Logo\PNG | 39 | 0 | 0 | 49 MB | 2025-08 | **No** (brand logos — useful asset) |
| I&V\Landscaping\Lawncare & Maintenance | 0 | 29 | 10 | 5.0 GB | 2025-05→06 | **Yes** (RAW + video) |
| GraphicDesign…\Sunset_Logo\JPEG | 34 | 0 | 0 | 138 MB | 2025-08-25 | **No** (brand logos) |
| I&V\OLD…\Photos from Projects\Scott & Sarah_s | 33 | 0 | 1 | 144 MB | 2025-05-23 | **Yes** (client job, HEIC) |
| I&V\Landscaping\Design&Install\Oswego Before pics | 22 | 7 | 0 | 776 MB | 2025-05→06 | **Yes** (HEIC+RAW before) |
| I&V\Hardscaping\Walkways_Pathways | 26 | 0 | 3 | 738 MB | 2025-05→07 | **Yes** (walkway job) |
| I&V\Tree Removal\Tree Removal Videos | 0 | 0 | 26 | 2.0 GB | 2025-05→08 | **Yes** (tree video) |
| I&V\Turf Install\TurfInstall_Videos\refsproductions_turf_2025-05-22_0546 | 0 | 0 | 26 | 14.5 GB | 2025-05-21 | **Yes** (pro turf video, vendor-shot) |
| I&V\OLD…\Scott & Sarah_s\8 months After | 21 | 0 | 0 | 81 MB | 2025-06-22 | **Yes** (before/after, HEIC) |
| I&V\Hardscaping\Walkways_Pathways\1227 Colchester Ln_Aurora | 0 | 0 | 20 | 1.0 GB | 2025-09-10 | **Yes** (walkway video) |
| I&V\Landscaping\Design&Install\Design&Install_Videos\Oswego After | 0 | 0 | 17 | 2.5 GB | 2025-07-09 | **Yes** (after footage) |
| SocialMedia\Videos_SocialMediaPost | 0 | 0 | 16 | 1.6 GB | 2025-06→09 | **Maybe** (finished social videos) |
| I&V\Hardscaping\Driveways_Parking Spaces\6135 Belmont Downers Grove_2025 | 0 | 0 | 15 | 879 MB | 2025-08-07 | **Yes** (driveway video) |
| I&V\Landscaping\Lawncare & Maintenance\Mowing\Mowing Videos | 0 | 0 | 14 | 604 MB | 2025-05 | **Yes** (mowing video) |
| I&V\Asphalt & Concrete\ASPHALT1 | 0 | 0 | 13 | 1.3 GB | 2025-09→10 | **Yes** (asphalt + drone video) |
| I&V\EditedPhotos\807 EdgewaterDr_2025 | 12 | 0 | 0 | 344 MB | 2025-07-23 | **Yes** (edited job JPGs) |
| GraphicDesign…\Stock Elements | 11 | 0 | 0 | 170 MB | 2021-10→2025-07 | **No** (stock graphics) |
| I&V\Turf Install\TurfInstall_Videos | 0 | 0 | 11 | 4.1 GB | 2025-05 | **Yes** (turf + drone video) |
| GraphicDesign…\Print\Shirts\Blank Shirts | 9 | 0 | 0 | 17 MB | 2025-07→08 | **No** (apparel mockups) |
| I&V\Hardscaping\Retaining Wall_ Garden Borders | 9 | 0 | 0 | 168 MB | 2025-06→07 | **Yes** (retaining wall job) |
| I&V\Hardscaping\Driveways_Parking Spaces | 9 | 0 | 0 | 77 MB | 2025-06→07 | **Yes** (driveway job) |
| I&V\AI_generated | 0 | 0 | 8 | 95 MB | 2025-05-25 | **Maybe** (Firefly synthetic clips) |
| I&V\Landscaping\Irrigation_Drainage | 1 | 0 | 6 | 167 MB | 2025-06→07 | **Yes** (drainage job) |
| I&V\Staff Photos | 7 | 0 | 0 | 54 MB | 2025-09-10 | **Yes** (crew portraits — Team page) |
| I&V\Sunset Building | 0 | 0 | 7 | 140 MB | 2025-08-07 | **Maybe** (premises footage) |
| GraphicDesign…\Print\TrailerWrap\Assets | 6 | 0 | 0 | 215 MB | 2025-07 | **No** (design assets) |
| GraphicDesign…\Print\Shirts\Mock-up | 5 | 0 | 0 | <1 MB | 2025-08-25 | **No** (apparel mockups) |
| GraphicDesign…\Print\Yard Signs\SunsetBusinessCards_2025 Folder\Links | 4 | 0 | 0 | <1 MB | 2025-07-07 | **No** (design link assets) |
| I&V\Hardscaping\Patios\807 & 811 EdgewaterDr._2025\807 Edgewater_Videos | 0 | 0 | 4 | 79 MB | 2025-07-27 | **Yes** (patio video) |
| SocialMedia\SocialMediaPostDesigns | 4 | 0 | 0 | 22 MB | 2025-08→09 | **No** (finished branded graphics) |
| GraphicDesign…\Print\BusinessCards_2025\Links | 4 | 0 | 0 | <1 MB | 2025-07-07 | **No** (design link assets) |
| GraphicDesign…\Print\American Dream | 4 | 0 | 0 | 41 MB | 2025-07→09 | **No** (campaign design) |
| GraphicDesign…\Print\Yard Signs\Sunset_YardSign_4print\Links | 3 | 0 | 0 | 52 MB | 2025-07 | **No** (design link assets) |
| GraphicDesign…\CalmYourTips_Shirt\PNG | 3 | 0 | 0 | <1 MB | 2025-06-25 | **No** (apparel design) |
| I&V\Hardscaping\Water Fountains | 3 | 0 | 0 | 72 MB | 2025-06 | **Yes** (water feature) |
| GraphicDesign…\Email Signatures | 2 | 0 | 0 | <1 MB | 2025-05-13 | **No** (signatures) |
| I&V\Hardscaping\Water Fountains\WaterOuntain_Videos | 0 | 0 | 2 | 35 MB | 2025-05-23 | **Yes** (water feature video) |
| SocialMedia\AdobePremierePro…\RecoveryProjects\…\811Edgewater_2025.PRV | 0 | 0 | 2 | 11 MB | 2025-08-19 | **No** (Premiere autosave cache) |
| GraphicDesign…\Print\Yard Signs | 2 | 0 | 0 | 51 MB | 2025-07-08 | **No** (design assets) |
| GraphicDesign…\Print\Shirts\SunsetShirts_Elements | 2 | 0 | 0 | 3 MB | 2025-08-25 | **No** (apparel mockups) |
| I&V\Pergolas & Pavillion | 2 | 0 | 0 | 24 MB | 2025-07-21 | **Yes** (pergola job) |
| I&V\Landscaping\Planting_Mulching | 1 | 0 | 0 | 13 MB | 2025-06-01 | **Yes** (planting job) |
| I&V\Hardscaping (folder root) | 1 | 0 | 0 | 11 MB | 2025-07-23 | **Yes** (patio/steps) |
| GraphicDesign…\Print | 1 | 0 | 0 | 1 MB | 2025-07-02 | **No** (branding) |
| GraphicDesign…\Sunset_Logo | 1 | 0 | 0 | 1 MB | 2025-07-02 | **No** (branding) |
| I&V\Landscaping\Design&Install\Oswego After pics | 1 | 0 | 0 | 11 MB | 2025-07-09 | **Yes** (after photo) |
| I&V\Landscaping\Design&Install\Design&Install_Videos | 0 | 0 | 1 | 44 MB | 2025-05-25 | **Yes** (sod install video) |

## Visual spot-check

Photos opened directly; video folders spot-checked via single-frame `ffmpeg` thumbnails. RAW (`.nef`/`.dng`) and `.heic` cannot be previewed by the available tools — those folders are classified by name + the JPG exports that accompany them, with visual confirmation deferred to M.01c after conversion.

- **EditedPhotos — `5_8.JPG`:** Professionally edited photo — a Sunset crew member (orange shirt) doing lawncare in a residential front yard. The 258-image `EditedPhotos` set is the curated, retouched, web-ready JPG output of the 2025 shoots. **Highest-value portfolio source.**
- **EditedPhotos\811 Edgewater Dr_2025 — `5.JPG`:** Finished hardscape patio with a built-in fire-pit table and a timber-clad outdoor TV wall, framed by paver flooring and evergreens. Magazine-quality. Confirms the per-address `EditedPhotos` subfolders are completed-project beauty shots.
- **Hardscaping\Patios — `IMG_5061.jpg`:** Work-in-progress paver patio — raised paver base under construction, compactor/tools, wheelbarrow. Authentic job-site documentation (good for before/after and process content).
- **Staff Photos — `20250910_072722.jpg`:** Crew member portrait in front of a pallet of pavers (phone photo, rotated). Team headshots — best suited to an About/Team page, not the project portfolio.
- **Hardscaping\Patios\1008 Homerton\Homerton_Videos (video):** Frame shows a STIHL concrete cut-off saw cutting pavers on a driveway — genuine job-site process footage.
- **Tree Removal\Tree Removal Videos (video):** Frame shows a worker operating a chainsaw at a tree/garden-bed in a residential yard — genuine tree-removal footage.
- **Asphalt & Concrete\ASPHALT1 (video):** Drone frame of a freshly paved black asphalt path winding across a green lawn to a driveway — strong aerial portfolio footage.
- **Turf Install\…\refsproductions_turf… (video):** Frame shows a crew broadcasting infill onto freshly laid artificial turf along a wood fence — professional, vendor-shot (`refsproductions`) cinematography.

Overall: the corpus is overwhelmingly **authentic Sunset Services job content** spanning every service line (hardscaping/patios, turf, tree removal, asphalt/concrete, lawncare/mowing, planting, drainage, retaining walls, water features, pergolas), shot May–October 2025, much of it professionally photographed (RAW) and edited (EditedPhotos), with drone and pro-video coverage of marquee jobs.

## Items flagged for Chat review

- **EditedPhotos is the curation starting point.** 330 web-ready edited JPGs total (258 main + 60 @ 811 Edgewater + 12 @ 807 Edgewater) — already retouched and export-sized. M.01c should likely lead with these and pull RAW only where an edited version doesn't exist.
- **RAW (NEF) needs an export step.** 626 `.nef` (+1 `.dng`) — the source shoots for Turf Install, Tree Removal, PlantsInstall, Mowing, kitchen_FirePits, and the Edgewater/Homerton patios. Many already have edited JPG counterparts in `EditedPhotos`; the rest need develop/export before web use. There are also 151 `.xmp` + 99 `.acr` Adobe sidecars carrying the edit settings.
- **HEIC needs conversion.** 204 `.heic` (iPhone) across the `OLD Sunset Hardscaping Photos`, `Scott & Sarah_s` (incl. an "8 months After" before/after set), `Oswego Before pics`, and `Unknown Address` folders. Not web-ready and not previewable as-is.
- **`.PRV` "Video Previews" are render cache, not footage — exclude.** ~142 `.mov` (~14.3 GB) sit in `SalesIntroVideo.PRV`, `811Edgewater_2025_Long.PRV`, and a Premiere autosave `.PRV`. These are Adobe Premiere preview fragments named `Rendered - <guid>.mov`, not deliverable videos. The real video corpus is the **569 `.mp4`** + ~18 genuine `.mov`. Also present: 84 `.prproj` Premiere projects + `.pek`/`.cfa` cache — all non-deliverable.
- **Per-address job folders = ready-made project pages.** `1008 Homerton N Aurora`, `807 & 811 Edgewater Dr`, `6135 Belmont Downers Grove`, `1227 Colchester Ln Aurora`, and client-named `Scott & Sarah's` map cleanly onto individual portfolio/project entries. Preserve this grouping in M.01c.
- **"Unknown Address" patio folder** (21 HEIC + 24 video) — real job content but the address/project isn't labeled; may need Goran to identify before it becomes a project page.
- **Before/After material exists.** `Oswego Before` / `Oswego After` (Design&Install) and `Scott & Sarah's` + `Scott & Sarah's\8 months After` are explicit before/after sets — high marketing value.
- **Likely-exclude from project portfolio:** `GraphicDesign_4Print _ Logos\*` (logos, print, shirts, yard signs, business cards, stock elements, email signatures — though the logo PNG/JPEG sets are useful brand assets), `SocialMedia\SocialMediaPostDesigns` (finished branded graphics), `AI_generated` (8 Adobe Firefly synthetic clips), and the `.PRV` folders. `Staff Photos` → Team/About page, not project portfolio. `Sunset Building` (premises footage) → About page maybe.
- **Missing parts 002/010/067:** lost; no manifest to quantify the gap. Rough estimate ~85 media files unrecoverable. No action unless Goran can re-export from Google Drive (the source Drive folder presumably still exists — a fresh Takeout would recover everything, if desired).
- **No encrypted/password-protected/corrupt archives.** All 77 extracted clean (exit 0); quarantine folder is empty.
- **Working files location:** everything lives under `C:\sunset-photos\` (extracted tree + logs + CSV/JSON). The full per-file media list is `logs\06-media-files.csv`; per-folder data is `logs\07-folder-summary.json`. None of this is in the SunSet-V2 repo.

## End of report
