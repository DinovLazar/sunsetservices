'use client';

import * as React from 'react';
import {motion, type Variants} from 'motion/react';
import {animateInVariants, type AnimateInVariant} from './variants';

type AnimateInProps = {
  variant?: AnimateInVariant;
  delay?: number;
  as?: keyof React.JSX.IntrinsicElements;
  children: React.ReactNode;
  className?: string;
};

function withDelay(variant: AnimateInVariant, delay: number): Variants {
  const base = animateInVariants[variant];
  if (delay === 0) return base;
  const animate = (base.animate ?? {}) as Record<string, unknown> & {
    transition?: Record<string, unknown>;
  };
  return {
    ...base,
    animate: {
      ...animate,
      transition: {
        ...(animate.transition ?? {}),
        delay,
      },
    },
  };
}

export default function AnimateIn({
  variant = 'fade-up',
  delay = 0,
  as = 'div',
  children,
  className,
}: AnimateInProps) {
  const Component = motion[as as 'div'];
  return (
    <Component
      initial="initial"
      whileInView="animate"
      viewport={{once: true, margin: '-10% 0px'}}
      variants={withDelay(variant, delay)}
      className={className}
    >
      {children}
    </Component>
  );
}
