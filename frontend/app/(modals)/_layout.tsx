import { Stack } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function ModalsLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}>
      <Stack.Screen
        name="add-entry"
        options={{
          title: 'Add Food Entry',
        }}
      />
      <Stack.Screen
        name="food-details"
        options={{
          title: 'Food Details',
        }}
      />
    </Stack>
  );
}