# Chore · ESLint ignore for `.claude/**` · Code — Completion Report
**Date:** 2026-07-28 · **Outcome (one line):** `npm run lint` reads true again — 0 errors with stale harness worktrees present (was ~1224 phantom errors burying the "lint 0 errors" phase gate).

## 1. What shipped (plain language)
The lint check had become unreadable on this machine: ~1224 errors, every one from machine-generated build files inside a leftover Claude session folder (`.claude/worktrees/…/.next/`), not from the site's code. ESLint now skips the `.claude/` harness folder entirely, so a red lint run means a real problem again.

## 2. Definition of Done
DoD = the operator-started task chip (spawned from the schema-hotfix session, 2026-07-28).

- ✅ Checked the ESLint config format — flat config at `eslint.config.mjs` (`defineConfig` + `globalIgnores`; there is no `.eslintrc*`). `npm run lint` runs bare `eslint`.
- ✅ Added `.claude/**` to the existing `globalIgnores` block, with a comment matching the `dist/**` precedent already in the file (same OOM/noise failure mode, same gitignored-but-still-linted cause — ESLint flat config does not read `.gitignore`).
- ✅ Verified `npm run lint` → **0 errors / 9 warnings, exit 0** with stale worktree artifacts present — evidence below.
- ✅ Branch `chore/eslint-ignore-claude-worktrees` off `origin/main` @ `e5a0e50` · Conventional Commit · PR opened, **not merged** — operator verifies.

Verification detail (red → green, run in an isolated worktree so the shared main checkout was never touched):
- A fresh worktree can't see the main checkout's untracked stale artifacts, so the failure was **reproduced faithfully inside the worktree**: a real offending chunk (`[turbopack]_runtime.js`, copied byte-for-byte from `nostalgic-mclaren-c98133`) plus a synthetic `bad.js` (require-import / ts-ignore / module-assignment) planted at `.claude/worktrees/stale-test/.next/build/chunks/`.
- **Red (pre-fix):** `npm run lint` → 19 errors, ALL from exactly those two planted files (verified by listing every error-contributing file); repo source at `origin/main` itself: 0 errors.
- **Green (post-fix, artifacts still present):** `npm run lint` → `✖ 9 problems (0 errors, 9 warnings)`, exit 0. The 9 warnings are the long-documented pre-existing repo-source warnings (phase reports have cited "0 err / 9 pre-existing warnings" since M.02).
- Planted artifacts removed after the green run; `.claude/` is gitignored (`.gitignore:50`), so nothing could have been committed from there anyway.

## 3. Decisions I made during this phase
- **Worked in an isolated worktree (`.claude/worktrees/chore+eslint-ignore-claude`), not the main checkout** — the main checkout is concurrently held by the Polish-02 session (its branch + port-3000 verification server); per the 2026-07-28 cross-session collision, spawned tasks must not branch-switch or build there. Consequence: red/green verification used planted artifacts (above) since worktrees only materialize tracked files.
- **No decision-log entry** — the ignore itself was operator-directed via the task chip, not an off-spec choice; rationale is recorded in the config comment + `00_stack-and-config.md` (2026-07-28 note).

## 4. Deviations from the brief / spec
None. Scope is exactly one config file + state docs.

## 5. Changed files / deliverables
- `eslint.config.mjs` — `.claude/**` added to `globalIgnores` (edited).
- `src/_project-state/00_stack-and-config.md` — 2026-07-28 config note appended.
- `src/_project-state/Chore-Eslint-Ignore-Claude-Completion.md` — this report (new).
- `src/_project-state/current-state.md` — chore bullet added.
- `src/_project-state/file-map.md` — chore section appended.
- Branch: `chore/eslint-ignore-claude-worktrees` off `origin/main` @ `e5a0e50` · PR to open, operator merges.

## 6. State updates done (code phases)
- `current-state.md` — updated. `file-map.md` — updated. `00_stack-and-config.md` — updated (the change IS a config change).
- Merge note: this PR, PR #32 (schema hotfix), and the Polish-02 branch each add entries near the top of `current-state.md` / tail of `file-map.md` — expect trivial adjacent-line conflicts if merged out of order; all entries are independent appends.

## 7. Risks, follow-ups, what the next phase needs to know
- The underlying stale worktree `nostalgic-mclaren-c98133` (2026-07-12) still sits on disk in the main checkout; the ignore makes lint blind to it by design. If disk hygiene matters, `git worktree prune` + deleting the folder is a separate manual cleanup — deliberately NOT done here (another session's artifact; not this task's scope).
- Anything intentionally linted must never live under `.claude/` — that path is now a lint blind spot by design.

## 8. What's now possible that wasn't before
The "lint 0 errors" phase gate is trustworthy on a machine with harness worktrees present — a red `npm run lint` now always means real source problems.
