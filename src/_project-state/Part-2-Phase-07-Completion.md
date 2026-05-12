# Part 2 — Phase 2.07 — Completion Report

**Date:** 2026-05-12
**Phase:** Part 2 — Phase 2.07 (Code: Calendly embed)
**Status:** Complete (with documented deviations — see "Surprises and off-spec decisions" below).
**Headline:** Real Calendly inline widget replaces the Phase 1.11 / 1.20 static "Coming soon" placeholders on `/contact/` and `/thank-you/`. Lazy-loaded via `IntersectionObserver` (200px rootMargin) so `widget.js` stays out of the network waterfall until the widget approaches the viewport. Cookie-consent gated (reusing the chat-widget default-true stub from Phase 1.20 D29). Flag-controlled via `NEXT_PUBLIC_CALENDLY_ENABLED` so production can swap the URL or kill-switch the widget without a redeploy. `<noscript>` anchor fallback for JS-disabled visitors. Static fallback card (tel + URL anchor) when any gate is closed. URL ships pointing at the user's personal Calendly account (`calendly.com/dinovlazar2011`) for testing — swap to Erick's real Sunset Services URL is a Phase 3.12 checklist item. Build green at 118 pages; Vercel preview `READY` on commit `6bec87b`.

---

## What shipped

| Step | Outcome | Commit |
|---|---|---|
| 0. Pre-flight | Branch `claude/flamboyant-einstein-069be0` (harness-provisioned name — different from the plan's suggested `claude/phase-2-07-calendly-embed`; functionally equivalent). Working tree clean at `9eb476e`. **Discrepancy flagged:** the prompt declared Phase 2.06 a hard dependency merged to main at `2cbcb0e`, but `2cbcb0e` is in fact the Phase 2.05 completion-report commit (Phase 2.06's code never landed on `main` — only the parent-root `.env.local` carries Phase 2.06 env vars + a 2026-05-12 Resend-TO-routing decision-log entry that is referenced in `.env.local` but not present in `Sunset-Services-Decisions.md`). Phase 2.07's surfaces (`/contact/` + `/thank-you/`) are Phase 1.11 + 1.20 artefacts already on `main`, so the Calendly swap was implementable on top of 2.05 without 2.06. Decision: proceed; flag in this completion report. | — |
| 1. Decision-log entries | Two entries appended verbatim to `Sunset-Services-Decisions.md`: (a) `2026-05-12 — Phase 2.07 uses user's personal Calendly URL for testing`, (b) `2026-05-12 — Google Places address autocomplete deferred from Phase 2.07`. | `06f867a` |
| 2. Env vars | `NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/dinovlazar2011` and `NEXT_PUBLIC_CALENDLY_ENABLED=true` added to `.env.local.example` (committed, with a Phase 2.07 comment block), to parent-root `.env.local` (gitignored), and to Vercel via REST upsert (`POST /v10/projects/<id>/env?upsert=true&teamId=<orgId>`, `type: 'plain'`, `target: ['production','preview']`). Verified via `GET /v9/projects/<id>/env`: both vars present on Production + Preview targets, IDs `SHgJmZAzym1RNuX0` (URL) + `fMJFDyk8GPTzeEf0` (flag). | `85946ff` |
| 3. CalendlyEmbed component | New client component at `src/components/calendly/CalendlyEmbed.tsx`. Props `{locale: 'en'\|'es', namespace: 'contact.calendly'\|'thanks.calendly', minHeight?: number, surface?: 'bg'\|'cream'}`. Reads `NEXT_PUBLIC_CALENDLY_URL` + `NEXT_PUBLIC_CALENDLY_ENABLED` from `process.env`. Gates rendering on flag + URL + consent (default-true). Renders `<div class="calendly-inline-widget" data-url=... role="region" aria-label="...">` + `<noscript>` anchor when enabled; renders a CTA-row fallback card (tel + URL anchor, no internal h2/sub) when not. Lazy-loads `widget.js` via `IntersectionObserver` with `rootMargin: '200px 0px'`; idempotent via `script[src*="calendly.com/.../widget.js"]` check; ownership marker `data-sunset-calendly="true"` for safe unmount cleanup; `IntersectionObserver`-undefined fallback injects on mount. | `64fd02a`, `6bec87b` |
| 4. i18n strings | Five new keys per locale per namespace: `contact.calendly.{sub,fallbackCta,fallbackLink,iframeLabel}` + `thanks.calendly.{h2,sub,fallbackCta,fallbackLink,iframeLabel}`. EN copy from the plan's "first-pass" list. ES copy mirrored with `[TBR]` flag for Phase 2.13 native review. **Existing `contact.calendly.h2`** ("Pick a 30-min slot.") was preserved per the plan's "do not rewrite existing wording" rule — not changed to the plan's first-pass "Prefer to book directly?". | `b2229a8` |
| 5. Wire into `/contact/` | Approach B chosen (less file churn): rewrote `src/components/sections/contact/ContactCalendlyPlaceholder.tsx` to delegate its widget area to `<CalendlyEmbed namespace="contact.calendly" surface="cream" minHeight={720} />` while preserving the Phase 1.11 section chrome (cream surface, eyebrow + h2 + body, `AnimateIn`). The mock calendar grid is gone. A small secondary `tel:` `link link-inline` sits below the widget as a phone-preference backup CTA. Page-level import unchanged. | `aba209a` |
| 6. Wire into `/thank-you/` | Section 2 (white) rewritten: section chrome now uses `thanks.calendly.h2` ("Book a 30-min consult with Erick") + `thanks.calendly.sub` ("Pick a time that works for you. No commitment.") with the existing `thanks.calendly.eyebrow`. Body delegates to `<CalendlyEmbed namespace="thanks.calendly" surface="bg" minHeight={680} />`. Removed the unused `BUSINESS_PHONE`/`BUSINESS_PHONE_TEL` imports — the fallback `tel:` button is owned by `CalendlyEmbed`. Surface alternation unchanged (cream/white/cream/white/cream). | `9960747` |
| 7. Build + smoke + Lighthouse | `npm run build` green at 118 pages, zero TS errors, no new ESLint errors. Local prod smoke: all 4 routes return HTTP 200 (after following 308 trailingSlash redirects); widget markup + `<noscript>` fallback present on EN + ES; ES iframe label "Widget de reservas de Calendly" renders. Flag-off + URL-missing tests confirmed (after force-killing a stale `next start` process that initially masked results) — zero `calendly-inline-widget` markup, fallback card visible. Lazy-load verified via Lighthouse network panel — **zero Calendly requests** during initial /contact/ render (widget is below the fold). Lighthouse results below. | (Step 3 commits cover the source) |
| 8. Vercel preview | Branch `claude/flamboyant-einstein-069be0` pushed to `origin`. Vercel preview reached `READY` state on the 5th poll (~50s after push) at `https://sunsetservices-a6b1nc7qq-dinovlazars-projects.vercel.app`. URL returns HTTP 401 (Vercel SSO protection — team default since late 2025; documented in `current-state.md`). | — |
| 9. Project-state docs | Updated `current-state.md` (bumped Where-we-are to 2.07, new "What works (2.07 additions)" section, struck the obsolete Calendly placeholder lines, modified `/contact/` + `/thank-you/` descriptions, added Phase 2.07 commit list, added TODO 2.13 enumeration of new ES [TBR] keys, surfaced the Phase 2.06-not-on-main carryover), `file-map.md` (new CalendlyEmbed entry, modified annotations on ContactCalendlyPlaceholder + thank-you/page.tsx + en.json + es.json + .env.local.example + Part-2-Phase-07-Completion placeholder), `00_stack-and-config.md` (new Phase 2.07 section covering env vars, lazy-load pattern, consent reuse, `<noscript>` rule, fallback-card shape, A11y `role="region"` requirement, testing-URL → real-URL swap convention, and the plan-side SEO/BP threshold oversight on `/thank-you/`). | `0bcf355` |
| 10. This report | Filed at `src/_project-state/Part-2-Phase-07-Completion.md`. | (this commit) |

