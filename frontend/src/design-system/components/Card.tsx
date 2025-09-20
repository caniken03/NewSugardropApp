import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../colors';
import { spacing, borderRadius } from '../spacing';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export default function Card({
  children,
  variant = 'default',
  padding = 'medium',
  style,
}: CardProps) {
  const cardStyles = [
    styles.base,
    styles[variant],
    styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
    style,
  ];

  return <View style={cardStyles}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },

  // Variants
  default: {
    backgroundColor: colors.surface,
  },

  elevated: {
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  outlined: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.light,
  },

  // Padding variants
  paddingNone: {
    padding: 0,
  },

  paddingSmall: {
    padding: spacing.md,
  },

  paddingMedium: {
    padding: spacing.lg,
  },

  paddingLarge: {
    padding: spacing.xl,
  },
});