import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * Phase M.01e — permanent redirects from retired audience-aware URLs to
 * their closest-new-equivalent under the new division IA.
 *
 * Each EN redirect has a paired ES redirect at the `/es/...` prefix; each
 * with both no-slash and with-slash variants for robustness against
 * client redirect handling. `permanent: true` emits HTTP 308 (Next.js
 * default for permanent); for SEO purposes 308 passes equity the same
 * as 301 in Google's redirect classifier.
 *
 * Coverage matrix:
 *   - 10 service detail URLs (6 residential + 4 commercial) × 2 locales
 *     × 2 slash-variants = 40 entries
 *   - 2 audience landings (/residential, /commercial) × 2 locales × 2
 *     variants = 8 entries (→ homepage per Goran)
 *   - 2 retired city pages × 2 locales × 2 variants = 8 entries
 *     (→ /service-areas/)
 *
 * Hardscape service URLs (/hardscape/<slug>/) keep the same URL — no
 * redirect entry needed since the path is unchanged after the route
 * rename ([audience] → [division]).
 */
function buildRedirects() {
  const pairs: Array<[string, string]> = [
    // ── Residential service detail → Landscape (or new snow slug) ──
    ['/residential/lawn-care', '/landscape/lawn-care'],
    ['/residential/landscape-design', '/landscape/landscape-design'],
    ['/residential/tree-services', '/landscape/tree-services'],
    ['/residential/sprinkler-systems', '/landscape/sprinkler-systems'],
    ['/residential/seasonal-cleanup', '/landscape/seasonal-cleanup'],
    ['/residential/snow-removal', '/snow-removal/driveway-snow-removal'],
    // ── Commercial service detail → Landscape (or new snow slug) ──
    ['/commercial/landscape-maintenance', '/landscape/landscape-maintenance'],
    ['/commercial/property-enhancement', '/landscape/property-enhancement'],
    ['/commercial/turf-management', '/landscape/turf-management'],
    ['/commercial/snow-removal', '/snow-removal/commercial-snow-plowing'],
    // ── Audience landings → homepage (Goran's literal call) ──
    ['/residential', '/'],
    ['/commercial', '/'],
    // ── Retired city pages → service-areas index ──
    ['/service-areas/lisle', '/service-areas'],
    ['/service-areas/bolingbrook', '/service-areas'],
  ];

  const redirects: Array<{
    source: string;
    destination: string;
    permanent: true;
  }> = [];
  // Helper: append a trailing slash unless the destination is already "/"
  // (a literal homepage). `/` + `/` would parse as the invalid URL `//`.
  const withSlash = (s: string): string => (s === '/' ? '/' : `${s}/`);
  for (const [from, to] of pairs) {
    // EN — no-slash + with-slash sources, mapped to matching destinations.
    redirects.push({source: from, destination: to, permanent: true});
    redirects.push({source: `${from}/`, destination: withSlash(to), permanent: true});
    // ES — same, prefixed with `/es`. `/es/` is the ES homepage.
    redirects.push({source: `/es${from}`, destination: `/es${to}`, permanent: true});
    redirects.push({
      source: `/es${from}/`,
      destination: `/es${withSlash(to)}`,
      permanent: true,
    });
  }
  return redirects;
}

const nextConfig: NextConfig = {
  // Strict mode is on by default in Next 16.
  // Phase M.01c: allow next/image to serve real project photography from
  // the Sanity asset CDN (urlFor() builds cdn.sanity.io URLs).
  images: {
    remotePatterns: [
      {protocol: 'https', hostname: 'cdn.sanity.io'},
    ],
  },
  async redirects() {
    return buildRedirects();
  },
};

export default withNextIntl(nextConfig);
