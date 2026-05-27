# Fix "Similar Services" 404 Buttons on Service Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repair the "similar services" tiles at the bottom of every service detail page (`/{division}/{service}/`) so they link to live `/<division>/<slug>/` URLs instead of 404 / redirected stubs derived from the retired `audience` field. Also fix the matching bug on project-detail pages where the same pattern is reused.

**Architecture:** The site flipped IA from 3 `audience` values (`residential | commercial | hardscape`) to 4 `division` values (`landscape | hardscape | waterproofing | snow-removal`) in Phase M.01e. Routes are now `src/app/[locale]/[division]/[service]/page.tsx`. A handful of components still build URLs from the **legacy** `service.audience` (now optional, missing on 14 new services). The fix is a one-token swap to `service.division` (required on every service), plus a small Node verification script that walks every service's `related[]` slugs, simulates what `ServiceRelated.tsx` will render, and checks the result against the canonical division URLs.

**Tech Stack:** Next.js 16 App Router, `next-intl` v4 Link, TypeScript, Node 24 (for the validation script), no Jest/Vitest — verification uses a one-off `node scripts/*.mjs` plus `next build` and a manual dev-server click-through.

---

## File Structure

**New files (1):**
- `scripts/validate-related-links.mjs` — Node script. Imports `SERVICES` via a tiny tsx loader (or re-parses the data with `tsx`). For each service, applies the URL-building rules used by the currently broken components, then checks the result against the set of canonical division URLs. Exits non-zero on mismatch. Runs offline; no dev server required.

**Modified files (4):**
- `src/components/sections/service/ServiceRelated.tsx` — Line 62: swap `service.audience` → `service.division` in the `href` template.
- `src/components/sections/projects/detail/ProjectFacts.tsx` — Line 132 (audience landing link) and line 164 (per-service tile link): use `s.division` / `project.division` instead of `audience`. Line 35 also widens the local typing to carry `division` rather than `audience` so the linked URL is buildable.
- `src/components/content/ProseLayout.tsx` — Line 78: derive cross-link path from `getService(inlineServiceCrossLink.serviceSlug)?.division` rather than the blog metadata's legacy `audience` tag. Keep the metadata untouched (blog/resource seed files are out of scope for this plan).
- `src/components/content/ProseLayoutPT.tsx` — Line 65: same fix as ProseLayout.tsx.

**Touched but unchanged:** `next.config.ts` 308 redirects (`/residential/*` → `/landscape/*`, `/commercial/*` → `/landscape/*` or `/snow-removal/*`) keep working for legacy backlinks. We do **not** delete them. They are the safety net for any external link that still points at the old URL shape.

**Out of scope for this plan:**
- `src/lib/schema/service.ts` `buildAudienceItemList` — dead code, no caller. Leave for a follow-up cleanup task; deleting it touches schema surface we don't need to touch.
- Blog/resource cross-link metadata in `src/data/blog.ts` + `src/data/resources.ts` — those carry `inlineServiceCrossLink.audience` strings; once `ProseLayout` derives division from `services.ts` instead of trusting the metadata, the metadata's `audience` value becomes a label that nothing uses for routing. A future cleanup can either drop the field or rename it. The plan does **not** change the metadata.

---

## Root Cause Recap

Each service in `src/data/services.ts` carries:

- `division: 'landscape' | 'hardscape' | 'waterproofing' | 'snow-removal'` — required, drives the route at `src/app/[locale]/[division]/[service]/page.tsx`.
- `audience?: 'residential' | 'commercial' | 'hardscape'` — **optional**; present on the 14 legacy services (Phase 1.09), absent on the 14 newer waterproofing + snow-removal services (Phase M.01e).

`ServiceRelated.tsx:62` builds `href={`/${service.audience}/${service.slug}/`}`. Resulting failure modes today:

