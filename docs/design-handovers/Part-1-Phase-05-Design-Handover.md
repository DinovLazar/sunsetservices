# Sunset Services — Navbar, Footer & Base Layout Handover (Phase 1.05)

> Read by Claude Code in Phase 1.05 (Code) before any chrome implementation begins.
> Source of truth: this file. Conflicts with Phase 1.03 tokens? **Phase 1.03 wins.** Surface the mismatch to Claude Chat.
> Phase: Part 1 — Phase 05 (Design). Operator: Claude Design.

---

## Table of contents

1. [Scope and constraints](#1-scope-and-constraints)
2. [Information architecture (navbar)](#2-information-architecture-navbar)
3. [Desktop navbar](#3-desktop-navbar)
4. [Mobile navbar](#4-mobile-navbar)
5. [Footer](#5-footer)
6. [Language switcher](#6-language-switcher)
7. [Skip-link integration](#7-skip-link-integration)
8. [Base shell layout](#8-base-shell-layout)
9. [Motion choreography](#9-motion-choreography)
10. [Accessibility — full audit](#10-accessibility--full-audit)
11. [i18n strings required](#11-i18n-strings-required)
12. [Component file plan for Code](#12-component-file-plan-for-code)
13. [Decisions needed](#13-decisions-needed)
14. [Verification checklist](#14-verification-checklist)

---

## 1. Scope and constraints

This handover finalizes **the chrome that wraps every page** — the desktop and mobile navbar, footer, language switcher, skip-link, and the base shell that hosts them. It is the visual + structural spec Claude Code reads in Phase 1.05 (Code) before writing any layout components. It does **not** cover hero compositions, page bodies, or any content below the navbar; those land in Phase 1.06+.

**What is locked from earlier phases and treated as inputs, not redesign targets:**

- Tokens, palette, typography, motion presets, shadows, spacing, focus ring, and z-index — all from `Part-1-Phase-03-Design-Handover.md`. This phase consumes those tokens; it does not invent new ones.
- IA top-level entries — from `Sunset-Services-Plan.md` §3.
- Bilingual approach — from Plan §10.
- CallRail mobile tap-to-call requirement — from Plan §11.3.
- Charcoal as footer surface — from Plan §5.

**Constraints carried throughout:**

- Light mode only.
- WCAG 2.2 AA: every interactive element ≥44×44 CSS px, every focus state visible, every text-on-surface pairing in chrome cleared in Phase 1.03 §2.2.
- Bilingual EN + ES: every chrome string lives in `messages/en.json` and `messages/es.json` under a `chrome` namespace.
- `motion v12` from `motion/react`. `MotionConfig reducedMotion="user"` already mounted (Phase 1.04).
- Chrome client surface kept minimal: only the mobile drawer, the mega-panel, and the language switcher need client interactivity. Everything else is a Server Component.

**Amber discipline (ratification of the standing rule).** The site-wide primary CTA — "Get a Free Estimate" — is the **one** amber surface that lives in the navbar. Per-page amber CTAs are defined as the *single* amber CTA inside each page's `<main>`. The navbar's amber and the page body's amber are intentionally the same brand affordance: the same call ("Get a Free Estimate") rendered twice in two zones (chrome + body) so that scrolling never costs the user a quote-button. They are coordinated, not competing — they never appear inside the same viewport at the same time *unless* the navbar is in its scrolled state and the in-body amber has scrolled past, which is the desired hand-off behavior. **Lock:** the navbar amber CTA does not count against a page's "one amber per page" budget; it is chrome.

---

## 2. Information architecture (navbar)

### 2.1 Top-level model (locked)

| Order | Label (EN) | Label (ES) | Behavior | Target |
|---|---|---|---|---|
| 1 | **Services** | Servicios | Mega-panel (hover + click + keyboard) | No standalone route — opens panel only |
| 2 | **Projects** | Proyectos | Direct link | `/projects/` |
| 3 | **Service Areas** | Áreas de Servicio | Direct link | `/service-areas/` |
| 4 | **About** | Nosotros | Direct link | `/about/` |
| 5 | **Resources** | Recursos | Mega-panel (small — two columns) | Combines `/resources/` + `/blog/` indexes |
| 6 | **Contact** | Contacto | Direct link | `/contact/` |
| — | Phone CTA | Phone CTA | Tel link with click-tracking attr | `tel:+16309469321` |
| — | Language switcher | Language switcher | Inline segmented control | EN ↔ ES, path-preserving |
| — | **Get a Free Estimate** | Solicitar Presupuesto Gratis | Amber `md` button | `/request-quote/` |

### 2.2 Decisions made in this section

- **"Services" is a mega-panel, not a flat dropdown.** The IA has 16 service pages across three audiences. A flat dropdown of 19 entries (3 landings + 16 services) is unusable; a mega-panel keeps click-depth at one and shows the audience grouping visually.
- **"Resources" combines `/resources/` and `/blog/`** under one nav parent. They are distinct routes but both serve the "learn more" intent and a single nav parent halves the cognitive load of the top bar. The mega-panel renders two columns: *Resources* (link to `/resources/` + 4 highlighted articles loaded from Sanity in Part 2) and *Blog* (link to `/blog/` + the 3 most recent posts).
- **Phone is desktop-visible AND mobile always-on.** Desktop: small `Call (630) 946-9321` link to the left of the language switcher. Mobile: phone icon button to the **left** of the hamburger, always tappable, never inside the drawer. (Drawer also contains a phone CTA — the mobile bar is for the always-on call affordance; the drawer's CTA is for users who opened the menu and want to dial.)
- **Get-a-Quote stays amber.** This is the navbar's exception zone (see §1 amber discipline).

### 2.3 Mega-panel: Services — content model

Three columns, equal width on desktop (≥1024). Each column header is the audience landing (clickable). Below the header sits the audience's service list — also clickable.

| Column | Header (EN / ES) | Header link | Children |
|---|---|---|---|
| 1 | **Residential** / Residencial | `/residential/` | Lawn Care, Landscape Design, Tree Services, Sprinkler Systems, Snow Removal, Seasonal Cleanup |
| 2 | **Commercial** / Comercial | `/commercial/` | Landscape Maintenance, Snow Removal, Property Enhancement, Turf Management |
| 3 | **Hardscape** / Hardscape | `/hardscape/` | Patios & Walkways, Retaining Walls, Fire Pits & Features, Pergolas & Pavilions, Driveways, Outdoor Kitchens |

Visual differentiation between audience header and service link: the header uses `--text-h6` (17px desktop) at weight 700 in `--color-sunset-green-700` with a 1px hairline below in `--color-border`; service links use `--text-body-sm` (15px) at weight 500 in `--color-text-secondary`, hover → `--color-sunset-green-700`. The whole column header is itself a link to the audience landing.

A right-aligned **fourth column** (≥1280px only — collapses below) shows a single 16:9 photographic teaser card with a one-line caption "See recent projects →" linking to `/projects/`. This costs nothing structurally and gives the panel a visual focal point. Below 1280px, the photo is hidden via `lg:hidden xl:block`.

### 2.4 Mega-panel: Resources — content model

Two columns, equal width.

| Column | Header (EN / ES) | Header link | Children |
|---|---|---|---|
| 1 | **Resources** / Recursos | `/resources/` | 4 featured guides (Sanity-driven; placeholders in Part 1) |
| 2 | **Blog** / Blog | `/blog/` | Latest 3 posts (Sanity-driven; placeholders in Part 1) |

In Part 1 the children are static text from `messages/en.json` (e.g. "Spring Lawn Care Calendar") so the panel renders identically to its production behavior; Part 2 swaps to Sanity reads.

---

## 3. Desktop navbar

### 3.1 Geometry (locked)

| Property | Value | Token |
|---|---|---|
| Row height | 72px | hard-coded |
| Container | `--container-wide` (1440px) | from §4.3 of 1.03 |
| Horizontal padding | `px-4 sm:px-6 lg:px-8 xl:px-12` | from §4.4 of 1.03 |
| Logo padding | 16px horizontal | from §4.2 of 1.03 |
| Logo wordmark cap-height | ~22–24px (Manrope 700) | derived |
| Nav link gap | 32px (`--spacing-8`) between items | locked |
| Nav link font | `--font-body`, 15px, **weight 500** (rest), 600 (active page) | from 1.03 §3 |
| z-index | `--z-sticky` (20) | from 1.03 §8.1 |
| Position | `sticky; top: 0` on every page | locked |

### 3.2 Three states — visual reference

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 360" width="100%" role="img" aria-label="Desktop navbar — three states">
  <style>
    .nv  { font-family: 'Onest', system-ui, sans-serif; font-size: 15px; font-weight: 500; }
    .wm  { font-family: 'Manrope', system-ui, sans-serif; font-size: 22px; font-weight: 700; }
    .ph  { font-family: 'Onest', system-ui, sans-serif; font-size: 14px; font-weight: 500; }
    .btn { font-family: 'Manrope', system-ui, sans-serif; font-size: 15px; font-weight: 600; }
    .lbl { font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #6B6B6B; }
    .anno{ font-family: 'Onest', system-ui, sans-serif; font-size: 10px; fill: #4A4A4A; font-style: italic; }
  </style>
  <!-- Background page tone for context -->
  <rect width="1440" height="360" fill="#FAF7F1"/>

  <!-- STATE A: At top, on white-surface page -->
  <text x="48" y="20" class="lbl">A — At top of page (most pages, surface = #FFFFFF)</text>
  <g transform="translate(0,28)">
    <rect width="1440" height="72" fill="#FFFFFF"/>
    <line x1="0" y1="72" x2="1440" y2="72" stroke="#E5E0D5" stroke-width="1"/>
    <!-- logo mark + wordmark -->
    <circle cx="76" cy="36" r="16" fill="#4D8A3F"/>
    <path d="M68 40 Q76 26 84 40" stroke="#FAF7F1" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <text x="100" y="42" class="wm" fill="#1A3617">Sunset Services</text>
    <!-- nav links -->
    <text x="380" y="42" class="nv" fill="#1A1A1A">Services</text>
    <path d="M450 38 l5 5 l5 -5" stroke="#1A1A1A" stroke-width="1.5" fill="none"/>
    <text x="490" y="42" class="nv" fill="#1A1A1A">Projects</text>
    <text x="572" y="42" class="nv" fill="#1A1A1A">Service Areas</text>
    <text x="694" y="42" class="nv" fill="#1A1A1A">About</text>
    <text x="754" y="42" class="nv" fill="#1A1A1A">Resources</text>
    <path d="M838 38 l5 5 l5 -5" stroke="#1A1A1A" stroke-width="1.5" fill="none"/>
    <text x="878" y="42" class="nv" fill="#1A1A1A">Contact</text>
    <!-- right cluster: phone, lang, CTA -->
    <text x="982" y="42" class="ph" fill="#2F5D27">Call (630) 946-9321</text>
    <g transform="translate(1148,22)">
      <rect width="68" height="28" rx="6" fill="#2F5D27"/>
      <text x="14" y="19" class="ph" fill="#FAF7F1">EN</text>
      <text x="42" y="19" class="ph" fill="#6B6B6B">ES</text>
    </g>
    <g transform="translate(1232,18)">
      <rect width="184" height="36" rx="8" fill="#E8A33D"/>
      <text x="92" y="23" class="btn" text-anchor="middle" fill="#1A1A1A">Get a Free Estimate</text>
    </g>
    <text x="48" y="118" class="anno">Solid bg #FFFFFF · 1px bottom border --color-border · no shadow · nav links rest #1A1A1A weight 500</text>
  </g>

  <!-- STATE B: At top of HOMEPAGE (over hero photo, translucent + blur) -->
  <text x="48" y="148" class="lbl">B — Top of homepage over hero photo (translucent · backdrop-blur, ONLY allowed blur in v1)</text>
  <g transform="translate(0,156)">
    <!-- simulate photo behind -->
    <rect width="1440" height="72" fill="#3F5C2F"/>
    <rect width="1440" height="72" fill="url(#heroNoise)" opacity="0.4"/>
    <rect width="1440" height="72" fill="rgba(255,255,255,0.78)"/>
    <!-- logo + wordmark -->
    <circle cx="76" cy="36" r="16" fill="#4D8A3F"/>
    <path d="M68 40 Q76 26 84 40" stroke="#FAF7F1" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <text x="100" y="42" class="wm" fill="#1A3617">Sunset Services</text>
    <!-- nav links -->
    <text x="380" y="42" class="nv" fill="#1A1A1A">Services</text>
    <text x="490" y="42" class="nv" fill="#1A1A1A">Projects</text>
    <text x="572" y="42" class="nv" fill="#1A1A1A">Service Areas</text>
    <text x="694" y="42" class="nv" fill="#1A1A1A">About</text>
    <text x="754" y="42" class="nv" fill="#1A1A1A">Resources</text>
    <text x="878" y="42" class="nv" fill="#1A1A1A">Contact</text>
    <text x="982" y="42" class="ph" fill="#2F5D27">Call (630) 946-9321</text>
    <g transform="translate(1148,22)">
      <rect width="68" height="28" rx="6" fill="#2F5D27"/>
      <text x="14" y="19" class="ph" fill="#FAF7F1">EN</text>
      <text x="42" y="19" class="ph" fill="#6B6B6B">ES</text>
    </g>
    <g transform="translate(1232,18)">
      <rect width="184" height="36" rx="8" fill="#E8A33D"/>
      <text x="92" y="23" class="btn" text-anchor="middle" fill="#1A1A1A">Get a Free Estimate</text>
    </g>
    <text x="48" y="118" class="anno">background: rgba(255,255,255,0.78) · backdrop-filter: blur(8px) · no border · no shadow</text>
  </g>

  <!-- STATE C: Scrolled, on any page -->
  <text x="48" y="270" class="lbl">C — Scrolled (any page, after 24px of vertical scroll)</text>
  <g transform="translate(0,278)">
    <rect width="1440" height="72" fill="#FFFFFF"/>
    <rect width="1440" height="2" y="72" fill="#E5E0D5" opacity="0.6"/>
    <!-- soft drop shadow -->
    <rect width="1440" height="8" y="72" fill="url(#scrollShadow)"/>
    <circle cx="76" cy="36" r="16" fill="#4D8A3F"/>
    <path d="M68 40 Q76 26 84 40" stroke="#FAF7F1" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <text x="100" y="42" class="wm" fill="#1A3617">Sunset Services</text>
    <text x="380" y="42" class="nv" fill="#1A1A1A">Services</text>
    <text x="490" y="42" class="nv" fill="#1A1A1A">Projects</text>
    <text x="572" y="42" class="nv" fill="#1A1A1A" font-weight="600">Service Areas</text>
    <line x1="572" y1="50" x2="676" y2="50" stroke="#4D8A3F" stroke-width="2"/>
    <text x="694" y="42" class="nv" fill="#1A1A1A">About</text>
    <text x="754" y="42" class="nv" fill="#1A1A1A">Resources</text>
    <text x="878" y="42" class="nv" fill="#1A1A1A">Contact</text>
    <text x="982" y="42" class="ph" fill="#2F5D27">Call (630) 946-9321</text>
    <g transform="translate(1148,22)">
      <rect width="68" height="28" rx="6" fill="#2F5D27"/>
      <text x="14" y="19" class="ph" fill="#FAF7F1">EN</text>
      <text x="42" y="19" class="ph" fill="#6B6B6B">ES</text>
    </g>
    <g transform="translate(1232,18)">
      <rect width="184" height="36" rx="8" fill="#E8A33D"/>
      <text x="92" y="23" class="btn" text-anchor="middle" fill="#1A1A1A">Get a Free Estimate</text>
    </g>
    <text x="48" y="118" class="anno">--shadow-soft drop · current page "Service Areas" weight 600 + 2px green-500 underline</text>
  </g>

  <defs>
    <linearGradient id="scrollShadow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="rgba(26,26,26,0.06)"/>
      <stop offset="1" stop-color="rgba(26,26,26,0)"/>
    </linearGradient>
    <pattern id="heroNoise" width="40" height="40" patternUnits="userSpaceOnUse">
      <rect width="40" height="40" fill="#3F5C2F"/>
      <circle cx="8" cy="12" r="2" fill="#4D8A3F"/>
      <circle cx="28" cy="6" r="1.5" fill="#8FB67A"/>
      <circle cx="20" cy="32" r="1" fill="#2F5D27"/>
    </pattern>
  </defs>
</svg>

### 3.3 State specifications

| State | Surface | Border-bottom | Shadow | Backdrop |
|---|---|---|---|---|
| **A — At top, non-home** | `--color-bg` (`#FFFFFF`) on white-first pages; `--color-bg-cream` on cream-first pages (matches the page's hero band so the seam vanishes) | 1px `--color-border` | none | none |
| **B — At top, homepage** | `rgba(255,255,255,0.78)` | none | none | `backdrop-filter: blur(var(--backdrop-blur-md))` (only allowed blur in v1) |
| **C — Scrolled, any page** | `--color-bg` (solid `#FFFFFF`) regardless of page surface | 1px `--color-border` at 60% opacity | `--shadow-soft` | none |

**Trigger for state C:** `window.scrollY > 24px`. Use a `useScrollState()` hook on the desktop component. Transition between A/B and C is `background-color`, `box-shadow`, `border-color` over `--motion-base` with `--easing-standard`. No height change between states (the row stays 72px in every state — height changes are visually distracting).

### 3.4 Logo (`Logo.tsx`)

Already scaffolded in Phase 1.04 as a placeholder; this phase locks its display rules:

- **Light skin** (default): brand-mark in `--color-sunset-green-500` + wordmark "Sunset Services" in `--color-sunset-green-700` Manrope 700.
- **Dark skin** (used in the footer): brand-mark in `--color-sunset-green-300` + wordmark in `--color-text-on-dark`.
- Mark height: 32px nominal. Wordmark cap-height ~22–24px in the 72px navbar row.
- Wraps in an `<a>` to `/` (or `/es/` for Spanish), with `aria-label="Sunset Services — Home"` (translated).
- No hover state on the logo (it is the home anchor; movement on the chrome's most stable element is undesirable).

### 3.5 Nav-link states

| State | Treatment |
|---|---|
| **Rest** | Color `--color-text-primary`, weight 500, no underline. |
| **Hover** | Color `--color-sunset-green-700`. A 1px underline reveals from height 0 → 1px in `--color-sunset-green-500`, sitting 6px below the baseline (matches `text-underline-offset: 0.18em`). Duration `--motion-fast`, easing `--easing-standard`. **The underline anchors to the link's left edge and grows rightward**, not center-out — center-out reads as a "fancy" effect; left-anchored reads as a clean rule. |
| **Focus-visible** | Standard `--color-focus-ring` 2px outline with 2px offset and `--radius-sm`. Hover underline does not appear under focus alone (avoids double-emphasis). |
| **Active page (current `pathname` matches)** | Weight **600** + 2px `--color-sunset-green-500` underline at the same offset. The thicker 2px underline distinguishes "current page" from "hovered link" so a hovered non-current link cannot be visually confused with the active state. |
| **Mega-panel parent open (Services / Resources)** | Same as hover (1px green-500 underline) + caret rotates 180° over `--motion-fast`. |

### 3.6 Mega-panel opening behavior

- **Pointer:** opens on `mouseenter` of the trigger or panel with a **150ms intent delay** (debounced — drives past the trigger don't fire it). Closes on `mouseleave` of *both* trigger and panel with a 250ms grace period (lets users diagonal-mouse from trigger to a column).
- **Keyboard:** `Enter` / `Space` toggles open. `↓` opens and moves focus to the first link in the panel. `Esc` closes and returns focus to the trigger. `Tab` from inside the panel proceeds out the bottom of the panel and into the next nav item (focus does not trap).
- **Click:** toggles open/closed. Click outside the panel closes it.
- **Both flows must work in tandem** — hover-only would be an a11y failure. ARIA: `aria-haspopup="menu"`, `aria-expanded`, `aria-controls="services-mega-panel"` on the trigger.
- **Open animation:** opacity 0 → 1 + `translateY(-4px → 0)` over `--motion-fast` with `--easing-standard`. Reduced-motion: opacity-only.
- **Surface:** full-width strip beneath the navbar at `--color-bg`, 1px top border `--color-border`, `--shadow-card`, top corners flat (it sits flush under the bar), bottom corners `--radius-lg` only on the inner content card (not the strip — see SVG below).

### 3.7 Mega-panel — visual reference (Services)

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 480" width="100%" role="img" aria-label="Services mega-panel — desktop">
  <style>
    .h6  { font-family: 'Manrope', system-ui, sans-serif; font-size: 17px; font-weight: 700; fill: #2F5D27; }
    .lk  { font-family: 'Onest', system-ui, sans-serif; font-size: 15px; font-weight: 500; fill: #4A4A4A; }
    .cap { font-family: 'Onest', system-ui, sans-serif; font-size: 13px; fill: #6B6B6B; }
    .anno{ font-family: 'Onest', system-ui, sans-serif; font-size: 10px; fill: #4A4A4A; font-style: italic; }
    .nv  { font-family: 'Onest', system-ui, sans-serif; font-size: 15px; font-weight: 500; fill: #1A1A1A; }
    .wm  { font-family: 'Manrope', system-ui, sans-serif; font-size: 22px; font-weight: 700; fill: #1A3617; }
  </style>
  <rect width="1440" height="480" fill="#FAF7F1"/>
  <!-- Navbar in scrolled state for context -->
  <rect width="1440" height="72" fill="#FFFFFF"/>
  <line x1="0" y1="72" x2="1440" y2="72" stroke="#E5E0D5"/>
  <circle cx="76" cy="36" r="16" fill="#4D8A3F"/>
  <text x="100" y="42" class="wm">Sunset Services</text>
  <text x="380" y="42" class="nv" fill="#2F5D27" font-weight="600">Services</text>
  <line x1="380" y1="50" x2="448" y2="50" stroke="#4D8A3F" stroke-width="1"/>
  <text x="490" y="42" class="nv">Projects</text>
  <text x="572" y="42" class="nv">Service Areas</text>
  <text x="694" y="42" class="nv">About</text>
  <text x="754" y="42" class="nv">Resources</text>
  <text x="878" y="42" class="nv">Contact</text>

  <!-- Mega-panel strip -->
  <rect x="0" y="72" width="1440" height="372" fill="#FFFFFF"/>
  <line x1="0" y1="72" x2="1440" y2="72" stroke="#E5E0D5"/>
  <rect x="0" y="444" width="1440" height="8" fill="url(#mpShadow)"/>

  <!-- Three columns + photo column -->
  <g transform="translate(96,108)">
    <!-- Col 1 Residential -->
    <text x="0" y="20" class="h6">Residential</text>
    <line x1="0" y1="30" x2="240" y2="30" stroke="#E5E0D5"/>
    <text x="0" y="60"  class="lk">Lawn Care</text>
    <text x="0" y="88"  class="lk">Landscape Design</text>
    <text x="0" y="116" class="lk">Tree Services</text>
    <text x="0" y="144" class="lk">Sprinkler Systems</text>
    <text x="0" y="172" class="lk">Snow Removal</text>
    <text x="0" y="200" class="lk">Seasonal Cleanup</text>
  </g>

  <g transform="translate(384,108)">
    <text x="0" y="20" class="h6">Commercial</text>
    <line x1="0" y1="30" x2="240" y2="30" stroke="#E5E0D5"/>
    <text x="0" y="60"  class="lk">Landscape Maintenance</text>
    <text x="0" y="88"  class="lk">Snow Removal</text>
    <text x="0" y="116" class="lk">Property Enhancement</text>
    <text x="0" y="144" class="lk">Turf Management</text>
  </g>

  <g transform="translate(672,108)">
    <text x="0" y="20" class="h6">Hardscape</text>
    <line x1="0" y1="30" x2="240" y2="30" stroke="#E5E0D5"/>
    <text x="0" y="60"  class="lk">Patios &amp; Walkways</text>
    <text x="0" y="88"  class="lk">Retaining Walls</text>
    <text x="0" y="116" class="lk">Fire Pits &amp; Features</text>
    <text x="0" y="144" class="lk">Pergolas &amp; Pavilions</text>
    <text x="0" y="172" class="lk">Driveways</text>
    <text x="0" y="200" class="lk">Outdoor Kitchens</text>
  </g>

  <!-- Col 4: photo (≥1280px only) -->
  <g transform="translate(960,108)">
    <rect width="384" height="216" rx="16" fill="#3F5C2F"/>
    <rect width="384" height="216" rx="16" fill="url(#photoGrad)"/>
    <text x="20" y="190" font-family="Manrope" font-weight="700" font-size="18" fill="#FAF7F1">See recent projects →</text>
    <text x="20" y="210" font-family="Onest" font-size="13" fill="#FAF7F1">30+ residential, commercial &amp; hardscape</text>
  </g>

  <text x="96" y="408" class="anno">Mega-panel: full-width strip · 1px top border · --shadow-card on bottom edge · 32px column gutter · 28px row gap inside columns</text>

  <defs>
    <linearGradient id="mpShadow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="rgba(26,26,26,0.06)"/>
      <stop offset="1" stop-color="rgba(26,26,26,0)"/>
    </linearGradient>
    <linearGradient id="photoGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.4" stop-color="rgba(0,0,0,0)"/>
      <stop offset="1" stop-color="rgba(0,0,0,0.6)"/>
    </linearGradient>
  </defs>
</svg>

### 3.8 Phone CTA (desktop)

- Copy: `Call (630) 946-9321` (EN) / `Llamar (630) 946-9321` (ES). The phone number is **never localized** — it's a NAP fact.
- Format: `<a href="tel:+16309469321">` with `data-cr-tracking="navbar-desktop-phone"` for CallRail in Part 2.
- Visual: `--text-body-sm` (15px), color `--color-sunset-green-700`, weight 500, no underline. Hover: underline reveals (1px green-500, same offset as nav links).
- A small 16px lucide `Phone` icon **left of the label, 8px gap.**
- **Hidden below `lg` (1024px).** The mobile bar's phone button replaces it.

### 3.9 Language switcher (desktop) — placement

Right-aligned, **between** the phone CTA and the Get-a-Quote CTA. Visual treatment is specified in §6.

### 3.10 Get-a-Quote CTA

Component: `<Button variant="amber" size="md">` from Phase 1.04 primitives. Locked. The button is `min-width: 184px` to absorb the Spanish label (31 chars vs 21 EN); a fixed pixel min-width keeps the navbar's right-edge stable across locales.

### 3.11 Spanish overflow plan (desktop)

Sample translation widths measured against Manrope/Onest at the 1280px container-wide breakpoint (the tight one — at 1440px there's room to spare). Total widths estimated at the 15px nav-link font with 32px gaps, plus the right-cluster (phone 180px + lang 76px + CTA min 184px = 440px).

| Item | EN width | ES width | Δ | Risk at 1280? |
|---|---|---|---|---|
| Logo cluster | 220px | 220px | 0 | none |
| Services / Servicios | 64px | 72px | +8 | none |
| Projects / Proyectos | 64px | 80px | +16 | none |
| Service Areas / Áreas de Servicio | 104px | 152px | +48 | **tight** |
| About / Nosotros | 50px | 70px | +20 | none |
| Resources / Recursos | 76px | 76px | 0 | none |
| Contact / Contacto | 60px | 70px | +10 | none |
| Phone CTA | 180px | 200px | +20 | none |
| Get-a-Quote button | 184px | 248px | +64 | absorbed by `min-width` |
| **Total mid + right** | ~1018px | ~1188px | +170 | fits 1280 with 92px slack |

**Contingencies (locked rules, in order):**

1. **Default (≥1280px):** all labels render full. No truncation.
2. **At 1024–1279px:** the Phone CTA collapses to icon-only (lucide `Phone`, 44×44 with `aria-label="Call (630) 946-9321"`). This recovers ~140px and fits ES comfortably.
3. **Below 1024px:** the entire mid-section + phone collapses; the mobile navbar takes over (§4).
4. **No truncation, no two-line nav labels.** A truncated nav label is a usability failure; a collapsed icon is an accepted adaptation.

The breakpoint between (1) and (2) — 1280px — is named `xl` per Tailwind defaults and per Phase 1.03 §8.2.

---

## 4. Mobile navbar

### 4.1 Geometry

| Property | Value |
|---|---|
| Row height | **64px** |
| Container | full-width with `px-4` (16px gutters) |
| Phone button | 44×44 left of hamburger |
| Hamburger | 44×44 right edge |
| Logo | centered (mark + wordmark, wordmark scales to ~18px cap-height) |
| z-index | `--z-sticky` (20) |
| Position | `sticky; top: 0` |

64px is chosen over 56 because (a) the brand voice values airiness, and (b) a 44px tap target inside a 56px row produces a 6-px margin that visually crowds the wordmark; 64px gives 10-px margin top/bottom and matches the "premium" tone Plan §1 calls for.

### 4.2 Mobile navbar — visual reference

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1240 800" width="100%" role="img" aria-label="Mobile navbar — collapsed and drawer-open states">
  <style>
    .lbl { font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #6B6B6B; }
    .anno{ font-family: 'Onest', system-ui, sans-serif; font-size: 10px; fill: #4A4A4A; font-style: italic; }
    .wm  { font-family: 'Manrope', system-ui, sans-serif; font-size: 17px; font-weight: 700; fill: #1A3617; }
    .nv  { font-family: 'Manrope', system-ui, sans-serif; font-size: 18px; font-weight: 600; fill: #1A1A1A; }
    .sub { font-family: 'Onest', system-ui, sans-serif; font-size: 14px; fill: #6B6B6B; }
    .cta { font-family: 'Manrope', system-ui, sans-serif; font-size: 16px; font-weight: 600; fill: #1A1A1A; }
    .ph  { font-family: 'Onest', system-ui, sans-serif; font-size: 14px; font-weight: 500; fill: #2F5D27; }
  </style>
  <rect width="1240" height="800" fill="#FAF7F1"/>

  <!-- Frame A: Collapsed at top -->
  <text x="40" y="22" class="lbl">A — Collapsed (top of page) — 390 × 64</text>
  <g transform="translate(40,32)">
    <rect width="390" height="64" fill="#FFFFFF"/>
    <line x1="0" y1="64" x2="390" y2="64" stroke="#E5E0D5"/>
    <!-- phone (left) -->
    <rect x="8" y="10" width="44" height="44" rx="8" fill="none" stroke="#E5E0D5" stroke-width="1"/>
    <path d="M22 26 L22 26 q0 -4 4 -4 l4 0 q3 0 3 3 l0 4 q0 2 -2 3 l-2 1 q3 6 9 9 l1 -2 q1 -2 3 -2 l4 0 q3 0 3 3 l0 4 q0 4 -4 4 q-15 0 -25 -10 q-10 -10 -10 -25 z" fill="#2F5D27" transform="translate(-2,-2)"/>
    <!-- logo center -->
    <circle cx="180" cy="32" r="13" fill="#4D8A3F"/>
    <text x="200" y="38" class="wm">Sunset Services</text>
    <!-- hamburger right -->
    <rect x="338" y="10" width="44" height="44" rx="8" fill="none" stroke="#E5E0D5"/>
    <line x1="350" y1="24" x2="370" y2="24" stroke="#1A1A1A" stroke-width="2" stroke-linecap="round"/>
    <line x1="350" y1="32" x2="370" y2="32" stroke="#1A1A1A" stroke-width="2" stroke-linecap="round"/>
    <line x1="350" y1="40" x2="370" y2="40" stroke="#1A1A1A" stroke-width="2" stroke-linecap="round"/>
    <text x="0" y="92" class="anno">Phone (always visible) · centered logo · hamburger 44×44 each</text>
  </g>

  <!-- Frame B: Collapsed scrolled (subtle shadow) -->
  <text x="490" y="22" class="lbl">B — Scrolled (--shadow-soft drop)</text>
  <g transform="translate(490,32)">
    <rect width="390" height="64" fill="#FFFFFF"/>
    <rect width="390" height="6" y="64" fill="url(#mScroll)"/>
    <rect x="8" y="10" width="44" height="44" rx="8" fill="none" stroke="#E5E0D5"/>
    <path d="M22 26 q0 -4 4 -4 l4 0 q3 0 3 3 l0 4 q0 2 -2 3 l-2 1 q3 6 9 9 l1 -2 q1 -2 3 -2 l4 0 q3 0 3 3 l0 4 q0 4 -4 4 q-15 0 -25 -10 q-10 -10 -10 -25 z" fill="#2F5D27" transform="translate(-2,-2)"/>
    <circle cx="180" cy="32" r="13" fill="#4D8A3F"/>
    <text x="200" y="38" class="wm">Sunset Services</text>
    <rect x="338" y="10" width="44" height="44" rx="8" fill="none" stroke="#E5E0D5"/>
    <line x1="350" y1="24" x2="370" y2="24" stroke="#1A1A1A" stroke-width="2" stroke-linecap="round"/>
    <line x1="350" y1="32" x2="370" y2="32" stroke="#1A1A1A" stroke-width="2" stroke-linecap="round"/>
    <line x1="350" y1="40" x2="370" y2="40" stroke="#1A1A1A" stroke-width="2" stroke-linecap="round"/>
  </g>

  <!-- Frame C: Drawer OPEN -->
  <text x="40" y="142" class="lbl">C — Drawer open · slide from right · backdrop --color-overlay-50</text>
  <g transform="translate(40,152)">
    <!-- backdrop -->
    <rect width="390" height="630" fill="#1A1A1A" opacity="0.5"/>
    <!-- drawer 320px wide, full height -->
    <g transform="translate(70,0)">
      <rect width="320" height="630" fill="#FFFFFF"/>
      <!-- header row (close X + lang switcher placeholder) -->
      <rect width="320" height="64" fill="#FFFFFF"/>
      <line x1="0" y1="64" x2="320" y2="64" stroke="#E5E0D5"/>
      <!-- close X (left) -->
      <rect x="8" y="10" width="44" height="44" rx="8" fill="none" stroke="#E5E0D5"/>
      <line x1="22" y1="22" x2="38" y2="38" stroke="#1A1A1A" stroke-width="2" stroke-linecap="round"/>
      <line x1="38" y1="22" x2="22" y2="38" stroke="#1A1A1A" stroke-width="2" stroke-linecap="round"/>
      <text x="68" y="38" font-family="Manrope" font-size="14" font-weight="700" fill="#2F5D27">MENU</text>
      <!-- nav list -->
      <text x="24" y="110" class="nv">Services</text>
      <path d="M280 105 l5 5 l5 -5" stroke="#1A1A1A" stroke-width="1.5" fill="none"/>
      <text x="24" y="158" class="nv">Projects</text>
      <text x="24" y="206" class="nv">Service Areas</text>
      <text x="24" y="254" class="nv">About</text>
      <text x="24" y="302" class="nv">Resources</text>
      <path d="M280 297 l5 5 l5 -5" stroke="#1A1A1A" stroke-width="1.5" fill="none"/>
      <text x="24" y="350" class="nv">Contact</text>
      <line x1="24" y1="380" x2="296" y2="380" stroke="#E5E0D5"/>
      <!-- language switcher -->
      <text x="24" y="410" class="sub">Language</text>
      <g transform="translate(24,420)">
        <rect width="120" height="36" rx="8" fill="#F2EDE3"/>
        <rect width="60" height="36" rx="8" fill="#2F5D27"/>
        <text x="30" y="23" font-family="Manrope" font-size="13" font-weight="600" text-anchor="middle" fill="#FAF7F1">EN</text>
        <text x="90" y="23" font-family="Manrope" font-size="13" font-weight="600" text-anchor="middle" fill="#6B6B6B">ES</text>
      </g>
      <line x1="24" y1="478" x2="296" y2="478" stroke="#E5E0D5"/>
      <!-- phone CTA -->
      <g transform="translate(24,496)">
        <text x="0" y="14" class="sub">Call us</text>
        <text x="0" y="38" class="ph">(630) 946-9321</text>
      </g>
      <!-- bottom sticky CTA -->
      <rect x="16" y="566" width="288" height="48" rx="8" fill="#E8A33D"/>
      <text x="160" y="595" class="cta" text-anchor="middle">Get a Free Estimate</text>
    </g>
    <text x="0" y="650" class="anno">First focus on open: close X · Tab cycles inside · Esc / backdrop closes · returns focus to hamburger</text>
  </g>

  <defs>
    <linearGradient id="mScroll" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="rgba(26,26,26,0.08)"/>
      <stop offset="1" stop-color="rgba(26,26,26,0)"/>
    </linearGradient>
  </defs>
</svg>

### 4.3 Hamburger / close icon

- Closed state: lucide `Menu` 24px in `--color-text-primary`, inside a 44×44 button.
- Open state (rendered inside the drawer header, NOT in the navbar): lucide `X` 24px.
- Transform: **cross-fade**, not rotate. Rotate-to-X is a "look-at-me" animation; cross-fade reads as quietly competent. Duration `--motion-fast`. Reduced-motion: instant swap.
- Both states share the same `aria-label="Open menu"` / `aria-label="Close menu"` (translated). The button always carries `aria-expanded` and `aria-controls="mobile-drawer"`.

### 4.4 Phone affordance (mobile)

- 44×44 button, lucide `Phone` 22px in `--color-sunset-green-700`, transparent background, rest border `--color-border` 1px (matches hamburger button so the two flank-buttons read as a pair).
- `<a href="tel:+16309469321">` with `data-cr-tracking="navbar-mobile-phone"`.
- Sits at the **left edge** of the navbar row. Always visible. Never inside the drawer (the in-drawer phone CTA is a *separate* affordance for users mid-menu).
- This is the always-tappable surface required by Plan §11.3.

### 4.5 Drawer

| Property | Value |
|---|---|
| Width | `min(320px, 85vw)` on mobile; `380px` from sm to lg (rare; mobile drawer hidden ≥lg anyway). |
| Height | `100dvh` (dynamic viewport height — handles iOS Safari URL bar). |
| Position | `fixed; top: 0; right: 0`. |
| Slide direction | **From right.** Right-side slide matches the hamburger location (right edge), reinforcing the spatial mental model that the menu lives "behind" the hamburger button. |
| Animation in | `translateX(100% → 0)` + opacity 0 → 1 over `--motion-base` (240ms) with `easings.soft`. Backdrop opacity 0 → 1 over `--motion-fast`. |
| Animation out | Inverse, same durations. |
| Backdrop | `--color-overlay-50` covering the page outside the drawer; click-to-close. |
| Body scroll | Locked while open (set `overflow: hidden` on `<html>` + add `paddingRight` equal to the scrollbar width to prevent layout shift). |
| z-index | `--z-overlay` (40) — above the navbar's `--z-sticky` (20), below toasts (60) and chat (50). |
| Reduced motion | Drop the `translateX`; use opacity-only at `--motion-fast`. |

### 4.6 Drawer content order

Top-to-bottom inside the drawer:

1. **Header row (64px):** close button (left), small `MENU` eyebrow label (12px Manrope 700 in `--color-sunset-green-700`).
2. **Primary nav list** — 6 items (Services, Projects, Service Areas, About, Resources, Contact). Each row: 48px height, 24px left padding, label `--text-h5` weight 600 in `--color-text-primary`. Items with sub-panels (Services, Resources) render with a chevron right; tapping expands an inline accordion (NOT a nested drawer — accordion keeps depth at one). Stagger-in via `<StaggerContainer>` with the locked 80ms `staggerChildren` delay; first item delays 60ms after the drawer's slide finishes.
3. **Divider** — 1px `--color-border` with 24px horizontal margin.
4. **Language switcher** — segmented EN | ES with the "Language" / "Idioma" eyebrow above. Spec in §6.
5. **Divider.**
6. **Phone CTA block** — eyebrow "Call us" / "Llámanos" + the formatted number rendered as a large tappable link `--text-h4` in `--color-sunset-green-700`.
7. **Bottom-sticky** Get-a-Quote button — Amber × md (44h), 16px from drawer edges, `position: sticky; bottom: 16px` so it remains visible if the drawer's content ever exceeds viewport height (it shouldn't on Part 1, but ES translations + future Resources subitems could grow this).

### 4.7 Focus-trap rules

Implemented via `@base-ui/react`'s `Dialog.Root` (or a Focus-Lock equivalent). Locked behavior:

- On open, the **close button receives focus** (NOT the first nav item — avoids accidental nav on quick double-taps).
- `Tab` cycles forward through every focusable element inside the drawer (close → nav items → expanded accordion children when open → language switcher → phone link → Get-a-Quote). `Shift+Tab` reverses.
- After the last element, focus wraps to the close button (no escape into the page behind).
- `Esc` closes the drawer.
- Clicking the backdrop (anywhere outside the drawer panel) closes it.
- On close, **focus returns to the hamburger button** that originally opened it.
- ARIA: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="mobile-drawer-title"`, where `#mobile-drawer-title` is the visually-hidden text "Site navigation" / "Navegación del sitio".

---

## 5. Footer

### 5.1 Footer surface and structure

- Surface: `--color-bg-charcoal` (`#1A1A1A`).
- Container: `--container-default` (1200px) inside the page wrapper's standard horizontal padding (§4.4 of 1.03).
- Vertical padding: `py-20` desktop (80px), `py-14` mobile (56px). Internal sections use 48px (mobile) / 64px (desktop) gaps.
- Default text color: `--color-text-on-dark` (`#FAF7F1`). Pairing 11 from Phase 1.03 §2.2 confirmed at 17.0 : 1.
- Default link color: `--color-sunset-green-300` with underline-on-hover (Phase 1.03 §2.3 dark-section row).

### 5.2 Footer — visual reference

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 720" width="100%" role="img" aria-label="Footer — desktop &amp; mobile">
  <style>
    .h    { font-family: 'Manrope', system-ui, sans-serif; font-weight: 700; fill: #FAF7F1; }
    .h6   { font-family: 'Manrope', system-ui, sans-serif; font-weight: 600; font-size: 14px; fill: #FAF7F1; letter-spacing: 0.08em; }
    .lk   { font-family: 'Onest', system-ui, sans-serif; font-size: 14px; fill: #DCE8D5; }
    .body { font-family: 'Onest', system-ui, sans-serif; font-size: 14px; fill: #FAF7F1; }
    .mut  { font-family: 'Onest', system-ui, sans-serif; font-size: 13px; fill: #B8D2A8; }
    .anno { font-family: 'Onest', system-ui, sans-serif; font-size: 10px; font-style: italic; fill: #8FB67A; }
    .lbl  { font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #6B6B6B; }
  </style>
  <rect width="1440" height="720" fill="#FAF7F1"/>
  <text x="48" y="22" class="lbl">Desktop · 1200px container · charcoal surface</text>

  <g transform="translate(0,32)">
    <rect width="1440" height="540" fill="#1A1A1A"/>
    <g transform="translate(120,80)">
      <!-- Brand block + Quick links + Service areas + Newsletter -->
      <!-- col 1: brand -->
      <g>
        <circle cx="16" cy="16" r="16" fill="#8FB67A"/>
        <path d="M8 20 Q16 6 24 20" stroke="#1A1A1A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <text x="40" y="22" class="h" font-size="20" fill="#FAF7F1">Sunset Services</text>
        <text x="0" y="60" class="body">Premium landscaping &amp; hardscape</text>
        <text x="0" y="78" class="body">in DuPage County since 2000.</text>
        <text x="0" y="120" class="mut">1630 Mountain St</text>
        <text x="0" y="138" class="mut">Aurora, IL 60505</text>
        <text x="0" y="166" class="lk">(630) 946-9321</text>
        <text x="0" y="184" class="lk">info@sunsetservices.us</text>
        <!-- Unilock badge placeholder -->
        <rect x="0" y="206" width="120" height="36" rx="4" fill="none" stroke="#8FB67A" stroke-dasharray="3 3"/>
        <text x="60" y="228" font-family="Onest" font-size="11" fill="#8FB67A" text-anchor="middle">UNILOCK BADGE</text>
      </g>
      <!-- col 2: services -->
      <g transform="translate(360,0)">
        <text x="0" y="14" class="h6">SERVICES</text>
        <text x="0" y="44" class="lk">Residential</text>
        <text x="0" y="68" class="lk">Commercial</text>
        <text x="0" y="92" class="lk">Hardscape</text>
        <text x="0" y="116" class="lk">Snow Removal</text>
        <text x="0" y="140" class="lk">All services →</text>
      </g>
      <!-- col 3: company -->
      <g transform="translate(540,0)">
        <text x="0" y="14" class="h6">COMPANY</text>
        <text x="0" y="44" class="lk">About</text>
        <text x="0" y="68" class="lk">Projects</text>
        <text x="0" y="92" class="lk">Service Areas</text>
        <text x="0" y="116" class="lk">Contact</text>
      </g>
      <!-- col 4: resources -->
      <g transform="translate(720,0)">
        <text x="0" y="14" class="h6">RESOURCES</text>
        <text x="0" y="44" class="lk">Resources</text>
        <text x="0" y="68" class="lk">Blog</text>
        <text x="0" y="92" class="lk">Privacy</text>
        <text x="0" y="116" class="lk">Terms</text>
        <text x="0" y="140" class="lk">Accessibility</text>
      </g>
      <!-- col 5: newsletter -->
      <g transform="translate(900,0)">
        <text x="0" y="14" class="h6">NEWSLETTER</text>
        <text x="0" y="44" class="body">Seasonal tips &amp; project</text>
        <text x="0" y="62" class="body">stories. Twice a month.</text>
        <rect x="0" y="80" width="240" height="44" rx="4" fill="#FAF7F1" opacity="0.08" stroke="#FAF7F1" stroke-opacity="0.32"/>
        <text x="14" y="106" font-family="Onest" font-size="14" fill="#B8D2A8">your@email.com</text>
        <rect x="0" y="138" width="100" height="40" rx="8" fill="#4D8A3F"/>
        <text x="50" y="163" font-family="Manrope" font-weight="600" font-size="14" fill="#FFFFFF" text-anchor="middle">Subscribe</text>
        <text x="0" y="200" class="anno">[Placeholder — submits to nothing in Part 1]</text>
      </g>
    </g>

    <!-- Service areas band -->
    <g transform="translate(120,360)">
      <line x1="0" y1="0" x2="1200" y2="0" stroke="#FAF7F1" stroke-opacity="0.16"/>
      <text x="0" y="32" class="h6">SERVICE AREAS</text>
      <text x="0"   y="62" class="lk">Aurora</text>
      <text x="120" y="62" class="lk">Naperville</text>
      <text x="280" y="62" class="lk">Batavia</text>
      <text x="400" y="62" class="lk">Wheaton</text>
      <text x="520" y="62" class="lk">Lisle</text>
      <text x="620" y="62" class="lk">Bolingbrook</text>
      <!-- social row right -->
      <g transform="translate(900,42)">
        <rect width="32" height="32" rx="6" fill="none" stroke="#FAF7F1" stroke-opacity="0.32"/>
        <rect x="40" width="32" height="32" rx="6" fill="none" stroke="#FAF7F1" stroke-opacity="0.32"/>
        <rect x="80" width="32" height="32" rx="6" fill="none" stroke="#FAF7F1" stroke-opacity="0.32"/>
        <rect x="120" width="32" height="32" rx="6" fill="none" stroke="#FAF7F1" stroke-opacity="0.32"/>
        <text x="76" y="56" class="anno" text-anchor="middle">GBP · FB · IG · YT</text>
      </g>
    </g>
  </g>

  <!-- Legal microbar -->
  <g transform="translate(0,572)">
    <rect width="1440" height="48" fill="#0E0E0E"/>
    <text x="120" y="30" font-family="Onest" font-size="13" fill="#B8D2A8">© 2026 Sunset Services. All rights reserved.</text>
    <text x="800"  y="30" class="lk">Privacy</text>
    <text x="880"  y="30" class="lk">Terms</text>
    <text x="940"  y="30" class="lk">Accessibility</text>
    <text x="1040" y="30" class="lk">Sitio en español</text>
  </g>
  <text x="48" y="640" class="lbl">Mobile collapse: brand block full-width → service columns stack 1 col → service-areas wraps 2 col → social row → legal microbar wraps to 2 lines</text>
</svg>

### 5.3 Footer block-by-block specification

#### 5.3.1 Brand block

- Logo with **dark skin** (mark in `--color-sunset-green-300`, wordmark in `--color-text-on-dark`).
- One-line tagline in `--text-body` `--color-text-on-dark` — *placeholder copy*: "Premium landscaping & hardscape in DuPage County since 2000." (Erick / final copywriter rewrites in Phase 2.05.)
- Address (NAP-grade — must match `Sunset-Services-Plan.md` §2 verbatim):
  ```
  1630 Mountain St
  Aurora, IL 60505
  ```
- Phone link: `<a href="tel:+16309469321">(630) 946-9321</a>` with `data-cr-tracking="footer-phone"`.
- Email link: `<a href="mailto:info@sunsetservices.us">info@sunsetservices.us</a>`.
- Unilock Authorized Contractor badge: 1:1 logo image (Erick supplies in Part 2; Part 1 uses a dashed `120×36` placeholder). Renders below the email line.
- Phone, email, and the address use `<address>` semantically.
- All NAP text is plain text (also exposed as JSON-LD `LocalBusiness` in `<head>`, see §5.4).

#### 5.3.2 Quick-links columns

Four columns desktop, all collapsing to single-column stacks on mobile (<sm). Each column has an eyebrow header in `--text-micro` weight 600 letter-spacing 0.08em, all-caps, color `--color-text-on-dark` at 100%. Links underneath are `--color-sunset-green-300` `--text-body-sm` weight 500.

| Column | EN heading | ES heading | Children |
|---|---|---|---|
| 1 | SERVICES | SERVICIOS | Residential, Commercial, Hardscape, Snow Removal, All services → |
| 2 | COMPANY | EMPRESA | About, Projects, Service Areas, Contact |
| 3 | RESOURCES | RECURSOS | Resources, Blog, Privacy, Terms, Accessibility |
| 4 | NEWSLETTER | BOLETÍN | (form, see 5.3.4) |

The columns are wrapped in `<nav aria-label="Footer">` (Phase 1.03 §6.1 / §10).

#### 5.3.3 Service areas band

A horizontal flat list of the six cities (Aurora, Naperville, Batavia, Wheaton, Lisle, Bolingbrook), each linking to `/service-areas/<city>/`. Eyebrow heading "SERVICE AREAS" / "ÁREAS DE SERVICIO". Implemented as a `<nav aria-label="Service areas">` distinct from the footer link nav. Mobile: wraps to two columns.

#### 5.3.4 Newsletter placeholder (Part 1 behavior — locked)

- Single email field + a `Subscribe` button.
- Field: `<input type="email" name="email" required>` styled per Phase 1.03 §6.3 form rules but on the dark surface: background `rgba(250, 247, 241, 0.08)`, border `rgba(250, 247, 241, 0.32)`, placeholder color `--color-sunset-green-200`, text color `--color-text-on-dark`. Focused border `--color-sunset-green-300`.
- Button: `<Button variant="primary" size="md">Subscribe</Button>`.
- **Form submit handler in Part 1: `e.preventDefault()` + render an inline note "Newsletter sign-up coming soon." styled as `--text-body-sm` `--color-sunset-green-300`. The form does not POST anywhere.** This is the explicit placeholder behavior.
- The label "Email address" / "Correo electrónico" is **visually hidden** (`sr-only`) but present for screen readers; the visible eyebrow "NEWSLETTER" + the helper copy serve as visual labelling.
- Helper copy: "Seasonal tips & project stories. Twice a month." / "Consejos de temporada e historias de proyectos. Dos veces al mes."

#### 5.3.5 Social row

Position: right-aligned in the same band as the service-areas list on desktop; below the list on mobile. Four icons, each in a 32×32 button with `--radius-md`, 1px `rgba(250,247,241,0.32)` border. Hover: border fills to `--color-sunset-green-300`, icon color shifts from `--color-text-on-dark` to `--color-sunset-green-300`. Tap target is the full 32×32 visually but the wrapping `<a>` extends to a 44×44 hit area via padding (a11y AA tap target).

| Icon | Source | Notes |
|---|---|---|
| Google Business Profile | **Hand-rolled inline SVG** (lucide does not ship one) — use the Google "G" mark in monochrome `currentColor` only; do NOT recreate the multi-color G (copyright). | `aria-label="Google Business Profile"`. |
| Facebook | lucide `Facebook` | |
| Instagram | lucide `Instagram` | |
| YouTube | lucide `Youtube` | |

Each `<a>` opens in a new tab (`target="_blank" rel="noopener noreferrer"`) with a translated `aria-label`.

#### 5.3.6 Legal microbar

A separate strip below the main footer, surface `#0E0E0E` (1px darker than `--color-bg-charcoal` to set it apart without introducing a new token). 48px tall desktop, 64px mobile (wraps to 2 lines). Contents:

- Left: `© {year} Sunset Services. All rights reserved.` (year is dynamic — use `new Date().getFullYear()` in a Server Component).
- Right cluster: Privacy · Terms · Accessibility · `Sitio en español` (when on EN) / `English version` (when on ES). Each link is `--text-body-sm` in `--color-sunset-green-300`. The locale link is functionally the language switcher again — duplicates the chrome's affordance for users who scroll past it.
- Contrast verification: green-300 (`#8FB67A`) on `#0E0E0E` = **8.4 : 1 ✓ AA**.

#### 5.3.7 Schema.org `LocalBusiness` placement note

The `LocalBusiness` JSON-LD lives in the **root layout's `<head>`**, not in the footer DOM. The footer's address/phone/email are the human-readable mirror of the same NAP — they share a single source-of-truth constant `lib/constants/business.ts` so they cannot drift. **Do not duplicate the JSON-LD inside the footer DOM** (that double-counts in some crawlers).

### 5.4 Mobile footer

- Brand block: full-width.
- Quick-links columns: collapse to a vertical stack; each former column becomes a section with the eyebrow header and a 16px gap to its links. 32px between former columns.
- Service-areas list: wraps to 2 columns at <sm; restacks to 6 single rows below 360px.
- Social row: below service areas, left-aligned, 12px gap between icons.
- Newsletter: full-width field + full-width button below it (button is no longer right of the field — vertical stack).
- Legal microbar: copy left-aligned, links wrap to a second line below.

---

## 6. Language switcher (deep dive)

### 6.1 Visual

**Segmented EN | ES toggle**, not a dropdown. Two locales is the smallest case where a dropdown overshoots — a segmented control reveals both options without an interaction, which preserves the discoverability the bilingual goal demands.

| Element | Spec |
|---|---|
| Container | `<div role="group" aria-label="Language">` |
| Container background | `--color-bg-stone` on light surfaces; `rgba(250,247,241,0.08)` on charcoal |
| Container size | Height 28px (desktop navbar) / 36px (mobile drawer); width fits content with 12px horizontal padding per segment |
| Container radius | `--radius-md` |
| Each segment | `<a hreflang="…" lang="…">` styled as a button |
| Active segment | Background `--color-sunset-green-700`, text `--color-text-on-green`, weight 600 |
| Inactive segment | Background transparent, text `--color-text-secondary` (light) / `--color-sunset-green-200` (dark) |
| Inactive hover | Text `--color-text-primary` (light) / `--color-text-on-dark` (dark); subtle background `--color-sunset-green-50` (light) / `rgba(250,247,241,0.06)` (dark) |
| Focus | Standard focus ring on each segment |
| Font | `--font-body`, 13px desktop / 14px mobile, weight 600, no underline |

### 6.2 Path-preserving behavior

Locked from Plan §10. The switcher uses `next-intl`'s `useRouter()` from `@/i18n/routing` and calls `router.replace(pathname, { locale: 'es' })` — `next-intl`'s `localePrefix: 'as-needed'` config (set in Phase 1.02) handles the prefix automatically:

- From `/about/` (EN) → click ES → `/es/about/`.
- From `/es/contact/` → click EN → `/contact/`.
- Query strings and hash fragments are preserved.
- 404 pages: switching locale on a 404 attempts the same path under the other locale; if it also 404s, the 404 page is shown in the new locale (acceptable trade-off — the alternative, falling back to home, hides the 404 from the user).

### 6.3 Keyboard support

| Key | Effect |
|---|---|
| `Tab` | Moves focus to the first segment; subsequent `Tab` exits the group |
| `←` / `→` | Moves focus between segments |
| `Enter` / `Space` | Activates the focused segment (navigates) |
| `Home` / `End` | First / last segment |

### 6.4 ARIA

- Container: `role="group"`, `aria-label="Language"` (the visually-rendered "EN | ES" provides no programmatic label for the group itself, hence the explicit `aria-label`).
- Each segment: `<a href="…" hreflang="en" lang="en">English</a>` (the visible text is "EN" but `aria-label="English"` exposes the full word to screen readers; same for ES → `aria-label="Español"`). The active segment carries `aria-current="true"`.

### 6.5 Mobile placement

Inside the drawer, between the primary nav list and the phone CTA block, with a small "Language" / "Idioma" eyebrow above. See §4.6 for ordering and the SVG in §4.2 frame C for visual.

---

## 7. Skip-link integration

Restating the Phase 1.03 §6.12 spec, with the integration points:

- **Mounted at the top of `<body>`, before `<header>`.** This is the locale-level layout (`src/app/[locale]/layout.tsx`) — NOT the root layout — because the skip-link copy is locale-bound.
- **Targets** `<main id="main" tabindex="-1">`. The `tabindex="-1"` lets the browser focus the landing element programmatically when the link is activated (otherwise some browsers don't actually move focus, just scroll).
- **Copy:**
  - EN: "Skip to main content"
  - ES: "Saltar al contenido principal"
- **Strings live in `messages/en.json` / `messages/es.json` under `chrome.skipLink`.**
- **Visual:** translated off-screen at rest (`transform: translateY(-200%)`), animates to `translateY(0)` on `:focus-visible` over `--motion-fast`. Surface `--color-sunset-green-700`, text `--color-text-on-green`. Z-index `--z-banner` (above everything, including the future cookie banner).
- **First focusable element on every page.** Before the navbar logo. Verified via the §10 a11y checklist.

---

## 8. Base shell layout

### 8.1 Element order inside `<body>` (locale-level layout)

```
<body>
  <SkipLink />                         {/* §7 */}
  <ChromeProviders>                    {/* MotionConfig is mounted in 1.04 root layout */}
    <header>
      <Navbar />                       {/* renders NavbarDesktop OR NavbarMobile by media query */}
    </header>
    <main id="main" tabindex="-1">
      {children}                        {/* page content */}
    </main>
    <footer>
      <Footer />
    </footer>
    <div id="toast-root"></div>         {/* Part 2 toaster mount */}
    <div id="chat-root"></div>          {/* Part 2 AI chat-widget mount */}
  </ChromeProviders>
</body>
```

### 8.2 Mount point IDs (locked)

| ID | Purpose | Phase that uses it |
|---|---|---|
| `main` | `<main>` landmark + skip-link target | Phase 1.05 |
| `toast-root` | Empty `<div>` registered now; `react-toast` portal mounts here in Part 2 | Phase 2.06 |
| `chat-root` | Empty `<div>` registered now; AI chat widget mounts here in Part 2 | Phase 1.20 (UI), 2.09 (wired) |
| `mobile-drawer` | The mobile drawer's outer element ID — referenced by the hamburger's `aria-controls` | Phase 1.05 |
| `services-mega-panel` | Desktop Services mega-panel — referenced by the trigger's `aria-controls` | Phase 1.05 |
| `resources-mega-panel` | Desktop Resources mega-panel — same pattern | Phase 1.05 |
| `mobile-drawer-title` | Visually hidden `<h2>` inside the drawer; referenced by `aria-labelledby` | Phase 1.05 |

These IDs are now **canonical**; subsequent phases reference them by name.

### 8.3 Breakpoint behavior

| Breakpoint | Navbar | Drawer | Mega-panels | Footer |
|---|---|---|---|---|
| `< sm` (640) | Mobile bar (64px), centered logo | enabled | n/a | single column |
| `sm – md` (640–767) | Mobile bar | enabled | n/a | single column |
| `md – lg` (768–1023) | Mobile bar | enabled | n/a | 2-column quick-links |
| `lg – xl` (1024–1279) | Desktop, **phone collapsed to icon** | hidden | enabled (3-col Services, no photo) | 4-column |
| `≥ xl` (1280) | Desktop, full-text phone | hidden | enabled (3-col + photo) | 4-column |

The crossover from mobile-bar to desktop-bar is at the standard Tailwind `lg` breakpoint (1024px), per Phase 1.03 §8.2.

---

## 9. Motion choreography

### 9.1 Per-element rules

| Element | First paint | On state change | Reduced-motion |
|---|---|---|---|
| Navbar | **No entrance animation.** Renders immediately. | A→B / B→A: cross-fades surface, border, shadow over `--motion-base` `--easing-standard`. | Same — no movement to remove. |
| Skip link | None. | Slides in on focus over `--motion-fast`. | Cross-fades only. |
| Mobile drawer | n/a (only renders when opened) | Open: `translateX(100% → 0)` + opacity 0 → 1 over `--motion-base` `easings.soft`. Close: inverse. Backdrop: opacity over `--motion-fast`. | Opacity-only, `--motion-fast`. |
| Drawer nav items | n/a | `<StaggerContainer>` with `staggerChildren: 80ms` (Phase 1.03 lock); each item `<StaggerItem>` fades up 8px → 0. Trigger after the drawer's slide finishes (`delayChildren: 240ms`). | `<StaggerItem>` falls back to opacity-only via `MotionConfig`. |
| Mega-panel (desktop) | n/a | Open: opacity 0 → 1 + `translateY(-4px → 0)` over `--motion-fast` `easings.standard`. Close: inverse. | Opacity-only. |
| Mega-panel column hover | n/a | Background tint cross-fade `transparent → --color-sunset-green-50` over `--motion-fast`. | Same — opacity is fine. |
| Footer | **`<AnimateIn variant="fade">`** at default delay (one fade for the whole footer block, not per-column). Footer is heavy; staggering 5 columns + 6 service-area links would feel theatrical. | n/a | Same — fade is opacity-only. |
| Logo | None. | None. The most stable element on the page does not move. | n/a |
| Nav-link underline | n/a | Reveal height 0 → 1px over `--motion-fast` `easings.standard`. | Cross-fade opacity 0 → 1 instead. |

### 9.2 Order of operations on first paint

1. Skip-link renders off-screen (no animation).
2. Navbar renders — instant, no animation.
3. `<main>` content renders — page-level `<AnimateIn>` blocks fire as their viewport conditions are met.
4. Footer's `<AnimateIn>` fires once the footer enters viewport (via `viewport={{ once: true, margin: '-10% 0px' }}` per Phase 1.03 §7.3).

### 9.3 Order of operations on drawer open

1. Hamburger `onClick` → state flips to open.
2. Backdrop fades 0 → 1 over `--motion-fast` (120ms).
3. Drawer slides in from right over `--motion-base` (240ms).
4. After 240ms (`delayChildren`), nav items stagger in 80ms apart.
5. Focus is moved to the close button (after the drawer's slide completes — done via `motion`'s `onAnimationComplete`).

Total time from tap to focus-landed: ~280ms. Below the 300ms perceptual threshold, so the drawer feels instantly responsive.

---

## 10. Accessibility — full audit

A checklist Claude Code runs after implementing.

### 10.1 Landmarks and structure

- [ ] `<header>` wraps the navbar.
- [ ] `<nav aria-label="Primary">` wraps the desktop nav links AND the mobile drawer's nav list (separate instances; same label is acceptable when only one is visible at a time).
- [ ] `<nav aria-label="Footer">` wraps the footer's quick-links columns.
- [ ] `<nav aria-label="Service areas">` wraps the footer's six-city list.
- [ ] `<main id="main" tabindex="-1">` wraps page content.
- [ ] `<footer>` wraps the footer block.
- [ ] `<address>` wraps the brand block's NAP fields.

### 10.2 Focus order

Desktop, in order:

1. Skip-link (rendered first; visible only when focused).
2. Logo / Home link.
3. Services trigger (`aria-haspopup="menu"`, `aria-expanded`).
4. Projects link.
5. Service Areas link.
6. About link.
7. Resources trigger.
8. Contact link.
9. Phone CTA.
10. Language switcher EN segment.
11. Language switcher ES segment.
12. Get-a-Quote button.
13. (Page content begins — `<main>`'s first focusable element.)

Mobile, drawer closed:

1. Skip-link.
2. Phone button.
3. Logo / Home link.
4. Hamburger.
5. (Page content.)

Mobile, drawer open: focus is trapped — see §4.7.

### 10.3 ARIA contract

- [ ] Mega-panel triggers expose `aria-haspopup="menu"`, `aria-expanded`, `aria-controls="<panel-id>"`.
- [ ] Mobile drawer wraps in `role="dialog"`, `aria-modal="true"`, `aria-labelledby="mobile-drawer-title"`.
- [ ] Hamburger carries `aria-expanded` and `aria-controls="mobile-drawer"`.
- [ ] Language switcher container `role="group"`, `aria-label="Language"`. Active segment `aria-current="true"`. Each segment `hreflang` + `lang`.
- [ ] All icon-only buttons (mobile phone, hamburger, social icons) carry `aria-label`.
- [ ] Active page nav link carries `aria-current="page"`.

### 10.4 Keyboard contract

- [ ] Skip-link is the first focusable element on every page.
- [ ] All nav links / buttons reachable via `Tab`.
- [ ] Mega-panel: `Enter`/`Space` opens, `↓` opens + moves focus to first link, `Esc` closes + returns focus to trigger.
- [ ] Mobile drawer: focus traps inside; `Esc` closes; backdrop click closes; close returns focus to hamburger.
- [ ] Language switcher: `←`/`→` cycle segments; `Enter` activates.
- [ ] No keyboard trap outside the drawer (verified by `Tab`-walking the entire page).

### 10.5 Tap targets

- [ ] Every interactive element ≥ 44×44 CSS px (visually or via padded hit area).
  - Phone button: 44×44.
  - Hamburger: 44×44.
  - Social icons: 32×32 visual + 6px padding = 44×44 hit area.
  - Nav links: height 64px (mobile drawer rows) / 44px (mobile bar buttons), with sufficient horizontal padding.
  - Language segments: 28px height *desktop* — uses the surrounding 44px navbar row's padding to extend the hit area to 44px (verify in implementation).

### 10.6 Visual feedback

- [ ] Every nav link has both a hover AND a `:focus-visible` state (not just hover).
- [ ] Hover and focus look different (hover = underline; focus = focus-ring outline). They can co-occur.
- [ ] No interactive element relies on color alone for state (active page = weight + 2px underline; selected language segment = bg fill + weight, not color alone).

### 10.7 Contrast

All chrome pairings clear AA. Citing Phase 1.03 §2.2:

| Pairing | Surface | Ratio |
|---|---|---|
| `--color-text-on-dark` on `--color-bg-charcoal` | Footer body | 17.0 : 1 ✓ |
| `--color-sunset-green-300` on `--color-bg-charcoal` | Footer links | 8.4 : 1 ✓ |
| `--color-sunset-green-300` on `#0E0E0E` | Legal microbar links | 8.4 : 1 ✓ |
| `--color-text-primary` on `#FFFFFF` | Desktop nav-link rest | 18.9 : 1 ✓ |
| `--color-text-primary` on `--color-sunset-amber-500` | Get-a-Quote | 8.0 : 1 ✓ |
| `--color-text-on-dark` on `--color-sunset-green-700` | Active language segment | 9.8 : 1 ✓ |

### 10.8 Reduced motion

- [ ] `MotionConfig reducedMotion="user"` is mounted (Phase 1.04). Drawer and mega-panel animations honor it: opacity-only, no transform.
- [ ] Hamburger ↔ X transition: with reduced motion, instant swap; without, cross-fade.

---

## 11. i18n strings required

All strings live under a single `chrome` namespace in `src/messages/en.json` and `src/messages/es.json`. Spanish is a draft pending native review (Phase 2.13); items flagged `[TBR]` are translations Design has lower confidence on.

| Key | EN | ES |
|---|---|---|
| `chrome.skipLink` | Skip to main content | Saltar al contenido principal |
| `chrome.nav.logoAriaLabel` | Sunset Services — Home | Sunset Services — Inicio |
| `chrome.nav.primaryAriaLabel` | Primary | Principal |
| `chrome.nav.services` | Services | Servicios |
| `chrome.nav.projects` | Projects | Proyectos |
| `chrome.nav.serviceAreas` | Service Areas | Áreas de Servicio |
| `chrome.nav.about` | About | Nosotros |
| `chrome.nav.resources` | Resources | Recursos |
| `chrome.nav.contact` | Contact | Contacto |
| `chrome.nav.servicesPanel.residentialTitle` | Residential | Residencial |
| `chrome.nav.servicesPanel.commercialTitle` | Commercial | Comercial |
| `chrome.nav.servicesPanel.hardscapeTitle` | Hardscape | Hardscape |
| `chrome.nav.servicesPanel.residential.lawnCare` | Lawn Care | Cuidado del Césped |
| `chrome.nav.servicesPanel.residential.landscapeDesign` | Landscape Design | Diseño de Paisajismo |
| `chrome.nav.servicesPanel.residential.treeServices` | Tree Services | Servicios de Árboles |
| `chrome.nav.servicesPanel.residential.sprinklerSystems` | Sprinkler Systems | Sistemas de Riego |
| `chrome.nav.servicesPanel.residential.snowRemoval` | Snow Removal | Remoción de Nieve |
| `chrome.nav.servicesPanel.residential.seasonalCleanup` | Seasonal Cleanup | Limpieza de Temporada |
| `chrome.nav.servicesPanel.commercial.maintenance` | Landscape Maintenance | Mantenimiento de Paisajismo |
| `chrome.nav.servicesPanel.commercial.snowRemoval` | Snow Removal | Remoción de Nieve |
| `chrome.nav.servicesPanel.commercial.propertyEnhancement` | Property Enhancement | Mejora de Propiedades |
| `chrome.nav.servicesPanel.commercial.turfManagement` | Turf Management | Manejo de Césped |
| `chrome.nav.servicesPanel.hardscape.patiosWalkways` | Patios & Walkways | Patios y Senderos |
| `chrome.nav.servicesPanel.hardscape.retainingWalls` | Retaining Walls | Muros de Contención |
| `chrome.nav.servicesPanel.hardscape.firePitsFeatures` | Fire Pits & Features | Fogatas y Elementos |
| `chrome.nav.servicesPanel.hardscape.pergolasPavilions` | Pergolas & Pavilions | Pérgolas y Pabellones |
| `chrome.nav.servicesPanel.hardscape.driveways` | Driveways | Entradas de Auto |
| `chrome.nav.servicesPanel.hardscape.outdoorKitchens` | Outdoor Kitchens | Cocinas Exteriores |
| `chrome.nav.servicesPanel.photoCaption` | See recent projects → | Ver proyectos recientes → |
| `chrome.nav.servicesPanel.photoSubcaption` | 30+ residential, commercial & hardscape | Más de 30 proyectos residenciales, comerciales y de hardscape |
| `chrome.nav.resourcesPanel.resourcesTitle` | Resources | Recursos |
| `chrome.nav.resourcesPanel.blogTitle` | Blog | Blog |
| `chrome.nav.expandTriggerAriaLabel` | Open {section} menu | Abrir menú de {section} |
| `chrome.nav.collapseTriggerAriaLabel` | Close {section} menu | Cerrar menú de {section} |
| `chrome.cta.getQuote` | Get a Free Estimate | Solicitar Presupuesto Gratis |
| `chrome.cta.callUs.label` | Call us | Llámanos |
| `chrome.cta.callUs.linkLabel` | Call (630) 946-9321 | Llamar al (630) 946-9321 |
| `chrome.mobile.openMenu` | Open menu | Abrir menú |
| `chrome.mobile.closeMenu` | Close menu | Cerrar menú |
| `chrome.mobile.menuEyebrow` | Menu | Menú |
| `chrome.mobile.drawerTitle` | Site navigation | Navegación del sitio |
| `chrome.lang.groupLabel` | Language | Idioma |
| `chrome.lang.en` | EN | EN |
| `chrome.lang.es` | ES | ES |
| `chrome.lang.enFull` | English | Inglés |
| `chrome.lang.esFull` | Spanish | Español |
| `chrome.lang.switchToEs` | View this page in Spanish | Ver esta página en español |
| `chrome.lang.switchToEn` | View this page in English | Ver esta página en inglés |
| `chrome.footer.tagline` | Premium landscaping & hardscape in DuPage County since 2000. | Paisajismo y hardscape premium en el condado de DuPage desde 2000. |
| `chrome.footer.servicesHeading` | Services | Servicios |
| `chrome.footer.companyHeading` | Company | Empresa |
| `chrome.footer.resourcesHeading` | Resources | Recursos |
| `chrome.footer.serviceAreasHeading` | Service Areas | Áreas de Servicio |
| `chrome.footer.serviceAreasNavAriaLabel` | Service areas | Áreas de servicio |
| `chrome.footer.newsletter.heading` | Newsletter | Boletín |
| `chrome.footer.newsletter.helper` | Seasonal tips & project stories. Twice a month. | Consejos de temporada e historias de proyectos. Dos veces al mes. |
| `chrome.footer.newsletter.fieldLabel` | Email address | Correo electrónico |
| `chrome.footer.newsletter.placeholder` | your@email.com | tu@correo.com |
| `chrome.footer.newsletter.submit` | Subscribe | Suscribirse |
| `chrome.footer.newsletter.placeholderNote` | Newsletter sign-up coming soon. | El registro al boletín estará disponible pronto. |
| `chrome.footer.copyright` | © {year} Sunset Services. All rights reserved. | © {year} Sunset Services. Todos los derechos reservados. |
| `chrome.footer.privacy` | Privacy | Privacidad |
| `chrome.footer.terms` | Terms | Términos |
| `chrome.footer.accessibility` | Accessibility | Accesibilidad |
| `chrome.footer.localeSwitchToEs` | Sitio en español | Sitio en español |
| `chrome.footer.localeSwitchToEn` | English version | English version |
| `chrome.footer.social.gbp` | Google Business Profile | Perfil de Empresa de Google |
| `chrome.footer.social.facebook` | Facebook | Facebook |
| `chrome.footer.social.instagram` | Instagram | Instagram |
| `chrome.footer.social.youtube` | YouTube | YouTube |
| `chrome.footer.address.line1` | 1630 Mountain St | 1630 Mountain St |
| `chrome.footer.address.line2` | Aurora, IL 60505 | Aurora, IL 60505 |
| `chrome.business.phone.display` | (630) 946-9321 | (630) 946-9321 |
| `chrome.business.phone.tel` | +16309469321 | +16309469321 |
| `chrome.business.email` | info@sunsetservices.us | info@sunsetservices.us |

**Items flagged `[TBR — needs native review]`:** every Spanish string for the Hardscape children (Hardscape is often kept untranslated in industry copy — Erick to confirm), `Mantenimiento de Paisajismo` (vs. `Mantenimiento Paisajístico`), and `Boletín` (vs. `Newsletter` — both are accepted). Mark these in `Sunset-Services-TRANSLATION_NOTES.md` when seeded.

---

## 12. Component file plan for Code

### 12.1 Files to create

```
src/components/layout/
  Navbar.tsx                  # Server component — composes desktop + mobile, decides which renders by media query (CSS-only switch)
  NavbarDesktop.tsx           # Server component — desktop layout shell. Reads scroll state via a small client island for state C.
  NavbarMobile.tsx            # Client component ('use client') — owns drawer open/close state, focus trap, body-scroll lock
  NavbarScrollState.tsx       # Client component — tiny island that toggles a [data-scrolled] attribute on the navbar root based on window.scrollY
  ServicesMegaPanel.tsx       # Client component — desktop Services dropdown (hover-intent + click + keyboard)
  ResourcesMegaPanel.tsx      # Client component — desktop Resources dropdown (smaller, two-column variant)
  MegaPanelTrigger.tsx        # Client component — shared trigger button used by both mega-panels (caret animation, ARIA)
  LanguageSwitcher.tsx        # Client component — uses next-intl router; segmented EN | ES
  PhoneLink.tsx               # Server component — formatted tel link with CallRail data attribute slot
  SocialIcons.tsx             # Server component — renders the four social icons (incl. hand-rolled GBP SVG)
  Footer.tsx                  # Server component — composes Brand, FooterLinks, FooterServiceAreas, FooterNewsletter, FooterSocial, FooterLegal
  FooterBrand.tsx             # Server component — logo, tagline, NAP, Unilock badge slot
  FooterLinks.tsx             # Server component — the four link columns
  FooterServiceAreas.tsx      # Server component — six-city flat list
  FooterNewsletter.tsx        # Client component — placeholder form with onSubmit prevent + inline note
  FooterLegal.tsx             # Server component — legal microbar with dynamic year + locale-switch link
  SkipLink.tsx                # Server component — locale-bound skip link
  Logo.tsx                    # Already exists (Phase 1.04). Verify dark-skin variant supported; add prop if missing.
  ChromeProviders.tsx         # Client component — any context wiring (drawer-open context exposed for the mobile bar to consume)

src/components/layout/icons/
  GoogleBusinessProfileIcon.tsx  # Hand-rolled monochrome 'G' (currentColor). Do NOT recreate the multi-color G — copyright.

src/messages/
  en.json                     # Add `chrome` namespace (every key from §11)
  es.json                     # Add `chrome` namespace (every key from §11)

src/lib/constants/
  business.ts                 # Single source of truth for NAP. Exports BUSINESS_PHONE, BUSINESS_PHONE_TEL, BUSINESS_EMAIL, BUSINESS_ADDRESS_LINE1, BUSINESS_ADDRESS_LINE2. Footer + JSON-LD both consume.
  navigation.ts               # Single source of truth for the nav model. Exports NAV_TOP_LEVEL, SERVICES_PANEL, RESOURCES_PANEL, FOOTER_LINKS, SERVICE_AREAS_CITIES.

src/hooks/
  useScrollState.ts           # Lightweight `scrollY > 24` boolean (throttled with rAF). Used by NavbarScrollState.
  useBodyScrollLock.ts        # Lock <html> overflow when drawer open; restore on close.
  useFocusTrap.ts             # If @base-ui/react Dialog isn't used; otherwise this file is unnecessary.
```

### 12.2 No changes needed in:

- `src/components/global/motion/*` (Phase 1.04, already shipped).
- `src/app/[locale]/layout.tsx` — receives the chrome via the new `Navbar`/`Footer`/`SkipLink` imports; existing `MotionConfig` and `NextIntlClientProvider` wrappers stay.
- `src/app/globals.css` — no new tokens required by this phase.

### 12.3 Client-component discipline

Only these components are `'use client'`:

- `NavbarMobile`, `NavbarScrollState`, `ServicesMegaPanel`, `ResourcesMegaPanel`, `MegaPanelTrigger`, `LanguageSwitcher`, `FooterNewsletter`, `ChromeProviders`.

Everything else is a Server Component.

---

## 13. Decisions needed

The list below is what Claude Chat should ratify before Code starts. None are blockers; defaults are recommended in this handover and Code can proceed against them if Chat doesn't reopen.

| # | Decision | Recommendation | Rationale |
|---|---|---|---|
| **D1.05-A** | Services nav: dropdown vs. mega-panel | **Mega-panel** (3 audience columns + photo column at xl+). | 16 services × 3 audiences = unusable in a flat dropdown; mega-panel keeps click-depth at one. |
| **D1.05-B** | Resources & Blog: combined or separate top-level entries | **Combined** under one "Resources" parent (mega-panel with two columns). | Halves the top-bar weight; Resources/Blog share intent. |
| **D1.05-C** | Active-page indicator: bolder weight, 2px underline, or both | **Both** (weight 600 + 2px green-500 underline). | Single signals are easy to miss; the dual-signal also clears the "color alone" a11y rule. |
| **D1.05-D** | Drawer slide direction (right vs. top) | **Right.** | Spatial mental model with the right-edge hamburger; standard pattern. |
| **D1.05-E** | Hamburger-to-X transition | **Cross-fade**, not rotate. | Quietly competent vs. attention-grabbing; rotate is a "look-at-me" tic. |
| **D1.05-F** | Phone affordance position (mobile) | **Left of hamburger**, always visible, separate from drawer. | Plan §11.3 demands always-tappable; not buried. |
| **D1.05-G** | Language switcher form factor | **Segmented EN \| ES**, not dropdown. | Two locales — both options should be visible without interaction. |
| **D1.05-H** | Phone CTA collapse breakpoint (desktop) | **Collapse to icon-only at lg–xl (1024–1279); full text at ≥xl (1280)**. | Spanish overflow analysis (§3.11). |
| **D1.05-I** | Active page underline color (2px) | `--color-sunset-green-500`. | Stronger emphasis than the hover's 1px without crossing the focus-ring affordance. |
| **D1.05-J** | Newsletter Part-1 behavior | **No POST**; `onSubmit` prevents default and renders an inline "coming soon" note. | Spec asks for placeholder; the inline note keeps the form's behavior discoverable to a tester. |
| **D1.05-K** | "Sitio en español" link in legal microbar duplicates the language switcher | **Keep both.** | Footer-region users may never have seen the navbar; the duplicate is an SEO + UX safety net (low cost). |
| **D1.05-L** | Resources mega-panel children in Part 1 (Sanity not yet wired) | **Static placeholder strings** in `messages/*.json` so the panel renders identically to its Part 2 behavior. | Avoids a Part 2 layout change when Sanity wires up. |
| **D1.05-M** | Featured 4th column (photo) in Services mega-panel | **Show only at ≥xl (1280px); hide at lg.** | Recovers room for ES nav labels at the tighter breakpoint. |

If Chat agrees with all of the above, this section becomes "no open decisions." Otherwise, list overrides and Code applies them.

---

## 14. Verification checklist

A single checklist Code can run after implementing. Each item is binary.

### Structure & landmarks

- [ ] `<header>`, `<nav aria-label="Primary">` (×2 instances ok), `<nav aria-label="Footer">`, `<nav aria-label="Service areas">`, `<main id="main" tabindex="-1">`, `<footer>` are all present in the rendered DOM.
- [ ] Skip-link is the **first focusable element** on every locale page (verified by `Tab` from page load).
- [ ] Mount-point IDs `toast-root`, `chat-root`, `mobile-drawer`, `services-mega-panel`, `resources-mega-panel`, `mobile-drawer-title`, `main` exist exactly once each.
- [ ] Footer NAP (phone, address, email) matches `Sunset-Services-Plan.md` §2 verbatim, sourced from `lib/constants/business.ts`.
- [ ] `Schema.org` `LocalBusiness` JSON-LD lives in the layout's `<head>`, NOT duplicated inside the footer DOM.

### Visual states

- [ ] Desktop navbar at-top (state A) matches §3.2 SVG: solid `#FFFFFF`, 1px `--color-border` bottom, no shadow.
- [ ] Desktop navbar at-top on homepage (state B) matches §3.2 SVG: `rgba(255,255,255,0.78)`, `backdrop-filter: blur(8px)`, no border.
- [ ] Desktop navbar scrolled (state C) matches §3.2 SVG: solid `#FFFFFF`, `--shadow-soft`, 60%-opacity `--color-border` line.
- [ ] State transition between A/B and C is smooth (`background`, `box-shadow`, `border-color` over `--motion-base`); navbar height never changes.
- [ ] Mobile navbar collapsed at top (§4.2 frame A): phone left, logo center, hamburger right, all 44×44.
- [ ] Mobile drawer (§4.2 frame C) renders all 7 content blocks in order (header / nav / divider / language / divider / phone / sticky CTA).
- [ ] Active page nav link gets weight 600 + 2px green-500 underline (desktop) / matching emphasis (mobile drawer).

### Behavior

- [ ] Mega-panel (Services) opens on hover-intent (~150ms) AND on click AND on `Enter`/`Space` keyboard activation.
- [ ] Mega-panel opens on `↓` and moves focus to the first link.
- [ ] Mega-panel `Esc` closes and returns focus to its trigger.
- [ ] Mobile drawer opens with slide-from-right + backdrop fade; close button receives focus.
- [ ] Mobile drawer focus traps (verified by `Tab`-walking; cycle does not exit).
- [ ] Mobile drawer `Esc` closes; backdrop click closes; close returns focus to hamburger.
- [ ] Body scroll is locked while drawer is open (verify `<html>` `overflow: hidden` is applied + scrollbar gutter compensated).
- [ ] Language switcher's `←`/`→` cycle segments; `Enter` navigates path-preserving (e.g., `/about/` → `/es/about/`).
- [ ] Newsletter form `onSubmit` prevents default and renders the "coming soon" inline note.

### i18n

- [ ] Every key from §11 exists in both `messages/en.json` and `messages/es.json`.
- [ ] `[TBR]` items are listed in `Sunset-Services-TRANSLATION_NOTES.md` for Phase 2.13 review.
- [ ] Switching locale on `/about/` lands on `/es/about/` (and vice versa), preserving query strings.
- [ ] `hreflang` and `lang` attributes on each language segment are correct.
- [ ] Spanish nav row at 1024px does NOT overflow (auto-collapses phone CTA to icon-only).
- [ ] Spanish "Solicitar Presupuesto Gratis" fits the Get-a-Quote button (button uses `min-width: 184px`, no wrapping).

### Accessibility

- [ ] All chrome contrast pairings clear AA (per §10.7 table).
- [ ] All interactive elements ≥ 44×44 CSS px (visually or via padded hit area).
- [ ] Every nav link has both a `:hover` AND `:focus-visible` style.
- [ ] No interactive element relies on color alone for state.
- [ ] `prefers-reduced-motion: reduce`: drawer & mega-panel become opacity-only; hamburger swap is instant.
- [ ] Screen-reader pass (NVDA + VoiceOver): every link, button, and landmark has a meaningful announcement.

### Motion

- [ ] Navbar has NO entrance animation on first paint.
- [ ] Footer fades in once via `<AnimateIn variant="fade">` on viewport entry, no per-element stagger.
- [ ] Drawer items stagger in 80ms apart after the drawer slide completes (`delayChildren: 240ms`).
- [ ] Mega-panel opens with opacity + 4px translateY over `--motion-fast`.

### Code hygiene

- [ ] Only the components listed in §12.3 are `'use client'`.
- [ ] `NAV_TOP_LEVEL`, `SERVICES_PANEL`, etc. live in `src/lib/constants/navigation.ts` — no duplication of the IA across components.
- [ ] `BUSINESS_PHONE`, `BUSINESS_EMAIL`, `BUSINESS_ADDRESS_*` live in `src/lib/constants/business.ts` — footer + JSON-LD both consume the same exports.
- [ ] No literal hex colors in component files except inside the inline GBP icon SVG (which uses `currentColor`); every other color goes through the Phase 1.03 tokens.
- [ ] No new tokens added to `globals.css` for this phase.
- [ ] Phase 1.05 completion report references this checklist with each item ticked.

---

**End of Phase 1.05 Design handover.**

The Design phase is closed when this file exists at the project root, every section above is filled, and every claim about a token references the Phase 1.03 token name (literal hex appears only inside the inline-SVG visual references). Hand off to Claude Code for `Part-1-Phase-05-Code.md`.
