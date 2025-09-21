import { Stack } from 'expo-router';
import { colors } from '../../src/design-system';

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: '#ffffff',
        },
      }}>
      <Stack.Screen
        name="home"
        options={{
          title: 'Home',
        }}
      />
      <Stack.Screen
        name="search"
        options={{
          title: 'Search',
        }}
      />
      <Stack.Screen
        name="scanner"
        options={{
          title: 'Scanner',
        }}
      />
      <Stack.Screen
        name="aichat"
        options={{
          title: 'AI Coach',
        }}
      />
      <Stack.Screen
        name="progress"
        options={{
          title: 'Progress',
        }}
      />
    </Stack>
  );
}
