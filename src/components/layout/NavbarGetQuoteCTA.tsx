import * as React from 'react';
import {Link} from '@/i18n/navigation';

type Props = {
  label: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  trackingId?: string;
};

/**
 * Amber "Get a Quote" CTA — Phase 1.05 chrome carve-out.
 *
 * Phase M.10 (Issue 8): reverted the Phase 1.19 §2 D2 carve-out that hid
 * this CTA on `/request-quote/`. Per Goran's M.10 walkthrough feedback
 * the navbar must be visually consistent across every route — visual
 * consistency wins over conversion-surface dedup. Clicking the CTA from
 * inside the wizard scrolls/no-ops to the same page; acceptable.
 *
 * No client-side `usePathname()` needed anymore — the CTA renders on
 * every route unconditionally, so this stays a server component.
 */
export default function NavbarGetQuoteCTA({label, className, style, onClick, trackingId}: Props) {
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
