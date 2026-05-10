'use client';

import * as React from 'react';
import {useTranslations, useLocale} from 'next-intl';
import {useRouter, Link} from '@/i18n/navigation';
import {
  WIZARD_STEP_3_FIELDS,
  type WizardAudience,
  getServiceOptionsForAudience,
} from '@/data/wizard';
import {WIZARD_EVENTS, fireWizardEvent} from '@/lib/wizard/events';
import {isWizardSubmitEnabled} from '@/lib/chat/flags';
import type {Step4Values} from './WizardStep4Contact';

type Props = {
  audience: WizardAudience;
  selectedSlugs: string[];
  primarySlug: string;
  otherText: string;
  step3: Record<string, string | string[]>;
  step4: Step4Values;
  onEdit: (step: 1 | 2 | 3 | 4) => void;
};

/**
 * Step 5 — review + amber Submit. Phase 1.19 §3.7, D8.
 *
 * Single `.card-cream` (NOT `.card-featured` — 1.06 §2.4 forbids featured +
 * amber on the same page; Step 5 has the amber Submit). Per-step Edit links
 * route via `?step=N` while preserving all React state.
 *
 * Submit handler — Part 1 simulation: console.log payload, dispatch
 * `wizard_submit_succeeded` event, route to `/thank-you/?firstName=…`.
 * Phase 2.06 swaps the simulation for the real `/api/quote` POST.
 */
