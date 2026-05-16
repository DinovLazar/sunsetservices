'use client';

import {useEffect, useState} from 'react';
import type {LegalHeading} from '@/lib/legal/load-content';

type Props = {
  headings: LegalHeading[];
  headerText: string;
  variant: 'desktop' | 'mobile';
};

/**
 * Sticky table-of-contents sidebar for legal pages — Phase B.02 §2.4, B.03c implementation.
 *
 * Two render variants share the same component:
 *  - `desktop`: sticky right rail at `lg:` and up. Nav is always visible.
 *  - `mobile`:  rendered inside a parent `<details>` accordion below `lg:`.
 *
 * IntersectionObserver scroll-spy uses `rootMargin: '-96px 0px -60% 0px'`
 * so the active heading is the topmost one currently inside the upper 40%
 * of the viewport (clearing the 72px navbar + a comfortable buffer).
 *
 * Heading ids are injected server-side by `loadLegalContent()` so deep links
 * + initial scroll position work without JS.
 */
export default function LegalTocSidebar({headings, headerText, variant}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target.id);
        if (intersecting.length === 0) return;
        // Pick the one earliest in document order.
        const firstActive = headings.find(({id}) => intersecting.includes(id));
        if (firstActive) setActiveId(firstActive.id);
      },
      {rootMargin: '-96px 0px -60% 0px'},
    );

    const observed: Element[] = [];
    for (const {id} of headings) {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
        observed.push(el);
      }
    }

    return () => {
      for (const el of observed) observer.unobserve(el);
      observer.disconnect();
    };
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav
      aria-label={headerText}
      style={{
        borderLeft: variant === 'desktop' ? '1px solid var(--color-border)' : undefined,
        paddingLeft: variant === 'desktop' ? '16px' : undefined,
      }}
    >
      {variant === 'desktop' ? (
        <p
          style={{
            margin: '0 0 12px',
            fontSize: 'var(--text-micro)',
            fontWeight: 600,
            letterSpacing: 'var(--tracking-eyebrow)',
            textTransform: 'uppercase',
            color: 'var(--color-sunset-green-700)',
          }}
        >
          {headerText}
        </p>
      ) : null}
      <ol style={{listStyle: 'none', margin: 0, padding: 0}}>
        {headings.map(({id, text, level}) => {
          const isActive = activeId === id;
          return (
            <li
              key={id}
              style={{
                paddingLeft: level === 3 ? '16px' : 0,
              }}
            >
              <a
                href={`#${id}`}
                aria-current={isActive ? 'location' : undefined}
                style={{
                  display: 'block',
                  padding: variant === 'desktop' ? '6px 0 6px 12px' : '8px 0 8px 12px',
                  borderLeft: isActive
                    ? '2px solid var(--color-sunset-green-500)'
                    : '2px solid transparent',
                  marginLeft: '-14px',
                  paddingLeft: '12px',
                  fontSize: 'var(--text-body-sm)',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive
                    ? 'var(--color-sunset-green-700)'
                    : 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 120ms ease, border-color 120ms ease',
                }}
              >
                {text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
