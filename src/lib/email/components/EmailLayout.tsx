import * as React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Heading,
} from '@react-email/components';
import {emailTokens as T} from '../tokens';

/**
 * Shared email layout primitive (Phase 2.08).
 *
 * Every branded template renders inside this layout: brand-tinted header,
 * sandbox banner (conditional), body slot, NAP footer with optional
 * unsubscribe link. Email-safe inline styles only — no CSS variables.
 */
export type EmailLayoutProps = {
  preheader: string;
  locale: 'en' | 'es';
  /**
   * Address the email would go to in non-sandbox mode. When set, a warning
   * banner renders above the body explaining the rerouted send. The
   * `sendBrandedEmail()` utility passes this when RESEND_DOMAIN_VERIFIED=false.
   */
  intendedRecipient?: string;
  /**
   * Optional unsubscribe URL. Newsletter emails pass it once an unsubscribe
   * endpoint ships (post Phase 2.08). Other templates omit it.
   */
  unsubscribeUrl?: string;
  children: React.ReactNode;
};

export function EmailLayout({
  preheader,
  locale,
  intendedRecipient,
  unsubscribeUrl,
  children,
}: EmailLayoutProps) {
  return (
    <Html lang={locale}>
      <Head>
        <meta name="color-scheme" content="light" />
      </Head>
      <Preview>{preheader}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {intendedRecipient ? <SandboxBanner intendedRecipient={intendedRecipient} /> : null}

          {/* Header — wordmark only (image-blocking in Outlook makes logo unreliable for v1). */}
          <Section style={headerSectionStyle}>
            <Heading as="h1" style={brandWordmarkStyle}>
              {T.business.name}
            </Heading>
          </Section>

          {/* Body slot. */}
          <Section style={bodySectionStyle}>{children}</Section>

          <Hr style={hrStyle} />

          {/* Footer — NAP + copyright + optional unsubscribe. */}
          <Section style={footerSectionStyle}>
            <Text style={footerLineStyle}>
              <strong style={{color: T.color.textSecondary}}>{T.business.name}</strong>
              {' · '}
              {T.business.addressLine1}, {T.business.addressLine2}
            </Text>
            <Text style={footerLineStyle}>
              <Link href={`tel:${T.business.phoneTel}`} style={footerLinkStyle}>
                {T.business.phone}
              </Link>
              {' · '}
              <Link href={`mailto:${T.business.email}`} style={footerLinkStyle}>
                {T.business.email}
              </Link>
              {' · '}
              <Link href={T.business.website} style={footerLinkStyle}>
                sunsetservices.us
              </Link>
            </Text>
            <Text style={copyrightStyle}>© 2026 Sunset Services. Aurora, IL.</Text>
            {unsubscribeUrl ? (
              <Text style={copyrightStyle}>
                {locale === 'es' ? (
                  <>
                    ¿No desea recibir estos correos?{' '}
                    <Link href={unsubscribeUrl} style={footerLinkStyle}>
                      Cancele su suscripción
                    </Link>
                    .
                  </>
                ) : (
                  <>
                    Don&apos;t want these emails?{' '}
                    <Link href={unsubscribeUrl} style={footerLinkStyle}>
                      Unsubscribe
                    </Link>
                    .
                  </>
                )}
              </Text>
            ) : null}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

function SandboxBanner({intendedRecipient}: {intendedRecipient: string}) {
  return (
    <Section style={sandboxBannerStyle}>
      <Text style={sandboxBannerTextStyle}>
        <strong>⚠ Sandbox mode.</strong> This email was originally addressed to{' '}
        <strong>{intendedRecipient}</strong>. After Resend domain verification this banner
        disappears and the message will route directly to the recipient.
      </Text>
    </Section>
  );
}

/**
 * Email button primitive — reused by templates.
 * Variants: 'primary' (solid green), 'amber' (solid amber), 'ghost' (outlined).
 */
export function EmailButton({
  href,
  text,
  variant = 'primary',
}: {
  href: string;
  text: string;
  variant?: 'primary' | 'amber' | 'ghost';
}) {
  const styles: React.CSSProperties =
    variant === 'amber'
      ? {
          backgroundColor: T.color.amber500,
          color: '#FFFFFF',
          border: `1px solid ${T.color.amber500}`,
        }
      : variant === 'ghost'
        ? {
            backgroundColor: T.color.bg,
            color: T.color.green700,
            border: `1px solid ${T.color.green500}`,
          }
        : {
            backgroundColor: T.color.green500,
            color: '#FFFFFF',
            border: `1px solid ${T.color.green500}`,
          };
  return (
    <Link
      href={href}
      style={{
        display: 'inline-block',
        padding: '12px 22px',
        borderRadius: 8,
        fontFamily: T.font.heading,
        fontSize: 15,
        fontWeight: 600,
        lineHeight: '1.2',
        textDecoration: 'none',
        marginRight: 8,
        marginBottom: 8,
        ...styles,
      }}
    >
      {text}
    </Link>
  );
}

// ─────────────────────── styles ───────────────────────

const bodyStyle: React.CSSProperties = {
  backgroundColor: T.color.bgCream,
  fontFamily: T.font.sans,
  color: T.color.textPrimary,
  margin: 0,
  padding: '24px 0',
};

const containerStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: T.size.containerMaxWidth,
  margin: '0 auto',
  backgroundColor: T.color.bg,
  borderRadius: 12,
  overflow: 'hidden',
  border: `1px solid ${T.color.border}`,
};

const sandboxBannerStyle: React.CSSProperties = {
  backgroundColor: T.color.sandboxBanner,
  borderBottom: `1px solid ${T.color.sandboxBannerBorder}`,
  padding: '12px 20px',
};

const sandboxBannerTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  lineHeight: '1.45',
  color: T.color.sandboxBannerText,
  fontFamily: T.font.sans,
};

const headerSectionStyle: React.CSSProperties = {
  padding: `${T.size.bodyPadding}px ${T.size.bodyPadding}px 0`,
  textAlign: 'left',
};

const brandWordmarkStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: T.font.heading,
  fontSize: 24,
  fontWeight: 700,
  color: T.color.green700,
  lineHeight: '1.2',
  letterSpacing: '-0.01em',
};

const bodySectionStyle: React.CSSProperties = {
  padding: `${T.size.bodyPadding}px`,
};

const hrStyle: React.CSSProperties = {
  borderColor: T.color.border,
  margin: `0 ${T.size.bodyPadding}px`,
};

const footerSectionStyle: React.CSSProperties = {
  padding: `20px ${T.size.bodyPadding}px ${T.size.bodyPadding}px`,
};

const footerLineStyle: React.CSSProperties = {
  margin: '0 0 4px',
  fontSize: 13,
  lineHeight: '1.55',
  color: T.color.textSecondary,
  fontFamily: T.font.sans,
};

const footerLinkStyle: React.CSSProperties = {
  color: T.color.textSecondary,
  textDecoration: 'underline',
};

const copyrightStyle: React.CSSProperties = {
  margin: '8px 0 0',
  fontSize: 12,
  lineHeight: '1.5',
  color: T.color.textMuted,
  fontFamily: T.font.sans,
};
