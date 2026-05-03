'use client';

import * as React from 'react';
import {Dialog} from '@base-ui/react/dialog';
import {Menu, X, ChevronDown, Phone} from 'lucide-react';
import {motion} from 'motion/react';
import {useTranslations} from 'next-intl';
import {Link, usePathname} from '@/i18n/navigation';
import {
  NAV_TOP_LEVEL,
  RESOURCES_PANEL,
  SERVICES_PANEL,
  type TopNavItem,
} from '@/lib/constants/navigation';
import {BUSINESS_PHONE, BUSINESS_PHONE_TEL} from '@/lib/constants/business';
import {useBodyScrollLock} from '@/hooks/useBodyScrollLock';
import {staggerItem} from '@/components/global/motion/stagger';
import LanguageSwitcher from './LanguageSwitcher';

type NavbarMobileProps = {
  /** Server-rendered Logo with the light skin (uses next-intl/server). */
  logo: React.ReactNode;
};

const drawerStaggerContainer = {
  initial: {},
  animate: {transition: {staggerChildren: 0.08, delayChildren: 0.24}},
};

/**
 * Mobile navbar — 64px row with phone (left), centered logo, hamburger
 * (right). The drawer uses @base-ui/react's Dialog primitive for focus
 * trap, Esc-to-close, and backdrop click. Slide-in animation is keyed off
 * base-ui's data-starting-style / data-ending-style attributes (Phase 1.05
 * §4.5). Body scroll is locked via the useBodyScrollLock hook on top of
 * whatever base-ui ships, to be safe across browsers.
 */
