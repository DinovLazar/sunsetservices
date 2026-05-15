import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import LegalPageBody from '@/components/legal/LegalPageBody';
import LegalPageHero from '@/components/legal/LegalPageHero';
import {buildBreadcrumbList} from '@/lib/schema/breadcrumb';
import {BUSINESS_URL} from '@/lib/constants/business';

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'legal.privacy.meta'});
  return {
    title: t('title'),
    description: t('description'),
  };
}

/**
 * Privacy page — Phase B.03.
 *
 * Server component: page hero (H1 + last-updated subtitle + breadcrumb)
 * → Termly policy embed (or graceful fallback when env vars are empty).
 *
 * Schema: BreadcrumbList + WebPage JSON-LD. Sitewide LocalBusiness is
 * emitted by the locale layout — not duplicated here.
 *
 * Note: the brief specified a `(marketing)` route group; this codebase
 * uses flat `[locale]/<route>/` routing for every other page (about,
 * contact, blog, projects, etc.). Matching the project convention.
 */
export default async function PrivacyPage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  const tCrumbs = await getTranslations({
    locale,
    namespace: 'legal.breadcrumb',
  });
  const tMeta = await getTranslations({locale, namespace: 'legal.privacy.meta'});

  const url =
    locale === 'en'
      ? `${BUSINESS_URL}/privacy/`
      : `${BUSINESS_URL}/${locale}/privacy/`;

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: tMeta('title'),
    description: tMeta('description'),
    url,
    inLanguage: locale === 'es' ? 'es' : 'en',
  };

  const breadcrumbs = buildBreadcrumbList([
    {name: tCrumbs('home'), item: locale === 'en' ? '/' : `/${locale}/`},
    {
      name: tCrumbs('privacy'),
      item: locale === 'en' ? '/privacy/' : `/${locale}/privacy/`,
    },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(webPageJsonLd)}}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbs)}}
      />
      <LegalPageHero type="privacy" locale={locale} />
      <LegalPageBody type="privacy" />
    </>
  );
}
