import type {Variants} from 'motion/react';
import {durations, easings} from './easings';

export type AnimateInVariant =
  | 'fade'
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'scale';

export const animateInVariants: Record<AnimateInVariant, Variants> = {
  fade: {
    initial: {opacity: 0},
    animate: {
      opacity: 1,
      transition: {duration: durations.slow, ease: easings.soft},
    },
  },
  'fade-up': {
    initial: {opacity: 0, y: 16},
    animate: {
      opacity: 1,
      y: 0,
      transition: {duration: durations.slow, ease: easings.soft},
    },
  },
  'fade-down': {
    initial: {opacity: 0, y: -16},
    animate: {
      opacity: 1,
      y: 0,
      transition: {duration: durations.slow, ease: easings.soft},
    },
  },
  'fade-left': {
    initial: {opacity: 0, x: 16},
    animate: {
      opacity: 1,
      x: 0,
      transition: {duration: durations.slow, ease: easings.soft},
    },
  },
  'fade-right': {
    initial: {opacity: 0, x: -16},
    animate: {
      opacity: 1,
      x: 0,
      transition: {duration: durations.slow, ease: easings.soft},
    },
  },
  scale: {
    initial: {opacity: 0, scale: 0.96},
    animate: {
      opacity: 1,
      scale: 1,
      transition: {duration: durations.slow, ease: easings.soft},
    },
  },
};
