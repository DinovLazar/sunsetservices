'use client';

import * as React from 'react';
import {useTranslations} from 'next-intl';

type Props = {
  onPick: (text: string, n: 1 | 2 | 3) => void;
};

/**
 * Welcome-state suggested prompts — three Ghost-button chips. Phase 1.19 §4.6.
 *
 * Tap auto-sends as a user message and triggers the canned-reply stub.
 * Composed from existing `Ghost × md` button at chip aspect — no new variant.
 */
export default function ChatSuggestedPrompts({onPick}: Props) {
  const t = useTranslations('chat.prompt');
  const prompts: ReadonlyArray<{n: 1 | 2 | 3; key: '1' | '2' | '3'}> = [
    {n: 1, key: '1'},
    {n: 2, key: '2'},
    {n: 3, key: '3'},
  ];
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        marginLeft: 36,
        marginTop: 8,
      }}
    >
      {prompts.map(({n, key}) => {
        const text = t(key);
        return (
          <button
            key={n}
            type="button"
            onClick={() => onPick(text, n)}
            data-analytics-event={`chat_prompt_clicked_${n}`}
            aria-label={`Suggested prompt: ${text}`}
            style={{
              textAlign: 'left',
              padding: '8px 14px',
              borderRadius: 18,
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              cursor: 'pointer',
              transition: 'background-color var(--motion-fast), border-color var(--motion-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-cream)';
              e.currentTarget.style.borderColor = 'var(--color-border-strong)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-bg)';
              e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}
