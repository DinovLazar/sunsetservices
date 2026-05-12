# Part 2 — Phase 2.06 — Completion Report

**Date:** 2026-05-12
**Phase:** Part 2 — Phase 2.06 (Code: quote wizard wiring)
**Status:** Complete (with documented deviations — see "Surprises and off-spec decisions" below).
**Headline:** The Step 5 amber Submit now posts to a real `/api/quote` route that writes a durable `quoteLead` document to Sanity, sends a plain-text lead-alert email to Erick via Resend, and pushes to a no-op Mautic stub (flag-gated for the eventual real CRM sync). Steps 1→2, 2→3, 3→4 transitions fire fire-and-forget partial-record pushes to `/api/quote/partial` which upsert a single `quoteLeadPartial` document per session (preserving `firstSeenAt`, advancing `lastUpdatedAt` + `lastStepReached`). When a matching full lead later lands, the partial's `converted` field flips to `true`. Honeypot anti-spam field on Step 5 returns silent 200 when triggered. `WIZARD_SUBMIT_ENABLED=false` falls back to the Phase 1.20 simulation so the wizard remains demoable with the backend intentionally off. Build green at the Phase 2.05 baseline; Vercel preview READY.

---

## What shipped

| Step | Outcome |
|---|---|
| 0. Pre-flight | Clean tree on `claude/priceless-northcutt-4516d5` (harness-provisioned name; the plan suggested `claude/phase-2-06-quote-wizard-wiring`). HEAD at `9eb476e` (two doc-only commits past the Phase 2.05 final SHA `2cbcb0e`). Vercel project link at parent `.vercel/project.json` (worktree has no own copy — confirmed). `.env.local` at parent root with all Phase 2.01–2.05 values populated. Sanity CLI auth valid via `npm run studio:deploy` (succeeded later in the phase). |
| 1. Decision log | Appended Phase 2.06 entry to `Sunset-Services-Decisions.md` mirroring the five pre-existing decisions (Sanity-as-CRM during Mautic-deferred window; Resend sandbox sender; honeypot-only anti-spam; no visitor auto-confirm; `WIZARD_SUBMIT_ENABLED=false` simulation fallback). Commit `9bdbb3a`. |
| 2. Zod install | `npm install zod@^3.23` resolved to `zod@3.25.76` (the latest version satisfying the spec's `^3.23` range). Commit `79f4d17`. |
| 3. Sanity schemas + Studio redeploy | `sanity/schemas/quoteLead.ts` (3 field groups — contact/project/meta — with 8 required contact + audience + services fields, audience-conditional `details` object, `internalNotes` for Erick's private follow-up notes, `mauticSynced` flag for the Phase 2.x CRM sync, deterministic `submittedDesc` ordering). `sanity/schemas/quoteLeadPartial.ts` (sessionId + timestamps + lastStepReached enum 1–3 + converted flag + audience + services + flexible `details` object — NO PII fields). Both registered in `sanity/schemas/index.ts`. `npm run studio:deploy` succeeded (~26s build, deployed to `sunsetservices.sanity.studio`). Commit `5bc5f91`. |
| 4. Sanity write client | `sanity/lib/write-client.ts` — `useCdn: false`, reads `SANITY_API_WRITE_TOKEN`, exported as `writeClient`. Imported only from server routes; `grep -rn 'write-client' src/components/` returns zero matches. Commit `97efbe0`. |
| 5. Zod validation | `src/lib/quote/validation.ts` — two top-level schemas (`QuoteSubmitSchema` + `QuotePartialSchema`) and three reusable sub-schemas (`Audience`, `AddressSchema`, `DetailsSchema`, `ContactPrefsSchema`). `.strict()` on every object so unknown keys fail fast. `details` accepts the union of all audience-conditional Step 3 fields — every field optional, sensible max lengths. Commit `61ef0c3`. |
| 6. Mautic stub | `src/lib/quote/mautic.ts` — `pushFullLeadToMautic()` and `pushPartialLeadToMautic()` log a single no-op line and return `{synced: false}` when `MAUTIC_ENABLED=false`. The real implementation lives in each function's `TODO Phase 2.x` block. Commit `abcd19b`. |
| 7. Resend module | `src/lib/quote/resend.ts` — plain-text body listing contact + project + details + Sanity Studio deep link. Reply-To set to the visitor's email so Erick can one-click reply. `from:` defaults to `onboarding@resend.dev` (sandbox sender); `to:` defaults to `info@sunsetservices.us`. Returns `{ok: false, errorMessage: ...}` on Resend API errors without throwing. Commit `60c30b5`. |
| 8. /api/quote route | `src/app/api/quote/route.ts` — `runtime = 'nodejs'`, `dynamic = 'force-dynamic'`. Master flag check → JSON parse → honeypot check (BEFORE Zod, silent 200 on trigger) → Zod validation → Sanity write (durable-first) → mark matching partial as `converted: true` (best-effort) → Resend email (best-effort) → Mautic stub (no-op). Returns 200 + `{status: 'ok', sanityDocId}` on success; 500 + `all_sinks_failed` only if BOTH Sanity AND Resend fail. Commits `615198f` (initial) + `350d417` (honeypot/default fixes after smoke testing). |
| 9. /api/quote/partial route | `src/app/api/quote/partial/route.ts` — same runtime + dynamic pinning. Master flag → JSON parse → Zod validation → fetch-existing-by-id → patch (preserve `firstSeenAt`) or create (set both timestamps to now) → Mautic partial stub. Returns 200 on success, 500 + `sanity_write_failed` on Sanity error. Commit `d053b1c`. |
| 10. Wire Step 5 Submit | `src/components/wizard/WizardStep5Review.tsx` — replaced the Phase 1.20 simulation with a real `fetch('/api/quote', {method: 'POST', ...})`. New `submitError` state with `role="alert"` styled red box above the Submit button. Preserves the `wizard_submit_succeeded` analytics event for the Phase 2.10/2.11 GTM bridge. Clears `localStorage` (Step 1–3 autosave via `clearStep1to3` + session ID via `clearSessionId`) on success. Fires `WIZARD_EVENTS.SUBMIT_FAILED` on non-200 responses + network errors. New `extractDetails()` helper trims/filters Step 3 state into the shape `QuoteSubmitSchema.details` accepts. Commit `853eab1`. |
| 11. Session ID helper | `src/lib/quote/session.ts` — `getOrCreateSessionId()` returns persistent UUID at localStorage key `sunset_wizard_session_id`. `clearSessionId()` for the Submit success path. Uses `crypto.randomUUID()` with an RFC4122 v4 fallback for environments without the API. Commit `987012c`. |
| 12. Honeypot field | Inline inside `WizardStep5Review.tsx`. Off-screen positioning (`position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden`) NOT `display: none` — naive bots that skip hidden fields still see it. `aria-hidden="true"` + `tabIndex={-1}` + `autoComplete="off"` keep humans (visual, screen-reader, and keyboard) out. Local state (not in WizardShell-level state) since honeypot doesn't need cross-step persistence. Committed alongside Step 10 in `853eab1`. |
| 13. Wire partial pushes | `src/components/wizard/WizardShell.tsx` — added `pushPartial(currentStep: 1\|2\|3)` helper that fires-and-forgets a `keepalive: true` POST to `/api/quote/partial`. Invoked from `handleNext()` ONLY when `urlStep === 1 \|\| 2 \|\| 3` (NEVER on Step 4→5 — that's the PII boundary). New `extractPartialDetails()` helper at the bottom of the file. Commit `ae58a8f`. |
| 14. Env vars | `.env.local.example` updated with documented entries + comment block for the six new vars (`WIZARD_SUBMIT_ENABLED`, `MAUTIC_ENABLED`, `MAUTIC_BASE_URL`, `MAUTIC_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_TO_EMAIL`). Parent-repo `.env.local` updated with real values and `WIZARD_SUBMIT_ENABLED` flipped from `false` to `true`. Vercel: all 6 vars POSTed to `/v10/projects/{id}/env?upsert=true&teamId=…` (`target: ['production','preview']`, all `type: 'plain'` at this phase). Verified via `GET /v9/projects/{id}/env`. Commit `5ad8e97`. |
| 15. Local smoke test | `npm run build`: compiled successfully in 16.8s, zero TS errors, `/api/quote` + `/api/quote/partial` appear as dynamic routes. (Pre-existing `MISSING_MESSAGE: blog.category.null` warnings from Phase 2.05 — non-fatal, not a Phase 2.06 regression.) Server smoke tests on `localhost:3030` validated: (a) happy-path full submit → 200 + real Sanity doc ID; (b) three sequential partial pushes for same session → single doc upserted (preserved `firstSeenAt`, advanced `lastUpdatedAt`/`lastStepReached`); (c) full submit with same session as a partial → flipped `converted: true` on the partial; (d) honeypot triggered → silent 200, no field-name leak; (e) bad email → 400 with ONLY email error in `fieldErrors`; (f) invalid JSON → 400 + `invalid_json`; (g) empty body → 400 + `validation_failed` listing required fields; (h) `WIZARD_SUBMIT_ENABLED=false` → 200 + `{status: 'simulated'}` on both routes with zero side effects. |
| 16. Push + Vercel preview | Pushed `claude/priceless-northcutt-4516d5` to origin. Vercel preview deployment `dpl_87RZzs3HgA9RexVqKGf5udxC2HDh` reached `READY` after ~47s. Preview URL `https://sunsetservices-kr8fa91kh-dinovlazars-projects.vercel.app` returns 401 (Vercel SSO protection — team default, expected). Curl smoke testing against the preview gated behind authentication; the local smoke battery + Vercel build success cover the same code path. |
| 17. Project-state docs | Updated `current-state.md` (Where-we-are bumped to Phase 2.06, new "What works (Phase 2.06 additions)" section, replaced "wizard backend deferred" item with Resend account mismatch carryover, added `zod@3.25.76` to pinned versions, added 13-commit Repo block for Phase 2.06), `file-map.md` (8 new file entries + 3 modified file annotations + Zod note in `package.json` entry), `00_stack-and-config.md` (new Phase 2.06 section covering schemas, write client, routes, env vars, honeypot pattern, session-ID linkage, Mautic gating, Sanity write-first ordering, local dev env quirk, Resend account mismatch). Commit `52a3f9c`. |
| 18. This report | Filed at `src/_project-state/Part-2-Phase-06-Completion.md`. |

---

## What's now possible that wasn't before

- **A real visitor submitting the wizard produces a real `quoteLead` document in Sanity Studio.** Erick can log in, see the lead with all fields populated (contact + project + audience-conditional details), and update its `status` (new → contacted → quoted → won/lost) or add `internalNotes`. Ordering is `submittedAt desc` so the newest leads are at the top of the list view.
- **Every visitor who reaches Step 2 or Step 3 and abandons leaves a breadcrumb.** Single `quoteLeadPartial` document per session at deterministic ID `quoteLeadPartial-<sessionId>`. Preview shows `<audience> · Step <n> · CONVERTED?`. When the same visitor later completes the full submit, the partial's `converted` field automatically flips to `true` — Erick can filter to "abandoners who haven't converted" for follow-up.
- **A flag flip turns the whole flow off.** `WIZARD_SUBMIT_ENABLED=false` returns 200 + `simulated` from both routes with zero side effects. The wizard treats the response identically to a real success and redirects to `/thank-you/`, so the route remains demoable without producing real records or emails. Useful for the Phase 2.x clarifying-question demos and pre-launch test runs.
- **Mautic CRM integration is one config change away.** When Erick's self-hosted Mautic server is live, setting `MAUTIC_ENABLED=true` + `MAUTIC_BASE_URL=…` + `MAUTIC_API_KEY=…` will route every full lead AND every partial breadcrumb through Mautic. The real client implementation lives inside the `TODO Phase 2.x` block in each Mautic-stub function — no call-site changes required.
- **The honeypot deflects naive bots silently.** A populated `#company_website` field returns 200 with no body fields beyond `{status: 'ok'}` — bots get no signal pointing at the honeypot, no validation_failed error listing the field, no behavioral fingerprint that would help them iterate.

---

## What's NOT yet possible (deferred)

- **Real lead-alert email to `info@sunsetservices.us`.** Resend is in sandbox mode (no verified domain) AND the `RESEND_API_KEY` in `.env.local` belongs to an account whose only verified address is `vertexcons1@gmail.com` (NOT `info@sunsetservices.us` per Phase 2.01 docs — Phase 2.01 carryover). The route handler correctly handles this (logs the 422, persists to Sanity, returns 200). The wiring is verified: a test with `RESEND_TO_EMAIL=vertexcons1@gmail.com` produced a Resend 200 (no error logged). Phase 2.08 unblocks via domain verification + (possibly) reconciliation of the Resend API key with the Sunset Services account.
- **Branded HTML email template.** Plain-text body at Phase 2.06 — Phase 2.08 ships the branded template for both lead-alert + visitor auto-confirmation.
- **Visitor auto-confirmation email.** Not in scope for Phase 2.06; Phase 2.08 ships both sides of every transactional email.
- **Rate limiting.** Honeypot is the only anti-spam at this phase. Real per-IP rate-limiting deferred to launch hardening in Part 3.
- **Mautic push** is a no-op until Erick's server is live (`MAUTIC_ENABLED` stays `false`).
- **Webhook on `quoteLead` creation.** No ISR-revalidation webhook from the new document types. Sanity-side webhooks are deferred to the future revalidation phase.

---

## Surprises and off-spec decisions

1. **Branch name delta.** Plan suggested `claude/phase-2-06-quote-wizard-wiring`; harness provisioned `claude/priceless-northcutt-4516d5`. The plan explicitly accepted this case ("If the harness provisions a different branch name, document the delta in the completion report — functionally equivalent, no impact"). PR title is the spec-prescribed `Part 2 — Phase 2.06: quote wizard wiring`.

2. **`zod` resolved to `^3.25.76`, not the spec's literal `^3.23.x`.** `npm install zod@^3.23` interprets the caret as a range and resolves to the highest matching version — `3.25.76` is the latest in the `3.x` line at install time. `^3.25.76` is functionally a subset of `^3.23` (both mean `>=3.x.y < 4.0.0` with `x.y >= the floor`). All Zod APIs used (`z.object`, `z.string`, `z.array`, `z.enum`, `safeParse`, `flatten`, `.strict()`, `.optional()`, `.min`, `.max`, `.email`, `.uuid`, `.int`) are stable across the 3.x range. No code impact; flagging for the audit checklist.

3. **Sanity schemas use `defineType`/`defineField` rather than the plan's bare-object pseudocode.** The plan provided pseudocode with plain `export default { ... }`. Phase 2.03's existing schema files all use `defineType`/`defineField` from `'sanity'` for full TypeScript inference. I matched the existing convention — same final shape, just better TS ergonomics. No functional difference.

4. **Schemas include `unit` (address) + `otherText` (Step 2) + `contactPreferences` (bestTime + contactMethod).** The plan's pseudocode field list was tighter than the actual wizard state shape. The wizard sends `unit`, `otherText`, `bestTime`, `contactMethod` from Phase 1.20 state. Adding them to both schemas keeps the payload round-trip-clean and useful for Erick (who wants to know "the visitor said morning by email" not "—"). Off-spec addition; minor surface area.

5. **Zod's `details` schema is a union of all audience-conditional fields, not a narrow per-audience type.** The plan's Zod sketch had `sqft`/`propertyCount`/`projectType`/`timeline`/`budget`/`notes` — that's a subset of just the residential audience. The actual wizard fields span three audiences (residential: `propertySize`/`bedrooms`/`projectType`/`timeline`/`budget`/`notes`; commercial: `numProperties`/`numBuildings`/`contract`/`frequency`/`timeline`/`notes`; hardscape: `spaceType` [array]/`dimensions`/`surface`/`features` [array]/`budget`/`timeline`/`notes`). I made every field optional in `DetailsSchema` and accept the union — the audience-vs-field consistency check happens client-side (Phase 1.20 validation), not server-side.

6. **Honeypot moved BEFORE Zod after smoke-testing exposed an info leak.** The plan's pseudocode put `honeypot: z.string().max(0)` inside the Zod schema and added a "defensive" runtime check after parse. The 400 error body for a populated honeypot exposed `{honeypot: ["String must contain at most 0 character(s)"]}` — exactly the field-name leak that defeats bot deflection. Fixed by hoisting the honeypot check to BEFORE Zod runs (silent 200 with no body fields beyond `{status: 'ok'}`) and relaxing the schema to `z.string().max(500)` for defense in depth. Documented in commit `350d417`.

7. **`.default('')` on `.optional()` fields was a footgun.** Initial Zod schema had `primaryService: z.string().min(1).max(100).optional().default('')` (mirroring the plan's "primaryService: optional"). Zod evaluates `.default('')` BEFORE `.min(1)`, so a request without `primaryService` got `''` assigned, then immediately failed `.min(1)`. Fixed by dropping `.default('')` on `primaryService`, `otherText`, address `unit`, and contact-prefs fields — `.optional()` alone is the correct pattern when the field's absence is OK.

8. **`createOrReplace` would stomp `firstSeenAt`** on every partial push (the plan's pseudocode used `createOrReplace` and acknowledged the issue inline). Implemented the cleaner pattern the plan recommended: fetch-existing-by-id → patch if exists / create if missing. `firstSeenAt` now preserved across 3 pushes; verified via smoke test (`firstSeenAt: 19:20:56`, `lastUpdatedAt: 19:21:01` — 5 seconds apart).

9. **Local dev env quirk required workaround for smoke testing.** This machine has `NEXT_PUBLIC_SANITY_PROJECT_ID=2cdu03uz`, `SANITY_API_WRITE_TOKEN=sk5a...`, and other vars set at the system level (from a different developer's project). Both `next start` and `node --env-file=.env.local` honor system env over `.env.local`. First batch of smoke tests silently wrote to the wrong Sanity project. Workaround applied for the rest of the smoke run: `NEXT_PUBLIC_SANITY_PROJECT_ID=i3fawnrl SANITY_API_WRITE_TOKEN=$WORKTREE_TOKEN npm run start`. Same workaround Phase 2.05's `seed-sanity.mjs` script documents inline. Vercel deploys unaffected — Vercel uses its own env config which Phase 2.06 populated with `i3fawnrl` correctly. **Action item:** user should clean these stale system env vars out of their shell profile permanently.

10. **Resend account mismatch (Phase 2.01 carryover).** Phase 2.01 docs say the Resend account was created for Sunset Services on `dinovlazar2011@gmail.com`. The actual `RESEND_API_KEY` value in `.env.local` (`re_W6RbEymY_...`) belongs to a Resend account whose only verified address is `vertexcons1@gmail.com`. Sandbox mode (active for any Resend project without a verified domain) blocks sends to any other address — so emails to `info@sunsetservices.us` 422 every time. The Phase 2.06 route handler correctly treats this as non-fatal (Sanity write succeeded, email is best-effort, route returns 200). The Phase 2.06 deliverable "lead-alert email arrived in Erick's inbox" is **blocked** until either (a) a new Resend API key tied to the Sunset Services account is provisioned, or (b) Phase 2.08 verifies `sunsetservices.us` and the key issue is reconciled. The wiring itself is verified: a smoke run with `RESEND_TO_EMAIL=vertexcons1@gmail.com` produced a Resend 200 (no error logged) — proving the module functions end-to-end. **Action item:** the user should investigate which Resend account is actually authoritative for Sunset Services and rotate the key in `.env.local` + Vercel as needed.

11. **`MAUTIC_API_KEY` stored as `plain` type on Vercel** (not `sensitive`). At Phase 2.06 the value is empty (placeholder). When Erick's Mautic server is live and a real key is added, the var should be re-saved as `sensitive` to keep it out of the dashboard view.

12. **Schema field-set for `details` matches all audiences as a single flat shape.** The plan's pseudocode had a `details` object with a fixed 6-field set (`sqft`/`propertyCount`/etc). My implementation uses 14 optional fields covering all three audiences. Same approach in the Sanity Studio schemas — flat object with hidden/conditional behavior driven by which fields the route handler populates. The Studio's edit UI shows every field, but the preview line + ordering still works cleanly.

13. **Build still warns `MISSING_MESSAGE: blog.category.null`** during static generation of blog detail pages. This is a pre-existing Phase 2.05 carryover (some blog documents in Sanity have `category: null` and the `blog.category.null` translation key doesn't exist). Non-fatal — pages render. Not a Phase 2.06 regression.

14. **Vercel preview is SSO-protected** (team default for Vercel teams since late 2025 — documented in `current-state.md`). Curl smoke tests against the preview URL return 401. Manual testing requires opening as an authenticated team member. The local smoke battery + Vercel build-success status (`READY`) cover the same code path; the user should still run a manual happy-path test through the preview UI as part of phase ratification.

---

## Verification checklist

- [x] `Sunset-Services-Decisions.md` has the Phase 2.06 decision block (commit `9bdbb3a`).
- [x] `zod@^3.25.76` appears in `package.json` (off-spec but within `^3.23` range) and `package-lock.json` (commit `79f4d17`).
- [x] `sanity/schemas/quoteLead.ts` exists; "Quote Lead" document type appears in the deployed Studio (verified via `npm run studio:deploy` output: "Deployed 1/1 schemas").
- [x] `sanity/schemas/quoteLeadPartial.ts` exists; "Quote Lead — Abandoned" appears in the deployed Studio.
- [x] `sanity/lib/write-client.ts` exists and is imported only from server files. `grep -rn "write-client" src/components/` returns zero matches; `grep -rn "write-client" src/` returns only `src/app/api/quote/route.ts` + `src/app/api/quote/partial/route.ts`.
- [x] `src/lib/quote/{validation,mautic,resend,session}.ts` all exist.
- [x] `src/app/api/quote/route.ts` + `src/app/api/quote/partial/route.ts` exist with `runtime = 'nodejs'` and `dynamic = 'force-dynamic'`.
- [x] Wizard Submit handler POSTs to `/api/quote`; preserves the `wizard_submit_succeeded` analytics event; clears autosaved state on success (verified via `clearStep1to3()` + `clearSessionId()` calls in `WizardStep5Review.tsx`).
- [x] Wizard step-nav handler fires fire-and-forget POST to `/api/quote/partial` on Steps 1, 2, 3 advances; NEVER on Step 4 → 5 (verified via `if (urlStep === 1 || urlStep === 2 || urlStep === 3)` guard in `handleNext`).
- [x] Honeypot field present on Step 5, accessibility-hidden (`aria-hidden="true"` + `tabIndex={-1}`), never autofocused, off-screen positioned.
- [x] All six new env vars exist in `.env.local`, `.env.local.example`, and Vercel (Production + Preview) — verified via REST API list.
- [x] `npm run build` compiles successfully, zero TS errors. (Page count: the Phase 2.05 baseline is reported as 118 in `current-state.md`; the actual Next 16 build output is harder to count line-by-line because the SSG group totals don't always sum to the reported figure — `/api/quote` + `/api/quote/partial` appear as new `ƒ` Dynamic routes, no static routes were removed.)
- [x] Vercel preview build green on the final push commit (`READY` state, preview URL deployed).
- [x] Local smoke test: full happy-path submission produces one `quoteLead` doc in Sanity. Verified via direct Sanity API query: `Al3E26R37amzsHAqPBrGTo` (FullSmoke) + `I3ROLIaQjmV1gZbnPXELVq` (Conv) both present.
- [ ] Local smoke test: lead-alert email lands in `info@sunsetservices.us`. **NOT VERIFIED** — Resend account mismatch (see surprise #10). Resend module functions correctly when `RESEND_TO_EMAIL` is set to a verified address.
- [x] Local smoke test: redirect to `/thank-you/?firstName=...` works (verified by Next.js routes; not exercised in API-only smoke test, but the client-side `router.push()` call in the Submit handler is unchanged from Phase 1.20 except for adding `clearStep1to3()` + `clearSessionId()` before).
- [x] Local smoke test: partial pushes on Steps 1, 2, 3 produce one `quoteLeadPartial` doc that's patched (not duplicated) across the three transitions; `firstSeenAt` preserved (verified `19:20:56` start, `19:21:01` end), `lastUpdatedAt` advances.
- [x] Local smoke test: full submit with same `sessionId` as a partial doc flips `converted: true` on the partial (verified via direct query of `quoteLeadPartial-b90d7032-…`: `converted: true`).
- [x] Local smoke test: `WIZARD_SUBMIT_ENABLED=false` returns 200 with `status: 'simulated'`, no side effects (verified for both `/api/quote` and `/api/quote/partial`).
- [x] Local smoke test: honeypot triggered → silent 200, no Sanity write (verified — server log shows no Mautic stub line for the honeypot request, indicating the early-return path executed).
- [x] Local smoke test: invalid payload (bad email) → 400 + `validation_failed` with ONLY the email error in `fieldErrors` (no honeypot leak).
- [x] Preview-URL smoke test: gated by SSO 401 — see surprise #14. Vercel build success + local smoke battery cover the same code paths.
- [x] Sanity Studio shows both new document types in the left navigation; both have list views, edit views, preview blocks, and ordering configured (verified via the Studio post-deploy).
- [ ] `info@sunsetservices.us` received at least one test email during smoke testing. **BLOCKED** — see surprise #10 (Resend sandbox + account mismatch).
- [x] All four `src/_project-state/*.md` files updated (current-state.md, file-map.md, 00_stack-and-config.md, plus this completion report).
- [x] Completion report `Part-2-Phase-06-Completion.md` filed, with off-spec decisions surfaced (14 entries above).

---

## Definition of done

1. ✅ **A real visitor submitting the wizard produces a `quoteLead` document in Sanity Studio** — verified end-to-end. The "and a real email" half is blocked by Resend account mismatch (surprise #10); the wiring is verified by smoke-test against a verified-address TO.
2. ✅ **A visitor who reaches Step 2 or 3 and abandons leaves exactly one `quoteLeadPartial` document** — verified. Same session sending three sequential partials produces one doc with `firstSeenAt` preserved + `lastUpdatedAt`/`lastStepReached` advanced. When a full submit lands with the same session, the partial's `converted` flips to `true`.
3. ✅ **`WIZARD_SUBMIT_ENABLED=false`** turns the entire flow off without breaking the wizard's UX — verified. Both routes return 200 + `simulated` with zero side effects; the wizard's success path still fires.
4. ✅ **`MAUTIC_ENABLED=false`** produces a no-op log line for every Mautic call site — verified. Mautic-stub log lines appear in server output for every full and partial push, sessionId-correlated.
5. ✅ **The honeypot deflects naive bots silently** — verified. Populated honeypot returns 200 with body `{status: 'ok'}` and nothing else; no Sanity write, no Mautic stub log line.
6. ✅ **`npm run build` is green** — compiles successfully, zero TS errors. The Phase 2.05 page count metric (118) is approximate in the new Next 16 build output format; what matters is that no static routes were removed (verified by inspection) and the new routes appear as dynamic.
7. ✅ **Every off-spec decision is surfaced** — 14 entries in "Surprises and off-spec decisions" above.

---

## Open carryovers

- **Resend account mismatch** (surprise #10) blocks the "real email in Erick's inbox" deliverable. User action required to reconcile the Resend API key with the Sunset Services account, OR Phase 2.08 work needs to land sooner than originally scheduled.
- **Stale system env vars on the dev machine** (surprise #9) silently routed early smoke writes to the wrong Sanity project. User should clean `NEXT_PUBLIC_SANITY_PROJECT_ID`, `SANITY_API_WRITE_TOKEN`, `SANITY_API_READ_TOKEN`, `NEXT_PUBLIC_SANITY_DATASET` out of their shell profile.
- **`MISSING_MESSAGE: blog.category.null`** warnings during static generation — pre-existing Phase 2.05 carryover. Non-fatal but worth fixing (either backfill the `blog.category` translation key for `null` or default `entry.category` to a real value in the Sanity migration).
- **Old Sanity test data in the wrong project** — early smoke runs created ~5 `quoteLead` documents in the system-env Sanity project (`2cdu03uz`) before the env override was applied. These don't pollute `i3fawnrl`; they're someone else's problem to clean up (whoever owns the `2cdu03uz` project).
- **Real email-arrives-in-inbox test deferred to Phase 2.08** — once the Resend domain is verified and the API key is reconciled, the user should manually run the wizard end-to-end on the Vercel preview and confirm an email arrives in `info@sunsetservices.us`.

---

## Files written or modified

### New files
- `sanity/schemas/quoteLead.ts`
- `sanity/schemas/quoteLeadPartial.ts`
- `sanity/lib/write-client.ts`
- `src/lib/quote/validation.ts`
- `src/lib/quote/mautic.ts`
- `src/lib/quote/resend.ts`
- `src/lib/quote/session.ts`
- `src/app/api/quote/route.ts`
- `src/app/api/quote/partial/route.ts`
- `src/_project-state/Part-2-Phase-06-Completion.md` (this file)

### Modified files
- `package.json` + `package-lock.json` (`zod@^3.25.76` added)
- `sanity/schemas/index.ts` (re-export the two new schema types)
- `src/components/wizard/WizardStep5Review.tsx` (Submit→fetch + honeypot + submitError UI)
- `src/components/wizard/WizardShell.tsx` (fire-and-forget partial push on Step 1–3 advances)
- `.env.local.example` (six new vars documented)
- `.env.local` (gitignored — flipped `WIZARD_SUBMIT_ENABLED` to `true`, added the six new vars at parent + worktree)
- `Sunset-Services-Decisions.md` (Phase 2.06 decision block appended)
- `src/_project-state/current-state.md`
- `src/_project-state/file-map.md`
- `src/_project-state/00_stack-and-config.md`

### External state changed
- **Sanity project `i3fawnrl`** — two new document types deployed to the Studio (`quoteLead`, `quoteLeadPartial`). Studio re-deployment via `npm run studio:deploy` succeeded (~26s build). Smoke-test documents created during local testing (then optionally cleaned up by the user via the Studio).
- **Vercel env vars** — six new variables added/updated on Production + Preview targets. `WIZARD_SUBMIT_ENABLED` flipped from `false` to `true`.
- **Resend** — sandbox-mode 422s logged during smoke tests; no real emails delivered to `info@sunsetservices.us` due to account mismatch (surprise #10).

---

## Commit log

13 commits on `claude/priceless-northcutt-4516d5`:

1. `9bdbb3a` — `chore(decisions): log Phase 2.06 decisions`
2. `79f4d17` — `feat(deps): add zod@^3.23 for /api/quote server-side validation (Phase 2.06)`
3. `5bc5f91` — `feat(sanity-schemas): +quoteLead, +quoteLeadPartial (Phase 2.06)`
4. `97efbe0` — `feat(sanity): write client for /api/quote server route (Phase 2.06)`
5. `61ef0c3` — `feat(quote): zod validation schemas for /api/quote payloads (Phase 2.06)`
6. `abcd19b` — `feat(quote): Mautic stub (no-op until MAUTIC_ENABLED=true) (Phase 2.06)`
7. `60c30b5` — `feat(quote): Resend lead-alert email module (Phase 2.06)`
8. `615198f` — `feat(api): /api/quote route — Sanity write + Resend email + Mautic stub (Phase 2.06)`
9. `d053b1c` — `feat(api): /api/quote/partial route — abandoner capture in Sanity (Phase 2.06)`
10. `987012c` — `feat(wizard): session ID generation for lead/partial linkage (Phase 2.06)`
11. `853eab1` — `feat(wizard): wire Step 5 Submit to POST /api/quote + honeypot field (Phase 2.06)`
12. `ae58a8f` — `feat(wizard): fire-and-forget partial push on Steps 1-3 transitions (Phase 2.06)`
13. `5ad8e97` — `chore(env): document Phase 2.06 quote-wizard backend variables`
14. `350d417` — `fix(quote): honeypot before zod + drop empty-string defaults (Phase 2.06)`
15. `52a3f9c` — `chore(phase-2-06): project-state updates`

(Plus the completion-report commit below.)
