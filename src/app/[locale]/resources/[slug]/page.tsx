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
import ProseLayout from '@/components/content/ProseLayout';
import {getResourceBySlug, getRelatedResources} from '@/data/getResources';
import {RESOURCES} from '@/data/resources';
import {getService} from '@/data/services';
import {extractHowToSteps} from '@/lib/howToSteps';
import {buildBreadcrumbList} from '@/lib/schema/breadcrumb';
import {
  buildArticleSchema,
  buildHowToSchema,
  buildContentFaqSchema,
} from '@/lib/schema/article';
import {BUSINESS_URL} from '@/lib/constants/business';
import {routing} from '@/i18n/routing';

type Locale = 'en' | 'es';

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || BUSINESS_URL;

function locPath(loc: Locale, path: string): string {
  return loc === 'en' ? path : `/${loc}${path}`;
}

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return RESOURCES.map((entry) => ({slug: entry.slug}));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string; slug: string}>;
}): Promise<Metadata> {
  const {locale, slug} = await params;
  const entry = getResourceBySlug(slug);
  if (!entry) return {};
  const loc = (routing.locales.includes(locale as Locale) ? locale : 'en') as Locale;
  const title = `${entry.title[loc]} | ${
    loc === 'en' ? 'Sunset Services Resources' : 'Recursos Sunset Services'
  }`;
  const description =
    entry.seoDescription?.[loc] ?? entry.dek[loc].slice(0, 160);
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
 * Resource detail — Phase 1.18 §4.
 *
 * Sections in order:
 *   §4.1 Hero (cream, eyebrow + H1 + dek + meta)
 *   §4.2 Body (white, ProseLayout: prose + sticky TOC at xl, inline cross-link)
 *   §4.3 FAQ (cream, optional)
 *   §4.5 Related (white, 3 ContentCards)
 *   §4.6 Bottom CTA (cream, single amber)
 *
 * Schema: BreadcrumbList + (Article | HowTo) + (FAQPage if FAQ).
 */
export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{locale: string; slug: string}>;
}) {
  const {locale, slug} = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  const entry = getResourceBySlug(slug);
  if (!entry) notFound();
  const loc = locale as Locale;
  setRequestLocale(loc);

  const t = await getTranslations({locale, namespace: 'resources'});
  const tContent = await getTranslations({locale, namespace: 'content'});

  const byline = entry.byline ?? 'Sunset Services Team';
  const bylineLabel =
    loc === 'en' ? `By ${byline}` : `Por ${byline} [TBR]`;
  const readingLabel = tContent('meta.readingTime', {
    minutes: entry.readingMinutes ?? 1,
  });
  const categoryLabel = t(`category.${entry.category}`);

  // Same-source breadcrumb
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

  // Article or HowTo
  const articleSchemaInput = {
    headline: entry.title[loc],
    description: entry.seoDescription?.[loc] ?? entry.dek[loc],
    imageUrl: entry.cardImage?.src,
    datePublished: entry.lastUpdated,
    dateModified: entry.lastUpdated,
    byline,
    articleSection: categoryLabel,
    wordCount: entry.wordCount ?? 0,
    canonical: locPath(loc, `/resources/${slug}/`),
    locale: loc,
  };
  const mainSchema =
    entry.schemaType === 'HowTo'
      ? buildHowToSchema({
          ...articleSchemaInput,
          steps: extractHowToSteps(entry.body[loc]),
        })
      : buildArticleSchema({...articleSchemaInput, type: 'Article'});

  // FAQ schema (same-source with the visible accordion)
  const faqSchema =
    entry.faq && entry.faq.length > 0
      ? buildContentFaqSchema(
          entry.faq.map((row) => ({q: row.q[loc], a: row.a[loc]})),
        )
      : null;

  // Inline cross-link service lookup (when flagged)
  let crossLink: React.ComponentProps<typeof ProseLayout>['inlineServiceCrossLink'];
  if (entry.inlineServiceCrossLink) {
    const svc = getService(
      entry.inlineServiceCrossLink.serviceSlug,
      entry.inlineServiceCrossLink.audience,
    );
    if (svc) {
      crossLink = {
        audience: entry.inlineServiceCrossLink.audience,
        serviceSlug: entry.inlineServiceCrossLink.serviceSlug,
        serviceTitle: svc.name[loc],
        serviceTagline: svc.hero.subhead[loc],
      };
    }
  }

  const related = getRelatedResources(entry, 3);

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

      {/* §4.1 Hero — surface --color-bg-cream, no photo, no entrance animation */}
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

      {/* §4.2 Body — surface --color-bg, ProseLayout */}
      <section
        aria-label={loc === 'en' ? 'Resource body' : 'Cuerpo del recurso'}
        className="bg-[var(--color-bg)] py-12 lg:py-16"
      >
        <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
          <ProseLayout
            bodyMarkdown={entry.body[loc]}
            locale={loc}
            inlineServiceCrossLink={crossLink}
          />
        </div>
      </section>

      {/* §4.3 FAQ — surface --color-bg-cream, optional, no per-item AnimateIn */}
      {entry.faq && entry.faq.length > 0 ? (
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
                  : `Preguntas frecuentes sobre ${entry.title.es.split(':')[0]} [TBR]`}
              </h2>
            </AnimateIn>
            <div className="mt-8">
              <FaqAccordion
                items={entry.faq.map((row, idx) => ({
                  id: `faq-${entry.slug}-${idx}`,
                  question: row.q[loc],
                  answer: row.a[loc],
                }))}
              />
            </div>
          </div>
        </section>
      ) : null}

      {/* §4.5 Related — surface --color-bg, 3 ContentCards */}
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
                {loc === 'en' ? 'Keep reading' : 'Sigue leyendo [TBR]'}
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
                {related.map((rel) => (
                  <li key={rel.slug}>
                    <ContentCard
                      href={`/resources/${rel.slug}/`}
                      category={{
                        slug: rel.category,
                        label: t(`category.${rel.category}`),
                      }}
                      title={rel.title[loc]}
                      dek={rel.dek[loc]}
                      image={
                        rel.cardImage
                          ? {
                              src: rel.cardImage.src,
                              alt: rel.cardImage.alt[loc],
                              width: rel.cardImage.width,
                              height: rel.cardImage.height,
                            }
                          : {
                              src: '/images/resources/placeholder.jpg',
                              alt: rel.title[loc],
                              width: 1280,
                              height: 720,
                            }
                      }
                      meta={{
                        readingLabel: tContent('meta.readingTime', {
                          minutes: rel.readingMinutes ?? 1,
                        }),
                      }}
                      surface="white"
                    />
                  </li>
                ))}
              </ul>
            </AnimateIn>
          </div>
        </section>
      ) : null}

      {/* §4.6 Bottom CTA — surface --color-bg-cream, the page's one amber */}
      <CTA
        copyNamespace="resources.cta"
        surface="cream"
        ariaId={`resource-${entry.slug}`}
      />
    </>
  );
}
