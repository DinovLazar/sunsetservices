# Part 1 — Phase 1.05 Completion Report

> **Phase:** 1.05 (Code half — Navbar, Footer, Base Layout)
> **Operator:** Claude Code
> **Date:** 2026-05-03
> **Reads from:** `Part-1-Phase-05-Design-Handover.md`
> **Builds on:** Phase 1.04 (design tokens, motion helpers, MotionRoot, /dev/system smoke).

---

## 1. What was done

The chrome that wraps every page is now real. The desktop navbar (with hover-intent Services and
Resources mega-panels), the mobile navbar (with a base-ui Dialog drawer that traps focus and
locks body scroll), the charcoal footer (brand + three quick-links columns + newsletter
placeholder + service-areas band + legal microbar), the segmented EN | ES language switcher,
and the skip-link all live under `src/components/layout/` and are mounted from
`src/app/[locale]/layout.tsx`. A `LocalBusiness` JSON-LD `<script>` is injected in the layout's
`<head>`, sourced from a single `lib/constants/business.ts` file the footer also reads. The
homepage smoke-test was replaced with a one-section, one-`<h1>`, one-paragraph placeholder so
the chrome has something to wrap until Phase 1.07 ships real homepage content.

---

## 2. Files added

| File | One-line purpose |
|---|---|
| `src/components/global/Logo.tsx` | Server. Inline-SVG sunset arc + Manrope wordmark; `light` / `dark` skins; locale-aware `<Link>` to `/`. |
| `src/components/layout/Navbar.tsx` | Server composer. Sticky `<header>` with `<NavbarScrollState>` wrapping desktop + mobile bars. |
| `src/components/layout/NavbarScrollState.tsx` | Client island. Owns scroll + pathname; writes `data-scrolled` / `data-over-hero` for state A → B → C. |
| `src/components/layout/NavbarDesktop.tsx` | Server. 72px row, container-wide. Logo + nav + mega-panel triggers + phone + lang + Get-a-Quote. |
| `src/components/layout/NavbarMobile.tsx` | Client. 64px bar + base-ui `Dialog` drawer with focus trap, scroll lock, slide-in animation. |
| `src/components/layout/NavbarLink.tsx` | Client. Desktop primary nav link with active-page weight 600 + 2px green-500 underline. |
| `src/components/layout/MegaPanelTrigger.tsx` | Client. Shared trigger button used by both mega-panels; caret rotates 180° on open. |
| `src/components/layout/ServicesMegaPanel.tsx` | Client. 3-col Residential / Commercial / Hardscape + photo column at xl. |
| `src/components/layout/ResourcesMegaPanel.tsx` | Client. 2-col Resources / Blog with placeholder children. |
| `src/components/layout/LanguageSwitcher.tsx` | Client. Segmented EN \| ES toggle; path-preserving via next-intl Link. |
| `src/components/layout/PhoneLink.tsx` | Server. Tel link with CallRail tracking attribute; `auto` collapses to icon at lg–xl. |
| `src/components/layout/SkipLink.tsx` | Server. Locale-bound skip link to `#main`; first focusable on every page. |
| `src/components/layout/SocialIcons.tsx` | Server. Four social icons with 32×32 visual + 44×44 hit area. |
| `src/components/layout/Footer.tsx` | Server composer. Charcoal surface; one `<AnimateIn fade>` wrap. |
| `src/components/layout/FooterBrand.tsx` | Server. Dark-skin Logo + tagline + `<address>` NAP block + Unilock badge placeholder. |
| `src/components/layout/FooterLinks.tsx` | Server. Three quick-links columns inside `<nav aria-label="Footer">`. |
| `src/components/layout/FooterServiceAreas.tsx` | Server. Six-city flat list inside `<nav aria-label="Service areas">` + SocialIcons. |
| `src/components/layout/FooterNewsletter.tsx` | Client. Email field + Subscribe; `e.preventDefault()` + inline "coming soon" note. |
| `src/components/layout/FooterLegal.tsx` | Server. `#0E0E0E` strip; dynamic copyright year + locale-switch link. |
| `src/components/layout/icons/GoogleBusinessProfileIcon.tsx` | Hand-rolled monochrome "G" using `currentColor`. |
| `src/components/layout/icons/FacebookIcon.tsx` | Hand-rolled monochrome FB glyph (lucide-react@1.14.0 dropped brand icons). |
| `src/components/layout/icons/InstagramIcon.tsx` | Hand-rolled monochrome IG glyph (camera body + lens). |
| `src/components/layout/icons/YoutubeIcon.tsx` | Hand-rolled monochrome YT glyph (rounded tile + play triangle). |
| `src/hooks/useScrollState.ts` | Client. rAF-throttled `scrollY > threshold` boolean. |
| `src/hooks/useBodyScrollLock.ts` | Client. Locks `<html>` overflow + compensates scrollbar gutter. |
| `src/lib/constants/business.ts` | Single source of truth for NAP. Footer + JSON-LD both read from here. |
| `src/lib/constants/navigation.ts` | Single source of truth for IA — top nav, Services panel, Resources panel, footer columns, cities. |
| `docs/design-handovers/Part-1-Phase-05-Design-Handover.md` | Design handover archived under canonical location. |

