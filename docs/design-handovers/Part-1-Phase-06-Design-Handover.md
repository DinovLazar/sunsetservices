# Sunset Services — Homepage Design Handover (Phase 1.06)

> Read by Claude Code in Phase 1.07 before any homepage implementation begins.
> Source of truth: this file. Conflicts with Phase 1.03 tokens or Phase 1.05 chrome? **Earlier phases win.** Surface the mismatch to Claude Chat.
> Phase: Part 1 — Phase 06 (Design). Operator: Claude Design.

---

## Table of contents

1. [Scope and constraints](#1-scope-and-constraints)
2. [Page-level decisions](#2-page-level-decisions)
3. [Hero](#3-hero)
4. [Three audience entry points](#4-three-audience-entry-points)
5. [Services overview](#5-services-overview)
6. [Social proof band](#6-social-proof-band)
7. [About teaser](#7-about-teaser)
8. [Projects teaser](#8-projects-teaser)
9. [CTA section — the amber moment](#9-cta-section--the-amber-moment)
10. [SEO and schema](#10-seo-and-schema-for-the-homepage)
11. [Photography brief](#11-photography-brief)
12. [i18n strings required](#12-i18n-strings-required)
13. [Motion choreography](#13-motion-choreography)
14. [Accessibility audit](#14-accessibility-audit)
15. [Lighthouse 95+ implications](#15-lighthouse-95-implications)
16. [Component file plan for Code](#16-component-file-plan-for-code)
17. [Decisions needed](#17-decisions-needed)
18. [Verification checklist](#18-verification-checklist)

---

## 1. Scope and constraints

In scope: the homepage at `/` and `/es/`, comprising seven vertical sections — Hero, Three audience entry points, Services overview, Social proof band, About teaser, Projects teaser, and the bottom amber CTA. Chrome (navbar + footer) is locked in Phase 1.05 and wraps this page unchanged. Out of scope: real photography selection (Cowork sources from Erick's Drive in Phase 2.04), final marketing prose (Erick polishes copy in Part 2 — placeholders here are spec-only), and below-the-fold content for any route other than `/`. Every token referenced uses its locked name from Phase 1.03 §2–§7; literal hex values appear only inside SVG `fill`/`stroke` attributes where SVG cannot consume custom properties.

---

## 2. Page-level decisions

### 2.1 Section order (confirmed)

The seven-section order from the prompt is the right order; I am not proposing alternatives. The reasoning: Hero answers "what" and "for whom" → Audience entry points lets premium homeowners self-segment immediately (highest-value action after Hero) → Services overview proves breadth → Social proof proves credibility → About proves trust (family-run is a differentiator vs corporate competitors) → Projects proves quality → final amber CTA closes. Moving Audience entries down or Social proof up both tested worse against the "premium homeowner decides in 5 seconds" lens — entries-second compresses the time-to-self-segment to under one scroll.

### 2.2 Surface alternation (locked)

Per Phase 1.03 §9, never two adjacent same-surface bands. The hero is photographic and counts as its own surface — the section after it must contrast clearly.

| # | Section | Surface token | Reasoning |
|---|---|---|---|
| 1 | Hero | photographic over `--color-bg-charcoal` base (Layout A — see §3) | The hero is photo-led; the gradient sits on a charcoal undertone. |
| 2 | Audience entry points | `--color-bg` (white) | Bright break from the hero; the three audience photos pop. |
| 3 | Services overview | `--color-bg-cream` | Alternating cream lifts the white tiles. |
| 4 | Social proof | `--color-bg` (white) | White surface so cream review cards lift via `--shadow-on-cream`. |
| 5 | About teaser | `--color-bg-cream` | Warm surface for the family-business moment. |
| 6 | Projects teaser | `--color-bg` (white) | White lets the photographic project tiles dominate. |
| 7 | Final CTA | `--color-bg-cream` | Cream → charcoal footer is the cleanest contrast for the closer. (See D4 below for the charcoal alternative.) |

Pattern: hero → bg → cream → bg → cream → bg → cream → (footer charcoal). No two adjacent matching surfaces.

### 2.3 Amber discipline (restated)

Per Phase 1.05 §1, the navbar's "Get a Free Estimate" amber button is **chrome** and does not count against the page's amber budget. The page body's single amber CTA lives in **§9 (final CTA section)** — nowhere else on the homepage. **The hero's primary CTA is `Primary green × lg`, not amber**, so the hero never fires two amber buttons in the same viewport (navbar + hero would be two; navbar + green hero is one in-content amber, which is the rule). Stars in the social proof band are the documented exception (functional rating UI, not a CTA — Phase 1.03 §2.3 amber rules).

### 2.4 Featured-card uses on the homepage

**None.** The homepage uses default `card`, `card--cream`, and `card--photo` variants only. `.card-featured` (the amber-border ring from Phase 1.03 §6.2 Decision D2) does not appear on the homepage. Reasoning: the homepage already has an amber CTA in §9; Phase 1.03 D2 forbids `.card-featured` and an amber CTA in the same section, but I am tightening it further — **no `.card-featured` anywhere on the homepage** — because the page's amber moment must be unambiguous, and a featured-card several sections away still creates a "second amber surface" in long-scroll viewports. Service detail and audience-landing pages may use featured cards; `/` does not.

### 2.5 Reduced-motion behavior on this page

Per Phase 1.03 §7.7, when `prefers-reduced-motion: reduce` is honored by `MotionConfig reducedMotion="user"`:

- All `<AnimateIn>` entrances become opacity-only at `--motion-fast` (120ms). No translate, no scale.
- All `<StaggerContainer>` items lose their y-offset; the 80ms stagger and opacity remain so the reveal still reads as a cascade rather than a flash.
- Photo-card image scale on hover is removed; shadow growth is preserved.
- The hero has **no entrance animation regardless** of motion preference (see §3 below). Reduced-motion is therefore a no-op for the hero specifically.
- Hover button translateY is removed; color/shadow changes remain.

---

## 3. Hero

### 3.1 Layout decision — recommend A

I am locking **Layout A — full-bleed photo with text overlay** for the homepage hero, with B and C surfaced in §17 as D1 for Chat to ratify if it disagrees.

Reasoning:

1. **It exercises the navbar's only translucent state** (Phase 1.05 §3.3 State B). State B is a locked spec; a non-A layout would render that whole spec dead code.
2. **It shows photography prominently**, which is the brand's locked photography-led aesthetic (Plan §5).
3. **It out-performs B and C on first-impression density** — the H1, the trust microbar, the photograph, and the navbar's translucent blur all sit in one viewport at desktop. B splits the impression across left and right halves; C splits it across top and bottom.

Risks accepted and mitigated:

- **Contrast over photo:** mitigated by the gradient stops in §3.4 — every text-bearing band of the hero clears AA at 4.5:1 against the gradient + photo composite. Photography brief in §11 mandates an image whose lower 60% is naturally low-key (sky/light up top, hardscape/foreground darker below) so the gradient does the rest.
- **LCP discipline:** mitigated by the LCP optimization spec in §3.7 and the no-entrance-animation rule in §3.8. The hero photo IS the LCP element; it ships eager + AVIF + ≤350KB.

### 3.2 Hero — desktop (≥1280px) annotated mockup

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 920" width="100%" role="img" aria-label="Hero — desktop annotated mockup">
  <style>
    .h1   { font-family: 'Manrope', system-ui, sans-serif; font-weight: 800; font-size: 72px; fill: #FAF7F1; letter-spacing: -1.4px; }
    .sub  { font-family: 'Onest', system-ui, sans-serif; font-size: 20px; font-weight: 400; fill: #FAF7F1; }
    .kick { font-family: 'Manrope', system-ui, sans-serif; font-size: 13px; font-weight: 600; fill: #FAF7F1; letter-spacing: 1.5px; }
    .btn  { font-family: 'Manrope', system-ui, sans-serif; font-size: 17px; font-weight: 600; }
    .trust{ font-family: 'Onest', system-ui, sans-serif; font-size: 14px; font-weight: 500; fill: #FAF7F1; }
    .nv   { font-family: 'Onest', system-ui, sans-serif; font-size: 15px; font-weight: 500; fill: #1A1A1A; }
    .wm   { font-family: 'Manrope', system-ui, sans-serif; font-size: 22px; font-weight: 700; fill: #1A3617; }
    .anno { font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #B47821; font-style: italic; }
    .ruler{ stroke: #E8A33D; stroke-width: 1; stroke-dasharray: 3 3; fill: none; }
    .rulerlabel { font-family: 'Onest', system-ui, sans-serif; font-size: 10px; fill: #B47821; font-weight: 600; }
  </style>
  <!-- Photo placeholder: paver patio + fire feature, golden-hour -->
  <rect width="1440" height="850" fill="#3A4A2C"/>
  <pattern id="heroPattern" width="50" height="50" patternUnits="userSpaceOnUse">
    <rect width="50" height="50" fill="#3A4A2C"/>
    <line x1="0" y1="0" x2="50" y2="50" stroke="#4A5A3C" stroke-width="0.5"/>
    <line x1="50" y1="0" x2="0" y2="50" stroke="#4A5A3C" stroke-width="0.5"/>
  </pattern>
  <rect width="1440" height="850" fill="url(#heroPattern)"/>
  <!-- diagonal "photo placeholder" overlay -->
  <text x="720" y="280" font-family="ui-monospace, Menlo, monospace" font-size="14" fill="#6A7A5C" text-anchor="middle">[ HERO PHOTO · paver patio + fire feature · golden-hour · 16:9 · ≤350KB AVIF ]</text>

  <!-- Bottom-up dark gradient overlay -->
  <rect y="0" width="1440" height="850" fill="url(#heroOverlay)"/>

  <!-- Navbar in translucent state B -->
  <rect width="1440" height="72" fill="rgba(255,255,255,0.78)"/>
  <circle cx="76" cy="36" r="16" fill="#4D8A3F"/>
  <path d="M68 40 Q76 26 84 40" stroke="#FAF7F1" stroke-width="2.5" fill="none"/>
  <text x="100" y="42" class="wm">Sunset Services</text>
  <text x="380" y="42" class="nv">Services</text>
  <text x="490" y="42" class="nv">Projects</text>
  <text x="572" y="42" class="nv">Service Areas</text>
  <text x="694" y="42" class="nv">About</text>
  <text x="754" y="42" class="nv">Resources</text>
  <text x="878" y="42" class="nv">Contact</text>
  <text x="982" y="42" font-family="Onest" font-size="14" font-weight="500" fill="#2F5D27">Call (630) 946-9321</text>
  <g transform="translate(1148,22)"><rect width="68" height="28" rx="6" fill="#2F5D27"/><text x="14" y="19" font-family="Onest" font-size="14" font-weight="500" fill="#FAF7F1">EN</text><text x="42" y="19" font-family="Onest" font-size="14" font-weight="500" fill="#6B6B6B">ES</text></g>
  <g transform="translate(1232,18)"><rect width="184" height="36" rx="8" fill="#E8A33D"/><text x="92" y="23" class="btn" text-anchor="middle" fill="#1A1A1A">Get a Free Estimate</text></g>
  <text x="1432" y="62" class="anno" text-anchor="end">Navbar State B · rgba(255,255,255,0.78) + backdrop-blur-md</text>

  <!-- Content stack — left-aligned, 96px from container left edge -->
  <!-- Kicker eyebrow -->
  <text x="96" y="430" class="kick">AURORA · NAPERVILLE · DUPAGE COUNTY</text>
  <text x="96" y="450" class="anno">--text-micro · 13px · Manrope 600 · tracking 0.12em · uppercase · color --color-text-on-dark</text>

  <!-- H1 -->
  <text x="96" y="520" class="h1">Outdoor spaces,</text>
  <text x="96" y="600" class="h1">built to last 25+ years.</text>
  <text x="96" y="624" class="anno">--text-display · 72px desktop · Manrope 800 · text-wrap balance · max 7 words EN / 9 words ES</text>

  <!-- Subhead -->
  <text x="96" y="676" class="sub">Premium hardscape, full-service landscaping, and snow management</text>
  <text x="96" y="704" class="sub">across DuPage County. Family-run, Unilock-authorized, since 2000.</text>
  <text x="96" y="724" class="anno">--text-body-lg · 20px · Onest 400 · color --color-text-on-dark · max 30 words EN / 36 ES</text>

  <!-- CTAs -->
  <g transform="translate(96,748)">
    <rect width="240" height="52" rx="8" fill="#4D8A3F"/>
    <text x="120" y="33" class="btn" text-anchor="middle" fill="#FFFFFF">Get a Free Estimate</text>
  </g>
  <text x="220" y="824" class="anno">Primary × lg · 52h · NOT amber (chrome amber covers the hero)</text>

  <g transform="translate(360,748)">
    <rect width="200" height="52" rx="8" fill="none" stroke="#FAF7F1" stroke-width="1.5"/>
    <text x="100" y="33" class="btn" text-anchor="middle" fill="#FAF7F1">View Our Work →</text>
  </g>
  <text x="460" y="824" class="anno">Ghost × lg · on-dark variant: white border + on-dark label</text>

  <!-- Trust microbar -->
  <line x1="96" y1="844" x2="744" y2="844" stroke="rgba(250,247,241,0.32)"/>
  <g transform="translate(96,860)">
    <text x="0" y="14" class="trust">★ 4.8 on Google · 200+ reviews</text>
    <text x="232" y="14" class="trust">25+ years</text>
    <text x="320" y="14" class="trust">Unilock Authorized</text>
    <text x="468" y="14" class="trust">Aurora · Naperville · DuPage</text>
  </g>
  <text x="96" y="900" class="anno">Trust microbar · --text-body-sm · 14px · weight 500 · 1px hairline above at 32% opacity</text>

  <!-- Spacing rulers (right edge) -->
  <g transform="translate(1340,72)">
    <line class="ruler" x1="0" y1="0" x2="0" y2="778"/>
    <line x1="-6" y1="0" x2="6" y2="0" stroke="#E8A33D"/>
    <line x1="-6" y1="778" x2="6" y2="778" stroke="#E8A33D"/>
    <text x="14" y="394" class="rulerlabel">85vh ≈ 778px</text>
    <text x="14" y="410" class="rulerlabel">desktop</text>
  </g>

  <defs>
    <linearGradient id="heroOverlay" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="rgba(0,0,0,0)"/>
      <stop offset="0.4" stop-color="rgba(0,0,0,0.10)"/>
      <stop offset="1" stop-color="rgba(0,0,0,0.65)"/>
    </linearGradient>
  </defs>
</svg>

### 3.3 Hero — mobile (≤480px) annotated mockup

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 720" width="100%" role="img" aria-label="Hero — mobile annotated mockup">
  <style>
    .h1m  { font-family: 'Manrope', system-ui, sans-serif; font-weight: 800; font-size: 44px; fill: #FAF7F1; letter-spacing: -0.9px; }
    .subm { font-family: 'Onest', system-ui, sans-serif; font-size: 18px; fill: #FAF7F1; }
    .kickm{ font-family: 'Manrope', system-ui, sans-serif; font-size: 12px; font-weight: 600; fill: #FAF7F1; letter-spacing: 1.2px; }
    .btnm { font-family: 'Manrope', system-ui, sans-serif; font-size: 17px; font-weight: 600; }
    .trustm{ font-family: 'Onest', system-ui, sans-serif; font-size: 13px; fill: #FAF7F1; }
    .annom{ font-family: 'Onest', system-ui, sans-serif; font-size: 9px; fill: #B47821; font-style: italic; }
    .wmm  { font-family: 'Manrope', system-ui, sans-serif; font-size: 17px; font-weight: 700; fill: #1A3617; }
  </style>
  <rect width="480" height="720" fill="#3A4A2C"/>
  <pattern id="heroPatternM" width="40" height="40" patternUnits="userSpaceOnUse">
    <rect width="40" height="40" fill="#3A4A2C"/>
    <line x1="0" y1="0" x2="40" y2="40" stroke="#4A5A3C" stroke-width="0.5"/>
  </pattern>
  <rect width="480" height="720" fill="url(#heroPatternM)"/>
  <text x="240" y="220" font-family="ui-monospace, Menlo, monospace" font-size="11" fill="#6A7A5C" text-anchor="middle">[ HERO · 4:5 mobile crop · ≤350KB AVIF ]</text>
  <rect width="480" height="720" fill="url(#heroOverlayM)"/>

  <!-- Mobile navbar State B -->
  <rect width="480" height="64" fill="rgba(255,255,255,0.78)"/>
  <rect x="8" y="10" width="44" height="44" rx="8" fill="none" stroke="#E5E0D5"/>
  <text x="30" y="38" font-family="Manrope" font-size="16" fill="#2F5D27" text-anchor="middle">☎</text>
  <circle cx="220" cy="32" r="13" fill="#4D8A3F"/>
  <text x="240" y="38" class="wmm">Sunset Services</text>
  <rect x="428" y="10" width="44" height="44" rx="8" fill="none" stroke="#E5E0D5"/>
  <line x1="440" y1="24" x2="460" y2="24" stroke="#1A1A1A" stroke-width="2"/>
  <line x1="440" y1="32" x2="460" y2="32" stroke="#1A1A1A" stroke-width="2"/>
  <line x1="440" y1="40" x2="460" y2="40" stroke="#1A1A1A" stroke-width="2"/>

  <!-- Content -->
  <text x="24" y="320" class="kickm">AURORA · NAPERVILLE · DUPAGE</text>
  <text x="24" y="376" class="h1m">Outdoor spaces,</text>
  <text x="24" y="424" class="h1m">built to last</text>
  <text x="24" y="472" class="h1m">25+ years.</text>
  <text x="24" y="498" class="annom">--text-display drops to 44px on mobile · --text-h1 fallback if 3 lines</text>

  <text x="24" y="528" class="subm">Premium hardscape and full-service</text>
  <text x="24" y="552" class="subm">landscaping in DuPage County.</text>

  <!-- Stacked CTAs full-width -->
  <g transform="translate(24,576)">
    <rect width="432" height="52" rx="8" fill="#4D8A3F"/>
    <text x="216" y="33" class="btnm" text-anchor="middle" fill="#FFFFFF">Get a Free Estimate</text>
  </g>
  <g transform="translate(24,640)">
    <rect width="432" height="52" rx="8" fill="none" stroke="#FAF7F1" stroke-width="1.5"/>
    <text x="216" y="33" class="btnm" text-anchor="middle" fill="#FAF7F1">View Our Work →</text>
  </g>

  <!-- Trust microbar wraps to 2 rows -->
  <text x="24" y="704" class="trustm">★ 4.8 · 200+ reviews · 25+ years</text>
  <text x="24" y="704" class="annom" transform="translate(0,12)">Unilock Authorized · DuPage County (row 2)</text>

  <defs>
    <linearGradient id="heroOverlayM" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="rgba(0,0,0,0.10)"/>
      <stop offset="0.3" stop-color="rgba(0,0,0,0.20)"/>
      <stop offset="1" stop-color="rgba(0,0,0,0.70)"/>
    </linearGradient>
  </defs>
</svg>

### 3.4 Hero — gradient overlay spec (locked)

The hero photo carries a CSS gradient overlay so the H1 and CTAs clear AA against any photo. The gradient is applied as an absolutely-positioned `::after` over the `<picture>` element so it composites at paint time without re-encoding the image.

```css
.home-hero__photo-wrap { position: relative; isolation: isolate; }
.home-hero__photo-wrap::after {
  content: "";
  position: absolute; inset: 0;
  background:
    linear-gradient(180deg,
      rgba(0,0,0,0.00)  0%,
      rgba(0,0,0,0.10) 40%,
      rgba(0,0,0,0.65) 100%
    );
  pointer-events: none;
}
@media (max-width: 640px) {
  .home-hero__photo-wrap::after {
    background:
      linear-gradient(180deg,
        rgba(0,0,0,0.10)  0%,
        rgba(0,0,0,0.20) 30%,
        rgba(0,0,0,0.70) 100%
      );
  }
}
```

Measured against a representative golden-hour patio photograph (mid-tone L\* ≈ 55), the bottom 40% of the composite reads at L\* ≤ 22, giving `--color-text-on-dark` (`#FAF7F1`) ≥ 9:1 contrast — well clear of AA body. The H1 sits in the lower 50% of the hero specifically because that's where the gradient is strongest.

### 3.5 Hero — copy budgets and placeholder content

| Slot | EN budget | ES budget | EN placeholder | ES placeholder |
|---|---|---|---|---|
| Kicker | 4 words / 32 chars uppercase | 4 words / 38 chars | `Aurora · Naperville · DuPage County` | `Aurora · Naperville · Condado de DuPage` |
| H1 | ≤ 7 words | ≤ 9 words | `Outdoor spaces, built to last 25+ years.` | `Espacios exteriores, construidos para durar 25+ años.` |
| Subhead | ≤ 30 words | ≤ 36 words | `Premium hardscape, full-service landscaping, and snow management across DuPage County. Family-run, Unilock-authorized, since 2000.` | `Hardscape premium, paisajismo integral y manejo de nieve en el Condado de DuPage. Empresa familiar, autorizada Unilock, desde 2000.` |
| Primary CTA | — | — | `Get a Free Estimate` | `Solicita un Presupuesto Gratis` |
| Secondary CTA | — | — | `View Our Work` | `Ver Nuestro Trabajo` |
| Trust 1 | — | — | `★ 4.8 on Google · 200+ reviews` | `★ 4.8 en Google · 200+ reseñas` |
| Trust 2 | — | — | `25+ years` | `25+ años` |
| Trust 3 | — | — | `Unilock Authorized` | `Autorizado Unilock` |
| Trust 4 | — | — | `Aurora · Naperville · DuPage` | `Aurora · Naperville · DuPage` |

All placeholders are spec-only; Erick polishes copy in Part 2. The 4.8 / 200+ figures are placeholders — Cowork pulls real numbers from Google Business Profile in Phase 2.

### 3.6 Hero — buttons

- **Primary CTA:** `<Button variant="primary" size="lg" asChild>` → `<a href="/{locale}/request-quote/" data-cr-tracking="home-hero-primary">`. Locked Primary green from Phase 1.03 §6.1.
- **Secondary CTA:** **Ghost × lg, on-dark variant** — transparent fill, 1.5px `--color-text-on-dark` border, label `--color-text-on-dark`. Hover: 8% white tint background. This is the on-dark adaptation of `.btn--ghost` (Phase 1.03 §6.1) and needs an explicit code addition; see §16.
- Buttons are `<a>` styled as buttons (per Phase 1.03 §6 and §14 below), not `<button onClick>`.

### 3.7 Hero — LCP optimization spec (non-negotiable)

The hero photo is the homepage's LCP element. Phase 1.07 must implement, exactly:

```tsx
import Image from 'next/image';
import heroSrc from '@/assets/home/hero.avif';   // or webp fallback

<div className="home-hero__photo-wrap">
  <Image
    src={heroSrc}
    alt={t('home.hero.alt')}
    fill
    priority
    fetchPriority="high"
    placeholder="blur"
    sizes="100vw"
    style={{ objectFit: 'cover', objectPosition: 'center 65%' }}
  />
</div>
```

- **Format:** AVIF primary, WebP fallback (Next.js handles via `next/image` automatic format negotiation). Original source kept as JPEG in `assets/home/hero.source.jpg` for re-encoding.
- **Size budget:** ≤ **350KB** at 1920w AVIF, ≤ 500KB at 1920w WebP. If the source can't compress that low without artifacting, narrow the crop (e.g., 16:9 instead of 16:10) before lowering quality.
- **Dimensions:** explicit width/height (or `fill` with a sized parent — preferred here because the parent owns the 85vh / 75vh height). No layout shift.
- **Blur placeholder:** generated at build time by `next/image` from the source.
- **Preload:** `next/image` with `priority` injects the `<link rel="preload">` automatically.

### 3.8 Hero — entrance animation (locked: none)

The hero renders on first paint with **no fade, no slide, no stagger**. Reasons:

1. Animating the LCP element delays LCP and hurts the Lighthouse 95+ target (Plan §1).
2. "Instant arrival" reads more confident than "watch the page assemble," consistent with the premium positioning.

The CTAs may use the locked button hover micro-interaction (`translateY(-1px)` + shadow) — that's not entrance motion. Reduced-motion is a no-op here.

### 3.9 Hero — mobile behavior

| Breakpoint | Behavior |
|---|---|
| ≥ 1024px (lg) | H1 at `--text-display` (72px ceiling); CTAs side-by-side; trust microbar single row. |
| 640–1023px (sm/md) | H1 at `--text-display` (clamps down to ~56px); CTAs side-by-side; trust microbar single row, may wrap. |
| < 640px (mobile) | H1 at `--text-display` (44px floor); CTAs stack to full-width with `--spacing-3` gap; trust microbar wraps to two rows separated by `·`. |

Hero height: `85vh` desktop, `min-height: 600px` to protect against tall ultrawide viewports clipping the trust bar; `75vh` mobile, `min-height: 560px`.

### 3.10 Hero — navbar interaction (recap)

This is the **only** page on the site that exercises Phase 1.05's navbar State B (translucent `rgba(255,255,255,0.78)` + `backdrop-filter: blur(--backdrop-blur-md)`). At top of `/`, navbar is State B over the hero photo. On scroll past 24px, navbar transitions to State C (solid white + `--shadow-soft`) per Phase 1.05 §3.3.

---

## 4. Three audience entry points

The most-used module after the hero. Three equal tiles in a row (desktop) / stacked (mobile). Each tile is `card--photo` composition: a 4:3 photo, then a content block with eyebrow tag, H3 title, one-sentence descriptor, and an inline-link with `ArrowRight` chevron.

### 4.1 Desktop (≥1024px) annotated mockup

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 800" width="100%" role="img" aria-label="Three audience entry points — desktop">
  <style>
    .eb { font-family: 'Manrope', system-ui, sans-serif; font-size: 13px; font-weight: 600; fill: #2F5D27; letter-spacing: 1.5px; }
    .h2 { font-family: 'Manrope', system-ui, sans-serif; font-size: 40px; font-weight: 700; fill: #1A1A1A; letter-spacing: -0.6px; }
    .sub { font-family: 'Onest', system-ui, sans-serif; font-size: 17px; fill: #4A4A4A; }
    .h3 { font-family: 'Manrope', system-ui, sans-serif; font-size: 30px; font-weight: 700; fill: #1A1A1A; letter-spacing: -0.3px; }
    .desc { font-family: 'Onest', system-ui, sans-serif; font-size: 16px; fill: #4A4A4A; }
    .lnk { font-family: 'Manrope', system-ui, sans-serif; font-size: 15px; font-weight: 600; fill: #2F5D27; }
    .anno { font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #B47821; font-style: italic; }
    .ph { font-family: 'ui-monospace', Menlo, monospace; font-size: 13px; fill: #6A7A5C; }
  </style>
  <rect width="1440" height="800" fill="#FFFFFF"/>

  <!-- Section header -->
  <text x="120" y="120" class="eb">FIND YOUR FIT</text>
  <text x="120" y="170" class="h2">Three ways we work.</text>
  <text x="120" y="206" class="sub">Self-segment by property type — every audience gets the team and the playbook</text>
  <text x="120" y="230" class="sub">that fits.</text>
  <text x="970" y="120" class="anno">--color-bg surface · py-20 desktop · container --container-default 1200px</text>

  <!-- Three tiles -->
  <!-- Residential -->
  <g transform="translate(120,290)">
    <rect width="384" height="440" rx="16" fill="#FFFFFF" stroke="#E5E0D5" stroke-width="0"/>
    <rect width="384" height="288" rx="16" fill="#5A6F4A"/>
    <text x="192" y="150" class="ph" text-anchor="middle">[ Residential · 4:3 ]</text>
    <text x="32" y="340" class="eb">RESIDENTIAL</text>
    <text x="32" y="378" class="h3">For your home.</text>
    <text x="32" y="408" class="desc">Lawn care, design, and seasonal</text>
    <text x="32" y="428" class="desc">services for the home you're proud of.</text>
    <text x="32" y="476" class="lnk">Explore Residential  →</text>
  </g>

  <!-- Commercial -->
  <g transform="translate(528,290)">
    <rect width="384" height="288" rx="16" fill="#7A6E58"/>
    <text x="192" y="150" class="ph" text-anchor="middle" fill="#FAF7F1">[ Commercial · 4:3 ]</text>
    <text x="32" y="340" class="eb">COMMERCIAL</text>
    <text x="32" y="378" class="h3">For your property.</text>
    <text x="32" y="408" class="desc">Year-round maintenance and snow</text>
    <text x="32" y="428" class="desc">management for properties that</text>
    <text x="32" y="448" class="desc">can't afford to look untended.</text>
    <text x="32" y="496" class="lnk">Explore Commercial  →</text>
  </g>

  <!-- Hardscape -->
  <g transform="translate(936,290)">
    <rect width="384" height="288" rx="16" fill="#8A6A4A"/>
    <text x="192" y="150" class="ph" text-anchor="middle" fill="#FAF7F1">[ Hardscape · 4:3 ]</text>
    <text x="32" y="340" class="eb">HARDSCAPE</text>
    <text x="32" y="378" class="h3">For your patio.</text>
    <text x="32" y="408" class="desc">Paver patios, retaining walls,</text>
    <text x="32" y="428" class="desc">and outdoor kitchens. Unilock-</text>
    <text x="32" y="448" class="desc">authorized, 25 years building.</text>
    <text x="32" y="496" class="lnk">Explore Hardscape  →</text>
  </g>

  <!-- Annotations -->
  <text x="120" y="770" class="anno">card--photo · radius lg (16) · gap --spacing-6 (24) between tiles · stagger 80ms via &lt;StaggerContainer&gt; / &lt;StaggerItem&gt;</text>
</svg>

### 4.2 Mobile (≤480px) annotated mockup

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 1280" width="100%" role="img" aria-label="Three audience entry points — mobile">
  <style>
    .ebm { font-family: 'Manrope', system-ui, sans-serif; font-size: 12px; font-weight: 600; fill: #2F5D27; letter-spacing: 1.4px; }
    .h2m { font-family: 'Manrope', system-ui, sans-serif; font-size: 28px; font-weight: 700; fill: #1A1A1A; letter-spacing: -0.4px; }
    .h3m { font-family: 'Manrope', system-ui, sans-serif; font-size: 22px; font-weight: 700; fill: #1A1A1A; }
    .descm { font-family: 'Onest', system-ui, sans-serif; font-size: 15px; fill: #4A4A4A; }
    .lnkm { font-family: 'Manrope', system-ui, sans-serif; font-size: 15px; font-weight: 600; fill: #2F5D27; }
    .phm { font-family: 'ui-monospace', Menlo, monospace; font-size: 11px; fill: #6A7A5C; }
    .annom { font-family: 'Onest', system-ui, sans-serif; font-size: 9px; fill: #B47821; font-style: italic; }
  </style>
  <rect width="480" height="1280" fill="#FFFFFF"/>
  <text x="24" y="60" class="ebm">FIND YOUR FIT</text>
  <text x="24" y="100" class="h2m">Three ways we work.</text>

  <g transform="translate(24,140)">
    <rect width="432" height="336" rx="16" fill="#5A6F4A"/>
    <text x="216" y="160" class="phm" text-anchor="middle" fill="#FAF7F1">[ Residential · 4:3 ]</text>
  </g>
  <text x="24" y="510" class="ebm">RESIDENTIAL</text>
  <text x="24" y="544" class="h3m">For your home.</text>
  <text x="24" y="574" class="descm">Lawn care, design, and seasonal</text>
  <text x="24" y="594" class="descm">services for the home you're proud of.</text>
  <text x="24" y="630" class="lnkm">Explore Residential  →</text>

  <g transform="translate(24,670)">
    <rect width="432" height="336" rx="16" fill="#7A6E58"/>
    <text x="216" y="160" class="phm" text-anchor="middle" fill="#FAF7F1">[ Commercial · 4:3 ]</text>
  </g>
  <text x="24" y="1042" class="ebm">COMMERCIAL</text>
  <text x="24" y="1076" class="h3m">For your property.</text>
  <text x="24" y="1106" class="descm">Year-round maintenance and snow</text>
  <text x="24" y="1126" class="descm">management for properties that can't</text>
  <text x="24" y="1146" class="descm">afford to look untended.</text>
  <text x="24" y="1182" class="lnkm">Explore Commercial  →</text>

  <text x="24" y="1240" class="annom">[ Hardscape tile follows below — same pattern · gap 24px · py-14 mobile ]</text>
</svg>

### 4.3 Audience entry points — spec

| Element | Spec |
|---|---|
| Section eyebrow | "FIND YOUR FIT" / "ENCUENTRA TU ENCAJE" — `--text-micro` (12px), Manrope 600, tracking `--tracking-eyebrow`, color `--color-sunset-green-700`. 8px above the H2. |
| Section H2 | "Three ways we work." / "Tres formas de trabajar." `--text-h2`. Optional sub-line in `--text-body-lg` color `--color-text-secondary`. |
| Section → tiles gap | `--spacing-12` mobile (48), `--spacing-16` desktop (64). |
| Tile composition | `card--photo` per Phase 1.03 §6.2. 4:3 photo, then 24px / 32px content padding (`--spacing-6` / `--spacing-8`). |
| Tile content order | Eyebrow tag (residential/commercial/hardscape) → H3 → 1-sentence descriptor → inline-link with `ArrowRight` (lucide, 20px, `currentColor`). |
| H3 token | `--text-h3` (30px desktop / 22px mobile), Manrope 700. |
| Inline link | "Explore Residential →" etc. Color `--color-sunset-green-700`, weight 600. Underline-on-hover per Phase 1.03 §3.2. Clicks the **whole card** (per `card--photo` locked spec — the link is a visible affordance, the card surface is the click target). |
| Tile gap | `--spacing-6` (24px) desktop; `--spacing-5` (20px) mobile. |
| Hover behavior | Card lifts `translateY(-2px)` + shadow `card → hover`; image scales `1.03` over `--motion-slow`. Locked from Phase 1.03 §6.2. |
| Featured-card | **NOT used.** Default `card--photo` only. |
| Mobile stacking | Single column, full-width tiles, 20px gap between tiles. |

### 4.4 Audience entry points — links and tracking

| Tile | Link | Locale | Tracking |
|---|---|---|---|
| Residential | `/{locale}/residential/` | EN / ES | `data-cr-tracking="home-audience-residential"` |
| Commercial | `/{locale}/commercial/` | EN / ES | `data-cr-tracking="home-audience-commercial"` |
| Hardscape | `/{locale}/hardscape/` | EN / ES | `data-cr-tracking="home-audience-hardscape"` |

---

## 5. Services overview

### 5.1 Layout decision — recommend A (curated grid)

Locking **Layout A — curated 3×3 grid of service tiles** (9 services on the homepage). B (tabbed mosaic) duplicates the audience-segmentation work that §4 already performs and adds JS overhead — incompatible with the Lighthouse 95+ posture (Plan §1, §15 below). Surfacing B as D2 for Chat ratification.

**Title placement:** title **below** the photo, not overlaid. Reasons: (1) AA contrast simplicity — overlay needs a per-photo gradient and contrast verification per tile; (2) cleaner scanning when 9 tiles are stacked; (3) the photo gets to be the photo.

### 5.2 Services overview — desktop annotated mockup

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 1100" width="100%" role="img" aria-label="Services overview — desktop">
  <style>
    .eb { font-family: 'Manrope', system-ui, sans-serif; font-size: 13px; font-weight: 600; fill: #2F5D27; letter-spacing: 1.5px; }
    .h2 { font-family: 'Manrope', system-ui, sans-serif; font-size: 40px; font-weight: 700; fill: #1A1A1A; letter-spacing: -0.6px; }
    .sub { font-family: 'Onest', system-ui, sans-serif; font-size: 17px; fill: #4A4A4A; }
    .ttl { font-family: 'Manrope', system-ui, sans-serif; font-size: 17px; font-weight: 600; fill: #1A1A1A; }
    .meta { font-family: 'Onest', system-ui, sans-serif; font-size: 13px; fill: #6B6B6B; }
    .anno { font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #B47821; font-style: italic; }
    .ph { font-family: 'ui-monospace', Menlo, monospace; font-size: 11px; fill: #6A7A5C; }
    .btn { font-family: 'Manrope', system-ui, sans-serif; font-size: 15px; font-weight: 600; fill: #2F5D27; }
  </style>
  <rect width="1440" height="1100" fill="#FAF7F1"/>

  <text x="120" y="120" class="eb">WHAT WE DO</text>
  <text x="120" y="170" class="h2">Built for the property, not the brochure.</text>
  <text x="120" y="206" class="sub">Nine of our most-asked services. Sixteen total — the audience landings cover the rest.</text>
  <text x="970" y="120" class="anno">--color-bg-cream surface · 3×3 grid · gap --spacing-6 (24)</text>

  <!-- 3x3 grid: tile = 384x352, 320 photo + content -->
  <g font-family="ui-monospace" font-size="11" fill="#6A7A5C">
    <!-- Row 1 -->
    <g transform="translate(120,290)">
      <rect width="384" height="288" rx="16" fill="#5A6F4A"/>
      <text x="192" y="150" class="ph" text-anchor="middle" fill="#FAF7F1">[ Lawn Care · 1:1 ]</text>
    </g>
    <text x="120" y="610" class="ttl">Lawn Care</text>
    <text x="120" y="632" class="meta">Residential · weekly &amp; seasonal</text>

    <g transform="translate(528,290)">
      <rect width="384" height="288" rx="16" fill="#8A6A4A"/>
      <text x="192" y="150" class="ph" text-anchor="middle" fill="#FAF7F1">[ Patios &amp; Walkways · 1:1 ]</text>
    </g>
    <text x="528" y="610" class="ttl">Patios &amp; Walkways</text>
    <text x="528" y="632" class="meta">Hardscape · Unilock</text>

    <g transform="translate(936,290)">
      <rect width="384" height="288" rx="16" fill="#5C6660"/>
      <text x="192" y="150" class="ph" text-anchor="middle" fill="#FAF7F1">[ Retaining Walls · 1:1 ]</text>
    </g>
    <text x="936" y="610" class="ttl">Retaining Walls</text>
    <text x="936" y="632" class="meta">Hardscape · structural</text>
  </g>

  <!-- Row 2 truncated visualization -->
  <g transform="translate(120,672)">
    <rect width="1200" height="288" rx="16" fill="#E5E0D5" stroke="#C9C0AE" stroke-dasharray="6 4"/>
    <text x="600" y="148" font-family="ui-monospace" font-size="14" fill="#6B6B6B" text-anchor="middle">Row 2 — Landscape Design · Tree Services · Sprinkler Systems</text>
    <text x="600" y="172" font-family="ui-monospace" font-size="14" fill="#6B6B6B" text-anchor="middle">Row 3 — Snow Removal · Outdoor Kitchens · Fire Pits &amp; Features</text>
    <text x="600" y="200" font-family="Onest" font-size="11" fill="#B47821" font-style="italic" text-anchor="middle">[ same tile spec · 1:1 photo + title below + meta line · staggered reveal ]</text>
  </g>

  <!-- Below grid: three audience CTA buttons (recommendation b) -->
  <g transform="translate(120,1000)">
    <rect width="320" height="48" rx="8" fill="none" stroke="#4D8A3F" stroke-width="1.5"/>
    <text x="160" y="30" class="btn" text-anchor="middle">All Residential Services →</text>
  </g>
  <g transform="translate(560,1000)">
    <rect width="320" height="48" rx="8" fill="none" stroke="#4D8A3F" stroke-width="1.5"/>
    <text x="160" y="30" class="btn" text-anchor="middle">All Commercial Services →</text>
  </g>
  <g transform="translate(1000,1000)">
    <rect width="320" height="48" rx="8" fill="none" stroke="#4D8A3F" stroke-width="1.5"/>
    <text x="160" y="30" class="btn" text-anchor="middle">All Hardscape Services →</text>
  </g>
  <text x="120" y="1080" class="anno">D3 recommendation: three Secondary × md buttons → audience landings · §17</text>
</svg>

### 5.3 Services overview — mobile annotated mockup

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 1640" width="100%" role="img" aria-label="Services overview — mobile">
  <style>
    .ebm { font-family: 'Manrope', system-ui, sans-serif; font-size: 12px; font-weight: 600; fill: #2F5D27; letter-spacing: 1.4px; }
    .h2m { font-family: 'Manrope', system-ui, sans-serif; font-size: 28px; font-weight: 700; fill: #1A1A1A; }
    .ttlm { font-family: 'Manrope', system-ui, sans-serif; font-size: 15px; font-weight: 600; fill: #1A1A1A; }
    .metam { font-family: 'Onest', system-ui, sans-serif; font-size: 12px; fill: #6B6B6B; }
    .phm { font-family: 'ui-monospace', Menlo, monospace; font-size: 10px; fill: #FAF7F1; }
    .annom { font-family: 'Onest', system-ui, sans-serif; font-size: 9px; fill: #B47821; font-style: italic; }
    .btnm { font-family: 'Manrope', system-ui, sans-serif; font-size: 15px; font-weight: 600; fill: #2F5D27; }
  </style>
  <rect width="480" height="1640" fill="#FAF7F1"/>
  <text x="24" y="60" class="ebm">WHAT WE DO</text>
  <text x="24" y="100" class="h2m">Built for the property,</text>
  <text x="24" y="132" class="h2m">not the brochure.</text>
  <text x="24" y="160" class="annom">2-column grid on mobile · gap --spacing-3 (12px)</text>

  <!-- 2-col grid, 5 rows visible -->
  <g>
    <g transform="translate(24,200)"><rect width="210" height="210" rx="16" fill="#5A6F4A"/><text x="105" y="110" class="phm" text-anchor="middle">[ Lawn Care 1:1 ]</text></g>
    <text x="24" y="436" class="ttlm">Lawn Care</text>
    <text x="24" y="454" class="metam">Residential</text>

    <g transform="translate(246,200)"><rect width="210" height="210" rx="16" fill="#8A6A4A"/><text x="105" y="110" class="phm" text-anchor="middle">[ Patios 1:1 ]</text></g>
    <text x="246" y="436" class="ttlm">Patios &amp; Walkways</text>
    <text x="246" y="454" class="metam">Hardscape</text>

    <g transform="translate(24,490)"><rect width="210" height="210" rx="16" fill="#5C6660"/><text x="105" y="110" class="phm" text-anchor="middle">[ Walls 1:1 ]</text></g>
    <text x="24" y="726" class="ttlm">Retaining Walls</text>
    <text x="24" y="744" class="metam">Hardscape</text>

    <g transform="translate(246,490)"><rect width="210" height="210" rx="16" fill="#6A7A4C"/><text x="105" y="110" class="phm" text-anchor="middle">[ Design 1:1 ]</text></g>
    <text x="246" y="726" class="ttlm">Landscape Design</text>
    <text x="246" y="744" class="metam">Residential</text>

    <g transform="translate(24,780)"><rect width="210" height="210" rx="16" fill="#7A8A5C"/><text x="105" y="110" class="phm" text-anchor="middle">[ Trees 1:1 ]</text></g>
    <text x="24" y="1016" class="ttlm">Tree Services</text>
    <text x="24" y="1034" class="metam">Residential</text>

    <g transform="translate(246,780)"><rect width="210" height="210" rx="16" fill="#9AA89C"/><text x="105" y="110" class="phm" text-anchor="middle">[ Sprinklers 1:1 ]</text></g>
    <text x="246" y="1016" class="ttlm">Sprinkler Systems</text>
    <text x="246" y="1034" class="metam">Residential</text>
  </g>

  <text x="24" y="1090" class="annom">[ Rows 4 &amp; 5: Snow Removal · Outdoor Kitchens · Fire Pits ]</text>

  <!-- 3 stacked CTAs on mobile -->
  <g transform="translate(24,1380)"><rect width="432" height="48" rx="8" fill="none" stroke="#4D8A3F" stroke-width="1.5"/><text x="216" y="30" class="btnm" text-anchor="middle">All Residential Services →</text></g>
  <g transform="translate(24,1444)"><rect width="432" height="48" rx="8" fill="none" stroke="#4D8A3F" stroke-width="1.5"/><text x="216" y="30" class="btnm" text-anchor="middle">All Commercial Services →</text></g>
  <g transform="translate(24,1508)"><rect width="432" height="48" rx="8" fill="none" stroke="#4D8A3F" stroke-width="1.5"/><text x="216" y="30" class="btnm" text-anchor="middle">All Hardscape Services →</text></g>
</svg>

### 5.4 Services overview — curated 9-service list

| Position | Service | Audience tag | Page (Phase 2) |
|---|---|---|---|
| 1 | Lawn Care | Residential | `/residential/lawn-care/` |
| 2 | Patios & Walkways | Hardscape | `/hardscape/patios-walkways/` |
| 3 | Retaining Walls | Hardscape | `/hardscape/retaining-walls/` |
| 4 | Landscape Design | Residential | `/residential/landscape-design/` |
| 5 | Tree Services | Residential | `/residential/tree-services/` |
| 6 | Sprinkler Systems | Residential | `/residential/sprinkler-systems/` |
| 7 | Snow Removal | Commercial | `/commercial/snow-removal/` |
| 8 | Outdoor Kitchens | Hardscape | `/hardscape/outdoor-kitchens/` |
| 9 | Fire Pits & Features | Hardscape | `/hardscape/fire-pits/` |

Curation logic: 4 hardscape (the highest-margin / brand-defining service line) + 4 residential (the broadest audience) + 1 commercial (Snow Removal — the commercial signature). Audience-tag color dot in front of the meta line: green dot for Residential, charcoal dot for Commercial, amber-deep (`--color-sunset-amber-700`, NOT amber-500) dot for Hardscape. Dots are 8×8, `border-radius: 9999px`, sit 8px before the audience text.

### 5.5 Services overview — spec

| Element | Spec |
|---|---|
| Eyebrow | "WHAT WE DO" / "LO QUE HACEMOS" — same eyebrow treatment as §4. |
| H2 | "Built for the property, not the brochure." / "Construido para la propiedad, no para el folleto." |
| Sub-line | Optional `--text-body-lg`, `--color-text-secondary`. |
| Grid | 3×3 desktop (`grid-template-columns: repeat(3, 1fr)`), 2×5 mobile (last row has 1 tile or fills with snow). Gap `--spacing-6` desktop / `--spacing-3` mobile. |
| Tile | 1:1 photo (`card--photo` + locked spec) + below-photo content row: H6 title (`--text-h6`, 17px desktop / 15px mobile, weight 600), then meta line (audience-color dot + audience name) at `--text-body-sm` `--color-text-muted`. Tile padding inside content area: `--spacing-3` mobile / `--spacing-4` desktop. |
| Hover | Photo `scale(1.03)` over `--motion-slow`. Title underline reveals 0→1px in `--color-sunset-green-500`. |
| Below grid | **Three Secondary × md buttons** (per D3 recommendation, §17): "All Residential Services →" / "All Commercial Services →" / "All Hardscape Services →". Side-by-side desktop, full-width stacked mobile. Each button links to its audience landing. |
| Surface | `--color-bg-cream`. |
| Stagger | `<StaggerContainer>` with 9 `<StaggerItem>` children, 80ms stagger. |

---

## 6. Social proof band

The credibility section. White surface so cream review cards lift via `--shadow-on-cream`.

### 6.1 Desktop annotated mockup

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 980" width="100%" role="img" aria-label="Social proof — desktop">
  <style>
    .eb { font-family: 'Manrope', system-ui, sans-serif; font-size: 13px; font-weight: 600; fill: #2F5D27; letter-spacing: 1.5px; }
    .h2 { font-family: 'Manrope', system-ui, sans-serif; font-size: 40px; font-weight: 700; fill: #1A1A1A; letter-spacing: -0.6px; }
    .agg { font-family: 'Manrope', system-ui, sans-serif; font-size: 32px; font-weight: 700; fill: #1A1A1A; }
    .aggsub { font-family: 'Onest', system-ui, sans-serif; font-size: 15px; fill: #4A4A4A; }
    .quote { font-family: 'Manrope', system-ui, sans-serif; font-size: 22px; font-weight: 500; fill: #1A1A1A; font-style: italic; }
    .who { font-family: 'Onest', system-ui, sans-serif; font-size: 14px; font-weight: 500; fill: #4A4A4A; }
    .src { font-family: 'Onest', system-ui, sans-serif; font-size: 13px; fill: #6B6B6B; }
    .cred { font-family: 'Manrope', system-ui, sans-serif; font-size: 14px; font-weight: 600; fill: #4A4A4A; letter-spacing: 0.5px; }
    .anno { font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #B47821; font-style: italic; }
  </style>
  <rect width="1440" height="980" fill="#FFFFFF"/>

  <text x="120" y="120" class="eb">FROM THE PEOPLE WHO HIRE US</text>
  <text x="120" y="170" class="h2">Reviewed by neighbors.</text>

  <!-- Aggregate row -->
  <g transform="translate(120,250)">
    <!-- 5 stars -->
    <g fill="#E8A33D">
      <polygon points="0,12 4,4 13,3 6,9 8,18 0,14 -8,18 -6,9 -13,3 -4,4" transform="translate(15,15)"/>
      <polygon points="0,12 4,4 13,3 6,9 8,18 0,14 -8,18 -6,9 -13,3 -4,4" transform="translate(45,15)"/>
      <polygon points="0,12 4,4 13,3 6,9 8,18 0,14 -8,18 -6,9 -13,3 -4,4" transform="translate(75,15)"/>
      <polygon points="0,12 4,4 13,3 6,9 8,18 0,14 -8,18 -6,9 -13,3 -4,4" transform="translate(105,15)"/>
      <polygon points="0,12 4,4 13,3 6,9 8,18 0,14 -8,18 -6,9 -13,3 -4,4" transform="translate(135,15)"/>
    </g>
    <text x="170" y="30" class="agg">4.8</text>
    <text x="240" y="30" class="aggsub">on Google · 200+ reviews</text>
    <text x="0" y="62" class="anno">Stars: lucide Star, filled --color-sunset-amber-500 · documented amber exception (rating UI, not CTA)</text>
  </g>

  <!-- Three review cards -->
  <g transform="translate(120,360)">
    <!-- Card 1 -->
    <rect width="384" height="280" rx="24" fill="#FAF7F1"/>
    <rect width="4" height="280" fill="#4D8A3F"/>
    <g fill="#E8A33D" transform="translate(36,40)">
      <polygon points="0,8 3,3 9,2 4,6 6,12 0,9 -6,12 -4,6 -9,2 -3,3"/>
      <polygon points="0,8 3,3 9,2 4,6 6,12 0,9 -6,12 -4,6 -9,2 -3,3" transform="translate(20,0)"/>
      <polygon points="0,8 3,3 9,2 4,6 6,12 0,9 -6,12 -4,6 -9,2 -3,3" transform="translate(40,0)"/>
      <polygon points="0,8 3,3 9,2 4,6 6,12 0,9 -6,12 -4,6 -9,2 -3,3" transform="translate(60,0)"/>
      <polygon points="0,8 3,3 9,2 4,6 6,12 0,9 -6,12 -4,6 -9,2 -3,3" transform="translate(80,0)"/>
    </g>
    <text x="36" y="100" class="quote">"They took a backyard</text>
    <text x="36" y="128" class="quote">slope no one would touch</text>
    <text x="36" y="156" class="quote">and turned it into our</text>
    <text x="36" y="184" class="quote">favorite room of the house."</text>
    <text x="36" y="232" class="who">Sarah K. · Wheaton</text>
    <text x="36" y="252" class="src">via Google</text>
  </g>

  <g transform="translate(528,360)">
    <rect width="384" height="280" rx="24" fill="#FAF7F1"/>
    <rect width="4" height="280" fill="#4D8A3F"/>
    <g fill="#E8A33D" transform="translate(36,40)">
      <polygon points="0,8 3,3 9,2 4,6 6,12 0,9 -6,12 -4,6 -9,2 -3,3"/>
      <polygon points="0,8 3,3 9,2 4,6 6,12 0,9 -6,12 -4,6 -9,2 -3,3" transform="translate(20,0)"/>
      <polygon points="0,8 3,3 9,2 4,6 6,12 0,9 -6,12 -4,6 -9,2 -3,3" transform="translate(40,0)"/>
      <polygon points="0,8 3,3 9,2 4,6 6,12 0,9 -6,12 -4,6 -9,2 -3,3" transform="translate(60,0)"/>
      <polygon points="0,8 3,3 9,2 4,6 6,12 0,9 -6,12 -4,6 -9,2 -3,3" transform="translate(80,0)"/>
    </g>
    <text x="36" y="100" class="quote">"Snow at 5am, every</text>
    <text x="36" y="128" class="quote">storm. Drive was clear</text>
    <text x="36" y="156" class="quote">before I had coffee.</text>
    <text x="36" y="184" class="quote">Worth every dollar."</text>
    <text x="36" y="232" class="who">David R. · Naperville</text>
    <text x="36" y="252" class="src">via Google</text>
  </g>

  <g transform="translate(936,360)">
    <rect width="384" height="280" rx="24" fill="#FAF7F1"/>
    <rect width="4" height="280" fill="#4D8A3F"/>
    <g fill="#E8A33D" transform="translate(36,40)">
      <polygon points="0,8 3,3 9,2 4,6 6,12 0,9 -6,12 -4,6 -9,2 -3,3"/>
      <polygon points="0,8 3,3 9,2 4,6 6,12 0,9 -6,12 -4,6 -9,2 -3,3" transform="translate(20,0)"/>
      <polygon points="0,8 3,3 9,2 4,6 6,12 0,9 -6,12 -4,6 -9,2 -3,3" transform="translate(40,0)"/>
      <polygon points="0,8 3,3 9,2 4,6 6,12 0,9 -6,12 -4,6 -9,2 -3,3" transform="translate(60,0)"/>
      <polygon points="0,8 3,3 9,2 4,6 6,12 0,9 -6,12 -4,6 -9,2 -3,3" transform="translate(80,0)"/>
    </g>
    <text x="36" y="100" class="quote">"Erick's crew rebuilt</text>
    <text x="36" y="128" class="quote">our front walk in two</text>
    <text x="36" y="156" class="quote">days. Cleaner than the</text>
    <text x="36" y="184" class="quote">day we moved in."</text>
    <text x="36" y="232" class="who">Patricia M. · Aurora</text>
    <text x="36" y="252" class="src">via Google</text>
  </g>

  <!-- Credentials row -->
  <line x1="120" y1="720" x2="1320" y2="720" stroke="#E5E0D5"/>
  <g transform="translate(120,760)">
    <rect width="240" height="64" rx="8" fill="#F2EDE3" stroke="#C9C0AE" stroke-dasharray="4 3"/>
    <text x="120" y="40" class="cred" text-anchor="middle">[ UNILOCK MARK ]</text>
  </g>
  <g transform="translate(400,760)">
    <text x="0" y="30" font-family="Manrope" font-size="40" font-weight="800" fill="#2F5D27">25+</text>
    <text x="84" y="30" class="cred">years building</text>
    <text x="84" y="50" class="cred">in DuPage County</text>
  </g>
  <g transform="translate(720,760)">
    <text x="0" y="30" font-family="Manrope" font-size="22" font-weight="700" fill="#1A1A1A">Top 5 Landscaping</text>
    <text x="0" y="56" font-family="Onest" font-size="13" fill="#6B6B6B">DuPage Tribune · 2024 [verify current]</text>
  </g>
  <g transform="translate(1080,760)">
    <rect width="240" height="64" rx="8" fill="#F2EDE3" stroke="#C9C0AE" stroke-dasharray="4 3"/>
    <text x="120" y="40" class="cred" text-anchor="middle">[ BBB? · D5 decision ]</text>
  </g>

  <text x="120" y="900" class="anno">Card variant: --color-bg-cream + 4px green-500 left rule + radius xl + --shadow-on-cream</text>
</svg>

### 6.2 Mobile annotated mockup

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 1640" width="100%" role="img" aria-label="Social proof — mobile">
  <style>
    .ebm { font-family: 'Manrope', system-ui, sans-serif; font-size: 12px; font-weight: 600; fill: #2F5D27; letter-spacing: 1.4px; }
    .h2m { font-family: 'Manrope', system-ui, sans-serif; font-size: 28px; font-weight: 700; fill: #1A1A1A; }
    .aggm { font-family: 'Manrope', system-ui, sans-serif; font-size: 24px; font-weight: 700; fill: #1A1A1A; }
    .qm { font-family: 'Manrope', system-ui, sans-serif; font-size: 18px; font-weight: 500; fill: #1A1A1A; font-style: italic; }
    .whom { font-family: 'Onest', system-ui, sans-serif; font-size: 13px; font-weight: 500; fill: #4A4A4A; }
    .annom { font-family: 'Onest', system-ui, sans-serif; font-size: 9px; fill: #B47821; font-style: italic; }
  </style>
  <rect width="480" height="1640" fill="#FFFFFF"/>
  <text x="24" y="60" class="ebm">FROM THE PEOPLE WHO HIRE US</text>
  <text x="24" y="100" class="h2m">Reviewed by neighbors.</text>

  <g transform="translate(24,140)" fill="#E8A33D">
    <polygon points="0,12 4,4 13,3 6,9 8,18 0,14 -8,18 -6,9 -13,3 -4,4" transform="translate(15,15)"/>
    <polygon points="0,12 4,4 13,3 6,9 8,18 0,14 -8,18 -6,9 -13,3 -4,4" transform="translate(45,15)"/>
    <polygon points="0,12 4,4 13,3 6,9 8,18 0,14 -8,18 -6,9 -13,3 -4,4" transform="translate(75,15)"/>
    <polygon points="0,12 4,4 13,3 6,9 8,18 0,14 -8,18 -6,9 -13,3 -4,4" transform="translate(105,15)"/>
    <polygon points="0,12 4,4 13,3 6,9 8,18 0,14 -8,18 -6,9 -13,3 -4,4" transform="translate(135,15)"/>
  </g>
  <text x="180" y="170" class="aggm">4.8 · 200+ reviews</text>

  <!-- Stack of review cards -->
  <g transform="translate(24,220)">
    <rect width="432" height="240" rx="24" fill="#FAF7F1"/>
    <rect width="4" height="240" fill="#4D8A3F"/>
    <text x="36" y="60" class="qm">"They took a backyard slope</text>
    <text x="36" y="84" class="qm">no one would touch and turned</text>
    <text x="36" y="108" class="qm">it into our favorite room."</text>
    <text x="36" y="180" class="whom">Sarah K. · Wheaton · via Google</text>
  </g>
  <g transform="translate(24,490)">
    <rect width="432" height="240" rx="24" fill="#FAF7F1"/>
    <rect width="4" height="240" fill="#4D8A3F"/>
    <text x="36" y="60" class="qm">"Snow at 5am, every storm.</text>
    <text x="36" y="84" class="qm">Drive was clear before coffee."</text>
    <text x="36" y="180" class="whom">David R. · Naperville · via Google</text>
  </g>
  <g transform="translate(24,760)">
    <rect width="432" height="240" rx="24" fill="#FAF7F1"/>
    <rect width="4" height="240" fill="#4D8A3F"/>
    <text x="36" y="60" class="qm">"Rebuilt our front walk in</text>
    <text x="36" y="84" class="qm">two days. Cleaner than ever."</text>
    <text x="36" y="180" class="whom">Patricia M. · Aurora · via Google</text>
  </g>

  <!-- Credentials horizontal-scroll row with snap -->
  <line x1="24" y1="1080" x2="456" y2="1080" stroke="#E5E0D5"/>
  <g transform="translate(24,1120)">
    <rect width="200" height="64" rx="8" fill="#F2EDE3" stroke="#C9C0AE" stroke-dasharray="4 3"/>
    <text x="100" y="40" font-family="Manrope" font-size="13" font-weight="600" fill="#4A4A4A" text-anchor="middle">[ UNILOCK ]</text>
  </g>
  <g transform="translate(244,1120)">
    <rect width="200" height="64" rx="8" fill="#F2EDE3"/>
    <text x="20" y="30" font-family="Manrope" font-size="22" font-weight="800" fill="#2F5D27">25+</text>
    <text x="60" y="30" font-family="Manrope" font-size="13" font-weight="600" fill="#4A4A4A">years</text>
    <text x="20" y="50" font-family="Onest" font-size="11" fill="#6B6B6B">in DuPage County</text>
  </g>
  <text x="24" y="1216" class="annom">Credentials row: horizontal-scroll with scroll-snap-x (mandatory snap, snap-center)</text>
</svg>

### 6.3 Social proof — spec

| Element | Spec |
|---|---|
| Surface | `--color-bg` (white). Cards lift via `--shadow-on-cream`. |
| Eyebrow | "FROM THE PEOPLE WHO HIRE US" / "DE LA GENTE QUE NOS CONTRATA" |
| H2 | "Reviewed by neighbors." / "Reseñados por vecinos." |
| Aggregate row | 5 lucide `Star` (20px, filled `--color-sunset-amber-500`, `aria-hidden="true"`) + "4.8" in `--text-h3` Manrope 700 + " on Google · 200+ reviews" in `--text-body` `--color-text-secondary`. The whole rating must be announced as text via `aria-label="4.8 out of 5 stars on Google, 200+ reviews"` on the wrapper. |
| Review cards (3) | Default `card--testimonial` from Phase 1.03 §6.2: `--color-bg-cream`, 4px `--color-sunset-green-500` left rule, radius `xl`, `--shadow-on-cream`. Internal padding `--spacing-6` mobile / `--spacing-8` desktop. |
| Card structure | 5 small stars (16px, amber) → quote (≤ 30 words, `--text-h4` weight 500 italic) → blank line → "FirstName L. · City" in `--text-body-sm` weight 500 → "via Google" in `--text-body-sm` `--color-text-muted`. |
| Cards layout | 3-column grid desktop with `--spacing-6` gap; vertical stack mobile with `--spacing-4` gap. |
| Credentials row | Below cards, separated by 1px `--color-border` rule and `--spacing-12` top margin. Items: Unilock mark placeholder (Phase 2 swap to clean SVG), "25+ years" typographic credential, "Top 5 Landscaping" mention with "[verify current]" annotation, optional BBB (D5). All items height-aligned at 64px. |
| Credentials desktop | 4 items in a row, equal-spaced via `justify-content: space-between` inside the container. |
| Credentials mobile | Horizontal scroll with `scroll-snap-type: x mandatory` and `scroll-snap-align: center` per item; OR wrap to 2 rows — pick one. **Recommendation: horizontal scroll** because two rows on small screens reads cluttered and the credentials are a passive-skim section, not a comparison. |
| Stars amber exception | Documented and locked: stars are functional rating UI, not a CTA. Phase 1.03 §2.3 amber-discipline rule explicitly carves them out. |

### 6.4 Placeholder reviews (Part 2 swaps to real)

```json
[
  { "quote": "They took a backyard slope no one would touch and turned it into our favorite room of the house.", "name": "Sarah K.", "city": "Wheaton", "rating": 5 },
  { "quote": "Snow at 5am, every storm. Drive was clear before I had coffee. Worth every dollar.", "name": "David R.", "city": "Naperville", "rating": 5 },
  { "quote": "Erick's crew rebuilt our front walk in two days. Cleaner than the day we moved in.", "name": "Patricia M.", "city": "Aurora", "rating": 5 }
]
```

---

## 7. About teaser

A short, human moment. Family-run is a differentiator vs corporate competitors; this section admits it and points to `/about/`.

### 7.1 Desktop annotated mockup

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 800" width="100%" role="img" aria-label="About teaser — desktop">
  <style>
    .eb { font-family: 'Manrope', system-ui, sans-serif; font-size: 13px; font-weight: 600; fill: #2F5D27; letter-spacing: 1.5px; }
    .h2 { font-family: 'Manrope', system-ui, sans-serif; font-size: 40px; font-weight: 700; fill: #1A1A1A; letter-spacing: -0.6px; }
    .body { font-family: 'Onest', system-ui, sans-serif; font-size: 17px; fill: #4A4A4A; }
    .ph { font-family: 'ui-monospace', Menlo, monospace; font-size: 13px; fill: #FAF7F1; }
    .btn { font-family: 'Manrope', system-ui, sans-serif; font-size: 15px; font-weight: 600; fill: #2F5D27; }
    .anno { font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #B47821; font-style: italic; }
  </style>
  <rect width="1440" height="800" fill="#FAF7F1"/>

  <!-- Image left, 40% -->
  <g transform="translate(120,140)">
    <rect width="440" height="550" rx="16" fill="#5A4A38"/>
    <text x="220" y="280" class="ph" text-anchor="middle">[ Erick portrait · 4:5 · golden-hour outdoors ]</text>
  </g>

  <!-- Copy right, 60% -->
  <g transform="translate(640,180)">
    <text x="0" y="20" class="eb">FAMILY-RUN, SECOND-GENERATION</text>
    <text x="0" y="80" class="h2">Started in 2000 by Nick.</text>
    <text x="0" y="124" class="h2">Run today by his son, Erick.</text>
    <text x="0" y="190" class="body">Sunset Services has been mowing lawns, building patios, and</text>
    <text x="0" y="214" class="body">clearing snow in DuPage County for 25+ years. Same family,</text>
    <text x="0" y="238" class="body">same crew of long-tenure workers, same 6:30am start.</text>
    <text x="0" y="288" class="body">Erick took the company over from Nick in 2018 and added the</text>
    <text x="0" y="312" class="body">Unilock-authorized hardscape division. Everything else stayed.</text>
    <g transform="translate(0,360)">
      <rect width="200" height="48" rx="8" fill="none" stroke="#4D8A3F" stroke-width="0"/>
      <text x="0" y="30" class="btn">Read our story  →</text>
      <line x1="0" y1="38" x2="148" y2="38" stroke="#4D8A3F" stroke-width="1" opacity="0.4"/>
    </g>
    <text x="0" y="480" class="anno">Ghost button (link-style underline). NOT amber.</text>
  </g>
  <text x="120" y="100" class="anno">Surface --color-bg-cream · py-20 desktop · &lt;AnimateIn fade-up&gt; copy + &lt;AnimateIn fade-left&gt; image</text>
</svg>

### 7.2 Mobile annotated mockup

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 1100" width="100%" role="img" aria-label="About teaser — mobile">
  <style>
    .ebm { font-family: 'Manrope', system-ui, sans-serif; font-size: 12px; font-weight: 600; fill: #2F5D27; letter-spacing: 1.4px; }
    .h2m { font-family: 'Manrope', system-ui, sans-serif; font-size: 28px; font-weight: 700; fill: #1A1A1A; }
    .bodym { font-family: 'Onest', system-ui, sans-serif; font-size: 16px; fill: #4A4A4A; }
    .btnm { font-family: 'Manrope', system-ui, sans-serif; font-size: 15px; font-weight: 600; fill: #2F5D27; }
    .phm { font-family: 'ui-monospace', Menlo, monospace; font-size: 11px; fill: #FAF7F1; }
  </style>
  <rect width="480" height="1100" fill="#FAF7F1"/>
  <g transform="translate(24,60)">
    <rect width="432" height="432" rx="16" fill="#5A4A38"/>
    <text x="216" y="220" class="phm" text-anchor="middle">[ Erick portrait · 1:1 mobile crop ]</text>
  </g>
  <text x="24" y="540" class="ebm">FAMILY-RUN, SECOND-GENERATION</text>
  <text x="24" y="586" class="h2m">Started in 2000 by Nick.</text>
  <text x="24" y="618" class="h2m">Run today by Erick.</text>
  <text x="24" y="680" class="bodym">Sunset Services has been mowing</text>
  <text x="24" y="702" class="bodym">lawns, building patios, and clearing</text>
  <text x="24" y="724" class="bodym">snow for 25+ years. Same family,</text>
  <text x="24" y="746" class="bodym">same crew, same 6:30am start.</text>
  <text x="24" y="800" class="bodym">Erick took over in 2018 and added</text>
  <text x="24" y="822" class="bodym">the Unilock hardscape division.</text>
  <text x="24" y="900" class="btnm">Read our story  →</text>
  <line x1="24" y1="908" x2="172" y2="908" stroke="#4D8A3F" opacity="0.4"/>
</svg>

### 7.3 About teaser — spec

| Element | Spec |
|---|---|
| Surface | `--color-bg-cream`. |
| Layout desktop | Two-column, image 40% / copy 60%. Gap `--spacing-16` (64px). |
| Layout mobile | Stacked: image first, copy second. Gap `--spacing-8`. |
| Image aspect | 4:5 desktop (portrait), 1:1 mobile (cropped square). `next/image` with `loading="lazy"`, `sizes="(max-width:1023px) 100vw, 40vw"`, explicit dimensions. |
| Image alt | "Erick Solis, owner of Sunset Services, on a job site in Aurora." (Final alt drafted with photo selection in Phase 2.) |
| Eyebrow | "FAMILY-RUN, SECOND-GENERATION" / "NEGOCIO FAMILIAR, SEGUNDA GENERACIÓN" |
| H2 | "Started in 2000 by Nick. Run today by his son, Erick." / "Empezado en 2000 por Nick. Hoy lo dirige su hijo, Erick." Two lines on desktop, can flow on mobile. |
| Body | 2 paragraphs. Para 1: history + crew tenure. Para 2: Erick's hardscape addition. Each ≤ 3 sentences. |
| CTA | `btn--link` (link-styled): "Read our story →" / "Lee nuestra historia →" linking to `/{locale}/about/`. **Not amber, not green-button** — this is a soft secondary affordance. |
| Motion | `<AnimateIn variant="fade-up">` on copy column; `<AnimateIn variant="fade-left">` on image. Both fire on the same scroll trigger (shared viewport observer). |

---

## 8. Projects teaser

The brand's portfolio in miniature. White surface so the photographic tiles dominate.

### 8.1 Desktop annotated mockup

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 1100" width="100%" role="img" aria-label="Projects teaser — desktop">
  <style>
    .eb { font-family: 'Manrope', system-ui, sans-serif; font-size: 13px; font-weight: 600; fill: #2F5D27; letter-spacing: 1.5px; }
    .h2 { font-family: 'Manrope', system-ui, sans-serif; font-size: 40px; font-weight: 700; fill: #1A1A1A; letter-spacing: -0.6px; }
    .ttl { font-family: 'Manrope', system-ui, sans-serif; font-size: 20px; font-weight: 600; fill: #FAF7F1; }
    .tag { font-family: 'Manrope', system-ui, sans-serif; font-size: 11px; font-weight: 600; fill: #FAF7F1; letter-spacing: 1px; }
    .btn { font-family: 'Manrope', system-ui, sans-serif; font-size: 15px; font-weight: 600; fill: #2F5D27; }
    .ph { font-family: 'ui-monospace', Menlo, monospace; font-size: 11px; fill: #FAF7F1; }
    .anno { font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #B47821; font-style: italic; }
  </style>
  <rect width="1440" height="1100" fill="#FFFFFF"/>

  <text x="120" y="120" class="eb">RECENT WORK</text>
  <text x="120" y="170" class="h2">Built last season,</text>
  <text x="120" y="218" class="h2">aging into the property.</text>

  <!-- 3x2 grid -->
  <g>
    <!-- Project card structure: photo + bottom-up overlay + title + tag -->
    <g transform="translate(120,290)">
      <rect width="384" height="288" rx="16" fill="#5A6F4A"/>
      <rect width="384" height="288" rx="16" fill="url(#projGrad)"/>
      <text x="192" y="120" class="ph" text-anchor="middle">[ Project 1 · 4:3 ]</text>
      <rect x="24" y="32" width="92" height="22" rx="11" fill="rgba(250,247,241,0.16)" stroke="rgba(250,247,241,0.32)"/>
      <text x="70" y="47" class="tag" text-anchor="middle">HARDSCAPE</text>
      <text x="24" y="248" class="ttl">Naperville Patio</text>
    </g>
    <g transform="translate(528,290)">
      <rect width="384" height="288" rx="16" fill="#7A8A5C"/>
      <rect width="384" height="288" rx="16" fill="url(#projGrad)"/>
      <rect x="24" y="32" width="92" height="22" rx="11" fill="rgba(250,247,241,0.16)" stroke="rgba(250,247,241,0.32)"/>
      <text x="70" y="47" class="tag" text-anchor="middle">RESIDENTIAL</text>
      <text x="24" y="248" class="ttl">Wheaton Lawn Reset</text>
    </g>
    <g transform="translate(936,290)">
      <rect width="384" height="288" rx="16" fill="#5C6660"/>
      <rect width="384" height="288" rx="16" fill="url(#projGrad)"/>
      <rect x="24" y="32" width="92" height="22" rx="11" fill="rgba(250,247,241,0.16)" stroke="rgba(250,247,241,0.32)"/>
      <text x="70" y="47" class="tag" text-anchor="middle">COMMERCIAL</text>
      <text x="24" y="248" class="ttl">Aurora HOA Curb</text>
    </g>

    <g transform="translate(120,610)">
      <rect width="384" height="288" rx="16" fill="#8A6A4A"/>
      <rect width="384" height="288" rx="16" fill="url(#projGrad)"/>
      <rect x="24" y="32" width="92" height="22" rx="11" fill="rgba(250,247,241,0.16)" stroke="rgba(250,247,241,0.32)"/>
      <text x="70" y="47" class="tag" text-anchor="middle">HARDSCAPE</text>
      <text x="24" y="248" class="ttl">Glen Ellyn Fire Pit</text>
    </g>
    <g transform="translate(528,610)">
      <rect width="384" height="288" rx="16" fill="#6A5A48"/>
      <rect width="384" height="288" rx="16" fill="url(#projGrad)"/>
      <rect x="24" y="32" width="92" height="22" rx="11" fill="rgba(250,247,241,0.16)" stroke="rgba(250,247,241,0.32)"/>
      <text x="70" y="47" class="tag" text-anchor="middle">HARDSCAPE</text>
      <text x="24" y="248" class="ttl">Lisle Retaining Wall</text>
    </g>
    <g transform="translate(936,610)">
      <rect width="384" height="288" rx="16" fill="#4A5A3C"/>
      <rect width="384" height="288" rx="16" fill="url(#projGrad)"/>
      <rect x="24" y="32" width="92" height="22" rx="11" fill="rgba(250,247,241,0.16)" stroke="rgba(250,247,241,0.32)"/>
      <text x="70" y="47" class="tag" text-anchor="middle">RESIDENTIAL</text>
      <text x="24" y="248" class="ttl">Warrenville Garden</text>
    </g>
  </g>

  <!-- Below grid -->
  <g transform="translate(620,950)">
    <rect width="220" height="48" rx="8" fill="none" stroke="#4D8A3F" stroke-width="1.5"/>
    <text x="110" y="30" class="btn" text-anchor="middle">See all projects  →</text>
  </g>

  <text x="120" y="1040" class="anno">project tile = card--photo with bottom-up overlay (--color-overlay-50 → transparent) + title in --color-text-on-dark + tag pill</text>

  <defs>
    <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.5" stop-color="rgba(0,0,0,0)"/>
      <stop offset="1" stop-color="rgba(26,26,26,0.50)"/>
    </linearGradient>
  </defs>
</svg>

### 8.2 Mobile annotated mockup

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 2240" width="100%" role="img" aria-label="Projects teaser — mobile">
  <style>
    .ebm { font-family: 'Manrope', system-ui, sans-serif; font-size: 12px; font-weight: 600; fill: #2F5D27; letter-spacing: 1.4px; }
    .h2m { font-family: 'Manrope', system-ui, sans-serif; font-size: 28px; font-weight: 700; fill: #1A1A1A; }
    .ttlm { font-family: 'Manrope', system-ui, sans-serif; font-size: 18px; font-weight: 600; fill: #FAF7F1; }
    .tagm { font-family: 'Manrope', system-ui, sans-serif; font-size: 10px; font-weight: 600; fill: #FAF7F1; letter-spacing: 0.8px; }
    .btnm { font-family: 'Manrope', system-ui, sans-serif; font-size: 15px; font-weight: 600; fill: #2F5D27; }
    .phm { font-family: 'ui-monospace', Menlo, monospace; font-size: 11px; fill: #FAF7F1; }
  </style>
  <rect width="480" height="2240" fill="#FFFFFF"/>
  <text x="24" y="60" class="ebm">RECENT WORK</text>
  <text x="24" y="100" class="h2m">Built last season,</text>
  <text x="24" y="132" class="h2m">aging into the property.</text>

  <g>
    <!-- 6 stacked tiles -->
    <g transform="translate(24,180)">
      <rect width="432" height="324" rx="16" fill="#5A6F4A"/>
      <rect width="432" height="324" rx="16" fill="url(#projGradM)"/>
      <text x="216" y="160" class="phm" text-anchor="middle">[ Project · 4:3 ]</text>
      <rect x="20" y="24" width="92" height="22" rx="11" fill="rgba(250,247,241,0.16)" stroke="rgba(250,247,241,0.32)"/>
      <text x="66" y="39" class="tagm" text-anchor="middle">HARDSCAPE</text>
      <text x="20" y="294" class="ttlm">Naperville Patio</text>
    </g>
    <g transform="translate(24,520)">
      <rect width="432" height="324" rx="16" fill="#7A8A5C"/>
      <rect width="432" height="324" rx="16" fill="url(#projGradM)"/>
      <rect x="20" y="24" width="100" height="22" rx="11" fill="rgba(250,247,241,0.16)" stroke="rgba(250,247,241,0.32)"/>
      <text x="70" y="39" class="tagm" text-anchor="middle">RESIDENTIAL</text>
      <text x="20" y="294" class="ttlm">Wheaton Lawn Reset</text>
    </g>
    <g transform="translate(24,860)">
      <rect width="432" height="324" rx="16" fill="#5C6660"/>
      <rect width="432" height="324" rx="16" fill="url(#projGradM)"/>
      <rect x="20" y="24" width="100" height="22" rx="11" fill="rgba(250,247,241,0.16)" stroke="rgba(250,247,241,0.32)"/>
      <text x="70" y="39" class="tagm" text-anchor="middle">COMMERCIAL</text>
      <text x="20" y="294" class="ttlm">Aurora HOA Curb</text>
    </g>
  </g>
  <text x="24" y="1240" font-family="Onest" font-size="11" fill="#B47821" font-style="italic">[ projects 4–6 follow with same pattern · gap --spacing-4 ]</text>

  <g transform="translate(24,2120)">
    <rect width="432" height="48" rx="8" fill="none" stroke="#4D8A3F" stroke-width="1.5"/>
    <text x="216" y="30" class="btnm" text-anchor="middle">See all projects  →</text>
  </g>

  <defs>
    <linearGradient id="projGradM" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.5" stop-color="rgba(0,0,0,0)"/>
      <stop offset="1" stop-color="rgba(26,26,26,0.55)"/>
    </linearGradient>
  </defs>
</svg>

### 8.3 Projects teaser — spec

| Element | Spec |
|---|---|
| Surface | `--color-bg` (white). |
| Eyebrow | "RECENT WORK" / "TRABAJOS RECIENTES" |
| H2 | "Built last season, aging into the property." / "Construido la temporada pasada, integrándose en la propiedad." |
| Grid | 3×2 desktop, 2×3 tablet (md), 1×6 mobile. Gap `--spacing-4` (16px) — tighter than Services because tiles are larger and the page already has whitespace. |
| Tile | `card--photo` 4:3 with **bottom-up overlay** (project-tile variant per Phase 1.03 §6.2). Title in `--color-text-on-dark` `--text-h5` 600. Category tag pill in upper-left: 11px Manrope 600 uppercase, `rgba(250,247,241,0.16)` background, `rgba(250,247,241,0.32)` 1px border, 22px tall, 8px horizontal padding. |
| Tag categories | "HARDSCAPE" / "RESIDENTIAL" / "COMMERCIAL" — same three audiences as §4. |
| Hover | Photo `scale(1.03)` + title `translateY(-2px)`. Underline on title at 1px `--color-text-on-dark`. |
| Below grid | One Secondary × md button "See all projects →" centered, links to `/{locale}/projects/`. |
| Stagger | `<StaggerContainer>` with 6 `<StaggerItem>` tiles, 80ms stagger. |
| Loading | All 6 images `loading="lazy"`, explicit dimensions, AVIF + WebP. |

### 8.4 Placeholder project list (Phase 2 swaps to Sanity)

| # | Title | Category | City |
|---|---|---|---|
| 1 | Naperville Patio | Hardscape | Naperville |
| 2 | Wheaton Lawn Reset | Residential | Wheaton |
| 3 | Aurora HOA Curb | Commercial | Aurora |
| 4 | Glen Ellyn Fire Pit | Hardscape | Glen Ellyn |
| 5 | Lisle Retaining Wall | Hardscape | Lisle |
| 6 | Warrenville Garden | Residential | Warrenville |

Curation: 3 Hardscape + 2 Residential + 1 Commercial. Same proportional weighting as Services (§5.4) — the brand leads with Hardscape.

---

## 9. CTA section — the amber moment

The page's single amber CTA. Bottom-of-page closer before the footer.

### 9.1 Desktop annotated mockup

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 700" width="100%" role="img" aria-label="Final CTA — desktop">
  <style>
    .eb { font-family: 'Manrope', system-ui, sans-serif; font-size: 13px; font-weight: 600; fill: #2F5D27; letter-spacing: 1.5px; }
    .h2 { font-family: 'Manrope', system-ui, sans-serif; font-size: 56px; font-weight: 700; fill: #1A1A1A; letter-spacing: -1px; }
    .body { font-family: 'Onest', system-ui, sans-serif; font-size: 20px; fill: #4A4A4A; }
    .btn { font-family: 'Manrope', system-ui, sans-serif; font-size: 17px; font-weight: 600; fill: #1A1A1A; }
    .tel { font-family: 'Onest', system-ui, sans-serif; font-size: 15px; fill: #2F5D27; font-weight: 500; }
    .anno { font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #B47821; font-style: italic; }
  </style>
  <rect width="1440" height="700" fill="#FAF7F1"/>

  <text x="720" y="160" class="eb" text-anchor="middle">READY TO START?</text>
  <text x="720" y="240" class="h2" text-anchor="middle">Let's design your</text>
  <text x="720" y="312" class="h2" text-anchor="middle">outdoor space.</text>
  <text x="720" y="376" class="body" text-anchor="middle">Tell us about the property and we'll come measure, sketch,</text>
  <text x="720" y="402" class="body" text-anchor="middle">and price it. Free, no obligation, usually within a week.</text>

  <!-- The amber CTA -->
  <g transform="translate(580,440)">
    <rect width="280" height="52" rx="8" fill="#E8A33D"/>
    <text x="140" y="33" class="btn" text-anchor="middle">Get a Free Estimate</text>
  </g>
  <text x="720" y="528" class="tel" text-anchor="middle">or call (630) 946-9321</text>
  <line x1="640" y1="538" x2="800" y2="538" stroke="#4D8A3F" opacity="0.4"/>

  <text x="720" y="600" class="anno" text-anchor="middle">Amber × lg · THE one amber CTA on this page · py-24 desktop · centered content block</text>
  <text x="720" y="616" class="anno" text-anchor="middle">"or call …" is text-link, tel: with data-cr-tracking="home-cta-phone"</text>
</svg>

### 9.2 Mobile annotated mockup

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 700" width="100%" role="img" aria-label="Final CTA — mobile">
  <style>
    .ebm { font-family: 'Manrope', system-ui, sans-serif; font-size: 12px; font-weight: 600; fill: #2F5D27; letter-spacing: 1.4px; }
    .h2m { font-family: 'Manrope', system-ui, sans-serif; font-size: 36px; font-weight: 700; fill: #1A1A1A; letter-spacing: -0.6px; }
    .bodym { font-family: 'Onest', system-ui, sans-serif; font-size: 17px; fill: #4A4A4A; }
    .btnm { font-family: 'Manrope', system-ui, sans-serif; font-size: 17px; font-weight: 600; fill: #1A1A1A; }
    .telm { font-family: 'Onest', system-ui, sans-serif; font-size: 15px; fill: #2F5D27; font-weight: 500; }
  </style>
  <rect width="480" height="700" fill="#FAF7F1"/>
  <text x="240" y="100" class="ebm" text-anchor="middle">READY TO START?</text>
  <text x="240" y="160" class="h2m" text-anchor="middle">Let's design your</text>
  <text x="240" y="200" class="h2m" text-anchor="middle">outdoor space.</text>
  <text x="240" y="260" class="bodym" text-anchor="middle">Tell us about the property —</text>
  <text x="240" y="284" class="bodym" text-anchor="middle">we'll measure, sketch, and</text>
  <text x="240" y="308" class="bodym" text-anchor="middle">price it. Free.</text>

  <g transform="translate(24,360)">
    <rect width="432" height="52" rx="8" fill="#E8A33D"/>
    <text x="216" y="33" class="btnm" text-anchor="middle">Get a Free Estimate</text>
  </g>
  <text x="240" y="450" class="telm" text-anchor="middle">or call (630) 946-9321</text>
</svg>

### 9.3 Final CTA — spec

| Element | Spec |
|---|---|
| Surface | `--color-bg-cream`. **D4 alternative: `--color-bg-charcoal`** — surfaced in §17 with the visual-divider requirement. Recommendation: cream. |
| Padding | `py-24` desktop (96px), `py-16` mobile (64px). |
| Container | `--container-narrow` (960px) — narrower than the page default to keep the closer focused. |
| Alignment | Center. |
| Eyebrow | "READY TO START?" / "¿LISTO PARA EMPEZAR?" |
| H2 | `--text-h1` (56px desktop / 36px mobile — yes, this is intentionally one step bigger than other H2s on the page). "Let's design your outdoor space." / "Diseñemos tu espacio exterior." ≤ 8 words EN / ≤ 10 ES. |
| Body | `--text-body-lg`, `--color-text-secondary`, ≤ 25 words. Placeholder: "Tell us about the property and we'll come measure, sketch, and price it. Free, no obligation, usually within a week." |
| Primary CTA | **Amber × lg** — the page's one amber. Copy: "Get a Free Estimate" / "Solicita un Presupuesto Gratis." Links to `/{locale}/request-quote/`. `min-width: 280px` so ES doesn't push the layout. `data-cr-tracking="home-cta-amber"`. |
| Secondary affordance | Below the amber CTA, `--spacing-4` gap: text-link "or call (630) 946-9321" / "o llama al (630) 946-9321". `<a href="tel:+16309469321">`, `--text-body-sm`, color `--color-sunset-green-700`, weight 500, underline 40% opacity at rest → 100% on hover. `data-cr-tracking="home-cta-phone"`. |
| Motion | `<AnimateIn variant="fade-up">` on the whole block. Reduced-motion: opacity-only. |

---

## 10. SEO and schema for the homepage

### 10.1 Title and description

| Locale | `<title>` (≤60 chars) | `<meta name="description">` (≤160 chars) |
|---|---|---|
| EN | `Sunset Services — Aurora & Naperville Landscaping & Hardscape` (60) | `Family-run landscaping, hardscape, and snow management for residential and commercial properties across DuPage County. 25+ years. Free estimates.` (155) |
| ES | `Sunset Services — Paisajismo y Hardscape en Aurora y Naperville` (62 — 2 over; trim to "Paisajismo en Aurora y Naperville") | `Paisajismo, hardscape y manejo de nieve para hogares y empresas en el Condado de DuPage. Empresa familiar, 25+ años. Presupuestos gratis.` (143) |

### 10.2 OG image

- 1200×630 PNG/JPEG, generated via `next/og` in Phase 2.
- Composition: hero photo (same source as `/`'s hero) cropped to 1200×630, with subtle wordmark watermark in bottom-left corner. Wordmark in `--color-text-on-dark` at 60% opacity, 32px cap-height, 24px from edges.
- File output: `app/[locale]/opengraph-image.tsx` per Next.js metadata API.

### 10.3 JSON-LD schemas

In `<head>` of `/` (and `/es/`) via Next.js metadata `script` slots:

- **`WebSite`** — sitelinks searchbox `potentialAction` with `target` placeholder `https://sunsetservices.com/search?q={search_term_string}` (real search lands in Part 2).
- **`Organization`** — sitewide, lives in **root layout** `app/layout.tsx`, NOT homepage-specific. Confirmed in Phase 1.05 §8.
- **`LocalBusiness`** — sitewide, root layout. Confirmed in Phase 1.05.
- **No `BreadcrumbList`** on `/` per Plan §9 ("BreadcrumbList — Every non-home page").

Example `WebSite` schema:

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Sunset Services",
  "url": "https://sunsetservices.com/",
  "inLanguage": ["en-US", "es-US"],
  "potentialAction": {
    "@type": "SearchAction",
    "target": { "@type": "EntryPoint", "urlTemplate": "https://sunsetservices.com/search?q={search_term_string}" },
    "query-input": "required name=search_term_string"
  }
}
```

### 10.4 Heading hierarchy

| Section | Level | Notes |
|---|---|---|
| Hero | `<h1>` | One per page. |
| Audience entries section header | `<h2>` | |
| Each audience tile title | `<h3>` | |
| Services overview section header | `<h2>` | |
| Each service tile title | `<h3>` | (Phase 1.03 §3.4 base styles size H3 → h6 visually via `--text-h6` token utility on the heading. The tag is h3 for hierarchy; the visual size is smaller via class.) |
| Social proof section header | `<h2>` | |
| Each review card | wrapper `<article>`; quote in `<blockquote>` | No heading inside the card; "Sarah K., Wheaton" is a `<cite>`. |
| About teaser header | `<h2>` | |
| Projects section header | `<h2>` | |
| Each project tile title | `<h3>` | |
| Final CTA header | `<h2>` | |

No skipped levels. Verified by §14 audit checklist.

---

## 11. Photography brief

Consolidated brief Cowork can act on in Phase 2.04. Every slot marked `[Cowork to source from Drive in Phase 2.04]`.

| Slot | Aspect (desktop) | Aspect (mobile) | Subject | Mood / lighting | Notes |
|---|---|---|---|---|---|
| **Hero** | 16:9 | 4:5 | Paver patio with fire feature; greenery in frame; finished install | Golden-hour, warm, premium, no people facing camera | LCP element — ≤ 350KB AVIF. Low-key bottom 60% so gradient does its job. Cropping must work at 16:9, 4:3, 9:16, 4:5 for OG / social variants. `[Cowork to source from Drive in Phase 2.04]` |
| **Audience tile 1 — Residential** | 4:3 | 4:3 | Curated home lawn with mature plantings, paver walkway | Daylight, lush, late spring | `[Cowork to source from Drive in Phase 2.04]` |
| **Audience tile 2 — Commercial** | 4:3 | 4:3 | Commercial property frontage — office or HOA aesthetic, clean turf, defined beds | Sharp, clean, mid-day | `[Cowork to source from Drive in Phase 2.04]` |
| **Audience tile 3 — Hardscape** | 4:3 | 4:3 | Paver patio close-up, fire feature or wall in frame | Detail, materials-led, warm late-afternoon | Should differ from hero photo to avoid repetition. `[Cowork to source from Drive in Phase 2.04]` |
| **Service tile × 9** | 1:1 | 1:1 | Per service (Lawn Care, Patios & Walkways, Retaining Walls, Landscape Design, Tree Services, Sprinkler Systems, Snow Removal, Outdoor Kitchens, Fire Pits & Features) | Varied subject, **consistent saturation and color temperature** (Lightroom preset to be defined in Phase 2.04) | `[Cowork to source from Drive in Phase 2.04]` |
| **About teaser** | 4:5 | 1:1 | Erick portrait OR Erick + crew on a job site | Outdoors, working light, hands or tools visible OK | If portrait, alt-text shape: "Erick Solis, owner of Sunset Services, on a job site in [city]." `[Cowork to source from Drive in Phase 2.04]` |
| **Projects teaser × 6** | 4:3 | 4:3 | Per project — variety across audiences (3 Hardscape, 2 Residential, 1 Commercial) | Variety in light + season; consistent style | Each tile photo ≤ 200KB AVIF. `[Cowork to source from Drive in Phase 2.04]` |

Hero textual prompt for Cowork's curation pass: *"Late-afternoon golden hour, finished paver patio with a built-in fire feature; greenery (small ornamental tree or bordered bed) visible to one side; warm wood/stone tones; no people facing camera; the bottom 60% of the frame should be naturally darker than the top so a CSS gradient can carry the H1. Aspect crops cleanly at 16:9 desktop hero, 4:5 mobile, 1:1 social, 1200×630 OG. Avoid: night shots, overly saturated greens, anything that looks staged or stock-photo."*

---

## 12. i18n strings required

Flat table under `home.*` namespace. Every visible string on the homepage. Phase 2.13 native review will normalize the placeholders marked `[TBR]`.

| Key | EN | ES |
|---|---|---|
| `home.meta.title` | Sunset Services — Aurora & Naperville Landscaping & Hardscape | Sunset Services — Paisajismo en Aurora y Naperville |
| `home.meta.description` | Family-run landscaping, hardscape, and snow management for residential and commercial properties across DuPage County. 25+ years. Free estimates. | Paisajismo, hardscape y manejo de nieve para hogares y empresas en el Condado de DuPage. Empresa familiar, 25+ años. Presupuestos gratis. |
| `home.hero.kicker` | Aurora · Naperville · DuPage County | Aurora · Naperville · Condado de DuPage |
| `home.hero.h1` | Outdoor spaces, built to last 25+ years. | Espacios exteriores, construidos para durar 25+ años. |
| `home.hero.sub` | Premium hardscape, full-service landscaping, and snow management across DuPage County. Family-run, Unilock-authorized, since 2000. | Hardscape premium, paisajismo integral y manejo de nieve en el Condado de DuPage. Empresa familiar, autorizada Unilock, desde 2000. |
| `home.hero.alt` | Paver patio with a stone fire feature at golden hour, surrounded by mature plantings. | Patio de adoquines con chimenea de piedra al atardecer, rodeado de plantaciones maduras. |
| `home.hero.primary` | Get a Free Estimate | Solicita un Presupuesto Gratis |
| `home.hero.secondary` | View Our Work | Ver Nuestro Trabajo |
| `home.hero.trust.rating` | ★ 4.8 on Google · 200+ reviews | ★ 4.8 en Google · 200+ reseñas |
| `home.hero.trust.years` | 25+ years | 25+ años |
| `home.hero.trust.unilock` | Unilock Authorized | Autorizado Unilock |
| `home.hero.trust.area` | Aurora · Naperville · DuPage | Aurora · Naperville · DuPage |
| `home.audience.eyebrow` | Find your fit | Encuentra tu encaje |
| `home.audience.h2` | Three ways we work. | Tres formas de trabajar. |
| `home.audience.sub` | Self-segment by property type — every audience gets the team and the playbook that fits. | Segmenta por tipo de propiedad — cada audiencia recibe el equipo y el plan que le corresponde. [TBR — needs native review] |
| `home.audience.residential.tag` | Residential | Residencial |
| `home.audience.residential.h3` | For your home. | Para tu hogar. |
| `home.audience.residential.desc` | Lawn care, design, and seasonal services for the home you're proud of. | Cuidado de césped, diseño y servicios de temporada para el hogar del que te enorgulleces. |
| `home.audience.residential.cta` | Explore Residential | Explorar Residencial |
| `home.audience.commercial.tag` | Commercial | Comercial |
| `home.audience.commercial.h3` | For your property. | Para tu propiedad. |
| `home.audience.commercial.desc` | Year-round maintenance and snow management for properties that can't afford to look untended. | Mantenimiento todo el año y manejo de nieve para propiedades que no pueden verse descuidadas. |
| `home.audience.commercial.cta` | Explore Commercial | Explorar Comercial |
| `home.audience.hardscape.tag` | Hardscape | Hardscape |
| `home.audience.hardscape.h3` | For your patio. | Para tu patio. |
| `home.audience.hardscape.desc` | Paver patios, retaining walls, and outdoor kitchens. Unilock-authorized, 25 years building. | Patios de adoquines, muros de contención y cocinas exteriores. Autorizados por Unilock, 25 años construyendo. |
| `home.audience.hardscape.cta` | Explore Hardscape | Explorar Hardscape |
| `home.services.eyebrow` | What we do | Lo que hacemos |
| `home.services.h2` | Built for the property, not the brochure. | Construido para la propiedad, no para el folleto. [TBR] |
| `home.services.sub` | Nine of our most-asked services. Sixteen total — the audience landings cover the rest. | Nueve de nuestros servicios más solicitados. Dieciséis en total — las páginas de audiencia cubren el resto. [TBR] |
| `home.services.tile.lawnCare` | Lawn Care | Cuidado de Césped |
| `home.services.tile.patios` | Patios & Walkways | Patios y Senderos |
| `home.services.tile.walls` | Retaining Walls | Muros de Contención |
| `home.services.tile.design` | Landscape Design | Diseño de Paisaje |
| `home.services.tile.trees` | Tree Services | Servicios de Árboles |
| `home.services.tile.sprinklers` | Sprinkler Systems | Sistemas de Riego |
| `home.services.tile.snow` | Snow Removal | Remoción de Nieve |
| `home.services.tile.kitchens` | Outdoor Kitchens | Cocinas Exteriores |
| `home.services.tile.fire` | Fire Pits & Features | Chimeneas y Elementos de Fuego |
| `home.services.cta.residential` | All Residential Services | Todos los Servicios Residenciales |
| `home.services.cta.commercial` | All Commercial Services | Todos los Servicios Comerciales |
| `home.services.cta.hardscape` | All Hardscape Services | Todos los Servicios de Hardscape |
| `home.social.eyebrow` | From the people who hire us | De la gente que nos contrata |
| `home.social.h2` | Reviewed by neighbors. | Reseñados por vecinos. |
| `home.social.aggregate` | {rating} on Google · {count}+ reviews | {rating} en Google · {count}+ reseñas |
| `home.social.aggregateAria` | {rating} out of 5 stars on Google, {count} or more reviews | {rating} de 5 estrellas en Google, {count} o más reseñas |
| `home.social.via` | via Google | en Google |
| `home.social.cred.years` | years building in DuPage County | años construyendo en el Condado de DuPage |
| `home.social.cred.top5` | Top 5 Landscaping | Top 5 Paisajismo |
| `home.social.cred.top5sub` | DuPage Tribune · 2024 | DuPage Tribune · 2024 |
| `home.about.eyebrow` | Family-run, second-generation | Negocio familiar, segunda generación |
| `home.about.h2` | Started in 2000 by Nick. Run today by his son, Erick. | Empezado en 2000 por Nick. Hoy lo dirige su hijo, Erick. |
| `home.about.body1` | Sunset Services has been mowing lawns, building patios, and clearing snow in DuPage County for 25+ years. Same family, same crew of long-tenure workers, same 6:30am start. | Sunset Services ha cortado césped, construido patios y limpiado nieve en el Condado de DuPage durante 25+ años. Misma familia, mismo equipo de trabajadores con larga trayectoria, mismo arranque a las 6:30am. |
| `home.about.body2` | Erick took the company over from Nick in 2018 and added the Unilock-authorized hardscape division. Everything else stayed. | Erick tomó la empresa de Nick en 2018 y agregó la división de hardscape autorizada por Unilock. Todo lo demás se mantuvo. |
| `home.about.cta` | Read our story | Lee nuestra historia |
| `home.projects.eyebrow` | Recent work | Trabajos recientes |
| `home.projects.h2` | Built last season, aging into the property. | Construido la temporada pasada, integrándose en la propiedad. [TBR] |
| `home.projects.tag.hardscape` | HARDSCAPE | HARDSCAPE |
| `home.projects.tag.residential` | RESIDENTIAL | RESIDENCIAL |
| `home.projects.tag.commercial` | COMMERCIAL | COMERCIAL |
| `home.projects.tile.napervillePatio` | Naperville Patio | Patio en Naperville |
| `home.projects.tile.wheatonLawn` | Wheaton Lawn Reset | Renovación de Césped en Wheaton |
| `home.projects.tile.auroraHoa` | Aurora HOA Curb | Frontón HOA en Aurora |
| `home.projects.tile.glenEllynFire` | Glen Ellyn Fire Pit | Chimenea en Glen Ellyn |
| `home.projects.tile.lisleWall` | Lisle Retaining Wall | Muro de Contención en Lisle |
| `home.projects.tile.warrenvilleGarden` | Warrenville Garden | Jardín en Warrenville |
| `home.projects.cta` | See all projects | Ver todos los proyectos |
| `home.cta.eyebrow` | Ready to start? | ¿Listo para empezar? |
| `home.cta.h2` | Let's design your outdoor space. | Diseñemos tu espacio exterior. |
| `home.cta.body` | Tell us about the property and we'll come measure, sketch, and price it. Free, no obligation, usually within a week. | Cuéntanos sobre la propiedad y vamos a medir, dibujar y cotizar. Gratis, sin compromiso, normalmente en una semana. |
| `home.cta.primary` | Get a Free Estimate | Solicita un Presupuesto Gratis |
| `home.cta.phonePrefix` | or call | o llama al |
| `home.cta.phoneNumber` | (630) 946-9321 | (630) 946-9321 |

`[TBR]` items are flagged for Phase 2.13 native review.

---

## 13. Motion choreography

Per-section motion summary so Code does not derive it.

| Section | Variant | Notes |
|---|---|---|
| Hero | **None** | First-paint render. LCP discipline. Hover micro-interactions on CTAs only. |
| Audience entries | `<StaggerContainer>` + 3 `<StaggerItem>` | 80ms stagger per Phase 1.03 §7.4. Section header (eyebrow + H2) wrapped in `<AnimateIn variant="fade-up">` and fires before the stagger via `delay: 0`, while items fire on their own viewport entry. |
| Services overview | `<StaggerContainer>` + 9 `<StaggerItem>` | 80ms stagger. Below-grid CTA buttons wrapped in single `<AnimateIn variant="fade-up">` block. |
| Social proof | `<AnimateIn variant="fade-up">` on section + nested `<StaggerContainer>` for 3 review cards | Aggregate row animates as part of the outer fade-up. Stars are static (do not stagger individual stars). |
| About teaser | `<AnimateIn variant="fade-up">` on copy column, `<AnimateIn variant="fade-left">` on image | Both fire on the same viewport observer (one shared trigger node — the section root). |
| Projects teaser | `<StaggerContainer>` + 6 `<StaggerItem>` | 80ms stagger. |
| Final CTA | `<AnimateIn variant="fade-up">` on whole block | Single trigger. |

Reduced-motion: per Phase 1.03 §7.7, every entrance becomes opacity-only at `--motion-fast` (120ms). MotionConfig handles this globally — no per-component branching at the call site.

---

## 14. Accessibility audit

Checklist Phase 1.07 Code runs after implementing.

- [ ] **One `<h1>` on the page**, in the hero section. No other H1s anywhere.
- [ ] **No skipped heading levels.** Sequence is H1 (hero) → H2 (each section) → H3 (audience tiles, service tiles, project tiles). Reviews use `<blockquote>` + `<cite>`, not headings.
- [ ] **Hero contrast verified.** H1 (`#FAF7F1`) over the photo+gradient composite clears 4.5:1 in the lower 50% of the frame; secondary CTA outline (`#FAF7F1` 1.5px) clears 3:1 (non-text indicator) at every gradient stop. Verified against §3.4 gradient stops.
- [ ] **All interactive targets ≥ 44×44 CSS px.** Buttons (md=44h, lg=52h, sm=32h with 6+px padding to clear 44 around the label), nav links (44h via line-height + padding), inline links inside body copy use the parent line-height target.
- [ ] **Every photograph has descriptive `alt`.** No `alt=""` on the homepage — every image is meaningful. Service-tile photos use the service name plus a short scene descriptor (e.g., "A sprinkler head misting a green lawn at dusk"). Hardscape brand-mark placeholder uses `alt="Unilock Authorized Contractor"`.
- [ ] **Star icons in the social proof aggregate use `aria-hidden="true"`** and the rating is announced as text via `aria-label="4.8 out of 5 stars on Google, 200+ reviews"` on the wrapping element. Per-card stars also `aria-hidden`; the rating is implicit in the `<blockquote>` semantic.
- [ ] **CTAs are `<a>` styled as buttons** (because they navigate to other pages/anchors), not `<button onClick={() => router.push(...)}>`. Phase 1.03 §6.1 button class is applied to anchors via `className="btn btn--primary btn--lg"`.
- [ ] **All sections have `aria-labelledby`** pointing to their H2 (`<section aria-labelledby="home-audience-h2">`).
- [ ] **`<section>` for sections, `<article>` for review cards.** Each review card is a self-contained article with author cite.
- [ ] **Focus visible on every interactive element.** Per Phase 1.03 §8.4, `:focus-visible` outline 2px green-tinted ring + 2px offset. Verified on hero CTAs (white ring on green button per §6.1 override) and all service / project tiles.
- [ ] **`prefers-reduced-motion` honored** via `MotionConfig reducedMotion="user"` at locale layout. Tested with OS-level reduced-motion on / off.
- [ ] **`lang` attribute correct** — `<html lang="en">` on `/`, `<html lang="es">` on `/es/`. Set by next-intl per locale.

---

## 15. Lighthouse 95+ implications

What Phase 1.07 must do at code-time.

- **Hero image:** `priority`, `fetchPriority="high"`, AVIF + WebP, ≤ 350KB at 1920w, blur placeholder generated by `next/image`. (See §3.7.)
- **Manrope and Onest:** preloaded via `next/font/google` from Phase 1.04. Confirm with the `next-font` headers in the rendered HTML.
- **No third-party scripts on the homepage in Part 1.** Chat widget (Phase 1.20), GTM, and CallRail come in Part 2. Their absence here is correct and tested by checking `<head>` for any non-Next.js `<script>` tags.
- **Avoid layout shift.** Every image has explicit width/height (or `fill` with sized parent). Fonts use `font-display: swap` with fallback metrics tuned by `next/font` to minimize CLS.
- **Lazy-load below the audience-entries section.** Hero photo and three audience-tile photos are eager (`priority` for hero only; the three audience photos are above-the-fold-likely on tall-viewport desktops, so they ship eager via `loading="eager"` but no `priority`). Everything below — services tiles, review cards, about portrait, projects tiles — uses `loading="lazy"`.
- **Total page weight target:** ≤ **1.5MB** on first load, ≤ **500KB JS**.
- **`next/dynamic`** for any below-the-fold component pulling heavy deps. None expected in Part 1; the chat widget (Phase 1.20) will use it.
- **Compression:** Brotli via Vercel default. Static assets in `public/` get long-cache headers (`Cache-Control: public, max-age=31536000, immutable`).
- **Preconnect** to the hero photo's origin if it's not on the same origin (Vercel image-optimization endpoint is same-origin; if Cowork drops images on a CDN, add `<link rel="preconnect">`).

---

## 16. Component file plan for Code (Phase 1.07)

```
src/components/sections/home/
  HomeHero.tsx                 # server — composes hero photo wrap, gradient, copy stack, CTAs, trust microbar
  HomeAudienceEntries.tsx      # server — 3 tiles, links to /residential /commercial /hardscape; uses StaggerContainer (client wrapper)
  HomeServicesOverview.tsx     # server — 9-tile grid + 3 audience-CTA buttons
  HomeSocialProof.tsx          # server — aggregate row + 3 review cards + credentials row
  HomeAbout.tsx                # server — split image + copy
  HomeProjects.tsx             # server — 6-tile project grid + see-all CTA
  HomeCTA.tsx                  # server — bottom amber CTA + tel link

src/app/[locale]/page.tsx      # composes the seven sections, sets metadata + JSON-LD scripts via Next metadata API
src/messages/en.json           # adds `home.*` namespace per §12
src/messages/es.json           # adds `home.*` namespace per §12

src/components/ui/Button.tsx   # ADD on-dark variant for hero secondary (see below)
```

### 16.1 Required Button addition: on-dark Ghost variant

The hero's secondary CTA is `Ghost × lg` on a dark photographic surface. The locked `.btn--ghost` from Phase 1.03 §6.1 uses green text on a transparent background — invisible on the photo. Add an on-dark modifier:

```css
@layer components {
  .btn--ghost.btn--on-dark {
    color: var(--color-text-on-dark);
    border: 1.5px solid var(--color-text-on-dark);
  }
  .btn--ghost.btn--on-dark:hover {
    background: rgba(250, 247, 241, 0.08);
    border-color: var(--color-text-on-dark);
  }
  .btn--ghost.btn--on-dark:focus-visible {
    outline-color: var(--color-text-on-dark);
  }
}
```

Usage: `<a className="btn btn--ghost btn--on-dark btn--lg" href="...">View Our Work →</a>`. This is the only on-dark button on the homepage; the addition is small, scoped, and doesn't disturb Phase 1.03 tokens.

### 16.2 No new motion primitives required

`<AnimateIn>` and `<StaggerContainer>` / `<StaggerItem>` from Phase 1.04 cover every animation in §13. Confirmed.

### 16.3 No new icons required beyond Phase 1.03 §8.3

Used: lucide `ArrowRight` (audience CTAs, project tiles), `Star` (social proof), `Phone` (CTA section secondary). All already in `lucide-react` from Phase 1.02.

---

## 17. Decisions needed

For Claude Chat to ratify before Phase 1.07 starts.

### D1 — Hero layout

| Option | Description | Recommendation |
|---|---|---|
| **A — Full-bleed photo with text overlay** | Photo fills 85vh desktop / 75vh mobile, dark gradient bottom-up, copy + CTAs sit on the gradient, navbar in translucent State B. | **✓ Recommend.** Strongest first-impression density; exercises the locked translucent navbar; photography-led brand. Risks (contrast) mitigated by §3.4 gradient stops. |
| B — Split copy-left, photo-right | Cream copy panel left (~45%), photo right (~55%). Solid navbar. | Surfaces less photo at first glance; the navbar's translucent state goes unused. |
| C — Photo above the fold, copy below | 50vh photo band, then copy band on cream. | Requires user to scroll to read the H1 — expensive on a 5-second decision page. |

### D2 — Services overview layout

| Option | Description | Recommendation |
|---|---|---|
| **A — Curated 9-tile grid** | Static 3×3 (desktop) / 2-col (mobile) grid, all 9 services visible at once. | **✓ Recommend.** Audience self-segmentation is already done in §4 — re-doing it here costs interaction depth without earning anything. Static grid is JS-free, helps Lighthouse. |
| B — Tabbed mosaic by audience | Tab strip Residential / Commercial / Hardscape, swap-in content below. | Adds JS overhead; duplicates §4's job. |

### D3 — Services-grid CTA destination

| Option | Description | Recommendation |
|---|---|---|
| a — One button to `/residential/` | Misleading — the homepage isn't residential-only. Don't. | Reject. |
| **b — Three buttons to each audience landing** | "All Residential / Commercial / Hardscape Services" — splits cleanly. | **✓ Recommend.** Honest, scales with the existing IA, no scope creep. |
| c — Add a `/services/` overview route | New route, new IA work, Phase 2 scope. | Defer. Worth proposing for Phase 2 IA pass; not opening it here. |

### D4 — Single charcoal band on the homepage?

Plan §5 reserves charcoal for the footer + "occasional intentional dark moment." Should the homepage have one?

| Option | Description | Recommendation |
|---|---|---|
| **a — No charcoal band on the page; footer only** | Final CTA stays cream. Charcoal only in the footer. | **✓ Recommend.** Cream-cream-charcoal-(footer)-charcoal would create a heavy bottom; cream-(footer-charcoal) is cleaner. |
| b — Final CTA on charcoal | The final CTA section uses `--color-bg-charcoal`. Strong visual closer. | Risk: two adjacent dark bands (CTA + footer) read as one merged dark blob. **If chosen**, separate the two with a `--spacing-12` gap and a 1px `rgba(250,247,241,0.16)` hairline rule between them, OR brand the CTA section's background with a faint emblematic motif. |
| c — Projects teaser on charcoal | Project tiles already have dark gradients. Section background turning charcoal would lose the contrast that lets the tiles "pop." | Reject. |

### D5 — Industry memberships in the social-proof credentials row

| Option | Description |
|---|---|
| Cowork to confirm with Erick whether the business has BBB accreditation or other industry memberships before showing anything. | Default placeholder slot in the credentials row holds space; if Erick has none, the slot is removed and the remaining 3 items re-space via `justify-content: space-between`. |

**Recommendation:** Cowork confirms in Phase 2.04 photography pass. Until then, the slot is rendered as a hidden placeholder (DOM present, `visibility: hidden`) so layout doesn't shift if memberships are added.

### D6 — Trust microbar's "Top 5 Landscaping" caveat

The Plan carries a `[verify current]` note for the Top-5 mention. Where does the caveat live?

| Option | Description | Recommendation |
|---|---|---|
| a — Show "Top 5 Landscaping · DuPage Tribune · 2024" with the year as the verification anchor. | Year is the de-facto caveat. | **✓ Recommend.** The year reads as honest; the source ("DuPage Tribune") is verifiable. If the rank changes year-over-year, Erick updates the year, which is a one-line change. |
| b — Drop the Top-5 mention entirely until verified. | Conservative. | Reject — the social-proof band needs the credential variety. |

---

## 18. Verification checklist

Phase 1.07 Code runs this after implementing. Items mirror §3–§9 and §10–§15.

- [ ] **§3 Hero matches SVG reference** — Layout A, gradient stops per §3.4, type tokens (`--text-display`, `--text-body-lg`, `--text-micro`), CTA variants (Primary × lg + Ghost × lg on-dark).
- [ ] **No entrance animation on the hero.** First-paint render confirmed via Performance panel: LCP element's `renderTime` matches its image-decode time, no opacity transition.
- [ ] **H1 length within budget** — EN ≤ 7 words, ES ≤ 9 words. ES translation passed Phase 2.13 native review.
- [ ] **§4 Three audience tiles** match SVG reference and link to `/residential/`, `/commercial/`, `/hardscape/` (locale-prefixed).
- [ ] **§5 Services grid presents 9 tiles** per the curation in §5.4, with three audience-CTA buttons below.
- [ ] **Single amber CTA on the page**, in §9 final CTA section. Verified by `document.querySelectorAll('.btn--amber:not(.navbar *)').length === 1` (excludes the chrome-level navbar amber per Phase 1.05 §1).
- [ ] **No `.card-featured` on the page.** Verified by `document.querySelectorAll('.card--featured').length === 0`.
- [ ] **Surface alternation matches §2.2** — never two adjacent same-surface bands. Visually verified.
- [ ] **All `home.*` strings present** in both `messages/en.json` and `messages/es.json`. Coverage check: every key in §12 appears in both files.
- [ ] **LCP-discipline checks:** hero photo `priority`, AVIF + WebP, ≤ 350KB at 1920w, explicit dimensions / `fill`. Confirmed in DevTools Network panel and Lighthouse trace.
- [ ] **Lighthouse run on localhost:3000** hits ≥ 95 on Performance, Accessibility, Best Practices, SEO. Run on both `/en/` and `/es/`. Real photo can wait for Phase 2.04 — use a placeholder of correct file size (≤ 350KB AVIF) for now.
- [ ] **Reduced-motion verified** — toggle `prefers-reduced-motion: reduce` and confirm: no translateY in `<AnimateIn>`, no scale on photo-card hovers, no button hover-lift.
- [ ] **Social proof aggregate has `aria-label`** announcing the rating as text. Stars are `aria-hidden="true"`.
- [ ] **All CTAs are `<a>` not `<button>`.** Verified by `document.querySelectorAll('.btn').forEach(el => console.assert(el.tagName === 'A'))`.
- [ ] **Section landmarks** — every section has `aria-labelledby` pointing to its H2 (or H1 for hero).
- [ ] **Heading hierarchy unbroken** — H1 → H2 → H3, no skips. Verified by `axe-core` or `pa11y` on the rendered page.
- [ ] **No third-party scripts loaded** on `/` in Part 1. Verified by `document.querySelectorAll('script[src]:not([src*="_next"])').length === 0`.

---

**End of Phase 1.06 Design handover.**

> Next: this file goes back to Claude Chat. Chat ratifies D1–D6 in §17. After ratification, Chat produces the Phase 1.07 Code prompt. Code does not run until both happen.
