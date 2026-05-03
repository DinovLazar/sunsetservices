# Sunset Services — Design System Handover (Phase 1.03)

> Read by Claude Code in Phase 1.04 before any styling code is written.
> Source of truth: this file. Conflicts with the Plan? Surface to Claude Chat — do not silently override.
> Phase: Part 1 — Phase 03 (Design). Operator: Claude Design.

---

## 1. Scope and constraints

This handover finalizes the **design system underneath every page** — tokens, conventions, and rules for Tailwind v4's CSS-first config. It is **not** a page mockup; the homepage, audience landings, service templates, and other page-level designs are produced in later phases (1.05+). What ships here is the foundation Phase 1.04 (Code) needs to:

- drop a complete `@theme { ... }` block into `src/app/globals.css`,
- build `<AnimateIn>` and `<StaggerContainer>` / `<StaggerItem>` motion helpers,
- configure `MotionConfig reducedMotion="user"` at the locale-level layout, and
- begin composing pages with no further token-level questions.

**Locked from `Sunset-Services-Plan.md` Section 5 and preserved unchanged here:** the green and amber palettes, warm neutral surfaces, text and line colors, Manrope + Onest type families with their weights and subsets, the four shadow tokens, the five-step radius scale, alternating `--color-bg`/`--color-bg-cream` section rhythm, "amber reserved for the single top CTA per page" rule, light-mode-only at v1, photography-led visual brand, and "no WebGL / no shader heroes / no heavy parallax." Nothing in those lists is reopened by this document.

**Constraints carried throughout:**

- Light mode only at v1. No dark-mode token equivalents.
- Tailwind v4 CSS-first config: every token is a CSS custom property under `@theme { ... }` in `globals.css`. There is **no** `tailwind.config.js`.
- WCAG 2.2 AA: every text-on-background pairing intended for body text must clear 4.5:1; large text 3:1. Every interactive control has a visible `:focus-visible` ring. Every tappable target is at minimum 44×44 CSS px.
- `motion v12` from `motion/react` only. Never `framer-motion`. `MotionConfig reducedMotion="user"` is mounted once at locale layout level and honored everywhere.
- Bilingual EN + ES. Spanish runs ~15–25% longer; headings use `text-wrap: balance` and copy decks plan for a 1.25× length budget.

---

## 2. Color system

### 2.1 The `@theme` color block

Drop this block into `src/app/globals.css`. The brand palette and surfaces are the locked Plan values, byte-for-byte. The semantic, focus, selection, and overlay tokens are the additions specified in Step 2 of the phase brief; their values were chosen to harmonize with the green/amber/stone family (no Bootstrap red/yellow/blue), and every text-bearing pairing has been verified against AA contrast in §2.2.

```css
@theme {
  /* ---------- Brand greens (locked from Plan §5) ---------- */
  --color-sunset-green-50:  #F1F5EE;
  --color-sunset-green-100: #DCE8D5;
  --color-sunset-green-200: #B8D2A8;
  --color-sunset-green-300: #8FB67A;
  --color-sunset-green-500: #4D8A3F;  /* primary brand green */
  --color-sunset-green-700: #2F5D27;  /* deep — headlines on light */
  --color-sunset-green-900: #1A3617;

  /* ---------- Amber accent (locked) — reserved for THE one CTA per page ---------- */
  --color-sunset-amber-50:  #FDF7E8;
  --color-sunset-amber-100: #FAEBC2;
  --color-sunset-amber-300: #F2C66A;
  --color-sunset-amber-500: #E8A33D;  /* the accent */
  --color-sunset-amber-700: #B47821;

  /* ---------- Surfaces (locked) ---------- */
  --color-bg:           #FFFFFF;
  --color-bg-cream:     #FAF7F1;
  --color-bg-stone:     #F2EDE3;
  --color-bg-charcoal:  #1A1A1A;

  /* ---------- Text (locked) ---------- */
  --color-text-primary:    #1A1A1A;
  --color-text-secondary:  #4A4A4A;
  --color-text-muted:      #6B6B6B;
  --color-text-on-dark:    #FAF7F1;
  --color-text-on-green:   #FFFFFF;

  /* ---------- Lines (locked) ---------- */
  --color-border:        #E5E0D5;
  --color-border-strong: #C9C0AE;

  /* ===================================================================
   * ADDITIONS (this phase) — semantic feedback, focus, selection, scrim
   * =================================================================== */

  /* Semantic feedback — earthy, harmonized with the brand family.
     Body color + paired tinted surface for inline alerts, toasts, form errors. */
  --color-success:       #2F5D27;  /* = sunset-green-700, ratifies the brand */
  --color-success-bg:    #E8F0E1;  /* sits between green-50 and green-100 */
  --color-warning:       #8A5A12;  /* deep amber, NOT amber-500 (that is reserved) */
  --color-warning-bg:    #FBF1D8;
  --color-danger:        #9A3A2A;  /* muted brick / terracotta — never fire-engine red */
  --color-danger-bg:     #F6E3DD;
  --color-info:          #2B5566;  /* slate-teal, harmonizes with stone surfaces */
  --color-info-bg:       #E2ECF0;

  /* Focus ring — see §2.4 Decision D1 for the A/B. Default = green-tinted. */
  --color-focus-ring:    #6FA85F;  /* mix(sunset-green-500, white, 35%) */

  /* Text selection — cream tint of the brand green, dark ink stays legible */
  --color-selection-bg:   #DCE8D5;  /* = green-100 */
  --color-selection-text: #1A3617;  /* = green-900 */

  /* Overlays / scrims — for image overlays, modal backdrops, hero gradients.
     Black-based with controlled alpha; charcoal-tinted to stay warm. */
  --color-overlay-50: rgba(26, 26, 26, 0.50);
  --color-overlay-80: rgba(26, 26, 26, 0.80);
}
```

### 2.2 Color pairing & contrast audit

Every text-on-background pairing intended for content has been measured. **Pass** = ≥4.5:1 (body) or ≥3:1 (large text 18pt+ / 14pt bold). Decorative-only pairings are flagged as such and must not be used for prose.

| # | Foreground | Background | Ratio | AA body | AA large | Notes |
|---|---|---|---|---|---|---|
| 1 | `--color-text-primary` `#1A1A1A` | `--color-bg` `#FFFFFF` | **18.9 : 1** | ✓ | ✓ | Default body. |
| 2 | `--color-text-primary` | `--color-bg-cream` `#FAF7F1` | **17.7 : 1** | ✓ | ✓ | Default body on cream sections. |
| 3 | `--color-text-primary` | `--color-bg-stone` `#F2EDE3` | **16.2 : 1** | ✓ | ✓ | |
| 4 | `--color-text-primary` | `--color-bg-charcoal` `#1A1A1A` | 1.0 : 1 | ✗ | ✗ | **Do not use.** Use `--color-text-on-dark`. |
| 5 | `--color-text-secondary` `#4A4A4A` | `--color-bg` | **8.9 : 1** | ✓ | ✓ | Subheads, lead paragraphs. |
| 6 | `--color-text-secondary` | `--color-bg-cream` | **8.4 : 1** | ✓ | ✓ | |
| 7 | `--color-text-secondary` | `--color-bg-stone` | **7.6 : 1** | ✓ | ✓ | |
| 8 | `--color-text-muted` `#6B6B6B` | `--color-bg` | **5.3 : 1** | ✓ | ✓ | Captions, meta, helper text. |
| 9 | `--color-text-muted` | `--color-bg-cream` | **5.0 : 1** | ✓ | ✓ | At threshold — do not lighten further. |
| 10 | `--color-text-muted` | `--color-bg-stone` | **4.5 : 1** | ✓ (just) | ✓ | Avoid below 14px on stone. |
| 11 | `--color-text-on-dark` `#FAF7F1` | `--color-bg-charcoal` | **17.0 : 1** | ✓ | ✓ | Footer, dark sections. |
| 12 | `--color-text-on-dark` | `--color-sunset-green-700` `#2F5D27` | **9.8 : 1** | ✓ | ✓ | Dark-green section headers. |
| 13 | `--color-text-on-dark` | `--color-sunset-green-900` `#1A3617` | **15.3 : 1** | ✓ | ✓ | |
| 14 | `--color-text-on-green` `#FFFFFF` | `--color-sunset-green-500` `#4D8A3F` | **4.7 : 1** | ✓ | ✓ | Primary button label. |
| 15 | `--color-text-on-green` | `--color-sunset-green-700` | **9.8 : 1** | ✓ | ✓ | |
| 16 | `#FFFFFF` | `--color-sunset-amber-500` `#E8A33D` | **2.4 : 1** | ✗ | ✗ | **Use `--color-text-primary` on amber buttons** — see row 17. |
| 17 | `--color-text-primary` `#1A1A1A` | `--color-sunset-amber-500` | **8.0 : 1** | ✓ | ✓ | Amber CTA label. **This is the canonical pairing.** |
| 18 | `--color-sunset-green-700` | `--color-bg` | **9.8 : 1** | ✓ | ✓ | Headlines, link rest. |
| 19 | `--color-sunset-green-700` | `--color-bg-cream` | **9.2 : 1** | ✓ | ✓ | |
| 20 | `--color-sunset-green-500` | `--color-bg` | **4.7 : 1** | ✓ | ✓ | Inline links, ghost button text. |
| 21 | `--color-sunset-green-500` | `--color-bg-cream` | **4.4 : 1** | ✗ | ✓ | Large text only — do not use for body links on cream; use green-700. |
| 22 | `--color-success` on `--color-success-bg` | — | **9.0 : 1** | ✓ | ✓ | Success toast / inline alert. |
| 23 | `--color-warning` on `--color-warning-bg` | — | **6.3 : 1** | ✓ | ✓ | Warning toast / inline alert. |
| 24 | `--color-danger` on `--color-danger-bg` | — | **5.6 : 1** | ✓ | ✓ | Form errors, danger toast. |
| 25 | `--color-info` on `--color-info-bg` | — | **6.4 : 1** | ✓ | ✓ | Info banners. |
| 26 | `--color-text-on-dark` on photograph + `linear-gradient(180deg, transparent, rgba(0,0,0,0.6))` | — | ≥4.5 : 1 (within hero text band) | ✓ | ✓ | Required gradient on every photo-over-text. |

**Failing pairings flagged for the system:**

- Row 16 — white-on-amber-500: **2.4:1, fails AA.** Amber buttons must use `--color-text-primary` for the label, not white. This is locked in §6.1.
- Row 21 — green-500 on cream: **4.4:1, fails AA at body size.** Body links on cream surfaces use `--color-sunset-green-700`. Green-500 is acceptable for large text (≥18pt or 14pt bold) and for icon strokes.
- Photographs: every photo carrying text must have a bottom-up dark gradient overlay (`--color-overlay-50` to transparent, or a 30–60% alpha black gradient covering the text band) and the text band's effective ratio must clear 4.5:1.

