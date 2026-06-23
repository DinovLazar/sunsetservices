# Hand-off B — Code Completion Report

**Phase:** Step 2 (Hand-off B) — Confirmed-facts corrections, `/dev/system` removal, GA4 finish, Calendly cut
**Branch:** `phase/step2-confirmed-facts` (off `main`)
**Date:** 2026-06-23
**Author:** Code
**Decisions-first commit:** `c66090d` (appended to `Sunset-Services-Decisions.md` before any source change)

All facts below are Erick-confirmed (2026-06-22). Verbatim review text came from the operator-supplied `Hand-off-B-Code-edit-list.md` §2c.

---

## Disposition of each task

### 1. Brand name → "Sunset Services U.S." — ✅ DONE
- New single-source constants in `src/lib/constants/business.ts`: `BUSINESS_NAME_FULL = 'Sunset Services U.S.'`, `BUSINESS_LEGAL_NAME = 'E VALLE INC'` (kept `BUSINESS_NAME = 'Sunset Services'` for conversational copy).
- Applied the full name on the formal/structured surfaces:
  - `LocalBusiness` + `Organization` schema `name` and added `legalName` (`src/app/[locale]/layout.tsx`).
  - Root metadata site-name default (`layout.tsx`).
  - OpenGraph/Twitter `siteName` (`src/lib/seo/openGraph.ts`).
  - Header + footer logo `alt` (`src/components/global/Logo.tsx`).
  - Contact-page business name (`ContactMapPlaceholder.tsx`).
  - Email templates — header wordmark + footer business name (`src/lib/email/tokens.ts` `business.name`, added `legalName`).
  - Copyright line → `© {year} E VALLE INC dba Sunset Services U.S.` in the site footer (`chrome.footer.copyright`, EN + ES) and the email footer (`EmailLayout.tsx`).
- Wrong-variant grep (`Sunset Services US`, `SunSet Services`, missing-final-period, singular) is **clean** (case-sensitive).
- **Decision Code made:** per the BG-01 §2.1.1 DBA rule ("do not clumsily append U.S. to every sentence"), the ~40 per-page descriptive `<title>` strings and flowing body copy keep the conversational **"Sunset Services"**. The canonical site-name *authority* (root title default, OG `siteName`, schema `name`/`legalName`) carries the full name. The chat knowledge-base doc title also stays conversational. EN + ES (the brand name does not translate).

### 2. Founding year → 2000; second generation — ✅ DONE (mostly already correct)
- "Family-run since 2000 / 25+ years" verified consistent sitewide; no "1998" present.
- Founder Nick → owner Erick (took over 2018); "second-generation" wording confirmed; no third-generation phrasing; no "Solis" (M.14/M.15 cleanup verified in code/data/messages).
- Fixed `about.body2` (EN + ES) so it no longer ties the hardscape division to 2018 — see Task 4.

### 3. Unilock-authorized year → 2021 — ✅ DONE
- `src/data/blog.ts` opening of the "why-unilock-premium-pavers" article (EN + ES) reworded: dropped "laying Unilock since 2003", "two competitor brands during 2008–2010", and "23 years of installs" → "a Unilock Authorized Contractor since 2021 … years of hands-on paver experience".
- `about.body2` now reads "took the company over … in 2018, then launched the Unilock-authorized hardscape division in **2021**".
- Unilock-year grep confirms **no page states any Unilock year other than 2021** (the only other year-near-Unilock hits are 2026 cost-year references, which are legitimate). Homepage UNILOCK card stays year-free (M.16 D3).

### 4. Hardscape division → 2021; no install count — ✅ DONE
- Hardscape division year stated as 2021 in `about.body2`.
- **No install-count claim found anywhere** (M.14 already removed "380+"); verified by grep (`380`, `installs`, `200+ install`).
- Softened two stale per-town route years in `src/data/locations.ts` (EN + ES): Batavia "mowing since 2003" → "for over two decades"; Winfield "working … in 2010" → "for years". **Decision Code made:** these were landscaping/maintenance-route flavor years (not Unilock/hardscape claims) that postdate the 2000 founding; softened to drop unverifiable specifics and satisfy the sweep, preserving meaning.

