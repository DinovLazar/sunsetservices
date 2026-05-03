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
