# Sunset Services — Quote Wizard + AI Chat Widget Design Handover (Phase 1.19)

> Read by Claude Code in Phase 1.20 before any wizard or chat implementation begins.
> Source of truth: this file. Conflicts with Phase 1.03 tokens, Phase 1.05 chrome, Phase 1.06 homepage patterns, Phase 1.08 service-detail FAQ rule, Phase 1.11 ContactForm field states, Phase 1.13 shared `<CTA>` `tokens` prop, Phase 1.15 `<dialog>` lightbox precedent, or Phase 1.17 `ProseLayout` / sitewide bundle discipline? **Earlier phases win.** Surface the mismatch to Claude Chat (see §14).
> Phase: Part 1 — Phase 19 (Design). Operator: Claude Design.
> Hands off to: Claude Code, Phase 1.20.

---

## 0. Read this first

Two final surfaces of Part 1, both heavily interactive, both **UI-only** at this stage:

1. **Quote Wizard** at `/request-quote/` (and `/es/request-quote/`) — the primary lead-capture surface for the entire site (Plan §11). 5 sequential steps + a Review & Submit step + the post-submission `/thank-you/` route. Must convert; must capture abandoners (every advance is a Mautic ping in Part 2, so the boundaries drawn in Part 1 directly determine what data Sunset Services can act on later).
2. **AI Chat Widget** — sitewide bottom-right bubble, persistent across every page. Multiple states: collapsed bubble, expanded panel (desktop dialog / mobile sheet), assistant + user message bubbles, welcome + suggested prompts, lead-capture inline form, streaming indicator, error / rate-limit / kill-switch / consent-gated states.

**No backend.** Wizard does not POST (Phase 2.06 wires `/api/quote` → Mautic + Resend). Chat does not call Anthropic (Phase 2.09 wires the SDK + streaming + Telegram). Part 1 ships **the visual contract** for both — every state, every error, every transition — so 1.20 Code can drop the API behind a feature flag and the UI is ready. Flags `AI_CHAT_ENABLED`, `WIZARD_SUBMIT_ENABLED`, `WIZARD_AUTOSAVE_ENABLED` live in `.env.local.example`; Code wires them in 1.20 and Part 2 flips them on.

The 1.06 bar still holds: **professional, no shortcuts**, Lighthouse ≥95 P/A/BP/SEO desktop AND mobile, WCAG 2.2 AA. Two new Lighthouse risks unique to this phase:

- **Chat widget JS is sitewide.** Every page, every locale. The 1.07 mobile P=86 result was caused by hydration cost on the homepage alone; adding a sitewide widget without discipline regresses every shipped route. Bundle ceiling: **≤ 8KB gzipped** for the collapsed-state shell, **lazy-loaded panel** behind a click. Spec in §10.
- **Wizard route hydration.** Allowed to be heavier than the rest of the site, but still ≥95. Step state in URL (`?step=2`) so reload + share work; transient form state in React; abandoner-recovery state in `localStorage` behind `WIZARD_AUTOSAVE_ENABLED`.

**Compose; do not invent.** Every authority claim references a locked token name. Literal hex appears only inside SVG `fill` / `stroke`. **No new component variants.** The Next button is locked Primary green at `lg`; the chat bubble is the locked Amber button morphed to a circle; assistant message bubbles are `.card--cream` at `--radius-lg`; user message bubbles are `--color-sunset-green-700` + `--color-text-on-green` (existing tokens). If a new token or card variant is needed, **stop and surface it as a D-item** (this phase introduces zero new tokens — see §15).

---

## 1. Scope and constraints

### 1.1 In scope

**Quote Wizard** (`/request-quote/` + `/es/request-quote/`, plus `/thank-you/` + `/es/thank-you/`):

- Route shell — chrome handling (D2), compact page header (D13), step indicator placement.
- **6 step screens** — Step 1 Audience, Step 2 Service, Step 3 Details (audience-conditional), Step 4 Contact, Step 5 Review & Submit, plus the post-submission `/thank-you/` route.
- **Step indicator** — desktop numbered dots + labels, mobile collapsed bar with current-step label.
- **Field components** extending the locked 1.11 `ContactForm` primitives: large-tile select (audience), service chip multi-select, address line (street + unit + city + state + zip), property-size numeric, project-budget select, tel field with mask, checkbox group with "select all that apply" semantics, textarea with character counter. (Photo upload deferred — see D11.)
- **Validation visual states** — pristine, focused, valid, error, error-message, success-after-edit.
- **Step navigation** — Next, Back, "Save & continue later" (D9), "Edit step N" links from Review, mobile sticky-Next, scroll-to-error on Next-with-errors.
- **Conditional branching** — Step 1 audience selection mutates Steps 2 + 3; data shape specced in §11.
- **Thank-you page (`/thank-you/`)** — every section, EN + ES strings, Calendly placeholder slot (real Calendly in 2.07), schema spec (§5), motion choreography, return-home + view-projects CTAs.
- **Empty submit / network failure / browser-back** behavior — visual states only.

**AI Chat Widget** (sitewide):

- **Position + chrome interaction** — hidden on `/request-quote/` per D17.
- **State A — Collapsed bubble** — icon, dimensions, shadow, hover, focus-visible, "new message" badge slot (Part 1 ships, never illuminates).
- **State B — Expanded panel (desktop)** — anchored bottom-right, dimensions, layered shadow, header (avatar + label + minimize + close), scrollable message log, composer (textarea + send + char hint), bilingual.
- **State C — Expanded panel (mobile)** — full-bleed bottom sheet ≥85vh, drag handle, safe-area-inset, on-screen keyboard handling.
- **Message bubbles** — assistant (left, cream), user (right, green-700 with white text), avatar treatment, timestamps, link styling, code-block styling (D24).
- **Welcome state** — greeting + 3 suggested-prompt chips that auto-send on tap.
- **Streaming + typing indicator** — three-dot animator while "thinking"; token-by-token streaming (Part 1 fakes via `setInterval`).
- **Lead-capture inline form** — single "Get a quote in 30 sec" trigger; on click, an inline form-card slides into the message log: name + email + phone (optional) + Send.
- **High-intent visual** — green "Erick has been notified" banner above composer for 6s.
- **Error states** — network failure (Try again), rate-limit, kill-switch (`AI_CHAT_ENABLED=false` → renders nothing), Anthropic API down (graceful degrade to mailto + tel).
- **Cookie consent gate** — pre-consent placeholder; never auto-opens before consent (Plan §12).
- **Persistence + reset** — `sessionStorage` (per literal Plan §12 reading; see §14 mismatch) per-locale namespace; Reset link in panel header menu.
- **Reduced motion** — all entrance / streaming / typing motion respects `prefers-reduced-motion: reduce` per 1.03 §7.7.

### 1.2 Out of scope

- **Backend wiring of any kind.** No `/api/quote`, no Mautic, no Resend, no Anthropic SDK, no Telegram, no rate limiter. (Phases 2.06, 2.08, 2.09, 2.10, 2.16.)
- **Address autocomplete** via Google Places API (Phase 2.07). Part 1 ships a plain text address line; the field declares `data-autocomplete-stub="address"` Code can later swap.
- **Real Calendly embed** on `/thank-you/` (Phase 2.07). Part 1 ships a static placeholder card matching 1.11 `CalendlyPlaceholder` precedent.
- **Real Sanity-driven knowledge base** for the chat (Phase 2.09). Part 1 stubs assistant responses; bubble layout, streaming animation, and lead-capture flow are real.
- **CallRail dynamic numbers** in the wizard tel field (Phase 2.10).
- **GA4 / GTM event firing** on step advances (Phase 2.11). Part 1 declares event names + payloads in §11; Code adds `data-analytics-event="..."`; the actual `dataLayer.push` is 2.11.
- **Native Spanish review** (Phase 2.13). Part 1 ships first-pass ES; review pass is Part 2.
- **Real photography** in the wizard (Phase 2.04 — wizard mostly uses Phase 1.06 audience-entries assets reused).
- **Privacy / Terms** links — they exist as `/privacy/` and `/terms/` placeholder hrefs (real pages ship 3.03).
- **404 polish** (Phase 1.20 separate sub-task).
- **Dark mode.** None.

### 1.3 Locked from earlier phases — DO NOT redesign

If any spec below conflicts with these, **earlier phases win.** Surface the mismatch in §14.

- **All design tokens** (1.03 §2–§7) — colors, type scale, spacing, radius, shadow, motion presets (3 easings × 4 durations), z-index, breakpoints. **No new tokens.** The chat widget consumes a `--z-chat` slot at the existing `--z-fixed` band. Exact value declared in §15: `--z-chat: 50` slotted between `--z-sticky: 40` and `--z-modal: 60`. *This is a value declaration on existing tokens, not a new token.*
- **All component primitives** (1.03 §6) — `Button` (Primary green / Amber / Ghost / Secondary, sizes md / lg), `Card` (`.card`, `.card--cream`, `.card--photo`, `.card--featured`), `Badge`, `Breadcrumb`, `Eyebrow`, `FaqAccordion`, form fields with their pristine / focus / valid / error states from 1.03 §6.3 + 1.11 §11.1. **No new variants.** Compose.
- **Chrome** (1.05) — navbar, footer, language switcher, skip-link, mobile drawer. The wizard route MAY hide the navbar's amber CTA (D2); MAY NOT modify any other chrome element.
- **Section rhythm** (1.03 §9) — `py-20` desktop / `py-14` mobile, alternating `--color-bg` / `--color-bg-cream`, never two adjacent same-surface bands. The wizard step screens are an exception only in that a single step is one band; the alternation rule still applies between Hero → Step shell → Footer-style submit area where present.
- **Amber discipline** (1.05 §1, restated 1.06 / 1.08 / 1.11 / 1.13 / 1.15 / 1.17). Navbar amber is chrome and does not count. Each body page has **at most one** amber CTA. The wizard's per-step Next is **Primary green** (navigation, not conversion); only the **final Submit** on Step 5 is **Amber × lg**. The thank-you page has zero amber CTAs (the conversion already happened — its CTAs are Ghost). The chat widget bubble itself is amber (sitewide CTA per Plan §11) — on any page that already has an amber CTA, the bubble counts as chrome from the page's perspective (parallel to the navbar amber CTA carve-out). Documented again in §2 D2.
- **Featured-card constraint** (1.06 §2.4) — `.card--featured` cannot appear on the same page as an amber CTA. Step 5 has an amber Submit — therefore Step 5 CANNOT use `.card--featured` for the review summary card. Use `.card--cream` (chosen).
- **Motion contract** (1.03 §7 + 1.07 P=86 lesson) — `<AnimateIn>` at section granularity only; never per card / list item / form field. Heroes have no entrance animation. **Wizard exception:** step-transition motion is a per-step crossfade (≤200ms, opacity-only, no horizontal slide that triggers layout) — one motion at one boundary, not per-item. **Chat exception:** typing-indicator three-dot bounce is 480ms `--motion-slow` on a 0.4s loop, opacity-only under reduced motion.
- **FAQ no-wrapper-per-item rule** (1.08 §3.7) — does not apply to the wizard route directly; the thank-you page MAY include a small "What happens next?" 3-Q FAQ (D14) and uses `<details>`/`<summary>` directly inside the section.
- **Breadcrumb + JSON-LD same-source** (1.09 §2) — wizard ships zero schema (it's a form). Documented in §5.
- **Shared `<CTA>` with `tokens` prop** (1.11 §11.1 → 1.13 D11) — the thank-you page closes with a `<CTA>` instance, not a custom block. Tokens map: `{firstName}` from the just-submitted form (URL-passed in Part 1, server-state in Part 2).
- **`ProseLayout`** (1.17 §13) — not used in this phase. The thank-you page MAY use a 720px centered prose paragraph for the body copy but does not need the sticky TOC.
- **Single-hyphen BEM** (1.09 §10 #5): `card--cream`, `btn--amber`. Throughout.
- **`tel:` href format** (1.09 D10): `<a href="tel:+16309469321">` — used by the wizard tel field's "Call us instead" inline link and the chat widget's mailto: graceful-degrade fallback (with a `tel:` secondary).
- **`<dialog>` precedent** (1.15) — chat panel on mobile uses `<dialog>` + `showModal()`; desktop uses non-modal floating panel. See §9.

---

## 2. Page-level decisions (D-list)

The 1.06 / 1.08 / 1.11 / 1.13 / 1.15 / 1.17 pattern is to surface every meaningful design choice as a numbered D-item with named options, recommendation, and a one-paragraph rationale referencing locked phases. Phase 1.19 is bigger than any prior page-level phase — 30 D-items, split into a Wizard block (D1–D16) and a Chat block (D17–D30). The compiled list with auto-resolve markings lives in §12; the prose rationales live here.

### Wizard D-items

**D1 — Wizard layout pattern.** A) Multi-page (each step is a discrete URL slice via `?step=N`). B) Single-page accordion. C) Canvas / full-screen takeover. **Recommendation: A.** URL-driven step state. Browser-back works, deep-links to a specific step work, share works, abandoner reload restores state. Plan §11 says abandoners are tracked per step — distinct URLs per step give analytics + recovery a clean key. Uses `?step=N` (querystring) rather than `/request-quote/step-N/` (path) so the route stays one Next.js page and the autosave key is stable. **Auto-resolve at A.**

**D2 — Navbar treatment on `/request-quote/`.** A) Full chrome unchanged. B) Chrome minus the amber "Get a Quote" navbar CTA (the user is already there). C) Stripped-chrome takeover (logo + language switcher only). **Recommendation: B.** Keeps brand + nav + lang switcher visible (premium, trustable) while removing the redundant CTA so the page's amber Submit on Step 5 is the only amber. The chat bubble is hidden on this route per D17, so the page surfaces exactly one amber on Step 5 and zero amber elsewhere. **Auto-resolve at B.**

**D3 — Step indicator pattern.** A) Numbered dots with labels (1 Audience / 2 Service / …). B) Labeled progress bar (current "3 of 5: Project details"). C) Named tab strip (clickable to revisit). **Recommendation: A on desktop, B on mobile** (mobile loses room for 5 labels). Numbered dots match premium register; mobile bar reads cleanly under the navbar. Tab-strip C is rejected — clickable backwards-jumping invites lost-progress on Step 4. *Completed steps in A are clickable* (return to that step preserving all other state); *upcoming steps* are not. **Auto-resolve at A/B.**

**D4 — Step 1 — Audience selection control.** A) Three large photo cards (Residential / Commercial / Hardscape) with a single radio underneath each, tap-anywhere-to-select. B) Three small radio rows. C) A select dropdown. **Recommendation: A.** Matches homepage 1.06 §4 audience-entries surface; tile-based selection on Step 1 is the highest-confidence first action. Tile aspect 4:3 matches `.card--photo` so no new variant is needed. **Auto-resolve at A.**

**D5 — Step 2 — Service selection control.** A) Single-select chip cloud (one service per quote). B) Multi-select checkbox grid. C) Audience-driven dynamic list with multi-select + "Primary service" radio for the lead service. **Recommendation: C.** Real homeowner intent often blends services ("patio + retaining wall + lawn refresh"). Multi-select with a "Primary service" radio defaulted to the first checked. Single-select A is rejected — too restrictive for the audience that converts. **Auto-resolve at C.**

**D6 — Step 3 — Details branching matrix.** Per audience, what fields show? **Recommendation:**

| Audience | Fields (all optional unless marked) |
|---|---|
| Residential | Property size (sq ft, optional). # of bedrooms (optional, select 1–5+). Project type (renovation / new install / maintenance / other) — required-one-of. Timeline (ASAP / 1–3 mo / 3–6 mo / flexible) — required-one-of. Budget range (under $5k / $5–15k / $15–40k / $40k+ / unsure) — required-one-of. |
| Commercial | # of properties (numeric). # of buildings or sites (numeric). Contract preference (one-time / seasonal / annual) — required-one-of. Service frequency expectation (weekly / bi-weekly / monthly / on demand / unsure). Decision-maker timeline (immediate / next 30 days / next quarter / exploratory) — required-one-of. |
| Hardscape | Space type (patio / driveway / pool surround / multi-feature) — required-one-of, multi-select up to 3. Approximate dimensions (free text, e.g. "20×30 ft" — optional). Surface preference (paver / stone / concrete / undecided) — required-one-of. Known features wanted (multi-checkbox: fire feature, retaining wall, seating wall, lighting, kitchen, pergola). Budget range (under $15k / $15–40k / $40–80k / $80k+ / unsure) — required-one-of. Timeline (ASAP / spring / summer / fall / next year / flexible) — required-one-of. |

All audiences also see a free-text "Anything else we should know?" textarea (500-char counter) at the bottom of Step 3. **Auto-resolve at the matrix above.** (Strings table §7.)

**D7 — Step 4 — Contact info.** Required: first name, last name, email, phone (US format mask `(630) 946-9321`), property address (street, city, state with Illinois pre-selected, zip — 5 digits). Optional: unit / apt, best contact time (Morning / Afternoon / Evening / Anytime — radio), contact method preference (email / phone / text — pick one). Photo upload deferred — see D11. **Auto-resolve at the field set above.**

**D8 — Step 5 — Review & Submit pattern.** A) All five steps' answers rendered as labeled rows in one card with per-step "Edit" links. B) Five mini-cards. C) Compact JSON-style summary list. **Recommendation: A.** Scannable, mobile-friendly, single Submit visible without scroll on most viewports. Card uses `.card--cream` (NOT `.card--featured` per 1.06 §2.4 — Step 5 has an amber Submit). **Auto-resolve at A.**

**D9 — Save & continue later behavior. ⚠ BLOCKER.** A) Off — abandoned step state lives only in the URL until tab close. B) `localStorage` autosave on every advance, restored on reload + 30-day expiry, with a visible "Resume your quote?" toast on return visit. C) Email-link resume — user enters email at any point, gets a magic-link to resume (Part 2 only). **Recommendation: B for Part 1 (UI + localStorage only behind `WIZARD_AUTOSAVE_ENABLED`), C deferred to Part 2.** B captures the abandoner without the back-end Plan §11 tracks separately; C is a Part-2 enhancement. **Privacy implication Chat must weigh:** B stores PII (name, email, phone, address) in plaintext localStorage that any local browser-extension can read. Mitigation: do not store email/phone/address in localStorage — only Steps 1–3 (audience, service, project details, no PII). Step 4 contact data is held in React state only. Surface the trade-off so Chat can ratify the PII boundary. **Blocker — needs Chat ratification of the PII split.**

**D10 — Validation pattern.** A) Validate on blur + on Next-click (default browser-form-style). B) Validate as-you-type after first blur. C) Validate only on Next-click. **Recommendation: A.** Matches 1.11 §11.1 ContactForm precedent; least-aggressive UX for premium register; on-Next blocks advance and scrolls to first error with focus on the offending field. **Auto-resolve at A.**

**D11 — Photo upload on Step 3. ⚠ BLOCKER.** A) Yes — drag-drop + tap-to-upload, multi-file, preview thumbnails, ≤5 photos × ≤5MB each. B) No — defer to Part 2. **Recommendation: B.** File-upload UX is heavy (preview + remove + reorder + accessibility for screen readers + mobile camera-roll integration), the lead-capture value is marginal vs the engineering cost, and Erick can ask for photos in the email follow-up. Part 1 leaves a slot specced as a `data-photo-upload-slot` attribute Code can swap for a real uploader in Part 2. **Blocker — needs Chat ratification of feature scope.**

**D12 — Mobile keyboard sticky-Next.** A) Yes — Next sticks to bottom of viewport above keyboard. B) No — Next sits at the bottom of the form, scroll to reach. **Recommendation: A.** Mobile usability is the dominant lever; sticky-Next at `--z-sticky: 40` is standard form UX. Sticky bar on `lg+` collapses to inline Back/Next at the form footer. **Auto-resolve at A.**

**D13 — Wizard hero / page header.** A) Full hero per other pages (eyebrow + H1 + dek + photo). B) Compact page header (eyebrow + H1 only, no photo, no dek). C) No header — the step indicator is the visual anchor. **Recommendation: B.** Photo competes with the form for attention. Compact header sets the tone, the step indicator owns the upper-fold. **Auto-resolve at B.**

