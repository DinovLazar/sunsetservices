import type {Metadata} from 'next';
import Image from 'next/image';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import AnimateIn from '@/components/global/motion/AnimateIn';
import CTA from '@/components/sections/CTA';
import ContentCard from '@/components/content/ContentCard';
import ContentMeta from '@/components/content/ContentMeta';
import FilterChipStrip from '@/components/content/FilterChipStrip.client';
import {getAllBlogPosts} from '@/data/getBlog';
import {
  BLOG_CATEGORIES,
  isBlogCategory,
  type BlogCategory,
} from '@/data/blog';
import {buildBreadcrumbList} from '@/lib/schema/breadcrumb';
import {buildContentItemList} from '@/lib/schema/article';
import {BUSINESS_URL} from '@/lib/constants/business';
import {routing} from '@/i18n/routing';

type Locale = 'en' | 'es';

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || BUSINESS_URL;

function locPath(loc: Locale, path: string): string {
  return loc === 'en' ? path : `/${loc}${path}`;
}

function formatLongDate(iso: string, locale: Locale): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-US' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
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
  const t = await getTranslations({locale, namespace: 'blog.meta'});
  const enPath = '/blog/';
  const esPath = '/es/blog/';
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
 * Blog index — Phase 1.18 §5.
 *
 * Sections in order: Hero (--color-bg) → Featured + Filter + Grid
 * (--color-bg-cream) → CTA (--color-bg). Surface alternation per §2 D14
 * row 2 (the featured-card section absorbs the help-band slot).
 *
 * Featured post (newest) renders in a 2-col layout — composed from the
 * locked `card-photo` primitive at a wider span. NOT `.card-featured`
 * per the §2 D16 zero-featured-card constraint.
 */
