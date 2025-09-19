import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import AuthGuard from '../../src/components/AuthGuard';

interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  sugar_per_100g: number;
  calories_per_100g: number;
  category: string;
}

const MOCK_FOODS: FoodItem[] = [
  {
    id: '1',
    name: 'Apple',
    sugar_per_100g: 10.4,
    calories_per_100g: 52,
    category: 'Fruits',
  },
  {
    id: '2',
    name: 'Banana',
    sugar_per_100g: 12.2,
    calories_per_100g: 89,
    category: 'Fruits',
  },
  {
    id: '3',
    name: 'Orange Juice',
    brand: 'Tropicana',
    sugar_per_100g: 8.4,
    calories_per_100g: 45,
    category: 'Beverages',
  },
  {
    id: '4',
    name: 'Chocolate Bar',
    brand: 'Hershey\'s',
    sugar_per_100g: 56.0,
    calories_per_100g: 534,
    category: 'Sweets',
  },
  {
    id: '5',
    name: 'Yogurt',
    brand: 'Chobani',
    sugar_per_100g: 4.7,
    calories_per_100g: 59,
    category: 'Dairy',
  },
  {
    id: '6',
    name: 'Coca Cola',
    brand: 'Coca-Cola',
    sugar_per_100g: 10.6,
    calories_per_100g: 42,
    category: 'Beverages',
  },
];

export default function SearchScreen() {
  return (
    <AuthGuard>
      <SearchContent />
    </AuthGuard>
  );
}

function SearchContent() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      const filtered = MOCK_FOODS.filter(
        food =>
          food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (food.brand && food.brand.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setResults(filtered);
      setIsSearching(false);
    }, 500);
  };

  const handleSelectFood = (food: FoodItem) => {
    router.push({
      pathname: '/(modals)/add-entry',
      params: {
        foodName: food.name,
        sugarPer100g: food.sugar_per_100g.toString(),
        caloriesPer100g: food.calories_per_100g.toString(),
      },
    });
  };

  const getSugarLevel = (sugar: number) => {
    if (sugar < 5) return { level: 'Low', color: colors.success };
    if (sugar < 15) return { level: 'Medium', color: colors.warning };
    return { level: 'High', color: colors.error };
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Header */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.surface }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for foods..."
            placeholderTextColor={colors.textSecondary}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setResults([]);
              }}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: colors.primary }]}
          onPress={handleSearch}
          disabled={isSearching}>
          <Ionicons name="search" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Quick Categories */}
      <View style={styles.categoriesContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Quick Categories
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['Fruits', 'Beverages', 'Sweets', 'Dairy', 'Snacks'].map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.categoryChip, { backgroundColor: colors.surface }]}
              onPress={() => {
                setSearchQuery(category);
                handleSearch();
              }}>
              <Text style={[styles.categoryText, { color: colors.text }]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Search Results */}
      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        {isSearching && (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Searching...
            </Text>
          </View>
        )}

        {results.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Search Results ({results.length})
            </Text>
            {results.map((food) => {
              const sugarLevel = getSugarLevel(food.sugar_per_100g);
              return (
                <TouchableOpacity
                  key={food.id}
                  style={[styles.foodItem, { backgroundColor: colors.surface }]}
                  onPress={() => handleSelectFood(food)}>
                  <View style={styles.foodInfo}>
                    <Text style={[styles.foodName, { color: colors.text }]}>
                      {food.name}
                    </Text>
                    {food.brand && (
                      <Text style={[styles.foodBrand, { color: colors.textSecondary }]}>
                        {food.brand}
                      </Text>
                    )}
                    <Text style={[styles.foodCategory, { color: colors.textSecondary }]}>
                      {food.category}
                    </Text>
                  </View>
                  <View style={styles.nutritionInfo}>
                    <View style={styles.nutritionItem}>
                      <Text style={[styles.nutritionValue, { color: sugarLevel.color }]}>
                        {food.sugar_per_100g}g
                      </Text>
                      <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>
                        Sugar/100g
                      </Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={[styles.nutritionValue, { color: colors.text }]}>
                        {food.calories_per_100g}
                      </Text>
                      <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>
                        Cal/100g
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {searchQuery.length > 0 && results.length === 0 && !isSearching && (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search" size={48} color={colors.textSecondary} />
            <Text style={[styles.noResultsTitle, { color: colors.text }]}>
              No Results Found
            </Text>
            <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
              Try searching with different keywords or add a custom food entry
            </Text>
            <TouchableOpacity
              style={[styles.addCustomButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(modals)/add-entry')}>
              <Text style={styles.addCustomButtonText}>Add Custom Food</Text>
            </TouchableOpacity>
          </View>
        )}

        {searchQuery.length === 0 && (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="restaurant" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
              Search for Foods
            </Text>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              Find nutrition information for thousands of foods and brands
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultsContainer: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  foodBrand: {
    fontSize: 14,
    marginBottom: 2,
  },
  foodCategory: {
    fontSize: 12,
  },
  nutritionInfo: {
    flexDirection: 'row',
    gap: 16,
    marginRight: 12,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  nutritionLabel: {
    fontSize: 10,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  addCustomButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addCustomButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});