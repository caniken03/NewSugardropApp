import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';
import AnimatedNavigationModal from '@/components/AnimatedNavigationModal';

const navigationItems = [
  { key: 'log_food', title: 'Log Food', icon: 'restaurant-outline', route: '/(modals)/add-entry', description: 'Add meal manually' },
  { key: 'scan_food', title: 'Scan Food', icon: 'camera-outline', route: '/(tabs)/scanner', description: 'Camera recognition' },
  { key: 'search_food', title: 'Search Foods', icon: 'search-outline', route: '/(tabs)/search', description: 'Browse database' },
  { key: 'ai_coach', title: 'AI Coach', icon: 'chatbubble-ellipses-outline', route: '/(tabs)/aichat', description: 'Get nutrition advice' },
  { key: 'home', title: 'Home', icon: 'home-outline', route: '/(tabs)/home', description: 'Back to dashboard' }
];

export default function ProgressScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [todayData, setTodayData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showNavigation, setShowNavigation] = useState(false);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/food/entries/today');
      setTodayData(response.data);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigationPress = (route: string) => {
    setShowNavigation(false);
    setTimeout(() => router.push(route), 100);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Loading progress...</Text>
      </View>
    );
  }

  const weeklyData = [
    { day: 'Mon', sugar_points: 45 },
    { day: 'Tue', sugar_points: 52 },
    { day: 'Wed', sugar_points: 38 },
    { day: 'Thu', sugar_points: 61 },
    { day: 'Fri', sugar_points: 43 },
    { day: 'Sat', sugar_points: 67 },
    { day: 'Sun', sugar_points: todayData?.total_sugar_points || 0 },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Progress</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Today's Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today</Text>
          
          <View style={styles.todayCard}>
            <View style={styles.todayStats}>
              <View style={styles.todayStat}>
                <Text style={styles.todayNumber}>{todayData?.total_sugar_points || 0}</Text>
                <Text style={styles.todayLabel}>SugarPoints</Text>
              </View>
              
              <View style={styles.todayStat}>
                <Text style={styles.todayNumber}>{todayData?.entries?.length || 0}</Text>
                <Text style={styles.todayLabel}>Foods</Text>
              </View>
              
              <View style={styles.todayStat}>
                <Text style={styles.todayNumber}>{todayData?.total_sugar_point_blocks || 0}</Text>
                <Text style={styles.todayLabel}>Blocks</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          
          <View style={styles.chartCard}>
            <View style={styles.chart}>
              {weeklyData.map((day, index) => {
                const maxPoints = Math.max(...weeklyData.map(d => d.sugar_points), 80);
                const height = (day.sugar_points / maxPoints) * 100;
                const isToday = index === weeklyData.length - 1;
                
                return (
                  <View key={day.day} style={styles.chartBar}>
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          height: Math.max(height, 4),
                          backgroundColor: isToday ? '#4A90E2' : '#e0e0e0'
                        }
                      ]} 
                    />
                    <Text style={styles.barValue}>{day.sugar_points}</Text>
                    <Text style={[styles.barLabel, isToday && styles.todayBarLabel]}>
                      {day.day}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Recent Foods */}
        {todayData?.entries && todayData.entries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent foods</Text>
            
            {todayData.entries.slice(0, 3).map((entry: any) => (
              <View key={entry.id} style={styles.foodItem}>
                <View style={styles.foodInfo}>
                  <Text style={styles.foodName}>{entry.name}</Text>
                  <Text style={styles.foodDetails}>
                    {entry.portion_size}g • {entry.meal_type || 'snack'}
                  </Text>
                </View>
                <View style={styles.foodSugarPoints}>
                  <Text style={styles.foodPoints}>{entry.sugar_points || 0}</Text>
                  <Text style={styles.foodPointsLabel}>SP</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    fontSize: 16,
    color: '#666666',
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

  scrollView: {
    flex: 1,
  },

  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },

  // Today Card
  todayCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
  },

  todayStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  todayStat: {
    alignItems: 'center',
  },

  todayNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },

  todayLabel: {
    fontSize: 14,
    color: '#666666',
  },

  // Chart
  chartCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
  },

  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },

  chartBar: {
    alignItems: 'center',
    flex: 1,
  },

  bar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
  },

  barValue: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },

  barLabel: {
    fontSize: 12,
    color: '#999999',
  },

  todayBarLabel: {
    color: '#4A90E2',
    fontWeight: '600',
  },

  // Food Items
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  },

  foodSugarPoints: {
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
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