type Props = {
  size?: number;
  className?: string;
};

/**
 * Monochrome Google "G" mark — uses `currentColor` only. The multi-color
 * Google G is intentionally NOT recreated here (copyright). This is a
 * generic monogram-style "G" that reads as Google in context (alongside
 * Facebook / Instagram / YouTube social icons in the footer).
 */
export default function GoogleBusinessProfileIcon({size = 16, className}: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M12 4 a8 8 0 1 0 7.5 10.6" />
      <path d="M12 11 h7.5 v3" />
    </svg>
  );
}
