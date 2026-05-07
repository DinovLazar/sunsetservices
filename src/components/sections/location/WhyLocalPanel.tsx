import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import AnimateIn from '@/components/global/motion/AnimateIn';
import type {LocationCity} from '@/data/locations';
import {LOCATION_PORTRAIT} from '@/data/imageMap';

type WhyLocalPanelProps = {
  location: LocationCity;
  locale: 'en' | 'es';
};

/**
 * WhyLocalPanel — Phase 1.14 §4.6.
 *
 * Two-column desktop / stacked mobile. Portrait left (4:5, lazy), per-city
 * trust prose right (~120 words). The portrait is shared across all 6
 * cities (D9 photo budget); the prose body is per-city from
 * `location.whyLocal[locale]`.
 *
 * Surface: `--color-bg-cream`.
 */
export default async function WhyLocalPanel({location, locale}: WhyLocalPanelProps) {
  const t = await getTranslations('location.whyLocal');
  // Split prose into paragraphs at double newlines (or one paragraph if a
  // single block of prose; current seed ships single block per city).
  const paragraphs = location.whyLocal[locale].split(/\n{2,}/);

  return (
    <section
      aria-labelledby="loc-why-local-h2"
      className="bg-[var(--color-bg-cream)] py-14 lg:py-20"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up" className="block">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8 lg:gap-12 items-start">
            <div
              className="relative w-full overflow-hidden"
              style={{
                aspectRatio: '4 / 5',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-on-cream, var(--shadow-soft))',
                maxWidth: 360,
              }}
            >
              <Image
                src={LOCATION_PORTRAIT}
                alt={t('portraitAlt')}
                fill
                loading="lazy"
                placeholder="blur"
                sizes="(max-width: 1023px) 100vw, 40vw"
                style={{objectFit: 'cover'}}
              />
            </div>
            <div>
              <h2
                id="loc-why-local-h2"
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
              {paragraphs.map((para, idx) => (
                <p
                  key={idx}
                  className="m-0 mt-5"
                  style={{
                    fontSize: 'var(--text-body-lg)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 'var(--leading-relaxed)',
                    maxWidth: '60ch',
                  }}
                >
                  {para}
                </p>
              ))}
              <Link
                href="/about/"
                className="link link-inline inline-flex items-center mt-6 font-semibold"
                style={{
                  fontSize: 'var(--text-body)',
                  color: 'var(--color-sunset-green-700)',
                }}
              >
                {t('aboutLink')} →
              </Link>
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
