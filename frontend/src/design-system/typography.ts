/**
 * SugarDrop Design System - Typography
 * Clinical/Minimalist Typography with WCAG 2.1 AA Compliance
 */

// Font families - system fonts for clinical feel
export const fontFamilies = {
  primary: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
  secondary: 'SF Pro Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
  mono: 'SF Mono, "Monaco", "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
};

// Font weights
export const fontWeights = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// Line heights for readability
export const lineHeights = {
  tight: 1.2,   // Headlines
  normal: 1.4,  // Body text
  relaxed: 1.6, // Long form content
} as const;

// Typography scale - clinical hierarchy
export const typography = {
  // Display - Large hero text
  displayLarge: {
    fontFamily: fontFamilies.primary,
    fontSize: 32,
    fontWeight: fontWeights.bold,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  
  displayMedium: {
    fontFamily: fontFamilies.primary,
    fontSize: 28,
    fontWeight: fontWeights.bold,
    lineHeight: 34,
    letterSpacing: -0.25,
  },

  // Headlines - Section headers
  headlineLarge: {
    fontFamily: fontFamilies.primary,
    fontSize: 24,
    fontWeight: fontWeights.semibold,
    lineHeight: 30,
    letterSpacing: 0,
  },

  headlineMedium: {
    fontFamily: fontFamilies.primary,
    fontSize: 20,
    fontWeight: fontWeights.semibold,
    lineHeight: 26,
    letterSpacing: 0,
  },

  headlineSmall: {
    fontFamily: fontFamilies.primary,
    fontSize: 18,
    fontWeight: fontWeights.medium,
    lineHeight: 24,
    letterSpacing: 0,
  },

  // Titles - Card headers, form labels
  titleLarge: {
    fontFamily: fontFamilies.secondary,
    fontSize: 16,
    fontWeight: fontWeights.semibold,
    lineHeight: 22,
    letterSpacing: 0,
  },

  titleMedium: {
    fontFamily: fontFamilies.secondary,
    fontSize: 14,
    fontWeight: fontWeights.medium,
    lineHeight: 20,
    letterSpacing: 0.1,
  },

  titleSmall: {
    fontFamily: fontFamilies.secondary,
    fontSize: 12,
    fontWeight: fontWeights.medium,
    lineHeight: 16,
    letterSpacing: 0.1,
  },

  // Body text - Primary content
  bodyLarge: {
    fontFamily: fontFamilies.secondary,
    fontSize: 16,
    fontWeight: fontWeights.regular,
    lineHeight: 24,
    letterSpacing: 0,
  },

  bodyMedium: {
    fontFamily: fontFamilies.secondary,
    fontSize: 14,
    fontWeight: fontWeights.regular,
    lineHeight: 20,
    letterSpacing: 0.25,
  },

  bodySmall: {
    fontFamily: fontFamilies.secondary,
    fontSize: 12,
    fontWeight: fontWeights.regular,
    lineHeight: 16,
    letterSpacing: 0.4,
  },

  // Labels - Form labels, captions
  labelLarge: {
    fontFamily: fontFamilies.secondary,
    fontSize: 14,
    fontWeight: fontWeights.medium,
    lineHeight: 20,
    letterSpacing: 0.1,
  },

  labelMedium: {
    fontFamily: fontFamilies.secondary,
    fontSize: 12,
    fontWeight: fontWeights.medium,
    lineHeight: 16,
    letterSpacing: 0.5,
  },

  labelSmall: {
    fontFamily: fontFamilies.secondary,
    fontSize: 10,
    fontWeight: fontWeights.medium,
    lineHeight: 14,
    letterSpacing: 0.5,
  },

  // Button text
  button: {
    fontFamily: fontFamilies.secondary,
    fontSize: 14,
    fontWeight: fontWeights.semibold,
    lineHeight: 20,
    letterSpacing: 0.1,
  },

  buttonLarge: {
    fontFamily: fontFamilies.secondary,
    fontSize: 16,
    fontWeight: fontWeights.semibold,
    lineHeight: 24,
    letterSpacing: 0,
  },

  // Monospace for data/numbers
  mono: {
    fontFamily: fontFamilies.mono,
    fontSize: 14,
    fontWeight: fontWeights.regular,
    lineHeight: 20,
    letterSpacing: 0,
  },

  monoLarge: {
    fontFamily: fontFamilies.mono,
    fontSize: 16,
    fontWeight: fontWeights.medium,
    lineHeight: 24,
    letterSpacing: 0,
  },
};

// Text style helpers for React Native
export const textStyles = {
  // Convert typography to React Native TextStyle
  ...Object.fromEntries(
    Object.entries(typography).map(([key, value]) => [
      key,
      {
        ...value,
        fontSize: value.fontSize,
        fontWeight: value.fontWeight as any,
        lineHeight: value.lineHeight,
        letterSpacing: value.letterSpacing,
      }
    ])
  ),
};