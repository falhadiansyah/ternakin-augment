/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: '#0a7ea4',
    secondary: '#f0f0f0',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    border: '#e0e0e0',
    card: '#ffffff',
    notification: '#FF3B30',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: '#0a7ea4',
    secondary: '#2c2c2c',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    border: '#3c3c3c',
    card: '#1c1c1c',
    notification: '#FF453A',
  },
};
