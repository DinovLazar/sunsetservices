import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import AnimateIn from '@/components/global/motion/AnimateIn';
import CTA from '@/components/sections/CTA';
import ContentCard from '@/components/content/ContentCard';
import FilterChipStrip from '@/components/content/FilterChipStrip.client';
import {getAllResources} from '@/data/getResources';
import {
  RESOURCE_CATEGORIES,
  isResourceCategory,
  type ResourceCategory,
} from '@/data/resources';
import {buildBreadcrumbList} from '@/lib/schema/breadcrumb';
import {buildContentItemList} from '@/lib/schema/article';
import {BUSINESS_URL} from '@/lib/constants/business';
import {routing} from '@/i18n/routing';

type Locale = 'en' | 'es';

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || BUSINESS_URL;

function locPath(loc: Locale, path: string): string {
  return loc === 'en' ? path : `/${loc}${path}`;
}

function formatMonthYear(iso: string, locale: Locale): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-US' : 'en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'resources.meta'});
  const enPath = '/resources/';
  const esPath = '/es/resources/';
  const selfPath = locale === 'en' ? enPath : esPath;
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `${SITE_ORIGIN}${selfPath}`,
      languages: {
        en: `${SITE_ORIGIN}${enPath}`,
        es: `${SITE_ORIGIN}${esPath}`,
        'x-default': `${SITE_ORIGIN}${enPath}`,
      },
    },
  };
}

/**
 * Resources index — Phase 1.18 §3.
 *
 * Sections in order: Hero (text-only, --color-bg) → FilterChipStrip+Grid
 * (--color-bg-cream) → HelpBand (--color-bg) → CTA (--color-bg-cream).
 * Surface alternation per §2 D14 (handover row 1).
 *
 * Filter via `?category=` URL state. Single-select; "All" omits the
 * param. Filter-state URLs set canonical to the un-filtered route per
 * audit assertion #9.
 *
 * Schema: `BreadcrumbList` + `ItemList` of `ListItem`s. Same-source rule
 * (handover §7.3): the visible card grid + the schema consume one array.
 */
