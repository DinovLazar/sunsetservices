# Stock-bridge image manifest — Hardscape, Waterproofing, Trenchless & Snow Removal

**Phase:** B-13 (briefs) + B-13b (download pass) + B-15 (Snow Removal sourcing pass) + B-16 (Hardscape + gap-services sourcing pass)
**Created:** 2026-07-03 · **Downloads executed:** 2026-07-03 (Waterproofing/Trenchless), 2026-07-04 (Snow Removal)
**Status:** **Waterproofing/Trenchless: 6 images integrated (B-14); 10 services on diagram track. Snow Removal: 5 images integrated (B-15 Code). B-16 Cowork pass (2026-07-04): 14 new bridge images sourced/verified/saved — 4 Hardscape + 7 Waterproofing (incl. division hero) + 3 Trenchless (incl. division hero); sump-pumps remains a documented GAP. NOT yet integrated — awaiting Phase B-16 Code.**
**Replacement-by date (Waterproofing/Trenchless images):** **2026-10-01** — after this date, authentic Sunset photography replaces those bridge images.
**Replacement-by date (Snow Removal images):** **2027-01-31** — snow photography cannot exist before the first 2026–27 snowfall; crews shoot real work during the first storm cycles, then a replacement phase swaps these out.

> These are **temporary bridge images** under Brand Guide §9.1/§9.3. Every file carries the mandatory `stock-` prefix so it stays permanently distinguishable from real Sunset project photos. Alt text is generic and truthful — it never names Sunset, never names a city, never implies the work is Sunset's. See the 2026-07-03 decisions-log entries for the plan-of-record. Repo integration is a later Code phase (B-14); **no `.tsx`/`.ts`/`.json` file was touched here.**

## Download-pass results (B-13b)

- **6 heroes sourced, license-verified, non-AI-confirmed, visually inspected, saved:** gutter-services, yard-drainage, foundation-repair (Waterproofing); trenching-excavation, sewer-line-replacement, conduit-installation (Trenchless). All from Pexels (Pexels License, no attribution required; attribution logged anyway). All landscape, ≥1600 px wide (most 6000 px).
- **7 services could not be sourced accurately from free stock → gaps:** basement-waterproofing, sump-pumps, crawl-spaces, window-wells, concrete-raising, humidity-control, radon-mitigation. In every case the accurate subject exists only as **iStock Sponsored (paid)** results or not at all; free results were wrong objects (farm/pool pumps for "sump pump," snails for "crawl space," air-conditioners for "dehumidifier," etc.). Per the binding accuracy rule ("an inaccurate photo is worse than none"), none was settled. See per-service notes below.
- **1 trenchless service moved to Diagram needed:** handhole-pull-box (joins Missile Boring + HDPE Pipe Fusing from B-13).
- **Optional supports:** all skipped (heroes secured; no genuinely additive accurate support found, and the specialty supports — exterior membrane, push pier, battery-backup pump, sewer camera — share the same paid-only problem).

**Net: 6 of 16 service pages get a bridge photo; 7 waterproofing services need a diagram or paid/real photo; 3 trenchless services get diagrams (2 from B-13 + handhole).**

---

## Enumerated target pages (authoritative)

Base (preview): `https://sunsetservices.vercel.app` · Production: `https://sunsetservices.us`
English routes are unprefixed (`localePrefix: 'as-needed'`, `defaultLocale: 'en'`). Spanish equivalents live at `/es/…` and reuse the same image asset.

**Waterproofing** (`/waterproofing/<slug>`): basement-waterproofing, foundation-repair, sump-pumps, yard-drainage, gutter-services, window-wells, crawl-spaces, concrete-raising, humidity-control, radon-mitigation.
**Trenchless & Directional Boring** (`/trenchless/<slug>`): conduit-installation, trenching-excavation, sewer-line-replacement, missile-boring, handhole-pull-box, pipe-fusing.

---

## Waterproofing — image table

