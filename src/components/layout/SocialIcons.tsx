import {getTranslations} from 'next-intl/server';
import FacebookIcon from './icons/FacebookIcon';
import GoogleBusinessProfileIcon from './icons/GoogleBusinessProfileIcon';
import InstagramIcon from './icons/InstagramIcon';
import YoutubeIcon from './icons/YoutubeIcon';

const SOCIAL_LINKS = [
  {
    id: 'gbp',
    href: 'https://www.google.com/business/',
    labelKey: 'chrome.footer.social.gbp',
    Icon: GoogleBusinessProfileIcon,
  },
  {
    id: 'facebook',
    href: 'https://www.facebook.com/',
    labelKey: 'chrome.footer.social.facebook',
    Icon: FacebookIcon,
  },
  {
    id: 'instagram',
    href: 'https://www.instagram.com/',
    labelKey: 'chrome.footer.social.instagram',
    Icon: InstagramIcon,
  },
  {
    id: 'youtube',
    href: 'https://www.youtube.com/',
    labelKey: 'chrome.footer.social.youtube',
    Icon: YoutubeIcon,
  },
] as const;

/**
 * Footer social row. Each link is 32×32 visually but the wrapping `<a>`
 * extends to a 44×44 hit area via padding (Phase 1.05 §10.5). Real URLs
 * land in Part 3 brand cleanup (Plan §3.08).
 */
export default async function SocialIcons() {
  const t = await getTranslations();
  return (
    <ul className="list-none m-0 p-0 flex items-center gap-2">
      {SOCIAL_LINKS.map(({id, href, labelKey, Icon}) => (
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
