'use client';

import {useCallback, useSyncExternalStore} from 'react';
import {
  getConsent,
  setConsent,
  subscribeConsent,
} from '@/lib/analytics/consent';
import {
  ACCEPT_ALL,
  REJECT_ALL,
  type ConsentSignals,
  type ConsentState,
} from '@/types/consent';

const PENDING: ConsentState = {status: 'pending'};

function subscribe(onChange: () => void) {
  return subscribeConsent(() => onChange());
}

function serverSnapshot(): ConsentState {
  return PENDING;
}

/**
 * useConsent — Phase B.03 (refactored from Phase 2.10 binary).
 *
 * Uses `useSyncExternalStore` so the consent state is read from
 * localStorage during render (consistent with the upstream store) and
 * tracks changes via the `sunset:consent-changed` CustomEvent.
 *
 * The SSR snapshot is always `pending` — the hydration pass picks up
 * the real value on the client. There's no double-render flicker
 * (useSyncExternalStore is React-19-aware).
 *
 * Action helpers:
 *   acceptAll()     — all signals granted
 *   rejectAll()     — all signals denied (necessary stays granted)
 *   save(signals)   — write granular per-category state (from the modal)
 */
export function useConsent() {
  const state = useSyncExternalStore(subscribe, getConsent, serverSnapshot);

  const acceptAll = useCallback(() => {
    setConsent({
      analytics: ACCEPT_ALL.analytics,
      marketing: ACCEPT_ALL.marketing,
      personalization: ACCEPT_ALL.personalization,
    });
  }, []);

  const rejectAll = useCallback(() => {
    setConsent({
      analytics: REJECT_ALL.analytics,
      marketing: REJECT_ALL.marketing,
      personalization: REJECT_ALL.personalization,
    });
  }, []);

  const save = useCallback((signals: Omit<ConsentSignals, 'necessary'>) => {
    setConsent(signals);
  }, []);

  return {state, acceptAll, rejectAll, save};
}
