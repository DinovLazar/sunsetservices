'use client';

import * as React from 'react';
import {ChevronDown} from 'lucide-react';

type MegaPanelTriggerProps = {
  open: boolean;
  controls: string;
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
};

/**
 * Shared trigger button for the desktop mega-panels (Services / Resources).
 * ARIA per §3.6: aria-haspopup="menu", aria-expanded. `aria-controls` is only
 * set while `open=true` — the panel is mounted lazily via `AnimatePresence`,
 * so the referenced ID does not exist in the DOM while closed. Setting
 * `aria-controls` to a missing ID is a WCAG SC 4.1.2 violation
 * (`aria-valid-attr-value`). Caret rotates 180° when open. Active page
 * emphasis (weight + underline) is delegated to the parent via the `active`
 * prop. Hover-intent uses `onMouseEnter` / `onMouseLeave` (mouse-only) so
 * touch devices fall back to tap-to-open via `onClick` without firing the
 * hover open/close timers (Phase M.10 Issue 2).
 */
const MegaPanelTrigger = React.forwardRef<HTMLButtonElement, MegaPanelTriggerProps>(
  function MegaPanelTrigger(
    {open, controls, active = false, children, onClick, onMouseEnter, onMouseLeave, onFocus, onKeyDown},
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? controls : undefined}
        data-active={active || undefined}
        data-open={open || undefined}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        className={[
          'inline-flex items-center gap-1 px-1 py-2 bg-transparent border-0 cursor-pointer',
          'text-[15px] leading-none text-[var(--color-text-primary)]',
          'font-medium data-[active=true]:font-semibold',
          'hover:text-[var(--color-sunset-green-700)] data-[open=true]:text-[var(--color-sunset-green-700)]',
          'relative',
          /* Underline reveal — uses ::after so we can animate width 0→100%. */
          'after:content-[""] after:absolute after:left-0 after:right-auto after:bottom-[-6px]',
          'after:h-px after:bg-[var(--color-sunset-green-500)] after:w-0',
          'after:transition-[width] after:duration-[var(--motion-fast)] after:ease-[var(--easing-standard)]',
          'hover:after:w-[calc(100%-1rem)] data-[open=true]:after:w-[calc(100%-1rem)]',
          'data-[active=true]:after:h-[2px] data-[active=true]:after:w-[calc(100%-1rem)]',
        ].join(' ')}
      >
        <span>{children}</span>
        <ChevronDown
          className="size-4 transition-transform duration-[var(--motion-fast)] ease-[var(--easing-standard)] data-[open=true]:rotate-180"
          data-open={open || undefined}
          aria-hidden="true"
        />
      </button>
    );
  },
);

export default MegaPanelTrigger;
