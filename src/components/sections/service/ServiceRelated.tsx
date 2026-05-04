import {Link} from '@/i18n/navigation';
import {ArrowRight} from 'lucide-react';
import AnimateIn from '@/components/global/motion/AnimateIn';
import StaggerContainer from '@/components/global/motion/StaggerContainer';
import StaggerItem from '@/components/global/motion/StaggerItem';
import type {Service} from '@/data/services';

type Locale = 'en' | 'es';

type RelatedTile = {
  service: Service;
  teaser: string;
};

type ServiceRelatedProps = {
  locale: Locale;
  eyebrow: string;
  h2: string;
  tiles: RelatedTile[];
};

/**
 * Service-detail related services — Phase 1.08 §4.8 + D7.
 * No-photo nav tiles in cream cards on white surface. The H2 is dropped
 * one step from --text-h2 to bridge into the close.
 */
export default function ServiceRelated({locale, eyebrow, h2, tiles}: ServiceRelatedProps) {
  return (
    <section
      aria-labelledby="service-related-h2"
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
          <h2
            id="service-related-h2"
            className="m-0"
            style={{
              fontSize: 'var(--text-h3)',
              fontWeight: 700,
              letterSpacing: 'var(--tracking-snug)',
            }}
          >
            {h2}
          </h2>
        </AnimateIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiles.map(({service, teaser}) => (
            <StaggerItem key={service.slug}>
              <Link
                href={`/${service.audience}/${service.slug}/`}
                className="card card-cream block relative h-full"
                aria-label={`Learn more about ${service.name[locale]}`}
              >
                <h3
                  className="m-0 mb-2 font-heading"
                  style={{
                    fontSize: 'var(--text-h5)',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    lineHeight: 'var(--leading-snug)',
                  }}
                >
                  {service.name[locale]}
                </h3>
                <p
                  className="m-0 mb-6"
                  style={{
                    fontSize: 'var(--text-body-sm)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 'var(--leading-relaxed)',
                  }}
                >
                  {teaser}
                </p>
                <span
                  aria-hidden="true"
                  className="inline-flex items-center"
                  style={{color: 'var(--audience-accent)'}}
                >
                  <ArrowRight strokeWidth={1.75} style={{width: 18, height: 18}} />
                </span>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
