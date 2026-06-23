import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import ContactHero from '@/components/sections/contact/ContactHero';
import ContactInfoForm from '@/components/sections/contact/ContactInfoForm';
import ContactMapPlaceholder from '@/components/sections/contact/ContactMapPlaceholder';
import ServiceAreaStrip from '@/components/sections/ServiceAreaStrip';
import {buildContactPageSchema} from '@/lib/schema/contactPage';
import {buildBreadcrumbList} from '@/lib/schema/breadcrumb';
import {canonicalUrl, hreflangAlternates, type Locale} from '@/lib/seo/urls';
import {buildSocialMetadata} from '@/lib/seo/openGraph';

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'contact.meta'});
  const loc: Locale = locale === 'es' ? 'es' : 'en';
  const path = '/contact';
  const social = buildSocialMetadata({
    title: t('title'),
    description: t('description'),
    url: canonicalUrl(path, loc),
    locale: loc,
  });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: canonicalUrl(path, loc),
      languages: hreflangAlternates(path),
    },
    ...social,
  };
}

/**
 * Contact — Phase 1.12 (Code) implementing Phase 1.11 design handover.
 *
 * Sections: Hero → Info+Form → Map → Service-area strip. NO body amber CTA
 * section (D11 lock — the page IS the conversion surface). The Calendly
 * "book a 30-min slot" section was removed (booking retired site-wide).
 *
 * Schema: `ContactPage` + `BreadcrumbList`. Sitewide `LocalBusiness` ships
 * from the locale layout — `ContactPage.mainEntity` references it by `@id`.
 */
export default async function ContactPage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const tCrumbs = await getTranslations({locale, namespace: 'contact.breadcrumb'});

  const contactPage = buildContactPageSchema(locale === 'es' ? 'es' : 'en');
  const breadcrumbs = buildBreadcrumbList([
    {name: tCrumbs('home'), item: locale === 'en' ? '/' : `/${locale}/`},
    {name: tCrumbs('contact'), item: locale === 'en' ? '/contact/' : `/${locale}/contact/`},
  ]);

  const localeForForm: 'en' | 'es' = locale === 'es' ? 'es' : 'en';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(contactPage)}}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbs)}}
      />
      <ContactHero />
      <ContactInfoForm locale={localeForForm} />
      <ContactMapPlaceholder />
      <ServiceAreaStrip />
    </>
  );
}