export default function NavbarMobile({logo}: NavbarMobileProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [expanded, setExpanded] = React.useState<'services' | 'resources' | null>(null);
  useBodyScrollLock(open);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setExpanded(null);
  };

  const handleNavigate = () => {
    setOpen(false);
    setExpanded(null);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <div className="lg:hidden flex items-center justify-between h-16 px-4">
        <a
          href={`tel:${BUSINESS_PHONE_TEL}`}
          aria-label={t('chrome.cta.callUs.linkLabel')}
          data-cr-tracking="navbar-mobile-phone"
          className="inline-flex items-center justify-center w-11 h-11 rounded-md border border-[var(--color-border)] hover:border-[var(--color-border-strong)] text-[var(--color-sunset-green-700)] no-underline shrink-0"
        >
          <Phone className="size-[22px]" aria-hidden="true" />
        </a>
        <div className="flex-1 flex justify-center min-w-0">{logo}</div>
        <Dialog.Trigger
          render={
            <button
              type="button"
              aria-label={t('chrome.mobile.openMenu')}
              aria-controls="mobile-drawer"
              className="inline-flex items-center justify-center w-11 h-11 rounded-md border border-[var(--color-border)] hover:border-[var(--color-border-strong)] bg-transparent shrink-0"
            />
          }
        >
          <Menu className="size-6 text-[var(--color-text-primary)]" aria-hidden="true" />
        </Dialog.Trigger>
      </div>

      <Dialog.Portal>
        <Dialog.Backdrop
          className={[
            'fixed inset-0 bg-[var(--color-overlay-50)] z-[var(--z-overlay)]',
            'transition-opacity duration-[var(--motion-fast)] ease-[var(--easing-standard)]',
            'opacity-100',
            'data-[starting-style]:opacity-0',
            'data-[ending-style]:opacity-0',
          ].join(' ')}
        />
        <Dialog.Popup
          id="mobile-drawer"
          aria-modal="true"
          aria-labelledby="mobile-drawer-title"
          className={[
            'fixed top-0 right-0 h-[100dvh] w-[min(320px,85vw)] sm:w-[380px]',
            'bg-[var(--color-bg)] z-[calc(var(--z-overlay)+1)] shadow-[var(--shadow-card)]',
            'flex flex-col outline-none',
            'transition-[transform,opacity] duration-[var(--motion-base)] ease-[cubic-bezier(0.16,1,0.3,1)]',
            'translate-x-0 opacity-100',
            'data-[starting-style]:translate-x-full data-[starting-style]:opacity-0',
            'data-[ending-style]:translate-x-full data-[ending-style]:opacity-0',
            'motion-reduce:transition-opacity motion-reduce:duration-[var(--motion-fast)]',
            'motion-reduce:data-[starting-style]:translate-x-0',
            'motion-reduce:data-[ending-style]:translate-x-0',
          ].join(' ')}
        >
          <Dialog.Title
            render={<h2 id="mobile-drawer-title" />}
            className="sr-only"
          >
            {t('chrome.mobile.drawerTitle')}
          </Dialog.Title>

          {/* Header */}
          <div className="flex items-center gap-3 px-3 h-16 border-b border-[var(--color-border)] shrink-0">
            <Dialog.Close
              render={
                <button
                  type="button"
                  aria-label={t('chrome.mobile.closeMenu')}
                  className="inline-flex items-center justify-center w-11 h-11 rounded-md border border-[var(--color-border)] hover:border-[var(--color-border-strong)] bg-transparent shrink-0"
                />
              }
            >
              <X className="size-6 text-[var(--color-text-primary)]" aria-hidden="true" />
            </Dialog.Close>
            <span className="font-heading font-bold text-[12px] uppercase tracking-[0.12em] text-[var(--color-sunset-green-700)]">
              {t('chrome.mobile.menuEyebrow')}
            </span>
          </div>

          {/* Scrollable middle */}
          <div className="flex-1 overflow-y-auto">
            <nav aria-label={t('chrome.nav.primaryAriaLabel')} className="py-2">
              <motion.ul
                initial="initial"
                animate="animate"
                variants={drawerStaggerContainer}
                className="list-none m-0 p-0"
              >
                {NAV_TOP_LEVEL.map((item) => (
                  <motion.li key={item.id} variants={staggerItem}>
                    {item.kind === 'mega-panel' ? (
                      <DrawerAccordion
                        item={item}
                        expanded={expanded === item.id}
                        onToggle={() =>
                          setExpanded((prev) => (prev === item.id ? null : item.id))
                        }
                        onNavigate={handleNavigate}
                      />
                    ) : (
                      <Link
                        href={item.href}
                        aria-current={pathname === item.href ? 'page' : undefined}
                        onClick={handleNavigate}
                        className={[
                          'flex items-center px-6 h-12 text-[18px] font-heading text-[var(--color-text-primary)] no-underline hover:bg-[var(--color-sunset-green-50)]',
                          pathname === item.href ? 'font-bold' : 'font-semibold',
                        ].join(' ')}
                      >
                        {t(item.labelKey)}
                      </Link>
                    )}
                  </motion.li>
                ))}
              </motion.ul>
            </nav>

            <hr className="border-t border-[var(--color-border)] mx-6 my-4" />

            <div className="px-6 py-2">
              <p className="text-[14px] text-[var(--color-text-muted)] mb-2">
                {t('chrome.lang.groupLabel')}
              </p>
              <LanguageSwitcher surface="light" size="md" />
            </div>

            <hr className="border-t border-[var(--color-border)] mx-6 my-4" />

            <div className="px-6 py-2 pb-6">
              <p className="text-[14px] text-[var(--color-text-muted)] mb-2">
                {t('chrome.cta.callUs.label')}
              </p>
              <a
                href={`tel:${BUSINESS_PHONE_TEL}`}
                data-cr-tracking="navbar-mobile-drawer-phone"
                onClick={handleNavigate}
                className="inline-flex items-center gap-2 text-[var(--color-sunset-green-700)] font-heading font-semibold text-[24px] no-underline"
              >
                <Phone className="size-5" aria-hidden="true" />
                {BUSINESS_PHONE}
              </a>
            </div>
          </div>

          {/* Sticky CTA */}
          <div className="p-4 border-t border-[var(--color-border)] shrink-0">
            <Link
              href="/request-quote/"
              onClick={handleNavigate}
              className="btn btn-amber btn-md w-full"
            >
              {t('chrome.cta.getQuote')}
            </Link>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

type DrawerAccordionProps = {
  item: Extract<TopNavItem, {kind: 'mega-panel'}>;
  expanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
};

function DrawerAccordion({item, expanded, onToggle, onNavigate}: DrawerAccordionProps) {
  const t = useTranslations();

  const rows: Array<{labelKey: string; href: string; isHeader: boolean; rowKey: string}> =
    item.id === 'services'
      ? SERVICES_PANEL.flatMap((col) => [
          {labelKey: col.headerKey, href: col.headerHref, isHeader: true, rowKey: `${col.id}-h`},
          ...col.children.map((child) => ({
            labelKey: child.labelKey,
            href: child.href,
            isHeader: false,
            rowKey: child.href,
          })),
        ])
      : RESOURCES_PANEL.flatMap((col) => [
          {labelKey: col.headerKey, href: col.headerHref, isHeader: true, rowKey: `${col.id}-h`},
          ...col.placeholderKeys.map((key) => ({
            labelKey: key,
            href: col.headerHref,
            isHeader: false,
            rowKey: `${col.id}-${key}`,
          })),
        ]);

  return (
    <div>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={`drawer-${item.id}-panel`}
        onClick={onToggle}
        className="flex items-center justify-between w-full px-6 h-12 text-[18px] font-heading font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-sunset-green-50)] cursor-pointer bg-transparent border-0 text-left"
      >
        <span>{t(item.labelKey)}</span>
        <ChevronDown
          className={[
            'size-5 transition-transform duration-[var(--motion-fast)] ease-[var(--easing-standard)]',
            expanded ? 'rotate-180' : '',
          ].join(' ')}
          aria-hidden="true"
        />
      </button>
      {expanded && (
        <ul id={`drawer-${item.id}-panel`} className="list-none m-0 p-0 pb-2">
          {rows.map((row) => (
            <li key={row.rowKey}>
              <Link
                href={row.href}
                onClick={onNavigate}
                className={[
                  'flex items-center pl-10 pr-6 h-10 text-[15px] no-underline',
                  row.isHeader
                    ? 'text-[var(--color-sunset-green-700)] font-semibold'
                    : 'text-[var(--color-text-secondary)]',
                  'hover:bg-[var(--color-sunset-green-50)]',
                ].join(' ')}
              >
                {t(row.labelKey)}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
