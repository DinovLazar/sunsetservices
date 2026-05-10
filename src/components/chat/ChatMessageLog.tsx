'use client';

import * as React from 'react';
import type {ChatMessage} from '@/lib/chat/storage';
import ChatMessageBubble from './ChatMessageBubble';
import ChatTypingIndicator from './ChatTypingIndicator';

type Props = {
  messages: ChatMessage[];
  isStreaming?: boolean;
  /** Optional content rendered after the last message (e.g. ChatLeadForm or
      ChatErrorState). */
  afterTrail?: React.ReactNode;
  /** Welcome state — rendered when messages are empty. */
  welcome?: React.ReactNode;
};

/**
 * Scrollable message log. Phase 1.19 §4.5 / §9.2.
 *
 * `<div role="log" aria-live="polite" aria-atomic="false">` per a11y spec.
 * Auto-scrolls to bottom on new messages. Sender-switch detection inserts
 * 16px gap; same-sender consecutive bubbles get 8px (handled in CSS).
 */
export default function ChatMessageLog({messages, isStreaming, afterTrail, welcome}: Props) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isStreaming, afterTrail]);

  return (
    <div
      ref={ref}
      role="log"
      aria-live="polite"
      aria-atomic="false"
      className="chat-panel-log"
    >
      {messages.length === 0 ? welcome : null}
      {messages.map((m, i) => {
        const prev = messages[i - 1];
        const showAvatar =
          m.role === 'assistant' && (!prev || prev.role !== 'assistant');
        return (
          <ChatMessageBubble
            key={i}
            role={m.role}
            content={m.content}
            showAvatar={showAvatar}
          />
        );
      })}
      {isStreaming ? (
        <div
          role="article"
          aria-label="Sunny is typing"
          style={{display: 'flex', gap: 8, alignItems: 'flex-start'}}
        >
          <span
            aria-hidden="true"
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'var(--color-sunset-green-700)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: 4,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: 'var(--color-sunset-amber-500)',
              }}
            />
          </span>
          <div className="chat-msg chat-msg--assistant" style={{padding: '10px 14px'}}>
            <ChatTypingIndicator />
          </div>
        </div>
      ) : null}
      {afterTrail}
    </div>
  );
}
