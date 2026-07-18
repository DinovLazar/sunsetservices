/**
 * Phase B.17 — the sitewide entity graph (`LocalBusiness` + `Organization`).
 *
 * Extracted from `src/app/[locale]/layout.tsx`, where it was a 25-line inline
 * literal, and expanded. The layout now imports `buildSitewideGraph()`.
 *
 * WHY THIS IS THE HIGHEST-LEVERAGE FILE IN THE SEO WORK
 * ----------------------------------------------------
 * Google and every retrieval-based assistant resolve a business to an ENTITY
 * before they resolve it to a page. The entity is what gets recommended when
 * someone asks "who does paver patios near Aurora?" — the page is just where
 * the citation points. This graph is the machine-readable statement of who
 * that entity is, and it is the only place on the site where the full picture
 * — name, address, hours, credential, every city served, every service
 * offered — exists in one structure a machine can consume without inference.
 *
 * WHAT CHANGED FROM THE PHASE B.04 VERSION
 * ----------------------------------------
 *  - `areaServed`: 6 bare strings → all 22 surfaced cities as typed `City`
 *    nodes with `containedInPlace` state. "Aurora" as a string is ambiguous
 *    (Aurora, Colorado is larger); `City` + `State: Illinois` is not.
 *  - `hasOfferCatalog`: added. All 34 services across 5 divisions, each an
 *    `Offer`→`Service` with the URL of its own page. This is what lets an
 *    assistant answer "do they do radon mitigation?" correctly instead of
 *    guessing from a landscaping company's name.
 *  - `openingHoursSpecification`: added, Mon–Fri only (see below).
 *  - `description`, `foundingDate`, `logo`, `image`, `knowsLanguage`,
 *    `hasCredential`, `alternateName`, `parentOrganization`: added.
 *  - `Organization` gained `contactPoint` with `availableLanguage`
 *    English + Spanish — the bilingual signal was previously invisible to
 *    machines despite the whole site shipping in both languages.
 *  - `sameAs`: added, env-driven, currently empty.
 *  - Explicit `@type` narrowing → `HomeAndConstructionBusiness`, a real
 *    subtype of LocalBusiness that describes this company more precisely than
 *    the generic parent.
 *
 * THREE DELIBERATE OMISSIONS — each of these is a decision, not an oversight:
 *
 *  1. NO `aggregateRating`. The 4.8★/38 figure in `constants/reviews.ts` is
 *     real, but Google's structured-data policy explicitly disallows
 *     self-serving `aggregateRating` on `LocalBusiness` — markup where the
 *     business publishes a rating about itself. It is ineligible for rich
 *     results and is a documented manual-action trigger. The rating stays as
 *     rendered text in the credentials band, where it is honest and useful and
 *     carries no penalty risk. THIS IS A TRAP WORTH KNOWING ABOUT: most "add
 *     schema for better SEO" advice gets it wrong.
 *  2. NO `priceRange`. Google deprecated it, and any value would either be
 *     vague ("$$") or a price claim BG-01 §8.5 forbids.
 *  3. NO `geo` until the real coordinates are confirmed — see
 *     `BUSINESS_GEO` in `constants/business.ts` for why a wrong pin is worse
 *     than no pin.
 *
 * Every `@id` is a stable hash-fragment URI so per-page builders
 * (`Place.areaServed`, `Person.worksFor`, `ContactPage.mainEntity`,
 * `Article.publisher`, `Service.provider`) can reference the entity by ID
 * without restating the NAP block. Those references are why the `@id` values
 * must not change: renaming one silently orphans every page that points at it.
 */

import {SERVICES} from '@/data/services';
import {DIVISIONS} from '@/data/divisions';
import {LOCATIONS, SURFACED_LOCATION_SLUGS} from '@/data/locations';
import {
  BUSINESS_ADDRESS,
  BUSINESS_CREDENTIAL,
  BUSINESS_DESCRIPTION,
  BUSINESS_EMAIL,
  BUSINESS_FOUNDING_YEAR,
  BUSINESS_GEO,
  BUSINESS_LEGAL_NAME,
  BUSINESS_LOGO_PATH,
  BUSINESS_NAME,
  BUSINESS_NAME_FULL,
  BUSINESS_OPENING_HOURS,
  BUSINESS_PHONE_TEL,
  BUSINESS_SAME_AS,
  BUSINESS_URL,
} from '@/lib/constants/business';
import {SITE_URL} from '@/lib/seo/urls';

/** Stable entity IDs. Referenced by per-page schema builders — do not rename. */
export const LOCAL_BUSINESS_ID = `${BUSINESS_URL}/#localbusiness`;
export const ORGANIZATION_ID = `${BUSINESS_URL}/#organization`;

