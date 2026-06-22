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
 * Orange "Get a Free Estimate" dock CTA — the sitewide navbar primary CTA
 * (Phase M.16, was amber). Charcoal text on Sunset Orange via `.btn-orange`.
 *
 * Hidden on `/request-quote/` (D2 conversion-surface rule). M.16 reinstates the
 * hide that Phase M.10 (Issue 8) had reverted: the dock CTA never competes with
 * the wizard it points to. That makes this a client component (`usePathname`);
 * `usePathname` from next-intl strips the locale prefix, so `/es/request-quote/`
 * is covered too.
 */
export default function NavbarGetQuoteCTA({label, className, style, onClick, trackingId}: Props) {
  const pathname = usePathname();
  if (pathname === '/request-quote' || pathname === '/request-quote/') return null;

  return (
    <Link
      href="/request-quote/"
      className={className ?? 'btn btn-orange btn-md'}
      style={style}
      onClick={onClick}
      data-cr-tracking={trackingId}
    >
      {label}
    </Link>
  );
}
