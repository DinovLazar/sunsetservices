import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import ServiceHero from '@/components/sections/service/ServiceHero';
import ServiceWhatsIncluded from '@/components/sections/service/ServiceWhatsIncluded';
import ServiceProcess from '@/components/sections/service/ServiceProcess';
import ServiceWhyUs from '@/components/sections/service/ServiceWhyUs';
import ServicePricing from '@/components/sections/service/ServicePricing';
import ServiceFeaturedProjects from '@/components/sections/service/ServiceFeaturedProjects';
import ServiceFAQ from '@/components/sections/service/ServiceFAQ';
import ServiceRelated from '@/components/sections/service/ServiceRelated';
import ServiceCTA from '@/components/sections/service/ServiceCTA';
import {
  AUDIENCES,
  SERVICES,
  type Audience,
  getService,
  getRelatedService,
} from '@/data/services';
import {SERVICE_HERO, SERVICE_PROJECT} from '@/data/imageMap';
import {buildBreadcrumbList} from '@/lib/schema/breadcrumb';
import {buildServiceSchema, localePath} from '@/lib/schema/service';
import {buildContentFaqSchema} from '@/lib/schema/article';
import {routing} from '@/i18n/routing';
import {canonicalUrl, hreflangAlternates} from '@/lib/seo/urls';
import {getFaqsForService} from '@sanity-lib/queries';

// Phase 2.05 — ISR (30 min) so Sanity FAQ edits propagate without a redeploy.
export const revalidate = 1800;

type Locale = 'en' | 'es';

export function generateStaticParams() {
  // Pre-render every (audience, service) pair for both locales (locale at parent).
  return SERVICES.map((s) => ({audience: s.audience, service: s.slug}));
}

