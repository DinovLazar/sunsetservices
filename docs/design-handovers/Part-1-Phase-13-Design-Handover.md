# Part 1 — Phase 13 — Service Areas + Location Pages (Design Handover)

**Phase:** 1.13
**Type:** Design (Code follows in Phase 1.14)
**Operator:** Claude Design
**Reads from:** `Sunset-Services-Plan.md`, `Sunset-Services-Project-Instructions.md`, `Part-1-Phase-03-Design-Handover.md` (locked tokens), `Part-1-Phase-05-Design-Handover.md` (chrome contract), `Part-1-Phase-06-Design-Handover.md` (homepage patterns), `Part-1-Phase-07-Completion.md` (homepage Lighthouse-mobile gap), `Part-1-Phase-08-Design-Handover.md` (audience-landing + service-detail templates), `Part-1-Phase-09-Completion.md` (template-execution lessons), `Part-1-Phase-11-Design-Handover.md` (About + Contact patterns), `Part-1-Phase-12-Completion.md` (current `ServiceAreaStrip` href shape).
**Hands off to:** Claude Code, Phase 1.14.

---

## 0. Read this first

This handover designs **two routes** that turn the site into a credible local-SEO surface for DuPage County:

- **Service Areas index** at `/service-areas/` (and `/es/service-areas/`).
- **Location page template** that powers six city pages: `aurora`, `naperville`, `batavia`, `wheaton`, `lisle`, `bolingbrook` (and the same six under `/es/service-areas/<city>/`).

These pages exist because Google ranks "landscaping near me" by domain authority + local relevance, and because a homeowner in Wheaton wants to see "yes, we work in Wheaton" before they pick up the phone. They are **not** sales pages — the homepage and audience landings carry the sales load. They prove geographic legitimacy and feed the schema graph.

The bar is unchanged: **as professional as possible with no shortcuts**, Lighthouse ≥95 desktop AND mobile, WCAG 2.2 AA. **Compose; do not invent** — every spec references a locked token or component. No new component variants. Phase 1.07 mobile-Performance lesson (P=86) carries forward: section-level `<AnimateIn>` only, never per-item; static placeholder over third-party iframe in Part 1.

---

## 1. Scope and constraints

### In scope
- **Service Areas index** (`/service-areas/`) — every section, EN + ES strings, photography/illustration brief, schema, motion, a11y audit, decisions surfaced.
- **Location page template** — one master template applied to six city pages. Same structure for all six; only content varies (city name, lat/lng, local copy, projects filter, neighbor cities).
- **Per-city seed table** (§11) — typed bilingual seed shape modelled on `services.ts` (Phase 1.09) that the six pages read from.
- **New components, server-default:** `LocationCard`, `ServiceAreaMap` (static SVG), `LocalTrustBand`, `NeighborCitiesStrip` (or `ServiceAreaStrip` reuse — see D7b). Specced in §11.
- **Reuse:** `Breadcrumb`, `FaqAccordion`, `ServiceCard`, `ProjectCard`, `ServiceAreaStrip` (see D1 reconciliation), `CTA` (the promoted `HomeCTA`), `<AnimateIn>`, `<StaggerContainer>`, `<StaggerItem>`.

### Out of scope
- Real photography selection (Phase 2.04, Cowork from Drive).
- Real Google Maps embed (Phase 2.07 at the earliest — Part 1 ships a static SVG only; D4).
- Real local-projects content (Phase 1.15 design / 1.16 code) — Part 1 ships placeholder tiles.
- Real Google reviews — placeholder testimonial copy only (Google Places API in Phase 2.15).
- Final marketing prose — Erick polishes in Part 2.
- Privacy / Terms (Phase 3.03), Quote Wizard (1.19), AI chat widget (1.19).
- Real per-city lat/lng with map-pin precision — Cowork confirms in Phase 2.07. Part 1 uses representative public-source values; the seed table accepts the real numbers without a re-design.

### Locked from earlier phases — DO NOT redesign
- **All design tokens** (1.03 §2–§7) — colors, type scale, spacing, radius, shadow, motion, z-index, breakpoints. **No new tokens.**
- **All component primitives** (1.03 §6) — button (Primary green / Amber / Ghost / Secondary), card (`card-photo` / `card-cream` / `card-featured`), badge, breadcrumb, eyebrow, FAQ accordion, form fields. **No new variants.**
- **Chrome** (1.05) — navbar, footer, language switcher, skip-link wrap, mobile drawer.
- **Section rhythm** (1.03 §9) — `py-20` desktop / `py-14` mobile, alternating `--color-bg` / `--color-bg-cream`, never two adjacent same-surface bands.
- **Amber discipline** (1.05 §1) — navbar amber is chrome and does not count. Each body page gets **one** amber CTA in the bottom CTA section. The location-page hero's primary button is **Primary green**, not amber.
- **Motion contract** (1.03 §7 + 1.04 + 1.07 lesson) — `<AnimateIn>` at section granularity only; never on individual list items, project tiles, or form fields. Hero has no entrance animation. Reduced-motion: opacity-only.
- **FAQ no-wrapper-per-item rule** (1.08 §3.7) — `<details>` items render directly inside the section.
- **Single amber CTA per page** (1.06 / 1.08 / 1.09 §6).
- **Breadcrumb + JSON-LD same-source rule** (1.09 §2).

This phase produces one file: `Part-1-Phase-13-Design-Handover.md`. Inline annotated SVGs are the deliverable medium. No code is written here. Phase 1.14 (Code) consumes this file plus Chat ratification of §12 below.

---

## 2. Page-level decisions

Every D-item from the prompt, resolved. Format: chosen option, one-sentence rationale, locked-phase reference. Items genuinely needing external input are marked **[blocker — Cowork]** and surfaced again in §12.

### D1 — Canonical URL pattern → **A. `/service-areas/<city>/`**
Resolves the `Sunset-Services-Plan.md` §3 vs Phase 1.11 `ServiceAreaStrip` href conflict in favor of the canonical Plan. The `-il` suffix is redundant — the page's `<title>`, H1, breadcrumb, and `Place` schema all carry "Aurora, IL." (Plan §3, Phase 1.09 routing pattern.)
**Follow-up Phase 1.14 owns:** update `ServiceAreaStrip.tsx` href construction to `/service-areas/<slug>/`. Surfaced in §13 verification checklist.

### D2 — City slug shape → **bare slug (`aurora`)**
Matches Plan §3. SEO loss from dropping `-il` is negligible (Google reads location signal from `<title>`, H1, breadcrumb, and `Place` schema, not slug). Cleaner; no future tie-breaker breakage if Sunset expands beyond IL. (Plan §3.)

### D3 — Service Areas index hero treatment → **C. Split (text + static SVG map of DuPage with the six pins)**
The map IS the content of this page. C presents the map as a first-class element, keeps the page text-led at the H1 register, has the lowest photo budget (no hero photo = trivial LCP), and reads as deliberately informational — which suits the SEO purpose. (1.06 §5 hero variants; 1.07 LCP discipline.) Surfaced as choosable: A (full-bleed photo) and B (compact text + map below) listed in §12 as alternates.

### D4 — Map representation in Part 1 → **A. Static SVG illustration**
Echoes Phase 1.11 D8. Zero third-party load on Lighthouse. SVG is small (≤80KB), animatable on hover (subtle pin-bounce, reduced-motion-respecting), accessibility-friendly with `<title>` + `<desc>` + per-pin `<a>` wrappers. Phase 2.07 may swap to a Google Maps iframe **only** if Erick wants the live UX — otherwise A ships to launch. (Phase 1.11 D8 precedent.)

### D5 — Location-page hero layout → **B. Compact split (local photo right 40%, copy + microbar left 60%, ~50vh)**
A (full-bleed) is too tall for a transactional page reached via "Sunset Services Naperville" search — the user wants city + proof points immediately. C (no photo) ships fastest but reads as cheap on a premium-clientele site. B carries a real photo at half the byte cost of A and lets H1 + sub + microbar all sit above the fold. (1.06 §5; 1.08 §3.1.) A and C surfaced in §12 as alternates.

### D6 — Per-city service curation count → **B. 6 services per city, fixed count**
A (16 services) overwhelms and dilutes local-relevance signal. C (4) feels thin. 6 hits the sweet spot. Seed table ships with `featuredServiceSlugs: string[]` of length 6 per city. Curation guidance (Erick refines later):
- **Aurora** (HQ): 2 hardscape + 2 residential + 2 commercial — full-spectrum signal.
- **Naperville** (premium): 4 hardscape + 2 residential — wealthy-suburb hardscape hub.
- **Wheaton** (established affluent): 3 hardscape + 3 residential.
- **Batavia** (riverside, smaller): 3 residential + 2 hardscape + 1 commercial.
- **Lisle** (corporate corridor): 3 commercial + 2 residential + 1 hardscape.
- **Bolingbrook** (suburban-commercial mix): 3 commercial + 3 residential.

### D7 — Local projects on city pages → **A. Real projects from that city, with graceful fallback**
If a city has zero in-portfolio projects, render the closest 3 from neighbor cities labelled with the **actual** project city (NOT the page city — faking the city is a trust kill). Part 1 ships placeholder tiles with city captions matching the page; Phase 1.16 wires the real filter.

### D7b — Neighbor cities strip implementation → **Reuse `ServiceAreaStrip` with new `excludeSlug` prop**
The Phase 1.11 `ServiceAreaStrip` already exists, already styled, already in the chrome rotation. Adding an `excludeSlug?: string` prop is a 3-line spec change that hides the current city and shows the other 5. A fresh `NeighborCitiesStrip` would duplicate the shape. Surfaced as a 1-line spec change Phase 1.14 owns; see §11 and §13.

### D8 — Local FAQ pattern → **A. Per-city tailored FAQ, 4 Q&As**
Per-city FAQs feed `FAQPage` schema with unique answers per URL — Google rewards uniqueness. B (shared) is duplicate-content-adjacent; C (none) leaves intent-rich queries unanswered on the page where the user is asking. Limit to **4 Q&As per city** to keep `FAQPage` crisp. Question pattern (per city, varied):
1. Do you charge a travel fee to <city>?
2. How long has Sunset Services been working in <city>?
3. Are you familiar with <city>'s permit process for [hardscape / patios / retaining walls]?
4. (City-specific) — e.g., Naperville: HOA approval support; Lisle: commercial-property scheduling.

### D9 — Local trust band content → **A. Three stat cells**
Three stats fits the audience-landing precedent (1.08 §3). Stat cells are static text — no extra motion, no hydration cost. The third stat ("response time") is differentiating and matches Plan §11 lead-capture promise.
- **Cell 1:** "<N>+ years serving <city>" `[TBR — Cowork]`
- **Cell 2:** "<N>+ projects completed in <city>" `[TBR — Cowork]`
- **Cell 3:** "Free estimates within <X> business days" `[TBR — Cowork]`

### D10 — Surface alternation (locked)

**Service Areas index (5 sections):**
| # | Section | Surface |
|---|---|---|
| 1 | Hero (text + map) | `--color-bg` |
| 2 | Cities grid | `--color-bg-cream` |
| 3 | "Outside our area?" band | `--color-bg` |
| 4 | CTA | `--color-bg-cream` |

> Note vs prompt: prompt suggested map → cream → grid → white → cream-band → cream-CTA. That introduces two adjacent cream bands (band → CTA). To preserve the strict "never two adjacent same-surface" rule (1.03 §9), the map is folded into the hero (D3 = split) and the CTA stays cream — matching the homepage CTA precedent (1.06 §17).

**Location page (9 sections):**
| # | Section | Surface |
|---|---|---|
| 1 | Hero | `--color-bg` |
| 2 | LocalTrustBand | `--color-bg-cream` |
| 3 | Services we offer in <city> | `--color-bg` |
| 4 | Local projects strip | `--color-bg-cream` |
| 5 | Local testimonials | `--color-bg` |
| 6 | Why hire local — family panel | `--color-bg-cream` |
| 7 | Neighbor cities strip | `--color-bg` |
| 8 | Local FAQ | `--color-bg-cream` |
| 9 | CTA | `--color-bg` |

Verified: no two adjacent same-surface bands.

### D11 — Body amber CTA placement → **bottom CTA section only (one per page)**
Both pages place the single amber CTA in the bottom CTA section, destination `/request-quote/`. (1.06 / 1.08 / 1.11 D6 lock.)

### D12 — Featured-card uses → **No `.card-featured` on either page**
Cities grid uses `.card-photo`; service grid uses the locked service-card pattern; bottom CTA is the only amber. (1.06 D2 constraint: featured-card cannot live in the same page as the amber CTA.)

---

## 3. Service Areas index — page design

Container: `--container-default` (1200px). Horizontal padding: `px-4 sm:px-6 lg:px-8 xl:px-12`. Section padding: `py-20` desktop / `py-14` mobile.

**SVG legend (used throughout §3 and §4):**
- Gray hatched rectangles = photo placeholders (Cowork sources Phase 2.04).
- Dashed teal lines = spacing rulers, labelled with `--spacing-*`.
- Magenta callouts = type-token annotations (`--text-h1-d`, etc.).
- Dotted outlines = component-primitive boundaries.
- Literal hex appears only inside `fill`/`stroke`; SVG cannot consume CSS variables.

### 3.1 Hero (split: text left, static SVG map right) — surface `--color-bg`

**H1 EN:** "Where we work — DuPage County, Illinois."
**H1 ES:** "Donde trabajamos — Condado de DuPage, Illinois."
**Sub EN:** "Family-run since 2000. Six cities, one crew, one phone number."
**Sub ES:** "Familiar desde el año 2000. Seis ciudades, un solo equipo, un solo teléfono."
**Primary CTA:** Primary green × lg → `/request-quote/` ("Request a free estimate" / "Solicita un presupuesto gratis").
**Secondary text-link:** "or call (630) 946-9321" / "o llama al (630) 946-9321" — `tel:+16309469321`.
**No entrance animation.** (1.07 lock.)

#### Desktop SVG — index hero (1280 × 720)

