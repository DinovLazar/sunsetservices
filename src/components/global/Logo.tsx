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
};

/**
 * Sunset Services real horizontal logo (Phase M.01c). Two skins:
 *   - light (default): full-colour logo for light surfaces (navbar).
 *   - dark: white logo for the charcoal footer.
 *
 * Wraps in a locale-aware Link to the homepage. No hover transform —
 * the most stable element on the chrome doesn't move (Phase 1.05 §3.4).
 */
export default async function Logo({skin = 'light', className}: LogoProps) {
  const t = await getTranslations('chrome.nav');

  return (
    <Link
      href="/"
      aria-label={t('logoAriaLabel')}
      className={['inline-flex items-center no-underline', className].filter(Boolean).join(' ')}
    >
      <Image
        src={skin === 'dark' ? logoWhite : logoColor}
        alt={BUSINESS_NAME_FULL}
        width={150}
        height={40}
        style={{height: '40px', width: 'auto'}}
        className="shrink-0"
      />
    </Link>
  );
}
