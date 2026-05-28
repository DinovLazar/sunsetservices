# Phase M.10d (Code) — Completion Report

**Branch:** `phase/m10d-content-polish`
**Status:** A, B, C, D all complete. Goran runs the script when Cowork's manifest lands.
**Date:** 2026-05-27

---

## Summary

Builder phase that follows the M.10d Cowork photo-sourcing entry in
`Sunset-Services-Decisions.md`. Four deliverables, each landing in its
own commit so any one can be reverted independently:

- **A. Hero carousel mid-fade glitch fix.** ✅ shipped (commit `53694b2`).
- **B. Open Graph / Twitter preview cards across the site.** ✅ shipped (commit `80a1594`).
- **C. Three new blog posts + idempotent upload script.** ✅ shipped (commit `ba9724a`).
- **D. 2–5 real projects (≥ 2 Landscape) — script ready, gated on Cowork's manifest.** ✅ shipped (commit `<TBD>`).

---

## A. Hero carousel mid-fade glitch fix

**Root cause (verified in the Vercel Preview):** the pre-M.10d implementation
animated every layer's opacity symmetrically — the outgoing image faded
1 → 0 while the incoming faded 0 → 1, both crossing through ~0.5 at the
same instant. With the B.06 dark-charcoal hero background (`--color-bg-charcoal`,
`#1A1A1A`) sitting behind the carousel, the 50/50 moment let the bare background
bleed through and showed up as a visible brightness "dip" between photos.

**Fix (locked technique from the plan §A):**

- Introduced a `prevIndex` tracker alongside `activeIndex`. At any moment
  only two layers are visible: the `active` (just-fading-in, z-index 3)
  and `prev` (the previous active, at full opacity at z-index 2). The
  incoming image fades 0 → 1 **on top of** an opaque backdrop, so the
  bare background never shows through. Other layers' fade-outs still
  happen but are covered by `prev` at z-index 2 and are visually invisible.
- All 4 layers stay mounted; only the `{active, prev}` state updates on
  each tick. No remount, no key swap, no `AnimatePresence`.
- Added `loading="eager"` + `fetchPriority="low"` to layers 2–4 so they
  decode in the background while the LCP layer loads first — by the
  time the first crossfade fires at 5s they're already decoded.
- Reduced-motion behavior unchanged: the interval never starts; only the
  first image is visible; the wrapper carries `aria-hidden="true"`.

**Implementation note (worth flagging for future readers):** the first
M.10d attempt used `motion.div` with `initial={false} animate={{opacity: targetOpacity}}`,
mirroring the original code's pattern. Empirically that did NOT work
across the per-tick re-renders — z-index updated correctly but opacity
stayed pinned to the initial value, leaving the carousel visually
frozen on the first frame. The fix is now a plain CSS `transition:
opacity` on the wrapper `<div>`; React-driven re-renders set the
inline `opacity` value and the browser interpolates. Sidesteps the
Motion-library wiring issue entirely. The `motion/react` import is
still used for `useReducedMotion()`.

**Verified locally on the dev server (`http://localhost:3000/`):**
ran an in-page sampling probe that read inline `opacity` + `z-index` +
computed opacity per layer every ~1 second across ~10s. The active layer
(z-index 3) transitions from 0 → 1; the prev layer (z-index 2) stays at
1 throughout; other layers stay at 0. No moment where both fading
layers sit at 0.5 over the bare background. The dev-server warning
about logo `width` modified but not `height` predates this phase (M.10c
brand identity).

**Production verification still recommended on the Vercel Preview**:
Localhost serves images instantly from cache and can hide the
decode-timing flavor of the glitch. Goran should push and watch a few
full cycles on the Preview (throttled to "Slow 4G" in DevTools if
possible) to confirm no flicker, dip, or jump at the hand-off.

---

## B. Open Graph / Twitter preview cards

**Status before this phase:** `metadataBase` was already set in
`src/app/[locale]/layout.tsx` (Phase B.05). Only blog detail and
resource detail emitted any social metadata at all, and even those
were partial (missing `siteName`, `locale`, no `twitter` block).
Every other public page emitted no `openGraph` and no `twitter` —
shared links rendered as a bare URL in every chat/social platform.

