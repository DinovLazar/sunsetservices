/**
 * Markdown → HTML renderer for Resource + Blog post bodies — Phase 1.18.
 *
 * Server-only. Walks `marked.lexer` tokens once and emits prose-class HTML
 * along with a TOC of every H2 in document order.
 *
 * - H2 / H3 carry a stable `id` from {@link createSlugFactory}; H2s feed
 *   the on-page TOC (handover §13.3).
 * - The first paragraph encountered renders as `.prose__lede`; subsequent
 *   paragraphs render as `.prose__p`.
 * - Custom callout syntax inside `>` blockquotes:
 *     `> [!info] body…`     → `.prose__callout--info`
 *     `> [!warning] body…`  → `.prose__callout--warning`
 *     `> [!tip] body…`      → `.prose__callout--tip`
 *   Fallback for non-tagged blockquotes: `.prose__quote`.
 * - GFM tables are enabled and wrapped in `.prose__table-wrap` so they
 *   scroll horizontally on narrow viewports.
 * - Splice markers (`<!-- prose-split-h2-N -->`) are emitted between H2
 *   sections so the `ProseLayout` can insert the inline cross-link card
 *   between the second and third H2 and the inline location strip after
 *   the last H2 (handover §4.4 / §6.5).
 */

import {marked, type Token, type Tokens} from 'marked';
import {createSlugFactory} from '@/lib/proseSlug';

export type RenderedProse = {
  html: string;
  /** H2 entries (`{id, text}`) in document order. */
  toc: Array<{id: string; text: string}>;
};

type RenderState = {
  slugFactory: (input: string) => string;
  toc: Array<{id: string; text: string}>;
  firstParagraphSeen: boolean;
  h2Count: number;
};

const CALLOUT_PREFIX = /^\s*\[!(info|warning|tip)]\s*/i;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function plainText(tokens: Token[] | undefined): string {
  if (!tokens) return '';
  return tokens
    .map((t) => {
      const tok = t as {text?: string; tokens?: Token[]};
      if (tok.tokens && tok.tokens.length) return plainText(tok.tokens);
      if (typeof tok.text === 'string') return tok.text;
      return '';
    })
    .join('');
}

function renderInline(tokens: Token[] | undefined): string {
  if (!tokens) return '';
  return tokens.map(renderInlineToken).join('');
}

function renderInlineToken(token: Token): string {
  const t = token as Token & {type: string};
  switch (t.type) {
    case 'text': {
      const tt = token as Tokens.Text;
      if (tt.tokens && tt.tokens.length) return renderInline(tt.tokens);
      return escapeHtml(tt.text);
    }
    case 'escape':
      return escapeHtml((token as Tokens.Escape).text);
    case 'em':
      return `<em>${renderInline((token as Tokens.Em).tokens)}</em>`;
    case 'strong':
      return `<strong>${renderInline((token as Tokens.Strong).tokens)}</strong>`;
    case 'del':
      return `<del>${renderInline((token as Tokens.Del).tokens)}</del>`;
    case 'codespan':
      return `<code class="prose__code">${escapeHtml((token as Tokens.Codespan).text)}</code>`;
    case 'br':
      return '<br />';
    case 'link': {
      const l = token as Tokens.Link;
      const href = l.href ?? '#';
      const isExternal =
        /^https?:\/\//.test(href) && !href.includes('sunsetservices');
      const rel = isExternal ? ' rel="noopener"' : '';
      const target = isExternal ? ' target="_blank"' : '';
      const title = l.title ? ` title="${escapeHtml(l.title)}"` : '';
      return `<a class="prose__link" href="${escapeHtml(href)}"${title}${rel}${target}>${renderInline(l.tokens)}</a>`;
    }
    case 'image': {
      const i = token as Tokens.Image;
      const alt = escapeHtml(i.text ?? '');
      return `<img class="prose__img" src="${escapeHtml(i.href)}" alt="${alt}" loading="lazy" />`;
    }
    case 'html':
      return (token as Tokens.HTML).text;
    default:
      return '';
  }
}

function renderListItem(item: Tokens.ListItem): string {
  const tokens = item.tokens ?? [];
  const hasBlocks = tokens.some((t) =>
    ['list', 'blockquote', 'code', 'table', 'heading', 'hr'].includes(
      (t as Token & {type: string}).type,
    ),
  );
  if (!hasBlocks) {
    // Common case: a list item with one paragraph or a stretch of inline
    // tokens. Render inline.
    const inner = tokens
      .map((t) => {
        if ((t as Token & {type: string}).type === 'paragraph') {
          return renderInline((t as Tokens.Paragraph).tokens);
        }
        return renderInlineToken(t);
      })
      .join('');
    return `<li class="prose__li">${inner}</li>`;
  }
  // Block-level list item — render each child as a block.
  const inner = tokens.map((t) => renderBlockToken(t, NEUTRAL_STATE)).join('');
  return `<li class="prose__li">${inner}</li>`;
}

// State used when rendering inside a list item or other nested context —
// the lede/H2/TOC accounting only happens at the top level, so nested
// blocks share a sentinel state that doesn't mutate the document-level
// counters.
const NEUTRAL_STATE: RenderState = {
  slugFactory: (input) => input,
  toc: [],
  firstParagraphSeen: true,
  h2Count: 999,
};

