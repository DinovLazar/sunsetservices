# Accessibility report — Sunset Services U.S.

**Standard:** WCAG 2.2 Level AA (includes all of WCAG 2.1 AA — the standard referenced in ADA
web-accessibility cases and the 2024 DOJ rule).
**Date:** 2026-08-20
**Branch:** `a11y-remediation`
**Scope:** the whole public site, English and Spanish.
**Tested against:** a clean production build (`npm run build` + `next start`), not the dev server.

---

## Plain-language summary

The site was already in good shape. An earlier accessibility phase (B.06, May 2026) had brought
the automated scanners to zero, and that work has held up. What this pass found is a set of
problems that **the automated scanners cannot see**, plus one real cluster of scanner-visible
failures on a section of the site that had never been scanned.

Two things caused most of what was found:

1. **The old scan only looked at 22 pages out of ~192.** It checked one of the five service
   divisions. The Hardscape division — which uses a different accent colour — was never scanned,
   and that colour fails the contrast rules. Spanish pages were only spot-checked on 3 URLs, none
   of which showed project content, which is why six Spanish pages were shipping with **no
   headline at all** and nobody noticed.
2. **Automated tools only catch roughly a third of accessibility problems.** They cannot tell you
   that a focus outline is invisible, that pressing Escape does nothing, or that a heading
   announces the wrong words. Those were found by reading the code and by driving the real site
   with a keyboard.

### The numbers

| Check | Before | After |
|---|---|---|
| Pages scanned | 22 (previous harness) | **76** (every route family, both languages) |
| axe-core violations | 60 issues on 6 pages | **0** |
| pa11y errors | 100 issues on 32 pages | **32** — 2 false positives + **30 that are a single real, newly-found problem** (see below) |
| Lighthouse accessibility | 97–100 | **97–100** (every page ≥ 97; the 3-point loss is explained below) |
| Issues found by reading the code | — | 57 raised → **38 confirmed**, 6 disproved and discarded, 13 unreviewed (see note) |
| Distinct WCAG issues fixed in this branch | — | **16**, across 15 files |
| Test-harness improvements | — | 2 (wider page coverage + a new empty-heading check) |
| Open items documented, not fixed | — | 22 |
| Questions needing an owner decision | — | 7 |

> **On "13 unreviewed":** every finding raised by the code review was meant to be re-checked by a
> second pass instructed to disprove it. Two of those checking passes did not complete, so 13
> findings carry the original author's word alone. Most of those 13 restate something another pass
> already confirmed; after removing duplicates, **five distinct unverified items** remain, called
> out under the open-items table. Confirm those five against the code before acting on them.

> **Read the pa11y row carefully.** The 30 remaining errors are not noise and were not there before —
> they were always there, hidden inside a category the previous phase had dismissed. They are the
> single most important thing in this report and they are **not fixed**, because fixing them
> properly is a design decision. See *The one big thing that is still broken*, below.

**Nothing about the visual design changed** except where a colour had to be darkened to be
legible. Those changes are listed with exact before/after values in the colour table.

---

## The one big thing that is still broken

**Every division landing page and service page shows its small caption line ("LANDSCAPE DIVISION",
"HARDSCAPE DIVISION", …) in a dark colour on top of a photograph. It is, in places, effectively
invisible.** This affects all five divisions in both languages — about 30 pages.

This one is worth explaining, because it is the reason to be careful about the phrase "the scanners
are green".

- **axe** could not judge it. When text sits on a photo, axe cannot read the image, so it files the
  result as "needs a human to check" rather than as a failure. The previous phase reviewed that
  bucket and concluded it was fine. That conclusion was right for the *white* headline text on
  these heroes — and wrong for this *dark* caption, which was in the same bucket.
- **pa11y** did flag it, all 30 times.
- A code comment on the caption (added in phase B-16) reads: *"the accent-coloured kicker was
  near-invisible over bright imagery"*. Someone had already noticed. The fix applied at the time
  was a drop-shadow halo — which helps a sighted person somewhat, but **shadows do not count
  toward the contrast requirement** and neither scanner credits them.