```svg
<svg viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Service Areas index hero — desktop">
  <rect width="1280" height="720" fill="#FFFFFF"/>

  <!-- Container guides (--container-default 1200, px-12 → content from 80 to 1200) -->
  <g stroke="#9DD9C9" stroke-width="1" stroke-dasharray="4 4" fill="none">
    <line x1="80" y1="0" x2="80" y2="720"/>
    <line x1="1200" y1="0" x2="1200" y2="720"/>
  </g>

  <!-- LEFT: copy column (560px) -->
  <!-- Breadcrumb -->
  <g transform="translate(80,140)">
    <text font-family="ui-sans-serif" font-size="13" fill="#6B6B6B">Home</text>
    <text x="40" font-family="ui-sans-serif" font-size="13" fill="#6B6B6B">/</text>
    <text x="56" font-family="ui-sans-serif" font-size="13" fill="#1A1A1A" font-weight="500">Service Areas</text>
  </g>

  <!-- Eyebrow chip -->
  <rect x="80" y="180" width="156" height="28" rx="14" fill="#F1F5EE"/>
  <text x="158" y="199" font-family="ui-sans-serif" font-size="12" font-weight="600" letter-spacing="1.4" fill="#2F5D27" text-anchor="middle">SERVICE AREAS</text>

  <!-- H1 -->
  <text x="80" y="276" font-family="Manrope,sans-serif" font-size="56" font-weight="700" fill="#1A1A1A" letter-spacing="-0.02em">Where we work —</text>
  <text x="80" y="332" font-family="Manrope,sans-serif" font-size="56" font-weight="700" fill="#1A1A1A" letter-spacing="-0.02em">DuPage County, Illinois.</text>

  <!-- Lead -->
  <text x="80" y="392" font-family="Onest,sans-serif" font-size="20" fill="#4A4A4A">Family-run since 2000. Six cities,</text>
  <text x="80" y="420" font-family="Onest,sans-serif" font-size="20" fill="#4A4A4A">one crew, one phone number.</text>

  <!-- CTAs -->
  <g transform="translate(80,464)">
    <rect width="240" height="52" rx="8" fill="#4D8A3F"/>
    <text x="120" y="33" font-family="Manrope,sans-serif" font-size="17" font-weight="600" fill="#FFFFFF" text-anchor="middle">Request a free estimate</text>
  </g>
  <text x="340" y="498" font-family="Onest,sans-serif" font-size="15" fill="#2F5D27" text-decoration="underline">or call (630) 946-9321</text>

  <!-- RIGHT: static map column (560×440) -->
  <g transform="translate(640,160)">
    <rect width="560" height="440" rx="16" fill="#FAF7F1"/>
    <!-- DuPage outline (simplified) -->
    <path d="M60,80 L500,70 L520,160 L500,260 L460,360 L320,380 L160,370 L80,300 L50,200 Z"
          fill="#F1F5EE" stroke="#8FB67A" stroke-width="2"/>
    <!-- North arrow -->
    <g transform="translate(490,30)">
      <polygon points="8,0 16,16 8,12 0,16" fill="#2F5D27"/>
      <text x="8" y="36" font-family="ui-sans-serif" font-size="10" fill="#2F5D27" text-anchor="middle" font-weight="600">N</text>
    </g>

    <!-- Pins (6) -->
    <!-- Aurora SW -->
    <g><circle cx="120" cy="290" r="9" fill="#4D8A3F" stroke="#FFFFFF" stroke-width="2"/>
       <text x="120" y="320" font-family="Manrope,sans-serif" font-size="13" font-weight="600" fill="#1A1A1A" text-anchor="middle">Aurora</text></g>
    <!-- Naperville S -->
    <g><circle cx="220" cy="320" r="9" fill="#4D8A3F" stroke="#FFFFFF" stroke-width="2"/>
       <text x="220" y="350" font-family="Manrope,sans-serif" font-size="13" font-weight="600" fill="#1A1A1A" text-anchor="middle">Naperville</text></g>
    <!-- Batavia W -->
    <g><circle cx="100" cy="170" r="9" fill="#4D8A3F" stroke="#FFFFFF" stroke-width="2"/>
       <text x="100" y="155" font-family="Manrope,sans-serif" font-size="13" font-weight="600" fill="#1A1A1A" text-anchor="middle">Batavia</text></g>
    <!-- Wheaton C -->
    <g><circle cx="260" cy="180" r="9" fill="#4D8A3F" stroke="#FFFFFF" stroke-width="2"/>
       <text x="260" y="165" font-family="Manrope,sans-serif" font-size="13" font-weight="600" fill="#1A1A1A" text-anchor="middle">Wheaton</text></g>
    <!-- Lisle E -->
    <g><circle cx="350" cy="240" r="9" fill="#4D8A3F" stroke="#FFFFFF" stroke-width="2"/>
       <text x="350" y="270" font-family="Manrope,sans-serif" font-size="13" font-weight="600" fill="#1A1A1A" text-anchor="middle">Lisle</text></g>
    <!-- Bolingbrook SE -->
    <g><circle cx="380" cy="340" r="9" fill="#4D8A3F" stroke="#FFFFFF" stroke-width="2"/>
       <text x="380" y="370" font-family="Manrope,sans-serif" font-size="13" font-weight="600" fill="#1A1A1A" text-anchor="middle">Bolingbrook</text></g>
  </g>

  <!-- Annotations -->
  <g font-family="ui-monospace,monospace" font-size="11" fill="#C2185B">
    <text x="80" y="216">eyebrow · --text-eyebrow · --color-sunset-green-700</text>
    <text x="80" y="252">H1 · --text-h1 (clamp 36→56) · weight 700 · letter-spacing -0.02em</text>
    <text x="80" y="450">Primary × lg · 240×52 · radius --radius-md (8) · bg --color-sunset-green-500</text>
    <text x="640" y="148">Static SVG map · 560×440 · --radius-lg (16) · bg --color-bg-cream</text>
    <text x="640" y="616">land fill --color-sunset-green-50 · outline --color-sunset-green-300 2px</text>
    <text x="640" y="636">pins · 18×18 · --color-sunset-green-500 · 2px white halo</text>
  </g>
</svg>
```

#### Mobile SVG — index hero (390 × 760)

```svg
<svg viewBox="0 0 390 760" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Service Areas index hero — mobile">
  <rect width="390" height="760" fill="#FFFFFF"/>
  <!-- Breadcrumb -->
  <text x="16" y="60" font-family="ui-sans-serif" font-size="12" fill="#6B6B6B">Home / <tspan fill="#1A1A1A" font-weight="500">Service Areas</tspan></text>
  <!-- Eyebrow -->
  <rect x="16" y="80" width="140" height="24" rx="12" fill="#F1F5EE"/>
  <text x="86" y="97" font-family="ui-sans-serif" font-size="11" font-weight="600" letter-spacing="1.3" fill="#2F5D27" text-anchor="middle">SERVICE AREAS</text>
  <!-- H1 (mobile clamp = 36px) -->
  <text x="16" y="148" font-family="Manrope,sans-serif" font-size="36" font-weight="700" fill="#1A1A1A">Where we work —</text>
  <text x="16" y="188" font-family="Manrope,sans-serif" font-size="36" font-weight="700" fill="#1A1A1A">DuPage County,</text>
  <text x="16" y="228" font-family="Manrope,sans-serif" font-size="36" font-weight="700" fill="#1A1A1A">Illinois.</text>
  <!-- Lead -->
  <text x="16" y="268" font-family="Onest,sans-serif" font-size="18" fill="#4A4A4A">Family-run since 2000. Six</text>
  <text x="16" y="290" font-family="Onest,sans-serif" font-size="18" fill="#4A4A4A">cities, one crew, one phone.</text>
  <!-- CTA -->
  <rect x="16" y="320" width="358" height="52" rx="8" fill="#4D8A3F"/>
  <text x="195" y="353" font-family="Manrope,sans-serif" font-size="17" font-weight="600" fill="#FFFFFF" text-anchor="middle">Request a free estimate</text>
  <text x="16" y="396" font-family="Onest,sans-serif" font-size="15" fill="#2F5D27" text-decoration="underline">or call (630) 946-9321</text>

  <!-- Map below -->
  <g transform="translate(16,420)">
    <rect width="358" height="320" rx="16" fill="#FAF7F1"/>
    <path d="M40,60 L320,52 L334,118 L320,200 L292,260 L208,272 L100,266 L52,220 L32,150 Z"
          fill="#F1F5EE" stroke="#8FB67A" stroke-width="2"/>
    <g><circle cx="78" cy="208" r="7" fill="#4D8A3F" stroke="#FFFFFF" stroke-width="2"/>
       <text x="78" y="230" font-family="Manrope,sans-serif" font-size="11" font-weight="600" fill="#1A1A1A" text-anchor="middle">Aurora</text></g>
    <g><circle cx="142" cy="232" r="7" fill="#4D8A3F" stroke="#FFFFFF" stroke-width="2"/>
       <text x="142" y="254" font-family="Manrope,sans-serif" font-size="11" font-weight="600" fill="#1A1A1A" text-anchor="middle">Naperville</text></g>
    <g><circle cx="64" cy="124" r="7" fill="#4D8A3F" stroke="#FFFFFF" stroke-width="2"/>
       <text x="64" y="112" font-family="Manrope,sans-serif" font-size="11" font-weight="600" fill="#1A1A1A" text-anchor="middle">Batavia</text></g>
    <g><circle cx="166" cy="130" r="7" fill="#4D8A3F" stroke="#FFFFFF" stroke-width="2"/>
       <text x="166" y="118" font-family="Manrope,sans-serif" font-size="11" font-weight="600" fill="#1A1A1A" text-anchor="middle">Wheaton</text></g>
    <g><circle cx="222" cy="174" r="7" fill="#4D8A3F" stroke="#FFFFFF" stroke-width="2"/>
       <text x="222" y="196" font-family="Manrope,sans-serif" font-size="11" font-weight="600" fill="#1A1A1A" text-anchor="middle">Lisle</text></g>
    <g><circle cx="244" cy="244" r="7" fill="#4D8A3F" stroke="#FFFFFF" stroke-width="2"/>
       <text x="244" y="266" font-family="Manrope,sans-serif" font-size="11" font-weight="600" fill="#1A1A1A" text-anchor="middle">Bolingbrook</text></g>
  </g>
  <text x="16" y="754" font-family="ui-monospace,monospace" font-size="9" fill="#C2185B">map stacks below copy on mobile · full-width · same SVG, scaled</text>
</svg>
```

### 3.2 Static map block (production-ready SVG)

This SVG IS what Code ships. Each pin is a real `<a href="/service-areas/<slug>/">` wrapping a `<circle>` + `<text>` label. The accessible name is the visible text. Hover state: pin and label `transform: translateY(-2px)` over `--motion-fast` (150ms) `--easing-standard`, with `prefers-reduced-motion: reduce` short-circuit (no transform).

**SVG `<title>` (short, screen-reader landmark):**
- EN: "Map of DuPage County showing Sunset Services' six service areas."
- ES: "Mapa del Condado de DuPage mostrando las seis áreas de servicio de Sunset Services."

**SVG `<desc>` (longer description):**
- EN: "An illustrated map of DuPage County, Illinois, with six pins marking the cities Sunset Services works in: Aurora, Naperville, Batavia, Wheaton, Lisle, and Bolingbrook. Each pin is a link to that city's service-area page."
- ES: "Un mapa ilustrado del Condado de DuPage, Illinois, con seis pines que marcan las ciudades donde trabaja Sunset Services: Aurora, Naperville, Batavia, Wheaton, Lisle y Bolingbrook. Cada pin enlaza a la página de su ciudad."

**Production map SVG** (Code lifts as-is, replaces `aria-label` and pin `<text>` per locale via the `messages/{locale}.json` `serviceAreas.map.*` namespace):

```svg
<svg viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg" role="img" width="100%" height="auto"
     aria-labelledby="sa-map-title sa-map-desc">
  <title id="sa-map-title">{{ serviceAreas.map.title }}</title>
  <desc  id="sa-map-desc">{{ serviceAreas.map.desc }}</desc>

  <!-- Background land fill (county shape — simplified, recognizable not survey-grade) -->
  <path d="M70,90 L520,80 L545,180 L530,300 L478,400 L320,420 L150,408 L78,330 L48,210 Z"
        fill="#F1F5EE" stroke="#8FB67A" stroke-width="2" stroke-linejoin="round"/>

  <!-- Subtle inner contour -->
  <path d="M120,150 L460,148 L478,260 L420,360 L300,374 L180,366 L120,310 L100,220 Z"
        fill="none" stroke="#B8D2A8" stroke-width="1" stroke-dasharray="3 4"/>

  <!-- "DuPage County, IL" overlay label -->
  <text x="300" y="60" font-family="Manrope,sans-serif" font-size="14" font-weight="600"
        fill="#2F5D27" text-anchor="middle" letter-spacing="0.08em">DUPAGE COUNTY · IL</text>

  <!-- North arrow -->
  <g transform="translate(540,30)">
    <polygon points="6,0 12,14 6,11 0,14" fill="#2F5D27"/>
    <text x="6" y="32" font-family="ui-sans-serif" font-size="10" fill="#2F5D27" text-anchor="middle" font-weight="600">N</text>
  </g>

  <!-- Pins (each pin: <a> wraps both circle and text label) -->
  <!-- Aurora -->
  <a href="/service-areas/aurora/" class="sa-pin">
    <circle cx="140" cy="320" r="10" fill="#4D8A3F" stroke="#FFFFFF" stroke-width="2.5"/>
    <text x="140" y="350" font-family="Manrope,sans-serif" font-size="14" font-weight="600"
          fill="#1A1A1A" text-anchor="middle">Aurora</text>
  </a>
  <!-- Naperville -->
  <a href="/service-areas/naperville/" class="sa-pin">
    <circle cx="240" cy="350" r="10" fill="#4D8A3F" stroke="#FFFFFF" stroke-width="2.5"/>
    <text x="240" y="380" font-family="Manrope,sans-serif" font-size="14" font-weight="600"
          fill="#1A1A1A" text-anchor="middle">Naperville</text>
  </a>
  <!-- Batavia -->
  <a href="/service-areas/batavia/" class="sa-pin">
    <circle cx="118" cy="190" r="10" fill="#4D8A3F" stroke="#FFFFFF" stroke-width="2.5"/>
    <text x="118" y="178" font-family="Manrope,sans-serif" font-size="14" font-weight="600"
          fill="#1A1A1A" text-anchor="middle">Batavia</text>
  </a>
  <!-- Wheaton -->
  <a href="/service-areas/wheaton/" class="sa-pin">
    <circle cx="282" cy="200" r="10" fill="#4D8A3F" stroke="#FFFFFF" stroke-width="2.5"/>
    <text x="282" y="188" font-family="Manrope,sans-serif" font-size="14" font-weight="600"
          fill="#1A1A1A" text-anchor="middle">Wheaton</text>
  </a>
  <!-- Lisle -->
  <a href="/service-areas/lisle/" class="sa-pin">
    <circle cx="370" cy="270" r="10" fill="#4D8A3F" stroke="#FFFFFF" stroke-width="2.5"/>
    <text x="370" y="300" font-family="Manrope,sans-serif" font-size="14" font-weight="600"
          fill="#1A1A1A" text-anchor="middle">Lisle</text>
  </a>
  <!-- Bolingbrook -->
  <a href="/service-areas/bolingbrook/" class="sa-pin">
    <circle cx="402" cy="370" r="10" fill="#4D8A3F" stroke="#FFFFFF" stroke-width="2.5"/>
    <text x="402" y="400" font-family="Manrope,sans-serif" font-size="14" font-weight="600"
          fill="#1A1A1A" text-anchor="middle">Bolingbrook</text>
  </a>

  <style><![CDATA[
    .sa-pin { cursor: pointer; transition: transform var(--motion-fast, 150ms) var(--easing-standard, ease); transform-origin: center; transform-box: fill-box; }
    .sa-pin:hover, .sa-pin:focus-visible { transform: translateY(-2px); }
    .sa-pin:focus-visible circle { stroke: #6FA85F; stroke-width: 3; }
    @media (prefers-reduced-motion: reduce) {
      .sa-pin, .sa-pin:hover, .sa-pin:focus-visible { transform: none; }
    }
  ]]></style>
</svg>
```

