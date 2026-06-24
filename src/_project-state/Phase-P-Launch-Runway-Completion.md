# Phase P — Launch Runway — Completion Report

**Date:** 2026-06-22 · **Executed by:** Cowork (browser-driven), operator Goran present.
**Session scope:** Easy dashboard wins (Tasks 1–4), prep deliverables (all 4 hand-offs), and capture of Erick's confirmed facts.

---

## Per-task status

| # | Task | Status |
|---|---|---|
| 1 | Remove inert Termly env vars (Vercel) | ✅ **DONE** |
| 2 | Sanity → site revalidate webhook | ✅ **DONE (config)** — live publish-test deferred |
| 3 | Erick facts request (Hand-off A) | ✅ **ANSWERED** — 11 of 13 confirmed; 2 outstanding (socials, Calendly) |
| 4 | Flip chat rate-limiter to Upstash (`kv`) | ✅ **DONE** — cold-start persistence test optional |
| 5 | Upgrade Vercel to Pro | ⏸️ **HELD by operator** — $20/mo; re-confirm before cutover |
| 6 | Secure Places API key (rotate + restrict + alerts) | ⛔ **BLOCKED** — needs Goran's GCP login; rotation co-with-Goran |
| 7 | Apply Erick env facts (Calendly + socials) | ⛔ **BLOCKED** — awaiting social URLs + Calendly link only |
| 8 | NAP + listings consistency | 🟡 **UNBLOCKED, not started** — brand name confirmed; Goran has GBP access; needs Goran login |
| 9 | Crawl old site → 301 redirect map | ☐ **TODO** — Cowork can do solo next |
| 10 | Cloudflare DNS prep (no cutover) | 🟡 **UNBLOCKED, not started** — Goran can access registrar; needs Goran login |
| 11 | Resend domain verify + sender flip | ⛔ **BLOCKED** — needs Task 10 first |
| 12 | Search Console + Bing setup | 🟡 **UNBLOCKED, not started** — Goran has GBP access; needs Goran login/verification |
| 13 | Pre-cutover QA + Lighthouse | ☐ **GATE** — not started |
| 14 | DNS cutover | ☐ **GATED** — do not run until Task 13 passes |
| 15 | Post-cutover close-out | ☐ after Task 14 |

---

## Erick facts — CONFIRMED by Goran, 2026-06-22

