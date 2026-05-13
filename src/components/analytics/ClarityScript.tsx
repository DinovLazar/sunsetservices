'use client';

import Script from 'next/script';
import {useConsent} from '@/hooks/useConsent';

/**
 * ClarityScript — Phase 2.10.
 *
 * Loads Microsoft Clarity's bootstrap snippet directly (not through GTM)
 * per the 2026-05-13 Decisions log: "Microsoft Clarity loaded directly
 * (not through GTM)". Same env + consent gates as `<GTMScript>`.
 *
 * Cowork Part B can swap to a GTM-hosted Clarity tag later by deleting
 * this component's mount in the layout and adding the Clarity tag template
 * inside GTM — nothing else changes.
 */
export default function ClarityScript() {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  const enabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';
  const {state} = useConsent();

  if (!enabled || !projectId || state !== 'accepted') return null;

  return (
    <Script
      id="clarity-init"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window,document,"clarity","script","${projectId}");
        `,
      }}
    />
  );
}
