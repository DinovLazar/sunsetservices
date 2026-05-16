# Phase B.03c Completion Report

**Phase:** Phase B.03c — Code — populate Termly env vars + verify embed + Tag Assistant validation + reconcile B.02 handover.
**Date:** 2026-05-15
**Branch:** `claude/gifted-pare-143263` (worktree of `main` at `649aba5`).
**Outcome:** **PARTIAL.** 2 of 5 expected Termly IDs were available; both were upserted on Vercel Production + Preview. The other 3 routes still render the fallback. One architectural finding flagged + one ID-format concern flagged. Pre-deploy state recorded here; post-deploy verification of `/en/privacy/` appended in the "Empirical verification" section below once the Preview deploy completes.

---

## Headline

Phase B.03c was scoped to populate the 5 Termly environment variables on Vercel, verify all 4 legal routes render real Termly content, implement the TOC sidebar, validate the Consent Mode v2 flow with Tag Assistant, and reconcile B.03 against the B.02 design handover docs. **Two issues forced a partial-ship outcome:**

1. **`.termly-ids.txt` at the project root carries only 2 of the 5 expected IDs.** The brief required `NEXT_PUBLIC_TERMLY_WEBSITE_ID` + 4 doc IDs (`PRIVACY_EN`, `PRIVACY_ES`, `TERMS_EN`, `TERMS_ES`). The file (at `C:\Users\user\Desktop\SunSet-V2\.termly-ids.txt`, last modified 2026-05-15 16:47:13) contains only `TERMLY_WEBSITE_ID=<uuid>` and `TERMLY_PRIVACY_EN_ID=13687462`. The brief's Step 2 told Code to normalize the keys to the `NEXT_PUBLIC_TERMLY_*` shape when populating Vercel (the file uses the bare `TERMLY_*` shape — likely Cowork residue from following the prior iubenda-named brief before pivoting to Termly). Cowork (or the user) needs to provide the 3 missing doc IDs in a B.03b follow-up.
2. **B.02 design handover docs do not exist.** `docs/design-handovers/Phase-B-02-Legal-Design-Handover.md` and `Phase-B-02-Legal-Mockups.html` were never committed to the repo. The B.03 completion report already documents this gap at [Phase-B-03-Completion.md:16](Phase-B-03-Completion.md:16). The gap is inherited unchanged; Step 0 reconciliation remains not actionable.

