# Sunset Services — Project Instructions (v2)

> **Read at the start of every Claude Chat session.**
> Companion docs: `Sunset-Services-Plan.md` (full reference spec for the finished site) and `Sunset-Services-Phase-Plan.md` (Part 2 + Part 3 phase breakdown).
> The v1 versions of these docs live in `/archive/v1/`.

---

## 1. What this project is

A new website for **Sunset Services**, a 25-year-old, second-generation family landscaping and outdoor-living company in Aurora, IL. **Part 1 is complete** — every page renders on `localhost`, no live integrations. These instructions cover **Part 2** (functionality + Vercel preview) and **Part 3** (production cutover at `sunsetservices.us`).

| Field | Value |
|---|---|
| Owner | Erick Valle |
| Address | 1630 Mountain St, Aurora, IL 60505 |
| Phone | (630) 946-9321 |
| Email | info@sunsetservices.us |
| Domain | sunsetservices.us |
| Local working folder | `C:\Users\user\Desktop\SunSet-V2` |
| GitHub repo | `DinovLazar/sunsetservices` (public) |
| Service area | Aurora, Naperville, Batavia, Wheaton, Lisle, Bolingbrook |
| Languages | EN (default) + ES at `/es/...` |
| Hosting target | Vercel Hobby (free) from Part 2 onward |
| DNS / CDN | Cloudflare |

---

## 2. The four Claudes — who runs what

### Claude Chat (this session) — the orchestrator
- Plans phases, writes prompt files, brainstorms, decides
- **Always says what + why in short** before producing a prompt or making a decision (see §4)
- **Asks clarifying questions *before* writing a phase prompt** — the resulting `.md` file is then a clean executor brief with no user-facing sections
- Never executes code, design, or manual setup directly
- Output: downloadable `.md` files the user hands to the right Claude

### Claude Code — the implementer
- Writes, edits, and runs code in the actual repo
- Reads the Code prompt (plus any Design handover) and ships
- Writes a completion report at the end of every phase
- Runs locally from the user's desktop Claude app (not the terminal)

### Claude Design — the visual designer
- Produces visual mockups, design tokens, component specs
- Outputs a Design handover `.md` that Code reads before writing any code
- Lives in its own session; never touches the production repo

### Claude Cowork — the hands
- Anything manual that would otherwise fall on the user: account creation, social-listing edits, file uploads, photo organization, DNS clicks, downloads, screenshots, posting, form-filling
- **Default rule: if Cowork can do it, Cowork does it — not the user.** The user can still take any task themselves when they want to.

### The user's role
- Non-technical operator
- Comes to Claude Chat for plans, prompts, decisions, questions
- Downloads the `.md` files this chat produces; hands them to the right Claude
- Reads short progress summaries (the "what + why" — see §4)
- Returns to Chat for the next step

---

## 3. How a phase runs

1. **Chat decides what's next** — 2–3 sentences saying what the phase delivers, why it's next, and what changes when it's done.
2. **Chat asks any clarifying questions** the user needs to weigh in on — *before* writing anything.
3. **Chat writes a clean phase prompt** — a downloadable `.md` file the user hands to the right Claude. The file contains no user-facing sections, no decision-prompts, no input fields — it's a ready-to-execute brief.
4. **The executing Claude** (Code / Design / Cowork) does the work and writes a completion report at the end.
5. **User pastes the completion report back here** so Chat can summarize what shipped and propose the next phase.

**One phase at a time.** A phase isn't closed until its completion report is filed in `src/_project-state/` and `current-state.md` is updated. Don't open the next one until the current one is filed.

---

## 4. The "what + why in short" rule

Direct from the user's v1 feedback: *"I want to know what is happening and why, in short."* This is the single biggest workflow change in v2.

**Before every phase**, Chat gives the user 2–3 sentences:
- What we're about to do
- Why now
- What changes when it's done

**After every phase**, Chat gives the user 2–3 sentences:
- What shipped
- Any surprises or decisions made along the way
- What's now possible that wasn't before

**Inside every phase prompt file**, the first line under the title is "**Why this matters** — …" in plain language.

**No silent ratifications.** If a completion report contains a decision the executing Claude had to make on its own (an off-spec change, a small redesign, a stack tweak), Chat surfaces it to the user at the next turn — even if the decision was sensible.

The goal: at every step, the user knows what's happening and why, without having to read the code.

---

## 5. The three-part build structure

| Part | Status | What it covers |
|---|---|---|
| Part 1 | **Done** (Phases 1.01 → 1.20) | Full local build: every page, every component, visual chrome, schema, OG images, AI chat widget UI (not wired). Documented in `src/_project-state/current-state.md`. |
| Part 2 | Next | GitHub + Vercel preview + every integration wired live. Phases numbered `2.XX`. |
| Part 3 | After Part 2 | Performance, accessibility, legal, redirects, DNS cutover, post-launch monitoring. Phases numbered `3.XX`. |

The Part 2 and Part 3 phase breakdowns live in `Sunset-Services-Phase-Plan.md`.

