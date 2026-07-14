import AnimateIn from '@/components/global/motion/AnimateIn';
import type {ProjectFact} from '@sanity-lib/types';

type Locale = 'en' | 'es';

/**
 * At-a-glance facts strip — Phase M.18 (PSS-002 §2, "At-a-glance facts").
 *
 * The short answer to "what was this job?", directly under the hero: Location,
 * Service, Walls, Planting, Lighting, Completed. Deliberately free-form rows
 * (label + value) rather than the fixed six-row <ProjectFacts> table, because
 * every trade describes its own work differently — a wall job has linear feet, a
 * waterproofing job has a depth.
 *
 * Renders nothing when the project has no facts, so a legacy project is unchanged.
 */
export default function ProjectAtAGlance({
  facts,
  locale,
}: {
  facts: ProjectFact[];
  locale: Locale;
}) {
  const rows = facts.filter((f) => f.label[locale] && f.value[locale]);
  if (rows.length === 0) return null;

  return (
    <section
      aria-label="Project at a glance"
      className="bg-[var(--color-bg-cream)] pt-10 lg:pt-14"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up">
          <dl className="grid grid-cols-1 gap-x-10 gap-y-4 rounded-[var(--radius-card,12px)] border border-[var(--color-border)] bg-white/60 px-5 py-5 sm:grid-cols-2 lg:grid-cols-3 lg:px-7 lg:py-6">
            {rows.map((fact, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <dt
                  className="font-heading uppercase m-0"
                  style={{
                    fontSize: '12px',
                    letterSpacing: '0.08em',
                    color: 'var(--color-text-muted)',
                    fontWeight: 600,
                  }}
                >
                  {fact.label[locale]}
                </dt>
                <dd
                  className="m-0"
                  style={{
                    fontSize: 'var(--text-body)',
                    color: 'var(--color-text-primary)',
                    lineHeight: 'var(--leading-snug, 1.4)',
                    textWrap: 'pretty',
                  }}
                >
                  {fact.value[locale]}
                </dd>
              </div>
            ))}
          </dl>
        </AnimateIn>
      </div>
    </section>
  );
}
