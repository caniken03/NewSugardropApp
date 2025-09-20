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
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { apiClient } from '../../src/services/api';
import { webSafeShadow } from '../../src/utils/styles';
import LoadingSpinner from '../../src/components/LoadingSpinner';
import ProgressCircle from '../../src/components/ProgressCircle';

interface TodayData {
  entries: any[];
  total_sugar: number;
  daily_goal: number;
  percentage: number;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
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

  const getSugarStatus = () => {
    if (!todayData) return { text: 'No data', color: colors.textSecondary };
    
    const percentage = todayData.percentage;
    if (percentage <= 50) return { text: 'Great job! 🎉', color: colors.success };
    if (percentage <= 80) return { text: 'Doing well 👍', color: colors.warning };
    if (percentage <= 100) return { text: 'Getting close ⚠️', color: colors.warning };
    return { text: 'Over limit 🚨', color: colors.error };
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const sugarStatus = getSugarStatus();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.name}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.profileButton, { backgroundColor: colors.surface }]}
          onPress={() => router.push('/profile')}>
          <Ionicons name="person" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Daily Progress Card */}
      <View style={[styles.progressCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Today's Sugar Intake
        </Text>
        
        <View style={styles.progressContainer}>
          <ProgressCircle
            percentage={todayData?.percentage || 0}
            size={120}
            strokeWidth={8}
            color={colors.primary}
          />
          <View style={styles.progressDetails}>
            <Text style={[styles.sugarAmount, { color: colors.text }]}>
              {todayData?.total_sugar.toFixed(1) || '0.0'}g
            </Text>
            <Text style={[styles.sugarGoal, { color: colors.textSecondary }]}>
              of {todayData?.daily_goal || 50}g daily goal
            </Text>
            <Text style={[styles.statusText, { color: sugarStatus.color }]}>
              {sugarStatus.text}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Quick Actions
        </Text>
        
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface }]}
            onPress={() => router.push('/(modals)/add-entry')}>
            <Ionicons name="add-circle" size={32} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>
              Log Food
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface }]}
            onPress={() => router.push('/(tabs)/scanner')}>
            <Ionicons name="camera" size={32} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>
              Scan Food
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface }]}
            onPress={() => router.push('/(tabs)/chat')}>
            <Ionicons name="chatbubble-ellipses" size={32} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>
              Ask AI Coach
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface }]}
            onPress={() => router.push('/(tabs)/progress')}>
            <Ionicons name="analytics" size={32} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>
              View Progress
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Entries */}
      {todayData?.entries && todayData.entries.length > 0 && (
        <View style={styles.recentEntries}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Today's Foods
          </Text>
          
          {todayData.entries.slice(0, 3).map((entry, index) => (
            <View
              key={entry.id}
              style={[styles.entryItem, { backgroundColor: colors.surface }]}>
              <View style={styles.entryInfo}>
                <Text style={[styles.entryName, { color: colors.text }]}>
                  {entry.name}
                </Text>
                <Text style={[styles.entryDetails, { color: colors.textSecondary }]}>
                  {entry.portion_size}g • {(entry.sugar_content * entry.portion_size).toFixed(1)}g sugar
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          ))}
          
          {todayData.entries.length > 3 && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push('/(tabs)/progress')}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
                View all {todayData.entries.length} entries
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    ...webSafeShadow.medium,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  progressDetails: {
    alignItems: 'center',
  },
  sugarAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sugarGoal: {
    fontSize: 14,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    ...webSafeShadow.small,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  recentEntries: {
    marginBottom: 24,
  },
  entryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    ...webSafeShadow.small,
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  entryDetails: {
    fontSize: 14,
  },
  viewAllButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '500',
  },
});