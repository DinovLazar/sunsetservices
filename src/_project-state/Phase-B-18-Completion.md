# Phase B-18 · Code — Completion Report

**Phase:** B-18 · Code — Canonical host correction, V1 legacy-URL redirects, SEO ranking playbook
**Date:** 2026-07-18
**Branch:** `main`, working tree, uncommitted. **Goran pushes.**
**Author:** Code (Cowork session, follow-on from B-17)
**Outcome (one line):** Fixed two live defects — every canonical URL on the site pointed at a host that redirects, and four indexed legacy URLs were returning 404 — and wrote the operator-facing ranking playbook.

---

## 1. What shipped (plain language)

B-17 added new SEO infrastructure. B-18 fixed things that were **already broken in production**, found by actually checking the live site rather than reading the code.

1. **The site was telling Google the wrong address on every page.** Production serves from `www.sunsetservices.us`; the apex 308-redirects to it. But `BUSINESS_URL` was the apex, so every canonical tag, hreflang, sitemap `<loc>`, OG URL, and schema `@id` named a host that immediately redirects. Now corrected to `www`.

2. **Four URLs Google still has indexed were returning 404.** The V1 WordPress paths were never redirected during the rebuild. People clicking them from search results were landing on an error page, and the ranking signal those pages earned was being discarded.

3. **A ranking playbook** at `docs/SEO-Ranking-Playbook.md` — Search Console, Bing, Business Profile, reviews, the monthly routine, and an explicit "what to ignore" list.

---

## 2. Definition of Done (derived — no phase prompt; Goran's ask was open-ended)

- ✅ **Canonical host mismatch identified and fixed** — evidence: `curl -sI https://sunsetservices.us/` → `308 → https://www.sunsetservices.us/`; live homepage HTML carried `<link rel="canonical" href="https://sunsetservices.us"/>` while served from `www`. `BUSINESS_URL` changed; `SITE_URL` and all 8 `src/lib/schema/*` builders derive from it.
- ✅ **Legacy 404s identified** — evidence: all four return 404 live, and all four are still returned by `site:sunsetservices.us`. Confirmed by `curl -o /dev/null -w "%{http_code}"`.
- ✅ **Redirects written and typecheck clean** — evidence: `TSC_EXIT=0`. 22 pairs × 2 slash-variants = 44 entries.
- ✅ **All redirect destinations verified live** — evidence: 14 target paths curl'd, all `200`. `/blog/why-is-my-lawn-yellow` confirmed present in the live sitemap.
- ✅ **SERP appearance audited** — evidence: titles, meta descriptions, OG tags, and JSON-LD pulled from 4 live pages. `BreadcrumbList` and `FAQPage` both confirmed present on service pages.
- ✅ **Playbook written** — `docs/SEO-Ranking-Playbook.md`.
- ❌ **`npm run lint` not run** — same sandbox limitation as B-17 (never completes). Run locally before push.
- ❌ **`next build` not run** — same SWC-binary platform mismatch as B-17. **`next.config.ts` changes are build-time config and have NOT been exercised by an actual build.** This is the main risk in this phase — see §7.
- ❌ **Redirects not tested against a running server** — they typecheck, but no request has been made through them.

---

## 3. Decisions I made during this phase

1. **Chose `www` as canonical — but this was Goran's call, not mine.** I presented both options; Goran picked "switch to www." I implemented it by changing `BUSINESS_URL` rather than setting `NEXT_PUBLIC_SITE_URL` in Vercel, because the eight `src/lib/schema/*` builders interpolate `BUSINESS_URL` **directly** and ignore `SITE_URL`. Setting only the env var would have moved canonicals to `www` while leaving every schema `@id` on the apex — a worse, split state than the one we started in. · **needs a decision-log entry: YES**, including that latent drift bug.
2. **Included ~18 inferred legacy redirects alongside the 4 confirmed ones** · the V1 URL list can't be enumerated (site gone, no archive in-repo, search surfaces only 5 URLs). A redirect for a path nothing requests is inert; one that catches a real legacy URL recovers signal. Marked CONFIRMED vs INFERRED in the code comment so a future reader knows which is evidence and which is guess. · alternative rejected: ship only the 4 proven ones (misses whatever else is out there). · needs a decision-log entry: no.
3. **No `/es` variants for legacy redirects** · the V1 site was English-only, so `/es/about-us/` never existed and never earned anything. Deliberately breaks the pattern `buildRedirects()` established. · needs a decision-log entry: no.
4. **Both slash-variants listed explicitly** · without the with-slash source, `/about-us/` would chain `→ /about-us → /about` (two hops, diluted signal). Follows the existing M.01e convention. · needs a decision-log entry: no.
5. **Did not extend the dynamic OG route to service/location pages** · it currently supports `blog` and `resource` only; everything else uses the generic `/og/fallback` card. Doing it properly means picking a hero image per service and is a real chunk of work, not a quick win. Logged as a finding instead. · needs a decision-log entry: no.
6. **Did not touch live meta-description copy** · `/service-areas/naperville` ends with "Free estimates within 5 days," which brushes against BG-01 §8.5's ban on unqualified free-estimate language. It's arguably qualified by the timeframe, it's live copy, and it's the marketing project's call, not Code's. Flagged, not changed. · **needs a decision-log entry: NO — but needs Goran/Erick's eyes.**

