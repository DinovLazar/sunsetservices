import AnimateIn from '@/components/global/motion/AnimateIn';
import StaggerContainer from '@/components/global/motion/StaggerContainer';
import StaggerItem from '@/components/global/motion/StaggerItem';
import ServiceIcon from '@/components/ui/ServiceIcon';

type WhyUsItem = {
  headline: string;
  description: string;
  icon: string;
};

type ServiceWhyUsProps = {
  eyebrow: string;
  h2: string;
  items: WhyUsItem[];
};

/**
 * Service-detail "Why us for this service" — Phase 1.08 §4.4.
 * White surface, 3 cream-fill tiles. Audience-accent applies to icon-tile bg.
 */
export default function ServiceWhyUs({eyebrow, h2, items}: ServiceWhyUsProps) {
  return (
    <section
      aria-labelledby="service-why-h2"
      className="bg-[var(--color-bg)] py-12 lg:py-16 [content-visibility:auto] [contain-intrinsic-size:auto_500px]"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up" className="mb-10 lg:mb-12 max-w-[64ch]">
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
          <h2 id="service-why-h2" className="m-0">
            {h2}
          </h2>
        </AnimateIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {items.map((it, idx) => (
            <StaggerItem key={`${idx}-${it.headline}`}>
              <article className="card card-cream" style={{height: '100%'}}>
                <span
                  aria-hidden="true"
                  className="inline-flex items-center justify-center mb-6"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--audience-chip-bg)',
                    color: 'var(--audience-accent)',
                  }}
                >
                  <ServiceIcon name={it.icon} size={24} />
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
                  {it.headline}
                </h3>
                <p
                  className="m-0"
                  style={{
                    fontSize: 'var(--text-body-sm)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 'var(--leading-relaxed)',
                  }}
                >
                  {it.description}
                </p>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
