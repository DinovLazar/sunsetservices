import {getTranslations} from 'next-intl/server';
import {PROJECTS} from '@/data/projects';

/**
 * Projects index hero — Phase 1.15 §3.1 / D4.B.
 *
 * Compact text-only hero on cream. The grid below is 100% photo, so a
 * photo hero would compete with it. No entrance animation (1.03 §7).
 *
 * The count line is dynamic — `{count} projects · {cities} cities ·
 * {minYear}–{maxYear}` interpolates the values computed from the
 * unfiltered `PROJECTS` array at request time.
 */
export default async function ProjectsHero() {
  const t = await getTranslations('projects.hero');

  const count = PROJECTS.length;
  const cities = new Set(PROJECTS.map((p) => p.citySlug)).size;
  const years = PROJECTS.map((p) => p.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  return (
    <section
      aria-labelledby="projects-hero-h1"
      className="bg-[var(--color-bg-cream)] py-14 lg:py-20"
    >
      <div className="mx-auto max-w-[var(--container-wide)] px-4 sm:px-6 lg:px-8 xl:px-12">
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
        <h1
          id="projects-hero-h1"
          className="m-0 font-heading font-bold"
          style={{
            fontSize: 'var(--text-h1)',
            lineHeight: 'var(--leading-tight)',
            letterSpacing: 'var(--tracking-snug)',
            textWrap: 'balance',
            maxWidth: '20ch',
          }}
        >
          {t('h1')}
        </h1>
        <p
          className="m-0 mt-6 max-w-[64ch]"
          style={{
            fontSize: 'var(--text-body-lg)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--leading-relaxed)',
          }}
        >
          {t('dek')}
        </p>
        <p
          className="m-0 mt-6"
          style={{
            fontSize: 'var(--text-body-sm)',
            color: 'var(--color-text-muted)',
            fontWeight: 500,
          }}
        >
          {t('count', {count, cities, minYear, maxYear})}
        </p>
      </div>
    </section>
  );
}
