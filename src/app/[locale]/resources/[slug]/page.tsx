import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import '@/styles/prose.css';
import AnimateIn from '@/components/global/motion/AnimateIn';
import Breadcrumb from '@/components/ui/Breadcrumb';
import FaqAccordion from '@/components/ui/FaqAccordion';
import CTA from '@/components/sections/CTA';
import ContentMeta from '@/components/content/ContentMeta';
import ContentCard from '@/components/content/ContentCard';
import ProseLayoutPT from '@/components/content/ProseLayoutPT';
import {
  blocksToPlainText,
  countWordsInBlocks,
  extractHowToStepsFromBlocks,
} from '@/components/content/portableTextHelpers';
import {estimateReadingTime} from '@/lib/readingTime';
import {getService} from '@/data/services';
import {buildBreadcrumbList} from '@/lib/schema/breadcrumb';
import {
  buildArticleSchema,
  buildHowToSchema,
  buildContentFaqSchema,
} from '@/lib/schema/article';
import {BUSINESS_URL} from '@/lib/constants/business';
import {routing} from '@/i18n/routing';
import {
  getAllResources,
  getAllResourceSlugs,
  getResourceBySlug,
  getFaqsForResource,
} from '@sanity-lib/queries';

type Locale = 'en' | 'es';

// Phase 2.05 — ISR (30 min). Pre-rendered at build for the 5 resource slugs.
export const revalidate = 1800;
export const dynamic = 'force-static';
export const dynamicParams = false;

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || BUSINESS_URL;

function locPath(loc: Locale, path: string): string {
  return loc === 'en' ? path : `/${loc}${path}`;
}

function fallbackImage(slug: string): {src: string; width: number; height: number} {
  return {src: `/images/resources/${slug}.jpg`, width: 1280, height: 720};
}

