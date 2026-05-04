import Image from 'next/image';
import {Link} from '@/i18n/navigation';
import {ArrowRight} from 'lucide-react';
import AnimateIn from '@/components/global/motion/AnimateIn';
import StaggerContainer from '@/components/global/motion/StaggerContainer';
import StaggerItem from '@/components/global/motion/StaggerItem';

type ProjectTile = {
  key: string;
  title: string;
  meta: string;
  photoSrc: string;
};

type ServiceFeaturedProjectsProps = {
  serviceSlug: string;
  eyebrow: string;
  h2: string;
  viewAll: string;
  tiles: ProjectTile[];
};

/**
 * Service-detail featured projects — Phase 1.08 §4.6. 2–3 tiles desktop,
 * 1-col mobile. Title + meta lower-left in cream-on-dark; no tag pill
 * (the service is implicit from page context).
 */
export default function ServiceFeaturedProjects({
  serviceSlug,
  eyebrow,
  h2,
  viewAll,
  tiles,
}: ServiceFeaturedProjectsProps) {
  const cols = tiles.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3';
  return (
    <section
      aria-labelledby="service-projects-h2"
      className="bg-[var(--color-bg)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_700px]"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up" className="mb-10 lg:mb-14">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <p
                className="font-heading font-semibold uppercase m-0 mb-3"
                style={{
                  fontSize: '13px',
                  letterSpacing: 'var(--tracking-eyebrow)',
                  color: 'var(--audience-accent)',
                }}
              >
                {eyebrow}
              </p>
              <h2 id="service-projects-h2" className="m-0">
                {h2}
              </h2>
            </div>
            <Link
              href={`/projects/?service=${serviceSlug}`}
              className="link link-cta self-start lg:self-end"
              style={{color: 'var(--color-sunset-green-700)'}}
            >
              {viewAll}
              <ArrowRight aria-hidden="true" strokeWidth={1.75} style={{width: 18, height: 18}} />
            </Link>
          </div>
        </AnimateIn>

        <StaggerContainer className={`grid grid-cols-1 md:grid-cols-2 ${cols} gap-4 lg:gap-6`}>
          {tiles.map((t) => (
            <StaggerItem key={t.key}>
              <Link
                href={`/projects/${t.key}/`}
                className="card card-photo block relative h-full"
                style={{background: 'var(--color-sunset-green-700)'}}
              >
                <div className="relative w-full" style={{aspectRatio: '4 / 3'}}>
                  <Image
                    src={t.photoSrc}
                    alt=""
                    fill
                    loading="lazy"
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                    style={{objectFit: 'cover'}}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.65) 100%)',
                    }}
                  />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3
                      className="m-0 font-heading"
                      style={{
                        fontSize: 'var(--text-h5)',
                        fontWeight: 700,
                        color: 'var(--color-text-on-dark)',
                        letterSpacing: 'var(--tracking-snug)',
                        lineHeight: 'var(--leading-snug)',
                      }}
                    >
                      {t.title}
                    </h3>
                    <p
                      className="m-0 mt-1"
                      style={{
                        fontSize: 'var(--text-body-sm)',
                        color: 'var(--color-text-on-dark)',
                        opacity: 0.8,
                      }}
                    >
                      {t.meta}
                    </p>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
