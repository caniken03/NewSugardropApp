import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, layout, touchTargets, borderRadius } from '@/design-system';
import { Button, Card } from '@/design-system/components';
import { apiClient } from '@/services/api';
import { OnboardingData } from '../../app/onboarding';

interface Step2Props {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
  };
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "How would you describe your natural body frame?",
    options: {
      A: "Naturally thin with narrow shoulders and hips",
      B: "Athletic build with broad shoulders",
      C: "Rounder, fuller frame with wider hips"
    }
  },
  {
    id: 2,
    question: "How easily do you gain weight?",
    options: {
      A: "Very difficult - I can eat a lot without gaining",
      B: "Moderate - I gain muscle easily, fat moderately",
      C: "Very easily - I gain weight quickly"
    }
  },
  {
    id: 3,
    question: "How easily do you lose weight?",
    options: {
      A: "Very difficult - I struggle to maintain weight",
      B: "Moderate - with exercise and diet changes",
      C: "Difficult - requires significant effort"
    }
  },
  {
    id: 4,
    question: "How would you describe your appetite?",
    options: {
      A: "Generally low - I often forget to eat",
      B: "Moderate - hungry at meal times",
      C: "Strong - I'm often thinking about food"
    }
  },
  {
    id: 5,
    question: "How do you respond to carbohydrates?",
    options: {
      A: "I can eat them freely without much effect",
      B: "Good for energy, especially around workouts",
      C: "They tend to make me gain weight or feel sluggish"
    }
  },
  {
    id: 6,
    question: "What's your energy level like throughout the day?",
    options: {
      A: "Consistent but sometimes anxious or restless",
      B: "Good energy, especially with regular meals",
      C: "Tends to fluctuate, afternoon crashes are common"
    }
  },
  {
    id: 7,
    question: "How would you describe your bone structure?",
    options: {
      A: "Small-boned, delicate wrists and ankles",
      B: "Medium-boned, proportional frame",
      C: "Large-boned, thick wrists and ankles"
    }
  },
  {
    id: 8,
    question: "How do you typically store body fat?",
    options: {
      A: "Rarely store fat, mostly in midsection if any",
      B: "Evenly distributed, easier to lose",
      C: "Lower body (hips, thighs) and midsection"
    }
  },
  {
    id: 9,
    question: "How would friends describe your metabolism?",
    options: {
      A: "Fast - 'you can eat anything!'",
      B: "Normal - responds well to exercise",
      C: "Slow - 'careful with sweets'"
    }
  },
  {
    id: 10,
    question: "What happens when you skip meals?",
    options: {
      A: "I get very hungry, shaky, or irritable",
      B: "I notice but can function normally",
      C: "I don't always notice, sometimes feel fine"
    }
  },
  {
    id: 11,
    question: "How do you build muscle?",
    options: {
      A: "Very slowly, requires consistent effort",
      B: "Relatively easily with regular exercise",
      C: "Slowly, but I build strength well"
    }
  },
  {
    id: 12,
    question: "What's your relationship with exercise?",
    options: {
      A: "I prefer cardio, strength training is challenging",
      B: "I enjoy variety and see results quickly",
      C: "I prefer steady-state activities, strength training helps"
    }
  },
  {
    id: 13,
    question: "How do you feel after eating a large meal?",
    options: {
      A: "Energized and ready to go",
      B: "Satisfied and comfortable",
      C: "Full and sometimes sluggish"
    }
  },
  {
    id: 14,
    question: "What's your natural sleep pattern?",
    options: {
      A: "Light sleeper, sometimes restless",
      B: "Good sleep, wake up refreshed",
      C: "Deep sleeper, need more hours"
    }
  },
  {
    id: 15,
    question: "How do you handle stress?",
    options: {
      A: "Tend to lose appetite or get anxious",
      B: "Generally manage well with outlets",
      C: "Sometimes eat more or crave comfort foods"
    }
  }
];

