import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import LocationHero from '@/components/sections/location/LocationHero';
import LocalTrustBand from '@/components/sections/location/LocalTrustBand';
import LocationServicesGrid from '@/components/sections/location/LocationServicesGrid';
import LocalProjectsStrip from '@/components/sections/location/LocalProjectsStrip';
import LocalTestimonials from '@/components/sections/location/LocalTestimonials';
import WhyLocalPanel from '@/components/sections/location/WhyLocalPanel';
import LocationFaq from '@/components/sections/location/LocationFaq';
import LocationCTA from '@/components/sections/location/LocationCTA';
import ServiceAreaStrip from '@/components/sections/ServiceAreaStrip';
import {getLocation, isLocationSlug, LOCATIONS} from '@/data/locations';
import {buildBreadcrumbList} from '@/lib/schema/breadcrumb';
import {
  buildPlaceSchema,
  buildLocationServicesItemList,
} from '@/lib/schema/location';
import {buildContentFaqSchema} from '@/lib/schema/article';
import {routing} from '@/i18n/routing';
import {canonicalUrl, hreflangAlternates} from '@/lib/seo/urls';
import {getFaqsForCity, getPublishedReviewsForCity} from '@sanity-lib/queries';

// Phase 2.05 — ISR (30 min) so Sanity FAQ edits propagate without a redeploy.
export const revalidate = 1800;

type Locale = 'en' | 'es';

export function generateStaticParams() {
  return LOCATIONS.map((loc) => ({city: loc.slug}));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string; city: string}>;
}): Promise<Metadata> {
  const {locale, city} = await params;
  if (!isLocationSlug(city)) return {};
  const location = getLocation(city);
  if (!location) return {};
  const loc = (routing.locales.includes(locale as Locale) ? locale : 'en') as Locale;
  const path = `/service-areas/${city}`;

  return {
    title: location.meta.title[loc],
    description: location.meta.description[loc],
    alternates: {
      canonical: canonicalUrl(path, loc),
      languages: hreflangAlternates(path),
    },
  };
}

/**
 * Location (city) page — Phase 1.14 (Code) implementing Phase 1.13 design
 * handover.
 *
 * Nine sections per §2.D10: Hero → LocalTrustBand → ServicesGrid →
 * ProjectsStrip → Testimonials → WhyLocalPanel → ServiceAreaStrip
 * (excluded current city) → FAQ → CTA. Surface alternation:
 * bg → cream → bg → cream → bg → cream → bg → cream → bg.
 *
 * Schema: BreadcrumbList + Place + ItemList of 6 Service items + FAQPage,
 * each same-source with the corresponding visible block (1.09 §2). The
 * sitewide LocalBusiness ships from the locale layout — Place
 * `areaServed` references it by `@id`.
 */
export default async function LocationPage({
  params,
}: {
  params: Promise<{locale: string; city: string}>;
}) {
  const {locale, city} = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  if (!isLocationSlug(city)) notFound();
  const location = getLocation(city);
  if (!location) notFound();
  const loc = locale as Locale;
  setRequestLocale(loc);

  // Breadcrumb labels read from the same `location.*` i18n keys the
  // visible <Breadcrumb> in LocationHero consumes — same-source rule.
  const t = await getTranslations({locale, namespace: 'location'});
  const breadcrumbItems = [
    {name: t('breadcrumbHome'), item: loc === 'en' ? '/' : `/${loc}/`},
    {
      name: t('breadcrumbServiceAreas'),
      item: loc === 'en' ? '/service-areas/' : `/${loc}/service-areas/`,
    },
    {
      name: location.name,
      item:
        loc === 'en'
          ? `/service-areas/${location.slug}/`
          : `/${loc}/service-areas/${location.slug}/`,
    },
  ];

  const breadcrumbSchema = buildBreadcrumbList(breadcrumbItems);

  // Phase B.04 — published (non-placeholder) reviews drive the optional
  // `review[]` + `aggregateRating` fields on the Place node. Today the
  // helper returns `[]` for every city (no real reviews exist yet); the
  // Phase 2.14 + 2.16 daily Google reviews cron will land entries once
  // Google's GBP API approval clears, and they'll flow through unchanged.
  const publishedReviews = await getPublishedReviewsForCity(city, loc);
  const placeSchema = buildPlaceSchema(
    location,
    location.meta.description[loc],
    publishedReviews,
    loc,
  );
  const servicesSchema = buildLocationServicesItemList(
    location,
    location.featuredServices,
    loc,
  );

  // Phase 2.05 — FAQs come from Sanity, scope `city:<slug>`.
  const faqs = await getFaqsForCity(city);
  const faqItems = faqs.map((f, idx) => ({
    id: `loc-${location.slug}-faq-${idx}`,
    question: f.question[loc],
    answer: f.answer[loc],
  }));
  const faqSchema = buildContentFaqSchema(
    faqs.map((f) => ({q: f.question[loc], a: f.answer[loc]})),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbSchema)}}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(placeSchema)}}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(servicesSchema)}}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(faqSchema)}}
      />
      <LocationHero location={location} locale={loc} />
      <LocalTrustBand location={location} locale={loc} />
      <LocationServicesGrid location={location} locale={loc} />
      <LocalProjectsStrip location={location} />
      <LocalTestimonials location={location} locale={loc} />
      <WhyLocalPanel location={location} locale={loc} />
      <ServiceAreaStrip excludeSlug={location.slug} />
      <LocationFaq cityName={location.name} items={faqItems} />
      <LocationCTA location={location} />
    </>
  );
}
