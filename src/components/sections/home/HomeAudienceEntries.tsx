import Image from 'next/image';
import type {StaticImageData} from 'next/image';
import {ArrowRight} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import AnimateIn from '@/components/global/motion/AnimateIn';
import {SERVICES, type Division} from '@/data/services';
import {getProjectDivision} from '@/lib/projects/getProjectDivision';
import {resolveProjectImage} from '@/lib/images/resolveProjectImage';
import {getAllProjects} from '@sanity-lib/queries';
import residentialSrc from '@/assets/home/audience-residential.jpg';
import commercialSrc from '@/assets/home/audience-commercial.jpg';
import hardscapeSrc from '@/assets/home/audience-hardscape.jpg';
// Trenchless placeholder: a trenching/excavation photo (exposed conduit in an
// open dig) — a real "utilities in the ground" image that is NOT used anywhere
// else on the homepage, so the card no longer duplicates the snow-removal photo.
// B-16 repointed this to the preserved legacy/ copy when the live
// hero-driveways.jpg became a stock paver-driveway photo — the card keeps
// rendering the exact pre-B-16 image, byte-identical.
import trenchlessSrc from '@/assets/service/legacy/hero-driveways.jpg';

/**
 * Homepage divisions block (Phase M.16 — "Four divisions. One accountable
 * crew."). Four uniform division cards (D4); the Hardscape card carries the
 * small ◆ UNILOCK chip. The grid degrades to 3 columns cleanly if a division
 * is ever removed (D4).
 *
 * Card images are Sanity-asset-first: the newest project in each division
 * (division derived from a project's services via `getProjectDivision` — the
 * Sanity `audience` field is the legacy 3-audience tag, not the 4-division IA)
 * with a lead-image asset wins; otherwise the bundled placeholder renders. When
 * M.01 lands real photos, division cards update with no code change.
 *
 * Per handover §7 there is NO per-item scroll animation on this grid — only the
 * heading block fades in once.
 */
type Entry = {
  key: Division;
  href: string;
  fallback: StaticImageData;
  tracking: string;
  unilock?: boolean;
};

const ENTRIES: Entry[] = [
  {key: 'landscape', href: '/landscape/', fallback: residentialSrc, tracking: 'home-division-landscape'},
  {key: 'hardscape', href: '/hardscape/', fallback: hardscapeSrc, tracking: 'home-division-hardscape', unilock: true},
  {key: 'waterproofing', href: '/waterproofing/', fallback: residentialSrc, tracking: 'home-division-waterproofing'},
  {key: 'snow-removal', href: '/snow-removal/', fallback: commercialSrc, tracking: 'home-division-snow-removal'},
  {key: 'trenchless', href: '/trenchless/', fallback: trenchlessSrc, tracking: 'home-division-trenchless'},
];

export default async function HomeAudienceEntries() {
  const t = await getTranslations('home.divisions');
  const projects = await getAllProjects(); // ordered year desc, slug asc

  const imageFor = (entry: Entry): {photo: StaticImageData; fromSanity: boolean} => {
    const match = projects.find(
      (p) => p.leadImage?.asset?._ref && getProjectDivision(p, SERVICES) === entry.key,
    );
    if (match) {
      const img = resolveProjectImage(match.slug, 'lead', {
        sanityAsset: match.leadImage,
        targetWidth: 900,
        targetHeight: 675,
      });
      if (img) return {photo: img, fromSanity: true};
    }
    return {photo: entry.fallback, fromSanity: false};
  };

  // D4 — the grid stays balanced as divisions are added/removed: 5 → one row
  // of 5, 4 → one row of 4, ≤3 → 3 columns. (Phase B.12 added trenchless = 5.)
  const lgCols =
    ENTRIES.length >= 5 ? 'lg:grid-cols-5' : ENTRIES.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3';

  return (
    <section
      aria-labelledby="home-divisions-h2"
      className="bg-[var(--color-bg)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_900px]"
    >
      <div className="mx-auto max-w-[var(--container-default)] lg:max-w-[var(--container-wide)] px-4 sm:px-6 lg:px-8 xl:px-12">
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

        <div className={`grid grid-cols-1 sm:grid-cols-2 ${lgCols} gap-5 lg:gap-6`}>
          {ENTRIES.map((entry) => {
            const {photo, fromSanity} = imageFor(entry);
            return (
              <Link
                key={entry.key}
                href={entry.href}
                className="card card-photo block h-full"
                data-cr-tracking={entry.tracking}
              >
                <div className="relative w-full" style={{aspectRatio: '4 / 3'}}>
                  <Image
                    src={photo}
                    alt={t(`${entry.key}.alt`)}
                    fill
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                    placeholder={fromSanity ? 'empty' : 'blur'}
                    style={{objectFit: 'cover'}}
                  />
                  {entry.unilock ? (
                    <span
                      className="absolute top-3 left-3 inline-flex items-center gap-1.5 font-heading font-semibold"
                      style={{
                        background: 'rgba(255,255,255,0.92)',
                        color: 'var(--color-text-primary)',
                        borderRadius: '9999px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        letterSpacing: '0.04em',
                        boxShadow: 'var(--shadow-soft)',
                      }}
                    >
                      <span aria-hidden="true" style={{color: 'var(--color-sunset-orange-500)'}}>
                        ◆
                      </span>
                      {t('unilockChip')}
                    </span>
                  ) : null}
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
