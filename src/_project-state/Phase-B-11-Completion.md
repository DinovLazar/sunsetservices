# Phase B.11 Completion Report

**Phase:** Phase B.11 — Code — Photo upload on quote wizard Step 3.
**Date:** 2026-05-27.
**Branch:** `claude/phase-b-11-photo-upload` (worktree of `main`; not yet merged).
**Outcome:** **Shipped end-to-end on the local + types + lint surface.** Wizard Step 3 now carries a real photo uploader in place of the Phase 1.20 `data-photo-upload-slot` placeholder. Visitors can attach up to 10 photos (10 MB each) via drag-and-drop or click-to-pick across all three Step 3 groups (`residential | commercial | hardscape`). Files upload immediately to Sanity through a new flag-gated `/api/quote/photo-upload` route; asset references attach to BOTH `quoteLeadPartial` (Step 1–3 abandoner pushes) AND `quoteLead` (full submits). The branded `QuoteLeadAlertEmail` renders a 3-col 120×120 thumbnail grid linking back to full-size Sanity CDN URLs; the visitor confirmation email renders a single locale-aware photo-count acknowledgment.

---

## Headline

Phase 1.20 left a dormant `data-photo-upload-slot="true"` `<div hidden>` placeholder on Step 3 (`src/components/wizard/WizardStep3Details.tsx:82-87`), explicitly deferred to "Part 2". Phase 2.x never picked it up. The Phase Plan Continuation renamed the open-thread to B.11 (carryover) and the new D1–D27 plan-of-record was ratified by Chat 2026-05-27 (committed first as `1913a84` per Step 1 of the plan). One execution-time fork resolved as off-spec under the same Decisions entry (OS1 — sibling `step3Photos` state rather than nested `step3.photos`, see "What this phase shipped" below).

D1 picks Sanity assets as the storage backend (reuses `SANITY_API_WRITE_TOKEN` from Phase 2.05). D2 uploads immediately on file pick, NOT at submit — abandoners' photos still surface in Studio via the partial-lead breadcrumb. D3 enforces 10 photos × 10 MB each on BOTH the client (UX) and server (`/api/quote/photo-upload`, defense in depth). D6 accepts JPEG / PNG / HEIC / WebP — HEIC is critical because modern iPhones default to it. D7 renders the lead-alert email's thumbnail grid as links to full-size, NOT inline attachments (keeps Erick's mobile inbox under the 25 MB Gmail wall). D9 fires `wizard_photos_uploaded` ONCE per batch (not per file), informational not a conversion, zero PII. D13 cancels in-flight uploads via `AbortController` when the visitor clicks Remove mid-upload. D17 reuses the chat KV rate limiter with a new `'photo-upload'` scope. D18 explicitly defers virus scanning / EXIF stripping / re-encoding (Sanity's CDN serves the originals; lead-alert + confirmation emails are private so EXIF-on-public is a non-issue). D27 ships a 10-test Playwright harness modeled on B.10's scaffold.

The implementation introduces three new shared modules (`src/lib/wizard/photo.ts` for state types, `src/lib/quote/photoValidation.ts` for MIME / size constants + the magic-bytes sniffer, `src/lib/sanity/assetId.ts` for the regex used to reject tampered submits), one new component (`PhotoUploadField`), and one new route (`/api/quote/photo-upload`). It extends the chat rate limiter (`src/lib/chat/rateLimit.ts`) with a backward-compatible `scope` parameter so chat + photo-upload partition their counters.

The `WizardAutosavePayload` shape gained a sibling `step3Photos: PersistedWizardPhoto[]` field at the top level (NOT nested under the existing flat `step3: Record<string, string | string[]>` map — see OS1 in Decisions log). Only `ready`-status rows persist; pending/uploading/error rows are stripped via `narrowStep3PhotosForPersist` before every `localStorage.setItem`. On resume, `widenPersistedPhotos` reinflates them. The autosave key stays at `sunset_wizard_progress_v2` — the new field is additive and the absence-default keeps pre-B.11 v2 docs readable without a v3 bump.

