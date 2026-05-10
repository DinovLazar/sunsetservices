'use client';

import * as React from 'react';
import {useTranslations} from 'next-intl';
import {WIZARD_EVENTS} from '@/lib/wizard/events';

type Props = {
  step: 1 | 2 | 3 | 4;
  onNext: () => void;
  onBack: () => void;
  onSave: () => void;
  showInline?: boolean;
};

/**
 * Wizard step navigation. Phase 1.19 §3.9, D9, D12.
 *
 * **Single Next button** — one DOM `<button>` rendered once. CSS positions
 * it differently between mobile (sticky bar at `--z-sticky`) and desktop
 * (inline at form footer). Critical for a11y (no duplicate accessible name)
 * and Lighthouse (one fewer paint target). 1.07 P=86 lesson.
 */
export default function WizardStickyNav({step, onNext, onBack, onSave, showInline = true}: Props) {
  const t = useTranslations();
  return (
    <>
      {/* Save & continue later — desktop above the sticky bar */}
      {showInline ? (
        <div className="hidden lg:block mt-6">
          <button
            type="button"
            onClick={onSave}
            data-analytics-event={WIZARD_EVENTS.SAVE_LINK_CLICKED}
            className="link link-inline"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              color: 'var(--color-sunset-green-700)',
              fontWeight: 500,
            }}
          >
            {t('wizard.btn.save')}
          </button>
        </div>
      ) : null}

      {/* Single button row — CSS positions for mobile sticky vs desktop inline. */}
      <div
        className="wizard-nav-row"
        style={{
          marginTop: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {step > 1 ? (
          <button
            type="button"
            onClick={onBack}
            data-analytics-event={WIZARD_EVENTS.BACK_CLICKED}
            className="btn btn-secondary btn-md"
            style={{minWidth: 100}}
          >
            {t('wizard.btn.back')}
          </button>
        ) : (
          <span style={{flex: '0 0 auto'}} aria-hidden="true" />
        )}
        <button
          type="submit"
          data-analytics-event={WIZARD_EVENTS.STEP_COMPLETED(step)}
          className="btn btn-primary btn-lg"
          style={{minWidth: 180, flex: '1 1 auto', maxWidth: 280}}
          onClick={(e) => {
            e.preventDefault();
            onNext();
          }}
        >
          {t('wizard.btn.next')}
        </button>
      </div>

      {/* Mobile-only Save & continue later (above sticky-Next bar) */}
      <div className="lg:hidden mt-3 text-center">
        <button
          type="button"
          onClick={onSave}
          data-analytics-event={WIZARD_EVENTS.SAVE_LINK_CLICKED}
          className="link link-inline"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            color: 'var(--color-sunset-green-700)',
            fontWeight: 500,
          }}
        >
          {t('wizard.btn.save')}
        </button>
      </div>
    </>
  );
}
