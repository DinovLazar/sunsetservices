import {getTranslations} from 'next-intl/server';
import AnimateIn from '@/components/global/motion/AnimateIn';
import LocationCard from '@/components/ui/LocationCard';
import {LOCATIONS} from '@/data/locations';
import {LOCATION_CARD} from '@/data/imageMap';

/**
 * Phase M.01e — show all 22 surfaced cities (24 total minus the 2 retired:
 * Lisle + Bolingbrook). The retired cities are surfaced as a static prose
 * note below the grid (see OutsideAreaBand → `serviceAreas.extendedArea.*`).
 */
const RETIRED_CITY_SLUGS = new Set(['lisle', 'bolingbrook']);

/**
 * CitiesGrid — Phase 1.14 §3.3.
 *
 * 3×2 desktop / 2-col @ tablet / 1-col @ <480px. Each card is a full-card
 * `<a>` to `/service-areas/<slug>/`. Single section-level `<AnimateIn>`
 * wrapper — never per-card (1.08 §10 / 1.07 lesson).
 *
 * Surface: `--color-bg-cream`. Container max 1200px, gap 24px desktop / 16px
 * mobile.
 */
export default async function CitiesGrid() {
  const t = await getTranslations('serviceAreas.grid');
  const tagline = await getTranslations('serviceAreas.grid.tagline');

  return (
    <section
      aria-labelledby="sa-grid-h2"
      className="bg-[var(--color-bg-cream)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_1200px]"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up" className="block">
          <div className="mb-8 lg:mb-12 max-w-[64ch]">
            <p
              className="font-heading font-semibold uppercase m-0 mb-3"
              style={{
                fontSize: '12px',
                letterSpacing: 'var(--tracking-eyebrow)',
                color: 'var(--color-sunset-green-700)',
              }}
            >
              {t('eyebrow')}
            </p>
            <h2
              id="sa-grid-h2"
              className="m-0 font-heading"
              style={{
                fontSize: 'var(--text-h2)',
                fontWeight: 700,
                lineHeight: 'var(--leading-tight)',
                letterSpacing: 'var(--tracking-snug)',
                color: 'var(--color-text-primary)',
              }}
            >
              {t('h2')}
            </h2>
            <p
              className="m-0 mt-4"
              style={{
                fontSize: 'var(--text-body-lg)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
              }}
            >
              {t('sub')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {LOCATIONS.filter((loc) => !RETIRED_CITY_SLUGS.has(loc.slug)).map((loc) => (
              <LocationCard
                key={loc.slug}
                href={`/service-areas/${loc.slug}/`}
                cityName={loc.name}
                state={loc.state}
                tagline={(() => {
                  try {
                    return tagline(loc.slug);
                  } catch {
                    // New M.01d cities not yet seeded into `serviceAreas.grid.tagline.*`.
                    // M.01f adds bespoke taglines; fall back to a neutral city label.
                    return `${loc.name}, ${loc.state}`;
                  }
                })()}
                photo={LOCATION_CARD[loc.slug] ?? LOCATION_CARD.aurora}
                cardCtaLabel={t('cardCta')}
              />
            ))}
          </div>
          <ExtendedAreaNote />
        </AnimateIn>
      </div>
    </section>
  );
}

/**
 * Phase M.01e — Lisle + Bolingbrook were retired as dedicated city pages but
 * remain in the service area. Rendered as plain prose under the grid so the
 * SEO signal (Sunset works in those towns) survives the retirement of the
 * dedicated pages. The bilingual strings live under
 * `serviceAreas.extendedArea.*`.
 */
async function ExtendedAreaNote() {
  const t = await getTranslations('serviceAreas.extendedArea');
  return (
    <p
      className="m-0 mt-8 lg:mt-12 max-w-[60ch]"
      style={{
        fontSize: 'var(--text-body)',
        color: 'var(--color-text-secondary)',
        lineHeight: 'var(--leading-relaxed)',
      }}
    >
      {t('note')}
    </p>
  );
}
