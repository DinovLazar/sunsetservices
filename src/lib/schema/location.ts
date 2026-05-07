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
 */
export function buildPlaceSchema(
  location: LocationCity,
  description: string,
): Record<string, unknown> {
  return {
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
  return {
    '@type': 'ListItem',
    position,
    item: {
      '@type': 'Service',
      name: svc.name[locale],
      url: toAbsolute(localePath(locale, `/${audience}/${svc.slug}/`)),
      areaServed: {
        '@type': 'Place',
        name: `${location.name}, ${location.state}`,
      },
    },
  };
}

/**
 * City page — `FAQPage`, same-source with the visible accordion.
 */
export function buildLocationFaqSchema(
  location: LocationCity,
  locale: Locale,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: location.faq.map((q) => ({
      '@type': 'Question',
      name: q.q[locale],
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.a[locale],
      },
    })),
  };
}

export {localePath};
