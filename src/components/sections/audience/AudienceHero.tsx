import Image, {type StaticImageData} from 'next/image';
import {Link} from '@/i18n/navigation';
import Breadcrumb from '@/components/ui/Breadcrumb';
import type {Audience} from '@/data/services';

type AudienceHeroProps = {
  audience: Audience;
  audienceLabel: string;
  homeLabel: string;
  kicker: string;
  h1: string;
  subhead: string;
  alt: string;
  photo: StaticImageData;
  primaryCta: string;
  secondaryCta: string;
};

/**
 * Audience landing hero — Phase 1.08 §3.1 D1 Layout A (full-bleed photo +
 * dark gradient + text overlay). 60vh desktop / 50vh mobile.
 *
 * No entrance animation — first-paint render to keep LCP discipline
 * (handover §2.5 + §3.1). Navbar State B (translucent + blur) is
 * triggered by NavbarScrollState's pathname-based detection extended in
 * Phase 1.09.
 *
 * Audience-accent token applies only to the kicker; buttons stay
 * green/amber regardless of variant (handover §3X.1).
 */
export default function AudienceHero({
  audience,
  audienceLabel,
  homeLabel,
  kicker,
  h1,
  subhead,
  alt,
  photo,
  primaryCta,
  secondaryCta,
}: AudienceHeroProps) {
  return (
    <section
      aria-labelledby="audience-hero-h1"
      className="relative isolate overflow-hidden flex flex-col h-[max(50vh,360px)] sm:h-[max(50vh,420px)] lg:h-[max(60vh,480px)] text-[var(--color-text-on-dark)]"
      style={{maxHeight: '720px'}}
    >
      {/* Photo + gradient overlay */}
      <div className="absolute inset-0">
        <Image
          src={photo}
          alt={alt}
          fill
          priority
          fetchPriority="high"
          placeholder="blur"
          sizes="100vw"
          style={{objectFit: 'cover', objectPosition: 'center 60%'}}
        />
        {/* Mobile gradient — stronger top opacity so navbar reads. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none sm:hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.20) 30%, rgba(0,0,0,0.78) 100%)',
          }}
        />
        {/* Desktop gradient — fully transparent at top. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none hidden sm:block"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.20) 50%, rgba(0,0,0,0.72) 100%)',
          }}
        />
      </div>

      <div className="relative flex-1 flex flex-col justify-end">
        <div className="mx-auto w-full max-w-[var(--container-default)] px-6 sm:px-8 lg:px-12 xl:px-16 pt-32 pb-10 sm:pt-36 sm:pb-12 lg:pt-40 lg:pb-16 flex flex-col gap-3 sm:gap-4 lg:gap-5">
          <Breadcrumb
            variant="on-dark"
            items={[
              {name: homeLabel, href: '/'},
              {name: audienceLabel},
            ]}
          />
          <p
            className="font-heading font-semibold uppercase m-0"
            style={{
              fontSize: '13px',
              letterSpacing: 'var(--tracking-eyebrow)',
              color: 'var(--audience-accent)',
            }}
          >
            {kicker}
          </p>
          <h1
            id="audience-hero-h1"
            className="font-heading font-extrabold m-0"
            style={{
              fontSize: 'var(--text-h1)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: 'var(--color-text-on-dark)',
              maxWidth: '24ch',
            }}
          >
            {h1}
          </h1>
          <p
            className="m-0"
            style={{
              fontSize: 'var(--text-body-lg)',
              lineHeight: 'var(--leading-relaxed)',
              color: 'var(--color-text-on-dark)',
              opacity: 0.92,
              maxWidth: '60ch',
            }}
          >
            {subhead}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
            <Link
              href={`/request-quote/?audience=${audience}`}
              className="btn btn-primary btn-lg"
              data-cr-tracking={`audience-${audience}-hero-primary`}
            >
              {primaryCta}
            </Link>
            <Link
              href={`/projects/?audience=${audience}`}
              className="btn btn-ghost btn-on-dark btn-lg"
              data-cr-tracking={`audience-${audience}-hero-secondary`}
            >
              {secondaryCta} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