const DIVISION_LABELS: Record<string, string> = {
  landscape: 'Landscape',
  hardscape: 'Hardscape',
  waterproofing: 'Waterproofing',
  'snow-removal': 'Snow Removal',
  trenchless: 'Trenchless & Directional Boring',
};

/**
 * Every city with a live page, as a typed `City` node.
 *
 * `containedInPlace` disambiguates. Without it, "Aurora" is a coin-flip
 * between Illinois and Colorado, and "Geneva" competes with Switzerland.
 */
function buildAreaServed() {
  const visible = new Set<string>(SURFACED_LOCATION_SLUGS);
  return LOCATIONS.filter((l) => visible.has(l.slug)).map((city) => ({
    '@type': 'City',
    name: city.name,
    containedInPlace: {
      '@type': 'State',
      name: 'Illinois',
    },
  }));
}

/**
 * All 34 services as an `OfferCatalog`, grouped into one sub-catalog per
 * division so the structure mirrors the site's own IA.
 *
 * Each leaf carries the URL of the service's real page, which gives an
 * assistant somewhere specific to cite rather than sending everyone to the
 * homepage.
 */
function buildOfferCatalog() {
  const divisionCatalogs = DIVISIONS.map((division) => {
    const services = SERVICES.filter((s) => s.division === division);
    if (services.length === 0) return null;

    return {
      '@type': 'OfferCatalog',
      name: DIVISION_LABELS[division] ?? division,
      url: `${SITE_URL}/${division}`,
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: s.name.en,
          url: `${SITE_URL}/${s.division}/${s.slug}`,
          serviceType: s.name.en,
          provider: {'@id': LOCAL_BUSINESS_ID},
          areaServed: {'@type': 'State', name: 'Illinois'},
        },
      })),
    };
  }).filter(Boolean);

  return {
    '@type': 'OfferCatalog',
    name: `${BUSINESS_NAME_FULL} services`,
    itemListElement: divisionCatalogs,
  };
}

/** Mon–Fri 07:00–17:00. Saturday is by appointment and is NOT emitted. */
function buildOpeningHours() {
  return BUSINESS_OPENING_HOURS.map((block) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [...block.days],
    opens: block.opens,
    closes: block.closes,
  }));
}

/**
 * Build the full sitewide `@graph`.
 *
 * Optional properties are spread in conditionally: an absent property is
 * correct, an empty array or a null value is noise that some validators flag.
 */
export function buildSitewideGraph() {
  const logoUrl = `${SITE_URL}${BUSINESS_LOGO_PATH}`;
  const sameAs = BUSINESS_SAME_AS.length > 0 ? {sameAs: [...BUSINESS_SAME_AS]} : {};
  const geo = BUSINESS_GEO
    ? {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: BUSINESS_GEO.latitude,
          longitude: BUSINESS_GEO.longitude,
        },
      }
    : {};

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        // `HomeAndConstructionBusiness` is a documented LocalBusiness subtype.
        // Both types are listed so consumers that only understand the parent
        // still resolve the node correctly.
        '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
        '@id': LOCAL_BUSINESS_ID,
        name: BUSINESS_NAME_FULL,
        alternateName: BUSINESS_NAME,
        legalName: BUSINESS_LEGAL_NAME,
        description: BUSINESS_DESCRIPTION,
        url: BUSINESS_URL,
        telephone: BUSINESS_PHONE_TEL,
        email: BUSINESS_EMAIL,
        foundingDate: BUSINESS_FOUNDING_YEAR,
        address: {
          '@type': 'PostalAddress',
          ...BUSINESS_ADDRESS,
        },
        ...geo,
        openingHoursSpecification: buildOpeningHours(),
        areaServed: buildAreaServed(),
        hasOfferCatalog: buildOfferCatalog(),
        knowsLanguage: ['en', 'es'],
        hasCredential: BUSINESS_CREDENTIAL,
        logo: logoUrl,
        image: logoUrl,
        parentOrganization: {'@id': ORGANIZATION_ID},
        ...sameAs,
      },
      {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: BUSINESS_NAME_FULL,
        alternateName: BUSINESS_NAME,
        legalName: BUSINESS_LEGAL_NAME,
        description: BUSINESS_DESCRIPTION,
        url: BUSINESS_URL,
        foundingDate: BUSINESS_FOUNDING_YEAR,
        logo: {
          '@type': 'ImageObject',
          url: logoUrl,
        },
        address: {
          '@type': 'PostalAddress',
          ...BUSINESS_ADDRESS,
        },
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: BUSINESS_PHONE_TEL,
            email: BUSINESS_EMAIL,
            contactType: 'customer service',
            areaServed: 'US',
            availableLanguage: ['English', 'Spanish'],
          },
        ],
        ...sameAs,
      },
    ],
  };
}
