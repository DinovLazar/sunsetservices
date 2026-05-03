export const easings = {
  standard: 'easeOut',
  soft: [0.16, 1, 0.3, 1] as const,
  snap: [0.2, 0.0, 0.1, 1] as const,
} as const;

export const durations = {
  fast: 0.12,
  base: 0.24,
  slow: 0.48,
  deliberate: 0.7,
} as const;
