<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Sunset Services U.S. — agent guide

Bilingual marketing site (EN default at `/`, ES at `/es/...`) for **Sunset Services U.S.** (legal name **E VALLE INC**), a family landscaping / hardscape / waterproofing / snow-removal / trenchless company in Aurora, IL. Sanity-backed content, quote wizard, AI chat widget, Telegram-approved automation pipelines. **Pre-launch**: production is https://sunsetservices.vercel.app (`main` is the production branch on Vercel); the custom domain `sunsetservices.us` is **NOT live** — DNS cutover is a gated launch task. Never touch DNS.

## Stack (the non-obvious parts)

- **Next.js 16** App Router: Turbopack is the default bundler, **`src/proxy.ts` replaces `middleware.ts`**, route `params` are **Promises** (always `await`). Tailwind **v4**: CSS-first config in `src/app/globals.css` — there is **no** `tailwind.config.js`.
- **The root layout is `src/app/[locale]/layout.tsx`** — there is deliberately no `src/app/layout.tsx` (per-locale `<html lang>`). Do not add one.
- Animation: import from **`motion/react`**, never `framer-motion`. Headless UI: `@base-ui/react`; a shared `Dialog` wrapper lives at `src/components/ui/Dialog.tsx` (some components still import primitives directly).
- i18n: next-intl 4, `localePrefix: 'as-needed'`. Messages in `src/messages/{en,es}.json` — **EN/ES leaf-key parity must stay lockstep** (parity counts are recorded in phase reports).
- Sanity: project `i3fawnrl`, dataset `production`; Studio is a separate deploy at sunsetservices.sanity.studio.
- **npm** only (`package-lock.json`). No engines pin / no `.nvmrc`; this machine runs Node 26.x and it works. TypeScript strict; aliases `@/*` → `src/*`, `@sanity-lib/*` → `sanity/lib/*`.

## Commands

- `npm run dev` (port 3000) · `npm run build` (**prebuild auto-runs `validate:related-links`**) · `npm run lint`
- **No unit-test framework exists.** The QA suite is the script harnesses: `npm run validate:{schema,seo,a11y,related-links,links,mobile}` and `npm run test:{consent,revalidate,rate-limit,wizard-autocomplete,photo-upload}` (+ `npm run lighthouse`).
- Phase quality gate: `build` exit 0 + `lint` 0 errors + relevant `validate:*` green — record the results in the completion report.
- Sanity Studio: `npm run studio:dev` / `npm run studio:deploy`. Schema changes are not live until `studio:deploy` runs.
- Env restore: `vercel env pull --environment=production` (writes `.env.local`; the default development env holds only `VERCEL_OIDC_TOKEN`). Var names are documented in `.env.local.example`.

## Repo layout (where the non-obvious things live)

- `src/_project-state/` — **the project's memory**: `current-state.md` (live snapshot), `file-map.md`, `00_stack-and-config.md` (append-only stack/config log), `Sunset-Services-Project-Instructions.md` (workflow bible), ~75 `*-Completion.md` phase reports.
- `src/data/` — services / locations / projects / imageMap source of truth. `docs/design-handovers/` — design specs Code reads **before** implementing. `docs/stock-bridge/stock-image-manifest.md` — stock imagery with replace-by dates.
- Root `Sunset-Services-Decisions.md` — append-only decision log. `Sunset-Services-TRANSLATION_NOTES.md` — locked Spanish glossary + register (**usted** for legal/forms/transactional, **tú** for marketing).
- `archive/v1/`, `_m01b/` (Windows helpers), `reports/`, `dist/` — historical or build artifacts; not live guidance.

## Workflow (the phase system)

- The build is a **four-Claude assembly line** run by a non-technical operator (Goran): Chat plans and writes phase prompts, **Code implements**, Design produces handovers, Cowork does manual/browser tasks. Read `src/_project-state/Sunset-Services-Project-Instructions.md` at session start.
- **One phase at a time. A phase is not closed** until its completion report is filed in `src/_project-state/` AND `current-state.md` + `file-map.md` are updated.
- **No silent ratifications:** any decision you make on your own (off-spec change, small redesign, stack tweak) must be surfaced in the completion report.
- Durable decisions are **appended** to `Sunset-Services-Decisions.md` — never rewrite old entries.
- Branch per phase (`phase/*`, `feat/*`, `fix/*`, `chore/*`, `docs/*`, `qa/*`, `polish/*`), **Conventional Commits** (`feat:` / `fix:` / `chore:` / `docs:` / `refactor:`), push, open a PR — **the operator verifies on Vercel Preview and merges**. Do not merge to `main` yourself unless the operator directs it.
- **Precedence: live code > state docs > plan docs.** If `current-state.md` disagrees with the code, the code wins — state docs can lag by a phase.

## Hard constraints / security

- **The GitHub repo is PUBLIC** (`DinovLazar/sunsetservices`). Never commit secrets — the Places API key was committed once (redacted on-branch; rotation via the operator is mandatory), and a Telegram bot token that leaked in chat had to be revoked. Real keys live only in gitignored `.env.local` and Vercel env vars.
- **Fabrication-free copy:** no invented ratings, install counts, awards, or testimonials — ever. Facts come only from Erick-confirmed answers (`Phase-P-Launch-Runway-Completion.md`) or live Sanity content.
- Brand: **"Sunset Services U.S."** on formal/structured surfaces (JSON-LD, OG, legal, email); conversational "Sunset Services" in body copy.
- `vercel.json` crons: the Vercel **Hobby 2-cron budget is full** — a new cron is a plan decision, not a code change.
- robots/noindex is gated off-production via `VERCEL_ENV` (`isProductionDeploy()`); never hardcode index/noindex.

## Gotchas

- **All project docs assume Windows; this machine is macOS** at `/Users/lazar/Projects/SunSet-V2`. Ignore `C:\...` paths, PowerShell workarounds, and the `_m01b/` .bat/.ps1 helpers — translate, don't follow.
- `validate:seo` can flag blog/project routes locally against stale local Sanity data — the same run is clean on Vercel Preview.
- The Turbopack dev cache can keep serving a malformed Tailwind class even after `rm -rf .next`; production builds are unaffected.
- `README.md` is stock create-next-app boilerplate — ignore its instructions (real routes live under `src/app/[locale]/`).
- `Sunset-Services-Phase-Plan.md` is referenced throughout the instructions doc but **does not exist in the repo**; the continuation plan is `Sunset-Services-Phase-Plan-Continuation.md`. `Sunset-Services-Plan.md` is the *aspirational* spec (duplicated at root and in `src/_project-state/`) — not current state.

## Canonical docs (read in this order)

1. `src/_project-state/Sunset-Services-Project-Instructions.md` — workflow bible
2. `src/_project-state/current-state.md` — where the project actually is
3. `src/_project-state/file-map.md` + `src/_project-state/00_stack-and-config.md`
4. `Sunset-Services-Decisions.md` — why things are the way they are
