/**
 * SSE consumer for /api/chat (Phase 2.09).
 *
 * Manual reader over `Response.body` rather than `EventSource` because:
 *   - We use POST (EventSource is GET-only).
 *   - We want to bail without reconnect on the first error.
 *
 * Wire format mirrors the route handler in `src/app/api/chat/route.ts`:
 *   data: {"type":"token","content":"..."}\n\n
 *   data: {"type":"high_intent","reason":"..."}\n\n
 *   data: {"type":"done","stopReason":"...","usage":{...}}\n\n
 *   data: {"type":"error","message":"..."}\n\n
 */

export type ChatStreamErrorKind =
  | 'rate_limited_burst'
  | 'rate_limited_daily'
  | 'disabled'
  | 'http'
  | 'generic';

export type ChatStreamArgs = {
  messages: {role: 'user' | 'assistant'; content: string}[];
  locale: 'en' | 'es';
  sessionId: string;
  onToken: (chunk: string) => void;
  onHighIntent: (reason: string) => void;
  onDone: (meta: {stopReason: string | null; usage: unknown}) => void;
  onError: (kind: ChatStreamErrorKind, detail?: string) => void;
};

export async function streamFromBackend(args: ChatStreamArgs): Promise<void> {
  let res: Response;
  try {
    res = await fetch('/api/chat', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        messages: args.messages,
        locale: args.locale,
        sessionId: args.sessionId,
      }),
    });
  } catch (err) {
    args.onError('http', err instanceof Error ? err.message : 'fetch failed');
    return;
  }

  if (res.status === 503) {
    args.onError('disabled');
    return;
  }
  if (res.status === 429) {
    const body = await res.json().catch(() => ({}) as Record<string, unknown>);
    const reason = typeof body.reason === 'string' ? body.reason : '';
    args.onError(reason === 'daily' ? 'rate_limited_daily' : 'rate_limited_burst');
    return;
  }
  if (!res.ok || !res.body) {
    args.onError('http', `HTTP ${res.status}`);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    let chunk: ReadableStreamReadResult<Uint8Array>;
    try {
      chunk = await reader.read();
    } catch (err) {
      args.onError('generic', err instanceof Error ? err.message : 'read failed');
      return;
    }
    if (chunk.done) break;
    buffer += decoder.decode(chunk.value, {stream: true});
    const lines = buffer.split('\n\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const evt = JSON.parse(line.slice(6));
        if (evt.type === 'token' && typeof evt.content === 'string') {
          args.onToken(evt.content);
        } else if (evt.type === 'high_intent' && typeof evt.reason === 'string') {
          args.onHighIntent(evt.reason);
        } else if (evt.type === 'done') {
          args.onDone({stopReason: evt.stopReason ?? null, usage: evt.usage});
        } else if (evt.type === 'error') {
          args.onError('generic', typeof evt.message === 'string' ? evt.message : undefined);
        }
      } catch {
        // skip malformed
      }
    }
  }
}