**Spec (for Code):**
- File size budget: ≤80KB (this SVG is ~3KB; well under).
- Emit two copies — one in EN page (`title` / `desc` strings from `serviceAreas.map.*`), one in ES page (same SVG, localized title/desc/labels via the i18n table). Pin labels are visible text inside each `<a>` (NOT `aria-label` — see a11y §9).
- `<a href>` must be a real `<Link>` from `@/i18n/navigation` so locale prefixing works (1.09 lock).
- Each pin's accessible name resolves to "<City>" via the visible `<text>` — supplemented by the pin's `<a>` having a `title="<City>, IL — view location page"` attribute for tooltip + extra screen-reader context.

### 3.3 Cities grid — surface `--color-bg-cream`

6 `LocationCard`s. Layout: **3×2 desktop / 2×3 tablet / 1-column at <480px**. Each card uses `.card-photo` (locked, 1.06 §5.5) — full-bleed photo, content overlay with bottom-up gradient.

**Card composition (LocationCard):**
- Photo, 4:3, ≤200KB AVIF, lazy below fold.
- City name — `--text-h5` (17/20 mobile/desktop), weight 600, color `--color-text-on-dark`.
- One-line tagline — `--text-body-sm`, `--color-text-on-dark` @ 0.85 opacity.
- "View →" affordance — bottom-right, `--text-body-sm`, `aria-hidden="true"`.
- Full card is a single `<a href="/service-areas/<slug>/">` (full-card click target). Accessible name = "<City>, IL — view services and local projects".

**Card hover:** image scales to 1.03 over `--motion-slow` `--easing-soft`; shadow promotes from `--shadow-card` to `--shadow-hover`. (Per locked `.card-photo` rule, 1.03 §6.2.) Reduced-motion: scale stays at 1.0.

#### Desktop SVG — cities grid (1280 × 760)

```svg
<svg viewBox="0 0 1280 760" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cities grid — desktop">
  <rect width="1280" height="760" fill="#FAF7F1"/>

  <!-- Section header -->
  <rect x="80" y="80" width="120" height="24" rx="12" fill="#FFFFFF"/>
  <text x="140" y="96" font-family="ui-sans-serif" font-size="11" font-weight="600" letter-spacing="1.3" fill="#2F5D27" text-anchor="middle">SIX CITIES</text>
  <text x="80" y="148" font-family="Manrope,sans-serif" font-size="40" font-weight="700" fill="#1A1A1A" letter-spacing="-0.015em">Pick your city.</text>
  <text x="80" y="194" font-family="Onest,sans-serif" font-size="18" fill="#4A4A4A">Each page covers the services that fit that area, recent projects, and local trust signals.</text>

  <!-- Grid: 3 columns, gap 24 -->
  <g transform="translate(80,240)">
    <!-- Row 1 -->
    <g><rect width="368" height="240" rx="16" fill="#8FB67A"/>
       <rect width="368" height="240" rx="16" fill="url(#cityGrad)"/>
       <text x="24" y="200" font-family="Manrope,sans-serif" font-size="20" font-weight="600" fill="#FAF7F1">Aurora, IL</text>
       <text x="24" y="222" font-family="Onest,sans-serif" font-size="13" fill="#FAF7F1" fill-opacity="0.85">HQ · serving the city since 2000</text>
       <text x="320" y="222" font-family="Onest,sans-serif" font-size="13" fill="#FAF7F1" fill-opacity="0.85">View →</text>
    </g>
    <g transform="translate(392,0)"><rect width="368" height="240" rx="16" fill="#A6BCA0"/>
       <rect width="368" height="240" rx="16" fill="url(#cityGrad)"/>
       <text x="24" y="200" font-family="Manrope,sans-serif" font-size="20" font-weight="600" fill="#FAF7F1">Naperville, IL</text>
       <text x="24" y="222" font-family="Onest,sans-serif" font-size="13" fill="#FAF7F1" fill-opacity="0.85">Premium hardscape, established estates</text>
       <text x="320" y="222" font-family="Onest,sans-serif" font-size="13" fill="#FAF7F1" fill-opacity="0.85">View →</text>
    </g>
    <g transform="translate(784,0)"><rect width="368" height="240" rx="16" fill="#9DB28E"/>
       <rect width="368" height="240" rx="16" fill="url(#cityGrad)"/>
       <text x="24" y="200" font-family="Manrope,sans-serif" font-size="20" font-weight="600" fill="#FAF7F1">Batavia, IL</text>
       <text x="24" y="222" font-family="Onest,sans-serif" font-size="13" fill="#FAF7F1" fill-opacity="0.85">Riverside character, residential focus</text>
       <text x="320" y="222" font-family="Onest,sans-serif" font-size="13" fill="#FAF7F1" fill-opacity="0.85">View →</text>
    </g>
    <!-- Row 2 -->
    <g transform="translate(0,264)"><rect width="368" height="240" rx="16" fill="#A6BCA0"/>
       <rect width="368" height="240" rx="16" fill="url(#cityGrad)"/>
       <text x="24" y="200" font-family="Manrope,sans-serif" font-size="20" font-weight="600" fill="#FAF7F1">Wheaton, IL</text>
       <text x="24" y="222" font-family="Onest,sans-serif" font-size="13" fill="#FAF7F1" fill-opacity="0.85">Established affluent, full-service</text>
       <text x="320" y="222" font-family="Onest,sans-serif" font-size="13" fill="#FAF7F1" fill-opacity="0.85">View →</text>
    </g>
    <g transform="translate(392,264)"><rect width="368" height="240" rx="16" fill="#8FB67A"/>
       <rect width="368" height="240" rx="16" fill="url(#cityGrad)"/>
       <text x="24" y="200" font-family="Manrope,sans-serif" font-size="20" font-weight="600" fill="#FAF7F1">Lisle, IL</text>
       <text x="24" y="222" font-family="Onest,sans-serif" font-size="13" fill="#FAF7F1" fill-opacity="0.85">Corporate corridor, commercial focus</text>
       <text x="320" y="222" font-family="Onest,sans-serif" font-size="13" fill="#FAF7F1" fill-opacity="0.85">View →</text>
    </g>
    <g transform="translate(784,264)"><rect width="368" height="240" rx="16" fill="#9DB28E"/>
       <rect width="368" height="240" rx="16" fill="url(#cityGrad)"/>
       <text x="24" y="200" font-family="Manrope,sans-serif" font-size="20" font-weight="600" fill="#FAF7F1">Bolingbrook, IL</text>
       <text x="24" y="222" font-family="Onest,sans-serif" font-size="13" fill="#FAF7F1" fill-opacity="0.85">Suburban-commercial mix</text>
       <text x="320" y="222" font-family="Onest,sans-serif" font-size="13" fill="#FAF7F1" fill-opacity="0.85">View →</text>
    </g>
  </g>

  <defs>
    <linearGradient id="cityGrad" x1="0" y1="1" x2="0" y2="0.4">
      <stop offset="0%" stop-color="#1A1A1A" stop-opacity="0.65"/>
      <stop offset="100%" stop-color="#1A1A1A" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <g font-family="ui-monospace,monospace" font-size="11" fill="#C2185B">
    <text x="80" y="744">3-col grid · gap --spacing-6 (24) · cards 368×240 · --radius-lg (16) · .card-photo</text>
  </g>
</svg>
```

#### Mobile SVG — cities grid (390 × 1320)

```svg
<svg viewBox="0 0 390 1320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cities grid — mobile">
  <rect width="390" height="1320" fill="#FAF7F1"/>
  <rect x="16" y="40" width="100" height="22" rx="11" fill="#FFFFFF"/>
  <text x="66" y="56" font-family="ui-sans-serif" font-size="10" font-weight="600" letter-spacing="1.3" fill="#2F5D27" text-anchor="middle">SIX CITIES</text>
  <text x="16" y="100" font-family="Manrope,sans-serif" font-size="28" font-weight="700" fill="#1A1A1A">Pick your city.</text>
  <text x="16" y="138" font-family="Onest,sans-serif" font-size="16" fill="#4A4A4A">Each page covers the services</text>
  <text x="16" y="160" font-family="Onest,sans-serif" font-size="16" fill="#4A4A4A">that fit that area.</text>

  <!-- 1-column stack, 6 cards -->
  <g transform="translate(16,200)">
    <g><rect width="358" height="160" rx="16" fill="#8FB67A"/>
       <rect width="358" height="160" rx="16" fill="url(#mGrad)"/>
       <text x="20" y="124" font-family="Manrope,sans-serif" font-size="18" font-weight="600" fill="#FAF7F1">Aurora, IL</text>
       <text x="20" y="146" font-family="Onest,sans-serif" font-size="12" fill="#FAF7F1" fill-opacity="0.85">HQ · since 2000</text></g>
    <g transform="translate(0,176)"><rect width="358" height="160" rx="16" fill="#A6BCA0"/>
       <rect width="358" height="160" rx="16" fill="url(#mGrad)"/>
       <text x="20" y="124" font-family="Manrope,sans-serif" font-size="18" font-weight="600" fill="#FAF7F1">Naperville, IL</text>
       <text x="20" y="146" font-family="Onest,sans-serif" font-size="12" fill="#FAF7F1" fill-opacity="0.85">Premium hardscape</text></g>
    <g transform="translate(0,352)"><rect width="358" height="160" rx="16" fill="#9DB28E"/>
       <rect width="358" height="160" rx="16" fill="url(#mGrad)"/>
       <text x="20" y="124" font-family="Manrope,sans-serif" font-size="18" font-weight="600" fill="#FAF7F1">Batavia, IL</text></g>
    <g transform="translate(0,528)"><rect width="358" height="160" rx="16" fill="#A6BCA0"/>
       <rect width="358" height="160" rx="16" fill="url(#mGrad)"/>
       <text x="20" y="124" font-family="Manrope,sans-serif" font-size="18" font-weight="600" fill="#FAF7F1">Wheaton, IL</text></g>
    <g transform="translate(0,704)"><rect width="358" height="160" rx="16" fill="#8FB67A"/>
       <rect width="358" height="160" rx="16" fill="url(#mGrad)"/>
       <text x="20" y="124" font-family="Manrope,sans-serif" font-size="18" font-weight="600" fill="#FAF7F1">Lisle, IL</text></g>
    <g transform="translate(0,880)"><rect width="358" height="160" rx="16" fill="#9DB28E"/>
       <rect width="358" height="160" rx="16" fill="url(#mGrad)"/>
       <text x="20" y="124" font-family="Manrope,sans-serif" font-size="18" font-weight="600" fill="#FAF7F1">Bolingbrook, IL</text></g>
  </g>
  <defs><linearGradient id="mGrad" x1="0" y1="1" x2="0" y2="0.4">
    <stop offset="0%" stop-color="#1A1A1A" stop-opacity="0.65"/>
    <stop offset="100%" stop-color="#1A1A1A" stop-opacity="0"/>
  </linearGradient></defs>
  <text x="16" y="1300" font-family="ui-monospace,monospace" font-size="9" fill="#C2185B">1-col mobile · cards 358×160 · gap --spacing-4 (16)</text>
</svg>
```

### 3.4 "Outside our area?" band — surface `--color-bg`

Informational, no CTA button. Two-column desktop / stacked mobile.

**Copy EN:** "Don't see your city? We sometimes take projects in adjacent towns — Glen Ellyn, Warrenville, Plainfield. Call us; we'll tell you straight whether we're the right fit."
**Copy ES:** "¿No ves tu ciudad? A veces tomamos proyectos en pueblos cercanos — Glen Ellyn, Warrenville, Plainfield. Llámanos; te diremos honestamente si somos los indicados."

**Inline links:**
- Phone: visible number IS the link text — "(630) 946-9321" → `tel:+16309469321`.
- Email: "info@sunsetservices.example" → `mailto:` (placeholder; Cowork confirms address).

#### Desktop SVG — outside-area band (1280 × 280)

```svg
<svg viewBox="0 0 1280 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Outside our area band — desktop">
  <rect width="1280" height="280" fill="#FFFFFF"/>
  <text x="80" y="100" font-family="Manrope,sans-serif" font-size="30" font-weight="700" fill="#1A1A1A">Don't see your city?</text>
  <text x="80" y="156" font-family="Onest,sans-serif" font-size="17" fill="#4A4A4A">We sometimes take projects in adjacent towns — Glen Ellyn,</text>
  <text x="80" y="180" font-family="Onest,sans-serif" font-size="17" fill="#4A4A4A">Warrenville, Plainfield. Call us; we'll tell you straight whether</text>
  <text x="80" y="204" font-family="Onest,sans-serif" font-size="17" fill="#4A4A4A">we're the right fit.</text>
  <text x="700" y="156" font-family="Onest,sans-serif" font-size="17" fill="#2F5D27" text-decoration="underline">(630) 946-9321</text>
  <text x="700" y="184" font-family="Onest,sans-serif" font-size="17" fill="#2F5D27" text-decoration="underline">info@sunsetservices.example</text>
  <g font-family="ui-monospace,monospace" font-size="11" fill="#C2185B">
    <text x="80" y="252">no CTA button — informational only · phone is link text · --color-sunset-green-700</text>
  </g>
</svg>
```

#### Mobile SVG — outside-area band (390 × 360)

```svg
<svg viewBox="0 0 390 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Outside our area band — mobile">
  <rect width="390" height="360" fill="#FFFFFF"/>
  <text x="16" y="60" font-family="Manrope,sans-serif" font-size="22" font-weight="700" fill="#1A1A1A">Don't see your city?</text>
  <text x="16" y="100" font-family="Onest,sans-serif" font-size="15" fill="#4A4A4A">We sometimes take projects in</text>
  <text x="16" y="120" font-family="Onest,sans-serif" font-size="15" fill="#4A4A4A">adjacent towns — Glen Ellyn,</text>
  <text x="16" y="140" font-family="Onest,sans-serif" font-size="15" fill="#4A4A4A">Warrenville, Plainfield.</text>
  <text x="16" y="180" font-family="Onest,sans-serif" font-size="15" fill="#4A4A4A">Call us; we'll tell you straight.</text>
  <text x="16" y="232" font-family="Onest,sans-serif" font-size="16" fill="#2F5D27" text-decoration="underline">(630) 946-9321</text>
  <text x="16" y="262" font-family="Onest,sans-serif" font-size="16" fill="#2F5D27" text-decoration="underline">info@sunsetservices.example</text>
</svg>
```

### 3.5 CTA section — surface `--color-bg-cream`

