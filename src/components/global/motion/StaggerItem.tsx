'use client';

import * as React from 'react';
import {motion} from 'motion/react';
import {staggerItem} from './stagger';

type StaggerItemProps = {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
};

export default function StaggerItem({
  children,
  as = 'div',
  className,
}: StaggerItemProps) {
  const Component = motion[as as 'div'];
  return (
    <Component variants={staggerItem} className={className}>
      {children}
    </Component>
  );
}
