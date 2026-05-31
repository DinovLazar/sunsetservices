# Phase M.11 — Full Multi-Agent QA & Fix Sweep (Code) — Completion Report

**Date:** 2026-05-31
**Branch:** `worktree-phase+m11-qa-sweep` (worktree-sanitized from `phase/m11-qa-sweep`) — **NOT merged to `main`.**
**Base:** `origin/main` @ `f936457` (M.10e merged).
**Plan of record:** `Sunset-Services-Decisions.md` 2026-05-31 entry (commit `68b488e`, committed first per the decision-first convention).

---

## 1. Headline

A top-to-bottom, multi-subagent **discover → fix → verify** sweep of the entire site. **~46 findings** were triaged; every `fix-now` item was fixed and verified, and the three validation harnesses moved from the pre-existing **schema 22/22 · seo 170/174 · a11y 19/20** baseline to **fully green**:

| Gate | Before M.11 | After M.11 |
|---|---|---|
| `npx tsc --noEmit` | 0 (after build) | **0** |
| `npm run lint` | (full-lint never run) | **0 errors** / 8 triaged warnings |
| `npm run build` | green, 190 pages | **green, 190 pages** |
| `npm run validate:related-links` | pass | **pass** |
| `npm run validate:schema` | 22/22 · 0/0 | **22/22 · 0/0** |
| `npm run validate:seo` | 170/174 (4 errors) | **184 URLs · 0 errors / 0 warnings** |
| `npm run validate:a11y` | 19/20 (1 error) | **20/20 · 0 axe AA · 0 SC 2.4.11 · 0 SC 2.5.8 · Lighthouse ≥95** |
| `test:*` (5 npm) | — | **all pass** (consent 23/23, revalidate 14/14, rate-limit 8/8, wizard-autocomplete 8/8, photo-upload 10/10) |

9 atomic `phase(M.11):`-prefixed commits, working tree clean.

---

## 2. Execution model (multi-agent)

This phase fulfils the M.11 slot via Claude Code's native multi-agent capability instead of the originally-specced Codex review (logged as M.11-D1).

- **Phase A — discovery:** a 13-agent read-only `Workflow` fan-out across the 4 workstreams + cross-cutting (a11y / SEO / schema / assets / security), each agent carrying the full guardrail/deferral brief. One agent (`division-ia-logic`) failed to return structured output and was re-run as a standalone agent (came back clean).
- **Phase B — triage:** the orchestrator merged + deduplicated all findings into one table; classified each `fix-now` / `flag-and-log` / `intentional-leave` against the §9 guardrails.
- **Phase C — fixes:** 5 parallel fix-subagents on disjoint file-sets (backend, a11y-components, links/design/content, globals.css, imageMap) + a dedicated i18n agent on the two message files, while the orchestrator handled the precision/judgment work (wizard logic, security redaction, slug guard) on its own disjoint files.
- **Phase D — verification:** full rebuild + harness suite + route sweep, run by the orchestrator.

**One execution incident (handled):** the first fix-subagent wrote its 7 edits to the **parent repo** working tree (`C:\Users\user\Desktop\SunSet-V2` on `main`) instead of the worktree. The edits were correct; they were copied onto the branch and the parent working tree was reverted to clean `main` (verified `git status` empty). No other agent leaked; all writes are on the branch only, `main` untouched.

---

## 3. What was fixed (by commit)

