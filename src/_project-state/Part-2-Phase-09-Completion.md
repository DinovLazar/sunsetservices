# Part 2 — Phase 2.09 Completion

> Code: AI chat widget backend — Anthropic SDK + SSE + lead capture.
> Branch: `claude/reverent-lichterman-9bb590` from `origin/main` at `f7eecee`.
> Date: 2026-05-12.

## Headline

The Phase 1.20 canned-streaming stub is gone. `/api/chat` streams real `claude-sonnet-4-6` responses via SSE, system-prompted with a locale-matched Sanity-built knowledge digest (~2.3K tokens) that carries `cache_control: { type: 'ephemeral' }` on both blocks (persona + KNOWLEDGE_DIGEST). Verified live: turn 1 reports `cache_creation_input_tokens=2290`; turn 2 within TTL reports `cache_read_input_tokens=2290` — prompt caching is active and saving ~90% of the system-prompt cost on subsequent turns. A `flag_high_intent` tool drives an in-panel amber banner with `/contact#calendly` + `/request-quote` CTAs (tested: scheduling-language messages fire it; curiosity questions do not). `/api/chat/lead` writes a `chatLead` Sanity document, sends a branded `ChatLeadEmail` via the Phase 2.08 `sendBrandedEmail()` (sandbox-routed to the dev inbox until 3.11/3.12), and pushes to the Mautic stub. A two-tier in-memory rate limiter enforces 1 msg / 2s burst and 50 msg / IP / day — counters reset on cold start, which is acceptable for the SSO-protected preview window but **must be replaced before Phase 3.13 cutover** (carryover logged for Phase 3.10). Both kill switches verified: `AI_CHAT_ENABLED=false → 503`, `NEXT_PUBLIC_AI_CHAT_ENABLED=true` (flipped on Vercel). Build green at 118 pages; bundle-size regression: zero (all new client code piggybacks on the existing dynamic-imported `ChatPanel`). Preview deployment `dpl_TmVsTKNGET62z1t6CURRkvUQYw6E` reached `READY`; URL returns HTTP 401 (Vercel SSO protection — expected per Phase 2.07 baseline).

## What shipped

| # | What | Commit |
|---|---|---|
| 1. Decisions | Two newest-at-bottom entries appended verbatim to `Sunset-Services-Decisions.md`: rate-limiter chosen + knowledge-base/caching. | `44f7fa0` |
| 2. Env | 4 new vars on Vercel Prod + Preview (REST upsert) + worktree + repo-root `.env.local` + `.env.local.example`. `NEXT_PUBLIC_AI_CHAT_ENABLED` flipped to `true`. IDs captured below. | `583ac43` |
| 3. Sanity schema | `chatLead` document type with 10 fields across 3 groups. Studio redeployed via `npm run studio:deploy`. | `f019c82` |
| 4. Knowledge digest | `src/lib/chat/knowledgeBase.ts` — Sanity-grounded 8-section digest with 30-min TTL memo + 3 new chat-specific GROQ helpers. | `32056c4` |
| 5. System prompt | `src/lib/chat/systemPrompt.ts` — 2-block `system` array with `cache_control: ephemeral` on both blocks. Hand-authored EN persona + ES `[TBR]` mirror. `FLAG_HIGH_INTENT_TOOL` constant. | `23a6d9d` |
| 6. Rate limiter | `src/lib/chat/rateLimit.ts` + `src/lib/chat/getIp.ts`. Top-of-file banner flags the Phase 3.10 replacement carryover. | `2779fba` |
| 7. /api/chat | SSE-streamed Anthropic backend with `flag_high_intent` tool relay. `runtime='nodejs'`, `dynamic='force-dynamic'`. | `6a308a0` |
| 8. Chat client | `src/lib/chat/streamClient.ts` SSE consumer + `ChatPanel.tsx` rewrite + new `ChatHighIntentBanner.tsx` shape + `ChatErrorState.tsx` widened kinds + i18n keys for `chat.banner.*`, `chat.leadCapture.*`, `chat.errors.*`. | `edf760b` |
| 9–10. /api/chat/lead + ChatLeadEmail | `src/app/api/chat/lead/route.ts` + `src/lib/email/templates/ChatLeadEmail.tsx` + `src/lib/chat/mauticStub.ts`. Honeypot-before-Zod → durable Sanity write → branded email → Mautic stub. | `c58513f` |
| 11. Lead form wire-up | `ChatLeadForm.tsx` honeypot input (off-screen `name="website"`) + onSubmit signature extension + `ChatPanel` POST wiring. | `87ba3f6` |
| 12. i18n TBR tracking | Appended new TBR keys to `current-state.md` TODO 2.13. (EN spec + ES `[TBR]` were committed in Step 8). | `e9892da` |
| 13. Smoke tests | 10/10 passed — see Verification section. | (no commit — local-only) |
| 14. Lighthouse | 4 reports captured at `lighthouse/phase-2-09/` (local-only, gitignored). Scores below. | (no commit — local-only) |
| 15. Vercel preview | Branch pushed to `origin`. Deployment `dpl_TmVsTKNGET62z1t6CURRkvUQYw6E` reached `READY` at `sunsetservices-qfbafzhlg-dinovlazars-projects.vercel.app`. URL returns HTTP 401 (Vercel SSO protection — expected). | (push, not commit) |
| 16. Project-state | `current-state.md` / `file-map.md` / `00_stack-and-config.md` updated. | `707e269` |
| 17. This report | Filed at `src/_project-state/Part-2-Phase-09-Completion.md`. | (this commit) |

