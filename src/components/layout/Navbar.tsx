import Logo from '@/components/global/Logo';
import NavbarDesktop from './NavbarDesktop';
import NavbarMobile from './NavbarMobile';
import NavbarScrollState from './NavbarScrollState';

/**
 * Top-level Navbar composer. Renders a sticky `<header>` containing both
 * the desktop and mobile navbar bars; CSS chooses which is visible. The
 * scroll state (state A → C transitions per §3.3) is owned by a small
 * client island (NavbarScrollState).
 */
export default async function Navbar() {
  return (
    <header className="sticky top-0 z-[var(--z-sticky)]">
      <NavbarScrollState>
        <NavbarDesktop />
        <NavbarMobile logo={<Logo skin="light" />} />
      </NavbarScrollState>
    </header>
  );
}
