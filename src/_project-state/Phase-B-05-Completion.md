# Phase B.05 Completion Report

**Phase:** Phase B.05 — Code — Sitemap, robots, hreflang, canonical: final pass.
**Date:** 2026-05-16.
**Branch:** `claude/charming-mcclintock-368c5d` (worktree of `main`; not yet merged).
**Outcome:** **Shipped.** SEO validation harness (`scripts/validate-seo.mjs`) exits 0 with **zero errors and zero warnings across all 118 URLs + sitemap + robots** — both against `http://localhost:3001` and against the Vercel Preview deploy at `https://sunsetservices-p3ni375xm-dinovlazars-projects.vercel.app/`. Every canonical and hreflang URL site-wide now matches Next 16's `trailingSlash: false` served URLs (no trailing slash anywhere except the bare host root). Closes the Phase 1.16 trailing-slash divergence carryover.

---

## Headline

Phase B.05 closes the SEO surface loop. The new `src/lib/seo/urls.ts` module is the single source of truth for site origin (`SITE_URL`), canonical construction (`canonicalUrl(path, locale)`), and hreflang construction (`hreflangAlternates(path)`). Every page-level `generateMetadata` across the app imports from here; the six previously-divergent `SITE_ORIGIN` constants are deleted. A dynamic `src/app/sitemap.ts` walks 57 routes × 2 locales = 114 sitemap entries, each carrying an `alternates.languages` block (en + es + x-default = en) and per-document `<lastmod>` (Sanity `_updatedAt` for project/blog/resource details, build-time for everything else). A minimal `src/app/robots.ts` ships a single `User-agent: *` block, Allow `/`, Disallow `/api/` + `/og/`, and an absolute `Sitemap:` line. A new re-runnable harness `scripts/validate-seo.mjs` enforces all of this with the same env-var + exit-code + JSON-sidecar contract as B.04's `validate-schema.mjs`; it's now wired as `npm run validate:seo` and exits 0 on both localhost and Vercel Preview.

The Phase 1.16 trailing-slash carryover — where canonicals on projects routes used a runtime override and stripped slashes, while every other route hand-rolled trailing-slash canonicals against Next's `trailingSlash: false` default — is now fully closed. The harness's per-URL canonical / hreflang checks are the on-going regression gate.

---

## What this phase shipped

