import AnimateIn from '@/components/global/motion/AnimateIn';
import FooterBrand from './FooterBrand';
import FooterLegal from './FooterLegal';
import FooterLinks from './FooterLinks';
import FooterServiceAreas from './FooterServiceAreas';
import NewsletterSignup from '@/components/forms/NewsletterSignup';

/**
 * Footer composer. Charcoal surface, 5-block layout per §5.2 (Phase 2.08
 * lifted the newsletter signup out of the 3-column grid into a top section
 * above the brand+links columns):
 *   1. Newsletter signup (Phase 2.08 real wiring; hidden on /request-quote/)
 *   2. Brand block (logo dark skin + NAP) + Quick-links columns
 *   3. Service-areas band + social icons
 *   4. Legal microbar
 *
 * One `<AnimateIn variant="fade">` wraps the columns + service-areas (per
 * §9.1). The newsletter section is outside the AnimateIn — it has its own
 * visual rhythm and doesn't need the staged fade.
 */
export default function Footer() {
  return (
    <footer className="bg-[var(--color-bg-charcoal)] text-[var(--color-text-on-dark)]">
      <NewsletterSignup />
      <AnimateIn variant="fade" className="block">
        <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12 py-14 lg:py-20">
          <div className="grid gap-12 lg:gap-16 grid-cols-1 lg:grid-cols-[1fr_2fr]">
            <FooterBrand />
            <FooterLinks />
          </div>
          <div className="mt-12 lg:mt-16">
            <FooterServiceAreas />
          </div>
        </div>
      </AnimateIn>
      <FooterLegal />
    </footer>
  );
}
