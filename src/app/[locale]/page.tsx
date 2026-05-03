import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import HomeHero from '@/components/sections/home/HomeHero';
import HomeAudienceEntries from '@/components/sections/home/HomeAudienceEntries';
import HomeServicesOverview from '@/components/sections/home/HomeServicesOverview';
import HomeSocialProof from '@/components/sections/home/HomeSocialProof';
import HomeAbout from '@/components/sections/home/HomeAbout';
import HomeProjects from '@/components/sections/home/HomeProjects';
import HomeCTA from '@/components/sections/home/HomeCTA';
import {BUSINESS_URL} from '@/lib/constants/business';

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'home.meta'});
  return {
    title: t('title'),
    description: t('description'),
  };
}

/**
 * Homepage — Phase 1.07. Seven sections per Phase 1.06 handover; chrome
 * (navbar, footer, skip-link, base shell) wraps via the locale layout.
 *
 * `WebSite` JSON-LD ships from this page only; `Organization` and
 * `LocalBusiness` are sitewide from the locale layout (Phase 1.05 §3.7) —
 * do not duplicate them here.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Sunset Services',
    url: `${BUSINESS_URL}/`,
    inLanguage: ['en-US', 'es-US'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BUSINESS_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(websiteSchema)}}
      />
      <HomeHero />
      <HomeAudienceEntries />
      <HomeServicesOverview />
      <HomeSocialProof />
      <HomeAbout />
      <HomeProjects />
      <HomeCTA />
    </>
  );
}
