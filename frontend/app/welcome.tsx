import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, layout, touchTargets, borderRadius } from '@/design-system';
import { Button, Card } from '@/design-system/components';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="water" size={48} color={colors.primary[400]} />
          </View>
          <Text style={styles.title}>SugarDrop</Text>
          <Text style={styles.subtitle}>
            AI-Powered Nutrition Tracking
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <Card variant="outlined" style={styles.featureCard}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="restaurant-outline" size={24} color={colors.primary[400]} />
              </View>
              <Text style={styles.featureText}>Track SugarPoints & nutrition</Text>
            </View>
          </Card>
          
          <Card variant="outlined" style={styles.featureCard}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="camera-outline" size={24} color={colors.primary[400]} />
              </View>
              <Text style={styles.featureText}>AI-powered food recognition</Text>
            </View>
          </Card>
          
          <Card variant="outlined" style={styles.featureCard}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="chatbubble-ellipses-outline" size={24} color={colors.primary[400]} />
              </View>
              <Text style={styles.featureText}>Personal nutrition coach</Text>
            </View>
          </Card>
          
          <Card variant="outlined" style={styles.featureCard}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="analytics-outline" size={24} color={colors.primary[400]} />
              </View>
              <Text style={styles.featureText}>Progress analytics</Text>
            </View>
          </Card>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Get Started"
            onPress={() => router.push('/onboarding')}
            size="large"
            fullWidth
          />
          
          <Button
            title="I Have an Account"
            variant="outline"
            onPress={() => router.push('/auth/login')}
            size="large"
            fullWidth
          />
        </View>

        {/* Demo Info */}
        <View style={styles.demoInfo}>
          <Text style={styles.demoText}>
            Demo: demo@sugardrop.com / demo123
          </Text>
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
    justifyContent: 'center',
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: spacing.huge,
  },

  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: colors.primary[100],
  },

  title: {
    ...typography.displayLarge,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },

  subtitle: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  // Features
  features: {
    marginBottom: spacing.huge,
  },

  featureCard: {
    marginBottom: spacing.md,
  },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },

  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },

  featureText: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    flex: 1,
  },

  // Actions
  actions: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },

  // Demo Info
  demoInfo: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },

  demoText: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});