'use client';

import * as React from 'react';
import {Link, usePathname} from '@/i18n/navigation';

type Props = {
  label: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  trackingId?: string;
};

/**
 * Amber "Get a Quote" CTA — Phase 1.05 chrome carve-out + Phase 1.19 §2 D2.
 *
 * Hides itself on `/request-quote/` (and the locale-prefixed variant) so the
 * wizard route's only amber element is its own Step 5 Submit. Brand + nav +
 * lang switcher remain on the wizard route; only this CTA disappears.
 *
 * Client component with `usePathname()` so the parent navbar can stay a
 * server component.
 */
export default function NavbarGetQuoteCTA({label, className, style, onClick, trackingId}: Props) {
  const pathname = usePathname();
  // `usePathname` from `@/i18n/navigation` strips the locale prefix, so a check
  // against `/request-quote` matches both EN (`/request-quote`) and ES
  // (`/es/request-quote`) routes.
  if (pathname === '/request-quote' || pathname === '/request-quote/') {
    return null;
  }
  return (
    <Link
      href="/request-quote/"
      className={className ?? 'btn btn-amber btn-md'}
      style={style}
      onClick={onClick}
      data-cr-tracking={trackingId}
    >
      {label}
    </Link>
  );
}
