import {getTranslations} from 'next-intl/server';
import AnimateIn from '@/components/global/motion/AnimateIn';

/**
 * Home process section (Phase M.16 — "Design, build, maintain — one team.").
 * White surface, three numbered steps on charcoal top-rules with orange
 * numerals. The numerals use orange-700 (#B45309, ≈5.9:1 on white) rather than
 * the brand orange-500 (#F28C38, ≈2.4:1 — fails AA) so they clear the contrast
 * floor while keeping the orange look; they are also aria-hidden (the ordinal
 * is decorative — the step title carries the meaning).
 *
 * One concise block, no per-item scroll animation (handover §7).
 */
export default async function HomeProcess() {
  const t = await getTranslations('home.process');
  const steps = t.raw('steps') as Array<{title: string; body: string}>;

  return (
    <section
      aria-labelledby="home-process-h2"
      className="bg-[var(--color-bg)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_640px]"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up" className="mb-10 lg:mb-14 max-w-[64ch]">
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
          <h2 id="home-process-h2" className="m-0">
            {t('h2')}
          </h2>
          <p
            className="m-0 mt-3"
            style={{fontSize: 'var(--text-body-lg)', color: 'var(--color-text-secondary)'}}
          >
            {t('sub')}
          </p>
        </AnimateIn>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 list-none p-0 m-0">
          {steps.map((step, i) => (
            <li key={step.title} style={{borderTop: '2px solid var(--color-text-primary)', paddingTop: 'var(--spacing-5)'}}>
              <span
                aria-hidden="true"
                className="block font-heading font-extrabold"
                style={{
                  fontSize: 'var(--text-h2)',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  color: 'var(--color-sunset-orange-700)',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="m-0 mt-4" style={{fontSize: 'var(--text-h4)'}}>
                {step.title}
              </h3>
              <p
                className="m-0 mt-3"
                style={{
                  fontSize: 'var(--text-body)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 'var(--leading-relaxed)',
                }}
              >
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
