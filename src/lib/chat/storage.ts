/**
 * Chat history persistence — Phase 1.20 D28.
 *
 * `sessionStorage` per-locale namespace. Cleared on tab close (Plan §12 literal
 * "cleared on close"). Reset link in panel header clears the key explicitly.
 *
 * Pre-consent attempts are no-ops; the consent gate is owned by the calling
 * component (D29).
 */

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  role: ChatRole;
  content: string;
  ts: number;
};

const KEY_PREFIX = 'sunset_chat_history_';

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
  } catch {
    // ignore
  }
}
