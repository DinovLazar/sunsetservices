# Ad-hoc · Sitewide 404 page · Code — Completion Report
**Date:** 2026-08-18 · **Outcome (one line):** unmatched URLs now land on a branded, bilingual 404 inside the real site chrome instead of Next's bare built-in error page.

> **No phase prompt exists for this work.** It was an operator request in chat ("make a 404 page", then "commit and push straight to main"), not a slot on the phase plan. §2 below therefore restates the *implicit* Definition of Done rather than copying one from a prompt — flagged so nobody later mistakes this for a planned phase.

## 1. What shipped (plain language)

Before this, typing a wrong address on the site — a mistyped page, an old link from somewhere — showed a blank white page with small black text reading "404 This page could not be found." No logo, no menu, no way back, and no Spanish. Now visitors get a proper Sunset Services page: an apology headline, buttons back to the homepage and the quote form, a grid of nine links to the main parts of the site, and a "still can't find it?" section with a tappable phone number. It works in both English and Spanish, and picks the right language automatically.

## 2. Definition of Done (implicit — reconstructed from the request)

- ✅ **A branded 404 exists and renders sitewide** — evidence: screenshots of `/nonexistent-page` (EN) and `/es/pagina-inexistente` (ES) taken against a production build on `localhost:3111`; full Navbar + Footer + consent banner + chat bubble present.
- ✅ **Real HTTP 404 status, not a soft 200** — evidence: `curl -o /dev/null -w '%{http_code}'` returns `404` for all five trigger paths: `/nonexistent-page`, `/es/pagina-inexistente`, `/a/b/c/d`, `/landscape/not-a-service`, `/es/landscape/no-existe`.
- ✅ **Bilingual, correct register** — evidence: EN and ES copy verified in the rendered page; ES uses `usted` per the locked tone map in `Sunset-Services-TRANSLATION_NOTES.md`, which names the 404 page explicitly.
- ✅ **EN/ES leaf-key parity holds** — evidence: leaf-count script reports `EN 1416 / ES 1416`, symmetric difference empty, re-run *after* the rebase onto the Polish-02b copy edits.
- ✅ **Build green** — evidence: clean `rm -rf .next && npm run build` exit 0; re-run exit 0 on the rebased base. `/[locale]/[...rest]` registered as ƒ-Dynamic in the route table.
- ✅ **Typecheck + lint clean on the new files** — evidence: `npx tsc --noEmit` exit 0, zero output; `npx eslint` on both new files exit 0, zero findings. (Repo-wide `npm run lint` still reports 1224 pre-existing errors, the bulk from ESLint walking `.claude/worktrees/` — untouched here, see §7.)
- ✅ **Every link on the page resolves** — evidence: all 24 link targets (12 EN + 12 ES) return 200; verified no target 308-redirects.
- ⚠️ **Server-rendered HTML** — the 404 markup is delivered in the RSC flight payload and only materializes after client hydration; the served shell is `<html id="__next_error__">` with no `lang` attribute. **Pre-existing and not introduced here** — the already-shipped `blog/[slug]` and `resources/[slug]` 404s behave identically. See §3 decision 2 and §7.

## 3. Decisions I made during this phase

1. **Placed the 404 at `src/app/[locale]/not-found.tsx`, not `src/app/not-found.tsx`.** · A root `not-found.tsx` requires a root `src/app/layout.tsx` to supply `<html>`/`<body>`, and `AGENTS.md` forbids adding one (the per-locale `<html lang>` is why the root layout lives at `[locale]/layout.tsx`). Putting it inside the locale segment also gets real chrome and working translations for free. · _Alternative rejected: add a root layout — directly against a standing repo constraint._ · **Decision-log entry: YES (filed).**

2. **Added `src/app/[locale]/[...rest]/page.tsx` rather than enabling `experimental.globalNotFound`.** · Per the Next 16 docs, only a *root* `not-found` catches URLs matching no route, which this repo cannot have; the catch-all funnels unmatched deep paths into the branded page instead. Next's own docs name "root layout defined using top-level dynamic segments" as the case `global-not-found.js` exists for — which is exactly this repo — but that route bypasses the layout entirely (no Navbar/Footer/chat, manual `globals.css` + font imports), is still flagged experimental, and would need to coexist with `not-found.tsx` for segment-level `notFound()` calls. Enabling an experimental Next flag and standing up a second parallel 404 implementation is a plan decision, not a code tweak. · _Alternative rejected: `global-not-found.tsx` + `experimental.globalNotFound: true` — would fix the `__next_error__`/`lang` gap in §2, at the cost of the chrome, an experimental flag, and a duplicate implementation. Left on the table for the operator._ · **Decision-log entry: YES (filed).**

