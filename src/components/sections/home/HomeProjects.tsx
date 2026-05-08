import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import AnimateIn from '@/components/global/motion/AnimateIn';
import StaggerContainer from '@/components/global/motion/StaggerContainer';
import StaggerItem from '@/components/global/motion/StaggerItem';
import ProjectCard from '@/components/ui/ProjectCard';
import projectOneSrc from '@/assets/home/project-1-naperville-patio.jpg';
import projectTwoSrc from '@/assets/home/project-2-wheaton-lawn.jpg';
import projectThreeSrc from '@/assets/home/project-3-aurora-hoa.jpg';
import projectFourSrc from '@/assets/home/project-4-glen-ellyn-fire.jpg';
import projectFiveSrc from '@/assets/home/project-5-lisle-wall.jpg';
import projectSixSrc from '@/assets/home/project-6-warrenville-garden.jpg';
import type {StaticImageData} from 'next/image';

type ProjectTag = 'hardscape' | 'residential' | 'commercial';

type Project = {
  /** i18n key used for tile title + alt. Phase 1.07 era. */
  key: string;
  tag: ProjectTag;
  /**
   * Detail-page slug from `src/data/projects.ts`. Phase 1.16 remapped these
   * from earlier placeholder slugs (`naperville-patio`, etc.) to the real
   * 12-row seed; the home tile titles still use the original placeholder
   * names for now — Erick polishes copy in Part 2.
   */
  slug: string;
  photo: StaticImageData;
};

const PROJECTS: Project[] = [
  {key: 'napervillePatio', tag: 'hardscape', slug: 'naperville-hilltop-terrace', photo: projectOneSrc},
  {key: 'wheatonLawn', tag: 'residential', slug: 'wheaton-lawn-reset', photo: projectTwoSrc},
  {key: 'auroraHoa', tag: 'commercial', slug: 'aurora-hoa-curb-refresh', photo: projectThreeSrc},
  {key: 'glenEllynFire', tag: 'hardscape', slug: 'naperville-fire-court', photo: projectFourSrc},
  {key: 'lisleWall', tag: 'hardscape', slug: 'lisle-retaining-wall', photo: projectFiveSrc},
  {key: 'warrenvilleGarden', tag: 'residential', slug: 'batavia-garden-reset', photo: projectSixSrc},
];

export default async function HomeProjects() {
  const t = await getTranslations('home.projects');

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
          {PROJECTS.map((p) => (
            <StaggerItem key={p.key}>
              <ProjectCard
                href={`/projects/${p.slug}/`}
                photo={p.photo}
                alt={t(`alt.${p.key}`)}
                title={t(`tile.${p.key}`)}
                audienceLabel={t(`tag.${p.tag}`)}
              />
            </StaggerItem>
          ))}
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
