import * as React from 'react';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import AnimateIn from '@/components/global/motion/AnimateIn';
import {SERVICES, getService, type Division} from '@/data/services';
import {getLocation} from '@/data/locations';
import type {Project} from '@/data/projects';
import {getProjectDivision} from '@/lib/projects/getProjectDivision';

type Locale = 'en' | 'es';

type ProjectFactsProps = {
  project: Project;
  locale: Locale;
};

/**
 * Facts table — Phase 1.15 §4.5 / D10. Six rows on `--color-bg-cream`.
 * `<dl>` semantics. Service slugs resolve to localized service names with
 * deep links to the service detail page; city slug resolves to the
 * locale-aware Service Areas city page; audience deep-links to the
 * audience landing.
 */
export default async function ProjectFacts({project, locale}: ProjectFactsProps) {
  const t = await getTranslations('project.facts');
  const tTag = await getTranslations('projects.tag');

  const city = getLocation(project.citySlug);
  const cityName = city?.name ?? project.citySlug;
  // Phase M.10c addendum — division-derived label + href (was audience).
  const division = getProjectDivision(project, SERVICES);
  const divisionLabel = tTag(division);

  const resolvedServices = project.serviceSlugs
    .map((slug) => {
      // Prefer same-audience match; fall back to first occurrence.
      const svc = getService(slug, project.audience) ?? SERVICES.find((s) => s.slug === slug);
      return svc ? {slug: svc.slug, name: svc.name[locale], division: svc.division} : null;
    })
    .filter(Boolean) as {slug: string; name: string; division: Division}[];
  const divisionHref = `/${division}/`;

  return (
    <section
      aria-labelledby="project-facts-h2"
      className="bg-[var(--color-bg-cream)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_500px]"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up">
          <h2
            id="project-facts-h2"
            className="m-0 mb-8 lg:mb-10 font-heading font-bold"
            style={{
              fontSize: 'var(--text-h2)',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-snug)',
              textWrap: 'balance',
            }}
          >
            {t('h2')}
          </h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {/* Year */}
            <div className="border-b border-[var(--color-border)] pb-4">
              <dt
                className="font-heading uppercase m-0"
                style={{
                  fontSize: '13px',
                  letterSpacing: '0.08em',
                  color: 'var(--color-text-muted)',
                  fontWeight: 600,
                }}
              >
                {t('year')}
              </dt>
              <dd
                className="m-0 mt-1"
                style={{
                  fontSize: 'var(--text-body)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {project.year}
              </dd>
            </div>
            {/* City */}
            <div className="border-b border-[var(--color-border)] pb-4">
              <dt
                className="font-heading uppercase m-0"
                style={{
                  fontSize: '13px',
                  letterSpacing: '0.08em',
                  color: 'var(--color-text-muted)',
                  fontWeight: 600,
                }}
              >
                {t('city')}
              </dt>
              <dd
                className="m-0 mt-1"
                style={{
                  fontSize: 'var(--text-body)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {city ? (
                  <Link
                    href={`/service-areas/${project.citySlug}`}
                    className="link link-inline"
                    style={{color: 'var(--color-sunset-green-700)', fontWeight: 500}}
                  >
                    {cityName}, IL
                  </Link>
                ) : (
                  // Phase M.11b: guard projects whose Sanity `citySlug` is empty —
                  // `/service-areas/${''}/` collapsed to a bare `/service-areas/`
                  // (308 + wrong destination). Render plain text instead of a link.
                  <span style={{color: 'var(--color-text-primary)'}}>
                    {cityName ? `${cityName}, IL` : '—'}
                  </span>
                )}
              </dd>
            </div>
            {/* Division (Phase M.10c addendum — was Audience) */}
            <div className="border-b border-[var(--color-border)] pb-4">
              <dt
                className="font-heading uppercase m-0"
                style={{
                  fontSize: '13px',
                  letterSpacing: '0.08em',
                  color: 'var(--color-text-muted)',
                  fontWeight: 600,
                }}
              >
                {t('division')}
              </dt>
              <dd
                className="m-0 mt-1"
                style={{
                  fontSize: 'var(--text-body)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <Link
                  href={divisionHref}
                  className="link link-inline"
                  style={{color: 'var(--color-sunset-green-700)', fontWeight: 500}}
                >
                  {divisionLabel}
                </Link>
              </dd>
            </div>
            {/* Services */}
            <div className="border-b border-[var(--color-border)] pb-4">
              <dt
                className="font-heading uppercase m-0"
                style={{
                  fontSize: '13px',
                  letterSpacing: '0.08em',
                  color: 'var(--color-text-muted)',
                  fontWeight: 600,
                }}
              >
                {t('services')}
              </dt>
              <dd
                className="m-0 mt-1"
                style={{
                  fontSize: 'var(--text-body)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {resolvedServices.map((s, idx) => (
                  <React.Fragment key={s.slug}>
                    {idx > 0 ? <span aria-hidden="true"> · </span> : null}
                    <Link
                      href={`/${s.division}/${s.slug}/`}
                      className="link link-inline"
                      style={{color: 'var(--color-sunset-green-700)', fontWeight: 500}}
                    >
                      {s.name}
                    </Link>
                  </React.Fragment>
                ))}
              </dd>
            </div>
            {/* Materials */}
            <div className="border-b border-[var(--color-border)] pb-4">
              <dt
                className="font-heading uppercase m-0"
                style={{
                  fontSize: '13px',
                  letterSpacing: '0.08em',
                  color: 'var(--color-text-muted)',
                  fontWeight: 600,
                }}
              >
                {t('materials')}
              </dt>
              <dd
                className="m-0 mt-1"
                style={{
                  fontSize: 'var(--text-body)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {project.materials[locale]}
              </dd>
            </div>
            {/* Duration */}
            <div className="border-b border-[var(--color-border)] pb-4">
              <dt
                className="font-heading uppercase m-0"
                style={{
                  fontSize: '13px',
                  letterSpacing: '0.08em',
                  color: 'var(--color-text-muted)',
                  fontWeight: 600,
                }}
              >
                {t('duration')}
              </dt>
              <dd
                className="m-0 mt-1"
                style={{
                  fontSize: 'var(--text-body)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {t('durationWeeks', {n: project.durationWeeks})}
              </dd>
            </div>
          </dl>
        </AnimateIn>
      </div>
    </section>
  );
}
