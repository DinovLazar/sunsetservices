import Image from 'next/image';
import type {StaticImageData} from 'next/image';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import AnimateIn from '@/components/global/motion/AnimateIn';
import StaggerContainer from '@/components/global/motion/StaggerContainer';
import StaggerItem from '@/components/global/motion/StaggerItem';
import projectOneSrc from '@/assets/home/project-1-naperville-patio.jpg';
import projectTwoSrc from '@/assets/home/project-2-wheaton-lawn.jpg';
import projectThreeSrc from '@/assets/home/project-3-aurora-hoa.jpg';
import projectFourSrc from '@/assets/home/project-4-glen-ellyn-fire.jpg';
import projectFiveSrc from '@/assets/home/project-5-lisle-wall.jpg';
import projectSixSrc from '@/assets/home/project-6-warrenville-garden.jpg';

type ProjectTag = 'hardscape' | 'residential' | 'commercial';

type Project = {
  key: string;
  tag: ProjectTag;
  href: string;
  photo: StaticImageData;
};

const PROJECTS: Project[] = [
  {key: 'napervillePatio', tag: 'hardscape', href: '/projects/naperville-patio/', photo: projectOneSrc},
  {key: 'wheatonLawn', tag: 'residential', href: '/projects/wheaton-lawn/', photo: projectTwoSrc},
  {key: 'auroraHoa', tag: 'commercial', href: '/projects/aurora-hoa/', photo: projectThreeSrc},
  {key: 'glenEllynFire', tag: 'hardscape', href: '/projects/glen-ellyn-fire/', photo: projectFourSrc},
  {key: 'lisleWall', tag: 'hardscape', href: '/projects/lisle-wall/', photo: projectFiveSrc},
  {key: 'warrenvilleGarden', tag: 'residential', href: '/projects/warrenville-garden/', photo: projectSixSrc},
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
              <Link
                href={p.href}
                className="card card-photo block relative h-full"
              >
                <div className="relative w-full" style={{aspectRatio: '4 / 3'}}>
                  <Image
                    src={p.photo}
                    alt={t(`alt.${p.key}`)}
                    fill
                    placeholder="blur"
                    loading="lazy"
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                    style={{objectFit: 'cover'}}
                  />
                  {/* Bottom-up dark gradient so the title and tag clear AA. */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(26,26,26,0.50) 100%)',
                    }}
                  />
                  {/* Tag pill upper-left */}
                  <span
                    className="absolute top-4 left-4 inline-flex items-center font-heading font-semibold uppercase"
                    style={{
                      fontSize: '11px',
                      letterSpacing: '0.08em',
                      height: '22px',
                      padding: '0 8px',
                      borderRadius: '11px',
                      background: 'rgba(250,247,241,0.16)',
                      border: '1px solid rgba(250,247,241,0.32)',
                      color: 'var(--color-text-on-dark)',
                    }}
                  >
                    {t(`tag.${p.tag}`)}
                  </span>
                  {/* Title lower-left */}
                  <h3
                    className="absolute bottom-4 left-4 right-4 m-0 font-heading"
                    style={{
                      fontSize: 'var(--text-h5)',
                      fontWeight: 600,
                      color: 'var(--color-text-on-dark)',
                      letterSpacing: 'var(--tracking-snug)',
                      lineHeight: 'var(--leading-snug)',
                    }}
                  >
                    {t(`tile.${p.key}`)}
                  </h3>
                </div>
              </Link>
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
