# Sunset Services — Plan & Specification (v1)

> **Companion to** `Sunset-Services-Project-Instructions.md`. Read the Project Instructions first.
> This document is the master spec. Every page, every integration, every phase. When a phase prompt is ambiguous, the answer is here.

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
14. Phase breakdown — Part 1
15. Phase breakdown — Part 2
16. Phase breakdown — Part 3
17. Acceptance criteria — what "v1 launched" means
18. Pre-build parallel-track tasks (Cowork-led)

---

## 1. Goals and success criteria

**Primary goal:** A new website at `sunsetservices.us` that out-performs the current WordPress site on every metric — design quality, page speed, SEO rankings, conversion rate, mobile usability, and trust signals.

**The bar:** Sharper than Western DuPage Landscaping. Lighthouse 95+ on all four scores, on desktop and mobile. WCAG 2.2 AA. Bilingual EN + ES with native review. Fully functional 5-step quote wizard, AI chat widget, and automation agent.

**Top business outcomes the site must drive:**
- Capture more qualified residential, commercial, and hardscape leads
- Rank top-3 in DuPage County for "landscaping aurora il," "patios naperville," "snow removal dupage county," and 30+ similar terms
- Convert mobile visitors at 3x the current rate (current site has poor mobile UX and broken SSL)
- Make Sunset Services the most polished landscaper website in DuPage County

---

## 2. About the business

| Field | Value |
|---|---|
| Owner | Erick Valle (second-generation) |
| Founded by | Nick Valle |
| Years in business | 25+ |
| Address | 1630 Mountain St, Aurora, IL 60505 |
| Phone | (630) 946-9321 |
| Email | info@sunsetservices.us |
| Domain | sunsetservices.us |
| Service area | Aurora, Naperville, Batavia, Wheaton, Lisle, Bolingbrook (DuPage County) |
| Customer base | Premium homeowners (doctors, judges, lawyers, executives) + Hispanic homeowners in Aurora |
| Credentials | Unilock Authorized Contractor, Top 5 Landscaping Companies (verify current), 25+ years, strong Google reviews |
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
| 33 | Resource detail | Dynamic | Seed articles |
| 34 | Blog index | Hub | |
| 35 | Blog post | Dynamic | 5 seed posts at launch |
| 36 | Request a Quote | 5-step wizard | Primary lead capture |
| 37 | Thank You | Post-submission | Calendly embed |
| 38 | Privacy | Legal | |
| 39 | Terms | Legal | |
| 40 | 404 | Custom | On-brand |

Each page has an English and Spanish version → 80 total.

### 5 seed blog posts at launch (drafted by Claude Code, reviewed by Erick)
1. *"How Much Does a Patio Cost in DuPage County in 2026?"* — pricing transparency, ranks for cost queries
2. *"Spring Lawn Care Calendar for Aurora, IL Homeowners"* — seasonal local
3. *"Why Unilock? A Look at Premium Pavers"* — credential + product education, drives hardscape leads
4. *"Snow Removal for Commercial Properties: What Property Managers Need to Know"* — commercial-targeted
5. *"7 Signs Your Sprinkler System Needs a Tune-Up Before Summer"* — service-driven, FAQ-rich

Each post: 800+ words, hand-curated featured image, FAQ schema, Article schema.

### 30+ project portfolio entries
Curated from Erick's Google Drive photo library. Mix of residential, commercial, and hardscape jobs. Each entry: 4–8 photos, project description, location, service tags, before/after where available.

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

### Radius and shadow

```css
@theme {
  --radius-sm:  4px;
  --radius-md:  8px;
  --radius-lg:  16px;
  --radius-xl:  24px;
  --radius-2xl: 32px;

  --shadow-soft:    0 1px 2px rgba(26,26,26,0.06), 0 4px 12px rgba(26,26,26,0.04);
  --shadow-card:    0 2px 4px rgba(26,26,26,0.06), 0 12px 32px rgba(26,26,26,0.06);
  --shadow-hover:   0 8px 16px rgba(26,26,26,0.08), 0 24px 48px rgba(26,26,26,0.10);
  --shadow-on-cream:0 1px 2px rgba(77,138,63,0.10), 0 8px 24px rgba(77,138,63,0.08);
}
```

