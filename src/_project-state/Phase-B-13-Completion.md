# Phase B-13 — Completion report

**Phase:** B-13 · Cowork — Stock-bridge imagery for Waterproofing & Trenchless service pages
**Date:** 2026-07-03
**Author:** Cowork (on behalf of Goran)
**Status:** **Documentation complete; image downloads pending** (docs-first split — see Judgment call #2). No repo source files modified.

---

## What shipped this phase

- **Decisions-log entry** appended to `Sunset-Services-Decisions.md` (2026-07-03, "Phase B.13"), **before any sourcing**, following the log's date-titled convention (the log uses dated `## …` headers, not `D-NNN` IDs — verified against the full file).
- **Manifest** `docs/stock-bridge/stock-image-manifest.md` — enumerated target pages, one table row per planned image, complete alt text and replacement-by dates now, and a per-image sourcing brief (search terms / qualify / reject) for every service. Four download-time columns (source URL, photographer, license, download date) are marked `⟨fill on download⟩`.
- **Folder structure** `docs/stock-bridge/waterproofing/` and `docs/stock-bridge/trenchless/`, each with a `README.md` documenting the mandatory `stock-` naming convention and the accuracy rules.
- **Diagram-needed analysis** for the trenchless services that can't be honestly photographed.

---

## Per-service image plan (final counts)

**Waterproofing — 10/10 pages covered, all sourceable.** 10 heroes (one per page) + up to 3 optional supports (basement-waterproofing, foundation-repair, sump-pumps). **Planned max: 13 images.** Supports download only if a genuinely additive, accurate shot is found; otherwise the hero ships alone.

| Service | Hero | Support(s) planned |
|---|---|---|
| Basement Waterproofing | 1 | 1 (exterior membrane) |
| Foundation Repair | 1 | 1 (push pier) |
| Sump Pumps | 1 | 1 (battery backup) |
| Yard Drainage | 1 | — |
| Gutter Services | 1 | — |
| Window Wells | 1 | — |
| Crawl Spaces | 1 | — |
| Concrete Raising | 1 | — |
| Humidity Control | 1 | — |
| Radon Mitigation | 1 | — |

**Trenchless — 6/6 pages accounted for; 3 photo, 2 diagram, 1 conditional.**

| Service | Plan |
|---|---|
| Conduit Installation | 1 hero (expected genuine hit) |
| Trenching & Excavation | 1 hero (expected genuine hit) |
| Sewer Line Replacement | 1 hero + 1 optional support (camera inspection) |
| Handhole / Pull Box | 1 hero **low-confidence** — source only if truthful, else moves to diagram |
| Missile Boring | **Diagram needed** (no photo) |
| HDPE Pipe Fusing | **Diagram needed** (no photo) |

**Planned trenchless image max: 5 images** (3–4 heroes + 1 support), depending on the handhole outcome.

---

## Diagram-needed list (feeds the follow-up diagram phase)

1. **Missile Boring** — pneumatic piercing tool works underground/in-pit; free stock either doesn't exist or shows HDD rigs (wrong equipment). No accurate photo → cutaway diagram.
2. **HDPE Pipe Fusing** — accurate butt-fusion/electrofusion imagery is scarce on free stock; near-neighbors (steel-pipe welding, PEX plumbing) misrepresent the process. Already flagged in the brief → cutaway diagram.
3. **Handhole / Pull Box** — *conditional.* Sourced only if an open pull-box/vault image clearly tied to conduit is found; otherwise it joins this list. Outcome recorded in the manifest at download time.

Full search rationale for each is in the manifest's "Diagram needed" section.

---

## Judgment calls made in-phase (surfaced for ratification, not self-ratified)

1. **Repo path differed from the brief.** The brief points at `C:\Users\user\Desktop\SunSet-V2\` (a Windows path); this Cowork session runs on macOS and the repo is at `/Users/petarjakimov/Projects/SunsetServices`. I surfaced this, connected the real folder, and mapped every output path to it. All deliverables landed at the intended relative locations (`docs/stock-bridge/…`, `src/_project-state/…`, root decisions log).

2. **Docs-first execution split (the material deviation).** The brief assumes the Cowork agent downloads, license-verifies, AI-label-checks, and visually inspects every stock JPG. With the tools available I cannot reliably download and save image binaries or visually verify per-image license/AI-label state, and I will not fabricate manifest metadata (invented Unsplash URLs, photographer names, license confirmations) — that is precisely the fabrication B-09 removed and this brief forbids. Goran chose the **"I do docs, you download"** path. Consequence: the manifest's alt text, filenames, target pages, sourcing briefs, and replacement dates are **complete now**; the actual JPGs and the four download-time cells are **completed by Goran (or a Windows session) against the manifest.** Definition-of-Done items that depend on downloaded files are therefore **prepared, not yet done** — see status below.

3. **Enumeration source.** The brief names the live Vercel preview as authoritative. I enumerated from `src/data/services.ts` — the data the preview renders from — because it is exact and complete (10 waterproofing slugs, 6 trenchless slugs, confirmed `division` fields). If any of these pages is unpublished or redirected on the live preview, reconcile against the preview before integration. URL structure confirmed from `src/i18n/routing.ts` (`localePrefix: 'as-needed'`, `defaultLocale: 'en'` → English routes unprefixed).

4. **Handhole treated as low-confidence source-or-diagram**, not pre-flagged as diagram. The brief allowed "possibly Handhole/Pull Box" among failures; I left the door open to a truthful photo with strict reject rules, defaulting to diagram if none qualifies.

5. **Added per-folder README files** (not explicitly requested) documenting the `stock-` convention and accuracy rules, so the download pass can't drift from spec. Minor/additive.

---

## Sourcing surprises / notes

- No brand guide `.docx` (BG-01) is present in the repo — §9.1/§9.3 were applied from the brief's quotations. Flagged in case the guide's exact wording matters at integration.
- Trenchless already carries a documented generic-imagery bridge from the 2026-06-23 B.12 entry (it aliases the `commercial` audience assets). B-13's stock bridge supersedes that alias for the sourced services at integration (B-14); the diagram-needed services keep a placeholder until diagrams land.

---

## Definition of Done — honest status

- [x] Decisions-log entry appended **before** any downloading, per the log's conventions.
- [x] Every Waterproofing service page enumerated, with a hero (and any support) specified, alt text written, filename assigned, and manifested. **Download + license-verify pending (Judgment call #2).**
- [x] Every Trenchless service page either has a hero specified in the manifest **or** appears in the diagram-needed list with a one-line rationale — no service silently skipped, no inaccurate photo planned. **Download + license-verify pending.**
- [x] Plan admits **zero** AI-generated / watermarked / unapproved-source / third-party-branded images; reject rules enforce this at download time.
- [~] Every manifest row complete: alt text and replacement-by date **done now**; source URL, photographer, license, download date **filled at download time** (docs-first split).
- [x] All alt text is generic and truthful — no Sunset attribution, no invented locations, no empty alts.
- [x] Folder structure + `stock-` filename convention established under `docs/stock-bridge/waterproofing/` and `…/trenchless/`. **Files land here on download.**
- [x] No repo source files modified.

---

## Handoff — what's left to finish B-13

1. Run the download pass against `docs/stock-bridge/stock-image-manifest.md`: source each image per its brief, verify license + non-AI, save under the given filename, fill the four download-time cells.
2. Resolve the handhole conditional (sourced vs. diagram) and record it.
3. Then **B-14 (Code)** imports the verified images into the repo and wires the service-page photo slots.
4. The diagram-needed services (Missile Boring, HDPE Pipe Fusing, + handhole if it fell through) feed the follow-up diagram phase.
