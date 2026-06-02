import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import LegalPageBody from '@/components/legal/LegalPageBody';
import LegalPageHero from '@/components/legal/LegalPageHero';
import {Body, lastUpdated} from '@/content/legal/terms';
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
 * Terms page — Phase B.03e.
 *
 * Server component: localized cream hero (H1 + last-updated subtitle +
 * breadcrumb) → hard-coded English Terms of Service body (`src/content/legal/
 * terms.tsx`) rendered inside the `.legal-doc` prose chrome and wrapped in
 * `lang="en"`. English-only: the EN (`/terms/`) and ES (`/es/terms/`) routes
 * serve the same English text; a localized `legal.englishOnlyNote` line sits
 * above the body. No Termly embed and no "being prepared" fallback branch
 * (both retired in B.03e).
 *
 * Schema: BreadcrumbList + WebPage JSON-LD (with `name` mapped to the Terms
 * page title). Sitewide LocalBusiness is emitted by the locale layout — not
 * duplicated here. Indexable (no noindex); already carried in the B.05 sitemap.
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
  const tLegal = await getTranslations({locale, namespace: 'legal'});

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
      <LegalPageHero type="terms" locale={locale} lastUpdated={lastUpdated} />
      <LegalPageBody englishOnlyNote={tLegal('englishOnlyNote')}>
        <Body />
      </LegalPageBody>
    </>
  );
}