### Component principles
- **Buttons:** Primary = solid green with white text. Secondary = bordered with green text. Ghost = no border, green text, underline on hover. **Amber is reserved for the single most important CTA on each page.** "Get a Free Estimate" gets amber once per page; nothing else.
- **Cards:** White or cream surface, soft shadow, generous padding (`p-8`+), `--radius-lg`. Hover lifts shadow + 1px translate-up.
- **Photo cards:** `4/3` for projects, `1/1` for service tiles. `next/image` with `placeholder="blur"`.
- **Forms:** Inputs ≥48px tall (touch target). Labels above the field, not floating-inside. Errors in red below the field.
- **Sections:** Alternate `--color-bg` and `--color-bg-cream` section by section — visual rhythm without boxy dividers. Vertical padding: `py-20` desktop, `py-14` mobile.
- **Animation:** `motion v12` from `motion/react`. Server components wrap in `<AnimateIn>` or `<StaggerContainer>` + `<StaggerItem>`. `MotionConfig reducedMotion="user"` mounted once at the layout level.

### Off the table
- Dark mode at launch (may be added post-v1)
- Rainbow gradient palettes
- WebGL / shader heroes
- Heavy parallax

---

## 6. Tech stack (locked)

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | Pinned in Phase 1.02 |
| UI | React 19 | |
| Language | TypeScript 5 (strict) | |
| Styling | Tailwind CSS v4 | CSS-first config in `globals.css`, no `tailwind.config.js` |
| Animation | motion v12 | Imports from `motion/react`, never `framer-motion` |
| UI primitives | shadcn (base-nova theme) | On `@base-ui/react` |
| Icons | lucide-react | Brand logos hand-rolled inline SVG |
| i18n | next-intl 4.9 | `en` (default, no prefix) + `es` (`/es/...`) |
| Middleware | `src/proxy.ts` | Next 16 renamed `middleware.ts` → `proxy.ts` |
| CMS | next-sanity | Wired from day one |
| Email | Resend v6 | API routes: `/api/contact`, `/api/quote`, `/api/newsletter` |
| Booking | Calendly embed | On Contact + Thank-You |
| AI | `@anthropic-ai/sdk` | Model: `claude-sonnet-4-6` |
| Hosting | Vercel Pro | From Part 2 onward |
| DNS / CDN | Cloudflare | DNS cutover in Part 3 |
| Analytics | GTM → GA4, Microsoft Clarity, Vercel Analytics | All gated behind cookie consent |
| Phone tracking | CallRail | Dynamic number swapping |

Versions are pinned during Part 1, Phase 1.02 and recorded in `current-state.md`.

---

## 7. File and folder structure

**Local working folder:** `C:\Users\user\Desktop\SunSet-V2`

This is where the entire repo lives. Claude Code is invoked from this folder.

