# Part 3 · Phase HF1 · Code — Completion Report

**Quote-lead Sanity write is failing in production — silent-failure hardening + Studio-link fix**

- **Branch:** `fix/hf1-quote-lead-sanity-write` (off `main` @ `c9e314a`)
- **PR:** opened against `main` — **NOT merged** (operator verifies on Vercel Preview, applies the env fix, then merges)
- **Date:** 2026-07-12
- **Status:** Code shipped + verified locally. **Several Definition-of-Done items are operator-gated** and are listed under "Operator runbook" below — this was a non-interactive coding session with **no Vercel / Sanity Manage / Resend dashboard access and no Sanity MCP auth**, so the live error capture, the env-scope fix, the lost-lead recovery, and the production smoke test could not be executed from here. They are handed off with exact steps.

---

## Headline

The quote wizard was emailing leads but not saving them to Sanity, and the failure was invisible. This phase makes the failure **impossible to miss** and fixes the broken Studio link — **regardless of the underlying cause** — and diagnoses that cause to near-certainty from the code. The one remaining action that actually restores the write is an **environment fix in Vercel** (the write token), which only the operator can apply.

Two defects were in that one broken email line; both are now closed in code:

1. **The write was failing silently** — swallowed in a `try/catch` that logged only an opaque error code, sent the email anyway, and returned `200`. Nothing paged a human.
2. **The Studio link was malformed** — the handler concatenated the literal fallback string `(no Sanity ID — write failed)` into a URL, and the template used the legacy `/desk/` base path. Result: `…/desk/quoteLead;(no Sanity ID — write failed)`.

---

## Root cause — diagnosed (not guessed), pending one-line live confirmation

Working the phase-prompt suspect table **against the code + Sanity API semantics**, four of the five suspects are **ruled out in code**, leaving one:

