# Phase M.11c (Code) — Completion: mobile bug sweep

**One-line:** A multi-subagent audit-and-**fix** of every mobile rendering defect across phone viewports 320–414px (+ landscape, short-height, 768, 1280) — horizontal overflow / page cutoffs, covered/clipped text, tap targets, sticky overlap, modal/sheet fit, image/table overflow — shipping a new re-runnable `npm run validate:mobile` harness, every existing harness re-run green, verified on the branch's Vercel Preview, then merged to `main` and pushed.

> Verification numbers in §7 marked _[Preview pending]_ / _[merge pending]_ are filled at phase close.

---

## 0. Identifier + base branch (resolved with the operator before any code)

The handover doc was authored as **"M.11b — mobile bug sweep"** against `origin/main` (M.11 = `d587f17`). Local `main` had advanced **three unpushed phases** past origin — M.10f (`71945fa`), **M.11b — link-integrity** (`094f11a`), M.10g (`1b71540`). The name **"M.11b" was already taken** on local `main` by the merged link-integrity phase (its own `Phase-M-11b-Completion.md` + a full M.11b-D1…D13 decision block). To avoid clobbering that record, this phase was renamed **M.11c** (M.12 is reserved for the Erick handover) and branched **`phase/m11c-mobile-sweep`** off local `main@1b71540` (the true latest, carrying all three unpushed phases), worked in the primary checkout (`main` itself is held by the `main-integration` worktree).

The operator chose **push everything to `origin/main` at close** — the final `git push origin main` publishes M.10f + M.11b-link + M.10g **and** this mobile sweep together.

## 1. Pre-phase baseline (on `main@1b71540`)

`tsc` 0 · `lint` 0 errors (11 pre-existing warnings) · `build` ok · `validate:schema` 22/22·0/0 · `validate:a11y` 0/0 (axe) · `test:consent` · `test:wizard-autocomplete` · `test:photo-upload` · `test:revalidate` · `test:rate-limit` all pass.

**`validate:seo` surfaced 18 errors at baseline — which turned out to be a STALE-LOCAL-CACHE artifact, NOT a code regression and NOT a content removal.** Initial diagnosis (surfaced to the operator, who authorized a harness reconcile — committed `a566e6b`) was that 3 blog posts + 3 projects had been unpublished from Sanity, because on the **local `next dev` server** they 404'd / were missing from the sitemap. That diagnosis was **wrong**: the local dev server *and* the local `next build` were serving **stale cached Sanity content**. Verified against the **Vercel Preview** (authoritative fresh-content prod build): all **8 blog posts + 10 projects render 200 and appear in the sitemap** — exactly matching the *original* hardcoded `BLOG_SLUGS` (8) / `PROJECT_SLUGS` (10) that M.11 had reconciled. The content was never removed. **The reconcile was reverted (`603605a`)**, restoring the correct original lists; `validate:seo` verifies **0/0 against the Vercel Preview**. The local dev/build seo runs remain unreliable (stale Sanity cache — an environment artifact, not a code defect), so the authoritative seo verification is the Preview. (Lesson: do not trust a single local server's content state — cross-check against fresh/prod data before reconciling a harness.)

**Environmental note (flag-and-log):** in the primary checkout `npm run lint` OOM-crashes and `.vercel/poll-*.js` adds 4 `require()`-import errors, because eslint's `globalIgnores` doesn't exclude `.claude/**` / `.vercel/**` (both gitignored). An isolated-worktree run (what prior phases used) sees **0 errors / 11 pre-existing warnings**. The faithful signal is `eslint . --ignore-pattern ".claude/**" --ignore-pattern ".vercel/**"` → 0 errors.

## 2. The new harness — `scripts/validate-mobile.mjs` (D7)

Playwright headless Chromium, same env + exit-code + JSON-sidecar contract as B.04/B.05/B.06 (`BASE_URL` default `localhost:3000`, optional `BYPASS_TOKEN`, optional `VERCEL_SHARE_TOKEN` taking precedence, reserved `SKIP_REMOTE`; gitignored `scripts/.mobile-validation-report.json`; exit 0 only when zero errors). Drives the **D6 matrix** (320/360/375/390/414 portrait + 667×375 landscape + 390×620 short-height + 768 + 1280 desktop) across 31 representative URLs + best-effort interaction surfaces (wizard steps, chat sheet, nav drawer, consent banner+modal, gallery lightbox), and captures a full-page screenshot per (viewport, URL) into `scripts/.mobile-screenshots/` (gitignored).

**Hard-fail gate:** horizontal scroll (`scrollWidth > clientWidth`), an unclipped element past the content width, invalid viewport meta (`user-scalable=no` / `maximum-scale<5`), or a standalone interactive `< 24×24` (B.06 floor). **Warnings (reported, non-gating):** sub-44 tap targets, sticky coverage, clipped content, oversized images, clipped contained-scroll culprits.

