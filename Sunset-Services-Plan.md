# Sunset Services — Plan & Specification (v2)

> **Companion to** `Sunset-Services-Project-Instructions.md`. Read the Project Instructions first.
> This document is the master spec for the finished site. Every page, every integration, every acceptance criterion. When a phase prompt is ambiguous, the answer is here.
> **Aspirational, not a status mirror.** Live build state lives in `src/_project-state/current-state.md` — if the two disagree, the live code wins.

---

## Table of contents

1. Goals and success criteria
2. About the business
3. Information architecture (full sitemap)
4. Pages at launch — full list
5. Design system (locked)
6. Tech stack (locked)
7. File and folder structure
8. Integrations and what each one does
9. SEO and schema strategy
10. Bilingual approach (EN + ES)
11. Lead-capture mechanics
12. AI chat widget specification
13. Automation agent specification
14. Acceptance criteria — what "v1 launched" means
15. Pre-build parallel-track tasks (Cowork-led)

---

## 1. Goals and success criteria

**Primary goal:** A new website at `sunsetservices.us` that out-performs the current WordPress site on every metric — design quality, page speed, SEO rankings, conversion rate, mobile usability, and trust signals.

**The bar:** Sharper than Western DuPage Landscaping. Lighthouse 95+ on all four scores, desktop and mobile. WCAG 2.2 AA. Bilingual EN + ES with native review. Fully functional 5-step quote wizard and AI chat widget. Automation agent stubs deployed.

**Top business outcomes the site must drive:**
- Capture more qualified residential, commercial, and hardscape leads
- Rank top-3 in DuPage County for "landscaping aurora il," "patios naperville," "snow removal dupage county," and 30+ similar terms
- Convert mobile visitors at 3× the current rate (current site has poor mobile UX and broken SSL)
- Make Sunset Services the most polished landscaper website in DuPage County

---

## 2. About the business

| Field | Value |
|---|---|
| Owner | Erick Valle (second-generation) |
| Founded by | Nick Valle |
| Years in business | 25+ (since 2000) |
| Address | 1630 Mountain St, Aurora, IL 60505 |
| Phone | (630) 946-9321 |
| Email | info@sunsetservices.us |
| Domain | sunsetservices.us |
| Service area | Aurora, Naperville, Batavia, Wheaton, Lisle, Bolingbrook (DuPage County) |
| Customer base | Premium homeowners (doctors, judges, lawyers, executives) + Hispanic homeowners in Aurora |
| Credentials | Unilock Authorized Contractor, 25+ years, strong Google reviews |
| Hardscape division | Marcin's team — premium outdoor construction, Unilock specialist |

### Three customer audiences

The site is built around these three audiences. Every page traces back to one of them.

1. **Residential** — homeowners
2. **Commercial** — HOAs, property managers, business owners
3. **Hardscape Division** — premium outdoor construction (patios, retaining walls, fire pits, Unilock)

---

## 3. Information architecture (full sitemap)

URL structure:
- English (default, no prefix): `/about/`
- Spanish: `/es/about/` — same path under `/es/`

```
/                                      Home
/residential/                          Residential audience landing
  /residential/lawn-care/
  /residential/landscape-design/
  /residential/tree-services/
  /residential/sprinkler-systems/
  /residential/snow-removal/
  /residential/seasonal-cleanup/
/commercial/                           Commercial audience landing
  /commercial/landscape-maintenance/
  /commercial/snow-removal/
  /commercial/property-enhancement/
  /commercial/turf-management/
/hardscape/                            Hardscape audience landing
  /hardscape/patios-walkways/
  /hardscape/retaining-walls/
  /hardscape/fire-pits-features/
  /hardscape/pergolas-pavilions/
  /hardscape/driveways/
  /hardscape/outdoor-kitchens/
/service-areas/                        Locations index
  /service-areas/aurora/
  /service-areas/naperville/
  /service-areas/batavia/
  /service-areas/wheaton/
  /service-areas/lisle/
  /service-areas/bolingbrook/
/projects/                             Portfolio listing
  /projects/[slug]                     30+ individual project pages
/about/
/contact/
/resources/                            Resources index
  /resources/[slug]                    Seed articles
/blog/                                 Blog index
  /blog/[slug]                         Seed posts + future
/request-quote/                        5-step quote wizard
/thank-you/                            Post-submission landing with Calendly embed
/privacy/
/terms/
/404
```

