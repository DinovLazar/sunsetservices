import {getTranslations} from 'next-intl/server';
import AnimateIn from '@/components/global/motion/AnimateIn';
import ProjectCard from '@/components/ui/ProjectCard';
import {getLocation} from '@/data/locations';
import {PROJECT_LEAD} from '@/data/imageMap';
import type {Project} from '@/data/projects';

type Locale = 'en' | 'es';

type ProjectsGridProps = {
  /** Already-filtered + already-paginated slice the grid renders. */
  projects: Project[];
  locale: Locale;
};

/**
 * Projects grid — Phase 1.15 §3.3.
 *
 * 3-col desktop / 2-col tablet / 1-col mobile. Uses the locked
 * `ProjectCard` primitive. The grid container is wrapped in EXACTLY ONE
 * `<AnimateIn fade-up>` — never per-tile. Phase 1.07 P=86 lesson is
 * binding (handover §1, §10). First 6 tiles eager, tiles 7–12 `lazy`.
 *
 * Receives the filtered+paginated slice from the server route — does not
 * read `searchParams` itself.
 */
export default async function ProjectsGrid({projects, locale}: ProjectsGridProps) {
  const tTag = await getTranslations('projects.tag');

  return (
    <section
      aria-labelledby="projects-grid-h2"
      className="bg-[var(--color-bg)] pt-8 pb-14 lg:pt-10 lg:pb-20"
    >
      <div className="mx-auto max-w-[var(--container-wide)] px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Visually-hidden H2 keeps the page heading hierarchy sequential
            (H1 → H2 → H3 in tiles). Without it, Lighthouse flags the
            H1 → H3 jump as a heading-order violation. */}
        <h2
          id="projects-grid-h2"
          className="sr-only m-0"
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            margin: '-1px',
            padding: 0,
            overflow: 'hidden',
            clip: 'rect(0,0,0,0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          Projects
        </h2>
        <AnimateIn variant="fade-up">
          <ul className="m-0 p-0 list-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {projects.map((p, idx) => {
              const city = getLocation(p.citySlug);
              const cityName = city?.name ?? p.citySlug;
              const photo = PROJECT_LEAD[p.slug];
              const isLcpCandidate = idx === 0;
              // Only the LCP tile is eager (via priority). All other tiles
              // lazy-load via IntersectionObserver to free up mobile bandwidth
              // for the first paint. Phase 1.07 mobile-LH lesson.
              const eager = isLcpCandidate;
              return (
                <li key={p.slug}>
                  <ProjectCard
                    href={`/projects/${p.slug}/`}
                    photo={photo}
                    alt={p.leadAlt[locale]}
                    title={p.title[locale]}
                    meta={`${cityName} · ${p.year}`}
                    audienceLabel={tTag(p.audience)}
                    priority={isLcpCandidate}
                    loading={eager ? 'eager' : 'lazy'}
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                  />
                </li>
              );
            })}
          </ul>
        </AnimateIn>
      </div>
    </section>
  );
}
