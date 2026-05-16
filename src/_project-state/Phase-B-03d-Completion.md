# Phase B.03d Completion Report

**Phase:** Phase B.03d — Code — revert B.03c's local-HTML rendering; restore Termly iframe embed (Path B); drop TOC sidebar; populate any remaining Termly env vars Cowork has captured.
**Date:** 2026-05-16.
**Branch:** `claude/competent-mahavira-5bb2bf` (worktree of `main`, merged back).
**Outcome:** **Shipped.** All four legal routes SSR-verified — `/privacy/` (EN) renders the real Termly iframe embed; `/es/privacy/`, `/terms/`, `/es/terms/` render the brand-styled "Legal content is being prepared" fallback by design (Cowork hasn't provided the 3 remaining doc IDs yet).

---

## Headline

B.03c shipped a local-HTML rendering architecture (read HTML files from `src/content/legal/` via `dangerouslySetInnerHTML`) that Chat had not authorized — Path B (Termly iframe) was the locked decision in `Sunset-Services-Decisions.md` (2026-05-15 "iframe path locked" entry). The static-HTML path forfeit Termly's auto-update + audit-trail value, which is the entire reason Termly was chosen over alternatives.

This phase rolls back to the iframe embed wiring that B.03 originally shipped, drops the TOC sidebar entirely (Option A in the brief — the iframe boundary makes a scroll-spy over Termly's headings impossible), and locks Path B as the legal-pages architecture.

**Implementation approach: forward-only rewrite, not `git revert`.** B.03c brought in several pieces of work that should stay (parent's untracked B.02 design handover docs, B.03b completion report, Phase Plan Continuation files, the four Decisions log entries, the Vercel env var population). A `git revert` of the B.03c merge would have rolled those back along with the local-HTML code. A forward-only rewrite gives one clean diff that touches only the local-HTML architecture.

---

## What rolled back (local-HTML)

| File | Action |
| --- | --- |
| [src/lib/legal/load-content.ts](../lib/legal/load-content.ts) | DELETED. The server-side loader that read `src/content/legal/${type}-${locale}.html` and detected placeholders via the `TERMLY_HTML_PLACEHOLDER` marker. No longer needed under iframe rendering. |
| [src/content/legal/privacy-en.html](../content/legal/privacy-en.html) | DELETED. The placeholder file with the HTML-export workflow + source Termly IDs. Empty `src/content/legal/` directory removed (cascade — no remaining contents). |
| [src/components/legal/LegalTocSidebar.tsx](../components/legal/LegalTocSidebar.tsx) | DELETED. The client component with IntersectionObserver scroll-spy + `aria-current="location"` active-link handling. Per Option A — under iframe rendering, Termly's headings live cross-origin in `app.termly.io`'s DOM and cannot drive a scroll-spy. The TOC was always a brand-styling nice-to-have; with iframe rendering it can't deliver its design intent at all. |
| `src/messages/en.json` `legal.toc.heading` | DELETED. The "On this page" label is no longer rendered anywhere. |
| `src/messages/es.json` `legal.toc.heading` | DELETED. Same — "En esta página". |

---

## What restored (iframe)

| File | Action |
| --- | --- |
| [src/components/legal/TermlyPolicyEmbed.tsx](../components/legal/TermlyPolicyEmbed.tsx) | REWRITTEN. Back to a `'use client'` component using `useLocale()` + `useTranslations('legal.embed')`. Mounts Termly's embed via `<div name="termly-embed" data-id={docId} data-type="iframe" data-website-id={websiteId}>` (the `name` attribute passed through React's `createElement` because React types disallow `name` on `div`s) + `<Script src="https://app.termly.io/embed-policy.min.js" strategy="afterInteractive">` from `next/script`. Fallback gate restored to env-var presence (the B.03 gate): when `lookupTermlyId(type, locale)` returns undefined, the component renders the brand-styled "Legal content is being prepared" fallback card with `data-state="fallback"`. When the env var is present, renders the embed div with `data-state="rendered"`. Dead CSS overrides removed entirely — the iframe boundary makes same-origin selectors unreachable, so the `.termly-embed-wrap *` typography rules B.03 originally shipped (and the B.03c rewrites to `.termly-policy-content *`) never had a chance of hitting cross-origin content. |
| [src/components/legal/LegalPageBody.tsx](../components/legal/LegalPageBody.tsx) | REWRITTEN. Single-column body. No grid, no sidebar, no `<details>` accordion. Pure `<section> → <div max-w-container> → <article className="prose"> → <TermlyPolicyEmbed type={type}>`. No longer needs the `locale` prop B.03c added — the client component picks up locale via `useLocale()`. |
| [src/app/[locale]/privacy/page.tsx](../app/[locale]/privacy/page.tsx) | MODIFIED. `<LegalPageBody type="privacy" />` (dropped the `locale={locale}` prop B.03c added). |
| [src/app/[locale]/terms/page.tsx](../app/[locale]/terms/page.tsx) | MODIFIED. Same — dropped the `locale={locale}` prop. |

---

## Env vars

`.termly-ids.txt` at the project root contained 2 of 5 IDs at execution time (`TERMLY_WEBSITE_ID` + `TERMLY_PRIVACY_EN_ID`). Cowork's B.03b finish-up hasn't landed the other 3 yet.

| Var | Vercel state | Local mirror | Source-of-truth value |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_TERMLY_WEBSITE_ID` | populated (env-var id `gDmL9bWsmwK6gQWL`, Production + Preview, plain) | `.env.local` updated | `b722b489-62a2-4e5a-9510-e6466f804c69` |
| `NEXT_PUBLIC_TERMLY_PRIVACY_EN_ID` | populated (env-var id `SRl4LL06YQVb5CAa`, Production + Preview, plain) | `.env.local` updated | `13687462` |
| `NEXT_PUBLIC_TERMLY_PRIVACY_ES_ID` | absent | `.env.local` empty | not provided yet |
| `NEXT_PUBLIC_TERMLY_TERMS_EN_ID` | absent | `.env.local` empty | not provided yet |
| `NEXT_PUBLIC_TERMLY_TERMS_ES_ID` | absent | `.env.local` empty | not provided yet |

**No upserts performed** — values already on Vercel from B.03c were verified to exact-match `.termly-ids.txt` via the Vercel REST API (decrypted env list). No drift. The 3 absent vars stay absent → those routes render the fallback by design.

`.env.local.example` Termly block rewritten to reflect the iframe path (was a "B.03c partial-populate" block referencing the static-HTML migration). `.env.local` at parent root mirrored — the 5 keys present with the 2 known values populated.

---

## TOC sidebar decision

**Option A — drop the TOC sidebar entirely.** Single-column body at all breakpoints.

Rationale documented in the brief: Path B (iframe) means we cannot walk Termly's headings — they live cross-origin in `app.termly.io`'s DOM. The dynamic scroll-spy TOC B.03c shipped depended on extracting h2/h3 ids from the SSR-rendered static HTML, which the iframe path doesn't render. A static "On this page" stub (Option B) was considered and rejected — lower value than Option A's simplicity given Termly's iframe content can't be reliably anchored into.

The empty `<aside aria-hidden="true">` placeholder slot B.03 originally shipped is also removed — no sidebar at all, no two-column grid. The body is now `<section> > <div max-w-container> > <article className="prose"> > <TermlyPolicyEmbed>`.

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
| `npm run lint` | ✅ 0 errors / 6 pre-existing warnings | Unchanged from B.03c. No new warnings introduced. |
| `npx tsc --noEmit --skipLibCheck` | ✅ 0 errors in `src/components/legal/` | Pre-existing image-import errors in `src/data/imageMap.ts` + `src/data/team.ts` (B.03c also noted these) — they resolve at Vercel build via clean install. |
| `npm run build` (local) | ⚠ pre-existing prettier peer-dep failure | Same as B.03c. `@react-email/render` (via Resend) needs `prettier/plugins/html` + `prettier/standalone`. Not introduced by this phase. Verified via Vercel build instead. |
| Vercel Preview build | ✅ READY | SHA `af94cea`, ~50 sec from queue to READY. |

---

## B.02 reconciliation

B.03c's completion report (lines 70–89 of `src/_project-state/Phase-B-03c-Completion.md`) already walks the full B.02 design handover and buckets each DM/section. That reconciliation stands — the only thing changing here is the legal page body + TOC implementation:

- **B.02 §2.4 TOC sidebar (desktop + mobile)** — B.03c implemented; B.03d **drops** under the Path B reality (iframe rendering makes scroll-spy infeasible). Documented as the Option A choice above.
- **B.02 §2.5 Termly embed** — B.03c switched to static-HTML; B.03d **restores** the iframe pattern (B.03 architecture).
- **B.02 §3.1 Termly CSS override block** — B.03c rewrote selectors to `.termly-policy-content`; B.03d **deletes the block entirely**. Same-origin CSS cannot reach cross-origin iframe content. The selectors are unreachable under iframe rendering regardless of which class names Termly emits inside the iframe.
- **B.02 §3.1 Termly footer hide** — moot under iframe rendering (Termly's footer is inside the iframe, not styleable from the parent doc). The OQ-2 question is closed.
- **All other DMs / sections** — banner + modal + Consent Mode v2 wiring is on-spec from B.03; B.03b decisions (DM-1 personalization grouping, DM-2 default toggle state, DM-3 banner primary green) are already shipped; nothing changes here.

---

## Handoff to user

**Preview URL** (Vercel SSO is on for the team — Protection Bypass query string lets a browser session in without a Vercel login):
`https://sunsetservices-ix6an6gbx-dinovlazars-projects.vercel.app/?x-vercel-protection-bypass=jenfA5yHCkDyYFDUjbkZNDEpZUJKzunr&x-vercel-set-bypass-cookie=samesitenone`

After the first request the bypass cookie sticks, so direct navigation to the 4 routes works:
- `https://sunsetservices-ix6an6gbx-dinovlazars-projects.vercel.app/privacy/` — expect real Termly iframe content
- `https://sunsetservices-ix6an6gbx-dinovlazars-projects.vercel.app/es/privacy/` — expect ES fallback card
- `https://sunsetservices-ix6an6gbx-dinovlazars-projects.vercel.app/terms/` — expect EN fallback card
- `https://sunsetservices-ix6an6gbx-dinovlazars-projects.vercel.app/es/terms/` — expect ES fallback card

These pages will also be live on Production immediately after merge to `main` (the merge step + Production re-verification are the last items of this phase).

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

- **Forward-only rewrite vs `git revert`** — chose forward-only. `git revert` of B.03c's merge would have rolled back the brought-in B.02 design handover, B.03b completion report, Phase Plan Continuation files, the Vercel env var population, AND the local-HTML code. A forward-only rewrite gives one clean diff that touches only the local-HTML architecture.
- **TOC sidebar fate** — Option A (drop entirely). Path B (iframe) makes scroll-spy infeasible; a static stub (Option B) would be lower-value than the simplicity gain from removing the sidebar slot. Documented in the brief as the recommended option.
- **`legal.toc.heading` translation keys** — removed from both message files. No longer referenced after Option A. (`legal.embed.preparingFallback` retained — still drives the fallback gate.)
- **Client vs server component for TermlyPolicyEmbed** — chose client (matches B.03 original). The `Script` from `next/script` works in either, but `useLocale()` + `useTranslations()` are client hooks, and B.03c's server-component pattern (`getTranslations({locale})`) is no longer needed once the env-var gate is back.
- **B.02 reconciliation re-execution** — skipped re-doing the walk; the B.03c completion report's existing reconciliation section is correct. Reconciled only the items that change under Path B (TOC, Termly embed, CSS override block — all documented above in the B.02 reconciliation section).
- **Local `npm run build`** — could not run (pre-existing prettier peer-dep failure, same as B.03c). Validated via Vercel Preview build instead. Not introduced by this phase; flagged for an unrelated cleanup phase.

---

## Definition of done

The brief's "Definition of done" said: "All 15 checklist items pass. Legal pages render Termly's iframe embed (where env var populated) or the brand-styled fallback (where not). User has the URLs + bypass token + Tag Assistant flow to do browser-side verification on their own time. B.03c's architectural deviation is fully reverted and locked out."

**Status against the original checklist:**
- ✅ B.02 reconciliation findings present (carried from B.03c's report; updated for Path B changes here)
- ✅ `src/content/legal/` directory and all `.html` files deleted
- ✅ Local-file reader code (`src/lib/legal/load-content.ts`) deleted
- ✅ `src/components/legal/TermlyPolicyEmbed.tsx` mounts the Termly iframe embed pattern
- ✅ Dead CSS overrides removed entirely from `TermlyPolicyEmbed.tsx`
- ✅ TOC sidebar decision applied (Option A — dropped entirely), documented
- ✅ Vercel env vars in correct state (2 from B.03c verified to match `.termly-ids.txt`; 3 stay empty by design since Cowork hasn't provided them)
- ✅ 4 legal routes SSR-verified — `/privacy/` renders embed, other 3 render fallback
- ⚠ `npm run build` local — pre-existing prettier peer-dep issue, same as B.03c; Vercel build verified green
- ✅ `npm run lint` exits 0 with no new warnings
- ✅ TypeScript strict — 0 errors in `src/components/legal/`; no new `any` / `@ts-ignore`
- ✅ Completion report (this file)
- ✅ `Sunset-Services-Decisions.md` updated with 2026-05-16 entry
- ✅ `current-state.md` updated, B.03c local-HTML marked REVERTED, Path B locked
- ✅ `file-map.md` updated — deleted entries removed, refactored entries reflect B.03d state
- ✅ Merged to main, Production deploy READY, Production SSR re-verified — see "Production verification" section below.

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

Phase B.03d is closed on the Code side. Browser-side verification (Tag Assistant Consent Mode v2 + Lighthouse smoke) sits with the user per the handoff section above.

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
