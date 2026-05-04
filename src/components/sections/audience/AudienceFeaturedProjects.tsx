import Image from 'next/image';
import {Link} from '@/i18n/navigation';
import {ArrowRight} from 'lucide-react';
import AnimateIn from '@/components/global/motion/AnimateIn';
import StaggerContainer from '@/components/global/motion/StaggerContainer';
import StaggerItem from '@/components/global/motion/StaggerItem';
import type {Audience} from '@/data/services';

type Locale = 'en' | 'es';

type ProjectTile = {
  key: string;
  title: string;
  meta: string;
  photoSrc: string;
};

type AudienceFeaturedProjectsProps = {
  audience: Audience;
  locale: Locale;
  eyebrow: string;
  h2: string;
  viewAll: string;
  tag: string;
  tiles: ProjectTile[];
};

/**
 * Audience-landing featured projects — Phase 1.08 §3.4. Reuses the
 * homepage projects-teaser 4:3 photo card pattern. 3 tiles desktop,
 * 1-col mobile. Top-right "View all" CTA-link mirrors handover layout.
 */
export default function AudienceFeaturedProjects({
  audience,
  eyebrow,
  h2,
  viewAll,
  tag,
  tiles,
}: AudienceFeaturedProjectsProps) {
  return (
    <section
      aria-labelledby="audience-featured-projects-h2"
      className="bg-[var(--color-bg)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_900px]"
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
              <h2 id="audience-featured-projects-h2" className="m-0">
                {h2}
              </h2>
            </div>
            <Link
              href={`/projects/?audience=${audience}`}
              className="link link-cta self-start lg:self-end"
              style={{color: 'var(--color-sunset-green-700)'}}
            >
              {viewAll}
              <ArrowRight aria-hidden="true" strokeWidth={1.75} style={{width: 18, height: 18}} />
            </Link>
          </div>
        </AnimateIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {tiles.map((p) => (
            <StaggerItem key={p.key}>
              <Link
                href={`/projects/${p.key}/`}
                className="card card-photo block relative h-full"
                style={{background: 'var(--color-sunset-green-700)'}}
              >
                <div className="relative w-full" style={{aspectRatio: '4 / 3'}}>
                  <Image
                    src={p.photoSrc}
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
                    {tag}
                  </span>
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
                      {p.title}
                    </h3>
                    <p
                      className="m-0 mt-1"
                      style={{
                        fontSize: 'var(--text-body-sm)',
                        color: 'var(--color-text-on-dark)',
                        opacity: 0.8,
                      }}
                    >
                      {p.meta}
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
