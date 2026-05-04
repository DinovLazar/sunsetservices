import * as React from 'react';
import {Link} from '@/i18n/navigation';

export type BreadcrumbItem = {
  /** Display name (locale-resolved). */
  name: string;
  /**
   * Path (locale-aware via next-intl <Link>). Pass without locale prefix —
   * `/residential/` not `/en/residential/`. The last item should not have
   * an `href` (current page).
   */
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  /**
   * Visual variant — `light` for cream/white surfaces (default),
   * `on-dark` for hero overlay placement. Hero placements set this.
   */
  variant?: 'light' | 'on-dark';
  className?: string;
};

const SEP = '›';

/**
 * Server-rendered breadcrumb. Reads `aria-current="page"` on the last
 * item and styles muted-text on intermediate items. The on-dark variant
 * uses cream-on-dark text @ 70% opacity per Phase 1.08 §3.1.
 */
export default function Breadcrumb({items, variant = 'light', className}: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol
        className="flex flex-wrap items-center gap-2 m-0 p-0 list-none"
        style={{
          fontSize: 'var(--text-body-sm)',
          color:
            variant === 'on-dark'
              ? 'rgba(250,247,241,0.7)'
              : 'var(--color-text-muted)',
        }}
      >
        {items.map((it, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={`${idx}-${it.name}`} className="inline-flex items-center gap-2">
              {it.href && !isLast ? (
                <Link
                  href={it.href}
                  className="no-underline transition-colors duration-[var(--motion-fast)] ease-[var(--easing-standard)]"
                  style={{
                    color:
                      variant === 'on-dark'
                        ? 'rgba(250,247,241,0.7)'
                        : 'var(--color-text-muted)',
                  }}
                >
                  {it.name}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  style={{
                    color:
                      variant === 'on-dark'
                        ? 'var(--color-text-on-dark)'
                        : 'var(--color-text-primary)',
                    fontWeight: 500,
                  }}
                >
                  {it.name}
                </span>
              )}
              {!isLast ? (
                <span aria-hidden="true" className="inline-flex">
                  {SEP}
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
