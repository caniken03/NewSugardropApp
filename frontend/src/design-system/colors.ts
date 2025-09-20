/**
 * SugarDrop Design System - Colors
 * Clinical/Minimalist Aesthetic with WCAG 2.1 AA Compliance
 */

export const colors = {
  // Primary Palette - Clinical Blue
  primary: {
    50: '#EBF4FD',
    100: '#D1E7FB', 
    200: '#A8D1F7',
    300: '#7AB6F2',
    400: '#4A90E2', // Primary Blue
    500: '#2C7CD1',
    600: '#1E5BB8',
    700: '#164190',
    800: '#0F2D68',
    900: '#0A1F47',
  },

  // Success - Green for goals met
  success: {
    50: '#E8F8F0',
    100: '#C3EBDC',
    200: '#95DDC4',
    300: '#62CEAB',
    400: '#27AE60', // Success Green
    500: '#1E8449',
    600: '#186A3B',
    700: '#14512E',
    800: '#0F3821',
    900: '#0A2817',
  },

  // Warning - Orange for near limit
  warning: {
    50: '#FEF7E6',
    100: '#FCEBBD',
    200: '#F9DD8A',
    300: '#F6CE56',
    400: '#F39C12', // Warning Orange
    500: '#D68910',
    600: '#B9760F',
    700: '#9C640C',
    800: '#7F5109',
    900: '#623E07',
  },

  // Error - Red for over limit
  error: {
    50: '#FDEEEE',
    100: '#F9D2D2',
    200: '#F4A6A6',
    300: '#EF7A7A',
    400: '#E74C3C', // Error Red
    500: '#CB4335',
    600: '#AF392F',
    700: '#932F28',
    800: '#782622',
    900: '#5D1C1D',
  },

  // Neutral - Clinical whites and greys
  neutral: {
    0: '#FFFFFF',     // Pure white
    50: '#F8F9FA',    // Background - light grey
    100: '#F1F3F4',   // Card backgrounds
    200: '#E8EAED',   // Borders light
    300: '#DADCE0',   // Borders medium
    400: '#9AA0A6',   // Text secondary
    500: '#5F6368',   // Text tertiary
    600: '#3C4043',   // Text primary
    700: '#202124',   // Text high contrast
    800: '#171717',   // Dark backgrounds
    900: '#0F0F0F',   // Darkest
  },

  // Semantic Colors
  background: '#F8F9FA',        // Light clinical background
  surface: '#FFFFFF',           // Card/component surfaces
  surfaceSecondary: '#F1F3F4',  // Secondary surfaces
  
  text: {
    primary: '#202124',         // High contrast text
    secondary: '#5F6368',       // Medium contrast text  
    tertiary: '#9AA0A6',        // Low contrast text
    inverse: '#FFFFFF',         // White text on dark
  },

  border: {
    light: '#E8EAED',          // Light borders
    medium: '#DADCE0',         // Medium borders
    focus: '#4A90E2',          // Focus state borders
  },

  // Component-specific colors
  shadow: 'rgba(0, 0, 0, 0.08)',  // Subtle clinical shadows
  overlay: 'rgba(0, 0, 0, 0.6)',  // Modal overlays
  
  // Status colors for SugarPoints tracker
  tracker: {
    excellent: '#27AE60',       // 0-50% of target
    good: '#2ECC71',           // 50-75% of target  
    moderate: '#F39C12',       // 75-90% of target
    warning: '#E67E22',        // 90-100% of target
    danger: '#E74C3C',         // Over 100% of target
  },
};

// Dark mode colors (for Phase B)
export const darkColors = {
  ...colors,
  background: '#0F0F0F',
  surface: '#171717', 
  surfaceSecondary: '#202124',
  text: {
    primary: '#FFFFFF',
    secondary: '#9AA0A6', 
    tertiary: '#5F6368',
    inverse: '#202124',
  },
  border: {
    light: '#3C4043',
    medium: '#5F6368',
    focus: '#4A90E2',
  },
  shadow: 'rgba(255, 255, 255, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.8)',
};