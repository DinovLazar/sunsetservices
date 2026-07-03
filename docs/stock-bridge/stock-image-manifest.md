# Stock-bridge image manifest — Waterproofing & Trenchless

**Phase:** B-13 · Cowork — Stock-bridge imagery
**Created:** 2026-07-03
**Status:** Sourcing briefs ready · downloads pending (executed against this manifest)
**Replacement-by date (every image):** **2026-10-01** — after this date, authentic Sunset photography replaces all bridge images.

> These are **temporary bridge images** under Brand Guide §9.1/§9.3. Every file carries the mandatory `stock-` prefix so it stays permanently distinguishable from real Sunset project photos. Alt text is generic and truthful — it never names Sunset, never names a city, never implies the work is Sunset's. See the 2026-07-03 decisions-log entry for the plan-of-record. Repo integration is a later Code phase (B-14); **no `.tsx`/`.ts`/`.json` file is touched here.**

---

## How this manifest is used (docs-first split)

The sourcing briefs, alt text, filenames, target pages, and replacement dates below are **complete now**. The four download-time columns — **Source page URL**, **Photographer**, **License**, **Download date** — are marked `⟨fill on download⟩` and are completed by whoever performs the actual downloads, one line per image, at the moment each JPG is saved. Do **not** invent or pre-fill these; record exactly what the image's own page shows.

**Per image, at download time:**
1. Search the approved sources with the brief's search terms.
2. Open the candidate image's **own page** (not a search-results thumbnail).
3. Confirm it is a **photograph, not AI-generated** — all three sites label AI content; if it isn't clearly marked as a photo, skip it.
4. Confirm the license shown: **Unsplash License / Pexels License / Pixabay Content License**.
5. Run the visual-hygiene + accuracy checks in the brief. If it fails, try the next candidate.
6. Download the JPG (hero ≥1600 px wide, landscape, prefer 2000+; support ≥1200 px), save it under the given filename in the given subfolder.
7. Fill the row's four `⟨fill on download⟩` cells with the image page URL, photographer name, license name, and the download date.

**Binding sourcing rules (recap):** Unsplash / Pexels / Pixabay only. No AI images. Accuracy over aesthetics — the image must show the *actual* service (for trenchless, the *actual* equipment). No watermarks; no third-party company logos, branded uniforms, or vehicle branding; avoid identifiable faces; no street numbers/identifying property details; nothing that implies a location. JPG preferred.

---

## Enumerated target pages (authoritative)

Base (preview): `https://sunsetservices.vercel.app` · Production: `https://sunsetservices.us`
English routes are unprefixed (`localePrefix: 'as-needed'`, `defaultLocale: 'en'`). Spanish equivalents live at `/es/…` and reuse the same image asset.

**Waterproofing — 10 service pages** (`/waterproofing/<slug>`)

1. `/waterproofing/basement-waterproofing` — Basement Waterproofing
2. `/waterproofing/foundation-repair` — Foundation Repair
3. `/waterproofing/sump-pumps` — Sump Pumps
4. `/waterproofing/yard-drainage` — Yard Drainage
5. `/waterproofing/gutter-services` — Gutter Services
6. `/waterproofing/window-wells` — Window Wells
7. `/waterproofing/crawl-spaces` — Crawl Spaces
8. `/waterproofing/concrete-raising` — Concrete Raising
9. `/waterproofing/humidity-control` — Humidity Control
10. `/waterproofing/radon-mitigation` — Radon Mitigation

**Trenchless & Directional Boring — 6 service pages** (`/trenchless/<slug>`)

1. `/trenchless/conduit-installation` — Conduit Installation
2. `/trenchless/trenching-excavation` — Trenching & Excavation
3. `/trenchless/sewer-line-replacement` — Sewer Line Replacement
4. `/trenchless/missile-boring` — Missile Boring → **diagram needed** (see below)
5. `/trenchless/handhole-pull-box` — Handhole / Pull Box Installation → **source low-confidence, else diagram**
6. `/trenchless/pipe-fusing` — HDPE Pipe Fusing → **diagram needed** (see below)

---

## Waterproofing — image table

