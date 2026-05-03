# Current State

> **Live snapshot of the repo.** Updated end of every phase. If this file disagrees with the live code, the live code wins (per `Sunset-Services-Project-Instructions.md` §8).

---

## Where we are

- **Last completed phase:** Part 1 — Phase 1.05 (Code: Navbar, Footer, Base Layout)
- **Next phase:** Part 1 — Phase 1.06 (Design: homepage mockup)
- **Date:** 2026-05-03

---

## What works on `localhost:3000`

- `/` — homepage placeholder (one `<h1>` + tagline) wrapped in the live chrome.
- `/es` — Spanish homepage placeholder wrapped in the live chrome.
- `/dev/system` — design-system smoke-test page wrapped in the live chrome.
- `/es/dev/system` — design-system smoke-test page (Spanish route, English copy — dev tool only).
- Sticky desktop navbar with Services + Resources mega-panels, language switcher, phone CTA, Get-a-Quote button. State A → B (homepage at top) → C (scrolled) transitions correctly.
- Mobile navbar (≤lg / 1024px) with always-visible tap-to-call, centered logo, and hamburger that opens a right-slide drawer with focus trap, body-scroll lock, and inline accordions for Services / Resources.
- Footer (charcoal surface) with brand block, three quick-links columns, newsletter placeholder, service-areas band, social icons, and legal microbar.
- Skip-link as first focusable element on every page.
- Language switcher swaps EN ↔ ES while preserving the path; `<html lang>` updates accordingly.
- `LocalBusiness` JSON-LD in `<head>` of every page (single source of truth: `lib/constants/business.ts`).
- Hot reload via Turbopack.

`/dev/system` still renders the Phase 1.03 component matrix; its inner `<a class="skip-link">` and
`<main id="main">` were removed so it doesn't duplicate the chrome's landmarks.

## What does NOT work yet

The chrome is real, but the routes it points to are placeholders (Projects, Service Areas, About,
Contact, Resources, Blog, all the Services children, /request-quote, /privacy, /terms,
/accessibility) — those return Next.js 404s until later phases populate them. No real homepage
sections (1.07+), no forms (2.06), no AI chat (1.20 / 2.09), no analytics (2.10), no Sanity
content (2.03), no email (2.08).

---

## Stack — pinned versions

| Package | Version |
|---|---|
| next | 16.2.4 |
| react | 19.2.4 |
| react-dom | 19.2.4 |
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

Fonts (loaded via `next/font/google`, no separate package): Manrope (heading, weights 400–800),
Onest (body, weights 400–700). Subsets: `latin`, `latin-ext`. `display: 'swap'`.

---

## Repo

- **Remote (SSH):** `git@github.com:DinovLazar/sunsetservices.git`
- **Default branch:** `main`
- **Visibility:** Private
- **Last commit (Phase 1.02):** `9a12047` — `chore(scaffold): bootstrap Next.js 16 + React 19 + Tailwind v4 + next-intl (Phase 1.02)`
- **Phase 1.04 commit:** `120939e` — design tokens, fonts, motion helpers, /dev/system smoke test.
- **Phase 1.05 commit:** `f0cb003` — `feat(layout): navbar, footer, base shell, language switcher (Phase 1.05)`.

---

## Open items / known mismatches with the Plan

- Sanity project NOT initialized — `next-sanity` dep installed, schemas folder created, real Sanity studio config defers to Phase 2.03.
- Real env vars NOT populated — `.env.local.example` documents the future variables; `.env.local` is gitignored and empty.
- `Sunset-Services-Project-Instructions.md` lives in the Claude project knowledge base; a copy is now in `src/_project-state/` for reference.
- 2FA NOT enabled on the GitHub account holding this repo (carryover from Phase 1.01, user-acknowledged risk).
- VS Code NOT installed (carryover from Phase 1.01, user runs Code via Claude desktop app).
- 23 moderate-severity npm vulnerabilities reported by `npm install` (all transitive). Not addressed in this phase per plan instructions; revisit deliberately when relevant.
- A few `extraneous` `@emnapi/*` entries from `npm ls --depth=0` — cosmetic; transitive native bindings flagged because their parent package didn't declare them as deps. No build impact.
- `postcss` is not a direct dep — Tailwind v4's `@tailwindcss/postcss` bundles its own PostCSS handling and the scaffolder no longer pulls `postcss` in directly. The Plan's stack table lists it; reality differs slightly. Build still works.
- **No root `src/app/layout.tsx`** — the `[locale]/layout.tsx` IS the root layout (per Next 16 docs, "the root layout can be under a dynamic segment"). This is the canonical `next-intl` pattern; the handover's example file tree showed both, but only one root layout is permitted by Next.js. Documented in `00_stack-and-config.md`.
- **Featured-card discipline (D2, ratified):** any future page-level handover that sets `featuredCard: true` on a section must NOT also include an amber CTA on that same page. Carry forward from 1.06+.
- **State B (over-hero translucent navbar) is on by default at the homepage when not scrolled.** With no hero photo yet on the placeholder homepage, this renders as a translucent white bar over a white page background — the visual difference is invisible until Phase 1.06 ships the hero image, at which point the blur becomes meaningful. The CSS hooks (`data-over-hero` on the navbar root) are already in place.
- **Brand social icons hand-rolled.** `lucide-react@1.14.0` no longer ships Facebook / Instagram / YouTube glyphs (trademark concerns). Monochrome `currentColor` SVGs were authored under `src/components/layout/icons/`. Same approach as the Google Business Profile mark — see Phase 1.05 completion report §6.