| File | Action |
|---|---|
| [src/lib/seo/urls.ts](src/lib/seo/urls.ts) | NEW — `SITE_URL` (env-overridable, trailing-slash stripped at load), `canonicalUrl(pathname, locale)` (locale-less input → no-trailing-slash absolute URL, adds `/es` prefix when needed), `hreflangAlternates(pathname)` returning `{en, es, 'x-default': en}` so `x-default` literally is the `en` URL. Single source of truth — sitemap, robots, every `generateMetadata`, and the locale layout import from here. |
| [src/app/sitemap.ts](src/app/sitemap.ts) | NEW — Walks 57 routes × 2 locales = 114 entries. Per-entry: `url` (no trailing slash) + `lastModified` + `alternates.languages` (en + es + x-default). Omits `priority` and `changeFrequency` per D3. Excludes `/thank-you/`, `/dev/system`, `/api/*`, `/og/*`. Reads project/blog/resource slugs + `_updatedAt` from Sanity. |
| [src/app/robots.ts](src/app/robots.ts) | NEW — Single `User-agent: *` block. Allow `/`, Disallow `/api/` + `/og/`. Absolute `Sitemap: ${SITE_URL}/sitemap.xml` line. No `host:` field (Google deprecated, Bing ignores). |
| [src/app/[locale]/layout.tsx](src/app/[locale]/layout.tsx) | Modified — `metadataBase: new URL(SITE_URL)` + sitewide `alternates.canonical` + `alternates.languages` default to the EN root. Defensive fallback — every public page's `generateMetadata` overrides with route-specific alternates. |
| [src/app/[locale]/page.tsx](src/app/[locale]/page.tsx) | Modified — `generateMetadata` migrated to central helpers. WebSite schema URL deliberately retained at `${BUSINESS_URL}/` (schema entity URL ≠ canonical; B.04 regression risk avoided). |
| [src/app/[locale]/[audience]/page.tsx](src/app/[locale]/[audience]/page.tsx) | Modified — `generateMetadata` migrated to central helpers. |
| [src/app/[locale]/[audience]/[service]/page.tsx](src/app/[locale]/[audience]/[service]/page.tsx) | Modified — `generateMetadata` migrated to central helpers. |
| [src/app/[locale]/service-areas/page.tsx](src/app/[locale]/service-areas/page.tsx) | Modified — `generateMetadata` migrated; deleted the hand-rolled `enPath`/`esPath`/`selfPath` block + `BUSINESS_URL` import. |
| [src/app/[locale]/service-areas/[city]/page.tsx](src/app/[locale]/service-areas/[city]/page.tsx) | Modified — `generateMetadata` migrated; deleted the hand-rolled `enPath`/`esPath`/`selfPath` block + `BUSINESS_URL` import. |
| [src/app/[locale]/projects/page.tsx](src/app/[locale]/projects/page.tsx) | Modified — `generateMetadata` migrated; deleted the local `SITE_ORIGIN` constant. |
| [src/app/[locale]/projects/[slug]/page.tsx](src/app/[locale]/projects/[slug]/page.tsx) | Modified — `generateMetadata` migrated; deleted the local `SITE_ORIGIN` constant. `BUSINESS_URL` retained for absolute `CreativeWork.image` URLs (schema-side, out-of-scope here). |
| [src/app/[locale]/blog/page.tsx](src/app/[locale]/blog/page.tsx) | Modified — `generateMetadata` migrated; deleted the local `SITE_ORIGIN` constant. |
| [src/app/[locale]/blog/[slug]/page.tsx](src/app/[locale]/blog/[slug]/page.tsx) | Modified — `generateMetadata` migrated; deleted the local `SITE_ORIGIN` constant + `BUSINESS_URL` import. `openGraph.url` + `openGraph.images` now consume `SITE_URL`. |
| [src/app/[locale]/resources/page.tsx](src/app/[locale]/resources/page.tsx) | Modified — `generateMetadata` migrated; deleted the local `SITE_ORIGIN` constant. |
| [src/app/[locale]/resources/[slug]/page.tsx](src/app/[locale]/resources/[slug]/page.tsx) | Modified — `generateMetadata` migrated; deleted the local `SITE_ORIGIN` constant + `BUSINESS_URL` import. |
| [src/app/[locale]/about/page.tsx](src/app/[locale]/about/page.tsx) | Modified — `generateMetadata` migrated to central helpers. |
| [src/app/[locale]/contact/page.tsx](src/app/[locale]/contact/page.tsx) | Modified — `generateMetadata` migrated to central helpers. |
| [src/app/[locale]/privacy/page.tsx](src/app/[locale]/privacy/page.tsx) | Modified — `generateMetadata` migrated; the `WebPage.url` JSON-LD now uses `canonicalUrl('/privacy', loc)`. |
| [src/app/[locale]/terms/page.tsx](src/app/[locale]/terms/page.tsx) | Modified — `generateMetadata` migrated; the `WebPage.url` JSON-LD now uses `canonicalUrl('/terms', loc)`. |
| [src/app/[locale]/request-quote/page.tsx](src/app/[locale]/request-quote/page.tsx) | Modified — `generateMetadata` migrated to central helpers. |
| [src/app/[locale]/thank-you/page.tsx](src/app/[locale]/thank-you/page.tsx) | Modified — `generateMetadata` deliberately omits `alternates` per D6. Route stays `noindex,follow` via `thank-you/layout.tsx`. |
| [src/app/[locale]/dev/system/page.tsx](src/app/[locale]/dev/system/page.tsx) | Modified — new top-level `export const metadata = { robots: { index: false, follow: false } }`. Defensive noindex until the dev-only route is deleted at launch. |
| [sanity/lib/queries.ts](sanity/lib/queries.ts) | Modified — 3 new sitemap-specific helpers (`getAllProjectSlugsForSitemap`, `getAllBlogPostSlugsForSitemap`, `getAllResourceSlugsForSitemap`) returning `{slug, updatedAt}[]`. Existing slug-only helpers used by `generateStaticParams` unchanged. |
| [scripts/validate-seo.mjs](scripts/validate-seo.mjs) | NEW — Re-runnable SEO validation harness. 118 URLs + sitemap.xml + robots.txt. Same env-var contract (`BASE_URL` + optional `BYPASS_TOKEN` + `SKIP_REMOTE`) and exit-code contract (0 only on zero errors AND zero warnings) as B.04. Wired as `npm run validate:seo`. |
| [.gitignore](.gitignore) | Modified — added `scripts/.seo-validation-report.json` + `scripts/.seo-validation-cache.json`. |
| [package.json](package.json) | Modified — added `"validate:seo": "node scripts/validate-seo.mjs"` script entry. |
| [src/_project-state/current-state.md](src/_project-state/current-state.md) | Modified — last completed phase bumped to B.05; older entries renumbered; Phase 1.16 trailing-slash carryover marked RESOLVED. |
| [src/_project-state/file-map.md](src/_project-state/file-map.md) | Modified — new "Phase B.05" section added with one line per new/modified file. |
| [Sunset-Services-Decisions.md](Sunset-Services-Decisions.md) | Modified — appended `2026-05-16 — Phase B.05 (Code) — Sitemap / robots / hreflang / canonical harmonization` entry covering the 10 locked decisions + 3 in-phase off-spec calls + Phase 1.16 close-out + sitemap drift gate. |

