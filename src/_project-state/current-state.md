# Current State

> **Live snapshot of the repo.** Updated end of every phase. If this file disagrees with the live code, the live code wins (per `Sunset-Services-Project-Instructions.md` §8).

---

## Where we are

- **Last completed phase:** Part 2 — Phase 2.01 (Cowork: Account-Creation Runway). Seven external accounts provisioned (Cloudflare, Sanity, Vercel, Resend, Anthropic, Telegram bot, GitHub 2FA carryover resolved). Step 7 (GCP + Places API + GBP API application) deferred to a new Phase 2.13.2 per user decision.
- **Next phase:** Part 2 — Phase 2.02 (Code: Vercel preview deploy).
- **Date:** 2026-05-10

---

## What works on `localhost:3000`

- `/` (and `/es`) — full homepage at EN/ES per Phase 1.06 handover §3–9.
- `/{audience}/` (3 audiences × 2 locales = 6 URLs) — Residential, Commercial, Hardscape audience landings per Phase 1.08 §3 + §3X. Eight content sections + Hardscape's Unilock band (charcoal) + Hardscape charcoal CTA per D6.
- `/{audience}/{service}/` (16 services × 2 locales = 32 URLs) — All 16 service pages render from `src/data/services.ts` with production-grade EN+ES seed content per Phase 1.08 §4.10. All 9 sections per Phase 1.08 §4. Phase 1.10 fixed the previously-broken `/commercial/snow-removal/` URL (was `/commercial/commercial-snow-removal/` in 1.09).
- `/about/` (and `/es/about/`) — six sections per Phase 1.11 handover §2.1: Hero → Brand story → Team → Credentials → Projects teaser (HomeProjects literal reuse, §3.6) → CTA. Surface alternation white/cream/white/cream/white/cream. Person × 3 + BreadcrumbList JSON-LD. Visible breadcrumb on hero (on-dark variant) so the visible navigation matches the schema (master plan §2.9).
- `/contact/` (and `/es/contact/`) — five sections per Phase 1.11 handover §2.2: Hero → Info+Form → Map → Calendly placeholder → Service-area strip. Zero body amber CTAs (D11 — page IS the conversion surface). Static map placeholder (D8) + Calendly placeholder (D9, tel: fallback). ContactPage + BreadcrumbList JSON-LD. ContactForm is the ONLY client component on the page; everything else is server-rendered. Phase 1.14: now consumes the promoted `<ServiceAreaStrip>` (no `excludeSlug`, default behaviour).
- `/service-areas/` (and `/es/service-areas/`) — Phase 1.14 §3 — four sections: Hero (split text + static SVG map of DuPage with 6 pins) → Cities grid (6 LocationCards) → Outside-area band (no CTA, phone + email links) → CTA. Surface alternation bg → cream → bg → cream. `BreadcrumbList` + `ItemList` of 6 Place items (same-source). Static SVG map is server-rendered, no JS, with `<title>` / `<desc>` per locale and per-pin `<Link>` from `@/i18n/navigation`.
- `/service-areas/{aurora,naperville,batavia,wheaton,lisle,bolingbrook}/` (and `/es/service-areas/<city>/`) = 12 routes — Phase 1.14 §4. Nine sections per city: Hero (compact split, photo right) → LocalTrustBand (3 stat cells) → ServicesGrid (6 ServiceCards mapped from `featuredServices`) → ProjectsStrip (3 placeholder tiles, real wiring in Phase 1.16) → Testimonials (1 card, placeholder copy until Phase 2.15) → WhyLocalPanel (shared portrait + per-city ~120-word prose) → ServiceAreaStrip (`excludeSlug={location.slug}`, hides current city) → FAQ (4 native `<details>`) → CTA (shared `<CTA>` with `tokens={{city}}`). Surface alternation bg/cream × 9 (no two adjacent same-surface). Schema: BreadcrumbList + Place + ItemList of 6 Service items + FAQPage, all same-source with the visible DOM. Hero photo carries `priority` + `fetchPriority="high"` (LCP candidate). Single body amber CTA per page (the bottom CTA section).
- `/projects/` (and `/es/projects/`) — Phase 1.16 §3 — five sections: Hero (compact text on cream) → FilterChipStrip (`?audience=` URL state) → ProjectsGrid (3-col / 2-col / 1-col, 12 placeholder tiles via `ProjectCard`) → Pagination (renders only when filtered total > 12; with 12 entries, hidden) → CTA (cream surface). Surface alternation: cream → bg → cream. Schema: `BreadcrumbList` + `ItemList` of 12 `CreativeWork` (each with `creator: {@id}` referencing sitewide `LocalBusiness`). Filter sanitization: unknown `audience` → All; `page` clamped to `[1, totalPages]`. Self-canonical points to the unfiltered/unpaginated route.
- `/projects/{slug}/` (and `/es/projects/<slug>/`) = 24 routes — Phase 1.16 §4. Seven sections per detail: Hero (compact split, breadcrumb under navbar, lead photo `priority`+`fetchPriority="high"`) → Narrative → Gallery (native `<dialog>` lightbox: focus-trap/restore/Esc/←/→ + counter `aria-live="polite"`, 200ms cross-fade with reduced-motion off) → Facts (`<dl>` semantics, 6 rows, deep links to service detail / city / audience) → BeforeAfterToggle (renders only when `hasBeforeAfter:true`; SSR After fallback for no-JS) → RelatedProjects (3 tiles, deterministic same-audience → same-city → most-recent, sort year desc / slug asc) → CTA (`tokens={{city}}` interpolation, destination `/request-quote/?from=project&slug={slug}`). Surface alternation: bg/cream alternating with no two adjacent same. Schema: `BreadcrumbList` + `CreativeWork` (image array same-source with the rendered gallery; `creator: {@id}` references LocalBusiness; `keywords` = audience + service names; `locationCreated.address` Place).
- `/resources/` (and `/es/resources/`) — **NEW (1.18)** evergreen reference index. Four sections: Hero (text-only, white) → FilterChipStrip+Grid (cream) → Help-deciding band (white) → CTA (cream, amber). Single-select `?category=` URL state; filter URLs canonicalize to the un-filtered route. `BreadcrumbList` + `ItemList` JSON-LD same-source with the visible 3-col grid.
- `/resources/{slug}/` (and `/es/resources/{slug}/`) = 10 routes — **NEW (1.18)** Phase 1.18 §4. Six sections per detail: Hero (cream, eyebrow + H1 + dek + ContentMeta — no photo) → ProseLayout body (white, sticky right-rail TOC at xl+, inline collapsed `<details>` below xl, inline `<ServiceCard>` cross-link spliced between H2s where flagged) → FAQ (cream, optional) → Related (white, 3 ContentCards) → CTA (cream, amber). Surface alternation cream/white/cream/white/cream. Schema: `BreadcrumbList` + (`Article` | `HowTo` per `entry.schemaType`) + `FAQPage` if FAQ. `Article` payload includes `wordCount` computed at build from the EN body via `estimateReadingTime` (200 wpm). 5 entries × 2 locales = 10 SSG routes via `dynamic = 'force-static'` + `dynamicParams = false`.
- `/blog/` (and `/es/blog/`) — **NEW (1.18)** time-stamped post index. Three sections: Hero (text-only, white) → Featured-post 2-col + FilterChipStrip + 3-col Grid (cream) → CTA (white, amber). Featured post composes the locked `card-photo` primitive at a wider span — NOT `.card-featured` (handover §2 D16, zero featured-card constraint). Schema: `BreadcrumbList` + `ItemList`.
- `/blog/{slug}/` (and `/es/blog/{slug}/`) = 10 routes — **NEW (1.18)** Phase 1.18 §6. Seven sections per post: Hero (white, eyebrow + H1 + dek + meta + featured image below the meta strip — option B per ratified D14.4) → ProseLayout body (white, shared band with hero — handover §2 D14 row 2; inline cross-link + optional `<ServiceAreaStrip excludeSlug={citySlug} inline />` near body bottom) → FAQ (cream, optional) → Related (white) → bottom CTA (cream, amber, per-category H2 with `{city}` interpolation). 5 posts × 2 locales = 10 SSG routes.
- `/request-quote/` (and `/es/request-quote/`) — **NEW (1.20)** quote wizard. Compact page header + step indicator (desktop dots / mobile bar) + tip card + opacity-only step crossfade (200ms) between five steps + Review/Submit. Step 1 = audience tile select (D4) reusing Phase 1.06 audience photos. Step 2 = audience-driven service multi-select with primary radio (D5). Step 3 = audience-conditional details (D6). Step 4 = name/email/phone (US-formatted)/address with IL-defaulted state and `data-autocomplete-stub="address"` on the street wrapper. Step 5 = single `.card-cream` review with per-step Edit links and an amber Submit. URL-driven step via `?step=N`; autosave Steps 1–3 only to `localStorage` with 30-day expiry behind `NEXT_PUBLIC_WIZARD_AUTOSAVE_ENABLED` (Step 4 PII never persists, per ratified D9). Resume toast on return-visit. Validation on-blur + on-Next with scroll-to-error and focus-to-error (1.11 ContactForm precedent). Sticky-Next is a single `<button>` DOM (CSS positions for mobile vs desktop). Schema: zero (deliberate per D15). Submit handler is a Part-1 simulation (`console.log` + `wizard_submit_succeeded` event + `router.push('/thank-you/?firstName=…')`); Phase 2.06 swaps for real `/api/quote` POST behind `WIZARD_SUBMIT_ENABLED`. Navbar amber "Get a Quote" CTA hidden on this route only (D2).
- `/thank-you/` (and `/es/thank-you/`) — **NEW (1.20)** post-conversion landing. `<meta name="robots" content="noindex,follow">` because the route renders user-supplied data (`?firstName=…`). Five sections: confirmation hero (cream, lucide `CheckCircle2` + eyebrow + H1 with `{firstName}` interpolation) → Calendly placeholder (white) → "What happens next" 3-step explainer (cream) → 3-Q FAQ via native `<details>` (white, no per-item wrapper) → soft return CTAs (cream — projects/blog/home, **zero amber**). `firstName` is server-side-sanitized (HTML-strip + control-char strip + 50-char clamp), falls back to `thanks.titleFallback` when missing. Schema: zero (deliberate per D15).
- **AI chat widget** — sitewide bottom-right amber bubble (56px circle, lucide `MessageCircle`, `--z-chat: 50`). Hidden on `/request-quote/` only (ratified D17 = B); visible on `/thank-you/` and everywhere else. Gated by `NEXT_PUBLIC_AI_CHAT_ENABLED` flag (default `false` in Part 1; flip to `true` to preview locally). The collapsed shell is **7,978 bytes gzipped (≤ 8KB ceiling)** — verified post-build. The expanded panel (welcome state + 3 suggested-prompt chips, message log with assistant + user bubbles, composer with auto-grow textarea + char hint, lead-capture inline form using `WizardField` at `compact` density, kebab menu with Reset, error states for network/rate/api, mobile bottom-sheet `<dialog>` + `showModal()` with drag handle) is `dynamic`-imported on first bubble click — separate **4.9 KB gzipped chunk**. Streaming-stub tokens at ~30ms with a 400ms typing delay + 800ms typing indicator. Inline content is plaintext + URL auto-link only (ratified D24 = A); full Markdown subset deferred to Phase 2.09. Per-locale `sessionStorage` history namespace (`sunset_chat_history_<locale>`). Cookie consent gate (D29) is a stub default-true; Phase 2.11 wires the real banner.
- `/og/{resource,blog}/{slug}/?locale={en,es}` — **NEW (1.18)** Open Graph image route handlers (`next/og` `ImageResponse`). 1200×630 PNG per detail page; per-locale via the `?locale=` query.
- `/og/fallback` — **NEW (1.18)** sitewide branded OG fallback for index pages and any path without a per-content variant.
- `/dev/system` (and `/es/dev/system`) — design-system smoke-test page, unchanged from Phase 1.04.
- Phase 1.05 chrome (sticky navbar, footer, skip-link, language switcher, sitewide `LocalBusiness` JSON-LD) wraps every page unchanged.
- Navbar State B (translucent + blur) triggers on the homepage hero AND on every audience-landing + service-detail hero (NavbarScrollState was extended in 1.09 with a 5-line pathname check).
- Audience-accent CSS custom properties (`--audience-accent` + `--audience-chip-bg`) applied via `data-audience="{slug}"` on the page wrapper. Scoped per page; buttons stay green/amber regardless.
- Per Phase 1.08 §5 schema spec:
  - Audience landings emit `BreadcrumbList` + `ItemList` JSON-LD.
  - Service detail pages emit `BreadcrumbList` + `Service` + `FAQPage` JSON-LD.
  - The sitewide `LocalBusiness` (Phase 1.05) + `WebSite` (homepage only) continue unchanged.