| Commit | Group | Fixes |
|---|---|---|
| `1cc8e63` | Harness reconciliation | aurora-driveway-apron removed from both harness configs (M.11-D5); a11y project sample swapped to live `aurora-area-patio`; **+6 real Sanity slugs** (3 projects + 3 blog) that the sitemap had but the hardcoded arrays lacked |
| `d562d64` | Schema + API correctness | `Person.image` now conditional (no more 404 `/images/team/<slug>.avif` on `/about`); WebSite `SearchAction` removed (no `/search` route); service-detail `FAQPage` guarded against empty `mainEntity`; chat SSE error event `reason`→`message` (matched the consumer; error detail had been silently dropped); photo-upload docstring `Six`→`Seven` stages |
| `d6a3a4f` | WCAG 2.2 AA a11y | focus-visible ring restored on chat composer + wizard tiles (`.card:has(:focus-visible)` outline); invalid `role=menu/menuitem` removed from both mega-panels; target sizes fixed (chat dismiss + filter chips → ≥44/24px); `aria-modal` now reflects `showModal()`; translated chat typing `aria-label`; ConsentBanner dropped redundant `aria-label`; reduced-motion `.card-photo` typo; pagination green-600 (AA); `scroll-padding-top` under the sticky header |
| `ecbe226` | Consistency (links/design/content) | **`?audience=`→`?division=`** projects-filter deep-link on every division landing + service-detail page (was silently dropping the filter — high-severity); `card--cream`→`card-cream` (About team cards rendered without the cream surface); WizardStepIndicator current dot green-600 (AA); ES-locale-aware links in 3 confirmation emails; removed the dead `isCommercial` branch; chat knowledge-base founding year 2001→2000 |
| `ffb89d5` | i18n cleanup + ES register + parity | removed confirmed-orphan key blocks (`audience.*` ~234 keys, `home.audience.*`, `home.projects.{tag,tile,alt}`, footer `placeholderNote`, `servicePage.related.h2.{residential,commercial}`); ES `usted` register fixes on the transactional surfaces (contact form + errors, thank-you page, chat lead-capture, Calendly fallback CTA); stale "audience landings"/"audiencia" copy corrected; **`Erick Solis`→`Erick Valle`** (owner's name, EN+ES); added `chat.typing.ariaLabel`. **EN/ES leaf-key parity restored: 1352 = 1352, identical sets** |
| `14319c4` | Wizard logic + slug guard | `getStep3Group` now resolves `landscape` to a single stable group (`residential`) — `propertyType` is collected on Step 4 (after Step 3), so branching on it made Step 3 disagree with the Step 5 review and leaked stale residential answers into a "commercial" payload; now consistent. Stale Step-3 answers are cleared when the division changes. Added a build-time assertion enforcing globally-unique service slugs |
| `261c2d4` | Assets | LocalProjectsStrip rendered 3 empty green boxes for the 18 cities added in M.01d that lacked `LOCATION_PROJECT_TILES` entries → aliased each to an existing project-tile triplet (no new assets) |
| `72542ab` | Security | redacted the plaintext `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` committed in the B.10 plan-of-record entry |

---

## 4. Workstream summary (Phase A discovery)

- **WS1 Code correctness:** strong. No React 19 / Next 16 anti-patterns of substance (proxy.ts, `revalidateTag(tag,'max')`, `after()`, awaited Promise params all correct). Real bug: chat SSE `reason`/`message` mismatch (fixed). Lint surfaced 2 pre-existing-pattern `set-state-in-effect` issues (one mine from the aria-modal fix, one pre-existing B.11) — both resolved (a restructure + a justified disable for a legitimate client-only-init pattern).
- **WS2 Logic correctness:** 4-division IA verified clean by the re-run (28 services, 0 duplicate slugs, cross-division 404 guard present, `getProjectDivision` consistent across all 4 call sites, redirects map the snow-removal split correctly). Real bug: the wizard Step-3 propertyType ordering flaw (fixed). ISR `revalidate=1800` + `/api/revalidate` tag mapping + Sanity null-fallbacks all correct.
- **WS3 Consistency:** audience→division migration was ~complete; remaining stragglers were the `?audience=` deep-links (fixed), a cluster of orphan i18n keys (removed), and stale visible copy (fixed). ES glossary/register mostly solid; transactional-surface `tú`/`usted` drift fixed.
- **WS4 Functional:** full EN+ES route sweep (184 URLs via validate:seo) all 200/PASS — zero unintended 404s. All 5 npm `test:*` pass; forms/wizard/chat/Calendly/consent exercised by the harnesses.

---

## 5. Flagged for Chat (`flag-and-log` — NOT fixed this phase)

Deliberately deferred (out-of-scope refactor, product decision, deferred-integration code, or guardrail-adjacent). Recommended for a future small phase:

**Security / operator actions (urgent):**
1. **🔴 ROTATE the GCP Places API key.** `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` (`AIzaSyD_X-…`) was committed in plaintext in the decision log (now redacted on-branch). It is a `NEXT_PUBLIC_*` key (already public in the client bundle by design), so the real security boundary is the **GCP HTTP-referrer allowlist** — but the key should still be **rotated in GCP Console + referrer-restricted** by Goran/Cowork. A code redaction cannot undo git history or the bundle exposure. (This was already a B.10 Cowork carryover; M.11 escalates it.)
2. No server-side rate-limiting on the 5 public lead-capture POST routes (contact, newsletter, quote, quote/partial, chat/lead) — honeypots only. `checkRateLimit` infra exists; needs per-route limits + tuning (ties to the B.09 KV swap).
3. ServiceM8 attachment fetch lacks a hostname allowlist (SSRF risk) — behind `SERVICEM8_ENABLED=false`; harden at flag-on.
4. `x-forwarded-for` IP takes the first entry (spoofable) vs the last (Vercel's real IP) in `getIp.ts` — ties to the B.09 KV rate-limit follow-up; verify Vercel header behavior before changing.
5. `TELEGRAM_API_BASE_URL` test-seam is unsanitized in production — gate behind a test flag (note: the naive fix breaks the test harnesses, which run as `next start`/NODE_ENV=production).
6. Truncated Resend key prefixes in `00_stack-and-config.md` + `Part-2-Phase-06-Completion.md` — left untouched (the completion report is a §9 do-not-touch file; the prefixes are non-usable).

**Sanity schema (needs a coordinated schema change + data migration — not a blind M.11 edit):**
7. `sanity/schemas/service.ts` still exposes an `audience` radio (Residential/Commercial/Hardscape) with no `division` field — editors creating services see the retired taxonomy. GROQ `order(audience asc)` would also need updating.
8. `blogPost`/`resourceArticle` `crossLinkAudience` + `portfolioDraftPending.audience` schemas carry the retired audience options (portfolio one is behind `PORTFOLIO_DRAFT_ENABLED=false`).

**Code/consistency cleanups (low-risk, deferred to avoid scope creep):**
9. `PhotoUploadField` allocates a blob URL inside `useMemo` (a companion cleanup effect prevents a real leak; works in practice).
10. Deep-linking `?step=4`/`?step=5` bypasses client Step-3/Step-4 validation (server Zod is the backstop → 400; not a security hole). Touches core wizard nav.
11. Excess photo files beyond the cap are silently discarded (no "too-many" feedback) — the string + reason already exist.
12. OG-image route reads from the retired static TS seed (`@/data/getBlog`/`getResources`) while pages are Sanity-driven — today's slugs match, but a Sanity-only post falls through to the generic card.
13. Dead code: `buildAudienceItemList` (schema/service.ts), `getReviewsForCity` + `getFaqsForAudience` (queries.ts) — documented follow-ups.
14. `SERVICE_HERO`/`SERVICE_TILE` keyed by retired slugs (resolve via `imageKey` aliases — works); `inlineServiceCrossLink.audience` type drift in blog/resources data; retired `lisle`/`bolingbrook` dead imageMap entries; footer "All Services" → `/landscape/` (ambiguous).
15. Phantom design tokens (`--color-border-soft`, `--color-text-error`, etc.) render via hex fallbacks across 7 wizard/form/chat files; 2 hardcoded `#FFFFFF` (should be `var(--color-bg)`).
16. `_propertyType` (wizard.ts) + `_parentAudience` (services.ts) unused-param warnings — the project's `_`-prefix intentional-unused convention; the eslint config does not exempt `^_`. Left consistent with the existing `_parentAudience`.
17. Visitor confirmation/newsletter emails now ES-locale-aware (fixed); the Erick-facing alert emails stay EN by design.

**Build/env (not defects):**
18. `npm run build` warns "Next.js inferred your workspace root" — a worktree artifact (two lockfiles: parent + worktree). Absent on Vercel (single lockfile). Not fixed (pinning `turbopack.root` could mis-target the parent build).

**Test harnesses — documented environment skips (NOT M.11 regressions; code untouched):**
- `test-telegram-bot.mjs` exits 2 on a Sanity `queryParseError` — the failing `*[_id == $id][0]` query is **in the test harness** (line 299, unguarded), and crashes because telegram is flag-off (M.06 deferred) so the prior step never produces `approvalLogDocId`. The test needs a live bot + `TELEGRAM_ENABLED=true`. (Minor harness robustness follow-up: guard line 299 like line 257.)
- `test-blog-automation.mjs` is 10/11 — Test 8 (topic rotation) returns `picked=undefined` from topic-pool exhaustion (accumulated real-Anthropic test-run state in Sanity). Other 10 pass.

---

## 6. Intentional-leave (guardrails confirmed — NOT changed)

Blocked-integration flags (TELEGRAM/SERVICEM8/PORTFOLIO_DRAFT/GBP_PORTFOLIO_PUBLISH/GSC/MAUTIC/RESEND_DOMAIN_VERIFIED, `CHAT_RATELIMIT_STORE=memory`); Calendly + chat-bubble default-true consent gates; the 3 fallback Termly legal routes; placeholder featured images, EN-only Erick emails, per-city placeholder stats; BG-01 palette + Montserrat (M.10c D7); `[TBR]` ES strings (0 stripped); the 4 ES boundary cases — **`entradas`/`cocheras`, `Presupuesto`/`estimado`, "Hardscape" in English (`division.hardscape.label`), the mixed wizard register** (`wizard.step3.photos.helperEmpty`) — all left for native review; the nav `Fogatas y Elementos` vs page `Chimeneas y Elementos de Fuego` conflict (TRANSLATION_NOTES §M.01f1 §5, Erick decides); `pricing.mode==='price'` dead-but-wired; the dead `aurora-driveway-apron` row still present in `projects.ts`/`imageMap.ts` (inert — projects render from Sanity; harness reconciled instead). No Sanity content deleted; no destructive migration.

---

## 7. Verification output (localhost, authoritative for code)

```
tsc --noEmit ............ exit 0
eslint src scripts ..... 0 errors / 8 warnings (all pre-existing or _-prefix intentional)
npm run build .......... exit 0 · related-links PASS · 190 static pages
validate:schema ........ 22/22 · 0 errors / 0 warnings
validate:seo ........... 184 URLs + sitemap + robots · 0 errors / 0 warnings
validate:a11y .......... 20/20 · axe AA 0 · SC 2.4.11 0 · SC 2.5.8 0 · Lighthouse ≥95 (most 100, /about 97) · prefers-reduced-motion OK
test:consent ........... 23/23
test:revalidate ........ 14/14
test:rate-limit ........ 8/8 (KV subset skipped — no Upstash creds, per the memory-store guardrail)
test:wizard-autocomplete 8/8
test:photo-upload ...... 10/10
test-wizard-v1-migration PASS
test-portfolio-automation 12/12
test-servicem8-webhook . 6/6
EN+ES route sweep ...... 184 URLs all 200/PASS — zero unintended 404s
```

The `aurora-driveway-apron` route now 404s by design (removed from the harness; it is not linked from any live surface — projects render from Sanity, which has no such doc).

---

## 8. The single user handoff — Vercel Preview re-verification

Per §6, localhost verification is complete and authoritative for code. The one item that needs the user is re-running the three validation harnesses against the **Vercel Preview** build, because Preview deploys are SSO-protected and the harnesses need the project's **bypass token** in their env (which only the operator has):

```
BASE_URL=https://sunsetservices-git-<branch>-dinovlazars-projects.vercel.app \
  BYPASS_TOKEN=<vercel-protection-bypass> npm run validate:schema   (then :seo, :a11y)
```

Expect the same green results (the Preview build is the authoritative production build per the §3 note). See §9 below for the self-serve attempt status.

---

## 9. Files written / updated

- `Sunset-Services-Decisions.md` — §0 plan-of-record entry (commit `68b488e`) + the GCP-key redaction (commit `72542ab`) + the closing M.11 entry.
- `src/_project-state/Phase-M-11-Completion.md` — **this file.**
- `src/_project-state/current-state.md` — last-completed bumped to M.11; "What works (M.11)" block; open-items updated.
- `src/_project-state/file-map.md` — M.11 note.
- The code/config/i18n fixes across 31 source files in commits `1cc8e63` … `72542ab`.
