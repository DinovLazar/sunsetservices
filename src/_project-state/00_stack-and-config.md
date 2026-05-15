# Stack & Config Decisions

> Permanent decisions about stack, tooling, and config. Append-only.

## Locked stack (Phase 1.02)

- Next.js 16 (App Router) — Turbopack default. `proxy.ts` instead of `middleware.ts`.
- React 19.
- TypeScript 5, strict mode.
- Tailwind CSS v4 — CSS-first config in `globals.css`. NO `tailwind.config.js`.
- next-intl 4.x — `en` (default, no prefix) + `es` (prefixed). `localePrefix: 'as-needed'`.
- motion v12 — imports from `motion/react`. Never `framer-motion`.
- Sanity (next-sanity 12.x) — wired as a dependency from day one; project init in 2.03.
- Anthropic SDK — model `claude-sonnet-4-6` per Plan.
- Resend v6 — transactional email.
- ESLint 9 (flat config) + eslint-config-next 16.

## Added in Phase 1.04

- `@base-ui/react@1.4.1` — headless primitives (Dialog, Tooltip, Select, Checkbox, Radio,
  Switch, Field, Form, etc.). Replaces the placeholder `shadcn/base-nova` mention from
  the Plan; we wrap base-ui directly in `src/components/ui/*` going forward. Note: the
  npm package was renamed from `@base-ui-components/react` mid-major-zero; the canonical
  name is now `@base-ui/react`.
- `next/font/google` (built-in) wired for `Manrope` (heading, weights 400–800) and `Onest`
  (body, weights 400–700) with `subsets: ['latin', 'latin-ext']`, `display: 'swap'`,
  `variable: '--font-heading' | '--font-body'`.

## Conventions

- Source layout: everything under `src/`. Path alias `@/*` → `src/*`.
- All routable pages live under `src/app/[locale]/...` so the i18n proxy applies.
- `proxy.ts` runs on the Node.js runtime (Next 16: edge runtime is not supported in proxy).
- Locale URLs: English at `/path` (no prefix), Spanish at `/es/path`.
- Commit messages: Conventional Commits — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.

## Gotchas to remember

- Next 16 renamed `middleware.ts` → `proxy.ts`. The exported function is `proxy`, not `middleware`. (next-intl uses default export, so the function-name change is invisible to us.)
- Tailwind v4 uses `@import "tailwindcss"` and `@theme` blocks in CSS. There is no `tailwind.config.js`.
- next-intl 4.x **requires** returning `locale` from `getRequestConfig` (it was optional in v3).
- Turbopack is the default bundler for `next dev` and `next build` in Next 16. The `--turbopack` CLI flag was removed from `create-next-app` because it's the default; if a Webpack-only feature is ever needed, opt back in via Next config.
- `motion` and `framer-motion` are now the same package under different names — always import from `motion/react`.
- React 19 changes server-component params to be Promises (e.g., `params: Promise<{locale: string}>`). Always `await` them.
- The npm `name` field cannot contain capital letters. The working folder `SunSet-V2` does — so the package was scaffolded into a sibling lowercase folder (`sunset-scaffold-tmp`), then files were moved into `SunSet-V2` and the `name` field was set to `sunset-services` manually. Future scaffolders that derive name from path will hit the same wall.
- PowerShell 5.1's `New-Item` and `Move-Item` glob bracket characters (`[locale]`). Use `[System.IO.Directory]::CreateDirectory(...)` and `[System.IO.File]::Move(...)` for paths containing brackets.
- **Layout topology (Phase 1.04 deviation from handover §11):** the project has *no* root
  `src/app/layout.tsx`. The `src/app/[locale]/layout.tsx` IS the root layout — it owns
  `<html>`, `<body>`, the next/font className wiring, and the `MotionConfig` mount.
  Per Next.js 16 docs ("the root layout can be under a dynamic segment"), this is
  supported and is the canonical pattern for `next-intl` so that `<html lang>` can be
  set per-locale. Adding a separate root layout would force `lang` to be a fixed value
  at the root, hurting accessibility for the Spanish site. Documented as a deliberate
  deviation from the handover's example file tree.
- **`MotionConfig` boundary (Phase 1.04):** `MotionConfig` from `motion/react` is a
  client-only component. Importing it directly into the server `LocaleLayout` would
  force a `"use client"` boundary on the entire layout. Instead, we extract a tiny
  client wrapper at `src/components/global/motion/MotionRoot.tsx` and mount it as
  `<MotionRoot>{children}</MotionRoot>` from the server layout — keeps the server
  tree intact while still applying `reducedMotion="user"` globally.
- **`@theme` font tokens are *fallback stacks*, not the actual loaded font.** next/font
  with `variable: '--font-heading'` writes the loaded family onto `<html>` via
  className; descendants override the `:root` value defined in `@theme`. Tailwind v4
  still needs the `--font-heading` / `--font-body` declarations in `@theme` to generate
  the `font-heading` / `font-body` utilities — but their actual values at runtime come
  from the next/font className.

## Phase 2.01 — accounts provisioned (2026-05-10)

All accounts use `dinovlazar2011@gmail.com` as the login/contact email during Part 2 dev (with one documented exception — see "Operational state" below). Account contact emails migrate to `info@sunsetservices.us` as pre-launch housekeeping in Part 3.

| Service | Tier | Created | Identifier / Notes |
|---|---|---|---|
| Cloudflare | Free | 2026-05-10 | 2FA via Authenticator app. No domain added yet (Part 3 Phase 3.11). |
| Sanity | Free | 2026-05-10 | Project ID: `i3fawnrl`, dataset: `production`, org slug: `otkKa3xG9`. GitHub OAuth login. No API token yet (Phase 2.03). |
| Vercel | Hobby | 2026-05-10 | Team slug: `dinovlazars-projects`. 2FA enabled. Repo not yet connected (Phase 2.02 connects it). |
| Resend | Free | 2026-05-10 | API key `sunset-services-dev` (Sending access, All domains). Stored in `.env.local`. Domain not yet verified (Phase 2.08 — needs Cloudflare DNS). |
| Anthropic API | Build | 2026-05-10 | Spending cap lowered to $20/mo (was higher). Org ID in `.env.local`. 2FA enabled. **Off-spec: account uses a pre-existing email on a less-used inbox; alert routing risk noted.** |
| Telegram Bot | Free | 2026-05-10 | Bot `@SunSet_Services_Bot` (off-spec name; spec called for `@SunsetServicesOpsBot`). Operator chat ID `7919658849`. Token + chat ID in `.env.local`. Original token revoked + replaced after accidental chat leak. |
| GCP / Places API | **DEFERRED** | n/a | Moved to new Phase 2.13.2 per user decision (was Step 7 in Phase 2.01). |
| Business Profile API | **DEFERRED** | n/a | Moved to new Phase 2.13.2 per user decision. 2–6 week Google review clock has NOT started yet. |

## Phase 2.01 — deferred decisions

- **ServiceM8** — Sunset Services is not a customer; integration ships as feature-flagged stub (`SERVICEM8_ENABLED=false`) in Phase 2.13 + 2.17. See `Sunset-Services-Decisions.md`.
- **Mautic** — self-hosted CRM; user installs whenever ready. Phase 2.06 ships a feature-flagged stub. (Carryover from v2 Project Instructions §13.)
- **Domain DNS verification** for Resend, GSC, and (eventually) Cloudflare — deferred until we have Cloudflare DNS access (Part 3 Phase 3.11).
- **Step 7 (GCP + Places API + GBP API application)** — moved out of Phase 2.01 entirely. Becomes new Phase 2.13.2 in Part 2, just before Phase 2.14. Phase 2.14 (write to GBP) and Phase 2.16 (reviews on the site) wait on 2.13.2.

## Phase 2.01 — operational state

