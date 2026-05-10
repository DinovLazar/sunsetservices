'use client';

import * as React from 'react';
import {useTranslations} from 'next-intl';
import type {WizardFieldDef} from '@/data/wizard';
import {US_STATES} from '@/data/wizard';
import {formatPhoneUS, digitsOnly} from '@/lib/wizard/validation';

/**
 * WizardField — primitive that renders a single field per `WizardFieldDef`.
 * Composes the locked Phase 1.11 ContactForm field primitives (`field`,
 * `field-label`, `field-input`, etc.) and accepts a `density` prop so the
 * chat lead-capture form can render at the `compact` extension declared in
 * Phase 1.19 §11.1. Wizard steps always use default density.
 *
 * `aria-invalid`, `aria-describedby`, and `role="alert"` on the error span
 * follow Phase 1.11 ContactForm precedent.
 */

export type FieldDensity = 'default' | 'compact';

export type WizardFieldProps = {
  field: WizardFieldDef;
  value: string | string[];
  onChange: (next: string | string[]) => void;
  onBlur?: () => void;
  error?: string;
  density?: FieldDensity;
  /** Disambiguates `id` when the same field id appears in multiple forms. */
  idPrefix?: string;
};

const densityWrapperClass: Record<FieldDensity, string> = {
  default: 'field',
  compact: 'field field-compact',
};

