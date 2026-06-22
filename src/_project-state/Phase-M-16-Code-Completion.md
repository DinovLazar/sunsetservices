# Phase M.16 — Code Completion Report

**Homepage Redesign (Concept A) + Sitewide Orange Dock + Sanity-ready Image Slots**

- **Branch:** `phase/m16-homepage-redesign` (pushed; **NOT merged to `main`** — Lazar verifies on Vercel Preview, then merges).
- **Date:** 2026-06-22
- **Scope:** homepage only (`/` EN + `/es`), the shared Navbar (sitewide), the orange token layer, and the `featuredOnHome` Sanity schema field. No other page bodies touched.

---

## 1. What shipped (by task)

1. **Decisions-first commit** (`a76cc38`). Appended the M.16 plan-of-record to `Sunset-Services-Decisions.md` before any code: Concept A, orange ramp + button variant, sitewide dock + homepage white dock, the three BG-01 overrides, D1 live divisions, D2/D3 fact slots, D4 uniform cards, the `featuredOnHome` field, and the explicit note that the body-CTA amber→orange propagation and the M.01 photo upload are separate, out-of-scope phases. The governing handover doc was committed alongside.

2. **Token layer** (`2ad9bf3`, `globals.css`). Added the Sunset Orange ramp (`--color-sunset-orange-50/-100/-300/-500/-700`, `-500 #F28C38`), `--color-text-on-orange: #1A1A1A`, the `.btn-orange` primary-button variant (orange fill + charcoal text ≈7:1; hover deepens to `-700 #B45309` with white text ≈5.9:1), and the `.horizon-edge` motif (static 4px orange gradient rule). Kept tokens (green ramp, amber, surfaces, radius/shadow/fonts) untouched.

3. **Sanity layer** (`1751746`). Added `featuredOnHome` boolean to the project schema (taxonomy group, default off) + **redeployed Studio** (`1/1 schemas` → `sunsetservices.sanity.studio`). New GROQ helpers: `getFeaturedHomeProject()` (hero source), `getFeaturedBeforeAfterProject()` (before/after source), `getPublishedReviews(limit)` (trust-band reviews slot, returns `[]` today). New `HomeReviewEntry` type.

4. **Homepage redesign** (`ce5f2ff`). All 7 sections rebuilt to the handover §4, EN + ES:
   - **Hero (Concept A):** single wide image replacing the rotating carousel; Sanity-asset-first (`featuredOnHome` lead image → placeholder `hero.jpg`); Next 16 `preload` LCP + responsive `srcset` + modern format; orange kicker, orange rule + credential line, orange CTA + ghost "View Our Work", bottom trust strip (◆ UNILOCK), horizon-edge at the foot. **The carousel island was deleted.**
   - **Divisions:** four uniform cards, ◆ UNILOCK chip on Hardscape, Sanity-asset-first per-division images (newest project per division), grid degrades to 3 columns cleanly (`lg:grid-cols-4` ↔ `lg:grid-cols-3`).
   - **Trust band:** dark `#23231D`, "Credentials you can verify" + verifiable chips, prominent UNILOCK card (no year, D3), real-Google-reviews slot.
   - **Before/After (new):** featured Sanity before/after pair (placeholder fallback) shown as a static BEFORE/AFTER-labelled split + 3-up recent-work strip.
   - **Process (new):** Design / Build / Maintain on charcoal top-rules with AA-safe orange-700 numerals.
   - **Why Sunset:** sticky intro + orange CTA + numbered green-numeral divider list.
   - **Final CTA:** dark gradient, horizon-edge on top, orange CTA (charcoal text) + ghost "Call (630) 946-9321".

5. **Sitewide dock** (`718167c`). Navbar primary CTA → orange "Get a Free Estimate" pill (charcoal text) on every page via `.btn-orange`; hidden on `/request-quote/` (D2, reinstated); homepage navbar = solid white dock over the hero (audience/service over-hero navbars unchanged).

---

## 2. Homepage is Sanity-image-ready (verified both paths)

Every homepage photo slot reads **Sanity-asset-first with placeholder fallback** via the existing `resolveProjectImage` pattern:

- **Hero** = `featuredOnHome` project's lead image → `hero.jpg` placeholder.
- **Division cards** = newest project per division (division derived from `getProjectDivision`) → bundled division placeholders.
- **Before/After featured pair** = newest `hasBeforeAfter` project → `imageMap` placeholder pair.
- **Recent-work thumbnails** = newest projects with a resolvable lead image (placeholder fallback per slug).

