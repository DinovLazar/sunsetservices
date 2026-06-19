# M.15 — Manual screen-reader checklist (for the Cowork human a11y pass)

**Purpose.** The automated harness (`npm run validate:a11y` — axe-core + Lighthouse a11y + programmatic WCAG 2.2 SC 2.4.11 / 2.5.8) exits 0 across the full URL set, but automation cannot judge *announcement quality*, *focus order through dynamic flows*, or *whether a live region actually speaks*. This checklist covers exactly those gaps. Run it once on **NVDA + Firefox (Windows)** and once on **VoiceOver + Safari (macOS)** (Narrator + Edge is an acceptable third pass). Test in **both EN and ES**.

**Scope note (M.15 Stream 8).** Phase M.02 removed `<MotionConfig reducedMotion="user">` from the layout. Reduced-motion is now honored by (a) a global `@media (prefers-reduced-motion: reduce)` guard in `globals.css` that flattens `animation` + `transition` duration sitewide, (b) per-component `useReducedMotion()` (HomeHeroCarousel pauses auto-advance) and `motion-reduce:` Tailwind variants (NavbarMobile drawer, ConsentBanner slide). Item 7 below verifies this with a real OS "reduce motion" setting — the one thing the harness can't simulate.

---

## How to run

1. Test the **Vercel Preview** URL (not localhost) so you exercise the real deploy. Use the per-deployment URL with the share-token bypass if SSO is on.
2. Use **headphones**; turn the screen off for the "speak" checks where noted — if it only works by looking, it fails.
3. Mark each row **PASS / FAIL / N/A** with a note. File FAILs as issues; the harness won't catch these.

Legend: 🔊 = "must be announced" (listen, don't look) · ⌨️ = keyboard-only (unplug the mouse).

---

## 1. Global / landmark structure
- [ ] ⌨️ `Tab` from page load: a visible **"Skip to content"** link appears first and jumps focus to `<main>`.
- [ ] 🔊 Landmark rotor (NVDA `D` / VO rotor → Landmarks) lists exactly one `banner`, one `main`, one `contentinfo`, and `navigation` regions with distinct accessible names.
- [ ] 🔊 Exactly one `<h1>` per page; heading rotor shows no level skips (h1→h2→h3, no h1→h3).
- [ ] ⌨️ Language switcher (EN/ES): reachable, has an accessible name ("Switch to Spanish / English"), and announces the change; after switching, `<html lang>` flips (rotor language indicator changes).

## 2. Primary navigation — mega-menus (desktop) ⌨️
- [ ] ⌨️ `Tab` to "Services" / "Resources" trigger → `Enter`/`Space` opens the panel; `aria-expanded` flips to true (announced).
- [ ] ⌨️ Focus moves into the panel; `Tab` cycles through its links in visual order; `Esc` closes and returns focus to the trigger.
- [ ] 🔊 When closed, the panel's links are **not** reachable by Tab and **not** announced (the panel is `inert` + `invisible` when closed — verify a closed panel's links never receive focus).
- [ ] ⌨️ Hover-open does not trap keyboard users; keyboard open/close is independent of mouse.

## 3. Mobile nav drawer + bottom-sheet dialogs (narrow viewport / touch SR)
- [ ] ⌨️/touch Open the mobile menu → focus moves into the drawer; a **focus trap** holds focus inside (Tab from last item wraps to first); `Esc` / close button returns focus to the hamburger.
- [ ] 🔊 Drawer announces as a dialog/menu with a name; background content is `inert` (swipe/Tab cannot reach page content behind it).
- [ ] 🔊 The **chat bottom-sheet** and any mobile modal: same focus-trap + restore-focus-on-close behavior; opening announces the dialog name.

