import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, touchTargets } from '../../src/design-system';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        animation: 'shift',
        tabBarActiveTintColor: colors.primary[400],
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border.light,
          borderTopWidth: 1,
          height: touchTargets.large + spacing.xl + spacing.sm, // 56 + 24 + 8 = 88px
          paddingBottom: spacing.xl, // 24px
          paddingTop: spacing.sm,    // 8px
          paddingHorizontal: spacing.sm, // 8px
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border.light,
          borderBottomWidth: 1,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: colors.text.primary,
        },
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        sceneContainerStyle: {
          backgroundColor: colors.background,
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerTitle: 'SugarDrop',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          headerTitle: 'Food Search',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "search" : "search-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scanner',
          headerTitle: 'Food Scanner',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "camera" : "camera-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="aichat"
        options={{
          title: 'AI Coach',
          headerTitle: 'Nutrition Coach',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          headerTitle: 'Your Progress',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "analytics" : "analytics-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}