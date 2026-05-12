import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import AnimateIn from '@/components/global/motion/AnimateIn';
import ProjectCard from '@/components/ui/ProjectCard';
import {getLocation} from '@/data/locations';
import {PROJECT_LEAD} from '@/data/imageMap';
import type {Project} from '@/data/projects';
import {selectRelatedProjects} from '@/data/projects';

type Locale = 'en' | 'es';

type RelatedProjectsProps = {
  current: Project;
  locale: Locale;
  /** Phase 2.05 — Sanity-driven full project list. Defaults to the TS seed. */
  all?: Project[];
};

/**
 * Related projects strip — Phase 1.15 §4.7 / D11.
 *
 * 3 tiles. Selection is deterministic (handover §4.7):
 *   1. Same-audience excluding self.
 *   2. If <3, top up with same-city excluding self.
 *   3. If still <3, top up with most-recent excluding self.
 * Each tier sorted `year desc, slug asc`.
 *
 * Reuses `ProjectCard`. Surface `--color-bg-cream`. Footer link is a
 * body-link, not a button.
 */
export default async function RelatedProjects({current, locale, all}: RelatedProjectsProps) {
  const tRelated = await getTranslations('project.related');
  const tTag = await getTranslations('projects.tag');

  const related = selectRelatedProjects(current, 3, all);

  if (related.length === 0) return null;

  return (
    <section
      aria-labelledby="project-related-h2"
      className="bg-[var(--color-bg-cream)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_700px]"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up">
          <h2
            id="project-related-h2"
            className="m-0 mb-8 lg:mb-10 font-heading font-bold"
            style={{
              fontSize: 'var(--text-h2)',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-snug)',
              textWrap: 'balance',
            }}
          >
            {tRelated('h2')}
          </h2>
          <ul className="m-0 p-0 list-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {related.map((p) => {
              const city = getLocation(p.citySlug);
              const cityName = city?.name ?? p.citySlug;
              return (
                <li key={p.slug}>
                  <ProjectCard
                    href={`/projects/${p.slug}/`}
                    photo={PROJECT_LEAD[p.slug]}
                    alt={p.leadAlt[locale]}
                    title={p.title[locale]}
                    meta={`${cityName} · ${p.year}`}
                    audienceLabel={tTag(p.audience)}
                    loading="lazy"
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                  />
                </li>
              );
            })}
          </ul>
          <p className="m-0 mt-8 lg:mt-10">
            <Link
              href="/projects/"
              className="link link-inline"
              style={{
                fontSize: 'var(--text-body-lg)',
                color: 'var(--color-sunset-green-700)',
                fontWeight: 600,
              }}
            >
              {tRelated('seeAll')}
            </Link>
          </p>
        </AnimateIn>
      </div>
    </section>
  );
}
