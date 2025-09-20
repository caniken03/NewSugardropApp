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
import { apiClient } from '../../src/services/api';
import AuthGuard from '../../src/components/AuthGuard';
import LoadingSpinner from '../../src/components/LoadingSpinner';

interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  sugar_per_100g: number;
  calories_per_100g: number;
  category: string;
  confidence?: number;
}

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
  const [popularFoods, setPopularFoods] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingPopular, setIsLoadingPopular] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  React.useEffect(() => {
    loadPopularFoods();
  }, []);

  const loadPopularFoods = async (category?: string) => {
    setIsLoadingPopular(true);
    try {
      const response = await apiClient.get('/food/popular', {
        params: { category, limit: 10 }
      });
      setPopularFoods(response.data.results || []);
    } catch (error) {
      console.error('Error loading popular foods:', error);
    } finally {
      setIsLoadingPopular(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await apiClient.post('/food/search', {
        query: searchQuery.trim(),
        limit: 20
      });
      setResults(response.data.results || []);
    } catch (error) {
      console.error('Error searching food:', error);
      Alert.alert('Error', 'Failed to search foods. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    if (activeCategory === category) {
      setActiveCategory(null);
      loadPopularFoods();
    } else {
      setActiveCategory(category);
      loadPopularFoods(category.toLowerCase());
    }
  };

  const handleSelectFood = (food: FoodItem) => {
    router.push({
      pathname: '/(modals)/add-entry',
      params: {
        foodName: food.name,
        sugarPer100g: food.sugar_per_100g.toString(),
        caloriesPer100g: food.calories_per_100g.toString(),
        brand: food.brand || '',
        category: food.category,
      },
    });
  };

  const getSugarLevel = (sugar: number) => {
    if (sugar < 5) return { level: 'Low', color: colors.success };
    if (sugar < 15) return { level: 'Medium', color: colors.warning };
    return { level: 'High', color: colors.error };
  };

  const categories = ['Fruits', 'Vegetables', 'Protein', 'Grains', 'Dairy', 'Snacks', 'Beverages'];

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
          disabled={isSearching || !searchQuery.trim()}>
          {isSearching ? (
            <LoadingSpinner size="small" />
          ) : (
            <Ionicons name="search" size={20} color="#ffffff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Categories
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: activeCategory === category ? colors.primary : colors.surface,
                },
              ]}
              onPress={() => handleCategorySelect(category)}>
              <Text
                style={[
                  styles.categoryText,
                  {
                    color: activeCategory === category ? '#ffffff' : colors.text,
                  },
                ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results */}
      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        {/* Search Results */}
        {results.length > 0 && (
          <>
            <View style={styles.resultHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Search Results ({results.length})
              </Text>
              <View style={[styles.sourceBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.sourceBadgeText}>Passio AI</Text>
              </View>
            </View>
            
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
                    <View style={styles.foodMeta}>
                      <Text style={[styles.foodCategory, { color: colors.textSecondary }]}>
                        {food.category}
                      </Text>
                      {food.confidence && (
                        <Text style={[styles.confidence, { color: colors.textSecondary }]}>
                          • {Math.round(food.confidence * 100)}% match
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.nutritionInfo}>
                    <View style={styles.nutritionItem}>
                      <Text style={[styles.nutritionValue, { color: sugarLevel.color }]}>
                        {food.sugar_per_100g.toFixed(1)}g
                      </Text>
                      <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>
                        Sugar/100g
                      </Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={[styles.nutritionValue, { color: colors.text }]}>
                        {Math.round(food.calories_per_100g)}
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

        {/* Popular Foods */}
        <View style={styles.popularSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {activeCategory ? `Popular ${activeCategory}` : 'Popular Foods'}
          </Text>
          
          {isLoadingPopular ? (
            <View style={styles.loadingContainer}>
              <LoadingSpinner />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Loading foods...
              </Text>
            </View>
          ) : (
            popularFoods.map((food) => {
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
                        {food.sugar_per_100g.toFixed(1)}g
                      </Text>
                      <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>
                        Sugar/100g
                      </Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={[styles.nutritionValue, { color: colors.text }]}>
                        {Math.round(food.calories_per_100g)}
                      </Text>
                      <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>
                        Cal/100g
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Empty States */}
        {searchQuery.length > 0 && results.length === 0 && !isSearching && (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search" size={48} color={colors.textSecondary} />
            <Text style={[styles.noResultsTitle, { color: colors.text }]}>
              No Results Found
            </Text>
            <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
              Try different keywords or add a custom food entry
            </Text>
            <TouchableOpacity
              style={[styles.addCustomButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(modals)/add-entry')}>
              <Text style={styles.addCustomButtonText}>Add Custom Food</Text>
            </TouchableOpacity>
          </View>
        )}

        {searchQuery.length === 0 && popularFoods.length === 0 && !isLoadingPopular && (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="restaurant" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
              Discover Foods
            </Text>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              Search for any food to get detailed nutrition information powered by Passio AI
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
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sourceBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  popularSection: {
    marginTop: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    // Use web-compatible shadow instead of React Native shadow properties
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    // Remove elevation as it's Android-specific and causes web issues
  },    shadowOpacity: 0.05,
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
  foodMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  foodCategory: {
    fontSize: 12,
  },
  confidence: {
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