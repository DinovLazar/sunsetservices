import {randomUUID} from 'node:crypto';

/**
 * Shared structured-block → Sanity PortableText converter
 * (Phase 2.17, factored out from Phase 2.16's blog drafter).
 *
 * Anthropic drafters (blog + portfolio) return body content as an array of
 * structured blocks with a discriminated `type` and either a `text` field
 * (h2/p) or an `items` array (ul/ol). This helper wraps each input block
 * into a Sanity Portable Text block with fresh per-block + per-child
 * `_key` values (Sanity Studio's array renderer requires keyed children).
 *
 * No Markdown parser is involved — the model is instructed to emit blocks
 * directly, and the converter is deterministic. Both blog and portfolio
 * drafts use this helper to keep their PortableText output identical in
 * shape (the Sanity Studio editor handles them the same).
 */

export type DraftBlock =
  | {type: 'h2'; text: string}
  | {type: 'p'; text: string}
  | {type: 'ul'; items: string[]}
  | {type: 'ol'; items: string[]};

export type SanityBlock = {
  _type: 'block';
  _key: string;
  style?: string;
  listItem?: 'bullet' | 'number';
  level?: number;
  children: Array<{_type: 'span'; _key: string; text: string; marks: string[]}>;
  markDefs: never[];
};

export function makeKey(): string {
  return randomUUID().replace(/-/g, '').slice(0, 12);
}

function textBlock(style: string, text: string): SanityBlock {
  return {
    _type: 'block',
    _key: makeKey(),
    style,
    children: [{_type: 'span', _key: makeKey(), text, marks: []}],
    markDefs: [],
  };
}

function listBlock(listItem: 'bullet' | 'number', text: string): SanityBlock {
  return {
    _type: 'block',
    _key: makeKey(),
    style: 'normal',
    listItem,
    level: 1,
    children: [{_type: 'span', _key: makeKey(), text, marks: []}],
    markDefs: [],
  };
}

export function toPortableTextBlocks(blocks: DraftBlock[]): SanityBlock[] {
  const result: SanityBlock[] = [];
  for (const block of blocks) {
    if (block.type === 'h2') {
      result.push(textBlock('h2', block.text));
    } else if (block.type === 'p') {
      result.push(textBlock('normal', block.text));
    } else if (block.type === 'ul') {
      for (const item of block.items) result.push(listBlock('bullet', item));
    } else {
      for (const item of block.items) result.push(listBlock('number', item));
    }
  }
  return result;
}
