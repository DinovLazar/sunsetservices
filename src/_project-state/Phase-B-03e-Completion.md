# Phase B.03e (Code) — Completion Report

**Hard-coded English Privacy Policy + Terms of Service; Termly removed.**

- **Date:** 2026-06-02
- **Branch:** `phase/b03e-legal-hardcode` (off local `main@aed2ae8`, the M.11c merge — the stale `phase/m11c-mobile-sweep` checkout was already merged into `main`)
- **First commit (decision-first convention):** `605c897` — `Sunset-Services-Decisions.md` B.03e entry, committed before any code change
- **Reverses:** the B.03d "iframe path locked" decision, per explicit operator direction

---

## One-line summary

The Termly-hosted legal embed is gone. `/privacy/`, `/es/privacy/`, `/terms/`, `/es/terms/` now render self-contained, hard-coded **English-only** Privacy Policy + Terms of Service inside the existing brand chrome (cream hero + breadcrumb + `.legal-doc` prose body, wrapped in `lang="en"` with a localized English-only note). The Termly component, script, a11y workaround, env vars, ids file, and orphan i18n keys are all removed. The cookie-consent banner + Google Consent Mode v2 are untouched.

---

## Definition of Done — status

| Item | Status |
| --- | --- |
| All four legal routes render hard-coded English text (EN + ES) | ✅ verified (HTTP 200 + content asserted on all four) |
| No Termly iframe / no `app.termly.io` request / no fallback card | ✅ verified (network log: zero termly requests) |
| `grep -rn src/` zero for `TermlyPolicyEmbed`, `app.termly.io`, `embed-policy.min.js`, `NEXT_PUBLIC_TERMLY_` | ✅ |
| Routes `/privacy/` + `/terms/` preserved; pages indexable; sitemap unchanged | ✅ |
| Cookie-consent banner + Consent Mode v2 intact, still link `/privacy/` | ✅ (`test:consent` 23/23) |
| Body wrapped in `lang="en"`; chrome localizes; `legal.englishOnlyNote` shows per locale | ✅ |
| Effective Date + Last Updated = execution date (June 2, 2026), top of both docs + hero | ✅ |
| Termly removed from `.env.local` + `.env.local.example` + `.termly-ids.txt` + `.gitignore` | ✅ |
| Termly removed from Vercel (Production + Preview) | ⏳ **PENDING — blocked on a valid Vercel token** (see Outstanding items) |
| `npm run build` passes | ✅ exit 0 (legal routes prerendered SSG) |
| `validate:schema` 0 · `validate:a11y` 0 | ✅ both exit 0 (legal routes PASS) |
| `validate:seo` 0 | ⚠️ exit 1 on **localhost** — all 18 errors are the known stale-local-Sanity-cache blog/project red herring (M.11c-E1); the **legal routes PASS**. Authoritative on Vercel Preview = 0/0 (pending deploy) |
| `tsc --noEmit` clean · `lint` no new errors | ✅ (`tsc` 0; scoped `eslint` 0 problems) |
| Harnesses green on Vercel Preview | ⏳ **PENDING** push + deploy + protection-bypass token |
| Decisions / current-state / file-map / Completion docs updated | ✅ |

---

## What shipped (by step)

1. **Decisions log first.** Appended the dated B.03e entry to `Sunset-Services-Decisions.md` (B.03e-D1…D6) and committed it (`605c897`) before touching code.
2. **Content modules.** `src/content/legal/privacy.tsx` + `terms.tsx`, each exporting `title`, `effectiveDate`, `lastUpdated` (all `June 2, 2026`) and a `Body` server component. The full document text from the brief is pasted verbatim; both `[INSERT DATE]` tokens → `June 2, 2026`.
3. **Body chrome.** `LegalPageBody` repurposed to take `englishOnlyNote` + `children`, rendering a cream `.legal-doc` card (mirrors M.10 accessibility) with the localized note above a `<div lang="en">`.
4. **Pages + hero + i18n.** `privacy/page.tsx` + `terms/page.tsx` import the content module, pass `lastUpdated` to the hero and `legal.englishOnlyNote` to the body. `LegalPageHero` gained a `lastUpdated` prop → `t('lastUpdated', {date})`. Added `legal.englishOnlyNote` (EN/ES), removed the `legal.embed.*` block, made `legal.{privacy,terms}.hero.lastUpdated` an ICU `{date}` template.
5. **Termly code deleted.** `TermlyPolicyEmbed.tsx` removed; `.termly-embed-wrap` CSS replaced with the `.legal-doc` block in `globals.css`.
6. **Env vars.** Stripped the 5 `NEXT_PUBLIC_TERMLY_*` from `.env.local` + `.env.local.example`; deleted `.termly-ids.txt` + its `.gitignore` line. (Vercel-side removal pending — see Outstanding.)
7. **Link verification.** Consent banner → `/privacy/`, wizard consent → `/privacy/` + `/terms/`, footer legal links — all resolve to the new hard-coded pages. Chat widget has no privacy link. `test:consent` 23/23.
8. **Close-out docs.** This report + `current-state.md` + `file-map.md` updated.