| # | Suspect | Verdict from code | Evidence |
|---|---------|-------------------|----------|
| 5 | `useCdn:true` on the write client | **RULED OUT** | [`sanity/lib/write-client.ts`](sanity/lib/write-client.ts) is `useCdn:false`, server-only, token from the **non-public** `SANITY_API_WRITE_TOKEN`. No `NEXT_PUBLIC_` exposure — nothing to rotate. |
| 3 | Dataset mismatch (handler writes a dataset the Studio doesn't read) | **RULED OUT** | Write client and read client both resolve `dataset` from `NEXT_PUBLIC_SANITY_DATASET`. **Reads work in production** (the whole site renders), so that var resolves to `production` in the prod scope. The Studio hard-codes `dataset: 'production'` ([`sanity.config.ts`](sanity.config.ts)). Same dataset on both sides. |
| 4 | Schema type not deployed / required field failing validation | **RULED OUT** | The Sanity **mutation API does not run Studio schema validation** (those rules are Studio-only), and the Content Lake stores any `_type` regardless of deployed schema. A missing schema or a "required" rule **cannot** cause an API write to 4xx. (`quoteLead` is also deployed — Phase 2.06 / `00_stack-and-config.md`.) |
| 2 | Token exists but is **Viewer** (read-only) | **REMAINING** | A read-scoped token 401/403s on `create`. Not visible from code. |
| 1 | Token **missing** in the Vercel **Production** scope | **REMAINING (most likely)** | `SANITY_API_WRITE_TOKEN` is server-only and used **only** on the write path, so an asymmetric scope (present in Preview, absent in Production) fails writes while leaving every read green — exactly the observed symptom. The repo's Vercel convention is **Production + Preview** (`.env.local.example` sync note), so a token added to Preview-only is a plausible slip. |

**Conclusion:** the write path has been **byte-stable since it shipped (2026-05-12, Phase 2.06)** — `git log` on [`route.ts`](src/app/api/quote/route.ts) and [`write-client.ts`](sanity/lib/write-client.ts) shows no functional change to the write. **This is not a code regression; it is an environment condition:** `SANITY_API_WRITE_TOKEN` is **missing or read-only in the Vercel Production scope** (suspect #1/#2). Everything observed is consistent with it and inconsistent with the other three.

**Live confirmation (one line, operator, on Preview):** this phase adds a permanent structured error log that prints the real Sanity error. Deploy the branch to Preview with the token deliberately absent/read-only, submit a lead, and read:

```
[/api/quote] Sanity write FAILED { route: '/api/quote', statusCode: 401|403, detail: "Insufficient permissions; permission 'create' required" }
```

A `401`/`403` with a `permission 'create'` detail confirms token missing/read-only → the fix is a correctly-scoped **Editor** token (below). (Previously this line printed only `errorCode: 'http-401'` with no message — the reason was there but unreadable.)

---

## What shipped (4 files, +231 / −19)

### 1. Never lose the lead — and make the failure LOUD · [`src/app/api/quote/route.ts`](src/app/api/quote/route.ts)
- Captures the caught error and logs the **real cause** — `statusCode` + Sanity `message`/`description` — via the new `sanityErrorDetail()` (permanent, server-only). This doubles as the diagnostic, so **no throwaway debug logging was introduced and there is nothing to remove** (satisfies Task 7 by construction).
- On write failure, **pages a human immediately** via the existing Telegram operator bot (`notifyOperator()`, Phase 2.15) with the customer's **name, phone, email, division, and the failure reason**. Plain-text message (no MarkdownV2) so no field needs escaping.
- Passes the **nullable** `sanityDocId` straight through to the email sender — the `(no Sanity ID — write failed)` fallback string is **deleted**.
- Success contract widened: returns `200` as long as the lead landed **somewhere a human sees it** (Sanity doc **or** lead-alert email **or** a delivered Telegram page). A `500` is now reserved for the true all-sinks-down case (and logs that the lead may be lost). The customer never sees an error because the CMS hiccuped.

### 2. The email self-declares the failure · [`src/lib/email/templates/QuoteLeadAlertEmail.tsx`](src/lib/email/templates/QuoteLeadAlertEmail.tsx)
- `sanityDocId` prop is now `string | null` (mirrors the already-correct `ChatLeadEmail`).
- **Write succeeded** → a single valid deep link: `https://sunsetservices.sanity.studio/structure/quoteLead;<id>`. Corrected `/desk/` → **`/structure/`** (this Studio runs the Structure tool; `ChatLeadEmail` already used `/structure/`, `QuoteLeadAlertEmail` was the stale one).
- **Write failed** → a prominent **red "⚠️ This lead was NOT saved to the CMS" banner** at the top, **no Studio link at all** (never a half-broken one), and **every submitted field still renders** so the lead is re-enterable from the email alone.

### 3. Loud subject line · [`src/lib/quote/resend.ts`](src/lib/quote/resend.ts)
- `sendQuoteLeadAlertEmail(input, name, sanityDocId: string | null)`. On failure the subject is prefixed **`⚠️ LEAD NOT SAVED — …`** so it screams in the inbox list without opening.

### 4. PII-conscious Sanity error extractor · [`src/lib/logging/safeError.ts`](src/lib/logging/safeError.ts)
- New `describeSanityError()` / `sanityErrorDetail()`. Probes the several shapes a Sanity `ClientError` uses and returns `{statusCode, message, detail}`, taking only the human-readable `description` — **never the echoed mutation payload**, which can carry visitor PII. Server-only (Vercel runtime logs).

---

## Breakage window

- The failing code path has existed since **2026-05-12** (Phase 2.06), so the site has been *capable* of this silent failure since then.
- The **actual** failure window opened when **both** were true in Vercel **Production**: `WIZARD_SUBMIT_ENABLED=true` (otherwise the route no-ops with `status:'simulated'` and sends nothing — but the symptom email proves it was `true`) **and** `SANITY_API_WRITE_TOKEN` was missing/read-only.
- Both are **Vercel environment events, not git events** — the exact start date is **not derivable from the repo**. Pin it (operator) from the earlier of: the Vercel env-var "updated" timestamp on `SANITY_API_WRITE_TOKEN` / `WIZARD_SUBMIT_ENABLED`, and the **first lead-alert email in the Resend log**.
- **Plausible worst case:** the production write **never worked** (token never correctly scoped in Production). Confirm by querying Sanity: `count(*[_type == "quoteLead" && source == "wizard"])` — if that is `0` (or only test docs), the write has been failing for the entire public window.

---

## ⚠️ Out-of-scope but same root cause — flagged, NOT fixed (no silent ratifications)

**`/api/contact` has the identical latent bug.** [`src/app/api/contact/route.ts`](src/app/api/contact/route.ts) (lines ~100, ~118) swallows the write failure with only an opaque log, passes the same `'(no Sanity ID — write failed)'` fallback string, and [`ContactAlertEmail.tsx`](src/lib/email/templates/ContactAlertEmail.tsx) line 33 builds the same broken `…/desk/contactSubmission;…` link. **If the write token is missing/read-only in Production, contact submissions are being dropped silently too** — the same revenue/lead leak on a second surface. Left untouched per HF1 scope ("smallest correct change, no drive-by cleanups"), but **strongly recommend an immediate follow-up hotfix** applying this exact pattern to the contact path. **The env fix below repairs the write for BOTH surfaces at once.**

(`/api/chat/lead` writes durably too but **returns 500 and does not fall back to email** on write failure — a different, arguably worse, shape. Also out of scope; noted for a sweep.)

---

## Verification (local)

- **`npm run build`** → exit **0**, full route tree emitted, **no errors/warnings**. `/api/quote` classified `ƒ` (dynamic) as expected.
- **`npx tsc --noEmit`** → **0** errors.
- **`eslint`** on all 4 changed files → **0** errors/warnings.
- **Behavioral harness (14/14 assertions, `@react-email/render` + `tsx`):**
  - `describeSanityError` extracts `statusCode` + `detail` from realistic 403/401 Sanity `ClientError` shapes (the diagnosed cause) and is safe on plain `Error` / string inputs.
  - Email **write-succeeded** render → contains `…/structure/quoteLead;abc123`, **no** `/desk/`, **no** banner, **no** `no Sanity ID` artifact.
  - Email **write-failed** render → renders the "NOT saved to the CMS" banner, emits **no** `sanity.studio` link at all, **no** stray `;(` concatenation, and still contains name / phone / email / full address.
- **Not executable from this session** (no dashboards): the live Preview error capture, the forced-failure-on-Preview drill, and the production smoke test. Steps below.

---

## Operator runbook (the dashboard-gated Definition-of-Done items)

**A. Fix the write token (the actual repair).** In Sanity → manage.sanity.io → project `i3fawnrl` → API → Tokens: confirm a token exists with **Editor** (not Viewer) permission on dataset `production`; if in doubt, create a fresh **Editor** token. In Vercel → Project → Settings → Environment Variables → `SANITY_API_WRITE_TOKEN`: paste it and ensure it is checked for **Production + Preview** (and Development if you use it) — check the per-scope boxes, not just that the name exists. Redeploy. *(If the old value was ever a Viewer token, that was the cause; if it was blank in Production, that was the cause.)*

**B. Confirm the real error first (recommended before A).** Deploy this branch to **Preview**, submit a test lead, read the Vercel runtime log line `[/api/quote] Sanity write FAILED { statusCode, detail }`. This is the "capture, don't guess" step — it will name 401/403 + the permission detail.

**C. Recover leads already lost — I could not enumerate these from here.** Cross-reference:
1. Resend → Emails → filter to the lead-alert subject (`New quote — …`) across the breakage window.
2. Sanity → `*[_type == "quoteLead" && source == "wizard"]{firstName,lastName,submittedAt}`.
3. **Every lead-alert email with no matching `quoteLead` doc is a lost lead.** Re-create each in Sanity from the email body, tagged `source: 'backfilled'` (add a `backfilled: true` marker), and **list each by name + date** so Lazar can follow up. **If the count is zero, state that explicitly with the Resend log as evidence — that is the single most important line to fill in here.** *(This session had no Sanity/Resend access; this is the one DoD item that must be completed by hand.)*

**D. End-to-end sign-off (after A).**
- Preview: submit a lead → doc appears in Sanity, email arrives, the **Open in Sanity Studio →** link opens the **correct** document (click it once to confirm the `/structure/…` path resolves).
- Preview forced-failure drill: point `SANITY_API_WRITE_TOKEN` at a bad value → confirm the customer still sees the success screen, the email arrives flagged **⚠️ LEAD NOT SAVED** with all fields, and (if `TELEGRAM_ENABLED=true`) a Telegram alert fires. Restore the good token.
- Production: after merge, submit one real test lead → confirm the `quoteLead` doc is created, then **delete that test doc**.

**E. Telegram dependency (for the "page a human" leg to actually fire).** The alert is wired but only sends when **`TELEGRAM_ENABLED=true`** and `TELEGRAM_OPERATOR_CHAT_ID` is set (per `current-state.md`, Telegram creds have been deferred). Until then, `notifyOperator()` no-ops with a server log line — the **email self-declaration + loud subject + server logs are the fallback loudness**, which work today regardless of the flag. Enabling Telegram before public launch is recommended so a failed lead truly pages.

---

## Own decisions surfaced

1. **`/desk/` → `/structure/`** base-path correction (not just the missing ID). The hosted Studio runs the Structure tool; the already-correct `ChatLeadEmail` proves `/structure/` is right. `/desk/` would have redirected/404'd even on a "successful" write.
2. **Widened the success contract** to count a delivered Telegram page as a valid sink, and added an explicit all-sinks-failed log. Keeps the customer on the success screen in the CMS-down case while still surfacing the true-loss case in logs.
3. **No separate "temporary verbose logging."** The permanent `sanityErrorDetail()` captures exactly what the diagnostic step needed (statusCode + message/description) while staying PII-safe, so nothing temporary was added and nothing needs removing.
4. **Flagged, did not fix, the identical `/api/contact` + `ChatLeadEmail` issues** — scope discipline for a hotfix, but they are real and share this root cause.
5. **Honest session boundary:** live error capture, the Vercel env fix, lost-lead recovery, and the production smoke test require dashboards this non-interactive session cannot reach. They are handed off with exact steps rather than reported as done.

---

## Definition of Done — status

| DoD item | Status |
|---|---|
| Actual Sanity error captured + root cause named (not guessed) | **Diagnosed in code to near-certainty** (suspect #1/#2; #3/#4/#5 ruled out) + **permanent logging added to confirm live in one line** (runbook B). Live capture is operator-gated. |
| Production test creates a real `quoteLead` in the Studio's dataset | **Operator** (runbook A→D) — blocked on the env fix. |
| Studio deep link is a single valid URL to the right doc | **DONE in code** (`/structure/quoteLead;<id>`, verified render); operator clicks once to confirm-opens. |
| Write client server-only, `useCdn:false`, token not `NEXT_PUBLIC_` | **VERIFIED already true** — no exposure, nothing to rotate. |
| Token present + correctly scoped in Dev/Preview/Prod | **Operator** (runbook A). *(Repo convention is Prod+Preview, no Dev — noted.)* |
| Forced failure: customer sees success, email has all fields + states failure, Telegram fires | **DONE in code + verified** (banner + all fields via harness; success contract + Telegram wired). Live drill = runbook D. |
| Breakage window stated with a start date | **DONE** — bounded; exact start = Vercel env audit + first Resend lead email (not in git). |
| Every lost lead listed, or explicit zero-lost with Resend evidence | **Operator** (runbook C) — **not reachable from this session; must be completed by hand.** |
| Temp debug removed, permanent logging retained | **DONE** — permanent structured logging only; nothing temporary introduced. |
| Shipped via PR, no secrets in diff/commits/report | **DONE.** |

---

## Files changed

- [`src/app/api/quote/route.ts`](src/app/api/quote/route.ts) — capture real error + structured log; Telegram page on failure; nullable docId through to email; widened success contract.
- [`src/lib/email/templates/QuoteLeadAlertEmail.tsx`](src/lib/email/templates/QuoteLeadAlertEmail.tsx) — nullable docId; `/structure/` deep link; red "NOT saved" banner; conditional link.
- [`src/lib/quote/resend.ts`](src/lib/quote/resend.ts) — nullable docId; `⚠️ LEAD NOT SAVED` subject prefix on failure.
- [`src/lib/logging/safeError.ts`](src/lib/logging/safeError.ts) — `describeSanityError()` / `sanityErrorDetail()` PII-conscious extractor.
