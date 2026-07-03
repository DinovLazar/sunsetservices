# Phase B-14 — Completion Report

**Phase:** B-14 · Code — Wire the stock-bridge images into the service pages
**Date:** 2026-07-03
**Branch / commit:** `main` (single commit, pushed)
**Author:** Code

---

## 1. Summary

The 6 free-license bridge photos sourced in B-13b (`docs/stock-bridge/`) are now optimized and wired into the live image pipeline. The two newest divisions' six affected service pages render real, accurate imagery on every localized surface (service-detail hero, division-landing tile grid, and — off-spec discovery — the city-page service grid). The other 10 new-division services are untouched and remain on their existing placeholders pending the diagram-track phase.

Exactly 6 services changed imagery; nothing else.

---

## 2. Dependency check (done first)

- Pulled `main` (already up to date; B-13b download pass present as commit `c090925`).
- Verified all 6 source JPGs exist under `docs/stock-bridge/{waterproofing,trenchless}/` with the manifest's exact filenames — all present, valid, high-res (3264–6240 px wide). **Did not stop** (files landed).
- `sharp` verified: absent from `package.json` **dependencies** but present in `package-lock.json` (`^0.34.5`, transitive). This fresh checkout had **no `node_modules`** at all, so `npm ci` was run (installed `sharp@0.34.5` + everything else). This is not the "sharp genuinely absent" stop-condition — no package was added.

---

## 3. Task-2 recon (the 5-line summary, written before editing)

1. **Service-detail hero** resolves at `src/app/[locale]/[division]/[service]/page.tsx:87` → `assetKey = svc.imageKey ?? svc.slug`; `SERVICE_HERO[assetKey]` → `<ServiceHero photo=…>`, whose alt was hard-coded `alt={serviceName}` (service name, not descriptive).
2. **Division-landing tile grid** resolves at `[division]/page.tsx:119` → `SERVICE_TILE[s.imageKey ?? s.slug]`, rendered by `AudienceServicesGrid` with `alt={s.name[locale]}`.
3. **City-page service grid** (`LocationServicesGrid.tsx:44`) → `SERVICE_TILE[svc.imageKey ?? svc.slug]`, `alt={s.name}` — a **third** surface (see §4).
4. The 6 target services currently alias existing assets via a service-level `imageKey`: foundation-repair→retaining-walls, yard-drainage→seasonal-cleanup, gutter-services→tree-services, conduit-installation→driveways, trenching-excavation→retaining-walls, sewer-line-replacement→property-enhancement. None had their own `SERVICE_HERO`/`SERVICE_TILE` entry.
5. `buildServiceSchema` does **not** reference `imageKey`/image → dropping the alias is schema-safe. Plan: remove the 6 aliases (assetKey defaults to slug) + add 6 `SERVICE_HERO` + 6 `SERVICE_TILE` slug entries → new `hero-{slug}.jpg` + `tiles/{slug}.jpg`; add optional `Service.photoAlt` (data-entry) threaded to the hero + both grids with a name fallback.

### Off-spec discovery (surfaced, not self-ratified)

The brief named only the service-detail hero + division-landing grid. Recon found a **third tile surface**: `LocationServicesGrid` on `/service-areas/<city>/`. Several cities (e.g. `oak-brook` → `foundation-repair`, and 4 cities → `yard-drainage`) list these in `featuredServices`, so those city grids render 2 of the 6 new tiles. It picks up the new tile asset + `photoAlt` automatically through the same slug resolution; wired for the descriptive alt and included in verification. Not self-ratified — flagged here for the reviewer.

---

## 4. What changed

**New script** — `scripts/optimize-stock-bridge.mjs` (sharp; same conventions as `gen-*-placeholders.mjs`). Per source JPG: 16:9 center-crop 2400px hero (`src/assets/service/hero-{slug}.jpg`) + 4:3 center-crop 1200px tile (`tiles/{slug}.jpg`), mozjpeg. Hero quality is adaptive (starts 80, steps down by 2 to a 50 floor) to keep every hero < 400 KB; an escalating light Gaussian blur is a last-resort fallback for pathologically noisy sources. Idempotent + deterministic (encode-to-buffer then `writeFile` — never re-encoded through `sharp().toFile()`, which would inflate size).

**6 hero + 6 tile assets** generated (all center crops verified visually — no key subject cut; no per-image crop override needed):

| slug | hero | hero bytes | notes | tile |
|---|---|---|---|---|
| gutter-services | 2400×1350 | 386 KB | q78 | 1200×900 q80 |
| yard-drainage | 2400×1350 | 363 KB | q50 + blur 0.9 (only image needing blur) | 1200×900 q80 |
| foundation-repair | 2400×1350 | 384 KB | q74 · **crack-condition photo (ratified)** | 1200×900 q80 |
| trenching-excavation | 2400×1350 | 384 KB | q50 | 1200×900 q80 |
| sewer-line-replacement | 2400×1350 | 386 KB | q74 | 1200×900 q80 |
| conduit-installation | 2400×1350 | 322 KB | q80 | 1200×900 q80 |

**`src/data/imageMap.ts`** — 6 hero imports + 6 tile imports; 6 new `SERVICE_HERO` + 6 new `SERVICE_TILE` entries keyed by slug.

**`src/data/services.ts`** — the 6 services dropped their `imageKey` alias (now resolve by slug); new optional `Service.photoAlt?: Localized` type field; each of the 6 populated with the manifest's verbatim EN alt + a drafted ES translation.

