'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import {useTranslations} from 'next-intl';
import {Link, usePathname} from '@/i18n/navigation';
import {useConsent} from '@/hooks/useConsent';

// Phase M.02 — dynamic-import the preferences modal. The modal is 413 LOC
// + @base-ui/react/switch + its own Dialog primitive, and only opens when
// the visitor clicks "Manage preferences". Pulling it out of the always-
// loaded chunk drops it off the sitewide bundle and keeps the banner shell
// itself small. `ssr: false` because the modal is open-state-driven and
// rendering it server-side just emits closed-state markup that ships JS
// for nothing. `loading: () => null` keeps the placeholder invisible
// (the modal opens lazily anyway).
const ConsentPreferencesModal = dynamic(
  () => import('./ConsentPreferencesModal'),
  {ssr: false, loading: () => null},
);

/**
 * Cookie consent banner — Phase B.03.
 *
 * Replaces the Phase 2.10 binary banner. Three buttons (Accept all,
 * Reject all, Manage preferences) plus a small Privacy policy link. The
 * Manage button opens <ConsentPreferencesModal> for granular control.
 *
 * Render gates:
 *   - `NEXT_PUBLIC_ANALYTICS_ENABLED === 'true'`
 *   - consent state is `'pending'` (visitor hasn't chosen yet)
 *   - route is NOT `/request-quote/` (D17 conversion-surface protection,
 *     preserved from Phase 2.10)
 *
 * Animation: slides up from the bottom with a `motion/react` spring after
 * a ~600ms delay (lets above-the-fold content settle so the banner doesn't
 * compete with hero LCP). `MotionConfig reducedMotion="user"` in
 * `<MotionRoot>` automatically swaps to an opacity fade when the visitor
 * has prefers-reduced-motion.
 *
 * Accessibility:
 *   - `role="dialog"`, `aria-labelledby`, `aria-describedby`.
 *   - Focus is moved to the Accept all CTA on mount and trapped between
 *     the four interactive elements (Privacy link, Reject, Manage, Accept).
 *   - ESC is intentionally swallowed (no implicit consent — the visitor
 *     must make an explicit choice).
 *
 * Once a choice is made (Accept all / Reject all / modal Save), the
 * `useConsent` state flips to `'decided'` and this component returns null
 * for the rest of the session.
 */
export default function ConsentBanner() {
  const t = useTranslations('chrome.consent');
  const pathname = usePathname();
  const {state, acceptAll, rejectAll} = useConsent();

  const analyticsEnabled =
    typeof process !== 'undefined' &&
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';

  // usePathname from next-intl strips the locale prefix.
  const onWizardRoute =
    pathname === '/request-quote' || pathname === '/request-quote/';

  // Delay reveal so the banner doesn't compete with hero LCP and so a
  // visitor who immediately clicks something on the page isn't ambushed.
  const [visible, setVisible] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const acceptRef = React.useRef<HTMLButtonElement | null>(null);

  const shouldRender =
    analyticsEnabled && state.status === 'pending' && !onWizardRoute;

  React.useEffect(() => {
    if (!shouldRender) return;
    const id = window.setTimeout(() => setVisible(true), 600);
    return () => window.clearTimeout(id);
  }, [shouldRender]);

  React.useEffect(() => {
    if (!visible) return;
    acceptRef.current?.focus();
  }, [visible]);

  // Focus trap — Tab cycles within the banner's tabbable elements only
  // when the modal is NOT open (the modal does its own trapping).
  React.useEffect(() => {
    if (!visible || modalOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        // Swallow — no implicit consent.
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (e.key !== 'Tab') return;
      const root = containerRef.current;
      if (!root) return;
      const tabbables = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (tabbables.length === 0) return;
      const first = tabbables[0];
      const last = tabbables[tabbables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [visible, modalOpen]);

  if (!shouldRender) return null;

  function handleAccept() {
    acceptAll();
  }
  function handleReject() {
    rejectAll();
  }
  function handleManage() {
    setModalOpen(true);
  }

  return (
    <>
      {/* Phase M.02 — slide-up converted from motion.div to CSS transition.
          Drops the motion/react import that was carrying the runtime into the
          always-loaded layout chunk for one tiny animation. Spring physics
          (stiffness 260, damping 28) is approximated with cubic-bezier
          (0.16, 1, 0.3, 1) — an "ease-out-expo" curve that mimics a spring's
          tail. Reduced-motion honored via the `motion-reduce:` Tailwind variant,
          which sets `transition-property: none` when the user prefers no
          motion (the banner appears at rest with no slide). */}
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby="sunset-consent-heading"
        aria-describedby="sunset-consent-body"
        aria-label={t('ariaLabel')}
        className="motion-safe:transition-[transform,opacity] motion-safe:duration-[360ms] motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 'var(--z-consent, 60)' as unknown as number,
          background: 'var(--color-bg-cream)',
          borderTop: '1px solid var(--color-border-strong)',
          boxShadow: '0 -4px 16px rgba(26,26,26,0.08)',
          paddingTop: 'var(--spacing-4)',
          paddingBottom:
            'max(var(--spacing-4), env(safe-area-inset-bottom))',
          paddingLeft: 'var(--spacing-4)',
          paddingRight: 'var(--spacing-4)',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          opacity: visible ? 1 : 0,
        }}
      >
        <div
          className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8"
          style={{
            maxWidth: 'var(--container-default)',
            marginInline: 'auto',
          }}
        >
          <div style={{minWidth: 0, flex: 1}}>
            <p
              id="sunset-consent-heading"
              className="m-0"
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 'var(--text-body)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-1)',
              }}
            >
              {t('heading')}
            </p>
            <p
              id="sunset-consent-body"
              className="m-0"
              style={{
                fontSize: 'var(--text-body-sm)',
                lineHeight: 'var(--leading-normal)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {t('body')}{' '}
              <Link
                href="/privacy/"
                className="link-inline"
                style={{color: 'var(--color-sunset-green-700)'}}
              >
                {t('banner.privacyLink')}
              </Link>
            </p>
          </div>
          <div
            className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"
            style={{flexShrink: 0}}
          >
            <button
              type="button"
              onClick={handleReject}
              className="btn btn-secondary btn-md"
            >
              {t('banner.rejectAllCta')}
            </button>
            <button
              type="button"
              onClick={handleManage}
              className="btn btn-ghost btn-md"
            >
              {t('banner.manageCta')}
            </button>
            <button
              ref={acceptRef}
              type="button"
              onClick={handleAccept}
              className="btn btn-primary btn-md"
            >
              {t('acceptCta')}
            </button>
          </div>
        </div>
      </div>

      <ConsentPreferencesModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSaved={() => {
          // When Save fires, useConsent flips to 'decided' and the banner
          // unmounts. We close the modal here too so the unmount sequence
          // is clean.
          setModalOpen(false);
        }}
      />
    </>
  );
}
