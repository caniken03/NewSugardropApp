import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../colors';
import { typography } from '../typography';
import { spacing, touchTargets, borderRadius } from '../spacing';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
}: ButtonProps) {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  const iconColor = getIconColor(variant, disabled);
  const iconSize = getIconSize(size);

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={iconColor}
          accessibilityLabel="Loading"
        />
      );
    }

    return (
      <View style={styles.content}>
        {icon && iconPosition === 'left' && (
          <Ionicons name={icon} size={iconSize} color={iconColor} />
        )}
        <Text style={textStyles}>{title}</Text>
        {icon && iconPosition === 'right' && (
          <Ionicons name={icon} size={iconSize} color={iconColor} />
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: disabled || loading }}>
      {renderContent()}
    </TouchableOpacity>
  );
}

function getIconColor(variant: string, disabled: boolean): string {
  if (disabled) return colors.neutral[400];
  
  switch (variant) {
    case 'primary':
      return colors.neutral[0];
    case 'secondary':
      return colors.primary[400];
    case 'outline':
      return colors.primary[400];
    case 'ghost':
      return colors.primary[400];
    default:
      return colors.neutral[0];
  }
}

function getIconSize(size: string): number {
  switch (size) {
    case 'small':
      return 16;
    case 'large':
      return 24;
    default:
      return 20;
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: touchTargets.minimum,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Variants
  primary: {
    backgroundColor: colors.primary[400],
  },
  
  secondary: {
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary[400],
  },
  
  ghost: {
    backgroundColor: 'transparent',
  },

  // Sizes
  small: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 36,
  },
  
  medium: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: touchTargets.minimum,
  },
  
  large: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    minHeight: touchTargets.comfortable,
  },

  // States
  disabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },

  fullWidth: {
    alignSelf: 'stretch',
  },

  // Content
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  // Text styles
  text: {
    ...typography.button,
    textAlign: 'center',
  },

  primaryText: {
    color: colors.neutral[0],
  },
  
  secondaryText: {
    color: colors.text.primary,
  },
  
  outlineText: {
    color: colors.primary[400],
  },
  
  ghostText: {
    color: colors.primary[400],
  },

  smallText: {
    fontSize: 12,
    lineHeight: 16,
  },
  
  mediumText: {
    fontSize: 14,
    lineHeight: 20,
  },
  
  largeText: {
    fontSize: 16,
    lineHeight: 24,
  },

  disabledText: {
    color: colors.neutral[400],
  },
});