export default async function ResourcesIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{locale: string}>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const {locale} = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);
  const loc = locale as Locale;

  const sp = await searchParams;
  const categoryParam = typeof sp.category === 'string' ? sp.category : undefined;
  const activeCategory: ResourceCategory | undefined =
    categoryParam && isResourceCategory(categoryParam) ? categoryParam : undefined;

  const allResources = getAllResources();
  const filtered = activeCategory
    ? allResources.filter((r) => r.category === activeCategory)
    : allResources;

  // Most recent lastUpdated drives the count line.
  const mostRecent = allResources.reduce(
    (acc, r) => (r.lastUpdated > acc ? r.lastUpdated : acc),
    allResources[0]?.lastUpdated ?? '2026-01-01',
  );

  const t = await getTranslations({locale, namespace: 'resources'});
  const tContent = await getTranslations({locale, namespace: 'content'});

  // Filter chip definitions (locale-resolved labels).
  const chips = [
    {slug: null, label: t('filter.all')},
    ...RESOURCE_CATEGORIES.map((cat) => ({
      slug: cat,
      label: t(`filter.${cat}`),
    })),
  ];

  // Same-source breadcrumb items.
  const breadcrumbItems = [
    {name: t('breadcrumb.home'), item: locPath(loc, '/')},
    {name: t('breadcrumb.resources'), item: locPath(loc, '/resources/')},
  ];
  const breadcrumbSchema = buildBreadcrumbList(breadcrumbItems);

  // Same-source ItemList — un-filtered list so crawlers see every entry.
  const itemListSchema = buildContentItemList(
    allResources.map((r) => ({
      url: locPath(loc, `/resources/${r.slug}/`),
      name: r.title[loc],
    })),
    locale === 'en'
      ? 'Sunset Services Resources'
      : 'Recursos de Sunset Services',
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbSchema)}}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(itemListSchema)}}
      />

      {/* §3.1 Hero — surface --color-bg, no photo, no entrance animation */}
      <section
        aria-labelledby="resources-hero-h1"
        className="bg-[var(--color-bg)] py-14 lg:py-20"
      >
        <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
          <p
            className="font-heading font-semibold uppercase m-0 mb-3"
            style={{
              fontSize: '13px',
              letterSpacing: 'var(--tracking-eyebrow)',
              color: 'var(--color-sunset-green-700)',
            }}
          >
            {t('hero.eyebrow')}
          </p>
          <h1
            id="resources-hero-h1"
            className="m-0 font-heading font-bold"
            style={{
              fontSize: 'var(--text-display)',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-snug)',
              textWrap: 'balance',
              maxWidth: '24ch',
            }}
          >
            {t('hero.h1')}
          </h1>
          <p
            className="m-0 mt-6"
            style={{
              fontSize: 'var(--text-body-lg)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--leading-relaxed)',
              maxWidth: '60ch',
            }}
          >
            {t('hero.dek')}
          </p>
          <p
            className="m-0 mt-8"
            style={{
              fontSize: 'var(--text-body-sm)',
              color: 'var(--color-text-muted)',
            }}
          >
            {t('hero.count', {
              count: allResources.length,
              date: formatMonthYear(mostRecent, loc),
            })}
          </p>
        </div>
      </section>

      {/* §3.2 Filter + Grid — surface --color-bg-cream, single AnimateIn */}
      <section
        aria-labelledby="resources-grid-heading"
        className="bg-[var(--color-bg-cream)] py-14 lg:py-20"
      >
        <h2 id="resources-grid-heading" className="sr-only">
          {locale === 'en' ? 'Resources' : 'Recursos'}
        </h2>
        <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
          <AnimateIn variant="fade-up">
            <div className="mb-8 lg:mb-10">
              <FilterChipStrip
                chips={chips}
                activeSlug={activeCategory ?? null}
                ariaLabel={t('filter.ariaLabel')}
                controlsId="resources-grid"
              />
            </div>
            {filtered.length === 0 ? (
              <div
                className="mx-auto text-center"
                style={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--spacing-12) var(--spacing-6)',
                  maxWidth: '40rem',
                }}
              >
                <p
                  className="m-0 font-heading"
                  style={{
                    fontSize: 'var(--text-h4)',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--spacing-5)',
                  }}
                >
                  {t('empty.title')}
                </p>
                <Link
                  href="/resources/"
                  prefetch={false}
                  className="btn btn-ghost btn-md"
                >
                  {t('empty.cta')}
                </Link>
              </div>
            ) : (
              <ul
                id="resources-grid"
                aria-live="polite"
                className="m-0 p-0 list-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
              >
                {filtered.map((entry, idx) => (
                  <li key={entry.slug}>
                    <ContentCard
                      href={`/resources/${entry.slug}/`}
                      category={{
                        slug: entry.category,
                        label: t(`category.${entry.category}`),
                      }}
                      title={entry.title[loc]}
                      dek={entry.dek[loc]}
                      image={
                        entry.cardImage
                          ? {
                              src: entry.cardImage.src,
                              alt: entry.cardImage.alt[loc],
                              width: entry.cardImage.width,
                              height: entry.cardImage.height,
                            }
                          : {
                              src: '/images/resources/placeholder.jpg',
                              alt: entry.title[loc],
                              width: 1280,
                              height: 720,
                            }
                      }
                      meta={{
                        readingLabel: tContent('meta.readingTime', {
                          minutes: entry.readingMinutes ?? 1,
                        }),
                      }}
                      surface="cream"
                      priority={idx === 0}
                    />
                  </li>
                ))}
              </ul>
            )}
          </AnimateIn>
        </div>
      </section>

      {/* §3.3 Help-deciding band — surface --color-bg, NO amber here */}
      <section
        aria-labelledby="resources-helpband-h2"
        className="bg-[var(--color-bg)] py-14 lg:py-20"
      >
        <div className="mx-auto max-w-[var(--container-narrow)] px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
          <AnimateIn variant="fade-up">
            <h2
              id="resources-helpband-h2"
              className="m-0 font-heading font-bold"
              style={{
                fontSize: 'var(--text-h2)',
                lineHeight: 'var(--leading-tight)',
                letterSpacing: 'var(--tracking-snug)',
                textWrap: 'balance',
              }}
            >
              {t('helpBand.h2')}
            </h2>
            <p
              className="m-0 mt-4 mx-auto"
              style={{
                fontSize: 'var(--text-body-lg)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                maxWidth: '52ch',
              }}
            >
              {t('helpBand.body')}
            </p>
            <div className="mt-8">
              <Link
                href="/contact/"
                prefetch={false}
                className="btn btn-primary btn-md"
                data-cr-tracking="resources-helpband"
              >
                {t('helpBand.cta')}
              </Link>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* §3.4 Bottom CTA — surface --color-bg-cream, the page's one amber */}
      <CTA
        copyNamespace="resources.cta"
        surface="cream"
        ariaId="resources-index"
      />
    </>
  );
}
