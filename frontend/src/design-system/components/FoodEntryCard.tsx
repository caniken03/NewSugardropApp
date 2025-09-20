import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, touchTargets } from '@/design-system';
import { Card } from '@/design-system/components';

export interface FoodEntryCardProps {
  /** Food entry data */
  food: {
    id: string;
    name: string;
    sugar_points: number;
    sugar_point_blocks: number;
    carbs_per_100g: number;
    fat_per_100g: number;
    protein_per_100g: number;
    portion_size: number;
    meal_type?: string;
    timestamp?: string;
    source?: 'manual' | 'search' | 'scan' | 'ai';
    confidence?: number;
  };
  /** Card state */
  state?: 'default' | 'flagged' | 'favorite';
  /** Show detailed nutrition */
  showDetails?: boolean;
  /** Tap handler */
  onPress?: () => void;
  /** Action buttons */
  onEdit?: () => void;
  onDelete?: () => void;
  onFavorite?: () => void;
  /** Accessibility */
  accessibilityLabel?: string;
}

export default function FoodEntryCard({
  food,
  state = 'default',
  showDetails = true,
  onPress,
  onEdit,
  onDelete,
  onFavorite,
  accessibilityLabel,
}: FoodEntryCardProps) {
  
  const getMealIcon = (mealType?: string) => {
    switch (mealType?.toLowerCase()) {
      case 'breakfast': return 'sunny-outline';
      case 'lunch': return 'restaurant-outline';
      case 'dinner': return 'moon-outline';
      case 'snack': return 'fast-food-outline';
      default: return 'restaurant-outline';
    }
  };

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case 'scan': return 'camera-outline';
      case 'search': return 'search-outline';
      case 'ai': return 'sparkles-outline';
      case 'manual': return 'create-outline';
      default: return 'restaurant-outline';
    }
  };

  const getSugarPointsColor = (sugarPoints: number) => {
    if (sugarPoints === 0) return colors.neutral[400];
    if (sugarPoints <= 10) return colors.success[400];
    if (sugarPoints <= 25) return colors.tracker.good;
    if (sugarPoints <= 50) return colors.warning[400];
    return colors.error[400];
  };

  const formatNutrition = () => {
    const parts = [];
    
    if (food.fat_per_100g > 0) {
      const totalFat = (food.fat_per_100g * food.portion_size / 100);
      parts.push(`Fat: ${totalFat.toFixed(1)}g`);
    }
    
    if (food.protein_per_100g > 0) {
      const totalProtein = (food.protein_per_100g * food.portion_size / 100);
      parts.push(`Protein: ${totalProtein.toFixed(1)}g`);
    }
    
    return parts.join(' • ');
  };

  const cardVariant = state === 'flagged' ? 'elevated' : 'outlined';
  const cardStyle = [
    styles.card,
    state === 'flagged' && styles.flaggedCard,
    state === 'favorite' && styles.favoriteCard,
  ];

  return (
    <Card variant={cardVariant} style={cardStyle}>
      <TouchableOpacity
        style={styles.content}
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || `Food entry: ${food.name}`}>
        
        {/* Header row */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.mealIcon}>
              <Ionicons 
                name={getMealIcon(food.meal_type)} 
                size={16} 
                color={colors.primary[400]} 
              />
            </View>
            <Text style={styles.foodName} numberOfLines={1}>
              {food.name}
            </Text>
            {food.source && (
              <View style={styles.sourceIcon}>
                <Ionicons 
                  name={getSourceIcon(food.source)} 
                  size={12} 
                  color={colors.text.tertiary} 
                />
              </View>
            )}
          </View>
          
          {/* SugarPoints Badge */}
          <View style={[styles.sugarPointsBadge, { 
            backgroundColor: getSugarPointsColor(food.sugar_points) + '20' 
          }]}>
            <Text style={[styles.sugarPointsNumber, { 
              color: getSugarPointsColor(food.sugar_points) 
            }]}>
              {food.sugar_points === 0 ? 'Nil' : food.sugar_points}
            </Text>
            <Text style={[styles.sugarPointsLabel, { 
              color: getSugarPointsColor(food.sugar_points) 
            }]}>
              SP
            </Text>
          </View>
        </View>

        {/* Details */}
        {showDetails && (
          <View style={styles.details}>
            <Text style={styles.portionText}>
              {food.portion_size}g portion
              {food.sugar_point_blocks > 0 && ` • ${food.sugar_point_blocks} Blocks`}
            </Text>
            
            {formatNutrition() && (
              <Text style={styles.nutritionText}>
                {formatNutrition()}
              </Text>
            )}
            
            <View style={styles.metaRow}>
              <Text style={styles.mealType}>
                {food.meal_type?.charAt(0).toUpperCase() + food.meal_type?.slice(1) || 'Snack'}
              </Text>
              {food.confidence && food.confidence < 1 && (
                <Text style={styles.confidence}>
                  {Math.round(food.confidence * 100)}% confidence
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Action buttons */}
        {(onEdit || onDelete || onFavorite) && (
          <View style={styles.actions}>
            {onFavorite && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onFavorite}
                accessibilityLabel="Add to favorites">
                <Ionicons 
                  name={state === 'favorite' ? 'heart' : 'heart-outline'} 
                  size={20} 
                  color={state === 'favorite' ? colors.error[400] : colors.text.tertiary} 
                />
              </TouchableOpacity>
            )}
            
            {onEdit && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onEdit}
                accessibilityLabel="Edit food entry">
                <Ionicons name="create-outline" size={20} color={colors.text.tertiary} />
              </TouchableOpacity>
            )}
            
            {onDelete && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onDelete}
                accessibilityLabel="Delete food entry">
                <Ionicons name="trash-outline" size={20} color={colors.error[400]} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },

  flaggedCard: {
    borderColor: colors.warning[200],
    backgroundColor: colors.warning[50],
  },

  favoriteCard: {
    borderColor: colors.error[200],
    backgroundColor: colors.error[50],
  },

  content: {
    padding: spacing.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },

  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  mealIcon: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },

  foodName: {
    ...typography.titleLarge,
    color: colors.text.primary,
    flex: 1,
  },

  sourceIcon: {
    marginLeft: spacing.sm,
    opacity: 0.6,
  },

  sugarPointsBadge: {
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    minWidth: 48,
  },

  sugarPointsNumber: {
    ...typography.titleLarge,
    fontWeight: '700',
    lineHeight: 18,
  },

  sugarPointsLabel: {
    ...typography.labelSmall,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    lineHeight: 12,
  },

  // Details
  details: {
    marginBottom: spacing.sm,
  },

  portionText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },

  nutritionText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  mealType: {
    ...typography.labelSmall,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  confidence: {
    ...typography.labelSmall,
    color: colors.warning[500],
    fontStyle: 'italic',
  },

  // Actions
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },

  actionButton: {
    width: touchTargets.minimum,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
  },
});