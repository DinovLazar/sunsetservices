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
import {DIVISIONS} from '@/data/divisions';
import {SURFACED_LOCATION_SLUGS} from '@/data/locations';
import {SERVICES} from '@/data/services';

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
    paths: ['/[division]/[service]', '/[division]', '/service-areas/[city]'],
  },
  project: {
    tags: ['project'],
    paths: [
      '/projects',
      '/projects/[slug]',
      '/[division]',
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
 * A resolved path pattern, split by how it must reach `revalidatePath`.
 */
type ExpandedPaths = {
  /**
   * Concrete, locale-agnostic paths (e.g. `/blog/my-post`). `withLocales`
   * layers the EN + `/es` variants on top before they are revalidated.
   */
  concrete: string[];
  /**
   * Route-file literals passed to `revalidatePath` verbatim (e.g.
   * `/[locale]/blog/[slug]`). These already name the `[locale]` segment, so
   * they must NOT go through `withLocales` — that would produce a nonsense
   * `/es/[locale]/blog/[slug]`.
   */
  literal: string[];
};

/**
 * A slug-driven detail page (`/blog/[slug]`, `/resources/[slug]`,
 * `/projects/[slug]`).
 *
 * With a slug we purge that one concrete page (both locales, via
 * `withLocales`). Without one — the delete case, because the webhook
 * projection can't read `slug.current` off a deleted document — we can't
 * name the concrete page, so we fall back to the route-file literal to purge
 * EVERY cached page of the route.
 *
 * Returning `[]` here (the old behaviour) was correct only while
 * `dynamicParams = false`: a deleted slug fell out of the build-time param
 * list, so its page 404'd on its own. Once the blog-portal fix (PR #22) set
 * `dynamicParams = true`, an on-demand-rendered detail page lives in the
 * full-route cache and nothing revalidated it on delete — so it kept serving
 * a stale 200 until `revalidate = 1800` expired. This literal closes that
 * hole while `dynamicParams` stays `true`.
 *
 * The literal MUST carry the `[locale]` segment (`/[locale]/blog/[slug]`,
 * not `/blog/[slug]`): `revalidatePath` keys off the route *file* structure
 * (`src/app/[locale]/blog/[slug]/page.tsx`), not the browser URL.
 */
function expandSlugDetail(pattern: string, doc: SanityRevalidationPayload): ExpandedPaths {
  if (doc.slug) {
    const collection = pattern.replace('/[slug]', ''); // '/blog/[slug]' -> '/blog'
    return {concrete: [`${collection}/${doc.slug}`], literal: []};
  }
  return {concrete: [], literal: [`/[locale]${pattern}`]};
}

/**
 * Resolve a path pattern into the concrete + literal paths it maps to.
 *
 * Patterns that name a collection (e.g. `/[division]/[service]`) expand to
 * the cross-product of the static-param sources (the same sources
 * `generateStaticParams` already uses). Patterns that name a single
 * slug-driven detail page (e.g. `/blog/[slug]`) resolve via
 * `expandSlugDetail` — concrete page when the slug is known, whole-route
 * literal when it isn't.
 */
function expandPattern(pattern: string, doc: SanityRevalidationPayload): ExpandedPaths {
  switch (pattern) {
    case '/[division]/[service]':
      // Service-detail pages. The projection doesn't carry division, so a
      // service publish bulk-invalidates every live division/service URL.
      return {concrete: SERVICES.map((s) => `/${s.division}/${s.slug}`), literal: []};
    case '/[division]':
      return {concrete: DIVISIONS.map((division) => `/${division}`), literal: []};
    case '/service-areas/[city]':
      // Location publishes know the city via slug; everything else
      // (service / project / review) bulk-invalidates all surfaced cities.
      if (doc._type === 'location' && doc.slug) {
        return {concrete: [`/service-areas/${doc.slug}`], literal: []};
      }
      return {
        concrete: SURFACED_LOCATION_SLUGS.map((slug) => `/service-areas/${slug}`),
        literal: [],
      };
    case '/projects/[slug]':
    case '/blog/[slug]':
    case '/resources/[slug]':
      return expandSlugDetail(pattern, doc);
    default:
      return {concrete: [pattern], literal: []};
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

  const expanded = mapping.paths.map((p) => expandPattern(p, payload));
  const concretePaths = expanded.flatMap((e) => e.concrete);
  const literalPaths = expanded.flatMap((e) => e.literal);
  // Concrete paths get their EN + `/es` variants layered on; route literals
  // already carry the `[locale]` segment and are passed through verbatim.
  // Both kinds are revalidated and both are returned so the Sanity webhook
  // log stays informative.
  const revalidatedPaths = Array.from(
    new Set([...withLocales(concretePaths), ...literalPaths]),
  );
  for (const path of revalidatedPaths) {
    revalidatePath(path, 'page');
  }

  return {
    docType,
    revalidatedTags: tags,
    revalidatedPaths,
  };
}
