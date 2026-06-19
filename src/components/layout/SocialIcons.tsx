import {getTranslations} from 'next-intl/server';
import FacebookIcon from './icons/FacebookIcon';
import GoogleBusinessProfileIcon from './icons/GoogleBusinessProfileIcon';
import InstagramIcon from './icons/InstagramIcon';
import YoutubeIcon from './icons/YoutubeIcon';

/**
 * Social profile URLs are env/config-driven (Phase M.14, Goran QA B-09 B5).
 * Each icon renders ONLY when its env var holds a real Sunset profile URL.
 * The previous hardcoded links pointed at generic homepages
 * (google.com/business, facebook.com, …), which Goran flagged as misleading;
 * those are hidden until the real profile URLs are set in Vercel (M.14b).
 */
const SOCIAL_LINKS = [
  {
    id: 'gbp',
    href: process.env.NEXT_PUBLIC_SOCIAL_GBP_URL,
    labelKey: 'chrome.footer.social.gbp',
    Icon: GoogleBusinessProfileIcon,
  },
  {
    id: 'facebook',
    href: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_URL,
    labelKey: 'chrome.footer.social.facebook',
    Icon: FacebookIcon,
  },
  {
    id: 'instagram',
    href: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL,
    labelKey: 'chrome.footer.social.instagram',
    Icon: InstagramIcon,
  },
  {
    id: 'youtube',
    href: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE_URL,
    labelKey: 'chrome.footer.social.youtube',
    Icon: YoutubeIcon,
  },
] as const;

/**
 * Footer social row. Each link is 32×32 visually but the wrapping `<a>`
 * extends to a 44×44 hit area via padding (Phase 1.05 §10.5).
 */
export default async function SocialIcons() {
  const t = await getTranslations();
  const links = SOCIAL_LINKS.filter(
    (l): l is typeof l & {href: string} =>
      typeof l.href === 'string' && l.href.trim().length > 0,
  );
  // No real profile URLs configured yet → render nothing (M.14b adds them).
  if (links.length === 0) return null;
  return (
    <ul className="list-none m-0 p-0 flex items-center gap-2">
      {links.map(({id, href, labelKey, Icon}) => (
        <li key={id}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t(labelKey)}
            className="inline-flex items-center justify-center w-11 h-11 rounded-md text-[var(--color-text-on-dark)] hover:text-[var(--color-sunset-green-300)] no-underline group"
          >
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-[var(--color-text-on-dark)]/30 group-hover:border-[var(--color-sunset-green-300)] transition-colors duration-[var(--motion-fast)]">
              <Icon size={16} aria-hidden="true" />
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
