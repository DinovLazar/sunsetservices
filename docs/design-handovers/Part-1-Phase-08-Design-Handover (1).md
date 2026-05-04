# Sunset Services — Audience Landing + Service Detail Templates Handover (Phase 1.08)

> Read by Claude Code in Phase 1.09 (and reused unchanged by Phase 1.10) before any audience-landing or service-detail page code is written.
> Source of truth: this file. Conflicts with Phase 1.03 / 1.05 / 1.06? **Phase 1.03 wins on tokens, 1.05 wins on chrome, 1.06 wins on patterns reused as-is.** Surface mismatches to Claude Chat — never silently override.
> Phase: Part 1 — Phase 08 (Design). Operator: Claude Design.

---

## Table of contents

1. [Scope and constraints](#1-scope-and-constraints)
2. [Page-level decisions (shared across both templates)](#2-page-level-decisions-shared-across-both-templates)
3. [Audience landing — Template A (master)](#3-audience-landing--template-a-master)
   - 3.1 Audience hero
   - 3.2 Who this is for
   - 3.3 Services grid
   - 3.4 Featured projects
   - 3.5 Why Sunset Services
   - 3.6 Audience-specific social proof
   - 3.7 FAQ
   - 3.8 CTA section
3X. [Audience landing — Variants (Residential, Commercial, Hardscape)](#3x-audience-landing--variants)
4. [Service detail — Template B (master)](#4-service-detail--template-b-master)
   - 4.1 Service hero
   - 4.2 What's included
   - 4.3 Our process
   - 4.4 Why us for this service
   - 4.5 Pricing transparency block
   - 4.6 Featured projects
   - 4.7 FAQ
   - 4.8 Related services
   - 4.9 CTA section
   - 4.10 Per-service content seed (16 rows)
5. [JSON-LD schema spec per template](#5-json-ld-schema-spec-per-template)
6. [Photography brief](#6-photography-brief)
7. [i18n strings required](#7-i18n-strings-required)
8. [Motion choreography](#8-motion-choreography)
9. [Accessibility audit per template](#9-accessibility-audit-per-template)
10. [Lighthouse 95+ implications](#10-lighthouse-95-implications)
11. [Component file plan for Code](#11-component-file-plan-for-code)
12. [Decisions needed](#12-decisions-needed)
13. [Verification checklist](#13-verification-checklist)

---

## 1. Scope and constraints

**Template A — Audience landing.** A single long page that lives at `/residential/`, `/commercial/`, and `/hardscape/`. Eight content sections in vertical order: audience hero, "who this is for" qualifier, services grid (6/4/6 tiles depending on variant), featured projects, audience-level "Why Sunset Services," audience-filtered social proof + credentials, audience-level FAQ (FAQPage schema attached), and the page's single amber CTA section. The Phase 1.05 chrome wraps it unchanged. Three variants share structure but differ in hero photo, audience-accent token, services grid count, value-prop copy, and FAQ Q&As; Hardscape carries one extra band (the Unilock module).

**Template B — Service detail.** A single long page that lives at `/residential/lawn-care/`, `/hardscape/patios-walkways/`, and 14 other service routes. Nine content sections: service hero, "what's included" deliverables (3–6 items, must scale across the range), "our process" (4–5 numbered steps), service-level "why us" tiles, conditional pricing-transparency block (D5 — Option D), featured projects filtered to the service, service-specific FAQ (FAQPage schema — the page's primary SEO surface), related services, and the page's single amber CTA section. Phase 1.05 chrome wraps it unchanged. The same master design carries all 16 services; per-service content is supplied by the seed table in §4.10.

**Out of scope.** Real photography curation (Cowork sources from Erick's Drive in Phase 2.04 — the photo brief in §6 is what Cowork matches against). Final marketing copy (Erick polishes in Part 2 — placeholders in this handover are spec-only). Sanity schemas (Phase 2.03). Projects index, project detail pages, blog, resources, contact, about (later phases). The mobile sticky CallRail tap-to-call (chrome — Phase 1.05 owns it). The 21 page types not addressed by these two templates (homepage already shipped; locations, blog index, etc., are later).

**Constraints carried throughout.** Light mode only. WCAG 2.2 AA. EN + ES, Spanish ~15–25% longer per Phase 1.03 §3.5. `motion v12` only; `MotionConfig reducedMotion="user"` from Phase 1.04 honored. Server components by default; `<AnimateIn>` / `<StaggerContainer>` / FAQ accordion are the only client islands. Lighthouse 95+ on all four scores per Plan §1. Single amber CTA per page in `<main>` (the Phase 1.05 navbar amber is chrome and exempt). No new motion patterns beyond Phase 1.04's `<AnimateIn>` + `<StaggerContainer>`. No third-party scripts in Part 1.

---

## 2. Page-level decisions (shared across both templates)

### 2.1 Section order

**Audience landing** uses the eight-section order from the prompt unchanged. Reasoning: hero (orient + first impression) → "who this is for" (confirm fit) → services grid (the page's primary action: pick a service) → featured projects (proof of work, breaks up text density) → "Why Sunset Services" (audience-level reasons-to-believe) → social proof (third-party validation) → FAQ (handle objections) → CTA (the close). The services grid sits high (position 3) on purpose — visitors who landed from Google paid search are highest-intent at first scroll and want the service list, not more proof.

**Service detail** uses the nine-section order from the prompt unchanged. Reasoning: hero (orient) → what's included (answer "what do I get") → process (answer "how does this work") → why us (audience-accent reasons-to-believe at the service level) → pricing block (answer "how much" — conditional per D5) → featured projects (visual proof) → FAQ (handle objections; primary SEO surface) → related services (cross-sell or within-audience next-step) → CTA (close). Pricing sits mid-page so visitors who care about cost see it without scrolling past the proof points; visitors who don't care scroll past it.

### 2.2 Surface alternation

Per Phase 1.03 §9: never two adjacent same-surface bands. Hero is photographic and counts as its own surface; the section after must contrast.

**Audience landing — surface map:**

| # | Section | Surface | Rationale |
|---|---|---|---|
| 1 | Audience hero | photo + dark gradient | own surface; navbar enters its translucent over-hero state |
| 2 | Who this is for | `--color-bg` (white) | clean contrast to hero |
| 3 | Services grid | `--color-bg-cream` | warm surface lifts photo cards; the most important module gets a distinct band |
| 4 | Featured projects | `--color-bg` (white) | project tiles read better on white (their own gradient overlays carry the warmth) |
| 5 | Why Sunset Services | `--color-bg-cream` | alternation; cream gives icon tiles a soft frame |
| 6 | Social proof | `--color-bg` (white) | testimonial cards already use cream interior; white outer keeps it from going muddy |
| 7 | FAQ | `--color-bg-cream` | alternation; the accordion lines read clearly on cream |
| 8 | CTA | `--color-bg-cream` (default) **or** `--color-bg-charcoal` (per D6, Hardscape variant only — see §3.8) | locks the amber moment with surface contrast |

For Hardscape only: a `--color-bg-charcoal` Unilock band sits between section 5 (Why Sunset Services) and section 6 (Social proof). That puts charcoal between two cream surfaces — the contrast is the point of the band. See §3X.

**Service detail — surface map:**

| # | Section | Surface | Rationale |
|---|---|---|---|
| 1 | Service hero | photo + dark gradient | own surface |
| 2 | What's included | `--color-bg` (white) | airy, scannable list reads best on white |
| 3 | Our process | `--color-bg-cream` | numbered cards on cream feel like a guided sequence |
| 4 | Why us for this service | `--color-bg` (white) | small-tile grid on white |
| 5 | Pricing block | `--color-bg-cream` | warm callout surface; the block disappears (per D5–D) without breaking alternation because `<section>` collapses to zero height |
| 6 | Featured projects | `--color-bg` (white) | same reasoning as audience landing |
| 7 | FAQ | `--color-bg-cream` | alternation; the accordion's hairline rules read cleanly on cream |
| 8 | Related services | `--color-bg` (white) | small tile cards on white before the close |
| 9 | CTA | `--color-bg-cream` | alternation; amber CTA sits on cream |

**Pricing-block fallback.** When D5–D hides the pricing block on a service page (no Erick-confirmed price yet), the alternation re-resolves: section 4 (`--color-bg` white) is followed directly by section 6 (`--color-bg` white). To prevent a double-white run, the **fallback "How pricing works" explainer** (per §4.5) is rendered instead — a smaller cream band with three factors and a CTA-link. The block never hard-removes itself; it always renders one of two states. This keeps alternation invariant.

### 2.3 Amber discipline check

Restated for these templates:

- **Single body amber CTA per page.** It lives in section 8 (audience landing) or section 9 (service detail) — the page's final CTA section. No exceptions.
- **Hero primary CTA is `Primary green × lg`**, identical to homepage rule.
- **Hero secondary CTA is `Ghost × lg` on-dark**, per Phase 1.06 §3.4 on-dark modifier (white text + white border + transparent background).
- **Navbar amber is chrome** (per Phase 1.05 §1) and does not count against the page's amber budget.
- **`.card--featured` is not used on either template** (see §2.4) — so the amber-decorative-border-vs-amber-CTA conflict from Phase 1.03 D2 cannot occur.

Verified at Code-time by: `document.querySelectorAll('main .btn--amber').length === 1` per page.

### 2.4 Featured-card uses

**Decision: `.card--featured` is not used on either template.** Reasoning: Phase 1.06 banned it on the homepage. The audience-landing's services grid is uniform tiles by design — highlighting one service over the others would imply a hierarchy Erick has not confirmed. The service-detail's "Why us" tiles, "What's included" items, and process steps are all uniform structures where promoting a single item visually would distort the read. If a future page (e.g., a packages page) wants featured-card emphasis, it gets a fresh design pass.

Surfaced as Decision **D9 — Featured-card use** below for ratification.

### 2.5 Reduced-motion behavior

Restated from Phase 1.03 §7.7 as it applies here:

- Hero never animates (LCP discipline) — reduced-motion does not change hero behavior.
- All `<AnimateIn>` and `<StaggerContainer>` entrances become opacity-only at `--motion-fast` (120ms) when `prefers-reduced-motion: reduce`. The components consult `MotionConfig reducedMotion="user"` from Phase 1.04 — no per-component branching.
- Photo-card image scale on hover is removed; shadow-on-hover still applies.
- FAQ accordion expand/collapse: keeps a 120ms opacity fade on the panel; height transition is removed (panel is `display: block` immediately on open).
- Process-section's connecting line/rule (§4.3) is a static SVG path — no motion to remove.
- Hardscape Unilock module's badge has no motion at any time.

### 2.6 Navbar over-hero state

**Both** the audience-landing hero and the service-detail hero trigger the navbar's translucent over-hero state from Phase 1.05 §3.2 State B (`backdrop-filter: blur(8px)` + `background: rgba(255,255,255,0.78)`). Reasoning: both heroes are full-bleed photographic, identical to the homepage hero in surface character. The navbar must read against the photo without the white solid bar competing.

**Trigger contract for Code:** the page component (`src/app/[locale]/[audience]/page.tsx` and `src/app/[locale]/[audience]/[service]/page.tsx`) sets `data-over-hero="true"` on `<main>`. The navbar's client-side scroll listener watches for that attribute and, when present, applies State B until the user has scrolled past the hero (`scrollY > heroHeight - navHeight`). When `data-over-hero` is absent or after the scroll threshold, the navbar reverts to State A (solid white) on regular pages or State C (solid white + soft shadow) when scrolled. Threshold value: `heroHeight - 72`. The hero element exposes its height via `data-hero-height="<px>"` on its outermost wrapper; the navbar reads it on mount.

This contract is the same shape Phase 1.05 specified for the homepage — these two templates extend the same mechanism without inventing a new one.

### 2.7 Container widths

Both templates use `--container-default` (1200px) for body sections by default. Exceptions:

- **Hero** (both templates): `--container-wide` (1440px) so the hero photo wrapper aligns with the navbar.
- **CTA section** (both templates): `--container-narrow` (960px) so the headline + CTA cluster reads as a tight close, not as a band.
- **Pricing block** (service detail): `--container-narrow` (960px) — same close-cluster reasoning.

### 2.8 Vertical padding

Per Phase 1.03 §4.2: every body section uses `py-20` desktop / `py-14` mobile. Heroes are exceptions:

- **Audience hero:** `min-height: 60vh` desktop (clamp 480–720px) / `min-height: 50vh` mobile (clamp 360–520px). Vertical padding inside the hero photo: `py-24` desktop / `py-16` mobile, content bottom-anchored (text sits in the lower 50% of the photo so the gradient does its work).
- **Service hero:** `min-height: 52vh` desktop (clamp 420–600px) / `min-height: 44vh` mobile (clamp 320–460px). Same internal padding rules. Smaller than audience hero — service-detail visitors are higher-intent and want to get to "what's included" faster.

The size hierarchy is intentional: homepage hero (full vh) > audience hero (60 vh) > service hero (52 vh). Each step deeper into the site, the hero shrinks.

---

## 3. Audience landing — Template A (master)

The master design that applies to all three audience variants (Residential, Commercial, Hardscape). Eight subsections, one per content section. Each subsection contains an annotated SVG mockup at desktop (≥1280px) and mobile (≤480px) widths plus a spec block.

### 3.1 Audience hero

#### Desktop SVG (≥1280px)

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 720" width="100%" role="img" aria-label="Audience hero — desktop">
  <style>
    .eb { font-family: 'Manrope', system-ui, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; }
    .h1 { font-family: 'Manrope', system-ui, sans-serif; font-size: 56px; font-weight: 700; letter-spacing: -0.02em; }
    .sub{ font-family: 'Onest',  system-ui, sans-serif; font-size: 20px; font-weight: 400; }
    .crumb { font-family: 'Onest', system-ui, sans-serif; font-size: 14px; font-weight: 500; }
    .btnL { font-family: 'Manrope', system-ui, sans-serif; font-size: 17px; font-weight: 600; }
    .ann{ font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #4A4A4A; font-style: italic; }
    .lbl{ font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #6B6B6B; }
    .ruler { stroke: #B47821; stroke-width: 1; stroke-dasharray: 3 3; }
    .rulerTxt { font-family: 'Onest', system-ui, sans-serif; font-size: 10px; fill: #B47821; }
  </style>
  <!-- Photo placeholder + dark gradient -->
  <rect width="1440" height="720" fill="#3F5C2F"/>
  <pattern id="stripe" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
    <rect width="14" height="14" fill="#3F5C2F"/>
    <line x1="0" y1="0" x2="0" y2="14" stroke="#4D6E3D" stroke-width="6"/>
  </pattern>
  <rect width="1440" height="720" fill="url(#stripe)"/>
  <rect width="1440" height="720" fill="url(#heroGrad)"/>
  <!-- Navbar in over-hero state -->
  <rect width="1440" height="72" fill="rgba(255,255,255,0.78)"/>
  <text x="48" y="46" class="h1" font-size="22" fill="#1A3617">Sunset Services</text>
  <text x="1240" y="46" class="lbl" fill="#1A1A1A">[ navbar — Phase 1.05 ]</text>
  <text x="48" y="86" class="ann" fill="#FAF7F1">data-over-hero="true" → translucent + backdrop-blur 8px (Phase 1.05 §3.2 State B)</text>

  <!-- Photo slot label -->
  <text x="1280" y="120" class="lbl" fill="#FAF7F1" text-anchor="end">[ AUDIENCE HERO PHOTO · 16:9 · ≤350KB AVIF ]</text>
  <text x="1280" y="138" class="lbl" fill="#FAF7F1" text-anchor="end">slot: hero.{audience}.16x9 · golden-hour, audience-appropriate</text>

  <!-- Content (lower 50% of photo) -->
  <g transform="translate(120,400)">
    <!-- Breadcrumb -->
    <text x="0" y="0" class="crumb" fill="rgba(250,247,241,0.7)">Home  ›  Residential</text>
    <text x="900" y="0" class="ann" fill="#FAF7F1">--text-body-sm · text-on-dark @ 70% opacity</text>
    <!-- Kicker -->
    <text x="0" y="36" class="eb" fill="#8FB67A">RESIDENTIAL</text>
    <text x="900" y="36" class="ann" fill="#FAF7F1">audience-accent token (variant-specific — see 3X)</text>
    <!-- H1 -->
    <text x="0" y="100" class="h1" fill="#FAF7F1">Outdoor spaces that feel like home.</text>
    <text x="900" y="76" class="ann" fill="#FAF7F1">--text-h1 · ≤8 words EN / ≤10 ES · text-wrap: balance</text>
    <!-- Subhead -->
    <text x="0" y="148" class="sub" fill="rgba(250,247,241,0.92)">Lawn care, landscape design, and seasonal services for DuPage County homes.</text>
    <text x="0" y="172" class="sub" fill="rgba(250,247,241,0.92)">Trusted by 1,200+ neighbors across Aurora, Naperville, and Wheaton.</text>
    <text x="900" y="172" class="ann" fill="#FAF7F1">≤30 words EN / ≤36 ES · --text-body-lg</text>
    <!-- Buttons -->
    <g transform="translate(0,210)">
      <rect width="216" height="52" rx="8" fill="#4D8A3F"/>
      <text x="108" y="33" class="btnL" fill="#FFFFFF" text-anchor="middle">Get a Free Estimate</text>
      <text x="108" y="80" class="ann" fill="#FAF7F1" text-anchor="middle">Primary green × lg</text>
    </g>
    <g transform="translate(240,210)">
      <rect width="240" height="52" rx="8" fill="none" stroke="#FAF7F1" stroke-width="1.5"/>
      <text x="120" y="33" class="btnL" fill="#FAF7F1" text-anchor="middle">View Residential Projects</text>
      <text x="120" y="80" class="ann" fill="#FAF7F1" text-anchor="middle">Ghost × lg on-dark</text>
    </g>
  </g>

  <!-- Right-edge ruler -->
  <line x1="1380" y1="72" x2="1380" y2="720" class="ruler"/>
  <text x="1392" y="396" class="rulerTxt" transform="rotate(-90,1392,396)">min-height: 60vh · clamp(480, 60vh, 720)</text>

  <defs>
    <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="rgba(0,0,0,0)"/>
      <stop offset="0.5" stop-color="rgba(0,0,0,0.20)"/>
      <stop offset="1" stop-color="rgba(0,0,0,0.72)"/>
    </linearGradient>
  </defs>
</svg>

#### Mobile SVG (≤480px)

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 640" width="100%" role="img" aria-label="Audience hero — mobile">
  <style>
    .eb { font-family: 'Manrope', system-ui, sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.12em; }
    .h1m { font-family: 'Manrope', system-ui, sans-serif; font-size: 36px; font-weight: 700; letter-spacing: -0.02em; }
    .subm{ font-family: 'Onest', system-ui, sans-serif; font-size: 17px; font-weight: 400; }
    .crumb { font-family: 'Onest', system-ui, sans-serif; font-size: 13px; font-weight: 500; }
    .btnLm { font-family: 'Manrope', system-ui, sans-serif; font-size: 17px; font-weight: 600; }
    .ann{ font-family: 'Onest', system-ui, sans-serif; font-size: 10px; fill: #FAF7F1; font-style: italic; }
  </style>
  <rect width="480" height="640" fill="#3F5C2F"/>
  <pattern id="stripeM" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
    <rect width="10" height="10" fill="#3F5C2F"/>
    <line x1="0" y1="0" x2="0" y2="10" stroke="#4D6E3D" stroke-width="4"/>
  </pattern>
  <rect width="480" height="640" fill="url(#stripeM)"/>
  <rect width="480" height="640" fill="url(#heroGradM)"/>
  <!-- Mobile navbar -->
  <rect width="480" height="64" fill="rgba(255,255,255,0.78)"/>
  <text x="16" y="40" font-family="Manrope" font-size="18" font-weight="700" fill="#1A3617">Sunset</text>
  <text x="448" y="40" class="ann" fill="#1A1A1A" text-anchor="end">☎ ☰</text>
  <!-- Content bottom-anchored -->
  <g transform="translate(20,330)">
    <text x="0" y="0" class="crumb" fill="rgba(250,247,241,0.7)">Home › Residential</text>
    <text x="0" y="32" class="eb" fill="#8FB67A">RESIDENTIAL</text>
    <text x="0" y="78" class="h1m" fill="#FAF7F1">Outdoor spaces</text>
    <text x="0" y="118" class="h1m" fill="#FAF7F1">that feel like home.</text>
    <text x="0" y="156" class="subm" fill="rgba(250,247,241,0.92)">Lawn care, landscape design,</text>
    <text x="0" y="178" class="subm" fill="rgba(250,247,241,0.92)">and seasonal services for DuPage.</text>
    <g transform="translate(0,200)">
      <rect width="440" height="52" rx="8" fill="#4D8A3F"/>
      <text x="220" y="33" class="btnLm" fill="#FFFFFF" text-anchor="middle">Get a Free Estimate</text>
    </g>
    <g transform="translate(0,264)">
      <rect width="440" height="52" rx="8" fill="none" stroke="#FAF7F1" stroke-width="1.5"/>
      <text x="220" y="33" class="btnLm" fill="#FAF7F1" text-anchor="middle">View Residential Projects</text>
    </g>
  </g>
  <text x="20" y="624" class="ann" fill="#FAF7F1">min-height: 50vh · clamp(360, 50vh, 520) · CTAs full-width on mobile</text>
  <defs>
    <linearGradient id="heroGradM" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="rgba(0,0,0,0)"/>
      <stop offset="0.45" stop-color="rgba(0,0,0,0.10)"/>
      <stop offset="1" stop-color="rgba(0,0,0,0.78)"/>
    </linearGradient>
  </defs>
</svg>

#### Spec block

| Field | Value |
|---|---|
| Surface | photo + bottom-anchored dark gradient overlay (`linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.20) 50%, rgba(0,0,0,0.72) 100%)`) |
| Container | `--container-wide` (1440px) for the photo wrapper; content cluster sits in `--container-default` (1200px) inside it, left-aligned |
| Vertical padding | `min-height: clamp(480px, 60vh, 720px)` desktop / `clamp(360px, 50vh, 520px)` mobile; internal `py-24` desktop / `py-16` mobile, content bottom-anchored |
| Section header treatment | Breadcrumb (`--text-body-sm` `--color-text-on-dark` @ 70% opacity) → kicker (eyebrow per Phase 1.03 §3.2 in audience-accent token) → H1 (`--text-h1` `--color-text-on-dark`, `text-wrap: balance`) → subhead (`--text-body-lg` `--color-text-on-dark` @ 92% opacity) → CTA pair |
| Content layout | Single column, max content-width 720px desktop / full-width mobile; vertical gap `--spacing-3` (kicker→H1), `--spacing-6` (H1→subhead), `--spacing-10` (subhead→buttons); button gap `--spacing-4` desktop (side-by-side) / `--spacing-3` mobile (stacked, full-width) |
| Component tokens | `btn--primary btn--lg`, `btn--ghost btn--lg` with on-dark modifier (white border 1.5px, white label, transparent fill — Phase 1.06 §3.4) |
| Motion | **None.** First-paint render. LCP discipline (Phase 1.03 §7.7 + Phase 1.06 §3). Hover on CTAs only (Phase 1.03 §7.5). |
| i18n length budget | H1 ≤ 8 words EN / ≤ 10 words ES. Kicker fixed (audience name). Subhead ≤ 30 words EN / ≤ 36 words ES. CTA labels: EN "Get a Free Estimate" (21 chars) / ES "Solicita un Presupuesto Gratis" (31 chars) — button width fluid, never fixed (Phase 1.03 §3.5). |
| A11y | `<header>` landmark wraps the hero. Breadcrumb is a `<nav aria-label="Breadcrumb">` with `<ol>`. H1 is the page's only `<h1>`. Photo is decorative when there's no caption (`alt=""`); when audience-photographic story matters, alt is "Curated front lawn with mature plantings, Naperville home" (or per-audience equivalent). Hero photo + gradient composite contrast verified ≥4.5:1 in the lower 50% of the frame (Phase 1.03 §2.2 row 26). |

#### Hero per-audience copy placeholders

| Audience | H1 (EN, ≤8 words) | H1 (ES, ≤10 words) | Kicker | Subhead (EN, ≤30 words) |
|---|---|---|---|---|
| Residential | Outdoor spaces that feel like home. | Espacios al aire libre que se sienten como hogar. | RESIDENTIAL / RESIDENCIAL | Lawn care, landscape design, and seasonal services for DuPage County homes. Trusted by 1,200+ neighbors across Aurora, Naperville, and Wheaton. |
| Commercial | Property care that earns repeat contracts. | Cuidado de propiedades que merece contratos. | COMMERCIAL / COMERCIAL | Maintenance, snow response, and turf programs for office parks, HOAs, and retail across the western suburbs. COIs on file before day one. |
| Hardscape | Built to last twenty-five years and counting. | Construido para durar veinticinco años y contando. | HARDSCAPE DIVISION / DIVISIÓN HARDSCAPE | Patios, walls, fire features, and outdoor kitchens — installed by a Unilock Authorized Contractor with two decades of paver experience. |

CTA targets:
- Primary: `/{locale}/request-quote/?audience={residential|commercial|hardscape}` (Part 1: query-string ignored, Part 2: pre-fills wizard Step 1).
- Secondary: `/{locale}/projects/?audience={…}` (Part 1: 404s by design — same pattern as homepage projects teaser; Part 2: filtered view).

#### LCP optimization spec (mirrors Phase 1.06 §3 hero)

```tsx
<Image
  src="/images/hero/{audience}.jpg"
  alt=""
  fill
  priority
  fetchPriority="high"
  sizes="100vw"
  placeholder="blur"
  blurDataURL={...}    // generated at build time per photo
  quality={82}
  className="object-cover"
/>
```

Source asset: 1920×1080 AVIF + WebP fallbacks, ≤ 350KB at 1920w. Crops cleanly to 4:3 mobile (object-position locked per audience — see §6) and 9:16 OG.

---

### 3.2 Who this is for

#### Desktop SVG

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 380" width="100%" role="img" aria-label="Who this is for — desktop">
  <style>
    .eb { font-family: 'Manrope', system-ui, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.12em; fill: #2F5D27; }
    .h2 { font-family: 'Manrope', system-ui, sans-serif; font-size: 40px; font-weight: 700; letter-spacing: -0.015em; fill: #1A1A1A; }
    .body{ font-family: 'Onest', system-ui, sans-serif; font-size: 17px; font-weight: 400; fill: #4A4A4A; }
    .pill{ font-family: 'Manrope', system-ui, sans-serif; font-size: 13px; font-weight: 600; fill: #2F5D27; }
    .ann{ font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #6B6B6B; font-style: italic; }
  </style>
  <rect width="1440" height="380" fill="#FFFFFF"/>
  <g transform="translate(120,80)">
    <text x="0" y="0" class="eb">FOR DUPAGE HOMEOWNERS</text>
    <text x="0" y="56" class="h2">Who this is for.</text>
    <text x="0" y="108" class="body">If you own a home in Aurora, Naperville, Wheaton, or Naperville and want one team to handle</text>
    <text x="0" y="132" class="body">the lawn, the patio, and the snow — without juggling three vendors — this page is for you.</text>
    <!-- Trust pills -->
    <g transform="translate(0,180)">
      <rect width="172" height="36" rx="18" fill="#DCE8D5"/>
      <text x="86" y="23" class="pill" text-anchor="middle">Same crew every visit</text>
    </g>
    <g transform="translate(188,180)">
      <rect width="148" height="36" rx="18" fill="#DCE8D5"/>
      <text x="74" y="23" class="pill" text-anchor="middle">Bilingual EN · ES</text>
    </g>
    <g transform="translate(352,180)">
      <rect width="160" height="36" rx="18" fill="#DCE8D5"/>
      <text x="80" y="23" class="pill" text-anchor="middle">Free 48-hr estimate</text>
    </g>
    <g transform="translate(528,180)">
      <rect width="160" height="36" rx="18" fill="#DCE8D5"/>
      <text x="80" y="23" class="pill" text-anchor="middle">25 years in business</text>
    </g>
  </g>
  <text x="120" y="350" class="ann">Surface --color-bg · py-20 desktop · container-default · pills use badge primitive (Phase 1.03 §6.5) Subtle variant, sized md, fully rounded</text>
</svg>

#### Mobile SVG

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480" width="100%" role="img" aria-label="Who this is for — mobile">
  <style>
    .ebm { font-family: 'Manrope', system-ui, sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.12em; fill: #2F5D27; }
    .h2m { font-family: 'Manrope', system-ui, sans-serif; font-size: 28px; font-weight: 700; letter-spacing: -0.015em; fill: #1A1A1A; }
    .bodym{ font-family: 'Onest', system-ui, sans-serif; font-size: 16px; font-weight: 400; fill: #4A4A4A; }
    .pillm{ font-family: 'Manrope', system-ui, sans-serif; font-size: 13px; font-weight: 600; fill: #2F5D27; }
    .annm{ font-family: 'Onest', system-ui, sans-serif; font-size: 10px; fill: #6B6B6B; font-style: italic; }
  </style>
  <rect width="480" height="480" fill="#FFFFFF"/>
  <g transform="translate(20,56)">
    <text x="0" y="0" class="ebm">FOR DUPAGE HOMEOWNERS</text>
    <text x="0" y="44" class="h2m">Who this is for.</text>
    <text x="0" y="92" class="bodym">If you own a home in Aurora,</text>
    <text x="0" y="114" class="bodym">Naperville, or Wheaton and want</text>
    <text x="0" y="136" class="bodym">one team for lawn, patio, and</text>
    <text x="0" y="158" class="bodym">snow — this page is for you.</text>
    <!-- Pills wrap, 2 rows -->
    <g transform="translate(0,200)">
      <rect width="180" height="34" rx="17" fill="#DCE8D5"/>
      <text x="90" y="22" class="pillm" text-anchor="middle">Same crew every visit</text>
    </g>
    <g transform="translate(188,200)">
      <rect width="146" height="34" rx="17" fill="#DCE8D5"/>
      <text x="73" y="22" class="pillm" text-anchor="middle">Bilingual EN · ES</text>
    </g>
    <g transform="translate(0,244)">
      <rect width="156" height="34" rx="17" fill="#DCE8D5"/>
      <text x="78" y="22" class="pillm" text-anchor="middle">Free 48-hr estimate</text>
    </g>
    <g transform="translate(164,244)">
      <rect width="160" height="34" rx="17" fill="#DCE8D5"/>
      <text x="80" y="22" class="pillm" text-anchor="middle">25 years in business</text>
    </g>
  </g>
  <text x="20" y="448" class="annm">py-14 mobile · pills wrap to 2 rows when total width >container</text>
</svg>

#### Spec block

| Field | Value |
|---|---|
| Surface | `--color-bg` (white) |
| Container | `--container-default` (1200px) |
| Vertical padding | `py-20` desktop / `py-14` mobile |
| Section header | Eyebrow (`--text-eyebrow`-style, audience-accent token color) + H2 (`--text-h2`). No subhead — the body paragraph below replaces it. |
| Content layout | Two-block stack: 720px-max prose paragraph (`--text-body`), then horizontal pill row with `flex; flex-wrap: wrap; gap: var(--spacing-3)`. Pills wrap to 2 rows on mobile. |
| Component tokens | `badge` Subtle variant md (Phase 1.03 §6.5), fully rounded (`border-radius: 9999px`). |
| Motion | `<AnimateIn variant="fade-up">` on the section. Pills inside a nested `<StaggerContainer>` with 4 `<StaggerItem>`s, 80ms stagger. |
| i18n length budget | H2 ≤ 5 words EN / ≤ 6 words ES. Body paragraph ≤ 50 words EN / ≤ 60 words ES. Each pill ≤ 4 words EN / ≤ 5 words ES — pill width is content-driven so longer ES values just push the row taller. |
| A11y | Section is a `<section aria-labelledby="qualifier-h2">`. Pills are static text (not buttons or links) — they're trust markers, not interactive elements. |

---

### 3.3 Services grid

The most important module on the audience landing. Visitors landing here from Google paid search either click a service tile or bounce.

#### Desktop SVG (Residential — 6 tiles, 3×2)

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 980" width="100%" role="img" aria-label="Services grid — desktop, 6 tiles">
  <style>
    .eb { font-family: 'Manrope', system-ui, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.12em; fill: #2F5D27; }
    .h2 { font-family: 'Manrope', system-ui, sans-serif; font-size: 40px; font-weight: 700; letter-spacing: -0.015em; fill: #1A1A1A; }
    .sub{ font-family: 'Onest', system-ui, sans-serif; font-size: 17px; font-weight: 400; fill: #4A4A4A; }
    .tile{ font-family: 'Manrope', system-ui, sans-serif; font-size: 22px; font-weight: 700; fill: #FAF7F1; }
    .teaser{ font-family: 'Onest', system-ui, sans-serif; font-size: 14px; font-weight: 400; fill: rgba(250,247,241,0.85); }
    .ann{ font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #6B6B6B; font-style: italic; }
  </style>
  <rect width="1440" height="980" fill="#FAF7F1"/>
  <g transform="translate(120,80)">
    <text x="0" y="0" class="eb">SIX SERVICES · ONE CREW</text>
    <text x="0" y="56" class="h2">Services for residential homes.</text>
    <text x="0" y="100" class="sub">Pick a service to see what's included, our process, and recent projects.</text>
  </g>
  <!-- 3x2 grid, 4:3 photo cards with overlay -->
  <g transform="translate(120,240)">
    <!-- Tile 1 -->
    <g>
      <rect width="384" height="288" rx="16" fill="#3F5C2F"/>
      <rect width="384" height="288" rx="16" fill="url(#tileStripe)"/>
      <rect width="384" height="288" rx="16" fill="url(#tileGrad)"/>
      <text x="24" y="232" class="tile">Lawn Care</text>
      <text x="24" y="260" class="teaser">Mowing, edging, treatments. Weekly.</text>
      <g transform="translate(336,244)">
        <circle r="18" fill="rgba(255,255,255,0.12)"/>
        <path d="M-6 -6 L6 0 L-6 6 Z" fill="#FAF7F1"/>
      </g>
    </g>
    <!-- Tile 2 -->
    <g transform="translate(408,0)">
      <rect width="384" height="288" rx="16" fill="#3F5C2F"/>
      <rect width="384" height="288" rx="16" fill="url(#tileStripe)"/>
      <rect width="384" height="288" rx="16" fill="url(#tileGrad)"/>
      <text x="24" y="232" class="tile">Landscape Design</text>
      <text x="24" y="260" class="teaser">Custom plans for full-yard transformations.</text>
      <g transform="translate(336,244)"><circle r="18" fill="rgba(255,255,255,0.12)"/><path d="M-6 -6 L6 0 L-6 6 Z" fill="#FAF7F1"/></g>
    </g>
    <!-- Tile 3 -->
    <g transform="translate(816,0)">
      <rect width="384" height="288" rx="16" fill="#3F5C2F"/>
      <rect width="384" height="288" rx="16" fill="url(#tileStripe)"/>
      <rect width="384" height="288" rx="16" fill="url(#tileGrad)"/>
      <text x="24" y="232" class="tile">Tree Services</text>
      <text x="24" y="260" class="teaser">Pruning, removal, stump grinding.</text>
      <g transform="translate(336,244)"><circle r="18" fill="rgba(255,255,255,0.12)"/><path d="M-6 -6 L6 0 L-6 6 Z" fill="#FAF7F1"/></g>
    </g>
    <!-- Tile 4 -->
    <g transform="translate(0,312)">
      <rect width="384" height="288" rx="16" fill="#3F5C2F"/>
      <rect width="384" height="288" rx="16" fill="url(#tileStripe)"/>
      <rect width="384" height="288" rx="16" fill="url(#tileGrad)"/>
      <text x="24" y="232" class="tile">Sprinkler Systems</text>
      <text x="24" y="260" class="teaser">Install, repair, winterize.</text>
      <g transform="translate(336,244)"><circle r="18" fill="rgba(255,255,255,0.12)"/><path d="M-6 -6 L6 0 L-6 6 Z" fill="#FAF7F1"/></g>
    </g>
    <!-- Tile 5 -->
    <g transform="translate(408,312)">
      <rect width="384" height="288" rx="16" fill="#3F5C2F"/>
      <rect width="384" height="288" rx="16" fill="url(#tileStripe)"/>
      <rect width="384" height="288" rx="16" fill="url(#tileGrad)"/>
      <text x="24" y="232" class="tile">Snow Removal</text>
      <text x="24" y="260" class="teaser">2" trigger, 24-hr response.</text>
      <g transform="translate(336,244)"><circle r="18" fill="rgba(255,255,255,0.12)"/><path d="M-6 -6 L6 0 L-6 6 Z" fill="#FAF7F1"/></g>
    </g>
    <!-- Tile 6 -->
    <g transform="translate(816,312)">
      <rect width="384" height="288" rx="16" fill="#3F5C2F"/>
      <rect width="384" height="288" rx="16" fill="url(#tileStripe)"/>
      <rect width="384" height="288" rx="16" fill="url(#tileGrad)"/>
      <text x="24" y="232" class="tile">Seasonal Cleanup</text>
      <text x="24" y="260" class="teaser">Spring + fall, leaves, prep.</text>
      <g transform="translate(336,244)"><circle r="18" fill="rgba(255,255,255,0.12)"/><path d="M-6 -6 L6 0 L-6 6 Z" fill="#FAF7F1"/></g>
    </g>
  </g>
  <text x="120" y="940" class="ann">Surface --color-bg-cream · 3-col grid · gap-8 (32px) · 4:3 photo cards with --color-overlay-50 → transparent gradient (D2 = 4:3 photo overlay) · whole tile is the link target</text>
  <defs>
    <linearGradient id="tileGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.4" stop-color="rgba(0,0,0,0)"/>
      <stop offset="1" stop-color="rgba(0,0,0,0.7)"/>
    </linearGradient>
    <pattern id="tileStripe" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
      <rect width="10" height="10" fill="#3F5C2F"/>
      <line x1="0" y1="0" x2="0" y2="10" stroke="#4D6E3D" stroke-width="4"/>
    </pattern>
  </defs>
</svg>

#### Mobile SVG (2-col)

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 1080" width="100%" role="img" aria-label="Services grid — mobile, 2 columns">
  <style>
    .ebm { font-family: 'Manrope', system-ui, sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.12em; fill: #2F5D27; }
    .h2m { font-family: 'Manrope', system-ui, sans-serif; font-size: 28px; font-weight: 700; letter-spacing: -0.015em; fill: #1A1A1A; }
    .subm{ font-family: 'Onest', system-ui, sans-serif; font-size: 16px; font-weight: 400; fill: #4A4A4A; }
    .tilem{ font-family: 'Manrope', system-ui, sans-serif; font-size: 16px; font-weight: 700; fill: #FAF7F1; }
    .annm{ font-family: 'Onest', system-ui, sans-serif; font-size: 10px; fill: #6B6B6B; font-style: italic; }
  </style>
  <rect width="480" height="1080" fill="#FAF7F1"/>
  <g transform="translate(20,56)">
    <text x="0" y="0" class="ebm">SIX SERVICES · ONE CREW</text>
    <text x="0" y="40" class="h2m">Services for</text>
    <text x="0" y="74" class="h2m">residential homes.</text>
    <text x="0" y="118" class="subm">Pick a service to see what's</text>
    <text x="0" y="140" class="subm">included and recent work.</text>
  </g>
  <!-- 2-col grid -->
  <g transform="translate(20,208)">
    <!-- 6 tiles -->
    <g>
      <rect width="212" height="160" rx="16" fill="#3F5C2F"/>
      <rect width="212" height="160" rx="16" fill="url(#tileGradM)"/>
      <text x="16" y="138" class="tilem">Lawn Care</text>
    </g>
    <g transform="translate(228,0)">
      <rect width="212" height="160" rx="16" fill="#3F5C2F"/>
      <rect width="212" height="160" rx="16" fill="url(#tileGradM)"/>
      <text x="16" y="138" class="tilem">Landscape Design</text>
    </g>
    <g transform="translate(0,184)">
      <rect width="212" height="160" rx="16" fill="#3F5C2F"/>
      <rect width="212" height="160" rx="16" fill="url(#tileGradM)"/>
      <text x="16" y="138" class="tilem">Tree Services</text>
    </g>
    <g transform="translate(228,184)">
      <rect width="212" height="160" rx="16" fill="#3F5C2F"/>
      <rect width="212" height="160" rx="16" fill="url(#tileGradM)"/>
      <text x="16" y="138" class="tilem">Sprinklers</text>
    </g>
    <g transform="translate(0,368)">
      <rect width="212" height="160" rx="16" fill="#3F5C2F"/>
      <rect width="212" height="160" rx="16" fill="url(#tileGradM)"/>
      <text x="16" y="138" class="tilem">Snow Removal</text>
    </g>
    <g transform="translate(228,368)">
      <rect width="212" height="160" rx="16" fill="#3F5C2F"/>
      <rect width="212" height="160" rx="16" fill="url(#tileGradM)"/>
      <text x="16" y="138" class="tilem">Cleanup</text>
    </g>
  </g>
  <text x="20" y="800" class="annm">Mobile drops the 1-line teaser to keep tile heights tight; service name only.</text>
  <defs>
    <linearGradient id="tileGradM" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.4" stop-color="rgba(0,0,0,0)"/>
      <stop offset="1" stop-color="rgba(0,0,0,0.75)"/>
    </linearGradient>
  </defs>
</svg>

#### Spec block

| Field | Value |
|---|---|
| Surface | `--color-bg-cream` |
| Container | `--container-default` (1200px) |
| Vertical padding | `py-20` desktop / `py-14` mobile |
| Section header | Eyebrow (audience-accent) + H2 (`--text-h2`) + 1-line subhead (`--text-body` `--color-text-secondary`) |
| Content layout | **Residential (6 tiles): 3 cols × 2 rows desktop, 2 cols × 3 rows mobile.** **Commercial (4 tiles): 2 cols × 2 rows desktop AND mobile** (mobile keeps 2-col so tiles don't stretch; tile aspect is fluid). **Hardscape (6 tiles): 3 × 2 desktop, 2 × 3 mobile** (same as Residential). Gap: `--spacing-8` (32px) desktop / `--spacing-4` (16px) mobile. |
| Tile aspect ratio + treatment | **4:3 photo card with bottom-up dark gradient overlay** (`--color-overlay-50` → transparent, 60% bottom band). See Decision **D2**. |
| Tile content (desktop) | Service name (`--text-h3` weight 700, `--color-text-on-dark`) at lower-left + 1-line teaser (`--text-body-sm` weight 400, `--color-text-on-dark` 85% opacity) under it + arrow chip (lucide `ArrowUpRight` 18px in a 36×36 `rgba(255,255,255,0.12)` circle) at lower-right. |
| Tile content (mobile) | Service name only at lower-left. Teaser dropped (saves vertical). Arrow chip kept. |
| Tile component | `card--photo` from Phase 1.03 §6.2. Whole tile is `<a href="/{locale}/{audience}/{service-slug}/">` — entire card is the link target (`a:has(.card--photo)` pattern; the card is non-interactive itself). |
| Hover behavior | Image `scale(1.03)` over `--motion-slow` `--easing-soft`; arrow chip background `rgba(255,255,255,0.12) → 0.22` over `--motion-fast`; card shadow `card → hover`. Reduced-motion: image scale removed, shadow + chip color stay (Phase 1.03 §7.7). |
| Link target | `/{locale}/{audience}/{service-slug}/` per Plan §3 routes. Each tile carries a `Service` schema reference picked up by the page's `ItemList` JSON-LD (see §5). |
| Motion | `<AnimateIn variant="fade-up">` on the section header. `<StaggerContainer>` wraps the tile grid with 6 `<StaggerItem>`s (or 4 for Commercial), 80ms stagger. |
| i18n length budget | Service-name labels ≤ 3 words EN / ≤ 4 words ES. Teaser ≤ 7 words EN / ≤ 9 words ES. Per-locale label values live in the service seed table (§4.10) so all 16 services share a single source of truth. |
| A11y | Section is `<section aria-labelledby="services-grid-h2">`. Each tile is a single `<a>` wrapping a `<figure>`; the photo's `alt` is decorative (`alt=""`) when the title is overlaid; the linked text serves as the accessible name. Focus-visible target is the `<a>`, with the standard 2px green focus ring offset 2px (Phase 1.03 §8.4). |

---

### 3.4 Featured projects

#### Desktop SVG

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 720" width="100%" role="img" aria-label="Featured projects — desktop">
  <style>
    .eb { font-family: 'Manrope', system-ui, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.12em; fill: #2F5D27; }
    .h2 { font-family: 'Manrope', system-ui, sans-serif; font-size: 40px; font-weight: 700; letter-spacing: -0.015em; fill: #1A1A1A; }
    .sub{ font-family: 'Onest', system-ui, sans-serif; font-size: 17px; font-weight: 400; fill: #4A4A4A; }
    .tag{ font-family: 'Manrope', system-ui, sans-serif; font-size: 11px; font-weight: 600; fill: #2F5D27; text-transform: uppercase; letter-spacing: 0.08em; }
    .pt { font-family: 'Manrope', system-ui, sans-serif; font-size: 22px; font-weight: 700; fill: #FAF7F1; }
    .meta{ font-family: 'Onest', system-ui, sans-serif; font-size: 13px; font-weight: 500; fill: rgba(250,247,241,0.8); }
    .cta{ font-family: 'Manrope', system-ui, sans-serif; font-size: 15px; font-weight: 600; fill: #2F5D27; }
    .ann{ font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #6B6B6B; font-style: italic; }
  </style>
  <rect width="1440" height="720" fill="#FFFFFF"/>
  <g transform="translate(120,80)">
    <text x="0" y="0" class="eb">RECENT WORK</text>
    <text x="0" y="56" class="h2">Featured residential projects.</text>
    <text x="980" y="56" class="cta">View all residential →</text>
  </g>
  <!-- 3 project tiles desktop, 4:3 -->
  <g transform="translate(120,200)">
    <g>
      <rect width="384" height="448" rx="16" fill="#5B7E4D"/>
      <rect width="384" height="448" rx="16" fill="url(#projGrad)"/>
      <rect x="20" y="20" width="92" height="22" rx="4" fill="rgba(220,232,213,0.95)"/>
      <text x="66" y="36" class="tag" text-anchor="middle">PATIO</text>
      <text x="20" y="392" class="pt">Backyard transformation</text>
      <text x="20" y="416" class="meta">Naperville · 2024</text>
    </g>
    <g transform="translate(408,0)">
      <rect width="384" height="448" rx="16" fill="#6B8B5C"/>
      <rect width="384" height="448" rx="16" fill="url(#projGrad)"/>
      <rect x="20" y="20" width="118" height="22" rx="4" fill="rgba(220,232,213,0.95)"/>
      <text x="79" y="36" class="tag" text-anchor="middle">LAWN CARE</text>
      <text x="20" y="392" class="pt">Curb-appeal refresh</text>
      <text x="20" y="416" class="meta">Wheaton · 2024</text>
    </g>
    <g transform="translate(816,0)">
      <rect width="384" height="448" rx="16" fill="#7E9D6E"/>
      <rect width="384" height="448" rx="16" fill="url(#projGrad)"/>
      <rect x="20" y="20" width="120" height="22" rx="4" fill="rgba(220,232,213,0.95)"/>
      <text x="80" y="36" class="tag" text-anchor="middle">FULL DESIGN</text>
      <text x="20" y="392" class="pt">Modern HOA frontage</text>
      <text x="20" y="416" class="meta">Aurora · 2024</text>
    </g>
  </g>
  <text x="120" y="700" class="ann">Surface --color-bg · 3 tiles desktop · reuses homepage projects-teaser pattern (Phase 1.06 §8) · CTA-link top-right links to /projects/?audience=residential (404 in Part 1)</text>
  <defs>
    <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.4" stop-color="rgba(0,0,0,0)"/>
      <stop offset="1" stop-color="rgba(0,0,0,0.65)"/>
    </linearGradient>
  </defs>
</svg>

#### Mobile SVG

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 1320" width="100%" role="img" aria-label="Featured projects — mobile">
  <style>
    .ebm { font-family: 'Manrope', system-ui, sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.12em; fill: #2F5D27; }
    .h2m { font-family: 'Manrope', system-ui, sans-serif; font-size: 28px; font-weight: 700; fill: #1A1A1A; }
    .ptm { font-family: 'Manrope', system-ui, sans-serif; font-size: 19px; font-weight: 700; fill: #FAF7F1; }
    .metam{ font-family: 'Onest', system-ui, sans-serif; font-size: 13px; font-weight: 500; fill: rgba(250,247,241,0.8); }
    .ctam{ font-family: 'Manrope', system-ui, sans-serif; font-size: 15px; font-weight: 600; fill: #2F5D27; }
    .annm{ font-family: 'Onest', system-ui, sans-serif; font-size: 10px; fill: #6B6B6B; font-style: italic; }
  </style>
  <rect width="480" height="1320" fill="#FFFFFF"/>
  <g transform="translate(20,56)">
    <text x="0" y="0" class="ebm">RECENT WORK</text>
    <text x="0" y="40" class="h2m">Featured residential</text>
    <text x="0" y="74" class="h2m">projects.</text>
  </g>
  <!-- Stacked 1-col -->
  <g transform="translate(20,180)">
    <g>
      <rect width="440" height="330" rx="16" fill="#5B7E4D"/>
      <rect width="440" height="330" rx="16" fill="url(#projGradM)"/>
      <text x="20" y="280" class="ptm">Backyard transformation</text>
      <text x="20" y="304" class="metam">Naperville · 2024</text>
    </g>
    <g transform="translate(0,354)">
      <rect width="440" height="330" rx="16" fill="#6B8B5C"/>
      <rect width="440" height="330" rx="16" fill="url(#projGradM)"/>
      <text x="20" y="280" class="ptm">Curb-appeal refresh</text>
      <text x="20" y="304" class="metam">Wheaton · 2024</text>
    </g>
    <g transform="translate(0,708)">
      <rect width="440" height="330" rx="16" fill="#7E9D6E"/>
      <rect width="440" height="330" rx="16" fill="url(#projGradM)"/>
      <text x="20" y="280" class="ptm">Modern HOA frontage</text>
      <text x="20" y="304" class="metam">Aurora · 2024</text>
    </g>
  </g>
  <text x="20" y="1260" class="ctam">View all residential →</text>
  <defs>
    <linearGradient id="projGradM" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.4" stop-color="rgba(0,0,0,0)"/>
      <stop offset="1" stop-color="rgba(0,0,0,0.7)"/>
    </linearGradient>
  </defs>
</svg>

#### Spec block

| Field | Value |
|---|---|
| Surface | `--color-bg` (white) |
| Container | `--container-default` (1200px) |
| Vertical padding | `py-20` / `py-14` |
| Section header | Eyebrow + H2 + CTA-link in the right corner ("View all {audience} →" — `link--cta` from Phase 1.03 §6.4). Mobile: CTA-link sits below the tile stack. |
| Content layout | 3 tiles desktop (3-col grid, gap-8). 4 tiles is allowed for variants where 4 strong project photos exist; if 4, desktop becomes a 2×2 grid OR 4-col with shorter tiles (recommend 4-col with 4:3 to keep visual rhythm consistent across audiences). Mobile: 1-col stack, gap-4. |
| Tile aspect ratio + treatment | 4:3 photo card with overlay (same as homepage projects-teaser, Phase 1.06 §8). Tag pill upper-left in cream-on-white `badge--subtle`; project title + location-year lower-left in `--color-text-on-dark`. |
| Component tokens | `card--photo` for the tile body; `badge--subtle` for the upper-left tag; `link--cta` for the section's CTA-link. |
| Hover behavior | Same as services grid: image scale 1.03, shadow grow, no per-element micro-effects. |
| Link target | `/{locale}/projects/?audience={audience}` (404s in Part 1 by design — mirrors homepage). Each tile is a stub link to `/{locale}/projects/{project-slug}/` (also 404 in Part 1). |
| Motion | `<AnimateIn variant="fade-up">` on the header; `<StaggerContainer>` on the tile grid, 80ms. |
| i18n length budget | H2 ≤ 5 words EN / ≤ 6 ES. CTA-link ≤ 5 words EN / ≤ 6 ES. Tile titles ≤ 5 words EN / ≤ 7 ES (the project's own copy lives in Sanity in Part 2; placeholders in Part 1 sit in `messages/{locale}.json`). |
| A11y | `<section aria-labelledby="featured-projects-h2">`. Each tile is a single `<a>`. Photo `alt` is descriptive when the project's title alone doesn't capture the work (e.g., "Aerial of paver patio with fire feature, Naperville, 2024"); falls back to `alt=""` when title + meta describe it. |

---

### 3.5 Why Sunset Services (audience-specific)

#### Desktop SVG

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 600" width="100%" role="img" aria-label="Why Sunset Services — desktop">
  <style>
    .eb { font-family: 'Manrope', system-ui, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.12em; fill: #2F5D27; }
    .h2 { font-family: 'Manrope', system-ui, sans-serif; font-size: 40px; font-weight: 700; letter-spacing: -0.015em; fill: #1A1A1A; }
    .vh { font-family: 'Manrope', system-ui, sans-serif; font-size: 22px; font-weight: 700; fill: #1A1A1A; }
    .vb { font-family: 'Onest', system-ui, sans-serif; font-size: 15px; font-weight: 400; fill: #4A4A4A; }
    .ann{ font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #6B6B6B; font-style: italic; }
  </style>
  <rect width="1440" height="600" fill="#FAF7F1"/>
  <g transform="translate(120,80)">
    <text x="0" y="0" class="eb">WHY SUNSET</text>
    <text x="0" y="56" class="h2">Built on twenty-five years.</text>
  </g>
  <!-- 4 value-prop tiles desktop -->
  <g transform="translate(120,200)">
    <g>
      <rect width="288" height="296" rx="16" fill="#FFFFFF"/>
      <!-- Icon placeholder -->
      <rect x="32" y="32" width="56" height="56" rx="12" fill="#DCE8D5"/>
      <text x="60" y="68" font-family="Manrope" font-size="20" font-weight="700" fill="#2F5D27" text-anchor="middle">25</text>
      <text x="32" y="148" class="vh">25+ years</text>
      <text x="32" y="172" class="vh">on DuPage homes</text>
      <text x="32" y="208" class="vb">Erick founded Sunset</text>
      <text x="32" y="226" class="vb">Services in 2000.</text>
      <text x="32" y="244" class="vb">We've seen the seasons.</text>
    </g>
    <g transform="translate(304,0)">
      <rect width="288" height="296" rx="16" fill="#FFFFFF"/>
      <rect x="32" y="32" width="56" height="56" rx="12" fill="#DCE8D5"/>
      <circle cx="60" cy="60" r="14" fill="none" stroke="#2F5D27" stroke-width="2"/>
      <text x="32" y="148" class="vh">Same crew</text>
      <text x="32" y="172" class="vh">every visit</text>
      <text x="32" y="208" class="vb">Your lead won't change.</text>
      <text x="32" y="226" class="vb">Quality stays consistent.</text>
    </g>
    <g transform="translate(608,0)">
      <rect width="288" height="296" rx="16" fill="#FFFFFF"/>
      <rect x="32" y="32" width="56" height="56" rx="12" fill="#DCE8D5"/>
      <text x="60" y="70" font-family="Manrope" font-size="22" font-weight="700" fill="#2F5D27" text-anchor="middle">EN ES</text>
      <text x="32" y="148" class="vh">Bilingual team</text>
      <text x="32" y="172" class="vh">EN · ES</text>
      <text x="32" y="208" class="vb">Crew leads speak both.</text>
      <text x="32" y="226" class="vb">Quotes available in either.</text>
    </g>
    <g transform="translate(912,0)">
      <rect width="288" height="296" rx="16" fill="#FFFFFF"/>
      <rect x="32" y="32" width="56" height="56" rx="12" fill="#DCE8D5"/>
      <path d="M50 60 l8 8 l16 -16" stroke="#2F5D27" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <text x="32" y="148" class="vh">Unilock</text>
      <text x="32" y="172" class="vh">Authorized</text>
      <text x="32" y="208" class="vb">Premium pavers,</text>
      <text x="32" y="226" class="vb">trained installation.</text>
    </g>
  </g>
  <text x="120" y="572" class="ann">Surface --color-bg-cream · 4-col grid desktop · cards use --shadow-on-cream · icon = lucide stroke 1.75 in --color-sunset-green-700 on --color-sunset-green-100 tile · audience-accent applied to icon-tile bg per variant</text>
</svg>

#### Mobile SVG

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 1240" width="100%" role="img" aria-label="Why Sunset — mobile">
  <style>
    .ebm { font-family: 'Manrope', system-ui, sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.12em; fill: #2F5D27; }
    .h2m { font-family: 'Manrope', system-ui, sans-serif; font-size: 28px; font-weight: 700; fill: #1A1A1A; }
    .vhm { font-family: 'Manrope', system-ui, sans-serif; font-size: 19px; font-weight: 700; fill: #1A1A1A; }
    .vbm { font-family: 'Onest', system-ui, sans-serif; font-size: 15px; font-weight: 400; fill: #4A4A4A; }
    .annm{ font-family: 'Onest', system-ui, sans-serif; font-size: 10px; fill: #6B6B6B; font-style: italic; }
  </style>
  <rect width="480" height="1240" fill="#FAF7F1"/>
  <g transform="translate(20,56)">
    <text x="0" y="0" class="ebm">WHY SUNSET</text>
    <text x="0" y="40" class="h2m">Built on twenty-</text>
    <text x="0" y="74" class="h2m">five years.</text>
  </g>
  <g transform="translate(20,180)">
    <g>
      <rect width="440" height="240" rx="16" fill="#FFFFFF"/>
      <rect x="24" y="24" width="48" height="48" rx="10" fill="#DCE8D5"/>
      <text x="24" y="120" class="vhm">25+ years on DuPage homes</text>
      <text x="24" y="156" class="vbm">Erick founded Sunset Services in 2000.</text>
      <text x="24" y="178" class="vbm">We've seen the seasons.</text>
    </g>
    <g transform="translate(0,256)">
      <rect width="440" height="240" rx="16" fill="#FFFFFF"/>
      <rect x="24" y="24" width="48" height="48" rx="10" fill="#DCE8D5"/>
      <text x="24" y="120" class="vhm">Same crew every visit</text>
      <text x="24" y="156" class="vbm">Your lead won't change.</text>
      <text x="24" y="178" class="vbm">Quality stays consistent.</text>
    </g>
    <g transform="translate(0,512)">
      <rect width="440" height="240" rx="16" fill="#FFFFFF"/>
      <rect x="24" y="24" width="48" height="48" rx="10" fill="#DCE8D5"/>
      <text x="24" y="120" class="vhm">Bilingual team · EN · ES</text>
      <text x="24" y="156" class="vbm">Crew leads speak both.</text>
    </g>
    <g transform="translate(0,768)">
      <rect width="440" height="240" rx="16" fill="#FFFFFF"/>
      <rect x="24" y="24" width="48" height="48" rx="10" fill="#DCE8D5"/>
      <text x="24" y="120" class="vhm">Unilock Authorized</text>
      <text x="24" y="156" class="vbm">Premium pavers, trained crew.</text>
    </g>
  </g>
  <text x="20" y="1200" class="annm">Mobile stacks 1-col · cards full-width · same shadow tokens</text>
</svg>

#### Spec block

| Field | Value |
|---|---|
| Surface | `--color-bg-cream` |
| Container | `--container-default` |
| Vertical padding | `py-20` / `py-14` |
| Section header | Eyebrow (audience-accent) + H2 (`--text-h2`). No subhead. |
| Content layout | 4-col desktop grid (`grid-cols-4 gap-6`), 2-col tablet (`md:grid-cols-2`), 1-col mobile. Each card: 24/32 padding (Phase 1.03 §4.2), `--shadow-on-cream`, `--radius-lg`. |
| Tile composition | Icon tile (56×56 `--radius-md` `--color-sunset-green-100` background — overridden per audience to the audience's eyebrow-chip background per §3X) + lucide icon (32px stroke 1.75 in `--color-sunset-green-700`); 32px gap to headline (`--text-h4` weight 700); 12px gap to body (`--text-body-sm` `--color-text-secondary`, max 2 lines). |
| Icon set | Lucide. Per audience and value-prop: `Award`, `Users`, `Languages`, `BadgeCheck`, `ShieldCheck`, `Truck`, `Snowflake`, `Hammer`, `UserCheck`, etc. Specific assignments in §3X variant blocks. **The Unilock authorization** uses the hand-rolled Unilock logo SVG from `Logo.tsx`, not a lucide icon (Phase 1.03 §8.3 brand-logo rule). |
| Component tokens | `card` + `card--cream` from Phase 1.03 §6.2. |
| Motion | `<AnimateIn variant="fade-up">` on header; `<StaggerContainer>` on the grid, 80ms, 4 `<StaggerItem>`s. |
| i18n length budget | H2 ≤ 6 words EN / ≤ 7 ES. Each tile headline ≤ 5 words EN / ≤ 6 ES (often will need 2 lines). Each body ≤ 14 words EN / ≤ 17 ES. |
| A11y | `<section aria-labelledby="why-sunset-h2">`. Each card is a non-interactive `<article>` with the headline as `<h3>`. Icons `role="img" aria-hidden="true"` (decorative — value prop's text carries meaning). |

---

### 3.6 Audience-specific social proof

Reuses the homepage social-proof pattern (Phase 1.06 §6) — testimonial cards + credentials row — with two changes: (a) testimonials are filtered to the current audience (so a Hardscape page only shows Hardscape testimonials), and (b) the credentials row includes audience-specific credentials (Hardscape leans Unilock; Commercial may add "Insured & Bonded" once Cowork confirms in 2.04).

#### Desktop SVG

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 760" width="100%" role="img" aria-label="Audience social proof — desktop">
  <style>
    .eb { font-family: 'Manrope', system-ui, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.12em; fill: #2F5D27; }
    .h2 { font-family: 'Manrope', system-ui, sans-serif; font-size: 40px; font-weight: 700; letter-spacing: -0.015em; fill: #1A1A1A; }
    .quote{ font-family: 'Manrope', system-ui, sans-serif; font-size: 22px; font-weight: 500; font-style: italic; fill: #1A1A1A; }
    .cite{ font-family: 'Onest', system-ui, sans-serif; font-size: 13px; font-weight: 500; fill: #4A4A4A; }
    .star{ font-family: 'Manrope', system-ui, sans-serif; font-size: 14px; fill: #E8A33D; }
    .credh{ font-family: 'Manrope', system-ui, sans-serif; font-size: 22px; font-weight: 700; fill: #1A1A1A; }
    .credb{ font-family: 'Onest', system-ui, sans-serif; font-size: 12px; font-weight: 500; fill: #6B6B6B; }
    .ann{ font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #6B6B6B; font-style: italic; }
  </style>
  <rect width="1440" height="760" fill="#FFFFFF"/>
  <g transform="translate(120,80)">
    <text x="0" y="0" class="eb">FROM YOUR NEIGHBORS</text>
    <text x="0" y="56" class="h2">Reviewed by residential homeowners.</text>
  </g>
  <!-- 2 testimonials in 2-col -->
  <g transform="translate(120,200)">
    <g>
      <rect width="600" height="240" rx="24" fill="#FAF7F1"/>
      <rect width="4" height="240" fill="#4D8A3F"/>
      <text x="32" y="44" class="star">★★★★★</text>
      <text x="32" y="92" class="quote">"They took a backyard slope no</text>
      <text x="32" y="120" class="quote">one would touch and turned it into</text>
      <text x="32" y="148" class="quote">our favorite room of the house."</text>
      <text x="32" y="200" class="cite">Sarah K., Wheaton · via Google</text>
    </g>
    <g transform="translate(624,0)">
      <rect width="576" height="240" rx="24" fill="#FAF7F1"/>
      <rect width="4" height="240" fill="#4D8A3F"/>
      <text x="32" y="44" class="star">★★★★★</text>
      <text x="32" y="92" class="quote">"Same crew, same quality, week</text>
      <text x="32" y="120" class="quote">after week. Five years now."</text>
      <text x="32" y="200" class="cite">Marco D., Aurora · via Google</text>
    </g>
  </g>
  <!-- Credentials row -->
  <line x1="120" y1="500" x2="1320" y2="500" stroke="#E5E0D5"/>
  <g transform="translate(120,560)">
    <g>
      <text x="0" y="0" class="credh">★ 4.9</text>
      <text x="0" y="24" class="credb">Google · 287 reviews</text>
    </g>
    <g transform="translate(280,0)">
      <rect width="56" height="40" rx="6" fill="#1A3617"/>
      <text x="28" y="26" font-family="Manrope" font-weight="700" fill="#FAF7F1" font-size="14" text-anchor="middle">U</text>
      <text x="72" y="14" class="credh" font-size="18">Unilock</text>
      <text x="72" y="34" class="credb">Authorized Contractor</text>
    </g>
    <g transform="translate(580,0)">
      <text x="0" y="0" class="credh">25+</text>
      <text x="0" y="24" class="credb">years in DuPage County</text>
    </g>
    <g transform="translate(820,0)">
      <text x="0" y="0" class="credh">1,200+</text>
      <text x="0" y="24" class="credb">homes served</text>
    </g>
  </g>
  <text x="120" y="720" class="ann">Surface --color-bg · 2 testimonials desktop (3 if extra space) · credentials row reused from homepage Phase 1.06 §6 with audience-filtered count · Insured & Bonded item appears for Commercial variant when Erick confirms in Phase 2.04</text>
</svg>

#### Mobile SVG

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 1080" width="100%" role="img" aria-label="Audience social proof — mobile">
  <style>
    .ebm { font-family: 'Manrope', system-ui, sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.12em; fill: #2F5D27; }
    .h2m { font-family: 'Manrope', system-ui, sans-serif; font-size: 28px; font-weight: 700; fill: #1A1A1A; }
    .quotem{ font-family: 'Manrope', system-ui, sans-serif; font-size: 19px; font-weight: 500; font-style: italic; fill: #1A1A1A; }
    .citem{ font-family: 'Onest', system-ui, sans-serif; font-size: 13px; font-weight: 500; fill: #4A4A4A; }
    .credhm{ font-family: 'Manrope', system-ui, sans-serif; font-size: 19px; font-weight: 700; fill: #1A1A1A; }
    .credbm{ font-family: 'Onest', system-ui, sans-serif; font-size: 12px; fill: #6B6B6B; }
    .annm{ font-family: 'Onest', system-ui, sans-serif; font-size: 10px; fill: #6B6B6B; font-style: italic; }
  </style>
  <rect width="480" height="1080" fill="#FFFFFF"/>
  <g transform="translate(20,56)">
    <text x="0" y="0" class="ebm">FROM YOUR NEIGHBORS</text>
    <text x="0" y="40" class="h2m">Reviewed by residential</text>
    <text x="0" y="74" class="h2m">homeowners.</text>
  </g>
  <g transform="translate(20,180)">
    <g>
      <rect width="440" height="220" rx="24" fill="#FAF7F1"/>
      <rect width="4" height="220" fill="#4D8A3F"/>
      <text x="24" y="44" font-family="Manrope" font-size="14" fill="#E8A33D">★★★★★</text>
      <text x="24" y="88" class="quotem">"They took a backyard</text>
      <text x="24" y="112" class="quotem">slope no one would touch</text>
      <text x="24" y="136" class="quotem">and turned it into our</text>
      <text x="24" y="160" class="quotem">favorite room."</text>
      <text x="24" y="200" class="citem">Sarah K., Wheaton · Google</text>
    </g>
    <g transform="translate(0,244)">
      <rect width="440" height="200" rx="24" fill="#FAF7F1"/>
      <rect width="4" height="200" fill="#4D8A3F"/>
      <text x="24" y="44" font-family="Manrope" font-size="14" fill="#E8A33D">★★★★★</text>
      <text x="24" y="88" class="quotem">"Same crew, same quality,</text>
      <text x="24" y="112" class="quotem">week after week."</text>
      <text x="24" y="180" class="citem">Marco D., Aurora · Google</text>
    </g>
  </g>
  <!-- Credentials horizontal scroll -->
  <line x1="20" y1="700" x2="460" y2="700" stroke="#E5E0D5"/>
  <g transform="translate(20,752)">
    <text x="0" y="0" class="credhm">★ 4.9 Google · 287 reviews</text>
    <text x="0" y="44" class="credhm">Unilock Authorized</text>
    <text x="0" y="88" class="credhm">25+ years in DuPage</text>
    <text x="0" y="132" class="credhm">1,200+ homes served</text>
  </g>
  <text x="20" y="1040" class="annm">Mobile credentials: horizontal scroll-snap row OR stacked list — match homepage choice (Phase 1.06 §6)</text>
</svg>

#### Spec block

| Field | Value |
|---|---|
| Surface | `--color-bg` (white) |
| Container | `--container-default` |
| Vertical padding | `py-20` / `py-14` |
| Section header | Eyebrow (audience-accent) + H2 |
| Content layout | 2 testimonial cards in a 2-col grid desktop (gap-6), 1-col mobile. Below: 1px hairline rule (`--color-border`) at `--spacing-12` margin, then a credentials row matching the homepage pattern (Phase 1.06 §6). Audience-specific credentials: Residential omits Insured & Bonded; Commercial adds it once confirmed; Hardscape leads with Unilock. |
| Component tokens | `card--testimonial card--cream` from Phase 1.03 §6.2; `badge--subtle` for "via Google" attribution chip. |
| Motion | `<AnimateIn variant="fade-up">` on the section; testimonials in a `<StaggerContainer>` (80ms); credentials row is static (no stagger — same as homepage). |
| i18n length budget | H2 ≤ 6 words EN / ≤ 7 ES. Each testimonial ≤ 30 words EN / ≤ 36 ES. Credential headlines ≤ 4 words EN / ≤ 5 ES. |
| A11y | `<section aria-labelledby="reviews-h2">`. Testimonials wrap in `<article>`; quote in `<blockquote>`; attribution in `<cite>` (Phase 1.06 §6). Credentials row is a `<dl>` with `<dt>`/`<dd>` pairs for screen readers. Stars are decorative (`aria-hidden="true"`); the rating value is announced by the credential's `<dt>`. |

---

### 3.7 FAQ

Audience-level FAQ — questions a prospective client asks before clicking into a specific service. **FAQPage schema attached** (see §5).

#### Desktop SVG

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 720" width="100%" role="img" aria-label="FAQ — desktop">
  <style>
    .eb { font-family: 'Manrope', system-ui, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.12em; fill: #2F5D27; }
    .h2 { font-family: 'Manrope', system-ui, sans-serif; font-size: 40px; font-weight: 700; letter-spacing: -0.015em; fill: #1A1A1A; }
    .q { font-family: 'Manrope', system-ui, sans-serif; font-size: 19px; font-weight: 600; fill: #1A1A1A; }
    .a { font-family: 'Onest', system-ui, sans-serif; font-size: 16px; font-weight: 400; fill: #4A4A4A; }
    .ann{ font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #6B6B6B; font-style: italic; }
  </style>
  <rect width="1440" height="720" fill="#FAF7F1"/>
  <g transform="translate(120,80)">
    <text x="0" y="0" class="eb">QUESTIONS · ANSWERED</text>
    <text x="0" y="56" class="h2">Common questions from homeowners.</text>
  </g>
  <!-- 5 FAQ items, single-column max-width 960 -->
  <g transform="translate(240,200)">
    <!-- Open item -->
    <line x1="0" y1="0" x2="960" y2="0" stroke="#E5E0D5"/>
    <text x="0" y="40" class="q">Do you offer one-time visits or only contracts?</text>
    <text x="900" y="40" font-family="Manrope" font-size="22" fill="#2F5D27">−</text>
    <text x="0" y="78" class="a">Both. Most lawn-care customers prefer a seasonal contract for consistency, but we'll do</text>
    <text x="0" y="100" class="a">one-time cleanups, design consults, and project work without a recurring commitment.</text>
    <line x1="0" y1="140" x2="960" y2="140" stroke="#E5E0D5"/>
    <text x="0" y="180" class="q">How quickly can you start?</text>
    <text x="900" y="180" font-family="Manrope" font-size="22" fill="#6B6B6B">+</text>
    <line x1="0" y1="220" x2="960" y2="220" stroke="#E5E0D5"/>
    <text x="0" y="260" class="q">Are estimates free?</text>
    <text x="900" y="260" font-family="Manrope" font-size="22" fill="#6B6B6B">+</text>
    <line x1="0" y1="300" x2="960" y2="300" stroke="#E5E0D5"/>
    <text x="0" y="340" class="q">Do you handle HOAs?</text>
    <text x="900" y="340" font-family="Manrope" font-size="22" fill="#6B6B6B">+</text>
    <line x1="0" y1="380" x2="960" y2="380" stroke="#E5E0D5"/>
    <text x="0" y="420" class="q">Are you insured?</text>
    <text x="900" y="420" font-family="Manrope" font-size="22" fill="#6B6B6B">+</text>
    <line x1="0" y1="460" x2="960" y2="460" stroke="#E5E0D5"/>
  </g>
  <text x="120" y="700" class="ann">Surface --color-bg-cream · max-width 960 (container-narrow centered) · FAQ accordion primitive Phase 1.03 §6 · multi-open mode (all answers in SSR HTML for FAQPage schema validity)</text>
</svg>

#### Mobile SVG

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 980" width="100%" role="img" aria-label="FAQ — mobile">
  <style>
    .ebm { font-family: 'Manrope', system-ui, sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.12em; fill: #2F5D27; }
    .h2m { font-family: 'Manrope', system-ui, sans-serif; font-size: 28px; font-weight: 700; fill: #1A1A1A; }
    .qm { font-family: 'Manrope', system-ui, sans-serif; font-size: 17px; font-weight: 600; fill: #1A1A1A; }
    .am { font-family: 'Onest', system-ui, sans-serif; font-size: 15px; font-weight: 400; fill: #4A4A4A; }
    .annm{ font-family: 'Onest', system-ui, sans-serif; font-size: 10px; fill: #6B6B6B; font-style: italic; }
  </style>
  <rect width="480" height="980" fill="#FAF7F1"/>
  <g transform="translate(20,56)">
    <text x="0" y="0" class="ebm">QUESTIONS · ANSWERED</text>
    <text x="0" y="40" class="h2m">Common questions</text>
    <text x="0" y="74" class="h2m">from homeowners.</text>
  </g>
  <g transform="translate(20,180)">
    <line x1="0" y1="0" x2="440" y2="0" stroke="#E5E0D5"/>
    <text x="0" y="40" class="qm">Do you offer one-time</text>
    <text x="0" y="62" class="qm">visits or only contracts?</text>
    <text x="420" y="40" font-family="Manrope" font-size="20" fill="#2F5D27">−</text>
    <text x="0" y="100" class="am">Both. Most lawn-care</text>
    <text x="0" y="120" class="am">customers prefer a seasonal</text>
    <text x="0" y="140" class="am">contract; we also do one-time</text>
    <text x="0" y="160" class="am">cleanups and design consults.</text>
    <line x1="0" y1="200" x2="440" y2="200" stroke="#E5E0D5"/>
    <text x="0" y="240" class="qm">How quickly can you start?</text>
    <text x="420" y="240" font-family="Manrope" font-size="20" fill="#6B6B6B">+</text>
    <line x1="0" y1="280" x2="440" y2="280" stroke="#E5E0D5"/>
    <text x="0" y="320" class="qm">Are estimates free?</text>
    <text x="420" y="320" font-family="Manrope" font-size="20" fill="#6B6B6B">+</text>
    <line x1="0" y1="360" x2="440" y2="360" stroke="#E5E0D5"/>
    <text x="0" y="400" class="qm">Do you handle HOAs?</text>
    <text x="420" y="400" font-family="Manrope" font-size="20" fill="#6B6B6B">+</text>
    <line x1="0" y1="440" x2="440" y2="440" stroke="#E5E0D5"/>
    <text x="0" y="480" class="qm">Are you insured?</text>
    <text x="420" y="480" font-family="Manrope" font-size="20" fill="#6B6B6B">+</text>
    <line x1="0" y1="520" x2="440" y2="520" stroke="#E5E0D5"/>
  </g>
  <text x="20" y="940" class="annm">Mobile: questions wrap to 2 lines; answer body keeps same indent</text>
</svg>

#### Spec block

| Field | Value |
|---|---|
| Surface | `--color-bg-cream` |
| Container | `--container-narrow` (960px) — narrower than page default to keep line-length scannable |
| Vertical padding | `py-20` / `py-14` |
| Section header | Eyebrow + H2; centered or left-aligned matching the rest of the page (recommend left-aligned for visual continuity) |
| Content layout | Single column. 4–6 FAQ items per audience landing. Each item: 1px top border (`--color-border`), 24/0 padding-top, question (`--text-h4` weight 600 `--color-text-primary`) + chevron/plus glyph at right (lucide `Plus` rest, `Minus` open, 22px stroke 1.75 `--color-sunset-green-700`); on open, 16px gap to answer (`--text-body` `--color-text-secondary`); 32px bottom padding when open, 0 closed (closed state collapses to top-border + question row only). |
| Mode | **Multi-open accordion.** Reasoning: every answer must be present in the SSR HTML for FAQPage schema validity (Plan §17 acceptance) regardless of UI state. Multi-open lets users compare multiple answers without forcing one to close, and means the JS state is simpler (set per item, no exclusion logic). Closed-by-default at first paint. |
| Component tokens | `faq-accordion` primitive from Phase 1.03 §6 (accordion expands via `details`/`summary` when JS is off; client component progressively enhances with `<motion.div animate={{ height }}>` for smooth open/close). |
| Motion | `<AnimateIn variant="fade-up">` on the section header. Items themselves do **not** wrap in `<AnimateIn>` — see §8 motion spec (lesson from Phase 1.07 P=86 mobile gap; FAQ section avoids per-item client wrappers). The accordion itself is the motion. Open/close: height 0→auto over `--motion-base` `--easing-soft`; reduced-motion drops to instant. |
| i18n length budget | H2 ≤ 6 words EN / ≤ 7 ES. Each question ≤ 12 words EN / ≤ 14 ES. Each answer ≤ 60 words EN / ≤ 72 ES. |
| A11y | `<section aria-labelledby="faq-h2">`. Each item is a `<details>` with `<summary>` carrying the question. `Enter`/`Space` toggles the summary; `Tab` between items (Phase 1.03 §9). The accordion's open/close is announced by the `<details>` element natively; no extra ARIA needed. JSON-LD FAQPage payload generated server-side using the same data source as the visible Q&As (so they cannot drift). |

---

### 3.8 CTA section (the amber moment)

The page's only amber CTA in `<main>`. Same pattern as homepage §9 (Phase 1.06).

#### Desktop SVG

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 480" width="100%" role="img" aria-label="CTA section — desktop">
  <style>
    .eb { font-family: 'Manrope', system-ui, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.12em; fill: #2F5D27; }
    .h1cta { font-family: 'Manrope', system-ui, sans-serif; font-size: 56px; font-weight: 700; letter-spacing: -0.02em; fill: #1A1A1A; }
    .body{ font-family: 'Onest', system-ui, sans-serif; font-size: 20px; font-weight: 400; fill: #4A4A4A; }
    .btnL { font-family: 'Manrope', system-ui, sans-serif; font-size: 17px; font-weight: 600; fill: #1A1A1A; }
    .tel { font-family: 'Onest', system-ui, sans-serif; font-size: 15px; font-weight: 500; fill: #2F5D27; }
    .ann{ font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #6B6B6B; font-style: italic; }
  </style>
  <rect width="1440" height="480" fill="#FAF7F1"/>
  <g transform="translate(240,80)">
    <text x="480" y="0" class="eb" text-anchor="middle">READY WHEN YOU ARE</text>
    <text x="480" y="76" class="h1cta" text-anchor="middle">Tell us about the property.</text>
    <text x="480" y="148" class="body" text-anchor="middle">Free estimate within 48 hours. No high-pressure sales — just a clear quote.</text>
    <g transform="translate(360,200)">
      <rect width="240" height="56" rx="8" fill="#E8A33D"/>
      <text x="120" y="36" class="btnL" text-anchor="middle">Get a Free Estimate</text>
    </g>
    <text x="480" y="296" class="tel" text-anchor="middle">or call (630) 946-9321</text>
  </g>
  <text x="120" y="448" class="ann">Surface --color-bg-cream (default) OR --color-bg-charcoal per D6 (Hardscape variant only) · container-narrow (960) centered · single Amber × lg · phone link below</text>
</svg>

#### Mobile SVG

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 600" width="100%" role="img" aria-label="CTA section — mobile">
  <style>
    .ebm { font-family: 'Manrope', system-ui, sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.12em; fill: #2F5D27; }
    .h1ctam { font-family: 'Manrope', system-ui, sans-serif; font-size: 36px; font-weight: 700; letter-spacing: -0.02em; fill: #1A1A1A; }
    .bodym{ font-family: 'Onest', system-ui, sans-serif; font-size: 17px; font-weight: 400; fill: #4A4A4A; }
    .btnLm { font-family: 'Manrope', system-ui, sans-serif; font-size: 17px; font-weight: 600; fill: #1A1A1A; }
    .telm { font-family: 'Onest', system-ui, sans-serif; font-size: 15px; font-weight: 500; fill: #2F5D27; }
  </style>
  <rect width="480" height="600" fill="#FAF7F1"/>
  <g transform="translate(20,80)">
    <text x="220" y="0" class="ebm" text-anchor="middle">READY WHEN YOU ARE</text>
    <text x="220" y="56" class="h1ctam" text-anchor="middle">Tell us about</text>
    <text x="220" y="100" class="h1ctam" text-anchor="middle">the property.</text>
    <text x="220" y="156" class="bodym" text-anchor="middle">Free estimate within 48 hrs.</text>
    <text x="220" y="180" class="bodym" text-anchor="middle">No high-pressure sales.</text>
    <g transform="translate(0,220)">
      <rect width="440" height="52" rx="8" fill="#E8A33D"/>
      <text x="220" y="33" class="btnLm" text-anchor="middle">Get a Free Estimate</text>
    </g>
    <text x="220" y="316" class="telm" text-anchor="middle">or call (630) 946-9321</text>
  </g>
</svg>

#### Spec block

| Field | Value |
|---|---|
| Surface | `--color-bg-cream` (default; Hardscape variant uses `--color-bg-charcoal` per D6 — see §3X) |
| Container | `--container-narrow` (960px), `mx-auto`, content-aligned center |
| Vertical padding | `py-20` / `py-14` |
| Section header | Eyebrow + H2 (rendered at `--text-h1` size, weight 700 — same "amplified close" treatment as homepage). Center-aligned. |
| Content layout | Stack: eyebrow → H2 → body paragraph (`--text-body-lg`) → `Amber × lg` button → `tel:` link below in `link--cta` (with phone icon). All center-aligned. |
| Component tokens | `btn--amber btn--lg` (the page's only amber CTA in `<main>`); `link--cta` with lucide `Phone` 16px |
| Motion | `<AnimateIn variant="fade-up">` on the section. Hover micro-interactions on the button only (translateY(-1px) + shadow). |
| i18n length budget | Eyebrow fixed string. H2 ≤ 6 words EN / ≤ 7 ES. Body ≤ 20 words EN / ≤ 24 ES. Button label fixed. |
| A11y | `<section aria-labelledby="cta-h2">`. Button is a `<a>` with `href="/{locale}/request-quote/?audience={…}"` (anchor, not button — it navigates). Phone link is `<a href="tel:+16309469321">`. On charcoal surface (Hardscape D6), all text uses `--color-text-on-dark`; the amber button keeps `--color-text-primary` label per Phase 1.03 §2.2 row 17. |

---


## 3X. Audience landing — Variants

The three audience variants share the master template above. They differ only in tokens applied + content. No separate full SVG sets — annotated callouts on the master suffice.

### 3X.1 Variant tokens — comparison table

| Element | Residential | Commercial | Hardscape |
|---|---|---|---|
| Audience-accent (kicker, eyebrow text) | `--color-sunset-green-500` | `--color-text-primary` (charcoal — neutral by design; commercial buyers read pro-grade as restraint) | `--color-sunset-amber-700` |
| Eyebrow chip background (when used) | `--color-sunset-green-100` | `--color-bg-stone` | `--color-sunset-amber-50` |
| Why-Sunset icon-tile background | `--color-sunset-green-100` | `--color-bg-stone` | `--color-sunset-amber-50` |
| Why-Sunset icon stroke color | `--color-sunset-green-700` | `--color-text-primary` | `--color-sunset-amber-700` |
| Testimonial card accent rule (4px left bar) | `--color-sunset-green-500` | `--color-sunset-green-500` (testimonials always use green — site-wide identity) | `--color-sunset-green-500` |
| Hero photo slot | `hero.residential.16x9` | `hero.commercial.16x9` | `hero.hardscape.16x9` |
| Services grid count | 6 (3×2) | 4 (2×2) | 6 (3×2) |
| CTA section surface | `--color-bg-cream` | `--color-bg-cream` | `--color-bg-charcoal` (per D6) |
| Unilock dedicated band | — | — | yes (see §3X.5) |

**Important:** the audience-accent applies to kicker, eyebrow chips, and the section-header underline only. **Buttons stay green/amber regardless of variant.** The Primary green × lg in the hero stays green even on Hardscape — Erick's brand-system rule from Plan §5: green is the brand, amber is the close, audience-accent is the chrome.

### 3X.2 Residential variant — content

| Field | Value |
|---|---|
| Hero kicker | "RESIDENTIAL" / "RESIDENCIAL" |
| Hero H1 | "Outdoor spaces that feel like home." / "Espacios al aire libre que se sienten como hogar." |
| Hero subhead | "Lawn care, landscape design, and seasonal services for DuPage County homes. Trusted by 1,200+ neighbors across Aurora, Naperville, and Wheaton." |
| Services grid | Lawn Care · Landscape Design · Tree Services · Sprinkler Systems · Snow Removal · Seasonal Cleanup |
| Why-Sunset value props (4) | "25+ years on DuPage homes" (icon: `Award`) · "Same crew every visit" (icon: `Users`) · "Bilingual EN · ES" (icon: `Languages`) · "Unilock Authorized" (icon: hand-rolled Unilock SVG) |
| FAQ Q&As (5) | "Do you offer one-time visits or only contracts?" · "How quickly can you start?" · "Are estimates free?" · "Do you handle HOAs?" · "Are you insured?" — drafts only; Erick polishes |

### 3X.3 Commercial variant — content

| Field | Value |
|---|---|
| Hero kicker | "COMMERCIAL" / "COMERCIAL" |
| Hero H1 | "Property care that earns repeat contracts." / "Cuidado de propiedades que merece contratos." |
| Hero subhead | "Maintenance, snow response, and turf programs for office parks, HOAs, and retail across the western suburbs. COIs on file before day one." |
| Services grid | Landscape Maintenance · Snow Removal · Property Enhancement · Turf Management |
| Why-Sunset value props (4) | "COI on file before day one" (icon: `ShieldCheck`) · "Uniformed crews + branded vehicles" (icon: `Truck`) · "After-hours snow response" (icon: `Snowflake`) · "Dedicated property manager" (icon: `UserCheck`) |
| FAQ Q&As (5) | "Do you serve HOAs?" · "What's your minimum contract value?" · "Can you provide a COI?" · "How fast is your snow response?" · "Do you provide single-point property managers?" |

### 3X.4 Hardscape variant — content

| Field | Value |
|---|---|
| Hero kicker | "HARDSCAPE DIVISION" / "DIVISIÓN HARDSCAPE" |
| Hero H1 | "Built to last twenty-five years and counting." / "Construido para durar veinticinco años y contando." |
| Hero subhead | "Patios, walls, fire features, and outdoor kitchens — installed by a Unilock Authorized Contractor with two decades of paver experience." |
| Services grid | Patios & Walkways · Retaining Walls · Fire Pits & Features · Pergolas & Pavilions · Driveways · Outdoor Kitchens |
| Why-Sunset value props (4) | "Unilock Authorized Contractor" (icon: hand-rolled Unilock SVG) · "5-year installation warranty" (icon: `BadgeCheck`) · "In-house design" (icon: `PencilRuler`) · "Marcin's team — 20+ years on hardscape" (icon: `Hammer`) |
| FAQ Q&As (5) | "How long does a typical patio take?" · "What warranty covers Unilock installs?" · "Do you do design before construction?" · "What materials do you typically use?" · "How does your project schedule work?" |

### 3X.5 Hardscape — Unilock dedicated band

A band immediately above the social-proof section (between Why-Sunset §3.5 and Social-proof §3.6 in the Hardscape variant). **Charcoal surface** (per D6 — the only charcoal band on either template, reserved use).

#### Desktop SVG

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 460" width="100%" role="img" aria-label="Hardscape Unilock band — desktop">
  <style>
    .eb { font-family: 'Manrope', system-ui, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.12em; fill: #C8946A; }
    .h2d { font-family: 'Manrope', system-ui, sans-serif; font-size: 40px; font-weight: 700; letter-spacing: -0.015em; fill: #FAF7F1; }
    .bodyd{ font-family: 'Onest', system-ui, sans-serif; font-size: 18px; font-weight: 400; fill: rgba(250,247,241,0.85); }
    .stat{ font-family: 'Onest', system-ui, sans-serif; font-size: 14px; font-weight: 600; fill: #C8946A; }
    .link{ font-family: 'Manrope', system-ui, sans-serif; font-size: 15px; font-weight: 600; fill: #FAF7F1; }
    .ann{ font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #FAF7F1; font-style: italic; opacity: 0.6; }
  </style>
  <rect width="1440" height="460" fill="#1F1A14"/>
  <g transform="translate(120,80)">
    <!-- Unilock badge placeholder, 120x120 -->
    <rect width="120" height="120" rx="8" fill="#FAF7F1"/>
    <rect x="6" y="6" width="108" height="108" rx="4" fill="#1A3617"/>
    <text x="60" y="56" font-family="Manrope" font-size="22" font-weight="700" fill="#FAF7F1" text-anchor="middle">UNILOCK</text>
    <text x="60" y="80" font-family="Manrope" font-size="11" fill="#C8946A" text-anchor="middle" letter-spacing="0.12em">AUTHORIZED</text>
    <text x="60" y="98" font-family="Manrope" font-size="11" fill="#C8946A" text-anchor="middle" letter-spacing="0.12em">CONTRACTOR</text>
  </g>
  <g transform="translate(296,80)">
    <text x="0" y="0" class="eb">UNILOCK AUTHORIZED CONTRACTOR</text>
    <text x="0" y="56" class="h2d">The paver brand pros pick.</text>
    <text x="0" y="120" class="bodyd">Unilock Authorization is awarded — not bought — to contractors who can prove</text>
    <text x="0" y="146" class="bodyd">consistent installation quality. We've held it for fifteen years and counting.</text>
    <text x="0" y="220" class="stat">FIFTEEN YEARS · 380+ INSTALLS · 5-YEAR INSTALLATION WARRANTY</text>
    <text x="0" y="280" class="link">View Unilock projects →</text>
  </g>
  <text x="120" y="430" class="ann">Surface --color-bg-charcoal · py-20 · container-default · badge slot 120×120 · accent uses --color-sunset-amber-200 (warm cream-on-dark) for eyebrow and stat strip</text>
</svg>

#### Mobile SVG

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 720" width="100%" role="img" aria-label="Hardscape Unilock band — mobile">
  <style>
    .ebm { font-family: 'Manrope', system-ui, sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.12em; fill: #C8946A; }
    .h2dm { font-family: 'Manrope', system-ui, sans-serif; font-size: 28px; font-weight: 700; fill: #FAF7F1; }
    .bodydm{ font-family: 'Onest', system-ui, sans-serif; font-size: 16px; fill: rgba(250,247,241,0.85); }
    .statm{ font-family: 'Onest', system-ui, sans-serif; font-size: 13px; font-weight: 600; fill: #C8946A; }
    .linkm{ font-family: 'Manrope', system-ui, sans-serif; font-size: 15px; font-weight: 600; fill: #FAF7F1; }
  </style>
  <rect width="480" height="720" fill="#1F1A14"/>
  <g transform="translate(20,56)">
    <rect width="96" height="96" rx="8" fill="#FAF7F1"/>
    <rect x="4" y="4" width="88" height="88" rx="4" fill="#1A3617"/>
    <text x="48" y="48" font-family="Manrope" font-size="16" font-weight="700" fill="#FAF7F1" text-anchor="middle">UNILOCK</text>
    <text x="48" y="68" font-family="Manrope" font-size="9" fill="#C8946A" text-anchor="middle">AUTHORIZED</text>
  </g>
  <g transform="translate(20,200)">
    <text x="0" y="0" class="ebm">UNILOCK AUTHORIZED</text>
    <text x="0" y="40" class="h2dm">The paver brand</text>
    <text x="0" y="74" class="h2dm">pros pick.</text>
    <text x="0" y="130" class="bodydm">Unilock Authorization is</text>
    <text x="0" y="152" class="bodydm">awarded — not bought — to</text>
    <text x="0" y="174" class="bodydm">contractors who can prove</text>
    <text x="0" y="196" class="bodydm">install quality.</text>
    <text x="0" y="252" class="statm">15 YRS · 380+ INSTALLS</text>
    <text x="0" y="278" class="statm">5-YR INSTALLATION WARRANTY</text>
    <text x="0" y="340" class="linkm">View Unilock projects →</text>
  </g>
</svg>

#### Spec block

| Field | Value |
|---|---|
| Surface | `--color-bg-charcoal` |
| Container | `--container-default` |
| Vertical padding | `py-20` / `py-14` |
| Layout | 2-col grid desktop: badge column 200px wide (badge centered in it), content column flex-1 with eyebrow/H2/body/stat/link stack. 1-col mobile: badge 96×96 top, content below. |
| Badge | Hand-rolled Unilock logo SVG from `Logo.tsx` (Phase 1.03 §8.3 brand-logo rule), 120×120 desktop / 96×96 mobile. |
| Stat strip | All-caps, letter-spacing 0.08em, `--text-body-sm` weight 600, `--color-sunset-amber-200` (warm-on-dark; verified ≥4.5:1 against `--color-bg-charcoal`). Use middle-dot separators. |
| CTA-link | "View Unilock projects →" — `link--cta` on-dark modifier (white text + white underline on hover). Target: `/{locale}/projects/?service=unilock` (404 in Part 1). **Not an amber button** — the page's amber budget is reserved for §3.8. |
| Component tokens | None new; reuses tokens. |
| Motion | `<AnimateIn variant="fade-up">`. Badge does not animate at any time (Phase 1.03 §8.3 brand discipline). |
| Placement | Render conditionally: `{audience === 'hardscape' && <AudienceUnilockBand />}` between `<AudienceWhyUs />` and `<AudienceSocialProof />`. |
| A11y | `<section aria-labelledby="unilock-h2">`. Badge has `alt="Unilock Authorized Contractor logo"`. Stat strip wrapped in a `<dl>` with `<dt>`/`<dd>` pairs (years held, installs, warranty length). |

---


## 4. Service detail — Template B (master)

The master design that applies to all 16 service pages. Nine subsections, one per content section. The same nine sections render for every service; per-service content comes from the seed table in §4.10.

### 4.1 Service hero

#### Desktop SVG

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 600" width="100%" role="img" aria-label="Service hero — desktop">
  <style>
    .eb { font-family: 'Manrope', system-ui, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.12em; }
    .h1 { font-family: 'Manrope', system-ui, sans-serif; font-size: 52px; font-weight: 700; letter-spacing: -0.02em; }
    .sub{ font-family: 'Onest', system-ui, sans-serif; font-size: 19px; font-weight: 400; }
    .crumb { font-family: 'Onest', system-ui, sans-serif; font-size: 13px; font-weight: 500; }
    .btnL { font-family: 'Manrope', system-ui, sans-serif; font-size: 17px; font-weight: 600; }
    .ann{ font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #FAF7F1; font-style: italic; }
  </style>
  <rect width="1440" height="600" fill="#3F5C2F"/>
  <pattern id="srvStripe" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
    <rect width="14" height="14" fill="#3F5C2F"/>
    <line x1="0" y1="0" x2="0" y2="14" stroke="#4D6E3D" stroke-width="6"/>
  </pattern>
  <rect width="1440" height="600" fill="url(#srvStripe)"/>
  <rect width="1440" height="600" fill="url(#srvHeroGrad)"/>
  <rect width="1440" height="72" fill="rgba(255,255,255,0.78)"/>
  <text x="48" y="46" class="h1" font-size="22" fill="#1A3617">Sunset Services</text>
  <text x="1280" y="120" class="ann" text-anchor="end">[ SERVICE HERO PHOTO · 16:9 · ≤350KB AVIF · service-specific ]</text>

  <g transform="translate(120,330)">
    <text x="0" y="0" class="crumb" fill="rgba(250,247,241,0.7)">Home  ›  Residential  ›  Lawn Care</text>
    <text x="0" y="34" class="eb" fill="#8FB67A">RESIDENTIAL</text>
    <text x="600" y="34" class="ann">kicker uses audience-accent token (matches /residential/ landing)</text>
    <text x="0" y="92" class="h1" fill="#FAF7F1">Lawn Care in Aurora &amp; DuPage County.</text>
    <text x="600" y="116" class="ann">≤9 words EN / ≤11 ES · local qualifier inside H1 budget for SEO</text>
    <text x="0" y="138" class="sub" fill="rgba(250,247,241,0.92)">Mowing, edging, fertilization, and weed control on a weekly schedule.</text>
    <text x="0" y="162" class="sub" fill="rgba(250,247,241,0.92)">Same crew, same day, every week — April through November.</text>
    <g transform="translate(0,200)">
      <rect width="216" height="52" rx="8" fill="#4D8A3F"/>
      <text x="108" y="33" class="btnL" fill="#FFFFFF" text-anchor="middle">Get a Free Estimate</text>
    </g>
    <g transform="translate(240,200)">
      <rect width="216" height="52" rx="8" fill="none" stroke="#FAF7F1" stroke-width="1.5"/>
      <text x="108" y="33" class="btnL" fill="#FAF7F1" text-anchor="middle">📞 (630) 946-9321</text>
    </g>
    <text x="600" y="232" class="ann">Secondary CTA on service hero is tel: link (intent is highest at this depth — phone-call is the natural action) · CallRail swaps in Part 2</text>
  </g>
  <defs>
    <linearGradient id="srvHeroGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="rgba(0,0,0,0)"/>
      <stop offset="0.5" stop-color="rgba(0,0,0,0.20)"/>
      <stop offset="1" stop-color="rgba(0,0,0,0.74)"/>
    </linearGradient>
  </defs>
</svg>

#### Mobile SVG

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 580" width="100%" role="img" aria-label="Service hero — mobile">
  <style>
    .ebm { font-family: 'Manrope', system-ui, sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.12em; }
    .h1m { font-family: 'Manrope', system-ui, sans-serif; font-size: 32px; font-weight: 700; letter-spacing: -0.02em; }
    .subm{ font-family: 'Onest', system-ui, sans-serif; font-size: 16px; font-weight: 400; }
    .crumbm { font-family: 'Onest', system-ui, sans-serif; font-size: 12px; }
    .btnLm { font-family: 'Manrope', system-ui, sans-serif; font-size: 17px; font-weight: 600; }
  </style>
  <rect width="480" height="580" fill="#3F5C2F"/>
  <pattern id="srvStripeM" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
    <rect width="10" height="10" fill="#3F5C2F"/>
    <line x1="0" y1="0" x2="0" y2="10" stroke="#4D6E3D" stroke-width="4"/>
  </pattern>
  <rect width="480" height="580" fill="url(#srvStripeM)"/>
  <rect width="480" height="580" fill="url(#srvHeroGradM)"/>
  <rect width="480" height="64" fill="rgba(255,255,255,0.78)"/>
  <g transform="translate(20,260)">
    <text x="0" y="0" class="crumbm" fill="rgba(250,247,241,0.7)">Home › Residential › Lawn Care</text>
    <text x="0" y="32" class="ebm" fill="#8FB67A">RESIDENTIAL</text>
    <text x="0" y="76" class="h1m" fill="#FAF7F1">Lawn Care in</text>
    <text x="0" y="112" class="h1m" fill="#FAF7F1">Aurora &amp; DuPage.</text>
    <text x="0" y="148" class="subm" fill="rgba(250,247,241,0.92)">Mowing, edging, fertilization,</text>
    <text x="0" y="170" class="subm" fill="rgba(250,247,241,0.92)">weed control. April – November.</text>
    <g transform="translate(0,196)">
      <rect width="440" height="52" rx="8" fill="#4D8A3F"/>
      <text x="220" y="33" class="btnLm" fill="#FFFFFF" text-anchor="middle">Get a Free Estimate</text>
    </g>
    <g transform="translate(0,260)">
      <rect width="440" height="52" rx="8" fill="none" stroke="#FAF7F1" stroke-width="1.5"/>
      <text x="220" y="33" class="btnLm" fill="#FAF7F1" text-anchor="middle">📞 (630) 946-9321</text>
    </g>
  </g>
  <defs>
    <linearGradient id="srvHeroGradM" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="rgba(0,0,0,0)"/>
      <stop offset="0.45" stop-color="rgba(0,0,0,0.10)"/>
      <stop offset="1" stop-color="rgba(0,0,0,0.78)"/>
    </linearGradient>
  </defs>
</svg>

#### Spec block

| Field | Value |
|---|---|
| Surface | photo + bottom-anchored dark gradient (same gradient stack as audience hero) |
| Container | `--container-wide` (1440px) photo wrapper; content cluster in `--container-default` (1200px) |
| Vertical padding | `min-height: clamp(420px, 52vh, 600px)` desktop / `clamp(320px, 44vh, 460px)` mobile; internal `py-20` desktop / `py-12` mobile, content bottom-anchored |
| Section header | Breadcrumb (3 links: Home, Audience, Service — last item current page, no link, `aria-current="page"`) → Kicker (audience name in audience-accent token color, matches the audience landing) → H1 ("[Service] in Aurora & DuPage County" — local qualifier inside the budget) → Subhead (one-paragraph) → CTA pair |
| Content layout | Same as audience hero: single-column, bottom-anchored cluster |
| Component tokens | `btn--primary btn--lg` (primary CTA → `/{locale}/request-quote/?service={slug}`); `btn--ghost btn--lg` on-dark with phone icon (secondary CTA → `tel:+16309469321`) |
| Motion | None (LCP discipline, same as audience hero) |
| i18n length budget | H1 ≤ 9 words EN / ≤ 11 ES (local qualifier "in Aurora & DuPage County" included in budget). Subhead ≤ 30 words EN / ≤ 36 ES. Per-service H1/subhead values in the seed table §4.10. |
| A11y | `<header>` landmark; breadcrumb is `<nav aria-label="Breadcrumb">` with `<ol>` and `aria-current="page"` on the last item; H1 unique to page; secondary CTA's tel: link has `aria-label="Call (630) 946-9321"` to ensure screen readers announce digits clearly. |

---

### 4.2 What's included

The block must read cleanly at 3 items (snow removal) and 6 items (landscape design). Recommended responsive layout:

- 3 items → 1-col desktop with wider text (max-width 720px), 1-col mobile
- 4 items → 2-col desktop, 1-col mobile
- 5–6 items → 3-col desktop (5 fills row 1 with 3 + row 2 with 2; visually balanced), 2-col tablet, 1-col mobile

#### Desktop SVG (5-item example, 3-col)

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 720" width="100%" role="img" aria-label="What's included — desktop, 5 items 3-col">
  <style>
    .eb { font-family: 'Manrope', system-ui, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.12em; fill: #2F5D27; }
    .h2 { font-family: 'Manrope', system-ui, sans-serif; font-size: 40px; font-weight: 700; letter-spacing: -0.015em; fill: #1A1A1A; }
    .ih { font-family: 'Manrope', system-ui, sans-serif; font-size: 19px; font-weight: 700; fill: #1A1A1A; }
    .ib { font-family: 'Onest', system-ui, sans-serif; font-size: 15px; font-weight: 400; fill: #4A4A4A; }
    .ann{ font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #6B6B6B; font-style: italic; }
  </style>
  <rect width="1440" height="720" fill="#FFFFFF"/>
  <g transform="translate(120,80)">
    <text x="0" y="0" class="eb">WHAT'S INCLUDED</text>
    <text x="0" y="56" class="h2">Every visit, every time.</text>
  </g>
  <g transform="translate(120,200)">
    <!-- Row 1, 3 items -->
    <g>
      <rect x="0" y="0" width="44" height="44" rx="10" fill="#DCE8D5"/>
      <path d="M14 22 l8 8 l16 -16" stroke="#2F5D27" stroke-width="2.5" fill="none"/>
      <text x="0" y="80" class="ih">Mowing &amp; edging</text>
      <text x="0" y="112" class="ib">Cut to height-best 3.5".</text>
      <text x="0" y="132" class="ib">Hard edges along beds + walks.</text>
    </g>
    <g transform="translate(400,0)">
      <rect x="0" y="0" width="44" height="44" rx="10" fill="#DCE8D5"/>
      <path d="M14 22 l8 8 l16 -16" stroke="#2F5D27" stroke-width="2.5" fill="none"/>
      <text x="0" y="80" class="ih">Fertilization</text>
      <text x="0" y="112" class="ib">5-step program, slow-release</text>
      <text x="0" y="132" class="ib">nitrogen, soil-tested seasonally.</text>
    </g>
    <g transform="translate(800,0)">
      <rect x="0" y="0" width="44" height="44" rx="10" fill="#DCE8D5"/>
      <path d="M14 22 l8 8 l16 -16" stroke="#2F5D27" stroke-width="2.5" fill="none"/>
      <text x="0" y="80" class="ih">Weed &amp; pest control</text>
      <text x="0" y="112" class="ib">Pre-emergent in spring.</text>
      <text x="0" y="132" class="ib">Spot treatments as needed.</text>
    </g>
    <!-- Row 2, 2 items, centered or left -->
    <g transform="translate(0,220)">
      <rect x="0" y="0" width="44" height="44" rx="10" fill="#DCE8D5"/>
      <path d="M14 22 l8 8 l16 -16" stroke="#2F5D27" stroke-width="2.5" fill="none"/>
      <text x="0" y="80" class="ih">Aeration &amp; overseeding</text>
      <text x="0" y="112" class="ib">Once per fall — relieves</text>
      <text x="0" y="132" class="ib">compaction, fills bare patches.</text>
    </g>
    <g transform="translate(400,220)">
      <rect x="0" y="0" width="44" height="44" rx="10" fill="#DCE8D5"/>
      <path d="M14 22 l8 8 l16 -16" stroke="#2F5D27" stroke-width="2.5" fill="none"/>
      <text x="0" y="80" class="ih">Cleanup before we leave</text>
      <text x="0" y="112" class="ib">Drives + walks blown clean.</text>
      <text x="0" y="132" class="ib">Trash carried off-site.</text>
    </g>
  </g>
  <text x="120" y="690" class="ann">Surface --color-bg · 3-col grid · gap-x-16 gap-y-14 · icon tile 44×44 in audience-accent chip background · Lucide icon stroke 1.75 · headline + 2-line description · row 2 left-aligned (not centered) for visual rhythm with row 1</text>
</svg>

#### Mobile SVG

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 1280" width="100%" role="img" aria-label="What's included — mobile">
  <style>
    .ebm { font-family: 'Manrope', system-ui, sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.12em; fill: #2F5D27; }
    .h2m { font-family: 'Manrope', system-ui, sans-serif; font-size: 28px; font-weight: 700; fill: #1A1A1A; }
    .ihm { font-family: 'Manrope', system-ui, sans-serif; font-size: 18px; font-weight: 700; fill: #1A1A1A; }
    .ibm { font-family: 'Onest', system-ui, sans-serif; font-size: 15px; fill: #4A4A4A; }
  </style>
  <rect width="480" height="1280" fill="#FFFFFF"/>
  <g transform="translate(20,56)">
    <text x="0" y="0" class="ebm">WHAT'S INCLUDED</text>
    <text x="0" y="40" class="h2m">Every visit, every time.</text>
  </g>
  <g transform="translate(20,160)">
    <g>
      <rect width="40" height="40" rx="8" fill="#DCE8D5"/>
      <path d="M12 20 l7 7 l14 -14" stroke="#2F5D27" stroke-width="2.5" fill="none"/>
      <text x="0" y="76" class="ihm">Mowing &amp; edging</text>
      <text x="0" y="104" class="ibm">Cut at 3.5". Hard edges along beds + walks.</text>
    </g>
    <g transform="translate(0,170)">
      <rect width="40" height="40" rx="8" fill="#DCE8D5"/>
      <path d="M12 20 l7 7 l14 -14" stroke="#2F5D27" stroke-width="2.5" fill="none"/>
      <text x="0" y="76" class="ihm">Fertilization</text>
      <text x="0" y="104" class="ibm">5-step program, slow-release.</text>
    </g>
    <g transform="translate(0,340)">
      <rect width="40" height="40" rx="8" fill="#DCE8D5"/>
      <path d="M12 20 l7 7 l14 -14" stroke="#2F5D27" stroke-width="2.5" fill="none"/>
      <text x="0" y="76" class="ihm">Weed &amp; pest control</text>
      <text x="0" y="104" class="ibm">Pre-emergent in spring; spot as needed.</text>
    </g>
    <g transform="translate(0,510)">
      <rect width="40" height="40" rx="8" fill="#DCE8D5"/>
      <path d="M12 20 l7 7 l14 -14" stroke="#2F5D27" stroke-width="2.5" fill="none"/>
      <text x="0" y="76" class="ihm">Aeration &amp; overseeding</text>
      <text x="0" y="104" class="ibm">Once per fall, fills bare patches.</text>
    </g>
    <g transform="translate(0,680)">
      <rect width="40" height="40" rx="8" fill="#DCE8D5"/>
      <path d="M12 20 l7 7 l14 -14" stroke="#2F5D27" stroke-width="2.5" fill="none"/>
      <text x="0" y="76" class="ihm">Cleanup before we leave</text>
      <text x="0" y="104" class="ibm">Drives + walks blown clean.</text>
    </g>
  </g>
</svg>

#### Spec block

| Field | Value |
|---|---|
| Surface | `--color-bg` (white) |
| Container | `--container-default`, except 3-item case which uses `--container-narrow` (960px) for tighter prose |
| Vertical padding | `py-20` / `py-14` |
| Section header | Eyebrow (audience-accent) + H2; left-aligned |
| Content layout | **3 items**: 1-col, 720px max content width — items stacked vertically with deeper gap (gap-y-12). **4 items**: 2-col grid (gap-x-12 gap-y-12), 1-col mobile. **5–6 items**: 3-col grid desktop (gap-x-16 gap-y-14), 2-col tablet, 1-col mobile. (Decision **D3**.) |
| Item composition | Lucide icon tile 44×44 `--radius-md` audience-accent chip background, icon stroke 1.75 in audience-accent text color → 32px gap → headline (`--text-h4` weight 700) → 16px gap → description (`--text-body-sm` `--color-text-secondary`, max 2 lines, `text-wrap: pretty`). |
| Component tokens | None new; uses tokens directly (no card wrapper — items are text + icon, not cards). |
| Motion | `<AnimateIn variant="fade-up">` on the section header; `<StaggerContainer>` on the items, 60ms (faster stagger because items are smaller and the eye reads them as a list). |
| i18n length budget | H2 ≤ 6 words EN / ≤ 7 ES. Item headline ≤ 4 words EN / ≤ 5 ES. Description ≤ 14 words EN / ≤ 17 ES (max 2 lines at the desktop 3-col width). |
| A11y | `<section aria-labelledby="whats-included-h2">`. Items are `<article>` with headline as `<h3>`. Icons `aria-hidden="true"`. |

---

### 4.3 Our process

4–5 numbered steps. Must read as a process, not a list. Recommendation: **numbered cards with a connecting hairline rule** between them (1px `--color-border`, runs across the cards' midline at desktop, runs vertically alongside cards at mobile). Decision **D4**.

#### Desktop SVG (4 steps, with connecting line)

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 540" width="100%" role="img" aria-label="Our process — desktop, 4 steps">
  <style>
    .eb { font-family: 'Manrope', system-ui, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.12em; fill: #2F5D27; }
    .h2 { font-family: 'Manrope', system-ui, sans-serif; font-size: 40px; font-weight: 700; letter-spacing: -0.015em; fill: #1A1A1A; }
    .num { font-family: 'Manrope', system-ui, sans-serif; font-size: 56px; font-weight: 700; fill: #2F5D27; letter-spacing: -0.04em; }
    .sh { font-family: 'Manrope', system-ui, sans-serif; font-size: 22px; font-weight: 700; fill: #1A1A1A; }
    .sb { font-family: 'Onest', system-ui, sans-serif; font-size: 15px; font-weight: 400; fill: #4A4A4A; }
    .ann{ font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #6B6B6B; font-style: italic; }
  </style>
  <rect width="1440" height="540" fill="#FAF7F1"/>
  <g transform="translate(120,80)">
    <text x="0" y="0" class="eb">HOW IT WORKS</text>
    <text x="0" y="56" class="h2">Our process — four steps.</text>
  </g>
  <!-- Connecting line, midline of step cards -->
  <line x1="180" y1="320" x2="1260" y2="320" stroke="#2F5D27" stroke-width="1.5" stroke-dasharray="2 6"/>
  <!-- 4 step nodes -->
  <g transform="translate(120,240)">
    <!-- step 1 -->
    <g>
      <circle cx="60" cy="80" r="18" fill="#FAF7F1" stroke="#2F5D27" stroke-width="1.5"/>
      <circle cx="60" cy="80" r="6" fill="#2F5D27"/>
      <text x="0" y="40" class="num">01</text>
      <text x="0" y="148" class="sh">Free site visit</text>
      <text x="0" y="180" class="sb">We meet you on-site,</text>
      <text x="0" y="200" class="sb">walk the space, listen.</text>
    </g>
    <g transform="translate(308,0)">
      <circle cx="60" cy="80" r="18" fill="#FAF7F1" stroke="#2F5D27" stroke-width="1.5"/>
      <circle cx="60" cy="80" r="6" fill="#2F5D27"/>
      <text x="0" y="40" class="num">02</text>
      <text x="0" y="148" class="sh">Custom estimate</text>
      <text x="0" y="180" class="sb">Itemized within 48 hrs.</text>
      <text x="0" y="200" class="sb">No high-pressure sales.</text>
    </g>
    <g transform="translate(616,0)">
      <circle cx="60" cy="80" r="18" fill="#FAF7F1" stroke="#2F5D27" stroke-width="1.5"/>
      <circle cx="60" cy="80" r="6" fill="#2F5D27"/>
      <text x="0" y="40" class="num">03</text>
      <text x="0" y="148" class="sh">Schedule the work</text>
      <text x="0" y="180" class="sb">Locked-in start date.</text>
      <text x="0" y="200" class="sb">Same crew throughout.</text>
    </g>
    <g transform="translate(924,0)">
      <circle cx="60" cy="80" r="18" fill="#FAF7F1" stroke="#2F5D27" stroke-width="1.5"/>
      <circle cx="60" cy="80" r="6" fill="#2F5D27"/>
      <text x="0" y="40" class="num">04</text>
      <text x="0" y="148" class="sh">Service guarantee</text>
      <text x="0" y="180" class="sb">If we miss something,</text>
      <text x="0" y="200" class="sb">we come back inside 24 hrs.</text>
    </g>
  </g>
  <text x="120" y="510" class="ann">Surface --color-bg-cream · numbered nodes on a dashed hairline · 4 steps on a 1200-wide container at 308px column-stride · numerals use --text-display floor weight 700 in --color-sunset-green-700 · adapts to 5 steps by reducing column-stride to ~248px</text>
</svg>

#### Mobile SVG (vertical timeline)

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 1080" width="100%" role="img" aria-label="Our process — mobile vertical timeline">
  <style>
    .ebm { font-family: 'Manrope', system-ui, sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.12em; fill: #2F5D27; }
    .h2m { font-family: 'Manrope', system-ui, sans-serif; font-size: 28px; font-weight: 700; fill: #1A1A1A; }
    .numm { font-family: 'Manrope', system-ui, sans-serif; font-size: 36px; font-weight: 700; fill: #2F5D27; }
    .shm { font-family: 'Manrope', system-ui, sans-serif; font-size: 19px; font-weight: 700; fill: #1A1A1A; }
    .sbm { font-family: 'Onest', system-ui, sans-serif; font-size: 15px; fill: #4A4A4A; }
  </style>
  <rect width="480" height="1080" fill="#FAF7F1"/>
  <g transform="translate(20,56)">
    <text x="0" y="0" class="ebm">HOW IT WORKS</text>
    <text x="0" y="40" class="h2m">Our process —</text>
    <text x="0" y="74" class="h2m">four steps.</text>
  </g>
  <!-- Vertical line -->
  <line x1="56" y1="220" x2="56" y2="980" stroke="#2F5D27" stroke-width="1.5" stroke-dasharray="2 6"/>
  <!-- Steps -->
  <g transform="translate(20,200)">
    <circle cx="36" cy="40" r="14" fill="#FAF7F1" stroke="#2F5D27" stroke-width="1.5"/>
    <circle cx="36" cy="40" r="5" fill="#2F5D27"/>
    <text x="100" y="32" class="numm">01</text>
    <text x="100" y="68" class="shm">Free site visit</text>
    <text x="100" y="98" class="sbm">We meet you, walk the</text>
    <text x="100" y="120" class="sbm">space, listen.</text>
  </g>
  <g transform="translate(20,376)">
    <circle cx="36" cy="40" r="14" fill="#FAF7F1" stroke="#2F5D27" stroke-width="1.5"/>
    <circle cx="36" cy="40" r="5" fill="#2F5D27"/>
    <text x="100" y="32" class="numm">02</text>
    <text x="100" y="68" class="shm">Custom estimate</text>
    <text x="100" y="98" class="sbm">Itemized within 48 hrs.</text>
  </g>
  <g transform="translate(20,552)">
    <circle cx="36" cy="40" r="14" fill="#FAF7F1" stroke="#2F5D27" stroke-width="1.5"/>
    <circle cx="36" cy="40" r="5" fill="#2F5D27"/>
    <text x="100" y="32" class="numm">03</text>
    <text x="100" y="68" class="shm">Schedule the work</text>
    <text x="100" y="98" class="sbm">Locked-in start date.</text>
  </g>
  <g transform="translate(20,728)">
    <circle cx="36" cy="40" r="14" fill="#FAF7F1" stroke="#2F5D27" stroke-width="1.5"/>
    <circle cx="36" cy="40" r="5" fill="#2F5D27"/>
    <text x="100" y="32" class="numm">04</text>
    <text x="100" y="68" class="shm">Service guarantee</text>
    <text x="100" y="98" class="sbm">If we miss something we</text>
    <text x="100" y="120" class="sbm">come back inside 24 hrs.</text>
  </g>
</svg>

#### Spec block

| Field | Value |
|---|---|
| Surface | `--color-bg-cream` |
| Container | `--container-default` |
| Vertical padding | `py-20` / `py-14` |
| Section header | Eyebrow + H2 |
| Content layout (desktop) | Horizontal 4-col (or 5-col) grid. Each step is a node: 56px numeral on top, dot+ring 28px below it sitting on a horizontal dashed hairline, headline + 2-line description below. The dashed line crosses all step nodes' midline so the eye reads "1 → 2 → 3 → 4". |
| Content layout (mobile) | Vertical timeline. Dashed line runs left at x=56, dots+rings on it; numerals + content to the right. Reads top-down. |
| Numerals | `--text-display` floor (or `--text-h1` ceiling — choose `--text-display` for desktop, `--text-h2` for mobile to keep proportion). Color `--color-sunset-green-700`. |
| Connecting line | 1.5px dashed (`stroke-dasharray: 2 6`), `--color-sunset-green-700` at 60% opacity (matches focus-ring intent — Phase 1.03 §8.4). Connects all step nodes. |
| Component tokens | No new tokens; the dot+ring is local to this section. |
| Motion | `<AnimateIn variant="fade-up">` on header. `<StaggerContainer>` on the steps with 100ms stagger (slower than other sections — the eye should follow the sequence). On reduced-motion, all steps render simultaneously without stagger. |
| i18n length budget | H2 ≤ 6 words EN / ≤ 7 ES. Step headline ≤ 4 words EN / ≤ 5 ES. Step description ≤ 14 words EN / ≤ 17 ES. |
| A11y | `<section aria-labelledby="process-h2">`. Steps are `<ol>` with `<li>` items — semantic process order. Each step's headline is `<h3>`. Numerals are decorative when paired with semantic `<ol>`/`<li>`; use `aria-hidden="true"` on the numeral text so SR doesn't double-announce. |

---

### 4.4 Why us for this service

Service-specific value props. 3 tiles. Different from the audience landing's "Why Sunset Services" — those are audience-level; these are tightly scoped to the service.

#### Desktop SVG

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 460" width="100%" role="img" aria-label="Why us for this service — desktop">
  <style>
    .eb { font-family: 'Manrope', system-ui, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.12em; fill: #2F5D27; }
    .h2 { font-family: 'Manrope', system-ui, sans-serif; font-size: 40px; font-weight: 700; fill: #1A1A1A; }
    .vh { font-family: 'Manrope', system-ui, sans-serif; font-size: 22px; font-weight: 700; fill: #1A1A1A; }
    .vb { font-family: 'Onest', system-ui, sans-serif; font-size: 15px; fill: #4A4A4A; }
    .ann{ font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #6B6B6B; font-style: italic; }
  </style>
  <rect width="1440" height="460" fill="#FFFFFF"/>
  <g transform="translate(120,64)">
    <text x="0" y="0" class="eb">WHY SUNSET FOR LAWN CARE</text>
    <text x="0" y="56" class="h2">Three reasons it's worth the call.</text>
  </g>
  <g transform="translate(120,180)">
    <g>
      <rect width="384" height="220" rx="16" fill="#FAF7F1"/>
      <rect x="32" y="32" width="48" height="48" rx="10" fill="#DCE8D5"/>
      <text x="32" y="124" class="vh">Same crew, every visit</text>
      <text x="32" y="160" class="vb">Your Tuesday lead doesn't</text>
      <text x="32" y="180" class="vb">change mid-season.</text>
    </g>
    <g transform="translate(408,0)">
      <rect width="384" height="220" rx="16" fill="#FAF7F1"/>
      <rect x="32" y="32" width="48" height="48" rx="10" fill="#DCE8D5"/>
      <text x="32" y="124" class="vh">Bilingual lead</text>
      <text x="32" y="160" class="vb">Note in EN or ES;</text>
      <text x="32" y="180" class="vb">we handle the rest.</text>
    </g>
    <g transform="translate(816,0)">
      <rect width="384" height="220" rx="16" fill="#FAF7F1"/>
      <rect x="32" y="32" width="48" height="48" rx="10" fill="#DCE8D5"/>
      <text x="32" y="124" class="vh">24-hr service guarantee</text>
      <text x="32" y="160" class="vb">If we miss a spot, we</text>
      <text x="32" y="180" class="vb">come back inside 24 hrs.</text>
    </g>
  </g>
  <text x="120" y="430" class="ann">Surface --color-bg · 3-col grid · cards on cream-fill (--color-bg-cream) on white surface — visual contrast pulls them off the page · audience-accent applied to icon tile bg (residential = green-100; commercial = stone; hardscape = amber-50)</text>
</svg>

#### Mobile SVG

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 880" width="100%" role="img" aria-label="Why us for this service — mobile">
  <style>
    .ebm { font-family: 'Manrope', system-ui, sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.12em; fill: #2F5D27; }
    .h2m { font-family: 'Manrope', system-ui, sans-serif; font-size: 28px; font-weight: 700; fill: #1A1A1A; }
    .vhm { font-family: 'Manrope', system-ui, sans-serif; font-size: 19px; font-weight: 700; fill: #1A1A1A; }
    .vbm { font-family: 'Onest', system-ui, sans-serif; font-size: 15px; fill: #4A4A4A; }
  </style>
  <rect width="480" height="880" fill="#FFFFFF"/>
  <g transform="translate(20,56)">
    <text x="0" y="0" class="ebm">WHY SUNSET FOR LAWN CARE</text>
    <text x="0" y="40" class="h2m">Three reasons it's</text>
    <text x="0" y="74" class="h2m">worth the call.</text>
  </g>
  <g transform="translate(20,180)">
    <g>
      <rect width="440" height="200" rx="16" fill="#FAF7F1"/>
      <rect x="24" y="24" width="44" height="44" rx="10" fill="#DCE8D5"/>
      <text x="24" y="116" class="vhm">Same crew, every visit</text>
      <text x="24" y="152" class="vbm">Your Tuesday lead doesn't change.</text>
    </g>
    <g transform="translate(0,216)">
      <rect width="440" height="200" rx="16" fill="#FAF7F1"/>
      <rect x="24" y="24" width="44" height="44" rx="10" fill="#DCE8D5"/>
      <text x="24" y="116" class="vhm">Bilingual lead</text>
      <text x="24" y="152" class="vbm">Note in EN or ES; we handle the rest.</text>
    </g>
    <g transform="translate(0,432)">
      <rect width="440" height="200" rx="16" fill="#FAF7F1"/>
      <rect x="24" y="24" width="44" height="44" rx="10" fill="#DCE8D5"/>
      <text x="24" y="116" class="vhm">24-hr service guarantee</text>
      <text x="24" y="152" class="vbm">If we miss a spot, we come back fast.</text>
    </g>
  </g>
</svg>

#### Spec block

| Field | Value |
|---|---|
| Surface | `--color-bg` (white) |
| Container | `--container-default` |
| Vertical padding | `py-16` / `py-12` (slightly tighter than other body sections — section is 3 short tiles, doesn't need full `py-20`) |
| Section header | Eyebrow ("WHY SUNSET FOR [SERVICE]") + H2 |
| Content layout | 3-col grid desktop (gap-6), 1-col mobile. Tile bg `--color-bg-cream` on the section's white surface — the contrast lifts the tiles. |
| Tile composition | 48×48 `--radius-md` icon tile in audience-accent chip background → 32px gap → headline (`--text-h4` weight 700) → 16px gap → 2-line description (`--text-body-sm`) |
| Component tokens | `card--cream` from Phase 1.03 §6.2; lucide icons. |
| Motion | `<AnimateIn variant="fade-up">`; `<StaggerContainer>` on the 3 tiles, 80ms. |
| i18n length budget | H2 ≤ 7 words EN / ≤ 8 ES. Tile headline ≤ 5 words EN / ≤ 6 ES. Tile description ≤ 12 words EN / ≤ 15 ES. |
| A11y | `<section aria-labelledby="why-service-h2">`. Tiles are `<article>`; headline as `<h3>`. |

---

### 4.5 Pricing transparency block (D5 — Option D)

The block always renders. Its **state** is per-service:

- **State A — confirmed price (when Erick provides one):** "Starting at $X" headline + 2-sentence "What this includes" + Amber-tinted inline link to "See full estimate" → `/{locale}/request-quote/?service={slug}`. Card-style band, cream surface.
- **State B — no confirmed price (default for Part 1):** "How pricing works" headline + 3 factors that drive cost + a CTA-link "Get a real quote" → `/{locale}/request-quote/?service={slug}`. Smaller band, same cream surface; same vertical footprint to keep alternation invariant.

Both states render on `--color-bg-cream`. **The link to /request-quote/ is a CTA-link, not a button — preserves the page's amber-button budget for §4.9.**

#### Desktop SVG (State B — default for Part 1)

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 460" width="100%" role="img" aria-label="Pricing block — State B desktop">
  <style>
    .eb { font-family: 'Manrope', system-ui, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.12em; fill: #2F5D27; }
    .h2 { font-family: 'Manrope', system-ui, sans-serif; font-size: 36px; font-weight: 700; fill: #1A1A1A; letter-spacing: -0.015em; }
    .body{ font-family: 'Onest', system-ui, sans-serif; font-size: 17px; fill: #4A4A4A; }
    .fac { font-family: 'Manrope', system-ui, sans-serif; font-size: 17px; font-weight: 700; fill: #1A1A1A; }
    .cta { font-family: 'Manrope', system-ui, sans-serif; font-size: 17px; font-weight: 600; fill: #2F5D27; }
    .ann{ font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #6B6B6B; font-style: italic; }
  </style>
  <rect width="1440" height="460" fill="#FAF7F1"/>
  <g transform="translate(240,80)">
    <rect width="960" height="320" rx="24" fill="#FFFFFF"/>
    <g transform="translate(48,40)">
      <text x="0" y="0" class="eb">HOW PRICING WORKS</text>
      <text x="0" y="48" class="h2">No hidden math.</text>
      <text x="0" y="92" class="body">Lawn-care pricing on DuPage homes typically depends on three things:</text>
      <g transform="translate(0,128)">
        <text x="0" y="0" class="fac">Lot size</text>
        <text x="240" y="0" class="fac">Service frequency</text>
        <text x="540" y="0" class="fac">Add-ons</text>
        <text x="0" y="28" class="body">Square footage of</text>
        <text x="0" y="50" class="body">turf + bed line.</text>
        <text x="240" y="28" class="body">Weekly vs every-other-</text>
        <text x="240" y="50" class="body">week, season-long.</text>
        <text x="540" y="28" class="body">Aeration, overseeding,</text>
        <text x="540" y="50" class="body">spring + fall cleanup.</text>
      </g>
      <text x="0" y="244" class="cta">Get a real quote in 48 hrs →</text>
    </g>
  </g>
  <text x="120" y="430" class="ann">Surface --color-bg-cream · container-narrow (960) · State B card on white inset · 3 factor columns · CTA-link (NOT amber button) · State A swaps headline to "Starting at $X" + reduces factor list to a 2-sentence "What this includes" paragraph</text>
</svg>

#### Mobile SVG (State B)

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 720" width="100%" role="img" aria-label="Pricing block — mobile">
  <style>
    .ebm { font-family: 'Manrope', system-ui, sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.12em; fill: #2F5D27; }
    .h2m { font-family: 'Manrope', system-ui, sans-serif; font-size: 26px; font-weight: 700; fill: #1A1A1A; }
    .bodym{ font-family: 'Onest', system-ui, sans-serif; font-size: 15px; fill: #4A4A4A; }
    .facm { font-family: 'Manrope', system-ui, sans-serif; font-size: 17px; font-weight: 700; fill: #1A1A1A; }
    .ctam { font-family: 'Manrope', system-ui, sans-serif; font-size: 16px; font-weight: 600; fill: #2F5D27; }
  </style>
  <rect width="480" height="720" fill="#FAF7F1"/>
  <g transform="translate(20,40)">
    <rect width="440" height="640" rx="20" fill="#FFFFFF"/>
    <g transform="translate(24,40)">
      <text x="0" y="0" class="ebm">HOW PRICING WORKS</text>
      <text x="0" y="40" class="h2m">No hidden math.</text>
      <text x="0" y="84" class="bodym">Pricing depends on:</text>
      <g transform="translate(0,128)">
        <text x="0" y="0" class="facm">Lot size</text>
        <text x="0" y="24" class="bodym">Square footage of turf + bed line.</text>
      </g>
      <g transform="translate(0,200)">
        <text x="0" y="0" class="facm">Service frequency</text>
        <text x="0" y="24" class="bodym">Weekly vs every-other-week.</text>
      </g>
      <g transform="translate(0,272)">
        <text x="0" y="0" class="facm">Add-ons</text>
        <text x="0" y="24" class="bodym">Aeration, overseeding, cleanup.</text>
      </g>
      <text x="0" y="376" class="ctam">Get a real quote in 48 hrs →</text>
    </g>
  </g>
</svg>

#### Spec block

| Field | Value |
|---|---|
| Surface | `--color-bg-cream` (band); inner card surface `--color-bg` (white) |
| Container | `--container-narrow` (960px) |
| Vertical padding | `py-20` / `py-14` for the band; the inner card uses `p-12` desktop / `p-8` mobile |
| State A spec | Headline (`--text-h2` size, "Starting at $X") + 2-sentence body + CTA-link "See full estimate →" |
| State B spec | Eyebrow "HOW PRICING WORKS" + Headline (`--text-h2` size, "No hidden math.") + 1-line lead + 3 factor columns (each: bold factor name + 2-line explanation) + CTA-link "Get a real quote in 48 hrs →" |
| Toggle | Per-service `pricing.mode` field in the seed table (§4.10) takes `"price"` (State A, requires `pricing.startingAt`) or `"explainer"` (State B, default). Code reads this and renders accordingly. |
| Component tokens | `card` (white inset card on cream band); `link--cta` |
| Motion | `<AnimateIn variant="fade-up">` on the section; the inner card does not animate separately. |
| i18n length budget | Headline ≤ 6 words EN / ≤ 7 ES. Each factor name ≤ 3 words EN / ≤ 4 ES. Factor explanation ≤ 12 words EN / ≤ 15 ES. |
| A11y | `<section aria-labelledby="pricing-h2">`. Factor list is a `<dl>` with `<dt>`/`<dd>` pairs. CTA-link is `<a>` with descriptive label. |

---


### 4.6 Featured projects

Same pattern as audience-landing §3.4 with two differences: 2–3 tiles instead of 3–4 (service detail is more focused), and the CTA-link "View all" links to `/{locale}/projects/?service={slug}` instead of `?audience={…}`.

#### Desktop SVG

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 600" width="100%" role="img" aria-label="Service featured projects — desktop">
  <style>
    .eb { font-family: 'Manrope', system-ui, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.12em; fill: #2F5D27; }
    .h2 { font-family: 'Manrope', system-ui, sans-serif; font-size: 40px; font-weight: 700; letter-spacing: -0.015em; fill: #1A1A1A; }
    .pt { font-family: 'Manrope', system-ui, sans-serif; font-size: 22px; font-weight: 700; fill: #FAF7F1; }
    .meta{ font-family: 'Onest', system-ui, sans-serif; font-size: 13px; font-weight: 500; fill: rgba(250,247,241,0.8); }
    .cta{ font-family: 'Manrope', system-ui, sans-serif; font-size: 15px; font-weight: 600; fill: #2F5D27; }
  </style>
  <rect width="1440" height="600" fill="#FFFFFF"/>
  <g transform="translate(120,80)">
    <text x="0" y="0" class="eb">RECENT WORK</text>
    <text x="0" y="56" class="h2">Lawn-care projects nearby.</text>
    <text x="980" y="56" class="cta">View all lawn-care →</text>
  </g>
  <g transform="translate(120,200)">
    <g>
      <rect width="592" height="332" rx="16" fill="#5B7E4D"/>
      <rect width="592" height="332" rx="16" fill="url(#sfpGrad)"/>
      <text x="24" y="280" class="pt">Naperville HOA, lawn refresh</text>
      <text x="24" y="304" class="meta">Naperville · 2024 · 12,000 sqft</text>
    </g>
    <g transform="translate(616,0)">
      <rect width="464" height="332" rx="16" fill="#7E9D6E"/>
      <rect width="464" height="332" rx="16" fill="url(#sfpGrad)"/>
      <text x="24" y="280" class="pt">Wheaton estate</text>
      <text x="24" y="304" class="meta">Wheaton · 2024</text>
    </g>
  </g>
  <defs>
    <linearGradient id="sfpGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.4" stop-color="rgba(0,0,0,0)"/>
      <stop offset="1" stop-color="rgba(0,0,0,0.7)"/>
    </linearGradient>
  </defs>
</svg>

#### Mobile SVG

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 920" width="100%" role="img" aria-label="Service featured projects — mobile">
  <style>
    .ebm { font-family: 'Manrope', system-ui, sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.12em; fill: #2F5D27; }
    .h2m { font-family: 'Manrope', system-ui, sans-serif; font-size: 28px; font-weight: 700; fill: #1A1A1A; }
    .ptm { font-family: 'Manrope', system-ui, sans-serif; font-size: 19px; font-weight: 700; fill: #FAF7F1; }
    .metam{ font-family: 'Onest', system-ui, sans-serif; font-size: 13px; fill: rgba(250,247,241,0.8); }
    .ctam { font-family: 'Manrope', system-ui, sans-serif; font-size: 15px; font-weight: 600; fill: #2F5D27; }
  </style>
  <rect width="480" height="920" fill="#FFFFFF"/>
  <g transform="translate(20,56)">
    <text x="0" y="0" class="ebm">RECENT WORK</text>
    <text x="0" y="40" class="h2m">Lawn-care projects</text>
    <text x="0" y="74" class="h2m">nearby.</text>
  </g>
  <g transform="translate(20,180)">
    <g>
      <rect width="440" height="320" rx="16" fill="#5B7E4D"/>
      <text x="20" y="270" class="ptm">Naperville HOA refresh</text>
      <text x="20" y="294" class="metam">Naperville · 2024</text>
    </g>
    <g transform="translate(0,344)">
      <rect width="440" height="320" rx="16" fill="#7E9D6E"/>
      <text x="20" y="270" class="ptm">Wheaton estate</text>
      <text x="20" y="294" class="metam">Wheaton · 2024</text>
    </g>
  </g>
  <text x="20" y="800" class="ctam">View all lawn-care →</text>
</svg>

#### Spec block

| Field | Value |
|---|---|
| Surface | `--color-bg` (white) |
| Container | `--container-default` |
| Vertical padding | `py-20` / `py-14` |
| Section header | Eyebrow + H2 + CTA-link top-right ("View all {service-name} →") |
| Content layout | 2 tiles desktop in a 12-col asymmetric split (8/4 — first tile wider to lead the eye); 3 tiles desktop is allowed when more strong photos exist (3-col grid). 1-col stack mobile. |
| Tile composition | Same as audience landing §3.4: 4:3 photo card, gradient overlay, project title + meta in lower-left. No tag pill on service-detail tiles (the service is implicit from page context — saves visual density). |
| Component tokens | `card--photo`; `link--cta` |
| Motion | `<AnimateIn variant="fade-up">` + `<StaggerContainer>` 80ms |
| i18n length budget | H2 ≤ 6 words EN / ≤ 7 ES. CTA-link ≤ 5 words EN / ≤ 6 ES. Tile title ≤ 6 words EN / ≤ 8 ES; meta ≤ 6 words EN / ≤ 8 ES. |
| A11y | `<section aria-labelledby="service-projects-h2">`. Tile is single `<a>`. |

---

### 4.7 FAQ

Same primitive as audience-landing FAQ. **FAQPage schema attached — this is the page's primary SEO surface.** 5–8 service-specific questions per service. Per Plan §17 acceptance, every service page must validate in Google's Rich Results Test.

The visual treatment, container, surface, motion, and A11y notes are **identical to §3.7** — Code reuses the same `<FaqAccordion>` component on both templates with a different `items` prop. The only difference is the data source: audience-landing FAQ items live in `messages/{locale}.json` under `audience.{slug}.faq`; service-detail FAQ items live in the `src/data/services.ts` seed file (per D8).

The JSON-LD payload structure is in §5.

---

### 4.8 Related services

3–4 small tiles linking to other services. **Strategy is per-audience** (Decision **D7**):

- **Residential + Commercial** → within-audience. The lawn-care page links to other Residential services. The commercial-snow page links to other Commercial services. Reasoning: residential and commercial mental models are vendor-bundling ("one team for all my property needs"), so showing other services in the same audience matches the cross-sell expectation.
- **Hardscape** → cross-sell within Hardscape. The patios page links to retaining walls, fire pits, outdoor kitchens — services the same customer is most likely to combine. (For Hardscape, "within-audience" and "cross-sell" collapse to the same set, so this just means tighter curation: 3 most-likely-to-combine services rather than the full 5 other Hardscape services.)

#### Desktop SVG

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 460" width="100%" role="img" aria-label="Related services — desktop">
  <style>
    .eb { font-family: 'Manrope', system-ui, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.12em; fill: #2F5D27; }
    .h2 { font-family: 'Manrope', system-ui, sans-serif; font-size: 36px; font-weight: 700; letter-spacing: -0.015em; fill: #1A1A1A; }
    .rt { font-family: 'Manrope', system-ui, sans-serif; font-size: 18px; font-weight: 700; fill: #1A1A1A; }
    .rb { font-family: 'Onest', system-ui, sans-serif; font-size: 14px; fill: #4A4A4A; }
    .arr{ font-family: 'Manrope', system-ui, sans-serif; font-size: 18px; fill: #2F5D27; }
  </style>
  <rect width="1440" height="460" fill="#FFFFFF"/>
  <g transform="translate(120,64)">
    <text x="0" y="0" class="eb">CUSTOMERS ALSO ASK</text>
    <text x="0" y="56" class="h2">More from Sunset Residential.</text>
  </g>
  <g transform="translate(120,180)">
    <g>
      <rect width="288" height="180" rx="16" fill="#FAF7F1"/>
      <text x="24" y="48" class="rt">Landscape Design</text>
      <text x="24" y="78" class="rb">Custom plans for full-yard</text>
      <text x="24" y="98" class="rb">transformations.</text>
      <text x="246" y="156" class="arr">→</text>
    </g>
    <g transform="translate(304,0)">
      <rect width="288" height="180" rx="16" fill="#FAF7F1"/>
      <text x="24" y="48" class="rt">Sprinkler Systems</text>
      <text x="24" y="78" class="rb">Install, repair, winterize.</text>
      <text x="246" y="156" class="arr">→</text>
    </g>
    <g transform="translate(608,0)">
      <rect width="288" height="180" rx="16" fill="#FAF7F1"/>
      <text x="24" y="48" class="rt">Snow Removal</text>
      <text x="24" y="78" class="rb">2" trigger, 24-hr response.</text>
      <text x="246" y="156" class="arr">→</text>
    </g>
    <g transform="translate(912,0)">
      <rect width="288" height="180" rx="16" fill="#FAF7F1"/>
      <text x="24" y="48" class="rt">Seasonal Cleanup</text>
      <text x="24" y="78" class="rb">Spring + fall, leaves, prep.</text>
      <text x="246" y="156" class="arr">→</text>
    </g>
  </g>
</svg>

#### Mobile SVG

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 880" width="100%" role="img" aria-label="Related services — mobile">
  <style>
    .ebm { font-family: 'Manrope', system-ui, sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.12em; fill: #2F5D27; }
    .h2m { font-family: 'Manrope', system-ui, sans-serif; font-size: 26px; font-weight: 700; fill: #1A1A1A; }
    .rtm { font-family: 'Manrope', system-ui, sans-serif; font-size: 17px; font-weight: 700; fill: #1A1A1A; }
    .rbm { font-family: 'Onest', system-ui, sans-serif; font-size: 14px; fill: #4A4A4A; }
    .arrm{ font-family: 'Manrope', size: 18px; fill: #2F5D27; }
  </style>
  <rect width="480" height="880" fill="#FFFFFF"/>
  <g transform="translate(20,56)">
    <text x="0" y="0" class="ebm">CUSTOMERS ALSO ASK</text>
    <text x="0" y="40" class="h2m">More from Sunset</text>
    <text x="0" y="74" class="h2m">Residential.</text>
  </g>
  <g transform="translate(20,180)">
    <g>
      <rect width="440" height="120" rx="16" fill="#FAF7F1"/>
      <text x="24" y="48" class="rtm">Landscape Design</text>
      <text x="24" y="76" class="rbm">Custom plans, full-yard transformations.</text>
    </g>
    <g transform="translate(0,140)">
      <rect width="440" height="120" rx="16" fill="#FAF7F1"/>
      <text x="24" y="48" class="rtm">Sprinkler Systems</text>
      <text x="24" y="76" class="rbm">Install, repair, winterize.</text>
    </g>
    <g transform="translate(0,280)">
      <rect width="440" height="120" rx="16" fill="#FAF7F1"/>
      <text x="24" y="48" class="rtm">Snow Removal</text>
      <text x="24" y="76" class="rbm">2" trigger, 24-hr response.</text>
    </g>
    <g transform="translate(0,420)">
      <rect width="440" height="120" rx="16" fill="#FAF7F1"/>
      <text x="24" y="48" class="rtm">Seasonal Cleanup</text>
      <text x="24" y="76" class="rbm">Spring + fall.</text>
    </g>
  </g>
</svg>

#### Spec block

| Field | Value |
|---|---|
| Surface | `--color-bg` (white) |
| Container | `--container-default` |
| Vertical padding | `py-16` / `py-12` |
| Section header | Eyebrow + H2 (note H2 size dropped one step from `--text-h2` to bridge into the close — avoids competing with the CTA section's `--text-h1`-amplified close H2) |
| Content layout | 4-col grid desktop (gap-4), 1-col mobile. Each tile is a small card with title + 1-line teaser + arrow chip. **No photo** — these are nav tiles, not browse tiles. |
| Tile composition | `--color-bg-cream` background, `--radius-lg`, p-6, hover: shadow grow + slight scale (1.01). Title (`--text-h4` weight 700) + 1-line teaser (`--text-body-sm`) + arrow chip lower-right (lucide `ArrowRight` 18px in audience-accent color). |
| Component tokens | `card--cream`; lucide |
| Motion | `<AnimateIn variant="fade-up">`; `<StaggerContainer>` 60ms |
| i18n length budget | H2 ≤ 6 words EN / ≤ 7 ES. Title ≤ 4 words EN / ≤ 5 ES. Teaser ≤ 8 words EN / ≤ 10 ES. |
| A11y | `<section aria-labelledby="related-services-h2">`. Each tile is a single `<a>`. `aria-label` on `<a>` = "Learn more about {service-name}". |

---

### 4.9 CTA section

Same pattern as audience-landing §3.8 and homepage §9. Single `Amber × lg`. Cream surface (Hardscape services follow the audience landing's D6 charcoal choice — see §3X.4). Spec is identical to §3.8 with one substitution: H2 placeholder reads "Get started on your [service]" / "Empieza tu [servicio]" (Erick polishes per service). Button label and tel: link unchanged.

---

### 4.10 Per-service content seed (16 rows)

Code in 1.09 + 1.10 reads this seed table to draft per-service content. Erick polishes final copy in Part 2. **The seed lives in `src/data/services.ts`** (per Decision D8) as a typed array; the table below is the human-readable form.

**Field shape per row:**

```ts
type Service = {
  slug: string;                         // 'lawn-care'
  audience: 'residential' | 'commercial' | 'hardscape';
  route: string;                        // '/{locale}/residential/lawn-care/'
  name: { en: string; es: string };
  hero: {
    h1: { en: string; es: string };
    subhead: { en: string; es: string };
    photoSlot: string;                  // 'service.lawn-care.16x9'
  };
  whatsIncluded: { headline: { en: string; es: string }; description: { en: string; es: string }; icon: string }[];   // 3–6 items
  process: { headline: { en: string; es: string }; description: { en: string; es: string } }[];                       // 4–5 items
  whyUs: { headline: { en: string; es: string }; description: { en: string; es: string }; icon: string }[];           // exactly 3
  pricing: { mode: 'price' | 'explainer'; startingAt?: number; explainerFactors?: { name: { en; es }; body: { en; es } }[] };
  faq: { question: { en: string; es: string }; answer: { en: string; es: string } }[];                                // 5–8 items
  related: string[];                    // service slugs, 3–4
  projectsTag: string;                  // for /projects/?service=… filter
};
```

**Seed values (placeholder copy; Erick polishes in Part 2; `pricing.mode` defaults to `'explainer'` for all 16 in Part 1):**

#### Residential (6)

| Slug | H1 EN | What's included (labels) | Process (labels) | Why-us (3) | Related |
|---|---|---|---|---|---|
| `lawn-care` | Lawn Care in Aurora & DuPage County. | Mowing & edging · Fertilization · Weed & pest control · Aeration & overseeding · Cleanup before we leave | Free site visit · Custom estimate · Schedule the work · Service guarantee | Same crew every visit · Bilingual lead · 24-hr service guarantee | landscape-design, sprinkler-systems, snow-removal, seasonal-cleanup |
| `landscape-design` | Landscape Design in DuPage County. | Site walk + listening session · Concept renderings · Plant + materials list · Phased build option · Coordination with hardscape · Aftercare plan | Discovery · Concept · Detailed plan · Build · Aftercare | In-house design + build · 25-yr local experience · Bilingual handoff | lawn-care, tree-services, sprinkler-systems, seasonal-cleanup |
| `tree-services` | Tree Services in Aurora & DuPage. | Pruning · Removal · Stump grinding · Storm response | Inspection · Estimate · Schedule · Cleanup | Insured up to $2M · ISA-trained lead · Same-day storm response | lawn-care, landscape-design, seasonal-cleanup |
| `sprinkler-systems` | Sprinkler Systems in DuPage County. | New install · Repair + audit · Smart-controller upgrade · Spring start-up · Winterization | Site assessment · Quote · Install · Walkthrough | Licensed irrigators · Same-week winterization · 5-yr workmanship warranty | lawn-care, landscape-design, seasonal-cleanup |
| `snow-removal` | Residential Snow Removal in DuPage. | Plowing · Shoveling walks + steps · De-icing · 2" trigger | Pre-season prep · Storm trigger · Service · Post-storm check | 2-hr response after trigger · 24/7 dispatch · Insured fleet | lawn-care, seasonal-cleanup |
| `seasonal-cleanup` | Spring & Fall Cleanup in DuPage. | Leaf removal · Bed cleanup · Pruning · Mulching · Hauling | Estimate · Schedule · Service · Walkthrough | Two-pass leaf system · Same-day haul-off · Free estimate | lawn-care, tree-services, sprinkler-systems |

#### Commercial (4)

| Slug | H1 EN | What's included | Process | Why-us | Related |
|---|---|---|---|---|---|
| `landscape-maintenance` | Commercial Landscape Maintenance in DuPage County. | Mowing + edging · Bed care · Pest + weed · Seasonal color · Cleanup · Quarterly walkthroughs | Site assessment · Proposal + COI · Onboarding · Service · Quarterly review | Dedicated property manager · COI on file before day 1 · Uniformed crews | snow-removal, property-enhancement, turf-management |
| `commercial-snow-removal` | Commercial Snow Removal in DuPage County. | Plowing · Sidewalks · De-icing · 24/7 dispatch · Storm log | Pre-season audit · Contract + COI · Trigger · Service · Reporting | After-hours dispatch · Storm-event reporting · 2-hr response after trigger | landscape-maintenance, property-enhancement |
| `property-enhancement` | Property Enhancement for Commercial Sites. | Bed redesign · Annual color · Refreshed entries · Seasonal lighting · Hardscape repairs | Site walk · Concept · Estimate · Build · Walkthrough | Designer-led upgrades · No-disruption schedule · Single point of contact | landscape-maintenance, turf-management |
| `turf-management` | Commercial Turf Management in DuPage. | Soil testing · Aeration · Overseeding · Fertilization · Weed control · Reporting | Soil baseline · Custom plan · Application · Reporting | Turf-specialist lead · Quarterly reporting · Eco-friendly options | landscape-maintenance, property-enhancement |

#### Hardscape (6) — Related uses cross-sell (D7)

| Slug | H1 EN | What's included | Process | Why-us | Related (cross-sell) |
|---|---|---|---|---|---|
| `patios-walkways` | Patios & Walkways in Aurora & DuPage. | Site grading · Base prep · Paver install · Joint-sand sealing · Edge restraints · Cleanup | Concept · Site survey · Detailed plan · Install · Walkthrough | Unilock-trained crew · 5-yr installation warranty · No subcontractor base prep | retaining-walls, fire-pits-features, outdoor-kitchens |
| `retaining-walls` | Retaining Walls in DuPage County. | Engineering review · Drainage · Geo-grid · Block install · Cap finish | Site survey · Engineering · Permit · Install · Walkthrough | Engineered designs over 4ft · Drainage-first build · Unilock systems | patios-walkways, fire-pits-features, driveways |
| `fire-pits-features` | Fire Pits & Features in DuPage. | Pit design · Surround paving · Gas-line coordination · Seating walls · Sealing | Concept · Plan · Permits · Install · Walkthrough | Licensed gas coordination · Custom designs · Warranty on craft | patios-walkways, outdoor-kitchens, pergolas-pavilions |
| `pergolas-pavilions` | Pergolas & Pavilions in DuPage County. | Footings · Engineering · Frame · Roof · Stain + finish | Concept · Engineering · Permit · Build · Walkthrough | Licensed structural · Premium hardware · Stain warranty | patios-walkways, outdoor-kitchens, fire-pits-features |
| `driveways` | Paver Driveways in Aurora & DuPage. | Excavation · Base prep · Paver install · Edge restraints · Sealing | Site assessment · Plan · Permit · Install · Walkthrough | Unilock-rated structural pavers · 25-yr base spec · Permitting handled | retaining-walls, patios-walkways |
| `outdoor-kitchens` | Outdoor Kitchens in DuPage County. | Layout · Plumbing/gas/electric · Counters · Appliance install · Finish | Concept · Plan · Permits · Build · Walkthrough | Licensed trades coordination · Premium finishes · 5-yr workmanship | patios-walkways, fire-pits-features, pergolas-pavilions |

**FAQ items per service** (≥5 each, ≤8 each — not enumerated here per row to keep this table readable; Code generates per-service `faq` arrays from the audience-level Q&A library in §3X plus 3–4 service-specific Q&As, draft list below). Erick polishes in Part 2.

**Service-specific FAQ drafts (sample — full set in `services.ts`):**

- Lawn Care: How often do you visit? Do you handle fertilizer separately? Can I switch to every-other-week? Do you bill per-visit or seasonally?
- Patios & Walkways: How long does a typical patio take? What pavers do you use? What's the warranty? Do you handle permits?
- Snow Removal (residential): What's your trigger depth? When do you start? Do you de-ice walkways? Can I cancel mid-season?
- Snow Removal (commercial): What's your response SLA? Do you provide storm-event reports? Are de-icers eco-friendly? COI?
- Landscape Design: How long does a design take? Do you build what you design? Can I phase the build over multiple years?
- (etc., one set per service in the seed file)

---


## 5. JSON-LD schema spec per template

The sitewide `LocalBusiness` + `Organization` + `WebSite` from Phase 1.05 chrome continues to wrap; redeclare nothing.

### 5.1 Audience landing — `BreadcrumbList` + `ItemList`

```jsonc
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://sunsetservices.com/" },
    { "@type": "ListItem", "position": 2, "name": "Residential", "item": "https://sunsetservices.com/residential/" }
  ]
}
```

```jsonc
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Residential services",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "url": "https://sunsetservices.com/residential/lawn-care/", "name": "Lawn Care" },
    { "@type": "ListItem", "position": 2, "url": "https://sunsetservices.com/residential/landscape-design/", "name": "Landscape Design" }
    /* …one entry per tile, in render order… */
  ]
}
```

Spanish equivalents emit at `https://sunsetservices.com/es/…` URLs and translated names. Render both as separate `<script type="application/ld+json">` blocks in the page `<head>`.

### 5.2 Service detail — `BreadcrumbList` + `Service` + `FAQPage`

```jsonc
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://sunsetservices.com/" },
    { "@type": "ListItem", "position": 2, "name": "Residential", "item": "https://sunsetservices.com/residential/" },
    { "@type": "ListItem", "position": 3, "name": "Lawn Care", "item": "https://sunsetservices.com/residential/lawn-care/" }
  ]
}
```

```jsonc
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Lawn Care",
  "name": "Lawn Care in Aurora & DuPage County",
  "provider": { "@id": "https://sunsetservices.com/#localbusiness" }, /* refs Phase 1.05 LocalBusiness */
  "areaServed": { "@type": "AdministrativeArea", "name": "DuPage County, Illinois" },
  "audience": { "@type": "Audience", "audienceType": "residential" },
  "url": "https://sunsetservices.com/residential/lawn-care/",
  "offers": { "@type": "Offer", "url": "https://sunsetservices.com/request-quote/?service=lawn-care" }
}
```

```jsonc
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Do you offer one-time visits or only contracts?",
      "acceptedAnswer": { "@type": "Answer", "text": "Both. Most lawn-care customers prefer a seasonal contract for consistency, but we'll do one-time cleanups, design consults, and project work without a recurring commitment." }
    }
    /* …one entry per FAQ item, generated from the same data the visible accordion renders from… */
  ]
}
```

**Generation rule.** The FAQPage payload is built server-side from the same `faq` array the `<FaqAccordion>` consumes. Both share a single source so the rendered HTML and the schema cannot drift. Run Google's Rich Results Test on at least one residential, one commercial, and one hardscape service page in Phase 1.10's smoke test (full audit in Phase 3.05).

---

## 6. Photography brief

Cowork sources from Erick's Drive in Phase 2.04. Slot names, prompts, and crop budgets:

### 6.1 Audience hero photos (3)

| Slot | Subject | Composition | Lighting | Crops needed |
|---|---|---|---|---|
| `hero.residential.16x9` | Front-yard view of a Naperville-style home with mature plantings; lawn in foreground, beds in mid-ground, home corner in background. | No people facing camera; no logos; no clutter; rule-of-thirds with house corner upper-right. | Golden hour, late afternoon. | 16:9 master · 4:3 mobile crop (object-position center-bottom) · 9:16 OG · 4:5 IG |
| `hero.commercial.16x9` | Manicured commercial entry: drive lane, planted island, bldg corner. Crew not visible (or visible at distance, uniformed, back-to-camera). | No people facing camera; no logos. | Even mid-morning light, slight overcast OK. | 16:9 · 4:3 · 9:16 · 4:5 |
| `hero.hardscape.16x9` | Full Unilock paver patio with seating wall + fire feature; backyard. | No people; no logos; styled but not staged. | Sunset, warm tones (matches hardscape amber accent). | 16:9 · 4:3 · 9:16 · 4:5 |

### 6.2 Service hero photos (16)

One per service. Each is the canonical action-shot for that service. Style matches audience hero (golden-hour or even daylight, no people, no logos, premium subject).

| Slot | Service | Subject prompt |
|---|---|---|
| `service.lawn-care.16x9` | Lawn Care | Striped lawn pattern after fresh mow, edged borders. |
| `service.landscape-design.16x9` | Landscape Design | Designed bed with massed perennials, structured stones, focal-point tree. |
| `service.tree-services.16x9` | Tree Services | Crew (silhouetted) pruning a mature oak; ladder + ropes. |
| `service.sprinkler-systems.16x9` | Sprinkler Systems | Rotor head spraying lawn at sunrise; rainbow in mist. |
| `service.snow-removal.16x9` | Snow Removal (residential) | Plowed driveway in heavy snow; tracked snowblower in mid-frame. |
| `service.seasonal-cleanup.16x9` | Seasonal Cleanup | Bagged leaves and clean-edged beds, late autumn. |
| `service.landscape-maintenance.16x9` | Commercial Maintenance | Office-park entry: mowed lawn, trimmed hedges, flowering planter. |
| `service.commercial-snow-removal.16x9` | Commercial Snow | Plowed parking lot at dawn, salt truck in distance. |
| `service.property-enhancement.16x9` | Property Enhancement | Refreshed retail entry with new annuals + uplighting. |
| `service.turf-management.16x9` | Turf Management | Wide-shot manicured commercial turf, soil-test marker. |
| `service.patios-walkways.16x9` | Patios & Walkways | Unilock paver patio, low-angle, golden hour. |
| `service.retaining-walls.16x9` | Retaining Walls | Tiered stone retaining wall with planted terraces. |
| `service.fire-pits-features.16x9` | Fire Pits & Features | Lit fire pit at dusk, paver surround, seating wall. |
| `service.pergolas-pavilions.16x9` | Pergolas & Pavilions | Cedar pergola over patio, stained warm, evening light. |
| `service.driveways.16x9` | Driveways | Paver driveway with banded edge, home in background. |
| `service.outdoor-kitchens.16x9` | Outdoor Kitchens | Outdoor kitchen counter + grill, evening light, no people. |

### 6.3 Service-tile photos (16)

Same subjects as service heroes but cropped to **4:3** (D2). Cowork can derive these from the hero photos at most cases; specify a separate close-up alternative for services where the hero crop doesn't read at tile size (Sprinkler Systems and Tree Services likely need a tighter alternative).

### 6.4 Project tiles (~50–60 across both templates)

Slot per project: `project.{slug}.4x3`. 4–8 projects per service-detail page, 3–4 per audience landing, with overlap. Final count resolved when Cowork finishes portfolio curation in 2.04.

### 6.5 Cross-cutting rules

- No people facing camera (privacy + production-time saved).
- No competitor logos visible.
- No vehicles unless Sunset-branded and clearly intentional (commercial-snow shot is the exception).
- Aspect masters: 16:9 (heroes), 4:3 (tiles), 1:1 (where used). Cowork delivers AVIF + WebP + JPEG fallback at 1920w/1280w/640w/320w sizes.

---

## 7. i18n strings required

**Storage decision (D8):** **Per-service strings live in `src/data/services.ts`** as the typed seed (not in `messages/{locale}.json`). Page-chrome strings (eyebrows, section H2s, FAQ section header, CTA section copy, etc.) live in `messages/{locale}.json` under namespaces `audience.{slug}.*` and `servicePage.*` (shared across all 16 services).

### 7.1 String table — chrome (lives in `messages/{locale}.json`)

| Key | EN | ES | Length budget | Notes |
|---|---|---|---|---|
| `audience.residential.hero.kicker` | RESIDENTIAL | RESIDENCIAL | fixed | uppercased |
| `audience.residential.hero.h1` | Outdoor spaces that feel like home. | Espacios al aire libre que se sienten como hogar. | ≤8 EN / ≤10 ES | [TBR] |
| `audience.residential.hero.subhead` | Lawn care, landscape design, and seasonal services for DuPage County homes. Trusted by 1,200+ neighbors across Aurora, Naperville, and Wheaton. | Cuidado de césped, diseño paisajístico y servicios de temporada para hogares en DuPage County. Confiado por más de 1,200 vecinos en Aurora, Naperville y Wheaton. | ≤30 EN / ≤36 ES | [TBR] |
| `audience.residential.qualifier.h2` | Who this is for. | Para quién es esto. | ≤5 EN / ≤6 ES |  |
| `audience.residential.qualifier.body` | If you own a home in Aurora, Naperville, or Wheaton and want one team for lawn, patio, and snow — this page is for you. | Si tienes una casa en Aurora, Naperville o Wheaton y quieres un solo equipo para césped, patio y nieve, esta página es para ti. | ≤50 EN / ≤60 ES | [TBR] |
| `audience.residential.servicesGrid.eyebrow` | SIX SERVICES · ONE CREW | SEIS SERVICIOS · UN EQUIPO |  |  |
| `audience.residential.servicesGrid.h2` | Services for residential homes. | Servicios para hogares residenciales. |  |  |
| `audience.residential.featuredProjects.eyebrow` | RECENT WORK | TRABAJO RECIENTE |  |  |
| `audience.residential.featuredProjects.h2` | Featured residential projects. | Proyectos residenciales destacados. |  |  |
| `audience.residential.whySunset.eyebrow` | WHY SUNSET | POR QUÉ SUNSET |  |  |
| `audience.residential.whySunset.h2` | Built on twenty-five years. | Construido sobre veinticinco años. |  |  |
| `audience.residential.whySunset.props` (4 entries — see §3X.2) | … | … | each ≤5 + 14 / ≤6 + 17 | [TBR] |
| `audience.residential.socialProof.eyebrow` | FROM YOUR NEIGHBORS | DE TUS VECINOS |  |  |
| `audience.residential.socialProof.h2` | Reviewed by residential homeowners. | Revisado por dueños de casa residenciales. |  | [TBR] |
| `audience.residential.faq.eyebrow` | QUESTIONS · ANSWERED | PREGUNTAS · RESPUESTAS |  |  |
| `audience.residential.faq.h2` | Common questions from homeowners. | Preguntas comunes de propietarios. |  | [TBR] |
| `audience.residential.faq.items[]` | (5 entries from §3X.2) |  | each q ≤12 / ≤14, a ≤60 / ≤72 | [TBR] |
| `audience.residential.cta.eyebrow` | READY WHEN YOU ARE | LISTOS CUANDO TÚ LO ESTÉS |  | [TBR] |
| `audience.residential.cta.h2` | Tell us about the property. | Cuéntanos sobre tu propiedad. |  |  |
| `audience.residential.cta.body` | Free estimate within 48 hours. No high-pressure sales — just a clear quote. | Presupuesto gratis en 48 horas. Sin presiones — solo un precio claro. |  | [TBR] |
| `audience.residential.cta.button` | Get a Free Estimate | Solicita un Presupuesto Gratis | fixed |  |
| `audience.commercial.*` | (parallel set per §3X.3) |  |  | [TBR] |
| `audience.hardscape.*` | (parallel set per §3X.4 + Unilock band keys) |  |  | [TBR] |

### 7.2 String table — service-page chrome (shared across all 16 services)

| Key | EN | ES | Notes |
|---|---|---|---|
| `servicePage.whatsIncluded.eyebrow` | WHAT'S INCLUDED | QUÉ INCLUYE |  |
| `servicePage.whatsIncluded.h2` | Every visit, every time. | En cada visita, cada vez. | [TBR] |
| `servicePage.process.eyebrow` | HOW IT WORKS | CÓMO FUNCIONA |  |
| `servicePage.process.h2` | Our process — {steps} steps. | Nuestro proceso — {steps} pasos. | interpolated |
| `servicePage.whyUs.eyebrow` | WHY SUNSET FOR {service} | POR QUÉ SUNSET PARA {service} | uppercased; interpolated |
| `servicePage.whyUs.h2` | Three reasons it's worth the call. | Tres razones para llamarnos. | [TBR] |
| `servicePage.pricing.explainer.eyebrow` | HOW PRICING WORKS | CÓMO FUNCIONAN LOS PRECIOS |  |
| `servicePage.pricing.explainer.h2` | No hidden math. | Sin matemáticas ocultas. | [TBR] |
| `servicePage.pricing.price.startingAt` | Starting at ${{price}} | Desde ${{price}} | interpolated |
| `servicePage.featuredProjects.eyebrow` | RECENT WORK | TRABAJO RECIENTE |  |
| `servicePage.featuredProjects.h2` | {service} projects nearby. | Proyectos de {service} cerca. | interpolated |
| `servicePage.faq.eyebrow` | QUESTIONS · ANSWERED | PREGUNTAS · RESPUESTAS |  |
| `servicePage.faq.h2` | {service} questions, answered. | Preguntas sobre {service}. | interpolated |
| `servicePage.related.eyebrow` | CUSTOMERS ALSO ASK | LOS CLIENTES TAMBIÉN PIDEN |  |
| `servicePage.related.h2.residential` | More from Sunset Residential. | Más de Sunset Residencial. |  |
| `servicePage.related.h2.commercial` | More from Sunset Commercial. | Más de Sunset Comercial. |  |
| `servicePage.related.h2.hardscape` | Often combined with this. | Frecuentemente combinado con esto. | hardscape uses cross-sell phrasing |
| `servicePage.cta.eyebrow` | READY WHEN YOU ARE | LISTOS CUANDO TÚ LO ESTÉS |  |
| `servicePage.cta.h2` | Get started on your {service}. | Empieza tu {service}. | interpolated |
| `servicePage.cta.button` | Get a Free Estimate | Solicita un Presupuesto Gratis |  |

### 7.3 Per-service strings — live in `src/data/services.ts` (D8)

Per-row schema in §4.10. 16 services × ~6 string slots each in EN+ES = ~190 strings outside the `messages/*.json` files. Reasoning: keeps `messages/*.json` lean and pre-shapes the data model for the Sanity migration in Phase 2.03.

All strings marked `[TBR]` go to a native-Spanish reviewer in Phase 2.13.

---

## 8. Motion choreography

### Audience landing — order of motion

| # | Section | Wrapper | Notes |
|---|---|---|---|
| 1 | Hero | none (LCP) | first-paint render |
| 2 | Who this is for | `<AnimateIn variant="fade-up">` + nested `<StaggerContainer>` (pills) | 1 client island |
| 3 | Services grid | `<AnimateIn>` (header) + `<StaggerContainer>` (tiles, 80ms) | 1 client island |
| 4 | Featured projects | `<AnimateIn>` + `<StaggerContainer>` | 1 client island |
| 5 | Why Sunset | `<AnimateIn>` + `<StaggerContainer>` | 1 client island |
| 6 | Social proof | `<AnimateIn>` + `<StaggerContainer>` (testimonials only; credentials row static) | 1 client island |
| 7 | FAQ | **header only** wraps `<AnimateIn>`; items themselves are server-rendered `<details>` | 1 client island for header (FAQ accordion is a separate client island per item interaction, but does not wrap in `<AnimateIn>`) |
| 8 | CTA | `<AnimateIn>` | 1 client island |

**Total client islands per audience landing: 7 `<AnimateIn>` wrappers + 1 navbar (chrome) = 8 — one fewer than the homepage's 7+navbar+footer overlay (Phase 1.07). The Hardscape Unilock band adds a 9th.** Per Phase 1.07's lesson, do not exceed this count.

### Service detail — order of motion

| # | Section | Wrapper |
|---|---|---|
| 1 | Hero | none |
| 2 | What's included | `<AnimateIn>` + `<StaggerContainer>` (60ms) |
| 3 | Process | `<AnimateIn>` + `<StaggerContainer>` (100ms — slower, sequence-reading) |
| 4 | Why us | `<AnimateIn>` + `<StaggerContainer>` |
| 5 | Pricing | `<AnimateIn>` |
| 6 | Featured projects | `<AnimateIn>` + `<StaggerContainer>` |
| 7 | FAQ | header only (same rule as audience landing) |
| 8 | Related | `<AnimateIn>` + `<StaggerContainer>` (60ms) |
| 9 | CTA | `<AnimateIn>` |

**Total: 8 sections wrapped in `<AnimateIn>` (FAQ is the only one without; section 1 is the hero). Same headcount as audience landing — does not exceed homepage budget.**

**Reduced-motion contract:** `MotionConfig reducedMotion="user"` from Phase 1.04 already collapses all entrance variants to opacity-only at `--motion-fast` (120ms). No per-section opt-out needed; FAQ accordion height transitions also drop to instant. Hover scales on photo cards remove; shadow + chip color on hover stay.

---

## 9. Accessibility audit per template

### Heading hierarchy

Both templates: `<h1>` in hero only. Each section is `<section aria-labelledby="…-h2">` with an `<h2>` inside. Sub-items (process steps, value props, FAQ questions, what's-included items, related-service titles) are `<h3>`. No `<h4>` skips — the typographic `--text-h4` token is fine to use for visual size on `<h3>` elements.

### Focus order + visible state

Tab order follows DOM order. Focus-visible ring: 2px `--color-sunset-green-500`, 2px offset, on all interactive elements (Phase 1.03 §8.4). Service-tile cards focus the wrapping `<a>` — not the inner photo or text. FAQ accordion: `Tab` between `<summary>` rows; `Enter` or `Space` toggles open state.

### Alt text rules

| Slot | Rule |
|---|---|
| Hero photo | `alt=""` (decorative — H1 carries page meaning); fallback to descriptive alt only if Erick provides per-photo context. |
| Service-tile photos | `alt=""` (the service-name overlay carries meaning). |
| Project-tile photos | Descriptive alt when title alone is insufficient: e.g., "Aerial of paver patio with fire feature, Naperville, 2024." Otherwise `alt=""`. |
| Why-Sunset icons | Decorative (`aria-hidden="true"`); the value-prop's text is the meaning. |
| Process step numerals | Decorative (`aria-hidden="true"`); the `<ol>`/`<li>` semantics carry order. |
| Unilock badge (Hardscape) | `alt="Unilock Authorized Contractor"` — semantic, this badge carries meaning. |

### FAQ accordion keyboard support

`Enter` + `Space` on `<summary>` toggle open/closed. `Tab` moves to next `<summary>`. `Esc` does **not** close (inconsistent with browser-native `<details>` — leave native behavior alone). Open state is announced natively by `<details>`.

### Color-contrast spot-checks

- White text on hero gradient lower 50%: ≥4.5:1 (verify per-image at Code time using Phase 1.06 hero contrast tooling).
- Audience-accent-700 (Hardscape kicker) on cream surface: ≥4.5:1 (already verified in Phase 1.03 §2.2 row 8).
- `--color-sunset-amber-200` stat strip on charcoal (Hardscape Unilock band): ≥4.5:1 — verify with the implementation.
- Cream-on-white card shadows (`--shadow-on-cream`): visual contrast is the spec; not a contrast-ratio item.

### Bottom-line

WCAG 2.2 AA. No new patterns introduced beyond what Phase 1.03 + 1.06 already audited; the only new surface is the Hardscape charcoal Unilock band, which inherits Phase 1.03's verified `--color-text-on-dark` palette.

---

## 10. Lighthouse 95+ implications

What Code in 1.09 + 1.10 must do to keep these pages above 95:

- **Hero image discipline.** Same as homepage: `priority`, `fetchPriority="high"`, AVIF + WebP + JPEG fallback, `placeholder="blur"`, ≤350KB at 1920w, explicit dimensions. Single hero image per page.
- **Total page weight target.** ≤1.5MB on first load, ≤500KB JS — same as homepage.
- **Lazy-load below-the-fold.** Every image below the services grid (audience) or "What's included" (service) gets `loading="lazy"` + `decoding="async"`. Hero is eager.
- **`content-visibility: auto`** + `contain-intrinsic-size: auto 720px` on every below-hero `<section>` per Phase 1.07 §13. Makes off-screen sections render-skipped until scroll-near.
- **No third-party scripts in Part 1.** No analytics tag, no chat-bubble vendor, no font-loader other than `next/font`. (Plan §11 chat is shipped behind an off-by-default flag.)
- **Server components by default.** Only client islands: `<AnimateIn>`, `<StaggerContainer>`, `<FaqAccordion>` (per item interactivity), the navbar (Phase 1.05). The client-component count per page must not exceed homepage's 7 `<AnimateIn>` + nav + footer-overlay-on-mobile.
- **FAQ section's no-wrapper-per-item rule.** Audience FAQ + service FAQ together cover 4–8 + 5–8 items per page. Wrapping each in `<AnimateIn>` would multiply the client-island count beyond budget. The rule (§3.7 + §4.7): the FAQ section header animates; the items themselves render server-side as `<details>` and progressively enhance to client-side on first interaction. This is the primary lever for closing the homepage's mobile P=86 gap on these new templates.
- **`<StaggerContainer>` count.** Both templates use 5 (audience landing: pills, services tiles, project tiles, why-sunset tiles, testimonials) and 5 (service detail: included items, process steps, why-us tiles, project tiles, related tiles). Phase 1.04 `<StaggerContainer>` already runs as a single client component per section — the children themselves are not separate clients. Stagger-count is bounded.
- **Critical CSS.** Tokens + base + chrome + hero styles ship inline; everything else is loaded via the route's CSS bundle (Next defaults).
- **Font loading.** Manrope + Onest preloaded with `next/font` (subset latin); ES adds latin-ext subset. No FOIT (Phase 1.03 §3.4).

Code runs Lighthouse on `localhost:3000` for one residential audience landing + one residential service page during 1.09 sign-off; Phase 1.10 spot-checks one Hardscape page (because the Unilock band + charcoal CTA are the only structural divergence).

---

## 11. Component file plan for Code

```
src/components/sections/audience/
  AudienceHero.tsx            # server — composes the audience hero
  AudienceQualifier.tsx       # server — "who this is for"
  AudienceServicesGrid.tsx    # server — services tiles
  AudienceFeaturedProjects.tsx
  AudienceWhyUs.tsx
  AudienceUnilockBand.tsx     # Hardscape only — conditionally rendered
  AudienceSocialProof.tsx
  AudienceFAQ.tsx             # server — wraps <FaqAccordion>
  AudienceCTA.tsx
src/components/sections/service/
  ServiceHero.tsx
  ServiceWhatsIncluded.tsx
  ServiceProcess.tsx
  ServiceWhyUs.tsx
  ServicePricing.tsx          # renders State A or State B based on pricing.mode
  ServiceFeaturedProjects.tsx
  ServiceFAQ.tsx              # server — wraps <FaqAccordion>
  ServiceRelated.tsx
  ServiceCTA.tsx
src/components/ui/
  FaqAccordion.tsx            # client — shared between audience + service FAQs
  Breadcrumb.tsx              # shared — confirm Phase 1.05 ownership; promote here if not
  AnimateIn.tsx               # already exists — Phase 1.04
  StaggerContainer.tsx        # already exists — Phase 1.04
src/app/[locale]/[audience]/page.tsx                # dynamic route, 3 audiences
src/app/[locale]/[audience]/[service]/page.tsx      # dynamic route, 16 services
src/data/services.ts                                # the seed table from §4.10, typed
src/lib/schema/breadcrumb.ts                        # builds BreadcrumbList payloads
src/lib/schema/service.ts                           # builds Service + FAQPage payloads
src/messages/en.json                                # adds audience.* + servicePage.* namespaces
src/messages/es.json                                # same
```

**Naming-conflict check:** the homepage owns `Home*` section components (`HomeHero`, `HomeProjectsTeaser`, etc.) per Phase 1.07. These templates use `Audience*` and `Service*` prefixes — no collision. Folder namespacing (`sections/audience/`, `sections/service/`, `sections/home/`) further isolates.

---

## 12. Decisions needed

Each decision lists 2–3 options + recommendation + reasoning. Claude Chat ratifies before the Phase 1.09 Code prompt is produced.

### D1 — Audience-hero & service-hero layout

Options:
- A. **Layout A** (full-bleed photo + dark gradient + text overlay), at 60vh / 52vh respectively
- B. **Layout B** (compact split-hero: photo right + cream copy panel left)

**Recommendation: A, smaller scale.** First-impression consistency with the homepage. Mature visual language. Layout B works for a docs page but undercuts the trust-photo-as-proof premise. Same answer for service-detail hero.

### D2 — Service tile aspect ratio + treatment

Options:
- A. **4:3 photo card with overlay** (recommended)
- B. 1:1 photo card with text below
- C. No-photo "icon + text" tile

**Recommendation: A.** Matches homepage projects-teaser pattern. Photo is the trust signal for premium homeowners; B's "text below" treatment doubles vertical space for less proof value; C reads as a docs index, not a curated service catalog.

### D3 — "What's included" responsive layout

Options:
- A. 2-col desktop / 1-col mobile (consistent regardless of item count)
- B. **Adaptive: 3-col desktop for 5–6 items, 2-col for 4, 1-col for 3** (recommended)

**Recommendation: B.** A 3-col grid reads as a list at 6 items but a 2-col grid at 4 items reads denser without feeling sparse. Single-rule layouts misfit at the extremes (3 items in a 3-col grid stretches awkwardly; 6 items in a 2-col grid is too tall).

### D4 — Process visual treatment

Options:
- A. **Numbered cards on a dashed connecting hairline** (recommended)
- B. Chevron-separated cards
- C. Vertical timeline at all widths

**Recommendation: A.** Chevrons read as marketing-arrow-stack; A reads as quietly engineered (matches Sunset's restrained brand). C kills horizontal rhythm at desktop.

### D5 — Pricing transparency block strategy

Options:
- A. Always show "Starting at $X"
- B. Always show price range
- C. Always show "How pricing works" (no numbers)
- D. **Per-service toggle: State A when Erick confirms a price, State B (explainer) by default** (recommended)

**Recommendation: D.** Lets Part 1 ship without per-service pricing input; State A switches on as Erick confirms. Toggle field: `pricing.mode` in `services.ts` seed. State A and State B occupy the same vertical footprint to keep alternation invariant.

### D6 — Charcoal band on these templates

Options:
- A. Charcoal-only on the Hardscape Unilock band (recommended)
- B. Also charcoal on the service-detail process band
- C. No charcoal anywhere; keep it for footer only

**Recommendation: A.** The Hardscape Unilock band is a deliberate dark moment — it elevates the credential. Adding charcoal to the process band would push the dark moment into a routine slot and dilute it. Plan §5 says "occasional intentional dark moments"; one per template-variant is the right cadence. Hardscape's CTA section also flips to charcoal as the close pairing.

### D7 — Related-services strategy

Options:
- A. Always within-audience
- B. Always cross-sell
- C. **Mixed: within-audience for Residential + Commercial; cross-sell for Hardscape** (recommended)

**Recommendation: C.** Residential + Commercial visitors mentally bundle by vendor (one team for the property); Hardscape visitors mentally bundle by project (the patio + the wall + the fire feature).

### D8 — i18n storage for service content

Options:
- A. `messages/{locale}.json` with namespace
- B. **`src/data/services.ts` typed seed file** (recommended)

**Recommendation: B.** Keeps `messages/*.json` lean (chrome strings only). Pre-shapes the schema for the Phase 2.03 Sanity migration. Type safety on per-service content.

### D9 — Featured-card use

Options:
- A. **None on either template** (recommended)
- B. Highlight one tile in the services grid as featured
- C. Featured testimonial card

**Recommendation: A.** Phase 1.06 banned it on the homepage. The audience-landing's services grid is uniform-by-design — featuring one would imply hierarchy Erick has not confirmed. Featured-card returns when a future page (e.g., packages) needs the emphasis.

### D10 — Where the navbar phone CTA shows on these pages

Options:
- A. Always (matches Phase 1.05 default)
- B. **Always; service-detail hero adds an additional in-hero `tel:` ghost CTA for highest-intent visitors** (recommended; documented in §4.1)

**Recommendation: B.** Service-detail visitors are the most ready-to-call cohort on the site. The hero's secondary CTA is a phone link — duplicates the navbar but takes pressure off the navbar's small target on mobile. Audience landings use "View [Audience] Projects" as the secondary CTA per §3.1 because the audience-landing visitor is one click further from "ready to call."

---

## 13. Verification checklist

To run after Phase 1.09 + 1.10 implements.

### Audience landing

- [ ] Audience hero matches §3.1 reference (composition, gradient, breadcrumb, kicker, CTA pair) for all three variants.
- [ ] Audience-accent token applied: Residential green, Commercial neutral, Hardscape amber-700.
- [ ] Hardscape variant renders the Unilock band per §3X.5; Residential + Commercial do not.
- [ ] No entrance animation on the hero.
- [ ] H1 ≤ 8 words EN / ≤ 10 ES.
- [ ] Services grid tile counts: 6 / 4 / 6.
- [ ] Single body amber CTA per page (`document.querySelectorAll('main .btn--amber').length === 1`); located in the final CTA section.
- [ ] Surface alternation matches §2.2 — never two adjacent same-surface bands.
- [ ] All `audience.*` strings present in both `en.json` and `es.json`.
- [ ] BreadcrumbList + ItemList JSON-LD present and valid in Google's Rich Results Test for all three landings.
- [ ] LCP-discipline checks: hero photo `priority`, AVIF + WebP, ≤ 350KB at 1920w, explicit dimensions, blur placeholder.
- [ ] Lighthouse mobile + desktop ≥ 95 on Performance, Accessibility, Best Practices, SEO for one Residential landing.
- [ ] Reduced-motion verified: hero unchanged; entrance animations collapsed to opacity-only at 120ms; FAQ height transition removed.
- [ ] `content-visibility: auto` on every below-hero section.
- [ ] Heading hierarchy H1 → H2 → H3, no skips.

### Service detail

- [ ] Service hero matches §4.1 reference for all 16 services.
- [ ] Breadcrumb 3-level (Home / Audience / Service) with `aria-current="page"` on last item.
- [ ] H1 ≤ 9 words EN / ≤ 11 ES; local qualifier inside budget.
- [ ] What's-included responsive layout matches §4.2 D3 rule for 3, 4, 5, and 6 items.
- [ ] Process renders as a process (numbered + connecting line/timeline), not a list.
- [ ] Pricing block in State B (default) for all 16 services in Part 1; State A toggle proven with at least one fixture row in Part 2.
- [ ] Featured projects 2–3 tiles desktop.
- [ ] FAQ has ≥ 5 and ≤ 8 questions per service; FAQPage schema valid in Google's Rich Results Test for at least one residential, one commercial, one hardscape service.
- [ ] Related-services strategy matches §4.8 D7: within-audience for Residential + Commercial, cross-sell for Hardscape.
- [ ] Single body amber CTA per page.
- [ ] Per-service strings present in `src/data/services.ts`; chrome strings in `messages/{locale}.json`.
- [ ] BreadcrumbList + Service + FAQPage JSON-LD valid.
- [ ] Lighthouse mobile + desktop ≥ 95 for one residential service page; spot-check one Hardscape service.
- [ ] Reduced-motion verified.
- [ ] `content-visibility: auto` on every below-hero section.

### Cross-template

- [ ] Navbar over-hero state activates on both heroes (`data-over-hero` attribute).
- [ ] No third-party scripts on either template.
- [ ] Server components by default; client islands count ≤ homepage budget.
- [ ] No `.card--featured` use on either template.
- [ ] Native-Spanish reviewer signs off on all `[TBR]` strings in Phase 2.13 (out of scope for 1.09 + 1.10 but noted).

---

**End of Phase 1.08 Design Handover.**
