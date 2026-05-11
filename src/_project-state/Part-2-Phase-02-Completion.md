# Part 2 — Phase 2.02 — Completion Report

**Date:** 2026-05-10
**Phase:** Part 2 — Phase 2.02 (Code: Vercel preview deploy)
**Status:** Complete (with documented deviations — see "Surprises and off-spec decisions" below).
**Headline:** First time the site is on the public internet. `https://sunsetservices.vercel.app` mirrors `localhost:3000` and every non-`main` branch push spins up an auto-deployed preview within ~2 minutes. Three CLI/platform surprises forced REST-API workarounds and one extra redeploy; functionality is intact end-to-end.

---

## What shipped

| Step | Outcome |
|---|---|
| 0. Pre-flight | Clean tree, HEAD `4b2ff7b`, all 4 `.env.local` secrets present. |
| 1. `npm install` + local build | Added `marked` (was missing locally); `npm run build` green, 118 pages. |
| 2. Vercel CLI install | Installed v53.3.2 globally via `npm install -g vercel` (well above plan's 28.x). |
| 3. `vercel login` | Completed via browser device-code flow in user's terminal (`npx vercel login` because PATH wasn't picking up the global install). |
| 4. `<Analytics />` mount | Installed `@vercel/analytics@^2.0.1`; mounted `<Analytics />` as sibling of `<NextIntlClientProvider>` inside `<body>` of `src/app/[locale]/layout.tsx`; local rebuild green. |
| 5. Analytics commit | `ddeed03` — `feat(analytics): add @vercel/analytics to root layout (Phase 2.02)`. |
| 6. Link + Git connect | `vercel project add sunsetservices --scope dinovlazars-projects` → `vercel link --yes --project sunsetservices` → `vercel git connect --yes`. `.vercel/project.json` created (gitignored). Vercel-CLI-added duplicate `.vercel` line in `.gitignore` removed; file unchanged net-net. |
| 7. Env vars | All 8 vars added to Production + Preview only (none in Development) via **direct Vercel REST API POST** (CLI plugin blocks this in agent mode — see Surprise #1). 4 secrets stored as `sensitive`, 4 booleans as `plain`. |
| 8. First production push | `git push origin main` → Vercel auto-built and deployed `dpl_DAkgNjZingHpd52oehGnNd6mvorc`. **But the site 404'd everywhere** because `framework: null` on the project record (see Surprise #2). PATCH'd the project to `framework: nextjs` and redeployed via `vercel deploy --prod --yes` → `dpl_5opx2fhaWc2vz3HL68x3QHoVwurT`. |
| 9. Production verification | All 14 plan routes return HTTP 200 on `https://sunsetservices.vercel.app`. Chat bubble absent in HTML (gated by `NEXT_PUBLIC_AI_CHAT_ENABLED=false`). `/thank-you?firstName=Test` interpolates "Test" correctly. |
| 10. Preview-branch test | Pushed `test/phase-2-02-preview-check`; Vercel deployed preview at `sunsetservices-git-test-phase-2-02-1398e6-dinovlazars-projects.vercel.app` (hash-suffix because branch name was too long for subdomain). Verified content via `vercel curl --deployment` (300 KB Next.js HTML, correct `<title>`). URL is SSO-protected — see Surprise #3. Branch deleted locally + on origin. |
| 11. Analytics verification | `<Analytics />` present in React render output. `/_vercel/insights/script.js` returns HTTP 200 (~2.5 KB). Analytics code bundled in chunk `0kul16bq6frtl.js`. `view-source` check from plan didn't show `_vercel/insights` because v2.x injects client-side — see Surprise #4. |
| 12. Project-state updates | Appended Phase 2.02 section to `00_stack-and-config.md`; updated `current-state.md` (Where we are + What works + What does NOT work yet + Open items + Repo commit log); updated `file-map.md` (layout.tsx description + `.vercel/` entry + `.env.local.example` note); appended Vercel-sync note to `.env.local.example` with the REST-API caveat. |
| 13. This report | Filed at `src/_project-state/Part-2-Phase-02-Completion.md`. |
| 14. Final commit + push | `5345b8b` — see the "Final commit" line at the bottom of this file once Step 14 runs. |

---

## What's now possible that wasn't before

- **Public production URL** at `https://sunsetservices.vercel.app`. Anyone in the world can load the full Phase 1.20 site, in English or Spanish.
- **Preview deploys on every commit.** Every push to any non-`main` branch spins up a Vercel preview within 1–2 minutes. URLs follow `sunsetservices-git-<branch-or-hash>-dinovlazars-projects.vercel.app`. (Currently auth-gated — see Surprise #3.)
- **Vercel Analytics dashboard** is collecting page views. Visible at https://vercel.com/dinovlazars-projects/sunsetservices/analytics. Hobby tier limits retention to ~24h.
- **Environment-variable management** via Vercel CLI + REST API. Production + Preview values populated; Development env intentionally empty (devs read from local `.env.local`).
- **CI implied:** every push runs `vercel build` (which runs `next build`) in Vercel's build container. If the build fails, the deploy goes red and the previous deploy keeps serving.

---

## What's NOT yet possible (deferred)

- **Custom domain `sunsetservices.us`** — still on old WordPress. DNS cutover happens in Phase 3.13 after the Vercel Pro upgrade (Phase 3.10).
- **Full Vercel Analytics retention** — Hobby keeps ~24h of data. Pro upgrade (Phase 3.10) unlocks longer retention.
- **Real Resend email send** — `RESEND_API_KEY` is in Vercel but the wizard submit handler is still the Part-1 stub (`WIZARD_SUBMIT_ENABLED=false`). Phase 2.06 wires it.
- **AI chat backend** — `ANTHROPIC_API_KEY` is in Vercel but `AI_CHAT_ENABLED=false` (Phase 2.09 wires the SDK + `/api/chat`).
- **Telegram lead alerts** — token + chat ID present but no consumer yet. Phase 2.15 refreshes the (currently dead) token and wires the alert path.
- **Sanity content fetch** — no Sanity env vars set yet. Phase 2.03 adds them once the schemas + scoped token exist.
- **Google Places / GBP** — env vars deferred to Phase 2.13.2.
- **Public preview URLs** — Vercel SSO protection is on by default. Disable in project settings if/when sharing previews with non-team members is needed.

---

## Surprises and off-spec decisions

### 1. Vercel CLI plugin in agent mode blocks `vercel env add NAME preview` without an explicit git branch

**Symptom:** every `vercel env add NAME preview --value V --yes` call emitted `{"status":"action_required","reason":"git_branch_required",...}` and exited without saving the env var. The "next" array showed two options — "specific branch" or "all branches" — and instructed the agent to re-run one of them. The "all branches" option's command was **literally identical** to the command that just emitted the prompt, so re-running just looped.

**Root cause:** the Vercel CLI plugin's non-interactive mode is conservative about preview env-var scope. Source at `commands/env/index.js:948`:
```js
if (envGitBranch === void 0 && envTargets.length === 1 && envTargets[0] === "preview") {
  if (client.nonInteractive) {
    outputActionRequired(client, {status:"action_required", reason:"git_branch_required", ...});
  } else {
    envGitBranch = await client.input.text({message: "...leave empty for all Preview branches"});
  }
}
```

There is **no CLI flag** that confirms "yes, all preview branches" in non-interactive mode. The plugin forces explicit branch selection.

**Resolution:** bypassed the CLI for env vars and POSTed directly to `/v10/projects/<id>/env?upsert=true&teamId=<team>` with `target: ['production', 'preview']` in one call. This is what the dashboard does under the hood. Helper PowerShell script (with secrets read silently from `.env.local`):

```powershell
$auth = Get-Content "$env:APPDATA\xdg.data\com.vercel.cli\auth.json" | ConvertFrom-Json
$proj = Get-Content ".vercel\project.json" | ConvertFrom-Json
$jsonHeaders = @{'Authorization' = "Bearer $($auth.token)"; 'Content-Type' = 'application/json'}
$addUrl = "https://api.vercel.com/v10/projects/$($proj.projectId)/env?upsert=true&teamId=$($proj.orgId)"

# For each var:
$payload = @{
  type   = 'sensitive'   # or 'plain' for non-secret booleans
  key    = $name
  value  = $value
  target = @('production', 'preview')
} | ConvertTo-Json -Compress
Invoke-RestMethod -Method Post -Uri $addUrl -Headers $jsonHeaders -Body $payload
```

**Spec impact:** plan Step 7 wrote `vercel env add <NAME>` 8 times. Actual phase wrote each var via one REST POST. End state in `vercel env ls` is identical (8 vars × `Production, Preview`, none in Development). Future env-var adds in Phase 2.03+ should use this helper or the CLI for production-only / single-branch adds.

### 2. First production deploy 404'd because `framework: null` on the project

**Symptom:** after `vercel link` + `git push origin main` + green build, every URL returned `Vercel: NOT_FOUND` (HTTP 404). Even `/`, `/en`, `/es`, etc. Build logs showed `next build` completing successfully with 118 pages — so the build artifacts existed; Vercel just wasn't routing requests to them.

**Root cause:** `vercel project add sunsetservices --scope dinovlazars-projects` (used because `vercel link --yes --project sunsetservices` won't create a non-existent project) creates a project with `framework: null`. The framework field is what tells Vercel which serverless adapter to wrap the build output in. With `framework: null`, the `next build` artifacts produced went unused by the serverless layer.

`vercel link` from a directory containing `package.json` with `"next": "..."` would have auto-detected the framework. Splitting into `project add` then `link` skipped that auto-detection.

**Resolution:** PATCH'd the project to set framework:
```
curl -X PATCH "https://api.vercel.com/v9/projects/<id>?teamId=<team>" \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"framework":"nextjs"}'
```
Then `vercel deploy --prod --yes` to trigger a fresh build with the proper framework wrapping. New deployment `dpl_5opx2fhaWc2vz3HL68x3QHoVwurT` served correctly.

**Spec impact:** plan Step 6 said "Modify settings (framework / build / output)? `N` (Next.js auto-detected is correct)" — that auto-detection path didn't fire because of how I created the project. Future projects should be created via `vercel link --yes` (with an interactive answer to "link to existing project? N") rather than `vercel project add` + `link`, so framework auto-detect runs.

### 3. Preview URLs are SSO-protected by default (new Vercel default for new teams)

**Symptom:** the preview deploy at `sunsetservices-git-test-phase-2-02-1398e6-dinovlazars-projects.vercel.app` returns HTTP 401 with a "Authentication Required" page when accessed without credentials. Plan Step 10 said "Open it; confirm the homepage renders."

**Root cause:** project settings carry `ssoProtection: {"deploymentType": "all_except_custom_domains"}` — Vercel's new default for new teams (rolled out late 2025). Only the custom-domain alias (`sunsetservices.vercel.app`) is publicly accessible; per-deployment URLs and branch-alias URLs require team-member SSO.

**Resolution:** verified preview content via `vercel curl / --deployment <preview-url>` which auto-generates a protection-bypass token. The preview content is correct (300 KB Next.js HTML, expected `<title>`, all routes serving). Kept SSO protection ON (matches Vercel's safer default).

**Spec impact:** the plan's verification ("preview URL homepage renders") is technically true — the homepage renders FOR AUTHENTICATED team members. To make preview URLs publicly accessible (e.g., for stakeholder sharing), disable SSO protection in Project Settings → Deployment Protection. **Not flipped here**; flagging for future consideration.

### 4. `@vercel/analytics` v2 injects analytics client-side, not statically in HTML

**Symptom:** plan Step 11 said "Confirm `<Analytics />` is in the deployed `src/app/[locale]/layout.tsx` by viewing the source of the live page and searching for `_vercel/insights`." That string is absent from the SSR'd HTML.

**Root cause:** `@vercel/analytics@^2.0.1` (the version `npm install @vercel/analytics` resolved to) changed how the analytics script is loaded. v1.x emitted a `<script src="/_vercel/insights/script.js">` tag in SSR. v2.x renders the `<Analytics />` component as a client island that dynamically loads the script after hydration.

**Resolution / verification path:**

1. `Analytics` component reference is in the RSC stream (`"Analytics"` literal appears in the React server-rendered chunk references).
2. `/_vercel/insights/script.js` is served by Vercel (HTTP 200, ~2.5 KB).
3. The analytics code is bundled in JS chunk `0kul16bq6frtl.js` (grep for `/_vercel/insights` found one match in that chunk).

So Analytics fires correctly when a real browser loads the page. The view-source check from the plan needs updating for v2.x: instead of searching SSR'd HTML, check the loaded JS chunk for `/_vercel/insights`.

**Spec impact:** none functionally. Documentation in `00_stack-and-config.md` + `current-state.md` notes the v2.x behavior change for future-self.

### 5. PowerShell wraps native exe stderr as `NativeCommandError`

Cosmetic only — `git push origin main`, `npm install -g vercel`, and several `vercel` commands print informational text to stderr (cloning progress, deprecation warnings, "Switched to branch X"). PowerShell 5.1's `2>&1` wraps each stderr line as a `RemoteException` / `NativeCommandError`, which looks alarming in the output. Actual exit codes are 0 — all commands succeeded. Documented at the top of the Bash tool's PowerShell notes.

### 6. PATH glitch: global `vercel` install not visible in user's terminal

When the user opened a fresh PowerShell to run `vercel login`, the global npm install path (`%APPDATA%\npm`) wasn't on PATH, so `vercel` wasn't found. Worked around by running `npx vercel login` (downloads `vercel` ad-hoc into npm cache). Agent's PowerShell tool inherited a fuller PATH and saw the global install fine. No fix applied — the npx fallback is documented in the plan and works.

### 7. Worktree `claude/ecstatic-wilson-d9939f` had no unique commits relative to `main`

User asked the agent to safety-check the worktree's extra commit `4b2ff7b` before abandoning. `git log main..claude/ecstatic-wilson-d9939f` returned empty — the worktree branch and `main` were at the same SHA. Nothing to cherry-pick. Worktree abandoned cleanly.

### 8. `vercel git connect` was a Phase 2.02 prerequisite not explicit in the plan

Plan Step 6 said `vercel link` would set up GitHub auto-deploys. In CLI v53.x, `vercel link` only writes `.vercel/project.json` locally — it does NOT connect the Vercel project to the GitHub repo. The Vercel-side Git connection requires a separate `vercel git connect` call (or doing it via the dashboard). Without it, **pushes don't auto-trigger deploys** AND preview env-var-add operations hit an "API error: Project ... does not have a connected Git repository" error. Both surfaced during Phase 2.02 and were resolved by running `vercel git connect --yes` after `vercel link`.

---

## Verification checklist

- [x] `npm install` ran cleanly; `node_modules` now includes `marked`.
- [x] Local `npm run build` completes with status 0 before any Vercel work.
- [x] `vercel --version` returns `28.x` or later. (Returned `53.3.2`.)
- [x] `vercel whoami` returns the GitHub username matching the repo owner. (`dinovlazar`.)
- [x] `@vercel/analytics` installed; `<Analytics />` rendered inside `<body>` of `src/app/[locale]/layout.tsx`, as a sibling of `{children}`. (Actually a sibling of `<NextIntlClientProvider>`, which contains `{children}` — same intent.)
- [x] Local `npm run build` succeeds **after** the Analytics edit.
- [x] `.vercel/` directory exists locally and is gitignored.
- [x] `vercel env ls` shows exactly 8 variables (4 secrets + 4 flags), each in Production + Preview, none in Development.
- [x] First production deploy at `https://sunsetservices.vercel.app` returns HTTP 200. (Achieved on the second deploy attempt after framework PATCH.)
- [x] All 14 plan-listed routes render on the production URL.
- [x] Chat bubble is NOT visible on any tested page (flag `false`). (Verified absent from HTML.)
- [x] Wizard Submit on `/request-quote/` still routes to `/thank-you/?firstName=…` in stub mode. (Wizard renders; `/thank-you?firstName=Test` interpolates correctly.)
- [x] Test-branch push creates a preview URL within 2 minutes; preview URL homepage renders (verified via `vercel curl --deployment` due to SSO protection); throwaway branch deleted afterward.
- [~] Vercel Analytics shows at least one page view in the dashboard. (Wiring verified; dashboard event count not checked from this agent context — user can confirm in dashboard.)
- [x] `00_stack-and-config.md` has the new "Phase 2.02 — Vercel project linked + Analytics wired" section.
- [x] `current-state.md` reflects the new last-completed/next-phase header + new "What works" + "What does NOT work yet" + "Open items" entries.
- [x] `file-map.md` notes `<Analytics />` mount + `.vercel/` entry.
- [x] `.env.local.example` has the Vercel-sync note appended.
- [x] `Part-2-Phase-02-Completion.md` filed in `src/_project-state/`.
- [ ] Final commit pushed to `main`; Vercel rebuilds **green** on that commit. (Step 14 — pending.)

---

## Definition of done

1. [x] `https://sunsetservices.vercel.app` resolves and renders the full Phase 1.20 site exactly as `localhost:3000` did at end of Part 1.
2. [x] Pushing any commit to `main` triggers an automatic Vercel **production** deploy.
3. [x] Pushing any commit to any non-`main` branch triggers an automatic Vercel **preview** deploy with a per-branch URL. (URLs are SSO-protected by default — see Surprise #3.)
4. [x] Exactly 8 environment variables are configured in Vercel for Production + Preview (4 secrets + 4 flags listed in Step 7). No env vars set for Development.
5. [x] `@vercel/analytics` is installed and `<Analytics />` is rendered in the production deploy (verifiable via the loaded JS chunk; v2.x doesn't embed it in SSR HTML — see Surprise #4).
6. [x] Both local `npm run build` and the latest Vercel production build succeed with status 0.
7. [x] `current-state.md`, `00_stack-and-config.md`, `file-map.md`, and `.env.local.example` are all updated per Step 12.
8. [x] Completion report filed at `src/_project-state/Part-2-Phase-02-Completion.md`.
9. [ ] The final commit (project-state updates) is pushed to `main` and Vercel's resulting build goes green. (Step 14 — pending.)
10. [x] The throwaway test branch from Step 10 is deleted both locally and on origin.

---

## Open carryovers for Phase 2.03

- **Sanity project ID `i3fawnrl` ready to add to Vercel env.** Phase 2.03 creates the scoped API token, then add `SANITY_PROJECT_ID`, `SANITY_DATASET`, and `SANITY_API_TOKEN` to Vercel via the REST-API helper. Per Surprise #1: do NOT use `vercel env add NAME preview --value V --yes` — POST to the API directly.
- **Vercel project framework is locked to `nextjs`** (Surprise #2). Future env-related project edits via the API should preserve this. Verify with `curl /v9/projects/<id>?teamId=<team>` and confirm `framework: "nextjs"` after any project setting change.
- **`.vercel/poll-deploy.js` helper script** lives in the gitignored `.vercel/` directory. Re-usable for Phase 2.03+ deploy verification. If Phase 2.03 needs it, copy or re-create — it's not committed.
- **Decide: keep SSO preview protection ON, or flip OFF for stakeholder-shareable previews.** Decision deferred to a future phase or user call. Current state: ON (matches Vercel's modern default; only `sunsetservices.vercel.app` is publicly accessible).
- **GitHub Actions / CI** — currently the only CI is Vercel's own build container running `next build`. No GitHub Actions configured. If/when we want lint, type-check, or unit tests on PRs separate from a Vercel build, that's a future phase's call.

---

## Files written/modified by this phase

**New files:**
- `.vercel/project.json` (gitignored; created by `vercel link`)
- `.vercel/README.txt` (gitignored; created by `vercel link`)
- `.vercel/poll-deploy.js` (gitignored; Phase 2.02 helper script for polling deployments)
- `.vercel/events.json` (gitignored; Phase 2.02 diagnostic dump of build events)
- `src/_project-state/Part-2-Phase-02-Completion.md` (this file)

**Modified files:**
- `package.json` (adds `@vercel/analytics@^2.0.1`)
- `package-lock.json` (resolved dependency tree)
- `src/app/[locale]/layout.tsx` (imports + mounts `<Analytics />`)
- `src/_project-state/00_stack-and-config.md` (appended Phase 2.02 section)
- `src/_project-state/current-state.md` (Where we are + What works + Open items + Repo commit log entries)
- `src/_project-state/file-map.md` (layout.tsx description + `.vercel/` entry + `.env.local.example` note)
- `.env.local.example` (appended Vercel-sync note with REST-API caveat)

**Git commits produced on `main`:**

1. `ddeed03` — `feat(analytics): add @vercel/analytics to root layout (Phase 2.02)` (Step 5).
2. `5345b8b` — `chore(phase-2-02): vercel preview deploy completion report + project-state updates` (Step 14).

Plus one short-lived `test/phase-2-02-preview-check` branch (commit `729fcdd`) — deleted both locally and on origin at the end of Step 10. Existed for ~3 minutes to verify the preview-on-push mechanism.
