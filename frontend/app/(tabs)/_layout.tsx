import { Stack } from 'expo-router';
import { colors } from '../../src/design-system';

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: 200,
        detachInactiveScreens: false,
        freezeOnBlur: false,
        contentStyle: {
          backgroundColor: '#ffffff',
        },
        cardStyle: {
          backgroundColor: '#ffffff',
        },
        cardOverlayEnabled: false,
        gestureEnabled: false, // Disabled on web to prevent flashing
        gestureDirection: 'horizontal',
      }}>
      <Stack.Screen
        name="home"
        options={{
          title: 'Home',
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen
        name="search"
        options={{
          title: 'Search',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="scanner"
        options={{
          title: 'Scanner',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="aichat"
        options={{
          title: 'AI Coach',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="progress"
        options={{
          title: 'Progress',
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}
