import * as React from 'react';
import {
  Award,
  Users,
  Languages,
  BadgeCheck,
  ShieldCheck,
  Truck,
  Snowflake,
  Hammer,
  UserCheck,
  Scissors,
  Sprout,
  Leaf,
  Wind,
  Sparkles,
  MessageCircle,
  PencilRuler,
  ClipboardList,
  CalendarRange,
  Workflow,
  Sun,
  Wifi,
  Wrench,
  Trees,
  Zap,
  Disc,
  Phone,
  PhoneCall,
  Clock,
  FileText,
  Building2,
  ClipboardCheck,
  Flower,
  Lightbulb,
  Droplets,
  TestTube,
  Layers,
  ChefHat,
  Home,
  Car,
  Footprints,
  Ruler,
  TrendingDown,
  Anchor,
  Square,
  Axe,
} from 'lucide-react';

/**
 * Curated lucide-react icon map. Keeping this explicit avoids
 * tree-shaking surprises and gives us a safe fallback (BadgeCheck)
 * when services.ts references an icon that hasn't been registered.
 *
 * The "Unilock" key is a sentinel: the audience and service components
 * read it and switch to a hand-rolled inline Unilock badge instead of
 * a lucide glyph (Phase 1.03 §8.3 brand-logo rule).
 */
const ICONS: Record<string, React.ComponentType<{className?: string; strokeWidth?: number; style?: React.CSSProperties; 'aria-hidden'?: boolean}>> = {
  Award,
  Users,
  Languages,
  BadgeCheck,
  ShieldCheck,
  Truck,
  Snowflake,
  Hammer,
  UserCheck,
  Scissors,
  Sprout,
  Leaf,
  Wind,
  Sparkles,
  MessageCircle,
  PencilRuler,
  ClipboardList,
  CalendarRange,
  Workflow,
  Sun,
  Wifi,
  Wrench,
  Trees,
  Zap,
  Disc,
  Phone,
  PhoneCall,
  Clock,
  FileText,
  Building2,
  ClipboardCheck,
  Flower,
  Lightbulb,
  Droplets,
  TestTube,
  Layers,
  ChefHat,
  Home,
  Car,
  Footprints,
  Ruler,
  TrendingDown,
  Anchor,
  Square,
  Axe,
  Grid3x3: Layers,
  Wall: Layers,
};

type ServiceIconProps = {
  name: string;
  size?: number;
  className?: string;
  /** When true, renders the hand-rolled Unilock placeholder mark. */
  unilock?: boolean;
};

/**
 * Inline Unilock placeholder mark. Real licensed Unilock badge swaps in
 * during Phase 2.04 (Cowork sources from Erick's Drive). Per Phase 1.08
 * §3X.5 + Phase 1.03 §8.3 brand-logo rule, this is hand-rolled so it
 * doesn't conflict with lucide's icon system.
 */
function UnilockBadge({size = 32, className}: {size?: number; className?: string}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Unilock Authorized Contractor"
    >
      <rect x="4" y="4" width="56" height="56" rx="6" fill="currentColor" opacity="0.08" />
      <rect x="8" y="8" width="48" height="48" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text
        x="32"
        y="29"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="11"
        fontWeight="700"
        fill="currentColor"
        textAnchor="middle"
        letterSpacing="0.04em"
      >
        UNILOCK
      </text>
      <text
        x="32"
        y="44"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="6"
        fontWeight="600"
        fill="currentColor"
        textAnchor="middle"
        letterSpacing="0.12em"
        opacity="0.85"
      >
        AUTHORIZED
      </text>
    </svg>
  );
}

export default function ServiceIcon({name, size = 24, className, unilock}: ServiceIconProps) {
  if (unilock || name === 'Unilock') {
    return <UnilockBadge size={size} className={className} />;
  }
  const Cmp = ICONS[name] ?? BadgeCheck;
  return (
    <Cmp
      aria-hidden={true}
      strokeWidth={1.75}
      className={className}
      style={{width: size, height: size}}
    />
  );
}
