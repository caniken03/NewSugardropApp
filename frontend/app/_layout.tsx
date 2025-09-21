import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { AuthProvider } from '../src/contexts/AuthContext';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { colors } from '../src/design-system';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          {/* Persistent Root Canvas - Never Unmounts */}
          <View style={styles.persistentBackground} pointerEvents="none" />
          
          <View style={styles.appContainer}>
            <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} />
            <Slot />
          </View>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  persistentBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    zIndex: -1,
  },
  
  appContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});