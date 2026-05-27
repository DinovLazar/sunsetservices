import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {Phone} from 'lucide-react';
import {BUSINESS_PHONE_TEL} from '@/lib/constants/business';
import {buildBreadcrumbList} from '@/lib/schema/breadcrumb';
import {localePath} from '@/lib/schema/service';
import {routing} from '@/i18n/routing';
import {canonicalUrl, hreflangAlternates} from '@/lib/seo/urls';

type Locale = 'en' | 'es';

/**
 * Display order for the 7 Q&A categories (Phase M.10b — Goran's library).
 * Add a new entry here and to the `qa.categories` namespace in `en.json` +
 * `es.json` and it renders — the page no longer carries a hardcoded count.
 */
const CATEGORY_ORDER = [
  'projectPlanning',
  'pricing',
  'materials',
  'retainingWalls',
  'outdoorLiving',
  'maintenance',
  'trust',
] as const;

type CategoryKey = (typeof CATEGORY_ORDER)[number];

type QaItem = {q: string; a: string};
type QaCategoryData = {
  title: string;
  eyebrow: string;
  questions: QaItem[];
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const loc: Locale = locale === 'es' ? 'es' : 'en';
  const t = await getTranslations({locale, namespace: 'qa.meta'});
  const path = '/qa';
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
 * Phase M.10b — sitewide Q&A page at `/qa/`.
 *
 * Renders Goran's 28-question library (`qa.categories.*` namespace) across
 * 7 categories. Per Phase M.01e locked decision #20 we do NOT emit
 * `FAQPage` JSON-LD on this surface — the per-service / per-city FAQ
 * schemas are the canonical structured-data home for each question.
 * Adding sitewide FAQPage here could dilute those schemas' targeting.
 *
 * Visual treatment matches the existing service-detail FAQ band: an
 * eyebrow + `<h2>` per category, then `<details>` accordion items.
 */
export default async function QaPage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  const loc = locale as Locale;
  setRequestLocale(loc);

  const t = await getTranslations({locale, namespace: 'qa'});
  const tShared = await getTranslations({locale, namespace: 'audience'});

  const homeLabel = tShared('breadcrumbHome');
  const breadcrumbSchema = buildBreadcrumbList([
    {name: homeLabel, item: localePath(loc, '/')},
    {name: t('hero.h1'), item: localePath(loc, '/qa/')},
  ]);

  // `t.raw()` returns the raw namespace value so we can iterate by ordered
  // category key. Shape is locked by the seed: each category carries
  // {title, eyebrow, questions[]}.
  const categories = t.raw('categories') as Record<CategoryKey, QaCategoryData>;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbSchema)}}
      />
      <section
        aria-labelledby="qa-hero-h1"
        className="bg-[var(--color-bg)] pt-16 lg:pt-24 pb-10 lg:pb-14"
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
            id="qa-hero-h1"
            className="m-0 font-heading"
            style={{
              fontSize: 'var(--text-h1)',
              fontWeight: 700,
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-snug)',
              color: 'var(--color-text-primary)',
              textWrap: 'balance',
            }}
          >
            {t('hero.h1')}
          </h1>
          <p
            className="m-0 mt-4 max-w-[70ch]"
            style={{
              fontSize: 'var(--text-body-lg)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--leading-relaxed)',
            }}
          >
            {t('hero.dek')}
          </p>
        </div>
      </section>

      <section
        aria-label={t('hero.h1')}
        className="bg-[var(--color-bg-cream)] py-14 lg:py-20"
      >
        <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
          {CATEGORY_ORDER.map((cat) => {
            const data = categories[cat];
            if (!data || data.questions.length === 0) return null;
            return (
              <div key={cat} className="mb-12 lg:mb-16 last:mb-0">
                <p
                  className="font-heading font-semibold uppercase m-0 mb-2"
                  style={{
                    fontSize: '13px',
                    letterSpacing: 'var(--tracking-eyebrow)',
                    color: 'var(--color-sunset-green-700)',
                  }}
                >
                  {data.eyebrow}
                </p>
                <h2
                  id={`qa-cat-${cat}`}
                  className="m-0 mb-6 font-heading"
                  style={{
                    fontSize: 'var(--text-h3)',
                    fontWeight: 700,
                    lineHeight: 'var(--leading-tight)',
                    letterSpacing: 'var(--tracking-snug)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {data.title}
                </h2>
                <ul className="m-0 p-0 list-none border-t border-[var(--color-border)]">
                  {data.questions.map((item, idx) => (
                    <li
                      key={`${cat}-${idx}`}
                      className="border-b border-[var(--color-border)]"
                    >
                      <details className="group">
                        <summary
                          className="flex items-center justify-between gap-3 cursor-pointer py-4 lg:py-5 font-heading font-semibold"
                          style={{
                            fontSize: 'var(--text-body-lg)',
                            color: 'var(--color-text-primary)',
                          }}
                        >
                          <span>{item.q}</span>
                          <span
                            aria-hidden="true"
                            className="shrink-0 text-[var(--color-sunset-green-700)] group-open:rotate-45 transition-transform duration-[var(--motion-fast)]"
                            style={{fontSize: 24, lineHeight: 1}}
                          >
                            +
                          </span>
                        </summary>
                        <p
                          className="m-0 pb-5 pr-8"
                          style={{
                            fontSize: 'var(--text-body)',
                            color: 'var(--color-text-secondary)',
                            lineHeight: 'var(--leading-relaxed)',
                          }}
                        >
                          {item.a}
                        </p>
                      </details>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section
        aria-labelledby="qa-cta-h2"
        className="bg-[var(--color-bg)] py-14 lg:py-20"
      >
        <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
          <h2
            id="qa-cta-h2"
            className="m-0 font-heading"
            style={{
              fontSize: 'var(--text-h2)',
              fontWeight: 700,
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-snug)',
            }}
          >
            {t('cta.h2')}
          </h2>
          <p
            className="m-0 mt-3 mx-auto max-w-[60ch]"
            style={{
              fontSize: 'var(--text-body-lg)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--leading-relaxed)',
            }}
          >
            {t('cta.sub')}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/request-quote/" className="btn btn-amber btn-lg">
              {t('cta.primaryCta')}
            </Link>
            <a
              href={`tel:${BUSINESS_PHONE_TEL}`}
              className="btn btn-secondary btn-lg inline-flex items-center gap-2"
            >
              <Phone aria-hidden="true" size={18} strokeWidth={1.75} />
              {t('cta.secondaryCta')}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
