'use client';

import * as React from 'react';
import {useScrollState} from '@/hooks/useScrollState';

type NavbarScrollStateProps = {
  children: React.ReactNode;
};

/**
 * Tiny client island that owns the navbar's scroll state and writes a
 * `data-scrolled` attribute on its root element. Children (the server-rendered
 * desktop + mobile bars) read it via a Tailwind `data-[scrolled]:` modifier.
 *
 * Post-M.16 — the navbar is the **solid white dock on every page** (M.16
 * handover §4: "#fff, 1px border, dark logo/links, orange pill — so it matches
 * the other 80 pages"). The translucent over-hero state (Phase 1.05 state B,
 * extended in 1.09 to the audience-landing + service-detail heroes) is retired
 * site-wide; the dock simply gains a soft shadow once scrolled.
 *
 *   - default:            solid white + 1px border  (the dock)
 *   - data-scrolled=true: solid white + soft shadow + faded border
 *
 * The logo + links are always dark (`Logo skin="light"`) — independent of this
 * island — so they read correctly on the white dock at every scroll position.
 */
export default function NavbarScrollState({children}: NavbarScrollStateProps) {
  const scrolled = useScrollState(24);

  return (
    <div
      data-scrolled={scrolled ? 'true' : undefined}
      className={[
        'transition-[background-color,border-color,box-shadow] duration-[var(--motion-base)] ease-[var(--easing-standard)]',
        'bg-[var(--color-bg)] border-b border-[var(--color-border)]',
        'data-[scrolled=true]:shadow-[var(--shadow-soft)]',
        'data-[scrolled=true]:border-[color-mix(in_srgb,var(--color-border)_60%,transparent)]',
      ].join(' ')}
    >
      {children}
    </div>
  );
}