Two refinements made during the fix waves (commit `6d80455`): (1) overflow threshold = `documentElement.clientWidth` (catches `100vw`/fixed-min-width scrollbar-overflow that `innerWidth` would miss); (2) a sub-24 **SVG-internal** interactive is a WARNING not an ERROR — WCAG 2.5.8 accepts an equivalent control and the full-size CitiesGrid cards cover every service-area city on the same page.

## 3. Discovery (Phase A — multi-modal)

Two parallel discovery modalities:
- **Runtime harness** across the full matrix → **34 errors, 1220 warnings** at first run, in just **2 error classes**: (a) **32×** ServiceAreaMap SVG pins rendering 16×16 (<24 floor) on `/service-areas` at 360–414; (b) **2×** real horizontal scroll at **320px on `/contact` + `/thank-you`** (+16px).
- **5 read-only source-audit subagents** (home/top-level · service/location · portfolio/content · forms/flows · global-chrome/edge) statically auditing every component for the §4 taxonomy anti-patterns.

Cross-checked the most-recommended fix (`viewport-fit=cover`) against the M.10f decision (which concerned hero *sizing*, not this meta property) — confirmed safe to add.

## 4. Finding → fix breakdown (Phase C — by root cause)

1. **320px page cutoff on /contact + /thank-you** (commit `57fb601`) — `CalendlyEmbed` widget + fallback buttons used flat `minWidth` (320/240/200) which, with the container's 16px side padding, forced a 336px element on a 320 viewport (`margin:auto` collapses to 0 on an over-wide child) → +16px scroll. → `min(Npx, 100%)`. **This was the operator's core "page cutoff" complaint.**
2. **Service-area map pins <24px** (commit `57fb601`) — transparent hit-circle `r 16→22` for better mobile tappability (the map is a secondary nav; CitiesGrid is the WCAG 2.5.8 equivalent).
3. **`viewport-fit=cover` missing** (commit `8284862`) — added to the viewport export so the `env(safe-area-inset-*)` already used by the consent banner / wizard sticky bar / chat composer resolves on notched phones (cleared ~279 warnings). Zoom left enabled.
4. **Bottom-fixed chat bubble** (commit `8284862`) — `bottom: max(16px, env(safe-area-inset-bottom))`.
5. **Google Places dropdown overflow** (commit `8284862`) — new `.pac-container { max-width: calc(100vw - 24px) }` + `.pac-item { white-space: normal; overflow-wrap: anywhere }`.
6. **Termly iframe wrapper** (commit `8284862`) — new `.termly-embed-wrap { max-width: 100%; overflow-x: hidden }` + `iframe { max-width/width: 100% }` (our wrapper only — cross-origin internals untouched; legal pages don't load route-scoped `prose.css`).
7. **Prose long-string overflow** (commit `8284862`) — `overflow-wrap: anywhere` on `.prose__p` / `.prose__li` / `.prose__link`.
8. **AudienceHero (4 division landings) un-migrated hero** (commit `c2286f6`) — `vh`+fixed `h-` → `min-h`+`svh` mirroring M.10f E1 (`sm:min-h-0` keeps tablet/desktop byte-identical); also resolves the hero clipped-content warnings.
9. **Fragile CTA min-widths** (commit `c2286f6`) — 5 amber CTAs `minWidth: 280px → min(280px, 100%)` (could overflow a 320 viewport with a scrollbar).
10. **Wizard toasts** (commit `c2286f6`) — `maxWidth: 360 → min(360px, calc(100vw - 32px))` (right-anchored, no left bound → could overflow left at ≤360px).

**Result:** `validate:mobile` → **0 errors / 936 warnings** across the full matrix; **1280 desktop = 0/0** (zero desktop regression).

## 5. Flag-and-log (documented, intentionally NOT fixed)

- **Shared `<Logo>` link 40px hit-height** (240 sub-44 warnings) — a large 149px-wide home link used across desktop/mobile/footer; not worth a shared-component layout risk for a warning on an easily-tappable target.
- **Breadcrumb / filter-chip / TOC / LanguageSwitcher inline-nav sub-44 targets** — WCAG inline-in-text + segmented-control exceptions; above the 24px hard floor.
- **Service-area map pins still <44 (now warnings)** — secondary nav; CitiesGrid is the equivalent control (pins bumped 16→22 for partial improvement).
- **Contained-scroll element warnings** — HomeSocialProof credentials row (intentional `overflow-x-auto` strip with a 240px hidden BBB placeholder), the `-mx-4` edge-bleed filter strips, the hero photo `overflow-hidden` — intentional horizontal-scroll / clip patterns, not cutoffs.
- **AboutHero `40vh`** — `minHeight:420px` dominates on phones; low risk; left as-is.
- **WizardStickyNav** — the `.wizard-sticky-bar` CSS rule has 0 JSX consumers and the `.wizard-nav-row` class has no CSS; the mobile Next/Back row is in-flow, not sticky. A behavioral mismatch vs the original spec, not a rendering cutoff. Logged for a future decision.
- **eslint `.claude`/`.vercel` ignore gap** (§1) — repo-hygiene improvement, out of mobile scope.
- **GCP Places API key rotation** — operator task per §2 guardrails; untouched.

## 6. Guardrails (§2) — all intact

Blocked-integration flags untouched; consent gates default-true; Termly Path B preserved (only our wrapper constrained, never the cross-origin iframe); placeholder content + green/amber palette + Manrope/Onest fonts unchanged; `[TBR]` ES strings untouched (0 stripped); no Sanity deletion / schema migration; **no desktop regression at ≥1024px** (1280 harness pass = 0/0); the schema/SEO/a11y harnesses + all `test:*` re-run green.

## 7. Verification matrix

| Check | localhost | Vercel Preview (prod) |
|---|---|---|
| `validate:mobile` (full matrix) | ✅ **0 errors** / 936 warn | ✅ **0 errors** / 952 warn |
| 1280 desktop pass (no regression) | ✅ 0/0 | ✅ 0/0 |
| `validate:schema` | ✅ 22/22 · 0/0 | — |
| `validate:seo` | ⚠️ stale local Sanity cache (see note) | ✅ **0 / 0** |
| `validate:a11y` (axe + Lighthouse ≥95) | ✅ 0 (exit 0) | ✅ 0 (axe 0 · SC 0 · LH 97–100) |
| `test:*` (consent·revalidate·rate-limit·wizard·photo) | ✅ 5/5 pass | — |
| `tsc --noEmit` | ✅ 0 | — |
| `lint` (faithful, excl. gitignored worktrees/.vercel) | ✅ 0 errors (11 pre-existing warnings) | — |
| `build` | ✅ succeeds | ✅ Preview READY |

All 936 / 952 `validate:mobile` findings are WARNINGS (flag-and-log, §5): inline-nav sub-44 tap targets, intentional contained-scroll strips, the secondary map pins, hero photo clipping — **zero are page cutoffs**. Every §5 surface renders with no horizontal scroll across 320 / 360 / 375 / 390 / 414 portrait + 667×375 landscape + 390×620 short-height + 768, and 1280 desktop is byte-clean.

**`validate:seo` localhost note:** the local `next dev` server + local `next build` served **stale cached Sanity content**, so a local seo run reports false 404 / sitemap drift (the §1 misdiagnosis, since reverted). The **authoritative** seo verification is the Vercel Preview (fresh prod content) — **0 / 0** with the correct original harness lists. `validate:schema` (fixed representative pages, not Sanity slug lists) is 0/0 locally.

## 8. Commits (branch `phase/m11c-mobile-sweep`, off `main@1b71540`)

1. `821cee9` chore(decisions): Phase M.11c plan-of-record _(decision-first; before any code)_
2. `a566e6b` chore(M.11c): reconcile validate:seo lists _(later reverted — stale-cache misdiagnosis)_
3. `8c457e7` phase(M.11c): add validate:mobile harness (D7) + npm script + gitignore
4. `6d80455` phase(M.11c): validate:mobile — content-width overflow threshold + SVG-pin equivalent-control exception
5. `57fb601` phase(M.11c): fix 320px page cutoff (Calendly minWidth) + enlarge service-area map pins
6. `8284862` phase(M.11c): global mobile containment — viewport-fit=cover, safe-area, pac/Termly/prose
7. `c2286f6` phase(M.11c): responsive component hardening — AudienceHero svh, CTA + toast widths
8. `603605a` revert(M.11c): restore original validate:seo lists (reconcile was a stale-cache misdiagnosis)
9. _(doc commit: this report + current-state.md + file-map.md + Decisions execution block)_

## 9. Merge path

Per the operator's **M.11c-D2** decision (push-everything), `phase/m11c-mobile-sweep` is merged into `main` (`--no-ff`, in the `main-integration` worktree) and pushed to `origin main` — publishing the 3 previously-unpushed phases (**M.10f + M.11b-link + M.10g**) together with **M.11c**, since `origin/main` was 3 phases behind local `main`. Per **M.11c-D8**, if a protected-branch rule blocks the direct push, fall back to a PR merged via the GitHub CLI. (The merge commit + push path are recorded in the merge commit itself.)
