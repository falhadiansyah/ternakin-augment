import { TextStyle } from 'react-native';

// Typography scale inspired by modern mobile finance apps
// Keeps it simple and consistent across screens
export const Typography = {
  // Sizes
  display: 28, // Big numbers in cards
  headline: 20, // Section titles
  title: 16, // Card titles / item titles
  body: 14, // Default text
  caption: 12, // Secondary info

  // Weights
  weight: {
    regular: '400' as TextStyle['fontWeight'],
    medium: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
    extrabold: '800' as TextStyle['fontWeight'],
  },
};

export type TypographyType = typeof Typography;

