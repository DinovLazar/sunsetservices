# Phase B-15 Code — Completion Report

**Phase:** B-15 · Code — Wire the Snow Removal stock-bridge images into the service pages + division landing
**Date:** 2026-07-04
**Branch:** built + verified on `feat/b15-code-snow-integration` (off `main`), then **merged to `main` + pushed** per Goran's integration call (see §7 Own decisions)
**Author:** Code

---

## 1. Summary

The 5 free-license Snow Removal bridge photos sourced in B-15-Cowork (`docs/stock-bridge/snow-removal/`) are now optimized and wired into the live image pipeline, following the shipped B-14 pattern exactly. After this phase:

- The 4 Snow Removal service pages (`de-icing`, `sidewalk-shoveling`, `driveway-snow-removal`, `commercial-snow-plowing`) each render a **distinct, accurate hero + tile** — previously three of them shared the identical `snow-removal` placeholder and the fourth shared `commercial-snow-removal`.
- The `/snow-removal/` **division landing** renders a dedicated snow hero (a snowy suburban street) instead of the generic snow-less `commercial` audience photo.
- Every one of the 10 localized snow routes (5 × EN/ES) shows honest, manifest-verbatim alt text (EN) + a drafted ES translation.

Exactly 5 new images shipped; **no previously-shared asset changed a single byte**.

---

## 2. Dependency check (done first)

- **B-15-Cowork present on `main`:** the 5 source JPGs exist under `docs/stock-bridge/snow-removal/` and the manifest's Snow Removal table (B-15) has final alt text for all 5 — no GAP logged, so full scope. (The Cowork commits `c55a2a8` + `06b0783` are on `main` in this checkout.)
- **`sharp`** present (`0.34.5`) — `node_modules` already installed.
- **`.env.local`** already present (public Sanity read config, `projectId i3fawnrl`) — build/dev GROQ client instantiates.
- **Env note (verification only):** Playwright's browser binary was not downloaded in this checkout; ran `npx playwright install chromium` (one-time, downloads `chrome-headless-shell` to the user cache — no repo/package change) so the a11y/links/mobile validators could run. No secrets, no new env vars, no Vercel changes.

**Environment adaptation:** the brief assumed a Windows/PowerShell checkout (`C:\…`); this session ran on macOS/zsh at `/Users/petarjakimov/Projects/SunsetServices`. Same repo; shell commands adapted accordingly.

---

## 3. Recon summary (the resolution paths, confirmed before editing)

