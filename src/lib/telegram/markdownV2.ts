/**
 * Telegram MarkdownV2 escape helper.
 *
 * Telegram's MarkdownV2 parser is strict — any unescaped special character
 * (`_*[]()~` `>#+-=|{}.!\``) inside a message body or inside the visible
 * text of a Markdown construct returns a 400 Bad Request. This helper takes
 * a plain string and escapes every special character so the result is safe
 * to splice into a MarkdownV2 message body.
 *
 * Caller decision: use this on user-derived or model-derived content (blog
 * titles, decks, topic keywords, error messages). Do NOT use it on the
 * Markdown markup you're emitting yourself — `*bold*` should stay as
 * `*bold*`, but the text INSIDE the asterisks needs escaping.
 *
 * Reference: https://core.telegram.org/bots/api#markdownv2-style — "any
 * character with code between 1 and 126 inclusively can be escaped".
 */

const SPECIALS = /[_*[\]()~`>#+\-=|{}.!\\]/g;

export function escapeMarkdownV2(text: string): string {
  return text.replace(SPECIALS, '\\$&');
}
