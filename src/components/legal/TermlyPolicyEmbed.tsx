import {getTranslations} from 'next-intl/server';
import type {LegalPolicyType} from '@/lib/legal/load-content';

type Props = {
  type: LegalPolicyType;
  locale: string;
  html: string | null;
};

/**
 * Renders the legal policy body — Phase B.03c (free-plan static-HTML path).
 *
 * On Termly's free plan, both script-embed strategies (`data-type="iframe"`
 * and `data-type="inline"`) are Pro+ paywalled. Free plan offers only the
 * HTML Format export. This component renders that static HTML inline so
 * (a) same-origin CSS overrides land on real content and (b) the TOC
 * sidebar can scroll-spy real headings.
 *
 * Selectors below match Termly's HTML Format output (`.termly-policy-content`
 * wrapper around `h1/h2/h3/p/li/td/strong/em/blockquote/table/a`) per
 * Phase B.02 §3.1.
 *
 * When `html` is null (placeholder file or unprovisioned route) the
 * "Legal content is being prepared" fallback card renders instead.
 */
export default async function TermlyPolicyEmbed({type, locale, html}: Props) {
  const t = await getTranslations({locale, namespace: 'legal.embed'});

  if (!html) {
    return (
      <div
        className="termly-policy-content"
        data-termly-type={type}
        data-state="fallback"
        style={{
          padding: 'var(--spacing-8)',
          background: 'var(--color-bg-cream)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 'var(--text-body)',
            lineHeight: 'var(--leading-relaxed)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {t('preparingFallback')}
        </p>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: TERMLY_CSS_OVERRIDES}} />
      <div
        className="termly-policy-content"
        data-termly-type={type}
        data-state="rendered"
        dangerouslySetInnerHTML={{__html: html}}
      />
    </>
  );
}

const TERMLY_CSS_OVERRIDES = `
  /* Phase B.02 §3.1 — aligns Termly's HTML Format output to locked design tokens. */
  .termly-policy-content,
  .termly-policy-content p,
  .termly-policy-content li,
  .termly-policy-content td {
    font-family: var(--font-body), system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    font-size: 17px;
    line-height: 1.65;
    color: var(--color-text-primary);
    font-weight: 400;
  }
  .termly-policy-content h1,
  .termly-policy-content h2,
  .termly-policy-content h3,
  .termly-policy-content h4 {
    font-family: var(--font-heading), system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    color: var(--color-text-primary);
    text-wrap: balance;
    letter-spacing: -0.01em;
  }
  /* H1 is rendered by the page hero, not by the policy body. */
  .termly-policy-content h1 { display: none; }
  .termly-policy-content h2 {
    font-size: 30px;
    font-weight: 700;
    line-height: 1.2;
    margin: 40px 0 12px;
    scroll-margin-top: 96px;
  }
  .termly-policy-content h3 {
    font-size: 22px;
    font-weight: 600;
    line-height: 1.25;
    margin: 28px 0 8px;
    scroll-margin-top: 96px;
  }
  .termly-policy-content h4 {
    font-size: 18px;
    font-weight: 600;
    margin: 20px 0 6px;
  }
  .termly-policy-content p { margin: 0 0 14px; }
  .termly-policy-content ul,
  .termly-policy-content ol { padding-left: 22px; margin: 0 0 14px; }
  .termly-policy-content li { margin: 4px 0; }
  .termly-policy-content ul li::marker { color: var(--color-sunset-green-500); }
  .termly-policy-content a {
    color: var(--color-sunset-green-700);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.18em;
    text-decoration-color: rgba(47, 93, 39, 0.4);
  }
  .termly-policy-content a:hover {
    text-decoration-color: rgba(47, 93, 39, 1);
  }
  .termly-policy-content a:focus-visible {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: 2px;
    border-radius: 2px;
  }
  .termly-policy-content table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0 20px;
    font-size: 15px;
  }
  .termly-policy-content th,
  .termly-policy-content td {
    border: 1px solid var(--color-border);
    padding: 10px 14px;
    text-align: left;
    vertical-align: top;
  }
  .termly-policy-content th {
    background: var(--color-bg-cream);
    font-family: var(--font-heading), sans-serif;
    font-weight: 600;
    color: var(--color-sunset-green-700);
  }
  .termly-policy-content strong {
    font-weight: 600;
    color: var(--color-text-primary);
  }
  .termly-policy-content em { font-style: italic; }
  .termly-policy-content blockquote {
    border-left: 4px solid var(--color-sunset-green-500);
    padding: 8px 0 8px 20px;
    margin: 16px 0;
    color: var(--color-text-secondary);
  }
`;
