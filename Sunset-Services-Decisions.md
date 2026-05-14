# Sunset Services — Decisions log

Append-only log of project-level decisions made during the build of the Sunset Services website (v2). New entries go at the **bottom**; older entries are not edited or removed.

When to add an entry:

- A project capability is deferred to a later phase (or post-launch).
- A tool/integration is replaced or skipped versus the v2 plan.
- A non-obvious business decision is made that future contributors should know about.

---

## 2026-05-10 — ServiceM8 adoption deferred (Phase 2.01)

Sunset Services does not currently use ServiceM8 or any job-management software. Cowork did NOT create a ServiceM8 account in Phase 2.01.

**Treatment going forward:**

- Phase 2.13 (ServiceM8 webhook) ships the webhook endpoint behind `SERVICEM8_ENABLED=false`.
- Phase 2.17 (automation agent Part B) ships the on-demand portfolio-publish flow gated on the same flag.
- This is the same feature-flag pattern Mautic uses.
- If Erick adopts ServiceM8 post-launch, flip `SERVICEM8_ENABLED=true` and provide the API key — no code rework needed.

**Decided by:** user (Goran), in response to Phase 2.01 clarifying question.

---

## 2026-05-10 — Anthropic API account uses pre-existing email (Phase 2.01)

The Anthropic API account was NOT created at `dinovlazar2011@gmail.com` per spec. Instead, the user reused a pre-existing Anthropic account on a different (less-used) email to avoid losing existing billing setup and credits.

**Mitigation declined:** Neither email-change nor forwarding-to-`dinovlazar2011@gmail.com` was set up. User will rely on manually checking the Anthropic inbox.

**Risk acknowledged:** Anthropic billing-threshold notifications ($20 cap alerts) and security alerts (unusual usage, new API keys, etc.) go to an inbox that is not actively monitored. If the chat widget or automation agent ever stops working unexpectedly, the first diagnostic step is to check that inbox for Anthropic emails.

**Mitigation if this becomes a real problem post-launch:** Anthropic Console → Settings → Account → change the account email to `info@sunsetservices.us` (or `dinovlazar2011@gmail.com` for Part 2 dev). Takes 5 minutes; preserves the account, billing, and credits.

**Decided by:** user (Goran), in response to Phase 2.01 Step 5 clarifying question.

---

## 2026-05-10 — Step 7 (GCP + Places API + GBP API application) moved to new Phase 2.13.2

The entire Phase 2.01 Step 7 (Google Cloud Platform project, Places API, GBP API access application) was deferred out of Phase 2.01 and into a new Phase 2.13.2 that will run just before Phase 2.14 in Part 2.

**What Step 7 originally covered:**

- 7A. Create GCP project, enable billing, enable Places API, create restricted API key, smoke-test against Sunset Services' real Aurora, IL listing, capture `place_id`.
- 7B. Confirm Erick has manager/owner access to the Sunset Services Google Business Profile. If not, fork to a postcard-verification claim-and-verify path (~5 business days).
- 7C. Submit the GBP API access application at `https://developers.google.com/my-business/content/basic-setup`. Starts a 2–6 week Google review clock.

**Downstream impact:**

- **Phase 2.14** (write to Google Business Profile — posts, photos, replies) waits on Phase 2.13.2's GBP API approval. Phase 2.14 effectively runs 2–6 weeks after Phase 2.13.2 begins.
- **Phase 2.16** (daily reviews fetched via Places API and shown on the site) waits on Phase 2.13.2's Places API key.
- **Phase 2.17** (automation agent Part B — on-demand portfolio publishing) loses the Google publish leg until 2.13.2 + 2.14 complete. The Telegram approval leg is unaffected.

**Why deferred:**

User decision after weighing implications. Trade-off: clean Phase 2.01 finish vs. ~4–6 calendar weeks of cumulative slippage on downstream Part 2 phases that depend on Google Cloud.

**Action required before Phase 2.13.2:**

- Confirm Erick's GBP listing is verified to him (test: `business.google.com` shows Sunset Services in his profile list). If not, start postcard verification immediately — that's a ~5-business-day pre-step that doesn't have to wait on 2.13.2 itself.

**Decided by:** user (Goran), in response to Phase 2.01 Step 7 clarifying question.

---

## 2026-05-12 — Phase 2.05 scope: full one phase, projects stay at 12

Phase 2.05 will migrate every dynamic content type (projects, blog posts, resource articles, FAQs, reviews) to Sanity and wire all consuming pages to read from Sanity in a single phase — not split into 2.05a + 2.05b.

