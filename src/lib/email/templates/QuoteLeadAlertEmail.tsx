import * as React from 'react';
import {Heading, Text, Section, Link, Hr} from '@react-email/components';
import {EmailLayout, EmailButton} from '../components/EmailLayout';
import {emailTokens as T} from '../tokens';
import type {QuoteSubmitInput} from '@/lib/quote/validation';

/**
 * QuoteLeadAlertEmail — to Erick when a wizard submission lands (Phase 2.08).
 *
 * Replaces the Phase 2.06 plaintext lead alert. Visitors never see this; it
 * goes to RESEND_TO_EMAIL only.
 */
export type QuoteLeadAlertEmailProps = {
  lead: QuoteSubmitInput;
  primaryServiceDisplayName: string;
  sanityDocId: string;
  locale: 'en' | 'es';
  intendedRecipient?: string;
};

export function QuoteLeadAlertEmail({
  lead,
  primaryServiceDisplayName,
  sanityDocId,
  locale,
  intendedRecipient,
}: QuoteLeadAlertEmailProps) {
  const fullName = `${lead.firstName} ${lead.lastName}`.trim();
  const addressLine1 = [lead.address.street, lead.address.unit].filter(Boolean).join(' ');
  const addressLine2 = `${lead.address.city}, ${lead.address.state} ${lead.address.zip}`;
  const studioUrl = `https://sunsetservices.sanity.studio/desk/quoteLead;${sanityDocId}`;

  return (
    <EmailLayout
      locale={locale}
      preheader={`New quote from ${lead.firstName} (${lead.audience}) — ${primaryServiceDisplayName}`}
      intendedRecipient={intendedRecipient}
    >
      <Heading as="h2" style={h1Style}>
        New quote request
      </Heading>
      <Text style={subheadStyle}>
        From <strong>{fullName}</strong> · {lead.email}
      </Text>

      {/* Contact */}
      <SectionHeader>Contact</SectionHeader>
      <KeyValue label="Name" value={fullName} />
      <KeyValue
        label="Email"
        value={
          <Link href={`mailto:${lead.email}`} style={inlineLinkStyle}>
            {lead.email}
          </Link>
        }
      />
      <KeyValue
        label="Phone"
        value={
          <Link href={`tel:${lead.phone}`} style={inlineLinkStyle}>
            {lead.phone}
          </Link>
        }
      />
      <KeyValue label="Address" value={`${addressLine1}, ${addressLine2}`} />
      {lead.contactPreferences ? (
        <KeyValue
          label="Prefs"
          value={[
            lead.contactPreferences.contactMethod
              ? `prefers ${lead.contactPreferences.contactMethod}`
              : null,
            lead.contactPreferences.bestTime,
          ]
            .filter(Boolean)
            .join(' · ')}
        />
      ) : null}

      {/* Project */}
      <SectionHeader>Project</SectionHeader>
      <AudienceBadge audience={lead.audience} />
      <KeyValue label="Primary service" value={primaryServiceDisplayName} />
      {lead.services.length > 1 ? (
        <KeyValue label="All services" value={lead.services.join(', ')} />
      ) : null}
      {lead.otherText ? <KeyValue label="Other (free text)" value={lead.otherText} /> : null}

      {lead.details ? (
        <>
          <SectionHeader>Details</SectionHeader>
          {lead.details.propertySize ? (
            <KeyValue label="Property size" value={`${lead.details.propertySize} sq ft`} />
          ) : null}
          {lead.details.bedrooms ? <KeyValue label="Bedrooms" value={lead.details.bedrooms} /> : null}
          {lead.details.numProperties ? (
            <KeyValue label="Properties" value={lead.details.numProperties} />
          ) : null}
          {lead.details.numBuildings ? (
            <KeyValue label="Buildings" value={lead.details.numBuildings} />
          ) : null}
          {lead.details.projectType ? (
            <KeyValue label="Project type" value={lead.details.projectType} />
          ) : null}
          {lead.details.contract ? <KeyValue label="Contract" value={lead.details.contract} /> : null}
          {lead.details.frequency ? (
            <KeyValue label="Frequency" value={lead.details.frequency} />
          ) : null}
          {lead.details.spaceType && lead.details.spaceType.length ? (
            <KeyValue label="Space type" value={lead.details.spaceType.join(', ')} />
          ) : null}
          {lead.details.dimensions ? (
            <KeyValue label="Dimensions" value={lead.details.dimensions} />
          ) : null}
          {lead.details.surface ? <KeyValue label="Surface" value={lead.details.surface} /> : null}
          {lead.details.features && lead.details.features.length ? (
            <KeyValue label="Features" value={lead.details.features.join(', ')} />
          ) : null}
          {lead.details.timeline ? <KeyValue label="Timeline" value={lead.details.timeline} /> : null}
          {lead.details.budget ? <KeyValue label="Budget" value={lead.details.budget} /> : null}
        </>
      ) : null}

      {lead.details?.notes ? (
        <>
          <SectionHeader>Notes</SectionHeader>
          <Text style={quoteBlockStyle}>{lead.details.notes}</Text>
        </>
      ) : null}

      {/* CTAs */}
      <Section style={{paddingTop: 8}}>
        <EmailButton
          variant="primary"
          href={`mailto:${lead.email}`}
          text={`Reply to ${lead.firstName}`}
        />
        <EmailButton variant="ghost" href={`tel:${lead.phone}`} text={`Call ${lead.firstName}`} />
      </Section>

      <Hr style={{margin: '20px 0 8px', borderColor: T.color.border}} />

      {/* Meta */}
      <Text style={metaStyle}>
        Submitted {new Date().toISOString()} · session {lead.sessionId} · locale {locale}
      </Text>
      <Text style={metaStyle}>
        <Link href={studioUrl} style={metaLinkStyle}>
          Open in Sanity Studio →
        </Link>
      </Text>
    </EmailLayout>
  );
}

