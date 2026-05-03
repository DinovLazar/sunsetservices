# Current State

> **Live snapshot of the repo.** Updated end of every phase. If this file disagrees with the live code, the live code wins (per `Sunset-Services-Project-Instructions.md` §8).

---

## Where we are

- **Last completed phase:** Part 1 — Phase 1.04 (Code: Design tokens & global styles)
- **Next phase:** Part 1 — Phase 1.05 (Design: navbar / footer / base-layout mockups)
- **Date:** 2026-05-03

---

## What works on `localhost:3000`

- `/` — English smoke-test homepage with placeholder copy.
- `/es` — Spanish smoke-test homepage with placeholder copy.
- `/dev/system` — design-system smoke-test page (English route).
- `/es/dev/system` — design-system smoke-test page (Spanish route, English copy — dev tool only).
- Language toggle links between EN and ES.
- Hot reload via Turbopack.

`/dev/system` renders, in 15 numbered sections, every component variant × state × size from the
Phase 1.03 design handover (§6) plus the type scale, color swatches with WCAG ratios, and the
`<AnimateIn>` / `<StaggerContainer>` motion sandbox. It exists to verify tokens compile and the
motion helpers work — un-linked from the rest of the site, deletable before launch.

## What does NOT work yet

Everything except the smoke-test page and the design-system smoke. No real content, no real
navigation, no homepage sections, no forms, no AI chat, no analytics, no Sanity content, no
email — all of those land in later phases.

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
- **Phase 1.04 commit:** see `Part-1-Phase-04-Completion.md` (recorded after push).

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