export default function Step2BodyTypeQuiz({ data, onNext, onBack }: Step2Props) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);

  const handleResponse = (questionId: number, value: string) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Submit quiz
      submitQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitQuiz = async () => {
    // Validate all questions answered
    const answeredCount = Object.keys(responses).length;
    if (answeredCount < 15) {
      Alert.alert(
        'Incomplete Quiz',
        `Please answer all questions to receive your personalized results. (${answeredCount}/15 completed)`
      );
      return;
    }

    setLoading(true);
    try {
      // Format responses for API
      const quizResponses = quizQuestions.map(q => ({
        question_id: q.id,
        value: responses[q.id]
      }));

      const response = await apiClient.post('/quiz/submit', {
        responses: quizResponses
      });

      const result = response.data;
      
      // Store quiz result in onboarding data
      const stepData: Partial<OnboardingData> = {
        bodyType: result.body_type,
        sugarpointsRange: result.sugarpoints_range,
        onboardingPath: result.onboarding_path,
        healthRisk: result.health_risk,
        recommendations: result.recommendations,
      };

      onNext(stepData);
      
    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      Alert.alert(
        'Quiz Error',
        error.response?.data?.detail || 'Failed to process quiz. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const currentQ = quizQuestions[currentQuestion];
  const currentResponse = responses[currentQ.id];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const answeredCount = Object.keys(responses).length;

  return (
    <View style={styles.container}>
      {/* Progress Header */}
      <View style={styles.progressHeader}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Question {currentQuestion + 1} of {quizQuestions.length}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Discover Your Body Type</Text>
          <Text style={styles.subtitle}>
            Get personalized SugarPoints recommendations based on your metabolic profile
          </Text>
        </View>

        {/* Question Card */}
        <Card variant="elevated" style={styles.questionCard}>
          <Text style={styles.questionNumber}>
            Question {currentQ.id}
          </Text>
          <Text style={styles.questionText}>
            {currentQ.question}
          </Text>
          
          <View style={styles.optionsContainer}>
            {Object.entries(currentQ.options).map(([key, option]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.optionButton,
                  currentResponse === key && styles.selectedOption,
                ]}
                onPress={() => handleResponse(currentQ.id, key)}
                accessibilityRole="radio"
                accessibilityState={{ checked: currentResponse === key }}>
                <View style={styles.optionContent}>
                  <View style={[
                    styles.radioButton,
                    currentResponse === key && styles.selectedRadio,
                  ]}>
                    {currentResponse === key && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={[
                    styles.optionText,
                    currentResponse === key && styles.selectedOptionText,
                  ]}>
                    {option}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Quiz Progress Summary */}
        <Card variant="outlined" style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Quiz Progress</Text>
          <Text style={styles.summaryText}>
            {answeredCount} of 15 questions completed
          </Text>
          {answeredCount >= 10 && (
            <Text style={styles.summaryEncouragement}>
              Almost done! Your personalized results are coming up.
            </Text>
          )}
        </Card>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <Button
          title="Back"
          variant="outline"
          onPress={currentQuestion === 0 ? onBack : handlePrevious}
          style={styles.backButton}
        />
        
        <Button
          title={currentQuestion === quizQuestions.length - 1 ? "Get Results" : "Next"}
          onPress={handleNext}
          disabled={!currentResponse || loading}
          loading={loading}
          style={styles.nextButton}
          icon={currentQuestion === quizQuestions.length - 1 ? "sparkles" : "chevron-forward"}
          iconPosition="right"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Progress Header
  progressHeader: {
    padding: layout.screenPadding,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },

  progressBar: {
    height: 4,
    backgroundColor: colors.neutral[200],
    borderRadius: 2,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[400],
    borderRadius: 2,
  },

  progressText: {
    ...typography.labelMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Content
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

  // Question Card
  questionCard: {
    marginBottom: spacing.xl,
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[100],
  },

  questionNumber: {
    ...typography.labelMedium,
    color: colors.primary[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },

  questionText: {
    ...typography.headlineSmall,
    color: colors.text.primary,
    marginBottom: spacing.xl,
    lineHeight: 28,
  },

  // Options
  optionsContainer: {
    gap: spacing.md,
  },

  optionButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.lg,
    minHeight: touchTargets.comfortable,
  },

  selectedOption: {
    borderColor: colors.primary[400],
    backgroundColor: colors.primary[50],
  },

  optionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },

  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2, // Align with text
  },

  selectedRadio: {
    borderColor: colors.primary[400],
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary[400],
  },

  optionText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 22,
  },

  selectedOptionText: {
    color: colors.text.primary,
    fontWeight: '500',
  },

  // Summary Card
  summaryCard: {
    marginBottom: spacing.xl,
    backgroundColor: colors.neutral[50],
  },

  summaryTitle: {
    ...typography.titleLarge,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },

  summaryText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },

  summaryEncouragement: {
    ...typography.bodyMedium,
    color: colors.success[400],
    fontWeight: '500',
  },

  // Navigation
  navigation: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: layout.screenPadding,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },

  backButton: {
    flex: 1,
  },

  nextButton: {
    flex: 2,
  },
});