import {getTranslations} from 'next-intl/server';
import AnimateIn from '@/components/global/motion/AnimateIn';
import type {LocationCity} from '@/data/locations';

type LocalTrustBandProps = {
  location: LocationCity;
  locale: 'en' | 'es';
};

/**
 * LocalTrustBand — Phase 1.14 §4.2.
 *
 * 3 stat cells per D9.A: years serving, projects completed, response time.
 * Static text — no icons, no hydration. Vertical dividers between cells on
 * desktop. Surface: `--color-bg-cream`.
 */
export default async function LocalTrustBand({location, locale}: LocalTrustBandProps) {
  const t = await getTranslations('location.trust');
  const responseLabel =
    location.trust.responseTimeDays === 1
      ? locale === 'es'
        ? '1 día'
        : '1 day'
      : locale === 'es'
        ? `${location.trust.responseTimeDays} días`
        : `${location.trust.responseTimeDays} days`;

  return (
    <section
      aria-label="Local trust signals"
      className="bg-[var(--color-bg-cream)] py-14 lg:py-20"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up" className="block">
          <div
            className="border-y"
            style={{borderColor: 'var(--color-border, #E5E0D5)'}}
          >
            <ul
              className="m-0 p-0 list-none grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x"
              style={{borderColor: 'var(--color-border, #E5E0D5)'}}
            >
              <li className="py-10 lg:py-12 lg:pr-12">
                <p
                  className="m-0 font-heading"
                  style={{
                    fontSize: 'var(--text-h2)',
                    fontWeight: 800,
                    color: 'var(--color-sunset-green-700)',
                    letterSpacing: 'var(--tracking-tight)',
                    lineHeight: 1,
                  }}
                >
                  {location.trust.yearsServing}+
                </p>
                <p
                  className="m-0 mt-3"
                  style={{
                    fontSize: 'var(--text-body-sm)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {t('yearsLabel', {city: location.name})}
                </p>
              </li>
              <li className="py-10 lg:py-12 lg:px-12">
                <p
                  className="m-0 font-heading"
                  style={{
                    fontSize: 'var(--text-h2)',
                    fontWeight: 800,
                    color: 'var(--color-sunset-green-700)',
                    letterSpacing: 'var(--tracking-tight)',
                    lineHeight: 1,
                  }}
                >
                  {location.trust.projectsCompleted}+
                </p>
                <p
                  className="m-0 mt-3"
                  style={{
                    fontSize: 'var(--text-body-sm)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {t('projectsLabel', {city: location.name})}
                </p>
              </li>
              <li className="py-10 lg:py-12 lg:pl-12">
                <p
                  className="m-0 font-heading"
                  style={{
                    fontSize: 'var(--text-h2)',
                    fontWeight: 800,
                    color: 'var(--color-sunset-green-700)',
                    letterSpacing: 'var(--tracking-tight)',
                    lineHeight: 1,
                  }}
                >
                  {responseLabel}
                </p>
                <p
                  className="m-0 mt-3"
                  style={{
                    fontSize: 'var(--text-body-sm)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {t('responseLabel')}
                </p>
              </li>
            </ul>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
