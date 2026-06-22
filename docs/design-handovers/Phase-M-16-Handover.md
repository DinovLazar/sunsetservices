# Phase M.16 · Homepage Redesign — Design Handover (for Code)

**Status:** Design complete, pending Lazar's final hero sign-off.
**Chosen hero:** **Concept A — "Establishing light"** (single wide golden-hour shot, white nav dock). Concept B (before/after split) retained as a documented alternative.
**Scope:** homepage only (`/` EN + `/es`). Everything below is self-contained — Code should not need the mockups open.

This handover **overrides BG-01 on three axes** by owner ratification (see §1). Treat the three deviations as fixed requirements; do not "correct" them back toward BG-01.

---

## 1. Direction — locked

### Follow BG-01
| Axis | Apply | BG-01 |
|---|---|---|
| Tagline (hero H1) | **"Craft Your Outdoor Legacy"** | §8.1 |
| Credential line | **"UNILOCK-Certified · 25 Years Strong · Built for Chicagoland"** | §8.2 |
| Accent / CTA | **Sunset Orange `#F28C38`** = the single per-page accent + primary-CTA fill (replaces amber in that role) | §6.1, §6.3 |
| UNILOCK | Authorized-Contractor badge featured prominently in the trust band | §8.3, §8.5 |
| Voice | Expert · Neighborly · Design-forward · Honest · Proud; approved phrases only | §3.3, §8.4 |
| Imagery | Real golden-hour photography; before/after is the most persuasive content | §9.1 |
| Brand name | Present as **"Sunset Services U.S."** in hero/lockup | §2.1.1 |

### Deviate from BG-01 (owner-ratified — do NOT correct)
| BG-01 says | Homepage does | Why |
|---|---|---|
| Deep-charcoal dark UI base | **Keep the existing LIGHT, photography-led UI** | All 80 pages are light; launch is imminent |
| Montserrat | **Keep Manrope (headings) + Onest (body)** | Site-wide; Montserrat is a templated tell |
| Forest-green + full BG-01 palette | **Keep the site's `sunset-green` ramp + warm neutrals**; orange is the only new color | A full swap is a site-wide rebrand, not a homepage redesign |

---

## 2. Token deltas (tokens before mockups)

### KEPT — confirmed, do not contradict
- Green ramp: `--color-sunset-green` primary `#4D8A3F`, `-600 #3E7233` (added B.06), deep `#2F5D27`.
- Warm neutral surfaces: `bg #FFFFFF`, `bg-cream #F8F5EF`, `bg-stone #EFEAE1`; dark sections `#23231D`–`#1C1C17`.
- Text `#1A1A1A` (primary), `#544F47`/`#5A564D` (body), borders `#EAE4D8`.
- Radius scale, shadow recipe, Manrope/Onest fonts — all unchanged.

### ADD — Sunset Orange ramp + role
```
--color-sunset-orange-50:  #FEF4EA
--color-sunset-orange-100: #FBE4CC
--color-sunset-orange-300: #F7B97E
--color-sunset-orange-500: #F28C38   /* BG-01 Sunset Orange — primary accent + CTA fill */
--color-sunset-orange-700: #B45309   /* deepened step for any unavoidable white-on-orange */
```
Role: the single per-page accent and primary-CTA fill on the homepage. Use `-300 #F7B97E` for accent text/eyebrows on dark surfaces; `-50/-100` for light fills; `-700` for hover/active and for the white-on-orange exception only.

### AA-safe CTA rule — LOCKED
- Primary CTA = **`#F28C38` fill + Charcoal text `#1A1A1A`** (≈7:1, passes). **Not white** — white-on-`#F28C38` ≈2.4:1 and fails AA.
- BG-01 §7 says "white on orange"; the accessibility floor overrides for this fill+text pairing. Honor the brand orange, fix the text to charcoal.
- If a white-on-orange instance is genuinely unavoidable, use `-700 #B45309` and prove ≥4.5:1. Default everywhere is charcoal-on-orange.
- **Amber `#E8A33D`:** retired from the homepage's CTA/accent role (orange takes it). The site-wide amber→orange propagation is a separate flagged phase — spec the homepage in orange only.

