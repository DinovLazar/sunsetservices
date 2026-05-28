# Phase M.10e (Code) — Completion Report

> Walkthrough bug-fix slice: four user-flagged Preview-walkthrough defects fixed in four independent commits so any one is revertible without disturbing the others. Date: 2026-05-28. Branch: `phase/m10e-walkthrough-fixes` off `origin/main` (M.10d merged).

---

## Fix-by-fix summary

### Fix 1 — Hero text restored behind the rotating carousel

**Symptom:** `/` and `/es/` rendered only the rotating photo — eyebrow, H1, dek, and CTA were invisible.

**Root cause:** Phase M.10c added `HomeHeroCarousel.tsx` as the hero background and used inline `z-index: 3` on the active crossfade layer and `z-index: 2` on the previous layer (the M.10d brightness-dip fix). The carousel's wrapper `<div className="absolute inset-0">` inside `HomeHero.tsx` had no stacking-context-creating property, so those per-frame z-indexes propagated up into the section's `isolate` stacking context. The content stack (`<div className="relative flex-1 ...">`) had no z-index of its own (auto = 0), so the active carousel image (z=3) painted *over* the content. The H1, eyebrow, dek, and CTAs were all in the DOM — they were just visually covered.

**Change:** added `isolate` to the carousel wrapper at `src/components/sections/home/HomeHero.tsx:50`. That single class contains the carousel's z-indexes inside their own stacking context; the wrapper itself stays at z-index auto, so source order wins and the (later-in-source) content stack paints on top. No JSX restructure, no z-index added to the content stack, no impact on LCP priority (`priority + fetchPriority="high"` on the first image preserved) or reduced-motion behavior (M.10c §5 still freezes the carousel to image 0 on `useReducedMotion()`).

**Files changed:** `src/components/sections/home/HomeHero.tsx` (one class + 12-line explanatory comment).

### Fix 2 — Sunset-mark favicon set

**Symptom:** Browser tabs showed a generic icon instead of the brand mark.

