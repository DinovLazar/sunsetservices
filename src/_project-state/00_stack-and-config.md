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