---

## Per-page validation summary

**Headline:** 118 / 118 URLs PASS. 0 errors. 0 warnings. Same result on both `http://localhost:3001` and the Vercel Preview at `https://sunsetservices-p3ni375xm-dinovlazars-projects.vercel.app/` (SHA `e0f80ee`).

The harness fetches 118 URLs (57 EN + 57 ES + 4 noindex routes) plus `/sitemap.xml` and `/robots.txt`. Per-URL checks: HTTP 200, exactly-one `<link rel="canonical">`, canonical no-slash, canonical matches served URL, three hreflang (en + es + x-default), all hreflang no-slash, x-default === en, hreflang reciprocity, robots-meta correctness. Sitewide checks: sitemap completeness (every expected URL present, no excluded URL present), sitemap entries no-slash, sitemap `<xhtml:link>` alternates per `<url>`, robots.txt has absolute Sitemap line + no broad `Disallow: /`.

| URL | errors | warnings | status |
|---|---:|---:|---|
| `/` | 0 | 0 | PASS |
| `/residential` | 0 | 0 | PASS |
| `/residential/lawn-care` | 0 | 0 | PASS |
| `/residential/landscape-design` | 0 | 0 | PASS |
| `/residential/tree-services` | 0 | 0 | PASS |
| `/residential/sprinkler-systems` | 0 | 0 | PASS |
| `/residential/snow-removal` | 0 | 0 | PASS |
| `/residential/seasonal-cleanup` | 0 | 0 | PASS |
| `/commercial` | 0 | 0 | PASS |
| `/commercial/landscape-maintenance` | 0 | 0 | PASS |
| `/commercial/snow-removal` | 0 | 0 | PASS |
| `/commercial/property-enhancement` | 0 | 0 | PASS |
| `/commercial/turf-management` | 0 | 0 | PASS |
| `/hardscape` | 0 | 0 | PASS |
| `/hardscape/patios-walkways` | 0 | 0 | PASS |
| `/hardscape/retaining-walls` | 0 | 0 | PASS |
| `/hardscape/fire-pits-features` | 0 | 0 | PASS |
| `/hardscape/pergolas-pavilions` | 0 | 0 | PASS |
| `/hardscape/driveways` | 0 | 0 | PASS |
| `/hardscape/outdoor-kitchens` | 0 | 0 | PASS |
| `/service-areas` | 0 | 0 | PASS |
| `/service-areas/aurora` | 0 | 0 | PASS |
| `/service-areas/naperville` | 0 | 0 | PASS |
| `/service-areas/batavia` | 0 | 0 | PASS |
| `/service-areas/wheaton` | 0 | 0 | PASS |
| `/service-areas/lisle` | 0 | 0 | PASS |
| `/service-areas/bolingbrook` | 0 | 0 | PASS |
| `/projects` | 0 | 0 | PASS |
| `/projects/naperville-hilltop-terrace` | 0 | 0 | PASS |
| `/projects/naperville-fire-court` | 0 | 0 | PASS |
| `/projects/aurora-hoa-curb-refresh` | 0 | 0 | PASS |
| `/projects/aurora-driveway-apron` | 0 | 0 | PASS |
| `/projects/wheaton-lawn-reset` | 0 | 0 | PASS |
| `/projects/wheaton-bank-frontage` | 0 | 0 | PASS |
| `/projects/lisle-retaining-wall` | 0 | 0 | PASS |
| `/projects/lisle-backyard-refresh` | 0 | 0 | PASS |
| `/projects/batavia-garden-reset` | 0 | 0 | PASS |
| `/projects/batavia-front-walk` | 0 | 0 | PASS |
| `/projects/bolingbrook-office-court` | 0 | 0 | PASS |
| `/projects/bolingbrook-paver-plaza` | 0 | 0 | PASS |
| `/about` | 0 | 0 | PASS |
| `/contact` | 0 | 0 | PASS |
| `/resources` | 0 | 0 | PASS |
| `/resources/patio-materials-guide` | 0 | 0 | PASS |
| `/resources/how-to-choose-a-landscaper` | 0 | 0 | PASS |
| `/resources/lawn-care-glossary` | 0 | 0 | PASS |
| `/resources/snow-service-levels-for-pms` | 0 | 0 | PASS |
| `/resources/dupage-hardscape-permits` | 0 | 0 | PASS |
| `/blog` | 0 | 0 | PASS |
| `/blog/dupage-patio-cost-2026` | 0 | 0 | PASS |
| `/blog/aurora-spring-lawn-calendar` | 0 | 0 | PASS |
| `/blog/why-unilock-premium-pavers` | 0 | 0 | PASS |
| `/blog/snow-for-commercial-properties` | 0 | 0 | PASS |
| `/blog/sprinkler-tune-up-7-signs` | 0 | 0 | PASS |
| `/privacy` | 0 | 0 | PASS |
| `/terms` | 0 | 0 | PASS |
| `/request-quote` | 0 | 0 | PASS |
| `/es` | 0 | 0 | PASS |
| `/es/residential` | 0 | 0 | PASS |
| `/es/residential/lawn-care` | 0 | 0 | PASS |
| `/es/residential/landscape-design` | 0 | 0 | PASS |
| `/es/residential/tree-services` | 0 | 0 | PASS |
| `/es/residential/sprinkler-systems` | 0 | 0 | PASS |
| `/es/residential/snow-removal` | 0 | 0 | PASS |
| `/es/residential/seasonal-cleanup` | 0 | 0 | PASS |
| `/es/commercial` | 0 | 0 | PASS |
| `/es/commercial/landscape-maintenance` | 0 | 0 | PASS |
| `/es/commercial/snow-removal` | 0 | 0 | PASS |
| `/es/commercial/property-enhancement` | 0 | 0 | PASS |
| `/es/commercial/turf-management` | 0 | 0 | PASS |
| `/es/hardscape` | 0 | 0 | PASS |
| `/es/hardscape/patios-walkways` | 0 | 0 | PASS |
| `/es/hardscape/retaining-walls` | 0 | 0 | PASS |
| `/es/hardscape/fire-pits-features` | 0 | 0 | PASS |
| `/es/hardscape/pergolas-pavilions` | 0 | 0 | PASS |
| `/es/hardscape/driveways` | 0 | 0 | PASS |
| `/es/hardscape/outdoor-kitchens` | 0 | 0 | PASS |
| `/es/service-areas` | 0 | 0 | PASS |
| `/es/service-areas/aurora` | 0 | 0 | PASS |
| `/es/service-areas/naperville` | 0 | 0 | PASS |
| `/es/service-areas/batavia` | 0 | 0 | PASS |
| `/es/service-areas/wheaton` | 0 | 0 | PASS |
| `/es/service-areas/lisle` | 0 | 0 | PASS |
| `/es/service-areas/bolingbrook` | 0 | 0 | PASS |
| `/es/projects` | 0 | 0 | PASS |
| `/es/projects/naperville-hilltop-terrace` | 0 | 0 | PASS |
| `/es/projects/naperville-fire-court` | 0 | 0 | PASS |
| `/es/projects/aurora-hoa-curb-refresh` | 0 | 0 | PASS |
| `/es/projects/aurora-driveway-apron` | 0 | 0 | PASS |
| `/es/projects/wheaton-lawn-reset` | 0 | 0 | PASS |
| `/es/projects/wheaton-bank-frontage` | 0 | 0 | PASS |
| `/es/projects/lisle-retaining-wall` | 0 | 0 | PASS |
| `/es/projects/lisle-backyard-refresh` | 0 | 0 | PASS |
| `/es/projects/batavia-garden-reset` | 0 | 0 | PASS |
| `/es/projects/batavia-front-walk` | 0 | 0 | PASS |
| `/es/projects/bolingbrook-office-court` | 0 | 0 | PASS |
| `/es/projects/bolingbrook-paver-plaza` | 0 | 0 | PASS |
| `/es/about` | 0 | 0 | PASS |
| `/es/contact` | 0 | 0 | PASS |
| `/es/resources` | 0 | 0 | PASS |
| `/es/resources/patio-materials-guide` | 0 | 0 | PASS |
| `/es/resources/how-to-choose-a-landscaper` | 0 | 0 | PASS |
| `/es/resources/lawn-care-glossary` | 0 | 0 | PASS |
| `/es/resources/snow-service-levels-for-pms` | 0 | 0 | PASS |
| `/es/resources/dupage-hardscape-permits` | 0 | 0 | PASS |
| `/es/blog` | 0 | 0 | PASS |
| `/es/blog/dupage-patio-cost-2026` | 0 | 0 | PASS |
| `/es/blog/aurora-spring-lawn-calendar` | 0 | 0 | PASS |
| `/es/blog/why-unilock-premium-pavers` | 0 | 0 | PASS |
| `/es/blog/snow-for-commercial-properties` | 0 | 0 | PASS |
| `/es/blog/sprinkler-tune-up-7-signs` | 0 | 0 | PASS |
| `/es/privacy` | 0 | 0 | PASS |
| `/es/terms` | 0 | 0 | PASS |
| `/es/request-quote` | 0 | 0 | PASS |
| `/thank-you` | 0 | 0 | PASS (noindex,follow verified) |
| `/es/thank-you` | 0 | 0 | PASS (noindex,follow verified) |
| `/dev/system` | 0 | 0 | PASS (noindex,nofollow verified) |
| `/es/dev/system` | 0 | 0 | PASS (noindex,nofollow verified) |
| **TOTAL** | **0** | **0** | **PASS** |

