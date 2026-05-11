# Sunset Services — Resources + Blog Design Handover (Phase 1.17)

> Read by Claude Code in Phase 1.18 before any Resources or Blog implementation begins.
> Source of truth: this file. Conflicts with Phase 1.03 tokens, Phase 1.05 chrome, Phase 1.06 patterns, Phase 1.08 service-detail FAQ rule, Phase 1.11 shared `<CTA>` contract, Phase 1.13 `tokens` prop / `excludeSlug`, or Phase 1.15 `ProjectCard` extraction? **Earlier phases win.** Surface the mismatch to Claude Chat.
> Phase: Part 1 — Phase 17 (Design). Operator: Claude Design.
> Hands off to: Claude Code, Phase 1.18.

---

## 1. Scope and constraints

**In scope.** Four routes, EN + ES (8 rendered URLs at launch):

1. `/resources/` + `/es/resources/` — evergreen reference hub.
2. `/resources/[slug]/` + `/es/resources/[slug]/` — one master template, all entries.
3. `/blog/` + `/es/blog/` — time-stamped posts, newest first.
4. `/blog/[slug]/` + `/es/blog/[slug]/` — one master template, all posts.

Plus three new shared components (specced in §13):

- **`ContentCard`** — index-grid tile, reused on Resources index + Blog index, prop variants for byline / date / reading-time visibility. **Composes** the locked `card--photo` primitive (§13.1) — no new card variant.
- **`ContentMeta`** — author + publish-date + reading-time + category meta-strip on detail-page hero.
- **`ProseLayout`** — centered max-width prose container with optional sticky right-rail TOC; reused on both detail templates. Owns the prose stylesheet (§4.2).

