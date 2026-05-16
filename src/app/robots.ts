import type {MetadataRoute} from 'next';
import {SITE_URL} from '@/lib/seo/urls';

/**
 * Phase B.05 — robots.txt (Phase B.07 extension)
 *
 * Per D8:
 * - Single rule block: User-agent `*`, Allow `/`, Disallow `/api/` + `/og/`
 *   (machine-only routes; the `/og/*` handlers are the Phase 1.18 OG image
 *   generators).
 * - Absolute Sitemap line pointing at the sitemap emitted by `sitemap.ts`.
 * - No `host:` field — Google deprecated it and Bing ignores it.
 * - No broad `Disallow: /` anywhere; everything else is crawlable.
 *
 * The site URL is sourced from the central helper (`SITE_URL`) so the
 * value here cannot drift from canonicals / sitemap entries.
 *
 * Phase B.07 — added `/unsubscribe/` + `/es/unsubscribe/` (both locale
 * variants — robots.txt path matching is anchored at host root and the
 * EN-prefix entry does NOT cover `/es/*`). The pages are already
 * `noindex,nofollow` and excluded from the sitemap; the Disallow entries
 * are belt-and-suspenders for crawlers that don't follow meta robots.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/og/', '/unsubscribe/', '/es/unsubscribe/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
