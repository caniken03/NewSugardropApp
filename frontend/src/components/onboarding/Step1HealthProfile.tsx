import React, { useState } from 'react';
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
import { Button, Card } from '@/design-system/components';
import { OnboardingData } from '../../app/onboarding';

interface Step1Props {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onSkip: () => void;
}

const activityLevels = [
  {
    key: 'sedentary',
    label: 'Sedentary',
    description: 'Little to no exercise',
    icon: 'bed-outline',
  },
  {
    key: 'lightly_active',
    label: 'Lightly Active',
    description: 'Light exercise 1-3 days/week',
    icon: 'walk-outline',
  },
  {
    key: 'moderately_active',
    label: 'Moderately Active',
    description: 'Moderate exercise 3-5 days/week',
    icon: 'bicycle-outline',
  },
  {
    key: 'very_active',
    label: 'Very Active',
    description: 'Heavy exercise 6-7 days/week',
    icon: 'fitness-outline',
  },
];

const healthGoalOptions = [
  { key: 'weight_loss', label: 'Weight Management', icon: 'trending-down-outline' },
  { key: 'diabetes', label: 'Blood Sugar Control', icon: 'medical-outline' },
  { key: 'general_health', label: 'General Health', icon: 'heart-outline' },
  { key: 'energy', label: 'More Energy', icon: 'flash-outline' },
  { key: 'education', label: 'Learn About Nutrition', icon: 'school-outline' },
];

