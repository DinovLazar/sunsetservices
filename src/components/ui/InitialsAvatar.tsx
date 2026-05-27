type InitialsAvatarProps = {
  /**
   * Full name. Initials are derived from the first letter of each
   * whitespace-separated word. "Erick Valle" → "EV"; "Marcin" → "M".
   * Capped at `maxInitials` (default 2).
   */
  name: string;
  /** Maximum number of letters to render. Default 2. */
  maxInitials?: number;
  /** CSS aspect-ratio shorthand. Defaults to 4 / 5 to fit the TeamCard slot. */
  aspectRatio?: string;
  /** Extra class names applied to the outer wrapper. */
  className?: string;
};

/**
 * Brand-consistent initials placeholder for portrait slots that have no
 * real photo yet (Phase M.10 Issue 5). Renders a sunset-green gradient
 * tile with the person's initials centered in cream Manrope at a clamped
 * size that scales with the slot width.
 *
 * Drop-in replacement for `<Image>` inside a card's photo slot — both
 * use a parent-controlled aspect ratio. When real portraits land, the
 * consumer swaps `<InitialsAvatar/>` for `<Image src={...}/>` with no
 * other changes.
 *
 * Exposes itself as `role="img"` with an accessible label derived from
 * the name, so screen readers announce "Erick Valle" rather than
 * "Erick Valle E V". Visual initials carry `aria-hidden="true"`.
 */
export default function InitialsAvatar({
  name,
  maxInitials = 2,
  aspectRatio = '4 / 5',
  className,
}: InitialsAvatarProps) {
  const initials = deriveInitials(name, maxInitials);

  return (
    <div
      role="img"
      aria-label={name}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(135deg, var(--color-sunset-green-600) 0%, var(--color-sunset-green-700) 100%)',
        overflow: 'hidden',
        containerType: 'inline-size',
      }}
    >
      <span
        aria-hidden="true"
        className="font-heading"
        style={{
          fontSize: 'clamp(56px, 22cqi, 112px)',
          fontWeight: 700,
          letterSpacing: '0.02em',
          color: 'var(--color-text-on-dark)',
          lineHeight: 1,
        }}
      >
        {initials}
      </span>
    </div>
  );
}

function deriveInitials(name: string, max: number): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, max)
    .map((w) => w.charAt(0).toUpperCase())
    .filter(Boolean)
    .join('');
}