// ─────────────────────── micro-primitives ───────────────────────

function SectionHeader({children}: {children: React.ReactNode}) {
  return <Text style={sectionHeaderStyle}>{children}</Text>;
}

function KeyValue({label, value}: {label: string; value: React.ReactNode}) {
  return (
    <Text style={kvRowStyle}>
      <span style={kvLabelStyle}>{label}</span>
      <span style={kvValueStyle}>{value}</span>
    </Text>
  );
}

function AudienceBadge({audience}: {audience: string}) {
  return (
    <Text style={{margin: '4px 0 12px'}}>
      <span style={audienceBadgeStyle}>{audience}</span>
    </Text>
  );
}

// ─────────────────────── styles ───────────────────────

const h1Style: React.CSSProperties = {
  margin: '0 0 8px',
  fontFamily: T.font.heading,
  fontSize: 22,
  fontWeight: 700,
  lineHeight: '1.2',
  color: T.color.textPrimary,
};

const subheadStyle: React.CSSProperties = {
  margin: '0 0 20px',
  fontSize: 14,
  color: T.color.textSecondary,
  lineHeight: '1.5',
};

const sectionHeaderStyle: React.CSSProperties = {
  margin: '20px 0 8px',
  fontFamily: T.font.heading,
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: T.color.green700,
};

const kvRowStyle: React.CSSProperties = {
  margin: '0 0 4px',
  fontSize: 14,
  lineHeight: '1.55',
  color: T.color.textPrimary,
};

const kvLabelStyle: React.CSSProperties = {
  display: 'inline-block',
  width: 120,
  color: T.color.textMuted,
  fontSize: 13,
};

const kvValueStyle: React.CSSProperties = {
  color: T.color.textPrimary,
};

const inlineLinkStyle: React.CSSProperties = {
  color: T.color.green700,
  textDecoration: 'underline',
};

const quoteBlockStyle: React.CSSProperties = {
  margin: '8px 0 0',
  padding: '12px 16px',
  borderLeft: `3px solid ${T.color.green500}`,
  backgroundColor: T.color.bgCream,
  fontSize: 14,
  lineHeight: '1.6',
  color: T.color.textPrimary,
  whiteSpace: 'pre-wrap',
};

const audienceBadgeStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '4px 10px',
  borderRadius: 999,
  backgroundColor: T.color.green50,
  color: T.color.green700,
  fontFamily: T.font.heading,
  fontSize: 12,
  fontWeight: 600,
  textTransform: 'capitalize',
  letterSpacing: '0.02em',
};

const metaStyle: React.CSSProperties = {
  margin: '4px 0',
  fontSize: 12,
  color: T.color.textMuted,
  lineHeight: '1.4',
};

const metaLinkStyle: React.CSSProperties = {
  color: T.color.green700,
  textDecoration: 'underline',
};

export default QuoteLeadAlertEmail;
