/**
 * SugarDrop Design System - Main Export
 * Clinical/Minimalist Design System with WCAG 2.1 AA Compliance
 */

export { colors, darkColors } from './colors';
export { typography, textStyles, fontFamilies, fontWeights } from './typography';
export { spacing, layout, touchTargets, borderRadius, elevation, iconSizes, components } from './spacing';

// Re-export everything as a unified theme object
export const theme = {
  colors,
  typography,
  spacing,
  layout,
  touchTargets,
  borderRadius,
  elevation,
  iconSizes,
  components,
};

export type Theme = typeof theme;