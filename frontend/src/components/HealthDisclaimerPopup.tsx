import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, layout, touchTargets, borderRadius } from '@/design-system';
import { Button, Card } from '@/design-system/components';

const DISCLAIMER_STORAGE_KEY = 'health_disclaimer_acknowledged';

interface HealthDisclaimerProps {
  onAcknowledge?: () => void;
}

export default function HealthDisclaimerPopup({ onAcknowledge }: HealthDisclaimerProps) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkDisclaimerStatus();
  }, []);

  const checkDisclaimerStatus = async () => {
    try {
      const acknowledged = await AsyncStorage.getItem(DISCLAIMER_STORAGE_KEY);
      if (!acknowledged) {
        setVisible(true);
      }
    } catch (error) {
      console.error('Error checking disclaimer status:', error);
      // Show disclaimer on error to be safe
      setVisible(true);
    }
  };

  const handleAcknowledge = async () => {
    setLoading(true);
    try {
      await AsyncStorage.setItem(DISCLAIMER_STORAGE_KEY, 'true');
      setVisible(false);
      onAcknowledge?.();
    } catch (error) {
      console.error('Error storing disclaimer acknowledgment:', error);
      Alert.alert('Error', 'Failed to save acknowledgment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Card variant="elevated" style={styles.disclaimerCard}>
            {/* Warning Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="warning" size={48} color={colors.warning[400]} />
            </View>

            {/* Header */}
            <Text style={styles.title}>Welcome to SugarDrop</Text>
            
            {/* Content */}
            <Text style={styles.subtitle}>
              The SugarDrop app is for information and healthy lifestyle support only.
            </Text>
            
            <Text style={styles.content}>
              Following a SugarDrop diet can lower your{' '}
              <Text style={styles.highlight}>blood sugar</Text> and{' '}
              <Text style={styles.highlight}>blood pressure</Text>.
            </Text>
            
            <Text style={styles.recommendation}>
              👉 Please monitor regularly and{' '}
              <Text style={styles.highlight}>consult your doctor</Text>{' '}
              before adjusting medication.
            </Text>

            {/* Acknowledgment Button */}
            <Button
              title="✅ I Understand"
              onPress={handleAcknowledge}
              disabled={loading}
              loading={loading}
              size="large"
              fullWidth
              style={styles.acknowledgeButton}
            />
          </Card>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: layout.screenPadding,
  },

  container: {
    width: '100%',
    maxWidth: 400,
  },

  disclaimerCard: {
    padding: spacing.xxl,
    backgroundColor: colors.surface,
    borderColor: colors.warning[200],
    borderWidth: 2,
  },

  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  title: {
    ...typography.headlineLarge,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontWeight: '700',
  },

  subtitle: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },

  content: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },

  recommendation: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xxl,
  },

  highlight: {
    color: colors.text.primary,
    fontWeight: '600',
  },

  acknowledgeButton: {
    backgroundColor: colors.success[400],
  },
});