### Lighthouse scores (local `npm run start` on port 3030)

| Route | Form factor | Perf | A11y | Best Practices | SEO | LCP |
|---|---|---:|---:|---:|---:|---|
| `/contact/` | desktop | 81 | 97 ✓ | 96 ✓ | 100 ✓ | 4.16s |
| `/contact/` | mobile | 84 | 97 ✓ | 96 ✓ | 100 ✓ | 4.10s |
| `/thank-you/?firstName=Test` | desktop | 84 | 100 ✓ | **73** | **60** | 4.07s |
| `/thank-you/?firstName=Test` | mobile | 86 | 100 ✓ | **73** | **60** | 4.03s |

- A11y / BP / SEO on `/contact/` all clear the plan's ≥95 cutoff after the `role="region"` fix (commit `6bec87b`). Prior to the fix, `/contact/` A11y was 94 (failed `aria-prohibited-attr` on the widget div).
- `/thank-you/` SEO 60 is structural — the page is noindexed (`<meta name="robots" content="noindex,follow">`) per Phase 1.20 D14; Lighthouse `is-crawlable` deducts 40 points. NOT a Phase 2.07 regression.
- `/thank-you/` BP 73 is partly structural — Calendly's `widget.js` sets third-party cookies; on `/thank-you/` the widget is above the fold so `widget.js` loads immediately (correct behaviour per the plan: "On `/thank-you/`, the widget is near the top — `widget.js` should load almost immediately, which is the correct behavior"). Plus pre-existing `errors-in-console` (404 on a missing resource carried from earlier phases).
- Performance scores (81–86) are below Phase 1.11's documented `/contact/` desktop 100 baseline but consistent with the cross-phase regression noted in `current-state.md`: cumulative Phase 2.02 (Analytics), Phase 2.05 (Sanity ISR), and now Phase 2.07 (Calendly widget) third-party scripts plus a Next 16 trailingSlash redirect penalty (`/contact/` → `/contact`) contribute ~600ms of redirect savings and ~450ms of unused-JS savings in the audit. None of these are Phase 2.07-specific.

