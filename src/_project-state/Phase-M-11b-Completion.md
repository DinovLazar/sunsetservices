# Phase M.11b — Link integrity crawl & fix — Completion report

**Date:** 2026-05-31 · **Branch:** `phase/m11b-link-integrity` (NOT merged to `main`) · **Base:** `origin/main@d587f17` (Phase M.11 merge)

One exhaustive Playwright crawl of every EN + ES page (both locales, no sampling), every broken / wrong-destination / missing-anchor internal link fixed **at source**, a permanent `npm run validate:links` regression gate shipped, and the un-fixable findings (dead external links, ambiguous destinations, Sanity-content gaps) reported for the operator. The branch is left clean and unmerged for Preview-verify → merge.

---

## 1. Base branch + M.11-fixes guard (M.11b-D1)

M.11 is merged into `main` — `origin/main` HEAD is `d587f17` ("Merge phase/m11-qa-sweep into main — Phase M.11"), which contains M.11's branch-tip `72542ab`. Verified via `git branch -a --contains 72542ab` (→ M.11_IN_MAIN) + the full M.11 commit series in `git log origin/main`. Base = **`origin/main`**.

**M.11-fixes guard — PASSED before any crawl:**
- (a) `git grep '?audience=' src/` → zero in-app link hrefs (every hit is `_project-state/*.md` history or a code comment noting its removal).
- (b) build-time service-slug-uniqueness assertion present at `src/data/services.ts:4007`.
- (c) `validate:seo` — M.11 closed it at 184·0/0; re-confirmed in the regression sweep (§7).

## 2. Execution incident (M.11b-E1) — concurrent M.10f session + worktree isolation

A **second Claude session was concurrently finishing Phase M.10f in the same main checkout** (`C:\Users\user\Desktop\SunSet-V2`). The reflog showed that session checking HEAD back to `phase/m10f-mobile-hero-fix`, resetting to `origin/phase/m10f-mobile-hero-fix`, and committing `02b6167` — all between this session's branch creation and its first commit. As a result, the M.11b plan-of-record commit initially landed on `phase/m10f-mobile-hero-fix` as `46e0ea1` instead of on the new branch.

**Resolution:** created an isolated git worktree (`.claude/worktrees/phase+m11b-link-integrity`) on `phase/m11b-link-integrity` (off `origin/main@d587f17`), entered it for the remainder of the phase, and re-applied the plan-of-record there (clean commit `0b4163c`). All M.11b work is isolated in the worktree; the main checkout was never touched again.

**Two operator clean-ups (both safe + reversible):**
1. **Stray commit on m10f.** `46e0ea1` ("chore(decisions): Phase M.11b plan-of-record") sits on top of the M.10f session's `02b6167` in the main checkout. Its content is correctly duplicated on the M.11b branch, so nothing is lost. When the M.10f session is idle, remove it with `git reset --hard 02b6167` in the main dir (restores m10f to exactly where M.10f left it; `46e0ea1` stays recoverable via reflog). This session did **not** reset it, to avoid racing the active M.10f session.
2. **Parked M.10f WIP.** M.10f's uncommitted `file-map.md` doc section + the untracked `Phase-M-10f-Completion.md` were parked in a labeled `git stash` on the `phase/m10f-mobile-hero-fix` branch (recover with `git stash pop` on m10f).

> **Lesson (mirrors M.11-E5):** start phase work by entering an isolated worktree *before* any branch/commit — a concurrent session can share the main checkout's HEAD.

## 3. The harness (M.11b-D9) — `scripts/validate-links.mjs`

Playwright headless-Chromium BFS crawler, same env-var + JSON-sidecar + exit-code contract as the B.04/B.05/B.06 harnesses (`BASE_URL` default `http://localhost:3000`, `BYPASS_TOKEN`, `VERCEL_SHARE_TOKEN` precedence priming `?_vercel_share=`, reserved `SKIP_REMOTE` doubling as the external-check kill-switch). Seeds from the live `/sitemap.xml` + the reachable-but-sitemap-excluded routes (`/thank-you/?firstName=Test` ×2 locales, `/unsubscribe/SAMPLE_TOKEN_INVALID` ×2, `/dev/system` ×2), then BFS-follows every same-origin internal link to exhaustion (370 pages crawled from 184 seeds).

Per unique internal URL it records the full redirect chain and classifies:
`OK` · `REDIRECT_SLASH_ONLY` · `REDIRECT_LOCALE_PREFIX` (new — the default-locale `/en` prefix that `localePrefix:'as-needed'` 307-strips; same logical page, so a warning not a hard failure) · `REDIRECT_DIFFERENT_PAGE` · `BROKEN` · `ERROR`. External links: HEAD→GET, 2 retries, report-only. Hash links: `getElementById`/`[name]` on the destination. Wrong-destination heuristic from `src/data/{services,locations,divisions}.ts` (report-only, high-false-positive tolerance). `/api`/`/og` handlers are status-checked leniently (405/400 on a GET proves the endpoint exists; only 404/410 = broken) and never BFS-crawled.

