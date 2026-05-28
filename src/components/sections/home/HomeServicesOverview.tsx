import Image from 'next/image';
import type {StaticImageData} from 'next/image';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import AnimateIn from '@/components/global/motion/AnimateIn';
import StaggerContainer from '@/components/global/motion/StaggerContainer';
import StaggerItem from '@/components/global/motion/StaggerItem';
import type {Division} from '@/data/services';
import lawnCareSrc from '@/assets/home/service-lawn-care.jpg';
import patiosSrc from '@/assets/home/service-patios.jpg';
import wallsSrc from '@/assets/home/service-walls.jpg';
import designSrc from '@/assets/home/service-design.jpg';
import treesSrc from '@/assets/home/service-trees.jpg';
import sprinklersSrc from '@/assets/home/service-sprinklers.jpg';
import snowSrc from '@/assets/home/service-snow.jpg';
import kitchensSrc from '@/assets/home/service-kitchens.jpg';
import fireSrc from '@/assets/home/service-fire.jpg';

type Service = {
  key: string;
  division: Division;
  href: string;
  photo: StaticImageData;
};

/**
 * Curation per handover §5.4: 4 hardscape (highest-margin) + 4 landscape
 * services + 1 snow-removal commercial signature. Phase M.10c flipped the
 * per-tile badge from the retired 3-audience scheme to the 4-division IA
 * (locked decision D2). No waterproofing tile is in the curated 9.
 */
const SERVICES: Service[] = [
  {key: 'lawnCare', division: 'landscape', href: '/landscape/lawn-care/', photo: lawnCareSrc},
  {key: 'patios', division: 'hardscape', href: '/hardscape/patios-walkways/', photo: patiosSrc},
  {key: 'walls', division: 'hardscape', href: '/hardscape/retaining-walls/', photo: wallsSrc},
  {key: 'design', division: 'landscape', href: '/landscape/landscape-design/', photo: designSrc},
  {key: 'trees', division: 'landscape', href: '/landscape/tree-services/', photo: treesSrc},
  {key: 'sprinklers', division: 'landscape', href: '/landscape/sprinkler-systems/', photo: sprinklersSrc},
  {key: 'snow', division: 'snow-removal', href: '/snow-removal/commercial-snow-plowing/', photo: snowSrc},
  {key: 'kitchens', division: 'hardscape', href: '/hardscape/outdoor-kitchens/', photo: kitchensSrc},
  {key: 'fire', division: 'hardscape', href: '/hardscape/fire-pits-features/', photo: fireSrc},
];

/**
 * Per-division dot color. Mirrors the `[data-division='<slug>']` accent
 * tokens in `globals.css` so the dot color matches the rest of the site's
 * division-accent rendering. Waterproofing is defined for completeness;
 * no waterproofing tile is in the curated 9 today.
 */
const DOT_COLOR: Record<Division, string> = {
  landscape: 'var(--color-sunset-green-700)',
  hardscape: 'var(--color-sunset-amber-700)',
  waterproofing: 'var(--color-sunset-green-900)',
  'snow-removal': 'var(--color-text-primary)',
};

/**
 * Phase M.10c — bottom CTA row now ships 4 division entries (was 3
 * audiences). Locked decision D4. Layout: 1-col xs, 2-col sm/md, 4-col lg+.
 */
const DIVISION_CTAS: Array<{key: Division; href: string}> = [
  {key: 'landscape', href: '/landscape/'},
  {key: 'hardscape', href: '/hardscape/'},
  {key: 'waterproofing', href: '/waterproofing/'},
  {key: 'snow-removal', href: '/snow-removal/'},
];

export default async function HomeServicesOverview() {
  const t = await getTranslations('home.services');
  const tDivisions = await getTranslations('home.divisions');

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
                        background: DOT_COLOR[s.division],
                        flexShrink: 0,
                      }}
                    />
                    {tDivisions(`${s.division}.tag`)}
                  </p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Phase M.10c D4 — four division-landing buttons. 4-col lg+,
            2-col sm/md, stacked xs. Reuses the existing .btn-secondary class. */}
        <AnimateIn variant="fade-up" className="mt-10 lg:mt-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {DIVISION_CTAS.map((cta) => (
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
