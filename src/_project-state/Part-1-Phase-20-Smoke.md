# Phase 1.20 Smoke Test Checklist

> Hand-runnable on `localhost:3030` after `npm run build && npx next start -p 3030`.
> Items prefixed with **[CODE-VERIFIED]** were validated during the Phase 1.20 close.
> Items prefixed with **[MANUAL]** require a browser session (not terminal-only).

## Build & lint

- **[CODE-VERIFIED]** `npm run build` exits 0
- **[CODE-VERIFIED]** `npm run lint` exits 0 (0 errors, 0 warnings)
- **[CODE-VERIFIED]** `npx tsc --noEmit` exits 0

## Bundle sizes (gzipped)

- **[CODE-VERIFIED]** Chat collapsed shell ≤ 8 KB (measured: **7,978 bytes**)
- **[CODE-VERIFIED]** Chat expanded panel chunk ≤ 24 KB (measured: **4,919 bytes**)

## Route inventory (HTTP 200, both locales where applicable)

- **[CODE-VERIFIED]** `/` and `/es` return 200
- **[CODE-VERIFIED]** `/residential`, `/commercial`, `/hardscape` (EN) return 200
- **[CODE-VERIFIED]** `/residential/lawn-care`, `/commercial/landscape-maintenance`, `/hardscape/patios-walkways` return 200
- **[CODE-VERIFIED]** `/projects`, `/projects/naperville-hilltop-terrace` return 200
- **[CODE-VERIFIED]** `/blog`, `/blog/dupage-patio-cost-2026` return 200
- **[CODE-VERIFIED]** `/resources`, `/resources/patio-materials-guide` return 200
- **[CODE-VERIFIED]** `/service-areas`, `/service-areas/aurora` return 200
- **[CODE-VERIFIED]** `/about`, `/contact` return 200
- **[CODE-VERIFIED]** `/request-quote` and `/es/request-quote` return 200
- **[CODE-VERIFIED]** `/thank-you` and `/es/thank-you` return 200
- **[CODE-VERIFIED]** `/thank-you?firstName=Sara` renders "Thanks, Sara — we've got it." in H1

## Wizard route SSR

- **[CODE-VERIFIED]** `/request-quote` H1 = "Tell us about your project"
- **[CODE-VERIFIED]** `/es/request-quote` H1 = "Cuéntanos sobre tu proyecto"
- **[CODE-VERIFIED]** Navbar amber "Get a Quote" CTA does NOT render on `/request-quote` (verified: zero `<a>` to `/request-quote` in DOM)
- **[CODE-VERIFIED]** No `<script type="application/ld+json">` schema on `/request-quote` beyond the sitewide LocalBusiness (count = 1)

## Wizard end-to-end (browser)

- **[MANUAL]** Step 1 → tile select advances to `?step=2` on Next
- **[MANUAL]** Step 2 → service multi-select with primary auto-rebind on uncheck → Next advances to `?step=3`
- **[MANUAL]** Step 3 → audience-conditional fields render correctly per Residential / Commercial / Hardscape
- **[MANUAL]** Step 4 → tel field auto-formats as `(630) 946-9321`; ZIP is digits-only, max 5; State select defaults to "Illinois"
- **[MANUAL]** Step 5 → review card uses `.card-cream` (NOT `.card-featured`); Edit links jump to `?step=N` preserving state; amber Submit
- **[MANUAL]** Submit click → console.log payload + route to `/thank-you/?firstName=…` + thank-you renders firstName interpolation
- **[MANUAL]** Browser-back from any step returns to prior step's state correctly
- **[MANUAL]** Reload at any step: Steps 1–3 hydrate from autosave (when `NEXT_PUBLIC_WIZARD_AUTOSAVE_ENABLED=true`); Step 4–5 reset to fresh
- **[MANUAL]** DevTools Application → Local Storage: `sunset_wizard_progress_v1` contains audience/services/details ONLY; never email/phone/name/address
- **[MANUAL]** Validation: empty required field → Next click → field shows error span (`role="alert"`) + scroll-to-error fires + focus moves to that field
- **[MANUAL]** Mobile-emulation (DevTools 390×844): sticky-Next bar appears; tap-targets ≥44px
- **[MANUAL]** Reduced-motion (DevTools Rendering → Emulate `prefers-reduced-motion: reduce`): step crossfade becomes instant; bubble hover-scale removed

## Thank-you route