| Filename | Target page | Role | Source page URL | Photographer | License | Download date | Alt text | Replace by |
|---|---|---|---|---|---|---|---|---|
| `stock-waterproofing-gutter-services-hero-01.jpg` | `/waterproofing/gutter-services` | hero | https://www.pexels.com/photo/old-residential-house-facade-in-town-on-sunny-day-5667308/ | Francesco Ungaro | Pexels License | 2026-07-03 | Green-painted metal rain gutter and downspout running along the eave and down the wall of a residential building. | 2026-10-01 |
| `stock-waterproofing-yard-drainage-hero-01.jpg` | `/waterproofing/yard-drainage` | hero | https://www.pexels.com/photo/drainage-pipe-installation-in-elk-grove-trench-37627673/ | D Goug | Pexels License | 2026-07-03 | Corrugated drainage pipe bedded in gravel within an open excavated trench, before backfilling. | 2026-10-01 |
| `stock-waterproofing-foundation-repair-hero-01.jpg` | `/waterproofing/foundation-repair` | hero | https://www.pexels.com/photo/photo-of-a-crack-wall-10979509/ | barış erkin | Pexels License | 2026-07-03 | Structural cracks running across a concrete wall. | 2026-10-01 |
| _basement-waterproofing_ | `/waterproofing/basement-waterproofing` | hero | **GAP — not sourced** → superseded by B-16 | — | — | 2026-07-03 | (unwritten — no accurate free image) | — |
| _sump-pumps_ | `/waterproofing/sump-pumps` | hero | **GAP — not sourced** → still GAP after B-16 (see B-16 section) | — | — | 2026-07-03 | (unwritten) | — |
| _window-wells_ | `/waterproofing/window-wells` | hero | **GAP — not sourced** → superseded by B-16 | — | — | 2026-07-03 | (unwritten) | — |
| _crawl-spaces_ | `/waterproofing/crawl-spaces` | hero | **GAP — not sourced** → superseded by B-16 | — | — | 2026-07-03 | (unwritten) | — |
| _concrete-raising_ | `/waterproofing/concrete-raising` | hero | **GAP — not sourced** → superseded by B-16 | — | — | 2026-07-03 | (unwritten) | — |
| _humidity-control_ | `/waterproofing/humidity-control` | hero | **GAP — not sourced** → superseded by B-16 | — | — | 2026-07-03 | (unwritten) | — |
| _radon-mitigation_ | `/waterproofing/radon-mitigation` | hero | **GAP — not sourced** → superseded by B-16 | — | — | 2026-07-03 | (unwritten) | — |

Optional supports (basement exterior-membrane, foundation push-pier, sump battery-backup): **skipped** — specialty subjects unavailable on free stock.

## Trenchless — image table

| Filename | Target page | Role | Source page URL | Photographer | License | Download date | Alt text | Replace by |
|---|---|---|---|---|---|---|---|---|
| `stock-trenchless-trenching-excavation-hero-01.jpg` | `/trenchless/trenching-excavation` | hero | https://www.pexels.com/photo/construction-site-with-trenches-and-pipes-in-suburban-area-37627672/ | D Goug | Pexels License | 2026-07-03 | An open utility trench excavated across a construction site with drainage pipe staged alongside, before backfilling. | 2026-10-01 |
| `stock-trenchless-sewer-line-replacement-hero-01.jpg` | `/trenchless/sewer-line-replacement` | hero | https://www.pexels.com/photo/urban-pipework-construction-site-close-up-29274530/ | Sergei Starostin | Pexels License | 2026-07-03 | Open excavation exposing underground utility pipes and connections during a pipe replacement. | 2026-10-01 |
| `stock-trenchless-conduit-installation-hero-01.jpg` | `/trenchless/conduit-installation` | hero | https://www.pexels.com/photo/stack-of-pvc-pipes-at-a-construction-site-29301874/ | Sergei Starostin | Pexels License | 2026-07-03 | Bundled lengths of grey PVC conduit staged on site before installation. | 2026-10-01 |
| _handhole-pull-box_ | `/trenchless/handhole-pull-box` | hero | **MOVED TO DIAGRAM** → superseded by B-16 (sourced) | — | — | 2026-07-03 | (see Diagram needed) | — |
| _missile-boring_ | `/trenchless/missile-boring` | — | **DIAGRAM (B-13)** | — | — | — | (see Diagram needed) | — |
| _pipe-fusing_ | `/trenchless/pipe-fusing` | — | **DIAGRAM (B-13)** → superseded by B-16 (sourced) | — | — | — | (see Diagram needed) | — |

Optional sewer camera-inspection support: **skipped** (hero secured).

---

## Alt-text adjustments made during the pass

Every sourced image took an alt-text tweak so it describes exactly what the downloaded photo shows (still generic, still no Sunset, no location):

- **gutter-services** — from "Aluminum rain gutter and downspout…" → "Green-painted metal rain gutter and downspout…" (the found gutter is painted metal on a facade, not bare aluminum).
- **yard-drainage** — from "Perforated French-drain pipe laid in a gravel-filled trench across a residential yard" → "Corrugated drainage pipe bedded in gravel within an open excavated trench" (the found pipe is corrugated culvert, not a small perforated French drain; not clearly a residential yard).
- **trenching-excavation** — from "Compact excavator digging a straight open utility trench" → "An open utility trench excavated across a construction site with drainage pipe staged alongside" (no excavator in frame; the accurate subject is the open trench itself).
- **sewer-line-replacement** — from "Open excavation exposing a residential sewer lateral pipe connection" → "Open excavation exposing underground utility pipes and connections during a pipe replacement" (the found photo is a general underground-pipe excavation, not specifically a residential sewer lateral).
- **conduit-installation** — from "Lengths of PVC and HDPE conduit staged in an open utility trench before backfilling" → "Bundled lengths of grey PVC conduit staged on site before installation" (the found photo shows conduit staged on the ground, not yet in a trench).
- **foundation-repair** — from "Vertical carbon-fiber reinforcement straps bonded to a cracked concrete-block foundation wall" → "Structural cracks running across a concrete wall." **Note:** this image depicts the *condition* (a structural crack) foundation repair addresses, **not** the repair hardware. It is honest and relevant, but if B-14 prefers to show the actual repair method, this service should move to the diagram/paid-photo track. Flagged for the reviewer.