### 5. Google rating + count → 4.8 / 37 (+ schema) — ✅ DONE
- Single source of truth: `src/lib/constants/reviews.ts → BUSINESS_RATING = {value: 4.8, count: 37}`.
- New shared `src/components/ui/GoogleRating.tsx` renders **"★★★★★ 4.8 · 37 Google reviews"** identically (tone-aware: dark/light) with an `aria-label`.
- Wired into: homepage trust band (`HomeSocialProof`, dark), About credentials (`AboutCredentials`), division social proof (`AudienceSocialProof`), and the location trust band (`LocalTrustBand`) — so it shows on every city page.
- Valid `AggregateRating(4.8, 37)` added to the sitewide `LocalBusiness` graph node (`layout.tsx`).
- Count never exceeds the real 37; values structured so the future live feed overrides the constant with no rework.

### 6. Three real Google reviews (verbatim) + Review schema — ✅ DONE
- The three reviews ship **verbatim** as a snapshot constant (`REVIEW_SNAPSHOT`):
  - **Mark C** — 5★ — "Excellent job on restoring my paver patio. They lowered a sitting wall, added capstone, strengthened stairs, power washed and added new polymeric sand. Would definitely use again…"
  - **Sally Del Vecchio McKibbon** — 5★ — "We recently hired Sunset for a water feature and paver patio. The crew was great and kind. They were on time. Would highly recommend."
  - **Kelli Batitsas** — 5★ — "Sunset exceeded our expectations! They knocked our firepit out of the park. The guys that did the work were fast and professional. Marcin, who came out to quote us, was also…"
- `getPublishedReviews()` (homepage slot) falls back to the snapshot while Sanity is empty; the live GBP feed overrides it automatically.
- `Review` schema for all three added to the `LocalBusiness` graph node (`reviewBody`, `reviewRating`, `author`).
- **Decisions Code made (surfaced, no fabrication):**
  - **Towns were not supplied** in the operator note → review **cards render attribution-only**; the cards are **not** forced into the division `name, city` format (no town invented). The aggregate rating shows on those surfaces instead.
  - **`datePublished` omitted** from the Review schema — the exact review dates were not supplied (note says "~1 year ago"); a precise date was not invented. `publishedAt` is an internal ordering field only.
  - **Spanish review text = the original English** — these are real English-language reviews; translating a customer's words would misrepresent them. A native-Spanish pass is out of scope.
  - Two reviews are truncated at source ("…"); kept as supplied (full GBP text was not reachable). No reviewer was dropped — all three had verbatim text.

### 7. Remove the award — ✅ DONE (verified gone)
- "Top 5 Landscaping — DuPage Tribune · 2024" was already removed from render in M.14. The remaining literal mentions lived only in `CredentialBadge.tsx` code comments; reworded so a `DuPage Tribune` / `Top 5` grep over source is **clean**.

### 8. Waterproofing division — ✅ CONFIRMED, no change needed
- Full audit (division data, dynamic routing, header/footer/mobile nav, Service/FAQ schema, sitemap, hreflang, internal links, brand/NAP strings) found waterproofing **present and consistent** with the other divisions. It stays at launch. No code change required.

### 9. Delete `/dev/system` — ✅ DONE
- Deleted `src/app/[locale]/dev/` (the `system/page.tsx` + `system/_client-demos.tsx` demo testimonials). Confirmed absent from the build route manifest.
- Nothing imported it. Updated the sitemap comment (it was already excluded from emission) and removed the now-dead `/dev/system` entries from the SEO + links validators (`validate-seo.mjs`, `validate-links.mjs`) so the harnesses stay green.

### 10. GA4 finish + conversion events — ✅ DONE
- GA4 (`G-RY6NT70SH7`) fires via GTM (`GTM-NL5XX4DV`), gated behind Consent Mode v2 (env-driven `NEXT_PUBLIC_GTM_ID` / `NEXT_PUBLIC_GA4_MEASUREMENT_ID`); `test:consent` stays green (23/23).
- Conversion events **verified already wired**: quote-submit (`quote_submit_succeeded`), contact-submit (`contact_submit_succeeded`), chat-lead (`lead_capture_submit_succeeded`).
- **Gap closed:** there was no dedicated quote-wizard **start** event (only `wizard_step_advanced`). Added `quote_start` (`ANALYTICS_EVENTS.WIZARD_STARTED` / `WIZARD_EVENTS.STARTED`), fired once on wizard mount via a ref-guarded effect in `WizardShell.tsx`. It flows through the existing `AnalyticsBridge → pushDataLayer` path and is gated on the analytics consent signal.
- **Events verified present:** `quote_start`, `quote_submit_succeeded`, `contact_submit_succeeded`, `lead_capture_submit_succeeded`.

