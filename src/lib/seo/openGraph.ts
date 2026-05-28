/**
 * Phase M.10d §B — single source of truth for `openGraph` + `twitter`
 * metadata blocks. Every `generateMetadata` that emits social-preview
 * cards should spread `buildSocialMetadata({...})` into its return so
 * the shape stays consistent (siteName, locale, 1200×630 image, twitter
 * `summary_large_image`).
 *
 * The defaults intentionally point `og:image` at `/og/fallback` — the
 * polished sitewide branded card. Per-page builders may override with a
 * better-fitting image (e.g. blog/resource detail pass the dynamic
 * `/og/{type}/{slug}` route).
 *
 * `metadataBase` is already set sitewide in `src/app/[locale]/layout.tsx`
 * (Phase B.05), so any relative `images.url` would resolve correctly —
 * but every URL emitted by this helper is **absolute** so HTML inspection
 * tools and external scrapers see the same string Next does. That matters
 * especially because the Preview deployment is SSO-protected; an absolute
 * URL in the source is the simplest thing to verify by curl.
 */

import type {Metadata} from 'next';
import {BUSINESS_NAME} from '@/lib/constants/business';
import {SITE_URL, type Locale} from './urls';

type OgImage = {
  /** Absolute URL (preferred) or path relative to `metadataBase`. */
  url: string;
  /** Required — `og:image:alt`. */
  alt: string;
  /** Defaults to 1200. */
  width?: number;
  /** Defaults to 630. */
  height?: number;
};

export type SocialMetadataInput = {
  /** `og:title` + `twitter:title`. Usually the page H1 or a tightened version. */
  title: string;
  /** `og:description` + `twitter:description`. ≤ ~160 chars works best on most platforms. */
  description: string;
  /** Absolute canonical URL for this page (use `canonicalUrl(path, locale)`). */
  url: string;
  /** Site locale — drives `og:locale` (`en_US` / `es_ES`). */
  locale: Locale;
  /** `og:type`. Default `'website'`. Use `'article'` on blog/resource detail. */
  type?: 'website' | 'article';
  /** Image list. Omit to use the sitewide `/og/fallback` card. */
  images?: OgImage[];
  /** ISO timestamp for `article:published_time` (type='article' only). */
  publishedTime?: string;
};

/**
 * Build the `openGraph` + `twitter` blocks for a `generateMetadata` return.
 *
 * Usage:
 * ```ts
 * const social = buildSocialMetadata({
 *   title: t('title'),
 *   description: t('description'),
 *   url: canonicalUrl(path, loc),
 *   locale: loc,
 * });
 * return {
 *   title: t('title'),
 *   description: t('description'),
 *   alternates: {canonical: ..., languages: ...},
 *   ...social,
 * };
 * ```
 */
export function buildSocialMetadata(input: SocialMetadataInput): {
  openGraph: NonNullable<Metadata['openGraph']>;
  twitter: NonNullable<Metadata['twitter']>;
} {
  const ogLocale = input.locale === 'es' ? 'es_ES' : 'en_US';

  const defaultImage: OgImage = {
    url: `${SITE_URL}/og/fallback`,
    alt:
      input.locale === 'es'
        ? 'Sunset Services — paisajismo, hardscape e impermeabilización en los suburbios oeste de Chicago.'
        : "Sunset Services — landscaping, hardscape, and snow management in Chicago's western suburbs.",
    width: 1200,
    height: 630,
  };

  const normalizedImages = (input.images && input.images.length > 0
    ? input.images
    : [defaultImage]
  ).map((img) => ({
    url: img.url,
    alt: img.alt,
    width: img.width ?? 1200,
    height: img.height ?? 630,
  }));

  const openGraph: NonNullable<Metadata['openGraph']> = {
    title: input.title,
    description: input.description,
    url: input.url,
    siteName: BUSINESS_NAME,
    locale: ogLocale,
    type: input.type ?? 'website',
    images: normalizedImages,
  };

  if (input.publishedTime && (input.type ?? 'website') === 'article') {
    (openGraph as {publishedTime?: string}).publishedTime = input.publishedTime;
  }

  return {
    openGraph,
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: normalizedImages.map((img) => img.url),
    },
  };
}