export default function WizardField({
  field,
  value,
  onChange,
  onBlur,
  error,
  density = 'default',
  idPrefix = 'wiz',
}: WizardFieldProps) {
  const t = useTranslations();
  const fieldId = `${idPrefix}-${field.id}`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const required = 'required' in field ? field.required === true : false;
  const wrapperClass = densityWrapperClass[density];

  const labelEl = (
    <label htmlFor={fieldId} className="field-label">
      {t(field.labelKey)}
      {required ? (
        <span className="field-required" aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  );

  const baseInputProps = {
    id: fieldId,
    'aria-required': required || undefined,
    'aria-invalid': error ? ('true' as const) : undefined,
    'aria-describedby': errorId,
    onBlur,
  };

  let control: React.ReactNode = null;

  switch (field.kind) {
    case 'text':
      control = (
        <input
          {...baseInputProps}
          type="text"
          className="field-input"
          autoComplete={field.autoComplete}
          maxLength={field.maxLength}
          placeholder={
            field.placeholderKey ? t(field.placeholderKey) : undefined
          }
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;

    case 'textarea': {
      const v = typeof value === 'string' ? value : '';
      control = (
        <>
          <textarea
            {...baseInputProps}
            className="field-textarea"
            rows={4}
            maxLength={field.maxLength}
            placeholder={
              field.placeholderKey ? t(field.placeholderKey) : undefined
            }
            value={v}
            onChange={(e) => onChange(e.target.value)}
          />
          <p
            className="field-help"
            style={{textAlign: 'right', margin: 0}}
            aria-live="polite"
          >
            {v.length}/{field.maxLength}
          </p>
        </>
      );
      break;
    }

    case 'numeric':
      control = (
        <input
          {...baseInputProps}
          type="text"
          inputMode="numeric"
          className="field-input"
          placeholder={
            field.placeholderKey ? t(field.placeholderKey) : undefined
          }
          value={typeof value === 'string' ? value : ''}
          onChange={(e) =>
            onChange(digitsOnly(e.target.value, field.max ? String(field.max).length : 8))
          }
        />
      );
      break;

    case 'email':
      control = (
        <input
          {...baseInputProps}
          type="email"
          inputMode="email"
          autoComplete="email"
          className="field-input"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;

    case 'tel':
      control = (
        <input
          {...baseInputProps}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          className="field-input"
          placeholder="(630) 946-9321"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(formatPhoneUS(e.target.value))}
          maxLength={14}
        />
      );
      break;

    case 'zip':
      control = (
        <input
          {...baseInputProps}
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          className="field-input"
          maxLength={5}
          pattern="\d{5}"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(digitsOnly(e.target.value, 5))}
        />
      );
      break;

    case 'select':
      control = (
        <select
          {...baseInputProps}
          className="field-select"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" disabled>
            {field.placeholderKey ? t(field.placeholderKey) : 'Select…'}
          </option>
          {field.options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {t(opt.labelKey)}
            </option>
          ))}
        </select>
      );
      break;

    case 'state-select':
      control = (
        <select
          {...baseInputProps}
          className="field-select"
          autoComplete="address-level1"
          value={typeof value === 'string' ? value : 'IL'}
          onChange={(e) => onChange(e.target.value)}
        >
          {US_STATES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      );
      break;

    case 'radio-group': {
      const v = typeof value === 'string' ? value : '';
      control = (
        <fieldset
          aria-required={required || undefined}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={errorId}
          style={{
            border: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
          }}
          onBlur={onBlur}
        >
          <legend className="visually-hidden" style={visuallyHidden}>
            {t(field.labelKey)}
          </legend>
          {field.options.map((opt) => {
            const selected = v === opt.id;
            const optId = `${fieldId}-${opt.id}`;
            return (
              <label
                key={opt.id}
                htmlFor={optId}
                className="card"
                style={{
                  ...optionPillStyle,
                  borderColor: selected
                    ? 'var(--color-sunset-green-500)'
                    : 'var(--color-border)',
                  borderWidth: selected ? 2 : 1,
                  background: selected
                    ? 'var(--color-bg-cream)'
                    : 'var(--color-bg)',
                  padding: selected ? '11px 19px' : '12px 20px',
                  cursor: 'pointer',
                }}
              >
                <input
                  id={optId}
                  type="radio"
                  name={fieldId}
                  value={opt.id}
                  checked={selected}
                  onChange={() => onChange(opt.id)}
                  className="visually-hidden"
                  style={visuallyHidden}
                />
                <span style={{fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)'}}>
                  {t(opt.labelKey)}
                </span>
              </label>
            );
          })}
        </fieldset>
      );
      break;
    }

    case 'checkbox-group': {
      const arr = Array.isArray(value) ? value : [];
      control = (
        <fieldset
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={errorId}
          style={{
            border: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
          }}
          onBlur={onBlur}
        >
          <legend className="visually-hidden" style={visuallyHidden}>
            {t(field.labelKey)}
          </legend>
          {field.options.map((opt) => {
            const checked = arr.includes(opt.id);
            const optId = `${fieldId}-${opt.id}`;
            return (
              <label
                key={opt.id}
                htmlFor={optId}
                style={{
                  ...optionPillStyle,
                  borderColor: checked
                    ? 'var(--color-sunset-green-500)'
                    : 'var(--color-border)',
                  borderWidth: checked ? 2 : 1,
                  background: checked
                    ? 'var(--color-bg-cream)'
                    : 'var(--color-bg)',
                  padding: checked ? '11px 19px' : '12px 20px',
                  cursor: 'pointer',
                }}
              >
                <input
                  id={optId}
                  type="checkbox"
                  value={opt.id}
                  checked={checked}
                  onChange={() => {
                    const next = checked ? arr.filter((x) => x !== opt.id) : [...arr, opt.id];
                    onChange(next);
                  }}
                  className="visually-hidden"
                  style={visuallyHidden}
                />
                <span style={{fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)'}}>
                  {t(opt.labelKey)}
                </span>
              </label>
            );
          })}
        </fieldset>
      );
      break;
    }
  }

  return (
    <div className={wrapperClass}>
      {labelEl}
      {control}
      {error ? (
        <span id={errorId} role="alert" className="field-error">
          {error}
        </span>
      ) : null}
    </div>
  );
}

const visuallyHidden: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
};

const optionPillStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  borderRadius: 12,
  borderStyle: 'solid',
  transition: 'background-color var(--motion-fast), border-color var(--motion-fast)',
};
