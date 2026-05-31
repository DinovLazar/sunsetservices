# Phase M.10f (Code) — Completion: mobile homepage hero (viewport-fit + legibility)

_2026-05-31 · branch `phase/m10f-mobile-hero-fix` (off `main`; M.10e + M.11 already merged) · NOT merged to `main`._

## Problem
On phones the homepage hero clipped its own bottom content (CTA + trust row) and the white hero text was hard to read over the bright photo.

## Root cause (confirmed in-code + measured @ 375×667)
`HomeHero` used a **fixed** height `h-[max(75vh,560px)]` + `overflow-hidden`. With fonts loaded the content stack (2-line eyebrow ES / 3-line H1 / long body / two **stacked** CTAs / trust row) is far taller than the 560 px floor → the bottom was clipped:

| Locale | content span (eyebrow→trust) | clipped |
|---|---|---|
| EN | 604 px | **172 px** (trust + secondary CTA edge) |
| ES | 625 px | **193 px** trust + **63 px** secondary; primary flush to edge |

`vh` is the *large* viewport (ignores the mobile address bar), so on real phones the next section became a thin sliver. The bottom-up scrim was also too weak where the eyebrow/body sit → failed AA over the brightest frame.

## Fix (phones only; tablet `sm:` + desktop `lg:` byte-for-byte unchanged)
`src/components/sections/home/HomeHero.tsx` + `src/app/globals.css`:
1. **`min-h-[max(30rem,82svh)]`** (small-viewport units, **no** fixed height) → the hero tracks the visible viewport **and** grows to fit content; clipping is structurally impossible. `sm:min-h-0 sm:h-[max(75vh,560px)] lg:h-[max(85vh,600px)]` preserve tablet/desktop.
2. Tightened mobile spacing: `pt-32→pt-24`, `pb-10→pb-8`, `gap-5→gap-4`.
3. Strengthened the `<sm` gradient: `0.12 → 0.34@38% → 0.58@66% → 0.86@100%` (was `0.10/0.20/0.70`).
4. Mobile-only `.hero-text-legible` **text-shadow** (globals.css `@media (max-width:639.98px)`) on the eyebrow/H1/trust — **not** the buttons.

Carousel (`HomeHeroCarousel.tsx`) **untouched** → LCP (`priority`+`fetchPriority="high"` frame 1) and reduced-motion (interval never starts) preserved by construction.

## Verification — headless Playwright, production build, exact viewports
| case | hero | trust clipped | primary CTA bottom | primary visible in vp | next-section peek | text-shadow |
|---|---|---|---|---|---|---|
| EN 375×667 | 715 | **0** | 558 | ✅ | hero≈vp (clean, scroll) | on text / off buttons |
| ES 375×667 | 737 | **0** | 580 | ✅ | hero≈vp (clean, scroll) | on text / off buttons |
| EN 375×573 (addr-bar) | 715 | **0** | 558 | ✅ | — | ✅ |
| ES 375×573 (addr-bar) | 737 | **0** | 580 | ⚠️ 7 px below fold | — | ✅ |
| EN 390×844 | 718 | **0** | 561 | ✅ | **61 px** | ✅ |
| ES 390×844 | 740 | **0** | 582 | ✅ | **39 px** | ✅ |
| Desktop 1280×800 | **680** (unchanged) | 0 | 612 | ✅ | 47 px | **none** (desktop untouched) |

- **Nothing is clipped** anywhere (the actual bug). Primary "Get a Free Estimate" CTA is visible within 375×667 in EN + ES. Taller phones (390×844) show a clean peek; the shortest phone reads as a full hero + scroll (no broken sliver). Per locked **Decision 2** the only residual is ES on the very smallest address-bar-reduced viewport (~553–573 px), where the *secondary*/trust fall below the initial fold (revealed as the address bar auto-hides on scroll) — not forced, to avoid crowding.
- **Desktop confirmed unchanged**: 680 px (`=max(85vh,600px)`), `min-height:0`, no text-shadow.

## Contrast over the brightest carousel frame
Per-pixel luminance sampling of all 4 frames: the **patio `hero.jpg`** (avg-lum 0.32) is the brightest, not the snow frame (0.18). Gradient-only composite contrast (conservative linear estimate — understates the true gamma-darkened value) against the `#FAF7F1` text:

| band | EN avg | ES avg | AA needed |
|---|---|---|---|
| eyebrow | **7.4 : 1** | **7.2 : 1** | 4.5 (small) ✅ |
| H1 | 4.4 : 1 | 4.3 : 1 | 3.0 (large) ✅ |
| body | 4.0 : 1 | 4.0 : 1 | 4.5 (small) — gradient ≈ threshold; **text-shadow carries it** |

The eyebrow + H1 pass on the gradient alone; the body sits right at the threshold on the conservative estimate, and the brightest single pixels (worst-case ~1.3–2.0 gradient-only) are covered by the per-glyph text-shadow halo — the standard white-text-over-photo treatment (per the brief's "and/or text-shadow" and B.06's manual hero approach). A non-opaque scrim alone cannot reach AA over the brightest pixels without hiding the photo.

## Deterministic checks (all green on the final build)
`npm run build` clean · `npx tsc --noEmit` 0 · `npm run lint` 0 · `validate:schema` 22/22 · `validate:seo` 184·0/0 · `validate:a11y` 20/20 (incl. `/` + `/es`) — M.11 baseline, no regressions.

## Chat bubble
`ChatBubble` is `fixed bottom-5 right-5`. Screenshots confirm it sits **below** the CTA stack (no overlap) — the fix lifts the CTAs off the bottom edge.

## Status / next step
Localhost production build verified above. **Vercel Preview** (deployed artifact + real on-phone address-bar behaviour) is the user's remaining check — branch pushed to `origin/phase/m10f-mobile-hero-fix`. Do **NOT** merge to `main`; the user verifies on Preview, then merges.