1. **Service-detail hero** — `[locale]/[division]/[service]/page.tsx` → `SERVICE_HERO[svc.imageKey ?? svc.slug]` → `ServiceHero`, `alt={photoAlt ?? serviceName}` (B-14 wiring). Dropping the alias makes the 4 snow services resolve by slug.
2. **Division-landing tile grid** — `[division]/page.tsx` → `SERVICE_TILE[s.imageKey ?? s.slug]` → `AudienceServicesGrid`, `alt={s.photoAlt?.[locale] ?? s.name[locale]}`.
3. **Division-landing hero** — `[division]/page.tsx:83` was `const heroPhoto = AUDIENCE_HERO[meta.heroImageKey]` (`DIVISION_META['snow-removal'].heroImageKey = 'commercial'`). This is the hook for the Step-4 override. Its alt originates in **i18n**: `division.<div>.hero.alt` in `src/messages/{en,es}.json`, consumed via `t('hero.alt')`.
4. **City-page service grid** — `LocationServicesGrid` (`/service-areas/<city>/`) is a **third** tile surface (B-14 off-spec discovery): many surfaced cities feature `commercial-snow-plowing`/`driveway-snow-removal` in `featuredServices`, so their grids pick up the new tiles + descriptive alt automatically via the same slug resolution.
5. **Shared-asset consumers left intact:** `hero-snow-removal.jpg` (service dir) still serves `LOCATION_HERO/CARD['st-charles']`; `hero-commercial-snow-removal.jpg` still serves the retired `bolingbrook` entry; the `snow-removal-*`/`commercial-snow-removal-*` project tiles still serve `SERVICE_PROJECT` (the 4 snow services' featured-project rows). The blog/resource "featured images" are independent **public-dir** files (`/images/blog/…`, `/images/resources/…`), not imageMap aliases — regression-safe by construction.

---

## 4. What changed

### Optimizer — `scripts/optimize-stock-bridge.mjs`
- Appended the 4 Snow Removal service slugs to `ITEMS` (resolve via the existing `stock-{division}-{slug}-hero-01.jpg` convention).
- Added a hero-only division-landing item: new optional `heroOut` (custom output path) + `heroOnly` (skip tile) fields → writes `src/assets/division/hero-snow-removal.jpg` (16:9 2400×1350, < 400 KB, no tile). Added `DIVISION_DIR` + its `mkdir`. The loop, logging, and banner now handle the null-tile case; the derive logic is unchanged so B-14 outputs stay byte-identical.

### Assets (5 new sources → 9 files)

| slug | hero | hero q / bytes | tile |
|---|---|---|---|
| de-icing | 2400×1350 | q80 · 247 KB | 1200×900 q80 · 101 KB |
| sidewalk-shoveling | 2400×1350 | q80 · 142 KB | 1200×900 q80 · 63 KB |
| driveway-snow-removal | 2400×1350 | q80 · 316 KB | 1200×900 q80 · 127 KB |
| commercial-snow-plowing | 2400×1350 | q80 · 326 KB | 1200×900 q80 · 111 KB |
| division-landing → `division/hero-snow-removal.jpg` | 2400×1350 | q64 · 367 KB | — (hero only) |

All center crops visually inspected — no key subject cut; **no `heroPosition`/`tilePosition` override needed**. All 5 images are visually distinct.

### `src/data/imageMap.ts`
- 4 hero imports + 4 tile imports + 1 division-hero import.
- 4 slug-keyed `SERVICE_HERO` + 4 `SERVICE_TILE` entries.
- New exported **`DIVISION_HERO: Partial<Record<Division, StaticImageData>>`** = `{ 'snow-removal': divisionHeroSnowRemoval }` with a doc comment (overrides the audience alias). Added `import type {Division} from './services'`.

### `src/data/services.ts`
- The 4 snow services **dropped their `imageKey`** (`'snow-removal'` ×3, `'commercial-snow-removal'` ×1) so they resolve by slug.
- Each gained `photoAlt: {en, es}` — EN verbatim from the manifest, ES a drafted translation (matches the B-14 field shape/placement).

### Division-landing hero override — `src/app/[locale]/[division]/page.tsx`
- Imported `DIVISION_HERO`; changed the resolution to `const heroPhoto = DIVISION_HERO[division] ?? AUDIENCE_HERO[meta.heroImageKey]`. Additive — no `DivisionMeta` type change; the other 4 divisions fall through unchanged.

### Landing-hero alt — `src/messages/{en,es}.json`
- `division.snow-removal.hero.alt` updated from the old aspirational driveway line to the manifest's division-landing alt (EN verbatim) + drafted ES. This is the exact location the landing hero alt originates (i18n `t('hero.alt')`).

### Docs
- `Sunset-Services-Decisions.md` — Step-0 plan-of-record + branch-handling decision (before code).
- `Sunset-Services-TRANSLATION_NOTES.md` — new **§B.15** (5 EN→ES pairs, pending native review; open questions on *quitanieves*/*entrada*/em-dash).
- `docs/stock-bridge/stock-image-manifest.md` — status line → "5 images integrated (B-15 Code)" + change-log entry.
- `src/_project-state/{current-state.md, file-map.md}` — updated; 2027-01-31 replace-by noted; B-15 phase pair closed.

---

## 5. Verification (all green)

- **`npm run build`** — exit 0; **202/202** prerendered; **0 TS errors**; compiled successfully. `npx tsc --noEmit` exit 0. `npm run lint` **0 errors** (9 pre-existing warnings, none in files touched this phase).
- **Asset spec** — all 4 new service heroes + division hero are 16:9 2400×1350 and < 400 KB (142–367 KB); all 4 tiles 4:3 1200×900.
- **Idempotency** — `node scripts/optimize-stock-bridge.mjs` exit 0; **re-run produced byte-identical output** (md5 of all 10 hero + 10 tile derivatives + division hero unchanged across two runs). The **6 pre-existing B-14 derivatives regenerated byte-identical** (md5 vs. pre-phase baseline). Confirmed via `git status`: **no tracked image asset shows as modified** — only 9 new untracked files.
- **10 snow routes — distinct hero + honest alt** (from prerendered HTML, re-confirmed via live DOM on the running prod server):

  | route | hero asset (fingerprinted) | EN alt / ES alt present |
  |---|---|---|
  | `/snow-removal/` | `hero-snow-removal.17bc797p5gsp1.jpg` (division) | ✓ / ✓ |
  | `/snow-removal/de-icing` | `hero-de-icing.…jpg` | ✓ / ✓ |
  | `/snow-removal/sidewalk-shoveling` | `hero-sidewalk-shoveling.…jpg` | ✓ / ✓ |
  | `/snow-removal/driveway-snow-removal` | `hero-driveway-snow-removal.…jpg` | ✓ / ✓ |
  | `/snow-removal/commercial-snow-plowing` | `hero-commercial-snow-plowing.…jpg` | ✓ / ✓ |

  All 5 heroes reference **distinct** assets; EN alts are manifest-verbatim (em-dash preserved on de-icing), ES alts are the drafted translations. Screenshots captured for landing-EN, de-icing-EN, sidewalk-EN, driveway-EN, commercial-EN, landing-ES.
- **Division tile grid** — `/snow-removal/` grid renders all 4 distinct new tiles (`de-icing`, `sidewalk-shoveling`, `driveway-snow-removal`, `commercial-snow-plowing`).
- **City grids (`LocationServicesGrid`)** — spot-checked: `aurora/naperville/oak-brook/lombard` render the new `commercial-snow-plowing` tile; `wheaton/hinsdale/elmhurst/geneva` render the new `driveway-snow-removal` tile — each with the descriptive `photoAlt` (e.g. aurora tile alt = "A plow truck with a front plow blade clearing snow from an open paved area during heavy snowfall."). Old shared snow tiles no longer appear in these grids.
- **Untouched-alias regression** — `st-charles` city hero = `hero-snow-removal.0-7ey._zpvo3w.jpg` (**different fingerprint** from the landing's `hero-snow-removal.17bc797p5gsp1.jpg` = distinct file → old shared service asset unchanged). `bolingbrook` is a **retired, non-surfaced** city (not among the 22 prerendered pages), so it has no live page to regress. Blog (`snow-for-commercial-properties`) + resource (`snow-service-levels-for-pms`) featured images are independent public-dir files — untouched.
- **Other 4 division landings** render their heroes unchanged: `landscape`→`hero-residential`, `hardscape`→`hero-hardscape`, `waterproofing`→`hero-residential`, `trenchless`→`hero-commercial`. Override is snow-only.
- **Validators** (local prod server on `:3000`, `SKIP_REMOTE=1`):
  - `validate:a11y` — **0 errors / 0 warnings** across 22 URLs (axe AA 0, WCAG 2.2 SC 2.4.11/2.5.8 0, Lighthouse a11y ≥97).
  - `validate:links` — crawled 294 pages / 348 internal targets, **0 hard failures**, exit 0 (only the expected `/en → /` 307 redirect warnings per D4).
  - `validate:mobile` — **0 errors** / 963 warnings (all pre-existing site-wide tap-target/consent warnings, unrelated to this change), exit 0.

---

## 6. Screenshots captured

Rendered against the local prod build (`next start`, `:3000`), viewed inline during verification:
1. `/snow-removal/` (EN) — snowy suburban street hero, "Plowed before you're out of bed."
2. `/snow-removal/de-icing` (EN) — rock-salt close-up hero.
3. `/snow-removal/sidewalk-shoveling` (EN) — person shoveling beside a house.
4. `/snow-removal/driveway-snow-removal` (EN) — person running a two-stage snow blower.
5. `/snow-removal/commercial-snow-plowing` (EN) — plow truck clearing snow in a storm.
6. `/es/snow-removal/` (ES) — same street hero with Spanish chrome.

Each confirmed to match its service and its alt text. The 5 optimized source derivatives were also inspected directly before wiring.

---

## 7. Own decisions / notes surfaced (never self-ratified)

- **Branch, not `main`.** The brief said "work directly on `main` … pushed to `main`." The immediately-preceding B-15-**Cowork** decision (same person/day/phase-pair) changed push handling to *a dedicated branch, not pushed — Goran reviews and pushes/merges himself*, and the harness guards against committing on the default branch. Resolved in favor of the newer, more specific signal: all work was built + fully verified on `feat/b15-code-snow-integration`, then surfaced to Chat. **Goran chose to merge to `main` + push** (the brief's literal instruction), so the branch was fast-forwarded into `main` and pushed.
- **Landing-hero alt lives in i18n.** The `/snow-removal/` landing hero alt originates at `division.snow-removal.hero.alt` in `src/messages/{en,es}.json` (consumed via `t('hero.alt')`), so the manifest's division-landing alt was written there (EN verbatim + drafted ES) — following the existing mechanism, no new plumbing. The old aspirational "freshly plowed driveway…" string was replaced because the new hero is a snowy street, not a driveway.
- **No crop overrides.** All 5 center crops keep their key subject (verified visually at hero and tile aspect ratios), so no `heroPosition`/`tilePosition` was set.
- **`DIVISION_HERO` is additive.** A new `Partial<Record<Division, StaticImageData>>` map + a `?? AUDIENCE_HERO[…]` fallback in the one consumer; zero `DivisionMeta` type change; the other four divisions are provably unchanged.
- **Blog/resource featured images are public-dir files, not shared imageMap assets.** The plan-of-record (from the brief) described them as using the shared assets; in fact they are independent `/images/{blog,resources}/…` files. Either way they are untouched by this change. Noted for accuracy.
- **Env (verification):** `npx playwright install chromium` was required for the validators; one-time browser download, no repo/package change.

---

## 8. Definition of Done

- [x] Decisions-log plan-of-record appended + committed before any source change.
- [x] Optimizer extended; runs from repo root; exit 0; idempotent (byte-identical re-run); 6 B-14 derivatives byte-identical.
- [x] 4 hero + 4 tile + 1 division-hero derivatives generated to spec (2400×1350 heroes < 400 KB; 1200×900 tiles), wired via `imageMap.ts`; 4 dead `imageKey` aliases removed.
- [x] `DIVISION_HERO` override wired; the `/snow-removal/` landing uses the new snow hero; other 4 divisions unchanged.
- [x] Manifest EN alt wired verbatim (4 services + landing); ES drafted, wired, logged in TRANSLATION_NOTES §B.15.
- [x] Build exit 0 (202/202, 0 TS); lint 0 errors; tsc 0 errors.
- [x] All 10 snow routes verified (distinct hero + honest alt, EN + ES); division + city tile grids verified; zero regression on shared assets / other divisions.
- [x] `validate:a11y` 0, `validate:links` hard 0, `validate:mobile` 0 errors.
- [x] Doc set updated (decisions, TRANSLATION_NOTES §B.15, manifest, current-state, file-map, this report).
- [x] **Merge/push to `main`** — Goran chose merge-to-main; branch fast-forwarded into `main` + pushed (see §7).
