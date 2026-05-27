# Phase M.10B — `/impeccable:audit` fix-pass (Completion report)

**Branch:** `m10-walkthrough-fixes` (stacked on the M.10 commit `d957791`)
**Date:** 2026-05-26
**Outcome:** All eight audit-recommended actions applied across 13 files. `npx tsc --noEmit` exits clean. Dev preview at `localhost:51093` re-verified for the two browser-observable design changes (testimonial cards, ServiceHero scrim) via Playwright/Preview DOM-state queries. **Not committed; not pushed** per user instruction. Tree is ready for a final review pass before merge into the M.10 commit (or split into a follow-on commit at the operator's discretion).

---

## Headline

This phase is a follow-on to M.10 itself. After M.10's ten user-walkthrough fixes landed (commit `d957791`), the user ran `/impeccable:audit` — a technical quality audit across five dimensions (a11y, performance, theming, responsive design, anti-patterns). The audit scored the codebase **16/20 (Good)** with one cluster of P1 anti-pattern findings (BAN 1 — side-stripe borders on cards/alerts > 1px) as the single biggest credibility drag, plus a handful of P1/P2 a11y, theming, responsive, and performance polish items.

The user then dispatched the eight recommended actions via `/superpowers:dispatching-parallel-agents` with the directive *"run all of these at once. once done do not push to github."* The fix-pass ran six parallel agents (the eight recommendations were grouped into six task scopes to keep file-set conflicts at zero), followed by a final polish pass. One audit finding (the `AnimateIn` `initial={false}` flag) was investigated, found to be intentional per the M.10 anti-flicker fix, and documented instead of changed. One audit-driven rewrite was extended out-of-original-scope to `LocalTestimonials.tsx` (the customer-facing inline mirror of the `.card-testimonial` CSS class) — this is the single decision in this phase that supersedes a prior Phase lock (1.03 §6.2) and is flagged below for explicit acknowledgment.

---

## What this phase shipped

| File | Action |
|---|---|
| [src/app/globals.css](src/app/globals.css) | Modified — three changes. **(a)** `.card-testimonial`: dropped the `border-left: var(--border-thick) solid var(--color-sunset-green-500)` (BAN 1 side-stripe) and replaced with a `::before` pseudo-element rendering U+201C (`"`) in `var(--font-heading)` at 4.5rem, `color: var(--color-sunset-green-500)`, `opacity: 0.6`, absolute-positioned top-left; bumped `padding-top` to `var(--spacing-10)` and `padding-left` to `var(--spacing-8)` so the glyph has headroom. **(b)** `.alert` base + `.alert-info` / `.alert-success` / `.alert-warning` / `.alert-danger`: dropped `border-left-width`, `border-left-style`, and the per-variant `border-left-color`; kept the tinted background and semantic foreground colors untouched; added new `.alert-icon { flex-shrink: 0; margin-top: 2px; }` hook for consumers to drop in a Lucide icon as the leading visual element. **(c)** `.btn`: removed permanent `will-change: transform`; added `:is(.btn):hover, :is(.btn):focus-visible { will-change: transform; }` so the GPU compositing layer is reserved only during interaction, not on every page button at rest. **(d)** Surfaces block: added new `--color-bg-deep-charcoal: #0E0E0E` token to absorb the FooterLegal hex literal into the design-token system. |
| [src/components/chat/ChatHighIntentBanner.tsx](src/components/chat/ChatHighIntentBanner.tsx) | Modified — removed the inline `borderLeft: '3px solid var(--color-sunset-amber-700)'` (BAN 1 side-stripe carried over from Phase 2.09); replaced with a leading `<Sparkles size={16}>` icon from `lucide-react` (already imported neighbor of the existing `X` close icon), colored `var(--color-sunset-amber-700)`. Banner background (`var(--color-sunset-amber-50)`), copy, two CTAs, dismiss button, and ARIA attributes unchanged. |
| [src/components/sections/location/LocalTestimonials.tsx](src/components/sections/location/LocalTestimonials.tsx) | Modified — out-of-original-scope extension of the `.card-testimonial` rewrite. Inline-style `<article>` lost its `borderLeft: '4px solid var(--color-sunset-green-500)'`; padding rebalanced to `var(--spacing-10) var(--spacing-8) var(--spacing-6) var(--spacing-8)`; a new `<span aria-hidden="true">` with U+201C ("), absolute-positioned at `top: var(--spacing-2)` / `left: var(--spacing-4)`, font-heading at 4.5rem, sunset-green-500 at opacity 0.6, was prepended inside the `<article>`. JSDoc updated to reflect that the Phase 1.03 §6.2 side-stripe lock has been superseded by the M.10B leading-quote pattern, and that this file mirrors the `.card-testimonial` class in globals.css. **This change effectively supersedes the Phase 1.03 §6.2 locked design decision** — see In-phase decisions §1 below. |
| [src/components/sections/service/ServiceHero.tsx](src/components/sections/service/ServiceHero.tsx) | Modified — two changes. **(a)** Responsive: inserted `md:h-[max(50vh,400px)]` between the `sm:` and `lg:` height tiers; replaced the inline `style={{maxHeight: '600px'}}` with a `2xl:max-h-[600px]` Tailwind class so the cap is visible in the className and tracks the Tailwind breakpoint system. **(b)** Scrim: replaced the two stacked `linear-gradient(180deg, rgba(0,0,0,...)...rgba(0,0,0,0.60))` black-overlay decorations with brand-tinted `linear-gradient(180deg, color-mix(in srgb, var(--color-sunset-green-900) 12%, transparent) 0%, color-mix(in srgb, var(--color-sunset-green-900) 68%, transparent) 100%)` on both the mobile and `sm:`+ scrims. Cream title text (`var(--color-text-on-dark)` = #FAF7F1) clears AA against the new dark-green scrim by a wide margin (~10:1 in the densest region). |
| [src/components/chat/ChatComposer.tsx](src/components/chat/ChatComposer.tsx) | Modified — Send button inline `height: 40` → `height: 44` so the primary action satisfies the project's 44×44 touch-target floor (the textarea already declares `minHeight: 44`; surrounding flex row uses `alignItems: 'flex-end'` so the new height aligns naturally). Bonus textarea aria-label/placeholder redundancy at line 55-56 was identified but skipped — fixing it requires editing `en.json` + `es.json` to add a new shorter hint key, which exceeds the file-scope constraint set on the agent. Flagged for follow-up. |
| [src/components/ui/FaqAccordion.tsx](src/components/ui/FaqAccordion.tsx) | Modified — removed inline `style={{outline: 'none'}}` from the `<summary>` element. The global `:focus-visible` rule in `globals.css` (`outline: var(--border-2) solid var(--color-focus-ring); outline-offset: 2px; border-radius: 2px;`) now paints the green-tinted focus ring on the summary on keyboard navigation. WCAG 2.4.7 (Focus Visible). |
| [src/components/layout/LanguageSwitcher.tsx](src/components/layout/LanguageSwitcher.tsx) | Modified — two ARIA correctness fixes. **(a)** `aria-current={isActive ? 'true' : undefined}` → `aria-current={isActive ? 'page' : undefined}` since locale switching navigates between full pages. **(b)** aria-label rewritten to prefix the visible text: ` `${visibleLabel} — ${isActive ? labelFull : switchLabel}` ` so the accessible name STARTS with the visible "EN" / "ES" content (Lighthouse `label-content-name-mismatch` from the Phase 2.08 audit). Verified live: the inactive locale link reads "EN — Ver esta página en inglés" / "ES — View this page in Spanish". |
| [src/components/layout/FooterLegal.tsx](src/components/layout/FooterLegal.tsx) | Modified — `bg-[#0E0E0E]` → `bg-[var(--color-bg-deep-charcoal)]`. The hex literal is preserved as a value but is now reachable from the design-token system via the new `--color-bg-deep-charcoal` token added to `globals.css`. |
| [src/components/wizard/WizardStep1Audience.tsx](src/components/wizard/WizardStep1Audience.tsx) | Modified — dropped `color="#FFFFFF"` from the `<Check>` Lucide icon in the green-disc selected-state indicator; added explicit `color: 'var(--color-text-on-green)'` to the parent `<span>`'s inline style so the icon now inherits `currentColor` from a token-backed parent. |
| [src/components/wizard/WizardSavedToast.tsx](src/components/wizard/WizardSavedToast.tsx) | Modified — same pattern as the wizard-step-1 audience selector: dropped `color="#FFFFFF"` from `<Check>`; added `color: 'var(--color-text-on-green)'` to the parent green-disc `<span>`. |
| [src/components/content/FilterChipStrip.client.tsx](src/components/content/FilterChipStrip.client.tsx) | Modified — both fade-mask gradients on lines 65 + 67 had `#000` swapped to `var(--color-bg-charcoal)`. The mask color is invisible (only the alpha channel matters), so this is purely a codebase-consistency change — but it closes the last `#000` literal in `src/components/`. |
| [src/components/ui/InitialsAvatar.tsx](src/components/ui/InitialsAvatar.tsx) | Modified (JSDoc only) — comment text "rendered in cream Outfit" → "rendered in cream Manrope". The code used `className="font-heading"` (which resolves to Manrope via the `--font-heading` token) from the day it shipped; the doc text was stale. No runtime change. |
| [src/components/global/motion/AnimateIn.tsx](src/components/global/motion/AnimateIn.tsx) | Modified (JSDoc only) — added a top-of-file comment explaining that `initial={false}` is intentional per the M.10 anti-flicker fix ("once visible, stay visible" — Goran's requirement, documented in [Phase-M-10-Completion.md](src/_project-state/Phase-M-10-Completion.md) §1). The component is a Motion variant-host shell; entrance animations are skipped on first paint by design. Forking instruction included for anyone who later wants a scroll-triggered fade. No runtime change. |
| [src/components/global/motion/StaggerContainer.tsx](src/components/global/motion/StaggerContainer.tsx) | Modified (JSDoc only) — parallel comment to AnimateIn explaining the no-flicker contract for the stagger root. No runtime change. |
| [src/components/global/motion/StaggerItem.tsx](src/components/global/motion/StaggerItem.tsx) | Modified (JSDoc only) — parallel comment explaining the no-flicker contract, plus a note that the child must stay in sync with its parent. No runtime change. |
| [src/_project-state/Phase-M-10B-Completion.md](src/_project-state/Phase-M-10B-Completion.md) | NEW — this report. |

---

## Visual verification log

The dev server running at `localhost:51093` was queried via the Preview MCP to confirm the two browser-observable design changes landed correctly (the rest are either non-visual or visually identical to the prior state).

**Testimonial card (es/service-areas/aurora):** computed-style snapshot of the `<article>` confirms `border-left-width: 0px`, `padding-left: 32px`, `padding-top: 40px`, `position: relative`. The injected `<span aria-hidden="true">` exists, renders text `"`, computed `color: rgb(77, 138, 63)` (= `#4D8A3F` = `--color-sunset-green-500`), `opacity: 0.6`, `font-size: 72px`, `font-family: Manrope`, `position: absolute`. A11y snapshot confirms the span correctly stays out of the screen-reader tree (the inline `&ldquo;` + `&rdquo;` in the body text are what AT users hear).

**ServiceHero scrim (es/landscape/landscape-design):** computed-style snapshot of both scrim divs confirms `background-image: linear-gradient(color(srgb 0.101961 0.211765 0.0901961 / 0.12) 0%, color(srgb 0.101961 0.211765 0.0901961 / 0.68) 100%)`. The `srgb(0.101961, 0.211765, 0.0901961)` triple converts to `#1A3617` = `--color-sunset-green-900`. The 12%→68% alpha ramp is the `color-mix(in srgb, ..., transparent)` pattern the audit specified. Hero className includes the new `md:h-[max(50vh,400px)]` breakpoint and `2xl:max-h-[600px]` Tailwind cap.

**LanguageSwitcher aria-label (es/service-areas/aurora):** a11y snapshot shows the inactive locale link's accessible name as `"EN — Ver esta página en inglés"` — visible text prefix as required by `label-content-name-mismatch`.

Not browser-verified in this phase (low blast radius, would require flow-specific interactions): chat composer 44px touch target, FaqAccordion focus ring on keyboard nav, wizard `<Check>` color inheritance, FilterChipStrip mask color (invisible), FooterLegal token color (visually identical), JSDoc-only edits to the three motion wrappers.

---

## In-phase decisions

1. **`.card-testimonial` rewrite extended to `LocalTestimonials.tsx` (supersedes Phase 1.03 §6.2 lock).** Agent 1's BAN 1 sweep found that the `LocalTestimonials.tsx` `<article>` inlines a verbatim mirror of the locked `.card-testimonial` side-stripe pattern. The audit recommendation explicitly targeted the `.card-testimonial` CSS class (which I rewrote); I extended the rewrite to the inline mirror in the final polish pass to keep the testimonial card visual consistent across the codebase. **This effectively supersedes Phase 1.03 §6.2 D-N** (the original locked pattern was a green-500 `border-left: 4px`). If the operator wants the original lock back, revert `LocalTestimonials.tsx` to HEAD and additionally revert the `globals.css` `.card-testimonial` block to its pre-M.10B state. The two are now coupled — keep them in sync either way.
2. **`.alert-*` side-stripe replaced with semantic-icon hook, not in-line icon.** Agent 1 added a generic `.alert-icon` class (`flex-shrink: 0; margin-top: 2px;`) rather than baking a default icon into the alert via `::before`. Reason: alert variants want different icons (`Info` / `CheckCircle` / `AlertTriangle` / `AlertOctagon`), and consumers usually want to inject a translated string anyway. The class is a styling hook; downstream code picks the icon.
3. **`AnimateIn` / `StaggerContainer` / `StaggerItem` not behavior-changed.** The audit's P3 finding was that `initial={false}` skips the entrance animation. Investigation (Agent 6) confirmed this is exactly the Phase M.10 anti-flicker fix Goran requested (`Phase-M-10-Completion.md` §1 documents the trade-off explicitly). All three files got JSDoc only — no runtime change. Anyone wanting a scroll-triggered fade should fork into a new `ScrollReveal` / `ScrollStagger` sibling primitive rather than editing these three (the no-flicker contract is what Goran signed off on).
4. **Email templates (3 files) carved out of BAN 1 sweep.** Agent 1 surfaced `border-left: 3px+` in `QuoteLeadAlertEmail.tsx`, `ContactAlertEmail.tsx`, `ChatLeadEmail.tsx`. These are React Email templates that render to HTML email. Email clients (Outlook, Gmail) render `border-left` reliably while many other CSS features fail; the stripe is a deliberate cross-client-compatibility choice, not a design anti-pattern. Left untouched.
5. **`src/app/[locale]/dev/system/page.tsx` `<blockquote>` carved out.** The dev-system showcase page uses `border-left: 4px solid var(--color-sunset-green-500)` on a `<blockquote>`. Classical typography (Wikipedia, newspaper pull-quotes) — different semantic from a "card with a stripe", and not in BAN 1's scope ("cards/list-items/callouts/alerts"). Left untouched.
6. **New `--color-bg-deep-charcoal: #0E0E0E` token added rather than collapsing FooterLegal to `--color-bg-charcoal: #1A1A1A`.** Per Part-1-Phase-05-Completion.md the footer's deeper-than-charcoal strip is intentional. Adding a token preserves the visual decision and lifts the hex literal into the design system simultaneously.
7. **Wizard `<Check>` icons switched from `color="#FFFFFF"` prop to `currentColor` inheritance.** Agent 5 found that the parent `<span>` discs had no explicit `color`, so dropping the `color` prop on the icon would have inherited the wrong value upstream. Fix is two-line per file: (a) drop the icon `color` prop, (b) add `color: 'var(--color-text-on-green)'` to the parent disc's inline style. Idiomatic Lucide pattern, single source of truth.
8. **Send-button height fix is scoped to button only.** The audit recommended 40→44px on the chat composer Send. Agent 4 also checked surrounding row alignment: `<div style={{display: 'flex', gap: 8, alignItems: 'flex-end'}}>` adapts to the taller button automatically; no row-height override or icon-offset cleanup needed.

---

## What this phase didn't change

- **Chat composer textarea aria-label/placeholder redundancy** ([ChatComposer.tsx:55-56](src/components/chat/ChatComposer.tsx#L55)). Both attributes use the same translation key. Fixing requires a new shorter hint key in `en.json` + `es.json`; deferred to a phase that can touch translation files.
- **Lighthouse `label-content-name-mismatch` remediation breadth.** The audit specifically called out LanguageSwitcher; that one is fixed (a11y snapshot confirmed). If the harness flags more instances across the site, those are separate.
- **Three M.10 deferred validation harnesses** (`validate:schema`, `validate:seo`, `validate:a11y`) still need to be re-run against the dev server (or the post-deploy Vercel Preview URL). The fixes in this phase shouldn't have introduced regressions in any of the three, but operator should re-run before final commit.

---

## Files modified (summary)

**New:**
- `src/_project-state/Phase-M-10B-Completion.md` (this file)

**Modified (code, runtime behavior changed):**
- `src/app/globals.css`
- `src/components/chat/ChatHighIntentBanner.tsx`
- `src/components/sections/location/LocalTestimonials.tsx`
- `src/components/sections/service/ServiceHero.tsx`
- `src/components/chat/ChatComposer.tsx`
- `src/components/ui/FaqAccordion.tsx`
- `src/components/layout/LanguageSwitcher.tsx`
- `src/components/layout/FooterLegal.tsx`
- `src/components/wizard/WizardStep1Audience.tsx`
- `src/components/wizard/WizardSavedToast.tsx`
- `src/components/content/FilterChipStrip.client.tsx`

**Modified (JSDoc only, no runtime change):**
- `src/components/ui/InitialsAvatar.tsx`
- `src/components/global/motion/AnimateIn.tsx`
- `src/components/global/motion/StaggerContainer.tsx`
- `src/components/global/motion/StaggerItem.tsx`

**Modified (i18n):** none.
**Modified (assets):** none.
**Modified (harness):** none.
**Modified (Sanity schema):** none.

---

## DoD check

- [x] All eight `/impeccable:audit` recommended actions either applied, documented, or carved out with rationale.
- [x] `npx tsc --noEmit` exits clean.
- [x] Browser-preview verification on the two browser-observable design changes (testimonial cards, ServiceHero scrim) passed via Preview MCP computed-style + a11y-tree snapshots.
- [x] Out-of-scope expansion to `LocalTestimonials.tsx` explicitly surfaced in In-phase decisions §1 with revert instructions.
- [ ] Validation harnesses (`validate:schema`, `validate:seo`, `validate:a11y`) re-run — **operator step.**
- [ ] Commit — **explicitly deferred per user instruction ("once done do not push to github").** Whether to fold this into the M.10 commit (`d957791` amend) or land as a separate follow-on commit is an operator decision; this phase doc is structured to support either.
- [ ] Vercel Preview re-walkthrough — **post-commit, post-deploy.**

---

## Suggested commit message (when the operator is ready)

```
feat(design-system,chrome,a11y): Phase M.10B — impeccable audit fix-pass

Follow-on to M.10 (commit d957791). The `/impeccable:audit` run scored
the codebase 16/20 (Good) with one cluster of P1 anti-pattern findings
(BAN 1 — side-stripe borders on cards/alerts > 1px) plus a handful of
a11y / theming / responsive polish items. This commit closes the
audit-driven list:

1. BAN 1 removal — `.card-testimonial` and `.alert-*` in globals.css
   lose the side-stripe border; testimonial card gains a leading "
   (U+201C) glyph at 4.5rem green-500 / opacity 0.6 instead.
   `.alert-icon` hook added for consumers to drop in a Lucide leading
   icon. `LocalTestimonials.tsx` (inline mirror of .card-testimonial)
   gets the same leading-quote treatment — supersedes Phase 1.03 §6.2
   lock for testimonial cards (see Phase-M-10B-Completion.md §1).
2. Chat high-intent banner — inline border-left replaced with leading
   <Sparkles> icon; amber-50 background + amber-700 accent retained.
3. ServiceHero — added `md:h-[max(50vh,400px)]` breakpoint; replaced
   black gradient overlay with brand-tinted color-mix using sunset-
   green-900 at 12%-68% alpha; inline maxHeight moved to
   `2xl:max-h-[600px]` Tailwind class.
4. A11y polish — FaqAccordion `outline: none` removed (focus-visible
   ring restored); LanguageSwitcher `aria-current="true"` → `"page"`
   and aria-label prefixed with visible text (Lighthouse label-content-
   name-mismatch).
5. Touch target — chat composer Send button 40px → 44px.
6. Theming polish — new `--color-bg-deep-charcoal: #0E0E0E` token,
   FooterLegal uses it; wizard `<Check>` icons switched from
   `color="#FFFFFF"` prop to currentColor inheritance with parent
   `color: var(--color-text-on-green)`; FilterChipStrip mask `#000` →
   `var(--color-bg-charcoal)`; InitialsAvatar JSDoc Outfit → Manrope.
7. Performance — `.btn { will-change: transform }` scoped to
   `:hover, :focus-visible` instead of permanent.
8. AnimateIn / StaggerContainer / StaggerItem — JSDoc added explaining
   `initial={false}` is intentional (M.10 anti-flicker fix per
   Goran's "once visible, stay visible" requirement). No runtime
   change.

Verified live on localhost:51093 — testimonial computed styles
confirm zero border-left + correct quote-glyph position/color;
ServiceHero scrim confirms color-mix green-900 12%→68% alpha;
LanguageSwitcher aria-label confirms "EN — Ver esta página en
inglés".

`npx tsc --noEmit` clean.

Decisions, carve-outs (3 email templates + dev/system blockquote),
and per-file diff details captured in Phase-M-10B-Completion.md.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```
