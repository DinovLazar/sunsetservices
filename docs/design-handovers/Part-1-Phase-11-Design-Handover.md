# Part 1 — Phase 11 — About + Contact (Design Handover)

**Phase:** 1.11
**Type:** Design (Code follows in Phase 1.12)
**Operator:** Claude Design
**Reads from:** `Sunset-Services-Plan.md`, `Sunset-Services-Project-Instructions.md`, `Part-1-Phase-03-Design-Handover.md` (locked tokens), `Part-1-Phase-05-Design-Handover.md` (chrome contract), `Part-1-Phase-06-Design-Handover.md` (homepage patterns), `Part-1-Phase-07-Completion.md` (homepage Lighthouse-mobile gap), `Part-1-Phase-08-Design-Handover.md` (audience-landing + service-detail templates).
**Hands off to:** Claude Code, Phase 1.12.

---

## 0. Read this first

This handover designs **two pages** that live inside the locked Phase 1.05 chrome:

- **About** at `/about/` (and `/es/about/`) — the brand-story page. The trust surface for premium DuPage homeowners deciding whether to hand a 25-year family business a $40k patio install.
- **Contact** at `/contact/` (and `/es/contact/`) — the secondary, transactional surface. Phone, email, address, hours, a 4-field form, a map, and a Calendly placeholder.

Everything from Phase 1.03 (tokens, primitives, motion), 1.04 (motion components), 1.05 (chrome), 1.06 (homepage patterns), and 1.08 (audience + service-detail templates) is locked. **Compose; do not invent.** Every claim of authority in this document references a locked token name from Phase 1.03 — literal hex values appear only inside SVG `fill`/`stroke` attributes where SVG cannot consume custom properties.

The design bar from 1.06 still holds: "as professional as possible with no shortcuts." About is the trust page; Contact is the easy-conversion page. Both must feel as polished as the homepage and must hit Lighthouse ≥95 desktop **and mobile** on all four metrics — carrying forward the 1.07 homepage-mobile P=86 lesson (do not animate individual items; do not over-hydrate; static placeholder over third-party iframe in Part 1).

---

## 1. Scope and constraints

### In scope

- About (`/about/`) — every section, EN + ES strings, photography brief, schema spec, motion choreography, a11y audit, decisions surfaced.
- Contact (`/contact/`) — same, smaller scope.
- Shared components new to this phase: `ContactForm`, `MapPlaceholder`, `CalendlyPlaceholder`, `TeamCard`, `CredentialBadge`, `ServiceAreaStrip`. Specced in §11.

### Out of scope