---

## 4. Deviations from the brief

- Goran asked "did you make the Google result look better." **Honest answer: B-17 did not, and I should not have let that go unstated.** The breadcrumb and FAQ rich results that make Sunset's listings look good were already shipped in B-04/B-05 — B-17 added entity data that helps Google *understand* the business, which is a different thing from how the listing *renders*. B-18's www fix does improve it indirectly (OG and canonical URLs now resolve without a redirect hop). Two genuine appearance defects were found and are logged in §7, one fixed (host), one not (title length — it's Sanity content, not code).
- No IndexNow implementation. It's referenced in the playbook as a Bing Webmaster Tools toggle, which gets most of the benefit for zero code.

---

## 5. Changed files / deliverables

| File | Change |
|---|---|
| `src/lib/constants/business.ts` | `BUSINESS_URL` → `https://www.sunsetservices.us`, with the evidence and reasoning in the docblock |
| `next.config.ts` | `buildLegacyRedirects()` added (22 pairs → 44 entries); `redirects()` returns both sets concatenated |
| `docs/SEO-Ranking-Playbook.md` | New — operator-facing, ~200 lines |

No secrets. No dependency changes. No new env vars.

**Commit / PR:** none — uncommitted per Goran ("i will push").

---

## 6. State updates done

- ⚠️ **`current-state.md` — NOT updated.** Still outstanding from B-17 as well.
- ⚠️ **`file-map.md` — NOT updated.** Owes entries for the five B-17 files plus `docs/SEO-Ranking-Playbook.md`.
- **Decision log** — two entries owed (§3.1, §3.2), plus the three still owed from B-17.

---

## 7. Risks, follow-ups, what the next phase needs to know

**Highest risk in this phase:**

1. **`next.config.ts` was edited but never built.** Redirect config errors surface at build/boot time, not typecheck. **Run `npm run build` locally before pushing.** If it builds, the redirects are almost certainly fine; if it doesn't, it fails loudly and obviously.

2. **The www switch will cause a temporary ranking wobble.** Every canonical, hreflang, sitemap entry, and schema `@id` changes host at once. Google must reprocess the lot. Expect 1–3 unsettled weeks. **This is expected behaviour, not a regression — do not revert it partway through.** Re-submit the sitemap in Search Console right after deploy to speed it up.

3. **Verify after deploy:** (a) `curl -sI https://sunsetservices.us/about-us/` lands on `/about`, not 404; (b) live homepage canonical reads `https://www.sunsetservices.us`; (c) sitemap `<loc>` entries carry `www`.

**Findings not actioned:**

4. **Over-long blog titles.** `/blog/why-is-my-lawn-yellow` has a 106-character title; Google truncates around 60. Sanity content edit, not code. Worth auditing all 8 posts.
5. **Service, location, and division pages all share one generic OG image** (`/og/fallback`). The dynamic OG route only handles `blog` and `resource`. A real improvement, sized as its own phase.
6. **NAP inconsistency in the wild.** A Yelp listing shows *"Sunset Landscaping & Pro Brick Paving, 629 S Broadway, Aurora"* — different name, different address. A Facebook page shows *"Sunset Lawn Service & Pro Brick."* Inconsistent name/address/phone is a well-documented drag on local ranking. **Needs Erick to say which listings are current** before anything is updated or claimed. This is also why the found Facebook URL is still not wired into `sameAs`.

**Still blocking, carried from B-17:**

7. `sameAs` remains empty — the largest single on-site gap. Env-only fix once Erick confirms the profiles.
8. `BUSINESS_GEO` remains null — needs the coordinates from the Business Profile pin.

**Free win available now:**

9. **The weekly GSC digest is already built and switched off.** `src/app/api/cron/seo-summary-weekly` runs Mondays 09:00 per `vercel.json`. Setting `GSC_ENABLED=true` and `GSC_SITE_URL=sc-domain:sunsetservices.us` after Search Console verification turns on an automatic Telegram report with no further work.

---

## 8. What's now possible that wasn't before

Google is being told one consistent address for the business instead of two, the traffic still arriving at old WordPress URLs now lands on the right page instead of an error, and Goran has a written routine that doesn't require him to understand any of it.