**Exit code:** default gate fails only on internal `BROKEN`/`ERROR`/`REDIRECT_DIFFERENT_PAGE`/`MISSING_ANCHOR`; `--strict` additionally fails on every warning. Gitignored sidecar `scripts/.links-validation-report.json` (+ reserved `.links-validation-cache.json`). `npm run validate:links` added to `package.json`.

## 4. Wave A — discovery (baseline crawl + SA1–SA6)

Six read-only discovery agents (SA1 global chrome / SA2 home+divisions+services / SA3 locations+map / SA4 content / SA5 conversion+utility+legal) plus the runtime crawl (SA6). **Baseline `--strict` crawl (pre-fix), 370 pages:**

| Class | Count | Disposition |
|---|---|---|
| `BROKEN` (internal 404) | **94** | FIXED |
| `REDIRECT_SLASH_ONLY` | 18 | FIXED (source) |
| `REDIRECT_LOCALE_PREFIX` (`/en…` 307) | 92 | JUSTIFIED (next-intl as-needed) |
| `REDIRECT_DIFFERENT_PAGE` | 0 | — |
| `ERROR` | 0 | — |
| `MISSING_ANCHOR` | 0 (crawl) / 1 (`#calendly`, source) | FIXED |
| external `DEAD` | 0 (5 checked) | — |
| NAP `tel:`/`mailto:` | 0 | clean |
| `POSSIBLE_WRONG_DESTINATION` (heuristic) | 9 | JUSTIFIED (false positives) |

**The 94 BROKEN decomposed to two root causes:**
1. **Featured-project tiles (≈92).** Division-landing (`AudienceFeaturedProjects`) tiles linked `/projects/<division>-one|two|three` (synthetic keys); service-detail (`ServiceFeaturedProjects`) tiles linked `/projects/<imageKey>` (e.g. `/projects/lawn-care-1`). Neither is a real project slug → 404 in both locales.
2. **Double-locale-prefix breadcrumb (2).** `/es/es` + `/es/es/projects` from the ES project-detail breadcrumb (the page passed locale-prefixed hrefs to the shared `<Breadcrumb>`, whose next-intl `<Link>` prepends the locale again).

Source audits additionally surfaced: the `?service=` deep-links (silently ignored by the wizard/projects index), the `#calendly` missing anchor (chat-panel link, not reachable by the crawl), the ambiguous footer "All services →" label, and the FooterLegal locale switch not preserving the current path. **Confirmed clean by the audits:** all 22 cities' `featuredServices` `(division,slug)` pairs, the SVG map pins (aria-label↔slug), `FilterChipStrip` (`?division=`, 4 chips), the PortableText link serializer, the wizard `?division=` reader, NAP everywhere, and zero `?audience=` / hardcoded `/en/` / old-IA in-app links.

## 5. Wave C — fixes (5 `phase(M.11b):` commits, one per coherent group)

