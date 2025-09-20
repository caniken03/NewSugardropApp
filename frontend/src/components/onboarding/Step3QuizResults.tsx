import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, layout, borderRadius } from '@/design-system';
import { Button, Card, ProgressRing } from '@/design-system/components';
import { OnboardingData } from '../../app/onboarding';

interface Step3Props {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

const bodyTypeInfo = {
  Ectomorph: {
    icon: 'flash-outline',
    color: colors.success[400],
    title: 'A: Ectomorph',
    range: '100 – 125 SugarPoints',
  },
  Mesomorph: {
    icon: 'fitness-outline',
    color: colors.primary[400],
    title: 'B: Mesomorph',
    range: '75 – 100 SugarPoints',
  },
  Endomorph: {
    icon: 'leaf-outline',
    color: colors.warning[400],
    title: 'C: Endomorph',
    range: '50 – 75 SugarPoints',
  },
  Hybrid: {
    icon: 'options-outline',
    color: colors.neutral[500],
    title: 'Hybrid Body Type',
    range: '75 – 125 SugarPoints',
  }
};

export default function Step3QuizResults({ data, onNext, onBack }: Step3Props) {
  const bodyType = data.bodyType || 'Hybrid';
  const typeInfo = bodyTypeInfo[bodyType as keyof typeof bodyTypeInfo];
  
  // Extract target from range (e.g., "75-100" → 87)
  const getTargetFromRange = (range: string) => {
    if (!range) return 100;
    const [min, max] = range.split('–').map(n => parseInt(n.trim()));
    return Math.round((min + max) / 2);
  };

  const suggestedTarget = getTargetFromRange(data.sugarpointsRange || '75-100');

  const handleContinue = () => {
    const stepData: Partial<OnboardingData> = {
      customTarget: suggestedTarget,
      targetReason: 'body_type_quiz',
    };
    onNext(stepData);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Body Type Results</Text>
        <Text style={styles.subtitle}>
          Personalized recommendations based on your metabolic profile
        </Text>
      </View>

      {/* Body Type Result Card */}
      <Card variant="elevated" style={[styles.resultCard, { borderColor: typeInfo.color + '40' }]}>
        <View style={[styles.resultIcon, { backgroundColor: typeInfo.color + '20' }]}>
          <Ionicons name={typeInfo.icon as any} size={48} color={typeInfo.color} />
        </View>
        
        <Text style={styles.bodyTypeName}>{typeInfo.title}</Text>
        <Text style={styles.bodyTypeRange}>Daily SugarPoint Intake Range: {typeInfo.range}</Text>
        
        {/* Your exact description text */}
        <Text style={styles.bodyTypeDescription}>{data.healthRisk}</Text>
      </Card>

      {/* SugarPoints Recommendation */}
      <Card variant="outlined" style={styles.recommendationCard}>
        <Text style={styles.recommendationTitle}>Your Personalized Target</Text>
        
        <View style={styles.targetDisplay}>
          <ProgressRing
            progress={75}
            size={80}
            strokeWidth={6}
            color={typeInfo.color}>
            <Text style={[styles.targetValue, { color: typeInfo.color }]}>
              {suggestedTarget}
            </Text>
          </ProgressRing>
          
          <View style={styles.targetInfo}>
            <Text style={styles.targetRange}>
              Range: {data.sugarpointsRange || '75-100'}
            </Text>
            <Text style={styles.targetLabel}>Daily SugarPoints</Text>
          </View>
        </View>
        
        <Text style={styles.recommendationDescription}>
          Based on your quiz results, we recommend starting with{' '}
          <Text style={styles.highlightText}>{suggestedTarget} SugarPoints daily</Text>.
          You can adjust this as you learn how your body responds.
        </Text>
      </Card>

      {/* Medical Disclaimer */}
      <Card variant="outlined" style={styles.disclaimerCard}>
        <View style={styles.disclaimerHeader}>
          <Ionicons name="information-circle-outline" size={20} color={colors.neutral[500]} />
          <Text style={styles.disclaimerTitle}>Medical Disclaimer</Text>
        </View>
        <Text style={styles.disclaimerText}>
          This quiz provides a broad assessment and is not intended for medical advice.
        </Text>
      </Card>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Retake Quiz"
          variant="outline"
          onPress={onBack}
          style={styles.retakeButton}
        />
        
        <Button
          title="Continue Setup"
          onPress={handleContinue}
          style={styles.continueButton}
          size="large"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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

  // Result Card
  resultCard: {
    alignItems: 'center',
    padding: spacing.xxl,
    marginBottom: spacing.xl,
    borderWidth: 2,
  },

  resultIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },

  bodyTypeName: {
    ...typography.displayMedium,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },

  bodyTypeRange: {
    ...typography.headlineSmall,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },

  bodyTypeDescription: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Recommendation Card
  recommendationCard: {
    marginBottom: spacing.xl,
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[200],
  },

  recommendationTitle: {
    ...typography.headlineSmall,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },

  targetDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    marginBottom: spacing.lg,
  },

  targetValue: {
    ...typography.headlineLarge,
    fontWeight: '700',
  },

  targetInfo: {
    alignItems: 'center',
  },

  targetRange: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },

  targetLabel: {
    ...typography.labelMedium,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  recommendationDescription: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  highlightText: {
    color: colors.primary[400],
    fontWeight: '600',
  },

  // Health Risk Card
  healthRiskCard: {
    marginBottom: spacing.xl,
    backgroundColor: colors.warning[50],
    borderColor: colors.warning[200],
  },

  healthRiskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },

  healthRiskTitle: {
    ...typography.titleLarge,
    color: colors.text.primary,
  },

  healthRiskText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    lineHeight: 22,
  },

  // Recommendations Card
  recommendationsCard: {
    marginBottom: spacing.xl,
  },

  recommendationsTitle: {
    ...typography.titleLarge,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },

  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },

  recommendationText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 22,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  retakeButton: {
    flex: 1,
  },

  continueButton: {
    flex: 2,
  },
});