- **GitHub 2FA: enabled via Authenticator app** (resolved Phase 1.01 carryover). 16 recovery codes saved in 3 places: credentials file (`~/Desktop/sunset-secrets-private/sunset-credentials.txt`), email to self, plus a third location. SSH push to `git@github.com:DinovLazar/sunsetservices.git` verified still working post-2FA.
- **v1 docs archived** at `/archive/v1/`: one file moved (`Sunset-Services-Plan-old.md` → `archive/v1/Sunset-Services-Plan.md`). No v1 docs found in `src/_project-state/`.
- **`.git` folder accidentally deleted mid-session** but recovered: `git init -b main` + `git remote add origin` + `git fetch` + `git reset origin/main` (mixed reset preserved working tree). All Phase 1.20 history intact on GitHub; no commits lost.
- **17 modified files + 9 untracked discovered at session start** (pre-existing, not from this phase). Resolved: 12 code regressions reverted to GitHub Phase 1.20 state; v2 doc rewrites kept; 4 design handovers + 8 Lighthouse reports committed; duplicate root-level handovers (1.05 / 1.06) deleted; Phase 1.08 handover moved into `docs/design-handovers/`; `/.claude/` added to `.gitignore`.
- **Anthropic account uses a pre-existing email** on a less-used inbox (off-spec from `dinovlazar2011@gmail.com`). User declined both email-change and forwarding. **Risk: billing/security alerts may be missed.** If the API ever stops responding, first thing to check is that inbox.
- **Originally-leaked Telegram bot token revoked via BotFather**; replacement token in `.env.local`. Old token confirmed HTTP 401.
- **Telegram bot display name "SunSet"** vs spec's "Sunset Services Ops" — minor cosmetic deviation. Username `@SunSet_Services_Bot` cannot be changed (Telegram usernames are permanent). Display name can be updated via BotFather `/setname` if desired.

## Phase 2.01 — known v2 doc gaps (pre-existing, not caused by this phase)

- `Sunset-Services-Project-Instructions.md` (v2) lives in `src/_project-state/` but Phase 2.01 spec expects it at repo root. **Not moved in this phase** — leaving as-is until a future phase explicitly relocates it.
- `Sunset-Services-Phase-Plan.md` (v2) does NOT exist anywhere. Phase 2.01 spec expects it at repo root. **Not created in this phase** — the v2 doc rewrite work was incomplete at the start of Phase 2.01 and reconstructing the spec is out of scope here. Flag for a future doc-completion phase.
- `Sunset-Services-Plan.md` (v2) exists at BOTH repo root AND `src/_project-state/`. Duplication is benign for now but eventually one should be removed.

## Phase 2.02 — Vercel project linked + Analytics wired (2026-05-10)

**Vercel project:** `sunsetservices` (team `dinovlazars-projects`, Hobby plan)
**Project ID:** `prj_OZ7kKRwIgpqoJGlWD7YguA7qYKbX` | **Org ID:** `team_rRKMRUuOrwJk08a4BkSgNYAe`
**Production URL:** https://sunsetservices.vercel.app
**Preview URL pattern:** https://sunsetservices-git-`<branch>`-dinovlazars-projects.vercel.app
**Custom domain:** none (deferred to Phase 3.13 DNS cutover)

**Env vars configured (Production + Preview only):**

| Variable | Type | Value |
|---|---|---|
| RESEND_API_KEY | sensitive | from `.env.local` |
| ANTHROPIC_API_KEY | sensitive | from `.env.local` |
| TELEGRAM_BOT_TOKEN | sensitive | from `.env.local` (dead — refresh in Phase 2.15) |
| TELEGRAM_OPERATOR_CHAT_ID | sensitive | from `.env.local` |
| NEXT_PUBLIC_AI_CHAT_ENABLED | plain | `false` |
| AI_CHAT_ENABLED | plain | `false` |
| NEXT_PUBLIC_WIZARD_AUTOSAVE_ENABLED | plain | `true` |
| WIZARD_SUBMIT_ENABLED | plain | `false` |

Booleans were stored as `plain` (visible in dashboard) rather than the CLI default `sensitive` — small off-spec deviation, documented in `Part-2-Phase-02-Completion.md`.

**Vercel Analytics:** enabled via `@vercel/analytics@^2.0.1` in `src/app/[locale]/layout.tsx`. `<Analytics />` mounted as a sibling of `<NextIntlClientProvider>` inside `<body>`. v2.x injects the analytics script client-side (loaded via a JS chunk that requests `/_vercel/insights/script.js` on first hydration) rather than statically embedding the script tag in the HTML — different from the v1.x behavior the Phase 2.02 plan's view-source check assumed. The route `/_vercel/insights/script.js` is served by Vercel (HTTP 200, ~2.5 KB). Hobby-tier retention (~24 hours) is acceptable for dev; full retention unlocks at Phase 3.10 Pro upgrade.

**Sync new vars to Vercel going forward:**

- `vercel env add <NAME> production --value <V> --yes` works fine for production-only vars.
- For Production + Preview together, the Vercel CLI plugin emits `action_required` JSON (CLI source `commands/env/index.js:948` enforces explicit git-branch selection in non-interactive mode — even with `--yes`). The CLI has no flag to confirm "all preview branches" non-interactively. Workaround: POST directly to the REST API. Template:
  ```powershell
  $body = @{ type='sensitive'; key=$name; value=$value; target=@('production','preview') } | ConvertTo-Json -Compress
  Invoke-RestMethod -Method Post -Uri "https://api.vercel.com/v10/projects/$projectId/env?upsert=true&teamId=$teamId" -Headers @{Authorization="Bearer $token"; 'Content-Type'='application/json'} -Body $body
  ```
  Token lives at `%APPDATA%\xdg.data\com.vercel.cli\auth.json`. Project + team IDs from `.vercel/project.json`. Verify with `vercel env ls`.

## Phase 2.03 — Sanity CMS schemas + standalone Studio (2026-05-12)

- **Studio URL:** https://sunsetservices.sanity.studio (standalone, Sanity-hosted — NOT embedded in the Next.js app per user preference).
- **Studio config:** `sanity.config.ts` + `sanity.cli.ts` at repo root. `sanity.cli.ts` pre-locks `studioHost: 'sunsetservices'` and `deployment.appId: 'hza6xflhrkuygkrhketq6uhj'` so every `sanity deploy` is fully non-interactive.
- **Schemas:** 8 document types (`service`, `project`, `blogPost`, `resourceArticle`, `location`, `faq`, `review`, `team`) + 4 shared object types (`localizedString`, `localizedText`, `localizedBody`, `localizedSeo`) under `sanity/schemas/`. All use `defineType`/`defineField`/`defineArrayMember` for full TS inference. Every document has a `preview` block + field groups (`content`/`media`/`taxonomy`/`seo`/etc.). All `image` fields use `{hotspot: true}`. Conditional fields (`service.priceIncludes`, project `beforeImage`/`afterImage`/etc.) use `hidden: ({parent}) => ...` and `service.faqs`/`location.faqs`/etc. are arrays of references to the `faq` document.
- **Client:** `sanity/lib/client.ts` reads from `NEXT_PUBLIC_SANITY_PROJECT_ID` / `_DATASET` / `_API_VERSION` (default `'2024-10-01'`), `useCdn: true`, `perspective: 'published'`.
- **Image builder:** `sanity/lib/image.ts` exposes `urlFor(source)` (typed via `Parameters<typeof builder.image>[0]`).
- **Env vars added** (Vercel Production + Preview, **none in Development** — devs read from local `.env.local`):
  - `NEXT_PUBLIC_SANITY_PROJECT_ID=i3fawnrl` (plain — embedded in client bundle anyway)
  - `NEXT_PUBLIC_SANITY_DATASET=production` (plain)
  - `NEXT_PUBLIC_SANITY_API_VERSION=2024-10-01` (plain)
