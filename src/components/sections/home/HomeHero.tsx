import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import HomeHeroCarousel, {type HeroImage} from './HomeHeroCarousel';
import heroSrc from '@/assets/home/hero.jpg';
import heroLandscapeSrc from '@/assets/service/hero-landscape-design.jpg';
import heroSnowSrc from '@/assets/service/hero-snow-removal.jpg';
import heroKitchensSrc from '@/assets/service/hero-outdoor-kitchens.jpg';

/**
 * HomeHero — Layout A (full-bleed photo with text overlay) per Phase 1.06
 * handover §3, evolved by Phase M.10c to a 4-image rotating carousel
 * (locked decision D5). The first image — the existing patio hero — stays
 * as the LCP element: it ships with `priority` + `fetchPriority="high"`
 * inside `<HomeHeroCarousel/>` and is the only frame at `opacity: 1` on
 * first paint, so Lighthouse Performance stays ≥ 95.
 *
 * The other 3 images represent the remaining divisions (Landscape,
 * Snow Removal, and a second Hardscape angle — Outdoor Kitchens). No
 * dedicated Waterproofing photo exists in the asset corpus today, so
 * the rotation deliberately stays on hardscape variety per plan §10.
 *
 * Reduced-motion: the carousel skips its interval and renders the first
 * frame statically — see `HomeHeroCarousel.tsx`.
 *
 * Navbar State B (translucent + backdrop blur) is active here because
 * NavbarScrollState already toggles `data-over-hero` on `pathname === '/'`.
 */
export default async function HomeHero() {
  const t = await getTranslations('home.hero');
  const tDivisions = await getTranslations('home.divisions');
  const tServices = await getTranslations('home.services');

  const heroImages: ReadonlyArray<HeroImage> = [
    {src: heroSrc, alt: t('alt')},
    {src: heroLandscapeSrc, alt: tDivisions('landscape.alt')},
    {src: heroSnowSrc, alt: tDivisions('snow-removal.alt')},
    {src: heroKitchensSrc, alt: tServices('alt.kitchens')},
  ];

  return (
    <section
      aria-labelledby="home-hero-h1"
      className="relative isolate overflow-hidden flex flex-col min-h-[max(30rem,82svh)] sm:min-h-0 sm:h-[max(75vh,560px)] lg:h-[max(85vh,600px)] text-[var(--color-text-on-dark)]"
      style={{backgroundColor: 'var(--color-bg-charcoal)'}}
    >
      {/* Photo carousel + gradient overlay layer. Sits behind the content
          via source order. The `isolate` here (in addition to the section's
          `isolate`) is load-bearing: `HomeHeroCarousel` paints its active
          image at `z-index: 3` and previous image at `z-index: 2` on the
          per-frame fade. Without a stacking context on this wrapper those
          per-frame z-indexes participate in the SECTION's stacking context
          and paint over the `relative` (z-index auto) content stack below
          — which is exactly the M.10e Fix 1 regression: hero text vanished
          behind the active carousel frame. `isolate` here contains those
          per-frame z-indexes inside this wrapper; the wrapper itself stays
          at z-index auto, so source order wins and the content paints on
          top. The carousel wrapper carries aria-hidden=true (decorative
          imagery; H1 + dek above carry the page's accessible name). */}
      <div className="absolute inset-0 isolate">
        <HomeHeroCarousel images={heroImages} />
        {/* Mobile gradient (< sm) — Phase M.10f strengthened the bottom-up
            ramp (→ 0.86 black) so the eyebrow, H1 and body clear WCAG AA over
            the brightest carousel frame (the snow photo). The small eyebrow +
            body get extra margin from the mobile-only `.hero-text-legible`
            text-shadow (see globals.css). Desktop (≥ sm) keeps its lighter
            gradient below — unchanged. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none sm:hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.34) 38%, rgba(0,0,0,0.58) 66%, rgba(0,0,0,0.86) 100%)',
          }}
        />
        {/* Desktop gradient (≥ sm). Top is fully transparent so the sky
            reads; bottom accumulates to 0.65 black for AA against the H1. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none hidden sm:block"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.10) 40%, rgba(0,0,0,0.65) 100%)',
          }}
        />
      </div>

      {/* Content stack — anchored to the lower half of the hero. The flex
          column makes the wrapper grow to the section's height; content sits
          at the end. Phase M.10f: on phones the section is sized with
          `min-h-[max(30rem,82svh)]` (small-viewport units, no fixed height) so
          it tracks the *visible* viewport (respecting the mobile address bar)
          AND grows to fit the taller ES copy — nothing is clipped, and the
          "Get a Free Estimate" CTA stays above the fold. Tablet (≥ sm) and
          desktop (≥ lg) keep their original fixed `h-[…]` heights. */}
      <div className="relative flex-1 flex flex-col justify-end">
        <div className="hero-text-legible mx-auto w-full max-w-[var(--container-default)] px-6 sm:px-8 lg:px-12 xl:px-16 pt-24 pb-8 sm:pt-40 sm:pb-12 lg:pt-48 lg:pb-16 flex flex-col gap-4 sm:gap-6 lg:gap-7">
          <p
            className="font-heading font-semibold uppercase m-0"
            style={{
              fontSize: '13px',
              letterSpacing: 'var(--tracking-eyebrow)',
              color: 'var(--color-text-on-dark)',
            }}
          >
            {t('kicker')}
          </p>

          <h1
            id="home-hero-h1"
            className="font-heading font-extrabold m-0"
            style={{
              fontSize: 'var(--text-display)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: 'var(--color-text-on-dark)',
              maxWidth: '22ch',
            }}
          >
            {t('h1')}
          </h1>

          <p
            className="m-0"
            style={{
              fontSize: 'var(--text-body-lg)',
              lineHeight: 'var(--leading-relaxed)',
              color: 'var(--color-text-on-dark)',
              maxWidth: '52ch',
            }}
          >
            {t('sub')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
            <Link
              href="/request-quote/"
              className="btn btn-primary btn-lg"
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

          <div
            className="mt-2 pt-4 flex flex-wrap items-center gap-x-4 gap-y-2"
            style={{
              borderTop: '1px solid rgba(250,247,241,0.32)',
              fontSize: 'var(--text-body-sm)',
              fontWeight: 500,
              color: 'var(--color-text-on-dark)',
              maxWidth: '720px',
            }}
          >
            <span>{t('trust.rating')}</span>
            <span aria-hidden="true" style={{opacity: 0.5}}>·</span>
            <span>{t('trust.years')}</span>
            <span aria-hidden="true" style={{opacity: 0.5}}>·</span>
            <span>{t('trust.unilock')}</span>
            <span aria-hidden="true" style={{opacity: 0.5}}>·</span>
            <span>{t('trust.area')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
