import AnimateIn from '@/components/global/motion/AnimateIn';
import StaggerContainer from '@/components/global/motion/StaggerContainer';
import StaggerItem from '@/components/global/motion/StaggerItem';

type AudienceQualifierProps = {
  eyebrow: string;
  h2: string;
  body: string;
  pills: [string, string, string, string];
};

/**
 * "Who this is for" qualifier — Phase 1.08 §3.2.
 * White surface, paragraph + 4 trust pills (badge-subtle pill-shape).
 */
export default function AudienceQualifier({eyebrow, h2, body, pills}: AudienceQualifierProps) {
  return (
    <section
      aria-labelledby="audience-qualifier-h2"
      className="bg-[var(--color-bg)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_500px]"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up" className="max-w-[64ch]">
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
          <h2 id="audience-qualifier-h2" className="m-0 mb-5">
            {h2}
          </h2>
          <p
            className="m-0 mb-8 lg:mb-10"
            style={{
              fontSize: 'var(--text-body-lg)',
              color: 'var(--color-text-secondary)',
              maxWidth: '60ch',
            }}
          >
            {body}
          </p>
        </AnimateIn>
        <StaggerContainer className="flex flex-wrap gap-3">
          {pills.map((pill, idx) => (
            <StaggerItem key={`${idx}-${pill}`}>
              <span
                className="badge badge-md badge-pill"
                style={{
                  background: 'var(--audience-chip-bg)',
                  color: 'var(--audience-accent)',
                  height: '36px',
                  padding: '0 16px',
                  fontSize: '13px',
                }}
              >
                {pill}
              </span>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
