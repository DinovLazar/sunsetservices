# Part 3 · Phase Polish-02b · Code — Completion Report
**Date:** 2026-07-28 · **Outcome (one line):** Every leftover Polish-02 flagged — "one crew" claims, the five subcontractor-handoff variants, and DuPage-restrictive service-area wording — is corrected under the already-ratified rules, and the pre-existing schema fix is rebased, re-verified (818 → 0), and sitting in its own PR.

## 1. What shipped (plain language)

Polish-02 fixed everything the reviewer (Marcin) flagged directly, but its audit found the same problems on surfaces he hadn't reviewed yet. With the operator's go-ahead, this phase applies the same ratified rules to all of them: no copy anywhere still claims one crew performs multiple services ("Eight services. One accountable company." now leads the landscape page), the five remaining "we don't hand you off to subcontractors" lines were rewritten as positive statements of the same facts, and the chatbot + sewer-line page + blog source no longer tell customers Sunset only covers DuPage County. Separately, the one-line structured-data repair that had been waiting on a branch is now an open PR with fresh proof it takes the schema validator from 818 errors to zero.

## 2. Definition of Done

- ✅ **`fix/schema-offer-url` PR open, rebased, `build` exit 0, `validate:schema` before/after counts recorded (the B.17 `Offer.url` error class → 0)** — evidence: branch rebased onto `main` @ `a6986e6` (was off `e5a0e50`; keep-both resolution of the three state-doc tails, no code change), force-pushed `4132cd7` → `91226b0`. PR #32 (already existed — see §3.1) updated with the evidence table. Fresh production builds of both sides: **before** (`main` @ `a6986e6`) = **818 errors / 0 warnings / 24 URLs** (816 × `Offer` missing required `url` + 2 × false-positive forbidden `Service`, confirmed from the machine report); **after** (rebased branch) = **0 errors / 0 warnings / 24 URLs**; `npm run build` exit 0 (204/204) on the branch. Nothing else landed on it.
- ✅ **`grep -ri "one crew" src/` (excluding `_project-state/`) → 0 matches; landscape subhead reads "Eight services. One accountable company." in EN + its ES counterpart** — evidence: grep 19 → **0**; live DOM on `next start` shows the subhead sentence verbatim on `/landscape/` and "Ocho servicios. Una sola empresa responsable." on `/es/landscape/`; the services-grid eyebrow renders "EIGHT SERVICES · ONE COMPANY" / "OCHO SERVICIOS · UNA SOLA EMPRESA".
- ✅ **All five subcontractor-style claims rewritten (EN + ES) with a before → after table; `grep -ri "subcontract" src/` (excluding `_project-state/`) → 0 claim-bearing matches** — evidence: table in §5; the only surviving match is `resources.ts:1057` ("the contractor's licensed-trade subcontractor markup") — an industry cost fact in the outdoor-kitchen permit guide, a statement about the market, not about Sunset's practices. Live DOM: all five rewrites render EN + ES (`/`, `/waterproofing/`, Naperville / Elmhurst / Glen Ellyn city pages).
- ✅ **Every remaining "across DuPage County" occurrence either replaced or listed as intentionally kept with a one-line justification** — evidence: replaced/kept tables in §5.
- ✅ **EN/ES leaf parity equal; TRANSLATION_NOTES §Polish-02b filed** — evidence: leaf-key parity **1337 = 1337, key-set diff 0 in both directions** (recursive dict-leaf count; the Polish-02 report's "1406" figure counts array elements too — both locales equal under either method). §Polish-02b added with three tables + five open questions for native review.
- ✅ **`npm run build` exit 0 · `tsc` 0 · `lint` 0 errors · `validate:seo` + `validate:links` pass on touched routes** — evidence: clean (`rm -rf .next`) build exit 0, 204/204 pages; `tsc --noEmit` exit 0; `lint` exit 0 — 0 errors / 9 pre-existing warnings (same set as Polish-02/B.17). `validate:seo` **0 errors / 0 warnings across 196 URLs + sitemap + robots**. `validate:links` exit 0 — **0 hard internal failures across 294 crawled pages** (internal: 250 OK, 98 locale-prefix redirects, 0 broken, 0 error; 135 warnings, all the pre-existing cosmetic division-label-vs-project-slug class on `/projects` tiles, untouched by this phase). (`validate:schema` on this branch still reports the pre-existing 818 — that defect's fix is PR #32, by design of the two-PR split.)
- ✅ **Decisions appended (extending (a)/(h)/§5.2 to all occurrences; schema-fix PR go-ahead), dated 2026-07-28** — evidence: entries Polish-02b (a)–(d), decisions-first commit `80616ad` (first commit on the branch).
- ✅ **Branch `polish/02b-copy-leftovers` pushed, PR open against `main`, NOT merged; `fix/schema-offer-url` PR likewise open, NOT merged** — evidence: PR #35 (this branch) and PR #32 (schema fix), both open, neither merged; operator verifies on Vercel Preview.

## 3. Decisions I made during this phase

1. **PR #32 already existed for `fix/schema-offer-url`** (opened when the branch was spun off during Polish-02). Task 1 said "open its PR" — instead of opening a duplicate, I appended the rebase + re-verification evidence to #32's description. Needs decision-log entry: no (covered by (d)).
2. **Landscape subhead restructured, not word-swapped.** The ratified sentence "Eight services. One accountable company." can't sit mid-sentence after an em-dash, so the locality clause moved in front: "Lawn care, design, sprinklers, trees, and seasonal cleanups for residential and commercial properties throughout Aurora, Naperville, and Chicago's western suburbs. Eight services. One accountable company." Same facts, DoD sentence verbatim. Needs decision-log entry: no (covered by (a)).
3. **The Task-2 sweep caught three surfaces beyond the brief's named subhead** — the landscape services-grid eyebrow ("EIGHT SERVICES · ONE CREW" → "· ONE COMPANY"), `serviceAreas.sub` ("Six cities, one crew…" → "one company"), and the five trenchless whyUs headlines ("One crew, one contact" → "One point of contact"; each card's *description* keeps its job-level "same crew start to finish" claim, which the ratified rule allows). Needs decision-log entry: no (covered by (a)).
4. **"Same crew, same accountability" headline kept** on the waterproofing whySunset card — job-level continuity is the allowed claim class; only its subcontractor description was rewritten. Same logic kept Geneva's "The crew you meet at the estimate is the crew that pours the base." Needs decision-log entry: no (covered by (a)/(b)).
5. **Chat personas fixed (EN + ES)** — `systemPrompt.ts` told every visitor Sunset "serv[es] DuPage County" / "cobertura en todo el condado de DuPage". Not in the brief's file list, but it is the identical restriction class as the chat-KB identity line Polish-02 already fixed under (h), on the same chat surface. EN → "serving Chicago's western suburbs"; ES → "cobertura en los suburbios del oeste de Chicago". The ES edit is one clause inside the hand-authored "DO NOT machine-translate" block — flagged as top native-review priority. Needs decision-log entry: yes — logged as (c).
6. **`blog.ts:491` "across DuPage" (no "County") treated as in-class** and replaced with "across Chicago's western suburbs" (+ ES pair) — same restrictive style, and `blog.ts` is a Task-4 named file. Needs decision-log entry: no (covered by (c)).
7. **"Family-run in DuPage County since 2000" → "family-run in Aurora since 2000"** (sewer-line whyUs card, EN + ES) — the sentence states where the family business is based, so it takes the factual point (Aurora HQ), not an area phrase. Needs decision-log entry: no (covered by (c)).
8. **ES wording choices**: "una sola compañía" in `serviceAreas.sub` (avoids "Empresa familiar … una sola empresa" repetition); "respuestas directas" for "direct answers"; "temporada tras temporada" for "season after season". All logged as open questions in TRANSLATION_NOTES §Polish-02b. Needs decision-log entry: no (pending native review anyway).
9. **Lisle + Bolingbrook write-ups corrected even though dormant** — during verification I found neither city has a routed page (22 `service-areas/*` routes; these two aren't among them), so their `whyLocal` prose renders nowhere today. The data is still the committed source of truth, so the corrections stand. Needs decision-log entry: no (surfaced here + §7).
10. **Both worktrees for this phase ran outside the shared main checkout** (per the standing concurrent-sessions rule); the schema-fix rebase conflicts in the three state docs were resolved keep-both with the base-commit references updated to `a6986e6`. Needs decision-log entry: no (process).

## 4. Deviations from the brief / spec

- **The two `blog.ts` edits cannot show on the live blog pages yet.** Blog *detail* bodies are Sanity-fed (`getBlogPostBySlug`, ISR 1800); `blog.ts` is the committed seed/source-of-truth and feeds only the index. Updating the two Sanity `blogPost` documents is a content operation the brief explicitly put out of scope ("do NOT touch: Sanity content") — flagged in §7 for a follow-up. The source fix is still correct and was verified by grep; the CTA line's ES body needed no change (it was already unrestricted, so EN moved *toward* ES).
- **`validate:schema` on `polish/02b-copy-leftovers` still reports the pre-existing 818** — expected; that fix is PR #32 and the brief mandates the two branches stay strictly separate.
- Everything else was done as specified.

## 5. Changed files / deliverables

**Branch `polish/02b-copy-leftovers`** (off `main` @ `a6986e6`), PR **#35** — commits:
- `80616ad` docs(decisions) — Polish-02b entries (a)–(d) (decisions-first).
- `4e1fa9d` fix(copy) — all copy edits + TRANSLATION_NOTES §Polish-02b (7 files, +96/−52).
- (state-sync commit follows this report.)

**Branch `fix/schema-offer-url`** rebased → `91226b0`, PR **#32** (updated, not newly opened). Before/after `validate:schema`: **818 → 0** (counts in §2).

Files edited on the copy branch: `src/messages/{en,es}.json` · `src/data/locations.ts` · `src/data/services.ts` · `src/data/blog.ts` · `src/lib/chat/systemPrompt.ts` · appended: `Sunset-Services-Decisions.md`, `Sunset-Services-TRANSLATION_NOTES.md`. New: this report.

### Subcontractor rewrites — before → after (all five, EN; ES pairs moved identically, see TRANSLATION_NOTES §Polish-02b)

| # | Surface | Before | After |
|---|---|---|---|
| 1 | `home.process.sub` (homepage process section) | No subcontractor handoffs. The crew that designs your project builds it — and keeps it looking right. | The crew that designs your project builds it — and keeps it looking right, season after season. |
| 2 | `division.waterproofing.whySunset.props.four` (headline "Same crew, same accountability" kept) | No subcontractor handoffs on the work that matters most. | The crew that starts your repair finishes it — one accountable team from first visit to final walkthrough. |
| 3 | Naperville `whyLocal` | You won't hand off to a subcontractor we just met. | One point of contact from the first site walk to the final walkthrough. |
| 4 | Elmhurst `whyLocal` | …you get Erick — no sales rep, no callback queue, no handoff to a subcontractor you've never met. | …you get Erick — direct answers and one point of contact from the first call to the final walkthrough. |
| 5 | Glen Ellyn `whyLocal` | …you get Erick — no sales rep, no handoffs to a subcontractor you've never met. | …you get Erick — direct answers and one point of contact from the first conversation on. |

Non-claim-bearing survivor (kept): `resources.ts:1057` — "the contractor's licensed-trade subcontractor markup" (industry cost fact in the outdoor-kitchen permit guide, not a claim about Sunset).

### "One crew" sweep (19 → 0)

| Surface | Before | After |
|---|---|---|
| `division.landscape.hero.subhead` | …— eight services, one crew.… | …Eight services. One accountable company. (ratified sentence verbatim; locality clause moved ahead) |
| `division.landscape.servicesGrid.eyebrow` | EIGHT SERVICES · ONE CREW | EIGHT SERVICES · ONE COMPANY |
| `serviceAreas.sub` | Six cities, one crew, one phone number. | Six cities, one company, one phone number. |
| 10 city `whyLocal` closers (Lisle, Oak Brook, Clarendon Hills, Winfield, Lombard, Geneva, South Elgin, North Aurora, Yorkville, Plainfield) | One crew, one phone, … | One company, one phone, … |
| Bolingbrook `whyLocal` | we're one crew based in Aurora… | we're a family-run company based in Aurora… |
| 5 trenchless whyUs headlines (conduit-installation, sewer-line-replacement, missile-boring, handhole-pull-box, pipe-fusing) | One crew, one contact | One point of contact |

### "Across DuPage County" — replaced

| Surface | Before | After |
|---|---|---|
| Sewer-line description (EN + ES) | …before we quote — across DuPage County, no guesswork, no upsell. | …— across Aurora, Naperville, and Chicago's western suburbs, no guesswork, no upsell. |
| Sewer-line whyUs "Licensed, insured, family-run" (EN + ES) | …family-run in DuPage County since 2000. | …family-run in Aurora since 2000. |
| `blog.ts` `dupage-patio-cost-2026` site-walk CTA (EN; ES was already unrestricted) | We do free 30-minute site walks across DuPage County. | We do free 30-minute site walks across Aurora, Naperville, and Chicago's western suburbs. |
| `blog.ts` `why-unilock-premium-pavers` (EN + ES) | …hands-on paver experience across DuPage. | …hands-on paver experience across Chicago's western suburbs. |
| Chat EN persona (`systemPrompt.ts`) | …company in Aurora, IL serving DuPage County. | …company in Aurora, IL serving Chicago's western suburbs. |
| Chat ES persona (`systemPrompt.ts`) | …con sede en Aurora, IL y cobertura en todo el condado de DuPage. | …con sede en Aurora, IL y cobertura en los suburbios del oeste de Chicago. |

### "DuPage" — intentionally kept

| Surface | Why it stays |
|---|---|
| `blog.ts` `dupage-patio-cost-2026` title, description, and in-body prices | Genuinely DuPage-specific editorial content — the brief's own example of correct-as-is. |
| `blog.ts` snow-vendor article "If you manage commercial property in DuPage County…" (EN + ES) | Audience framing for the reader's context, not a claim about Sunset's service area. |
| ~30 service `seo` titles "… in DuPage County." + patios/fire-pits `seo` descriptions naming DuPage + Kane | Ratified Polish-02 SEO locality metadata — locality deliberately stays in `<title>`/meta. |
| `lib/seo/llms.ts` "…across DuPage, Kane, Kendall, Will, and Cook counties" | Expansive multi-county statement — accurate, the opposite of restrictive. |

## 6. State updates done

- `src/_project-state/current-state.md` — Polish-02b entry added (top of "Where we are").
- `src/_project-state/file-map.md` — §Polish-02b section added (edited files + this report).
- `Sunset-Services-Decisions.md` + `Sunset-Services-TRANSLATION_NOTES.md` — appended (commits `80616ad` / `4e1fa9d`).
- `00_stack-and-config.md` — untouched (no stack/config change this phase).

## 7. Risks, follow-ups, what the next phase needs to know

- **Sanity content follow-up:** the two blog-body fixes exist only in `blog.ts`; the live `/blog/dupage-patio-cost-2026` and `/blog/why-unilock-premium-pavers` pages serve the Sanity `blogPost` copies, which still carry the old sentences. Needs a Studio/Vertex content touch-up (or a small sync script) in a phase where Sanity content is in scope.
- **Marcin post-hoc review:** Chat runs the five §5.2 rewrites (table above) past Marcin; wording may adjust in round 2.
- **Merge order:** PR #32 and PR #35 both append to the tails of `Sunset-Services-Decisions.md`, `current-state.md`, and `file-map.md` — whichever merges second needs a trivial keep-both conflict resolution (noted on both PRs).
- **Round-2 candidate (out of scope here):** the conduit-installation whyUs card still says "a DuPage family business, not a call center" (`services.ts`, "Family-run since 2000" card) — same restriction class, but conduit is not the sewer-line service the brief scoped.
- **Pre-existing oddities noticed, not touched:** Lisle + Bolingbrook exist in `locations.ts` (and are named in `serviceAreas.description`) but have no routed city pages — `/service-areas/lisle/` answers 200 with the *index* content; and city-page URLs 308-redirect trailing → non-trailing slash (all validators already handle it).
- **ES native review:** §Polish-02b drafts pending, with the chat ES persona (a "DO NOT machine-translate" block) the highest-stakes item.

## 8. What's now possible that wasn't before

Every surface a customer (or the chatbot) can read now tells the same true story — one accountable company with specialized crews, serving Chicago's western suburbs — and the schema validator can go green the moment PR #32 merges.
