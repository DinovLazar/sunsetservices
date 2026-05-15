import Anthropic from '@anthropic-ai/sdk';
import {z} from 'zod';
import type {BlogTopic} from '@/data/blogTopics';

/**
 * Anthropic-powered bilingual blog draft generator (Phase 2.16).
 *
 * Output shape is a structured BlogDraft — title/dek/body/meta/FAQs in EN
 * and ES. ES carries a [TBR] prefix at the field level (Phase 2.11
 * convention); the operator either approves the ES first-pass via the
 * Telegram flow OR the post ships with [TBR] still visible until the Phase
 * 2.12 native-review queue gets to it.
 *
 * The model is told to return ONLY a JSON object matching BlogDraftSchema.
 * Zod validates; on a parse failure the generator retries ONCE with a
 * corrective prompt, then throws. The cron route catches the throw, alerts
 * the operator via notifyOperator, and returns 500.
 *
 * Body blocks are structured (not Markdown) so persistDraftPending can map
 * them deterministically to Sanity PortableText blocks without a Markdown
 * parser. The model is shown the exact JSON schema and asked to honor it.
 *
 * Token budget at default Sonnet 4.6 pricing (~$3/$15 per 1M):
 *   - System (~3K) + user (~500) + output (~3K) ≈ $0.04 per draft.
 * Well under the Anthropic monthly cap headroom for one cron run per month.
 */

const BlockSchema = z.discriminatedUnion('type', [
  z.object({type: z.literal('h2'), text: z.string().min(1)}),
  z.object({type: z.literal('p'), text: z.string().min(1)}),
  z.object({type: z.literal('ul'), items: z.array(z.string().min(1)).min(1)}),
  z.object({type: z.literal('ol'), items: z.array(z.string().min(1)).min(1)}),
]);

const LocalizedStringSchema = z.object({
  en: z.string().min(1),
  es: z.string().min(1),
});

const LocalizedBlocksSchema = z.object({
  en: z.array(BlockSchema).min(3),
  es: z.array(BlockSchema).min(3),
});

const FaqInlineSchema = z.object({
  q: LocalizedStringSchema,
  a: LocalizedStringSchema,
});

const BlogDraftSchema = z.object({
  title: LocalizedStringSchema,
  dek: LocalizedStringSchema,
  body: LocalizedBlocksSchema,
  metaTitle: LocalizedStringSchema,
  metaDescription: LocalizedStringSchema,
  faqsInline: z.array(FaqInlineSchema).min(3).max(5),
  proposedSlug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be kebab-case'),
});

export type BlogDraftBlock = z.infer<typeof BlockSchema>;
export type BlogDraft = z.infer<typeof BlogDraftSchema>;

const SYSTEM_PROMPT = `You are an expert landscape-services copywriter for Sunset Services, a family-owned landscape, hardscape, and snow-removal company serving DuPage County, Illinois (Aurora, Naperville, Wheaton, Lisle, Batavia, Bolingbrook).

VOICE
- Real person talking to a homeowner. Avoid corporate filler ("elevate your lifestyle", "vibrant outdoor sanctuary nestled in", "transform your space"). Write like you'd talk to a neighbor over the fence.
- Concrete > abstract. Cite real numbers, real timing, real product names where useful. No empty adjectives.
- Specific to DuPage County / northern Illinois climate (USDA zone 5b, freeze-thaw, etc.) where the topic warrants.
- ~800 words minimum in the body (counting all blocks, EN side).
- 3–5 FAQ Q&A pairs at the end. Real questions a homeowner would ask, real answers.

BILINGUAL OUTPUT
- EN: written naturally for a US English reader.
- ES: write the Spanish version naturally for a neutral Latin-American Spanish reader (Mexican-origin friendly), then PREFIX every Spanish string with "[TBR] " (literal, including the space). Example: "[TBR] El mejor momento para resembrar..."
- The [TBR] prefix MUST be on every es field: title.es, dek.es, body.es[].text or items[], metaTitle.es, metaDescription.es, faqsInline[].q.es, faqsInline[].a.es. It marks the ES first-pass for the native-review queue.
- Spanish must be idiomatic, not literal. Use "césped" for lawn, "patio" for patio, "adoquines" for pavers, "muro de contención" for retaining wall.

OUTPUT FORMAT
You MUST return EXACTLY one JSON object matching this TypeScript shape — no preamble, no Markdown fences, no explanation:

interface BlogDraft {
  title: {en: string; es: string};
  dek: {en: string; es: string};
  body: {
    en: Array<{type: 'h2'; text: string} | {type: 'p'; text: string} | {type: 'ul'; items: string[]} | {type: 'ol'; items: string[]}>;
    es: Array<{type: 'h2'; text: string} | {type: 'p'; text: string} | {type: 'ul'; items: string[]} | {type: 'ol'; items: string[]}>;
  };
  metaTitle: {en: string; es: string};  // ~55-60 chars EN
  metaDescription: {en: string; es: string};  // ~150-160 chars EN
  faqsInline: Array<{q: {en: string; es: string}; a: {en: string; es: string}}>;
  proposedSlug: string;  // kebab-case from EN title, ASCII-only, <= 60 chars
}

STRUCTURE GUIDANCE
- body.en should start with a 'p' block (intro hook, ~80-120 words), then alternate 'h2' section headers with 'p' / 'ul' / 'ol' blocks. End with a 'p' summary.
- 4–6 H2 sections is the sweet spot for ~800 words.
- Use 'ul' for cataloging items (signs to watch for, things to check) and 'ol' for sequenced steps. Don't overuse either — a body of pure lists reads stale.
- body.es mirrors the structure of body.en block-for-block (same block types in the same order), with each text/items value translated and [TBR]-prefixed.

Return ONLY the JSON. No code fences. No commentary.`;

