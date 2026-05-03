import {getTranslations, setRequestLocale} from 'next-intl/server';

/**
 * Phase 1.05 homepage placeholder. The chrome (navbar, footer, skip-link)
 * needs *something* to wrap, but real homepage content arrives in Phase
 * 1.06 (Design) → 1.07 (Code). One headline + one paragraph; nothing else.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home.placeholder');

  return (
    <section className="mx-auto max-w-[var(--container-narrow)] px-4 sm:px-6 lg:px-8 xl:px-12 py-24 lg:py-32">
      <h1 className="text-h1 font-heading font-bold text-[var(--color-text-primary)]">
        {t('headline')}
      </h1>
      <p className="text-body-lg text-[var(--color-text-secondary)] mt-4 max-w-[60ch]">
        {t('body')}
      </p>
    </section>
  );
}
