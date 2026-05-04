import AnimateIn from '@/components/global/motion/AnimateIn';
import StaggerContainer from '@/components/global/motion/StaggerContainer';
import StaggerItem from '@/components/global/motion/StaggerItem';

type ProcessStep = {
  headline: string;
  description: string;
};

type ServiceProcessProps = {
  eyebrow: string;
  h2: string;
  steps: ProcessStep[];
};

/**
 * Service-detail "Our process" — Phase 1.08 §4.3, D4 numbered cards on
 * dashed connecting hairline.
 *
 * Desktop: horizontal grid (col count = step count). Each step has a
 * 56px numeral, a dot+ring sitting on the dashed hairline, and a
 * headline + 2-line description.
 *
 * Mobile: vertical timeline. Hairline rotates to vertical-left, dots
 * sit on it, content stacks to the right.
 *
 * Numerals are decorative (`aria-hidden="true"`) — the `<ol>`/`<li>`
 * semantics carry order.
 */
export default function ServiceProcess({eyebrow, h2, steps}: ServiceProcessProps) {
  const count = steps.length;
  // Desktop column template — equal columns matching step count.
  const lgCols =
    count === 4 ? 'lg:grid-cols-4' : count === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-3';
  return (
    <section
      aria-labelledby="service-process-h2"
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
          <h2 id="service-process-h2" className="m-0">
            {h2}
          </h2>
        </AnimateIn>

        <StaggerContainer
          as="ol"
          className={`relative grid grid-cols-1 ${lgCols} gap-y-10 lg:gap-x-8 m-0 p-0 list-none`}
        >
          {/* Desktop horizontal hairline (hidden on mobile). */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute pointer-events-none"
            style={{
              top: 56,
              left: '6%',
              right: '6%',
              height: 0,
              borderTop: '1.5px dashed var(--color-sunset-green-700)',
              opacity: 0.6,
            }}
          />
          {/* Mobile vertical hairline. */}
          <div
            aria-hidden="true"
            className="lg:hidden absolute pointer-events-none"
            style={{
              top: 0,
              bottom: 0,
              left: 24,
              width: 0,
              borderLeft: '1.5px dashed var(--color-sunset-green-700)',
              opacity: 0.6,
            }}
          />
          {steps.map((step, idx) => (
            <StaggerItem
              as="li"
              key={`${idx}-${step.headline}`}
              className="relative pl-16 lg:pl-0"
            >
              {/* Dot + ring on the hairline. */}
              <span
                aria-hidden="true"
                className="absolute lg:relative lg:block"
                style={{
                  left: 0,
                  top: 0,
                  marginTop: 0,
                }}
              >
                <span
                  className="block lg:mx-auto"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9999,
                    background: 'var(--color-bg-cream)',
                    border: '1.5px solid var(--color-sunset-green-700)',
                    position: 'relative',
                  }}
                >
                  <span
                    className="block"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%,-50%)',
                      width: 12,
                      height: 12,
                      borderRadius: 9999,
                      background: 'var(--color-sunset-green-700)',
                    }}
                  />
                </span>
              </span>
              <p
                aria-hidden="true"
                className="m-0 font-heading hidden lg:block"
                style={{
                  fontSize: 'var(--text-display)',
                  fontWeight: 700,
                  color: 'var(--color-sunset-green-700)',
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                  marginTop: 16,
                  marginBottom: 16,
                }}
              >
                {String(idx + 1).padStart(2, '0')}
              </p>
              <p
                aria-hidden="true"
                className="m-0 font-heading lg:hidden"
                style={{
                  fontSize: 'var(--text-h2)',
                  fontWeight: 700,
                  color: 'var(--color-sunset-green-700)',
                  lineHeight: 1,
                  marginTop: -2,
                  marginBottom: 8,
                }}
              >
                {String(idx + 1).padStart(2, '0')}
              </p>
              <h3
                className="m-0 mb-2 font-heading"
                style={{
                  fontSize: 'var(--text-h4)',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--leading-snug)',
                }}
              >
                {step.headline}
              </h3>
              <p
                className="m-0"
                style={{
                  fontSize: 'var(--text-body-sm)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 'var(--leading-relaxed)',
                }}
              >
                {step.description}
              </p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
