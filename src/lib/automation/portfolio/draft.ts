import Anthropic from '@anthropic-ai/sdk';
import {z} from 'zod';
import {SERVICES} from '@/data/services';
import {LOCATION_SLUGS} from '@/data/locations';
import type {JobMetadata} from './extractJobMetadata';

/**
 * Anthropic-powered bilingual portfolio draft generator (Phase 2.17).
 *
 * Mirrors `src/lib/automation/blog/draft.ts` (Phase 2.16) — same SDK,
 * same retry pattern (one JSON-parse retry, one Zod-shape retry, then
 * throw) — but produces a portfolio entry instead of a blog post.
 *
 * Inputs come from the `extractJobMetadata` helper (Phase 2.17 Step 4)
 * and the uploaded-photo count (so the body can reference photos
 * naturally without over-promising). The job description, address,
 * and inferred audience/service/location are passed in as hints; the
 * model may override them based on the full context, except:
 *   - `audience` MUST be one of the three enum values.
 *   - `serviceSlug` MUST be from the whitelist generated from
 *     `src/data/services.ts`.
 *   - `locationSlug` MUST be from the six-city list.
 *
 * Both serviceSlug + locationSlug whitelists are enumerated in the
 * system prompt AND enforced by Zod, so an invalid model output
 * triggers the corrective-retry path automatically.
 *
 * `proposedSlug` is derived from `title.en` in code (kebab-case,
 * lowercase, alphanumeric + hyphens, ≤ 60 chars) — NOT asked of the
 * model. Sanity's slug.current field accepts kebab-case strings.
 *
 * Model defaults to `claude-sonnet-4-6` (env-flippable via
 * `ANTHROPIC_PORTFOLIO_MODEL`, falling back to `ANTHROPIC_MODEL`,
 * falling back to the hardcoded default). Phase 2.16 used the same
 * Sonnet 4.6 default for the blog drafter; portfolio entries are
 * shorter (~250–350 word body vs. ~800 for blog) so the per-draft
 * cost is roughly half — well under the chat-widget budget.
 */

const SERVICE_SLUG_WHITELIST = Array.from(new Set(SERVICES.map((s) => s.slug)));
const LOCATION_SLUG_WHITELIST = LOCATION_SLUGS as readonly string[];

const AudienceSchema = z.enum(['residential', 'commercial', 'hardscape']);

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

function makePortfolioDraftSchema() {
  return z.object({
    title: LocalizedStringSchema.refine((v) => v.en.length <= 70, {
      message: 'title.en must be ≤ 70 chars',
      path: ['en'],
    }),
    dek: LocalizedStringSchema,
    body: LocalizedBlocksSchema,
    audience: AudienceSchema,
    serviceSlug: z
      .string()
      .min(1)
      .refine((v) => SERVICE_SLUG_WHITELIST.includes(v), {
        message: `serviceSlug must be one of ${SERVICE_SLUG_WHITELIST.join(', ')}`,
      }),
    locationSlug: z
      .string()
      .min(1)
      .refine((v) => LOCATION_SLUG_WHITELIST.includes(v), {
        message: `locationSlug must be one of ${LOCATION_SLUG_WHITELIST.join(', ')}`,
      }),
  });
}

const PortfolioDraftSchemaWithoutSlug = makePortfolioDraftSchema();

export type PortfolioDraftBlock = z.infer<typeof BlockSchema>;
type PortfolioDraftWithoutSlug = z.infer<typeof PortfolioDraftSchemaWithoutSlug>;

export type PortfolioDraft = PortfolioDraftWithoutSlug & {proposedSlug: string};

