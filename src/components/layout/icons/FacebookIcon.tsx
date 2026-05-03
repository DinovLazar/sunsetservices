type Props = {size?: number; className?: string};

/**
 * Monochrome Facebook glyph using `currentColor`. Single-color version is
 * trademark-safe in this context (small social icon, monochrome on dark
 * background). The full multi-color brand asset is intentionally NOT used.
 */
export default function FacebookIcon({size = 16, className}: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M13.5 21.95V14.5h2.5l.4-3.1h-2.9V9.4c0-.9.25-1.5 1.55-1.5H16.5V5.13a22.4 22.4 0 0 0-2.45-.13c-2.43 0-4.1 1.48-4.1 4.2v2.3H7.5v3.1h2.45v7.45a10 10 0 1 0 3.55 0Z" />
    </svg>
  );
}
