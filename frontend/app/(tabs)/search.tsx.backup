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
import { colors } from '@/design-system/colors';
import { typography } from '@/design-system/typography';
import { spacing, layout, borderRadius, touchTargets } from '@/design-system/spacing';

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
  const [showNavigation, setShowNavigation] = useState(false);

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

  const handleNavigationPress = (route: string) => {
    setShowNavigation(false);
    setTimeout(() => router.push(route), 100);
  };

  const handleFoodSelect = (food: FoodItem) => {
    const sugarPoints = Math.round(food.carbs_per_100g);
    
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
    
    return (
      <TouchableOpacity
        style={styles.foodItem}
        onPress={() => handleFoodSelect(item)}>
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{item.name}</Text>
          <Text style={styles.foodDetails}>
            {sugarPoints} SugarPoints per 100g • {item.category}
          </Text>
          {item.confidence && (
            <Text style={styles.foodConfidence}>
              {Math.round(item.confidence * 100)}% confidence
            </Text>
          )}
        </View>
        <View style={styles.foodSugarPoints}>
          <Text style={styles.foodPoints}>{sugarPoints}</Text>
          <Text style={styles.foodPointsLabel}>SP</Text>
        </View>
      </TouchableOpacity>
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
            <Ionicons name="search-outline" size={20} color="#666666" />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search foods (e.g., apple, chicken, rice)"
              placeholderTextColor="#999999"
              returnKeyType="search"
              onSubmitEditing={searchFoods}
              autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setQuery('');
                  setResults([]);
                }}
                style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#666666" />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.searchButton}
            onPress={searchFoods}
            disabled={!query.trim() || loading}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
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
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#cccccc" />
            <Text style={styles.emptyTitle}>No foods found</Text>
            <Text style={styles.emptySubtitle}>
              Try searching for "{query}" with different keywords
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultsHeader}>
              {loadingPopular ? 'Loading...' : 'Popular Foods'}
            </Text>
            {loadingPopular ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A90E2" />
              </View>
            ) : (
              <FlatList
                data={popularFoods}
                renderItem={renderFoodItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.resultsList}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Ionicons name="restaurant-outline" size={48} color="#cccccc" />
                    <Text style={styles.emptyTitle}>No popular foods available</Text>
                    <Text style={styles.emptySubtitle}>
                      Try searching for specific foods to get started
                    </Text>
                  </View>
                }
              />
            )}
          </>
        )}
      </View>

      {/* Floating Plus Button */}
      <TouchableOpacity
        style={[styles.floatingButton, { bottom: insets.bottom + 24 }]}
        onPress={() => setShowNavigation(true)}>
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>

      {/* Navigation Modal */}
      <AnimatedNavigationModal
        visible={showNavigation}
        onClose={() => setShowNavigation(false)}
        onNavigate={handleNavigationPress}
        items={navigationItems}
      />
    </View>
    </View>
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  // Search Header
  searchHeader: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },

  screenTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },

  screenSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
  },

  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
  },

  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#000000',
  },

  clearButton: {
    padding: 4,
  },

  searchButton: {
    minWidth: 80,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },

  searchButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Results
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },

  resultsHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },

  resultsList: {
    paddingBottom: 100,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 48,
  },

  // Food Items
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 8,
  },

  foodInfo: {
    flex: 1,
  },

  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },

  foodDetails: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },

  foodConfidence: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
  },

  foodSugarPoints: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 8,
    minWidth: 48,
  },

  foodPoints: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },

  foodPointsLabel: {
    fontSize: 10,
    color: '#666666',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 32,
    marginTop: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },

  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Floating Button
  floatingButton: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});