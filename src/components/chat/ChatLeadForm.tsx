'use client';

import * as React from 'react';
import {useTranslations} from 'next-intl';
import WizardField from '@/components/wizard/WizardField';
import {validateEmail, validateRequired, validatePhoneUS} from '@/lib/wizard/validation';

type Props = {
  onSubmit: (lead: {firstName: string; email: string; phone: string}) => void;
  onCancel: () => void;
};

/**
 * Inline lead-capture card. Phase 1.19 §4.8, D26.
 *
 * Slides into the message log when the user clicks "Get a quote in 30
 * seconds →". Three fields at `compact` density (Phase 1.19 §11.1
 * extension): First name, Email, Phone (optional). On submit (UI-only Part 1)
 * the parent appends a confirmation assistant message + "Open the full form"
 * CTA-link.
 */
export default function ChatLeadForm({onSubmit, onCancel}: Props) {
  const t = useTranslations('chat.lead');
  const tRoot = useTranslations();

  const [firstName, setFirstName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [errors, setErrors] = React.useState<{firstName?: string; email?: string; phone?: string}>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const e1 = validateRequired(firstName);
    const e2 = validateEmail(email);
    const e3 = phone.trim() ? validatePhoneUS(phone) : ({ok: true} as const);
    const next: typeof errors = {};
    if (!e1.ok) next.firstName = tRoot(e1.errorKey);
    if (!e2.ok) next.email = tRoot(e2.errorKey);
    if (!e3.ok) next.phone = tRoot(e3.errorKey);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSubmit({firstName: firstName.trim(), email: email.trim(), phone: phone.trim()});
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{
        marginLeft: 36,
        padding: 16,
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
      aria-label={t('title')}
    >
      <div>
        <h3
          className="m-0 font-heading"
          style={{fontSize: 'var(--text-h6)', fontWeight: 600}}
        >
          {t('title')}
        </h3>
        <p
          className="m-0 mt-1"
          style={{fontSize: 12, color: 'var(--color-text-secondary)'}}
        >
          {t('subtitle')}
        </p>
      </div>

      <WizardField
        field={{kind: 'text', id: 'firstName', labelKey: 'chat.lead.firstName', required: true, autoComplete: 'given-name', maxLength: 50}}
        value={firstName}
        onChange={(v) => setFirstName(v as string)}
        error={errors.firstName}
        density="compact"
        idPrefix="chat-lead"
      />
      <WizardField
        field={{kind: 'email', id: 'email', labelKey: 'chat.lead.email', required: true}}
        value={email}
        onChange={(v) => setEmail(v as string)}
        error={errors.email}
        density="compact"
        idPrefix="chat-lead"
      />
      <WizardField
        field={{kind: 'tel', id: 'phone', labelKey: 'chat.lead.phoneOptional'}}
        value={phone}
        onChange={(v) => setPhone(v as string)}
        error={errors.phone}
        density="compact"
        idPrefix="chat-lead"
      />

      <div style={{display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between', marginTop: 4}}>
        <button
          type="submit"
          className="btn btn-primary btn-md"
          data-analytics-event="chat_lead_form_submitted"
          style={{flex: '1 1 auto'}}
        >
          {t('send')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-link"
          style={{fontSize: 13}}
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}
