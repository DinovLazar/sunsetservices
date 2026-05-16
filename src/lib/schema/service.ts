/**
 * Service + FAQPage + ItemList JSON-LD payload builders per Phase 1.08 §5.
 *
 * The FAQPage schema is generated server-side from the same `faq` array
 * the visible accordion consumes, so the rendered HTML and the schema
 * cannot drift. Same rule for ItemList on audience landings.
 */

import {BUSINESS_URL} from '@/lib/constants/business';
import type {Service, Audience, Localized} from '@/data/services';

type Locale = 'en' | 'es';

function pickLocalized(value: Localized, locale: Locale): string {
  return value[locale];
}

function toAbsolute(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const safe = path.startsWith('/') ? path : `/${path}`;
  return `${BUSINESS_URL}${safe}`;
}

/** Page URL helper for a given locale + path (locale prefix `as-needed`). */
export function localePath(locale: Locale, path: string): string {
  const safe = path.startsWith('/') ? path : `/${path}`;
  return locale === 'en' ? safe : `/${locale}${safe}`;
}

/**
 * Service JSON-LD per §5.2.
 * `provider` is an `@id` reference to the sitewide LocalBusiness emitted from
 * the locale layout (Phase B.04). Resolves through the document-level graph
 * so the NAP block isn't restated.
 */
export function buildServiceSchema(
  service: Service,
  locale: Locale,
): Record<string, unknown> {
  const url = toAbsolute(localePath(locale, `/${service.audience}/${service.slug}/`));
  const offerUrl = toAbsolute(
    localePath(locale, `/request-quote/?service=${service.slug}`),
  );
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: pickLocalized(service.name, locale),
    name: pickLocalized(service.hero.h1, locale),
    description: pickLocalized(service.hero.subhead, locale),
    provider: {'@id': `${BUSINESS_URL}/#localbusiness`},
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'DuPage County, Illinois',
    },
    audience: {
      '@type': 'Audience',
      audienceType: service.audience,
    },
    url,
    offers: {
      '@type': 'Offer',
      url: offerUrl,
    },
  };
}

// Phase 2.05 — `buildFaqPageSchema` was removed; FAQs now come from Sanity
// and pages use `buildContentFaqSchema` from `./article.ts` (takes already-
// projected `{q, a}` strings).

export function buildAudienceItemList(
  audience: Audience,
  services: Service[],
  locale: Locale,
  audienceDisplayName: string,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${audienceDisplayName} services`,
    itemListElement: services.map((s, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: toAbsolute(localePath(locale, `/${audience}/${s.slug}/`)),
      name: pickLocalized(s.name, locale),
    })),
  };
}
