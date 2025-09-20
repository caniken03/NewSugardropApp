import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, layout, touchTargets, borderRadius } from '@/design-system';
import { Button, Card, ProgressRing } from '@/design-system/components';
import { OnboardingData } from '../../app/onboarding';

interface Step2Props {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

const recommendedTargets = [
  {
    range: '60-80',
    label: 'Conservative',
    description: 'Lower carb approach',
    icon: 'leaf-outline',
    value: 70,
  },
  {
    range: '80-120',
    label: 'Balanced',
    description: 'Moderate carb intake',
    icon: 'balance-outline',
    value: 100,
  },
  {
    range: '120-160',
    label: 'Active',
    description: 'Higher carb for active lifestyle',
    icon: 'fitness-outline',
    value: 140,
  },
];

export default function Step2SugarPointsTarget({ data, onNext, onBack }: Step2Props) {
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [customTarget, setCustomTarget] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    // Auto-recommend based on activity level
    if (data.activityLevel && !selectedTarget) {
      switch (data.activityLevel) {
        case 'sedentary':
          setSelectedTarget(70);
          break;
        case 'lightly_active':
          setSelectedTarget(100);
          break;
        case 'moderately_active':
        case 'very_active':
          setSelectedTarget(140);
          break;
      }
    }
  }, [data.activityLevel]);

  const handleTargetSelect = (target: number) => {
    setSelectedTarget(target);
    setIsCustom(false);
    setCustomTarget('');
  };

  const handleCustomTarget = () => {
    setIsCustom(true);
    setSelectedTarget(null);
  };

  const getFinalTarget = () => {
    if (isCustom) {
      return parseInt(customTarget) || 100;
    }
    return selectedTarget || 100;
  };

  const handleContinue = () => {
    const stepData: Partial<OnboardingData> = {
      customTarget: getFinalTarget(),
      targetReason: isCustom ? 'custom' : 'recommended',
    };
    onNext(stepData);
  };

  const getTargetFeedback = (target: number) => {
    if (target < 60) return { text: 'Very low - ensure adequate nutrition', color: colors.warning[400] };
    if (target <= 80) return { text: 'Low carb approach - great for control', color: colors.success[400] };
    if (target <= 120) return { text: 'Balanced approach - sustainable long-term', color: colors.success[400] };
    if (target <= 160) return { text: 'Active lifestyle - good for exercise', color: colors.primary[400] };
    return { text: 'High target - monitor closely', color: colors.warning[400] };
  };

  const feedback = getTargetFeedback(getFinalTarget());

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your SugarPoints Target</Text>
        <Text style={styles.subtitle}>
          Choose a daily SugarPoints goal that fits your lifestyle
        </Text>
      </View>

      {/* Target Preview */}
      <Card variant="elevated" style={styles.previewCard}>
        <Text style={styles.previewTitle}>Your Daily Target</Text>
        <ProgressRing
          progress={75}
          size={100}
          strokeWidth={8}
          color={colors.primary[400]}>
          <Text style={styles.previewValue}>{getFinalTarget()}</Text>
          <Text style={styles.previewLabel}>SugarPoints</Text>
        </ProgressRing>
        <Text style={[styles.feedbackText, { color: feedback.color }]}>
          {feedback.text}
        </Text>
      </Card>

      {/* Recommended Targets */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommended Targets</Text>
        
        {recommendedTargets.map((target) => (
          <TouchableOpacity
            key={target.value}
            style={[
              styles.targetCard,
              selectedTarget === target.value && !isCustom && styles.selectedTarget,
            ]}
            onPress={() => handleTargetSelect(target.value)}>
            <View style={styles.targetIcon}>
              <Ionicons
                name={target.icon as any}
                size={24}
                color={selectedTarget === target.value && !isCustom ? colors.primary[400] : colors.text.tertiary}
              />
            </View>
            <View style={styles.targetInfo}>
              <Text style={[
                styles.targetLabel,
                selectedTarget === target.value && !isCustom && styles.selectedTargetLabel,
              ]}>
                {target.label}
              </Text>
              <Text style={styles.targetRange}>{target.range} SugarPoints</Text>
              <Text style={styles.targetDescription}>{target.description}</Text>
            </View>
            {selectedTarget === target.value && !isCustom && (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary[400]} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom Target */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.customCard, isCustom && styles.selectedCustom]}
          onPress={handleCustomTarget}>
          <View style={styles.customHeader}>
            <Ionicons
              name="settings-outline"
              size={24}
              color={isCustom ? colors.primary[400] : colors.text.tertiary}
            />
            <Text style={[
              styles.customLabel,
              isCustom && styles.selectedCustomLabel,
            ]}>
              Custom Target
            </Text>
            {isCustom && (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary[400]} />
            )}
          </View>
          
          {isCustom && (
            <View style={styles.customInput}>
              <TextInput
                style={styles.input}
                value={customTarget}
                onChangeText={setCustomTarget}
                placeholder="100"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="numeric"
                maxLength={3}
                autoFocus={true}
              />
              <Text style={styles.customInputLabel}>SugarPoints per day</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Back"
          variant="outline"
          onPress={onBack}
          style={styles.backButton}
        />
        
        <Button
          title="Continue"
          onPress={handleContinue}
          style={styles.continueButton}
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
    marginBottom: spacing.xxl,
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

  // Preview Card
  previewCard: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[100],
  },

  previewTitle: {
    ...typography.titleLarge,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },

  previewValue: {
    ...typography.displayMedium,
    color: colors.primary[400],
    fontWeight: '700',
  },

  previewLabel: {
    ...typography.labelMedium,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  feedbackText: {
    ...typography.bodyMedium,
    marginTop: spacing.lg,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Sections
  section: {
    marginBottom: spacing.xl,
  },

  sectionTitle: {
    ...typography.headlineSmall,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },

  sectionSubtitle: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },

  // Input Row
  inputRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },

  ageInput: {
    flex: 1,
  },

  genderSelection: {
    flex: 2,
  },

  label: {
    ...typography.labelLarge,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },

  input: {
    height: touchTargets.comfortable,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderColor: colors.border.light,
    color: colors.text.primary,
    fontSize: 16,
    textAlign: 'center',
  },

  genderOptions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },

  genderButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
  },

  selectedGender: {
    borderColor: colors.primary[400],
    backgroundColor: colors.primary[50],
  },

  genderText: {
    ...typography.labelMedium,
    color: colors.text.secondary,
  },

  selectedGenderText: {
    color: colors.primary[400],
    fontWeight: '600',
  },

  // Activity Cards
  activityGrid: {
    gap: spacing.md,
  },

  activityCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.lg,
    alignItems: 'center',
  },

  selectedActivity: {
    borderColor: colors.primary[400],
    backgroundColor: colors.primary[50],
  },

  activityLabel: {
    ...typography.titleMedium,
    color: colors.text.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },

  selectedActivityLabel: {
    color: colors.primary[400],
    fontWeight: '600',
  },

  activityDescription: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    textAlign: 'center',
  },

  // Target Cards
  targetCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  selectedTarget: {
    borderColor: colors.primary[400],
    backgroundColor: colors.primary[50],
  },

  targetIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },

  targetInfo: {
    flex: 1,
  },

  targetLabel: {
    ...typography.titleLarge,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },

  selectedTargetLabel: {
    color: colors.primary[400],
    fontWeight: '600',
  },

  targetRange: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },

  targetDescription: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
  },

  // Custom Target
  customCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.lg,
  },

  selectedCustom: {
    borderColor: colors.primary[400],
    backgroundColor: colors.primary[50],
  },

  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },

  customLabel: {
    ...typography.titleLarge,
    color: colors.text.secondary,
    flex: 1,
    marginLeft: spacing.md,
  },

  selectedCustomLabel: {
    color: colors.primary[400],
    fontWeight: '600',
  },

  customInput: {
    alignItems: 'center',
    gap: spacing.sm,
  },

  customInputLabel: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.xl,
  },

  backButton: {
    flex: 1,
  },

  continueButton: {
    flex: 2,
  },
});