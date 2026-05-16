# Phase B.03 Completion Report

**Phase:** Phase B.03 — Code — Legal pages (Privacy + Terms), Consent Mode v2 banner + modal, Termly iframe embed (Path B).
**Date:** 2026-05-16 (final pass; see Decisions log for full multi-pass history).
**Branch:** `claude/competent-mahavira-5bb2bf` (worktree of `main`, merged back).
**Outcome:** **Shipped.** All four legal routes SSR-verified — `/privacy/` (EN) renders the real Termly iframe embed; `/es/privacy/`, `/terms/`, `/es/terms/` render the brand-styled "Legal content is being prepared" fallback by design (Cowork hasn't provided the 3 remaining doc IDs yet).

---

## Headline

Phase B.03 ships the Privacy + Terms page chrome, the granular Consent Mode v2 cookie banner + 4-category preferences modal, and the Termly iframe embed wiring (Path B). All four legal routes SSR-verified — `/privacy/` (EN) renders the real Termly iframe; `/es/privacy/`, `/terms/`, `/es/terms/` render the brand-styled "Legal content is being prepared" fallback by design until Cowork provides the 3 missing Termly doc IDs.

An earlier in-phase attempt (local-HTML rendering) was reverted before this final state shipped. The multi-pass decision audit lives in `Sunset-Services-Decisions.md` under the 2026-05-15 and 2026-05-16 entries for B.03 / B.03b / B.03c / B.03d.

---

## Vendor + plan

| Field | Value |
|---|---|
| Vendor | Termly (free plan) |
| Recurring monthly cost | $0 |
| Plan limits | 1 legal policy, 1 language, HTML/iframe embed only |
| Branding | "Powered by Termly" visible inside the embed (cannot be removed on free plan) |
| Documented upgrade path | Termly Pro+ ~$14.50/mo unlocks unlimited policies + multilingual + branding removal |
| Account email | Project's primary email (same as Vercel/Sanity/Resend/Anthropic) |

**Documents:**

| Document | Language | State |
|---|---|---|
| Privacy Policy | English | Published — embedded on `/privacy/` |
| Privacy Policy | Spanish | Not provisioned (free-plan limit) |
| Terms & Conditions | English | Not provisioned (free-plan limit) |
| Terms & Conditions | Spanish | Not provisioned (free-plan limit) |

**Captured IDs** — written to `.termly-ids.txt` at repo root (gitignored): `TERMLY_WEBSITE_ID` + `TERMLY_PRIVACY_EN_ID`. The other 3 stay pending until Cowork's finish-up phase or a Pro+ upgrade.

---

## What this phase shipped

| File | Action |
|---|---|
| `src/components/legal/TermlyPolicyEmbed.tsx` | Mounts the Termly iframe embed (`<div name="termly-embed" data-id={docId} data-type="iframe" data-website-id={websiteId}>` + `next/script` loading `app.termly.io/embed-policy.min.js`). Env-var-gated fallback to the brand-styled "Legal content is being prepared" card when the per-locale doc ID is empty. |
| `src/components/legal/LegalPageBody.tsx` | Single-column body wrapper around `<TermlyPolicyEmbed>`. No TOC sidebar (Option A — Path B's iframe boundary makes cross-origin scroll-spy infeasible). |
| `src/components/legal/LegalPageHero.tsx` | Compact utility hero — breadcrumb + H1 + "Last updated" subtitle. |
| `src/app/[locale]/privacy/page.tsx` | `/privacy/` + `/es/privacy/` routes (SSG). |
| `src/app/[locale]/terms/page.tsx` | `/terms/` + `/es/terms/` routes (SSG). |
| `src/components/analytics/ConsentBanner.tsx` | 3-button bottom-slide banner (Accept all / Reject all / Manage preferences) + Privacy link. |
| `src/components/analytics/ConsentPreferencesModal.tsx` | 4-category toggle modal (Necessary locked ON, Analytics, Marketing, Personalization). |
| `src/components/analytics/ConsentModeDefault.tsx` | Inline `<script>` in `<head>` emitting `gtag('consent','default',{…all 4 signals denied, wait_for_update: 500})` before GTM loads. |
| `src/components/analytics/GTMScript.tsx` | Loads GTM always; fires `gtag('consent','update',{…})` on every decision change. |
| `src/components/analytics/ClarityScript.tsx` | Gated on `signals.analytics`. |
| `src/lib/analytics/consent.ts` + `src/types/consent.ts` | 4-category consent state schema; persists to `localStorage['sunset_consent_v2']`; one-time migration from `sunset_consent_v1`. |
| `src/hooks/useConsent.ts` | `useSyncExternalStore`-based hook (React 19 best practice). |
| `src/lib/analytics/dataLayer.ts` | Per-event-category signal-aware `pushDataLayer` gate. |
| 26 new EN copy keys + 26 ES mirror | `chrome.consent.{banner,modal}.*` + `legal.*` namespaces. ES first-pass `usted` register, flagged for M.03 native review. |
| `.env.local.example` | Documents the 5 `NEXT_PUBLIC_TERMLY_*_ID` env vars + the 4 Consent Mode v2 wiring vars. |
| `scripts/test-consent-mode-v2.mjs` | 23 assertions across 6 specs (v1 migration, accept/reject/per-category consent_update payloads, DM-1 personalization mapping, pushDataLayer gating). All pass. |

---

## Env vars

`.termly-ids.txt` at the project root contains 2 of 5 IDs (`TERMLY_WEBSITE_ID` + `TERMLY_PRIVACY_EN_ID`). Cowork's finish-up hasn't landed the other 3 yet.

| Var | Vercel state | Local mirror | Source-of-truth value |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_TERMLY_WEBSITE_ID` | populated (env-var id `gDmL9bWsmwK6gQWL`, Production + Preview, plain) | `.env.local` updated | `b722b489-62a2-4e5a-9510-e6466f804c69` |
| `NEXT_PUBLIC_TERMLY_PRIVACY_EN_ID` | populated (env-var id `SRl4LL06YQVb5CAa`, Production + Preview, plain) | `.env.local` updated | `13687462` |
| `NEXT_PUBLIC_TERMLY_PRIVACY_ES_ID` | absent | `.env.local` empty | not provided yet |
| `NEXT_PUBLIC_TERMLY_TERMS_EN_ID` | absent | `.env.local` empty | not provided yet |
| `NEXT_PUBLIC_TERMLY_TERMS_ES_ID` | absent | `.env.local` empty | not provided yet |

Values on Vercel verified to exact-match `.termly-ids.txt` via the Vercel REST API (decrypted env list). No drift. The 3 absent vars stay absent → those routes render the fallback by design.

`.env.local.example` Termly block reflects the iframe path. `.env.local` at parent root mirrored — the 5 keys present with the 2 known values populated.

---

## TOC sidebar decision

**Option A — drop the TOC sidebar entirely.** Single-column body at all breakpoints.

Rationale: Path B (iframe) means we cannot walk Termly's headings — they live cross-origin in `app.termly.io`'s DOM. A dynamic scroll-spy TOC would depend on extracting h2/h3 ids from SSR-rendered static HTML, which the iframe path doesn't render. A static "On this page" stub (Option B) was considered and rejected — lower value than Option A's simplicity given Termly's iframe content can't be reliably anchored into.

No sidebar at all, no two-column grid. The body is `<section> > <div max-w-container> > <article className="prose"> > <TermlyPolicyEmbed>`.

---

## SSR verification

Preview deploy SHA `af94cea` went READY at `https://sunsetservices-ix6an6gbx-dinovlazars-projects.vercel.app/`. Verified via Vercel Protection Bypass automation token (`?x-vercel-protection-bypass=jenfA5yHCkDyYFDUjbkZNDEpZUJKzunr&x-vercel-set-bypass-cookie=samesitenone`, first request primes a cookie that subsequent requests reuse).

| Route | HTTP | Size | data-state | Termly embed div | Embed script | Fallback rendered |
| --- | --- | --- | --- | --- | --- | --- |
| `/privacy/` | 200 | 127 KB | `rendered` | ✅ `<div name="termly-embed" data-id="13687462" data-type="iframe" data-website-id="b722b489-62a2-4e5a-9510-e6466f804c69">` | ✅ `app.termly.io/embed-policy.min.js` | n/a |
| `/es/privacy/` | 200 | 132 KB | `fallback` | n/a | n/a | ✅ "El contenido legal se está preparando…" |
| `/terms/` | 200 | 127 KB | `fallback` | n/a | n/a | ✅ "Legal content is being prepared…" |
| `/es/terms/` | 200 | 132 KB | `fallback` | n/a | n/a | ✅ "El contenido legal se está preparando…" |

Zero TOC `<nav>` elements on any route, zero `<details>` accordions for legal content — Option A confirmed. The fallback strings appear once in each fallback-rendering route's HTML as visible body text; the embed script src + Termly embed div appear once on the EN privacy route only.

(Note: the next-intl messages bundle blob includes all translation strings inline in `<script>__NEXT_DATA__</script>`. A naive grep for the fallback string will match on routes where the fallback isn't actually rendered — checking against actual rendered DOM elements is required, which is what the table above does.)

**What this verifies + what it doesn't.** The SSR layer is correct on all four routes — wiring is shape-correct and Termly's script + embed div are present on the populated route. The cross-origin iframe boundary means the real Termly policy text only renders in a browser; that visual confirmation, plus Tag Assistant Consent Mode v2 validation and Lighthouse smoke, are user-driven and live with the handoff below.

---

## Verification: lint / types / build

| Check | Status | Notes |
| --- | --- | --- |
| `npm run lint` | ✅ 0 errors / 6 pre-existing warnings | No new warnings introduced. |
| `npx tsc --noEmit --skipLibCheck` | ✅ 0 errors in `src/components/legal/` | Pre-existing image-import errors in `src/data/imageMap.ts` + `src/data/team.ts` resolve at Vercel build via clean install. |
| `npm run build` (local) | ⚠ pre-existing prettier peer-dep failure | `@react-email/render` (via Resend) needs `prettier/plugins/html` + `prettier/standalone`. Not introduced by this phase. Verified via Vercel build instead. |
| Vercel Preview build | ✅ READY | SHA `af94cea`, ~50 sec from queue to READY. |

---

## B.02 reconciliation

The B.02 design handover specs reconcile to the shipped state as follows:

- **B.02 §2.4 TOC sidebar (desktop + mobile)** — **dropped** under the Path B reality (iframe rendering makes scroll-spy infeasible). Documented as the Option A choice above.
- **B.02 §2.5 Termly embed** — iframe embed pattern shipped (Path B).
- **B.02 §3.1 Termly CSS override block** — **not shipped**. Same-origin CSS cannot reach cross-origin iframe content. The selectors are unreachable under iframe rendering regardless of which class names Termly emits inside the iframe.
- **B.02 §3.1 Termly footer hide** — moot under iframe rendering (Termly's footer is inside the iframe, not styleable from the parent doc). The OQ-2 question is closed.
- **All other DMs / sections** — banner + modal + Consent Mode v2 wiring is on-spec. DM-1 (personalization → both `ad_user_data` + `ad_personalization`), DM-2 (default toggle state: Necessary ON locked + Analytics ON + Marketing OFF + Personalization OFF), and DM-3 (banner primary action color = green) all shipped as specified.

---

## Handoff to user

**Preview URL** (Vercel SSO is on for the team — Protection Bypass query string lets a browser session in without a Vercel login):
`https://sunsetservices-ix6an6gbx-dinovlazars-projects.vercel.app/?x-vercel-protection-bypass=jenfA5yHCkDyYFDUjbkZNDEpZUJKzunr&x-vercel-set-bypass-cookie=samesitenone`

After the first request the bypass cookie sticks, so direct navigation to the 4 routes works:
- `https://sunsetservices-ix6an6gbx-dinovlazars-projects.vercel.app/privacy/` — expect real Termly iframe content
- `https://sunsetservices-ix6an6gbx-dinovlazars-projects.vercel.app/es/privacy/` — expect ES fallback card
- `https://sunsetservices-ix6an6gbx-dinovlazars-projects.vercel.app/terms/` — expect EN fallback card
- `https://sunsetservices-ix6an6gbx-dinovlazars-projects.vercel.app/es/terms/` — expect ES fallback card

These pages are live on Production immediately after merge to `main` (the merge step + Production re-verification are in the "Production verification" section below).

**Tag Assistant Consent Mode v2 validation** (Chrome extension required — not Code-executable):
1. Install Tag Assistant Companion if not already (`https://tagassistant.google.com/`).
2. Open the Preview privacy URL above in Chrome with Tag Assistant attached.
3. Open the cookie banner if it doesn't auto-show. Test three flows:
   - **Accept all** → check Tag Assistant shows a `consent update` event with `analytics_storage=granted`, `ad_storage=granted`, `ad_user_data=granted`, `ad_personalization=granted`.
   - **Reject all** → check the same event fires with all four `=denied`.
   - **Manage preferences → toggle Analytics ON, leave others OFF → Save** → check the event fires with `analytics_storage=granted` and the other three `=denied`. Confirms DM-1 (personalization → both `ad_user_data` + `ad_personalization`) is wired correctly.
4. Verify GA4 hits only fire when `analytics_storage=granted`.

**Lighthouse smoke** (Chrome DevTools required — not Code-executable):
- Open `/privacy/` on Preview in incognito Chrome.
- Run Lighthouse on both desktop + mobile profiles.
- Expectation: ≥ 80 on all four pillars (Performance / Accessibility / Best Practices / SEO). Full 95+ pursuit is Phase B.06's scope; this is a smoke check that the iframe load doesn't tank scores.
- Capture the actual numbers in the next phase's notes if scores fall significantly under 80.

---

## In-phase decisions

- **TOC sidebar fate** — Option A (drop entirely). Path B (iframe) makes scroll-spy infeasible; a static stub (Option B) would be lower-value than the simplicity gain from removing the sidebar slot. Documented in the brief as the recommended option.
- **`legal.toc.heading` translation keys** — removed from both message files. No longer referenced after Option A. (`legal.embed.preparingFallback` retained — still drives the fallback gate.)
- **Client vs server component for TermlyPolicyEmbed** — chose client. The `Script` from `next/script` works in either, but `useLocale()` + `useTranslations()` are client hooks, and the env-var gate works naturally inside a client component.
- **Local `npm run build`** — could not run (pre-existing prettier peer-dep failure). Validated via Vercel Preview build instead. Not introduced by this phase; flagged for an unrelated cleanup phase.

---

## Production verification

Main HEAD `0e7e1a4` (merge commit `Merge branch 'claude/competent-mahavira-5bb2bf' into main`). Production deploy at `https://sunsetservices-qr91dtdwe-dinovlazars-projects.vercel.app/` went READY at 10:07 UTC (~60 sec build). Aliased prod domain `https://sunsetservices.vercel.app/` serves the same deploy.

SSR-verified via direct curl against the aliased prod domain (no bypass token needed — production isn't behind SSO):

| Route | HTTP | Size | data-state | Termly embed div | Embed script | Fallback rendered |
| --- | --- | --- | --- | --- | --- | --- |
| `/privacy/` | 200 | 127 KB | `rendered` | ✅ `data-id="13687462" data-type="iframe" data-website-id="b722b489-…"` | ✅ `app.termly.io/embed-policy.min.js` | n/a |
| `/es/privacy/` | 200 | 132 KB | `fallback` | n/a | n/a | ✅ ES "preparando" |
| `/terms/` | 200 | 127 KB | `fallback` | n/a | n/a | ✅ EN "preparing" |
| `/es/terms/` | 200 | 132 KB | `fallback` | n/a | n/a | ✅ ES "preparando" |

Production state matches Preview state exactly. Zero TOC `<nav>` elements on any route.

Phase B.03 is closed on the Code side. Browser-side verification (Tag Assistant Consent Mode v2 + Lighthouse smoke) sits with the user per the handoff section above.

---

## Definition of done

- ✅ B.02 reconciliation findings present (above)
- ✅ `src/components/legal/TermlyPolicyEmbed.tsx` mounts the Termly iframe embed pattern
- ✅ Dead CSS overrides absent from `TermlyPolicyEmbed.tsx`
- ✅ TOC sidebar decision applied (Option A — dropped entirely), documented
- ✅ Vercel env vars in correct state (2 populated and verified to match `.termly-ids.txt`; 3 stay empty by design since Cowork hasn't provided them)
- ✅ 4 legal routes SSR-verified — `/privacy/` renders embed, other 3 render fallback
- ⚠ `npm run build` local — pre-existing prettier peer-dep issue; Vercel build verified green
- ✅ `npm run lint` exits 0 with no new warnings
- ✅ TypeScript strict — 0 errors in `src/components/legal/`; no new `any` / `@ts-ignore`
- ✅ Completion report (this file)
- ✅ `Sunset-Services-Decisions.md` updated with 2026-05-16 entry
- ✅ `current-state.md` updated, Path B locked
- ✅ `file-map.md` updated — entries reflect Path B state
- ✅ Merged to main, Production deploy READY, Production SSR re-verified — see "Production verification" section above.

---

## Carryover

### To Cowork

1. **Provide the 3 missing Termly doc IDs** (`TERMLY_PRIVACY_ES_ID`, `TERMLY_TERMS_EN_ID`, `TERMLY_TERMS_ES_ID`) by appending to `.termly-ids.txt` at the project root. When those land, a tiny upsert phase populates them on Vercel and the 3 routes flip from fallback to real Termly iframe content. No code changes needed — the lookup function in `TermlyPolicyEmbed.tsx` already reads all 5 env vars per (type, locale).

### To the user

2. **Tag Assistant Consent Mode v2 validation** against the Preview URL (steps in the handoff section above).
3. **Lighthouse smoke** on `/privacy/` Preview, both desktop + mobile (steps in the handoff section above).
4. **Confirm the real Termly iframe content renders correctly in a browser** — the SSR layer is verified but the visual confirmation of `app.termly.io`'s rendered policy text is browser-side only.

### To Chat

5. **A future Pro+ upgrade ($14.50/mo) restores multi-policy + multilingual.** Until then, 3 of 4 legal routes stay on the brand-styled fallback. If/when the upgrade lands, the 3 missing IDs get populated and the existing iframe wiring picks them up — zero code change needed.

### To Code (no follow-up phase needed)

6. The iframe infrastructure is in place. When the 3 IDs land or a Pro+ upgrade unlocks more content, no code changes — just env var populate.

---

## What's launch-ready and what's not

- **`/privacy/` (EN):** launch-ready pending the user's browser-side Tag Assistant + Lighthouse smokes. The SSR layer + iframe wiring are correct; visual rendering happens cross-origin in the iframe.
- **`/es/privacy/`, `/terms/`, `/es/terms/`:** stay on the graceful "Legal content is being prepared" fallback by design. Launch-ready as fallback — visitors see the brand-styled card, not a broken empty embed. They flip to real Termly content as soon as Cowork provides the 3 remaining doc IDs (or a Pro+ upgrade unlocks them).

The user's reduced-scope launch (Privacy EN only on real Termly content; the other 3 on fallback) is supported.

---

Earlier per-pass completion reports (B.03 original, B.03b Cowork setup, B.03c local-HTML attempt) were consolidated into this file on 2026-05-16. The full multi-pass decision audit lives in `Sunset-Services-Decisions.md` under the 2026-05-15 and 2026-05-16 entries.