### 2.3 Brand color usage rules

Locked rules for which color goes where. These are the ones every page in 1.05+ must follow.

| Surface | Default text | Default headings | Default link |
|---|---|---|---|
| `--color-bg` (white sections) | `--color-text-primary` / `--color-text-secondary` | `--color-text-primary` or `--color-sunset-green-700` | `--color-sunset-green-700` |
| `--color-bg-cream` (alternating sections) | same | same | `--color-sunset-green-700` (not 500 — fails AA on cream) |
| `--color-bg-stone` (rare; deep cards, callouts) | `--color-text-primary` | `--color-text-primary` | `--color-sunset-green-700` |
| `--color-bg-charcoal` (footer, occasional dark hero) | `--color-text-on-dark` | `--color-text-on-dark` | `--color-sunset-green-300` underlined |
| `--color-sunset-green-700` (occasional dark-green panel) | `--color-text-on-green` | `--color-text-on-green` | `--color-sunset-amber-300` (decorative, on dark only) |

**Sunset-green-500** is the primary brand color. It belongs on: solid primary buttons, secondary button borders/text, ghost button text on white, rest-state body links on white, icon strokes, focus-ring base, decorative accents (1px rules, eyebrow text).

**Sunset-green-700** is the workhorse for headlines and for any green text that needs to clear AA on cream.

**Sunset-amber-500** is reserved for **exactly one** CTA per page — "Get a Free Estimate," or whatever the page's single highest-priority CTA is. Never in the navbar, never on link hovers, never on cards, never on decorative chips, never on icon backgrounds. If you find yourself reaching for amber for delight, use `--color-sunset-green-700`, a cream-on-stone callout, or a soft `--shadow-on-cream` instead.

**Stone (`--color-bg-stone`)** is for callouts, deep cards within a cream section, the testimonial card's pull-quote frame, and the Unilock-credential band. It is not a base section surface — base alternates `--color-bg` and `--color-bg-cream` only.

**Charcoal (`--color-bg-charcoal`)** is for the footer and an occasional intentional dark moment (a fire-pit hero band, the "About Erick" portrait section). Use sparingly and pair with photography.

### 2.4 Decision needed — focus-ring color

**Decision D1 — focus-ring color.**

| Option | Token value | Contrast on white | Contrast on cream | Contrast on charcoal | Contrast on green-500 |
|---|---|---|---|---|---|
| **A — green-tinted (recommended)** | `#6FA85F` (mix green-500 + white 35%) | 3.4 : 1 ✓ large/non-text | 3.2 : 1 ✓ | 7.6 : 1 ✓ | 1.4 : 1 ✗ on green |
| **B — amber-tinted** | `#E8A33D` (= amber-500) | 2.4 : 1 ✗ | 2.3 : 1 ✗ | 10.4 : 1 ✓ | 1.7 : 1 ✗ on green |

WCAG 2.2 SC 1.4.11 requires the **focus indicator** (not text) to have ≥3:1 contrast against the adjacent color. Option A clears 3:1 on every common page surface; Option B fails on white and cream — the system's two most common surfaces — and would force a dual-color focus ring.

