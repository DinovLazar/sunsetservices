'use client';

import * as React from 'react';
import {useTranslations} from 'next-intl';
import {BUSINESS_PHONE_TEL, BUSINESS_EMAIL} from '@/lib/constants/business';
import ChatMessageBubble from './ChatMessageBubble';

/**
 * Chat error states (Phase 2.09 widened from Phase 1.20 network/rate/api).
 *
 * Rendered as assistant message bubbles inside the message log so the error
 * is part of the conversational flow (not an interruptive alert). Kinds map
 * 1-to-1 onto SSE error events from `/api/chat`:
 *
 *   - 'rate_burst'  → 429 with reason='burst'   ("slow down a bit")
 *   - 'rate_daily'  → 429 with reason='daily'   ("daily limit reached")
 *   - 'disabled'    → 503 (AI_CHAT_ENABLED=false; backend kill switch)
 *   - 'network'     → fetch/HTTP failure (5xx, body read aborts, etc.)
 *   - 'generic'     → relayed model/SDK error
 */
type Kind = 'network' | 'rate_burst' | 'rate_daily' | 'disabled' | 'generic' | null;

type Props = {
  kind: Kind;
  onRetry?: () => void;
};

export default function ChatErrorState({kind, onRetry}: Props) {
  const tErrors = useTranslations('chat.errors');
  const tError = useTranslations('chat.error');
  if (kind === null) return null;

  if (kind === 'network') {
    return (
      <div>
        <ChatMessageBubble role="assistant" content={tError('network')} />
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="btn btn-secondary btn-sm"
            style={{marginLeft: 36, marginTop: 6}}
          >
            {tError('networkRetry')}
          </button>
        ) : null}
      </div>
    );
  }

  if (kind === 'rate_burst') {
    return <ChatMessageBubble role="assistant" content={tErrors('rateLimitedBurst')} />;
  }

  if (kind === 'rate_daily') {
    return <ChatMessageBubble role="assistant" content={tErrors('rateLimitedDaily')} />;
  }

  if (kind === 'disabled') {
    return <ChatMessageBubble role="assistant" content={tErrors('disabled')} />;
  }

  // generic — backend SDK/model error or anything unmapped.
  return (
    <div>
      <ChatMessageBubble role="assistant" content="" />
      <div className="chat-msg chat-msg--assistant" style={{marginLeft: 36}}>
        <p className="m-0" style={{fontSize: 14}}>
          {tErrors('generic')}{' '}
          <a href={`mailto:${BUSINESS_EMAIL}`} className="link link-inline">
            {BUSINESS_EMAIL}
          </a>{' '}
          /{' '}
          <a href={`tel:${BUSINESS_PHONE_TEL}`} className="link link-inline">
            (630) 946-9321
          </a>
        </p>
      </div>
    </div>
  );
}
