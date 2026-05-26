# Phase M.01c — Completion Report

**One-line summary:** Real Sunset Services photography converted, developed, curated, and UPLOADED to Sanity (7 real projects + team + brand, 12 placeholders removed) via a local script; YouTube turf uploads + drone clips + Erick contact deferred to the user by decision.

**Dates:** 2026-05-26
**Status:** Local processing + curation + Sanity upload COMPLETE (committed to production dataset `i3fawnrl/production` on 2026-05-26). YouTube upload, drone-clip upload, city confirmations, and live-preview spot-check remain PENDING (require user action / external access).

**Sanity upload result (committed):** 53 images uploaded; 7 project docs created (`project-1008-homerton-north-aurora`, `-807-edgewater-drive`, `-811-edgewater-drive`, `-6135-belmont-downers-grove`, `-1227-colchester-lane-aurora`, `-scott-and-sarahs`, `-aurora-area-patio`); 4 team docs + 8 brand logo assets; all 12 Phase-1.16 placeholder projects deleted. Run was idempotent (Sanity content-addresses assets, projects use deterministic IDs). One corrupt curated file (`811-edgewater-07.jpg`, truncated during curation copy) was detected on the first commit attempt, replaced from source, and the script hardened to skip-not-crash on a bad image; all 57 curated files re-verified intact before the successful re-run.

---

## Headline numbers

| Item | Result |
|---|---|
| Corpus verified | 2,786 files / 150.91 GB — matches M.01b |
| HEIC converted | 204/204 → JPG (q90) + WebP (q85); EXIF date on 195 |
| Orphan RAWs developed | 106 (curated coarse pass); ~521 deferred per time-budget rule; 0 errors |
| Project photos curated | 45 across 7 projects |
| Team / Brand | 4 team photos, 8 brand logos |
| Video manifest | 32 entries (26 turf → YouTube, 6 drone → Sanity) |

Output location: `C:\sunset-photos\processed\` (project buckets, team, brand, contact sheet, `sanity-upload-plan.json`). Video manifest at `C:\sunset-photos\video-manifest.json`.

---

## Surprises / corrections to the phase plan

1. **Vendor turf set was miscounted.** Plan said "~142 .mov files"; the `refsproductions` folder actually holds **28 files, all .MP4** (~14.5 GB). The ~160 .mov in the inventory were mostly Premiere render-cache fragments inside the dropped `.PRV` folder. Manifest built for 26 turf clips.
2. **807 and 811 Edgewater each have dedicated edited photos** (12 and 60) in `EditedPhotos`, so the split is clean — kept as two separate projects.
3. **6135 Belmont and 1227 Colchester have NO still photos** — only video. Project imagery was produced by extracting sharp frames from the job videos (noted in the upload plan; frames are slightly softer than camera stills).
4. **Sanity API is unreachable from the Cowork sandbox** (network egress is locked, including via proxy). Programmatic upload from Cowork is impossible. Resolved by writing `scripts/upload-m01c-photos.mjs`, which the user runs locally where the `SANITY_API_WRITE_TOKEN` and network work.
5. **No `downers-grove` or `north-aurora` location docs exist** in `src/data/locations.ts`. Belmont (Downers Grove) and 1008 Homerton (North Aurora) will not auto-link a city reference until those locations are added or remapped.

---

## Decisions taken in-phase (also appended to Sunset-Services-Decisions.md)

- Turf video set corrected to 26 MP4s, not 142 .mov.
- 807 and 811 Edgewater published as two separate projects.
- Belmont and Colchester project imagery sourced from video-frame extraction.
- Unknown Address published as "Aurora-area patio" (slug `aurora-area-patio`); Erick NOT contacted (user will follow up if needed).
- RAW development capped at a curated 106 (folders feeding real buckets) per the plan's "quality over coverage" rule; ~521 orphan RAWs left undeveloped.
- `locations.ts` per-city `projectsCompleted` figures left UNCHANGED — they reflect a 25-year business and cannot be honestly re-derived from a photo sample. Flagged for Erick to supply real counts.

---

## Open items (blocked on user / external access)

- [x] Run `node scripts/upload-m01c-photos.mjs --commit` — DONE 2026-05-26 (7 projects + team + brand uploaded, 12 placeholders removed).
- [ ] Upload 26 turf MP4s to a Sunset Services YouTube channel; fill `url` fields in `video-manifest.json`.
- [ ] Compress + upload 6 drone clips to Sanity (each >100 MB; H.264 1080p).
- [ ] Confirm correct city for 807/811 Edgewater and Scott & Sarah's (marked NEEDS-CONFIRM in the upload plan).
- [ ] Add `downers-grove` / `north-aurora` locations or remap, so Belmont/Homerton link a city.
- [ ] Provide real per-city project counts if `locations.ts` stats are to be updated.
- [ ] Spot-check the Vercel preview after upload (home + one project + one service + one location).

---

## Files written this phase

- `C:\sunset-photos\processed\` — curated photos (projects/team/brand), `sanity-upload-plan.json`, `heic-converted/`, `raw-developed/`, `_curation_contact_sheet.png`
- `C:\sunset-photos\video-manifest.json`
- `scripts/upload-m01c-photos.mjs` (this repo)
- `src/_project-state/Phase-M-01c-Completion.md` (this file)