- Per Phase 1.18 §7 schema spec:
  - Resources index + Blog index emit `BreadcrumbList` + `ItemList` JSON-LD.
  - Resource detail pages emit `BreadcrumbList` + (`Article` | `HowTo`) + `FAQPage` (if FAQ) JSON-LD.
  - Blog post pages emit `BreadcrumbList` + `BlogPosting` + `FAQPage` (if FAQ) JSON-LD.
  - Author resolution: `'Erick Sotomayor'` → `Person` with About `#erick` URL; `'Sunset Services Team'` → `Organization` (no URL); other strings → `Person` no URL.
- All 38 (en+es × 19) audience and service routes pre-rendered at build time via `generateStaticParams`.
- FAQ accordions are SSR `<details>` with progressive enhancement to a client island for chevron rotation. **No per-item `<AnimateIn>`** — the primary lever for closing the homepage's mobile P=86 gap on these new templates.

> **Phase 2.01 note:** No `localhost:3000` behavior changed in this phase. Phase 2.01 is account creation only — no routes added, no source code touched. Working tree at end of phase = Phase 1.20 code + Phase 2.01 doc updates.

---

## What does NOT work yet

- Real photography — placeholders generated by `scripts/gen-audience-service-placeholders.mjs` (Phase 1.09) and `scripts/gen-home-placeholders.mjs` (Phase 1.07). Phase 1.16 ships 12 placeholder projects whose lead + gallery + before/after assets alias to existing audience-project / service-project tiles via `imageMap.ts`. Cowork sources real photos from Erick's Drive in Phase 2.04.
- `/projects/?service=…` filtered routes — 404 by design until Phase 2.x; Phase 1.16 ships only the audience-only filter (handover D2.A).
- **Wizard backend** — `/request-quote/` renders, validates, and routes to `/thank-you/` on Submit, but the Submit click is a Part-1 simulation: `console.log` + analytics event + `router.push`. No real `POST /api/quote`, no Mautic, no Resend (Phase 2.06 wires all three behind `WIZARD_SUBMIT_ENABLED`).
- **Chat AI** — the bubble + panel + state machine + UI flows are all real, but the assistant replies are a token-streamed canned-response stub keyed off the suggested-prompt index. No Anthropic SDK, no rate limiter, no kill switch wiring (Phase 2.09 swaps the stub for the real SDK + `/api/chat` + Telegram leads).
- **Calendly** — `/thank-you/` renders a static "Coming soon" placeholder card with a tel-fallback (matches Phase 1.11 ContactCalendlyPlaceholder precedent). Real Calendly iframe is Phase 2.07.
- **Address autocomplete** — Step 4 street wrapper carries `data-autocomplete-stub="address"` for Phase 2.07 to swap for Google Places.
- **Photo upload on Step 3** — D11=B (defer). The wizard renders a `data-photo-upload-slot` placeholder (currently `hidden`) for Part 2 to swap.
- **GTM `dataLayer.push`** — every interactive element carries the appropriate `data-analytics-event="..."` attribute, but no GTM bridge yet. Phase 2.11 reads the attributes from the DOM and forwards to dataLayer.
- **Cookie consent banner** — chat bubble's consent gate is a stub default-true. Phase 2.11 wires the real banner.
- `[TBR]`-flagged Spanish strings — the audience landings and service detail pages ship with first-pass Spanish translations. Native-speaker review happens in Phase 2.13.
- Sanity content (Phase 2.03), AI chat (Phase 1.20 / 2.09), analytics (Phase 2.10), Resend email (Phase 2.08).
- **GBP API write access + Places API read (Phase 2.01 Step 7) — DEFERRED to new Phase 2.13.2 per user decision.** Phase 2.14 (publish to Google Business Profile) and Phase 2.16 (daily reviews on the site) both wait on Phase 2.13.2 completing first. Phase 2.13.2 itself starts a 2–6 week Google review clock for GBP API access.
- **Cloudflare DNS** — account exists with 2FA enabled, no domain added yet. Domain cutover happens in Part 3 Phase 3.11.
- **Resend domain verification** for `sunsetservices.us` (SPF/DKIM/DMARC records) — deferred to Phase 2.08; requires Cloudflare DNS access which we don't have yet.
- **Anthropic billing/security alert routing risk** — the Anthropic API account uses a pre-existing email on a less-used inbox (off-spec from dinovlazar2011@gmail.com per user choice). Neither email-change nor forwarding was set up. If the API ever stops working, first check that inbox for $20-cap or security alerts.

