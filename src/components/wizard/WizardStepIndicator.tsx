'use client';

import * as React from 'react';
import {useTranslations} from 'next-intl';
import {Check} from 'lucide-react';

/**
 * Step indicator — Phase 1.19 §3.2.
 *
 * Desktop: numbered dots + labels with completed-clickable, upcoming-disabled.
 * Mobile: labeled progress bar "STEP {n} OF 5 · {label}".
 *
 * Client-side because the "click completed step" handler must dispatch back
 * to WizardShell. The visual is otherwise pure-CSS and all aria attributes
 * stay accurate when the URL `?step=` changes.
 */

const STEP_LABEL_KEYS = [
  'wizard.step.1',
  'wizard.step.2',
  'wizard.step.3',
  'wizard.step.4',
  'wizard.step.5',
] as const;

type Props = {
  current: 1 | 2 | 3 | 4 | 5;
  completed: ReadonlyArray<1 | 2 | 3 | 4 | 5>;
  onJump: (step: 1 | 2 | 3 | 4 | 5) => void;
};

export default function WizardStepIndicator({current, completed, onJump}: Props) {
  const t = useTranslations();

  const labels = STEP_LABEL_KEYS.map((k) => t(k));
  const currentLabel = labels[current - 1];

  return (
    <>
      {/* Mobile bar */}
      <div className="lg:hidden" role="presentation">
        <p
          className="m-0 mb-2 font-heading font-semibold uppercase"
          style={{
            fontSize: 12,
            letterSpacing: 'var(--tracking-eyebrow)',
            color: 'var(--color-sunset-green-700)',
          }}
        >
          {t('wizard.indicator.mobileLabel', {n: current, label: currentLabel.toUpperCase()})}
        </p>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={5}
          aria-valuenow={current}
          aria-label={t('wizard.indicator.ariaLabel')}
          style={{
            width: '100%',
            height: 6,
            background: 'var(--color-border)',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${(current / 5) * 100}%`,
              height: '100%',
              background: 'var(--color-sunset-green-500)',
              transition: 'width var(--motion-base) var(--easing-soft)',
            }}
          />
        </div>
      </div>

      {/* Desktop dots */}
      <ol
        className="hidden lg:flex"
        aria-label={t('wizard.indicator.ariaLabel')}
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          position: 'relative',
        }}
      >
        {/* Connector line */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 22,
            right: 22,
            top: 22,
            height: 2,
            background: 'var(--color-border)',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 22,
            top: 22,
            height: 2,
            background: 'var(--color-sunset-green-700)',
            width: `calc(${((current - 1) / 4) * 100}% - 22px)`,
            transition: 'width var(--motion-base) var(--easing-soft)',
          }}
        />
        {([1, 2, 3, 4, 5] as const).map((n) => {
          const isCurrent = n === current;
          const isCompleted = completed.includes(n) && n < current;
          const isUpcoming = !isCompleted && !isCurrent;
          const label = labels[n - 1];
          return (
            <li
              key={n}
              aria-current={isCurrent ? 'step' : undefined}
              data-disabled={isUpcoming ? 'true' : undefined}
              style={{
                position: 'relative',
                flex: '1 1 0',
                textAlign: 'center',
                zIndex: 1,
              }}
            >
              {isCompleted ? (
                <button
                  type="button"
                  onClick={() => onJump(n)}
                  data-analytics-event={`wizard_edit_step_${n}`}
                  aria-label={`${t('wizard.step.' + n)} — ${t('wizard.indicator.completed')}`}
                  style={dotButtonStyle('completed')}
                >
                  <Check aria-hidden="true" size={18} strokeWidth={3} />
                </button>
              ) : (
                <span
                  style={{
                    ...dotButtonStyle(isCurrent ? 'current' : 'upcoming'),
                    cursor: 'default',
                  }}
                >
                  {n}
                </span>
              )}
              <span
                className="block mt-3 font-heading"
                style={{
                  fontSize: 13,
                  fontWeight: isCurrent ? 700 : 600,
                  color: isCurrent
                    ? 'var(--color-text-primary)'
                    : isCompleted
                      ? 'var(--color-sunset-green-700)'
                      : 'var(--color-text-muted)',
                }}
              >
                {label}
              </span>
              {isCurrent ? (
                <span
                  className="block mt-1"
                  style={{
                    fontSize: 11,
                    color: 'var(--color-text-muted)',
                    letterSpacing: 'var(--tracking-eyebrow)',
                  }}
                >
                  {t('wizard.indicator.current')}
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </>
  );
}

function dotButtonStyle(state: 'current' | 'completed' | 'upcoming'): React.CSSProperties {
  const base: React.CSSProperties = {
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-heading)',
    fontWeight: 700,
    fontSize: 15,
    border: 'none',
    transition: 'background-color var(--motion-base), color var(--motion-base)',
  };
  if (state === 'current') {
    return {
      ...base,
      background: 'var(--color-sunset-green-500)',
      color: 'var(--color-text-on-green)',
      boxShadow: '0 0 0 6px var(--color-sunset-green-100)',
    };
  }
  if (state === 'completed') {
    return {
      ...base,
      background: 'var(--color-sunset-green-700)',
      color: 'var(--color-text-on-green)',
      cursor: 'pointer',
    };
  }
  return {
    ...base,
    background: 'var(--color-bg)',
    color: 'var(--color-text-muted)',
    border: '2px solid var(--color-border)',
  };
}
