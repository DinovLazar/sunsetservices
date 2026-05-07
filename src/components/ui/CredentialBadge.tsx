import * as React from 'react';
import ServiceIcon from '@/components/ui/ServiceIcon';

type BadgeKind = 'unilock' | 'years' | 'tribune' | 'google';

type CredentialBadgeProps = {
  kind: BadgeKind;
  /** Localized H4 title (e.g. "Unilock Authorized Contractor"). */
  title: string;
  /** Localized subtitle (e.g. "Hardscape division" / "DuPage Tribune · 2024"). */
  caption: string;
};

/**
 * Server-rendered credential card. Phase 1.11 handover §3.4.
 *
 * Four kinds drive the visual head:
 *  - `unilock` → hand-rolled Unilock badge SVG (Phase 1.03 §8.3)
 *  - `years`   → "25+" big-numeric Fraunces in green
 *  - `tribune` → "Top 5" rank label
 *  - `google`  → "★ 4.8" amber star + numeric
 *
 * Marked up as a `<dl>` per Phase 1.11 §9.2 — non-interactive informational
 * pairs read clean for SR users without role overrides.
 */
export default function CredentialBadge({kind, title, caption}: CredentialBadgeProps) {
  return (
    <article
      className="card flex flex-col items-center justify-center text-center px-6 py-8"
      style={{
        background: 'var(--color-bg)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border-soft, #E0D9C5)',
        boxShadow: 'var(--shadow-soft)',
        minHeight: '180px',
      }}
    >
      <div className="flex items-center justify-center mb-4" style={{minHeight: '56px', color: 'var(--color-sunset-green-700)'}}>
        {renderHead(kind)}
      </div>
      <dl className="m-0 flex flex-col items-center">
        <dt
          className="m-0 font-heading"
          style={{
            fontSize: 'var(--text-h5)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--leading-snug)',
            letterSpacing: 'var(--tracking-snug)',
          }}
        >
          {title}
        </dt>
        <dd
          className="m-0 mt-2"
          style={{
            fontSize: 'var(--text-body-sm)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--leading-normal)',
          }}
        >
          {caption}
        </dd>
      </dl>
    </article>
  );
}

function renderHead(kind: BadgeKind): React.ReactNode {
  if (kind === 'unilock') {
    return <ServiceIcon name="Unilock" size={56} unilock />;
  }
  if (kind === 'years') {
    return (
      <span
        className="font-heading"
        style={{
          fontSize: '52px',
          fontWeight: 600,
          letterSpacing: 'var(--tracking-snug)',
          color: 'var(--color-sunset-green-700)',
          lineHeight: 1,
        }}
      >
        25+
      </span>
    );
  }
  if (kind === 'tribune') {
    return (
      <span
        className="font-heading"
        style={{
          fontSize: '34px',
          fontWeight: 600,
          letterSpacing: 'var(--tracking-snug)',
          color: 'var(--color-sunset-green-700)',
          lineHeight: 1,
        }}
      >
        Top 5
      </span>
    );
  }
  // google
  return (
    <span
      className="font-heading inline-flex items-baseline gap-1"
      style={{
        fontSize: '40px',
        fontWeight: 600,
        letterSpacing: 'var(--tracking-snug)',
        color: 'var(--color-sunset-amber-500, #E8A33D)',
        lineHeight: 1,
      }}
    >
      <span aria-hidden="true">★</span>
      <span style={{color: 'var(--color-text-primary)'}}>4.8</span>
    </span>
  );
}
