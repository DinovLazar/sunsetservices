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
