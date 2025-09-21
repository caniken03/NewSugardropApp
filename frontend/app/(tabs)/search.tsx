import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';
import AnimatedNavigationModal from '@/components/AnimatedNavigationModal';
import { FoodEntryCard, Card, Button } from '@/design-system/components';
import { colors, typography, spacing, layout, borderRadius, touchTargets } from '@/design-system/tokens';

const navigationItems = [
  { key: 'log_food', title: 'Log Food', icon: 'restaurant-outline', route: '/(modals)/add-entry', description: 'Add meal manually' },
  { key: 'scan_food', title: 'Scan Food', icon: 'camera-outline', route: '/(tabs)/scanner', description: 'Camera recognition' },
  { key: 'ai_coach', title: 'AI Coach', icon: 'chatbubble-ellipses-outline', route: '/(tabs)/aichat', description: 'Get nutrition advice' },
  { key: 'progress', title: 'Progress', icon: 'analytics-outline', route: '/(tabs)/progress', description: 'View your stats' },
  { key: 'home', title: 'Home', icon: 'home-outline', route: '/(tabs)/home', description: 'Back to dashboard' }
];

interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  carbs_per_100g: number;
  fat_per_100g: number;
  protein_per_100g: number;
  sugar_per_100g: number; // Legacy field
  category: string;
  confidence?: number;
}

export default function SearchScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [popularFoods, setPopularFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPopular, setLoadingPopular] = useState(true);

  // Load popular foods on mount
  useEffect(() => {
    fetchPopularFoods();
  }, []);

  const fetchPopularFoods = async () => {
    try {
      const response = await apiClient.get('/food/popular?limit=8');
      setPopularFoods(response.data.results || []);
    } catch (error) {
      console.error('Error fetching popular foods:', error);
    } finally {
      setLoadingPopular(false);
    }
  };

  const searchFoods = async () => {
    if (!query.trim()) {
      Alert.alert('Search Required', 'Please enter a food name to search');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/food/search', {
        query: query.trim(),
        limit: 20,
      });
      setResults(response.data.results || []);
    } catch (error) {
      console.error('Error searching foods:', error);
      Alert.alert('Search Error', 'Failed to search for foods');
    } finally {
      setLoading(false);
    }
  };

  const handleFoodSelect = (food: FoodItem) => {
    // Calculate SugarPoints from carbs
    const sugarPoints = Math.round(food.carbs_per_100g);
    const sugarPointBlocks = Math.round(sugarPoints / 6);
    
    // Navigate to add entry with pre-filled data
    router.push({
      pathname: '/(modals)/add-entry',
      params: {
        foodName: food.name,
        carbs_per_100g: food.carbs_per_100g.toString(),
        fat_per_100g: food.fat_per_100g.toString(),
        protein_per_100g: food.protein_per_100g.toString(),
        category: food.category,
        source: 'search',
      },
    });
  };

  const renderFoodItem = ({ item }: { item: FoodItem }) => {
    const sugarPoints = Math.round(item.carbs_per_100g);
    const sugarPointBlocks = Math.round(sugarPoints / 6);
    
    return (
      <FoodEntryCard
        food={{
          id: item.id,
          name: item.name,
          sugar_points: sugarPoints,
          sugar_point_blocks: sugarPointBlocks,
          carbs_per_100g: item.carbs_per_100g,
          fat_per_100g: item.fat_per_100g,
          protein_per_100g: item.protein_per_100g,
          portion_size: 100, // Default portion for search results
          source: 'search',
          confidence: item.confidence,
        }}
        onPress={() => handleFoodSelect(item)}
        accessibilityLabel={`Add ${item.name} to food log`}
      />
    );
  };

  const renderEmptyState = () => (
    <Card variant="outlined" style={styles.emptyState}>
      <Ionicons name="search-outline" size={48} color={colors.neutral[300]} />
      <Text style={styles.emptyTitle}>
        {query ? 'No foods found' : 'Search for foods'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {query 
          ? `Try searching for "${query}" with different keywords`
          : 'Search our nutrition database to find foods and their SugarPoints'
        }
      </Text>
    </Card>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <Text style={styles.screenTitle}>Food Search</Text>
        <Text style={styles.screenSubtitle}>
          Find foods and their SugarPoints content
        </Text>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color={colors.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search foods (e.g., apple, chicken, rice)"
              placeholderTextColor={colors.text.tertiary}
              returnKeyType="search"
              onSubmitEditing={searchFoods}
              autoCorrect={false}
              accessibilityLabel="Food search input"
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setQuery('');
                  setResults([]);
                }}
                style={styles.clearButton}
                accessibilityLabel="Clear search">
                <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
              </TouchableOpacity>
            )}
          </View>
          
          <Button
            title="Search"
            onPress={searchFoods}
            disabled={!query.trim() || loading}
            loading={loading}
            style={styles.searchButton}
          />
        </View>
      </View>

      {/* Results */}
      <View style={styles.resultsContainer}>
        {results.length > 0 ? (
          <>
            <Text style={styles.resultsHeader}>
              Search Results ({results.length})
            </Text>
            <FlatList
              data={results}
              renderItem={renderFoodItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultsList}
            />
          </>
        ) : query && !loading ? (
          renderEmptyState()
        ) : (
          <>
            <Text style={styles.resultsHeader}>
              {loadingPopular ? 'Loading...' : 'Popular Foods'}
            </Text>
            {loadingPopular ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[400]} />
              </View>
            ) : (
              <FlatList
                data={popularFoods}
                renderItem={renderFoodItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.resultsList}
                ListEmptyComponent={
                  <Card variant="outlined" style={styles.emptyState}>
                    <Ionicons name="restaurant-outline" size={48} color={colors.neutral[300]} />
                    <Text style={styles.emptyTitle}>No popular foods available</Text>
                    <Text style={styles.emptySubtitle}>
                      Try searching for specific foods to get started
                    </Text>
                  </Card>
                }
              />
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Search Header
  searchHeader: {
    padding: layout.screenPadding,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.surface,
  },

  screenTitle: {
    ...typography.headlineLarge,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },

  screenSubtitle: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },

  searchContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-end',
  },

  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    height: touchTargets.comfortable,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    ...typography.bodyMedium,
    color: colors.text.primary,
  },

  clearButton: {
    padding: spacing.xs,
  },

  searchButton: {
    minWidth: 80,
  },

  // Results
  resultsContainer: {
    flex: 1,
    padding: layout.screenPadding,
  },

  resultsHeader: {
    ...typography.headlineSmall,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },

  resultsList: {
    paddingBottom: spacing.huge,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.huge,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
    marginTop: spacing.xl,
  },

  emptyTitle: {
    ...typography.headlineSmall,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },

  emptySubtitle: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});