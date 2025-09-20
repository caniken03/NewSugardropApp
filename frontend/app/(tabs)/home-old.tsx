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

  const getSugarPointsStatus = () => {
    if (!todayData) return { text: 'No data', color: colors.textSecondary };
    
    const sugarPoints = todayData.total_sugar_points || 0;
    if (sugarPoints === 0) return { text: 'Perfect start! 🎉', color: '#10B981' };
    if (sugarPoints <= 30) return { text: 'Great control! 🎯', color: '#10B981' };
    if (sugarPoints <= 60) return { text: 'Doing well 👍', color: '#FDE68A' };
    if (sugarPoints <= 100) return { text: 'Watch your intake ⚠️', color: '#FDE68A' };
    return { text: 'High intake today 🚨', color: '#FCA5A5' };
  };

  const getSugarPointsCircleProgress = () => {
    if (!todayData) return 0;
    const sugarPoints = todayData.total_sugar_points || 0;
    // Use 120 as a reasonable daily target for SugarPoints (equivalent to ~120g carbs)
    const targetSugarPoints = 120;
    return Math.min((sugarPoints / targetSugarPoints) * 100, 100);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const sugarPointsStatus = getSugarPointsStatus();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: '#0c0c0c' }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: '#9CA3AF' }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.userName, { color: '#fff' }]}>
            {user?.name}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.profileButton, { backgroundColor: '#111827' }]}
          onPress={() => router.push('/profile')}>
          <Ionicons name="person" size={24} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Daily Progress Card */}
      <View style={[styles.progressCard, { backgroundColor: '#111827' }]}>
        <Text style={[styles.cardTitle, { color: '#fff' }]}>
          Today's SugarPoints Intake
        </Text>
        
        <View style={styles.progressContainer}>
          <ProgressCircle
            percentage={getSugarPointsCircleProgress()}
            size={120}
            strokeWidth={8}
            color="#2563EB"
          />
          <View style={styles.progressDetails}>
            <Text style={[styles.sugarPointsAmount, { color: '#fff' }]}>
              {todayData?.total_sugar_points || 0}
            </Text>
            <Text style={[styles.sugarPointsLabel, { color: '#2563EB' }]}>
              SugarPoints
            </Text>
            <Text style={[styles.sugarPointsBlocks, { color: '#E5E7EB' }]}>
              {todayData?.sugar_point_blocks_text || '0 Blocks'}
            </Text>
            <Text style={[styles.statusText, { color: sugarPointsStatus.color }]}>
              {sugarPointsStatus.text}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={[styles.sectionTitle, { color: '#fff' }]}>
          Quick Actions
        </Text>
        
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#111827', borderColor: '#374151', borderWidth: 1 }]}
            onPress={() => router.push('/(modals)/add-entry')}>
            <Ionicons name="add-circle" size={32} color="#2563EB" />
            <Text style={[styles.actionText, { color: '#fff' }]}>
              Log Food
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#111827', borderColor: '#374151', borderWidth: 1 }]}
            onPress={() => router.push('/(tabs)/scanner')}>
            <Ionicons name="camera" size={32} color="#2563EB" />
            <Text style={[styles.actionText, { color: '#fff' }]}>
              Scan Food
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#111827', borderColor: '#374151', borderWidth: 1 }]}
            onPress={() => router.push('/(tabs)/aichat')}>
            <Ionicons name="chatbubble-ellipses" size={32} color="#2563EB" />
            <Text style={[styles.actionText, { color: '#fff' }]}>
              Ask AI Coach
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#111827', borderColor: '#374151', borderWidth: 1 }]}
            onPress={() => router.push('/(tabs)/progress')}>
            <Ionicons name="analytics" size={32} color="#2563EB" />
            <Text style={[styles.actionText, { color: '#fff' }]}>
              View Progress
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Entries */}
      {todayData?.entries && todayData.entries.length > 0 && (
        <View style={styles.recentEntries}>
          <Text style={[styles.sectionTitle, { color: '#fff' }]}>
            Today's Foods
          </Text>
          
          {todayData.entries.slice(0, 3).map((entry, index) => (
            <View
              key={entry.id}
              style={[styles.entryItem, { backgroundColor: '#1f2937', borderColor: '#374151', borderWidth: 1 }]}>
              <View style={styles.entryInfo}>
                <Text style={[styles.entryName, { color: '#fff' }]}>
                  {entry.name}
                </Text>
                <Text style={[styles.entryDetails, { color: '#E5E7EB' }]}>
                  {entry.portion_size}g • {entry.sugar_points || 0} SugarPoints
                  {entry.fat_per_100g > 0 && ` • Fat: ${(entry.fat_per_100g * entry.portion_size / 100).toFixed(1)}g`}
                  {entry.protein_per_100g > 0 && ` • Protein: ${(entry.protein_per_100g * entry.portion_size / 100).toFixed(1)}g`}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          ))}
          
          {todayData.entries.length > 3 && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push('/(tabs)/progress')}>
              <Text style={[styles.viewAllText, { color: '#2563EB' }]}>
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
    padding: 16, // Following 8pt grid system
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
    fontWeight: '400',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#374151',
    borderWidth: 1,
  },
  progressCard: {
    borderRadius: 10,
    padding: 24,
    marginBottom: 24,
    borderColor: '#374151',
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
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
  sugarPointsAmount: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  sugarPointsLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  sugarPointsBlocks: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    width: '48%',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '400',
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
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  entryDetails: {
    fontSize: 12,
    fontWeight: '400',
  },
  viewAllButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '700',
  },
});