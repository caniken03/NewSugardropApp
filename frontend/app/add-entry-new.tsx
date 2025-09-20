import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { colors, typography, spacing, layout, touchTargets, borderRadius } from '@/design-system';
import { Button, Card } from '@/design-system/components';

interface MealType {
  key: string;
  label: string;
  icon: string;
}

const mealTypes: MealType[] = [
  { key: 'breakfast', label: 'Breakfast', icon: 'sunny-outline' },
  { key: 'lunch', label: 'Lunch', icon: 'restaurant-outline' },
  { key: 'dinner', label: 'Dinner', icon: 'moon-outline' },
  { key: 'snack', label: 'Snack', icon: 'fast-food-outline' },
];

export default function AddEntryModal() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  const [formData, setFormData] = useState({
    name: (params.foodName as string) || '',
    carbsPer100g: (params.carbs_per_100g as string) || (params.sugarPer100g as string) || '',
    fatPer100g: (params.fat_per_100g as string) || '',
    proteinPer100g: (params.protein_per_100g as string) || '',
    portionSize: '100',
    mealType: 'snack',
  });
  const [loading, setLoading] = useState(false);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateSugarPoints = () => {
    const carbsPer100g = parseFloat(formData.carbsPer100g) || 0;
    const portionSize = parseFloat(formData.portionSize) || 0;
    const totalCarbs = (carbsPer100g * portionSize) / 100;
    return Math.round(totalCarbs);
  };

  const calculateSugarPointBlocks = () => {
    const sugarPoints = calculateSugarPoints();
    return Math.round(sugarPoints / 6);
  };

  const calculateTotalFat = () => {
    const fatPer100g = parseFloat(formData.fatPer100g) || 0;
    const portionSize = parseFloat(formData.portionSize) || 0;
    return (fatPer100g * portionSize) / 100;
  };

  const calculateTotalProtein = () => {
    const proteinPer100g = parseFloat(formData.proteinPer100g) || 0;
    const portionSize = parseFloat(formData.portionSize) || 0;
    return (proteinPer100g * portionSize) / 100;
  };

  const handleSave = async () => {
    const { name, carbsPer100g, fatPer100g, proteinPer100g, portionSize } = formData;

    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter a food name');
      return;
    }

    const carbsValue = parseFloat(carbsPer100g);
    const fatValue = parseFloat(fatPer100g) || 0;
    const proteinValue = parseFloat(proteinPer100g) || 0;
    const portionValue = parseFloat(portionSize);

    if (isNaN(carbsValue) || carbsValue < 0) {
      Alert.alert('Invalid Input', 'Please enter a valid carbohydrate content');
      return;
    }

    if (isNaN(portionValue) || portionValue <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid portion size');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/food/entries', {
        name: name.trim(),
        carbs_per_100g: carbsValue,
        fat_per_100g: fatValue,
        protein_per_100g: proteinValue,
        portion_size: portionValue,
        meal_type: formData.mealType,
      });

      Alert.alert('Success', 'Food entry added successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Error adding food entry:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to add food entry'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <LoadingSpinner />
      </View>
    );
  }

  const sugarPoints = calculateSugarPoints();
  const sugarPointBlocks = calculateSugarPointBlocks();
  const totalFat = calculateTotalFat();
  const totalProtein = calculateTotalProtein();

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
          accessibilityLabel="Close">
          <Ionicons name="close" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Food Entry</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Meal Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meal Type</Text>
          <View style={styles.mealTypeGrid}>
            {mealTypes.map((meal) => (
              <TouchableOpacity
                key={meal.key}
                style={[
                  styles.mealTypeButton,
                  formData.mealType === meal.key && styles.activeMealType,
                ]}
                onPress={() => updateFormData('mealType', meal.key)}
                accessibilityRole="button"
                accessibilityLabel={`Select ${meal.label}`}>
                <Ionicons
                  name={meal.icon as any}
                  size={20}
                  color={formData.mealType === meal.key ? colors.primary[400] : colors.text.tertiary}
                />
                <Text
                  style={[
                    styles.mealTypeText,
                    formData.mealType === meal.key && styles.activeMealTypeText,
                  ]}>
                  {meal.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Food Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Food Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Food Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              placeholder="e.g., Apple, Chicken Breast, Brown Rice"
              placeholderTextColor={colors.text.tertiary}
              autoCapitalize="words"
              accessibilityLabel="Food name input"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Carbohydrates (per 100g) *</Text>
            <TextInput
              style={styles.input}
              value={formData.carbsPer100g}
              onChangeText={(value) => updateFormData('carbsPer100g', value)}
              placeholder="e.g., 14.0"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="decimal-pad"
              accessibilityLabel="Carbohydrates input"
            />
            <Text style={styles.helperText}>
              Check nutrition label for total carbohydrates
            </Text>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Fat (per 100g)</Text>
              <TextInput
                style={styles.input}
                value={formData.fatPer100g}
                onChangeText={(value) => updateFormData('fatPer100g', value)}
                placeholder="0.0"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="decimal-pad"
                accessibilityLabel="Fat content input"
              />
            </View>
            
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Protein (per 100g)</Text>
              <TextInput
                style={styles.input}
                value={formData.proteinPer100g}
                onChangeText={(value) => updateFormData('proteinPer100g', value)}
                placeholder="0.0"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="decimal-pad"
                accessibilityLabel="Protein content input"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Portion Size (grams) *</Text>
            <TextInput
              style={styles.input}
              value={formData.portionSize}
              onChangeText={(value) => updateFormData('portionSize', value)}
              placeholder="100"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="decimal-pad"
              accessibilityLabel="Portion size input"
            />
            <Text style={styles.helperText}>
              Weight of the portion you consumed
            </Text>
          </View>
        </View>

        {/* Nutrition Summary */}
        <Card variant="elevated" style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Nutrition Summary</Text>
          
          <View style={styles.sugarPointsDisplay}>
            <Text style={styles.sugarPointsAmount}>
              {sugarPoints === 0 ? 'Nil SugarPoints' : `${sugarPoints} SugarPoints`}
            </Text>
            {sugarPoints > 0 && (
              <Text style={styles.sugarPointsBlocks}>
                {sugarPointBlocks} Blocks
              </Text>
            )}
          </View>

          <View style={styles.nutritionGrid}>
            {totalFat > 0 && (
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Fat</Text>
                <Text style={styles.nutritionValue}>{totalFat.toFixed(1)}g</Text>
              </View>
            )}
            {totalProtein > 0 && (
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Protein</Text>
                <Text style={styles.nutritionValue}>{totalProtein.toFixed(1)}g</Text>
              </View>
            )}
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Portion</Text>
              <Text style={styles.nutritionValue}>{formData.portionSize}g</Text>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => router.back()}
            style={styles.cancelButton}
          />
          
          <Button
            title="Save Entry"
            onPress={handleSave}
            disabled={loading}
            loading={loading}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: layout.screenPadding,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.surface,
  },

  closeButton: {
    width: touchTargets.minimum,
    height: touchTargets.minimum,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
  },

  headerTitle: {
    ...typography.headlineSmall,
    color: colors.text.primary,
  },

  headerSpacer: {
    width: touchTargets.minimum,
  },

  // Content
  scrollView: {
    flex: 1,
  },

  content: {
    padding: layout.screenPadding,
    paddingBottom: spacing.huge,
  },

  // Sections
  section: {
    marginBottom: spacing.xxl,
  },

  sectionTitle: {
    ...typography.headlineSmall,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },

  // Meal Type Selection
  mealTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },

  mealTypeButton: {
    flex: 1,
    minWidth: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    gap: spacing.sm,
  },

  activeMealType: {
    borderColor: colors.primary[400],
    backgroundColor: colors.primary[50],
  },

  mealTypeText: {
    ...typography.labelLarge,
    color: colors.text.secondary,
  },

  activeMealTypeText: {
    color: colors.primary[400],
    fontWeight: '600',
  },

  // Form Inputs
  inputContainer: {
    marginBottom: spacing.lg,
  },

  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  inputHalf: {
    flex: 1,
  },

  label: {
    ...typography.labelLarge,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },

  input: {
    height: touchTargets.comfortable,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderColor: colors.border.light,
    color: colors.text.primary,
    fontSize: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  helperText: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },

  // Summary Card
  summaryCard: {
    marginBottom: spacing.xxl,
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[100],
  },

  summaryTitle: {
    ...typography.headlineSmall,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },

  sugarPointsDisplay: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  sugarPointsAmount: {
    ...typography.displayMedium,
    color: colors.primary[400],
    fontWeight: '700',
    marginBottom: spacing.xs,
  },

  sugarPointsBlocks: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
  },

  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },

  nutritionItem: {
    alignItems: 'center',
  },

  nutritionLabel: {
    ...typography.labelMedium,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  nutritionValue: {
    ...typography.titleMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  cancelButton: {
    flex: 1,
  },

  saveButton: {
    flex: 2,
  },
});