---

## Stack — pinned versions

| Package | Version |
|---|---|
| next | 16.2.4 |
| react | 19.2.4 |
| react-dom | 19.2.4 |
| marked | 18.0.3 |
| typescript | 5.9.3 |
| tailwindcss | 4.2.4 |
| @tailwindcss/postcss | 4.2.4 |
| next-intl | 4.11.0 |
| motion | 12.38.0 |
| lucide-react | 1.14.0 |
| @base-ui/react | 1.4.1 |
| next-sanity | 12.4.0 |
| @anthropic-ai/sdk | 0.92.0 |
| resend | 6.12.2 |
| eslint | 9.39.4 |
| eslint-config-next | 16.2.4 |
| @types/react | 19.2.14 |
| @types/react-dom | 19.2.3 |
| @types/node | 20.19.39 |
| Node.js | v24.14.0 |
| npm | 11.9.0 |

Fonts (loaded via `next/font/google`): Manrope (heading) + Onest (body), subsets `latin` and `latin-ext`.

`sharp` is available transitively via `next` and is used by both placeholder generators (`scripts/gen-home-placeholders.mjs`, `scripts/gen-audience-service-placeholders.mjs`) — not a runtime dep.

---

## Repo

- **Remote (SSH):** `git@github.com:DinovLazar/sunsetservices.git`
- **Default branch:** `main`
- **Visibility:** Private
- **Phase 1.07 commit:** `b66b61c` — homepage + seven sections, Lighthouse 95+ desktop / 86 mobile.
- **Phase 1.09 commit:** `3ea2e1c` — `feat(audience+service): 3 audience landings + 16 service detail pages (Phase 1.09)`
- **Phase 1.10 commit:** `d538d62` — `fix(part-1-phase-10): commercial snow-removal slug + EN aria-label bleed + lint`
- **Phase 1.11 commit:** `f3e4995` — `docs(design): Phase 1.11 about + contact design handover` (handover authored out-of-band, brought into git as Phase 1.11 closure before Phase 1.12).
- **Phase 1.12 commit:** `9c4976a` — `feat(about-contact): about + contact pages, person + contact-page schema (Phase 1.12)`
- **Phase 1.14 commit:** `9279efd` — `feat(service-areas): index + 6 location pages (Phase 1.14)`
- **Phase 1.16 commit:** `3b25238` — `feat(projects): portfolio index + 12 detail pages, lightbox, schema (Phase 1.16)`
- **Phase 1.18 commit:** `254c31c` — `feat(content): Resources + Blog routes, ContentCard/Meta/ProseLayout, schema, OG images (Phase 1.18)`
- **Phase 1.20 commit:** `5dee0b1` — `feat(wizard,chat): quote wizard + AI chat widget UI; Part 1 acceptance pass (Phase 1.20)`
- **Phase 2.01 cleanup commit:** `c6a962c` — `chore(pre-2.01): restore Phase 1.20 baseline + commit untracked Part-1 artifacts` (restored 12 code regressions, committed 4 design handovers + 8 Lighthouse reports, kept v2 doc rewrites in progress, added /.claude/ to gitignore)
- **Phase 2.01 archive commit:** `f97efca` — `chore(docs): archive v1 docs into /archive/v1/ (Phase 2.01)`
- **Phase 2.01 finalization commit:** `e4b323e` — `chore(phase-2.01): close Phase 2.01 (Account-Creation Runway)` (6 files, +361 / -10; created `Sunset-Services-Decisions.md` + `Part-2-Phase-01-Completion.md`, updated 00_stack-and-config / current-state / file-map / .env.local.example)

