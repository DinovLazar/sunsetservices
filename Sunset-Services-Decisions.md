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

## 2026-05-13 — Phase 2.10 analytics stack scope choices

- **Simple binary cookie banner now; full Consent Mode v2 deferred to Phase 3.04.** Phase 2.10's banner blocks GTM + Clarity script load entirely until Accept is clicked. Phase 3.04 will swap to Google Consent Mode v2 with granular consent categories and Termly/iubenda-generated legal copy.
- **4 conversion events selected** by the user: `quote_submit_succeeded`, `contact_submit_succeeded`, `newsletter_subscribed`, `calendly_booking_scheduled`. Chat lead capture (`lead_capture_submit_succeeded`) is intentionally NOT a conversion — it's tracked as a regular event for funnel analysis but not marked as a Key Event in GA4.
- **Microsoft Clarity loaded directly (not through GTM).** Simpler — Clarity's snippet is small and works without GTM. Cowork Part B can swap to a GTM-hosted Clarity tag later if needed.
- **`NEXT_PUBLIC_ANALYTICS_ENABLED` master kill switch.** Acts BEFORE consent state — if false, neither the banner nor the scripts ever render. Defaults to `true` once Cowork Part A is complete; flip to `false` to disable analytics across the board without removing the banner.
- **PII stripping in the dataLayer bridge.** Wizard / contact / newsletter / chat events never carry name, email, phone, or address into `window.dataLayer`. The bridge filters out any payload key matching `name`, `email`, `phone`, `address`, `firstName`, `lastName`, `streetAddress`, `zipCode` before pushing. Defensive — the dispatchers already only carry event metadata, but the filter is the guard.

**Decided by:** user (Goran), in response to Phase 2.10 clarifying questions in Chat.
