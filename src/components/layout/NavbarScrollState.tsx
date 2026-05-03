'use client';

import * as React from 'react';
import {usePathname} from '@/i18n/navigation';
import {useScrollState} from '@/hooks/useScrollState';

type NavbarScrollStateProps = {
  children: React.ReactNode;
};

/**
 * Tiny client island that owns the desktop/mobile navbar's scroll state
 * and writes `data-scrolled` / `data-over-hero` attributes on its root
 * element. Children (server-rendered desktop + mobile bars) read these
 * via Tailwind `data-[scrolled]:` modifiers.
 *
 * Per Phase 1.05 §3.2/§3.3:
 *   - state A: defaults (no attributes)
 *   - state B: data-over-hero=true (homepage at top)
 *   - state C: data-scrolled=true (any page after 24px scroll)
 */
export default function NavbarScrollState({children}: NavbarScrollStateProps) {
  const scrolled = useScrollState(24);
  const pathname = usePathname();
  const isHomepage = pathname === '/';
  const overHero = isHomepage && !scrolled;

  return (
    <div
      data-scrolled={scrolled ? 'true' : undefined}
      data-over-hero={overHero ? 'true' : undefined}
      className={[
        'transition-[background-color,border-color,box-shadow] duration-[var(--motion-base)] ease-[var(--easing-standard)]',
        'bg-[var(--color-bg)] border-b border-[var(--color-border)]',
        'data-[scrolled=true]:shadow-[var(--shadow-soft)]',
        'data-[scrolled=true]:border-[color-mix(in_srgb,var(--color-border)_60%,transparent)]',
        'data-[over-hero=true]:bg-white/[0.78]',
        'data-[over-hero=true]:backdrop-blur-md',
        'data-[over-hero=true]:border-transparent',
        'data-[over-hero=true]:shadow-none',
      ].join(' ')}
    >
      {children}
    </div>
  );
}
