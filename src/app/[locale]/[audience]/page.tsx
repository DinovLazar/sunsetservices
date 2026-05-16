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
import {
  AUDIENCES,
  type Audience,
  getServicesForAudience,
} from '@/data/services';
import {AUDIENCE_HERO, AUDIENCE_PROJECT_TILES, SERVICE_TILE} from '@/data/imageMap';
import {buildBreadcrumbList} from '@/lib/schema/breadcrumb';
import {buildAudienceItemList, localePath} from '@/lib/schema/service';
import {routing} from '@/i18n/routing';
import {canonicalUrl, hreflangAlternates} from '@/lib/seo/urls';

type Locale = 'en' | 'es';

export function generateStaticParams() {
  // Cross product locale × audience handled at the segment level.
  return AUDIENCES.map((audience) => ({audience}));
}

function isAudience(slug: string): slug is Audience {
  return (AUDIENCES as readonly string[]).includes(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string; audience: string}>;
}): Promise<Metadata> {
  const {locale, audience} = await params;
  if (!isAudience(audience)) return {};
  const t = await getTranslations({locale, namespace: `audience.${audience}.meta`});
  const loc: Locale = locale === 'es' ? 'es' : 'en';
  const path = `/${audience}`;
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: canonicalUrl(path, loc),
      languages: hreflangAlternates(path),
    },
  };
}

export default async function AudienceLandingPage({
  params,
}: {
  params: Promise<{locale: string; audience: string}>;
}) {
  const {locale, audience} = await params;
  if (!isAudience(audience)) notFound();
  if (!routing.locales.includes(locale as Locale)) notFound();
  const loc = locale as Locale;
  setRequestLocale(loc);

  const t = await getTranslations({locale, namespace: `audience.${audience}`});
  const tShared = await getTranslations({locale, namespace: 'audience'});

  const audienceLabel = t('label');
  const homeLabel = tShared('breadcrumbHome');
  const services = getServicesForAudience(audience);
  const heroPhoto = AUDIENCE_HERO[audience];

  // ---- Schema ----
  const breadcrumbSchema = buildBreadcrumbList([
    {name: homeLabel, item: localePath(loc, '/')},
    {name: audienceLabel, item: localePath(loc, `/${audience}/`)},
  ]);
  const itemListSchema = buildAudienceItemList(audience, services, loc, audienceLabel);

  // ---- Hero ----
  const heroBlock = {
    audience,
    audienceLabel,
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
  // imageKey when present (disambiguates services that share a URL slug
  // across audiences, e.g., residential vs commercial `snow-removal`). ----
  const tilePhotos: Record<string, {src: string; width: number; height: number; blurDataURL?: string}> = {};
  for (const s of services) {
    const img = SERVICE_TILE[s.imageKey ?? s.slug];
    if (img) tilePhotos[s.slug] = {src: img.src, width: img.width, height: img.height, blurDataURL: img.blurDataURL};
  }

  // ---- Featured projects (3 tiles per audience) ----
  const projectImages = AUDIENCE_PROJECT_TILES[audience];
  const featuredProjectTiles = (['one', 'two', 'three'] as const).map((key, idx) => ({
    key: `${audience}-${key}`,
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

  // ---- Social proof reviews + credentials ----
  const reviews = (['one', 'two'] as const).map((key) => ({
    quote: t(`socialProof.reviews.${key}.quote`),
    name: t(`socialProof.reviews.${key}.name`),
    city: t(`socialProof.reviews.${key}.city`),
  }));
  const credentialsCommercial = audience === 'commercial';
  const credentialsHardscape = audience === 'hardscape';
  const credentials = credentialsCommercial
    ? [
        {big: t('socialProof.credentials.rating'), sub: t('socialProof.credentials.ratingSub')},
        {big: t('socialProof.credentials.insured'), sub: t('socialProof.credentials.insuredSub')},
        {big: t('socialProof.credentials.years'), sub: t('socialProof.credentials.yearsSub')},
        {big: t('socialProof.credentials.homes'), sub: t('socialProof.credentials.homesSub')},
      ]
    : credentialsHardscape
      ? [
          {big: t('socialProof.credentials.rating'), sub: t('socialProof.credentials.ratingSub')},
          {big: t('socialProof.credentials.unilock'), sub: t('socialProof.credentials.unilockSub')},
          {big: t('socialProof.credentials.warranty'), sub: t('socialProof.credentials.warrantySub')},
          {big: t('socialProof.credentials.installs'), sub: t('socialProof.credentials.installsSub')},
        ]
      : [
          {big: t('socialProof.credentials.rating'), sub: t('socialProof.credentials.ratingSub')},
          {big: t('socialProof.credentials.unilock'), sub: t('socialProof.credentials.unilockSub')},
          {big: t('socialProof.credentials.years'), sub: t('socialProof.credentials.yearsSub')},
          {big: t('socialProof.credentials.homes'), sub: t('socialProof.credentials.homesSub')},
        ];

  // ---- FAQ ----
  const faqItems = (['one', 'two', 'three', 'four', 'five'] as const).map((key) => ({
    id: `audience-${audience}-faq-${key}`,
    question: t(`faq.items.${key}.q`),
    answer: t(`faq.items.${key}.a`),
  }));

  return (
    <div data-audience={audience}>
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
        audience={audience}
        locale={loc}
        eyebrow={t('servicesGrid.eyebrow')}
        h2={t('servicesGrid.h2')}
        sub={t('servicesGrid.sub')}
        services={services}
        tilePhotos={tilePhotos}
      />
      <AudienceFeaturedProjects
        audience={audience}
        locale={loc}
        eyebrow={t('featuredProjects.eyebrow')}
        h2={t('featuredProjects.h2')}
        viewAll={t('featuredProjects.viewAll')}
        tag={audienceLabel.toUpperCase()}
        tiles={featuredProjectTiles}
      />
      <AudienceWhyUs
        eyebrow={t('whySunset.eyebrow')}
        h2={t('whySunset.h2')}
        props={whyProps}
      />
      {audience === 'hardscape' ? (
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
        audience={audience}
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
