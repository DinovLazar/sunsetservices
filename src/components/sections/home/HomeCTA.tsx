import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {Phone} from 'lucide-react';
import AnimateIn from '@/components/global/motion/AnimateIn';

/**
 * Final CTA band (Phase M.16). Dark gradient surface with the horizon-edge
 * motif on top. One orange primary CTA (charcoal text) + a ghost "Call …"
 * button on dark. The H2 stays one step bigger than the page's other H2s
 * (`--text-h1`).
 *
 * Verification: `document.querySelectorAll('main .btn-orange').length` must be
 * ≥ 1; there must be NO white-on-orange — `.btn-orange` uses charcoal text.
 */
export default async function HomeCTA() {
  const t = await getTranslations('home.cta');

  return (
    <section
      aria-labelledby="home-cta-h2"
      className="relative py-16 lg:py-24 text-[var(--color-text-on-dark)] [content-visibility:auto] [contain-intrinsic-size:auto_520px]"
      style={{background: 'linear-gradient(160deg, #2A2A22 0%, #15150F 100%)'}}
    >
      {/* Horizon-edge motif at the top of the final-CTA band. */}
      <div aria-hidden="true" className="horizon-edge absolute top-0 left-0" />

      <div className="mx-auto max-w-[var(--container-narrow)] px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
        <AnimateIn variant="fade-up">
          <p
            className="font-heading font-semibold uppercase m-0 mb-3"
            style={{
              fontSize: '13px',
              letterSpacing: 'var(--tracking-eyebrow)',
              color: 'var(--color-sunset-orange-300)',
            }}
          >
            {t('eyebrow')}
          </p>
          <h2
            id="home-cta-h2"
            className="m-0 font-heading font-bold"
            style={{
              fontSize: 'var(--text-h1)',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-snug)',
              textWrap: 'balance',
              color: 'var(--color-text-on-dark)',
            }}
          >
            {t('h2')}
          </h2>
          <p
            className="m-0 mt-6 mx-auto"
            style={{
              fontSize: 'var(--text-body-lg)',
              color: 'rgba(250,247,241,0.80)',
              lineHeight: 'var(--leading-relaxed)',
              maxWidth: '52ch',
            }}
          >
            {t('body')}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/request-quote/"
              className="btn btn-orange btn-lg"
              data-cr-tracking="home-cta-primary"
              style={{minWidth: 'min(280px, 100%)'}}
            >
              {t('primary')}
            </Link>
            <a
              href="tel:+16309469321"
              className="btn btn-ghost btn-on-dark btn-lg"
              data-cr-tracking="home-cta-phone"
            >
              <Phone aria-hidden="true" size={18} />
              {t('call')}
            </a>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
