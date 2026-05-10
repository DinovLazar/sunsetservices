'use client';

import * as React from 'react';
import {useTranslations} from 'next-intl';
import {BUSINESS_PHONE_TEL, BUSINESS_EMAIL} from '@/lib/constants/business';
import ChatMessageBubble from './ChatMessageBubble';

type Props = {
  kind: 'network' | 'rate' | 'api' | null;
  onRetry?: () => void;
};

/**
 * Chat error states — network / rate / API down / kill switch. Phase 1.19 §4.10.
 *
 * Rendered as assistant message bubbles inside the message log so the error
 * is part of the conversational flow (not an interruptive alert). Part 1
 * wires the visual states; Part 2 triggers them on real API errors.
 *
 * Kill switch (`AI_CHAT_ENABLED=false`) is handled upstream in `ChatRoot`
 * which returns `null` — so it never reaches this component.
 */
export default function ChatErrorState({kind, onRetry}: Props) {
  const t = useTranslations('chat.error');
  if (kind === null) return null;

  if (kind === 'network') {
    return (
      <div>
        <ChatMessageBubble role="assistant" content={t('network')} />
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="btn btn-secondary btn-sm"
            style={{marginLeft: 36, marginTop: 6}}
          >
            {t('networkRetry')}
          </button>
        ) : null}
      </div>
    );
  }

  if (kind === 'rate') {
    return <ChatMessageBubble role="assistant" content={t('rate')} />;
  }

  // api
  return (
    <div>
      <ChatMessageBubble role="assistant" content="" />
      <div className="chat-msg chat-msg--assistant" style={{marginLeft: 36}}>
        <p className="m-0" style={{fontSize: 14}}>
          I&apos;m offline right now. Email us at{' '}
          <a href={`mailto:${BUSINESS_EMAIL}`} className="link link-inline">
            {BUSINESS_EMAIL}
          </a>{' '}
          or call{' '}
          <a href={`tel:${BUSINESS_PHONE_TEL}`} className="link link-inline">
            (630) 946-9321
          </a>{' '}
          &mdash; we&apos;ll get right back to you.
        </p>
      </div>
    </div>
  );
}
