'use client';

import * as React from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {useTranslations} from 'next-intl';
import {Link, usePathname} from '@/i18n/navigation';
import {RESOURCES_PANEL} from '@/lib/constants/navigation';
import {durations, easings} from '@/components/global/motion/easings';
import MegaPanelTrigger from './MegaPanelTrigger';

const HOVER_OPEN_DELAY = 150;
const HOVER_CLOSE_DELAY = 250;

/**
 * Desktop "Resources" mega-panel — two columns (Resources / Blog).
 * Smaller than the Services panel; same hover-intent + keyboard contract.
 * Children are placeholder strings in Part 1 (locked in messages/*.json);
 * Part 2.x swaps to Sanity reads without changing this layout.
 */
export default function ResourcesMegaPanel() {
  const t = useTranslations();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const openTimer = React.useRef<number | null>(null);
  const closeTimer = React.useRef<number | null>(null);

  const isActive = RESOURCES_PANEL.some(
    (col) => pathname === col.headerHref || pathname.startsWith(col.headerHref),
  );

  const clearTimers = React.useCallback(() => {
    if (openTimer.current !== null) {
      window.clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleOpen = React.useCallback(() => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    if (open || openTimer.current !== null) return;
    openTimer.current = window.setTimeout(() => {
      setOpen(true);
      openTimer.current = null;
    }, HOVER_OPEN_DELAY);
  }, [open]);

  const scheduleClose = React.useCallback(() => {
    if (openTimer.current !== null) {
      window.clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (!open || closeTimer.current !== null) return;
    closeTimer.current = window.setTimeout(() => {
      setOpen(false);
      closeTimer.current = null;
    }, HOVER_CLOSE_DELAY);
  }, [open]);

  const closeAndFocusTrigger = React.useCallback(() => {
    clearTimers();
    setOpen(false);
    triggerRef.current?.focus();
  }, [clearTimers]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeAndFocusTrigger();
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open, closeAndFocusTrigger]);

  React.useEffect(() => () => clearTimers(), [clearTimers]);

  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => {
        panelRef.current?.querySelector<HTMLAnchorElement>('a')?.focus();
      });
    }
  };

  return (
    <div className="relative inline-flex">
      <MegaPanelTrigger
        ref={triggerRef}
        open={open}
        controls="resources-mega-panel"
        active={isActive}
        onClick={() => setOpen((o) => !o)}
        onPointerEnter={scheduleOpen}
        onPointerLeave={scheduleClose}
        onKeyDown={handleTriggerKeyDown}
      >
        {t('chrome.nav.resources')}
      </MegaPanelTrigger>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            id="resources-mega-panel"
            role="menu"
            aria-label={t('chrome.nav.resources')}
            onPointerEnter={scheduleOpen}
            onPointerLeave={scheduleClose}
            initial={{opacity: 0, y: -4}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -4}}
            transition={{duration: durations.fast, ease: easings.standard}}
            className="fixed left-0 right-0 top-[72px] z-[var(--z-dropdown)] bg-[var(--color-bg)] border-t border-[var(--color-border)] shadow-[var(--shadow-card)]"
          >
            <div className="mx-auto max-w-[var(--container-wide)] px-4 sm:px-6 lg:px-8 xl:px-12 py-10">
              <div className="grid gap-8 grid-cols-2 max-w-[800px]">
                {RESOURCES_PANEL.map((col) => (
                  <div key={col.id}>
                    <Link
                      href={col.headerHref}
                      role="menuitem"
                      className="block pb-2 mb-4 border-b border-[var(--color-border)] text-[var(--color-sunset-green-700)] font-heading font-bold text-[17px] no-underline hover:text-[var(--color-sunset-green-600)]"
                    >
                      {t(col.headerKey)}
                    </Link>
                    <ul className="space-y-3.5">
                      {col.placeholderKeys.map((key) => (
                        <li key={key}>
                          <Link
                            href={col.headerHref}
                            role="menuitem"
                            className="block text-[15px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-sunset-green-700)] no-underline"
                          >
                            {t(key)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