Reuses the shared `<CTA copyNamespace="serviceAreas.cta" destination="/request-quote/" />` (the promoted `HomeCTA`, 1.11 §11.2). Single amber CTA for the page (D11).

**H2 EN:** "Ready when you are."
**H2 ES:** "Cuando estés listo, estamos."
**Sub EN:** "Free estimates. We'll be on-site within a week. No pressure."
**Sub ES:** "Presupuestos gratuitos. Te visitamos en una semana. Sin presión."
**CTA label EN:** "Get a free estimate"
**CTA label ES:** "Solicita un presupuesto gratis"

(SVG: identical pattern to homepage CTA — see 1.06 §10. Not re-rendered here; copy + namespace are the spec.)

---

## 4. Location page template — page design

The same template renders all six city pages. Container `--container-default`. Section padding `py-20 / py-14`. Surface alternation per D10.

City-specific tokens used in copy: `<city>` (e.g., "Naperville"), `<state>` ("Illinois" / "IL"), and the per-city seed values (§11). Code interpolates via the `location.*` namespace + the seed table.

### 4.1 Hero — surface `--color-bg`

Compact split (D5.B). Desktop: copy left 60% / photo right 40%, ~50vh. Mobile: photo above copy, ~60vh stacked.

**H1 pattern:**
- EN: "Landscaping & Hardscape in <city>, IL" — 5 words, within ≤7 budget.
- ES: "Paisajismo y Hardscape en <city>, IL" — 6 words, within ≤10 budget.

**Sub pattern:**
- EN: "Family-run since 2000. Serving <city> homeowners and businesses."
- ES: "Familiar desde el año 2000. Atendiendo a hogares y negocios de <city>."

**Microbar (3 chips, inline above CTAs):**
- "<years>+ years in <city>" / "<años>+ años en <city>"
- "<N>+ local projects" / "<N>+ proyectos locales"
- "Free estimates within <X> days" / "Presupuestos gratuitos en <X> días"

**Primary CTA:** Primary green × lg → `/request-quote/` ("Request a free estimate" / "Solicita un presupuesto gratis"). Secondary text-link: `tel:+16309469321`. **No entrance animation.** **No amber here** — amber is reserved for §4.9.

#### Desktop SVG — location hero (1280 × 540, ~50vh@ aspect)

```svg
<svg viewBox="0 0 1280 540" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Location hero — desktop">
  <rect width="1280" height="540" fill="#FFFFFF"/>

  <!-- LEFT: copy 60% (760px content) -->
  <text x="80" y="92" font-family="ui-sans-serif" font-size="13" fill="#6B6B6B">Home / Service Areas / <tspan fill="#1A1A1A" font-weight="500">Naperville</tspan></text>

  <rect x="80" y="116" width="170" height="28" rx="14" fill="#F1F5EE"/>
  <text x="165" y="135" font-family="ui-sans-serif" font-size="12" font-weight="600" letter-spacing="1.4" fill="#2F5D27" text-anchor="middle">NAPERVILLE, IL</text>

  <!-- H1 -->
  <text x="80" y="208" font-family="Manrope,sans-serif" font-size="48" font-weight="700" fill="#1A1A1A" letter-spacing="-0.02em">Landscaping &amp; Hardscape</text>
  <text x="80" y="256" font-family="Manrope,sans-serif" font-size="48" font-weight="700" fill="#1A1A1A" letter-spacing="-0.02em">in Naperville, IL</text>

  <!-- Lead -->
  <text x="80" y="304" font-family="Onest,sans-serif" font-size="18" fill="#4A4A4A">Family-run since 2000. Serving Naperville</text>
  <text x="80" y="328" font-family="Onest,sans-serif" font-size="18" fill="#4A4A4A">homeowners and businesses.</text>

  <!-- Microbar (3 chips) -->
  <g transform="translate(80,360)">
    <g><rect width="180" height="36" rx="8" fill="#FAF7F1"/>
       <text x="90" y="23" font-family="ui-sans-serif" font-size="13" fill="#1A1A1A" text-anchor="middle">25+ years in Naperville</text></g>
    <g transform="translate(196,0)"><rect width="160" height="36" rx="8" fill="#FAF7F1"/>
       <text x="80" y="23" font-family="ui-sans-serif" font-size="13" fill="#1A1A1A" text-anchor="middle">120+ local projects</text></g>
    <g transform="translate(372,0)"><rect width="220" height="36" rx="8" fill="#FAF7F1"/>
       <text x="110" y="23" font-family="ui-sans-serif" font-size="13" fill="#1A1A1A" text-anchor="middle">Free estimates within 5 days</text></g>
  </g>

  <!-- CTAs -->
  <g transform="translate(80,424)">
    <rect width="240" height="52" rx="8" fill="#4D8A3F"/>
    <text x="120" y="33" font-family="Manrope,sans-serif" font-size="17" font-weight="600" fill="#FFFFFF" text-anchor="middle">Request a free estimate</text>
  </g>
  <text x="340" y="458" font-family="Onest,sans-serif" font-size="15" fill="#2F5D27" text-decoration="underline">or call (630) 946-9321</text>

  <!-- RIGHT: photo 40% (480×440) -->
  <g transform="translate(720,80)">
    <rect width="480" height="440" rx="16" fill="#D8D2C4"/>
    <g stroke="#B8B0A0" stroke-width="1"><line x1="0" y1="0" x2="480" y2="440"/><line x1="480" y1="0" x2="0" y2="440"/></g>
    <rect x="16" y="16" width="220" height="24" rx="4" fill="#1A1A1A" fill-opacity="0.6"/>
    <text x="24" y="33" font-family="ui-monospace,monospace" font-size="12" fill="#FAF7F1">photo: location.naperville (4:3)</text>
  </g>

  <g font-family="ui-monospace,monospace" font-size="11" fill="#C2185B">
    <text x="80" y="180">H1 · 5 words EN budget · ≤7 EN / ≤10 ES</text>
    <text x="80" y="396">microbar chips · --text-body-sm · gap --spacing-4 · bg --color-bg-cream</text>
    <text x="720" y="68">photo · 4:3 · ≤350KB AVIF · LCP candidate (D5.B)</text>
  </g>
</svg>
```

#### Mobile SVG — location hero (390 × 760)

```svg
<svg viewBox="0 0 390 760" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Location hero — mobile">
  <rect width="390" height="760" fill="#FFFFFF"/>
  <!-- Photo top -->
  <rect x="0" y="0" width="390" height="280" fill="#D8D2C4"/>
  <g stroke="#B8B0A0" stroke-width="1"><line x1="0" y1="0" x2="390" y2="280"/><line x1="390" y1="0" x2="0" y2="280"/></g>
  <rect x="16" y="16" width="200" height="22" rx="4" fill="#1A1A1A" fill-opacity="0.6"/>
  <text x="24" y="32" font-family="ui-monospace,monospace" font-size="11" fill="#FAF7F1">photo: location.naperville (16:9 mobile crop)</text>

  <text x="16" y="320" font-family="ui-sans-serif" font-size="12" fill="#6B6B6B">Home / Service Areas / <tspan fill="#1A1A1A" font-weight="500">Naperville</tspan></text>
  <rect x="16" y="336" width="160" height="24" rx="12" fill="#F1F5EE"/>
  <text x="96" y="352" font-family="ui-sans-serif" font-size="11" font-weight="600" letter-spacing="1.3" fill="#2F5D27" text-anchor="middle">NAPERVILLE, IL</text>
  <text x="16" y="404" font-family="Manrope,sans-serif" font-size="32" font-weight="700" fill="#1A1A1A">Landscaping &amp;</text>
  <text x="16" y="440" font-family="Manrope,sans-serif" font-size="32" font-weight="700" fill="#1A1A1A">Hardscape in</text>
  <text x="16" y="476" font-family="Manrope,sans-serif" font-size="32" font-weight="700" fill="#1A1A1A">Naperville, IL</text>
  <text x="16" y="514" font-family="Onest,sans-serif" font-size="16" fill="#4A4A4A">Family-run since 2000. Serving</text>
  <text x="16" y="536" font-family="Onest,sans-serif" font-size="16" fill="#4A4A4A">Naperville homeowners.</text>

  <!-- Microbar wraps -->
  <g transform="translate(16,560)">
    <rect width="180" height="32" rx="8" fill="#FAF7F1"/>
    <text x="90" y="21" font-family="ui-sans-serif" font-size="12" fill="#1A1A1A" text-anchor="middle">25+ years in Naperville</text>
    <rect y="40" width="160" height="32" rx="8" fill="#FAF7F1"/>
    <text x="80" y="61" font-family="ui-sans-serif" font-size="12" fill="#1A1A1A" text-anchor="middle">120+ local projects</text>
    <rect y="80" width="220" height="32" rx="8" fill="#FAF7F1"/>
    <text x="110" y="101" font-family="ui-sans-serif" font-size="12" fill="#1A1A1A" text-anchor="middle">Free estimates within 5 days</text>
  </g>

  <rect x="16" y="692" width="358" height="52" rx="8" fill="#4D8A3F"/>
  <text x="195" y="725" font-family="Manrope,sans-serif" font-size="17" font-weight="600" fill="#FFFFFF" text-anchor="middle">Request a free estimate</text>
</svg>
```

### 4.2 LocalTrustBand — surface `--color-bg-cream`

Three stat cells (D9.A). Layout: 3-column desktop / stacked mobile. Each cell: large number `--text-h2` (28/40), short label `--text-body-sm` `--color-text-muted`. **No icons** (1.07 lesson — fewer hydration vectors).

#### Desktop SVG — LocalTrustBand (1280 × 320)

```svg
<svg viewBox="0 0 1280 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="LocalTrustBand — desktop">
  <rect width="1280" height="320" fill="#FAF7F1"/>
  <line x1="80" y1="80" x2="1200" y2="80" stroke="#E5E0D5" stroke-width="1"/>
  <line x1="80" y1="240" x2="1200" y2="240" stroke="#E5E0D5" stroke-width="1"/>

  <g transform="translate(80,120)">
    <text font-family="Manrope,sans-serif" font-size="56" font-weight="800" fill="#2F5D27" letter-spacing="-0.02em">25+</text>
    <text y="68" font-family="Onest,sans-serif" font-size="15" fill="#6B6B6B">Years serving Naperville</text>
  </g>
  <g transform="translate(560,120)">
    <text font-family="Manrope,sans-serif" font-size="56" font-weight="800" fill="#2F5D27" letter-spacing="-0.02em">120+</text>
    <text y="68" font-family="Onest,sans-serif" font-size="15" fill="#6B6B6B">Projects completed in Naperville</text>
  </g>
  <g transform="translate(1040,120)">
    <text font-family="Manrope,sans-serif" font-size="56" font-weight="800" fill="#2F5D27" letter-spacing="-0.02em">5 days</text>
    <text y="68" font-family="Onest,sans-serif" font-size="15" fill="#6B6B6B">Free estimates, on-site</text>
  </g>

  <!-- Vertical dividers -->
  <line x1="500" y1="100" x2="500" y2="220" stroke="#E5E0D5" stroke-width="1"/>
  <line x1="980" y1="100" x2="980" y2="220" stroke="#E5E0D5" stroke-width="1"/>

  <text x="80" y="296" font-family="ui-monospace,monospace" font-size="11" fill="#C2185B">3-col stat row · top + bottom 1px hairline · vertical dividers --color-border · numbers --text-h2-d --color-sunset-green-700</text>
</svg>
```

#### Mobile SVG — LocalTrustBand (390 × 480)

```svg
<svg viewBox="0 0 390 480" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="LocalTrustBand — mobile">
  <rect width="390" height="480" fill="#FAF7F1"/>
  <line x1="16" y1="40" x2="374" y2="40" stroke="#E5E0D5"/>
  <g transform="translate(24,72)">
    <text font-family="Manrope,sans-serif" font-size="40" font-weight="800" fill="#2F5D27">25+</text>
    <text y="52" font-family="Onest,sans-serif" font-size="14" fill="#6B6B6B">Years serving Naperville</text>
  </g>
  <line x1="16" y1="180" x2="374" y2="180" stroke="#E5E0D5"/>
  <g transform="translate(24,212)">
    <text font-family="Manrope,sans-serif" font-size="40" font-weight="800" fill="#2F5D27">120+</text>
    <text y="52" font-family="Onest,sans-serif" font-size="14" fill="#6B6B6B">Naperville projects completed</text>
  </g>
  <line x1="16" y1="320" x2="374" y2="320" stroke="#E5E0D5"/>
  <g transform="translate(24,352)">
    <text font-family="Manrope,sans-serif" font-size="40" font-weight="800" fill="#2F5D27">5 days</text>
    <text y="52" font-family="Onest,sans-serif" font-size="14" fill="#6B6B6B">Free estimates, on-site</text>
  </g>
  <line x1="16" y1="448" x2="374" y2="448" stroke="#E5E0D5"/>
</svg>
```

### 4.3 Services we offer in <city> — surface `--color-bg`

6 service cards (D6). Reuses the locked `ServiceCard` (1.06 §5.5 / 1.08). Each card links to the canonical service page (`/<audience>/<service-slug>/`) — NOT a city-specific service URL. **No per-card animation**; section-level `<AnimateIn variant="fade-up">` only.

**Section heading EN:** "Services we offer in <city>"
**Section heading ES:** "Servicios que ofrecemos en <city>"
**Sub EN:** "Curated for <city>'s properties and what we know works."
**Sub ES:** "Seleccionados para las propiedades de <city> y lo que sabemos que funciona."

#### Desktop SVG — services grid (1280 × 740)

