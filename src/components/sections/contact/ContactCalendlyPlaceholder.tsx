import {getTranslations} from 'next-intl/server';
import AnimateIn from '@/components/global/motion/AnimateIn';
import {BUSINESS_PHONE, BUSINESS_PHONE_TEL} from '@/lib/constants/business';

/**
 * Calendly placeholder — Phase 1.11 handover §4.4 (D9 lock = tel fallback).
 *
 * Surface --color-bg-cream; card surface inside is --color-bg with soft
 * shadow. ZERO third-party load. Part-2 swap (Phase 2.07) replaces the
 * mock calendar with the live Calendly embed; the surrounding chrome
 * stays. "Coming soon" chip uses --color-sunset-amber-100 (NOT amber-500
 * — that would be a body amber CTA).
 */
export default async function ContactCalendlyPlaceholder() {
  const t = await getTranslations('contact.calendly');

  return (
    <section
      aria-labelledby="contact-calendly-h2"
      className="bg-[var(--color-bg-cream)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_700px]"
    >
      <div className="mx-auto max-w-[var(--container-narrow)] px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
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
            id="contact-calendly-h2"
            className="m-0 font-heading"
            style={{
              fontSize: 'var(--text-h2)',
              fontWeight: 600,
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-snug)',
              textWrap: 'balance',
            }}
          >
            {t('h2')}
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
            {t('body')}
          </p>

          <div
            className="mx-auto mt-10 p-6 lg:p-8"
            style={{
              maxWidth: '720px',
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border-soft, #E0D9C5)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-soft)',
            }}
          >
            <span
              className="inline-flex items-center font-heading font-semibold uppercase"
              style={{
                fontSize: '11px',
                letterSpacing: '0.08em',
                height: '22px',
                padding: '0 10px',
                borderRadius: '11px',
                background: 'var(--color-sunset-amber-100, #FDF7E8)',
                color: 'var(--color-sunset-amber-700, #B47821)',
              }}
            >
              {t('coming_soon')}
            </span>
            {/* Mock calendar grid — purely decorative. */}
            <div className="mt-5 mx-auto" aria-hidden="true" style={{maxWidth: '480px'}}>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({length: 10}).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      aspectRatio: '1 / 1',
                      background: 'var(--color-bg-cream)',
                      borderRadius: 'var(--radius-sm, 6px)',
                    }}
                  />
                ))}
              </div>
            </div>
            <p
              className="m-0 mt-6"
              style={{
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {t('fallback.body')}
            </p>
            <a
              href={`tel:${BUSINESS_PHONE_TEL}`}
              className="btn btn-secondary btn-md mt-4 inline-flex"
              style={{minWidth: '220px'}}
            >
              {t('fallback.cta', {phone: BUSINESS_PHONE})}
            </a>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
