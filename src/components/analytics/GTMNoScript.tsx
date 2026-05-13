/**
 * GTMNoScript — Phase 2.10.
 *
 * Server component that emits the Google-mandated `<noscript>` iframe
 * fallback for JS-disabled visitors. Sits immediately after `<body>`
 * opens, per Google's install guide.
 *
 * Renders unconditionally (no consent check) because `<noscript>` only
 * activates when JavaScript is disabled — and a JS-disabled visitor can't
 * see our banner anyway, so there's no consent UI to gate against. The
 * environment-variable gates still apply: if analytics is disabled or no
 * GTM ID is present, the tag is omitted.
 */
export default function GTMNoScript() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const enabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';

  if (!enabled || !gtmId) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{display: 'none', visibility: 'hidden'}}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
