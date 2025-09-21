import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { colors, typography, spacing, layout, touchTargets, borderRadius } from '@/design-system';

interface TodayData {
  entries: any[];
  total_sugar_points: number;
  total_sugar_point_blocks: number;
  sugar_points_text: string;
  sugar_point_blocks_text: string;
  total_sugar: number;
  daily_goal: number;
  percentage: number;
}

interface NavigationItem {
  key: string;
  title: string;
  icon: string;
  route: string;
  description: string;
}

const navigationItems: NavigationItem[] = [
  {
    key: 'log_food',
    title: 'Log Food',
    icon: 'restaurant-outline',
    route: '/(modals)/add-entry',
    description: 'Add meal manually'
  },
  {
    key: 'scan_food', 
    title: 'Scan Food',
    icon: 'camera-outline',
    route: '/(tabs)/scanner',
    description: 'Camera recognition'
  },
  {
    key: 'search_food',
    title: 'Search Foods',
    icon: 'search-outline',
    route: '/(tabs)/search',
    description: 'Browse database'
  },
  {
    key: 'ai_coach',
    title: 'AI Coach',
    icon: 'chatbubble-ellipses-outline',
    route: '/(tabs)/aichat',
    description: 'Get nutrition advice'
  },
  {
    key: 'progress',
    title: 'Progress',
    icon: 'analytics-outline',
    route: '/(tabs)/progress',
    description: 'View your stats'
  }
];

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [todayData, setTodayData] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNavigation, setShowNavigation] = useState(false);

  const fetchTodayData = async () => {
    try {
      const response = await apiClient.get('/food/entries/today');
      setTodayData(response.data);
    } catch (error) {
      console.error('Error fetching today data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayData();
  }, []);

  const handleNavigationPress = (route: string) => {
    setShowNavigation(false);
    setTimeout(() => router.push(route), 100);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <LoadingSpinner />
      </View>
    );
  }

  const sugarPoints = todayData?.total_sugar_points || 0;
  const targetSugarPoints = 120; // Default target
  const remainingSugarPoints = Math.max(targetSugarPoints - sugarPoints, 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Good {getTimeOfDay()}</Text>
        <Text style={styles.userName}>{user?.name}</Text>
      </View>

      {/* Main Stats - Large and Minimal */}
      <View style={styles.mainStats}>
        <View style={styles.primaryStat}>
          <Text style={styles.primaryNumber}>{remainingSugarPoints}</Text>
          <Text style={styles.primaryLabel}>SugarPoints left</Text>
        </View>
      </View>

      {/* Secondary Stats - Clean Grid */}
      <View style={styles.secondaryStats}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{sugarPoints}</Text>
          <Text style={styles.statLabel}>SugarPoints used</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{todayData?.entries?.length || 0}</Text>
          <Text style={styles.statLabel}>Foods logged</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{todayData?.total_sugar_point_blocks || 0}</Text>
          <Text style={styles.statLabel}>Blocks used</Text>
        </View>
      </View>

      {/* Recent Activity - Minimal */}
      {todayData?.entries && todayData.entries.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recently logged</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {todayData.entries.slice(0, 3).map((entry, index) => (
              <View key={entry.id} style={styles.recentItem}>
                <View style={styles.recentCircle}>
                  <Text style={styles.recentPoints}>{entry.sugar_points || 0}</Text>
                </View>
                <Text style={styles.recentName}>{entry.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Floating Plus Button */}
      <TouchableOpacity
        style={[styles.floatingButton, { bottom: insets.bottom + 24 }]}
        onPress={() => setShowNavigation(true)}
        accessibilityLabel="Open navigation menu">
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>

      {/* Navigation Modal */}
      <Modal
        visible={showNavigation}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNavigation(false)}>
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowNavigation(false)}>
          <View style={styles.navigationModal}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Quick Actions</Text>
            
            <View style={styles.navigationGrid}>
              {navigationItems.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={styles.navigationItem}
                  onPress={() => handleNavigationPress(item.route)}>
                  <View style={styles.navigationIcon}>
                    <Ionicons name={item.icon as any} size={24} color={colors.primary[400]} />
                  </View>
                  <Text style={styles.navigationTitle}>{item.title}</Text>
                  <Text style={styles.navigationDescription}>{item.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

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

  // Header - Minimal
  header: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  greeting: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },

  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },

  // Main Stats - Large and Clean
  mainStats: {
    paddingHorizontal: 24,
    marginBottom: 48,
  },

  primaryStat: {
    alignItems: 'center',
    marginBottom: 48,
  },

  primaryNumber: {
    fontSize: 72,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },

  primaryLabel: {
    fontSize: 18,
    color: '#666666',
  },

  // Secondary Stats - Clean Grid
  secondaryStats: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 48,
    gap: 24,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },

  // Recent Section - Minimal
  recentSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },

  recentItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },

  recentCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  recentPoints: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },

  recentName: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
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

  // Navigation Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  navigationModal: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    paddingTop: 20,
    paddingHorizontal: 24,
  },

  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 24,
    textAlign: 'center',
  },

  navigationGrid: {
    gap: 16,
  },

  navigationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },

  navigationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  navigationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },

  navigationDescription: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
});