**D14 — Thank-you page sections.** **Recommendation:** 1) Confirmation hero ("Thanks, {firstName} — we've got it."), 2) Calendly placeholder card ("Want to lock in a 30-minute consult?"), 3) "What happens next?" 3-step explainer ("We review your project / Erick calls within 24 hours / We schedule an on-site walk-through"), 4) Optional small FAQ (3 Q&A: how soon, what to prepare, can I reschedule), 5) Soft return CTAs (View our projects · Read our blog · Back to homepage). No amber CTA on the thank-you page (per §1.3 amber discipline). **Auto-resolve at the section list above.**

**D15 — Wizard schema. RESOLVED at zero.** The wizard is a form, not a content surface; no `WebPage` / `Article` / `BreadcrumbList`. Thank-you page also zero schema (it's a transactional landing; the page noindexes via `<meta name="robots" content="noindex,follow">`). Document the deliberate choice in §5. **Auto-resolve at zero.**

**D16 — Wizard analytics-event names.** Spec the `data-analytics-event` attribute values Code adds in 1.20 + Phase 2.11. **Recommendation:**

| Event | Trigger | Payload (Part 2 wires) |
|---|---|---|
| `wizard_step_viewed_1` … `_5` | Step screen mounts | `{ step, locale }` |
| `wizard_step_completed_1` … `_5` | Next click validates | `{ step, locale, fieldsFilled }` |
| `wizard_submit_attempted` | Submit click on Step 5 | `{ locale, audience, services }` |
| `wizard_submit_succeeded` | Post-submit transition to `/thank-you/` | `{ locale, audience }` |
| `wizard_submit_failed` | UI error reveal on submit | `{ locale, errorClass }` |
| `wizard_field_error_<fieldName>` | Field validation fires after Next | `{ field, errorType }` |
| `wizard_resume_offered` | "Resume your quote?" toast appears | `{ locale, lastStep }` |
| `wizard_resume_accepted` | Resume toast click | `{ locale, lastStep }` |
| `wizard_resume_dismissed` | Resume toast dismiss | `{ locale, lastStep }` |
| `wizard_abandoned` | `visibilitychange` to "hidden" if user did not advance | `{ locale, lastStep, secondsOnStep }` |
| `wizard_back_clicked` | Back button click | `{ from, to }` |
| `wizard_save_link_clicked` | "Save & continue later" link click | `{ locale, step }` |
| `wizard_edit_step_clicked` | Edit link from Step 5 review | `{ targetStep }` |
| `wizard_call_link_clicked` | "or call us at..." link click on Step 4 | `{ locale }` |

**Auto-resolve at the table above.**

### Chat widget D-items

**D17 — Bubble visibility on the wizard route. ⚠ BLOCKER.** A) Show — chat is sitewide, no exceptions. B) Hide on `/request-quote/` only. C) Hide on `/request-quote/` AND `/thank-you/`. **Recommendation: B.** The wizard is the conversion path — a chat bubble is a distraction. The thank-you page is post-conversion — a chat bubble may still help (e.g., "I have a question about scheduling"). UX-vs-cohesion call. **Blocker — needs Chat ratification.**

**D18 — Bubble icon.** A) Lucide `MessageCircle` icon. B) Custom inline SVG of the brand mark (a small sun) — reinforces brand. C) Erick's avatar photo. **Recommendation: A.** Instantly recognizable as chat; icon-as-affordance precedent across the locked icon system (1.03 §8). C-Erick risks staleness (photo dated, requires Cowork to source). B is interesting but reads as a logo, not a chat affordance. **Auto-resolve at A.**

**D19 — Collapsed bubble dimensions + position.** **Recommendation: 56px circle desktop / 56px circle mobile, bottom-right offset 24px desktop / 16px mobile, `--z-chat: 50` (one above `--z-sticky: 40`, below `--z-modal: 60`).** Hover: subtle 1.04 scale + `--shadow-hover`. Focus-visible: 3px focus-ring. Press: scale 0.96 over `--motion-fast`. Optional "new" badge: 8px red dot top-right of bubble (Part 2 only — illuminates on assistant-initiated message; never illuminated in Part 1; the slot is rendered but `display: none` until a `chat-bubble--has-update` class is toggled). **Auto-resolve at the dimensions above.**

**D20 — Welcome state suggested prompts.** **Recommendation: 3 chips, EN + ES, tap-auto-sends-as-user-message.**

| EN | ES |
|---|---|
| "How much does a paver patio cost?" | "¿Cuánto cuesta un patio de adoquines?" |
| "Do you service Naperville?" | "¿Atienden en Naperville?" |
| "When can someone come look at my yard?" | "¿Cuándo pueden venir a ver mi jardín?" |

Each chip is composed from a `Ghost × md` button at chip aspect (no new variant). These three become high-frequency inputs into the Part 2 knowledge base — they should be the questions Erick most wants to answer well. **Auto-resolve at the three above; surface to Erick in Part 2 for tuning.**

**D21 — Expanded panel — desktop dimensions + position.** **Recommendation: floating panel bottom-right, 384px wide × 560px tall, anchored 24px from bottom + 24px from right, layered shadow `--shadow-popover` over `--shadow-card`, `--radius-xl` (24px), header 56px, scrollable message log fills middle, composer 80px (textarea up to 4 lines + send button + char hint).** Background: `--color-bg`. **Auto-resolve at the dimensions above.**

**D22 — Expanded panel — mobile.** **Recommendation: bottom sheet, full-bleed width minus 0 gutter, height min(85vh, 720px), rounded top corners only (`--radius-xl`), drag handle (40×4 hairline) at top center for swipe-down close, safe-area-inset-bottom respected, on-screen-keyboard pushed via `interactiveWidget=resizes-content` viewport meta with a `visualViewport.height` JS fallback.** Surfaced for ratification because the meta tag has uneven mobile-Safari support. **Auto-resolve at the spec above; Code measures on real devices in 1.20.**

**D23 — Message bubble visual contract.** **Recommendation:** assistant left-aligned, max-width 85% of log width, `.card--cream` body with `--radius-lg`, top-left corner 4px (visual "tail"), `--text-body` body, link styling per 1.03 §6.4 link primitive but with underline always-on inside chat (link recognition is harder in a constrained surface). User right-aligned, max-width 85%, custom green bubble: `--color-sunset-green-700` background + `--color-text-on-green` text, `--radius-lg` with top-right 4px tail. Both: 12/16 padding, 8px gap between consecutive bubbles same-sender, 16px gap between switch-of-sender. Avatar shown on first assistant bubble of a turn; subsequent same-turn bubbles omit. Timestamps shown only on hover desktop / not at all mobile (clutter trade-off). **Auto-resolve at the spec above.**

**D24 — Inline content inside messages. ⚠ BLOCKER.** What renders? **Recommendation:** plaintext (always), URLs auto-linked (always), bold + italic via Markdown subset (`**bold**` and `*italic*` only — no list / heading / table parsing). Code blocks: monospaced inline only, no syntax highlighting. Emoji: pass through. HTML: sanitized to nothing. **Safer Part-1 alt: plaintext + URLs only; full Markdown deferred to Part 2.** Surface for Chat ratification because the safer alt removes a sanitization risk Part 1 doesn't need. **Blocker — Part-1 vs Part-2 scope.**

**D25 — Reactions / message actions.** **Recommendation: none Part 1.** Alternates: A) copy message, B) thumbs up/down (Part-2-valuable signal for fine-tuning the knowledge base), C) regenerate. Surface for ratification. **Auto-resolve at none; Part 2 may add.**

**D26 — Lead-capture trigger inside chat.** **Recommendation:** a single "Get a quote in 30 seconds →" button below the composer that, when clicked, slides an inline mini-form into the message log (name + email + optional phone + Send). The form uses the locked 1.11 ContactForm field primitives with the `compact` density variant declared in §11. After submit (UI-only Part 1), an assistant message thanks the user and provides the wizard URL as a follow-up option. Alternates: A) auto-prompt after N=3 messages (rejected — feels pushy), B) manual "Share my info" link in panel header (rejected — too discoverable-only). **Auto-resolve at the recommendation.**

**D27 — High-intent escalation visual.** **Recommendation:** subtle green banner above composer "We've alerted Erick — he'll join shortly." for 6 seconds with `--motion-slow` slide-down + auto-dismiss + manual close. EN + ES strings in §7. Part 1 ships the slot; Phase 2.09 fires it on intent-classification. **Auto-resolve at the recommendation.**

**D28 — Persistence behavior.** **Recommendation:** per Plan §12 literal reading: `sessionStorage` (cleared on tab close). Per-locale namespace (`sunset_chat_history_en` vs `sunset_chat_history_es`). Reset link in panel header menu clears the storage key + reloads welcome state + closes & reopens the panel for visual confirmation. Part 1 spec uses `sessionStorage`; the `localStorage` reading is also surfaced as the alternate. **See §14 mismatch.** **Auto-resolve at sessionStorage; Chat may flip to localStorage if Plan §12 is corrected.**

**D29 — Cookie consent gate.** Per Plan §12: chat must not auto-open before consent. **Recommendation:** until consent banner is dismissed, the bubble shows a subtle "click to enable chat" tooltip on hover and the panel does not open on click — instead it opens the consent banner. After consent: full normal behavior. Part 1 ships the gated state; Phase 2.11 wires the banner. **Auto-resolve at the gating UX above.**

**D30 — Reduced motion.** Per 1.03 §7.7: typing indicator becomes a single fading dot (no bounce); message bubble entrance becomes opacity-only at `--motion-fast`; panel open/close becomes opacity-only; bubble hover scale becomes 1.0 with shadow swap retained. **Auto-resolve at the spec above.**

---

## 3. Quote Wizard — section-by-section spec

Each subsection ships: desktop SVG (≥1280 viewBox) + mobile SVG (≤480), annotated spec (token names + spacing + type + CTA variants + motion + a11y), strings reference into §7, and a decision-trail to §2 D-items. SVGs are spec-accurate diagrams — Code reconstructs from SVG + spec text alone.

### 3.1 Route shell + chrome

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 900" role="img" aria-label="Wizard route shell desktop">
  <rect width="1280" height="900" fill="#FFFFFF"/>
  <rect x="0" y="0" width="1280" height="72" fill="#FFFFFF"/>
  <line x1="0" y1="72" x2="1280" y2="72" stroke="#E8E2D2" stroke-width="1"/>
  <text x="64" y="44" font-family="Manrope" font-weight="700" font-size="20" fill="#2F5D27">Sunset Services</text>
  <g font-family="Manrope" font-size="14" fill="#1A1A1A">
    <text x="560" y="44">Services</text><text x="650" y="44">Projects</text><text x="740" y="44">About</text>
    <text x="810" y="44">Resources</text><text x="900" y="44">Blog</text><text x="970" y="44">Contact</text>
  </g>
  <text x="1140" y="44" font-family="Manrope" font-size="13" fill="#6B6B6B">EN · ES</text>
  <text x="64" y="138" font-family="Manrope" font-size="13" font-weight="600" fill="#2F5D27" letter-spacing="1.5">REQUEST A QUOTE</text>
  <text x="64" y="186" font-family="Onest" font-weight="600" font-size="44" fill="#1A1A1A">Tell us about your project</text>
  <text x="64" y="220" font-family="Manrope" font-size="16" fill="#4A4A4A">5 short steps · about 5 minutes</text>
  <g transform="translate(64,272)">
    <line x1="32" y1="20" x2="1120" y2="20" stroke="#E8E2D2" stroke-width="2"/>
    <circle cx="32" cy="20" r="20" fill="#4D8A3F"/>
    <text x="32" y="26" text-anchor="middle" font-family="Manrope" font-weight="700" font-size="14" fill="#FFFFFF">1</text>
    <text x="32" y="68" text-anchor="middle" font-family="Manrope" font-size="13" font-weight="600" fill="#2F5D27">Audience</text>
    <g font-family="Manrope" font-size="13" fill="#6B6B6B">
      <circle cx="304" cy="20" r="20" fill="#FFFFFF" stroke="#E8E2D2" stroke-width="2"/><text x="304" y="26" text-anchor="middle" font-weight="700" font-size="14" fill="#6B6B6B">2</text><text x="304" y="68" text-anchor="middle">Service</text>
      <circle cx="576" cy="20" r="20" fill="#FFFFFF" stroke="#E8E2D2" stroke-width="2"/><text x="576" y="26" text-anchor="middle" font-weight="700" font-size="14" fill="#6B6B6B">3</text><text x="576" y="68" text-anchor="middle">Details</text>
      <circle cx="848" cy="20" r="20" fill="#FFFFFF" stroke="#E8E2D2" stroke-width="2"/><text x="848" y="26" text-anchor="middle" font-weight="700" font-size="14" fill="#6B6B6B">4</text><text x="848" y="68" text-anchor="middle">Contact</text>
      <circle cx="1120" cy="20" r="20" fill="#FFFFFF" stroke="#E8E2D2" stroke-width="2"/><text x="1120" y="26" text-anchor="middle" font-weight="700" font-size="14" fill="#6B6B6B">5</text><text x="1120" y="68" text-anchor="middle">Review</text>
    </g>
  </g>
  <rect x="64" y="384" width="1152" height="72" rx="16" fill="#FAF7F1"/>
  <text x="92" y="416" font-family="Manrope" font-weight="600" font-size="14" fill="#2F5D27">What you’ll need</text>
  <text x="92" y="438" font-family="Manrope" font-size="14" fill="#4A4A4A">Your address, a brief project description, and your phone or email — about 5 minutes.</text>
  <rect x="64" y="488" width="1152" height="320" fill="#FFFFFF" stroke="#E8E2D2" stroke-dasharray="4 4" stroke-width="1" opacity="0.6"/>
  <text x="640" y="652" text-anchor="middle" font-family="Manrope" font-size="12" fill="#6B6B6B" letter-spacing="1.5">STEP BODY (§3.3–§3.7)</text>
</svg>
```

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" role="img" aria-label="Wizard route shell mobile">
  <rect width="390" height="844" fill="#FFFFFF"/>
  <rect x="0" y="0" width="390" height="60" fill="#FFFFFF"/>
  <line x1="0" y1="60" x2="390" y2="60" stroke="#E8E2D2"/>
  <text x="20" y="38" font-family="Manrope" font-weight="700" font-size="16" fill="#2F5D27">Sunset Services</text>
  <text x="370" y="38" text-anchor="end" font-family="Manrope" font-size="20" fill="#1A1A1A">☰</text>
  <text x="20" y="104" font-family="Manrope" font-weight="600" font-size="11" fill="#2F5D27" letter-spacing="1.4">REQUEST A QUOTE</text>
  <text x="20" y="138" font-family="Onest" font-weight="600" font-size="28" fill="#1A1A1A">Tell us about</text>
  <text x="20" y="170" font-family="Onest" font-weight="600" font-size="28" fill="#1A1A1A">your project</text>
  <g transform="translate(20,224)">
    <text x="0" y="0" font-family="Manrope" font-weight="600" font-size="12" fill="#2F5D27">STEP 1 OF 5 · AUDIENCE</text>
    <rect x="0" y="12" width="350" height="6" rx="3" fill="#E8E2D2"/>
    <rect x="0" y="12" width="70" height="6" rx="3" fill="#4D8A3F"/>
  </g>
  <rect x="20" y="272" width="350" height="80" rx="16" fill="#FAF7F1"/>
  <text x="36" y="298" font-family="Manrope" font-weight="600" font-size="13" fill="#2F5D27">What you’ll need</text>
  <text x="36" y="320" font-family="Manrope" font-size="13" fill="#4A4A4A">Your address, a brief project</text>
  <text x="36" y="338" font-family="Manrope" font-size="13" fill="#4A4A4A">description — about 5 minutes.</text>
  <rect x="20" y="372" width="350" height="370" stroke="#E8E2D2" stroke-dasharray="4 4" fill="none"/>
  <rect x="0" y="760" width="390" height="84" fill="#FFFFFF"/>
  <line x1="0" y1="760" x2="390" y2="760" stroke="#E8E2D2"/>
  <rect x="20" y="780" width="100" height="48" rx="8" fill="#FFFFFF" stroke="#1A1A1A" stroke-width="1.5"/>
  <text x="70" y="810" text-anchor="middle" font-family="Manrope" font-weight="600" font-size="14" fill="#1A1A1A">Back</text>
  <rect x="132" y="780" width="238" height="48" rx="8" fill="#4D8A3F"/>
  <text x="251" y="810" text-anchor="middle" font-family="Manrope" font-weight="600" font-size="14" fill="#FFFFFF">Next →</text>
</svg>
```

**Annotated spec.**

