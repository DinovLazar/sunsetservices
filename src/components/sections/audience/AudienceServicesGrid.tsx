import Image from 'next/image';
import {Link} from '@/i18n/navigation';
import {ArrowUpRight} from 'lucide-react';
import AnimateIn from '@/components/global/motion/AnimateIn';
import StaggerContainer from '@/components/global/motion/StaggerContainer';
import StaggerItem from '@/components/global/motion/StaggerItem';
import type {Service, Audience} from '@/data/services';

type Locale = 'en' | 'es';

type AudienceServicesGridProps = {
  audience: Audience;
  locale: Locale;
  eyebrow: string;
  h2: string;
  sub: string;
  services: Service[];
  /** Map from service slug → tile photo (loaded by the route). */
  tilePhotos: Record<string, {src: string; blurDataURL?: string; width: number; height: number}>;
};

/**
 * Audience services grid — Phase 1.08 §3.3 D2 (4:3 photo card with
 * gradient overlay). 6 tiles for residential + hardscape, 4 for
 * commercial. Cream surface; whole tile is the link target.
 */
export default function AudienceServicesGrid({
  audience,
  locale,
  eyebrow,
  h2,
  sub,
  services,
  tilePhotos,
}: AudienceServicesGridProps) {
  const isCommercial = audience === 'commercial';
  return (
    <section
      aria-labelledby="audience-services-grid-h2"
      className="bg-[var(--color-bg-cream)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_1400px]"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up" className="mb-10 lg:mb-14 max-w-[64ch]">
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
          <h2 id="audience-services-grid-h2" className="m-0 mb-3">
            {h2}
          </h2>
          <p
            className="m-0"
            style={{
              fontSize: 'var(--text-body-lg)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {sub}
          </p>
        </AnimateIn>

        <StaggerContainer
          className={`grid grid-cols-2 ${isCommercial ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-4 lg:gap-8`}
        >
          {services.map((s) => {
            const photo = tilePhotos[s.slug];
            return (
              <StaggerItem key={s.slug}>
                <Link
                  href={`/${audience}/${s.slug}/`}
                  className="card card-photo block relative h-full"
                  style={{background: 'var(--color-sunset-green-700)'}}
                >
                  <div className="relative w-full" style={{aspectRatio: '4 / 3'}}>
                    {photo ? (
                      <Image
                        src={photo.src}
                        alt=""
                        fill
                        loading="lazy"
                        sizes={isCommercial ? '(max-width: 1023px) 50vw, 50vw' : '(max-width: 1023px) 50vw, 33vw'}
                        style={{objectFit: 'cover'}}
                      />
                    ) : null}
                    {/* Bottom-up dark gradient overlay (handover §3.3). */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)',
                      }}
                    />
                    {/* Title + arrow chip lower-left / lower-right */}
                    <div className="absolute inset-0 flex flex-col justify-end p-4 lg:p-6">
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <h3
                            className="m-0 font-heading"
                            style={{
                              fontSize: 'var(--text-h4)',
                              fontWeight: 700,
                              color: 'var(--color-text-on-dark)',
                              letterSpacing: 'var(--tracking-snug)',
                              lineHeight: 'var(--leading-snug)',
                            }}
                          >
                            {s.name[locale]}
                          </h3>
                        </div>
                        <span
                          aria-hidden="true"
                          className="hidden sm:inline-flex shrink-0 items-center justify-center"
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 9999,
                            background: 'rgba(255,255,255,0.12)',
                          }}
                        >
                          <ArrowUpRight
                            strokeWidth={1.75}
                            style={{
                              width: 18,
                              height: 18,
                              color: 'var(--color-text-on-dark)',
                            }}
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
