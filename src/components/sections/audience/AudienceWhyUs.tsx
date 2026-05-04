import AnimateIn from '@/components/global/motion/AnimateIn';
import StaggerContainer from '@/components/global/motion/StaggerContainer';
import StaggerItem from '@/components/global/motion/StaggerItem';
import ServiceIcon from '@/components/ui/ServiceIcon';

type WhyProp = {
  headline: string;
  description: string;
  icon: string;
};

type AudienceWhyUsProps = {
  eyebrow: string;
  h2: string;
  props: WhyProp[];
};

/**
 * Audience-landing "Why Sunset Services" — Phase 1.08 §3.5.
 * Cream surface, 4 value-prop cards in a 4-col grid (md: 2-col, mobile 1-col).
 * Icon-tile background + icon stroke color use the audience-accent token.
 */
export default function AudienceWhyUs({eyebrow, h2, props}: AudienceWhyUsProps) {
  return (
    <section
      aria-labelledby="audience-why-h2"
      className="bg-[var(--color-bg-cream)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_700px]"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up" className="mb-10 lg:mb-14 max-w-[64ch]">
          <p
            className="font-heading font-semibold uppercase m-0 mb-3"
            style={{
              fontSize: '13px',
              letterSpacing: 'var(--tracking-eyebrow)',
              color: 'var(--audience-accent)',
            }}
          >
            {eyebrow}
          </p>
          <h2 id="audience-why-h2" className="m-0">
            {h2}
          </h2>
        </AnimateIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {props.map((p, idx) => (
            <StaggerItem key={`${idx}-${p.headline}`}>
              <article
                className="card"
                style={{
                  background: 'var(--color-bg)',
                  boxShadow: 'var(--shadow-on-cream)',
                  height: '100%',
                }}
              >
                <span
                  aria-hidden="true"
                  className="inline-flex items-center justify-center mb-6 lg:mb-8"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--audience-chip-bg)',
                    color: 'var(--audience-accent)',
                  }}
                >
                  <ServiceIcon name={p.icon} size={28} />
                </span>
                <h3
                  className="m-0 mb-3 font-heading"
                  style={{
                    fontSize: 'var(--text-h4)',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    lineHeight: 'var(--leading-snug)',
                  }}
                >
                  {p.headline}
                </h3>
                <p
                  className="m-0"
                  style={{
                    fontSize: 'var(--text-body-sm)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 'var(--leading-relaxed)',
                  }}
                >
                  {p.description}
                </p>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