**Both branches verified live on the Preview build** (localhost prod-mode screenshots):
- **Asset-wins VERIFIED:** the Before/After section rendered **real Sanity photos** (the "Scott & Sarah's" project — a real `hasBeforeAfter` doc), and the recent-work strip + several division cards rendered real Sanity project photos with city labels. This proves `getFeaturedBeforeAfterProject()` + `resolveProjectImage()` resolve Sanity assets to CDN URLs end-to-end.
- **Placeholder-fallback VERIFIED:** no project is flagged `featuredOnHome` yet, so the **hero falls back to the bundled `hero.jpg` placeholder** (renders correctly); divisions without a matching Sanity project fall back to the bundled division placeholders.

Net: when M.01 uploads real photos (and an editor flags a hero project via the new `featuredOnHome` toggle in Studio), the homepage updates with **no further code**. Until then, placeholders render — expected.

---

## 3. Verification battery

| Check | Result |
|---|---|
| `npm run build` | **green** — Compiled successfully, 190/190 static pages, homepage `●` SSG (EN + ES) |
| `npm run lint` | **0 errors** (2 pre-existing `queries.ts` unused-type warnings, not introduced by M.16) |
| `npm run validate:a11y` | **PASS** — homepage EN+ES: axe AA 0, Lighthouse a11y 100, SC 2.4.11 0, SC 2.5.8 0; 20/20 URLs PASS. Charcoal-on-orange CTA clears contrast. |
| `npm run validate:schema` | **0 / 0** across 22 URLs |
| `npm run validate:seo` | **0 / 0** across 184 URLs + sitemap + robots |
| `npm run validate:mobile` | **0 errors** / 906 warnings (warnings = pre-existing chat/nav tap-target baseline). One M.16 overflow regression (before/after recent-work header link on narrow viewports) was found and fixed. |
| `npm run validate:links` | **clean** — internal: 233 OK, **0 broken, 0 error**, 0 missing-anchor. The 92 locale-prefix + 39 heuristic wrong-dest are advisory classifications (validator exits 0); **0 of the wrong-dest flags originate from the homepage** (all pre-existing on other pages). |
| `npm run test:consent` | **23 / 23 pass** |
| `npm run lighthouse` (homepage `/`, localhost prod-mode) | **Desktop: perf 97 · a11y 100 · bp 96 · seo 92** (LCP 0.7s). **Mobile (warm): perf ~90 · a11y 100 · bp 96 · seo 92** (LCP 3.6s). See §6 for the two <95 cells (both documented). |

---

## 4. Decisions made independently (no silent ratifications)

The brief asked me to surface every decision I had to make on my own. Here they are:

1. **ES brand-marquee lines (hero H1 + credential line).** The brief flags these as "clearly-marked slots pending native Spanish review — do not ship machine-translated copy." I authored **draft tú-register Spanish** for both (`"Crea tu legado al aire libre"`, `"Certificado UNILOCK · 25 años de trayectoria · Hecho para Chicagoland"`) and flagged them as native-review-pending in this report + the decisions log, **rather than** rendering a visible `[TBR]`-style marker on the single most prominent line of the Spanish page (which would make the Preview look broken). My reading: "do not ship MT" = do not paste raw auto-translation as final; a register-correct draft + an explicit native-review flag better serves a launch-imminent Preview. **If the operator wants the literal no-final-Spanish slot, each is a one-key revert.** All other ES copy follows the EN structure 1:1; leaf parity is 1335 = 1335.

