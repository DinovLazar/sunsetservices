import {getTranslations} from 'next-intl/server';
import AnimateIn from '@/components/global/motion/AnimateIn';
import type {Project} from '@/data/projects';

type Locale = 'en' | 'es';

type ProjectNarrativeProps = {
  project: Project;
  locale: Locale;
};

/**
 * Narrative section — Phase 1.15 §4.3.
 *
 * Surface `--color-bg-cream`. Eyebrow + H2 + prose. Single
 * `<AnimateIn fade-up>` wraps the section. `text-wrap: pretty` on
 * paragraphs.
 *
 * H2 uses `narrativeHeading` if present; falls back to `title`.
 */
export default async function ProjectNarrative({project, locale}: ProjectNarrativeProps) {
  const t = await getTranslations('project.narrative');
  const heading = project.narrativeHeading?.[locale] ?? project.title[locale];

  // Split narrative on blank lines for natural paragraph breaks.
  const paragraphs = project.narrative[locale]
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section
      aria-labelledby="project-narrative-h2"
      className="bg-[var(--color-bg-cream)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_600px]"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up">
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
            id="project-narrative-h2"
            className="m-0 font-heading font-bold"
            style={{
              fontSize: 'var(--text-h2)',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-snug)',
              textWrap: 'balance',
              maxWidth: '24ch',
            }}
          >
            {heading}
          </h2>
          <div className="mt-8 max-w-[var(--container-prose)]">
            {paragraphs.map((para, idx) => (
              <p
                key={idx}
                className="m-0 mt-5 first:mt-0"
                style={{
                  fontSize: 'var(--text-body)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--leading-relaxed)',
                  textWrap: 'pretty',
                }}
              >
                {para}
              </p>
            ))}
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