---

## Per-service gap notes (what was searched, why nothing qualified)

All searches used Pexels + Pixabay (and Unsplash for sump pumps), landscape filter, and always scrolled past Pixabay's **iStock Sponsored** (paid) rows to the free "Royalty-free images" section.

- **basement-waterproofing** — "foundation waterproofing" → generic foundation-pour construction; "waterproofing membrane" → roofs, fabric, gutters. No interior drain-tile or exterior foundation membrane on free stock.
- **sump-pumps** — "sump pump" → farm/irrigation hand pumps; "sump pump basement" → unfinished basements + farm pumps; Unsplash → gas transfer pumps, industrial pumps, one likely-AI product render; Pixabay free → hand pumps. Accurate basement sump-pump-in-pit shots were all iStock Sponsored (paid).
- **crawl-spaces** — "crawl space encapsulation" → a person at an exterior vent, plus irrelevant images; Pixabay "crawl space" free → snails and frogs. Accurate vapor-barrier encapsulation interiors were all iStock Sponsored (paid).
- **window-wells** — "window well" → interior windows and yoga; Pixabay "egress window well" free → a kitten and a church window. Accurate corrugated egress wells were all iStock Sponsored (paid).
- **concrete-raising** — "concrete leveling mudjacking" → wet-concrete finishing/screeding (pouring new concrete), which is the wrong process (raising = lifting a settled slab by injection).
- **humidity-control** — "dehumidifier" (Pexels) → air-conditioner control panels and air purifiers (top hit literally titled "air conditioner control panel"); Pixabay → zero free results. No clear basement dehumidifier.
- **radon-mitigation** — "radon mitigation pipe" → generic HVAC/plumbing pipe runs, not a radon vent system (white PVC riser + inline fan).

**Pattern:** free-license stock reliably covers **broad outdoor construction/excavation** (open trenches, staged pipe, gutters on a facade, a concrete crack) but **not** residential **interior/appliance/buried-utility specialties** (sump pit, crawl encapsulation, dehumidifier, egress well, radon riser, pull-box vault, foundation-repair hardware). Those exist almost exclusively as paid iStock. Recommendation for the gap services: labeled diagrams (cheapest, on-brand) or real Sunset photos when available; paid stock only if a specific page truly needs a photo before real photography lands.

---

## Diagram needed

Takes **no stock photo**; ships with a labeled cutaway diagram (follow-up phase).

- **Missile Boring** (`/trenchless/missile-boring`) — pneumatic piercing tool works underground/in-pit; free "boring" results are HDD rigs (wrong equipment). *(B-13.)*
- **HDPE Pipe Fusing** (`/trenchless/pipe-fusing`) — accurate butt-fusion machine imagery scarce on free stock; near-neighbors (steel-pipe welding, PEX) misrepresent the process. *(B-13.)* **→ superseded by B-16:** a genuine butt-fusion machine joining PE pipe was sourced (Pexels 9389356); the diagram is no longer required for this page.
- **Handhole / Pull Box** (`/trenchless/handhole-pull-box`) — **resolved to diagram in B-13b.** **→ superseded by B-16:** an honest ground-level utility enclosure with conduit was sourced (Pexels 3964849) under the relaxed ladder (T2). No accurate free-license open pull-box/vault-with-conduit image; the niche buried-utility category is iStock-Sponsored (paid) only, consistent with sump pit / crawl encapsulation / egress well / radon riser. B-13 pre-flagged it low-confidence. *(The dedicated pull-box search was cut short by a transient Chrome disconnect; the determination rests on the conclusive category pattern. If a genuine free image later surfaces, it can replace the diagram.)*

*Also effectively "diagram-or-paid-photo needed" (Waterproofing, from the gap notes above): basement-waterproofing, sump-pumps, window-wells, crawl-spaces, concrete-raising, humidity-control, radon-mitigation.*

---

## Snow Removal — image table (B-15)

**Snow Removal** (`/snow-removal/<slug>`): de-icing, sidewalk-shoveling, driveway-snow-removal, commercial-snow-plowing. Plus the **`/snow-removal/` division landing hero**. English routes are unprefixed; Spanish equivalents live at `/es/…` and reuse the same image asset.