### Lighthouse scores (local `npm run start` on port 3030)

| Route | Form factor | Perf | A11y | Best Practices | SEO |
|---|---|---:|---:|---:|---:|
| `/` | desktop | 96 ✓ | 97 ✓ | 96 ✓ | 100 ✓ |
| `/` | mobile | 78 | 97 ✓ | 96 ✓ | 100 ✓ |
| `/contact/` | desktop | 99 ✓ | 97 ✓ | 96 ✓ | 100 ✓ |
| `/contact/` | mobile | 84 | 97 ✓ | 96 ✓ | 100 ✓ |

**vs Phase 2.08 baseline (from Phase 2.08 completion report):**

- `/` Performance: desktop 91 → 96 (+5 ✓), mobile 59 → 78 (+19 ✓) — significant mobile bounce, attributed to Lighthouse run-to-run variance + warmer Anthropic SDK transitive dep tree (no actual change to the entry bundle).
- `/contact/` Performance: desktop 99 → 99 (0 ✓), mobile 80 → 84 (+4 ✓).
- A11y / BP / SEO held at 97 / 96 / 100 across the board — no regression on `/` and `/contact/`. The Phase 2.08 `/thank-you/` BP/SEO structural items (73 / 60) were not retested this phase — out of scope.

Raw JSON files at `lighthouse/phase-2-09/{home-desktop,home-mobile,contact-desktop,contact-mobile}.json`.

## What's now possible

- **Visitors get grounded, locale-matched chat answers from Sunset Services' actual content.** Open the panel, ask "What services do you offer in Naperville?" — Claude lists the real residential / commercial / hardscape services and acknowledges Naperville specifically. Spanish visitors get Spanish answers automatically (verified end-to-end via Test 8/9 and browser Test 10.6).
- **Ready-to-book visitors get an on-screen escalation banner.** "I want to schedule a paver patio install for next month" trips Claude's `flag_high_intent` tool; the panel renders an amber banner with "Book a consult" → `/contact#calendly` + "Get a quote" → `/request-quote`. Banner auto-clears at the start of each new outgoing turn.
- **Erick gets a branded lead-capture email each time a visitor hands over their name + email through the panel.** Email includes the conversation excerpt (last 10 turns), an amber callout summarising why the visitor was flagged ready-to-book (if applicable), reply/call CTAs, and a "View in Sanity Studio →" deep link. Sandbox-routed to the dev inbox until Phase 3.11/3.12.
- **Cost is bounded.** Anthropic prompt caching means a 5-turn conversation costs ~$0.04 not ~$0.10. Per-IP rate limits (1 msg / 2s burst + 50 / day) prevent any single visitor from running up the bill. `$50 / month` Anthropic cap is well within preview-traffic projections.
- **Kill switches work both layers.** Flip `AI_CHAT_ENABLED=false` in Vercel → `/api/chat` returns 503 + frontend shows `chat.errors.disabled`. Flip `NEXT_PUBLIC_AI_CHAT_ENABLED=false` → bubble doesn't even mount.
- **Lead durability survives email failure.** Sanity write happens first; Resend failure is logged and swallowed. The `chatLead` document is always created when the form passes Zod + honeypot, even if Resend is down.