---

## Verification evidence (localhost, production build via `next start`)

- **Content (curl, all four routes):** HTTP 200; real legal text present; zero `app.termly.io` / `embed-policy` / `termly-embed` / "being prepared"; `lang="en"` wrapper present; `June 2, 2026` present; EN note "This document is provided in English only." / ES note "Este documento está disponible únicamente en inglés."; hero "Last updated: June 2, 2026" (EN) / "Última actualización: June 2, 2026" (ES); ES breadcrumb localized.
- **Browser load (`/privacy`):** network log = zero termly requests (only `localhost` + the `w3.org` SVG xmlns string); DOM check = exactly one `<h1>` ("Privacy policy", the hero), `article.legal-doc div[lang="en"]` present, `legal-doc__note` present, first body `<h2>` = "1. Information We Collect", `h3count` = 0 (clean H1→H2 hierarchy).
- **Harnesses:** `validate:schema` 0/0 (22 URLs; `/privacy/` + `/terms/` PASS, 3 blocks each). `validate:a11y` 0/0 (20 URLs; `/privacy` + `/accessibility` PASS, axe AA 0, Lighthouse 100). `validate:seo` legal routes all PASS (see red-herring note).
- **Static:** `build` exit 0; `tsc --noEmit` 0 errors; scoped `eslint` on the changed files = 0 problems.

### `validate:seo` localhost exit 1 — stale-local-Sanity red herring (NOT B.03e)

The 18 errors are all blog/project 404s for the exact slugs M.11c-E1 already diagnosed (`backyard-drainage-aurora`, `hoa-landscape-budget-2026`, `why-is-my-lawn-yellow`, `aurora-driveway-apron`). The local `next build` served a stale Sanity snapshot (5 blog posts prerendered, harness expects 8). The legal routes I changed all PASS. **Per the M.11c-E1 lesson, the harness was NOT reconciled** — the Vercel Preview (fresh prod content) resolves it to 0/0. No site/content/Sanity change in this phase.

---

## In-phase off-spec decisions