```svg
<svg viewBox="0 0 1280 740" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Services grid — desktop">
  <rect width="1280" height="740" fill="#FFFFFF"/>
  <text x="80" y="120" font-family="Manrope,sans-serif" font-size="40" font-weight="700" fill="#1A1A1A" letter-spacing="-0.015em">Services we offer in Naperville</text>
  <text x="80" y="164" font-family="Onest,sans-serif" font-size="18" fill="#4A4A4A">Curated for Naperville's properties and what we know works.</text>

  <!-- 3×2 service-card grid -->
  <g transform="translate(80,220)">
    <!-- helper macro: card with photo+title+meta -->
    <g><rect width="368" height="220" rx="16" fill="#FAF7F1"/>
       <rect x="16" y="16" width="336" height="120" rx="8" fill="#D8D2C4"/>
       <text x="24" y="172" font-family="Manrope,sans-serif" font-size="20" font-weight="600" fill="#1A1A1A">Patio Installation</text>
       <text x="24" y="194" font-family="Onest,sans-serif" font-size="13" fill="#6B6B6B">Hardscape · Residential</text></g>
    <g transform="translate(392,0)"><rect width="368" height="220" rx="16" fill="#FAF7F1"/>
       <rect x="16" y="16" width="336" height="120" rx="8" fill="#D8D2C4"/>
       <text x="24" y="172" font-family="Manrope,sans-serif" font-size="20" font-weight="600" fill="#1A1A1A">Retaining Walls</text>
       <text x="24" y="194" font-family="Onest,sans-serif" font-size="13" fill="#6B6B6B">Hardscape</text></g>
    <g transform="translate(784,0)"><rect width="368" height="220" rx="16" fill="#FAF7F1"/>
       <rect x="16" y="16" width="336" height="120" rx="8" fill="#D8D2C4"/>
       <text x="24" y="172" font-family="Manrope,sans-serif" font-size="20" font-weight="600" fill="#1A1A1A">Outdoor Kitchens</text>
       <text x="24" y="194" font-family="Onest,sans-serif" font-size="13" fill="#6B6B6B">Hardscape · Premium</text></g>
    <g transform="translate(0,244)"><rect width="368" height="220" rx="16" fill="#FAF7F1"/>
       <rect x="16" y="16" width="336" height="120" rx="8" fill="#D8D2C4"/>
       <text x="24" y="172" font-family="Manrope,sans-serif" font-size="20" font-weight="600" fill="#1A1A1A">Fire Pits &amp; Features</text>
       <text x="24" y="194" font-family="Onest,sans-serif" font-size="13" fill="#6B6B6B">Hardscape</text></g>
    <g transform="translate(392,244)"><rect width="368" height="220" rx="16" fill="#FAF7F1"/>
       <rect x="16" y="16" width="336" height="120" rx="8" fill="#D8D2C4"/>
       <text x="24" y="172" font-family="Manrope,sans-serif" font-size="20" font-weight="600" fill="#1A1A1A">Landscape Design</text>
       <text x="24" y="194" font-family="Onest,sans-serif" font-size="13" fill="#6B6B6B">Residential</text></g>
    <g transform="translate(784,244)"><rect width="368" height="220" rx="16" fill="#FAF7F1"/>
       <rect x="16" y="16" width="336" height="120" rx="8" fill="#D8D2C4"/>
       <text x="24" y="172" font-family="Manrope,sans-serif" font-size="20" font-weight="600" fill="#1A1A1A">Lawn Maintenance</text>
       <text x="24" y="194" font-family="Onest,sans-serif" font-size="13" fill="#6B6B6B">Residential</text></g>
  </g>

  <text x="80" y="724" font-family="ui-monospace,monospace" font-size="11" fill="#C2185B">3×2 grid · ServiceCard locked (1.06 §5.5) · gap --spacing-6 (24) · cards 368×220 · --shadow-on-cream</text>
</svg>
```

#### Mobile SVG — services grid (390 × 1480)

```svg
<svg viewBox="0 0 390 1480" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Services grid — mobile">
  <rect width="390" height="1480" fill="#FFFFFF"/>
  <text x="16" y="80" font-family="Manrope,sans-serif" font-size="28" font-weight="700" fill="#1A1A1A">Services we offer</text>
  <text x="16" y="116" font-family="Manrope,sans-serif" font-size="28" font-weight="700" fill="#1A1A1A">in Naperville</text>
  <text x="16" y="156" font-family="Onest,sans-serif" font-size="16" fill="#4A4A4A">Curated for Naperville properties.</text>
  <!-- 1-col stack of 6 -->
  <g transform="translate(16,200)">
    <g><rect width="358" height="200" rx="16" fill="#FAF7F1"/>
       <rect x="16" y="16" width="326" height="100" rx="8" fill="#D8D2C4"/>
       <text x="24" y="148" font-family="Manrope,sans-serif" font-size="18" font-weight="600" fill="#1A1A1A">Patio Installation</text>
       <text x="24" y="172" font-family="Onest,sans-serif" font-size="13" fill="#6B6B6B">Hardscape · Residential</text></g>
    <g transform="translate(0,216)"><rect width="358" height="200" rx="16" fill="#FAF7F1"/>
       <rect x="16" y="16" width="326" height="100" rx="8" fill="#D8D2C4"/>
       <text x="24" y="148" font-family="Manrope,sans-serif" font-size="18" font-weight="600" fill="#1A1A1A">Retaining Walls</text></g>
    <g transform="translate(0,432)"><rect width="358" height="200" rx="16" fill="#FAF7F1"/>
       <rect x="16" y="16" width="326" height="100" rx="8" fill="#D8D2C4"/>
       <text x="24" y="148" font-family="Manrope,sans-serif" font-size="18" font-weight="600" fill="#1A1A1A">Outdoor Kitchens</text></g>
    <g transform="translate(0,648)"><rect width="358" height="200" rx="16" fill="#FAF7F1"/>
       <rect x="16" y="16" width="326" height="100" rx="8" fill="#D8D2C4"/>
       <text x="24" y="148" font-family="Manrope,sans-serif" font-size="18" font-weight="600" fill="#1A1A1A">Fire Pits &amp; Features</text></g>
    <g transform="translate(0,864)"><rect width="358" height="200" rx="16" fill="#FAF7F1"/>
       <rect x="16" y="16" width="326" height="100" rx="8" fill="#D8D2C4"/>
       <text x="24" y="148" font-family="Manrope,sans-serif" font-size="18" font-weight="600" fill="#1A1A1A">Landscape Design</text></g>
    <g transform="translate(0,1080)"><rect width="358" height="200" rx="16" fill="#FAF7F1"/>
       <rect x="16" y="16" width="326" height="100" rx="8" fill="#D8D2C4"/>
       <text x="24" y="148" font-family="Manrope,sans-serif" font-size="18" font-weight="600" fill="#1A1A1A">Lawn Maintenance</text></g>
  </g>
</svg>
```

### 4.4 Local projects strip — surface `--color-bg-cream`

3 project tiles (D7.A). Reuses locked project-card pattern (1.06 projects teaser). Strip header: "Recent <city> projects" / "Proyectos recientes en <city>". Below: text-link "See all projects →" → `/projects/` (no body amber here). Each tile links to its project detail page (Phase 1.16; placeholder URLs in Part 1).

#### Desktop SVG — projects strip (1280 × 540)

```svg
<svg viewBox="0 0 1280 540" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Local projects strip — desktop">
  <rect width="1280" height="540" fill="#FAF7F1"/>
  <text x="80" y="100" font-family="Manrope,sans-serif" font-size="32" font-weight="700" fill="#1A1A1A" letter-spacing="-0.015em">Recent Naperville projects</text>
  <text x="1080" y="100" font-family="Onest,sans-serif" font-size="15" fill="#2F5D27" text-decoration="underline">See all projects →</text>

  <g transform="translate(80,160)">
    <g><rect width="368" height="276" rx="16" fill="#9DB28E"/>
       <rect width="368" height="276" rx="16" fill="url(#prGrad)"/>
       <text x="24" y="232" font-family="Manrope,sans-serif" font-size="18" font-weight="600" fill="#FAF7F1">Hilltop terrace, 4-tier</text>
       <text x="24" y="254" font-family="Onest,sans-serif" font-size="13" fill="#FAF7F1" fill-opacity="0.85">Naperville · Hardscape · 2024</text></g>
    <g transform="translate(392,0)"><rect width="368" height="276" rx="16" fill="#A6BCA0"/>
       <rect width="368" height="276" rx="16" fill="url(#prGrad)"/>
       <text x="24" y="232" font-family="Manrope,sans-serif" font-size="18" font-weight="600" fill="#FAF7F1">Outdoor kitchen + pergola</text>
       <text x="24" y="254" font-family="Onest,sans-serif" font-size="13" fill="#FAF7F1" fill-opacity="0.85">Naperville · Hardscape · 2024</text></g>
    <g transform="translate(784,0)"><rect width="368" height="276" rx="16" fill="#8FB67A"/>
       <rect width="368" height="276" rx="16" fill="url(#prGrad)"/>
       <text x="24" y="232" font-family="Manrope,sans-serif" font-size="18" font-weight="600" fill="#FAF7F1">Front-yard renovation</text>
       <text x="24" y="254" font-family="Onest,sans-serif" font-size="13" fill="#FAF7F1" fill-opacity="0.85">Naperville · Residential · 2023</text></g>
  </g>
  <defs><linearGradient id="prGrad" x1="0" y1="1" x2="0" y2="0.5">
    <stop offset="0%" stop-color="#1A1A1A" stop-opacity="0.65"/>
    <stop offset="100%" stop-color="#1A1A1A" stop-opacity="0"/>
  </linearGradient></defs>
  <text x="80" y="500" font-family="ui-monospace,monospace" font-size="11" fill="#C2185B">3 ProjectCards · 4:3 · ≤200KB AVIF lazy · captions reflect ACTUAL project city (D7.A fallback rule)</text>
</svg>
```

#### Mobile SVG — projects strip (390 × 1080)

```svg
<svg viewBox="0 0 390 1080" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Local projects strip — mobile">
  <rect width="390" height="1080" fill="#FAF7F1"/>
  <text x="16" y="60" font-family="Manrope,sans-serif" font-size="22" font-weight="700" fill="#1A1A1A">Recent Naperville</text>
  <text x="16" y="92" font-family="Manrope,sans-serif" font-size="22" font-weight="700" fill="#1A1A1A">projects</text>
  <g transform="translate(16,140)">
    <g><rect width="358" height="280" rx="16" fill="#9DB28E"/>
       <rect width="358" height="280" rx="16" fill="url(#mPGrad)"/>
       <text x="20" y="232" font-family="Manrope,sans-serif" font-size="17" font-weight="600" fill="#FAF7F1">Hilltop terrace, 4-tier</text>
       <text x="20" y="254" font-family="Onest,sans-serif" font-size="12" fill="#FAF7F1" fill-opacity="0.85">Naperville · Hardscape · 2024</text></g>
    <g transform="translate(0,296)"><rect width="358" height="280" rx="16" fill="#A6BCA0"/>
       <rect width="358" height="280" rx="16" fill="url(#mPGrad)"/>
       <text x="20" y="232" font-family="Manrope,sans-serif" font-size="17" font-weight="600" fill="#FAF7F1">Outdoor kitchen + pergola</text></g>
    <g transform="translate(0,592)"><rect width="358" height="280" rx="16" fill="#8FB67A"/>
       <rect width="358" height="280" rx="16" fill="url(#mPGrad)"/>
       <text x="20" y="232" font-family="Manrope,sans-serif" font-size="17" font-weight="600" fill="#FAF7F1">Front-yard renovation</text></g>
  </g>
  <defs><linearGradient id="mPGrad" x1="0" y1="1" x2="0" y2="0.5">
    <stop offset="0%" stop-color="#1A1A1A" stop-opacity="0.65"/>
    <stop offset="100%" stop-color="#1A1A1A" stop-opacity="0"/>
  </linearGradient></defs>
  <text x="16" y="1052" font-family="Onest,sans-serif" font-size="14" fill="#2F5D27" text-decoration="underline">See all projects →</text>
</svg>
```

### 4.5 Local testimonials — surface `--color-bg`

1–2 testimonial cards (placeholder copy in Part 1; real Google reviews in Phase 2.15). Uses locked `card--testimonial` (1.03 §6.2): cream surface, `--border-thick` left in `--color-sunset-green-500`, `--radius-xl`.

**Per card:**
- Quote — Manrope 24/1.35 mobile, 32/1.30 desktop, weight 500.
- Star row — 5 filled stars (no aggregate score until real reviews).
- Attribution — first name + neighborhood/city, `--text-body-sm` `--color-text-muted`.

#### Desktop SVG — testimonial (1280 × 360)

```svg
<svg viewBox="0 0 1280 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Local testimonial — desktop">
  <rect width="1280" height="360" fill="#FFFFFF"/>
  <g transform="translate(80,80)">
    <rect width="1120" height="200" rx="24" fill="#FAF7F1"/>
    <rect width="4" height="200" fill="#4D8A3F"/>
    <!-- stars -->
    <g transform="translate(40,40)" fill="#E8A33D">
      <polygon points="10,0 13,7 20,7 14,12 17,20 10,15 3,20 6,12 0,7 7,7"/>
      <g transform="translate(28,0)"><polygon points="10,0 13,7 20,7 14,12 17,20 10,15 3,20 6,12 0,7 7,7"/></g>
      <g transform="translate(56,0)"><polygon points="10,0 13,7 20,7 14,12 17,20 10,15 3,20 6,12 0,7 7,7"/></g>
      <g transform="translate(84,0)"><polygon points="10,0 13,7 20,7 14,12 17,20 10,15 3,20 6,12 0,7 7,7"/></g>
      <g transform="translate(112,0)"><polygon points="10,0 13,7 20,7 14,12 17,20 10,15 3,20 6,12 0,7 7,7"/></g>
    </g>
    <text x="40" y="106" font-family="Manrope,sans-serif" font-size="24" font-weight="500" font-style="italic" fill="#1A1A1A">"They took a backyard slope no one in Naperville would touch and</text>
    <text x="40" y="138" font-family="Manrope,sans-serif" font-size="24" font-weight="500" font-style="italic" fill="#1A1A1A">turned it into our favorite room of the house."</text>
    <text x="40" y="178" font-family="Onest,sans-serif" font-size="14" fill="#6B6B6B">— Sarah K., West Highlands · Naperville</text>
  </g>
  <text x="80" y="328" font-family="ui-monospace,monospace" font-size="11" fill="#C2185B">.card--testimonial · --border-thick left --color-sunset-green-500 · --radius-xl · --shadow-on-cream</text>
</svg>
```

#### Mobile SVG — testimonial (390 × 380)

```svg
<svg viewBox="0 0 390 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Local testimonial — mobile">
  <rect width="390" height="380" fill="#FFFFFF"/>
  <g transform="translate(16,40)">
    <rect width="358" height="300" rx="24" fill="#FAF7F1"/>
    <rect width="4" height="300" fill="#4D8A3F"/>
    <g transform="translate(24,28)" fill="#E8A33D">
      <polygon points="8,0 10,5 16,5 11,9 13,16 8,12 3,16 5,9 0,5 6,5"/>
      <g transform="translate(22,0)"><polygon points="8,0 10,5 16,5 11,9 13,16 8,12 3,16 5,9 0,5 6,5"/></g>
      <g transform="translate(44,0)"><polygon points="8,0 10,5 16,5 11,9 13,16 8,12 3,16 5,9 0,5 6,5"/></g>
      <g transform="translate(66,0)"><polygon points="8,0 10,5 16,5 11,9 13,16 8,12 3,16 5,9 0,5 6,5"/></g>
      <g transform="translate(88,0)"><polygon points="8,0 10,5 16,5 11,9 13,16 8,12 3,16 5,9 0,5 6,5"/></g>
    </g>
    <text x="24" y="92" font-family="Manrope,sans-serif" font-size="18" font-weight="500" font-style="italic" fill="#1A1A1A">"They took a backyard slope</text>
    <text x="24" y="118" font-family="Manrope,sans-serif" font-size="18" font-weight="500" font-style="italic" fill="#1A1A1A">no one in Naperville would</text>
    <text x="24" y="144" font-family="Manrope,sans-serif" font-size="18" font-weight="500" font-style="italic" fill="#1A1A1A">touch and turned it into our</text>
    <text x="24" y="170" font-family="Manrope,sans-serif" font-size="18" font-weight="500" font-style="italic" fill="#1A1A1A">favorite room of the house."</text>
    <text x="24" y="216" font-family="Onest,sans-serif" font-size="13" fill="#6B6B6B">— Sarah K., West Highlands</text>
    <text x="24" y="238" font-family="Onest,sans-serif" font-size="13" fill="#6B6B6B">Naperville</text>
  </g>
</svg>
```