| Filename | Target page | Role | Source page URL | Photographer | License | Download date | Alt text | Replace by |
|---|---|---|---|---|---|---|---|---|
| `stock-waterproofing-basement-waterproofing-hero-01.jpg` | `/waterproofing/basement-waterproofing` | hero | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | Interior perimeter drain-tile channel running along the base of a poured-concrete basement wall toward a sump basin. | 2026-10-01 |
| `stock-waterproofing-basement-waterproofing-support-01.jpg` | `/waterproofing/basement-waterproofing` | support | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | Peel-and-stick waterproofing membrane applied to an exterior foundation wall in an open excavation. | 2026-10-01 |
| `stock-waterproofing-foundation-repair-hero-01.jpg` | `/waterproofing/foundation-repair` | hero | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | Vertical carbon-fiber reinforcement straps bonded to a cracked concrete-block foundation wall. | 2026-10-01 |
| `stock-waterproofing-foundation-repair-support-01.jpg` | `/waterproofing/foundation-repair` | support | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | Steel push-pier bracket anchored to a concrete footing during a foundation-stabilization repair. | 2026-10-01 |
| `stock-waterproofing-sump-pumps-hero-01.jpg` | `/waterproofing/sump-pumps` | hero | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | Submersible sump pump seated in a basement sump basin with a PVC discharge line and a sealed lid. | 2026-10-01 |
| `stock-waterproofing-sump-pumps-support-01.jpg` | `/waterproofing/sump-pumps` | support | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | Battery-backup sump pump unit mounted beside a primary pump in a basement sump pit. | 2026-10-01 |
| `stock-waterproofing-yard-drainage-hero-01.jpg` | `/waterproofing/yard-drainage` | hero | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | Perforated French-drain pipe laid in a gravel-filled trench across a residential yard before backfilling. | 2026-10-01 |
| `stock-waterproofing-gutter-services-hero-01.jpg` | `/waterproofing/gutter-services` | hero | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | Aluminum rain gutter and downspout mounted along a residential roof eave. | 2026-10-01 |
| `stock-waterproofing-window-wells-hero-01.jpg` | `/waterproofing/window-wells` | hero | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | Corrugated metal window well around a below-grade basement window with a gravel drainage base. | 2026-10-01 |
| `stock-waterproofing-crawl-spaces-hero-01.jpg` | `/waterproofing/crawl-spaces` | hero | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | Crawl-space floor and walls lined with a white vapor-barrier membrane sealed at the seams. | 2026-10-01 |
| `stock-waterproofing-concrete-raising-hero-01.jpg` | `/waterproofing/concrete-raising` | hero | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | Injection ports drilled into a sunken concrete slab section for foam-jacking leveling. | 2026-10-01 |
| `stock-waterproofing-humidity-control-hero-01.jpg` | `/waterproofing/humidity-control` | hero | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | Basement dehumidifier unit with a condensate drain line routed toward a sump pit. | 2026-10-01 |
| `stock-waterproofing-radon-mitigation-hero-01.jpg` | `/waterproofing/radon-mitigation` | hero | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | Radon-mitigation system with a white PVC vent pipe and inline fan routed up an exterior house wall. | 2026-10-01 |

**Waterproofing planned count:** 10 heroes (one per page) + 3 optional supports (basement, foundation, sump) = **13 images max.** Supports are only downloaded if a genuinely additive, accurate shot is found; if not, drop the support row — the hero alone ships.

---

## Trenchless — image table

| Filename | Target page | Role | Source page URL | Photographer | License | Download date | Alt text | Replace by |
|---|---|---|---|---|---|---|---|---|
| `stock-trenchless-conduit-installation-hero-01.jpg` | `/trenchless/conduit-installation` | hero | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | Lengths of PVC and HDPE conduit staged in an open utility trench before backfilling. | 2026-10-01 |
| `stock-trenchless-trenching-excavation-hero-01.jpg` | `/trenchless/trenching-excavation` | hero | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | Compact excavator digging a straight open utility trench in a residential yard. | 2026-10-01 |
| `stock-trenchless-sewer-line-replacement-hero-01.jpg` | `/trenchless/sewer-line-replacement` | hero | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | Open excavation exposing a residential sewer lateral pipe connection for replacement. | 2026-10-01 |
| `stock-trenchless-sewer-line-replacement-support-01.jpg` | `/trenchless/sewer-line-replacement` | support | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | Sewer inspection camera cable feeding into an underground drain line. | 2026-10-01 |
| `stock-trenchless-handhole-pull-box-hero-01.jpg` | `/trenchless/handhole-pull-box` | hero (low-confidence) | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | ⟨fill on download⟩ | Open underground pull box with electrical conduit entering the vault along a utility run. | 2026-10-01 |

