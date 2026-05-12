import {getLocale, getTranslations} from 'next-intl/server';
import AnimateIn from '@/components/global/motion/AnimateIn';
import CalendlyEmbed from '@/components/calendly/CalendlyEmbed';
import {BUSINESS_PHONE, BUSINESS_PHONE_TEL} from '@/lib/constants/business';

/**
 * Contact — Calendly section.
 *
 * Phase 1.11 §2.2 surface = `--color-bg-cream`. Phase 1.11 chrome
 * (eyebrow + h2 + body) preserved; Phase 2.07 swaps the old static
 * placeholder card for the real <CalendlyEmbed/>. A small secondary
 * `tel:` button sits below the widget as an intentional phone-preference
 * backup CTA (Plan §2 verbatim — "Keep the tel button visible BELOW the
 * widget — smaller, secondary styling").
 *
 * Component-name is a Phase 1.11 carryover — kept to avoid touching the
 * `/contact/` page import. The body now delegates to <CalendlyEmbed/>.
 */
export default async function ContactCalendlyPlaceholder() {
  const locale = (await getLocale()) as 'en' | 'es';
  const t = await getTranslations('contact.calendly');

  return (
    <section
      aria-labelledby="contact-calendly-h2"
      className="bg-[var(--color-bg-cream)] py-14 lg:py-20"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
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

          <div className="mt-10">
            <CalendlyEmbed
              locale={locale}
              namespace="contact.calendly"
              minHeight={720}
              surface="cream"
            />
          </div>

          <p
            className="m-0 mt-6"
            style={{
              fontSize: 'var(--text-body-sm)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <a
              href={`tel:${BUSINESS_PHONE_TEL}`}
              className="link link-inline"
              style={{
                color: 'var(--color-sunset-green-700)',
                fontWeight: 600,
              }}
            >
              {t('fallbackCta', {phone: BUSINESS_PHONE})}
            </a>
          </p>
        </AnimateIn>
      </div>
    </section>
  );
}
