/**
 * SugarDrop Design System - Main Export
 * Clinical/Minimalist Design System with WCAG 2.1 AA Compliance
 */

import { colors, darkColors } from './colors';
import { typography, textStyles, fontFamilies, fontWeights } from './typography';
import { spacing, layout, touchTargets, borderRadius, elevation, iconSizes, components } from './spacing';

// Named exports
export { colors, darkColors };
export { typography, textStyles, fontFamilies, fontWeights };
export { spacing, layout, touchTargets, borderRadius, elevation, iconSizes, components };

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