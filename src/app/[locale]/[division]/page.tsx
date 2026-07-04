import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import AudienceHero from '@/components/sections/audience/AudienceHero';
import AudienceQualifier from '@/components/sections/audience/AudienceQualifier';
import AudienceServicesGrid from '@/components/sections/audience/AudienceServicesGrid';
import AudienceFeaturedProjects from '@/components/sections/audience/AudienceFeaturedProjects';
import AudienceWhyUs from '@/components/sections/audience/AudienceWhyUs';
import AudienceUnilockBand from '@/components/sections/audience/AudienceUnilockBand';
import AudienceSocialProof from '@/components/sections/audience/AudienceSocialProof';
import AudienceFAQ from '@/components/sections/audience/AudienceFAQ';
import AudienceCTA from '@/components/sections/audience/AudienceCTA';
import {getServicesForDivision} from '@/data/services';
import {DIVISIONS, getDivisionMeta, isDivision} from '@/data/divisions';
import {AUDIENCE_HERO, AUDIENCE_PROJECT_TILES, DIVISION_HERO, SERVICE_TILE} from '@/data/imageMap';
import {buildBreadcrumbList} from '@/lib/schema/breadcrumb';
import {buildDivisionItemList, localePath} from '@/lib/schema/service';
import {routing} from '@/i18n/routing';
import {canonicalUrl, hreflangAlternates} from '@/lib/seo/urls';
import {buildSocialMetadata} from '@/lib/seo/openGraph';

type Locale = 'en' | 'es';

