# Sunset Services — Projects Portfolio Design Handover (Phase 1.15)

> Read by Claude Code in Phase 1.16 before any projects-portfolio implementation begins.
> Source of truth: this file. Conflicts with Phase 1.03 tokens, Phase 1.05 chrome, Phase 1.06 §8 project-tile, or Phase 1.13 §4.4 strip? **Earlier phases win.** Surface the mismatch to Claude Chat.
> Phase: Part 1 — Phase 15 (Design). Operator: Claude Design.

---

## Table of contents

1. [Scope and constraints](#1-scope-and-constraints)
2. [Page-level decisions](#2-page-level-decisions)
3. [Index page — section-by-section spec](#3-index-page--section-by-section-spec)
4. [Detail page — section-by-section spec](#4-detail-page--section-by-section-spec)
5. [SEO and schema](#5-seo-and-schema)
6. [Photography and illustration brief](#6-photography-and-illustration-brief)
7. [i18n strings table](#7-i18n-strings-table)
8. [Motion choreography](#8-motion-choreography)
9. [Accessibility audit](#9-accessibility-audit)
10. [Lighthouse 95+ implications](#10-lighthouse-95-implications)
11. [Component file plan + `projects.ts` seed](#11-component-file-plan--projectsts-seed)
12. [Decisions surfaced (D1–D17)](#12-decisions-surfaced-d1d17)
13. [Verification checklist (for Code)](#13-verification-checklist-for-code)
14. [Open mismatches](#14-open-mismatches)

---

## 1. Scope and constraints

**In scope.** Two routes: the **Projects index** at `/projects/` + `/es/projects/` (a filterable photographic grid of every project Sunset Services has built), and the **Project detail template** at `/projects/[slug]/` + `/es/projects/[slug]/` (one master template that renders all 12 placeholder projects in Part 1 and the 30+ real entries Cowork sources in Part 2). Chrome (navbar + footer + skip-link + language switcher + mobile drawer) is locked in Phase 1.05 and wraps both routes unchanged.

**Out of scope.** Real photography selection (Cowork — Phase 2.04). Erick's voice on real narratives (Part 2 polish). Sanity wiring (Phase 2.03; Part 1 reads from a typed `projects.ts` seed). Lightbox keyboard implementation (Phase 1.16 Code; Design specs the **behavior contract** below). ServiceM8 webhook → portfolio auto-publish (Phase 2.18). Real before/after pairs (Cowork sources in 2.04; Part 1 specs the UI for ≥2 of 12 placeholder projects). Real Google reviews on related projects (Phase 2.15).

**Locked from earlier phases — DO NOT redesign.**

- All design tokens (1.03 §2–§7). **No new tokens.**
- All component primitives (1.03 §6) — `Button` (Primary green / Amber / Ghost / Secondary), `Card` (`.card`, `.card--cream`, `.card--photo`, `.card--featured`), `Badge`, `Breadcrumb`, `Eyebrow`, `FaqAccordion`, form fields. **No new variants.**
- **Project tile pattern** (1.06 §8.3): `card--photo` 4:3 with bottom-up gradient overlay (`--color-overlay-50` → transparent over the lower 50%), title in `--color-text-on-dark` `--text-h5` 600, **category tag pill** upper-left (11px Manrope 600 uppercase, `rgba(250,247,241,0.16)` bg, `rgba(250,247,241,0.32)` 1px border, 22px tall, 8px horizontal padding). Hover: image `scale(1.03)` over `--motion-slow` + title `translateY(-2px)`. **Reuse the existing `ProjectCard` primitive verbatim** (or extract it from `ProjectsTeaser` — see §11 reconciliation note).
- **Tag-pill audience taxonomy** locked from 1.06 §4: **HARDSCAPE / RESIDENTIAL / COMMERCIAL** are the only audience tags in use across the portfolio.
- Chrome (1.05). Section rhythm `py-20` desktop / `py-14` mobile, alternating `--color-bg`/`--color-bg-cream` (1.03 §9) — never two adjacent same-surface bands; the hero counts as its own surface for the rule.
- **Amber discipline** (1.05 §1): navbar amber is chrome and does not count. Each body page has **exactly one** amber CTA, in the bottom CTA section. Hero primary buttons are **Primary green**, never amber.
- **Motion contract** (1.03 §7 + 1.04 + 1.07 mobile-LH lesson): `<AnimateIn>` at section granularity only; **never per-item, per-tile, per-form-field**. Hero has no entrance animation. Reduced-motion: opacity-only at `--motion-fast`, no translate, no scale.
- **Breadcrumb + JSON-LD same-source rule** (1.09 §2): the visible breadcrumb and the `BreadcrumbList` schema consume the same items array.
- **Container widths** (1.03 §4.3): index uses `--container-wide` (1440px); detail uses `--container-default` (1200px) for narrative + facts, with the gallery breaking out to `--container-wide`.
- **Shared `ProjectsTeaser`** (1.11 §3.6) is **not modified**; the projects index uses a separate server component `ProjectsGrid` so it can read `searchParams` without rerunning the homepage/about/location query shape.

**Constraints carried forward.**

- Quality bar: **as professional as possible with no shortcuts** (Project Instructions §7). Lighthouse ≥95 desktop AND mobile. WCAG 2.2 AA. Every text-on-background pairing on the page must clear 4.5:1 (body) / 3:1 (large).
- Bilingual EN + ES. Spanish runs ~15–25% longer; headings use `text-wrap: balance`; per-project title EN ≤8 words.
- Light mode only at v1. No dark-mode tokens.

---

## 2. Page-level decisions

### 2.1 Index — section order + surface alternation

| # | Section | Surface | Reasoning |
|---|---|---|---|
| 1 | Hero (compact text) | `--color-bg-cream` | Cream lifts an otherwise text-only hero; the photographic grid below pops on white. |
| 2 | Filter chip strip | `--color-bg` | Sticky-feeling break — filter chrome reads as "tools" on a brighter surface. |
| 3 | Grid | `--color-bg` | Same band as filter chips; visually, filters belong **with** the grid. The two share one band. |
| 4 | Pagination | `--color-bg` | Trailing element of the grid band. No surface change. |
| 5 | Empty state (when active) | `--color-bg` | Replaces grid + pagination; same band. |
| 6 | Final CTA (amber) | `--color-bg-cream` | Cream → charcoal footer is the cleanest closing transition (matches 1.06 §9). |

Effective alternation: **cream → bg → cream → (charcoal footer)**. No two adjacent same-surface bands. The Hero counts as its own surface; the Filter+Grid+Pagination triad is one band by design (the filter chrome is grid chrome, not a separate section).

### 2.2 Detail — section order + surface alternation

| # | Section | Surface | Reasoning |
|---|---|---|---|
| 1 | Hero (compact split) | `--color-bg` | White lets the lead photo dominate; matches 1.13 §4.1 pattern. |
| 2 | Breadcrumb | `--color-bg` | Sits inside the hero band, immediately under the navbar. Same surface; `aria-current="page"` on terminus. |
| 3 | Narrative | `--color-bg-cream` | Warm body for "the story." |
| 4 | Gallery | `--color-bg` | White lets the photographs be the photographs; `--container-wide` breakout. |
| 5 | Facts table | `--color-bg-cream` | Definition list reads like a spec card on cream. |
| 6 | Before / after toggle (when present) | `--color-bg` | White surface so paired imagery doesn't compete with cream. Renders only if `hasBeforeAfter`. |
| 7 | Related projects strip | `--color-bg-cream` | Mirrors 1.13 §4.4 surface choice for parity. |
| 8 | Final CTA (amber) | `--color-bg` | Cream→bg→charcoal-footer keeps the closer punchy. |

Effective alternation: **bg → cream → bg → cream → bg → cream → bg → (charcoal footer)**. No two adjacent same-surface bands in either branch (with or without before/after).

### 2.3 Amber discipline (restated for both pages)

- **Navbar amber CTA = chrome**, does not count against the page budget (1.05 §1).
- **Index page body** has exactly one amber CTA, in §3.6 (final CTA).
- **Detail page body** has exactly one amber CTA, in §4.8 (final CTA).
- **Hero CTAs are never amber** on either page. Detail hero secondary CTA is `btn--ghost`; there is no primary CTA in the detail hero — the page's CTA is the closer at the bottom.

### 2.4 Featured-card uses

**Neither page uses `.card--featured`.** Reasoning: each page already has an amber CTA in its closer; 1.03 §6.2 D2 forbids `.card--featured` and an amber CTA in the same section, and 1.06 §2.4 tightens this to "no `.card--featured` anywhere on a page that has an in-content amber CTA." Index and detail both have one. Done.

### 2.5 Reduced-motion behavior on both pages

Per 1.03 §7.7 + 1.07 mobile-LH lesson, when `prefers-reduced-motion: reduce`:

- Every `<AnimateIn>` becomes opacity-only at `--motion-fast` (120ms). No translate, no scale.
- Photo card hover scale becomes `1.0`; shadow growth retained.
- Filter chips never animate (interactive surface).
- Grid is wrapped in **one** `<AnimateIn fade-up>`; no per-tile animation, never. (Phase 1.07 P=86 fix.)
- Lightbox open/close: native `<dialog>`'s default `transition-behavior: allow-discrete` is honored at `--motion-fast` for opacity only. No translate.
- Before/after toggle: image swap with no cross-fade under reduced motion (instant swap).

---

## 3. Index page — section-by-section spec

### 3.1 Hero — compact text-only (D4.B)

The hero is text-only on cream. The grid below is 100% photo; a photo hero would compete with it. (D4 alternatives surfaced in §12.)

#### Desktop annotated mockup (1440 × 520)

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 520" width="100%" role="img" aria-label="Projects index hero — desktop">
  <style>
    .eb { font-family: 'Manrope', system-ui, sans-serif; font-weight: 600; font-size: 13px; fill: #2F5D27; letter-spacing: 1.5px; }
    .h1 { font-family: 'Manrope', system-ui, sans-serif; font-weight: 700; font-size: 56px; fill: #1A1A1A; letter-spacing: -1px; }
    .sub { font-family: 'Onest', system-ui, sans-serif; font-size: 20px; fill: #4A4A4A; }
    .count { font-family: 'Onest', system-ui, sans-serif; font-size: 15px; fill: #6B6B6B; font-weight: 500; }
    .anno { font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #B47821; font-style: italic; }
  </style>
  <rect width="1440" height="520" fill="#FAF7F1"/>
  <text x="96" y="200" class="eb">PORTFOLIO · OUR WORK</text>
  <text x="96" y="280" class="h1">Built last season,</text>
  <text x="96" y="346" class="h1">aging into the property.</text>
  <text x="96" y="396" class="sub">Patios, walls, lawns, and entire properties from across DuPage County.</text>
  <text x="96" y="424" class="sub">Filter by audience, or scroll to see everything we've built.</text>
  <text x="96" y="464" class="count">12 projects · 6 cities · 2000 – 2024</text>
  <text x="96" y="496" class="anno">--text-h1 · 56px desktop · Manrope 700 · text-wrap balance · ≤7 words EN / ≤9 ES</text>
  <text x="96" y="510" class="anno">Eyebrow --color-sunset-green-700 · subhead --color-text-secondary · count --color-text-muted</text>
  <line x1="96" y1="226" x2="180" y2="226" stroke="#2F5D27" stroke-width="2" opacity="0.4"/>
</svg>

#### Mobile annotated mockup (390 × 380)

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 380" width="100%" role="img" aria-label="Projects index hero — mobile">
  <style>
    .ebm { font-family: 'Manrope', system-ui, sans-serif; font-weight: 600; font-size: 12px; fill: #2F5D27; letter-spacing: 1.4px; }
    .h1m { font-family: 'Manrope', system-ui, sans-serif; font-weight: 700; font-size: 36px; fill: #1A1A1A; letter-spacing: -0.6px; }
    .subm { font-family: 'Onest', system-ui, sans-serif; font-size: 17px; fill: #4A4A4A; }
    .countm { font-family: 'Onest', system-ui, sans-serif; font-size: 14px; fill: #6B6B6B; font-weight: 500; }
  </style>
  <rect width="390" height="380" fill="#FAF7F1"/>
  <text x="16" y="80" class="ebm">PORTFOLIO · OUR WORK</text>
  <text x="16" y="140" class="h1m">Built last</text>
  <text x="16" y="184" class="h1m">season, aging</text>
  <text x="16" y="228" class="h1m">into property.</text>
  <text x="16" y="276" class="subm">Every project from across</text>
  <text x="16" y="298" class="subm">DuPage County.</text>
  <text x="16" y="340" class="countm">12 projects · 6 cities</text>
</svg>

| Element | Spec |
|---|---|
| Surface | `--color-bg-cream` |
| Container | `--container-wide` (1440), padding `px-4 sm:px-6 lg:px-8 xl:px-12` |
| Vertical padding | `py-20` desktop / `py-14` mobile |
| Eyebrow | `projects.hero.eyebrow` — see §7 |
| H1 | `projects.hero.h1` — `--text-h1`, ≤7 words EN, ≤9 words ES |
| Dek | `projects.hero.dek` — `--text-body-lg`, `--color-text-secondary`, ≤30 words EN budget |
| Count line | `projects.hero.count` — `--text-body-sm`, `--color-text-muted`, dynamic interpolation `{count} projects · {cities} cities · {minYear}–{maxYear}` |
| Entrance animation | **None** (per 1.03 §7 hero rule; restated 1.06 §3.8). |

### 3.2 Filter chip strip (D2.A — audience only, single-select)

Four chips: **All / Residential / Commercial / Hardscape**. Single-select. URL state at `?audience={slug}`. "All" is the leftmost chip and is the default when no `?audience` param is present.

#### Desktop annotated mockup (1440 × 200)

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 200" width="100%" role="img" aria-label="Filter chip strip — desktop">
  <style>
    .chip { font-family: 'Manrope', system-ui, sans-serif; font-weight: 600; font-size: 14px; }
    .lbl { font-family: 'Onest', system-ui, sans-serif; font-size: 13px; fill: #6B6B6B; }
    .anno { font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #B47821; font-style: italic; }
  </style>
  <rect width="1440" height="200" fill="#FFFFFF"/>
  <text x="96" y="60" class="lbl">Filter by audience</text>
  <!-- Active "All" chip -->
  <g transform="translate(96,80)">
    <rect width="80" height="40" rx="20" fill="#2F5D27"/>
    <text x="40" y="26" class="chip" fill="#FAF7F1" text-anchor="middle">All · 12</text>
  </g>
  <!-- Inactive chips -->
  <g transform="translate(192,80)">
    <rect width="142" height="40" rx="20" fill="none" stroke="#C9C0AE" stroke-width="1"/>
    <text x="71" y="26" class="chip" fill="#1A1A1A" text-anchor="middle">Residential · 4</text>
  </g>
  <g transform="translate(350,80)">
    <rect width="148" height="40" rx="20" fill="none" stroke="#C9C0AE" stroke-width="1"/>
    <text x="74" y="26" class="chip" fill="#1A1A1A" text-anchor="middle">Commercial · 3</text>
  </g>
  <g transform="translate(514,80)">
    <rect width="138" height="40" rx="20" fill="none" stroke="#C9C0AE" stroke-width="1"/>
    <text x="69" y="26" class="chip" fill="#1A1A1A" text-anchor="middle">Hardscape · 5</text>
  </g>
  <text x="96" y="156" class="anno">Active: bg --color-sunset-green-700, label --color-text-on-dark · Inactive: 1px --color-border-strong, label --color-text-primary</text>
  <text x="96" y="172" class="anno">Each chip is a &lt;button type="button"&gt; with aria-pressed=true|false · Hover: bg --color-sunset-green-50 · Focus: 2px --color-focus-ring outline offset 2</text>
  <text x="96" y="188" class="anno">URL: /projects/?audience=residential — single-select, "All" clears the param. No animation on chip click; only :hover/:focus/aria-pressed transitions.</text>
</svg>

#### Mobile annotated mockup (390 × 220)

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 220" width="100%" role="img" aria-label="Filter chip strip — mobile">
  <style>
    .chipm { font-family: 'Manrope', system-ui, sans-serif; font-weight: 600; font-size: 13px; }
    .lblm { font-family: 'Onest', system-ui, sans-serif; font-size: 12px; fill: #6B6B6B; }
    .anno { font-family: 'Onest', system-ui, sans-serif; font-size: 10px; fill: #B47821; font-style: italic; }
  </style>
  <rect width="390" height="220" fill="#FFFFFF"/>
  <text x="16" y="40" class="lblm">Filter by audience</text>
  <!-- Horizontally scrollable chip row (overflow-x-auto, snap-x) -->
  <g transform="translate(16,56)">
    <rect width="72" height="36" rx="18" fill="#2F5D27"/>
    <text x="36" y="23" class="chipm" fill="#FAF7F1" text-anchor="middle">All · 12</text>
  </g>
  <g transform="translate(100,56)">
    <rect width="124" height="36" rx="18" fill="none" stroke="#C9C0AE"/>
    <text x="62" y="23" class="chipm" fill="#1A1A1A" text-anchor="middle">Residential · 4</text>
  </g>
  <g transform="translate(236,56)">
    <rect width="128" height="36" rx="18" fill="none" stroke="#C9C0AE"/>
    <text x="64" y="23" class="chipm" fill="#1A1A1A" text-anchor="middle">Commercial · 3</text>
  </g>
  <g transform="translate(376,56)">
    <rect width="120" height="36" rx="18" fill="none" stroke="#C9C0AE"/>
    <text x="60" y="23" class="chipm" fill="#1A1A1A" text-anchor="middle">Hardscape · 5</text>
  </g>
  <line x1="0" y1="106" x2="390" y2="106" stroke="#E5E0D5" stroke-dasharray="4 4"/>
  <text x="16" y="140" class="anno">Mobile: horizontal scroll (overflow-x-auto, scroll-snap-type: x proximity).</text>
  <text x="16" y="156" class="anno">Right edge fades to white via mask-image to signal scroll affordance.</text>
  <text x="16" y="172" class="anno">No entrance animation. Active state survives URL share / refresh via ?audience=…</text>
</svg>

| Element | Spec |
|---|---|
| Element | `<button type="button" role="…">` (no `role`; native button is sufficient). `aria-pressed` reflects active. |
| Active chip | `bg: --color-sunset-green-700`, `color: --color-text-on-dark`, no border. |
| Inactive chip | `bg: transparent`, `color: --color-text-primary`, `border: 1px --color-border-strong`. |
| Hover (inactive) | `bg: --color-sunset-green-50`, `border-color: --color-sunset-green-500`. |
| Focus | `:focus-visible` → 2px `--color-focus-ring` outline, offset 2. |
| Height | 40 desktop / 36 mobile. (44 hit-target preserved via touch-padding wrapper on mobile.) |
| Spacing | Gap `--spacing-3` (12px) between chips. |
| Counts | `(filtered count of each audience)` rendered inline. Updates on data change; no live region needed (counts are static at request time). |
| Entrance animation | **None.** |

### 3.3 Grid (3 cols desktop / 2 tablet / 1 mobile · 12 tiles per page)

#### Desktop annotated mockup (1440 × 1520)

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 1520" width="100%" role="img" aria-label="Projects grid — desktop">
  <style>
    .ph { font-family: 'ui-monospace', Menlo, monospace; font-size: 12px; fill: #6A7A5C; }
    .ttl { font-family: 'Manrope', system-ui, sans-serif; font-weight: 600; font-size: 20px; fill: #FAF7F1; }
    .meta { font-family: 'Onest', system-ui, sans-serif; font-size: 14px; fill: rgba(250,247,241,0.85); }
    .pill { font-family: 'Manrope', system-ui, sans-serif; font-weight: 600; font-size: 11px; fill: #FAF7F1; letter-spacing: 0.08em; }
    .anno { font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #B47821; font-style: italic; }
  </style>
  <rect width="1440" height="1520" fill="#FFFFFF"/>

  <!-- Row 1 -->
  <g transform="translate(96,60)"><rect width="416" height="312" rx="16" fill="#5A6F4A"/><rect width="416" height="312" rx="16" fill="url(#g1)"/>
    <rect x="16" y="16" width="92" height="22" rx="4" fill="rgba(250,247,241,0.16)" stroke="rgba(250,247,241,0.32)"/>
    <text x="62" y="31" class="pill" text-anchor="middle">HARDSCAPE</text>
    <text x="208" y="180" class="ph" text-anchor="middle">[ lead.avif · 4:3 · ≤350KB ]</text>
    <text x="16" y="262" class="ttl">Naperville Hilltop Terrace</text>
    <text x="16" y="288" class="meta">Naperville · 2024</text>
  </g>
  <g transform="translate(528,60)"><rect width="416" height="312" rx="16" fill="#7A6E58"/><rect width="416" height="312" rx="16" fill="url(#g1)"/>
    <rect x="16" y="16" width="100" height="22" rx="4" fill="rgba(250,247,241,0.16)" stroke="rgba(250,247,241,0.32)"/>
    <text x="66" y="31" class="pill" text-anchor="middle">COMMERCIAL</text>
    <text x="208" y="180" class="ph" text-anchor="middle">[ lead.avif · 4:3 ]</text>
    <text x="16" y="262" class="ttl">Aurora HOA Curb Refresh</text>
    <text x="16" y="288" class="meta">Aurora · 2024</text>
  </g>
  <g transform="translate(960,60)"><rect width="416" height="312" rx="16" fill="#8A6A4A"/><rect width="416" height="312" rx="16" fill="url(#g1)"/>
    <rect x="16" y="16" width="98" height="22" rx="4" fill="rgba(250,247,241,0.16)" stroke="rgba(250,247,241,0.32)"/>
    <text x="65" y="31" class="pill" text-anchor="middle">RESIDENTIAL</text>
    <text x="208" y="180" class="ph" text-anchor="middle">[ lead.avif · 4:3 ]</text>
    <text x="16" y="262" class="ttl">Wheaton Lawn Reset</text>
    <text x="16" y="288" class="meta">Wheaton · 2024</text>
  </g>

  <!-- Row 2 -->
  <g transform="translate(96,388)"><rect width="416" height="312" rx="16" fill="#6A7A4C"/><rect width="416" height="312" rx="16" fill="url(#g1)"/>
    <rect x="16" y="16" width="92" height="22" rx="4" fill="rgba(250,247,241,0.16)" stroke="rgba(250,247,241,0.32)"/>
    <text x="62" y="31" class="pill" text-anchor="middle">HARDSCAPE</text>
    <text x="208" y="180" class="ph" text-anchor="middle">[ lead.avif · 4:3 ]</text>
    <text x="16" y="262" class="ttl">Lisle Retaining Wall</text>
    <text x="16" y="288" class="meta">Lisle · 2023</text>
  </g>
  <g transform="translate(528,388)"><rect width="416" height="312" rx="16" fill="#7A8A5C"/><rect width="416" height="312" rx="16" fill="url(#g1)"/>
    <rect x="16" y="16" width="98" height="22" rx="4" fill="rgba(250,247,241,0.16)" stroke="rgba(250,247,241,0.32)"/>
    <text x="65" y="31" class="pill" text-anchor="middle">RESIDENTIAL</text>
    <text x="208" y="180" class="ph" text-anchor="middle">[ lead.avif · 4:3 ]</text>
    <text x="16" y="262" class="ttl">Batavia Garden Reset</text>
    <text x="16" y="288" class="meta">Batavia · 2023</text>
  </g>
  <g transform="translate(960,388)"><rect width="416" height="312" rx="16" fill="#5C6660"/><rect width="416" height="312" rx="16" fill="url(#g1)"/>
    <rect x="16" y="16" width="100" height="22" rx="4" fill="rgba(250,247,241,0.16)" stroke="rgba(250,247,241,0.32)"/>
    <text x="66" y="31" class="pill" text-anchor="middle">COMMERCIAL</text>
    <text x="208" y="180" class="ph" text-anchor="middle">[ lead.avif · 4:3 ]</text>
    <text x="16" y="262" class="ttl">Bolingbrook Office Court</text>
    <text x="16" y="288" class="meta">Bolingbrook · 2023</text>
  </g>

  <!-- Row 3 -->
  <g transform="translate(96,716)"><rect width="416" height="312" rx="16" fill="#4A5A3C"/><rect width="416" height="312" rx="16" fill="url(#g1)"/>
    <rect x="16" y="16" width="92" height="22" rx="4" fill="rgba(250,247,241,0.16)" stroke="rgba(250,247,241,0.32)"/>
    <text x="62" y="31" class="pill" text-anchor="middle">HARDSCAPE</text>
    <text x="208" y="180" class="ph" text-anchor="middle">[ lead.avif · 4:3 ]</text>
    <text x="16" y="262" class="ttl">Naperville Fire Court</text>
    <text x="16" y="288" class="meta">Naperville · 2023</text>
  </g>
  <g transform="translate(528,716)"><rect width="416" height="312" rx="16" fill="#9AA89C"/><rect width="416" height="312" rx="16" fill="url(#g1)"/>
    <rect x="16" y="16" width="92" height="22" rx="4" fill="rgba(250,247,241,0.16)" stroke="rgba(250,247,241,0.32)"/>
    <text x="62" y="31" class="pill" text-anchor="middle">HARDSCAPE</text>
    <text x="208" y="180" class="ph" text-anchor="middle">[ lead.avif · 4:3 ]</text>
    <text x="16" y="262" class="ttl">Aurora Driveway Apron</text>
    <text x="16" y="288" class="meta">Aurora · 2022</text>
  </g>
  <g transform="translate(960,716)"><rect width="416" height="312" rx="16" fill="#6F8062"/><rect width="416" height="312" rx="16" fill="url(#g1)"/>
    <rect x="16" y="16" width="100" height="22" rx="4" fill="rgba(250,247,241,0.16)" stroke="rgba(250,247,241,0.32)"/>
    <text x="66" y="31" class="pill" text-anchor="middle">COMMERCIAL</text>
    <text x="208" y="180" class="ph" text-anchor="middle">[ lead.avif · 4:3 ]</text>
    <text x="16" y="262" class="ttl">Wheaton Bank Frontage</text>
    <text x="16" y="288" class="meta">Wheaton · 2022</text>
  </g>

  <!-- Row 4 -->
  <g transform="translate(96,1044)"><rect width="416" height="312" rx="16" fill="#5A4A3A"/><rect width="416" height="312" rx="16" fill="url(#g1)"/>
    <rect x="16" y="16" width="98" height="22" rx="4" fill="rgba(250,247,241,0.16)" stroke="rgba(250,247,241,0.32)"/>
    <text x="65" y="31" class="pill" text-anchor="middle">RESIDENTIAL</text>
    <text x="208" y="180" class="ph" text-anchor="middle">[ lead.avif · 4:3 ]</text>
    <text x="16" y="262" class="ttl">Batavia Front Walk</text>
    <text x="16" y="288" class="meta">Batavia · 2022</text>
  </g>
  <g transform="translate(528,1044)"><rect width="416" height="312" rx="16" fill="#4A5C68"/><rect width="416" height="312" rx="16" fill="url(#g1)"/>
    <rect x="16" y="16" width="98" height="22" rx="4" fill="rgba(250,247,241,0.16)" stroke="rgba(250,247,241,0.32)"/>
    <text x="65" y="31" class="pill" text-anchor="middle">RESIDENTIAL</text>
    <text x="208" y="180" class="ph" text-anchor="middle">[ lead.avif · 4:3 ]</text>
    <text x="16" y="262" class="ttl">Lisle Backyard Refresh</text>
    <text x="16" y="288" class="meta">Lisle · 2021</text>
  </g>
  <g transform="translate(960,1044)"><rect width="416" height="312" rx="16" fill="#7A6A4A"/><rect width="416" height="312" rx="16" fill="url(#g1)"/>
    <rect x="16" y="16" width="92" height="22" rx="4" fill="rgba(250,247,241,0.16)" stroke="rgba(250,247,241,0.32)"/>
    <text x="62" y="31" class="pill" text-anchor="middle">HARDSCAPE</text>
    <text x="208" y="180" class="ph" text-anchor="middle">[ lead.avif · 4:3 ]</text>
    <text x="16" y="262" class="ttl">Bolingbrook Paver Plaza</text>
    <text x="16" y="288" class="meta">Bolingbrook · 2021</text>
  </g>

  <text x="96" y="1410" class="anno">3-col grid · gap --spacing-4 (16px) · tile 4:3 with bottom 50% gradient overlay --color-overlay-50 → transparent</text>
  <text x="96" y="1426" class="anno">Tile = ProjectCard primitive (1.06 §8.3). Whole tile is a single &lt;a&gt; (one tabstop). Hover: image scale(1.03), title translateY(-2px).</text>
  <text x="96" y="1442" class="anno">D5.B content density: title (h5, on-dark) + audience tag-pill (upper-left) + meta line "City · Year" (--color-text-on-dark @ 0.85)</text>
  <text x="96" y="1458" class="anno">Tiles 1–6 eager (above-fold for 1440×900); tiles 7–12 loading="lazy". Explicit width/height required on every &lt;img&gt;.</text>
  <text x="96" y="1474" class="anno">One &lt;AnimateIn fade-up&gt; wraps the entire grid · NEVER per-tile (1.07 P=86 lesson)</text>

  <defs><linearGradient id="g1" x1="0" y1="0.5" x2="0" y2="1">
    <stop offset="0" stop-color="rgba(0,0,0,0)"/>
    <stop offset="1" stop-color="rgba(26,26,26,0.65)"/>
  </linearGradient></defs>
</svg>

| Element | Spec |
|---|---|
| Container | `--container-wide` (1440px) |
| Columns | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` |
| Gap | `--spacing-4` (16px); inherited from 1.06 §8.3 grid spec |
| Tile | `ProjectCard` primitive — locked from 1.06 §8.3. **No new variants.** |
| Tile content (D5.B) | Audience tag-pill (upper-left) · Title (`--text-h5` 600, `--color-text-on-dark`) · Meta line "City · Year" (`--text-body-sm`, `--color-text-on-dark` at 0.85 opacity, sits 2px under title) |
| Hover (locked) | image `scale(1.03)` over `--motion-slow`/`--easing-soft` · title `translateY(-2px)` |
| Click target | Whole tile is one `<a href="/projects/{slug}/">` — single tabstop |
| Loading | First 6 tiles eager; tiles 7–12 `loading="lazy"` and `decoding="async"`. Every `<img>` ships AVIF + WebP fallback with explicit `width`/`height`. |
| Entrance animation | **One** `<AnimateIn fade-up>` wraps the entire grid container. **Never per-tile.** |
| Empty data fallback | If filtered subset is empty, render `EmptyState` (§3.5) instead of grid + pagination. |

### 3.4 Pagination (D16 — numbered + prev/next)

Renders only when filtered total > 12.

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 180" width="100%" role="img" aria-label="Pagination — desktop">
  <style>
    .pn { font-family: 'Manrope', system-ui, sans-serif; font-weight: 600; font-size: 15px; fill: #1A1A1A; }
    .pncur { fill: #FAF7F1; }
    .pndis { fill: #6B6B6B; }
    .anno { font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #B47821; font-style: italic; }
  </style>
  <rect width="1440" height="180" fill="#FFFFFF"/>
  <!-- Centered pagination bar -->
  <g transform="translate(620,60)">
    <rect width="44" height="44" rx="8" fill="none" stroke="#E5E0D5"/>
    <text x="22" y="29" class="pn pndis" text-anchor="middle">←</text>
  </g>
  <g transform="translate(672,60)">
    <rect width="44" height="44" rx="8" fill="#2F5D27"/>
    <text x="22" y="29" class="pn pncur" text-anchor="middle">1</text>
  </g>
  <g transform="translate(724,60)">
    <rect width="44" height="44" rx="8" fill="none" stroke="#E5E0D5"/>
    <text x="22" y="29" class="pn" text-anchor="middle">2</text>
  </g>
  <g transform="translate(776,60)">
    <rect width="44" height="44" rx="8" fill="none" stroke="#E5E0D5"/>
    <text x="22" y="29" class="pn" text-anchor="middle">3</text>
  </g>
  <g transform="translate(828,60)">
    <rect width="44" height="44" rx="8" fill="none" stroke="#E5E0D5"/>
    <text x="22" y="29" class="pn" text-anchor="middle">→</text>
  </g>
  <text x="720" y="140" class="anno" text-anchor="middle">URL: /projects/?page=2 · prev/next disabled at boundaries (aria-disabled, --opacity-60)</text>
  <text x="720" y="156" class="anno" text-anchor="middle">Buttons 44×44 (hit-target floor) · Current: aria-current="page" · Server-rendered &lt;a&gt; elements</text>
</svg>

| Element | Spec |
|---|---|
| Element | Server-rendered `<a>` per page button (NOT `<button>` — they navigate). Prev/next become `<span aria-disabled="true">` at boundary. |
| Active page | `bg --color-sunset-green-700` + `color --color-text-on-dark` + `aria-current="page"` |
| Inactive page | `bg transparent` + 1px `--color-border` + `color --color-text-primary` |
| Hover | `bg --color-sunset-green-50` |
| Focus | 2px `--color-focus-ring` outline, offset 2 |
| Size | 44 × 44 (hit-target floor). Gap `--spacing-2` (8px) between buttons. |
| URL contract | Combines with audience filter: `/projects/?audience=hardscape&page=2`. `?page=1` is **omitted** (canonical is `/projects/` or `/projects/?audience=…`). |
| Entrance animation | None. |

### 3.5 Empty state (D14)

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" width="100%" role="img" aria-label="Empty state">
  <style>
    .h3 { font-family: 'Manrope', system-ui, sans-serif; font-weight: 700; font-size: 30px; fill: #1A1A1A; }
    .body { font-family: 'Onest', system-ui, sans-serif; font-size: 17px; fill: #4A4A4A; }
    .lnk { font-family: 'Onest', system-ui, sans-serif; font-size: 17px; fill: #2F5D27; font-weight: 600; text-decoration: underline; }
    .anno { font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #B47821; font-style: italic; }
  </style>
  <rect width="1440" height="320" fill="#FFFFFF"/>
  <g transform="translate(96,40)">
    <rect width="1248" height="240" rx="16" fill="#FAF7F1"/>
    <text x="624" y="100" class="h3" text-anchor="middle">No projects match this filter yet.</text>
    <text x="624" y="146" class="body" text-anchor="middle">We're still adding our older work. Try a different audience —</text>
    <text x="624" y="170" class="body" text-anchor="middle">or see everything we've built so far.</text>
    <text x="624" y="216" class="lnk" text-anchor="middle">Show all projects →</text>
  </g>
  <text x="96" y="312" class="anno">Surface --color-bg-cream panel inside the white grid band. No amber CTA in the empty state — the page CTA at the bottom still appears.</text>
</svg>

| Element | Spec |
|---|---|
| Surface | `--color-bg-cream` panel (`--shadow-on-cream`) inside the white grid band |
| H3 | `projects.empty.h3` (≤8 words EN). `--text-h3`. |
| Body | `projects.empty.body`, ≤24 words. `--color-text-secondary`. |
| Action | Text-link "Show all projects →" → `/projects/` (no audience param). **Not** an amber button. |
| Conditions | Renders when filtered subset length === 0. Replaces grid + pagination; final CTA still renders below. |

### 3.6 CTA section — single amber CTA (reused `<CTA>`)

Reuses the shared `<CTA>` from earlier phases with `copyNamespace="projects.cta"` and `destination="/request-quote/"`. Surface `--color-bg-cream`. The H2 references the portfolio context, not a city: e.g., "See yours on this page next year." `tokens` prop is **not** used here (no city interpolation on the index).

| Element | Spec |
|---|---|
| Surface | `--color-bg-cream` |
| Layout | Locked from 1.06 §9 — centered, eyebrow + H2 + body + amber CTA + "or call (630) 946-9321" tel link |
| H2 | `projects.cta.h2` — see §7 |
| Amber CTA | `Amber × lg` per 1.03 §6.1. Locked. |
| Entrance animation | One `<AnimateIn fade-up>` wraps the section. |

---

## 4. Detail page — section-by-section spec

### 4.1 Hero — compact split (D6.B), 50vh

Copy left (60%), lead photo right (40%). Mirrors 1.13 §4.1 location-hero.

#### Desktop annotated mockup (1440 × 600)

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 600" width="100%" role="img" aria-label="Project detail hero — desktop">
  <style>
    .crumb { font-family: 'Onest', system-ui, sans-serif; font-size: 14px; fill: #6B6B6B; }
    .eb { font-family: 'Manrope', system-ui, sans-serif; font-weight: 600; font-size: 13px; fill: #2F5D27; letter-spacing: 1.5px; }
    .h1 { font-family: 'Manrope', system-ui, sans-serif; font-weight: 700; font-size: 56px; fill: #1A1A1A; letter-spacing: -1px; }
    .dek { font-family: 'Onest', system-ui, sans-serif; font-size: 20px; fill: #4A4A4A; }
    .pill { font-family: 'Manrope', system-ui, sans-serif; font-weight: 600; font-size: 11px; fill: #2F5D27; letter-spacing: 0.08em; }
    .meta { font-family: 'Onest', system-ui, sans-serif; font-size: 14px; fill: #6B6B6B; }
    .ph { font-family: 'ui-monospace', Menlo, monospace; font-size: 13px; fill: #6A7A5C; }
    .anno { font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #B47821; font-style: italic; }
  </style>
  <rect width="1440" height="600" fill="#FFFFFF"/>
  <!-- Breadcrumb -->
  <text x="120" y="60" class="crumb">Home  /  Projects  /  Naperville Hilltop Terrace</text>
  <!-- Left column -->
  <text x="120" y="138" class="eb">PROJECT</text>
  <rect x="120" y="156" width="120" height="22" rx="4" fill="#FAF7F1" stroke="#C9C0AE"/>
  <text x="180" y="172" class="pill" text-anchor="middle">HARDSCAPE</text>
  <text x="120" y="240" class="h1">Naperville</text>
  <text x="120" y="306" class="h1">Hilltop Terrace</text>
  <text x="120" y="356" class="dek">A two-level paver terrace with a fire feature, built to</text>
  <text x="120" y="382" class="dek">read like an extension of the kitchen.</text>
  <text x="120" y="430" class="meta">Naperville · 2024 · 6 weeks</text>
  <!-- Right column: lead photo -->
  <g transform="translate(792,80)">
    <rect width="528" height="440" rx="16" fill="#5A6F4A"/>
    <text x="264" y="220" class="ph" text-anchor="middle">[ lead.avif · 16:9 hero ]</text>
    <text x="264" y="240" class="ph" text-anchor="middle">priority + fetchPriority="high"</text>
  </g>
  <!-- Annotations -->
  <text x="120" y="500" class="anno">Container --container-default 1200 · py-20 desktop / py-14 mobile · NO entrance animation (1.03 §7)</text>
  <text x="120" y="516" class="anno">Hero secondary CTA optional: ghost button "← All projects". No primary CTA in detail hero — page CTA is the bottom amber.</text>
  <text x="120" y="532" class="anno">Audience tag-pill on cream uses --color-sunset-green-700 fill (NOT on-dark) — this is the on-light pill variant; same shape, locked sibling style.</text>
  <text x="120" y="548" class="anno">H1 ≤8 words EN / ≤10 ES; text-wrap balance; per-project title field in projects.ts</text>
  <text x="120" y="564" class="anno">Lead photo: ratio 16:9 desktop, 4:3 mobile (cropped variant) — Code uses Next/Image with two ratios at LG breakpoint.</text>
</svg>

#### Mobile annotated mockup (390 × 700)

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 700" width="100%" role="img" aria-label="Project detail hero — mobile">
  <style>
    .crumbm { font-family: 'Onest', system-ui, sans-serif; font-size: 13px; fill: #6B6B6B; }
    .ebm { font-family: 'Manrope', system-ui, sans-serif; font-weight: 600; font-size: 12px; fill: #2F5D27; letter-spacing: 1.4px; }
    .h1m { font-family: 'Manrope', system-ui, sans-serif; font-weight: 700; font-size: 36px; fill: #1A1A1A; letter-spacing: -0.6px; }
    .dekm { font-family: 'Onest', system-ui, sans-serif; font-size: 17px; fill: #4A4A4A; }
    .metam { font-family: 'Onest', system-ui, sans-serif; font-size: 13px; fill: #6B6B6B; }
    .pillm { font-family: 'Manrope', system-ui, sans-serif; font-weight: 600; font-size: 10px; fill: #2F5D27; letter-spacing: 0.08em; }
    .phm { font-family: 'ui-monospace', Menlo, monospace; font-size: 11px; fill: #6A7A5C; }
  </style>
  <rect width="390" height="700" fill="#FFFFFF"/>
  <text x="16" y="40" class="crumbm">← Projects</text>
  <text x="16" y="80" class="ebm">PROJECT</text>
  <rect x="16" y="96" width="110" height="20" rx="4" fill="#FAF7F1" stroke="#C9C0AE"/>
  <text x="71" y="111" class="pillm" text-anchor="middle">HARDSCAPE</text>
  <text x="16" y="160" class="h1m">Naperville</text>
  <text x="16" y="204" class="h1m">Hilltop Terrace</text>
  <text x="16" y="248" class="dekm">A two-level paver terrace with</text>
  <text x="16" y="270" class="dekm">a fire feature.</text>
  <text x="16" y="306" class="metam">Naperville · 2024 · 6 weeks</text>
  <g transform="translate(16,340)">
    <rect width="358" height="270" rx="16" fill="#5A6F4A"/>
    <text x="179" y="135" class="phm" text-anchor="middle">[ lead.avif · 4:3 mobile ]</text>
  </g>
</svg>

| Element | Spec |
|---|---|
| Container | `--container-default` (1200px) |
| Layout | 60/40 split desktop · stacked mobile (copy then photo) |
| Hero photo | Lead photo, 16:9 desktop / 4:3 mobile via `<picture>` `source` switch at `(min-width: 1024px)`; **`priority` + `fetchPriority="high"`**; AVIF + WebP. The lead photo IS the LCP. |
| H1 | Per-project `title.{locale}` from `projects.ts`. ≤8 words EN, ≤10 ES. |
| Audience pill | On-light variant: `bg --color-bg-cream`, 1px `--color-border-strong`, label `--color-sunset-green-700`. Same dimensions as the on-dark pill (22px tall, 8px horizontal padding). |
| Dek | Per-project `shortDek.{locale}` (≤120 chars). `--text-body-lg`, `--color-text-secondary`. |
| Meta line | `City · Year · {durationWeeks} weeks` (i18n strings in §7). `--text-body-sm`, `--color-text-muted`. |
| Entrance animation | **None.** Hero is static. |

### 4.2 Breadcrumb

Sits inside §4.1's hero band, top-left, above the eyebrow. **Same items array** feeds the visible breadcrumb and the `BreadcrumbList` schema (1.09 §2 same-source rule).

| Element | Spec |
|---|---|
| Items | `Home → Projects → {Project title}` |
| Terminus | `<span aria-current="page">` — not an `<a>` |
| Separator | "  /  " (visual only; not in items array) |
| Token | `Breadcrumb` primitive from 1.03 §6 |
| Container | Same as hero (`--container-default`) |
| Mobile | Collapses to "← Projects" (single back-affordance, locked from 1.13 mobile pattern) |

### 4.3 Narrative

Surface `--color-bg-cream`. Eyebrow "THE PROJECT" / "EL PROYECTO". H2 placeholder per project. Prose ≤500 words EN budget.

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 540" width="100%" role="img" aria-label="Narrative section — desktop">
  <style>
    .eb { font-family: 'Manrope', system-ui, sans-serif; font-weight: 600; font-size: 13px; fill: #2F5D27; letter-spacing: 1.5px; }
    .h2 { font-family: 'Manrope', system-ui, sans-serif; font-weight: 700; font-size: 40px; fill: #1A1A1A; letter-spacing: -0.8px; }
    .p { font-family: 'Onest', system-ui, sans-serif; font-size: 17px; fill: #1A1A1A; }
    .anno { font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #B47821; font-style: italic; }
  </style>
  <rect width="1440" height="540" fill="#FAF7F1"/>
  <text x="120" y="100" class="eb">THE PROJECT</text>
  <text x="120" y="160" class="h2">A backyard nobody else would touch.</text>
  <text x="120" y="240" class="p">The lot drops twelve feet across forty. Most contractors quoted a single retaining wall and called it</text>
  <text x="120" y="266" class="p">a day. We built two — one functional, one for sitting on — and a paver terrace between them that runs</text>
  <text x="120" y="292" class="p">flush with the kitchen door. The lower level steps down to a fire feature with a 4-ft hood, sized for the</text>
  <text x="120" y="318" class="p">family to actually use it in October. The upper level is a herringbone Unilock Ledgestone, set on a six-</text>
  <text x="120" y="344" class="p">inch crushed-stone base over woven geotextile. Six weeks, two trips by the inspector, and a good crew.</text>
  <text x="120" y="412" class="anno">Container --container-default 1200 · single column ≤--container-prose 720 for the prose width</text>
  <text x="120" y="428" class="anno">Eyebrow + H2 + prose · placeholder ≤500 words EN budget · ES 1.25× length budget</text>
  <text x="120" y="444" class="anno">One &lt;AnimateIn fade-up&gt; wraps the section · text-wrap pretty on every &lt;p&gt; · scope --color-text-primary on cream (8.4:1 ratio, locked)</text>
  <text x="120" y="460" class="anno">No pull-quote, no inline images, no embedded video at v1 — narrative is text-only. Pull-quotes available in Part 2 if Erick supplies one.</text>
</svg>

| Element | Spec |
|---|---|
| Surface | `--color-bg-cream` |
| Container | `--container-default` (1200px); prose column clamps to `--container-prose` (720px) |
| Eyebrow | `project.narrative.eyebrow` — see §7 |
| H2 | Per-project `narrativeHeading.{locale}` from `projects.ts` (≤10 words EN). Falls back to `title.{locale}` if absent. |
| Body | Per-project `narrative.{locale}` (≤500 words EN). `--text-body`, `--color-text-primary`. `text-wrap: pretty` on every `<p>`. |
| Entrance animation | One `<AnimateIn fade-up>` wraps the section. |

### 4.4 Gallery (D7.B — uniform 4:3 grid; D8 — `<dialog>` lightbox)

#### Annotated grid mockup

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 1080" width="100%" role="img" aria-label="Gallery — desktop">
  <style>
    .ph { font-family: 'ui-monospace', Menlo, monospace; font-size: 12px; fill: #6A7A5C; }
    .ttl { font-family: 'Manrope', system-ui, sans-serif; font-weight: 700; font-size: 30px; fill: #1A1A1A; }
    .anno { font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #B47821; font-style: italic; }
  </style>
  <rect width="1440" height="1080" fill="#FFFFFF"/>
  <text x="96" y="60" class="ttl">Gallery</text>
  <!-- Grid 3 cols × 3 rows of 4:3 -->
  <g transform="translate(96,100)">
    <rect width="416" height="312" rx="12" fill="#5A6F4A"/><text x="208" y="160" class="ph" text-anchor="middle">[ 01.avif · 4:3 ]</text>
  </g>
  <g transform="translate(528,100)">
    <rect width="416" height="312" rx="12" fill="#7A6E58"/><text x="208" y="160" class="ph" text-anchor="middle">[ 02.avif · 4:3 ]</text>
  </g>
  <g transform="translate(960,100)">
    <rect width="416" height="312" rx="12" fill="#8A6A4A"/><text x="208" y="160" class="ph" text-anchor="middle">[ 03.avif · 4:3 ]</text>
  </g>
  <g transform="translate(96,428)">
    <rect width="416" height="312" rx="12" fill="#6A7A4C"/><text x="208" y="160" class="ph" text-anchor="middle">[ 04.avif · 4:3 ]</text>
  </g>
  <g transform="translate(528,428)">
    <rect width="416" height="312" rx="12" fill="#7A8A5C"/><text x="208" y="160" class="ph" text-anchor="middle">[ 05.avif · 4:3 · lazy ]</text>
  </g>
  <g transform="translate(960,428)">
    <rect width="416" height="312" rx="12" fill="#5C6660"/><text x="208" y="160" class="ph" text-anchor="middle">[ 06.avif · 4:3 · lazy ]</text>
  </g>
  <g transform="translate(96,756)">
    <rect width="416" height="312" rx="12" fill="#4A5A3C"/><text x="208" y="160" class="ph" text-anchor="middle">[ 07.avif · 4:3 · lazy ]</text>
  </g>
  <g transform="translate(528,756)">
    <rect width="416" height="312" rx="12" fill="#6F8062"/><text x="208" y="160" class="ph" text-anchor="middle">[ 08.avif · 4:3 · lazy ]</text>
  </g>
  <text x="96" y="1040" class="anno">3 cols desktop · 2 cols tablet · 2 cols mobile · gap --spacing-3 (12px) · radius --radius-md (12px equivalent — using 12 here keeps the grid feeling like a unit rather than 8 separate cards)</text>
  <text x="96" y="1056" class="anno">Container breaks out to --container-wide. First 4 photos eager, photos 5–8 lazy. Each is a &lt;button&gt; that opens the &lt;dialog&gt; lightbox.</text>
  <text x="96" y="1072" class="anno">Each &lt;img&gt; gets explicit width/height + alt text from projects.ts gallery[].alt.{locale}. AVIF + WebP fallback.</text>
</svg>

#### Lightbox behavior contract (D8)

Native `<dialog>` element via `dialogRef.current.showModal()`. Built-in focus-trap, built-in Esc-to-close, zero JS bundle for the trap. Spec:

| Behavior | Contract |
|---|---|
| Open | Click on any thumbnail → `showModal()`; sets `currentIndex` state; renders the indexed photo at full bleed inside the dialog. |
| Close (Esc) | Native `<dialog>` cancel event → `close()`. Restore focus to the thumbnail that was clicked. |
| Close (button) | Top-right close button (`aria-label="Close gallery"`, `lucide:X` icon, 44×44 hit target). |
| Close (backdrop) | Click on `::backdrop` → `close()` (Code: detect target === dialog ref). |
| Navigate | Left arrow / right arrow keys advance `currentIndex` (wraps end-to-end). Touch: swipe via simple touchstart/touchend dx threshold. |
| Counter | "3 / 8" label at bottom-center, `--color-text-on-dark`, `--text-body-sm` 600. Live region `aria-live="polite"` on counter so screen readers announce nav. |
| Focus | First focusable inside the dialog is the close button. `<dialog>`'s built-in focus-trap handles Tab cycling. |
| Reduced motion | `<dialog>` opacity transition only at `--motion-fast`. No translate. |
| No JS fallback | Each thumbnail is also wrapped in an `<a href="/images/projects/{slug}/{NN}.avif">` so JS-disabled visitors see the photo at native size in a new tab. The `<button>` overlay intercepts the click when JS is enabled. |
| Backdrop | `::backdrop { background: var(--color-overlay-80) }` |

### 4.5 Facts table (D10) — `<dl>` semantics

Six rows. Definition list semantics. Lives on `--color-bg-cream`.

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 480" width="100%" role="img" aria-label="Facts table — desktop">
  <style>
    .ttl { font-family: 'Manrope', system-ui, sans-serif; font-weight: 700; font-size: 30px; fill: #1A1A1A; }
    .dt { font-family: 'Manrope', system-ui, sans-serif; font-weight: 600; font-size: 13px; fill: #6B6B6B; letter-spacing: 0.08em; }
    .dd { font-family: 'Onest', system-ui, sans-serif; font-size: 17px; fill: #1A1A1A; }
    .anno { font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #B47821; font-style: italic; }
  </style>
  <rect width="1440" height="480" fill="#FAF7F1"/>
  <text x="120" y="60" class="ttl">Facts</text>
  <!-- Two columns of 3 rows each -->
  <g transform="translate(120,100)">
    <text class="dt">YEAR</text>
    <text y="28" class="dd">2024</text>
    <line y1="58" x1="0" x2="540" y2="58" stroke="#E5E0D5"/>
    <g transform="translate(0,80)">
      <text class="dt">CITY</text>
      <text y="28" class="dd">Naperville, IL</text>
      <line y1="58" x1="0" x2="540" y2="58" stroke="#E5E0D5"/>
    </g>
    <g transform="translate(0,160)">
      <text class="dt">AUDIENCE</text>
      <text y="28" class="dd">Hardscape · Residential</text>
      <line y1="58" x1="0" x2="540" y2="58" stroke="#E5E0D5"/>
    </g>
  </g>
  <g transform="translate(740,100)">
    <text class="dt">SERVICES</text>
    <text y="28" class="dd">Patios &amp; walkways · Retaining walls · Fire pits</text>
    <line y1="58" x1="0" x2="540" y2="58" stroke="#E5E0D5"/>
    <g transform="translate(0,80)">
      <text class="dt">MATERIALS</text>
      <text y="28" class="dd">Unilock Ledgestone · Bluestone caps</text>
      <line y1="58" x1="0" x2="540" y2="58" stroke="#E5E0D5"/>
    </g>
    <g transform="translate(0,160)">
      <text class="dt">DURATION</text>
      <text y="28" class="dd">6 weeks</text>
      <line y1="58" x1="0" x2="540" y2="58" stroke="#E5E0D5"/>
    </g>
  </g>
  <text x="120" y="408" class="anno">&lt;dl class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6"&gt; · &lt;dt&gt; uppercase tracking 0.08em · &lt;dd&gt; --text-body</text>
  <text x="120" y="424" class="anno">Awards / Featured-in rows are NOT shipped in Part 1 — added in Part 2 if Erick has them. Mark as TODO comment in projects.ts.</text>
  <text x="120" y="440" class="anno">--color-border 1px row separator after every &lt;dd&gt;. Last row in each column drops the rule.</text>
</svg>

| Row | Source field | EN label | ES label |
|---|---|---|---|
| Year | `year` | Year | Año |
| City | `citySlug` (resolved via `locations.ts`) | City | Ciudad |
| Audience | `audience` | Audience | Audiencia |
| Services | `serviceSlugs` (resolved via `services.ts`) | Services | Servicios |
| Materials | `materials.{locale}` | Materials | Materiales |
| Duration | `durationWeeks` | Duration | Duración |

### 4.6 Before / after toggle (D9.C — tab toggle)

Renders only if `hasBeforeAfter === true`. Smallest JS footprint of D9 options; works without JS (defaults to "After" rendering as static `<img>`).

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 720" width="100%" role="img" aria-label="Before/after toggle — desktop">
  <style>
    .ttl { font-family: 'Manrope', system-ui, sans-serif; font-weight: 700; font-size: 30px; fill: #1A1A1A; }
    .tab { font-family: 'Manrope', system-ui, sans-serif; font-weight: 600; font-size: 15px; }
    .ph { font-family: 'ui-monospace', Menlo, monospace; font-size: 13px; fill: #6A7A5C; }
    .anno { font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #B47821; font-style: italic; }
  </style>
  <rect width="1440" height="720" fill="#FFFFFF"/>
  <text x="120" y="60" class="ttl">Before · After</text>
  <!-- Toggle (segmented control look) -->
  <g transform="translate(120,90)">
    <rect width="240" height="44" rx="8" fill="#FAF7F1" stroke="#E5E0D5"/>
    <rect width="120" height="44" rx="8" fill="#2F5D27"/>
    <text x="60" y="29" class="tab" fill="#FAF7F1" text-anchor="middle">Before</text>
    <text x="180" y="29" class="tab" fill="#1A1A1A" text-anchor="middle">After</text>
  </g>
  <!-- Image (one of the pair, swapped on toggle) -->
  <g transform="translate(120,160)">
    <rect width="1200" height="480" rx="12" fill="#5C6660"/>
    <text x="600" y="240" class="ph" text-anchor="middle">[ before.avif · 4:3 · the swapped image ]</text>
  </g>
  <text x="120" y="688" class="anno">Two &lt;button role="tab" aria-pressed="true|false"&gt; · keyboard: ←/→ to swap · &lt;img&gt; src changes; alt text changes with state ("Before: ..." / "After: ...")</text>
  <text x="120" y="704" class="anno">No JS fallback: SSR renders the AFTER image inside; the toggle is hydration-only. Reduced-motion: instant swap, no cross-fade.</text>
</svg>

| Element | Spec |
|---|---|
| Surface | `--color-bg` |
| Container | `--container-default` (1200) |
| Toggle | Segmented control: 2 buttons in one rounded container. Active = `bg --color-sunset-green-700` + `color --color-text-on-dark`; inactive = transparent + `color --color-text-primary`. |
| ARIA | Each button is `<button type="button" aria-pressed="…">`. Keyboard: ←/→ swap, Tab moves focus past the group. (We use `aria-pressed` on both buttons rather than `role="tab"` because there is no panel — the same `<img>` swaps `src`.) |
| Image | One `<img>` whose `src` and `alt` swap on toggle. AVIF + WebP. Alt text: `"Before: {project title}"` / `"After: {project title}"` (i18n). |
| Cross-fade | 200ms opacity cross-fade via two stacked `<img>` elements (only the active one has `opacity: 1`). Reduced-motion: instant swap. |
| No-JS fallback | SSR renders the **After** image inside the toggle; the toggle is interactive only after hydration. Visitors with JS disabled see the better state by default. |

### 4.7 Related projects strip (D11 — 3 tiles, same-audience-then-city-then-recent)

Surface `--color-bg-cream`. Reuses `ProjectCard`. Header: "More like this" / "Más así".

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 540" width="100%" role="img" aria-label="Related projects strip — desktop">
  <style>
    .ttl { font-family: 'Manrope', system-ui, sans-serif; font-weight: 700; font-size: 30px; fill: #1A1A1A; }
    .pill { font-family: 'Manrope', system-ui, sans-serif; font-weight: 600; font-size: 11px; fill: #FAF7F1; letter-spacing: 0.08em; }
    .ttl2 { font-family: 'Manrope', system-ui, sans-serif; font-weight: 600; font-size: 20px; fill: #FAF7F1; }
    .meta { font-family: 'Onest', system-ui, sans-serif; font-size: 14px; fill: rgba(250,247,241,0.85); }
    .lnk { font-family: 'Onest', system-ui, sans-serif; font-weight: 600; font-size: 17px; fill: #2F5D27; }
    .anno { font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #B47821; font-style: italic; }
  </style>
  <rect width="1440" height="540" fill="#FAF7F1"/>
  <text x="120" y="60" class="ttl">More like this</text>
  <g transform="translate(120,100)"><rect width="384" height="288" rx="16" fill="#5A6F4A"/><rect width="384" height="288" rx="16" fill="url(#g2)"/>
    <rect x="16" y="16" width="92" height="22" rx="4" fill="rgba(250,247,241,0.16)" stroke="rgba(250,247,241,0.32)"/>
    <text x="62" y="31" class="pill" text-anchor="middle">HARDSCAPE</text>
    <text x="16" y="240" class="ttl2">Naperville Fire Court</text>
    <text x="16" y="266" class="meta">Naperville · 2023</text>
  </g>
  <g transform="translate(528,100)"><rect width="384" height="288" rx="16" fill="#7A6A4A"/><rect width="384" height="288" rx="16" fill="url(#g2)"/>
    <rect x="16" y="16" width="92" height="22" rx="4" fill="rgba(250,247,241,0.16)" stroke="rgba(250,247,241,0.32)"/>
    <text x="62" y="31" class="pill" text-anchor="middle">HARDSCAPE</text>
    <text x="16" y="240" class="ttl2">Bolingbrook Paver Plaza</text>
    <text x="16" y="266" class="meta">Bolingbrook · 2021</text>
  </g>
  <g transform="translate(936,100)"><rect width="384" height="288" rx="16" fill="#4A5A3C"/><rect width="384" height="288" rx="16" fill="url(#g2)"/>
    <rect x="16" y="16" width="92" height="22" rx="4" fill="rgba(250,247,241,0.16)" stroke="rgba(250,247,241,0.32)"/>
    <text x="62" y="31" class="pill" text-anchor="middle">HARDSCAPE</text>
    <text x="16" y="240" class="ttl2">Lisle Retaining Wall</text>
    <text x="16" y="266" class="meta">Lisle · 2023</text>
  </g>
  <text x="120" y="436" class="lnk">See all projects →</text>
  <text x="120" y="500" class="anno">Selection: same-audience first, then same-city, then most-recent. Fallback if &lt; 3: "most recent excluding self." Self never appears.</text>
  <text x="120" y="516" class="anno">Reuses ProjectCard primitive. NOT lazy — these tiles render below the gallery, but Code may set the first one eager and the rest lazy if Lighthouse mobile asks for it.</text>
  <defs><linearGradient id="g2" x1="0" y1="0.5" x2="0" y2="1">
    <stop offset="0" stop-color="rgba(0,0,0,0)"/>
    <stop offset="1" stop-color="rgba(26,26,26,0.65)"/>
  </linearGradient></defs>
</svg>

| Element | Spec |
|---|---|
| Count | 3 |
| Selection algorithm | (1) Same-audience excluding self. (2) If <3, top up with same-city excluding self. (3) If still <3, top up with most-recent excluding self. Sort within each tier by `year desc` then by `slug asc` for determinism. |
| Reuse | `ProjectCard` — same primitive as §3.3. |
| Footer link | "See all projects →" → `/{locale}/projects/`. Body-link style; not a button. |

### 4.8 Final CTA (amber, with city interpolation)

Reuses shared `<CTA>` with `copyNamespace="project.cta"`, `destination="/request-quote/?from=project&slug={slug}"`, and **`tokens={{ city: project.city.name[locale] }}`** (the prop ratified in 1.14). H2 reads "Build something like this in {city}?".

| Element | Spec |
|---|---|
| Surface | `--color-bg` |
| H2 | `project.cta.h2` with `{city}` token — see §7. EN ≤9 words; ES ≤11. |
| Amber CTA | `Amber × lg`. Locked. |

---

## 5. SEO and schema

### 5.1 Index

| Element | Spec |
|---|---|
| `<title>` | `Projects · Sunset Services` (EN, 28 chars) / `Proyectos · Sunset Services` (ES, 30 chars) |
| `<meta name="description">` | EN ≤160: "Patios, walls, lawns, and entire properties built across DuPage County by Sunset Services since 2000. Browse our portfolio." (123 chars). ES `[TBR]`. |
| `<link rel="canonical">` | Self-canonical to `/projects/` (or `/es/projects/`). Filtered/paginated views set canonical to the **un-paginated, un-filtered** route — these are not separately rankable assets. |
| hreflang | Three: `en`, `es`, `x-default` (= en). |
| `BreadcrumbList` | Home → Projects. Same items array as the visible breadcrumb (rendered if breadcrumb is added; on the index, breadcrumb is not visually rendered — the H1 IS the page name. Schema still emits Home → Projects for crawler context). |
| `ItemList` | `@type: ItemList`, `itemListElement: [{ @type: ListItem, position: N, item: { @type: CreativeWork, @id: "{absoluteUrl}/projects/{slug}/", name, image, dateCreated, locationCreated: { @type: Place, name: cityName } } }]` |
| Choice rationale | `CreativeWork` over `Article` because the entries are project records (a built thing), not articles (a written thing). Each entry's `creator` is `{ @id: "#localbusiness" }` referencing the sitewide `LocalBusiness` from 1.05 §8. |

### 5.2 Detail

| Element | Spec |
|---|---|
| `<title>` per project | Template: `{title} — {audience} project in {city} · Sunset Services`. EN ≤60 chars. Per-project narrative may shorten to fit. ES `[TBR]`. |
| `<meta description>` per project | Template: `{shortDek} {city}, IL. By Sunset Services.`. EN ≤160 chars. ES `[TBR]`. |
| `<link rel="canonical">` | Self-canonical to `/projects/{slug}/` (or `/es/projects/{slug}/`). |
| hreflang | Three: `en`, `es`, `x-default`. |
| `BreadcrumbList` | Home → Projects → {Project title}. **Same items array** the breadcrumb component consumes. |
| `CreativeWork` | `@type: CreativeWork`, `name: title`, `description: shortDek`, `image: [lead, ...gallery]`, `dateCreated: "{year}-01-01"` (year only), `creator: { @id: "#localbusiness" }`, `locationCreated: { @type: Place, name: cityName, address: { @type: PostalAddress, addressLocality: cityName, addressRegion: "IL", addressCountry: "US" } }`, `keywords: [audience, ...serviceNames]`. |
| `image` array | Same array Code uses to render the gallery (same-source rule, mirroring 1.09 §2 breadcrumb pattern but applied to images). Lead photo is index `0`. |
| Self-reference | A project's CreativeWork `url` MUST equal its canonical. |

---

## 6. Photography and illustration brief

For Phase 2.04 (Cowork sources from Erick's Drive). Part 1 ships with placeholder SVG-block fillers in the same dimensions; the spec below is for the Phase 2 swap.

### 6.1 Per-project assets

| Asset | Count | Dimensions | Format | Budget | Eager / lazy |
|---|---|---|---|---|---|
| Lead photo | 1 per project (12 total) | 16:9 desktop, 4:3 mobile (cropped variant) | AVIF + WebP fallback | ≤350KB | **Eager.** Detail hero LCP. |
| Gallery photos | 4–8 per project (~72 total avg 6) | 4:3 | AVIF + WebP | ≤200KB each | First 4 eager, rest lazy. |
| Before / after pair | 2 photos each, 2 of 12 projects (4 photos total) | 4:3, framed identically | AVIF + WebP | ≤200KB each | After eager, Before lazy. |
| Thumbnail (grid tile) | Reuses the lead photo at 4:3 crop | 4:3 | AVIF + WebP | ≤200KB | First 6 tiles eager, tiles 7–12 lazy. |

### 6.2 Per-project shot brief

Cowork delivers, per project: 1 lead, 4–8 gallery, 0 or 2 before/after. Brief:

- **Lead photo:** the money shot. Golden-hour preferred (60/120 min after sunrise / before sunset). Audience signal — premium hardscape patio, HOA commercial frontage, cozy residential lawn — should be unambiguous within 2 seconds.
- **Gallery photos:** mix of (a) wide context, (b) detail close-up of materials, (c) human-scale shot showing the space in use, (d) optional: drone or elevated angle showing the property scope. Avoid photos with cars, license plates, or identifiable people unless model release is signed (Erick handles releases; flag in CMS).
- **Before/after pair:** identical framing, identical time of day, identical lens. Both photos must be locked-tripod, not handheld.

### 6.3 Naming convention

```
/public/images/projects/{slug}/lead.avif
/public/images/projects/{slug}/lead.webp
/public/images/projects/{slug}/01.avif         01..08, 1-indexed
/public/images/projects/{slug}/01.webp
/public/images/projects/{slug}/before.avif     when hasBeforeAfter
/public/images/projects/{slug}/after.avif
```

---

## 7. i18n strings table

`projects.*` (index chrome) and `project.*` (detail chrome) live in `messages/{locale}.json`. Per-project content lives in `projects.ts`. Mark all Spanish strings `[TBR]` for native review (Phase 2.13).

### 7.1 `projects.*` — index chrome

| Key | EN | ES |
|---|---|---|
| `projects.hero.eyebrow` | Portfolio · Our Work | Portafolio · Nuestro Trabajo `[TBR]` |
| `projects.hero.h1` | Built last season, aging into the property. | Construido la temporada pasada, integrándose en la propiedad. `[TBR]` |
| `projects.hero.dek` | Patios, walls, lawns, and entire properties from across DuPage County. Filter by audience, or scroll to see everything we've built. | Patios, muros, jardines y propiedades enteras en todo el condado de DuPage. Filtra por audiencia, o desplázate para ver todo lo que hemos construido. `[TBR]` |
| `projects.hero.count` | {count} projects · {cities} cities · {minYear}–{maxYear} | {count} proyectos · {cities} ciudades · {minYear}–{maxYear} `[TBR]` |
| `projects.filter.label` | Filter by audience | Filtrar por audiencia `[TBR]` |
| `projects.filter.all` | All · {count} | Todos · {count} `[TBR]` |
| `projects.filter.residential` | Residential · {count} | Residencial · {count} `[TBR]` |
| `projects.filter.commercial` | Commercial · {count} | Comercial · {count} `[TBR]` |
| `projects.filter.hardscape` | Hardscape · {count} | Hardscape · {count} `[TBR]` |
| `projects.pagination.prev` | Previous page | Página anterior `[TBR]` |
| `projects.pagination.next` | Next page | Página siguiente `[TBR]` |
| `projects.pagination.pageLabel` | Page {n} | Página {n} `[TBR]` |
| `projects.empty.h3` | No projects match this filter yet. | Aún no hay proyectos en este filtro. `[TBR]` |
| `projects.empty.body` | We're still adding our older work. Try a different audience — or see everything we've built so far. | Seguimos agregando nuestros trabajos antiguos. Prueba otra audiencia — o ve todo lo que hemos construido hasta ahora. `[TBR]` |
| `projects.empty.reset` | Show all projects → | Ver todos los proyectos → `[TBR]` |
| `projects.cta.eyebrow` | Ready to start? | ¿Listo para empezar? `[TBR]` |
| `projects.cta.h2` | See yours on this page next year. | El próximo año ve el tuyo en esta página. `[TBR]` |
| `projects.cta.body` | Tell us about the property and we'll come measure, sketch, and price it. Free, no obligation. | Cuéntanos sobre la propiedad y vamos a medir, dibujar y cotizarla. Gratis, sin compromiso. `[TBR]` |
| `projects.cta.button` | Get a Free Estimate | Solicita un Presupuesto Gratis `[TBR]` |
| `projects.cta.phone` | or call (630) 946-9321 | o llama al (630) 946-9321 `[TBR]` |

### 7.2 `project.*` — detail chrome

| Key | EN | ES |
|---|---|---|
| `project.breadcrumb.home` | Home | Inicio `[TBR]` |
| `project.breadcrumb.projects` | Projects | Proyectos `[TBR]` |
| `project.hero.eyebrow` | Project | Proyecto `[TBR]` |
| `project.hero.metaTemplate` | {city} · {year} · {durationWeeks} weeks | {city} · {year} · {durationWeeks} semanas `[TBR]` |
| `project.narrative.eyebrow` | The project | El proyecto `[TBR]` |
| `project.gallery.h2` | Gallery | Galería `[TBR]` |
| `project.gallery.lightbox.close` | Close gallery | Cerrar galería `[TBR]` |
| `project.gallery.lightbox.counter` | {n} of {total} | {n} de {total} `[TBR]` |
| `project.gallery.lightbox.prev` | Previous photo | Foto anterior `[TBR]` |
| `project.gallery.lightbox.next` | Next photo | Foto siguiente `[TBR]` |
| `project.facts.h2` | Facts | Datos `[TBR]` |
| `project.facts.year` | Year | Año `[TBR]` |
| `project.facts.city` | City | Ciudad `[TBR]` |
| `project.facts.audience` | Audience | Audiencia `[TBR]` |
| `project.facts.services` | Services | Servicios `[TBR]` |
| `project.facts.materials` | Materials | Materiales `[TBR]` |
| `project.facts.duration` | Duration | Duración `[TBR]` |
| `project.facts.durationWeeks` | {n} weeks | {n} semanas `[TBR]` |
| `project.beforeAfter.h2` | Before · After | Antes · Después `[TBR]` |
| `project.beforeAfter.before` | Before | Antes `[TBR]` |
| `project.beforeAfter.after` | After | Después `[TBR]` |
| `project.beforeAfter.altBefore` | Before: {title} | Antes: {title} `[TBR]` |
| `project.beforeAfter.altAfter` | After: {title} | Después: {title} `[TBR]` |
| `project.related.h2` | More like this | Más así `[TBR]` |
| `project.related.seeAll` | See all projects → | Ver todos los proyectos → `[TBR]` |
| `project.cta.eyebrow` | Build with us | Construye con nosotros `[TBR]` |
| `project.cta.h2` | Build something like this in {city}? | ¿Construir algo así en {city}? `[TBR]` |
| `project.cta.body` | Tell us about the property. We'll come measure, sketch, and price it. | Cuéntanos sobre la propiedad. Vamos a medir, dibujar y cotizar. `[TBR]` |
| `project.cta.button` | Get a Free Estimate | Solicita un Presupuesto Gratis `[TBR]` |

Per-project fields (`title`, `shortDek`, `narrative`, `narrativeHeading`, `materials`, gallery `alt[]`) live in `projects.ts` — see §11.

---

## 8. Motion choreography

### 8.1 `<AnimateIn>` budget per page

| Page | Section-level wrappers | Notes |
|---|---|---|
| Index | **3** — Hero (no!), Filter strip (no!), Grid (yes), Pagination (no), Empty state (yes when present), Final CTA (yes). Total: **3** when grid renders, **2** when empty state replaces grid. | Hero **no** (1.03 §7). Filter chips **no** (interactive surface). Pagination **no** (utility chrome). |
| Detail | **5** — Hero (no!), Narrative (yes), Gallery (yes), Facts (yes), Before/after (yes when present), Related (yes), Final CTA (yes). Total: **6** when before/after renders, **5** otherwise. | Hero **no** (1.03 §7). Breadcrumb **no** (chrome). |

### 8.2 Per-section choreography

| Section | Animation | Reduced-motion |
|---|---|---|
| Index hero | None | n/a |
| Filter strip | None — this is interactive surface; do not animate `aria-pressed` swaps | n/a |
| Grid | One `<AnimateIn fade-up>` wraps the grid container. Tiles do **not** animate individually. | Opacity-only at `--motion-fast`. |
| Pagination | None | n/a |
| Empty state | One `<AnimateIn fade-up>` wraps the empty panel | Opacity-only. |
| Index final CTA | One `<AnimateIn fade-up>` wraps the CTA section | Opacity-only. |
| Detail hero | None | n/a |
| Detail narrative | One `<AnimateIn fade-up>` | Opacity-only. |
| Detail gallery | One `<AnimateIn fade-up>` wraps the gallery grid. Photos do **not** animate individually. | Opacity-only. |
| Detail facts | One `<AnimateIn fade-up>` | Opacity-only. |
| Detail before/after | One `<AnimateIn fade-up>` wraps the section. The image swap inside is a 200ms opacity cross-fade (locked). | Instant swap (no cross-fade). |
| Detail related | One `<AnimateIn fade-up>` wraps the strip. | Opacity-only. |
| Detail final CTA | One `<AnimateIn fade-up>` | Opacity-only. |
| Lightbox | Native `<dialog>` opacity at `--motion-fast`. No translate. No motion lib. | Same — already opacity-only. |

### 8.3 Reduced-motion contract (restated, 1.07 lesson)

`MotionConfig reducedMotion="user"` is mounted at locale layout (locked from 1.04). With `prefers-reduced-motion: reduce`:
- Every `<AnimateIn>` becomes opacity at `--motion-fast` — no `y`, no `scale`.
- ProjectCard hover: image scale becomes `1.0`; shadow growth retained.
- Filter chips: never animate (interactive surface).
- Lightbox: opacity-only, no translate.
- Before/after toggle: instant swap (no cross-fade).
- Buttons: hover `translateY(-1px)` removed; color/shadow changes retained.

---

## 9. Accessibility audit

### 9.1 Heading hierarchy

| Page | H1 | H2s | H3s |
|---|---|---|---|
| Index | "Built last season, aging into the property." (one) | none in §3.2/§3.3/§3.4. Empty state H3 is H3 not H2. Final CTA: "See yours on this page next year." | Empty state heading. |
| Detail | Per-project title (one) | "The project" (narrative — actually rendered as eyebrow + per-project H2), "Gallery", "Facts", "Before · After" (when present), "More like this", "Build something like this in {city}?" | none |

No skipped levels on either page.

### 9.2 Filter chips

- Element: `<button type="button">` (no role; native button is the right element).
- State: `aria-pressed="true|false"` reflects active.
- Counts inside the label do **not** require a live region — they are static at request time.
- Hit target: 40px desktop, 36px mobile **with a 4px touch-padding wrapper** so total tap area ≥44.
- Focus: 2px `--color-focus-ring`, offset 2.

### 9.3 Grid tiles

- Whole tile is a single `<a href>` — one tabstop per tile.
- Accessible name: per-project `title.{locale}` (the `<h3>` inside the card is the accessible name; tag-pill and meta are decorative-readable).
- Alt text on the lead photo: per-project `leadAlt.{locale}` from `projects.ts`. Empty/decorative not allowed.
- Focus: card receives `:focus-visible` ring via `:has(:focus-visible)` as locked in 1.03 §6.2.

### 9.4 Lightbox

- Native `<dialog>` provides focus-trap and focus-restore by default.
- Open: `dialogRef.current.showModal()`. Triggering thumbnail receives focus on close.
- Close: Esc (native cancel), backdrop click (Code listens), close button (44×44, `aria-label="Close gallery"`).
- Photo counter is an `aria-live="polite"` region announcing "{n} of {total}" on nav.
- Prev/next buttons: `<button>` with `aria-label` from i18n strings table.
- Keyboard: Tab cycles within (built-in); ←/→ navigate; Esc closes.

### 9.5 Before/after toggle

- Each option is `<button type="button" aria-pressed>`.
- Image alt text changes with state (`Before: {title}` / `After: {title}`).
- Keyboard: ←/→ swap; Tab moves past the group.

### 9.6 Color contrast verification (already 1.06-locked; restated)

| Pairing | Ratio | Verdict |
|---|---|---|
| Tag-pill (on-dark): `#FAF7F1` text on `rgba(250,247,241,0.16)` over photo | ≥4.5 : 1 (verified by 1.06; gradient ensures the text band's effective contrast clears AA) | ✓ |
| Tag-pill (on-light, detail hero): `--color-sunset-green-700` on `--color-bg-cream` | 9.2 : 1 (1.03 row 19) | ✓ |
| Title on photo card: `--color-text-on-dark` over gradient | ≥4.5 : 1 (1.03 row 26) | ✓ |
| Filter chip active: `--color-text-on-dark` on `--color-sunset-green-700` | 9.8 : 1 (1.03 row 12) | ✓ |
| Filter chip inactive: `--color-text-primary` on `--color-bg` | 18.9 : 1 (1.03 row 1) | ✓ |
| Pagination active: `--color-text-on-dark` on `--color-sunset-green-700` | 9.8 : 1 | ✓ |
| Empty state body on `--color-bg-cream` | 8.4 : 1 (1.03 row 6) | ✓ |
| Lightbox counter on `--color-overlay-80`: `--color-text-on-dark` on `rgba(26,26,26,0.80)` over photo | ≥9 : 1 effective | ✓ |

---

## 10. Lighthouse 95+ implications

### 10.1 Page-weight budgets

| Page | First-load weight target | Notes |
|---|---|---|
| Index | **≤900 KB** total transfer | First 6 tile lead photos eager (≤200KB × 6 ≈ 1.2MB raw, but Code's responsive crops at the actual rendered tile size — ~520×390 — drop the per-photo to ≈90KB AVIF, so 6 × 90 ≈ 540KB images + ~150KB JS + ~80KB CSS + ~130KB fonts + chrome ≈ 900KB). Tiles 7–12 lazy. |
| Detail | **≤1.4 MB** total transfer | Lead 16:9 ≈ 350KB + 4 gallery eager (≈140KB each at responsive 4:3 ≈ 560KB) + chrome (CSS/JS/fonts ≈ 360KB) + related strip 3 thumbs (≈90KB each lazy = excluded from first load) = ≈1.27MB first-load. Gallery photos 5–8 lazy below the fold. |

### 10.2 Concrete tactics

- **LCP element:** Index — first tile's lead photo (top-left). Detail — hero lead photo. Both: `priority` + `fetchPriority="high"`.
- **Explicit `width` and `height` on every `<img>`** (zero CLS).
- **AVIF + WebP fallback** via `<picture>`.
- **Server components by default.** Only the lightbox gallery and the before/after toggle are `"use client"`-justified. Filter chip strip is also `"use client"` — it owns the URL update on chip click, but it does **not** fetch data; the grid is server-rendered from `searchParams`.
- **No client-side filtering.** Filter changes are URL changes; the page re-renders server-side. This is locked from D1 (single-select) + D13 (query-string state).
- **Preconnect** for the AVIF CDN if any (likely Sanity in Part 2; Part 1 serves from `/public/`).
- **Font preload** continues from 1.03 §3.1 — `next/font/google` `display: swap`, preload the heading family only.

### 10.3 Justified client components

| File | `"use client"` | Why |
|---|---|---|
| `FilterChipStrip.tsx` | yes | Owns the URL update on chip click via `useRouter().replace()` to avoid a full page transition flicker. Reads `searchParams` to set `aria-pressed`. No data fetching. |
| `ProjectGallery.tsx` | yes | Owns the `<dialog>` ref, keyboard listeners (←/→/Esc), and current-index state. No data fetching. |
| `BeforeAfterToggle.tsx` | yes | Owns the active-state and image cross-fade timing. Tiny. |

Everything else is server-rendered.

---

## 11. Component file plan + `projects.ts` seed

### 11.1 File plan

```
src/data/
  projects.ts                              # typed seed of 12 bilingual projects (§11.3)

src/components/sections/projects/
  ProjectsHero.tsx                         # server. Index hero (§3.1).
  FilterChipStrip.tsx                      # "use client". URL-driven chips (§3.2).
  ProjectsGrid.tsx                         # server. Reads searchParams; renders ProjectCards (§3.3).
  Pagination.tsx                           # server. Pure URL-driven (§3.4).
  EmptyState.tsx                           # server (§3.5).

src/components/sections/projects/detail/
  ProjectHero.tsx                          # server (§4.1 + §4.2 breadcrumb composes).
  ProjectNarrative.tsx                     # server (§4.3).
  ProjectGallery.tsx                       # "use client". Lightbox (§4.4).
  ProjectFacts.tsx                         # server (§4.5).
  BeforeAfterToggle.tsx                    # "use client". (§4.6).
  RelatedProjects.tsx                      # server (§4.7).

src/components/ui/
  ProjectCard.tsx                          # CONFIRM EXISTS — see §11.2 reconciliation.

src/app/[locale]/(marketing)/projects/
  page.tsx                                 # the index route
  [slug]/page.tsx                          # the detail route
```

`generateStaticParams` on `[slug]/page.tsx` returns the 12 slugs from `projects.ts`. Unknown slugs → `notFound()`.

### 11.2 `ProjectCard` reconciliation (Open mismatch — see §14)

The 1.06 §8.3 spec describes the project tile in detail, but the file plan in 1.06 created `ProjectsTeaser` (the homepage section component) — **not** an extracted `ProjectCard` UI primitive. 1.11 §3.6 confirmed `ProjectsTeaser` was lifted to be a shared component used on Homepage / About / Locations, but did **not** explicitly extract `ProjectCard` either. **Working assumption:** Code in Phase 1.16 must either:

- **(a)** Extract `ProjectCard` from `ProjectsTeaser` into `src/components/ui/ProjectCard.tsx` and have `ProjectsTeaser` consume it (preferred), OR
- **(b)** Confirm `ProjectCard` already exists at `src/components/ui/ProjectCard.tsx` and reuse verbatim.

If neither is true, Code surfaces this back to Chat before scaffolding the projects index. **The portfolio cannot ship a second tile component** — that violates 1.06 §8.3's "no new variants."

### 11.3 `projects.ts` — typed seed

```ts
// src/data/projects.ts

export type ProjectAudience = 'residential' | 'commercial' | 'hardscape';

export type ProjectGalleryEntry = {
  /** Image filename in /public/images/projects/{slug}/ — e.g. '01.avif' */
  file: string;
  alt: { en: string; es: string };
};

export type Project = {
  slug: string;
  audience: ProjectAudience;
  /** FK to services.ts entries. Code asserts every slug resolves at build time. */
  serviceSlugs: string[];
  /** FK to locations.ts entries. */
  citySlug: string;
  year: number;
  durationWeeks: number;
  materials: { en: string; es: string };
  hasBeforeAfter: boolean;
  photoCount: number;
  title: { en: string; es: string };
  /** ≤120 chars; tile + meta description seed */
  shortDek: { en: string; es: string };
  /** Optional H2 for the narrative section; falls back to title */
  narrativeHeading?: { en: string; es: string };
  /** ≤500 words EN budget; placeholder OK */
  narrative: { en: string; es: string };
  leadAlt: { en: string; es: string };
  gallery: ProjectGalleryEntry[];
  beforeAlt?: { en: string; es: string };
  afterAlt?: { en: string; es: string };
};

export const projects: Project[] = [
  // ----- Naperville × 2 (Hardscape, Hardscape) -----
  {
    slug: 'naperville-hilltop-terrace',
    audience: 'hardscape',
    serviceSlugs: ['patios-walkways', 'retaining-walls', 'fire-pits'],
    citySlug: 'naperville',
    year: 2024,
    durationWeeks: 6,
    materials: {
      en: 'Unilock Ledgestone, natural bluestone caps, weathering-steel fire bowl',
      es: 'Unilock Ledgestone, tapas de piedra azul natural, cuenco de fuego de acero corten [TBR]',
    },
    hasBeforeAfter: true,
    photoCount: 8,
    title: { en: 'Naperville Hilltop Terrace', es: 'Terraza en la colina, Naperville [TBR]' },
    shortDek: {
      en: 'Two-level paver terrace with a fire feature, built to read like an extension of the kitchen.',
      es: 'Terraza de adoquines de dos niveles con chimenea, diseñada como una extensión de la cocina. [TBR]',
    },
    narrativeHeading: {
      en: 'A backyard nobody else would touch.',
      es: 'Un patio que nadie más quería tocar. [TBR]',
    },
    narrative: {
      en: 'The lot drops twelve feet across forty. Most contractors quoted a single retaining wall and called it a day. We built two — one functional, one for sitting on — and a paver terrace between them that runs flush with the kitchen door. The lower level steps down to a fire feature with a 4-ft hood, sized for the family to actually use it in October. The upper level is a herringbone Unilock Ledgestone, set on a six-inch crushed-stone base over woven geotextile. Six weeks, two trips by the inspector, and a good crew.',
      es: '[TBR] Placeholder — Erick polishes in Part 2.',
    },
    leadAlt: { en: 'Two-level paver terrace at golden hour, fire feature lit', es: '[TBR]' },
    gallery: Array.from({ length: 8 }, (_, i) => ({
      file: `${String(i + 1).padStart(2, '0')}.avif`,
      alt: { en: `Naperville Hilltop Terrace — view ${i + 1}`, es: `[TBR] vista ${i + 1}` },
    })),
    beforeAlt: { en: 'Before: bare slope, no terraces', es: '[TBR] Antes: pendiente vacía' },
    afterAlt: { en: 'After: completed two-level terrace with fire feature', es: '[TBR] Después' },
  },
  {
    slug: 'naperville-fire-court',
    audience: 'hardscape',
    serviceSlugs: ['fire-pits', 'patios-walkways'],
    citySlug: 'naperville',
    year: 2023,
    durationWeeks: 3,
    materials: { en: 'Belgard Mega-Arbel, gas-line fire ring', es: '[TBR]' },
    hasBeforeAfter: false,
    photoCount: 5,
    title: { en: 'Naperville Fire Court', es: 'Patio con fogata, Naperville [TBR]' },
    shortDek: {
      en: 'A 14-foot circular paver court with a low gas fire ring, sized for two adirondacks and a dog.',
      es: '[TBR] Placeholder',
    },
    narrative: { en: 'Three weeks. Centered on the maple. The clients wanted a place to sit at night with a dog and a glass.', es: '[TBR]' },
    leadAlt: { en: 'Circular paver court with lit fire ring at dusk', es: '[TBR]' },
    gallery: Array.from({ length: 5 }, (_, i) => ({
      file: `${String(i + 1).padStart(2, '0')}.avif`,
      alt: { en: `Naperville Fire Court — view ${i + 1}`, es: `[TBR] vista ${i + 1}` },
    })),
  },

  // ----- Aurora × 2 (Commercial, Hardscape) -----
  {
    slug: 'aurora-hoa-curb-refresh',
    audience: 'commercial',
    serviceSlugs: ['lawn-care', 'landscape-design'],
    citySlug: 'aurora',
    year: 2024,
    durationWeeks: 4,
    materials: { en: 'Dwarf burning bush, river-rock mulch beds', es: '[TBR]' },
    hasBeforeAfter: true,
    photoCount: 6,
    title: { en: 'Aurora HOA Curb Refresh', es: 'Refresco de jardín de HOA en Aurora [TBR]' },
    shortDek: { en: 'Six entrance medians and 1,200 ft of frontage replanted across one HOA section.', es: '[TBR]' },
    narrative: { en: 'A budget-conscious HOA that had let the entrance medians go scraggly. We replanted six of them, replaced the frontage shrubs, and set the maintenance schedule.', es: '[TBR]' },
    leadAlt: { en: 'Replanted HOA entrance median with new shrubs and mulch', es: '[TBR]' },
    gallery: Array.from({ length: 6 }, (_, i) => ({
      file: `${String(i + 1).padStart(2, '0')}.avif`,
      alt: { en: `Aurora HOA — view ${i + 1}`, es: `[TBR] vista ${i + 1}` },
    })),
    beforeAlt: { en: 'Before: overgrown median', es: '[TBR]' },
    afterAlt: { en: 'After: replanted median', es: '[TBR]' },
  },
  {
    slug: 'aurora-driveway-apron',
    audience: 'hardscape',
    serviceSlugs: ['patios-walkways'],
    citySlug: 'aurora',
    year: 2022,
    durationWeeks: 2,
    materials: { en: 'Unilock Brussels Block, Belgian-edge border', es: '[TBR]' },
    hasBeforeAfter: false,
    photoCount: 4,
    title: { en: 'Aurora Driveway Apron', es: 'Entrada con adoquines en Aurora [TBR]' },
    shortDek: { en: 'Replaced a cracked concrete apron with a paver inlay matching the front walk.', es: '[TBR]' },
    narrative: { en: 'Two weeks. The original concrete had heaved twice. We pulled it, set a fresh base, and laid an apron that matched the walk we did the year before.', es: '[TBR]' },
    leadAlt: { en: 'Paver driveway apron matching the front walk', es: '[TBR]' },
    gallery: Array.from({ length: 4 }, (_, i) => ({
      file: `${String(i + 1).padStart(2, '0')}.avif`,
      alt: { en: `Aurora Driveway — view ${i + 1}`, es: `[TBR] vista ${i + 1}` },
    })),
  },

  // ----- Wheaton × 2 (Residential, Commercial) -----
  {
    slug: 'wheaton-lawn-reset',
    audience: 'residential',
    serviceSlugs: ['lawn-care', 'sprinkler-systems'],
    citySlug: 'wheaton',
    year: 2024,
    durationWeeks: 5,
    materials: { en: 'Tall fescue blend, Hunter MP rotators', es: '[TBR]' },
    hasBeforeAfter: false,
    photoCount: 5,
    title: { en: 'Wheaton Lawn Reset', es: 'Reseteo de césped en Wheaton [TBR]' },
    shortDek: { en: 'Aerated, overseeded, and rebuilt the irrigation zones on a half-acre lot.', es: '[TBR]' },
    narrative: { en: 'A half-acre lot whose previous landscaper had set the heads to spray the road. We re-zoned, re-seeded, and now the lawn is the kind you walk barefoot.', es: '[TBR]' },
    leadAlt: { en: 'Lush green lawn after reset, sprinklers running', es: '[TBR]' },
    gallery: Array.from({ length: 5 }, (_, i) => ({
      file: `${String(i + 1).padStart(2, '0')}.avif`,
      alt: { en: `Wheaton Lawn — view ${i + 1}`, es: `[TBR] vista ${i + 1}` },
    })),
  },
  {
    slug: 'wheaton-bank-frontage',
    audience: 'commercial',
    serviceSlugs: ['lawn-care', 'snow-removal'],
    citySlug: 'wheaton',
    year: 2022,
    durationWeeks: 3,
    materials: { en: 'Boxwood hedging, seasonal annuals, salt-tolerant turf', es: '[TBR]' },
    hasBeforeAfter: false,
    photoCount: 4,
    title: { en: 'Wheaton Bank Frontage', es: 'Frente de banco en Wheaton [TBR]' },
    shortDek: { en: 'Year-round frontage program for a community bank — turf, beds, and snow.', es: '[TBR]' },
    narrative: { en: 'A community bank that wanted the front of the property to look like the inside. We set the year-round program — beds, hedging, salt-safe turf, and a snow contract that prioritizes the ATM.', es: '[TBR]' },
    leadAlt: { en: 'Bank entrance with hedging and seasonal flowers', es: '[TBR]' },
    gallery: Array.from({ length: 4 }, (_, i) => ({
      file: `${String(i + 1).padStart(2, '0')}.avif`,
      alt: { en: `Wheaton Bank — view ${i + 1}`, es: `[TBR] vista ${i + 1}` },
    })),
  },

  // ----- Lisle × 2 (Hardscape, Residential) -----
  {
    slug: 'lisle-retaining-wall',
    audience: 'hardscape',
    serviceSlugs: ['retaining-walls'],
    citySlug: 'lisle',
    year: 2023,
    durationWeeks: 4,
    materials: { en: 'Versa-Lok Standard, geo-grid reinforcement', es: '[TBR]' },
    hasBeforeAfter: false,
    photoCount: 5,
    title: { en: 'Lisle Retaining Wall', es: 'Muro de contención en Lisle [TBR]' },
    shortDek: { en: 'A 70-ft Versa-Lok wall with three steps that solved a chronic side-yard erosion problem.', es: '[TBR]' },
    narrative: { en: 'Engineered for the load. Geo-grid every two courses. The clients had been losing six inches of yard a year for a decade.', es: '[TBR]' },
    leadAlt: { en: 'Curved Versa-Lok retaining wall with stepped section', es: '[TBR]' },
    gallery: Array.from({ length: 5 }, (_, i) => ({
      file: `${String(i + 1).padStart(2, '0')}.avif`,
      alt: { en: `Lisle Wall — view ${i + 1}`, es: `[TBR] vista ${i + 1}` },
    })),
  },
  {
    slug: 'lisle-backyard-refresh',
    audience: 'residential',
    serviceSlugs: ['landscape-design', 'lawn-care'],
    citySlug: 'lisle',
    year: 2021,
    durationWeeks: 3,
    materials: { en: 'Native perennial palette, hardwood mulch beds', es: '[TBR]' },
    hasBeforeAfter: false,
    photoCount: 4,
    title: { en: 'Lisle Backyard Refresh', es: 'Renovación de patio en Lisle [TBR]' },
    shortDek: { en: 'Native plant beds, refreshed turf, and a compost loop the homeowner can run themselves.', es: '[TBR]' },
    narrative: { en: 'Three weeks. The homeowner wanted to do their own maintenance. We set them up with a palette they could keep alive.', es: '[TBR]' },
    leadAlt: { en: 'Native perennial bed in early summer', es: '[TBR]' },
    gallery: Array.from({ length: 4 }, (_, i) => ({
      file: `${String(i + 1).padStart(2, '0')}.avif`,
      alt: { en: `Lisle Refresh — view ${i + 1}`, es: `[TBR] vista ${i + 1}` },
    })),
  },

  // ----- Batavia × 2 (Residential, Residential) -----
  {
    slug: 'batavia-garden-reset',
    audience: 'residential',
    serviceSlugs: ['landscape-design'],
    citySlug: 'batavia',
    year: 2023,
    durationWeeks: 2,
    materials: { en: 'Mixed perennials, river-rock dry creek', es: '[TBR]' },
    hasBeforeAfter: false,
    photoCount: 4,
    title: { en: 'Batavia Garden Reset', es: 'Reseteo de jardín en Batavia [TBR]' },
    shortDek: { en: 'A side-yard rain garden plus a perennial border, to handle drainage and look the part.', es: '[TBR]' },
    narrative: { en: 'Drainage was the brief. The garden was the bonus. The dry creek does the work in storms; the perennial border carries the rest of the year.', es: '[TBR]' },
    leadAlt: { en: 'Dry-creek rain garden with mixed perennials', es: '[TBR]' },
    gallery: Array.from({ length: 4 }, (_, i) => ({
      file: `${String(i + 1).padStart(2, '0')}.avif`,
      alt: { en: `Batavia Garden — view ${i + 1}`, es: `[TBR] vista ${i + 1}` },
    })),
  },
  {
    slug: 'batavia-front-walk',
    audience: 'residential',
    serviceSlugs: ['patios-walkways'],
    citySlug: 'batavia',
    year: 2022,
    durationWeeks: 2,
    materials: { en: 'Unilock Beacon Hill Flagstone, charcoal soldier course', es: '[TBR]' },
    hasBeforeAfter: false,
    photoCount: 4,
    title: { en: 'Batavia Front Walk', es: 'Entrada delantera en Batavia [TBR]' },
    shortDek: { en: 'Replaced a cracked stamped-concrete walk with a paver inlay — five-foot width to suit the front porch.', es: '[TBR]' },
    narrative: { en: 'Two weeks. The original walk was failing in three places. We pulled it, set a base, and laid the new walk five feet wide so the porch step felt right.', es: '[TBR]' },
    leadAlt: { en: 'Paver front walk leading to a covered porch', es: '[TBR]' },
    gallery: Array.from({ length: 4 }, (_, i) => ({
      file: `${String(i + 1).padStart(2, '0')}.avif`,
      alt: { en: `Batavia Walk — view ${i + 1}`, es: `[TBR] vista ${i + 1}` },
    })),
  },

  // ----- Bolingbrook × 2 (Commercial, Hardscape) -----
  {
    slug: 'bolingbrook-office-court',
    audience: 'commercial',
    serviceSlugs: ['lawn-care', 'snow-removal', 'landscape-design'],
    citySlug: 'bolingbrook',
    year: 2023,
    durationWeeks: 3,
    materials: { en: 'Boxwood, salt-tolerant turf, decomposed-granite paths', es: '[TBR]' },
    hasBeforeAfter: false,
    photoCount: 5,
    title: { en: 'Bolingbrook Office Court', es: 'Patio de oficinas en Bolingbrook [TBR]' },
    shortDek: { en: 'Reset the courtyard for a 40-employee office: lawn, paths, planters, year-round maintenance.', es: '[TBR]' },
    narrative: { en: 'A small office where the courtyard had been an afterthought. We rebuilt the lawn, set decomposed-granite paths, planted four big planters, and run it year-round now.', es: '[TBR]' },
    leadAlt: { en: 'Office courtyard with central lawn and planters', es: '[TBR]' },
    gallery: Array.from({ length: 5 }, (_, i) => ({
      file: `${String(i + 1).padStart(2, '0')}.avif`,
      alt: { en: `Bolingbrook Office — view ${i + 1}`, es: `[TBR] vista ${i + 1}` },
    })),
  },
  {
    slug: 'bolingbrook-paver-plaza',
    audience: 'hardscape',
    serviceSlugs: ['patios-walkways', 'retaining-walls'],
    citySlug: 'bolingbrook',
    year: 2021,
    durationWeeks: 5,
    materials: { en: 'Belgard Mega-Lafitt, charcoal banding, low seat-wall', es: '[TBR]' },
    hasBeforeAfter: false,
    photoCount: 6,
    title: { en: 'Bolingbrook Paver Plaza', es: 'Plaza de adoquines en Bolingbrook [TBR]' },
    shortDek: { en: 'A 600-sqft paver plaza with a low seat-wall border, framing the back of a townhome.', es: '[TBR]' },
    narrative: { en: 'Five weeks. The seat-wall doubles as the deck rail when the family hosts. The plaza picks up the brick of the house.', es: '[TBR]' },
    leadAlt: { en: 'Paver plaza with low seat-wall at twilight', es: '[TBR]' },
    gallery: Array.from({ length: 6 }, (_, i) => ({
      file: `${String(i + 1).padStart(2, '0')}.avif`,
      alt: { en: `Bolingbrook Plaza — view ${i + 1}`, es: `[TBR] vista ${i + 1}` },
    })),
  },
];
```

**Distribution audit (per §6 of the prompt):**

| Constraint | Result |
|---|---|
| All 3 audiences ≥3 each | Hardscape: 5 · Residential: 4 · Commercial: 3 ✓ |
| All 6 city slugs ≥1 each | aurora 2 · naperville 2 · batavia 2 · wheaton 2 · lisle 2 · bolingbrook 2 ✓ (2 each, sums to 12) |
| ≥2 with `hasBeforeAfter: true` | naperville-hilltop-terrace + aurora-hoa-curb-refresh ✓ |
| `serviceSlugs` resolve to `services.ts` | **Surfaced as Open mismatch §14** — Code must verify each slug at build time. |

---

## 12. Decisions surfaced (D1–D17)

All decisions are auto-resolved per the prompt's recommendation defaults. **None are blockers; none require Chat input** before Phase 1.16 begins. Chat may override any of these by ratifying a different option in `Part-1-Phase-16-Code.md`.

| # | Decision | Resolved | Rationale |
|---|---|---|---|
| **D1** | Filter chip behavior | **RESOLVED (auto): single-select** | Cleaner URL state, simpler mental model, faster decision for premium-homeowner persona who is filtering by audience, not building a query. |
| **D2** | Filter chip taxonomy | **RESOLVED (auto): D2.A — Audience only** (4 chips: All / Residential / Commercial / Hardscape) | Service-tag filter ships in Part 2 once the Sanity catalog grows past 12. With 12 entries, Service-tag underserves and clutters. |
| **D3** | Pagination vs infinite scroll | **RESOLVED (auto): classic pagination, 12 per page** | Server-rendered, SEO-friendly, premium register. Already auto-resolved upstream. |
| **D4** | Index hero layout | **RESOLVED (auto): D4.B — Compact text-only** | The grid below is 100% photo. A photo hero competes. Cream surface lifts an otherwise text-only hero. |
| **D5** | Project tile content density | **RESOLVED (auto): D5.B — Title + tag + "City · Year"** | Matches 1.13 §4.4 location-page strip the user has already seen; keeps the grid scannable. |
| **D6** | Detail hero layout | **RESOLVED (auto): D6.B — Compact split** (copy 60% / lead photo 40%) | Consistency with 1.13 §4.1 location-hero; predictable LCP; easier ES translation budget. |
| **D7** | Photo gallery layout | **RESOLVED (auto): D7.B — Uniform 4:3 grid** (3 cols desktop / 2 mobile) | Predictable, matches the locked card-photo aspect, easier on Lighthouse. Masonry breaks LCP discipline; hero+strip is a client-component rabbit hole. |
| **D8** | Lightbox behavior | **RESOLVED (auto): native `<dialog>` with `showModal()`** | Built-in focus-trap, built-in Esc-to-close, zero JS bundle cost, matches 1.03 §6.8 dialog spec. Keyboard contract: Esc closes, ←/→ navigate, Tab cycles within. Counter "n / total" bottom-center. |
| **D9** | Before/after toggle | **RESOLVED (auto): D9.C — Tab toggle** | Smallest JS, accessibility-clean, keyboard-navigable, works without JS (defaults to After). Slider is accessibility-fragile. |
| **D10** | Facts table shape | **RESOLVED (auto): Year, City, Audience, Services, Materials, Duration** (6 rows, `<dl>` semantics) | Adds Awards / Featured-in only in Part 2 if Erick supplies them. |
| **D11** | Related projects strip | **RESOLVED (auto): 3 tiles. Selection: same-audience → same-city → most-recent. Fallback to most-recent excluding self.** | Same as 1.13 §4.4 strip count. Selection logic is deterministic; Code asserts a stable order with `year desc, slug asc` within each tier. |
| **D12** | Surface alternation | **RESOLVED (auto)**: Index `cream → bg → bg → bg → cream`; Detail `bg → cream → bg → cream → bg → cream → bg`. See §2.1 / §2.2. Hero counts as own surface. | No two adjacent same-surface bands. Filter+Grid+Pagination is one band by design (the filter chrome is grid chrome). |
| **D13** | URL state for filters | **RESOLVED (auto): query string** (`?audience=hardscape&page=2`) | Path segments break i18n routing cleanly. Query strings are i18n-neutral, work with `searchParams` server-side. Filtered views are not separately rankable. |
| **D14** | Empty state | **RESOLVED (auto)**: cream panel inside the grid band, H3 + body + reset text-link, no amber CTA in the empty state | The page CTA at the bottom still appears. |
| **D15** | Number of seed projects in Part 1 | **RESOLVED (auto): 12** (already auto-resolved upstream by the prompt) | Plan ships 30+ in Phase 2.04 with real photos. |
| **D16** | Pagination control style | **RESOLVED (auto): numbered pages with prev/next arrows** | Standard pattern, accessible by default, locks page state in URL. |
| **D17** | Featured-card uses on these pages | **RESOLVED (auto): NEITHER page uses `.card--featured`** | Each page has an amber CTA; 1.03 §6.2 D2 forbids `.card--featured` + amber-CTA in the same section. 1.06 §2.4 generalizes "no `.card--featured` on a page with an in-content amber CTA." |

**Blockers for Chat:** **None.**

---

## 13. Verification checklist (for Code)

Phase 1.16 Code runs every box below before declaring `Part-1-Phase-16-Completion.md`.

- [ ] **Routes 200:** `/projects/`, `/projects/?audience=hardscape`, `/projects/?audience=hardscape&page=2`, `/projects/?audience=zzznotreal` (sanitize → "All"), `/projects/<each-of-12-slugs>/`, and the Spanish equivalents at `/es/projects/` and `/es/projects/<slug>/`.
- [ ] **Schema validates** — paste each JSON-LD into https://validator.schema.org/:
  - [ ] `BreadcrumbList` (index + each detail)
  - [ ] `ItemList` of `CreativeWork` (index)
  - [ ] `CreativeWork` (each detail; verify `creator.@id` resolves to the sitewide `LocalBusiness` from 1.05 §8)
- [ ] **hreflang triplet** correct on every route (`en` / `es` / `x-default`).
- [ ] **Self-canonical** correct on every route. Filtered/paginated views canonical to the un-filtered un-paginated route.
- [ ] **Lighthouse ≥ 95 desktop AND mobile** on:
  - [ ] `/projects/`
  - [ ] One detail route, e.g. `/projects/naperville-hilltop-terrace/`
  - [ ] One Spanish equivalent (recommend `/es/projects/naperville-hilltop-terrace/`)
- [ ] **Same-source rule:** the visible breadcrumb and the `BreadcrumbList` schema consume the **same items array**. Verified by code (one source, two consumers).
- [ ] **Same-source rule (images):** the gallery's rendered `<img>` array and the `CreativeWork.image` schema array reference the same source.
- [ ] **`generateStaticParams`** returns the 12 slugs from `projects.ts`. Unknown slugs `notFound()`.
- [ ] **All `serviceSlugs` resolve** to entries in `services.ts` at build time (Code adds an assert).
- [ ] **All `citySlug` values resolve** to entries in `locations.ts` at build time.
- [ ] **`<AnimateIn>` budget** holds — index ≤3 wrappers (or 2 in empty state), detail ≤6 wrappers.
- [ ] **Hero entrance animation** = none on both pages.
- [ ] **No per-tile, per-photo, per-form-field motion wrappers** anywhere.
- [ ] **Filter chips** are `<button type="button" aria-pressed>`; URL changes via `useRouter().replace()`.
- [ ] **Lightbox** = native `<dialog>`. Focus-trap, focus-restore, Esc, ←/→, counter live region — all exercised manually + by an axe-core run.
- [ ] **Before/after toggle** SSRs the After image. JS-disabled fallback verified by disabling JS in DevTools.
- [ ] **AVIF + WebP fallback** present on every `<img>`. Explicit `width` and `height` on every `<img>` (zero CLS).
- [ ] **First 6 grid tiles eager**, tiles 7–12 `loading="lazy"`. First 4 gallery photos eager, photos 5–8 `loading="lazy"`.
- [ ] **Reduced-motion** verified by toggling `prefers-reduced-motion: reduce` in DevTools — every entrance becomes opacity-only at `--motion-fast`; before/after swap is instant.
- [ ] **WCAG 2.2 AA** — color contrast on filter chip, pagination, empty state, lightbox counter, tag-pill (on-dark + on-light variants). Run axe-core on each route, zero violations.
- [ ] **i18n strings** — every key in §7 present in both `en.json` and `es.json`. ES `[TBR]`-flagged for Phase 2.13.
- [ ] **`projects.ts` populated** with the 12 typed bilingual rows from §11.3, byte-for-byte.

---

## 14. Open mismatches

Surfaced for Chat ratification. None block Phase 1.16; Code surfaces back to Chat if any check fails.

### 14.1 `ProjectCard` UI primitive may not exist as a separate file

**Status:** Likely needs extraction.

The 1.06 §8.3 spec describes the project tile in detail. 1.06's component plan created `ProjectsTeaser` (the homepage section) — not a standalone `ProjectCard`. 1.11 §3.6 lifted `ProjectsTeaser` to be shared between Homepage / About / Locations but did not extract `ProjectCard`. **Phase 1.16 Code must:**

1. Inspect `src/components/ui/` for `ProjectCard.tsx`.
2. If absent: extract the tile JSX from `ProjectsTeaser` into `src/components/ui/ProjectCard.tsx`, change `ProjectsTeaser` to consume it, run a regression on Homepage / About / each Location page.
3. If present: reuse verbatim.

**Why this matters:** the projects index uses 12 instances and the related-projects strip uses 3. Building a second tile component to satisfy the projects portfolio violates 1.06 §8.3 ("no new variants").

### 14.2 `services.ts` slug coverage

`projects.ts` references the following service slugs, which MUST exist in `services.ts`:

- `patios-walkways`
- `retaining-walls`
- `fire-pits`
- `lawn-care`
- `landscape-design`
- `sprinkler-systems`
- `snow-removal`

**Phase 1.16 Code adds a build-time assertion** that every `Project.serviceSlugs[]` entry resolves. If any slug is missing from `services.ts` (because the seed table from 1.09 named them differently — e.g., `patios` vs `patios-walkways`), Code surfaces the mismatch back to Chat and either renames the seed entries here or surfaces a new entry needed in `services.ts`. **Recommendation: the seed in §11.3 follows the naming convention from `services.ts` (kebab-case, plural where natural).** Verify on first build.

### 14.3 `locations.ts` city slug coverage

`projects.ts` references: `aurora · naperville · batavia · wheaton · lisle · bolingbrook`. Per the 1.14 completion (read in §1 of the prompt brief), all six exist. **No mismatch expected**, but Code adds the same build-time assert.

### 14.4 `<CTA>` `tokens` prop ratification

§4.8 references `tokens={{ city }}` per "the `tokens` prop ratified in 1.14." Phase 1.16 Code confirms the prop is present on the shared `<CTA>` component and the `project.cta.h2` string interpolates `{city}`. If the prop name differs (e.g., `interpolations`), Code surfaces and either renames or adapts the i18n key — **must not** silently fall back to a non-interpolated H2.

### 14.5 Existing links to `/projects/[slug]/` in earlier phases

Phase 1.13 §4.4 location-page strip and Phase 1.06 §8 homepage teaser both link to project slugs. Phase 1.16 Code spot-checks at least one link from each to ensure URL shape (`/{locale}/projects/{slug}/`) matches `projects.ts` slugs. If any 404s after the seed lands, Code surfaces the link source and either renames the slug here or fixes the source.

---

**End of Phase 1.15 Design Handover.**