| # | Item | Answer |
|---|---|---|
| 1 | Brand name | **Sunset Services U.S.** (use consistent "U.S." rendering everywhere) |
| 2 | Founding year | **2000** (brand-guide "1998" was wrong) |
| 3 | Unilock-authorized year | **2021** (site's "2003" claim is wrong — must fix) |
| 4 | Hardscape-division start year | **2021** |
| 5 | Unilock install count | **No number** |
| 6 | Google rating + count | **4.8 / 37** (site shows stale 4.5 / 26 — must fix) |
| 7 | Reviews to quote | **Yes** — Mark C, Sally Del Vecchio McKibbon, Kelli Batitsas (text in Hand-off B §2c) |
| 8 | "Top 5 Landscaping" award | **Leave it off** — remove any claim |
| 9 | Social URLs | ⏳ **outstanding** (blocks Task 7) |
| 10 | Calendly link | ⏳ **outstanding** (blocks Task 7) |
| 11 | Waterproofing division | **Yes — include at launch** |
| 12 | Registrar login | **Goran can access** → unblocks Task 10 |
| 13 | GBP owner/manager access | **Yes** → unblocks Tasks 8 & 12 |

---

## What shipped this session

### Task 1 — Termly env vars removed ✅
Deleted `NEXT_PUBLIC_TERMLY_PRIVACY_EN_ID` and `NEXT_PUBLIC_TERMLY_WEBSITE_ID` from Vercel (both scoped to Production + Preview). **Only 2 of the 5** runbook-listed vars existed; the other three were never present. Verified gone. No redeploy needed.

### Task 2 — Sanity revalidate webhook ✅ (config)
Created webhook "Site revalidation" in Sanity project `i3fawnrl`: URL `https://sunsetservices.vercel.app/api/revalidate`, POST, all datasets, Create/Update/Delete, projection `{_type, _id, "slug": slug.current}`, Enabled.
- **Secret:** Vercel `SANITY_REVALIDATE_SECRET` is *Sensitive* (unreadable), so a fresh shared secret was set in BOTH the webhook and the Vercel env var (Prod + Preview); Production redeployed green. Secret never written to chat/files.
- **Finding:** Vercel "Require Log In" (SSO) is **OFF** — runbook's "Preview is SSO-protected" note is stale.
- **Deferred:** live publish-test (operator skipped); attempt log currently `[]`.
- **Post-cutover:** re-point URL to `https://sunsetservices.us/api/revalidate` (Task 15).

### Task 3 — Erick facts ✅ answered (see table above)
Email drafted (`Erick-facts-request.md`); Goran answered 11 of 13 in chat. Only social URLs + Calendly link remain.

### Task 4 — Rate-limiter on `kv` ✅
Installed Upstash for Redis (**Free** plan, US-East, 500K cmds/mo) via Vercel Marketplace; connected on Production + Preview. Integration injected `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`, `KV_URL`, `REDIS_URL`. Per the B.09 report, `@upstash/redis` auto-detects the `KV_REST_API_*` aliases, so no `UPSTASH_REDIS_REST_*` needed. Flipped `CHAT_RATELIMIT_STORE` `memory`→`kv` (Prod + Preview), redeployed green.
- **Optional follow-up:** cold-start persistence proof per the B.09 curl steps. Limiter fails open, so chat is safe regardless.

### Task 5 — Vercel Pro ⏸️ held
Operator held off (2026-06-22). Pro = $20/mo (1 member), includes $20/mo usage credit, 1 TB transfer, 10M edge requests, observability, on-demand builds. Re-confirm before Task 13/14.

---

## Hand-offs (all four drafted + routed; B updated with confirmed facts)

- **A — Erick** (facts): `Erick-facts-request.md` — 11/13 answered; chase socials + Calendly.
- **B — Code** (repo edits): `Hand-off-B-Code-edit-list.md` — now contains the confirmed brand name, year, Unilock 2021, rating 4.8/37, the 3 review quotes, award removal, waterproofing keep.
- **C — Operator-local** (photo upload): `Hand-off-C-Operator-local-photos.md`.
- **D — Goran** (Google-side): `Hand-off-D-Goran-Google.md`.

> The four hand-off files currently live in Cowork's outputs. Move them into `src/_project-state/` (or wherever you keep launch docs) if you want them version-controlled alongside this report.

---

## Decisions (append to `Sunset-Services-Decisions.md`)

> **Phase P / Task 2 — Rotated `SANITY_REVALIDATE_SECRET` to a fresh shared value** (Vercel value was Sensitive/unreadable; set the same new secret in the Sanity webhook + Vercel Prod+Preview, redeployed). Closes the B.08/B.09 rotation carryover.
>
> **Phase P / Task 4 — Upstash on the Free plan; rely on `KV_REST_API_*` aliases** (integration injected those, not `UPSTASH_REDIS_REST_*`; `@upstash/redis` auto-detects them).
>
> **Phase P / Task 5 — Vercel Pro upgrade deferred** by operator on 2026-06-22; revisit before cutover.
>
> **Phase P / brand identity LOCKED — name = "Sunset Services U.S.", founding year = 2000** (Goran, 2026-06-22). Brand-guide "1998" rejected. Unilock-authorized + hardscape division both started 2021. Site's "Unilock since 2003" is an error to fix.

---

## Trade-offs to surface to the operator
- **Spanish is LLM-reviewed only** — confirm OK to launch + schedule a native pass post-launch.
- **Legal pages are hard-coded English-only** — attorney review recommended before launch.
- **Live Google-reviews feed is dark** — site shows none (or the 3 hard-coded quotes) until Google API approval + Goran's OAuth.

---

## Exact remaining items before publish
1. **Erick/Goran:** supply social URLs + Calendly link (unblocks Task 7 — the last 2 facts).
2. **Goran:** log into GCP → Cowork applies Places referrer lock + billing alerts; co-do key rotation (Task 6).
3. **Goran:** when ready, log into registrar/Cloudflare (Task 10) and Google Search Console (Task 12) so Cowork can drive them.
4. **Operator:** upload real photos + fix 3 mis-tagged images (Hand-off C).
5. **Code:** do Hand-off B (Unilock 2021, brand/year strings, rating 4.8/37, testimonials, remove award, 301 map, delete `/dev/system`, alerts, GA4).
6. **Cowork (solo, next):** crawl old site → 301 redirect map (Task 9).
7. **Operator:** decide on Vercel Pro (Task 5).
8. **Gate:** Task 13 QA + Lighthouse → then **Task 14 cutover** (operator go-ahead).
9. **Post-cutover:** Task 15 (re-point webhook, submit sitemap, final NAP, monitoring).
