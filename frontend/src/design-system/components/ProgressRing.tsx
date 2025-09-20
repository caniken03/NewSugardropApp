import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../colors';
import { typography } from '../typography';
import { spacing } from '../spacing';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface ProgressRingProps {
  /** Progress percentage (0-100) */
  progress: number;
  /** Ring diameter */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Custom color (optional - auto-determined by progress) */
  color?: string;
  /** Animation duration in ms */
  duration?: number;
  /** Center content */
  children?: React.ReactNode;
}

export default function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  color,
  duration = 1500,
  children,
}: ProgressRingProps) {
  const animatedProgress = useSharedValue(0);
  
  // Calculate circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Determine color based on progress if not provided
  const progressColor = color || getProgressColor(progress);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, duration]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - (animatedProgress.value / 100) * circumference;
    
    return {
      strokeDashoffset,
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.neutral[200]}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
          animatedProps={animatedProps}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      
      {/* Center content */}
      {children && (
        <View style={styles.centerContent}>
          {children}
        </View>
      )}
    </View>
  );
}

/**
 * Get progress color based on SugarPoints intake level
 */
function getProgressColor(progress: number): string {
  if (progress <= 50) return colors.tracker.excellent;  // Green - great control
  if (progress <= 75) return colors.tracker.good;       // Light green - good
  if (progress <= 90) return colors.tracker.moderate;   // Orange - moderate
  if (progress <= 100) return colors.tracker.warning;   // Dark orange - warning
  return colors.tracker.danger;                         // Red - over limit
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  svg: {
    position: 'absolute',
  },

  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
});