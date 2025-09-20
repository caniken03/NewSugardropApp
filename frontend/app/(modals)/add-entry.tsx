import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { apiClient } from '../../src/services/api';
import LoadingSpinner from '../../src/components/LoadingSpinner';

export default function AddEntryModal() {
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  
  const [formData, setFormData] = useState({
    name: (params.foodName as string) || '',
    sugarPer100g: (params.sugarPer100g as string) || '',
    caloriesPer100g: (params.caloriesPer100g as string) || '',
    portionSize: '100',
    mealType: 'snack',
  });
  const [loading, setLoading] = useState(false);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotalSugar = () => {
    const sugarPer100g = parseFloat(formData.sugarPer100g) || 0;
    const portionSize = parseFloat(formData.portionSize) || 0;
    return (sugarPer100g * portionSize) / 100;
  };

  const calculateTotalCalories = () => {
    const caloriesPer100g = parseFloat(formData.caloriesPer100g) || 0;
    const portionSize = parseFloat(formData.portionSize) || 0;
    return (caloriesPer100g * portionSize) / 100;
  };

  const handleSave = async () => {
    const { name, sugarPer100g, portionSize, caloriesPer100g } = formData;

    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a food name');
      return;
    }

    const sugarValue = parseFloat(sugarPer100g);
    const portionValue = parseFloat(portionSize);
    const caloriesValue = parseFloat(caloriesPer100g) || 0;

    if (isNaN(sugarValue) || sugarValue < 0) {
      Alert.alert('Error', 'Please enter a valid sugar content');
      return;
    }

    if (isNaN(portionValue) || portionValue <= 0) {
      Alert.alert('Error', 'Please enter a valid portion size');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/food/entries', {
        name: name.trim(),
        sugar_content: sugarValue / 100, // Convert to sugar per gram
        portion_size: portionValue,
        calories: caloriesValue > 0 ? caloriesValue / 100 : null, // Convert to calories per gram
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
    return <LoadingSpinner />;
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}>
        
        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Meal Type
            </Text>
            <View style={styles.mealTypeContainer}>
              {[
                { key: 'breakfast', label: 'Breakfast', icon: 'sunny' },
                { key: 'lunch', label: 'Lunch', icon: 'restaurant' },
                { key: 'dinner', label: 'moon', icon: 'moon' },
                { key: 'snack', label: 'Snack', icon: 'fast-food' },
              ].map((meal) => (
                <TouchableOpacity
                  key={meal.key}
                  style={[
                    styles.mealTypeButton,
                    {
                      backgroundColor: formData.mealType === meal.key ? colors.primary : colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => updateFormData('mealType', meal.key)}>
                  <Ionicons
                    name={meal.icon as any}
                    size={20}
                    color={formData.mealType === meal.key ? '#ffffff' : colors.text}
                  />
                  <Text
                    style={[
                      styles.mealTypeText,
                      {
                        color: formData.mealType === meal.key ? '#ffffff' : colors.text,
                      },
                    ]}>
                    {meal.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Food Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              placeholder="e.g., Apple, Chocolate Bar"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Sugar Content (per 100g)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={formData.sugarPer100g}
              onChangeText={(value) => updateFormData('sugarPer100g', value)}
              placeholder="e.g., 10.4"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
            />
            <Text style={[styles.helperText, { color: colors.textSecondary }]}>
              Check nutrition label or search online
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Calories (per 100g) - Optional
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={formData.caloriesPer100g}
              onChangeText={(value) => updateFormData('caloriesPer100g', value)}
              placeholder="e.g., 52"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Portion Size (grams)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={formData.portionSize}
              onChangeText={(value) => updateFormData('portionSize', value)}
              placeholder="e.g., 150"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
            />
            <Text style={[styles.helperText, { color: colors.textSecondary }]}>
              Weight of the portion you consumed
            </Text>
          </View>
        </View>

        {/* Summary */}
        <View style={[styles.summaryContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            Nutrition Summary
          </Text>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Total Sugar:
            </Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {calculateTotalSugar().toFixed(1)}g
            </Text>
          </View>

          {formData.caloriesPer100g && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Total Calories:
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {calculateTotalCalories().toFixed(0)} cal
              </Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Portion:
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formData.portionSize}g
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: colors.border }]}
            onPress={() => router.back()}>
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            disabled={loading}>
            <Text style={styles.saveButtonText}>Save Entry</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  summaryContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});