**Alt-text wiring** (no new mechanism — data field + name fallback):
- `ServiceHero.tsx` — new optional `photoAlt` prop; `alt={photoAlt ?? serviceName}`.
- service-detail route — passes `photoAlt={svc.photoAlt?.[loc]}`.
- `AudienceServicesGrid.tsx` — `alt={s.photoAlt?.[locale] ?? s.name[locale]}`.
- `LocationServicesGrid.tsx` — projection gains `photoAlt`; `alt={s.photoAlt}` (falls back to name in the projection).

**Docs** — decisions entry (before code); TRANSLATION_NOTES §B.14 (6 EN→ES pairs, pending native review); manifest `Status:` line; `current-state.md` + `file-map.md`.

---

## 5. Verification

- **`npm run build`** — exit 0; 202/202 prerendered; **0 TypeScript errors**; no warnings (the pre-existing `images.qualities` dev-only notice is unrelated).
- **Asset spec** — all 6 heroes 16:9 2400×1350 and < 400 KB (true on-disk bytes 322–386 KB); all 6 tiles 4:3 1200×900. Script **idempotent** (re-run → identical md5).
- **12 localized service pages** — 6 EN render the new hero with the **verbatim EN alt** (confirmed via live DOM eval on each + SSR HTML with `lang="en"`); 6 ES render the new hero with the **drafted ES alt** (confirmed via SSR HTML with `lang="es"` + a foundation-repair screenshot). Every hero `alt` present and non-empty. Every page references its `hero-{slug}` optimized asset.
- **Division landing grids** — `/waterproofing/` (10 tiles): the 3 sourced services show new tiles + descriptive alt, the other 7 keep placeholder-alias tiles + service-name alt. `/trenchless/` (6 tiles): the 3 sourced services show new tiles + descriptive alt, `missile-boring`/`handhole-pull-box`/`pipe-fusing` keep placeholder-alias tiles + name alt.
- **City grid** — `/service-areas/oak-brook/`: `foundation-repair` tile shows the new asset + descriptive alt; the other 5 featured services unchanged.
- **Zero regression on the 10 placeholder services** — spot-checked `missile-boring`, `sump-pumps`, `radon-mitigation`, `basement-waterproofing` detail heroes: still resolve to their alias asset (`hero-driveways`/`hero-sprinkler-systems`/`hero-landscape-maintenance`/`hero-retaining-walls`), still `alt="<service name>"`, no new slug asset referenced.
- **`docs/stock-bridge/` diff** — only the manifest status line changed (1 insertion, 1 deletion); no image/README touched.

### Screenshots captured (6 EN service pages + supporting)

1. `/waterproofing/gutter-services/` — green gutter + downspout on facade.
2. `/waterproofing/yard-drainage/` — corrugated pipe bedded in gravel, open trench.
3. `/waterproofing/foundation-repair/` — structural crack across concrete wall.
4. `/trenchless/trenching-excavation/` — open utility trench, pipe staged, orange accent.
5. `/trenchless/sewer-line-replacement/` — exposed underground pipes/connections.
6. `/trenchless/conduit-installation/` — bundled grey PVC conduit staged.
- Supporting: `/es/waterproofing/foundation-repair/` (Spanish chrome), `/waterproofing/` grid, `/trenchless/` grid.

(Screenshots were reviewed inline during verification; each image confirmed to match its service and its alt text.)

---

## 6. The 10 services remaining on the diagram track (confirmed unchanged)

**7 waterproofing gaps:** `basement-waterproofing`, `sump-pumps`, `window-wells`, `crawl-spaces`, `concrete-raising`, `humidity-control`, `radon-mitigation`.
**3 trenchless diagram services:** `missile-boring`, `handhole-pull-box`, `pipe-fusing`.

All keep their existing B-12 placeholder alias resolution and service-name alt. Labeled diagrams for them are a separate follow-up phase (out of scope here).

---

## 7. Own decisions / notes surfaced (never self-ratified)

- **Adaptive hero quality + light-blur fallback.** "~80" is the target; the checklist's hard rule is < 400 KB. Five of six sources exceed 400 KB at q80 (dense construction textures). The script steps quality down per-image (max fidelity within budget); one image (`yard-drainage`) still couldn't fit at the q50 floor, so a 0.9-sigma noise-shaving blur was applied — imperceptible on a scrim-backed hero, and Next re-optimizes to WebP/AVIF at serve time anyway. Reviewer can raise the floor / relax the budget if a sharper `yard-drainage` source asset is preferred.
- **`photoAlt` as a data field.** The phase permits "data entry" and forbids "a new mechanism." A `Service.photoAlt` `{en,es}` keeps the localized alt beside the rest of the service copy and threads through the existing alt resolution with a name fallback — no registry, no per-component hard-coding.
- **`LocationServicesGrid`** wired for parity (§3 off-spec discovery).
- **Env setup** (fresh checkout): ran `npm ci`; created a gitignored `.env.local` with the **public** Sanity read config (`projectId i3fawnrl`, already committed in `sanity.config.ts`) so the build/dev GROQ client can instantiate. No secrets committed; `.env.local` and `.claude/launch.json` are gitignored and not staged.

---

## 8. Definition of Done

- [x] Decisions-log entry appended before code changes.
- [x] `scripts/optimize-stock-bridge.mjs` exists, runs from repo root, idempotent.
- [x] 6 hero + 6 tile derivatives generated to spec, wired via `imageMap.ts`; the 6 dead aliases removed.
- [x] Manifest EN alt wired verbatim; 6 ES alt lines drafted, wired, logged in TRANSLATION_NOTES.
- [x] All 12 localized pages verified (screenshots for the 6 EN + supporting); zero regression on the 10 placeholder services.
- [x] Clean build (exit 0); state files synced; manifest status updated; one commit pushed to `main`.
