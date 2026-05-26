import Image from 'next/image';
import {ArrowRight} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import AnimateIn from '@/components/global/motion/AnimateIn';
import StaggerContainer from '@/components/global/motion/StaggerContainer';
import StaggerItem from '@/components/global/motion/StaggerItem';
import residentialSrc from '@/assets/home/audience-residential.jpg';
import commercialSrc from '@/assets/home/audience-commercial.jpg';
import hardscapeSrc from '@/assets/home/audience-hardscape.jpg';

/**
 * Phase M.01e — homepage division entries (was 3-audience tile block).
 *
 * 4 division cards: landscape, hardscape, waterproofing, snow-removal.
 * Waterproofing + Snow-Removal photos alias to existing placeholder
 * assets (residential / commercial) until M.01f swaps in real
 * photography. Strings live under `home.divisions.<slug>.*` (added in
 * M.01e alongside the legacy `home.audience.*` block — kept for any
 * non-route consumers that still reference it; M.01e-pt2 cleanup).
 */
const ENTRIES = [
  {
    key: 'landscape' as const,
    href: '/landscape/',
    photo: residentialSrc,
    tracking: 'home-division-landscape',
  },
  {
    key: 'hardscape' as const,
    href: '/hardscape/',
    photo: hardscapeSrc,
    tracking: 'home-division-hardscape',
  },
  {
    key: 'waterproofing' as const,
    href: '/waterproofing/',
    photo: residentialSrc,
    tracking: 'home-division-waterproofing',
  },
  {
    key: 'snow-removal' as const,
    href: '/snow-removal/',
    photo: commercialSrc,
    tracking: 'home-division-snow-removal',
  },
];

export default async function HomeAudienceEntries() {
  const t = await getTranslations('home.divisions');

  return (
    <section
      aria-labelledby="home-divisions-h2"
      className="bg-[var(--color-bg)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_900px]"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up" className="mb-12 lg:mb-16 max-w-[64ch]">
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
          <h2 id="home-divisions-h2" className="m-0">
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

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {ENTRIES.map((entry) => (
            <StaggerItem key={entry.key}>
              <Link
                href={entry.href}
                className="card card-photo block h-full"
                data-cr-tracking={entry.tracking}
              >
                <div className="relative w-full" style={{aspectRatio: '4 / 3'}}>
                  <Image
                    src={entry.photo}
                    alt={t(`${entry.key}.alt`)}
                    fill
                    placeholder="blur"
                    loading="eager"
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                    style={{objectFit: 'cover'}}
                  />
                </div>
                <div className="p-5 lg:p-6">
                  <p
                    className="font-heading font-semibold uppercase m-0 mb-2"
                    style={{
                      fontSize: '12px',
                      letterSpacing: 'var(--tracking-eyebrow)',
                      color: 'var(--color-sunset-green-700)',
                    }}
                  >
                    {t(`${entry.key}.tag`)}
                  </p>
                  <h3 className="m-0 mb-2">{t(`${entry.key}.h3`)}</h3>
                  <p
                    className="m-0 mb-4"
                    style={{
                      fontSize: 'var(--text-body-sm)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {t(`${entry.key}.desc`)}
                  </p>
                  <span
                    className="inline-flex items-center gap-2 font-heading font-semibold"
                    style={{
                      fontSize: 'var(--text-body-sm)',
                      color: 'var(--color-sunset-green-700)',
                    }}
                  >
                    {t(`${entry.key}.cta`)}
                    <ArrowRight aria-hidden="true" size={18} />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
