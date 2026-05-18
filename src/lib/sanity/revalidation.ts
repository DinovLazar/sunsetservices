/**
 * Phase B.08 — Sanity → Next.js cache invalidation.
 *
 * Single source of truth for "when a `_type` X publishes in Sanity, which
 * Next.js cache tags need to flush and which page paths need to rebuild?"
 *
 * Both the production webhook (`POST /api/revalidate`) and the test route
 * (`POST /api/test/revalidate`) project an incoming Sanity payload through
 * this helper. The doc-type → tags mapping mirrors the tag schema applied
 * to every GROQ helper in `sanity/lib/queries.ts`; the path patterns are
 * concretized per-doc (slug-aware where present, bulk-invalidate where
 * the projection doesn't carry enough info to be selective).
 *
 * Locale-aware: every emitted path expands to BOTH the EN variant AND
 * the `/es` prefix variant (with the bare home as the one special case —
 * '/' and '/es', not '/es/').
 *
 * The page-level `export const revalidate = 1800` on every Sanity-read
 * route group stays in place as a safety net (D2 in the phase plan-of-
 * record); this module gives the happy-path "instant updates within
 * ~2 seconds" behavior.
 */

import {revalidatePath, revalidateTag} from 'next/cache';
import {LOCATION_SLUGS} from '@/data/locations';
import {SERVICES, AUDIENCES} from '@/data/services';

export type SanityRevalidationPayload = {
  _type: string;
  _id?: string;
  /** Pre-projected from `slug.current` by the webhook payload projection. */
  slug?: string;
};

export type RevalidationResult = {
  docType: string;
  revalidatedTags: string[];
  revalidatedPaths: string[];
  /** True iff the doc type isn't in the mapping — caller returns 200, not 500. */
  unhandled?: true;
};

type DocTypeMapping = {
  tags: string[];
  /** Path patterns with `[token]` placeholders resolved by `expandPattern`. */
  paths: string[];
};

const MAPPINGS: Record<string, DocTypeMapping> = {
  service: {
    tags: ['service', 'faq'],
    paths: ['/[audience]/[service]', '/[audience]', '/service-areas/[city]'],
  },
  project: {
    tags: ['project'],
    paths: [
      '/projects',
      '/projects/[slug]',
      '/[audience]',
      '/service-areas/[city]',
      '/',
      '/about',
    ],
  },
  blogPost: {
    tags: ['blogPost', 'faq'],
    paths: ['/blog', '/blog/[slug]'],
  },
  resourceArticle: {
    tags: ['resourceArticle', 'faq'],
    paths: ['/resources', '/resources/[slug]'],
  },
  location: {
    tags: ['location'],
    paths: ['/service-areas', '/service-areas/[city]'],
  },
  faq: {
    tags: ['faq'],
    paths: [],
  },
  review: {
    tags: ['review'],
    paths: ['/service-areas/[city]'],
  },
  team: {
    tags: ['team'],
    paths: ['/about'],
  },
};

/**
 * Layer the EN + `/es` locale variants onto each path. The bare home is
 * the one exception — `/` and `/es` (NOT `/es/`, which is a different
 * Next route segment). Deduplicates as a side effect.
 */
function withLocales(paths: string[]): string[] {
  const out: string[] = [];
  for (const p of paths) {
    if (p === '/') {
      out.push('/', '/es');
    } else {
      out.push(p, `/es${p}`);
    }
  }
  return Array.from(new Set(out));
}

/**
 * Resolve a path pattern to concrete EN-only paths. `withLocales` layers
 * the ES variants on top.
 *
 * Patterns that name a collection (e.g. `/[audience]/[service]`) expand
 * to the cross-product of the static-param sources (the same sources
 * `generateStaticParams` already uses). Patterns that name a single
 * slug-driven detail page (e.g. `/blog/[slug]`) expand to the concrete
 * slug if the payload carries one; otherwise they drop out (the doc was
 * likely deleted — the detail page 404s itself and the index revalidates
 * separately).
 */
function expandPattern(pattern: string, doc: SanityRevalidationPayload): string[] {
  switch (pattern) {
    case '/[audience]/[service]':
      // Service-detail pages. The projection doesn't carry audience so a
      // service publish bulk-invalidates all 16 (audience, slug) combos.
      return SERVICES.map((s) => `/${s.audience}/${s.slug}`);
    case '/[audience]':
      return AUDIENCES.map((a) => `/${a}`);
    case '/service-areas/[city]':
      // Location publishes know the city via slug; everything else
      // (service / project / review) bulk-invalidates all 6.
      if (doc._type === 'location' && doc.slug) {
        return [`/service-areas/${doc.slug}`];
      }
      return LOCATION_SLUGS.map((slug) => `/service-areas/${slug}`);
    case '/projects/[slug]':
      return doc.slug ? [`/projects/${doc.slug}`] : [];
    case '/blog/[slug]':
      return doc.slug ? [`/blog/${doc.slug}`] : [];
    case '/resources/[slug]':
      return doc.slug ? [`/resources/${doc.slug}`] : [];
    default:
      return [pattern];
  }
}

/**
 * Marks the right Next.js cache tags + page paths as stale for a given
 * Sanity document publish. Throws on missing `_type` (caller returns 400);
 * returns `{unhandled: true}` with empty arrays on unknown `_type` (caller
 * returns 200 so Sanity stops retrying — log + ack is the right move for
 * unmapped doc types).
 */
export async function revalidateForDocument(
  payload: SanityRevalidationPayload,
): Promise<RevalidationResult> {
  if (!payload || typeof payload._type !== 'string' || payload._type.length === 0) {
    throw new Error('revalidateForDocument: missing _type');
  }

  const docType = payload._type;
  const mapping = MAPPINGS[docType];

  if (!mapping) {
    return {
      docType,
      revalidatedTags: [],
      revalidatedPaths: [],
      unhandled: true,
    };
  }

  const tags = Array.from(new Set(mapping.tags));
  for (const tag of tags) {
    // Next 16 deprecated the single-arg form: revalidateTag now requires a
    // cache profile (or CacheLifeConfig) as the second argument. 'max' is the
    // recommended value for "purge all cached entries tagged with this tag" —
    // matches the legacy single-arg behavior. See:
    //   https://nextjs.org/docs/messages/revalidate-tag-single-arg
    revalidateTag(tag, 'max');
  }

  const concretePaths = mapping.paths.flatMap((p) => expandPattern(p, payload));
  const pathsWithLocales = withLocales(concretePaths);
  for (const path of pathsWithLocales) {
    revalidatePath(path, 'page');
  }

  return {
    docType,
    revalidatedTags: tags,
    revalidatedPaths: pathsWithLocales,
  };
}
