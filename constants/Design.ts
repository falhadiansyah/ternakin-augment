import { Colors } from './Colors';
import { Typography } from './Typography';

// Centralized design tokens for spacing, radius, shadows, and subtle tints
export const Spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 16,
  xl: 20,
};

export const Radii = {
  sm: 10,
  md: 12,
  lg: 14,
  pill: 999,
};

export const Shadows = (isDark: boolean) => {
  // Soft, elevated card look (keeps dark-mode subtle)
  const base = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.06,
    shadowRadius: 6,
    elevation: 3,
  } as const;
  return base;
};

export const Opacity = {
  subtle: 0.6,
  faint: 0.4,
};

export { Colors, Typography };

