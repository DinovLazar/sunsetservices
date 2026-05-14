import * as React from 'react';
import {Heading, Text, Section} from '@react-email/components';
import {EmailLayout, EmailButton} from '../components/EmailLayout';
import {emailTokens as T} from '../tokens';

/**
 * QuoteConfirmationEmail — visitor receipt after wizard submission (Phase 2.08).
 *
 * Spanish copy is first-pass and flagged [TBR] for Phase 2.13 native review.
 */
export type QuoteConfirmationEmailProps = {
  firstName: string;
  primaryServiceDisplayName: string;
  locale: 'en' | 'es';
  intendedRecipient?: string;
};

const COPY = {
  en: {
    preheader: (fn: string) => `Thanks, ${fn}! We received your quote request.`,
    h1: (fn: string) => `Thanks, ${fn}!`,
    lead: (svc: string) =>
      `We just received your quote request for ${svc} and Erick will personally review it within one business day. Most homeowners hear back the same afternoon.`,
    nextHeading: "What happens next",
    next1: {
      title: 'Erick reviews your request',
      body: 'Usually within a few hours during business days.',
    },
    next2: {
      title: 'A quick call to confirm details',
      body: 'We talk through scope, timing, and answer any questions.',
    },
    next3: {
      title: 'You receive a written estimate',
      body: 'Itemised, no surprise fees, valid for 30 days.',
    },
    primaryCta: 'Book a 30-min consult',
    secondaryCta: 'Call us now',
    signoff: '— Erick & the Sunset Services team',
  },
  es: {
    // [TBR] Phase 2.12 — native Spanish review pass. Code-level marker;
    // inline strings deliberately omit the [TBR] prefix so recipients don't
    // see it in the rendered email. Tone: usted (visitor-facing transactional).
    preheader: (fn: string) => `Gracias, ${fn}. Recibimos su solicitud.`,
    h1: (fn: string) => `¡Gracias, ${fn}!`,
    lead: (svc: string) =>
      `Acabamos de recibir su solicitud para ${svc} y Erick la revisará personalmente en un día hábil. La mayoría de nuestros clientes reciben respuesta esa misma tarde.`,
    nextHeading: 'Qué sigue',
    next1: {
      title: 'Erick revisa su solicitud',
      body: 'Normalmente en pocas horas durante días hábiles.',
    },
    next2: {
      title: 'Una llamada breve para confirmar detalles',
      body: 'Repasamos el alcance, los tiempos y respondemos cualquier pregunta.',
    },
    next3: {
      title: 'Recibe una cotización por escrito',
      body: 'Detallada, sin sorpresas, válida por 30 días.',
    },
    primaryCta: 'Reservar una llamada de 30 min',
    secondaryCta: 'Llámenos ahora',
    signoff: '— Erick y el equipo de Sunset Services',
  },
} as const;

export function QuoteConfirmationEmail({
  firstName,
  primaryServiceDisplayName,
  locale,
  intendedRecipient,
}: QuoteConfirmationEmailProps) {
  const c = COPY[locale];
  const bookHref = `${T.business.website}/thank-you/?firstName=${encodeURIComponent(firstName)}`;

  return (
    <EmailLayout
      locale={locale}
      preheader={c.preheader(firstName)}
      intendedRecipient={intendedRecipient}
    >
      <Heading as="h2" style={h1Style}>
        {c.h1(firstName)}
      </Heading>
      <Text style={leadStyle}>{c.lead(primaryServiceDisplayName)}</Text>

      <Text style={sectionHeadingStyle}>{c.nextHeading}</Text>
      <Step n={1} title={c.next1.title} body={c.next1.body} />
      <Step n={2} title={c.next2.title} body={c.next2.body} />
      <Step n={3} title={c.next3.title} body={c.next3.body} />

      <Section style={{paddingTop: 16}}>
        <EmailButton variant="primary" href={bookHref} text={c.primaryCta} />
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

function Step({n, title, body}: {n: number; title: string; body: string}) {
  return (
    <Section style={stepRowStyle}>
      <Text style={stepNumberStyle}>{n}</Text>
      <Text style={stepTitleStyle}>{title}</Text>
      <Text style={stepBodyStyle}>{body}</Text>
    </Section>
  );
}

// ─────────────────────── styles ───────────────────────

const h1Style: React.CSSProperties = {
  margin: '0 0 12px',
  fontFamily: T.font.heading,
  fontSize: 26,
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
  margin: '8px 0 12px',
  fontFamily: T.font.heading,
  fontSize: 14,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: T.color.green700,
};

const stepRowStyle: React.CSSProperties = {
  marginBottom: 12,
  paddingLeft: 40,
  position: 'relative' as const,
};

const stepNumberStyle: React.CSSProperties = {
  position: 'absolute' as const,
  left: 0,
  top: 0,
  margin: 0,
  width: 28,
  height: 28,
  textAlign: 'center' as const,
  lineHeight: '28px',
  borderRadius: 999,
  backgroundColor: T.color.green50,
  color: T.color.green700,
  fontFamily: T.font.heading,
  fontWeight: 700,
  fontSize: 14,
};

const stepTitleStyle: React.CSSProperties = {
  margin: '0 0 2px',
  fontFamily: T.font.heading,
  fontSize: 15,
  fontWeight: 600,
  color: T.color.textPrimary,
  lineHeight: '1.35',
};

const stepBodyStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: '1.5',
  color: T.color.textSecondary,
};

const signoffStyle: React.CSSProperties = {
  margin: '28px 0 0',
  fontSize: 14,
  color: T.color.textSecondary,
  fontStyle: 'italic' as const,
};

export default QuoteConfirmationEmail;