To settle it, the actual pixels behind the text were measured — screenshotting each hero with the
caption's letters hidden, then reading the real composited colours behind it:

| Page | Caption colour | Contrast against the darkest 5% / the median / the brightest 5% of what's behind it |
|---|---|---|
| `/landscape` | dark green `#2F5D27` | 2.37 / **1.04** / 5.60 |
| `/hardscape` | dark amber `#8F5D14` | 2.90 / **1.36** / 3.54 |
| `/waterproofing` | deep green `#1A3617` | 2.39 / **4.32** / 8.05 |
| `/snow-removal` | charcoal `#1A1A1A` | **1.15** / 7.41 / 13.43 |
| `/trenchless` | burnt orange `#B45309` | 3.40 / **2.32** / 1.95 |

The requirement is 4.5:1. A ratio of 1.04:1 means the text and its background are very nearly the
same brightness — on `/landscape`, across most of the caption, the text is essentially not there.

**Why it was not fixed here:** no colour choice solves it. The brightness behind the text ranges
from almost black to almost white *within the same line of text*, because it is a photograph. A
light caption fails over the bright parts; a dark caption fails over the dark parts. This was
verified by testing light tints of each division colour — every one still fails somewhere. The only
reliable fix is to put a guaranteed dark panel (a "scrim") behind the caption, or to move the
caption off the photograph. **Both change how five hero banners look, which is the owner's call,
not mine.** It is the first item in *Needs owner decision*.

**One disclosure.** The Hardscape accent was darkened in this branch (`#B47821` → `#8F5D14`) to fix
58 real contrast failures on white backgrounds. That same token also colours this caption, where
darker is very slightly worse (median 1.49 → 1.36). Both numbers are far below the requirement, so
this caption was failing before and still fails now — the change did not create the problem and does
not meaningfully worsen it, but it should be stated plainly rather than buried.

---

## Severity key

- **Critical** — blocks a person from using part of the site entirely.
- **Major** — a serious barrier; the person can get through but with real difficulty.
- **Minor** — friction, confusion, or noise for screen-reader users.

---

## What was fixed

### 1. Six Spanish project pages had no headline at all — Critical

`/es/projects/...` pages read the Spanish project title straight out of the CMS. For six of the
ten projects that Spanish title has never been written, so the page rendered an **completely empty
`<h1>`**, and six of the ten project cards on `/es/projects` rendered empty `<h3>`s.

Why this matters: screen-reader users navigate a page by jumping between headings. An empty
heading means the software announces "heading level 1" and then says nothing. The page has no
title in the only structure that matters to them. It also emptied the page's search-engine
structured data and its social-share image text.

**Fixed** by adding `src/lib/projects/resolveProjectTitle.ts`, which falls back to the English
title when the Spanish one is missing, and routing all eleven places that read the title through
it. Showing the English title on a Spanish page is a visible, honest fallback; an empty heading is
silent and unrecoverable.

**This is a floor, not a cure.** The six projects still need real Spanish titles — see
*Needs owner decision*.

| WCAG | Files |
|---|---|
| 1.3.1 Info and Relationships (A), 2.4.6 Headings and Labels (AA) | `src/lib/projects/resolveProjectTitle.ts` (new) + 11 call sites |

### 2. Pressing Escape did nothing, anywhere on the site — Major

The cookie banner installs a keyboard listener on the whole document that deliberately cancels the
Escape key, so that Escape can't be used to dismiss the banner without making a choice. That part
is intentional and fine. Two things were wrong with it:

- The listener was **never removed**. When the visitor accepts or rejects cookies, the banner stops
  drawing itself but the component does not actually unmount, and the code that removes the
  listener never ran. So **for the rest of the session, Escape was dead across the entire site.**
- It cancelled Escape **globally**, not just for the banner.

The visible consequence: the "Services" and "Resources" mega-menus in the navigation open on hover
and on keyboard focus, and **could not be closed with Escape**. WCAG requires content that appears
on hover or focus to be dismissible without moving the mouse.

This was found by instrumenting the browser to trace which code was cancelling the key — not by a
scanner. No scanner detects this.