1. **Prose typography via a namespaced `.legal-doc` global block, not the `.prose__*` classes.** The brief says "the `.prose__*` typography," but `src/styles/prose.css` is route-group-scoped (imported only by the blog/`[slug]` + resources/`[slug]` layouts) and is **not** loaded on the legal routes — which is exactly why the M.10 accessibility page (the brief's designated template) styles its prose inline rather than with `.prose__*`. To keep the content modules clean semantic JSX while delivering the M.10 token treatment, I added a small `.legal-doc` element-selector block to `globals.css` reusing the same design tokens (and the M.11c `overflow-wrap` hardening). Same visual result as `.prose__*`, no new route-scoped-CSS coupling.
2. **No document-title `<h1>` in the body.** The "PRIVACY POLICY" / "TERMS OF SERVICE" title line is the page `<h1>` (supplied by `LegalPageHero` from the `legal.<type>.hero.h1` i18n). The body starts at the Effective/Last-Updated line, so there is exactly one H1 per page (clean H1→H2 hierarchy; `validate:a11y` confirms). The `title` field is still exported by each module.
3. **Text rendered as `{`…`}` string-expression children.** Keeps straight quotes/apostrophes byte-for-byte verbatim while sidestepping `react/no-unescaped-entities` (which `eslint-config-next/core-web-vitals` enforces). The rendered DOM is still real `<h2>`/`<p>`/`<strong>` elements.
4. **Accessibility statement corrected (cross-impact of removing Termly).** `accessibility.body.knownLimitations` listed "The Termly-hosted privacy policy iframe" as a known a11y limitation — false once Termly is gone. Dropped that item (EN + ES) + its `<li>` in `accessibility/page.tsx`; Calendly remains the listed third-party-embed limitation. This is a direct factual consequence of the phase, not a redesign.
5. **Meta title left as the existing value.** `generateMetadata` still produces the existing `legal.<type>.meta.title` — "Privacy policy · Sunset Services" / "Terms of service · Sunset Services". The brief's parenthetical ("Privacy Policy | Sunset Services") differs in case + separator, but the brief's directive is "**Keep** generateMetadata producing the **existing** legal.* meta," so the existing B.03 values were preserved (not rewritten).
6. **Branched off `main`.** The session opened on `phase/m11c-mobile-sweep`, which is an ancestor of `main` (M.11c already merged). B.03e was branched from `main@aed2ae8` so it builds on the latest integrated state.

---

## Outstanding items (require operator / valid credentials)

> **LANDED 2026-06-02 (post-merge update):** items 2 + 3 below are now **done** — the operator chose "push + merge to main." The branch was merged to `main` via fast-forward (`origin/main` → `405ba05`), non-destructively integrating a concurrent M.11c commit (`f99dbdf`) that had landed on `main` mid-phase. Production deploy `dpl_F6aQ…` went green and all four legal routes were smoke-tested **live in production** (200, hard-coded text, no `app.termly.io`, `lang="en"`, dates, localized note). See the "Execution close" block in `Sunset-Services-Decisions.md`. **Only item 1 (Vercel env-var removal) remains — deferred per operator (vars are inert).**

1. **Remove the 5 `NEXT_PUBLIC_TERMLY_*` env vars from Vercel (Production + Preview).** Blocked: the local Vercel CLI token (`%APPDATA%\xdg.data\com.vercel.cli\auth.json`) returns `403 invalidToken`, and the connected Vercel MCP exposes no env CRUD. The vars are **inert** post-B.03e (no code reads them), so the live site is correct without removing them — this is hygiene per the Definition of Done. To remove once a valid token is available (project `prj_OZ7kKRwIgpqoJGlWD7YguA7qYKbX`, team `team_rRKMRUuOrwJk08a4BkSgNYAe`):
   - Re-auth (`vercel login`) or supply a token, then `GET https://api.vercel.com/v10/projects/<projectId>/env?teamId=<orgId>`, find the 5 `NEXT_PUBLIC_TERMLY_*` ids, and `DELETE …/env/<id>?teamId=<orgId>` each. (Or remove them in the Vercel dashboard → Settings → Environment Variables.)
2. **Push the branch + Vercel Preview verification.** Not pushed yet. After push, the Preview deploy should be checked with the three harnesses pointed at the Preview URL (`BASE_URL=<preview> BYPASS_TOKEN=<protection-bypass> npm run validate:seo|schema|a11y`). `validate:seo` will be **0/0** on the Preview (fresh prod content resolves the stale-local-Sanity blog/project 404s).
3. **Merge to `main`** after Preview is green.

---

## Files

- **New:** `src/content/legal/privacy.tsx`, `src/content/legal/terms.tsx`, `src/_project-state/Phase-B-03e-Completion.md`
- **Modified:** `src/app/[locale]/privacy/page.tsx`, `src/app/[locale]/terms/page.tsx`, `src/app/[locale]/accessibility/page.tsx`, `src/components/legal/LegalPageBody.tsx`, `src/components/legal/LegalPageHero.tsx`, `src/app/globals.css`, `src/messages/en.json`, `src/messages/es.json`, `.env.local.example`, `.gitignore`, `Sunset-Services-Decisions.md`, `src/_project-state/current-state.md`, `src/_project-state/file-map.md`
- **Deleted:** `src/components/legal/TermlyPolicyEmbed.tsx`, `.termly-ids.txt`
- **Local-only (gitignored, not committed):** `.env.local` (Termly block stripped), `.claude/launch.json` (added a `next-start` config for verification)