**Download-pass result (B-15):** 5 of 5 sourced, license-verified, non-AI-confirmed, visually inspected, saved. All from Pexels (Pexels License, no attribution required; photographer + page URL logged anyway). All landscape, all ≥ 2400 px wide (four at 4239–6000 px; the landing hero at 2995 px). All 5 are visually distinct scenes — no two pages share an image. No AI-generated label appeared on any source page; every photographer has a real profile/portfolio.

| Filename | Target page | Role | Source page URL | Photographer | License | Download date | Alt text | Replace by |
|---|---|---|---|---|---|---|---|---|
| `stock-snow-removal-de-icing-hero-01.jpg` | `/snow-removal/de-icing` | hero | https://www.pexels.com/photo/macro-photography-of-crystal-salt-3693293/ | Castorly Stock | Pexels License | 2026-07-04 | Close-up of coarse rock-salt crystals scattered across a dark surface — the granular material spread to de-ice snow- and ice-covered pavement. | 2027-01-31 |
| `stock-snow-removal-sidewalk-shoveling-hero-01.jpg` | `/snow-removal/sidewalk-shoveling` | hero | https://www.pexels.com/photo/snow-clearing-27306418/ | Sergei Starostin | Pexels License | 2026-07-04 | A person in a hooded winter coat shoveling deep snow from a walkway beside a house. | 2027-01-31 |
| `stock-snow-removal-driveway-snow-removal-hero-01.jpg` | `/snow-removal/driveway-snow-removal` | hero | https://www.pexels.com/photo/winter-snow-removal-in-toronto-suburb-30731980/ | Anurag Jamwal | Pexels License | 2026-07-04 | A person operating a two-stage snow blower to clear deep snow from a residential driveway. | 2027-01-31 |
| `stock-snow-removal-commercial-snow-plowing-hero-01.jpg` | `/snow-removal/commercial-snow-plowing` | hero | https://www.pexels.com/photo/snow-plow-truck-clearing-winter-roadway-35826492/ | Cara Denison | Pexels License | 2026-07-04 | A plow truck with a front plow blade clearing snow from an open paved area during heavy snowfall. | 2027-01-31 |
| `stock-snow-removal-division-landing-hero-01.jpg` | `/snow-removal/` (division landing) | hero | https://www.pexels.com/photo/snow-pathway-near-at-houses-774485/ | Frank Taylor | Pexels License | 2026-07-04 | A snow-covered suburban residential street lined with houses and parked cars after a winter snowfall. | 2027-01-31 |

