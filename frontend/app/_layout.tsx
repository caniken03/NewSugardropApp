import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/contexts/AuthContext';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import HealthDisclaimerPopup from '../src/components/HealthDisclaimerPopup';
import { colors } from '../src/design-system';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <StatusBar style="dark" backgroundColor={colors.background} />
          <Slot />
          <HealthDisclaimerPopup />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}