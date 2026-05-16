import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import AnimateIn from '@/components/global/motion/AnimateIn';
import CTA from '@/components/sections/CTA';
import ContentCard from '@/components/content/ContentCard';
import FilterChipStrip from '@/components/content/FilterChipStrip.client';
import {
  RESOURCE_CATEGORIES,
  isResourceCategory,
  type ResourceCategory,
} from '@/data/resources';
import {buildBreadcrumbList} from '@/lib/schema/breadcrumb';
import {buildContentItemList} from '@/lib/schema/article';
import {routing} from '@/i18n/routing';
import {canonicalUrl, hreflangAlternates} from '@/lib/seo/urls';
import {getAllResources} from '@sanity-lib/queries';

type Locale = 'en' | 'es';

// Phase 2.05 — ISR (30 min).
export const revalidate = 1800;

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

function fallbackResourceImage(slug: string): {
  src: string;
  width: number;
  height: number;
} {
  return {src: `/images/resources/${slug}.jpg`, width: 1280, height: 720};
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'resources.meta'});
  const loc: Locale = locale === 'es' ? 'es' : 'en';
  const path = '/resources';
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
 * Resources index — Phase 1.18 templates, Phase 2.05 Sanity-driven content.
 *
 * Sections: Hero → FilterChipStrip+Grid → HelpBand → CTA.
 * Filter via `?category=` URL state; canonical points to the un-filtered route.
 * Image fields fall back to /images/resources/<slug>.jpg until Phase 2.04.
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

  const allResources = await getAllResources();
  const filtered = activeCategory
    ? allResources.filter((r) => r.category === activeCategory)
    : allResources;

  // Sanity doesn't surface a `lastUpdated` field per resource (Phase 2.05 scope
  // didn't add one). Use the current month/year as a stable proxy until a
  // future phase adds the field to the schema.
  const mostRecent = new Date().toISOString();

  const t = await getTranslations({locale, namespace: 'resources'});
  const tContent = await getTranslations({locale, namespace: 'content'});

  const chips = [
    {slug: null, label: t('filter.all')},
    ...RESOURCE_CATEGORIES.map((cat) => ({
      slug: cat,
      label: t(`filter.${cat}`),
    })),
  ];

  const breadcrumbItems = [
    {name: t('breadcrumb.home'), item: locPath(loc, '/')},
    {name: t('breadcrumb.resources'), item: locPath(loc, '/resources/')},
  ];
  const breadcrumbSchema = buildBreadcrumbList(breadcrumbItems);

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

      {/* §3.1 Hero */}
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

      {/* §3.2 Filter + Grid */}
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
                {filtered.map((entry, idx) => {
                  const fallback = fallbackResourceImage(entry.slug);
                  return (
                    <li key={entry.slug}>
                      <ContentCard
                        href={`/resources/${entry.slug}/`}
                        category={{
                          slug: entry.category,
                          label: t(`category.${entry.category}`),
                        }}
                        title={entry.title[loc]}
                        dek={entry.dek[loc]}
                        image={{
                          src: fallback.src,
                          alt: entry.featuredImageAlt[loc] || entry.title[loc],
                          width: fallback.width,
                          height: fallback.height,
                        }}
                        meta={{
                          readingLabel: tContent('meta.readingTime', {minutes: 5}),
                        }}
                        surface="cream"
                        priority={idx === 0}
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </AnimateIn>
        </div>
      </section>

      {/* §3.3 Help-deciding band */}
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

      {/* §3.4 Bottom CTA */}
      <CTA
        copyNamespace="resources.cta"
        surface="cream"
        ariaId="resources-index"
      />
    </>
  );
}