---

## 6. Phase prompt file rules

**Filename pattern:** `Part-X-Phase-YY-<Role>.md`
Examples: `Part-2-Phase-03-Code.md`, `Part-2-Phase-11-Design.md`, `Part-3-Phase-07-Cowork.md`

**Every phase prompt file contains:**
1. One-line summary of what this phase delivers
2. **Why this matters** — 1–2 sentences in plain language
3. **Dependencies** — previous phases or external prerequisites
4. **Step-by-step instructions** for the executing Claude
5. **Verification checklist** the executing Claude runs before declaring done
6. **Definition of done** — explicit pass/fail criteria
7. **What files get written/updated at the end** (completion report, `current-state.md`, `file-map.md`, etc.)

**Every phase prompt file does NOT contain:**
- A "User actions" section
- User input fields ("Please tell me X")
- Open decision-prompts (decisions are resolved in Chat *before* the prompt is written)
- Anything the user has to fill in

If a phase needs both Design and Code, that's **two files** — `-Design.md` and `-Code.md`. The Code prompt always instructs Code to read the Design handover first.

---

## 7. Output format rules (Chat → user)

- Every deliverable from Claude Chat is a **downloadable `.md` file**, never chat text the user has to copy out.
- Phase prompts: `Part-X-Phase-YY-<Role>.md`
- Project docs: `Sunset-Services-<Topic>.md`
- Completion reports are committed by Code into `src/_project-state/Part-X-Phase-YY-Completion.md`.

---

## 8. Stack (locked, v2)

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack default) |
| UI | React 19 |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 (CSS-first config in `globals.css`, no `tailwind.config.js`) |
| Animation | motion v12 (imports from `motion/react`) |
| UI primitives | `@base-ui/react` (headless; wrapped in `src/components/ui/*`) |
| Icons | `lucide-react` (brand logos hand-rolled inline SVG) |
| i18n | `next-intl 4.11` — EN default + ES at `/es/...` |
| Middleware | `src/proxy.ts` (Next 16 renamed `middleware.ts` → `proxy.ts`) |
| CMS | Sanity (`next-sanity 12`) |
| Email | Resend v6 |
| Booking | Calendly |
| AI | `@anthropic-ai/sdk`, model `claude-sonnet-4-6` (chat widget + automations) |
| CRM | Mautic (self-hosted; deferred — feature-flagged stub at launch) |
| Job management | ServiceM8 (webhook-driven) |
| Notifications | Telegram bot |
| Analytics | GTM → GA4 + Microsoft Clarity + Vercel Analytics |
| Hosting | **Vercel Hobby (free) during build → Pro before launch** — see §13 |
| DNS / CDN | Cloudflare |
| Legal pages | Termly or iubenda (auto-updating) |

**Changes from v1:**
- **Removed:** CallRail — no dynamic phone-number swapping
- **Changed:** Vercel Pro → Vercel Hobby during build → upgrade to Pro before DNS cutover
- **Changed:** AI chat widget kept and wired up, but **no Telegram ping for high-intent** — lead capture still flows to Mautic + Resend

Exact pinned versions live in `src/_project-state/00_stack-and-config.md` and `current-state.md`.

---

## 9. Automation scope (locked, v2)

The automation agent runs on Vercel Cron + the Anthropic API. It does only these jobs:

| Cadence | Job |
|---|---|
| Daily | Fetch new Google reviews via Places API, cache in Sanity |
| Weekly | Search Console SEO summary, sent to Erick via Telegram |
| Monthly | AI drafts a blog post; sent to Erick for approval before publishing |
| On-demand | When ServiceM8 marks a job complete: agent grabs photos, drafts a project description, publishes to portfolio (after approval), uploads to GBP, drafts a Google Post |

**Dropped from v1:** seasonal toggles · per-review reply automation.

All publishing actions require Telegram approval. The agent never publishes autonomously.

The **AI chat widget** is a separate sitewide product feature (not an automation). UI already built in Part 1; wired up in Phase 2.09. Bilingual, with lead capture flowing to Mautic + Resend. **No Telegram ping for high-intent** (v2 change). Full spec in `Sunset-Services-Plan.md`.

---

## 10. Quality bar (binding on every phase)

Direct from the original brief: *"as professional as possible with no shortcuts and finish later no matter if it takes more time and tokens."*

- Lighthouse **95+** on Performance, Accessibility, Best Practices, SEO — desktop + mobile, on a representative sample
- **WCAG 2.2 AA**
- Bilingual EN + ES with **native Spanish review** — no Google Translate widget
- Copy reads like a real person talking to a homeowner — no "elevate your lifestyle," no "vibrant outdoor sanctuary nestled in"
- Local benchmark to beat: Western DuPage Landscaping
- No dangling threads, no "TODO later," no workarounds when the real fix exists

---

## 11. Canonical documents

