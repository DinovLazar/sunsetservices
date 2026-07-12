import * as React from 'react';
import {Heading, Text, Section, Link, Hr, Img, Row, Column} from '@react-email/components';
import {EmailLayout, EmailButton} from '../components/EmailLayout';
import {emailTokens as T} from '../tokens';
import type {QuoteSubmitInput} from '@/lib/quote/validation';

/**
 * QuoteLeadAlertEmail — to Erick when a wizard submission lands (Phase 2.08).
 * Phase M.01e-pt2 — renders "Division" + "Property type" rows in place of the
 * old "Audience" row.
 * Phase B.11 — optional `photos` prop renders a 3-col 120×120 thumbnail
 * grid linking back to the full-size Sanity CDN URLs (D7).
 *
 * Replaces the Phase 2.06 plaintext lead alert. Visitors never see this; it
 * goes to RESEND_TO_EMAIL only.
 */
export type QuoteLeadAlertEmailProps = {
  lead: QuoteSubmitInput;
  primaryServiceDisplayName: string;
  /**
   * The created `quoteLead` document ID, or `null` when the Sanity write
   * failed. When null the email self-declares the failure with a banner and
   * drops the Studio deep-link (never a half-broken link). Mirrors the
   * ChatLeadEmail contract.
   */
  sanityDocId: string | null;
  locale: 'en' | 'es';
  intendedRecipient?: string;
  /**
   * Phase B.11 — photo URLs resolved at send time by `sendQuoteLeadAlertEmail`
   * via a Sanity GROQ lookup over the `photoAssetIds` array. Renders the
   * thumbnail grid section when present and non-empty.
   */
  photos?: Array<{url: string; alt: string}>;
};

const DIVISION_LABEL: Record<QuoteSubmitInput['division'], string> = {
  landscape: 'Landscape',
  hardscape: 'Hardscape',
  waterproofing: 'Waterproofing',
  'snow-removal': 'Snow Removal',
  trenchless: 'Trenchless & Directional Boring',
};

const PROPERTY_TYPE_LABEL: Record<QuoteSubmitInput['propertyType'], string> = {
  residential: 'Residential (home)',
  commercial: 'Commercial (business)',
};

