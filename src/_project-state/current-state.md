# Current State

> **Live snapshot of the repo.** Updated end of every phase. If this file disagrees with the live code, the live code wins (per `Sunset-Services-Project-Instructions.md` §8).

---

## Where we are

- **Last completed phase:** Part 1 — Phase 1.02 (Code: Repo bootstrap & Next.js scaffold)
- **Next phase:** Part 1 — Phase 1.03 (Design: Design system finalization) — produces a design handover `.md` for Phase 1.04 to implement.
- **Date:** 2026-05-03

---

## What works on `localhost:3000`

- `/` — English smoke-test homepage with placeholder copy.
- `/es` — Spanish smoke-test homepage with placeholder copy.
- Language toggle links between EN and ES.
- Hot reload via Turbopack.

## What does NOT work yet

Everything except the smoke-test page. No real content, no design system, no pages from the Plan, no forms, no AI chat, no analytics, no Sanity content, no email — all of those land in later phases.

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

---

## Repo

- **Remote (SSH):** `git@github.com:DinovLazar/sunsetservices.git`
- **Default branch:** `main`
- **Visibility:** Private
- **Last commit (Phase 1.02):** _to be filled in once pushed_ — `chore(scaffold): bootstrap Next.js 16 + React 19 + Tailwind v4 + next-intl (Phase 1.02)`

---

## Open items / known mismatches with the Plan

- shadcn (base-nova) NOT installed yet — defers to Phase 1.04 with the rest of the design system.
- Sanity project NOT initialized — `next-sanity` dep installed, schemas folder created, real Sanity studio config defers to Phase 2.03.
- Real env vars NOT populated — `.env.local.example` documents the future variables; `.env.local` is gitignored and empty.
- `Sunset-Services-Project-Instructions.md` lives in the Claude project knowledge base, not in this repo. User can copy it into the repo root any time.
- 2FA NOT enabled on the GitHub account holding this repo (carryover from Phase 1.01, user-acknowledged risk).
- VS Code NOT installed (carryover from Phase 1.01, user runs Code via Claude desktop app).
- 23 moderate-severity npm vulnerabilities reported by `npm install` (all transitive). Not addressed in this phase per plan instructions; revisit deliberately when relevant.
- A few `extraneous` `@emnapi/*` entries from `npm ls --depth=0` — cosmetic; transitive native bindings flagged because their parent package didn't declare them as deps. No build impact.
- `postcss` is not a direct dep — Tailwind v4's `@tailwindcss/postcss` bundles its own PostCSS handling and the scaffolder no longer pulls `postcss` in directly. The Plan's stack table lists it; reality differs slightly. Build still works.
