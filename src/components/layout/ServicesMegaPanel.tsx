'use client';

import * as React from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {useTranslations} from 'next-intl';
import {Link, usePathname} from '@/i18n/navigation';
import {SERVICES_PANEL} from '@/lib/constants/navigation';
import {durations, easings} from '@/components/global/motion/easings';
import MegaPanelTrigger from './MegaPanelTrigger';

/**
 * Desktop "Services" mega-panel. Three audience columns (Residential,
 * Commercial, Hardscape) + a fourth photo column at xl+. Phase M.10
 * post-walkthrough revision (2026-05-26): reverted to click-only — no
 * hover-to-open. Click toggles `open`; keyboard (Enter / Space / Esc /
 * ArrowDown), `aria-expanded`, focus trap, and click-outside-to-close
 * unchanged.
 */
export default function ServicesMegaPanel() {
  const t = useTranslations();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  const isActive = SERVICES_PANEL.some(
    (col) =>
      pathname === col.headerHref ||
      col.children.some((child) => pathname === child.href || pathname.startsWith(child.href)),
  );

  const closeAndFocusTrigger = React.useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

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
        controls="services-mega-panel"
        active={isActive}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleTriggerKeyDown}
      >
        {t('chrome.nav.services')}
      </MegaPanelTrigger>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            id="services-mega-panel"
            role="menu"
            aria-label={t('chrome.nav.services')}
            initial={{opacity: 0, y: -4}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -4}}
            transition={{duration: durations.fast, ease: easings.standard}}
            className="fixed left-0 right-0 top-[72px] z-[var(--z-dropdown)] bg-[var(--color-bg)] border-t border-[var(--color-border)] shadow-[var(--shadow-card)]"
          >
            <div className="mx-auto max-w-[var(--container-wide)] px-4 sm:px-6 lg:px-8 xl:px-12 py-10">
              {/* Phase M.01e — 5-column layout: 4 division columns + 1 service-areas column. */}
              <div className="grid gap-6 lg:gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {SERVICES_PANEL.map((col) => (
                  <div key={col.id}>
                    <Link
                      href={col.headerHref}
                      role="menuitem"
                      className="block pb-2 mb-4 border-b border-[var(--color-border)] text-[var(--color-sunset-green-700)] font-heading font-bold text-[16px] no-underline hover:text-[var(--color-sunset-green-600)]"
                    >
                      {t(col.headerKey)}
                    </Link>
                    <ul className="space-y-3">
                      {col.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            role="menuitem"
                            className="block text-[14px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-sunset-green-700)] no-underline"
                          >
                            {t(child.labelKey)}
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
