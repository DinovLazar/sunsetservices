# Part 1 — Phase 03 — Completion Report

**Phase:** Design System Finalization (Design)
**Date completed:** 2026-05-03
**Operator:** Claude Design

---

## What was done

The design system underneath every Sunset Services page is now locked. The locked Plan §5 values (green and amber palettes, warm neutral surfaces, Manrope + Onest type families with weights and subsets, four shadow tokens, five-step radius scale, alternating bg/cream section rhythm, "amber reserved for the single top CTA per page," light-mode-only) were preserved unchanged. On top of that base, the handover defines: a complete `@theme` color block including 8 semantic feedback tokens (success/warning/danger/info × fg/bg) plus focus-ring, selection, and overlay tokens; a contrast-audited pairing table where every text-on-background pairing intended for body has a measured ratio and clears WCAG 2.2 AA; a 1.25 modular type scale (Display + H1–H6 + body-lg/body/body-sm/micro) with mobile and desktop breakpoints, line-heights, tracking, and Tailwind v4 utility names; a 4px-based spacing scale with 14+ tokens, four named container widths, and per-breakpoint horizontal padding rules; radius/shadow/border/opacity application rules; full component specs for Button, Card, Form fields, Link, Badge, Avatar, Tooltip, Dialog, Toast, Breadcrumb, Pagination, and Skip-link, each with variants × states × sizes, embedded SVG visual references, and copy-pasteable Tailwind v4 / `@layer components` CSS; a motion system locked to 3 easings × 4 durations × 6 `<AnimateIn>` variants + stagger config + hover/tap micro-interactions + a reduced-motion contract; misc system tokens (z-index, breakpoints, iconography, focus ring, transition defaults, print styles); and an annotated section-rhythm reference visual showing the alternating-band pattern the homepage and audience landings will use. Two open decisions are surfaced for ratification before Phase 1.04 starts.

---

## Deliverables

| File | Path | Purpose |
|---|---|---|
| Design handover | `Part-1-Phase-03-Design-Handover.md` | Read by Claude Code in Phase 1.04 before any styling code is written |
| This report | `Part-1-Phase-03-Completion.md` | Phase closure record |

---

## What's locked vs what's left for Code

| Layer | Locked here | Implemented in Phase 1.04 |
|---|---|---|
| Color tokens | Full palette (locked + semantic + focus/selection/overlay), pairing rules, AA-audited contrast | `@theme` block in `src/app/globals.css` |
| Typography | Families, weights, subsets, mobile/desktop scale, special treatments, ES overflow rule | `next/font/google` import in `src/app/layout.tsx`, `@theme` `--text-*` tokens, `@layer base` defaults |
| Spacing | 14 tokens + container widths + page padding rules | `@theme` `--spacing-*` and `--container-*` |
| Surface tokens | Radius/shadow/border/opacity/backdrop-blur application rules | `@theme` tokens (already partly in Plan) |
| Components (12 families) | Variants × states × sizes + Tailwind/`@layer components` CSS + visual references | `src/components/ui/*`, `src/components/global/*`, `@layer components` block |
| Motion | 3 easings, 4 durations, 6 entrance variants, stagger, hover/tap, reduced-motion contract | `src/components/global/motion/{AnimateIn,StaggerContainer,StaggerItem}.tsx` + helper TS modules |
| Misc | z-index scale, breakpoints, iconography, focus ring, transition defaults, print | `@theme` + `@layer base` |
| Section rhythm | Annotated diagram + rules | Per-page handovers from 1.05+ apply the rhythm |

---

## Decisions needed (escalate to Claude Chat)

- **D1 — Focus-ring color.** Options: A) `#6FA85F` green-tinted (mix of green-500 and white) — clears 3:1 contrast on white (3.4), cream (3.2), and charcoal (7.6); fails on green-500 backgrounds where the ring switches to white per §6.1. B) `#E8A33D` amber-tinted (= amber-500) — fails 3:1 on white (2.4) and cream (2.3), the system's two most common surfaces. **Recommendation: A.** Rationale: B violates WCAG 2.2 SC 1.4.11 on the dominant page surfaces and would force a dual-color focus ring sitewide.

- **D2 — Featured-card variant.** Options: A) White surface with a 2px `--color-sunset-amber-500` decorative border ring. B) `--color-sunset-green-700` background panel with `--color-text-on-green` body. **Recommendation: A**, with the constraint that featured-cards may not appear in the same section as the page's amber CTA (so the amber border doesn't compete with the amber button). Rationale: A preserves "amber for one CTA per page" as a discipline (the border is decorative, not interactive); B is heavier visually and risks pulling attention from the page's actual amber CTA.

---

## Issues encountered

