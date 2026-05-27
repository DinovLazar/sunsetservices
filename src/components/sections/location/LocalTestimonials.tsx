import {getTranslations} from 'next-intl/server';
import {Star} from 'lucide-react';
import AnimateIn from '@/components/global/motion/AnimateIn';
import type {LocationCity} from '@/data/locations';

type LocalTestimonialsProps = {
  location: LocationCity;
  locale: 'en' | 'es';
};

/**
 * LocalTestimonials — Phase 1.14 §4.5.
 *
 * Renders the city's testimonial cards. The Phase 1.03 §6.2 lock specified
 * a 4px green `border-left` side-stripe; Phase M.10B replaced that with a
 * leading 4.5rem `"` (U+201C) quote glyph in green-500 at opacity 0.6,
 * positioned top-left via an absolutely-placed `<span aria-hidden>`. The
 * surrounding `<article>` is `position: relative` and the padding-top is
 * bumped to `var(--spacing-10)` to make headroom for the glyph. Mirrors
 * the `.card-testimonial` CSS class definition in `src/app/globals.css`.
 *
 * 5 filled stars are decorative — no aggregate score until Phase 2.15
 * wires real Google reviews. Quote prose is plain (NOT a `<blockquote>`
 * with hidden author — author + city are visible inside the card per
 * a11y §9).
 *
 * Section-level `<AnimateIn>` only.
 *
 * Surface: `--color-bg`.
 */
export default async function LocalTestimonials({
  location,
  locale,
}: LocalTestimonialsProps) {
  const t = await getTranslations('location.testimonials');

  if (location.testimonials.length === 0) return null;

  return (
    <section
      aria-labelledby="loc-testimonials-h2"
      className="bg-[var(--color-bg)] py-14 lg:py-20"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up" className="block">
          <h2
            id="loc-testimonials-h2"
            className="m-0 mb-8 lg:mb-10 font-heading"
            style={{
              fontSize: 'var(--text-h2)',
              fontWeight: 700,
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-snug)',
              color: 'var(--color-text-primary)',
            }}
          >
            {t('h2', {city: location.name})}
          </h2>
          <ul className="m-0 p-0 list-none grid grid-cols-1 lg:grid-cols-1 gap-6">
            {location.testimonials.map((tm, idx) => (
              <li key={idx}>
                <article
                  className="relative"
                  style={{
                    background: 'var(--color-bg-cream)',
                    borderRadius: 'var(--radius-xl)',
                    padding:
                      'var(--spacing-10) var(--spacing-8) var(--spacing-6) var(--spacing-8)',
                    boxShadow: 'var(--shadow-on-cream, var(--shadow-soft))',
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      top: 'var(--spacing-2)',
                      left: 'var(--spacing-4)',
                      fontFamily: 'var(--font-heading), Manrope, sans-serif',
                      fontSize: '4.5rem',
                      lineHeight: 1,
                      color: 'var(--color-sunset-green-500)',
                      opacity: 0.6,
                      pointerEvents: 'none',
                    }}
                  >
                    {'“'}
                  </span>
                  <div
                    className="flex items-center gap-1 mb-5"
                    role="img"
                    aria-label={t('ratingAria', {rating: String(tm.rating)})}
                  >
                    {Array.from({length: tm.rating}).map((_, i) => (
                      <Star
                        key={i}
                        aria-hidden="true"
                        fill="var(--color-sunset-amber-500)"
                        stroke="var(--color-sunset-amber-500)"
                        style={{width: 18, height: 18}}
                      />
                    ))}
                  </div>
                  <p
                    className="m-0"
                    style={{
                      fontFamily: 'var(--font-heading), Manrope, sans-serif',
                      fontSize: 'var(--text-h3)',
                      fontWeight: 500,
                      fontStyle: 'italic',
                      color: 'var(--color-text-primary)',
                      lineHeight: 1.35,
                      maxWidth: '60ch',
                    }}
                  >
                    &ldquo;{tm.quote[locale]}&rdquo;
                  </p>
                  <p
                    className="m-0 mt-5"
                    style={{
                      fontSize: 'var(--text-body-sm)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    — {tm.attribution[locale]}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </AnimateIn>
      </div>
    </section>
  );
}
