import Image from 'next/image';
import {getLocale, getTranslations} from 'next-intl/server';
import {Check} from 'lucide-react';
import AnimateIn from '@/components/global/motion/AnimateIn';
import unilockBadge from '@/assets/brand/unilock-authorized-contractor.png';
import {getPublishedReviews} from '@sanity-lib/queries';

/**
 * Home trust / credentials band (Phase M.16). Dark `#23231D` surface,
 * verifiable signals only — no invented ratings, no borrowed awards (the
 * Phase M.14 removals stay removed).
 *
 * Left: "Credentials you can verify" + a row of verifiable chips. Right: a
 * prominent UNILOCK Authorized Contractor card (badge, shown WITHOUT a year per
 * D3) AND a real-Google-reviews slot — `getPublishedReviews()` renders real
 * review cards when they exist, and falls back to the credentials view (the
 * chips + UNILOCK card) when the array is empty (it is empty today).
 *
 * Per handover §7 there is no per-item scroll animation — only the two columns
 * fade in once.
 */
const CHIP_KEYS = ['founding', 'years', 'insured', 'area', 'bilingual'] as const;

export default async function HomeSocialProof() {
  const locale = (await getLocale()) === 'es' ? 'es' : 'en';
  const t = await getTranslations('home.social');
  const reviews = await getPublishedReviews(3);

  return (
    <section
      aria-labelledby="home-social-h2"
      className="py-16 lg:py-24 text-[var(--color-text-on-dark)] [content-visibility:auto] [contain-intrinsic-size:auto_640px]"
      style={{backgroundColor: '#23231D'}}
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 lg:gap-16 items-start">
          {/* Left — the verifiable credentials. */}
          <AnimateIn variant="fade-up">
            <p
              className="font-heading font-semibold uppercase m-0 mb-2"
              style={{
                fontSize: '13px',
                letterSpacing: 'var(--tracking-eyebrow)',
                color: 'var(--color-sunset-orange-300)',
              }}
            >
              {t('eyebrow')}
            </p>
            <h2 id="home-social-h2" className="m-0" style={{color: 'var(--color-text-on-dark)'}}>
              {t('h2')}
            </h2>
            <p
              className="m-0 mt-3"
              style={{
                fontSize: 'var(--text-body-lg)',
                color: 'rgba(250,247,241,0.78)',
                maxWidth: '46ch',
              }}
            >
              {t('sub')}
            </p>
            <ul className="mt-7 flex flex-wrap gap-3 list-none p-0 m-0">
              {CHIP_KEYS.map((k) => (
                <li
                  key={k}
                  className="inline-flex items-center gap-2 font-heading font-semibold"
                  style={{
                    background: 'rgba(250,247,241,0.07)',
                    border: '1px solid rgba(250,247,241,0.14)',
                    color: 'var(--color-text-on-dark)',
                    borderRadius: '9999px',
                    padding: '8px 14px',
                    fontSize: 'var(--text-body-sm)',
                  }}
                >
                  <Check size={15} strokeWidth={2.5} aria-hidden="true" style={{color: 'var(--color-sunset-orange-300)'}} />
                  {t(`chips.${k}`)}
                </li>
              ))}
            </ul>
          </AnimateIn>

          {/* Right — UNILOCK card + the reviews-or-credentials slot. */}
          <AnimateIn variant="fade-up">
            <div
              className="flex items-center gap-5"
              style={{
                background: 'rgba(250,247,241,0.06)',
                border: '1px solid rgba(250,247,241,0.14)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-6)',
              }}
            >
              <Image
                src={unilockBadge}
                alt={t('unilock.alt')}
                width={104}
                height={66}
                style={{height: '66px', width: 'auto', flexShrink: 0}}
              />
              <div>
                <h3 className="m-0" style={{fontSize: 'var(--text-h5)', color: 'var(--color-text-on-dark)'}}>
                  {t('unilock.title')}
                </h3>
                <p
                  className="m-0 mt-1.5"
                  style={{fontSize: 'var(--text-body-sm)', color: 'rgba(250,247,241,0.72)'}}
                >
                  {t('unilock.sub')}
                </p>
              </div>
            </div>

            {reviews.length > 0 ? (
              <div className="mt-6">
                <h3
                  className="m-0 mb-4 font-heading font-semibold"
                  style={{fontSize: 'var(--text-h6)', color: 'rgba(250,247,241,0.86)'}}
                >
                  {t('reviews.title')}
                </h3>
                <ul className="flex flex-col gap-3 list-none p-0 m-0">
                  {reviews.map((r) => (
                    <li
                      key={r._id}
                      style={{
                        background: 'rgba(250,247,241,0.06)',
                        border: '1px solid rgba(250,247,241,0.12)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--spacing-4)',
                      }}
                    >
                      <p
                        className="m-0"
                        style={{fontSize: 'var(--text-body-sm)', color: 'var(--color-text-on-dark)', lineHeight: 'var(--leading-relaxed)'}}
                      >
                        &ldquo;{r.quote[locale]}&rdquo;
                      </p>
                      <p
                        className="m-0 mt-2 font-heading font-semibold"
                        style={{fontSize: 'var(--text-body-sm)', color: 'rgba(250,247,241,0.72)'}}
                      >
                        — {r.attribution[locale]}
                      </p>
                      {r.sourceUrl ? (
                        <a
                          href={r.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex mt-2 font-heading font-semibold"
                          style={{fontSize: 'var(--text-body-sm)', color: 'var(--color-sunset-orange-300)'}}
                        >
                          {t('reviews.viewOnGoogle')}
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
