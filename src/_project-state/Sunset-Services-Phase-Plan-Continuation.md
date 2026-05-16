# Sunset Services — Phase Plan Continuation

> **Companion to** `Sunset-Services-Project-Instructions.md`, `Sunset-Services-Plan.md`, and `Sunset-Services-Decisions.md`. Read those first.
> **This document picks up the moment Phase 2.18 closes.** It replaces the Part 3 section of `Sunset-Services-Phase-Plan.md`, reshuffles a handful of skipped Part 2 phases into the new flow, and adds the user-testing + Codex review + Erick handover phases that the original plan didn't have.
> **One linear flow, three buckets in order: B → M → P.** Bucket letters in the phase ID always tell you which bucket you're in.

---

## Table of contents

1. How to read this document
2. Phase numbering conventions
3. Bucket B — Building (11 phases)
4. Bucket M — Make-it-work (12 phases + 1 mini)
5. Bucket P — Publishing (11 phases)
6. Critical path & dependencies
7. Defaults locked at draft time (where Chat made calls on the user's behalf)
8. What changed vs `Sunset-Services-Phase-Plan.md`
9. What's next

---

## 1. How to read this document

This is the **index** of every phase from here through launch. Each row is a one-line description of what the phase delivers. The full prompt file for a phase gets written by Claude Chat the moment the previous phase closes — never multiple phases ahead.

**Per row:**
- `#` — the phase ID, used in filenames, commit messages, completion reports.
- `Phase` — the short name.
- `Type` — who runs it: **Code**, **Design**, **Cowork**, **User**, or a combination (e.g. *User → Code*, *Cowork + Code*).
- `Scope` — one sentence on what ships.

**Bucket order is strict.** All B before all M; all M before all P. The one allowed parallelism: M.03 (native Spanish review) is Erick-paced and can run in the background while later M-phases proceed, since it doesn't block any other phase.

**Quality bar remains binding** per Project Instructions §10: Lighthouse 95+ on all four scores desktop + mobile on a representative sample, WCAG 2.2 AA, native Spanish review, no dangling threads.

---

## 2. Phase numbering conventions

- Building phases: **B.01 → B.11**
- Make-it-work phases: **M.01 → M.12** (+ one M.04a sub-phase)
- Publishing phases: **P.01 → P.11** (+ one P.10b handover-doc final pass)
- Filenames switch from the old `Part-X-Phase-YY-<Role>.md` to a slightly cleaner `Phase-B-NN-<Role>.md` / `Phase-M-NN-<Role>.md` / `Phase-P-NN-<Role>.md`. Completion reports become `Phase-B-NN-Completion.md` etc., still committed into `src/_project-state/`.
- One phase = one completion report = one git commit per executing Claude session.
- If a phase has to split mid-build, the split goes B.04a / B.04b. New phases inserted later take the next number, no half-decimals.

---

## 3. Bucket B — Building (Code/Design only, no Cowork, no external waits)

> **Goal:** Every visible-on-site improvement and every code-only loose end that can ship without contacting Erick, Goran, Google, or anyone else outside this Chat ↔ Code ↔ Design ↔ Cowork loop. You can hand the prompts to Claude Code in sequence and the bucket closes itself.

| # | Phase | Type | Scope |
|---|---|---|---|
| B.01 | Strip `[TBR]` from Spanish surfaces | **Code** | Removes the literal `[TBR]` prefix from every ES translated string in `src/messages/es.json`, `src/data/locations.ts`, `src/data/projects.ts`, the email templates, the chat persona, and Sanity (`scripts/translate-sanity-es.mjs` inverse). Preview stops looking half-finished. Native-review still happens in M.03 — this just stops broadcasting "work in progress" to visitors. |
| B.02 | Legal pages — Design handover | **Design** | Visual treatment for Privacy + Terms + the cookie banner. Decides between Termly and iubenda. EN + ES layouts. |
| B.03 | Legal pages — Code + Consent Mode v2 | **Code** | Implements `/privacy/` and `/terms/` from B.02. Upgrades the cookie banner from binary (Phase 2.10) to Google Consent Mode v2 with granular signals (ad_storage, analytics_storage, ad_user_data, ad_personalization). |
| B.04 | Schema validation pass | **Code** | Runs every page type through Google's Rich Results Test. Verifies `@id` references resolve, `LocalBusiness` graph is well-formed, all `FAQPage` / `Article` / `BlogPosting` / `HowTo` / `Place` / `CreativeWork` payloads valid. Fixes any warnings. |
| B.05 | Sitemap, robots, hreflang, canonical — final pass | **Code** | Verifies dynamic sitemap covers every page (EN + ES, including new legal pages from B.03). `robots.txt` correct. `hreflang` on every localized page. Canonicals harmonized site-wide (resolves the Phase 1.16 trailing-slash divergence carried over from Part 1). |
| B.06 | Accessibility audit — WCAG 2.2 AA | **Code** | Screen-reader pass (NVDA + VoiceOver), keyboard nav pass, contrast verification, focus states, skip links, ARIA. Documents any deferred items as out-of-scope with rationale. |
| B.07 | Newsletter unsubscribe page | **Code** | `/api/newsletter/unsubscribe/[token]` endpoint + a confirmation page. The `NewsletterWelcomeEmail` footer starts rendering the unsubscribe link (currently hidden because the URL is `undefined`). |
| B.08 | Sanity → site instant revalidate webhook | **Code** | `/api/revalidate` endpoint + Sanity webhook configured to call it on every publish. Replaces the 30-min ISR wait — Erick's Sanity edits show up on the live site within seconds. |
| B.09 | Chat rate-limiter swap (in-memory → Vercel KV / Upstash) | **Code** | Replaces the module-scoped `Map`s in `src/lib/chat/rate-limit.ts` with Vercel KV (free tier on Hobby, generous on Pro) or Upstash Redis. Same `checkRateLimit(ip) → {allowed, reason?, retryAfter?}` API — single-file swap by design. Must ship before P.06 (DNS cutover). |
| B.10 | Address autocomplete on quote wizard Step 4 | **Code** | Wires Google Places Autocomplete to the `data-autocomplete-stub="address"` slot. Typing a street prefills city + state + ZIP. Was deferred as mini-phase 2.13.3. **Requires the Places API key from M.04** — if M.04 hasn't landed yet when this phase is ready to run, defer this single phase to M.05's neighborhood. |
| B.11 | Photo upload on quote wizard Step 3 | **Code** | Wires the `data-photo-upload-slot` placeholder to a real file upload widget. Photos attach to the `quoteLead` Sanity document. Storage: Sanity assets (simplest) or Vercel Blob if Sanity asset quota becomes a concern. |

**B-bucket note on B.10.** This is the one phase in Bucket B that has an outside dependency — the Google Places API key from M.04. If M.04 hasn't landed by the time you get to B.10, just skip ahead to B.11, close the rest of Bucket B, open M.01, and circle back to B.10 after M.04. The rest of B is fully self-contained.

---

## 4. Bucket M — Make-it-work (connecting integrations, testing, Erick prep)

> **Goal:** Every integration live, every skipped Part 2 phase closed, every "swap before launch" item handled, the site tested end-to-end including by you as a user, and a handover doc written for Erick. Bucket closes with everything ready for the publishing flow.

| # | Phase | Type | Scope |
|---|---|---|---|
| M.01 | Photo curation & Sanity upload (was Phase 2.04, deferred) | **Cowork** | Cowork curates Erick's Drive into per-service folders + a `/projects/` folder. Uploads photos to Sanity assets and tags them with service/audience/location metadata. Real per-city statistics replace the placeholder numbers in `src/data/locations.ts`. **Blocked until Drive access lands**; start the moment it does. |
| M.02 | Performance pass — Lighthouse 95+ desktop AND mobile | **Code** | Image optimization, `next/dynamic` of below-hero sections, font preload audit, critical CSS audit. Real photos from M.01 already in place — clears the mobile-Performance ceiling carried over from Phase 1.07. Re-runs Lighthouse on Home + one service page + one blog post + one location page. |
| M.03 | Native Spanish review (was Phase 2.12, deferred) | **Cowork + Erick** | Erick (or his designate) reviews the Spanish translation page-by-page. Cowork applies corrections back into Sanity + `src/messages/es.json` + `src/data/locations.ts` + `src/data/projects.ts`. `Sunset-Services-TRANSLATION_NOTES.md` finalized. **Can run in parallel with M.04 → M.09** since it's Erick-paced and doesn't block any other phase. |
| M.04 | Google APIs unblock — GCP project + Places + GBP (was Phases 2.13.2 + 2.14) | **Cowork + Goran + Code** | Google approves the GBP API access application (started 2026-05-12, 2–6 week window). Goran hands over `GBP_OAUTH_CLIENT_SECRET`. Cowork creates the GCP project + provisions the Places API key. Code wires the Places API client into `src/lib/google/`. GBP write client stubbed pending M.04a. |
| M.04a | GBP OAuth refresh-token screen-share (was Phase 2.14a) | **Cowork + Goran** | The 5-minute OAuth dance with Goran on his computer to generate `GBP_OAUTH_REFRESH_TOKEN`. Required because the OAuth flow has to happen while logged in as the GBP-owner Google account. Drops into Vercel env on completion. |
| M.05 | Daily Google reviews cron (was Phase 2.16 leg, deferred) | **Code** | The third cron that couldn't ship in Phase 2.16. Daily fetch of new Google reviews via the Places API into Sanity. Location pages start showing real reviews instead of placeholder testimonials. **Vercel Hobby's 2-cron limit is full** — this either consolidates the schedules in one route (internal dispatch) or triggers P.01 (Pro upgrade) early. Decision in-phase. |
| M.06 | Telegram bot flag-on | **Cowork + small Code** | Populate `TELEGRAM_BOT_TOKEN` + `TELEGRAM_OPERATOR_CHAT_ID` on Vercel Production + Preview (they're empty there per Phase 2.15 carryover). Run `npm run telegram:setup -- <preview-url>/api/webhooks/telegram` once. Flip `TELEGRAM_ENABLED=true`. Manual end-to-end smoke test (send a real test approval, tap a button, verify Sanity round-trip). |
| M.07 | Mautic install + flip flag | **User + small Code** | User installs self-hosted Mautic on a server. Fills in `MAUTIC_BASE_URL` + `MAUTIC_API_KEY`. Flips `MAUTIC_ENABLED=true`. Real Mautic integration replaces the Phase 2.06 no-op stubs at the call sites. **Non-blocking** — launch can ship without it; the Sanity capture of every lead is durable enough on its own. Run when you're ready. |
| M.08 | Personal-to-Erick swap pass | **Cowork + small Code** | The accounts that still point at you, not Erick, swap over: `NEXT_PUBLIC_CALENDLY_URL` → Erick's Calendly; `TELEGRAM_OPERATOR_CHAT_ID` → Erick's chat ID (after he sends `/start` to the bot); GBP listing manager → Erick added; (Resend FROM/TO defers to P.03 because those need DNS records on the new domain). |
| M.09 | Full integration smoke test on Vercel preview | **Code + User as tester** | Code-led checklist run with User verifying each integration end-to-end: quote-wizard submission → Resend email → Sanity doc; contact form; newsletter; AI chat streaming + lead capture + rate limiting; Calendly embed; cookie consent gating; Telegram approval round-trip; ServiceM8 webhook synthetic event; monthly blog cron manual trigger; weekly SEO cron simulated branch. |
| M.10 | User-tests-site walkthrough + Code fixes | **User → Code** | User walks every page in both languages, every form, every flow on the Vercel preview. Comes back with a written list of every visual / UX / copy issue noticed. Chat writes a single Code prompt that fixes all of them. One iteration; if a second pass is needed, it becomes M.10b. |
| M.11 | Codex code review | **User → Chat → Code** | User runs OpenAI's Codex against the repo (instructions in the phase prompt). Pastes findings back here. Chat writes a Code prompt that addresses every reportable bug. Cosmetic / style-only suggestions logged in `Sunset-Services-Decisions.md` and dropped. |
| M.12 | Erick handover doc — first draft | **Cowork + User** | Cowork verifies every Bucket M deliverable closed. Then, with the User's help, writes a plain-language `Sunset-Services-Erick-Handover.md` for Erick: how to log into Sanity Studio (link), how to publish a blog post / swap a photo / add a project, where to find leads (Resend dashboard link, Mautic if live, Sanity Studio "Quote Lead" view), how to read GA4 + Clarity (dashboards linked), how Telegram approvals work, what each piece does in one sentence. Final-pass update happens at P.10b after launch dashboards exist. |

**M-bucket dependency note.** M.04 → M.04a → M.05 is a hard chain. M.07 (Mautic) is fully independent and can slot in anywhere. M.03 (Spanish review) runs in parallel from the moment Erick is available. Everything else is sequential.

---

## 5. Bucket P — Publishing (going public)

> **Goal:** Live on `sunsetservices.us` with SSL, every integration firing on production, NAP consistent across all listings, search engines notified, monitoring in place, and a 30-day review on the calendar.

| # | Phase | Type | Scope |
|---|---|---|---|
| P.01 | Vercel Pro upgrade | **Cowork** | Upgrade the Vercel project from Hobby to Pro. Puts the commercial-use policy line behind the project, unlocks the 3rd cron slot (uncon­solidates anything M.05 had to bundle), unlocks full Vercel Analytics retention. No code changes; verify the project still builds after the plan flip. |
| P.02 | Cloudflare DNS setup (prep, no cutover) | **Cowork + Code** | Move `sunsetservices.us` DNS to Cloudflare if not already there. Configure all records ready for cutover but **don't switch the A/CNAME records yet**. Vercel custom-domain added in the Vercel dashboard, waiting on DNS to point at it. |
| P.03 | Resend domain verification + sender flip | **Cowork** | SPF + DKIM + DMARC records on Cloudflare DNS. Resend verifies the domain. Flip three env vars on Vercel (Production + Preview): `RESEND_DOMAIN_VERIFIED=true`, `RESEND_FROM_EMAIL=info@sunsetservices.us`, `RESEND_TO_EMAIL=info@sunsetservices.us`. Sandbox routing in `sendBrandedEmail()` auto-switches to live mode. Zero code change. |
| P.04 | 301 redirects from old WordPress URLs | **Cowork + Code** | Cowork pulls every URL from the current WordPress site (sitemap export + crawl). Code implements 301 redirects in `next.config.ts` or `proxy.ts` so old URLs land on the closest new page. Spot-check the highest-traffic old URLs post-deploy. |
| P.05 | Pre-cutover QA on Pro plan | **Code + User** | Full clickthrough on the Vercel preview at production-shape with Pro plan now active. Content review every page both languages. Broken-links scan. Forms tested live (real Resend sender, real Calendly URL, real Telegram chat ID). Lighthouse re-run on the Phase 3.01 sample — confirm 95+ holds across all four scores. |
| P.06 | DNS cutover | **Cowork + Code** | Switch `sunsetservices.us` A/CNAME records to point at Vercel. Vercel issues SSL automatically. Cowork monitors propagation. Old WordPress install can stay running on its own subdomain briefly as a fallback. |
| P.07 | Production verification | **Code** | Verify SSL active, all redirects working on the live domain, schema valid on production, all integrations firing on the production domain. One synthetic quote-wizard submission end-to-end to confirm Resend + Mautic (if live) + thank-you. |
| P.08 | Search Console + Bing Webmaster submission | **Cowork** | Submit new sitemap to Google Search Console + Bing Webmaster Tools. Verify ownership on the new domain. Set up email alerts for indexing / coverage issues. **Flip `GSC_ENABLED=true`** so the weekly SEO summary cron starts delivering real data to Telegram. |
| P.09 | NAP consistency final audit | **Cowork** | Final audit on Google Business Profile, Yelp, Facebook, Instagram, YouTube. Name + address + phone identical everywhere ("Sunset Services" / 1630 Mountain St, Aurora, IL 60505 / (630) 946-9321). Photos and bios consistent across listings. The initial NAP work runs as a parallel-track Cowork task during Bucket M; this is the final sign-off. |
| P.10 | Post-launch monitoring setup | **Code + Cowork** | Telegram alerts wired for: new lead submissions (notify Erick), errors (Vercel error logs), agent failures. Vercel Analytics dashboard configured. GA4 dashboard with conversion + traffic-source views. Clarity recordings reviewed weekly. |
| P.10b | Erick handover doc — final pass | **Cowork + User** | Updates `Sunset-Services-Erick-Handover.md` (first drafted in M.12) with the now-live production links: Vercel Pro analytics, verified Search Console, real-domain Resend dashboard, Telegram lead-alert example screenshots. Adds a one-page "quick start" cover sheet. Doc handed to Erick. |
| P.11 | 30-day review | **Code + Cowork** | 30 days after P.06 cutover: re-run Lighthouse, check Search Console for indexing + errors, review GA4 traffic, review lead volume vs the old WordPress baseline, fix any issues that surfaced. Write the 30-day report. **Project ships.** |

---

## 6. Critical path & dependencies

The hard chains:

- **B.10 (address autocomplete) depends on M.04 (Places API key).** If M.04 isn't landed when B.10 comes up in sequence, skip B.10 → close the rest of B → run M.01 → loop back to B.10 once M.04 fires.
- **M.02 (Performance pass) depends on M.01 (real photos).** Performance can't honestly hit 95+ mobile until real photos with correct dimensions are in place.
- **M.04 → M.04a → M.05** is a single chain. M.04a needs Google approval from M.04. M.05 needs Places client from M.04 + refresh token from M.04a.
- **M.06 (Telegram flag-on) depends on M.04** only loosely — `TELEGRAM_OPERATOR_CHAT_ID` and `TELEGRAM_BOT_TOKEN` just need populating; Google APIs aren't involved.
- **M.08 (Erick swap pass) depends on M.06** for the Telegram chat ID part. Other swaps in M.08 are independent.
- **M.09 → M.10 → M.11 → M.12** is a strict end-of-bucket sequence — each consumes the output of the prior.
- **P.01 (Pro upgrade) must precede P.05 (pre-cutover QA)** so QA runs on the same plan that goes live.
- **P.02 (Cloudflare DNS prep) must precede P.06 (cutover)** — obvious.
- **P.03 (Resend domain) depends on P.02** for the DNS records, but doesn't have to wait for P.06.
- **P.06 (cutover) must precede P.07 → P.11.** Every Publishing phase after P.06 is post-launch verification.
- **P.11 (30-day review) is calendar-gated** — exactly 30 days after P.06, not after P.10b.

The parallelizable item: **M.03 (native Spanish review)** can run alongside any other M phase from the moment Erick is available.

---

## 7. Defaults locked at draft time (Chat called these on the user's behalf)

The user did not answer the 6 clarifying questions raised in the draft chat; these defaults were applied. Listed here so they're discoverable, not buried.

1. **Phase 2.17 / ServiceM8 dropped permanently from the plan.** The webhook endpoint, signature verification, feature flag, and Sanity event queue all remain in code (shipped in Phase 2.13) and stay flag-gated off. If Erick ever adopts ServiceM8 post-launch, the path is: populate `SERVICEM8_WEBHOOK_SECRET`, flip `SERVICEM8_ENABLED=true`, and a small Code phase wires the queue consumer. No reshaping of this plan needed.
2. **Spanish `[TBR]` strip (B.01) before native review (M.03).** Preview stops looking half-finished immediately. Erick reviews against clean text, not flagged text.
3. **Codex review (M.11) is a User-triggered phase.** User runs Codex against the repo, pastes findings back into Chat, Chat writes a Code prompt for fixes. Cosmetic/style-only findings are dropped + logged.
4. **Handover doc at M.12 (first draft) + P.10b (final pass).** First draft happens at the end of Bucket M so Erick can start using it as soon as he gets access. Final pass after launch fills in any production-only links.
5. **Mautic (M.07) is non-blocking.** Marked explicitly: launch can ship without it. Sanity captures every lead durably; Mautic flips on the day you have the server.
6. **Bucket B ordering** prioritizes fastest visible-quality wins first (TBR strip, legal pages, SEO foundation) → small isolated improvements (newsletter unsubscribe, revalidate webhook, rate-limiter swap) → wizard polish last (autocomplete + photo upload, which can wait for Places API).

If any of the above needs flipping, log a decision in `Sunset-Services-Decisions.md` and update the relevant row.

---

## 8. What changed vs `Sunset-Services-Phase-Plan.md`

For traceability.

**Numbering scheme changed.** The original plan was `Part-X-Phase-YY-Role.md`. Continuation phases are `Phase-B-NN-Role.md` / `Phase-M-NN-Role.md` / `Phase-P-NN-Role.md`. Completion reports still land in `src/_project-state/`.

**Dropped from the original plan:**
- Phase 2.17 (Automation agent Part B — on-demand ServiceM8 portfolio publish) — Erick hasn't adopted ServiceM8; webhook + flag remain in code, no active automation work.
- Phase 2.18 happens before this Continuation kicks in (the QA sweep that closes Part 2).

**Reshuffled forward into Bucket M:**
- Phase 2.04 → M.01
- Phase 2.12 → M.03
- Phase 2.13.2 + 2.14 → M.04
- Phase 2.14a → M.04a
- Phase 2.16's daily reviews cron leg → M.05

**Reshuffled forward into Bucket P (old Part 3 mapping):**
- Old 3.01 (Performance) → M.02 *(moved into Bucket M because it depends on M.01 photos)*
- Old 3.02 (Accessibility) → B.06
- Old 3.03 + 3.04 (Legal design + code) → B.02 + B.03
- Old 3.05 (Schema validation) → B.04
- Old 3.06 (Sitemap/robots/hreflang) → B.05
- Old 3.07 (301 redirects) → P.04
- Old 3.08 (Brand consistency / NAP) → P.09
- Old 3.09 (SSL fix on old site) → **dropped** as a phase (becomes moot at P.06 cutover; left as a parallel-track Cowork task in Bucket M if visible damage gets worse)
- Old 3.10 (Vercel Pro upgrade) → P.01
- Old 3.11 (Cloudflare DNS prep) → P.02
- Old 3.12 (Pre-cutover QA) → P.05
- Old 3.13 (DNS cutover) → P.06
- Old 3.14 (Production verification) → P.07
- Old 3.15 (Search Console + Bing) → P.08
- Old 3.16 (Sanity handover to Erick) → folded into M.12 + P.10b
- Old 3.17 (Post-launch monitoring) → P.10
- Old 3.18 (30-day review) → P.11

**Added (new in Continuation):**
- B.07 — Newsletter unsubscribe page (was a "small follow-up" note in `current-state.md`)
- B.08 — Sanity → site instant revalidate webhook (was a "future phase" note in `current-state.md`)
- B.09 — Chat rate-limiter swap to Vercel KV / Upstash (was a "must do before P.06" carryover from Phase 2.09)
- B.10 — Address autocomplete on quote wizard Step 4 (was deferred mini-phase 2.13.3)
- B.11 — Photo upload on quote wizard Step 3 (was deferred D11=B slot)
- M.07 — Mautic install + flip flag (was a parallel-track item with no real phase)
- M.08 — Personal-to-Erick swap pass (was a "swap before launch" checklist, no phase)
- M.09 — Integration smoke test (was implied by P.05, now explicit and earlier so issues surface before publishing)
- M.10 — User-tests-site walkthrough (was implied by Phase 2.18, now explicit + iterative)
- M.11 — Codex code review (new — was not in the original plan at all)
- M.12 — Erick handover doc first draft (split out from old 3.16)
- P.10b — Handover doc final pass (split out from old 3.16)

---

## 9. What's next

`Sunset-Services-Project-Instructions.md` and `Sunset-Services-Plan.md` are still authoritative and unchanged. This Continuation plan supersedes the Part 3 section of `Sunset-Services-Phase-Plan.md` and adds the missing pieces.

When Phase 2.18 closes and its completion report lands in `src/_project-state/`, Claude Chat opens **Phase B.01 — Strip `[TBR]` from Spanish surfaces**: produces the `Phase-B-01-Code.md` prompt file, with the "Why this matters" line up top and no user-facing sections, per `Sunset-Services-Project-Instructions.md` §6.

Tell me when Phase 2.18 is closed and we kick off Phase B.01.