**Fixed** by adding the missing condition so the listener is torn down when the banner stops
rendering, and by scoping the Escape cancellation to keystrokes that actually belong to the banner.

| WCAG | File |
|---|---|
| 1.4.13 Content on Hover or Focus (AA), 2.1.2 No Keyboard Trap (A) | `src/components/analytics/ConsentBanner.tsx` |

### 3. The main green "Get a quote" button had no visible focus outline — Major

`.btn-primary` overrode its focus ring to white, with a comment explaining that a white ring sits
nicely on the button's green background. But the site draws focus rings **2px outside** the button,
so the ring lands on the page background, not on the green. A white ring on a white page measures
**1.00:1** — it is literally invisible. Keyboard users had no way to see that the site's primary
button was focused, on every page that has one.

**Fixed** by removing the override so the button uses the standard focus colour (4.18:1 on white).

### 4. Every article heading announced as "Anchor link" — Major

In blog posts and resource guides, each `<h2>` is wrapped in a link so it can be linked to
directly. That link carried `aria-label="Anchor link"`. Because the link is the heading's only
content, that label **replaced the heading's own text** for screen readers. Every H2 in every
article announced as *"Anchor link, heading level 2"*, and an article with seven sections produced
seven identically-named links — making heading navigation useless on the site's longest content.

The older Markdown renderer in the same repo names these links correctly, so this was a regression
introduced when the content pipeline moved to Portable Text, not a deliberate pattern.

**Fixed** by removing the label. Verified: `/blog/dupage-patio-cost-2026` now exposes 7 headings
with their real text and 0 overriding labels.

| WCAG | File |
|---|---|
| 2.5.3 Label in Name (A), 2.4.6 (AA), 4.1.2 (A) | `src/components/content/portableTextComponents.tsx` |

### 5. The Hardscape section failed colour contrast site-wide — Major

Every division re-themes one accent colour. Hardscape's accent is amber `#B47821`, and that accent
is used for **text** — eyebrow labels and the small qualifier pills. It measures 3.72:1 on white
and 3.48:1 on its own chip background; AA requires 4.5:1. This produced **58 separate failures
across six pages** and was invisible to the old scan because `/hardscape` was never in the URL list.

The same class of bug had already been found and fixed for the Trenchless division in an earlier
phase — Hardscape simply was not re-checked at the time.

**Fixed** by adding an AA-safe `--color-sunset-amber-800` (`#8F5D14`) and using it for the
Hardscape accent, the amber button's hover state, and the chat banner's secondary button label.

### 6. Everything else that was fixed

| # | Issue | Severity | WCAG | File |
|---|---|---|---|---|
| 6 | Focus outline colour `#6FA85F` failed the 3:1 minimum on **every** light background (2.82:1 white, 2.64 cream, 2.42 stone). The code comment claimed it passed; measurement disproved it. Changed to green-500, which clears 3:1 on light **and** dark. | Major | 1.4.11 | `src/app/globals.css` |
| 7 | Text input borders were too faint to identify the control. A white input on a white page is identified **only** by its border, so that border must reach 3:1. Two separate places were failing: the quote wizard's shared input style at `#E5E0D5` (**1.32:1**), and the contact form, which styles its inputs inline using `var(--color-border-soft, …)` — **a token that is not defined anywhere**, so every control silently rendered at the hardcoded `#C9C2AE` fallback (**1.80:1**). Added a form-only border token (3.81:1) and pointed both at it. Decorative hairlines elsewhere deliberately keep their intended lightness. | Major | 1.4.11 | `src/app/globals.css`, `forms/ContactForm.tsx` |
| 8 | The amber call-to-action's **hover** state put cream text on amber-700 at 3.48:1. This is the one primary CTA on most pages. | Major | 1.4.3 | `src/app/globals.css` |
| 9 | The selected tile in the quote wizard's first step cancelled its own focus outline. Because arrow keys move selection **with** focus in a radio group, the focused tile is always the selected one — so focus was invisible for the entire step. | Major | 2.4.7 | `src/components/wizard/WizardStep1Audience.tsx` |
| 10 | Blog and resource "not found" pages are hardcoded English but also render at `/es/...` inside `<html lang="es">`, so a Spanish screen-reader voice read English text. Marked with `lang="en"` (the pattern already used elsewhere in this repo) rather than inventing untranslated copy. | Major | 3.1.2 | `blog/[slug]/not-found.tsx`, `resources/[slug]/not-found.tsx` |
| 11 | A `<dl>` description list containing a `<dd>` with no `<dt>` — broken list structure exposed to screen readers. It was a single credential line, so it is now a `<p>`. | Minor | 1.3.1 | `AudienceUnilockBand.tsx` |
| 12 | The unsubscribe page rendered its own `<main>` **inside** the layout's `<main>`, giving the page two main landmarks. | Minor | 1.3.1 | `unsubscribe/[token]/page.tsx` |
| 13 | The projects page jumped from `<h1>` straight to `<h3>` whenever a filter returned no results. | Minor | 1.3.1 | `projects/EmptyState.tsx` |
| 14 | **The newsletter email field was 22px tall on mobile** — under the 24px minimum for a tappable control. The form switches to a vertical layout below the `sm` breakpoint, which made the `flex-1` class govern the field's *height* and cancel the 48px set beside it. Desktop was unaffected, which is why no previous scan saw it. Verified at 48px on both a 412px phone and a 1366px desktop. | Major | 2.5.8 | `forms/NewsletterSignup.tsx` |

