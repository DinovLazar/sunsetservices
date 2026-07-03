import Image, {type StaticImageData} from 'next/image';
import {Link} from '@/i18n/navigation';
import {Phone} from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import {BUSINESS_PHONE_TEL} from '@/lib/constants/business';
import type {Audience, Division} from '@/data/services';

type ServiceHeroProps = {
  audience: Audience | Division;
  audienceLabel: string;
  audienceKicker: string;
  serviceName: string;
  serviceSlug: string;
  homeLabel: string;
  h1: string;
  subhead: string;
  photo: StaticImageData;
  /**
   * Phase B-14 — descriptive alt for the hero photo when it differs from the
   * service name (services on a real stock-bridge photo). Falls back to the
   * service name so every other service is unchanged.
   */
  photoAlt?: string;
  primaryCta: string;
  callCta: string;
  callAria: string;
};

/**
 * Service-detail hero — Phase 1.08 §4.1, D1 Layout A + D10 ratified
 * tel: secondary CTA. 52vh desktop / 44vh mobile.
 *
 * Breadcrumb is 3-level (Home / Audience / Service); last item carries
 * `aria-current="page"` via <Breadcrumb>'s built-in handling.
 *
 * Kicker uses the audience-accent token (matches the audience landing).
 */
export default function ServiceHero({
  audience,
  audienceLabel,
  audienceKicker,
  serviceName,
  serviceSlug,
  homeLabel,
  h1,
  subhead,
  photo,
  photoAlt,
  primaryCta,
  callCta,
  callAria,
}: ServiceHeroProps) {
  return (
    <section
      aria-labelledby="service-hero-h1"
      className="relative isolate overflow-hidden flex flex-col h-[max(62vh,560px)] sm:h-[max(66vh,600px)] md:h-[max(70vh,640px)] lg:h-[max(74vh,680px)] 2xl:max-h-[820px] text-[var(--color-text-on-dark)]"
      // bg-charcoal fallback — keeps cream copy AA-readable while the hero
      // photo loads (or if it fails to load entirely). Lighthouse on mobile
      // form-factor was computing contrast against #ffffff because the photo
      // hadn't finished decoding by audit time.
      style={{backgroundColor: 'var(--color-bg-charcoal)'}}
    >
      <div className="absolute inset-0">
        <Image
          src={photo}
          alt={photoAlt ?? serviceName}
          fill
          priority
          fetchPriority="high"
          placeholder="blur"
          sizes="100vw"
          // Phase M.02 — quality 70 matches the home + audience + location
          // heroes. ServiceHero is taller (62-74vh post-M.10 navbar fix) so
          // the served WebP is on the LCP critical path even more than the
          // other heroes; quality drop has the highest absolute byte impact.
          quality={70}
          style={{objectFit: 'cover', objectPosition: 'center 60%'}}
        />
        {/* Mobile gradient — stronger floor so the bottom-aligned cream copy
            clears AA over any photo. Matches the AudienceHero black-scrim
            pattern (a neutral black ramp reads darker than green-900 for the
            same opacity, so contrast holds deterministically). */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none sm:hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.12) 30%, rgba(0,0,0,0.60) 100%)',
          }}
        />
        {/* Desktop gradient — transparent at top, dark floor at the copy. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none hidden sm:block"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.55) 100%)',
          }}
        />
      </div>

      <div className="relative flex-1 flex flex-col justify-end">
        <div className="mx-auto w-full max-w-[var(--container-default)] px-6 sm:px-8 lg:px-12 xl:px-16 pt-28 pb-10 sm:pt-32 sm:pb-14 lg:pt-36 lg:pb-16 xl:pb-20 flex flex-col gap-3 sm:gap-4 lg:gap-5">
          <Breadcrumb
            variant="on-dark"
            items={[
              {name: homeLabel, href: '/'},
              {name: audienceLabel, href: `/${audience}/`},
              {name: serviceName},
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
            {audienceKicker}
          </p>
          <h1
            id="service-hero-h1"
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
              href={`/request-quote/?division=${audience}`}
              className="btn btn-primary btn-lg"
              data-cr-tracking={`service-${serviceSlug}-hero-primary`}
            >
              {primaryCta}
            </Link>
            <a
              href={`tel:${BUSINESS_PHONE_TEL}`}
              aria-label={callAria}
              className="btn btn-ghost btn-on-dark btn-lg"
              data-cr-tracking={`service-${serviceSlug}-hero-tel`}
            >
              <Phone aria-hidden="true" strokeWidth={1.75} style={{width: 16, height: 16}} />
              {callCta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