function buildSystemPrompt(): string {
  return `You are an expert landscape-services copywriter for Sunset Services, a family-owned landscape, hardscape, and snow-removal company serving DuPage County, Illinois (Aurora, Naperville, Wheaton, Lisle, Batavia, Bolingbrook).

You are writing a SINGLE PORTFOLIO ENTRY (a "project case study") describing one completed job, for the portfolio grid at /projects/.

VOICE
- Real person describing finished work to a neighbor. No corporate filler ("elevate your lifestyle", "transform your outdoor sanctuary"). Concrete > abstract.
- Cite real materials, real techniques, real DuPage-County context (freeze-thaw, USDA zone 5b, the Fox River, etc.) where the job description hints at it.
- DO NOT invent specifics the job description doesn't support. If the description is sparse, write a sparse, honest entry — don't fabricate measurements, crew names, or homeowner quotes.

BILINGUAL OUTPUT
- EN: written naturally for a US English reader.
- ES: write the Spanish version naturally for a neutral Latin-American Spanish reader (Mexican-origin friendly), then PREFIX every Spanish string with "[TBR] " (literal, including the space). Example: "[TBR] Patio de adoquines en Naperville..."
- The [TBR] prefix MUST be on every ES field: title.es, dek.es, body.es[].text or items[]. It marks the ES first-pass for the native-review queue (Phase 2.12).
- Use "césped" for lawn, "patio" for patio, "adoquines" for pavers, "muro de contención" for retaining wall.

ALLOWED ENUMS
- audience: must be exactly one of: residential, commercial, hardscape.
- serviceSlug: must be exactly one of: ${SERVICE_SLUG_WHITELIST.join(', ')}.
- locationSlug: must be exactly one of: ${LOCATION_SLUG_WHITELIST.join(', ')}.

OUTPUT FORMAT
You MUST return EXACTLY one JSON object matching this TypeScript shape — no preamble, no Markdown fences, no explanation:

interface PortfolioDraft {
  title: {en: string; es: string};  // EN ≤ 70 chars
  dek: {en: string; es: string};    // ~30 words per locale
  body: {
    en: Array<{type: 'h2'; text: string} | {type: 'p'; text: string} | {type: 'ul'; items: string[]} | {type: 'ol'; items: string[]}>;
    es: Array<{type: 'h2'; text: string} | {type: 'p'; text: string} | {type: 'ul'; items: string[]} | {type: 'ol'; items: string[]}>;
  };
  audience: 'residential' | 'commercial' | 'hardscape';
  serviceSlug: string;
  locationSlug: string;
}

STRUCTURE GUIDANCE
- body should be 3–6 blocks. Suggested rhythm: opening 'p' (1–2 sentences setting the scene) → 'h2' "The work" → 'p' or 'ul' describing what was done → 'h2' "The result" → 'p' closing on the outcome.
- 'ul' blocks are good for materials lists or scope catalogs. 'ol' for sequenced phases. Don't overuse either.
- body.es mirrors body.en block-for-block (same block types in the same order), with each text/items value translated and [TBR]-prefixed.

Return ONLY the JSON. No code fences. No commentary.`;
}

function buildUserMessage(metadata: JobMetadata, photoCount: number): string {
  // Default fallbacks so the model ALWAYS has a valid value for the three
  // required taxonomy fields, even when the description is sparse.
  const fallbackAudience = metadata.inferredAudience ?? 'residential';
  const fallbackServiceSlug = metadata.inferredServiceSlug ?? 'landscape-maintenance';
  const fallbackLocationSlug = metadata.inferredLocationSlug ?? 'aurora';

  const lines = [
    'Job metadata (extracted from a ServiceM8 job.completed webhook):',
    `- jobUuid: ${metadata.jobUuid ?? 'n/a'}`,
    `- description: ${metadata.description ?? 'n/a'}`,
    `- address: ${metadata.address ?? 'n/a'}`,
    `- photo count uploaded to Sanity: ${photoCount}`,
    '',
    'Hints (best-effort heuristics — override only if you have strong reason from the description):',
    `- inferredAudience: ${metadata.inferredAudience ?? 'n/a'}`,
    `- inferredServiceSlug: ${metadata.inferredServiceSlug ?? 'n/a'}`,
    `- inferredLocationSlug: ${metadata.inferredLocationSlug ?? 'n/a'}`,
    '',
    'REQUIRED — you MUST include all three taxonomy fields in your JSON output. If the description is too sparse to choose confidently, fall back to these defaults:',
    `- audience: "${fallbackAudience}"`,
    `- serviceSlug: "${fallbackServiceSlug}"`,
    `- locationSlug: "${fallbackLocationSlug}"`,
    '',
    'Now return the JSON.',
  ];
  return lines.join('\n');
}

function stripFences(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith('```')) {
    return trimmed.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
  }
  return trimmed;
}

