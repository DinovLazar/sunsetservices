# Phase M.01c — Completion Report (FINAL)

**One-line summary:** Erick's 25-year photo corpus was converted, developed, curated, and uploaded to Sanity (7 real project pages, team, brand); the front-end was then wired to render Sanity images, every placeholder image across the site was replaced with real Sunset Services photography (unique per page), the section heroes were brightened, and the real Sunset + Unilock logos were put in place. Net result: the Vercel site now shows real work everywhere except the three named team portraits and the (manual) YouTube video uploads.

**Dates:** 2026-05-26
**Status:** COMPLETE. Image curation, Sanity upload, front-end rendering, site-wide photo rollout, hero brightening, and logos are all live on `main` / Vercel production. Remaining items are external (YouTube uploads, drone clips, a few content confirmations) and are listed at the end.

---

## Headline numbers

| Item | Result |
|---|---|
| Corpus verified | 2,786 files / 150.91 GB — matches M.01b |
| HEIC converted | 204/204 → JPG (q90) + WebP (q85); EXIF date on 195 |
| Orphan RAWs developed | 106 (curated coarse pass); ~521 deferred per time-budget rule; 0 errors |
| Project photos curated | 45 across 7 projects |
| Sanity docs created | 7 projects + 4 team + 8 brand assets; 12 placeholder projects deleted |
| Site image slots filled | 100 `src/assets` slots with real photos (unique per page) |
| Logos replaced | Sunset horizontal logo (navbar + footer) + Unilock badge (4 surfaces) |
| Video manifest | 32 entries (26 turf → YouTube, 6 drone → Sanity) |

