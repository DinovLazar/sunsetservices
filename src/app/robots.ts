import type {MetadataRoute} from 'next';
import {SITE_URL, isProductionDeploy} from '@/lib/seo/urls';
import {
  AI_CRAWLERS_ALLOWED,
  AI_CRAWLERS_BLOCKED,
  CRAWLER_DISALLOW_PATHS,
} from '@/lib/seo/aiCrawlers';

/**
 * Phase B.05 — robots.txt (Phase B.07 extension)
 *
 * Phase B.17 — the single wildcard block became THREE blocks: the original
 * wildcard, an explicit named-allow block for AI / answer-engine crawlers, and
 * a (currently empty) named-block list. The disallow set is shared across all
 * of them and now lives in `@/lib/seo/aiCrawlers` so robots.txt and the
 * crawler policy cannot drift. Rationale for naming agents that the wildcard
 * already covers is documented in that file. No `llms.txt` line is emitted
 * here — see `src/app/llms.txt/route.ts` for why.
 *
 * Per D8:
 * - Wildcard block: User-agent `*`, Allow `/`, Disallow `/api/` + `/og/`
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
  // Phase M.14 (Goran QA B-09 §3.12): non-production deployments (Vercel
  // preview / development) must not be indexable. Block everything there.
  if (!isProductionDeploy()) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }
  const rules: MetadataRoute.Robots['rules'] = [
    // Block 1 — every conventional search crawler (and any AI agent not
    // named below, which inherits this block).
    {
      userAgent: '*',
      allow: '/',
      disallow: [...CRAWLER_DISALLOW_PATHS],
    },
    // Block 2 — AI / answer-engine crawlers, named explicitly. Same allow,
    // same disallows: we want them reading the marketing surface and staying
    // out of the API routes and the tokenised unsubscribe URLs. Listed as one
    // block with an array of user-agents, which robots.txt permits and which
    // keeps the emitted file readable.
    ...(AI_CRAWLERS_ALLOWED.length > 0
      ? [
          {
            userAgent: [...AI_CRAWLERS_ALLOWED],
            allow: '/',
            disallow: [...CRAWLER_DISALLOW_PATHS],
          },
        ]
      : []),
    // Block 3 — any agent explicitly turned away. Empty under the current
    // allow-all decision; present so a reversal needs no structural change.
    ...(AI_CRAWLERS_BLOCKED.length > 0
      ? [{userAgent: [...AI_CRAWLERS_BLOCKED], disallow: '/'}]
      : []),
  ];

  return {
    rules,
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