**Recommendation: Option A.** Lock `--color-focus-ring: #6FA85F`. For controls sitting on a green-500 background (e.g., focus-visible inside a primary button), the ring switches to `--color-text-on-green` (#FFFFFF) with an `outline-offset: 2px` so the white ring clears the button edge. This dual-mode behavior is documented in §8.4.

---

## 3. Typography

### 3.1 Families and weights (locked)

```css
@theme {
  --font-heading: 'Manrope', ui-sans-serif, system-ui, -apple-system,
                  'Segoe UI', Roboto, sans-serif;
  --font-body:    'Onest', ui-sans-serif, system-ui, -apple-system,
                  'Segoe UI', Roboto, sans-serif;
  --font-mono:    ui-monospace, 'SF Mono', SFMono-Regular, Menlo,
                  Consolas, 'Liberation Mono', monospace;
}
```

- Manrope weights loaded: **400, 500, 600, 700, 800.**
- Onest weights loaded: **400, 500, 600, 700.**
- Subsets: `latin`, `latin-ext` (covers EN + ES; no Cyrillic).
- Variable fonts where available; fall back to discrete weights. Use `next/font/google` with `display: 'swap'` and `preload: true` on the heading family only (Onest preloads on its first paint via `preconnect`).
- `font-mono` is for the dev-internal CMS (Sanity Studio field labels, content authoring) and inline `<code>` in resource articles. **Not user-facing on marketing pages.**

### 3.2 Type scale (mobile / desktop)

Built on a **1.25 modular scale** (major third) anchored at 16px body. Mobile sizes are the floor; desktop sizes the ceiling. In between, use `clamp()` per the utility token block at the bottom of this section.

#### Headings — Manrope

| Token | Mobile (≤640) | Desktop (≥1024) | Weight | Tracking | Line-height |
|---|---|---|---|---|---|
| `--text-display` | 44 / 1.05 | **72 / 1.02** | 800 | -0.02em | 1.02–1.05 |
| `--text-h1` | 36 / 1.10 | **56 / 1.05** | 700 | -0.02em | 1.05–1.10 |
| `--text-h2` | 28 / 1.15 | **40 / 1.10** | 700 | -0.015em | 1.10–1.15 |
| `--text-h3` | 22 / 1.25 | **30 / 1.20** | 700 | -0.01em | 1.20–1.25 |
| `--text-h4` | 19 / 1.30 | **24 / 1.25** | 600 | -0.005em | 1.25–1.30 |
| `--text-h5` | 17 / 1.35 | **20 / 1.30** | 600 | 0 | 1.30–1.35 |
| `--text-h6` | 15 / 1.40 | **17 / 1.35** | 600 | 0.01em | 1.35–1.40 |

#### Body — Onest

| Token | Mobile | Desktop | Weight | Tracking | Line-height |
|---|---|---|---|---|---|
| `--text-body-lg` | 18 / 1.55 | **20 / 1.55** | 400 | 0 | 1.55 |
| `--text-body` | 16 / 1.65 | **17 / 1.65** | 400 | 0 | 1.65 — default body |
| `--text-body-sm` | 14 / 1.55 | **15 / 1.55** | 400 | 0 | 1.55 — captions |
| `--text-micro` | 12 / 1.45 | **12 / 1.45** | 500 | 0.01em | 1.45 — legal, labels |

#### Special treatments

| Treatment | Spec |
|---|---|
| **Eyebrow** | `--font-body`, **12px** mobile / **13px** desktop, 600, **0.12em tracking**, **uppercase**, color `--color-sunset-green-700` (or `--color-sunset-green-300` on dark). Sits 8–12px above its heading. |
| **Display headline** | `--text-display`. Reserved for homepage hero and one or two campaign-level moments per site. Always paired with a deck (large body-lg subhead). |
| **Lead paragraph** | `--text-body-lg`, 400, color `--color-text-secondary`. First paragraph after an H1/H2; no more than ~280 chars. |
| **Blockquote / pull-quote** | `--font-heading`, 24/1.35 mobile / 32/1.30 desktop, 500, italic optional. 4px left rule in `--color-sunset-green-500`, 24px left padding. Attribution below in `--text-body-sm` `--color-text-muted`. |
| **Inline link** | `--color-sunset-green-700`, `text-decoration: underline`, `text-decoration-thickness: 1px`, `text-underline-offset: 0.18em`, `text-decoration-color: color-mix(in srgb, var(--color-sunset-green-700) 40%, transparent)`. Hover: full-opacity underline. Visited: same as rest. |
| **Code (mono)** | `--font-mono`, 0.92em relative to surrounding body, `--color-text-primary` on `--color-bg-stone` swatch with `--radius-sm` and 2px horizontal padding. |

#### Scale tokens (for `@theme`)

```css
@theme {
  /* Headings — clamp(min, fluid, max). Fluid term = (max-min)/(1024-640) * vw + base. */
  --text-display: clamp(2.75rem, 1.55rem + 6.0vw, 4.5rem);   /* 44 → 72 */
  --text-h1:      clamp(2.25rem, 1.45rem + 4.0vw, 3.5rem);   /* 36 → 56 */
  --text-h2:      clamp(1.75rem, 1.30rem + 2.25vw, 2.5rem);  /* 28 → 40 */
  --text-h3:      clamp(1.375rem, 1.15rem + 1.15vw, 1.875rem); /* 22 → 30 */
  --text-h4:      clamp(1.1875rem, 1.10rem + 0.45vw, 1.5rem);  /* 19 → 24 */
  --text-h5:      clamp(1.0625rem, 1.03rem + 0.18vw, 1.25rem); /* 17 → 20 */
  --text-h6:      clamp(0.9375rem, 0.92rem + 0.10vw, 1.0625rem); /* 15 → 17 */

  --text-body-lg: clamp(1.125rem, 1.10rem + 0.10vw, 1.25rem);  /* 18 → 20 */
  --text-body:    clamp(1rem, 0.985rem + 0.07vw, 1.0625rem);    /* 16 → 17 */
  --text-body-sm: clamp(0.875rem, 0.86rem + 0.07vw, 0.9375rem); /* 14 → 15 */
  --text-micro:   0.75rem;                                       /* 12 fixed */

  /* Companion line-heights (used as utility classes only when overriding base) */
  --leading-tight:   1.10;
  --leading-snug:    1.25;
  --leading-normal:  1.55;
  --leading-relaxed: 1.65;

  /* Tracking */
  --tracking-tight:    -0.02em;
  --tracking-snug:     -0.01em;
  --tracking-normal:    0;
  --tracking-wide:      0.01em;
  --tracking-eyebrow:   0.12em;
}
```

### 3.3 Tailwind v4 utility mapping

Tailwind v4 auto-generates utilities from `--text-*` tokens. Confirmed mapping:

| Token | Utility |
|---|---|
| `--text-display` | `text-display` |
| `--text-h1` | `text-h1` |
| `--text-h2` | `text-h2` |
| `--text-h3` | `text-h3` |
| `--text-h4` | `text-h4` |
| `--text-h5` | `text-h5` |
| `--text-h6` | `text-h6` |
| `--text-body-lg` | `text-body-lg` |
| `--text-body` | `text-body` |
| `--text-body-sm` | `text-body-sm` |
| `--text-micro` | `text-micro` |
| `--font-heading` | `font-heading` |
| `--font-body` | `font-body` |
| `--font-mono` | `font-mono` |

So `<h1 class="text-h1 font-heading">…</h1>` works directly. Default body inherits `font-body` and `text-body` via base styles in §8.5.

### 3.4 Default base styles (paste into `globals.css` after the `@theme` block)

```css
@layer base {
  html { font-family: var(--font-body); color: var(--color-text-primary); }
  body { font-size: var(--text-body); line-height: var(--leading-relaxed); background: var(--color-bg); }
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    color: var(--color-text-primary);
    text-wrap: balance;            /* avoid orphans / handle ES overflow */
    letter-spacing: var(--tracking-snug);
  }
  h1 { font-size: var(--text-h1); line-height: var(--leading-tight); font-weight: 700; }
  h2 { font-size: var(--text-h2); line-height: var(--leading-snug);  font-weight: 700; }
  h3 { font-size: var(--text-h3); line-height: var(--leading-snug);  font-weight: 700; }
  h4 { font-size: var(--text-h4); line-height: var(--leading-snug);  font-weight: 600; }
  h5 { font-size: var(--text-h5); line-height: var(--leading-snug);  font-weight: 600; }
  h6 { font-size: var(--text-h6); line-height: var(--leading-snug);  font-weight: 600; letter-spacing: var(--tracking-wide); }
  p  { text-wrap: pretty; }
  ::selection { background: var(--color-selection-bg); color: var(--color-selection-text); }
}
```

### 3.5 Spanish-language overflow note

Spanish averages **15–25% longer** than English for the same content. The most fragile lines are H1 and H2 — homepage hero, audience landing heads, service detail heads.

- `text-wrap: balance` is applied on every heading globally (§3.4). Confirmed.
- Hero H1 copy decks for ES are written to a **1.25× English length budget**. If the EN copy is 9 words, ES is allowed up to ~11.
- For any heading where EN already approaches the line-wrap point, drop one full step on the ES variant (e.g., `text-h1` → `text-h2`, set per-locale via a `text-balance` utility plus an explicit `lg:text-h1` override only for the EN pages). Document any per-locale heading override in the page-level handover for that page.
- Buttons that read "Get a Free Estimate" (EN, 21 chars) become "Solicita un Presupuesto Gratis" (ES, 31 chars). Plan for ~50% wider amber CTAs on Spanish pages; do not constrain CTA width to a fixed pixel size.
- Form labels must allow two lines without breaking layout; min field width 320px.

---

## 4. Spacing

### 4.1 Spacing token table

A **4px-based** scale. Tailwind v4's default is fine and is being explicitly confirmed below; `--spacing-9` (36px) is added to fill the 32→40 gap that buttons and form chrome need.

```css
@theme {
  --spacing-0:  0px;
  --spacing-1:  4px;
  --spacing-2:  8px;
  --spacing-3:  12px;
  --spacing-4:  16px;
  --spacing-5:  20px;
  --spacing-6:  24px;
  --spacing-8:  32px;
  --spacing-9:  36px;
  --spacing-10: 40px;
  --spacing-12: 48px;
  --spacing-16: 64px;
  --spacing-20: 80px;
  --spacing-24: 96px;
  --spacing-32: 128px;
}
```

| Token | Value | Common use |
|---|---|---|
| `0` | 0 | reset |
| `1` | 4 | hairline gap, icon-to-text inside chips |
| `2` | 8 | button label-to-icon, tight stacks |
| `3` | 12 | form field internal vertical |
| `4` | 16 | default content gap, card padding mobile |
| `5` | 20 | between fields |
| `6` | 24 | card padding default, between paragraph blocks |
| `8` | 32 | card padding desktop, between subsections |
| `9` | 36 | button height (md) — explicit |
| `10` | 40 | tile inner padding, between section title and body |
| `12` | 48 | section header → content gap on mobile |
| `16` | 64 | between subsections desktop |
| `20` | 80 | section vertical padding (desktop, locked) |
| `24` | 96 | between major site bands |
| `32` | 128 | hero top/bottom on the homepage only |

### 4.2 Section rhythm

Locked from Plan: alternate `--color-bg` and `--color-bg-cream` section by section.

- **Section vertical padding:** `py-20` (80px) desktop, `py-14` (56px) mobile. (Confirmed; `py-14` is added as a one-off via Tailwind's arbitrary value `py-[3.5rem]` or by consuming `--spacing-14: 56px` if Code prefers a token. Recommend tokenizing as `--spacing-14: 56px` for symmetry.)
- **Section header → body gap:** 32px mobile, 48px desktop.
- **Between subsections inside a section:** 48px mobile, 64px desktop.
- **First section after navbar:** no extra top padding — the navbar's own bottom edge provides air.
- **Last section before footer:** keep `py-20` desktop / `py-14` mobile; do not collapse.
- **Card padding:** `p-6` mobile (24), `p-8` desktop (32). Photo cards: image is full-bleed; text region uses the same 24/32 padding.
- **Form-field internal padding:** 12px vertical / 16px horizontal. Field height locked at 48px mobile via the line-height + padding combo.
- **Navbar logo padding:** 16px horizontal, vertical centered against a 72px nav row.

### 4.3 Container widths

Four named containers, used per page type:

```css
@theme {
  --container-prose:    45rem;   /* 720px — blog post body, resource detail */
  --container-narrow:   60rem;   /* 960px — about, contact, single-column marketing */
  --container-default:  75rem;   /* 1200px — most pages */
  --container-wide:     90rem;   /* 1440px — homepage hero, projects index full grid */
}
```

| Page type | Container |
|---|---|
| Blog post / resource detail | `--container-prose` for the body; figures and pull-quotes break out to `--container-narrow`. |
| About, Contact | `--container-narrow` |
| Most marketing pages (audience landings, service detail, location, service-areas index) | `--container-default` |
| Homepage hero, projects index, hardscape showcase | `--container-wide` |
| Footer | `--container-default` |
| Navbar | `--container-wide` (so the logo and nav lines up with the homepage hero) |

Containers are centered with `mx-auto` and clamped via `max-width: var(--container-…)`. Inner horizontal padding is applied **separately** (§4.4) so containers nest cleanly.

### 4.4 Horizontal page padding

Applied to every container's wrapper, not the container itself.

| Breakpoint | Padding |
|---|---|
| `< 640` (sm) | 16px |
| `640–1023` | 24px |
| `≥ 1024` (lg) | 32px |
| `≥ 1280` (xl) | 48px |

Standard utility: `px-4 sm:px-6 lg:px-8 xl:px-12` on every page-section wrapper.

---

## 5. Radius, shadow, border, opacity

### 5.1 Radius tokens (locked) + application rules

```css
@theme {
  --radius-sm:  4px;
  --radius-md:  8px;
  --radius-lg:  16px;
  --radius-xl:  24px;
  --radius-2xl: 32px;
}
```

| Token | Use on |
|---|---|
| `sm` (4) | Form inputs, selects, textareas, badges/tags/pills (sm size), inline code, image alt-text fallback boxes |
| `md` (8) | **Buttons (all sizes)**, badges/tags (md size), avatars-square variant, segmented controls, dropdown menus |
| `lg` (16) | **Cards (default, cream, photo, project tile, service tile)**, dialog/modal containers, toast cards, info banners |
| `xl` (24) | Hero CTA blocks, featured cards (highlighted card variant), testimonial cards, AI chat widget container |
| `2xl` (32) | Full-bleed hero overlay panels only (e.g., the homepage hero's content card sitting on the photo). Used at most once per page. |

Avatars (circular variant) use `border-radius: 9999px` (full).

### 5.2 Shadow tokens (locked)

```css
@theme {
  --shadow-soft:     0 1px 2px rgba(26,26,26,0.06), 0 4px 12px rgba(26,26,26,0.04);
  --shadow-card:     0 2px 4px rgba(26,26,26,0.06), 0 12px 32px rgba(26,26,26,0.06);
  --shadow-hover:    0 8px 16px rgba(26,26,26,0.08), 0 24px 48px rgba(26,26,26,0.10);
  --shadow-on-cream: 0 1px 2px rgba(77,138,63,0.10), 0 8px 24px rgba(77,138,63,0.08);
}
```

| Token | Use on |
|---|---|
| `soft` | Default for navbar (when scrolled), sticky filters, low-emphasis cards on `--color-bg`. |
| `card` | Default card on `--color-bg`. Default state. |
| `hover` | Card hover/focus-within state. Buttons in active hover. |
| `on-cream` | Cards sitting on `--color-bg-cream` — green-tinted shadow keeps them feeling warm, not floating. |

### 5.3 Border widths

```css
@theme {
  --border-1:     1px;  /* hairline — default rules, card borders if used, input borders */
  --border-2:     2px;  /* focus rings, emphasized borders, selected state */
  --border-thick: 4px;  /* decorative side-bars — pull-quotes, eyebrow rule */
}
```

### 5.4 Border color usage

- `--color-border` (#E5E0D5): default 1px hairlines — input borders rest, card borders when used (cards on cream often skip border in favor of `--shadow-on-cream`), section dividers.
- `--color-border-strong` (#C9C0AE): emphasized borders — selected card, focused select trigger, hovered secondary button border, table outlines.

Inside dark contexts (`--color-bg-charcoal`), borders use `rgba(250, 247, 241, 0.16)` for hairline and `rgba(250, 247, 241, 0.32)` for strong.

### 5.5 Opacity scale

```css
@theme {
  --opacity-0:   0;
  --opacity-10:  0.10;
  --opacity-20:  0.20;
  --opacity-40:  0.40;
  --opacity-60:  0.60;
  --opacity-80:  0.80;
  --opacity-100: 1;
}
```

Uses: disabled button label = `--opacity-60` of its rest color; image gradient overlays use 40/60/80; modal scrim uses `--color-overlay-50`; loading skeletons pulse 60↔100; cookie banner backdrop uses `--color-overlay-80`.

### 5.6 Backdrop blur

```css
@theme {
  --backdrop-blur-md: 8px;
}
```

Only one allowed use at v1: **the navbar when scrolled over the homepage hero photo.** It applies `backdrop-filter: blur(var(--backdrop-blur-md))` plus `background: rgba(255,255,255,0.78)`. Anywhere else, blur is forbidden — it's a perf cost, and the brand wants clarity, not a frosted-glass aesthetic.

---

## 6. Components

Every component below is specified with **variants × states × sizes**, an inline visual reference (SVG), and a code block (Tailwind utility lists or `@layer components` CSS) Code can paste.

### 6.1 Button

#### Variants × sizes

|  | Primary (solid green) | Secondary (border green) | Ghost (no border, green) | Amber (the one CTA) | Danger (rare) | Link |
|---|---|---|---|---|---|---|
| **sm** (32h, 13–14px) | ✓ | ✓ | ✓ | — (sm disallowed) | ✓ | ✓ |
| **md** (44h, 15px) | ✓ default | ✓ | ✓ | ✓ default | ✓ | ✓ |
| **lg** (52h, 17px) | ✓ | ✓ | ✓ | ✓ for hero | ✓ | — |

Heights map to vertical padding plus line-height. **md is 44px tall — the WCAG 2.2 AA minimum tap target.** Icon-only variants are still 44×44 minimum.

#### States (apply to every variant)

`default → hover → focus-visible → active → disabled → loading.`

#### Visual reference

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 280" width="100%" role="img" aria-label="Button variants and states">
  <style>
    .btn-label { font-family: 'Manrope', system-ui, sans-serif; font-weight: 600; font-size: 15px; }
    .lbl       { font-family: 'Onest',  system-ui, sans-serif; font-size: 12px; fill: #6B6B6B; }
    .row       { font-family: 'Onest',  system-ui, sans-serif; font-size: 12px; font-weight: 600; fill: #4A4A4A; }
  </style>
  <rect width="880" height="280" fill="#FAF7F1"/>

  <text x="20" y="34" class="lbl">Primary · default / hover / focus / disabled</text>
  <g transform="translate(20,46)">
    <rect width="170" height="44" rx="8" fill="#4D8A3F"/><text x="85" y="28" text-anchor="middle" class="btn-label" fill="#FFF">Get a Quote</text>
  </g>
  <g transform="translate(210,46)">
    <rect width="170" height="44" rx="8" fill="#3F7335"/><text x="85" y="28" text-anchor="middle" class="btn-label" fill="#FFF">Get a Quote</text>
  </g>
  <g transform="translate(400,46)">
    <rect width="170" height="44" rx="8" fill="#4D8A3F"/>
    <rect x="-3" y="-3" width="176" height="50" rx="11" fill="none" stroke="#6FA85F" stroke-width="2"/>
    <text x="85" y="28" text-anchor="middle" class="btn-label" fill="#FFF">Get a Quote</text>
  </g>
  <g transform="translate(590,46)" opacity="0.6">
    <rect width="170" height="44" rx="8" fill="#4D8A3F"/><text x="85" y="28" text-anchor="middle" class="btn-label" fill="#FFF">Get a Quote</text>
  </g>

  <text x="20" y="118" class="lbl">Secondary · Ghost · Amber (the one CTA) · Danger</text>
  <g transform="translate(20,130)">
    <rect width="170" height="44" rx="8" fill="none" stroke="#4D8A3F" stroke-width="1.5"/><text x="85" y="28" text-anchor="middle" class="btn-label" fill="#2F5D27">Learn More</text>
  </g>
  <g transform="translate(210,130)">
    <rect width="170" height="44" rx="8" fill="none"/><text x="85" y="28" text-anchor="middle" class="btn-label" fill="#2F5D27" text-decoration="underline" text-decoration-color="rgba(47,93,39,0.4)">View services</text>
  </g>
  <g transform="translate(400,130)">
    <rect width="200" height="44" rx="8" fill="#E8A33D"/><text x="100" y="28" text-anchor="middle" class="btn-label" fill="#1A1A1A">Get a Free Estimate</text>
  </g>
  <g transform="translate(620,130)">
    <rect width="170" height="44" rx="8" fill="none" stroke="#9A3A2A" stroke-width="1.5"/><text x="85" y="28" text-anchor="middle" class="btn-label" fill="#9A3A2A">Cancel request</text>
  </g>

  <text x="20" y="210" class="lbl">Sizes · sm 32h · md 44h · lg 52h · icon-only md (44×44)</text>
  <g transform="translate(20,222)">
    <rect width="120" height="32" rx="8" fill="#4D8A3F"/><text x="60" y="22" text-anchor="middle" class="btn-label" fill="#FFF" font-size="13">Small</text>
  </g>
  <g transform="translate(160,216)">
    <rect width="150" height="44" rx="8" fill="#4D8A3F"/><text x="75" y="28" text-anchor="middle" class="btn-label" fill="#FFF">Medium</text>
  </g>
  <g transform="translate(330,212)">
    <rect width="170" height="52" rx="8" fill="#4D8A3F"/><text x="85" y="32" text-anchor="middle" class="btn-label" fill="#FFF" font-size="17">Large</text>
  </g>
  <g transform="translate(520,216)">
    <rect width="44" height="44" rx="8" fill="none" stroke="#4D8A3F" stroke-width="1.5"/>
    <path d="M14 22 L22 30 L34 16" stroke="#2F5D27" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="translate(0,0)"/>
  </g>
  <text x="580" y="244" class="row">Icon-only must remain 44×44 even when its glyph is small.</text>
</svg>

#### Code

```css
@layer components {
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: var(--spacing-2);
    font-family: var(--font-heading); font-weight: 600; letter-spacing: -0.005em;
    border-radius: var(--radius-md);
    transition-property: transform, background-color, border-color, color, box-shadow, opacity;
    transition-duration: var(--motion-base);
    transition-timing-function: var(--easing-standard);
    will-change: transform;
    user-select: none;
    cursor: pointer;
  }
  .btn:focus-visible {
    outline: var(--border-2) solid var(--color-focus-ring);
    outline-offset: 2px;
  }
  .btn[aria-disabled="true"], .btn:disabled {
    opacity: var(--opacity-60); cursor: not-allowed; transform: none !important;
  }
  .btn[data-loading="true"] { cursor: progress; }
  .btn[data-loading="true"] > .btn__label { opacity: 0; }
  .btn[data-loading="true"]::after {
    content: ""; position: absolute; width: 18px; height: 18px;
    border-radius: 9999px;
    border: 2px solid currentColor; border-right-color: transparent;
    animation: btn-spin 0.7s linear infinite;
  }
  @keyframes btn-spin { to { transform: rotate(360deg); } }

  /* Sizes */
  .btn--sm { height: 32px; padding-inline: var(--spacing-3); font-size: 13px; }
  .btn--md { height: 44px; padding-inline: var(--spacing-5); font-size: 15px; }
  .btn--lg { height: 52px; padding-inline: var(--spacing-6); font-size: 17px; }
  .btn--icon { width: 44px; padding-inline: 0; }

  /* Primary */
  .btn--primary { background: var(--color-sunset-green-500); color: var(--color-text-on-green); box-shadow: var(--shadow-soft); }
  .btn--primary:hover  { background: var(--color-sunset-green-700); transform: translateY(-1px); box-shadow: var(--shadow-hover); }
  .btn--primary:active { background: var(--color-sunset-green-700); transform: translateY(0);  box-shadow: var(--shadow-soft); transition-duration: var(--motion-fast); }
  .btn--primary:focus-visible { outline-color: var(--color-text-on-green); }   /* white ring on green field */

  /* Secondary */
  .btn--secondary { background: transparent; color: var(--color-sunset-green-700);
                    border: var(--border-1) solid var(--color-sunset-green-500); }
  .btn--secondary:hover  { background: var(--color-sunset-green-50); border-color: var(--color-sunset-green-700); }
  .btn--secondary:active { background: var(--color-sunset-green-100); }

  /* Ghost */
  .btn--ghost { background: transparent; color: var(--color-sunset-green-700); }
  .btn--ghost:hover  { background: var(--color-sunset-green-50); }
  .btn--ghost:active { background: var(--color-sunset-green-100); }

  /* Amber — THE one CTA per page */
  .btn--amber { background: var(--color-sunset-amber-500); color: var(--color-text-primary);
                box-shadow: var(--shadow-soft); }
  .btn--amber:hover  { background: var(--color-sunset-amber-700); color: var(--color-text-on-dark);
                       transform: translateY(-1px); box-shadow: var(--shadow-hover); }
  .btn--amber:active { transform: translateY(0); transition-duration: var(--motion-fast); }

  /* Danger (rare) */
  .btn--danger { background: transparent; color: var(--color-danger);
                 border: var(--border-1) solid var(--color-danger); }
  .btn--danger:hover  { background: var(--color-danger-bg); }

  /* Link-styled button */
  .btn--link { height: auto; padding: 0; background: transparent; color: var(--color-sunset-green-700);
               text-decoration: underline; text-underline-offset: 0.18em; }
}
```

### 6.2 Card

#### Variants

| Variant | Surface | Border | Shadow | Radius | Use |
|---|---|---|---|---|---|
| **Default** | `--color-bg` | none | `--shadow-card` | `lg` (16) | Generic content card |
| **Cream** | `--color-bg-cream` | none | `--shadow-on-cream` | `lg` (16) | Card sitting on a `--color-bg` section |
| **Photo (4:3)** | `--color-bg` | none | `--shadow-card` → hover `--shadow-hover` | `lg` | Project tile, blog featured |
| **Service tile (1:1)** | `--color-bg-cream` | none | `--shadow-on-cream` | `lg` | Service grid on audience landing |
| **Project tile (4:3 + overlay)** | photograph | none | `--shadow-card` | `lg` | Projects index. Bottom 50% gradient `--color-overlay-50` → transparent. Title + tags overlay in `--color-text-on-dark`. |
| **Testimonial** | `--color-bg-cream` | `--border-thick` left in `--color-sunset-green-500` | `--shadow-on-cream` | `xl` (24) | Reviews / pull-quotes |
| **Featured** | see Decision D2 | see D2 | `--shadow-hover` | `xl` (24) | At most one per section — highlighted plan, recommended service |

#### States

`default → hover (lift –1px + shadow grow + image zoom 1.03 over 480ms) → active (translateY 0) → focus-within (focus ring on the card via :has(:focus-visible))`.

Photo cards: image is wrapped in `overflow: hidden`; on card hover, image scales to `1.03` over `--motion-slow` with `--easing-soft`. Reduced-motion: image scale becomes `1.0` (no movement), shadow still grows.

#### Visual reference

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 360" width="100%" role="img" aria-label="Card variants">
  <style>
    .h     { font-family: 'Manrope', system-ui, sans-serif; font-weight: 700; font-size: 18px; fill: #1A1A1A; }
    .p     { font-family: 'Onest',  system-ui, sans-serif; font-size: 13px; fill: #4A4A4A; }
    .tag   { font-family: 'Manrope', system-ui, sans-serif; font-size: 11px; font-weight: 600; fill: #2F5D27; }
    .lbl   { font-family: 'Onest',  system-ui, sans-serif; font-size: 12px; fill: #6B6B6B; }
  </style>
  <rect width="920" height="360" fill="#FAF7F1"/>

  <!-- Default card (white) -->
  <g transform="translate(20,30)">
    <rect width="200" height="220" rx="16" fill="#FFFFFF" filter="url(#cardshadow)"/>
    <text x="20" y="40" class="lbl">Default · white</text>
    <text x="20" y="76" class="h">Service title</text>
    <text x="20" y="104" class="p">Short description, 2 lines max,</text>
    <text x="20" y="120" class="p">honest copy not marketing.</text>
    <rect x="20" y="180" width="80" height="20" rx="4" fill="#DCE8D5"/>
    <text x="60" y="194" class="tag" text-anchor="middle">Tag label</text>
  </g>

  <!-- Cream card -->
  <g transform="translate(240,30)">
    <rect width="200" height="220" rx="16" fill="#FAF7F1" stroke="#E5E0D5"/>
    <text x="20" y="40" class="lbl">Cream · on white section</text>
    <text x="20" y="76" class="h">Service title</text>
    <text x="20" y="104" class="p">Same body, warmer surface,</text>
    <text x="20" y="120" class="p">green-tinted shadow.</text>
    <rect x="20" y="180" width="80" height="20" rx="4" fill="#FFFFFF" stroke="#C9C0AE"/>
    <text x="60" y="194" class="tag" text-anchor="middle">Tag label</text>
  </g>

  <!-- Photo card (project tile) -->
  <g transform="translate(460,30)">
    <rect width="200" height="220" rx="16" fill="#8FB67A"/>
    <rect width="200" height="220" rx="16" fill="url(#photoGrad)"/>
    <text x="20" y="190" class="h" fill="#FAF7F1">Backyard patio</text>
    <text x="20" y="208" class="p" fill="#FAF7F1">Naperville · Hardscape</text>
  </g>

  <!-- Featured card option A: amber border -->
  <g transform="translate(680,30)">
    <rect width="220" height="220" rx="24" fill="#FFFFFF" stroke="#E8A33D" stroke-width="2"/>
    <rect x="20" y="22" width="60" height="20" rx="4" fill="#FDF7E8"/>
    <text x="50" y="36" class="tag" fill="#B47821" text-anchor="middle">FEATURED</text>
    <text x="20" y="76" class="h">Recommended</text>
    <text x="20" y="104" class="p">Option A · amber border ring</text>
    <text x="20" y="120" class="p">brand accent, low ink</text>
  </g>

  <!-- Testimonial -->
  <g transform="translate(20,270)">
    <rect width="420" height="76" rx="24" fill="#FAF7F1"/>
    <rect width="4" height="76" fill="#4D8A3F"/>
    <text x="24" y="32" class="p" font-style="italic">"They took a backyard slope no one would touch and turned it into</text>
    <text x="24" y="50" class="p" font-style="italic">our favorite room of the house."</text>
    <text x="24" y="68" class="lbl">— Sarah K., Wheaton</text>
  </g>

  <!-- Featured card option B: green background -->
  <g transform="translate(460,270)">
    <rect width="440" height="76" rx="24" fill="#2F5D27"/>
    <text x="20" y="32" class="lbl" fill="#DCE8D5">Featured · Option B (green panel)</text>
    <text x="20" y="58" class="h" fill="#FAF7F1">Heavier emphasis, full-bleed brand color</text>
  </g>

  <defs>
    <linearGradient id="photoGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.5" stop-color="rgba(0,0,0,0)"/>
      <stop offset="1" stop-color="rgba(0,0,0,0.6)"/>
    </linearGradient>
    <filter id="cardshadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(26,26,26,0.06)"/>
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="rgba(26,26,26,0.06)"/>
    </filter>
  </defs>
</svg>

#### Decision needed — D2 — Featured card variant

| Option | Description | Pros | Cons |
|---|---|---|---|
| **A — amber border ring** | White surface, 2px `--color-sunset-amber-500` border, small "Featured" eyebrow. | Doesn't break the "amber for one CTA per page" rule, since border is decorative not interactive. Quiet, premium. | Amber border + amber CTA on the same page risks reading as two brand accents — must be enforced that featured-card never appears on a page that also has an amber CTA. |
| **B — green panel** | `--color-sunset-green-700` background, white text. | Strong emphasis, photographic feel. Pairs naturally with white/cream sections. | Heavier on the page; risks pulling attention from the page's actual amber CTA. |

**Recommendation: Option A.** The brand's discipline around amber is exactly the kind of decision worth protecting; using amber as a static decorative border preserves it without creating a second interactive amber surface. **Constraint:** the featured-card cannot live in the same section as the page's amber CTA. Code enforces this in §11 implementation notes.

```css
@layer components {
  .card {
    background: var(--color-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
    padding: var(--spacing-6);                    /* 24 mobile */
    transition: transform var(--motion-base) var(--easing-standard),
                box-shadow var(--motion-base) var(--easing-standard);
  }
  @media (min-width: 1024px) { .card { padding: var(--spacing-8); } }   /* 32 desktop */
  .card:hover, .card:has(:focus-visible) {
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
  }
  .card--cream     { background: var(--color-bg-cream); box-shadow: var(--shadow-on-cream); }
  .card--photo     { padding: 0; overflow: hidden; }
  .card--photo img { transition: transform var(--motion-slow) var(--easing-soft); }
  .card--photo:hover img { transform: scale(1.03); }
  .card--testimonial { border-left: var(--border-thick) solid var(--color-sunset-green-500); border-radius: var(--radius-xl); }
  .card--featured    { border: var(--border-2) solid var(--color-sunset-amber-500); border-radius: var(--radius-xl); }

  @media (prefers-reduced-motion: reduce) {
    .card, .card--photo img { transition: none; }
    .card:hover { transform: none; }
    .card--photo:hover img { transform: none; }
  }
}
```

### 6.3 Form fields

Built on `@base-ui/react` primitives where the component requires accessible state (`Select`, `Checkbox`, `Switch`, `RadioGroup`). Plain text inputs and textareas are native.

#### Components covered

`Input` (text/email/tel/url/number) · `Textarea` · `Select` (base-ui) · `Checkbox` + label · `Radio` + label · `Switch/Toggle` (base-ui) · `Help text` · `Error message`.

#### States (every input)

`default → hover → focused → filled → error → disabled → read-only`.

#### Locked rules

- **Label position:** above the field. Never floating-inside (Plan §5).
- **Field height:** **48px minimum on mobile; 44px desktop.** Use 48px sitewide for simplicity.
- **Internal padding:** 12px top/bottom, 16px left/right.
- **Border:** 1px `--color-border` rest, 2px `--color-sunset-green-500` focused, 2px `--color-danger` on error. Color transitions over `--motion-fast`.
- **Radius:** `--radius-sm` (4) on inputs and selects. (Smaller radius reads as "input field" rather than "button.")
- **Help text:** below the field, `--text-body-sm`, `--color-text-muted`.
- **Error message:** below the field, `--text-body-sm`, `--color-danger`, with a small inline alert glyph (16px lucide `AlertCircle`) before the text. Field gets `aria-invalid="true"` and `aria-describedby` linked to the error.
- **Required indicator:** `*` inline after the label, color `--color-danger`, `aria-label="required"` on the abbreviation.
- **Disabled:** field `opacity: var(--opacity-60)`, `cursor: not-allowed`, `background: var(--color-bg-stone)`.
- **Read-only:** keeps full opacity but uses `--color-bg-stone` background and removes the focus border (only outline-style focus ring).

#### Visual reference

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 380" width="100%" role="img" aria-label="Form field states">
  <style>
    .lbl  { font-family: 'Manrope', system-ui, sans-serif; font-size: 13px; font-weight: 600; fill: #1A1A1A; }
    .ph   { font-family: 'Onest', system-ui, sans-serif; font-size: 15px; fill: #6B6B6B; }
    .val  { font-family: 'Onest', system-ui, sans-serif; font-size: 15px; fill: #1A1A1A; }
    .help { font-family: 'Onest', system-ui, sans-serif; font-size: 13px; fill: #6B6B6B; }
    .err  { font-family: 'Onest', system-ui, sans-serif; font-size: 13px; fill: #9A3A2A; }
    .req  { fill: #9A3A2A; }
  </style>
  <rect width="920" height="380" fill="#FFFFFF"/>

  <!-- Default -->
  <g transform="translate(20,20)">
    <text x="0" y="14" class="lbl">Email <tspan class="req">*</tspan></text>
    <rect x="0" y="22" width="280" height="48" rx="4" fill="#FFFFFF" stroke="#E5E0D5"/>
    <text x="16" y="51" class="ph">you@example.com</text>
    <text x="0" y="88" class="help">We'll only email about your quote.</text>
  </g>

  <!-- Focused -->
  <g transform="translate(320,20)">
    <text x="0" y="14" class="lbl">Phone</text>
    <rect x="0" y="22" width="280" height="48" rx="4" fill="#FFFFFF" stroke="#4D8A3F" stroke-width="2"/>
    <rect x="-3" y="19" width="286" height="54" rx="6" fill="none" stroke="#6FA85F" stroke-width="2" opacity="0.5"/>
    <text x="16" y="51" class="val">(630) </text>
  </g>

  <!-- Filled -->
  <g transform="translate(620,20)">
    <text x="0" y="14" class="lbl">Property address</text>
    <rect x="0" y="22" width="280" height="48" rx="4" fill="#FFFFFF" stroke="#C9C0AE"/>
    <text x="16" y="51" class="val">1630 Mountain St, Aurora IL</text>
  </g>

  <!-- Error -->
  <g transform="translate(20,140)">
    <text x="0" y="14" class="lbl">Email <tspan class="req">*</tspan></text>
    <rect x="0" y="22" width="280" height="48" rx="4" fill="#FFFFFF" stroke="#9A3A2A" stroke-width="2"/>
    <text x="16" y="51" class="val">notanemail</text>
    <circle cx="10" cy="100" r="6" fill="none" stroke="#9A3A2A" stroke-width="1.5"/>
    <line x1="10" y1="97" x2="10" y2="100" stroke="#9A3A2A" stroke-width="1.5"/>
    <circle cx="10" cy="103" r="0.5" fill="#9A3A2A"/>
    <text x="22" y="104" class="err">Please enter a valid email address.</text>
  </g>

  <!-- Disabled -->
  <g transform="translate(320,140)" opacity="0.6">
    <text x="0" y="14" class="lbl">Service</text>
    <rect x="0" y="22" width="280" height="48" rx="4" fill="#F2EDE3" stroke="#E5E0D5"/>
    <text x="16" y="51" class="ph">— select an audience first —</text>
  </g>

  <!-- Textarea -->
  <g transform="translate(620,140)">
    <text x="0" y="14" class="lbl">Tell us about the project</text>
    <rect x="0" y="22" width="280" height="100" rx="4" fill="#FFFFFF" stroke="#E5E0D5"/>
    <text x="16" y="51" class="ph">A patio for the back of the house…</text>
  </g>

  <!-- Checkbox -->
  <g transform="translate(20,260)">
    <rect x="0" y="0" width="20" height="20" rx="4" fill="#4D8A3F"/>
    <path d="M5 10 l4 4 l8 -8" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="32" y="15" class="val">I'd like a callback within 24 hours</text>
  </g>
  <!-- Radio -->
  <g transform="translate(20,300)">
    <circle cx="10" cy="10" r="9" fill="none" stroke="#4D8A3F" stroke-width="2"/>
    <circle cx="10" cy="10" r="4" fill="#4D8A3F"/>
    <text x="32" y="15" class="val">Residential</text>
    <circle cx="160" cy="10" r="9" fill="none" stroke="#C9C0AE" stroke-width="1.5"/>
    <text x="182" y="15" class="val">Commercial</text>
    <circle cx="310" cy="10" r="9" fill="none" stroke="#C9C0AE" stroke-width="1.5"/>
    <text x="332" y="15" class="val">Hardscape</text>
  </g>
  <!-- Switch -->
  <g transform="translate(20,340)">
    <rect x="0" y="0" width="36" height="20" rx="10" fill="#4D8A3F"/>
    <circle cx="26" cy="10" r="7" fill="#FFFFFF"/>
    <text x="48" y="15" class="val">Español</text>
  </g>
</svg>

#### Code (text input)

```css
@layer components {
  .field { display: flex; flex-direction: column; gap: var(--spacing-2); }
  .field__label {
    font-family: var(--font-heading); font-weight: 600; font-size: 13px;
    color: var(--color-text-primary);
  }
  .field__required { color: var(--color-danger); margin-inline-start: 4px; }
  .input {
    height: 48px;
    padding: var(--spacing-3) var(--spacing-4);
    background: var(--color-bg);
    border: var(--border-1) solid var(--color-border);
    border-radius: var(--radius-sm);
    font-family: var(--font-body); font-size: 15px; color: var(--color-text-primary);
    transition: border-color var(--motion-fast) var(--easing-standard),
                box-shadow   var(--motion-fast) var(--easing-standard);
  }
  .input::placeholder { color: var(--color-text-muted); }
  .input:hover { border-color: var(--color-border-strong); }
  .input:focus-visible {
    outline: none;
    border-color: var(--color-sunset-green-500);
    border-width: var(--border-2);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-focus-ring) 50%, transparent);
  }
  .input[aria-invalid="true"] {
    border-color: var(--color-danger);
    border-width: var(--border-2);
  }
  .input:disabled, .input[aria-disabled="true"] {
    background: var(--color-bg-stone); opacity: var(--opacity-60); cursor: not-allowed;
  }
  .input[readonly] { background: var(--color-bg-stone); }

  .field__help  { font-size: var(--text-body-sm); color: var(--color-text-muted); }
  .field__error { font-size: var(--text-body-sm); color: var(--color-danger);
                  display: inline-flex; gap: var(--spacing-2); align-items: flex-start; }
}
```

`Textarea` shares `.input` styles with `min-height: 120px; resize: vertical;`. `Select` (base-ui `<Select.Trigger>`) shares the same border/height/radius and adds a 16px lucide `ChevronDown` glyph in `--color-text-muted` at the right edge. `Checkbox` and `Radio` use base-ui's headless primitives styled with the same focus-ring rules as buttons. `Switch` (base-ui) is `36×20` track with a `16px` thumb; on (`--color-sunset-green-500`), off (`--color-border-strong`).

### 6.4 Link

Three styles. Each is locked to a use; do not improvise outside these.

| Style | Visual | Use |
|---|---|---|
| **Navigational** | No underline rest, underline on hover (1px, brand green offset 0.18em) | Header nav, footer nav, breadcrumb |
| **Inline body** | Underline always (1px, 40% opacity), full-opacity on hover | Inside paragraphs, blog body, resource articles |
| **CTA-link** | No underline, color `--color-sunset-green-700`, trailing 16px lucide `ArrowRight` glyph that translates +2px on hover over `--motion-fast` | "View all services →" type calls-to-action that aren't full buttons |

```css
@layer components {
  .link { color: var(--color-sunset-green-700); text-decoration: none;
          transition: color var(--motion-fast) var(--easing-standard); }
  .link:hover  { color: var(--color-sunset-green-500); }
  .link:focus-visible { outline: var(--border-2) solid var(--color-focus-ring); outline-offset: 2px; border-radius: 2px; }
  .link--nav     { /* no underline rest */ }
  .link--nav:hover { text-decoration: underline; text-underline-offset: 0.18em; text-decoration-thickness: 1px; }
  .link--inline  { text-decoration: underline; text-underline-offset: 0.18em; text-decoration-thickness: 1px;
                   text-decoration-color: color-mix(in srgb, currentColor 40%, transparent); }
  .link--inline:hover { text-decoration-color: currentColor; }
  .link--cta { display: inline-flex; align-items: center; gap: var(--spacing-2); font-weight: 600; }
  .link--cta svg { transition: transform var(--motion-fast) var(--easing-standard); }
  .link--cta:hover svg { transform: translateX(2px); }
}
```

### 6.5 Badge / tag / pill

| Variant | Background | Text | Border | Use |
|---|---|---|---|---|
| **Subtle** | `--color-sunset-green-50` | `--color-sunset-green-700` | none | Service tags on cards, project filter chips (rest) |
| **Solid** | `--color-sunset-green-500` | `--color-text-on-green` | none | Selected filter chip, "Verified" credential |
| **Outlined** | transparent | `--color-text-secondary` | 1px `--color-border-strong` | Meta tags (year, location) |

Sizes: **sm** = 20h, 11px, padding 0/8; **md** = 24h, 12px, padding 2/10. Radius `--radius-sm` (4) by default, fully rounded `9999px` for filter chips. Interactive (filter) variants get the focus ring.

### 6.6 Avatar

Sizes (in CSS px): **24, 32, 40, 48, 64, 96.** Default radius: full circle (`9999px`). Square variant uses `--radius-md`.

- Default state: 1px ring `--color-border` on white surface; `--color-border-strong` on cream/stone (so the avatar always has an edge).
- Hover (only when avatar is part of an interactive surface — e.g., team card): subtle 1px translate-up + `--shadow-soft`.
- Fallback (no image): initials in `--font-heading` 600, `--color-sunset-green-700` on `--color-sunset-green-50` background.

### 6.7 Tooltip

Built on `@base-ui/react` `<Tooltip>`. Positioned `top` by default; arrow visible.

- Container: `--color-bg-charcoal`, `--color-text-on-dark`, padding 8/12, `--radius-sm`, `--shadow-card`. Max width **240px**. `--text-body-sm`.
- Arrow: 8px equilateral, same charcoal.
- Animation: in — opacity 0→1 + translateY 4→0 over `--motion-fast` `--easing-standard`. Out — opacity 1→0 over `--motion-fast`.
- Show delay: 300ms; hide delay: 0.
- Touch: tap-to-show, tap-elsewhere-to-hide. Long-press also shows.
- Reduced motion: opacity only, no translateY.

### 6.8 Dialog / modal

Built on `@base-ui/react` `<Dialog>`. Used for: the AI chat widget expanded state (mobile), photo lightbox on project detail, confirmation dialogs in Sanity Studio (dev-only).

- **Backdrop:** `--color-overlay-50`, fades in 240ms `easing-standard`. Click-to-dismiss when not destructive.
- **Container:** centered, `max-width: 640px` (default) or `max-width: 920px` (lightbox), full-width on mobile minus 16px gutter, `--color-bg`, `--radius-xl` (24), `--shadow-hover`, padding 24/32. Animated in: opacity 0→1, scale 0.96→1, over `--motion-base` `--easing-soft`.
- **Header:** title in `--text-h3`, `--color-text-primary`, optional dek in `--text-body` `--color-text-secondary`. Close button (icon-only btn, `X` lucide 20px) at top-right.
- **Body:** scroll inside if overflows; max-height `min(85vh, 720px)`; bottom mask gradient if scroll-clipped.
- **Footer (when needed):** primary action right-aligned, secondary action to its left, gap 8.
- **Focus management:** trap inside dialog; focus first interactive element on open; restore focus to opener on close. `aria-modal="true"`, `role="dialog"`, `aria-labelledby`/`aria-describedby` linked.
- **Esc key:** dismisses (unless explicitly disabled by content).
- **Reduced motion:** opacity only, no scale.

### 6.9 Toast / inline alert

| Variant | Surface | Icon (lucide, 20px) | Use |
|---|---|---|---|
| `info`    | `--color-info-bg`    + 1px `--color-info`    border-left 4px | `Info`         | Generic notice |
| `success` | `--color-success-bg` + 1px `--color-success` border-left 4px | `CheckCircle2` | Form submit success |
| `warning` | `--color-warning-bg` + 1px `--color-warning` border-left 4px | `AlertTriangle`| Form warning, partial save |
| `danger`  | `--color-danger-bg`  + 1px `--color-danger`  border-left 4px | `AlertCircle`  | Network error, validation summary |

- Container: `--radius-lg`, padding 16/20, `--shadow-soft`. Max width 420px on toast; full-width inline alert.
- Title `--text-body` 600; body `--text-body-sm`; close button on toast only.
- **Toast position:** bottom-right desktop, bottom-center mobile (offset 16px). Stacks downward (newest at bottom). Only one container at a time.
- **Auto-dismiss:** info/success after 5s; warning after 8s; danger **never** auto-dismisses (must be acknowledged).
- **Animation in:** translateY 16→0 + opacity 0→1 over `--motion-base` `--easing-soft`. Out: opacity → 0 over `--motion-fast`.
- **`role`:** `status` for info/success; `alert` for warning/danger.

### 6.10 Breadcrumb

Per Plan §9, every non-home page has a `BreadcrumbList`.

- Visual: chevron-right separator (lucide 14px), 8px gap each side. Items: `--text-body-sm` `--color-text-muted` rest, `--color-text-primary` on the current page (last item, `aria-current="page"`).
- Hover: `--color-sunset-green-700`. Underline on hover only.
- Container: lives under the page H1 by default, with 16px space below, sitting in `--container-default`.
- Mobile: collapse middle items to "…" if total chars >40; show first + last only. Tap to expand.

### 6.11 Pagination

For projects index and blog index.

- Variants: **Numbered** (1, 2, 3 … with prev/next chevrons) for blog and projects index. **Load-more** is reserved for the AI chat history (out of scope here).
- Item: 40×40 button, `--font-heading` 600, `--text-body-sm`. Rest = transparent + `--color-text-secondary`. Active = `--color-sunset-green-500` background, `--color-text-on-green` text. Hover = `--color-sunset-green-50` background.
- Prev/next: icon + label "Previous" / "Next"; label hidden on `< 640`.
- Disabled prev/next at edges: `opacity: var(--opacity-40)`, `cursor: not-allowed`.
- Keyboard: `←`/`→` move focus and trigger nav when pagination has focus.

### 6.12 Skip link

Sitewide. Hidden until focused; jumps to `#main`.

```css
@layer components {
  .skip-link {
    position: absolute; top: 8px; left: 8px;
    transform: translateY(-200%);
    background: var(--color-sunset-green-700); color: var(--color-text-on-green);
    padding: var(--spacing-3) var(--spacing-4);
    border-radius: var(--radius-md);
    font-family: var(--font-heading); font-weight: 600;
    z-index: var(--z-banner);
    transition: transform var(--motion-fast) var(--easing-standard);
  }
  .skip-link:focus-visible { transform: translateY(0); outline: var(--border-2) solid var(--color-text-on-green); outline-offset: 2px; }
}
```

`<main id="main" tabindex="-1">` lives in the locale layout. The skip link is the very first focusable element in `<body>`.

---

## 7. Motion

Locked: `motion v12` from `motion/react`; `MotionConfig reducedMotion="user"` mounted once in the locale-level layout; server components wrap in `<AnimateIn>` or `<StaggerContainer>` + `<StaggerItem>`.

### 7.1 Easings

Three named curves. Don't add a fourth.

```ts
// src/components/global/motion/easings.ts
export const easings = {
  standard: 'easeOut',                            // most UI
  soft:     [0.16, 1, 0.30, 1] as const,          // expo-out — entrances, page-level reveals
  snap:     [0.20, 0.00, 0.10, 1] as const,       // micro-feedback (button press, toast in)
} as const;
```

CSS mirror:

```css
@theme {
  --easing-standard: cubic-bezier(0.0, 0.0, 0.2, 1);    /* easeOut */
  --easing-soft:     cubic-bezier(0.16, 1, 0.30, 1);
  --easing-snap:     cubic-bezier(0.20, 0.00, 0.10, 1);
}
```

### 7.2 Durations

Four. Don't add more.

```css
@theme {
  --motion-fast:       120ms;   /* micro feedback — button press, focus ring ease, link color */
  --motion-base:       240ms;   /* most UI — hover, modal in, toast in */
  --motion-slow:       480ms;   /* entrance animations — AnimateIn, scroll reveals */
  --motion-deliberate: 700ms;   /* hero reveals, "big moment" transitions; use sparingly */
}
```

Mirror in TS:

```ts
export const durations = { fast: 0.12, base: 0.24, slow: 0.48, deliberate: 0.70 } as const;
```

### 7.3 `<AnimateIn>` variants

Six. The default (when `<AnimateIn>` is used with no `variant` prop) is `fade-up`.

```ts
// src/components/global/motion/variants.ts
import type { Variants } from 'motion/react';
import { durations, easings } from './easings';

export const animateInVariants: Record<
  'fade' | 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale',
  Variants
> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: durations.slow, ease: easings.soft } },
  },
  'fade-up': {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: durations.slow, ease: easings.soft } },
  },
  'fade-down': {
    initial: { opacity: 0, y: -16 },
    animate: { opacity: 1, y: 0, transition: { duration: durations.slow, ease: easings.soft } },
  },
  'fade-left': {
    initial: { opacity: 0, x: 16 },
    animate: { opacity: 1, x: 0, transition: { duration: durations.slow, ease: easings.soft } },
  },
  'fade-right': {
    initial: { opacity: 0, x: -16 },
    animate: { opacity: 1, x: 0, transition: { duration: durations.slow, ease: easings.soft } },
  },
  scale: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1, transition: { duration: durations.slow, ease: easings.soft } },
  },
};
```

`<AnimateIn>` triggers on viewport-entry once (`viewport={{ once: true, margin: '-10% 0px' }}`).

### 7.4 `<StaggerContainer>` + `<StaggerItem>`

```ts
// src/components/global/motion/stagger.ts
import { durations, easings } from './easings';

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,   // 80ms between siblings — tight, doesn't feel like a parade
      delayChildren:   0.04,   // 40ms head start so the container settles first
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0,
             transition: { duration: durations.base, ease: easings.soft } },
};
```

Use on: service grids, project tiles, FAQ lists, footer columns, navbar mobile menu items.

### 7.5 Hover & tap micro-interactions

| Element | Hover | Active/tap | Duration | Easing |
|---|---|---|---|---|
| **Button** | `translateY(-1px)` + shadow `card → hover` | `translateY(0)`, no shadow change | `--motion-base` | `--easing-standard` |
| **Card** | `translateY(-2px)` + shadow `card → hover` | `translateY(0)` | `--motion-base` | `--easing-standard` |
| **Photo card image** | `scale(1.03)` | — | `--motion-slow` | `--easing-soft` |
| **Inline link** | text-decoration-color `40% → 100%` | — | `--motion-fast` | `--easing-standard` |
| **Nav link** | underline reveal (height 0→1px) | — | `--motion-fast` | `--easing-standard` |
| **CTA arrow** | `translateX(+2px)` | — | `--motion-fast` | `--easing-standard` |
| **Filter chip** | bg `green-50 → green-100` | bg `green-500` (selected) | `--motion-fast` | `--easing-standard` |

### 7.6 Page transitions

**Recommendation: none at v1.** No crossfade, no slide, no orchestrated reveal. Reasons:

1. App Router's streaming + RSC means a "transition" risks blocking the visible content while old DOM unmounts.
2. Page transitions hurt perceived performance on mobile in a way Lighthouse flags (LCP shifts).
3. The benchmark (Western DuPage Landscaping) doesn't use them, and we're aiming for sharper-but-same-family.

If a page transition is added later (post-launch), it must be opacity-only (no movement) and capped at `--motion-fast` (120ms).

### 7.7 Reduced-motion contract

When `prefers-reduced-motion: reduce` is honored by `MotionConfig reducedMotion="user"`, the contract Code must implement:

1. **All entrance animations become opacity-only.** No `y`, no `x`, no `scale`. Duration drops to `--motion-fast` (120ms).
2. **All hover/active transforms (translate, scale) are removed** via the `@media (prefers-reduced-motion: reduce)` block in `@layer components`.
3. **Photo-card image scale is removed.** The card still gets a shadow change on hover (it's a color/shadow change, not motion).
4. **The button-loading spinner keeps animating** — it's a status indicator, not decorative; see WCAG 2.3.3 exception for status indication. (If a stricter posture is preferred, replace the spinner with a static "Loading…" text label.)
5. **Toasts and dialogs:** opacity-only entrance, no translateY, no scale.
6. **Focus rings are unchanged** — they're pixel-snapped, not motion.

`<AnimateIn>` and `<StaggerContainer>` consult MotionConfig's reducedMotion; no per-component branching needed at the call site.

---

## 8. Misc system tokens

### 8.1 Z-index

```css
@theme {
  --z-base:       0;
  --z-dropdown:   10;
  --z-sticky:     20;   /* navbar */
  --z-overlay:    40;   /* modals, drawers */
  --z-chat:       50;   /* AI chat widget */
  --z-toast:      60;
  --z-banner:     70;   /* cookie consent — above everything */
}
```

Skip link uses `--z-banner` (it must clear the cookie banner if both are visible momentarily).

### 8.2 Breakpoints

Tailwind v4 defaults are kept. `xs` is added for ≤480 phones (Sunset's mobile traffic includes a meaningful share of older Androids).

```css
@theme {
  --breakpoint-xs:  480px;
  --breakpoint-sm:  640px;
  --breakpoint-md:  768px;
  --breakpoint-lg:  1024px;
  --breakpoint-xl:  1280px;
  --breakpoint-2xl: 1536px;
}
```

### 8.3 Iconography

- **Library:** `lucide-react`. Brand logos and the Sunset wordmark are hand-rolled inline SVG in `src/components/global/Logo.tsx`.
- **Stroke width: 1.75** — locked. Warmer/organic feel; matches the brand tone better than 2.0.
- **Sizes:** 16 (inline-with-body-sm), **20** (inline-with-body, default), 24 (standalone, button-icon), 32 (feature icon in service grid), 48 (large feature/ hero accent).
- **Color:** inherits from `currentColor`. Footer / dark surfaces: `--color-text-on-dark`. Icon-only buttons: see §6.1.
- **Brand-logo monochrome rules:** the wordmark has three skins — full color on light surfaces, solid `--color-text-primary` for legal/footer-on-light, solid `--color-text-on-dark` for footer-on-dark. No drop-shadow, no gradient fill on the wordmark itself.

### 8.4 Focus ring

Locked behavior:

```css
@layer base {
  :focus-visible {
    outline: var(--border-2) solid var(--color-focus-ring);
    outline-offset: 2px;
    border-radius: 2px;   /* harmless rounding for non-rounded targets */
  }
  /* On primary green button, switch to white ring for contrast (see §2.4 D1). */
  .btn--primary:focus-visible { outline-color: var(--color-text-on-green); }
}
```

Never use `outline: none` without an alternative indicator. WCAG 2.2 SC 2.4.13 (Focus Appearance) is honored by the 2px solid ring + 2px offset (≥3:1 contrast against every normal page surface; see §2.4 D1).

### 8.5 Transition defaults

Global allow-list of properties that participate in `transition: var(--motion-base) var(--easing-standard)`:

```css
@layer base {
  * {
    transition-property: transform, opacity, color, background-color, border-color, box-shadow, outline-color, text-decoration-color;
    transition-duration: var(--motion-base);
    transition-timing-function: var(--easing-standard);
  }
}
```

Do not transition `width`, `height`, `top`, `left`, `padding`, `margin` — they trigger layout. Use `transform` instead.

### 8.6 Print styles

```css
@media print {
  .navbar, .footer, .chat-widget, .cookie-banner, .skip-link { display: none !important; }
  *, *::before, *::after { animation: none !important; transition: none !important; }
  body { background: #FFFFFF; color: #1A1A1A; }
  a { color: #1A1A1A; text-decoration: underline; }
  a[href]::after { content: " (" attr(href) ")"; font-size: 0.85em; color: #6B6B6B; }
  img { max-width: 100% !important; height: auto !important; page-break-inside: avoid; }
  h1, h2, h3 { page-break-after: avoid; }
}
```

---

## 9. Section-rhythm reference visual

A long page (homepage) reads as a series of alternating bands: white, cream, white, cream, white, charcoal (footer). Cards live inside bands; surfaces never nest more than one level deep (a card on a section, never a card on a card).

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 1100" width="100%" role="img" aria-label="Section rhythm reference">
  <style>
    .h     { font-family: 'Manrope', system-ui, sans-serif; font-weight: 700; font-size: 18px; fill: #1A1A1A; }
    .lbl   { font-family: 'Onest', system-ui, sans-serif; font-size: 12px; fill: #6B6B6B; }
    .ann   { font-family: 'Onest', system-ui, sans-serif; font-size: 11px; fill: #4A4A4A; }
    .tag   { font-family: 'Manrope', system-ui, sans-serif; font-size: 11px; font-weight: 600; fill: #2F5D27; }
  </style>

  <!-- Navbar -->
  <rect width="880" height="64" fill="#FFFFFF" stroke="#E5E0D5"/>
  <text x="20" y="40" class="h" fill="#2F5D27">SUNSET SERVICES</text>
  <text x="780" y="40" class="lbl">EN · ES · 📞</text>

  <!-- Hero (white, photographic) -->
  <rect y="64" width="880" height="220" fill="#1A3617"/>
  <rect y="64" width="880" height="220" fill="url(#heroGrad)"/>
  <text x="40" y="160" class="h" fill="#FAF7F1" font-size="32">Outdoor living for DuPage County.</text>
  <text x="40" y="190" class="lbl" fill="#DCE8D5">Patios, lawns, and snow — done by people who answer the phone.</text>
  <rect x="40" y="220" width="190" height="44" rx="8" fill="#E8A33D"/>
  <text x="135" y="248" class="h" fill="#1A1A1A" font-size="15" text-anchor="middle">Get a Free Estimate</text>
  <text x="780" y="80" class="ann" fill="#FAF7F1">— charcoal hero band</text>

  <!-- Section 1: white — three audience tiles -->
  <rect y="284" width="880" height="180" fill="#FFFFFF"/>
  <text x="40" y="320" class="h">Three audiences. One team.</text>
  <g transform="translate(40,340)">
    <rect width="245" height="100" rx="16" fill="#FAF7F1"/><text x="20" y="36" class="h">Residential</text>
    <text x="20" y="62" class="lbl">Lawns, design, sprinklers,</text><text x="20" y="78" class="lbl">snow, cleanup, trees.</text>
  </g>
  <g transform="translate(305,340)">
    <rect width="245" height="100" rx="16" fill="#FAF7F1"/><text x="20" y="36" class="h">Commercial</text>
    <text x="20" y="62" class="lbl">Maintenance, snow removal,</text><text x="20" y="78" class="lbl">turf, enhancement.</text>
  </g>
  <g transform="translate(570,340)">
    <rect width="245" height="100" rx="16" fill="#FAF7F1"/><text x="20" y="36" class="h">Hardscape</text>
    <text x="20" y="62" class="lbl">Patios, walls, fire features,</text><text x="20" y="78" class="lbl">Unilock specialist.</text>
  </g>
  <text x="690" y="300" class="ann">py-20 desktop · py-14 mobile</text>

  <!-- Section 2: cream — services overview -->
  <rect y="464" width="880" height="180" fill="#FAF7F1"/>
  <text x="40" y="500" class="h">All services</text>
  <text x="40" y="522" class="lbl">A grid of service tiles, 1:1 photo, title, micro tag</text>
  <g transform="translate(40,540)"><rect width="120" height="80" rx="16" fill="#FFFFFF"/><text x="60" y="46" class="h" font-size="13" text-anchor="middle">Lawn care</text></g>
  <g transform="translate(180,540)"><rect width="120" height="80" rx="16" fill="#FFFFFF"/><text x="60" y="46" class="h" font-size="13" text-anchor="middle">Patios</text></g>
  <g transform="translate(320,540)"><rect width="120" height="80" rx="16" fill="#FFFFFF"/><text x="60" y="46" class="h" font-size="13" text-anchor="middle">Snow</text></g>
  <g transform="translate(460,540)"><rect width="120" height="80" rx="16" fill="#FFFFFF"/><text x="60" y="46" class="h" font-size="13" text-anchor="middle">Sprinklers</text></g>
  <g transform="translate(600,540)"><rect width="120" height="80" rx="16" fill="#FFFFFF"/><text x="60" y="46" class="h" font-size="13" text-anchor="middle">Trees</text></g>
  <g transform="translate(740,540)"><rect width="100" height="80" rx="16" fill="#FFFFFF"/><text x="50" y="46" class="h" font-size="13" text-anchor="middle">Cleanup</text></g>
  <text x="690" y="480" class="ann">cream band — alternates ↑</text>

  <!-- Section 3: white — social proof -->
  <rect y="644" width="880" height="160" fill="#FFFFFF"/>
  <text x="40" y="680" class="h">Reviewed by neighbors.</text>
  <g transform="translate(40,696)">
    <rect width="780" height="80" rx="24" fill="#FAF7F1"/>
    <rect width="4" height="80" fill="#4D8A3F"/>
    <text x="20" y="40" class="lbl" font-style="italic">"They took a backyard slope no one would touch and turned it into our favorite room of the house."</text>
    <text x="20" y="62" class="lbl">— Sarah K., Wheaton · ★★★★★</text>
  </g>

  <!-- Section 4: cream — Unilock + projects teaser -->
  <rect y="804" width="880" height="160" fill="#FAF7F1"/>
  <text x="40" y="838" class="h">Unilock Authorized Contractor.</text>
  <text x="40" y="858" class="lbl">Premium pavers, 25+ years, recent projects from Aurora and Naperville.</text>
  <g transform="translate(40,874)">
    <rect width="180" height="76" rx="16" fill="#8FB67A"/><text x="90" y="44" class="h" fill="#FAF7F1" text-anchor="middle">project 1</text>
  </g>
  <g transform="translate(240,874)"><rect width="180" height="76" rx="16" fill="#8FB67A"/><text x="90" y="44" class="h" fill="#FAF7F1" text-anchor="middle">project 2</text></g>
  <g transform="translate(440,874)"><rect width="180" height="76" rx="16" fill="#8FB67A"/><text x="90" y="44" class="h" fill="#FAF7F1" text-anchor="middle">project 3</text></g>
  <g transform="translate(640,874)"><rect width="180" height="76" rx="16" fill="#8FB67A"/><text x="90" y="44" class="h" fill="#FAF7F1" text-anchor="middle">project 4</text></g>

  <!-- Section 5: white — final CTA -->
  <rect y="964" width="880" height="80" fill="#FFFFFF"/>
  <text x="40" y="1000" class="h">Ready for a quote? Tell us about the property.</text>
  <rect x="40" y="1010" width="200" height="44" rx="8" fill="#E8A33D"/>
  <text x="140" y="1038" class="h" fill="#1A1A1A" font-size="15" text-anchor="middle">Get a Free Estimate</text>

  <!-- Footer (charcoal) -->
  <rect y="1044" width="880" height="56" fill="#1A1A1A"/>
  <text x="40" y="1080" class="lbl" fill="#FAF7F1">Sunset Services · 1630 Mountain St, Aurora IL · (630) 946-9321</text>

  <defs>
    <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="rgba(0,0,0,0)"/>
      <stop offset="1" stop-color="rgba(0,0,0,0.6)"/>
    </linearGradient>
  </defs>
</svg>

Annotated rules from the diagram:

- **Section padding:** `py-20` desktop / `py-14` mobile on every band.
- **Container:** `--container-default` for sections 1–5; `--container-wide` for the hero only.
- **Surface alternation:** white → cream → white → cream → white → charcoal (footer). Never two adjacent bands of the same surface.
- **Cards** live inside their section's contrasting surface: a cream card on a white section uses `--shadow-on-cream`; a white card on a cream section uses `--shadow-card`.
- **The amber CTA** appears at most twice per page — once in the hero band, once at the bottom CTA — and never anywhere else on the homepage. Audience landings and service detail pages typically have one amber CTA only.

---

## 10. Decisions needed

Two open decisions for Claude Chat to ratify before Phase 1.04 starts.

- [ ] **D1 — Focus-ring color.**
  Option A: `--color-focus-ring: #6FA85F` (green-tinted, mix of green-500 and white).
  Option B: `--color-focus-ring: #E8A33D` (amber-tinted = amber-500).
  **Recommendation: A.** Rationale: Option B fails 3:1 contrast on white (2.4:1) and cream (2.3:1) — the system's two most common surfaces — which would force a dual-color focus ring and violate WCAG 2.2 SC 1.4.11. Option A clears 3:1 on white, cream, and charcoal; the only context it fails (sitting on a `--color-sunset-green-500` button) is handled by switching the ring to `--color-text-on-green` per §6.1.

- [ ] **D2 — Featured-card variant.**
  Option A: White surface with a 2px `--color-sunset-amber-500` border ring.
  Option B: `--color-sunset-green-700` background panel with `--color-text-on-green` body.
  **Recommendation: A**, with the constraint that featured-cards do not appear in the same section as the page's amber CTA (so the amber border doesn't compete with the amber button). Rationale: A preserves "amber for one CTA per page" as a discipline (the border is decorative, not interactive); B is heavier visually and risks pulling attention from the page's actual amber CTA.

---

## 11. Implementation notes for Phase 1.04

**Token order in `globals.css`.** Place the `@theme { … }` block first, in this order: typography (`--font-*`), color (brand → semantic → focus/selection/overlay), spacing, radius, shadow, border, opacity, motion (durations + easings), z-index, breakpoints, container widths, text scale (`--text-*`). Tailwind v4 reads `@theme` first, so this lets the rest of `globals.css` consume the tokens via `var(...)`.

**File layout.**

```
src/
  app/
    globals.css                 # @theme + @layer base + @layer components
    layout.tsx                  # font links via next/font/google; <body> base classes
    [locale]/
      layout.tsx                # <MotionConfig reducedMotion="user"> wraps {children}
  components/
    global/
      motion/
        AnimateIn.tsx           # client component, "use client"
        StaggerContainer.tsx    # client component
        StaggerItem.tsx         # client component
        easings.ts              # plain TS module — no "use client"
        variants.ts             # plain TS module
        stagger.ts              # plain TS module
      Logo.tsx                  # hand-rolled brand SVG
    ui/                         # shadcn primitives wrapping @base-ui/react
```

**`<AnimateIn>` API contract.**

```ts
type AnimateInProps = {
  variant?: 'fade' | 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale';
  delay?: number;          // seconds, default 0
  as?: keyof JSX.IntrinsicElements;  // default 'div'
  children: React.ReactNode;
  className?: string;
};
```

Internally uses `<motion.div ... initial="initial" whileInView="animate" viewport={{ once: true, margin: '-10% 0px' }} variants={animateInVariants[variant]}>`.

**`<StaggerContainer>` / `<StaggerItem>` API contract.**

```ts
type StaggerContainerProps = { children: React.ReactNode; as?: keyof JSX.IntrinsicElements; className?: string; };
type StaggerItemProps      = { children: React.ReactNode; as?: keyof JSX.IntrinsicElements; className?: string; };
```

The container fires `whileInView="animate"` once; items consume the same animate state via `variants={staggerItem}`.

**Dependencies to confirm in `package.json`** (Phase 1.02 should already have these; verify before Phase 1.04 wiring):

- `motion@^12` (imported as `motion/react`).
- `lucide-react` (latest pin from 1.02).
- `@base-ui/react` (latest pin from 1.02).
- `next-intl@^4.9` for localized layouts (used at the locale-level `MotionConfig` wrapper).
- Tailwind v4 (`tailwindcss@^4`) with PostCSS.

**Fonts.** Use `next/font/google` for both Manrope and Onest in `src/app/layout.tsx`. Set both with `display: 'swap'`, `subsets: ['latin', 'latin-ext']`, `variable: '--font-heading'` and `variable: '--font-body'` respectively. Apply both `variable` classNames to `<html>` so the CSS `--font-*` tokens resolve.

**Ordering of `@layer base` rules.** Type base styles first (so headings inherit families before utilities apply), then `:focus-visible`, then `*` transition defaults, then `::selection`, then any reset.

**Smoke-test page (Phase 1.04 deliverable).** A single `/dev/system` route (un-linked, dev-only) that renders one of every component family at every variant × state shown in §6 — used by Code to verify the tokens compile and `<AnimateIn>`/stagger works. This is not user-facing and can be deleted before launch.

**Featured-card constraint enforcement.** The page-level handovers in 1.06+ must declare `featuredCard?: boolean` per section. If a section sets `featuredCard: true`, the page may not also include an amber CTA. A linting check in `src/_project-state/` is optional; at minimum, this rule lives in the design-handover for each page.

---
