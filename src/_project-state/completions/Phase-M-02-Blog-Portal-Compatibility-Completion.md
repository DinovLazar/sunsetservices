# Phase M.02 · Code — Blog portal compatibility Completion Report

**Phase:** M.02 — Blog portal compatibility (portal-authored posts must render, with their real Sanity image)
**Date:** 2026-07-12 · **Outcome (one line):** a blog post published from the Vertex client portal now renders its own `/blog/<slug>` page (200, not 404) and shows its real Sanity-uploaded featured image on both the index and the post page, in EN and ES — while the five originally-seeded posts stay visually unchanged.
**Branch:** `fix/blog-portal-image-and-dynamic-params` (off `main` @ `bc5efe7`) — **committed; PR to be opened; NOT merged. Goran verifies on Vercel Preview and merges.**
**Author:** Code

---

## 1. What shipped (plain language)

Two defects blocked handing the portal to Sunset's editor, both in this repo:

1. **New posts 404'd.** `/blog/[slug]` had `dynamicParams = false`, so only slugs that existed at build time rendered. A post the portal published *after* the last build (the normal case) had no pre-rendered page, so its own URL returned 404 even though the publish webhook revalidated it and the index picked it up.
2. **Portal posts showed a broken image.** Both blog files hard-coded the image source to a static file `/images/blog/<slug>.jpg` — which only exists for the five seeded posts. A portal post's real featured image (uploaded into Sanity and written onto the document as an asset reference) was fetched by the GROQ projection and then thrown away; the page pointed at a nonexistent static file.

Fix: flip `dynamicParams` to `true` so a new slug renders on first request and caches (ISR), and add a small shared resolver — modelled on the existing `resolveProjectImage.ts` — that serves the Sanity asset through `urlFor()` when present and falls back to the static placeholder otherwise. No schema, query, config, or webhook change.

## 2. Exactly what changed

### New file — `src/lib/images/resolveBlogImage.ts`
Mirrors `resolveProjectImage.ts` / the `assetUrl()` helper in `sanity-adapters.ts`:
```
resolveBlogImage(featuredImage, slug, targetWidth=1280, targetHeight=720)
  → featuredImage?.asset?._ref present:
      urlFor(featuredImage).width(w).height(h).fit('crop').auto('format').url()   (in try/catch)
  → else / on throw:
      `/images/blog/${slug}.jpg`
  returns {src, width, height}   (same shape as the old local helpers)
```
The try/catch means a malformed asset falls back instead of crashing the page.

### `src/app/[locale]/blog/[slug]/page.tsx`
- `export const dynamicParams = true` (was `false`). `revalidate = 1800` and `dynamic = 'force-static'` **unchanged**. The existing `if (!post) notFound()` guard still 404s a genuinely missing slug.
- Deleted the local `fallbackImage()` helper + the stale "Falls back to Phase 1.18 placeholder until 2.04" comment.
- Resolve the featured image once (`resolveBlogImage(post.featuredImage, slug)`) and reuse it for the hero `<Image>` (fill / sizes / priority / `quality={70}` / 16:9 wrapper all unchanged) and the JSON-LD.
- `articleSchema.imageUrl` is now `SITE_URL`-prefixed when the resolved src is root-relative (the Sanity branch is already absolute), so schema.org always gets an absolute URL.
- Related-posts cards resolve each related post's own `featuredImage` from the summary projection.
- Alt text falls back to the post title when `featuredImageAlt?.[loc]` is empty, matching the OG-metadata code at line ~93 — never an empty alt on a content image.

### `src/app/[locale]/blog/page.tsx`
- Deleted `fallbackBlogImage()` + its stale comment; corrected the now-inaccurate component docstring.
- Featured card and grid cards resolve via `resolveBlogImage(post.featuredImage, post.slug)`; alt falls back to title.

**No design changes.** Layout, aspect ratios (16:9 hero, 16:10 featured card), and copy are untouched — only the image bytes' source and whether a new slug renders.

## 3. Definition of Done — evidence per item