| Commit | Fix |
|---|---|
| `96684f7` | **Featured-project tile 404s + `?service`→`?division`.** Division/service featured-project tiles now point at the division-filtered projects index (`/projects/?division=<slug>` — a valid 200, matching the band's existing "View all"). The quote-wizard CTAs (`ServiceHero`/`ServiceCTA`/`ServicePricing`), the `ServiceFeaturedProjects` "View all", and `AudienceUnilockBand` switched from the silently-ignored `?service=` to `?division=<slug>` (the wizard + projects index only read `?division=`). `division` threaded into `ServiceCTA`/`ServicePricing`/`ServiceFeaturedProjects` from the route param. |
| `68514ca` | **`/es/es` double-locale-prefix.** `projects/[slug]` breadcrumb hrefs made locale-less (per the `<Breadcrumb>` contract — next-intl adds the prefix); the JSON-LD `BreadcrumbList` items derive the locale-correct absolute path separately, so schema URLs are unchanged. |
| `36ec201` | **`/contact#calendly` missing anchor.** Added `id="calendly"` to the Calendly `<section>` (already `aria-labelledby`). Verified present on `/contact` + `/es/contact`. |
| `0f1cea5` | **Trailing-slash redirects.** `ProjectFacts` city link guarded — for Sanity projects whose `citySlug` is empty, `/service-areas/${''}/` collapsed to a bare `/service-areas/` (308 + wrong destination); now renders plain text when no city resolves, and the trailing slash is dropped. Blog-detail quote CTA dropped its trailing slash. |
| `f9577fc` | **Harness lint cleanup** — removed an unused `--only` var from `validate-links.mjs`. |

## 6. M.11b-D4 — trailing-slash decision (documented, per the brief)

**Investigated served behavior, then decided: leave the next-intl `<Link>` convention as-is; fix only the few sources that genuinely 308.** Empirically (homepage curl + the 370-page crawl), next-intl's `Link` normalizes trailing slashes on the default-locale path, so the bulk of in-app `<Link href="/x/">` render `/x` and never 308 — a mass rewrite would touch ~50 files for zero functional gain (not a clean low-risk win). The only genuine slash-only 308s were two specific non-normalizing sources — the blog-detail raw `<a>` CTA and the empty-`citySlug` `ProjectFacts` link — both fixed in `0f1cea5`. Schema/canonical URLs are normalized by `src/lib/seo/urls.ts` (validate:seo green), so the trailing slashes the source audits flagged there are non-issues.

## 7. `--strict` warnings — fixed or justified

- **Slash-only (18):** FIXED at source (§5 `0f1cea5`).
- **Locale-prefix `/en…` 307s (92):** JUSTIFIED. These are next-intl `localePrefix:'as-needed'` locale-switch links — the language switcher (`<Link href={pathname} locale="en">` → `/en/<path>`, path-preserving) and the footer-legal switch (`href="/" locale="en"` → `/en`). Each 307s to the correct EN page; the prefix-strip is idiomatic next-intl behavior, not a broken link. Left as-is.
- **Wrong-destination heuristic (9):** JUSTIFIED — all false positives. They are "recent work" project tiles on `/es` + `/es/about` whose leading division chip ("Hardscape") matched a division name while the href (correctly) points at a project detail page. The heuristic is high-false-positive-tolerance by design.

## 8. Reported (not auto-fixed) — operator follow-ups

- **Dead external links:** **none.** All 5 external links checked returned OK (no `DEAD`).
- **`tel:`/`mailto:` NAP:** clean — all match `(630) 946-9321` / `info@sunsetservices.us`.
- **Sanity-content gap (M.11b-D6):** several portfolio projects have an **empty `citySlug`** in Sanity (`sanity-adapters` defaults it to `''`), which is why the project "City" facts row had no valid city link. The code now degrades gracefully (plain text), but for the city link + city schema to populate, the operator should set `citySlug` on those project documents in Sanity Studio (doc type `project`, field `citySlug`, value = the city's slug, e.g. `north-aurora`). **No `scripts/fix-content-links.mjs` was needed** — the crawl rendered every Sanity-driven blog/resource/project page and found **zero broken internal links inside PortableText bodies or CTA href fields**; the only content gap is the missing `citySlug` (a data-presence issue, not a wrong-href issue).
- **Ambiguous destination — flag for confirmation (M.11b-D5):** the footer **"All services →"** link (`src/lib/constants/navigation.ts`) points at `/landscape/` (the Landscape division), which is misleading for an "all services" label (there is no all-services index page). Recommend either relabeling it to "Landscape services" or pointing it at the homepage (`/`), which surfaces all four divisions. Left unchanged pending your call.
- **UX recommendation (not a broken link):** the **footer-legal locale switch** sends the visitor to the *other locale's homepage* (`/` → `/en`) rather than the current page's translation; the main language switcher correctly preserves the path. Consider aligning the footer switch with the main switcher. Left unchanged.

## 9. Intentional behavior preserved (M.11b-D10)

The 56 `next.config.ts` IA redirects, the noindex `/thank-you/` routes, the Termly "preparing" fallback legal routes (200), `/dev/system`, the reconciled-out `aurora-driveway-apron` slug (confirmed no in-app link points at it), blocked-integration flags, and consent gates were all confirmed intentional and **left unchanged**. Only in-app links pointing at OLD destinations were repointed.

## 10. Verification matrix

_(to be completed at phase close — localhost + Vercel Preview crawl, full regression)_

| Check | Result |
|---|---|
| `validate:links` default gate — localhost | _pending_ |
| `validate:links` default gate — Vercel Preview | _pending_ |
| `validate:links --strict` — hard failures | _pending_ |
| `npx tsc --noEmit` | 0 |
| `npm run lint` | 0 errors |
| `npm run build` | succeeds (~190 pages) |
| `npm run validate:schema` | _pending_ |
| `npm run validate:seo` | _pending_ |
| `npm run validate:a11y` | _pending_ |
| `npm run validate:related-links` | green (prebuild) |
| `npm run test:*` | _pending_ |

## 11. Remaining user actions

1. Verify on the Vercel Preview, then merge `phase/m11b-link-integrity` → `main`.
2. Clean up the stray `46e0ea1` on `phase/m10f-mobile-hero-fix` (§2.1) and pop the parked M.10f stash (§2.2).
3. (Optional, content) set `citySlug` on the portfolio projects missing it (§8); decide the footer "All services →" target (§8).
