# Phase M.14 — Goran QA Corrections (B-09 Pre-Launch Punch List) — Completion

**Branch:** `qa/b-09-corrections` (cut from `main`)
**Date:** 2026-06-19
**Outcome:** Every Group A item fully fixed; every Group B item's false/inflated/unverifiable content removed with layouts intact. Nothing fabricated. `npm run build` passes (✓ Compiled successfully, 190/190 static pages), `npm run lint` clean (0 errors), EN/ES leaf-key parity preserved (1248 = 1248, identical sets).

This table feeds the reply to Goran. Each B-09 item → disposition + files touched + exact before→after.

---

## Disposition table

| B-09 § | Item | Disposition | Files |
|---|---|---|---|
| 3.1 | Fake/templated testimonials | **Removed** | messages (home + 4 divisions), `locations.ts` (22 cities), `HomeSocialProof.tsx`, `AudienceSocialProof.tsx`, `[division]/page.tsx` |
| 3.2 | Inflated/inconsistent rating + count | **Removed** | messages (home hero, home social, 4 divisions, about), `HomeSocialProof.tsx`, `CredentialBadge.tsx`, `AboutCredentials.tsx` |
| 3.3 | Wrong owner surname "Erick Solis" | **Fixed** | `messages/en.json` (es already correct) |
| 3.4 | Conflicting Unilock/hardscape dates | **Fixed (removed unverified specifics; "since 2000" kept)** | messages en+es (home hero, divisions hardscape) |
| 3.5 | "Erick or his son picks up" | **Fixed** | `locations.ts` (all cities, EN+ES), home about line (EN+ES) |
| 3.6 | Unverifiable award "DuPage Tribune · 2024" | **Removed** | messages en+es (home social, about), `HomeSocialProof.tsx`, `CredentialBadge.tsx`, `AboutCredentials.tsx` |
| 3.7 | Placeholder social links → generic homepages | **Removed / env-driven (hidden)** | `SocialIcons.tsx`, `.env.local.example` |
| 3.8 | Calendly personal URL | **Confirmed env-driven (no code change needed)** | (verified `CalendlyEmbed.tsx`) — M.14b |
| 3.9 | Patios page shows lawn-care pricing | **Fixed (all 6 hardscape services)** | `services.ts` |
| 3.10 | FAQ renders literal "###" | **Fixed at component + schema** | `lib/faqText.ts` (new), `FaqAccordion.tsx`, `schema/article.ts` |
| 3.11 | Blog & Resources link to hub, not articles | **Investigated → removed nav placeholders** | `navigation.ts` (index pages already correct) |
| 3.12 | Preview indexable | **Fixed (noindex off-prod)** | `lib/seo/urls.ts`, `robots.ts`, `[locale]/layout.tsx` |
| 4 | Image alt-text (text only) | **Fixed** | 6 components + location.projects messages (EN+ES) |
| 4 (photos) | Photo replacement (residential-1/2/3, waterproofing hero + wizard tile) | **Deferred to M.14b / M.01** (real photos needed; not fabricated) | — |
| 5 | Quantified claims to verify | **Mixed: unverified specifics removed; generic safe claims kept + flagged** | see §5 notes below |

---

## Group A — full fixes

### A1 · Erick Solis → Erick Valle (§3.3)
- `src/messages/en.json` `home.about.portraitAlt`:
  - **Before:** `"Erick Solis on a DuPage County job site at golden hour."`
  - **After:** `"Erick Valle on a DuPage County job site at golden hour."`
- ES already read "Erick Valle" (fixed in Phase M.11). Repo-wide grep for `Solis` now returns **zero** matches in code/data/messages (only historical mentions in `_project-state/*` completion logs, which are immutable records).

### A2 · Second-generation wording (§3.5)
- `src/data/locations.ts` — every city brand-story line (EN+ES). Examples:
  - `"…When you call (630) 946-9321, Erick or his son picks up."` → `"…Erick picks up."`
  - `"…you get Erick or his son."` → `"…you get Erick."`
  - ES `"…te atiende Erick o su hijo"` → `"…te atiende Erick"`; `"Erick o su hijo contestan"` → `"Erick contesta"`.
