import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { colors, typography, spacing, layout, touchTargets, borderRadius } from '@/design-system';
import { ProgressRing, Card, Button } from '@/design-system/components';

interface TodayData {
  entries: any[];
  // SugarPoints system fields
  total_sugar_points: number;
  total_sugar_point_blocks: number;
  sugar_points_text: string;
  sugar_point_blocks_text: string;
  // Legacy fields for backward compatibility
  total_sugar: number;
  daily_goal: number;
  percentage: number;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [todayData, setTodayData] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTodayData = async () => {
    try {
      const response = await apiClient.get('/food/entries/today');
      setTodayData(response.data);
    } catch (error) {
      console.error('Error fetching today data:', error);
      Alert.alert('Error', 'Failed to load daily data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTodayData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTodayData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getSugarPointsStatus = () => {
    if (!todayData) return { text: 'No data yet', color: colors.text.secondary };
    
    const sugarPoints = todayData.total_sugar_points || 0;
    if (sugarPoints === 0) return { text: 'Perfect start! 🎯', color: colors.success[400] };
    if (sugarPoints <= 30) return { text: 'Excellent control! 💚', color: colors.success[400] };
    if (sugarPoints <= 60) return { text: 'Doing great! 👍', color: colors.tracker.good };
    if (sugarPoints <= 100) return { text: 'Watch your intake ⚠️', color: colors.warning[400] };
    return { text: 'High intake today', color: colors.error[400] };
  };

  const getSugarPointsProgress = () => {
    if (!todayData) return 0;
    const sugarPoints = todayData.total_sugar_points || 0;
    // Use 120 as reasonable daily target for SugarPoints
    const targetSugarPoints = 120;
    return Math.min((sugarPoints / targetSugarPoints) * 100, 100);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <LoadingSpinner />
      </View>
    );
  }

  const sugarPointsStatus = getSugarPointsStatus();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>
              {getGreeting()}
            </Text>
            <Text style={styles.userName}>
              {user?.name}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
            accessibilityLabel="Open profile"
            accessibilityRole="button">
            <Ionicons name="person-outline" size={24} color={colors.primary[400]} />
          </TouchableOpacity>
        </View>

        {/* SugarPoints Tracker Card */}
        <Card variant="elevated" style={styles.trackerCard}>
          <Text style={styles.trackerTitle}>Today's SugarPoints</Text>
          
          <View style={styles.trackerContainer}>
            <ProgressRing
              progress={getSugarPointsProgress()}
              size={120}
              strokeWidth={8}>
              <View style={styles.trackerCenter}>
                <Text style={styles.sugarPointsNumber}>
                  {todayData?.total_sugar_points || 0}
                </Text>
                <Text style={styles.sugarPointsLabel}>SugarPoints</Text>
              </View>
            </ProgressRing>
            
            <View style={styles.trackerDetails}>
              <Text style={styles.blocksText}>
                {todayData?.sugar_point_blocks_text || '0 Blocks'}
              </Text>
              <Text style={[styles.statusText, { color: sugarPointsStatus.color }]}>
                {sugarPointsStatus.text}
              </Text>
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/(modals)/add-entry')}
              accessibilityRole="button"
              accessibilityLabel="Log food manually">
              <View style={styles.actionIcon}>
                <Ionicons name="restaurant-outline" size={24} color={colors.primary[400]} />
              </View>
              <Text style={styles.actionText}>Log Food</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/(tabs)/scanner')}
              accessibilityRole="button"
              accessibilityLabel="Scan food with camera">
              <View style={styles.actionIcon}>
                <Ionicons name="camera-outline" size={24} color={colors.primary[400]} />
              </View>
              <Text style={styles.actionText}>Scan Food</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/(tabs)/search')}
              accessibilityRole="button"
              accessibilityLabel="Search food database">
              <View style={styles.actionIcon}>
                <Ionicons name="search-outline" size={24} color={colors.primary[400]} />
              </View>
              <Text style={styles.actionText}>Search</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/(tabs)/aichat')}
              accessibilityRole="button"
              accessibilityLabel="Ask AI nutrition coach">
              <View style={styles.actionIcon}>
                <Ionicons name="chatbubble-ellipses-outline" size={24} color={colors.primary[400]} />
              </View>
              <Text style={styles.actionText}>AI Coach</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Entries */}
        {todayData?.entries && todayData.entries.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Today's Foods</Text>
            
            {todayData.entries.slice(0, 3).map((entry) => (
              <Card key={entry.id} variant="outlined" style={styles.foodEntryCard}>
                <View style={styles.entryContent}>
                  <View style={styles.entryInfo}>
                    <Text style={styles.entryName}>{entry.name}</Text>
                    <Text style={styles.entryNutrition}>
                      {entry.portion_size}g • {entry.sugar_points || 0} SugarPoints
                      {entry.fat_per_100g > 0 && ` • Fat: ${(entry.fat_per_100g * entry.portion_size / 100).toFixed(1)}g`}
                      {entry.protein_per_100g > 0 && ` • Protein: ${(entry.protein_per_100g * entry.portion_size / 100).toFixed(1)}g`}
                    </Text>
                    <Text style={styles.entryMeal}>
                      {entry.meal_type?.charAt(0).toUpperCase() + entry.meal_type?.slice(1) || 'Snack'}
                    </Text>
                  </View>
                  <View style={styles.entrySugarPoints}>
                    <Text style={styles.sugarPointsBadge}>
                      {entry.sugar_points || 0}
                    </Text>
                    <Text style={styles.sugarPointsBadgeLabel}>SP</Text>
                  </View>
                </View>
              </Card>
            ))}
            
            {todayData.entries.length > 3 && (
              <Button
                title={`View all ${todayData.entries.length} entries`}
                variant="ghost"
                onPress={() => router.push('/(tabs)/progress')}
                style={styles.viewAllButton}
              />
            )}
          </View>
        )}

        {/* Empty State */}
        {(!todayData?.entries || todayData.entries.length === 0) && (
          <Card variant="outlined" style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={48} color={colors.neutral[300]} />
            <Text style={styles.emptyStateTitle}>No foods logged today</Text>
            <Text style={styles.emptyStateSubtitle}>
              Start tracking your nutrition by logging your first meal
            </Text>
            <Button
              title="Log Your First Food"
              onPress={() => router.push('/(modals)/add-entry')}
              style={styles.emptyStateButton}
            />
          </Card>
        )}
      </ScrollView>
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

  scrollView: {
    flex: 1,
  },

  content: {
    padding: layout.screenPadding,
    paddingBottom: spacing.huge,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: layout.sectionGap,
  },

  headerText: {
    flex: 1,
  },

  greeting: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },

  userName: {
    ...typography.headlineMedium,
    color: colors.text.primary,
  },

  profileButton: {
    width: touchTargets.minimum,
    height: touchTargets.minimum,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },

  // Tracker Card
  trackerCard: {
    marginBottom: layout.sectionGap,
    alignItems: 'center',
  },

  trackerTitle: {
    ...typography.headlineSmall,
    color: colors.text.primary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },

  trackerContainer: {
    alignItems: 'center',
  },

  trackerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  sugarPointsNumber: {
    ...typography.displayMedium,
    color: colors.primary[400],
    fontWeight: '700',
  },

  sugarPointsLabel: {
    ...typography.labelMedium,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  trackerDetails: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },

  blocksText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },

  statusText: {
    ...typography.titleMedium,
    fontWeight: '600',
  },

  // Quick Actions
  quickActions: {
    marginBottom: layout.sectionGap,
  },

  sectionTitle: {
    ...typography.headlineSmall,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },

  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },

  actionItem: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    minHeight: touchTargets.large + spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },

  actionText: {
    ...typography.labelLarge,
    color: colors.text.primary,
    textAlign: 'center',
  },

  // Recent Entries
  recentSection: {
    marginBottom: layout.sectionGap,
  },

  foodEntryCard: {
    marginBottom: spacing.md,
  },

  entryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  entryInfo: {
    flex: 1,
    marginRight: spacing.md,
  },

  entryName: {
    ...typography.titleLarge,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },

  entryNutrition: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },

  entryMeal: {
    ...typography.labelSmall,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  entrySugarPoints: {
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    minWidth: 48,
  },

  sugarPointsBadge: {
    ...typography.titleLarge,
    color: colors.primary[400],
    fontWeight: '700',
  },

  sugarPointsBadgeLabel: {
    ...typography.labelSmall,
    color: colors.primary[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  viewAllButton: {
    marginTop: spacing.md,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
  },

  emptyStateTitle: {
    ...typography.headlineSmall,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  emptyStateSubtitle: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },

  emptyStateButton: {
    marginTop: spacing.md,
  },
});