### 4.6 Why hire local — family panel — surface `--color-bg-cream`

Two-paragraph trust block + small portrait. Mirrors homepage About teaser (1.06 §7) at smaller scale. Photo ≤200KB AVIF, 4:5, lazy-loaded.

**Heading EN:** "Why hire a family business for your <city> property"
**Heading ES:** "Por qué contratar a un negocio familiar para tu propiedad en <city>"
**Body (~120 words, per-city — see seed):** generic example for Naperville: "Our crews drive Naperville every day. We know which lots back up to forest preserve, which subdivisions have HOA approval forms that need three weeks, which slope grades drain into the sewer easement and which don't. That's not a search-engine fact — that's twenty-five years of going back when something settles wrong. When you call (630) 946-9321, Erick or his son picks up. The crew that walks your property is the crew that pours the base. You won't hand off to a subcontractor we just met."

#### Desktop SVG — why-local panel (1280 × 540)

```svg
<svg viewBox="0 0 1280 540" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Why hire local panel — desktop">
  <rect width="1280" height="540" fill="#FAF7F1"/>
  <!-- Portrait left -->
  <g transform="translate(80,80)">
    <rect width="320" height="400" rx="16" fill="#D8D2C4"/>
    <g stroke="#B8B0A0" stroke-width="1"><line x1="0" y1="0" x2="320" y2="400"/><line x1="320" y1="0" x2="0" y2="400"/></g>
    <rect x="16" y="16" width="180" height="22" rx="4" fill="#1A1A1A" fill-opacity="0.6"/>
    <text x="22" y="32" font-family="ui-monospace,monospace" font-size="11" fill="#FAF7F1">photo: about.portrait (4:5)</text>
  </g>
  <!-- Copy right -->
  <g transform="translate(440,80)">
    <text font-family="Manrope,sans-serif" font-size="32" font-weight="700" fill="#1A1A1A" letter-spacing="-0.015em">Why hire a family business</text>
    <text y="40" font-family="Manrope,sans-serif" font-size="32" font-weight="700" fill="#1A1A1A" letter-spacing="-0.015em">for your Naperville property</text>
    <text y="100" font-family="Onest,sans-serif" font-size="17" fill="#4A4A4A">Our crews drive Naperville every day. We know which lots back up</text>
    <text y="124" font-family="Onest,sans-serif" font-size="17" fill="#4A4A4A">to forest preserve, which subdivisions have HOA approval forms</text>
    <text y="148" font-family="Onest,sans-serif" font-size="17" fill="#4A4A4A">that need three weeks, which slope grades drain into the sewer</text>
    <text y="172" font-family="Onest,sans-serif" font-size="17" fill="#4A4A4A">easement and which don't.</text>
    <text y="216" font-family="Onest,sans-serif" font-size="17" fill="#4A4A4A">When you call, Erick or his son picks up. The crew that walks your</text>
    <text y="240" font-family="Onest,sans-serif" font-size="17" fill="#4A4A4A">property is the crew that pours the base. You won't hand off to a</text>
    <text y="264" font-family="Onest,sans-serif" font-size="17" fill="#4A4A4A">subcontractor we just met.</text>
    <text y="316" font-family="Onest,sans-serif" font-size="15" fill="#2F5D27" text-decoration="underline">Read more about Erick →</text>
  </g>
  <text x="80" y="514" font-family="ui-monospace,monospace" font-size="11" fill="#C2185B">portrait shared across all 6 cities (D9 photo budget) · text per-city in seed table whyLocal.{en,es}</text>
</svg>
```

#### Mobile SVG — why-local panel (390 × 1000)

```svg
<svg viewBox="0 0 390 1000" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Why hire local panel — mobile">
  <rect width="390" height="1000" fill="#FAF7F1"/>
  <rect x="16" y="40" width="358" height="380" rx="16" fill="#D8D2C4"/>
  <g stroke="#B8B0A0"><line x1="16" y1="40" x2="374" y2="420"/><line x1="374" y1="40" x2="16" y2="420"/></g>
  <text x="16" y="476" font-family="Manrope,sans-serif" font-size="24" font-weight="700" fill="#1A1A1A">Why hire a family</text>
  <text x="16" y="504" font-family="Manrope,sans-serif" font-size="24" font-weight="700" fill="#1A1A1A">business for your</text>
  <text x="16" y="532" font-family="Manrope,sans-serif" font-size="24" font-weight="700" fill="#1A1A1A">Naperville property</text>
  <text x="16" y="580" font-family="Onest,sans-serif" font-size="15" fill="#4A4A4A">Our crews drive Naperville every</text>
  <text x="16" y="600" font-family="Onest,sans-serif" font-size="15" fill="#4A4A4A">day. We know which lots back up</text>
  <text x="16" y="620" font-family="Onest,sans-serif" font-size="15" fill="#4A4A4A">to forest preserve, which</text>
  <text x="16" y="640" font-family="Onest,sans-serif" font-size="15" fill="#4A4A4A">subdivisions have HOA approval</text>
  <text x="16" y="660" font-family="Onest,sans-serif" font-size="15" fill="#4A4A4A">forms that need three weeks.</text>
  <text x="16" y="708" font-family="Onest,sans-serif" font-size="15" fill="#4A4A4A">When you call, Erick or his son</text>
  <text x="16" y="728" font-family="Onest,sans-serif" font-size="15" fill="#4A4A4A">picks up. The crew that walks</text>
  <text x="16" y="748" font-family="Onest,sans-serif" font-size="15" fill="#4A4A4A">your property pours the base.</text>
  <text x="16" y="800" font-family="Onest,sans-serif" font-size="14" fill="#2F5D27" text-decoration="underline">Read more about Erick →</text>
</svg>
```

### 4.7 Neighbor cities strip — surface `--color-bg`

**Reuses `ServiceAreaStrip`** (Phase 1.11 §11) with new prop `excludeSlug="<currentCitySlug>"` so the current city is hidden and the strip shows the other 5. (D7b.) Phase 1.14 owns the prop addition.

**Heading EN:** "Other places we work"
**Heading ES:** "Otros lugares donde trabajamos"

#### Desktop SVG — neighbor cities strip (1280 × 200)

```svg
<svg viewBox="0 0 1280 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Neighbor cities strip — desktop">
  <rect width="1280" height="200" fill="#FFFFFF"/>
  <text x="80" y="60" font-family="Manrope,sans-serif" font-size="22" font-weight="600" fill="#1A1A1A">Other places we work</text>
  <g transform="translate(80,100)" font-family="Manrope,sans-serif" font-size="15" font-weight="500">
    <g><rect width="148" height="44" rx="8" fill="#FAF7F1"/><text x="74" y="29" fill="#2F5D27" text-anchor="middle">Aurora →</text></g>
    <g transform="translate(164,0)"><rect width="148" height="44" rx="8" fill="#FAF7F1"/><text x="74" y="29" fill="#2F5D27" text-anchor="middle">Batavia →</text></g>
    <g transform="translate(328,0)"><rect width="148" height="44" rx="8" fill="#FAF7F1"/><text x="74" y="29" fill="#2F5D27" text-anchor="middle">Wheaton →</text></g>
    <g transform="translate(492,0)"><rect width="148" height="44" rx="8" fill="#FAF7F1"/><text x="74" y="29" fill="#2F5D27" text-anchor="middle">Lisle →</text></g>
    <g transform="translate(656,0)"><rect width="180" height="44" rx="8" fill="#FAF7F1"/><text x="90" y="29" fill="#2F5D27" text-anchor="middle">Bolingbrook →</text></g>
  </g>
  <text x="80" y="184" font-family="ui-monospace,monospace" font-size="11" fill="#C2185B">ServiceAreaStrip · excludeSlug="naperville" · 5 chip-buttons · gap --spacing-4 (16) · radius --radius-md</text>
</svg>
```

#### Mobile SVG — neighbor cities strip (390 × 320)

```svg
<svg viewBox="0 0 390 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Neighbor cities strip — mobile">
  <rect width="390" height="320" fill="#FFFFFF"/>
  <text x="16" y="48" font-family="Manrope,sans-serif" font-size="18" font-weight="600" fill="#1A1A1A">Other places we work</text>
  <g transform="translate(16,72)" font-family="Manrope,sans-serif" font-size="14" font-weight="500">
    <g><rect width="170" height="44" rx="8" fill="#FAF7F1"/><text x="85" y="29" fill="#2F5D27" text-anchor="middle">Aurora →</text></g>
    <g transform="translate(186,0)"><rect width="170" height="44" rx="8" fill="#FAF7F1"/><text x="85" y="29" fill="#2F5D27" text-anchor="middle">Batavia →</text></g>
    <g transform="translate(0,56)"><rect width="170" height="44" rx="8" fill="#FAF7F1"/><text x="85" y="29" fill="#2F5D27" text-anchor="middle">Wheaton →</text></g>
    <g transform="translate(186,56)"><rect width="170" height="44" rx="8" fill="#FAF7F1"/><text x="85" y="29" fill="#2F5D27" text-anchor="middle">Lisle →</text></g>
    <g transform="translate(0,112)"><rect width="356" height="44" rx="8" fill="#FAF7F1"/><text x="178" y="29" fill="#2F5D27" text-anchor="middle">Bolingbrook →</text></g>
  </g>
</svg>
```

### 4.8 Local FAQ — surface `--color-bg-cream`

4 Q&As per city (D8.A). Renders via the locked `FaqAccordion` (1.09). Server-rendered native `<details>`/`<summary>`. **No per-item motion wrapper** (1.08 §3.7). Section-level `<AnimateIn>` only.

**Section heading EN:** "Common questions about working with us in <city>"
**Section heading ES:** "Preguntas frecuentes sobre trabajar con nosotros en <city>"

Q&A content lives in `locations.<slug>.faq[].{q,a}.{en,es}` (§11). All 4 Q&As feed the `FAQPage` JSON-LD same-source array (§5.2).

#### Desktop SVG — FAQ (1280 × 540)

```svg
<svg viewBox="0 0 1280 540" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Location FAQ — desktop">
  <rect width="1280" height="540" fill="#FAF7F1"/>
  <text x="80" y="100" font-family="Manrope,sans-serif" font-size="32" font-weight="700" fill="#1A1A1A" letter-spacing="-0.015em">Common questions about working with us in Naperville</text>

  <g transform="translate(80,160)" font-family="ui-sans-serif">
    <!-- Q 1 open -->
    <g><line x1="0" y1="0" x2="1120" y2="0" stroke="#E5E0D5"/>
       <text x="0" y="36" font-family="Manrope,sans-serif" font-size="18" font-weight="600" fill="#1A1A1A">Do you charge a travel fee to Naperville?</text>
       <text x="1100" y="36" font-size="22" fill="#2F5D27" text-anchor="end">−</text>
       <text x="0" y="68" font-size="15" fill="#4A4A4A">No. Naperville is in our regular service area; estimates are free and we don't add</text>
       <text x="0" y="88" font-size="15" fill="#4A4A4A">a mileage charge.</text>
    </g>
    <!-- Q 2 closed -->
    <g transform="translate(0,128)"><line x1="0" y1="0" x2="1120" y2="0" stroke="#E5E0D5"/>
       <text x="0" y="36" font-family="Manrope,sans-serif" font-size="18" font-weight="600" fill="#1A1A1A">How long has Sunset Services been working in Naperville?</text>
       <text x="1100" y="36" font-size="22" fill="#6B6B6B" text-anchor="end">+</text></g>
    <!-- Q 3 closed -->
    <g transform="translate(0,200)"><line x1="0" y1="0" x2="1120" y2="0" stroke="#E5E0D5"/>
       <text x="0" y="36" font-family="Manrope,sans-serif" font-size="18" font-weight="600" fill="#1A1A1A">Are you familiar with Naperville's permit process for hardscape?</text>
       <text x="1100" y="36" font-size="22" fill="#6B6B6B" text-anchor="end">+</text></g>
    <!-- Q 4 closed -->
    <g transform="translate(0,272)"><line x1="0" y1="0" x2="1120" y2="0" stroke="#E5E0D5"/>
       <text x="0" y="36" font-family="Manrope,sans-serif" font-size="18" font-weight="600" fill="#1A1A1A">Do you handle HOA approval submissions for Naperville subdivisions?</text>
       <text x="1100" y="36" font-size="22" fill="#6B6B6B" text-anchor="end">+</text>
       <line x1="0" y1="60" x2="1120" y2="60" stroke="#E5E0D5"/></g>
  </g>
  <text x="80" y="520" font-family="ui-monospace,monospace" font-size="11" fill="#C2185B">FaqAccordion (1.09) · 4 native &lt;details&gt; · same-source feeds FAQPage JSON-LD · no per-item motion</text>
</svg>
```

#### Mobile SVG — FAQ (390 × 800)

```svg
<svg viewBox="0 0 390 800" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Location FAQ — mobile">
  <rect width="390" height="800" fill="#FAF7F1"/>
  <text x="16" y="60" font-family="Manrope,sans-serif" font-size="22" font-weight="700" fill="#1A1A1A">Common questions about</text>
  <text x="16" y="92" font-family="Manrope,sans-serif" font-size="22" font-weight="700" fill="#1A1A1A">working with us in Naperville</text>

  <g transform="translate(16,140)">
    <line x1="0" y1="0" x2="358" y2="0" stroke="#E5E0D5"/>
    <text x="0" y="32" font-family="Manrope,sans-serif" font-size="16" font-weight="600" fill="#1A1A1A">Do you charge a travel fee?</text>
    <text x="346" y="32" font-size="20" fill="#2F5D27" text-anchor="end">−</text>
    <text x="0" y="60" font-family="Onest,sans-serif" font-size="14" fill="#4A4A4A">No. Naperville is in our regular</text>
    <text x="0" y="78" font-family="Onest,sans-serif" font-size="14" fill="#4A4A4A">service area; estimates are free.</text>

    <g transform="translate(0,120)"><line x1="0" y1="0" x2="358" y2="0" stroke="#E5E0D5"/>
       <text x="0" y="32" font-family="Manrope,sans-serif" font-size="16" font-weight="600" fill="#1A1A1A">How long in Naperville?</text>
       <text x="346" y="32" font-size="20" fill="#6B6B6B" text-anchor="end">+</text></g>
    <g transform="translate(0,184)"><line x1="0" y1="0" x2="358" y2="0" stroke="#E5E0D5"/>
       <text x="0" y="32" font-family="Manrope,sans-serif" font-size="16" font-weight="600" fill="#1A1A1A">Familiar with permits?</text>
       <text x="346" y="32" font-size="20" fill="#6B6B6B" text-anchor="end">+</text></g>
    <g transform="translate(0,248)"><line x1="0" y1="0" x2="358" y2="0" stroke="#E5E0D5"/>
       <text x="0" y="32" font-family="Manrope,sans-serif" font-size="16" font-weight="600" fill="#1A1A1A">HOA approval support?</text>
       <text x="346" y="32" font-size="20" fill="#6B6B6B" text-anchor="end">+</text>
       <line x1="0" y1="60" x2="358" y2="60" stroke="#E5E0D5"/></g>
  </g>
</svg>
```