function isAudience(slug: string): slug is Audience {
  return (AUDIENCES as readonly string[]).includes(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string; audience: string; service: string}>;
}): Promise<Metadata> {
  const {locale, audience, service} = await params;
  if (!isAudience(audience)) return {};
  const svc = getService(service, audience);
  if (!svc) return {};
  const loc = (routing.locales.includes(locale as Locale) ? locale : 'en') as Locale;
  const path = `/${audience}/${svc.slug}`;
  return {
    title: `${svc.hero.h1[loc]} — Sunset Services`,
    description: svc.hero.subhead[loc],
    alternates: {
      canonical: canonicalUrl(path, loc),
      languages: hreflangAlternates(path),
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{locale: string; audience: string; service: string}>;
}) {
  const {locale, audience, service} = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  if (!isAudience(audience)) notFound();
  const svc = getService(service, audience);
  if (!svc) notFound();
  const loc = locale as Locale;
  setRequestLocale(loc);

  const tAudience = await getTranslations({locale, namespace: `audience.${audience}`});
  const tShared = await getTranslations({locale, namespace: 'audience'});
  const tSvc = await getTranslations({locale, namespace: 'servicePage'});

  const audienceLabel = tAudience('label');
  const audienceKicker = tAudience('hero.kicker');
  const homeLabel = tShared('breadcrumbHome');
  const serviceName = svc.name[loc];
  const assetKey = svc.imageKey ?? svc.slug;
  const heroPhoto = SERVICE_HERO[assetKey];

  // ---- Schema ----
  const breadcrumbSchema = buildBreadcrumbList([
    {name: homeLabel, item: localePath(loc, '/')},
    {name: audienceLabel, item: localePath(loc, `/${audience}/`)},
    {name: serviceName, item: localePath(loc, `/${audience}/${svc.slug}/`)},
  ]);
  const serviceSchema = buildServiceSchema(svc, loc);

  // Phase 2.05 — FAQs come from Sanity, not the TS seed. Scope tag:
  // `service:<audience>:<slug>`. Page knows both, so no ambiguity.
  const faqs = await getFaqsForService(audience as Audience, service);
  const faqSchema = buildContentFaqSchema(
    faqs.map((f) => ({q: f.question[loc], a: f.answer[loc]})),
  );

  // ---- What's included ----
  const includedItems = svc.whatsIncluded.map((it) => ({
    headline: it.headline[loc],
    description: it.description[loc],
    icon: it.icon,
  }));

  // ---- Process ----
  const processSteps = svc.process.map((p) => ({
    headline: p.headline[loc],
    description: p.description[loc],
  }));

  // ---- Why us ----
  const whyUsItems = svc.whyUs.map((w) => ({
    headline: w.headline[loc],
    description: w.description[loc],
    icon: w.icon,
  }));

  // ---- Pricing ----
  const explainerFactors =
    svc.pricing.mode === 'explainer'
      ? svc.pricing.explainerFactors.map((f) => ({name: f.name[loc], body: f.body[loc]}))
      : [];
  const priceIncludes =
    svc.pricing.mode === 'price' ? svc.pricing.includes[loc] : undefined;
  const priceHeadline =
    svc.pricing.mode === 'price'
      ? tSvc('pricing.price.startingAtTemplate', {price: String(svc.pricing.startingAt)})
      : undefined;

  // ---- Featured projects ----
  const projectTiles = svc.projects.map((p) => ({
    key: p.imageKey,
    title: p.title[loc],
    meta: p.meta[loc],
    photoSrc: SERVICE_PROJECT[p.imageKey]?.src ?? '',
  }));

  // ---- FAQ items ----
  const faqItems = faqs.map((q, idx) => ({
    id: `service-${svc.slug}-faq-${idx}`,
    question: q.question[loc],
    answer: q.answer[loc],
  }));

  // ---- Related services (D7: prefer same-audience match for residential +
  // commercial; hardscape rows still resolve correctly because their related
  // slugs are unique within the hardscape set). ----
  const relatedServices = svc.related
    .map((slug) => getRelatedService(slug, audience))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .map((rs) => ({
      service: rs,
      teaser: rs.hero.subhead[loc].split('.')[0] + '.',
    }));

  return (
    <div data-audience={audience}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbSchema)}}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(serviceSchema)}}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(faqSchema)}}
      />
      <ServiceHero
        audience={audience}
        audienceLabel={audienceLabel}
        audienceKicker={audienceKicker}
        serviceName={serviceName}
        serviceSlug={svc.slug}
        homeLabel={homeLabel}
        h1={svc.hero.h1[loc]}
        subhead={svc.hero.subhead[loc]}
        photo={heroPhoto}
        primaryCta={tSvc('cta.button')}
        callCta={tSvc('hero.callCta')}
        callAria={tSvc('hero.callAria')}
      />
      <ServiceWhatsIncluded
        eyebrow={tSvc('whatsIncluded.eyebrow')}
        h2={tSvc('whatsIncluded.h2')}
        items={includedItems}
      />
      <ServiceProcess
        eyebrow={tSvc('process.eyebrow')}
        h2={tSvc('process.h2', {steps: String(processSteps.length)})}
        steps={processSteps}
      />
      <ServiceWhyUs
        eyebrow={tSvc('whyUs.eyebrowTemplate', {service: serviceName.toUpperCase()})}
        h2={tSvc('whyUs.h2')}
        items={whyUsItems}
      />
      <ServicePricing
        serviceSlug={svc.slug}
        pricing={svc.pricing}
        explainerFactors={explainerFactors}
        priceIncludes={priceIncludes}
        strings={{
          explainerEyebrow: tSvc('pricing.explainer.eyebrow'),
          explainerH2: tSvc('pricing.explainer.h2'),
          explainerLead: tSvc('pricing.explainer.lead'),
          explainerCta: tSvc('pricing.explainer.cta'),
          priceEyebrow: tSvc('pricing.price.eyebrow'),
          priceCta: tSvc('pricing.price.cta'),
          priceHeadline,
        }}
      />
      <ServiceFeaturedProjects
        serviceSlug={svc.slug}
        eyebrow={tSvc('featuredProjects.eyebrow')}
        h2={tSvc('featuredProjects.h2Template', {service: serviceName})}
        viewAll={tSvc('featuredProjects.viewAllTemplate', {service: serviceName.toLowerCase()})}
        tiles={projectTiles}
      />
      <ServiceFAQ
        eyebrow={tSvc('faq.eyebrow')}
        h2={tSvc('faq.h2Template', {service: serviceName})}
        items={faqItems}
      />
      <ServiceRelated
        locale={loc}
        eyebrow={tSvc('related.eyebrow')}
        h2={tSvc(`related.h2.${audience}`)}
        tiles={relatedServices}
      />
      <ServiceCTA
        serviceSlug={svc.slug}
        eyebrow={tSvc('cta.eyebrow')}
        h2={tSvc('cta.h2Template', {service: serviceName.toLowerCase()})}
        body={tSvc('cta.body')}
        buttonLabel={tSvc('cta.button')}
        phonePrefix={tSvc('cta.phonePrefix')}
        phoneNumber={tSvc('cta.phoneNumber')}
      />
    </div>
  );
}
