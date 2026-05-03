'use client';

import * as React from 'react';
import {motion} from 'motion/react';
import {staggerContainer} from './stagger';

type StaggerContainerProps = {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
};

export default function StaggerContainer({
  children,
  as = 'div',
  className,
}: StaggerContainerProps) {
  const Component = motion[as as 'div'];
  return (
    <Component
      initial="initial"
      whileInView="animate"
      viewport={{once: true, margin: '-10% 0px'}}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </Component>
  );
}
