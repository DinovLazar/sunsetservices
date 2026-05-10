'use client';

import * as React from 'react';
import {useTranslations} from 'next-intl';
import {Send} from 'lucide-react';

type Props = {
  onSend: (text: string) => void;
  onLeadCta: () => void;
  disabled?: boolean;
};

/**
 * Chat composer — textarea + send + char hint + lead-capture trigger.
 * Phase 1.19 §4.3 / §4.4 / §4.8.
 *
 * Auto-grows 1→4 lines. `chat.composer.charHint` shown at ≥80% of 500 chars.
 * Enter sends; Shift+Enter inserts newline.
 */
export default function ChatComposer({onSend, onLeadCta, disabled = false}: Props) {
  const t = useTranslations('chat');
  const [value, setValue] = React.useState('');
  const taRef = React.useRef<HTMLTextAreaElement>(null);

  function autosize() {
    const el = taRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const next = Math.min(el.scrollHeight, 96);
    el.style.height = next + 'px';
  }

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
    requestAnimationFrame(autosize);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const showHint = value.length >= 400;

  return (
    <div className="chat-panel-composer">
      <div style={{display: 'flex', gap: 8, alignItems: 'flex-end'}}>
        <textarea
          ref={taRef}
          aria-label={t('composer.placeholder')}
          placeholder={t('composer.placeholder')}
          value={value}
          maxLength={500}
          onChange={(e) => {
            setValue(e.target.value);
            autosize();
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          style={{
            flex: 1,
            minHeight: 44,
            maxHeight: 96,
            padding: '10px 14px',
            border: '1px solid var(--color-border)',
            borderRadius: 14,
            background: 'var(--color-bg)',
            fontFamily: 'inherit',
            fontSize: 14,
            lineHeight: 'var(--leading-normal)',
            resize: 'none',
            outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          aria-label={t('composer.send')}
          data-analytics-event="chat_message_sent"
          className="btn btn-primary"
          style={{
            width: 44,
            height: 40,
            padding: 0,
            borderRadius: 10,
            flexShrink: 0,
          }}
        >
          <Send aria-hidden="true" size={18} />
        </button>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <button
          type="button"
          onClick={onLeadCta}
          data-analytics-event="chat_lead_cta_clicked"
          className="btn btn-link"
          style={{fontSize: 12, fontWeight: 600}}
        >
          {t('lead.cta')}
        </button>
        {showHint ? (
          <span
            aria-live="polite"
            style={{
              fontSize: 11,
              color:
                value.length > 480 ? 'var(--color-danger)' : 'var(--color-text-muted)',
            }}
          >
            {t('composer.charHint', {n: value.length})}
          </span>
        ) : null}
      </div>
    </div>
  );
}