---

## All routes in the sitemap

The 114 sitemap entries by route family (57 routes × 2 locales):

| Family | EN routes | ES routes | Count |
|---|---|---|---|
| Home | `/` | `/es` | 1 + 1 = 2 |
| Audience landings | `/residential`, `/commercial`, `/hardscape` | (same, `/es`-prefixed) | 3 + 3 = 6 |
| Service detail | 16 routes spanning all 3 audiences | (same, `/es`-prefixed) | 16 + 16 = 32 |
| Service-areas index | `/service-areas` | `/es/service-areas` | 1 + 1 = 2 |
| City pages | `/service-areas/{aurora,naperville,batavia,wheaton,lisle,bolingbrook}` | (same, `/es`-prefixed) | 6 + 6 = 12 |
| Projects index | `/projects` | `/es/projects` | 1 + 1 = 2 |
| Project detail | 12 Sanity-driven slugs | (same, `/es`-prefixed) | 12 + 12 = 24 |
| About | `/about` | `/es/about` | 1 + 1 = 2 |
| Contact | `/contact` | `/es/contact` | 1 + 1 = 2 |
| Resources index | `/resources` | `/es/resources` | 1 + 1 = 2 |
| Resource detail | 5 Sanity-driven slugs | (same, `/es`-prefixed) | 5 + 5 = 10 |
| Blog index | `/blog` | `/es/blog` | 1 + 1 = 2 |
| Blog detail | 5 Sanity-driven slugs | (same, `/es`-prefixed) | 5 + 5 = 10 |
| Legal | `/privacy`, `/terms` | (same, `/es`-prefixed) | 2 + 2 = 4 |
| Request quote | `/request-quote` | `/es/request-quote` | 1 + 1 = 2 |
| **Total** | | | **114** |

