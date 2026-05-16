import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import heroSrc from '@/assets/home/hero.jpg';

/**
 * HomeHero — Layout A (full-bleed photo with text overlay) per Phase 1.06
 * handover §3. The hero photo IS the LCP element, so it ships eager with
 * `priority` + `fetchPriority="high"` + `next/image` blur placeholder.
 *
 * No entrance animation by design (handover §3.8): the LCP element renders
 * on first paint to keep Lighthouse Performance ≥ 95.
 *
 * Navbar State B (translucent + backdrop blur) is active here because
 * NavbarScrollState already toggles `data-over-hero` on `pathname === '/'`.
 */
export default async function HomeHero() {
  const t = await getTranslations('home.hero');

  return (
    <section
      aria-labelledby="home-hero-h1"
      className="relative isolate overflow-hidden flex flex-col h-[max(75vh,560px)] lg:h-[max(85vh,600px)] text-[var(--color-text-on-dark)]"
      style={{backgroundColor: 'var(--color-bg-charcoal)'}}
    >
      {/* Photo + gradient overlay layer. Sits behind the content via source
          order; isolation:isolate (on the section) keeps z-stacking local. */}
      <div className="absolute inset-0">
        <Image
          src={heroSrc}
          alt={t('alt')}
          fill
          priority
          fetchPriority="high"
          placeholder="blur"
          sizes="100vw"
          style={{objectFit: 'cover', objectPosition: 'center 65%'}}
        />
        {/* Mobile gradient (< sm). Stronger top opacity so the navbar reads
            against a busy crop. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none sm:hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.20) 30%, rgba(0,0,0,0.70) 100%)',
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
          column makes the wrapper grow to the section's min-height; content
          sits at the end. */}
      <div className="relative flex-1 flex flex-col justify-end">
        <div className="mx-auto w-full max-w-[var(--container-default)] px-6 sm:px-8 lg:px-12 xl:px-16 pt-32 pb-10 sm:pt-40 sm:pb-12 lg:pt-48 lg:pb-16 flex flex-col gap-5 sm:gap-6 lg:gap-7">
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
