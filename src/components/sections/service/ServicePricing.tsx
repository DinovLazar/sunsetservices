import {Link} from '@/i18n/navigation';
import {ArrowRight} from 'lucide-react';
import AnimateIn from '@/components/global/motion/AnimateIn';
import type {Pricing} from '@/data/services';

type ServicePricingProps = {
  serviceSlug: string;
  pricing: Pricing;
  /** Localized factor name + body for State B. */
  explainerFactors: Array<{name: string; body: string}>;
  /** State A "what this includes" body, locale-resolved. Empty in State B. */
  priceIncludes?: string;
  /** Chrome strings (resolved in the route). */
  strings: {
    explainerEyebrow: string;
    explainerH2: string;
    explainerLead: string;
    explainerCta: string;
    priceEyebrow: string;
    priceCta: string;
    /** "Starting at ${price}" with ${price} interpolated already. */
    priceHeadline?: string;
  };
};

/**
 * Service-detail pricing transparency block — Phase 1.08 §4.5, D5.
 *
 * **Both states occupy the same vertical footprint** so surface
 * alternation stays invariant. State A renders when `pricing.mode ===
 * 'price'` (Erick has confirmed); State B is the default for all 16
 * services in Part 1.
 *
 * The CTA is always a `link-cta`, never an amber button — preserving
 * the page's amber budget for the dedicated CTA section §4.9.
 */
export default function ServicePricing({
  serviceSlug,
  pricing,
  explainerFactors,
  priceIncludes,
  strings,
}: ServicePricingProps) {
  return (
    <section
      aria-labelledby="service-pricing-h2"
      className="bg-[var(--color-bg-cream)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_500px]"
    >
      <div className="mx-auto max-w-[var(--container-narrow)] px-4 sm:px-6 lg:px-8">
        <AnimateIn variant="fade-up">
          <div
            className="card"
            style={{
              background: 'var(--color-bg)',
              padding: 0,
              overflow: 'hidden',
            }}
          >
            <div className="p-8 sm:p-10 lg:p-12">
              <p
                className="font-heading font-semibold uppercase m-0 mb-3"
                style={{
                  fontSize: '13px',
                  letterSpacing: 'var(--tracking-eyebrow)',
                  color: 'var(--audience-accent)',
                }}
              >
                {pricing.mode === 'explainer' ? strings.explainerEyebrow : strings.priceEyebrow}
              </p>
              <h2
                id="service-pricing-h2"
                className="m-0 mb-5"
                style={{
                  fontSize: 'var(--text-h2)',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  letterSpacing: 'var(--tracking-snug)',
                }}
              >
                {pricing.mode === 'explainer' ? strings.explainerH2 : strings.priceHeadline}
              </h2>

              {pricing.mode === 'explainer' ? (
                <>
                  <p
                    className="m-0 mb-8"
                    style={{
                      fontSize: 'var(--text-body-lg)',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 'var(--leading-relaxed)',
                    }}
                  >
                    {strings.explainerLead}
                  </p>
                  <dl className="m-0 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {explainerFactors.map((f, idx) => (
                      <div key={`${idx}-${f.name}`}>
                        <dt
                          className="font-heading"
                          style={{
                            fontSize: 'var(--text-h5)',
                            fontWeight: 700,
                            color: 'var(--color-text-primary)',
                            marginBottom: 8,
                          }}
                        >
                          {f.name}
                        </dt>
                        <dd
                          className="m-0"
                          style={{
                            fontSize: 'var(--text-body-sm)',
                            color: 'var(--color-text-secondary)',
                            lineHeight: 'var(--leading-relaxed)',
                          }}
                        >
                          {f.body}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </>
              ) : (
                <p
                  className="m-0 mb-8"
                  style={{
                    fontSize: 'var(--text-body-lg)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 'var(--leading-relaxed)',
                  }}
                >
                  {priceIncludes}
                </p>
              )}

              <Link
                href={`/request-quote/?service=${serviceSlug}`}
                className="link link-cta inline-flex items-center gap-2"
                style={{color: 'var(--color-sunset-green-700)', fontWeight: 600}}
              >
                {pricing.mode === 'explainer' ? strings.explainerCta : strings.priceCta}
                <ArrowRight aria-hidden="true" strokeWidth={1.75} style={{width: 18, height: 18}} />
              </Link>
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
