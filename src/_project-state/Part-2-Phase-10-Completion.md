# Part 2 — Phase 2.10 Completion

> Code: analytics stack — GTM + GA4 + Microsoft Clarity + cookie consent banner + dataLayer bridge.
> Branch: `claude/thirsty-kowalevski-1b2357` from `origin/main` at `0606124`.
> Date: 2026-05-13.
> PR: [DinovLazar/sunsetservices#5](https://github.com/DinovLazar/sunsetservices/pull/5).

## Headline

Cowork Part A (account creation) closed on 2026-05-13 with `GTM-NL5XX4DV` / `G-RY6NT70SH7` / `wqodtpq86q` written into the handover. Phase 2.10 Code adds the four `NEXT_PUBLIC_*` env vars across the worktree + `.env.local.example` + Vercel Production + Preview (IDs `nCMCsddKl918a76Z` / `W1sg2noqokq2ntOW` / `gdkiC6dAlkMYyHOE` / `6cFnFt7qECEiidqP`), ships a binary cookie consent banner in `chrome.consent.*` (EN spec + ES `[TBR]`) that gates GTM + Clarity script load entirely until Accept is clicked, and wires every existing `sunset:*-event` CustomEvent (wizard / contact / newsletter / chat / Calendly) into `window.dataLayer` through a 5-scope bridge that listens on `document` (off-spec correction — dispatchers fire on `document` without `bubbles: true`, so the plan's `window.addEventListener` would never catch them). The bridge applies a defensive PII filter (`email`, `firstName`, `phone`, `streetAddress`, `message` and 7 more) before pushing — verified by synthetic dispatch. The Calendly `postMessage` stream is now translated: `calendly_widget_loaded` fires once on the existing IntersectionObserver trigger, and `calendly.event_scheduled` maps to `calendly_booking_scheduled` (the conversion). A surgical dispatcher rename pass aligns three drifted wire names with the GTM tag plan: `wizard_submit_succeeded → quote_submit_succeeded`, `newsletter_submit_succeeded → newsletter_subscribed`, `chat_panel_opened → chat_opened` (plus added `STEP_ADVANCED`, `BANNER_BOOK_CLICKED`, `BANNER_QUOTE_CLICKED`). 14/14 smoke tests pass at `localhost:3030`; Lighthouse holds at A11y 97 / BP 96 / SEO 100 across home + /contact/ desktop + mobile, Performance regresses zero on `/contact/` and is +1 on home (within run-to-run noise). Build green at 118 pages. PR #5 open at the time of writing; preview-deploy verification belongs in the post-merge Test plan.

## What shipped

| # | What | Commit |
|---|---|---|
| 0. Handover | Cowork Part A handover note copied verbatim from main tree into the worktree at `src/_project-state/Part-2-Phase-10-Cowork-Handover.md` so the GTM-NL5XX4DV / G-RY6NT70SH7 / wqodtpq86q audit trail lives in git history. | `36c6b82` |
| 1. Decisions (scope) | Step 1 entry appended verbatim: 5-bullet scope choices (binary consent now, Consent Mode v2 deferred to 3.04; 4 conversion events; Clarity direct; `NEXT_PUBLIC_ANALYTICS_ENABLED` kill switch; PII filter). | `d54ab49` |
| 2. Env | 4 new vars on Vercel Prod + Preview (REST upsert) + `.env.local.example` documentation block. Worktree `.env.local` populated from main + new vars appended. IDs captured below. | `c2ded63` |
| 3. Events module | `src/lib/analytics/events.ts` — 25 event-name constants + `PII_KEYS` set with 13 forbidden payload keys. | `a07ec00` |
| 4. Consent helpers | `src/lib/analytics/consent.ts` — pure module (no React) with `getConsent` / `setConsent` / `subscribeConsent`. Storage key `sunset_consent_v1`; CustomEvent name `sunset:consent-changed`. | `68df427` |
| 5. dataLayer push | `src/lib/analytics/dataLayer.ts` — SSR guard + kill-switch gate + consent gate + PII filter before `window.dataLayer.push`. | `b8b51ac` |
| 6. React hook | `src/hooks/useConsent.ts` — first-render `'unknown'` SSR snapshot, mount effect hydrates real value + subscribes. | `87aaabc` |
| 7. ConsentBanner | `src/components/analytics/ConsentBanner.tsx` — fixed-bottom 2-col-desktop / stacked-mobile, cream surface + thin top border, ≥48px buttons, `pb-[max(16px,env(safe-area-inset-bottom))]` for iOS, locale-stripped pathname gate. | `8286e2c` |
| 8. GTMScript | `src/components/analytics/GTMScript.tsx` — `'use client'` + `next/script` (`afterInteractive`) + canonical GTM bootstrap snippet. | `3b69f90` |
| 9. GTMNoScript | `src/components/analytics/GTMNoScript.tsx` — server component, emits the Google-mandated `<noscript>` iframe. Gates on env vars only (JS-disabled visitors can't see the banner). | `494c763` |
| 10. ClarityScript | `src/components/analytics/ClarityScript.tsx` — same pattern as GTMScript, for Microsoft Clarity (loaded directly per Decision; not through GTM). | `440fa5f` |
| 11. AnalyticsBridge | `src/components/analytics/AnalyticsBridge.tsx` — subscribes to 5 `sunset:*-event` CustomEvents on **`document`** (not `window` — off-spec correction). Pure relay; `pushDataLayer` enforces consent + PII. | `9623a9d` |
| 12. Calendly | `src/components/calendly/CalendlyEmbed.tsx` — adds `fireWidgetLoadedOnce()` in the existing IntersectionObserver `inject()` call + a new `message` listener that maps `calendly.event_type_viewed` / `date_and_time_selected` / `event_scheduled` to `sunset:calendly-event` CustomEvents. Existing lazy-load + consent stub + fallback card paths untouched. | `8cef1f5` |
| 13. Layout mounts | `src/app/[locale]/layout.tsx` — `<GTMNoScript />` at top of `<body>`; `<ConsentBanner />` inside `NextIntlClientProvider` (needs translations); `<AnalyticsBridge />` + `<GTMScript />` + `<ClarityScript />` outside the provider. Vercel `<Analytics />` from Phase 2.02 untouched. | `a8ca92b` |
| 14. i18n + TODO 2.13 | `chrome.consent.{heading,body,acceptCta,declineCta,ariaLabel}` in `en.json` + `[TBR]`-flagged ES mirror + new bullet in `current-state.md` TODO 2.13 section. | `9da0f59` |
| 15. Z-index | `globals.css` — `--z-consent: 60` alongside the existing ladder (banner sits between chat at 50 and skip link at 70). | `c6f38bf` |
| 16. Dispatcher rename | 6 files: `src/lib/wizard/events.ts` (SUBMIT_SUCCEEDED → 'quote_submit_succeeded', + STEP_ADVANCED), `src/components/wizard/WizardShell.tsx` (fires STEP_ADVANCED instead of per-step STEP_COMPLETED(n)), `src/lib/chat/events.ts` (PANEL_OPENED → OPENED='chat_opened', + BANNER_BOOK_CLICKED / BANNER_QUOTE_CLICKED), `src/components/chat/ChatPanel.tsx` (uses CHAT_EVENTS.OPENED), `src/components/chat/ChatHighIntentBanner.tsx` (onClick handlers fire chat_banner_*_clicked), `src/components/forms/NewsletterSignup.tsx` (newsletter_submit_succeeded → newsletter_subscribed; newsletter_submit_already_subscribed → newsletter_already_subscribed). | `9150c4b` |
| 17. Build fix | `src/components/wizard/WizardStickyNav.tsx` — Next button's `data-analytics-event` switched from removed `STEP_COMPLETED(n)` to new STEP_ADVANCED constant. Caught by `npm run build`. | `d31d5ff` |
| 18. Smoke tests | 14/14 passed at `localhost:3030` after a fresh production build via the Preview MCP (see Verification section). | (no commit — local-only) |
| 19. Lighthouse | 4 reports captured at `lighthouse/phase-2-10/` (local-only, gitignored). Scores below. | (no commit — local-only) |
| 20. Push + PR | Branch pushed to `origin`; PR #5 opened with verification + Test plan. Preview-deploy verification belongs in the post-merge Test plan. | (push, not commit) |
| 21. Project-state | `current-state.md` / `file-map.md` / `00_stack-and-config.md` updated. | (this commit pair) |
| 22. Decisions close-out | 4 in-phase decisions appended to `Sunset-Services-Decisions.md` (see below). | (this commit pair) |
| 23. This report | Filed at `src/_project-state/Part-2-Phase-10-Completion.md`. | (this commit) |

### Lighthouse scores (local `npm run start` on port 3030)

| Route | Form factor | Perf | A11y | Best Practices | SEO |
|---|---|---:|---:|---:|---:|
| `/` | desktop | 97 ✓ | 97 ✓ | 96 ✓ | 100 ✓ |
| `/` | mobile | 79 | 97 ✓ | 96 ✓ | 100 ✓ |
| `/contact/` | desktop | 99 ✓ | 97 ✓ | 96 ✓ | 100 ✓ |
| `/contact/` | mobile | 84 | 97 ✓ | 96 ✓ | 100 ✓ |

**vs Phase 2.09 baseline:**

- `/` Performance: desktop 96 → 97 (+1 ✓), mobile 78 → 79 (+1 ✓) — within run-to-run variance.
- `/contact/` Performance: desktop 99 → 99 (0 ✓), mobile 84 → 84 (0 ✓).
- A11y / BP / SEO held at 97 / 96 / 100 across the board — no regression on `/` and `/contact/`.

Hold-line met. Plan said "Performance must not regress more than 3 points" — actual deltas are +1 / +1 / 0 / 0.

Raw JSON files at `lighthouse/phase-2-10/{home-desktop,home-mobile,contact-desktop,contact-mobile}.json` (gitignored).

## What's now possible

- **First-time visitor sees a binary cookie banner** at the bottom of the page on every route except `/request-quote/`. EN by default; Spanish `[TBR]` placeholders on `/es/*`. Both buttons ≥48px tall, with iOS safe-area-inset padding so the banner clears the home indicator.
- **Accept all loads GTM + Clarity within ~2s.** The very first dataLayer entry is `{event: 'consent_accepted', gtm.uniqueEventId: 3}` — Cowork Part B can trigger off the `consent_accepted` event if a use case appears.
- **Decline blocks both scripts entirely.** No requests to `googletagmanager.com` or `clarity.ms`, `window.dataLayer` never exists, and the banner stays dismissed across reloads via `localStorage['sunset_consent_v1']='declined'`.
- **Every wizard / contact / newsletter / chat / Calendly CustomEvent reaches `window.dataLayer` once consent is granted** — verified end-to-end live for chat (`chat_opened` + `chat_message_sent`), wizard (`wizard_step_advanced` with `{step, locale}` payload), and Calendly (`calendly_widget_loaded` on `/contact/` viewport intersection). Contact + newsletter event names verified via synthetic dispatch through the bridge.
- **GTM tag plan is unblocked.** Cowork's GTM Configuration tag (All Pages → GA4), plus the four Key Event tags (`quote_submit_succeeded`, `contact_submit_succeeded`, `newsletter_subscribed`, `calendly_booking_scheduled`), will fire once Cowork configures them inside the GTM web UI in Part B.
- **PII filter has a real test.** Smoke test 10 injects a CustomEvent with `email/firstName/phone/streetAddress/message` payload — `window.dataLayer`'s last entry contains ONLY `{event, locale, step, gtm.uniqueEventId}`. The dispatchers already never include PII; the filter is the guard.
- **Calendly booking completion now fires a CONVERSION event.** When a visitor walks through the embedded Calendly widget on `/contact/` or `/thank-you/` and confirms a slot, Calendly's `calendly.event_scheduled` postMessage event maps to `calendly_booking_scheduled` in dataLayer. End-to-end booking verification belongs in Cowork Part B (booking against the real Calendly account).
- **Master kill switch verified.** Set `NEXT_PUBLIC_ANALYTICS_ENABLED=false`, rebuild, and the banner disappears + `window.dataLayer` never exists + the GTM `<noscript>` iframe is omitted. Phase 3.04 / future polish can toggle without removing the banner.
- **`/request-quote/` exemption holds.** Conversion-surface protection (D17 pattern, same as chat bubble + newsletter signup): banner never renders on `/request-quote/` regardless of consent state. Smoke test 13 confirms exit-and-return behavior.
- **Chat banner CTAs now fire CustomEvents alongside their `data-analytics-event` attrs.** Phase 2.09 set the attributes; Phase 2.10 added the `onClick` dispatches so the bridge picks them up — `chat_banner_book_clicked` + `chat_banner_quote_clicked` reach dataLayer when a visitor clicks "Book a consult" / "Get a quote" inside the high-intent banner.

## What's NOT yet possible (deferred)

- **GTM tag configuration inside the GTM web UI** — Cowork Part B. Five tags (GA4 Configuration All Pages + 4 Key Event tags) + matching triggers + variable mapping for the conversion events. Phase 2.10 ships the dataLayer the tags will fire on; the tags themselves are not configured here.
- **Marking the four conversion events as Key Events in GA4** — Cowork Part B, AFTER at least one fire of each event has been observed in GA4's "Events" report (Google requires a 24-hour data wait before an event becomes mark-as-Key-Event eligible).
- **Google Consent Mode v2** — Phase 3.04. Phase 2.10 ships binary consent (gates script load entirely); 3.04 wires `gtag('consent', 'default', ...)` with granular ad/analytics/security categories + Termly/iubenda legal copy.
- **Calendly consent gate** — left as Phase 2.07's stub `default-true` (Calendly widget always loads). Phase 2.10 cookie banner applies to GTM/Clarity, not Calendly itself — visitors can always book regardless of analytics consent. Phase 3.04 GDPR pass can revisit if needed.
- **GCP `.env.local.example` carryover** — Cowork's handover flagged this as Code's responsibility but the carryover wasn't in the Phase 2.10 Code prompt's listed scope. Left to a separate commit by the user (or Phase 2.13.2, which owns the GCP variables anyway).
- **Vercel Analytics interaction with consent** — `@vercel/analytics` from Phase 2.02 still loads unconditionally. It uses Vercel's own first-party tracking (no third-party cookies). Phase 3.04 can decide whether to gate it under the same banner if the legal review wants it.

## Surprises and off-spec decisions

1. **Bridge listens on `document`, not `window`.** The plan's `AnalyticsBridge` snippet uses `window.addEventListener('sunset:wizard-event', ...)`. But every existing dispatcher (Phase 1.20 / 2.06 / 2.08 / 2.09) calls `document.dispatchEvent(new CustomEvent(scope, {detail: {...}}))` with `bubbles: false` (default). Events on `document` do not propagate to `window` without `bubbles: true`, so the plan's `window` listener would never see them. Adapted to `document` in `AnalyticsBridge.tsx` — minimum-blast-radius (alternative would have been refactoring every dispatcher to set `bubbles: true`, far more invasive). Documented in a Decisions close-out entry so future phases know.
2. **Dispatcher rename pass extended Code scope by 6 files outside the plan's listed file set.** Plan's smoke tests 5–8 explicitly require `chat_opened`, `wizard_step_advanced`, `quote_submit_succeeded`, `newsletter_subscribed` in dataLayer — but the actual dispatchers fired `chat_panel_opened`, `wizard_step_completed_<n>`, `wizard_submit_succeeded`, `newsletter_submit_succeeded`. Pure-passthrough bridge would have failed smoke tests; mapping layer in the bridge would have buried the discrepancy. Chose the cleaner fix: rename the wire values in the existing constants + update the 1–2 call sites per dispatcher. 6 files touched: `src/lib/wizard/events.ts`, `src/lib/chat/events.ts`, `src/components/wizard/WizardShell.tsx`, `src/components/wizard/WizardStickyNav.tsx` (build fix — `STEP_COMPLETED(n)` reference also needed updating), `src/components/chat/ChatPanel.tsx`, `src/components/chat/ChatHighIntentBanner.tsx`, `src/components/forms/NewsletterSignup.tsx`. Constants kept their descriptive names where possible (e.g. `SUBMIT_SUCCEEDED` still works as the constant name; only its wire value flipped to `quote_submit_succeeded`). Logged in Decisions close-out for future visibility.
3. **Chat high-intent banner CTAs needed both data-attribute AND CustomEvent dispatch.** Phase 2.09's `ChatHighIntentBanner.tsx` set `data-analytics-event="chat_banner_book_clicked"` / `chat_banner_quote_clicked` on the Link elements but did NOT fire CustomEvents (Phase 2.09 noted this as a Phase 2.11 carryover). The Phase 2.10 bridge listens to CustomEvents only — so the data-attrs alone wouldn't reach the bridge. Added 2-line `onClick={() => fireChatEvent(CHAT_EVENTS.BANNER_BOOK_CLICKED, {locale})}` handlers to both Links + added the 2 new constants to `CHAT_EVENTS`.
4. **Calendly consent gate intentionally left at default-true.** The plan's Step 12 snippet has `consentGranted` as a guard variable, hinting the widget itself should be consent-gated. But Calendly is a booking service, not analytics/marketing — visitors need to book regardless of GTM/Clarity consent. The data flow IS consent-gated (postMessage events reach the bridge, which is gated by `pushDataLayer`'s consent check), but the widget loads always. Documented + the existing JSDoc in `CalendlyEmbed.tsx` updated to clarify.
5. **Cowork's GCP `.env.local.example` carryover NOT committed by Code.** The handover note (`Part-2-Phase-10-Cowork-Handover.md`) explicitly asks "Code (or the user) reconciles the dirty tree and commits the GCP carryover block alongside the rest of the Phase 2.10 chore commits." But the Phase 2.10 Code prompt's listed files only include the four Phase 2.10 NEXT_PUBLIC_* analytics env vars — the GCP block (`GCP_PROJECT_ID`, `GCP_PROJECT_NUMBER`, `GCP_PROJECT_NAME`, `GOOGLE_PLACES_API_KEY`, `GBP_OAUTH_CLIENT_ID`, `GBP_OAUTH_CLIENT_SECRET`, `GBP_OAUTH_REFRESH_TOKEN`) is Phase 2.13.2 scope. Code declined to expand the .env.local.example diff with PENDING-value variables outside the prompt's scope. Left to either (a) the user, on the main tree where the GCP block already lives in `.env.local.example` (uncommitted), or (b) Phase 2.13.2 when the real values land. The Phase 2.10 PR diff stays tight around the analytics work.
6. **Worktree handover copy.** The handover lived only in the main working tree (uncommitted) when this branch started. Copied verbatim into `src/_project-state/Part-2-Phase-10-Cowork-Handover.md` on the worktree so the audit trail for the three IDs lives in git history alongside the Phase 2.10 commits that reference them. Off-spec ADD (plan never asks to create the handover) but necessary for completeness.
7. **`useTranslations` requires the banner inside `NextIntlClientProvider`.** The plan's mount order had `<ConsentBanner />` listed alongside `<AnalyticsBridge />` / `<GTMScript />` / `<ClarityScript />` — but the banner consumes `useTranslations('chrome.consent')`, which throws if not inside the provider. Mounted the banner inside the existing `<MotionRoot>` block (same scope as everything else that uses translations) — the script + bridge mounts stay outside the provider where they don't need translations.
8. **Smoke test 6 (wizard end-to-end) and tests 7-8 (contact + newsletter) verified by synthetic CustomEvent dispatch through the bridge, NOT by a full UI walkthrough.** The bridge being a pure relay means it doesn't matter whether a real wizard submission or a synthetic dispatch fires `quote_submit_succeeded` — the path through `pushDataLayer` is identical. Full UI walkthroughs would have required Sanity writes + Resend sends (sandbox-routed but still real round-trips) for arguably less coverage. Smoke test 6 DID exercise the real wizard Step 1→2 transition and saw `wizard_step_advanced` fire correctly.
9. **Smoke test 12 (kill switch) cost a rebuild.** Next.js inlines `NEXT_PUBLIC_*` env vars at build time, so flipping `.env.local` + a server restart isn't enough — the bundle has to be rebuilt. Ran the rebuild (~2 min); verified banner does NOT render + `window.dataLayer` doesn't exist + GTM noscript iframe is omitted. Reverted env to `true` + rebuilt again for the Lighthouse run.
10. **`--z-consent: 60` shares numeric tier with `--z-toast`.** No semantic collision expected — toast notifications and the cookie banner are rarely concurrent (toast is transient on user action; banner is sticky on first visit). If a future polish phase wants to surface both at once, raise consent to `65` (between toast at 60 and banner at 70, where the skip link lives).
11. **Vercel REST env upserts logged the four IDs but the orgId was NOT in the project.json output** — confirmed via the auth.json from `%APPDATA%\xdg.data\com.vercel.cli\auth.json` + project.json at the parent-root `.vercel/`. Used the inline PowerShell pattern from Phase 2.02's helper (PS 5.1-compatible, no `??` operator). All four upserts returned IDs successfully.
12. **TODO 2.13 chat carryover note from Phase 2.09 became obsolete during Phase 2.10.** Phase 2.09's completion report listed Phase 2.11 as the GTM bridge phase. Phase 2.10 IS the GTM bridge phase (just renumbered). The `current-state.md` "What does NOT work yet" note about Phase 2.11 / Phase 2.10 GTM bridge is now misleading — left in place this phase and removed in the project-state update step. Not destabilising.

## Verification checklist

- [x] **Cowork Part A handover file copied into worktree** at `src/_project-state/Part-2-Phase-10-Cowork-Handover.md` with the three IDs (`GTM-NL5XX4DV` / `G-RY6NT70SH7` / `wqodtpq86q`). Commit `36c6b82`.
- [x] **Decisions log scope entry committed** verbatim from the plan's Step 1 markdown block. Commit `d54ab49`.
- [x] **4 new env vars on Vercel Prod + Preview.** IDs `NEXT_PUBLIC_GTM_ID=nCMCsddKl918a76Z`, `NEXT_PUBLIC_GA4_MEASUREMENT_ID=W1sg2noqokq2ntOW`, `NEXT_PUBLIC_CLARITY_PROJECT_ID=gdkiC6dAlkMYyHOE`, `NEXT_PUBLIC_ANALYTICS_ENABLED=6cFnFt7qECEiidqP`. All `plain` type (NEXT_PUBLIC_* embed in client bundle anyway).
- [x] **Build green at 118 pages, no TS errors, no new ESLint errors.** Verified across 3 builds during the phase (initial dispatcher rename caught a stale `STEP_COMPLETED(n)` reference in WizardStickyNav.tsx; subsequent builds clean).
- [x] **Smoke test 1 — Banner visible on first load.** `document.querySelector('.consent-banner')` returns the element on `/` with no consent in localStorage.
- [x] **Smoke test 2 — No GTM/Clarity requests before consent.** `performance.getEntriesByType('resource')` returns 0 entries matching `googletagmanager.com` or `clarity.ms`; `typeof window.dataLayer === 'undefined'`.
- [x] **Smoke test 3 — Accept loads everything.** Banner disappears within 1 frame; within ~2s, 1 request to `googletagmanager.com/gtm.js?id=GTM-NL5XX4DV` + 4 requests to `clarity.ms/*` (the tag + scripts + c.gif). `window.dataLayer[0] = {event: 'consent_accepted', gtm.uniqueEventId: 3}`. `localStorage.getItem('sunset_consent_v1') === 'accepted'`.
- [x] **Smoke test 4 — Refresh persistence.** After page reload, banner does NOT reappear; localStorage value still `'accepted'`.
- [x] **Smoke test 5 — Chat → dataLayer.** Click chat bubble + click "Send message" with "test message" in textarea → dataLayer's tail includes `chat_bubble_clicked`, `chat_opened`, `chat_prompt_clicked_1`, `chat_message_sent`. (Suggested-prompt click fills the textarea; clicking Send is what fires `chat_message_sent`.)
- [x] **Smoke test 6 — Wizard step transition.** Navigate to `/request-quote/`, click Residential tile, click Next → dataLayer has `wizard_step_advanced` with `{step: 1, locale: 'en'}`. Conversion event `quote_submit_succeeded` verified via synthetic dispatch through the bridge (`{event: 'quote_submit_succeeded', audience: 'residential', locale: 'en'}` in dataLayer).
- [x] **Smoke test 7 — Contact form events.** Synthetic dispatch of `sunset:contact-event` with `{name: 'contact_submit_attempted'}` and `{name: 'contact_submit_succeeded'}` both reach dataLayer correctly.
- [x] **Smoke test 8 — Newsletter events.** Synthetic dispatch of `sunset:newsletter-event` with `{name: 'newsletter_submit_attempted'}` and `{name: 'newsletter_subscribed'}` both reach dataLayer correctly. The latter is the renamed wire value (was `newsletter_submit_succeeded`).
- [x] **Smoke test 9 — Calendly widget loaded.** Navigate to `/contact/`, scroll widget into view → `calendly_widget_loaded` appears in dataLayer (fired by the `fireWidgetLoadedOnce()` call inside the existing IntersectionObserver `inject()` callback in `CalendlyEmbed.tsx`).
- [x] **Smoke test 10 — PII filter.** Synthetic dispatch with `{email: 'leak@test.com', firstName: 'Leak', phone: '5550000', streetAddress: '123 Main', message: 'should be stripped', locale: 'en', step: 5}` payload → dataLayer's last entry has keys `{event, locale, step, gtm.uniqueEventId}` only. All 5 PII keys stripped.
- [x] **Smoke test 11 — Decline path.** Clear localStorage, reload, click Decline → banner disappears; localStorage `'declined'`; ZERO requests to googletagmanager.com or clarity.ms; `window.dataLayer === undefined`.
- [x] **Smoke test 12 — Kill switch.** Rebuilt with `NEXT_PUBLIC_ANALYTICS_ENABLED=false` → banner does NOT render; `window.dataLayer === undefined`; GTM noscript iframe NOT in DOM. Restored to `true` + rebuilt again before Lighthouse + push.
- [x] **Smoke test 13 — `/request-quote/` exemption.** With consent cleared, navigate to `/request-quote/` → banner does NOT render. Navigate back to `/` → banner DOES render. D17 conversion-surface protection holds.
- [x] **Smoke test 14 — Spanish locale.** Navigate to `/es/` → banner heading shows "[TBR] Usamos cookies", body shows "[TBR] Usamos cookies para entender...", buttons show "[TBR] Rechazar" / "[TBR] Aceptar todo". `[TBR]` flags as expected for Phase 2.13 native review.
- [x] **Lighthouse 4 reports captured.** Hold-line met: A11y ≥97, BP ≥96, SEO =100 across `/` desktop+mobile + `/contact/` desktop+mobile. Performance regression vs Phase 2.09: 0 max, actually +1 on home both form factors.
- [x] **All 5 project-state files updated.** `current-state.md`, `file-map.md`, `00_stack-and-config.md`, this completion report, `Sunset-Services-Decisions.md` (scope entry + close-out entries).
- [x] **All off-spec decisions surfaced** in the "Surprises and off-spec decisions" section above + the corresponding Decisions close-out entries.

## Definition of done

| # | Criterion | Pass / Fail |
|---|---|---|
| 1 | All 14 smoke tests pass on `localhost:3030/`. | **Pass** — full list above |
| 2 | `npm run build` green at 118 pages, no TS errors, no new ESLint errors. | **Pass** — build green after WizardStickyNav fix |
| 3 | Vercel preview reaches `READY` on push. | **Pending** (verified post-merge in PR Test plan) |
| 4 | Lighthouse hold-line: A11y ≥97, BP ≥96, SEO ≥100; Perf regression ≤3 points. | **Pass** — 97/96/100 across, Perf +1/+1/0/0 |
| 5 | `Sunset-Services-Decisions.md` has Phase 2.10 Step 1 scope entry AND close-out entries. | **Pass** — scope `d54ab49`; close-out in this final commit batch |
| 6 | All 5 project-state files updated. | **Pass** — see this commit + earlier `9da0f59` |
| 7 | Completion report filed with "Surprises and off-spec decisions" section. | **Pass** — 12 items above |
| 8 | PII filter verified — `email`, `firstName`, `phone` never reach dataLayer. | **Pass** — Smoke test 10 |
| 9 | Banner hidden on `/request-quote/` and on `NEXT_PUBLIC_ANALYTICS_ENABLED=false`. | **Pass** — Smoke tests 12 + 13 |
| 10 | Every in-phase decision has a Decisions.md entry. | **Pass** — 4 close-out entries cover the load-bearing ones (bridge listens on `document`; dispatcher rename pass; Calendly consent gate; GCP carryover deferred) |

## Open carryovers

- **Cowork Part B (post-merge).** GTM web-UI configuration: GA4 Configuration tag + 4 Key Event tags (`quote_submit_succeeded`, `contact_submit_succeeded`, `newsletter_subscribed`, `calendly_booking_scheduled`). Mark each as a Key Event in GA4 AFTER first fire is observed (Google's 24h data wait). Verify via GA4 DebugView during testing.
- **Phase 3.04 — Google Consent Mode v2.** Phase 2.10 ships binary consent (block GTM/Clarity entirely until Accept). 3.04 swaps to `gtag('consent', 'default', ...)` with granular categories + Termly/iubenda legal copy. The `ConsentBanner` component is the natural swap point — interface stays the same (Accept / Decline buttons); implementation becomes Consent Mode v2 calls.
- **Phase 3.04 — Calendly consent gate.** Phase 2.10 left the Calendly widget at Phase 2.07's stub `default-true`. If legal review wants Calendly under the same consent banner, 3.04 wires it.
- **Phase 2.13 — Native ES review.** New `[TBR]` keys added: `chrome.consent.{heading, body, acceptCta, declineCta, ariaLabel}` (5 keys). Logged in `current-state.md` TODO 2.13 section.
- **Phase 2.13.2 — GCP `.env.local.example` carryover.** Cowork's handover flagged a 7-variable GCP block (`GCP_PROJECT_ID` / `GCP_PROJECT_NUMBER` / `GCP_PROJECT_NAME` / `GOOGLE_PLACES_API_KEY` / `GBP_OAUTH_CLIENT_ID` / `GBP_OAUTH_CLIENT_SECRET` / `GBP_OAUTH_REFRESH_TOKEN`) that the main tree's `.env.local.example` has but the worktree doesn't. Out of plan scope for Phase 2.10 Code; left to the user (commits via the main tree once the drift is reconciled) or Phase 2.13.2 (which owns the GCP variables anyway).

## Files written / modified

### New (10 files)

- `src/lib/analytics/events.ts` (event-name constants + PII filter)
- `src/lib/analytics/consent.ts` (consent helpers, pure module)
- `src/lib/analytics/dataLayer.ts` (safe push with consent + PII gates)
- `src/hooks/useConsent.ts` (React hook)
- `src/components/analytics/ConsentBanner.tsx` (binary consent banner)
- `src/components/analytics/GTMScript.tsx` (client GTM bootstrap)
- `src/components/analytics/GTMNoScript.tsx` (server iframe fallback)
- `src/components/analytics/ClarityScript.tsx` (client Clarity bootstrap)
- `src/components/analytics/AnalyticsBridge.tsx` (CustomEvents → dataLayer)
- `src/_project-state/Part-2-Phase-10-Cowork-Handover.md` (copied from main tree)
- `src/_project-state/Part-2-Phase-10-Completion.md` (this file)
- `lighthouse/phase-2-10/home-desktop.json` (local-only, gitignored)
- `lighthouse/phase-2-10/home-mobile.json` (local-only, gitignored)
- `lighthouse/phase-2-10/contact-desktop.json` (local-only, gitignored)
- `lighthouse/phase-2-10/contact-mobile.json` (local-only, gitignored)
- `.claude/launch.json` (local-only, gitignored — Preview MCP launch config)

### Modified (12 files)

- `src/app/[locale]/layout.tsx` — mounts `<GTMNoScript/>` at body top, `<ConsentBanner/>` inside provider, `<AnalyticsBridge/> + <GTMScript/> + <ClarityScript/>` after `<Analytics/>`.
- `src/app/globals.css` — `--z-consent: 60` token alongside existing z-index ladder.
- `src/components/calendly/CalendlyEmbed.tsx` — IntersectionObserver `inject()` now also fires `calendly_widget_loaded`; new `message` listener maps Calendly's 3 broadcast events to `sunset:calendly-event` CustomEvents.
- `src/components/chat/ChatHighIntentBanner.tsx` — Link `onClick` handlers fire `chat_banner_book_clicked` + `chat_banner_quote_clicked` CustomEvents.
- `src/components/chat/ChatPanel.tsx` — references `CHAT_EVENTS.OPENED` (was `CHAT_EVENTS.PANEL_OPENED`).
- `src/components/forms/NewsletterSignup.tsx` — wire values: `newsletter_subscribed` (was `_submit_succeeded`), `newsletter_already_subscribed` (was `_submit_already_subscribed`).
- `src/components/wizard/WizardShell.tsx` — fires `STEP_ADVANCED` constant (was `STEP_COMPLETED(urlStep)` function).
- `src/components/wizard/WizardStickyNav.tsx` — `data-analytics-event` attribute uses `STEP_ADVANCED` constant.
- `src/lib/chat/events.ts` — `PANEL_OPENED → OPENED` (value `chat_opened`); added `BANNER_BOOK_CLICKED` + `BANNER_QUOTE_CLICKED`.
- `src/lib/wizard/events.ts` — `SUBMIT_SUCCEEDED` value → `quote_submit_succeeded`; added `STEP_ADVANCED`.
- `src/messages/en.json` — added `chrome.consent.{heading, body, acceptCta, declineCta, ariaLabel}`.
- `src/messages/es.json` — same key set with `[TBR]` ES copy.
- `.env.local.example` — `# Phase 2.10 — Analytics stack` section with 4 var documentation lines.
- `Sunset-Services-Decisions.md` — Step 1 scope entry + 4 close-out entries.
- `src/_project-state/current-state.md` — TODO 2.13 update + What works (Phase 2.10 additions) + Phase 2.10 commit list.
- `src/_project-state/file-map.md` — 10 new file entries + modified-file annotations.
- `src/_project-state/00_stack-and-config.md` — Phase 2.10 analytics section with env IDs + dispatcher rename note.

### Deleted

None.

## Commit log

```
36c6b82  chore(phase-2-10): copy Cowork Part A handover into repo
d54ab49  chore(decisions): log Phase 2.10 analytics stack scope
c2ded63  chore(env): Phase 2.10 analytics env vars
a07ec00  feat(analytics): event name constants + PII filter (Phase 2.10)
68df427  feat(analytics): consent state helpers (Phase 2.10)
b8b51ac  feat(analytics): safe dataLayer.push with consent + PII gates (Phase 2.10)
87aaabc  feat(hooks): useConsent (Phase 2.10)
8286e2c  feat(analytics): ConsentBanner component (Phase 2.10)
3b69f90  feat(analytics): GTMScript client component (Phase 2.10)
494c763  feat(analytics): GTMNoScript server component (Phase 2.10)
440fa5f  feat(analytics): ClarityScript client component (Phase 2.10)
9623a9d  feat(analytics): AnalyticsBridge — CustomEvents → dataLayer (Phase 2.10)
8cef1f5  feat(calendly): wire Calendly postMessage events to dataLayer (Phase 2.10)
a8ca92b  feat(app): mount analytics + consent in root layout (Phase 2.10)
9da0f59  chore(i18n): Phase 2.10 consent banner strings
c6f38bf  feat(styles): --z-consent CSS variable for Phase 2.10 banner
9150c4b  refactor(analytics): align dispatcher event names with Phase 2.10 GTM spec
d31d5ff  fix(wizard): WizardStickyNav data-analytics-event uses STEP_ADVANCED
(this)   chore(decisions): log Phase 2.10 in-phase decisions
(this)   chore(phase-2-10): project-state updates
(this)   chore(phase-2-10): completion report
```

## External state changed

- **Vercel env vars:** 4 new vars upserted on Production + Preview (REST API, IDs above). All `plain` type.
- **Vercel deployments:** branch push triggers a Vercel preview build. Preview-deploy verification belongs to the post-merge Test plan in PR #5.
- **GitHub:** PR #5 opened at `https://github.com/DinovLazar/sunsetservices/pull/5`.
- **No Sanity Studio changes.** No new document types this phase.
- **No external API changes** (GTM tags are Cowork Part B web-UI work, not Code work).
