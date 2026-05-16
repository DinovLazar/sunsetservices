import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import AboutHero from '@/components/sections/about/AboutHero';
import AboutBrandStory from '@/components/sections/about/AboutBrandStory';
import AboutTeam from '@/components/sections/about/AboutTeam';
import AboutCredentials from '@/components/sections/about/AboutCredentials';
import AboutCTA from '@/components/sections/about/AboutCTA';
import HomeProjects from '@/components/sections/home/HomeProjects';
import {team} from '@/data/team';
import {buildPersonSchema} from '@/lib/schema/person';
import {buildBreadcrumbList} from '@/lib/schema/breadcrumb';
import {canonicalUrl, hreflangAlternates, type Locale} from '@/lib/seo/urls';

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'about.meta'});
  const loc: Locale = locale === 'es' ? 'es' : 'en';
  const path = '/about';
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
 * About — Phase 1.12 (Code) implementing Phase 1.11 design handover.
 *
 * Six sections per handover §2.1: Hero → Brand story → Team → Credentials
 * → Projects teaser (HomeProjects literal reuse, §3.6) → CTA.
 *
 * Surface alternation (§2.3): white / cream / white / cream / white / cream.
 * Body amber discipline (§2.4): exactly one amber CTA in `<main>`, in
 * AboutCTA (the §3.7 CTA section).
 *
 * Schema: `Person` × 3 (Erick, Nick, Marcin) + `BreadcrumbList`. Sitewide
 * `LocalBusiness` already ships from the locale layout (Phase 1.05) — do
 * not duplicate here.
 */
export default async function AboutPage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const tCrumbs = await getTranslations({locale, namespace: 'about.breadcrumb'});

  const personSchemas = team.map((m) => buildPersonSchema(m));
  const breadcrumbs = buildBreadcrumbList([
    {name: tCrumbs('home'), item: locale === 'en' ? '/' : `/${locale}/`},
    {name: tCrumbs('about'), item: locale === 'en' ? '/about/' : `/${locale}/about/`},
  ]);

  return (
    <>
      {personSchemas.map((p, i) => (
        <script
          key={`person-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(p)}}
        />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbs)}}
      />
      <AboutHero />
      <AboutBrandStory />
      <AboutTeam />
      <AboutCredentials />
      <HomeProjects />
      <AboutCTA />
    </>
  );
}