### 11. Cut Calendly at launch — ✅ DONE
- `CalendlyEmbed` already gates on `NEXT_PUBLIC_CALENDLY_ENABLED === 'true'` **and** non-empty `NEXT_PUBLIC_CALENDLY_URL`, and only renders the URL link when the URL is set (`showUrlLink = url !== ''`) — when empty it shows a tel-only fallback card with **no personal link**. This is the env-driven, hide-when-empty pattern the brief asked for; no component change was needed.
- Set the committed `.env.local.example` default to **empty + disabled** (`NEXT_PUBLIC_CALENDLY_URL=`, `NEXT_PUBLIC_CALENDLY_ENABLED=false`) with a re-enable note, so the documented launch state ships no widget and no `dinovlazar2011` link. The personal link is not hardcoded anywhere in source.
- **Launch config (operator action, not code):** leave `NEXT_PUBLIC_CALENDLY_URL` empty/unset on Vercel. Re-enabling post-publish with Erick's real URL is a one-env-var change, no code edit.

### 12. Sitewide consistency sweep — ✅ DONE
- Case-insensitive + case-sensitive greps run across `src/`, `src/data/`, `src/messages/`, schema builders, email templates. All confirmed-fact targets clean: brand variants, `DuPage Tribune`/`Top 5`, `since 2003`/`since 2010`/`fifteen years`, `380`/`installs`, `4.5`/`4.9`/`26 review`/`287`/`200+ install`, `Solis`/`third generation`/`his son`. Remaining `2026` hits are legitimate cost-year references.
- EN/ES leaf parity preserved (**1268 ↔ 1268**, no missing keys either direction).

---

## Calendly hidden-state confirmation

**Verified** by building with `NEXT_PUBLIC_CALENDLY_URL=` empty + `NEXT_PUBLIC_CALENDLY_ENABLED=false` (the launch config) and inspecting the served HTML of `/contact`, `/es/contact`, `/thank-you`, `/es/thank-you`:

| Page | personal `dinovlazar` link | `calendly-inline-widget` | tel fallback |
| --- | --- | --- | --- |
| `/contact` (EN/ES) | 0 | 0 | present |
| `/thank-you` (EN/ES) | 0 | 0 | present |

No Calendly widget, no `dinovlazar2011` link anywhere, no broken/empty block — the fallback tel CTA renders. (`NEXT_PUBLIC_*` is build-time inlined, so on Vercel the empty var produces this by construction.) Re-enabling is one env var, no code edit.

## GA4 events verified

`quote_start` (new), `quote_submit_succeeded`, `contact_submit_succeeded`, `lead_capture_submit_succeeded` — all dispatched through `AnalyticsBridge → pushDataLayer`, gated on the analytics consent signal, behind GTM Consent Mode v2.

---

## Validation harnesses (all green on the final shipping build)

| Harness | Result |
| --- | --- |
| `build` | ✅ exit 0 (`/dev/system` absent from route manifest) |
| `lint` | ✅ 0 errors (11 pre-existing warnings in untouched files) |
| `test:consent` | ✅ 23 / 23 passed |
| `validate:schema` | ✅ PASS |
| `validate:related-links` | ✅ PASS (runs as `prebuild`) |
| `validate:seo` | ✅ 0 errors / 0 warnings across 182 URLs + sitemap + robots |
| `validate:a11y` | ✅ 20 / 20 PASS (axe AA 0, SC 2.4.11 0, SC 2.5.8 0, Lighthouse a11y 97–100) — **two consecutive clean runs** |
| `validate:mobile` | ✅ 0 errors (906 non-blocking warnings) |
| `validate:links` | ✅ 0 broken / 0 hard internal failures |
| EN/ES leaf parity | ✅ 1268 ↔ 1268 |

### a11y harness — pre-existing flake fixed (per the user's decision to fix it here)

