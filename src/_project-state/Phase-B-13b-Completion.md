# Phase B-13b — Completion report

**Phase:** B-13b · Cowork — Stock-bridge download pass (completes B-13)
**Date:** 2026-07-03
**Author:** Cowork (on behalf of Goran)
**Status:** **Complete (push pending auth).** 6 heroes sourced + verified + saved; 7 waterproofing services flagged as gaps; handhole moved to diagram. No repo source files modified. Work committed locally to `main` (commit `1358ea6`); **the push could not run — this sandbox has no GitHub credentials — so Goran must `git push origin main` from his machine.**

---

## Step 0 — tooling check (passed)

All three capabilities confirmed on the connected **macOS Chrome** (this machine):
- **Browse** image pages on Pexels / Unsplash / Pixabay — yes.
- **Download + save into the repo** — yes, via: click the site's Free-download button → file auto-saves to `~/Downloads` (no native save-dialog) → mount `~/Downloads` → `cp` into `docs/stock-bridge/…` under the manifest filename. (First attempt at each download was occasionally a misfire; an empty-Downloads check reliably caught misfires and triggered a retry, so no wrong file was ever committed.)
- **Visually inspect a saved JPG** — yes (opened every saved file; dimensions read with PIL).

Because Step 0 passed, the pass proceeded (no manual fallback needed).

---

## Per-division final counts

**Waterproofing — 3 heroes sourced / 10 pages:**

| Service | Result |
|---|---|
| gutter-services | ✅ hero saved |
| yard-drainage | ✅ hero saved |
| foundation-repair | ✅ hero saved (depicts the *crack condition*, not repair hardware — flagged) |
| basement-waterproofing | ⛔ gap (no accurate free image) |
| sump-pumps | ⛔ gap |
| window-wells | ⛔ gap |
| crawl-spaces | ⛔ gap |
| concrete-raising | ⛔ gap |
| humidity-control | ⛔ gap |
| radon-mitigation | ⛔ gap |

**Trenchless — 3 heroes sourced / 6 pages:**

| Service | Result |
|---|---|
| trenching-excavation | ✅ hero saved |
| sewer-line-replacement | ✅ hero saved |
| conduit-installation | ✅ hero saved |
| handhole-pull-box | 📐 moved to diagram (was low-confidence in B-13) |
| missile-boring | 📐 diagram (B-13) |
| pipe-fusing | 📐 diagram (B-13) |

All 6 saved images: Pexels License (no attribution required; photographer + page URL logged anyway), confirmed non-AI, landscape, ≥1600 px wide (five at 6000 px, foundation-repair at 3264 px). Photographers: Francesco Ungaro, D Goug (×2), Sergei Starostin (×2), barış erkin.

**Optional supports:** all skipped — heroes secured, and the specific supports (exterior membrane, push pier, battery-backup pump, sewer camera) share the same paid-only availability problem.

---

## The gap finding (the important result)

Free-license stock (Unsplash / Pexels / Pixabay) **does not cover residential interior/appliance/buried-utility waterproofing specialties.** The accurate subjects for sump pumps, crawl-space encapsulation, egress window wells, radon systems, dehumidifiers, concrete-raising, and foundation-repair hardware exist almost exclusively as **iStock Sponsored (paid)** results; the free results are wrong objects (farm pumps, snails, air-conditioners, HVAC pipe, wet-concrete finishing). Free stock **does** reliably cover broad outdoor construction — open trenches, staged pipe, a gutter on a facade, a concrete crack — which is why the 6 keepers are all in that category.

**Recommendation for the 7 gap services + 3 diagram services:** labeled diagrams (cheapest, on-brand, and already the plan for the trenchless three) or real Sunset photos when available. Paid stock only if a specific page truly needs a photo before real photography lands. This is a decision for B-14 / a follow-up, not self-ratified here.

---

## Alt-text adjustments (every sourced image)

Each alt line was tightened to match exactly what the downloaded photo shows (still generic, no Sunset, no location). Full before/after list is in the manifest's "Alt-text adjustments" section. The notable one:

- **foundation-repair** now reads "Structural cracks running across a concrete wall." The image shows the **condition** foundation repair addresses, not the repair method. Honest and relevant, but if B-14 wants the actual method shown, move this service to the diagram/paid track.

---

## In-phase judgment calls (surfaced, not self-ratified)

1. **Accuracy bar held strictly.** Seven services were flagged as gaps rather than settling for a near-miss (e.g., a farm/irrigation pump on the sump-pump page, an air-conditioner on the humidity page). This follows the brief's binding rule and the B-09 honesty standard. If Goran would rather ship a "close-enough" image on any of these, that's a call to make explicitly — I did not make it for you.
2. **foundation-repair shows the condition, not the repair.** Taken as an honest, relevant bridge; flagged for B-14 to override with a diagram if preferred.
3. **handhole resolved to diagram on the category pattern.** A transient Chrome disconnect cut the dedicated pull-box search short; the determination rests on the same paid-only pattern seen across five other niche services + B-13's prior low-confidence flag. If a genuine free image later surfaces, it can replace the diagram.
4. **Optional supports skipped** to avoid over-collection (brief's quantity discipline) and because the specialty supports are themselves paid-only.
5. **Download mechanics.** Chrome saved to `~/Downloads`; I mounted that folder and `cp`-ed each file into the repo, deleting the source after copy (delete permission was granted for the Downloads folder). Downloads is left clean.

---

## Definition of Done

- [x] Step-0 tooling check passed.
- [x] Latest `main` pulled before work; all work against the committed manifest.
- [x] All **sourceable** waterproofing heroes downloaded, license-verified, non-AI-confirmed, visually inspected, saved (3 of 10; the other 7 are documented gaps, not silent skips).
- [x] Conduit Installation, Trenching & Excavation, Sewer Line Replacement heroes downloaded and verified.
- [x] Handhole/Pull Box resolved exactly one way — moved to Diagram needed with rationale (manifest + decisions entry).
- [x] Every optional support explicitly marked skipped — none left ambiguous.
- [x] Zero fabricated metadata — every filled Source URL / Photographer / License / Download-date cell corresponds to an image page opened this session.
- [x] Zero AI-generated, watermarked, third-party-branded, or unapproved-source images; all meet the resolution minimums.
- [x] No `⟨fill on download⟩` placeholders remain on sourced rows; manifest status set to "Downloads complete — ready for B-14 integration."
- [x] No repo source files modified; all new files under `docs/stock-bridge/…`.
- [~] One commit made on `main` (`1358ea6`); **push pending** — no GitHub credentials in the sandbox. Goran runs `git push origin main`.

---

## Handoff to B-14 (Code)

1. Import the 6 saved heroes into the repo image pipeline and wire the service-page photo slots for gutter-services, yard-drainage, foundation-repair, trenching-excavation, sewer-line-replacement, conduit-installation.
2. The 7 waterproofing gap services + 3 trenchless diagram services keep their placeholders until the diagram phase (or real/paid photos) lands. Decide diagram vs. paid-photo per the gap notes.
3. Reconsider foundation-repair: crack-condition photo now, or diagram of the repair method.
