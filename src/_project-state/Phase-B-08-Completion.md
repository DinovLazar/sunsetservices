# Phase B.08 Completion Report

**Phase:** Phase B.08 — Code — Sanity → site instant revalidate webhook.
**Date:** 2026-05-16.
**Branch:** `claude/nostalgic-nash-5273f0` (worktree of `main`; not yet merged).
**Outcome:** **Shipped.** Sanity Studio publishes now invalidate the live site within ~2 seconds via a new `POST /api/revalidate` webhook receiver, per-doc-type cache tagging on every Sanity GROQ helper, and a flag-gated `POST /api/test/revalidate` for harness verification. The page-level `export const revalidate = 1800` ISR on the 5 Sanity-read route groups stays in place as the safety net (D2). The actual webhook in `manage.sanity.io` is **NOT yet configured** — that's a 5-minute user-runnable step documented in §"User-runnable next step" below.

---

## Headline

`POST /api/revalidate` is live behind HMAC-SHA256 signature verification (`SANITY_REVALIDATE_SECRET` shared secret, `parseBody` from `next-sanity/webhook`). On every valid webhook fire it routes through `revalidateForDocument()` — the new single source of truth in `src/lib/sanity/revalidation.ts` that owns the doc-type → cache-tag + page-path mapping. Each request emits the tags it invalidated (`revalidateTag(tag, 'max')` — Next 16's new two-arg form) and the concrete paths it touched (`revalidatePath(path, 'page')`), locale-expanded for EN + ES. Sanity Studio webhook log surfaces both arrays.

Every GROQ helper in `sanity/lib/queries.ts` now sets `{cache: 'force-cache', next: {tags: ['<doc-type>']}}` per the tag schema in the plan-of-record (`Sunset-Services-Decisions.md` 2026-05-16 entry). The Phase B.07 `getSubscriberByToken` is the one deliberate exclusion — it uses `writeClient` (no CDN) and intentionally bypasses the Next data cache for the time-critical unsubscribe lookup. All other helpers (projects × 4, blog × 4, resources × 4, services chat KB × 1, locations chat KB × 1, FAQ scoped × 5, top FAQ chat × 1, reviews × 2) are tagged.

A new flag-gated test route at `POST /api/test/revalidate` exercises the same `revalidateForDocument` helper without HMAC signatures (Bearer auth via the existing Phase 2.16 `TEST_ROUTES_SECRET` — no new test secret introduced). Gated by `REVALIDATE_TEST_ROUTES_ENABLED` (unset on Vercel by default → returns 404 + `{status:'forbidden'}`).

The verification harness at `scripts/test-revalidate-webhook.mjs` (wired as `npm run test:revalidate`) spawns `next start` twice — once with the test-route flag ON for 13 tests, once with it OFF for the single flag-off test — and asserts 14 conditions covering signature verification (missing / invalid / valid), per-doc-type tag and path correctness (blogPost, service, project-without-slug, faq, team, location), unknown doc type handling, missing `_type`, and the three test-route auth branches. All 14 PASS.

One in-phase off-spec API discovery: Next 16 deprecated the single-argument `revalidateTag(tag)` form — now requires a second `profile` argument (string or `CacheLifeConfig`). Used `'max'` per the deprecation warning's recommended value. Logged below in §"Carryover / off-spec notes".

---

## What this phase shipped

| File | Action |
|---|---|
| [src/lib/sanity/revalidation.ts](src/lib/sanity/revalidation.ts) | **NEW (Phase B.08)** central revalidation helper. Exports `revalidateForDocument(payload)` and the `SanityRevalidationPayload` / `RevalidationResult` types. Owns the `MAPPINGS` table (doc-type → tags + path patterns) and `expandPattern()` (per-doc concretization — slug-aware where present, bulk-invalidate across the static-param sources where not). Locale expansion via `withLocales()` emits EN + `/es` variants with the bare home as the single special case (`/` and `/es`, not `/es/`). Unknown `_type` → `{unhandled: true}` with empty arrays (caller returns 200 to stop Sanity retries). Missing `_type` throws (caller returns 400). Calls `revalidateTag(tag, 'max')` (Next 16 two-arg form) + `revalidatePath(concretePath, 'page')` per the resolved set. |
| [src/app/api/revalidate/route.ts](src/app/api/revalidate/route.ts) | **NEW (Phase B.08)** Sanity webhook receiver. POST only. Verifies the `sanity-webhook-signature` header via `parseBody(req, SANITY_REVALIDATE_SECRET)` from `next-sanity/webhook`. Returns `{status, revalidatedTags, revalidatedPaths, docType, unhandled?}` on the 200 path. 5 distinct response branches: `missing-signature` 401, `invalid-signature` 401, `missing-doc-type` 400, `revalidate-failed` 500 (server misconfigured OR unexpected throw — Sanity retries on 5xx), `ok` 200. `runtime = 'nodejs'`, `dynamic = 'force-dynamic'`. |
| [src/app/api/test/revalidate/route.ts](src/app/api/test/revalidate/route.ts) | **NEW (Phase B.08)** flag-gated test route. POST only. Mirrors the Phase 2.16/2.17 test-route pattern verbatim. Gate: `REVALIDATE_TEST_ROUTES_ENABLED !== 'true'` → 404 `{status:'forbidden'}`. Auth: `verifyCronAuth` (timing-safe Bearer) against `TEST_ROUTES_SECRET` (reused from Phase 2.16, no new secret introduced). Zod-validates `{docType: string, slug?: string, _id?: string}`. Calls the same `revalidateForDocument()` helper. Same `runtime` / `dynamic` config as the production route. |
| [scripts/test-revalidate-webhook.mjs](scripts/test-revalidate-webhook.mjs) | **NEW (Phase B.08)** synthetic verification battery. Spawns `next start` twice (server A flag-ON for 13 tests, server B flag-OFF for 1 test). 14 assertions covering all signature/auth/payload branches + per-doc-type tag and path correctness. Signs requests via `encodeSignatureHeader` from `@sanity/webhook` (transitive dep through `next-sanity`). Wired as `npm run test:revalidate` in `package.json`. |
| [src/_project-state/Phase-B-08-Completion.md](src/_project-state/Phase-B-08-Completion.md) | **NEW (Phase B.08)** this report. |
| [sanity/lib/queries.ts](sanity/lib/queries.ts) | **Modified (Phase B.08)** added `cachedTagged(tag)` helper + `TAG` const map. Every fetch on `sanityClient` now passes `{cache: 'force-cache', next: {tags: [tag]}}` as the third arg per the schema in the plan-of-record. `getSubscriberByToken` (Phase B.07) deliberately untagged — uses `writeClient` (no CDN) for the unsubscribe critical-path lookup. Return shapes / projections / `useCdn` / `perspective` / `apiVersion` all unchanged. |
| [package.json](package.json) | **Modified (Phase B.08)** new script entry `"test:revalidate": "node scripts/test-revalidate-webhook.mjs"`. |
| [.env.local.example](.env.local.example) | **Modified (Phase B.08)** new "Phase B.08 — Sanity → site instant revalidation" block documenting `SANITY_REVALIDATE_SECRET` (sensitive HMAC shared secret; same value in `.env.local`, Vercel Production, and Vercel Preview) + `REVALIDATE_TEST_ROUTES_ENABLED` (test-only flag — NEVER set on Vercel). |
| `.env.local` (gitignored — local only) | **Modified (Phase B.08)** populated `SANITY_REVALIDATE_SECRET` with a fresh 64-hex string AND `REVALIDATE_TEST_ROUTES_ENABLED=true` so the harness can drive the test route. |
| [Sunset-Services-Decisions.md](Sunset-Services-Decisions.md) | **Modified (Phase B.08)** appended Phase B.08 plan-of-record (D1–D3 + file map + tag schema). Also appended execution-log entry for the Next 16 `revalidateTag` two-arg form discovery. |
| [src/_project-state/current-state.md](src/_project-state/current-state.md) | **Modified (Phase B.08)** last-completed-phase bumped to B.08; new "What works (Phase B.08 additions)" sub-block; the previous "No webhook for ISR revalidation on Sanity publish" line under "What does NOT work yet" reframed to "Sanity webhook NOT yet configured in `manage.sanity.io`". |
| [src/_project-state/file-map.md](src/_project-state/file-map.md) | **Modified (Phase B.08)** new "Phase B.08" section listing every NEW + MODIFIED file. |

**NOT touched:** the 5 page-level `export const revalidate = 1800` lines on `/blog`, `/blog/[slug]`, `/projects`, `/projects/[slug]`, `/resources`, `/resources/[slug]`, `/service-areas/[city]`, `/[audience]/[service]` (D2 safety net). `dynamic` / `dynamicParams` / `generateStaticParams` on every page. `sanity/lib/client.ts` (`useCdn` / `perspective` / `apiVersion` unchanged). `getSubscriberByToken` (Phase B.07 — uses `writeClient`, no Next data cache).

---

## Tag + path mapping (single source of truth)

The full table is in the plan-of-record (`Sunset-Services-Decisions.md` 2026-05-16 entry). Summary:

| `_type` | Tags | EN paths emitted (locale-expanded to 2× total) |
|---|---|---:|
| `service` | `service`, `faq` | 50 (16 svc-detail + 3 audience + 6 city × 2 = 100 total) |
| `project` (with slug) | `project` | 6 (idx + slug + 3 aud + 6 city + home + about, deduped) |
| `project` (no slug) | `project` | 5 (slug-less drop, others kept) |
| `blogPost` | `blogPost`, `faq` | 2 (idx + slug) |
| `resourceArticle` | `resourceArticle`, `faq` | 2 (idx + slug) |
| `location` (with slug) | `location` | 2 (idx + one city) |
| `location` (no slug) | `location` | 7 (idx + all 6 cities) |
| `faq` | `faq` | 0 (tag invalidation only) |
| `review` | `review` | 6 (all cities — review payload has no slug discriminator) |
| `team` | `team` | 1 (`/about`) |

Locale expansion doubles each path count above; the bare home is `/` AND `/es` (not `/es/`).

---

## Verification harness results (Step 8)

**Local run** (`npm run test:revalidate`): **14 / 14 PASS, 0 FAIL**.

```
✓ T1 webhook missing signature → 401 missing-signature
✓ T2 webhook invalid signature → 401 invalid-signature
✓ T3 webhook missing _type → 400 missing-doc-type
✓ T4 webhook unknown _type → 200 unhandled:true
✓ T5 webhook blogPost(slug) → tags + EN/ES index + EN/ES detail
✓ T6 webhook service(slug) → tags + 50 fanned-out paths (32 svc-detail + 6 audience + 12 city) — total paths=50
✓ T7 webhook project(NO slug) → indices + cross-page reads; NO detail paths
✓ T8 webhook faq → tags=["faq"], paths=[]
✓ T9 webhook team → /about + /es/about
✓ T10 webhook location(aurora) → /service-areas + /service-areas/aurora (× 2 locales)
✓ T11 test-route flag-off → 404 forbidden
✓ T12 test-route missing auth → 401 invalid-auth
✓ T13 test-route wrong secret → 401 invalid-auth
✓ T14 test-route valid auth + blogPost → 200 + same shape as T5
```

T6 initially failed on first run with `pathsLen=50` against an expected `>= 100`. The expectation was mis-derived — I'd assumed `/[audience]/[service]` would cross-product 16 slugs × 2-3 audiences (~32-48 EN paths × 2 locales) but the actual fan-out is one entry per (audience, slug) pair from `SERVICES` (16 entries) + 3 audience landings + 6 city pages = 25 EN paths × 2 locales = 50 total. The system's behavior was correct; the test assertion was wrong. Fixed in commit `8dd1456`.

Harness runtime note: `parseBody` (`next-sanity/webhook`) waits 3 seconds per valid-signature request for Sanity Content Lake eventual consistency. Tests 3-10 (8 webhook tests with valid signatures) each incur the wait — ~24s baked into the total runtime. Plus the `next start` cold boots for server A and server B. Total observed runtime: ~75s.

---

## Regression checks (the 3 Phase B.04/B.05/B.06 harnesses)

**Local** (`http://localhost:3007`):

- `npm run validate:schema` → **22 / 22 URLs PASS, 0 errors, 0 warnings**.
- `npm run validate:seo` → **120 / 120 URLs + sitemap + robots PASS, 0 errors, 0 warnings**.
- `npm run validate:a11y` → **19 / 19 URLs PASS, 0 axe AA violations, 0 SC 2.4.11 findings, 0 SC 2.5.8 findings, all Lighthouse a11y = 100/100**, 10 incomplete (color-contrast-over-photo, same baseline as B.06).

**Vercel Preview:**

TODO_FILL_IN_AFTER_RUN — same three harnesses against the Preview URL using `VERCEL_SHARE_TOKEN` from the Vercel MCP plugin (B.07 pattern).

---

## Lint / types / build

- `npm run lint` → **0 errors, 6 warnings** (same pre-existing B.07 baseline — unused-vars on imports that no longer have references).
- `npx tsc --noEmit` → **0 new errors** modulo the pre-existing Phase 2.04 image-asset module-not-found errors (~30 entries — accepted baseline). Initial run flagged one new error: `TS2554` on `revalidateTag(tag)` because Next 16 deprecated the single-arg form. Switched to `revalidateTag(tag, 'max')` per the deprecation warning's recommendation; `npx tsc --noEmit` then re-passed clean. Also flagged a `readonly` vs mutable mismatch on the `cachedTagged` helper in `sanity/lib/queries.ts`; dropped the `as const` and added an explicit non-readonly return type signature.
- `npm run build` → **succeeded at 137 pages**. Both `/api/revalidate` and `/api/test/revalidate` show up correctly in the ƒ-Dynamic route list. No new MISSING_MESSAGE warnings.

---

## Vercel Preview verification

Preview deployment: `https://sunsetservices-c905h0lft-dinovlazars-projects.vercel.app` (redeployment of the branch-tip commit `3fc6123` after the env var landed). Branch alias: `https://sunsetservices-git-claude-nostalgic-0211da-dinovlazars-projects.vercel.app`.

The initial deployment (`dpl_ETcfoR89Y88XAhfhuGPBNmCrtasW`) was built BEFORE `SANITY_REVALIDATE_SECRET` was upserted to Vercel — so its `/api/revalidate` returned `{"status":"error","reason":"server-misconfigured"}` (500) for every request. Upserting the env var via the Vercel REST API + triggering a `vercel redeploy` of the branch URL produced `dpl_6qAdw3UJZzKjxfH9zDanBDJCR484` (alias `sunsetservices-c905h0lft-…`), which has the env var bound at function-instance creation time. From here forward, every push to the branch deploys with the env var pre-bound.

**Curl smoke (commit `3fc6123`, redeployed `c905h0lft`):**

```
T1 missing signature  → HTTP 401  {"status":"error","reason":"missing-signature"}   ✓
T2 invalid signature  → HTTP 401  {"status":"error","reason":"invalid-signature"}   ✓
T3 valid blogPost sig → HTTP 200  {"status":"ok","docType":"blogPost",
                                   "revalidatedTags":["blogPost","faq"],
                                   "revalidatedPaths":["/blog","/es/blog",
                                                       "/blog/preview-smoke-test",
                                                       "/es/blog/preview-smoke-test"]}  ✓
T4 test route flag-off → HTTP 404 {"status":"forbidden"}                              ✓
```

**Three regression harnesses against Preview** (`VERCEL_SHARE_TOKEN=<mcp-issued> BASE_URL=<preview>`):

- `validate:schema` → **22 / 22 PASS, 0/0**.
- `validate:seo` → **120 / 120 URLs + sitemap + robots PASS, 0/0**.
- `validate:a11y` → **19 / 19 URLs PASS, 0 axe AA violations, 0 SC 2.4.11 findings, 0 SC 2.5.8 findings, all Lighthouse a11y = 100/100**. 10 `incomplete` color-contrast findings on text-over-photo+gradient surfaces (same B.06 baseline; documented).

---

## User-runnable next step (Sanity webhook configuration)

Phase B.08 ships the route + harness. **The actual webhook in `manage.sanity.io` is NOT yet configured** — this is a 5-minute click-through that must happen for instant updates to actually fire. The route is signature-verified and inert until then.

In the Sanity dashboard for the `sunsetservices` project:

```
Project (sunsetservices) → API → Webhooks → Create webhook
  Name:               Next.js revalidation
  Description:        Pings /api/revalidate on every publish for instant cache invalidation
  Project:            sunsetservices
  Dataset:            production
  Trigger on:         Create, Update, Delete (all three)
  Filter:             leave blank (fire on every document type)
  Projection:
                      {
                        "_type": _type,
                        "_id": _id,
                        "slug": slug.current
                      }
  URL (production):   https://sunsetservices.us/api/revalidate
                      — OR until Phase P.06 DNS cutover —
                      https://sunsetservices.vercel.app/api/revalidate
  URL (this branch):  https://sunsetservices-git-claude-nostalgic-0211da-dinovlazars-projects.vercel.app/api/revalidate
                      (the branch's stable Preview alias — re-test the
                      webhook here before merging to main)
  HTTP method:        POST
  HTTP Headers:       leave default (Content-Type: application/json is auto)
  API version:        2024-10-01 (or latest stable v-date)
  Include drafts:     No (only fire on published doc transitions)
  Secret:             <paste the SAME value as SANITY_REVALIDATE_SECRET in
                      Vercel env vars — case-sensitive>
  Enabled:            Yes
```

**Vercel env vars (already upserted by this phase):**

- `SANITY_REVALIDATE_SECRET` (sensitive, Production + Preview) — same 64-hex value as `.env.local`. Paste this into the webhook config's "Secret" field above.
- `REVALIDATE_TEST_ROUTES_ENABLED` — **NOT added to Vercel by design.** Leaving it unset is the gate that keeps `/api/test/revalidate` returning 404 in production.

---

## Definition of done — final check

- [x] Plan-of-record committed first on the branch in `Sunset-Services-Decisions.md`.
- [x] `src/lib/sanity/revalidation.ts` exists with `revalidateForDocument()` exported.
- [x] `sanity/lib/queries.ts` has every relevant fetch tagged per the schema. `getSubscriberByToken` deliberately UNTAGGED.
- [x] `POST /api/revalidate` exists, verifies HMAC signature, calls `revalidateForDocument`, returns the documented shape.
- [x] `POST /api/test/revalidate` exists, flag-gated, auth-gated, calls the same helper.
- [x] `scripts/test-revalidate-webhook.mjs` exists; `npm run test:revalidate` wired in `package.json`.
- [x] All 14 harness tests pass.
- [x] `SANITY_REVALIDATE_SECRET` populated in `.env.local`; documented in `.env.local.example`.
- [x] `SANITY_REVALIDATE_SECRET` upserted to Vercel Production + Preview as `sensitive` (env id `Qtgdr467jWItzs2e`).
- [x] `REVALIDATE_TEST_ROUTES_ENABLED` documented in `.env.local.example`; NOT added to Vercel.
- [x] `export const revalidate = 1800` lines on the existing 5 route groups remain in place (D2 safety net).
- [x] All three regression harnesses (schema 22/22, SEO 120/120, a11y 19/19) exit 0 against BOTH localhost (port 3007) AND Vercel Preview (`sunsetservices-c905h0lft-…`).
- [x] Manual `curl` smoke against `<preview>/api/revalidate` confirms 200 + correct shape on valid signature; 401 on missing/invalid; 404 forbidden on `/api/test/revalidate` (test routes deliberately off on Vercel).
- [x] `current-state.md`, `file-map.md`, `Phase-B-08-Completion.md` all written.
- [x] Completion report includes the user-runnable Sanity webhook config block (above).

---

## Carryover / off-spec notes

- **`SANITY_REVALIDATE_SECRET` is reused across Production + Preview** for simplicity (a single shared secret). Rotate before Phase P.06 DNS cutover; consider per-environment-distinct secrets in Phase P.01 (Vercel Pro upgrade).
- **`revalidateTag(tag, 'max')` — Next 16's new two-arg form.** Single-arg `revalidateTag(tag)` is now deprecated; Next 16's runtime logs a warning and recommends adding `'max'` as the second arg. The plan's example pseudocode (`revalidateTag(docType)`) was written against the legacy Next 15 single-arg form. Logged as an execution-log entry in `Sunset-Services-Decisions.md`.
- **CDN consistency wait.** `parseBody` from `next-sanity/webhook` defaults to a 3-second wait per valid-signature request to let Sanity Content Lake's CDN propagate the new content (useful because our `sanity/lib/client.ts` ships `useCdn: true`). Adds ~24s to the harness runtime. Kept default `true` to preserve the production guarantee (revalidation → next fetch sees fresh data); no env-var override added.
- **Sanity webhook NOT yet configured in `manage.sanity.io`** — see §"User-runnable next step" above for the field-by-field click-through.
- **Bulk-invalidate for slug-less payloads.** When a `service` / `review` / `project` (without slug) publishes, the helper fans out to all concrete paths the type can touch (drawn from `src/data/services.ts` / `src/data/locations.ts`). The projection deliberately keeps `{_type, _id, slug}` minimal — selectivity could improve at the cost of webhook config complexity.

---

## Next phase

With B.08 shipped, Bucket B is complete (B.01 ES `[TBR]` strip → B.03 legal/consent → B.04 schema → B.05 sitemap/robots/hreflang → B.06 a11y → B.07 unsubscribe → B.08 webhook revalidation). Unblocked phases that can run in any order:

- **Phase B.03b finish-up (Cowork)** — 3 missing Termly doc IDs unlock `/es/privacy/`, `/terms/`, `/es/terms/`.
- **Phase M.01** — end-to-end smoke / make-it-work bucket start.
- **Phase 2.17a** — GBP write client (waits on Phase 2.14 + Goran's OAuth handoff).
- **Phase M.03** — native ES review.
- **Phase 2.18** — Part 2 QA + integration sweep.

Phase 2.14 (GBP + Places) still waits on Google's GBP API approval.