---

## Open items / known mismatches with the Plan

- **Lighthouse mobile Performance gap (Phase 1.07).** Homepage = 86, audience-landing + service-detail = 84–86. Verified in Phase 1.10 §8: LCP 4.1s on every full-bleed-hero page is the structural ceiling. Three out-of-scope paths to ≥95 noted in 1.07/1.10 reports: AnimateIn → CSS-IO refactor, real photographs (Phase 2.04), `next/dynamic` of below-hero sections.
- **NavbarScrollState was modified in Phase 1.09.** The handover §2.6 specified the page mutate `data-over-hero="true"` on `<main>`; we instead extended NavbarScrollState's pathname-based detection to recognize `/{audience}/` and `/{audience}/{service}/` routes. Five-line addition. Same observable behavior; no page-side coupling.
- **Two services share a URL slug (Phase 1.10).** Both `/residential/snow-removal/` and `/commercial/snow-removal/` exist. Lookup is audience-aware via `getService(slug, audience?)`; assets are disambiguated via the new optional `imageKey` field on the `Service` type. The commercial row uses `imageKey: 'commercial-snow-removal'` so existing placeholder assets continue to resolve. Phase 2.04 photo swap targets the same paths Phase 1.09 set; no rename needed.
- **Phase 1.10 modified 2 routes + 2 components** beyond the data-only scope the prompt suggested. Each change is the minimum-blast-radius fix to a Phase 1.09 carryover bug that the §5 verification suite catches. Surfaced in §11 of Phase 1.10's completion report for Chat ratification.
- **Class-naming convention.** Phase 1.07's choice to use single-hyphen BEM (`.btn-amber`, `.card-photo`, `.btn-ghost.btn-on-dark`) is carried throughout Phase 1.09 components even though the Phase 1.08 handover writes some examples as double-hyphen. Phase 1.03 tokens win per the handover preamble.
- **`pricing.mode === 'price'` is dead code in Part 1.** All 16 services ship with `pricing.mode: 'explainer'` per D5. State A code paths are wired (including the `priceIncludes` body that Erick will populate when he toggles a service in Part 2) but unexercised in Phase 1.09's smoke testing. Surface alternation invariance verified by code inspection: State A and State B both render at the same vertical footprint inside the same `<section>`.
- **Lucide icon coverage.** `src/components/ui/ServiceIcon.tsx` curates a known-safe icon map and falls back to `BadgeCheck` for any unrecognized name. The Unilock badge is hand-rolled inline SVG (Phase 1.03 §8.3). This trades a tiny amount of bundle-size discipline for crash-proof rendering when an icon name typo lands in `services.ts`.
- **Real Lighthouse runs require a manual sweep.** Phase 1.09 verified ≥95 readiness via build success + structural smoke tests (HTTP 200s on all 19 EN routes, 6 audience landings, 32 service pages, schema present, no `.card-featured`, single body-amber per page). Lighthouse runs on `localhost:3000/residential/` + `localhost:3000/residential/lawn-care/` + `localhost:3000/hardscape/patios-walkways/` desktop + mobile are recommended next; expect ~95+ desktop with the same mobile-P risk Phase 1.07 documented.
- **Sanity project initialized (Phase 2.01).** Project ID `i3fawnrl`, dataset `production`, organization slug `otkKa3xG9`. No API token created yet (Phase 2.03 creates scoped tokens once schemas are defined).
- **Real env vars partially populated (Phase 2.01).** `.env.local.example` documents all Phase 2.01+ variables. `.env.local` (gitignored) now holds real values for: `RESEND_API_KEY`, `ANTHROPIC_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_OPERATOR_CHAT_ID`. Google Places + GBP variables DEFERRED to Phase 2.13.2.
- **GitHub 2FA ENABLED (Phase 2.01, resolving Phase 1.01 carryover).** Authenticator app paired; 16 recovery codes saved in 3 places (credentials file + email + third location). Verified by log-out / log-in cycle.
- **VS Code NOT installed** (carryover from Phase 1.01, user runs Code via Claude desktop app).
- **23 moderate-severity npm vulnerabilities** reported by `npm install` (all transitive).
- **Featured-card discipline (D9, ratified):** `.card-featured` is forbidden on every audience landing and every service detail page. Verified by smoke test: `document.querySelectorAll('main .card-featured').length === 0` is satisfied on all 19 EN pages (and matched on the ES mirror).
- **Phase 1.14 — `ContactServiceAreaStrip` was promoted to `ServiceAreaStrip`** at `src/components/sections/ServiceAreaStrip.tsx` per Phase 1.13 D7b. Adds an opt-in `excludeSlug?: string` prop used on city pages to hide the current city. The `/contact/` page still consumes it with no `excludeSlug` (default behaviour unchanged). The old `src/components/sections/contact/ContactServiceAreaStrip.tsx` was deleted.
- **Phase 1.14 — new shared `<CTA>` component** at `src/components/sections/CTA.tsx`. Accepts `copyNamespace` + `destination` + opt-in `tokens?: Record<string, string>` (forwarded to next-intl ICU as values for `{key}` placeholders) + `surface` + `ariaId`. The existing `HomeCTA`, `AboutCTA`, `ServiceCTA`, and `AudienceCTA` components are intentionally left untouched per the prompt's "existing call-sites unaffected" rule; the new shared CTA powers the two new Phase 1.14 routes (`/service-areas/` index + city pages) only. Future phases can migrate the older CTAs onto it; doing so was out-of-scope here.
- **Phase 1.14 — `Place.areaServed` references the sitewide `LocalBusiness` via `@id`** (`https://sunsetservices.us/#localbusiness`). The `LocalBusiness` JSON-LD emitted from `src/app/[locale]/layout.tsx` does not currently carry that `@id` (pre-existing from Phase 1.05; the Phase 1.12 `ContactPage.mainEntity` reference has the same shape). Schema.org validators accept dangling `@id` references but a defensive `@id` on the LocalBusiness would tighten the graph. Out-of-scope for Phase 1.14; flagged here.
- **Dev-mode (Turbopack + Tailwind v4) cache quirk (Phase 1.14).** A transient `FORMATTING_ERROR` in the new shared CTA (since fixed) caused Turbopack to render an error page that contained React Server Component flight data (`</script><script>self.__next_f.push([1,"--color-sunset-green-300...`). Tailwind v4's content scanner treated the substring as an arbitrary-class generator (`text-[var("])</script>...]`) and emitted a malformed utility class into the generated CSS. The malformed class persists in Turbopack's intermediate cache even after `rm -rf .next` and a fresh server. **`npm run build` (production / non-Turbopack) is unaffected and ships the routes cleanly**; smoke testing was done against `npx next start`. Filed as a Turbopack-side dev-mode quirk; no source-code fix in this phase.
- **Phase 1.16 — `ProjectCard` extracted from `HomeProjects.tsx`** to `src/components/ui/ProjectCard.tsx`. Server primitive that receives already-resolved display props (no i18n / data-import inside the card). `HomeProjects.tsx` now consumes it; the home and About teasers continue to render unchanged (regression-tested via `npm run build`). `AudienceFeaturedProjects.tsx` and `LocalProjectsStrip.tsx` were intentionally NOT migrated — both have structural differences (StaggerItem wrappers carried from Phase 1.07/1.09, placeholder caption pattern, no href on the local-strip placeholders). Future phases can migrate them; doing so is out-of-scope for 1.16.
- **Phase 1.16 — Canonical/hreflang URLs use `process.env.NEXT_PUBLIC_SITE_URL || BUSINESS_URL`** in the projects routes only. Localhost Lighthouse runs (where the served origin is `http://localhost:3030` but `BUSINESS_URL` points at `https://sunsetservices.us`) need this override so the canonical audit's host-match check passes. Production deploys leave the env var unset and emit `BUSINESS_URL`. The earlier service-areas + audience pages emit absolute production canonicals only — out-of-scope to retrofit here.
- **Phase 1.16 — Canonical drops the trailing slash** on the projects routes. Next 16's default `trailingSlash: false` redirects `/projects/` → `/projects`; emitting canonical without the slash matches the served URL. Earlier service-areas + audience metadata still emit trailing-slash canonicals (a pre-existing site-wide divergence from Next's served URL); harmonizing is out-of-scope for 1.16.
- **Phase 1.16 — Slug rename `fire-pits` → `fire-pits-features` in the projects.ts seed.** Handover §11.3 wrote the seed with `fire-pits`; `services.ts` from Phase 1.09 ships the slug as `fire-pits-features` (matching the route URL `/hardscape/fire-pits-features/`). Two affected projects renamed in the seed: `naperville-hilltop-terrace`, `naperville-fire-court`. Build-time assertions in `projects.ts` would have surfaced any drift; verified all 7 distinct service slugs resolve.
- **Phase 1.16 — `HomeProjects` href remap.** The Phase 1.07 placeholder slugs (`naperville-patio`, `wheaton-lawn`, `aurora-hoa`, `glen-ellyn-fire`, `lisle-wall`, `warrenville-garden`) all 404 against the new 12-row seed. Updated to map to the closest seed-slug equivalents: `naperville-hilltop-terrace`, `wheaton-lawn-reset`, `aurora-hoa-curb-refresh`, `naperville-fire-court`, `lisle-retaining-wall`, `batavia-garden-reset`. The home/about visible tile titles still read the older placeholder copy from `home.projects.tile.*`; clicking lands on the real project detail. Erick polishes copy alignment in Part 2.
- **Phase 1.16 — `<CTA>` link prefetch={false}.** The shared CTA's amber `<Link>` now passes `prefetch={false}` because the `/request-quote/` route is 404-by-design until Phase 2.06; without this, Lighthouse logs the RSC prefetch 404 as a Best-Practices error. Production deploys are unaffected. Navbar's `/request-quote/` link still prefetches (out-of-scope chrome change).
- **Phase 1.16 — Lighthouse mobile Performance below 95.** `/projects` mobile = 83 (LCP 4.3s); `/projects/<slug>` mobile = 82 (LCP 4.4s). Matches the documented Phase 1.07 structural ceiling — slow-4G simulation + `<AnimateIn>` JS bundle + Next/Image transcoding overhead. Three documented out-of-scope paths to ≥95 (AnimateIn → CSS-IO refactor, real photographs in Phase 2.04, `next/dynamic` of below-hero sections). All other Lighthouse scores ≥95 across the 6 sampled runs (3 routes × 2 devices).