**What shipped:**
- `src/app/icon.png` — 512×512, transparent. Next App Router emits `<link rel="icon" href="/icon.png">` automatically.
- `src/app/apple-icon.png` — 180×180, **opaque cream-tinted background** (iOS deliberately ignores PNG alpha on `apple-touch-icon`; cream matches `--color-bg` so the mark sits inside the rounded-tile shape iOS applies).
- `src/app/favicon.ico` — multi-size **16/32/48** ICO with PNG-encoded payloads (modern Vista+ format, manually written ICONDIR + entries so we don't add a `png-to-ico` dev dependency).
- `scripts/build-favicons.mjs` — committed generator. Re-runnable if the source logo is refreshed.

**Source:** `src/assets/brand/logo-horizontal-fullcolor.png` (2000×537). The leftmost 537×537 square contained the start of the orange "S" wordmark; a pixel column-scan established the circular mark ends at x=485 (largest transparent gap at x∈[486,508], first majority-orange column at x=523). The generator extracts leftmost **486×537**, trims transparent padding, re-pads to a square (507×507), then resizes per output. This tight crop drops the wordmark fragment that was visible in a naive square crop.

**Wiring:** zero `metadata.icons` field is set anywhere — the locale layout (`src/app/[locale]/layout.tsx`) has no `icons` block, so Next's file-convention is the single source of truth. `metadataBase` (B.05) makes the icon URLs absolute when emitted.

**Verification (localhost):**
- `/favicon.ico` → 200, `image/x-icon`, multi-size ICO content
- `/icon.png` → 200, `image/png`, 512×512
- `/apple-icon.png` → 200, `image/png`, 180×180
- Rendered `<head>` includes all three `<link>` tags Next emits.

**Files changed:** `src/app/favicon.ico` (replaced), `src/app/icon.png` (new), `src/app/apple-icon.png` (new), `scripts/build-favicons.mjs` (new).

### Fix 3 — About / homepage "Recent work" cards → live Sanity slugs

**Symptom:** Every card on the `/about/` "Recent work" grid (also rendered on `/` because About reuses `HomeProjects` verbatim per Phase 1.12 §3.6) 404'd. Card slugs hard-coded against the Phase 1.16 12-row seed (`naperville-hilltop-terrace`, `wheaton-lawn-reset`, `aurora-hoa-curb-refresh`, `naperville-fire-court`, `lisle-retaining-wall`, `batavia-garden-reset`) no longer exist after the M.01c / M.10d Sanity portfolio migration.

**Live Sanity slugs queried at fix-write time** (10 total; ordered by `getAllProjects()` GROQ `order(year desc, slug asc)` and capped to the first 6 the band renders):

| Slug | Audience | Service slug | Year |
| --- | --- | --- | --- |
| `1227-colchester-lane-aurora` | residential | patios-walkways | (null) |
| `6135-belmont-downers-grove` | residential | driveways | (null) |
| `aurora-area-paver-patio-firepit` | hardscape | patios-walkways | 2026 |
| `oswego-landscape-design-install` | residential | landscape-design | 2026 |
| `tree-removal-service` | residential | tree-services | 2026 |
| `1008-homerton-north-aurora` | residential | patios-walkways | 2025 |
| `807-edgewater-drive` | residential | patios-walkways + … | 2025 |
| `811-edgewater-drive` | residential | patios-walkways + … | 2025 |
| `aurora-area-patio` | residential | patios-walkways | 2025 |
| `scott-and-sarahs` | residential | patios-walkways + … | 2024 |

`null` years sort last under `year desc` (the adapter maps `null` → 0), so the first 6 today are: `1227-colchester-lane-aurora`, `6135-belmont-downers-grove`, `1008-homerton-north-aurora`, `807-edgewater-drive`, `811-edgewater-drive`, `aurora-area-patio`. All verified HTTP 200 on localhost.

**Change:** `src/components/sections/home/HomeProjects.tsx` rewritten to drive off Sanity. Same data flow as `/projects` index (`getAllProjects()` → `sanityProjectSummaryToTs` adapter), then `.slice(0, MAX_TILES = 6)`. Lead photo prefers the Sanity CDN URL (`p.leadImageUrl`) with `imageMap.PROJECT_LEAD` as defensive fallback; any project with neither is dropped rather than rendered as an empty 4:3 box; section returns `null` if zero real projects exist. Division badge via `getProjectDivision()` (matches `/projects` index labels). Title passes through `stripStreetNumber()` (matches `/projects` index). Locale resolves via `getLocale()` from `next-intl/server` so the bilingual `title` / `leadAlt` strings render in the active language.

**Files changed:** `src/components/sections/home/HomeProjects.tsx` (full rewrite; removed 6 stale `src/assets/home/project-*-*.jpg` imports and the i18n-driven placeholder tile copy lookups).

**i18n note:** the `home.projects.tile.*` and `home.projects.alt.*` placeholder keys are now unused. Left in `messages/{en,es}.json` as harmless orphans for a future copy-cleanup pass — no build impact.

### Fix 4 — OG/Twitter card verification + three closure items

**Audit covered:** `/`, `/landscape`, `/hardscape`, `/waterproofing`, `/snow-removal`, `/landscape/landscape-design` (representative service detail), `/projects`, `/projects/aurora-area-paver-patio-firepit`, `/blog`, `/blog/dupage-patio-cost-2026`, `/resources`, `/resources/patio-materials-guide`, `/about`, `/contact`. All 14 emit a complete absolute `openGraph` + `twitter` block (title, description, url, siteName, locale, image with width/height/alt, type, twitter:card=summary_large_image). 14/14 pages had all required fields except three closure items below.

**Closure items shipped in this commit:**

1. **`/og/fallback` Sunset mark was invisible.** The card rendered with correct palette (charcoal + amber rail + cream + green pill) but the top-left logo slot was blank. Root cause: `next/og`'s Satori renderer does **not** resolve `width: 'auto'` from a `data:` image's intrinsic dimensions the way a browser does — it collapses to 0 width. The img was shipping at `0×64` and was invisible. Pinned to explicit `width: 320, height: 86` matching the source logo's 3.75:1 ratio. (The text fallback branch — used when the logo file is missing — was rendering fine; verified by temporarily moving the logo file aside.)

2. **`public/og/logo-horizontal-white.png` was a partially-transparent gray asset** (mean RGB ≈ 86, mean alpha ≈ 65). Even with Fix 4.1 applied, the OG card would have shown a dim gray smudge. Regenerated from `src/assets/brand/logo-horizontal-fullcolor.png` via sharp: every opaque source pixel → white (R=G=B=255), original alpha preserved for clean anti-aliased edges. Now reads as a crisp white mark on the charcoal canvas.

3. **Blog & resource detail `og:image:alt` was missing.** Both pages pass `alt: post.featuredImageAlt?.[loc] ?? post.title[loc]` to `buildSocialMetadata`. The Sanity GROQ projection coalesces a missing bilingual `featuredImageAlt` to `""` (not `null`), so `??` does not fall through and `alt: ""` is passed. Next.js then omits the `og:image:alt` tag. Switched both call sites to `||` so an empty string falls through to the post / entry title. Verified: blog post now renders `og:image:alt="How Much Does a Patio Cost in DuPage County in 2026?"`; resource renders `og:image:alt="Patio Materials Guide: Concrete vs. Pavers vs. Natural Stone"`.

**`/og/fallback` palette confirmed:** green-primary (`#2F5D27` badge) + amber accent (`#E8A33D` rail + dot) + charcoal (`#0E0E0E` bg) + cream (`#FAF7F1` text). NOT the BG-01 orange brand-guide palette (Phase M.10d locked decision). Carries the Sunset wordmark + circular mark.

**Dynamic OG image endpoints verified:** `/og/blog/<slug>/?locale=en` and `/og/resource/<slug>/?locale=en` both return 200, content-type `image/png`, dimensions 1200×630.

**Project-detail OG image dimensions caveat:** the project detail emits the Sanity-CDN lead-photo URL (e.g. 4032×3024 source) but declares `og:image:width=1200, og:image:height=630` in metadata. This is a Phase M.10d-locked design — the dimensions advertise the OG-spec recommended size while the actual asset is whatever the project carries. Twitter/Facebook scrapers handle the mismatch by resizing on their end. If a more strict per-project 1200×630 variant is wanted, it's an M.11+ enhancement (auto-crop on the OG route) — out of scope here.

**Files changed:** `src/app/og/fallback/route.tsx` (img dimensions), `public/og/logo-horizontal-white.png` (regenerated), `src/app/[locale]/blog/[slug]/page.tsx` (`??` → `||`), `src/app/[locale]/resources/[slug]/page.tsx` (`??` → `||`).

---

## Decisions surfaced

In-phase locked decisions noted here; full text logged in `Sunset-Services-Decisions.md` 2026-05-28.

- **M.10e-D1 (Fix 1) — `isolate` over `z-index` on content.** Two ways to contain the leak: (a) add `isolate` to the carousel wrapper so its z-indexes don't bubble up, or (b) give the content stack `z-index: 10`. (a) chosen because it's a single class on the offending element with no impact on other surfaces; (b) would have required understanding why the content needed an explicit z-index when nothing else in the design system relies on positive z-indexes on content.
- **M.10e-D2 (Fix 2) — square crop from pixel scan, not fixed leftmost-square.** Naive leftmost-537×537 included the leading "S". Column scan established the circular mark's right edge at x=485, allowing a tight 486×537 crop that excludes any wordmark fragment. Constants in the generator are commented so a future logo refresh can re-derive the bounds.
- **M.10e-D3 (Fix 2) — cream-tinted apple-touch-icon, not transparent.** iOS ignores PNG alpha on `apple-touch-icon`. Cream backdrop matches `--color-bg` so the mark sits inside the rounded-tile shape iOS applies, rather than relying on iOS's system fallback (black on dark mode, white on light).
- **M.10e-D4 (Fix 3) — drop tiles without a usable photo rather than padding.** If a future Sanity project lacks both a `leadImage` asset and a `PROJECT_LEAD[slug]` placeholder, the tile is silently omitted. Better than rendering an empty 4:3 fallback box; pads-with-empty-tiles felt worse than rendering fewer-than-six tiles.
- **M.10e-D5 (Fix 3) — placeholder i18n strings left as orphans.** `home.projects.tile.*` and `home.projects.alt.*` are unused by the new HomeProjects but staying in the messages files. A copy-cleanup pass can delete them later; for now they're harmless and removing them adds churn for two locales × six keys × two namespaces.
- **M.10e-D6 (Fix 4) — `||` not `??` for Sanity-coalesced fallbacks.** Established here for blog + resource alt; flagged so future call sites against GROQ-coalesced fields don't repeat the mistake.

---

## Verification

### Localhost (port 3000)

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | exit 0 (clean) |
| `npx eslint` on M.10e-touched files | 0 errors, 0 warnings (after the chore lint-cleanup commit on `scripts/build-favicons.mjs`) |
| `npm run build` | success — `apple-icon.png` and `icon.png` ship as static, OG `/fallback` ships as dynamic ƒ |
| `npm run validate:schema` | **22/22 PASS, 0 errors** (matches M.10c baseline) |
| `npm run validate:seo` | **170/174 PASS, 4 errors** — all on `/projects/aurora-driveway-apron` (pre-existing, M.10c-noted, harness config drift) |
| `npm run validate:a11y` | **19/20 PASS, 0 axe AA violations, 0 best-practice, 0 SC 2.4.11, 0 SC 2.5.8, all Lighthouse a11y ≥ 97 (most 100)** — sole error is the pre-existing `aurora-driveway-apron` 404 |
| Fix 1 — `id="home-hero-h1"` present in `/` HTML | "Build your outdoor legacy" rendered |
| Fix 1 — `id="home-hero-h1"` present in `/es/` HTML | "Construye tu legado al aire libre" rendered |
| Fix 1 — `class="absolute inset-0 isolate"` on carousel wrapper | Present in rendered HTML |
| Fix 2 — `<link rel="icon" href="/favicon.ico" ...>` | Rendered in `<head>` |
| Fix 2 — `<link rel="icon" href="/icon.png" sizes="512x512" type="image/png">` | Rendered in `<head>` |
| Fix 2 — `<link rel="apple-touch-icon" href="/apple-icon.png" ...>` | Rendered in `<head>` |
| Fix 3 — All 6 homepage card hrefs return HTTP 200 | `1227-colchester-lane-aurora`, `6135-belmont-downers-grove`, `1008-homerton-north-aurora`, `807-edgewater-drive`, `811-edgewater-drive`, `aurora-area-patio` — all 200 |
| Fix 3 — About page hrefs identical to homepage | Identical (component reused verbatim) |
| Fix 4 — OG/Twitter complete on all 14 audited pages | All required fields emit absolute URLs |
| Fix 4 — Blog post `og:image:alt` | Renders post title |
| Fix 4 — Resource detail `og:image:alt` | Renders entry title |
| Fix 4 — `/og/fallback` returns 1200×630 PNG with Sunset mark | Verified visually + via `file` |
| Fix 4 — `/og/blog/<slug>/?locale=en` returns 1200×630 PNG | Verified |
| Fix 4 — `/og/resource/<slug>/?locale=en` returns 1200×630 PNG | Verified |

### Vercel Preview

Pending — will repeat the harness + visual passes against the Preview URL after push.

---

## Files written / updated

### New
- `scripts/build-favicons.mjs` — favicon generator.
- `src/app/icon.png` — 512×512 transparent.
- `src/app/apple-icon.png` — 180×180 cream-opaque.

### Replaced
- `src/app/favicon.ico` — Sunset-mark 16/32/48 ICO (was Next default).
- `public/og/logo-horizontal-white.png` — clean white-on-transparent regenerated from `src/assets/brand/logo-horizontal-fullcolor.png`.

### Modified (component code)
- `src/components/sections/home/HomeHero.tsx` — `isolate` on carousel wrapper.
- `src/components/sections/home/HomeProjects.tsx` — Sanity-driven (full rewrite).
- `src/app/og/fallback/route.tsx` — explicit logo `width/height` to bypass Satori `auto` collapse.
- `src/app/[locale]/blog/[slug]/page.tsx` — `??` → `||` on `og:image:alt`.
- `src/app/[locale]/resources/[slug]/page.tsx` — `??` → `||` on `og:image:alt`.

### State + decisions docs
- `src/_project-state/Phase-M-10e-Completion.md` — this file.
- `src/_project-state/current-state.md` — last-completed phase → M.10e; new "What works" bullets.
- `src/_project-state/file-map.md` — new favicon assets + generator script noted.
- `Sunset-Services-Decisions.md` — 2026-05-28 entry covering D1–D6 + the three Fix 4 closure items.

---

## Out of scope (untouched per plan)

- All `service-areas/<city>/` placeholder project cards (Lombard, etc.).
- The "review coming soon" testimonial placeholder.
- Pre-existing `/projects/aurora-driveway-apron` 404 (M.10c-known harness drift).
- Project-detail OG image's 1200×630 declared dimensions vs the actual Sanity-asset size (M.10d-locked design).

---

## Carryover for the user (NOT a Code task)

**The reason link previews don't appear when sharing `sunsetservices.vercel.app` is Vercel Deployment Protection** on the `sunsetservices` project — external scrapers (Twitter, Facebook, LinkedIn) hit the SSO login wall before they can read the OG card. To make shared Preview links render their card, Goran (or Cowork) flips the dashboard toggle:

**Vercel dashboard → Project `sunsetservices` → Settings → Deployment Protection → set Vercel Authentication to "Disabled" (or specifically allow access on the Production deployment)** — then re-share the link.

Note: turning this off makes the `sunsetservices.vercel.app` URL **publicly viewable**. Intended for pre-launch sharing of the soft-launch site. Verified in this phase: every audited page emits a complete absolute `openGraph` + `twitter` block with a valid 1200×630 image, so once protection is off the cards will render correctly with no further code change.

---

## Definition of done — checklist

- [x] Fix 1 — hero text renders over the carousel; LCP / reduced-motion unchanged
- [x] Fix 2 — `/favicon.ico`, `/icon.png`, `/apple-icon.png` all 200; rendered `<head>` references them; tab shows Sunset mark
- [x] Fix 3 — every recent-work card on `/about/` and `/` returns 200; no fabricated projects; uses real Sanity data
- [x] Fix 4 — every audited page emits complete absolute OG + Twitter; `og:image` URLs return 200 / image/png / 1200×630; OG fallback carries Sunset mark in live-site palette
- [x] Lombard + other city placeholders + "review coming soon" untouched
- [x] `validate:schema` exits 0
- [x] `validate:seo` shows only the pre-existing `aurora-driveway-apron` 4 errors
- [x] `tsc --noEmit` clean
- [x] Targeted lint clean
- [x] `npm run build` succeeds
- [x] `validate:a11y` matches M.10c baseline — 19/20 PASS, 0 axe AA, 0 SC 2.4.11/2.5.8, all Lighthouse a11y ≥ 97
- [ ] Vercel Preview re-verification — pending push
- [ ] Branch merged into `main` — pending Preview verification