### 7. The test harness itself was fixed

The reason these bugs shipped is that the automated gate could not see them. Two changes make that
permanent:

- **URL coverage 22 → 31.** Added all five division landing pages (only one was covered), a
  Hardscape service page, `/terms`, `/thank-you`, the sitewide 404, and — importantly — the two
  Spanish project routes that would have caught the empty headings.
- **A new empty-heading check.** axe *does* have a rule for empty headings, but it is tagged
  "best-practice", and this harness deliberately filters to WCAG-only rules. That filter is why six
  empty `<h1>`s passed every run. The check is now built into the harness directly, and it is
  self-tested: it reports clean on a good page, catches an injected empty `<h2>`, and correctly
  ignores a heading that has an accessible label.

---

## Colour contrast table

Every foreground/background pair actually used together, computed with the WCAG relative-luminance
formula. Text needs 4.5:1; large text and UI boundaries need 3:1.

### Failures found and fixed

| Foreground | Background | Before | After | Required | Fix |
|---|---|---:|---:|---:|---|
| Focus ring `#6FA85F` | white | **2.82** | 4.18 | 3.0 | → green-500 `#4D8A3F` |
| Focus ring `#6FA85F` | cream `#FAF7F1` | **2.64** | 3.91 | 3.0 | → green-500 |
| Focus ring `#6FA85F` | stone `#F2EDE3` | **2.42** | 3.58 | 3.0 | → green-500 |
| Focus ring `#6FA85F` | green-50 `#F1F5EE` | **2.56** | 3.79 | 3.0 | → green-500 |
| Primary-button ring `#FFFFFF` | white page | **1.00** | 4.18 | 3.0 | override removed |
| Primary-button ring `#FFFFFF` | cream page | **1.07** | 3.91 | 3.0 | override removed |
| Wizard input border `#E5E0D5` | white | **1.32** | 3.81 | 3.0 | → `--color-border-field` `#8A8272` |
| Wizard input border `#E5E0D5` | cream | **1.23** | 3.56 | 3.0 | → `--color-border-field` |
| Contact-form input border `#C9C2AE` (undefined-token fallback) | white | **1.80** | 3.81 | 3.0 | → `--color-border-field` |
| Input hover border `#C9C0AE` | white | **1.80** | 5.81 | 3.0 | → `--color-border-field-strong` `#6E6455` |
| Amber accent `#B47821` (13px text) | white | **3.72** | 5.61 | 4.5 | → amber-800 `#8F5D14` |
| Amber accent `#B47821` (13px text) | amber-50 `#FDF7E8` | **3.48** | 5.25 | 4.5 | → amber-800 |
| Amber button hover: cream label | amber-700 `#B47821` | **3.48** | 5.25 | 4.5 | hover bg → amber-800 |
| Chat banner CTA label `#B47821` | amber-50 | **3.48** | 5.25 | 4.5 | → amber-800 |

