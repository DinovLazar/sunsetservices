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

const ENTRIES = [
  {
    key: 'residential' as const,
    href: '/residential/',
    photo: residentialSrc,
    tracking: 'home-audience-residential',
  },
  {
    key: 'commercial' as const,
    href: '/commercial/',
    photo: commercialSrc,
    tracking: 'home-audience-commercial',
  },
  {
    key: 'hardscape' as const,
    href: '/hardscape/',
    photo: hardscapeSrc,
    tracking: 'home-audience-hardscape',
  },
];

/**
 * Three audience entry points (handover §4) on white. The whole tile is the
 * click target — `card-photo` wraps photo + content, the inline-link inside
 * is a visible affordance and not a separate target.
 *
 * Photos load eager (no `priority`) — they are likely above-the-fold on tall
 * desktop viewports but are not the LCP candidate.
 */
export default async function HomeAudienceEntries() {
  const t = await getTranslations('home.audience');

  return (
    <section
      aria-labelledby="home-audience-h2"
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
          <h2 id="home-audience-h2" className="m-0">
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

        <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
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
                    sizes="(max-width: 1023px) 100vw, 33vw"
                    style={{objectFit: 'cover'}}
                  />
                </div>
                <div className="p-6 lg:p-8">
                  <p
                    className="font-heading font-semibold uppercase m-0 mb-3"
                    style={{
                      fontSize: '13px',
                      letterSpacing: 'var(--tracking-eyebrow)',
                      color: 'var(--color-sunset-green-700)',
                    }}
                  >
                    {t(`${entry.key}.tag`)}
                  </p>
                  <h3 className="m-0 mb-3">{t(`${entry.key}.h3`)}</h3>
                  <p
                    className="m-0 mb-6"
                    style={{
                      fontSize: 'var(--text-body)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {t(`${entry.key}.desc`)}
                  </p>
                  <span
                    className="inline-flex items-center gap-2 font-heading font-semibold"
                    style={{
                      fontSize: 'var(--text-body)',
                      color: 'var(--color-sunset-green-700)',
                    }}
                  >
                    {t(`${entry.key}.cta`)}
                    <ArrowRight aria-hidden="true" size={20} />
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
