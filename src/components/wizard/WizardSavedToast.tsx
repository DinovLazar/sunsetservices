'use client';

import * as React from 'react';
import {useTranslations} from 'next-intl';
import {Check, X} from 'lucide-react';

type Props = {
  onClose: () => void;
};

/**
 * Saved confirmation toast — Phase 1.19 §3.9 / §7.1.
 *
 * Visible after the "Save & continue later" link is clicked. Auto-dismisses
 * after 4 seconds; dismiss button closes early.
 */
export default function WizardSavedToast({onClose}: Props) {
  const t = useTranslations();

  React.useEffect(() => {
    const id = window.setTimeout(onClose, 4000);
    return () => window.clearTimeout(id);
  }, [onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={t('wizard.toast.savedAria')}
      className="card card-cream"
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: 'var(--z-toast)' as unknown as number,
        maxWidth: 360,
        padding: 16,
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: 'var(--color-sunset-green-500)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        <Check size={14} color="#FFFFFF" strokeWidth={3} />
      </span>
      <div style={{flex: 1, minWidth: 0}}>
        <p
          className="m-0 font-heading"
          style={{fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)'}}
        >
          {t('wizard.toast.saved')}
        </p>
        <p
          className="m-0 mt-1"
          style={{fontSize: 12, color: 'var(--color-text-muted)'}}
        >
          {t('wizard.toast.savedHint')}
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label={t('wizard.toast.dismiss')}
        className="btn btn-ghost btn-icon"
        style={{
          width: 28,
          height: 28,
          padding: 0,
          flexShrink: 0,
        }}
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