- `src/messages/{en,es}.json` `home.about.h2Line2`:
  - EN: `"Run today by his son, Erick."` → `"Run today by Erick, the second generation."`
  - ES: `"Hoy lo dirige su hijo, Erick."` → `"Hoy lo dirige Erick, la segunda generación."`
- No "his son" / "su hijo" / third-generation phrasing remains in code/data/messages.

### A3 · Hardscape pricing copy (§3.9)
- Root cause: all 6 hardscape services reused `GENERIC_FACTORS` (lawn-care: "Service frequency: one-time, weekly, every-other-week, or seasonal" / "Add-ons: aeration, overseeding…").
- Added `HARDSCAPE_FACTORS` in `src/data/services.ts`: **Square footage & layout**, **Materials & base prep** (paver line, stone, engineered base for freeze/thaw), **Site access & structures** (machine access, grading, walls/steps/drainage). EN+ES.
- Pointed all 6 hardscape services at it: `patios-walkways`, `retaining-walls`, `fire-pits-features`, `pergolas-pavilions`, `driveways`, `outdoor-kitchens`. Landscape/lawn services keep `GENERIC_FACTORS` (correct there). Audited: hardscape division has exactly these 6 services; no other mis-applied template found.

### A4 · FAQ literal "###" (§3.10)
- New `src/lib/faqText.ts` → `stripFaqHeadingMarker()` strips a **leading** Markdown heading marker (`/^\s*#{1,6}\s+/`).
- Applied at **component level** (`FaqAccordion.tsx`, the single shared FAQ renderer used by service / location / blog / resource / audience FAQs) and at **schema level** (`schema/article.ts buildContentFaqSchema` — the single FAQPage builder all FAQ surfaces use). So both the rendered `<h3>` and the `FAQPage` JSON-LD `Question.name` are clean.
- Note: the `###` strings live in Sanity FAQ documents (not in the repo). The component/schema fix is source-agnostic. (The `###` in `src/data/blog.ts` are legitimate Markdown subheadings inside article **bodies** — untouched.)

### A5 · Blog & Resources linking (§3.11)
- **Investigated.** The `/blog/` and `/resources/` index pages AND their `[slug]` detail routes both read from Sanity (`getAllBlogPosts`/`getAllResources`/`…BySlug`); cards link to `/blog/${slug}/` and `/resources/${slug}/` and resolve correctly. **The index/detail routing is NOT broken.**
- The real bug: the **Resources mega-panel** listed invented placeholder titles (`Spring Lawn Care Calendar`, `When to Re-seal Your Patio`, …) whose links ALL pointed at the hub (`col.headerHref` = `/resources/` or `/blog/`), not at real articles — exactly Goran's "link to the hub, not real articles."
- **Action (case: listed title has no backing content → remove from nav):** emptied `placeholderKeys` for both columns in `navigation.ts`. The column headers still link to the real `/resources/` and `/blog/` index pages (which list the actual published articles). Renders on both desktop (`ResourcesMegaPanel`) and mobile (`NavbarMobile`, which flat-maps the now-empty list). M.14b can wire the children to real article titles + slugs.

### A6 · Image alt-text (§4, text only)
- Service-area "Recent projects" tiles (`LocalProjectsStrip.tsx`): `alt=""` → `alt={t('location.projects.tileAlt', {city})}` = "A recent Sunset Services landscaping and hardscape project in {city}" (new EN+ES key).
- Audience featured projects (`AudienceFeaturedProjects.tsx`): `alt=""` → `alt={p.title}`.
- Service featured projects (`ServiceFeaturedProjects.tsx`): `alt=""` → `alt={t.title}`.
- Location services grid (`LocationServicesGrid.tsx`): `alt=""` → `alt={s.name}`.
- Audience services grid (`AudienceServicesGrid.tsx`): `alt=""` → `alt={s.name[locale]}`.
- Service hero (`ServiceHero.tsx`): `alt=""` → `alt={serviceName}`.
- City cards (`LocationCard.tsx`): `alt=""` → `` alt={`Landscaping and hardscape in ${cityName}, ${state}`} ``.
- Location hero already had a specific city alt (no change). Brand-story alt name fixed in A1.
- Remaining `alt=""`: `wizard/PhotoUploadField.tsx` (form upload preview) and `og/fallback/route.tsx` (server-generated OG image) — both legitimately decorative; left as-is.
- **Photo replacement** (residential-1/2/3.jpg → real Aurora jobs; `hero-residential.jpg` on waterproofing; waterproofing quote-wizard tile) needs real assets → **deferred to M.14b / M.01**, not fabricated. No mis-referenced existing real asset was found to simply swap.

