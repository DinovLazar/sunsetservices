import AnimateIn from '@/components/global/motion/AnimateIn';
import StaggerContainer from '@/components/global/motion/StaggerContainer';
import StaggerItem from '@/components/global/motion/StaggerItem';
import ServiceIcon from '@/components/ui/ServiceIcon';

type WhatsIncludedItem = {
  headline: string;
  description: string;
  icon: string;
};

type ServiceWhatsIncludedProps = {
  eyebrow: string;
  h2: string;
  items: WhatsIncludedItem[];
};

/**
 * Service-detail "What's included" — Phase 1.08 §4.2, D3 adaptive layout.
 * 3 items → 1-col @ 720px max; 4 items → 2-col; 5–6 items → 3-col.
 * Mobile collapses to 1-col regardless.
 */
export default function ServiceWhatsIncluded({
  eyebrow,
  h2,
  items,
}: ServiceWhatsIncludedProps) {
  const count = items.length;
  const desktopCols =
    count <= 3 ? 'lg:grid-cols-1' : count === 4 ? 'lg:grid-cols-2' : 'lg:grid-cols-3';
  const containerWidth = count <= 3 ? 'var(--container-narrow)' : 'var(--container-default)';
  return (
    <section
      aria-labelledby="service-whats-included-h2"
      className="bg-[var(--color-bg)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_900px]"
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-12" style={{maxWidth: containerWidth}}>
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
          <h2 id="service-whats-included-h2" className="m-0">
            {h2}
          </h2>
        </AnimateIn>

        <StaggerContainer
          className={`grid grid-cols-1 md:grid-cols-2 ${desktopCols} gap-x-8 lg:gap-x-16 gap-y-10 lg:gap-y-14`}
        >
          {items.map((it, idx) => (
            <StaggerItem key={`${idx}-${it.headline}`}>
              <article>
                <span
                  aria-hidden="true"
                  className="inline-flex items-center justify-center mb-6 lg:mb-8"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--audience-chip-bg)',
                    color: 'var(--audience-accent)',
                  }}
                >
                  <ServiceIcon name={it.icon} size={22} />
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
                    textWrap: 'pretty',
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