1. **Service has no audience (waterproofing + snow-removal, 14 services).** Template stringifies `undefined` → href is literally `/undefined/<slug>/` → hard 404.
2. **Service has audience = `residential` or `commercial` (8 services).** href is `/residential/<slug>/` or `/commercial/<slug>/`. These pages no longer exist; `next.config.ts` issues a 308 to the closest division equivalent. The button "works" but only by burning a redirect — and the destination is wrong for any cross-division related entry (e.g. lawn-care's related list includes `driveway-snow-removal`, whose `audience` is `undefined`, so even a related tile rendered from a residential-audience service still 404s).
3. **Service has audience = `hardscape` (6 services).** href is `/hardscape/<slug>/` which still resolves — the `hardscape` division kept the same slug. These tiles are correct today by coincidence.

The fix: read `division` (always set) instead of `audience` (optional, half-retired). Same swap on `ProjectFacts.tsx` and the blog/resource prose layouts.

---

## Task 1: Build the verification script (proves the bug, becomes a regression check)

**Files:**
- Create: `scripts/validate-related-links.mjs`

- [ ] **Step 1: Write the script**

Create `scripts/validate-related-links.mjs` with the content below. It imports `SERVICES` from the project's TypeScript source via `tsx` (already a devDependency per `package.json`). It walks each service's `related[]` slugs, builds the URL each broken consumer would render today (using the legacy `audience`-based formula), and compares the resulting URL set against the canonical division URL set. Any URL not present in the canonical set is reported as a broken link.

```js
#!/usr/bin/env node
/**
 * Walks every service in src/data/services.ts and reports any "related"
 * tile URL that would 404 (or burn a redirect) under the legacy
 * `audience`-based URL formula used by:
 *   - src/components/sections/service/ServiceRelated.tsx (`/${service.audience}/${service.slug}/`)
 *   - src/components/sections/projects/detail/ProjectFacts.tsx (`/${s.audience}/${s.slug}/`)
 *
 * Phase M.01e canonical URL shape is `/${service.division}/${service.slug}/`.
 *
 * Exit code:
 *   0 — every related URL resolves to a canonical division URL.
 *   1 — at least one tile would render a broken link.
 *
 * Usage: node scripts/validate-related-links.mjs
 */

import {pathToFileURL} from 'node:url';
import {register} from 'node:module';

// tsx is a devDependency; register its loader so we can import the .ts seed.
register('tsx/esm', pathToFileURL('./'));

const {SERVICES} = await import('../src/data/services.ts');

const canonical = new Set(
  SERVICES.map((s) => `/${s.division}/${s.slug}/`),
);

const broken = [];
for (const svc of SERVICES) {
  for (const relatedSlug of svc.related) {
    const related = SERVICES.find((s) => s.slug === relatedSlug);
    if (!related) {
      broken.push({
        from: `${svc.division}/${svc.slug}`,
        relatedSlug,
        rendered: '(no match in SERVICES)',
        reason: 'related slug not found',
      });
      continue;
    }
    // Mirror the buggy ServiceRelated.tsx formula exactly.
    const rendered = `/${related.audience}/${related.slug}/`;
    if (!canonical.has(rendered)) {
      broken.push({
        from: `${svc.division}/${svc.slug}`,
        relatedSlug,
        rendered,
        reason: related.audience === undefined ? 'related.audience is undefined' : 'audience-rooted URL is not a canonical route',
      });
    }
  }
}

if (broken.length === 0) {
  console.log('OK — every related tile URL is a canonical /<division>/<slug>/ route.');
  process.exit(0);
}

console.error(`FAIL — ${broken.length} related tile(s) would 404 or redirect under the legacy formula:`);
for (const b of broken) {
  console.error(`  ${b.from}  →  ${b.relatedSlug}  rendered as ${b.rendered}  (${b.reason})`);
}
process.exit(1);
```

- [ ] **Step 2: Run the script against the current (buggy) code**

Run: `node scripts/validate-related-links.mjs`

Expected: Exit code `1`. Output lists ~50+ broken related URLs across the 28 services. Examples that should appear:

- `landscape/lawn-care  →  driveway-snow-removal  rendered as /undefined/driveway-snow-removal/  (related.audience is undefined)`
- `waterproofing/basement-waterproofing  →  foundation-repair  rendered as /undefined/foundation-repair/  (related.audience is undefined)`
- `landscape/lawn-care  →  landscape-design  rendered as /residential/landscape-design/  (audience-rooted URL is not a canonical route)`

This output **is** the bug. Save the output to a scratch file or paste it into the task notes for comparison after the fix.

- [ ] **Step 3: Commit the script**

```bash
git add scripts/validate-related-links.mjs
git commit -m "test: add related-tile link validator for /<division>/<slug>/ URLs"
```

---

## Task 2: Fix the "similar services" tiles on the service detail page

**Files:**
- Modify: `src/components/sections/service/ServiceRelated.tsx:62`

- [ ] **Step 1: Read the file to confirm the target line**

Open `src/components/sections/service/ServiceRelated.tsx`. Confirm line 62 reads:

```tsx
                href={`/${service.audience}/${service.slug}/`}
```

- [ ] **Step 2: Apply the fix**

Change line 62 from `service.audience` to `service.division`. Final content:

```tsx
                href={`/${service.division}/${service.slug}/`}
```

No other change is needed in this file. `service.division` is non-optional on the `Service` type (`src/data/services.ts:71`), so TypeScript will not require any optional-chaining or fallback.

- [ ] **Step 3: Update the validation script to mirror the fix and re-run**

Edit `scripts/validate-related-links.mjs` line `const rendered = \`/${related.audience}/${related.slug}/\`;` to read:

```js
    const rendered = `/${related.division}/${related.slug}/`;
```

Then run: `node scripts/validate-related-links.mjs`

Expected output:

```
OK — every related tile URL is a canonical /<division>/<slug>/ route.
```

Exit code `0`. If it still fails, a related slug in the seed does not resolve to an existing service — investigate the data, do **not** weaken the script.

- [ ] **Step 4: Type-check and build**

Run: `npm run lint` followed by `npx next build`

Expected: No new lint errors. Build succeeds. `generateStaticParams` in `src/app/[locale]/[division]/[service]/page.tsx` already enumerates every `(division, service)` pair, so any URL the related tile generates is guaranteed to be a real route.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/service/ServiceRelated.tsx scripts/validate-related-links.mjs
git commit -m "fix(M.01e): related-service tiles link to /<division>/<slug>/"
```

---

## Task 3: Fix the matching bug on project-detail pages (service tile links)

**Files:**
- Modify: `src/components/sections/projects/detail/ProjectFacts.tsx:34-37`, `:164`

- [ ] **Step 1: Read the relevant block**

Open `src/components/sections/projects/detail/ProjectFacts.tsx`. Lines 31-37 currently read:

```tsx
  const resolvedServices = project.serviceSlugs
    .map((slug) => {
      // Prefer same-audience match; fall back to first occurrence.
      const svc = getService(slug, project.audience) ?? SERVICES.find((s) => s.slug === slug);
      return svc ? {slug: svc.slug, name: svc.name[locale], audience: svc.audience} : null;
    })
    .filter(Boolean) as {slug: string; name: string; audience: 'residential' | 'commercial' | 'hardscape'}[];
```

And line 164 (inside the services `<dd>`):

```tsx
                    <Link
                      href={`/${s.audience}/${s.slug}/`}
```

- [ ] **Step 2: Apply the fix to the projected shape**

Replace the map body and the inline-type assertion. After the change, lines 31-37 should read:

```tsx
  const resolvedServices = project.serviceSlugs
    .map((slug) => {
      // Phase M.01e — division is the canonical route segment. Prefer the
      // same-audience match for asset/snow-removal disambiguation; fall back
      // to a slug-only match.
      const svc = getService(slug, project.audience) ?? SERVICES.find((s) => s.slug === slug);
      return svc ? {slug: svc.slug, name: svc.name[locale], division: svc.division} : null;
    })
    .filter(Boolean) as {slug: string; name: string; division: 'landscape' | 'hardscape' | 'waterproofing' | 'snow-removal'}[];
```

- [ ] **Step 3: Apply the fix to the rendered link**

Replace line 164 so the link uses `s.division`:

```tsx
                    <Link
                      href={`/${s.division}/${s.slug}/`}
```

- [ ] **Step 4: Type-check and build**

Run: `npx next build`

Expected: Build succeeds. Any other consumer of `resolvedServices` would have surfaced as a TypeScript error here; there is none — the array is only consumed within this file's `<dd>` block.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/projects/detail/ProjectFacts.tsx
git commit -m "fix(M.01e): project facts service tiles use /<division>/<slug>/"
```

---

## Task 4: Fix the "audience" landing link on project-detail pages

**Files:**
- Modify: `src/components/sections/projects/detail/ProjectFacts.tsx:29`, `:132`

- [ ] **Step 1: Read the audience-landing link block**

Lines 29 and 132 currently read:

```tsx
  const audienceLabel = tTag(project.audience);
  ...
                <Link
                  href={`/${project.audience}/`}
```

`/residential/` and `/commercial/` redirect to `/` (homepage) per `next.config.ts`. `/hardscape/` is still a live division landing. So this link is "soft 404" for residential/commercial projects (lands on home rather than something contextual). We retire it the same way M.01e retired the audience landings: route to the closest **division** landing.

- [ ] **Step 2: Decide the destination for residential/commercial projects**

Projects carry `project.audience: 'residential' | 'commercial' | 'hardscape'` (see `src/data/projects.ts`). The closest division landing per audience is:

- `residential` → `/landscape/` (matches the homepage `AUDIENCE_CTAS` mapping in `src/components/sections/home/HomeServicesOverview.tsx:51`)
- `commercial` → `/snow-removal/` (matches `HomeServicesOverview.tsx:52`)
- `hardscape` → `/hardscape/` (unchanged)

Add a small inline mapping at the top of the component (after the existing `audienceLabel` assignment on line 29):

```tsx
  const audienceLabel = tTag(project.audience);
  // Phase M.01e — audience landings were retired; route to the closest
  // division landing per the homepage AUDIENCE_CTAS mapping.
  const audienceLandingHref = {
    residential: '/landscape/',
    commercial: '/snow-removal/',
    hardscape: '/hardscape/',
  }[project.audience];
```

- [ ] **Step 3: Update the Link**

Replace line 132 so the link reads:

```tsx
                <Link
                  href={audienceLandingHref}
```

- [ ] **Step 4: Type-check and build**

Run: `npx next build`

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/projects/detail/ProjectFacts.tsx
git commit -m "fix(M.01e): project audience facet links to the closest division landing"
```

---

## Task 5: Fix blog & resource inline cross-link cards

**Files:**
- Modify: `src/components/content/ProseLayout.tsx:76-78`
- Modify: `src/components/content/ProseLayoutPT.tsx:63-65`

- [ ] **Step 1: Read the cross-link block in ProseLayout.tsx**

Lines 76-78 of `src/components/content/ProseLayout.tsx` currently read:

```tsx
  const crossLinkPath =
    inlineServiceCrossLink &&
    `/${inlineServiceCrossLink.audience}/${inlineServiceCrossLink.serviceSlug}/`;
```

Same shape in `src/components/content/ProseLayoutPT.tsx:63-65`. Today these resolve via the legacy `/residential/` and `/commercial/` 308 redirects defined in `next.config.ts`, so they are **not** hard 404s — but they burn a redirect hop and the metadata's `audience` field is the wrong source of truth now. The canonical URL must come from `services.ts`.

- [ ] **Step 2: Add the import in ProseLayout.tsx**

Open `src/components/content/ProseLayout.tsx`. Find the existing import block at the top of the file. Add a new import (placement next to other `@/data` imports if present; otherwise just under the React imports):

```tsx
import {getService} from '@/data/services';
```

- [ ] **Step 3: Derive the cross-link path from the service seed**

Replace lines 76-78 of `src/components/content/ProseLayout.tsx` with:

```tsx
  const crossLinkService =
    inlineServiceCrossLink && getService(inlineServiceCrossLink.serviceSlug);
  const crossLinkPath = crossLinkService
    ? `/${crossLinkService.division}/${crossLinkService.slug}/`
    : null;
```

The downstream guard `if (crossLinkIdx !== null && inlineServiceCrossLink && crossLinkPath)` on line 84 still type-narrows correctly — `crossLinkPath` is now `string | null` rather than `string | undefined`, both of which the truthiness check handles.

- [ ] **Step 4: Apply the same change to ProseLayoutPT.tsx**

Open `src/components/content/ProseLayoutPT.tsx`. Add the import:

```tsx
import {getService} from '@/data/services';
```

Replace lines 63-65 with:

```tsx
  const crossLinkService =
    inlineServiceCrossLink && getService(inlineServiceCrossLink.serviceSlug);
  const crossLinkPath = crossLinkService
    ? `/${crossLinkService.division}/${crossLinkService.slug}/`
    : null;
```

Confirm the downstream guard (`if (crossLinkAfterIndex !== null && inlineServiceCrossLink && crossLinkPath)`) still type-checks.

- [ ] **Step 5: Type-check and build**

Run: `npx next build`

Expected: Build succeeds. No type errors. If `getService` returns `undefined` for a metadata slug, the cross-link card is skipped silently (existing behavior is the same when the user has not set `inlineServiceCrossLink`). That's acceptable — a missing service slug in blog metadata is a data bug to surface in code review, not a runtime crash.

- [ ] **Step 6: Commit**

```bash
git add src/components/content/ProseLayout.tsx src/components/content/ProseLayoutPT.tsx
git commit -m "fix(M.01e): blog/resource cross-link card uses canonical division URL"
```

---

## Task 6: Browser + harness smoke check

**Files:**
- Touch: none (verification only).

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`

Wait for the server to log `Ready in ...ms` and the locally-served URL (typically `http://localhost:3000`).

- [ ] **Step 2: Walk one service from each division and click every "similar services" tile**

Open in a browser:

1. `http://localhost:3000/landscape/lawn-care/` — scroll to "Related services" → click each of the 4 tiles, confirm each loads a 200 (no 404, no "Page not found"). Hit back, repeat.
2. `http://localhost:3000/hardscape/patios-walkways/` — same drill.
3. `http://localhost:3000/waterproofing/basement-waterproofing/` — same.
4. `http://localhost:3000/snow-removal/de-icing/` — same.

Expected: Every tile click lands on a `/<division>/<slug>/` URL with the right hero/title for that service. No 404. No redirect chain in the network tab.

If a 404 shows up, run the validator again — there is a related slug in the seed that does not resolve, and the data file needs the missing service added.

- [ ] **Step 3: Walk one project detail page**

Open: `http://localhost:3000/projects/<any-project-slug>/` (pick any from `getAllProjectSlugsForSitemap` output or the projects index `/projects/`). In the facts table:

- Click the "Audience" facet → confirm it lands on `/landscape/`, `/snow-removal/`, or `/hardscape/` (not the homepage).
- Click each service in the "Services" facet → confirm it lands on a `/<division>/<slug>/` route.

- [ ] **Step 4: Run the SEO harness**

Run: `BASE_URL=http://localhost:3000 npm run validate:seo`

Expected: Same exit code as before the change. The harness does not directly assert on related-tile links, but it confirms no regressions on canonical URLs, sitemap, or robots metadata.

- [ ] **Step 5: Run the related-link validator one final time**

Run: `node scripts/validate-related-links.mjs`

Expected: `OK — every related tile URL is a canonical /<division>/<slug>/ route.` Exit code 0.

- [ ] **Step 6: Stop the dev server**

Ctrl-C the `npm run dev` process.

---

## Task 7: Open the PR

**Files:**
- Touch: none (PR creation only).

- [ ] **Step 1: Push the branch**

Run: `git push -u origin claude/m-11-codex-fixes` (or whichever branch is checked out — confirm with `git status` before pushing).

- [ ] **Step 2: Create the PR**

Run:

```bash
gh pr create --title "fix(M.01e): related-service tiles + project facts use /<division>/<slug>/" --body "$(cat <<'EOF'
## Summary
- `ServiceRelated.tsx` now reads `service.division` instead of the optional, half-retired `service.audience` → no more `/undefined/<slug>/` 404s for waterproofing + snow-removal services, and no redirect hop for legacy residential/commercial slugs.
- `ProjectFacts.tsx` mirrors the same fix on its services-facet links, and routes the audience facet to the closest division landing.
- `ProseLayout.tsx` + `ProseLayoutPT.tsx` derive blog/resource cross-link URLs from `getService(slug)?.division` rather than the legacy `inlineServiceCrossLink.audience` metadata.
- Adds `scripts/validate-related-links.mjs` — offline guard that walks every service's `related[]` and asserts the rendered URL is in the canonical division URL set.

## Test plan
- [ ] `node scripts/validate-related-links.mjs` exits 0
- [ ] `npx next build` passes
- [ ] Manual click-through on one service per division — all related tiles load 200
- [ ] Manual click-through on one project detail page — audience facet and service facets land on division URLs
- [ ] `npm run validate:seo` shows no new regressions
EOF
)"
```

- [ ] **Step 3: Report the PR URL back to the user**

---

## Self-Review Notes

- **Spec coverage:** the request is "find and correct the buttons on service pages that link to 404." Task 2 fixes the literal "similar services" tiles on the service detail page (`ServiceRelated.tsx`) — the only place on a service detail page that builds links from `service.audience`. Tasks 3-5 fix sibling places that share the exact same bug pattern; they were included because the prompt says "find ... them" (plural) and because the same one-line bug exists in 3 other components. If the user only wants the service-page tiles, Tasks 1, 2, 6, and 7 are sufficient — Tasks 3-5 can be deferred without breaking anything.
- **Placeholder scan:** every step contains the actual code to write or the exact command to run, with expected output. No "TBD", no "handle edge cases", no "similar to Task N".
- **Type consistency:** `division` is non-optional on `Service` (services.ts:71). The Task 3 `resolvedServices` type assertion lists all four division values exactly. Task 5's `crossLinkPath` is widened to `string | null` and the downstream guard already handles both falsy values via a truthiness check.
- **Out-of-scope guard:** `next.config.ts` redirects, `buildAudienceItemList` dead code, and blog/resource metadata `audience` strings are intentionally **not** touched. They are documented as "out of scope" at the top of the plan so the reviewer doesn't expect them changed.