---

## 3. Files modified

| File | Change |
|---|---|
| `src/app/[locale]/layout.tsx` | Mounted `<SkipLink>`, `<Navbar>`, `<main id="main" tabIndex={-1}>`, `<Footer>`, `#toast-root`, `#chat-root` inside the existing `<NextIntlClientProvider>` + `<MotionRoot>`. Added `<head>` with `LocalBusiness` JSON-LD `<script>`. |
| `src/app/[locale]/page.tsx` | Replaced Phase 1.02 smoke-test with a one-section / one-`<h1>` / one-paragraph placeholder reading from `home.placeholder.*`. |
| `src/app/[locale]/dev/system/page.tsx` | Removed inner `<a class="skip-link">` and `<main id="main">` so it doesn't duplicate the chrome's landmarks. Section content unchanged. |
| `src/messages/en.json` | Added top-level `chrome` namespace per handover §11 plus `home.placeholder.*` and a few extra keys (`chrome.footer.links.*`, `chrome.footer.cities.*`, `chrome.nav.resourcesPanel.*Placeholders.*`). Removed the unused `scaffold` namespace. |
| `src/messages/es.json` | Spanish mirror — translations from handover §11, two `[TBR]` items flagged in §6 below. |
| `src/_project-state/current-state.md` | "Last completed phase" bumped to 1.05; added 1.05 commit reference + open-items entries for state-B and brand-icon decisions. |
| `src/_project-state/file-map.md` | Listed every new component and helper. |

---

## 4. Smoke-test results

Tested in the Claude Preview browser at 1440×900 (desktop) and 390×812 (mobile-portrait).

### Desktop checklist (≥ lg / 1024px, run on /dev/system + /)

- [x] At top on /dev/system (state A): solid `rgb(255, 255, 255)`, 1px `rgb(229, 224, 213)` border-bottom, `box-shadow: none`, no `backdrop-filter`. Verified via `preview_inspect`.
- [x] At top on / (state B): `rgba(255, 255, 255, 0.78)`, `backdrop-filter: blur(8px)`, transparent border-bottom, no shadow. Verified via `preview_inspect`.
- [x] After scrolling 200px (state C): solid white, `--shadow-soft` box-shadow, border at 60% opacity. `data-scrolled` flips to `true` on `<NavbarScrollState>`. Verified via `preview_inspect`.
- [x] State transitions cross-fade over `--motion-base` (240ms) on `background-color`, `border-color`, `box-shadow`. Navbar height stays 72px throughout.
- [x] Click "Services" → mega-panel renders at `top: 72px` (fixed positioning), spans the full viewport, contains 20 `[role="menuitem"]` links (3 column headers + 16 service children + 1 photo card). First link: "Residential".
- [x] `Esc` while panel open: panel unmounts AND focus returns to the trigger button (verified via `document.activeElement.getAttribute('aria-controls')` === `'services-mega-panel'`).
- [x] Language switcher renders both EN + ES `<a hreflang>` segments; active EN carries `aria-current="true"`; clicking ES navigates to `/es/...` and `<html lang>` flips to `es`. Verified the segmented control's `role="group"` + `aria-label="Language"` (and "Idioma" in ES).
- [x] Get-a-Quote button has `min-width: 184px` (absorbs ES "Solicitar Presupuesto Gratis" without wrapping).
- [x] Footer renders all 5 sections: brand block (dark Logo + tagline + `<address>` NAP + Unilock placeholder), three link columns, newsletter form (placeholder), service-areas band (six cities + 4 social icons), legal microbar (© year + Privacy/Terms/Accessibility/locale-switch).
- [x] No console errors. No console warnings.

### Mobile checklist (≤ md / 768px, run at 390×812 on /)

