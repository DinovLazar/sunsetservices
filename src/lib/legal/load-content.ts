import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {createSlugFactory} from '@/lib/proseSlug';

export type LegalHeading = {id: string; text: string; level: 2 | 3};
export type LegalContent = {html: string; headings: LegalHeading[]};
export type LegalPolicyType = 'privacy' | 'terms';

const PLACEHOLDER_MARKER = 'TERMLY_HTML_PLACEHOLDER';
const MIN_BODY_LENGTH = 300;

export async function loadLegalContent(
  type: LegalPolicyType,
  locale: string,
): Promise<LegalContent | null> {
  const filePath = path.join(
    process.cwd(),
    'src',
    'content',
    'legal',
    `${type}-${locale}.html`,
  );
  let raw: string;
  try {
    raw = await readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
  if (raw.includes(PLACEHOLDER_MARKER)) {
    return null;
  }
  const stripped = raw.replace(/<!--[\s\S]*?-->/g, '').trim();
  if (stripped.length < MIN_BODY_LENGTH) {
    return null;
  }
  return injectHeadingIds(raw);
}

function injectHeadingIds(html: string): LegalContent {
  const headings: LegalHeading[] = [];
  const nextSlug = createSlugFactory();

  const processed = html.replace(
    /<(h[23])\b([^>]*)>([\s\S]*?)<\/\1>/gi,
    (_match, tag: string, attrs: string, inner: string) => {
      const text = inner.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (!text) {
        return `<${tag}${attrs}>${inner}</${tag}>`;
      }
      const level: 2 | 3 = tag.toLowerCase() === 'h2' ? 2 : 3;
      const existingIdMatch = attrs.match(/\bid\s*=\s*['"]([^'"]+)['"]/i);
      const id = existingIdMatch ? existingIdMatch[1] : nextSlug(text);
      const newAttrs = existingIdMatch ? attrs : ` id="${id}"${attrs}`;
      headings.push({id, text, level});
      return `<${tag}${newAttrs}>${inner}</${tag}>`;
    },
  );

  return {html: processed, headings};
}
