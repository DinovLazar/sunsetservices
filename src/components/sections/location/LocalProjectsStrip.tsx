import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import AnimateIn from '@/components/global/motion/AnimateIn';
import type {LocationCity} from '@/data/locations';
import {LOCATION_PROJECT_TILES} from '@/data/imageMap';

type LocalProjectsStripProps = {
  location: LocationCity;
};

/**
 * LocalProjectsStrip — Phase 1.14 §4.4.
 *
 * Three placeholder project tiles with city captions matching the page
 * city. Phase 1.16 swaps to real projects with the D7.A fallback rule:
 *
 * D7.A (Phase 1.13): When real projects wire up in Phase 1.16, prefer real
 * projects from the page's city. If the city has zero in-portfolio
 * projects, fall back to the closest 3 from neighbor cities — but caption
 * each tile with the ACTUAL project city, not the page city. Faking the
 * city is a trust-kill. See Phase 1.13 handover §4.4 + D7.
 *
 * Surface: `--color-bg-cream`.
 */
export default async function LocalProjectsStrip({
  location,
}: LocalProjectsStripProps) {
  const t = await getTranslations('location.projects');
  const tiles = LOCATION_PROJECT_TILES[location.slug] ?? [];
  const placeholderCaption = t('placeholderCaption', {city: location.name});

  return (
    <section
      aria-labelledby="loc-projects-h2"
      className="bg-[var(--color-bg-cream)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_700px]"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up" className="block">
          <div className="mb-8 lg:mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <h2
              id="loc-projects-h2"
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
            <Link
              href="/projects/"
              className="link link-inline self-start sm:self-end"
              style={{
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-sunset-green-700)',
                fontWeight: 600,
              }}
            >
              {t('allLink')} →
            </Link>
          </div>
          <ul className="m-0 p-0 list-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {[0, 1, 2].map((idx) => {
              const photo = tiles[idx];
              return (
                <li key={idx}>
                  <div
                    className="card card-photo block relative h-full"
                    style={{background: 'var(--color-sunset-green-700)'}}
                  >
                    <div className="relative w-full" style={{aspectRatio: '4 / 3'}}>
                      {photo ? (
                        <Image
                          src={photo}
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
                        <p
                          className="m-0 font-heading"
                          style={{
                            fontSize: 'var(--text-body)',
                            fontWeight: 600,
                            color: 'var(--color-text-on-dark)',
                            lineHeight: 'var(--leading-snug)',
                          }}
                        >
                          {placeholderCaption}
                        </p>
                        <p
                          className="m-0 mt-1"
                          style={{
                            fontSize: 'var(--text-body-sm)',
                            color: 'var(--color-text-on-dark)',
                            opacity: 0.85,
                          }}
                        >
                          {location.name}, {location.state}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </AnimateIn>
      </div>
    </section>
  );
}