**Total page count at launch:** ~80 pages = 40 EN + 40 ES.

Note: the `snow-removal` slug exists under both `/residential/` and `/commercial/`. Service lookup is audience-aware via `getService(slug, audience?)`; the commercial row uses `imageKey: 'commercial-snow-removal'` so assets resolve uniquely.

---

## 4. Pages at launch — full list

| # | Page | Type | Notes |
|---|---|---|---|
| 1 | Home | Hero + 3 audience entry points + services + social proof + CTA | The most important page on the site |
| 2 | Residential | Audience landing | Service grid + audience-specific copy |
| 3–8 | 6 Residential service pages | Service detail | Individual services, FAQ schema each |
| 9 | Commercial | Audience landing | |
| 10–13 | 4 Commercial service pages | Service detail | |
| 14 | Hardscape | Audience landing | Showcase Unilock badge prominently |
| 15–20 | 6 Hardscape service pages | Service detail | |
| 21 | Service areas index | Hub | Map + 6 city links |
| 22–27 | 6 Location pages | Local SEO | One per city, schema-rich |
| 28 | Projects index | Portfolio | Filterable grid |
| 29 | Project detail | Dynamic | 30+ entries, Sanity-driven |
| 30 | About | Brand story | Erick, Nick, Marcin, the team |
| 31 | Contact | Contact + Calendly + map | |
| 32 | Resources index | Hub | |
| 33 | Resource detail | Dynamic | 5 seed articles |
| 34 | Blog index | Hub | |
| 35 | Blog post | Dynamic | 5 seed posts at launch |
| 36 | Request a Quote | 5-step wizard | Primary lead capture |
| 37 | Thank You | Post-submission | Calendly embed |
| 38 | Privacy | Legal | |
| 39 | Terms | Legal | |
| 40 | 404 | Custom | On-brand |

Each page has an English and Spanish version → 80 total.

### 5 seed resource articles at launch
1. *Patio Materials Guide* — slug `patio-materials-guide`
2. *How to Choose a Landscaper* — slug `how-to-choose-a-landscaper`
3. *Lawn Care Glossary* — slug `lawn-care-glossary`
4. *Snow Service Levels for PMs* — slug `snow-service-levels-for-pms`
5. *DuPage Hardscape Permits* — slug `dupage-hardscape-permits`

### 5 seed blog posts at launch
1. *"How Much Does a Patio Cost in DuPage County in 2026?"* — slug `dupage-patio-cost-2026`. Pricing transparency, ranks for cost queries.
2. *"Spring Lawn Care Calendar for Aurora, IL Homeowners"* — slug `aurora-spring-lawn-calendar`. Seasonal local.
3. *"Why Unilock? A Look at Premium Pavers"* — slug `why-unilock-premium-pavers`. Credential + product education, drives hardscape leads.
4. *"Snow Removal for Commercial Properties: What Property Managers Need to Know"* — slug `snow-for-commercial-properties`. Commercial-targeted.
5. *"7 Signs Your Sprinkler System Needs a Tune-Up Before Summer"* — slug `sprinkler-tune-up-7-signs`. Service-driven, FAQ-rich.

Each post: 800+ words, hand-curated featured image, FAQ schema, Article schema.

### 30+ project portfolio entries
Curated from Erick's Google Drive photo library. Mix of residential, commercial, and hardscape jobs. Each entry: 4–8 photos, project description, location, service tags, before/after where available. Sanity-driven.

---

## 5. Design system (locked)

**Direction: Premium organic / earthy.** Light mode only. Photography-led — patios, fire features, golden-hour lawns do the heavy lifting. No WebGL, no shaders, no heavy parallax.

### Palette (CSS variables in `globals.css`)