### Signature motif
One recurring, restrained mark: a **golden-hour horizon edge** — a 4px orange gradient rule (`linear-gradient(90deg, transparent, #F28C38 50%, transparent)`) at the foot of the hero and the top of the final-CTA band. Tweakable on/off. Spend the boldness in the photography, not decoration.

---

## 3. Primary CTA copy — locked
**"Get a Free Estimate — 48-Hour Response"** — used consistently (hero, Why-Sunset, final CTA). Never bare "Free estimate." Secondary CTAs: "View Our Work", "See more transformations", "Call (630) 946-9321".

---

## 4. Section-by-section spec (top → bottom)

**Navbar (over-hero state).** Concept A uses a **solid white dock** (`#fff`, 1px `#EAE4D8` bottom border) so it matches the other 80 pages — dark logo/links, orange "Get a Free Estimate" pill with charcoal text. (Navbar is otherwise out of scope; this only confirms the over-hero state works with the new hero.) If Concept B were chosen instead, it uses the translucent-over-photo state with white text.

**Hero — Concept A (chosen).** Full-width photo slot (one wide golden-hour hardscape establishing shot), left-anchored content over a left→right dark scrim. Eyebrow (service area) → H1 "Craft Your Outdoor Legacy" (Manrope 800, ~68px desktop) → orange rule + credential line → primary orange CTA + ghost "View Our Work" → a bottom trust strip (Family-run since 2000 · 25+ years · ◆ UNILOCK Authorized Contractor · Licensed & insured). Horizon-edge motif at the foot.
- **LCP / perf:** single image, not a carousel — keep hero image weight bounded (responsive `srcset`, `fetchpriority="high"`, preload the LCP source, modern format). Target Lighthouse **≥95 desktop AND mobile**. If a rotating carousel is ever reintroduced it must be reduced-motion-aware and image-weight-budgeted; the single image is preferred precisely to protect mobile LCP.
- **Concept B (alternative):** before/after split with an overlapping cream content card; same copy. Documented in the mockup; use only if Lazar overrides the A pick.

**Divisions block — "Four divisions. One accountable crew."** Per Lazar's review: **four uniform cards** in a single 4-col grid (photo slot + scrim, eyebrow, title, one-line desc, "Explore →"). Hardscape card carries the small ◆ UNILOCK chip. Each deep-links to its division. **Must degrade gracefully to 3** (3-col) if Waterproofing is later pulled — keep the grid `repeat(auto-fit/…)`-able. Labels follow the brief: **Residential / Commercial / Hardscape / Waterproofing** — see open decision D1.

**Trust / credentials band** (dark `#23231D`). Verifiable signals only. Left: heading "Credentials you can verify" + chips (Family-run since 2000 · 25+ years; Licensed & insured; service area; EN·ES bilingual). Right: a **prominent UNILOCK Authorized Contractor card** (badge asset slot, no year pending Erick) **and a real-Google-reviews slot** that renders real review cards when live, else falls back to the credentials. **Never** invented ratings, counts, or testimonials; never reintroduce the "DuPage Tribune" award.

**Before/After showcase** (cream `#F8F5EF`). "The transformation is the pitch." One featured before/after pair with a center divider handle + caption, then a 3-up thumbnail strip of recent projects (real photos at M.01). Before/after is BG-01's most persuasive content — give it real estate.

**Process** (white). "Design, build, maintain — one team." 3 numbered steps (Design → Build → Maintain) with orange step numerals on charcoal top-rules; reinforces the Creator/design-build pillar. One concise block — not gold-plated.

**Why Sunset** (stone `#EFEAE1`). The 8-point owner-vs-investor message kept in substance, restyled: sticky left intro + orange CTA, right column is a **numbered divider list** (not another identical card grid). Each point = circled green numeral + bold title + one line.