**The user was asked how to proceed and chose "Proceed with both IDs"** (the second option of four). This means: populate `NEXT_PUBLIC_TERMLY_WEBSITE_ID` + `NEXT_PUBLIC_TERMLY_PRIVACY_EN_ID` on Vercel, leave the other 3 doc IDs empty (so `/es/privacy/`, `/en/terms/`, `/es/terms/` stay on the graceful fallback), trigger a Preview deploy, verify `/en/privacy/` empirically. If the Privacy EN ID format concern below (numeric `13687462` vs Termly's documented UUID format) turns out to mean the embed 404s or renders the wrong document, that's the user's accepted risk — verification will surface the truth and this report will record what was observed.

---

## What was shipped

| Action | Detail |
| --- | --- |
| Vercel env var upserted | `NEXT_PUBLIC_TERMLY_WEBSITE_ID=b722b489-62a2-4e5a-9510-e6466f804c69` on production + preview, type=plain. Env-var id: `gDmL9bWsmwK6gQWL`. |
| Vercel env var upserted | `NEXT_PUBLIC_TERMLY_PRIVACY_EN_ID=13687462` on production + preview, type=plain. Env-var id: `SRl4LL06YQVb5CAa`. |
| Local `.env.local` | Created in worktree (gitignored, matches `.env*` rule at `.gitignore:34`). Same 2 KV pairs plus commented-out placeholders for the 3 missing IDs. |
| `.env.local.example` | Phase B.03 block updated with a B.03c partial-populate header noting the 2/5 state + the format concern + the fallback consequence for the 3 empty routes. |
| Source code | **Unchanged.** No `src/` files modified in this phase. `TermlyPolicyEmbed.tsx`, `LegalPageBody.tsx`, `LegalPageHero.tsx`, both route files, all consent components remain exactly as B.03 shipped them. |
| Vercel deploy | Triggered by the `.env.local.example` change + this completion report commit. Verification pending; result will be appended to "Empirical verification" below. |

**Token-refresh detail (for future-Code reference):** the cached Vercel CLI auth token at `%APPDATA%\xdg.data\com.vercel.cli\auth.json` was expired at session-start (expiresAt 2026-05-15 13:01:45 local; session ran ~16:47–17:07). Calling `vercel whoami` triggered a silent CLI-side refresh that wrote a new token + refreshToken back to the file. The Phase 2.02 / 2.03 REST-helper pattern still works — just re-read `auth.json` after running `vercel whoami` if the first API call returns `403 invalidToken`.

---

## Dependency-verification trail

| Check | Result |
| --- | --- |
| `.termly-ids.txt` at worktree root | absent |
| `.termly-ids.txt` at parent root (`C:\Users\user\Desktop\SunSet-V2\.termly-ids.txt`) | **present** — surfaced after the user pointed at the file when my initial search came up empty (file last modified 2026-05-15 16:47:13 local; my first search ran earlier and the file was likely created/written between my search and the user's reveal). For future Code: the brief says "at the project root" — the canonical project root is the parent directory, not the worktree. Recursive search across the parent with the dot-prefix filter would have caught it. |
| File contents | 2 of 5 expected lines: `TERMLY_WEBSITE_ID=b722b489-62a2-4e5a-9510-e6466f804c69` and `TERMLY_PRIVACY_EN_ID=13687462`. Keys use the bare `TERMLY_*` shape, not `NEXT_PUBLIC_TERMLY_*`. |
| `.iubenda-ids.txt` (alt naming per brief) | absent — sole `.termly-ids.txt` is the only such file |
| `docs/design-handovers/Phase-B-02-*` | absent (only `Part-1-Phase-{03..19}-Design-Handover.md` exist in that directory) |
| `.env.local` in worktree | not present at session-start (created by this phase with the 2 IDs) |
| Parent `.env.local` | not present either |
| Vercel CLI installed | present at `C:\Users\user\AppData\Roaming\npm\vercel.ps1` (despite the session-start hook claiming it isn't) |
| Vercel auth file | present at `%APPDATA%\xdg.data\com.vercel.cli\auth.json`. Token at session-start was expired (`isExpired: True`); `vercel whoami` silently refreshed it. |
| Vercel REST API upserts | succeeded after token refresh — see "What was shipped" table above |
| Git working tree at session-start | clean. No untracked files. Last commit `649aba5` (B.03 merge). |

---

## Architectural finding (surfaced before Code stops)

Reading the existing `TermlyPolicyEmbed.tsx` revealed a structural concern the B.03c brief does not address.

[TermlyPolicyEmbed.tsx:97-102](../components/legal/TermlyPolicyEmbed.tsx:97) configures the embed div with `data-type="iframe"`:

```tsx
{React.createElement('div', {
  name: 'termly-embed',
  'data-id': docId,
  'data-type': 'iframe',
  'data-website-id': websiteId || undefined,
})}
```

Termly's `embed-policy.min.js` reads `data-type` and renders the policy accordingly. `data-type="iframe"` (versus `data-type="document"` for inline rendering) means the policy is rendered inside an `<iframe>` element served from a Termly origin — i.e., cross-origin to the host page.

**This creates a same-origin problem for two of the brief's steps:**

- **Step 5 (Termly Custom CSS overrides verification).** Document-level `<style>` rules in the host page do not penetrate a cross-origin iframe. The first-pass override block in `TermlyPolicyEmbed.tsx:67-91` would land on nothing inside the iframe — only on the wrapper. The brief's Step 5 *does* anticipate this scenario ("Document-level CSS overrides won't land. Log this in the completion report. Switch the CSS strategy: pass styling instructions through Termly's own dashboard...") so this is on-spec for the brief.
- **Step 6 (TOC sidebar populated from rendered headings).** The brief specifies "After the Termly embed loads, walk the rendered DOM for `h2` and `h3` headings inside the Termly container" — but cross-origin iframes block `iframe.contentDocument` access from the parent page. **The TOC strategy as written in the brief cannot work against a cross-origin iframe.** The brief does NOT acknowledge this scenario; it appears to assume inline rendering.

**Two paths out** (decisions need to be made before B.03c retries):

- **Path A:** Switch the embed config to `data-type="document"` (or whatever Termly's inline-render mode is — needs verification against current Termly docs) so the policy renders inline in the host page DOM. Both CSS and TOC then work as the brief expects. Risk: Termly may treat inline rendering differently (e.g. CSS isolation, semantic structure, or feature parity) — needs verification with real Termly content.
- **Path B:** Accept iframe mode. Move CSS into Termly's dashboard ("Custom CSS" panel — brief's Step 5 fallback). Either drop the TOC sidebar OR derive the TOC server-side from a Termly API call that returns the document structure (if Termly exposes such an endpoint — needs verification).

Either path requires real Termly content to verify. **Code did not implement either; both are real Chat-level decisions, not in-phase improvisations.**

---

## Empirical verification (post-deploy)

**Status:** pending Preview deploy completion. This section will be appended once the deploy is green and `/en/privacy/` is reachable.

The verification plan, in priority order:
1. Confirm the Preview deploy went green (no build regressions from env-var addition).
2. Open `/en/privacy/` in incognito. Does the embed render content or stay on the "Legal content is being prepared" fallback?
3. If content renders: is it the expected Privacy Policy (verify against Termly's dashboard expected content), or a different document, or an error page?
4. Inspect the rendered DOM: is the policy inside an iframe (confirms the architectural finding) or inline?
5. If inline: do the CSS overrides at `TermlyPolicyEmbed.tsx:67-91` actually land on headings, paragraphs, links? Can `document.querySelectorAll('.termly-embed-wrap h2')` walk real headings?
6. If iframe: the brief's Step 6 TOC strategy is confirmed unworkable in this configuration; Path A vs Path B decision becomes urgent.
7. Confirm the 3 still-empty doc IDs leave the other 3 routes on the fallback (sanity check that the gate at [TermlyPolicyEmbed.tsx:39](../components/legal/TermlyPolicyEmbed.tsx:39) is working).

Results will be recorded under headings "Deploy result", "Embed render outcome on /en/privacy/", "DOM inspection: iframe vs inline", "CSS override verification", and "Fallback behavior on the 3 empty routes" appended to this section after observation.

---

## Why no TOC sidebar was implemented

The brief's Step 6 is the only step that could superficially be done without Termly IDs (because the implementation lives in the host-page code, not in env vars or deploys). Code chose not to implement it for three reasons:

1. **Cross-origin iframe blocks the strategy** (see Architectural finding above). Writing code that walks `document.querySelectorAll('.termly-embed-wrap h2')` against an iframe-rendered embed would silently no-op at runtime.
2. **No way to verify against real DOM until after the deploy.** Pre-deploy, the embed renders the "Legal content is being prepared" fallback at [TermlyPolicyEmbed.tsx:39-62](../components/legal/TermlyPolicyEmbed.tsx:39) — a single `<p>` element. There are no headings to TOC over.
3. **Architectural decision pending.** Whether B.03c retries with Path A (`data-type="document"`) or Path B (iframe + dashboard CSS + no host-page TOC) changes the implementation shape entirely. Shipping speculative TOC code now would land in the wrong shape under at least one of the two paths.

This deferral leaves the existing `<aside aria-hidden="true">` placeholder at [LegalPageBody.tsx:24-28](../components/legal/LegalPageBody.tsx:24) unchanged. The slot is still reserved; the implementation still pends. **Post-deploy empirical verification will tell us whether the iframe concern is real**; if it isn't (embed renders inline), a follow-up phase can implement the TOC sidebar with confidence.

---

## B.02 handover reconciliation (Step 0)

Cannot be done. The B.02 handover docs were never committed to the repo. B.03's completion report at [Phase-B-03-Completion.md:16](Phase-B-03-Completion.md:16) and decisions log entry at [Sunset-Services-Decisions.md:558](../../Sunset-Services-Decisions.md:558) both flagged this — B.03c inherits the same gap.

The brief's instruction "Bucket each drift you find into one of three categories" is not actionable when the source-of-truth documents to compare against do not exist. The reconciliation cannot be faked; B.03 already worked from the brief's paraphrase of DM-1 + DM-2, and the brief's paraphrase is identical content to what B.03 had. There is no new information to drift-check against.

**Action recommended:** Chat needs to either (a) produce the B.02 design handover docs and commit them, then re-run B.03c Step 0 in a follow-up phase, or (b) explicitly ratify B.03's interpretation as the source of truth and remove the Step 0 expectation from future briefs.

---

## What did happen in this session

| Activity | Result |
| --- | --- |
| Verified dependencies (Termly IDs file, B.02 handover docs) | `.termly-ids.txt` surfaced at parent root with 2 of 5 IDs; B.02 docs absent (gap inherited from B.03) |
| Reviewed existing legal components (`TermlyPolicyEmbed`, `LegalPageBody`, `LegalPageHero`) | No source code changes — but identified the `data-type="iframe"` architectural concern |
| Reviewed B.03 completion report + current-state to confirm phase context | Read in full |
| Identified the cross-origin iframe architectural concern not in the brief | Documented in "Architectural finding" section |
| Identified the Privacy EN ID format concern (`13687462` numeric, not UUID) | Surfaced to user via `AskUserQuestion`; user accepted the risk and chose "Proceed with both IDs" |
| Upserted `NEXT_PUBLIC_TERMLY_WEBSITE_ID` on Vercel Production + Preview | Env-var id `gDmL9bWsmwK6gQWL`, type=plain |
| Upserted `NEXT_PUBLIC_TERMLY_PRIVACY_EN_ID` on Vercel Production + Preview | Env-var id `SRl4LL06YQVb5CAa`, type=plain |
| Created `.env.local` in worktree with the 2 IDs | Gitignored; matches `.env*` rule |
| Updated `.env.local.example` with the B.03c partial-populate header | Documents the 2/5 state + format concern + fallback consequence |
| Wrote completion report (this file) | New file |
| Wrote decisions log entry | Appended to `Sunset-Services-Decisions.md` |
| Updated `current-state.md` | New Phase B.03c block at top, prior chain renumbered |
| Updated `file-map.md` | This file added |
| Triggered Preview deploy via commit + push | Result pending; will be recorded in "Empirical verification" section |

**No source code under `src/` was modified.** The diff is: 2 Vercel env var upserts (server-side, no source code), `.env.local` (gitignored, untracked), `.env.local.example` (1 doc block updated), `Phase-B-03c-Completion.md` (this file, new), `Sunset-Services-Decisions.md` (1 entry appended), `current-state.md` (1 block prepended, chain renumbered), `file-map.md` (1 line appended).

---

## Verification (partial)

| Check | Status | Notes |
| --- | --- | --- |
| `npm run build` exits 0 | inherited | No source code changed; build state inherited from B.03 (122 pages, green per [Phase-B-03-Completion.md:14](Phase-B-03-Completion.md:14)). Preview deploy build result will record any regression. |
| `npm run lint` exits 0 | inherited | Same |
| TypeScript strict | n/a | No code changes |
| Vercel env vars upserted (2 of 5) | ✅ | `NEXT_PUBLIC_TERMLY_WEBSITE_ID` + `NEXT_PUBLIC_TERMLY_PRIVACY_EN_ID` on production + preview |
| Vercel env vars upserted (5 of 5) | ❌ PARTIAL | 3 doc IDs (`PRIVACY_ES`, `TERMS_EN`, `TERMS_ES`) still empty — Cowork to supply in B.03b follow-up |
| `.env.local` mirrors Vercel values | ✅ | Created with same 2 IDs |
| Fresh Preview deploy is green | ⏳ PENDING | Triggered by this commit; result to be recorded |
| `/en/privacy/` renders real Termly content | ⏳ PENDING | Verification queued; format concern (`13687462`) may surface here |
| `/es/privacy/` renders real Termly content | ❌ N/A | Doc ID empty by design — stays on fallback |
| `/en/terms/` renders real Termly content | ❌ N/A | Doc ID empty by design — stays on fallback |
| `/es/terms/` renders real Termly content | ❌ N/A | Doc ID empty by design — stays on fallback |
| Termly CSS overrides verified against real DOM | ⏳ PENDING | Depends on /en/privacy/ rendering; architectural concern flagged for iframe scenario |
| TOC sidebar populates from real headings | ❌ NOT IMPLEMENTED | Cross-origin iframe architectural concern; Path A vs Path B decision pending |
| Tag Assistant Consent Mode v2 flow verified | ❌ NOT EXECUTED | Requires a desktop Chrome session with the Tag Assistant extension — outside Code's environment. Can be executed manually by the user against the Preview URL once it's live. |
| Lighthouse smoke on `/en/privacy/` | ❌ NOT EXECUTED | Same — requires local Chrome devtools or a Lighthouse CI run. Can be triggered manually. |
| Completion report written | ✅ | This file |
| `Sunset-Services-Decisions.md` updated | ✅ | New 2026-05-15 — Phase B.03c entry |
| `current-state.md` updated | ✅ | New Phase B.03c block at top |
| `file-map.md` updated | ✅ | This file documented |

---

## Carryover: what's still needed after this partial-ship

### From Cowork (or whoever supplies the 3 missing IDs)

1. **Privacy ES Termly document ID** — provision the Privacy policy ES version in Termly, add `TERMLY_PRIVACY_ES_ID=<id>` to `.termly-ids.txt`.
2. **Terms EN Termly document ID** — same for Terms in English.
3. **Terms ES Termly document ID** — same for Terms in Spanish.
4. **Re-verify the Privacy EN ID format.** `13687462` is a short numeric — Termly's documented format is UUID. If Cowork accidentally captured an iubenda ID, the `/en/privacy/` embed will 404 or render the wrong doc (post-deploy verification will confirm). If it's a legitimate Termly numeric ID, no action needed.

### From Chat (architectural decisions)

5. Decide between **Path A** (switch the embed to `data-type="document"` for inline rendering — risk: needs verification against current Termly docs for feature parity) and **Path B** (keep iframe + move CSS to Termly's dashboard "Custom CSS" panel + drop the host-page TOC OR derive it server-side from a Termly API call). Post-deploy empirical verification on `/en/privacy/` (in the "Empirical verification" section above) will tell us whether the iframe concern is real; the path decision can be informed by that.
6. Either produce the **B.02 design handover docs** (so Step 0 reconciliation becomes actionable in a future phase) or explicitly ratify B.03's interpretation and remove Step 0 from any future brief.

### From Code (when the 3 missing IDs land)

7. Re-read this completion report + the empirical verification findings + Chat's Path A/B decision.
8. Upsert the 3 missing IDs to Vercel via the same REST helper pattern. Update `.env.local`. No deploy trigger needed beyond the env-var changes (Vercel auto-redeploys on env-var add).
9. Verify the 4 routes render real content on the next Preview.
10. If Chat chose Path A, implement the TOC sidebar against inline-rendered content.
11. Execute Tag Assistant Preview validation (Step 7 of the original B.03c brief).
12. Execute the Lighthouse smoke (Step 8).

---

## What B.03c cost

- **~75 minutes** of session time across two segments (initial dependency search + this partial-ship execution).
- **0 lines of source code** changed.
- **2 Vercel env vars** upserted (1 API call per var, ~200ms each).
- **4 documentation files** modified, 1 new (this file).
- **1 commit** to be made (pending after this report write).
- **1 Preview deploy** to be triggered (pending after push).

---

## Definition of done — re-stated

The brief's "Definition of done" said: "All 14 checklist items pass. The 4 legal routes are launch-ready (only B.04 schema validation + B.06 final accessibility audit remain to close them out fully)."

**This phase did not meet the original Definition of done.** Of the 14 checklist items: 3 explicitly blocked by missing dependencies (B.02 reconciliation, the 3 missing doc IDs), 1 explicitly NOT IMPLEMENTED awaiting architectural decision (TOC sidebar), 2 NOT EXECUTABLE in Code's environment (Tag Assistant, Lighthouse — these need a desktop Chrome session). The remaining items are PASS (env upserts, .env.local, .env.local.example, deploy trigger, completion report, decisions log, current-state, file-map) or PENDING (build green on Preview, /en/privacy/ rendering verification).

`/en/privacy/` may or may not be launch-ready depending on the empirical verification outcome — the format concern on `13687462` is real. The other 3 routes (`/es/privacy/`, `/en/terms/`, `/es/terms/`) remain on the B.03 fallback by design until Cowork supplies the missing IDs.

A re-spun B.03c (or a B.03d successor) is required to close the remaining checklist items.
