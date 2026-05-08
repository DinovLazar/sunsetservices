import Image from 'next/image';
import Breadcrumb from '@/components/ui/Breadcrumb';
import {getLocation} from '@/data/locations';
import type {Project} from '@/data/projects';
import {PROJECT_LEAD} from '@/data/imageMap';
import {getTranslations} from 'next-intl/server';

type Locale = 'en' | 'es';

type ProjectHeroProps = {
  project: Project;
  locale: Locale;
  /** Same items array drives BreadcrumbList JSON-LD (1.09 §2 same-source rule). */
  breadcrumbItems: {name: string; href?: string}[];
};

/**
 * Project detail hero — Phase 1.15 §4.1 (D6.B compact split) + §4.2
 * (breadcrumb).
 *
 * 60/40 split desktop · stacked mobile (copy → photo). Lead photo is the
 * LCP candidate: `priority` + `fetchPriority="high"`. No entrance
 * animation (1.03 §7).
 *
 * Breadcrumb sits inside this hero band, top-left, on `--color-bg` (white)
 * surface — uses the `light` Breadcrumb variant.
 */
export default async function ProjectHero({project, locale, breadcrumbItems}: ProjectHeroProps) {
  const tHero = await getTranslations('project.hero');
  const tTag = await getTranslations('projects.tag');

  const city = getLocation(project.citySlug);
  const cityName = city?.name ?? project.citySlug;
  const photo = PROJECT_LEAD[project.slug];

  return (
    <section
      aria-labelledby="project-hero-h1"
      className="bg-[var(--color-bg)] pt-6 pb-14 lg:pt-8 lg:pb-20"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <Breadcrumb items={breadcrumbItems} variant="light" className="mb-8 lg:mb-10" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7">
            <p
              className="font-heading font-semibold uppercase m-0 mb-3"
              style={{
                fontSize: '13px',
                letterSpacing: 'var(--tracking-eyebrow)',
                color: 'var(--color-sunset-green-700)',
              }}
            >
              {tHero('eyebrow')}
            </p>
            {/* Audience tag-pill — on-light variant (handover §4.1) */}
            <span
              className="inline-flex items-center font-heading font-semibold uppercase mb-5"
              style={{
                fontSize: '11px',
                letterSpacing: '0.08em',
                height: '22px',
                padding: '0 8px',
                borderRadius: '11px',
                background: 'var(--color-bg-cream)',
                border: '1px solid var(--color-border-strong)',
                color: 'var(--color-sunset-green-700)',
              }}
            >
              {tTag(project.audience)}
            </span>
            <h1
              id="project-hero-h1"
              className="m-0 font-heading font-bold"
              style={{
                fontSize: 'var(--text-h1)',
                lineHeight: 'var(--leading-tight)',
                letterSpacing: 'var(--tracking-snug)',
                textWrap: 'balance',
                maxWidth: '18ch',
              }}
            >
              {project.title[locale]}
            </h1>
            <p
              className="m-0 mt-6 max-w-[56ch]"
              style={{
                fontSize: 'var(--text-body-lg)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
              }}
            >
              {project.shortDek[locale]}
            </p>
            <p
              className="m-0 mt-6"
              style={{
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-text-muted)',
                fontWeight: 500,
              }}
            >
              {tHero('metaTemplate', {
                city: cityName,
                year: project.year,
                durationWeeks: project.durationWeeks,
              })}
            </p>
          </div>
          <div className="lg:col-span-5">
            <div
              className="relative w-full overflow-hidden rounded-2xl"
              style={{aspectRatio: '4 / 3', background: 'var(--color-sunset-green-700)'}}
            >
              <Image
                src={photo}
                alt={project.leadAlt[locale]}
                fill
                priority
                fetchPriority="high"
                placeholder="blur"
                sizes="(max-width: 1023px) 100vw, 480px"
                style={{objectFit: 'cover'}}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
