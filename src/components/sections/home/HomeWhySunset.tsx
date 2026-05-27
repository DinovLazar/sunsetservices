import {getTranslations} from 'next-intl/server';
import {
  Home,
  Shield,
  DollarSign,
  Award,
  FileCheck,
  Compass,
  Heart,
  TrendingUp,
} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';
import AnimateIn from '@/components/global/motion/AnimateIn';
import StaggerContainer from '@/components/global/motion/StaggerContainer';
import StaggerItem from '@/components/global/motion/StaggerItem';

/**
 * Phase M.10b — Why Sunset values band.
 *
 * 8 brand-value cards drawn from Marcin's "Why Homeowners Choose Sunset"
 * list. Lives between the Projects band (white) and the bottom CTA
 * (cream); placed on cream to read as a "summary + ask" closing block
 * paired with HomeCTA. Trade-off: cream-on-cream adjacency with HomeCTA
 * is documented in Sunset-Services-Decisions.md (2026-05-27) — perfect
 * 2-surface alternation isn't possible at this insertion point without
 * introducing a third surface, and that wasn't in scope.
 *
 * Icon-to-label map is data-frozen here; labels + bodies live in i18n
 * (`home.whySunset.cards[]`) so the same 8-card grid renders in EN + ES.
 */
const ICONS: readonly LucideIcon[] = [
  Home,           // 1. Family-owned & locally operated
  Shield,         // 2. Not private-equity / investor owned
  DollarSign,     // 3. Fair & transparent pricing
  Award,          // 4. Premium materials & installation standards
  FileCheck,      // 5. HOA & permit experience
  Compass,        // 6. Professional design guidance
  Heart,          // 7. Long-term customer relationships
  TrendingUp,     // 8. Focused on value — not volume
];

type Card = {label: string; body: string};

export default async function HomeWhySunset() {
  const t = await getTranslations('home.whySunset');
  const cards = t.raw('cards') as Card[];

  return (
    <section
      aria-labelledby="home-why-h2"
      className="bg-[var(--color-bg-cream)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_1100px]"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up" className="mb-10 lg:mb-14 max-w-[64ch]">
          <p
            className="font-heading font-semibold uppercase m-0 mb-2"
            style={{
              fontSize: '13px',
              letterSpacing: 'var(--tracking-eyebrow)',
              color: 'var(--color-sunset-green-700)',
            }}
          >
            {t('eyebrow')}
          </p>
          <h2
            id="home-why-h2"
            className="m-0"
            style={{textWrap: 'balance'}}
          >
            {t('h2')}
          </h2>
          <p
            className="m-0 mt-3"
            style={{
              fontSize: 'var(--text-body-lg)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--leading-relaxed)',
            }}
          >
            {t('dek')}
          </p>
        </AnimateIn>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {cards.map((card, idx) => {
            const Icon = ICONS[idx];
            return (
              <StaggerItem key={card.label}>
                <article className="card h-full">
                  {Icon ? (
                    <span
                      aria-hidden="true"
                      className="inline-flex items-center justify-center"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-sunset-green-50)',
                        color: 'var(--color-sunset-green-700)',
                      }}
                    >
                      <Icon size={22} strokeWidth={1.75} />
                    </span>
                  ) : null}
                  <h3
                    className="m-0 mt-5 font-heading"
                    style={{
                      fontSize: 'var(--text-h4)',
                      lineHeight: 'var(--leading-tight)',
                      letterSpacing: 'var(--tracking-snug)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {card.label}
                  </h3>
                  <p
                    className="m-0 mt-3"
                    style={{
                      fontSize: 'var(--text-body)',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 'var(--leading-relaxed)',
                    }}
                  >
                    {card.body}
                  </p>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
