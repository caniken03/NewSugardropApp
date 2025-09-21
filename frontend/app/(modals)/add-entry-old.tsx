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
import { useAuth } from '../../src/contexts/AuthContext';
import { apiClient } from '../../src/services/api';
import LoadingSpinner from '../../src/components/LoadingSpinner';

export default function AddEntryModal() {
  const params = useLocalSearchParams();
  
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
      Alert.alert('Error', 'Please enter a food name');
      return;
    }

    const carbsValue = parseFloat(carbsPer100g);
    const fatValue = parseFloat(fatPer100g) || 0;
    const proteinValue = parseFloat(proteinPer100g) || 0;
    const portionValue = parseFloat(portionSize);

    if (isNaN(carbsValue) || carbsValue < 0) {
      Alert.alert('Error', 'Please enter a valid carbohydrate content');
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
    return <LoadingSpinner />;
  }

  const sugarPoints = calculateSugarPoints();
  const sugarPointBlocks = calculateSugarPointBlocks();
  const totalFat = calculateTotalFat();
  const totalProtein = calculateTotalProtein();

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: '#0c0c0c' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#9CA3AF" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: '#fff' }]}>
            Add Food Entry
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: '#fff' }]}>
              Meal Type
            </Text>
            <View style={styles.mealTypeContainer}>
              {[
                { key: 'breakfast', label: 'Breakfast', icon: 'sunny' },
                { key: 'lunch', label: 'Lunch', icon: 'restaurant' },
                { key: 'dinner', label: 'Dinner', icon: 'moon' },
                { key: 'snack', label: 'Snack', icon: 'fast-food' },
              ].map((meal) => (
                <TouchableOpacity
                  key={meal.key}
                  style={[
                    styles.mealTypeButton,
                    {
                      backgroundColor: formData.mealType === meal.key ? '#2563EB' : '#111827',
                      borderColor: '#374151',
                    },
                  ]}
                  onPress={() => updateFormData('mealType', meal.key)}>
                  <Ionicons
                    name={meal.icon as any}
                    size={20}
                    color={formData.mealType === meal.key ? '#ffffff' : '#E5E7EB'}
                  />
                  <Text
                    style={[
                      styles.mealTypeText,
                      {
                        color: formData.mealType === meal.key ? '#ffffff' : '#E5E7EB',
                      },
                    ]}>
                    {meal.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: '#fff' }]}>Food Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: '#111827',
                  borderColor: '#374151',
                  color: '#E5E7EB',
                },
              ]}
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              placeholder="e.g., Apple, Chicken Breast, Brown Rice"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: '#fff' }]}>
              Carbohydrates (per 100g)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: '#111827',
                  borderColor: '#374151',
                  color: '#E5E7EB',
                },
              ]}
              value={formData.carbsPer100g}
              onChangeText={(value) => updateFormData('carbsPer100g', value)}
              placeholder="e.g., 14.0"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
            />
            <Text style={[styles.helperText, { color: '#9CA3AF' }]}>
              Check nutrition label for total carbohydrates
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: '#fff' }]}>
              Fat (per 100g)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: '#111827',
                  borderColor: '#374151',
                  color: '#E5E7EB',
                },
              ]}
              value={formData.fatPer100g}
              onChangeText={(value) => updateFormData('fatPer100g', value)}
              placeholder="e.g., 0.2"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: '#fff' }]}>
              Protein (per 100g)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: '#111827',
                  borderColor: '#374151',
                  color: '#E5E7EB',
                },
              ]}
              value={formData.proteinPer100g}
              onChangeText={(value) => updateFormData('proteinPer100g', value)}
              placeholder="e.g., 0.3"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: '#fff' }]}>
              Portion Size (grams)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: '#111827',
                  borderColor: '#374151',
                  color: '#E5E7EB',
                },
              ]}
              value={formData.portionSize}
              onChangeText={(value) => updateFormData('portionSize', value)}
              placeholder="e.g., 150"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
            />
            <Text style={[styles.helperText, { color: '#9CA3AF' }]}>
              Weight of the portion you consumed
            </Text>
          </View>
        </View>

        {/* SugarPoints Summary */}
        <View style={[styles.summaryContainer, { backgroundColor: '#111827' }]}>
          <Text style={[styles.summaryTitle, { color: '#fff' }]}>
            Nutrition Summary
          </Text>
          
          {/* SugarPoints Display */}
          <View style={styles.sugarPointsDisplay}>
            <Text style={[styles.sugarPointsAmount, { color: '#2563EB' }]}>
              {sugarPoints === 0 ? 'Nil SugarPoints' : `${sugarPoints} SugarPoints`}
            </Text>
            {sugarPoints > 0 && (
              <Text style={[styles.sugarPointsBlocks, { color: '#E5E7EB' }]}>
                {sugarPointBlocks} Blocks
              </Text>
            )}
          </View>

          {/* Nutrition Details */}
          <View style={styles.nutritionDetails}>
            {totalFat > 0 && (
              <Text style={[styles.nutritionText, { color: '#E5E7EB' }]}>
                Fat: {totalFat.toFixed(1)}g
              </Text>
            )}
            {totalProtein > 0 && (
              <Text style={[styles.nutritionText, { color: '#E5E7EB' }]}>
                Protein: {totalProtein.toFixed(1)}g
              </Text>
            )}
            <Text style={[styles.nutritionText, { color: '#E5E7EB' }]}>
              Portion: {formData.portionSize}g
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: '#374151', backgroundColor: '#111827' }]}
            onPress={() => router.back()}>
            <Text style={[styles.cancelButtonText, { color: '#E5E7EB' }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: '#2563EB' }]}
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
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingTop: 8,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '400',
  },
  helperText: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 4,
  },
  summaryContainer: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
    borderColor: '#374151',
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  sugarPointsDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  sugarPointsAmount: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  sugarPointsBlocks: {
    fontSize: 14,
    fontWeight: '400',
  },
  nutritionDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  nutritionText: {
    fontSize: 14,
    fontWeight: '400',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '400',
  },
  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  mealTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999, // Pill shape
    borderWidth: 1,
    gap: 6,
  },
  mealTypeText: {
    fontSize: 14,
    fontWeight: '400',
  },
});