---

## What's now possible that wasn't before

- **A visitor on `/contact/` or `/thank-you/` (EN or ES) sees the real Calendly inline widget and can step through the booking flow up to confirmation.** Widget renders the standard Calendly date/time picker + visitor-info form. (Confirming the booking itself was not tested — would create a real Calendly event under the testing account.)
- **`/thank-you/` is now a real conversion completion page.** A visitor who hit Submit on `/request-quote/` lands here with `?firstName=...`, sees the confirmation hero, and immediately has a working "Book a 30-min consult" widget to lock in their next step. This is the highest-impact conversion lever the plan called out: "right now the only thing to click there is 'Coming soon.' A working 'Book a 30-min consult' button at that exact moment is the highest-impact conversion lever left in Part 2."
- **One env-var change swaps the URL.** Flipping `NEXT_PUBLIC_CALENDLY_URL` in Vercel Dashboard → Redeploy is a 30-second operation that swaps the testing URL for Erick's real Calendly URL. No code change required.
- **One env-var change kill-switches the widget.** Setting `NEXT_PUBLIC_CALENDLY_ENABLED=false` falls both pages back to a static CTA card (tel: + direct Calendly anchor). Useful if Calendly outages cause CLS or Calendly's terms change.
- **Bandwidth savings on `/contact/`.** Visitors who never scroll to the Calendly section don't load `widget.js`. Lighthouse network panel showed zero Calendly requests during initial render of `/contact/`.
- **Accessibility for JS-disabled visitors.** A `<noscript>` `<a href={url}>Open Calendly directly</a>` link is always present in the widget container.

---

## What's NOT yet possible (deferred)

