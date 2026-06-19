/**
 * Phase B.05 — single source of truth for site-URL + canonical-URL + hreflang
 * construction. Every `generateMetadata`, the `sitemap.ts`, the `robots.ts`,
 * and the validation harness in `scripts/validate-seo.mjs` consume these
 * helpers — no page or build target should hand-roll an absolute URL.
 *
 * Locked decisions (Phase B.05 plan §"Locked decisions"):
 *
 * - D1. Canonicals strip the trailing slash everywhere. Next 16's default is
 *   `trailingSlash: false`; `/projects/` 308-redirects to `/projects`. Every
 *   canonical must match the served URL exactly — no trailing slash on any
 *   canonical, including the homepage (`https://sunsetservices.us` — no slash
 *   beyond the host). The EN root is `SITE_URL` (no path). The ES root is
 *   `SITE_URL + '/es'` (no path).
 * - D2. `x-default` hreflang points at the EN URL (no `/es` prefix).
 * - D9. Site-URL resolution: `NEXT_PUBLIC_SITE_URL || BUSINESS_URL`, with any
 *   trailing slash stripped. Centralized here; every page imports from here.
 * - D10. Hreflang URLs match canonical URLs exactly — no trailing slash, no
 *   `?query`, no `#fragment`. `x-default` URL equals the EN URL.
 */

import {BUSINESS_URL} from '@/lib/constants/business';

export type Locale = 'en' | 'es';

/**
 * Canonical site origin — `NEXT_PUBLIC_SITE_URL` (when set) overrides
 * `BUSINESS_URL` so localhost test runs can pass Lighthouse's canonical
 * host-match audit. Always trailing-slash-stripped.
 */
export const SITE_URL: string = (
  process.env.NEXT_PUBLIC_SITE_URL || BUSINESS_URL
).replace(/\/+$/, '');

/**
 * True only on the production deployment (`sunsetservices.us`). Vercel sets
 * `VERCEL_ENV` to `'production' | 'preview' | 'development'` automatically.
 *
 * Phase M.14 (Goran QA B-09 §3.12): preview / development deployments must
 * NOT be indexable. Drives `robots.ts` (Disallow: /) and the root layout's
 * `robots: noindex` meta so the staging URL never competes with production
 * in search. Production stays fully crawlable.
 */
export function isProductionDeploy(): boolean {
  return process.env.VERCEL_ENV === 'production';
}

/**
 * Normalize a locale-less pathname to a no-trailing-slash form.
 *
 *   '/' → ''           (caller appends host or `/es` for the root case)
 *   '/about' → '/about'
 *   '/about/' → '/about'
 *   '/blog/foo/' → '/blog/foo'
 *
 * Strips any trailing query/fragment defensively (callers should not pass
 * them, but if they do we don't want them in a canonical URL).
 */
function normalizePath(pathname: string): string {
  const cleaned = pathname.split('?')[0].split('#')[0];
  const withLeading = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
  if (withLeading === '/') return '';
  return withLeading.replace(/\/+$/, '');
}

/**
 * Build a no-trailing-slash absolute canonical URL for a page.
 *
 * `pathname` is the **locale-less** path — `/about`, `/projects/foo`,
 * `/service-areas/aurora`, or `/` for the home. Callers do NOT prefix it
 * with `/es`; this helper adds the prefix when `locale === 'es'`.
 *
 *   canonicalUrl('/', 'en')              → 'https://sunsetservices.us'
 *   canonicalUrl('/', 'es')              → 'https://sunsetservices.us/es'
 *   canonicalUrl('/about', 'en')         → 'https://sunsetservices.us/about'
 *   canonicalUrl('/about/', 'es')        → 'https://sunsetservices.us/es/about'
 *   canonicalUrl('/projects/foo', 'es')  → 'https://sunsetservices.us/es/projects/foo'
 */
export function canonicalUrl(pathname: string, locale: Locale): string {
  const norm = normalizePath(pathname);
  const localePrefix = locale === 'es' ? '/es' : '';
  return `${SITE_URL}${localePrefix}${norm}`;
}

/**
 * Build the three hreflang URLs for a page.
 *
 * `pathname` is the **locale-less** path; this helper produces the EN URL,
 * the ES URL, and `x-default` (which mirrors EN per D2 + D10). Every URL is
 * absolute and trailing-slash-stripped.
 *
 *   hreflangAlternates('/about') → {
 *     en: 'https://sunsetservices.us/about',
 *     es: 'https://sunsetservices.us/es/about',
 *     'x-default': 'https://sunsetservices.us/about',
 *   }
 */
export function hreflangAlternates(pathname: string): {
  en: string;
  es: string;
  'x-default': string;
} {
  const en = canonicalUrl(pathname, 'en');
  const es = canonicalUrl(pathname, 'es');
  return {en, es, 'x-default': en};
}