Excluded by design (D6, plan §1): `/thank-you/`, `/es/thank-you/`, `/dev/system`, `/es/dev/system`, `/api/*`, `/og/*`. The harness's sitemap-completeness check explicitly asserts none of these appear in the sitemap.

The 16 service slugs are sourced from `src/data/services.ts` at sitemap-build time:
- residential (6): `lawn-care`, `landscape-design`, `tree-services`, `sprinkler-systems`, `snow-removal`, `seasonal-cleanup`
- commercial (4): `landscape-maintenance`, `snow-removal`, `property-enhancement`, `turf-management`
- hardscape (6): `patios-walkways`, `retaining-walls`, `fire-pits-features`, `pergolas-pavilions`, `driveways`, `outdoor-kitchens`

The 12 project slugs, 5 blog slugs, and 5 resource slugs are sourced from Sanity at sitemap-build time via the three new `*ForSitemap()` helpers.

---

## Hreflang reciprocity matrix

For every EN canonical, the harness asserts:
1. the EN URL emits `{en, es, x-default}` hreflang with `x-default === en`,
2. the ES URL emits `{en, es, x-default}` pointing at the SAME `en` URL,
3. the EN and ES URLs each appear in the fetched set as live pages, and
4. the sitemap entry's `<xhtml:link>` block matches the page-level hreflang exactly.

All 118 URLs pass on both localhost and Preview — full coverage. One sample row per route family:

| Route family | EN canonical | ES canonical | EN's `es` href = ES canonical? | ES's `en` href = EN canonical? | x-default === en (both pages)? |
|---|---|---|---|---|---|
| Home | `https://sunsetservices.us` | `https://sunsetservices.us/es` | ✅ | ✅ | ✅ |
| Audience landing | `https://sunsetservices.us/residential` | `https://sunsetservices.us/es/residential` | ✅ | ✅ | ✅ |
| Service detail | `https://sunsetservices.us/residential/lawn-care` | `https://sunsetservices.us/es/residential/lawn-care` | ✅ | ✅ | ✅ |
| City page | `https://sunsetservices.us/service-areas/aurora` | `https://sunsetservices.us/es/service-areas/aurora` | ✅ | ✅ | ✅ |
| Project detail | `https://sunsetservices.us/projects/aurora-driveway-apron` | `https://sunsetservices.us/es/projects/aurora-driveway-apron` | ✅ | ✅ | ✅ |
| Resource detail | `https://sunsetservices.us/resources/patio-materials-guide` | `https://sunsetservices.us/es/resources/patio-materials-guide` | ✅ | ✅ | ✅ |
| Blog post | `https://sunsetservices.us/blog/dupage-patio-cost-2026` | `https://sunsetservices.us/es/blog/dupage-patio-cost-2026` | ✅ | ✅ | ✅ |
| Legal | `https://sunsetservices.us/privacy` | `https://sunsetservices.us/es/privacy` | ✅ | ✅ | ✅ |
| Request quote | `https://sunsetservices.us/request-quote` | `https://sunsetservices.us/es/request-quote` | ✅ | ✅ | ✅ |

