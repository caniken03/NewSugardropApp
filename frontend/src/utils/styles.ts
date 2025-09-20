/**
 * Web-compatible styling utilities for React Native Web
 * Handles cross-platform styling issues
 */

// Web-compatible shadow styles that don't cause cssFloat errors
export const webSafeShadow = {
  small: {
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
  },
  medium: {
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  large: {
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
};

/**
 * Safely merge style arrays into a single object for DOM compatibility
 * Use this when passing styles to DOM elements (div, span, etc.)
 */
export function toStyle(styles: any[]): any {
  return Object.assign({}, ...styles.filter(Boolean));
}

/**
 * Platform-aware shadow helper
 * Returns web-safe shadows that don't cause React Native Web issues
 */
export function getShadow(size: 'small' | 'medium' | 'large' = 'small') {
  return webSafeShadow[size];
}