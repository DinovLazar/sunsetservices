import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';

type LogoSkin = 'light' | 'dark';

type LogoProps = {
  skin?: LogoSkin;
  className?: string;
};

/**
 * Sunset Services brand mark + wordmark. Two skins:
 *   - light (default): green mark on light surface, green-700 wordmark.
 *   - dark: green-300 mark on charcoal, cream wordmark (footer).
 *
 * Wraps in a locale-aware Link to the homepage. No hover transform —
 * the most stable element on the chrome doesn't move (Phase 1.05 §3.4).
 */
export default async function Logo({skin = 'light', className}: LogoProps) {
  const t = await getTranslations('chrome.nav');

  const markFill = skin === 'dark' ? 'var(--color-sunset-green-300)' : 'var(--color-sunset-green-500)';
  const arcStroke =
    skin === 'dark' ? 'var(--color-bg-charcoal)' : 'var(--color-bg-cream)';
  const wordmarkColor =
    skin === 'dark' ? 'var(--color-text-on-dark)' : 'var(--color-sunset-green-900)';

  return (
    <Link
      href="/"
      aria-label={t('logoAriaLabel')}
      className={['inline-flex items-center gap-3 no-underline', className].filter(Boolean).join(' ')}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        aria-hidden="true"
        focusable="false"
        className="shrink-0"
      >
        <circle cx="16" cy="16" r="16" fill={markFill} />
        <path
          d="M8 20 Q16 6 24 20"
          stroke={arcStroke}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      <span
        className="font-heading font-bold leading-none tracking-tight"
        style={{color: wordmarkColor, fontSize: '20px'}}
      >
        Sunset Services
      </span>
    </Link>
  );
}
