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
import AnimatedNavigationModal from '@/components/AnimatedNavigationModal';

const navigationItems = [
  { key: 'log_food', title: 'Log Food', icon: 'restaurant-outline', route: '/(modals)/add-entry', description: 'Add meal manually' },
  { key: 'scan_food', title: 'Scan Food', icon: 'camera-outline', route: '/(tabs)/scanner', description: 'Camera recognition' },
  { key: 'search_food', title: 'Search Foods', icon: 'search-outline', route: '/(tabs)/search', description: 'Browse database' },
  { key: 'progress', title: 'Progress', icon: 'analytics-outline', route: '/(tabs)/progress', description: 'View your stats' },
  { key: 'home', title: 'Home', icon: 'home-outline', route: '/(tabs)/home', description: 'Back to dashboard' }
];

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
  "Which snacks are lowest in SugarPoints?",
  "How do I read nutrition labels?",
];

export default function AIChatScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);

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

  const handleNavigationPress = (route: string) => {
    setShowNavigation(false);
    setTimeout(() => router.push(route), 100);
  };

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

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Coach</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Messages */}
      <View style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-ellipses-outline" size={64} color="#cccccc" />
            <Text style={styles.emptyTitle}>Start a conversation</Text>
            <Text style={styles.emptySubtitle}>
              Ask questions about nutrition, SugarPoints, or healthy eating habits
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }}
          />
        )}
      </View>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
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
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about nutrition, SugarPoints, or healthy eating..."
            placeholderTextColor="#999999"
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
              color={(!inputText.trim() || loading) ? "#cccccc" : "#4A90E2"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Plus Button */}
      <TouchableOpacity
        style={[styles.floatingButton, { bottom: insets.bottom + 100 }]} // Higher position to avoid input
        onPress={() => setShowNavigation(true)}>
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>

      {/* Navigation Modal */}
      <AnimatedNavigationModal
        visible={showNavigation}
        onClose={() => setShowNavigation(false)}
        onNavigate={handleNavigationPress}
        items={navigationItems}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },

  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },

  headerSpacer: {
    width: 44,
  },

  // Messages
  messagesContainer: {
    flex: 1,
  },

  messagesList: {
    flex: 1,
  },

  messagesContent: {
    padding: 24,
    paddingBottom: 16,
  },

  messageContainer: {
    marginBottom: 16,
  },

  userMessageContainer: {
    alignItems: 'flex-end',
  },

  aiMessageContainer: {
    alignItems: 'flex-start',
  },

  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 16,
  },

  userMessage: {
    backgroundColor: '#000000',
    borderBottomRightRadius: 4,
  },

  aiMessage: {
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: 4,
  },

  typingMessage: {
    backgroundColor: '#f0f0f0',
  },

  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },

  userMessageText: {
    color: '#ffffff',
  },

  aiMessageText: {
    color: '#000000',
  },

  typingText: {
    color: '#666666',
    fontStyle: 'italic',
  },

  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },

  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },

  aiTimestamp: {
    color: '#999999',
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },

  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Suggested Questions
  suggestionsContainer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },

  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },

  suggestionsList: {
    gap: 8,
    paddingHorizontal: 8,
  },

  suggestionButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  suggestionText: {
    fontSize: 14,
    color: '#4A90E2',
    textAlign: 'center',
  },

  // Input
  inputContainer: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 120,
  },

  textInput: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
    marginRight: 12,
    maxHeight: 100,
  },

  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendButtonDisabled: {
    backgroundColor: '#f5f5f5',
  },

  // Floating Button
  floatingButton: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});