Working outputs live at `C:\sunset-photos\processed\` and `C:\sunset-photos\video-manifest.json` (outside the repo, per the M.01b working-area convention).

---

## What was done, in order

1. **Verified the corpus** against M.01b (2,786 files / 150.91 GB) and located every named project, team, and brand folder.
2. **Converted 204 HEIC** → JPG + WebP (orientation baked in, EXIF dates preserved) and **developed 106 orphan RAWs** to sRGB JPGs — all in the Cowork Linux sandbox via `pillow-heif` and `rawpy` (LibRaw).
3. **Curated 45 project photos** + 4 team + 8 brand logos using automated sharpness scoring + perceptual-hash dedupe, into `processed/`.
4. **Built the upload package**: `sanity-upload-plan.json` (per-photo alt text, tags, bilingual project descriptions) and `video-manifest.json`.
5. **Uploaded to Sanity** via `scripts/upload-m01c-photos.mjs` (run locally — the Sanity API is unreachable from the sandbox): 7 real project docs created, 4 team + 8 brand assets uploaded, 12 Phase-1.16 placeholder projects deleted. Idempotent (content-addressed assets + deterministic doc IDs).
6. **Wired the front-end to Sanity images** — the project pages previously discarded the Sanity image fields and fell back to a local placeholder map. Updated `sanity-adapters.ts` (resolve `leadImage`/`gallery`/before-after via `urlFor()`), widened the image prop types to accept URL strings, added `cdn.sanity.io` to `next.config.ts` `images.remotePatterns`, and updated the project grid + detail components. Project pages now render real Sanity photography.
7. **Replaced every placeholder image site-wide** — home, audience ("division") pages, all service pages, and the location pages (which alias the audience imagery) pulled generic placeholders from `src/assets` via `imageMap.ts`. Replaced **100** of those files with category-appropriate real photos, drawing from the curated projects, developed RAWs, and the EditedPhotos/HEIC pools. **Every slot uses a globally unique source photo**, so no image repeats on any page. Gap categories with no corpus match (snow, sprinkler, seasonal cleanup, commercial-snow, commercial audience) were filled with good-enough finished-work photos.
8. **Brightened the section heroes** — reduced the dark gradient overlay in `AudienceHero.tsx` and `ServiceHero.tsx` and routed bright, finished photos to the hero slots (the residential hero had picked a dull gravel/excavation shot).
9. **Real logos** — replaced the placeholder SVG brand mark in `Logo.tsx` with the real horizontal Sunset Services logo (full-color transparent in the light navbar, white in the dark footer), and replaced the Unilock "Authorized Contractor" placeholder with the real badge in the footer, home social-proof strip, About credentials, and hardscape audience band (the last three via the shared `ServiceIcon`). Fixed a follow-up where the first navbar logo file was a flattened dark-background export — swapped to the transparent full-color version.

---

## Surprises / corrections to the phase plan

1. **Vendor turf set miscount.** Plan said "~142 .mov"; the `refsproductions` set is actually 28 `.MP4` (~14.5 GB). The ~160 .mov in the M.01b inventory were Premiere render-cache fragments in the dropped `.PRV` folder. Manifest built for 26 turf clips.
2. **807 and 811 Edgewater** each have their own edited-photo sets (12 and 60), so they were kept as two clean separate projects.
3. **6135 Belmont and 1227 Colchester had no still photos** — only video. Project stills were extracted as sharp frames from the job videos.
4. **Sanity API unreachable from the sandbox** (egress locked). Upload was packaged as a local one-command script run by the user.
5. **No `downers-grove` / `north-aurora` location docs** exist, so Belmont and Homerton don't auto-link a city yet.
6. **Project image rendering was never wired to Sanity** — the codebase explicitly deferred it ("Phase 2.04"); this phase implemented it.
7. **The site's non-project pages render images from local `src/assets` files**, not Sanity (by design) — so the rollout there was a file-swap, not a CMS change.

---

## Decisions taken in-phase (also in Sunset-Services-Decisions.md)

- Turf set corrected to 26 MP4s.
- 807 vs 811 Edgewater = two projects.
- Belmont/Colchester imagery from video-frame extraction.
- Unknown Address → "Aurora-area patio" (`aurora-area-patio`); Erick not contacted.
- Orphan RAW development capped at a curated 106.
- `locations.ts` per-city `projectsCompleted` left UNCHANGED (reflect a 25-year business; not derivable from a photo sample — flagged for Erick).
- Gap image categories (snow, sprinkler, seasonal cleanup, commercial) filled with good-enough real photos rather than left as placeholders, per user direction; team portraits intentionally left as placeholders (no per-person ID).

---

## Commits (on `main`)

- `chore(state): Phase M.01c — real photos curated and uploaded to Sanity` (state docs + upload script)
- `feat(projects): render real project photos from Sanity leadImage/gallery/before-after`
- `feat(content): real Sunset Services photography across home, audience, service and location pages`
- `feat(content): fill all remaining image slots with unique real photos; brighten section heroes`
- `feat(content): real Sunset + Unilock logos; finish image rollout; brighten heroes`
- `fix(brand): use transparent full-color logo in navbar (was flattened dark version)`
- `chore(state): Phase M.01c FINAL completion report` (this file)

---

## Still open (external / user action)

- [ ] Upload the 26 turf MP4s to a Sunset Services YouTube channel; fill `url` fields in `C:\sunset-photos\video-manifest.json` (titles/descriptions/tags already written).
- [ ] Compress + upload the 6 drone clips to Sanity (each >100 MB → H.264 1080p).
- [ ] Provide the three named team portraits (Erick / Nick / Marcin) — intentionally left as placeholders.
- [ ] Confirm the city for 807/811 Edgewater and Scott & Sarah's (marked NEEDS-CONFIRM in `sanity-upload-plan.json`).
- [ ] Optionally add `downers-grove` / `north-aurora` location docs so Belmont/Homerton link a city.
- [ ] Provide real per-city project counts if `locations.ts` stats should change.
- [ ] When Erick shoots true snow / sprinkler / seasonal-cleanup / commercial work, swap those `src/assets` slots from the good-enough fills to exact-match photos.

---

## Definition of done — met

- Every page that displays a photo shows a real Sunset Services photo (project pages from Sanity; all other pages from real `src/assets` photography), with no green placeholders remaining except the three team portraits and the YouTube video slot.
- 7 real project documents live in Sanity; 12 placeholders removed.
- Real Sunset + Unilock logos in place.
- Video manifest ready for the follow-up embed phase.
- Completion report, decisions log, current-state, and file-map updated.