function renderBlockToken(token: Token, state: RenderState): string {
  const t = token as Token & {type: string};
  switch (t.type) {
    case 'space':
      return '';
    case 'heading': {
      const h = token as Tokens.Heading;
      const text = plainText(h.tokens) || h.text;
      const safe = escapeHtml(text);
      if (h.depth === 2) {
        let prefix = '';
        if (state.h2Count > 0 && state !== NEUTRAL_STATE) {
          prefix = `<!-- prose-split-h2-${state.h2Count} -->`;
        }
        const id = state.slugFactory(text);
        if (state !== NEUTRAL_STATE) {
          state.toc.push({id, text});
          state.h2Count += 1;
        }
        return `${prefix}<h2 id="${id}" class="prose__h2"><a class="prose__anchor" href="#${id}" aria-label="Anchor link to '${safe}'">${safe}</a></h2>`;
      }
      if (h.depth === 3) {
        const id = state.slugFactory(text);
        return `<h3 id="${id}" class="prose__h3">${safe}</h3>`;
      }
      if (h.depth === 4) {
        return `<h4 class="prose__h4">${safe}</h4>`;
      }
      return `<p class="prose__p"><strong>${safe}</strong></p>`;
    }
    case 'paragraph': {
      const p = token as Tokens.Paragraph;
      const inner = renderInline(p.tokens);
      const cls = state.firstParagraphSeen ? 'prose__p' : 'prose__lede';
      state.firstParagraphSeen = true;
      return `<p class="${cls}">${inner}</p>`;
    }
    case 'list': {
      const l = token as Tokens.List;
      const tag = l.ordered ? 'ol' : 'ul';
      const cls = l.ordered ? 'prose__ol' : 'prose__ul';
      const items = l.items.map(renderListItem).join('');
      return `<${tag} class="${cls}">${items}</${tag}>`;
    }
    case 'blockquote': {
      const bq = token as Tokens.Blockquote;
      const firstChild = bq.tokens?.[0];
      let kind: 'info' | 'warning' | 'tip' | null = null;
      if (firstChild && (firstChild as Token & {type: string}).type === 'paragraph') {
        const raw = plainText((firstChild as Tokens.Paragraph).tokens);
        const m = raw.match(CALLOUT_PREFIX);
        if (m) kind = m[1].toLowerCase() as 'info' | 'warning' | 'tip';
      }
      if (kind && firstChild) {
        const para = firstChild as Tokens.Paragraph;
        const cloned: Tokens.Paragraph = {
          ...para,
          tokens: para.tokens.map((tk, idx) => {
            if (idx !== 0) return tk;
            const tx = tk as Tokens.Text;
            if (typeof tx.text !== 'string') return tk;
            return {...tx, text: tx.text.replace(CALLOUT_PREFIX, '')};
          }),
        };
        const rest = [cloned, ...bq.tokens.slice(1)];
        const inner = rest
          .map((tk) => {
            const subType = (tk as Token & {type: string}).type;
            if (subType === 'paragraph') {
              return `<p class="prose__callout-p">${renderInline((tk as Tokens.Paragraph).tokens)}</p>`;
            }
            return renderBlockToken(tk, NEUTRAL_STATE);
          })
          .join('');
        const labelMap = {info: 'Info', warning: 'Warning', tip: 'Tip'};
        return `<aside class="prose__callout prose__callout--${kind}" role="note" aria-label="${labelMap[kind]}">${inner}</aside>`;
      }
      const inner = (bq.tokens ?? [])
        .map((tk) => renderBlockToken(tk, NEUTRAL_STATE))
        .join('');
      return `<blockquote class="prose__quote">${inner}</blockquote>`;
    }
    case 'code': {
      const c = token as Tokens.Code;
      return `<pre class="prose__pre"><code class="prose__code-block">${escapeHtml(c.text)}</code></pre>`;
    }
    case 'hr':
      return `<hr class="prose__hr" />`;
    case 'table': {
      const tbl = token as Tokens.Table;
      const cell = (c: Tokens.TableCell, isHeader: boolean) => {
        const tag = isHeader ? 'th' : 'td';
        return `<${tag} class="prose__td">${renderInline(c.tokens)}</${tag}>`;
      };
      const head = `<thead class="prose__thead"><tr>${tbl.header.map((c) => cell(c, true)).join('')}</tr></thead>`;
      const body =
        `<tbody>` +
        tbl.rows
          .map((row) => `<tr>${row.map((c) => cell(c, false)).join('')}</tr>`)
          .join('') +
        `</tbody>`;
      return `<div class="prose__table-wrap"><table class="prose__table">${head}${body}</table></div>`;
    }
    case 'html':
      return (token as Tokens.HTML).text;
    default:
      return renderInlineToken(token);
  }
}

export function renderProse(markdown: string): RenderedProse {
  const state: RenderState = {
    slugFactory: createSlugFactory(),
    toc: [],
    firstParagraphSeen: false,
    h2Count: 0,
  };
  const tokens = marked.lexer(markdown, {gfm: true, breaks: false});
  const out = tokens.map((t) => renderBlockToken(t, state));
  if (state.h2Count > 0) out.push(`<!-- prose-split-h2-end -->`);
  return {html: out.filter(Boolean).join('\n'), toc: state.toc};
}
