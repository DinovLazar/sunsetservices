import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {ArrowUpRight} from 'lucide-react';
import AnimateIn from '@/components/global/motion/AnimateIn';
import {getService} from '@/data/services';
import type {LocationCity} from '@/data/locations';
import {SERVICE_TILE} from '@/data/imageMap';

type LocationServicesGridProps = {
  location: LocationCity;
  locale: 'en' | 'es';
};

/**
 * LocationServicesGrid — Phase 1.14 §4.3.
 *
 * Renders exactly 6 service cards per city, mapped from
 * `location.featuredServices`. Each entry pairs a service slug with its
 * audience (so duplicates like residential + commercial `snow-removal`
 * resolve correctly). Each card links to its canonical service page at
 * `/<audience>/<slug>/` (NOT a city-specific service URL).
 *
 * Section-level `<AnimateIn>` only — no per-card animation (1.07 lesson).
 *
 * Surface: `--color-bg`.
 */
export default async function LocationServicesGrid({
  location,
  locale,
}: LocationServicesGridProps) {
  const t = await getTranslations('location.services');

  // Build the resolved service array up front. If any slug fails to
  // resolve we throw at module-eval time so the seed table can never ship
  // a broken card.
  const items = location.featuredServices.map((entry) => {
    const svc = getService(entry.slug, entry.audience);
    if (!svc) {
      throw new Error(
        `LocationServicesGrid: featuredService not found — slug="${entry.slug}", audience="${entry.audience}", location="${location.slug}". Update locations.ts or services.ts.`,
      );
    }
    const tileKey = svc.imageKey ?? svc.slug;
    return {
      slug: svc.slug,
      audience: entry.audience,
      name: svc.name[locale],
      photo: SERVICE_TILE[tileKey],
    };
  });

  return (
    <section
      aria-labelledby="loc-services-h2"
      className="bg-[var(--color-bg)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_1100px]"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up" className="block">
          <div className="mb-8 lg:mb-12 max-w-[60ch]">
            <h2
              id="loc-services-h2"
              className="m-0 font-heading"
              style={{
                fontSize: 'var(--text-h2)',
                fontWeight: 700,
                lineHeight: 'var(--leading-tight)',
                letterSpacing: 'var(--tracking-snug)',
                color: 'var(--color-text-primary)',
                textWrap: 'balance',
              }}
            >
              {t('h2', {city: location.name})}
            </h2>
            <p
              className="m-0 mt-4"
              style={{
                fontSize: 'var(--text-body-lg)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
              }}
            >
              {t('sub', {city: location.name})}
            </p>
          </div>
          <ul className="m-0 p-0 list-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {items.map((s) => (
              <li key={`${s.audience}-${s.slug}`}>
                <Link
                  href={`/${s.audience}/${s.slug}/`}
                  className="card card-photo block relative h-full"
                  style={{background: 'var(--color-sunset-green-700)'}}
                >
                  <div className="relative w-full" style={{aspectRatio: '4 / 3'}}>
                    {s.photo ? (
                      <Image
                        src={s.photo}
                        alt=""
                        fill
                        loading="lazy"
                        sizes="(max-width: 1023px) 50vw, 33vw"
                        placeholder="blur"
                        style={{objectFit: 'cover'}}
                      />
                    ) : null}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)',
                      }}
                    />
                    <div className="absolute inset-0 flex flex-col justify-end p-4 lg:p-6">
                      <div className="flex items-end justify-between gap-3">
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
                          {s.name}
                        </h3>
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
              </li>
            ))}
          </ul>
        </AnimateIn>
      </div>
    </section>
  );
}