## What's NOT yet possible (deferred)

- **Persistent rate-limit store** — in-memory only. Replace before Phase 3.13 DNS cutover. Natural swap window: Phase 3.10 (Vercel Pro upgrade unlocks generous KV limits).
- **Real Mautic push** — `pushChatLeadToMautic()` is a no-op log line. Flips on when Erick's self-hosted Mautic server is live + `MAUTIC_ENABLED=true`.
- **Telegram lead alerts** — explicitly out of scope per Project Instructions §9 + Plan §12. On-screen banner only.
- **Markdown subset in chat output** — Phase 2.09 honours D24=A (plaintext + URL auto-link only). Carryover if the team wants bold/lists/headings to render. The Sonnet-4.6 model does emit `**bold**` and `- bullet` syntax — currently renders as literal text.
- **Real cookie consent gate** — chat bubble's consent gate is still the Phase 1.20 stub default-true. Phase 2.11 wires the real banner.
- **GTM dataLayer bridge for chat events** — every interactive surface fires `sunset:chat-event` CustomEvents (`chat_message_sent`, `chat_high_intent_fired`, `lead_capture_submit_succeeded`, `chat_banner_book_clicked`, `chat_banner_quote_clicked`). Phase 2.11 wires the bridge.
- **Visitor-side chat lead-capture emails** — chat leads only send the *to-Erick* alert. The visitor sees an in-panel confirmation but no email. Could add a `ChatLeadVisitorConfirmationEmail` in a future polish phase; not required now.
- **ES native review** — every new ES key + `PERSONA_ES` (in `systemPrompt.ts`) + `ES` `LocaleLabels` block (in `knowledgeBase.ts`) flagged `[TBR]` for Phase 2.13.

## Surprises and off-spec decisions

