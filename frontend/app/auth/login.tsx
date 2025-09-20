import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoadingSpinner from '@/components/LoadingSpinner';
import { colors, typography, spacing, layout, touchTargets, borderRadius } from '@/design-system';
import { Button, Card } from '@/design-system/components';

export default function LoginScreen() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.detail || 'Invalid credentials'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <LoadingSpinner />
      </View>
    );
  }

  const containerStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  const scrollContentStyle = {
    flexGrow: 1,
    padding: 24,
    paddingTop: insets.top + 40,
  };

  const inputStyle = {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    color: colors.text,
  };

  const buttonStyle = {
    height: 52,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 24,
    backgroundColor: colors.primary,
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="water" size={40} color={colors.primary[400]} />
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to continue tracking your SugarPoints
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Email input"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={colors.text.tertiary}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Password input"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.text.tertiary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <Button
            title="Sign In"
            onPress={handleLogin}
            disabled={loading}
            loading={loading}
            size="large"
            fullWidth
            style={styles.loginButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Create New Account"
            variant="outline"
            onPress={() => router.push('/auth/register')}
            size="large"
            fullWidth
          />
        </View>

        {/* Demo Credentials */}
        <Card variant="outlined" style={styles.demoCard}>
          <Text style={styles.demoTitle}>Demo Account</Text>
          <Text style={styles.demoText}>
            Email: demo@sugardrop.com{'\n'}
            Password: demo123
          </Text>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  registerButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  demoContainer: {
    borderRadius: 12,
    padding: 16,
    marginTop: 'auto',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});