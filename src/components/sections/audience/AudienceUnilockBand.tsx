import {Link} from '@/i18n/navigation';
import {ArrowRight} from 'lucide-react';
import AnimateIn from '@/components/global/motion/AnimateIn';
import ServiceIcon from '@/components/ui/ServiceIcon';

type AudienceUnilockBandProps = {
  eyebrow: string;
  h2: string;
  body: string;
  stat: string;
  viewProjects: string;
  badgeAlt: string;
};

/**
 * Hardscape Unilock dedicated band — Phase 1.08 §3X.5.
 * Charcoal surface (D6 — only charcoal band on either template).
 * Renders ONLY for the Hardscape audience. Real licensed Unilock badge
 * swaps in during Phase 2.04; current placeholder is the hand-rolled
 * UnilockBadge from ServiceIcon.tsx.
 */
export default function AudienceUnilockBand({
  eyebrow,
  h2,
  body,
  stat,
  viewProjects,
}: AudienceUnilockBandProps) {
  return (
    <section
      aria-labelledby="audience-unilock-h2"
      className="bg-[var(--color-bg-charcoal)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_500px]"
      style={{color: 'var(--color-text-on-dark)'}}
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 lg:gap-12 items-start">
            {/* Hand-rolled Unilock badge placeholder. */}
            <div
              aria-hidden="true"
              className="shrink-0"
              style={{
                color: 'var(--color-sunset-amber-200, #FAEBC2)',
              }}
            >
              <ServiceIcon name="Unilock" unilock size={120} />
            </div>
            <div>
              <p
                className="font-heading font-semibold uppercase m-0 mb-3"
                style={{
                  fontSize: '13px',
                  letterSpacing: 'var(--tracking-eyebrow)',
                  color: 'var(--color-sunset-amber-200, #FAEBC2)',
                }}
              >
                {eyebrow}
              </p>
              <h2
                id="audience-unilock-h2"
                className="m-0 mb-5"
                style={{color: 'var(--color-text-on-dark)'}}
              >
                {h2}
              </h2>
              <p
                className="m-0 mb-6 lg:mb-8"
                style={{
                  fontSize: 'var(--text-body-lg)',
                  color: 'var(--color-text-on-dark)',
                  opacity: 0.85,
                  lineHeight: 'var(--leading-relaxed)',
                  maxWidth: '64ch',
                }}
              >
                {body}
              </p>
              <dl
                className="m-0 mb-6 lg:mb-8 font-heading uppercase"
                style={{
                  fontSize: 'var(--text-body-sm)',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: 'var(--color-sunset-amber-200, #FAEBC2)',
                }}
              >
                <dd className="m-0">{stat}</dd>
              </dl>
              <Link
                href="/projects/?service=unilock"
                className="link link-cta inline-flex items-center gap-2"
                style={{color: 'var(--color-text-on-dark)', fontWeight: 600}}
              >
                {viewProjects}
                <ArrowRight aria-hidden="true" strokeWidth={1.75} style={{width: 18, height: 18}} />
              </Link>
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