### A7 · Preview noindex (§3.12)
- New `isProductionDeploy()` in `src/lib/seo/urls.ts` → `process.env.VERCEL_ENV === 'production'`.
- `robots.ts`: non-production returns `User-agent: * / Disallow: /` (no sitemap line). Production keeps the existing rules + sitemap.
- `[locale]/layout.tsx`: non-production adds `robots: {index:false, follow:false}` sitewide; production has no robots field so pages stay indexable (per-page metadata like `/unsubscribe` still sets its own noindex). No env change needed on Vercel — `VERCEL_ENV` is automatic.
- The 301-redirect map + production sitemap readiness (§3.12) are publishing-phase items (**P.02 / P.04**) — not actioned here.

---

## Group B — removed now, real values added in M.14b

### B1 · Testimonials (§3.1)
- Removed every hardcoded/templated review: `home.social.reviews` (3), each division `socialProof.reviews` (landscape/hardscape/waterproofing/snow, 2 each), and all 24 `testimonials: [...]` arrays in `locations.ts` → `testimonials: []`.
- `HomeSocialProof.tsx` rewritten: testimonial cards + aggregate row dropped; section is now a clean credentials band.
- `AudienceSocialProof.tsx`: testimonial heading + grid render only `if (reviews.length > 0)`; with reviews empty (division page now passes `reviews = []`) the section collapses to a credentials band with no dangling heading or top border.
- `LocalTestimonials.tsx` already guards `if (testimonials.length === 0) return null;` → city testimonial sections hide cleanly.
- **No replacement quotes written.** Real verbatim Google reviews + the live feed land in M.14b / the daily-reviews cron.

### B2 · Rating + count (§3.2)
- Removed every hardcoded rating/count: home hero `trust.rating` ("★ 4.8 on Google · 200+ reviews"), home `social.aggregate*` + `RATING`/`REVIEW_COUNT` consts, all four divisions' `credentials.one` ("★ 4.9 · Google · 287 reviews"), and the About `google` badge ("★ 4.8") + `CredentialBadge` `google` kind.
- Layout preserved with verifiable, **number-free** replacements: home hero chip → "Family-run"; division credential one → "Family-run / since 2000"; About → "Licensed & insured" badge.
- **No fabricated `AggregateRating`** ships: `schema/location.ts` only emits `aggregateRating` when `getPublishedReviewsForCity()` returns real reviews — today it returns `[]` for every city, so the node is omitted (verified by the B.04 schema harness; unchanged here). No other hardcoded `AggregateRating` exists.

### B3 · "DuPage Tribune · 2024" award (§3.6)
- Removed from Home (`HomeSocialProof.tsx` Top-5 block + `home.social.cred.top5/top5sub`) and About (`CredentialBadge` `tribune` kind + `about.credentials.tribune`).
- Replaced with verifiable credentials: Home → "EN · ES / bilingual crews"; About → "Bilingual crews" badge. A documented award returns in M.14b only if Erick confirms one with proof.

### B4 · Unilock / hardscape dates (§3.4)
- Hero (home `hero.sub`): "Family-run, Unilock-authorized, since 2000." → "Family-run, serving DuPage since 2000." (no longer ties Unilock to 2000).
- Removed unverified specifics: home `divisions.hardscape.desc` "Unilock-authorized since 2010" → "Unilock-authorized installs"; hardscape `whySunset.props.one` "Held for fifteen years and counting" → "Earned by proven install quality"; `props.four` "20+ years on hardscape / laying pavers since 2003" → "Seasoned paver crew / deep Unilock paver experience"; `unilock.body` "fifteen years and counting" → "years of proven work"; `unilock.stat` "FIFTEEN YEARS · 380+ INSTALLS · 5-YEAR…" → "UNILOCK AUTHORIZED · 5-YEAR INSTALLATION WARRANTY"; hardscape `credentials.four` "380+ Unilock installs" → "EN · ES bilingual crews"; FAQ "Authorized Contractor since 2010" → "a Unilock Authorized Contractor".
- Also fixed a founder/date contradiction (landscape `whySunset.props.one`): "Erick founded Sunset Services in 2000" → "Family-run since 2000" (the About story is consistent: Nick founded in 2000; Erick, his son, took over in 2018).
- "since 2000 / 25+ years" kept consistently for the company, EN+ES. The exact "Unilock-authorized since [year]" + "hardscape division since [year]" lines return in M.14b once Erick confirms.

