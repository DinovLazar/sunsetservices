'use client';

import * as React from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {Link, usePathname} from '@/i18n/navigation';

type Surface = 'light' | 'dark';
type Size = 'sm' | 'md';

type LanguageSwitcherProps = {
  surface?: Surface;
  size?: Size;
  className?: string;
};

const LOCALES = ['en', 'es'] as const;
type SwitcherLocale = (typeof LOCALES)[number];

/**
 * Segmented EN | ES locale toggle. Renders two `<Link>` elements that
 * preserve the current pathname under the other locale via next-intl's
 * `localePrefix: 'as-needed'`. ARIA per §6 of the handover.
 */
export default function LanguageSwitcher({
  surface = 'light',
  size = 'sm',
  className,
}: LanguageSwitcherProps) {
  const t = useTranslations('chrome.lang');
  const activeLocale = useLocale();
  const pathname = usePathname();
  const segmentRefs = React.useRef<Record<SwitcherLocale, HTMLAnchorElement | null>>({
    en: null,
    es: null,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') {
      return;
    }
    e.preventDefault();
    const order: SwitcherLocale[] = e.key === 'Home' || e.key === 'End'
      ? (e.key === 'Home' ? [LOCALES[0]] : [LOCALES[LOCALES.length - 1]])
      : LOCALES.slice();
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const focusedLocale = (e.currentTarget.dataset.locale as SwitcherLocale | undefined) ?? activeLocale;
      const idx = LOCALES.indexOf(focusedLocale as SwitcherLocale);
      const nextIdx =
        e.key === 'ArrowRight'
          ? (idx + 1) % LOCALES.length
          : (idx - 1 + LOCALES.length) % LOCALES.length;
      segmentRefs.current[LOCALES[nextIdx]]?.focus();
      return;
    }
    segmentRefs.current[order[0]]?.focus();
  };

  const containerBg =
    surface === 'dark'
      ? 'bg-[rgba(250,247,241,0.08)]'
      : 'bg-[var(--color-bg-stone)]';

  const heightClass = size === 'md' ? 'h-9 text-[14px]' : 'h-7 text-[13px]';

  return (
    <div
      role="group"
      aria-label={t('groupLabel')}
      className={[
        'inline-flex items-center rounded-md p-0.5',
        containerBg,
        heightClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {LOCALES.map((locale) => {
        const isActive = locale === activeLocale;
        const labelFull = t(locale === 'en' ? 'enFull' : 'esFull');
        const switchLabel = t(locale === 'en' ? 'switchToEn' : 'switchToEs');
        const ariaLabel = isActive ? labelFull : switchLabel;
        return (
          <Link
            key={locale}
            href={pathname}
            locale={locale}
            hrefLang={locale}
            lang={locale}
            aria-current={isActive ? 'true' : undefined}
            aria-label={ariaLabel}
            data-locale={locale}
            ref={(el) => {
              segmentRefs.current[locale] = el;
            }}
            onKeyDown={handleKeyDown}
            className={[
              'inline-flex items-center justify-center px-3 h-full rounded-[6px]',
              'font-heading font-semibold no-underline tracking-wide',
              'transition-colors duration-[var(--motion-fast)] ease-[var(--easing-standard)]',
              isActive
                ? 'bg-[var(--color-sunset-green-700)] text-[var(--color-text-on-green)]'
                : surface === 'dark'
                  ? 'text-[var(--color-sunset-green-200)] hover:text-[var(--color-text-on-dark)] hover:bg-[rgba(250,247,241,0.06)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-sunset-green-50)]',
            ].join(' ')}
          >
            {t(locale)}
          </Link>
        );
      })}
    </div>
  );
}
