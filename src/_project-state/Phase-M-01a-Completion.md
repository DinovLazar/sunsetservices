# Phase M.01a — Completion Report

**Phase ID:** M.01a — Photo Source Discovery & Inventory
**One-line summary:** Read-only inventory of the photo source drive complete; the real corpus is still inside ~78 un-extracted Google Takeout ZIPs, so M.01b's first job is extraction, then curation + Sanity upload.

**Date:** 2026-05-20
**Run duration:** ~25 minutes (most of it spent diagnosing drive access and correcting the source path).

## Drive access status

**Succeeded — with a path correction and a tooling caveat.**

- The path named in the phase prompt, `D:\Goran PC BackUp`, **mounted empty** (it exists but the sandbox saw no contents — typical for external drives, which don't share their contents into Cowork's shell). I did not invent an alternate path; I reported the blocker and asked the user, who corrected it to **`D:\Sunset Shared Drive`** (external drive labelled "HV620S (D:)"). The inventory was run against that corrected path.
- Access method: the sandbox shell could not see the external drive's contents, so the inventory was built with the host-side read tools (recursive listing + per-extension enumeration + opening sample images). These reach the drive reliably for **file paths and image content**, but do **not** expose `stat` data — so byte sizes and true modification timestamps could not be captured. Dates in the report are derived from filename datestamps and labelled as such.

## Pointer to the inventory

Full inventory: **`src/_project-state/Phase-M-01a-Photo-Inventory.md`**

## Headline numbers (from the inventory)

- Top-level layout of `D:\Sunset Shared Drive`: `Extracted\` (a partial Google Takeout extraction), `MARKETING ZIP Filer\` (the raw Takeout ZIPs), and 2 loose video files at the root.
- Folders containing photos/videos (extracted tree + root): **15**.
- **Extracted-tree media totals:** photos **28** (jpg 12, png 10, JPG 4, jpeg 1, HEIC 1), RAW **6** (NEF, all in `PlantsInstall`), videos **17** (mp4 16, MP4 1). Total **51** media files. Plus 24 `.xmp` and 7 `.acr` edit sidecars (not counted as media).
- **Un-extracted corpus:** ~**78 Google Takeout ZIP parts** (`takeout-20251025T163736Z-1-001.zip` … `-080.zip`; 002/010/067 absent; one `-057 (1)` duplicate). Internal contents/counts unknown until extracted — this is almost certainly where the bulk of the real job photography lives.
- Total size: **not measured** (external drive can't be `stat`-ed by the read-only tools).
- Date range (filename-derived, not true mtime): earliest ~2025-05-13 (`Turf Install` sidecar), latest ~2025-09-26 (root DJI drone clip); ZIPs exported ~2025-10-25.

## Surprises encountered

- **Wrong path in the prompt.** `D:\Goran PC BackUp` was empty; the real folder is `D:\Sunset Shared Drive`. Logged in `Sunset-Services-Decisions.md`.
- **The "Extracted" tree is mostly NOT job photos.** It's dominated by branding/logos, stock graphics, email-signature images, AI-generated (Adobe Firefly) marketing clips, and finished social-media post designs. Only a handful of genuine job photographs were extracted (confirmed by spot-check: a paver patio, a pergola, a landscape-lighting feature, a drainage-install crew photo).
- **The real library is locked in ZIPs.** ~78 Takeout parts remain un-extracted — the discovery's single most important finding for M.01b.
- **Edit sidecars without originals.** `Turf Install` has 24 `.xmp` + 2 `.acr` sidecars but zero extracted RAW originals — they reference RAWs that are inside the ZIPs.
- **A screenshot masquerading as a photo.** `Water Fountains\image000001.jpg` is a phone screenshot (UI overlay visible), not a camera original.
- **No `stat` access.** Could not record byte sizes or true file dates for this external drive.
- No encrypted/password-protected/unreadable content was encountered in the extracted tree (the ZIPs themselves were not opened — out of scope for read-only discovery).

## Confirmation: nothing on D:\ was modified

Confirmed. Every operation against `D:\` was read-only — recursive listing, per-extension path enumeration, and opening a few sample images for visual classification. No file or folder on `D:\` was created, modified, moved, renamed, or deleted. The ZIPs were not opened or extracted.

## Open questions to surface to Chat (for M.01b planning)

1. **Extraction strategy for the ~78 Takeout ZIPs.** They are the real corpus. M.01b should plan to extract them to a local C: disk (where Cowork's tools can fully read + `stat` them) before any curation. Confirm there's enough free space first.
2. **Missing ZIP parts.** Parts 002, 010, and 067 are absent from the sequence — are those Takeout parts lost, never downloaded, or stored elsewhere? `-057 (1)` looks like a re-download duplicate to dedupe.
3. **HEIC conversion.** At least 1 HEIC in the extracted tree and very likely many more in the ZIPs (iPhone photos). HEIC isn't web-ready and couldn't even be previewed here — M.01b needs a HEIC→JPG/WebP step.
4. **RAW (NEF) export.** 6 NEF + a `Turf Install` RAW shoot (per the 24 xmp sidecars) need a develop/export-to-JPG step before Sanity.
5. **Exclusions.** Confirm that logos/stock/email-signatures/AI-clips/finished-social-designs are excluded from the real-project portfolio (useful as brand reference only).
6. **Total size.** If a size figure is needed for planning, the user can read it from Explorer → right-click `D:\Sunset Shared Drive` → Properties, or M.01b can measure after extraction.
7. **Client-named subfolders.** `OLD Sunset Hardscaping Photos\Photos from Projects\Scott & Sarah_s\` suggests per-client project folders — likely more exist inside the ZIPs; worth preserving client/project grouping during curation.

## Definition of done — status

Pass. The inventory is detailed enough for Chat to plan M.01b without re-opening the drive; the decision-log entry is in place (with the path-correction note); drive contents are unchanged; and all four state files (`current-state.md`, `file-map.md`, the inventory, this completion report) are written. One honest caveat carried forward: byte sizes and the full ZIP-internal counts are unavailable until M.01b extracts the archives to local disk.
