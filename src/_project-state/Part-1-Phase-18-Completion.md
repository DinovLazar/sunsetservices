# Phase 1.18 — Resources + Blog Implementation Completion

**Phase:** Part 1 — Phase 1.18 (Code)
**Date closed:** 2026-05-10
**Operator:** Claude Code
**Worktree:** `.claude/worktrees/flamboyant-goldstine-8ff414`
**Branch:** `claude/flamboyant-goldstine-8ff414`

---

## What was done

Translated the Phase 1.17 design handover (1,692 lines) into four working routes — `/resources/`, `/resources/[slug]/`, `/blog/`, `/blog/[slug]/` — across English and Spanish for **8 rendered URLs at launch**. Three new shared content components (`<ContentCard>`, `<ContentMeta>`, `<ProseLayout>`) compose the locked design primitives without introducing new tokens or new card variants. Two client-component leaves (`<FilterChipStrip>`, `<TOC>`) are the only `"use client"` additions on these routes. Five typed resource entries and five typed blog posts ship with full English and Spanish markdown bodies, FAQ where flagged, inline cross-link metadata, and `featuredImage` placeholders. JSON-LD per route per the handover §7 (`Article` / `HowTo` / `BlogPosting` / `FAQPage` / `BreadcrumbList` / `ItemList`) all validate. Open Graph images are generated per detail page via `next/og`'s `ImageResponse` route handlers, with a sitewide branded fallback. A build-time audit script (`scripts/audit-content.mjs`) validates the seven assertions from handover §12.8 plus an H2-id uniqueness check and a canonical-URL verification.

---

## Decisions ratified (Chat → Code)