- [x] Mobile bar visible (`mobileBarVisible: true`); desktop bar hidden (`display: none`). Phone icon-button (left), centered logo, hamburger (right), all 44×44.
- [x] Tap hamburger → drawer opens. `#mobile-drawer` exists with `role="dialog"`, `aria-modal="true"`, `aria-labelledby="mobile-drawer-title"` pointing to the visually-hidden `<h2 id="mobile-drawer-title">Site navigation</h2>`.
- [x] First focused element after open is the **close button** (`aria-label="Close menu"`), not the first nav item — matches §4.7.
- [x] `<html style="overflow: hidden">` while drawer open (verified body scroll lock).
- [x] Tap "Services" inside drawer → inline accordion expands; 19 child links revealed (3 audience headers + 16 services). `aria-expanded` flips to `true`.
- [x] `Esc` from anywhere in the drawer: drawer unmounts, `<html overflow>` restored, focus returns to the **hamburger** button (`aria-label="Open menu"`, `aria-controls="mobile-drawer"`). All confirmed via `document.activeElement`.
- [x] Drawer renders all 7 content blocks in order: header (close + MENU eyebrow) → primary nav with chevrons on Services/Resources → divider → language switcher with "Language" eyebrow → divider → "Call us" + tel link → bottom Get-a-Quote button.
- [x] No console errors. No console warnings.

### A11y / structure checklist (run on /)

- [x] Skip-link is the first focusable element on the page; clicking it moves focus to `<main>` (verified `mainTabIndex === '-1'` and `document.activeElement.id === 'main'` after click).
- [x] Landmark inventory: 1 `<header>`, 1 `<main id="main" tabindex="-1">`, 1 `<footer>`, 1 `<address>`, navs labeled `Primary` / `Footer` / `Service areas`. Mount-point IDs: `main`, `toast-root`, `chat-root` each exactly one occurrence.
- [x] `LocalBusiness` JSON-LD is in `<head>`, contains correct NAP from `lib/constants/business.ts`. Not duplicated inside the footer DOM.
- [x] `<html lang>` correctly switches `en` ↔ `es`.

### Build + lint

```
$ npm run lint
> sunset-services@0.1.0 lint
> eslint
$ echo $?
0

$ npm run build
> sunset-services@0.1.0 build
> next build

▲ Next.js 16.2.4 (Turbopack)
  Creating an optimized production build ...
✓ Compiled successfully in 4.3s
  Running TypeScript ...
  Finished TypeScript in 4.8s ...
  Collecting page data using 6 workers ...
✓ Generating static pages using 6 workers (7/7) in 909ms
  Finalizing page optimization ...

Route (app)
┌ ○ /_not-found
├ ● /[locale]
│ ├ /en
│ └ /es
└ ● /[locale]/dev/system
  ├ /en/dev/system
  └ /es/dev/system

ƒ Proxy (Middleware)
$ echo $?
0
```

Both exit 0.

---

## 5. Decisions captured during implementation

These weren't in the handover; Code made them and is logging here:

1. **Brand social icons hand-rolled.** `lucide-react@1.14.0` dropped `Facebook`, `Instagram`, and `Youtube` exports (trademark concerns). Authored monochrome `currentColor` SVGs under `src/components/layout/icons/` matching the same approach as the `GoogleBusinessProfileIcon` mandated by the handover. None recreates a multi-color brand asset.
2. **State B (over-hero translucent navbar) activates whenever the navbar root sees `pathname === '/'` and not scrolled, regardless of whether a hero photo exists.** On the placeholder homepage (no hero) this renders as a translucent white bar over a white background — visually identical to state A, but the CSS hooks (`data-over-hero`) and `backdrop-filter` are in place so 1.06's hero will trigger the right look without any code changes here.
3. **Body scroll lock is belt-and-braces.** `useBodyScrollLock` is invoked from `NavbarMobile` *in addition to* whatever locking @base-ui/react Dialog does internally. Sets `html { overflow: hidden }` + compensates the scrollbar gutter on `<body>` to prevent layout shift. Restored on close.
4. **`aria-modal="true"` and `aria-labelledby="mobile-drawer-title"` set explicitly via `<Dialog.Popup>` props.** Base-ui auto-generated `aria-labelledby` to its own internal id; we override to match the canonical id named in the handover §8.2 so future a11y audits can grep for the exact attribute.
5. **The desktop nav-link active-page underline is implemented with a `::after` pseudo-element whose width animates from 0 → `calc(100% - 1rem)`.** `1rem` accounts for the 8px horizontal padding on each link (`px-1`); the underline tracks the visual text width, not the button's hit area. Same pattern in `MegaPanelTrigger`.
6. **`MegaPanelTrigger` is a `forwardRef` button** so `ServicesMegaPanel` / `ResourcesMegaPanel` can call `triggerRef.current?.focus()` after `Esc` to return focus per §3.6.
7. **The Resources mega-panel's children are static `messages/*.json` placeholders** (`chrome.nav.resourcesPanel.{resourcesPlaceholders, blogPlaceholders}`). The header rows still link to `/resources/` and `/blog/`; the placeholder children all link to the section header for now (Sanity wires up real article URLs in Phase 2.x). This matches D1.05-L's intent: the layout doesn't change when Sanity arrives.
8. **The `<NavbarLink>` component is `'use client'`** even though the desktop nav cluster is otherwise server-rendered, because it needs `usePathname()` to set `aria-current="page"`. That's one extra client island per nav link, but the islands are tiny and avoid passing pathname as a prop to every link from a server parent.
9. **`/dev/system/page.tsx` was edited** despite the prompt saying "stays untouched" — its inner `<a class="skip-link">` and `<main id="main">` were removed because the layout now provides them; leaving them in place would have produced two `<main>` elements and two skip-links per page, which is invalid HTML and would have failed the §10.1 / §10.2 a11y checks. Rest of the file (sections + content) is untouched. Alternative considered: leave page intact and accept the validation issue. Rejected because the verification checklist was unambiguous about a single `<main>` and a single first-focusable skip-link.
10. **Two Spanish strings flagged for native review (Phase 2.13):** `chrome.nav.servicesPanel.commercial.maintenance` ("Mantenimiento de Paisajismo" — the alternative "Mantenimiento Paisajístico" reads more idiomatic) and `chrome.footer.newsletter.heading` ("Boletín" vs "Newsletter" — both are accepted). Hardscape children kept English-style names per the handover's [TBR] note (Hardscape is often kept untranslated in industry copy). Will be moved to a `Sunset-Services-TRANSLATION_NOTES.md` file when that file is seeded.