```css
@theme {
  /* Brand greens — pulled from existing logo */
  --color-sunset-green-50:  #F1F5EE;
  --color-sunset-green-100: #DCE8D5;
  --color-sunset-green-200: #B8D2A8;
  --color-sunset-green-300: #8FB67A;
  --color-sunset-green-500: #4D8A3F;  /* primary */
  --color-sunset-green-700: #2F5D27;  /* deep — headlines */
  --color-sunset-green-900: #1A3617;

  /* Amber — refined sunset accent, reserved for THE one CTA per page */
  --color-sunset-amber-50:  #FDF7E8;
  --color-sunset-amber-100: #FAEBC2;
  --color-sunset-amber-200: #F6D896;
  --color-sunset-amber-300: #F2C66A;
  --color-sunset-amber-500: #E8A33D;  /* accent */
  --color-sunset-amber-700: #B47821;

  /* Surfaces — warm neutrals, never cold gray */
  --color-bg:           #FFFFFF;
  --color-bg-cream:     #FAF7F1;
  --color-bg-stone:     #F2EDE3;
  --color-bg-charcoal:  #1A1A1A;

  /* Text */
  --color-text-primary:    #1A1A1A;
  --color-text-secondary:  #4A4A4A;
  --color-text-muted:      #6B6B6B;
  --color-text-on-dark:    #FAF7F1;
  --color-text-on-green:   #FFFFFF;
  --color-text-on-amber:   #1A1A1A;

  /* Lines */
  --color-border:        #E5E0D5;
  --color-border-strong: #C9C0AE;
}
```

### Typography
- **Headings:** Manrope (400 / 500 / 600 / 700 / 800)
- **Body:** Onest (400 / 500 / 600 / 700)
- **Subsets:** `latin`, `latin-ext` (covers EN and ES; no Cyrillic)
- **CSS vars:** `--font-heading`, `--font-body`
- **Tailwind utilities:** `font-heading`, `font-body`
- **Loader:** `next/font/google` with `display: 'swap'`, `variable: '--font-heading' | '--font-body'`

### Radius and shadow

```css
@theme {
  --radius-sm:  4px;
  --radius-md:  8px;
  --radius-lg:  16px;
  --radius-xl:  24px;
  --radius-2xl: 32px;

  --shadow-soft:     0 1px 2px rgba(26,26,26,0.06), 0 4px 12px rgba(26,26,26,0.04);
  --shadow-card:     0 2px 4px rgba(26,26,26,0.06), 0 12px 32px rgba(26,26,26,0.06);
  --shadow-hover:    0 8px 16px rgba(26,26,26,0.08), 0 24px 48px rgba(26,26,26,0.10);
  --shadow-on-cream: 0 1px 2px rgba(77,138,63,0.10), 0 8px 24px rgba(77,138,63,0.08);
}
```

### Component principles
- **Buttons:** Primary = solid green with white text. Secondary = bordered with green text. Ghost = no border, green text, underline on hover. **Amber is reserved for the single most important CTA on each page.** "Get a Free Estimate" gets amber once per page; nothing else.
- **Cards:** White or cream surface, soft shadow, generous padding (`p-8`+), `--radius-lg`. Hover lifts shadow + 1px translate-up.
- **Photo cards:** `4/3` for projects, `1/1` for service tiles. `next/image` with `placeholder="blur"`.
- **Forms:** Inputs ≥48px tall (touch target). Labels above the field, not floating-inside. Errors in red below the field.
- **Sections:** Alternate `--color-bg` and `--color-bg-cream` section by section — visual rhythm without boxy dividers. Vertical padding: `py-20` desktop, `py-14` mobile.
- **Animation:** `motion v12` from `motion/react`. Server components wrap in `<AnimateIn>` or `<StaggerContainer>` + `<StaggerItem>`. `MotionConfig reducedMotion="user"` mounted once at the layout level via the `MotionRoot` client wrapper.
- **Class-naming convention:** single-hyphen BEM (`.btn-amber`, `.card-photo`, `.btn-ghost.btn-on-dark`). Tokens from `globals.css` win over handover examples.
- **Featured-card discipline:** `.card-featured` is forbidden on every audience landing and every service detail page (D9 ratified in Part 1).

