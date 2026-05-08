import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import AnimateIn from '@/components/global/motion/AnimateIn';

/**
 * Shared bottom-of-page amber CTA — Phase 1.14 D11.
 *
 * Reads the H2/sub/button/phonePrefix/phoneNumber strings from
 * `copyNamespace` (e.g., `serviceAreas.cta`, `location.cta`). When `tokens`
 * is supplied, occurrences of `{key}` markers in `h2` and `sub` are
 * interpolated via next-intl's ICU support — used by the location CTA to
 * splice the city name into the H2 and sub.
 *
 * Existing CTA components (HomeCTA, AboutCTA, ServiceCTA, AudienceCTA) are
 * left untouched; this is a new shared CTA the Phase 1.14 routes consume.
 *
 * Surface --color-bg-cream by default; pass `surface="bg"` to flip to white
 * when the surface alternation rhythm needs it.
 */

type CTAProps = {
  /** i18n namespace for h2, sub, button, phonePrefix, phoneNumber. */
  copyNamespace: string;
  /** Link destination, typically `/request-quote/`. */
  destination?: string;
  /**
   * ICU values used to fill `{key}` placeholders in `h2` / `sub`. Opt-in;
   * existing call-sites without tokens are unaffected as long as those
   * templates have no `{...}` markers.
   */
  tokens?: Record<string, string>;
  /** Surface variant — defaults to cream. Pass 'bg' for white. */
  surface?: 'cream' | 'bg';
  /** Optional unique id segment for aria-labelledby disambiguation. */
  ariaId?: string;
};

export default async function CTA({
  copyNamespace,
  destination = '/request-quote/',
  tokens,
  surface = 'cream',
  ariaId = 'cta',
}: CTAProps) {
  const t = await getTranslations(copyNamespace);
  const values = tokens ?? {};

  const h2 = t('h2', values);
  const sub = t('sub', values);

  const headingId = `cta-${ariaId}-h2`;
  const surfaceClass = surface === 'cream' ? 'bg-[var(--color-bg-cream)]' : 'bg-[var(--color-bg)]';

  return (
    <section
      aria-labelledby={headingId}
      className={`${surfaceClass} py-16 lg:py-24 [content-visibility:auto] [contain-intrinsic-size:auto_500px]`}
    >
      <div className="mx-auto max-w-[var(--container-narrow)] px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
        <AnimateIn variant="fade-up">
          <h2
            id={headingId}
            className="m-0 font-heading font-bold"
            style={{
              fontSize: 'var(--text-h1)',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-snug)',
              textWrap: 'balance',
            }}
          >
            {h2}
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
            {sub}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Link
              href={destination}
              prefetch={false}
              className="btn btn-amber btn-lg"
              data-cr-tracking={`cta-${ariaId}-amber`}
              style={{minWidth: '280px'}}
            >
              {t('button')}
            </Link>
            <a
              href="tel:+16309469321"
              className="link link-inline"
              data-cr-tracking={`cta-${ariaId}-phone`}
              style={{
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-sunset-green-700)',
                fontWeight: 500,
              }}
            >
              {t('phonePrefix')} {t('phoneNumber')}
            </a>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