/**
 * Robust JSON extraction: strip Markdown fences, then balance braces to
 * extract the first complete top-level JSON object. Handles the case
 * where the model emits valid JSON followed by trailing prose (the
 * official Anthropic shape says "return JSON only" but in practice the
 * model occasionally appends a sentence or two of commentary).
 */
function extractJsonString(text: string): string {
  const inner = stripFences(text);
  const firstBrace = inner.indexOf('{');
  if (firstBrace === -1) return inner;

  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = firstBrace; i < inner.length; i++) {
    const ch = inner[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\') {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return inner.slice(firstBrace, i + 1);
    }
  }
  // Unbalanced — return the whole thing and let JSON.parse fail naturally.
  return inner.slice(firstBrace);
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
    max_tokens: 4000,
    system: buildSystemPrompt(),
    messages: [{role: 'user', content: text}],
  });
}

function slugifyTitle(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/**
 * Backfill the three required taxonomy fields (audience / serviceSlug /
 * locationSlug) on the model's output from the inferred hints if the
 * model omitted them. Acceptable because:
 *   - The hints come from the deterministic `extractJobMetadata` helper.
 *   - The model received the same hints in the system + user prompts and
 *     was told to fall back to them when uncertain — so this is just
 *     enforcing the "always include all three" contract server-side.
 *   - Final values are still subject to Zod whitelist validation, so
 *     bogus values still trigger the corrective-retry path.
 */
function backfillTaxonomy(
  parsed: unknown,
  metadata: JobMetadata,
): unknown {
  if (!parsed || typeof parsed !== 'object') return parsed;
  const obj = parsed as Record<string, unknown>;
  const audienceFallback = metadata.inferredAudience ?? 'residential';
  const serviceFallback = metadata.inferredServiceSlug ?? 'landscape-maintenance';
  const locationFallback = metadata.inferredLocationSlug ?? 'aurora';
  if (typeof obj.audience !== 'string') obj.audience = audienceFallback;
  if (typeof obj.serviceSlug !== 'string') obj.serviceSlug = serviceFallback;
  if (typeof obj.locationSlug !== 'string') obj.locationSlug = locationFallback;
  return obj;
}

export async function generatePortfolioDraft(args: {
  jobMetadata: JobMetadata;
  photoCount: number;
  modelOverride?: string;
}): Promise<PortfolioDraft> {
  const client = new Anthropic({apiKey: process.env.ANTHROPIC_API_KEY});
  const model =
    args.modelOverride ??
    process.env.ANTHROPIC_PORTFOLIO_MODEL ??
    process.env.ANTHROPIC_MODEL ??
    'claude-sonnet-4-6';
  const userMessage = buildUserMessage(args.jobMetadata, args.photoCount);

  const first = await callAnthropic(client, model, userMessage);
  const firstText = getResponseText(first);
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJsonString(firstText));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown-parse-error';
    const retry = await callAnthropic(
      client,
      model,
      userMessage,
      `Your previous response was not valid JSON (${message}). Return the JSON object only, with no preamble, no fences, no explanation.`,
    );
    parsed = JSON.parse(extractJsonString(getResponseText(retry)));
  }

  parsed = backfillTaxonomy(parsed, args.jobMetadata);

  let zodResult = PortfolioDraftSchemaWithoutSlug.safeParse(parsed);
  if (!zodResult.success) {
    const issueSummary = zodResult.error.issues
      .slice(0, 5)
      .map((i) => `- ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    const retry = await callAnthropic(
      client,
      model,
      userMessage,
      `Your previous response did not match the required JSON shape. Issues:\n${issueSummary}\n\nReturn a corrected JSON object only.`,
    );
    const retryParsed = backfillTaxonomy(
      JSON.parse(extractJsonString(getResponseText(retry))),
      args.jobMetadata,
    );
    zodResult = PortfolioDraftSchemaWithoutSlug.safeParse(retryParsed);
    if (!zodResult.success) {
      const summary = zodResult.error.issues
        .slice(0, 5)
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ');
      throw new Error(`PortfolioDraft schema validation failed after retry: ${summary}`);
    }
  }

  const proposedSlug = slugifyTitle(zodResult.data.title.en);
  if (!proposedSlug) {
    throw new Error('PortfolioDraft: derived slug is empty (title.en sluggified to nothing)');
  }
  return {...zodResult.data, proposedSlug};
}
