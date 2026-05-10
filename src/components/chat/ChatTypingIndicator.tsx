'use client';

import * as React from 'react';
import {useReducedMotion} from 'motion/react';

/**
 * Three-dot typing indicator. Phase 1.19 §4.7.
 *
 * 480ms pulse staggered 200ms; reduced-motion → static `…`. Animation lives
 * in `globals.css` `.chat-typing-dot` so this stays a tiny component.
 */
export default function ChatTypingIndicator() {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <span aria-hidden="true" style={{fontSize: 18, opacity: 0.6}}>
        …
      </span>
    );
  }
  return (
    <span aria-hidden="true">
      <span className="chat-typing-dot" />
      <span className="chat-typing-dot" />
      <span className="chat-typing-dot" />
    </span>
  );
}
