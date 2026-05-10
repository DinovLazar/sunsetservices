'use client';

import * as React from 'react';
import {useTranslations, useLocale} from 'next-intl';
import {getServiceOptionsForAudience, type WizardAudience} from '@/data/wizard';

type Props = {
  audience: WizardAudience;
  selectedSlugs: string[];
  primarySlug: string;
  otherText: string;
  onChange: (next: {selectedSlugs: string[]; primarySlug: string; otherText: string}) => void;
  error?: string;
};

/**
 * Step 2 — service multi-select with primary radio. Phase 1.19 §3.4, D5.
 *
 * Audience-driven service list (filtered from Phase 1.09 `services.ts`).
 * Multi-select via checkboxes; "Primary service" radio strip above shows
 * only currently-checked services and defaults to the first checked.
 * Unchecking the current primary auto-rebinds to the first remaining.
 *
 * Validation: at least one checked OR ≥3 chars in "Other".
 */
export default function WizardStep2Service({
  audience,
  selectedSlugs,
  primarySlug,
  otherText,
  onChange,
  error,
}: Props) {
  const t = useTranslations();
  const locale = useLocale() as 'en' | 'es';
  const errorId = error ? 'wiz-step2-error' : undefined;

  const services = React.useMemo(() => getServiceOptionsForAudience(audience), [audience]);

  function toggle(slug: string) {
    const isChecked = selectedSlugs.includes(slug);
    let nextSelected: string[];
    let nextPrimary = primarySlug;
    if (isChecked) {
      nextSelected = selectedSlugs.filter((s) => s !== slug);
      if (primarySlug === slug) {
        nextPrimary = nextSelected[0] ?? '';
      }
    } else {
      nextSelected = [...selectedSlugs, slug];
      if (!primarySlug) nextPrimary = slug;
    }
    onChange({selectedSlugs: nextSelected, primarySlug: nextPrimary, otherText});
  }

  function setPrimary(slug: string) {
    onChange({selectedSlugs, primarySlug: slug, otherText});
  }

  function setOther(next: string) {
    onChange({selectedSlugs, primarySlug, otherText: next});
  }

  return (
    <div>
      <h2
        id="wizard-step2-h2"
        className="m-0 font-heading"
        style={{
          fontSize: 'var(--text-h2)',
          fontWeight: 600,
          letterSpacing: 'var(--tracking-snug)',
        }}
      >
        {t(`wizard.step2.title.${audience}`)}
      </h2>
      <p
        className="m-0 mt-2"
        style={{fontSize: 'var(--text-body-lg)', color: 'var(--color-text-secondary)'}}
      >
        {t('wizard.step2.helper')}
      </p>

      {selectedSlugs.length > 0 ? (
        <fieldset className="mt-8" style={{border: 'none', padding: 0, margin: 0}}>
          <legend
            className="m-0 mb-3 font-heading font-semibold uppercase"
            style={{
              fontSize: 13,
              letterSpacing: 'var(--tracking-eyebrow)',
              color: 'var(--color-sunset-green-700)',
            }}
          >
            {t('wizard.step2.primary')}
          </legend>
          <div className="flex flex-wrap gap-3">
            {selectedSlugs.map((slug) => {
              const svc = services.find((s) => s.slug === slug);
              if (!svc) return null;
              const checked = primarySlug === slug;
              const id = `wiz-step2-primary-${slug}`;
              return (
                <label
                  key={slug}
                  htmlFor={id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    fontSize: 14,
                    color: checked
                      ? 'var(--color-text-primary)'
                      : 'var(--color-text-muted)',
                    fontWeight: checked ? 600 : 500,
                  }}
                >
                  <input
                    id={id}
                    type="radio"
                    name="wiz-step2-primary"
                    checked={checked}
                    onChange={() => setPrimary(slug)}
                    style={{
                      width: 16,
                      height: 16,
                      accentColor: 'var(--color-sunset-green-500)',
                      cursor: 'pointer',
                    }}
                  />
                  {svc.name[locale]}
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <fieldset
        className="mt-6"
        style={{border: 'none', padding: 0, margin: 0}}
        aria-describedby={errorId}
      >
        <legend
          className="visually-hidden"
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            margin: -1,
            padding: 0,
            overflow: 'hidden',
            clip: 'rect(0,0,0,0)',
            border: 0,
          }}
        >
          {t('wizard.step2.servicesLegend')}
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {services.map((svc) => {
            const checked = selectedSlugs.includes(svc.slug);
            const id = `wiz-step2-${svc.slug}`;
            return (
              <label
                key={svc.slug}
                htmlFor={id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 16,
                  borderRadius: 12,
                  border: `${checked ? 2 : 1}px solid ${checked ? 'var(--color-sunset-green-500)' : 'var(--color-border)'}`,
                  background: checked ? 'var(--color-bg-cream)' : 'var(--color-bg)',
                  cursor: 'pointer',
                  transition: 'background-color var(--motion-fast), border-color var(--motion-fast)',
                }}
              >
                <input
                  id={id}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(svc.slug)}
                  style={{
                    width: 20,
                    height: 20,
                    accentColor: 'var(--color-sunset-green-500)',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                />
                <span
                  className="font-heading"
                  style={{fontWeight: 600, fontSize: 15, color: 'var(--color-text-primary)'}}
                >
                  {svc.name[locale]}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-8">
        <p
          className="m-0 mb-3 font-heading font-semibold uppercase"
          style={{
            fontSize: 13,
            letterSpacing: 'var(--tracking-eyebrow)',
            color: 'var(--color-sunset-green-700)',
          }}
        >
          {t('wizard.step2.other')}
        </p>
        <input
          type="text"
          className="field-input"
          maxLength={200}
          placeholder={t('wizard.step2.otherPlaceholder')}
          value={otherText}
          onChange={(e) => setOther(e.target.value)}
          aria-label={t('wizard.step2.other')}
        />
      </div>

      {error ? (
        <p id={errorId} role="alert" className="field-error mt-4">
          {error}
        </p>
      ) : null}
    </div>
  );
}
