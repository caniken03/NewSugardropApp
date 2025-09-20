import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, layout, touchTargets, borderRadius } from '@/design-system';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Main Content */}
        <View style={styles.mainContent}>
          <Text style={styles.title}>SugarDrop</Text>
          <Text style={styles.tagline}>
            Your journey to sweet freedom.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => router.push('/onboarding')}
            accessibilityRole="button"
            accessibilityLabel="Get started with SugarDrop">
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/auth/login')}
            accessibilityRole="button"
            accessibilityLabel="Sign in to existing account">
            <Text style={styles.signInText}>
              Already have an account? <Text style={styles.signInLink}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  content: {
    flex: 1,
    padding: layout.screenPadding,
    justifyContent: 'space-between',
    paddingBottom: spacing.huge,
  },

  // Main Content
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    letterSpacing: -1,
  },

  tagline: {
    ...typography.headlineMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    fontWeight: '400',
  },

  // Actions
  actions: {
    gap: spacing.lg,
  },

  getStartedButton: {
    backgroundColor: colors.text.primary, // Black button
    borderRadius: borderRadius.pill,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    minHeight: touchTargets.large,
  },

  getStartedText: {
    ...typography.buttonLarge,
    color: colors.surface, // White text on black
    fontWeight: '600',
  },

  signInButton: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },

  signInText: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  signInLink: {
    color: colors.primary[400],
    fontWeight: '600',
  },
});