## TODO 1.16 — Real local-projects content (carried forward; Phase 1.16 prompt did not include this)
- `src/components/sections/location/LocalProjectsStrip.tsx` ships 3 placeholder tiles per city in Phase 1.14. The D7.A fallback rule (real city projects; if zero, fall back to closest 3 from neighbor cities AND caption with the actual project city — never fake the city) was NOT wired in Phase 1.16 because the explicit prompt scope was only the projects index + detail templates. With `src/data/projects.ts` now populated, a follow-up phase can wire D7.A — the projects seed contains 2 entries per city for all 6 service-area cities, so the "if zero, fall back" branch never fires for the current seed. Component carries the leading code comment with the rule.

## TODO 2.04 — Cowork
- Real per-city statistics (years serving, projects completed, response time) — currently placeholders in `src/data/locations.ts`:
  - Aurora: 25y / 200+ projects / 5 days
  - Naperville: 25y / 120+ / 5
  - Batavia: 25y / 60+ / 7
  - Wheaton: 25y / 80+ / 5
  - Lisle: 25y / 70+ / 5
  - Bolingbrook: 25y / 65+ / 7
- Real per-city postal codes — currently omitted from `address` in the `Place` JSON-LD (Schema.org accepts the page without `postalCode`).
- Real per-city photography — `src/data/imageMap.ts` aliases each city to an existing audience hero placeholder. The aliases (`LOCATION_HERO`, `LOCATION_CARD`, `LOCATION_PROJECT_TILES`) are documented inline; swapping to real photos requires only changing the static-import sources in `imageMap.ts`.

