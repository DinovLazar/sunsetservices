'use client';

import * as React from 'react';
import {useTranslations} from 'next-intl';
import {usePathname} from '@/i18n/navigation';
import {useConsent} from '@/hooks/useConsent';
import {pushDataLayer} from '@/lib/analytics/dataLayer';
import {ANALYTICS_EVENTS} from '@/lib/analytics/events';

/**
 * Cookie consent banner — Phase 2.10.
 *
 * Renders fixed-bottom when:
 *   - `NEXT_PUBLIC_ANALYTICS_ENABLED === 'true'` AND
 *   - consent state is `'unknown'` (visitor has not chosen yet) AND
 *   - the route is NOT `/request-quote/` (D17 conversion-surface protection,
 *     mirrors the chat-bubble + newsletter-signup pattern).
 *
 * Accept → flips consent to `'accepted'`, which lets `<GTMScript>` and
 * `<ClarityScript>` mount and lets `pushDataLayer()` fire. The first push
 * is the `consent_accepted` event itself (so Cowork's GTM tags can pick
 * up the consent decision on the same load).
 *
 * Decline → flips to `'declined'`. No dataLayer push (no consent, no push
 * by design). Banner stays dismissed across reloads via `localStorage`.
 *
 * Phase 3.04 swaps the binary flow for Google Consent Mode v2 with
 * granular categories + Termly/iubenda-generated legal copy.
 */
export default function ConsentBanner() {
  const t = useTranslations('chrome.consent');
  const pathname = usePathname();
  const {state, accept, decline} = useConsent();

  const analyticsEnabled =
    typeof process !== 'undefined' &&
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';

  // Route gate — hidden on /request-quote/ (any locale prefix).
  // `usePathname` from next-intl strips the locale prefix.
  const onWizardRoute =
    pathname === '/request-quote' || pathname === '/request-quote/';

  if (!analyticsEnabled) return null;
  if (state !== 'unknown') return null;
  if (onWizardRoute) return null;

  function handleAccept() {
    accept();
    // After `accept()` flips the localStorage state, the very next push will
    // pass the consent gate inside `pushDataLayer`. The setConsent fires a
    // synchronous CustomEvent, so the gate is up-to-date on the same tick.
    pushDataLayer(ANALYTICS_EVENTS.CONSENT_ACCEPTED);
  }

  function handleDecline() {
    decline();
    // No dataLayer push by design — Decline means no analytics. The banner
    // dismisses via the state change rendered by `useConsent`.
  }

  return (
    <div
      role="region"
      aria-label={t('ariaLabel')}
      className="consent-banner"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 'var(--z-consent, 60)' as unknown as number,
        background: 'var(--color-bg-cream)',
        borderTop: '1px solid var(--color-border-strong)',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.05)',
        paddingTop: 16,
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        paddingLeft: 16,
        paddingRight: 16,
      }}
    >
      <div
        className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6"
        style={{maxWidth: 1200, marginInline: 'auto'}}
      >
        <div style={{minWidth: 0, flex: 1}}>
          <p
            className="m-0"
            style={{
              fontWeight: 600,
              fontSize: 15,
              color: 'var(--color-text-primary)',
              marginBottom: 4,
            }}
          >
            {t('heading')}
          </p>
          <p
            className="m-0"
            style={{
              fontSize: 13,
              lineHeight: 1.45,
              color: 'var(--color-text-secondary)',
            }}
          >
            {t('body')}
          </p>
        </div>
        <div
          className="flex gap-2 flex-wrap"
          style={{flexShrink: 0}}
        >
          <button
            type="button"
            onClick={handleDecline}
            className="btn btn-ghost"
            style={{
              minHeight: 48,
              padding: '12px 20px',
              fontSize: 14,
            }}
          >
            {t('declineCta')}
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="btn btn-primary"
            style={{
              minHeight: 48,
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {t('acceptCta')}
          </button>
        </div>
      </div>
    </div>
  );
}