### B5 · Social links (§3.7)
- `SocialIcons.tsx` is now env-driven (`NEXT_PUBLIC_SOCIAL_{GBP,FACEBOOK,INSTAGRAM,YOUTUBE}_URL`). Each icon renders only when its var holds a real URL; with none set, the component returns `null` (no empty `<ul>` shell). Generic-homepage links removed. Vars documented in `.env.local.example`. M.14b sets the real profile URLs in Vercel.

---

## §5 — quantified claims: kept vs removed

**Removed (unverified specifics / read as placeholder):** "380+ Unilock installs," "fifteen years and counting," "since 2010," "since 2003," "1,200+ properties served," "4.8/4.9," "200+/287 reviews," "Erick founded in 2000," "Top 5 — DuPage Tribune · 2024."

**Kept (plainly safe / substantiated on-page) — flag for Erick to confirm:**
- "$2M general liability" (snow credential + landscape/about FAQ) — standard, plausible insurance figure; substantiated as a credential.
- "2-hour response after trigger" + "24/7 dispatch" (snow) — operational SLA stated consistently.
- "5–25-year warranties per service" (waterproofing credential) — substantiated by the waterproofing FAQ (interior drain tile 25y, exterior membrane 10–15y, crack repair 5–10y).
- "two decades of paver experience" / "20+ years on hardscape" (hardscape hero/qualifier/h2) — generic crew-experience claim not tied to a founding year; left in place but flagged.
- "a quarter of jobs within a ten-minute drive," "Naperville/Aurora is a third of our book," named neighborhood tenures ("15+ years on our routes"), specific project addresses in `locations.ts` whyLocal copy — generic local-knowledge narrative, not obvious placeholders; left in place.
- "25+ years," "since 2000," "free 48-hr estimate" — verified/standard; kept.

---

## M.14b checklist (pending Erick — do NOT guess)
1. **Calendly:** set the official Sunset Services `NEXT_PUBLIC_CALENDLY_URL` in Vercel (code already env-driven; currently the personal `dinovlazar2011` URL in `.env.local.example`).
2. **Google rating + count (B2 refill):** real public GBP rating + review count → restore a real aggregate display + `AggregateRating`.
3. **Testimonials (B1 refill):** real verbatim Google reviews; later the live daily-reviews cron feed.
4. **Unilock + hardscape years (B4 refill):** confirmed "Unilock-authorized since [year]" + "hardscape division since [year]" + install count.
5. **Award (B3):** confirmed award + proof, or permanent drop.
6. **Social URLs (B5 refill):** real Facebook/Instagram/YouTube/GBP profile URLs → set `NEXT_PUBLIC_SOCIAL_*` in Vercel.
7. **Photos (A6 / M.01):** real Aurora job photos for residential-1/2/3, waterproofing hero (`hero-residential.jpg`), waterproofing quote-wizard tile.
8. **§5 confirmations:** $2M GL, 2-hr response, 5–25-yr warranties, hardscape-tenure phrasing, named project addresses.
9. **Resources mega-panel:** wire children to real article titles + slugs (optional UX restore).

## Publishing-phase (NOT M.14)
- 301-redirect map (**P.02**), production sitemap readiness (**P.04**) per §3.12.

## Verification run
- `npm run lint` → 0 errors (11 pre-existing warnings, none from this phase).
- `npm run build` → ✓ Compiled successfully; 190/190 static pages generated (division/service/location SSG pages render with empty reviews and the new pricing/alt/credential data — no missing-key runtime errors).
- EN/ES leaf-key parity: 1248 = 1248, identical sets.
- Carryover for the Vercel Preview walkthrough: spot-check Home, About, `/hardscape/patios-walkways/`, Aurora, a snow page, a waterproofing page in EN+ES; confirm noindex header on the preview deploy; re-run `npm run validate:{schema,seo,a11y}` against the preview URL (needs a running deploy).
