import type {MetadataRoute} from 'next';
import {
  getAllProjectSlugsForSitemap,
  getAllBlogPostSlugsForSitemap,
  getAllResourceSlugsForSitemap,
} from '@sanity-lib/queries';
import {SERVICES} from '@/data/services';
import {LOCATIONS} from '@/data/locations';
import {canonicalUrl, hreflangAlternates, type Locale} from '@/lib/seo/urls';

/**
 * Phase B.05 — dynamic sitemap.
 *
 * Walks every public route the app exposes (EN + ES), emits two entries
 * per route (one per locale), each with `alternates.languages` including
 * an `x-default` mirror of the EN URL. Per D3, we omit `priority` and
 * `changeFrequency` — Google ignores them and modern sitemap best
 * practice is `<loc>` + `<lastmod>` only.
 *
 * Excluded by design (per D6 + plan §1):
 *   - `/thank-you/` + `/es/thank-you/` (user-data-bearing, noindex)
 *   - `/dev/system` + `/es/dev/system` (dev surface, noindex)
 *   - `/api/*` + `/og/*` (machine-only handlers)
 *
 * The path strings here are **locale-less** (e.g., `/about`); the
 * `canonicalUrl(path, locale)` helper adds the `/es` prefix where needed
 * and strips any trailing slash. Every URL emitted has no trailing slash
 * (D1) — `lastModified` is per-document `_updatedAt` for Sanity-driven
 * content and the build-time `Date` for everything else.
 *
 * Re-runs on each ISR window (30 min) per the Sanity-fetch revalidate
 * config; for fully-static routes the function is statically rendered at
 * build time. Next 16 emits this at the site root as `/sitemap.xml`
 * (sitemap is sitewide, not per-locale).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const buildTime = new Date();

  // ---------- Static, code-driven routes ----------
  // Each entry is a locale-less path; the helper adds /es when needed.
  const STATIC_PATHS: string[] = [
    '/',
    '/residential',
    '/commercial',
    '/hardscape',
    '/service-areas',
    '/projects',
    '/about',
    '/contact',
    '/resources',
    '/blog',
    '/privacy',
    '/terms',
    '/request-quote',
  ];

  // ---------- Service detail routes (16) — from typed seed ----------
  const servicePaths: string[] = SERVICES.map(
    (s) => `/${s.audience}/${s.slug}`,
  );

  // ---------- Location detail routes (6) — from typed seed ----------
  const locationPaths: string[] = LOCATIONS.map(
    (l) => `/service-areas/${l.slug}`,
  );

  // ---------- Sanity-driven dynamic routes ----------
  // _updatedAt is the per-document lastmod. Fetched in parallel.
  const [projectSlugs, blogSlugs, resourceSlugs] = await Promise.all([
    getAllProjectSlugsForSitemap(),
    getAllBlogPostSlugsForSitemap(),
    getAllResourceSlugsForSitemap(),
  ]);

  type Entry = {path: string; lastModified: Date};

  const entries: Entry[] = [
    ...STATIC_PATHS.map((p) => ({path: p, lastModified: buildTime})),
    ...servicePaths.map((p) => ({path: p, lastModified: buildTime})),
    ...locationPaths.map((p) => ({path: p, lastModified: buildTime})),
    ...projectSlugs.map((p) => ({
      path: `/projects/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : buildTime,
    })),
    ...blogSlugs.map((p) => ({
      path: `/blog/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : buildTime,
    })),
    ...resourceSlugs.map((p) => ({
      path: `/resources/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : buildTime,
    })),
  ];

  // Emit one entry per locale; alternates.languages carries the full
  // (en + es + x-default) hreflang block, mirroring page-level metadata.
  const locales: Locale[] = ['en', 'es'];
  const sitemap: MetadataRoute.Sitemap = [];
  for (const entry of entries) {
    const languages = hreflangAlternates(entry.path);
    for (const locale of locales) {
      sitemap.push({
        url: canonicalUrl(entry.path, locale),
        lastModified: entry.lastModified,
        alternates: {languages},
      });
    }
  }

  return sitemap;
}
