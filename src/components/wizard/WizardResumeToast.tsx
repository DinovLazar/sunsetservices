'use client';

import * as React from 'react';
import {useTranslations} from 'next-intl';
import {WIZARD_EVENTS} from '@/lib/wizard/events';

type Props = {
  onResume: () => void;
  onDismiss: () => void;
};

/**
 * Resume toast — Phase 1.19 §7.1 D9.
 *
 * "Welcome back — pick up where you left off?" + Resume / Start fresh.
 * "Stored on this device only." copy is mandatory per ratified D9 (PII
 * boundary disclosure).
 */
export default function WizardResumeToast({onResume, onDismiss}: Props) {
  const t = useTranslations();
  return (
    <div
      role="status"
      aria-live="polite"
      className="card card-cream"
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: 'var(--z-toast)' as unknown as number,
        maxWidth: 360,
        padding: 20,
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <p
        className="m-0 font-heading"
        style={{fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)'}}
      >
        {t('wizard.toast.resume')}
      </p>
      <p
        className="m-0 mt-1"
        style={{fontSize: 12, color: 'var(--color-text-muted)'}}
      >
        {t('wizard.toast.resumeHint')}
      </p>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={onResume}
          data-analytics-event={WIZARD_EVENTS.RESUME_ACCEPTED}
          className="btn btn-primary btn-md"
          style={{minWidth: 110}}
        >
          {t('wizard.toast.resumeBtn')}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          data-analytics-event={WIZARD_EVENTS.RESUME_DISMISSED}
          className="btn btn-ghost btn-md"
        >
          {t('wizard.toast.resumeDismiss')}
        </button>
      </div>
    </div>
  );
}
