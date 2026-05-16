import type {Metadata} from 'next';
import {Suspense} from 'react';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import WizardShell from '@/components/wizard/WizardShell';
import {canonicalUrl, hreflangAlternates, type Locale} from '@/lib/seo/urls';

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'wizard'});
  const loc: Locale = locale === 'es' ? 'es' : 'en';
  const path = '/request-quote';
  return {
    title: `${t('title')} — Sunset Services`,
    description: t('subtitle'),
    alternates: {
      canonical: canonicalUrl(path, loc),
      languages: hreflangAlternates(path),
    },
  };
}

/**
 * `/request-quote/` — Phase 1.19 / Phase 1.20.
 *
 * Compact page header (D13 = B; eyebrow + H1 + step indicator owns the
 * upper-fold). Body is `WizardShell` — client component that orchestrates
 * 5 sequential steps + Review/Submit, URL-driven step state via `?step=N`,
 * autosave for Steps 1–3 only (PII boundary), validation, scroll-to-error,
 * and 200ms opacity-only step transitions.
 *
 * Schema: zero (form, not content surface — D15). Sitewide LocalBusiness
 * JSON-LD from the locale layout wraps unchanged.
 */
export default async function RequestQuotePage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('wizard');

  return (
    <section
      aria-labelledby="wizard-h1"
      className="bg-[var(--color-bg)] py-10 lg:py-14"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <p
          className="m-0 mb-3 font-heading font-semibold uppercase"
          style={{
            fontSize: 13,
            letterSpacing: 'var(--tracking-eyebrow)',
            color: 'var(--color-sunset-green-700)',
          }}
        >
          {t('eyebrow')}
        </p>
        <h1
          id="wizard-h1"
          className="m-0 font-heading"
          style={{
            fontSize: 'var(--text-h1)',
            fontWeight: 600,
            letterSpacing: 'var(--tracking-snug)',
            lineHeight: 'var(--leading-tight)',
            textWrap: 'balance',
          }}
        >
          {t('title')}
        </h1>
        <p
          className="m-0 mt-3"
          style={{
            fontSize: 'var(--text-body-lg)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {t('subtitle')}
        </p>

        <div className="mt-10 lg:mt-14">
          <Suspense fallback={null}>
            <WizardShell />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
