'use client';

/**
 * StaggerItem — pass-through shell paired with `<StaggerContainer>`.
 *
 * Same Phase M.02 collapse rationale as StaggerContainer / AnimateIn — the
 * motion wrapper was a no-op since M.10 and only carried bundle cost. API
 * preserved (`children`, `as`, `className`) so consumers don't need to change.
 *
 * To re-enable the scroll-triggered stagger, see the note on `StaggerContainer.tsx`.
 */

import * as React from 'react';

type StaggerItemProps = {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
};

export default function StaggerItem({
  children,
  as = 'div',
  className,
}: StaggerItemProps) {
  return React.createElement(
    as as string,
    className ? {className} : null,
    children,
  );
}
