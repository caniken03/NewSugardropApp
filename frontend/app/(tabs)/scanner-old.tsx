import React, { useState, useRef } from 'react';
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
import { router } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { apiClient } from '../../src/services/api';
import AuthGuard from '../../src/components/AuthGuard';
import LoadingSpinner from '../../src/components/LoadingSpinner';

export default function ScannerScreen() {
  return (
    <AuthGuard>
      <ScannerContent />
    </AuthGuard>
  );
}

function ScannerContent() {
  const { colors } = useTheme();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need camera roll permissions to analyze food images.'
      );
      return false;
    }
    return true;
  };

  const takePicture = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  const selectFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  const analyzeImage = async (imageUri: string) => {
    setLoading(true);
    try {
      // Convert image to base64
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1]; // Remove data:image/jpeg;base64, prefix
          
          // Send to Passio AI for recognition
          const apiResponse = await apiClient.post('/food/recognize', {
            image_base64: base64Data
          });
          
          const recognitionResults = apiResponse.data.results || [];
          
          if (recognitionResults.length > 0) {
            setAnalysisResult({
              detectedFoods: recognitionResults.map((food: any) => ({
                name: food.name,
                confidence: food.confidence,
                sugar_per_100g: food.sugar_per_100g,
                calories_per_100g: food.calories_per_100g,
                estimated_weight: food.estimated_weight || 100,
                category: food.category,
                passio_id: food.id
              }))
            });
          } else {
            // Fallback to mock data if no recognition results
            const mockResult = {
              detectedFoods: [
                {
                  name: 'Unknown Food',
                  confidence: 0.5,
                  sugar_per_100g: 5.0,
                  calories_per_100g: 100,
                  estimated_weight: 100,
                  category: 'General'
                },
              ],
            };
            setAnalysisResult(mockResult);
          }
        } catch (error) {
          console.error('Food recognition error:', error);
          Alert.alert('Recognition Failed', 'Could not identify the food. Please try again.');
          setAnalysisResult(null);
        }
      };
      
      reader.readAsDataURL(blob);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to process image. Please try again.');
      console.error('Image processing error:', error);
      setAnalysisResult(null);
    } finally {
      setLoading(false);
    }
  };

  const addDetectedFood = (food: any) => {
    router.push({
      pathname: '/(modals)/add-entry',
      params: {
        foodName: food.name,
        sugarPer100g: food.sugar_per_100g.toString(),
        caloriesPer100g: food.calories_per_100g.toString(),
        portionSize: food.estimated_weight.toString(),
      },
    });
  };

  const retakePicture = () => {
    setImage(null);
    setAnalysisResult(null);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Analyzing your food image...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!image ? (
          // Camera Interface
          <View style={styles.cameraContainer}>
            <View style={[styles.placeholder, { backgroundColor: colors.surface }]}>
              <Ionicons name="camera" size={64} color={colors.textSecondary} />
              <Text style={[styles.placeholderTitle, { color: colors.text }]}>
                Scan Your Food
              </Text>
              <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                Take a photo or select from gallery to identify food and get nutrition info
              </Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={takePicture}>
                <Ionicons name="camera" size={24} color="#ffffff" />
                <Text style={styles.actionButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.surface }]}
                onPress={selectFromGallery}>
                <Ionicons name="images" size={24} color={colors.text} />
                <Text style={[styles.actionButtonText, { color: colors.text }]}>
                  From Gallery
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tips */}
            <View style={[styles.tipsContainer, { backgroundColor: colors.surface }]}>
              <Text style={[styles.tipsTitle, { color: colors.text }]}>
                📸 Photography Tips
              </Text>
              <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
                • Ensure good lighting{'\n'}
                • Keep food clearly visible{'\n'}
                • Avoid shadows and glare{'\n'}
                • Include the entire food item
              </Text>
            </View>
          </View>
        ) : (
          // Analysis Results
          <View style={styles.resultsContainer}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.capturedImage} />
              <TouchableOpacity
                style={[styles.retakeButton, { backgroundColor: colors.surface }]}
                onPress={retakePicture}>
                <Ionicons name="camera" size={20} color={colors.text} />
                <Text style={[styles.retakeButtonText, { color: colors.text }]}>
                  Retake
                </Text>
              </TouchableOpacity>
            </View>

            {analysisResult && (
              <View style={styles.analysis}>
                <Text style={[styles.analysisTitle, { color: colors.text }]}>
                  🤖 AI Analysis Results
                </Text>

                {analysisResult.detectedFoods.map((food: any, index: number) => (
                  <View
                    key={index}
                    style={[styles.foodCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.foodHeader}>
                      <View style={styles.foodInfo}>
                        <Text style={[styles.foodName, { color: colors.text }]}>
                          {food.name}
                        </Text>
                        <Text style={[styles.confidence, { color: colors.textSecondary }]}>
                          {Math.round(food.confidence * 100)}% confidence
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: colors.primary }]}
                        onPress={() => addDetectedFood(food)}>
                        <Ionicons name="add" size={20} color="#ffffff" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.nutritionGrid}>
                      <View style={styles.nutritionItem}>
                        <Text style={[styles.nutritionValue, { color: colors.primary }]}>
                          {food.sugar_per_100g}g
                        </Text>
                        <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>
                          Sugar/100g
                        </Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={[styles.nutritionValue, { color: colors.text }]}>
                          {food.calories_per_100g}
                        </Text>
                        <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>
                          Calories/100g
                        </Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={[styles.nutritionValue, { color: colors.text }]}>
                          {food.estimated_weight}g
                        </Text>
                        <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>
                          Est. Weight
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.logButton, { backgroundColor: colors.primary }]}
                      onPress={() => addDetectedFood(food)}>
                      <Text style={styles.logButtonText}>Log This Food</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  cameraContainer: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginBottom: 24,
    minHeight: 300,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContainer: {
    borderRadius: 12,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  resultsContainer: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  capturedImage: {
    width: '100%',
    height: 300,
    borderRadius: 16,
  },
  retakeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  retakeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  analysis: {
    flex: 1,
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  foodCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  confidence: {
    fontSize: 14,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  nutritionLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  logButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});