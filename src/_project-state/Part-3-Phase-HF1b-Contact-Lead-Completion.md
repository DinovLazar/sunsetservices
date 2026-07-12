# Part 3 · Phase HF1b · Code — Completion Report

**Contact + chat lead Sanity writes must fail loud, never silent — the HF1 pattern applied to the two remaining lead surfaces**

- **Branch:** `fix/hf1-contact-lead-sanity-write` (stacked on `fix/hf1-quote-lead-sanity-write` @ `848d352`, itself off `main` @ `c9e314a`)
- **PR:** opened with **base `fix/hf1-quote-lead-sanity-write`** (PR #26) — **NOT merged.** This is a stacked follow-up: it depends on HF1's shared helpers (`sanityErrorDetail()`/`describeSanityError()` in `safeError.ts`, the `writeFail*` banner precedent in `QuoteLeadAlertEmail.tsx`). Merge #26 first, then this.
- **Date:** 2026-07-12
- **Status:** Code shipped + verified locally. **The underlying repair is unchanged and still operator-gated** — this hotfix does NOT fix the missing/read-only `SANITY_API_WRITE_TOKEN`; it makes the *contact* and *chat* write failures as loud and lossless as HF1 made the *quote* failure. The one env fix in the HF1 runbook restores the actual write for all four surfaces at once.

---

## Headline

HF1 (PR #26) hardened `/api/quote` and flagged that `/api/contact` + `ContactAlertEmail` carried the **identical** silent-swallow + `/desk/` + `'(no Sanity ID — write failed)'` fallback-string bug, and that `/api/chat/lead` had a **different, arguably worse** shape (it `500`s and drops the lead with no email fallback). This phase closes both, mirroring HF1 exactly.

If the write token is missing/read-only in Vercel Production (the HF1 root cause), contact form submissions and chat-panel leads were being dropped just as silently as quote leads. After this change every lead surface fails **loud** (real error logged, human paged, self-declaring email) and **lossless** (customer sees success as long as the lead landed in any sink).

---

## What shipped (3 files, +217 / −22)

### 1. The contact alert email self-declares the failure · [`src/lib/email/templates/ContactAlertEmail.tsx`](src/lib/email/templates/ContactAlertEmail.tsx)
- `sanityDocId` prop is now `string | null` (mirrors `ChatLeadEmail` / `QuoteLeadAlertEmail`).
- **Write succeeded** → a single valid deep link, corrected `/desk/` → **`/structure/contactSubmission;<id>`** (the hosted Studio runs the Structure tool).
- **Write failed** → a prominent **red "⚠️ This lead was NOT saved to the CMS" banner** at the top, **no Studio link at all** (the footer shows a re-enter note instead of a half-broken link), and **every submitted field still renders** so the lead is re-enterable from the email alone. `writeFail{Banner,Title,Body}Style` copied verbatim from `QuoteLeadAlertEmail`.

### 2. The contact route captures, pages, and never loses the lead · [`src/app/api/contact/route.ts`](src/app/api/contact/route.ts)
- Captures the caught Sanity error and logs the **real cause** (`statusCode` + description) via `sanityErrorDetail()` — the same permanent, PII-safe, server-only diagnostic HF1 added.
- On write failure, **pages a human** via `notifyOperator()` (Telegram, Phase 2.15) with the visitor's **name, phone, email, category, and the failure reason** (plain text, no MarkdownV2 escaping needed). New local `buildWriteFailureAlert(input, error)`.
- Passes the **nullable** `sanityDocId` straight through to `ContactAlertEmail` — the `'(no Sanity ID — write failed)'` fallback string is **deleted**.
- Subject prefixed **`⚠️ LEAD NOT SAVED — …`** on failure so it screams in the inbox list.
- Success contract widened to match HF1: `200` as long as any sink (Sanity doc / alert email / delivered Telegram page) captured the lead; a `500` + explicit all-sinks-failed log is reserved for the true total-loss case.

### 3. The chat-lead route falls back instead of 500-and-drop · [`src/app/api/chat/lead/route.ts`](src/app/api/chat/lead/route.ts)
- **This was the "decide whether it should also fall back" item — decision: yes, harden it.** Previously a write failure logged an opaque code, returned **`500`, and never sent the email** — the lead was lost *and* the visitor saw an error. Now it mirrors quote/contact: log the real error (`sanityErrorDetail()`), page the operator (`notifyOperator()`, name/email/session/reason), **still send** the branded `ChatLeadEmail` (which already drops its Studio link on a null docId — HF1 confirmed it was the one already-correct template), prefix the subject on failure, and succeed as long as any sink captured the lead.

---

## Own decisions surfaced (no silent ratifications)

1. **Stacked on PR #26, not `main`.** The contact fix consumes HF1's `sanityErrorDetail()`/`describeSanityError()` and copies its banner. Basing off `main` would not compile and would collide with #26 on `safeError.ts`. The PR base is therefore `fix/hf1-quote-lead-sanity-write`; it must merge after #26. When #26 merges to `main`, this PR's diff naturally reduces to just the three files below.
2. **Hardened `/api/chat/lead` rather than only documenting it.** It is the identical latent bug and strictly worse (it dropped the lead *and* errored the user). The fix is small and low-risk because `ChatLeadEmail` already renders a null docId safely. Applying it here closes the third and last lead-loss surface in one hotfix.
3. **Per-route `buildWriteFailureAlert` helpers, not a shared util.** Each route's alert carries different fields (quote: division/phone/email; contact: category/phone/email; chat: email/session). I kept a small local helper per route to mirror HF1's structure exactly and keep each route's diff self-contained, rather than refactoring HF1's already-committed quote helper into a shared module (which would broaden the blast radius into the quote path). Minor duplication accepted for scope discipline.
4. **`ChatLeadEmail` body left unchanged (no red banner added).** It already drops the Studio link on a null docId; HF1 deemed it "already correct." The loud signals for a failed chat lead are the `⚠️ LEAD NOT SAVED —` subject + the dropped link + the Telegram page. Adding an in-body banner there is an optional future consistency tweak, deliberately out of scope.
5. **Render harness run ad hoc, not committed** — same as HF1 (keeps the committed diff to the fix itself). Reproduced below.

---

## Verification (local)

- **`npm run build`** → exit **0**, full route tree emitted, no errors/warnings. `/api/contact` and `/api/chat/lead` both classified `ƒ` (Dynamic) as expected.
- **`npx tsc --noEmit`** → **0** errors. *(A fresh worktree has no `next-env.d.ts` until the first build, so a pre-build `tsc` reports only the ambient `*.jpg` module declarations in `imageMap.ts` — an environment artifact, not a code error; clean once the build generates it.)*
- **`eslint`** on the 3 changed files → **0** errors/warnings.
- **Behavioral harness (17/17 assertions, `@react-email/render` + `tsx`):**
  - `ContactAlertEmail` **write-succeeded** → contains `…/structure/contactSubmission;<id>`, **no** `/desk/`, **no** banner, **no** `no Sanity ID` artifact, **no** stray `;(`; still renders name / email / phone / category / message.
  - `ContactAlertEmail` **write-failed** → renders the "NOT saved to the CMS" banner, emits **no** `sanity.studio` link at all, no `/structure/` or `/desk/`, no `;(`; **still** renders every submitted field (re-enterable by hand).
  - `ChatLeadEmail` null-docId safety (the `/api/chat/lead` fallback relies on it) → success emits `/structure/chatLead;<id>`; failure emits no `sanity.studio` link and still shows the lead name/email.
- **Not executable from this session** (no dashboards): the live Preview error capture, the Vercel token fix, lost-lead recovery, and the production smoke test — all shared with HF1's runbook (below).

---

## Operator runbook (unchanged from HF1 — one env fix repairs all four surfaces)

**The actual repair is the HF1 env fix.** Set a correctly-scoped Sanity **Editor** `SANITY_API_WRITE_TOKEN` on Vercel **Production + Preview** (see `Part-3-Phase-HF1-Completion.md` §"Operator runbook" A). That single token repairs the write for `/api/quote`, `/api/quote/partial`, `/api/contact`, `/api/chat/lead`, and photo upload — they all share the write client. This code change only guarantees that until that fix lands, no contact or chat lead is lost silently.

**Lost-lead recovery now spans three doc types.** When cross-referencing Resend ↔ Sanity for the breakage window (HF1 runbook C), also check `*[_type == "contactSubmission"]` against the `New contact — …` alert emails and `*[_type == "chatLead"]` against the `New chat lead — …` alerts, not just `quoteLead`. Any alert email (especially one prefixed `⚠️ LEAD NOT SAVED —`) with no matching Sanity doc is a lost lead to re-enter by hand.

**Telegram dependency.** As in HF1, `notifyOperator()` only sends when `TELEGRAM_ENABLED=true` + `TELEGRAM_OPERATOR_CHAT_ID` is set; until then it no-ops with a log line and the email self-declaration + loud subject + server logs are the always-on loudness.

---

## Definition of Done — status

| DoD item | Status |
|---|---|
| `ContactAlertEmail` docId nullable; `/structure/` link on success only; red banner + all fields on failure | **DONE + verified** (harness). |
| Contact route: capture error, `sanityErrorDetail()` log, `notifyOperator()` on failure, nullable docId through, `⚠️ LEAD NOT SAVED —` subject | **DONE.** |
| `/api/chat/lead` fallback decision made + applied | **DONE** — hardened to email + Telegram fallback (decision surfaced above). |
| `build` 0 · `tsc` 0 · `lint` 0 · render harness | **DONE** — build 0, tsc 0, lint 0, **17/17** assertions. |
| Underlying env write-token fix | **Operator (HF1 runbook)** — explicitly NOT fixed here. |
| Shipped via PR, no secrets in diff/commits/report | **DONE** — PR base `fix/hf1-quote-lead-sanity-write`, not merged. |

---

## Files changed

- [`src/app/api/contact/route.ts`](src/app/api/contact/route.ts) — capture + structured-log the real Sanity error; Telegram page on failure; nullable docId through; `⚠️ LEAD NOT SAVED —` subject; widened success contract; new local `buildWriteFailureAlert`.
- [`src/app/api/chat/lead/route.ts`](src/app/api/chat/lead/route.ts) — same hardening; **no longer 500-and-drops** on write failure — falls back to email + Telegram; new local `buildWriteFailureAlert`.
- [`src/lib/email/templates/ContactAlertEmail.tsx`](src/lib/email/templates/ContactAlertEmail.tsx) — `sanityDocId: string | null`; `/structure/contactSubmission;<id>` on success only; red "NOT saved to the CMS" banner + re-enter footer on failure; `writeFail*` styles.
