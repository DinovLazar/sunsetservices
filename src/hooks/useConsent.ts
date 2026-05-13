'use client';

import {useCallback, useEffect, useState} from 'react';
import {
  getConsent,
  setConsent,
  subscribeConsent,
  type ConsentState,
} from '@/lib/analytics/consent';

/**
 * useConsent — Phase 2.10.
 *
 * Thin React hook around `src/lib/analytics/consent`. The first render
 * always returns `'unknown'` to keep the SSR snapshot deterministic; the
 * client hydrates the real value in the mount effect, then live-updates
 * whenever `setConsent()` fires the `sunset:consent-changed` event.
 */
export function useConsent() {
  const [state, setState] = useState<ConsentState>('unknown');

  useEffect(() => {
    setState(getConsent());
    return subscribeConsent(setState);
  }, []);

  const accept = useCallback(() => setConsent('accepted'), []);
  const decline = useCallback(() => setConsent('declined'), []);

  return {state, accept, decline};
}
