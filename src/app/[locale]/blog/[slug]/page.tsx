import type {Metadata} from 'next';
import Image from 'next/image';
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
} from '@/components/content/portableTextHelpers';
import {estimateReadingTime} from '@/lib/readingTime';
import {getService} from '@/data/services';
import {getLocation} from '@/data/locations';
import {buildBreadcrumbList} from '@/lib/schema/breadcrumb';
import {
  buildArticleSchema,
  buildContentFaqSchema,
} from '@/lib/schema/article';
import {BUSINESS_URL} from '@/lib/constants/business';
import {routing} from '@/i18n/routing';
import {
  getAllBlogPosts,
  getAllBlogPostSlugs,
  getBlogPostBySlug,
  getFaqsForBlog,
} from '@sanity-lib/queries';

type Locale = 'en' | 'es';

// Phase 2.05 — ISR (30 min). Pre-rendered at build for the 5 blog slugs;
// each slug refreshes from Sanity on first request after 30m.
export const revalidate = 1800;
export const dynamic = 'force-static';
export const dynamicParams = false;

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

function fallbackImage(slug: string): {src: string; width: number; height: number} {
  return {src: `/images/blog/${slug}.jpg`, width: 1280, height: 720};
}

export async function generateStaticParams() {
  const slugs = await getAllBlogPostSlugs();
  return slugs.map((slug) => ({slug}));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string; slug: string}>;
}): Promise<Metadata> {
  const {locale, slug} = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  const loc = (routing.locales.includes(locale as Locale) ? locale : 'en') as Locale;
  const title = `${post.title[loc]} | Sunset Services Blog`;
  const description =
    post.seo?.description[loc] || post.dek[loc].slice(0, 160);
  const enPath = `/blog/${slug}/`;
  const esPath = `/es/blog/${slug}/`;
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
      title: post.title[loc],
      description,
      url: `${SITE_ORIGIN}${selfPath}`,
      images: [`${SITE_ORIGIN}/og/blog/${slug}/?locale=${loc}`],
      type: 'article',
      publishedTime: post.publishedAt,
    },
  };
}

