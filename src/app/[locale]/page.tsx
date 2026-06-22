import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import HomeHero from '@/components/sections/home/HomeHero';
import HomeAudienceEntries from '@/components/sections/home/HomeAudienceEntries';
import HomeSocialProof from '@/components/sections/home/HomeSocialProof';
import HomeBeforeAfter from '@/components/sections/home/HomeBeforeAfter';
import HomeProcess from '@/components/sections/home/HomeProcess';
import HomeWhySunset from '@/components/sections/home/HomeWhySunset';
import HomeCTA from '@/components/sections/home/HomeCTA';
import {BUSINESS_URL} from '@/lib/constants/business';
import {canonicalUrl, hreflangAlternates, type Locale} from '@/lib/seo/urls';
import {buildSocialMetadata} from '@/lib/seo/openGraph';

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'home.meta'});
  const loc: Locale = locale === 'es' ? 'es' : 'en';
  const social = buildSocialMetadata({
    title: t('title'),
    description: t('description'),
    url: canonicalUrl('/', loc),
    locale: loc,
  });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: canonicalUrl('/', loc),
      languages: hreflangAlternates('/'),
    },
    ...social,
  };
}

/**
 * Homepage — Phase M.16 Concept A redesign. Seven sections per the M.16
 * handover §4: hero → divisions → trust/credentials → before/after → process
 * → why-Sunset → final CTA. Chrome (navbar, footer, skip-link, base shell)
 * wraps via the locale layout.
 *
 * Below-hero deferral uses each section's `content-visibility:auto` +
 * `contain-intrinsic-size` (not `next/dynamic`): these are async Server
 * Components, and Next 16 disallows `next/dynamic` `ssr:false` in Server
 * Components — `content-visibility` is the correct render-deferral lever here.
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
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(websiteSchema)}}
      />
      <HomeHero />
      <HomeAudienceEntries />
      <HomeSocialProof />
      <HomeBeforeAfter />
      <HomeProcess />
      <HomeWhySunset />
      <HomeCTA />
    </>
  );
}
