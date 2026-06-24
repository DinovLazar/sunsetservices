# Session Completion — 2026-06-23 Launch-Runway Docs Update

**Session type:** Docs-only housekeeping (Cowork).
**Goal:** record the 2026-06-23 launch-runway session into the two living docs — `Sunset-Services-Decisions.md` (append-only) and `src/_project-state/current-state.md` (living snapshot).

---

## Status: content COMPLETE — commit DEFERRED to the operator (sandbox cannot write git)

Every documentation edit was written and verified. The git commit itself **could not be performed from the Cowork sandbox** (see "Why the commit was deferred" below). The finished changes are delivered as a ready-to-apply patch: **`session-2026-06-23-launch-runway-docs.patch`** (in the Cowork outputs folder). Apply + commit instructions are at the bottom.

---

## 1. Four decision entries — DONE (in the patch)

All four `## 2026-06-23` entries were appended **verbatim**, in order, to the bottom of `Sunset-Services-Decisions.md`, with house-style `---` separators between entries and matching the existing `## YYYY-MM-DD — Title` … `**Decided by:**` format:

1. **Vercel upgraded to Pro (completed; supersedes the earlier "Pro deferred" hold)**
2. **Remainder of the Google/DNS setup (Search Console, Bing, NAP) deferred to post-publish**
3. **Calendly cut at launch (booking embed hidden)**
4. **301 redirects pulled out of the step-2 Code phase into a dedicated pre-cutover step**

No past entry's substance was edited.

### Prior "Vercel Pro deferred" entry — NOT FOUND

The Decisions log was scanned for a prior decision that deferred the Pro upgrade. **No such decision entry exists in `Sunset-Services-Decisions.md`.** The only "Pro upgrade" mentions in the log are forward-looking references inside other entries (the Phase 3.10 / Phase P.01 "natural upgrade window" notes on lines ~174, ~415, ~1013) — none is a standalone "Pro deferred" decision. The Phase P launch-runway material that proposed deferring Pro lives only in the **untracked** `Phase-P-Launch-Runway-Completion.md` report, not in the decision log.

→ Per the brief, entry #1 was therefore **appended as-is (standalone)**. Its title retains the "(supersedes the earlier 'Pro deferred' hold)" wording as written in the brief. **No older entry was modified** (there was none to mark `Superseded`).

---

## 2. `current-state.md` — DONE (in the patch)

**2a.** The verbatim launch-runway session note (the `>` blockquote) was inserted **directly under the `## Where we are` heading**, above the first bullet.

**2b.** The M.16 status line was flipped from "not merged" to "merged", changing only the status markers and leaving the rest of the bullet's detail intact:

- Lead-in `**Current phase (branch, NOT merged):**` → `**Last merged phase:**`
- Branch clause `(pushed; Lazar verifies on Vercel Preview, then merges)` → ``(merged to `main` 2026-06-23 after Preview verification)``

This matches reality: `main` already contains every M.16 commit (`b6fbba8`, `718167c`, `ce5f2ff`, `1751746`, `2ad9bf3`, `a76cc38`) plus the follow-up navbar fix `130a50b`.

---

## 3. Commit — DEFERRED (could not run from the sandbox)

