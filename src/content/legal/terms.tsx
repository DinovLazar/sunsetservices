/**
 * Terms of Service — hard-coded English legal content (Phase B.03e).
 *
 * Replaces the former Termly embed (Path B, retired in B.03e). English-only:
 * this exact text is served on BOTH the EN route (/terms/) and the ES route
 * (/es/terms/). The consuming page (LegalPageBody) wraps `<Body />` in a
 * `lang="en"` container and renders it inside the brand `.legal-doc` prose
 * chrome; the page hero supplies the H1, so this body starts at the
 * Effective/Last-Updated line (no second H1 — keeps the heading hierarchy clean).
 *
 * The all-caps disclaimer sections (§9 Warranties, §10 Limitation of Liability)
 * keep their emphasis as normal paragraphs with the uppercase text, per spec.
 *
 * CAVEAT: provided for general information; NOT certified legal advice. Warrants
 * attorney review before launch. Edits are a deliberate code change + redeploy
 * (git audit trail) — see Sunset-Services-Decisions.md 2026-06-02 (Phase B.03e).
 * Text runs use `{`…`}` string-expression children so straight quotes/apostrophes
 * stay verbatim without tripping react/no-unescaped-entities.
 */
export const title = 'Terms of Service';
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
        {`These Terms of Service ("Terms") govern your use of `}
        <strong>sunsetservices.us</strong>
        {` (the "Site"), operated by E VALLE INC, doing business as Sunset Services U.S. ("Sunset Services," "we," "us," or "our"). Please read them carefully. By accessing or using the Site, you agree to these Terms. If you do not agree, please do not use the Site.`}
      </p>

      <h2>{`1. Acceptance of Terms`}</h2>
      <p>
        {`By using the Site, you confirm that you are at least 18 years old (or have the consent of a parent or guardian) and that you agree to these Terms and our Privacy Policy.`}
      </p>

      <h2>{`2. Description of Services`}</h2>
      <p>
        {`Sunset Services provides residential and commercial landscaping, hardscaping (including Unilock-certified paver patios and retaining walls), waterproofing, and snow-removal services in Aurora, Naperville, and surrounding western Chicago suburbs. The Site provides information about our services and lets you contact us, request a quote, subscribe to our newsletter, chat with our AI assistant, and book consultations.`}
      </p>

      <h2>{`3. No Online Sales — Estimates Only`}</h2>
      <p>
        {`The Site does `}
        <strong>not</strong>
        {` sell products or services and does `}
        <strong>not</strong>
        {` process payments online. Any quotes, estimates, or pricing information provided through the Site (including through the quote wizard or AI chat) are non-binding estimates for informational purposes only and do not constitute a contract or an offer. All work is performed only under a separate written agreement between you and Sunset Services.`}
      </p>

      <h2>{`4. Accuracy of Information`}</h2>
      <p>
        {`We strive to keep the Site accurate and current, but content (including service descriptions, pricing ranges, and estimates) is provided "as is" and may contain errors, omissions, or out-of-date information. Estimates generated from the information you provide are preliminary and subject to an on-site assessment and a final written agreement.`}
      </p>

      <h2>{`5. User-Submitted Content and Photo Uploads`}</h2>
      <p>
        {`You may submit information and upload photos of your project area through the Site. You represent that you have the right to submit this content and that it does not infringe anyone's rights. By submitting content, you grant Sunset Services a non-exclusive, royalty-free license to use, store, and reproduce it as needed to respond to you, prepare your estimate, and provide our services. Do not upload anything unlawful, offensive, or that you do not have permission to share.`}
      </p>

      <h2>{`6. Acceptable Use`}</h2>
      <p>
        {`You agree not to misuse the Site, including by attempting to disrupt it, accessing it without authorization, uploading malware, or using it for any unlawful purpose.`}
      </p>

      <h2>{`7. Intellectual Property`}</h2>
      <p>
        {`The Site and its content—including text, graphics, logos, images, and the "Sunset Services" name and branding—are owned by or licensed to E VALLE INC and are protected by intellectual-property laws. You may not copy, reproduce, or use our content without our prior written permission, except as permitted by these Terms.`}
      </p>

      <h2>{`8. Third-Party Links and Services`}</h2>
      <p>
        {`The Site uses and links to third-party services (such as Google Maps and others). We are not responsible for the content, policies, or practices of third-party websites or services, and your use of them is at your own risk and subject to their terms.`}
      </p>

      <h2>{`9. Disclaimer of Warranties`}</h2>
      <p>
        {`THE SITE AND ITS CONTENT ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. We do not warrant that the Site will be uninterrupted, error-free, or secure. This section concerns your use of the Site only and does not affect any warranty we may provide in a separate written services agreement.`}
      </p>

      <h2>{`10. Limitation of Liability`}</h2>
      <p>
        {`TO THE FULLEST EXTENT PERMITTED BY LAW, E VALLE INC AND ITS OWNERS, EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF DATA, PROFITS, OR GOODWILL, ARISING FROM OR RELATED TO YOUR USE OF THE SITE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. Some jurisdictions do not allow certain limitations, so some of these limitations may not apply to you.`}
      </p>

      <h2>{`11. Indemnification`}</h2>
      <p>
        {`You agree to indemnify and hold harmless E VALLE INC and its owners, employees, and agents from any claims, losses, or expenses (including reasonable attorneys' fees) arising from your misuse of the Site, your content, or your violation of these Terms.`}
      </p>

      <h2>{`12. Governing Law and Venue`}</h2>
      <p>
        {`These Terms are governed by the laws of the State of Illinois, without regard to its conflict-of-laws rules. You agree that any dispute arising from these Terms or your use of the Site will be resolved exclusively in the state or federal courts located in or serving Kane County, Illinois, and you consent to their jurisdiction.`}
      </p>

      <h2>{`13. Dispute Resolution`}</h2>
      <p>
        {`Before filing any claim, you agree to first contact us at info@sunsetservices.us so we can try to resolve the matter informally. If we cannot, the dispute will be handled by the courts identified in Section 12.`}
      </p>

      <h2>{`14. Changes to These Terms`}</h2>
      <p>
        {`We may update these Terms from time to time. We will post the updated version here with a new "Last Updated" date. Your continued use of the Site after changes are posted means you accept the revised Terms.`}
      </p>

      <h2>{`15. Severability`}</h2>
      <p>
        {`If any provision of these Terms is found to be unenforceable, that provision will be limited or removed to the minimum extent necessary, and the remaining provisions will stay in full force.`}
      </p>

      <h2>{`16. Entire Agreement`}</h2>
      <p>
        {`These Terms and our Privacy Policy make up the entire agreement between you and Sunset Services regarding your use of the Site and supersede any prior agreements on that subject.`}
      </p>

      <h2>{`17. Contact Us`}</h2>
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
          {`These Terms of Service are provided for general information and do not constitute legal advice.`}
        </em>
      </p>
    </>
  );
}