### Pairs checked and passing (no change made)

| Foreground | Background | Ratio | Required |
|---|---|---:|---:|
| text-primary `#1A1A1A` | white / cream / stone | 17.40 / 16.28 / 14.92 | 4.5 |
| text-secondary `#4A4A4A` | white / cream / stone | 8.86 / 8.29 / 7.60 | 4.5 |
| text-muted `#6B6B6B` | white / cream / stone | 5.33 / 4.98 / 4.57 | 4.5 |
| text-on-dark `#FAF7F1` | charcoal `#1A1A1A` | 16.28 | 4.5 |
| white | green-600 `#3F7335` (primary button) | 5.65 | 4.5 |
| white | green-700 `#2F5D27` (button hover) | 7.73 | 4.5 |
| charcoal | amber-500 `#E8A33D` (amber CTA base) | 8.07 | 4.5 |
| charcoal | orange-500 `#F28C38` | 7.11 | 4.5 |
| success `#2F5D27` | success-bg `#E8F0E1` | 6.62 | 4.5 |
| warning `#8A5A12` | warning-bg `#FBF1D8` | 5.26 | 4.5 |
| danger `#9A3A2A` | danger-bg `#F6E3DD` | 5.63 | 4.5 |
| info `#2B5566` | info-bg `#E2ECF0` | 6.74 | 4.5 |
| orange-700 `#B45309` (Trenchless accent) | white | 5.02 | 4.5 |
| green-700 `#2F5D27` (Landscape accent) | white | 7.73 | 4.5 |
| selection text `#1A3617` | selection bg `#DCE8D5` | 10.45 | 4.5 |
| green-500 focus ring | charcoal `#1A1A1A` | 4.16 | 3.0 |

> **Note on `--color-border` / `--color-border-strong`:** these remain at 1.32:1 and 1.80:1 and
> that is correct. They are used for decorative hairlines — card edges and section dividers —
> which WCAG explicitly exempts. Only form-control boundaries were re-pointed at the new token.

---

## Keyboard walkthrough results

Performed on a real production build by driving the browser, with the cookie banner already
dismissed so the tab order starts clean.

| Page | Skip link is first? | `#main` target exists | Enter moves focus | Focusable controls | `tabindex > 0` | Controls with no focus ring |
|---|---|---|---|---:|---:|---:|
| `/` | ✅ "Skip to main content" | ✅ | ✅ → `main` | 60 | 0 | 0 |
| `/request-quote` | ✅ | ✅ | ✅ → `main` | 48 | 0 | 0 |
| `/contact` | ✅ | ✅ | ✅ → `main` | 65 | 0 | 0 |
| `/projects` | ✅ | ✅ | ✅ → `main` | 64 | 0 | 0 |
| `/hardscape` | ✅ | ✅ | ✅ → `main` | 62 | 0 | 0 |
| `/blog/dupage-patio-cost-2026` | ✅ | ✅ | ✅ → `main` | 69 | 0 | 0 |
| `/es` | ✅ "Saltar al contenido principal" | ✅ | ✅ → `main` | 60 | 0 | 0 |
| `/es/request-quote` | ✅ | ✅ | ✅ → `main` | 48 | 0 | 0 |
| `/es/projects` | ✅ | ✅ | ✅ → `main` | 64 | 0 | 0 |

**Menus and dialogs**

| Surface | Opens by keyboard | Escape closes | Focus returns to trigger |
|---|---|---|---|
| Services mega-menu | ✅ Enter / ArrowDown | ✅ **(fixed this pass)** | ✅ |
| Resources mega-menu | ✅ | ✅ **(fixed this pass)** | ✅ |
| Cookie banner | ✅ (focused on show) | ✗ by design — a choice must be made | n/a |
| Chat panel | ✅ | partial | ✗ — **open item**, see below |
| Quote wizard steps | ✅ | n/a | ✗ — **open item**, see below |

---

## Needs owner decision

These cannot be fixed in code without someone deciding what the correct content is. **No text was
invented** — the project's fabrication-free copy rule was followed throughout.