### 4.9 CTA section — surface `--color-bg`

Page's single amber CTA (D11). Reuses shared `<CTA copyNamespace="location.cta" destination="/request-quote/" cityToken="<city>" />` with city-token interpolation in the H2. Phase 1.14 owns extending the CTA component to accept a `cityToken` prop (or equivalent) — surfaced in §13.

**H2 EN:** "Let's design your <city> outdoor space."
**H2 ES:** "Diseñemos tu espacio exterior en <city>."
**Sub EN:** "Free estimates. We'll be on-site within a week."
**Sub ES:** "Presupuestos gratuitos. Te visitamos en una semana."
**CTA label EN:** "Get a free estimate"
**CTA label ES:** "Solicita un presupuesto gratis"

#### Desktop SVG — CTA section (1280 × 360)

```svg
<svg viewBox="0 0 1280 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Location CTA section — desktop">
  <rect width="1280" height="360" fill="#FFFFFF"/>
  <text x="640" y="120" font-family="Manrope,sans-serif" font-size="40" font-weight="700" fill="#1A1A1A" letter-spacing="-0.02em" text-anchor="middle">Let's design your Naperville outdoor space.</text>
  <text x="640" y="172" font-family="Onest,sans-serif" font-size="18" fill="#4A4A4A" text-anchor="middle">Free estimates. We'll be on-site within a week.</text>
  <g transform="translate(490,212)">
    <rect width="300" height="56" rx="8" fill="#E8A33D"/>
    <text x="150" y="36" font-family="Manrope,sans-serif" font-size="17" font-weight="600" fill="#1A1A1A" text-anchor="middle">Get a free estimate</text>
  </g>
  <text x="640" y="306" font-family="ui-monospace,monospace" font-size="11" fill="#C2185B" text-anchor="middle">single amber CTA per page (D11) · --color-sunset-amber-500 · label --color-text-primary (8.0:1 AA)</text>
</svg>
```

#### Mobile SVG — CTA section (390 × 380)

```svg
<svg viewBox="0 0 390 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Location CTA section — mobile">
  <rect width="390" height="380" fill="#FFFFFF"/>
  <text x="16" y="80" font-family="Manrope,sans-serif" font-size="26" font-weight="700" fill="#1A1A1A" letter-spacing="-0.02em">Let's design your</text>
  <text x="16" y="112" font-family="Manrope,sans-serif" font-size="26" font-weight="700" fill="#1A1A1A" letter-spacing="-0.02em">Naperville outdoor space.</text>
  <text x="16" y="156" font-family="Onest,sans-serif" font-size="16" fill="#4A4A4A">Free estimates. We'll be on-site</text>
  <text x="16" y="178" font-family="Onest,sans-serif" font-size="16" fill="#4A4A4A">within a week.</text>
  <rect x="16" y="220" width="358" height="56" rx="8" fill="#E8A33D"/>
  <text x="195" y="256" font-family="Manrope,sans-serif" font-size="17" font-weight="600" fill="#1A1A1A" text-anchor="middle">Get a free estimate</text>
</svg>
```

---

## 5. SEO and schema

### 5.1 Service Areas index — meta + schema

**EN `<title>`:** "Service Areas — DuPage County, IL | Sunset Services" (49 chars)
**ES `<title>`:** "Áreas de servicio — Condado de DuPage, IL | Sunset Services" (60 chars; at limit)
**EN `<meta description>`:** "Sunset Services works in six DuPage County cities: Aurora, Naperville, Batavia, Wheaton, Lisle, Bolingbrook. Family-run since 2000." (138 chars)
**ES `<meta description>`:** "Sunset Services trabaja en seis ciudades del Condado de DuPage: Aurora, Naperville, Batavia, Wheaton, Lisle, Bolingbrook. Familiar desde 2000." (147 chars)

**JSON-LD blocks emitted (in this order):**

1. **`BreadcrumbList`** — Home → Service Areas. Items consumed from the same `breadcrumbs` array the visible `<Breadcrumb>` renders (1.09 §2 same-source rule).
2. **`ItemList`** — six `ListItem`s, each with:
   - `position`: 1–6
   - `url`: `/<locale>/service-areas/<slug>/`
   - `name`: e.g., "Aurora, IL"
   - `item.@type: "Place"`, `item.address.addressLocality: "<City>"`, `item.address.addressRegion: "IL"`

**OG image:** 1200×630 generated via `next/og` in Phase 2.

### 5.2 Location page — meta + schema

**Per-city `<title>`** (template; ≤60 chars per locale, all six checked):
- EN: "<City>, IL Landscaping & Hardscape | Sunset Services"
- ES: "Paisajismo y Hardscape en <City>, IL | Sunset Services"

**Per-city `<meta description>`** (≤160 chars; per-city seed-table populated):
- EN pattern: "Family-run landscaping and hardscape in <City>, IL since 2000. <serviceA>, <serviceB>, <serviceC>. Free estimates within <X> days."
- ES pattern: "Paisajismo y hardscape familiar en <City>, IL desde el año 2000. <servicioA>, <servicioB>, <servicioC>. Presupuestos gratuitos en <X> días."

**JSON-LD blocks emitted (in this order):**

1. **`BreadcrumbList`** — Home → Service Areas → <City>. **Same-source** with the visible `<Breadcrumb>`.
2. **`Place`** — `name`, `description`, `address.addressLocality`, `address.addressRegion: "IL"`, `address.postalCode` `[TBR — Cowork]`, `geo.latitude` + `geo.longitude` (representative — see seed `geo`), `containedInPlace.@type: "AdministrativeArea"`, `containedInPlace.name: "DuPage County"`, `areaServed: { @id: "#localbusiness" }` (references the sitewide `LocalBusiness` from the root layout, 1.05 §8).
3. **`ItemList`** of 6 `Service` items — each Service consumed from the same `featuredServiceSlugs` array the visible service grid renders. **Same-source.**
4. **`FAQPage`** — 4 Q&As, consumed from the same `faq` array the visible `FaqAccordion` renders. **Same-source.**

**hreflang** (every page):
```
<link rel="alternate" hreflang="en"        href=".../service-areas/<slug>/">
<link rel="alternate" hreflang="es"        href=".../es/service-areas/<slug>/">
<link rel="alternate" hreflang="x-default" href=".../service-areas/<slug>/">
```

**Canonical:** every page emits self-canonical `<link rel="canonical">`.

---

## 6. i18n strings table

Per Phase 1.05 §11 convention; `[TBR — needs native review]` marks Spanish strings the design pass owes to native review (Phase 2.13).

### 6.1 `serviceAreas.*` (chrome strings shared by the index)

| key | EN | ES |
|---|---|---|
| `serviceAreas.eyebrow` | SERVICE AREAS | ÁREAS DE SERVICIO |
| `serviceAreas.h1` | Where we work — DuPage County, Illinois. | Donde trabajamos — Condado de DuPage, Illinois. `[TBR]` |
| `serviceAreas.sub` | Family-run since 2000. Six cities, one crew, one phone number. | Familiar desde el año 2000. Seis ciudades, un solo equipo, un solo teléfono. `[TBR]` |
| `serviceAreas.heroCta` | Request a free estimate | Solicita un presupuesto gratis |
| `serviceAreas.heroPhoneLink` | or call (630) 946-9321 | o llama al (630) 946-9321 |
| `serviceAreas.map.title` | Map of DuPage County showing Sunset Services' six service areas. | Mapa del Condado de DuPage mostrando las seis áreas de servicio de Sunset Services. `[TBR]` |
| `serviceAreas.map.desc` | An illustrated map of DuPage County, Illinois, with six pins marking the cities Sunset Services works in. Each pin is a link to that city's service-area page. | Un mapa ilustrado del Condado de DuPage, Illinois, con seis pines que marcan las ciudades donde trabaja Sunset Services. Cada pin enlaza a la página de su ciudad. `[TBR]` |
| `serviceAreas.grid.eyebrow` | SIX CITIES | SEIS CIUDADES |
| `serviceAreas.grid.h2` | Pick your city. | Elige tu ciudad. |
| `serviceAreas.grid.sub` | Each page covers the services that fit that area, recent projects, and local trust signals. | Cada página cubre los servicios que se adaptan al área, proyectos recientes y señales de confianza local. `[TBR]` |
| `serviceAreas.grid.cardCta` | View → | Ver → |
| `serviceAreas.outside.h2` | Don't see your city? | ¿No ves tu ciudad? |
| `serviceAreas.outside.body` | We sometimes take projects in adjacent towns — Glen Ellyn, Warrenville, Plainfield. Call us; we'll tell you straight whether we're the right fit. | A veces tomamos proyectos en pueblos cercanos — Glen Ellyn, Warrenville, Plainfield. Llámanos; te diremos honestamente si somos los indicados. `[TBR]` |
| `serviceAreas.cta.h2` | Ready when you are. | Cuando estés listo, estamos. `[TBR]` |
| `serviceAreas.cta.sub` | Free estimates. We'll be on-site within a week. No pressure. | Presupuestos gratuitos. Te visitamos en una semana. Sin presión. `[TBR]` |
| `serviceAreas.cta.button` | Get a free estimate | Solicita un presupuesto gratis |

### 6.2 `location.*` (chrome strings shared by all 6 city pages)

Per-city content (city name, taglines, project captions, testimonial quotes, FAQ Q&As, why-local copy) lives in `locations.ts` — NOT in `messages/{locale}.json`. The strings here are the structural chrome.

| key | EN | ES |
|---|---|---|
| `location.breadcrumbServiceAreas` | Service Areas | Áreas de servicio |
| `location.heroCta` | Request a free estimate | Solicita un presupuesto gratis |
| `location.heroPhoneLink` | or call (630) 946-9321 | o llama al (630) 946-9321 |
| `location.microbar.years` | {years}+ years in {city} | {years}+ años en {city} `[TBR]` |
| `location.microbar.projects` | {count}+ local projects | {count}+ proyectos locales `[TBR]` |
| `location.microbar.response` | Free estimates within {days} days | Presupuestos gratuitos en {days} días `[TBR]` |
| `location.trust.years` | Years serving {city} | Años atendiendo a {city} `[TBR]` |
| `location.trust.projects` | Projects completed in {city} | Proyectos completados en {city} `[TBR]` |
| `location.trust.response` | Free estimates, on-site | Presupuestos gratuitos, en sitio `[TBR]` |
| `location.services.h2` | Services we offer in {city} | Servicios que ofrecemos en {city} `[TBR]` |
| `location.services.sub` | Curated for {city}'s properties and what we know works. | Seleccionados para las propiedades de {city} y lo que sabemos que funciona. `[TBR]` |
| `location.projects.h2` | Recent {city} projects | Proyectos recientes en {city} `[TBR]` |
| `location.projects.allLink` | See all projects → | Ver todos los proyectos → |
| `location.whyLocal.h2` | Why hire a family business for your {city} property | Por qué contratar a un negocio familiar para tu propiedad en {city} `[TBR]` |
| `location.whyLocal.aboutLink` | Read more about Erick → | Más sobre Erick → |
| `location.neighbors.h2` | Other places we work | Otros lugares donde trabajamos |
| `location.faq.h2` | Common questions about working with us in {city} | Preguntas frecuentes sobre trabajar con nosotros en {city} `[TBR]` |
| `location.cta.h2` | Let's design your {city} outdoor space. | Diseñemos tu espacio exterior en {city}. `[TBR]` |
| `location.cta.sub` | Free estimates. We'll be on-site within a week. | Presupuestos gratuitos. Te visitamos en una semana. `[TBR]` |
| `location.cta.button` | Get a free estimate | Solicita un presupuesto gratis |

---

## 7. Photography and illustration brief

For Phase 2.04 Cowork.

| Asset | Use | Spec | Budget |
|---|---|---|---|
| `serviceAreas.map.svg` | Index hero map (D3.C) — built in this phase, production-ready in §3.2 | SVG, viewBox 600×500, responsive `width="100%" height="auto"` | ≤80KB (current ≈3KB) |
| `location.<slug>.hero` (×6) | City page hero, D5.B layout | 4:3, AVIF | ≤350KB each |
| `location.<slug>.projects[1..3]` (×18 total) | Local projects strip, 3 per city | 4:3, AVIF, lazy | ≤200KB each |
| `about.portrait` (shared) | Why-local panel portrait, all 6 cities | 4:5, AVIF, lazy | ≤200KB |

**Per-city hero photo brief:**
- **Aurora** — residential street with mature trees, golden-hour preferred.
- **Naperville** — polished hardscape patio, premium register.
- **Batavia** — riverside-style backyard or natural-stone retaining wall.
- **Wheaton** — established suburban frontage with shaped beds.
- **Lisle** — commercial property entry / corporate landscape.
- **Bolingbrook** — mid-suburban project, recently completed.

If real per-city photos aren't available, a generic Sunset Services photo with a city-name caption is acceptable for Part 1. Cowork sources from Erick's Drive (Phase 2.04).

---

## 8. Motion choreography

- **Hero (both pages):** no entrance animation (1.07 lock).
- **Each below-fold section:** single `<AnimateIn variant="fade-up">` wrapper at section level. **Never** per-item.
- **City pins on the SVG map:** `transform: translateY(-2px)` on hover-in, 150ms `--motion-fast`, `--easing-standard`. `prefers-reduced-motion: reduce` short-circuits to no transform.
- **Photo cards (`.card-photo` on cities grid):** locked card-hover image scale 1.03 over `--motion-slow` (1.03 §6.2). Reduced-motion: scale stays 1.0.
- **FAQ accordion:** native `<details>` toggle; no JS animation.
- **Reduced-motion contract (1.04 lock):** all `<AnimateIn>` instances respect `prefers-reduced-motion: reduce` via `MotionConfig reducedMotion="user"` mounted in the locale layout.

**Per-page `<AnimateIn>` budget:**
- Index: **4 wrappers** (cities grid, outside-area band, CTA, plus optional 1 on hero map fade-in if Code prefers — but hero stays unanimated; recommend 3).
- Location template: **8 wrappers** (LocalTrustBand, services grid, projects strip, testimonials, why-local, neighbor cities, FAQ, CTA). Within 1.08 §10's section-level budget.

---

## 9. Accessibility audit

### Both pages

