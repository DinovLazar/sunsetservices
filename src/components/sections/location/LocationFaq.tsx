import {getTranslations} from 'next-intl/server';
import AnimateIn from '@/components/global/motion/AnimateIn';
import FaqAccordion from '@/components/ui/FaqAccordion';

type LocationFaqProps = {
  cityName: string;
  /** Pre-projected, single-locale FAQ items. */
  items: {id: string; question: string; answer: string}[];
};

/**
 * LocationFaq — Phase 1.14 §4.8 template, Phase 2.05 Sanity-driven items.
 *
 * 4 native `<details>` items per city via the locked `FaqAccordion`
 * (Phase 1.09). NO per-item motion wrapper (1.08 §3.7 lock); single
 * section-level `<AnimateIn>` only.
 *
 * Surface: `--color-bg-cream`.
 */
export default async function LocationFaq({cityName, items}: LocationFaqProps) {
  const t = await getTranslations('location.faq');
  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="loc-faq-h2"
      className="bg-[var(--color-bg-cream)] py-14 lg:py-20"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up" className="block">
          <h2
            id="loc-faq-h2"
            className="m-0 mb-8 lg:mb-10 font-heading"
            style={{
              fontSize: 'var(--text-h2)',
              fontWeight: 700,
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-snug)',
              color: 'var(--color-text-primary)',
              textWrap: 'balance',
              maxWidth: '24ch',
            }}
          >
            {t('h2', {city: cityName})}
          </h2>
          <FaqAccordion items={items} />
        </AnimateIn>
      </div>
    </section>
  );
}
