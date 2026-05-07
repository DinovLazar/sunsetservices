import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import AnimateIn from '@/components/global/motion/AnimateIn';

/**
 * About CTA — Phase 1.11 handover §3.7.
 *
 * The page's ONLY body amber CTA. Surface --color-bg-cream. Destination
 * /request-quote/ (D6 lock). Mirrors HomeCTA structure verbatim — D16
 * `RESOLVED (auto): B (duplicate component)` because promoting HomeCTA to a
 * shared CTA primitive requires editing the homepage component, which the
 * handover §3.6 forbids in this phase. Part-2 cleanup pass to consolidate.
 *
 * Verification check: `document.querySelectorAll('main .btn-amber').length`
 * must equal 1 on /about/ — this section provides the only amber button.
 */
export default async function AboutCTA() {
  const t = await getTranslations('about.cta');

  return (
    <section
      aria-labelledby="about-cta-h2"
      className="bg-[var(--color-bg-cream)] py-16 lg:py-24 [content-visibility:auto] [contain-intrinsic-size:auto_500px]"
    >
      <div className="mx-auto max-w-[var(--container-narrow)] px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
        <AnimateIn variant="fade-up">
          <p
            className="font-heading font-semibold uppercase m-0 mb-3"
            style={{
              fontSize: '13px',
              letterSpacing: 'var(--tracking-eyebrow)',
              color: 'var(--color-sunset-green-700)',
            }}
          >
            {t('eyebrow')}
          </p>
          <h2
            id="about-cta-h2"
            className="m-0 font-heading font-bold"
            style={{
              fontSize: 'var(--text-h1)',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-snug)',
              textWrap: 'balance',
            }}
          >
            {t('h2')}
          </h2>
          <p
            className="m-0 mt-6 mx-auto"
            style={{
              fontSize: 'var(--text-body-lg)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--leading-relaxed)',
              maxWidth: '52ch',
            }}
          >
            {t('body')}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Link
              href="/request-quote/"
              className="btn btn-amber btn-lg"
              data-cr-tracking="about-cta-amber"
              style={{minWidth: '280px'}}
            >
              {t('primary')}
            </Link>
            <a
              href="tel:+16309469321"
              className="link link-inline"
              data-cr-tracking="about-cta-phone"
              style={{
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-sunset-green-700)',
                fontWeight: 500,
              }}
            >
              {t('secondary')}
            </a>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
