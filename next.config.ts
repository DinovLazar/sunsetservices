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

/**
 * Phase B.18 — redirects from the retired V1 (WordPress) URL scheme.
 *
 * THE PROBLEM THESE FIX
 * ---------------------
 * The V1 WordPress site ran on this same domain for years and earned real
 * ranking signal. The V2 rebuild changed every path, and nothing was ever
 * redirected — so the URLs Google still has indexed now return 404. Verified
 * live on 2026-07-18:
 *
 *     https://sunsetservices.us/about-us/              → 404
 *     https://sunsetservices.us/hardscaping-services/  → 404
 *     https://sunsetservices.us/privacy-policy/        → 404
 *     https://sunsetservices.us/yellow-grass-chicago-lawn-fix/ → 404
 *
 * All four are still returned by a `site:sunsetservices.us` search, which
 * means real people click them and land on an error page, and whatever link
 * equity those pages accumulated is being thrown away rather than passed to
 * the pages that replaced them. A 301/308 to the closest equivalent is how
 * that signal transfers.
 *
 * CONFIRMED vs. INFERRED
 * ----------------------
 * The V1 site is gone, so its full URL list cannot be enumerated — there is no
 * old sitemap, no crawl, no archive in this repo. The table below is therefore
 * in two halves, and the distinction is deliberate:
 *
 *   - CONFIRMED — verified indexed AND verified 404ing today. These are the
 *     ones actually costing something.
 *   - INFERRED — conventional WordPress paths for the services the V1 site is
 *     known to have offered (the old copy described "landscape design,
 *     maintenance, hardscaping, commercial services, tree removal, snow
 *     removal"). Each 404s today. A redirect for a URL that never existed is
 *     inert — nothing requests it — so the cost is zero and the payoff is
 *     catching a real legacy URL this list would otherwise miss.
 *
 * WHEN GOOGLE SEARCH CONSOLE IS CONNECTED, REPLACE THE GUESSWORK: the Pages →
 * "Not found (404)" report lists the real legacy URLs Google is still trying.
 * Move anything real from that report into the CONFIRMED half and delete the
 * inferred entries that never appear. See the ranking playbook, Week 1.
 *
 * NO ES VARIANTS. Unlike `buildRedirects()` above, these get no `/es` pair —
 * the V1 site was English-only, so `/es/about-us/` never existed and never
 * earned anything.
 *
 * Both slash variants are listed explicitly so a legacy URL resolves in ONE
 * hop. Without the with-slash entry, `/about-us/` would 308 to `/about-us`
 * (the `trailingSlash: false` default) and only then to `/about` — a two-hop
 * chain that dilutes the signal being passed.
 */
function buildLegacyRedirects() {
  const pairs: Array<[string, string]> = [
    // ────────────── CONFIRMED: indexed + 404ing as of 2026-07-18 ──────────────
    ['/about-us', '/about'],
    ['/hardscaping-services', '/hardscape'],
    ['/privacy-policy', '/privacy'],
    // The V1 lawn-yellowing article. V2 republished the same subject at
    // /blog/why-is-my-lawn-yellow (confirmed live in the sitemap), so this is
    // a true content match, not a homepage dump.
    ['/yellow-grass-chicago-lawn-fix', '/blog/why-is-my-lawn-yellow'],

    // ────────────── INFERRED: conventional V1 paths, all 404 today ──────────────
    // Division-level equivalents.
    ['/landscaping-services', '/landscape'],
    ['/snow-removal-services', '/snow-removal'],
    ['/tree-services', '/landscape/tree-services'],
    ['/landscape-design', '/landscape/landscape-design'],
    ['/lawn-care', '/landscape/lawn-care'],
    ['/outdoor-living', '/hardscape'],
    ['/patios', '/hardscape/patios-walkways'],
    ['/driveways', '/hardscape/driveways'],
    // Navigational pages.
    ['/contact-us', '/contact'],
    ['/services', '/'],
    ['/commercial-services', '/'],
    ['/home', '/'],
    ['/gallery', '/projects'],
    ['/portfolio', '/projects'],
    ['/testimonials', '/'],
    ['/request-a-quote', '/request-quote'],
    ['/free-estimate', '/request-quote'],
    // WordPress leftovers.
    ['/feed', '/blog'],
  ];

  const redirects: Array<{source: string; destination: string; permanent: true}> = [];
  const withSlash = (s: string): string => (s === '/' ? '/' : `${s}/`);
  for (const [from, to] of pairs) {
    redirects.push({source: from, destination: to, permanent: true});
    redirects.push({source: `${from}/`, destination: withSlash(to), permanent: true});
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
    // Order matters only if two sources could collide; they cannot here
    // (the M.01e set is all `/residential|/commercial|/service-areas` paths,
    // the B.18 set is all retired WordPress paths). Concatenated for clarity.
    return [...buildRedirects(), ...buildLegacyRedirects()];
  },
};

export default withNextIntl(nextConfig);
