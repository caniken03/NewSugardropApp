/**
 * SugarDrop Design System - Spacing
 * 8px Grid System for Clinical Consistency
 */

// Base unit - 8px for consistent spacing
export const baseUnit = 8;

// Spacing scale based on 8px grid
export const spacing = {
  none: 0,
  xs: baseUnit * 0.5,    // 4px - tight spacing
  sm: baseUnit,          // 8px - small spacing  
  md: baseUnit * 1.5,    // 12px - medium spacing
  lg: baseUnit * 2,      // 16px - large spacing
  xl: baseUnit * 3,      // 24px - extra large
  xxl: baseUnit * 4,     // 32px - section spacing
  xxxl: baseUnit * 6,    // 48px - major section spacing
  huge: baseUnit * 8,    // 64px - page-level spacing
} as const;

// Container and layout spacing
export const layout = {
  // Screen padding
  screenPadding: spacing.lg,        // 16px
  screenPaddingLarge: spacing.xl,   // 24px
  
  // Component spacing
  componentGap: spacing.md,         // 12px between related components
  sectionGap: spacing.xxl,          // 32px between major sections
  
  // Safe areas
  safeAreaTop: spacing.lg,          // 16px top safe area
  safeAreaBottom: spacing.xl,       // 24px bottom safe area (for navigation)
  
  // Card and surface spacing
  cardPadding: spacing.lg,          // 16px inside cards
  cardMargin: spacing.md,           // 12px between cards
  
  // Form spacing
  inputSpacing: spacing.lg,         // 16px between form inputs
  formSectionSpacing: spacing.xl,   // 24px between form sections
} as const;

// Touch target sizes - WCAG AA compliance (minimum 44px)
export const touchTargets = {
  minimum: 44,                      // Minimum touch target size
  comfortable: 48,                  // Comfortable touch target
  large: 56,                        // Large touch targets for primary actions
} as const;

// Border radius - clinical aesthetic
export const borderRadius = {
  none: 0,
  sm: 4,                           // Small radius for subtle rounding
  md: 8,                           // Standard radius for cards/buttons
  lg: 12,                          // Large radius for prominent elements  
  xl: 16,                          // Extra large for hero elements
  pill: 999,                       // Full rounding for pills/badges
} as const;

// Elevation/shadow depths
export const elevation = {
  none: 0,
  subtle: 2,                       // Subtle shadow for cards
  moderate: 4,                     // Moderate shadow for active elements
  prominent: 8,                    // Prominent shadow for modals
  dramatic: 16,                    // Dramatic shadow for overlays
} as const;

// Icon sizes - consistent scaling
export const iconSizes = {
  xs: 16,                          // Small icons in text
  sm: 20,                          // Default icon size
  md: 24,                          // Medium icons for buttons
  lg: 32,                          // Large icons for primary actions
  xl: 48,                          // Extra large for hero areas
  xxl: 64,                         // Massive icons for empty states
} as const;

// Component-specific spacing
export const components = {
  // Button spacing
  button: {
    paddingHorizontal: spacing.lg,  // 16px horizontal padding
    paddingVertical: spacing.md,    // 12px vertical padding
    gap: spacing.sm,                // 8px gap between icon and text
  },
  
  // List items
  listItem: {
    paddingHorizontal: spacing.lg,  // 16px horizontal padding
    paddingVertical: spacing.md,    // 12px vertical padding
    gap: spacing.sm,                // 8px gap between elements
  },
  
  // Input fields
  input: {
    paddingHorizontal: spacing.lg,  // 16px horizontal padding
    paddingVertical: spacing.md,    // 12px vertical padding
    borderWidth: 1,                 // 1px border
  },
  
  // Header/navigation
  header: {
    height: touchTargets.large,     // 56px header height
    paddingHorizontal: spacing.lg,  // 16px horizontal padding
  },
  
  // Bottom navigation
  bottomNav: {
    height: spacing.huge,           // 64px total height
    paddingVertical: spacing.sm,    // 8px vertical padding
    iconSize: iconSizes.md,         // 24px icons
  },
  
  // FAB (Floating Action Button)
  fab: {
    size: touchTargets.large,       // 56px diameter
    iconSize: iconSizes.md,         // 24px icon
    margin: spacing.lg,             // 16px margin from edges
  },
  
  // Progress ring
  progressRing: {
    size: 120,                      // 120px diameter for main progress ring
    strokeWidth: 8,                 // 8px stroke width
    padding: spacing.lg,            // 16px padding around ring
  },
} as const;