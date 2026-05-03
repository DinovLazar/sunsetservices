import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import Logo from '@/components/global/Logo';
import LanguageSwitcher from './LanguageSwitcher';
import NavbarLink from './NavbarLink';
import PhoneLink from './PhoneLink';
import ServicesMegaPanel from './ServicesMegaPanel';
import ResourcesMegaPanel from './ResourcesMegaPanel';

/**
 * Desktop navbar bar — 72px row, container-wide (1440px) max width.
 * Hidden below `lg`. The mega-panels (children of this component) use
 * `position: fixed`; when this component is `display: none` the panels
 * are removed from the layout tree too — so they correctly hide below lg.
 */
export default async function NavbarDesktop() {
  const t = await getTranslations('chrome');

  return (
    <div className="hidden lg:block">
      <div className="mx-auto h-[72px] flex items-center justify-between gap-6 max-w-[var(--container-wide)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center gap-10">
          <Logo skin="light" />
          <nav aria-label={t('nav.primaryAriaLabel')} className="flex items-center gap-8">
            <ServicesMegaPanel />
            <NavbarLink href="/projects/" labelKey="chrome.nav.projects" />
            <NavbarLink href="/service-areas/" labelKey="chrome.nav.serviceAreas" />
            <NavbarLink href="/about/" labelKey="chrome.nav.about" />
            <ResourcesMegaPanel />
            <NavbarLink href="/contact/" labelKey="chrome.nav.contact" />
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <PhoneLink trackingId="navbar-desktop-phone" variant="auto" />
          <LanguageSwitcher surface="light" size="sm" />
          <Link
            href="/request-quote/"
            className="btn btn-amber btn-md"
            style={{minWidth: '184px'}}
          >
            {t('cta.getQuote')}
          </Link>
        </div>
      </div>
    </div>
  );
}