- Real photography selection (Phase 2.04, Cowork from Erick's Drive).
- Final marketing prose (Erick polishes in Part 2).
- Real Calendly embed wiring (Phase 2.07) — this phase ships a UI placeholder only.
- Real Google Maps iframe — recommendation A (static placeholder) in Part 1; live iframe deferred to Part 2 (see D8 §12).
- Real ContactForm submission wiring (Part 2). Part 1 ships the visual states; submit is a no-op.
- Quote wizard UI (Phase 1.19).
- AI chat widget UI (Phase 1.19).
- Privacy / Terms (Phase 3.03).

### Locked from earlier phases — do not redesign

- All design tokens (1.03 §2–§7).
- All component primitives (1.03 §6): button, card, badge, breadcrumb, eyebrow chip, FAQ accordion, form fields. **No new variants.**
- Chrome (1.05): navbar, footer, language switcher, skip-link wrap.
- Section rhythm (1.03 §9): `py-20` desktop / `py-14` mobile, alternating `--color-bg` / `--color-bg-cream`, never two adjacent same-surface bands.
- Amber discipline (1.05 §1): navbar amber is chrome and does not count. Each body page gets **one** amber CTA.
- Motion (1.03 §7 + 1.04): `<AnimateIn>`, `<StaggerContainer>`, `<StaggerItem>`. Compose, do not invent.
- Homepage About teaser (1.06 §7): same brand voice, same warmth, same photographic register.
- FAQ accordion no-wrapper-per-item rule (1.08 §3.7) — applies if About uses an FAQ.

---

## 2. Page-level decisions

### 2.1 About — section order (locked)

**Hero → Brand story → Team → Credentials → Projects teaser → CTA.** Six sections.

Reasoning: this matches the trust pitch in narrative order — *who we are, where we came from, who you'd be working with, what proves it, what we've shipped, how to start.* The Plan-suggested optional "How we work" / process strip is **dropped** (D3 recommendation): every audience-landing and service-detail page already carries Process contextually (Phase 1.08 §3.3). About-level process duplicates without adding signal, and it dilutes the "people, not procedure" point the page is trying to make. The "Why us" pattern from the audience template would also duplicate; about is the *people* answer to "why us," not the *capability* answer.

### 2.2 Contact — section order (locked)

**Hero → Info + Form (two-column) → Map → Calendly placeholder → Service-area strip.** Five sections. **No CTA section** (D11 recommendation — the page IS the conversion surface; a redundant amber CTA below a contact form pointing to the same lead pipeline weakens both).

### 2.3 Surface alternation (per Phase 1.03 §9)

Both pages start on `--color-bg` (white) and strictly alternate. No two adjacent same-surface bands.

| About section        | Surface              | Notes |
|----------------------|----------------------|-------|
| Hero                 | `--color-bg`         | Photo-led; surface visible at top/bottom edge bands. |
| Brand story          | `--color-bg-cream`   | Carries homepage About teaser surface forward. |
| Team                 | `--color-bg`         | White lifts the team-card photos. |
| Credentials          | `--color-bg-cream`   | Alternation; sets the trust block apart from team. |
| Projects teaser      | `--color-bg`         | Matches homepage projects teaser surface. |
| CTA                  | `--color-bg-cream`   | Same cream-CTA pattern the homepage chose (D6 ratification, 1.06 §17). |

| Contact section          | Surface              | Notes |
|--------------------------|----------------------|-------|
| Hero                     | `--color-bg`         | Even if no-photo (D7 = no-photo recommended), white is the right register for a transactional page. |
| Info + Form              | `--color-bg-cream`   | Cream lifts the form card and the info block both. |
| Map                      | `--color-bg`         | Static placeholder image sits cleanly on white. |
| Calendly placeholder     | `--color-bg-cream`   | Cream draws the eye to the booking block. |
| Service-area strip       | `--color-bg`         | Closes on white before the footer (which is `--color-bg-charcoal`). |

### 2.4 Amber discipline per page

- **About:** one body amber CTA — the §3.7 CTA section. Destination `/request-quote/` (D6 recommendation).
- **Contact:** **zero** body amber CTAs (D11 recommendation). The locked navbar amber is the only amber affordance the page exposes. The form's submit is **primary green**, not amber, per Phase 1.03 §6.1 — submit is not a marketing CTA.

### 2.5 Featured-card usage (per Phase 1.06 §2.4)

Featured cards stay forbidden on both pages. The team grid in §3.3 is a 3-card peer grid, not a featured-plus-flanker layout — pulling Erick out as a featured card communicates "boss vs. staff," which is exactly the wrong note for a family-run trust pitch. Equal weight reads as a team.

---

## 3. About page — sections, mockups, specs

All SVG mockups use locked Phase 1.03 token names in annotations; literal hex appears only inside `fill`/`stroke` attributes (SVG can't consume CSS custom properties).

Recurring SVG legend:
- Gray rectangles with hatching = photo placeholder slots (`[Cowork to source from Drive in Phase 2.04]`).
- Dashed teal lines = spacing rulers labelled with `--spacing-*` tokens.
- Magenta callouts = type-token annotations (`--text-h2-d`, etc.).
- Dotted outlines = component-primitive boundaries.

### 3.1 Hero

**Decisions (lock):**
- **Height:** 50vh desktop / 40vh mobile (smaller than homepage 75/85; About is a trust-and-context page, not a brand-impression page).
- **Photo subject (D1 recommendation):** **Erick on-site, golden-hour, working — wide enough to read environment.** Not a posed studio portrait; not a property-only shot. Portrait of *the person you'd be doing business with*, in his element. Property-only fails the "human" register; Erick + crew dilutes the "this is the owner" signal.
- **Heading (D recommended):** **"Family-run, since 2000."** Direct, factual, present-tense. Alternative considered: "Sunset Services, in our own words." — softer but less committal. Pick the factual one; the warmth comes from the photo and the body copy.
- **Trust microbar:** **drop it.** The whole page is the trust statement; repeating the homepage hero microbar here weakens both.
- **CTA in hero:** **none.** Recommendation matches §1 brief. Page-level amber CTA at the bottom does the conversion.

**Desktop SVG — `/about/` hero (1280 × 640, 50vh at 1280×1280 viewport reference):**

```svg
<svg viewBox="0 0 1280 640" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="About hero — desktop">
  <!-- Surface: --color-bg #FAF7F1 (chrome offset above; hero is full-bleed within main) -->
  <rect width="1280" height="640" fill="#FAF7F1"/>

  <!-- Photo slot: 16:9 master, focal: Erick mid-frame, on-site, golden hour -->
  <rect x="0" y="0" width="1280" height="640" fill="#D8D2C4"/>
  <g stroke="#B8B0A0" stroke-width="1">
    <line x1="0" y1="0" x2="1280" y2="640"/>
    <line x1="1280" y1="0" x2="0" y2="640"/>
  </g>
  <!-- bottom-up dark gradient (per Phase 1.03 §3 photo-overlay rule) -->
  <defs>
    <linearGradient id="heroGrad" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%"  stop-color="#1A1A1A" stop-opacity="0.55"/>
      <stop offset="55%" stop-color="#1A1A1A" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="#1A1A1A" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="1280" height="640" fill="url(#heroGrad)"/>

  <!-- Photo slot label -->
  <rect x="40" y="40" width="240" height="28" fill="#1A1A1A" fill-opacity="0.6" rx="4"/>
  <text x="52" y="59" font-family="ui-monospace,monospace" font-size="13" fill="#FAF7F1">photo: about.hero (16:9)</text>

  <!-- Eyebrow chip (small, brand) -->
  <rect x="80" y="376" width="120" height="26" rx="13" fill="#FAF7F1" fill-opacity="0.92"/>
  <text x="140" y="394" font-family="ui-sans-serif" font-size="12" fill="#2F5D27" text-anchor="middle" font-weight="600" letter-spacing="1.4">ABOUT US</text>

  <!-- H1 — --text-h1-d (52/56, weight 600), color: --color-text-on-dark -->
  <text x="80" y="466" font-family="Fraunces,serif" font-size="52" font-weight="600" fill="#FAF7F1">Family-run, since 2000.</text>

  <!-- Lead — --text-body-lg, --color-text-on-dark @ 0.92 -->
  <text x="80" y="510" font-family="ui-sans-serif" font-size="20" fill="#FAF7F1" fill-opacity="0.92">Twenty-five years on DuPage County properties.</text>
  <text x="80" y="538" font-family="ui-sans-serif" font-size="20" fill="#FAF7F1" fill-opacity="0.92">Same crews. Same 6:30 a.m. start. No subcontracted surprises.</text>

  <!-- Annotation -->
  <g font-family="ui-monospace,monospace" font-size="11" fill="#C2185B">
    <text x="280" y="394">eyebrow · --text-eyebrow · --color-sunset-green-700 on cream chip</text>
    <text x="660" y="466">H1 · --text-h1-d · --color-text-on-dark</text>
    <text x="660" y="510">lead · --text-body-lg · --color-text-on-dark / 0.92</text>
    <text x="40" y="620">surface: photo + bottom-up overlay (Phase 1.03 §3 photo-overlay rule)</text>
  </g>
</svg>
```

**Mobile SVG — `/about/` hero (390 × 560, 40vh × proportional scroll):**

```svg
<svg viewBox="0 0 390 560" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="About hero — mobile">
  <rect width="390" height="560" fill="#FAF7F1"/>
  <rect x="0" y="0" width="390" height="560" fill="#D8D2C4"/>
  <g stroke="#B8B0A0" stroke-width="1">
    <line x1="0" y1="0" x2="390" y2="560"/><line x1="390" y1="0" x2="0" y2="560"/>
  </g>
  <defs><linearGradient id="hMG" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0%" stop-color="#1A1A1A" stop-opacity="0.6"/>
    <stop offset="60%" stop-color="#1A1A1A" stop-opacity="0.18"/>
    <stop offset="100%" stop-color="#1A1A1A" stop-opacity="0"/>
  </linearGradient></defs>
  <rect width="390" height="560" fill="url(#hMG)"/>
  <rect x="20" y="20" width="180" height="22" rx="4" fill="#1A1A1A" fill-opacity="0.6"/>
  <text x="28" y="36" font-family="ui-monospace,monospace" font-size="11" fill="#FAF7F1">photo: about.hero (1:1 mobile crop)</text>

  <rect x="24" y="354" width="106" height="22" rx="11" fill="#FAF7F1" fill-opacity="0.92"/>
  <text x="77" y="370" font-family="ui-sans-serif" font-size="11" fill="#2F5D27" text-anchor="middle" font-weight="600" letter-spacing="1.3">ABOUT US</text>

  <text x="24" y="424" font-family="Fraunces,serif" font-size="34" font-weight="600" fill="#FAF7F1">Family-run,</text>
  <text x="24" y="464" font-family="Fraunces,serif" font-size="34" font-weight="600" fill="#FAF7F1">since 2000.</text>
  <text x="24" y="500" font-family="ui-sans-serif" font-size="15" fill="#FAF7F1" fill-opacity="0.92">25 years on DuPage County properties.</text>
  <text x="24" y="520" font-family="ui-sans-serif" font-size="15" fill="#FAF7F1" fill-opacity="0.92">Same crews. Same 6:30 a.m. start.</text>

  <g font-family="ui-monospace,monospace" font-size="9" fill="#C2185B">
    <text x="24" y="548">H1 · --text-h1-m  ·  lead · --text-body-md  ·  no in-hero CTA</text>
  </g>
</svg>
```

### 3.2 Brand story (history)

**Decisions (lock):**
- **Layout (D2 recommendation):** **two-column desktop (image + copy), single-column mobile.** The three-act vertical layout (founding / handover / hardscape) is genuinely tempting — it'd give the page narrative spine. But it forces 3 photo slots Cowork has to fill, and the "founding moment" photo (Nick in 2000) likely doesn't exist at usable resolution. Two-column matches the homepage About teaser surface, which is the clearest pattern carry-over. **Argued alternative below if Erick has the historical photos.**
- **Image:** single image slot, 4:5 portrait, focal: Erick + Nick together on-site (or, if not feasible, Erick alone outdoors with the company truck visible). Surface: `--color-bg-cream`.
- **Copy budget:** 3 paragraphs, ≤3 sentences each, ≤55 words each. Cumulative ≤165 words EN.
- **Required facts (cross-check Plan §2):** founded by Nick in 2000; Erick took over in 2018; Marcin runs the hardscape division (Unilock-authorized); 25+ years total; long-tenure crew; 6:30 a.m. start. **Discrepancy surfaced in §12 D15:** Plan §2 says "since 2000" → 25 years (2026 − 2001) is the safe phrasing; "26 years in 2026" is also defensible. Recommendation: lock the copy to **"since 2000"** + **"25+ years"** so age math doesn't drift year-over-year.

**Desktop SVG — Brand story (1280 × 720, on `--color-bg-cream`):**

```svg
<svg viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="About brand story — desktop">
  <rect width="1280" height="720" fill="#F0E9DA"/>
  <!-- vertical padding: --spacing-20 (80px) -->
  <line x1="40" y1="0" x2="40" y2="80" stroke="#2F5D27" stroke-dasharray="3 3" stroke-width="1"/>
  <text x="48" y="42" font-family="ui-monospace,monospace" font-size="11" fill="#2F5D27">--spacing-20 (80px)</text>

  <!-- Two-column container: max-w 1200, grid 6-6, gap-12 -->
  <!-- Left column: image 4:5 portrait, 480 × 600 -->
  <rect x="80" y="80" width="480" height="600" fill="#D8D2C4"/>
  <g stroke="#B8B0A0" stroke-width="1">
    <line x1="80" y1="80" x2="560" y2="680"/><line x1="560" y1="80" x2="80" y2="680"/>
  </g>
  <rect x="100" y="100" width="220" height="22" rx="4" fill="#1A1A1A" fill-opacity="0.55"/>
  <text x="108" y="116" font-family="ui-monospace,monospace" font-size="11" fill="#FAF7F1">photo: about.brand-story (4:5)</text>

  <!-- Right column: copy block, 600px wide @ x=624 -->
  <rect x="624" y="120" width="116" height="22" rx="11" fill="#FAF7F1"/>
  <text x="682" y="136" font-family="ui-sans-serif" font-size="11" fill="#2F5D27" text-anchor="middle" font-weight="600" letter-spacing="1.3">OUR STORY</text>

  <!-- H2 — --text-h2-d (40/44, 600), color: --color-sunset-green-700 -->
  <text x="624" y="200" font-family="Fraunces,serif" font-size="40" font-weight="600" fill="#2F5D27">Started by Nick.</text>
  <text x="624" y="244" font-family="Fraunces,serif" font-size="40" font-weight="600" fill="#2F5D27">Run today by Erick.</text>

  <!-- Body paragraphs · --text-body, --color-text-secondary #4A4A4A -->
  <g font-family="ui-sans-serif" font-size="17" fill="#4A4A4A">
    <text x="624" y="298">Nick Valle started the company in 2000 with one truck and a maintenance route</text>
    <text x="624" y="320">across Aurora and Naperville. The first contract is still active, twenty-five</text>
    <text x="624" y="342">years later.</text>

    <text x="624" y="386">In 2018, Erick — Nick's son — took over operations. Same crew, same 6:30 a.m.</text>
    <text x="624" y="408">start, same standard for what a finished property looks like. No subcontracted</text>
    <text x="624" y="430">surprises; the people who measure your project are the people who do it.</text>

    <text x="624" y="474">Marcin joined to lead the hardscape division — Unilock Authorized installs,</text>
    <text x="624" y="496">paver patios, retaining walls, fire features. The trucks share a yard;</text>
    <text x="624" y="518">your job stays one phone call long.</text>
  </g>

  <!-- Inline link to /residential/ + /hardscape/ — --color-sunset-green-700 underline -->
  <text x="624" y="572" font-family="ui-sans-serif" font-size="15" fill="#2F5D27" text-decoration="underline">See residential services →</text>
  <text x="848" y="572" font-family="ui-sans-serif" font-size="15" fill="#2F5D27" text-decoration="underline">See hardscape services →</text>

  <line x1="40" y1="640" x2="40" y2="720" stroke="#2F5D27" stroke-dasharray="3 3"/>
  <text x="48" y="700" font-family="ui-monospace,monospace" font-size="11" fill="#2F5D27">--spacing-20</text>

  <g font-family="ui-monospace,monospace" font-size="11" fill="#C2185B">
    <text x="624" y="156">eyebrow · --text-eyebrow</text>
    <text x="900" y="244">H2 · --text-h2-d · --color-sunset-green-700</text>
    <text x="900" y="320">--text-body · --color-text-secondary · max-w 60ch</text>
  </g>
</svg>
```

**Mobile SVG — Brand story (390 × 1100):**

```svg
<svg viewBox="0 0 390 1100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="About brand story — mobile">
  <rect width="390" height="1100" fill="#F0E9DA"/>
  <!-- py-14 (56px) -->
  <text x="20" y="36" font-family="ui-monospace,monospace" font-size="10" fill="#2F5D27">--spacing-14 (56px)</text>

  <rect x="20" y="56" width="350" height="438" fill="#D8D2C4"/>
  <g stroke="#B8B0A0"><line x1="20" y1="56" x2="370" y2="494"/><line x1="370" y1="56" x2="20" y2="494"/></g>
  <text x="32" y="78" font-family="ui-monospace,monospace" font-size="10" fill="#FAF7F1">photo: about.brand-story (4:5)</text>

  <rect x="20" y="526" width="100" height="20" rx="10" fill="#FAF7F1"/>
  <text x="70" y="540" font-family="ui-sans-serif" font-size="10" fill="#2F5D27" text-anchor="middle" font-weight="600" letter-spacing="1.2">OUR STORY</text>

  <text x="20" y="592" font-family="Fraunces,serif" font-size="28" font-weight="600" fill="#2F5D27">Started by Nick.</text>
  <text x="20" y="624" font-family="Fraunces,serif" font-size="28" font-weight="600" fill="#2F5D27">Run today by Erick.</text>

  <g font-family="ui-sans-serif" font-size="15" fill="#4A4A4A">
    <text x="20" y="676">Nick Valle started the company in 2000 with</text>
    <text x="20" y="696">one truck and a maintenance route across</text>
    <text x="20" y="716">Aurora and Naperville. The first contract is</text>
    <text x="20" y="736">still active, twenty-five years later.</text>

    <text x="20" y="784">In 2018, Erick — Nick's son — took over.</text>
    <text x="20" y="804">Same crew, same 6:30 a.m. start. No</text>
    <text x="20" y="824">subcontracted surprises.</text>

    <text x="20" y="872">Marcin leads the hardscape division —</text>
    <text x="20" y="892">Unilock-Authorized patios, retaining walls,</text>
    <text x="20" y="912">fire features. One phone call.</text>
  </g>

  <text x="20" y="968" font-family="ui-sans-serif" font-size="14" fill="#2F5D27" text-decoration="underline">See residential services →</text>
  <text x="20" y="1000" font-family="ui-sans-serif" font-size="14" fill="#2F5D27" text-decoration="underline">See hardscape services →</text>
</svg>
```

### 3.3 Team

**Decisions (lock):**
- **Layout (D4):** **3-card peer grid at desktop, 1-column stack at mobile.** Equal weight (no featured card). Surface for cards: default white card on the cream-or-white section surface; on this page §3.3 sits on `--color-bg` (white), so cards use the **`card--cream` variant** for lift (per Phase 1.03 §6.3).
- **Photo aspect:** **4:5 portrait, all three identical.** 1:1 squares feel like LinkedIn avatars; 4:5 reads as people, not headshots.
- **Order:** **Erick → Nick → Marcin.** Current owner foregrounded. Nick's "founder" badge is the bridge between past and present; Marcin closes the trio as the hardscape lead.
- **Card content:** photo (4:5), name (H3, `--text-h3-d`), role (eyebrow chip in green-50/700), 1–2 sentence bio (`--text-body-md`).
- **Future-proof:** card grid uses `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`. Adding a 4th member (a crew lead profile in a future phase) re-flows to a 2×2 without rework.
- **Marcin's last name:** unknown — D13 surfaced; Cowork to confirm before Phase 1.12.

**Desktop SVG — Team (1280 × 760, on `--color-bg`):**

```svg
<svg viewBox="0 0 1280 760" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="About team — desktop">
  <rect width="1280" height="760" fill="#FAF7F1"/>

  <text x="80" y="118" font-family="ui-sans-serif" font-size="13" fill="#2F5D27" font-weight="600" letter-spacing="1.4">THE TEAM</text>
  <text x="80" y="174" font-family="Fraunces,serif" font-size="40" font-weight="600" fill="#1A1A1A">The people you'd be working with.</text>

  <!-- 3 cards, gap-8 (32px), each 360w × 480h, x=80/472/864 -->
  <g>
    <!-- Erick -->
    <rect x="80" y="240" width="360" height="480" rx="8" fill="#F0E9DA" stroke="#E0D9C5"/>
    <rect x="80" y="240" width="360" height="288" fill="#D8D2C4"/>
    <g stroke="#B8B0A0"><line x1="80" y1="240" x2="440" y2="528"/><line x1="440" y1="240" x2="80" y2="528"/></g>
    <text x="92" y="262" font-family="ui-monospace,monospace" font-size="11" fill="#FAF7F1">photo: team.erick (4:5)</text>

    <rect x="104" y="552" width="60" height="22" rx="11" fill="#DCE8D5"/>
    <text x="134" y="568" font-family="ui-sans-serif" font-size="11" fill="#2F5D27" text-anchor="middle" font-weight="600" letter-spacing="1.2">OWNER</text>

    <text x="104" y="608" font-family="Fraunces,serif" font-size="24" font-weight="600" fill="#1A1A1A">Erick Valle</text>
    <g font-family="ui-sans-serif" font-size="15" fill="#4A4A4A">
      <text x="104" y="644">Took over operations in 2018. Runs every</text>
      <text x="104" y="666">estimate himself — you meet him before you</text>
      <text x="104" y="688">sign anything.</text>
    </g>

    <!-- Nick -->
    <rect x="472" y="240" width="360" height="480" rx="8" fill="#F0E9DA" stroke="#E0D9C5"/>
    <rect x="472" y="240" width="360" height="288" fill="#D8D2C4"/>
    <g stroke="#B8B0A0"><line x1="472" y1="240" x2="832" y2="528"/><line x1="832" y1="240" x2="472" y2="528"/></g>
    <text x="484" y="262" font-family="ui-monospace,monospace" font-size="11" fill="#FAF7F1">photo: team.nick (4:5)</text>

    <rect x="496" y="552" width="68" height="22" rx="11" fill="#DCE8D5"/>
    <text x="530" y="568" font-family="ui-sans-serif" font-size="11" fill="#2F5D27" text-anchor="middle" font-weight="600" letter-spacing="1.2">FOUNDER</text>

    <text x="496" y="608" font-family="Fraunces,serif" font-size="24" font-weight="600" fill="#1A1A1A">Nick Valle</text>
    <g font-family="ui-sans-serif" font-size="15" fill="#4A4A4A">
      <text x="496" y="644">Started Sunset Services in 2000. Still on-site</text>
      <text x="496" y="666">most weeks. The senior eye on the</text>
      <text x="496" y="688">complicated jobs.</text>
    </g>

    <!-- Marcin -->
    <rect x="864" y="240" width="360" height="480" rx="8" fill="#F0E9DA" stroke="#E0D9C5"/>
    <rect x="864" y="240" width="360" height="288" fill="#D8D2C4"/>
    <g stroke="#B8B0A0"><line x1="864" y1="240" x2="1224" y2="528"/><line x1="1224" y1="240" x2="864" y2="528"/></g>
    <text x="876" y="262" font-family="ui-monospace,monospace" font-size="11" fill="#FAF7F1">photo: team.marcin (4:5)</text>

    <rect x="888" y="552" width="120" height="22" rx="11" fill="#DCE8D5"/>
    <text x="948" y="568" font-family="ui-sans-serif" font-size="11" fill="#2F5D27" text-anchor="middle" font-weight="600" letter-spacing="1.2">HARDSCAPE LEAD</text>

    <text x="888" y="608" font-family="Fraunces,serif" font-size="24" font-weight="600" fill="#1A1A1A">Marcin [TBR]</text>
    <g font-family="ui-sans-serif" font-size="15" fill="#4A4A4A">
      <text x="888" y="644">Leads the Unilock-Authorized hardscape</text>
      <text x="888" y="666">division. Patios, walls, fire features —</text>
      <text x="888" y="688">specs to install.</text>
    </g>
  </g>

  <g font-family="ui-monospace,monospace" font-size="11" fill="#C2185B">
    <text x="80" y="216">card · variant: card--cream  ·  --radius-md  ·  --shadow-soft</text>
    <text x="80" y="744">grid: repeat(auto-fit, minmax(280px, 1fr)) · gap: --spacing-8</text>
  </g>
</svg>
```

**Mobile SVG — Team (390 × 1660, three stacked cards):**

```svg
<svg viewBox="0 0 390 1660" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="About team — mobile">
  <rect width="390" height="1660" fill="#FAF7F1"/>
  <text x="20" y="80" font-family="ui-sans-serif" font-size="11" fill="#2F5D27" font-weight="600" letter-spacing="1.3">THE TEAM</text>
  <text x="20" y="124" font-family="Fraunces,serif" font-size="28" font-weight="600" fill="#1A1A1A">The people you'd be</text>
  <text x="20" y="156" font-family="Fraunces,serif" font-size="28" font-weight="600" fill="#1A1A1A">working with.</text>

  <!-- Card 1 — Erick -->
  <rect x="20" y="200" width="350" height="440" rx="8" fill="#F0E9DA" stroke="#E0D9C5"/>
  <rect x="20" y="200" width="350" height="280" fill="#D8D2C4"/>
  <g stroke="#B8B0A0"><line x1="20" y1="200" x2="370" y2="480"/><line x1="370" y1="200" x2="20" y2="480"/></g>
  <text x="32" y="220" font-family="ui-monospace,monospace" font-size="10" fill="#FAF7F1">photo: team.erick (4:5)</text>
  <rect x="36" y="500" width="56" height="20" rx="10" fill="#DCE8D5"/>
  <text x="64" y="514" font-family="ui-sans-serif" font-size="10" fill="#2F5D27" text-anchor="middle" font-weight="600" letter-spacing="1.2">OWNER</text>
  <text x="36" y="552" font-family="Fraunces,serif" font-size="22" font-weight="600" fill="#1A1A1A">Erick Valle</text>
  <text x="36" y="586" font-family="ui-sans-serif" font-size="14" fill="#4A4A4A">Took over operations in 2018. Runs every</text>
  <text x="36" y="606" font-family="ui-sans-serif" font-size="14" fill="#4A4A4A">estimate himself — you meet him before</text>
  <text x="36" y="626" font-family="ui-sans-serif" font-size="14" fill="#4A4A4A">you sign anything.</text>

  <!-- Card 2 — Nick -->
  <rect x="20" y="680" width="350" height="440" rx="8" fill="#F0E9DA" stroke="#E0D9C5"/>
  <rect x="20" y="680" width="350" height="280" fill="#D8D2C4"/>
  <g stroke="#B8B0A0"><line x1="20" y1="680" x2="370" y2="960"/><line x1="370" y1="680" x2="20" y2="960"/></g>
  <text x="32" y="700" font-family="ui-monospace,monospace" font-size="10" fill="#FAF7F1">photo: team.nick (4:5)</text>
  <rect x="36" y="980" width="64" height="20" rx="10" fill="#DCE8D5"/>
  <text x="68" y="994" font-family="ui-sans-serif" font-size="10" fill="#2F5D27" text-anchor="middle" font-weight="600" letter-spacing="1.2">FOUNDER</text>
  <text x="36" y="1032" font-family="Fraunces,serif" font-size="22" font-weight="600" fill="#1A1A1A">Nick Valle</text>
  <text x="36" y="1066" font-family="ui-sans-serif" font-size="14" fill="#4A4A4A">Started Sunset Services in 2000.</text>
  <text x="36" y="1086" font-family="ui-sans-serif" font-size="14" fill="#4A4A4A">Still on-site most weeks. Senior eye on</text>
  <text x="36" y="1106" font-family="ui-sans-serif" font-size="14" fill="#4A4A4A">complicated jobs.</text>

  <!-- Card 3 — Marcin -->
  <rect x="20" y="1160" width="350" height="440" rx="8" fill="#F0E9DA" stroke="#E0D9C5"/>
  <rect x="20" y="1160" width="350" height="280" fill="#D8D2C4"/>
  <g stroke="#B8B0A0"><line x1="20" y1="1160" x2="370" y2="1440"/><line x1="370" y1="1160" x2="20" y2="1440"/></g>
  <text x="32" y="1180" font-family="ui-monospace,monospace" font-size="10" fill="#FAF7F1">photo: team.marcin (4:5)</text>
  <rect x="36" y="1460" width="116" height="20" rx="10" fill="#DCE8D5"/>
  <text x="94" y="1474" font-family="ui-sans-serif" font-size="10" fill="#2F5D27" text-anchor="middle" font-weight="600" letter-spacing="1.2">HARDSCAPE LEAD</text>
  <text x="36" y="1512" font-family="Fraunces,serif" font-size="22" font-weight="600" fill="#1A1A1A">Marcin [TBR]</text>
  <text x="36" y="1546" font-family="ui-sans-serif" font-size="14" fill="#4A4A4A">Leads Unilock-Authorized hardscape.</text>
  <text x="36" y="1566" font-family="ui-sans-serif" font-size="14" fill="#4A4A4A">Patios, walls, fire features.</text>
</svg>
```

### 3.4 Credentials

**Decisions (lock):**
- **Items (4 fixed slots, 1 conditional):** Unilock Authorized Contractor (locked inline SVG mark per 1.03 §8.3) · 25+ years in business · Top 5 Landscaping — DuPage Tribune 2024 · Google reviews 4.8/X (placeholder for aggregate). Conditional fifth slot (BBB / industry membership) — Cowork populates in 2.04; if Erick has none, the slot is removed and the 4 reflow.
- **Layout (D5):** **4-column row at desktop, 2×2 at mobile.** A row reads as a credentials *stripe* — the right register for trust signals; a 2×2 desktop grid breaks the visual weight unevenly when only 4 items exist. With a 5th conditional item, desktop reflows to 5-up (no divider rule needed); mobile becomes a 1-column stack of 5.
- **Surface:** sits on `--color-bg-cream` (per §2.3 alternation). Each badge uses the `card--cream` *with* a subtle `--shadow-soft`, sized for icon-on-top labels.

**Desktop SVG — Credentials (1280 × 460):**

```svg
<svg viewBox="0 0 1280 460" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="About credentials — desktop">
  <rect width="1280" height="460" fill="#F0E9DA"/>
  <text x="80" y="100" font-family="ui-sans-serif" font-size="13" fill="#2F5D27" font-weight="600" letter-spacing="1.4">CREDENTIALS</text>
  <text x="80" y="148" font-family="Fraunces,serif" font-size="32" font-weight="600" fill="#2F5D27">Verifiable, not just claimed.</text>

  <!-- 4 columns, gap-8, x=80/376/672/968, w=272 each, h=200 -->
  <g>
    <!-- Unilock -->
    <rect x="80" y="200" width="272" height="200" rx="8" fill="#FAF7F1" stroke="#E0D9C5"/>
    <!-- Unilock mark — abstract chevron paver inline svg (placeholder; locked mark per 1.03 §8.3) -->
    <g transform="translate(176 230)">
      <rect x="0" y="0" width="40" height="14" fill="#2F5D27"/>
      <rect x="20" y="18" width="40" height="14" fill="#2F5D27"/>
      <rect x="0" y="36" width="40" height="14" fill="#2F5D27"/>
    </g>
    <text x="216" y="320" font-family="Fraunces,serif" font-size="18" font-weight="600" fill="#1A1A1A" text-anchor="middle">Unilock Authorized</text>
    <text x="216" y="346" font-family="Fraunces,serif" font-size="18" font-weight="600" fill="#1A1A1A" text-anchor="middle">Contractor</text>
    <text x="216" y="376" font-family="ui-sans-serif" font-size="13" fill="#4A4A4A" text-anchor="middle">Hardscape division</text>

    <!-- 25+ Years -->
    <rect x="376" y="200" width="272" height="200" rx="8" fill="#FAF7F1" stroke="#E0D9C5"/>
    <text x="512" y="284" font-family="Fraunces,serif" font-size="56" font-weight="600" fill="#2F5D27" text-anchor="middle">25+</text>
    <text x="512" y="328" font-family="Fraunces,serif" font-size="20" font-weight="600" fill="#1A1A1A" text-anchor="middle">years in business</text>
    <text x="512" y="356" font-family="ui-sans-serif" font-size="13" fill="#4A4A4A" text-anchor="middle">Family-run since 2000</text>

    <!-- Top 5 — DuPage Tribune -->
    <rect x="672" y="200" width="272" height="200" rx="8" fill="#FAF7F1" stroke="#E0D9C5"/>
    <text x="808" y="262" font-family="Fraunces,serif" font-size="36" font-weight="600" fill="#2F5D27" text-anchor="middle">Top 5</text>
    <text x="808" y="306" font-family="Fraunces,serif" font-size="18" font-weight="600" fill="#1A1A1A" text-anchor="middle">Landscaping</text>
    <text x="808" y="334" font-family="ui-sans-serif" font-size="13" fill="#4A4A4A" text-anchor="middle">DuPage Tribune · 2024</text>

    <!-- Google reviews -->
    <rect x="968" y="200" width="272" height="200" rx="8" fill="#FAF7F1" stroke="#E0D9C5"/>
    <text x="1104" y="262" font-family="Fraunces,serif" font-size="44" font-weight="600" fill="#E8A33D" text-anchor="middle">★ 4.8</text>
    <text x="1104" y="306" font-family="Fraunces,serif" font-size="18" font-weight="600" fill="#1A1A1A" text-anchor="middle">Google reviews</text>
    <text x="1104" y="334" font-family="ui-sans-serif" font-size="13" fill="#4A4A4A" text-anchor="middle">[count] verified reviews</text>
  </g>

  <g font-family="ui-monospace,monospace" font-size="11" fill="#C2185B">
    <text x="80" y="430">CredentialBadge component · single &lt;AnimateIn fade-up&gt; on the row, NOT staggered (per Phase 1.07)</text>
  </g>
</svg>
```

**Mobile SVG — Credentials (390 × 880, 2×2):**

```svg
<svg viewBox="0 0 390 880" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="About credentials — mobile">
  <rect width="390" height="880" fill="#F0E9DA"/>
  <text x="20" y="76" font-family="ui-sans-serif" font-size="11" fill="#2F5D27" font-weight="600" letter-spacing="1.3">CREDENTIALS</text>
  <text x="20" y="116" font-family="Fraunces,serif" font-size="24" font-weight="600" fill="#2F5D27">Verifiable, not</text>
  <text x="20" y="146" font-family="Fraunces,serif" font-size="24" font-weight="600" fill="#2F5D27">just claimed.</text>

  <!-- 2x2 grid, x=20/200, y=200/440, 170w × 200h, gap-3 -->
  <rect x="20" y="200" width="170" height="200" rx="8" fill="#FAF7F1" stroke="#E0D9C5"/>
  <g transform="translate(80 224)">
    <rect x="0" y="0" width="28" height="10" fill="#2F5D27"/><rect x="14" y="14" width="28" height="10" fill="#2F5D27"/><rect x="0" y="28" width="28" height="10" fill="#2F5D27"/>
  </g>
  <text x="105" y="316" font-family="Fraunces,serif" font-size="14" font-weight="600" fill="#1A1A1A" text-anchor="middle">Unilock</text>
  <text x="105" y="336" font-family="Fraunces,serif" font-size="14" font-weight="600" fill="#1A1A1A" text-anchor="middle">Authorized</text>
  <text x="105" y="368" font-family="ui-sans-serif" font-size="11" fill="#4A4A4A" text-anchor="middle">Hardscape</text>

  <rect x="200" y="200" width="170" height="200" rx="8" fill="#FAF7F1" stroke="#E0D9C5"/>
  <text x="285" y="284" font-family="Fraunces,serif" font-size="44" font-weight="600" fill="#2F5D27" text-anchor="middle">25+</text>
  <text x="285" y="320" font-family="Fraunces,serif" font-size="14" font-weight="600" fill="#1A1A1A" text-anchor="middle">years in business</text>
  <text x="285" y="350" font-family="ui-sans-serif" font-size="11" fill="#4A4A4A" text-anchor="middle">Since 2000</text>

  <rect x="20" y="440" width="170" height="200" rx="8" fill="#FAF7F1" stroke="#E0D9C5"/>
  <text x="105" y="500" font-family="Fraunces,serif" font-size="28" font-weight="600" fill="#2F5D27" text-anchor="middle">Top 5</text>
  <text x="105" y="538" font-family="Fraunces,serif" font-size="14" font-weight="600" fill="#1A1A1A" text-anchor="middle">Landscaping</text>
  <text x="105" y="568" font-family="ui-sans-serif" font-size="11" fill="#4A4A4A" text-anchor="middle">DuPage Tribune · 2024</text>

  <rect x="200" y="440" width="170" height="200" rx="8" fill="#FAF7F1" stroke="#E0D9C5"/>
  <text x="285" y="500" font-family="Fraunces,serif" font-size="32" font-weight="600" fill="#E8A33D" text-anchor="middle">★ 4.8</text>
  <text x="285" y="538" font-family="Fraunces,serif" font-size="14" font-weight="600" fill="#1A1A1A" text-anchor="middle">Google reviews</text>
  <text x="285" y="568" font-family="ui-sans-serif" font-size="11" fill="#4A4A4A" text-anchor="middle">[count] verified</text>
</svg>
```

### 3.5 Process / "How we work" strip — DROPPED

Recommendation accepted: **skip on About** (D3). Argued in §2.1. The audience-landing and service-detail templates already carry contextual Process — duplicating a generic version on About adds noise without trust signal.

If Chat overrides D3 to keep it: spec lives at the bottom of §3.5 in a future revision. The 5-step strip pattern from Phase 1.08 §3.3 (number badge + label + 1-line caption, single `<StaggerContainer>` wrapping 5 `<StaggerItem>`s, 80ms stagger) ports unchanged. Surface would flip to `--color-bg` and Credentials would move to white, Brand-story to cream — alternation re-resolves cleanly.

### 3.6 Projects teaser carry-over

**Decision (lock):** **reuse `HomeProjectsTeaser` literally** (Phase 1.06 §8) under a generalized name `ProjectsTeaser` if Code is willing to refactor — otherwise ship as-is and rename in a Part-2 cleanup. **No new component, no separate curation** for About in Part 1. The same 6 placeholder tiles render on both surfaces. Rationale: a custom "About-curated" set adds editorial overhead Erick has to maintain forever; the homepage curation already leans toward signature jobs, which is what About wants too. Cowork can split the curation later if it earns its weight.

**SVGs:** Identical to Phase 1.06 §8 mockups (3×2 grid desktop, 1-column stack mobile). No new mockup needed — surface here is `--color-bg`, matching the homepage's surface choice for the projects teaser.

### 3.7 CTA section

**Decisions (lock):**
- **Reuse pattern:** wrap `HomeCTA` in a thin `AboutCTA` component that overrides only the copy strings; structure (eyebrow, H2, body, amber × lg primary + green ghost tel: secondary) is identical to homepage 1.06 §9.
- **Surface:** `--color-bg-cream` (matches §2.3 alternation; matches the homepage's D6 ratification).
- **Copy (placeholder, EN):** eyebrow "READY WHEN YOU ARE" / H2 "Want to talk about your property?" / body "An estimate takes 30 minutes. We'll come measure, listen, and send a written quote within 48 hours." / primary "Get a free estimate" → `/request-quote/` / secondary "Or call (630) 946-9321" tel-link.
- **Destination (D6):** `/request-quote/` (the wizard) — matches homepage CTA. The site's primary capture is the wizard; About doesn't override that. A second amber CTA pointing to `/contact/` would compete with the wizard for attention, which is exactly what 1.05's amber-discipline rule prevents.

**Desktop SVG — About CTA (1280 × 420, on `--color-bg-cream`):**

```svg
<svg viewBox="0 0 1280 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="About CTA — desktop">
  <rect width="1280" height="420" fill="#F0E9DA"/>

  <text x="640" y="120" font-family="ui-sans-serif" font-size="13" fill="#2F5D27" text-anchor="middle" font-weight="600" letter-spacing="1.4">READY WHEN YOU ARE</text>
  <text x="640" y="180" font-family="Fraunces,serif" font-size="44" font-weight="600" fill="#1A1A1A" text-anchor="middle">Want to talk about your property?</text>
  <text x="640" y="222" font-family="ui-sans-serif" font-size="18" fill="#4A4A4A" text-anchor="middle">An estimate takes 30 minutes. We'll come measure, listen, and</text>
  <text x="640" y="246" font-family="ui-sans-serif" font-size="18" fill="#4A4A4A" text-anchor="middle">send a written quote within 48 hours.</text>

  <!-- Amber primary lg -->
  <rect x="488" y="290" width="220" height="56" rx="6" fill="#E8A33D"/>
  <text x="598" y="324" font-family="ui-sans-serif" font-size="17" font-weight="600" fill="#1A1A1A" text-anchor="middle">Get a free estimate</text>
  <!-- Ghost secondary tel: -->
  <text x="740" y="324" font-family="ui-sans-serif" font-size="17" font-weight="500" fill="#2F5D27" text-decoration="underline">Or call (630) 946-9321</text>

  <g font-family="ui-monospace,monospace" font-size="11" fill="#C2185B">
    <text x="40" y="60">surface · --color-bg-cream</text>
    <text x="488" y="364">btn · primary × amber × lg → /request-quote/  (the page's only body amber)</text>
  </g>
</svg>
```

**Mobile SVG — About CTA (390 × 480):**

```svg
<svg viewBox="0 0 390 480" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="About CTA — mobile">
  <rect width="390" height="480" fill="#F0E9DA"/>
  <text x="195" y="80" font-family="ui-sans-serif" font-size="11" fill="#2F5D27" text-anchor="middle" font-weight="600" letter-spacing="1.3">READY WHEN YOU ARE</text>
  <text x="195" y="132" font-family="Fraunces,serif" font-size="26" font-weight="600" fill="#1A1A1A" text-anchor="middle">Want to talk about</text>
  <text x="195" y="162" font-family="Fraunces,serif" font-size="26" font-weight="600" fill="#1A1A1A" text-anchor="middle">your property?</text>
  <text x="195" y="208" font-family="ui-sans-serif" font-size="15" fill="#4A4A4A" text-anchor="middle">An estimate takes 30 minutes.</text>
  <text x="195" y="230" font-family="ui-sans-serif" font-size="15" fill="#4A4A4A" text-anchor="middle">Written quote within 48 hours.</text>

  <rect x="40" y="280" width="310" height="56" rx="6" fill="#E8A33D"/>
  <text x="195" y="314" font-family="ui-sans-serif" font-size="16" font-weight="600" fill="#1A1A1A" text-anchor="middle">Get a free estimate</text>

  <text x="195" y="384" font-family="ui-sans-serif" font-size="15" fill="#2F5D27" text-anchor="middle" text-decoration="underline">Or call (630) 946-9321</text>
</svg>
```

---

## 4. Contact page — sections, mockups, specs

### 4.1 Hero

**Decisions (lock):**
- **Height:** 35vh desktop / 30vh mobile.
- **Photo or no-photo (D7 recommendation): no photo.** A cream-or-white surface with H1 + microcopy reads as "we respect your time, here's the info." Photo on a transactional page slows the page (LCP cost) and dilutes the page's "talk to a person" register. The brand stays intact via the navbar, the footer, and the Calendly placeholder section's warm cream surface below.
- **H1 (recommended):** **"Talk to a person."** Direct, present-tense, sets the page register. Alternative considered: "Contact us." — too generic; doesn't differentiate from every other contractor's contact page. Pick the specific one.
- **Subhead:** "We answer the phone. The same people who'd come measure your project." (EN, ≤120 chars). Spanish equivalent in §7.

**Desktop SVG — Contact hero (1280 × 380):**

```svg
<svg viewBox="0 0 1280 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Contact hero — desktop">
  <rect width="1280" height="380" fill="#FAF7F1"/>
  <text x="80" y="124" font-family="ui-sans-serif" font-size="13" fill="#2F5D27" font-weight="600" letter-spacing="1.4">CONTACT</text>
  <text x="80" y="200" font-family="Fraunces,serif" font-size="56" font-weight="600" fill="#1A1A1A">Talk to a person.</text>
  <text x="80" y="252" font-family="ui-sans-serif" font-size="20" fill="#4A4A4A">We answer the phone. The same people who'd come</text>
  <text x="80" y="280" font-family="ui-sans-serif" font-size="20" fill="#4A4A4A">measure your project.</text>

  <g font-family="ui-monospace,monospace" font-size="11" fill="#C2185B">
    <text x="700" y="200">H1 · --text-h1-d · --color-text-primary</text>
    <text x="700" y="252">lead · --text-body-lg · --color-text-secondary</text>
    <text x="80" y="356">surface · --color-bg  ·  no photo, no in-hero CTA</text>
  </g>
</svg>
```

**Mobile SVG — Contact hero (390 × 320):**

```svg
<svg viewBox="0 0 390 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Contact hero — mobile">
  <rect width="390" height="320" fill="#FAF7F1"/>
  <text x="20" y="80" font-family="ui-sans-serif" font-size="11" fill="#2F5D27" font-weight="600" letter-spacing="1.3">CONTACT</text>
  <text x="20" y="138" font-family="Fraunces,serif" font-size="38" font-weight="600" fill="#1A1A1A">Talk to a</text>
  <text x="20" y="178" font-family="Fraunces,serif" font-size="38" font-weight="600" fill="#1A1A1A">person.</text>
  <text x="20" y="226" font-family="ui-sans-serif" font-size="15" fill="#4A4A4A">We answer the phone. The same</text>
  <text x="20" y="246" font-family="ui-sans-serif" font-size="15" fill="#4A4A4A">people who'd come measure your</text>
  <text x="20" y="266" font-family="ui-sans-serif" font-size="15" fill="#4A4A4A">project.</text>
</svg>
```

### 4.2 Contact info + form (two-column)

**Decisions (lock):**

**Left column — Info block:**
- Phone: large display (`--text-h3-d`, 28px), `tel:+16309469321`. Format: `(630) 946-9321`. Tap target ≥44×44.
- Email: `info@sunsetservices.us`, `mailto:` link.
- Address: 1630 Mountain St, Aurora, IL 60505. With "Get directions ↗" inline link to a Google Maps URL (works in Part 1; embedded map below).
- Hours: D12 surfaced. **Default placeholder copy** (Cowork to confirm with Erick): Mon–Fri 7:00 AM – 5:00 PM · Sat by appointment · Sun closed · *24/7 during snow events*.
- Languages-spoken trust line: "We answer in English and Spanish." / "Atendemos en inglés y español."

**Right column — Contact form (the only client component on the page):**
- Name (text, required, `aria-required="true"` + visible "(required)" pill).
- Email (email, group-required with phone). Below-field hint: "Provide email or phone."
- Phone (tel, group-required with email).
- Service category (select: Residential / Commercial / Hardscape / Other).
- Message (textarea, optional, 4 rows).
- Honeypot field: `<input name="website" tabindex="-1">` — visually hidden via `clip-path: inset(50%)` + `width:1px;height:1px` (per Phase 1.03 §6 sr-only utility), `aria-hidden="true"`, `autocomplete="off"`.
- Submit: primary green `lg` (NOT amber — submit ≠ marketing CTA). Label: "Send message" / "Enviar mensaje".
- Inline success state replaces form: "Thanks. Erick will be in touch within 24 hours." / Spanish equivalent. `role="status"`, `aria-live="polite"`.
- Form-level error region: above submit, `role="alert"`, `aria-live="polite"`. Per-field errors: red `--color-feedback-error` text, inline below field, with `aria-describedby` linkage.

**D14 (group-required pattern):** **fieldset + legend.** Wrap email + phone in `<fieldset><legend>Email or phone (one required)</legend>…</fieldset>`. Most accessible; avoids JS-only patterns SR users miss. Visible legend doubles as the inline note.

**Desktop SVG — Contact info + form (1280 × 880, on `--color-bg-cream`):**

```svg
<svg viewBox="0 0 1280 880" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Contact info + form — desktop">
  <rect width="1280" height="880" fill="#F0E9DA"/>

  <!-- Two-column: info 480w · form 600w · gap 80 · margin 80 -->
  <!-- LEFT: Info -->
  <text x="80" y="116" font-family="ui-sans-serif" font-size="13" fill="#2F5D27" font-weight="600" letter-spacing="1.4">REACH US</text>

  <text x="80" y="170" font-family="ui-sans-serif" font-size="13" fill="#4A4A4A" font-weight="600" letter-spacing="0.06em">PHONE</text>
  <text x="80" y="210" font-family="Fraunces,serif" font-size="28" font-weight="600" fill="#2F5D27" text-decoration="underline">(630) 946-9321</text>

  <text x="80" y="266" font-family="ui-sans-serif" font-size="13" fill="#4A4A4A" font-weight="600" letter-spacing="0.06em">EMAIL</text>
  <text x="80" y="298" font-family="ui-sans-serif" font-size="18" fill="#2F5D27" text-decoration="underline">info@sunsetservices.us</text>

  <text x="80" y="350" font-family="ui-sans-serif" font-size="13" fill="#4A4A4A" font-weight="600" letter-spacing="0.06em">ADDRESS</text>
  <text x="80" y="380" font-family="ui-sans-serif" font-size="17" fill="#1A1A1A">1630 Mountain St</text>
  <text x="80" y="404" font-family="ui-sans-serif" font-size="17" fill="#1A1A1A">Aurora, IL 60505</text>
  <text x="80" y="436" font-family="ui-sans-serif" font-size="14" fill="#2F5D27" text-decoration="underline">Get directions ↗</text>

  <text x="80" y="490" font-family="ui-sans-serif" font-size="13" fill="#4A4A4A" font-weight="600" letter-spacing="0.06em">HOURS</text>
  <g font-family="ui-sans-serif" font-size="15" fill="#1A1A1A">
    <text x="80" y="520">Mon–Fri · 7:00 AM – 5:00 PM</text>
    <text x="80" y="544">Sat · by appointment</text>
    <text x="80" y="568">Sun · closed</text>
  </g>
  <text x="80" y="600" font-family="ui-sans-serif" font-size="13" fill="#4A4A4A" font-style="italic">24/7 during snow events</text>

  <text x="80" y="660" font-family="ui-sans-serif" font-size="14" fill="#1A1A1A">We answer in English and Spanish.</text>

  <!-- RIGHT: Form card -->
  <rect x="640" y="80" width="560" height="720" rx="8" fill="#FAF7F1" stroke="#E0D9C5"/>
  <text x="672" y="124" font-family="Fraunces,serif" font-size="24" font-weight="600" fill="#1A1A1A">Send a message</text>

  <!-- Name -->
  <text x="672" y="172" font-family="ui-sans-serif" font-size="13" fill="#4A4A4A" font-weight="600">Name</text>
  <rect x="672" y="184" width="496" height="46" rx="6" fill="#FAF7F1" stroke="#C9C2AE"/>
  <rect x="1126" y="170" width="42" height="18" rx="9" fill="#DCE8D5"/>
  <text x="1147" y="183" font-family="ui-sans-serif" font-size="10" fill="#2F5D27" text-anchor="middle" font-weight="600">REQ</text>

  <!-- Fieldset: Email or phone -->
  <rect x="672" y="252" width="496" height="156" rx="6" fill="none" stroke="#C9C2AE" stroke-dasharray="4 3"/>
  <rect x="688" y="244" width="220" height="18" fill="#FAF7F1"/>
  <text x="694" y="259" font-family="ui-sans-serif" font-size="12" fill="#4A4A4A" font-weight="600">Email or phone (one required)</text>
  <text x="688" y="290" font-family="ui-sans-serif" font-size="12" fill="#4A4A4A">Email</text>
  <rect x="688" y="298" width="464" height="40" rx="6" fill="#FAF7F1" stroke="#C9C2AE"/>
  <text x="688" y="354" font-family="ui-sans-serif" font-size="12" fill="#4A4A4A">Phone</text>
  <rect x="688" y="362" width="464" height="40" rx="6" fill="#FAF7F1" stroke="#C9C2AE"/>

  <!-- Service category -->
  <text x="672" y="436" font-family="ui-sans-serif" font-size="13" fill="#4A4A4A" font-weight="600">Service category</text>
  <rect x="672" y="448" width="496" height="46" rx="6" fill="#FAF7F1" stroke="#C9C2AE"/>
  <text x="688" y="476" font-family="ui-sans-serif" font-size="15" fill="#7A7263">Select one…</text>
  <text x="1148" y="476" font-family="ui-sans-serif" font-size="15" fill="#4A4A4A">▾</text>

  <!-- Message -->
  <text x="672" y="520" font-family="ui-sans-serif" font-size="13" fill="#4A4A4A" font-weight="600">Message</text>
  <rect x="672" y="532" width="496" height="120" rx="6" fill="#FAF7F1" stroke="#C9C2AE"/>
  <text x="688" y="558" font-family="ui-sans-serif" font-size="13" fill="#9A9182" font-style="italic">Tell us what you're thinking about… (optional)</text>

  <!-- Form-level error region (empty rest state) -->
  <rect x="672" y="676" width="496" height="0" fill="none"/>

  <!-- Submit primary green lg -->
  <rect x="672" y="688" width="200" height="52" rx="6" fill="#4D8A3F"/>
  <text x="772" y="720" font-family="ui-sans-serif" font-size="16" font-weight="600" fill="#FFFFFF" text-anchor="middle">Send message</text>

  <!-- Honeypot annotation -->
  <text x="672" y="772" font-family="ui-monospace,monospace" font-size="11" fill="#9A9182">[honeypot field: visually hidden, aria-hidden, autocomplete="off"]</text>

  <g font-family="ui-monospace,monospace" font-size="11" fill="#C2185B">
    <text x="80" y="836">left col · server-rendered info block (no JS)</text>
    <text x="640" y="836">right col · &lt;ContactForm /&gt; client island · primary GREEN submit (not amber)</text>
  </g>
</svg>
```

**Mobile SVG — Contact info + form (390 × 1340):**

```svg
<svg viewBox="0 0 390 1340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Contact info + form — mobile">
  <rect width="390" height="1340" fill="#F0E9DA"/>

  <!-- Stacked: info on top, form below -->
  <text x="20" y="80" font-family="ui-sans-serif" font-size="11" fill="#2F5D27" font-weight="600" letter-spacing="1.3">REACH US</text>

  <text x="20" y="124" font-family="ui-sans-serif" font-size="11" fill="#4A4A4A" font-weight="600" letter-spacing="0.06em">PHONE</text>
  <text x="20" y="156" font-family="Fraunces,serif" font-size="22" font-weight="600" fill="#2F5D27" text-decoration="underline">(630) 946-9321</text>

  <text x="20" y="196" font-family="ui-sans-serif" font-size="11" fill="#4A4A4A" font-weight="600" letter-spacing="0.06em">EMAIL</text>
  <text x="20" y="222" font-family="ui-sans-serif" font-size="15" fill="#2F5D27" text-decoration="underline">info@sunsetservices.us</text>

  <text x="20" y="264" font-family="ui-sans-serif" font-size="11" fill="#4A4A4A" font-weight="600" letter-spacing="0.06em">ADDRESS</text>
  <text x="20" y="290" font-family="ui-sans-serif" font-size="14" fill="#1A1A1A">1630 Mountain St</text>
  <text x="20" y="310" font-family="ui-sans-serif" font-size="14" fill="#1A1A1A">Aurora, IL 60505</text>
  <text x="20" y="338" font-family="ui-sans-serif" font-size="13" fill="#2F5D27" text-decoration="underline">Get directions ↗</text>

  <text x="20" y="378" font-family="ui-sans-serif" font-size="11" fill="#4A4A4A" font-weight="600" letter-spacing="0.06em">HOURS</text>
  <g font-family="ui-sans-serif" font-size="13" fill="#1A1A1A">
    <text x="20" y="404">Mon–Fri · 7 AM – 5 PM</text>
    <text x="20" y="424">Sat · by appointment · Sun · closed</text>
  </g>
  <text x="20" y="450" font-family="ui-sans-serif" font-size="12" fill="#4A4A4A" font-style="italic">24/7 during snow events</text>
  <text x="20" y="486" font-family="ui-sans-serif" font-size="13" fill="#1A1A1A">We answer in English and Spanish.</text>

  <!-- Form card -->
  <rect x="20" y="520" width="350" height="780" rx="8" fill="#FAF7F1" stroke="#E0D9C5"/>
  <text x="40" y="560" font-family="Fraunces,serif" font-size="20" font-weight="600" fill="#1A1A1A">Send a message</text>

  <text x="40" y="600" font-family="ui-sans-serif" font-size="11" fill="#4A4A4A" font-weight="600">Name (required)</text>
  <rect x="40" y="610" width="310" height="42" rx="6" fill="#FAF7F1" stroke="#C9C2AE"/>

  <rect x="40" y="672" width="310" height="156" rx="6" fill="none" stroke="#C9C2AE" stroke-dasharray="4 3"/>
  <rect x="48" y="664" width="200" height="16" fill="#FAF7F1"/>
  <text x="52" y="676" font-family="ui-sans-serif" font-size="11" fill="#4A4A4A" font-weight="600">Email or phone (one required)</text>
  <text x="52" y="704" font-family="ui-sans-serif" font-size="11" fill="#4A4A4A">Email</text>
  <rect x="52" y="712" width="290" height="38" rx="6" fill="#FAF7F1" stroke="#C9C2AE"/>
  <text x="52" y="768" font-family="ui-sans-serif" font-size="11" fill="#4A4A4A">Phone</text>
  <rect x="52" y="776" width="290" height="38" rx="6" fill="#FAF7F1" stroke="#C9C2AE"/>

  <text x="40" y="864" font-family="ui-sans-serif" font-size="11" fill="#4A4A4A" font-weight="600">Service category</text>
  <rect x="40" y="874" width="310" height="42" rx="6" fill="#FAF7F1" stroke="#C9C2AE"/>
  <text x="52" y="900" font-family="ui-sans-serif" font-size="13" fill="#7A7263">Select one…</text>

  <text x="40" y="944" font-family="ui-sans-serif" font-size="11" fill="#4A4A4A" font-weight="600">Message</text>
  <rect x="40" y="954" width="310" height="100" rx="6" fill="#FAF7F1" stroke="#C9C2AE"/>

  <rect x="40" y="1080" width="310" height="50" rx="6" fill="#4D8A3F"/>
  <text x="195" y="1110" font-family="ui-sans-serif" font-size="15" font-weight="600" fill="#FFFFFF" text-anchor="middle">Send message</text>

  <text x="40" y="1170" font-family="ui-monospace,monospace" font-size="9" fill="#9A9182">[honeypot · sr-only]</text>
</svg>
```

**Form validation states (annotated reference):**
- Empty submit → form-level error "Please complete the required fields." + per-field inline errors on Name + the fieldset.
- Invalid email format → inline below Email: "That email address looks incomplete."
- Both email + phone empty → fieldset legend gets `role="group" aria-describedby="email-phone-err"` with "Provide email or phone." in red `--color-feedback-error` below the fieldset.
- Submit disabled state (during pending submit, even though Part 1 doesn't wire the network call): button takes `--color-sunset-green-300` background + `aria-busy="true"`, label changes to "Sending…".
- Success → form is replaced with a `role="status"` confirmation card.

### 4.3 Map block

**Decision (D8 lock): A — static placeholder image in Part 1.** Live Google Maps iframe deferred to Part 2 (Phase 2.07-adjacent task). Rationale: zero JS, zero CLS, zero third-party load on Lighthouse; recommendation aligns with the homepage Lighthouse-mobile gap from 1.07.

**Spec:**
- Surface: `--color-bg`. Section padding `py-20` / `py-14`.
- Container: max-w-1200, full-width image (`width:100%; height: clamp(280px, 36vw, 440px)`), `--radius-md` rounded corners, `--shadow-soft`.
- Image: a soft-tinted abstract street-grid illustration (NOT a real Google Maps screenshot — that's a TOS issue and a stale-data trap). Cream + green palette. Centered Sunset-green pin SVG.
- Overlaid label card (top-left, inset 24px): white card with address + "Get directions ↗" link.
- The whole block is wrapped `<a href="https://maps.google.com/?q=1630+Mountain+St,+Aurora,+IL+60505" target="_blank" rel="noopener" aria-label="Open 1630 Mountain St, Aurora, IL in Google Maps">`.
- Part 2 swap-in plan: replace the static `<img>` with a `<MapEmbed>` client component that renders an iframe with `loading="lazy"`, `referrerpolicy="no-referrer-when-downgrade"`, and a sr-only label. Keep the overlaid address card on top of the iframe.

**Desktop SVG — Map (1280 × 540):**

```svg
<svg viewBox="0 0 1280 540" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Map block — desktop">
  <rect width="1280" height="540" fill="#FAF7F1"/>

  <!-- Map placeholder image: cream/green abstract grid with pin -->
  <rect x="80" y="60" width="1120" height="420" rx="8" fill="#E8E0CD"/>
  <!-- Roads -->
  <g stroke="#FAF7F1" stroke-width="6">
    <line x1="80" y1="180" x2="1200" y2="180"/>
    <line x1="80" y1="320" x2="1200" y2="320"/>
    <line x1="320" y1="60" x2="320" y2="480"/>
    <line x1="640" y1="60" x2="640" y2="480"/>
    <line x1="960" y1="60" x2="960" y2="480"/>
  </g>
  <g stroke="#D8D2C4" stroke-width="2">
    <line x1="80" y1="120" x2="1200" y2="120"/>
    <line x1="80" y1="250" x2="1200" y2="250"/>
    <line x1="80" y1="400" x2="1200" y2="400"/>
    <line x1="200" y1="60" x2="200" y2="480"/>
    <line x1="480" y1="60" x2="480" y2="480"/>
    <line x1="800" y1="60" x2="800" y2="480"/>
    <line x1="1080" y1="60" x2="1080" y2="480"/>
  </g>
  <!-- Park / green block -->
  <rect x="700" y="180" width="200" height="140" fill="#B8D2A8"/>

  <!-- Pin -->
  <g transform="translate(640 270)">
    <path d="M0 0 C 16 -28, 16 -54, 0 -68 C -16 -54, -16 -28, 0 0 Z" fill="#4D8A3F"/>
    <circle cx="0" cy="-44" r="8" fill="#FAF7F1"/>
  </g>

  <!-- Address card -->
  <rect x="120" y="100" width="320" height="120" rx="8" fill="#FAF7F1" stroke="#E0D9C5"/>
  <text x="140" y="134" font-family="ui-sans-serif" font-size="11" fill="#2F5D27" font-weight="600" letter-spacing="1.3">SUNSET SERVICES</text>
  <text x="140" y="166" font-family="Fraunces,serif" font-size="18" font-weight="600" fill="#1A1A1A">1630 Mountain St</text>
  <text x="140" y="188" font-family="Fraunces,serif" font-size="18" font-weight="600" fill="#1A1A1A">Aurora, IL 60505</text>
  <text x="140" y="212" font-family="ui-sans-serif" font-size="13" fill="#2F5D27" text-decoration="underline">Get directions ↗</text>

  <g font-family="ui-monospace,monospace" font-size="11" fill="#C2185B">
    <text x="80" y="514">Static AVIF/SVG illustration · NOT a real Google Maps screenshot · 0 third-party load · Part 2 swaps to live iframe</text>
  </g>
</svg>
```

**Mobile SVG — Map (390 × 480):**

```svg
<svg viewBox="0 0 390 480" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Map block — mobile">
  <rect width="390" height="480" fill="#FAF7F1"/>
  <rect x="20" y="56" width="350" height="320" rx="8" fill="#E8E0CD"/>
  <g stroke="#FAF7F1" stroke-width="4">
    <line x1="20" y1="160" x2="370" y2="160"/>
    <line x1="20" y1="270" x2="370" y2="270"/>
    <line x1="120" y1="56" x2="120" y2="376"/>
    <line x1="260" y1="56" x2="260" y2="376"/>
  </g>
  <rect x="265" y="160" width="80" height="60" fill="#B8D2A8"/>
  <g transform="translate(195 220)">
    <path d="M0 0 C 12 -22, 12 -42, 0 -52 C -12 -42, -12 -22, 0 0 Z" fill="#4D8A3F"/>
    <circle cx="0" cy="-34" r="6" fill="#FAF7F1"/>
  </g>

  <rect x="40" y="80" width="240" height="92" rx="8" fill="#FAF7F1" stroke="#E0D9C5"/>
  <text x="56" y="106" font-family="ui-sans-serif" font-size="9" fill="#2F5D27" font-weight="600" letter-spacing="1.2">SUNSET SERVICES</text>
  <text x="56" y="130" font-family="Fraunces,serif" font-size="14" font-weight="600" fill="#1A1A1A">1630 Mountain St</text>
  <text x="56" y="148" font-family="Fraunces,serif" font-size="14" font-weight="600" fill="#1A1A1A">Aurora, IL 60505</text>
  <text x="56" y="166" font-family="ui-sans-serif" font-size="11" fill="#2F5D27" text-decoration="underline">Get directions ↗</text>
</svg>
```

### 4.4 Calendly placeholder

**Decisions (lock):**
- Block dimensions: 720w × 560h max-w on desktop (mirrors typical Calendly inline embed); 100% width × 600h on mobile.
- Surface: section is `--color-bg-cream`. Card surface inside: `--color-bg` (white) with `--shadow-soft` and `--radius-md`.
- Placeholder content: H2 "Book a 30-min consultation" / eyebrow "BOOK DIRECTLY" / body "Pick a slot that works. Erick reviews every booking before confirming." / "Coming soon" badge in `--color-sunset-amber-100` chip (NOT amber-500 — that'd be a body amber CTA). Fallback CTA: "Or call (630) 946-9321" tel: link.
- D9: until Cowork confirms an existing Calendly URL, the fallback CTA is the tel: link only. Once an active Calendly URL exists, swap "Coming soon" + tel: for an actual "Open booking page ↗" link to the Calendly URL (still no embed; embed lands in 2.07).
- Why this lives on Contact and not just Thank-You: people who skip the form and prefer to pick a slot directly need a path. Plan §11 confirms.

**Desktop SVG — Calendly placeholder (1280 × 760, on `--color-bg-cream`):**

```svg
<svg viewBox="0 0 1280 760" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Calendly placeholder — desktop">
  <rect width="1280" height="760" fill="#F0E9DA"/>

  <text x="640" y="100" font-family="ui-sans-serif" font-size="13" fill="#2F5D27" text-anchor="middle" font-weight="600" letter-spacing="1.4">BOOK DIRECTLY</text>
  <text x="640" y="156" font-family="Fraunces,serif" font-size="36" font-weight="600" fill="#1A1A1A" text-anchor="middle">Pick a 30-min slot.</text>
  <text x="640" y="196" font-family="ui-sans-serif" font-size="17" fill="#4A4A4A" text-anchor="middle">Erick reviews every booking before confirming.</text>

  <!-- Embed placeholder card -->
  <rect x="280" y="240" width="720" height="440" rx="8" fill="#FAF7F1" stroke="#E0D9C5"/>
  <!-- Mock calendar grid -->
  <text x="320" y="288" font-family="Fraunces,serif" font-size="20" font-weight="600" fill="#1A1A1A">Select a date</text>
  <rect x="320" y="316" width="64" height="20" rx="10" fill="#FDF7E8"/>
  <text x="352" y="330" font-family="ui-sans-serif" font-size="11" fill="#B47821" text-anchor="middle" font-weight="600" letter-spacing="0.08em">COMING SOON</text>

  <g font-family="ui-sans-serif" font-size="13" fill="#4A4A4A">
    <text x="320" y="378">Mon</text><text x="408" y="378">Tue</text><text x="496" y="378">Wed</text>
    <text x="584" y="378">Thu</text><text x="672" y="378">Fri</text>
  </g>
  <!-- Date cells -->
  <g>
    <rect x="316" y="396" width="60" height="60" rx="6" fill="#F0E9DA"/>
    <rect x="404" y="396" width="60" height="60" rx="6" fill="#F0E9DA"/>
    <rect x="492" y="396" width="60" height="60" rx="6" fill="#F0E9DA"/>
    <rect x="580" y="396" width="60" height="60" rx="6" fill="#F0E9DA"/>
    <rect x="668" y="396" width="60" height="60" rx="6" fill="#F0E9DA"/>
    <rect x="316" y="468" width="60" height="60" rx="6" fill="#F0E9DA"/>
    <rect x="404" y="468" width="60" height="60" rx="6" fill="#F0E9DA"/>
    <rect x="492" y="468" width="60" height="60" rx="6" fill="#F0E9DA"/>
    <rect x="580" y="468" width="60" height="60" rx="6" fill="#F0E9DA"/>
    <rect x="668" y="468" width="60" height="60" rx="6" fill="#F0E9DA"/>
  </g>

  <text x="320" y="600" font-family="ui-sans-serif" font-size="14" fill="#4A4A4A">Booking widget loads in Phase 2.07.</text>
  <text x="320" y="624" font-family="ui-sans-serif" font-size="14" fill="#4A4A4A">Until then —</text>

  <rect x="320" y="640" width="220" height="44" rx="6" fill="none" stroke="#2F5D27" stroke-width="1.5"/>
  <text x="430" y="668" font-family="ui-sans-serif" font-size="15" fill="#2F5D27" text-anchor="middle" font-weight="600">Call (630) 946-9321</text>

  <g font-family="ui-monospace,monospace" font-size="11" fill="#C2185B">
    <text x="40" y="730">role="region" aria-label="Calendly booking widget — coming soon"  ·  no JS, no embed, no third-party load in Part 1</text>
  </g>
</svg>
```

**Mobile SVG — Calendly (390 × 720):**

```svg
<svg viewBox="0 0 390 720" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Calendly placeholder — mobile">
  <rect width="390" height="720" fill="#F0E9DA"/>
  <text x="195" y="80" font-family="ui-sans-serif" font-size="11" fill="#2F5D27" text-anchor="middle" font-weight="600" letter-spacing="1.3">BOOK DIRECTLY</text>
  <text x="195" y="124" font-family="Fraunces,serif" font-size="26" font-weight="600" fill="#1A1A1A" text-anchor="middle">Pick a 30-min slot.</text>
  <text x="195" y="160" font-family="ui-sans-serif" font-size="14" fill="#4A4A4A" text-anchor="middle">Erick reviews every booking</text>
  <text x="195" y="180" font-family="ui-sans-serif" font-size="14" fill="#4A4A4A" text-anchor="middle">before confirming.</text>

  <rect x="20" y="220" width="350" height="400" rx="8" fill="#FAF7F1" stroke="#E0D9C5"/>
  <rect x="40" y="240" width="80" height="18" rx="9" fill="#FDF7E8"/>
  <text x="80" y="253" font-family="ui-sans-serif" font-size="9" fill="#B47821" text-anchor="middle" font-weight="600" letter-spacing="0.08em">COMING SOON</text>
  <text x="40" y="288" font-family="Fraunces,serif" font-size="16" font-weight="600" fill="#1A1A1A">Select a date</text>

  <g>
    <rect x="40" y="306" width="56" height="48" rx="6" fill="#F0E9DA"/>
    <rect x="104" y="306" width="56" height="48" rx="6" fill="#F0E9DA"/>
    <rect x="168" y="306" width="56" height="48" rx="6" fill="#F0E9DA"/>
    <rect x="232" y="306" width="56" height="48" rx="6" fill="#F0E9DA"/>
    <rect x="296" y="306" width="56" height="48" rx="6" fill="#F0E9DA"/>
    <rect x="40" y="362" width="56" height="48" rx="6" fill="#F0E9DA"/>
    <rect x="104" y="362" width="56" height="48" rx="6" fill="#F0E9DA"/>
    <rect x="168" y="362" width="56" height="48" rx="6" fill="#F0E9DA"/>
    <rect x="232" y="362" width="56" height="48" rx="6" fill="#F0E9DA"/>
    <rect x="296" y="362" width="56" height="48" rx="6" fill="#F0E9DA"/>
  </g>

  <text x="40" y="470" font-family="ui-sans-serif" font-size="13" fill="#4A4A4A">Booking widget loads in</text>
  <text x="40" y="490" font-family="ui-sans-serif" font-size="13" fill="#4A4A4A">Phase 2.07.</text>

  <rect x="40" y="540" width="310" height="48" rx="6" fill="none" stroke="#2F5D27" stroke-width="1.5"/>
  <text x="195" y="570" font-family="ui-sans-serif" font-size="14" fill="#2F5D27" text-anchor="middle" font-weight="600">Call (630) 946-9321</text>
</svg>
```

### 4.5 Service-area strip

**Decision (D10 lock): keep.** The strip is small (one row), answers the unstated "do you serve my area?" without requiring a click, and gives organic internal-link weight to the location pages (Phase 1.13/1.14). The cost is one section's worth of vertical space; the value is conversion clarity for the visitor and SEO graph for crawlers.

**Spec:**
- Surface: `--color-bg`.
- Layout: centered eyebrow + row of 6 city links separated by middle dots (·). Mobile wraps to 2-row grid; never stacks vertically (would look funny for 6 short labels).
- Each city → location-page route: `/locations/aurora-il/`, `/locations/naperville-il/`, etc. Per Phase 1.13 routing (locations live there).
- Link styling: `--color-sunset-green-700`, underlined on hover only (not rest), 18px.

**Desktop SVG — Service area (1280 × 220):**

```svg
<svg viewBox="0 0 1280 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Service area strip — desktop">
  <rect width="1280" height="220" fill="#FAF7F1"/>
  <text x="640" y="80" font-family="ui-sans-serif" font-size="12" fill="#2F5D27" text-anchor="middle" font-weight="600" letter-spacing="1.4">WE SERVE</text>
  <g font-family="Fraunces,serif" font-size="22" fill="#2F5D27" text-anchor="middle" font-weight="500">
    <text x="180" y="138">Aurora</text><text x="320" y="138">·</text>
    <text x="430" y="138">Naperville</text><text x="568" y="138">·</text>
    <text x="640" y="138">Batavia</text><text x="722" y="138">·</text>
    <text x="800" y="138">Wheaton</text><text x="900" y="138">·</text>
    <text x="966" y="138">Lisle</text><text x="1024" y="138">·</text>
    <text x="1110" y="138">Bolingbrook</text>
  </g>
  <text x="640" y="172" font-family="ui-sans-serif" font-size="13" fill="#4A4A4A" text-anchor="middle">Plus surrounding DuPage County. Not sure? <tspan fill="#2F5D27" text-decoration="underline">Call us.</tspan></text>
</svg>
```

**Mobile SVG — Service area (390 × 220):**

```svg
<svg viewBox="0 0 390 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Service area strip — mobile">
  <rect width="390" height="220" fill="#FAF7F1"/>
  <text x="195" y="64" font-family="ui-sans-serif" font-size="11" fill="#2F5D27" text-anchor="middle" font-weight="600" letter-spacing="1.3">WE SERVE</text>
  <g font-family="Fraunces,serif" font-size="17" fill="#2F5D27" text-anchor="middle" font-weight="500">
    <text x="80" y="108">Aurora</text><text x="180" y="108">Naperville</text><text x="300" y="108">Batavia</text>
    <text x="80" y="146">Wheaton</text><text x="180" y="146">Lisle</text><text x="300" y="146">Bolingbrook</text>
  </g>
  <text x="195" y="186" font-family="ui-sans-serif" font-size="12" fill="#4A4A4A" text-anchor="middle">Plus surrounding DuPage. <tspan fill="#2F5D27" text-decoration="underline">Call us.</tspan></text>
</svg>
```

### 4.6 CTA section — DROPPED

**Decision (D11 lock): skip on Contact.** Argued in §2.2. The page IS the conversion surface; a body amber CTA pointing to `/request-quote/` directly under a contact form pointing to the same lead pipeline dilutes both. The locked navbar amber is the only amber affordance. Footer's standard CTA strip (Phase 1.05) closes the page — that's enough.

If Chat overrides D11 to keep one: copy must NOT be "get a free estimate" (the form already does that). Use "Prefer the quick wizard?" / "¿Prefieres el formulario rápido?" → `/request-quote/`. Pattern is `HomeCTA` reused with `ContactCTA` wrapper, surface `--color-bg-cream`. Surface alternation re-resolves: Service-area strip moves to white (already white — fine), CTA on cream (matches About).

---

## 5. SEO and schema

### 5.1 About

- `<title>` (≤60 char): "About Sunset Services — Family-run since 2000 · DuPage" (54).
- `<meta name="description">` (≤160 char): "Twenty-five years on DuPage County properties. Meet Erick, Nick, and Marcin — the Aurora family running Sunset Services since 2000." (~140).
- ES title: "Sobre Sunset Services — Negocio familiar desde 2000 · DuPage".
- ES description: "Veinticinco años en propiedades del condado de DuPage. Conoce a Erick, Nick y Marcin — la familia de Aurora que dirige Sunset Services desde 2000."
- Open Graph: 1200×630, branded, page-specific. Default layout: 4:5 portrait crop of `about.hero` photo on the left, page title (`Fraunces 600 / 56`) + tagline + Sunset wordmark on a `--color-bg-cream` panel on the right.
- JSON-LD:
  - `Organization` and `LocalBusiness` are sitewide (Phase 1.05 root layout) — **do not duplicate** on this page.
  - `Person` × 3 — Erick, Nick, Marcin — per Plan §9.
  - `BreadcrumbList` — `Home → About`.

```jsonc
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Erick Valle",
  "jobTitle": "Owner",
  "worksFor": { "@id": "https://sunsetservices.com/#localbusiness" },
  "image": "https://sunsetservices.com/images/team/erick.avif"
}
```

```jsonc
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Nick Valle",
  "jobTitle": "Founder",
  "worksFor": { "@id": "https://sunsetservices.com/#localbusiness" },
  "image": "https://sunsetservices.com/images/team/nick.avif"
}
```

```jsonc
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Marcin [TBR]",
  "jobTitle": "Hardscape Lead",
  "worksFor": { "@id": "https://sunsetservices.com/#localbusiness" },
  "image": "https://sunsetservices.com/images/team/marcin.avif"
}
```

```jsonc
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://sunsetservices.com/" },
    { "@type": "ListItem", "position": 2, "name": "About", "item": "https://sunsetservices.com/about/" }
  ]
}
```

Heading hierarchy: H1 (hero) → H2 per section (Brand story, Team, Credentials, Recent work, CTA) → H3 for team-card names. No skipped levels.

### 5.2 Contact

- `<title>` (≤60): "Contact Sunset Services — Aurora, IL · DuPage County" (52).
- `<meta name="description">` (≤160): "Talk to Sunset Services. Phone, email, address, hours, and a 30-min booking option. We answer in English and Spanish." (~120).
- ES: "Contacta a Sunset Services — Aurora, IL · Condado de DuPage" / "Habla con Sunset Services. Teléfono, correo, dirección, horario, y reserva de 30 minutos. Atendemos en inglés y español."
- Open Graph: 1200×630, branded. Layout: `--color-bg-cream` background, large phone number in `Fraunces 600 / 64`, "Talk to a person." tagline, address inset, Sunset wordmark.
- JSON-LD:
  - `ContactPage` per Plan §9.
  - `BreadcrumbList` — `Home → Contact`.

```jsonc
{
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "url": "https://sunsetservices.com/contact/",
  "mainEntity": { "@id": "https://sunsetservices.com/#localbusiness" },
  "availableLanguage": ["en", "es"]
}
```

```jsonc
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://sunsetservices.com/" },
    { "@type": "ListItem", "position": 2, "name": "Contact", "item": "https://sunsetservices.com/contact/" }
  ]
}
```

The contact form does not get its own schema (no `Form` schema type exists at schema.org). The page-level `ContactPage` covers the surface; the sitewide `LocalBusiness` carries the phone, email, address, and hours.

Heading hierarchy: H1 (hero) → H2 per section (Send a message, Visit us, Book directly, We serve) → no H3.

---

## 6. Photography brief

Cowork sources from Drive in Phase 2.04. Every slot below is `[Cowork to source]`.

| Slot id | Aspect | Subject prompt | Mood / lighting | LCP discipline | Notes |
|---|---|---|---|---|---|
| `about.hero` | 16:9 desktop master, 1:1 mobile crop | Erick on-site, working, mid-frame; environment readable (hardscape job, trucks visible at edges); golden-hour direction | Warm golden hour, late afternoon. No posed-staring-at-camera. | YES — LCP candidate. Apply ≤350KB AVIF, priority, explicit dimensions, blur placeholder per Phase 1.07 lesson. | If no usable Erick photo, fallback: wide property shot at golden hour. Don't ship a stock-image fallback. |
| `about.brand-story` | 4:5 portrait | Erick + Nick together on-site, OR Erick alone outdoors with company truck visible | Late afternoon, working light. Casual, not posed. | No (below the fold). | Historical Nick-only photos at low resolution acceptable as treatment behind a `--color-bg-cream` overlay if that's all Erick has. |
| `team.erick` | 4:5 portrait | Erick, head + shoulders + environment, outdoor work setting | Outdoor, working light, ¾ angle | No (below fold). | Match `team.nick` and `team.marcin` for crop, focal length, light direction so the 3-card grid reads as a set. |
| `team.nick` | 4:5 portrait | Nick, same crop spec as Erick | Outdoor, working light | No | If only studio portrait exists, treat with cream-tone background swap to match the others. |
| `team.marcin` | 4:5 portrait | Marcin, same crop spec | Outdoor, working light, on hardscape job site | No | Last name TBR (D13). |
| `contact.hero` | n/a | **No photo.** D7 ratification = drop the slot. | — | — | If D7 reverses to "yes photo": 4:3 desktop / 1:1 mobile, property exterior or office sign, warm. Then this slot becomes LCP-critical. |
| `og.about` | 1200×630 | Composite: 4:5 crop of `about.hero` + cream panel with title + wordmark | — | — | Static export. |
| `og.contact` | 1200×630 | Composite: cream background, large phone number, tagline, wordmark | — | — | Static export. |

---

## 7. i18n strings

Flat table; namespaces `about.*` and `contact.*`. Every visible string. `[TBR]` = Phase 2.13 native review.

### 7.1 About

| Key | EN | ES |
|---|---|---|
| `about.hero.eyebrow` | About us | Sobre nosotros |
| `about.hero.h1` | Family-run, since 2000. | Negocio familiar, desde 2000. |
| `about.hero.lead.line1` | Twenty-five years on DuPage County properties. | Veinticinco años en propiedades del condado de DuPage. |
| `about.hero.lead.line2` | Same crews. Same 6:30 a.m. start. No subcontracted surprises. | Las mismas cuadrillas. El mismo arranque a las 6:30 a.m. Sin sorpresas subcontratadas. |
| `about.story.eyebrow` | Our story | Nuestra historia |
| `about.story.h2.line1` | Started by Nick. | Empezó con Nick. |
| `about.story.h2.line2` | Run today by Erick. | Hoy lo dirige Erick. |
| `about.story.p1` | Nick Valle started the company in 2000 with one truck and a maintenance route across Aurora and Naperville. The first contract is still active, twenty-five years later. | Nick Valle fundó la empresa en 2000 con un camión y una ruta de mantenimiento entre Aurora y Naperville. El primer contrato sigue activo, veinticinco años después. |
| `about.story.p2` | In 2018, Erick — Nick's son — took over operations. Same crew, same 6:30 a.m. start, same standard for what a finished property looks like. No subcontracted surprises; the people who measure your project are the people who do it. | En 2018, Erick — el hijo de Nick — asumió las operaciones. La misma cuadrilla, el mismo arranque a las 6:30 a.m., el mismo estándar para una propiedad terminada. Sin sorpresas subcontratadas; quienes miden tu proyecto son quienes lo hacen. |
| `about.story.p3` | Marcin joined to lead the hardscape division — Unilock-Authorized installs, paver patios, retaining walls, fire features. The trucks share a yard; your job stays one phone call long. | Marcin se sumó para dirigir la división de hardscape — instalaciones autorizadas por Unilock, patios de adoquines, muros de contención, espacios de fuego. Los camiones comparten patio; tu proyecto cabe en una sola llamada. |
| `about.story.cta.residential` | See residential services → | Ver servicios residenciales → |
| `about.story.cta.hardscape` | See hardscape services → | Ver servicios de hardscape → |
| `about.team.eyebrow` | The team | El equipo |
| `about.team.h2` | The people you'd be working with. | Las personas con las que trabajarías. |
| `about.team.role.owner` | Owner | Propietario |
| `about.team.role.founder` | Founder | Fundador |
| `about.team.role.hardscape_lead` | Hardscape Lead | Líder de Hardscape |
| `about.team.erick.bio` | Took over operations in 2018. Runs every estimate himself — you meet him before you sign anything. | Asumió las operaciones en 2018. Hace todos los estimados en persona — lo conoces antes de firmar nada. |
| `about.team.nick.bio` | Started Sunset Services in 2000. Still on-site most weeks. The senior eye on the complicated jobs. | Fundó Sunset Services en 2000. Sigue en obra casi todas las semanas. El ojo veterano en los trabajos complicados. |
| `about.team.marcin.bio` | Leads the Unilock-Authorized hardscape division. Patios, walls, fire features — specs to install. | Dirige la división de hardscape autorizada por Unilock. Patios, muros, espacios de fuego — del plano a la instalación. |
| `about.credentials.eyebrow` | Credentials | Credenciales |
| `about.credentials.h2` | Verifiable, not just claimed. | Verificables, no solo dichas. |
| `about.credentials.unilock.title` | Unilock Authorized Contractor | Contratista Autorizado Unilock |
| `about.credentials.unilock.caption` | Hardscape division | División de hardscape |
| `about.credentials.years.title` | 25+ years in business | Más de 25 años en el negocio |
| `about.credentials.years.caption` | Family-run since 2000 | Empresa familiar desde 2000 |
| `about.credentials.tribune.title` | Top 5 Landscaping | Top 5 Paisajismo |
| `about.credentials.tribune.caption` | DuPage Tribune · 2024 | DuPage Tribune · 2024 |
| `about.credentials.google.title` | Google reviews | Reseñas de Google |
| `about.credentials.google.caption` | [TBR] verified reviews | [TBR] reseñas verificadas |
| `about.projects.eyebrow` | Recent work | Trabajo reciente |
| `about.projects.h2` | Built across DuPage. | Construido en DuPage. |
| `about.projects.cta` | See all projects → | Ver todos los proyectos → |
| `about.cta.eyebrow` | Ready when you are | Cuando tú quieras |
| `about.cta.h2` | Want to talk about your property? | ¿Quieres hablar sobre tu propiedad? |
| `about.cta.body` | An estimate takes 30 minutes. We'll come measure, listen, and send a written quote within 48 hours. | Un estimado toma 30 minutos. Vamos a medir, escuchar, y mandar una cotización escrita en 48 horas. |
| `about.cta.primary` | Get a free estimate | Solicita un estimado gratis |
| `about.cta.secondary` | Or call (630) 946-9321 | O llama al (630) 946-9321 |

### 7.2 Contact

| Key | EN | ES |
|---|---|---|
| `contact.hero.eyebrow` | Contact | Contacto |
| `contact.hero.h1` | Talk to a person. | Habla con una persona. |
| `contact.hero.sub.line1` | We answer the phone. The same people | Contestamos el teléfono. Las mismas personas |
| `contact.hero.sub.line2` | who'd come measure your project. | que irían a medir tu proyecto. |
| `contact.info.eyebrow` | Reach us | Contáctanos |
| `contact.info.phone.label` | Phone | Teléfono |
| `contact.info.phone.value` | (630) 946-9321 | (630) 946-9321 |
| `contact.info.email.label` | Email | Correo |
| `contact.info.email.value` | info@sunsetservices.us | info@sunsetservices.us |
| `contact.info.address.label` | Address | Dirección |
| `contact.info.address.line1` | 1630 Mountain St | 1630 Mountain St |
| `contact.info.address.line2` | Aurora, IL 60505 | Aurora, IL 60505 |
| `contact.info.directions` | Get directions ↗ | Cómo llegar ↗ |
| `contact.info.hours.label` | Hours | Horario |
| `contact.info.hours.weekday` | Mon–Fri · 7:00 AM – 5:00 PM | Lun–Vie · 7:00 AM – 5:00 PM |
| `contact.info.hours.sat` | Sat · by appointment | Sáb · con cita |
| `contact.info.hours.sun` | Sun · closed | Dom · cerrado |
| `contact.info.hours.snow` | 24/7 during snow events | 24/7 durante nevadas |
| `contact.info.languages` | We answer in English and Spanish. | Atendemos en inglés y español. |
| `contact.form.title` | Send a message | Envía un mensaje |
| `contact.form.name.label` | Name | Nombre |
| `contact.form.name.placeholder` | Your name | Tu nombre |
| `contact.form.required.suffix` | (required) | (obligatorio) |
| `contact.form.req_pill` | Req | Obl |
| `contact.form.contact_legend` | Email or phone (one required) | Correo o teléfono (uno obligatorio) |
| `contact.form.email.label` | Email | Correo |
| `contact.form.email.placeholder` | name@example.com | nombre@ejemplo.com |
| `contact.form.phone.label` | Phone | Teléfono |
| `contact.form.phone.placeholder` | (630) 555-0100 | (630) 555-0100 |
| `contact.form.category.label` | Service category | Categoría de servicio |
| `contact.form.category.placeholder` | Select one… | Elige una… |
| `contact.form.category.residential` | Residential | Residencial |
| `contact.form.category.commercial` | Commercial | Comercial |
| `contact.form.category.hardscape` | Hardscape | Hardscape |
| `contact.form.category.other` | Other | Otra |
| `contact.form.message.label` | Message | Mensaje |
| `contact.form.message.placeholder` | Tell us what you're thinking about… (optional) | Cuéntanos qué tienes en mente… (opcional) |
| `contact.form.submit` | Send message | Enviar mensaje |
| `contact.form.submit.pending` | Sending… | Enviando… |
| `contact.form.error.required_fields` | Please complete the required fields. | Por favor completa los campos obligatorios. |
| `contact.form.error.name_empty` | Please enter your name. | Por favor escribe tu nombre. |
| `contact.form.error.email_phone_empty` | Provide email or phone. | Proporciona correo o teléfono. |
| `contact.form.error.email_invalid` | That email address looks incomplete. | Ese correo parece incompleto. |
| `contact.form.error.phone_invalid` | Please enter a valid phone number. | Por favor escribe un teléfono válido. |
| `contact.form.error.generic` | Something went wrong. Try again or call (630) 946-9321. | Algo salió mal. Intenta de nuevo o llama al (630) 946-9321. |
| `contact.form.success.title` | Thanks. | Gracias. |
| `contact.form.success.body` | Erick will be in touch within 24 hours. | Erick se comunicará en menos de 24 horas. |
| `contact.map.aria` | Map showing 1630 Mountain St, Aurora, IL | Mapa que muestra 1630 Mountain St, Aurora, IL |
| `contact.map.label` | Sunset Services | Sunset Services |
| `contact.calendly.eyebrow` | Book directly | Reserva directamente |
| `contact.calendly.h2` | Pick a 30-min slot. | Elige un espacio de 30 minutos. |
| `contact.calendly.body` | Erick reviews every booking before confirming. | Erick revisa cada reserva antes de confirmar. |
| `contact.calendly.coming_soon` | Coming soon | Próximamente |
| `contact.calendly.fallback.body` | Booking widget loads in Phase 2.07. Until then — | El sistema de reservas llega en la Fase 2.07. Mientras tanto — |
| `contact.calendly.fallback.cta` | Call (630) 946-9321 | Llama al (630) 946-9321 |
| `contact.area.eyebrow` | We serve | Atendemos |
| `contact.area.aurora` | Aurora | Aurora |
| `contact.area.naperville` | Naperville | Naperville |
| `contact.area.batavia` | Batavia | Batavia |
| `contact.area.wheaton` | Wheaton | Wheaton |
| `contact.area.lisle` | Lisle | Lisle |
| `contact.area.bolingbrook` | Bolingbrook | Bolingbrook |
| `contact.area.note` | Plus surrounding DuPage County. Not sure? | Más zonas cercanas del condado de DuPage. ¿No estás seguro? |
| `contact.area.note.cta` | Call us. | Llámanos. |

---

## 8. Motion choreography

| Page | Section | Variant | Stagger | Notes |
|---|---|---|---|---|
| About | Hero | None | — | First-paint; LCP discipline. No entrance animation on hero. |
| About | Brand story | `<AnimateIn fade-up>` on copy column + `<AnimateIn fade-left>` on image, **single shared trigger** | — | Same shared-trigger pattern as homepage About teaser (1.06 §13). One IntersectionObserver per section, not per element. |
| About | Team | `<StaggerContainer>` + 3 `<StaggerItem>` | 80ms (Phase 1.03 §7.4) | |
| About | Credentials | **Single** `<AnimateIn fade-up>` on the row | — | Do NOT stagger individual badges (Phase 1.07 lesson — keeps hydration/observer count down on mobile). |
| About | Projects teaser | Reuses `HomeProjectsTeaser` motion | — | Component reuse — motion is locked there. |
| About | CTA | `<AnimateIn fade-up>` | — | |
| Contact | Hero | None | — | First-paint. |
| Contact | Info + form | `<AnimateIn fade-up>` on the **whole section** | — | DO NOT animate individual form fields. A11y + Lighthouse anti-pattern. The fields are interactive surfaces; entrance motion delays input focus and hurts SR users. |
| Contact | Map | `<AnimateIn fade-up>` | — | |
| Contact | Calendly | `<AnimateIn fade-up>` | — | |
| Contact | Service-area strip | `<AnimateIn fade-up>` | — | Single trigger. Don't animate each city link. |

Reduced-motion contract per Phase 1.03 §7.7 is sitewide and applies here without per-component branching. All `<AnimateIn>` instances must respect `prefers-reduced-motion: reduce` (locked in the 1.04 component itself).

---

## 9. Accessibility audit

Per page checklist. Both pages must satisfy every item.

### 9.1 Both pages

- One `<h1>` per page; no skipped heading levels.
- Skip-link wraps `<main>` (locked Phase 1.05 chrome).
- Focus rings: locked Phase 1.03 token. Visible on every interactive element.
- Tap targets ≥44×44 CSS px (every link, every button, every form control).
- All photos have meaningful `alt` (no decorative `alt=""` on these pages — every photo is meaningful).
- Color contrast: every text/background pairing must clear AA. Phase 1.03 palette is pre-audited; the only new pairing this phase introduces is `--color-feedback-error` on `--color-bg-cream` (form errors on the cream form-card background). **Verify in Phase 1.12 smoke test.**
- Reduced-motion respected sitewide.
- All interactive elements reachable via keyboard, in DOM order.

### 9.2 About specific

- Team-card photos: `alt="Erick Valle"`, `alt="Nick Valle"`, `alt="Marcin [TBR]"`. Names ARE the meaningful alt — don't pad with "portrait of".
- Brand-story image: `alt` describes what's depicted, not the metaphor. If it's "Erick on a job site," that's the alt.
- Inline links to `/residential/` and `/hardscape/` use full-text accessible names ("See residential services", not "Click here").
- Credential-row badges are not interactive; they're informational. No `role` needed; semantic `<dl>` markup (`<dt>` title, `<dd>` caption) is the right shape.

### 9.3 Contact specific

- Phone number link: visible number IS the link text (`<a href="tel:+16309469321">(630) 946-9321</a>`). No "Call us" wrapper around it.
- Email link: same pattern (`<a href="mailto:…">info@sunsetservices.us</a>`).
- Address: marked up as `<address>`. Get-directions link has accessible name "Get directions to 1630 Mountain St, Aurora, IL" (visible "Get directions" + visually hidden completion via `<span class="sr-only">`).
- Hours: marked up as `<dl>` (term/description) so SR users can scan.
- Form:
  - Every input has a visible `<label>` linked via `htmlFor` / `id` (NOT placeholder-only).
  - Required fields: `aria-required="true"` AND a visible "(required)" suffix or chip — asterisks alone fail SC 1.3.1.
  - Group-required (email-or-phone): `<fieldset>` + `<legend>"Email or phone (one required)"</legend>` (D14 ratification).
  - Validation errors: per-field error in red `--color-feedback-error`, `id="<field>-error"`, linked via `aria-describedby` on the input. Error appears below the field.
  - Form-level error region above submit: `role="alert" aria-live="polite"` (announced when validation fails).
  - Success state: `role="status" aria-live="polite"`.
  - Honeypot: `aria-hidden="true"`, `tabindex="-1"`, `autocomplete="off"`, visually hidden via Phase 1.03 sr-only utility.
  - Submit button: native `<button type="submit">`. During pending state, `aria-busy="true"` and label changes to "Sending…".
- Map block:
  - Container has `aria-label="Map showing 1630 Mountain St, Aurora, IL"`.
  - The static placeholder image has `alt=""` (decorative — the address is conveyed by the visible card and the aria-label).
  - The wrapping link has accessible name "Open 1630 Mountain St, Aurora, IL in Google Maps".
- Calendly placeholder: container `<section aria-labelledby="calendly-heading">` with the H2 inside; the "Coming soon" chip is text content, not just a color cue.
- Service-area strip: each city is a real `<a href="/locations/<slug>/">` with full city name as text — not a chip with truncated label.
- Color-contrast: explicitly verify the red `--color-feedback-error` on the form card's `--color-bg` background and on the surrounding `--color-bg-cream` section.

---

## 10. Lighthouse 95+ implications

Both pages must hit ≥95 desktop AND mobile on all four metrics (Performance, Accessibility, Best Practices, SEO). Carrying the 1.07 mobile-Performance gap (P=86) as context — these pages should hydrate **less** than the homepage.

- **About — LCP candidate:** the hero photo. Apply locked LCP discipline: priority load, AVIF, ≤350KB, explicit width/height, blur placeholder. If D1 reverses to no-photo, LCP shifts to the H1 — easy.
- **Contact — LCP candidate:** **the H1** (D7 = no photo). H1 is text — trivial LCP. This is part of the rationale for D7.
- **Map block — Performance lever:** D8 = static placeholder = 0 third-party load. Live Google Maps iframe would be +400KB and 3 third-party domains. Defer to Part 2.
- **Calendly placeholder — Performance lever:** real Calendly = 200KB+ JS + 2 iframes. Part 1 = 0 load.
- **Form hydration:** the Contact form is the **only** client component on the Contact page. The rest of the page MUST be server components. Same boundary applies to About — no client components at all.
- **`<AnimateIn>` budget:** apply 1.08 §10's section-level (not item-level) animation rule. Phase 1.07 documented per-item animation as the suspected culprit on mobile. Form fields are a particular trap — never animate them individually.
- **Image budget per page:** About has 1 hero + 1 brand-story + 3 team = 5 photo loads. All AVIF, all ≤350KB hero / ≤200KB others, lazy below the fold. Contact has 0 photos (D7) + 1 SVG/AVIF static map illustration (≤80KB) = trivial.

---

## 11. Component file plan for Code

### 11.1 New components

```
src/components/sections/about/
  AboutHero.tsx                   # server
  AboutBrandStory.tsx             # server
  AboutTeam.tsx                   # server (renders <TeamCard> × 3 from data/team.ts)
  AboutCredentials.tsx            # server (renders <CredentialBadge> × 4–5)
  AboutCTA.tsx                    # server (thin wrapper that reuses HomeCTA structure with About copy)

src/components/sections/contact/
  ContactHero.tsx                 # server
  ContactInfoForm.tsx             # server WRAPPER — renders the info block + nests <ContactForm/>
  ContactMapPlaceholder.tsx       # server — Part-1 static placeholder; renamed/replaced in Part 2 by ContactMapEmbed
  ContactCalendlyPlaceholder.tsx  # server — Part-1 placeholder; replaced in Phase 2.07
  ContactServiceAreaStrip.tsx     # server

src/components/forms/
  ContactForm.tsx                 # CLIENT — the only client component on Contact

src/components/ui/
  TeamCard.tsx                    # small reusable
  CredentialBadge.tsx             # small reusable

src/data/
  team.ts                         # typed bilingual seed for the 3 team members
```

`team.ts` shape (mirrors `services.ts` from 1.09):

```ts
export type TeamMember = {
  slug: 'erick' | 'nick' | 'marcin';
  name: string;                        // not localized — names are names
  roleKey: 'owner' | 'founder' | 'hardscape_lead'; // → about.team.role.*
  bioKey: string;                      // → about.team.<slug>.bio
  photo: { src: string; aspect: '4x5' };
};
```

`ContactForm` props shape:

```ts
type ContactFormProps = {
  action?: (formData: FormData) => Promise<{ ok: true } | { ok: false; errors: Record<string, string> }>;
  // Part 1: action is undefined → submit is a no-op that fakes the success state after a delay for visual review.
  // Part 2: real server action wired here.
  locale: 'en' | 'es';
};
```

`AboutCTA` is a thin wrapper:

```tsx
export function AboutCTA() {
  return <HomeCTA copyNamespace="about.cta" destination="/request-quote/" />;
}
```

This requires `HomeCTA` (Phase 1.06) to accept `copyNamespace` + `destination` props. If the homepage component is hard-coded, **promote it to `CTA.tsx` in `src/components/sections/shared/`** and pass `copyNamespace`. Note the harmonization opportunity but **do not refactor the homepage** in this phase — flag for a Part-2 cleanup pass.

### 11.2 Reused components

- `<AnimateIn>`, `<StaggerContainer>`, `<StaggerItem>` — Phase 1.04.
- `<Breadcrumb>` — Phase 1.09 / 1.05.
- `<HomeProjectsTeaser>` — Phase 1.06 §8 (same component, no wrapper, no curation override).
- `<HomeCTA>` (or generalized `<CTA>`) — Phase 1.06 §9.
- Buttons (`btn--primary`, `btn--secondary`, `btn--ghost`), cards (`card--cream`), eyebrow chips, form-field primitives — Phase 1.03 §6.

### 11.3 Schema helpers

```
src/lib/schema/
  person.ts            # NEW — buildPersonSchema(member: TeamMember) → JSON-LD
  contactPage.ts       # NEW — buildContactPageSchema(locale) → JSON-LD
  breadcrumb.ts        # EXISTS — Phase 1.09. Reuse.
  organization.ts      # EXISTS — sitewide, Phase 1.05. Reuse @id reference.
```

### 11.4 Routes

```
src/app/[locale]/about/page.tsx        # server. metadata + <Person> × 3 + <BreadcrumbList>.
src/app/[locale]/contact/page.tsx      # server. metadata + <ContactPage> + <BreadcrumbList>.
                                       # Renders ContactInfoForm which nests the <ContactForm/> client island.
```

**Naming-conflict check:** Homepage uses `Home*`, audience template uses `Audience*`, service detail uses `Service*` — `About*` and `Contact*` namespaces don't collide. Folder namespacing isolates further.

---

## 12. Decisions needed (escalate to Claude Chat)

Each decision = options + recommendation + reasoning. Chat ratifies before Phase 1.12 starts.

| # | Decision | Options | Recommendation | Reasoning |
|---|---|---|---|---|
| **D1** | About hero photo subject | A. Erick portrait on-site · B. Erick + crew · C. Property only · D. No photo | **A** | The page sells *the person*. Property-only fails the "human" register. Crew dilutes "this is the owner." No-photo flattens the brand-impression. |
| **D2** | About brand-story layout | A. Two-column (image + 3 paragraphs) · B. Three-act vertical (3 photos × 3 moments) | **A** | Three-act needs 3 historical photos at usable resolution. Likely don't exist. Two-column matches the homepage About teaser pattern. |
| **D3** | Process strip on About | A. Skip · B. Include 5-step strip | **A** | Audience + service pages already carry contextual Process. About-level Process duplicates without trust signal. |
| **D4** | Team card layout | A. 3 peer cards, 4:5 photo · B. 3 cards, 1:1 · C. Featured Erick + 2 flankers | **A** | Equal weight reads as a team. 4:5 reads as people, 1:1 reads as LinkedIn avatars. Featured = "boss vs. staff" — wrong note. |
| **D5** | Credentials layout | A. 4-column row · B. 2×2 desktop grid | **A** | Credentials work as a *stripe* — the trust-signal register. 2×2 with only 4 items breaks visual weight. Reflows to 5-up if BBB slot is added. |
| **D6** | About CTA destination | A. `/request-quote/` · B. `/contact/` · C. No CTA | **A** | Site's primary capture is the wizard. About → /contact/ would compete with the wizard. |
| **D7** | Contact hero with photo | A. No photo (text only) · B. With photo | **A** | Photo on transactional page = LCP cost + register dilution. "Talk to a person" reads stronger on a clean cream/white surface. |
| **D8** | Map approach in Part 1 | A. Static placeholder image · B. Live Google Maps iframe · C. Lazy-load click-to-show | **A** | 0 third-party load on Lighthouse run. Live iframe lands in Part 2. C adds a UI affordance that doesn't earn its weight on a 1-location business. |
| **D9** | Calendly placeholder fallback | A. None · B. tel: link only · C. Link to existing Calendly URL if Erick has one | **B** for now; **C if Cowork confirms an active URL exists** | tel: is the safe fallback. Cowork to confirm. |
| **D10** | Service-area strip on Contact | A. Keep · B. Skip | **A** | Answers "do you serve my area?" without a click; SEO graph for crawlers; one row of vertical space. |
| **D11** | Contact CTA section | A. Skip · B. Keep with non-redundant copy ("Prefer the quick wizard?") | **A** | Page IS the conversion surface. A second CTA dilutes both. Footer's standard CTA strip closes the page. |
| **D12** | Hours of operation | Placeholder Mon–Fri 7–5 · Sat appt · Sun closed · 24/7 snow | Ratify placeholder; Cowork to confirm with Erick before Phase 1.12 | Placeholder is conservative + matches typical landscape-contractor cadence. |
| **D13** | Marcin's last name | Cowork to confirm | Surface as blocker for Phase 1.12 | Cannot ship `Person` JSON-LD with `Marcin [TBR]`. |
| **D14** | Group-required form pattern (email-or-phone) | A. `<fieldset>` + `<legend>` · B. Inline note above inputs · C. JS-only validation | **A** | Most accessible. Visible legend doubles as the inline note. Avoids JS-only patterns SR users miss. |
| **D15** | "since 2000" vs "26 years in 2026" wording | A. "since 2000" + "25+ years" · B. Year-specific copy | **A** | Doesn't drift year-over-year. "25+" leaves room as the count grows without copy edits. |
| **D16** | `HomeCTA` generalization | A. Promote to `<CTA>` shared, accept props · B. Duplicate component for `AboutCTA` · C. Hardcode About copy in homepage component | **A** if cheap; otherwise **B** | A is cleanest; B is acceptable; C is out-of-bounds (cross-page coupling). |
| **D17** | Team-card variant on white | A. `card--cream` (lift) · B. default white card with border | **A** | Cream card on white surface gives the team grid texture without inventing a variant. |
| **D18** | Open Graph image strategy | A. Photo crop + cream panel composite · B. Pure-text composite | **A** for About (photo earns the click), **B** for Contact (no photo on the page = consistent OG) | Matches the per-page register. |

---

## 13. Verification checklist (for Phase 1.12 Code)

After implementing, Code runs every item:

- [ ] About hero matches §3.1 SVG reference; LCP discipline applied (priority + AVIF + ≤350KB + explicit dims + blur placeholder); no entrance animation on hero.
- [ ] About brand-story matches §3.2 SVG; two-column desktop / single-column mobile; image is 4:5; copy budget respected.
- [ ] All 3 team cards render with `Person` JSON-LD per member; schema validates in Google's Rich Results Test.
- [ ] Team cards use `card--cream` variant; 4:5 photos; equal weight (no featured).
- [ ] `team.ts` exports the 3 members with the shape in §11.1.
- [ ] Credentials row matches §3.4 SVG reference; Unilock mark is the locked inline SVG (Phase 1.03 §8.3), NOT a third-party logo file.
- [ ] Credentials row uses a single `<AnimateIn fade-up>`, NOT staggered (per Phase 1.07 lesson).
- [ ] About projects teaser reuses `HomeProjectsTeaser` (or `ProjectsTeaser` if generalized) — no new component.
- [ ] About has exactly **one** body amber CTA (in §3.7) — no other amber buttons in `<main>`.
- [ ] About `Person` × 3, `BreadcrumbList` validate. About metadata renders title (≤60) + description (≤160) per §5.1.
- [ ] About surface alternation matches §2.3: hero white / story cream / team white / credentials cream / projects white / cta cream.
- [ ] Contact hero matches §4.1 SVG; **no photo** (D7); LCP is the H1.
- [ ] Contact info block: phone, email, address, "get directions ↗", hours, languages-spoken — all present and correctly marked up (`<address>`, `<dl>` for hours).
- [ ] Phone link is `tel:+16309469321`; visible number IS the accessible name.
- [ ] Contact form fields match §4.2 spec; honeypot present (sr-only, aria-hidden, tabindex=-1, autocomplete=off); required fields marked with `aria-required="true"` AND visible "(required)" suffix.
- [ ] Email-or-phone wrapped in `<fieldset>` + visible `<legend>` (D14).
- [ ] Per-field errors red, `aria-describedby`-linked. Form-level error region `role="alert" aria-live="polite"`. Success state `role="status" aria-live="polite"`.
- [ ] All four validation states render correctly: empty submit · invalid email · both email + phone empty · success.
- [ ] Submit button is **primary green `lg`**, NOT amber.
- [ ] `ContactForm` is the only client component on Contact; `AboutHero`/`AboutBrandStory`/`AboutTeam`/`AboutCredentials`/`AboutCTA`/`ContactHero`/`ContactInfoForm` (the wrapper)/`ContactMapPlaceholder`/`ContactCalendlyPlaceholder`/`ContactServiceAreaStrip` are all server components.
- [ ] Map block is the static placeholder per D8; wrapping link opens Google Maps; `aria-label` describes the address; image `alt=""` (decorative, address conveyed via card + aria-label).
- [ ] Calendly placeholder per §4.4: fallback is tel: link (D9) until Cowork confirms a real URL.
- [ ] Service-area strip per §4.5; each city is `<a href="/locations/<slug>/">` with full city name.
- [ ] Contact has **zero** body amber CTAs (D11).
- [ ] All `about.*` and `contact.*` strings present in both `en.json` and `es.json`. `[TBR]` strings flagged.
- [ ] Schema validates: `Person` × 3 on About, `ContactPage` on Contact, `BreadcrumbList` on both.
- [ ] Lighthouse run on `localhost:3000` for `/about/` and `/contact/`, desktop + mobile, hits ≥95 on all four metrics.
- [ ] Reduced-motion behavior verified: all `<AnimateIn>` instances respect `prefers-reduced-motion: reduce`.
- [ ] Phase 1.07 homepage still works after these pages land.
- [ ] All form validation messages tested at 200% browser zoom (per Phase 1.03 a11y notes).
- [ ] Color contrast for `--color-feedback-error` red on the form-card surface (`--color-bg`) verified ≥4.5:1.
- [ ] Marcin's last name resolved per D13 before merging.
- [ ] No new component variants introduced (button, card, badge primitives unchanged).

---

**End of Phase 1.11 Design handover.**
