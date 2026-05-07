import {getTranslations} from 'next-intl/server';
import AnimateIn from '@/components/global/motion/AnimateIn';
import ContactForm from '@/components/forms/ContactForm';
import {
  BUSINESS_PHONE,
  BUSINESS_PHONE_TEL,
  BUSINESS_EMAIL,
  BUSINESS_ADDRESS_LINE1,
  BUSINESS_ADDRESS_LINE2,
} from '@/lib/constants/business';

/**
 * Contact info + form (two-column) — Phase 1.11 handover §4.2.
 *
 * Server-rendered wrapper: left column is the static info block, right
 * column nests the `<ContactForm/>` client island. The whole section is
 * wrapped in a SINGLE `<AnimateIn fade-up>` — never animate individual
 * form fields (a11y + perf anti-pattern per handover §8).
 *
 * Surface --color-bg-cream lifts the form card (--color-bg interior) and
 * info block both.
 */
export default async function ContactInfoForm({locale}: {locale: 'en' | 'es'}) {
  const t = await getTranslations('contact.info');
  const directionsHref = `https://maps.google.com/?q=${encodeURIComponent(
    `${BUSINESS_ADDRESS_LINE1}, ${BUSINESS_ADDRESS_LINE2}`,
  )}`;

  return (
    <section
      aria-labelledby="contact-info-h2"
      className="bg-[var(--color-bg-cream)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_900px]"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up" className="block">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-10 lg:gap-16">
            {/* Left: info block — server-rendered, no JS. */}
            <div>
              <h2
                id="contact-info-h2"
                className="font-heading font-semibold uppercase m-0 mb-6"
                style={{
                  fontSize: '13px',
                  letterSpacing: 'var(--tracking-eyebrow)',
                  color: 'var(--color-sunset-green-700)',
                }}
              >
                {t('eyebrow')}
              </h2>
              <dl className="m-0 space-y-7">
                <div>
                  <dt
                    className="m-0 font-heading"
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {t('phone.label')}
                  </dt>
                  <dd className="m-0 mt-1">
                    <a
                      href={`tel:${BUSINESS_PHONE_TEL}`}
                      className="font-heading"
                      style={{
                        fontSize: 'var(--text-h4)',
                        fontWeight: 600,
                        color: 'var(--color-sunset-green-700)',
                        textDecoration: 'underline',
                      }}
                    >
                      {BUSINESS_PHONE}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt
                    className="m-0 font-heading"
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {t('email.label')}
                  </dt>
                  <dd className="m-0 mt-1">
                    <a
                      href={`mailto:${BUSINESS_EMAIL}`}
                      style={{
                        fontSize: 'var(--text-body-lg)',
                        color: 'var(--color-sunset-green-700)',
                        textDecoration: 'underline',
                      }}
                    >
                      {BUSINESS_EMAIL}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt
                    className="m-0 font-heading"
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {t('address.label')}
                  </dt>
                  <dd className="m-0 mt-1">
                    <address
                      className="not-italic"
                      style={{
                        fontSize: 'var(--text-body)',
                        color: 'var(--color-text-primary)',
                        lineHeight: 'var(--leading-relaxed)',
                      }}
                    >
                      {BUSINESS_ADDRESS_LINE1}
                      <br />
                      {BUSINESS_ADDRESS_LINE2}
                    </address>
                    <a
                      href={directionsHref}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center mt-2"
                      style={{
                        fontSize: 'var(--text-body-sm)',
                        color: 'var(--color-sunset-green-700)',
                        textDecoration: 'underline',
                      }}
                    >
                      {t('directions')}
                      <span className="sr-only">
                        {' '}
                        — {BUSINESS_ADDRESS_LINE1}, {BUSINESS_ADDRESS_LINE2}
                      </span>
                    </a>
                  </dd>
                </div>
                <div>
                  <dt
                    className="m-0 font-heading"
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {t('hours.label')}
                  </dt>
                  <dd
                    className="m-0 mt-1"
                    style={{
                      fontSize: 'var(--text-body)',
                      color: 'var(--color-text-primary)',
                      lineHeight: 'var(--leading-relaxed)',
                    }}
                  >
                    <div>{t('hours.weekday')}</div>
                    <div>{t('hours.sat')}</div>
                    <div>{t('hours.sun')}</div>
                    <div
                      className="mt-2 italic"
                      style={{
                        fontSize: 'var(--text-body-sm)',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {t('hours.snow')}
                    </div>
                  </dd>
                </div>
              </dl>
              <p
                className="m-0 mt-7"
                style={{
                  fontSize: 'var(--text-body)',
                  color: 'var(--color-text-primary)',
                  fontWeight: 500,
                }}
              >
                {t('languages')}
              </p>
            </div>

            {/* Right: form card — the only client component on Contact. */}
            <div
              className="card p-6 lg:p-8"
              style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border-soft, #E0D9C5)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-on-cream, var(--shadow-soft))',
              }}
            >
              <ContactForm locale={locale} />
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