export function generateStaticParams() {
  return DIVISIONS.map((division) => ({division}));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string; division: string}>;
}): Promise<Metadata> {
  const {locale, division} = await params;
  if (!isDivision(division)) return {};
  const t = await getTranslations({locale, namespace: `division.${division}.meta`});
  const loc: Locale = locale === 'es' ? 'es' : 'en';
  const path = `/${division}`;
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
 * Phase M.01e — division landing page. Replaces the audience landings
 * (`/residential/`, `/commercial/`, `/hardscape/`). Renders 4 division
 * landings via `generateStaticParams` (DIVISIONS × locales = 8 routes).
 *
 * Reuses the existing audience-landing component composition. The accent
 * tokens (`--audience-accent` / `--audience-chip-bg`) are wired by the
 * `[data-division='<slug>']` selectors in globals.css so existing
 * components keep rendering correctly.
 */
export default async function DivisionLandingPage({
  params,
}: {
  params: Promise<{locale: string; division: string}>;
}) {
  const {locale, division} = await params;
  if (!isDivision(division)) notFound();
  if (!routing.locales.includes(locale as Locale)) notFound();
  const loc = locale as Locale;
  setRequestLocale(loc);

  const t = await getTranslations({locale, namespace: `division.${division}`});
  const tShared = await getTranslations({locale, namespace: 'division'});

  const divisionLabel = t('label');
  const homeLabel = tShared('breadcrumbHome');
  const services = getServicesForDivision(division);
  const meta = getDivisionMeta(division);
  // Phase B-15 — a division with its own landing hero (DIVISION_HERO) overrides
  // the generic AUDIENCE_HERO audience alias; the other divisions fall through
  // to their `heroImageKey` audience photo unchanged.
  const heroPhoto = DIVISION_HERO[division] ?? AUDIENCE_HERO[meta.heroImageKey];

  // ---- Schema ----
  const breadcrumbSchema = buildBreadcrumbList([
    {name: homeLabel, item: localePath(loc, '/')},
    {name: divisionLabel, item: localePath(loc, `/${division}/`)},
  ]);
  const itemListSchema = buildDivisionItemList(division, services, loc, divisionLabel);

  // ---- Hero ----
  const heroBlock = {
    audience: division,
    audienceLabel: divisionLabel,
    homeLabel,
    kicker: t('hero.kicker'),
    h1: t('hero.h1'),
    subhead: t('hero.subhead'),
    alt: t('hero.alt'),
    photo: heroPhoto,
    primaryCta: t('hero.primary'),
    secondaryCta: t('hero.secondary'),
  };

  // ---- Qualifier pills ----
  const pills = [
    t('qualifier.pills.one'),
    t('qualifier.pills.two'),
    t('qualifier.pills.three'),
    t('qualifier.pills.four'),
  ] as [string, string, string, string];

  // ---- Services grid: tile photos keyed by URL slug. Asset lookup uses
  // imageKey when present (placeholders for new waterproofing + snow-removal
  // services alias to existing photo keys; M.01f swaps in real photography).
  const tilePhotos: Record<string, {src: string; width: number; height: number; blurDataURL?: string}> = {};
  for (const s of services) {
    const img = SERVICE_TILE[s.imageKey ?? s.slug];
    if (img) tilePhotos[s.slug] = {src: img.src, width: img.width, height: img.height, blurDataURL: img.blurDataURL};
  }

  // ---- Featured projects (3 tiles per division) ----
  const projectImages = AUDIENCE_PROJECT_TILES[meta.projectTilesKey];
  const featuredProjectTiles = (['one', 'two', 'three'] as const).map((key, idx) => ({
    key: `${division}-${key}`,
    title: t(`featuredProjects.tiles.${key}.title`),
    meta: t(`featuredProjects.tiles.${key}.meta`),
    photoSrc: projectImages[idx]?.src ?? '',
  }));

  // ---- Why Sunset (4 props) ----
  const whyProps = (['one', 'two', 'three', 'four'] as const).map((key) => ({
    headline: t(`whySunset.props.${key}.headline`),
    description: t(`whySunset.props.${key}.description`),
    icon: t(`whySunset.props.${key}.icon`),
  }));

  // ---- Social proof credentials (4 chips, division-specific) ----
  // Phase M.14 (Goran QA B-09 B1): the templated testimonials were removed;
  // real Google reviews return in M.14b. `AudienceSocialProof` hides the
  // testimonial heading + grid cleanly while no reviews exist.
  const reviews: {quote: string; name: string; city: string}[] = [];
  const credentials = (['one', 'two', 'three', 'four'] as const).map((key) => ({
    big: t(`socialProof.credentials.${key}.big`),
    sub: t(`socialProof.credentials.${key}.sub`),
  }));

  // ---- FAQ ----
  const faqItems = (['one', 'two', 'three', 'four', 'five'] as const).map((key) => ({
    id: `division-${division}-faq-${key}`,
    question: t(`faq.items.${key}.q`),
    answer: t(`faq.items.${key}.a`),
  }));

  return (
    <div data-division={division}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbSchema)}}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(itemListSchema)}}
      />
      <AudienceHero {...heroBlock} />
      <AudienceQualifier
        eyebrow={t('qualifier.eyebrow')}
        h2={t('qualifier.h2')}
        body={t('qualifier.body')}
        pills={pills}
      />
      <AudienceServicesGrid
        audience={division}
        locale={loc}
        eyebrow={t('servicesGrid.eyebrow')}
        h2={t('servicesGrid.h2')}
        sub={t('servicesGrid.sub')}
        services={services}
        tilePhotos={tilePhotos}
      />
      <AudienceFeaturedProjects
        audience={division}
        locale={loc}
        eyebrow={t('featuredProjects.eyebrow')}
        h2={t('featuredProjects.h2')}
        viewAll={t('featuredProjects.viewAll')}
        tag={divisionLabel.toUpperCase()}
        tiles={featuredProjectTiles}
      />
      <AudienceWhyUs
        eyebrow={t('whySunset.eyebrow')}
        h2={t('whySunset.h2')}
        props={whyProps}
      />
      {division === 'hardscape' ? (
        <AudienceUnilockBand
          eyebrow={t('unilock.eyebrow')}
          h2={t('unilock.h2')}
          body={t('unilock.body')}
          stat={t('unilock.stat')}
          viewProjects={t('unilock.viewProjects')}
          badgeAlt={t('unilock.badgeAlt')}
        />
      ) : null}
      <AudienceSocialProof
        eyebrow={t('socialProof.eyebrow')}
        h2={t('socialProof.h2')}
        reviews={reviews}
        credentials={credentials}
      />
      <AudienceFAQ
        eyebrow={t('faq.eyebrow')}
        h2={t('faq.h2')}
        items={faqItems}
      />
      <AudienceCTA
        audience={division}
        eyebrow={t('cta.eyebrow')}
        h2={t('cta.h2')}
        body={t('cta.body')}
        buttonLabel={t('cta.button')}
        phonePrefix={t('cta.phonePrefix')}
        phoneNumber={t('cta.phoneNumber')}
      />
    </div>
  );
}
