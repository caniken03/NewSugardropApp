import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="water" size={48} color="#6366f1" />
        </View>
        <Text style={styles.title}>SugarDrop</Text>
        <Text style={styles.subtitle}>
          AI-Powered Sugar Intake Tracking
        </Text>
      </View>

      <View style={styles.features}>
        <View style={styles.featureItem}>
          <Ionicons name="restaurant" size={24} color="#6366f1" />
          <Text style={styles.featureText}>Track food & sugar intake</Text>
        </View>
        
        <View style={styles.featureItem}>
          <Ionicons name="camera" size={24} color="#6366f1" />
          <Text style={styles.featureText}>AI-powered food recognition</Text>
        </View>
        
        <View style={styles.featureItem}>
          <Ionicons name="chatbubble-ellipses" size={24} color="#6366f1" />
          <Text style={styles.featureText}>Personal nutrition coach</Text>
        </View>
        
        <View style={styles.featureItem}>
          <Ionicons name="analytics" size={24} color="#6366f1" />
          <Text style={styles.featureText}>Progress analytics</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/auth/login')}>
          <Text style={styles.primaryButtonText}>Sign In</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/auth/register')}>
          <Text style={styles.secondaryButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.demoText}>
        Demo: demo@sugardrop.com / demo123
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#a1a1aa',
    textAlign: 'center',
  },
  features: {
    marginBottom: 48,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 16,
  },
  actions: {
    gap: 16,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: '#27272a',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
  demoText: {
    fontSize: 14,
    color: '#a1a1aa',
    textAlign: 'center',
  },
});