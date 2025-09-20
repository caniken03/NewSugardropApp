import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';
import { colors, typography, spacing, layout, touchTargets, borderRadius } from '@/design-system';
import { Button, Card } from '@/design-system/components';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

const suggestedQuestions = [
  "What foods are highest in SugarPoints?",
  "How can I reduce my daily SugarPoints?",
  "What's a good SugarPoints target for weight loss?",
  "Which snacks are lowest in SugarPoints?",
  "How do I read nutrition labels for carbs?",
];

export default function AIChatScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      text: `Hi ${user?.name}! I'm your AI nutrition coach. I can help you understand SugarPoints, suggest healthier alternatives, and support your nutrition goals. What would you like to know?`,
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [user]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputText.trim();
    if (!textToSend) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      text: '...',
      isUser: false,
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await apiClient.post('/ai/chat', {
        message: textToSend,
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.response,
        isUser: false,
        timestamp: new Date(),
      };

      // Remove typing indicator and add AI response
      setMessages(prev => prev.filter(m => m.id !== 'typing').concat(aiMessage));
      
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I\'m having trouble responding right now. Please try again in a moment.',
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => prev.filter(m => m.id !== 'typing').concat(errorMessage));
      
      Alert.alert('Chat Error', 'Failed to get AI response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessageContainer : styles.aiMessageContainer
    ]}>
      <View style={[
        styles.messageBubble,
        item.isUser ? styles.userMessage : styles.aiMessage,
        item.isTyping && styles.typingMessage,
      ]}>
        {!item.isUser && (
          <View style={styles.aiIcon}>
            <Ionicons name="sparkles" size={16} color={colors.primary[400]} />
          </View>
        )}
        
        <Text style={[
          styles.messageText,
          item.isUser ? styles.userMessageText : styles.aiMessageText,
          item.isTyping && styles.typingText,
        ]}>
          {item.text}
        </Text>
        
        <Text style={[
          styles.timestamp,
          item.isUser ? styles.userTimestamp : styles.aiTimestamp,
        ]}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  const renderSuggestedQuestions = () => (
    <View style={styles.suggestionsContainer}>
      <Text style={styles.suggestionsTitle}>Suggested Questions</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestionsList}>
        {suggestedQuestions.map((question, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestionButton}
            onPress={() => sendMessage(question)}>
            <Text style={styles.suggestionText}>{question}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="chatbubble-ellipses" size={24} color={colors.primary[400]} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>AI Nutrition Coach</Text>
          <Text style={styles.headerSubtitle}>
            Ask me anything about SugarPoints and nutrition
          </Text>
        </View>
      </View>

      {/* Messages */}
      <View style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-ellipses-outline" size={64} color={colors.neutral[300]} />
            <Text style={styles.emptyTitle}>Start a conversation</Text>
            <Text style={styles.emptySubtitle}>
              Ask questions about nutrition, SugarPoints, or healthy eating habits
            </Text>
          </View>
        ) : (
          <FlatList
            ref={scrollViewRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }}
          />
        )}
      </View>

      {/* Suggested Questions (only show when no messages or few messages) */}
      {messages.length <= 1 && renderSuggestedQuestions()}

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about nutrition, SugarPoints, or healthy eating..."
            placeholderTextColor={colors.text.tertiary}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage()}
            editable={!loading}
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || loading) && styles.sendButtonDisabled,
            ]}
            onPress={() => sendMessage()}
            disabled={!inputText.trim() || loading}>
            <Ionicons
              name={loading ? "hourglass" : "send"}
              size={20}
              color={(!inputText.trim() || loading) ? colors.text.tertiary : colors.primary[400]}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: layout.screenPadding,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },

  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },

  headerText: {
    flex: 1,
  },

  headerTitle: {
    ...typography.titleLarge,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },

  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },

  // Messages
  messagesContainer: {
    flex: 1,
  },

  messagesList: {
    flex: 1,
  },

  messagesContent: {
    padding: layout.screenPadding,
    paddingBottom: spacing.xl,
  },

  messageContainer: {
    marginBottom: spacing.lg,
  },

  userMessageContainer: {
    alignItems: 'flex-end',
  },

  aiMessageContainer: {
    alignItems: 'flex-start',
  },

  messageBubble: {
    maxWidth: '80%',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    position: 'relative',
  },

  userMessage: {
    backgroundColor: colors.primary[400],
    borderBottomRightRadius: borderRadius.sm,
  },

  aiMessage: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderBottomLeftRadius: borderRadius.sm,
  },

  typingMessage: {
    backgroundColor: colors.neutral[100],
  },

  aiIcon: {
    position: 'absolute',
    top: -8,
    left: spacing.md,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },

  messageText: {
    ...typography.bodyMedium,
    lineHeight: 22,
  },

  userMessageText: {
    color: colors.neutral[0],
  },

  aiMessageText: {
    color: colors.text.primary,
  },

  typingText: {
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },

  timestamp: {
    ...typography.labelSmall,
    marginTop: spacing.xs,
  },

  userTimestamp: {
    color: colors.neutral[200],
    textAlign: 'right',
  },

  aiTimestamp: {
    color: colors.text.tertiary,
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },

  emptyTitle: {
    ...typography.headlineSmall,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },

  emptySubtitle: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Suggested Questions
  suggestionsContainer: {
    padding: layout.screenPadding,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.surface,
  },

  suggestionsTitle: {
    ...typography.labelLarge,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },

  suggestionsList: {
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },

  suggestionButton: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },

  suggestionText: {
    ...typography.bodyMedium,
    color: colors.primary[400],
    textAlign: 'center',
  },

  // Input
  inputContainer: {
    padding: layout.screenPadding,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    maxHeight: 120,
  },

  textInput: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.md,
    maxHeight: 100,
  },

  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendButtonDisabled: {
    backgroundColor: colors.neutral[100],
  },
});