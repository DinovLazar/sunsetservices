import {getTranslations} from 'next-intl/server';
import AnimateIn from '@/components/global/motion/AnimateIn';
import CredentialBadge from '@/components/ui/CredentialBadge';

/**
 * About credentials row — Phase 1.11 handover §3.4.
 *
 * 4-column row on desktop, 2×2 on mobile (D5 lock). Surface: --color-bg-cream.
 * Items (locked, fixed): Unilock Authorized · 25+ years · Top 5 (Tribune) ·
 * Google reviews 4.8.
 *
 * Animation: a SINGLE `<AnimateIn fade-up>` wraps the entire row (per
 * Phase 1.07 mobile-Performance lesson — do NOT stagger individual badges).
 */
export default async function AboutCredentials() {
  const t = await getTranslations('about.credentials');

  return (
    <section
      aria-labelledby="about-credentials-h2"
      className="bg-[var(--color-bg-cream)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_580px]"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up" className="block">
          <p
            className="font-heading font-semibold uppercase m-0 mb-3"
            style={{
              fontSize: '13px',
              letterSpacing: 'var(--tracking-eyebrow)',
              color: 'var(--color-sunset-green-700)',
            }}
          >
            {t('eyebrow')}
          </p>
          <h2
            id="about-credentials-h2"
            className="m-0 mb-10 lg:mb-14 font-heading"
            style={{
              fontSize: 'var(--text-h2)',
              fontWeight: 600,
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-snug)',
              color: 'var(--color-sunset-green-700)',
              textWrap: 'balance',
            }}
          >
            {t('h2')}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <CredentialBadge
              kind="unilock"
              title={t('unilock.title')}
              caption={t('unilock.caption')}
            />
            <CredentialBadge
              kind="years"
              title={t('years.title')}
              caption={t('years.caption')}
            />
            <CredentialBadge
              kind="tribune"
              title={t('tribune.title')}
              caption={t('tribune.caption')}
            />
            <CredentialBadge
              kind="google"
              title={t('google.title')}
              caption={t('google.caption')}
            />
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
