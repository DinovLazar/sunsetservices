/**
 * Phase B.17 — AI / answer-engine crawler policy.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * `robots.ts` already ships `User-agent: *  Allow: /`, which technically
 * permits every AI crawler. But "technically permitted" and "explicitly
 * welcomed" are not the same signal:
 *
 *  1. Several AI crawlers (notably `Google-Extended`) are treated as OPT-OUT
 *     tokens — their absence is ambiguous, and some operators default to
 *     conservative behaviour when a site has never named them.
 *  2. An explicit, named allow-block is a durable, auditable record of the
 *     decision. Six months from now nobody has to guess whether the wildcard
 *     was a deliberate choice or an oversight.
 *  3. Naming each agent lets us apply the same `/api/`, `/og/`, `/unsubscribe/`
 *     disallows to AI crawlers that we apply to Googlebot. Under a bare
 *     wildcard, an agent that ignores the `*` block would otherwise crawl the
 *     JSON API routes and the tokenised unsubscribe URLs — the latter is a
 *     privacy problem (BG-01 §9.2), not just an SEO one.
 *
 * DECISION (Goran, 2026-07-18): ALLOW ALL. Sunset wants to be recommended when
 * someone asks ChatGPT, Claude, Perplexity, or Google's AI Overviews "who does
 * paver patios near Aurora?" Being retrievable is the price of being
 * recommendable. The tradeoff Goran accepted: public marketing copy on this
 * site may also be used as model training data. Nothing private, customer-
 * identifying, or credential-bearing lives on the public site, so the exposure
 * is limited to copy that is already public.
 *
 * TO REVERSE FOR A GIVEN AGENT: move it from `AI_CRAWLERS_ALLOWED` to
 * `AI_CRAWLERS_BLOCKED` below. `robots.ts` reads both lists; no other change.
 *
 * NOTE ON WHAT THIS IS NOT: robots.txt is a request, not a fence. It is
 * honoured by every major operator listed here, but it cannot enforce
 * anything. Never rely on it to protect something that actually matters —
 * use auth for that.
 */

/**
 * Training-corpus crawlers. These build the datasets models are trained on.
 * Allowing them is what gets Sunset's services, cities, and process into the
 * model's own knowledge, so it can answer without retrieving anything.
 */
export const AI_CRAWLERS_TRAINING: readonly string[] = [
  'GPTBot', // OpenAI — training corpus
  'Google-Extended', // Google — Gemini / AI Overviews grounding opt-in token
  'Applebot-Extended', // Apple — Apple Intelligence training
  'CCBot', // Common Crawl — feeds many open models
  'Meta-ExternalAgent', // Meta — Llama training crawler
  'Bytespider', // ByteDance
  'Diffbot',
  'Omgilibot',
  'anthropic-ai', // Anthropic — legacy training token
];

/**
 * Live-retrieval / answer-engine crawlers. These fetch pages at question time
 * to ground a cited answer. THESE ARE THE COMMERCIALLY IMPORTANT ONES — they
 * are what puts "Sunset Services U.S., Aurora IL, (630) 946-9321" in front of
 * someone who just asked an assistant for a hardscape contractor, usually with
 * a clickable citation back to this site.
 */
export const AI_CRAWLERS_RETRIEVAL: readonly string[] = [
  'OAI-SearchBot', // OpenAI — ChatGPT Search index
  'ChatGPT-User', // OpenAI — live fetch on a user's behalf
  'ClaudeBot', // Anthropic — Claude's crawler
  'Claude-User', // Anthropic — live fetch on a user's behalf
  'Claude-SearchBot', // Anthropic — search indexing
  'PerplexityBot', // Perplexity — index
  'Perplexity-User', // Perplexity — live fetch
  'cohere-ai',
  'YouBot', // You.com
  'DuckAssistBot', // DuckDuckGo AI
  'MistralAI-User',
  'Amazonbot', // Alexa / Rufus
];

/** Every agent we explicitly welcome. */
export const AI_CRAWLERS_ALLOWED: readonly string[] = [
  ...AI_CRAWLERS_RETRIEVAL,
  ...AI_CRAWLERS_TRAINING,
];

/**
 * Agents explicitly turned away. Empty by design under the current decision —
 * kept as a named, documented lever so a future reversal is a one-line move
 * between two arrays rather than a rewrite of robots.ts.
 */
export const AI_CRAWLERS_BLOCKED: readonly string[] = [];

/**
 * Paths no crawler — search or AI — should touch.
 *
 *  - `/api/`         JSON handlers; no indexable content, and the quote/contact
 *                    routes accept POSTs.
 *  - `/og/`          generated OG images; machine-only.
 *  - `/unsubscribe/` carries a per-subscriber token in the URL. An AI crawler
 *                    fetching one of these leaks a subscriber identifier into
 *                    a third-party log. Both locale variants are listed
 *                    because robots.txt path matching is anchored at the host
 *                    root — the EN entry does NOT cover `/es/*`.
 */
export const CRAWLER_DISALLOW_PATHS: readonly string[] = [
  '/api/',
  '/og/',
  '/unsubscribe/',
  '/es/unsubscribe/',
];
