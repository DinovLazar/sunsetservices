# Part 1 — Phase 04 — Completion Report

**Phase:** Design tokens & global styles (Code)
**Date completed:** 2026-05-03
**Operator:** Claude Code

---

## What was done

The design system from Phase 1.03 is now live in code. `src/app/globals.css` was reorganized
into a single `@theme { ... }` block (typography, brand + semantic + focus/selection/overlay
colors, spacing including the explicit `--spacing-9: 36px` and `--spacing-14: 56px`, container
widths, radius, shadow, border, opacity, backdrop-blur, motion durations + easings, z-index,
breakpoints, and the full text scale), followed by `@layer base` (heading + body type defaults,
`:focus-visible` ring, an explicit-property `*` transition allow-list, `::selection`,
reduced-motion overrides for hover transforms, and print styles), then `@layer components`
covering all twelve component families from handover §6 — Button, Card, Form fields, Link,
Badge, Avatar, Tooltip, Dialog, Toast/Alert, Breadcrumb, Pagination, Skip-link — with every
variant × state × size mapped to a token-driven utility class. Manrope + Onest are wired
through `next/font/google` in `src/app/[locale]/layout.tsx` with `display: 'swap'`,
`subsets: ['latin', 'latin-ext']`, and `variable: '--font-heading' | '--font-body'`. Six
motion primitives live under `src/components/global/motion/`: three plain TS modules
(`easings.ts`, `variants.ts`, `stagger.ts`) and three client components (`AnimateIn.tsx`,
`StaggerContainer.tsx`, `StaggerItem.tsx`), plus a `MotionRoot.tsx` client wrapper that mounts
`MotionConfig reducedMotion="user"` from the server `LocaleLayout`. `src/app/[locale]/dev/system/page.tsx`
renders fifteen numbered sections — type scale, buttons, cards, form fields, links, badges,
avatars, tooltip, dialog, alerts/toasts, breadcrumb, pagination, skip-link, color swatches with
WCAG ratios, and a motion sandbox — at both `/dev/system` and `/es/dev/system`.
`npm run lint` and `npm run build` both exit 0.

---

## Pinned versions

New direct dependency added this phase:

| Package | Resolved version | Notes |
|---|---|---|
| `@base-ui/react` | **1.4.1** | The npm package was renamed from `@base-ui-components/react` mid-major-zero; the canonical name is now `@base-ui/react`. Initial install of `@base-ui-components/react` printed deprecation warnings, was uninstalled, and replaced with `@base-ui/react`. |

Reaffirmed (already pinned in 1.02, untouched here):

| Package | Resolved version |
|---|---|
| `motion` | 12.38.0 (imported as `motion/react`) |
| `lucide-react` | 1.14.0 |
| `next-intl` | 4.11.0 |
| `tailwindcss` | 4.2.4 |
| `@tailwindcss/postcss` | 4.2.4 |
| `next` | 16.2.4 |
| `react` / `react-dom` | 19.2.4 |
| `typescript` | 5.9.3 |

`Manrope` and `Onest` are loaded via the built-in `next/font/google` (no separate dependency).

---

## Decisions ratified (restated for the record)