**Final CTA** (dark gradient). Horizon-edge motif on top. "Let's craft your outdoor legacy." + one orange CTA (charcoal text) + ghost "Call (630) 946-9321".

**Footer** — out of scope, untouched.

---

## 5. Copy direction
BG-01 voice — expert, neighborly, honest, proud; reads like a real person talking to a homeowner. Approved-phrase framing throughout. **Forbidden:** "cheapest," "best landscaper," discounts, vague superlatives, bare "Free estimate." Content facts honored: "Family-run since 2000 · 25+ years" (year is a slot — see D2); UNILOCK badge without a year (D3); no fake testimonials / ratings / counts / borrowed awards.

---

## 6. Accessibility contract (WCAG 2.2 AA — binding)
- **Contrast:** charcoal-on-orange CTA (§2); body/heading pairings ≥4.5:1; large text ≥3:1.
- **Focus:** visible `:focus-visible` ring ≥2px, ≥3:1 against its background, on every interactive element.
- **Tap targets:** ≥44–48px (all CTAs/nav specced ≥52–56px).
- **Never color-only:** every color-coded meaning is paired with a label/icon/shape (e.g. BEFORE/AFTER text labels, UNILOCK ◆ + text).
- **Reduced motion:** `prefers-reduced-motion` → opacity fades only, no slide/parallax; the horizon-edge motif is static.

## 7. Motion spec
Restrained. Section entrances: opacity fade + ≤8px rise, 320ms, `cubic-bezier(.22,.61,.36,1)`, **once** (no per-item scroll-fade on the heavy division/project grids — perf + taste). Hover on cards: 120ms ease-out lift ≤2px / scrim deepen. CTA hover: fill `#F28C38`→`#B45309`, 120ms. All disabled under reduced motion.

## 8. Performance contract
Target Lighthouse **≥95 desktop AND mobile** on the homepage. Hero is the known mobile-LCP ceiling: single bounded image, `fetchpriority="high"`, preload, responsive `srcset`, modern format. Below-hero sections are `next/dynamic`-able. No per-item scroll animation on grids. **Flag:** if real M.01 hero photography can't be delivered under the LCP budget, revisit hero image dimensions before launch.

## 9. Bilingual (`/es`)
EN + ES mockups. ES tagline and credential line are **slots pending native Spanish review** (`tú` register) — clearly marked in the ES mockup; do not ship machine-translated copy for these two lines. All other ES copy follows the EN structure 1:1.

## 10. Asset dependencies
1. **Real UNILOCK "Authorized Contractor" badge asset** (vector preferred) — replaces the badge slot in the trust band.
2. **M.01 photo library** — every photo slot (hero, divisions, before/after featured + thumbnails) is a placeholder until M.01 lands; this is the biggest visual + perf lift.
3. Confirmed division labels (D1), founding year (D2), UNILOCK year (D3) — see below.

## 11. Open decisions (no silent ratifications)
- **D1 — Division labels.** Brief §3/§6 says **Residential / Commercial / Hardscape / Waterproofing**; the live site shows **Landscape / Hardscape / Waterproofing / Snow Removal**. Mockup follows the brief. **Confirm with Lazar/Erick before Code.**
- **D2 — Founding year.** Using **2000** ("Family-run since 2000 · 25+ years"). BG-01 §2.1 says 1998. Treat the year as a slot Code can update on Erick's confirmation.
- **D3 — UNILOCK year.** Badge shown **without a year** pending Erick; add the year only when confirmed.
- **D4 — Division cards uniform.** Per Lazar's review the four division cards are **uniform** (one consistent treatment), overriding the brief's "genuine visual differentiation / not four identical tiles." Recorded as an owner decision.

## 12. Out of scope (respected)
No other page/template redesigned; global design system untouched beyond the orange token; AI chat widget, navbar internals, and footer untouched (only the navbar over-hero state is validated); no removed content reintroduced; site-wide brand-rename and amber→orange propagation are separate phases.
