import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import Breadcrumb from '@/components/ui/Breadcrumb';
import heroSrc from '@/assets/about/hero.jpg';

/**
 * About hero — Phase 1.11 handover §3.1.
 *
 * Photo-led, 50vh desktop / 40vh mobile. NO entrance animation (LCP
 * discipline — the hero photo IS the LCP candidate per §10). Eyebrow + H1
 * + 2-line lead overlay sits in the lower-left over a bottom-up dark
 * gradient (Phase 1.03 §3 photo-overlay rule). NO in-hero CTA — page-level
 * amber CTA at §3.7 does the conversion.
 */
export default async function AboutHero() {
  const t = await getTranslations('about.hero');
  const tCrumbs = await getTranslations('about.breadcrumb');

  return (
    <section
      aria-labelledby="about-hero-h1"
      className="relative w-full overflow-hidden"
      style={{
        height: '40vh',
        minHeight: '420px',
        backgroundColor: 'var(--color-bg-charcoal)',
      }}
    >
      <div className="absolute inset-0 lg:[height:50vh]">
        <Image
          src={heroSrc}
          alt={t('alt')}
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          style={{objectFit: 'cover'}}
        />
        {/* Bottom-up dark overlay so the eyebrow + H1 + lead clear AA. */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(0deg, rgba(26,26,26,0.55) 0%, rgba(26,26,26,0.20) 55%, rgba(26,26,26,0) 100%)',
          }}
        />
      </div>
      <div className="relative z-10 mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12 h-full flex flex-col justify-end pb-10 lg:pb-16">
        <Breadcrumb
          variant="on-dark"
          className="mb-4"
          items={[
            {name: tCrumbs('home'), href: '/'},
            {name: tCrumbs('about')},
          ]}
        />
        <div className="max-w-[64ch]">
          <p
            className="font-heading font-semibold uppercase m-0 mb-3 inline-flex items-center"
            style={{
              fontSize: '12px',
              letterSpacing: 'var(--tracking-eyebrow)',
              color: 'var(--color-sunset-green-700)',
              background: 'rgba(250,247,241,0.92)',
              height: '24px',
              padding: '0 12px',
              borderRadius: '12px',
            }}
          >
            {t('eyebrow')}
          </p>
          <h1
            id="about-hero-h1"
            className="m-0 font-heading"
            style={{
              fontSize: 'var(--text-h1)',
              fontWeight: 600,
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-snug)',
              color: 'var(--color-text-on-dark)',
              textWrap: 'balance',
            }}
          >
            {t('h1')}
          </h1>
          <p
            className="m-0 mt-4"
            style={{
              fontSize: 'var(--text-body-lg)',
              lineHeight: 'var(--leading-relaxed)',
              color: 'var(--color-text-on-dark)',
              opacity: 0.92,
            }}
          >
            {t('lead.line1')}
            <br />
            {t('lead.line2')}
          </p>
        </div>
      </div>
    </section>
  );
}
