/**
 * Privacy Policy — hard-coded English legal content (Phase B.03e).
 *
 * Replaces the former Termly embed (Path B, retired in B.03e). English-only:
 * this exact text is served on BOTH the EN route (/privacy/) and the ES route
 * (/es/privacy/). The consuming page (LegalPageBody) wraps `<Body />` in a
 * `lang="en"` container and renders it inside the brand `.legal-doc` prose
 * chrome; the page hero supplies the H1, so this body starts at the
 * Effective/Last-Updated line (no second H1 — keeps the heading hierarchy clean).
 *
 * CAVEAT: provided for general information; NOT certified legal advice. Warrants
 * attorney review before launch. Edits are a deliberate code change + redeploy
 * (git audit trail) — see Sunset-Services-Decisions.md 2026-06-02 (Phase B.03e).
 * Text runs use `{`…`}` string-expression children so straight quotes/apostrophes
 * stay verbatim without tripping react/no-unescaped-entities.
 */
export const title = 'Privacy Policy';
export const effectiveDate = 'June 2, 2026';
export const lastUpdated = 'June 2, 2026';

export function Body() {
  return (
    <>
      <p>
        <strong>Effective Date:</strong> {effectiveDate} · <strong>Last Updated:</strong>{' '}
        {lastUpdated}
      </p>
      <p>
        {`This Privacy Policy explains how E VALLE INC, doing business as Sunset Services U.S. ("Sunset Services," "we," "us," or "our"), collects, uses, and shares information when you visit `}
        <strong>sunsetservices.us</strong>
        {` (the "Site") or contact us for landscaping, hardscaping, waterproofing, or snow-removal services. We serve homeowners, HOA boards, and commercial property managers primarily in Aurora, Naperville, and the surrounding western Chicago suburbs of Illinois.`}
      </p>
      <p>
        {`This Policy is provided for general informational purposes and is written in plain language so it is easy to understand. By using the Site, you agree to this Policy.`}
      </p>

      <h2>{`1. Information We Collect`}</h2>
      <p>{`We collect only the information needed to respond to you and provide our services:`}</p>
      <ul>
        <li>
          <strong>Contact form.</strong>
          {` When you use our contact form, we collect your name, email address, phone number, the service category you select, and the contents of your message.`}
        </li>
        <li>
          <strong>{`"Request a Quote" wizard.`}</strong>
          {` Our multi-step quote tool collects the service division you select, your property type (residential or commercial), details about your project, and—on the final step—your name, email address, U.S. phone number, and property address. You may also choose to upload photos of your project area, which we store as image files solely to prepare your estimate.`}
        </li>
        <li>
          <strong>Newsletter signup.</strong>
          {` If you subscribe to our newsletter, we collect your email address. Every newsletter includes a working unsubscribe link.`}
        </li>
        <li>
          <strong>AI chat.</strong>
          {` Our Site offers an AI chat assistant powered by Anthropic's Claude. If you choose to share them, the assistant can capture your name and email address, and we store the conversation transcript for that session to help us respond to you.`}
        </li>
        <li>
          <strong>Booking.</strong>
          {` We use Calendly to let you book consultations. When you book, Calendly collects your name, email, and scheduling details.`}
        </li>
        <li>
          <strong>Automatically collected information.</strong>
          {` With your consent (see Section 4), we and our analytics providers collect usage information such as your IP address, device and browser type, pages viewed, links clicked, and how you interact with the Site, including heatmaps and session recordings.`}
        </li>
      </ul>

      <h2>{`2. How We Use Your Information`}</h2>
      <p>
        {`We use the information we collect to: respond to your inquiries and chat messages; prepare and deliver quotes and estimates; schedule and provide our services; send you our newsletter and service updates if you have asked to receive them; operate, secure, and improve the Site; and comply with our legal obligations.`}
      </p>

      <h2>{`3. How We Share Your Information — Service Providers`}</h2>
      <p>
        {`We do `}
        <strong>not</strong>
        {` sell your personal information. We share information only with trusted service providers ("processors") that help us run our business, and only as needed to provide their services to us:`}
      </p>
      <ul>
        <li>
          <strong>Sanity</strong>
          {` — content management and secure storage of leads and quote submissions.`}
        </li>
        <li>
          <strong>Resend</strong>
          {` — delivery of transactional emails (such as quote confirmations).`}
        </li>
        <li>
          <strong>Calendly</strong>
          {` — consultation booking.`}
        </li>
        <li>
          <strong>Anthropic</strong>
          {` — the Claude AI that powers our chat assistant.`}
        </li>
        <li>
          <strong>Google</strong>
          {` — Google Analytics and Google Tag Manager (analytics), Google Places/Maps (address autocomplete on the quote form), and Google Business Profile (to display our reviews).`}
        </li>
        <li>
          <strong>Microsoft Clarity</strong>
          {` — heatmaps and session recordings to understand how visitors use the Site.`}
        </li>
        <li>
          <strong>Vercel</strong>
          {` — website hosting and privacy-friendly, cookieless site analytics.`}
        </li>
      </ul>
      <p>
        {`We may also use a customer-relationship-management (CRM) tool to manage customer relationships. We may share information when required by law, to enforce our agreements, or in connection with a sale or transfer of our business.`}
      </p>
      <p>
        {`Your lead and quote submissions are emailed to us and stored in our business systems.`}
      </p>

      <h2>{`4. Cookies, Analytics & Your Consent Choices`}</h2>
      <p>
        {`We use cookies and similar technologies, which are gated behind a cookie-consent banner using `}
        <strong>Google Consent Mode v2</strong>
        {`. When you first visit, you can accept or decline categories of cookies:`}
      </p>
      <ul>
        <li>
          <strong>Necessary</strong>
          {` — required for the Site to function; always on.`}
        </li>
        <li>
          <strong>Analytics</strong>
          {` — help us understand how the Site is used (e.g., Google Analytics, Microsoft Clarity).`}
        </li>
        <li>
          <strong>Marketing</strong>
          {` — support advertising and measuring its effectiveness.`}
        </li>
        <li>
          <strong>Personalization</strong>
          {` — remember your preferences to tailor your experience.`}
        </li>
      </ul>
      <p>
        {`Non-essential cookies are not set until you consent. You can change your choices at any time through the banner or your browser settings. We also honor recognized browser-based opt-out signals, such as Global Privacy Control (GPC), for analytics and marketing where applicable.`}
      </p>
      <p>
        <strong>{`Session recording disclosure (Microsoft Clarity).`}</strong>
        {` We partner with Microsoft Clarity and Microsoft Advertising to capture how you use and interact with our website through behavioral metrics, heatmaps, and session replay to improve and market our products/services. Website usage data is captured using first- and third-party cookies and other tracking technologies to determine the popularity of products/services and online activity. Additionally, we use this information for site optimization, fraud/security purposes, and advertising. For more information about how Microsoft collects and uses your data, visit the Microsoft Privacy Statement.`}
      </p>
      <p>
        <strong>Vercel Web Analytics</strong>
        {` is cookieless and stores only anonymized, aggregated data. Our use of Google Maps/Places features is also subject to Google's Privacy Policy, which is incorporated here by reference.`}
      </p>

      <h2>{`5. Biometric Information`}</h2>
      <p>
        {`We do `}
        <strong>not</strong>
        {` collect, capture, store, or use biometric identifiers or biometric information as those terms are defined by the Illinois Biometric Information Privacy Act (BIPA). Photos you upload through our quote tool are ordinary images used only to prepare your estimate; we do not perform facial recognition or any biometric scanning on them.`}
      </p>

      <h2>{`6. Your Privacy Choices and Rights`}</h2>
      <p>
        {`We want you to be in control of your information. Regardless of where you live, you may ask us to:`}
      </p>
      <ul>
        <li>{`access the personal information we hold about you;`}</li>
        <li>{`correct inaccurate information;`}</li>
        <li>{`delete your information (subject to legal exceptions); and`}</li>
        <li>
          {`unsubscribe from marketing emails at any time using the unsubscribe link or by contacting us.`}
        </li>
      </ul>
      <p>
        {`To make a request, email us at `}
        <strong>info@sunsetservices.us</strong>
        {`. We will respond within a reasonable time and may need to verify your identity. We will not discriminate against you for exercising these choices.`}
      </p>

      <h2>{`7. Data Retention`}</h2>
      <p>
        {`We keep personal information only as long as needed for the purposes described in this Policy—such as responding to your inquiry, providing services, and meeting legal, tax, and accounting requirements—and then delete or de-identify it. Newsletter data is kept until you unsubscribe.`}
      </p>

      <h2>{`8. Data Security`}</h2>
      <p>
        {`We maintain reasonable administrative, technical, and physical safeguards designed to protect your information, and we require our service providers to do the same. No method of transmission or storage is completely secure, but if a data breach affecting Illinois residents' personal information occurs, we will notify affected individuals (and, where required, the Illinois Attorney General) in accordance with the Illinois Personal Information Protection Act (PIPA).`}
      </p>

      <h2>{`9. Children's Privacy`}</h2>
      <p>
        {`The Site is intended for a general audience and is not directed to children under 13 (or under 16). We do not knowingly collect personal information from children. If you believe a child has provided us information, contact us and we will delete it.`}
      </p>

      <h2>{`10. Third-Party Links`}</h2>
      <p>
        {`Our Site may link to third-party websites and services we do not control. This Policy does not apply to them; please review their privacy policies.`}
      </p>

      <h2>{`11. Changes to This Policy`}</h2>
      <p>
        {`We may update this Policy from time to time. We will post the updated version here with a new "Last Updated" date and encourage you to review it periodically.`}
      </p>

      <h2>{`12. How to Contact Us`}</h2>
      <p>
        {`E VALLE INC, doing business as Sunset Services U.S.`}
        <br />
        {`1630 Mountain St, Aurora, IL 60505`}
        <br />
        {`Phone: (630) 946-9321`}
        <br />
        {`Email: info@sunsetservices.us`}
      </p>
      <p>
        <em>
          {`This Privacy Policy is provided for general information and does not constitute legal advice.`}
        </em>
      </p>
    </>
  );
}
