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
- **Added to `.env.local`** (gitignored) with real values: `GCP_PROJECT_NAME=Sunset Website`.
- **Added to `.env.local`** with blank PENDING values (variable names placed, values to be filled in Phase 2.13.2 when Goran ships them): `GCP_PROJECT_ID`, `GCP_PROJECT_NUMBER`, `GOOGLE_PLACES_API_KEY`, `GBP_OAUTH_CLIENT_ID`, `GBP_OAUTH_CLIENT_SECRET`, `GBP_OAUTH_REFRESH_TOKEN`.
- **Added to `.env.local.example`** (committed to git) with placeholder-only entries — no real values. Documents the shape Phase 2.13.2 will populate.
- **Vercel sync (A.1b.4):** PENDING. Only `GCP_PROJECT_NAME` has a real value, and project NAME alone is rarely consumed by code. Adding it stand-alone provides minimal value and risks confusion if other GCP vars stay absent. Decision: defer the Vercel push until Phase 2.13.2, when the full set of GCP variables will have real values to go in together. Tracked in the Decisions log.
- **Git commit of `.env.local.example` (A.1b.3):** SKIPPED. At Phase 2.10 A.1b execution time, `git status` showed 113 modified files in the working tree — far beyond the changes Cowork was making in this phase. A stale `.git/index.lock` was also present, blocking new writes. Cowork did not stage or commit anything to avoid mixing Phase 2.10 deltas with unrelated drift, and did not attempt to clear the lock without user awareness. Action for the user (or Code at the start of Phase 2.10 Code's prompt): reconcile the dirty working tree, clear the lock, and commit the GCP carryover block to `.env.local.example` as part of the Phase 2.10 chore commits.
- **GBP OAuth Refresh Token** is generated in mini-phase 2.14a (a ~5-min screenshare with Goran AFTER Google approves the GBP API application filed 2026-05-12).

## GTM tag configuration (Part B — filled in after Code ships)

- [ ] GA4 Configuration tag — All Pages trigger — fires on every pageview
- [ ] quote_submit_succeeded — GA4 event tag — marked as Key Event in GA4
- [ ] contact_submit_succeeded — GA4 event tag — marked as Key Event in GA4
- [ ] newsletter_subscribed — GA4 event tag — marked as Key Event in GA4
- [ ] calendly_booking_scheduled — GA4 event tag — marked as Key Event in GA4

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
