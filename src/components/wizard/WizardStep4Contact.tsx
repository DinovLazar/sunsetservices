'use client';

import * as React from 'react';
import {useTranslations} from 'next-intl';
import {WIZARD_STEP_4_FIELDS, WIZARD_PROPERTY_TYPE_FIELD, type WizardPropertyType} from '@/data/wizard';
import {BUSINESS_PHONE_TEL} from '@/lib/constants/business';
import {WIZARD_EVENTS, fireWizardEvent} from '@/lib/wizard/events';
import {useGooglePlacesAutocomplete} from '@/lib/google/placesAutocomplete';
import WizardField from './WizardField';

export type Step4Values = {
  /**
   * Phase M.01e-pt2 — required residential/commercial radio at the top of
   * Step 4. Empty string is the unselected state; the validator blocks Next
   * until one of `'residential'` or `'commercial'` is picked.
   */
  propertyType: WizardPropertyType | '';
  firstName: string; lastName: string; email: string; phone: string;
  street: string; unit: string; city: string; state: string; zip: string;
  bestTime: string; contactMethod: string;
};

type Props = {
  values: Step4Values;
  onChange: (next: Step4Values) => void;
  errors: Record<string, string>;
  onFieldBlur: (id: string) => void;
};

/**
 * Step 4 — contact info. Phase 1.19 §3.6, D7. Phase B.10 wires the
 * Google Places autocomplete onto the street field per the
 * `Sunset-Services-Decisions.md` 2026-05-19 entry. Phase M.01e-pt2 adds the
 * required propertyType radio at the top.
 *
 * Required: propertyType (NEW M.01e-pt2), firstName, lastName, email, phone,
 * street, city, state (IL default), zip. Optional: unit, bestTime,
 * contactMethod. Phone field auto-formats via `formatPhoneUS`. The street
 * wrapper carries `data-autocomplete-state` (loading|ready|error|disabled).
 *
 * **PII boundary** — none of these values pass through autosave. They
 * live in React state only.
 */
