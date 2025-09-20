import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';
import { colors, typography, spacing, layout, touchTargets, borderRadius } from '@/design-system';
import { Card, Button, FoodEntryCard, ProgressRing } from '@/design-system/components';

const { width: screenWidth } = Dimensions.get('window');

interface WeeklyData {
  day: string;
  sugar_points: number;
  blocks: number;
  foods_count: number;
}

interface ProgressStats {
  total_entries: number;
  avg_daily_sugar_points: number;
  best_day_sugar_points: number;
  weekly_trend: 'up' | 'down' | 'stable';
  favorite_meal_type: string;
  top_foods: any[];
}

export default function ProgressScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [activeTab, setActiveTab] = useState<'week' | 'month'>('week');
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [todayData, setTodayData] = useState<any>(null);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, [activeTab]);

  const fetchProgressData = async () => {
    setLoading(true);
    try {
      // Fetch today's data
      const todayResponse = await apiClient.get('/food/entries/today');
      setTodayData(todayResponse.data);
      
      // Mock weekly data (in real app, this would come from API)
      const mockWeeklyData: WeeklyData[] = [
        { day: 'Mon', sugar_points: 45, blocks: 8, foods_count: 5 },
        { day: 'Tue', sugar_points: 52, blocks: 9, foods_count: 6 },
        { day: 'Wed', sugar_points: 38, blocks: 6, foods_count: 4 },
        { day: 'Thu', sugar_points: 61, blocks: 10, foods_count: 7 },
        { day: 'Fri', sugar_points: 43, blocks: 7, foods_count: 5 },
        { day: 'Sat', sugar_points: 67, blocks: 11, foods_count: 8 },
        { day: 'Sun', sugar_points: todayData?.total_sugar_points || 0, blocks: todayData?.total_sugar_point_blocks || 0, foods_count: todayData?.entries?.length || 0 },
      ];
      
      setWeeklyData(mockWeeklyData);
      
      // Mock stats
      const avgSugarPoints = mockWeeklyData.reduce((sum, day) => sum + day.sugar_points, 0) / 7;
      setStats({
        total_entries: 35,
        avg_daily_sugar_points: Math.round(avgSugarPoints),
        best_day_sugar_points: Math.min(...mockWeeklyData.map(d => d.sugar_points)),
        weekly_trend: avgSugarPoints > 50 ? 'up' : 'down',
        favorite_meal_type: 'Lunch',
        top_foods: todayData?.entries?.slice(0, 3) || [],
      });
      
    } catch (error) {
      console.error('Error fetching progress data:', error);
      Alert.alert('Error', 'Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const renderWeeklyChart = () => {
    const maxSugarPoints = Math.max(...weeklyData.map(d => d.sugar_points), 100);
    
    return (
      <Card variant="elevated" style={styles.chartCard}>
        <Text style={styles.chartTitle}>Weekly SugarPoints</Text>
        
        <View style={styles.chart}>
          {weeklyData.map((day, index) => {
            const height = (day.sugar_points / maxSugarPoints) * 120;
            const isToday = index === weeklyData.length - 1;
            
            return (
              <View key={day.day} style={styles.chartBar}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: Math.max(height, 4),
                      backgroundColor: isToday ? colors.primary[400] : colors.primary[200]
                    }
                  ]} 
                />
                <Text style={styles.barValue}>{day.sugar_points}</Text>
                <Text style={[styles.barLabel, isToday && styles.todayLabel]}>
                  {day.day}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>
    );
  };

  const renderStatsGrid = () => (
    <View style={styles.statsGrid}>
      <Card variant="outlined" style={styles.statCard}>
        <Text style={styles.statValue}>{stats?.avg_daily_sugar_points || 0}</Text>
        <Text style={styles.statLabel}>Avg Daily SugarPoints</Text>
        <View style={styles.statIcon}>
          <Ionicons name="trending-down-outline" size={16} color={colors.success[400]} />
        </View>
      </Card>
      
      <Card variant="outlined" style={styles.statCard}>
        <Text style={styles.statValue}>{stats?.best_day_sugar_points || 0}</Text>
        <Text style={styles.statLabel}>Best Day</Text>
        <View style={styles.statIcon}>
          <Ionicons name="trophy-outline" size={16} color={colors.warning[400]} />
        </View>
      </Card>
      
      <Card variant="outlined" style={styles.statCard}>
        <Text style={styles.statValue}>{stats?.total_entries || 0}</Text>
        <Text style={styles.statLabel}>Total Foods</Text>
        <View style={styles.statIcon}>
          <Ionicons name="restaurant-outline" size={16} color={colors.primary[400]} />
        </View>
      </Card>
      
      <Card variant="outlined" style={styles.statCard}>
        <Text style={styles.statValue}>{stats?.favorite_meal_type || 'N/A'}</Text>
        <Text style={styles.statLabel}>Top Meal</Text>
        <View style={styles.statIcon}>
          <Ionicons name="time-outline" size={16} color={colors.neutral[400]} />
        </View>
      </Card>
    </View>
  );

  const getTrendIcon = () => {
    switch (stats?.weekly_trend) {
      case 'up': return { name: 'trending-up', color: colors.error[400] };
      case 'down': return { name: 'trending-down', color: colors.success[400] };
      default: return { name: 'remove', color: colors.neutral[400] };
    }
  };

  const getTrendMessage = () => {
    switch (stats?.weekly_trend) {
      case 'up': return 'SugarPoints trending higher this week. Consider reducing portions.';
      case 'down': return 'Great job! SugarPoints trending lower this week.';
      default: return 'SugarPoints intake has been stable this week.';
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ProgressRing progress={50} size={60} />
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  const trendIcon = getTrendIcon();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>Track your SugarPoints journey</Text>
        </View>

        {/* Period Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'week' && styles.activeTab]}
            onPress={() => setActiveTab('week')}>
            <Text style={[styles.tabText, activeTab === 'week' && styles.activeTabText]}>
              This Week
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'month' && styles.activeTab]}
            onPress={() => setActiveTab('month')}>
            <Text style={[styles.tabText, activeTab === 'month' && styles.activeTabText]}>
              This Month
            </Text>
          </TouchableOpacity>
        </View>

        {/* Today's Summary */}
        <Card variant="elevated" style={styles.todayCard}>
          <View style={styles.todayHeader}>
            <Text style={styles.todayTitle}>Today's Summary</Text>
            <ProgressRing
              progress={Math.min((todayData?.total_sugar_points || 0) / 120 * 100, 100)}
              size={60}
              strokeWidth={6}>
              <Text style={styles.todayRingText}>
                {todayData?.total_sugar_points || 0}
              </Text>
            </ProgressRing>
          </View>
          
          <View style={styles.todayStats}>
            <View style={styles.todayStat}>
              <Text style={styles.todayStatValue}>{todayData?.total_sugar_points || 0}</Text>
              <Text style={styles.todayStatLabel}>SugarPoints</Text>
            </View>
            <View style={styles.todayStat}>
              <Text style={styles.todayStatValue}>{todayData?.total_sugar_point_blocks || 0}</Text>
              <Text style={styles.todayStatLabel}>Blocks</Text>
            </View>
            <View style={styles.todayStat}>
              <Text style={styles.todayStatValue}>{todayData?.entries?.length || 0}</Text>
              <Text style={styles.todayStatLabel}>Foods</Text>
            </View>
          </View>
        </Card>

        {/* Weekly Chart */}
        {renderWeeklyChart()}

        {/* Stats Grid */}
        {renderStatsGrid()}

        {/* Insights */}
        <Card variant="outlined" style={styles.insightsCard}>
          <View style={styles.insightsHeader}>
            <Ionicons name={trendIcon.name as any} size={24} color={trendIcon.color} />
            <Text style={styles.insightsTitle}>Weekly Insights</Text>
          </View>
          <Text style={styles.insightsText}>
            {getTrendMessage()}
          </Text>
        </Card>

        {/* Recent Foods */}
        {stats?.top_foods && stats.top_foods.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent Foods</Text>
            {stats.top_foods.map((entry) => (
              <FoodEntryCard
                key={entry.id}
                food={{
                  id: entry.id,
                  name: entry.name,
                  sugar_points: entry.sugar_points || 0,
                  sugar_point_blocks: entry.sugar_point_blocks || 0,
                  carbs_per_100g: entry.carbs_per_100g || 0,
                  fat_per_100g: entry.fat_per_100g || 0,
                  protein_per_100g: entry.protein_per_100g || 0,
                  portion_size: entry.portion_size,
                  meal_type: entry.meal_type,
                }}
                showDetails={false}
              />
            ))}
          </View>
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

  loadingText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    marginTop: spacing.lg,
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
    marginBottom: spacing.xl,
  },

  title: {
    ...typography.headlineLarge,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },

  subtitle: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
  },

  // Period Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    marginBottom: spacing.xl,
  },

  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },

  activeTab: {
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  tabText: {
    ...typography.labelLarge,
    color: colors.text.tertiary,
  },

  activeTabText: {
    color: colors.text.primary,
    fontWeight: '600',
  },

  // Today Card
  todayCard: {
    marginBottom: spacing.xl,
  },

  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  todayTitle: {
    ...typography.headlineSmall,
    color: colors.text.primary,
  },

  todayRingText: {
    ...typography.titleMedium,
    color: colors.primary[400],
    fontWeight: '700',
  },

  todayStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  todayStat: {
    alignItems: 'center',
  },

  todayStatValue: {
    ...typography.titleLarge,
    color: colors.text.primary,
    fontWeight: '700',
  },

  todayStatLabel: {
    ...typography.labelMedium,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Chart
  chartCard: {
    marginBottom: spacing.xl,
  },

  chartTitle: {
    ...typography.headlineSmall,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },

  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
    paddingHorizontal: spacing.sm,
  },

  chartBar: {
    alignItems: 'center',
    flex: 1,
  },

  bar: {
    width: 24,
    backgroundColor: colors.primary[200],
    borderRadius: 2,
    marginBottom: spacing.sm,
  },

  barValue: {
    ...typography.labelSmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },

  barLabel: {
    ...typography.labelSmall,
    color: colors.text.tertiary,
  },

  todayLabel: {
    color: colors.primary[400],
    fontWeight: '600',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },

  statCard: {
    flex: 1,
    minWidth: '47%',
    alignItems: 'center',
    padding: spacing.lg,
    position: 'relative',
  },

  statValue: {
    ...typography.headlineSmall,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },

  statLabel: {
    ...typography.labelMedium,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  statIcon: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },

  // Insights
  insightsCard: {
    marginBottom: spacing.xl,
  },

  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  insightsTitle: {
    ...typography.headlineSmall,
    color: colors.text.primary,
    marginLeft: spacing.md,
  },

  insightsText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    lineHeight: 22,
  },

  // Recent Section
  recentSection: {
    marginBottom: spacing.xl,
  },

  sectionTitle: {
    ...typography.headlineSmall,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
});