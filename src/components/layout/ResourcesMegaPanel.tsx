'use client';

import * as React from 'react';
import {useTranslations} from 'next-intl';
import {Link, usePathname} from '@/i18n/navigation';
import {RESOURCES_PANEL} from '@/lib/constants/navigation';
import MegaPanelTrigger from './MegaPanelTrigger';

const HOVER_CLOSE_DELAY = 180;

/**
 * Desktop "Resources" mega-panel — two columns (Resources / Blog).
 *
 * Same hover-intent + animation contract as `<ServicesMegaPanel>`:
 * mouse hover opens, mouse leave closes with a short grace delay,
 * click toggles, keyboard works, CSS fade replaces the unreliable
 * Motion exit transition.
 */
export default function ResourcesMegaPanel() {
  const t = useTranslations();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const closeTimer = React.useRef<number | null>(null);

  const isActive = RESOURCES_PANEL.some(
    (col) => pathname === col.headerHref || pathname.startsWith(col.headerHref),
  );

  const cancelClose = React.useCallback(() => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = React.useCallback(() => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      setOpen(false);
      closeTimer.current = null;
    }, HOVER_CLOSE_DELAY);
  }, [cancelClose]);

  const openNow = React.useCallback(() => {
    cancelClose();
    setOpen(true);
  }, [cancelClose]);

  const closeAndFocusTrigger = React.useCallback(() => {
    cancelClose();
    setOpen(false);
    triggerRef.current?.focus();
  }, [cancelClose]);

  React.useEffect(() => () => cancelClose(), [cancelClose]);

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
        onMouseEnter={openNow}
        onMouseLeave={scheduleClose}
        onKeyDown={handleTriggerKeyDown}
      >
        {t('chrome.nav.resources')}
      </MegaPanelTrigger>
      <div
        ref={panelRef}
        id="resources-mega-panel"
        role="menu"
        aria-label={t('chrome.nav.resources')}
        aria-hidden={!open}
        inert={open ? undefined : true}
        onMouseEnter={openNow}
        onMouseLeave={scheduleClose}
        data-open={open || undefined}
        className={[
          'fixed left-0 right-0 top-[72px] z-[var(--z-dropdown)]',
          'bg-[var(--color-bg)] border-t border-[var(--color-border)] shadow-[var(--shadow-card)]',
          'transition-[opacity,transform] duration-[var(--motion-base)] ease-[var(--easing-standard)]',
          open
            ? 'visible opacity-100 translate-y-0 pointer-events-auto'
            : 'invisible opacity-0 -translate-y-1 pointer-events-none',
        ].join(' ')}
      >
        <div className="mx-auto max-w-[var(--container-wide)] px-4 sm:px-6 lg:px-8 xl:px-12 py-10">
          <div className="grid gap-8 grid-cols-2 max-w-[800px]">
            {RESOURCES_PANEL.map((col) => (
              <div key={col.id}>
                <Link
                  href={col.headerHref}
                  role="menuitem"
                  tabIndex={open ? 0 : -1}
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
                        tabIndex={open ? 0 : -1}
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
      </div>
    </div>
  );
}