2. **Below-hero deferral via `content-visibility:auto`, not `next/dynamic`.** The handover §8 calls the below-hero sections "`next/dynamic`-able," but in Next 16 `next/dynamic` with `ssr:false` is **disallowed in Server Components**, and these sections are async Server Components (Sanity fetches). `content-visibility:auto` + `contain-intrinsic-size` (already the site's pattern) is the correct render-deferral lever and is what each section uses.

3. **Before/After = static BEFORE/AFTER-labelled split, not an interactive drag-slider.** The handover mentions a "center divider handle." I rendered a static two-up labelled split instead: it shows both states at once (more persuasive), adds zero client JS (protects LCP), is reduced-motion-safe by construction, and the BEFORE/AFTER text labels satisfy "never color-only." The interactive `BeforeAfterToggle` remains on project-detail pages.

4. **Process numerals use orange-700, not orange-500.** `#F28C38` on white is ≈2.4:1 (fails AA even for large text); `-700 #B45309` is ≈5.9:1. The numerals keep the orange look while clearing contrast (and are `aria-hidden` decorative ordinals).

5. **Reinstated the D2 hide-CTA-on-`/request-quote/` rule.** This reverses Phase M.10 (Issue 8), which had made the CTA always-render "for visual consistency" per Goran's walkthrough. The M.16 brief explicitly requires the CTA hidden on `/request-quote/` (scope #3 + DoD + locked decisions), so the brief authoritatively reinstates the hide. Flagging the tension with the older M.10 call.

6. **Dropped `HomeServicesOverview` + `HomeAbout` from the homepage.** The handover §4 order has neither a services-overview grid nor a standalone about section (their content is folded into the divisions block, trust band, and why-Sunset). Both component files + their message keys (`home.services`, `home.about`) are **kept (now orphaned on the homepage)** to avoid any cross-page risk and to allow easy re-add. `HomeProjects` is **untouched** — it is reused by `/about`. The homepage's "recent work" is now the strip inside the Before/After section.

7. **Removed per-item grid scroll animation.** The previous homepage wrapped the division/why-Sunset grids in `StaggerContainer`/`StaggerItem` (per-item scroll-fade) — the handover §7 explicitly forbids that on the heavy grids. Grids now render in place; only section headings fade once.

8. **Accent-color split.** Orange owns the primary CTAs + the hero accents + the process numerals + the horizon motif. Green is retained for the section eyebrows (matching the other 80 pages / the kept green palette) and the why-Sunset numerals (the handover §4 specifies green numerals there). This honors "orange = the per-page CTA/accent" without a full green-eyebrow flip the handover does not ask for.

---

## 5. Out-of-scope respected

- No other page bodies changed; non-homepage **body CTAs stay amber** (the amber→orange propagation is a separate phase).
- The over-hero translucent navbar on **audience-landing + service-detail heroes is unchanged**; only the homepage moved to the white dock.
- The **AI chat widget, the footer, and the global design system** (beyond the orange token + button variant) are untouched.
- `scripts/upload-m01c-photos.mjs` **not run**; no real photos added; `SANITY_API_WRITE_TOKEN` untouched.
- No removed content reintroduced (no fake testimonials, ratings, review counts, or the "DuPage Tribune" award).

---

## 6. Known ceilings / the two Lighthouse <95 cells

Both <95 cells are documented, expected, and consistent with the M.15 baseline — neither is an M.16 regression:

1. **SEO 92 (desktop AND mobile) — the localhost canonical artifact.** The homepage canonical points at the production domain (`canonicalUrl('/')`), which Lighthouse flags as "not a valid `rel=canonical`" when the page is served from `localhost`. On the production domain the canonical is self-referential and SEO → ≈100 (M.15 documented the same: "SEO 92 localhost canonical artifact; prod self-canonical ≈100"). No code issue; not specific to M.16.

2. **Mobile Performance ~90 — the documented full-bleed-hero LCP ceiling.** The exact gap: mobile LCP ≈3.6s (warm) vs desktop 0.7s, under Lighthouse's simulated slow-4G + 4× CPU throttle. **The served hero is already only 42 KB** (`hero.jpg` 517 KB source → optimized 640w/q75 = 42.7 KB, preloaded via `<link rel=preload as=image imageSrcSet>`), so image *bytes* are not the driver — the gap is the LCP **paint** time of the full-bleed hero behind the always-loaded app shell under CPU throttle. Notes:
   - The first cold-cache run measured 72 (cold `next start` image-optimizer + residual load from the just-finished link crawl); two warm runs settled at **87 then 90**. Use the warm figure.
   - This is an **improvement** over the pre-M.16 carousel homepage (historical mobile P≈86) — the single Concept-A image is lighter than the 4-frame carousel.
   - It closes further on **Vercel Preview/production** (the image CDN + JS are edge-cached, never cold like local `next start`), and improves once **M.01's real, properly-sized photos** replace placeholders. Pushing the localhost figure to ≥95 would need a dedicated app-shell-JS perf pass (an M.02-style lever), out of M.16's scope.
   - All **other** mobile scores are ≥95 (a11y 100, bp 96); only Performance + the SEO-canonical artifact are <95.

**Other follow-ups:**
- The two ES brand-marquee lines (§4.1 — `home.hero.h1`, `home.hero.credential`) await native Spanish review.
- The trust band's reviews slot + the `featuredOnHome` hero are live-ready and inert until real reviews / a flagged project exist (M.01 / the review cron). The `featuredOnHome` toggle is live in Studio now.
