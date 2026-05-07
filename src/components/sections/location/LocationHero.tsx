import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import Breadcrumb from '@/components/ui/Breadcrumb';
import {BUSINESS_PHONE_TEL} from '@/lib/constants/business';
import type {LocationCity} from '@/data/locations';
import {LOCATION_HERO} from '@/data/imageMap';

type LocationHeroProps = {
  location: LocationCity;
  locale: 'en' | 'es';
};

/**
 * LocationHero — Phase 1.14 §4.1.
 *
 * Compact split (D5.B): copy 60% / photo 40% on desktop, photo above copy
 * on mobile. NO entrance animation (LCP discipline). The hero photo is the
 * LCP candidate; explicit width/height + `priority` + `fetchPriority="high"`.
 *
 * Microbar of 3 chips (years, projects, response time) sits above the
 * primary CTA. No body amber here — amber is reserved for the bottom CTA
 * section (D11).
 */
export default async function LocationHero({location, locale}: LocationHeroProps) {
  const t = await getTranslations('location');
  const tMicrobar = await getTranslations('location.microbar');
  const photo = LOCATION_HERO[location.slug];
  const heroAlt = locale === 'es'
    ? `Una propiedad de Sunset Services en ${location.name}, ${location.state}.`
    : `A Sunset Services property in ${location.name}, ${location.state}.`;

  return (
    <section
      aria-labelledby="loc-hero-h1"
      className="bg-[var(--color-bg)] py-10 lg:py-16"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 lg:gap-12 items-center">
          {/* Mobile shows photo first, desktop shows copy first via order */}
          <div className="order-2 lg:order-1">
            <Breadcrumb
              items={[
                {name: t('breadcrumbHome'), href: '/'},
                {name: t('breadcrumbServiceAreas'), href: '/service-areas/'},
                {name: location.name},
              ]}
              className="mb-5"
            />
            <p
              className="font-heading font-semibold uppercase m-0 mb-4"
              style={{
                fontSize: '12px',
                letterSpacing: 'var(--tracking-eyebrow)',
                color: 'var(--color-sunset-green-700)',
              }}
            >
              {location.name.toUpperCase()}, {location.state}
            </p>
            <h1
              id="loc-hero-h1"
              className="m-0 font-heading"
              style={{
                fontSize: 'var(--text-h1)',
                fontWeight: 700,
                lineHeight: 'var(--leading-tight)',
                letterSpacing: 'var(--tracking-tight)',
                color: 'var(--color-text-primary)',
                textWrap: 'balance',
              }}
            >
              {location.hero.h1[locale]}
            </h1>
            <p
              className="m-0 mt-5"
              style={{
                fontSize: 'var(--text-body-lg)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                maxWidth: '52ch',
              }}
            >
              {location.hero.sub[locale]}
            </p>

            <ul
              className="m-0 mt-6 p-0 list-none flex flex-wrap gap-2 lg:gap-3"
              aria-label="Local trust signals"
            >
              <li
                className="inline-flex items-center"
                style={{
                  background: 'var(--color-bg-cream)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 14px',
                  fontSize: 'var(--text-body-sm)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {tMicrobar('years', {
                  years: String(location.trust.yearsServing),
                  city: location.name,
                })}
              </li>
              <li
                className="inline-flex items-center"
                style={{
                  background: 'var(--color-bg-cream)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 14px',
                  fontSize: 'var(--text-body-sm)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {tMicrobar('projects', {
                  count: String(location.trust.projectsCompleted),
                })}
              </li>
              <li
                className="inline-flex items-center"
                style={{
                  background: 'var(--color-bg-cream)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 14px',
                  fontSize: 'var(--text-body-sm)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {tMicrobar('response', {
                  days: String(location.trust.responseTimeDays),
                })}
              </li>
            </ul>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
              <Link
                href="/request-quote/"
                className="btn btn-primary btn-lg"
                style={{minWidth: '240px'}}
              >
                {t('heroCta')}
              </Link>
              <a
                href={`tel:${BUSINESS_PHONE_TEL}`}
                className="link link-inline"
                style={{
                  fontSize: 'var(--text-body-sm)',
                  color: 'var(--color-sunset-green-700)',
                  fontWeight: 500,
                }}
              >
                {t('heroPhonePrefix')} {t('heroPhoneNumber')}
              </a>
            </div>
          </div>
          <div className="order-1 lg:order-2 relative w-full" style={{aspectRatio: '4 / 3'}}>
            <div
              className="relative w-full h-full overflow-hidden"
              style={{
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-on-cream, var(--shadow-soft))',
              }}
            >
              {photo ? (
                <Image
                  src={photo}
                  alt={heroAlt}
                  fill
                  priority
                  fetchPriority="high"
                  placeholder="blur"
                  sizes="(max-width: 1023px) 100vw, 40vw"
                  style={{objectFit: 'cover'}}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