The harness's reciprocity check is in `scripts/validate-seo.mjs` (`checkReciprocity()`); it returns zero errors for the full 114-route x 2-direction matrix.

---

## In-phase decisions

1. **Sitewide layout `metadata.alternates` ships an EN-root default.** The plan called for a "sitewide `alternates.languages` block" in `src/app/[locale]/layout.tsx`; in practice page-level `Metadata` shallow-merges with layout-level `Metadata`, so any page that sets its own `alternates` (which every public page now does) fully replaces the layout's block. The layout default is therefore a defensive fallback for any future page that forgets to override — never the live value on a real route. Reason: Next 16 metadata semantics. Reasoned alternative considered: skip the layout block entirely and rely on per-page metadata being mandatory. Rejected because the fallback catches the case where a new page ships without a `generateMetadata` (Next would otherwise emit zero canonical/hreflang for it).

2. **WebSite schema URL on the homepage stays at `${BUSINESS_URL}/` (with trailing slash).** Schema URLs are entity identifiers, not canonicals; `https://sunsetservices.us/` and `https://sunsetservices.us` both validly identify the WebSite entity. Changing the WebSite.url would create a B.04 regression risk for zero SEO benefit (canonical correctness is enforced by `<link rel="canonical">`, not by JSON-LD). The B.04 schema harness was re-run at the end of this phase and still exits 0 across 22 URLs against `localhost:3001`. Reason: scope-respect — schema URLs are B.04's domain. Reasoned alternative: harmonize all URLs to no-slash. Rejected because it would force a B.04 re-verification cycle for zero SEO surface gain.

3. **`dev/system` route gets `robots: {index: false, follow: false}` instead of being moved or deleted.** The route is dev-only (per its existing comment "dev only — delete before launch") and not in the sitemap. Per the plan §5 it gets a `noindex,nofollow` meta in a top-level `export const metadata`. The harness fetches it and asserts the noindex is present. Reason: the route is intended to be deleted by launch; adding the meta is a one-line defensive change that costs nothing and protects against accidental indexing if a crawler discovers the URL during the launch window. Reasoned alternative: delete the route in this phase. Rejected because B.05's scope is SEO surface, not dev-tooling cleanup.

---

## Verification: lint / types / build

| Check | Status | Notes |
| --- | --- | --- |
| `npm run lint` | ✅ 0 errors / 6 pre-existing warnings | Same baseline as B.04. No new warnings introduced. |
| `npx tsc --noEmit --skipLibCheck` | ✅ 0 errors | The pre-existing image-import errors documented in B.03/B.04 don't surface in this worktree's clean install; the changed B.05 files all typecheck clean. |
| `npm run build` (local) | ⚠ documented pre-existing prettier peer-dep failure (`@react-email/render`) | Not introduced by this phase. Verified via Vercel build instead. |
| Vercel Preview build | ✅ READY | SHA `e0f80ee`, ~1 min from queue to READY at `https://sunsetservices-p3ni375xm-dinovlazars-projects.vercel.app/`. |
| SEO validation harness (localhost) | ✅ 0 errors / 0 warnings across 118 URLs + sitemap + robots | Exit code 0. |
| SEO validation harness (Vercel Preview) | ✅ 0 errors / 0 warnings across 118 URLs + sitemap + robots | Exit code 0. |
| **B.04 schema harness regression check** (localhost) | ✅ 0 errors / 0 warnings across 22 URLs | Confirmed no schema regression from B.05's metadata sweep. |

---

## Manual sanity checks on the Vercel Preview

All confirmed against `https://sunsetservices-p3ni375xm-dinovlazars-projects.vercel.app/` (after priming the bypass cookie).

**`curl /sitemap.xml | head -22` shows well-formed XML with `<xhtml:link rel="alternate" hreflang="..." />` children inside `<url>` entries:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
<url>
<loc>https://sunsetservices.us</loc>
<xhtml:link rel="alternate" hreflang="en" href="https://sunsetservices.us" />
<xhtml:link rel="alternate" hreflang="es" href="https://sunsetservices.us/es" />
<xhtml:link rel="alternate" hreflang="x-default" href="https://sunsetservices.us" />
<lastmod>2026-05-16T12:40:09.509Z</lastmod>
</url>
<url>
<loc>https://sunsetservices.us/es</loc>
<xhtml:link rel="alternate" hreflang="en" href="https://sunsetservices.us" />
<xhtml:link rel="alternate" hreflang="es" href="https://sunsetservices.us/es" />
<xhtml:link rel="alternate" hreflang="x-default" href="https://sunsetservices.us" />
<lastmod>2026-05-16T12:40:09.509Z</lastmod>
</url>
…
```

**`curl /robots.txt` shows the Sitemap line + single User-agent block:**

```
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /og/