```
C:\Users\user\Desktop\SunSet-V2\
├── docs/
│   ├── design-handovers/          # Design handover .md files per phase
│   ├── runbooks/                  # Operational runbooks (Sanity, deploy, etc.)
│   └── decisions/                 # Append-only decision log
├── public/
│   ├── images/                    # Static brand assets (logo SVG, icons)
│   └── og/                        # OG image generator output
├── reports/                       # Phase completion reports from Claude Code
├── src/
│   ├── _project-state/
│   │   ├── current-state.md       # Live snapshot, updated end of every phase
│   │   ├── file-map.md            # Every file, one-line description
│   │   └── 00_stack-and-config.md # Stack details
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
│   │   │   └── layout.tsx         # Locale-level layout, MotionConfig
│   │   ├── api/
│   │   │   ├── contact/
│   │   │   ├── quote/
│   │   │   ├── newsletter/
│   │   │   ├── chat/              # AI chat widget
│   │   │   └── webhooks/
│   │   │       ├── servicem8/     # Job completion → portfolio
│   │   │       └── sanity-published/  # Future automation
│   │   ├── globals.css            # @theme tokens, base styles
│   │   ├── layout.tsx             # Root layout
│   │   ├── sitemap.ts             # Dynamic sitemap
│   │   └── robots.ts              # robots.txt
│   ├── components/
│   │   ├── global/                # AnimateIn, StaggerContainer, etc.
│   │   ├── layout/                # Navbar, Footer, MobileMenu
│   │   ├── sections/              # Hero, Services, Testimonials, FAQ, etc.
│   │   ├── forms/                 # ContactForm, QuoteWizard
│   │   ├── chat/                  # AI chat widget
│   │   └── ui/                    # shadcn primitives
│   ├── lib/
│   │   ├── ai.ts                  # Anthropic client, prompt builders
│   │   ├── sanity.ts              # Sanity client
│   │   ├── resend.ts              # Email client
│   │   ├── mautic.ts              # CRM client (Part 2)
│   │   └── analytics.ts           # GTM helpers
│   ├── messages/
│   │   ├── en.json                # English strings
│   │   └── es.json                # Spanish strings
│   ├── proxy.ts                   # Next 16 middleware (i18n routing)
│   └── i18n/
│       └── request.ts             # next-intl config
├── sanity/
│   ├── schemas/                   # Sanity content models
│   └── sanity.config.ts
├── .env.local.example             # Documents every env var
├── .env.local                     # Real values, gitignored
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 8. Integrations and what each one does

### Lead capture & customer flow
| Integration | Purpose | Phase |
|---|---|---|
| **Mautic** (self-hosted, set up later) | CRM — captures every quote-wizard step (including abandoners), AI chat lead, contact form. User installs on a server in Part 2. Code stubs the integration with feature flag. | 2.06 |
| **Resend** | Transactional email — quote submissions, contact form, newsletter, confirmations. From `info@sunsetservices.us`. | 2.08 |
| **Calendly** | Secondary booking — embedded on Contact and Thank-You pages | 2.07 |
| **Telegram bot** | Pings Erick for high-intent leads, review-reply approvals, agent error alerts | 2.16 |

### Analytics & tracking
| Integration | Purpose | Phase |
|---|---|---|
| **Google Tag Manager** | Central tag hub, gated behind cookie consent | 2.11 |
| **Google Analytics 4** | Connected via GTM | 2.11 |
| **Microsoft Clarity** | Heatmaps + session recordings (free tier) | 2.11 |
| **CallRail** | Dynamic phone-number swapping by traffic source (~$45/mo) | 2.10 |
| **Vercel Analytics** | Real-user performance metrics | 2.02 |
| **Google Search Console + Bing Webmaster** | SEO monitoring | 3.14 |
| **Google Ads (future)** | Conversion tracking via GTM | Stubbed in Phase 2.11 |

### AI
| Integration | Purpose | Phase |
|---|---|---|
| **Anthropic API** | AI chat widget + automation agent. Model `claude-sonnet-4-6`. | 2.09, 2.17–2.19 |

### Automation agent
| Integration | Purpose | Phase |
|---|---|---|
| **ServiceM8** | Job-management — webhook fires on job complete, agent publishes to portfolio | 2.14 |
| **Google Business Profile API** | Agent uploads photos, posts updates, replies to reviews (after Telegram approval) | 2.15 |
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
| `LocalBusiness`, `Organization`, `WebSite` | Sitewide (in root layout) |
| `Service` | Each service page |
| `FAQPage` | Each service page (with real Q&As) |
| `Article` | Each blog post |
| `Place` | Each location page |
| `Person` | Erick + key team members on About page |
| `Review` + `AggregateRating` | Sourced from cached Google reviews |
| `BreadcrumbList` | Every non-home page |
| `ItemList` | Service grids, project grids |
| `ContactPage` | Contact page |

All schema validated in Google's Rich Results Test in Phase 3.05.

### Technical SEO
- Dynamic `sitemap.xml` (Next.js App Router)
- `robots.txt`
- `hreflang` tags on every localized page (`x-default`, `en`, `es`)
- OG image generator (1200×630, branded) — auto-generated per page using `next/og`
- 301 redirects from old WordPress URLs (mapped in Phase 3.07)
- Canonical URLs on every page

---

## 10. Bilingual approach (EN + ES)

- **English is the default.** No URL prefix.
- **Spanish lives at `/es/...`** Same path structure under `/es/`.
- **Library:** `next-intl 4.9`
- **Strings:** stored in `src/messages/en.json` and `src/messages/es.json`
- **CMS content:** Sanity has bilingual fields (e.g., `title.en`, `title.es`)
- **Translation workflow:**
  1. All content written in English first
  2. Claude Code drafts Spanish translation in Phase 2.12
  3. Native review (Erick or designate) in Phase 2.13 — non-negotiable
  4. Decisions logged in `Sunset-Services-TRANSLATION_NOTES.md`
- **Language switcher:** in header, persistent, preserves current path
- **No Google Translate widget.** Ever.

---

## 11. Lead-capture mechanics

The site is built around getting leads, not just looking pretty. Three capture surfaces:

### 1. Quote wizard (primary) — `/request-quote/`
5-step form. Even abandoners get tracked — every step pushes a partial Mautic record.

| Step | Content |
|---|---|
| 1 | Audience selection — Residential / Commercial / Hardscape |
| 2 | Service selection — dynamic from Sanity based on Step 1 audience |
| 3 | Property/project details — branches by audience (square footage, # of properties, project type, etc.) |
| 4 | Contact info + property address |
| 5 | Review & submit |

On submit:
- POST to `/api/quote` → push to Mautic, send Resend email to `info@sunsetservices.us`, redirect to `/thank-you/`
- `/thank-you/` page shows a confirmation message + Calendly embed for "Book a 30-min consultation"

### 2. AI chat widget (sitewide)
- Persistent bubble bottom-right on every page
- Captures name + email after a few messages
- Pings Telegram on high-intent signals (e.g., "ready to book," "need quote")
- See Section 12 for full spec

### 3. Click-to-call with CallRail
- Mobile sticky header: tap-to-call button always visible
- CallRail dynamic number swapping by traffic source

---

## 12. AI chat widget specification

| Aspect | Spec |
|---|---|
| Position | Bottom-right bubble, persistent across all pages |
| Bilingual | Auto-detects locale, follows visitor's language |
| Knowledge base | Sanity content — services, locations, team, process, FAQs, hours |
| Lead capture | Captures name + email after engagement; pushes to Mautic |
| High-intent escalation | Pings Erick's Telegram with the conversation summary |
| Rate limiting | 1 message / 2 seconds per IP, 50 messages / day per IP |
| Kill switch | `AI_CHAT_ENABLED=false` env var hides it instantly |
| Model | `claude-sonnet-4-6` via `@anthropic-ai/sdk` |
| Streaming | Server-sent events, token-by-token rendering |
| Conversation history | Stored in browser localStorage during session, cleared on close |
| Compliance | Cookie consent gate respected; no analytics fired before consent |

UI built in Part 1 (Phase 1.18 design, 1.19 code, no API calls). Wired up in Part 2 (Phase 2.09).

---

## 13. Automation agent specification

Runs in the background on Vercel Cron jobs. Built in Part 2 (Phases 2.17–2.19).

| Cadence | Job |
|---|---|
| Daily | Fetch new Google reviews via Places API, cache in Sanity |
| Weekly | Email Erick a Search Console SEO summary on Telegram |
| Monthly | Draft a blog post using current keywords; send to Erick for approval before publishing |
| Seasonal (Oct/Apr) | Toggle "snow removal" CTA prominence; update GBP holiday hours |
| On-demand | When ServiceM8 marks a job complete: agent grabs photos, drafts a project description, publishes to portfolio, uploads to GBP, drafts a Google Post |
| Per review | Drafts a reply to every new Google review → Telegram with Approve / Edit / Reject buttons → on Approve, posts via GBP API |

All agent actions are logged. All publishing actions require Telegram approval — the agent never publishes autonomously.

---

## 14. Phase breakdown — Part 1 (Local-only build)

> **Goal:** Every page exists and looks finished on `localhost`. GitHub repo created and pushed to. No Vercel, no live integrations.

| # | Phase | Type | Scope |
|---|---|---|---|
| 1.01 | Account & local environment setup | **Cowork** | Create GitHub account/repo `DinovLazar/sunsetservices`. Confirm folder `C:\Users\user\Desktop\SunSet-V2` exists. Verify Node.js 20+, npm, Git, VS Code installed. Generate SSH key, add to GitHub. |
| 1.02 | Repo bootstrap & Next.js scaffold | **Code** | `create-next-app`, TypeScript strict, Tailwind v4, next-intl, app router, `proxy.ts`, base folder structure. Push initial commit to GitHub. Pin every version in `current-state.md`. |
| 1.03 | Design system finalization | **Design** | Take the locked palette/typography from this doc and produce: full design tokens spec, component styling conventions (button states, card variants, form fields), spacing scale, motion presets. Output a handover with code-ready CSS. |
| 1.04 | Design tokens & global styles | **Code** | Implement `@theme` block in `globals.css`, base typography, base layout, `<AnimateIn>` and `<StaggerContainer>` helpers, `MotionConfig`. Smoke test on a blank page. |
| 1.05 | Navbar + Footer + base layout | **Design** + **Code** | Design handover for navbar (desktop + mobile), footer, language switcher. Code implementation. |
| 1.06 | Homepage design | **Design** | Full visual mockup of homepage: hero, audience entry points, services overview, social proof (Google reviews, Unilock badge), about teaser, projects teaser, CTA section. |
| 1.07 | Homepage code | **Code** | Implement homepage from handover. All content placeholder/dummy. |
| 1.08 | Audience landing template + service detail template | **Design** | Visual mockups of: residential/commercial/hardscape landing template (one master, three variants) and a service-detail page template (one master, applies to all 16 service pages). |
| 1.09 | 3 audience landings + first 4 service pages | **Code** | Build the 3 landings + 4 service pages from the templates. Dummy content. |
| 1.10 | Remaining 12 service pages | **Code** | Template reuse — no new design needed. |
| 1.11 | About + Contact design | **Design** | Visual mockups for About (brand story, team, credentials) and Contact (form, map, hours, Calendly placeholder). |
| 1.12 | About + Contact code | **Code** | Implement both pages. Calendly is a UI placeholder for now. |
| 1.13 | Service areas + 6 location pages design | **Design** | Visual mockups for service-areas index + a location page template. |
| 1.14 | Service areas + 6 location pages code | **Code** | Build index + 6 city pages from template. Local SEO copy in dummy form. |
| 1.15 | Projects portfolio design | **Design** | Visual mockups for projects index (filterable grid) and project detail page. |
| 1.16 | Projects portfolio code | **Code** | Build index + detail with placeholder projects. |
| 1.17 | Resources + Blog design | **Design** | Visual mockups for resources index + detail, blog index + post template. |
| 1.18 | Resources + Blog code + 5 seed posts | **Code** | Build pages, draft 5 seed blog posts (placeholder featured images). |
| 1.19 | Quote wizard design + AI chat widget UI design | **Design** | Visual mockups for all 5 wizard steps + thank-you page + AI chat bubble (collapsed, expanded, message bubbles, lead capture state). |
| 1.20 | Quote wizard + AI chat widget code + Part 1 acceptance | **Code** | Build wizard UI (no submission), build chat widget UI (no API). Final QA pass: click every page, fix visual bugs, run first Lighthouse, push final commit. Write Part 1 completion report. |

---

## 15. Phase breakdown — Part 2 (GitHub + Vercel + functionality)

> **Goal:** Site fully functional on a Vercel preview URL. Every integration live. Spanish translation reviewed.

| # | Phase | Type | Scope |
|---|---|---|---|
| 2.01 | Account creation runway | **Cowork** | Cowork creates: Cloudflare, Sanity, Vercel, Resend, CallRail, Telegram bot, ServiceM8 API, Anthropic API. **Starts Google Business Profile API verification immediately** (takes weeks). Mautic install deferred — user will set up self-hosted Mautic later. |
| 2.02 | Vercel preview deploy | **Code** | Connect GitHub repo to Vercel, configure env vars, get a working preview URL on every commit. Production domain stays on old site. |
| 2.03 | Sanity CMS — schemas | **Code** | Define Sanity schemas: services, projects, blog posts, locations, FAQs, reviews, team. Deploy Sanity Studio. |
| 2.04 | Photo curation & upload to Sanity | **Cowork** | Cowork organizes Google Drive into service folders + `/projects/` folder. Cowork uploads photos into Sanity assets. Erick confirms canonical keepers. |
| 2.05 | Wire Sanity content to live site | **Code** | Replace dummy content sitewide with real Sanity-driven content. |
| 2.06 | Quote wizard wiring | **Code** | Wire form to `/api/quote`. Mautic stub with feature flag (real Mautic comes when user installs server-side). Resend email to `info@sunsetservices.us`. End-to-end test. |
| 2.07 | Calendly embed | **Code** | Real Calendly embed on Contact and Thank-You pages. |
| 2.08 | Resend email templates | **Code** | Branded email templates for: quote submission confirmation, contact form receipt, newsletter signup. From `info@sunsetservices.us`. |
| 2.09 | AI chat widget wiring | **Code** | Anthropic SDK integration. Knowledge base from Sanity. Rate limiting. `AI_CHAT_ENABLED` kill switch. Telegram alert on high-intent. |
| 2.10 | CallRail integration | **Code** | Dynamic phone number swapping by traffic source (organic, paid, direct, social, referral). Mobile sticky tap-to-call. |
| 2.11 | Analytics stack | **Code** | GTM container, GA4 connected via GTM, Microsoft Clarity, Vercel Analytics. Cookie consent banner gates everything. |
| 2.12 | Spanish translation pass | **Code** | Translate all content (UI strings + Sanity content). Log decisions in `Sunset-Services-TRANSLATION_NOTES.md`. |
| 2.13 | Native Spanish review | **Cowork** + Erick | Erick (or designate) reviews and corrects Spanish translation. Cowork applies corrections to Sanity + JSON files. |
| 2.14 | ServiceM8 webhook | **Code** | Webhook endpoint receives job-complete events, queues for automation agent processing in Phase 2.18. |
| 2.15 | Google Business Profile + Places API | **Code** | Daily review fetch (Places API). GBP API client for posts, photos, replies. Write API access requires Phase 2.01 verification complete. |
| 2.16 | Telegram bot | **Code** | Bot for Erick's notifications: lead alerts, review-reply approvals, agent errors. Inline keyboard for Approve/Edit/Reject. |
| 2.17 | Automation agent — Part A | **Code** | Daily job: fetch new Google reviews into Sanity. Weekly job: Search Console summary to Telegram. |
| 2.18 | Automation agent — Part B | **Code** | Monthly blog draft (sent to Erick for approval). Seasonal toggles (snow removal Oct–Apr, GBP hours). On-demand: ServiceM8 job complete → portfolio publish + GBP photo upload + Google Post draft. |
| 2.19 | Automation agent — Part C | **Code** | Review-reply drafting per new review → Telegram approval flow → on Approve, posts reply via GBP API. |
| 2.20 | Part 2 QA + integration sweep | **Code** | End-to-end test every integration. Verify analytics fire correctly. Verify cookie consent gating. Push all Spanish corrections. Write Part 2 completion report. |

---

## 16. Phase breakdown — Part 3 (Final polish and production cutover)

> **Goal:** Live on `sunsetservices.us` with every quality target met.

| # | Phase | Type | Scope |
|---|---|---|---|
| 3.01 | Performance pass | **Code** | Hit Lighthouse 95+ on Performance, Accessibility, Best Practices, SEO — desktop + mobile, sampled on home, one service page, one blog post. Image optimization, code splitting, font preloading, lazy loading, critical CSS audit. |
| 3.02 | Accessibility audit | **Code** | WCAG 2.2 AA compliance. Screen reader pass (NVDA + VoiceOver), keyboard nav pass, color contrast verification, focus states, skip links, ARIA where needed. |
| 3.03 | Legal pages design | **Design** | Visual treatment for Privacy, Terms, Cookie Consent banner. Use Termly or iubenda generated content where possible. |
| 3.04 | Legal pages code + cookie consent banner | **Code** | Implement Privacy and Terms pages. Cookie banner with consent gating for analytics. |
| 3.05 | Schema validation pass | **Code** | Run every page through Google's Rich Results Test. Fix any errors or warnings. |
| 3.06 | Sitemap + robots.txt + hreflang final pass | **Code** | Verify dynamic sitemap covers every page (EN + ES). robots.txt correct. hreflang tags present and valid. |
| 3.07 | 301 redirects from WordPress URLs | **Code** + **Cowork** | Cowork pulls a list of every URL on the current WordPress site. Code implements 301 redirects in `next.config.ts` or `proxy.ts` so old URLs land on the right new pages. |
| 3.08 | Brand consistency final check | **Cowork** | Final pass on Google Business Profile, Yelp, Facebook, Instagram, YouTube. NAP (name/address/phone) identical everywhere. |
| 3.09 | SSL fix on current site | **Cowork** | If not already done in parallel: renew/replace SSL on the current WordPress install before cutover. (May already be moot at cutover.) |
| 3.10 | Cloudflare DNS prep | **Cowork** + **Code** | Move domain DNS to Cloudflare (if not already there). Configure all records ready for cutover but don't switch the A record yet. |
| 3.11 | Pre-cutover QA | **Code** + user | Full clickthrough on the Vercel preview. Content review (every page, both languages). Broken links scan. Forms tested live. Chat widget tested. |
| 3.12 | DNS cutover | **Cowork** + **Code** | Switch sunsetservices.us A/CNAME records to point at Vercel. Vercel issues SSL automatically. Monitor propagation. |
| 3.13 | Production verification | **Code** | Verify SSL active, all redirects working live, schema valid on production, all integrations firing on the production domain. |
| 3.14 | Search Console + Bing submission | **Cowork** | Submit new sitemap to Google Search Console and Bing Webmaster Tools. Verify ownership. Set up email alerts for indexing issues. |
| 3.15 | Sanity Studio handover to Erick | **Cowork** | Add Erick as Sanity editor. Walk him through publishing a blog post. Document the workflow in a runbook. |
| 3.16 | Post-launch monitoring setup | **Code** + **Cowork** | Telegram alerts for: form submissions, errors, review approvals. Vercel Analytics dashboard. GA4 dashboard. |
| 3.17 | 30-day review | **Code** + **Cowork** | After 30 days live: re-run Lighthouse, check Search Console for indexing/errors, review GA4 traffic, review lead volume, fix any issues that surfaced. Write 30-day report. |

---

## 17. Acceptance criteria — what "v1 launched" means

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
- [ ] Click-to-call button present on mobile sticky header (CallRail-tracked)
- [ ] AI chat widget live, bilingual, rate-limited, kill switch tested
- [ ] Automation agent stubs deployed (review-reply drafting, blog drafting, GBP posting), Telegram approval flows tested
- [ ] Google Business Profile, Yelp, Facebook, Instagram, YouTube all updated to "Sunset Services" + 1630 Mountain St, Aurora, IL 60505 + (630) 946-9321
- [ ] New SSL certificate active on `sunsetservices.us`
- [ ] 5 seed blog posts live, each 800+ words, each with hand-curated featured image, FAQ schema where relevant
- [ ] 30+ project portfolio entries live, photos curated from Drive
- [ ] Sanity Studio access shared with Erick, runbook delivered
- [ ] Automation hook stubs in place; runbook saved
- [ ] WCAG 2.2 AA verified
- [ ] All Part 1, Part 2, Part 3 phase completion reports filed

If any item is false, we're still building.

---

## 18. Pre-build parallel-track tasks (Cowork-led, run alongside phases)

These don't block Phase 1.01 but block launch. Cowork starts them as early as possible.

| Task | Owner | Why it can't wait |
|---|---|---|
| Renew/replace SSL on the current sunsetservices.us | **Cowork** | Currently expired — actively damaging trust + SEO right now |
| Standardize brand name to "Sunset Services" across Google Business / Yelp / Facebook / Instagram / YouTube | **Cowork** | Inconsistent NAP is the #1 thing holding local businesses back in Google rankings |
| Curate Google Drive photo library into service folders + `/projects/` | **Cowork** drafts; Erick confirms keepers | Needed for Phase 2.04 Sanity uploads |
| Confirm Spanish native reviewer (likely Erick) | **User** | Must be confirmed before Phase 2.13 |
| Google Business Profile API verification | **Cowork** | Verification can take 2–6 weeks — start in Phase 2.01 |
| Mautic server install | **User** (later) | Self-hosted; Code stubs the integration with feature flag in Phase 2.06 so launch isn't blocked. Mautic flips on whenever the server is ready. |

---

## What's next

The next deliverable in this chat is **`Part-1-Phase-01-Cowork.md`** — the prompt file Cowork uses to set up your local environment, GitHub account, and repo. After that runs, we move to Phase 1.02 (Repo Bootstrap, Code).

Tell me when you're ready to start Phase 1.01.
