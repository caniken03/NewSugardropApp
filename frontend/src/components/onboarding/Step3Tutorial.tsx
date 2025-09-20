import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, layout, touchTargets, borderRadius } from '@/design-system';
import { Button, Card, ProgressRing } from '@/design-system/components';
import { OnboardingData } from '../../app/onboarding';

const { width: screenWidth } = Dimensions.get('window');

interface Step3Props {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

const tutorialSteps = [
  {
    icon: 'restaurant-outline',
    title: 'Track Your Foods',
    description: 'Log meals by searching our database, scanning with camera, or entering manually',
    features: ['Real nutrition database', 'AI-powered recognition', 'Manual entry'],
  },
  {
    icon: 'analytics-outline',
    title: 'Monitor SugarPoints',
    description: 'See your daily intake with our simple SugarPoints system - 1 point per gram of carbs',
    features: ['Daily progress ring', 'Weekly trends', 'Goal tracking'],
  },
  {
    icon: 'chatbubble-ellipses-outline',
    title: 'Get AI Coaching',
    description: 'Ask questions and get personalized nutrition advice from your AI coach',
    features: ['Personalized tips', 'Meal suggestions', 'Goal support'],
  },
];

export default function Step3Tutorial({ data, onNext, onBack }: Step3Props) {
  const [currentTutorial, setCurrentTutorial] = useState(0);

  const handleContinue = () => {
    const stepData: Partial<OnboardingData> = {
      completedTutorial: true,
    };
    onNext(stepData);
  };

  const renderTutorialStep = (step: typeof tutorialSteps[0], index: number) => (
    <Card
      key={index}
      variant="elevated"
      style={[
        styles.tutorialCard,
        index === currentTutorial && styles.activeTutorialCard,
      ]}>
      <View style={styles.tutorialIcon}>
        <Ionicons
          name={step.icon as keyof typeof Ionicons.glyphMap}
          size={48}
          color={colors.primary[400]}
        />
      </View>
      
      <Text style={styles.tutorialTitle}>{step.title}</Text>
      <Text style={styles.tutorialDescription}>{step.description}</Text>
      
      <View style={styles.featuresList}>
        {step.features.map((feature, idx) => (
          <View key={idx} style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success[400]} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
    </Card>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>How SugarDrop Works</Text>
        <Text style={styles.subtitle}>
          Quick overview of your new nutrition tracking companion
        </Text>
      </View>

      {/* Tutorial Navigation */}
      <View style={styles.tutorialNavigation}>
        {tutorialSteps.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.navDot,
              index === currentTutorial && styles.activeNavDot,
            ]}
            onPress={() => setCurrentTutorial(index)}
          />
        ))}
      </View>

      {/* Tutorial Content */}
      <View style={styles.tutorialContainer}>
        {renderTutorialStep(tutorialSteps[currentTutorial], currentTutorial)}
      </View>

      {/* Navigation */}
      <View style={styles.tutorialControls}>
        {currentTutorial > 0 && (
          <Button
            title="Previous"
            variant="ghost"
            onPress={() => setCurrentTutorial(currentTutorial - 1)}
            icon="chevron-back"
            style={styles.prevButton}
          />
        )}
        
        {currentTutorial < tutorialSteps.length - 1 ? (
          <Button
            title="Next"
            onPress={() => setCurrentTutorial(currentTutorial + 1)}
            icon="chevron-forward"
            iconPosition="right"
            style={styles.nextButton}
          />
        ) : (
          <Button
            title="Next"
            onPress={() => setCurrentTutorial(currentTutorial + 1)}
            icon="chevron-forward"
            iconPosition="right"
            style={styles.nextButton}
          />
        )}
      </View>

      {/* Summary Card */}
      <Card variant="outlined" style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>You're all set! 🎉</Text>
        <Text style={styles.summaryText}>
          Your daily target: <Text style={styles.summaryHighlight}>{data.customTarget || 100} SugarPoints</Text>
        </Text>
        <Text style={styles.summarySubtext}>
          Start logging your first meal to begin tracking your nutrition journey
        </Text>
      </Card>

      {/* Final Actions */}
      <View style={styles.actions}>
        <Button
          title="Back"
          variant="outline"
          onPress={onBack}
          style={styles.backButton}
        />
        
        <Button
          title="Get Started!"
          onPress={handleContinue}
          style={styles.finishButton}
          size="large"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
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

  title: {
    ...typography.headlineLarge,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },

  subtitle: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Tutorial Navigation
  tutorialNavigation: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },

  navDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral[300],
  },

  activeNavDot: {
    backgroundColor: colors.primary[400],
    width: 24,
    borderRadius: 12,
  },

  // Tutorial Content
  tutorialContainer: {
    marginBottom: spacing.xl,
  },

  tutorialCard: {
    alignItems: 'center',
    padding: spacing.xxl,
  },

  activeTutorialCard: {
    borderColor: colors.primary[200],
    backgroundColor: colors.primary[50],
  },

  tutorialIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: colors.primary[100],
  },

  tutorialTitle: {
    ...typography.headlineMedium,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },

  tutorialDescription: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },

  featuresList: {
    gap: spacing.md,
    alignSelf: 'stretch',
  },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  featureText: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    flex: 1,
  },

  // Tutorial Controls
  tutorialControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },

  prevButton: {
    flex: 1,
    marginRight: spacing.md,
  },

  nextButton: {
    flex: 1,
    marginLeft: spacing.md,
  },

  // Summary
  summaryCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.xl,
    backgroundColor: colors.success[50],
    borderColor: colors.success[200],
  },

  summaryTitle: {
    ...typography.headlineSmall,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },

  summaryText: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },

  summaryHighlight: {
    color: colors.primary[400],
    fontWeight: '600',
  },

  summarySubtext: {
    ...typography.bodyMedium,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  backButton: {
    flex: 1,
  },

  finishButton: {
    flex: 2,
  },
});