Sitemap: https://sunsetservices.us/sitemap.xml
```

**Spot-check 5 page-source canonical/hreflang blocks (extracted from `<head>` via `grep -oE '<link rel="(canonical|alternate)"[^>]*>'`):**

```
--- / ---
<link rel="canonical" href="https://sunsetservices.us"/>
<link rel="alternate" hrefLang="en" href="https://sunsetservices.us"/>
<link rel="alternate" hrefLang="es" href="https://sunsetservices.us/es"/>
<link rel="alternate" hrefLang="x-default" href="https://sunsetservices.us"/>
--- /residential/lawn-care ---
<link rel="canonical" href="https://sunsetservices.us/residential/lawn-care"/>
<link rel="alternate" hrefLang="en" href="https://sunsetservices.us/residential/lawn-care"/>
<link rel="alternate" hrefLang="es" href="https://sunsetservices.us/es/residential/lawn-care"/>
<link rel="alternate" hrefLang="x-default" href="https://sunsetservices.us/residential/lawn-care"/>
--- /service-areas/aurora ---
<link rel="canonical" href="https://sunsetservices.us/service-areas/aurora"/>
<link rel="alternate" hrefLang="en" href="https://sunsetservices.us/service-areas/aurora"/>
<link rel="alternate" hrefLang="es" href="https://sunsetservices.us/es/service-areas/aurora"/>
<link rel="alternate" hrefLang="x-default" href="https://sunsetservices.us/service-areas/aurora"/>
--- /blog/dupage-patio-cost-2026 ---
<link rel="canonical" href="https://sunsetservices.us/blog/dupage-patio-cost-2026"/>
<link rel="alternate" hrefLang="en" href="https://sunsetservices.us/blog/dupage-patio-cost-2026"/>
<link rel="alternate" hrefLang="es" href="https://sunsetservices.us/es/blog/dupage-patio-cost-2026"/>
<link rel="alternate" hrefLang="x-default" href="https://sunsetservices.us/blog/dupage-patio-cost-2026"/>
--- /privacy ---
<link rel="canonical" href="https://sunsetservices.us/privacy"/>
<link rel="alternate" hrefLang="en" href="https://sunsetservices.us/privacy"/>
<link rel="alternate" hrefLang="es" href="https://sunsetservices.us/es/privacy"/>
<link rel="alternate" hrefLang="x-default" href="https://sunsetservices.us/privacy"/>
```

**`/thank-you/?firstName=Test` HTML response includes `noindex,follow`:**

```html
<meta name="robots" content="noindex, follow"/>
```

Note: Next 16 outputs `hrefLang` (camelCase) in the rendered HTML even though the source declares `hreflang` lowercase; HTML attribute names are case-insensitive per the spec so this matches the harness's case-insensitive parsing and any browser / crawler treats them identically.

---

## Validation harness usage

```bash
# Default — local dev server on http://localhost:3000
npm run validate:seo

# Or against a Vercel Preview deploy (requires the protection-bypass token)
BASE_URL=https://sunsetservices-<sha>-dinovlazars-projects.vercel.app \
  BYPASS_TOKEN=<token> \
  node scripts/validate-seo.mjs

# Reserved env var; no remote-validator calls today, kept for parity with B.04
SKIP_REMOTE=1 BASE_URL=… node scripts/validate-seo.mjs
```

**Env vars:**
- `BASE_URL` (default `http://localhost:3000`) — the harness fetches every URL relative to this base.
- `BYPASS_TOKEN` (optional) — when set, the harness primes a Vercel `_vercel_jwt` cookie via the `?x-vercel-protection-bypass=…&x-vercel-set-bypass-cookie=samesitenone` priming hop (manual-redirect mode so the Set-Cookie is captured) and forwards that cookie on every subsequent request. SSO-protected Preview URLs are then reachable.
- `SKIP_REMOTE=1` — reserved. Currently the harness does no remote validator calls, so this flag is a no-op; kept in the env contract for parity with B.04 (`SKIP_REMOTE` there gates the schema.org validator pass).

