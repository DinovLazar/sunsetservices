import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import AboutHero from '@/components/sections/about/AboutHero';
import AboutBrandStory from '@/components/sections/about/AboutBrandStory';
import AboutCredentials from '@/components/sections/about/AboutCredentials';
import AboutCTA from '@/components/sections/about/AboutCTA';
import HomeProjects from '@/components/sections/home/HomeProjects';
import {buildBreadcrumbList} from '@/lib/schema/breadcrumb';
import {canonicalUrl, hreflangAlternates, type Locale} from '@/lib/seo/urls';
import {buildSocialMetadata} from '@/lib/seo/openGraph';

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'about.meta'});
  const loc: Locale = locale === 'es' ? 'es' : 'en';
  const path = '/about';
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
 * About — Phase 1.12 (Code) implementing Phase 1.11 design handover.
 * Polish-01 removed the Team section (and its `Person` JSON-LD): the cards
 * only ever rendered placeholder initial-avatars, undercutting the premium
 * first impression. Org-level identity (sitewide `LocalBusiness` +
 * `Organization` from the locale layout, founder/owner story in the brand
 * copy and chat knowledge base) is untouched.
 *
 * Five sections: Hero → Brand story → Credentials → Projects teaser
 * (HomeProjects literal reuse, §3.6) → CTA.
 *
 * Body amber discipline (§2.4): exactly one amber CTA in `<main>`, in
 * AboutCTA (the §3.7 CTA section).
 *
 * Schema: `BreadcrumbList`. Sitewide `LocalBusiness` already ships from the
 * locale layout (Phase 1.05) — do not duplicate here.
 */
export default async function AboutPage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const tCrumbs = await getTranslations({locale, namespace: 'about.breadcrumb'});

  const breadcrumbs = buildBreadcrumbList([
    {name: tCrumbs('home'), item: locale === 'en' ? '/' : `/${locale}/`},
    {name: tCrumbs('about'), item: locale === 'en' ? '/about/' : `/${locale}/about/`},
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbs)}}
      />
      <AboutHero />
      <AboutBrandStory />
      <AboutCredentials />
      <HomeProjects />
      <AboutCTA />
    </>
  );
}
