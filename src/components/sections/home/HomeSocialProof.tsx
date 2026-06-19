import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import unilockBadge from '@/assets/brand/unilock-authorized-contractor.png';
import AnimateIn from '@/components/global/motion/AnimateIn';

/**
 * Home credentials band. Phase M.14 (Goran QA B-09): the fake/templated
 * testimonials (B1), the inflated "4.8 / 200+" Google aggregate (B2), and
 * the unverifiable "Top 5 — DuPage Tribune · 2024" award (B3) were removed.
 * Real Google reviews + the verified rating return in M.14b. What remains
 * is a clean, verifiable credentials row.
 */
export default async function HomeSocialProof() {
  const t = await getTranslations('home.social');

  return (
    <section
      aria-labelledby="home-social-h2"
      className="bg-[var(--color-bg)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_520px]"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up">
          <p
            className="font-heading font-semibold uppercase m-0 mb-2"
            style={{
              fontSize: '13px',
              letterSpacing: 'var(--tracking-eyebrow)',
              color: 'var(--color-sunset-green-700)',
            }}
          >
            {t('eyebrow')}
          </p>
          <h2 id="home-social-h2" className="m-0">
            {t('h2')}
          </h2>
        </AnimateIn>

        {/* Credentials row — desktop: items in a row, equal-spaced.
            Mobile: horizontal scroll with snap. */}
        <div
          className="mt-10 pt-8 lg:pt-12"
          style={{borderTop: '1px solid var(--color-border)'}}
        >
          <div
            className="flex gap-6 lg:gap-12 lg:justify-between overflow-x-auto lg:overflow-visible"
            style={{
              scrollSnapType: 'x mandatory',
              scrollPaddingInline: '16px',
            }}
          >
            {/* 1. Unilock Authorized Contractor badge (Phase M.01c — real badge) */}
            <div
              className="flex-shrink-0 flex items-center justify-center"
              style={{height: '64px', scrollSnapAlign: 'center'}}
            >
              <Image
                src={unilockBadge}
                alt={t('cred.unilockAlt')}
                width={88}
                height={56}
                style={{height: '56px', width: 'auto'}}
              />
            </div>

            {/* 2. 25+ years */}
            <div
              className="flex-shrink-0 flex items-center gap-3"
              style={{height: '64px', scrollSnapAlign: 'center'}}
            >
              <span
                className="font-heading"
                style={{
                  fontSize: '40px',
                  fontWeight: 800,
                  lineHeight: 1,
                  color: 'var(--color-sunset-green-700)',
                  letterSpacing: '-0.02em',
                }}
              >
                {t('cred.yearsBig')}
              </span>
              <span
                className="font-heading"
                style={{
                  fontSize: 'var(--text-body-sm)',
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: 'var(--color-text-secondary)',
                }}
              >
                {t('cred.yearsLabelLine1')}
                <br />
                {t('cred.yearsLabelLine2')}
              </span>
            </div>

            {/* 3. Bilingual crews (verifiable; replaced the removed
                Tribune award badge in Phase M.14) */}
            <div
              className="flex-shrink-0 flex items-center gap-3"
              style={{height: '64px', scrollSnapAlign: 'center'}}
            >
              <span
                className="font-heading"
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  lineHeight: 1,
                  color: 'var(--color-sunset-green-700)',
                  letterSpacing: '-0.01em',
                }}
              >
                {t('cred.bilingualBig')}
              </span>
              <span
                className="font-heading"
                style={{
                  fontSize: 'var(--text-body-sm)',
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: 'var(--color-text-secondary)',
                }}
              >
                {t('cred.bilingualLabel')}
              </span>
            </div>

            {/* 4. D5 — hidden BBB placeholder. DOM present so the layout
                doesn't shift if Cowork adds a membership in Phase 2.04. */}
            <div
              aria-hidden="true"
              className="flex-shrink-0"
              style={{
                width: '240px',
                height: '64px',
                visibility: 'hidden',
                scrollSnapAlign: 'center',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
