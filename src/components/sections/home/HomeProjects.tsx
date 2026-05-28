import {getLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import AnimateIn from '@/components/global/motion/AnimateIn';
import StaggerContainer from '@/components/global/motion/StaggerContainer';
import StaggerItem from '@/components/global/motion/StaggerItem';
import ProjectCard from '@/components/ui/ProjectCard';
import {getProjectDivision} from '@/lib/projects/getProjectDivision';
import {stripStreetNumber} from '@/lib/projects/stripStreetNumber';
import {SERVICES} from '@/data/services';
import {PROJECT_LEAD} from '@/data/imageMap';
import {getAllProjects} from '@sanity-lib/queries';
import {sanityProjectSummaryToTs} from '@/lib/sanity-adapters';

type Locale = 'en' | 'es';

/**
 * Tile cap for the homepage / About "Recent work" teaser. Six matches
 * the original Phase 1.07 placeholder grid (3×2 desktop) but the band
 * renders only as many tiles as there are *real* Sanity projects — if
 * Sanity has 3, the band renders 3. Never pads with fabricated projects
 * (Phase M.10e Fix 3).
 */
const MAX_TILES = 6;

/**
 * HomeProjects — homepage projects band + About-page "Recent work" teaser
 * (About reuses this component verbatim per Phase 1.12 §3.6).
 *
 * Phase M.10e Fix 3 — was driving the tiles off a hard-coded list of 6
 * slugs hand-mapped to the Phase 1.16 / 12-row seed
 * (`naperville-hilltop-terrace`, `wheaton-lawn-reset`, etc.). When Phase
 * M.01c / M.10d retired those seed rows in favor of the real Sanity
 * portfolio, every tile started linking to a slug that 404'd. The data
 * source moves to Sanity here (mirroring the `/projects` index route in
 * `src/app/[locale]/projects/page.tsx`): `getAllProjects()` returns the
 * portfolio already ordered `year desc, slug asc`; we map through the
 * `sanityProjectSummaryToTs` adapter and take the first MAX_TILES. Every
 * card therefore points at a live `/projects/<slug>/` page — no
 * fabrication, no broken links. If Sanity ever has fewer than MAX_TILES
 * projects, the band shrinks rather than padding.
 *
 * Division badge uses `getProjectDivision()` (Phase M.10c) so labels
 * agree with the `/projects` index. Title passes through
 * `stripStreetNumber()` for the same reason — the index strips, so the
 * teaser strips too. Lead photo prefers the Sanity CDN URL
 * (`leadImageUrl`), falling back to the `imageMap.ts` placeholder if
 * Sanity has no asset yet (no current project hits that fallback).
 *
 * The section is intentionally hidden when no real projects exist (a
 * defensive case — the live portfolio has 10 today) so the band never
 * renders an empty grid.
 */
export default async function HomeProjects() {
  const t = await getTranslations('home.projects');
  const tDivisions = await getTranslations('home.divisions');
  const locale = (await getLocale()) as Locale;

  const sanityProjects = await getAllProjects();
  // Drop any project that has neither a Sanity CDN lead image nor a
  // PROJECT_LEAD placeholder fallback — better to omit the tile than to
  // render an empty 4:3 box. Today every Sanity project has a leadImage
  // asset so this filter is defensive.
  const projects = sanityProjects
    .map(sanityProjectSummaryToTs)
    .filter((p) => Boolean(p.leadImageUrl ?? PROJECT_LEAD[p.slug]))
    .slice(0, MAX_TILES);

  if (projects.length === 0) return null;

  return (
    <section
      aria-labelledby="home-projects-h2"
      className="bg-[var(--color-bg)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_1100px]"
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
          <h2 id="home-projects-h2" className="m-0">
            {t('h2')}
          </h2>
        </AnimateIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => {
            const division = getProjectDivision(p, SERVICES);
            // Filter above guarantees one of these is defined.
            const photo = (p.leadImageUrl ?? PROJECT_LEAD[p.slug])!;
            return (
              <StaggerItem key={p.slug}>
                <ProjectCard
                  href={`/projects/${p.slug}/`}
                  photo={photo}
                  alt={p.leadAlt[locale]}
                  title={stripStreetNumber(p.title[locale])}
                  audienceLabel={tDivisions(`${division}.tag`)}
                />
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        <AnimateIn variant="fade-up" className="mt-10 lg:mt-14 flex justify-center">
          <Link href="/projects/" className="btn btn-secondary btn-md">
            {t('cta')} →
          </Link>
        </AnimateIn>
      </div>
    </section>
  );
}