### Audience-accent system
Each audience page wrapper sets `data-audience="{slug}"`, which exposes two CSS custom properties:
- `--audience-accent` — subtle accent for chip backgrounds, dividers, audience-specific micro-marks
- `--audience-chip-bg` — accent for filter chips

Buttons remain green/amber regardless of audience accent; the accent never overrides the brand palette.

### Off the table
- Dark mode at launch (may be added post-v1)
- Rainbow gradient palettes
- WebGL / shader heroes
- Heavy parallax

---

## 6. Tech stack (locked)

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | Turbopack default. `proxy.ts` replaces `middleware.ts`. |
| UI | React 19 | |
| Language | TypeScript 5 (strict) | |
| Styling | Tailwind CSS v4 | CSS-first config in `globals.css`, no `tailwind.config.js` |
| Animation | motion v12 | Imports from `motion/react`, never `framer-motion` |
| UI primitives | `@base-ui/react` 1.4+ | Headless; wrapped in `src/components/ui/*` |
| Icons | lucide-react | Brand logos hand-rolled inline SVG |
| i18n | next-intl 4.11 | `en` (default, no prefix) + `es` (`/es/...`) |
| Middleware | `src/proxy.ts` | Next 16 renamed `middleware.ts` → `proxy.ts`; Node runtime only |
| Markdown rendering | marked 18+ | Used for blog/resource body content |
| CMS | next-sanity 12 | Wired from day one |
| Email | Resend v6 | API routes: `/api/contact`, `/api/quote`, `/api/newsletter` |
| Booking | Calendly embed | On Contact + Thank-You |
| AI | `@anthropic-ai/sdk` | Model: `claude-sonnet-4-6` |
| CRM | Mautic (self-hosted) | Feature-flagged stub at launch, real install whenever Erick's server is ready |
| Job management | ServiceM8 | Webhook-driven |
| Notifications | Telegram bot | Approvals for blog drafts, SEO summaries, ServiceM8 job-complete events |
| Hosting | **Vercel Hobby → Pro before launch** | Hobby during Part 2 dev, upgrade to Pro before DNS cutover |
| DNS / CDN | Cloudflare | DNS cutover in Part 3 |
| Analytics | GTM → GA4, Microsoft Clarity, Vercel Analytics | All gated behind cookie consent |
| Legal pages | Termly or iubenda | Auto-updating Privacy/Terms/cookie banner |

**Removed from v1:** CallRail (no dynamic phone-number swapping). The site uses static `tel:` links — CallRail's dynamic number swapping by traffic source is out of scope at launch.

Versions pinned in `src/_project-state/00_stack-and-config.md` and `current-state.md`.

---

## 7. File and folder structure

**Local working folder:** `C:\Users\user\Desktop\SunSet-V2`

