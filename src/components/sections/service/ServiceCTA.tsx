import {Link} from '@/i18n/navigation';
import {Phone} from 'lucide-react';
import AnimateIn from '@/components/global/motion/AnimateIn';
import {BUSINESS_PHONE_TEL} from '@/lib/constants/business';

type ServiceCTAProps = {
  serviceSlug: string;
  eyebrow: string;
  h2: string;
  body: string;
  buttonLabel: string;
  phonePrefix: string;
  phoneNumber: string;
};

/**
 * Service-detail CTA section — Phase 1.08 §4.9. Cream surface (no
 * charcoal on service-detail pages per D6). The page's only amber CTA
 * in `<main>`.
 */
export default function ServiceCTA({
  serviceSlug,
  eyebrow,
  h2,
  body,
  buttonLabel,
  phonePrefix,
  phoneNumber,
}: ServiceCTAProps) {
  return (
    <section
      aria-labelledby="service-cta-h2"
      className="bg-[var(--color-bg-cream)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_500px]"
    >
      <div className="mx-auto max-w-[var(--container-narrow)] px-4 sm:px-6 lg:px-8 text-center">
        <AnimateIn variant="fade-up">
          <p
            className="font-heading font-semibold uppercase m-0 mb-4"
            style={{
              fontSize: '13px',
              letterSpacing: 'var(--tracking-eyebrow)',
              color: 'var(--audience-accent)',
            }}
          >
            {eyebrow}
          </p>
          <h2
            id="service-cta-h2"
            className="m-0 mb-5"
            style={{
              fontSize: 'var(--text-h1)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
            }}
          >
            {h2}
          </h2>
          <p
            className="m-0 mb-8 mx-auto"
            style={{
              fontSize: 'var(--text-body-lg)',
              color: 'var(--color-text-secondary)',
              maxWidth: '50ch',
              lineHeight: 'var(--leading-relaxed)',
            }}
          >
            {body}
          </p>
          <div className="flex flex-col items-center gap-4">
            <Link
              href={`/request-quote/?service=${serviceSlug}`}
              className="btn btn-amber btn-lg"
              style={{minWidth: '280px'}}
              data-cr-tracking={`service-${serviceSlug}-cta-amber`}
            >
              {buttonLabel}
            </Link>
            <p
              className="m-0 inline-flex items-center gap-2"
              style={{
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <span>{phonePrefix}</span>
              <a
                href={`tel:${BUSINESS_PHONE_TEL}`}
                className="link"
                style={{
                  color: 'var(--color-sunset-green-700)',
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
