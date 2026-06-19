# Phase M.15 — Unblocked Work Sweep (Code) — Completion

**Branch:** `phase/m15-sweep` (cut from `main@85abef8`; backup tag `pre-m15-backup`)
**Date:** 2026-06-19
**Environment:** macOS / zsh (the brief assumed Windows/PowerShell — corrected; see Stream 0)
**Outcome (summary):** One traceable sweep, one commit per logical Stream. The bulk of the brief's code was already shipped by prior phases (M.14 already on `main`; the B.09 persistent rate-limiter already built); this sweep **verifies** that work against the brief, **lands** the genuinely-unmerged performance pass, **adds** the accessibility manual-test checklist, **runs** the locally-runnable verification + smoke subset, and **defers with surfaced reasons** the items that are blocked on external credentials/assets this session cannot reach. No business facts were invented.

> **How to read this:** one labeled subsection per Stream (0–9). Each records what was done, the evidence, and any surfaced flags. Three explicit lists close the report: **Still waiting on Erick**, **Still waiting on Goran/Google**, **For the Cowork verification pass**.

---

## Stream 0 — Plan-of-record decision log

**Done.** Appended the dated M.15 plan-of-record entry to `Sunset-Services-Decisions.md` (committed FIRST, before any source change). It records: the batching rationale + traceability mechanism (one Stream = one commit = one report subsection); the **live-state deltas** verified against the brief (macOS not Windows; M.14 already merged to `main`; B.09 rate-limiter already built; 24 city records / 22 surfaced with no pinned +2; placeholder local creds; related-links branches already in main); the operator's **landing/branch/Lighthouse decisions** (M.15-D1/D2/D3); and the **five carried-forward flags** (M.08 not-to-Erick, partial photos, conditional two-city, YouTube not-a-Code-task, AI-reviewed-Spanish bar).

**Commit:** `4bdf78d` — `M.15 Stream 0: log plan-of-record decisions for the unblocked sweep`.

---

## Stream 1 — Close M.14 + reconcile branches

**M.14 was already merged to `main`.** `git diff main..qa/b-09-corrections` is empty; neither `git log` direction shows unique commits. The `phase(M.14)` commits are `main`'s tip. So the brief's "verify-then-merge the QA branch" was already satisfied — there was nothing to merge. (`current-state.md` still described it as a pending branch; corrected this sweep — live code wins.)

**Close-out gate — all green on the sweep branch (== main + Stream 0/1 docs):**

| Check | Result |
|---|---|
| `npm run build` (Next 16, Turbopack) | ✓ Compiled in 5.3 s; **190/190** static pages |
| `npm run lint` | **0 errors**, 11 pre-existing warnings (unused-var, none from this sweep) |
| `validate:related-links` (runs in `prebuild`) | ✓ green (build would abort otherwise) → **Stream 1.11 satisfied on main** |
| `grep -ri "solis"` (code/data/messages) | **zero** |
| `grep -ri "solis"` (repo, ex-`_project-state`) | fixed the 2 stale alt-text **specs** in `docs/design-handovers/Part-1-Phase-06-Design-Handover.md` (`Erick Solis`→`Erick Valle`); `_project-state/*` completion logs keep "Solis" as immutable history |
| literal leading `###` in FAQ data | none |

**B-09 removals/neutralizations confirmed present in code (§3.1–3.12):**

- **3.1 Testimonials** — no templated authors (`Patricia M.`/`David R.`/`Sarah K.`/`Caroline T.`/`Brian J.`/`James K.`/`Mark T.`) in real surfaces; `home`/4 divisions/24 city arrays emptied; sections hide cleanly. *(Flag: `/dev/system` — see below.)*
- **3.2 Rating/count** — no `4.8`/`4.9`/`287`/`200+` rating figures in messages/components (only code-comments documenting the removal). No fabricated `AggregateRating`.
- **3.3 Surname** — `Erick Valle` everywhere; `Solis` zero in code/data/messages/docs.
- **3.4 Dates** — `since 2010`/`since 2003` (credential)/`fifteen years`/`380+`/`1,200+` removed from messages+credentials. *(Flag: `blog.ts` body + Batavia `whyLocal` — see below.)*
- **3.5 Second-generation** — zero `or his son`/`o su hijo`/third-gen phrasing.
- **3.6 Award** — no live `DuPage Tribune · 2024` (only removal-documenting comments).
- **3.7 Social** — `SocialIcons.tsx` env-driven (`NEXT_PUBLIC_SOCIAL_*`), no hardcoded generic homepages; renders `null` when unset.
- **3.8 Calendly** — env-driven via `NEXT_PUBLIC_CALENDLY_URL`; no URL hardcoded in the component. *(Flag: env still holds the personal `dinovlazar2011` URL — M.08.)*
- **3.9 Hardscape pricing** — `HARDSCAPE_FACTORS` defined and **assigned to exactly the 6 hardscape services** (`grep` count = 6); landscape/lawn keep `GENERIC_FACTORS`.
- **3.10 FAQ `###`** — `stripFaqHeadingMarker` applied at component (`FaqAccordion.tsx`) **and** schema (`buildContentFaqSchema` in `schema/article.ts`).
- **3.11 Blog/Resources nav** — index/`[slug]` routes are Sanity-backed and resolve; invented mega-panel placeholder links removed (validated green by `validate:related-links`).
- **3.12 Preview noindex** — `isProductionDeploy()` (`VERCEL_ENV==='production'`) drives `robots.ts` (`Disallow: /` off-prod) **and** root `layout.tsx` (`robots:{index:false,follow:false}` off-prod). Production stays indexable; canonicals → `https://sunsetservices.us` (verified in Stream 9 SEO harness).