export function QuoteLeadAlertEmail({
  lead,
  primaryServiceDisplayName,
  sanityDocId,
  locale,
  intendedRecipient,
  photos,
}: QuoteLeadAlertEmailProps) {
  const fullName = `${lead.firstName} ${lead.lastName}`.trim();
  const addressLine1 = [lead.address.street, lead.address.unit].filter(Boolean).join(' ');
  const addressLine2 = `${lead.address.city}, ${lead.address.state} ${lead.address.zip}`;
  // A single valid Structure deep-link, only when the write succeeded. The
  // hosted Studio uses the Structure tool (`/structure/...`), not the legacy
  // `/desk/...` alias — matches ChatLeadEmail.
  const studioUrl = sanityDocId
    ? `https://sunsetservices.sanity.studio/structure/quoteLead;${sanityDocId}`
    : null;
  const writeFailed = sanityDocId === null;
  const divisionLabel = DIVISION_LABEL[lead.division] ?? lead.division;
  const propertyTypeLabel = PROPERTY_TYPE_LABEL[lead.propertyType] ?? lead.propertyType;

  return (
    <EmailLayout
      locale={locale}
      preheader={`New quote from ${lead.firstName} (${divisionLabel}) — ${primaryServiceDisplayName}`}
      intendedRecipient={intendedRecipient}
    >
      <Heading as="h2" style={h1Style}>
        New quote request
      </Heading>
      <Text style={subheadStyle}>
        From <strong>{fullName}</strong> · {lead.email}
      </Text>

      {/* Write-failure banner — self-declares that the CMS did NOT capture this
          lead, so it can never be mistaken for a saved enquiry. Every field the
          customer submitted still renders below, so the lead can be re-entered
          by hand from this email alone. */}
      {writeFailed ? (
        <Section style={writeFailBannerStyle}>
          <Text style={writeFailTitleStyle}>⚠️ This lead was NOT saved to the CMS</Text>
          <Text style={writeFailBodyStyle}>
            The Sanity write failed, so there is no Studio record for this
            request. Re-enter it by hand from the details below (all fields are
            included) and check the server logs / Telegram alert for the cause.
          </Text>
        </Section>
      ) : null}

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
      <DivisionBadge label={divisionLabel} />
      <KeyValue label="Division" value={divisionLabel} />
      <KeyValue label="Property type" value={propertyTypeLabel} />
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

      {/* Photos (Phase B.11) — 3-col grid, each thumbnail links to the
          full-size Sanity CDN URL. Sanity's `?w=240` is 2× the rendered
          120 px for HiDPI sharpness. */}
      {photos && photos.length > 0 ? (
        <>
          <SectionHeader>Photos</SectionHeader>
          <Section style={{margin: '8px 0 12px'}}>
            {chunkPhotos(photos, 3).map((chunk, rowIdx) => (
              <Row key={`photo-row-${rowIdx}`} style={{marginBottom: 8}}>
                {chunk.map((p, colIdx) => (
                  <Column
                    key={`photo-${rowIdx}-${colIdx}`}
                    style={{
                      width: '33.333%',
                      paddingRight: colIdx < chunk.length - 1 ? 8 : 0,
                      verticalAlign: 'top',
                    }}
                  >
                    <Link href={p.url} style={{textDecoration: 'none'}}>
                      <Img
                        src={`${p.url}?w=240&h=240&fit=crop&q=80`}
                        alt={p.alt}
                        width={120}
                        height={120}
                        style={photoThumbStyle}
                      />
                    </Link>
                  </Column>
                ))}
                {/* Pad empty cells in the last row so columns align. */}
                {chunk.length < 3
                  ? Array.from({length: 3 - chunk.length}).map((_, i) => (
                      <Column
                        key={`pad-${rowIdx}-${i}`}
                        style={{width: '33.333%'}}
                      />
                    ))
                  : null}
              </Row>
            ))}
          </Section>
          <Text style={metaStyle}>
            {photos.length} photo{photos.length === 1 ? '' : 's'} attached. Click any to open the full size.
          </Text>
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
      {studioUrl ? (
        <Text style={metaStyle}>
          <Link href={studioUrl} style={metaLinkStyle}>
            Open in Sanity Studio →
          </Link>
        </Text>
      ) : (
        <Text style={metaStyle}>
          Not saved to Sanity — no Studio link. Re-enter this lead from the
          fields above.
        </Text>
      )}
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

function DivisionBadge({label}: {label: string}) {
  return (
    <Text style={{margin: '4px 0 12px'}}>
      <span style={divisionBadgeStyle}>{label}</span>
    </Text>
  );
}

function chunkPhotos<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
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

const divisionBadgeStyle: React.CSSProperties = {
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

// Write-failure banner — a distinct alarm red (not the amber used for sandbox /
// high-intent callouts) so an unsaved lead reads as an error at a glance.
const writeFailBannerStyle: React.CSSProperties = {
  margin: '0 0 20px',
  padding: '12px 16px',
  backgroundColor: '#FEF3F2',
  borderLeft: '4px solid #D92D20',
  borderRadius: 4,
};

const writeFailTitleStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: T.font.heading,
  fontSize: 14,
  fontWeight: 700,
  color: '#B42318',
};

const writeFailBodyStyle: React.CSSProperties = {
  margin: '6px 0 0',
  fontSize: 13,
  lineHeight: '1.5',
  color: '#7A271A',
};

const photoThumbStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 120,
  height: 'auto',
  display: 'block',
  borderRadius: 6,
  border: `1px solid ${T.color.border}`,
};

export default QuoteLeadAlertEmail;