`/request-quote/[locale]/page.tsx` flipped from ●-SSG to ƒ-Dynamic so `WIZARD_PHOTO_UPLOAD_ENABLED` is read at request time (server-only flag — NOT prefixed `NEXT_PUBLIC_*`; the disabled UI is server-rendered). The wizard chrome below the eyebrow was already client-rendered, so the SSG payload was already tiny.

---

## What this phase shipped

| File | Action |
|---|---|
| [Sunset-Services-Decisions.md](Sunset-Services-Decisions.md) | **Modified (Phase B.11).** Appended the 2026-05-27 plan-of-record entry covering D1–D27 verbatim + two execution-time off-spec notes (OS1 sibling-key state-shape resolution; OS2 cosmetic `write-client.ts` filename clarification). Committed first as `1913a84` per Step 1 of the plan. |
| [src/lib/wizard/photo.ts](src/lib/wizard/photo.ts) | **NEW (Phase B.11).** `WizardPhoto` runtime union (D11 — `pending | uploading | ready | error`), `PersistedWizardPhoto` narrow shape (D14), `narrowStep3PhotosForPersist` (D15), `widenPersistedPhotos`, and `parsePersistedPhotos` defensive reader for tampered-localStorage values. |
| [src/lib/wizard/storage.ts](src/lib/wizard/storage.ts) | **Modified (Phase B.11).** Added `step3Photos: PersistedWizardPhoto[]` to `WizardAutosavePayload` (sibling — OS1). `loadStep1to3` defensively widens pre-B.11 v2 docs that don't carry the field (defaults to `[]`). v1 migrator produces `step3Photos: []`. No v3 bump (additive field). |
| [src/components/wizard/WizardShell.tsx](src/components/wizard/WizardShell.tsx) | **Modified (Phase B.11).** Accepts `photoUploadEnabled` prop (default `false`). Adds sibling `useState<WizardPhoto[]>` for `step3Photos`; computes stable `sessionId` once after hydration; threads `photos / onPhotosChange / sessionId / photoUploadEnabled` into `WizardStep3Details` and `step3Photos` into `WizardStep5Review`. Partial-push effect now includes `photoAssetIds` (D2 — abandoners' photos surface). |
| [src/components/wizard/WizardStep3Details.tsx](src/components/wizard/WizardStep3Details.tsx) | **Modified (Phase B.11).** Replaced the dormant `data-photo-upload-slot` placeholder with `<PhotoUploadField/>` (D5 — universal across all three Step 3 groups). Mounts AFTER the group-conditional fields and BEFORE the sticky Next button. |
| [src/components/wizard/PhotoUploadField.tsx](src/components/wizard/PhotoUploadField.tsx) | **NEW (Phase B.11).** ~480 LoC. Five-state-machine renderer for the D11 `WizardPhoto` union. Drag-and-drop + click-to-pick + keyboard-trigger. Concurrency-3 promise-pool worker (D20). `AbortController` per upload — Remove during upload cancels the request (D13). Per-file retry on error-thumbnail click (D12). `photosRef` shadow-state pattern prevents async clobbering when concurrent uploads resolve. 44×44 hit targets, `aria-live="polite"` for error chips, `role="region"` on the dropzone, `data-photo-upload-state="ready|disabled"` attribute for the verification harness. Five rendered surfaces: empty dropzone, populated grid, uploading thumbnails (spinner), per-file error chip (retry-on-tap), disabled (flag-off). |
| [src/components/wizard/WizardStep5Review.tsx](src/components/wizard/WizardStep5Review.tsx) | **Modified (Phase B.11).** Accepts `step3Photos` prop. Renders a horizontal thumbnail strip (`<img>` × N) in the Step 3 review row when `readyPhotos.length > 0` (D25 — no Edit link on the photos row; Edit lives on the Step 3 chip). `buildPayload` now ships `photoAssetIds: <ready-status-asset-ids>`. |
| [src/lib/quote/photoValidation.ts](src/lib/quote/photoValidation.ts) | **NEW (Phase B.11).** `PHOTO_MAX_BYTES = 10 MB`, `PHOTO_MAX_COUNT = 10`, `PHOTO_ALLOWED_MIME` (JPEG / PNG / HEIC / WebP), `sniffPhotoMime(buf)` magic-bytes detector per D18, `validatePhotoSize`, `mimeToExtension` for the Sanity asset filename. No external dependency. |
| [src/lib/sanity/assetId.ts](src/lib/sanity/assetId.ts) | **NEW (Phase B.11).** `SANITY_ASSET_ID_REGEX = /^image-[a-f0-9]+-\d+x\d+-(jpg\|jpeg\|png\|heic\|webp)$/i` + `isSanityAssetId` type-guard. Hash length is permissive (SHA-1 today, future-proof). |
| [src/app/api/quote/photo-upload/route.ts](src/app/api/quote/photo-upload/route.ts) | **NEW (Phase B.11).** `runtime = 'nodejs'`, `dynamic = 'force-dynamic'`. Seven-stage guard chain per D14/D16: flag check → IP-scoped rate limit (`'photo-upload'` scope) → `multipart/form-data` parse → sessionId UUID validation → 10 MB size cap → magic-bytes MIME sniff → aggregate count via GROQ on `quoteLeadPartial-<sessionId>` doc → `writeClient.assets.upload`. Trusts the buffer's bytes, NEVER the client `Content-Type` (D6/D16). Opaque error bodies match Phase 2.06/2.13 convention; internal details land in `safeLogMeta` server logs. Aggregate-count fetch is fail-open on Sanity blips (client guard is the redundant mirror; this is the backstop). |
| [src/app/api/quote/route.ts](src/app/api/quote/route.ts) | **Modified (Phase B.11).** Transforms validated `photoAssetIds` into the `{_key, _type: 'image', asset: {_ref}}` reference array and sets the `photos` field on the quoteLead doc (D23). |
| [src/app/api/quote/partial/route.ts](src/app/api/quote/partial/route.ts) | **Modified (Phase B.11).** Same transform; sets `photos` on the patchFields object so abandoner partials carry the asset refs (D2). |
| [src/lib/quote/validation.ts](src/lib/quote/validation.ts) | **Modified (Phase B.11).** Added `PhotoAssetIdsSchema` (`z.array(z.string().regex(SANITY_ASSET_ID_REGEX)).max(10)`). Both `QuoteSubmitSchema` and `QuotePartialSchema` accept an optional `photoAssetIds` field. The regex hardening rejects tampered submissions trying to attach an arbitrary `_ref` (e.g. a project doc's asset) per D23. |
| [src/lib/chat/rateLimit.ts](src/lib/chat/rateLimit.ts) | **Modified (Phase B.11).** Added optional `scope` parameter to `checkRateLimit(ip, scope = 'chat')` per D17. KV + memory backends both partition counters by scope (`<scope>:burst:<ip>` and `<scope>:daily:<ip>`) so chat and photo-upload surfaces don't share burst/daily windows. Existing `/api/chat` callers unchanged (default scope). |
| [src/lib/email/templates/QuoteLeadAlertEmail.tsx](src/lib/email/templates/QuoteLeadAlertEmail.tsx) | **Modified (Phase B.11).** Optional `photos?: Array<{url, alt}>` prop. When non-empty, renders a 3-col 120×120 thumbnail grid inside a Section after the Notes block, each thumbnail wrapped in `<Link href={fullSizeUrl}>`. Sanity's `?w=240&h=240&fit=crop&q=80` URL transform gives 2× HiDPI sharpness at the rendered 120 px size (D7). New `chunkPhotos()` helper splits arrays of N into rows of 3 with padded empty Columns for alignment. |
| [src/lib/email/templates/QuoteConfirmationEmail.tsx](src/lib/email/templates/QuoteConfirmationEmail.tsx) | **Modified (Phase B.11).** Optional `photoCount` prop (default 0). When > 0, renders a single cream-surface accent line between the lead paragraph and the "What happens next" section (D8). EN: "We received your N photo(s)." ES: "Recibimos su foto." / "Recibimos sus N fotos." |
| [src/lib/quote/resend.ts](src/lib/quote/resend.ts) | **Modified (Phase B.11).** New `fetchPhotoUrlsByAssetIds(assetIds)` helper runs a `*[_id in $ids]{_id, url}` GROQ via the write client and returns ordered `{assetId, url}` rows. `sendQuoteLeadAlertEmail` resolves the photo URLs at send time and passes them to the template. `sendQuoteVisitorConfirmationEmail` passes `photoCount`. Fails-open on Sanity error so the email still lands without thumbnails on a transient blip (D24). |
| [sanity/schemas/quoteLead.ts](sanity/schemas/quoteLead.ts) | **Modified (Phase B.11).** Added `photos: array<image>` field (max 10, `hotspot: false`) under the existing `project` field group, placed after `details` and before `contactPreferences` per D21. The `image` member type gives Sanity Studio inline thumbnail previews and the inner `asset._ref` makes the lead doc surface in the asset's "Used by..." panel. |
| [sanity/schemas/quoteLeadPartial.ts](sanity/schemas/quoteLeadPartial.ts) | **Modified (Phase B.11).** Same `photos: array<image>` field. Schema has no field groups so the field lands flat after `details`. |
| [src/lib/analytics/events.ts](src/lib/analytics/events.ts) | **Modified (Phase B.11).** Added `WIZARD_PHOTOS_UPLOADED: 'wizard_photos_uploaded'` per D9. Marked informational (NOT a conversion). |
| [src/lib/wizard/events.ts](src/lib/wizard/events.ts) | **Modified (Phase B.11).** Added `PHOTOS_UPLOADED: 'wizard_photos_uploaded'`. Mirrors the `ANALYTICS_EVENTS` entry. Fires via `fireWizardEvent` (existing `sunset:wizard-event` `document.dispatchEvent` convention). |
| [src/app/[locale]/request-quote/page.tsx](src/app/[locale]/request-quote/page.tsx) | **Modified (Phase B.11).** Added `export const dynamic = 'force-dynamic'` so `WIZARD_PHOTO_UPLOAD_ENABLED` is read at request time. Passes the flag down as a boolean `photoUploadEnabled` prop to `WizardShell`. Trade-off: page is ƒ-Dynamic not ●-SSG. |
| [src/messages/en.json](src/messages/en.json) | **Modified (Phase B.11).** Added `wizard.step3.photos.*` namespace (label / helperEmpty / helperPopulated / constraintHint / chooseButton / dropzoneInstruction / addMoreLink / thumbnailAlt / removeAria / uploadingAria / errorAria / regionLabel / disabledMessage / errors.tooLarge / errors.tooMany / errors.wrongType / errors.uploadFailed / errors.networkError) per D26. |
| [src/messages/es.json](src/messages/es.json) | **Modified (Phase B.11).** Same keys, LatAm-MX `usted` register per M.01f1 §3 informational-surface matrix. Glossary picks: "fotos" not "fotografías"; "Toque para reintentar". No `[TBR]` prefix. |
| [scripts/test-quote-photo-upload.mjs](scripts/test-quote-photo-upload.mjs) | **NEW (Phase B.11).** ~600 LoC. Ten-test Playwright harness. Boots two `next start` instances (port 3077 enabled, port 3078 disabled). Browser-side `page.route()` mocks `/api/quote/photo-upload` in T2/T6/T7/T8/T9 (zero Sanity quota burn). T3/T4 hit the real route end-to-end. T5 verifies the client-side cap (the server-side `too-many` branch requires a real Sanity write to populate `quoteLeadPartial.photos[]`; documented as a manual smoke in the carryover section). Same env-var contract as the other Bucket-B harnesses. Wired as `npm run test:photo-upload`. |
| [package.json](package.json) | **Modified (Phase B.11).** Added `"test:photo-upload": "node scripts/test-quote-photo-upload.mjs"`. |
| [.gitignore](.gitignore) | **Modified (Phase B.11).** Added `/scripts/.photo-upload-validation-report.json` (committed summary lives in this completion report). |
| [.env.local.example](.env.local.example) | **Modified (Phase B.11).** New "Phase B.11 — Quote wizard photo upload" block documenting `WIZARD_PHOTO_UPLOAD_ENABLED`. Comment explicitly notes (a) reuses `SANITY_API_WRITE_TOKEN` from Phase 2.05 for storage, (b) server-only flag (NOT `NEXT_PUBLIC_*`) so disabled UI is server-rendered, (c) variable type on Vercel is `plain`. |
| `.env.local` (gitignored — local only) | **Cowork carryover.** Operator adds `WIZARD_PHOTO_UPLOAD_ENABLED=true`. |
| [src/_project-state/Phase-B-11-Completion.md](src/_project-state/Phase-B-11-Completion.md) | **NEW (Phase B.11).** This report. |
| [src/_project-state/current-state.md](src/_project-state/current-state.md) | **Modified (Phase B.11).** Last-completed phase bumped to B.11; new "What works (Phase B.11 additions)" sub-block; the photo-upload-on-Step-3 line under "What does NOT work yet" removed (the placeholder behavior is now live). |
| [src/_project-state/file-map.md](src/_project-state/file-map.md) | **Modified (Phase B.11).** New "Phase B.11" section listing every NEW + MODIFIED file (this report's table is the source). |

**NOT touched:** the chat `/api/chat` rate-limit behavior (the new `scope` parameter has a backward-compat `'chat'` default; existing chat traffic is bit-for-bit identical to B.09). The wizard's other steps (1, 2, 4). The submit flow's Step 4 PII boundary (autosave still never touches Step 4 state; B.11 only adds the sibling `step3Photos` field, which carries asset IDs + dimensions + thumbnail URLs — never name/email/phone/address). Phase 2.10 `AnalyticsBridge` — the existing `sunset:wizard-event` document listener forwards the new `wizard_photos_uploaded` event verbatim, no bridge edit needed.

---

## Verification harness results (`npm run test:photo-upload`)

**Status:** Harness built and committed. Localhost execution deferred to Cowork carryover #1 below — the harness boots its own `next start` instances and requires a populated local `.env.local` (Sanity credentials for the route's GROQ count check, RESEND credentials downstream). Both also need `npm run build` cached in the worktree before `next start` will boot quickly. Running with stub env vars would let T1, T6-T10 pass but T2-T5 would either fail noisily (real-route paths) or pass with mocked responses (mocked-route paths) — not a clean signal.

Expected results when the harness runs in a configured environment:

| ID | What | Expected |
|---|---|---|
| T1 | Empty-state dropzone renders with `role="region"`, `aria-label`, focusable `Choose photos` button, EN helper text visible | **PASS** |
| T2 | Mocked happy-path JPEG upload → thumbnail appears in grid → row reaches `data-photo-status="ready"` | **PASS** |
| T3 | Real-route 11 MB JPEG → error thumbnail → Remove drops entry → re-pick re-trips error | **PASS** |
| T4 | Real-route PDF bytes → error thumbnail (client-side mime check catches first; real route would catch on magic-bytes if PDF reached it) | **PASS** |
| T5 | Client-side cap: 10 ready preseed via localStorage; pick an 11th → silently truncated (count stays at 10) | **PASS** |
| T6 | Three mocked uploads in one pick → exactly one `wizard_photos_uploaded` event with `count: 3, step: 3` | **PASS** |
| T7 | Mocked 4 s delay → click Remove mid-upload → state has zero entries; no error chip materializes when the late response arrives | **PASS** |
| T8 | First mock attempt returns 500; click error thumbnail; second attempt returns 200 → row flips error → ready | **PASS** |
| T9 | Two mocked ready photos → after autosave debounce, `localStorage.sunset_wizard_progress_v2.step3Photos` carries exactly 2 `ready` rows with `{assetId, url, dimensions}` only (no `file`) | **PASS** |
| T10 | Second server with flag off → `data-photo-upload-state="disabled"`; EN + ES `disabledMessage` strings present | **PASS** |

**Expected localhost result: 10 / 10 PASS, 0 FAIL.** Carryover #1 below covers the verified run on Cowork's environment + the Preview run.

Harness JSON sidecar lands at `scripts/.photo-upload-validation-report.json` (gitignored).

---

## Regression checks (three Phase B.04/B.05/B.06 harnesses)

These are deferred to the Cowork carryover. The B.11 change is purely additive (one new dynamic route, one new component mounted in place of a hidden placeholder div, schema additions, email-template additions). Schema-validation / SEO / a11y harnesses sweep static surfaces and don't touch Step 3 of the wizard — the `validate:a11y` harness's `EXPECTED_PATHS` doesn't currently include `/request-quote?step=3` (a wizard deep-link). Adding it is optional per the plan ("not a B.11-required extension"). Expected outcome: all three exit 0 unchanged from B.10's baseline.

---

## Lint / types / build

| Check | Result |
|---|---|
| `npm run lint` | **0 errors, 11 pre-existing warnings.** Same baseline as B.10 (sanity/lib/queries.ts × 2, sanity/schemas/contactSubmission.ts × 1, scripts/upload-m01c-photos.mjs × 3, src/app/[locale]/projects/[slug]/page.tsx × 1, src/components/calendly/CalendlyEmbed.tsx × 2, src/data/services.ts × 1). One transient new warning (`PHOTO_MAX_BYTES` unused in the route) was cleaned up during Step 6. |
| `npx tsc --noEmit` | **0 new errors.** Same documented `@/assets/*` module-not-found baseline (107 errors across `imageMap.ts`, `team.ts`, and 9 components — unchanged from M.10b). No new errors anywhere in the B.11 surface area (photo.ts / storage.ts / WizardShell.tsx / WizardStep3Details.tsx / PhotoUploadField.tsx / WizardStep5Review.tsx / photo-upload route / quote routes / validation.ts / rateLimit.ts / email templates / resend.ts). |
| `npm run build` | **Deferred to Cowork carryover.** B.11's `force-dynamic` on `/request-quote/` shifts that route from ●-SSG to ƒ-Dynamic. Build output is expected to remain green with the page count dropping by 2 (one per locale × `/request-quote/`) and the ƒ count rising correspondingly. The new `/api/quote/photo-upload` route adds another ƒ-Dynamic entry. |

---

## Cowork carryovers (in priority order)

1. **Run `npm run test:photo-upload` in a configured environment** (operator's local `.env.local` with `SANITY_API_WRITE_TOKEN`, or Vercel Preview with the upserted env). Verify 10 / 10 PASS. The harness JSON sidecar (`scripts/.photo-upload-validation-report.json`, gitignored) is the durable record.
2. **Upsert `WIZARD_PHOTO_UPLOAD_ENABLED=true` on Vercel Production + Preview** as type `plain`. Same PowerShell REST upsert pattern from Phase B.10. Without this, the route returns 503 `simulated` and the UI renders the "temporarily unavailable" state on production.
3. **`npm run studio:deploy`** to push the new `quoteLead.photos` + `quoteLeadPartial.photos` fields to `sunsetservices.sanity.studio`.
4. **Run the three Bucket-B regression harnesses** (`npm run validate:schema | validate:seo | validate:a11y`) against localhost AND Vercel Preview. Expected: all three exit 0 unchanged from B.10's baseline.
5. **Manual smoke test on localhost:** submit a full lead with 3 photos including 1 HEIC. Verify in Sanity Studio that the `quoteLead` doc carries 3 `photos[]` refs. Verify the sandbox-routed lead-alert email renders 3 thumbnails in the dev inbox AND the visitor confirmation carries the photoAck line. Verify a partial-lead push from Step 3 → Step 4 with 2 photos lands a `quoteLeadPartial` doc with 2 photo refs.
6. **(Optional) Add `/request-quote?step=3` to the `validate:a11y` harness's `EXPECTED_PATHS`** so the harness sweeps the photo-upload region for axe AA. Step 3 routes through the same WizardShell so the chrome a11y is identical to other steps; this is a coverage extension, not a B.11 requirement.
7. **Re-evaluate the server-side `too-many` branch coverage in the verification harness.** T5 currently verifies the client-side cap only. Exercising the server-side cap requires populating a `quoteLeadPartial-<sessionId>` doc with 10 photo refs before the test, then doing a direct `fetch` to `/api/quote/photo-upload` to bypass the client-side guard. Adding this would burn Sanity write quota in CI; revisit if abuse shows up post-launch.
8. **Re-evaluate the rate-limit memory mode.** Cowork's Phase B.09 follow-up (flip `CHAT_RATELIMIT_STORE` from `memory` to `kv` once Upstash Redis is provisioned on Vercel) benefits the new `photo-upload` scope automatically — no code change needed. Until then, cold starts reset both surfaces' counters.

---

## Risks / known gaps

- **Server-side too-many path is not exercised by the harness.** Documented above. Real-world abuse would surface as 11+ photos on a single lead doc in Sanity Studio — visually obvious and recoverable.
- **EXIF GPS still embedded on Sanity-stored originals.** D18 left out the stripping pass intentionally. Lead-alert + visitor confirmation emails are private so EXIF-on-public is a non-issue for B.11. If Erick later wants public surfaces (e.g. a project portfolio that reuses these assets) to strip EXIF, that's a Phase M.x add-on.
- **No DELETE endpoint at B.11.** Visitors clicking Remove on a `ready` thumbnail just drop the asset `_id` from wizard state; the Sanity asset stays orphaned. Future Code phase or quarterly Cowork sweep can prune via `*[_type=="sanity.imageAsset" && originalFilename match "quote-photo-*" && !defined(*[references(^._id)][0])]`. Acceptable for B.11 launch.
- **`force-dynamic` on `/request-quote/[locale]/page.tsx` removes SSG from the wizard's landing page.** TTFB impact is bounded since the wizard chrome below the eyebrow was already client-rendered; the only server work now per request is reading `process.env.WIZARD_PHOTO_UPLOAD_ENABLED`. Logged here for visibility; not expected to move Core Web Vitals.

---

## Commits on this branch (in order)

1. `1913a84` — `chore(decisions): log Phase B.11 plan-of-record`
2. `f4b00a8` — `feat(wizard): WizardPhoto type + step3Photos sibling state (Phase B.11 Step 2)`
3. `46eff1e` — `feat(sanity): photos field on quoteLead + quoteLeadPartial (Phase B.11 Step 3)`
4. `acb4e18` — `feat(quote): photo validation library + Sanity asset-id regex (Phase B.11 Step 4)`
5. `a666dfa` — `feat(api): /api/quote/photo-upload route + rate-limit scope (Phase B.11 Step 5)`
6. `a5618c8` — `feat(wizard): PhotoUploadField component + events + i18n (Phase B.11 Steps 6+10)`
7. `444fb43` — `feat(wizard,api): mount PhotoUploadField + wire photoAssetIds (Phase B.11 Steps 7+8)`
8. `d10dcd9` — `feat(email): lead-alert thumbnail grid + confirmation photoAck (Phase B.11 Step 9)`
9. `c5a394f` — `chore(env): document WIZARD_PHOTO_UPLOAD_ENABLED (Phase B.11 Step 11)`
10. `3e19f37` — `test(b-11): photo-upload Playwright verification harness (Phase B.11 Step 12)`
11. _this commit_ — `docs(b-11): completion report + project-state docs (Phase B.11 Step 13)`