| # | Question | Recommendation |
|---|---|---|
| 0 | **The division caption on five hero banners is unreadable over its photo** (measurements above; as low as 1.04:1 against a 4.5:1 requirement). No colour fixes it, because the photo is both bright and dark behind the same line of text. How should this be resolved visually? | **Recommended:** put a scrim behind the hero copy block — a solid or near-solid dark panel, or extend the existing bottom-up gradient upward so it covers the caption band at a guaranteed opacity. Then switch the caption to the *light* tint of each division colour (`green-200`, `amber-200`, `orange-300` — the pattern the homepage hero already uses). That keeps the division colour-coding and makes the result independent of whichever photo is behind it. The drop-shadow currently on the caption can then be removed. Second-best, if the photo must stay untouched: move the caption out of the photo band and onto the solid surface below it. |
| 1 | **Six projects have no Spanish title.** `1008-homerton-north-aurora`, `1227-colchester-lane-aurora`, `6135-belmont-downers-grove`, `807-edgewater-drive`, `811-edgewater-drive`, `aurora-area-patio`. Right now the Spanish pages fall back to the English title. | Author the six Spanish titles in Sanity, in the `usted` register per the locked glossary. Until then the English fallback stands and the pages are structurally valid. |
| 2 | **Some image descriptions describe photos that are no longer there.** When real photography replaced the placeholders in Phase M.01, the alt text was not updated, so at least five images are announced as content they do not show. | Someone who can see the photos needs to rewrite those descriptions. This is a content task, not a code task — a wrong description is worse than a generic one. |
| 3 | **13 of 34 service images have no real description** — they fall back to repeating the service name, which duplicates the visible heading and tells a screen-reader user nothing new. | Either write real descriptions, or mark them decorative (`alt=""`) if the photo is purely atmospheric. Decorative is a legitimate and often better answer. |
| 4 | **The Hardscape accent colour is now visibly darker** (`#B47821` → `#8F5D14`). This was required — the old value is unreadable at the size it is used. | Confirm the darker amber is acceptable to the brand, or supply an alternative that reaches 4.5:1 on both white and `#FDF7E8`. |
| 5 | **The cookie banner traps keyboard focus** until a choice is made. Whether that is acceptable is a legal/UX decision, not purely a technical one. | Common practice for consent gates, and the user can always exit by choosing. Flagging it because it is technically a keyboard trap under 2.1.2. |
| 6 | **Blog/resource "not found" pages are English-only.** They are now marked `lang="en"` so screen readers pronounce them correctly, but Spanish visitors still read English. | Add a translated namespace for these two pages at EN/ES key parity. |

---

## Open items — found, verified, not fixed in this branch

These are real and each was checked by a second pass that tried to disprove it. They were left out
because each one changes runtime behaviour (focus movement, live announcements) and deserves its
own change with its own testing, rather than being bundled into a remediation branch. **They are
listed most serious first.**

