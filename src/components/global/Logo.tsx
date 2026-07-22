import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import logoColor from '@/assets/brand/logo-horizontal-fullcolor.png';
import logoWhite from '@/assets/brand/logo-horizontal-white.png';
import {BUSINESS_NAME_FULL} from '@/lib/constants/business';

type LogoSkin = 'light' | 'dark';

type LogoProps = {
  skin?: LogoSkin;
  className?: string;
  /**
   * Header logos are above the fold — hint the browser to fetch them early
   * so the mark never flashes blank on first paint. Left off for the footer
   * (below the fold) so we don't compete with real LCP imagery. Uses
   * `fetchPriority` rather than `priority`/eager because the navbar renders
   * two instances (desktop + mobile); eager-loading would fetch both
   * (Next.js 16 image docs, art-direction note).
   */
  priority?: boolean;
};

/**
 * Sunset Services real horizontal logo (Phase M.01c). Two skins:
 *   - light (default): full-colour logo for light surfaces (navbar).
 *   - dark: white logo for the charcoal footer.
 *
 * Wraps in a locale-aware Link to the homepage. No hover transform —
 * the most stable element on the chrome doesn't move (Phase 1.05 §3.4).
 *
 * Sizing is aspect-ratio-safe on every device: a fixed height with `w-auto`
 * lets the width follow the image's true ratio, `object-contain` guarantees
 * the mark is never stretched, and `max-w-full` lets it scale down inside a
 * squeezed flex row instead of overflowing or compressing (the previous
 * default `object-fit: fill` collapsed the logo whenever the navbar row ran
 * out of width on narrow screens).
 */
export default async function Logo({skin = 'light', className, priority = false}: LogoProps) {
  const t = await getTranslations('chrome.nav');

  return (
    <Link
      href="/"
      aria-label={t('logoAriaLabel')}
      className={['inline-flex items-center no-underline shrink-0', className]
        .filter(Boolean)
        .join(' ')}
    >
      <Image
        src={skin === 'dark' ? logoWhite : logoColor}
        alt={BUSINESS_NAME_FULL}
        width={150}
        height={40}
        fetchPriority={priority ? 'high' : undefined}
        className="h-10 w-auto max-w-full object-contain"
      />
    </Link>
  );
}
