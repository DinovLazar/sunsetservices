import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import LegalPageBody from '@/components/legal/LegalPageBody';
import LegalPageHero from '@/components/legal/LegalPageHero';
import {Body, lastUpdated} from '@/content/legal/privacy';
import {buildBreadcrumbList} from '@/lib/schema/breadcrumb';
import {canonicalUrl, hreflangAlternates, type Locale} from '@/lib/seo/urls';

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'legal.privacy.meta'});
  const loc: Locale = locale === 'es' ? 'es' : 'en';
  const path = '/privacy';
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
 * Privacy page — Phase B.03e.
 *
 * Server component: localized cream hero (H1 + last-updated subtitle +
 * breadcrumb) → hard-coded English Privacy Policy body (`src/content/legal/
 * privacy.tsx`) rendered inside the `.legal-doc` prose chrome and wrapped in
 * `lang="en"`. English-only: the EN (`/privacy/`) and ES (`/es/privacy/`)
 * routes serve the same English text; a localized `legal.englishOnlyNote` line
 * sits above the body. No Termly embed and no "being prepared" fallback branch
 * (both retired in B.03e).
 *
 * Schema: BreadcrumbList + WebPage JSON-LD. Sitewide LocalBusiness is emitted
 * by the locale layout — not duplicated here. Indexable (no noindex); already
 * carried in the B.05 sitemap.
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
  const tLegal = await getTranslations({locale, namespace: 'legal'});

  const url = canonicalUrl('/privacy', locale === 'es' ? 'es' : 'en');

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
      <LegalPageHero type="privacy" locale={locale} lastUpdated={lastUpdated} />
      <LegalPageBody englishOnlyNote={tLegal('englishOnlyNote')}>
        <Body />
      </LegalPageBody>
    </>
  );
}