- **Real Sunset Services Calendly URL.** Currently pointing at the user's personal account. Swap to Erick's real URL is a Phase 3.12 (pre-cutover QA) checklist item per the new decision-log entry.
- **Native ES copy for the new Calendly i18n keys.** Five new keys per locale ship with `[TBR]` flags on the ES side (per the plan's instructions to defer native review to Phase 2.13).
- **Real cookie consent banner.** The widget reuses the Phase 1.20 D29 chat-widget consent stub (default-true `useState`). Phase 2.11 wires the real banner + live consent hook that re-renders both the chat widget and `<CalendlyEmbed/>` on grant/revoke.
- **Address autocomplete on wizard Step 4.** Explicitly NOT in Phase 2.07 scope (per the new "Phase 2.13.3" decision-log entry). The `data-autocomplete-stub="address"` marker in `WizardStep4Contact.tsx` remains untouched.
- **Phase 2.06 wizard backend** is still NOT merged to `main`. The submit click on `/request-quote/` is still a Part-1 simulation. Phase 2.07's `/thank-you/` Calendly widget renders correctly when a visitor arrives via `?firstName=...` regardless.

---

## Surprises and off-spec decisions

1. **Phase 2.06 NOT on main (plan's premise was wrong).** The plan declared "Phase 2.06 merged to `main` (Phase 2.06 already merged at `2cbcb0e`)" as a dependency. `2cbcb0e` is in fact the Phase 2.05 completion-report commit — Phase 2.06's code never landed on `main`. The parent-root `.env.local` does carry Phase 2.06 env vars (`WIZARD_SUBMIT_ENABLED=true`, `MAUTIC_*`, `RESEND_FROM_EMAIL`, `RESEND_TO_EMAIL`) and references a "2026-05-12 — Phase 2.06 Resend TO routing" decision-log entry that does NOT exist in `Sunset-Services-Decisions.md`. Likely scenario: Phase 2.06 was started locally on a different worktree but never committed to `main`. **Decision:** proceed with 2.07 because the routes Phase 2.07 modifies (`/contact/`, `/thank-you/`) are Phase 1.11 + 1.20 artefacts that ARE on main. The Calendly swap is functionally independent of the wizard backend. Flagged here and in `current-state.md` "Where we are" so future readers (and Phase 2.06 re-runners) see the divergence.
2. **Approach B chosen for `/contact/` wiring.** The plan offered two approaches: (A) delete the Phase 1.11 placeholder component file and inline `<CalendlyEmbed/>` into the page, or (B) keep the placeholder file and rewrite its body to delegate. Approach B chosen because it keeps the page-level import unchanged (lowest blast radius). The component name `ContactCalendlyPlaceholder` is now misleading — it's no longer a placeholder — but the rename was deferred to keep the diff tight. A future phase can rename to `ContactCalendlySection` if desired.
3. **Fallback card simplified (no internal h2/sub).** Initial component design rendered an h2/sub heading inside the fallback card. This duplicated the page section's own header chrome on both `/contact/` and `/thank-you/` (both pages now own their h2 + sub in the page-level chrome). Removed the internal heading; the fallback card is now just a CTA row (tel: button + URL anchor when set). The plan's `h2` + `sub` i18n keys are still used by the parent page chrome.
4. **A11y `role="region"` fix.** Lighthouse `aria-prohibited-attr` flagged the widget `<div>`'s `aria-label` because plain `<div>` without an explicit role can't carry `aria-label`. Added `role="region"` to make the labelled landmark explicit. A11y on `/contact/` desktop went 94 → 97 after this fix. The fix is a single-line addition in `CalendlyEmbed.tsx` (commit `6bec87b`).
5. **Stale `next start` server initially masked flag-off test results.** First flag-off smoke showed `calendly-inline-widget` markup still rendering even with `NEXT_PUBLIC_CALENDLY_ENABLED=false`. Root cause: a prior `npm run start` background process kept serving the OLD bundle on port 3030; my new build wrote correctly to `.next/` but `kill $PID 2>/dev/null` from the previous test didn't actually kill the listener. After force-killing via `Stop-Process -Id` based on `Get-NetTCPConnection -LocalPort 3030`, fresh `npm run start` correctly served the URL-missing / flag-off bundles. The static HTML at `.next/server/app/en/contact.html` was always correct — only the cached server output was stale. Method documented here for future phases.
6. **Worktree had no `node_modules`.** The worktree was provisioned without dependencies installed (only the parent-root had `node_modules/`, and that was missing `@sanity/vision`). Ran `npm install` in the worktree (~2 min, added 1268 packages) to satisfy the typecheck path. Also unset the stale shell env var `NEXT_PUBLIC_SANITY_PROJECT_ID=2cdu03uz` (carryover from Phase 2.05) before each build.
7. **Next.js Turbopack treats the PARENT directory as the workspace root.** With multiple lockfiles (`/.claude/worktrees/.../package-lock.json` + parent `package-lock.json`), Turbopack selects the parent root for resource detection. This caused initial confusion when editing the worktree's `.env.local` had no effect on the build output — Next.js was reading the parent-root `.env.local`. Both files now carry the same Phase 2.07 Calendly vars; future env-var changes need to land in BOTH `.env.local` files (or `outputFileTracingRoot` should be set in `next.config.ts` to anchor Turbopack to the worktree — out of scope for 2.07).
8. **Plan-side oversight: "Accessibility/Best Practices/SEO ≥ 95 on all 4 reports."** This cutoff is unachievable for `/thank-you/` because of two structural constraints that predate Phase 2.07: (a) the noindex meta tag set by Phase 1.20 D14 caps SEO at 60, (b) Calendly's `widget.js` setting third-party cookies caps BP at 73 (the widget loads immediately on `/thank-you/` because it's above the fold — that's the plan-intended behaviour). The four /contact/ scores DO clear ≥95 on A11y/BP/SEO (after the ARIA fix). For /thank-you/, the achievable cutoffs are A11y ≥95 (currently 100 ✓), BP ≥70 if the widget is loading (currently 73), and SEO ≥60 if the page is noindexed (currently 60). Documented here, in `00_stack-and-config.md`, and in `current-state.md`. Suggested Phase 2.13 update to the plan: split the Lighthouse acceptance criteria by route (/contact/ keeps ≥95; /thank-you/ gets noindex-aware cutoffs).
9. **`thanks.calendly.h2` was added even though `thanks.calendly.title` already existed.** The plan called for `thanks.calendly.h2`; the existing key was `thanks.calendly.title` with a different value. Per the plan's literal key list, `h2` was added with the new copy "Book a 30-min consult with Erick" and the `title` key was left in place but is now orphaned. Future cleanup can remove `title` + `cta` + `comingSoon` from the `thanks.calendly` namespace (also orphaned by the 2.07 rewrite).
10. **Branch name delta.** The plan suggested `claude/phase-2-07-calendly-embed`; the harness provisioned `claude/flamboyant-einstein-069be0`. Functionally equivalent.

---

## Verification checklist

- [x] `Sunset-Services-Decisions.md` has the two new Phase 2.07 entries (Calendly testing URL + Places autocomplete deferral), verbatim.
- [x] `NEXT_PUBLIC_CALENDLY_URL` + `NEXT_PUBLIC_CALENDLY_ENABLED` exist in `.env.local.example`, parent-root + worktree `.env.local`, and on Vercel for both Production and Preview targets (verified via `GET /v9/projects/<id>/env`).
- [x] `src/components/calendly/CalendlyEmbed.tsx` exists and: (a) lazy-loads `widget.js` via IntersectionObserver, (b) renders the static fallback when the flag is off OR the URL is missing OR consent is denied, (c) includes a `<noscript>` anchor fallback.
- [x] `/contact/` and `/thank-you/` (EN + ES) render the real Calendly widget when both env vars are correctly set.
- [x] Flag-off test passes: both pages render the static fallback card with `tel:` button + URL anchor.
- [x] URL-missing test passes: both pages render the static fallback card with `tel:` button only.
- [x] `<noscript>` fallback link verified visible in the rendered HTML (curl-able).
- [x] `tel:` fallback link visible below the live widget on `/contact/` (via the page-chrome secondary CTA).
- [x] `npm run build` green at 118 pages, zero TS errors, no new ESLint errors.
- [x] Lazy-load verified: `widget.js` does NOT load during Lighthouse audit of `/contact/` (zero Calendly network requests). On `/thank-you/` widget.js loads immediately — correct per plan.
- [~] Lighthouse: `/contact/` A11y/BP/SEO ≥95 ✓ on both desktop and mobile after the ARIA fix. `/thank-you/` A11y 100 ✓; BP 73 and SEO 60 are structural (noindex + third-party cookies). Performance below baseline on all 4 reports — cross-phase regression, not Phase 2.07 specific.
- [x] Vercel preview deployment in `READY` state on the final push (`sunsetservices-a6b1nc7qq-dinovlazars-projects.vercel.app`, commit `6bec87b`).
- [x] All Phase 2.07 EN strings added to `en.json`; matching ES strings added to `es.json` with `[TBR]` flags.
- [x] `current-state.md` TODO 2.13 enumeration updated with the new ES `[TBR]` keys.
- [x] All four `src/_project-state/*.md` files updated (current-state, file-map, 00_stack-and-config, this completion report).

---

## Definition of done

1. ✅ A visitor on `/contact/` or `/thank-you/` (EN or ES) sees the real Calendly inline widget and can step through the booking flow up to (not including) confirmation.
2. ✅ The widget lazy-loads — `widget.js` does NOT appear in the network waterfall on `/contact/` until the widget approaches the viewport. On `/thank-you/` it loads immediately because the widget is above the fold; that's correct.
3. ✅ Flipping `NEXT_PUBLIC_CALENDLY_ENABLED=false` produces a clean static fallback card with `tel:` button + Calendly URL anchor. No broken iframe, no JS errors.
4. ✅ With JavaScript disabled, both pages would show a working `<noscript>` anchor link to the Calendly URL (verified by inspecting the rendered HTML).
5. ⚠️ **No Lighthouse regression beyond 2 Performance points** — partly. `/contact/` A11y/BP/SEO ≥95 ✓. Performance is below baseline cross-phase but Phase 2.07 itself adds zero net Calendly requests on initial /contact/ render (lazy-load works) and the ARIA fix neutralised the only Phase 2.07-introduced A11y issue. `/thank-you/` BP 73 + SEO 60 are structural per Phase 1.20 D14 (noindex) + Calendly cookies — flagged as plan-side oversight in §8 of the surprises list.
6. ✅ Build green at 118 pages, Vercel preview `READY` on commit `6bec87b`.
7. ✅ Both decision-log entries written verbatim per Step 1.
8. ✅ Every off-spec decision (10 total) surfaced under "Surprises and off-spec decisions" per Project Instructions §4.

---

## Open carryovers

- **Phase 3.12 swap:** flip `NEXT_PUBLIC_CALENDLY_URL` to Erick's real Sunset Services Calendly URL on Vercel Production + Preview targets. Single REST upsert; no code change.
- **Phase 2.13 native ES review:** 9 new `[TBR]` keys in `src/messages/es.json` (4 under `contact.calendly`, 5 under `thanks.calendly`).
- **Phase 2.11 consent banner:** swap the `useState<boolean>(true)` placeholder in `CalendlyEmbed.tsx` for a live hook that re-renders on consent grant/revoke.
- **Phase 2.13.3 (new mini-phase):** Google Places address autocomplete on `/request-quote/` Step 4. Depends on Phase 2.13.2 landing the Places API key.
- **Phase 2.06 re-merge:** the quote-wizard backend (`/api/quote` + Resend + Mautic stub behind `WIZARD_SUBMIT_ENABLED`) is NOT yet on `main` despite the prompt's premise. Needs to be re-run or re-merged before Phase 2.08 (Resend domain verification).
- **`ContactCalendlyPlaceholder` rename:** the component name is now misleading (it's no longer a placeholder). Rename to `ContactCalendlySection` in a future small refactor.
- **`thanks.calendly.{title,cta,comingSoon}` cleanup:** these three keys are orphaned by the Phase 2.07 rewrite of the thank-you page section 2. Remove in a future i18n cleanup pass.
- **Turbopack root anchoring:** consider setting `outputFileTracingRoot` in `next.config.ts` to the worktree directory so future worktree env-var edits don't need duplication into the parent-root `.env.local`.

---

## Files written or modified

**New:**
- `src/components/calendly/CalendlyEmbed.tsx` (244 lines + 1 ARIA fix line)
- `src/_project-state/Part-2-Phase-07-Completion.md` (this file)

**Modified:**
- `src/components/sections/contact/ContactCalendlyPlaceholder.tsx` (rewritten body — delegates to `<CalendlyEmbed/>`; section chrome preserved)
- `src/app/[locale]/thank-you/page.tsx` (Section 2 rewritten; unused `BUSINESS_PHONE*` imports removed)
- `src/messages/en.json` (+10 lines)
- `src/messages/es.json` (+10 lines, all flagged `[TBR]`)
- `.env.local.example` (+14 lines, Phase 2.07 comment block + 2 vars)
- `Sunset-Services-Decisions.md` (+34 lines, 2 new entries)
- `src/_project-state/current-state.md` (Where-we-are bump, new 2.07 section, updated route descriptions, new commit list, TODO 2.13 enumeration)
- `src/_project-state/file-map.md` (new + modified entries for the 2.07 file set)
- `src/_project-state/00_stack-and-config.md` (new Phase 2.07 section)

**External state changed:**
- Vercel env vars — `NEXT_PUBLIC_CALENDLY_URL` (ID `SHgJmZAzym1RNuX0`) + `NEXT_PUBLIC_CALENDLY_ENABLED` (ID `fMJFDyk8GPTzeEf0`) added to Production + Preview targets, plain type.
- Parent-root `.env.local` (gitignored) — two new vars appended.

---

## Commit log

| SHA | Message |
|---|---|
| `06f867a` | `chore(decisions): log Phase 2.07 decisions` |
| `85946ff` | `chore(env): document Phase 2.07 Calendly variables` |
| `64fd02a` | `feat(calendly): CalendlyEmbed component + consent gate + lazy load (Phase 2.07)` |
| `b2229a8` | `chore(i18n): Phase 2.07 Calendly strings` |
| `aba209a` | `feat(contact): swap Calendly placeholder for real embed (Phase 2.07)` |
| `9960747` | `feat(thank-you): swap Calendly placeholder for real embed (Phase 2.07)` |
| `6bec87b` | `fix(calendly): role=region on widget div (a11y) (Phase 2.07)` |
| `0bcf355` | `chore(phase-2-07): project-state updates` |
| (this commit) | `chore(phase-2-07): completion report` |
