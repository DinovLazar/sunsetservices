import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import LegalPageBody from '@/components/legal/LegalPageBody';
import LegalPageHero from '@/components/legal/LegalPageHero';
import {buildBreadcrumbList} from '@/lib/schema/breadcrumb';
import {canonicalUrl, hreflangAlternates, type Locale} from '@/lib/seo/urls';

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'legal.terms.meta'});
  const loc: Locale = locale === 'es' ? 'es' : 'en';
  const path = '/terms';
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
 * Terms page — Phase B.03.
 *
 * Server component: page hero (H1 + last-updated subtitle + breadcrumb)
 * → Termly policy embed (or graceful fallback when env vars are empty).
 *
 * Schema: BreadcrumbList + WebPage JSON-LD (with `name` mapped to the
 * Terms page title). Sitewide LocalBusiness is emitted by the locale
 * layout — not duplicated here.
 *
 * Routing note: the brief specified a `(marketing)` route group; this
 * codebase uses flat `[locale]/<route>/` routing for every other page.
 * Matching the project convention.
 */
export default async function TermsPage({
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
  const tMeta = await getTranslations({locale, namespace: 'legal.terms.meta'});

  const url = canonicalUrl('/terms', locale === 'es' ? 'es' : 'en');

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
      name: tCrumbs('terms'),
      item: locale === 'en' ? '/terms/' : `/${locale}/terms/`,
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
      <LegalPageHero type="terms" locale={locale} />
      <LegalPageBody type="terms" />
    </>
  );
}