**Dimensions & non-AI check (per image):**
- `de-icing` — 6000 × 4000, landscape. Photographer *Castorly Stock* (prolific real Pexels contributor). No AI label on source page.
- `sidewalk-shoveling` — 6000 × 4000, landscape. Photographer *Sergei Starostin* (real profile; already the source of two Trenchless bridge images in this manifest). No AI label.
- `driveway-snow-removal` — 6000 × 4000, landscape. Photographer *Anurag Jamwal* (real profile). No AI label. Source titled "winter snow removal in Toronto suburb" — North American suburban context.
- `commercial-snow-plowing` — 4239 × 2825, landscape. Photographer *Cara Denison* (real profile; winter-storm series). No AI label. Only markings on the truck are a fleet unit number ("452") and a faint plow-blade maker stamp — no business/brand decals, no readable plate.
- `division-landing` — 2995 × 2448, landscape. Photographer *Frank Taylor* (real profile; low photo-id → pre-AI-era upload). No AI label. Wide suburban street scene, deliberately distinct from the plow-truck image (#4).

## Alt-text adjustments made during the Snow Removal pass (B-15)

Each draft alt from the B-15 brief was tightened to describe exactly what the downloaded photo shows (still generic — never "Sunset", never a city, never implied attribution):

- **de-icing** — from "Granular de-icing salt being spread across a snow-and-ice-covered paved surface" → "Close-up of coarse rock-salt crystals scattered across a dark surface — the granular material spread to de-ice snow- and ice-covered pavement." **Why:** an accurate free-license photo of salt *being spread* (hand/spreader/truck) does not exist without a rule violation (see de-icing note below), so this ships a truthful close-up of the de-icing **material** rather than the action. Flagged for the replacement pass to swap in a real Sunset de-icing action photo.
- **sidewalk-shoveling** — from "A person shoveling fresh snow from a paved sidewalk after a snowfall" → "A person in a hooded winter coat shoveling deep snow from a walkway beside a house" (the found photo shows a walkway beside a house, not a clearly paved public sidewalk).
- **driveway-snow-removal** — from "A snow blower clearing deep snow from a residential driveway" → "A person operating a two-stage snow blower to clear deep snow from a residential driveway" (the operator is in frame; specifying the machine type is more accurate).
- **commercial-snow-plowing** — from "A plow truck clearing accumulated snow from a commercial parking lot" → "A plow truck with a front plow blade clearing snow from an open paved area during heavy snowfall" (the scene is an open snow-covered area/roadway in a storm, not identifiably a parking lot).
- **division-landing** — from "A freshly cleared driveway bordered by deep snow in a suburban neighborhood in winter" → "A snow-covered suburban residential street lined with houses and parked cars after a winter snowfall" (the found photo is a wide snowy suburban street, not a single cleared driveway; it works as an establishing winter-neighborhood hero and is clearly distinct from the plow-truck image).

## De-icing note (in-phase decision, surfaced to Chat — not self-ratified)

The de-icing subject was the one hard case. After ~15 searches across Pexels, Unsplash and Pixabay, **no clean, accurate, landscape, logo-free free-license photo of de-icing salt *being spread* exists.** The options each broke a binding rule: the most accurate action shot (a person hand-spreading blue ice-melt on a suburban walkway) is **portrait**; salt-spreader trucks carry **readable brand decals** (e.g. "GENGRAS") or read as **European**; and the clean coarse-salt close-ups on free stock are titled/styled as **culinary "sea salt."** The accurate action shots were consistently **iStock Sponsored (paid)** — the same paid-only pattern B-13b documented for niche subjects. Per the binding accuracy rule (*an inaccurate photo is worse than none*), none of the rule-breaking options was settled. Goran was asked in Chat and chose to ship a **coarse rock-salt material close-up** (rock salt = the de-icing material) with honest, material-focused alt text, keeping all 5 pages covered, rather than leave de-icing as a gap. This is the honest floor for that page until a real Sunset de-icing photo lands at the 2027-01-31 replacement.

---

## B-16 — Hardscape + gap-services sourcing pass (Cowork, 2026-07-04)

**Pass:** B-16 Cowork. **Downloads executed:** 2026-07-04. **Replace-by date (all B-16 images):** **2026-10-01**.

**Rule change (operator decision 2026-07-04):** the B-13b "exact subject or nothing" rule is **superseded for this pass**. The previously GAP/diagram waterproofing + trenchless services and the 4 new hardscape services get the **closest honest free-license image** via a three-tier acceptance ladder (T1 exact subject · T2 honest adjacent subject/material/setting · T3 the condition the service addresses). The truthfulness safeguard lives entirely in the **alt text**, which describes exactly what each photo shows — never the service name when the photo shows something adjacent. `missile-boring` stays on the diagram track (out of scope).

**Result: 14 of 15 sourced** (4 Hardscape · 7 Waterproofing incl. division hero · 3 Trenchless incl. division hero). **`sump-pumps` remains a documented GAP** — after exhausting Pexels (sump pump / submersible pump / flooded basement / water on concrete floor), Unsplash, and Pixabay, the accurate sump-pump-in-basin exists only as **iStock Sponsored (paid)**; the T3 "standing water on a floor" fallback yielded only dry-concrete textures, outdoor floods, a Canva AI-generated ad tile, or people-dominated shots. Nothing acceptable; not settled per the never-wrong-object rule. All 14 sourced images: **Pexels License, non-AI-confirmed** (real photographer profiles, no AI label), **landscape, ≥ 1600 px wide** (all 3464–9000 px). **No two B-16 images share a photo, and none duplicates the 11 already-integrated bridge images (md5-verified).**

### Hardscape — image table (new folder `docs/stock-bridge/hardscape/`)

| Filename | Target page | Role | Source page URL | Photographer | License | Download date | Alt text | Replace by |
|---|---|---|---|---|---|---|---|---|
| `stock-hardscape-retaining-walls-hero-01.jpg` | `/hardscape/retaining-walls` | hero | https://www.pexels.com/photo/modern-circular-stone-patio-in-coesfeld-park-38220910/ | Se Ka Wa | Pexels License | 2026-07-04 | A curved segmental-block retaining wall with capstone coping and stone steps enclosing a circular paver patio, edged by shrubs and hedges. | 2026-10-01 |
| `stock-hardscape-fire-pits-features-hero-01.jpg` | `/hardscape/fire-pits-features` | hero | https://www.pexels.com/photo/an-empty-fire-pit-surrounded-with-brown-wooden-bench-during-daytime-13871296/ | Matheus Bertelli | Pexels License | 2026-07-04 | A built stone-clad rectangular fire pit on a flagstone patio, ringed by fixed wooden bench seating under a timber pergola. | 2026-10-01 |
| `stock-hardscape-driveways-hero-01.jpg` | `/hardscape/driveways` | hero | https://www.pexels.com/photo/concrete-tiles-modern-design-building-8134850/ | Max Vakhtbovych | Pexels License | 2026-07-04 | A wide interlocking-paver driveway with dark border insets leading up to the garage and entrance of a modern two-story home. | 2026-10-01 |
| `stock-hardscape-outdoor-kitchens-hero-01.jpg` | `/hardscape/outdoor-kitchens` | hero | https://www.pexels.com/photo/modern-outdoor-kitchen-in-new-orleans-backyard-30725657/ | Chad Populis | Pexels License | 2026-07-04 | A built-in outdoor kitchen with a stainless grill, sink, and beverage fridge set into cabinetry under a wood-clad covered patio, beside a fenced lawn. | 2026-10-01 |

### Waterproofing — image table (B-16 additions)

| Filename | Target page | Role | Source page URL | Photographer | License | Download date | Alt text | Replace by |
|---|---|---|---|---|---|---|---|---|
| `stock-waterproofing-division-landing-hero-01.jpg` | `/waterproofing/` (division landing) | hero | https://www.pexels.com/photo/spacious-modern-basement-with-neutral-design-35493889/ | Peter Vang | Pexels License | 2026-07-04 | A clean, dry, well-lit finished basement with neutral painted walls, carpeted floor, and a staircase in the background. | 2026-10-01 |
| `stock-waterproofing-basement-waterproofing-hero-01.jpg` | `/waterproofing/basement-waterproofing` | hero | https://www.pexels.com/photo/grey-concrete-wall-2969398/ | Tim Mossholder | Pexels License | 2026-07-04 | Pale mineral streaks left by water tracking down the surface of a weathered concrete wall. | 2026-10-01 |
| `stock-waterproofing-window-wells-hero-01.jpg` | `/waterproofing/window-wells` | hero | https://www.pexels.com/photo/photograph-of-an-alley-with-brick-walls-10315684/ | Brixiv | Pexels License | 2026-07-04 | Low windows with stone sills set near ground level in the brick exterior walls of a building light-well. | 2026-10-01 |
| `stock-waterproofing-crawl-spaces-hero-01.jpg` | `/waterproofing/crawl-spaces` | hero | https://www.pexels.com/photo/home-inspector-examining-crawl-space-outdoors-32497163/ | Kathleen Austin Kuhn | Pexels License | 2026-07-04 | An open crawl-space access hatch at the base of a home's shingled exterior wall, with a person crouched beside the opening. | 2026-10-01 |
| `stock-waterproofing-concrete-raising-hero-01.jpg` | `/waterproofing/concrete-raising` | hero | https://www.pexels.com/photo/fallen-flowers-on-concrete-pavement-15022593/ | Nikita Nikitin | Pexels License | 2026-07-04 | A cracked and crazed concrete pavement surface strewn with fallen yellow flower petals. | 2026-10-01 |
| `stock-waterproofing-humidity-control-hero-01.jpg` | `/waterproofing/humidity-control` | hero | https://www.pexels.com/photo/dew-on-window-pane-19036119/ | Olga Kovalski | Pexels License | 2026-07-04 | Heavy condensation and running water droplets covering the interior surface of a window pane. | 2026-10-01 |
| `stock-waterproofing-radon-mitigation-hero-01.jpg` | `/waterproofing/radon-mitigation` | hero | https://www.pexels.com/photo/a-white-wall-with-a-pipe-sticking-out-of-it-27363812/ | Jan van der Wolf | Pexels License | 2026-07-04 | A grey-white PVC vent pipe protruding from the white stucco exterior wall of a building against a clear blue sky. | 2026-10-01 |
| _sump-pumps_ | `/waterproofing/sump-pumps` | hero | **GAP — still not sourced after B-16** | — | — | 2026-07-04 | (unwritten — accurate subject paid-only across all three sources; T3 fallback unacceptable) | — |

### Trenchless — image table (B-16 additions)

| Filename | Target page | Role | Source page URL | Photographer | License | Download date | Alt text | Replace by |
|---|---|---|---|---|---|---|---|---|
| `stock-trenchless-division-landing-hero-01.jpg` | `/trenchless/` (division landing) | hero | https://www.pexels.com/photo/workers-drilling-a-horizontal-borehole-under-the-street-4330959/ | Denniz Futalan | Pexels License | 2026-07-04 | A tracked horizontal directional drilling rig boring beneath a street while workers handle drill rods on the ground beside it. | 2026-10-01 |
| `stock-trenchless-handhole-pull-box-hero-01.jpg` | `/trenchless/handhole-pull-box` | hero | https://www.pexels.com/photo/industrial-power-cabinet-installed-on-street-3964849/ | ready made | Pexels License | 2026-07-04 | A ground-mounted grey utility power cabinet against a brick wall, with thick black conduits rising from the ground beside it. | 2026-10-01 |
| `stock-trenchless-pipe-fusing-hero-01.jpg` | `/trenchless/pipe-fusing` | hero | https://www.pexels.com/photo/a-person-holding-yellow-pipes-9389356/ | Jan Zakelj | Pexels License | 2026-07-04 | A gloved worker aligning a length of yellow polyethylene pipe clamped in a hydraulic butt-fusion machine for joining. | 2026-10-01 |

### Dimensions & non-AI check (per B-16 image)

- `hardscape/retaining-walls` — 8256 × 5504, landscape. Se Ka Wa (username `strannik-sk`; real profile). No AI label. **Tier T1.** People-free.
- `hardscape/fire-pits-features` — 5472 × 3648, landscape. Matheus Bertelli (real, level-10 contributor). No AI label. **Tier T1.** People-free (incidental camper van in background, no readable plate/logo).
- `hardscape/driveways` — 6888 × 4597, landscape. Max Vakhtbovych (real, prolific interior/exterior). No AI label. **Tier T1.** People-free.
- `hardscape/outdoor-kitchens` — 7946 × 5300, landscape. Chad Populis (real profile). No AI label. **Tier T1.** People-free.
- `waterproofing/division-landing` — 5057 × 3793, landscape. Peter Vang (real profile). No AI label. **Tier T3** (clean dry finished basement — the "after").
- `waterproofing/basement-waterproofing` — 9000 × 6001, landscape. Tim Mossholder (real, prolific). No AI label. **Tier T3** (water intrusion on concrete).
- `waterproofing/window-wells` — 6192 × 4128, landscape. Brixiv (real profile). No AI label. **Tier T2** (basement/grade-level windows, exterior).
- `waterproofing/crawl-spaces` — 5472 × 3648, landscape. Kathleen Austin Kuhn (real profile). No AI label. **Tier T1/T3** (crawl-space access opening; person crouched side-on/face down — incidental, B-15 precedent).
- `waterproofing/concrete-raising` — 4080 × 2720, landscape. Nikita Nikitin (real profile). No AI label. **Tier T3** (ratified condition photo — cracked concrete pavement).
- `waterproofing/humidity-control` — 3872 × 2592, landscape. Olga Kovalski (real profile). No AI label. **Tier T2** (condensation on interior window pane).
- `waterproofing/radon-mitigation` — 6000 × 4000, landscape. Jan van der Wolf (real profile). No AI label. **Tier T2** (white PVC vent piping on exterior; **alt deliberately does NOT claim "radon"**).
- `trenchless/division-landing` — 3464 × 2309, landscape. Denniz Futalan (real profile). No AI label. **Tier T1** (HDD rig boring under a street; workers back/side-on, incidental, no face-as-subject).
- `trenchless/handhole-pull-box` — 4240 × 2832, landscape. ready made (real profile). No AI label. **Tier T2** (ground-mounted utility enclosure with conduit).
- `trenchless/pipe-fusing` — 4104 × 2736, landscape. Jan Zakelj (real profile). No AI label. **Tier T1** (butt-fusion machine joining PE pipe; gloved hands/legs only, no face).

### Tiers used & in-flight judgment calls (B-16)

- **Tier 1 (exact subject):** retaining-walls, fire-pits-features, driveways, outdoor-kitchens, crawl-spaces (access scene), trenchless division-landing (HDD rig), pipe-fusing (butt-fusion machine).
- **Tier 2 (honest adjacent):** window-wells (grade-level exterior basement windows — corrugated wells were paid-only), humidity-control (interior window condensation — dehumidifiers were paid/wrong-object), radon-mitigation (white PVC vent on exterior — radon fan systems were paid), handhole-pull-box (ground utility enclosure with conduit — flush in-ground handholes were paid-only).
- **Tier 3 (the condition):** waterproofing division-landing (clean dry basement), basement-waterproofing (water-tracking/efflorescence on concrete), concrete-raising (cracked concrete pavement — ratified condition-photo lead).
- **Source fallbacks used:** Pexels for all 14; Unsplash + Pixabay additionally exhausted for `sump-pumps` (still GAP).
- **Rejections logged:** `sump-pumps` T3 candidates rejected — dry cracked-concrete texture (photo 6711845, not water), a Canva AI-generated ad tile (AI), feet-in-a-puddle (person-as-subject, photo 6093747); the `handhole-pull-box` open-pit shot (photo 29274530) rejected as a **duplicate of the existing sewer-line-replacement bridge image**; two B&W "pipe pattern" abstracts (36251868 / 36176253) rejected for `pipe-fusing` (ambiguous plastic-vs-metal, could read as steel); a portrait chair-and-wall shot (15676406) rejected for `retaining-walls` (portrait + wall not the subject).
- **People-in-frame (per B-15 incidental precedent):** crawl-spaces (crouched inspector, face in profile/down, not the subject), trenchless division-landing (workers back/side-on), pipe-fusing (gloved hands/legs, no face). All engaged in the work; the equipment/scene is the subject in each.

---

## Change log
- 2026-07-03 (B-13) — Manifest created with enumerated pages, filenames, alt text, per-image sourcing briefs, diagram-needed analysis.
- 2026-07-03 (B-13b) — Download pass executed: 6 heroes sourced/verified/saved; 7 waterproofing services flagged as gaps; handhole moved to diagram; alt text adjusted per what was actually found; status set to "Downloads complete."
- 2026-07-04 (B-15) — Snow Removal sourcing pass: 5 heroes sourced/verified/saved (de-icing, sidewalk-shoveling, driveway-snow-removal, commercial-snow-plowing, division-landing), all Pexels License, non-AI, landscape ≥2400 px, visually distinct. De-icing resolved to a coarse rock-salt material close-up per a Chat decision (accurate action shot unavailable on free stock). Replace-by 2027-01-31 for all 5. Integration pending B-15-Code.
- 2026-07-04 (B-15 Code) — Integration executed. The 5 source photos optimized into `src/assets/service/hero-{de-icing,sidewalk-shoveling,driveway-snow-removal,commercial-snow-plowing}.jpg` + matching `tiles/` derivatives + `src/assets/division/hero-snow-removal.jpg` (16:9 2400×1350, all < 400 KB), wired via slug-keyed `SERVICE_HERO`/`SERVICE_TILE` + a new `DIVISION_HERO` map. The 4 snow services dropped their `snow-removal`/`commercial-snow-removal` `imageKey` aliases and gained manifest-verbatim `photoAlt`; the landing-hero alt moved to `division.snow-removal.hero.alt`. The pre-existing shared `hero-snow-removal.jpg` / `hero-commercial-snow-removal.jpg` + their tiles + project tiles were left byte-identical (still serve st-charles + city grids + blog/resource). See `src/_project-state/Phase-B-15-Code-Completion.md`.
- 2026-07-04 (B-16 Cowork) — Hardscape + gap-services sourcing pass. **14 of 15** bridge images sourced/verified/saved under the relaxed three-tier acceptance ladder (operator decision 2026-07-04, superseding the B-13b "exact subject or nothing" rule for these pages): 4 Hardscape (retaining-walls, fire-pits-features, driveways, outdoor-kitchens) → new `docs/stock-bridge/hardscape/`; 7 Waterproofing (division-landing hero, basement-waterproofing, window-wells, crawl-spaces, concrete-raising, humidity-control, radon-mitigation) → `docs/stock-bridge/waterproofing/`; 3 Trenchless (division-landing hero, handhole-pull-box, pipe-fusing) → `docs/stock-bridge/trenchless/`. All Pexels License, non-AI, landscape, ≥1600 px (3464–9000 px), md5-unique. **`sump-pumps` left as a documented GAP** (accurate subject paid-only across Pexels/Unsplash/Pixabay; T3 fallback unacceptable). Superseded B-13b GAP/diagram rows annotated (append-only) above; `missile-boring` untouched. Replace-by 2026-10-01 for all 14. **Integration pending Phase B-16 Code — do not start it until this branch merges to `main`.** See `src/_project-state/Phase-B-16-Cowork-Completion.md`.
- 2026-07-04 (B-16 Code) — Integration executed for **12 of the 14** sourced images: 11 service hero+tile pairs (`retaining-walls`, `fire-pits-features`, `driveways`, `outdoor-kitchens` — overwritten in place, originals preserved in `src/assets/service/legacy/`; `basement-waterproofing`, `window-wells`, `crawl-spaces`, `concrete-raising`, `humidity-control`, `radon-mitigation`, `pipe-fusing` — new slug-keyed derivatives) + the `/waterproofing/` division-landing hero (`src/assets/division/hero-waterproofing.jpg`), all 16:9 2400×1350 heroes < 400 KB / 4:3 1200×900 tiles, wired via `SERVICE_HERO`/`SERVICE_TILE`/`DIVISION_HERO` with manifest-verbatim EN `photoAlt` + drafted ES. **Two sourced images REJECTED at Code-phase verification** (never-acceptable readable/geolocating text, missed at cowork QA full-frame scale): `stock-trenchless-division-landing-hero-01.jpg` — the red shirt's print reads "BARANGAY AYALA ALABANG / FIBER OPTIC PROJECT" at hero scale (geolocates to the Philippines; same class as B-15's rejected "GENGRAS" decal); `stock-trenchless-handhole-pull-box-hero-01.jpg` — three readable Russian signs ("О ПОЖАРЕ ЗВОНИТЬ 101, 112", "ПГ" hydrant marker, "ВЕДЕТСЯ ВИДЕОНАБЛЮДЕНИЕ"). Both pages keep their previous imagery/alt (handhole keeps its `property-enhancement` alias, `/trenchless/` keeps its audience-alias hero); both sources stay archived here for the record. Re-sourcing is a Chat call. See `src/_project-state/Phase-B-16-Code-Completion.md`.
