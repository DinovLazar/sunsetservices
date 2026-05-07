import {getTranslations} from 'next-intl/server';
import AnimateIn from '@/components/global/motion/AnimateIn';
import StaggerContainer from '@/components/global/motion/StaggerContainer';
import StaggerItem from '@/components/global/motion/StaggerItem';
import TeamCard from '@/components/ui/TeamCard';
import {team, type TeamMember} from '@/data/team';

/**
 * About team grid — Phase 1.11 handover §3.3.
 *
 * 3 peer cards on desktop, 1-column stack on mobile (D4 lock). Equal weight,
 * no featured. 4:5 portrait photos. Future-proof grid: auto-fit minmax(280px,
 * 1fr) so a 4th member reflows to 2×2 without rework. StaggerContainer +
 * StaggerItem with 80ms stagger per Phase 1.03 §7.4 + handover §8.
 */
export default async function AboutTeam() {
  const t = await getTranslations('about.team');

  return (
    <section
      aria-labelledby="about-team-h2"
      className="bg-[var(--color-bg)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_900px]"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up" className="mb-10 lg:mb-14 max-w-[60ch]">
          <p
            className="font-heading font-semibold uppercase m-0 mb-3"
            style={{
              fontSize: '13px',
              letterSpacing: 'var(--tracking-eyebrow)',
              color: 'var(--color-sunset-green-700)',
            }}
          >
            {t('eyebrow')}
          </p>
          <h2
            id="about-team-h2"
            className="m-0 font-heading"
            style={{
              fontSize: 'var(--text-h2)',
              fontWeight: 600,
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-snug)',
              textWrap: 'balance',
            }}
          >
            {t('h2')}
          </h2>
        </AnimateIn>

        <StaggerContainer className="grid gap-6 lg:gap-8 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
          {team.map((m: TeamMember) => (
            <StaggerItem key={m.slug}>
              <TeamCard
                name={m.name}
                role={t(`role.${m.roleKey}`)}
                bio={t(`${m.bioKey}.bio`)}
                photo={m.photo.src}
                alt={m.name}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
