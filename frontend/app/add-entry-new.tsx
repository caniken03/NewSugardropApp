import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';

const mealTypes = [
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
    sugarpointsPer100g: (params.carbs_per_100g as string) || (params.sugarPer100g as string) || '',
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
    const sugarpointsPer100g = parseFloat(formData.sugarpointsPer100g) || 0;
    const portionSize = parseFloat(formData.portionSize) || 0;
    const totalSugarPoints = (sugarpointsPer100g * portionSize) / 100;
    return Math.round(totalSugarPoints);
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
    const { name, sugarpointsPer100g, fatPer100g, proteinPer100g, portionSize } = formData;

    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter a food name');
      return;
    }

    const sugarpointsValue = parseFloat(sugarpointsPer100g);
    const fatValue = parseFloat(fatPer100g) || 0;
    const proteinValue = parseFloat(proteinPer100g) || 0;
    const portionValue = parseFloat(portionSize);

    if (isNaN(sugarpointsValue) || sugarpointsValue < 0) {
      Alert.alert('Invalid Input', 'Please enter valid SugarPoints content');
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
        carbs_per_100g: sugarpointsValue,
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

  const sugarPoints = calculateSugarPoints();
  const totalFat = calculateTotalFat();
  const totalProtein = calculateTotalProtein();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Food</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Food Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Food name</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(value) => updateFormData('name', value)}
            placeholder="e.g., Apple, Chicken breast"
            placeholderTextColor="#999999"
            autoCapitalize="words"
          />
        </View>

        {/* SugarPoints */}
        <View style={styles.section}>
          <Text style={styles.label}>SugarPoints (per 100g)</Text>
          <TextInput
            style={styles.input}
            value={formData.sugarpointsPer100g}
            onChangeText={(value) => updateFormData('sugarpointsPer100g', value)}
            placeholder="14"
            placeholderTextColor="#999999"
            keyboardType="decimal-pad"
          />
          <Text style={styles.helper}>Check nutrition label for total SugarPoints</Text>
        </View>

        {/* Fat & Protein Row */}
        <View style={styles.row}>
          <View style={styles.halfSection}>
            <Text style={styles.label}>Fat (per 100g)</Text>
            <TextInput
              style={styles.input}
              value={formData.fatPer100g}
              onChangeText={(value) => updateFormData('fatPer100g', value)}
              placeholder="0.2"
              placeholderTextColor="#999999"
              keyboardType="decimal-pad"
            />
          </View>
          
          <View style={styles.halfSection}>
            <Text style={styles.label}>Protein (per 100g)</Text>
            <TextInput
              style={styles.input}
              value={formData.proteinPer100g}
              onChangeText={(value) => updateFormData('proteinPer100g', value)}
              placeholder="0.3"
              placeholderTextColor="#999999"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Portion Size */}
        <View style={styles.section}>
          <Text style={styles.label}>Portion size (grams)</Text>
          <TextInput
            style={styles.input}
            value={formData.portionSize}
            onChangeText={(value) => updateFormData('portionSize', value)}
            placeholder="100"
            placeholderTextColor="#999999"
            keyboardType="decimal-pad"
          />
        </View>

        {/* Meal Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Meal type</Text>
          <View style={styles.mealTypeGrid}>
            {mealTypes.map((meal) => (
              <TouchableOpacity
                key={meal.key}
                style={[
                  styles.mealTypeButton,
                  formData.mealType === meal.key && styles.selectedMealType,
                ]}
                onPress={() => updateFormData('mealType', meal.key)}>
                <Ionicons
                  name={meal.icon as any}
                  size={20}
                  color={formData.mealType === meal.key ? '#4A90E2' : '#666666'}
                />
                <Text style={[
                  styles.mealTypeText,
                  formData.mealType === meal.key && styles.selectedMealTypeText,
                ]}>
                  {meal.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Summary</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.sugarpointsNumber}>
                {sugarPoints === 0 ? 'Nil' : sugarPoints}
              </Text>
              <Text style={styles.sugarpointsLabel}>SugarPoints</Text>
            </View>
            
            <View style={styles.summaryDetails}>
              {totalFat > 0 && (
                <Text style={styles.summaryDetail}>Fat: {totalFat.toFixed(1)}g</Text>
              )}
              {totalProtein > 0 && (
                <Text style={styles.summaryDetail}>Protein: {totalProtein.toFixed(1)}g</Text>
              )}
              <Text style={styles.summaryDetail}>Portion: {formData.portionSize}g</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}>
          {loading ? (
            <Text style={styles.saveButtonText}>Saving...</Text>
          ) : (
            <Text style={styles.saveButtonText}>Save Food Entry</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
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