- **[CODE-VERIFIED]** `/thank-you` ships `<meta name="robots" content="noindex,follow">`
- **[CODE-VERIFIED]** `?firstName=<script>alert(1)</script>` is sanitized to `Thanks, scriptalert(1)/script — we've got it.` (HTML chars stripped)
- **[CODE-VERIFIED]** `/thank-you` ships exactly 1 JSON-LD script (sitewide LocalBusiness only — deliberate zero per D15)
- **[MANUAL]** Section alternation cream/white/cream/white/cream
- **[MANUAL]** Zero amber CTAs on this page (Calendly placeholder is Ghost; soft-return CTAs are inline links)

## Chat widget

- **[CODE-VERIFIED]** With `NEXT_PUBLIC_AI_CHAT_ENABLED=false` (default), bubble does NOT render anywhere
- **[CODE-VERIFIED]** With `NEXT_PUBLIC_AI_CHAT_ENABLED=true`:
  - Bubble renders on `/`, `/es`, `/about`, `/projects`, `/blog`, `/thank-you` (count = 1)
  - Bubble does NOT render on `/request-quote`, `/es/request-quote` (count = 0)
- **[MANUAL]** Click bubble → panel opens with welcome state (assistant intro + 3 chip prompts)
- **[MANUAL]** Tap a chip → user message appears + typing indicator + streamed canned reply
- **[MANUAL]** Type free-text + send → typing indicator + streamed generic reply
- **[MANUAL]** Click "Get a quote in 30 seconds →" → lead form slides into log → fill + submit → confirm message appears with "Open the full form →" link
- **[MANUAL]** Reset (kebab menu) → conversation clears, panel reloads welcome state
- **[MANUAL]** Reload tab → conversation history restored from sessionStorage
- **[MANUAL]** Close + reopen tab → history is gone (sessionStorage cleared)
- **[MANUAL]** Switch locale via language switcher → namespace flips correctly
- **[MANUAL]** Mobile-emulation (390×844): panel renders as bottom-sheet with drag handle
- **[MANUAL]** Reduced-motion: typing indicator becomes static `…`, bubble hover-scale removed, panel entrance opacity-only

## Schema validation (Rich Results Test web tool)

- **[MANUAL]** `/` validates LocalBusiness + WebSite
- **[MANUAL]** `/residential/lawn-care/` validates LocalBusiness + BreadcrumbList + Service + FAQPage
- **[MANUAL]** `/projects/<slug>/` validates LocalBusiness + BreadcrumbList + CreativeWork
- **[MANUAL]** `/resources/<slug>/` validates LocalBusiness + BreadcrumbList + Article|HowTo + (FAQPage if present)
- **[MANUAL]** `/blog/<slug>/` validates LocalBusiness + BreadcrumbList + BlogPosting + (FAQPage if present)
- **[CODE-VERIFIED]** `/request-quote/` and `/thank-you/` emit zero non-LocalBusiness schema (deliberate zero per D15)

## Lighthouse 95+ on representative sample (Mobile + Desktop)

- **[MANUAL]** `/` EN: P / A / BP / SEO each ≥ 95 (Mobile + Desktop)
- **[MANUAL]** `/` ES: same
- **[MANUAL]** `/residential/`, `/residential/lawn-care/`: same
- **[MANUAL]** `/projects/`, `/blog/`, `/blog/<slug>/`: same
- **[MANUAL]** `/request-quote/`: same
- **[MANUAL]** `/thank-you/`: same

## Accessibility spot-check

- **[MANUAL]** axe DevTools on `/request-quote/`: zero serious/critical violations
- **[MANUAL]** axe DevTools on chat panel open (with flag on): zero serious/critical
- **[MANUAL]** Keyboard-only nav through wizard: Tab cycles fields → Next; Shift+Tab reverses; Enter on last field submits = Next
- **[MANUAL]** Keyboard-only nav through chat: Tab focuses bubble → Enter opens panel → Tab cycles composer → send → kebab → close; Esc closes panel + returns focus to bubble
- **[MANUAL]** Screen-reader: step transitions announce new H2; assistant streamed messages flush to live region on sentence boundary

## Real-device mobile

- **[MANUAL]** iOS Safari: wizard sticky-Next bar tracks the on-screen keyboard correctly
- **[MANUAL]** iOS Safari: chat composer tracks the keyboard
- **[MANUAL]** iOS Safari: chat panel bottom-sheet drag handle works
- **[MANUAL]** Android Chrome: same three behaviours
- **[MANUAL]** Tap-to-call link in navbar triggers the dialer

## Console errors

- **[MANUAL]** Click through every route in both locales with DevTools Console open: zero red errors
- **[MANUAL]** Document `@base-ui/react` warnings (known third-party) if present
