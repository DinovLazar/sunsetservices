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

**Status:** done for the SSR layer; client-side runtime verification of the Termly iframe content still pending a real-browser session (see "What still requires a browser" below).

### Setup
- **Preview URL:** `https://sunsetservices-mzi406cp0-dinovlazars-projects.vercel.app` (SHA `bcbd9d5`, branch `claude/gifted-pare-143263`, state READY in Vercel API).
- **Vercel SSO bypass token:** the project carries a Protection Bypass for Automation token at `project.protectionBypass.<key>`. Fetching `Preview URL/<path>` with the header `x-vercel-protection-bypass: <token>` skips the SSO gate and returns the real SSR HTML. Useful for any future Code phase that needs to verify Preview content programmatically. The token value is sensitive — do not commit it; pull it fresh via `GET /v9/projects/<projectId>` per session.
- **Canonical path:** Next.js `localePrefix: 'as-needed'` strips `/en` for the default locale and drops trailing slashes via a 308 then 307 redirect chain. The real URL for EN privacy is `/privacy` (not `/en/privacy/`). ES routes keep their `/es/` prefix.

### Deploy result
Preview build for the B.03c commit (`bcbd9d5`) went READY in Vercel without error. No regression from B.03 (still 122 pages). Build picked up both new env vars (verified via SSR DOM, below).

### `/privacy` (EN) — Termly env vars confirmed in build
Fetched `https://<preview>/privacy` with the bypass header. Status 200, 128,990 bytes. Key DOM observations:

- `<link rel="preload" href="https://app.termly.io/embed-policy.min.js" as="script"/>` — `next/script afterInteractive` preloads the Termly script. ✅
- `<div name="termly-embed" data-id="13687462" data-type="iframe" data-website-id="b722b489-62a2-4e5a-9510-e6466f804c69"></div>` — the embed div is SSR-rendered with both env-var values flowing through correctly. ✅
- The `.termly-embed-wrap` CSS override `<style>` block from `TermlyPolicyEmbed.tsx:67-91` is SSR-rendered exactly as written. ✅
- Page title `<title>Privacy policy · Sunset Services</title>` — correct locale + B.03 chrome intact. ✅
- The fallback string "Legal content is being prepared" is **not present**, confirming the `if (!docId)` gate at `TermlyPolicyEmbed.tsx:39` correctly resolves to the embed branch when env vars are populated. ✅

**Conclusion:** the SSR-layer wiring is correct. Whether Termly's client-side script then loads the actual policy content into an iframe or renders inline is a runtime question that requires a browser.

### Fallback gate sanity check on the 3 empty-ID routes
Fetched all three with the bypass header:

| Route | Status | Embed div present? | Fallback marker | Verdict |
| --- | --- | --- | --- | --- |
| `/es/privacy` | 200 | no | "contenido legal … preparando" (ES fallback) + title "Política de privacidad · Sunset Services" | ✅ correct fallback |
| `/terms` | 200 | no | "Legal content is being prepared. Please check back soon, or contact info@sunsetservices.us for a copy." (EN fallback) | ✅ correct fallback |
| `/es/terms` | 200 | no | "contenido legal … preparando" (ES fallback) + ES title | ✅ correct fallback |

The `if (!docId)` gate is working on all 3 empty-ID routes. None show a broken embed, none leak the EN fallback string into ES routes. The B.03 fallback strategy is intact.

### Architectural finding — verification status

The pre-deploy concern was: `TermlyPolicyEmbed.tsx:99` passes `data-type="iframe"` to Termly's script, which (based on Termly's docs) renders the policy inside a cross-origin iframe, blocking both document-level CSS overrides AND the brief's Step 6 TOC heading-walk strategy.

**SSR-layer evidence:** the `data-type="iframe"` attribute IS in the SSR HTML, confirming Termly's script will receive it. ✅ (no surprise — it's a static prop in the component.)

**Runtime evidence:** **NOT yet collected.** Requires a browser session that runs Termly's `embed-policy.min.js`. The script likely:
1. Reads `data-id` + `data-website-id` + `data-type` from the div
2. Creates an `<iframe>` element (because `data-type="iframe"`)
3. Sets `iframe.src` to a URL on `app.termly.io` (the cross-origin host)

Once the iframe mounts, the parent page cannot reach into it. CSS overrides won't penetrate; `iframe.contentDocument` is blocked by same-origin policy.

**Path A vs Path B decision is still on the critical path.** The SSR evidence is consistent with the iframe hypothesis; the next step is a browser run on `/privacy` with DevTools open to confirm an `<iframe>` appears under the embed div (vs inline content).

### Privacy EN ID `13687462` — empirical resolution UNCONFIRMED

I probed Termly's URL routing directly with the ID:

| URL | Result | Interpretation |
| --- | --- | --- |
| `HEAD https://app.termly.io/document/13687462` | 301 → `policy-viewer/policy.html?policyUUID=13687462` | Termly's URL normalizer accepts numeric `13687462` as a `policyUUID` parameter without complaint — no format-level rejection |
| `HEAD https://app.termly.io/document/<uuid>/<numeric>` | 301 → `policy-viewer/policy.html?policyUUID=<numeric>` | Both arg positions accepted |
| `GET https://app.termly.io/policy-viewer/policy.html?policyUUID=13687462&...` | 200, 1581 bytes | Returns the SPA shell (same shape regardless of ID — content is fetched client-side by `/hosted.min.js`) |
| `GET https://app.termly.io/policy-viewer/iframe-content?policyUUID=<any>&...` | 404 for ALL values tested (`13687462`, UUID, bogus) | Endpoint is either auth-gated or not the direct fetch URL — 404 here is uninformative about ID validity |

**Conclusion:** Termly's URL routing accepts the `13687462` format without 4xx-rejection at the routing layer, but this does NOT confirm the ID maps to a real Sunset Services Termly document. The actual policy fetch happens client-side in the SPA via `/hosted.min.js`. **A browser session on `/privacy` is the only way to confirm whether the iframe renders the expected Privacy Policy, the wrong document, or an error.**

The format concern I raised pre-flight (numeric vs UUID) turns out to be less black-and-white than expected — Termly's routing accepts both. The real question is whether `13687462` is a Sunset-Services-owned document on Termly's side. That answer lives in Cowork's Termly dashboard, not in code.

### What still requires a browser
1. Open `https://sunsetservices-mzi406cp0-dinovlazars-projects.vercel.app/privacy?x-vercel-protection-bypass=<token>&x-vercel-set-bypass-cookie=true` in an incognito Chrome window. (Replace `<token>` with the protection bypass value pulled fresh from the Vercel project API — never commit it.)
2. Check whether the area below the "Last updated" subtitle renders the expected Privacy Policy content within ~3 seconds, or shows an empty iframe, or surfaces a Termly error.
3. If content renders: open DevTools, inspect the embed div, confirm whether an `<iframe>` sits inside (validates Path B decision) or whether content rendered inline (validates Path A decision).
4. If content does NOT render: the format concern is real — `13687462` is either an iubenda residue or a wrong-tenant Termly ID. Cowork verifies against the Termly dashboard.
5. Run Tag Assistant Preview against the same URL through the Accept all / Reject all / Save preferences flows (Step 7 of the original brief). Confirm the four `consent_update` signals fire correctly. This is straightforward once a browser session is open.
6. Run Lighthouse desktop + mobile on `/privacy` for the Step 8 smoke (the Termly third-party script's impact on Performance + Best Practices).

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
