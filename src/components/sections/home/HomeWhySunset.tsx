import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import AnimateIn from '@/components/global/motion/AnimateIn';

/**
 * Why Sunset (Phase M.16). Stone surface. The 8-point owner-vs-investor
 * message kept in substance, restyled: a sticky left intro + orange CTA, and a
 * right column rendered as a numbered divider list (circled green numeral +
 * bold title + one line) rather than another identical card grid.
 *
 * Green is retained for the numerals here (per handover §4); orange owns the
 * CTA. No per-item scroll animation (handover §7) — the two columns fade once.
 */
type Card = {label: string; body: string};

export default async function HomeWhySunset() {
  const t = await getTranslations('home.whySunset');
  const cards = t.raw('cards') as Card[];

  return (
    <section
      aria-labelledby="home-why-h2"
      className="bg-[var(--color-bg-stone)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_1100px]"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-10 lg:gap-16 items-start">
          <AnimateIn variant="fade-up" className="lg:sticky lg:top-24">
            <p
              className="font-heading font-semibold uppercase m-0 mb-2"
              style={{
                fontSize: '13px',
                letterSpacing: 'var(--tracking-eyebrow)',
                color: 'var(--color-sunset-green-700)',
              }}
            >
              {t('eyebrow')}
            </p>
            <h2 id="home-why-h2" className="m-0" style={{textWrap: 'balance'}}>
              {t('h2')}
            </h2>
            <p
              className="m-0 mt-4"
              style={{
                fontSize: 'var(--text-body-lg)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                maxWidth: '42ch',
              }}
            >
              {t('dek')}
            </p>
            <Link
              href="/request-quote/"
              className="btn btn-orange btn-lg mt-7"
              data-cr-tracking="home-why-cta"
            >
              {t('cta')}
            </Link>
          </AnimateIn>

          <AnimateIn variant="fade-up">
            <ol className="list-none p-0 m-0">
              {cards.map((card, i) => (
                <li
                  key={card.label}
                  className="flex gap-4 py-5"
                  style={{borderTop: i === 0 ? 'none' : '1px solid var(--color-border)'}}
                >
                  <span
                    aria-hidden="true"
                    className="inline-flex items-center justify-center font-heading font-bold flex-shrink-0"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '9999px',
                      background: 'var(--color-sunset-green-600)',
                      color: 'var(--color-text-on-green)',
                      fontSize: 'var(--text-body-sm)',
                    }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3
                      className="m-0 font-heading"
                      style={{
                        fontSize: 'var(--text-h5)',
                        fontWeight: 700,
                        letterSpacing: 'var(--tracking-snug)',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {card.label}
                    </h3>
                    <p
                      className="m-0 mt-1.5"
                      style={{
                        fontSize: 'var(--text-body)',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 'var(--leading-relaxed)',
                      }}
                    >
                      {card.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