3. **Internal links carry no trailing slash.** · The two existing scoped 404s and the QA page use `/projects/`-style hrefs, but every one of those 308-redirects under the repo's default `trailingSlash: false`; the actual sitewide convention in rendered output is unslashed. Matching the live convention avoids a redirect hop on every link. · _Alternative rejected: match the neighbouring 404 files for local consistency — would have shipped nine known-redirecting links._ · **Decision-log entry: YES (filed).** Note this makes the new file *inconsistent with its two siblings*; retrofitting them was out of scope for the request.

4. **Card labels reuse `division.<slug>.label` and `chrome.nav.*` instead of new `notFound.*` keys.** · One source of truth per string and a smaller EN/ES parity surface — 10 new leaf keys instead of ~19. · _Alternative rejected: self-contained `notFound.*` labels — more parity surface, and division renames would then need two edits._ · Decision-log entry: no (internal i18n hygiene, no downstream consequence).

5. **ES register is `usted`.** · Not actually my call — `Sunset-Services-TRANSLATION_NOTES.md` §"Tone map — locked" lists "404 page" explicitly under `usted`. Recorded here only so the choice is auditable. · Decision-log entry: no (executing an existing ratified rule).

6. **No `metadata` export on the 404.** · Next only honours `metadata` on `global-not-found`, so the tab title falls back to the layout default (`Sunset Services U.S.`). Next auto-injects `<meta name="robots" content="noindex">` on 404 responses — verified present. · Decision-log entry: no.

## 4. Deviations from the brief / spec

The request was three words ("make a 404 page"), so there was no spec to deviate from. Two things I deliberately did **not** do, both out of scope:

- Did not retrofit the trailing-slash fix onto `blog/[slug]/not-found.tsx`, `resources/[slug]/not-found.tsx`, or `qa/page.tsx`, which keep their redirecting links.
- Did not touch the pre-existing repo-wide lint failures or the `.claude/worktrees/` ESLint scope problem (branch `chore/eslint-ignore-claude-worktrees` already exists for that).

## 5. Changed files / deliverables

**Commit:** `638f96f` — `feat(404): bilingual sitewide 404 page`, pushed **directly to `main`** on the operator's explicit instruction ("commit and push straight to main"), no PR and no Vercel Preview gate. Precedent: the same direct-to-main call was made at `a6986e6` and `c5460ea`.

New:
- `src/app/[locale]/not-found.tsx` — the 404 itself; three sections (cream hero → white "Popular pages" 9-card grid → cream help band with `tel:` link).
- `src/app/[locale]/[...rest]/page.tsx` — catch-all that calls `notFound()`; renders nothing.

Edited:
- `src/messages/en.json` + `src/messages/es.json` — new `notFound` namespace, 10 leaf keys each, appended at the tail.

Rebase note: the commit was rebased onto `origin/main` @ `c5460ea` before pushing (local `main` was 8 commits behind — the Polish-02b copy leftovers + the schema offer-url fix had landed mid-session). Both message catalogs were touched on both sides; the rebase was conflict-free (my keys append at the tail, theirs are mid-file value edits), and parity + build + runtime were **re-verified after** the rebase, not just before.

No secrets touched. No dependencies added or upgraded.

## 6. State updates done

- ✅ `current-state.md` — "Where we are" now records this work as the latest thing on `main`; new "What works (Sitewide 404 additions)" section; the `__next_error__` shell limitation added under "What does NOT work yet"; date line updated to 2026-08-18.
- ✅ `file-map.md` — both new files entered.
- ✅ `00_stack-and-config.md` — appended a config note recording the routing shape and the deliberate non-adoption of `experimental.globalNotFound`.
- ✅ `Sunset-Services-Decisions.md` — three entries appended (§3 decisions 1, 2, 3).

## 7. Risks, follow-ups, what the next phase needs to know

- **The `__next_error__` shell is the one real limitation.** All four 404 surfaces (the two new, the two shipped) serve a bare shell with no `lang` attribute and no markup; content arrives on hydration. Impact is genuinely narrow — Next returns a correct 404 status and auto-`noindex`, so search engines are unaffected, and JS-enabled visitors see the full page. The exposure is no-JS visitors (blank page) and the missing `lang` attribute (WCAG 3.1.1). **Do not let a future agent "fix" a single 404 in isolation** — measure any new one against the shipped ones first. The only real fix is decision 2's `global-not-found` route, which is the operator's call.
- **The site now has three 404 files with two different link conventions.** If anyone unifies them, unslashed is the correct target.
- **Not verified on Vercel Preview.** This went straight to `main` at the operator's direction, so all evidence in §2 is from a local production build (`next build` + `next start -p 3111`). Worth a spot-check on the live deployment.
- `npm run validate:a11y` and `validate:seo` were **not** run against the new route — neither harness enumerates 404 paths, so they would not have exercised it. Called out rather than silently skipped.

## 8. What's now possible that wasn't before

A visitor who hits a dead link — an old WordPress URL the `next.config.ts` redirect table doesn't cover, a typo, a stale share — stays inside the site with a way back, in their own language, instead of hitting a dead end.
