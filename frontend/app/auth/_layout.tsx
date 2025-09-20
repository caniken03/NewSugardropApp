import { Stack } from 'expo-router';
import { colors } from '../../src/design-system';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border.light,
          borderBottomWidth: 1,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: '600',
          color: colors.text.primary,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}>
      <Stack.Screen
        name="login"
        options={{
          title: 'Sign In',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: 'Create Account',
          headerShown: false,
        }}
      />
    </Stack>
  );
}