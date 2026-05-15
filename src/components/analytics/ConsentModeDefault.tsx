/**
 * ConsentModeDefault — Phase B.03.
 *
 * Emits the Google Consent Mode v2 `default` command BEFORE GTM loads.
 * Per Google's spec, the default command must precede any tag-management
 * script so tags only fire if/when the corresponding signal is granted.
 *
 * Sets all four signals to `'denied'` at page boot — the cookie banner
 * collects the visitor's choice and `pushConsentUpdate()` flips signals
 * to `'granted'` where applicable.
 *
 * App Router pattern: a plain inline `<script>` tag rendered server-side
 * in `<head>` (not `next/script` `beforeInteractive`, which is only valid
 * inside `pages/_document.js`). This runs synchronously during the
 * initial HTML parse — before GTM (`afterInteractive`) ever loads.
 *
 * Renders nothing when the master kill switch is off.
 */
export default function ConsentModeDefault() {
  const enabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';
  if (!enabled) return null;

  return (
    <script
      id="consent-mode-default"
      dangerouslySetInnerHTML={{
        __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied',
  'wait_for_update': 500
});
`.trim(),
      }}
    />
  );
}