- **Plan-locked pairing flagged as failing AA.** White-on-amber-500 (`#FFFFFF` on `#E8A33D`) measures **2.4:1** — fails AA at all sizes. Rather than alter the brand amber, the handover locks amber-button labels to `--color-text-primary` (`#1A1A1A`), which clears **8.0:1**. This is a clarification of the Plan, not an override.
- **Green-500 link on cream surface flagged as borderline.** `#4D8A3F` on `#FAF7F1` measures **4.4:1** — fails AA body at 14–16px (passes AA large at 18pt+ / 14pt bold). The handover locks body links on cream surfaces to `--color-sunset-green-700` (`#2F5D27`, 9.2:1). Green-500 is still permitted on cream at large sizes and for icon strokes.
- **Tailwind v4 spacing default lacked a 36px rung.** Buttons at `md` size need 44px height while `sm` is 32 — neither resolves cleanly to a 4px-derived padding without a 36 token. Added `--spacing-9: 36px` explicitly.
- **No `py-14` token in the default scale.** Plan locks 56px mobile section padding. Recommended Code add `--spacing-14: 56px` (or use `py-[3.5rem]` arbitrary value) for symmetry with the desktop `--spacing-20`.
- **Decision deliberately deferred to Chat:** the focus-ring color (D1) and the featured-card variant (D2). Both have a measured-contrast / brand-discipline reason to prefer the recommended option, but neither is unilaterally mine to decide.
- **No mention of dark-mode tokens.** Confirmed.
- **No marketing prose.** Confirmed.

---

## Open items / handoffs

- Phase 1.04 (Code) reads `Part-1-Phase-03-Design-Handover.md` end-to-end before writing any styling code, then implements the `@theme` block, `@layer base`, and `@layer components` in `src/app/globals.css`; builds `<AnimateIn>` and `<StaggerContainer>` / `<StaggerItem>` per the API contracts in §11; mounts `MotionConfig reducedMotion="user"` once at `src/app/[locale]/layout.tsx`; and produces a dev-only `/dev/system` smoke-test page that renders one of every component variant.
- The two **Decisions needed** above must be ratified by Claude Chat (or the user) before Phase 1.04 starts. If Chat ratifies the recommendations as-is, no edits to the handover are required; Code reads the recommendations as final.
- The featured-card / amber-CTA constraint (per D2 recommendation) must be carried into every page-level design handover from 1.06 onward as a `featuredCard?: boolean` declaration per section.

---

## Verification checklist

- [x] `Part-1-Phase-03-Design-Handover.md` exists, is well-formed markdown, opens in any reader.
- [x] Every locked value from Plan §5 is preserved unchanged (palette hexes, font families, weights, radius scale, shadow tokens, section-rhythm rule).
- [x] Color system: full `@theme` block present with 8 semantic feedback tokens (success/warning/danger/info × fg/bg) + focus-ring + selection (bg + text) + overlay (50/80) tokens.
- [x] Color pairings audited for WCAG 2.2 AA — every text-on-background pairing has a measured ratio in §2.2 (26 pairings).
- [x] Typography scale: H1–H6 + body-lg/body/body-sm/micro + Display + special treatments (eyebrow, lead, blockquote, code), with mobile and desktop sizes, line-heights, letter-spacing.
- [x] Spacing scale: 14 base tokens (+ recommended `--spacing-14`) + section rhythm + 4 container widths + per-breakpoint horizontal padding rules.
- [x] Radius/shadow/border/opacity rules with application guidance (which radius for which component, which shadow for which surface).
- [x] 12 component families specified — Button, Card, Form fields, Link, Badge/tag/pill, Avatar, Tooltip, Dialog/modal, Toast/inline alert, Breadcrumb, Pagination, Skip-link — with variants × states × sizes.
- [x] Visual references embedded (inline SVG) for the components most likely to be misinterpreted from text alone — Button (variants + states + sizes), Card (variants), Form field (states), and the section-rhythm diagram.
- [x] Motion presets locked: 3 easings (`standard`, `soft`, `snap`), 4 durations (`fast` 120ms, `base` 240ms, `slow` 480ms, `deliberate` 700ms), 6 `<AnimateIn>` variants (fade, fade-up, fade-down, fade-left, fade-right, scale), stagger config (80ms staggerChildren / 40ms delayChildren), hover/tap table, reduced-motion contract.
- [x] Misc tokens (z-index, breakpoints, iconography, focus ring, transition defaults, print) all present.
- [x] Section-rhythm reference visual rendered with annotations.
- [x] Consolidated `Decisions needed` list at the end of the handover (D1, D2).
- [x] No mention of dark-mode tokens.
- [x] No marketing prose; spec language only.
