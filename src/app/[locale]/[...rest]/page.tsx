import {notFound} from 'next/navigation';

/**
 * Catch-all → 404.
 *
 * This route renders nothing; it exists so that a URL matching no real route
 * still lands on the branded `[locale]/not-found.tsx` instead of Next's bare
 * built-in 404 page.
 *
 * Why it is needed at all: per the Next 16 file-convention docs, only a *root*
 * `app/not-found.tsx` catches unmatched URLs — and this project has no root
 * layout to host one (see the comment in `[locale]/not-found.tsx`). Without
 * this file, an unmatched path renders the unstyled default.
 *
 * Why it does not shadow the real routes: Next resolves the more specific
 * matcher first, so a single-segment path still goes to `[division]` and a
 * two-segment path to `[division]/[service]` — both of which already call
 * `notFound()` themselves for slugs that don't exist. In practice this
 * catch-all only receives paths of three or more segments.
 *
 * No `generateStaticParams`: there is no finite set of wrong URLs to
 * prerender, so this stays dynamic and simply throws on request.
 */
export default async function CatchAllNotFound() {
  notFound();
}