**Project count stays at 12** (the Phase 1.16 placeholders). The Phase Plan's "expand toward 30+" branch is deferred to whenever Phase 2.04 (photo curation) closes — adding text-only project records without photos creates rework once real photos land.

**Inline `faq[]` arrays in `src/data/services.ts` and `src/data/locations.ts` will be removed** as part of this phase, post-migration. FAQs in Sanity become the single source of truth.

**Decided by:** user (Goran), in response to Phase 2.05 scope clarifying question in Chat.

---

## 2026-05-12 — GCP access: credentials-handoff approach (Phase 2.01)

- **GCP access: credentials-handoff approach chosen.** User is NOT added as Owner on the Sunset Services GCP project. Goran retains full ownership; he enables APIs and generates credentials himself, then emails them to the user. Trade-off: clean ownership boundary in exchange for recurring coordination with Goran on every future GCP-touching task. ~4 more Goran touchpoints expected before launch.
- **New mini-phase 2.14a will be inserted** when Google approves the GBP API application (2–6 weeks after submission). Scope: ~5-minute OAuth refresh-token generation with Goran on his computer. Required because the OAuth flow has to be done while logged in as the GBP-owner Google account.
- **Phase 2.10 scope reduces.** The service account `sunset-website-reader@...iam.gserviceaccount.com` is already created in Phase 2.01 by Goran. Phase 2.10 now only needs to: (a) create the GA4 property for the new site, and (b) grant the existing service account Viewer access to that GA4 property — which Goran does from his side.
- **Phase 3.15 still requires Goran.** Google Search Console domain verification (DNS record placement is on Cowork via Cloudflare, but ownership verification triggers from Goran's GSC account) + adding the service account email as a user inside Search Console must both be done from Goran's account.
- **Credential safety note.** The Places API key, OAuth Client Secret, and service account JSON file in transit by email are sensitive. Acceptable for the one-time handoff; if any are suspected of being exposed post-launch, rotation goes through Goran. The service account JSON should never be committed to the public GitHub repo — only stored in Vercel environment variables and `.env.local` (which is gitignored).

**Decided by:** user (Goran), in response to Phase 2.01 GCP access clarifying question.

---

## 2026-05-12 — Phase 2.06 decisions

- **Captured leads + partials → Sanity** during the Mautic-deferred window. New schemas: `quoteLead` (full) + `quoteLeadPartial` (Steps 1–3). Mautic stub is a no-op; flips on when `MAUTIC_ENABLED=true` and the server is live.
- **Resend `from:`** uses the sandbox sender `onboarding@resend.dev` until Phase 2.08 verifies `sunsetservices.us` and ships branded templates. Lead alert still lands in `info@sunsetservices.us`.
- **Honeypot only** at this phase. Real rate-limiting deferred to launch hardening.
- **No visitor auto-confirmation email** at this phase — Phase 2.08 ships branded templates for both sides of every transactional email.
- **`WIZARD_SUBMIT_ENABLED=false`** falls back to the Phase 1.20 simulation so the wizard remains demoable when the backend is intentionally off.

**Decided by:** user (Goran), in response to Phase 2.06 clarifying question in Chat.

---

## 2026-05-12 — Phase 2.06 Resend TO routing (deferred)

At Phase 2.06 the Resend account associated with the API key in `.env.local` is in sandbox mode (no verified domain). Sandbox mode rejects sends to any address other than the account's verified owner, which for the Sunset Services Resend account is `dinovlazar2011@gmail.com` (matches Phase 2.01 docs — the original account-creation email).

**Decision:** `RESEND_TO_EMAIL=dinovlazar2011@gmail.com` for now (in `.env.local`, `.env.local.example`, and Vercel Production + Preview). The Phase 2.06 lead-alert email lands in `dinovlazar2011@gmail.com` during the dev window so the wiring is exercisable end-to-end.

**Deferred to Phase 2.08** (alongside the branded HTML template and domain-verified sender):

- Flip `RESEND_TO_EMAIL` to the real Sunset Services inbox (`info@sunsetservices.us` per the v2 plan).
- Verify `sunsetservices.us` in Resend so the FROM can move off the `onboarding@resend.dev` sandbox sender.
- Ship the branded HTML template for the lead-alert email.

This intentionally groups together with other postponed Phase 2.06 deliverables so all email/branding work lands in one coherent batch.

**Decided by:** user (Goran), 2026-05-12, after Phase 2.06 smoke testing confirmed the sandbox restriction.

---

## 2026-05-12 — Phase 2.07 uses user's personal Calendly URL for testing

Phase 2.07's Calendly embed ships pointing at `https://calendly.com/dinovlazar2011` — the user's
personal Calendly account, repurposed for Phase 2.07 testing. This is NOT Erick's account.

**Why a placeholder URL is acceptable here.** The component reads the URL from `NEXT_PUBLIC_CALENDLY_URL`,
so swapping to Erick's real Sunset Services Calendly URL is a single Vercel env-var edit
plus a Production redeploy — no code change required.

**Required before launch.** Phase 3.12 (pre-cutover QA) must flip `NEXT_PUBLIC_CALENDLY_URL`
to Erick's real Calendly URL on both Production AND Preview targets. Add this to the
Phase 3.12 checklist when that phase opens. Cowork pulls the real URL from Erick at the
same time he confirms his account is set up with the right event type ("30-min consult").

**Decided by:** user (Goran), in response to Phase 2.07 clarifying question in Chat.

---

## 2026-05-12 — Google Places address autocomplete deferred from Phase 2.07

The Phase 2.06 completion report listed Google Places autocomplete on wizard Step 4 as
Phase 2.07 scope. The canonical Phase Plan disagrees — it calls 2.07 Calendly-only.
The Places API key is parked behind Phase 2.13.2 per the 2026-05-10 GCP-deferral decision,
so wiring autocomplete in 2.07 (even flag-gated) would be empty scaffolding with rework
on key arrival.

**Resolution:** the Step 4 `data-autocomplete-stub="address"` marker stays untouched.
A new mini-phase will pick this up immediately after Phase 2.13.2 lands the API key —
likely numbered `2.13.3` to keep it adjacent to the dependency.

**Decided by:** user (Goran), in response to Phase 2.07 clarifying question in Chat.

---

## 2026-05-12 — Phase 2.08: Resend domain verification deferred + sandbox-aware email routing introduced

Phase 2.08 ships five branded HTML email templates and wires `/api/contact` + `/api/newsletter`, but does NOT verify `sunsetservices.us` in Resend. Reason: DNS for `sunsetservices.us` currently lives at the WordPress host's registrar (likely GoDaddy/Namecheap), and the user has not yet pulled DNS access from Erick. Adding SPF/DKIM/DMARC records is the prerequisite to flipping FROM off `onboarding@resend.dev`. This phase keeps the sandbox sender and accepts the routing constraint.

**Constraint imposed by sandbox mode:**
Resend sandbox-mode `from: onboarding@resend.dev` rejects any TO address other than the account's verified owner (`dinovlazar2011@gmail.com`). This blocks every visitor-facing email (quote confirmation, contact form receipt, newsletter welcome) from reaching the visitor's actual address.

**Routing pattern introduced this phase:**
A new shared utility `src/lib/email/send.ts` exports `sendBrandedEmail({ to, subject, react, intendedRecipient? })`. Behavior:
- When `RESEND_DOMAIN_VERIFIED=false` (the Phase 2.08 default): every send routes to `RESEND_TO_EMAIL` regardless of the intended TO. The rendered HTML carries an info banner at the top reading "Sandbox mode — intended recipient: {originalTo}". This means during the dev window, all five email types land in the dev inbox where they can be visually verified.
- When `RESEND_DOMAIN_VERIFIED=true` (flipped in Phase 3.11/3.12 after DNS verification): emails route to the original TO normally, no banner. Single env-var flip, zero code changes.

**Flip-day checklist (Phase 3.11/3.12):**
- Add SPF/DKIM/DMARC records for `sunsetservices.us` in whichever DNS provider holds the domain (Cloudflare if migration is done; otherwise current registrar).
- Verify domain status in Resend dashboard → "Verified" badge.
- Flip Vercel env vars on Production + Preview targets: `RESEND_FROM_EMAIL=info@sunsetservices.us`, `RESEND_TO_EMAIL=info@sunsetservices.us`, `RESEND_DOMAIN_VERIFIED=true`.
- Redeploy Production.
- Send one synthetic submission through each of: `/api/quote`, `/api/contact`, `/api/newsletter`. Confirm: lead alert lands in `info@sunsetservices.us`, visitor confirmation lands in the visitor's actual email, no sandbox banner.

**Risk acknowledged:** During the dev window, all visitor-facing emails are technically "not sent" — they land in the dev inbox instead. Visitors submitting between Phase 2.08 and the flip-day do not receive a confirmation email. This is acceptable because: (a) the Sanity write succeeds so no lead is lost, (b) the visitor is routed to a thank-you page with full next-steps, (c) the dev window is finite (closes before DNS cutover in Phase 3.13), and (d) low submission volume during dev makes individual outreach trivial if needed.

**Decided by:** user (Goran), in response to Phase 2.08 Q1 clarifying question in Chat.


---

## 2026-05-12 — Phase 2.09 rate-limiter chosen + carryover

The AI chat widget's per-IP rate limiter (1 msg / 2 s burst and 50 msg / day) ships at
Phase 2.09 as an **in-memory** implementation: two module-scoped `Map<string, ...>` structures
in `src/lib/chat/rateLimit.ts`. Counters reset on every Vercel function cold start — within
a warm window they enforce; across cold starts a determined attacker could reset their counter
by waiting for an idle period (typically ~5–15 minutes on Hobby). Two parallel instances of
the same function won't share counters either.

**This is acceptable for the Phase 2 preview window.** The preview URL is Vercel-SSO-protected;
only authenticated team members can reach `/api/chat`. Abuse risk is functionally zero during preview.

**This is NOT acceptable for production.** Before Phase 3.13 (DNS cutover), the in-memory limiter
MUST be replaced with a persistent store. **Phase 3.10 (Vercel Pro upgrade)** is the natural
replacement window — Pro unlocks generous Vercel KV limits and Upstash Redis stays free-tier-viable.
The API surface in `src/lib/chat/rateLimit.ts` (`checkRateLimit(ip) → {allowed, reason?, retryAfter?}`)
was deliberately designed so the swap is a single-file change with no caller changes.

**Carryover:** add to Phase 3.10 checklist — "Replace in-memory chat rate limiter with persistent store
before Phase 3.13 cutover."

**Decided by:** user (Goran), in response to Phase 2.09 Q1 clarifying question in Chat.

## 2026-05-12 — Phase 2.09 knowledge-base approach + caching

The chat backend system-prompts Claude on every turn with a locale-matched digest (~5K tokens)
covering services, locations, team, hours, and top FAQs. Built from Sanity at module load with
a 30-minute TTL memo (matches the site's existing ISR cadence). Anthropic prompt caching
(`cache_control: { type: 'ephemeral' }`) is applied so the system prompt costs full price on
a cache miss and ~10% on cache hits — typical conversations of 3–8 turns benefit significantly.

**Per-message cost ceiling at Sonnet 4.6 pricing:** ~$0.02 on a cache miss (mostly system-prompt
input), ~$0.005 on cache hits. Within the $50/month Anthropic cap given preview-traffic projections.

**Carryover:** if production usage shows costs trending high, two levers exist before switching to
lazy-lookup tool-use: (a) trim the digest by removing low-traffic FAQs and team bios, (b) bump cache
TTL beyond 30 min. Both are config-only changes.

**Decided by:** user (Goran), in response to Phase 2.09 Q2 clarifying question in Chat.

---

## 2026-05-13 — Phase 2.10 A.1b: GCP credentials synced to .env (Cowork)

Added the Phase 2.01 GCP carryover variable BLOCK to `.env.local` (gitignored) and to `.env.local.example` (placeholders only). Real-value status per variable:

- `GCP_PROJECT_ID`: PENDING — Goran has not shared the value yet.
- `GCP_PROJECT_NUMBER`: PENDING — Goran has not shared the value yet.
- `GCP_PROJECT_NAME`: populated as `Sunset Website` (the only value the user had on hand).
- `GOOGLE_PLACES_API_KEY`: PENDING — Goran has the key but has not shared it.
- `GBP_OAUTH_CLIENT_ID`: PENDING — Goran has the client but has not shared it.
- `GBP_OAUTH_CLIENT_SECRET`: PENDING — Goran has the secret but has not shared it.
- `GBP_OAUTH_REFRESH_TOKEN`: PENDING — generated in mini-phase 2.14a after Google approves the GBP API application (filed by Goran on 2026-05-12; 2–6 week review window).

**Vercel sync of the same variables:** deferred. Only `GCP_PROJECT_NAME` had a real value at A.1b time, and project NAME alone is rarely consumed by code. Pushing it stand-alone provided minimal value and risked confusion if other GCP vars stayed absent. The full set goes to Vercel in Phase 2.13.2 when Goran ships the credentials.

`.env.local.example` updated with placeholder-only entries — committed locally; user will push with the next Phase 2.10 commits.

**Pending values** for Phase 2.14a / 2.16 are tracked here; if any are still PENDING when those phases open, Chat surfaces it then.

**Cross-reference:** Phase 2.10 Part A also surfaced that Step A.1 (pull GCP service account email) and Step A.3 (grant the service account Viewer on the new GA4 property) could not be executed in this phase because the `sunset-website-reader@…iam.gserviceaccount.com` service account is not yet known to the user. Both steps are deferred to Phase 2.13.2 — see the Part-2-Phase-10-Cowork-Handover.md "Open carryover" section for the action item.

**Decided by:** Cowork, executing Phase 2.10 A.1b on behalf of user (Goran).

---

## 2026-05-13 — Phase 2.10 analytics accounts created (Cowork Part A)

- **GTM container created:** `GTM-NL5XX4DV` — account "Sunset Services", container "sunsetservices.us", target platform Web. GDPR Data Processing Terms accepted alongside the standard GTM Terms of Service.
- **GA4 property created:** "Sunset Services Website" inside a new account named "Sunset Services" — Measurement ID `G-RY6NT70SH7`. Stream "Sunset Services — Web", URL `https://sunsetservices.us`, time zone GMT-05:00 Chicago (Central), currency USD, industry Home & Garden, business size Small (1–10 employees), objectives "Generate leads" + "View user engagement & retention". Enhanced Measurement: "Site search" and "Form interactions" disabled (no site search; Code fires its own form events). All other Enhanced Measurement events left at defaults (Page views, Scrolls, Outbound clicks, Video engagement, File downloads). GDPR Data Processing Terms accepted alongside the standard GA Terms of Service.
- **Microsoft Clarity project created:** "Sunset Services" — Project ID `wqodtpq86q`, website URL `https://sunsetservices.us`, industry Other. Signed up via Google SSO using `dinovlazar2011@gmail.com` (one-click future logins). Standard Clarity Terms of Use accepted; marketing-emails opt-in declined.
- **GCP service account Viewer access on GA4 — DEFERRED to Phase 2.13.2.** The Phase 2.10 prompt's Step A.1 (pull the `sunset-website-reader@…iam.gserviceaccount.com` email from the user's `.env.local`) and Step A.3 (grant that service account Viewer access on the new GA4 property) could not run in this session — the user does not have the service-account email or JSON on their machine. Goran has provisioned a GCP project ("Sunset Website") and filed the GBP API application on 2026-05-12, but the service-account credentials have not been shared with the user yet. The Viewer grant is required for the Phase 2.16 automation agent to read GA4 for the weekly SEO/traffic summary. Action carried in Part-2-Phase-10-Cowork-Handover.md → "Open carryover for Phase 2.13.2".
- **Accounts created on the user's personal Google + Microsoft (via Google SSO) accounts.** Same pattern as Phase 2.01 — user owns long-term; Erick gets added later if needed.
- **TOS authorization:** user (Goran) explicitly authorized in chat the acceptance of the standard Terms of Service for Google Analytics, Google Tag Manager, and Microsoft Clarity as part of this phase.

**Decided by:** Cowork, executing Phase 2.10 Part A on behalf of user (Goran).

---

## 2026-05-13 — Phase 2.10 analytics stack scope choices

- **Simple binary cookie banner now; full Consent Mode v2 deferred to Phase 3.04.** Phase 2.10's banner blocks GTM + Clarity script load entirely until Accept is clicked. Phase 3.04 will swap to Google Consent Mode v2 with granular consent categories and Termly/iubenda-generated legal copy.
- **4 conversion events selected** by the user: `quote_submit_succeeded`, `contact_submit_succeeded`, `newsletter_subscribed`, `calendly_booking_scheduled`. Chat lead capture (`lead_capture_submit_succeeded`) is intentionally NOT a conversion — it's tracked as a regular event for funnel analysis but not marked as a Key Event in GA4.
- **Microsoft Clarity loaded directly (not through GTM).** Simpler — Clarity's snippet is small and works without GTM. Cowork Part B can swap to a GTM-hosted Clarity tag later if needed.
- **`NEXT_PUBLIC_ANALYTICS_ENABLED` master kill switch.** Acts BEFORE consent state — if false, neither the banner nor the scripts ever render. Defaults to `true` once Cowork Part A is complete; flip to `false` to disable analytics across the board without removing the banner.
- **PII stripping in the dataLayer bridge.** Wizard / contact / newsletter / chat events never carry name, email, phone, or address into `window.dataLayer`. The bridge filters out any payload key matching `name`, `email`, `phone`, `address`, `firstName`, `lastName`, `streetAddress`, `zipCode` before pushing. Defensive — the dispatchers already only carry event metadata, but the filter is the guard.

**Decided by:** user (Goran), in response to Phase 2.10 clarifying questions in Chat.

---

## 2026-05-13 — Phase 2.10: AnalyticsBridge listens on `document`, not `window`

The Phase 2.10 plan's `AnalyticsBridge` example used `window.addEventListener('sunset:*-event', handler)`. But every existing dispatcher across the codebase (Phase 1.20 wizard, Phase 2.06 wizard partial, Phase 2.08 contact + newsletter, Phase 2.09 chat) calls `document.dispatchEvent(new CustomEvent(scope, {detail: ...}))` with `bubbles: false` (default). CustomEvents on `document` don't propagate to `window` unless explicitly marked `bubbles: true`, so a `window` listener would never fire. Switched the bridge to listen on `document` — minimum-blast-radius alternative would have required refactoring every dispatcher's `bubbles` flag.

**Why this matters for future phases:** any later phase that adds a new `sunset:*-event` CustomEvent dispatcher should also fire on `document` (NOT `window`) to remain compatible with the bridge. Phase 3.04 (Consent Mode v2) inherits this convention.

**Decided by:** Code, in-phase during Phase 2.10 execution.

---

## 2026-05-13 — Phase 2.10: Dispatcher wire-value rename pass

Three dispatchers had drifted from the Phase 2.10 analytics spec (`src/lib/analytics/events.ts`) by enough to break Cowork's GTM Key Event tags. Surgical rename pass touched 6 files outside the Phase 2.10 Code prompt's listed scope:

- `WIZARD_EVENTS.SUBMIT_SUCCEEDED` wire value `'wizard_submit_succeeded'` → `'quote_submit_succeeded'` (CONVERSION).
- New `WIZARD_EVENTS.STEP_ADVANCED: 'wizard_step_advanced'` (replaces the per-step `STEP_COMPLETED(n)` function on the forward-transition fire site — single event name with `{step: n}` in the payload).
- `CHAT_EVENTS.PANEL_OPENED` → `OPENED`, wire value `'chat_panel_opened'` → `'chat_opened'`.
- New `CHAT_EVENTS.BANNER_BOOK_CLICKED: 'chat_banner_book_clicked'` + `BANNER_QUOTE_CLICKED: 'chat_banner_quote_clicked'` (Phase 2.09 set `data-analytics-event` attributes on the high-intent banner Links; Phase 2.10 added the matching CustomEvent dispatches so the AnalyticsBridge picks them up).
- NewsletterSignup inline dispatcher: `'newsletter_submit_succeeded'` → `'newsletter_subscribed'` (CONVERSION); `'newsletter_submit_already_subscribed'` → `'newsletter_already_subscribed'`.

**Why this matters for future phases:** these are the canonical wire-value names from this point forward. Any analytics tooling that previously listened for the old names (none in the repo at this phase, but downstream Sanity / Mautic / etc. integrations might) needs to follow the rename. Cowork Part B's GTM tag configuration references the new names exactly.

**Decided by:** Code, in-phase during Phase 2.10 execution. Plan's smoke tests 5–8 explicitly required the new names to appear in `window.dataLayer`; a pure-passthrough bridge would have failed those tests.

---

## 2026-05-13 — Phase 2.10: Calendly widget consent gate intentionally left at stub default-true

The Phase 2.10 plan's Step 12 snippet for CalendlyEmbed used `consentGranted` as a guard variable on the `message` listener. Interpreted strictly, that would have wired the Calendly widget itself to the new cookie consent banner — meaning visitors who Decline would not see the widget. Rejected: Calendly is a booking service (the primary CTA path from `/contact/` and `/thank-you/`), not analytics/marketing tooling. Phase 2.10's cookie banner blocks GTM + Clarity, but visitors who Decline should still be able to book a consultation.

The data flow IS consent-gated correctly: Calendly's `postMessage` events fire whenever the widget is mounted, but the bridge's `pushDataLayer` enforces consent before any push reaches `window.dataLayer`. So Decline → no dataLayer push from Calendly, but the widget still loads and accepts bookings.

**Why this matters for future phases:** Phase 3.04 (Consent Mode v2 + GDPR legal review) may revisit. If a legal review insists that Calendly itself needs consent (e.g., because Calendly's iframe sets cookies), the swap is a single `useConsent()` import + adjusting the `shouldRenderWidget` predicate in `CalendlyEmbed.tsx`. The chat bubble's Phase 2.07 stub `default-true` is in the same boat — same swap point if needed.

**Decided by:** Code, in-phase during Phase 2.10 execution.

---

## 2026-05-13 — Phase 2.10: GCP `.env.local.example` carryover deferred (not committed by Phase 2.10 Code)

The Cowork Part A handover note (`src/_project-state/Part-2-Phase-10-Cowork-Handover.md`) explicitly asks "Code (or the user) reconciles the dirty tree and commits the GCP carryover block to `.env.local.example` as part of the Phase 2.10 chore commits." Cowork added a 7-variable GCP block (`GCP_PROJECT_ID` / `GCP_PROJECT_NUMBER` / `GCP_PROJECT_NAME` / `GOOGLE_PLACES_API_KEY` / `GBP_OAUTH_CLIENT_ID` / `GBP_OAUTH_CLIENT_SECRET` / `GBP_OAUTH_REFRESH_TOKEN`, all PENDING values except `GCP_PROJECT_NAME='Sunset Website'`) to the main tree's `.env.local.example` but did not commit it.

The Phase 2.10 Code prompt's listed scope only includes the 4 Phase 2.10 NEXT_PUBLIC_* analytics env vars. Expanding the `.env.local.example` diff with PENDING-value GCP variables (most of which Phase 2.13.2 will own anyway) was outside that scope. Left to either:
- the user, who already has the block uncommitted on the main tree and can commit it directly there once the 113-modified-files drift is reconciled; OR
- Phase 2.13.2, which is the natural owner of the GCP variables.

**Why this matters for future phases:** Phase 2.13.2 should not be surprised to find the GCP block missing from `.env.local.example` on `origin/main` — that's the expected state. Whichever path lands first (user-commits-on-main vs Phase-2.13.2-adds-the-block) needs to be tolerant of the other.

**Update (2026-05-14, post-merge):** Resolved during the Option 1 fast-forward merge from `claude/thirsty-kowalevski-1b2357`. Cowork's two Decisions entries (Part A account creation + A.1b GCP sync) are now committed at the top of the Phase 2.10 entry block, and the GCP block in `.env.local.example` is committed alongside the Phase 2.10 analytics block. Phase 2.13.2 ownership of the GCP variables is unchanged — this commit only documents the shape; the values stay PENDING until Goran ships them.

**Decided by:** Code, in-phase during Phase 2.10 execution.

---

## 2026-05-14 — Phase 2.11: Spanish translation pass — tone map, dialect, glossary locked

Phase 2.11 produced an idiomatic first-pass Spanish translation across every `[TBR]`-flagged source-file string and every fillable Sanity `.es` field. Decisions locked in this phase that future phases inherit:

**Dialect — neutral Latin-American Spanish, Mexican-origin friendly.** Reasoning: Aurora's Hispanic community is largely of Mexican origin; the copy reads natural for that audience without alienating other LatAm Spanish speakers. Iberian/Castilian vocabulary explicitly avoided (`vosotros`/`os`, `coger`, `ordenador`, `móvil`, `aparcar`, `piso` for "unit", `vale`, `tío`/`tía`). MX-preferred terms applied uniformly (`césped` / `jardín` / `patio` / `adoquines` / `muro de contención` / `cocina al aire libre` / `brasero` / `pérgola` / `remoción de nieve` / `estimado` / `cotización` / `propiedad` / `empresa familiar`). Full glossary in `Sunset-Services-TRANSLATION_NOTES.md`.

**Tone — mixed per surface.** `usted` for legal/forms/transactional (Privacy, Terms, Quote wizard, Contact form, all 5 email templates including alert emails for staff register-consistency, Thank-you page, cookie consent body, 404, all system error messages, newsletter signup confirmation, chat inline lead-capture form). `tú` for marketing/content/persona (home, audience landings, all 16 service detail pages, project portfolio, blog posts, resource articles, About, service-areas pages, AI chat persona, footer newsletter pitch, suggested chat prompts). Documented edge cases: service-page CTA flips register at the page boundary into the wizard; footer mixed marketing-line (`tú`) + legal-fineprint-line (`usted`); chat composer `tú` but rate-limit/disabled errors `usted`; testimonial quotes preserve reviewer voice (usually `tú`).

**Scope — everything in source files + every fillable Sanity bilingual field.** "Fillable" qualified per the Sanity-state probe: where `.en` was already null (services `dek`/`intro`, locations `tagline`/`microbarLine`/`whyLocal`, team `bio`), no translation source exists so `.es` stays null. Where the Sanity `.es` was already populated from the Phase 2.05 seed pass without a `[TBR]` marker (some FAQ answers, blog/resource PortableText bodies, service titles), Code did not retranslate — those are considered earlier-pass-done and live alongside the Phase 2.11 `[TBR]`-tagged content. Phase 2.12 native review reads everything regardless.

**`[TBR]` position locked to leading prefix** (`[TBR] <Spanish text>`). Phase 1.16 / 2.05 / 2.07–2.09 produced a mix of trailing-suffix and leading-prefix markers; Phase 2.11 normalized everywhere it touched. Phase 2.12 strips the prefix as each surface is approved by Erick.

**`[TBR]` deliberately omitted from rendered visitor surfaces** in 3 cases where the marker would corrupt the user experience: (a) email template strings — `[TBR]` lives in a code comment, not in the visitor-facing copy, because real recipients would see `[TBR] Gracias por escribirnos…` literally; (b) `PERSONA_ES` in `src/lib/chat/systemPrompt.ts` — `[TBR]` at comment level only, because the prompt content goes to the model and any `[TBR]` literal would distract or confuse the persona output; (c) `knowledgeBase.ts` ES `LocaleLabels` block — same reason as the persona. For every other surface (source-file i18n strings, page.tsx inline templates, Sanity `.es` fields, project data files), the `[TBR]` prefix is part of the value and renders to ES visitors until Phase 2.12 strips it.

**Sanity blog/resource PortableText bodies — deep block-by-block retranslation deferred to Phase 2.12.** Per the Sanity-state probe: 5 blog posts × 30–60 PortableText blocks each and 5 resource articles same. Bodies were already populated from the Phase 2.05 seed migration (first block carries `[TBR]` prefix on some posts). Scope decision: Phase 2.11 spot-checked the bodies for glossary alignment and structural mirror with EN; full block-by-block retranslation would have exceeded what's useful as a first pass given the bulk was already done. Phase 2.12's review reads each post + article through for quality and is the right scope for any block-level changes.

**Source-file `src/data/blog.ts` and `src/data/resources.ts` body content `[TBR]` markers intentionally left in place.** Post-Phase-2.05, blog and resource bodies are sourced from Sanity, not from these files. The source-file content is now seed-only (consumed by `scripts/seed-sanity.mjs`) and not rendered to users. Translating it would not change the live site. The dead-code `[TBR]` markers will be cleaned up in a future i18n hygiene pass — flagged but out of Phase 2.11 scope.

**Why this matters for future phases:** Phase 2.12 inherits the tone map, glossary, and scope decisions verbatim. Erick (or designate) can override any glossary row during review; the override propagates by editing `Sunset-Services-TRANSLATION_NOTES.md` and re-running the relevant translation script. The decision that emails / persona / knowledge-base use code-comment `[TBR]` markers (not inline prefixes) is load-bearing — future translation phases that add new email templates / persona blocks / model-facing system prompts inherit the same pattern.

**Decided by:** Code, in-phase during Phase 2.11 execution. Tone map + dialect were locked by Chat in the Phase 2.11 brief; Code applied them consistently and surfaced edge cases.

---

## 2026-05-14 — Phase 2.12 (native Spanish review) deferred — Phase 2.13 runs next

Phase 2.12 (Erick + Cowork native Spanish review of every `[TBR]`-flagged surface) is **skipped for now** and rolled forward to a later-but-not-yet-scheduled slot. **Phase 2.13 (ServiceM8 webhook + Sanity event queue) is the next phase to run.**

**Why deferred.** Erick (or whoever the designate is) isn't queued to do the review pass right now, and Phase 2.13's scope is entirely backend — no overlap with translation work. Holding the rest of the build hostage to native-review timing is the wrong trade. Phase 2.11 already produced idiomatic, glossary-aligned, tone-mapped Spanish across every flagged surface; the review pass polishes, but it's not a blocker for backend work.

**Risk acknowledged — visible to ES visitors.** Until Phase 2.12 runs, ES routes still render the `[TBR]` prefix verbatim on every translated string (e.g. `[TBR] Estimado gratis para tu proyecto`). This is a UX problem on a public site. It is NOT a launch-blocker — the prefix can be globally stripped at any time without redoing translation work — but doing so before native review means publishing translation choices that haven't been confirmed against Erick's voice.

**Two paths forward, both viable. Decision deferred to user — flagged here so the choice is conscious, not silent.**

- (a) **Strip-then-review.** Before any public traffic hits the ES routes (i.e. before Phase 3.13 DNS cutover at the latest), run a small one-off Code phase that strips the leading `[TBR] ` prefix from every rendered surface. Translations stay as Code wrote them. Phase 2.12 then reads through the stripped result and patches whatever isn't right — usually faster than reviewing-then-stripping because the reviewer sees the visitor experience directly.
- (b) **Review-then-strip.** Run Phase 2.12 as originally specified before launch — Erick reads each surface, fixes what's off, and the prefix gets stripped surface-by-surface as he approves. Higher confidence; slower.

**Hard latest moment to pick a path:** before Phase 3.12 (pre-cutover QA), since ES quality is part of the launch acceptance criteria (Project Instructions §15, Plan §14).

**Phase 2.12 reading order, when it does run:** `Sunset-Services-TRANSLATION_NOTES.md` "Native-review priority items" (7-item queue starting with the chat persona `PERSONA_ES`). Glossary + tone map locked in Phase 2.11; no need to re-derive.

**No code or content changes in this entry.** This is a workflow decision only — the Phase 2.11 output stays exactly as it shipped.

**Decided by:** user (Goran), in Chat on 2026-05-14, before opening Phase 2.13.

---
