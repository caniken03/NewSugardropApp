import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';
import AnimatedNavigationModal from '@/components/AnimatedNavigationModal';

const navigationItems = [
  { key: 'log_food', title: 'Log Food', icon: 'restaurant-outline', route: '/(modals)/add-entry', description: 'Add meal manually' },
  { key: 'search_food', title: 'Search Foods', icon: 'search-outline', route: '/(tabs)/search', description: 'Browse database' },
  { key: 'ai_coach', title: 'AI Coach', icon: 'chatbubble-ellipses-outline', route: '/(tabs)/aichat', description: 'Get nutrition advice' },
  { key: 'progress', title: 'Progress', icon: 'analytics-outline', route: '/(tabs)/progress', description: 'View your stats' },
  { key: 'home', title: 'Home', icon: 'home-outline', route: '/(tabs)/home', description: 'Back to dashboard' }
];

export default function ScannerScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recognitionResults, setRecognitionResults] = useState<any[]>([]);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [showNavigation, setShowNavigation] = useState(false);

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    setPermissionGranted(status === 'granted');
  };

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status === 'granted') {
      setPermissionGranted(true);
    } else {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera access in your device settings to scan foods.'
      );
    }
  };

  const takePicture = async () => {
    if (!permissionGranted) {
      await requestPermission();
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setImage(asset.uri);
        
        if (asset.base64) {
          await recognizeFood(asset.base64);
        }
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Camera Error', 'Failed to take picture. Please try again.');
    }
  };

  const selectFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setImage(asset.uri);
        
        if (asset.base64) {
          await recognizeFood(asset.base64);
        }
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Gallery Error', 'Failed to select image. Please try again.');
    }
  };

  const recognizeFood = async (base64Image: string) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/food/recognize', {
        image_base64: base64Image,
      });

      const results = response.data.results || [];
      setRecognitionResults(results);

      if (results.length === 0) {
        Alert.alert(
          'No Food Detected',
          'We couldn\'t identify any food in this image. Try taking another photo with better lighting.',
          [
            { text: 'Try Again', onPress: () => setImage(null) },
            { text: 'Add Manually', onPress: () => router.push('/(modals)/add-entry') },
          ]
        );
      }
    } catch (error) {
      console.error('Error recognizing food:', error);
      Alert.alert(
        'Recognition Failed',
        'Food recognition service is temporarily unavailable.',
        [
          { text: 'Try Again', onPress: () => setImage(null) },
          { text: 'Add Manually', onPress: () => router.push('/(modals)/add-entry') },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNavigationPress = (route: string) => {
    setShowNavigation(false);
    setTimeout(() => router.push(route), 100);
  };

  const handleFoodSelect = (food: any) => {
    const sugarPoints = Math.round(food.carbs_per_100g || 0);
    
    router.push({
      pathname: '/(modals)/add-entry',
      params: {
        foodName: food.name,
        carbs_per_100g: food.carbs_per_100g?.toString() || '0',
        fat_per_100g: food.fat_per_100g?.toString() || '0',
        protein_per_100g: food.protein_per_100g?.toString() || '0',
        portionSize: food.estimated_weight?.toString() || '100',
        source: 'scan',
      },
    });
  };

  if (permissionGranted === false) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Food Scanner</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color="#cccccc" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            SugarDrop needs camera access to scan and identify foods automatically.
          </Text>
          <TouchableOpacity style={styles.enableButton} onPress={requestPermission}>
            <Text style={styles.enableButtonText}>Enable Camera</Text>
          </TouchableOpacity>
        </View>

        {/* Floating Plus Button */}
        <TouchableOpacity
          style={[styles.floatingButton, { bottom: insets.bottom + 24 }]}
          onPress={() => setShowNavigation(true)}>
          <Ionicons name="add" size={28} color="#ffffff" />
        </TouchableOpacity>

        <AnimatedNavigationModal
          visible={showNavigation}
          onClose={() => setShowNavigation(false)}
          onNavigate={handleNavigationPress}
          items={navigationItems}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Food Scanner</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {!image ? (
          // Camera Interface
          <View style={styles.cameraSection}>
            <View style={styles.instructionCard}>
              <Ionicons name="camera-outline" size={64} color="#4A90E2" />
              <Text style={styles.instructionTitle}>Scan Your Food</Text>
              <Text style={styles.instructionText}>
                Take a photo of your food and we'll identify it automatically using AI
              </Text>
              
              <View style={styles.cameraActions}>
                <TouchableOpacity style={styles.cameraButton} onPress={takePicture}>
                  <Ionicons name="camera" size={24} color="#ffffff" />
                  <Text style={styles.cameraButtonText}>Take Photo</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.galleryButton} onPress={selectFromGallery}>
                  <Ionicons name="images-outline" size={24} color="#4A90E2" />
                  <Text style={styles.galleryButtonText}>Choose from Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Tips */}
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>📸 Photo Tips</Text>
              <View style={styles.tipsList}>
                <Text style={styles.tipText}>• Use good lighting</Text>
                <Text style={styles.tipText}>• Fill the frame with food</Text>
                <Text style={styles.tipText}>• Keep food clearly visible</Text>
              </View>
            </View>
          </View>
        ) : (
          // Results Section
          <View style={styles.resultsSection}>
            <View style={styles.imagePreview}>
              <Image source={{ uri: image }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={() => {
                  setImage(null);
                  setRecognitionResults([]);
                }}>
                <Text style={styles.retakeText}>Retake Photo</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Analyzing your food with AI...</Text>
              </View>
            ) : recognitionResults.length > 0 ? (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>Foods Detected</Text>
                
                {recognitionResults.map((food) => (
                  <TouchableOpacity
                    key={food.id}
                    style={styles.resultItem}
                    onPress={() => handleFoodSelect(food)}>
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>{food.name}</Text>
                      <Text style={styles.resultDetails}>
                        {Math.round(food.carbs_per_100g || 0)} SugarPoints • {Math.round((food.confidence || 0) * 100)}% confidence
                      </Text>
                    </View>
                    <View style={styles.resultSugarPoints}>
                      <Text style={styles.resultPoints}>{Math.round(food.carbs_per_100g || 0)}</Text>
                      <Text style={styles.resultPointsLabel}>SP</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* Floating Plus Button */}
      <TouchableOpacity
        style={[styles.floatingButton, { bottom: insets.bottom + 24 }]}
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
    </View>
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

  scrollView: {
    flex: 1,
  },

  // Permission Screen
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  permissionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },

  permissionText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },

  enableButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
  },

  enableButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Camera Section
  cameraSection: {
    padding: 24,
  },

  instructionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },

  instructionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },

  instructionText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },

  cameraActions: {
    gap: 16,
    width: '100%',
  },

  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },

  cameraButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },

  galleryButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },

  // Tips
  tipsCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
  },

  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },

  tipsList: {
    gap: 8,
  },

  tipText: {
    fontSize: 14,
    color: '#666666',
  },

  // Results Section
  resultsSection: {
    padding: 24,
  },

  imagePreview: {
    alignItems: 'center',
    marginBottom: 24,
  },

  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
  },

  retakeButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },

  retakeText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
  },

  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },

  loadingText: {
    fontSize: 16,
    color: '#666666',
  },

  resultsContainer: {
    marginTop: 16,
  },

  resultsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },

  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 8,
  },

  resultInfo: {
    flex: 1,
  },

  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },

  resultDetails: {
    fontSize: 14,
    color: '#666666',
  },

  resultSugarPoints: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 8,
    minWidth: 48,
  },

  resultPoints: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },

  resultPointsLabel: {
    fontSize: 10,
    color: '#666666',
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