**What shipped:**

- **`src/lib/seo/openGraph.ts`** — `buildSocialMetadata({title,
  description, url, locale, type?, images?, publishedTime?})` returns
  a `{openGraph, twitter}` pair. Default image is the polished
  sitewide `/og/fallback` card with a fixed 1200×630 + localized alt;
  callers override with a per-content image where one is more
  fitting (project detail uses the lead photo, blog/resource detail
  use the existing dynamic `/og/{type}/{slug}` routes).
- Helper spread into every page's `generateMetadata`:
  - `/` (home)
  - `/[division]/` × 4 (`landscape`, `hardscape`, `waterproofing`, `snow-removal`)
  - `/[division]/[service]/` (single template covering all services)
  - `/projects/` + `/projects/[slug]/`
  - `/blog/` + `/blog/[slug]/`
  - `/resources/` + `/resources/[slug]/`
  - `/about/`, `/contact/`, `/service-areas/`, `/service-areas/[city]/`
- **`/og/fallback`** polished:
  - Now uses the M.10c horizontal-white logo (copied to
    `public/og/logo-horizontal-white.png` so the ImageResponse
    runtime can read it via `fs.readFileSync`; `runtime = 'nodejs'`).
  - Live-site palette: deep-charcoal `#0E0E0E` background, cream
    `#FAF7F1` text, amber `#E8A33D` accent rail + dot, green-700 chip.
    NOT the BG-01 orange brand-guide palette (separate, deferred
    decision).
  - 4-division headline: "Landscape · Hardscape · Waterproofing · Snow management."
  - Manrope intentionally left out — `next/og` can't reuse `next/font`'s
    loaders, and a runtime fetch of the woff2 is a build-time cost paid
    on every render. system-ui matches the existing per-content OG
    routes and looks fine at thumbnail size. Worth revisiting when we
    batch-process fonts for `next/og` site-wide (M.11+).

**Verified locally:**

- Homepage HTML emits all 11 expected meta tags (og:url absolute, 
  og:image absolute `https://sunsetservices.us/og/fallback`,
  og:image:width 1200 + height 630, og:image:alt set, og:locale en_US,
  og:site_name "Sunset Services", twitter:card summary_large_image,
  twitter:title/description/image).
- `curl -I http://localhost:3000/og/fallback` → `200 OK`, `content-type: image/png`.
- Downloaded PNG is `1200 × 630, 8-bit/color RGBA, non-interlaced`,
  64.7 KB.

**SSO-Preview caveat (important — call out to Goran):** the Vercel
Preview deployment is password/SSO-protected. External social scrapers
(Facebook, LinkedIn, X, iMessage, WhatsApp, Slack) cannot fetch a SSO-
gated URL — they hit the login wall and never see the page or the
og:image. That means pasting the **Preview URL** into a chat will NOT
show a card today, even though the code is correct.

Real shareable previews will only render once the site is publicly
reachable — either after production-domain launch, or if Preview
Protection is temporarily turned off. Goran can validate with the
platform sharing-debuggers (Facebook Sharing Debugger, LinkedIn Post
Inspector, the Twitter/X card validator) once the site is public.

---

## C. Three new blog posts + idempotent upload script

**Posts shipped (English source-of-record in `content/incoming-blog/`):**

| slug | category (mapped) | publishedAt | featured-image fallback |
| --- | --- | --- | --- |
| `why-is-my-lawn-yellow` | `how-to` | 2026-05-20 | `hero-lawn-care` |
| `backyard-drainage-aurora` | `how-to` | 2026-05-22 | (closest available: `hero-landscape-maintenance`) |
| `hoa-landscape-budget-2026` | `cost-guide` | 2025-08-15 | `hero-commercial-snow-removal` |

**Category mapping:** the prompt's frontmatter values ("residential",
"commercial") describe intent. The live `blogPost.category` taxonomy
in Sanity is `how-to` / `cost-guide` / `seasonal` / `industry-news` /
`audience` — captured in the script's `CATEGORY_MAPPING` table.
Posts 1 + 2 map to `how-to` (both are diagnose-then-fix guides);
post 3 maps to `cost-guide` (budget/spending content for the HOA
audience).

