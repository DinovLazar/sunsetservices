'use client';

import * as React from 'react';
import {useTranslations} from 'next-intl';

/**
 * Contact form (client) — Phase 1.11 handover §4.2 + §9.3.
 *
 * The ONLY client component on /contact/. Honeypot, fieldset+legend for
 * email-or-phone (D14 lock), per-field + form-level error regions wired by
 * `aria-describedby`/`role`. Submit is **primary green `lg`** (NOT amber).
 *
 * Part 1 contract: `action` is undefined → submit is a no-op that fakes
 * the success state. Part 2 wires a real server action via the `action`
 * prop and surfaces server-side errors through the same `errors` object.
 */

export type ContactFormProps = {
  action?: (formData: FormData) => Promise<{ok: true} | {ok: false; errors: Record<string, string>}>;
  locale: 'en' | 'es';
};

type ErrorState = Partial<Record<'name' | 'emailPhone' | 'email' | 'phone' | 'form', string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_DIGITS = /\d/g;

export default function ContactForm({action, locale}: ContactFormProps) {
  const t = useTranslations('contact.form');
  const [errors, setErrors] = React.useState<ErrorState>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  if (success) {
    return (
      <div role="status" aria-live="polite" className="py-6">
        <p
          className="m-0 font-heading"
          style={{
            fontSize: 'var(--text-h4)',
            fontWeight: 600,
            color: 'var(--color-sunset-green-700)',
          }}
        >
          {t('success.title')}
        </p>
        <p
          className="m-0 mt-3"
          style={{
            fontSize: 'var(--text-body-lg)',
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--leading-relaxed)',
          }}
        >
          {t('success.body')}
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot — silently swallow bot submissions.
    if (typeof data.get('website') === 'string' && (data.get('website') as string).length > 0) {
      setSuccess(true);
      return;
    }

    const next: ErrorState = {};
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const phone = String(data.get('phone') ?? '').trim();

    if (!name) {
      next.name = t('error.name_empty');
    }

    if (!email && !phone) {
      next.emailPhone = t('error.email_phone_empty');
    } else {
      if (email && !EMAIL_RE.test(email)) {
        next.email = t('error.email_invalid');
      }
      if (phone) {
        const digits = phone.match(PHONE_DIGITS) ?? [];
        if (digits.length < 7) {
          next.phone = t('error.phone_invalid');
        }
      }
    }

    if (Object.keys(next).length > 0) {
      next.form = t('error.required_fields');
      setErrors(next);
      return;
    }

    setErrors({});
    setSubmitting(true);

    if (action) {
      try {
        const result = await action(data);
        if (result.ok) {
          setSuccess(true);
        } else {
          setErrors({...result.errors, form: t('error.generic')});
        }
      } catch {
        setErrors({form: t('error.generic')});
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Part 1: no-op submit. Show "sending…" then success — visual review path.
    await new Promise((res) => setTimeout(res, 600));
    setSubmitting(false);
    setSuccess(true);
  }

  const reqPill = (
    <span
      aria-hidden="true"
      className="ml-2 inline-flex items-center font-heading font-semibold uppercase"
      style={{
        fontSize: '10px',
        letterSpacing: '0.06em',
        height: '18px',
        padding: '0 8px',
        borderRadius: '9px',
        background: 'var(--color-sunset-green-50, rgba(220,232,213,1))',
        color: 'var(--color-sunset-green-700)',
      }}
    >
      {t('req_pill')}
    </span>
  );

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={submitting} lang={locale}>
      <h2
        className="m-0 font-heading"
        style={{
          fontSize: 'var(--text-h3)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
        }}
      >
        {t('title')}
      </h2>

      {/* Honeypot — visually hidden, keyboard-unreachable, ARIA-hidden. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Name */}
      <div className="mt-6">
        <label
          htmlFor="contact-name"
          className="flex items-center font-heading"
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
          }}
        >
          {t('name.label')} <span className="ml-1">{t('required.suffix')}</span>
          {reqPill}
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          aria-required="true"
          aria-invalid={errors.name ? 'true' : undefined}
          aria-describedby={errors.name ? 'contact-name-error' : undefined}
          placeholder={t('name.placeholder')}
          className="form-input mt-2"
          style={inputStyle}
        />
        {errors.name ? (
          <p id="contact-name-error" className="m-0 mt-1" style={errorStyle}>
            {errors.name}
          </p>
        ) : null}
      </div>

      {/* Fieldset: Email or phone — group-required (D14). */}
      <fieldset
        className="mt-6 px-4 pt-3 pb-4"
        style={{
          border: '1px dashed var(--color-border-soft, #C9C2AE)',
          borderRadius: 'var(--radius-md)',
        }}
        aria-describedby={errors.emailPhone ? 'contact-emailphone-error' : undefined}
      >
        <legend
          className="px-2 font-heading"
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
          }}
        >
          {t('contact_legend')}
        </legend>
        <div className="mt-2">
          <label htmlFor="contact-email" className="font-heading" style={subLabelStyle}>
            {t('email.label')}
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={t('email.placeholder')}
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
            className="form-input mt-1"
            style={inputStyle}
          />
          {errors.email ? (
            <p id="contact-email-error" className="m-0 mt-1" style={errorStyle}>
              {errors.email}
            </p>
          ) : null}
        </div>
        <div className="mt-3">
          <label htmlFor="contact-phone" className="font-heading" style={subLabelStyle}>
            {t('phone.label')}
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={t('phone.placeholder')}
            aria-invalid={errors.phone ? 'true' : undefined}
            aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
            className="form-input mt-1"
            style={inputStyle}
          />
          {errors.phone ? (
            <p id="contact-phone-error" className="m-0 mt-1" style={errorStyle}>
              {errors.phone}
            </p>
          ) : null}
        </div>
        {errors.emailPhone ? (
          <p id="contact-emailphone-error" className="m-0 mt-2" style={errorStyle}>
            {errors.emailPhone}
          </p>
        ) : null}
      </fieldset>

      {/* Service category */}
      <div className="mt-6">
        <label
          htmlFor="contact-category"
          className="flex items-center font-heading"
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
          }}
        >
          {t('category.label')}
        </label>
        <select
          id="contact-category"
          name="category"
          defaultValue=""
          className="form-input mt-2"
          style={{...inputStyle, paddingRight: 36}}
        >
          <option value="" disabled>
            {t('category.placeholder')}
          </option>
          <option value="residential">{t('category.residential')}</option>
          <option value="commercial">{t('category.commercial')}</option>
          <option value="hardscape">{t('category.hardscape')}</option>
          <option value="other">{t('category.other')}</option>
        </select>
      </div>

      {/* Message */}
      <div className="mt-6">
        <label
          htmlFor="contact-message"
          className="flex items-center font-heading"
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
          }}
        >
          {t('message.label')}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          placeholder={t('message.placeholder')}
          className="form-input mt-2"
          style={{...inputStyle, height: 'auto', minHeight: 120, paddingTop: 12, paddingBottom: 12}}
        />
      </div>

      {/* Form-level error region */}
      {errors.form ? (
        <p
          role="alert"
          aria-live="polite"
          className="m-0 mt-5"
          style={{
            ...errorStyle,
            fontSize: 'var(--text-body)',
          }}
        >
          {errors.form}
        </p>
      ) : null}

      <button
        type="submit"
        className="btn btn-primary btn-lg mt-6"
        disabled={submitting}
        aria-busy={submitting}
        style={{minWidth: '220px'}}
      >
        {submitting ? t('submit.pending') : t('submit.label')}
      </button>
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 46,
  padding: '0 14px',
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border-soft, #C9C2AE)',
  borderRadius: 'var(--radius-sm, 6px)',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--text-body)',
  fontFamily: 'inherit',
};

const subLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 500,
  color: 'var(--color-text-secondary)',
};

const errorStyle: React.CSSProperties = {
  fontSize: 'var(--text-body-sm)',
  color: 'var(--color-feedback-error, #B23A3A)',
  fontWeight: 500,
};
