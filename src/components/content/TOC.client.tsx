'use client';

import * as React from 'react';

type TocItem = {id: string; text: string};

type TOCProps = {
  items: TocItem[];
  /** Localized strings — "On this page" / "En esta página". */
  labelOnThisPage: string;
  /** Localized "Table of contents" / "Tabla de contenidos". */
  labelTableOfContents: string;
  /**
   * `inline` renders the collapsed `<details>` summary used below xl.
   * `sticky` renders the right-rail aside used at xl+ (1280+).
   * The `<ProseLayout>` renders both — one in the prose column above the
   * body, one in a separate grid column at xl+.
   */
  mode: 'inline' | 'sticky';
};

/**
 * `<TOC>` — Phase 1.18 §13.3.
 *
 * Active-item highlight is `IntersectionObserver`-driven (not entrance
 * motion). The IO config (`-30% 0px -60% 0px`) means a heading registers
 * as active when its top edge crosses the upper-third of the viewport.
 *
 * Rendered twice on the detail templates (inline + sticky); each instance
 * runs its own IO observer. The cost is small (one observer per page,
 * disposed on unmount); the benefit is that the layout grid is clean and
 * neither instance needs to know about the other.
 */
export default function TOC({
  items,
  labelOnThisPage,
  labelTableOfContents,
  mode,
}: TOCProps) {
  const [activeId, setActiveId] = React.useState<string | null>(
    items[0]?.id ?? null,
  );

  React.useEffect(() => {
    if (items.length === 0) return;
    const headings = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              (a.target as HTMLElement).getBoundingClientRect().top -
              (b.target as HTMLElement).getBoundingClientRect().top,
          );
        if (visible.length > 0) {
          setActiveId((visible[0].target as HTMLElement).id);
        }
      },
      {rootMargin: '-30% 0px -60% 0px', threshold: 0},
    );
    headings.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    history.replaceState(null, '', `#${id}`);
    el.scrollIntoView({behavior: 'smooth', block: 'start'});
    setActiveId(id);
  };

  const list = (
    <ol
      className="toc__list m-0 p-0 list-none"
      style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)'}}
    >
      {items.map((it) => {
        const active = activeId === it.id;
        return (
          <li key={it.id} className="toc__item">
            <a
              href={`#${it.id}`}
              onClick={(e) => handleClick(e, it.id)}
              className="toc__link"
              style={{
                display: 'block',
                fontSize: 'var(--text-body-sm)',
                lineHeight: 'var(--leading-snug)',
                color: active
                  ? 'var(--color-sunset-green-700)'
                  : 'var(--color-text-secondary)',
                fontWeight: active ? 600 : 400,
                paddingInlineStart: 'var(--spacing-3)',
                borderInlineStart: active
                  ? '3px solid var(--color-sunset-green-500)'
                  : '3px solid transparent',
                marginInlineStart: '-3px',
                textDecoration: 'none',
                transition: 'color var(--motion-fast) var(--easing-standard)',
              }}
            >
              {it.text}
            </a>
          </li>
        );
      })}
    </ol>
  );

  if (mode === 'inline') {
    return (
      <details
        className="toc toc--collapsed xl:hidden"
        style={{
          background: 'var(--color-bg-cream)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--spacing-4) var(--spacing-5)',
          marginBlockEnd: 'var(--spacing-8)',
        }}
      >
        <summary
          className="font-heading"
          style={{
            cursor: 'pointer',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            fontSize: 'var(--text-body-sm)',
            letterSpacing: 'var(--tracking-snug)',
            listStyle: 'revert',
          }}
        >
          {labelTableOfContents}
        </summary>
        <nav
          aria-label={labelTableOfContents}
          style={{marginBlockStart: 'var(--spacing-4)'}}
        >
          {list}
        </nav>
      </details>
    );
  }

  return (
    <aside
      className="toc toc--sticky hidden xl:block"
      aria-labelledby="toc-heading"
      style={{
        position: 'sticky',
        top: 'calc(72px + var(--spacing-8))',
        maxWidth: '240px',
        alignSelf: 'flex-start',
      }}
    >
      <p
        id="toc-heading"
        className="m-0"
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 600,
          fontSize: '12px',
          letterSpacing: 'var(--tracking-eyebrow)',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          paddingBlockEnd: 'var(--spacing-3)',
          borderBlockEnd: '1px solid var(--color-border)',
          marginBlockEnd: 'var(--spacing-4)',
        }}
      >
        {labelOnThisPage}
      </p>
      <nav aria-labelledby="toc-heading">{list}</nav>
    </aside>
  );
}
