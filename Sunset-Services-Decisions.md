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