- **Heading hierarchy:** H1 in hero only, H2 per section, H3 for sub-cards. No skipped levels.
- **Skip-link (chrome):** unaffected; verify it still lands on `<main>`.
- **Focus-visible:** every interactive element shows the locked focus ring (1.04 §6.1) — `--color-focus-ring` on white/cream surfaces; `--color-text-on-green` ring on green primary buttons (1.03 §2.4).
- **Color contrast (audited):**
  - `--color-text-muted` on `--color-bg-cream`: 5.0:1 ✓ (1.03 row 9).
  - Pin label `#1A1A1A` on map land fill `#F1F5EE`: 17.5:1 ✓.
  - Pin circle `#4D8A3F` (decorative non-text) on `#F1F5EE`: contrast 3.4:1 — meets SC 1.4.11 (≥3:1 for non-text UI elements).

### Index-specific

- **Map SVG:** `role="img"` + `<title>` + `<desc>` (§3.2). Each pin is a real `<a>` (NOT JS-only click). Pin labels are visible `<text>` inside the `<a>`, not `aria-label`. The `<a>` carries `title="<City>, IL — view location page"` for tooltip + extra screen-reader context.
- **Cities grid cards:** full-card `<a>` wraps the card; the visible city name is the accessible name; the "View →" affordance has `aria-hidden="true"` so screen readers don't double-read.

### Location-specific

- **Hero photo:** has explicit `width`/`height` for aspect-ratio (no CLS). `alt` per locale: e.g., "A Sunset Services hardscape patio in Naperville, IL" / "Un patio Sunset Services en Naperville, IL".
- **Service-card grid:** each card is `<a>`; visible service name is accessible name.
- **Project tiles:** each tile is `<a>`; visible project title + city is accessible name; aspect-ratio CSS reserves space (no CLS).
- **Testimonial:** quote is plain prose (NOT a `<blockquote>` with hidden author — author + city are visible inside the card).
- **FAQ accordion:** native `<details>`/`<summary>` (locked). Q&A inside `<details>`. No JS-toggled custom widget.
- **Phone links:** visible number IS the link text (no "Call us" wrapper).
- **Microbar chips:** static text; not interactive; no `role` or `aria-*` needed.

### Reduced-motion verification (both pages)

| Surface | Default motion | reduced-motion |
|---|---|---|
| `<AnimateIn>` section wrappers | fade + 16px translate, 600ms | opacity-only, no transform |
| Map pin hover | translateY(-2px), 150ms | no transform |
| `.card-photo` image hover | scale(1.03), 480ms | scale(1.0) |
| FAQ `<details>` toggle | native toggle | native toggle (browser handles) |

---

## 10. Lighthouse 95+ implications

Both pages target ≥95 desktop AND mobile on all four metrics, carrying the 1.07 P=86 mobile lesson.

| Metric | Index | Location |
|---|---|---|
| **LCP** | H1 (D3.C, no hero photo). `clamp()` H1 weight is system-paint cheap. Inline SVG map = no network round-trip. | Hero photo (D5.B). 4:3 ≤350KB AVIF, `priority` + `fetchPriority="high"`, explicit width/height. |
| **TBT/INP** | Server components everywhere except locked motion primitives. SVG map is inert HTML — no JS. | Same. The new components (`LocationCard`, `ServiceAreaMap`, `LocalTrustBand`, `LocationCTA`, etc.) are server-default. **No new client components.** |
| **CLS** | Map SVG: explicit `viewBox` + responsive `width="100%" height="auto"`. All cards explicit width/height. | Hero photo + 6 service-card photos + 3 project tiles all carry explicit width/height or aspect-ratio CSS. |
| **Page weight target** | ≤ **900 KB** first load | ≤ **1.2 MB** first load |
| **Total JS shipped** | ≤500KB (matches 1.07 budget; should be lower since these pages add no client components) |  |
| **3rd-party scripts** | none (D4 = static SVG) | none |

---

## 11. Component file plan for Code (Phase 1.14)

```
src/components/sections/service-areas/
  ServiceAreasHero.tsx              # server — copy left + ServiceAreaMap right
  ServiceAreaMap.tsx                # server — production SVG (§3.2)
  CitiesGrid.tsx                    # server — composes 6 LocationCards
  OutsideAreaBand.tsx               # server
  ServiceAreasCTA.tsx               # server — thin wrapper around shared <CTA>

src/components/sections/location/
  LocationHero.tsx                  # server
  LocalTrustBand.tsx                # server
  LocationServicesGrid.tsx          # server — composes 6 ServiceCards
  LocalProjectsStrip.tsx            # server — composes 3 placeholder ProjectCards
  LocalTestimonials.tsx             # server
  WhyLocalPanel.tsx                 # server
  LocationFaq.tsx                   # server — composes FaqAccordion
  LocationCTA.tsx                   # server — wraps shared <CTA> with city-token interpolation

src/components/ui/
  LocationCard.tsx                  # small reusable, server

src/data/
  locations.ts                      # typed bilingual seed for the 6 cities
```

### `locations.ts` shape (mirrors `services.ts` from 1.09)

```ts
export type LocationCity = {
  slug: 'aurora' | 'naperville' | 'batavia' | 'wheaton' | 'lisle' | 'bolingbrook';
  name: string;                              // 'Aurora' — proper noun, stable across locales
  state: 'IL';
  geo: { lat: number; lng: number };          // representative; Cowork confirms in 2.07
  pin: { x: number; y: number };              // SVG-coordinate position on the §3.2 map (viewBox 600×500)
  hero: {
    h1: { en: string; es: string };
    sub: { en: string; es: string };
    photo: { src: string; aspect: '16x9' | '4x3' };
  };
  trust: {
    yearsServing: number | '[TBR]';
    projectsCompleted: number | '[TBR]';
    responseTimeDays: number | '[TBR]';
  };
  featuredServiceSlugs: string[];             // length 6 (D6 fixed)
  whyLocal: { en: string; es: string };       // ~120 words
  testimonials: Array<{
    quote: { en: string; es: string };
    attribution: { en: string; es: string };  // "Sarah K., West Highlands · Naperville"
    rating: 5;                                 // fixed at 5 in Part 1; real ratings in 2.15
  }>;
  faq: Array<{
    q: { en: string; es: string };
    a: { en: string; es: string };
  }>;                                          // length 4 (D8.A fixed)
  meta: {
    title: { en: string; es: string };
    description: { en: string; es: string };
  };
};

export const locations: LocationCity[] = [
  { slug: 'aurora',      /* ... */ },
  { slug: 'naperville',  /* ... */ },
  { slug: 'batavia',     /* ... */ },
  { slug: 'wheaton',     /* ... */ },
  { slug: 'lisle',       /* ... */ },
  { slug: 'bolingbrook', /* ... */ },
];
```

### Routing pattern (Phase 1.14 reference)

```
src/app/[locale]/service-areas/page.tsx                # index
src/app/[locale]/service-areas/[city]/page.tsx         # dynamic city template
```

`generateStaticParams` returns the six city slugs from `locations.ts`. Unknown slugs → `notFound()`.

### Spec changes Phase 1.14 owns (small, surfaced for Chat ratification)

1. **`ServiceAreaStrip` href reconciliation (D1).** Update `ServiceAreaStrip.tsx`'s href construction from `/locations/<slug>-il/` to `/service-areas/<slug>/`. Confirm no other component links to the old pattern (search the codebase for `/locations/`).
2. **`ServiceAreaStrip` `excludeSlug` prop (D7b).** Add `excludeSlug?: string` prop; when set, filter the rendered cities by `slug !== excludeSlug`. 3-line change. Default behavior (no `excludeSlug`) unchanged.
3. **`<CTA>` `cityToken` interpolation (D11).** The promoted `CTA` component needs to accept a token map for H2/sub interpolation. Recommend a generic `tokens?: Record<string, string>` prop; in the location-CTA wrapper, pass `tokens={{ city: location.name }}`. Existing call-sites without `tokens` are unaffected.

---

## 12. Decisions needed (consolidated)

| # | Decision | Recommendation | Reasoning (1 sentence) | Lock-source |
|---|---|---|---|---|
| **D1** | Canonical URL pattern | **A. `/service-areas/<city>/`** | The Plan §3 sitemap is canonical; the 1.11 strip diverged inadvertently and Phase 1.14 owns the reconciliation. | Plan §3 |
| **D2** | City slug shape | **bare slug** (e.g., `aurora`) | SEO loss from dropping `-il` is negligible; H1/breadcrumb/`Place` carry the state already. | Plan §3 |
| **D3** | Index hero treatment | **C. Split (text + static SVG map)** | The map IS the content of this page; lowest LCP cost; reads as deliberately informational. | 1.06 §5; 1.07 LCP |
| **D4** | Map representation in Part 1 | **A. Static SVG illustration** | Zero third-party load; small, accessible, hover-animatable. | 1.11 D8 |
| **D5** | Location-page hero layout | **B. Compact split (50vh)** | Trust-and-context at SEO landing register without overspending hero height. | 1.06 §5 |
| **D6** | Per-city service curation count | **B. 6 services per city** | Sweet spot between breadth and weight per tile. | 1.08 |
| **D7** | Local projects on city pages | **A. Real city projects, fallback to closest 3 from neighbor cities labeled with actual project city** | Faking the city is a trust kill; the fallback rule preserves honesty. | 1.16 forward |
| **D7b** | Neighbor cities strip implementation | **Reuse `ServiceAreaStrip` with new `excludeSlug` prop** | 3-line spec change beats a duplicate component. | 1.11 §11 |
| **D8** | Local FAQ pattern | **A. Per-city tailored FAQ, 4 Q&As** | Per-URL uniqueness for `FAQPage`; answers user intent on the page where it's asked. | 1.09 |
| **D9** | LocalTrustBand content | **A. Three stat cells (years / projects / response time)** | Matches audience-landing precedent; static text, no hydration. | 1.08 §3 |
| **D10** | Surface alternation | **Locked tables in §2** | Verified "never two adjacent same-surface." | 1.03 §9 |
| **D11** | Body amber CTA placement | **Bottom CTA section only, one per page** | Locked from prior phases. | 1.06 / 1.08 / 1.11 D6 |
| **D12** | Featured-card uses | **None on either page** | Featured-card cannot share a page with the amber CTA. | 1.06 D2 |

### Blockers for Phase 1.14 (Cowork resolves before Code starts)

- **B1 — Real per-city stats.** `years`, `projects`, `responseTimeDays` per city. Placeholders `[TBR]` flagged in seed. (D9.)
- **B2 — Real per-city lat/lng.** Representative public-source values are placeholders; Cowork confirms in Phase 2.07. (Plan §9 schema.)
- **B3 — Real per-city postal codes.** `[TBR]`; ship without `postalCode` if Cowork hasn't returned them by Phase 1.14 cutoff. (`Place.address.postalCode` is optional in Schema.org.)
- **B4 — D1 ratification.** **Canonical URL pattern must be ratified by Chat before Phase 1.14 starts.** A is the recommendation, but the conflict between Plan §3 and the 1.11 `ServiceAreaStrip` shipped href is a real divergence; Chat decides.

### Items intentionally not surfaced

The prompt's D10 surface-alternation suggestion (cream-band → cream-CTA on the index) violated 1.03 §9. §2 corrected it; the corrected version is the recommendation.

---

## 13. Verification checklist

Phase 1.14 Code runs this after implementation.

- [ ] Index hero matches §3.1 SVG reference; no entrance animation on hero.
- [ ] Static map SVG renders with 6 pins; each pin is a real `<a href="/service-areas/<slug>/">` (uses `<Link>` from `@/i18n/navigation`); hover translate-up respects `prefers-reduced-motion`.
- [ ] Map SVG `<title>` + `<desc>` populate from `serviceAreas.map.title` + `serviceAreas.map.desc` per locale.
- [ ] Cities grid: 6 cards, 3×2 desktop / 1-col mobile; each card is a full-card `<a>`.
- [ ] All 6 city pages render at `/service-areas/<slug>/` and `/es/service-areas/<slug>/` (12 routes); unknown slugs 404.
- [ ] City-page hero matches §4.1 SVG (D5.B winner); H1 within budget (≤7 EN / ≤10 ES words); photo has explicit width/height.
- [ ] LocalTrustBand renders 3 stat cells per D9.A.
- [ ] Featured services grid renders exactly 6 service cards per city per `featuredServiceSlugs`.
- [ ] Local projects strip renders 3 placeholder tiles with city captions matching the page city (D7.A); fallback rule documented in component comments.
- [ ] FAQ accordion renders 4 native `<details>` items per city; no per-item motion wrapper.
- [ ] Neighbor cities strip excludes the current city and shows the other 5 (`ServiceAreaStrip` `excludeSlug` prop in use).
- [ ] Single body amber CTA per page (the bottom CTA section); zero on the rest of the page.
- [ ] Surface alternation matches §2.D10 — no two adjacent same-surface bands (verify visually + via DOM inspection).
- [ ] All `serviceAreas.*` and `location.*` strings present in both `en.json` and `es.json`. `[TBR]` strings flagged in repo TODO.
- [ ] All 6 entries in `locations.ts` populated with full bilingual content.
- [ ] **Schema validates** (paste each JSON-LD into https://validator.schema.org/):
  - [ ] `ItemList` (index)
  - [ ] `BreadcrumbList` (both)
  - [ ] `Place` (city pages)
  - [ ] `Service`-`ItemList` (city pages)
  - [ ] `FAQPage` (city pages)
- [ ] hreflang links emitted per page per locale; canonical link emitted (self-canonical).
- [ ] **`ServiceAreaStrip` href shape updated to `/service-areas/<slug>/` per D1 (the Phase 1.11 strip currently links to `/locations/<slug>-il/` — this is a known follow-up Phase 1.14 owns).**
- [ ] `ServiceAreaStrip` accepts `excludeSlug?: string` prop and filters correctly when set.
- [ ] `<CTA>` accepts a `tokens` prop and interpolates `{city}` correctly in `location.cta.h2` / `location.cta.sub`.
- [ ] Lighthouse run on `localhost:3000` for `/service-areas/` and `/service-areas/aurora/`, **desktop AND mobile**, hits ≥95 on all four metrics. (Re-run for at least one ES route too: `/es/service-areas/naperville/`.)
- [ ] Reduced-motion verified: all `<AnimateIn>` instances + map-pin hover respect `prefers-reduced-motion: reduce`.
- [ ] Phase 1.12 About + Contact still works; chrome unchanged.
- [ ] No new component variants introduced (button / card / badge primitives unchanged).
- [ ] Color contrast: pin labels on map background ≥4.5:1 (audited 17.5:1 in §9); muted text on cream surface ≥4.5:1 (audited 5.0:1 in 1.03 row 9).
- [ ] Same-source rule (1.09 §2) verified: visible breadcrumb ⇄ `BreadcrumbList`; visible FAQ ⇄ `FAQPage`; visible service grid ⇄ `Service`-`ItemList`; visible cities grid ⇄ index `ItemList`.

---

**End of Phase 1.13 Design handover.**
