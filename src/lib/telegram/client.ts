import type {TelegramInlineKeyboardMarkup} from './types';

/**
 * Low-level Telegram Bot API client (Phase 2.15).
 *
 * Three methods this phase needs: sendMessage, answerCallbackQuery,
 * editMessageReplyMarkup. All flag-gated through TELEGRAM_ENABLED; when the
 * flag is anything other than 'true' the client no-ops with a single log
 * line and returns {ok:false, simulated:true} — never throws, never makes
 * an HTTP request.
 *
 * On enabled flow: POST to <base>/bot<token>/<method> as JSON, read the
 * JSON response, return {ok:true, ...} on success or {ok:false, error}
 * on failure. The handler never throws — it returns a result object the
 * caller can branch on. Same durability pattern as sendBrandedEmail.
 *
 * TELEGRAM_API_BASE_URL is a test seam — defaults to https://api.telegram.org.
 * The verification harness (scripts/test-telegram-bot.mjs) overrides this
 * to point at a local mock so automated tests never hit real Telegram.
 *
 * Request timeout: 10 seconds (AbortSignal.timeout). On abort, log and
 * return {ok:false, error:'timeout'}.
 */

type SendMessageOk = {ok: true; messageId: number};
type ClientErr = {ok: false; simulated?: true; error?: string};

const DEFAULT_BASE = 'https://api.telegram.org';
const REQUEST_TIMEOUT_MS = 10_000;

function isEnabled(): boolean {
  return process.env.TELEGRAM_ENABLED === 'true';
}

function botUrl(method: string): string {
  const base = process.env.TELEGRAM_API_BASE_URL?.trim() || DEFAULT_BASE;
  const token = process.env.TELEGRAM_BOT_TOKEN ?? '';
  return `${base}/bot${token}/${method}`;
}

async function callBotApi(
  method: string,
  body: Record<string, unknown>,
): Promise<{ok: true; data: unknown} | {ok: false; error: string}> {
  try {
    const res = await fetch(botUrl(method), {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const json = (await res.json().catch(() => null)) as
      | {ok: true; result: unknown}
      | {ok: false; description?: string}
      | null;
    if (!json) {
      console.error(`[telegram] ${method} returned non-JSON body (HTTP ${res.status})`);
      return {ok: false, error: 'non-json-response'};
    }
    if (!json.ok) {
      const description = json.description ?? `HTTP ${res.status}`;
      console.error(`[telegram] error ${method}: ${description}`);
      return {ok: false, error: description};
    }
    return {ok: true, data: json.result};
  } catch (err) {
    const isAbort = err instanceof Error && err.name === 'TimeoutError';
    const reason = isAbort ? 'timeout' : err instanceof Error ? err.message : 'unknown-error';
    console.error(`[telegram] ${method} failed: ${reason}`);
    return {ok: false, error: isAbort ? 'timeout' : reason};
  }
}

export async function sendMessage(args: {
  chatId: number | string;
  text: string;
  parseMode?: 'MarkdownV2' | 'HTML';
  replyMarkup?: TelegramInlineKeyboardMarkup;
}): Promise<SendMessageOk | ClientErr> {
  if (!isEnabled()) {
    console.info(
      `[telegram] simulated sendMessage chat=${args.chatId} textLen=${args.text.length}`,
    );
    return {ok: false, simulated: true};
  }
  const body: Record<string, unknown> = {
    chat_id: args.chatId,
    text: args.text,
  };
  if (args.parseMode) body.parse_mode = args.parseMode;
  if (args.replyMarkup) body.reply_markup = args.replyMarkup;

  const result = await callBotApi('sendMessage', body);
  if (!result.ok) return {ok: false, error: result.error};

  const data = result.data as {message_id?: number} | null;
  const messageId = typeof data?.message_id === 'number' ? data.message_id : 0;
  return {ok: true, messageId};
}

export async function answerCallbackQuery(args: {
  callbackQueryId: string;
  text?: string;
}): Promise<{ok: true} | ClientErr> {
  if (!isEnabled()) {
    console.info(`[telegram] simulated answerCallbackQuery id=${args.callbackQueryId}`);
    return {ok: false, simulated: true};
  }
  const body: Record<string, unknown> = {callback_query_id: args.callbackQueryId};
  if (args.text) body.text = args.text;

  const result = await callBotApi('answerCallbackQuery', body);
  if (!result.ok) return {ok: false, error: result.error};
  return {ok: true};
}

export async function editMessageReplyMarkup(args: {
  chatId: number | string;
  messageId: number;
  replyMarkup?: TelegramInlineKeyboardMarkup;
}): Promise<{ok: true} | ClientErr> {
  if (!isEnabled()) {
    console.info(
      `[telegram] simulated editMessageReplyMarkup chat=${args.chatId} message=${args.messageId}`,
    );
    return {ok: false, simulated: true};
  }
  const body: Record<string, unknown> = {
    chat_id: args.chatId,
    message_id: args.messageId,
  };
  if (args.replyMarkup) body.reply_markup = args.replyMarkup;

  const result = await callBotApi('editMessageReplyMarkup', body);
  if (!result.ok) return {ok: false, error: result.error};
  return {ok: true};
}
