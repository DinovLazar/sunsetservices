import {buildLlmsTxt} from '@/lib/seo/llms';

/**
 * Phase B.17 — `GET /llms.txt`.
 *
 * WHY A ROUTE HANDLER AND NOT A STATIC FILE IN `public/`
 * -----------------------------------------------------
 * A static `public/llms.txt` would be simpler by exactly one file — and would
 * be wrong within a month. The content is derived from `SERVICES` (34
 * entries), `DIVISIONS` (5), and `LOCATIONS` (22 surfaced). Every one of those
 * changes over time, and a hand-maintained copy is a promise to remember to
 * update it. Nobody remembers. Generating from the same typed seed the site
 * renders from means the file is correct by construction: add a service, and
 * llms.txt has it on the next build with no action taken.
 *
 * This route sits OUTSIDE `[locale]`, at the site root, deliberately. The
 * convention specifies the file at `/llms.txt`; a locale-prefixed variant
 * would not be found. The content is English and links to English URLs, with
 * an explicit note that every page has a Spanish twin under `/es`.
 *
 * NOTE ON robots.txt: there is no `Llms:` or equivalent directive in the
 * robots.txt spec, and inventing a non-standard field risks tripping strict
 * parsers on a file that Googlebot depends on. Discovery is by convention —
 * agents look at the well-known path — so we serve it there and leave
 * robots.txt alone.
 *
 * `force-static` + a 24h `s-maxage`: this content changes only when the seed
 * data or the deployed build changes, so it is prerendered at build time and
 * served from the CDN edge. Zero runtime cost per fetch.
 */
export const dynamic = 'force-static';
export const revalidate = 86400;

export async function GET(): Promise<Response> {
  return new Response(buildLlmsTxt(), {
    headers: {
      // `text/plain` per the convention. `charset=utf-8` is not optional —
      // the content carries en-dashes and Spanish accented characters, which
      // mojibake under a default latin-1 interpretation.
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