```
C:\Users\user\Desktop\SunSet-V2\
├── docs/
│   └── design-handovers/          # Design handover .md files per phase
├── public/
│   └── images/                    # Static brand assets (logo SVG, icons, blog/resources)
├── sanity/
│   └── schemas/                   # Sanity content models
├── scripts/                       # Placeholder/data scripts
├── src/
│   ├── _project-state/
│   │   ├── current-state.md       # Live snapshot, updated end of every phase
│   │   ├── file-map.md            # Every file, one-line description
│   │   ├── 00_stack-and-config.md # Stack details
│   │   └── Part-X-Phase-YY-Completion.md  # Per-phase reports
│   ├── app/
│   │   ├── [locale]/              # next-intl locale routing
│   │   │   ├── (marketing)/       # Public pages
│   │   │   │   ├── page.tsx       # Home
│   │   │   │   ├── residential/
│   │   │   │   ├── commercial/
│   │   │   │   ├── hardscape/
│   │   │   │   ├── service-areas/
│   │   │   │   ├── projects/
│   │   │   │   ├── about/
│   │   │   │   ├── contact/
│   │   │   │   ├── resources/
│   │   │   │   ├── blog/
│   │   │   │   ├── request-quote/
│   │   │   │   ├── thank-you/
│   │   │   │   ├── privacy/
│   │   │   │   └── terms/
│   │   │   └── layout.tsx         # Root layout (owns <html>/<body>/font className/MotionRoot)
│   │   ├── api/
│   │   │   ├── contact/
│   │   │   ├── quote/
│   │   │   ├── newsletter/
│   │   │   ├── chat/              # AI chat widget
│   │   │   └── webhooks/
│   │   │       ├── servicem8/     # Job completion → portfolio
│   │   │       └── sanity-published/
│   │   ├── og/                    # Open Graph image route handlers
│   │   ├── globals.css            # @theme tokens, base styles
│   │   ├── sitemap.ts             # Dynamic sitemap
│   │   └── robots.ts              # robots.txt
│   ├── assets/                    # Imported assets (about, audience, home, service folders)
│   ├── components/
│   │   ├── global/                # AnimateIn, StaggerContainer, MotionRoot
│   │   ├── layout/                # Navbar, Footer, MobileMenu, language switcher
│   │   ├── sections/              # Hero, Services, Testimonials, FAQ, CTA, etc.
│   │   ├── content/               # ContentCard, ContentMeta, ProseLayout
│   │   ├── forms/                 # ContactForm
│   │   ├── wizard/                # 5-step quote wizard
│   │   ├── chat/                  # AI chat widget components
│   │   └── ui/                    # base-ui primitive wrappers, ServiceCard, ProjectCard, ServiceIcon
│   ├── data/                      # Typed seed data (services, locations, projects, resources, blog, team, wizard, imageMap)
│   ├── hooks/                     # React hooks
│   ├── i18n/                      # next-intl config + navigation
│   ├── lib/
│   │   ├── chat/                  # Chat storage, flags, events
│   │   ├── constants/             # BUSINESS_URL, etc.
│   │   ├── schema/                # JSON-LD builders per page type
│   │   └── wizard/                # Wizard validation/state
│   ├── messages/
│   │   ├── en.json                # English strings
│   │   └── es.json                # Spanish strings
│   ├── styles/                    # prose.css
│   └── proxy.ts                   # Next 16 middleware (i18n routing)
├── .env.local.example             # Documents every env var
├── .env.local                     # Real values, gitignored
├── next.config.ts
├── package.json
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
└── README.md
```

---

## 8. Integrations and what each one does

### Lead capture & customer flow
| Integration | Purpose | Phase |
|---|---|---|
| **Mautic** (self-hosted, deferred) | CRM — captures every quote-wizard step (including abandoners), AI chat lead, contact form. Code stubs the integration with a feature flag; user installs Mautic on a server in Part 2 whenever ready. | 2.06 |
| **Resend** | Transactional email — quote submissions, contact form, newsletter, confirmations. From `info@sunsetservices.us`. | 2.08 |
| **Calendly** | Secondary booking — embedded on Contact and Thank-You pages | 2.07 |
| **Telegram bot** | Approval flows for blog drafts, weekly SEO summary delivery, ServiceM8 job-complete portfolio publishes, agent error alerts | 2.16 |

### Analytics & tracking
| Integration | Purpose | Phase |
|---|---|---|
| **Google Tag Manager** | Central tag hub, gated behind cookie consent | 2.11 |
| **Google Analytics 4** | Connected via GTM | 2.11 |
| **Microsoft Clarity** | Heatmaps + session recordings (free tier) | 2.11 |
| **Vercel Analytics** | Real-user performance metrics | 2.02 |
| **Google Search Console + Bing Webmaster** | SEO monitoring | 3.14 |
| **Google Ads (future)** | Conversion tracking via GTM | Stubbed in Phase 2.11 |

### AI
| Integration | Purpose | Phase |
|---|---|---|
| **Anthropic API** | AI chat widget + automation agent. Model `claude-sonnet-4-6`. | 2.09, 2.17–2.18 |

### Automation agent
| Integration | Purpose | Phase |
|---|---|---|
| **ServiceM8** | Job-management — webhook fires on job complete, agent publishes to portfolio | 2.14 |
| **Google Business Profile API** | Agent uploads photos, posts updates after Telegram approval | 2.15 |
| **Google Places API** | Pulls Google reviews into the Sanity cache daily | 2.15 |

