import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import Breadcrumb from '@/components/ui/Breadcrumb';
import ServiceAreaMap from './ServiceAreaMap';
import {BUSINESS_PHONE_TEL} from '@/lib/constants/business';

/**
 * ServiceAreasHero — Phase 1.14 §3.1.
 *
 * Split layout: copy 60% (left) + static SVG map 40% (right) on desktop,
 * stacked on mobile. NO entrance animation (LCP discipline, 1.07 lock).
 * The hero copy is the LCP candidate — H1 paint, no hero photo.
 */
export default async function ServiceAreasHero() {
  const t = await getTranslations('serviceAreas');

  return (
    <section
      aria-labelledby="sa-hero-h1"
      className="bg-[var(--color-bg)] py-14 lg:py-20"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_3fr] gap-8 lg:gap-12 items-center">
          <div>
            <Breadcrumb
              items={[
                {name: t('breadcrumbHome'), href: '/'},
                {name: t('breadcrumbSelf')},
              ]}
              className="mb-6"
            />
            <p
              className="font-heading font-semibold uppercase m-0 mb-4"
              style={{
                fontSize: '12px',
                letterSpacing: 'var(--tracking-eyebrow)',
                color: 'var(--color-sunset-green-700)',
              }}
            >
              {t('eyebrow')}
            </p>
            <h1
              id="sa-hero-h1"
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
              {t('h1')}
            </h1>
            <p
              className="m-0 mt-6"
              style={{
                fontSize: 'var(--text-body-lg)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                maxWidth: '52ch',
              }}
            >
              {t('sub')}
            </p>
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
          <div
            className="relative w-full"
            style={{
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-bg-cream)',
              padding: 'var(--spacing-4)',
            }}
          >
            <ServiceAreaMap />
          </div>
        </div>
      </div>
    </section>
  );
}
