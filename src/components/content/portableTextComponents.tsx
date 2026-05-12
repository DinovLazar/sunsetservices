/**
 * PortableText serializers for blog + resource bodies — Phase 2.05.
 *
 * Maps Sanity Portable Text blocks to the same `.prose__*` class shape
 * the Phase 1.18 `renderProse()` Markdown renderer emitted, so the
 * existing `src/styles/prose.css` typography ships unchanged.
 *
 * Inline images use `next/image` via `urlFor()`.
 *
 * Server-safe: no `'use client'`. Plain helpers live in
 * `./portableTextHelpers.ts` so they can be called directly from server
 * components (TOC extraction + word count).
 */
import * as React from 'react';
import NextImage from 'next/image';
import {PortableText, type PortableTextComponents} from '@portabletext/react';
import type {
  PortableTextBlock,
  PortableTextMarkComponentProps,
} from '@portabletext/react';
import {Link} from '@/i18n/navigation';
import {urlFor} from '@sanity-lib/image';
import {blockToPlainText, slugify} from './portableTextHelpers';

// Re-export server-safe helpers so legacy imports of these names from this
// file continue to resolve. (Their canonical home is ./portableTextHelpers.)
export {
  blockToPlainText,
  blocksToPlainText,
  countWordsInBlocks,
  extractHeadingsFromBlocks,
  slugify,
} from './portableTextHelpers';

const isInternalHref = (href: string): boolean => href.startsWith('/');

type LinkValue = {_type: 'link'; href?: string};

function LinkMark({
  value,
  children,
}: PortableTextMarkComponentProps<LinkValue>) {
  const href = value?.href ?? '#';
  if (isInternalHref(href)) {
    return (
      <Link href={href} className="prose__link" prefetch={false}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="prose__link"
    >
      {children}
    </a>
  );
}

type SanityImageValue = {
  _type: 'image';
  asset: {_ref: string; _type: 'reference'};
  alt?: {en?: string; es?: string} | string;
  caption?: {en?: string; es?: string} | string;
};

function ImageBlock({value}: {value: SanityImageValue}) {
  if (!value?.asset) return null;
  const url = urlFor(value as never).width(1200).fit('max').auto('format').url();
  const altRaw = value.alt;
  const alt =
    typeof altRaw === 'string'
      ? altRaw
      : (altRaw?.en ?? altRaw?.es ?? '');
  return (
    <figure className="prose__figure">
      <NextImage
        src={url}
        alt={alt}
        width={1200}
        height={800}
        sizes="(max-width: 720px) 100vw, 720px"
        className="prose__img"
      />
    </figure>
  );
}

export const portableTextComponents: PortableTextComponents = {
  block: {
    h2: ({value, children}) => {
      const id = headingIdFromBlock(value);
      return (
        <h2 id={id} className="prose__h2">
          <a
            className="prose__anchor"
            href={`#${id}`}
            aria-label={`Anchor link`}
          >
            {children}
          </a>
        </h2>
      );
    },
    h3: ({value, children}) => {
      const id = headingIdFromBlock(value);
      return (
        <h3 id={id} className="prose__h3">
          {children}
        </h3>
      );
    },
    h4: ({children}) => <h4 className="prose__h4">{children}</h4>,
    h5: ({children}) => <h5 className="prose__h4">{children}</h5>,
    h6: ({children}) => <h6 className="prose__h4">{children}</h6>,
    blockquote: ({children}) => (
      <blockquote className="prose__quote">{children}</blockquote>
    ),
    normal: ({children}) => <p className="prose__p">{children}</p>,
  },
  list: {
    bullet: ({children}) => <ul className="prose__ul">{children}</ul>,
    number: ({children}) => <ol className="prose__ol">{children}</ol>,
  },
  listItem: {
    bullet: ({children}) => <li className="prose__li">{children}</li>,
    number: ({children}) => <li className="prose__li">{children}</li>,
  },
  marks: {
    em: ({children}) => <em>{children}</em>,
    strong: ({children}) => <strong>{children}</strong>,
    code: ({children}) => <code className="prose__code">{children}</code>,
    underline: ({children}) => <u>{children}</u>,
    'strike-through': ({children}) => <del>{children}</del>,
    link: LinkMark,
  },
  types: {
    image: ImageBlock as never,
  },
};

function headingIdFromBlock(block: PortableTextBlock | undefined): string {
  return slugify(blockToPlainText(block));
}

// Re-export the PortableText React component so consumers have a single
// import point.
export {PortableText};