## 4. Quote wizard (`/request-quote/`) — step-to-step focus management ⌨️🔊
- [ ] 🔊 On each "Next", focus moves to the new step's heading (or step container) and the **step change is announced** (e.g. "Step 2 of 5, Project details") — focus must NOT silently stay on the now-hidden Next button.
- [ ] 🔊 Field labels are read **before** the input; required state announced; help text associated (`aria-describedby`).
- [ ] 🔊 Validation errors: on submit-with-errors, focus moves to the first invalid field and the **error text is announced** (errors render below the field, associated via `aria-describedby`/`aria-invalid`).
- [ ] ⌨️ Back/Next don't lose progress; the autosave "resumed" state (Steps 1–3) announces when restored.
- [ ] 🔊 Step 4 PII fields: confirm nothing about prior steps is re-announced incorrectly; confirm the address autocomplete (Google Places `.pac-container`) is operable by keyboard and its options are announced.

## 5. AI chat widget — streaming announcements 🔊
- [ ] 🔊 Opening the chat (icon-only bubble) announces its accessible name ("Open chat" / "Chat with us").
- [ ] 🔊 The assistant's **streaming** reply is announced without spamming every token — the message area is an `aria-live="polite"` region that settles on the completed message (verify it doesn't read each token, and that the final answer is readable via the rotor afterward).
- [ ] 🔊 Lead-capture form inside chat (name + email): labels announced, errors announced, success state announced.
- [ ] ⌨️ Full keyboard operation: open → type → send (`Enter`) → read reply → close, mouse unplugged.

## 6. Toasts / live regions 🔊
- [ ] 🔊 The autosave/resume toast and any success/error toast are announced when they appear (`role="status"`/`aria-live`), and do not steal focus.
- [ ] 🔊 Cookie-consent banner: announced on appearance as a dialog with name; Accept/Decline/Manage are reachable and announced; "Manage preferences" opens the (lazy-loaded) modal with a proper dialog name + focus trap.

## 7. Reduced motion (real OS setting — harness cannot simulate) 🔊
- [ ] Turn ON the OS "Reduce motion" setting (Win: Settings → Accessibility → Visual effects → Animation; macOS: System Settings → Accessibility → Display → Reduce motion).
- [ ] Home hero **carousel stops auto-advancing** (shows the first image only — `useReducedMotion`).
- [ ] Cookie banner appears **without the slide-up** (at rest); mega-panels and the mobile drawer open without transform animation.
- [ ] No essential content is *only* conveyed by an animation that's now disabled.

## 8. Forms on `/contact/` + newsletter 🔊
- [ ] 🔊 Contact form: labels-above-fields announced; errors-below announced; submit success path announced.
- [ ] 🔊 Newsletter signup: same; the welcome email's unsubscribe link works (cross-check separately) — here just verify the signup field/label/SR flow.

## 9. Content pages — reading experience 🔊
- [ ] 🔊 FAQ accordions: each question is a real heading/button, `aria-expanded` announced, answer revealed and readable; **no literal `###`** is spoken (the `stripFaqHeadingMarker` fix).
- [ ] 🔊 Images: hero/portrait/project images have meaningful alt (e.g. "Erick Valle on a DuPage County job site…"); decorative carousel frames are not announced redundantly; **no "Erick Solis"** anywhere.
- [ ] 🔊 Project/blog cards: link names are meaningful out of context (not "read more" ×6).

## 10. EN ↔ ES parity
- [ ] Repeat the highest-value flows (wizard, chat, nav, consent) in **Spanish**; confirm announcements are in Spanish and read naturally (this also feeds the still-pending **native ES review** — flag anything that reads as machine-translated).

---

### Known code-side state going in (so testers don't re-file these)
- Automated axe/Lighthouse a11y: **0 violations, Lighthouse a11y 100** across the sweep set (B.06 + re-run in M.15 Stream 8).
- Reduced-motion: global CSS guard + per-component handling in place (item 7 verifies the lived experience).
- `/dev/system` is a noindex developer sandbox (not a customer surface) — skip it.