export default function WizardStep5Review({
  audience,
  selectedSlugs,
  primarySlug,
  otherText,
  step3,
  step4,
  onEdit,
}: Props) {
  const t = useTranslations();
  const locale = useLocale() as 'en' | 'es';
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const services = React.useMemo(() => getServiceOptionsForAudience(audience), [audience]);

  function serviceSummary(): string {
    const parts: string[] = [];
    selectedSlugs.forEach((slug) => {
      const svc = services.find((s) => s.slug === slug);
      if (svc) {
        const isPrimary = primarySlug === slug;
        parts.push(`${svc.name[locale]}${isPrimary ? ` ${t('wizard.step5.primaryNote')}` : ''}`);
      }
    });
    if (otherText.trim()) {
      parts.push(t('wizard.step2.other'));
    }
    return parts.join(', ') || t('wizard.step5.noneSelected');
  }

  function detailsSummary(): string {
    const fields = WIZARD_STEP_3_FIELDS[audience];
    const parts: string[] = [];
    fields.forEach((f) => {
      const v = step3[f.id];
      if (v == null) return;
      if (Array.isArray(v)) {
        if (v.length > 0) {
          parts.push(
            v
              .map((id) => {
                if (f.kind !== 'checkbox-group') return id;
                const opt = f.options.find((o) => o.id === id);
                return opt ? t(opt.labelKey) : id;
              })
              .join(' · '),
          );
        }
      } else if (typeof v === 'string' && v.trim().length > 0) {
        if (f.kind === 'select' || f.kind === 'radio-group') {
          const opt = f.options.find((o) => o.id === v);
          parts.push(opt ? t(opt.labelKey) : v);
        } else if (f.kind === 'numeric') {
          parts.push(v + (f.id === 'propertySize' ? ' sq ft' : ''));
        } else if (f.kind === 'textarea') {
          // Skip the long-form notes from the inline summary; they appear on a
          // separate row below.
        } else {
          parts.push(v);
        }
      }
    });
    return parts.join(' · ') || t('wizard.step5.noneSelected');
  }

  function contactLine1(): string {
    const name = `${step4.firstName} ${step4.lastName}`.trim();
    const bits = [name, step4.email, step4.phone].filter((x) => x.trim().length > 0);
    return bits.join(' · ') || t('wizard.step5.noneSelected');
  }

  function contactLine2(): string {
    const cityStateZip = [step4.city, step4.state, step4.zip].filter(Boolean).join(', ');
    const addr = [step4.street, step4.unit].filter(Boolean).join(' ');
    const prefs: string[] = [];
    if (step4.contactMethod) {
      prefs.push(t(`wizard.contactMethod.${step4.contactMethod}`));
    }
    if (step4.bestTime) {
      prefs.push(t(`wizard.bestTime.${step4.bestTime}`).toLowerCase());
    }
    return [addr ? `${addr}, ${cityStateZip}` : cityStateZip, prefs.join(' · ')]
      .filter(Boolean)
      .join(' · ');
  }

  async function handleSubmit() {
    setSubmitting(true);
    fireWizardEvent(WIZARD_EVENTS.SUBMIT_ATTEMPTED, {locale, audience});

    if (isWizardSubmitEnabled()) {
      // Phase 2.06 will replace this with `fetch('/api/quote', { ... })`.
      // Until then the wizard always falls through to the simulation below.
    }

    // Part 1 simulation. Phase 2.06 swaps for `fetch('/api/quote', ...)`.
    const payload = {audience, selectedSlugs, primarySlug, otherText, step3, step4};
    console.log('[wizard]', payload);
    await new Promise((r) => setTimeout(r, 800));
    fireWizardEvent(WIZARD_EVENTS.SUBMIT_SUCCEEDED, {locale, audience});
    const firstName = encodeURIComponent(step4.firstName.trim().slice(0, 50));
    router.push(`/thank-you/?firstName=${firstName}`);
  }

  const rowEyebrow = (key: string) => (
    <span
      className="font-heading font-semibold uppercase"
      style={{
        fontSize: 11,
        letterSpacing: 'var(--tracking-eyebrow)',
        color: 'var(--color-sunset-green-700)',
      }}
    >
      {t(key)}
    </span>
  );

  const editBtn = (n: 1 | 2 | 3 | 4) => (
    <button
      type="button"
      onClick={() => onEdit(n)}
      data-analytics-event={WIZARD_EVENTS.EDIT_STEP(n)}
      className="link link-inline"
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: 13,
        color: 'var(--color-sunset-green-700)',
        fontWeight: 600,
      }}
    >
      {t('wizard.step5.edit')}
    </button>
  );

  const hr = (
    <div
      aria-hidden="true"
      style={{height: 1, background: 'var(--color-border)', margin: '24px 0'}}
    />
  );

  const notesText = typeof step3.notes === 'string' ? step3.notes.trim() : '';

  return (
    <div>
      <h2
        id="wizard-step5-h2"
        className="m-0 font-heading"
        style={{
          fontSize: 'var(--text-h2)',
          fontWeight: 600,
          letterSpacing: 'var(--tracking-snug)',
        }}
      >
        {t('wizard.step5.title')}
      </h2>
      <p
        className="m-0 mt-2"
        style={{fontSize: 'var(--text-body-lg)', color: 'var(--color-text-secondary)'}}
      >
        {t('wizard.step5.subtitle')}
      </p>

      <div
        className="card card-cream mt-8"
        style={{padding: 0, boxShadow: 'var(--shadow-on-cream)'}}
      >
        <div style={{padding: '32px 32px'}}>
          {/* Step 1 row */}
          <div className="flex justify-between items-start gap-4">
            <div>{rowEyebrow('wizard.step5.step1')}</div>
            {editBtn(1)}
          </div>
          <p
            className="m-0 mt-2 font-heading"
            style={{fontSize: 'var(--text-h5)', fontWeight: 600}}
          >
            {t(`wizard.audience.${audience}.title`)}
          </p>
          {hr}

          {/* Step 2 row */}
          <div className="flex justify-between items-start gap-4">
            <div>{rowEyebrow('wizard.step5.step2')}</div>
            {editBtn(2)}
          </div>
          <p
            className="m-0 mt-2"
            style={{fontSize: 'var(--text-body)'}}
          >
            {serviceSummary()}
          </p>
          {hr}

          {/* Step 3 row */}
          <div className="flex justify-between items-start gap-4">
            <div>{rowEyebrow('wizard.step5.step3')}</div>
            {editBtn(3)}
          </div>
          <p
            className="m-0 mt-2"
            style={{fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)'}}
          >
            {detailsSummary()}
          </p>
          {notesText ? (
            <p
              className="m-0 mt-2"
              style={{fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)', fontStyle: 'italic'}}
            >
              &ldquo;{notesText}&rdquo;
            </p>
          ) : null}
          {hr}

          {/* Step 4 row */}
          <div className="flex justify-between items-start gap-4">
            <div>{rowEyebrow('wizard.step5.step4')}</div>
            {editBtn(4)}
          </div>
          <p className="m-0 mt-2" style={{fontSize: 'var(--text-body)'}}>
            {contactLine1()}
          </p>
          <p
            className="m-0 mt-1"
            style={{fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)'}}
          >
            {contactLine2()}
          </p>

          <div
            aria-hidden="true"
            style={{height: 1, background: 'var(--color-border)', margin: '24px 0'}}
          />

          <p
            className="m-0"
            style={{fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)'}}
          >
            {t.rich('wizard.step5.consent', {
              privacy: (chunks) => (
                <Link href="/privacy/" prefetch={false} className="link link-inline">
                  {chunks}
                </Link>
              ),
              terms: (chunks) => (
                <Link href="/terms/" prefetch={false} className="link link-inline">
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col-reverse lg:flex-row lg:justify-between lg:items-center gap-4">
        <button
          type="button"
          onClick={() => onEdit(4)}
          className="btn btn-secondary btn-md"
          style={{minWidth: 120}}
          data-analytics-event={WIZARD_EVENTS.BACK_CLICKED}
        >
          {t('wizard.btn.back')}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          aria-busy={submitting}
          className="btn btn-amber btn-lg"
          data-analytics-event={WIZARD_EVENTS.SUBMIT_ATTEMPTED}
          data-loading={submitting ? 'true' : undefined}
          style={{minWidth: 240}}
        >
          <span className="btn__label">
            {submitting ? t('wizard.step5.submitting') : t('wizard.btn.submit')}
          </span>
        </button>
      </div>
    </div>
  );
}