**Flags surfaced (not silently changed — facts are Erick's / dev-tool intent is the operator's):**
1. **`/dev/system` is not production-gated.** It has no `isProductionDeploy()`/`notFound()` guard and still renders demo testimonials (`Sarah K.`, `Mark T.`) as component fixtures. It is `noindex`, but reachable in production. *Recommend:* gate it to non-prod, or replace the fixtures. Left as-is (its reachability may be an intentional live-QA affordance — did not unilaterally alter a dev tool).
2. **`blog.ts:491` asserts "laying Unilock since 2003 … 23 years of installs"** in an article body — the same unverified-specific class the credential copy neutralized. Needs reconciliation with Erick's confirmed timeline (same bucket as B4). Not altered (would require inventing a different unverified date or gutting the article voice).
3. **Batavia `whyLocal` "mowing since 2003"** (`locations.ts:212`) — a consciously-kept local-narrative line per the M.14 §5 "kept + flagged" list; left in place, flagged.

**Branch reconciliation (M.15-D2):**
- **Incorporate:** `perf-m02-lighthouse` (genuine unmerged work → Stream 6).
- **Already-in-main despite `--no-merged` (squash-merged / content-identical) → recommend delete:** `fix/related-service-404s` (its `validate-related-links.mjs` is byte-identical to main's), `chore/wire-related-links-validator` (older than main; its prebuild wiring already present — merging would regress), `flamboyant-einstein-069be0` (2.07 Calendly), `keen-joliot-4ef5e1` (B.06 a11y), `priceless-northcutt-4516d5` (2.06 wizard).
- **Already merged (`--merged main`) → recommend delete (17):** `angry-ellis`, `competent-mahavira`, `epic-hertz`, `gifted-pare`, `keen-torvalds`, `m-11-codex-fixes`, `nostalgic-nash`, `phase-b-11-photo-upload`, `phase-m-03-codex-spanish-review`, `docs/m06-handover`, `b03e-legal-hardcode`, `m10f-mobile-hero-fix`, `m10g-portfolio-location`, `m11-qa-sweep`, `m11b-link-integrity`, `m11c-mobile-sweep`, `worktree-claude+m10c-brand-identity`.
- **Net:** **22 remote branches recommended for deletion**; not deleted by this sweep (operator runs `git push origin --delete …` per M.15-D2). `perf-m02-lighthouse` becomes delete-safe once Stream 6 lands.

**Commit:** `0add7f1` — `M.15 Stream 1: close M.14 (verified on main) + reconcile branch topology`.

---

## Stream 2 — Add the two missing city records → **DEFERRED**

**Deferred per Stream 2's own fallback ("not pinned → do not invent cities; surface the gap").**

`src/data/locations.ts` already holds **24 city records / 22 surfaced** (Lisle + Bolingbrook retired). The brief's "22 → add 2 → 24" maps onto a repo that is already at 24/22. There is **no authoritative master town-list in the repo** pinning which *specific* two towns to add, and the service area is a **business fact owned by Erick/Goran**. Inventing cities — or silently un-retiring Lisle/Bolingbrook — would fabricate a service-area claim.

**To unblock:** operator/Erick confirms the exact two town names (then Code adds them with full EN+ES parity, `Place` schema → sitewide `LocalBusiness @id`, hreflang, sitemap, breadcrumbs, internal links, per-city stats left neutralized like the other 22), **or** confirms 22 is the final count (Stream 2 closed moot), **or** that Lisle/Bolingbrook should be un-retired. Logged in `Sunset-Services-Decisions.md` (2026-06-19 Stream 2 entry).

**Commit:** `M.15 Stream 2: two-city add deferred pending confirmed city list`.

---

## Stream 3 — Upload available real photos to Sanity → **NO-OP this session (documented)**

**No-op per the brief's "no new real assets available" path.** Verified on this macOS session:
- The real photo corpus is **not reachable** — the `upload-m01c-photos.mjs` default `PHOTOS_ROOT` (`C:\sunset-photos\processed`, a Windows path) and `~/sunset-photos` do not exist here. Per M.01a/M.01b, the ~150 GB Google-Takeout corpus (≈258–330 web-ready edited JPGs + RAW/HEIC/video) lives on the operator's Windows machine/external drive.
- **No curation manifest** (`sanity-upload-plan.json`) exists in the repo — the upload script requires it.
- `SANITY_API_WRITE_TOKEN` is a placeholder locally (2-char) — no write path to the `production` dataset.
- The 127 images in `src/assets`/`public` are **generated placeholders / seed assets** (`gen-audience-service-placeholders.mjs`, Phase 1.20) and stock-style seeds, not real job photos.

**Surfaces still on generic/placeholder imagery (what the Erick photo drop will unblock):**
- All **24 city-page heroes** + the per-city **"Recent projects" tiles** (`LocalProjectsStrip` ships 3 placeholder tiles/city; the D7.A real-projects fallback is still un-wired — see TODO 1.16).
- All **audience/division** imagery (residential/commercial/hardscape tiles, the four division heroes).
- All **9 service** tile images + service hero images; home hero, home project tiles (`project-1..6`), about portrait.
- Blog/resource featured images (placeholders).
- The **three named Erick-pending spots** (unchanged, as required): Aurora "recent projects" tiles, Waterproofing division hero (`hero-residential.jpg`), Waterproofing quote-wizard tile.

**To unblock:** operator runs the M.01c pipeline on the Windows machine — build `sanity-upload-plan.json` from the extracted corpus, set a real `SANITY_API_WRITE_TOKEN`, then `node scripts/upload-m01c-photos.mjs --commit`. This sweep changed no image bindings.

**Commit:** `M.15 Stream 3: photo upload no-op on this session; remaining placeholders documented`.
