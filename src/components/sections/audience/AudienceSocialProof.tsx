import {Star} from 'lucide-react';
import AnimateIn from '@/components/global/motion/AnimateIn';
import StaggerContainer from '@/components/global/motion/StaggerContainer';
import StaggerItem from '@/components/global/motion/StaggerItem';

type Review = {
  quote: string;
  name: string;
  city: string;
};

type Credential = {
  big: string;
  sub: string;
};

type AudienceSocialProofProps = {
  eyebrow: string;
  h2: string;
  reviews: Review[];
  credentials: Credential[];
};

/**
 * Audience-specific social proof — Phase 1.08 §3.6. Reuses the homepage
 * pattern: testimonial cards in cream + 1px hairline + credentials row.
 */
export default function AudienceSocialProof({
  eyebrow,
  h2,
  reviews,
  credentials,
}: AudienceSocialProofProps) {
  return (
    <section
      aria-labelledby="audience-social-h2"
      className="bg-[var(--color-bg)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_900px]"
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
          <h2 id="audience-social-h2" className="m-0">
            {h2}
          </h2>
        </AnimateIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {reviews.map((r, idx) => (
            <StaggerItem key={`${idx}-${r.name}`}>
              <article className="card card-cream card-testimonial" style={{height: '100%'}}>
                <div
                  aria-hidden="true"
                  className="inline-flex items-center gap-0.5 mb-3"
                  style={{color: 'var(--color-sunset-amber-500)'}}
                >
                  {Array.from({length: 5}).map((_, i) => (
                    <Star key={i} aria-hidden="true" fill="currentColor" strokeWidth={0} style={{width: 16, height: 16}} />
                  ))}
                </div>
                <blockquote
                  className="m-0 mb-4 font-heading"
                  style={{
                    fontSize: 'var(--text-h5)',
                    fontWeight: 500,
                    fontStyle: 'italic',
                    color: 'var(--color-text-primary)',
                    lineHeight: 'var(--leading-snug)',
                  }}
                >
                  &ldquo;{r.quote}&rdquo;
                </blockquote>
                <cite
                  className="not-italic"
                  style={{
                    fontSize: 'var(--text-body-sm)',
                    fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {r.name}, {r.city}
                </cite>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Credentials row */}
        <div
          className="mt-12 lg:mt-14 pt-8 lg:pt-12"
          style={{borderTop: '1px solid var(--color-border)'}}
        >
          <dl className="m-0 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {credentials.map((c, idx) => (
              <div key={`${idx}-${c.big}`}>
                <dt
                  className="font-heading"
                  style={{
                    fontSize: 'var(--text-h4)',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    lineHeight: 'var(--leading-tight)',
                  }}
                >
                  {c.big}
                </dt>
                <dd
                  className="m-0 mt-1"
                  style={{
                    fontSize: 'var(--text-body-sm)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {c.sub}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
