/**
 * Server-safe helpers for working with PortableText blocks — Phase 2.05.
 *
 * Lives in its own file (no 'use client') so server components (page.tsx)
 * can call them directly. The React serializers in
 * `./portableTextComponents.tsx` are client-only and rely on these helpers.
 */
import type {PortableTextBlock} from '@portabletext/react';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Concatenate every span's text in a PT block. */
export function blockToPlainText(block: PortableTextBlock | undefined): string {
  if (!block || !Array.isArray((block as {children?: unknown[]}).children)) return '';
  return (block as {children: {text?: string}[]}).children
    .map((c) => c.text ?? '')
    .join('');
}

/** Extract `{id, text}` for every H2 block (drives the TOC). */
export function extractHeadingsFromBlocks(
  blocks: PortableTextBlock[],
): {id: string; text: string}[] {
  const out: {id: string; text: string}[] = [];
  for (const b of blocks) {
    if ((b as {style?: string}).style === 'h2') {
      const text = blockToPlainText(b);
      out.push({id: slugify(text), text});
    }
  }
  return out;
}

/** Sum word counts across every text mark in every block. */
export function countWordsInBlocks(blocks: PortableTextBlock[]): number {
  let total = 0;
  for (const b of blocks) {
    const children = (b as {children?: {text?: string}[]}).children;
    if (!Array.isArray(children)) continue;
    for (const c of children) {
      if (typeof c.text === 'string') {
        total += c.text.trim().split(/\s+/).filter(Boolean).length;
      }
    }
  }
  return total;
}

/** Concatenate every text span across every block. Used for reading-time est. */
export function blocksToPlainText(blocks: PortableTextBlock[]): string {
  return blocks
    .flatMap((b) => (b as {children?: {text?: string}[]}).children ?? [])
    .map((c) => c?.text ?? '')
    .join(' ');
}

const SKIP_LEADING_H2 = new Set(['overview', 'before you start']);

/**
 * Extract How-To step objects from PT blocks. Each H2 starts a new step;
 * the body blocks that follow until the next H2 contribute to that step's
 * text. Leading "Overview" / "Before you start" H2s are skipped (framing
 * copy, not steps). Mirrors the Phase 1.18 `extractHowToSteps()` rule for
 * the Markdown version.
 */
export function extractHowToStepsFromBlocks(
  blocks: PortableTextBlock[],
): {name: string; text: string}[] {
  const out: {name: string; text: string}[] = [];
  let current: {name: string; texts: string[]} | null = null;
  let leadingH2Seen = false;

  for (const b of blocks) {
    const style = (b as {style?: string}).style;
    const plain = blockToPlainText(b);
    if (style === 'h2') {
      if (current) {
        out.push({name: current.name, text: current.texts.join(' ').trim()});
        current = null;
      }
      const isFirst = !leadingH2Seen;
      leadingH2Seen = true;
      if (isFirst && SKIP_LEADING_H2.has(plain.toLowerCase())) {
        continue;
      }
      current = {name: plain, texts: []};
    } else if (current && plain) {
      current.texts.push(plain);
    }
  }
  if (current && current.texts.length > 0) {
    out.push({name: current.name, text: current.texts.join(' ').trim()});
  }
  return out;
}
