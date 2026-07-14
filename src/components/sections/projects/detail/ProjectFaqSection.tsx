import AnimateIn from '@/components/global/motion/AnimateIn';
import type {ProjectFaqEntry} from '@sanity-lib/types';

type Locale = 'en' | 'es';

/**
 * Project FAQ — Phase M.18 (PSS-002 §5, "The FAQ that AI assistants quote").
 *
 * The answer-engine surface of the page. The same entries are emitted as FAQPage
 * JSON-LD by the route, so what a person reads and what an assistant quotes are
 * the same text — never two versions that can drift apart.
 *
 * Rendered as a plain heading/answer run rather than an accordion: the content is
 * short, and text that is visible in the DOM without a click is text an answer
 * engine will actually read.
 */
export default function ProjectFaqSection({
  faq,
  heading,
  locale,
}: {
  faq: ProjectFaqEntry[];
  heading: string;
  locale: Locale;
}) {
  const entries = faq.filter(
    (e) => e.question[locale]?.trim() && e.answer[locale]?.trim(),
  );
  if (entries.length === 0) return null;

  return (
    <section
      aria-labelledby="project-faq-h2"
      className="bg-[var(--color-bg-cream)] py-12 lg:py-16 [content-visibility:auto] [contain-intrinsic-size:auto_500px]"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up">
          <h2
            id="project-faq-h2"
            className="m-0 mb-8 font-heading font-bold"
            style={{
              fontSize: 'var(--text-h2)',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-snug)',
              textWrap: 'balance',
            }}
          >
            {heading}
          </h2>

          <dl className="m-0 flex max-w-[var(--container-prose)] flex-col gap-7">
            {entries.map((entry, i) => (
              <div key={i} className="flex flex-col gap-2">
                <dt
                  className="m-0 font-heading font-semibold"
                  style={{
                    fontSize: 'var(--text-body-lg, 1.125rem)',
                    color: 'var(--color-text-primary)',
                    lineHeight: 'var(--leading-snug, 1.4)',
                    textWrap: 'balance',
                  }}
                >
                  {entry.question[locale]}
                </dt>
                <dd
                  className="m-0"
                  style={{
                    fontSize: 'var(--text-body)',
                    color: 'var(--color-text-primary)',
                    lineHeight: 'var(--leading-relaxed)',
                    textWrap: 'pretty',
                  }}
                >
                  {entry.answer[locale]}
                </dd>
              </div>
            ))}
          </dl>
        </AnimateIn>
      </div>
    </section>
  );
}
