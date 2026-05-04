import Image, {type StaticImageData} from 'next/image';
import {Link} from '@/i18n/navigation';
import {Phone} from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import {BUSINESS_PHONE_TEL} from '@/lib/constants/business';
import type {Audience} from '@/data/services';

type ServiceHeroProps = {
  audience: Audience;
  audienceLabel: string;
  audienceKicker: string;
  serviceName: string;
  serviceSlug: string;
  homeLabel: string;
  h1: string;
  subhead: string;
  photo: StaticImageData;
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
  primaryCta,
  callCta,
  callAria,
}: ServiceHeroProps) {
  return (
    <section
      aria-labelledby="service-hero-h1"
      className="relative isolate overflow-hidden flex flex-col h-[max(44vh,320px)] sm:h-[max(48vh,380px)] lg:h-[max(52vh,420px)] text-[var(--color-text-on-dark)]"
      style={{maxHeight: '600px'}}
    >
      <div className="absolute inset-0">
        <Image
          src={photo}
          alt=""
          fill
          priority
          fetchPriority="high"
          placeholder="blur"
          sizes="100vw"
          style={{objectFit: 'cover', objectPosition: 'center 60%'}}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none sm:hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.20) 30%, rgba(0,0,0,0.78) 100%)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none hidden sm:block"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.20) 50%, rgba(0,0,0,0.74) 100%)',
          }}
        />
      </div>

      <div className="relative flex-1 flex flex-col justify-end">
        <div className="mx-auto w-full max-w-[var(--container-default)] px-6 sm:px-8 lg:px-12 xl:px-16 pt-28 pb-8 sm:pt-32 sm:pb-10 lg:pt-36 lg:pb-12 flex flex-col gap-3 sm:gap-4 lg:gap-5">
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
              href={`/request-quote/?service=${serviceSlug}`}
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
