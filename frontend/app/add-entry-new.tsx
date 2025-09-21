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
    backgroundColor: '#ffffff',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },

  headerSpacer: {
    width: 44,
  },

  // Content
  scrollView: {
    flex: 1,
  },

  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },

  row: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 16,
  },

  halfSection: {
    flex: 1,
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#ffffff',
  },

  helper: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },

  // Meal Types
  mealTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  mealTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 8,
  },

  selectedMealType: {
    backgroundColor: '#e8f4fd',
    borderColor: '#4A90E2',
  },

  mealTypeText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },

  selectedMealTypeText: {
    color: '#4A90E2',
    fontWeight: '600',
  },

  // Summary
  summarySection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },

  summaryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },

  summaryHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },

  sugarpointsNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },

  sugarpointsLabel: {
    fontSize: 16,
    color: '#666666',
  },

  summaryDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },

  summaryDetail: {
    fontSize: 14,
    color: '#666666',
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },

  saveButton: {
    height: 52,
    backgroundColor: '#000000',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonDisabled: {
    backgroundColor: '#cccccc',
  },

  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});