import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, layout, borderRadius } from '@/design-system';
import { Card } from '@/design-system/components';

export default function HealthNoticeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="information-circle" size={48} color={colors.primary[400]} />
          </View>
          <Text style={styles.title}>Health Notice</Text>
        </View>

        {/* Main Content Card */}
        <Card variant="elevated" style={styles.noticeCard}>
          <Text style={styles.subtitle}>
            This app is for information and healthy lifestyle support only.
          </Text>
          
          <Text style={styles.contentText}>
            Following a SugarDrop diet in the SugarDrop app can help improve your{' '}
            <Text style={styles.highlight}>blood sugar</Text> and{' '}
            <Text style={styles.highlight}>blood pressure</Text>. As these levels improve, 
            your need for medication can also change.
          </Text>
          
          <View style={styles.recommendationSection}>
            <Text style={styles.recommendationText}>
              👉 We recommend that you monitor your blood glucose and blood pressure 
              regularly and <Text style={styles.highlight}>consult your doctor</Text>{' '}
              to adjust medication safely if needed.
            </Text>
          </View>
          
          <Text style={styles.disclaimer}>
            This app does not replace medical advice.
          </Text>
        </Card>

        {/* Additional Safety Information */}
        <Card variant="outlined" style={styles.safetyCard}>
          <Text style={styles.safetyTitle}>Safety Guidelines</Text>
          
          <View style={styles.safetyList}>
            <View style={styles.safetyItem}>
              <Ionicons name="medical" size={20} color={colors.primary[400]} />
              <Text style={styles.safetyText}>
                Monitor blood glucose and blood pressure regularly
              </Text>
            </View>
            
            <View style={styles.safetyItem}>
              <Ionicons name="people" size={20} color={colors.primary[400]} />
              <Text style={styles.safetyText}>
                Consult your healthcare provider before making dietary changes
              </Text>
            </View>
            
            <View style={styles.safetyItem}>
              <Ionicons name="warning" size={20} color={colors.warning[400]} />
              <Text style={styles.safetyText}>
                Do not adjust medication without medical supervision
              </Text>
            </View>
            
            <View style={styles.safetyItem}>
              <Ionicons name="information-circle" size={20} color={colors.neutral[500]} />
              <Text style={styles.safetyText}>
                This app provides educational information, not medical advice
              </Text>
            </View>
          </View>
        </Card>

        {/* Contact Information */}
        <Card variant="outlined" style={styles.contactCard}>
          <Text style={styles.contactTitle}>Need Medical Advice?</Text>
          <Text style={styles.contactText}>
            Always consult qualified healthcare professionals for medical concerns, 
            medication adjustments, or health-related questions.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    padding: layout.screenPadding,
    paddingBottom: spacing.huge,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary[100],
  },

  title: {
    ...typography.headlineLarge,
    color: colors.text.primary,
    textAlign: 'center',
  },

  // Main Notice Card
  noticeCard: {
    marginBottom: spacing.xl,
    backgroundColor: colors.warning[50],
    borderColor: colors.warning[200],
    borderWidth: 1,
  },

  subtitle: {
    ...typography.headlineSmall,
    color: colors.text.primary,
    marginBottom: spacing.xl,
    fontWeight: '600',
  },

  contentText: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    lineHeight: 26,
    marginBottom: spacing.xl,
  },

  recommendationSection: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[400],
  },

  recommendationText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    lineHeight: 24,
  },

  disclaimer: {
    ...typography.titleMedium,
    color: colors.text.primary,
    textAlign: 'center',
    fontWeight: '600',
    fontStyle: 'italic',
  },

  highlight: {
    color: colors.text.primary,
    fontWeight: '700',
  },

  // Safety Card
  safetyCard: {
    marginBottom: spacing.xl,
    backgroundColor: colors.neutral[50],
  },

  safetyTitle: {
    ...typography.headlineSmall,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    fontWeight: '600',
  },

  safetyList: {
    gap: spacing.lg,
  },

  safetyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },

  safetyText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 22,
  },

  // Contact Card
  contactCard: {
    backgroundColor: colors.surface,
  },

  contactTitle: {
    ...typography.titleLarge,
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontWeight: '600',
  },

  contactText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    lineHeight: 22,
  },
});