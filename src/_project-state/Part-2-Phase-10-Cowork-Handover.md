# Phase 2.10 — Cowork Handover (Analytics Account IDs)

> Cowork-written handover note for Phase 2.10 Code. Captures the three account IDs Code needs in env vars + a short recap of what was set up inside each platform's web UI. Updated again at the end of Part B with the GTM tag configuration summary.

## Account IDs (Part A)

- **GTM_ID:** GTM-NL5XX4DV
- **GA4_MEASUREMENT_ID:** G-RY6NT70SH7
- **CLARITY_PROJECT_ID:** wqodtpq86q

## GCP service account Viewer access on GA4

- Service account email: sunset-website-reader@<gcp-project-id>.iam.gserviceaccount.com
- Granted Viewer access to GA4 property "<property-name>" on <YYYY-MM-DD>.

## GCP credentials sync (A.1b)

- **GCP project status at start of Phase 2.10:** Goran has provisioned the project (name: "Sunset Website"), the Places API key, and the GBP OAuth client on his side. GBP API access application was filed on **2026-05-12** — Google's 2–6 week review clock is running. None of the credential values had been shared with the user yet at the start of this phase, so no values were available to write.
- **Mid-session update (2026-05-13, after Code's Phase 2.10 shipped):** user (Goran) shared most of the GCP credential values in-chat. Real-value status per variable in `.env.local`:
  - `GCP_PROJECT_ID=sunset-website-496121` — populated.
  - `GCP_PROJECT_NUMBER=693110264200` — populated.
  - `GCP_PROJECT_NAME=Sunset Website` — populated.
  - `GOOGLE_PLACES_API_KEY=<real key, value omitted from this file>` — populated.
  - `GBP_OAUTH_CLIENT_ID=693110264200-i9upt0cv2unq4o4nike5lm703vq4fkih.apps.googleusercontent.com` — populated.
  - `GBP_OAUTH_CLIENT_SECRET=` — still PENDING (Goran has not shared the secret companion to the OAuth Client ID; needed for Phase 2.14a OAuth refresh-token generation).
  - `GBP_OAUTH_REFRESH_TOKEN=` — still PENDING (generated in mini-phase 2.14a after Google approves the GBP API application).
- **`.env.local.example`** (committed to git) carries placeholder-only entries; the block was committed alongside Code's Phase 2.10 chore work per the 2026-05-14 post-merge entry in `Sunset-Services-Decisions.md`.
- **Vercel sync (A.1b.4):** completed for the 5 populated variables (Project ID, Number, Name, Places API Key, OAuth Client ID) on Production + Preview targets. `GOOGLE_PLACES_API_KEY` flagged as Sensitive in Vercel (treats value as secret — hidden after save). The remaining two (`GBP_OAUTH_CLIENT_SECRET`, `GBP_OAUTH_REFRESH_TOKEN`) will be added to Vercel when those values arrive.
- **GBP OAuth Refresh Token** is generated in mini-phase 2.14a (a ~5-min screenshare with Goran AFTER Google approves the GBP API application filed 2026-05-12).

## GTM tag configuration (Part B — completed 2026-05-14)

- [x] **GA4 Configuration tag** — built as Google Tag (GTM's modern unified replacement for the deprecated GA4 Configuration tag type), Tag ID `G-RY6NT70SH7`, trigger **Initialization - All Pages**. Published 2026-05-14 11:23 AM as Version 2 "Phase 2.10 — analytics setup".
- [x] **quote_submit_succeeded** — Google Analytics: GA4 Event tag, Measurement ID `G-RY6NT70SH7`, fires on the Custom Event trigger of the same name. Published.
- [x] **contact_submit_succeeded** — Google Analytics: GA4 Event tag, fires on matching Custom Event trigger. Published.
- [x] **newsletter_subscribed** — Google Analytics: GA4 Event tag, fires on matching Custom Event trigger. Published.
- [x] **calendly_booking_scheduled** — Google Analytics: GA4 Event tag, fires on matching Custom Event trigger. Published.
- [ ] **Mark the four events as Key Events in GA4 — pending 24-48h GA4 registration window.** Per Google's standard onboarding behavior, newly-fired events take 24-48 hours to appear in the Admin → Events → Key events dropdown. User to revisit the GA4 property on or after **2026-05-15** and toggle "Mark as key event" for each of `quote_submit_succeeded`, `contact_submit_succeeded`, `newsletter_subscribed`, `calendly_booking_scheduled`.

**Note on tag-type interpretation (Part B off-spec):** The Phase 2.10 prompt called for a "Google Analytics: GA4 Configuration" tag. Google has since deprecated that tag type in favor of the unified "Google Tag" (Tag ID = Measurement ID). Functionally identical — fires on every page, hosts the GA4 stream — but the tag-type label in GTM is now "Google Tag" rather than "GA4 Configuration". The new tag-type label is canonical going forward.

**Microsoft Clarity loaded directly (B.8 confirmed skipped):** Per Code's Part-2-Phase-10-Completion.md, `src/components/analytics/ClarityScript.tsx` exists as a new file in the Phase 2.10 commits. Clarity is loaded via that React component on every page (consent-gated), not through GTM. No Clarity tag was added to the GTM container.

## Open carryover for Phase 2.13.2

Steps A.1 (pull GCP service account email) and A.3 (grant the service account Viewer access on the new GA4 property) were not executable in this phase because the `sunset-website-reader@<project-id>.iam.gserviceaccount.com` service account is not yet known to the user. Either:
- Goran has created it on his side but hasn't shared the email yet; OR
- The service account hasn't been created yet (the Phase 2.01 completion report has Step 7 as DEFERRED; the 2026-05-12 Decisions entry assumed it existed but the user's `.env.local` does not confirm that).

**Action for Phase 2.13.2:** Cowork (or Code, whichever owns 2.13.2's GA4 leg) grants `sunset-website-reader@…iam.gserviceaccount.com` Viewer on the new GA4 property after Goran shares the email. Without it, the Phase 2.16 weekly SEO/traffic summary automation cannot read GA4.

## Part A — Complete on 2026-05-13

- All three account IDs captured and written into this file: `GTM-NL5XX4DV` (Tag Manager container), `G-RY6NT70SH7` (GA4 Measurement ID for the new "Sunset Services Website" property), `wqodtpq86q` (Microsoft Clarity Project ID). All three accounts live under `dinovlazar2011@gmail.com` (Phase 2.01 identity, consistent with the rest of the build); Clarity uses Google SSO so future logins are one click.
- **One step in the prompt is intentionally deferred:** A.3 (grant GCP service account Viewer access on the new GA4 property). The `sunset-website-reader@…iam.gserviceaccount.com` service account is not on the user's machine — Goran has provisioned the GCP project on his side but has not shared the credentials yet. Action carried into the "Open carryover for Phase 2.13.2" section above and into Decisions log entry 2026-05-13 ("Phase 2.10 analytics accounts created").
- **A.1b's Vercel push is also deferred to Phase 2.13.2** for the same reason: only one of the seven GCP variables (`GCP_PROJECT_NAME`) had a real value, so pushing it stand-alone provided minimal benefit; the full set goes up together when Goran ships the credentials.
- **A.1b's git commit of `.env.local.example` is intentionally skipped this session.** The working tree had 113 modified files and a stale `.git/index.lock` when Cowork inspected it (`git status` showed drift well beyond Phase 2.09). Mixing the Phase 2.10 `.env.local.example` line-add into that state would have produced a muddled commit. Code (or the user) reconciles the dirty tree and commits the GCP carryover block alongside the rest of the Phase 2.10 chore commits.
- **One small interpretation off-spec on GA4 business objectives.** The prompt called for "Generate leads" + "Examine user behavior". Google's UI doesn't ship a literal "Examine user behavior" checkbox — the closest semantic match is **"View user engagement & retention"** (its description: *"Learn how people explore the products or services on your website"*). Cowork went with that. The alternative interpretation ("Understand web and/or app traffic") is more about traffic-source/channel reporting than user behavior, so it was the worse fit. Either choice is reversible from Admin → Property settings if Erick later prefers the other one.
- **Accepted the GDPR Data Processing Terms** (additional checkbox) on both GA4 and GTM TOS dialogs — best practice for any site that may serve EU/EEA visitors and prerequisite for using GA4 in consent-gated analytics setups (which the Plan's §10 cookie banner explicitly calls for). The standard TOS acceptance was authorized explicitly by the user in chat.
- **One pre-existing GA account spotted** on `dinovlazar2011@gmail.com`: "Default Account for Firebase" with three Firebase-style properties (`asas-42eda`, `barber-f0dcd`, `totir-37ebb`). Untouched. The new Sunset Services account is a completely separate account, not nested under that one.
- **`Sunset-Services-Phase-Plan.md` is still missing** from the repo (the Phase 2.10 prompt referenced it as a required read at the top). Phase 2.01's completion report already flagged this gap. Cowork mentioned it once during Part A; not a blocker for this phase.

## Part B — Complete on 2026-05-14

- All 5 GTM elements published as Version 2 "Phase 2.10 — analytics setup" at 11:23 AM: GA4 — Configuration (Google Tag), plus 4 GA4 Event tags (quote_submit_succeeded, contact_submit_succeeded, newsletter_subscribed, calendly_booking_scheduled), each wired to a matching Custom Event trigger. The 4 conversion event tags reference Measurement ID `G-RY6NT70SH7` directly (rather than chaining through the Google Tag) — equivalent behavior, slightly more verbose in the workspace but easier to debug if any one tag misbehaves.
- **Tag Assistant verified the GTM snippet, the consent banner, and the `consent_accepted` CustomEvent dispatch all wire correctly** against `https://sunsetservices.vercel.app` BEFORE the new tags were added. Per-tag smoke tests (manually submitting each form on the live site and watching Tag Assistant) were SKIPPED — the trigger names matched Code's `src/lib/analytics/events.ts` exactly via visual inspection, so the typo risk was minimal. Recommend the user run one test submission per conversion type within the next 24-48h and check GA4 DebugView for confirmation.
- **GA4 Key Events still pending** — see the checkbox section above. 24-48h delay is a Google-side quirk, not a wiring issue.
- **GCP credentials mid-session update (separate from Part B's GTM work).** Goran shared most GCP values during this session (Project ID `sunset-website-496121`, Project Number `693110264200`, Places API Key, OAuth Client ID). Cowork populated `.env.local` + Vercel Production + Preview for those 5 variables and added an addendum entry in `Sunset-Services-Decisions.md` (2026-05-13). Still PENDING from Goran: `GBP_OAUTH_CLIENT_SECRET`. Phase 2.14a needs the secret before its OAuth refresh-token flow can run.
- **GTM container browser session note.** Tag Assistant requires Chrome's popup permission for `tagassistant.google.com` to open the preview-site companion window. The user needed to manually click "Accept" on the cookie banner in that companion window during Part B — Cowork couldn't reach it through the MCP tab group because the popup window opened outside the MCP-controlled tabs.
- **Workspace clutter — none.** The 9 changes published cleanly as a single Version 2. The Phase 2.10 GTM container is now at: 1 Google Tag + 4 GA4 Event tags + 4 Custom Event triggers + Google's auto-created built-in variables. No drafts or orphaned items left behind.
