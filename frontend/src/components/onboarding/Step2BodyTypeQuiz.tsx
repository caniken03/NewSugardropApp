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
    question: "Which best describes your body shape?",
    options: {
      A: "Narrow shoulders and hips, longer limbs",
      B: "Broad shoulders, well-defined muscles",
      C: "Rounder, softer physique with a tendency to store fat"
    }
  },
  {
    id: 2,
    question: "How do you typically respond to changes in diet or exercise?",
    options: {
      A: "Difficulty gaining weight, even with increased caloric intake",
      B: "Can easily gain muscle mass or lose weight with adjustments",
      C: "Tends to gain weight easily and struggles with weight loss"
    }
  },
  {
    id: 3,
    question: "How quickly do you notice changes in muscle definition?",
    options: {
      A: "Slow to develop noticeable muscle definition",
      B: "Rapid muscle development with training",
      C: "Gains muscle but may also store fat around muscles"
    }
  },
  {
    id: 4,
    question: "How would you describe your metabolism?",
    options: {
      A: "Fast metabolism with difficulty gaining weight",
      B: "Moderate metabolism with balanced weight maintenance",
      C: "Slower metabolism with a tendency to gain weight"
    }
  },
  {
    id: 5,
    question: "What is the size of your wrists and ankles?",
    options: {
      A: "Small joints",
      B: "Moderate-sized joints",
      C: "Large joints"
    }
  },
  {
    id: 6,
    question: "How do you perceive your appetite?",
    options: {
      A: "Often have a smaller appetite",
      B: "Consistent and balanced appetite",
      C: "Tend to have a larger appetite, especially for carbohydrates"
    }
  },
  {
    id: 7,
    question: "How would you describe your energy levels throughout the day?",
    options: {
      A: "Consistently high energy levels",
      B: "Moderate and stable energy levels",
      C: "Energy levels may fluctuate, especially after meals"
    }
  },
  {
    id: 8,
    question: "Where do you tend to store excess fat?",
    options: {
      A: "Difficulty gaining fat, lean physique",
      B: "Even fat distribution with maintained muscle definition",
      C: "More noticeable fat storage, especially around the midsection"
    }
  },
  {
    id: 9,
    question: "How do your shoulders compare to your hips?",
    options: {
      A: "My shoulders are narrower than my hips.",
      B: "They're approximately the same width as my hips.",
      C: "My shoulders are wider than my hips."
    }
  },
  {
    id: 10,
    question: "Are you currently diagnosed with prediabetes or type 2 diabetes?",
    options: {
      A: "No, I do not have either condition",
      B: "I have been diagnosed with prediabetes",
      C: "I have been diagnosed with type 2 diabetes"
    }
  },
  {
    id: 11,
    question: "Do you have a family history of prediabetes or type 2 diabetes?",
    options: {
      A: "No family history",
      B: "Some family history",
      C: "Strong family history"
    }
  },
  {
    id: 12,
    question: "How often do you crave sugary foods or beverages?",
    options: {
      A: "Rarely or never",
      B: "Occasionally",
      C: "Frequently or daily"
    }
  },
  {
    id: 13,
    question: "How do you feel after consuming a large amount of sugary foods?",
    options: {
      A: "Satisfied and unaffected",
      B: "Moderately affected, may experience energy fluctuations",
      C: "Cravings intensify, may feel irritable or fatigued"
    }
  },
  {
    id: 14,
    question: "Have you ever tried to cut down on sugary foods, and how successful were you?",
    options: {
      A: "Never tried or easily successful",
      B: "Tried but with moderate success",
      C: "Tried with minimal success, find it challenging to resist sugar"
    }
  },
  {
    id: 15,
    question: "How often do you think about consuming sugary foods during the day?",
    options: {
      A: "Rarely or never",
      B: "Occasionally",
      C: "Frequently or obsessively"
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