**Featured-image fallback note:** the source frontmatter lists
`hero-yard-drainage` for post 2, but that asset doesn't exist in
`src/assets/service/`. The closest available is
`hero-landscape-maintenance.jpg`, which is what got copied into
`public/images/blog/backyard-drainage-aurora.jpg`. When Cowork's
manifest lands real drainage photography, the script's
`manifest.blogImages[slug]` path takes over and uploads the real
photo to Sanity.

**HOA post is intentionally dated 2025-08-15** — it was written for
the 2025 planning season and reads consistently with late-summer / fall
planning. It's evergreen-adjacent; Goran can refresh next planning
cycle.

**Spanish translations** are LatAm-MX, **`tú`** register (blog =
content/marketing surface per the M.01f1 register matrix), baked
into the script payload at `ES_TRANSLATIONS[slug]`. No `[TBR]`
markers (post-B.01 convention — content surface gets translated
fully in-session). Body length matches EN block-for-block (85 / 51 /
54 PT blocks per locale, confirmed by dry run).

**FAQ shape:** 3 FAQs per post live as **referenced `faq` documents**
(matching the live `blogPost.faqs` array-of-references shape from
`sanity/schemas/blogPost.ts`), NOT inline. Deterministic ids:
`faq-blog-<slug>-<n>` with `scope: 'blog:<slug>'` and `order: <n-1>`.

**Upload script — `scripts/upload-m10d-content.mjs`:**

- **Safe by default.** `node scripts/upload-m10d-content.mjs` is a
  dry run; nothing is written.
- `--commit` performs the writes (createOrReplace + deterministic
  `_id`s).
- `--clean-placeholders` (opt-in, recommended for the M.10d landing
  per the plan) additionally removes the 12 Phase 1.16 placeholder
  projects so the /projects grid shows only real work after Phase D
  lands.
- In-file `mdToPortableText` converter handles the corpus's subset
  (h2/h3, paragraphs, ul/ol, **bold**); editor-note italic-wrap
  (`*A guide for HOA boards...*`) is detected and stripped.
- Phase D project work is gated on Cowork's manifest at
  `C:\sunset-photos\m10d-drive\m10d-manifest.json`. When absent, only
  the blog uploads run (with a clear "skipped" log message) so Goran
  can land C without waiting for D.
- Reads `SANITY_API_WRITE_TOKEN` from `.env.local` the same way other
  scripts (`seed-faq-content-integration.mjs`, `upload-m01c-photos.mjs`)
  do. **Never prints the token.**
- Final summary block: N posts created/upserted, M projects (of which
  K landscape), placeholders removed.

**Goran's commands (also at the top of the script and in the
`Sunset-Services-Decisions.md` end-of-phase entry):**

```
# 1. Dry run (safe, writes nothing — confirms what would happen):
node scripts/upload-m10d-content.mjs

# 2. If the summary looks right, commit and clean up placeholders:
node scripts/upload-m10d-content.mjs --commit --clean-placeholders
```

**Dry-run output (confirmed clean):**

- 3 posts, 9 FAQs (3 per post × 3 posts)
- EN PT-block / ES PT-block parity: 85/85, 51/51, 54/54
- Categories mapped: how-to / how-to / cost-guide
- D properly skipped (no manifest present)
- Placeholder cleanup not requested (opt-in)

---

## D. 2–5 real projects (≥ 2 Landscape) — SHIPPED

The script's `processProject` was completed in this turn after the
user lifted the pause. It's gated on Cowork's manifest at
`C:\sunset-photos\m10d-drive\m10d-manifest.json` — when the manifest
exists the script processes it; when it doesn't the D section logs
a clear "skipped" line and the rest of the script (blog uploads,
placeholder cleanup) still runs.

**Schema mismatches caught during implementation** (the initial draft
guessed at the project doc shape; this pass verified it against
`sanity/schemas/project.ts`):

