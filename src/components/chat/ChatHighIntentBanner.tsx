'use client';

import * as React from 'react';
import {Check, X} from 'lucide-react';
import {useTranslations} from 'next-intl';

type Props = {
  visible: boolean;
  onDismiss: () => void;
};

/**
 * High-intent escalation banner. Phase 1.19 §4.9, D27.
 *
 * Slides down from above the composer; auto-dismisses after 6s. Part 1 ships
 * the slot; Phase 2.09 fires it on intent classification. In Part 1 the
 * `visible` prop is always `false`, so the component renders nothing — saves
 * the `setTimeout` cost.
 */
export default function ChatHighIntentBanner({visible, onDismiss}: Props) {
  const t = useTranslations('chat.banner');

  React.useEffect(() => {
    if (!visible) return;
    const id = window.setTimeout(onDismiss, 6000);
    return () => window.clearTimeout(id);
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        background: 'var(--color-sunset-green-100)',
        borderBottom: '1px solid var(--color-sunset-green-300)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'var(--color-sunset-green-500)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Check size={12} color="#FFFFFF" strokeWidth={3} />
      </span>
      <p
        className="m-0"
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          flex: 1,
        }}
      >
        {t('highIntent')}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{
          background: 'transparent',
          border: 'none',
          padding: 4,
          cursor: 'pointer',
          color: 'var(--color-text-primary)',
        }}
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