function buildUserMessage(topic: BlogTopic): string {
  const cityLine = topic.cityHint ? `\nCity hint: ${topic.cityHint}` : '';
  return [
    `Topic keyword: ${topic.keyword}`,
    `Brief: ${topic.briefForModel}`,
    `Category: ${topic.category}${cityLine}`,
  ].join('\n');
}

function extractJsonString(text: string): string {
  // The model sometimes wraps JSON in ```json fences despite instructions. Strip them.
  const trimmed = text.trim();
  if (trimmed.startsWith('```')) {
    const inner = trimmed.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    return inner.trim();
  }
  return trimmed;
}

function getResponseText(response: Anthropic.Message): string {
  for (const block of response.content) {
    if (block.type === 'text') return block.text;
  }
  return '';
}

async function callAnthropic(
  client: Anthropic,
  model: string,
  userMessage: string,
  correctiveSuffix?: string,
): Promise<Anthropic.Message> {
  const text = correctiveSuffix ? `${userMessage}\n\n${correctiveSuffix}` : userMessage;
  return client.messages.create({
    model,
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{role: 'user', content: text}],
  });
}

export async function generateBlogDraft(topic: BlogTopic): Promise<BlogDraft> {
  const client = new Anthropic({apiKey: process.env.ANTHROPIC_API_KEY});
  const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';
  const userMessage = buildUserMessage(topic);

  // First attempt.
  const first = await callAnthropic(client, model, userMessage);
  const firstText = getResponseText(first);
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJsonString(firstText));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown-parse-error';
    // Retry once with a corrective prompt.
    const retry = await callAnthropic(
      client,
      model,
      userMessage,
      `Your previous response was not valid JSON (${message}). Return the JSON object only, with no preamble, no fences, no explanation.`,
    );
    const retryText = getResponseText(retry);
    parsed = JSON.parse(extractJsonString(retryText));
  }

  const zodResult = BlogDraftSchema.safeParse(parsed);
  if (zodResult.success) return zodResult.data;

  // Zod failed on first attempt — retry once with a detailed corrective prompt.
  const issueSummary = zodResult.error.issues
    .slice(0, 5)
    .map((i) => `- ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  const retry2 = await callAnthropic(
    client,
    model,
    userMessage,
    `Your previous response did not match the required JSON shape. Issues:\n${issueSummary}\n\nReturn a corrected JSON object only.`,
  );
  const retry2Text = getResponseText(retry2);
  const retry2Parsed = JSON.parse(extractJsonString(retry2Text));
  const retry2Result = BlogDraftSchema.safeParse(retry2Parsed);
  if (retry2Result.success) return retry2Result.data;

  const summary = retry2Result.error.issues
    .slice(0, 5)
    .map((i) => `${i.path.join('.')}: ${i.message}`)
    .join('; ');
  throw new Error(`BlogDraft schema validation failed after retry: ${summary}`);
}
