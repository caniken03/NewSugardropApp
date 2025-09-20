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
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { apiClient } from '../../src/services/api';
import { webSafeShadow } from '../../src/utils/styles';
import AuthGuard from '../../src/components/AuthGuard';
import LoadingSpinner from '../../src/components/LoadingSpinner';
import ProgressCircle from '../../src/components/ProgressCircle';

interface FoodEntry {
  id: string;
  name: string;
  sugar_content: number;
  portion_size: number;
  calories?: number;
  timestamp: string;
}

interface DayData {
  date: string;
  entries: FoodEntry[];
  totalSugar: number;
  totalCalories: number;
}

export default function ProgressScreen() {
  return (
    <AuthGuard>
      <ProgressContent />
    </AuthGuard>
  );
}

function ProgressContent() {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await apiClient.get('/food/entries');
      setEntries(response.data);
    } catch (error) {
      console.error('Error fetching entries:', error);
      Alert.alert('Error', 'Failed to load progress data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEntries();
  };

  const getWeeklyData = (): DayData[] => {
    const now = new Date();
    const weekData: DayData[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEntries = entries.filter(entry => 
        entry.timestamp.startsWith(dateStr)
      );
      
      const totalSugar = dayEntries.reduce((sum, entry) => 
        sum + (entry.sugar_content * entry.portion_size), 0
      );
      
      const totalCalories = dayEntries.reduce((sum, entry) => 
        sum + ((entry.calories || 0) * entry.portion_size), 0
      );
      
      weekData.push({
        date: dateStr,
        entries: dayEntries,
        totalSugar,
        totalCalories,
      });
    }
    
    return weekData;
  };

  const getWeeklyAverage = () => {
    const weekData = getWeeklyData();
    const totalSugar = weekData.reduce((sum, day) => sum + day.totalSugar, 0);
    return totalSugar / 7;
  };

  const getTodayProgress = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = entries.filter(entry => entry.timestamp.startsWith(today));
    const totalSugar = todayEntries.reduce((sum, entry) => 
      sum + (entry.sugar_content * entry.portion_size), 0
    );
    const dailyGoal = user?.daily_sugar_goal || 50;
    const percentage = (totalSugar / dailyGoal) * 100;
    
    return { totalSugar, dailyGoal, percentage };
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  const getStreakDays = () => {
    const weekData = getWeeklyData();
    let streak = 0;
    const dailyGoal = user?.daily_sugar_goal || 50;
    
    for (let i = weekData.length - 1; i >= 0; i--) {
      if (weekData[i].totalSugar <= dailyGoal) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const todayProgress = getTodayProgress();
  const weeklyAverage = getWeeklyAverage();
  const weekData = getWeeklyData();
  const streakDays = getStreakDays();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      
      {/* Today's Progress */}
      <View style={[styles.todayCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Today's Progress
        </Text>
        
        <View style={styles.progressContainer}>
          <ProgressCircle
            percentage={Math.min(todayProgress.percentage, 100)}
            size={100}
            strokeWidth={8}
            color={todayProgress.percentage > 100 ? colors.error : colors.primary}
          />
          <View style={styles.progressDetails}>
            <Text style={[styles.progressValue, { color: colors.text }]}>
              {todayProgress.totalSugar.toFixed(1)}g
            </Text>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
              of {todayProgress.dailyGoal}g goal
            </Text>
            <Text
              style={[
                styles.progressStatus,
                {
                  color: todayProgress.percentage > 100 ? colors.error : colors.success,
                },
              ]}>
              {todayProgress.percentage > 100 ? 'Over Goal' : 'On Track'}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Ionicons name="trending-down" size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {weeklyAverage.toFixed(1)}g
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Weekly Avg
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Ionicons name="flame" size={24} color={colors.warning} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {streakDays}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Day Streak
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Ionicons name="restaurant" size={24} color={colors.success} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {entries.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Total Entries
          </Text>
        </View>
      </View>

      {/* Weekly Chart */}
      <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          7-Day Summary
        </Text>
        
        <View style={styles.chartContainer}>
          {weekData.map((day, index) => {
            const percentage = (day.totalSugar / (user?.daily_sugar_goal || 50)) * 100;
            const height = Math.min(Math.max(percentage, 5), 100);
            
            return (
              <View key={index} style={styles.chartBar}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${height}%`,
                      backgroundColor: percentage > 100 ? colors.error : colors.primary,
                    },
                  ]}
                />
                <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>
                  {formatDate(day.date).slice(0, 3)}
                </Text>
                <Text style={[styles.chartValue, { color: colors.text }]}>
                  {day.totalSugar.toFixed(0)}g
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Recent Entries */}
      <View style={[styles.entriesCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Recent Entries
        </Text>
        
        {entries.slice(0, 5).map((entry) => {
          const totalSugar = entry.sugar_content * entry.portion_size;
          
          return (
            <View key={entry.id} style={styles.entryItem}>
              <View style={styles.entryInfo}>
                <Text style={[styles.entryName, { color: colors.text }]}>
                  {entry.name}
                </Text>
                <Text style={[styles.entryDetails, { color: colors.textSecondary }]}>
                  {new Date(entry.timestamp).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <View style={styles.entryNutrition}>
                <Text style={[styles.entrySugar, { color: colors.primary }]}>
                  {totalSugar.toFixed(1)}g
                </Text>
                <Text style={[styles.entryPortion, { color: colors.textSecondary }]}>
                  {entry.portion_size}g
                </Text>
              </View>
            </View>
          );
        })}

        {entries.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No Entries Yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Start logging your food to see progress
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  todayCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...webSafeShadow.medium,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  progressDetails: {
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressLabel: {
    fontSize: 14,
    marginVertical: 4,
  },
  progressStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...webSafeShadow.small,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  chartCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...webSafeShadow.medium,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  bar: {
    width: '80%',
    borderRadius: 4,
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  chartValue: {
    fontSize: 10,
    fontWeight: '600',
  },
  entriesCard: {
    borderRadius: 16,
    padding: 20,
    ...webSafeShadow.medium,
  },
    shadowRadius: 4,
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  entryDetails: {
    fontSize: 12,
  },
  entryNutrition: {
    alignItems: 'flex-end',
  },
  entrySugar: {
    fontSize: 14,
    fontWeight: '600',
  },
  entryPortion: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});