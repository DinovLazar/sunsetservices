import Image from 'next/image';
import type {StaticImageData} from 'next/image';
import {getLocale, getTranslations} from 'next-intl/server';
import {ArrowRight} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import AnimateIn from '@/components/global/motion/AnimateIn';
import ProjectCard from '@/components/ui/ProjectCard';
import {SERVICES} from '@/data/services';
import {PROJECT_LEAD} from '@/data/imageMap';
import {getProjectDivision} from '@/lib/projects/getProjectDivision';
import {resolveProjectCity} from '@/lib/projects/resolveProjectCity';
import {stripStreetNumber} from '@/lib/projects/stripStreetNumber';
import {resolveProjectImage} from '@/lib/images/resolveProjectImage';
import {getAllProjects, getFeaturedBeforeAfterProject} from '@sanity-lib/queries';
import {sanityProjectSummaryToTs} from '@/lib/sanity-adapters';

/**
 * Home Before/After showcase (Phase M.16 — "The transformation is the pitch.").
 * Cream surface. A featured before/after pair shown as a STATIC, labelled
 * side-by-side split (BEFORE / AFTER text labels, not color alone — so it works
 * for everyone and stays reduced-motion-safe with zero client JS), then a 3-up
 * recent-work strip.
 *
 * All imagery is Sanity-asset-first: the featured pair comes from the newest
 * `hasBeforeAfter` project (placeholder pair as fallback), and the thumbnails
 * from the newest projects with a resolvable lead image. Real photos appear via
 * M.01 with no code change.
 *
 * Per handover §7 there is no per-item scroll animation — only section blocks
 * fade in once.
 */
const BA_FALLBACK_SLUG = 'naperville-hilltop-terrace';
const MAX_THUMBS = 3;

export default async function HomeBeforeAfter() {
  const locale = (await getLocale()) === 'es' ? 'es' : 'en';
  const t = await getTranslations('home.beforeAfter');
  const tDivisions = await getTranslations('home.divisions');

  // Featured before/after pair — Sanity-asset-first, placeholder fallback.
  const baProject = await getFeaturedBeforeAfterProject();
  const hasSanityBA =
    !!baProject?.hasBeforeAfter &&
    !!baProject.beforeImage?.asset?._ref &&
    !!baProject.afterImage?.asset?._ref;

  const beforeImg: StaticImageData | null = hasSanityBA
    ? resolveProjectImage(baProject!.slug, 'before', {
        sanityAsset: baProject!.beforeImage,
        targetWidth: 1000,
        targetHeight: 750,
      })
    : resolveProjectImage(BA_FALLBACK_SLUG, 'before', {});
  const afterImg: StaticImageData | null = hasSanityBA
    ? resolveProjectImage(baProject!.slug, 'after', {
        sanityAsset: baProject!.afterImage,
        targetWidth: 1000,
        targetHeight: 750,
      })
    : resolveProjectImage(BA_FALLBACK_SLUG, 'after', {});

  const baAlt = (which: 'before' | 'after'): string => {
    if (hasSanityBA) {
      const a =
        which === 'before' ? baProject!.beforeAlt?.[locale] : baProject!.afterAlt?.[locale];
      if (a) return a;
    }
    return t('placeholderAlt');
  };
  const caption = hasSanityBA
    ? baProject!.shortDek?.[locale] || baProject!.title?.[locale] || t('caption')
    : t('caption');
  const baHref = hasSanityBA ? `/projects/${baProject!.slug}/` : '/projects/';

  // Recent-work thumbnails — newest projects with a resolvable lead image.
  const projects = (await getAllProjects())
    .map(sanityProjectSummaryToTs)
    .filter((p) => Boolean(p.leadImageUrl ?? PROJECT_LEAD[p.slug]))
    .slice(0, MAX_THUMBS);

  const pairs: Array<{img: StaticImageData; which: 'before' | 'after'; label: string}> = [];
  if (beforeImg) pairs.push({img: beforeImg, which: 'before', label: t('beforeLabel')});
  if (afterImg) pairs.push({img: afterImg, which: 'after', label: t('afterLabel')});

  return (
    <section
      aria-labelledby="home-ba-h2"
      className="bg-[var(--color-bg-cream)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_1300px]"
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
          <h2 id="home-ba-h2" className="m-0">
            {t('h2')}
          </h2>
          <p
            className="m-0 mt-3"
            style={{fontSize: 'var(--text-body-lg)', color: 'var(--color-text-secondary)'}}
          >
            {t('sub')}
          </p>
        </AnimateIn>

        {pairs.length === 2 ? (
          <AnimateIn variant="fade-up">
            <figure className="m-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 overflow-hidden" style={{borderRadius: 'var(--radius-lg)'}}>
                {pairs.map(({img, which, label}) => (
                  <div key={which} className="relative w-full" style={{aspectRatio: '4 / 3'}}>
                    <Image
                      src={img}
                      alt={baAlt(which)}
                      fill
                      sizes="(max-width: 639px) 100vw, 50vw"
                      placeholder={hasSanityBA ? 'empty' : 'blur'}
                      style={{objectFit: 'cover'}}
                    />
                    <span
                      className="absolute top-3 left-3 font-heading font-semibold uppercase"
                      style={{
                        fontSize: '11px',
                        letterSpacing: '0.08em',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        background:
                          which === 'after'
                            ? 'var(--color-sunset-orange-500)'
                            : 'rgba(26,26,26,0.80)',
                        color:
                          which === 'after'
                            ? 'var(--color-text-on-orange)'
                            : 'var(--color-text-on-dark)',
                      }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <figcaption
                className="mt-4 flex flex-wrap items-center justify-between gap-3"
                style={{fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)'}}
              >
                <span style={{maxWidth: '60ch'}}>{caption}</span>
                <Link href={baHref} className="link-cta" style={{color: 'var(--color-sunset-green-700)'}}>
                  {t('recentCta')}
                  <ArrowRight aria-hidden="true" size={16} />
                </Link>
              </figcaption>
            </figure>
          </AnimateIn>
        ) : null}

        {projects.length > 0 ? (
          <div className="mt-12 lg:mt-16">
            <AnimateIn variant="fade-up" className="mb-6 flex items-end justify-between gap-4">
              <h3 className="m-0" style={{fontSize: 'var(--text-h4)'}}>
                {t('recentTitle')}
              </h3>
              <Link href="/projects/" className="link-cta" style={{color: 'var(--color-sunset-green-700)', whiteSpace: 'nowrap'}}>
                {t('recentCta')}
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </AnimateIn>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projects.map((p) => {
                const division = getProjectDivision(p, SERVICES);
                const cityLabel = resolveProjectCity(p);
                const photo = (p.leadImageUrl ?? PROJECT_LEAD[p.slug])!;
                return (
                  <ProjectCard
                    key={p.slug}
                    href={`/projects/${p.slug}/`}
                    photo={photo}
                    alt={p.leadAlt[locale]}
                    title={stripStreetNumber(p.title[locale])}
                    meta={cityLabel}
                    audienceLabel={tDivisions(`${division}.tag`)}
                  />
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