## TODO 2.07 — Cowork
- Real per-city lat/lng with map-pin precision — currently using representative public-source values in `src/data/locations.ts.geo`. The `Place.geo.GeoCoordinates` JSON-LD accepts the placeholder values; the SVG map pins are positioned via `pin: { x, y }` in seed data (decoupled from `geo`).
- Decide whether to swap the Phase 1.14 static SVG map for a Google Maps iframe. Plan §9 calls Phase 2.07 the optional cutover.

## TODO 2.13 — Native ES review
The following ES strings ship as first-pass drafts in `src/messages/es.json` and `src/data/locations.ts`. Search the file for `[TBR]` to enumerate.
- `serviceAreas.h1`, `serviceAreas.sub`, `serviceAreas.map.title`, `serviceAreas.map.desc`, `serviceAreas.grid.sub`, `serviceAreas.grid.tagline.{aurora,naperville,batavia,wheaton,lisle,bolingbrook}`, `serviceAreas.outside.body`, `serviceAreas.cta.h2`, `serviceAreas.cta.sub`.
- All `location.microbar.*`, `location.trust.*Label`, `location.services.*`, `location.projects.h2`, `location.projects.placeholderCaption`, `location.testimonials.h2`, `location.whyLocal.h2`, `location.whyLocal.portraitAlt`, `location.faq.h2`, `location.cta.h2`, `location.cta.sub`.
- All `whyLocal.es`, all `testimonials[].quote.es` + `attribution.es`, all `faq[].q.es` + `a.es`, and all `meta.description.es` per city.
- Phase 1.16 — every key in `projects.*` and `project.*` namespaces in `src/messages/es.json` ships with the `[TBR]` flag (handover §7). Per-project ES strings inside `src/data/projects.ts` (`title.es`, `shortDek.es`, `narrativeHeading.es`, `narrative.es`, `materials.es`, `leadAlt.es`, `gallery[].alt.es`, `beforeAlt.es`, `afterAlt.es`) are first-pass placeholders flagged `[TBR]`.

## TODO 2.15 — Real Google reviews
- Replace the placeholder testimonials in `src/data/locations.ts` (`testimonials[]`) with real reviews pulled from the Google Places API. The `LocalTestimonials` component renders `1+` cards per the seed length; no schema change required.