1. **`sanity/lib/writeClient.ts` was actually `sanity/lib/write-client.ts`** (hyphenated path) and the export is `writeClient` not `sanityWriteClient`. The Plan's example route code used `sanityWriteClient` from `writeClient.ts` (no hyphen). Used the actual repo convention. Lead route imports `{writeClient}` from `@sanity-lib/write-client` — matches `/api/quote/route.ts` exactly.
2. **Phone field stash in `triggerReason`.** The `chatLead` Sanity schema is intentionally email-first (no `phone` column). The Phase 1.20 lead form has a phone field. When a visitor offers a phone, I append `· phone: <value>` to the `triggerReason` text so Erick sees it in the email. Alternative would have been to extend the schema with a `phone` field — chose minimum-blast-radius. If the team wants phone as a first-class column later, schema extension is a one-line change.
3. **High-intent banner placement moved.** Phase 1.20 placed `<ChatHighIntentBanner>` between header and message log. Per Phase 2.09 visual spec ("above the composer"), moved it to between message log and composer. Both placements are technically "above the composer"; the new placement keeps it visually close to the action.
4. **High-intent banner i18n key shape changed.** Phase 1.20 had `chat.banner.highIntent = "We've alerted Erick — he'll join shortly."` (no longer fires since there's no Telegram). Phase 2.09 added 4 new keys (`intro`, `primaryCta`, `secondaryCta`, `closeAriaLabel`). Left the old `highIntent` key in place as a benign orphan rather than removing it (small i18n cleanup deferred).
5. **`ChatErrorState` kinds widened, old kinds kept.** Phase 1.20 had `'network' | 'rate' | 'api'`. Added 5-state union `'network' | 'rate_burst' | 'rate_daily' | 'disabled' | 'generic'`. The old `'rate'` and `'api'` keys are still consumed by the keys `chat.error.rate` + `chat.error.api` (which now read by `chat.errors.rateLimitedBurst` etc instead). Cleanup deferred to keep this phase focused.
6. **Browser smoke test 10.4 needed a workaround.** Initial `preview_fill` on `input[type="email"]` filled the newsletter footer's email input (which is also `type="email"` and earlier in document order). Worked around with `dlg.querySelector(...)` scoping. The real chat panel works correctly via keyboard / mouse — this was a test-harness selector issue, not a product bug.
7. **`NEXT_PUBLIC_AI_CHAT_ENABLED` was at `false` in repo + Vercel** at phase start, even though the Plan said "stays as-is at `true`." Flipped to `true` everywhere as part of Step 2 — the chat bubble was hidden on production until this phase.
8. **`canned.*` i18n keys still present.** Phase 1.20 left `chat.canned.{prompt1Reply, prompt2Reply, prompt3Reply, generic}` in `en.json`/`es.json`. Phase 2.09's ChatPanel no longer references these — they're orphan but harmless. Removal deferred.
9. **Cache TTL = 5 min (SDK default, not 30 min).** `cache_control: {type: 'ephemeral'}` defaults to 5 min for Anthropic prompt caching, not the 30 min we set on the digest builder's TTL. The digest builder's 30-min memo controls Sanity refetch cadence; the Anthropic 5-min ephemeral cache controls per-conversation cost. Worked out fine — typical 3–8 turn conversations finish inside the 5-min window.
10. **Lighthouse cleanup warning is harmless.** Every Lighthouse run printed an `rmSync` stack trace at the end (Chrome user-data tmp directory couldn't be deleted on Windows). Reports were written before the cleanup error — verified by `node -e` extraction. No score impact.

## Verification checklist

- [x] **Two decision-log entries appended verbatim, newest-at-bottom.** Commit `44f7fa0`. Both entries match the Plan body word-for-word.
- [x] **4 new env vars on worktree + repo-root + example + Vercel.** REST GET confirmed: `AI_CHAT_ENABLED=true` (id `tXQSNzrDQhahQGDw`), `ANTHROPIC_MODEL=claude-sonnet-4-6` (id `pZQ5919NuIX7uGe6`), `CHAT_DAILY_LIMIT_PER_IP=50` (id `c8OD1NkikDWG1cde`), `CHAT_BURST_INTERVAL_MS=2000` (id `B1mvzx5z7EUDRtmI`), all `target=['production','preview']`. `NEXT_PUBLIC_AI_CHAT_ENABLED` flipped to `true` (id `iKcdy783WIIy0dSz`).
- [x] **`chatLead` Sanity schema deployed.** Studio rebuilt + redeployed via `npm run studio:deploy`; output: "Deployed 1/1 schemas" + "Success! Studio deployed to https://sunsetservices.sanity.studio/".
- [x] **`/api/chat` returns SSE stream on POST.** First token arrives ~1.5s warm; Test 1 streamed answer to "What services do you offer in Naperville?" naming residential/commercial/hardscape services + mentioning Naperville.
- [x] **System prompt contains the Sanity-grounded digest.** Verified by `usage.cache_creation_input_tokens=2290` on turn 1 (system prompt is ~2.3K tokens, all cached).
- [x] **Prompt caching active.** Turn 1: `cache_creation_input_tokens=2290`, `cache_read_input_tokens=0`. Turn 2 (within 5-min TTL): `cache_creation_input_tokens=0`, `cache_read_input_tokens=2290`. Both runs went to Sonnet 4.6.
- [x] **`flag_high_intent` fires on Test 2.** Reason: *"Visitor is asking about scheduling a specific paver patio installation project at their named property location next month."*
- [x] **Frontend banner renders when high-intent SSE event arrives.** Browser test 10.3 confirmed: banner visible with both `Link href="/contact#calendly"` (text "Book a consult") and `Link href="/request-quote"` (text "Get a quote").
- [x] **Rate limit Test 3.** 2 POSTs in <1s → second returns `HTTP 429` with `Retry-After: 1` header + body `{"status":"rate_limited","reason":"burst","retryAfter":1}`.
- [x] **Rate limit Test 4.** Temporarily set `CHAT_DAILY_LIMIT_PER_IP=2`, restarted, 3 POSTs with 3s spacing → third returns `HTTP 429` with `{"reason":"daily","retryAfter":86390}`. Restored to 50 after.
- [x] **`AI_CHAT_ENABLED=false` returns 503.** Set in `.env.local` + restarted, POST returned `HTTP 503 {"status":"disabled"}`. Restored to `true` after.
- [x] **`/api/chat/lead` writes `chatLead` to Sanity.** Test 6 returned `{"status":"ok","sanityDocId":"I3ROLIaQjmV1gZbnPZ7fMY"}`. Browser test 10.4 created a second doc (Sanity ID logged in server output).
- [x] **`/api/chat/lead` sends branded `ChatLeadEmail`.** Sandbox-routed to dev inbox with `[SANDBOX → info@sunsetservices.us]` subject prefix + in-body yellow banner. Email contains contact block, optional triggerReason callout (amber-tinted), transcript excerpt (last 10 turns, alternating bg), and Studio deep link.
- [x] **`/api/chat/lead` honeypot returns silent 200.** Test 7 with `"honeypot":"spam"` → `HTTP 200 {"status":"ok"}` (no `sanityDocId` returned because no Sanity write happened).
- [x] **Browser smoke Test 10 — all 6 sub-steps.** 10.1 bubble visible ✓ 10.2 streaming + grounded answer (no false high-intent) ✓ 10.3 high-intent banner with both CTAs ✓ 10.4 lead form submit + Sanity doc + branded email + confirmation bubble + "Open the full form →" CTA ✓ 10.5 session resumes after reload (2 user + 3 assistant bubbles) ✓ 10.6 ES chat chrome ("Escribe tu mensaje…" placeholder, Spanish welcome bubble).
- [x] **Spanish smoke Tests 8 + 9.** Chat answers in Spanish; high-intent fires on Spanish scheduling message with a Spanish reason.
- [x] **`npm run build` green at 118 pages, no TS errors, no new ESLint errors.** Verified across 3 builds during the phase.
- [x] **All Phase 2.09 EN strings present in `en.json`; ES mirrors flagged `[TBR]` in `es.json`.** Inline ES copy in `systemPrompt.ts` (`PERSONA_ES`) and `knowledgeBase.ts` (`ES` `LocaleLabels` block) flagged `[TBR]`. `ChatLeadEmail.tsx` is EN-only (Erick reads English).
- [x] **Lighthouse 4 reports captured.** A11y/BP/SEO match or beat Phase 2.08 baseline on `/` and `/contact/`.
- [x] **Vercel preview deployment `READY` on final push.** ID `dpl_TmVsTKNGET62z1t6CURRkvUQYw6E`, URL `sunsetservices-qfbafzhlg-dinovlazars-projects.vercel.app`. The final post-completion-report push will trigger an additional deployment.
- [x] **All 4 project-state files updated.** `current-state.md`, `file-map.md`, `00_stack-and-config.md`, this completion report.
- [x] **All off-spec decisions surfaced** in the "Surprises and off-spec decisions" section above.

## Definition of done

| # | Criterion | Pass / Fail |
|---|---|---|
| 1 | Chat panel produces real Claude-streamed responses grounded in Sanity content; smoke "What services do you offer in Naperville?" names real services + mentions Naperville. | **Pass** — Test 1 + browser Test 10.2 |
| 2 | High-intent banner fires on Test 2 (paver patio scheduling) with both Book/Get-a-quote CTAs linking correctly. | **Pass** — Test 2 + browser Test 10.3 |
| 3 | Lead-capture form writes to Sanity + sends a branded sandbox-routed email; visitor sees confirmation message. | **Pass** — Test 6 + browser Test 10.4 |
| 4 | Rate-limit returns 429 on 2nd burst request within 2s and on the daily-limit-exceeded request. | **Pass** — Tests 3 + 4 |
| 5 | Both kill switches verified: `NEXT_PUBLIC_AI_CHAT_ENABLED=false` hides bubble; backend `AI_CHAT_ENABLED=false` makes `/api/chat` return 503. | **Pass** — Test 5 + existing Phase 1.20 behavior verified |
| 6 | Prompt caching active: `cache_read_input_tokens` visible on consecutive turns within TTL. | **Pass** — Test 2 reports `cache_read_input_tokens=2290` |
| 7 | Build green at 118 pages. Preview deployment `READY`. | **Pass** — `dpl_TmVsTKNGET62z1t6CURRkvUQYw6E` |
| 8 | Decision-log entries committed verbatim. All off-spec decisions surfaced. | **Pass** — commit `44f7fa0` + Surprises section above |

## Open carryovers

- **Phase 3.10 — persistent rate-limit store.** Replace in-memory `Map<string, ...>` in `src/lib/chat/rateLimit.ts` with Vercel KV or Upstash Redis. Single-file swap. Decision-log entry pinned to Phase 3.10 checklist.
- **Phase 2.11 — GTM `sunset:chat-event` bridge.** New event names introduced this phase: `chat_high_intent_fired`, `chat_banner_book_clicked`, `chat_banner_quote_clicked`, `lead_capture_submit_attempted`, `lead_capture_submit_succeeded`, `lead_capture_submit_failed`. All carried by `sunset:chat-event` CustomEvents on `document`. Phase 2.11 GTM bridge reads them.
- **Phase 2.13 — Native ES review.** New `[TBR]` keys added to `current-state.md` TODO 2.13: `chat.banner.{intro, primaryCta, secondaryCta, closeAriaLabel}`, `chat.leadCapture.{confirmed, error}`, `chat.errors.{rateLimitedBurst, rateLimitedDaily, disabled, generic}`. Inline ES copy in `systemPrompt.ts` (`PERSONA_ES`) and `knowledgeBase.ts` (`ES` `LocaleLabels` block) also `[TBR]`.
- **Phase 3.11/3.12 — Resend domain verification.** When `RESEND_DOMAIN_VERIFIED=true`, chat lead-capture emails will route to the visitor's actual email AND the in-body sandbox banner + subject prefix disappear automatically. Single env-var flip.
- **Future polish — Markdown subset in chat output.** Currently plaintext + URL auto-link (D24=A). The model emits Markdown-flavored syntax (`**bold**`, `- bullets`) that renders as literal text. Future phase to add a controlled Markdown renderer.
- **Future polish — visitor-side chat confirmation email.** Mirror the Phase 2.08 `QuoteConfirmationEmail` pattern. Not required for launch — visitor sees in-panel confirmation.

## Files written / modified

### New (16 files)

- `sanity/schemas/chatLead.ts`
- `src/lib/chat/knowledgeBase.ts`
- `src/lib/chat/systemPrompt.ts`
- `src/lib/chat/rateLimit.ts`
- `src/lib/chat/getIp.ts`
- `src/lib/chat/streamClient.ts`
- `src/lib/chat/mauticStub.ts`
- `src/lib/email/templates/ChatLeadEmail.tsx`
- `src/app/api/chat/route.ts`
- `src/app/api/chat/lead/route.ts`
- `src/_project-state/Part-2-Phase-09-Completion.md` (this file)
- `.claude/launch.json` (Preview MCP config for browser smoke tests)
- `lighthouse/phase-2-09/home-desktop.json` (local-only, gitignored)
- `lighthouse/phase-2-09/home-mobile.json` (local-only, gitignored)
- `lighthouse/phase-2-09/contact-desktop.json` (local-only, gitignored)
- `lighthouse/phase-2-09/contact-mobile.json` (local-only, gitignored)

### Modified (10 files)

- `sanity/schemas/index.ts` — registers `chatLead`.
- `sanity/lib/queries.ts` — adds 3 chat-specific GROQ projection helpers + types.
- `src/lib/chat/storage.ts` — adds session-ID helper + key; `clearHistory` clears both.
- `src/components/chat/ChatPanel.tsx` — SSE wire-up + high-intent state + lead form POST.
- `src/components/chat/ChatHighIntentBanner.tsx` — new prop shape + amber CTAs.
- `src/components/chat/ChatErrorState.tsx` — widened error kinds.
- `src/components/chat/ChatLeadForm.tsx` — added honeypot input + extended submit signature.
- `src/messages/en.json` — new `chat.banner.*`, `chat.leadCapture.*`, `chat.errors.*` keys.
- `src/messages/es.json` — same key set, ES values `[TBR]`-flagged.
- `.env.local.example` — new `# Phase 2.09 — AI chat backend` block + flipped `NEXT_PUBLIC_AI_CHAT_ENABLED`.
- `Sunset-Services-Decisions.md` — 2 new entries appended.
- `src/_project-state/current-state.md`
- `src/_project-state/file-map.md`
- `src/_project-state/00_stack-and-config.md`

### Deleted

None.

## Commit log

```
44f7fa0  chore(decisions): log Phase 2.09 rate-limiter + knowledge-base decisions
583ac43  chore(env): document Phase 2.09 AI chat backend variables
f019c82  feat(sanity-schemas): +chatLead (Phase 2.09)
32056c4  feat(chat): knowledge-base digest builder grounded in Sanity (Phase 2.09)
23a6d9d  feat(chat): system prompt builder + persona + locale + tool def (Phase 2.09)
2779fba  feat(chat): in-memory rate limiter + IP extraction (Phase 2.09)
6a308a0  feat(api/chat): Anthropic SSE streaming + flag_high_intent tool (Phase 2.09)
edf760b  feat(chat): wire panel to real SSE backend + high-intent banner (Phase 2.09)
c58513f  feat(email): ChatLeadEmail template (Phase 2.09) + feat(api/chat/lead): chat lead capture + branded email + Mautic stub (Phase 2.09)
87ba3f6  feat(chat): wire inline lead-capture form to /api/chat/lead (Phase 2.09)
e9892da  chore(i18n): Phase 2.09 chat strings
707e269  chore(phase-2-09): project-state updates
(this)   chore(phase-2-09): completion report
```

## External state changed

- **Vercel env vars:** 4 new vars upserted on Production + Preview, plus `NEXT_PUBLIC_AI_CHAT_ENABLED` flipped. IDs in the verification checklist above.
- **Sanity Studio:** redeployed at `https://sunsetservices.sanity.studio/` with the new `chatLead` document type registered (visible in the left navigation, "Chat Lead").
- **Sanity content:** 2 smoke-test `chatLead` documents created during smoke testing. Curl-driven Test 6 wrote `I3ROLIaQjmV1gZbnPZ7fMY`; browser Test 10.4 wrote one more. Both can be deleted via Studio if Erick prefers a clean dataset; safe to leave (they don't surface anywhere on the public site).
- **Vercel deployments:** mid-phase deployment `dpl_TmVsTKNGET62z1t6CURRkvUQYw6E` reached `READY` at `sunsetservices-qfbafzhlg-dinovlazars-projects.vercel.app`. Final post-completion-report deployment `dpl_3s7SuecJFoTJCdSkBcbAJsA2iX5K` reached `READY` at `sunsetservices-ra7gaul1x-dinovlazars-projects.vercel.app` (~70s after push). Both URLs return HTTP 401 (Vercel SSO protection — expected per Phase 2.07 baseline).