export default function Step1HealthProfile({ data, onNext, onSkip }: Step1Props) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [age, setAge] = useState(data.age?.toString() || '');
  const [gender, setGender] = useState(data.gender || '');
  const [currentWeight, setCurrentWeight] = useState('');
  const [desiredWeight, setDesiredWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState(data.activityLevel || '');
  const [healthGoals, setHealthGoals] = useState<string[]>(data.healthGoals || []);

  const questions = [
    {
      id: 'age_gender',
      title: 'Tell us about yourself',
      type: 'age_gender' as const,
    },
    {
      id: 'weight_goals',
      title: 'What are your weight goals?',
      subtitle: 'This helps us provide personalized encouragement',
      type: 'weight_goals' as const,
    },
    {
      id: 'health_goals',
      title: 'What are your health goals?',
      subtitle: 'Select all that apply (you can change these later)',
      type: 'health_goals' as const,
    }
  ];

  const currentQ = questions[currentQuestion];

  const canProceed = () => {
    switch (currentQuestion) {
      case 0: return age && gender;
      case 1: return currentWeight && desiredWeight;
      case 2: return healthGoals.length > 0;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Complete step 1
      const stepData: Partial<OnboardingData> = {
        age: age ? parseInt(age) : undefined,
        gender: gender as any,
        currentWeight: currentWeight ? parseFloat(currentWeight) : undefined,
        desiredWeight: desiredWeight ? parseFloat(desiredWeight) : undefined,
        healthGoals,
      };
      onNext(stepData);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      onSkip();
    }
  };

  const toggleHealthGoal = (goal: string) => {
    setHealthGoals(prev =>
      prev.includes(goal)
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const renderAgeGenderQuestion = () => (
    <View style={styles.questionContainer}>
      <View style={styles.inputRow}>
        <View style={styles.ageInput}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder="25"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>
        
        <View style={styles.genderSelection}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderOptions}>
            {['male', 'female', 'other'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.genderButton,
                  gender === option && styles.selectedGender,
                ]}
                onPress={() => setGender(option)}>
                <Text style={[
                  styles.genderText,
                  gender === option && styles.selectedGenderText,
                ]}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  const renderActivityQuestion = () => (
    <View style={styles.questionContainer}>
      <View style={styles.activityGrid}>
        {activityLevels.map((level) => (
          <TouchableOpacity
            key={level.key}
            style={[
              styles.activityCard,
              activityLevel === level.key && styles.selectedActivity,
            ]}
            onPress={() => setActivityLevel(level.key)}>
            <Ionicons
              name={level.icon as any}
              size={32}
              color={activityLevel === level.key ? colors.primary[400] : colors.text.tertiary}
            />
            <Text style={[
              styles.activityLabel,
              activityLevel === level.key && styles.selectedActivityLabel,
            ]}>
              {level.label}
            </Text>
            <Text style={styles.activityDescription}>
              {level.description}
            </Text>
            {activityLevel === level.key && (
              <View style={styles.checkmark}>
                <Ionicons name="checkmark-circle" size={24} color={colors.primary[400]} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderGoalsQuestion = () => (
    <View style={styles.questionContainer}>
      <View style={styles.goalsGrid}>
        {healthGoalOptions.map((goal) => (
          <TouchableOpacity
            key={goal.key}
            style={[
              styles.goalCard,
              healthGoals.includes(goal.key) && styles.selectedGoal,
            ]}
            onPress={() => toggleHealthGoal(goal.key)}>
            <Ionicons
              name={goal.icon as any}
              size={24}
              color={healthGoals.includes(goal.key) ? colors.primary[400] : colors.text.tertiary}
            />
            <Text style={[
              styles.goalLabel,
              healthGoals.includes(goal.key) && styles.selectedGoalLabel,
            ]}>
              {goal.label}
            </Text>
            {healthGoals.includes(goal.key) && (
              <View style={styles.checkIcon}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary[400]} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCurrentQuestion = () => {
    switch (currentQ.type) {
      case 'age_gender':
        return renderAgeGenderQuestion();
      case 'goals':
        return renderGoalsQuestion();
      default:
        return null;
    }
  };

  const isValid = canProceed();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Let's personalize your SugarDrop journey</Text>
        <Text style={styles.subtitle}>
          Help us calculate your ideal SugarPoints target
        </Text>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Question {currentQuestion + 1} of {questions.length}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((currentQuestion + 1) / questions.length) * 100}%` }]} />
        </View>
      </View>

      {/* Current Question */}
      <View style={styles.questionSection}>
        <Text style={styles.questionTitle}>{currentQ.title}</Text>
        {currentQ.subtitle && (
          <Text style={styles.questionSubtitle}>{currentQ.subtitle}</Text>
        )}
        
        {renderCurrentQuestion()}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title={currentQuestion === 0 ? "Skip for now" : "Back"}
          variant="outline"
          onPress={handleBack}
          style={styles.backButton}
        />
        
        <Button
          title={currentQuestion === questions.length - 1 ? "Continue" : "Next"}
          onPress={handleNext}
          disabled={!isValid}
          style={styles.nextButton}
          icon={currentQuestion === questions.length - 1 ? undefined : "arrow-forward"}
          iconPosition="right"
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

  // Sections
  section: {
    marginBottom: spacing.xxl,
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

  // Age & Gender
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
    backgroundColor: colors.primary[100],
    borderWidth: 2,
    shadowColor: colors.primary[400],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  genderText: {
    ...typography.labelMedium,
    color: colors.text.secondary,
  },

  selectedGenderText: {
    color: colors.primary[400],
    fontWeight: '700',
  },

  // Activity Cards
  activityGrid: {
    gap: spacing.lg,
  },

  activityCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.xl,
    alignItems: 'center',
    position: 'relative',
  },

  selectedActivity: {
    borderColor: colors.primary[400],
    backgroundColor: colors.primary[100],
    borderWidth: 2,
    shadowColor: colors.primary[400],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  activityLabel: {
    ...typography.titleMedium,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },

  selectedActivityLabel: {
    color: colors.primary[400],
    fontWeight: '700',
  },

  activityDescription: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    textAlign: 'center',
  },

  checkmark: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },

  // Goal Cards
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },

  goalCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.lg,
    alignItems: 'center',
    position: 'relative',
    minHeight: 100,
  },

  selectedGoal: {
    borderColor: colors.primary[400],
    backgroundColor: colors.primary[100],
    borderWidth: 2,
    shadowColor: colors.primary[400],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  goalLabel: {
    ...typography.labelLarge,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },

  selectedGoalLabel: {
    color: colors.primary[400],
    fontWeight: '700',
  },

  checkIcon: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },

  // Progress
  progressContainer: {
    marginBottom: spacing.xl,
  },

  progressText: {
    ...typography.labelMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  progressBar: {
    height: 6,
    backgroundColor: colors.neutral[200],
    borderRadius: 3,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[400],
    borderRadius: 3,
  },

  // Question Section
  questionSection: {
    marginBottom: spacing.xxl,
  },

  questionTitle: {
    ...typography.headlineMedium,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },

  questionSubtitle: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },

  questionContainer: {
    marginTop: spacing.lg,
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

  nextButton: {
    flex: 2,
  },
});