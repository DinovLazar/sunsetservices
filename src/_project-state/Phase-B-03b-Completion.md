# Phase B.03b — Cowork — Legal account setup + Privacy Policy generation

**Date completed:** 2026-05-15
**Executor:** Cowork
**Status:** Closed with reduced scope (3 of 4 original deliverables deferred).

---

## Summary

Phase B.03b opened expecting to deliver four legal documents on iubenda (Privacy EN, Privacy ES, Terms EN, Terms ES) with multilingual coverage at roughly $5-10/month per the phase brief's estimate. During execution, Cowork's pricing-page read showed iubenda's cheapest multilingual plan is $24.99-27.99/mo — 3-4x the estimate. User redirected the phase mid-execution to **Termly free plan with English Privacy Policy only**. The remaining three deliverables are deferred to a future upgrade.

The deliverable that **did** ship: one Termly-hosted Privacy Policy in English, published, with all the third-party services from the phase brief disclosed (Resend, Sanity, Vercel + Vercel Analytics, Google Tag Manager, Google Analytics 4, Microsoft Clarity, Anthropic API, Calendly) and GDPR + CCPA blocks enabled.

The decision-trail entry is logged in `Sunset-Services-Decisions.md` under `2026-05-15 — Phase B.03b — iubenda decision re-reversed back to Termly (free plan, reduced scope)`.

---

## Account & plan

| Field | Value |
|---|---|
| Vendor | Termly (re-reversed from iubenda; see Decisions log) |
| Account email | Same as Vercel/Sanity/Resend/Anthropic project email (Google sign-up) |
| Plan chosen | **Free** ($0/month) |
| Plan limit hit | 1 legal policy, 1 language, HTML Format embed only |
| Branded with "Powered by Termly" | Yes (cannot remove on free plan) |
| Recurring monthly cost | **$0** |
| Documented upgrade path | Termly Pro+ €13.50/mo annual (~$14.50/mo USD) unlocks unlimited policies, multilingual, removes branding, exposes Code Snippet + URL embeds. Decision deferred. |

---

## Website entry

| Field | Value |
|---|---|
| Name | Sunset Services |
| URL | https://sunsetservices.us |
| Primary language | English |
| Secondary language | _Not added_ (free plan is single-language) |

---

## Documents

| Document | Language | State | Status |
|---|---|---|---|
| Privacy Policy | English | Published | ✅ Delivered |
| Privacy Policy | Spanish | — | ⏸ DEFERRED |
| Terms & Conditions | English | — | ⏸ DEFERRED |
| Terms & Conditions | Spanish | — | ⏸ DEFERRED |

### Privacy Policy details

- **Data controller block.** Sunset Services, 1630 Mountain St, Aurora, IL 60505, USA. Email `info@sunsetservices.us`. Phone `(630) 946-9321`.
- **Personal data disclosed.** Names, phone numbers, email addresses, mailing addresses (the four standard CCPA-customer-records categories the quote/contact forms collect), plus two custom entries: "Project descriptions and photos for landscaping quote requests" and "Conversation transcripts from AI chat assistant".
- **CCPA categories selected as Collected + Disclosed.** Customer Records, Identifiers, Internet Activity, Geolocation. The others (Characteristics, Consumer Data, Biometric Data, Sensory Data, Professional/Employment, Education, Inferences) — none selected.
- **Third parties disclosed by name.** AI Platforms → Anthropic. Cloud Computing Services → Vercel. Web & Mobile Analytics → Google Analytics, Microsoft Clarity, Vercel Analytics. "Other" custom rows → Resend (transactional email), Sanity (CMS/database), Google Tag Manager (tag management), Calendly (consultation booking). All eight services from the phase brief covered.
- **User-rights blocks enabled.** GDPR (with Standard Contractual Clauses for international transfers to US-hosted servers) and CCPA (with US state-laws-all opt-in for forward coverage of future state privacy laws).
- **AI disclosure.** "AI bots" function selected; Anthropic listed as the AI platform.
- **Effective date.** 2026-05-15.

---

## Captured IDs

Written to `C:\Users\user\Desktop\SunSet-V2\.termly-ids.txt` (gitignored):

```
TERMLY_WEBSITE_ID=<gitignored>
TERMLY_PRIVACY_EN_ID=<gitignored>
```

Actual numeric/UUID values live only in the gitignored file. `.gitignore` was updated to cover `.termly-ids.txt`.