export async function generateStaticParams() {
  const slugs = await getAllResourceSlugs();
  return slugs.map((slug) => ({slug}));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string; slug: string}>;
}): Promise<Metadata> {
  const {locale, slug} = await params;
  const entry = await getResourceBySlug(slug);
  if (!entry) return {};
  const loc = (routing.locales.includes(locale as Locale) ? locale : 'en') as Locale;
  const title = `${entry.title[loc]} | ${
    loc === 'en' ? 'Sunset Services Resources' : 'Recursos Sunset Services'
  }`;
  const description =
    entry.seo?.description[loc] || entry.dek[loc].slice(0, 160);
  const enPath = `/resources/${slug}/`;
  const esPath = `/es/resources/${slug}/`;
  const selfPath = loc === 'en' ? enPath : esPath;
  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_ORIGIN}${selfPath}`,
      languages: {
        en: `${SITE_ORIGIN}${enPath}`,
        es: `${SITE_ORIGIN}${esPath}`,
        'x-default': `${SITE_ORIGIN}${enPath}`,
      },
    },
    openGraph: {
      title: entry.title[loc],
      description,
      url: `${SITE_ORIGIN}${selfPath}`,
      images: [`${SITE_ORIGIN}/og/resource/${slug}/?locale=${loc}`],
      type: 'article',
    },
  };
}

/**
 * Resource detail — Phase 1.18 templates, Phase 2.05 Sanity-driven content
 * + PortableText body rendering.
 *
 * Sections: Hero (cream) → Body (white, PT) → FAQ (cream, optional) →
 * Related (white) → bottom CTA (cream, single amber).
 *
 * Schema: BreadcrumbList + (Article | HowTo per entry.schemaType) +
 * (FAQPage if FAQ).
 */
export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{locale: string; slug: string}>;
}) {
  const {locale, slug} = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  const entry = await getResourceBySlug(slug);
  if (!entry) notFound();
  const loc = locale as Locale;
  setRequestLocale(loc);

  const t = await getTranslations({locale, namespace: 'resources'});
  const tContent = await getTranslations({locale, namespace: 'content'});

  const body =
    entry.body[loc] && entry.body[loc].length > 0 ? entry.body[loc] : entry.body.en;
  const wordCount = countWordsInBlocks(body);
  const {readingMinutes} = estimateReadingTime(blocksToPlainText(body));

  const byline = 'Sunset Services Team';
  const bylineLabel =
    loc === 'en' ? `By ${byline}` : `Por ${byline}`;
  const readingLabel = tContent('meta.readingTime', {minutes: readingMinutes});
  const categoryLabel = t(`category.${entry.category}`);

  const breadcrumbItems = [
    {name: t('breadcrumb.home'), href: locPath(loc, '/')},
    {name: t('breadcrumb.resources'), href: locPath(loc, '/resources/')},
    {name: entry.title[loc]},
  ];
  const breadcrumbSchemaItems = breadcrumbItems.map((it, idx) => ({
    name: it.name,
    item:
      it.href ??
      (idx === breadcrumbItems.length - 1 ? locPath(loc, `/resources/${slug}/`) : ''),
  }));
  const breadcrumbSchema = buildBreadcrumbList(breadcrumbSchemaItems);

  // Article or HowTo schema.
  const now = new Date().toISOString();
  const fallback = fallbackImage(slug);
  const articleSchemaInput = {
    headline: entry.title[loc],
    description: entry.seo?.description[loc] || entry.dek[loc],
    imageUrl: fallback.src,
    datePublished: now,
    dateModified: now,
    byline,
    articleSection: categoryLabel,
    wordCount,
    canonical: locPath(loc, `/resources/${slug}/`),
    locale: loc,
  };
  const mainSchema =
    entry.schemaType === 'HowTo'
      ? buildHowToSchema({
          ...articleSchemaInput,
          steps: extractHowToStepsFromBlocks(body),
        })
      : buildArticleSchema({...articleSchemaInput, type: 'Article'});

  // FAQs from Sanity (scope: resource:<slug>).
  const faqs = await getFaqsForResource(slug);
  const faqSchema =
    faqs.length > 0
      ? buildContentFaqSchema(
          faqs.map((row) => ({q: row.question[loc], a: row.answer[loc]})),
        )
      : null;

  // Inline cross-link (Sanity-driven).
  let crossLink:
    | React.ComponentProps<typeof ProseLayoutPT>['inlineServiceCrossLink']
    | undefined;
  if (entry.crossLinkAudience && entry.crossLinkServiceSlug) {
    const svc = getService(entry.crossLinkServiceSlug, entry.crossLinkAudience);
    if (svc) {
      crossLink = {
        audience: entry.crossLinkAudience,
        serviceSlug: entry.crossLinkServiceSlug,
        serviceTitle: svc.name[loc],
        serviceTagline: svc.hero.subhead[loc],
      };
    }
  }

  // Related — same category preferred, fallback to others.
  const all = await getAllResources();
  const others = all.filter((r) => r.slug !== slug);
  const sameCategory = others.filter((r) => r.category === entry.category);
  const otherCategory = others
    .filter((r) => r.category !== entry.category)
    .sort((a, b) => a.slug.localeCompare(b.slug));
  const related = [...sameCategory, ...otherCategory].slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbSchema)}}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(mainSchema)}}
      />
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(faqSchema)}}
        />
      ) : null}

      {/* §4.1 Hero */}
      <section
        aria-labelledby="resource-hero-h1"
        className="bg-[var(--color-bg-cream)] py-12 lg:py-16"
      >
        <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
          <Breadcrumb items={breadcrumbItems} />
          <span
            className="inline-block mt-6 font-heading font-semibold uppercase"
            style={{
              fontSize: '11px',
              letterSpacing: 'var(--tracking-eyebrow)',
              color: 'var(--color-sunset-green-700)',
              background: 'var(--color-bg)',
              padding: '4px 10px',
              borderRadius: '11px',
            }}
          >
            {categoryLabel}
          </span>
          <h1
            id="resource-hero-h1"
            className="m-0 mt-6 font-heading font-bold"
            style={{
              fontSize: 'var(--text-h1)',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-snug)',
              textWrap: 'balance',
              maxWidth: '24ch',
            }}
          >
            {entry.title[loc]}
          </h1>
          <p
            className="m-0 mt-5"
            style={{
              fontSize: 'var(--text-body-lg)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--leading-relaxed)',
              maxWidth: '60ch',
            }}
          >
            {entry.dek[loc]}
          </p>
          <div className="mt-6">
            <ContentMeta
              bylineLabel={bylineLabel}
              readingLabel={readingLabel}
              categoryLabel={categoryLabel}
              locale={loc}
            />
          </div>
        </div>
      </section>

      {/* §4.2 Body */}
      <section
        aria-label={loc === 'en' ? 'Resource body' : 'Cuerpo del recurso'}
        className="bg-[var(--color-bg)] py-12 lg:py-16"
      >
        <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
          <ProseLayoutPT
            blocks={body}
            locale={loc}
            inlineServiceCrossLink={crossLink}
          />
        </div>
      </section>

      {/* §4.3 FAQ */}
      {faqs.length > 0 ? (
        <section
          aria-labelledby="resource-faq-h2"
          className="bg-[var(--color-bg-cream)] py-14 lg:py-20"
        >
          <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
            <AnimateIn variant="fade-up">
              <p
                className="font-heading font-semibold uppercase m-0 mb-3"
                style={{
                  fontSize: '13px',
                  letterSpacing: 'var(--tracking-eyebrow)',
                  color: 'var(--color-sunset-green-700)',
                }}
              >
                {tContent('faq.title')}
              </p>
              <h2
                id="resource-faq-h2"
                className="m-0 font-heading font-bold"
                style={{
                  fontSize: 'var(--text-h2)',
                  lineHeight: 'var(--leading-tight)',
                  letterSpacing: 'var(--tracking-snug)',
                  textWrap: 'balance',
                  maxWidth: '28ch',
                }}
              >
                {loc === 'en'
                  ? `Common questions about ${entry.title.en.split(':')[0]}`
                  : `Preguntas frecuentes sobre ${entry.title.es.split(':')[0]}`}
              </h2>
            </AnimateIn>
            <div className="mt-8">
              <FaqAccordion
                items={faqs.map((row, idx) => ({
                  id: `faq-${slug}-${idx}`,
                  question: row.question[loc],
                  answer: row.answer[loc],
                }))}
              />
            </div>
          </div>
        </section>
      ) : null}

      {/* §4.5 Related */}
      {related.length > 0 ? (
        <section
          aria-labelledby="resource-related-h2"
          className="bg-[var(--color-bg)] py-14 lg:py-20"
        >
          <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
            <AnimateIn variant="fade-up">
              <p
                className="font-heading font-semibold uppercase m-0 mb-3"
                style={{
                  fontSize: '13px',
                  letterSpacing: 'var(--tracking-eyebrow)',
                  color: 'var(--color-sunset-green-700)',
                }}
              >
                {loc === 'en' ? 'Keep reading' : 'Sigue leyendo'}
              </p>
              <h2
                id="resource-related-h2"
                className="m-0 mb-8 font-heading font-bold"
                style={{
                  fontSize: 'var(--text-h2)',
                  lineHeight: 'var(--leading-tight)',
                  letterSpacing: 'var(--tracking-snug)',
                }}
              >
                {tContent('related.title')}
              </h2>
              <ul className="m-0 p-0 list-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                {related.map((rel) => {
                  const relFallback = fallbackImage(rel.slug);
                  return (
                    <li key={rel.slug}>
                      <ContentCard
                        href={`/resources/${rel.slug}/`}
                        category={{
                          slug: rel.category,
                          label: t(`category.${rel.category}`),
                        }}
                        title={rel.title[loc]}
                        dek={rel.dek[loc]}
                        image={{
                          src: relFallback.src,
                          alt: rel.featuredImageAlt[loc] || rel.title[loc],
                          width: relFallback.width,
                          height: relFallback.height,
                        }}
                        meta={{
                          readingLabel: tContent('meta.readingTime', {minutes: 5}),
                        }}
                        surface="white"
                      />
                    </li>
                  );
                })}
              </ul>
            </AnimateIn>
          </div>
        </section>
      ) : null}

      {/* §4.6 Bottom CTA */}
      <CTA
        copyNamespace="resources.cta"
        surface="cream"
        ariaId={`resource-${entry.slug}`}
      />
    </>
  );
}