export default function WizardStep4Contact({
  values,
  onChange,
  errors,
  onFieldBlur,
}: Props) {
  const t = useTranslations();
  const streetInputRef = React.useRef<HTMLInputElement | null>(null);

  // Fresh closure each render — the hook's internal ref keeps the
  // place_changed listener stable while always firing the LATEST
  // closure (which captures the LATEST `values` + `onChange`).
  const handlePlaceSelect = (
    fields: Partial<Pick<Step4Values, 'street' | 'city' | 'state' | 'zip'>>,
  ) => {
    const next: Step4Values = {...values};
    let changed = false;
    if (fields.street != null) {
      next.street = fields.street;
      changed = true;
    }
    if (fields.city != null) {
      next.city = fields.city;
      changed = true;
    }
    if (fields.state != null) {
      next.state = fields.state;
      changed = true;
    }
    if (fields.zip != null) {
      next.zip = fields.zip;
      changed = true;
    }
    if (changed) {
      onChange(next);
      fireWizardEvent(WIZARD_EVENTS.ADDRESS_AUTOCOMPLETED, {
        step: 4,
        source: 'autocomplete',
      });
    }
  };

  const {state: autocompleteState} = useGooglePlacesAutocomplete({
    inputRef: streetInputRef,
    onPlaceSelect: handlePlaceSelect,
  });

  function setField(id: string, value: string | string[]) {
    onChange({...values, [id]: value as string});
  }

  function setPropertyType(next: string | string[]) {
    const v = (typeof next === 'string' ? next : '') as WizardPropertyType | '';
    onChange({...values, propertyType: v});
    if (v === 'residential' || v === 'commercial') {
      fireWizardEvent(WIZARD_EVENTS.PROPERTY_TYPE_SELECTED, {propertyType: v});
    }
  }

  // Layout: paired rows for desktop, stack for mobile.
  const fieldById = Object.fromEntries(
    WIZARD_STEP_4_FIELDS.map((f) => [f.id, f]),
  );

  const helperLineStyle: React.CSSProperties = {
    fontSize: 13,
    color: 'var(--color-text-muted)',
    margin: '6px 0 0 0',
  };

  return (
    <div>
      <h2
        id="wizard-step4-h2"
        className="m-0 font-heading"
        style={{
          fontSize: 'var(--text-h2)',
          fontWeight: 600,
          letterSpacing: 'var(--tracking-snug)',
        }}
      >
        {t('wizard.step4.title')}
      </h2>
      <p
        className="m-0 mt-2"
        style={{fontSize: 'var(--text-body-lg)', color: 'var(--color-text-secondary)'}}
      >
        {t('wizard.step4.subtitle')}
      </p>

      {/* Property type — Phase M.01e-pt2. Required. Renders FIRST. */}
      <p
        className="m-0 mt-8 mb-3 font-heading font-semibold uppercase"
        style={{
          fontSize: 13,
          letterSpacing: 'var(--tracking-eyebrow)',
          color: 'var(--color-sunset-green-700)',
        }}
      >
        {t('wizard.step4.propertyType.section')}
      </p>
      <div
        aria-hidden="true"
        style={{height: 1, background: 'var(--color-border)', marginBottom: 24}}
      />
      <WizardField
        field={WIZARD_PROPERTY_TYPE_FIELD}
        value={values.propertyType}
        onChange={setPropertyType}
        onBlur={() => onFieldBlur('propertyType')}
        error={errors.propertyType}
        idPrefix="wiz-step4"
      />

      {/* Name + email + phone row */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-6">
        <WizardField
          field={fieldById['firstName']}
          value={values.firstName}
          onChange={(v) => setField('firstName', v)}
          onBlur={() => onFieldBlur('firstName')}
          error={errors.firstName}
          idPrefix="wiz-step4"
        />
        <WizardField
          field={fieldById['lastName']}
          value={values.lastName}
          onChange={(v) => setField('lastName', v)}
          onBlur={() => onFieldBlur('lastName')}
          error={errors.lastName}
          idPrefix="wiz-step4"
        />
        <WizardField
          field={fieldById['email']}
          value={values.email}
          onChange={(v) => setField('email', v)}
          onBlur={() => onFieldBlur('email')}
          error={errors.email}
          idPrefix="wiz-step4"
        />
        <div>
          <WizardField
            field={fieldById['phone']}
            value={values.phone}
            onChange={(v) => setField('phone', v)}
            onBlur={() => onFieldBlur('phone')}
            error={errors.phone}
            idPrefix="wiz-step4"
          />
          <a
            href={`tel:${BUSINESS_PHONE_TEL}`}
            className="link link-inline mt-2 inline-block"
            data-analytics-event={WIZARD_EVENTS.CALL_LINK_CLICKED}
            style={{
              fontSize: 13,
              color: 'var(--color-sunset-green-700)',
            }}
          >
            {t('wizard.field.callUs')}
          </a>
        </div>
      </div>

      {/* Address section */}
      <p
        className="m-0 mt-10 mb-3 font-heading font-semibold uppercase"
        style={{
          fontSize: 13,
          letterSpacing: 'var(--tracking-eyebrow)',
          color: 'var(--color-sunset-green-700)',
        }}
      >
        {t('wizard.address.section')}
      </p>
      <div
        aria-hidden="true"
        style={{height: 1, background: 'var(--color-border)', marginBottom: 24}}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-x-6 gap-y-6">
        <div data-autocomplete-state={autocompleteState}>
          <WizardField
            field={fieldById['street']}
            value={values.street}
            onChange={(v) => setField('street', v)}
            onBlur={() => onFieldBlur('street')}
            error={errors.street}
            idPrefix="wiz-step4"
            inputRef={streetInputRef}
          />
          {autocompleteState === 'loading' ? (
            <p
              data-autocomplete-helper="loading"
              style={helperLineStyle}
              aria-live="polite"
            >
              {t('wizard.step4.address.autocompleteLoading')}
            </p>
          ) : null}
          {autocompleteState === 'error' ? (
            <p
              data-autocomplete-helper="error"
              style={helperLineStyle}
              aria-live="polite"
            >
              {t('wizard.step4.address.autocompleteError')}
            </p>
          ) : null}
        </div>
        <WizardField
          field={fieldById['unit']}
          value={values.unit}
          onChange={(v) => setField('unit', v)}
          onBlur={() => onFieldBlur('unit')}
          idPrefix="wiz-step4"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-[1fr_180px_140px] gap-x-6 gap-y-6">
        <WizardField
          field={fieldById['city']}
          value={values.city}
          onChange={(v) => setField('city', v)}
          onBlur={() => onFieldBlur('city')}
          error={errors.city}
          idPrefix="wiz-step4"
        />
        <WizardField
          field={fieldById['state']}
          value={values.state}
          onChange={(v) => setField('state', v)}
          onBlur={() => onFieldBlur('state')}
          error={errors.state}
          idPrefix="wiz-step4"
        />
        <WizardField
          field={fieldById['zip']}
          value={values.zip}
          onChange={(v) => setField('zip', v)}
          onBlur={() => onFieldBlur('zip')}
          error={errors.zip}
          idPrefix="wiz-step4"
        />
      </div>

      {/* Optional preferences section */}
      <p
        className="m-0 mt-10 mb-3 font-heading font-semibold uppercase"
        style={{
          fontSize: 13,
          letterSpacing: 'var(--tracking-eyebrow)',
          color: 'var(--color-sunset-green-700)',
        }}
      >
        {t('wizard.preferences.section')}
      </p>
      <div
        aria-hidden="true"
        style={{height: 1, background: 'var(--color-border)', marginBottom: 24}}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-6">
        <WizardField
          field={fieldById['bestTime']}
          value={values.bestTime}
          onChange={(v) => setField('bestTime', v as string)}
          onBlur={() => onFieldBlur('bestTime')}
          idPrefix="wiz-step4"
        />
        <WizardField
          field={fieldById['contactMethod']}
          value={values.contactMethod}
          onChange={(v) => setField('contactMethod', v as string)}
          onBlur={() => onFieldBlur('contactMethod')}
          idPrefix="wiz-step4"
        />
      </div>
    </div>
  );
}
