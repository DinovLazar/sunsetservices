import AnimateIn from '@/components/global/motion/AnimateIn';
import FaqAccordion, {type FaqAccordionItem} from '@/components/ui/FaqAccordion';

type AudienceFAQProps = {
  eyebrow: string;
  h2: string;
  items: FaqAccordionItem[];
};

/**
 * Audience-landing FAQ — Phase 1.08 §3.7. Cream surface, 960px narrow
 * container, native <details>/<summary> per item via <FaqAccordion>.
 *
 * **Per-item entrance animations are intentionally absent** — only the
 * section header wraps `<AnimateIn>`. Wrapping each item would push the
 * client-island count past handover budget and re-introduce the homepage
 * mobile P=86 Lighthouse gap (§10).
 */
export default function AudienceFAQ({eyebrow, h2, items}: AudienceFAQProps) {
  return (
    <section
      aria-labelledby="audience-faq-h2"
      className="bg-[var(--color-bg-cream)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_900px]"
    >
      <div className="mx-auto max-w-[var(--container-narrow)] px-4 sm:px-6 lg:px-8">
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
          <h2 id="audience-faq-h2" className="m-0">
            {h2}
          </h2>
        </AnimateIn>
        <FaqAccordion items={items} />
      </div>
    </section>
  );
}
