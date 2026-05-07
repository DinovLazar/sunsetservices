import {getTranslations} from 'next-intl/server';
import AnimateIn from '@/components/global/motion/AnimateIn';
import {BUSINESS_EMAIL, BUSINESS_PHONE_TEL} from '@/lib/constants/business';

/**
 * OutsideAreaBand — Phase 1.14 §3.4.
 *
 * Two-column desktop / stacked mobile. Informational block; no CTA button.
 * Phone and email are inline links (visible number/address IS the link
 * text).
 *
 * Surface: `--color-bg`.
 */
export default async function OutsideAreaBand() {
  const t = await getTranslations('serviceAreas.outside');

  return (
    <section
      aria-labelledby="sa-outside-h2"
      className="bg-[var(--color-bg)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_360px]"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up" className="block">
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 lg:gap-12 items-start">
            <div>
              <h2
                id="sa-outside-h2"
                className="m-0 font-heading"
                style={{
                  fontSize: 'var(--text-h2)',
                  fontWeight: 700,
                  lineHeight: 'var(--leading-tight)',
                  letterSpacing: 'var(--tracking-snug)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {t('h2')}
              </h2>
              <p
                className="m-0 mt-5"
                style={{
                  fontSize: 'var(--text-body-lg)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 'var(--leading-relaxed)',
                  maxWidth: '60ch',
                }}
              >
                {t('body')}
              </p>
            </div>
            <ul
              className="m-0 p-0 list-none flex flex-col gap-3 lg:items-end"
              aria-label="Contact options"
            >
              <li>
                <a
                  href={`tel:${BUSINESS_PHONE_TEL}`}
                  style={{
                    fontSize: 'var(--text-body-lg)',
                    color: 'var(--color-sunset-green-700)',
                    textDecoration: 'underline',
                    fontWeight: 500,
                  }}
                >
                  {t('phoneLabel')}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${BUSINESS_EMAIL}`}
                  style={{
                    fontSize: 'var(--text-body-lg)',
                    color: 'var(--color-sunset-green-700)',
                    textDecoration: 'underline',
                    fontWeight: 500,
                  }}
                >
                  {t('emailLabel')}
                </a>
              </li>
            </ul>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