**Trenchless planned count:** 3 heroes with expected genuine hits (conduit, trenching, sewer) + 1 optional sewer support + 1 low-confidence hero (handhole). **Missile Boring and HDPE Pipe Fusing take no photo — see "Diagram needed."** If the handhole hero fails its accuracy check, delete its row and move handhole to the diagram-needed list.

---

## Sourcing briefs

Each brief gives **search terms**, **what qualifies** (download only if all true), and **what to reject**. Try the terms across all three sources before concluding a service can't be sourced.

### Waterproofing

**basement-waterproofing — hero + optional support**
- Search: `interior drain tile basement`, `basement waterproofing`, `foundation drainage channel`, `weeping tile installation`. Support: `exterior foundation waterproofing membrane`, `foundation wall membrane`.
- Qualifies: shows a real basement/foundation waterproofing element — perimeter drain channel, sump tie-in, or (support) a dark peel-and-stick membrane on an exterior wall in an excavation.
- Reject: staged "flooded basement" stock, mold close-ups, anything that reads as a cleaning ad, visible contractor logos.

**foundation-repair — hero + optional support**
- Search: `carbon fiber foundation repair`, `foundation crack repair`, `bowing basement wall reinforcement`. Support: `push pier foundation`, `helical pier bracket`, `steel foundation brace`.
- Qualifies: shows structural reinforcement of a foundation wall (carbon-fiber straps, steel I-beam brace) or a pier bracket on a footing.
- Reject: generic cracked-wall photos with no repair shown; new-construction foundation pours (that's not repair); house-exterior stock.

**sump-pumps — hero + optional support**
- Search: `sump pump basement`, `sump pit`, `submersible sump pump`. Support: `battery backup sump pump`, `dual sump pump`.
- Qualifies: a pump sitting in a basin/pit with visible discharge piping; support shows a clear secondary/backup unit.
- Reject: product-only white-background catalog shots that look like a retailer listing (borderline — acceptable only if clearly a photograph, no logo, no price overlay); pond/pool pumps.

**yard-drainage — hero**
- Search: `french drain installation`, `drainage trench gravel pipe`, `perforated drain pipe yard`, `yard drainage`.
- Qualifies: perforated pipe in a gravel trench, or a graded drainage trench across a lawn.
- Reject: storm-drain grates on public streets; agricultural tile at field scale; flooded-yard "before" shots with no drainage element.

**gutter-services — hero**
- Search: `rain gutter downspout`, `gutter installation`, `roof eavestrough`, `seamless gutter`.
- Qualifies: a residential gutter and/or downspout clearly on a house eave.
- Reject: clogged-gutter-with-leaves cleaning shots (acceptable only if it still reads as gutter *service*, no face, no logo); commercial-roof scuppers.

**window-wells — hero**
- Search: `window well basement`, `egress window well`, `corrugated window well`.
- Qualifies: a metal or composite window well around a below-grade window, ideally with gravel base or a cover.
- Reject: interior-only basement window shots; decorative garden-window stock.

**crawl-spaces — hero**
- Search: `crawl space encapsulation`, `vapor barrier crawl space`, `crawl space liner`.
- Qualifies: crawl-space floor/walls lined with a light vapor barrier, seams visible.
- Reject: dirt-only crawl spaces with no encapsulation; attic-insulation shots.

**concrete-raising — hero**
- Search: `concrete leveling foam injection`, `slab jacking`, `polyurethane concrete raising`, `mudjacking`.
- Qualifies: injection ports drilled in a settled slab, or a foam/grout lift in progress on a walkway/driveway slab.
- Reject: fresh concrete pours; decorative-stamped-concrete stock; crack-only close-ups with no lifting shown.

**humidity-control — hero**
- Search: `basement dehumidifier`, `crawl space dehumidifier`, `whole house dehumidifier`.
- Qualifies: a dehumidifier unit in a basement/crawl-space context, ideally with ducting or a condensate line.
- Reject: small consumer tabletop dehumidifiers on a shelf; HVAC-furnace-only shots; product catalog listings with logos/prices.

**radon-mitigation — hero**
- Search: `radon mitigation system`, `radon fan pipe`, `sub slab depressurization`, `radon vent pipe`.
- Qualifies: the white PVC radon vent pipe + inline fan on an exterior wall or through a basement, or a labeled radon system riser.
- Reject: radon test-kit product shots; generic PVC plumbing with no radon context.

### Trenchless

**conduit-installation — hero (expected genuine hit)**
- Search: `underground conduit trench`, `electrical conduit installation`, `PVC conduit trench`, `fiber conduit ground`.
- Qualifies: conduit **pipe visibly present** in an open trench or being laid. The conduit must be the subject.
- Reject: an empty trench with no conduit (that's trenching, not conduit); overhead power lines; indoor EMT conduit on a wall.

**trenching-excavation — hero (expected genuine hit)**
- Search: `utility trench excavation`, `mini excavator trench`, `trenching machine`, `open cut utility trench`.
- Qualifies: a machine cutting or a clean open utility/drainage trench at residential/site scale.
- Reject: large highway/pipeline megaprojects; foundation-pour excavations; anything with heavy visible equipment-brand decals (crop or skip).

**sewer-line-replacement — hero + optional support**
- Search: `sewer line replacement`, `sewer lateral excavation`, `sewer pipe repair dig`. Support: `sewer camera inspection`, `drain camera pipe`.
- Qualifies: an excavation exposing a sewer/drain lateral, or a pipe connection being replaced; support shows a push-camera cable entering a pipe.
- Reject: interior drain-cleaning/snake shots framed as plumbing service; municipal manhole work; trenchless-liner marketing with equipment brands.

**handhole-pull-box — hero (LOW CONFIDENCE — source only if truthful, else diagram)**
- Search: `underground pull box`, `handhole vault utility`, `electrical junction vault`, `splice box conduit`.
- Qualifies: an **open** pull box / handhole / splice vault with conduit or cable entering it, clearly along a utility run.
- Reject: closed surface lids only (reads as a random ground plate, not the service); telecom street cabinets above ground; anything ambiguous. **If nothing clearly shows an open box tied to conduit, do not settle — move this service to the diagram-needed list and note it.**

---

## Diagram needed

These services take **no stock photo**. A genuine search of Unsplash, Pexels, and Pixabay does not yield an image that truthfully shows the actual equipment/method, and an inaccurate photo on a commercial/municipal page is a worse credibility risk than no photo. Each ships with a **labeled cutaway diagram** built in the follow-up diagram phase.

**Missile Boring** (`/trenchless/missile-boring`)
- What it actually is: a **pneumatic piercing tool ("missile"/mole)** driven underground between two small pits to cross under a slab/lawn without open-cut.
- Searched: `missile boring`, `pneumatic piercing tool`, `underground mole boring`, `impact moling`, `directional boring` across all three sources.
- Why nothing qualifies: the tool is small and works underground/in-pit, so it is essentially unphotographed on free stock; the abundant "boring" results show **horizontal directional drilling (HDD) rigs** or **auger/microtunnel bores** — different equipment and method. Using an HDD-rig photo here would misrepresent the service to a buyer who knows the difference. → **Diagram.**

**HDPE Pipe Fusing** (`/trenchless/pipe-fusing`)
- What it actually is: **butt-fusion / electrofusion** of HDPE pipe into one continuous jointless run, staged on the surface and pulled behind a bore.
- Searched: `HDPE pipe fusion`, `butt fusion machine`, `poly pipe welding`, `electrofusion`, `pipe fusion machine` across all three sources.
- Why nothing qualifies: accurate free-stock of a butt-fusion machine clamping HDPE is scarce, and near-neighbor results (steel-pipe welding, generic plastic-pipe close-ups, PEX plumbing) misrepresent the process and equipment. The equipment specificity is exactly the credibility risk the brief calls out. Already flagged for a cutaway in the B-13 brief. → **Diagram.**

**Handhole / Pull Box Installation** (`/trenchless/handhole-pull-box`) — *conditional*
- Listed as a low-confidence source above. If the download pass cannot find an open pull-box/vault image that clearly shows conduit tie-in (per its reject rules), it **falls to diagram** and its table row is deleted. Record the outcome here at download time: `☐ sourced  ☐ moved to diagram`.

---

## Change log
- 2026-07-03 — Manifest created with enumerated pages, filenames, alt text, per-image sourcing briefs, and diagram-needed analysis. Download-time cells pending. (Cowork, Phase B-13.)