**Out of scope.** Drafting the 5 seed blog posts (Code, 1.18). Drafting resource bodies (Code, 1.18; Erick polish in Part 2). Real photography (Cowork, 2.04 — slots tagged `[Cowork to source from Drive in Phase 2.04]`). Sanity wiring (Phase 2.03 — Part 1 reads typed `resources.ts` + `blog.ts` seeds). Newsletter capture (deferred — D9). Author profile pages (no `/authors/[slug]/` at launch — D7). On-site search (defer to Phase 2 if signal warrants — §16). Comments / reactions (out — brand isn't a publisher). RSS feed (out for Part 1 — recommend in §16). Quote wizard (1.19), AI chat (1.19), Privacy/Terms (3.03), 404 polish (1.20).

**Locked from earlier phases — DO NOT redesign.**

- All design tokens (1.03 §2–§7) — colors, type scale, spacing, radius, shadow, motion, z-index, breakpoints. **No new tokens.**
- All component primitives (1.03 §6) — `Button` (Primary green / Amber / Ghost / Secondary), `Card` (`.card`, `.card--cream`, `.card--photo`, `.card--featured`), `Badge`, `Breadcrumb`, `Eyebrow`, `FaqAccordion`, form fields. **No new variants.** New components in this phase compose existing primitives.
- Chrome (1.05). Section rhythm `py-20` desktop / `py-14` mobile, alternating `--color-bg`/`--color-bg-cream` (1.03 §9) — never two adjacent same-surface bands.
- **Amber discipline** (1.05 §1, restated through 1.06 / 1.08 / 1.11 / 1.13 / 1.15): navbar amber is chrome and does not count. Each body page has **at most one** amber CTA, in the bottom CTA section. Hero primary buttons are **Primary green**.
- **Featured-card constraint** (1.06 §2.4): `.card--featured` cannot live on the same page as an amber CTA.
- **Motion contract** (1.03 §7 + 1.07 P=86 lesson): `<AnimateIn>` at section granularity only; never per card / list item / form field. Heroes have no entrance animation. Reduced-motion: opacity-only at `--motion-fast`.
- **FAQ no-wrapper-per-item rule** (1.08 §3.7): `<details>` items render directly inside the section, not wrapped per-item.
- **Breadcrumb + JSON-LD same-source** (1.09 §2): the visible breadcrumb and the `BreadcrumbList` payload consume one items array.
- **CTA `tokens` prop** (1.13 / 1.14): the shared `<CTA>` accepts a `tokens` map for H2/sub interpolation. Reused here for category / city interpolation.
- **`ServiceAreaStrip` `excludeSlug` prop** (1.13 D7b): shipped — reused on location-targeted blog posts.
- **`ProjectCard`** (1.15 / 1.16 §11.2 extraction): reused only on the "if a blog post mentions a project" pattern, NOT for content cards (different visual semantics — see §13.1).
- **Single-hyphen BEM** (1.09 §10 #5): `card--photo`, `btn--amber`. Applied throughout.

---

## 2. Page-level decisions

### D1 — Resources vs Blog distinction → **Two separate routes.**

Different content shape (evergreen reference vs time-stamped news), different schema (`Article`/`HowTo` vs `BlogPosting`), different sort defaults (alpha vs newest), different filter taxonomies. One unified "Library" surface would force a lowest-common-denominator card and confuse the schema story for Google. **Locked-phase ref:** Plan §4 lists them as separate items. **Alternates surfaced:** A unified `/library/` with content-type filter (rejected — schema split is non-negotiable for SEO).

### D2 — Index page layout → **3-column `ContentCard` grid (3 / 2 / 1 across `lg` / `md` / `sm`).**

Single grid component (`ContentCard` with prop variants — D6, D7) used on both indexes. **Locked-phase ref:** 1.15 §3.3 (`ProjectCard` 3-up); 1.06 §8 (homepage projects 3-up). **Alternates:** thumbnail-left list (rejected — too dense for evergreen browsing), masonry (rejected — CLS risk + unstable LCP).

### D3 — Featured/hero card on indexes → **Yes Blog (newest post 2-col span). No Resources.**

Blog wants a "what's new" signal; Resources is alphabetical reference and doesn't. Featured Blog card is a **custom 2-col layout that does NOT use `.card--featured`** — it reuses the locked `card--photo` primitive at a wider span. This sidesteps the 1.06 §2.4 constraint (featured-card cannot share a page with an amber CTA — Blog index has an amber CTA in the bottom CTA section). **Alternates:** `.card--featured` for the hero post (rejected — would force the bottom CTA to drop amber, which gut-checks worse than skipping the amber border ring).

### D4 — Filter taxonomy → single-select chip strip with `?category={slug}` URL state on both.

- **Resources (5 categories):** `lawn-care` · `hardscape` · `snow-and-winter` · `buying-guides` · `local-permits`. "All" leftmost default.
- **Blog (5 categories):** `how-to` · `cost-guide` · `seasonal` · `industry-news` · `audience` (covers residential/commercial/hardscape posts via a `subAudience` field — see D19). "All" leftmost default.

Single-select matches the 1.15 D2.A precedent. Server-rendered, URL-driven, no client filtering. **Alternates:** multi-select (rejected — confuses SEO if filtered URLs are crawled), tags + categories (rejected — over-IA for 5 seed posts).

### D5 — Sort order on indexes
- **Resources:** alphabetical by title only at launch. No sort selector. Alternates: most-recent (rejected — D8 says no Resources date display); most-read (deferred — needs analytics).
- **Blog:** newest first (default). No sort selector — only 5 posts at launch.

### D6 — Reading-time display → **Yes on both. "8 min read" / "8 min de lectura".**

Premium-UX signal. Computed at build time: strip Markdown → split on `\s+` → divide by **200 wpm** → `Math.ceil()` to nearest minute → write `wordCount` + `readingMinutes` onto the resolved entry. Spec the build-time helper contract; Code implements in 1.18.

### D7 — Author display → **Byline string only; no author profile pages at launch.**

Default byline `"Sunset Services Team"`. Per-entry override via optional `byline` field. When `byline === "Erick Sotomayor"`, schema `author.url = "{baseUrl}/{locale}/about/#erick"` (same-source with the About `#erick` anchor from 1.11). All other bylines render schema `author` as a string only (no URL).

**Cowork task (surfaced in §16):** Erick confirms which seed posts list "Erick" vs. "Sunset Services Team". Marcin candidate for hardscape-deep posts.

### D8 — Date display
- **Blog:** ISO `publishedAt` in seed → render localized via `next-intl`'s `formatDateTime` with `{ year: 'numeric', month: 'long', day: 'numeric' }` (EN: "April 12, 2026", ES: "12 de abril de 2026"). Schema `dateModified` from optional `updatedAt`; falls back to `publishedAt`.
- **Resources:** **Hidden in UI.** The seed carries `lastUpdated` for `dateModified` schema + sitemap freshness; nothing renders to the user. Stale-date risk on a "Patio Materials Guide" outweighs the freshness signal.

### D9 — Newsletter capture → **Defer to Part 2 (option A).**

The page already carries: navbar amber CTA (chrome) + bottom amber CTA + planned AI chat widget (1.19) + planned quote wizard (1.19). A fourth conversion path on a content page dilutes them. Surfaced for Chat ratification with alternates B (UI-only block on detail pages) and C (sidebar widget with form-states only).

### D10 — Body content layout → **`ProseLayout`: centered max-width 720px prose + sticky right-rail TOC at `xl` (1440px+).**

Below `xl` the TOC collapses to a `<details>` accordion at the top of the body (closed by default). TOC auto-builds from `<h2>` ids; current item highlighted via `IntersectionObserver`. **Single client component** on detail pages (§12). The H2s themselves are SSR HTML — TOC adds no SEO value, so `next/dynamic({ ssr: false })` is acceptable for the TOC component only. **Alternate:** prose-only without TOC (surfaced for ratification — drop if Chat prefers minimum client surface).

### D11 — Related-content strategy
- **Resource detail:** 3 related resources, same category preferred, fallback to most-recently-updated other resources excluding self. `ContentCard` grid below body.
- **Blog post:** 3 related posts, same category preferred, fallback to most-recent excluding self.
- **Cross-pollination (inline mid-body):** every entry MAY flag `inlineServiceCrossLink: { audience, serviceSlug }` — renders one `<ServiceCard>` between two prose H2s, NOT wrapped in its own `<section>`. Reuses 1.09's `<ServiceCard>`.
- **Inline location strip (Blog only):** entries MAY flag `inlineLocationCity` — renders `<ServiceAreaStrip excludeSlug={citySlug} />` near the bottom of the body.

### D12 — CTA section → **Shared `<CTA>` with `tokens` prop on every detail page.**

Reuses the promoted `<CTA>` component (1.11 §11.1 → 1.13 D11). The `tokens` map interpolates `{category}`, `{serviceSlug}`, or `{city}` into the H2/sub strings per entry. Index pages also use `<CTA>` but pass `tokens={}` (or omit) — no per-entry interpolation.

### D13 — Schema choice per content type
- **Resource — `Article` default; `HowTo` opt-in via `schemaType` field.** A "How to Choose a Landscaper" resource is `HowTo` (it's stepwise); "Patio Materials Guide" is `Article`.
- **Blog post — `BlogPosting` default; `Article` opt-in.** All 5 seed posts ship `BlogPosting` per recommendation.
- **Both routes always add `BreadcrumbList`.** Both add `FAQPage` when the entry renders an FAQ section.

### D14 — Surface alternation per route

Restated from 1.03 §9 (`py-20` desktop / `py-14` mobile, never two adjacent same-surface bands).

| Route | §1 Hero | §2 Filter+Grid | §3 Help-deciding band | §4 CTA |
|---|---|---|---|---|
| **Resources index** | `--color-bg` | `--color-bg-cream` | `--color-bg` | `--color-bg-cream` |
| **Blog index** | `--color-bg` | `--color-bg-cream` | *(skip — featured card does the work)* | `--color-bg` |

| Route | §1 Hero | §2 Body | §3 FAQ | §4 Related | §5 CTA |
|---|---|---|---|---|---|
| **Resource detail** | `--color-bg-cream` | `--color-bg` | `--color-bg-cream` | `--color-bg` | `--color-bg-cream` |
| **Blog post** | `--color-bg` | `--color-bg` *(prose extends hero band)* | `--color-bg-cream` | `--color-bg` | `--color-bg-cream` |

**Note on Blog post §1+§2.** The Blog hero and prose body share `--color-bg` to keep the featured image and the lede on a single visual surface — alternation re-counts the hero+body as one band. The next band (FAQ) flips to cream as required. This is the same pattern as 1.08 §2.2 service-detail hero+body.

If a detail page is missing FAQ (`!entry.faq`), the alternation re-resolves: body (white) → related (cream) → cta (white). Code asserts the alternation rule at build time per 1.13 precedent.

### D15 — Amber discipline per page

- **Indexes (both):** one amber CTA in §4 bottom CTA section.
- **Detail pages (both):** one amber CTA in §5 bottom CTA section.
- **Zero-amber option:** if a detail page has no FAQ AND no related strip, it MAY close on related-content alone with no body amber. None of the 5 seed entries qualify — all have FAQ or related. Documented for future entries.

### D16 — Featured-card uses → **None.**

No page in this phase uses `.card--featured`. The Blog index featured-post is a custom 2-col layout reusing `card--photo` (D3). Therefore the 1.06 §2.4 constraint is moot. Verify at Code-time: `document.querySelectorAll('.card--featured').length === 0` on all four routes.

### D17 — Reduced-motion behavior

Per 1.03 §7.7 contract:

- Heroes never animate (locked).
- `<AnimateIn variant="fade-up">` at section granularity only — no per-card on the grids, no per-item on the FAQ.
- With `prefers-reduced-motion: reduce`: every `<AnimateIn>` becomes opacity-only at `--motion-fast` (120ms).
- TOC sticky highlight is `IntersectionObserver`-driven, not entrance motion — unaffected by reduced-motion.
- Card hover scale becomes `1.0` under reduced motion; shadow growth retained.

### D18 — Resource seed entries (5 at launch)

Recommendation table for Chat to ratify row-by-row:

| # | Title (EN) | Slug | Category | Schema | Rationale |
|---|---|---|---|---|---|
| 1 | Patio Materials Guide: Concrete vs. Pavers vs. Natural Stone | `patio-materials-guide` | `hardscape` | `Article` | Highest-intent buyer-decision content; hardscape is the margin-rich service. |
| 2 | How to Choose a Landscaper: A DuPage Homeowner's Checklist | `how-to-choose-a-landscaper` | `buying-guides` | `HowTo` | Trust-first; works as `HowTo` for rich-results step list. |
| 3 | Lawn Care Glossary for DuPage Homeowners | `lawn-care-glossary` | `lawn-care` | `Article` | Term-reference; FAQ-friendly long-tail; evergreen. |
| 4 | Snow Removal Service Levels Explained for Property Managers | `snow-service-levels-for-pms` | `snow-and-winter` | `Article` | Commercial trust-builder; PM audience is underserved by competitors. |
| 5 | Hardscape Permits in DuPage County: A Quick Reference | `dupage-hardscape-permits` | `local-permits` | `Article` | Local-SEO + expertise signal; hyper-specific keyword set. |

**Alternates surfaced:** swap #5 for "Spring Lawn Equipment Buyer's Guide" (rejected — duplicates blog seasonal post #2 territory).

### D19 — Blog seed entry assignments

The Plan §4 locks 5 titles. Recommended category + schema assignments:

| # | Title (EN) | Slug | Category | Schema | FAQ? | Inline cross-link |
|---|---|---|---|---|---|---|
| 1 | How Much Does a Patio Cost in DuPage County in 2026? | `dupage-patio-cost-2026` | `cost-guide` | `BlogPosting` | Yes (cost FAQ) | `hardscape/patios-walkways` |
| 2 | Spring Lawn Care Calendar for Aurora, IL Homeowners | `aurora-spring-lawn-calendar` | `seasonal` | `BlogPosting` | No | `residential/lawn-care` + `inlineLocationCity: 'aurora'` |
| 3 | Why Unilock? A Look at Premium Pavers | `why-unilock-premium-pavers` | `how-to` | `BlogPosting` | No | `hardscape/patios-walkways` |
| 4 | Snow Removal for Commercial Properties: What Property Managers Need to Know | `snow-for-commercial-properties` | `audience` (`subAudience: 'commercial'`) | `BlogPosting` | Yes | `commercial/snow-and-ice` |
| 5 | 7 Signs Your Sprinkler System Needs a Tune-Up Before Summer | `sprinkler-tune-up-7-signs` | `how-to` | `BlogPosting` + `FAQPage` | Yes (7-Q FAQ) | `residential/sprinkler-systems` |

**Alternates surfaced for Chat to ratify per row:** Post #3 schema as `Article` instead of `BlogPosting` (Unilock is more product-comparison than time-stamped news — defensible either way; recommend `BlogPosting` for index inclusion uniformity). Post #4 byline = "Erick" vs "Sunset Services Team" — surface as Cowork task per D7.

---

## 3. Resources index — section-by-section spec

Route: `/resources/` and `/es/resources/`. Surface alternation per D14. Four sections.

### 3.1 Hero — surface `--color-bg`

Eyebrow "RESOURCES" / "RECURSOS", H1, dek, count line. **No photo** — Resources is reference content; the H1 + dek is the LCP. **No entrance animation** (1.03 §7).

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 460" width="100%" role="img" aria-label="Resources index hero — desktop">
  <style>
    .eb { font-family: Manrope, system-ui, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.12em; fill: #2F5D27; }
    .h1 { font-family: Onest, system-ui, sans-serif; font-size: 64px; font-weight: 700; fill: #1A1A1A; }
    .dek { font-family: Manrope, system-ui, sans-serif; font-size: 20px; fill: #4A4A4A; }
    .meta { font-family: Manrope, system-ui, sans-serif; font-size: 14px; fill: #6B6B6B; }
    .anno { font-family: ui-monospace, monospace; font-size: 11px; fill: #C2185B; }
    .ruler { stroke: #C2185B; stroke-width: 1; stroke-dasharray: 2 3; }
  </style>
  <rect width="1440" height="460" fill="#FFFFFF"/>
  <line x1="80" y1="0" x2="80" y2="460" class="ruler"/>
  <line x1="1360" y1="0" x2="1360" y2="460" class="ruler"/>
  <text x="80" y="160" class="eb">RESOURCES</text>
  <text x="80" y="240" class="h1">Field-tested guides for</text>
  <text x="80" y="316" class="h1">DuPage homeowners.</text>
  <text x="80" y="372" class="dek">Buyer guides, term references, and permit primers — kept honest, kept current.</text>
  <text x="80" y="416" class="meta">5 guides · last updated April 2026</text>
  <text x="980" y="160" class="anno">--color-bg surface · py-20 desktop</text>
  <text x="980" y="180" class="anno">eyebrow: --text-eyebrow · --color-sunset-green-700</text>
  <text x="980" y="200" class="anno">H1: --text-h1-d (64px) · text-wrap: balance</text>
  <text x="980" y="220" class="anno">dek: --text-body-lg · max-width 720</text>
  <text x="980" y="240" class="anno">No featured photo · LCP = H1 text node</text>
  <text x="980" y="260" class="anno">No entrance animation (1.03 §7)</text>
</svg>
```

**Mobile (390 × 480):** same shape; H1 drops to `--text-h1-m` (36px); container gutter `--spacing-5`; py-14. Eyebrow stacks above H1; dek wraps; count line at bottom.

**Specs.**
| Element | Spec |
|---|---|
| Surface | `--color-bg` |
| Container | `--container-default` (1280 max), gutters `--spacing-20` desktop / `--spacing-5` mobile |
| Padding | `py-20` desktop / `py-14` mobile |
| Eyebrow | `--text-eyebrow`, `--color-sunset-green-700`, uppercase, letter-spacing 0.12em |
| H1 | `--text-h1-d` (64px) / `--text-h1-m` (36px), `font-weight: 700`, `--color-text-primary`, `text-wrap: balance`, ≤ 8 words EN |
| Dek | `--text-body-lg` (20px / 18px), `--color-text-secondary`, max-width 720, `text-wrap: pretty`, ≤ 22 words EN |
| Count line | `--text-body-sm`, `--color-text-muted`. EN: `"{n} guides · last updated {month} {year}"` / ES: `"{n} guías · actualizadas en {month} {year}"`. Build-time computed from seed. |
| Motion | None. |

### 3.2 Filter chip strip + `ContentCard` grid — surface `--color-bg-cream`

Filter chips (D4) at the top of the section; grid below. Both share one `--color-bg-cream` band; they're visually one tool — chips → grid. One section-level `<AnimateIn variant="fade-up">` wraps the whole thing; the cards inside do NOT animate individually (1.07 P=86 lesson).

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 1080" width="100%" role="img" aria-label="Resources filter + grid — desktop">
  <style>
    .chip { font-family: Manrope; font-weight: 600; font-size: 14px; }
    .chipa { fill: #FAF7F1; }
    .chipi { fill: #1A1A1A; }
    .badge { font-family: Manrope; font-weight: 600; font-size: 11px; letter-spacing: 0.08em; fill: #2F5D27; }
    .ttl { font-family: Onest; font-weight: 700; font-size: 22px; fill: #1A1A1A; }
    .dek { font-family: Manrope; font-size: 14px; fill: #4A4A4A; }
    .meta { font-family: Manrope; font-size: 12px; fill: #6B6B6B; }
    .anno { font-family: ui-monospace, monospace; font-size: 11px; fill: #C2185B; }
  </style>
  <rect width="1440" height="1080" fill="#FAF7F1"/>
  <g transform="translate(80,80)">
    <rect width="80" height="40" rx="20" fill="#2F5D27"/>
    <text x="40" y="26" class="chip chipa" text-anchor="middle">All</text>
    <g transform="translate(96,0)"><rect width="116" height="40" rx="20" fill="#FFFFFF" stroke="#C9C0AE"/><text x="58" y="26" class="chip chipi" text-anchor="middle">Lawn Care</text></g>
    <g transform="translate(228,0)"><rect width="116" height="40" rx="20" fill="#FFFFFF" stroke="#C9C0AE"/><text x="58" y="26" class="chip chipi" text-anchor="middle">Hardscape</text></g>
    <g transform="translate(360,0)"><rect width="148" height="40" rx="20" fill="#FFFFFF" stroke="#C9C0AE"/><text x="74" y="26" class="chip chipi" text-anchor="middle">Snow &amp; Winter</text></g>
    <g transform="translate(524,0)"><rect width="140" height="40" rx="20" fill="#FFFFFF" stroke="#C9C0AE"/><text x="70" y="26" class="chip chipi" text-anchor="middle">Buying Guides</text></g>
    <g transform="translate(680,0)"><rect width="140" height="40" rx="20" fill="#FFFFFF" stroke="#C9C0AE"/><text x="70" y="26" class="chip chipi" text-anchor="middle">Local Permits</text></g>
  </g>
  <g transform="translate(80,180)">
    <g>
      <rect width="416" height="420" rx="12" fill="#FFFFFF"/>
      <rect x="0" y="0" width="416" height="220" rx="12" fill="#E5E0D5"/>
      <text x="208" y="118" class="anno" text-anchor="middle" fill="#6B6B6B">[photo 16:9]</text>
      <rect x="20" y="20" width="96" height="22" rx="11" fill="#FAF7F1"/>
      <text x="68" y="35" class="badge" text-anchor="middle">HARDSCAPE</text>
      <text x="20" y="270" class="ttl">Patio Materials Guide:</text>
      <text x="20" y="298" class="ttl">Concrete vs. Pavers vs.</text>
      <text x="20" y="326" class="ttl">Natural Stone</text>
      <text x="20" y="356" class="dek">A side-by-side decision matrix for</text>
      <text x="20" y="374" class="dek">DuPage homeowners weighing options.</text>
      <text x="20" y="400" class="meta">12 min read</text>
    </g>
    <g transform="translate(440,0)">
      <rect width="416" height="420" rx="12" fill="#FFFFFF"/>
      <rect x="0" y="0" width="416" height="220" rx="12" fill="#E5E0D5"/>
      <rect x="20" y="20" width="124" height="22" rx="11" fill="#FAF7F1"/>
      <text x="82" y="35" class="badge" text-anchor="middle">BUYING GUIDES</text>
      <text x="20" y="270" class="ttl">How to Choose a</text>
      <text x="20" y="298" class="ttl">Landscaper: A DuPage</text>
      <text x="20" y="326" class="ttl">Homeowner's Checklist</text>
      <text x="20" y="356" class="dek">Ten questions to ask before signing</text>
      <text x="20" y="374" class="dek">a landscaping contract.</text>
      <text x="20" y="400" class="meta">9 min read</text>
    </g>
    <g transform="translate(880,0)">
      <rect width="416" height="420" rx="12" fill="#FFFFFF"/>
      <rect x="0" y="0" width="416" height="220" rx="12" fill="#E5E0D5"/>
      <rect x="20" y="20" width="100" height="22" rx="11" fill="#FAF7F1"/>
      <text x="70" y="35" class="badge" text-anchor="middle">LAWN CARE</text>
      <text x="20" y="270" class="ttl">Lawn Care Glossary for</text>
      <text x="20" y="298" class="ttl">DuPage Homeowners</text>
      <text x="20" y="356" class="dek">Aerification to zoysia — every term in</text>
      <text x="20" y="374" class="dek">your bid demystified.</text>
      <text x="20" y="400" class="meta">7 min read</text>
    </g>
  </g>
  <g transform="translate(80,624)">
    <g>
      <rect width="416" height="420" rx="12" fill="#FFFFFF"/>
      <rect x="0" y="0" width="416" height="220" rx="12" fill="#E5E0D5"/>
      <rect x="20" y="20" width="160" height="22" rx="11" fill="#FAF7F1"/>
      <text x="100" y="35" class="badge" text-anchor="middle">SNOW &amp; WINTER</text>
      <text x="20" y="270" class="ttl">Snow Removal Service</text>
      <text x="20" y="298" class="ttl">Levels Explained for</text>
      <text x="20" y="326" class="ttl">Property Managers</text>
      <text x="20" y="400" class="meta">8 min read</text>
    </g>
    <g transform="translate(440,0)">
      <rect width="416" height="420" rx="12" fill="#FFFFFF"/>
      <rect x="0" y="0" width="416" height="220" rx="12" fill="#E5E0D5"/>
      <rect x="20" y="20" width="124" height="22" rx="11" fill="#FAF7F1"/>
      <text x="82" y="35" class="badge" text-anchor="middle">LOCAL PERMITS</text>
      <text x="20" y="270" class="ttl">Hardscape Permits in</text>
      <text x="20" y="298" class="ttl">DuPage County:</text>
      <text x="20" y="326" class="ttl">A Quick Reference</text>
      <text x="20" y="400" class="meta">5 min read</text>
    </g>
  </g>
  <text x="80" y="60" class="anno">Surface --color-bg-cream · py-20 · single-select chip strip · URL state ?category={slug}</text>
  <text x="80" y="160" class="anno">3-col grid · gap --spacing-6 (24px) · ContentCard primitive (§13.1) · whole card is a single &lt;a&gt;</text>
  <text x="80" y="1060" class="anno">Section-level &lt;AnimateIn variant="fade-up"&gt; · cards do NOT animate individually (1.07 P=86 lesson)</text>
</svg>
```

**Mobile.** Chip strip horizontally scrolls below 768 with `scroll-snap-type: x mandatory`, no scrollbar. Grid collapses to single column with `gap --spacing-5`. Cards stack with the same internal layout; first card image eager, rest lazy.

**Specs.**
| Element | Spec |
|---|---|
| Surface | `--color-bg-cream` |
| Filter chip — active | `<button>`, `bg --color-sunset-green-700`, `color --color-text-on-dark`, `border-radius 9999px`, padding `--spacing-3 --spacing-5`, `--text-body-sm` 600. **`aria-pressed="true"`**. |
| Filter chip — inactive | `bg --color-bg`, `color --color-text-primary`, `border 1px solid --color-border-strong`, same radius/padding. Hover: `bg --color-bg-cream`. `aria-pressed="false"`. |
| Filter overflow | Mobile: horizontal scroll, `scroll-snap-type: x mandatory`. Desktop: wraps to second row only if locale-strings overflow (test ES at 1024). |
| Filter URL | Single-select. `?category={slug}` updates via `useRouter().push()` from a `"use client"` boundary local to the chip strip. "All" omits the param. |
| Grid | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`, gap `--spacing-6` desktop / `--spacing-5` mobile |
| Card | `ContentCard` — see §13.1. Resources variant: badge + title + dek (≤ 80 chars) + reading-time. **No date** (D8). |
| Empty state | When 0 cards match: cream-on-cream callout block, message "No resources match this filter yet." / "Aún no hay recursos en esta categoría." + Ghost × md "Clear filter" → `/resources/`. |
| Motion | One `<AnimateIn variant="fade-up">` at section root. Per-card: none. |

### 3.3 "Need help deciding?" band — surface `--color-bg`

Optional. One-sentence pitch + Primary green `Talk to us →` button. **Surfaced as cuttable in §14** if Chat reads it as filler — but the band serves a purpose: it adds a non-amber CTA so the bottom amber CTA carries the only amber, AND it gives the Resources index a third visual band that breaks up an otherwise long content-card body. Recommendation: keep.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" width="100%" role="img" aria-label="Resources help-deciding band — desktop">
  <style>
    .h2 { font-family: Onest; font-weight: 700; font-size: 36px; fill: #1A1A1A; }
    .body { font-family: Manrope; font-size: 18px; fill: #4A4A4A; }
    .btn { font-family: Manrope; font-weight: 600; font-size: 16px; fill: #FFFFFF; }
    .anno { font-family: ui-monospace, monospace; font-size: 11px; fill: #C2185B; }
  </style>
  <rect width="1440" height="320" fill="#FFFFFF"/>
  <g transform="translate(720,160)" text-anchor="middle">
    <text y="-32" class="h2">Reading guides only takes you so far.</text>
    <text y="12" class="body">Tell us what you're considering. We'll come listen and help you sort it out.</text>
    <g transform="translate(-100,40)">
      <rect width="200" height="48" rx="8" fill="#4D8A3F"/>
      <text x="100" y="32" class="btn" text-anchor="middle">Talk to us →</text>
    </g>
  </g>
  <text x="80" y="40" class="anno">Surface --color-bg · py-20 · container-narrow centered · NO amber here · Primary green × md</text>
  <text x="80" y="60" class="anno">CUT-able if Chat reads as filler (§14 alternate). Default: keep.</text>
</svg>
```

**Specs.**
| Element | Spec |
|---|---|
| Surface | `--color-bg` |
| Container | `--container-narrow` (960), centered text |
| H2 | `--text-h2-d` (36px) / `--text-h2-m` (28px), `--color-text-primary` |
| Body | `--text-body-lg`, `--color-text-secondary`, ≤ 18 words |
| CTA | **Primary green × md** (NOT amber). `/{locale}/contact/`. `data-cr-tracking="resources-help-band"` |
| Motion | `<AnimateIn variant="fade-up">` |

### 3.4 CTA section — surface `--color-bg-cream` — the page's one amber

Reuses shared `<CTA>` with `tokens={}` (no interpolation needed for the index). Destination `/{locale}/request-quote/`.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 460" width="100%" role="img" aria-label="Resources index CTA — desktop">
  <style>
    .eb { font-family: Manrope; font-weight: 600; font-size: 13px; letter-spacing: 0.12em; fill: #2F5D27; }
    .h2 { font-family: Onest; font-weight: 700; font-size: 56px; fill: #1A1A1A; }
    .body { font-family: Manrope; font-size: 20px; fill: #4A4A4A; }
    .btn { font-family: Manrope; font-weight: 700; font-size: 18px; fill: #1A1A1A; }
    .tel { font-family: Manrope; font-size: 14px; fill: #2F5D27; }
    .anno { font-family: ui-monospace, monospace; font-size: 11px; fill: #C2185B; }
  </style>
  <rect width="1440" height="460" fill="#FAF7F1"/>
  <g transform="translate(720,140)" text-anchor="middle">
    <text y="-20" class="eb">READY WHEN YOU ARE</text>
    <text y="40" class="h2">Done reading? Let's measure.</text>
    <text y="92" class="body">A free estimate takes 30 minutes. We come listen, sketch, and price it.</text>
    <g transform="translate(-140,124)">
      <rect width="280" height="56" rx="8" fill="#E8A33D"/>
      <text x="140" y="36" class="btn" text-anchor="middle">Get a Free Estimate</text>
    </g>
    <text y="216" class="tel">or call (630) 946-9321</text>
  </g>
  <text x="80" y="40" class="anno">Shared &lt;CTA&gt; · copyNamespace="resources.cta" · destination="/request-quote/" · tokens={}</text>
  <text x="80" y="60" class="anno">Amber × lg · THE one amber on the page · py-24 desktop · centered</text>
</svg>
```

**Specs.** Identical to 1.06 §9 / 1.11 §3.7 / 1.13 §4.9 modulo copy. `tokens` prop is empty.

---

## 4. Resource detail template — section-by-section spec

Route: `/resources/[slug]/` and `/es/resources/[slug]/`. One template, all entries. Six sections (FAQ + cross-link are per-entry-optional). Surface alternation per D14.

### 4.1 Hero — surface `--color-bg-cream`

Eyebrow (category badge) → H1 → dek → `ContentMeta` strip (byline · reading time only — NO date per D8). **No featured photo** on Resource detail. **No entrance animation.**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 540" width="100%" role="img" aria-label="Resource detail hero — desktop">
  <style>
    .crumb { font-family: Manrope; font-size: 14px; fill: #6B6B6B; }
    .crumbA { fill: #2F5D27; text-decoration: underline; }
    .badge { font-family: Manrope; font-weight: 600; font-size: 11px; letter-spacing: 0.08em; fill: #2F5D27; }
    .h1 { font-family: Onest; font-weight: 700; font-size: 56px; fill: #1A1A1A; }
    .dek { font-family: Manrope; font-size: 20px; fill: #4A4A4A; }
    .meta { font-family: Manrope; font-size: 14px; fill: #6B6B6B; }
    .anno { font-family: ui-monospace, monospace; font-size: 11px; fill: #C2185B; }
  </style>
  <rect width="1440" height="540" fill="#FAF7F1"/>
  <g transform="translate(80,80)">
    <text class="crumb crumbA">Home</text>
    <text x="44" class="crumb">›</text>
    <text x="60" class="crumb crumbA">Resources</text>
    <text x="148" class="crumb">›</text>
    <text x="164" class="crumb">Patio Materials Guide</text>
  </g>
  <rect x="80" y="124" width="100" height="26" rx="13" fill="#FFFFFF"/>
  <text x="130" y="142" class="badge" text-anchor="middle">HARDSCAPE</text>
  <text x="80" y="220" class="h1">Patio Materials Guide:</text>
  <text x="80" y="280" class="h1">Concrete vs. Pavers vs. Stone.</text>
  <text x="80" y="332" class="dek">A side-by-side decision matrix for DuPage homeowners weighing concrete pours,</text>
  <text x="80" y="358" class="dek">interlocking pavers, and natural-stone slabs — with cost, lifespans, and care notes.</text>
  <g transform="translate(80,408)">
    <text class="meta">By Sunset Services Team</text>
    <text x="180" class="meta">·</text>
    <text x="196" class="meta">12 min read</text>
  </g>
  <text x="900" y="80" class="anno">Surface --color-bg-cream · py-20 · NO photo</text>
  <text x="900" y="100" class="anno">Breadcrumb (1.05) · same-source w/ BreadcrumbList JSON-LD</text>
  <text x="900" y="120" class="anno">Category badge: --text-eyebrow · --color-bg surface</text>
  <text x="900" y="140" class="anno">H1: --text-h1-d (56px on detail) · text-wrap: balance</text>
  <text x="900" y="160" class="anno">dek: --text-body-lg · max-width 880</text>
  <text x="900" y="180" class="anno">ContentMeta: --text-body-sm · --color-text-muted · NO DATE on Resources (D8)</text>
  <text x="900" y="200" class="anno">No entrance animation · LCP = H1 text node</text>
</svg>
```

**Mobile.** H1 → `--text-h1-m` (32px). ContentMeta stacks vertically below 480. Breadcrumb trims middle items with ellipsis at the truncation rule from 1.09.

**Specs.**
| Element | Spec |
|---|---|
| Surface | `--color-bg-cream` |
| Container | `--container-default` for breadcrumb + meta; H1 + dek constrained to max-width 880 |
| Breadcrumb | `Home › Resources › {title}` — same-source with `BreadcrumbList` JSON-LD per 1.09 |
| Category badge | `<Badge>` primitive, `bg --color-bg`, eyebrow text style, `--color-sunset-green-700` |
| H1 | `--text-h1-d` (56px) / `--text-h1-m` (32px), `text-wrap: balance` |
| Dek | `--text-body-lg`, `--color-text-secondary`, ≤ 32 words EN |
| `ContentMeta` | byline · reading-time. `--text-body-sm`, `--color-text-muted`. **No date.** Stacks vertically below 480. |
| Motion | None. |

### 4.2 Body — surface `--color-bg` — `ProseLayout` + sticky right-rail TOC at `xl`

**This is the most reused asset in the handover** — every blog post and every resource renders through it. Spec it once, reference it from §6.2.

#### Layout structure

- **Below `xl` (1440):** single-column centered prose, max-width `--container-prose` (720). TOC collapses to a `<details>` accordion at the top of the body, closed by default. Summary: "Table of contents" / "Tabla de contenidos".
- **At `xl` and above:** prose stays at max-width 720, **shifted to align with the page's left container gutter (80px)**. TOC docks in a sticky right column at `top: var(--header-height) + var(--spacing-8)`, max-width 240, ends `--spacing-12` before the footer. The right column is a `<aside>` landmark.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1100" width="100%" role="img" aria-label="ProseLayout — desktop xl">
  <style>
    .h2 { font-family: Onest; font-weight: 700; font-size: 32px; fill: #1A1A1A; }
    .h3 { font-family: Onest; font-weight: 600; font-size: 22px; fill: #1A1A1A; }
    .body { font-family: Manrope; font-size: 18px; fill: #1A1A1A; }
    .lnk { font-family: Manrope; font-size: 14px; fill: #2F5D27; }
    .lnkA { font-family: Manrope; font-weight: 600; font-size: 14px; fill: #2F5D27; }
    .toc-h { font-family: Manrope; font-weight: 600; font-size: 12px; letter-spacing: 0.12em; fill: #6B6B6B; }
    .anno { font-family: ui-monospace, monospace; font-size: 11px; fill: #C2185B; }
    .ruler { stroke: #C2185B; stroke-dasharray: 2 3; stroke-width: 1; }
  </style>
  <rect width="1600" height="1100" fill="#FFFFFF"/>
  <g transform="translate(120,80)">
    <text y="0" class="h2">Concrete: the predictable workhorse</text>
    <text y="56" class="body">A 4-inch reinforced slab is the cheapest way to roof a yard with</text>
    <text y="80" class="body">stone-like surface. It cures in 7 days, walks in 1, and lasts 25–30</text>
    <text y="104" class="body">years if installed over a 6-inch compacted base.</text>
    <text y="160" class="h3">When to choose it</text>
    <text y="200" class="body">Choose concrete when budget is tight, the patio shape is rectangular,</text>
    <text y="224" class="body">and the property won't see freeze-thaw cycles deep enough to crack it.</text>
    <text y="304" class="h2">Pavers: the maintenance-friendly upgrade</text>
    <text y="360" class="body">Interlocking concrete pavers cost 1.6–2.0× concrete per square foot</text>
    <text y="384" class="body">but each unit can be lifted and reset if a tree root displaces it.</text>
    <text y="464" class="h2">Natural stone: the heirloom surface</text>
    <text y="520" class="body">Bluestone, limestone, and travertine carry premium pricing but read</text>
    <text y="544" class="body">as architecture, not landscaping.</text>
  </g>
  <g transform="translate(900,80)">
    <text class="toc-h">ON THIS PAGE</text>
    <line x1="0" y1="20" x2="240" y2="20" stroke="#E5E0D5"/>
    <text y="50" class="lnkA">Concrete: the predictable workhorse</text>
    <line x1="-12" y1="36" x2="-12" y2="62" stroke="#4D8A3F" stroke-width="3"/>
    <text y="80" class="lnk">Pavers: the maintenance-friendly upgrade</text>
    <text y="110" class="lnk">Natural stone: the heirloom surface</text>
    <text y="140" class="lnk">Costs side-by-side</text>
    <text y="170" class="lnk">FAQ</text>
  </g>
  <text x="120" y="1040" class="anno">Prose column: max-width 720 (--container-prose) · gap from page gutter --spacing-20 (80px)</text>
  <text x="120" y="1060" class="anno">TOC column: max-width 240 · sticky top: header-height + --spacing-8 · only renders at xl (1440+)</text>
  <text x="120" y="1080" class="anno">TOC active item: 3px left border --color-sunset-green-500 · weight 600 · IntersectionObserver-driven</text>
  <line x1="120" y1="40" x2="120" y2="980" class="ruler"/>
  <line x1="840" y1="40" x2="840" y2="980" class="ruler"/>
  <line x1="900" y1="40" x2="900" y2="980" class="ruler"/>
  <line x1="1140" y1="40" x2="1140" y2="980" class="ruler"/>
</svg>
```

**Below xl, TOC collapses to native `<details>` summary at the top of the body.** Summary pill: cream surface, border `--color-border`, padding `--spacing-4 --spacing-5`, radius `--radius-md`, full-width within prose column. Closed by default. Inside: vertical list of TOC links with `--spacing-2` gap.

#### Prose stylesheet — single source of truth

The `ProseLayout` ships a scoped `.prose` stylesheet (recommended path: a new `src/styles/prose.css` partial loaded by the route group, NOT in `globals.css` — see §16). Every prose element styled below.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 2280" width="100%" role="img" aria-label="Prose stylesheet poster">
  <style>
    .h2 { font-family: Onest; font-weight: 700; font-size: 32px; fill: #1A1A1A; }
    .h3 { font-family: Onest; font-weight: 600; font-size: 22px; fill: #1A1A1A; }
    .h4 { font-family: Onest; font-weight: 600; font-size: 18px; fill: #1A1A1A; }
    .body { font-family: Manrope; font-size: 18px; fill: #1A1A1A; }
    .body-lg { font-family: Manrope; font-size: 22px; fill: #1A1A1A; }
    .small { font-family: Manrope; font-size: 14px; fill: #6B6B6B; }
    .quote { font-family: Onest; font-weight: 500; font-style: italic; font-size: 24px; fill: #1A1A1A; }
    .lnk { font-family: Manrope; font-size: 18px; fill: #2F5D27; text-decoration: underline; }
    .code { font-family: ui-monospace, monospace; font-size: 16px; fill: #1A1A1A; }
    .anno { font-family: ui-monospace, monospace; font-size: 11px; fill: #C2185B; }
    .label { font-family: ui-monospace, monospace; font-size: 12px; font-weight: 600; fill: #C2185B; }
  </style>
  <rect width="1440" height="2280" fill="#FAF7F1"/>
  <text x="80" y="60" class="anno">Prose stylesheet — scoped under .prose · single source of truth for Resource detail + Blog post bodies</text>
  <text x="80" y="140" class="label">H2 — section heading inside body</text>
  <text x="80" y="200" class="h2">Concrete: the predictable workhorse</text>
  <text x="80" y="234" class="anno">--text-h2-d 32px / --text-h2-m 24px · weight 700 · margin-top --spacing-12 · margin-bottom --spacing-4 · text-wrap: balance · &lt;h2 id="…"&gt; auto-built by remark · feeds TOC</text>
  <text x="80" y="296" class="label">H3 — sub-section</text>
  <text x="80" y="346" class="h3">When to choose it</text>
  <text x="80" y="376" class="anno">--text-h3 22px/20px · weight 600 · margin-top --spacing-8 · margin-bottom --spacing-3</text>
  <text x="80" y="430" class="label">H4 — rare, callout sub-head</text>
  <text x="80" y="476" class="h4">Edge case: clay-heavy soil</text>
  <text x="80" y="500" class="anno">--text-h4 18px/16px · weight 600 · margin-top --spacing-6 · margin-bottom --spacing-2</text>
  <text x="80" y="554" class="label">body-lg — first paragraph after H1 (lede)</text>
  <text x="80" y="600" class="body-lg">A 4-inch slab cures in 7 days and lasts 25–30 years if</text>
  <text x="80" y="630" class="body-lg">the base is right. The base is rarely right.</text>
  <text x="80" y="658" class="anno">--text-body-lg 22px/20px · max-width 720 · margin-bottom --spacing-6 · ONLY first &lt;p&gt; after H1 carries .prose__lede</text>
  <text x="80" y="710" class="label">body — default paragraph</text>
  <text x="80" y="756" class="body">Most homeowners settle on either a 6-inch reinforced concrete slab or interlocking</text>
  <text x="80" y="784" class="body">pavers over a compacted base. Both can carry a 30-year lifespan. The difference is</text>
  <text x="80" y="812" class="body">how each one fails — and how cheaply you can put it right.</text>
  <text x="80" y="840" class="anno">--text-body 18px/16px · line-height 1.6 · max-width 720 · margin-bottom --spacing-5</text>
  <text x="80" y="892" class="label">inline link inside body</text>
  <text x="80" y="936" class="body">See our <tspan class="lnk">patios &amp; walkways service page</tspan> for our installation process.</text>
  <text x="80" y="966" class="anno">--color-sunset-green-700 · underline always · thickness 1px · offset 3px · hover --color-sunset-green-500 · focus-visible: locked ring (1.03 §6.2)</text>
  <text x="80" y="1018" class="label">inline code (rare on this content)</text>
  <text x="80" y="1062" class="body">Common base mix: <tspan class="code">1:2:3 cement-sand-gravel</tspan> over compacted CA-6.</text>
  <text x="80" y="1092" class="anno">ui-monospace 0.92em · padding 2px 6px · bg --color-bg-stone · radius --radius-sm</text>
  <text x="80" y="1146" class="label">ordered list</text>
  <text x="100" y="1192" class="body">1.  Excavate to 10 inches.</text>
  <text x="100" y="1220" class="body">2.  Lay and compact 6 inches of CA-6 base.</text>
  <text x="100" y="1248" class="body">3.  Pour, cure, and cut control joints at 8-foot grids.</text>
  <text x="80" y="1278" class="anno">&lt;ol&gt; · margin-block --spacing-5 · padding-inline-start --spacing-6 · &lt;li&gt; mb --spacing-2 · marker --color-sunset-green-700</text>
  <text x="80" y="1330" class="label">unordered list</text>
  <text x="100" y="1376" class="body">•  Crack-prone in freeze-thaw climates.</text>
  <text x="100" y="1404" class="body">•  Repair = jackhammer the section, repour, color drift.</text>
  <text x="100" y="1432" class="body">•  Two-week minimum from quote to walkable.</text>
  <text x="80" y="1462" class="anno">&lt;ul&gt; same metrics as &lt;ol&gt; · ::marker --color-sunset-green-500</text>
  <text x="80" y="1514" class="label">blockquote</text>
  <g transform="translate(80,1542)">
    <line x1="0" y1="6" x2="0" y2="78" stroke="#E8A33D" stroke-width="3"/>
    <text x="20" y="32" class="quote">"Pour over a poor base and the slab will tell you about it</text>
    <text x="20" y="64" class="quote">in three winters." — Erick Sotomayor</text>
  </g>
  <text x="80" y="1654" class="anno">3px left rule --color-sunset-amber-500 · italic · padding-inline-start --spacing-5 · max-width 640 · &lt;cite&gt; en-dash + name as --color-text-secondary</text>
  <text x="80" y="1706" class="label">callouts (3 variants — info, warning, tip)</text>
  <g transform="translate(80,1734)">
    <rect width="600" height="72" rx="8" fill="#F1F5EE" stroke="#8FB67A"/>
    <text x="20" y="32" class="body" font-weight="600">ⓘ  Info</text>
    <text x="20" y="58" class="body">Most DuPage municipalities require a permit only for surfaces ≥ 200 sq ft.</text>
  </g>
  <g transform="translate(80,1834)">
    <rect width="600" height="72" rx="8" fill="#FDF7E8" stroke="#F2C66A"/>
    <text x="20" y="32" class="body" font-weight="600">⚠  Warning</text>
    <text x="20" y="58" class="body">Skipping the base layer is the #1 reason concrete fails inside 5 years.</text>
  </g>
  <g transform="translate(80,1934)">
    <rect width="600" height="72" rx="8" fill="#F2EDE3" stroke="#C9C0AE"/>
    <text x="20" y="32" class="body" font-weight="600">★  Tip</text>
    <text x="20" y="58" class="body">Ask for the base depth in writing. "6 inches CA-6 compacted" is the floor.</text>
  </g>
  <text x="80" y="2034" class="anno">.prose__callout--info bg --color-sunset-green-50 / border --color-sunset-green-300 · --warning bg amber-50 / border amber-300 · --tip bg --color-bg-stone / border --color-border-strong · padding --spacing-5 · radius --radius-md · margin-block --spacing-6</text>
  <text x="80" y="2086" class="label">table</text>
  <g transform="translate(80,2106)">
    <rect width="800" height="40" fill="#FAF7F1"/>
    <line y1="40" x2="800" y2="40" stroke="#E5E0D5"/>
    <text x="20" y="26" class="body" font-weight="600">Material</text>
    <text x="280" y="26" class="body" font-weight="600">$/sq ft</text>
    <text x="500" y="26" class="body" font-weight="600">Lifespan</text>
    <text x="20" y="66" class="body">Concrete slab</text><text x="280" y="66" class="body">12–18</text><text x="500" y="66" class="body">25–30 yr</text>
    <line y1="80" x2="800" y2="80" stroke="#E5E0D5"/>
    <text x="20" y="106" class="body">Interlocking pavers</text><text x="280" y="106" class="body">22–32</text><text x="500" y="106" class="body">30–40 yr</text>
    <line y1="120" x2="800" y2="120" stroke="#E5E0D5"/>
    <text x="20" y="146" class="body">Natural stone</text><text x="280" y="146" class="body">36–60</text><text x="500" y="146" class="body">50+ yr</text>
  </g>
  <text x="80" y="2274" class="anno">.prose table · width 100% · max-width 800 · &lt;thead&gt; bg --color-bg-cream · &lt;th&gt; text-align: left · padding --spacing-3 --spacing-5 · scrollable on mobile via overflow-x</text>
</svg>
```

**Inter-element spacing rules (locked).**

| From → to | Margin |
|---|---|
| H1 → first `<p>` (lede) | `--spacing-6` |
| body `<p>` → next body `<p>` | `--spacing-5` (margin-bottom) |
| body `<p>` → H2 | `--spacing-12` |
| H2 → next `<p>` or H3 | `--spacing-4` |
| H3 → next `<p>` | `--spacing-3` |
| H4 → next `<p>` | `--spacing-2` |
| any → blockquote | `--spacing-6` |
| any → callout | `--spacing-6` |
| any → table | `--spacing-6` |
| any → figure | `--spacing-8` |
| any → `<hr>` | `--spacing-10` |
| inline `<ServiceCard>` mid-body | `--spacing-12` top + bottom |

**Type-scale tokens used (no new tokens).**

| Element | Token (desktop / mobile) |
|---|---|
| H1 in hero | `--text-h1-d` 56px / `--text-h1-m` 32px |
| H2 in body | `--text-h2-d` 32px / `--text-h2-m` 24px |
| H3 in body | `--text-h3` 22px / 20px |
| H4 in body | `--text-h4` 18px / 16px |
| body | `--text-body` 18px / 16px |
| body-lg (lede) | `--text-body-lg` 22px / 20px |
| body-sm (caption / meta) | `--text-body-sm` 14px / 13px |
| eyebrow | `--text-eyebrow` 13px / 12px |

**Figure with caption.** `.prose figure`: margin-block `--spacing-8`, max-width 720, `<img>` with explicit w/h, radius `--radius-md`. `figcaption`: `--text-body-sm` italic `--color-text-muted`, margin-top `--spacing-3`. Source: `[Cowork to source from Drive in Phase 2.04]`.

**Horizontal divider.** `<hr>`: 1px solid `--color-border-strong`, margin-block `--spacing-10`, max-width 720.

### 4.3 FAQ section — surface `--color-bg-cream` — optional

Reuses `<FaqAccordion>` from 1.08 §3.7 with the no-wrapper-per-item rule. 4–7 Q&As. Multi-open mode (every answer in SSR HTML for `FAQPage` schema validity per 1.08). Section-level `<AnimateIn>` on the header only; items render as native `<details>` directly inside the section.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 600" width="100%" role="img" aria-label="Resource detail FAQ — desktop">
  <style>
    .eb { font-family: Manrope; font-weight: 600; font-size: 13px; letter-spacing: 0.12em; fill: #2F5D27; }
    .h2 { font-family: Onest; font-weight: 700; font-size: 36px; fill: #1A1A1A; }
    .q { font-family: Onest; font-weight: 600; font-size: 18px; fill: #1A1A1A; }
    .anno { font-family: ui-monospace, monospace; font-size: 11px; fill: #C2185B; }
  </style>
  <rect width="1440" height="600" fill="#FAF7F1"/>
  <text x="80" y="80" class="eb">FAQ</text>
  <text x="80" y="140" class="h2">Common questions about patio materials</text>
  <g transform="translate(80,200)">
    <line x1="0" y1="0" x2="1280" y2="0" stroke="#E5E0D5"/>
    <text x="0" y="40" class="q">Do all three materials need a permit in DuPage?</text>
    <text x="1264" y="40" class="q" text-anchor="end">+</text>
    <line x1="0" y1="76" x2="1280" y2="76" stroke="#E5E0D5"/>
    <text x="0" y="116" class="q">How long until I can walk / drive on each?</text>
    <text x="1264" y="116" class="q" text-anchor="end">+</text>
    <line x1="0" y1="152" x2="1280" y2="152" stroke="#E5E0D5"/>
    <text x="0" y="192" class="q">Which one survives freeze-thaw best?</text>
    <text x="1264" y="192" class="q" text-anchor="end">+</text>
    <line x1="0" y1="228" x2="1280" y2="228" stroke="#E5E0D5"/>
    <text x="0" y="268" class="q">Can I mix materials on one project?</text>
    <text x="1264" y="268" class="q" text-anchor="end">+</text>
    <line x1="0" y1="304" x2="1280" y2="304" stroke="#E5E0D5"/>
  </g>
  <text x="80" y="560" class="anno">FaqAccordion (1.08) · 4 native &lt;details&gt; · same-source feeds FAQPage JSON-LD · NO per-item motion wrapper · multi-open mode</text>
</svg>
```

**Specs.** Identical to 1.08 §3.7 / 1.13 §4.8 modulo copy. Section header section-level `<AnimateIn variant="fade-up">`.

### 4.4 Inline service cross-pollination — optional, mid-body

Sits between two prose H2s, NOT wrapped in its own `<section>`. Reuses 1.09's `<ServiceCard>`. Only renders if the entry's seed flags `inlineServiceCrossLink: { audience, serviceSlug }`.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 360" width="100%" role="img" aria-label="Inline service cross-link — desktop">
  <style>
    .h2 { font-family: Onest; font-weight: 700; font-size: 32px; fill: #1A1A1A; }
    .body { font-family: Manrope; font-size: 18px; fill: #1A1A1A; }
    .h4 { font-family: Onest; font-weight: 600; font-size: 18px; fill: #1A1A1A; }
    .small { font-family: Manrope; font-size: 14px; fill: #6B6B6B; }
    .lnk { font-family: Manrope; font-weight: 600; font-size: 16px; fill: #2F5D27; }
    .anno { font-family: ui-monospace, monospace; font-size: 11px; fill: #C2185B; }
  </style>
  <rect width="1440" height="360" fill="#FFFFFF"/>
  <text x="120" y="40" class="body">…and the result is a slab that walks well and ages predictably.</text>
  <g transform="translate(120,80)">
    <rect width="720" height="160" rx="12" fill="#FAF7F1" stroke="#E5E0D5"/>
    <text x="24" y="40" class="small">RELATED SERVICE</text>
    <text x="24" y="80" class="h4">Patios &amp; Walkways</text>
    <text x="24" y="108" class="body">Our installation process — from base prep to final cut — for residential hardscape.</text>
    <text x="24" y="140" class="lnk">See the service →</text>
  </g>
  <text x="120" y="280" class="h2">Pavers: the maintenance-friendly upgrade</text>
  <text x="120" y="340" class="anno">Inline ServiceCard (1.09) · max-width 720 (matches prose width) · margin-block --spacing-12 · NOT a &lt;section&gt; · cream pill on white prose surface</text>
</svg>
```

**Specs.**
| Element | Spec |
|---|---|
| Container | inline within prose, max-width matches prose (720) |
| Surface | `--color-bg-cream` pill on the white prose body |
| Eyebrow | `RELATED SERVICE` / `SERVICIO RELACIONADO`, `--text-eyebrow`, `--color-text-muted` |
| Heading | `--text-h4`, `--color-text-primary`, links to `/{locale}/{audience}/{serviceSlug}/` |
| Whole block is one `<a>` | one tabstop, focus-visible ring per 1.03 §6.2 |
| Schema | none — the canonical `Service` schema lives on the destination page |

### 4.5 Related resources — surface `--color-bg`

3 `ContentCard`s in a row. Selection: same category preferred; fallback rule (D11) — if `category` has < 3 siblings, top up with most-recently-updated other resources excluding self. Section header: "Related resources" / "Recursos relacionados".

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 620" width="100%" role="img" aria-label="Related resources strip — desktop">
  <style>
    .eb { font-family: Manrope; font-weight: 600; font-size: 13px; letter-spacing: 0.12em; fill: #2F5D27; }
    .h2 { font-family: Onest; font-weight: 700; font-size: 32px; fill: #1A1A1A; }
    .anno { font-family: ui-monospace, monospace; font-size: 11px; fill: #C2185B; }
    .ttl { font-family: Onest; font-weight: 700; font-size: 20px; fill: #1A1A1A; }
    .meta { font-family: Manrope; font-size: 12px; fill: #6B6B6B; }
    .badge { font-family: Manrope; font-weight: 600; font-size: 11px; letter-spacing: 0.08em; fill: #2F5D27; }
  </style>
  <rect width="1440" height="620" fill="#FFFFFF"/>
  <text x="80" y="80" class="eb">KEEP READING</text>
  <text x="80" y="140" class="h2">Related resources</text>
  <g transform="translate(80,180)">
    <g><rect width="416" height="380" rx="12" fill="#FAF7F1"/><rect width="416" height="200" rx="12" fill="#E5E0D5"/><rect x="20" y="20" width="124" height="22" rx="11" fill="#FFFFFF"/><text x="82" y="35" class="badge" text-anchor="middle">BUYING GUIDES</text><text x="20" y="252" class="ttl">How to Choose a</text><text x="20" y="278" class="ttl">Landscaper</text><text x="20" y="356" class="meta">9 min read</text></g>
    <g transform="translate(440,0)"><rect width="416" height="380" rx="12" fill="#FAF7F1"/><rect width="416" height="200" rx="12" fill="#E5E0D5"/><rect x="20" y="20" width="124" height="22" rx="11" fill="#FFFFFF"/><text x="82" y="35" class="badge" text-anchor="middle">LOCAL PERMITS</text><text x="20" y="252" class="ttl">Hardscape Permits</text><text x="20" y="278" class="ttl">in DuPage County</text><text x="20" y="356" class="meta">5 min read</text></g>
    <g transform="translate(880,0)"><rect width="416" height="380" rx="12" fill="#FAF7F1"/><rect width="416" height="200" rx="12" fill="#E5E0D5"/><rect x="20" y="20" width="100" height="22" rx="11" fill="#FFFFFF"/><text x="70" y="35" class="badge" text-anchor="middle">LAWN CARE</text><text x="20" y="252" class="ttl">Lawn Care Glossary</text><text x="20" y="356" class="meta">7 min read</text></g>
  </g>
  <text x="80" y="600" class="anno">3 ContentCards on cream pill (variant on white surface) · same-category preferred · fallback most-recently-updated · self never appears</text>
</svg>
```

**Specs.** ContentCard variant: surface `--color-bg-cream` (lift on white). Same prop set as index card. Section-level `<AnimateIn>`. No per-card motion.

### 4.6 CTA section — surface `--color-bg-cream` — the page's one amber

Shared `<CTA>` with `tokens={ category: entry.category }`. EN H2 template: `"Talking about {category}? Let's measure your project."` (interpolated). ES: `"¿Hablando de {category}? Midamos tu proyecto."` Destination `/{locale}/request-quote/`. Identical visual spec to §3.4 modulo `tokens`-driven copy. Single amber CTA.

---

## 5. Blog index — section-by-section spec

Route: `/blog/` and `/es/blog/`. Three sections (no help-deciding band — featured post does the engagement work per D14). Surface alternation per D14.

### 5.1 Hero — surface `--color-bg`

Same shape as §3.1 modulo eyebrow text and count line. EN: `"BLOG"` / count `"5 posts · April 2026"`. ES: `"BLOG"` / count `"5 publicaciones · abril de 2026"`. **No photo. No entrance animation.**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 460" width="100%" role="img" aria-label="Blog index hero — desktop">
  <style>
    .eb { font-family: Manrope; font-weight: 600; font-size: 13px; letter-spacing: 0.12em; fill: #2F5D27; }
    .h1 { font-family: Onest; font-weight: 700; font-size: 64px; fill: #1A1A1A; }
    .dek { font-family: Manrope; font-size: 20px; fill: #4A4A4A; }
    .meta { font-family: Manrope; font-size: 14px; fill: #6B6B6B; }
    .anno { font-family: ui-monospace, monospace; font-size: 11px; fill: #C2185B; }
  </style>
  <rect width="1440" height="460" fill="#FFFFFF"/>
  <text x="80" y="160" class="eb">BLOG</text>
  <text x="80" y="240" class="h1">Notes from the field,</text>
  <text x="80" y="316" class="h1">season after season.</text>
  <text x="80" y="372" class="dek">Cost guides, calendars, and the questions homeowners ask us most.</text>
  <text x="80" y="416" class="meta">5 posts · April 2026</text>
  <text x="980" y="160" class="anno">Mirrors §3.1 hero · count line uses month + year</text>
</svg>
```

### 5.2 Featured post + filter chips + grid — surface `--color-bg-cream`

Featured post = newest post in 2-col span at the top of the grid (D3); remaining posts in 3-col `ContentCard` grid below. Filter chips above (D4). One section-level `<AnimateIn>` wraps the grid; the featured card gets its own `<AnimateIn>` so its longer load-in doesn't drag the grid timing.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 1280" width="100%" role="img" aria-label="Blog featured + grid — desktop">
  <style>
    .chip { font-family: Manrope; font-weight: 600; font-size: 14px; }
    .chipa { fill: #FAF7F1; }
    .chipi { fill: #1A1A1A; }
    .badge { font-family: Manrope; font-weight: 600; font-size: 11px; letter-spacing: 0.08em; fill: #2F5D27; }
    .ttlf { font-family: Onest; font-weight: 700; font-size: 36px; fill: #1A1A1A; }
    .ttl { font-family: Onest; font-weight: 700; font-size: 22px; fill: #1A1A1A; }
    .dek { font-family: Manrope; font-size: 18px; fill: #4A4A4A; }
    .deksm { font-family: Manrope; font-size: 14px; fill: #4A4A4A; }
    .meta { font-family: Manrope; font-size: 13px; fill: #6B6B6B; }
    .anno { font-family: ui-monospace, monospace; font-size: 11px; fill: #C2185B; }
  </style>
  <rect width="1440" height="1280" fill="#FAF7F1"/>
  <g transform="translate(80,80)">
    <rect width="80" height="40" rx="20" fill="#2F5D27"/>
    <text x="40" y="26" class="chip chipa" text-anchor="middle">All</text>
    <g transform="translate(96,0)"><rect width="100" height="40" rx="20" fill="#FFFFFF" stroke="#C9C0AE"/><text x="50" y="26" class="chip chipi" text-anchor="middle">How-To</text></g>
    <g transform="translate(212,0)"><rect width="124" height="40" rx="20" fill="#FFFFFF" stroke="#C9C0AE"/><text x="62" y="26" class="chip chipi" text-anchor="middle">Cost Guide</text></g>
    <g transform="translate(352,0)"><rect width="108" height="40" rx="20" fill="#FFFFFF" stroke="#C9C0AE"/><text x="54" y="26" class="chip chipi" text-anchor="middle">Seasonal</text></g>
    <g transform="translate(476,0)"><rect width="148" height="40" rx="20" fill="#FFFFFF" stroke="#C9C0AE"/><text x="74" y="26" class="chip chipi" text-anchor="middle">Industry News</text></g>
    <g transform="translate(640,0)"><rect width="108" height="40" rx="20" fill="#FFFFFF" stroke="#C9C0AE"/><text x="54" y="26" class="chip chipi" text-anchor="middle">Audience</text></g>
  </g>
  <g transform="translate(80,180)">
    <rect width="1280" height="440" rx="12" fill="#FFFFFF"/>
    <rect width="640" height="440" rx="12" fill="#E5E0D5"/>
    <text x="320" y="220" class="anno" text-anchor="middle" fill="#6B6B6B">[featured photo 16:10 — Cowork — LCP, priority + fetchPriority="high"]</text>
    <g transform="translate(680,40)">
      <rect width="124" height="22" rx="11" fill="#FAF7F1"/>
      <text x="62" y="36" class="badge" text-anchor="middle">COST GUIDE</text>
      <text x="0" y="100" class="ttlf">How Much Does a Patio</text>
      <text x="0" y="148" class="ttlf">Cost in DuPage County</text>
      <text x="0" y="196" class="ttlf">in 2026?</text>
      <text x="0" y="244" class="dek">Real numbers from real bids — concrete, paver,</text>
      <text x="0" y="268" class="dek">and stone — across the 6 cities we work in.</text>
      <text x="0" y="316" class="meta">By Erick Sotomayor · April 12, 2026 · 11 min read</text>
      <g transform="translate(0,344)">
        <rect width="180" height="44" rx="8" fill="#FFFFFF" stroke="#2F5D27" stroke-width="1.5"/>
        <text x="90" y="29" class="chip" text-anchor="middle" fill="#2F5D27">Read the post →</text>
      </g>
    </g>
  </g>
  <g transform="translate(80,664)">
    <g><rect width="416" height="420" rx="12" fill="#FFFFFF"/><rect width="416" height="220" rx="12" fill="#E5E0D5"/><rect x="20" y="20" width="100" height="22" rx="11" fill="#FAF7F1"/><text x="70" y="35" class="badge" text-anchor="middle">SEASONAL</text><text x="20" y="270" class="ttl">Spring Lawn Care</text><text x="20" y="298" class="ttl">Calendar for Aurora, IL</text><text x="20" y="356" class="deksm">Month-by-month checklist for first-year</text><text x="20" y="374" class="deksm">homeowners on Aurora's clay soil.</text><text x="20" y="400" class="meta">Sunset Services · Apr 4 · 8 min</text></g>
    <g transform="translate(440,0)"><rect width="416" height="420" rx="12" fill="#FFFFFF"/><rect width="416" height="220" rx="12" fill="#E5E0D5"/><rect x="20" y="20" width="92" height="22" rx="11" fill="#FAF7F1"/><text x="66" y="35" class="badge" text-anchor="middle">HOW-TO</text><text x="20" y="270" class="ttl">Why Unilock?</text><text x="20" y="298" class="ttl">A Look at Premium Pavers</text><text x="20" y="400" class="meta">Marcin Nowak · Mar 22 · 7 min</text></g>
    <g transform="translate(880,0)"><rect width="416" height="420" rx="12" fill="#FFFFFF"/><rect width="416" height="220" rx="12" fill="#E5E0D5"/><rect x="20" y="20" width="116" height="22" rx="11" fill="#FAF7F1"/><text x="78" y="35" class="badge" text-anchor="middle">AUDIENCE</text><text x="20" y="270" class="ttl">Snow Removal for</text><text x="20" y="298" class="ttl">Commercial Properties</text><text x="20" y="400" class="meta">Erick Sotomayor · Mar 8 · 9 min</text></g>
  </g>
  <text x="80" y="60" class="anno">Surface --color-bg-cream · py-20 · single-select chips · URL state ?category={slug}</text>
  <text x="80" y="160" class="anno">Featured: 2-col span · NOT .card--featured · plain card--photo at wider aspect · LCP image priority+fetchPriority="high"</text>
  <text x="80" y="644" class="anno">3-col grid (gap 24px) · ContentCard primitive · post 2 (the featured) excluded from grid · cards 3–5 lazy</text>
  <text x="80" y="1240" class="anno">Section &lt;AnimateIn&gt; on grid; featured card has its OWN &lt;AnimateIn&gt; so timings don't compete</text>
</svg>
```

**Specs.**
| Element | Spec |
|---|---|
| Featured layout | 2-col 640+gap+rest at `lg`+. Image left (640×400 → 16:10), copy right. Stacks to 1-col below `lg`. |
| Featured card | Reuses `card--photo` (locked); **NOT** `.card--featured`. Wider aspect, larger H ratio. Per-instance `<AnimateIn>` separate from the grid's. |
| Grid | Same 3-col `ContentCard` grid as Resources, gap `--spacing-6`. Excludes the featured post (`posts.slice(1)`). |
| ContentCard variant | Blog: badge + title + dek (≤ 100 chars) + `byline · {date} · {readingMinutes} min`. |
| Filter chips | Identical to §3.2 modulo labels. |
| Lazy | Featured card image: `priority + fetchPriority="high"`. All other card images: `loading="lazy"`. |

### 5.3 CTA section — surface `--color-bg` — the page's one amber

Same as §3.4 modulo surface (`--color-bg` here to maintain alternation per D14) and copy. Shared `<CTA>` with `tokens={}`. EN copy variant: `"Done reading? Let's walk your property."` Destination `/{locale}/request-quote/`.

---

## 6. Blog post template — section-by-section spec

Route: `/blog/[slug]/` and `/es/blog/[slug]/`. **The long pole.** Seven sections (FAQ + cross-link + location strip + related are per-entry-optional, but at least one of FAQ/related must be present — the page should never close on prose → CTA alone). Surface alternation per D14.

### 6.1 Hero — surface `--color-bg`

Eyebrow (category badge) → H1 → dek → `ContentMeta` strip (byline · publish date · reading time · category) → **featured image below the meta** (option B). Image is the LCP element.

**Why option B (not A: full-bleed overlay; not C: image right of copy):** Phase 1.07 P=86 mobile lesson — hero image overlays compress mobile LCP and break Lighthouse. Option B keeps the H1 a text-LCP candidate but allows the image to take over LCP once it loads (it's the largest element). Both options are healthy; B avoids the overlay-readability tax and is consistent with NYT / FT post patterns the audience knows.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 880" width="100%" role="img" aria-label="Blog post hero — desktop">
  <style>
    .crumb { font-family: Manrope; font-size: 14px; fill: #6B6B6B; }
    .crumbA { fill: #2F5D27; text-decoration: underline; }
    .badge { font-family: Manrope; font-weight: 600; font-size: 11px; letter-spacing: 0.08em; fill: #2F5D27; }
    .h1 { font-family: Onest; font-weight: 700; font-size: 56px; fill: #1A1A1A; }
    .dek { font-family: Manrope; font-size: 22px; fill: #4A4A4A; }
    .meta { font-family: Manrope; font-size: 14px; fill: #6B6B6B; }
    .anno { font-family: ui-monospace, monospace; font-size: 11px; fill: #C2185B; }
  </style>
  <rect width="1440" height="880" fill="#FFFFFF"/>
  <g transform="translate(80,60)"><text class="crumb crumbA">Home</text><text x="44" class="crumb">›</text><text x="60" class="crumb crumbA">Blog</text><text x="100" class="crumb">›</text><text x="116" class="crumb">How Much Does a Patio Cost in DuPage County in 2026?</text></g>
  <rect x="80" y="100" width="124" height="26" rx="13" fill="#FAF7F1"/>
  <text x="142" y="118" class="badge" text-anchor="middle">COST GUIDE</text>
  <text x="80" y="200" class="h1">How Much Does a Patio Cost</text>
  <text x="80" y="260" class="h1">in DuPage County in 2026?</text>
  <text x="80" y="312" class="dek">Real numbers from real bids — concrete, paver, and natural-stone</text>
  <text x="80" y="342" class="dek">— across the 6 cities we work in. Updated for the 2026 season.</text>
  <g transform="translate(80,388)">
    <text class="meta">By Erick Sotomayor</text>
    <text x="180" class="meta">·</text>
    <text x="196" class="meta">April 12, 2026</text>
    <text x="320" class="meta">·</text>
    <text x="336" class="meta">11 min read</text>
    <text x="448" class="meta">·</text>
    <text x="464" class="meta">Cost Guide</text>
  </g>
  <g transform="translate(80,440)">
    <rect width="1280" height="400" rx="12" fill="#E5E0D5"/>
    <text x="640" y="208" class="anno" text-anchor="middle" fill="#6B6B6B">[featured image 16:9 — Cowork — LCP — priority + fetchPriority="high" + blur placeholder + AVIF/WebP — ≤350KB]</text>
  </g>
  <text x="900" y="60" class="anno">Surface --color-bg · py-12 (smaller pad — image extends band)</text>
  <text x="900" y="80" class="anno">Option B: image BELOW meta · full-width within container · 16:9</text>
  <text x="900" y="100" class="anno">Image is LCP · NO overlay · explicit width/height · no entrance animation</text>
</svg>
```

**Mobile.** H1 → 30px. Featured image becomes 4:3 crop (`featuredImage.srcMobile` if present, else same). Still LCP. **Never overlay text on photo** (1.07 P=86).

**Specs.**
| Element | Spec |
|---|---|
| Surface | `--color-bg`. Hero band extends through the prose body — see D14 note. |
| Container | `--container-default` for breadcrumb + meta; H1 + dek constrained max-width 880; featured image full-width within container. |
| Breadcrumb | `Home › Blog › {title}` |
| Category badge | Same as Resource detail. |
| H1 | `--text-h1-d` 56px / `--text-h1-m` 30px. `text-wrap: balance`. ≤ 14 words EN. |
| Dek | `--text-body-lg` (22px), `--color-text-secondary`, max-width 880, ≤ 32 words. |
| `ContentMeta` | byline · publish date · reading time · category. Stacks vertically below 480. |
| Featured image | 16:9 desktop / 4:3 mobile. **`priority + fetchPriority="high" + blur placeholder + AVIF/WebP + ≤350KB`**. Explicit width/height. Radius `--radius-md`. |
| Image alt | from seed `featuredImage.alt[locale]`. ≤ 125 chars. Describes what's in the photo, not the post topic. |
| Motion | None. |

### 6.2 Body — surface `--color-bg` — `ProseLayout`

**Same `ProseLayout` from §4.2.** Same prose styles. Same TOC contract. Same inter-element spacing. Do not re-spec.

### 6.3 FAQ section — surface `--color-bg-cream` — optional

Same as §4.3 modulo copy. Section header: `"Common questions about {topic}"` interpolating `entry.title` token. Seed posts that flag FAQ: #1 (cost), #4 (commercial PMs), #5 (sprinkler — 7-Q FAQ).

### 6.4 Inline service cross-pollination — optional, mid-body

Same as §4.4. Seed posts: #1 → patios-walkways, #2 → lawn-care, #3 → patios-walkways, #4 → snow-and-ice, #5 → sprinkler-systems.

### 6.5 Inline location strip — optional, near bottom of body

Reuses 1.13's `ServiceAreaStrip` with `excludeSlug={post.citySlug}`. Renders inside the prose container (max-width 720, NOT full-width — the strip pill scales down). Renders a 5-chip strip when the post is location-tagged.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 280" width="100%" role="img" aria-label="Inline location strip — desktop">
  <style>
    .h4 { font-family: Onest; font-weight: 600; font-size: 18px; fill: #1A1A1A; }
    .body { font-family: Manrope; font-size: 16px; fill: #4A4A4A; }
    .chip { font-family: Manrope; font-weight: 600; font-size: 14px; fill: #2F5D27; }
    .anno { font-family: ui-monospace, monospace; font-size: 11px; fill: #C2185B; }
  </style>
  <rect width="1440" height="280" fill="#FFFFFF"/>
  <g transform="translate(120,40)">
    <text class="h4">Other places we work</text>
    <text y="32" class="body">If you're outside Aurora, we're nearby:</text>
    <g transform="translate(0,60)">
      <g><rect width="140" height="40" rx="8" fill="#FAF7F1"/><text x="70" y="26" class="chip" text-anchor="middle">Naperville →</text></g>
      <g transform="translate(156,0)"><rect width="140" height="40" rx="8" fill="#FAF7F1"/><text x="70" y="26" class="chip" text-anchor="middle">Wheaton →</text></g>
      <g transform="translate(312,0)"><rect width="140" height="40" rx="8" fill="#FAF7F1"/><text x="70" y="26" class="chip" text-anchor="middle">Glen Ellyn →</text></g>
      <g transform="translate(468,0)"><rect width="140" height="40" rx="8" fill="#FAF7F1"/><text x="70" y="26" class="chip" text-anchor="middle">Downers Grove →</text></g>
      <g transform="translate(624,0)"><rect width="140" height="40" rx="8" fill="#FAF7F1"/><text x="70" y="26" class="chip" text-anchor="middle">Bolingbrook →</text></g>
    </g>
  </g>
  <text x="120" y="240" class="anno">Reuses ServiceAreaStrip (1.11/1.13) with excludeSlug=post.citySlug · max-width matches prose (720+) · margin-block --spacing-12</text>
</svg>
```

### 6.6 Related posts — surface `--color-bg`

Same as §4.5 modulo seed source (`blog.ts` instead of `resources.ts`) and section header `"Keep reading"` / `"Sigue leyendo"`. 3 `ContentCard`s.

### 6.7 CTA section — surface `--color-bg-cream` — the page's one amber

Shared `<CTA>` with `tokens={ category, city? }`. EN H2 templates per category:
- `cost-guide`: `"Ready to get a real number for your property?"`
- `seasonal`: `"Plan {city}'s next season with us."` (if `city`); fallback `"Plan your next season with us."`
- `how-to`: `"Want this done by someone who's done it before?"`
- `audience`: `"Want a property-management partner who shows up?"`

Erick polishes copy in Part 2; placeholders ratified in §14.

---

## 7. SEO and schema

### 7.1 `<title>` templates (≤ 60 chars per locale)

| Route | EN | ES |
|---|---|---|
| Resources index | `Landscaping Resources — DuPage Guides \| Sunset Services` | `Recursos de Paisajismo — Guías DuPage \| Sunset Services` |
| Resource detail | `{title} \| Sunset Services Resources` | `{title} \| Recursos Sunset Services` |
| Blog index | `Landscaping Blog — DuPage Insights \| Sunset Services` | `Blog de Paisajismo — DuPage \| Sunset Services` |
| Blog post | `{title} \| Sunset Services Blog` | `{title} \| Sunset Services Blog` |

Build-time check: `title.length ≤ 60` per locale, log warning at 55.

### 7.2 `<meta description>` (≤ 160 chars)

Per-content from seed `seoDescription[locale]`; fall back to `dek[locale]` if empty. Build-time check: `description.length ≤ 160`, log warning at 155.

### 7.3 JSON-LD per route, in order

**Resources index / Blog index**
1. `BreadcrumbList` (Home → Resources or Blog).
2. `ItemList` of `ListItem`s with `url`, `name`, `position`. Same-source with the visible grid.

**Resource detail**
1. `BreadcrumbList` (Home → Resources → {title}).
2. **`Article`** OR **`HowTo`** per `entry.schemaType`.
3. `FAQPage` if `entry.faq` is non-empty.

**Blog post**
1. `BreadcrumbList` (Home → Blog → {title}).
2. **`BlogPosting`** (or `Article` per opt-in).
3. `FAQPage` if `entry.faq` is non-empty.

### 7.4 `Article` / `BlogPosting` payload (exhaustive)

```jsonc
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",                          // or "Article" / "HowTo"
  "headline": "{entry.title[locale]}",             // ≤110 chars; assert at build
  "description": "{entry.dek[locale]}",            // ≤160 chars
  "image": "{absoluteUrl(entry.featuredImage.src)}",
  "datePublished": "{entry.publishedAt}",          // ISO 8601
  "dateModified": "{entry.updatedAt ?? entry.publishedAt}",
  "author": {
    "@type": "Person",                             // or "Organization" if byline === "Sunset Services Team"
    "name": "{entry.byline ?? 'Sunset Services Team'}",
    "url": "{erickAnchorIfErick(entry.byline)}"    // omit if not Erick
  },
  "publisher": { "@id": "{baseUrl}/#organization" }, // references sitewide Organization (1.05)
  "mainEntityOfPage": "{absoluteUrl(canonical)}",
  "inLanguage": "{locale}",                        // 'en-US' or 'es-US'
  "articleSection": "{categoryDisplayName[locale]}",
  "wordCount": "{entry.wordCount}"                 // computed at build
}
```

**`HowTo` adds:** `step: HowToStep[]` with `text` + optional `image` per step. Built from prose H2/H3 structure when `schemaType === 'HowTo'`. Code spec'd in §13.

### 7.5 `hreflang` + canonical

Every page emits self-canonical and 3 hreflang links (`en`, `es`, `x-default = en`). Pattern locked from earlier phases (1.05 / 1.13). Filter-state URLs (`?category=…`) set canonical to the un-filtered route — these are not separately rankable.

### 7.6 OG image

1200×630 per page. **Detail pages:** generated at build by `next/og` from `app/og/[type]/[slug]/route.ts` — title + featured image (right half) + category badge + brand wordmark. **Indexes:** static branded fallback.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="100%" role="img" aria-label="OG image template — Blog post detail">
  <style>
    .badge { font-family: Manrope; font-weight: 700; font-size: 16px; letter-spacing: 0.12em; fill: #FAF7F1; }
    .h1 { font-family: Onest; font-weight: 700; font-size: 52px; fill: #FAF7F1; }
    .meta { font-family: Manrope; font-size: 18px; fill: #FAF7F1; opacity: 0.85; }
    .wmk { font-family: Manrope; font-weight: 700; font-size: 20px; fill: #FAF7F1; letter-spacing: 0.06em; }
    .anno { font-family: ui-monospace, monospace; font-size: 11px; fill: #C2185B; }
  </style>
  <rect width="1200" height="630" fill="#1A3617"/>
  <rect x="600" y="0" width="600" height="630" fill="#E5E0D5"/>
  <text x="900" y="320" class="anno" text-anchor="middle" fill="#6B6B6B">[featured image right half — center-cropped]</text>
  <linearGradient id="og-fade" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#1A3617"/><stop offset="1" stop-color="rgba(26,54,23,0)"/></linearGradient>
  <rect x="600" y="0" width="200" height="630" fill="url(#og-fade)"/>
  <g transform="translate(64,80)">
    <rect width="160" height="32" rx="16" fill="#2F5D27"/>
    <text x="80" y="22" class="badge" text-anchor="middle">COST GUIDE</text>
    <text y="120" class="h1">How Much Does a Patio</text>
    <text y="180" class="h1">Cost in DuPage County</text>
    <text y="240" class="h1">in 2026?</text>
    <text y="320" class="meta">By Erick Sotomayor · 11 min read</text>
  </g>
  <g transform="translate(64,540)"><text class="wmk">SUNSET SERVICES</text></g>
</svg>
```

**Specs.** Background `--color-sunset-green-900`, copy `--color-text-on-dark`, image right-half center-cropped from `entry.featuredImage`. Generated per locale (one OG per language). Falls back to a sitewide branded fallback (same template, no per-post fields) for legacy/migration paths.



---

## 8. Photography and illustration brief

| Slot | Page | Aspect | Subject | Mood | Notes |
|---|---|---|---|---|---|
| Resources hero accent | `/resources/` | n/a | None — text-only hero | n/a | **No Cowork lift.** Hero is text-only. |
| Resources card thumbnail × 5 | Resources index + cards on related strips | 16:9 desktop / 4:3 mobile | One per entry — concrete pour, paver lay, glossary tools laid out, snow-shoveling commercial lot, county building exterior | Documentary, daylight, eye-level | `[Cowork to source from Drive in Phase 2.04]` for each |
| Resource detail hero illustration | Resource detail | n/a | None | n/a | Resource detail has no featured image (D8 / §4.1) |
| Blog hero accent | `/blog/` | n/a | None | n/a | Text-only hero. |
| Blog featured-post image × 5 | Blog index featured + post hero | 16:9 desktop / 4:3 mobile | One per seed post — completed patio at golden hour (#1), front lawn early spring (#2), Unilock pavers detail crop (#3), commercial parking lot during snow event (#4), sprinkler head with droplets at sunrise (#5) | Documentary, golden-hour preferred, real Sunset projects only | `[Cowork to source from Drive in Phase 2.04]` per slot. Each ≤ 350KB AVIF + WebP. |
| OG fallback (sitewide) | All routes when per-post OG missing | 1200×630 | Branded composite — green-900 panel + cream wordmark | Brand | `[Cowork to confirm — ask if existing brand asset works; otherwise built from tokens]` |

**Illustration policy.** No SVG accent illustrations on the index heroes — the eyebrow + H1 + dek + count line is sufficient. The Plan-noted brand discipline rejects hand-drawn SVG flair. If Chat overrides, we'd ship a single 32×32 leaf icon stroked in `--color-sunset-green-500` and reuse it; surfaced as alternate in §14.

---

## 9. i18n strings table

Chrome strings only — per-content strings live in seeds. Namespaces: `resources.*`, `blog.*`, `content.*` (shared `ContentCard` / `ContentMeta` / `ProseLayout` / TOC strings).

### 9.1 `content.*` (shared chrome)

| Key | EN | ES |
|---|---|---|
| `content.meta.by` | By | Por `[TBR]` |
| `content.meta.readingTime` | {n} min read | {n} min de lectura `[TBR]` |
| `content.meta.published` | Published | Publicado `[TBR]` |
| `content.meta.updated` | Updated | Actualizado `[TBR]` |
| `content.toc.label` | Table of contents | Tabla de contenidos `[TBR]` |
| `content.toc.onThisPage` | On this page | En esta página `[TBR]` |
| `content.related.title` | Related resources | Recursos relacionados `[TBR]` |
| `content.related.titleBlog` | Keep reading | Sigue leyendo `[TBR]` |
| `content.related.empty` | More coming soon. | Más artículos en camino. `[TBR]` |
| `content.cross.eyebrow` | Related service | Servicio relacionado `[TBR]` |
| `content.cross.linkLabel` | See the service → | Ver el servicio → `[TBR]` |
| `content.faq.title` | Common questions | Preguntas frecuentes `[TBR]` |
| `content.share.label` | Share this | Compartir `[TBR]` (deferred — flagged §16) |

### 9.2 `resources.*`

| Key | EN | ES |
|---|---|---|
| `resources.hero.eyebrow` | Resources | Recursos `[TBR]` |
| `resources.hero.h1` | Field-tested guides for DuPage homeowners. | Guías probadas en campo para propietarios de DuPage. `[TBR]` |
| `resources.hero.dek` | Buyer guides, term references, and permit primers — kept honest, kept current. | Guías de compra, referencias y primers de permisos — honestos y al día. `[TBR]` |
| `resources.hero.count` | {n} guides · last updated {month} {year} | {n} guías · actualizadas en {month} {year} `[TBR]` |
| `resources.filter.all` | All | Todas `[TBR]` |
| `resources.filter.lawnCare` | Lawn Care | Jardín `[TBR]` |
| `resources.filter.hardscape` | Hardscape | Pavimento y muros `[TBR]` |
| `resources.filter.snowAndWinter` | Snow & Winter | Nieve e invierno `[TBR]` |
| `resources.filter.buyingGuides` | Buying Guides | Guías de compra `[TBR]` |
| `resources.filter.localPermits` | Local Permits | Permisos locales `[TBR]` |
| `resources.empty.title` | No resources match this filter yet. | Aún no hay recursos en esta categoría. `[TBR]` |
| `resources.empty.cta` | Clear filter | Limpiar filtro `[TBR]` |
| `resources.helpBand.h2` | Reading guides only takes you so far. | Las guías solo te llevan hasta cierto punto. `[TBR]` |
| `resources.helpBand.body` | Tell us what you're considering. We'll come listen and help you sort it out. | Cuéntanos qué estás considerando. Vamos a escuchar y a ayudarte. `[TBR]` |
| `resources.helpBand.cta` | Talk to us → | Hablemos → `[TBR]` |
| `resources.cta.eyebrow` | Ready when you are | Cuando estés listo `[TBR]` |
| `resources.cta.h2` | Done reading? Let's measure. | ¿Terminaste de leer? Vamos a medir. `[TBR]` |
| `resources.cta.body` | A free estimate takes 30 minutes. We come listen, sketch, and price it. | Un presupuesto gratis toma 30 minutos. Escuchamos, dibujamos y cotizamos. `[TBR]` |
| `resources.cta.button` | Get a Free Estimate | Solicita un Presupuesto Gratis `[TBR]` |

### 9.3 `blog.*`

| Key | EN | ES |
|---|---|---|
| `blog.hero.eyebrow` | Blog | Blog `[TBR]` |
| `blog.hero.h1` | Notes from the field, season after season. | Notas del campo, temporada tras temporada. `[TBR]` |
| `blog.hero.dek` | Cost guides, calendars, and the questions homeowners ask us most. | Guías de costos, calendarios y las preguntas más comunes. `[TBR]` |
| `blog.hero.count` | {n} posts · {month} {year} | {n} publicaciones · {month} {year} `[TBR]` |
| `blog.filter.all` | All | Todas `[TBR]` |
| `blog.filter.howTo` | How-To | Cómo hacerlo `[TBR]` |
| `blog.filter.costGuide` | Cost Guide | Guías de costos `[TBR]` |
| `blog.filter.seasonal` | Seasonal | De temporada `[TBR]` |
| `blog.filter.industryNews` | Industry News | Noticias del sector `[TBR]` |
| `blog.filter.audience` | Audience | Para tu propiedad `[TBR]` |
| `blog.featured.cta` | Read the post → | Leer el artículo → `[TBR]` |
| `blog.empty.title` | No posts in this category yet. | Aún no hay publicaciones en esta categoría. `[TBR]` |
| `blog.empty.cta` | Clear filter | Limpiar filtro `[TBR]` |
| `blog.cta.eyebrow` | Ready when you are | Cuando estés listo `[TBR]` |
| `blog.cta.h2.default` | Done reading? Let's walk your property. | ¿Terminaste de leer? Caminemos tu propiedad. `[TBR]` |
| `blog.cta.h2.costGuide` | Ready to get a real number for your property? | ¿Listo para un número real para tu propiedad? `[TBR]` |
| `blog.cta.h2.seasonal` | Plan {city}'s next season with us. | Planifiquemos la próxima temporada en {city}. `[TBR]` |
| `blog.cta.h2.howTo` | Want this done by someone who's done it before? | ¿Quieres que lo haga alguien que ya lo ha hecho? `[TBR]` |
| `blog.cta.h2.audience` | Want a property-management partner who shows up? | ¿Buscas un socio para tu propiedad que aparezca? `[TBR]` |
| `blog.cta.body` | A free estimate takes 30 minutes. We come listen, sketch, and price it. | Un presupuesto gratis toma 30 minutos. Escuchamos, dibujamos y cotizamos. `[TBR]` |
| `blog.cta.button` | Get a Free Estimate | Solicita un Presupuesto Gratis `[TBR]` |

`[TBR]` strings are pending native review in Phase 2.13 per Plan §10. EN copy is placeholder; Erick polishes in Part 2.

---

## 10. Motion choreography

| Section | Motion | Reduced-motion |
|---|---|---|
| Both indexes — Hero | None. | None. |
| Resources index — Filter + Grid | One `<AnimateIn variant="fade-up">` at section root. Cards do NOT animate individually. | Opacity-only at `--motion-fast`. |
| Resources index — Help band | One `<AnimateIn variant="fade-up">`. | Opacity-only. |
| Resources index — CTA | One `<AnimateIn variant="fade-up">`. | Opacity-only. |
| Blog index — Featured + Filter + Grid | Section-level `<AnimateIn>` on the grid; **separate** `<AnimateIn>` on the featured card so timings don't collide. Total: 2 wrappers in this section. | Opacity-only. |
| Blog index — CTA | One `<AnimateIn>`. | Opacity-only. |
| Both detail templates — Hero | None. | None. |
| Both detail templates — Body / `ProseLayout` | **No `<AnimateIn>`** on the body — it would compete with reading. TOC sticky highlight is `IntersectionObserver`-driven, not entrance motion. | Unchanged (already non-motion). |
| Both detail templates — FAQ | One `<AnimateIn>` on the section header. Items render directly per the no-wrapper-per-item rule. | Opacity-only on header. |
| Both detail templates — Inline service cross-link | None — inline content reveals with the prose body. | n/a |
| Both detail templates — Inline location strip | None — inline content. | n/a |
| Both detail templates — Related strip | One `<AnimateIn>` on the section. Cards do NOT animate individually. | Opacity-only. |
| Both detail templates — CTA | One `<AnimateIn>`. | Opacity-only. |

**`<AnimateIn>` budget per page.** Indexes: ≤ 4. Detail pages: ≤ 4. Within the 1.07 per-section budget.

**Card hover** (locked from 1.06 §8.3): photo `scale(1.03)` over `--motion-slow` `--easing-soft`; title `translateY(-2px)`. Reduced-motion: scale becomes `1.0`; shadow growth retained.

---

## 11. Accessibility audit (WCAG 2.2 AA)

### 11.1 Heading hierarchy
- **Indexes:** H1 (hero) → H2 per top-level section. Filter chip group has no heading (it's interactive chrome with `<button>`s carrying their own accessible names).
- **Detail pages:** H1 (hero post title) → H2 per top-level page section AND per body H2 (the body H2s feed the TOC). H3 nests inside body H2s. **H4 max** within prose. The hero's `ContentMeta` is unheaded text. The category badge is a `<span>`, not a heading.

### 11.2 Skip-link wrap
Locked from 1.05; both routes wrap inside the `<main>` landmark. Skip-link target is the page H1.

### 11.3 Landmarks
`<header>` (chrome, locked) → `<main>` (route content) → at `xl`+ on detail pages: `<aside aria-labelledby="toc-heading">` for the TOC inside `<main>` → `<footer>` (chrome). The TOC `<aside>` lives **inside** `<main>` so screen-reader landmark order reads: header → main → (aside nested) → footer.

### 11.4 Reading order at zoom 200%
TOC must reflow above the body when the viewport drops below `xl`. The `lg:hidden` + `xl:block` pair on the sticky `<aside>` enforces this; below `xl` the inline `<details>` collapsed-TOC inside `<main>` becomes the only TOC.

### 11.5 Color contrast (every prose element ≥ 4.5:1 against its surface)

All combinations validated against 1.03 §3 contrast table:
- Body 18px on white: 18.9:1 ✓
- Body on cream (FAQ section): 17.7:1 ✓
- Caption `--color-text-muted` on white: 5.3:1 ✓
- Inline link `--color-sunset-green-700` on white: 9.8:1 ✓
- Callout-info text on `--color-sunset-green-50`: ≥ 8:1 ✓
- Callout-warning text on `--color-sunset-amber-50`: ≥ 9:1 ✓
- Category badge `--color-sunset-green-700` on `--color-bg`: 9.8:1 ✓
- Filter chip active `--color-text-on-dark` on `--color-sunset-green-700`: 9.8:1 ✓
- Filter chip inactive `--color-text-primary` on `--color-bg`: 18.9:1 ✓

### 11.6 Focus styles

TOC links, filter chips, accordion summaries, related-content cards, and the inline service cross-link card all use the locked focus-visible ring from 1.03 §6.2: `outline: 2px solid --color-focus-ring; outline-offset: 2px; border-radius matches the element`. The whole-card `<a>` pattern keeps focus on a single tab-stop per card.

### 11.7 Card link semantics

Every `ContentCard` wraps the entire surface in one `<a>` (Resources/Blog cards have no nested `<a>` or `<button>`). Title text is inside; the badge is not a link. Dek and meta inherit underline-on-hover from the parent `<a>`. This matches the 1.15 `ProjectCard` pattern. Whole-card links pass WCAG 2.4.4 (Link Purpose) because the visible text inside (title + dek) is the accessible name.

### 11.8 ARIA on filter chip group

Wrap chip group in `<div role="group" aria-label="Filter by category" aria-controls="content-grid">`. Each chip `<button aria-pressed="true|false">`. The grid carries `<ul id="content-grid" aria-live="polite">` so SR announces "Now showing 3 results" via a hidden status node when the active filter changes.

### 11.9 Reduced-motion handling

Per D17. `<AnimateIn>` falls back to opacity-only. Card hover: scale → 1.0 retained shadow. TOC IO highlight is non-motion. FAQ `<details>` open/close uses native browser behavior (no JS animation).

### 11.10 Screen-reader test plan (Code-time)

VoiceOver + NVDA passes on each route:
1. Skip-link → main lands on H1.
2. H1 → H2 traversal lists every section heading in order.
3. Filter chips announce "All, button, pressed" / "Hardscape, button, not pressed".
4. Card link reads "Patio Materials Guide: …, link" without re-reading the badge as a separate link.
5. TOC accordion (below xl) announces "Table of contents, button, collapsed" then expands cleanly.
6. `details` FAQ items announce "Q text, button, collapsed" → answer text on expand.

---

## 12. Routing, data flow, and seed types

### 12.1 Route map

```
src/app/[locale]/
  resources/
    page.tsx                                     // Resources index (server)
    [slug]/
      page.tsx                                   // Resource detail (server)
      not-found.tsx                              // per-route 404 surface
  blog/
    page.tsx                                     // Blog index (server)
    [slug]/
      page.tsx                                   // Blog post (server)
      not-found.tsx
```

All four pages are server components. The TOC, filter chip strip, and reduced-motion fallback are **the only client boundaries** on these routes (each `"use client"` and isolated to leaves — see §12.5).

### 12.2 Static params

```ts
// resources/[slug]/page.tsx
export async function generateStaticParams() {
  const entries = await getAllResources();   // reads resources.ts seeds
  return entries.flatMap(e => locales.map(locale => ({ locale, slug: e.slug })));
}
// Same shape for blog/[slug]/page.tsx with getAllBlogPosts().
```

### 12.3 `resources.ts` seed type

```ts
// src/data/resources.ts
import type { Locale } from '@/i18n';

export type ResourceCategory =
  | 'lawn-care'
  | 'hardscape'
  | 'snow-and-winter'
  | 'buying-guides'
  | 'local-permits';

export interface ResourceFAQ {
  q: Record<Locale, string>;
  a: Record<Locale, string>;        // Markdown allowed in answer; rendered with the same prose stylesheet
}

export interface ResourceEntry {
  slug: string;                                       // kebab-case; kept identical across locales
  category: ResourceCategory;
  schemaType: 'Article' | 'HowTo';
  title: Record<Locale, string>;                      // ≤110 chars
  dek: Record<Locale, string>;                        // ≤200 chars
  body: Record<Locale, string>;                       // Markdown
  seoDescription?: Record<Locale, string>;            // ≤160 chars; falls back to dek
  byline?: string;                                    // default 'Sunset Services Team'
  lastUpdated: string;                                // ISO 8601 — never displayed; powers dateModified + sitemap
  faq?: ResourceFAQ[];
  inlineServiceCrossLink?: { audience: 'residential' | 'commercial' | 'hardscape'; serviceSlug: string };
  // computed at build (do NOT author):
  wordCount?: number;
  readingMinutes?: number;
}
```

### 12.4 `blog.ts` seed type

```ts
// src/data/blog.ts
import type { Locale } from '@/i18n';

export type BlogCategory = 'how-to' | 'cost-guide' | 'seasonal' | 'industry-news' | 'audience';

export interface BlogImage {
  src: string;                                        // /images/blog/<slug>.jpg
  srcMobile?: string;                                 // /images/blog/<slug>-mobile.jpg (4:3)
  alt: Record<Locale, string>;                        // ≤125 chars; describes contents not topic
  width: number;
  height: number;
}

export interface BlogPostEntry {
  slug: string;
  category: BlogCategory;
  subAudience?: 'residential' | 'commercial' | 'hardscape';   // only when category === 'audience'
  schemaType: 'BlogPosting' | 'Article';
  title: Record<Locale, string>;
  dek: Record<Locale, string>;
  body: Record<Locale, string>;
  seoDescription?: Record<Locale, string>;
  byline: string;                                     // explicit; no team-fallback default for blog
  publishedAt: string;                                // ISO 8601
  updatedAt?: string;                                 // ISO 8601
  featuredImage: BlogImage;
  faq?: ResourceFAQ[];                                // shape reused
  inlineServiceCrossLink?: { audience: 'residential' | 'commercial' | 'hardscape'; serviceSlug: string };
  inlineLocationCity?: string;                        // city slug; renders ServiceAreaStrip if present
  // computed at build:
  wordCount?: number;
  readingMinutes?: number;
}
```

### 12.5 Client-component leaves (only these — no others)

| Component | File | Why client | Where used |
|---|---|---|---|
| `<FilterChipStrip>` | `src/components/content/FilterChipStrip.client.tsx` | reads `useSearchParams`, calls `router.push` | Resources index, Blog index |
| `<TOC>` | `src/components/content/TOC.client.tsx` | `IntersectionObserver` for active-section highlight | both detail templates |
| `<AnimateIn>` (existing, 1.07) | n/a | already client | section wrappers per §10 |

### 12.6 Reading-time helper

```ts
// src/lib/readingTime.ts
const WPM = 200;
export function estimateReadingTime(markdown: string): { wordCount: number; readingMinutes: number } {
  // strip headings markers, code fences, links — keep content words
  const stripped = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/[#>*_~`]/g, ' ');
  const wordCount = stripped.split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / WPM));
  return { wordCount, readingMinutes };
}
// Called from getAllResources / getAllBlogPosts at build; result stored on entry.
```

### 12.7 `HowTo` step extraction

```ts
// src/lib/howToSteps.ts
import { remark } from 'remark';

export function extractHowToSteps(markdown: string): { name: string; text: string }[] {
  // Walk the AST: each H2 becomes a HowToStep.name; the H2's following paragraph(s) until the next H2 become text.
  // If the entry's first H2 is "Overview" or "Before you start", skip it (not a step).
  // …
}
```

Code spec'd; implementation in 1.18.

### 12.8 Build-time assertions (Code adds to existing audit script)

1. `title.length ≤ 60` per locale per page; warn at 55.
2. `description.length ≤ 160` per locale per page; warn at 155.
3. `featuredImage.alt[locale].length ≤ 125`.
4. Category in seed must be one of the locked enums.
5. Surface-alternation rule: no two adjacent same-surface bands rendered; assert by walking the JSX tree on each route at build.
6. Amber-button count per page === 1 (excluding navbar chrome).
7. `document.querySelectorAll('.card--featured').length === 0` on all four routes.
8. Every `<h2>` inside `.prose` has an `id` (TOC contract).
9. `canonical` URL of a filter-state page === un-filtered route.

---

## 13. New shared components — full specs

### 13.1 `<ContentCard>`

Composes the locked `.card--photo` primitive. Whole-card link.

**Props.**

```ts
export interface ContentCardProps {
  href: string;                          // /{locale}/resources/{slug} or /{locale}/blog/{slug}
  category: { slug: string; label: string };
  title: string;
  dek?: string;                          // ≤80 chars on Resources; ≤100 on Blog
  image: { src: string; alt: string; width: number; height: number };
  meta: {
    byline?: string;
    publishedAt?: string;                // ISO; renders if present (Blog)
    readingMinutes: number;
  };
  // surface flag for related-strip-on-white variant
  surface?: 'white' | 'cream';
  // image loading priority — the featured Blog card overrides to true
  priority?: boolean;
}
```

**DOM.**

```tsx
<a className={`content-card content-card--surface-${surface}`} href={href}>
  <div className="content-card__photo">
    <Image src={image.src} alt={image.alt} width={image.width} height={image.height}
           loading={priority ? 'eager' : 'lazy'}
           {...(priority && { fetchPriority: 'high', priority: true })} />
    <Badge className="content-card__badge">{category.label}</Badge>
  </div>
  <div className="content-card__body">
    <h3 className="content-card__title">{title}</h3>
    {dek && <p className="content-card__dek">{dek}</p>}
    <ContentMeta {...meta} compact />
  </div>
</a>
```

**CSS.** Background per `surface` (`var(--color-bg)` or `var(--color-bg-cream)`). Radius `--radius-md`. Shadow `--shadow-sm` resting; `--shadow-md` on hover. Photo aspect 16:9 desktop / 4:3 mobile. Title `--text-h4` weight 700 `--color-text-primary`. Dek `--text-body-sm` `--color-text-secondary` 2-line clamp via `-webkit-line-clamp: 2`. Hover: photo `scale(1.03)` per 1.06 §8.3. Whole card focus-visible ring per 1.03 §6.2.

**Reuses:** `.card--photo` styles, `<Badge>` primitive, `<Image>` primitive (locked).
**Does NOT reuse:** `<ProjectCard>` (1.15) — different visual semantics: ProjectCard surfaces project metadata (location, date, sqft), ContentCard surfaces editorial metadata (byline, reading time). Same shape, different content layer.

### 13.2 `<ContentMeta>`

Inline stat-strip used in two layouts: in the detail-page hero (`compact={false}`, full strip), inside ContentCard body (`compact={true}`, drops byline label and shows short date).

**Props.**

```ts
export interface ContentMetaProps {
  byline?: string;                       // omits "By" prefix when undefined
  publishedAt?: string;                  // ISO 8601
  readingMinutes: number;
  category?: { slug: string; label: string };  // shows on hero only
  compact?: boolean;                     // card variant: no "By", short date "Apr 12", no category
}
```

**DOM (hero, full).**

```tsx
<div className="content-meta">
  {byline && <span className="content-meta__byline">By {byline}</span>}
  {publishedAt && <><span aria-hidden>·</span><time dateTime={publishedAt} className="content-meta__date">{formatDate(publishedAt, locale, 'long')}</time></>}
  <span aria-hidden>·</span>
  <span className="content-meta__reading">{readingMinutes} min read</span>
  {category && <><span aria-hidden>·</span><span className="content-meta__category">{category.label}</span></>}
</div>
```

**CSS.** `display: flex; gap: var(--spacing-2); flex-wrap: wrap; --text-body-sm; --color-text-muted`. Below 480: `flex-direction: column` and dot separators are hidden via `aria-hidden` siblings (`.content-meta__sep { display: none; }`).

### 13.3 `<ProseLayout>`

Renders the body of a Resource detail or Blog post. Composes:

- the prose container (max-width 720, see §4.2 stylesheet poster),
- the sticky right-rail TOC at `xl`,
- the inline `<details>` collapsed TOC below `xl`,
- inline cross-link rendering (calls `<ServiceCard>` between H2s where flagged in seed),
- inline location strip rendering (calls `<ServiceAreaStrip>` near body bottom where flagged).

**Props.**

```ts
export interface ProseLayoutProps {
  bodyMarkdown: string;                  // raw seed markdown
  locale: Locale;
  inlineServiceCrossLink?: { audience: string; serviceSlug: string };
  inlineLocationCity?: string;           // Blog only
}
```

**Implementation outline.**

1. Parse `bodyMarkdown` with the existing remark pipeline (locked from 1.05). Auto-add `id` slugs to every `<h2>`. Output sanitized HTML with prose-class wrappers.
2. Walk the rendered `<h2>`s to build TOC items.
3. Insert cross-link `<ServiceCard>` between the second and third H2 (or, if 2 or fewer H2s, after the first).
4. Insert location strip after the last H2 if `inlineLocationCity`.
5. Render TOC twice — once as sticky aside (xl+), once as collapsed details (below xl). `prefers-reduced-motion` does NOT change this; layout is non-motion.

**TOC client behavior.**

```tsx
// TOC.client.tsx
useEffect(() => {
  const headings = document.querySelectorAll('.prose h2[id]');
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
  }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });
  headings.forEach(h => io.observe(h));
  return () => io.disconnect();
}, []);
```

The active item gets a 3px left border in `--color-sunset-green-500` and weight 600. Click on a TOC item: `scrollTo({ top: heading.offsetTop - var(--header-height) - 24, behavior: 'smooth' })` (smooth scroll respects `prefers-reduced-motion` via CSS `scroll-behavior: auto` override on the html element when reduced motion is set — already locked from 1.05).

### 13.4 Build-time prose ID slugs

```ts
// src/lib/proseSlug.ts
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')   // strip diacritics
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
```

Collisions: append `-2`, `-3`, … in document order. Asserted unique at build per §12.8 #8.

---

## 14. Recommendations and alternates surfaced for Chat ratification

These items are surfaced as defaults — **not Plan-locked**. If Chat overrides, surface back to me before Code begins 1.18.

### 14.1 — Help-deciding band on Resources index (D2 / §3.3)
- **Default (recommended):** keep the band.
- **Alternate A:** drop it; let the page run hero → grid → CTA.
- **Risk if dropped:** longer single cream surface (chips + grid is a tall section), and the only non-amber CTA on the page disappears.

### 14.2 — TOC on detail pages (D10)
- **Default:** sticky right-rail TOC at `xl`+, inline collapsed below.
- **Alternate A:** prose-only, no TOC at any breakpoint. Strict-minimum client surface.
- **Alternate B:** sticky TOC at `lg`+ (more aggressive). Risk: pushes prose left into a column too narrow at lg.

### 14.3 — Resource hero photo (D8 / §4.1)
- **Default:** no hero photo on Resource detail. Saves Cowork lift for higher-impact Blog photos.
- **Alternate:** small inline accent illustration (single 64×64 leaf icon next to eyebrow). Surfaced and rejected in §8 illustration policy; revisit if Chat reads the hero as too austere.

### 14.4 — Blog hero image placement (§6.1)
- **Default:** option B — image below the meta strip, full-width within container.
- **Alternate A:** option A — full-bleed overlay with title centered. **Rejected for mobile-LCP risk per 1.07 P=86.** Chat may override if photography is so strong that it deserves full-bleed treatment.
- **Alternate C:** option C — image right of copy, 2-col layout. Editorial / NYT-Style asymmetric. Surfaced; requires testing dek wrap at md.

### 14.5 — Reading-time WPM constant (D6)
- **Default:** 200 wpm.
- **Alternate:** 230 wpm. Common publisher value. Difference per post: ±1 minute typical. Defaulted to the conservative 200 to match how the audience actually reads (cost guides are slow reads).

### 14.6 — Newsletter capture (D9)
- **Default:** defer to Part 2.
- **Alternate B (UI-only):** ship a UI-only "Get our spring tips" block on detail pages with no functioning form (deferred submission). Adds visual content but creates a known dead-end.
- **Alternate C (real capture, Part 2 only):** wire a real capture in Part 2 with a Resend or ConvertKit integration; out of Part 1 scope.

### 14.7 — Erick byline assignments per seed post (D7 / D19)
- Cowork task. Default assignments shown in §2 D19.

### 14.8 — Bottom CTA copy per blog category (§6.7)
- Defaults shown. Erick is the source of truth in Part 2; placeholders ratified now to unblock Code.

### 14.9 — Article body width (`--container-prose`)
- **Default:** 720px (matches 1.05 `--container-prose` if exposed; otherwise hard-coded). Optimal CPL ~70 chars at 18px.
- **Alternate:** 680px. Tighter, slower line scan. Surfaced; default holds.

---

## 15. Visual QA checklist (Code-time)

Run on every route at desktop (1440), tablet (1024), mobile (390), and zoom 200%.

1. Surface alternation matches D14 — no two adjacent same-surface bands.
2. Exactly one amber button per body page (excluding navbar chrome).
3. `.card--featured` count === 0 globally on these routes.
4. `<AnimateIn>` count per page ≤ 4. None on heroes or per-card.
5. `ContentMeta` has the right field set per surface (Resource hero: byline + reading; Blog hero: byline + date + reading + category; ContentCard: byline + short date + reading).
6. Filter chip "All" is the leftmost active default when no `?category` param.
7. Filter chip strip wraps cleanly at md desktop with ES strings (longest: "Pavimento y muros", "Permisos locales", "Para tu propiedad").
8. URL state filter (`?category=…`) preserves on locale switcher.
9. Card whole-link tab order is one stop per card.
10. Detail-page H2 ids are unique within the page.
11. TOC item count === `<h2>` count in body.
12. TOC active state advances as you scroll past each H2.
13. Below xl: TOC `<details>` defaults closed; opens on click; closes on Escape.
14. `<ServiceCard>` inline cross-link renders only when seed flags it; max-width matches prose.
15. `<ServiceAreaStrip>` inline location strip renders only on flagged Blog posts; `excludeSlug` removes the post's own city.
16. Blog featured image is LCP element (verified in DevTools Performance LCP marker).
17. Blog featured image: `priority + fetchPriority="high"`. All other card images: `loading="lazy"`.
18. ES strings render without overflow at 390 width on every section.
19. JSON-LD validates against schema.org for: `BreadcrumbList`, `Article`, `HowTo`, `BlogPosting`, `FAQPage`, `ItemList`.
20. `hreflang` × 3 links present on every page.
21. `canonical` on filter-state URLs === un-filtered route.
22. Reduced-motion: every `<AnimateIn>` respects; card hover `scale` is 1.0; FAQ details still open.
23. Color contrast verified per §11.5 with axe-core.
24. Lighthouse mobile ≥ 90 on each route. Mobile LCP ≤ 2.5s on Blog post.
25. CLS = 0 on every route. Featured-image explicit width/height in DOM.
26. Skip-link → main lands on H1 on every route.
27. `<details>` FAQ items render answer text in SSR HTML (view-source check).
28. Empty filter state renders the cream callout + Ghost CTA (test: `?category=invalid-slug`).

---

## 16. Open questions, deferred items, and Part-2 follow-ups

### Open (Chat to ratify or override)
1. §14.1 — keep or drop Resources help-deciding band.
2. §14.2 — TOC default, prose-only, or aggressive lg breakpoint.
3. §14.4 — Blog hero image placement (B default vs A or C).
4. §14.5 — Reading-time WPM constant.
5. §14.7 — Erick vs Sunset Services Team byline per seed post.
6. §2 D19 row 3 — Why Unilock? as `BlogPosting` (default) or `Article`.

### Deferred to Part 2
1. **Newsletter capture (D9).** Surface either as detail-page block (alternate B) or sidebar widget (alternate C) once we have a list provider chosen.
2. **On-site search.** Defer until we have analytics signal (search box use ≥ 5% of sessions). Implementation candidate: `pagefind` (static-friendly).
3. **Author profile pages.** `/authors/[slug]/` if we add Marcin / additional bylines that warrant dedicated pages. Schema currently writes `author.url` → About `#erick` for Erick, string for everyone else.
4. **RSS feed.** `/blog/feed.xml`. Stub cost-low; defer purely to keep Part 1 scope tight.
5. **Comments / reactions.** Not on roadmap. Brand isn't a publisher.
6. **Per-locale OG image variants.** Currently 1 OG image per detail page (English-text). Add ES variant in Part 2 if international traffic warrants.
7. **`Share this` button on detail pages.** Native `navigator.share()` on mobile, copy-link fallback. Stub deferred — surfaced because `content.share.label` is in the i18n table.

### Cowork tasks (Drive / Erick / Marcin)
1. **Photography for 5 blog posts + 5 resource cards.** Slots tagged `[Cowork to source from Drive in Phase 2.04]`. AVIF + WebP, ≤350KB, alt ≤125 chars each per locale. Path `/images/blog/` and `/images/resources/`.
2. **Erick to ratify byline assignments** (D7, D19, §14.7).
3. **Erick to polish CTA copy per Blog category** (§6.7) in Part 2 wave.
4. **Marcin candidate for the Unilock post** (#3) — Erick to confirm.
5. **Brand wordmark for OG fallback** (§8) — confirm a usable variant exists in Drive; otherwise generated from tokens.

### Code follow-ups (1.18-specific)
1. Implement `estimateReadingTime` per §12.6 and run it in `getAllResources` / `getAllBlogPosts`.
2. Implement `extractHowToSteps` per §12.7 for resources where `schemaType === 'HowTo'` (seed entry #2 only).
3. Add the build-time assertions in §12.8 to the existing audit script (1.13 / 1.15 precedent).
4. Move the prose stylesheet into a route-group-scoped `prose.css`, NOT `globals.css`. Loaded by `/resources/[slug]/layout.tsx` and `/blog/[slug]/layout.tsx`.
5. Hard-code `canonical` builder to ignore `?category` for filter-state URLs.
6. Confirm `fetchPriority` prop is on the locked `<Image>` primitive; if not, surface back to me before shipping the Blog featured card.

---

## 17. Phase-handover summary

| Item | Value |
|---|---|
| Phase | 1.17 (Design) |
| Routes designed | `/resources/`, `/resources/[slug]/`, `/blog/`, `/blog/[slug]/` × 2 locales = 8 rendered URLs |
| New shared components | `<ContentCard>`, `<ContentMeta>`, `<ProseLayout>` (composed from locked primitives — no new tokens) |
| Reused locked components | `<Button>`, `<Badge>`, `<Card>` (`.card--photo`), `<Breadcrumb>`, `<Eyebrow>`, `<FaqAccordion>`, `<ServiceCard>`, `<ServiceAreaStrip>`, `<CTA>`, `<AnimateIn>`, `<Image>` |
| Net new tokens | **0** |
| Net new component variants | **0** |
| Featured-card uses | **0** |
| Amber CTAs per page | **1** (in bottom CTA section) |
| Schema types added | `Article`, `HowTo`, `BlogPosting`, `FAQPage`, `BreadcrumbList`, `ItemList` |
| Client component leaves | 3 (`<FilterChipStrip>`, `<TOC>`, existing `<AnimateIn>`) |
| Hands off to | Claude Code, Phase 1.18 |
| Plan-locked items unchanged | Yes — all token, chrome, motion, amber-discipline, FAQ, CTA-tokens, ServiceAreaStrip, ProjectCard contracts preserved |
| Open ratifications | 6 (§16 Open) |
| Deferred to Part 2 | 7 |
| Cowork tasks queued | 5 |

End of Phase 1.17 design handover.