Note: only 2 IDs captured (vs. the phase brief's 5-6 line format) because the other docs were not generated. The keys for the deferred docs (`TERMLY_TERMS_EN_ID`, `TERMLY_PRIVACY_ES_ID`, `TERMLY_TERMS_ES_ID`) intentionally do not appear — adding empty values would mislead B.03c into thinking the slots are wired.

---

## Verification

| Item | Result |
|---|---|
| Termly account exists, plan active | ✅ Yes (free plan, not a trial — no expiration) |
| Website entry for `sunsetservices.us` created with EN primary | ✅ Yes (ES secondary skipped per free-plan limit) |
| Privacy Policy is in Published state | ✅ Yes (confirmed via dashboard preview showing rendered policy + "Last updated May 15, 2026") |
| Direct iubenda/Termly URLs render in incognito | ⚠️ **N/A on free plan** — Termly free does not expose a public URL for the policy (URL embed is Pro+ paywalled). Verification was performed via the dashboard preview instead. |
| `.termly-ids.txt` exists at repo root with correct format | ✅ Yes |
| `.termly-ids.txt` is gitignored | ✅ Yes (one line appended to `.gitignore`) |
| `Sunset-Services-Decisions.md` updated with re-reversal entry | ✅ Yes |
| `src/_project-state/Phase-B-03b-Completion.md` written | ✅ This file |

---

## In-phase surprises and decisions

1. **iubenda pricing reality.** Phase brief estimated $5-10/month for "Essentials or Pro tier covering 2 docs multilingual". Reality: iubenda Essentials is single-language only ($5.99/mo annual). The cheapest iubenda plan that covers multilingual is **Advanced at $24.99/mo annual / $27.99/mo monthly** — meaningfully above estimate. User pivoted to Termly free in response.

2. **Re-reversed a same-day decision.** The 2026-05-15 "iubenda chosen over Termly" decision (logged in `Sunset-Services-Decisions.md`) is re-reversed by today's same-day pivot. Audit-trail integrity preserved via a new dated entry rather than editing the prior one.

3. **Termly free plan is much more restrictive than the phase brief implied.** Specifically: only 1 policy total (not 1 policy per document type), only 1 language, HTML Format embed ONLY (Code Snippet and URL both paywalled at Pro+), Termly branding cannot be removed. The phase brief had treated "free plan" as a usable fallback for the original 4-document scope — in reality it covers ~25% of that scope.

4. **No public URL means B.03c's wiring approach changes.** B.03's Code originally built the codebase to load Termly via Code Snippet or URL embed (per the existing `.termly-embed-wrap` selectors and `NEXT_PUBLIC_TERMLY_*_ID` env vars). On free plan there is no URL to point those env vars at — Code Snippet would also work but is Pro+ only. B.03c must choose between (a) **embed via static HTML** — copy the Termly-generated HTML into the codebase as a static asset and render it inside the existing `.termly-embed-wrap` container; the env var becomes irrelevant for this slot; or (b) **upgrade to Pro+ before B.03c** — $15/mo unlocks URL embed and the original env-var-flip wiring works as designed. Decision deferred to B.03c.

5. **B.03 Code's Termly assumption turned out to be correct.** Earlier today's iubenda decision implied B.03c would need to swap from Termly to iubenda selectors/env vars in the codebase. With the re-reversal back to Termly, that swap is no longer needed — B.03 Code's existing Termly wiring is now back in alignment with the chosen vendor. Net effect: **B.03c is smaller than it would have been**.

6. **Phone-type dropdown is a country-code selector.** A small UX surprise during data entry — the "Select..." dropdown next to the Phone Number field in iubenda's Business Information form is the country dialing-code picker (US +1, UK +44, etc.), not a phone-type picker (Mobile/Work/Home). Selected United States +1.

7. **Google Places autocomplete saved time.** Typing "1630 Mountain St" into the Address field surfaced "1630 Mountain Street, Aurora, IL, USA" as the top suggestion, and selecting it auto-populated Country, State, City, and ZIP. The phase brief had us entering each field individually.

---

## Out of scope and explicitly NOT touched (per the phase brief)

- Vercel environment variables — left untouched. B.03c will read `.termly-ids.txt` and populate the env vars there.
- Codebase — no changes. B.03c handles all code touch-points.
- Tag Assistant Preview validation of Consent Mode v2 — B.03c verification step.
- `Sunset-Services-TRANSLATION_NOTES.md` — no changes (no Spanish doc was generated, so no translation notes to add).
- Termly account cleanup — N/A; account is the live one being used.

---

## Handoff to B.03c

B.03c is now smaller than originally scoped because the iubenda re-direction never landed in code. Suggested B.03c shape:

1. Read `.termli-ids.txt` to populate `NEXT_PUBLIC_TERMLY_WEBSITE_ID` and `NEXT_PUBLIC_TERMLY_PRIVACY_EN_ID` Vercel env vars (Preview + Production).
2. Decide between **static-HTML-embed path** or **Pro+ upgrade path** for the Privacy EN slot. Recommend the static-HTML path for minimum cost — it's a one-time copy/paste from Termly's "HTML Format" tab into a Next.js component (`src/app/[locale]/privacy/page.tsx` or a sibling).
3. The other three legal-page slots (Privacy ES, Terms EN, Terms ES) should keep rendering the existing "Legal content is being prepared" placeholder shipped in B.03. Add a comment in the slot wiring noting these are intentionally placeholder-state until a Pro+ upgrade unlocks them.
4. Tag Assistant Preview verification of Consent Mode v2 — confirm GA4 + Ads templates honor the four signals after Privacy EN is wired.
5. Update `Sunset-Services-Decisions.md` with B.03c's in-phase choice (static HTML vs. Pro+) and any code-side surprises.

---

**Completion report path:** `src/_project-state/Phase-B-03b-Completion.md`
