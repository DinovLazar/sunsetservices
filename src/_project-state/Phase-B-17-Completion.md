# Phase B-17 · Code — Completion Report

**Phase:** B-17 · Code — AI / answer-engine indexability: `llms.txt`, explicit AI-crawler policy, expanded sitewide entity graph
**Date:** 2026-07-18
**Branch:** worked directly on `main` (working tree, uncommitted at time of writing — `2cf0f3c` was HEAD). **Not pushed by Code; Goran pushes.**
**Author:** Code (Cowork session, requested by Goran)
**Outcome (one line):** The site now states who Sunset Services *is* in a form Google and AI assistants can consume without inference, and explicitly invites the AI crawlers that feed ChatGPT, Claude, Perplexity, and Google's AI Overviews.

---

## 0. Framing — this was not a phase from the phase plan

Goran's request in chat was open-ended: *"write all the files for google and llms to be able to index sunset better so we have better SEO and rank higher on google and ai recommendations."* There was no phase prompt and therefore **no pre-written Definition of Done**. §2 below is a DoD I derived from that request and the three scoping answers Goran gave, and it is marked as such so nobody mistakes it for a ratified checklist.

The phase number `B-17` was chosen because `B-16` was the highest existing B-phase. Code comments originally said `B.20`; they were renamed to `B.17` before filing so the code and this report agree.

---

## 1. What shipped (plain language)

Three things, in descending order of how much they actually matter:

1. **The sitewide structured-data block got much more complete.** Search engines and AI assistants resolve a business to an *entity* before they resolve it to a page — the entity is what gets recommended when someone asks "who does paver patios near Aurora?" That block previously listed 6 city names and almost nothing else. It now carries all 22 cities Sunset has pages for, all 34 services with links to their own pages, business hours, founding year, the Unilock credential, the logo, and the fact that the company operates in English and Spanish.

2. **AI crawlers are now explicitly welcomed by name** in `robots.txt` — 21 of them, covering OpenAI, Anthropic, Google, Perplexity, Apple, Meta, and others. They were already permitted by the catch-all rule; naming them removes the ambiguity and applies the same privacy-motivated exclusions (the API routes and the tokenised unsubscribe URLs) that Googlebot already gets.

3. **Two new plain-text files, `/llms.txt` and `/llms-full.txt`,** give an AI assistant a clean map of the company and every page on the site, generated automatically from the same data the website renders from.

**What this does not do:** none of it invents a fact, and none of it is a ranking guarantee. Two of the highest-value signals available — confirmed social profile URLs and the map coordinates — are still missing and need Erick. See §7.

---

## 2. Definition of Done (derived — see §0)

Goran's three scoping answers were: *allow all AI crawlers* · *"find what you can on the site and on the google profile, that's all I have"* · *full build*.

- ✅ **AI crawlers explicitly allowed in `robots.txt`** — evidence: `robots()` executed directly, output shows 3-block structure; block 2 carries all 21 agents with `allow: '/'` and the shared disallow list. Full output captured in session.
- ✅ **`/llms.txt` route exists and returns real content** — evidence: `buildLlmsTxt()` executed, **8,124 bytes**, renders the full company-facts block, 22 named cities, all 5 divisions, 34 service links.
- ✅ **`/llms-full.txt` route exists and degrades safely** — evidence: `buildLlmsFullTxt()` executed, **18,343 bytes**, 12 sections. Sanity was unreachable from the sandbox, so this run exercised the **fallback path** — it returned a 200 with the static half plus index links rather than throwing. That is the designed behaviour; the Sanity-populated path is **unverified** (see ⚠️ below).
- ⚠️ **Blog / resource / project inventory inside `llms-full.txt`** — code is written and typechecks, but **never executed against a live Sanity dataset**, because the sandbox has no CMS network access. Must be eyeballed on the Vercel preview: fetch `/llms-full.txt` and confirm `## Blog posts`, `## Resource guides`, and `## Completed projects` sections appear with real entries instead of the one-line fallback.
- ✅ **Entity graph expanded** — evidence: `buildSitewideGraph()` executed, **14,774 bytes** (was ~600), `JSON.parse` round-trips clean. `areaServed` = 22 typed `City` nodes; `hasOfferCatalog` = 5 divisions / 34 services; `openingHoursSpecification` Mon–Fri 07:00–17:00.
- ✅ **No fabricated facts shipped** — evidence: same run asserts `has geo? false · has sameAs? false · has aggregateRating? false`. Every emitted value traces to `constants/business.ts`, `data/services.ts`, `data/locations.ts`, or `chat/knowledgeBase.ts`.
- ✅ **`tsc --noEmit` clean** — evidence: `TSC_EXIT=0`, run twice (once after the initial build, once after the B.20→B.17 rename).
- ❌ **`npm run lint` not completed** — started three times; still running after ~5 minutes of polling each time and never produced output in the sandbox. **Not run to completion, so not claimed as passing.** Must be run locally before push.
- ❌ **`next build` not completed** — the sandbox stalled indefinitely downloading `@next/swc-linux-arm64-gnu` (the checked-in `node_modules` is macOS-arm64). Worked around by compiling the modules with `tsc` and executing them under plain Node, which is what produced the byte counts above. **A real `next build` has not been run.** This is the single biggest verification gap — see §7.