- ✅ **`dynamicParams = true`; `revalidate = 1800` and `dynamic = 'force-static'` unchanged.** Confirmed in the diff; build classifies `/[locale]/blog/[slug]` as `●` SSG with `30m 1y` (revalidate/expire) — build-time slugs prerendered, new slugs render on demand.
- ✅ **`resolveBlogImage.ts` exists with the specified behaviour.** Sanity asset → `urlFor()` URL; no asset → `/images/blog/<slug>.jpg`; malformed asset caught (try/catch) → fallback, no throw.
- ✅ **No `fallbackImage(` / `fallbackBlogImage(` remains in either blog file.** `grep -rn` over `src/app/[locale]/blog/` → **clean** (0 hits).
- ✅ **The five seeded posts render their existing images, visually unchanged.** Index shows `/_next/image?url=%2Fimages%2Fblog%2F<slug>.jpg` for `dupage-patio-cost-2026`, `aurora-spring-lawn-calendar`, `why-unilock-premium-pavers`, `snow-for-commercial-properties`, `sprinkler-tune-up-7-signs`. Seeded detail page (`/blog/dupage-patio-cost-2026`) hero src = `/images/blog/dupage-patio-cost-2026.jpg`; optimizer round-trip → **200 image/jpeg**.
- ✅ **A portal post with an uploaded featured image renders it on `/blog` and `/blog/<slug>`, EN + ES.** Verified against `hoa-landscape-budget-2026` (a real portal/Sanity-asset-backed post in the live `i3fawnrl/production` dataset): index + detail hero resolve to `https://cdn.sanity.io/images/i3fawnrl/production/85575b…-3024x4032.jpg?rect=…&w=1280&h=720&fit=crop&auto=format`; optimizer round-trip → **200 image/jpeg**; live-DOM `alt` = "Una comunidad HOA con jardinería bien mantenida en los suburbios oeste de Chicago." (ES). EN + ES detail both status 200. Screenshot captured of the rendered post with its Sanity hero image (see §5).
- ✅ **`/blog/<new-slug>` returns 200, not 404, without a redeploy; a genuinely non-existent slug still 404s.** Fake slug `/blog/this-slug-does-not-exist-xyz` → **404** (branded). Valid portal slug → 200. See §6 for the one check that is deferred to the deployed Cowork step.
- ✅ **`articleSchema.imageUrl` on a portal post is absolute `https://cdn.sanity.io/…`.** Parsed from rendered JSON-LD `BlogPosting.image`: portal post → `https://cdn.sanity.io/images/i3fawnrl/production/85575b…?…&w=1280&h=720&fit=crop&auto=format`; seeded post → `https://sunsetservices.us/images/blog/dupage-patio-cost-2026.jpg` (SITE_URL-prefixed).
- ✅ **`npm run build`, `npm run lint`, `npx tsc --noEmit` all clean; existing suite green.** `tsc --noEmit` exit 0; `lint` **0 errors** (9 pre-existing warnings, all in files not touched by this phase); clean `npm run build` (`rm -rf .next` first) exit 0. `validate:related-links` runs in prebuild and passed (build reached completion). Browser console on the visited pages: **zero errors**.
- ✅ **Nothing outside the two blog pages + the new resolver is modified.** Code commit `git diff --stat`: `blog/[slug]/page.tsx`, `blog/page.tsx`, `lib/images/resolveBlogImage.ts` — three files only. No schema/query/`next.config.ts`/webhook change.
- ✅ **Standard repo rules honoured.** Feature branch; PR against `main` (no direct push); no secrets in the diff.

### Command evidence
```
npx tsc --noEmit            → EXIT 0
npm run lint                → ✖ 9 problems (0 errors, 9 warnings)   [warnings all pre-existing, untouched files]
rm -rf .next && npm run build → ✓ Compiled successfully; EXIT 0
  ● /[locale]/blog/[slug]     30m   1y   (SSG + on-demand for new slugs)
grep -rn "fallbackImage\|fallbackBlogImage" src/app/[locale]/blog/  → (clean)
```

