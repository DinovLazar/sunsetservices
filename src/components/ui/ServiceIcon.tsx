import * as React from 'react';
import Image from 'next/image';
import unilockBadge from '@/assets/brand/unilock-authorized-contractor.png';
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
  // Phase M.01c — real licensed Unilock Authorized Contractor badge.
  return (
    <Image
      src={unilockBadge}
      alt="Unilock Authorized Contractor"
      width={size}
      height={Math.round((size * 230) / 360)}
      className={className}
      style={{width: size, height: 'auto'}}
    />
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
