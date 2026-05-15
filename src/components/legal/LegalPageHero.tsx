import {getTranslations} from 'next-intl/server';
import Breadcrumb from '@/components/ui/Breadcrumb';

type Props = {
  type: 'privacy' | 'terms';
  locale: string;
};

/**
 * LegalPageHero — Phase B.03.
 *
 * Light text-led hero for Privacy + Terms pages. No photo — legal pages
 * are document-style surfaces. Cream-band background per the locked
 * Phase 1.03 surface alternation. Breadcrumb (light variant) above the
 * H1 + "Last updated" subtitle.
 *
 * Phase B.02 handover §1 wasn't available in this worktree; the
 * structure follows the brief's text spec and the Phase 1.03
 * type/spacing scale.
 */
export default async function LegalPageHero({type, locale}: Props) {
  const t = await getTranslations({locale, namespace: `legal.${type}.hero`});
  const tCrumbs = await getTranslations({
    locale,
    namespace: 'legal.breadcrumb',
  });

  const slug = type;

  return (
    <section
      aria-labelledby={`legal-${type}-h1`}
      style={{
        background: 'var(--color-bg-cream)',
        borderBottom: '1px solid var(--color-border)',
        paddingTop: 'var(--spacing-12)',
        paddingBottom: 'var(--spacing-10)',
      }}
    >
      <div
        className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-12"
        style={{maxWidth: 'var(--container-default)'}}
      >
        <Breadcrumb
          variant="light"
          className="mb-4"
          items={[
            {name: tCrumbs('home'), href: '/'},
            {name: tCrumbs(slug)},
          ]}
        />
        <div style={{maxWidth: '64ch'}}>
          <p
            className="font-heading font-semibold uppercase m-0 mb-3"
            style={{
              fontSize: '12px',
              letterSpacing: 'var(--tracking-eyebrow)',
              color: 'var(--color-sunset-green-700)',
            }}
          >
            {t('eyebrow')}
          </p>
          <h1
            id={`legal-${type}-h1`}
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
            {t('h1')}
          </h1>
          <p
            className="m-0 mt-4"
            style={{
              fontSize: 'var(--text-body)',
              lineHeight: 'var(--leading-relaxed)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {t('lastUpdated')}
          </p>
        </div>
      </div>
    </section>
  );
}