## 4. Decisions I made during this phase (surfaced, not self-ratified)

1. **Completion report location.** The phase prompt directs the report to `src/_project-state/completions/`, but the established house convention is a flat `src/_project-state/Phase-*-Completion.md` (~75 existing reports). I honoured the explicit instruction and created the `completions/` subdirectory, and I flag the divergence here so the operator can decide whether M.02 starts a new convention or the report should be moved flat. `current-state.md` / `file-map.md` note the new location.
2. **`resolveBlogImage` default dimensions = 1280×720.** Chosen to match the exact `{width:1280, height:720}` the old `fallbackImage()`/`fallbackBlogImage()` returned, so call sites that read `.width`/`.height` (the `ContentCard` image prop) are byte-for-byte equivalent on the fallback path. Callers pass no override, so behaviour is identical to before on seeded posts.
3. **Fixed the blog-index component docstring too.** It still claimed "Image fields fall back to /images/blog/<slug>.jpg until Phase 2.04 uploads real Sanity assets" — now false. Rewrote it to describe the resolver. In-scope file, comment-only, zero runtime effect.
4. **Alt fallback uses `?.[loc] || title` (optional-chained).** Matches the OG-metadata code at line ~93 exactly (`post.featuredImageAlt?.[loc] || post.title[loc]`), rather than the bare `post.featuredImageAlt[loc]` the render code used before. Verified live: the seeded `dupage-patio-cost-2026` post has an empty `featuredImageAlt`, so its hero alt correctly falls through to the title ("How Much Does a Patio Cost in DuPage County in 2026?").

## 5. Verification artifacts

- Dev server (`npm run dev`, live `i3fawnrl/production` Sanity dataset). Blog index 200 with a mix of `cdn.sanity.io` (portal posts) and `/images/blog/*.jpg` (seeded posts) image URLs.
- Screenshot: `/blog/hoa-landscape-budget-2026` rendering "HOA Budget Planning: Preparing Your 2026 Landscape Budget" with its real Sanity photographic hero (deck/railing image), breadcrumb, category chip, dek, and byline — i.e. a portal-authored post displaying end-to-end.
- Optimizer round-trips: both the Sanity hero (`/_next/image?url=cdn.sanity.io/…`) and the seeded hero (`/_next/image?url=/images/blog/…`) return **200 image/jpeg**.

## 6. Follow-ups / for the orchestrator

1. **Deferred deploy-time check (Cowork, Task 6).** Locally, `next dev` renders every valid slug on demand, so it cannot distinguish "created after the build" from "prerendered." The `dynamicParams = true` fix is proven by code + the build's SSG classification, and on-demand rendering works locally. The definitive production proof — *publish a throwaway post from the portal into Sanity after the Preview/Prod build, confirm `/blog/<slug>` returns 200 with its Sanity image on the deployed site (EN + ES), then delete it and confirm the site drops it* — should run on the Vercel Preview once the PR is up. All the machinery it exercises is verified here.
2. **`resources/[slug]/page.tsx` still uses the static-image shortcut** (its own `fallbackImage()` → `/images/blog/<slug>.jpg`, lines ~46/152/371). **Left untouched, per scope** — the portal does not write `resourceArticle` documents, so it is not a launch blocker. Flagged as a follow-up: if the portal ever authors resources, apply the same `resolveBlogImage`-style resolver there.
3. **Pre-existing untracked file left alone.** `src/_project-state/session-2026-06-23-launch-runway-docs.patch` was untracked at session start (not mine); it was deliberately kept out of both commits.

## 7. State updates done

`current-state.md` and `file-map.md` updated in this branch (new resolver file; blog pages now Sanity-image-driven with static fallback; `dynamicParams` note). This report filed at `src/_project-state/completions/Phase-M-02-Blog-Portal-Compatibility-Completion.md`.

## 8. What's now possible that wasn't before

The Vertex client portal can be handed to Sunset's editor: a post they publish appears on the blog index, has a working `/blog/<slug>` page, and shows the featured image they uploaded — in both languages — without a developer redeploy.
