'use client';

import * as React from 'react';
import {useTranslations} from 'next-intl';
import {WIZARD_STEP_3_FIELDS, type WizardAudience} from '@/data/wizard';
import WizardField from './WizardField';

type Props = {
  audience: WizardAudience;
  values: Record<string, string | string[]>;
  onChange: (next: Record<string, string | string[]>) => void;
  errors: Record<string, string>;
  onFieldBlur: (id: string) => void;
};

/**
 * Step 3 — audience-conditional details. Phase 1.19 §3.5, D6.
 *
 * Field map per audience comes from `WIZARD_STEP_3_FIELDS`. A `data-photo-upload-slot`
 * placeholder is rendered (D11=B) for Part 2 to swap; no real file input.
 */
export default function WizardStep3Details({
  audience,
  values,
  onChange,
  errors,
  onFieldBlur,
}: Props) {
  const t = useTranslations();
  const fields = WIZARD_STEP_3_FIELDS[audience];

  return (
    <div>
      <h2
        id="wizard-step3-h2"
        className="m-0 font-heading"
        style={{
          fontSize: 'var(--text-h2)',
          fontWeight: 600,
          letterSpacing: 'var(--tracking-snug)',
        }}
      >
        {t('wizard.step3.title')}
      </h2>
      <p
        className="m-0 mt-2"
        style={{fontSize: 'var(--text-body-lg)', color: 'var(--color-text-secondary)'}}
      >
        {t('wizard.step3.helper')}
      </p>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-6">
        {fields.map((field) => {
          const isWide = field.kind === 'textarea' || field.kind === 'checkbox-group';
          const value = values[field.id] ?? (field.kind === 'checkbox-group' ? [] : '');
          const error = errors[field.id];
          return (
            <div
              key={field.id}
              className={isWide ? 'lg:col-span-2' : ''}
            >
              <WizardField
                field={field}
                value={value}
                onChange={(next) => onChange({...values, [field.id]: next})}
                onBlur={() => onFieldBlur(field.id)}
                error={error}
                idPrefix="wiz-step3"
              />
            </div>
          );
        })}
      </div>

      {/* Photo-upload placeholder slot — Part 2 (D11 = B). */}
      <div
        data-photo-upload-slot="true"
        hidden
        aria-hidden="true"
      />
    </div>
  );
}