---

## 3. Decisions I made during this phase

Six. None of these were specified by Goran.

1. **Omitted `aggregateRating` from the `LocalBusiness` node** · the real 4.8★/38 GBP figure lives in `constants/reviews.ts` and adding it would have been the obvious "more schema = better" move, but Google's structured-data policy explicitly disallows *self-serving* `aggregateRating` — a business publishing a rating about itself. It is ineligible for rich results and is a documented manual-action trigger. · alternative rejected: ship it and hope (real penalty risk for zero rich-result upside). · **needs a decision-log entry: YES.**
2. **Omitted `geo`** · `data/locations.ts` has a lat/lng for the *city* of Aurora (41.7606, −88.3201), which is the municipal centroid and roughly two miles from 1630 Mountain St. Publishing it would have put a wrong pin in the entity graph, contradicting the Google Business Profile — the source Google actually trusts. `BUSINESS_GEO` is `null`; the builder omits the property. · alternative rejected: use the city centroid (a wrong pin is worse than no pin). · **needs a decision-log entry: YES.**
3. **Did not hardcode the Facebook URL found by web search** · a public search surfaced `facebook.com/SunsetLawnService` under the *older* "Sunset Lawn Service & Pro Brick" name. `sameAs` is how Google confirms entity identity; an unconfirmed profile under a retired name would actively fight the current DBA for the brand entity. Wired `sameAs` to the existing `NEXT_PUBLIC_SOCIAL_*` env vars instead, so it stays empty until Erick confirms. · alternative rejected: ship the found URL (fabrication-adjacent; violates the truth rule). · **needs a decision-log entry: YES.**
4. **Emitted Mon–Fri hours only, not Saturday** · `chat/knowledgeBase.ts` says "Sat by appointment," which is not an open window. Marking Saturday open in `openingHoursSpecification` would send customers to a closed shop and contradict the GBP. · alternative rejected: emit Sat 07:00–17:00 (factually wrong). · needs a decision-log entry: no — it follows directly from the existing verified hours string.
5. **Made `llms.txt` a generated route rather than a static `public/llms.txt`** · the content derives from 34 services, 5 divisions, and 22 cities, all of which change; a hand-maintained copy is a promise to remember to update it, and nobody remembers. Generating from the typed seed makes it correct by construction. · alternative rejected: static file (simpler by one file, stale within a month). · needs a decision-log entry: no — implementation detail.
6. **Extracted the entity graph out of `layout.tsx` into `lib/schema/organization.ts`** · it grew from ~25 lines to ~240 and no longer belonged inline. Exported `LOCAL_BUSINESS_ID` / `ORGANIZATION_ID` as named constants because per-page builders reference those `@id`s. · alternative rejected: leave it inline (unreadable at that size). · needs a decision-log entry: no — refactor, no behaviour change.

---

## 4. Deviations from the brief

- **Goran asked to "write all the files."** I did not add `ai.txt` (a competing, less-adopted convention that would duplicate the robots.txt policy) or `security.txt` (unrelated to SEO). Both were judged noise rather than signal. Say the word if either is wanted.
- **No new page content was written.** The request could be read as including copy work — new FAQ entries, more location text, entity-rich body copy. I read it as infrastructure and stayed there. Content is where the *next* real gains are, and it needs Erick's facts anyway.
- **`.tmpcheck/` scratch directory** was created in the repo root during verification and has been deleted. It is not in the diff.

---

## 5. Changed files / deliverables

**New (5 files, 748 lines):**

| File | Lines | What |
|---|---|---|
| `src/lib/seo/aiCrawlers.ts` | 108 | 21 named AI crawlers split into training vs. retrieval lists, shared disallow paths, documented allow/block lever |
| `src/lib/seo/llms.ts` | 324 | `buildLlmsTxt()` + `buildLlmsFullTxt()` |
| `src/lib/schema/organization.ts` | 241 | `buildSitewideGraph()`, `LOCAL_BUSINESS_ID`, `ORGANIZATION_ID` |
| `src/app/llms.txt/route.ts` | 44 | `force-static`, 24h CDN cache |
| `src/app/llms-full.txt/route.ts` | 31 | 30-min ISR, matches the Sanity revalidate window |

