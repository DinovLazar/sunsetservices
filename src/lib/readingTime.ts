/**
 * Reading-time + word-count estimator — Phase 1.18 §12.6.
 *
 * Strips fenced code blocks, inline code, link syntax, and Markdown
 * markers, then divides the surviving word count by `WPM = 200`
 * (ratified D14.5).
 */

const WPM = 200;

export function estimateReadingTime(markdown: string): {
  wordCount: number;
  readingMinutes: number;
} {
  const stripped = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[#>*_~`|:-]/g, ' ');
  const wordCount = stripped.split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / WPM));
  return {wordCount, readingMinutes};
}