### Legal
| Integration | Purpose | Phase |
|---|---|---|
| **Termly or iubenda** | Auto-updating Privacy, Terms, Cookie Consent banner | 3.03–3.04 |

---

## 9. SEO and schema strategy

### On-page SEO foundations
- Hand-written `<title>` and `<meta name="description">` per page (no template duplication)
- `<h1>` once per page, no skipped heading levels
- Semantic HTML (`<article>`, `<section>`, `<nav>`)
- Internal linking: every audience landing links to its services; every service page links back to its audience landing and to relevant location pages
- Image alt text: descriptive, location-aware where relevant ("Stamped concrete patio installation in Naperville, IL backyard")
- Slugs: short, keyword-rich, no stop words

### Schema (JSON-LD, hand-written per page)
| Schema | Where |
|---|---|
| `LocalBusiness`, `Organization`, `WebSite` | Sitewide (in root layout). `LocalBusiness` carries a stable `@id` (`https://sunsetservices.us/#localbusiness`) so other schema can reference it. |
| `Service` | Each service page |
| `FAQPage` | Each service page (with real Q&As) |
| `Article` | Each blog post (`BlogPosting`) and applicable resource articles |
| `HowTo` | Resource articles where `schemaType === 'HowTo'` |
| `Place` | Each location page (with `areaServed` referencing the sitewide `LocalBusiness` by `@id`) |
| `Person` | Erick + key team members on About page |
| `Review` + `AggregateRating` | Sourced from cached Google reviews |
| `BreadcrumbList` | Every non-home page |
| `ItemList` | Service grids, project grids |
| `CreativeWork` | Each project detail (with `creator` → LocalBusiness `@id`, `locationCreated.address` Place) |
| `ContactPage` | Contact page |

All schema validated in Google's Rich Results Test in Phase 3.05.

### Technical SEO
- Dynamic `sitemap.xml` (Next.js App Router)
- `robots.txt`
- `hreflang` tags on every localized page (`x-default`, `en`, `es`)
- OG image generator (1200×630, branded) — auto-generated per page using `next/og`. Per-content variants for blog and resource detail; sitewide fallback for everything else.
- 301 redirects from old WordPress URLs (mapped in Phase 3.07)
- Canonical URLs on every page
- `/thank-you/` carries `<meta name="robots" content="noindex,follow">` (user-supplied data in URL)

---

## 10. Bilingual approach (EN + ES)

- **English is the default.** No URL prefix.
- **Spanish lives at `/es/...`** Same path structure under `/es/`.
- **Library:** `next-intl 4.11` with `localePrefix: 'as-needed'`.
- **Strings:** stored in `src/messages/en.json` and `src/messages/es.json`
- **CMS content:** Sanity has bilingual fields (e.g., `title.en`, `title.es`). Seed data in `src/data/*.ts` already follows the `{en, es}` pattern.
- **Translation workflow:**
  1. All content written in English first
  2. Claude Code drafts Spanish translation in Phase 2.12
  3. Native review (Erick or designate) in Phase 2.13 — non-negotiable
  4. Decisions logged in `Sunset-Services-TRANSLATION_NOTES.md`
  5. Strings flagged inline as `[TBR]` are first-pass drafts pending native review
- **Language switcher:** in header, persistent, preserves current path
- **No Google Translate widget.** Ever.

---

## 11. Lead-capture mechanics

The site is built around getting leads, not just looking pretty. Three capture surfaces:

### 1. Quote wizard (primary) — `/request-quote/`
5-step form. Every step (1–3) pushes a partial Mautic record so abandoners are tracked. Step 4 is PII — never persists client-side.

