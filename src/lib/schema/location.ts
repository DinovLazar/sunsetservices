/**
 * Service-areas + location-page JSON-LD payload builders — Phase 1.14 §5.
 *
 * Index page emits BreadcrumbList + ItemList of Place items.
 * City page emits BreadcrumbList + Place + ItemList of Service items + FAQPage.
 *
 * All blocks observe the same-source rule (Phase 1.09 §2): the visible DOM
 * and the JSON-LD consume the same arrays so they can never drift.
 */

import {BUSINESS_URL} from '@/lib/constants/business';
import type {LocationCity, LocationFeaturedService} from '@/data/locations';
import {getService, type Service} from '@/data/services';
import type {PublishedReviewEntry} from '@sanity-lib/types';

type Locale = 'en' | 'es';

function localePath(locale: Locale, path: string): string {
  const safe = path.startsWith('/') ? path : `/${path}`;
  return locale === 'en' ? safe : `/${locale}${safe}`;
}

function toAbsolute(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const safe = path.startsWith('/') ? path : `/${path}`;
  return `${BUSINESS_URL}${safe}`;
}

/**
 * Service Areas index — `ItemList` of 6 Place items.
 */
export function buildServiceAreasItemList(
  locations: readonly LocationCity[],
  locale: Locale,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Sunset Services service areas',
    itemListElement: locations.map((loc, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: toAbsolute(localePath(locale, `/service-areas/${loc.slug}/`)),
      name: `${loc.name}, ${loc.state}`,
      item: {
        '@type': 'Place',
        name: `${loc.name}, ${loc.state}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: loc.name,
          addressRegion: loc.state,
        },
      },
    })),
  };
}

/**
 * City page — `Place` schema. `address.postalCode` omitted until Cowork
 * (Phase 2.04) returns codes per city — Schema.org accepts the page without.
 *
 * Phase B.04 — accepts an optional `reviews` array. When non-empty, the
 * Place node carries `review[]` + `aggregateRating`. When empty (today's
 * reality), neither field is emitted, keeping the schema compact and valid.
 * Real reviews flow when Phase 2.14 + 2.16's daily Google reviews cron lands.
 */
export function buildPlaceSchema(
  location: LocationCity,
  description: string,
  reviews: PublishedReviewEntry[] = [],
  locale: Locale = 'en',
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: `Sunset Services in ${location.name}, ${location.state}`,
    description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: location.name,
      addressRegion: location.state,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: location.geo.lat,
      longitude: location.geo.lng,
    },
    containedInPlace: {
      '@type': 'AdministrativeArea',
      name: 'DuPage County',
    },
    // References the sitewide LocalBusiness emitted from the locale layout.
    areaServed: {'@id': `${BUSINESS_URL}/#localbusiness`},
  };

  if (reviews.length === 0) {
    return base;
  }

  const reviewNodes = reviews.map((r) => ({
    '@type': 'Review',
    reviewBody: r.quote[locale] || r.quote.en,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: r.rating,
      bestRating: 5,
      worstRating: 1,
    },
    author: {
      '@type': 'Person',
      name: r.attribution[locale] || r.attribution.en,
    },
    datePublished: r.publishedAt,
  }));

  const total = reviews.reduce((acc, r) => acc + r.rating, 0);
  const average = Math.round((total / reviews.length) * 10) / 10;

  return {
    ...base,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: average,
      reviewCount: reviews.length,
      bestRating: 5,
      worstRating: 1,
    },
    review: reviewNodes,
  };
}

/**
 * City page — `ItemList` of Service items, same-source with the visible
 * service grid.
 */
export function buildLocationServicesItemList(
  location: LocationCity,
  featuredServices: LocationFeaturedService[],
  locale: Locale,
): Record<string, unknown> {
  const items = featuredServices
    .map((entry, idx) => {
      const svc = getService(entry.slug, entry.audience);
      if (!svc) return null;
      return buildServiceListItem(svc, entry.audience, location, locale, idx + 1);
    })
    .filter((x): x is Record<string, unknown> => x !== null);

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Services offered in ${location.name}, ${location.state}`,
    itemListElement: items,
  };
}

function buildServiceListItem(
  svc: Service,
  audience: LocationFeaturedService['audience'],
  location: LocationCity,
  locale: Locale,
  position: number,
): Record<string, unknown> {
  // Phase B.04 — flat ListItem shape matching `buildAudienceItemList`.
  // The full Service schema (name + serviceType + provider + areaServed + …)
  // lives on the linked service-detail page; here we just need an ordered
  // pointer to it. `location` is referenced via the Place node emitted as a
  // sibling block on the same city page, so per-item duplication isn't needed.
  void location;
  return {
    '@type': 'ListItem',
    position,
    url: toAbsolute(localePath(locale, `/${audience}/${svc.slug}/`)),
    name: svc.name[locale],
  };
}

// Phase 2.05 — `buildLocationFaqSchema` was removed; the city page now
// reads FAQs from Sanity (scope `city:<slug>`) and emits the schema via
// `buildContentFaqSchema` from `./article.ts`.

export {localePath};
