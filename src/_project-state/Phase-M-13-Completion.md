# Phase M.13 — Repo Setup on New PC — Completion

**Date:** 2026-06-19
**Outcome:** ✅ Done. Repo runs locally — dev server serves the site, production build passes, env restored from Vercel, Git authenticated for pushing. Ready to execute M.14.

> **Important deviation from the phase brief:** the brief was written for a **Windows / PowerShell** PC with target `C:\Users\user\Desktop\SunSet-V2`. The actual machine this ran on is **macOS (Darwin 27.0.0, arm64, zsh)**. All Windows-specific steps (`winget`, `C:\...` paths) were N/A. Clone location was set to `~/Projects/SunSet-V2` (confirmed with operator), alongside the existing `dalibor-web` repo.

---

## Tool versions (Step 0 — all already installed, nothing needed installing)

| Tool | Version |
|------|---------|
| node | v26.3.0 |
| npm | 11.16.0 |
| git | 2.54.0 (Apple Git-156) |
| gh | 2.95.0 |
| vercel | 54.14.2 |

OS: macOS Darwin 27.0.0, arm64 (Apple Silicon).

## Repo

- Cloned to `~/Projects/SunSet-V2` from `https://github.com/DinovLazar/sunsetservices.git`.
- Branch: `main`, tracking `origin/main`, **clean working tree**.
- No `engines` pin and no `.nvmrc` → Node 26 is fine. Next **16.2.4** / React **19.2.4**.

## Git / GitHub auth

- `gh` authenticated as **DinovLazar** (keyring), HTTPS, scopes `gist, read:org, repo, workflow` → **pushing fixes will work**. No 2FA block surfaced.
- Local commit identity set: `user.name=DinovLazar`, `user.email=prodesign019@gmail.com`.

## Dependencies

- `npm install` → added 1452 packages in ~31s, **no unresolved errors**.
- Advisory only: 41 npm-audit vulnerabilities (2 low / 34 moderate / 5 high). **Not** auto-fixed (`--force` avoided per brief).
- npm 11 skipped install scripts for 7 native packages (`sharp`, `esbuild`, `@swc/core`, `fsevents` ×2, `@parcel/watcher`, `unrs-resolver`). **Verified non-blocking** — the platform binaries are present via optional deps (`@esbuild/darwin-arm64`, `swc.darwin-arm64.node` present; `require('sharp')` loads OK; build + dev both succeed). No `npm approve-scripts` was needed.

## Environment variables (Step 5 — restored from Vercel, not via chat)

- `vercel` authed as `dinovlazar`. Linked repo to project **`sunsetservices`** (`dinovlazars-projects/sunsetservices`).
- `vercel env pull --environment=production` → **70 variables** written to gitignored `.env.local`. (The default `development` environment had only `VERCEL_OIDC_TOKEN`; the real secrets live in **production**.)
- `.env.local` confirmed gitignored.

**Vars present in `.env.local.example` but NOT in the pulled production env (7) — all covered or optional, none block dev/build:**

| Var | Status |
|-----|--------|
| `SANITY_DATASET` | Covered by `NEXT_PUBLIC_SANITY_DATASET` (what the app reads) |
| `SANITY_PROJECT_ID` | Covered by `NEXT_PUBLIC_SANITY_PROJECT_ID` |
| `ANTHROPIC_ORG_ID` | Optional; `ANTHROPIC_API_KEY` present |
| `GBP_OAUTH_CLIENT_SECRET` | Google Business Profile publishing — only `GBP_OAUTH_CLIENT_ID` present. Needed only if GBP publish feature is used. |
| `GBP_OAUTH_REFRESH_TOKEN` | Same as above |
| `REVALIDATE_TEST_ROUTES_ENABLED` | Feature flag, defaults off |
| `WIZARD_PHOTO_UPLOAD_ENABLED` | Feature flag, defaults off |

> If GBP portfolio auto-publish needs to be exercised locally, add `GBP_OAUTH_CLIENT_SECRET` + `GBP_OAUTH_REFRESH_TOKEN` to the Vercel production env (or `.env.local` directly). Not required for M.14 unless that feature is in scope.

## Run (Step 7)

- `npm run dev` → ✅ Next.js 16.2.4 (Turbopack), **Ready in 257ms** on `http://localhost:3000`, reading `.env.local`. Homepage `/en` returns **HTTP 200** with real `<title>Sunset Services — Aurora & Naperville Landscaping & Hardscape</title>`. Root `/` resolves 200. Dev server stopped after verification.
- `npm run build` → ✅ clean production build (incl. `prebuild` → `validate:related-links`). Full route tree generated: static (`○`), SSG (`●`, e.g. 44 `service-areas/[city]` paths), and dynamic (`ƒ`) API/OG routes. No errors.

## Orientation / drift (Step 6)

- Read `src/_project-state/current-state.md`, `file-map.md`, `Sunset-Services-Decisions.md`.
- `current-state.md` last completed **code** phase: **B.03e** (hard-coded English legal pages; Termly removed). M.13 is an env-bootstrap phase and isn't tracked there — expected, no drift.
- **No drift** between live code and expectations for the env layer. Repo config itself is unchanged; only the dev machine changed (Windows → macOS).
- Noted carryover for QA work: the known **stale-local-Sanity SEO red herring** (`validate:seo` flags blog/project routes locally; clean on Preview, per M.11c-E1).

## current-state.md update

Not updated — the repo's own environment/config did not materially change (same `engines`-free Node story, same deps, same env keys). The only change is the dev host (Windows→macOS), which is captured here in the completion file rather than the repo's live snapshot.

---

### Verification checklist
- [x] `node`, `npm`, `git`, `gh`, `vercel` all report versions.
- [x] Repo cloned to `~/Projects/SunSet-V2` (macOS equiv. of brief's Windows path), on `main`, clean working tree.
- [x] `npm install` completed with no unresolved errors.
- [x] `.env.local` populated via `vercel env pull` (70 vars); 7 missing template vars reported above (all covered/optional).
- [x] `npm run dev` serves the site locally (port 3000); homepage renders (200 + title).
- [x] `npm run build` completes successfully.
- [x] Canonical docs + `current-state.md` present and read.
