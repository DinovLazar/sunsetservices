import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import ServiceAreasHero from '@/components/sections/service-areas/ServiceAreasHero';
import CitiesGrid from '@/components/sections/service-areas/CitiesGrid';
import OutsideAreaBand from '@/components/sections/service-areas/OutsideAreaBand';
import ServiceAreasCTA from '@/components/sections/service-areas/ServiceAreasCTA';
import {LOCATIONS} from '@/data/locations';
import {buildBreadcrumbList} from '@/lib/schema/breadcrumb';
import {buildServiceAreasItemList} from '@/lib/schema/location';
import {routing} from '@/i18n/routing';
import {canonicalUrl, hreflangAlternates} from '@/lib/seo/urls';

type Locale = 'en' | 'es';

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'serviceAreas.meta'});
  const loc: Locale = locale === 'es' ? 'es' : 'en';
  const path = '/service-areas';
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: canonicalUrl(path, loc),
      languages: hreflangAlternates(path),
    },
  };
}

/**
 * Service Areas index — Phase 1.14 (Code) implementing Phase 1.13 design
 * handover.
 *
 * Four sections per handover §2.D10: Hero (split text + map) → Cities grid
 * → Outside-area band → CTA. Surface alternation: bg → cream → bg → cream.
 *
 * Schema: BreadcrumbList + ItemList of 6 Place items, same-source with the
 * visible breadcrumb + cities grid (1.09 §2 rule). Sitewide LocalBusiness
 * already ships from the locale layout — do not duplicate here.
 */
export default async function ServiceAreasPage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const loc = (routing.locales.includes(locale as Locale) ? locale : 'en') as Locale;
  const t = await getTranslations({locale, namespace: 'serviceAreas'});

  const breadcrumbItems = [
    {name: t('breadcrumbHome'), item: locale === 'en' ? '/' : `/${locale}/`},
    {
      name: t('breadcrumbSelf'),
      item: locale === 'en' ? '/service-areas/' : `/${locale}/service-areas/`,
    },
  ];

  const breadcrumbSchema = buildBreadcrumbList(breadcrumbItems);
  const itemListSchema = buildServiceAreasItemList(LOCATIONS, loc);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbSchema)}}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(itemListSchema)}}
      />
      <ServiceAreasHero />
      <CitiesGrid />
      <OutsideAreaBand />
      <ServiceAreasCTA />
    </>
  );
}
