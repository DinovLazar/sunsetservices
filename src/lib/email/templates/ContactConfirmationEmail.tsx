import * as React from 'react';
import {Heading, Text, Section} from '@react-email/components';
import {EmailLayout, EmailButton} from '../components/EmailLayout';
import {emailTokens as T} from '../tokens';

/**
 * ContactConfirmationEmail — visitor receipt after /contact/ form submission
 * (Phase 2.08). Shorter than the QuoteConfirmation because the contact form
 * is open-ended rather than scoped to a specific service.
 *
 * Spanish copy is first-pass; flagged [TBR] for Phase 2.13 native review.
 */
export type ContactConfirmationEmailProps = {
  firstName: string;
  locale: 'en' | 'es';
  intendedRecipient?: string;
};

const COPY = {
  en: {
    preheader: (fn: string) => `Thanks for reaching out, ${fn} — we got your message.`,
    h1: (fn: string) => `Thanks for reaching out, ${fn}.`,
    lead:
      'We just received your message and will reply within one business day. Most of the time you hear back the same afternoon.',
    inMeantime: 'In the meantime',
    inMeantimeBody:
      'Take a look at our recent project gallery to see what we have been building around DuPage and Kane counties — or call us directly.',
    primaryCta: 'See recent projects',
    secondaryCta: 'Call us now',
    signoff: '— Erick & the Sunset Services team',
  },
  es: {
    // [TBR] Phase 2.13.
    preheader: (fn: string) => `Gracias por escribirnos, ${fn}. Recibimos tu mensaje.`,
    h1: (fn: string) => `Gracias por escribirnos, ${fn}.`,
    lead:
      'Acabamos de recibir tu mensaje y te responderemos en un día hábil. La mayoría de las veces respondemos esa misma tarde.',
    inMeantime: 'Mientras tanto',
    inMeantimeBody:
      'Mira nuestra galería de proyectos recientes para ver lo que hemos construido en los condados de DuPage y Kane — o llámanos directamente.',
    primaryCta: 'Ver proyectos recientes',
    secondaryCta: 'Llámanos ahora',
    signoff: '— Erick y el equipo de Sunset Services',
  },
} as const;

export function ContactConfirmationEmail({
  firstName,
  locale,
  intendedRecipient,
}: ContactConfirmationEmailProps) {
  const c = COPY[locale];
  return (
    <EmailLayout
      locale={locale}
      preheader={c.preheader(firstName)}
      intendedRecipient={intendedRecipient}
    >
      <Heading as="h2" style={h1Style}>
        {c.h1(firstName)}
      </Heading>
      <Text style={leadStyle}>{c.lead}</Text>

      <Text style={sectionHeadingStyle}>{c.inMeantime}</Text>
      <Text style={bodyStyle}>{c.inMeantimeBody}</Text>

      <Section style={{paddingTop: 12}}>
        <EmailButton variant="primary" href={`${T.business.website}/projects`} text={c.primaryCta} />
        <EmailButton
          variant="ghost"
          href={`tel:${T.business.phoneTel}`}
          text={c.secondaryCta}
        />
      </Section>

      <Text style={signoffStyle}>{c.signoff}</Text>
    </EmailLayout>
  );
}

const h1Style: React.CSSProperties = {
  margin: '0 0 12px',
  fontFamily: T.font.heading,
  fontSize: 24,
  fontWeight: 700,
  lineHeight: '1.2',
  color: T.color.textPrimary,
};

const leadStyle: React.CSSProperties = {
  margin: '0 0 24px',
  fontSize: 16,
  lineHeight: '1.6',
  color: T.color.textPrimary,
};

const sectionHeadingStyle: React.CSSProperties = {
  margin: '12px 0 8px',
  fontFamily: T.font.heading,
  fontSize: 13,
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  color: T.color.green700,
};

const bodyStyle: React.CSSProperties = {
  margin: '0 0 16px',
  fontSize: 15,
  lineHeight: '1.55',
  color: T.color.textPrimary,
};

const signoffStyle: React.CSSProperties = {
  margin: '28px 0 0',
  fontSize: 14,
  color: T.color.textSecondary,
  fontStyle: 'italic' as const,
};

export default ContactConfirmationEmail;
