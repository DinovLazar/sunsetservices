# Phase M.10g (Code) — Completion Report

> Portfolio gallery grouped + labeled by city. A stakeholder reviewing the Vercel Preview called the `/projects` gallery "scattered" and asked for it "per project per address." Every portfolio tile now reads its city from the project's structured Sanity `city` reference and same-city jobs cluster together. Date: 2026-05-31. Branch: `phase/m10g-portfolio-location` off `main` (d587f17, M.11 merged). Project **detail** pages, the lightbox, and the before/after toggle are untouched.

---

## What changed

### Root cause of the "scattered" feel

The summary GROQ projection already returned the structured city name (`"cityName": city->name`), but `sanityProjectSummaryToTs` **dropped it** — it carried only `citySlug`. So `ProjectsGrid` (and `RelatedProjects`) re-derived the display city through the static 24-city `locations.ts` table (`getLocation(p.citySlug)?.name ?? p.citySlug`). For any job whose city is **not** one of those city-*page* cities, that fell back to the raw slug; for a city-less project it produced a broken `" · {year}"` (leading-dot) meta line. The grid order also interleaved areas (`year desc, slug asc` straight from Sanity).

### The fix (render layer only)

- **`cityName` plumbed through.** `Project.cityName?: string` added; both adapters (`sanityProjectSummaryToTs`, `sanityProjectDetailToTs`) now carry `cityName: p.cityName ?? undefined`. (The detail projection already returned `cityName` too.)
- **One shared resolver — `src/lib/projects/resolveProjectCity.ts`.** Structured `cityName` first → static `locations.ts` table by `citySlug` (covers the TS seed) → `undefined`. Never the raw slug, never a fabricated city. Used by all three `ProjectCard` callers **and** the portfolio sort, so the label a tile shows and the city it sorts under can never disagree.
- **City-only label.** The tile `meta` line is now the city (e.g. `Aurora`), not `City · Year`. Ratified with the user (M.10g-E1). The year is retained as the within-city **sort** key only. `ProjectCard` already renders `meta` optionally, so a location-less project (`meta={undefined}`) renders nothing — no empty-space artifact.
- **Shared consistency.** The homepage / About "Recent work" row (`HomeProjects`) previously rendered **no** location line; it now shows the same city label. The related-projects strip (`RelatedProjects`) switches to the structured resolver. The `/projects` index (`ProjectsGrid`) renders city-only.
- **New sort (`compareForPortfolio` in `/projects/page.tsx`).** City name A→Z; projects with no assigned city sort **last**; within a city, `year` descending then `slug` A→Z as a stable final tiebreak. City order is pinned to the `'en'` collator so `/projects` and `/es/projects` cluster identically. Sorted on a copy of the **active filtered** set before pagination; the unfiltered `ALL` (chip counts + `ItemList` schema, D12) keeps Sanity's order.

### Privacy rule held (M.10g-D3)

The new label is city-only — zero street detail. Titles still pass through `stripStreetNumber()`, so no street **numbers** render (`1227 Colchester Lane, Aurora` → `Colchester Lane, Aurora`; `807/811 Edgewater Drive` → `Edgewater Drive`). Street **names** still embedded in some Sanity titles are pre-existing content, deferred to Goran/Erick (below) — not parsed/altered here (D2: never parse location out of the title).

---

## Decisions

Full text in `Sunset-Services-Decisions.md` (2026-05-31 M.10g entry, committed first). Locked input contract D1–D7 + one in-phase resolution:

- **M.10g-E1 — Tile location line is city-only.** The index/related tiles previously rendered `City · Year`; the homepage row rendered nothing. D6 scopes the tile change to "exactly a consistent city label," and step 4 defines the line as "city (+ optional neighborhood)" — the schema has no neighborhood field, and neither lists the year. Ratified with the user: **city-only**, year kept as the sort key only.

---

## Verification

### Localhost (worktree production build on `:3000`)

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | **exit 0** (clean; `next-env.d.ts` present) |
| `npx eslint` | **0 errors** (11 pre-existing warnings, none in M.10g-touched files) |
| `npm run build` | **success — 190 pages**; `/[locale]/projects` is `ƒ` (reads `searchParams`) |
| `npm run validate:schema` | **22/22 · 0 errors** |
| `npm run validate:seo` | **184 URLs · 0/0** (+ sitemap + robots) |
| `npm run validate:a11y` | **20/20 · 0 errors** — axe AA 0, best-practice 0, SC 2.4.11/2.5.8 0, Lighthouse <95: 0; reduced-motion OK |

