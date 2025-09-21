import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { colors, typography, spacing, layout, touchTargets, borderRadius } from '@/design-system';
import { Button, Card, FoodEntryCard } from '@/design-system/components';

const { width: screenWidth } = Dimensions.get('window');

interface RecognitionResult {
  id: string;
  name: string;
  confidence: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  protein_per_100g: number;
  estimated_weight: number;
  category: string;
}

export default function ScannerScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recognitionResults, setRecognitionResults] = useState<RecognitionResult[]>([]);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

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
          'We couldn\'t identify any food in this image. Try taking another photo with better lighting or add the food manually.',
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
        'Food recognition service is temporarily unavailable. You can add foods manually.',
        [
          { text: 'Try Again', onPress: () => setImage(null) },
          { text: 'Add Manually', onPress: () => router.push('/(modals)/add-entry') },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFoodSelect = (food: RecognitionResult) => {
    // Calculate SugarPoints from carbs
    const sugarPoints = Math.round(food.carbs_per_100g);
    const sugarPointBlocks = Math.round(sugarPoints / 6);
    
    // Navigate to add entry with pre-filled data
    router.push({
      pathname: '/(modals)/add-entry',
      params: {
        foodName: food.name,
        carbs_per_100g: food.carbs_per_100g.toString(),
        fat_per_100g: food.fat_per_100g.toString(),
        protein_per_100g: food.protein_per_100g.toString(),
        portionSize: food.estimated_weight.toString(),
        source: 'scan',
      },
    });
  };

  const renderCameraInterface = () => (
    <View style={styles.cameraInterface}>
      <Card variant="elevated" style={styles.instructionCard}>
        <Ionicons name="camera-outline" size={64} color={colors.primary[400]} />
        <Text style={styles.instructionTitle}>Scan Your Food</Text>
        <Text style={styles.instructionText}>
          Take a photo of your food and we'll identify it automatically using AI
        </Text>
        
        <View style={styles.cameraActions}>
          <Button
            title="Take Photo"
            onPress={takePicture}
            icon="camera"
            size="large"
            style={styles.cameraButton}
          />
          
          <Button
            title="Choose from Gallery"
            variant="outline"
            onPress={selectFromGallery}
            icon="images"
            size="large"
            style={styles.galleryButton}
          />
        </View>
      </Card>

      {/* Tips Card */}
      <Card variant="outlined" style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>📸 Photo Tips</Text>
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <Ionicons name="sunny-outline" size={16} color={colors.primary[400]} />
            <Text style={styles.tipText}>Use good lighting</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="resize-outline" size={16} color={colors.primary[400]} />
            <Text style={styles.tipText}>Fill the frame with food</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="eye-outline" size={16} color={colors.primary[400]} />
            <Text style={styles.tipText}>Keep food clearly visible</Text>
          </View>
        </View>
      </Card>
    </View>
  );

  const renderImagePreview = () => (
    <View style={styles.imagePreview}>
      <Card variant="outlined" style={styles.imageCard}>
        <Image source={{ uri: image }} style={styles.previewImage} />
        <View style={styles.imageActions}>
          <Button
            title="Retake"
            variant="outline"
            onPress={() => {
              setImage(null);
              setRecognitionResults([]);
            }}
            icon="camera"
            style={styles.retakeButton}
          />
          
          <Button
            title="Add Manually"
            variant="ghost"
            onPress={() => router.push('/(modals)/add-entry')}
            icon="create"
            style={styles.manualButton}
          />
        </View>
      </Card>
    </View>
  );

  const renderRecognitionResults = () => (
    <View style={styles.resultsContainer}>
      <Text style={styles.resultsTitle}>
        {recognitionResults.length > 0 ? 'Foods Detected' : 'Processing...'}
      </Text>
      
      {recognitionResults.length > 0 ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {recognitionResults.map((food) => {
            const sugarPoints = Math.round(food.carbs_per_100g);
            const sugarPointBlocks = Math.round(sugarPoints / 6);
            
            return (
              <FoodEntryCard
                key={food.id}
                food={{
                  id: food.id,
                  name: food.name,
                  sugar_points: sugarPoints,
                  sugar_point_blocks: sugarPointBlocks,
                  carbs_per_100g: food.carbs_per_100g,
                  fat_per_100g: food.fat_per_100g,
                  protein_per_100g: food.protein_per_100g,
                  portion_size: food.estimated_weight,
                  source: 'scan',
                  confidence: food.confidence,
                }}
                onPress={() => handleFoodSelect(food)}
                accessibilityLabel={`Add ${food.name} to food log`}
              />
            );
          })}
        </ScrollView>
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
          <Text style={styles.loadingText}>
            Analyzing your food with AI...
          </Text>
        </View>
      ) : null}
    </View>
  );

  if (permissionGranted === false) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.permissionContainer}>
          <Card variant="outlined" style={styles.permissionCard}>
            <Ionicons name="camera-outline" size={64} color={colors.neutral[400]} />
            <Text style={styles.permissionTitle}>Camera Access Required</Text>
            <Text style={styles.permissionText}>
              SugarDrop needs camera access to scan and identify foods automatically.
            </Text>
            <Button
              title="Enable Camera"
              onPress={requestPermission}
              icon="camera"
              style={styles.permissionButton}
            />
          </Card>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Food Scanner</Text>
          <Text style={styles.subtitle}>
            AI-powered food recognition for instant SugarPoints tracking
          </Text>
        </View>

        {/* Main Content */}
        {!image && renderCameraInterface()}
        {image && !loading && recognitionResults.length === 0 && renderImagePreview()}
        {image && (loading || recognitionResults.length > 0) && renderRecognitionResults()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

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
    marginBottom: spacing.sm,
  },

  subtitle: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Permission Screen
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: layout.screenPadding,
  },

  permissionCard: {
    alignItems: 'center',
    padding: spacing.xxl,
  },

  permissionTitle: {
    ...typography.headlineSmall,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },

  permissionText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },

  permissionButton: {
    minWidth: 200,
  },

  // Camera Interface
  cameraInterface: {
    gap: spacing.xl,
  },

  instructionCard: {
    alignItems: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[100],
  },

  instructionTitle: {
    ...typography.headlineMedium,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },

  instructionText: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },

  cameraActions: {
    gap: spacing.lg,
    alignSelf: 'stretch',
  },

  cameraButton: {
    minHeight: touchTargets.large,
  },

  galleryButton: {
    minHeight: touchTargets.large,
  },

  // Tips Card
  tipsCard: {
    backgroundColor: colors.neutral[50],
  },

  tipsTitle: {
    ...typography.titleLarge,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },

  tipsList: {
    gap: spacing.md,
  },

  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  tipText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    flex: 1,
  },

  // Image Preview
  imagePreview: {
    gap: spacing.lg,
  },

  imageCard: {
    padding: 0,
    overflow: 'hidden',
  },

  previewImage: {
    width: '100%',
    height: screenWidth - 32, // Square image
    resizeMode: 'cover',
  },

  imageActions: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },

  retakeButton: {
    flex: 1,
  },

  manualButton: {
    flex: 1,
  },

  // Recognition Results
  resultsContainer: {
    gap: spacing.lg,
  },

  resultsTitle: {
    ...typography.headlineSmall,
    color: colors.text.primary,
    textAlign: 'center',
  },

  loadingContainer: {
    alignItems: 'center',
    padding: spacing.xxl,
  },

  loadingText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});