- **D1 — Focus-ring color: Option A.** `--color-focus-ring: #6FA85F` (green-tinted, mix of
  green-500 + white). Clears WCAG 2.2 SC 1.4.11 (≥3:1) on white (3.4:1), cream (3.2:1), and
  charcoal (7.6:1). On `--color-sunset-green-500` surfaces (primary buttons), the focus ring
  switches to `--color-text-on-green` per `.btn-primary:focus-visible` in `globals.css`.
  Option B (amber-tinted #E8A33D) was rejected — fails 3:1 on white (2.4:1) and cream (2.3:1).

- **D2 — Featured-card variant: Option A.** White surface with a 2px
  `--color-sunset-amber-500` decorative border ring, implemented as `.card-featured` in
  `globals.css`. Constraint carried forward to all 1.06+ page handovers: a section that sets
  `featuredCard: true` may NOT also include an amber CTA on the same page (the amber border
  is decorative, but two adjacent amber surfaces would compete with the brand's "amber
  reserved for the single top CTA per page" discipline).

---

## Files added

| File | Purpose |
|---|---|
| `src/components/global/motion/easings.ts` | Three named easings (`standard`, `soft`, `snap`) + four duration constants (`fast`, `base`, `slow`, `deliberate`) consumed by `motion/react`. |
| `src/components/global/motion/variants.ts` | The six `<AnimateIn>` variants (fade, fade-up, fade-down, fade-left, fade-right, scale) typed as `Variants` from `motion/react`. |
| `src/components/global/motion/stagger.ts` | `staggerContainer` (80ms `staggerChildren`, 40ms `delayChildren`) + `staggerItem`. |
| `src/components/global/motion/AnimateIn.tsx` | Client component, polymorphic `as`, default `variant="fade-up"`, `whileInView` once with `margin: '-10% 0px'`, honors `delay` by spreading it into the variant's transition. |
| `src/components/global/motion/StaggerContainer.tsx` | Client component wrapping children with `staggerContainer` + `whileInView`. |
| `src/components/global/motion/StaggerItem.tsx` | Client component consuming `staggerItem`. |
| `src/components/global/motion/MotionRoot.tsx` | `"use client"` wrapper that mounts `MotionConfig reducedMotion="user"` once. Used from the server `LocaleLayout`. |
| `src/app/[locale]/dev/system/page.tsx` | Dev-only smoke test — fifteen sections covering every component variant × state × size, color swatches with measured WCAG ratios, and a motion sandbox. Resolves at `/dev/system` and `/es/dev/system`. |
| `src/app/[locale]/dev/system/_client-demos.tsx` | Client-only Dialog and Tooltip demos imported by the smoke page (uses `@base-ui/react/dialog` and `@base-ui/react/tooltip`). |
| `src/_project-state/Part-1-Phase-04-Completion.md` | This report. |

---

## Files modified

| File | Change |
|---|---|
| `src/app/globals.css` | Replaced the create-next-app placeholder with the full `@theme` block, `@layer base`, and `@layer components` — 867 net insertions. |
| `src/app/[locale]/layout.tsx` | Added `next/font/google` imports for Manrope + Onest, applied both `variable` classNames to `<html>`, wrapped children in `<MotionRoot>`. |
| `package.json` | Added `@base-ui/react` to `dependencies`. |
| `package-lock.json` | Updated for the `@base-ui/react` install. |
| `src/_project-state/current-state.md` | Reflects Phase 1.04 closure (token system live, motion helpers live, fonts live, smoke test live). |
| `src/_project-state/file-map.md` | Lists every new/modified path. |
| `src/_project-state/00_stack-and-config.md` | Recorded `@base-ui/react` install, the layout-topology deviation, the `MotionConfig` boundary pattern, and the `@theme` font-token-as-fallback subtlety. |

---

## Smoke-test results

### `npm run lint`

```
> sunset-services@0.1.0 lint
> eslint

EXIT_LINT=0
```

### `npm run build`

```
> sunset-services@0.1.0 build
> next build

▲ Next.js 16.2.4 (Turbopack)

  Creating an optimized production build ...
✓ Compiled successfully in 3.9s
  Running TypeScript ...
  Finished TypeScript in 3.7s ...
  Collecting page data using 6 workers ...
  Generating static pages using 6 workers (0/7) ...
✓ Generating static pages using 6 workers (7/7) in 746ms
  Finalizing page optimization ...

Route (app)
┌ ○ /_not-found
├ ● /[locale]
│ ├ /en
│ └ /es
└ ● /[locale]/dev/system
  ├ /en/dev/system
  └ /es/dev/system

ƒ Proxy (Middleware)

○  (Static)  prerendered as static content
●  (SSG)     prerendered as static HTML (uses generateStaticParams)

EXIT_BUILD=0
```

### Visual verification at `/dev/system`

- Page returned `HTTP 200` (134,269 bytes EN; 134,278 bytes ES) on first dev-server hit.
- `<html>` carries both font className variables: `manrope_<hash>-module__variable onest_<hash>-module__variable` — confirms `next/font/google` wiring.
- `lang="en"` on EN, `lang="es"` on ES — confirms locale-aware root layout.
- All fifteen `<h2>` section headers render in the live HTML (`1. Type scale` … `15. Motion sandbox`).
- Every component class from the @layer components block renders in HTML (`btn`, `card`,
  `card-featured`, `card-cream`, `card-photo`, `card-testimonial`, `field-input`, `field-error`,
  `link-inline`, `link-cta`, `link-nav`, `badge-subtle`, `badge-solid`, `badge-outlined`,
  `badge-pill`, `avatar-{24,32,40,48,64,96}`, `breadcrumb`, `pagination-item`, `skip-link`,
  `alert-info`, `alert-success`, `alert-warning`, `alert-danger`, `toast`).
- No console errors from Turbopack during dev compile or production build.

---

## Verification checklist

- [x] `Part-1-Phase-03-Design-Handover.md` was read end-to-end before any code was written (1,504 lines).
- [x] `package.json` contains `@base-ui/react@1.4.1`.
- [x] `src/app/[locale]/layout.tsx` (the root layout — see deviation note in §"Issues encountered") imports Manrope and Onest from `next/font/google` with weights, subsets, `display: 'swap'`, and variables `--font-heading` / `--font-body`. Both `variable` classNames are applied to `<html>`.
- [x] `src/app/globals.css` is reorganized into: `@import "tailwindcss"` → single `@theme { ... }` → `@layer base { ... }` → `@layer components { ... }`.
- [x] Every token category from handover §2–§8 is in the `@theme` block.
- [x] `--color-focus-ring: #6FA85F` (D1, Option A). Primary green button switches to `--color-text-on-green`.
- [x] `.card-featured` is white surface + 2px `--color-sunset-amber-500` ring (D2, Option A).
- [x] Amber button label color is `--color-text-primary` (8.0:1), not white.
- [x] On cream surfaces, body inline links use `--color-sunset-green-700`; green-500 reserved for ≥18px.
- [x] `@layer base` defines: heading + body type defaults, `:focus-visible` ring, `*` transition with explicit property list (no `all`), `::selection`, `img` max-width reset, reduced-motion override, print styles.
- [x] `@layer components` defines all 12 component families with variants × states × sizes.
- [x] `easings.ts` exports the 3 easings.
- [x] `variants.ts` exports `animateInVariants` with all 6 variants.
- [x] `stagger.ts` exports `staggerContainer` + `staggerItem`.
- [x] `AnimateIn.tsx`, `StaggerContainer.tsx`, `StaggerItem.tsx` are client components matching the API contracts in handover §11.
- [x] `<AnimateIn>` defaults to `variant="fade-up"`.
- [x] `<AnimateIn>` triggers on viewport entry once with `viewport={{once: true, margin: '-10% 0px'}}`.
- [x] `MotionConfig reducedMotion="user"` is mounted exactly once at `src/app/[locale]/layout.tsx`, via the `<MotionRoot>` client wrapper.
- [x] `src/app/[locale]/dev/system/page.tsx` exists and renders every section listed in §3.6.
- [x] `/dev/system` resolves at both `http://localhost:3000/dev/system` and `http://localhost:3000/es/dev/system` (both `HTTP 200`).
- [x] Manrope and Onest visibly render — confirmed via the next/font className on `<html>` and the rendered headings using `font-heading`.
- [x] Focus ring is visible green when tabbing — defined in the global `:focus-visible` rule. Switches to `--color-text-on-green` on `.btn-primary` (handover §6.1).
- [x] `<AnimateIn>` entrances fire once on scroll (`whileInView` with `viewport.once = true`); `<StaggerContainer>` staggers children at 80ms (`staggerChildren: 0.08`).
- [x] Reduced-motion behavior: `MotionConfig reducedMotion="user"` strips x/y/scale from variant transitions; `@media (prefers-reduced-motion: reduce)` in `@layer base` and inside `.card` removes hover transforms.
- [x] `npm run build` exits 0.
- [x] `npm run lint` exits 0.
- [x] `src/_project-state/current-state.md` updated.
- [x] `src/_project-state/file-map.md` updated.
- [x] `src/_project-state/00_stack-and-config.md` updated to record `@base-ui/react` and the new gotchas.
- [x] `src/_project-state/Part-1-Phase-04-Completion.md` written using the headings in §3.10.
- [x] Conventional-commit pushed to `origin/main`. **SHA: `120939e1b0553483a7ad420f7927ddb0cdd2dbd3`** (`120939e`). Title: `feat(design-system): tokens, fonts, motion helpers, /dev/system smoke test (Phase 1.04)`.

---

## Issues encountered

- **Layout topology — deviation from handover §11 file tree.** The handover's example tree
  showed both a root `src/app/layout.tsx` and a nested `src/app/[locale]/layout.tsx`. The
  Phase 1.02 scaffold did not create a separate root `app/layout.tsx`; instead, the
  `[locale]/layout.tsx` IS the root layout (it owns `<html>`, `<body>`, and the metadata
  export). Per the Next.js 16 docs at `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/layout.md`,
  "the root layout can be under a dynamic segment, for example when implementing
  internationalization with `app/[lang]/layout.js`" — this is the canonical `next-intl`
  pattern. Adding a separate root `app/layout.tsx` would force `<html lang>` to a fixed
  value at the root (since the locale isn't known above the `[locale]` segment), which
  would degrade Spanish-page accessibility for screen readers. **Resolution:** kept the
  existing layout topology, wired fonts and `<MotionRoot>` into the existing
  `[locale]/layout.tsx`. Documented in `src/_project-state/00_stack-and-config.md`.

- **`MotionConfig` client boundary.** `MotionConfig` from `motion/react` is a client-only
  component and importing it directly into the server `LocaleLayout` would push a
  `"use client"` boundary onto the entire layout tree (which would break `setRequestLocale`
  and other server-only `next-intl` calls). **Resolution:** extracted the prompt-suggested
  `<MotionRoot>` client wrapper at `src/components/global/motion/MotionRoot.tsx` that
  re-exports `<MotionConfig reducedMotion="user">{children}</MotionConfig>`. The locale
  layout is unaffected and still server-rendered.

- **`@base-ui/react` package rename.** The first `npm install @base-ui-components/react@latest`
  succeeded but printed two deprecation warnings — both `@base-ui-components/react` and
  `@base-ui-components/utils` were renamed to `@base-ui/react` and `@base-ui/utils`
  respectively. Uninstalled the old one and re-installed `@base-ui/react@1.4.1`. The handover's
  reference to `@base-ui/react` is the correct/canonical name; the older `@base-ui-components/...`
  name surfaced in older docs and in npm search results.

- **`@theme` font tokens.** Tailwind v4's `@theme` block compiles `--font-heading` /
  `--font-body` into `:root` declarations and uses them to generate the `font-heading` /
  `font-body` utilities. `next/font/google` with `variable: '--font-heading'` writes the
  loaded family onto `<html>` via `className`, which overrides the `:root` value via CSS
  cascade. So the values inside `@theme` are *fallback stacks*, not the actual loaded font.
  This is documented inline in `globals.css` and in `00_stack-and-config.md`.

- **Token-vs-hex substitutions in handover code blocks.** The handover's `@layer components`
  CSS used token references throughout (e.g., `var(--color-sunset-green-500)`), so very
  few literal-hex substitutions were needed. The few that were inlined as `transparent`
  in the handover stayed as `transparent` (it's a CSS keyword, not a token). **No** literal
  hex values were left in the `@layer components` block — every color resolves to a
  `--color-*` token from `@theme`.

- **23 moderate-severity npm vulnerabilities.** Carried over from 1.02; not addressed in
  this phase (per Plan instructions to revisit deliberately when relevant).

- **Phase 1.03 outputs were untracked at start of phase.** `git status` at the start showed
  `docs/`, `src/_project-state/Part-1-Phase-02-Completion.md`,
  `Part-1-Phase-03-Completion.md`, `Sunset-Services-Plan.md`, and
  `Sunset-Services-Project-Instructions.md` as untracked. They are committed alongside the
  Phase 1.04 changes here.

- **Commit SHA:** `120939e1b0553483a7ad420f7927ddb0cdd2dbd3` (`120939e`). A short follow-up
  docs commit fills this SHA into the report itself, since the feat commit cannot reference
  its own SHA without amending. Both commits are pushed to `origin/main`.

---

## Open items / handoffs

- Nothing blocks Phase 1.05.
- Phase 1.05 (Design — navbar / footer / base-layout mockups) reads `Part-1-Phase-04-Completion.md`
  for the "what's available now" context, then produces a handover that Code consumes in 1.06.
- The `/dev/system` route is dev-only and un-linked from real navigation. It can stay through
  Phase 2.x as a regression sentinel and be deleted once the homepage and audience landings
  are in place; or it can be deleted at any time.

---

## Quick reference for Phase 1.05

The repo is a Next 16 + React 19 + Tailwind v4 + `next-intl` 4 app. `motion v12` is wired
with `reducedMotion="user"` at the locale layout via `<MotionRoot>`. `@base-ui/react@1.4.1`
provides the headless primitives. Manrope (heading) and Onest (body) are loaded through
`next/font/google` and exposed as `font-heading` / `font-body` Tailwind utilities. The full
design-system tokens, base styles, and twelve component families live in
`src/app/globals.css`. Smoke test at `/dev/system` (and `/es/dev/system`) renders one of
every variant × state × size for visual sanity-checking. `npm run build` and `npm run lint`
both exit 0. No real page content yet — that starts in Phase 1.05 (Design) → 1.06 (Code).
