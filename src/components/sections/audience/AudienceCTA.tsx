import {Link} from '@/i18n/navigation';
import {Phone} from 'lucide-react';
import AnimateIn from '@/components/global/motion/AnimateIn';
import {BUSINESS_PHONE_TEL} from '@/lib/constants/business';
import type {Audience} from '@/data/services';

type AudienceCTAProps = {
  audience: Audience;
  eyebrow: string;
  h2: string;
  body: string;
  buttonLabel: string;
  phonePrefix: string;
  phoneNumber: string;
};

/**
 * Audience-landing CTA section — Phase 1.08 §3.8. The page's only amber
 * CTA in `<main>`. Cream surface for Residential + Commercial; charcoal
 * surface for Hardscape per D6.
 */
export default function AudienceCTA({
  audience,
  eyebrow,
  h2,
  body,
  buttonLabel,
  phonePrefix,
  phoneNumber,
}: AudienceCTAProps) {
  const charcoal = audience === 'hardscape';
  return (
    <section
      aria-labelledby="audience-cta-h2"
      className={`py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_500px] ${
        charcoal ? 'bg-[var(--color-bg-charcoal)]' : 'bg-[var(--color-bg-cream)]'
      }`}
      style={charcoal ? {color: 'var(--color-text-on-dark)'} : undefined}
    >
      <div className="mx-auto max-w-[var(--container-narrow)] px-4 sm:px-6 lg:px-8 text-center">
        <AnimateIn variant="fade-up">
          <p
            className="font-heading font-semibold uppercase m-0 mb-4"
            style={{
              fontSize: '13px',
              letterSpacing: 'var(--tracking-eyebrow)',
              color: charcoal
                ? 'var(--color-sunset-amber-200, #FAEBC2)'
                : 'var(--audience-accent)',
            }}
          >
            {eyebrow}
          </p>
          <h2
            id="audience-cta-h2"
            className="m-0 mb-5"
            style={{
              fontSize: 'var(--text-h1)',
              fontWeight: 700,
              color: charcoal ? 'var(--color-text-on-dark)' : 'var(--color-text-primary)',
            }}
          >
            {h2}
          </h2>
          <p
            className="m-0 mb-8 mx-auto"
            style={{
              fontSize: 'var(--text-body-lg)',
              color: charcoal
                ? 'var(--color-text-on-dark)'
                : 'var(--color-text-secondary)',
              opacity: charcoal ? 0.85 : 1,
              maxWidth: '50ch',
              lineHeight: 'var(--leading-relaxed)',
            }}
          >
            {body}
          </p>
          <div className="flex flex-col items-center gap-4">
            <Link
              href={`/request-quote/?audience=${audience}`}
              className="btn btn-amber btn-lg"
              style={{minWidth: '280px'}}
              data-cr-tracking={`audience-${audience}-cta-amber`}
            >
              {buttonLabel}
            </Link>
            <p
              className="m-0 inline-flex items-center gap-2"
              style={{
                fontSize: 'var(--text-body-sm)',
                color: charcoal ? 'var(--color-text-on-dark)' : 'var(--color-text-secondary)',
                opacity: charcoal ? 0.85 : 1,
              }}
            >
              <span>{phonePrefix}</span>
              <a
                href={`tel:${BUSINESS_PHONE_TEL}`}
                className={charcoal ? 'link link-cta' : 'link'}
                style={{
                  color: charcoal ? 'var(--color-text-on-dark)' : 'var(--color-sunset-green-700)',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Phone aria-hidden="true" strokeWidth={1.75} style={{width: 14, height: 14}} />
                {phoneNumber}
              </a>
            </p>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