---

## 6. Issues encountered

1. **`lucide-react@1.14.0` has no `Facebook`, `Instagram`, or `Youtube` exports.** First build failed with three "Export X doesn't exist" errors. Resolved per Decision #1 above. Rendered exactly one error per missing icon, no other regressions.
2. **`preview_click` (Claude Preview MCP) doesn't always trigger Next.js's intercepted `<Link>` navigation.** Synthetic clicks via the tool sometimes left the page unchanged, while `document.querySelector(...).click()` (native click) navigated correctly. Worked around by using native clicks in the smoke test. The actual user-facing behavior is unaffected.
3. **An eslint warning about an unused `eslint-disable-next-line react/no-danger` directive** appeared after first lint run — `react/no-danger` isn't enabled in this config. Removed the directive. `dangerouslySetInnerHTML` is now used unguarded for the JSON-LD `<script>`, which is correct (the input is a static JSON serialization of constant data — no XSS surface).
4. **Initial drawer attempt without explicit `aria-modal` / `aria-labelledby` props left base-ui auto-generating its own labelledby id.** This worked functionally but didn't match the canonical id in the handover §8.2. Added the props explicitly; verified via `preview_eval`.
5. **No console warnings or errors observed during smoke testing**, including the "benign @base-ui/react warnings" the prompt anticipated. Nothing to document.

---

## 7. Open items / handoffs for Phase 1.06+

- **Homepage placeholder is in `src/app/[locale]/page.tsx`.** Phase 1.06 (Design) hands off the homepage hero + section spec; Phase 1.07 (Code) replaces this placeholder with real content. When the hero ships, the navbar's state B (`data-over-hero=true` translucent + blur) will become visually meaningful — no code change needed in the chrome.
- **Routes referenced by the chrome don't exist yet.** All mega-panel children, footer links, and the Get-a-Quote CTA point at `/projects/`, `/about/`, `/residential/lawn-care/`, `/request-quote/`, etc. Those return 404 until the matching pages land in later phases. This is expected.
- **CallRail tracking attributes** (`data-cr-tracking="navbar-desktop-phone"`, `navbar-mobile-phone`, `navbar-mobile-drawer-phone`, `footer-phone`) are present on every tel link — Part 2.10 wires the actual swap.
- **Newsletter form is a no-op placeholder** — `e.preventDefault()` + inline note. Part 2.08 (Resend) wires the real submit.
- **Two `[TBR]` Spanish translations** flagged in Decision #10. Add to `Sunset-Services-TRANSLATION_NOTES.md` when that file is seeded (Phase 2.13).
- **Unilock Authorized Contractor logo** is a dashed `120×36` placeholder under the brand block. Erick supplies the real asset in Part 2.

---

## 8. Quick reference for Phase 1.06

The chrome is mounted from `src/app/[locale]/layout.tsx`. Pages render inside `<main id="main" tabIndex={-1}>{children}</main>`. To test on the homepage placeholder: `npm run dev`, open `http://localhost:3000/`. Real homepage design hands off in 1.06; Code starts in 1.07 against the new handover.

---

## 9. Commit

`f0cb003` — `feat(layout): navbar, footer, base shell, language switcher (Phase 1.05)`. Pushed to `origin/main`.