export default async function BlogIndexPage({
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
  const activeCategory: BlogCategory | undefined =
    categoryParam && isBlogCategory(categoryParam) ? categoryParam : undefined;

  const allPosts = getAllBlogPosts();
  const filtered = activeCategory
    ? allPosts.filter((p) => p.category === activeCategory)
    : allPosts;

  // Featured = first item in the filtered list (which is sorted newest first).
  const featured = filtered[0];
  const remaining = filtered.slice(1);

  // Most recent publishedAt drives the count line.
  const mostRecent = allPosts[0]?.publishedAt ?? '2026-01-01';

  const t = await getTranslations({locale, namespace: 'blog'});
  const tContent = await getTranslations({locale, namespace: 'content'});

  const chips = [
    {slug: null, label: t('filter.all')},
    ...BLOG_CATEGORIES.map((cat) => ({
      slug: cat,
      label: t(`filter.${cat}`),
    })),
  ];

  const breadcrumbItems = [
    {name: t('breadcrumb.home'), item: locPath(loc, '/')},
    {name: t('breadcrumb.blog'), item: locPath(loc, '/blog/')},
  ];
  const breadcrumbSchema = buildBreadcrumbList(breadcrumbItems);

  const itemListSchema = buildContentItemList(
    allPosts.map((p) => ({
      url: locPath(loc, `/blog/${p.slug}/`),
      name: p.title[loc],
    })),
    locale === 'en' ? 'Sunset Services Blog' : 'Blog de Sunset Services',
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

      {/* §5.1 Hero — surface --color-bg, no photo */}
      <section
        aria-labelledby="blog-hero-h1"
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
            id="blog-hero-h1"
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
              count: allPosts.length,
              date: formatMonthYear(mostRecent, loc),
            })}
          </p>
        </div>
      </section>

      {/* §5.2 Featured + Filter + Grid — surface --color-bg-cream */}
      <section
        aria-labelledby="blog-grid-heading"
        className="bg-[var(--color-bg-cream)] py-14 lg:py-20"
      >
        <h2 id="blog-grid-heading" className="sr-only">
          {locale === 'en' ? 'Recent posts' : 'Artículos recientes'}
        </h2>
        <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="mb-8 lg:mb-10">
            <FilterChipStrip
              chips={chips}
              activeSlug={activeCategory ?? null}
              ariaLabel={t('filter.ariaLabel')}
              controlsId="blog-grid"
            />
          </div>

          {!featured ? (
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
                  marginBottom: 'var(--spacing-5)',
                }}
              >
                {t('empty.title')}
              </p>
              <Link
                href="/blog/"
                prefetch={false}
                className="btn btn-ghost btn-md"
              >
                {t('empty.cta')}
              </Link>
            </div>
          ) : (
            <>
              {/* Featured post — 2-col span at lg+. Reuses card-photo, NOT card-featured. */}
              <AnimateIn variant="fade-up">
                <Link
                  href={`/blog/${featured.slug}/`}
                  prefetch={false}
                  className="card card-photo group block"
                  style={{
                    background: 'var(--color-bg)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    textDecoration: 'none',
                    color: 'var(--color-text-primary)',
                    boxShadow: 'var(--shadow-soft)',
                    padding: 0,
                  }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                    <div
                      className="relative w-full bg-[var(--color-bg-stone)]"
                      style={{aspectRatio: '16/10'}}
                    >
                      <Image
                        src={featured.featuredImage.src}
                        alt={featured.featuredImage.alt[loc]}
                        fill
                        sizes="(max-width: 1023px) 100vw, 640px"
                        priority
                        fetchPriority="high"
                        style={{objectFit: 'cover'}}
                      />
                      <span
                        aria-hidden="false"
                        className="absolute"
                        style={{
                          top: 'var(--spacing-4)',
                          left: 'var(--spacing-4)',
                          background: 'var(--color-bg)',
                          color: 'var(--color-sunset-green-700)',
                          fontFamily: 'var(--font-heading)',
                          fontWeight: 600,
                          fontSize: '11px',
                          letterSpacing: 'var(--tracking-eyebrow)',
                          textTransform: 'uppercase',
                          padding: '4px 10px',
                          borderRadius: '11px',
                        }}
                      >
                        {t(`category.${featured.category}`)}
                      </span>
                    </div>
                    <div
                      className="flex flex-col justify-center"
                      style={{
                        padding:
                          'var(--spacing-8) var(--spacing-8) var(--spacing-8)',
                      }}
                    >
                      <h3
                        className="m-0 font-heading"
                        style={{
                          fontSize: 'var(--text-h2)',
                          lineHeight: 'var(--leading-tight)',
                          fontWeight: 700,
                          color: 'var(--color-text-primary)',
                          letterSpacing: 'var(--tracking-snug)',
                          textWrap: 'balance',
                          marginBottom: 'var(--spacing-4)',
                        }}
                      >
                        {featured.title[loc]}
                      </h3>
                      <p
                        className="m-0"
                        style={{
                          fontSize: 'var(--text-body-lg)',
                          color: 'var(--color-text-secondary)',
                          lineHeight: 'var(--leading-relaxed)',
                          marginBottom: 'var(--spacing-5)',
                        }}
                      >
                        {featured.dek[loc]}
                      </p>
                      <ContentMeta
                        bylineLabel={
                          loc === 'en'
                            ? `By ${featured.byline}`
                            : `Por ${featured.byline} [TBR]`
                        }
                        publishedAt={featured.publishedAt}
                        formattedDate={formatLongDate(featured.publishedAt, loc)}
                        readingLabel={tContent('meta.readingTime', {
                          minutes: featured.readingMinutes ?? 1,
                        })}
                        locale={loc}
                      />
                      <span
                        className="mt-6 inline-flex items-center font-heading"
                        style={{
                          fontSize: 'var(--text-body-sm)',
                          color: 'var(--color-sunset-green-700)',
                          fontWeight: 600,
                        }}
                      >
                        {t('featured.cta')}
                      </span>
                    </div>
                  </div>
                </Link>
              </AnimateIn>

              {/* Remaining posts — 3-col grid */}
              {remaining.length > 0 ? (
                <AnimateIn variant="fade-up" className="block mt-10 lg:mt-12">
                  <ul
                    id="blog-grid"
                    aria-live="polite"
                    className="m-0 p-0 list-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
                  >
                    {remaining.map((post) => (
                      <li key={post.slug}>
                        <ContentCard
                          href={`/blog/${post.slug}/`}
                          category={{
                            slug: post.category,
                            label: t(`category.${post.category}`),
                          }}
                          title={post.title[loc]}
                          dek={post.dek[loc]}
                          image={{
                            src: post.featuredImage.src,
                            alt: post.featuredImage.alt[loc],
                            width: post.featuredImage.width,
                            height: post.featuredImage.height,
                          }}
                          meta={{
                            bylineLabel:
                              loc === 'en'
                                ? `By ${post.byline}`
                                : `Por ${post.byline} [TBR]`,
                            publishedAt: post.publishedAt,
                            formattedDate: formatLongDate(post.publishedAt, loc),
                            readingLabel: tContent('meta.readingTime', {
                              minutes: post.readingMinutes ?? 1,
                            }),
                          }}
                          surface="cream"
                        />
                      </li>
                    ))}
                  </ul>
                </AnimateIn>
              ) : null}
            </>
          )}
        </div>
      </section>

      {/* §5.3 Bottom CTA — surface --color-bg, the page's one amber */}
      <CTA copyNamespace="blog.cta" surface="bg" ariaId="blog-index" />
    </>
  );
}