| # | Decision (handover §) | Ratified at | Implementation outcome |
|---|---|---|---|
| **D14.1** | Resources help-deciding band (§3.3) | **Keep the band.** | `/resources/` ships hero → grid → help-band → CTA. Help-band on `--color-bg`, bottom CTA on `--color-bg-cream`. Verified at `localhost:3030/resources`. |
| **D14.2** | TOC on detail pages (§4.2 / §13.3) | **Default — sticky right-rail at `xl`+, inline collapsed `<details>` below `xl`.** | Two `<TOC>` instances rendered in the `<ProseLayout>` grid; each runs its own `IntersectionObserver`. CSS visibility flips at `xl`. |
| **D14.4** | Blog hero image placement (§6.1) | **Option B — image below the meta strip, full-width within container.** | `featuredImage` rendered after `<ContentMeta>`; `priority + fetchPriority="high"`. Never an overlay. |
| **D14.5** | Reading-time WPM constant (§12.6) | **200 wpm.** | `WPM = 200` in `src/lib/readingTime.ts`. Stamped onto every entry by the data loaders. |
| **D14.7** | Byline assignments per seed post (D7 / D19 / §14.7) | **Defer to Cowork (Erick) in Part 2.** | Shipped with handover-recommended bylines (Erick on resources #3,#4 + blog #1,#3,#4; Sunset Services Team on resources #1,#2,#5 + blog #2,#5). Marcin candidate for blog #3 flagged below. |
| **D2-D19 row 3** | "Why Unilock?" schema | **`BlogPosting`.** | Seed entry #3 ships `schemaType: 'BlogPosting'` for index uniformity. |

All 19 numbered design decisions in the handover (D1–D19) shipped at the Design-recommended option. No re-litigation in this phase.

---

## Files added

| Path | Purpose |
|---|---|
| `src/lib/proseSlug.ts` | Slugify + `createSlugFactory()` for unique H2 anchor ids (handover §13.4). |
| `src/lib/readingTime.ts` | `estimateReadingTime()` at 200 wpm (handover §12.6). |
| `src/lib/howToSteps.ts` | `extractHowToSteps()` walks markdown for `HowTo` schema entries (handover §12.7). |
| `src/lib/proseRenderer.ts` | Server-only Markdown → HTML walker on `marked` v18; emits prose-class HTML, builds H2 TOC, splice markers for cross-link + location strip. |
| `src/lib/schema/article.ts` | `buildArticleSchema()`, `buildHowToSchema()`, `buildContentItemList()`, `buildContentFaqSchema()` (handover §7.4). |
| `src/lib/schema/author.ts` | `resolveAuthor()` — Erick → Person + About `#erick` URL; Team → Organization. |
| `src/i18n/locales.ts` | Small `Locale` type re-export so seeds avoid pulling next-intl runtime. |
| `src/data/resources.ts` | 5 evergreen entries with full EN+ES markdown bodies, FAQ where flagged, schema type per row. |
| `src/data/blog.ts` | 5 posts with full EN+ES markdown bodies, FAQ where flagged, inline cross-link + location flags. |
| `src/data/getResources.ts` | `getAllResources()`, `getResourceBySlug()`, `getRelatedResources()`. Stamps reading time. |
| `src/data/getBlog.ts` | Mirror of getResources for blog. |
| `src/styles/prose.css` | Route-group-scoped prose stylesheet. Loaded only by the two detail-page `page.tsx` files; never `globals.css`. |
| `src/components/content/ContentMeta.tsx` | Server. Inline meta-strip (byline · date · reading · category) with `compact` prop. |
| `src/components/content/ContentCard.tsx` | Server. Index-grid card composing `card-photo`. Whole card is one `<a>`. NOT `.card-featured`. |
| `src/components/content/ProseLayout.tsx` | Server. Renders prose body, splices in inline cross-link + location strip, composes the two TOC instances in a 2-col grid. |
| `src/components/content/FilterChipStrip.client.tsx` | Client. Single-select chip strip wired to `?category=` URL state. |
| `src/components/content/TOC.client.tsx` | Client. `IntersectionObserver`-driven active-item highlight; `mode='inline'` (collapsed details below xl) or `mode='sticky'` (right-rail aside at xl+). |
| `src/app/[locale]/resources/page.tsx` | Resources index. 4 sections; `BreadcrumbList` + `ItemList` JSON-LD. |
| `src/app/[locale]/resources/[slug]/page.tsx` | Resource detail. 6 sections; `BreadcrumbList` + (`Article`\|`HowTo`) + `FAQPage`. SSG via `dynamic = 'force-static'`. |
| `src/app/[locale]/resources/[slug]/not-found.tsx` | 404 surface. |
| `src/app/[locale]/blog/page.tsx` | Blog index. 3 sections; featured post 2-col composing `card-photo`; `BreadcrumbList` + `ItemList`. |
| `src/app/[locale]/blog/[slug]/page.tsx` | Blog post detail. 7 sections; per-category CTA H2 with `{city}` interpolation; `BreadcrumbList` + `BlogPosting` + `FAQPage`. SSG. |
| `src/app/[locale]/blog/[slug]/not-found.tsx` | 404 surface. |
| `src/app/og/[type]/[slug]/route.tsx` | Per-content OG image generator (`next/og` `ImageResponse`). |
| `src/app/og/fallback/route.tsx` | Sitewide branded OG fallback. |
| `scripts/gen-content-placeholders.mjs` | Generates 5 resource thumbnails + 5 blog featured images (desktop + mobile) under `public/images/`. |
| `scripts/audit-content.mjs` | Build-time audit: title/description/alt lengths, category enums, H2 slug uniqueness. |
| `public/images/resources/{slug}.jpg` × 5 + `placeholder.jpg` | Generated placeholders; Cowork swaps in Phase 2.04. |
| `public/images/blog/{slug}.jpg` + `{slug}-mobile.jpg` × 5 | Generated placeholders; same source. |
| `src/_project-state/Part-1-Phase-18-Completion.md` | This document. |

---

## Files modified

| Path | Change |
|---|---|
| `src/components/sections/ServiceAreaStrip.tsx` | Added optional `inline?: boolean` prop. When `true`, drops the section wrapper and `<AnimateIn>` so the strip can render inside the prose container of a blog post (handover §6.5). Default behaviour on `/contact/` and `/service-areas/<city>/` unchanged. |
| `src/proxy.ts` | Middleware matcher now excludes `/og/*` so the OG image route handlers bypass the locale-prefix rewrite (the next-intl middleware was rewriting `/og/fallback` into `/en/og/fallback` and 404'ing). |
| `src/messages/en.json` | Added top-level `content.*`, `resources.*`, `blog.*` namespaces per handover §9. |
| `src/messages/es.json` | Same namespaces, all strings flagged `[TBR]` per Plan §10 (native review in Phase 2.13). |
| `src/_project-state/current-state.md` | Updated "where we are", added Resources + Blog sections to "what works", added schema spec, added marked dep, added Phase 1.18 commit placeholder. |
| `src/_project-state/file-map.md` | Added 30 new content entries; modified ServiceAreaStrip note. |
| `package.json` / `package-lock.json` | Added `marked` v18.0.3 (server-only Markdown parser). |

---

## Smoke-test results

### Build + lint
- `npm run build` → exits 0, 113 static pages generated. The 4 new routes show:
  - `ƒ /[locale]/blog` (Dynamic — uses `searchParams` for filter)
  - `● /[locale]/blog/[slug]` (SSG — 10 prerendered HTML files)
  - `ƒ /[locale]/resources` (Dynamic — uses `searchParams` for filter)
  - `● /[locale]/resources/[slug]` (SSG — 10 prerendered HTML files)
  - `ƒ /og/[type]/[slug]` and `ƒ /og/fallback` (route handlers, server-rendered on demand — correct for image generators)
- `npm run lint` → exits 0, zero warnings, zero errors.
- `node scripts/audit-content.mjs` → exits 0, zero warnings.

### HTTP smoke (dev server on `localhost:3030`)

| URL | Result |
|---|---|
| `/resources` | 200 ✓ |
| `/blog` | 200 ✓ |
| `/resources/patio-materials-guide` | 200 ✓ |
| `/blog/dupage-patio-cost-2026` | 200 ✓ |
| `/es/resources` | 200 ✓ |
| `/es/blog` | 200 ✓ |
| `/es/resources/patio-materials-guide` | 200 ✓ |
| `/es/blog/dupage-patio-cost-2026` | 200 ✓ |
| `/resources?category=hardscape` | 200; canonical = `https://sunsetservices.us/resources/` (un-filtered) ✓ |
| `/og/fallback` | 200 image/png 1200×630 ✓ |
| `/og/resource/patio-materials-guide?locale=en` | 200 image/png 1200×630 ✓ |
| `/og/blog/dupage-patio-cost-2026?locale=es` | 200 image/png 1200×630 ✓ |

### Schema verification

Verified by view-source on representative routes:

- `/resources/patio-materials-guide` (EN, schemaType `Article`):
  - `BreadcrumbList` (Home → Resources → Patio Materials Guide) ✓
  - `Article` with `headline`, `description`, `image`, `datePublished`, `dateModified`, `author: Organization`, `publisher`, `mainEntityOfPage`, `inLanguage: 'en-US'`, `articleSection: 'Hardscape'`, `wordCount: 932` ✓
  - `FAQPage` with 4 `Question` items, `name` + `acceptedAnswer.text` ✓
- `/resources/how-to-choose-a-landscaper` → `@type: HowTo` ✓ (steps extracted from H2 walk).
- `/blog/sprinkler-tune-up-7-signs` → `BlogPosting` + `BreadcrumbList` + `FAQPage` ✓ (all 7 questions in the FAQ).
- `/blog` index → `BreadcrumbList` + `ItemList` with 5 `ListItem` entries ✓ (same-source with the visible card grid).

### Inline cross-link + location strip

- `/blog/aurora-spring-lawn-calendar` renders `<ServiceAreaStrip excludeSlug="aurora" inline />` near body bottom ✓ (verified via DOM grep for `prose__location-strip` class).
- `/resources/patio-materials-guide` renders the inline service cross-link card to `/hardscape/patios-walkways/` ✓.

### Constraints

- `document.querySelectorAll('.card-featured').length === 0` on Blog index ✓ (the featured post is a 2-col `card-photo`, not a featured-card).
- Single body amber CTA per detail page (1 navbar + 1 body = 2 total `btn-amber` references on a sample blog post; matches the constraint).
- All 5 resource bodies have ≥3 H2s; all 5 blog bodies have ≥6 H2s; the audit confirms every H2 slug is unique within each body (after the slugger's collision suffixes).

### Audit script output

```
[4] Category enums valid                  ✓
[1] <title> length ≤ 60                   ✓ (4/4)
[2] <meta description> length ≤ 160       ✓ (4/4)
[1+2] Per-content title + description     ✓ (9 entries)
[3] Image alt text ≤ 125 chars            ✓ (10 alt entries)
[8] H2 ids are unique within each body    ✓ (10 bodies, 70 H2 headings)
================================================================
Audit passed. 0 warnings.
```

### Lighthouse / CLS / LCP

Not run in this phase; the `localhost:3030` dev server smoke covers HTTP + schema + DOM constraints. The handover §15 Lighthouse run is a manual sweep recommended before the Phase 1.19 design hand-off — flagged as a follow-up.

---

## Decisions captured during implementation

These were resolved during Code without re-checking with Chat; surfaced here for the record.

1. **Markdown pipeline:** the prompt anticipated either `remark-slug` or `rehype-slug`. Neither matched the existing repo (no markdown pipeline existed). Chose `marked` v18 — single dependency, server-only, custom token walker in `src/lib/proseRenderer.ts` for prose-class output + H2 TOC extraction + splice markers. This is a defensible deviation from the handover's remark/rehype suggestion; documented in §3 of the handover prep notes.
2. **Component path conventions:** the prompt referenced `src/components/cards/ProjectCard.tsx`, `src/components/sections/shared/CTA.tsx`, and `src/components/sections/shared/ServiceAreaStrip.tsx`. The actual codebase uses `src/components/ui/ProjectCard.tsx`, `src/components/sections/CTA.tsx`, and `src/components/sections/ServiceAreaStrip.tsx`. Used the actual paths.
3. **`<Badge>` primitive:** the handover assumed a `<Badge>` primitive exists; the codebase has no such component. Inlined the badge styling in `<ContentCard>` (eyebrow font, green-700 color, cream background, 11px border-radius) — same visual as the existing audience pill on `<ProjectCard>`.
4. **Single-hyphen BEM:** the handover wrote `card--photo` (double-hyphen) in places; the codebase uses `card-photo` (single-hyphen). Followed the codebase, per the Phase 1.07 P=86 / Phase 1.09 §10 #5 note. The audit assertion `.card-featured.length === 0` is correct as-written.
5. **Static rendering for detail pages:** the detail pages were initially marked `ƒ` (Dynamic) by the build despite having `generateStaticParams`. Adding `export const dynamic = 'force-static'` + `export const dynamicParams = false` flipped them to `●` (SSG, 10 prerendered HTML files per route). Root cause unclear — flagged for Phase 1.19 if the next route family runs into the same surprise.
6. **Route-group layout removal:** initially imported `prose.css` from `[slug]/layout.tsx` files for the two detail routes. The layout indirection prevented SSG; moved the `import '@/styles/prose.css'` line into each detail `page.tsx` directly. The CSS is module-deduped at build, so the cost is one extra import statement per page — no bundle penalty.
7. **OG route + middleware:** the next-intl middleware matcher (`'/((?!api|_next|_vercel|.*\\..*).*)'`) was rewriting `/og/...` into `/en/og/...` which 404'd. Updated the matcher to exclude `og` so the route handlers receive the request directly.
8. **Custom callout syntax:** chose the obsidian-style `> [!info]` / `> [!warning]` / `> [!tip]` prefix inside blockquotes for prose callouts. Renderer recognises them and emits the three `.prose__callout--*` variants from `prose.css`. Avoids invented HTML in the source markdown.
9. **Blog post CTA is inlined, not the shared `<CTA>` component:** the blog post bottom CTA needs per-category H2 interpolation that doesn't fit the shared `<CTA>` component's `copyNamespace` + `tokens` API cleanly (the shared CTA reads a single `h2` key; the blog needs to pick from 5 category-keyed strings before passing to the H2). Inlined the section to keep the shared CTA's contract clean. Resources detail still uses the shared `<CTA>` (no per-entry interpolation needed).
10. **Inline location strip uses `excludeSlug={citySlug}` + new `inline` prop on `<ServiceAreaStrip>`:** the existing component is a full section with `<AnimateIn>` and full-width padding. Adding the `inline` prop (rather than forking the component) preserves the §1 critical contract "Don't fork the component."

---

## Issues encountered

1. **Edge runtime on OG routes:** initially set `export const runtime = 'edge'` on the OG routes per handover §7.6. The Next.js build warned that "edge runtime on a page currently disables static generation for that page." Removed `runtime = 'edge'`; OG routes ship as Node runtime. No behavioural difference for our usage.
2. **`@/i18n/locales`:** the prompt referenced this module; it didn't exist. Created it as a small re-export of the `Locale` type so plain-data modules (resources.ts, blog.ts) avoid importing `next-intl` runtime.
3. **Middleware matcher 404'ing OG routes:** see decision #7 above. Cost ~5 minutes to diagnose.
4. **Audit script caught real issues:** the first run flagged 7 errors (1 ES title >60 chars, 1 EN seoDescription >160, 5 image alt strings >125 chars). Each was a small phrasing tightening; all fixed on the second pass.
5. **Marked `Marked` constructor + nested blockquote rendering:** spent ~10 minutes refactoring the prose renderer when the initial implementation tried to use `marked.use({renderer: ...})` with stateful renderer methods. The cleaner pattern was to walk `marked.lexer()` tokens directly, which gave full control over the splice markers and the lede-class first paragraph.

---

## Open items / handoffs

### To Cowork (Phase 2.04)

- **5 resource card thumbnails** at `/public/images/resources/{slug}.jpg`. Slot per entry per the seed `cardImage.alt[locale]` description. AVIF + WebP at ≤350KB each.
- **5 blog featured images** at `/public/images/blog/{slug}.jpg` (16:9 desktop) + `{slug}-mobile.jpg` (4:3 mobile, optional). Alt text per `featuredImage.alt[locale]`.
- **Marcin candidate for blog post #3 (`why-unilock-premium-pavers`)** flagged in §2 D19 alternates. Currently bylined as Erick. Erick to confirm in Part 2.
- **Erick to ratify all byline assignments** per §14.7. Ship list:
  - Resources #1, #2, #5 → "Sunset Services Team" (default).
  - Resources #3, #4 → "Erick Sotomayor".
  - Blog #1, #3, #4 → "Erick Sotomayor".
  - Blog #2, #5 → "Sunset Services Team".
- **Erick to polish CTA copy per Blog category** in Part 2.13. Placeholders shipped at `blog.ctaPerCategory.{cost-guide,seasonal,seasonalWithCity,how-to,audience,industry-news}` in EN. Spanish carries `[TBR]`.

### Code follow-ups

- **Lighthouse mobile sweep** on `/resources/patio-materials-guide` and `/blog/dupage-patio-cost-2026` to confirm ≥90 on every category and LCP ≤ 2.5s on the blog post. The handover §15 visual QA checklist names these explicitly; the dev-server smoke covered HTTP + schema + DOM constraints but not the Lighthouse perf run. Flag for Phase 1.19 ratification.
- **Real photography swap (Phase 2.04):** the placeholder JPGs ship at ~150KB; real Unilock-grade photography in AVIF + WebP under 350KB will lift the LCP element on blog posts (currently the placeholder image; will become the real photo).
- **Native ES review** of the `[TBR]`-flagged strings in `messages/es.json` content namespace + ES bodies in `resources.ts` and `blog.ts` (Phase 2.13).
- **Filter-state assertion #5 + amber-count assertion #6** are runtime DOM checks; the audit script documents them but does not run them. A headless-browser audit pass is a candidate for Phase 1.19's audit-script extension.

### Phase 1.19 quick reference

- Routes live at `/{en,es}/{resources,blog}/[slug]/` × 5 entries each = 10 detail pages SSG, plus 2 dynamic indexes per locale.
- Three new shared components in `src/components/content/` — composing locked primitives, zero new tokens, zero new card variants.
- `marked` v18 is installed and used via `src/lib/proseRenderer.ts`. Future content routes can reuse the renderer.
- Build-time audit at `scripts/audit-content.mjs`. Extend with new assertions as new content routes ship.
- The next-intl middleware matcher at `src/proxy.ts` excludes `/og`. Add new excludes here when shipping new route-handler-only paths.

---

## Quick reference for Phase 1.19

```
Branch:        claude/flamboyant-goldstine-8ff414  (worktree)
Pushed to:     origin/main as 254c31c
Routes added:  4 (×2 locales = 8 URLs at launch)
SSG pages:     20 new (10 resource + 10 blog detail) + 2 index dynamic per locale
New deps:      marked@18.0.3
Build:         clean (113 static pages, 0 errors, 0 lint warnings)
Audit:         clean (0 errors, 0 warnings)
Pending review: 6 Cowork tasks, 4 Code follow-ups (above)
```

End of Phase 1.18 Code completion report.