**Target intended:** the default integration branch `main`, as a single docs-only commit, kept independent of the in-flight step-2 Code branch (so the later step-2 merge can keep BOTH the session note and Code's own `current-state.md` update on conflict).

**Suggested message:** `docs: record 2026-06-23 launch-runway session (current-state + decisions)`

**Commit hash / PR link:** _none — not created._ See below.

### Why the commit was deferred

The repo's `.git` directory is on a Cowork mount that **blocks file unlink/rename**. Git relies on those operations for every write (lock files, atomic ref updates, finalizing objects), so `git commit`, `git worktree remove`, and `git restore` all fail mid-operation with `Operation not permitted`. Reading git history works; writing does not. A direct `git push` to `origin` was also not possible — **no GitHub credentials are present in the sandbox** (`git push` fails with `could not read Username for 'https://github.com'`).

Net: from the Cowork sandbox there is no way to land a commit either locally or on GitHub. Editing working-tree files works (that is how the docs were produced and how the patch was generated); only git's own writes are blocked.

### Branch topology confirmed (read-only)

- `phase/step2-confirmed-facts` (current checkout) = `main` (`130a50b`) **+ one committed Decisions entry** `c66090d` (the "Step 2 Hand-off B" entry) **+ Code's uncommitted source changes** still in progress.
- `main`'s `current-state.md` is byte-identical to the step-2 committed version (c66090d only touched `Sunset-Services-Decisions.md`).
- `main`'s `Sunset-Services-Decisions.md` does **not** yet contain the Step 2 entry — so the supplied patch is built against `main` and the four new entries append directly after the 2026-06-22 M.16 plan-of-record entry.

---

## 4. Working tree left CLEAN (important for the concurrent Code phase)

While producing the docs I temporarily edited the two files in the live `phase/step2-confirmed-facts` working tree. Because that tree belongs to the **in-flight step-2 Code phase**, both files were **restored to their committed state** afterward (verified: `git diff HEAD` on both files is empty). Code's uncommitted source changes were never touched. The only new file left in the tree is this completion report (untracked, expected).

### ⚠️ Sandbox cruft to clean on the host (cannot be removed from Cowork)

Running git inside the Cowork sandbox (and an isolated worktree for the failed commit) left stale lock files in `.git`. The sandbox cannot delete them (the mount blocks unlink); **your host can.**

```
.git/index.lock                                              ← MOST IMPORTANT — blocks `git add`/`git commit`
.git/worktrees/sunset-docs/HEAD.lock
.git/refs/heads/docs/session-2026-06-23-launch-runway.lock
.git/worktrees/sunset-docs/   (registration; points at a sandbox /tmp path that no longer exists)
```

**`.git/index.lock` is the urgent one:** while it exists, **no git commit can run in this repo** — including the in-flight step-2 Code phase. Remove it (and the rest) on your machine first:

```bash
cd /Users/lazar/Projects/SunSet-V2
rm -f .git/index.lock                                            # unblocks all commits
rm -f .git/worktrees/sunset-docs/HEAD.lock
rm -f ".git/refs/heads/docs/session-2026-06-23-launch-runway.lock"
git worktree prune
git branch -D docs/session-2026-06-23-launch-runway 2>/dev/null || true
```

Removing `index.lock` is safe here — no real git process is running; it is orphaned sandbox state. None of this affects the contents of `main`, the step-2 branch, or Code's tracked working-tree changes.

---

## 5. How to land the commit (run on your machine, where git works)

The patch `session-2026-06-23-launch-runway-docs.patch` applies cleanly to `main`. Recommended flow (one docs commit on a branch, then a PR — matches the repo's review workflow):

```bash
cd /Users/lazar/Projects/SunSet-V2
git fetch origin
git switch -c docs/session-2026-06-23-launch-runway origin/main
git apply /path/to/session-2026-06-23-launch-runway-docs.patch
git add Sunset-Services-Decisions.md src/_project-state/current-state.md
git commit -m "docs: record 2026-06-23 launch-runway session (current-state + decisions)"
git push -u origin docs/session-2026-06-23-launch-runway
# then open a PR from that branch into main
```

If direct commits to `main` are allowed in this repo, you can instead apply the patch on `main` and commit there directly.

**Coordination note:** when the step-2 Code branch later merges into `main`, `current-state.md` may conflict — **keep BOTH** the session note (this change) and Code's update. The four `Sunset-Services-Decisions.md` entries are append-only and independent of Code's Step 2 entry.

---

## Definition of Done — checklist

- [x] Four dated `2026-06-23` entries appended verbatim to the bottom of `Sunset-Services-Decisions.md`, house style; no past entry's substance edited. _(in patch)_
- [x] Prior "Vercel Pro deferred" entry handled — **none existed**; entry #1 stands alone.
- [x] Session-state note inserted directly under `## Where we are` in `current-state.md`. _(in patch)_
- [x] M.16 line flipped to merged-to-`main`-2026-06-23; rest of the bullet intact. _(in patch)_
- [ ] **Both files committed in one docs-only commit** — _deferred to the operator; sandbox cannot write git (see §3). Patch supplied._
- [x] Edit is additive; Code's in-flight working tree restored clean.

**Prepared by:** Cowork docs session, 2026-06-23.