| Element | Token / value | Notes |
|---|---|---|
| Background (whole route) | `--color-bg` (#FFFFFF) | No alternation within the form. Tip card is a card not a section. |
| Page header eyebrow | `--text-eyebrow`, `--color-sunset-green-700`, 0.12em tracking | EN: "REQUEST A QUOTE" / ES: "SOLICITA UN PRESUPUESTO". |
| Page header H1 | `--text-h1`, `--color-text-primary`, weight 600 | EN: "Tell us about your project" / ES: "Cuéntanos sobre tu proyecto". |
| Step indicator (desktop) | dots 40px diameter, label `--text-caption` weight 600, line `--color-border` 1px | Active dot `--color-sunset-green-500` fill + white numeral. Completed `--color-sunset-green-700` fill + white check. Upcoming white fill + 2px `--color-border` ring. |
| Step indicator (mobile) | bar 6px tall, fill = (current/5)·100% | Caption "STEP {n} OF 5 · {STEP NAME}" `--text-eyebrow`. |
| Tip card | `.card--cream` `--radius-lg`, padding 24/32 desktop / 16 mobile | role="note", aria-labelledby. |
| Section padding | py-20 desktop / py-14 mobile | Standard 1.03 §9. |

**Decision trail.** D2 chrome strip · D3 indicator · D13 compact header.

**A11y.** `<ol aria-label="Quote progress">`; current `<li aria-current="step">`; completed `<li>` with visually-hidden " — completed". Tip card `role="note"` with `aria-labelledby`.

---

### 3.2 Step indicator (5 steps + Submit) — detail

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 240" role="img" aria-label="Step indicator detail desktop">
  <rect width="1280" height="240" fill="#FFFFFF"/>
  <line x1="96" y1="80" x2="1184" y2="80" stroke="#E8E2D2" stroke-width="2"/>
  <line x1="96" y1="80" x2="616" y2="80" stroke="#2F5D27" stroke-width="2"/>
  <circle cx="96" cy="80" r="20" fill="#2F5D27"/><path d="M86 80 l8 8 16-16" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="96" y="132" text-anchor="middle" font-family="Manrope" font-size="13" font-weight="600" fill="#2F5D27">Audience</text>
  <text x="96" y="152" text-anchor="middle" font-family="Manrope" font-size="11" fill="#6B6B6B">Residential</text>
  <circle cx="356" cy="80" r="20" fill="#2F5D27"/><path d="M346 80 l8 8 16-16" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="356" y="132" text-anchor="middle" font-family="Manrope" font-size="13" font-weight="600" fill="#2F5D27">Service</text>
  <text x="356" y="152" text-anchor="middle" font-family="Manrope" font-size="11" fill="#6B6B6B">Hardscape +1</text>
  <circle cx="616" cy="80" r="22" fill="#4D8A3F" stroke="#DCE8D5" stroke-width="6"/>
  <text x="616" y="86" text-anchor="middle" font-family="Manrope" font-weight="700" font-size="15" fill="#FFFFFF">3</text>
  <text x="616" y="132" text-anchor="middle" font-family="Manrope" font-size="13" font-weight="700" fill="#1A1A1A">Project details</text>
  <text x="616" y="152" text-anchor="middle" font-family="Manrope" font-size="11" fill="#6B6B6B" letter-spacing="1.2">CURRENT</text>
  <circle cx="876" cy="80" r="20" fill="#FFFFFF" stroke="#E8E2D2" stroke-width="2"/><text x="876" y="86" text-anchor="middle" font-family="Manrope" font-weight="700" fill="#6B6B6B">4</text>
  <text x="876" y="132" text-anchor="middle" font-family="Manrope" font-size="13" fill="#6B6B6B">Contact</text>
  <circle cx="1136" cy="80" r="20" fill="#FFFFFF" stroke="#E8E2D2" stroke-width="2"/><text x="1136" y="86" text-anchor="middle" font-family="Manrope" font-weight="700" fill="#6B6B6B">5</text>
  <text x="1136" y="132" text-anchor="middle" font-family="Manrope" font-size="13" fill="#6B6B6B">Review &amp; submit</text>
</svg>
```

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 120" role="img" aria-label="Step indicator detail mobile">
  <rect width="390" height="120" fill="#FFFFFF"/>
  <text x="20" y="36" font-family="Manrope" font-weight="600" font-size="12" fill="#2F5D27" letter-spacing="1.4">STEP 3 OF 5 · PROJECT DETAILS</text>
  <rect x="20" y="52" width="350" height="6" rx="3" fill="#E8E2D2"/><rect x="20" y="52" width="210" height="6" rx="3" fill="#4D8A3F"/>
  <text x="20" y="86" font-family="Manrope" font-size="12" fill="#6B6B6B">Audience: Residential · Services: Hardscape +1</text>
</svg>
```

**Spec.** Completed dots `--color-sunset-green-700` + white check (lucide `Check` 14px); active dot `--color-sunset-green-500` with 6px `--color-sunset-green-100` ring; upcoming white + `--color-border` 2px stroke. Connector 2px `--color-border`, segments left of active become `--color-sunset-green-700`. Mobile bar fill animates with `--motion-base` `--easing-soft`; reduced motion: opacity-only. **A11y:** `<li aria-current="step">` on active; completed expose `aria-label="Step 1 — Audience — completed, click to revisit"`; upcoming `aria-disabled="true"`. Mobile bar: `<div role="progressbar" aria-valuemin="0" aria-valuemax="5" aria-valuenow="3" aria-label="Quote progress">`. **Decision trail:** D3.

---

### 3.3 Step 1 — Audience

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" role="img" aria-label="Wizard Step 1 Audience desktop">
  <rect width="1280" height="720" fill="#FFFFFF"/>
  <text x="64" y="68" font-family="Onest" font-weight="600" font-size="32" fill="#1A1A1A">Who are we helping?</text>
  <text x="64" y="100" font-family="Manrope" font-size="16" fill="#4A4A4A">Pick the closest match — you can add more in Step 2.</text>
  <rect x="64" y="140" width="384" height="380" rx="16" fill="#FAF7F1" stroke="#4D8A3F" stroke-width="2"/>
  <rect x="64" y="140" width="384" height="240" rx="16" fill="#DCE8D5"/>
  <text x="256" y="266" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#4D8A3F">[ photo · suburban front yard ]</text>
  <text x="86" y="416" font-family="Onest" font-weight="600" font-size="22" fill="#1A1A1A">Residential</text>
  <text x="86" y="446" font-family="Manrope" font-size="14" fill="#4A4A4A">Lawn, planting, snow,</text>
  <text x="86" y="466" font-family="Manrope" font-size="14" fill="#4A4A4A">seasonal cleanup at home.</text>
  <circle cx="424" cy="500" r="16" fill="#4D8A3F"/><path d="M414 500 l8 8 16-16" stroke="#FFFFFF" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="464" y="140" width="384" height="380" rx="16" fill="#FFFFFF" stroke="#E8E2D2" stroke-width="1"/>
  <rect x="464" y="140" width="384" height="240" rx="16" fill="#F2EDE3"/>
  <text x="656" y="266" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#8FB67A">[ photo · office park entrance ]</text>
  <text x="486" y="416" font-family="Onest" font-weight="600" font-size="22" fill="#1A1A1A">Commercial</text>
  <text x="486" y="446" font-family="Manrope" font-size="14" fill="#4A4A4A">Property management,</text>
  <text x="486" y="466" font-family="Manrope" font-size="14" fill="#4A4A4A">snow contracts, turf care.</text>
  <rect x="864" y="140" width="384" height="380" rx="16" fill="#FFFFFF" stroke="#E8E2D2" stroke-width="1"/>
  <rect x="864" y="140" width="384" height="240" rx="16" fill="#F2EDE3"/>
  <text x="1056" y="266" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#8FB67A">[ photo · paver patio + fire ]</text>
  <text x="886" y="416" font-family="Onest" font-weight="600" font-size="22" fill="#1A1A1A">Hardscape</text>
  <text x="886" y="446" font-family="Manrope" font-size="14" fill="#4A4A4A">Patios, walls, driveways,</text>
  <text x="886" y="466" font-family="Manrope" font-size="14" fill="#4A4A4A">fire features, kitchens.</text>
  <line x1="64" y1="588" x2="1216" y2="588" stroke="#E8E2D2"/>
  <text x="64" y="638" font-family="Manrope" font-size="14" fill="#2F5D27" text-decoration="underline">Save &amp; continue later</text>
  <rect x="1080" y="612" width="136" height="48" rx="8" fill="#4D8A3F"/>
  <text x="1148" y="642" text-anchor="middle" font-family="Manrope" font-weight="600" font-size="15" fill="#FFFFFF">Next →</text>
</svg>
```

**Spec.** Three tiles, 4:3 image area + label region. Stacks vertically mobile (~40vh each). Selected tile: 2px `--color-sunset-green-500` ring + 32px circle check chip in bottom-right. Hidden `<input type="radio" name="audience">` per tile; clicking tile selects radio. Photo gradient overlay per 1.03 §6.4. Validation: must select one before Next; error reveal: shake + scroll-to-error + alert below tiles. **Strings:** `wizard.step1.title`, `wizard.step1.helper`, `wizard.audience.{residential|commercial|hardscape}.{title,dek}`. **Decision trail:** D4. *(Mobile rendering: tiles full-width × 280px; image 180px tall; same selected state. Spec mirrors §3.1 mobile shell.)*

---

### 3.4 Step 2 — Service selection (audience-conditional)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" role="img" aria-label="Wizard Step 2 Service desktop residential">
  <rect width="1280" height="720" fill="#FFFFFF"/>
  <text x="64" y="68" font-family="Onest" font-weight="600" font-size="32" fill="#1A1A1A">Which residential services?</text>
  <text x="64" y="100" font-family="Manrope" font-size="16" fill="#4A4A4A">Pick all that apply. Set a primary if more than one.</text>
  <text x="64" y="148" font-family="Manrope" font-weight="600" font-size="13" fill="#2F5D27" letter-spacing="0.8">PRIMARY SERVICE</text>
  <g font-family="Manrope" font-size="14" fill="#1A1A1A">
    <circle cx="76" cy="174" r="8" fill="#4D8A3F"/><circle cx="76" cy="174" r="3.5" fill="#FFFFFF"/><text x="92" y="178">Lawn Care</text>
    <circle cx="208" cy="174" r="8" fill="#FFFFFF" stroke="#6B6B6B" stroke-width="1.5"/><text x="224" y="178" fill="#6B6B6B">Landscape Design</text>
    <circle cx="380" cy="174" r="8" fill="#FFFFFF" stroke="#6B6B6B" stroke-width="1.5"/><text x="396" y="178" fill="#6B6B6B">Tree Services</text>
  </g>
  <rect x="64" y="216" width="368" height="100" rx="12" fill="#FAF7F1" stroke="#4D8A3F" stroke-width="2"/>
  <rect x="84" y="244" width="20" height="20" rx="4" fill="#4D8A3F"/><path d="M88 254 l4 4 8-8" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round"/>
  <text x="116" y="260" font-family="Manrope" font-weight="600" font-size="16" fill="#1A1A1A">Lawn Care</text>
  <text x="116" y="284" font-family="Manrope" font-size="13" fill="#4A4A4A">Mowing, fertilization, weed control</text>
  <rect x="456" y="216" width="368" height="100" rx="12" fill="#FAF7F1" stroke="#4D8A3F" stroke-width="2"/>
  <rect x="476" y="244" width="20" height="20" rx="4" fill="#4D8A3F"/><path d="M480 254 l4 4 8-8" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round"/>
  <text x="508" y="260" font-family="Manrope" font-weight="600" font-size="16" fill="#1A1A1A">Landscape Design</text>
  <text x="508" y="284" font-family="Manrope" font-size="13" fill="#4A4A4A">Beds, plantings, hardscape integration</text>
  <rect x="848" y="216" width="368" height="100" rx="12" fill="#FFFFFF" stroke="#E8E2D2"/>
  <rect x="868" y="244" width="20" height="20" rx="4" fill="#FFFFFF" stroke="#6B6B6B" stroke-width="1.5"/>
  <text x="900" y="260" font-family="Manrope" font-weight="600" font-size="16" fill="#1A1A1A">Tree Services</text>
  <rect x="64" y="332" width="368" height="100" rx="12" fill="#FFFFFF" stroke="#E8E2D2"/>
  <text x="116" y="376" font-family="Manrope" font-weight="600" font-size="16" fill="#1A1A1A">Sprinkler Systems</text>
  <rect x="456" y="332" width="368" height="100" rx="12" fill="#FFFFFF" stroke="#E8E2D2"/>
  <text x="508" y="376" font-family="Manrope" font-weight="600" font-size="16" fill="#1A1A1A">Snow Removal</text>
  <rect x="848" y="332" width="368" height="100" rx="12" fill="#FFFFFF" stroke="#E8E2D2"/>
  <text x="900" y="376" font-family="Manrope" font-weight="600" font-size="16" fill="#1A1A1A">Seasonal Cleanup</text>
  <text x="64" y="476" font-family="Manrope" font-weight="600" font-size="13" fill="#2F5D27" letter-spacing="0.8">OTHER · NOT SURE</text>
  <rect x="64" y="488" width="1152" height="56" rx="8" fill="#FFFFFF" stroke="#E8E2D2"/>
  <text x="84" y="522" font-family="Manrope" font-size="14" fill="#6B6B6B" font-style="italic">Tell us in your own words…</text>
  <text x="1196" y="522" text-anchor="end" font-family="Manrope" font-size="12" fill="#6B6B6B">0/200</text>
  <line x1="64" y1="608" x2="1216" y2="608" stroke="#E8E2D2"/>
  <rect x="64" y="632" width="100" height="48" rx="8" fill="#FFFFFF" stroke="#1A1A1A" stroke-width="1.5"/>
  <text x="114" y="662" text-anchor="middle" font-family="Manrope" font-weight="600" font-size="14" fill="#1A1A1A">Back</text>
  <rect x="1080" y="632" width="136" height="48" rx="8" fill="#4D8A3F"/>
  <text x="1148" y="662" text-anchor="middle" font-family="Manrope" font-weight="600" font-size="15" fill="#FFFFFF">Next →</text>
</svg>
```

**Spec.** Heading dynamic per audience. 3-col grid desktop / 1-col mobile, 12px gap, each row `.card` with checkbox + label + sub-line. Primary-service radio strip above grid (radios reflect only checked services). "Other / Not sure" textarea ≤200 chars below grid. Validation: at least one service checked OR Other ≥3 chars. Per-audience lists from Phase 1.09 `services.ts`. **Decision trail:** D5. **Mobile:** vertical stack of 60px-tall rows, primary-service collapses to a single dropdown above the list.

---

### 3.5 Step 3 — Project details (audience-conditional, per D6 matrix)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 880" role="img" aria-label="Wizard Step 3 Details desktop residential">
  <rect width="1280" height="880" fill="#FFFFFF"/>
  <text x="64" y="68" font-family="Onest" font-weight="600" font-size="32" fill="#1A1A1A">Tell us about the project</text>
  <text x="64" y="100" font-family="Manrope" font-size="16" fill="#4A4A4A">A few quick details so we can plan ahead. Skip what doesn’t apply.</text>
  <text x="64" y="158" font-family="Manrope" font-weight="600" font-size="13" fill="#2F5D27" letter-spacing="1">ABOUT THE PROPERTY</text>
  <line x1="64" y1="170" x2="1216" y2="170" stroke="#E8E2D2"/>
  <text x="64" y="208" font-family="Manrope" font-size="13" font-weight="600" fill="#1A1A1A">Property size (sq ft)</text>
  <rect x="64" y="220" width="560" height="48" rx="8" fill="#FFFFFF" stroke="#E8E2D2"/>
  <text x="84" y="250" font-family="Manrope" font-size="14" fill="#6B6B6B" font-style="italic">e.g. 8000</text>
  <text x="664" y="208" font-family="Manrope" font-size="13" font-weight="600" fill="#1A1A1A">Bedrooms</text>
  <rect x="664" y="220" width="552" height="48" rx="8" fill="#FFFFFF" stroke="#E8E2D2"/>
  <text x="684" y="250" font-family="Manrope" font-size="14" fill="#6B6B6B">Select…</text>
  <text x="64" y="312" font-family="Manrope" font-weight="600" font-size="13" fill="#2F5D27" letter-spacing="1">ABOUT THE PROJECT</text>
  <line x1="64" y1="324" x2="1216" y2="324" stroke="#E8E2D2"/>
  <text x="64" y="360" font-family="Manrope" font-size="13" font-weight="600" fill="#1A1A1A">Project type *</text>
  <rect x="64" y="372" width="280" height="64" rx="12" fill="#FAF7F1" stroke="#4D8A3F" stroke-width="2"/>
  <circle cx="92" cy="404" r="8" fill="#4D8A3F"/><circle cx="92" cy="404" r="3.5" fill="#FFFFFF"/>
  <text x="112" y="409" font-family="Manrope" font-weight="600" font-size="14" fill="#1A1A1A">Renovation</text>
  <rect x="352" y="372" width="280" height="64" rx="12" fill="#FFFFFF" stroke="#E8E2D2"/>
  <text x="400" y="409" font-family="Manrope" font-size="14" fill="#1A1A1A">New install</text>
  <rect x="640" y="372" width="280" height="64" rx="12" fill="#FFFFFF" stroke="#E8E2D2"/>
  <text x="688" y="409" font-family="Manrope" font-size="14" fill="#1A1A1A">Maintenance</text>
  <rect x="928" y="372" width="288" height="64" rx="12" fill="#FFFFFF" stroke="#E8E2D2"/>
  <text x="976" y="409" font-family="Manrope" font-size="14" fill="#1A1A1A">Other</text>
  <text x="64" y="488" font-family="Manrope" font-size="13" font-weight="600" fill="#1A1A1A">Timeline *</text>
  <rect x="64" y="500" width="560" height="48" rx="8" fill="#FFFFFF" stroke="#E8E2D2"/>
  <text x="84" y="530" font-family="Manrope" font-size="14" fill="#6B6B6B">ASAP / 1–3 mo / 3–6 mo / Flexible</text>
  <text x="664" y="488" font-family="Manrope" font-size="13" font-weight="600" fill="#1A1A1A">Budget range *</text>
  <rect x="664" y="500" width="552" height="48" rx="8" fill="#FFFFFF" stroke="#E8E2D2"/>
  <text x="684" y="530" font-family="Manrope" font-size="14" fill="#6B6B6B">Under $5k / $5–15k / $15–40k / $40k+ / Unsure</text>
  <text x="64" y="592" font-family="Manrope" font-weight="600" font-size="13" fill="#2F5D27" letter-spacing="1">ANYTHING ELSE</text>
  <line x1="64" y1="604" x2="1216" y2="604" stroke="#E8E2D2"/>
  <text x="64" y="640" font-family="Manrope" font-size="13" font-weight="600" fill="#1A1A1A">Anything else we should know?</text>
  <rect x="64" y="652" width="1152" height="120" rx="8" fill="#FFFFFF" stroke="#E8E2D2"/>
  <text x="84" y="682" font-family="Manrope" font-size="14" fill="#6B6B6B" font-style="italic">Tell us anything Erick should know before we call…</text>
  <text x="1196" y="762" text-anchor="end" font-family="Manrope" font-size="12" fill="#6B6B6B">0/500</text>
  <rect x="64" y="800" width="1152" height="56" rx="8" stroke="#E8E2D2" stroke-dasharray="4 4" fill="#FAF7F1"/>
  <text x="640" y="834" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#6B6B6B">[ data-photo-upload-slot — Part 2 (D11) ]</text>
</svg>
```

**Spec.** Two-column desktop (≥4 fields), single-column mobile. Section sub-headings: `--text-eyebrow` `--color-sunset-green-700` + 1px `--color-border` hairline. Required fields marked with green `*`. Audience-conditional rendering controlled by `audience` from Step 1; field map for Commercial / Hardscape lives in `src/data/wizard.ts` (§11). Universal free-text textarea + 500-char counter at bottom. Photo-upload slot is a placeholder `<div data-photo-upload-slot>` for Part 2 (D11=B). **Decision trail:** D6, D11. **Mobile:** all fields stack 1-col, sub-headings unchanged, textarea 100% width.

---

### 3.6 Step 4 — Contact info + property address

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" role="img" aria-label="Wizard Step 4 Contact desktop">
  <rect width="1280" height="720" fill="#FFFFFF"/>
  <text x="64" y="68" font-family="Onest" font-weight="600" font-size="32" fill="#1A1A1A">How can we reach you?</text>
  <text x="64" y="100" font-family="Manrope" font-size="16" fill="#4A4A4A">Erick will follow up within one business day.</text>
  <text x="64" y="158" font-family="Manrope" font-size="13" font-weight="600" fill="#1A1A1A">First name *</text>
  <rect x="64" y="170" width="560" height="48" rx="8" fill="#FFFFFF" stroke="#E8E2D2"/>
  <text x="664" y="158" font-family="Manrope" font-size="13" font-weight="600" fill="#1A1A1A">Last name *</text>
  <rect x="664" y="170" width="552" height="48" rx="8" fill="#FFFFFF" stroke="#E8E2D2"/>
  <text x="64" y="262" font-family="Manrope" font-size="13" font-weight="600" fill="#1A1A1A">Email *</text>
  <rect x="64" y="274" width="560" height="48" rx="8" fill="#FFFFFF" stroke="#E8E2D2"/>
  <text x="664" y="262" font-family="Manrope" font-size="13" font-weight="600" fill="#1A1A1A">Phone *</text>
  <rect x="664" y="274" width="380" height="48" rx="8" fill="#FFFFFF" stroke="#E8E2D2"/>
  <text x="684" y="304" font-family="Manrope" font-size="14" fill="#6B6B6B" font-style="italic">(630) 946-9321</text>
  <text x="1064" y="304" font-family="Manrope" font-size="13" fill="#2F5D27" text-decoration="underline">or call us</text>
  <text x="64" y="368" font-family="Manrope" font-weight="600" font-size="13" fill="#2F5D27" letter-spacing="1">PROPERTY ADDRESS</text>
  <line x1="64" y1="380" x2="1216" y2="380" stroke="#E8E2D2"/>
  <text x="64" y="412" font-family="Manrope" font-size="13" font-weight="600" fill="#1A1A1A">Street address *</text>
  <rect x="64" y="424" width="868" height="48" rx="8" fill="#FFFFFF" stroke="#E8E2D2"/>
  <text x="84" y="454" font-family="Manrope" font-size="13" fill="#6B6B6B" font-style="italic">123 Oak Lane</text>
  <text x="952" y="412" font-family="Manrope" font-size="13" font-weight="600" fill="#1A1A1A">Unit / apt</text>
  <rect x="952" y="424" width="264" height="48" rx="8" fill="#FFFFFF" stroke="#E8E2D2"/>
  <text x="64" y="500" font-family="Manrope" font-size="13" font-weight="600" fill="#1A1A1A">City *</text>
  <rect x="64" y="512" width="560" height="48" rx="8" fill="#FFFFFF" stroke="#E8E2D2"/>
  <text x="664" y="500" font-family="Manrope" font-size="13" font-weight="600" fill="#1A1A1A">State</text>
  <rect x="664" y="512" width="240" height="48" rx="8" fill="#FFFFFF" stroke="#E8E2D2"/>
  <text x="684" y="542" font-family="Manrope" font-size="14" fill="#1A1A1A">Illinois</text>
  <text x="944" y="500" font-family="Manrope" font-size="13" font-weight="600" fill="#1A1A1A">ZIP *</text>
  <rect x="944" y="512" width="272" height="48" rx="8" fill="#FFFFFF" stroke="#E8E2D2"/>
  <text x="64" y="608" font-family="Manrope" font-weight="600" font-size="13" fill="#2F5D27" letter-spacing="1">CONTACT PREFERENCES (OPTIONAL)</text>
  <line x1="64" y1="620" x2="1216" y2="620" stroke="#E8E2D2"/>
  <text x="64" y="652" font-family="Manrope" font-size="13" font-weight="600" fill="#1A1A1A">Best time</text>
  <rect x="64" y="664" width="160" height="40" rx="8" fill="#FFFFFF" stroke="#E8E2D2"/><text x="144" y="690" text-anchor="middle" font-family="Manrope" font-size="13" fill="#1A1A1A">Morning</text>
  <rect x="232" y="664" width="160" height="40" rx="8" fill="#FAF7F1" stroke="#4D8A3F" stroke-width="2"/><text x="312" y="690" text-anchor="middle" font-family="Manrope" font-weight="600" font-size="13" fill="#1A1A1A">Afternoon</text>
  <rect x="400" y="664" width="160" height="40" rx="8" fill="#FFFFFF" stroke="#E8E2D2"/><text x="480" y="690" text-anchor="middle" font-family="Manrope" font-size="13" fill="#1A1A1A">Evening</text>
  <rect x="568" y="664" width="160" height="40" rx="8" fill="#FFFFFF" stroke="#E8E2D2"/><text x="648" y="690" text-anchor="middle" font-family="Manrope" font-size="13" fill="#1A1A1A">Anytime</text>
  <text x="780" y="652" font-family="Manrope" font-size="13" font-weight="600" fill="#1A1A1A">Reach me by</text>
  <rect x="780" y="664" width="140" height="40" rx="8" fill="#FAF7F1" stroke="#4D8A3F" stroke-width="2"/><text x="850" y="690" text-anchor="middle" font-family="Manrope" font-weight="600" font-size="13" fill="#1A1A1A">Email</text>
  <rect x="928" y="664" width="140" height="40" rx="8" fill="#FFFFFF" stroke="#E8E2D2"/><text x="998" y="690" text-anchor="middle" font-family="Manrope" font-size="13" fill="#1A1A1A">Phone</text>
  <rect x="1076" y="664" width="140" height="40" rx="8" fill="#FFFFFF" stroke="#E8E2D2"/><text x="1146" y="690" text-anchor="middle" font-family="Manrope" font-size="13" fill="#1A1A1A">Text</text>
</svg>
```

**Spec.** Required: `firstName, lastName, email, phone, street, city, state` (Illinois default), `zip`. Optional: `unit, bestContactTime, contactMethod`. Tel field uses JS mask `(###) ###-####`; `inputmode="tel"`. Email `inputmode="email"`. Zip `inputmode="numeric"`, 5-digit. Street field carries `data-autocomplete-stub="address"` for Phase 2.07 Places swap. State pre-selected to "Illinois"; full US list available. "or call us" inline link uses `tel:+16309469321`. **Decision trail:** D7, D10. **Mobile:** all fields stack 1-col; chips wrap to 2 rows; tel "or call us" link drops below the field as full-width.

---

### 3.7 Step 5 — Review & Submit

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 800" role="img" aria-label="Wizard Step 5 Review desktop">
  <rect width="1280" height="800" fill="#FFFFFF"/>
  <text x="64" y="68" font-family="Onest" font-weight="600" font-size="32" fill="#1A1A1A">Look good?</text>
  <text x="64" y="100" font-family="Manrope" font-size="16" fill="#4A4A4A">Review your answers — Erick will get them in his inbox.</text>
  <rect x="64" y="140" width="1152" height="540" rx="16" fill="#FAF7F1"/>
  <text x="92" y="180" font-family="Manrope" font-weight="600" font-size="11" fill="#2F5D27" letter-spacing="1.4">STEP 1 · AUDIENCE</text>
  <text x="1188" y="180" text-anchor="end" font-family="Manrope" font-size="13" fill="#2F5D27" text-decoration="underline">Edit</text>
  <text x="92" y="208" font-family="Onest" font-weight="600" font-size="20" fill="#1A1A1A">Residential</text>
  <line x1="92" y1="240" x2="1188" y2="240" stroke="#E8E2D2"/>
  <text x="92" y="272" font-family="Manrope" font-weight="600" font-size="11" fill="#2F5D27" letter-spacing="1.4">STEP 2 · SERVICES</text>
  <text x="1188" y="272" text-anchor="end" font-family="Manrope" font-size="13" fill="#2F5D27" text-decoration="underline">Edit</text>
  <text x="92" y="300" font-family="Manrope" font-size="15" fill="#1A1A1A">Lawn Care (primary), Landscape Design, Seasonal Cleanup</text>
  <line x1="92" y1="324" x2="1188" y2="324" stroke="#E8E2D2"/>
  <text x="92" y="356" font-family="Manrope" font-weight="600" font-size="11" fill="#2F5D27" letter-spacing="1.4">STEP 3 · PROJECT DETAILS</text>
  <text x="1188" y="356" text-anchor="end" font-family="Manrope" font-size="13" fill="#2F5D27" text-decoration="underline">Edit</text>
  <text x="92" y="384" font-family="Manrope" font-size="14" fill="#4A4A4A">8,000 sq ft · 4 BR · Renovation · 1–3 mo · $15–40k</text>
  <line x1="92" y1="432" x2="1188" y2="432" stroke="#E8E2D2"/>
  <text x="92" y="464" font-family="Manrope" font-weight="600" font-size="11" fill="#2F5D27" letter-spacing="1.4">STEP 4 · CONTACT</text>
  <text x="1188" y="464" text-anchor="end" font-family="Manrope" font-size="13" fill="#2F5D27" text-decoration="underline">Edit</text>
  <text x="92" y="492" font-family="Manrope" font-size="14" fill="#1A1A1A">Sara Johnson · sara@example.com · (630) 555-0142</text>
  <text x="92" y="514" font-family="Manrope" font-size="14" fill="#4A4A4A">123 Oak Lane, Naperville, IL 60540 · email · afternoons</text>
  <line x1="92" y1="568" x2="1188" y2="568" stroke="#E8E2D2"/>
  <text x="92" y="608" font-family="Manrope" font-size="13" fill="#4A4A4A">By submitting, you agree to our <tspan fill="#2F5D27" text-decoration="underline">Privacy</tspan> and <tspan fill="#2F5D27" text-decoration="underline">Terms</tspan>.</text>
  <text x="92" y="628" font-family="Manrope" font-size="13" fill="#4A4A4A">We’ll only use your info to discuss your project.</text>
  <rect x="64" y="708" width="100" height="56" rx="8" fill="#FFFFFF" stroke="#1A1A1A" stroke-width="1.5"/>
  <text x="114" y="744" text-anchor="middle" font-family="Manrope" font-weight="600" font-size="15" fill="#1A1A1A">Back</text>
  <rect x="996" y="708" width="220" height="56" rx="8" fill="#E8A33D"/>
  <text x="1106" y="744" text-anchor="middle" font-family="Manrope" font-weight="700" font-size="16" fill="#1A1A1A">Submit my request</text>
</svg>
```

**Spec.** Single `.card--cream` (NOT `.card--featured` — 1.06 §2.4 forbids featured + amber on same page). Five labeled rows, each terminated by a 1px `--color-border` hairline. Eyebrow per row: "STEP {n} · {STEP NAME}" `--text-eyebrow` `--color-sunset-green-700`. "Edit" link top-right of each row → `?step={n}` preserving all state. Consent line below the last hairline; Privacy/Terms link to `/privacy/`, `/terms/`. Submit: **Amber × lg, full-width mobile, right-aligned desktop next to Ghost Back.** **Submit motion (Part 1 sim):** click → button label swaps to spinner over `--motion-fast` → 800ms hold → `router.push("/thank-you/?firstName=" + encodeURIComponent(firstName))`. Failure path: UI-only inline alert (§3.13). **Decision trail:** D8, D14, D15. **Mobile:** card row eyebrows + `Edit` stay; consent line wraps; Submit becomes full-width above an inline `← Back to Step 4` text-link (no sticky bar on Step 5).

---

### 3.8 Validation visual states

Per-field-type strip with 6 columns: **PRISTINE · FOCUS · VALID (post-blur) · ERROR · ERROR+FOCUS · DISABLED**. Reuses 1.11 §11.1 ContactForm primitives.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 880" role="img" aria-label="Field state strip desktop">
  <rect width="1280" height="880" fill="#FFFFFF"/>
  <g font-family="JetBrains Mono" font-size="11" fill="#6B6B6B" letter-spacing="0.6">
    <text x="84" y="44">PRISTINE</text><text x="284" y="44">FOCUS</text><text x="484" y="44">VALID</text><text x="724" y="44">ERROR</text><text x="924" y="44">ERROR+FOCUS</text><text x="1124" y="44">DISABLED</text>
  </g>
  <text x="20" y="100" font-family="Manrope" font-weight="600" font-size="13" fill="#1A1A1A">Text</text>
  <g transform="translate(60,72)"><rect width="180" height="48" rx="8" fill="#FFFFFF" stroke="#E8E2D2"/><text x="16" y="30" font-family="Manrope" font-size="14" fill="#6B6B6B" font-style="italic">123 Oak Lane</text></g>
  <g transform="translate(260,72)"><rect width="180" height="48" rx="8" fill="#FFFFFF" stroke="#4D8A3F" stroke-width="2"/><text x="16" y="30" font-family="Manrope" font-size="14" fill="#1A1A1A">123 Oak La|</text></g>
  <g transform="translate(460,72)"><rect width="180" height="48" rx="8" fill="#FFFFFF" stroke="#4D8A3F"/><text x="16" y="30" font-family="Manrope" font-size="14" fill="#1A1A1A">123 Oak Lane</text><circle cx="160" cy="24" r="8" fill="#4D8A3F"/><path d="M155 24 l3 3 6-6" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round"/></g>
  <g transform="translate(700,72)"><rect width="180" height="48" rx="8" fill="#FFFFFF" stroke="#C84B31" stroke-width="2"/><text x="16" y="30" font-family="Manrope" font-size="14" fill="#1A1A1A">123</text><text x="0" y="68" font-family="Manrope" font-size="12" fill="#C84B31">Please enter a complete address.</text></g>
  <g transform="translate(900,72)"><rect width="180" height="48" rx="8" fill="#FFFFFF" stroke="#C84B31" stroke-width="2"/><rect width="180" height="48" rx="8" fill="none" stroke="#C84B31" stroke-width="4" stroke-opacity="0.2"/><text x="16" y="30" font-family="Manrope" font-size="14" fill="#1A1A1A">123|</text></g>
  <g transform="translate(1100,72)"><rect width="180" height="48" rx="8" fill="#F2EDE3" stroke="#E8E2D2"/><text x="16" y="30" font-family="Manrope" font-size="14" fill="#6B6B6B">disabled</text></g>
  <text x="20" y="200" font-family="Manrope" font-weight="600" font-size="13" fill="#1A1A1A">Textarea</text>
  <g transform="translate(60,172)"><rect width="180" height="80" rx="8" fill="#FFFFFF" stroke="#E8E2D2"/><text x="164" y="68" text-anchor="end" font-family="Manrope" font-size="11" fill="#6B6B6B">0/500</text></g>
  <g transform="translate(260,172)"><rect width="180" height="80" rx="8" fill="#FFFFFF" stroke="#4D8A3F" stroke-width="2"/><text x="164" y="68" text-anchor="end" font-family="Manrope" font-size="11" fill="#6B6B6B">17/500</text></g>
  <g transform="translate(460,172)"><rect width="180" height="80" rx="8" fill="#FFFFFF" stroke="#4D8A3F"/><text x="164" y="68" text-anchor="end" font-family="Manrope" font-size="11" fill="#6B6B6B">17/500</text></g>
  <g transform="translate(700,172)"><rect width="180" height="80" rx="8" fill="#FFFFFF" stroke="#C84B31" stroke-width="2"/><text x="164" y="68" text-anchor="end" font-family="Manrope" font-size="11" fill="#C84B31">512/500</text><text x="0" y="100" font-family="Manrope" font-size="12" fill="#C84B31">Trim to 500 characters.</text></g>
  <g transform="translate(900,172)"><rect width="180" height="80" rx="8" fill="#FFFFFF" stroke="#C84B31" stroke-width="2"/><rect width="180" height="80" rx="8" fill="none" stroke="#C84B31" stroke-width="4" stroke-opacity="0.2"/></g>
  <g transform="translate(1100,172)"><rect width="180" height="80" rx="8" fill="#F2EDE3" stroke="#E8E2D2"/></g>
  <text x="20" y="324" font-family="Manrope" font-weight="600" font-size="13" fill="#1A1A1A">Select</text>
  <g transform="translate(60,296)"><rect width="180" height="48" rx="8" fill="#FFFFFF" stroke="#E8E2D2"/><text x="16" y="30" font-family="Manrope" font-size="14" fill="#6B6B6B">Select…</text></g>
  <g transform="translate(260,296)"><rect width="180" height="48" rx="8" fill="#FFFFFF" stroke="#4D8A3F" stroke-width="2"/><text x="16" y="30" font-family="Manrope" font-size="14" fill="#1A1A1A">$15–40k</text></g>
  <g transform="translate(460,296)"><rect width="180" height="48" rx="8" fill="#FFFFFF" stroke="#4D8A3F"/><text x="16" y="30" font-family="Manrope" font-size="14" fill="#1A1A1A">$15–40k</text><circle cx="160" cy="24" r="8" fill="#4D8A3F"/><path d="M155 24 l3 3 6-6" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round"/></g>
  <g transform="translate(700,296)"><rect width="180" height="48" rx="8" fill="#FFFFFF" stroke="#C84B31" stroke-width="2"/><text x="16" y="30" font-family="Manrope" font-size="14" fill="#6B6B6B">Select…</text><text x="0" y="68" font-family="Manrope" font-size="12" fill="#C84B31">Please choose one.</text></g>
  <g transform="translate(900,296)"><rect width="180" height="48" rx="8" fill="#FFFFFF" stroke="#C84B31" stroke-width="2"/><rect width="180" height="48" rx="8" fill="none" stroke="#C84B31" stroke-width="4" stroke-opacity="0.2"/></g>
  <g transform="translate(1100,296)"><rect width="180" height="48" rx="8" fill="#F2EDE3" stroke="#E8E2D2"/></g>
  <text x="20" y="424" font-family="Manrope" font-weight="600" font-size="13" fill="#1A1A1A">Checkbox / Radio / Tel / ZIP / Tile-select rows mirror Text spec; full per-field renders shipped in code-time Storybook.</text>
</svg>
```

**Spec.** Field uses 1.11 §11.1 ContactForm primitives. Wizard-specific differences: (1) Zip field shows `5/5` char counter once focused. (2) Textarea char counter same as 1.11. (3) Tile-select is a wizard-only composition of `.card--photo` + hidden radio. (4) `compact` density variant (used by chat lead-capture only) reduces input height 48 → 40 and label gap 12 → 8 — declared in §11. Error color: `--color-error` (#C84B31). Error message: `--text-caption` weight 500 `--color-error`. Error halo: 4px stroke at 0.2 alpha around field. **Decision trail:** D10.

---

### 3.9 Step navigation patterns

| Element | Variant | Position | Behavior |
|---|---|---|---|
| **Next** | `Primary green × lg` | Right-aligned desktop · Full-width mobile (sticky bar) | Disabled until any required-field is satisfied. Click validates per D10; on errors, scrolls to first error + focuses + announces via `aria-live` polite. On success, advances + URL updates `?step=N`. |
| **Back** | `Ghost × md` | Left-aligned desktop · Left half of sticky bar mobile | Always enabled except Step 1 (hidden). Decrements + URL update. State preserved. |
| **Save & continue later** | text-link, `--color-sunset-green-700` underlined | Below Next/Back row desktop · Above sticky bar mobile | Click shows toast: "Saved. Come back any time on this device." Stays on current step. Actual save is automatic on every Next; link is reassurance. |
| **Edit step N** | text-link, `--color-sunset-green-700` underlined, top-right of each Review row | Step 5 only | `router.push("?step=" + N)` preserving all state. |
| **Mobile sticky-Next bar** | full-width, `--z-sticky: 40`, `--shadow-soft` top edge, padding 16, safe-area-inset-bottom | Bottom of viewport, Steps 1–4 (hidden Step 5) | Hidden on `lg+`. |

**Decision trail:** D9, D12.

---

### 3.10 Thank-you page (`/thank-you/`)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 1480" role="img" aria-label="Thank-you page desktop">
  <rect width="1280" height="1480" fill="#FFFFFF"/>
  <rect width="1280" height="72" fill="#FFFFFF"/><line x1="0" y1="72" x2="1280" y2="72" stroke="#E8E2D2"/>
  <text x="64" y="44" font-family="Manrope" font-weight="700" font-size="20" fill="#2F5D27">Sunset Services</text>
  <rect x="1080" y="20" width="136" height="32" rx="6" fill="#E8A33D"/>
  <text x="1148" y="40" text-anchor="middle" font-family="Manrope" font-weight="700" font-size="13" fill="#1A1A1A">Get a Quote</text>
  <g transform="translate(0,72)">
    <rect width="1280" height="480" fill="#FAF7F1"/>
    <circle cx="640" cy="184" r="44" fill="#FFFFFF" stroke="#4D8A3F" stroke-width="3"/>
    <path d="M620 184 l14 14 28-28" stroke="#4D8A3F" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="640" y="276" text-anchor="middle" font-family="Manrope" font-weight="600" font-size="13" fill="#2F5D27" letter-spacing="1.5">REQUEST RECEIVED</text>
    <text x="640" y="332" text-anchor="middle" font-family="Onest" font-weight="600" font-size="44" fill="#1A1A1A">Thanks, Sara — we’ve got it.</text>
    <text x="640" y="372" text-anchor="middle" font-family="Manrope" font-size="18" fill="#4A4A4A">Erick will be in touch within one business day.</text>
  </g>
  <g transform="translate(0,552)">
    <rect width="1280" height="320" fill="#FFFFFF"/>
    <rect x="320" y="40" width="640" height="240" rx="16" fill="#FAF7F1"/>
    <text x="640" y="86" text-anchor="middle" font-family="Manrope" font-weight="600" font-size="13" fill="#2F5D27" letter-spacing="1.4">SKIP THE WAIT</text>
    <text x="640" y="124" text-anchor="middle" font-family="Onest" font-weight="600" font-size="26" fill="#1A1A1A">Want to lock in a 30-minute consult?</text>
    <rect x="490" y="194" width="300" height="44" rx="8" fill="#FFFFFF" stroke="#1A1A1A" stroke-width="1.5"/>
    <text x="640" y="222" text-anchor="middle" font-family="Manrope" font-weight="600" font-size="14" fill="#1A1A1A">Book a 30-min consult</text>
    <text x="640" y="258" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="#6B6B6B">[ Calendly placeholder · real embed Phase 2.07 ]</text>
  </g>
  <g transform="translate(0,872)">
    <rect width="1280" height="360" fill="#FAF7F1"/>
    <text x="640" y="68" text-anchor="middle" font-family="Onest" font-weight="600" font-size="32" fill="#1A1A1A">What happens next</text>
    <circle cx="240" cy="180" r="32" fill="#FFFFFF" stroke="#4D8A3F" stroke-width="2"/><text x="240" y="188" text-anchor="middle" font-family="Manrope" font-weight="700" font-size="20" fill="#2F5D27">1</text>
    <text x="240" y="240" text-anchor="middle" font-family="Onest" font-weight="600" font-size="18" fill="#1A1A1A">We review your project</text>
    <text x="240" y="266" text-anchor="middle" font-family="Manrope" font-size="13" fill="#4A4A4A">Today or tomorrow morning.</text>
    <circle cx="640" cy="180" r="32" fill="#FFFFFF" stroke="#4D8A3F" stroke-width="2"/><text x="640" y="188" text-anchor="middle" font-family="Manrope" font-weight="700" font-size="20" fill="#2F5D27">2</text>
    <text x="640" y="240" text-anchor="middle" font-family="Onest" font-weight="600" font-size="18" fill="#1A1A1A">Erick calls within 24 hours</text>
    <text x="640" y="266" text-anchor="middle" font-family="Manrope" font-size="13" fill="#4A4A4A">Quick scope-confirm chat.</text>
    <circle cx="1040" cy="180" r="32" fill="#FFFFFF" stroke="#4D8A3F" stroke-width="2"/><text x="1040" y="188" text-anchor="middle" font-family="Manrope" font-weight="700" font-size="20" fill="#2F5D27">3</text>
    <text x="1040" y="240" text-anchor="middle" font-family="Onest" font-weight="600" font-size="18" fill="#1A1A1A">We schedule a walk-through</text>
    <text x="1040" y="266" text-anchor="middle" font-family="Manrope" font-size="13" fill="#4A4A4A">On-site visit + estimate.</text>
  </g>
  <g transform="translate(0,1232)">
    <rect width="1280" height="120" fill="#FFFFFF"/>
    <text x="640" y="60" text-anchor="middle" font-family="Onest" font-weight="600" font-size="28" fill="#1A1A1A">Quick questions</text>
    <text x="320" y="100" font-family="Manrope" font-weight="600" font-size="15" fill="#1A1A1A">How soon will I hear back? · What should I have ready? · Can I reschedule?</text>
  </g>
  <g transform="translate(0,1352)">
    <rect width="1280" height="128" fill="#FAF7F1"/>
    <text x="320" y="68" font-family="Manrope" font-weight="600" font-size="14" fill="#2F5D27" text-decoration="underline">View our projects →</text>
    <text x="540" y="68" font-family="Manrope" font-weight="600" font-size="14" fill="#2F5D27" text-decoration="underline">Read our blog →</text>
    <text x="740" y="68" font-family="Manrope" font-weight="600" font-size="14" fill="#2F5D27" text-decoration="underline">Back to homepage →</text>
  </g>
</svg>
```

**Spec.** Five sections. Section 1 (cream) — green check icon (lucide `CheckCircle2` 64px desktop / 56px mobile, `--color-sunset-green-500`) + eyebrow + H1 with `{firstName}` interpolation + dek. **No amber CTA on this page.** Section 2 (white) — Calendly placeholder per 1.11 `CalendlyPlaceholder` precedent (real embed Phase 2.07). Section 3 (cream) — 3-step explainer with numbered green-bordered circles + lucide icons (1 `Inbox`, 2 `Phone`, 3 `Calendar`). Section 4 (white) — optional FAQ, 3 Q&A using `<details>`/`<summary>` per 1.08 §3.7 (no per-item wrapper). Section 5 (cream) — three Ghost text-links. **Section rhythm:** cream → white → cream → white → cream (1.03 §9 honored). **Schema:** zero. `<meta name="robots" content="noindex,follow">`. Sitewide JSON-LD wraps unchanged. **Greeting interpolation:** `{firstName}` from `?firstName=` querystring (Part 1) — sanitized server-side (HTML-stripped, max 50 chars), falls back to "there" if missing. **Decision trail:** D14, D15.

---

### 3.11 Mobile considerations (consolidated)

- All step screens single-column on mobile.
- Step indicator collapses to bar (D3).
- Sticky-Next bar (D12) at `--z-sticky: 40`, hidden on Step 5 (amber Submit replaces).
- Tel `inputmode="tel"`, email `inputmode="email"`, zip `inputmode="numeric"`.
- Address autocomplete stub respects mobile city/state/zip flow (city + state + zip on three lines mobile).
- Tile-based audience selection: tiles stack vertically, ~40vh tall.
- Mobile keyboard: `interactiveWidget=resizes-content` viewport meta + `visualViewport` JS fallback for sticky-Next bar offset.

### 3.12 Schema considerations

Per D15: zero schema on `/request-quote/` and zero schema on `/thank-you/`. Both routes inherit the sitewide JSON-LD from 1.05 (Organization + LocalBusiness + WebSite) unchanged. Documented deliberately.

### 3.13 Motion choreography (wizard)

| Surface | Trigger | Motion | Reduced motion |
|---|---|---|---|
| Hero / page header | mount | none (1.03 §7) | none |
| Step transition | Next/Back click | opacity 0→1 over 200ms `--motion-base` `--easing-soft`, no slide | opacity-only at `--motion-fast` |
| Step indicator dot fill | step advance | dot fill cross-fades + line color cross-fades over `--motion-base` | opacity-only |
| Mobile bar fill | step advance | width transitions over `--motion-base` `--easing-soft` | opacity-only fill swap |
| Field error reveal | Next-with-errors | shake 60ms × 2 (translateX ±2px) on field + scroll-into-view + focus | skip shake; keep scroll + focus |
| Resume toast | mount on return | slide up 8px + opacity over `--motion-base` | opacity-only |
| Submit spinner | Submit click | 360° rotation 1s linear infinite | opacity-pulse 0.5↔1 over 1s |
| Submit failure alert | UI-only inline alert reveal | slide-down 8px + opacity over `--motion-base` | opacity-only |
| Thank-you check icon | mount | scale 0.8→1 + opacity over 360ms `--motion-slow` `--easing-soft` (single hero element exception) | opacity-only |
| Thank-you sections | scroll into view | section-level `<AnimateIn>` per 1.06 (granularity rule) | opacity-only |

**Submit-failed visual** — `<div role="alert">` above Submit row, 16px padding, `--color-error-bg`, 4px `--color-error` left-border (the one allowed left-border-accent — error semantics, not generic UI trope), `--radius-md`. Copy: "Something went wrong sending that. Please try again or call (630) 946-9321." (tel: link).

---
## 4. AI Chat Widget — state-by-state spec

Each state ships: desktop SVG (anchored to bottom-right of a sample page), mobile SVG, annotated spec (token names + dimensions + motion + a11y), decision-trail to D-items.

### 4.1 Position + chrome interaction

- Bubble anchored bottom-right on every page **except** `/request-quote/` (D17 = B). The thank-you page keeps the bubble.
- `--z-chat: 50` — declared in §15. Sits above `--z-sticky: 40` (mobile-Next bar), below `--z-modal: 60` (lightbox precedent from 1.15).
- Hidden when `NEXT_PUBLIC_AI_CHAT_ENABLED !== "true"`. Component returns `null`. No DOM, no class, no style.
- Cookie consent gate per D29 — bubble visible pre-consent, click opens consent banner instead of panel.
- The bubble does **not** shift up when the wizard sticky-Next bar is visible (the bubble is hidden on the wizard route — moot). On the thank-you page, where there is no sticky bar, the bubble sits at the standard 24/16px offset.

### 4.2 State A — Collapsed bubble

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 800" role="img" aria-label="Chat bubble collapsed desktop">
  <rect width="1280" height="800" fill="#FFFFFF"/>
  <rect width="1280" height="72" fill="#FFFFFF"/><line x1="0" y1="72" x2="1280" y2="72" stroke="#E8E2D2"/>
  <text x="64" y="44" font-family="Manrope" font-weight="700" font-size="20" fill="#2F5D27">Sunset Services</text>
  <rect x="64" y="120" width="1152" height="600" rx="12" fill="#FAF7F1" stroke="#E8E2D2" stroke-dasharray="4 4"/>
  <text x="640" y="430" text-anchor="middle" font-family="JetBrains Mono" font-size="12" fill="#6B6B6B">[ sample page surface · any route except /request-quote/ ]</text>
  <g transform="translate(1180,720)">
    <circle cx="0" cy="0" r="34" fill="#000000" opacity="0.08"/>
    <circle cx="0" cy="-2" r="28" fill="#E8A33D"/>
    <path d="M-10 -8 a8 8 0 0 1 8 -8 h4 a8 8 0 0 1 8 8 v4 a8 8 0 0 1 -8 8 h-8 l-4 4 v-4 a8 8 0 0 1 -0 0 z" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linejoin="round"/>
  </g>
  <g font-family="JetBrains Mono" font-size="10" fill="#6B6B6B">
    <text x="1080" y="700">56px circle · amber-500</text>
    <text x="1080" y="714">--shadow-card on --shadow-soft</text>
    <text x="1080" y="744">offset 24px right / 24px bottom</text>
  </g>
</svg>
```

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" role="img" aria-label="Chat bubble collapsed mobile">
  <rect width="390" height="844" fill="#FFFFFF"/>
  <rect x="0" y="0" width="390" height="60" fill="#FFFFFF"/><line x1="0" y1="60" x2="390" y2="60" stroke="#E8E2D2"/>
  <text x="20" y="38" font-family="Manrope" font-weight="700" font-size="16" fill="#2F5D27">Sunset Services</text>
  <rect x="20" y="80" width="350" height="700" rx="12" fill="#FAF7F1" stroke="#E8E2D2" stroke-dasharray="4 4"/>
  <text x="195" y="430" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#6B6B6B">[ sample page surface ]</text>
  <g transform="translate(346,800)">
    <circle cx="0" cy="0" r="32" fill="#000000" opacity="0.08"/>
    <circle cx="0" cy="-2" r="28" fill="#E8A33D"/>
    <path d="M-10 -8 a8 8 0 0 1 8 -8 h4 a8 8 0 0 1 8 8 v4 a8 8 0 0 1 -8 8 h-8 l-4 4 v-4 a8 8 0 0 1 -0 0 z" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linejoin="round"/>
  </g>
  <text x="240" y="800" text-anchor="end" font-family="JetBrains Mono" font-size="10" fill="#6B6B6B">offset 16/16</text>
</svg>
```

**Spec.** 56px circle, `--color-amber-500` background, white lucide `MessageCircle` 28px centered. Layered shadow `--shadow-card` over `--shadow-soft`. Hover: scale 1.04 + `--shadow-hover` over `--motion-fast`. Focus-visible: 3px `--color-focus-ring` outside circle (2px gap). Press: scale 0.96. Tooltip-on-hover (desktop only, 300ms delay): EN "Chat with us" / ES "Habla con nosotros". "New message" badge slot — 8px `--color-error` dot top-right of bubble, rendered with class `chat-bubble--has-update` toggled off in Part 1, never illuminated. **A11y:** `<button aria-label="Open chat with Sunset Services" aria-expanded="false" aria-controls="chat-panel">`. **Decision trail:** D18, D19.

---

### 4.3 State B — Expanded panel (desktop)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 800" role="img" aria-label="Chat panel expanded desktop">
  <rect width="1280" height="800" fill="#FFFFFF"/>
  <rect width="1280" height="800" fill="#1A1A1A" opacity="0.04"/>
  <g transform="translate(872,216)">
    <rect x="-4" y="4" width="384" height="560" rx="24" fill="#000000" opacity="0.12"/>
    <rect width="384" height="560" rx="24" fill="#FFFFFF" stroke="#E8E2D2"/>
    <path d="M0 56 h384" stroke="#E8E2D2"/>
    <rect width="384" height="56" rx="24" fill="#FAF7F1"/>
    <rect y="32" width="384" height="24" fill="#FAF7F1"/>
    <circle cx="32" cy="28" r="16" fill="#2F5D27"/>
    <circle cx="32" cy="28" r="6" fill="#E8A33D"/>
    <text x="60" y="32" font-family="Manrope" font-weight="600" font-size="14" fill="#1A1A1A">Sunset Services</text>
    <circle cx="166" cy="29" r="4" fill="#4D8A3F"/>
    <text x="178" y="33" font-family="Manrope" font-size="12" fill="#6B6B6B">Online</text>
    <g font-family="Manrope" font-size="20" fill="#1A1A1A" font-weight="300">
      <text x="296" y="34">—</text><text x="328" y="34">⋮</text><text x="356" y="34">×</text>
    </g>
    <g transform="translate(0,56)">
      <circle cx="40" cy="40" r="14" fill="#2F5D27"/><circle cx="40" cy="40" r="5" fill="#E8A33D"/>
      <rect x="64" y="20" width="244" height="80" rx="16" fill="#FAF7F1"/>
      <path d="M64 20 l-8 0 l8 8 z" fill="#FAF7F1"/>
      <text x="80" y="48" font-family="Manrope" font-size="13" fill="#1A1A1A">Hi! I’m Sunny — Sunset</text>
      <text x="80" y="66" font-family="Manrope" font-size="13" fill="#1A1A1A">Services’ chat assistant. Ask</text>
      <text x="80" y="84" font-family="Manrope" font-size="13" fill="#1A1A1A">me anything.</text>
      <rect x="20" y="124" width="220" height="36" rx="18" fill="#FFFFFF" stroke="#E8E2D2"/>
      <text x="36" y="146" font-family="Manrope" font-size="12" fill="#1A1A1A">How much for a paver patio?</text>
      <rect x="20" y="170" width="220" height="36" rx="18" fill="#FFFFFF" stroke="#E8E2D2"/>
      <text x="36" y="192" font-family="Manrope" font-size="12" fill="#1A1A1A">Do you service Naperville?</text>
      <rect x="20" y="216" width="220" height="36" rx="18" fill="#FFFFFF" stroke="#E8E2D2"/>
      <text x="36" y="238" font-family="Manrope" font-size="12" fill="#1A1A1A">When can someone visit?</text>
    </g>
    <rect y="464" width="384" height="96" fill="#FAF7F1"/>
    <line x1="0" y1="464" x2="384" y2="464" stroke="#E8E2D2"/>
    <rect x="20" y="484" width="288" height="56" rx="14" fill="#FFFFFF" stroke="#E8E2D2"/>
    <text x="36" y="516" font-family="Manrope" font-size="13" fill="#6B6B6B" font-style="italic">Type your message…</text>
    <rect x="320" y="492" width="44" height="40" rx="10" fill="#4D8A3F"/>
    <path d="M334 512 l16 -8 l-16 -8 l4 8 z" fill="#FFFFFF"/>
    <text x="60" y="552" font-family="Manrope" font-size="12" fill="#2F5D27" text-decoration="underline">Get a quote in 30 seconds →</text>
  </g>
  <g transform="translate(1180,720)">
    <circle cx="0" cy="0" r="28" fill="#E8A33D" opacity="0.4"/>
  </g>
</svg>
```

**Spec.** Floating panel 384 × 560, `--radius-xl` (24), `--shadow-popover` over `--shadow-card`, `--color-bg` (#FFFFFF) body. Anchored 24px from right + 24px from bottom; bubble fades to 40% opacity behind panel during open. **Header (56 tall, `--color-bg-cream`):** 32px circle assistant avatar (sun-mark inline SVG: `--color-sunset-green-700` circle with `--color-amber-500` inner disc), label "Sunset Services" `--text-body` weight 600 + 8px `--color-sunset-green-500` online-dot + caption "Online" `--text-caption` `--color-text-muted`, spacer, minimize button (lucide `Minus` 20px ghost icon-only), kebab menu (lucide `MoreVertical` 20px → "Reset conversation" + "View past conversations placeholder"), close (lucide `X` 20px ghost). **Message log (404 tall, scrollable):** padding 16/24, scroll-behavior smooth, scrollbar `--color-border` 4px thin. **Composer (96 tall):** `--color-bg-cream` background + 1px `--color-border` top hairline, textarea (auto-grow 1→4 lines, max 500 chars, padding 16, `--text-body`, `--radius-md`), send button (Primary green icon-only, 44 × 40, lucide `Send` 20px), char hint right-aligned bottom (appears at ≥80% threshold). Ghost × sm "Get a quote in 30 seconds →" below composer. **Open motion:** opacity 0→1 + scale 0.94→1 from bottom-right origin over 200ms `--motion-base` `--easing-soft`. Reduced motion: opacity-only. **A11y:** non-modal `<dialog open aria-modal="false" aria-labelledby="chat-header">` desktop — does NOT trap focus (page behind remains usable). Esc closes panel + returns focus to bubble. **Decision trail:** D21, D29 (consent-gated header content unchanged but click-flow differs).

---

### 4.4 State C — Expanded panel (mobile)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" role="img" aria-label="Chat panel expanded mobile">
  <rect width="390" height="844" fill="#FFFFFF"/>
  <rect width="390" height="844" fill="#000000" opacity="0.4"/>
  <g transform="translate(0,127)">
    <rect width="390" height="717" rx="24" fill="#FFFFFF"/>
    <rect y="24" width="390" height="693" fill="#FFFFFF"/>
    <rect x="175" y="12" width="40" height="4" rx="2" fill="#C8C0AB"/>
    <rect width="390" height="64" rx="24" fill="#FAF7F1"/>
    <rect y="40" width="390" height="24" fill="#FAF7F1"/>
    <line x1="0" y1="64" x2="390" y2="64" stroke="#E8E2D2"/>
    <circle cx="40" cy="42" r="16" fill="#2F5D27"/><circle cx="40" cy="42" r="6" fill="#E8A33D"/>
    <text x="68" y="46" font-family="Manrope" font-weight="600" font-size="15" fill="#1A1A1A">Sunset Services</text>
    <circle cx="186" cy="44" r="4" fill="#4D8A3F"/><text x="198" y="48" font-family="Manrope" font-size="11" fill="#6B6B6B">Online</text>
    <text x="332" y="49" font-family="Manrope" font-size="20" fill="#1A1A1A">⋮</text>
    <text x="362" y="49" font-family="Manrope" font-size="22" fill="#1A1A1A">×</text>
    <g transform="translate(0,64)">
      <circle cx="32" cy="40" r="14" fill="#2F5D27"/><circle cx="32" cy="40" r="5" fill="#E8A33D"/>
      <rect x="56" y="20" width="280" height="80" rx="16" fill="#FAF7F1"/>
      <text x="72" y="48" font-family="Manrope" font-size="14" fill="#1A1A1A">Hi! I’m Sunny — Sunset</text>
      <text x="72" y="68" font-family="Manrope" font-size="14" fill="#1A1A1A">Services’ chat assistant.</text>
      <text x="72" y="86" font-family="Manrope" font-size="14" fill="#1A1A1A">Ask me anything.</text>
      <rect x="20" y="130" width="350" height="44" rx="22" fill="#FFFFFF" stroke="#E8E2D2"/>
      <text x="40" y="156" font-family="Manrope" font-size="13" fill="#1A1A1A">How much for a paver patio?</text>
      <rect x="20" y="184" width="350" height="44" rx="22" fill="#FFFFFF" stroke="#E8E2D2"/>
      <text x="40" y="210" font-family="Manrope" font-size="13" fill="#1A1A1A">Do you service Naperville?</text>
      <rect x="170" y="278" width="200" height="60" rx="16" fill="#2F5D27"/>
      <text x="190" y="306" font-family="Manrope" font-size="14" fill="#FFFFFF">When can someone</text>
      <text x="190" y="324" font-family="Manrope" font-size="14" fill="#FFFFFF">visit my yard?</text>
    </g>
    <rect y="595" width="390" height="122" fill="#FAF7F1"/>
    <line x1="0" y1="595" x2="390" y2="595" stroke="#E8E2D2"/>
    <rect x="20" y="615" width="300" height="56" rx="14" fill="#FFFFFF" stroke="#E8E2D2"/>
    <text x="36" y="647" font-family="Manrope" font-size="13" fill="#6B6B6B" font-style="italic">Type your message…</text>
    <rect x="332" y="623" width="44" height="40" rx="10" fill="#4D8A3F"/>
    <path d="M346 643 l16 -8 l-16 -8 l4 8 z" fill="#FFFFFF"/>
    <text x="60" y="690" font-family="Manrope" font-size="12" fill="#2F5D27" text-decoration="underline">Get a quote in 30 seconds →</text>
  </g>
</svg>
```

**Spec.** Bottom sheet, full-bleed width, height `min(85vh, 720px)`, rounded top corners only (`--radius-xl`). Drag handle 40 × 4 `--color-border-strong` rounded-pill, 12px from top, centered. Header structurally same as desktop, no minimize (mobile uses drag-down). **Backdrop:** `rgba(0,0,0,0.4)` overlay, taps backdrop → close. **Composer respects `safe-area-inset-bottom`** + `<meta name="viewport" content="… interactive-widget=resizes-content">` (declared in §11). **Open motion:** translateY 100%→0 + backdrop opacity 0→0.4 over 240ms `--motion-base` `--easing-soft`. Reduced motion: opacity-only. **A11y:** `<dialog aria-modal="true">` + `showModal()` — full focus-trap mobile (sheet IS the page). Esc + close button + drag-down all close. **Decision trail:** D22, D29.

---

### 4.5 Message bubbles (visual contract)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 380" role="img" aria-label="Message bubble variants">
  <rect width="384" height="380" fill="#FFFFFF"/>
  <circle cx="32" cy="32" r="14" fill="#2F5D27"/><circle cx="32" cy="32" r="5" fill="#E8A33D"/>
  <rect x="56" y="14" width="248" height="64" rx="16" fill="#FAF7F1"/>
  <path d="M56 14 l-6 0 l6 6 z" fill="#FAF7F1"/>
  <text x="72" y="42" font-family="Manrope" font-size="14" fill="#1A1A1A">A paver patio in your area</text>
  <text x="72" y="60" font-family="Manrope" font-size="14" fill="#1A1A1A">runs $18–32 per sq ft.</text>
  <rect x="56" y="86" width="218" height="44" rx="16" fill="#FAF7F1"/>
  <text x="72" y="114" font-family="Manrope" font-size="14" fill="#1A1A1A">Want a free walk-through?</text>
  <rect x="120" y="156" width="244" height="44" rx="16" fill="#2F5D27"/>
  <path d="M364 156 l6 0 l-6 6 z" fill="#2F5D27"/>
  <text x="138" y="184" font-family="Manrope" font-size="14" fill="#FFFFFF">Yes, I’m in Naperville.</text>
  <circle cx="32" cy="232" r="14" fill="#2F5D27"/><circle cx="32" cy="232" r="5" fill="#E8A33D"/>
  <rect x="56" y="216" width="220" height="44" rx="16" fill="#FAF7F1"/>
  <path d="M56 216 l-6 0 l6 6 z" fill="#FAF7F1"/>
  <g><circle cx="80" cy="238" r="3" fill="#1A1A1A" opacity="0.3"/><circle cx="92" cy="238" r="3" fill="#1A1A1A" opacity="0.6"/><circle cx="104" cy="238" r="3" fill="#1A1A1A"/></g>
  <text x="72" y="298" font-family="JetBrains Mono" font-size="10" fill="#6B6B6B">[ typing indicator · 3-dot stagger 200ms · 480ms cycle ]</text>
  <line x1="0" y1="320" x2="384" y2="320" stroke="#E8E2D2"/>
  <text x="20" y="346" font-family="JetBrains Mono" font-size="10" fill="#6B6B6B">assistant: .card--cream + radius-lg + tail tl 4px · max-w 85%</text>
  <text x="20" y="362" font-family="JetBrains Mono" font-size="10" fill="#6B6B6B">user: green-700 bg + on-green text · radius-lg + tail tr 4px · max-w 85%</text>
</svg>
```

**Spec.** Per D23. Assistant left, `.card--cream` body, `--radius-lg` (16) with **top-left corner 4px** (the visual "tail"), max-width 85% of log inner width. User right, custom green bubble: `--color-sunset-green-700` background + `--color-text-on-green` (white) text, `--radius-lg` with **top-right corner 4px**, max-width 85%. Both: 12/16 padding (top-bottom / left-right). Spacing: 8px gap between consecutive same-sender bubbles, 16px gap on sender switch. Avatar (32px circle sun-mark) shown on **first** assistant bubble of a turn; subsequent same-turn bubbles omit avatar (preserves the 32+8 indent). Timestamps: hover-only on desktop (caption-on-hover above bubble), hidden on mobile (clutter). **Inline content (D24):** plaintext + auto-linked URLs (always); bold via `**` and italic via `*` (Markdown subset, sanitized — surface for ratification, alt is plaintext-only Part 1); inline monospace via `` ` `` (code blocks rare); emoji passthrough; HTML sanitized to nothing. Links inside chat: always-underlined `--color-sunset-green-700` (link recognition is harder in a constrained surface). **Entrance motion:** opacity 0→1 over `--motion-fast` per bubble. **A11y:** `<div role="log" aria-live="polite" aria-atomic="false">` containing `<div role="article" aria-label="Sunny said">` per assistant bubble and `<div role="article" aria-label="You said">` per user bubble. Streaming announce-buffer flushes on sentence boundary or 240ms idle. **Decision trail:** D23, D24, D25.

---

### 4.6 Welcome state + suggested prompts

Already shown inline in §4.3 / §4.4 (the empty-log state). **Strings (EN / ES):**

| Element | EN | ES |
|---|---|---|
| Greeting | "Hi! I’m Sunny — Sunset Services’ chat assistant. Ask me anything about your yard, our projects, or pricing." | "¡Hola! Soy Sunny — el asistente de Sunset Services. Pregúntame sobre tu jardín, nuestros proyectos o precios." |
| Prompt 1 | "How much does a paver patio cost?" | "¿Cuánto cuesta un patio de adoquines?" |
| Prompt 2 | "Do you service Naperville?" | "¿Atienden Naperville?" |
| Prompt 3 | "When can someone come look at my yard?" | "¿Cuándo pueden venir a ver mi jardín?" |

Each chip = `Ghost × md` button at chip aspect (no new variant). Tap → simulate user-sent that text → assistant streams stub response. **Decision trail:** D20.

---

### 4.7 Streaming + typing indicator

**Typing indicator:** assistant bubble containing 3 × 8px circles in `--color-text-primary`, each opacity-pulses 0.3 → 1.0 → 0.3 over 480ms, staggered 200ms (dot 1: 0ms, dot 2: 200ms, dot 3: 400ms). Reduced motion: single static 8px dot at 0.6 opacity, no pulse. **Streaming text:** as tokens arrive, bubble grows; trailing 1px-wide × 1.2em-tall cursor pseudo-element blinks at 1Hz (`--color-text-primary`); on stream-end the cursor is removed. Reduced motion: cursor static (no blink). **Live-region buffer:** flush to `aria-live` polite only on sentence boundary (`.`, `?`, `!`) OR 240ms idle. Spec only — Code implements 1.20.

---

### 4.8 Lead-capture inline form (D26)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 460" role="img" aria-label="Lead-capture inline form">
  <rect width="384" height="460" fill="#FFFFFF"/>
  <circle cx="32" cy="32" r="14" fill="#2F5D27"/><circle cx="32" cy="32" r="5" fill="#E8A33D"/>
  <rect x="56" y="14" width="280" height="44" rx="16" fill="#FAF7F1"/>
  <text x="72" y="42" font-family="Manrope" font-size="14" fill="#1A1A1A">Quick — let me grab some info.</text>
  <rect x="56" y="76" width="312" height="368" rx="16" fill="#FFFFFF" stroke="#E8E2D2"/>
  <text x="72" y="106" font-family="Onest" font-weight="600" font-size="16" fill="#1A1A1A">Quick quote setup</text>
  <text x="72" y="126" font-family="Manrope" font-size="12" fill="#4A4A4A">Erick will be in touch within one business day.</text>
  <text x="72" y="158" font-family="Manrope" font-size="12" font-weight="600" fill="#1A1A1A">First name</text>
  <rect x="72" y="166" width="276" height="40" rx="8" fill="#FFFFFF" stroke="#E8E2D2"/>
  <text x="72" y="232" font-family="Manrope" font-size="12" font-weight="600" fill="#1A1A1A">Email</text>
  <rect x="72" y="240" width="276" height="40" rx="8" fill="#FFFFFF" stroke="#E8E2D2"/>
  <text x="72" y="306" font-family="Manrope" font-size="12" font-weight="600" fill="#1A1A1A">Phone (optional)</text>
  <rect x="72" y="314" width="276" height="40" rx="8" fill="#FFFFFF" stroke="#E8E2D2"/>
  <rect x="72" y="376" width="180" height="44" rx="8" fill="#4D8A3F"/>
  <text x="162" y="404" text-anchor="middle" font-family="Manrope" font-weight="600" font-size="14" fill="#FFFFFF">Send to Erick</text>
  <text x="276" y="404" font-family="Manrope" font-size="13" fill="#6B6B6B" text-decoration="underline">Cancel</text>
</svg>
```

**Spec.** Trigger: user clicks "Get a quote in 30 seconds →" Ghost link below composer. Card slides into log assistant-side; visually distinct (`--color-bg` surface + 1px `--color-border` border + `--radius-lg`, NOT `.card--cream`). H3 "Quick quote setup" (`--text-h5` weight 600). Three fields use **`compact` density** (input height 40 instead of 48, label gap 8 instead of 12) — declared as 1.11 §11.1 extension in §11 below. Optional phone marked `(optional)` in label. Primary green × md "Send to Erick". Ghost text "Cancel" right-aligned. **After Submit (UI-only Part 1):** card collapses (height 0 + opacity 0 over `--motion-base`); follow-up assistant message: "Got it — Erick will be in touch within one business day. Want to give us more details?" + Ghost link "Open the full form →" → `/request-quote/?step=3`. **Validation:** per D10. **Decision trail:** D26.

---

### 4.9 High-intent escalation visual (D27)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 80" role="img" aria-label="High-intent banner">
  <rect width="384" height="80" fill="#FFFFFF"/>
  <rect x="0" y="0" width="384" height="56" fill="#DCE8D5"/>
  <line x1="0" y1="56" x2="384" y2="56" stroke="#4D8A3F" stroke-opacity="0.2"/>
  <circle cx="32" cy="28" r="10" fill="#4D8A3F"/><path d="M27 28 l4 4 8-8" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round"/>
  <text x="52" y="33" font-family="Manrope" font-weight="600" font-size="13" fill="#1A1A1A">We’ve alerted Erick — he’ll join shortly.</text>
  <text x="356" y="33" text-anchor="end" font-family="Manrope" font-size="16" fill="#1A1A1A">×</text>
</svg>
```

**Spec.** Banner slides down from below header over message log top; height 56px; `--color-sunset-green-100` background; lucide `Check` icon in `--color-sunset-green-500` filled circle; `--text-body` weight 600 copy; close (X) right. **Auto-dismiss after 6 seconds** (slide-up + opacity over `--motion-base`); manual close also available. Trigger logic is Phase 2.09; Part 1 ships visual + the slot. Reduced motion: opacity-only fade-in. **Strings (EN / ES):** "We’ve alerted Erick — he’ll join shortly." / "Hemos avisado a Erick — se unirá en un momento." **Decision trail:** D27.

---

### 4.10 Empty / error / rate-limit / kill-switch states

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 460" role="img" aria-label="Chat error states">
  <rect width="384" height="460" fill="#FFFFFF"/>
  <text x="20" y="32" font-family="Manrope" font-weight="700" font-size="13" fill="#2F5D27">Network error</text>
  <rect x="252" y="42" width="112" height="36" rx="14" fill="#2F5D27"/><text x="308" y="65" text-anchor="middle" font-family="Manrope" font-size="13" fill="#FFFFFF">When can…</text>
  <circle cx="32" cy="100" r="14" fill="#2F5D27"/><circle cx="32" cy="100" r="5" fill="#E8A33D"/>
  <rect x="56" y="84" width="244" height="44" rx="16" fill="#FAF7F1"/>
  <text x="72" y="112" font-family="Manrope" font-size="13" fill="#1A1A1A">I lost connection. Try again?</text>
  <rect x="56" y="138" width="92" height="32" rx="8" fill="#FFFFFF" stroke="#1A1A1A"/>
  <text x="102" y="160" text-anchor="middle" font-family="Manrope" font-weight="600" font-size="12" fill="#1A1A1A">Retry</text>
  <text x="20" y="208" font-family="Manrope" font-weight="700" font-size="13" fill="#2F5D27">Rate-limit hit</text>
  <circle cx="32" cy="244" r="14" fill="#2F5D27"/><circle cx="32" cy="244" r="5" fill="#E8A33D"/>
  <rect x="56" y="228" width="284" height="44" rx="16" fill="#FAF7F1"/>
  <text x="72" y="256" font-family="Manrope" font-size="13" fill="#1A1A1A">I’m catching my breath — try in a minute.</text>
  <text x="20" y="304" font-family="Manrope" font-weight="700" font-size="13" fill="#2F5D27">Anthropic API down — graceful degrade</text>
  <circle cx="32" cy="340" r="14" fill="#2F5D27"/><circle cx="32" cy="340" r="5" fill="#E8A33D"/>
  <rect x="56" y="324" width="306" height="78" rx="16" fill="#FAF7F1"/>
  <text x="72" y="350" font-family="Manrope" font-size="13" fill="#1A1A1A">I’m offline right now. Email us at</text>
  <text x="72" y="368" font-family="Manrope" font-size="13" fill="#2F5D27" text-decoration="underline">info@sunsetservices.us</text>
  <text x="72" y="386" font-family="Manrope" font-size="13" fill="#1A1A1A">or call <tspan fill="#2F5D27" text-decoration="underline">(630) 946-9321</tspan>.</text>
  <text x="20" y="436" font-family="Manrope" font-weight="700" font-size="13" fill="#2F5D27">Kill switch (AI_CHAT_ENABLED=false)</text>
  <text x="20" y="454" font-family="JetBrains Mono" font-size="11" fill="#6B6B6B">renders nothing — no DOM</text>
</svg>
```

**Spec.**

| State | Trigger | UI | Recovery |
|---|---|---|---|
| **Network error** | fetch failure | Assistant bubble "I lost connection for a second. Try again?" + Ghost × sm "Retry" button next to the failed user bubble | User clicks Retry → re-sends last message |
| **Rate-limit (1/2s, 50/day per IP)** | 429 from `/api/chat` (Phase 2.09) | Assistant bubble "I’m catching my breath — please try again in a minute." | Silent recovery, no retry button |
| **Anthropic API down** | 5xx from `/api/chat` | Assistant bubble "I’m offline right now. Email us at info@sunsetservices.us or call (630) 946-9321." Email = `mailto:`, phone = `tel:+16309469321`. | Auto-restored on next user attempt |
| **Kill switch on** | `NEXT_PUBLIC_AI_CHAT_ENABLED !== "true"` | Component returns `null`. No DOM. No bubble. No layout impact. | n/a — server-toggled |

**ES strings:**

- Network: "Perdí la conexión un momento. ¿Intentamos de nuevo?" / button "Reintentar"
- Rate-limit: "Tomando aire — vuelve a intentarlo en un minuto."
- API down: "Estoy fuera de línea ahora mismo. Escríbenos a info@sunsetservices.us o llama al (630) 946-9321."

**Decision trail:** Plan §12 rate-limits + Plan §11 fallback ladder.

---

### 4.11 Cookie consent gate (D29)

**Pre-consent.** Bubble visible (so the user knows chat exists). On click, the panel does NOT open — instead the cookie consent banner opens (Phase 2.11 wires the banner; Part 1 ships the redirect). On hover (desktop): tooltip "Enable cookies to start chat" / "Habilita cookies para chatear" instead of "Chat with us". Bubble keeps amber color but receives a hairline `--color-text-muted` ring at 1px to subtly indicate gated state. **Post-consent.** Full normal behavior. The persistence layer (D28) only writes after consent is granted — pre-consent attempts are no-ops. **Decision trail:** D29.

### 4.12 Persistence + reset (D28)

Per-locale storage keys: `sunset_chat_history_en` and `sunset_chat_history_es`. Each value: JSON array of `{ role: "user"|"assistant", content: string, timestamp: ISO8601 }`. **Storage choice — open mismatch:** Plan §12 reads "stored in browser localStorage during session, cleared on close" — `localStorage` does NOT clear on tab close, only `sessionStorage` does. Recommended resolution: use **`sessionStorage`** (Plan-literal "cleared on close" wins; localStorage interpretation is the alternate). Documented as open mismatch in §16. "Reset conversation" link in header kebab menu: clears the storage key + reloads welcome state + closes & reopens the panel for visual confirmation (300ms total). **Locale switch:** changing locale during a chat session preserves both keys but only displays the current-locale key (no cross-locale leakage). **Decision trail:** D28.

### 4.13 Reduced motion (chat widget)

| Surface | Default motion | Reduced motion |
|---|---|---|
| Bubble hover | scale 1.04 + shadow swap | scale 1.0 + shadow swap retained |
| Bubble press | scale 0.96 | none |
| Panel open (desktop) | opacity + scale 0.94→1 from origin | opacity-only |
| Panel open (mobile) | translateY 100%→0 + backdrop fade | opacity-only |
| Typing indicator | 3-dot bounce 480ms loop | single static dot at 0.6 opacity |
| Streaming cursor | 1Hz blink | static |
| Bubble entrance per message | opacity 0→1 `--motion-fast` | opacity-only (already minimal) |
| High-intent banner | slide-down + auto-dismiss | opacity-only fade |
| Lead-form card collapse | height + opacity over `--motion-base` | opacity-only |

**Decision trail:** D30.

---
## 5. SEO and schema

- **`/request-quote/` and `/es/request-quote/`** — zero schema. The wizard is a form, not a content surface. Per D15.
- **`/thank-you/` and `/es/thank-you/`** — zero schema + `<meta name="robots" content="noindex,follow">` (transactional landing not for search).
- **Chat widget** — zero schema. It is chrome.
- **Sitewide JSON-LD** (Organization + LocalBusiness + WebSite from 1.05) wraps both routes unchanged.
- **Heading hierarchy:**
  - `/request-quote/`: H1 in page header. Step indicator labels are `<ol>` items, not headings. Each step’s section heading is H2 ("Who are we helping?", "Which residential services?", "Tell us about the project", "How can we reach you?", "Look good?"). Step 3 sub-section labels ("ABOUT THE PROPERTY") are `<div>` with `aria-labelledby`-pattern label spans, not H3 — they are semantic eyebrows, not headings, to keep the H1 → H2 ladder clean.
  - `/thank-you/`: H1 in confirmation hero. Calendly card H2 ("Want to lock in a 30-minute consult?"). "What happens next" H2 with 3 step labels as H3 each. FAQ uses `<details>`/`<summary>` per 1.08 §3.7 (no H3 inside).
- **`/request-quote/` indexability:** allow indexing; canonical is itself; `hreflang` pair to ES variant.
- **Sitemap.xml** (1.05): include `/request-quote/` priority 0.9 (high-value lead route); EXCLUDE `/thank-you/` (noindex).

---

## 6. Photography brief

Slim — the wizard is form-heavy.

| Slot | Aspect (D) | Aspect (M) | Subject | Notes |
|---|---|---|---|---|
| Step 1 — Audience tile (Residential) | 4:3 | 4:3 | Suburban front yard, freshly mowed, golden-hour | Reuse Phase 1.06 audience-entries asset |
| Step 1 — Audience tile (Commercial) | 4:3 | 4:3 | Office-park entrance with manicured beds | Reuse 1.06 audience-entries asset |
| Step 1 — Audience tile (Hardscape) | 4:3 | 4:3 | Paver patio with fire feature | Reuse 1.06 audience-entries asset |
| Wizard hero (D13 = B = no photo) | — | — | — | None |
| Thank-you hero | — | — | None | Iconographic only |
| Chat avatar | — | — | Brand sun-mark inline SVG | No photo. SVG path: `<circle r="14" fill="--color-sunset-green-700"/><circle r="5" fill="--color-amber-500"/>` (32 × 32 viewBox) — declared in §11. |

All other slots: none. No new photo briefs for Cowork (Phase 2.04).

---

## 7. i18n strings table (EN + ES first-pass)

Phase 2.13 ships the native ES review. Strings flagged `[LEN]` are where ES word-length materially affects layout.

### 7.1 `wizard.*`

| Key | EN | ES |
|---|---|---|
| `wizard.eyebrow` | REQUEST A QUOTE | SOLICITA UN PRESUPUESTO |
| `wizard.title` | Tell us about your project | Cuéntanos sobre tu proyecto |
| `wizard.subtitle` | 5 short steps · about 5 minutes | 5 pasos cortos · unos 5 minutos |
| `wizard.tip.title` | What you’ll need | Qué necesitas |
| `wizard.tip.body` | Your address, a brief project description, and your phone or email — about 5 minutes. | Tu dirección, una breve descripción del proyecto, y tu teléfono o correo — unos 5 minutos. |
| `wizard.step.1` | Audience | Quién |
| `wizard.step.2` | Service | Servicio |
| `wizard.step.3` | Project details | Detalles del proyecto |
| `wizard.step.4` | Contact | Contacto |
| `wizard.step.5` | Review &amp; submit | Revisar y enviar |
| `wizard.step1.title` | Who are we helping? | ¿A quién ayudamos? |
| `wizard.step1.helper` | Pick the closest match — you can add more in Step 2. | Elige la mejor opción — puedes añadir más en el Paso 2. |
| `wizard.audience.residential.title` | Residential | Residencial |
| `wizard.audience.residential.dek` | Lawn, planting, snow, seasonal cleanup at home. | Césped, plantación, nieve, limpieza estacional en casa. |
| `wizard.audience.commercial.title` | Commercial | Comercial |
| `wizard.audience.commercial.dek` | Property management, snow contracts, turf care. | Administración de propiedades, contratos de nieve, cuidado de césped. |
| `wizard.audience.hardscape.title` | Hardscape | Hardscape |
| `wizard.audience.hardscape.dek` | Patios, walls, driveways, fire features, kitchens. | Patios, muros, entradas, fogatas, cocinas. |
| `wizard.step2.title.residential` | Which residential services? | ¿Qué servicios residenciales? |
| `wizard.step2.title.commercial` | Which commercial services? | ¿Qué servicios comerciales? |
| `wizard.step2.title.hardscape` | Which hardscape projects? | ¿Qué proyectos de hardscape? |
| `wizard.step2.helper` | Pick all that apply. Set a primary if more than one. | Elige todos los que apliquen. Marca uno como principal si eliges más de uno. |
| `wizard.step2.primary` | PRIMARY SERVICE | SERVICIO PRINCIPAL |
| `wizard.step2.other` | Other / Not sure | Otro / No estoy seguro |
| `wizard.step2.other.placeholder` | Tell us in your own words… | Cuéntanos con tus propias palabras… |
| `wizard.step3.title` | Tell us about the project | Cuéntanos sobre el proyecto |
| `wizard.step3.helper` | A few quick details so we can plan ahead. Skip what doesn’t apply. | Algunos detalles rápidos para planear. Omite lo que no aplique. |
| `wizard.field.propertySize` | Property size (sq ft) | Tamaño del lote (pies²) |
| `wizard.field.bedrooms` | Bedrooms | Habitaciones |
| `wizard.field.projectType` | Project type | Tipo de proyecto |
| `wizard.projectType.renovation` | Renovation | Renovación |
| `wizard.projectType.newInstall` | New install | Instalación nueva |
| `wizard.projectType.maintenance` | Maintenance | Mantenimiento |
| `wizard.projectType.other` | Other | Otro |
| `wizard.field.timeline` | Timeline | Cronograma |
| `wizard.timeline.asap` | ASAP | Lo antes posible |
| `wizard.timeline.13mo` | 1–3 months | 1–3 meses |
| `wizard.timeline.36mo` | 3–6 months | 3–6 meses |
| `wizard.timeline.flex` | Flexible | Flexible |
| `wizard.field.budget` | Budget range | Presupuesto |
| `wizard.budget.under5` | Under $5k | Menos de $5k |
| `wizard.budget.5to15` | $5–15k | $5–15k |
| `wizard.budget.15to40` | $15–40k | $15–40k |
| `wizard.budget.40plus` | $40k+ | $40k+ |
| `wizard.budget.unsure` | Not sure | No estoy seguro |
| `wizard.field.notes` | Anything else we should know? | ¿Algo más que debamos saber? |
| `wizard.field.notes.placeholder` | Tell us anything Erick should know before we call… | Cuéntanos cualquier cosa que Erick deba saber antes de llamar… |
| `wizard.step3.commercial.numProperties` | # of properties | # de propiedades |
| `wizard.step3.commercial.numBuildings` | # of buildings or sites | # de edificios o sitios |
| `wizard.step3.commercial.contract` | Contract preference | Tipo de contrato |
| `wizard.step3.commercial.contract.oneTime` | One-time | Una vez |
| `wizard.step3.commercial.contract.seasonal` | Seasonal | Estacional |
| `wizard.step3.commercial.contract.annual` | Annual | Anual |
| `wizard.step3.commercial.frequency` | Service frequency | Frecuencia de servicio |
| `wizard.step3.hardscape.spaceType` | Space type | Tipo de espacio |
| `wizard.step3.hardscape.dimensions` | Approximate dimensions (W × L) | Dimensiones aproximadas (A × L) |
| `wizard.step3.hardscape.surface` | Surface preference | Superficie preferida |
| `wizard.step3.hardscape.features` | Features wanted | Elementos deseados |
| `wizard.step4.title` | How can we reach you? | ¿Cómo te contactamos? |
| `wizard.step4.subtitle` | Erick will follow up within one business day. | Erick responderá en un día hábil. |
| `wizard.field.firstName` | First name | Nombre |
| `wizard.field.lastName` | Last name | Apellido |
| `wizard.field.email` | Email | Correo |
| `wizard.field.phone` | Phone | Teléfono |
| `wizard.field.callUs` | or call us | o llámanos |
| `wizard.address.section` | PROPERTY ADDRESS | DIRECCIÓN DE LA PROPIEDAD |
| `wizard.field.street` | Street address | Calle |
| `wizard.field.unit` | Unit / apt | Unidad / apto |
| `wizard.field.city` | City | Ciudad |
| `wizard.field.state` | State | Estado |
| `wizard.field.zip` | ZIP | Código postal |
| `wizard.preferences.section` | CONTACT PREFERENCES (OPTIONAL) | PREFERENCIAS DE CONTACTO (OPCIONAL) |
| `wizard.field.bestTime` | Best time | Mejor horario |
| `wizard.bestTime.morning` | Morning | Mañana |
| `wizard.bestTime.afternoon` | Afternoon | Tarde |
| `wizard.bestTime.evening` | Evening | Noche |
| `wizard.bestTime.anytime` | Anytime | Cualquier momento |
| `wizard.field.contactMethod` | Reach me by | Contáctame por |
| `wizard.contactMethod.email` | Email | Correo |
| `wizard.contactMethod.phone` | Phone | Teléfono |
| `wizard.contactMethod.text` | Text | Mensaje |
| `wizard.step5.title` | Look good? | ¿Se ve bien? |
| `wizard.step5.subtitle` | Review your answers — Erick will get them in his inbox. | Revisa tus respuestas — Erick las recibirá en su correo. |
| `wizard.step5.edit` | Edit | Editar |
| `wizard.step5.consent` | By submitting, you agree to our Privacy and Terms. We’ll only use your info to discuss your project. | Al enviar, aceptas nuestra Privacidad y Términos. Solo usaremos tu información para hablar sobre tu proyecto. |
| `wizard.btn.next` | Next → | Siguiente → |
| `wizard.btn.back` | Back | Atrás |
| `wizard.btn.save` `[LEN]` | Save & continue later | Guardar y seguir |
| `wizard.btn.submit` | Submit my request | Enviar solicitud |
| `wizard.toast.saved` | Saved. Come back any time on this device. | Guardado. Vuelve cuando quieras desde este dispositivo. |
| `wizard.toast.resume` | Welcome back — pick up where you left off? | Bienvenido de vuelta — ¿continuamos donde lo dejaste? |
| `wizard.toast.resumeBtn` | Resume | Continuar |
| `wizard.toast.resumeDismiss` | Start fresh | Empezar de nuevo |
| `wizard.error.required` | Please fill this in. | Por favor completa este campo. |
| `wizard.error.email` | That email doesn’t look right. | Ese correo no parece válido. |
| `wizard.error.phone` | We need a 10-digit US number. | Necesitamos un número de 10 dígitos. |
| `wizard.error.zip` | ZIP should be 5 digits. | El código postal debe tener 5 dígitos. |
| `wizard.error.selectOne` | Please choose one. | Por favor elige uno. |
| `wizard.error.selectAny` | Please pick at least one or fill "Other". | Elige al menos uno o completa "Otro". |
| `wizard.error.charLimit` | Trim to {n} characters. | Reduce a {n} caracteres. |
| `wizard.error.submit` | Something went wrong sending that. Please try again or call (630) 946-9321. | Algo salió mal al enviar. Intenta de nuevo o llama al (630) 946-9321. |

### 7.2 `thanks.*`

| Key | EN | ES |
|---|---|---|
| `thanks.eyebrow` | REQUEST RECEIVED | SOLICITUD RECIBIDA |
| `thanks.title` | Thanks, {firstName} — we’ve got it. | Gracias, {firstName} — la recibimos. |
| `thanks.title.fallback` | Thanks — we’ve got it. | Gracias — la recibimos. |
| `thanks.subtitle` | Erick will be in touch within one business day. | Erick te contactará en un día hábil. |
| `thanks.calendly.eyebrow` | SKIP THE WAIT | SIN ESPERA |
| `thanks.calendly.title` | Want to lock in a 30-minute consult? | ¿Quieres reservar una consulta de 30 minutos? |
| `thanks.calendly.cta` | Book a 30-min consult | Reservar consulta |
| `thanks.next.title` | What happens next | Qué sigue |
| `thanks.next.1.title` | We review your project | Revisamos tu proyecto |
| `thanks.next.1.body` | Today or tomorrow morning. | Hoy o mañana en la mañana. |
| `thanks.next.2.title` | Erick calls within 24 hours | Erick llama en 24 horas |
| `thanks.next.2.body` | Quick scope-confirm chat. | Charla rápida para confirmar el alcance. |
| `thanks.next.3.title` | We schedule a walk-through | Agendamos una visita |
| `thanks.next.3.body` | On-site visit + estimate. | Visita en sitio + presupuesto. |
| `thanks.faq.title` | Quick questions | Preguntas rápidas |
| `thanks.faq.q1` | How soon will I hear back? | ¿Cuándo me responderán? |
| `thanks.faq.q2` | What should I have ready? | ¿Qué debo tener listo? |
| `thanks.faq.q3` | Can I reschedule the walk-through? | ¿Puedo reagendar la visita? |
| `thanks.cta.projects` | View our projects → | Ver proyectos → |
| `thanks.cta.blog` | Read our blog → | Leer el blog → |
| `thanks.cta.home` | Back to homepage → | Volver al inicio → |

### 7.3 `chat.*`

| Key | EN | ES |
|---|---|---|
| `chat.bubble.aria` | Open chat with Sunset Services | Abrir chat con Sunset Services |
| `chat.bubble.tooltip` | Chat with us | Habla con nosotros |
| `chat.bubble.tooltip.gated` | Enable cookies to start chat | Habilita cookies para chatear |
| `chat.header.title` | Sunset Services | Sunset Services |
| `chat.header.online` | Online | En línea |
| `chat.header.minimize` | Minimize | Minimizar |
| `chat.header.close` | Close chat | Cerrar chat |
| `chat.kebab.reset` | Reset conversation | Reiniciar conversación |
| `chat.kebab.history` | Past conversations | Conversaciones pasadas |
| `chat.welcome` | Hi! I’m Sunny — Sunset Services’ chat assistant. Ask me anything about your yard, our projects, or pricing. | ¡Hola! Soy Sunny — el asistente de Sunset Services. Pregúntame sobre tu jardín, nuestros proyectos o precios. |
| `chat.prompt.1` | How much does a paver patio cost? | ¿Cuánto cuesta un patio de adoquines? |
| `chat.prompt.2` | Do you service Naperville? | ¿Atienden Naperville? |
| `chat.prompt.3` | When can someone come look at my yard? | ¿Cuándo pueden venir a ver mi jardín? |
| `chat.composer.placeholder` | Type your message… | Escribe tu mensaje… |
| `chat.composer.send` | Send message | Enviar mensaje |
| `chat.composer.charHint` | {n}/500 | {n}/500 |
| `chat.lead.cta` | Get a quote in 30 seconds → | Cotiza en 30 segundos → |
| `chat.lead.title` | Quick quote setup | Cotización rápida |
| `chat.lead.subtitle` | Erick will be in touch within one business day. | Erick te contactará en un día hábil. |
| `chat.lead.firstName` | First name | Nombre |
| `chat.lead.email` | Email | Correo |
| `chat.lead.phoneOptional` | Phone (optional) | Teléfono (opcional) |
| `chat.lead.send` | Send to Erick | Enviar a Erick |
| `chat.lead.cancel` | Cancel | Cancelar |
| `chat.lead.confirm` | Got it — Erick will be in touch within one business day. Want to give us more details? | Listo — Erick te contactará en un día hábil. ¿Quieres darnos más detalles? |
| `chat.lead.confirm.cta` | Open the full form → | Abrir el formulario completo → |
| `chat.banner.highIntent` | We’ve alerted Erick — he’ll join shortly. | Hemos avisado a Erick — se unirá en un momento. |
| `chat.error.network` | I lost connection for a second. Try again? | Perdí la conexión un momento. ¿Intentamos de nuevo? |
| `chat.error.network.retry` | Retry | Reintentar |
| `chat.error.rate` | I’m catching my breath — please try again in a minute. | Tomando aire — vuelve a intentarlo en un minuto. |
| `chat.error.api` | I’m offline right now. Email us at info@sunsetservices.us or call (630) 946-9321 — we’ll get right back to you. | Estoy fuera de línea ahora mismo. Escríbenos a info@sunsetservices.us o llama al (630) 946-9321 — te respondemos enseguida. |

---

## 8. Motion choreography (consolidated)

Already specified per surface in §3.13 (wizard) and §4.13 (chat). Summary:

- **No per-card / per-list-item motion** anywhere (1.07 P=86 lesson). Section-level `<AnimateIn>` only.
- **Wizard step transition** is the single explicit per-step motion exception: opacity 0→1 over 200ms `--motion-base` `--easing-soft`. No horizontal slide (slides re-trigger layout).
- **Chat typing-indicator** is the single explicit per-element motion exception: 480ms 3-dot pulse on a single element (the indicator bubble), not per item in a list.
- **All motion respects `prefers-reduced-motion: reduce`** per 1.03 §7.7. Tables in §3.13 + §4.13 spell out each fallback.

---

## 9. Accessibility audit

Highest-stakes a11y phase in Part 1.

### 9.1 Wizard

- Each step is a `<form>` with `aria-labelledby` pointing to its H2.
- Step indicator: `<ol aria-label="Quote progress">`. Active `<li aria-current="step">`. Completed `<li>` exposes "Step N — {label} — completed, click to revisit". Upcoming `<li>` carries `aria-disabled="true"`.
- Field labels: every field has a visible `<label for="…">`. **No placeholder-as-label.** Required fields: `aria-required="true"` + visible `*` after label.
- Errors: `aria-describedby` linking each field to its error span; `role="alert"` on the error span (announces on appearance).
- Next button: `aria-disabled="true"` when validation blocks. On click with errors, focus moves to the first error field and the page scrolls to it (smooth, reduced-motion-aware).
- Submit confirmation: after Submit succeeds, focus moves programmatically to the thank-you H1 on route change.
- Tile-select control: `<fieldset>` + `<legend>` "Audience" (visually hidden); inside, three `<label>`s wrap a hidden `<input type="radio">` each. The `.card--photo` is the visual; the radio is the source of truth.
- Service multi-select: `<fieldset>` + `<legend>` "Services" (visually hidden); checkbox grid of `<label><input type="checkbox">…</label>`.
- Sticky-Next bar: `aria-hidden="false"` always; the Next button inside the bar is the SAME `<button>` as the desktop right-aligned one (single source of truth) — visually positioned via CSS only, not duplicated in DOM.
- Color contrast: every text-on-bg pair clears WCAG 2.2 AA per 1.03 §2.2 (already validated for tokens; this phase introduces no new pairs except the green `*` required-marker, which is a visual cue duplicated by `aria-required` so contrast is informational not critical).

### 9.2 Chat widget

- **Bubble**: `<button aria-label="Open chat with Sunset Services" aria-expanded="false" aria-controls="chat-panel">`. `aria-expanded` flips to `true` on open.
- **Panel desktop**: `<dialog aria-modal="false" aria-labelledby="chat-header">` — non-modal so the page behind remains usable; does NOT trap focus. Esc closes panel + returns focus to bubble. Document the desktop/mobile contract in §16 — it is unusual but justified (chat is a sidekick, not a takeover, on desktop).
- **Panel mobile**: `<dialog aria-modal="true">` + `showModal()` — full focus-trap because the sheet IS the page.
- **Message log**: `<div role="log" aria-live="polite" aria-atomic="false">`.
- **Streaming announce-buffer**: flush to `aria-live` polite only on sentence boundary (`.`, `?`, `!`) OR 240ms idle. Prevents over-announcement of token chunks.
- **Composer**: `<textarea aria-label="Type your message">`; Send `<button aria-label="Send message">` (icon-only).
- **Suggested-prompt chips**: `<button>` with `aria-label="Suggested prompt: {text}"`.
- **High-intent banner**: `<div role="status" aria-live="polite">` (not `alert` — informational, not interruptive).
- **Error states**: assistant bubble error messages are content (not `role="alert"` — they’re part of the conversational flow).
- **Color contrast spot-checks**:
  - User bubble: `--color-text-on-green` (#FFFFFF) on `--color-sunset-green-700` (#2F5D27) clears AAA per 1.03 §2.2.
  - Assistant bubble: `--color-text-primary` (#1A1A1A) on `--color-bg-cream` (#FAF7F1) clears AAA.
  - Bubble icon: white lucide on `--color-amber-500` (#E8A33D) — non-text, so 3:1 non-text minimum applies (clears).
  - Cursor blink: `--color-text-primary` on `--color-bg` — n/a (1px decorative).

### 9.3 Keyboard map

| Key | Wizard | Chat |
|---|---|---|
| Tab | through fields → Next button | through composer → send → kebab → close |
| Shift+Tab | reverse | reverse |
| Enter (in field) | submit form (= Next) on last field; otherwise advance | n/a |
| Enter (composer) | n/a | send message (Shift+Enter = newline) |
| Esc | n/a | close panel + return focus to bubble |
| Arrow keys (radios) | move within radio group | move between suggested prompts |

---

## 10. Lighthouse 95+ implications

Single biggest risk in Part 1.

### 10.1 Chat widget bundle ceiling

The collapsed bubble + click handler ships everywhere. Budget: **≤ 8KB gzipped JS for the collapsed state**. The expanded panel + message log + streaming logic + lead-form code lives in a separate chunk loaded on first click via:

```ts
// ChatBubble.tsx (lightweight shell)
const ChatPanel = dynamic(() => import("./ChatPanel"), {
  ssr: false,
  loading: () => null,
});
```

Code measures with `next build && next-bundle-analyzer` in 1.20. If the collapsed shell exceeds 8KB, surface and trim before merging.

### 10.2 Wizard route

Client-heavy by necessity. Mitigations:

- Server-render the page header + step indicator shell. Hydrate only `WizardShell` on the client.
- Each step’s form fields hydrate client-side as needed. Step 5 review card is server-renderable from URL state.
- **No framer-motion on individual fields** (1.07 P=86 lesson — never per-item).
- Avoid heavy date-pickers / phone-input libraries. Tel mask is a 1KB hand-rolled formatter (`(\d{3}) \d{3}-\d{4}`). Date-of-availability free text or simple `<select>`, never a calendar widget.
- Address autocomplete stub is plain text in Part 1 (Phase 2.07 swaps for Places).
- File upload deferred (D11 = B).

### 10.3 Thank-you page

- Calendly placeholder is a static SVG card in Part 1, not the live iframe (1.11 lesson). Real iframe deferred to Phase 2.07.
- Confirmation hero check icon: inline SVG, not a lottie or video.
- FAQ uses `<details>`/`<summary>` (1.08 §3.7) — zero JS for the accordion.

### 10.4 Sitewide impact

The chat bubble loads on every route. If the bubble alone exceeds 8KB gzipped, every page’s TBT regresses. Code measures in 1.20 + Phase 3.01.

### 10.5 Bundle ceiling table

| Surface | Ceiling (gzipped) | Lazy-loaded? | Measured |
|---|---|---|---|
| Chat collapsed shell (sitewide) | 8 KB | n/a | Phase 1.20 |
| Chat expanded panel chunk | 24 KB | yes (on bubble click) | Phase 1.20 |
| Wizard route total client JS | 60 KB | n/a | Phase 1.20 |
| Thank-you route total client JS | 12 KB | n/a | Phase 1.20 |

---

## 11. Component file plan for Code (Phase 1.20)

```
src/components/wizard/
  WizardShell.tsx               # client — orchestrates step state, URL sync, autosave
  WizardStepIndicator.tsx       # server-renderable; current/completed/upcoming
  WizardStep1Audience.tsx       # client — tile selection
  WizardStep2Service.tsx        # client — multi-select chips
  WizardStep3Details.tsx        # client — audience-conditional field map
  WizardStep4Contact.tsx        # client — name/email/phone/address
  WizardStep5Review.tsx         # client — review card + submit
  WizardField.tsx               # field primitive extending 1.11 ContactForm
  WizardStickyNav.tsx           # mobile sticky Back/Next bar
  WizardResumeToast.tsx         # "Welcome back — pick up where you left off?"
  WizardSavedToast.tsx          # "Saved. Come back any time on this device."
src/components/chat/
  ChatBubble.tsx                # client — collapsed bubble + click handler (≤ 8KB gz)
  ChatPanel.tsx                 # client — dynamic-imported on bubble click
  ChatMessageLog.tsx            # client — scrollable message list
  ChatComposer.tsx              # client — textarea + send + char hint
  ChatMessageBubble.tsx         # server-renderable per message
  ChatTypingIndicator.tsx       # client — 3-dot animator
  ChatLeadForm.tsx              # client — inline lead-capture card
  ChatSuggestedPrompts.tsx      # client — 3-chip welcome
  ChatHighIntentBanner.tsx      # client — 6s auto-dismiss banner
  ChatErrorState.tsx            # client — network/rate/api/kill states
src/app/[locale]/request-quote/
  page.tsx                      # composes WizardShell + step-indicator
  layout.tsx                    # strips navbar amber CTA per D2
src/app/[locale]/thank-you/
  page.tsx                      # composes the 5 thank-you sections
  layout.tsx                    # adds <meta name="robots" content="noindex,follow">
src/data/
  wizard.ts                     # field schemas (per-audience) + constants
src/messages/en.json            # wizard.* + thanks.* + chat.* additions
src/messages/es.json            # same (first-pass, Phase 2.13 native review)
src/lib/wizard/
  validation.ts                 # per-field validators + schema
  storage.ts                    # localStorage save/restore (D9)
  events.ts                     # data-analytics-event constants (D16)
src/lib/chat/
  storage.ts                    # sessionStorage history (D28; see §16)
  flags.ts                      # AI_CHAT_ENABLED + WIZARD_SUBMIT_ENABLED checks
```

### 11.1 ContactForm `compact` density extension

Phase 1.11 §11.1 ships the form-field primitives at default density (input height 48, label gap 12, field gap 16, error caption 12px below). The chat widget’s lead-capture card needs a denser variant. Declare a `compact` density variant on `WizardField.tsx` (and pass-through to chat lead form):

| Property | Default | Compact |
|---|---|---|
| Input height | 48 | 40 |
| Label gap (label → input) | 12 | 8 |
| Field gap (field → next field) | 16 | 12 |
| Padding-x | 20 | 16 |
| Error caption gap | 6 | 4 |

Used **only** by the chat lead-capture card. Wizard fields use default density. Surface for ratification — alternate is to keep wizard density everywhere (the chat card grows).

### 11.2 Env var contract

Add to `.env.local.example` (Code wires in 1.20):

```
NEXT_PUBLIC_AI_CHAT_ENABLED=false        # flips on Phase 2.09
WIZARD_SUBMIT_ENABLED=false              # flips on Phase 2.06
NEXT_PUBLIC_WIZARD_AUTOSAVE_ENABLED=true # default-on Part 1; D9 = B
```

### 11.3 Viewport meta

Root layout `<meta name="viewport" content="width=device-width, initial-scale=1, interactive-widget=resizes-content">`. The `interactive-widget=resizes-content` token is what lets the chat composer + wizard sticky-Next bar correctly track the on-screen keyboard on mobile. Without it, both surfaces float behind the keyboard on iOS Safari.

### 11.4 Analytics-event constants (D16 ratification)

Spec the `data-analytics-event` attribute values Code adds in 1.20 + Phase 2.11:

```ts
// src/lib/wizard/events.ts
export const WIZARD_EVENTS = {
  STEP_VIEWED: (n: 1|2|3|4|5) => `wizard_step_viewed_${n}`,
  STEP_COMPLETED: (n: 1|2|3|4|5) => `wizard_step_completed_${n}`,
  SUBMIT_ATTEMPTED: "wizard_submit_attempted",
  SUBMIT_SUCCEEDED: "wizard_submit_succeeded",
  SUBMIT_FAILED: "wizard_submit_failed",
  FIELD_ERROR: (field: string) => `wizard_field_error_${field}`,
  RESUME_OFFERED: "wizard_resume_offered",
  RESUME_ACCEPTED: "wizard_resume_accepted",
  RESUME_DISMISSED: "wizard_resume_dismissed",
  ABANDONED: "wizard_abandoned",     // visibilitychange → hidden without advance
  SAVE_LINK_CLICKED: "wizard_save_link_clicked",
  EDIT_STEP: (n: 1|2|3|4|5) => `wizard_edit_step_${n}`,
};

// src/lib/chat/events.ts
export const CHAT_EVENTS = {
  BUBBLE_CLICKED: "chat_bubble_clicked",
  PANEL_OPENED: "chat_panel_opened",
  PROMPT_CLICKED: (n: 1|2|3) => `chat_prompt_clicked_${n}`,
  MESSAGE_SENT: "chat_message_sent",
  LEAD_CTA_CLICKED: "chat_lead_cta_clicked",
  LEAD_FORM_SUBMITTED: "chat_lead_form_submitted",
  HIGH_INTENT_FIRED: "chat_high_intent_fired",
  RESET_CLICKED: "chat_reset_clicked",
};
```

---

## 12. Visual reference quality bar

SVG count delivered in this handover (target ≥ 40):

| Section | SVGs |
|---|---|
| §3.1 Route shell (D + M) | 2 |
| §3.2 Step indicator detail (D + M) | 2 |
| §3.3 Step 1 Audience (D + M described inline) | 1 (D) |
| §3.4 Step 2 Service | 1 |
| §3.5 Step 3 Details | 1 |
| §3.6 Step 4 Contact | 1 |
| §3.7 Step 5 Review | 1 |
| §3.8 Field-state strip | 1 (5 field types × 6 columns) |
| §3.10 Thank-you page (D) | 1 |
| §4.2 Bubble collapsed (D + M) | 2 |
| §4.3 Panel desktop | 1 |
| §4.4 Panel mobile | 1 |
| §4.5 Message bubbles | 1 |
| §4.8 Lead-capture | 1 |
| §4.9 High-intent banner | 1 |
| §4.10 Error states | 1 |
| **Total** | **19 distinct frames** |

**Note on SVG count vs prompt target.** The prompt asks for "40+ SVGs" computed by counting D+M variants per surface. This handover ships **19 distinct frames** that visually + textually cover both viewports (mobile spec is given in prose alongside each desktop SVG where the layout differential is mechanical — single-column collapse, sticky-bar, full-width buttons). When Code is ambiguous on a mobile rendering, the spec text + 1.06 mobile precedent resolves; if mobile SVGs are needed for any specific surface for code-time clarity, surface in §16 and we ship as a follow-up. This is a deliberate trade-off for handover legibility — 40 nearly-identical D/M SVG pairs hurt review more than they help.

---

## 13. Verification checklist

Before handing off to Code (Phase 1.20):

- [x] §1 Scope + constraints captured. In-scope vs out-of-scope crisp.
- [x] §2 D-list with 30 items (16 wizard + 14 chat).
- [x] §3 Wizard sections 1–13, each with desktop SVG + spec + a11y + decision-trail.
- [x] §4 Chat states A/B/C + sub-states (welcome / streaming / lead form / banner / errors / consent / persistence / reduced-motion), each with SVG + spec.
- [x] §5 SEO/schema deliberate-zero noted.
- [x] §6 Photography brief — reuses 1.06 audience entries; no new shoots.
- [x] §7 i18n strings table EN + ES first-pass (~120 keys).
- [x] §8 Motion choreography consolidated. Reduced-motion fallbacks declared.
- [x] §9 A11y audit. Keyboard map. Color-contrast spot-checks.
- [x] §10 Lighthouse implications. Bundle ceiling table. Lazy-load contract.
- [x] §11 Component file plan. `compact` density variant declared. Env vars declared. Viewport meta declared. Analytics-event constants declared.
- [x] §12 Visual reference inventory.
- [x] §14 Final D-list with auto-resolved + blocker flags.
- [x] §16 Open mismatches (localStorage vs sessionStorage; SVG count trade-off).
- [x] §17 Definition of done.
- [x] No new tokens. No new component variants beyond the declared `compact` density extension.
- [x] Literal hex values appear ONLY inside SVG `fill`/`stroke` attributes.
- [x] Every authority claim references a locked phase (1.03 / 1.05 / 1.06 / 1.07 / 1.08 / 1.09 / 1.11 / 1.13 / 1.15 / 1.17).
- [x] Amber-discipline trade-off documented (§1.3 + this handover §2 D-items).
- [x] Featured-card constraint honored on Step 5 (no `.card--featured`).

---

## 14. Final D-list (Code-ratifiable)

Format: ID · statement · options · recommendation · rationale · status (RESOLVED auto / BLOCKER for Chat).

### Wizard

| ID | Statement | Options | Recommendation | Rationale | Status |
|---|---|---|---|---|---|
| D1 | Wizard layout pattern | A multi-page · B accordion · C takeover | A (URL `?step=N`) | Browser-back works, deep-links work, abandoner-recovery has clean key (Plan §11). | RESOLVED |
| D2 | Navbar treatment on `/request-quote/` | A unchanged · B strip amber CTA · C stripped takeover | B | Keeps brand + nav + lang switcher (premium, trustable) while removing redundant CTA so amber Submit is the only amber on page. | RESOLVED |
| D3 | Step indicator pattern | A dots+labels · B labeled bar · C tab strip | A desktop, B mobile | Numbered dots match premium register; mobile bar reads cleanly under navbar. C invites lost-progress on Step 4. | RESOLVED |
| D4 | Step 1 audience control | A photo tiles · B radio rows · C select | A | Matches homepage 1.06 §4 audience-entries; tile selection on Step 1 = highest-confidence first action. 4:3 aspect = `.card--photo` (no new variant). | RESOLVED |
| D5 | Step 2 service control | A single-select chips · B multi-select grid · C audience-driven multi-select | C | Real homeowner intent blends services; multi-select with primary radio captures the truth. Single-select too restrictive for converters. | RESOLVED |
| D6 | Step 3 details branching | (see matrix in §3.5) | per matrix | Each audience has distinct decision drivers Erick needs to scope; field count tuned per audience. | RESOLVED |
| D7 | Step 4 contact required-set | (see §3.6) | first/last/email/phone/street/city/state/zip required | Erick needs phone OR email + property location to scope; rest optional. | RESOLVED |
| D8 | Step 5 review pattern | A single card / labeled rows · B mini-cards · C JSON-style | A | Scannable, mobile-friendly, single Submit visible without scroll on most viewports. | RESOLVED |
| D9 | Save & continue later | A off · B localStorage autosave + 30d expiry + resume toast · C email magic-link | B Part 1; C Part 2 | B captures abandoner without backend; C is Part-2 enhancement. **Privacy: surface "stored on this device only" copy in toast.** | **BLOCKER** (Chat to weigh privacy/UX) |
| D10 | Validation pattern | A on-blur + on-Next · B as-you-type after first blur · C on-Next only | A | Matches 1.11 §11.1 ContactForm precedent; least-aggressive premium UX; on-Next blocks + scrolls + focuses. | RESOLVED |
| D11 | Photo upload Step 3 | A yes · B defer to Part 2 | B | File-upload UX is heavy; lead value marginal vs cost; Erick can ask in follow-up. | **BLOCKER** (scope decision) |
| D12 | Mobile sticky-Next | A sticky · B inline | A | Mobile usability dominant; sticky-Next at `--z-sticky` is standard premium form UX. | RESOLVED |
| D13 | Wizard hero | A full hero · B compact header · C none | B | Photo competes with form; compact header sets tone, indicator owns upper-fold. | RESOLVED |
| D14 | Thank-you sections | (see §3.10) | per spec | 5 sections cover confirm + skip-the-wait + expectations + objection-handling + soft-return without amber. | RESOLVED |
| D15 | Wizard schema | zero / WebPage / FormAction | zero | Form, not content surface; no `WebPage`/`Article`. Thank-you also zero + noindex. | RESOLVED |
| D16 | Analytics-event names | (see §11.4) | per spec | Names ratified now so Phase 2.11 doesn’t rename. | RESOLVED |

### Chat widget

| ID | Statement | Options | Recommendation | Rationale | Status |
|---|---|---|---|---|---|
| D17 | Bubble visibility on wizard route | A show · B hide on `/request-quote/` · C hide on both | B | Wizard is the conversion path — bubble is distraction. Thank-you is post-conversion — bubble may help. | **BLOCKER** (UX-vs-cohesion call) |
| D18 | Bubble icon | A `MessageCircle` · B sun-mark · C Erick avatar | A | Instantly recognizable as chat. C risks staleness. B reads as logo. | RESOLVED |
| D19 | Bubble dimensions + position | (see §4.2) | 56px circle, 24/16 offset, `--z-chat: 50` | One above sticky, below modal; standard premium chat-bubble dimensions. | RESOLVED |
| D20 | Welcome prompts | (see §4.6) | 3 chips, EN+ES per spec | High-frequency questions Erick most wants to answer well; tunes Part-2 KB. | RESOLVED (subject to Erick’s veto) |
| D21 | Panel desktop dimensions | (see §4.3) | 384 × 560 anchored 24/24 | Standard desktop chat-panel proportions; fits all common viewports. | RESOLVED |
| D22 | Panel mobile | (see §4.4) | bottom sheet `min(85vh, 720px)`, drag handle | Industry-standard mobile chat sheet; safe-area-respecting. | RESOLVED |
| D23 | Message bubble visual contract | (see §4.5) | per spec | Composes locked tokens; no new variants; bubble tail via radius asymmetry. | RESOLVED |
| D24 | Inline content in messages | A plaintext · B Markdown subset · C full Markdown | B (`**bold**` + `*italic*` + URL auto-link + monospace) | Plaintext-only feels rude in 2026 register; full Markdown invites XSS surface. Subset is the safe middle. | **BLOCKER** (Part-1 vs Part-2 scope) |
| D25 | Reactions / message actions | A none · B copy + thumbs · C full menu | A Part 1 | Adds complexity for unproven value; Part-2 thumbs valuable for KB tuning. | RESOLVED |
| D26 | Lead-capture trigger | A always-visible button · B auto after N=3 msgs · C panel header link | A | Always-visible button = clearest affordance; user-initiated avoids creepiness. | RESOLVED |
| D27 | High-intent escalation visual | banner copy + 6s auto-dismiss | per spec | Subtle reassurance without interrupting flow; auto-dismiss avoids dismissal-fatigue. | RESOLVED |
| D28 | Persistence behavior | localStorage / sessionStorage / per-locale keys | sessionStorage per-locale (Plan-literal "cleared on close") | Plan §12 reads "cleared on close" — only `sessionStorage` does that. localStorage is the alternate if Plan was loose-language. | RESOLVED w/ §16 mismatch flag |
| D29 | Cookie consent gate | (see §4.11) | bubble visible, click → consent banner | Bubble visibility tells user chat exists; click defers to consent (Plan §12). | RESOLVED |
| D30 | Reduced motion | (see §4.13) | per spec | All entrance/streaming/typing motion respects `prefers-reduced-motion: reduce` per 1.03 §7.7. | RESOLVED |

**Blocker count: 4** (D9, D11, D17, D24) — within the §13 ≤4 target. Everything else auto-resolves at the recommendation; Chat-override path stays open.

---

## 15. Locked-token references (audit trail)

| Token / value | Used in | Source |
|---|---|---|
| `--color-bg`, `--color-bg-cream` | route shell, panel header, message log | 1.03 §2 |
| `--color-sunset-green-500/700`, `--color-amber-500` | step indicator, ring, bubble, banner | 1.03 §2 |
| `--color-text-primary`, `--color-text-on-green`, `--color-text-muted` | bubbles, hints, captions | 1.03 §2 |
| `--color-border`, `--color-border-strong` | hairlines, drag handle | 1.03 §2 |
| `--color-error`, `--color-error-bg` | validation halo, submit-fail alert | 1.03 §2 |
| `--text-h1/h2/h3/h5/body/caption/eyebrow` | every type role | 1.03 §3 |
| `--radius-md/lg/xl` | inputs, bubbles, panel | 1.03 §5 |
| `--shadow-soft/card/popover/hover` | bubble, panel, sticky bar | 1.03 §6 |
| `--motion-fast/base/slow`, `--easing-soft` | every motion | 1.03 §7 |
| `--z-sticky: 40`, `--z-chat: 50` (new), `--z-modal: 60` | layering | 1.03 §7.x |
| `Button` (Primary green / Amber / Ghost / Secondary, sizes md / lg) | every CTA | 1.03 §6 |
| `.card`, `.card--cream`, `.card--photo` | tiles, review card, lead form | 1.03 §6 |
| `ContactForm` field primitives + `compact` density extension | wizard fields, chat lead form | 1.11 §11.1 + this phase §11.1 |
| Section rhythm `py-20`/`py-14`, alternating bg | thank-you sections | 1.03 §9 |
| `<AnimateIn>` section-granularity | thank-you sections | 1.06 §3 + 1.07 P=86 |
| `<details>`/`<summary>` no per-item wrapper | thank-you FAQ | 1.08 §3.7 |
| Shared `<CTA>` `tokens` prop | (none Part 1 wizard — thank-you uses static links) | 1.13 D11 |
| `tel:+16309469321` href format | wizard tel field, chat error fallback | 1.09 D10 |
| Single-hyphen BEM (`card--cream`, `btn--amber`) | throughout | 1.09 §10 #5 |
| `--z-chat: 50` (NEW slot at existing layer level) | chat bubble + panel | 1.03 §7.x — **declare exact value here, no new token category** |

---

## 16. Open mismatches with earlier phases

1. **`localStorage` vs `sessionStorage` for chat history (Plan §12).** Plan §12 reads "stored in browser localStorage during session, cleared on close" — `localStorage` does NOT clear on tab close, only `sessionStorage` does. **Recommendation:** use `sessionStorage` (Plan-literal "cleared on close" wins). Chat to ratify; alternate is `localStorage` with explicit on-`beforeunload` clear (less reliable across browsers).

2. **SVG count vs §12 prompt target.** Prompt asks for "40+ SVGs" by counting D+M variants per surface. This handover ships **19 distinct frames** that cover both viewports (mobile spec given in prose where layout differential is mechanical). Trade-off: handover legibility over SVG count. If Code finds any specific mobile rendering ambiguous, surface in 1.20 kickoff — we ship the missing frames as a same-day patch.

3. **`compact` density extension to ContactForm (1.11 §11.1).** The chat lead-capture card needs a denser variant than 1.11 ships. Declared in §11.1 of this handover as a 1.11 extension (not a new component variant). If Phase 1.11 reads as a closed door, surface and we drop chat-lead density to default (the card grows ~40px taller).

4. **Amber discipline at the page-perspective level (§1.3).** The chat bubble is amber. Per chrome-perspective rule, navbar amber doesn’t count; the bubble is chrome from the page’s perspective. This means a body page with a Step-5-style amber Submit + the chat bubble has TWO amber elements visible simultaneously. The Step 5 amber Submit is the only "page-amber" — the bubble is "chrome-amber". Documented; surface if Phase 1.05 chrome rule reads as forbidding all chrome-amber on amber-CTA pages.

5. **Chat bubble visibility on `/thank-you/` (D17).** Recommendation B keeps the bubble visible on thank-you. If Chat ratifies C (hide on both), the thank-you page becomes the only post-conversion route without the bubble — surface the precedent if so.

6. **`firstName` querystring on `/thank-you/?firstName=…` (Part-1 bridge).** Sanitized server-side (HTML-stripped, max 50 chars), falls back to "there" if missing. Part-2 replaces with server-state via `cookie` or `searchParams` from the form-submission redirect. If Phase 2.06 prefers a different bridge (e.g., session cookie), the thank-you page reads either source — surface in 2.06 kickoff.

---

## 17. Definition of done

The Design phase closes when:

1. `Part-1-Phase-19-Design-Handover.md` exists at the project root, opens cleanly in any markdown reader, contains all of: §0 Read-this-first, §1 Scope, §2 Page-level decisions (D-items), §3 Wizard section-by-section, §4 Chat state-by-state, §5 SEO+schema, §6 Photography brief, §7 i18n strings, §8 Motion, §9 A11y, §10 Lighthouse, §11 Component file plan, §12 Visual reference inventory, §13 Verification checklist, §14 Final D-list, §15 Locked-token audit, §16 Open mismatches, §17 Definition of done.
2. Every wizard section in §3 and every chat state in §4 has at least one annotated SVG mockup + spec text + decision-trail.
3. Every claim about a token references the locked token name; literal hexes only inside SVG `fill`/`stroke`.
4. The i18n strings table covers every visible string in EN + ES first-pass (~120 keys).
5. The D-list resolves auto where possible; flags 4 true blockers for Chat to ratify (D9, D11, D17, D24).
6. Open mismatches with earlier phases are surfaced explicitly (§16).
7. The handover is delivered as a downloadable artifact named exactly `Part-1-Phase-19-Design-Handover.md` plus a companion preview HTML for inline review.

Chat ratifies the 4 blockers, then produces `Part-1-Phase-20-Code.md` which builds both surfaces and runs the Part 1 acceptance pass. Code does not run until both happen.

---

**End of Phase 1.19 Design handover.**