`validate:a11y` was failing on the four image-heavy **detail-page templates** (service / project / resource / city detail) — `axe 2` (color-contrast + target-size), Lighthouse 93–94. **Not caused by this phase:** I changed zero navbar/hero/breadcrumb/footer code, and 3 of the 4 failing pages have no changes from this phase. Diagnosis (proven): running any one of those pages **in isolation passed clean (axe 0)** while the full 20-URL sequential run failed — a **timing race**. The validator measured contrast after `domcontentloaded` + `networkidle` but **before the hero photos decoded**, so axe intermittently composited the cream over-image / over-dark-section text against the transient **white page fallback** (contrast 1.04) instead of the settled dark background. (`AudienceHero`/`HomeHero` passed because their black `rgba(0,0,0,…)` scrim reads darker than the detail heroes' lighter `green-900` scrim for the same opacity.) Three deterministic fixes, no design change:
1. **`scripts/validate-a11y.mjs`** — after `networkidle`, wait for fonts + the **eager (hero) images to decode** + a double-rAF settle before running axe (lazy/below-fold images excluded so it never blocks). This is the root-cause fix; it makes the measurement deterministic for every page.
2. **`ServiceHero.tsx`** — aligned the full-bleed hero scrim to the proven black-gradient pattern (mobile `rgba(0,0,0,0.05→0.60)`, desktop `0→0.55`) so bottom-aligned cream copy clears AA over any photo. Visually near-identical (a hair more neutral); a real readability improvement.
3. **`NavbarLink.tsx`** — added `min-h-[24px]` so desktop nav links deterministically clear the SC 2.5.8 24×24 target floor.

Result: 20/20 PASS on two consecutive runs (Lighthouse a11y 97–100). The over-image hero text now reports as axe **incomplete** (manual-review, the correct verdict) rather than a flaky violation.

---

## Out-of-scope respected

No 301 redirects, no social-link changes, no live-reviews feed wiring, no image swaps, no DNS/cutover, no Spanish native review, and no content M.14 removed was reintroduced.

## Files changed

- `src/lib/constants/business.ts` — `BUSINESS_NAME_FULL`, `BUSINESS_LEGAL_NAME`
- `src/lib/constants/reviews.ts` — **new** `BUSINESS_RATING` + `REVIEW_SNAPSHOT`
- `src/components/ui/GoogleRating.tsx` — **new**
- `src/app/[locale]/layout.tsx` — schema name/legalName, AggregateRating, Review[], site-name
- `src/lib/seo/openGraph.ts` — `siteName`
- `src/components/global/Logo.tsx` — logo `alt`
- `src/components/sections/contact/ContactMapPlaceholder.tsx` — contact business name
- `src/lib/email/tokens.ts`, `src/lib/email/components/EmailLayout.tsx` — email name + copyright
- `src/components/sections/home/HomeSocialProof.tsx` — review snapshot fallback + rating
- `src/components/sections/about/AboutCredentials.tsx`, `.../audience/AudienceSocialProof.tsx`, `.../location/LocalTrustBand.tsx` — rating
- `src/components/ui/CredentialBadge.tsx` — comment cleanup (award strings)
- `src/data/blog.ts` — Unilock 2021 rewording (EN + ES)
- `src/data/locations.ts` — Batavia/Winfield year softening (EN + ES)
- `src/messages/en.json`, `src/messages/es.json` — copyright, `about.body2`, new `ratings` namespace
- `src/lib/analytics/events.ts`, `src/lib/wizard/events.ts`, `src/components/wizard/WizardShell.tsx` — `quote_start`
- `.env.local.example` — Calendly launch-cut default
- `src/app/sitemap.ts`, `scripts/validate-seo.mjs`, `scripts/validate-links.mjs` — `/dev/system` cleanup
- `scripts/validate-a11y.mjs`, `src/components/sections/service/ServiceHero.tsx`, `src/components/layout/NavbarLink.tsx` — a11y flake fix (added mid-phase per the user's decision; see the a11y harness note above)
- **Deleted:** `src/app/[locale]/dev/` (system route + demo data)

## Mid-phase decision (user-directed)

The pre-existing detail-page `validate:a11y` failure was surfaced to the user (it predates this phase and is navbar/hero chrome, outside the confirmed-facts scope). The user chose **"fix the navbar/hero a11y here too"**, so the three a11y fixes above were added to this PR. Every other change is strictly the confirmed-facts / launch-config scope.
