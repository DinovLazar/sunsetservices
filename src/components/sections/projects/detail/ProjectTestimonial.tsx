import AnimateIn from '@/components/global/motion/AnimateIn';
import type {Localized} from '@sanity-lib/types';

type Locale = 'en' | 'es';

/**
 * Homeowner satisfaction — Phase M.18 (PSS-002 §2, "Homeowner satisfaction").
 *
 * Two distinct things, deliberately kept apart:
 *   - the STATEMENT, in Sunset's own voice ("two years on, they still tell us…"),
 *     which we can always say;
 *   - the PULL-QUOTE, in the homeowner's words, which is only ever published with
 *     their permission — so it is a separate, separately-optional field.
 */
export default function ProjectTestimonial({
  statement,
  quote,
  attribution,
  heading,
  locale,
}: {
  statement: Localized;
  quote: Localized;
  attribution: string;
  heading: string;
  locale: Locale;
}) {
  const said = statement[locale]?.trim();
  const pull = quote[locale]?.trim();
  if (!said && !pull) return null;

  return (
    <section
      aria-labelledby="project-testimonial-h2"
      className="bg-[var(--color-bg-cream)] py-12 lg:py-16"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up">
          <h2
            id="project-testimonial-h2"
            className="m-0 font-heading font-bold"
            style={{
              fontSize: 'var(--text-h2)',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-snug)',
              textWrap: 'balance',
            }}
          >
            {heading}
          </h2>

          {said ? (
            <p
              className="mt-5 max-w-[var(--container-prose)]"
              style={{
                fontSize: 'var(--text-body)',
                color: 'var(--color-text-primary)',
                lineHeight: 'var(--leading-relaxed)',
                textWrap: 'pretty',
              }}
            >
              {said}
            </p>
          ) : null}

          {pull ? (
            <figure className="mt-8 max-w-[var(--container-prose)] border-l-2 pl-5 lg:pl-6" style={{borderColor: 'var(--color-sunset-green-700)'}}>
              <blockquote className="m-0">
                <p
                  className="m-0 font-heading"
                  style={{
                    fontSize: 'var(--text-h3, 1.5rem)',
                    lineHeight: 'var(--leading-snug, 1.4)',
                    color: 'var(--color-text-primary)',
                    textWrap: 'pretty',
                  }}
                >
                  &ldquo;{pull}&rdquo;
                </p>
              </blockquote>
              {attribution ? (
                <figcaption
                  className="mt-3"
                  style={{
                    fontSize: 'var(--text-small, 0.9rem)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  — {attribution}
                </figcaption>
              ) : null}
            </figure>
          ) : null}
        </AnimateIn>
      </div>
    </section>
  );
}