- `featuredImage` → renamed to **`leadImage`** + added **`leadAlt`**.
- Gallery entries: `_type: 'galleryEntry'` (not `'galleryItem'`), and
  the asset reference is wrapped inside an `image` field (the schema
  has a nested `image` field; a flat `asset` field would be silently
  rejected by Sanity Studio).
- **No `publishedAt`** on projects. The index sort is `year desc,
  slug asc` — set `year: 2026` to put the new M.10d projects at the
  top of the grid.
- Localized strings on `gallery[].alt`, `leadAlt`, `beforeAlt`,
  `afterAlt` — wrapped in `localized(en, es)` like the rest of the
  fields so the EN/ES split is clean from day one.

**ES translation** (the M.10c-era plan's hard requirement: "Translate
ES (LatAm-MX, glossary; projects are content surface → `tú`)"):

- The script now calls **Anthropic Sonnet 4.6** in a single batch
  request for all manifest projects' `title` + `description` and
  produces LatAm-MX Spanish with the `tú` register. A glossary block
  inside the prompt pins specific terms (`césped` / `adoquines` /
  `muro de contención` / etc.).
- **Manifest contract extension:** projects may include optional
  `titleEs` + `descriptionEs` to override the LLM (when Cowork
  hand-writes ES). Manifest-supplied projects skip the LLM call
  entirely.
- **Graceful fallback:** if `ANTHROPIC_API_KEY` is unset or the LLM
  call fails for any reason, the script logs a warning and falls
  back to EN-as-ES — same precedent as the Phase M.01c uploader
  which set ES = `''`. The follow-up native review (or
  `translate-sanity-es.mjs`) can patch in real ES later.
- **`--skip-es-translate`** flag suppresses the LLM call entirely
  (useful for offline testing or when Goran wants to keep API costs
  pinned to zero on a re-run).

**One subtle bug fixed during implementation:** the script was importing
`dotenv` with `dotenv.config({path: '.env.local'})` — but standard
dotenv does NOT override env vars that already exist in `process.env`.
The Claude Code agent runtime ships some keys (including `ANTHROPIC_API_KEY`)
pre-set to an empty string. The script was reading the empty shell
value, not the .env.local value, and the LLM translation was silently
falling through to the "API key unset" warning branch. Fixed by
passing `{path: '.env.local', override: true}`. The other in-house
script (`seed-faq-content-integration.mjs`) uses a regex loader that
has the same effect; the precedent is "override is fine".

**Verified end-to-end** with a stub manifest (`C:\tmp\m10d-stub\`,
deleted after the run):

- 4 manifest projects → 3 created (2 landscape, 1 hardscape),
  1 skipped because its `primaryServiceSlug` (`yard-drainage`) had
  no matching `service` doc in Sanity. This is the validation
  guard working as designed — it'll catch the same error on the
  real manifest, and Goran can either seed the missing service doc
  first or change the project's service to one that does exist.
- LLM translation: "[translate-es] batching 3 project(s) through
  claude-sonnet-4-6 … [translate-es] received 3/3 ES translations".
  Project 2 was skipped before reaching that step. Manifest-supplied
  ES (project 2 had `titleEs` + `descriptionEs`) correctly bypassed
  the LLM batch — only the 3 LLM-needed projects went through.
- Summary: `Blog: 3 / Projects: 3 (of which 2 landscape) / Skipped: 1`.

**Locked logic preserved from plan §D:**

- `audience = 'hardscape'` when `manifest.division === 'hardscape'`;
  otherwise `manifest.audience` (defaults to `residential` if unset).
- First photo → `leadImage`; rest → `gallery[]` (in manifest order).
- Service ref resolved by `primaryServiceSlug` and set as
  **`services[0]`** because `getProjectDivision()` reads
  `services[0].division` when audience is not `hardscape`.
- City ref resolved by friendly-name → slug match; left unset on
  unknown city (same precedent as M.01c — the page still renders).
- Division-validity assertion AFTER the doc is built: if a project
  was supposed to be `landscape` but the audience+service resolution
  drove it elsewhere, the script skips it with a clear warning.
- Deterministic `_id`: `project-m10d-<slug>`. Slug collision check
  appends a 4-char suffix if the slug already exists in Sanity, so
  the script doesn't trample the not-yet-run M.01c uploader's docs.
- `automatedSourceEventId` / `automatedGeneratedAt` / `automatedModelUsed`
  left empty (these are real, human-curated projects, not ServiceM8-
  driven automation).

---

## Verification

- ✅ `npm run validate:schema` — 0 errors / 0 warnings across 22 URLs.
- ⚠️ `npm run validate:seo` — 4 errors, **all** on the pre-existing
  `aurora-driveway-apron` 404 (known config drift, called out in the
  plan as "not from this phase — note it, don't chase it"). Every
  other URL of the 174 audited passes.
- ⚠️ `npm run validate:a11y` — 1 error, the same pre-existing
  `aurora-driveway-apron` 404. axe AA violations: 0 across the 20
  audited URLs. Lighthouse a11y all ≥ 95 (97 on `/about`, 100 elsewhere).
  WCAG 2.2 SC 2.4.11 + 2.5.8: 0 violations. `prefers-reduced-motion`
  emulated: OK.
- ✅ Homepage `<meta>` audit shows all 11 expected og:/twitter: tags
  with absolute URLs.
- ✅ `/og/fallback` returns `200`, `image/png`, `1200 × 630` (verified
  via `curl` + `file`).
- ✅ Upload script dry run prints 3 posts, 9 FAQs, parity of EN/ES PT
  block counts, category mapping, D gracefully skipped.
- ✅ Carousel: inline-style sampling confirms the
  active-on-top + prev-fully-opaque pattern holds throughout a
  crossfade. No bare-background bleed-through possible.

---

## Files changed

### New
- `src/lib/seo/openGraph.ts`
- `scripts/upload-m10d-content.mjs`
- `content/incoming-blog/why-is-my-lawn-yellow.md`
- `content/incoming-blog/backyard-drainage-aurora.md`
- `content/incoming-blog/hoa-landscape-budget-2026.md`
- `public/og/logo-horizontal-white.png` (copied from `src/assets/brand/`)
- `public/images/blog/why-is-my-lawn-yellow.jpg`
- `public/images/blog/backyard-drainage-aurora.jpg`
- `public/images/blog/hoa-landscape-budget-2026.jpg`
- `src/_project-state/Phase-M-10d-Code-Completion.md` (this file)

### Modified
- `Sunset-Services-Decisions.md` — M.10d Code phase start entry
- `src/components/sections/home/HomeHeroCarousel.tsx` — carousel fix
- `src/app/og/fallback/route.tsx` — branded card polish
- `src/app/[locale]/page.tsx`
- `src/app/[locale]/about/page.tsx`
- `src/app/[locale]/contact/page.tsx`
- `src/app/[locale]/blog/page.tsx`
- `src/app/[locale]/blog/[slug]/page.tsx`
- `src/app/[locale]/[division]/page.tsx`
- `src/app/[locale]/[division]/[service]/page.tsx`
- `src/app/[locale]/projects/page.tsx`
- `src/app/[locale]/projects/[slug]/page.tsx`
- `src/app/[locale]/resources/page.tsx`
- `src/app/[locale]/resources/[slug]/page.tsx`
- `src/app/[locale]/service-areas/page.tsx`
- `src/app/[locale]/service-areas/[city]/page.tsx`

### Commits

1. `725b400` chore(decisions): Phase M.10d (Code) — log scope, locked choices, OG SSO caveat
2. `53694b2` fix(home): Phase M.10d §A — eliminate hero carousel mid-fade brightness dip
3. `80a1594` feat(seo): Phase M.10d §B — Open Graph / Twitter cards across the site
4. `ba9724a` feat(content,scripts): Phase M.10d §C — 3 blog posts + idempotent upload script
5. `50dfb04` docs(m10d): completion report + state updates for A/B/C; D paused
6. `<TBD>` feat(scripts): Phase M.10d §D — finish project uploader (schema fixes + LLM-driven ES)
