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
import hardscapeSrc from '@/assets/home/audience-hardscape.jpg';
// Phase HOME-01 uses the same four division images as the prior M.16 grid.
// Waterproofing reuses the /waterproofing/ landing hero (stock-bridge, replace-by
// 2026-10-01 — see docs/stock-bridge/stock-image-manifest.md).
import waterproofingSrc from '@/assets/division/hero-waterproofing.jpg';
// Trenchless fallback: the real open-trench / underground-utility photo
// (`hero-trenching-excavation.jpg`) — the same asset the /request-quote wizard
// division tile uses (WizardStep1Audience.tsx), so the homepage card and the
// wizard tile stay in sync. There are no trenchless projects in Sanity, so this
// fallback always renders.
import trenchlessSrc from '@/assets/service/hero-trenching-excavation.jpg';

/**
 * Homepage divisions block (Phase HOME-01 — entry-point restructure). The five
 * equal cards were re-weighted into a need-based set of FOUR paths: one dominant
 * feature (Outdoor Living & Hardscapes → /hardscape/) plus a secondary trio
 * (Landscape & Property Care · Waterproofing & Drainage · Trenching & Underground
 * Work). Snow Removal is folded into the Landscape descriptor — /snow-removal/
 * stays live and reachable via nav/footer; there is no standalone Snow card here.
 *
 * Card images are Sanity-asset-first: the newest project in each division
 * (division derived from a project's services via `getProjectDivision` — the
 * Sanity `audience` field is the legacy 3-audience tag, not the 4-division IA)
 * with a lead-image asset wins; otherwise the bundled placeholder renders. When
 * real photos land, cards update with no code change.
 *
 * Per handover §7 there is NO per-item scroll animation on this grid — only the
 * heading block fades in once. The eyebrow + heading are retained from M.16.
 */
type Entry = {
  key: Division;
  href: string;
  fallback: StaticImageData;
  tracking: string;
};

// The dominant feature path — full-bleed image, scrim, "Featured" chip, CTA.
const FEATURE: Entry = {
  key: 'hardscape',
  href: '/hardscape/',
  fallback: hardscapeSrc,
  tracking: 'home-division-hardscape',
};

// The secondary trio — equal weight to each other, subordinate to the feature.
// Keyboard/visual order: feature → landscape → waterproofing → trenchless.
const TRIO: Entry[] = [
  {key: 'landscape', href: '/landscape/', fallback: residentialSrc, tracking: 'home-division-landscape'},
  {key: 'waterproofing', href: '/waterproofing/', fallback: waterproofingSrc, tracking: 'home-division-waterproofing'},
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

  const feature = imageFor(FEATURE);

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

        {/* [A] dominant feature + [B] secondary trio */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.42fr_1fr] gap-[14px] md:gap-[18px] lg:gap-5">
          {/* [A] Outdoor Living & Hardscapes — full-bleed, scrim, chip, CTA */}
          <Link
            href={FEATURE.href}
            data-cr-tracking={FEATURE.tracking}
            className="card-photo group relative flex min-h-[340px] md:min-h-[360px] lg:min-h-[532px] flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] transition-[box-shadow] duration-300 hover:shadow-[0_20px_46px_rgba(26,26,26,0.24)] focus-visible:[outline-style:solid] focus-visible:[outline-width:3px] focus-visible:[outline-color:rgba(242,140,56,0.6)] focus-visible:outline-offset-2"
          >
            <Image
              src={feature.photo}
              alt={t('hardscape.alt')}
              fill
              sizes="(max-width: 1023px) 100vw, 56vw"
              placeholder={feature.fromSanity ? 'empty' : 'blur'}
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, transparent 34%, rgba(28,43,43,.42) 62%, rgba(20,32,32,.82) 100%)',
              }}
            />
            <div className="relative flex flex-col items-start gap-3 p-[22px] md:p-[30px]">
              <span
                className="inline-flex items-center rounded-full font-heading font-semibold"
                style={{
                  background: 'var(--color-sunset-orange-500)',
                  color: 'var(--color-text-on-orange)',
                  padding: '4px 12px',
                  fontSize: '12px',
                  letterSpacing: '0.04em',
                }}
              >
                {t('featuredChip')}
              </span>
              <h3
                className="font-heading font-extrabold text-white m-0 leading-[1.12] text-[25px] md:text-[30px] lg:text-[34px]"
              >
                {t('hardscape.label')}
              </h3>
              <p
                className="m-0 max-w-[440px] text-[14.5px] md:text-[16px] lg:text-[16.5px]"
                style={{color: 'rgba(255,255,255,.92)', lineHeight: 1.5}}
              >
                {t('hardscape.desc')}
              </p>
              <span
                className="btn btn-md btn-orange mt-1 transition-colors group-hover:[background:var(--color-sunset-orange-700)] group-hover:[color:var(--color-text-on-dark)]"
              >
                {t('hardscape.cta')}
                <ArrowRight aria-hidden="true" size={18} />
              </span>
            </div>
          </Link>

          {/* [B] Secondary trio */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-3 md:gap-4">
            {TRIO.map((entry) => {
              const {photo, fromSanity} = imageFor(entry);
              return (
                <Link
                  key={entry.key}
                  href={entry.href}
                  data-cr-tracking={entry.tracking}
                  className="group flex min-h-[92px] md:min-h-0 flex-row md:flex-col lg:flex-row overflow-hidden rounded-[14px] border bg-[var(--color-bg)] shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-300 border-[rgba(26,26,26,0.10)] hover:border-[rgba(77,138,63,0.5)] hover:shadow-[0_16px_32px_rgba(26,26,26,0.15)] motion-safe:hover:-translate-y-[3px] focus-visible:[outline-style:solid] focus-visible:[outline-width:3px] focus-visible:[outline-color:rgba(77,138,63,0.55)] focus-visible:outline-offset-2"
                >
                  <div className="relative shrink-0 self-stretch overflow-hidden w-[116px] md:w-full md:h-[148px] lg:w-[156px] lg:h-auto">
                    <Image
                      src={photo}
                      alt={t(`${entry.key}.alt`)}
                      fill
                      sizes="(max-width: 767px) 116px, (max-width: 1023px) 33vw, 156px"
                      placeholder={fromSanity ? 'empty' : 'blur'}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center gap-1.5 p-[15px] md:p-4 lg:p-[18px]">
                    <h3
                      className="font-heading font-bold m-0 leading-[1.2] text-[16px] md:text-[18px]"
                      style={{color: 'var(--color-text-primary)'}}
                    >
                      {t(`${entry.key}.label`)}
                    </h3>
                    <p
                      className="m-0 text-[13px] lg:text-[13.5px]"
                      style={{color: 'var(--color-text-secondary)', lineHeight: 1.45}}
                    >
                      {t(`${entry.key}.desc`)}
                    </p>
                    <ArrowRight
                      aria-hidden="true"
                      size={18}
                      className="mt-0.5 motion-safe:transition-transform motion-safe:group-hover:translate-x-[3px]"
                      style={{color: 'var(--color-sunset-green-500)'}}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
