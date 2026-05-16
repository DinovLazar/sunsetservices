import {Star} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import AnimateIn from '@/components/global/motion/AnimateIn';
import StaggerContainer from '@/components/global/motion/StaggerContainer';
import StaggerItem from '@/components/global/motion/StaggerItem';

const REVIEWS = ['one', 'two', 'three'] as const;

/** Aggregate review figures (placeholders — Cowork pulls real numbers from
 *  the Google Business Profile in Phase 2). */
const RATING = '4.8';
const REVIEW_COUNT = '200';

function StarRow({size, label}: {size: number; label?: string}) {
  return (
    <div className="inline-flex items-center gap-1" aria-label={label} role={label ? 'img' : undefined}>
      {Array.from({length: 5}).map((_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          size={size}
          fill="var(--color-sunset-amber-500)"
          stroke="var(--color-sunset-amber-500)"
        />
      ))}
    </div>
  );
}

export default async function HomeSocialProof() {
  const t = await getTranslations('home.social');

  return (
    <section
      aria-labelledby="home-social-h2"
      className="bg-[var(--color-bg)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_900px]"
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

          {/* Aggregate row — stars are decorative; the rating is announced
              as text via aria-label on the wrapper. */}
          <div
            className="mt-8 flex flex-wrap items-center gap-3"
            role="img"
            aria-label={t('aggregateAria', {rating: RATING, count: REVIEW_COUNT})}
          >
            <StarRow size={20} />
            <span
              className="font-heading font-bold"
              style={{
                fontSize: 'var(--text-h3)',
                color: 'var(--color-text-primary)',
              }}
            >
              {RATING}
            </span>
            <span
              style={{
                fontSize: 'var(--text-body)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {t('aggregateBody', {count: REVIEW_COUNT})}
            </span>
          </div>
        </AnimateIn>

        <StaggerContainer className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {REVIEWS.map((slot) => (
            <StaggerItem key={slot}>
              <article
                className="card card-cream card-testimonial h-full"
              >
                <StarRow size={16} />
                <blockquote
                  className="font-heading italic m-0 mt-4"
                  style={{
                    fontSize: 'var(--text-h4)',
                    fontWeight: 500,
                    lineHeight: 'var(--leading-snug)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  &ldquo;{t(`reviews.${slot}.quote`)}&rdquo;
                </blockquote>
                <footer className="mt-6">
                  <cite
                    className="not-italic font-medium"
                    style={{
                      fontSize: 'var(--text-body-sm)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {t(`reviews.${slot}.name`)} · {t(`reviews.${slot}.city`)}
                  </cite>
                  <p
                    className="m-0 mt-1"
                    style={{
                      fontSize: 'var(--text-body-sm)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {t('via')}
                  </p>
                </footer>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Credentials row — desktop: 4 items in a row, equal-spaced.
            Mobile: horizontal scroll with snap. */}
        <div
          className="mt-12 pt-8 lg:pt-12"
          style={{borderTop: '1px solid var(--color-border)'}}
        >
          <div
            className="flex gap-6 lg:gap-12 lg:justify-between overflow-x-auto lg:overflow-visible"
            style={{
              scrollSnapType: 'x mandatory',
              scrollPaddingInline: '16px',
            }}
          >
            {/* 1. Unilock mark placeholder */}
            <div
              role="img"
              aria-label={t('cred.unilockAlt')}
              className="flex-shrink-0 flex items-center justify-center"
              style={{
                width: '240px',
                height: '64px',
                background: 'var(--color-bg-stone)',
                border: '1px dashed var(--color-border-strong)',
                borderRadius: 'var(--radius-md)',
                scrollSnapAlign: 'center',
              }}
            >
              <span
                className="font-heading font-semibold uppercase"
                style={{
                  fontSize: '13px',
                  letterSpacing: 'var(--tracking-eyebrow)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {t('cred.unilockPlaceholder')}
              </span>
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

            {/* 3. Top 5 Landscaping (D6 — show year as verification anchor) */}
            <div
              className="flex-shrink-0 flex flex-col justify-center"
              style={{height: '64px', scrollSnapAlign: 'center'}}
            >
              <p
                className="font-heading m-0"
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  lineHeight: 1.15,
                  color: 'var(--color-text-primary)',
                  letterSpacing: 'var(--tracking-snug)',
                }}
              >
                {t('cred.top5')}
              </p>
              <p
                className="m-0 mt-1"
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text-muted)',
                }}
              >
                {t('cred.top5sub')}
              </p>
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
