import * as React from 'react';

type Props = {
  role: 'user' | 'assistant';
  content: string;
  showAvatar?: boolean;
};

/**
 * Single chat message bubble. Phase 1.19 §4.5, D23.
 *
 * Assistant: left-aligned, `.card-cream` body, 4px top-left tail, max-width
 * 85%. User: right-aligned, sunset-green-700 bg, on-green text, 4px top-right
 * tail. Inline content is **plaintext + URL auto-link only** per ratified
 * D24 = A; full Markdown subset is deferred to Phase 2.09 with the real SDK.
 *
 * URL auto-link regex is intentionally simple: anything matching `https?://\S+`
 * gets wrapped. No attribute injection because we render via React (text
 * content cannot become HTML).
 */
const URL_RE = /(https?:\/\/\S+)/g;

function renderInline(content: string): React.ReactNode {
  const parts = content.split(URL_RE);
  return parts.map((p, i) => {
    if (URL_RE.test(p)) {
      return (
        <a
          key={i}
          href={p}
          target="_blank"
          rel="noopener noreferrer"
          style={{textDecoration: 'underline', color: 'inherit'}}
        >
          {p}
        </a>
      );
    }
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

export default function ChatMessageBubble({role, content, showAvatar = true}: Props) {
  const isAssistant = role === 'assistant';
  return (
    <div
      role="article"
      aria-label={isAssistant ? 'Sunny said' : 'You said'}
      style={{
        display: 'flex',
        gap: 8,
        flexDirection: isAssistant ? 'row' : 'row-reverse',
        alignItems: 'flex-start',
        width: '100%',
      }}
    >
      {isAssistant && showAvatar ? (
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
      ) : null}
      <div className={`chat-msg chat-msg--${role}`}>{renderInline(content)}</div>
    </div>
  );
}