| # | Issue | Severity | WCAG | File |
|---|---|---|---|---|
| 1 | Advancing a step in the quote wizard destroys the focused "Next" button and sets no new focus, so focus falls back to the top of the document and the step change is never announced. | Major | 2.4.3, 4.1.3 | `wizard/WizardShell.tsx` |
| 2 | Submitting the contact form unmounts the whole form on success; focus is dropped and the success message is created in the same paint as its text, so screen readers may not announce it. | Major | 4.1.3, 2.4.3 | `forms/ContactForm.tsx` |
| 3 | Checkbox-group option pills have no visible focus indicator (the real input is clipped to 1×1 and the label lacks the focus hook the radio pills have). | Major | 2.4.7 | `wizard/WizardField.tsx` |
| 4 | An open mega-menu does not close when focus leaves it, so following tab stops can be completely covered by the fixed overlay. | Major | 2.4.11 | `layout/ServicesMegaPanel.tsx` |
| 5 | The chat composer disables the element that currently has focus on every send, dropping focus to the document body. | Major | 2.4.3 | `chat/ChatComposer.tsx` |
| 6 | Photo-upload error messages are injected into a live region that is `display:none` until the error exists, which suppresses the announcement. | Major | 4.1.3 | `wizard/PhotoUploadField.tsx` |
| 7 | The blog results grid is itself a live region, so changing a filter reads out every card. | Major | 4.1.3 | `blog/page.tsx` |
| 8 | Chat messages expose hardcoded English accessible names on Spanish pages. | Major | 3.1.2 | `chat/ChatMessageBubble.tsx` |
| 9 | Focusing a city pin on the service-area map makes it *less* visible — the focus stroke drops it to 1.48:1 against its own fill. | Minor | 1.4.11, 2.4.7 | `service-areas/ServiceAreaMap.tsx` |
| 10 | The chat panel never receives focus when opened and never returns focus to the bubble when closed; its kebab menu has no Escape handling, no outside-click close, and no focus return. | Minor | 2.4.3 | `chat/ChatPanel.tsx` |
| 11 | Table-of-contents links scroll a heading into view but never move focus to it, so keyboard users keep their old position. | Minor | 2.4.3 | `content/TOC.client.tsx` |
| 12 | Breadcrumb, pagination and several landmark names are hardcoded English on Spanish pages. | Minor | 3.1.2 | `ui/Breadcrumb.tsx` + 5 others |
| 13 | All three 404 pages fall back to the generic site title — nothing identifies them as an error page. | Minor | 2.4.2 | `not-found.tsx` ×3 |
| 14 | Required radio and checkbox groups expose no programmatic "required" — the asterisk is hidden from screen readers and `aria-required` on a `<fieldset>` is ignored. | Minor | 3.3.2 | `wizard/WizardField.tsx` |
| 15 | Group fields render a `<label for="…">` pointing at an id no element has. | Minor | 1.3.1 | `wizard/WizardField.tsx` |
| 16 | Project gallery thumbnails put the label on the wrapping button, which suppresses each photo's own description — users hear "Open 3 / 8" and nothing about the image. | Minor | 1.1.1 | `detail/ProjectGallery.tsx` |
| 17 | The chat dialog's accessible name absorbs its three toolbar button labels. | Minor | 4.1.2 | `chat/ChatPanel.tsx` |
| 18 | The chat kebab uses `role="menu"`/`"menuitem"` without the keyboard behaviour those roles promise. | Minor | 4.1.2 | `chat/ChatPanel.tsx` |
| 19 | The wizard's review-step photo strip scrolls horizontally but is not keyboard-reachable; the chat message log has the same problem. | Minor | 2.1.1 | `WizardStep5Review.tsx`, `ChatMessageLog.tsx` |
| 20 | City cards build their image description from an English template, so Spanish pages ship English alt text. | Minor | 1.1.1 | `ui/LocationCard.tsx` |
| 21 | Sanity's project image `alt` fields are not required and the query silently turns a missing one into an empty string, so an editor can publish a hero image with no description. | Minor | 1.1.1 | `sanity/schemas/project.ts` |
| 22 | There is no error boundary anywhere in the app, so a render error produces a page with no language and no landmarks. | Minor | 3.1.1 | `[locale]/layout.tsx` |

> **Verification status.** Rows 1–4 and 9–21 were each re-checked by a second pass that read the
> cited code and tried to disprove the claim; they held up. **Rows 5, 6, 7, 8 and 22 were not
> re-checked** — the two review passes covering them did not complete. Treat those five as credible
> leads rather than established facts, and confirm each against the code before acting.

---

## Lighthouse: where the missing 3 points go

Every page scores 100 except `/about` and `/hardscape/patios-walkways`, which score **97**. On both,
the single failing audit is `target-size`, and it is worth being precise about it because one half
of it was a real bug and the other half is not.

- **Real, and fixed.** The newsletter email field collapsed to **22px tall on mobile** — under the
  24px minimum. The form is `flex flex-col sm:flex-row`, so below the `sm` breakpoint the flex main
  axis is vertical and the `flex-1` class on the input resolved to `flex: 1 1 0%` on its *height*,
  overriding the `height: 48px` set right beside it. Desktop was never affected, which is exactly
  why a desktop-viewport scan never caught it. Now pinned with `minHeight`, verified at 48px at both
  412px and 1366px.
