/**
 * HowTo step extraction — Phase 1.18 §12.7.
 *
 * Walks the markdown body line-by-line: each H2 becomes a `HowToStep.name`,
 * the lines that follow until the next H2 become the step's `text` (with
 * Markdown markers stripped). The leading H2 is skipped if it reads
 * "Overview" or "Before you start" (case-insensitive) — that's framing
 * copy, not a step.
 *
 * Used only for resource entries with `schemaType: 'HowTo'` (one entry at
 * launch — `how-to-choose-a-landscaper`).
 */

export type HowToStep = {
  name: string;
  text: string;
};

const SKIP_LEADING_H2 = new Set(['overview', 'before you start']);

function stripInline(text: string): string {
  return text
    .replace(/`[^`]*`/g, '')
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[*_~]/g, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractHowToSteps(markdown: string): HowToStep[] {
  const lines = markdown.split(/\r?\n/);
  const steps: HowToStep[] = [];
  let current: {name: string; lines: string[]} | null = null;
  let inFence = false;

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const h2Match = line.match(/^##\s+(.+?)\s*$/);
    if (h2Match) {
      if (current) {
        const text = stripInline(current.lines.join(' '));
        if (text) steps.push({name: current.name, text});
      }
      const heading = h2Match[1].trim();
      const isFirst = steps.length === 0 && current === null;
      if (isFirst && SKIP_LEADING_H2.has(heading.toLowerCase())) {
        current = null;
        continue;
      }
      current = {name: heading, lines: []};
      continue;
    }

    if (current && line.trim()) {
      current.lines.push(line);
    }
  }

  if (current) {
    const text = stripInline(current.lines.join(' '));
    if (text) steps.push({name: current.name, text});
  }

  return steps;
}
