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
 * Per Phase 1.05 §3.2/§3.3 (extended in Phase 1.09):
 *   - state A: defaults (no attributes)
 *   - state B: data-over-hero=true → translucent over hero
 *   - state C: data-scrolled=true → solid + soft shadow
 *
 * Phase 1.09 §2.6 extends State B to audience-landing routes
 * (`/residential/`, `/commercial/`, `/hardscape/`) and service-detail
 * routes (`/{audience}/{service}/`). The handover specified the page
 * mutate `data-over-hero` on `<main>`; we instead detect the route by
 * pathname here so the page doesn't have to reach across into the
 * locale layout's `<main>` element. Same observable behavior, cleaner
 * boundaries. (Surface noted in Phase 1.09 completion report.)
 */
const AUDIENCE_SLUGS = new Set(['residential', 'commercial', 'hardscape']);

function pathHasOverHero(pathname: string): boolean {
  if (pathname === '/') return true;
  const segments = pathname.split('/').filter(Boolean);
  // /residential/ or /residential/lawn-care/ etc.
  if (
    (segments.length === 1 || segments.length === 2) &&
    AUDIENCE_SLUGS.has(segments[0])
  ) {
    return true;
  }
  return false;
}

export default function NavbarScrollState({children}: NavbarScrollStateProps) {
  const scrolled = useScrollState(24);
  const pathname = usePathname();
  const overHero = pathHasOverHero(pathname) && !scrolled;

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
