import Image from 'next/image';
import {getLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {getFeaturedHomeProject} from '@sanity-lib/queries';
import {resolveProjectImage} from '@/lib/images/resolveProjectImage';
import heroSrc from '@/assets/home/hero.jpg';

/**
 * HomeHero — Phase M.16 Concept A ("Establishing light"). A single wide
 * golden-hour image (replacing the Phase M.10c rotating carousel) with a
 * left-anchored content stack over a left→right dark scrim.
 *
 * Image source is Sanity-asset-first: the lead image of the project flagged
 * `featuredOnHome` in Sanity, else the bundled placeholder `hero.jpg`. The LCP
 * image ships with `preload` (Next 16 — supersedes the now-deprecated
 * `priority`), a responsive `srcset` (via `sizes="100vw"`), and the optimizer's
 * modern format. Until M.01 uploads real photos AND an editor flags a hero
 * project, the placeholder renders — expected, not a bug.
 *
 * Navbar: the homepage now renders the solid white dock (NavbarScrollState no
 * longer treats `/` as over-hero), so this hero sits below the normal white
 * header — matching the other pages, per the Concept A handover §4.
 *
 * Reduced motion: the section is fully static (no carousel, no entrance
 * animation), so it is reduced-motion-safe by construction.
 */
export default async function HomeHero() {
  const locale = (await getLocale()) === 'es' ? 'es' : 'en';
  const t = await getTranslations('home.hero');

  const featured = await getFeaturedHomeProject();
  const sanityHero = featured?.leadImage
    ? resolveProjectImage(featured.slug, 'lead', {
        sanityAsset: featured.leadImage,
        targetWidth: 2000,
        targetHeight: 1120,
      })
    : null;

  const heroImage = sanityHero ?? heroSrc;
  const isSanity = sanityHero != null;
  const heroAlt =
    isSanity && featured?.leadAlt?.[locale] ? featured.leadAlt[locale] : t('alt');

  return (
    <section
      aria-labelledby="home-hero-h1"
      className="relative isolate overflow-hidden flex flex-col min-h-[max(30rem,82svh)] sm:min-h-0 sm:h-[max(75vh,560px)] lg:h-[max(85vh,600px)] text-[var(--color-text-on-dark)]"
      style={{backgroundColor: 'var(--color-bg-charcoal)'}}
    >
      {/* Single establishing image + scrim. Decorative framing — the H1 +
          credential line carry the section's accessible name; the alt still
          describes the photo for SR users who reach it. */}
      <div className="absolute inset-0 isolate">
        <Image
          src={heroImage}
          alt={heroAlt}
          fill
          sizes="100vw"
          preload
          quality={70}
          placeholder={isSanity ? 'empty' : 'blur'}
          style={{objectFit: 'cover', objectPosition: 'center 60%'}}
        />
        {/* Desktop (≥ sm): left→right scrim so the left-anchored copy clears
            AA while the right of the photo still reads. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none hidden sm:block"
          style={{
            background:
              'linear-gradient(90deg, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.62) 32%, rgba(0,0,0,0.30) 62%, rgba(0,0,0,0.04) 100%)',
          }}
        />
        {/* Mobile (< sm): content stacks at the bottom, so darken bottom-up
            (carried from the M.10f/M.11c mobile-legibility tuning). */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none sm:hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.42) 42%, rgba(0,0,0,0.66) 70%, rgba(0,0,0,0.86) 100%)',
          }}
        />
      </div>

      {/* Content stack — left-anchored, justified to the lower half. */}
      <div className="relative flex-1 flex flex-col justify-end">
        <div className="hero-text-legible mx-auto w-full max-w-[var(--container-default)] px-6 sm:px-8 lg:px-12 xl:px-16 pt-24 pb-9 sm:pt-40 sm:pb-14 lg:pt-44 lg:pb-16 flex flex-col items-start gap-4 sm:gap-5 lg:gap-6">
          <p
            className="font-heading font-semibold uppercase m-0"
            style={{
              fontSize: '13px',
              letterSpacing: 'var(--tracking-eyebrow)',
              color: 'var(--color-sunset-orange-300)',
            }}
          >
            {t('kicker')}
          </p>

          <h1
            id="home-hero-h1"
            className="font-heading font-extrabold m-0"
            style={{
              fontSize: 'var(--text-display)',
              lineHeight: 1.04,
              letterSpacing: '-0.02em',
              color: 'var(--color-text-on-dark)',
              maxWidth: '20ch',
            }}
          >
            {t('h1')}
          </h1>

          {/* Orange rule + credential line (the restrained accent + proof). */}
          <div className="flex flex-col gap-3" style={{maxWidth: '44ch'}}>
            <span
              aria-hidden="true"
              style={{
                width: '64px',
                height: '4px',
                borderRadius: '2px',
                background: 'var(--color-sunset-orange-500)',
              }}
            />
            <p
              className="m-0 font-heading font-semibold"
              style={{
                fontSize: 'var(--text-body-lg)',
                lineHeight: 'var(--leading-snug)',
                color: 'var(--color-text-on-dark)',
              }}
            >
              {t('credential')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-1">
            <Link
              href="/request-quote/"
              className="btn btn-orange btn-lg"
              data-cr-tracking="home-hero-primary"
            >
              {t('primary')}
            </Link>
            <Link
              href="/projects/"
              className="btn btn-ghost btn-on-dark btn-lg"
              data-cr-tracking="home-hero-secondary"
            >
              {t('secondary')} →
            </Link>
          </div>

          {/* Bottom trust strip. The UNILOCK item pairs a ◆ shape with the
              text label (never color-only). */}
          <ul
            className="mt-3 pt-4 flex flex-wrap items-center gap-x-4 gap-y-2 list-none p-0 m-0"
            style={{
              borderTop: '1px solid rgba(250,247,241,0.30)',
              fontSize: 'var(--text-body-sm)',
              fontWeight: 500,
              color: 'var(--color-text-on-dark)',
              maxWidth: '760px',
            }}
          >
            <li>{t('trust.founding')}</li>
            <li aria-hidden="true" style={{opacity: 0.45}}>·</li>
            <li>{t('trust.years')}</li>
            <li aria-hidden="true" style={{opacity: 0.45}}>·</li>
            <li className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" style={{color: 'var(--color-sunset-orange-300)'}}>
                ◆
              </span>
              {t('trust.unilock')}
            </li>
            <li aria-hidden="true" style={{opacity: 0.45}}>·</li>
            <li>{t('trust.insured')}</li>
          </ul>
        </div>
      </div>

      {/* Signature motif — the golden-hour horizon edge at the foot of the hero. */}
      <div aria-hidden="true" className="horizon-edge absolute bottom-0 left-0" />
    </section>
  );
}