**Outputs:**
- stdout — colored per-URL table (green PASS / yellow WARN / red FAIL) + a per-section findings block (page errors/warnings, sitemap errors/warnings, robots errors/warnings, reciprocity errors).
- [`scripts/.seo-validation-report.json`](scripts/.seo-validation-report.json) — full machine-readable report (gitignored — temp artifact). Includes per-page canonical / hreflang / robots-meta extraction so a downstream tool can diff between runs.
- The Per-page validation summary table above in this completion report is the committed snapshot.

**Exit code:**
- `0` — zero errors AND zero warnings across every URL, sitemap, robots, and reciprocity.
- `1` — any error or warning surfaced.

---

## Carryover

### To the user

**Google Search Console + Bing Webmaster sitemap submission lands at Phase P.08.** That's a launch-prep concern (needs the production domain + GSC ownership verification, both of which arrive in Phase 3.15). The B.05 sitemap will be ready to submit verbatim once `sunsetservices.us` is live — no further code work required.

### To Code (future phases)

1. **`scripts/validate-seo.mjs` is re-runnable.** Any future SEO-touching phase (B.06 Lighthouse pursuit, new content surfaces, route additions) can run `npm run validate:seo` (or against a Preview with `BASE_URL=… BYPASS_TOKEN=…`) to verify nothing regressed. The harness's `EXPECTED_PATHS` constant is the stable contract — extending it for a new route means adding one entry there AND adding the dynamic source to `src/app/sitemap.ts` so the drift gate stays meaningful.
2. **The sitemap drift gate caught a real bug on first run** — the harness's hardcoded service-per-audience map had `landscape-maintenance` under `residential` instead of `commercial`. The gate fired immediately when the live `/residential/landscape-maintenance` 404'd and `/commercial/landscape-maintenance` appeared as "unexpected" in the sitemap. Fixed; the gate is now live for any future phase that adds/removes service slugs without keeping the harness in sync.
3. **Per-document `<lastmod>` for project/blog/resource detail pages.** The three new `*ForSitemap()` Sanity helpers return `_updatedAt` per document. When the Phase 2.05+ webhook-driven revalidation lands, the sitemap will reflect content edits within one ISR window (30 min) of each Sanity publish.
4. **`SITE_URL` from `@/lib/seo/urls` is the canonical site-origin import** for any future surface. The deleted `SITE_ORIGIN` per-route constants and the `process.env.NEXT_PUBLIC_SITE_URL || BUSINESS_URL` pattern are gone from the app code; new code should import from the central helper rather than re-deriving.

---

## Definition of done

- ✅ Every public route (EN + ES) appears in `sitemap.xml` with hreflang alternates including `x-default`. 114 total (57 × 2).
- ✅ `/thank-you/`, `/es/thank-you/`, `/dev/system`, `/es/dev/system`, `/api/*`, `/og/*` are not in the sitemap.
- ✅ All four legal routes (`/privacy`, `/terms`, `/es/privacy`, `/es/terms`) are in the sitemap.
- ✅ `/request-quote/` and `/es/request-quote/` are in the sitemap.
- ✅ Every canonical URL has no trailing slash and matches its served URL exactly (per-URL check 3 + 4 in the harness).
- ✅ Every localized page has hreflang `en`, `es`, and `x-default`, all pointing at trailing-slash-stripped URLs, with `x-default === en` (per-URL check 5–7).
- ✅ Hreflang reciprocity holds: every URL claimed as an alternate is itself reachable and emits the inverse alternate back (check 8 + reciprocity check).
- ✅ `/thank-you/` retains `<meta name="robots" content="noindex, follow">` (verified via curl on Preview).
- ✅ `robots.txt` references the sitemap, allows `/`, disallows only `/api/` and `/og/` (verified via curl on Preview).
- ✅ `src/lib/seo/urls.ts` is the single source of truth for site-URL + canonical + hreflang construction; no hand-rolled URL strings remain in `generateMetadata`. Verified via `grep -rn "alternates" src/app | grep -v urls.ts` returning only the call-sites of the helpers.
- ✅ `scripts/validate-seo.mjs` ships, is wired as `npm run validate:seo`, and exits 0 on both localhost and Vercel Preview.
- ✅ `Phase-B-05-Completion.md` filed at `src/_project-state/` (this file).
- ✅ `current-state.md` and `file-map.md` updated. Phase 1.16 trailing-slash carryover marked RESOLVED.
- ✅ `Sunset-Services-Decisions.md` carries the new 2026-05-16 B.05 entry covering D1–D10 plus the 3 in-phase off-spec calls.
- ✅ Lint clean (no new warnings); types clean in changed files; Vercel build READY.
- ⚠ Local `npm run build` still fails on the documented `@react-email/render` prettier peer-dep issue — same B.03/B.04 carryover; Vercel build is the green-status authority.
- ✅ The B.04 schema harness still exits 0 (`npm run validate:schema` on localhost — confirmed at end of phase, no regression from the metadata sweep).