No `aurora-driveway-apron` errors — that drift is already reconciled on `main` (M.11). Zero new failures vs. the M.11 baseline.

### Rendered-output checks (parsed from SSR HTML)

| Surface | Result |
| --- | --- |
| `/en/projects` | 10 real projects; the **2 city-referenced jobs (Aurora) cluster first** with a clean city-only `Aurora` label; the **8 location-less jobs sort last** with no label |
| `/es/projects` | Identical `Aurora`-first clustering (proper-noun labels match across locales) |
| `/en/projects?division=hardscape` | Sort + labels hold within the filter (Aurora first, location-less after) |
| `/en` (homepage "Recent work") | Tiles now carry the city label; recency order unchanged |
| `/en/projects/<slug>` related strip | Renders via the new resolver — no crash, no raw slug |
| Street detail | No street **numbers** anywhere (stripStreetNumber working) |
| Layout | `/projects` grid screenshot — 3-col layout intact, no regression from the meta change |

---

## Files written / updated

### New
- `src/lib/projects/resolveProjectCity.ts` — shared city-label resolver.
- `src/_project-state/Phase-M-10g-Completion.md` — this file.

### Modified (code)
- `src/data/projects.ts` — `Project.cityName?: string`.
- `src/lib/sanity-adapters.ts` — both adapters carry `cityName`.
- `src/components/ui/ProjectCard.tsx` — `meta` JSDoc (city, not `City · Year`).
- `src/components/sections/projects/ProjectsGrid.tsx` — `resolveProjectCity`; city-only meta.
- `src/components/sections/projects/detail/RelatedProjects.tsx` — `resolveProjectCity`; city-only meta.
- `src/components/sections/home/HomeProjects.tsx` — adds the city label (was none).
- `src/app/[locale]/projects/page.tsx` — `compareForPortfolio` sort.

### State + decisions docs
- `Sunset-Services-Decisions.md` — 2026-05-31 M.10g entry (committed first).
- `src/_project-state/current-state.md` — last-completed → M.10g + "What works (Phase M.10g additions)".
- `src/_project-state/file-map.md` — M.10g section.

---

## Out of scope (untouched per plan)

- Project **detail** pages, the lightbox, the before/after toggle (D1).
- Tile components that don't already use `ProjectCard` (`AudienceFeaturedProjects`, `LocalProjectsStrip`) (D1).
- The division filter UX / chips; no city section headings; no tile redesign (D6).
- The homepage "Recent work" **order** (stays year-desc; the sort is `/projects`-index only, D4).

---

## Carryover for the user / content team (NOT a Code task)

**Today only 2 of the 10 Sanity projects carry a structured `city` reference, so only 2 tiles are labeled** (both Aurora) — the other 8 render no label and sort last. This is the intended split (M.10g-D5): the render mechanism is complete; the **content** is the gap. Goran/Erick assign real `city` references to the remaining projects in Sanity Studio (`project.city` → a `location` doc). As cities are added, those tiles automatically gain labels and cluster A→Z with no further code change.

Two related deferred content items (in the decisions entry): projects whose **titles** still embed a street name (e.g. the `807/811 Edgewater` pair) are a Sanity title edit, not a render change — `stripStreetNumber()` strips a leading street *number* but a street *name* baked mid-title stays until the content pass.

---

## Definition of done — checklist

- [x] `/projects` + `/es/projects` render; every tile with an assigned city shows a clear city label; tiles without a city show no label and sit at the end
- [x] Ordered city A→Z (location-less last; year-desc within a city); same-city jobs adjacent
- [x] Division filter chips still work; sort + labels hold within each filtered view
- [x] Same city label renders wherever `ProjectCard` is shared (homepage "Recent work"; related strip)
- [x] No street numbers or street names render in the new **label** anywhere (city-only); no street numbers in titles (stripStreetNumber)
- [x] `tsc --noEmit` 0, `lint` 0 errors, `build` 190 pages; `validate:schema` 22/22, `validate:seo` 184·0/0, `validate:a11y` 20/20 — no new failures
- [x] Reduced-motion + tile hover / lightbox-entry behaviors unchanged (no ProjectCard structural change)
- [x] Decision entry appended to `Sunset-Services-Decisions.md` before the code change
- [ ] Vercel Preview re-verification — pending push
- [ ] Branch merged into `main` — pending Preview verification
