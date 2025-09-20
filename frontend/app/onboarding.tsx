import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { colors, typography, spacing, layout } from '@/design-system';
import { Button, Card } from '@/design-system/components';
import { apiClient } from '@/services/api';
import OnboardingStep1 from '@/components/onboarding/Step1HealthProfile';
import OnboardingStep2 from '@/components/onboarding/Step2BodyTypeQuiz';
import OnboardingStep3 from '@/components/onboarding/Step3QuizResults';
import OnboardingStep4 from '@/components/onboarding/Step3Tutorial';

const { width: screenWidth } = Dimensions.get('window');

export interface OnboardingData {
  // Step 1 - Health Profile
  age?: number;
  gender?: 'male' | 'female' | 'other';
  activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  healthGoals?: string[];
  
  // Step 2 - Body Type Quiz Results
  bodyType?: 'Ectomorph' | 'Mesomorph' | 'Endomorph' | 'Hybrid';
  sugarpointsRange?: string;
  onboardingPath?: string;
  healthRisk?: string;
  recommendations?: string[];
  
  // Step 3 - SugarPoints Target (now uses quiz results)
  customTarget?: number;
  targetReason?: string;
  
  // Step 4 - Tutorial
  completedTutorial?: boolean;
}

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  const handleNext = (stepData: Partial<OnboardingData>) => {
    updateOnboardingData(stepData);
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      // Save onboarding data to user profile
      await apiClient.put('/user/profile', {
        age: onboardingData.age,
        gender: onboardingData.gender,
        activity_level: onboardingData.activityLevel,
        health_goals: onboardingData.healthGoals,
        daily_sugar_points_target: onboardingData.customTarget,
        completed_onboarding: true,
      });
      
      // Navigate to main app
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((step) => (
        <View
          key={step}
          style={[
            styles.stepDot,
            currentStep >= step && styles.activeStepDot,
            currentStep === step && styles.currentStepDot,
          ]}
        />
      ))}
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <OnboardingStep1
            data={onboardingData}
            onNext={handleNext}
            onSkip={() => handleNext({})}
          />
        );
      case 2:
        return (
          <OnboardingStep2
            data={onboardingData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <OnboardingStep3
            data={onboardingData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.header}>
        {renderStepIndicator()}
        <Text style={styles.stepText}>
          Step {currentStep} of 3
        </Text>
      </View>

      {/* Current Step Content */}
      <View style={styles.stepContent}>
        {renderCurrentStep()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    alignItems: 'center',
    padding: layout.screenPadding,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.surface,
  },

  stepIndicator: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral[300],
  },

  activeStepDot: {
    backgroundColor: colors.primary[200],
  },

  currentStepDot: {
    backgroundColor: colors.primary[400],
    width: 24,
    borderRadius: 12,
  },

  stepText: {
    ...typography.labelMedium,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  stepContent: {
    flex: 1,
  },
});