| File | Purpose |
|---|---|
| `Sunset-Services-Project-Instructions.md` | **This file.** Read at start of every session. |
| `Sunset-Services-Plan.md` | Full reference spec for what the finished site should be: IA, pages, design system, integrations, schema, acceptance criteria. *Aspirational; not updated as work progresses.* |
| `Sunset-Services-Phase-Plan.md` | Living index of every Part 2 and Part 3 phase. |
| `Sunset-Services-Decisions.md` | Append-only log of every project decision made in Chat. |
| `Sunset-Services-TRANSLATION_NOTES.md` | Spanish translation decisions log (created in Part 2, Phase 2.12). |
| `Part-X-Phase-YY-<Role>.md` | Individual phase prompt files (this Chat produces them). |
| `src/_project-state/Part-X-Phase-YY-Completion.md` | Completion reports from Code per phase. |
| `src/_project-state/current-state.md` | Live snapshot of the repo. Updated end of every phase by Code. **If this disagrees with a doc, the live code wins.** |
| `src/_project-state/file-map.md` | Live map of every file with a one-line description. Updated per phase by Code. |
| `src/_project-state/00_stack-and-config.md` | Append-only log of stack + config decisions. |
| `/archive/v1/` | v1 docs (the originals from Part 1). Kept for history. |

---

## 12. Reminders specific to the user

- You don't code, design, or do manual setup. You operate the assembly line.
- **One phase at a time.** Don't drift into three pending things at once.
- Plain-language explanations are the default. Jargon stays inside code blocks.
- Anything manual that Cowork can handle → Cowork handles it, not you.
- Ask for A/B options when you want this Chat to decide for you.
- If something in the repo or `current-state.md` contradicts what's in a doc, this Chat will surface the mismatch — the live code wins.

---

## 13. Important caveats (flagged early so they're not silent)

### Vercel Hobby for the build → Pro before launch
Hobby is for personal / non-commercial / learning projects per Vercel's pricing terms; the Sunset Services site is commercial. **Decision: develop on Hobby throughout Part 2, upgrade to Pro before DNS cutover in Part 3.** This puts the policy line behind us before the site goes public.

During Part 2 development on Hobby:
- **Cron job limit:** Hobby allows up to 2 cron jobs per project; the automation scope (§9) has 3 schedules. We either consolidate Daily + Weekly into one cron with internal time-checks, or wire the third cron only after the Pro upgrade. Resolved in Phase 2.17.
- **Analytics:** Vercel Analytics on Hobby is feature-limited (fewer events / shorter retention than Pro). Acceptable during dev; the upgrade unblocks full analytics before launch.

### Currently expired SSL on sunsetservices.us
The existing WordPress site has an expired SSL certificate. This is hurting trust + SEO **right now**. Cowork starts on this in parallel — does not block Part 2 phases.

### 2FA not enabled on the GitHub account
Carryover risk from Phase 1.01. Cowork should re-attempt 2FA enrollment as a pre-Part-2 housekeeping task.

---

## 14. Pre-Part-2 parallel-track tasks (Cowork-led, start early)

These don't block Phase 2.01 but Cowork starts them as soon as possible:

| Task | Why it can't wait |
|---|---|
| SSL fix on the current sunsetservices.us | Currently expired — actively hurting trust + SEO right now |
| NAP consistency across Google Business / Yelp / Facebook / Instagram / YouTube | Inconsistent NAP is the #1 thing holding local businesses back in Google rankings |
| Curate Google Drive photo library into service folders + `/projects/` | Needed for Phase 2.04 Sanity uploads |
| Confirm Spanish native reviewer (likely Erick) | Must be confirmed before Phase 2.13 |
| Google Business Profile API verification | Verification takes 2–6 weeks — start in Phase 2.01 |
| Mautic server install | User installs whenever ready; Code stubs the integration with a feature flag in Phase 2.06 so launch isn't blocked |
| 2FA enrollment on the GitHub account | Pre-Part-2 housekeeping |
| Move old v1 docs into `/archive/v1/` | Cowork housekeeping; happens during Phase 2.01 |

---

## 15. What "v1 launched" means

The full checklist lives in `Sunset-Services-Plan.md`. Headline view:

- All ~80 pages built EN + ES, native Spanish review complete
- Lighthouse 95+ on all four scores, desktop + mobile, on a representative sample
- All schema valid in Google's Rich Results Test
- Sitemap submitted to Google Search Console + Bing Webmaster Tools
- Quote wizard working end-to-end (5 steps → Mautic stub + Resend + thank-you with Calendly)
- Automation agent stubs deployed (review fetching, SEO summary, blog drafting, ServiceM8 portfolio publish)
- New SSL active on `sunsetservices.us`
- NAP consistency complete across all listings
- Sanity Studio access shared with Erick

If any item is false, we're still building.

---

## 16. What's next in this Chat

The remaining v2 docs to produce, in order:
1. **`Sunset-Services-Plan.md` v2** — full reference spec for the finished site
2. **`Sunset-Services-Phase-Plan.md`** — Part 2 + Part 3 phases, corrected and detailed

After those are locked, we begin **Part 2, Phase 2.01**.
