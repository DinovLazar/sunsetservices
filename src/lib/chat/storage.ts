/**
 * Chat history + session-ID persistence — Phase 1.20 D28 (Phase 2.09 session-ID extension).
 *
 * `sessionStorage` per-locale history namespace + a sibling session-ID key.
 * Cleared on tab close (Plan §12 literal "cleared on close"). Reset link in
 * panel header clears the key explicitly.
 *
 * Pre-consent attempts are no-ops; the consent gate is owned by the calling
 * component (D29).
 */

import {generateUuid} from '@/lib/sessionId';

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  role: ChatRole;
  content: string;
  ts: number;
};

const KEY_PREFIX = 'sunset_chat_history_';
const SESSION_ID_KEY = 'sunset_chat_session_id';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

function key(locale: string): string {
  return `${KEY_PREFIX}${locale}`;
}

export function loadHistory(locale: string): ChatMessage[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.sessionStorage.getItem(key(locale));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m): m is ChatMessage =>
        m && (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' && typeof m.ts === 'number',
    );
  } catch {
    return [];
  }
}

export function saveHistory(locale: string, messages: ChatMessage[]): void {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.setItem(key(locale), JSON.stringify(messages));
  } catch {
    // sessionStorage full or blocked
  }
}

export function clearHistory(locale: string): void {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.removeItem(key(locale));
    window.sessionStorage.removeItem(SESSION_ID_KEY);
  } catch {
    // ignore
  }
}

/**
 * Read the per-session UUID; lazily create + persist if missing (Phase 2.09).
 * Used by `/api/chat` + `/api/chat/lead` request payloads to correlate the
 * conversation server-side. SSR returns 'ssr-no-session' so the value never
 * propagates accidentally — callers should only invoke this from effect bodies
 * or event handlers.
 */
export function getOrCreateChatSessionId(): string {
  if (!isBrowser()) return 'ssr-no-session';
  try {
    const existing = window.sessionStorage.getItem(SESSION_ID_KEY);
    if (existing && existing.length >= 8) return existing;
    const fresh = generateUuid();
    window.sessionStorage.setItem(SESSION_ID_KEY, fresh);
    return fresh;
  } catch {
    // sessionStorage blocked — generate a per-tab UUID anyway so the request still validates.
    return generateUuid();
  }
}