/**
 * Blog post detail — Phase 1.18 templates, Phase 2.05 Sanity-driven content
 * + PortableText body rendering via `ProseLayoutPT`.
 *
 * Section order unchanged from Phase 1.18:
 *   Hero (white) → Body (white, PT) → FAQ (cream, optional) →
 *   Related (white) → bottom CTA (cream, single amber).
 *
 * Body bodyMarkdown was replaced with PT blocks. TOC + word count derive
 * from the PT block array; cross-link splicing happens in `ProseLayoutPT`.
 */
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{locale: string; slug: string}>;
}) {
  const {locale, slug} = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();
  const loc = locale as Locale;
  setRequestLocale(loc);

  const t = await getTranslations({locale, namespace: 'blog'});
  const tContent = await getTranslations({locale, namespace: 'content'});

  const body = post.body[loc] && post.body[loc].length > 0 ? post.body[loc] : post.body.en;
  const wordCount = countWordsInBlocks(body);
  const {readingMinutes} = estimateReadingTime(blocksToPlainText(body));

  const bylineLabel =
    loc === 'en' ? `By ${post.author}` : `Por ${post.author} [TBR]`;
  const readingLabel = tContent('meta.readingTime', {minutes: readingMinutes});
  const categoryLabel = t(`category.${post.category}`);
  const formattedDate = formatLongDate(post.publishedAt, loc);

  // Same-source breadcrumb
  const breadcrumbItems = [
    {name: t('breadcrumb.home'), href: locPath(loc, '/')},
    {name: t('breadcrumb.blog'), href: locPath(loc, '/blog/')},
    {name: post.title[loc]},
  ];
  const breadcrumbSchemaItems = breadcrumbItems.map((it, idx) => ({
    name: it.name,
    item:
      it.href ??
      (idx === breadcrumbItems.length - 1
        ? locPath(loc, `/blog/${slug}/`)
        : ''),
  }));
  const breadcrumbSchema = buildBreadcrumbList(breadcrumbSchemaItems);

  const articleSchema = buildArticleSchema({
    type: 'BlogPosting',
    headline: post.title[loc],
    description: post.seo?.description[loc] || post.dek[loc],
    imageUrl: fallbackImage(slug).src,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    byline: post.author,
    articleSection: categoryLabel,
    wordCount,
    canonical: locPath(loc, `/blog/${slug}/`),
    locale: loc,
  });

  // FAQ schema (same-source as visible accordion)
  const faqs = await getFaqsForBlog(slug);
  const faqSchema =
    faqs.length > 0
      ? buildContentFaqSchema(
          faqs.map((row) => ({q: row.question[loc], a: row.answer[loc]})),
        )
      : null;

  // Inline cross-link service lookup (Sanity-driven)
  let crossLink:
    | React.ComponentProps<typeof ProseLayoutPT>['inlineServiceCrossLink']
    | undefined;
  if (post.crossLinkAudience && post.crossLinkServiceSlug) {
    const svc = getService(post.crossLinkServiceSlug, post.crossLinkAudience);
    if (svc) {
      crossLink = {
        audience: post.crossLinkAudience,
        serviceSlug: post.crossLinkServiceSlug,
        serviceTitle: svc.name[loc],
        serviceTagline: svc.hero.subhead[loc],
      };
    }
  }

  // CTA per-category H2
  const cityName = post.citySlug
    ? getLocation(post.citySlug)?.name ?? post.citySlug
    : undefined;
  let ctaH2Override = t('ctaPerCategory.cost-guide');
  switch (post.category) {
    case 'cost-guide':
      ctaH2Override = t('ctaPerCategory.cost-guide');
      break;
    case 'seasonal':
      ctaH2Override = cityName
        ? t('ctaPerCategory.seasonalWithCity', {city: cityName})
        : t('ctaPerCategory.seasonal');
      break;
    case 'how-to':
      ctaH2Override = t('ctaPerCategory.how-to');
      break;
    case 'audience':
      ctaH2Override = t('ctaPerCategory.audience');
      break;
    case 'industry-news':
      ctaH2Override = t('ctaPerCategory.industry-news');
      break;
  }

  // Related posts: fetch all + filter at page level (same category preferred).
  const all = await getAllBlogPosts();
  const others = all.filter((p) => p.slug !== slug);
  const sameCategory = others.filter((p) => p.category === post.category);
  const otherCategory = others
    .filter((p) => p.category !== post.category)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const related = [...sameCategory, ...otherCategory].slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbSchema)}}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(articleSchema)}}
      />
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(faqSchema)}}
        />
      ) : null}

      {/* §6.1 Hero */}
      <section
        aria-labelledby="blog-post-h1"
        className="bg-[var(--color-bg)] pt-8 pb-10 lg:pt-12 lg:pb-12"
      >
        <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
          <Breadcrumb items={breadcrumbItems} />
          <span
            className="inline-block mt-6 font-heading font-semibold uppercase"
            style={{
              fontSize: '11px',
              letterSpacing: 'var(--tracking-eyebrow)',
              color: 'var(--color-sunset-green-700)',
              background: 'var(--color-bg-cream)',
              padding: '4px 10px',
              borderRadius: '11px',
            }}
          >
            {categoryLabel}
          </span>
          <h1
            id="blog-post-h1"
            className="m-0 mt-6 font-heading font-bold"
            style={{
              fontSize: 'var(--text-h1)',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-snug)',
              textWrap: 'balance',
              maxWidth: '24ch',
            }}
          >
            {post.title[loc]}
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
            {post.dek[loc]}
          </p>
          <div className="mt-6">
            <ContentMeta
              bylineLabel={bylineLabel}
              publishedAt={post.publishedAt}
              formattedDate={formattedDate}
              readingLabel={readingLabel}
              categoryLabel={categoryLabel}
              locale={loc}
            />
          </div>
          {/* Featured image — LCP. Falls back to Phase 1.18 placeholder until 2.04. */}
          <div
            className="mt-8 relative w-full bg-[var(--color-bg-stone)]"
            style={{
              aspectRatio: '16/9',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            <Image
              src={fallbackImage(slug).src}
              alt={post.featuredImageAlt[loc]}
              fill
              sizes="(max-width: 1023px) 100vw, 1280px"
              priority
              fetchPriority="high"
              style={{objectFit: 'cover'}}
            />
          </div>
        </div>
      </section>

      {/* §6.2 Body — PortableText */}
      <section
        aria-label={loc === 'en' ? 'Post body' : 'Cuerpo del artículo'}
        className="bg-[var(--color-bg)] pt-8 pb-14 lg:pt-12 lg:pb-20"
      >
        <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
          <ProseLayoutPT
            blocks={body}
            locale={loc}
            inlineServiceCrossLink={crossLink}
            inlineLocationCity={post.citySlug ?? undefined}
          />
        </div>
      </section>

      {/* §6.3 FAQ */}
      {faqs.length > 0 ? (
        <section
          aria-labelledby="blog-faq-h2"
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
                id="blog-faq-h2"
                className="m-0 font-heading font-bold"
                style={{
                  fontSize: 'var(--text-h2)',
                  lineHeight: 'var(--leading-tight)',
                  letterSpacing: 'var(--tracking-snug)',
                  textWrap: 'balance',
                  maxWidth: '28ch',
                }}
              >
                {loc === 'en' ? 'Common questions' : 'Preguntas frecuentes [TBR]'}
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

      {/* §6.6 Related */}
      {related.length > 0 ? (
        <section
          aria-labelledby="blog-related-h2"
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
                id="blog-related-h2"
                className="m-0 mb-8 font-heading font-bold"
                style={{
                  fontSize: 'var(--text-h2)',
                  lineHeight: 'var(--leading-tight)',
                  letterSpacing: 'var(--tracking-snug)',
                }}
              >
                {tContent('related.titleBlog')}
              </h2>
              <ul className="m-0 p-0 list-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                {related.map((rel) => {
                  const fallback = fallbackImage(rel.slug);
                  return (
                    <li key={rel.slug}>
                      <ContentCard
                        href={`/blog/${rel.slug}/`}
                        category={{
                          slug: rel.category,
                          label: t(`category.${rel.category}`),
                        }}
                        title={rel.title[loc]}
                        dek={rel.dek[loc]}
                        image={{
                          src: fallback.src,
                          alt: rel.featuredImageAlt[loc],
                          width: fallback.width,
                          height: fallback.height,
                        }}
                        meta={{
                          bylineLabel:
                            loc === 'en'
                              ? `By ${rel.author}`
                              : `Por ${rel.author} [TBR]`,
                          publishedAt: rel.publishedAt,
                          formattedDate: formatLongDate(rel.publishedAt, loc),
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

      {/* §6.7 Bottom CTA */}
      <section
        aria-labelledby="blog-cta-h2"
        className="bg-[var(--color-bg-cream)] py-16 lg:py-24"
      >
        <div className="mx-auto max-w-[var(--container-narrow)] px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
          <AnimateIn variant="fade-up">
            <p
              className="font-heading font-semibold uppercase m-0 mb-3"
              style={{
                fontSize: '13px',
                letterSpacing: 'var(--tracking-eyebrow)',
                color: 'var(--color-sunset-green-700)',
              }}
            >
              {t('cta.eyebrow')}
            </p>
            <h2
              id="blog-cta-h2"
              className="m-0 font-heading font-bold"
              style={{
                fontSize: 'var(--text-h1)',
                lineHeight: 'var(--leading-tight)',
                letterSpacing: 'var(--tracking-snug)',
                textWrap: 'balance',
              }}
            >
              {ctaH2Override}
            </h2>
            <p
              className="m-0 mt-6 mx-auto"
              style={{
                fontSize: 'var(--text-body-lg)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                maxWidth: '52ch',
              }}
            >
              {t('cta.sub')}
            </p>
            <div className="mt-10 flex flex-col items-center gap-4">
              <a
                href={`/${loc === 'en' ? '' : `${loc}/`}request-quote/?from=blog&slug=${slug}`}
                className="btn btn-amber btn-lg"
                data-cr-tracking={`cta-blog-${slug}-amber`}
                style={{minWidth: '280px'}}
              >
                {t('cta.button')}
              </a>
              <a
                href="tel:+16309469321"
                className="link link-inline"
                data-cr-tracking={`cta-blog-${slug}-phone`}
                style={{
                  fontSize: 'var(--text-body-sm)',
                  color: 'var(--color-sunset-green-700)',
                  fontWeight: 500,
                }}
              >
                {t('cta.phonePrefix')} {t('cta.phoneNumber')}
              </a>
            </div>
          </AnimateIn>
        </div>
      </section>
      {false ? <CTA copyNamespace="blog.cta" /> : null}
    </>
  );
}
