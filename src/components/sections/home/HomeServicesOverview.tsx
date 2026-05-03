import Image from 'next/image';
import type {StaticImageData} from 'next/image';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import AnimateIn from '@/components/global/motion/AnimateIn';
import StaggerContainer from '@/components/global/motion/StaggerContainer';
import StaggerItem from '@/components/global/motion/StaggerItem';
import lawnCareSrc from '@/assets/home/service-lawn-care.jpg';
import patiosSrc from '@/assets/home/service-patios.jpg';
import wallsSrc from '@/assets/home/service-walls.jpg';
import designSrc from '@/assets/home/service-design.jpg';
import treesSrc from '@/assets/home/service-trees.jpg';
import sprinklersSrc from '@/assets/home/service-sprinklers.jpg';
import snowSrc from '@/assets/home/service-snow.jpg';
import kitchensSrc from '@/assets/home/service-kitchens.jpg';
import fireSrc from '@/assets/home/service-fire.jpg';

type Audience = 'residential' | 'commercial' | 'hardscape';

type Service = {
  key: string;
  audience: Audience;
  href: string;
  photo: StaticImageData;
};

/**
 * Curation per handover §5.4: 4 hardscape (highest-margin) + 4 residential
 * (broadest audience) + 1 commercial (Snow Removal — the commercial signature).
 * The detail routes (`/residential/lawn-care/` etc.) do not exist in Part 1
 * and 404 by design until Phase 1.08+.
 */
const SERVICES: Service[] = [
  {key: 'lawnCare', audience: 'residential', href: '/residential/lawn-care/', photo: lawnCareSrc},
  {key: 'patios', audience: 'hardscape', href: '/hardscape/patios-walkways/', photo: patiosSrc},
  {key: 'walls', audience: 'hardscape', href: '/hardscape/retaining-walls/', photo: wallsSrc},
  {key: 'design', audience: 'residential', href: '/residential/landscape-design/', photo: designSrc},
  {key: 'trees', audience: 'residential', href: '/residential/tree-services/', photo: treesSrc},
  {key: 'sprinklers', audience: 'residential', href: '/residential/sprinkler-systems/', photo: sprinklersSrc},
  {key: 'snow', audience: 'commercial', href: '/commercial/snow-removal/', photo: snowSrc},
  {key: 'kitchens', audience: 'hardscape', href: '/hardscape/outdoor-kitchens/', photo: kitchensSrc},
  {key: 'fire', audience: 'hardscape', href: '/hardscape/fire-pits/', photo: fireSrc},
];

/** Audience-color dot per handover §5.4. */
const DOT_COLOR: Record<Audience, string> = {
  residential: 'var(--color-sunset-green-500)',
  commercial: 'var(--color-bg-charcoal)',
  hardscape: 'var(--color-sunset-amber-700)',
};

const AUDIENCE_CTAS: Array<{key: Audience; href: string}> = [
  {key: 'residential', href: '/residential/'},
  {key: 'commercial', href: '/commercial/'},
  {key: 'hardscape', href: '/hardscape/'},
];

export default async function HomeServicesOverview() {
  const t = await getTranslations('home.services');

  return (
    <section
      aria-labelledby="home-services-h2"
      className="bg-[var(--color-bg-cream)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_1900px]"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up" className="mb-10 lg:mb-14 max-w-[64ch]">
          <p
            className="font-heading font-semibold uppercase m-0 mb-2"
            style={{
              fontSize: '13px',
              letterSpacing: 'var(--tracking-eyebrow)',
              color: 'var(--color-sunset-green-700)',
            }}
          >
            {t('eyebrow')}
          </p>
          <h2 id="home-services-h2" className="m-0">
            {t('h2')}
          </h2>
          <p
            className="m-0 mt-3"
            style={{
              fontSize: 'var(--text-body-lg)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {t('sub')}
          </p>
        </AnimateIn>

        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
          {SERVICES.map((s) => (
            <StaggerItem key={s.key}>
              <Link
                href={s.href}
                className="card card-photo block h-full"
                style={{background: 'var(--color-bg)'}}
              >
                <div className="relative w-full" style={{aspectRatio: '1 / 1'}}>
                  <Image
                    src={s.photo}
                    alt={t(`alt.${s.key}`)}
                    fill
                    placeholder="blur"
                    loading="lazy"
                    sizes="(max-width: 1023px) 50vw, 33vw"
                    style={{objectFit: 'cover'}}
                  />
                </div>
                <div className="p-3 lg:p-4">
                  {/* h3 for hierarchy; visual size is --text-h6 per handover §10.4. */}
                  <h3
                    className="m-0"
                    style={{
                      fontSize: 'var(--text-h6)',
                      fontWeight: 600,
                      letterSpacing: 'var(--tracking-snug)',
                      lineHeight: 'var(--leading-snug)',
                    }}
                  >
                    {t(`tile.${s.key}`)}
                  </h3>
                  <p
                    className="m-0 mt-1.5 inline-flex items-center gap-2"
                    style={{
                      fontSize: 'var(--text-body-sm)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="inline-block"
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '9999px',
                        background: DOT_COLOR[s.audience],
                        flexShrink: 0,
                      }}
                    />
                    {t(`audience.${s.audience}`)}
                  </p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* D3 ratified — three audience-landing buttons, side-by-side
            desktop / full-width stacked mobile. */}
        <AnimateIn variant="fade-up" className="mt-10 lg:mt-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
            {AUDIENCE_CTAS.map((cta) => (
              <Link
                key={cta.key}
                href={cta.href}
                className="btn btn-secondary btn-md"
                style={{width: '100%'}}
              >
                {t(`cta.${cta.key}`)} →
              </Link>
            ))}
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
