/**
 * App color system tuned for a modern, professional finance-style UI
 */

// Brand (soft indigo)
const tintColorLight = '#6E6AE8';
const tintColorDark = '#8B90F5';

export const Colors = {
  light: {
    text: '#101828',
    background: '#F6F7FB',
    tint: tintColorLight,
    icon: '#667085',
    tabIconDefault: '#98A2B3',
    tabIconSelected: tintColorLight,
    primary: '#6E6AE8',
    secondary: '#EEF1F7',
    success: '#12B76A',
    warning: '#F79009',
    error: '#F04438',
    border: '#E5E7EB',
    card: '#FFFFFF',
    notification: '#FF3B30',
  },
  dark: {
    text: '#E4E7EC',
    background: '#0F172A',
    tint: tintColorDark,
    icon: '#98A2B3',
    tabIconDefault: '#667085',
    tabIconSelected: tintColorDark,
    primary: '#8B90F5',
    secondary: '#111827',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#F97066',
    border: '#273148',
    card: '#0B1220',
    notification: '#FF453A',
  },
};