- **Not a real failure.** What remains is a 169 × 44px secondary button. Measured directly, it is
  44px tall, nothing overlays it, and probes at its top, middle and bottom all land on the button
  itself. It comfortably satisfies SC 2.5.8, which is met by any target of at least 24 × 24px. The
  deduction comes from the audit's *neighbour-spacing* heuristic being applied to two adjacent
  call-to-action buttons. Forcing the score to 100 would mean re-spacing those CTAs to satisfy a
  tool rather than a requirement, so it was left alone.

---

## Documented false positives

Two findings were investigated and are **not** defects. They are recorded here so nobody re-opens
them. Note that this list is deliberately short: the "text over a photo" category as a whole is
**not** dismissed — 30 of the 32 remaining pa11y errors in that category turned out to be real, as
described above. Each one was measured rather than assumed.

1. **The two `1_4_3.G145` errors on the homepage division cards** (`/` and `/es`). pa11y cannot read
   an image, so it treats the white card headline as white-on-white and reports 1:1. Measured
   against the real composited pixels, the white 34px bold headline sits at **8.01:1 against the
   darkest 5%** of its backdrop and **6.19:1 at the median**, against a 3:1 requirement for large
   text. It passes comfortably. (In the brightest 5% of the backdrop it drops to 1.79:1, which is a
   marginal sliver worth watching if the card photography is ever changed to a lighter image.)
2. **axe `aria-valid-attr-value` on the two mega-menu buttons.** axe reports it cannot determine
   whether the referenced panel exists while `aria-haspopup` is present. It does exist — verified
   directly in the live DOM: both `#services-mega-panel` and `#resources-mega-panel` are present in
   the page even when closed. This is a known axe limitation, not a defect.

---

## Requires human testing

**Automated tools and code review cannot replace testing with a real screen reader and real
users.** Everything above was verified either by scanner, by measurement, or by driving a browser
programmatically. None of that is the same as a person using the site.

On a Mac, VoiceOver is turned on with **Cmd + F5**. On Windows, NVDA is free.

The five flows that most need a human with a screen reader:

1. **Complete the quote wizard end to end, keyboard only.** This is the site's main conversion
   path, it has five steps, and open items 1, 3, 6, 14 and 15 all live in it. Specifically check:
   after clicking "Next", where does focus go, and is the new step announced?
2. **Submit the contact form and listen for the confirmation.** Open item 2 predicts the success
   message may pass silently. Confirm whether it is announced.
3. **Read a full blog post with heading navigation** (VoiceOver rotor, or `H` in NVDA). The
   "Anchor link" bug is fixed, so every heading should now read its real text — this is worth
   confirming by ear.
4. **Browse the Spanish site.** Confirm the Spanish voice is used, that the English fallback
   titles on the six project pages are acceptable in the meantime, and that the English-only 404
   pages are pronounced as English rather than as broken Spanish.
5. **Open and close the chat widget by keyboard.** Open item 10 predicts focus is not moved in and
   not returned on close.

Also worth doing by hand, without a screen reader: view the site at **200% browser zoom** and at a
**320px-wide window**, and confirm nothing is cut off or requires sideways scrolling.

**Be aware that this is the weakest part of the audit.** Of the seven code-review passes run, the
two covering zoom/reflow/target-size and fine-grained ARIA detail did not complete, so that ground
was covered only by spot checks rather than systematically. That gap is not theoretical: the one
mobile-viewport check that *was* run immediately turned up a real failure — the newsletter field
collapsing to 22px on phones, invisible to every desktop-width scan the project has ever run. It is
reasonable to assume more of that class exists at narrow widths and under zoom. A focused
responsive-accessibility pass is the single highest-value follow-up after the hero-caption
decision.

---

## Conformance statement

Remediated toward WCAG 2.2 Level AA; see open items above.

---

## Where the raw data is

- `docs/a11y-scan-before/` — axe and pa11y results for all 76 URLs before any change
- `docs/a11y-scan-after/` — the same scans after the fixes
- `npm run validate:a11y` — the project's own gate, now covering 31 URLs and checking for empty
  headings