| Step | Content |
|---|---|
| 1 | Audience selection — Residential / Commercial / Hardscape (tile select) |
| 2 | Service selection — dynamic from Sanity based on Step 1 audience; primary radio if more than one selected |
| 3 | Audience-conditional details — branches by audience (square footage, # of properties, project type, etc.) |
| 4 | Contact info + property address (US-formatted phone, IL-defaulted state, `data-autocomplete-stub="address"` on street wrapper) |
| 5 | Review & submit — single `.card-cream` review with per-step Edit links and amber Submit |

URL-driven step via `?step=N`. Autosave Steps 1–3 only to `localStorage` with 30-day expiry behind `NEXT_PUBLIC_WIZARD_AUTOSAVE_ENABLED`. Resume toast on return-visit. Validation on-blur + on-Next with scroll-to-error and focus-to-error.

On submit (Phase 2.06):
- POST to `/api/quote` (gated behind `WIZARD_SUBMIT_ENABLED`)
- Push to Mautic (stubbed until server is live)
- Send Resend email to `info@sunsetservices.us`
- Redirect to `/thank-you/?firstName=…`
- `/thank-you/` page shows confirmation + Calendly embed for "Book a 30-min consultation"

Navbar amber "Get a Quote" CTA is hidden on `/request-quote/` only (the page is the conversion surface).

### 2. AI chat widget (sitewide)
- Persistent bubble bottom-right on every page **except** `/request-quote/`
- Captures name + email after engagement
- On-screen high-intent banner appears when the model classifies the conversation as high-intent (e.g., "ready to book," "need quote")
- See §12 for full spec
- **No Telegram ping for high-intent** (v2 change). Lead data still flows to Mautic + Resend.

### 3. Click-to-call (static)
- Mobile sticky header: static `tel:` link always visible
- No dynamic number-swapping at launch (CallRail removed in v2)

### 4. Contact form — `/contact/`
- Secondary capture for visitors who skip the wizard
- POST to `/api/contact` → Resend email to `info@sunsetservices.us`
- Same Mautic stub-then-real treatment as the wizard

---

## 12. AI chat widget specification

| Aspect | Spec |
|---|---|
| Position | Bottom-right bubble, persistent across all pages except `/request-quote/` |
| Collapsed shell | ≤ 8 KB gzipped (verified post-build) |
| Expanded panel | Dynamically imported on first bubble click (separate ~5 KB chunk) |
| Bilingual | Auto-detects locale, follows visitor's language |
| Knowledge base | Sanity content — services, locations, team, process, FAQs, hours |
| Lead capture | Inline form captures name + email after engagement; pushes to Mautic + sends a Resend notification to `info@sunsetservices.us` |
| High-intent escalation | On-screen banner slides above the composer when intent classifier flags high intent. **No Telegram ping** (v2 change). |
| Rate limiting | 1 message / 2 seconds per IP, 50 messages / day per IP |
| Kill switch | `NEXT_PUBLIC_AI_CHAT_ENABLED=false` hides it instantly |
| Backend feature flag | `AI_CHAT_ENABLED=false` short-circuits the `/api/chat` route |
| Model | `claude-sonnet-4-6` via `@anthropic-ai/sdk` |
| Streaming | Server-sent events, token-by-token rendering |
| Conversation history | Stored in browser `sessionStorage` during session, per-locale namespace (`sunset_chat_history_<locale>`), cleared on close |
| Compliance | Cookie consent gate respected; no analytics fired before consent |
| Mobile | Bottom-sheet `<dialog>` + `showModal()` with drag handle |
| Markdown | Inline content is plaintext + URL auto-link only at launch; full Markdown subset deferred post-v1 |

UI built in Part 1 (Phase 1.20). Wired up in Part 2 (Phase 2.09).

---

## 13. Automation agent specification

Runs in the background on Vercel Cron jobs. Built in Part 2 (Phases 2.17–2.18). On Vercel Hobby, the 2-cron limit is solved by consolidating Daily + Weekly into a single cron with internal time-checks until the Pro upgrade in Part 3.

| Cadence | Job |
|---|---|
| Daily | Fetch new Google reviews via Places API, cache in Sanity |
| Weekly | Search Console SEO summary, delivered to Erick via Telegram |
| Monthly | Draft a blog post using current keywords; send to Erick for approval via Telegram before publishing |
| On-demand | When ServiceM8 marks a job complete: agent grabs photos, drafts a project description, publishes to portfolio (after approval), uploads to GBP, drafts a Google Post |

**Dropped from v1:** seasonal (Oct/Apr) snow-removal CTA toggle · per-review reply automation.

All publishing actions require Telegram approval (inline keyboard: Approve / Edit / Reject). The agent never publishes autonomously. All agent actions are logged.

The AI chat widget is **not** an automation — it's a sitewide product feature. See §12.

---

## 14. Acceptance criteria — what "v1 launched" means

Before Part 3 cuts DNS over, **all** of these must be true:

- [ ] All ~80 pages built (40 EN + 40 ES), with native Spanish review complete
- [ ] Lighthouse 95+ on Performance, Accessibility, Best Practices, SEO — desktop + mobile, sampled on at least the homepage, one service page, one blog post, one location page
- [ ] All 16 service pages have valid `FAQPage` schema (Rich Results Test green)
- [ ] `LocalBusiness`, `Organization`, `WebSite` schema valid sitewide
- [ ] Dynamic `sitemap.xml` present and submitted to Google Search Console + Bing Webmaster Tools
- [ ] `robots.txt` present and correct
- [ ] `hreflang` tags present on every localized page
- [ ] OG images render correctly for every page (1200×630, branded)
- [ ] 5-step quote wizard working end-to-end: submission → Mautic stub or live → Resend email to `info@sunsetservices.us` → on-page thank-you → Calendly embed
- [ ] Calendly embedded on Contact + Thank-You pages
- [ ] Click-to-call button present on mobile sticky header (static `tel:`)
- [ ] AI chat widget live, bilingual, rate-limited, kill switch tested, high-intent on-screen banner firing
- [ ] Automation agent stubs deployed (review fetching, SEO summary, blog drafting, ServiceM8 portfolio publish), Telegram approval flows tested
- [ ] Google Business Profile, Yelp, Facebook, Instagram, YouTube all updated to "Sunset Services" + 1630 Mountain St, Aurora, IL 60505 + (630) 946-9321
- [ ] New SSL certificate active on `sunsetservices.us`
- [ ] 5 seed blog posts live, each 800+ words, each with hand-curated featured image, FAQ schema where relevant
- [ ] 30+ project portfolio entries live, photos curated from Drive
- [ ] Sanity Studio access shared with Erick, runbook delivered
- [ ] WCAG 2.2 AA verified
- [ ] Vercel upgraded from Hobby to Pro before DNS cutover
- [ ] All Part 1, Part 2, Part 3 phase completion reports filed in `src/_project-state/`

If any item is false, we're still building.

---

## 15. Pre-build parallel-track tasks (Cowork-led, run alongside phases)

These don't block Phase 2.01 but block launch. Cowork starts them as early as possible.

| Task | Owner | Why it can't wait |
|---|---|---|
| Renew/replace SSL on the current sunsetservices.us | **Cowork** | Currently expired — actively damaging trust + SEO right now |
| Standardize brand name to "Sunset Services" across Google Business / Yelp / Facebook / Instagram / YouTube | **Cowork** | Inconsistent NAP is the #1 thing holding local businesses back in Google rankings |
| Curate Google Drive photo library into service folders + `/projects/` | **Cowork** drafts; Erick confirms keepers | Needed for Phase 2.04 Sanity uploads |
| Confirm Spanish native reviewer (likely Erick) | **User** | Must be confirmed before Phase 2.13 |
| Google Business Profile API verification | **Cowork** | Verification can take 2–6 weeks — start in Phase 2.01 |
| Mautic server install | **User** (later) | Self-hosted; Code stubs the integration with feature flag in Phase 2.06 so launch isn't blocked. Mautic flips on whenever the server is ready. |
| 2FA enrollment on the GitHub account | **Cowork** | Pre-Part-2 housekeeping (carryover from Phase 1.01) |
| Move v1 docs into `/archive/v1/` | **Cowork** | Housekeeping; happens during Phase 2.01 |

---

## What's next

This Plan locks the spec for the finished site. The next deliverable from Claude Chat is `Sunset-Services-Phase-Plan.md` — the corrected, detailed Part 2 + Part 3 phase breakdown.

When that is locked, we begin **Part 2, Phase 2.01**.
