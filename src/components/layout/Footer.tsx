import AnimateIn from '@/components/global/motion/AnimateIn';
import FooterBrand from './FooterBrand';
import FooterLegal from './FooterLegal';
import FooterLinks from './FooterLinks';
import FooterNewsletter from './FooterNewsletter';
import FooterServiceAreas from './FooterServiceAreas';

/**
 * Footer composer. Charcoal surface, 5-block layout per §5.2:
 *   1. Brand block (logo dark skin + NAP)
 *   2. Quick-links columns
 *   3. Newsletter placeholder
 *   4. Service-areas band + social icons
 *   5. Legal microbar
 *
 * One `<AnimateIn variant="fade">` wraps the whole footer (per §9.1) —
 * staggering 5 columns + 6 city links would feel theatrical.
 */
export default function Footer() {
  return (
    <footer className="bg-[var(--color-bg-charcoal)] text-[var(--color-text-on-dark)]">
      <AnimateIn variant="fade" className="block">
        <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12 py-14 lg:py-20">
          <div className="grid gap-12 lg:gap-16 grid-cols-1 lg:grid-cols-[1fr_2fr_1.2fr]">
            <FooterBrand />
            <FooterLinks />
            <FooterNewsletter />
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