**Edited (3 files, +160 / −41):**

- `src/lib/constants/business.ts` (+107) — `BUSINESS_FOUNDING_YEAR`, `BUSINESS_DESCRIPTION`, `BUSINESS_HOURS_HUMAN`, `BUSINESS_OPENING_HOURS`, `BUSINESS_GEO` (null), `BUSINESS_SAME_AS` (env-driven), `BUSINESS_LOGO_PATH`, `BUSINESS_CREDENTIAL`
- `src/app/robots.ts` (+46/−8) — one wildcard block became three; disallow list moved to `aiCrawlers.ts`
- `src/app/[locale]/layout.tsx` (+9/−33) — inline literal replaced with `buildSitewideGraph()`

**No secrets in the diff.** `BUSINESS_SAME_AS` reads four `NEXT_PUBLIC_SOCIAL_*` vars that are already documented in `.env.local.example` and currently empty; no values are committed.

**Commit / PR:** none — left uncommitted on `main` at Goran's request ("write this as a completion in the folder and i will push").

---

## 6. State updates done

- ⚠️ **`current-state.md` — NOT updated.** Left to Goran, since the work is uncommitted and the phase framing (§0) may want adjusting first. **By the project's own rule this phase is not formally closed until that snapshot is updated.**
- ⚠️ **`file-map.md` — NOT updated.** Five new files need entries: `src/lib/seo/aiCrawlers.ts`, `src/lib/seo/llms.ts`, `src/lib/schema/organization.ts`, `src/app/llms.txt/route.ts`, `src/app/llms-full.txt/route.ts`.
- **`00_stack-and-config.md`** — no entry needed. No new dependency, no config change, no env var added (the four social vars already existed).
- **Decision log** — three entries owed, per §3 items 1–3.

---

## 7. Risks, follow-ups, what the next phase needs to know

**Before pushing:**

1. **Run `npm run lint` and `npm run build` locally.** Neither completed in the sandbox (§2). Typecheck passed and the modules were executed under Node, so the risk is low, but "low" is not "verified."
2. **Check the Vercel preview for `/llms-full.txt`** and confirm the Sanity-driven sections are populated rather than showing the fallback line.
3. **Validate the entity graph** — paste a rendered page into Google's Rich Results Test and Schema.org's validator. The JSON parses, but neither validator has seen it.

**Blocking further gains — both need Erick:**

4. **`sameAs` is empty, and this is the largest remaining SEO gap on the site.** It is how Google and every LLM confirm that the "Sunset Services" here is the same entity as the one on the Google Business Profile. Fix is env-only: set `NEXT_PUBLIC_SOCIAL_GBP_URL`, `_FACEBOOK_URL`, `_INSTAGRAM_URL`, `_YOUTUBE_URL` in Vercel. This lights up the footer icons *and* the entity graph with no code change. Erick must confirm the URLs — note the retired-name Facebook page flagged in §3.3.
5. **`BUSINESS_GEO` is null.** Take the coordinates from the GBP pin (Google Maps → right-click the pin → lat/lng at the top of the menu) and set the constant. The builder picks it up with no other change.

**Noticed, not actioned:**

6. **Stale V1 URLs are still indexed.** A web search surfaces `sunsetservices.us/about-us/` and `/hardscaping-services/` — the old WordPress paths, which do not match the current IA (`/about`, `/hardscape`). If those are not 301-redirecting, they are bleeding ranking signal and serving 404s to anyone arriving from search. **Worth checking before anything else in this report.** Out of scope here; flagged for a follow-up phase.

**Do not break:**

7. **`LOCAL_BUSINESS_ID` and `ORGANIZATION_ID` must not be renamed.** Per-page schema builders (`Place.areaServed`, `ContactPage.mainEntity`, `Article.publisher`, `Service.provider`) reference those `@id` strings. Renaming one silently orphans every page pointing at it — no error, just a broken graph.
8. **`llms.txt` is a convention, not a standard.** No major AI operator has publicly committed to reading it as of mid-2026. It was shipped because the cost is ~zero and the downside is zero, not because it is known to work. The entity graph and the `sameAs` fix are the parts with evidence behind them. Do not let a future report claim otherwise.

---

## 8. What's now possible that wasn't before

An AI assistant asked "who does basement waterproofing in Wheaton?" can now find Sunset Services, confirm it serves Wheaton specifically, confirm it offers that exact service, and cite the right page — instead of inferring what a company called "Sunset Services" might do from its homepage.