- **CORS origins on the Sanity project** (`npx sanity cors add ... --no-credentials`): `http://localhost:3000` (Next.js dev), `https://sunsetservices.vercel.app` (production), `https://sunsetservices.us` (eventual custom domain). The Studio dev server's `http://localhost:3333` was auto-registered by Sanity at project creation.
- **Pinned versions added in this phase:** `sanity@^5.25.0`, `@sanity/vision@^5.25.0`, `@sanity/image-url@^2.1.1`, `styled-components@^6.4.1` (Studio peer dep — required despite plan's note that "recent `sanity` versions bundle styling internally"). Existing `next-sanity@^12.4.0` from Phase 2.01 unchanged.
- **npm scripts added:** `studio:dev`, `studio:build`, `studio:deploy`. Existing `dev`/`build`/`start`/`lint` unchanged.
- **.gitignore additions:** `/dist/` and `/.sanity/` (both generated by `sanity build` / `sanity dev`; never committed).
- **Schema field-set is reduced from the TS seed shapes.** `src/data/services.ts`/`projects.ts`/etc. encode per-service structural fields (whatsIncluded items, process steps, whyUs cards, FAQ Q&As as inline objects, etc.); the Sanity schemas mirror only the *editorial* fields (title, dek, intro, hero image, FAQs as references, SEO, taxonomy) per the Phase 2.03 plan's explicit field list. Phase 2.05 reconciles by either extending the Sanity schemas or keeping structural fields in TS code.
- **Schema bodies use Portable Text** (Sanity's structured-content array) for `localizedBody.en`/`.es`. The existing TS seed (`src/data/resources.ts`, `src/data/blog.ts`) stores bodies as Markdown strings. Phase 2.05's migration path: either render via `@portabletext/react` (recommended) or `block-content-to-markdown` + the existing `marked` pipeline.
- **The Studio starts empty** — no seed content migrated from TS files into Sanity documents in Phase 2.03. Phase 2.04 uploads photos; later phases backfill text. The Next.js app continues to render from the TS seeds until Phase 2.05 swaps the reads.

## Phase 2.05 — Sanity content wired to live site (2026-05-12)

- **All dynamic content reads from Sanity at request time.** Projects (12), blog posts (5), resource articles (5), FAQs (128 across services/cities/blog/resources), reviews (6 placeholders), location/service stubs (6 + 16), team stubs (3). Total: 181 documents (158 phase-authored + 11 Sanity system docs).
- **GROQ query helpers** at `sanity/lib/queries.ts` — 14 helpers covering every Sanity-read page: `getAllProjects/getAllProjectSlugs/getProjectBySlug`, `getAllBlogPosts/getAllBlogPostSlugs/getBlogPostBySlug`, `getAllResources/getAllResourceSlugs/getResourceBySlug`, `getFaqsForService(audience, slug)/getFaqsForCity/getFaqsForAudience/getFaqsForBlog/getFaqsForResource`, `getReviewsForCity`. Every fetch sets `next.revalidate=1800`.
- **Bilingual fields return as `{en, es}` objects** (with EN-coalesced ES fallback baked in at the GROQ layer via `coalesce(field.en, "")` + `coalesce(field.es, field.en, "")`) so page-level consumers keep using the Phase 1.x `data.title[locale]` access pattern unchanged.
- **PortableText body rendering** via `@portabletext/react@^4.0.3`. Custom serializers in `src/components/content/portableTextComponents.tsx` map Sanity blocks to the same `.prose__*` class shape `renderProse()` emitted in Phase 1.18 — `src/styles/prose.css` ships unchanged. Server-safe helpers (`blockToPlainText`, `blocksToPlainText`, `countWordsInBlocks`, `extractHeadingsFromBlocks`, `extractHowToStepsFromBlocks`, `slugify`) live in `src/components/content/portableTextHelpers.ts` (no `'use client'`) so server components can call them directly. New `ProseLayoutPT` wraps PortableText with the Phase 1.18 sticky-TOC + inline-cross-link splicing layout.
- **ISR (`revalidate = 1800`)** on every Sanity-read page: `/projects`, `/projects/[slug]`, `/blog`, `/blog/[slug]`, `/resources`, `/resources/[slug]`, `/[audience]/[service]`, `/service-areas/[city]`. Detail routes also pin `dynamic = 'force-static' + dynamicParams = false` so the slugs return by `generateStaticParams()` are pre-rendered at build time and refreshed every 30 min on first request after expiry.
- **Schema additions** (re-deployed Studio via `npm run studio:deploy`):
  - `review.placeholder: boolean` — flag pre-launch testimonials so Phase 2.16 can distinguish them from real Google reviews.
  - `resourceArticle.featuredImage + featuredImageAlt + media group` — Phase 2.04 uploads real photos; until then the page falls back to placeholders.
  - `resourceArticle.crossLinkAudience + crossLinkServiceSlug` — preserve the Phase 1.18 inline ServiceCard cross-link feature.
  - `blogPost.crossLinkAudience + crossLinkServiceSlug` — off-spec addition (plan only specified resourceArticle; same fields added to blogPost too to keep the Phase 1.18 feature parity for blog posts).
  - `blogPost.featuredImage` required dropped (page falls back to `/og/fallback` placeholder until Phase 2.04).
  - `project.durationWeeks: number` — used by hero meta line + Facts table (plan didn't include this field; surfaced during page wiring).
- **Inline FAQ arrays removed** from `src/data/services.ts` (16 × ~5 FAQs ≈ 80 entries; line count 2979 → 2374) and `src/data/locations.ts` (6 × 4 = 24 entries; line count 676 → 425). `FaqItem` (services) + `LocationFaqItem` (locations) types removed. Sanity is now the single source of truth for FAQs.
- **`buildFaqPageSchema` + `buildLocationFaqSchema` retired** — orphan exports after the FAQ data move. Pages use `buildContentFaqSchema` from `@/lib/schema/article` which takes pre-projected `{q, a}` strings.
- **Pinned versions added in this phase:** `@portabletext/react@^4.0.3`, `@portabletext/block-tools@^5.1.1` (renamed package — `@sanity/block-tools` is deprecated; the new `^5` version range the plan specified is the renamed package's), `jsdom@^25.0.1`, `tsx@^4.21.0` (devDep). All four added to `package.json`.
- **Path alias `@sanity-lib/*` → `./sanity/lib/*`** added to `tsconfig.json` so source code can import from `sanity/lib/*` cleanly.
- **`SANITY_API_WRITE_TOKEN`** added to both `.env.local` (gitignored) and Vercel (Production + Preview, encrypted). Used only by `scripts/seed-sanity.mjs` and (in Phase 2.16) the automation agent.
- **Migration script `scripts/seed-sanity.mjs`** — idempotent (deterministic `_id`s + `createOrReplace`). Runs via `npx tsx scripts/seed-sanity.mjs`. Loads bilingual TS data, converts Markdown bodies to Portable Text via `marked` → `jsdom` → `@portabletext/block-tools` `htmlToBlocks`, writes 158 documents in 8 dependency-correct passes. **Loader override:** the script makes `.env.local` win over `process.env` (a stale `NEXT_PUBLIC_SANITY_PROJECT_ID` exported in the developer's shell would otherwise route writes to the wrong Sanity project).

- **Phase 2.11 ES translation script `scripts/translate-sanity-es.mjs`** — companion to `seed-sanity.mjs`. Same env loader (`.env.local` wins over `process.env`), same `SANITY_API_WRITE_TOKEN` + `NEXT_PUBLIC_SANITY_*` env requirements. Aliased as `npm run translate:sanity` (CLI args after `--`). Per-type CLI dispatch (`--type=project|faq|...`), supports `--dry-run` and `--id=<docId>`. Never touches `.en` fields — only patches `.es` localizedString / array element values. Phase 2.11 work it actually performs: 12 project documents patched, 23 FAQ documents `[TBR]` position normalized. service/location/team/review/blogPost/resourceArticle types report no-op-with-reason (EN body null on the first three; ES already populated for the last three — Phase 2.12 review queue).
- **Service `_id` convention is audience-prefixed** (`service-<audience>-<slug>`) because two services share the URL slug `snow-removal` across residential + commercial. Per-service FAQ scope tag is `service:<audience>:<slug>` for the same reason.
- **Page count at build time: 118** — matches the Phase 2.03 baseline. No regression; the new ISR routes count as static because `generateStaticParams()` returns the slugs ahead of time. Vercel preview deploy verified green (SSO-protected by default; routes return HTTP 200 from `npm run start` local smoke-test).
- **Image fields are still placeholder-driven.** Sanity stores `null` for every project `leadImage`/`gallery[].image`/`beforeImage`/`afterImage`, every `blogPost.featuredImage`, every `resourceArticle.featuredImage`. Page reads fall back to `imageMap.ts` placeholders (projects) or `/images/blog/<slug>.jpg` + `/images/resources/<slug>.jpg` paths (the Phase 1.18 convention). Phase 2.04 swaps real Sanity assets in without page-code changes.
- **Webhook-driven revalidation deferred** — every Sanity-read page is time-based ISR (`revalidate=1800`). Erick's edit → 30 min wait → live. A future phase wires `/api/revalidate` + a Sanity webhook for near-real-time propagation.

## Phase 2.06 — Quote wizard backend (2026-05-12)

- **Two new Sanity document types deployed.** `quoteLead` (durable lead capture) and `quoteLeadPartial` (Steps 1–3 abandoner breadcrumb). Schema files at `sanity/schemas/quoteLead.ts` + `sanity/schemas/quoteLeadPartial.ts`; re-exported via `sanity/schemas/index.ts`. Studio re-deployed via `npm run studio:deploy` — both types appear in the left nav at `sunsetservices.sanity.studio`.
- **Sanity write client** at `sanity/lib/write-client.ts`. `useCdn: false`, reads `SANITY_API_WRITE_TOKEN`. Server-only — `grep -rn 'write-client' src/components/` returns zero matches.
- **Two new API routes** at `src/app/api/quote/route.ts` and `src/app/api/quote/partial/route.ts`. Both pin `runtime = 'nodejs'` (Sanity write client requires Node) and `dynamic = 'force-dynamic'` (every request mutates external state). Both gated by `WIZARD_SUBMIT_ENABLED` master flag — when off, return 200 + `simulated` with no side effects.
- **Six new env vars** added to `.env.local`, `.env.local.example`, and Vercel (Production + Preview): `WIZARD_SUBMIT_ENABLED=true` (flipped from `false`), `MAUTIC_ENABLED=false`, `MAUTIC_BASE_URL=`, `MAUTIC_API_KEY=`, `RESEND_FROM_EMAIL=onboarding@resend.dev`, `RESEND_TO_EMAIL=info@sunsetservices.us`. All vars set as `plain` type; `MAUTIC_API_KEY` will need to be re-saved as `sensitive` when Erick's Mautic server is live and the real key is added.
- **`zod@^3.25.76` added** as a runtime dep (resolved from spec's `^3.23` range — `^3.25.76` is within the same major). Used by the API routes for server-side request validation. Zero client-bundle impact.
- **Honeypot anti-spam pattern.** Off-screen + `aria-hidden` + `tabIndex={-1}` input named `company_website` on Step 5. The route handler checks the raw payload's `honeypot` field BEFORE Zod runs — populated value returns silent 200 (no field-name leak in the error body). This pattern was iterated during smoke testing: the initial design put `honeypot: max(0)` inside the Zod schema, which exposed the field in the 400 error response — fixed in commit `350d417`.
- **Session-ID linkage** between abandoner breadcrumbs and full submissions. Client-side localStorage key `sunset_wizard_session_id`. Generated via `crypto.randomUUID()` with an RFC4122 v4 fallback. Cleared on successful submit. The deterministic `_id` pattern `quoteLeadPartial-<sessionId>` makes upserts idempotent on the server side without a separate query/cleanup step.
- **Mautic stub gating.** `pushFullLeadToMautic()` and `pushPartialLeadToMautic()` log a single line and return `{synced: false}` when `MAUTIC_ENABLED=false`. Flipping the flag to `true` + populating `MAUTIC_BASE_URL` and `MAUTIC_API_KEY` will switch them to the real implementation that lives inside each function's `TODO Phase 2.x` block. No call-site changes required.
- **Sanity write-first ordering.** The full-submit route writes to Sanity BEFORE calling Resend or Mautic. If Resend 422s (sandbox mode), the lead still lands in the Studio and the visitor still sees the success path. The route returns 500 (`all_sinks_failed`) only if BOTH Sanity AND Resend fail.
- **Local dev quirk: stale system env vars override `.env.local`.** This machine has `NEXT_PUBLIC_SANITY_PROJECT_ID=2cdu03uz`, `SANITY_API_WRITE_TOKEN=sk5a...`, and other vars set at the user/system level (from a different developer's project). Both `next start` and `node --env-file=.env.local` honor system env over `.env.local`. To smoke-test the Phase 2.06 routes locally against the correct `i3fawnrl` Sanity project, the server must be started with explicit env overrides: `NEXT_PUBLIC_SANITY_PROJECT_ID=i3fawnrl SANITY_API_WRITE_TOKEN=$WORKTREE_TOKEN npm run start`. Vercel deploys are unaffected (Vercel uses its own env config which Phase 2.06 populated correctly). Same workaround Phase 2.05's `seed-sanity.mjs` documented.
- **Resend sandbox mode + Phase 2.06 TO routing.** The `RESEND_API_KEY` in `.env.local` (`re_W6RbEymY_...`) IS for the correct Sunset Services Resend account (verified owner `dinovlazar2011@gmail.com`, matches Phase 2.01 docs). Sandbox mode is the constraint: until a domain is verified at Resend, the account can only send to its verified owner. Per the 2026-05-12 decision (`Sunset-Services-Decisions.md`), `RESEND_TO_EMAIL=dinovlazar2011@gmail.com` for the Phase 2.06 dev window — Phase 2.08 (domain verification + branded template + TO flip) bundles all three changes. End-to-end smoke verified: Sanity doc + Resend send both succeeded after explicit env override forced the right `RESEND_API_KEY` into the running server (a stale `re_BQr8dhss_...` value in process env from another developer's tooling was overriding `.env.local` — same class of dev-machine env pollution as the Sanity vars).

## Phase 2.07 — Calendly inline widget (2026-05-12)

- **New client component** at `src/components/calendly/CalendlyEmbed.tsx`. Renders the canonical Calendly inline widget (`<div class="calendly-inline-widget" data-url=...>` + `<script src="assets.calendly.com/assets/external/widget.js">`) on `/contact/` (cream surface, `minHeight=720`) and `/thank-you/` (white surface, `minHeight=680`).
- **Three new env vars added** — `NEXT_PUBLIC_CALENDLY_URL` (plain) + `NEXT_PUBLIC_CALENDLY_ENABLED` (plain) — on the worktree `.env.local`, parent-root `.env.local`, `.env.local.example`, and Vercel Production + Preview targets (REST upsert pattern). The URL is `calendly.com/dinovlazar2011` (the user's personal account, for testing). Swap to Erick's real Sunset Services Calendly URL is a Phase 3.12 checklist item.
- **Lazy-load pattern.** `widget.js` is injected only after the widget div approaches the viewport via `IntersectionObserver` with `rootMargin: '200px 0px'`. Idempotency check: `document.querySelector('script[src*="calendly.com/assets/external/widget.js"]')` before injection. Script tag carries a `data-sunset-calendly="true"` ownership marker so multiple `<CalendlyEmbed/>` instances don't trample each other's cleanup on unmount. Fallback for environments without `IntersectionObserver`: inject on mount.
- **Consent reuse.** Mirrors the Phase 1.20 D29 chat-widget stub — default-true. `useState<boolean>(true)` placeholder with an explanatory comment until Phase 2.11 lands the real cookie banner + shared hook.
- **`<noscript>` fallback rule.** Inside the widget container, a `<noscript>` element renders a plain `<a target="_blank" rel="noopener noreferrer">` pointing at the Calendly URL so JS-disabled visitors always have a path.
- **Static fallback card** (CTA-only row, no internal h2/sub so it doesn't duplicate the section header chrome): `tel:` button + (when URL is set) direct anchor to the Calendly URL. Triggered when `NEXT_PUBLIC_CALENDLY_ENABLED !== 'true'` OR `NEXT_PUBLIC_CALENDLY_URL` is empty OR consent is denied.
- **A11y note.** The widget `<div>` carries `role="region"` + `aria-label={t('iframeLabel')}` (without the role, Lighthouse `aria-prohibited-attr` audit fails). Verified: A11y on `/contact/` desktop returned to 97 after the role addition.
- **Testing-URL → real-URL swap convention.** Set `NEXT_PUBLIC_CALENDLY_URL=<erick-real-url>` in Vercel Production + Preview during Phase 3.12 pre-cutover QA. No code change required.
- **Plan-side oversight: SEO 60 + BP 73 on `/thank-you/` Lighthouse.** The page is noindexed by design (Phase 1.20 D14 — it renders user-supplied `firstName` from `?firstName=...`), so Lighthouse's `is-crawlable: 0` flag is structural, not a Phase 2.07 regression. Best-practices 73 is from Calendly's `widget.js` setting third-party cookies — also structural for the conversion-focused landing page where the widget loads immediately. The plan's "all 4 reports ≥95" checklist item is unachievable for `/thank-you/` because of these two structural constraints; only `/contact/` Lighthouse meets the ≥95 cutoff for A11y/BP/SEO. Documented in Phase 2.07 completion report under "Surprises and off-spec decisions".

## Phase 2.08 — Branded email templates + /api/contact + /api/newsletter + footer signup (2026-05-12)

- **Two new runtime deps.** `@react-email/components@^1.0.12` + `@react-email/render@^2.0.8` added to `package.json`. Resend's SDK takes a React element via `resend.emails.send({react: ...})` and renders it server-side; `@react-email/render` is only imported transitively by Resend (the templates use `@react-email/components` directly).
- **Email design tokens module** at `src/lib/email/tokens.ts` mirrors the `globals.css` brand palette as plain hex / px values. Email HTML cannot use CSS variables — every value must be inlined. Includes a `business.*` block hard-coding `info@sunsetservices.us` in the email footer regardless of the actual sender (visitors see the brand-correct identity even while the FROM is `onboarding@resend.dev`).
- **Email-safe font stack.** Manrope/Onest don't reliably load in Gmail / Outlook — both clients block `<link>`-loaded web fonts. The templates fall back to platform stacks (`-apple-system`, `Segoe UI`, `Helvetica Neue`, Arial) that approximate the brand visually. Custom fonts are deferred to a future polish phase.
- **Sandbox-aware routing pattern.** `src/lib/email/send.ts` exports `sendBrandedEmail({to, subject, react, intendedRecipient?})`. When `RESEND_DOMAIN_VERIFIED=false`: reroutes to `RESEND_TO_EMAIL`, prefixes subject with `[SANDBOX → <intended>]`, and clones the React element with `intendedRecipient` injected so `EmailLayout` renders a yellow banner inside the message. When `RESEND_DOMAIN_VERIFIED=true`: send goes through normally. The flip is single-env-var; zero code change. Decision rationale logged in `Sunset-Services-Decisions.md` "2026-05-12 — Phase 2.08: Resend domain verification deferred + sandbox-aware email routing introduced".
- **React Email rendering pipeline.** Templates compose `@react-email/components` primitives (`<Html>`, `<Head>`, `<Preview>`, `<Body>`, `<Container>`, `<Section>`, `<Text>`, `<Link>`, `<Hr>`, `<Heading>`). The Resend SDK renders the element server-side to a valid email HTML string before sending. The shared `EmailLayout` primitive owns the chrome (sandbox banner + brand wordmark header + body slot + NAP footer + optional unsubscribe link).
- **Three new env vars.** `RESEND_DOMAIN_VERIFIED=false` (controls the sandbox routing switch), `CONTACT_SUBMIT_ENABLED=true` (kill switch for `/api/contact`), `NEWSLETTER_SUBMIT_ENABLED=true` (kill switch for `/api/newsletter`). All three on Vercel Production + Preview targets (REST upsert) with IDs `5iaY2azg5xnUxmo3` / `UAWyBfPZX1dkSnuf` / `4hDeYuyN1KKbQ5lE`. All three plain type.
- **Two new Sanity document types.** `contactSubmission` (single name + optional email/phone + category + message + locale + sessionId + status, ordered `submittedAt desc`) and `newsletterSubscriber` (email + subscribedAt + locale + unsubscribed flag + sourcePage, async unique-email validation for Studio editor safety). Both deployed via `npm run studio:deploy`. **Important:** Sanity's async unique-email validator runs only at publish time in Studio — the `/api/newsletter` route is the authoritative duplicate guard for API writes.
- **`generateUuid()` extracted to `src/lib/sessionId.ts`** for sharing across wizard, contact, and newsletter forms. The wizard's localStorage-backed `getOrCreateSessionId` in `src/lib/quote/session.ts` now imports the helper. Contact + newsletter forms generate a fresh UUID per submit (no cross-step persistence needed).
- **Honeypot field convention.** All three forms (wizard, contact, newsletter) use the same input name `website` over the wire (mapped to the `honeypot` Zod key in payloads). Phase 2.06 originally documented `#company_website`, but the live wizard + ContactForm use `website` — Phase 2.08 standardized on the live convention. Bots that learn one form's trap fill all three, which is fine.
- **`/api/quote` refactor.** Now sends TWO branded emails — `QuoteLeadAlertEmail` to Erick AND `QuoteConfirmationEmail` to the visitor. Both routed through `sendBrandedEmail()` so sandbox mode reroutes both to the dev inbox. Phase 2.06's plaintext `sendLeadAlertEmail()` was replaced by `sendQuoteLeadAlertEmail()` (thin wrapper). The Zod schema gained `locale: z.enum(['en','es']).default('en')` so emails render in the lead's language; the wizard's `buildPayload()` was updated to forward `locale`.
- **`/api/contact` mirrors `/api/quote` architecture.** Honeypot-before-Zod, durable-first Sanity write, two branded emails (`ContactAlertEmail` + `ContactConfirmationEmail`), Mautic stub. Enforces D14 "at least one of email or phone" as a server-side guard after Zod parsing (Zod treats both as independently optional).
- **`/api/newsletter` lookup-then-create-or-patch.** Queries Sanity for an existing `newsletterSubscriber` by email. Three branches: fresh signup → create, resubscribe (existing + unsubscribed) → patch back to active + resend welcome, active duplicate → return `{status: 'already_subscribed'}` with no second email and no Sanity write. Status `already_subscribed` surfaced to the footer signup UI as a graceful inline message ("You're already on the list.").
- **Footer restructured.** The Phase 1.05 3-column grid (brand / links / newsletter-placeholder) is now 2-column (brand / links). The newsletter was lifted into a new TOP section above the grid, mounted by `<NewsletterSignup/>` (`src/components/forms/NewsletterSignup.tsx`). The component is hidden on `/request-quote/` via `usePathname()` regex — D17 conversion-surface protection. `FooterNewsletter.tsx` (Phase 1.05-J placeholder) was deleted.
- **i18n namespace decision.** Plan called for a new top-level `newsletter.*` namespace; chose to add the new keys to the existing `chrome.footer.newsletter.*` namespace instead to avoid orphaning the Phase 1.05 keys. The Phase 1.05 `placeholderNote` key is now orphan (component no longer references it); cleanup deferred to a future i18n pass.
- **EN copy refresh.** Updated `chrome.footer.newsletter.heading` ("Newsletter" → "Stay in the loop.") and `helper` ("Seasonal tips & project stories. Twice a month." → "Seasonal tips and project spotlights, once a month. No spam."). ES mirrors flagged `[TBR]`.
- **Email-template inline ES copy** lives inside each `.tsx` file as a `COPY = {en, es}` const. ES literals (preheader, lead paragraph, CTAs, sign-off) are flagged `[TBR]` for Phase 2.13 native review. The body of `QuoteLeadAlertEmail` and `ContactAlertEmail` (Erick-facing) is EN-only — Erick reads English regardless of lead locale.
- **Resend sandbox preserves Sanity durability.** Same Phase 2.06 pattern: if `sendBrandedEmail()` fails (Resend 422 / 429 / network), the call site logs `console.error` and continues. The Sanity write happened first so the lead is captured. The API returns 500 only when BOTH Sanity AND the lead-alert email fail (newsletter route is unaffected by this — fresh signup always relies on Sanity write succeeding for the doc ID).
- **Build remains green at 118 pages.** API routes don't count toward the static-page total. Two new dynamic routes registered: `/api/contact` and `/api/newsletter`. Build time and bundle size effectively unchanged.

## Phase 2.09 — AI chat backend (Anthropic SDK + SSE + lead capture) (2026-05-12)

- **Four new env vars.** `AI_CHAT_ENABLED=true` (master backend kill switch — 503 when false), `ANTHROPIC_MODEL=claude-sonnet-4-6` (snapshot-pinable without a code edit), `CHAT_DAILY_LIMIT_PER_IP=50`, `CHAT_BURST_INTERVAL_MS=2000`. All four on Vercel Production + Preview targets (REST upsert) with IDs `tXQSNzrDQhahQGDw` / `pZQ5919NuIX7uGe6` / `c8OD1NkikDWG1cde` / `B1mvzx5z7EUDRtmI`. All plain type. `NEXT_PUBLIC_AI_CHAT_ENABLED` flipped from `false` to `true` on Vercel (id `iKcdy783WIIy0dSz`) — chat bubble is now live.
- **New Sanity document type `chatLead`.** 10 fields across 3 groups (contact / transcript / meta): `name`, `email` (regex validator), `locale`, `pageContext`, `sessionId`, `capturedAt`, `triggerReason`, `status` (new/contacted/qualified/closed), `mauticSynced`, `transcriptExcerpt` (max 20 inline `{role, content, ts}` messages). Studio deployed via `npm run studio:deploy`.
- **In-memory two-tier rate limiter at `src/lib/chat/rateLimit.ts`.** Module-scoped `Map<string, BurstRecord>` + `Map<string, DailyRecord>`. Burst (1 msg / 2s) returns 429 `{reason:'burst', retryAfter:1-2}` + `Retry-After` header. Daily (50 / IP / 24h) returns 429 `{reason:'daily', retryAfter:~86400}`. Counters reset on every Vercel function cold start — **acceptable only because the preview window is SSO-protected.** MUST be replaced with Vercel KV / Upstash Redis before Phase 3.13 DNS cutover; natural swap window is Phase 3.10 (Vercel Pro upgrade unlocks generous KV limits). Decision rationale + carryover logged in `Sunset-Services-Decisions.md` "2026-05-12 — Phase 2.09 rate-limiter chosen + carryover".
- **Sanity-grounded knowledge digest pattern.** `src/lib/chat/knowledgeBase.ts` exports `buildKnowledgeDigest(locale)` — memoised per-locale at module load with a 30-min TTL (matches the site's existing ISR cadence). Each `/api/chat` POST system-prompts Claude with the digest. Composed from three new chat-specific GROQ projections in `sanity/lib/queries.ts` (`getAllServicesForChat`, `getAllLocationsForChat`, `getTopFaqsForChat`) plus the Phase 1.12 `src/data/team.ts` source-of-truth. Decision rationale logged in `Sunset-Services-Decisions.md` "2026-05-12 — Phase 2.09 knowledge-base approach + caching".
- **Anthropic prompt caching active.** Both `system` blocks (persona + KNOWLEDGE_DIGEST) carry `cache_control: { type: 'ephemeral' }`. Verified live — turn 1 of a fresh conversation reports `cache_creation_input_tokens=2290`; turn 2 within TTL reports `cache_read_input_tokens=2290`. Ephemeral cache TTL is 5 min (SDK default); for a typical 3–8 turn conversation that means the system prompt costs full price once and ~10% per subsequent turn. Per-message cost ceiling at Sonnet 4.6 pricing: ~$0.02 on miss, ~$0.005 on hit. Within the $50/month Anthropic cap given preview-traffic projections.
- **Tool-use-as-classifier pattern.** A single tool `flag_high_intent(reason: string)` is provided in every `/api/chat` request. The persona instructs the model to call it ONLY when the visitor signals readiness to transact (scheduling, contract, availability, pricing for a named project). The route waits for the SSE stream to complete, then calls `apiStream.finalMessage()` and inspects `block.type === 'tool_use'` blocks; for each `flag_high_intent` call it emits a `data: {type:'high_intent', reason}` SSE event. No second API call. Smoke tests verified: "I want to schedule a paver patio install for next month at my Naperville house" triggers; "What services do you offer in Naperville?" does NOT.
- **SSE wire format.** Every event is `data: <JSON>\n\n` (two newlines is the record terminator). Event types: `token` (incremental text), `high_intent` (relayed tool call), `done` (final usage stats), `error` (relayed SDK/model error). The client consumer (`src/lib/chat/streamClient.ts`) uses `Response.body.getReader()` rather than `EventSource` (which is GET-only) since we POST.
- **High-intent banner placement.** Per the Phase 2.09 visual spec, the banner renders between the message log and the composer (NOT between header and log). Amber-tinted (`#FDF7E8` + `border-left: 3px solid amber-700`) is allowed inside the chat panel — the page-level "one amber CTA per page" rule (D11 / D24) does NOT apply to panel chrome. Two CTAs: primary `Link href="/contact#calendly"` + ghost `Link href="/request-quote"` — both using next-intl's locale-aware Link so they preserve `/es/` prefixes.
- **Banner clearing rule.** The panel clears the high-intent banner at the START of each new outgoing turn (`runStreamingTurn` first sets `highIntent` to null). If Claude re-flags on the new turn, the banner re-appears; otherwise it stays dismissed. Manual × dismiss and CTA-click both also clear the state.
- **Chat session-ID** lives in `sessionStorage` at key `sunset_chat_session_id` (new Phase 2.09 — Phase 1.20 only stored `sunset_chat_history_<locale>`). Materialised on panel mount via `getOrCreateChatSessionId()`. Flows through `/api/chat` and `/api/chat/lead` payloads so Erick can correlate transcript → lead in Sanity. Reset clears both keys.
- **Lead-capture sandbox routing.** `/api/chat/lead` calls `sendBrandedEmail()` (Phase 2.08 utility) — inherits the same `RESEND_DOMAIN_VERIFIED=false` reroute behavior. Until Phase 3.11/3.12, every chat lead-capture email lands in `dinovlazar2011@gmail.com` with subject `[SANDBOX → info@sunsetservices.us] New chat lead — <name>` and a yellow in-body banner. Mitigated: the visitor sees the in-panel "Thanks — Erick will be in touch within one business day" confirmation regardless of email state. Sanity write is durable-first.
- **No Telegram pings on high-intent.** Per Project Instructions §9 + Phase 2.09 plan §12, Telegram lead alerts are explicitly OUT of scope for this phase. On-screen banner only. The original phase title mentioned "Telegram lead alerts" but the plan body resolves the contradiction — banner only.
- **No Markdown subset in chat output.** Per ratified D24=A, chat output stays plaintext + URL auto-link only. Carryover to a future phase if the team wants bold/lists/headings to render. The Sonnet-4.6 responses do contain Markdown-like syntax (`**Residential**`, `- bullet`) but the panel renders it as-is (no parsing); the visitor sees the literal `**`s. Future phase decision.
- **Bundle-size regression: zero.** The chat code added at this phase is all server-only (`/api/chat`, `/api/chat/lead`, system prompt, knowledge base, rate limiter) PLUS small client-side changes that live inside the existing `ChatPanel.tsx` (dynamic-imported on first bubble click). The collapsed bubble shell ceiling (≤8KB gzipped) is preserved.
- **Build remains green at 118 pages.** API routes don't count toward the static-page total. Two new dynamic routes registered: `/api/chat` and `/api/chat/lead`. The `chatLead` document type was deployed to the Sanity Studio in the same phase.

## Phase 2.10 — Analytics stack (GTM + GA4 + Microsoft Clarity + cookie consent + dataLayer bridge) (2026-05-13)

- **Four new env vars** on Vercel Production + Preview targets via REST upsert. All `plain` type because `NEXT_PUBLIC_*` is embedded in the client bundle anyway. Real values supplied by Cowork Part A in `src/_project-state/Part-2-Phase-10-Cowork-Handover.md`:
  - `NEXT_PUBLIC_GTM_ID=GTM-NL5XX4DV` (id `nCMCsddKl918a76Z`)
  - `NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-RY6NT70SH7` (id `W1sg2noqokq2ntOW`) — documentation only; GA4 connects through GTM
  - `NEXT_PUBLIC_CLARITY_PROJECT_ID=wqodtpq86q` (id `gdkiC6dAlkMYyHOE`)
  - `NEXT_PUBLIC_ANALYTICS_ENABLED=true` (id `6cFnFt7qECEiidqP`) — master kill switch
- **Cookie consent storage shape.** Single localStorage key `sunset_consent_v1` with value `'accepted'` | `'declined'` | `null` (unknown). State changes broadcast through a `sunset:consent-changed` CustomEvent on `window` so the React hook + Script components re-render. Phase 3.04 swaps this for Google Consent Mode v2 granular signals.
- **`dataLayer.push` gate order:** SSR guard (`typeof window`) → kill switch (`NEXT_PUBLIC_ANALYTICS_ENABLED === 'true'`) → consent (`getConsent() === 'accepted'`) → PII filter (strips any key in `PII_KEYS` set). Implemented in `src/lib/analytics/dataLayer.ts`.
- **`PII_KEYS` set** (13 entries, stripped before push): `name`, `email`, `phone`, `firstName`, `lastName`, `fullName`, `address`, `streetAddress`, `city`, `state`, `zipCode`, `message`. The dispatchers already never include these in payloads; the filter is the defensive guard. Verified by smoke test 10's synthetic dispatch.
- **AnalyticsBridge listens on `document`, NOT `window`.** Off-spec correction from the Phase 2.10 plan's snippet. Every existing dispatcher (Phase 1.20 / 2.06 / 2.08 / 2.09) calls `document.dispatchEvent(new CustomEvent(scope, ...))` with `bubbles: false` (default). Events on `document` don't propagate to `window` without `bubbles: true`. Logged in Decisions close-out.
- **Five CustomEvent scopes the bridge subscribes to** (all on `document`, all with `detail: {name, ...payload}`): `sunset:wizard-event`, `sunset:contact-event`, `sunset:newsletter-event`, `sunset:chat-event`, `sunset:calendly-event`. Bridge is a pure relay — `name` becomes the dataLayer event; the rest of `detail` becomes the payload (minus PII).
- **Dispatcher rename pass — wire-value changes that GTM tag plan depends on:**
  - `WIZARD_EVENTS.SUBMIT_SUCCEEDED` wire value `'wizard_submit_succeeded'` → `'quote_submit_succeeded'` (CONVERSION).
  - New `WIZARD_EVENTS.STEP_ADVANCED: 'wizard_step_advanced'` (replaces per-step `STEP_COMPLETED(n)` function on the forward-transition fire site; constant + `{step}` payload).
  - `CHAT_EVENTS.PANEL_OPENED` → `OPENED`, wire value `'chat_panel_opened'` → `'chat_opened'`.
  - New `CHAT_EVENTS.BANNER_BOOK_CLICKED: 'chat_banner_book_clicked'` + `BANNER_QUOTE_CLICKED: 'chat_banner_quote_clicked'`.
  - NewsletterSignup inline dispatcher: `'newsletter_submit_succeeded'` → `'newsletter_subscribed'` (CONVERSION); `'newsletter_submit_already_subscribed'` → `'newsletter_already_subscribed'`.
- **Calendly postMessage wiring.** `CalendlyEmbed.tsx` listens for `message` events from the Calendly iframe (no origin check; the `calendly.` prefix on `event.data.event` is the filter — Calendly serves from multiple subdomains). Three Calendly events translate to `sunset:calendly-event` CustomEvents:
  - `calendly.event_type_viewed` → `calendly_event_type_viewed`
  - `calendly.date_and_time_selected` → `calendly_date_and_time_selected`
  - `calendly.event_scheduled` → `calendly_booking_scheduled` (CONVERSION)
- **`calendly_widget_loaded` fires inside the existing IntersectionObserver `inject()` callback** — once per embed instance via a `widgetLoadedFiredRef` ref. Fires whether or not the script tag was injected this time (multiple embeds on the same page share the loaded script but each fires its own `calendly_widget_loaded` on first viewport approach).
- **GTM `<noscript>` iframe is at the top of `<body>` per Google's install guide.** Gated by env vars only (NOT consent) because `<noscript>` only activates when JS is disabled, and JS-disabled visitors can't see/dismiss the banner.
- **Calendly widget consent gate intentionally left at Phase 2.07's stub `default-true`.** Phase 2.10's cookie banner gates GTM + Clarity script load entirely, but Calendly is a booking service (separate from analytics/marketing) — visitors can always book regardless of consent. The dataLayer push from Calendly events IS consent-gated through `pushDataLayer`. Phase 3.04 GDPR review can revisit if needed.
- **GCP `.env.local.example` carryover was NOT committed by Code in Phase 2.10.** Cowork's handover flagged a 7-variable GCP block (project / Places / GBP OAuth) that the main tree's `.env.local.example` has but the worktree's doesn't. Out of scope for Phase 2.10 Code's prompt. Left for Phase 2.13.2 or a separate user commit.
- **`--z-consent: 60`** added to `src/app/globals.css` alongside the existing z-index ladder. Same numeric tier as `--z-toast: 60` (the two surfaces are rarely concurrent); strictly above `--z-chat: 50` and strictly below `--z-banner: 70` (skip link).
- **Lighthouse hold-line met.** A11y 97 / BP 96 / SEO 100 across `/` desktop+mobile + `/contact/` desktop+mobile. Performance regression vs Phase 2.09 baseline: 0 max, +1 on home both form factors (run-to-run variance).
- **Build remains green at 118 pages.** API routes unchanged (no new routes Phase 2.10). The new analytics components are small client-side scripts mounted in the root layout; bundle-size impact is minimal because GTM + Clarity scripts are loaded async via `next/script` `afterInteractive` strategy on consent.

## Phase 2.13 — ServiceM8 webhook endpoint + Sanity event queue (2026-05-14)

- **Two new env vars** on `.env.local`, `.env.local.example`, and Vercel (Production + Preview targets via REST upsert, both `plain` type):
  - `SERVICEM8_ENABLED=false` (id `FcN3rF3D6ka6bgIk`) — master kill switch; flag stays false until Erick adopts ServiceM8 (decision 2026-05-10). Flag-off branch of `/api/webhooks/servicem8` returns 200 + `{status:'simulated',reason:'feature-flag'}` without any body parse, signature check, or Sanity write.
  - `SERVICEM8_WEBHOOK_SECRET=` (id `33h1znsCQkmvNcr4`) — HMAC-SHA256 secret ServiceM8 will key webhook bodies with. Empty while flag is off; populated at flag-on time. When the value is populated, re-save with `--sensitive` so it doesn't appear in the Vercel dashboard.
- **`SERVICEM8_ENABLED` was previously a forward-looking placeholder** in the feature-flags block of `.env.local.example` with no explanation. Phase 2.13 consolidated it into the new Phase 2.13 block at the bottom with full documentation.
- **New API route at `/api/webhooks/servicem8`** registered as ƒ-Dynamic in the build output. `runtime='nodejs'` (Sanity write client requires Node) + `dynamic='force-dynamic'` (every request mutates external state — no caching).
- **Flag-on flow order** (the durability-first pattern from Phase 2.06 carries over):
  1. Read raw body via `request.text()` — NOT JSON.parse. HMAC verification needs the original wire bytes; round-tripping through JSON can rewrite keys + whitespace and break the signature.
  2. Verify `x-servicem8-signature` header against `createHmac('sha256', SERVICEM8_WEBHOOK_SECRET).update(rawBody,'utf8').digest('hex')` with `timingSafeEqual` + length-mismatch guard. Failure → 401 + `{status:'error',reason:'invalid-signature'}` with NO Sanity write.
  3. JSON.parse. Failure → 400 + `{status:'error',reason:'invalid-json'}`.
  4. Zod-validate. Failure → 400 + `{status:'error',reason:'invalid-payload'}` — Zod error tree is intentionally NOT echoed (opaque on purpose; ServiceM8 doesn't need our parse errors and surface area minimization is the priority).
  5. Persist with deterministic `_id` (`servicem8Event-<slug(eventId)>`). First send → 200 + `{status:'ok',sanityDocId}`. Replay → 200 + `{status:'ok',deduped:true,sanityDocId}`. Sanity error → opaque 500 + `{status:'error',reason:'persist-failed'}` (error logged server-side, NOT in the response body — ServiceM8 retries on 5xx, leaking internals is unsafe).
- **Signature header name + format are assumptions pending confirmation at flag-on time.** Best-known webhook convention (Stripe / GitHub / Resend variant) is `x-servicem8-signature` carrying a hex HMAC-SHA256 digest of the raw body. ServiceM8's real configuration will spell out the exact format when Erick adopts it; the swap is a one-function change in `src/lib/servicem8/verifySignature.ts`.
- **Off-spec Zod schema decision (logged in Decisions log 2026-05-14):** root schema dropped `.passthrough()` because Zod 3.25's type inference collapses known keys to `unknown` via the `flatten<T & {[k:string]:unknown}>` mapped type — `validated.data.eventId` ends up typed `unknown` and breaks at every consumer. Default Zod mode (silent-strip extras) already satisfies the plan's "not rejected" rationale; the route stores `rawBody` verbatim as `payload` so extras are preserved on disk regardless of schema mode. Inner `data: z.record(z.unknown())` stays.
- **New Sanity document type `servicem8Event`** deployed to `sunsetservices.sanity.studio` via `npm run studio:deploy`. 3 field groups (event/processing/meta). Event group: eventId, eventType, jobId, payload (raw JSON blob — Phase 2.17 reads from here), signatureValid (always true at write time; field exists for future signature-bypass admin writes if ever needed), receivedAt. Processing group: status enum (pending/processing/completed/failed/skipped, default pending), processedAt, processingError, relatedProjectId (reference to `project`), telegramApprovalState enum (not_sent/pending/approved/rejected, default not_sent). Meta group: createdAt, lastUpdatedAt. Preview shows `<eventType> — <jobId>` · `<status> · <receivedAt>`. Ordered by `receivedAt desc`.
- **Deterministic dedup pattern.** `slugifyEventId()` lowercases, trims whitespace, and replaces every non-`[a-z0-9_-]` character with `-` — defensive against ServiceM8 sending event IDs with characters Sanity rejects in `_id` (slashes, spaces, etc.). Persist helper fetches by ID first; if a doc exists, returns `{status:'duplicate',sanityDocId}` without writing. Mirrors the Phase 2.06 quoteLeadPartial upsert pattern.
- **`occurredAt` is in the Zod schema + PersistInput but NOT stored as a separate field** at this phase. The schema requires it (validation only); the value is preserved verbatim inside the `payload` blob. Phase 2.17 can index it later by reading the JSON body if useful.
- **Verification harness committed.** `scripts/test-servicem8-webhook.mjs` spawns `next start` twice (flag-off + flag-on) and runs the 6 prescribed tests in sequence. Reusable; future webhook-route changes can re-run the same battery cheaply. Run via `node scripts/test-servicem8-webhook.mjs` after `npm run build`. The script resolves the Next.js binary via `require.resolve('next/package.json')` so it works from a worktree without its own `node_modules` (Node's upward resolution finds the parent install).
- **No Telegram, Anthropic, GBP, or Places integration at this phase.** Phase 2.13 is ingest + persist only. Phase 2.17 (queue consumer) does the Anthropic drafting + Telegram approval + portfolio publish + GBP publish. Phase 2.14 (GBP publish) waits on Phase 2.13.2 (GCP credentials + GBP API approval).
- **No rate limiter on the webhook endpoint.** ServiceM8 itself won't generate enough volume to need this; if it ever does, the in-memory limiter pattern from `src/lib/chat/rateLimit.ts` is the precedent.
- **No webhook-driven Sanity ISR revalidation** from Phase 2.13's writes. Sanity-read pages use 30-min ISR (Phase 2.05 pattern) — adequate while the queue is consumer-side only (no front-end reads).
- **Build remains green.** New `/api/webhooks/servicem8` route appears as ƒ-Dynamic in the build output. No static-page count change (`/api/*` routes don't count in the static-page total).

## Phase 2.15 — Telegram bot infrastructure (2026-05-15)

- **Two new env vars** on `.env.local`, `.env.local.example`, and Vercel (Production + Preview targets via REST upsert, both `plain` type):
  - `TELEGRAM_ENABLED=false` (id `ZEYSU6TLzHrNBv59`) — master kill switch for outbound sends AND the inbound `/api/webhooks/telegram` route. Stays false until the user (a) flips it on the target environment AND (b) runs `npm run telegram:setup -- <public-url>/api/webhooks/telegram` once to register the URL with Telegram.
  - `TELEGRAM_WEBHOOK_SECRET_TOKEN=<64-hex>` (id `XKYeFYLkwzN4PnUG`) — shared secret Telegram echoes back in the `X-Telegram-Bot-Api-Secret-Token` header on every callback POST. The SAME value is passed as `secret_token` to `setWebhook`. Generated once via `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Re-generate ONLY if leakage is suspected, then re-run `npm run telegram:setup`.
- **Third env var documented as optional** in `.env.local.example` but NOT set anywhere: `TELEGRAM_API_BASE_URL`. Defaults to `https://api.telegram.org`. The verification harness (`scripts/test-telegram-bot.mjs`) overrides this to `http://127.0.0.1:7891` so automated tests never hit real Telegram. Leave unset in production + preview.
- **Phase 2.01 carryovers still apply.** `TELEGRAM_BOT_TOKEN` and `TELEGRAM_OPERATOR_CHAT_ID` are present in `.env.local` (populated Phase 2.01) but currently EMPTY on Vercel (production + preview) — surfaced during Phase 2.15 verification, NOT introduced by this phase. Must be repopulated on Vercel before `TELEGRAM_ENABLED=true` or live sends will fail. Currently `TELEGRAM_OPERATOR_CHAT_ID` points at Goran's chat ID (Phase 2.01 capture); swap to Erick's at launch handover.
- **Secret-token verification (NOT HMAC).** Telegram's webhook delivery includes the operator-supplied `secret_token` in the `X-Telegram-Bot-Api-Secret-Token` header. The route compares against `TELEGRAM_WEBHOOK_SECRET_TOKEN` using `crypto.timingSafeEqual` with a length-mismatch guard — simpler than HMAC because Telegram itself owns the secret + signing. Different from Phase 2.13's ServiceM8 HMAC pattern; both patterns coexist.
- **Single approval kind shipped: `'servicem8_portfolio'`.** The Sanity schema enum and TypeScript union include `'blog_draft'` for forward-compat with Phase 2.16, but `buildButtonsForKind('blog_draft', …)` throws and the webhook handler explicitly ignores any `'bd:'` callback that arrives. Phase 2.16 ships the runtime handler (5–10 lines).
- **`callback_data` encoding format:** `<kindShort>:<targetId>:<action>`. `kindShort` is `'sm8'` or `'bd'`. Total payload stays under Telegram's 64-byte cap for any Sanity `_id` the project uses (`<schemaName>-<slug>` patterns).
- **Idempotency on the webhook side.** Every inbound `callback_query` is matched to a `telegramApprovalLog` row by `sentMessageId`. Missing → 200 + `ignored:no-matching-log` (we never sent it). Already decided → 200 + `deduped:true` (Telegram retries on 5xx; the route returns 500 + opaque `persist-failed` on any Sanity/Telegram error during routing, so retries are guaranteed to land on the dedup branch).
- **Test routes off-spec deviation.** Plan specified `/api/_test/telegram-{notify,approval}` with a `NODE_ENV !== 'production'` gate. Implemented as `/api/test/...` with a `TELEGRAM_TEST_ROUTES_ENABLED !== 'true'` gate. Two reasons: (1) Next 16's App Router treats underscore-prefixed folders as private (NOT routed); the original path wouldn't have existed. (2) `next start` always sets NODE_ENV=production, so the harness (which uses `next start`) couldn't drive the routes through HTTP under a NODE_ENV gate. The explicit env-var flag is set ONLY by the harness; Vercel production + preview do not set it, so the routes return 404 + `{status:'forbidden'}` in those environments. Same end state: routes ship in the bundle but are dead in production. Documented in the Phase 2.15 completion report.
- **New Sanity document type `telegramApprovalLog`** deployed to `sunsetservices.sanity.studio` via `npm run studio:deploy`. Append-only audit trail; one row per outbound approval. Single `meta` group. Fields: kind enum / targetId / sentMessageId / sentChatId / sentAt / decision enum (default `'pending'`) / decidedAt / operatorChatId / rawCallbackData. Auto-generated `_id` (no deterministic-ID pattern — these are not deduped business documents). Preview `<kind> — <targetId>` with `<decision> · <sentAt>`; ordering `sentAt desc`.
- **Existing `servicem8Event` schema extended.** New optional `telegramMessageId: number` field in the Processing group, between `processedAt` and `processingError`. Reserved for Phase 2.16/2.17 callers to record the Telegram message ID alongside the event doc.
- **Production callers explicitly NOT wired.** `notifyOperator()` + `requestApproval()` exist in `src/lib/telegram/notify.ts` but no production code path calls them. A grep for `notifyOperator|requestApproval` in `src/` returns only the function definitions + the two `/api/test/*` test routes. Phase 2.16/2.17 wire the real callers (weekly SEO summary + monthly AI blog draft + on-demand ServiceM8 portfolio publish).
- **No rate limiter on the webhook endpoint.** Telegram's per-bot rate (30 msg/sec global, 1 msg/sec per chat) is well above what Phase 2.16's weekly + monthly cadence requires. Re-evaluate if Phase 2.17's on-demand traffic gets high.
- **Verification harness committed.** `scripts/test-telegram-bot.mjs` spawns a local mock Telegram API on `localhost:7891` + `next start` twice (Phase A flag-on with 8 tests, Phase B flag-off with 2 tests). All 10 tests pass; Sanity cleanup at the end leaves 0 `telegramApprovalLog` documents.
- **Build remains green at 118 pages.** Four new ƒ-Dynamic routes registered: `/api/webhooks/telegram`, `/api/test/telegram-notify`, `/api/test/telegram-approval` (plus the existing `/api/webhooks/servicem8`). No static-page count change.
