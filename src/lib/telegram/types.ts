/**
 * Telegram Bot API TypeScript types (Phase 2.15).
 *
 * Minimum-needed shapes for what this phase touches: sendMessage's response,
 * inline keyboard markup, and the callback_query branch of an incoming
 * webhook update. Other update branches (regular `message`, `edited_message`,
 * etc.) are not consumed — the webhook receiver silently ignores them.
 *
 * Pure type definitions. No runtime code.
 */

export type TelegramInlineKeyboardButton = {
  text: string;
  callback_data: string;
};

export type TelegramInlineKeyboardMarkup = {
  inline_keyboard: TelegramInlineKeyboardButton[][];
};

export type TelegramSendMessageResponse = {
  ok: true;
  result: {
    message_id: number;
    [k: string]: unknown;
  };
};

export type TelegramApiErrorResponse = {
  ok: false;
  description?: string;
  error_code?: number;
};

export type TelegramCallbackQuery = {
  id: string;
  from: {
    id: number;
    username?: string;
  };
  message: {
    message_id: number;
    chat: {
      id: number;
    };
  };
  data: string;
};

export type TelegramUpdate = {
  update_id: number;
  callback_query?: TelegramCallbackQuery;
  message?: unknown;
  edited_message?: unknown;
  channel_post?: unknown;
  edited_channel_post?: unknown;
};
