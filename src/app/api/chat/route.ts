import Anthropic from '@anthropic-ai/sdk';
import {NextRequest} from 'next/server';
import {z} from 'zod';
import {checkRateLimit} from '@/lib/chat/rateLimit';
import {getClientIp} from '@/lib/chat/getIp';
import {buildKnowledgeDigest} from '@/lib/chat/knowledgeBase';
import {buildSystemPrompt, FLAG_HIGH_INTENT_TOOL} from '@/lib/chat/systemPrompt';

/**
 * POST /api/chat — SSE-streamed Claude chat backend (Phase 2.09).
 *
 * Wire format (SSE — `data: <JSON>\n\n`):
 *   { type: 'token',  content: string }                     — incremental text
 *   { type: 'high_intent', reason: string }                 — model called flag_high_intent
 *   { type: 'done',   stopReason: string, usage: Usage }    — stream complete
 *   { type: 'error',  message: string }                     — SDK or relay error
 *
 * Order of operations:
 *   1. Backend kill switch (AI_CHAT_ENABLED=false → 503).
 *   2. Rate limit BEFORE body parse (cheaper to reject).
 *   3. Zod-validate the payload.
 *   4. Build (or read-from-cache) the Sanity-grounded knowledge digest.
 *   5. Stream from Anthropic, relaying token deltas as SSE.
 *   6. After the stream completes, inspect `finalMessage()` for `tool_use`
 *      blocks and emit `high_intent` events for any `flag_high_intent` calls.
 *   7. Emit a final `done` event with stop_reason + usage (carries the
 *      cache-hit metrics so we can verify prompt caching is active).
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
});

const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(40),
  locale: z.enum(['en', 'es']).default('en'),
  sessionId: z.string().min(8).max(128),
});

export async function POST(request: NextRequest) {
  // 1. Master kill switch
  if (process.env.AI_CHAT_ENABLED !== 'true') {
    return Response.json({status: 'disabled'}, {status: 503});
  }

  // 2. Rate limit (BEFORE body parsing — cheaper to reject)
  const ip = getClientIp(request.headers);
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return Response.json(
      {status: 'rate_limited', reason: rl.reason, retryAfter: rl.retryAfter},
      {status: 429, headers: {'Retry-After': String(rl.retryAfter)}},
    );
  }

  // 3. Parse + validate
  let parsed: z.infer<typeof ChatRequestSchema>;
  try {
    parsed = ChatRequestSchema.parse(await request.json());
  } catch {
    return Response.json({status: 'invalid'}, {status: 400});
  }

  const {messages, locale} = parsed;

  // 4. Build system prompt (Sanity-grounded, locale-matched, prompt-cached)
  const digest = await buildKnowledgeDigest(locale);
  const system = buildSystemPrompt({locale, digest});

  const client = new Anthropic({apiKey: process.env.ANTHROPIC_API_KEY});

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const apiStream = client.messages.stream({
          model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
          max_tokens: 1024,
          system,
          tools: [FLAG_HIGH_INTENT_TOOL],
          messages: messages.map((m) => ({role: m.role, content: m.content})),
        });

        for await (const event of apiStream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            send({type: 'token', content: event.delta.text});
          }
        }

        // After stream completes, inspect final message for tool_use blocks.
        const final = await apiStream.finalMessage();
        for (const block of final.content) {
          if (block.type === 'tool_use' && block.name === 'flag_high_intent') {
            const input = block.input as {reason?: string};
            send({type: 'high_intent', reason: input?.reason ?? ''});
          }
        }

        send({
          type: 'done',
          stopReason: final.stop_reason,
          usage: final.usage,
        });
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[/api/chat] stream failed', message);
        send({type: 'error', message});
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
