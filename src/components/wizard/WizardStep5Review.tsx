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
import {clearStep1to3} from '@/lib/wizard/storage';
import {getOrCreateSessionId, clearSessionId} from '@/lib/quote/session';
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
 * Step 5 — review + amber Submit. Phase 1.19 §3.7, D8; Phase 2.06 wiring.
 *
 * Single `.card-cream` (NOT `.card-featured` — 1.06 §2.4 forbids featured +
 * amber on the same page; Step 5 has the amber Submit). Per-step Edit links
 * route via `?step=N` while preserving all React state.
 *
 * Phase 2.06: Submit POSTs to `/api/quote`. Honeypot field is rendered
 * off-screen + tab-skipped + aria-hidden so naive bots fall into it. On
 * success, autosaved state + session ID are cleared and we redirect to
 * `/thank-you/`. On failure the visitor sees a friendly retry message.
 *
 * When `WIZARD_SUBMIT_ENABLED=false` the server route returns 200 +
 * `status: 'simulated'` so the wizard flows through the success path with
 * no real side effects.
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
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [honeypot, setHoneypot] = React.useState('');

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

  function buildPayload() {
    return {
      sessionId: getOrCreateSessionId(),
      honeypot,
      locale,
      audience,
      services: selectedSlugs,
      primaryService: primarySlug || undefined,
      otherText: otherText.trim() || undefined,
      details: extractDetails(step3),
      firstName: step4.firstName.trim(),
      lastName: step4.lastName.trim(),
      email: step4.email.trim(),
      phone: step4.phone.trim(),
      address: {
        street: step4.street.trim(),
        unit: step4.unit?.trim() || undefined,
        city: step4.city.trim(),
        state: step4.state.trim(),
        zip: step4.zip.trim(),
      },
      contactPreferences: {
        bestTime: step4.bestTime || undefined,
        contactMethod: step4.contactMethod || undefined,
      },
    };
  }

  async function handleSubmit() {
    setSubmitError(null);
    setSubmitting(true);
    fireWizardEvent(WIZARD_EVENTS.SUBMIT_ATTEMPTED, {locale, audience});

    // When the server flag is off, the route returns 200 + 'simulated' so the
    // call site is identical. We use the same fetch path either way to keep
    // both code paths exercised by the Phase 2.06 smoke tests.
    void isWizardSubmitEnabled();

    const payload = buildPayload();

    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        fireWizardEvent(WIZARD_EVENTS.SUBMIT_FAILED, {locale, audience, status: res.status});
        setSubmitError(t('wizard.error.submit'));
        setSubmitting(false);
        return;
      }

      fireWizardEvent(WIZARD_EVENTS.SUBMIT_SUCCEEDED, {locale, audience});

      // Clear autosaved Steps 1–3 and the session ID so a return visit starts
      // fresh. (PII never touched localStorage to begin with — D9 boundary.)
      clearStep1to3();
      clearSessionId();

      const firstName = encodeURIComponent(step4.firstName.trim().slice(0, 50));
      router.push(`/thank-you/?firstName=${firstName}`);
    } catch (err) {
      console.error('[wizard] submit network error', err);
      fireWizardEvent(WIZARD_EVENTS.SUBMIT_FAILED, {locale, audience, reason: 'network'});
      setSubmitError(t('wizard.error.submit'));
      setSubmitting(false);
    }
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

      {/*
        Honeypot field — invisible to humans, irresistible to naive bots.
        `aria-hidden` + `tabIndex={-1}` keeps screen readers + keyboard users
        out; off-screen positioning (not `display: none`) is deliberate so
        bots that skip hidden fields still see it.
      */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          width: 1,
          height: 1,
          overflow: 'hidden',
        }}
      >
        <label htmlFor="company_website">Company website (leave blank)</label>
        <input
          type="text"
          id="company_website"
          name="company_website"
          autoComplete="off"
          tabIndex={-1}
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {submitError ? (
        <div
          role="alert"
          className="mt-6"
          style={{
            padding: '12px 16px',
            border: '1px solid var(--color-error, #c0392b)',
            borderRadius: 8,
            background: 'color-mix(in srgb, var(--color-error, #c0392b) 8%, transparent)',
            color: 'var(--color-error, #c0392b)',
            fontSize: 'var(--text-body-sm)',
          }}
        >
          {submitError}
        </div>
      ) : null}

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

/**
 * Filter Step-3 state into the shape `QuoteSubmitSchema.details` accepts.
 * Drops empty strings, trims, and preserves arrays as-is.
 */
function extractDetails(
  step3: Record<string, string | string[]>,
): Record<string, string | string[]> | undefined {
  const out: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(step3)) {
    if (Array.isArray(value)) {
      if (value.length > 0) out[key] = value;
    } else if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) out[key] = trimmed;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}
