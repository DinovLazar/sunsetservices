'use client';

import * as React from 'react';
import {useTranslations} from 'next-intl';
import {WIZARD_STEP_3_FIELDS, type WizardStep3Group} from '@/data/wizard';
import WizardField from './WizardField';
import PhotoUploadField from './PhotoUploadField';
import {type WizardPhoto} from '@/lib/wizard/photo';

type Props = {
  /**
   * Phase M.01e-pt2 — the field group is computed by the WizardShell from
   * (division, propertyType). See `getStep3Group()` in `src/data/wizard.ts`.
   */
  group: WizardStep3Group;
  values: Record<string, string | string[]>;
  onChange: (next: Record<string, string | string[]>) => void;
  errors: Record<string, string>;
  onFieldBlur: (id: string) => void;
  /** Phase B.11 — sibling photo state passed down from WizardShell. */
  photos: WizardPhoto[];
  onPhotosChange: (next: WizardPhoto[]) => void;
  sessionId: string;
  photoUploadEnabled: boolean;
};

/**
 * Step 3 — group-conditional details. Phase 1.19 §3.5, D6.
 * Phase M.01e-pt2 — keyed by Step 3 group (residential / commercial /
 * hardscape) rather than audience.
 *
 * Phase B.11 — the dormant `data-photo-upload-slot` placeholder has been
 * replaced with the real `PhotoUploadField` (D5: universal across all
 * three groups). Mount goes AFTER the group-conditional fields and
 * BEFORE the Step 3 Next button (which lives in WizardStickyNav).
 */
export default function WizardStep3Details({
  group,
  values,
  onChange,
  errors,
  onFieldBlur,
  photos,
  onPhotosChange,
  sessionId,
  photoUploadEnabled,
}: Props) {
  const t = useTranslations();
  const fields = WIZARD_STEP_3_FIELDS[group];

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

      <div className="mt-8">
        <PhotoUploadField
          photos={photos}
          onChange={onPhotosChange}
          sessionId={sessionId}
          disabled={!photoUploadEnabled}
        />
      </div>
    </div>
  );
}
