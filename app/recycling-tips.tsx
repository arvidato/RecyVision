import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Pressable, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getRecyclingInstructions } from '../services/recyclingInstructions';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';
import { config } from './config';

const { width } = Dimensions.get('window');

// Uses the same Class Mapping in the Dataset
const CLASS_MAPPING: { [key: string]: string } = {
  '0': 'aerosol_cans',
  '1': 'aluminum_food_cans',
  '2': 'aluminum_soda_cans',
  '3': 'cardboard_boxes',
  '4': 'cardboard_packaging',
  '5': 'clothing',
  '6': 'coffee_grounds',
  '7': 'disposable_plastic_cutlery',
  '8': 'eggshells',
  '9': 'food_waste',
  '10': 'glass_beverage_bottles',
  '11': 'glass_cosmetic_containers',
  '12': 'glass_food_jars',
  '13': 'magazines',
  '14': 'newspaper',
  '15': 'office_paper',
  '16': 'paper_cups',
  '17': 'plastic_cup_lids',
  '18': 'plastic_detergent_bottles',
  '19': 'plastic_food_containers',
  '20': 'plastic_shopping_bags',
  '21': 'plastic_soda_bottles',
  '22': 'plastic_straws',
  '23': 'plastic_trash_bags',
  '24': 'plastic_water_bottles',
  '25': 'shoes',
  '26': 'steel_food_cans',
  '27': 'styrofoam_cups',
  '28': 'styrofoam_food_containers',
  '29': 'tea_bags',
  '30': 'unknown'
};

interface Prediction {
  prediction: string;
  confidence: number;
  explanation?: string;
  points?: number;
  category?: string;
}

export default function RecyclingTips() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showCustomModel, setShowCustomModel] = useState(false);
  const [customPrediction, setCustomPrediction] = useState<Prediction | null>(null);
  const [isLoadingCustom, setIsLoadingCustom] = useState(false);

  const params = useLocalSearchParams<{
    imageUri: string;
    prediction: string;
    model: 'custom' | 'gemini';
  }>();

  const prediction: Prediction = JSON.parse(params.prediction);
  const classId = Object.entries(CLASS_MAPPING).find(([_, value]) => value === prediction.prediction)?.[0];
  const instructions = classId ? getRecyclingInstructions(parseInt(classId)) : null;

  const handleViewCustomModel = async () => {
    if (!params.imageUri) return;
    
    setIsLoadingCustom(true);
    try {
      const formData = new FormData();
      const filename = params.imageUri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: params.imageUri,
        name: filename,
        type: type
      } as any);

      const response = await fetch(`${config.API_URL}${config.API_ENDPOINTS.PREDICT}`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (!response.ok) {
        throw new Error('Custom model prediction failed');
      }

      const data = await response.json();
      
      // Navigate to a new recycling tips page with custom model results
      router.push({
        pathname: '/recycling-tips',
        params: {
          imageUri: params.imageUri,
          prediction: JSON.stringify({
            prediction: data.prediction,
            confidence: data.confidence || 1
          }),
          model: 'custom'
        }
      });
    } catch (error) {
      console.error("Error getting custom model prediction:", error);
      Alert.alert(
        "Error",
        "Failed to get custom model prediction. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoadingCustom(false);
    }
  };

  const handleOfflineMode = async () => {
    if (!params.imageUri) return;
    
    try {
      const formData = new FormData();
      const filename = params.imageUri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: params.imageUri,
        name: filename,
        type: type
      } as any);

      const response = await fetch(`${config.API_URL}${config.API_ENDPOINTS.PREDICT}`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (!response.ok) {
        throw new Error('Custom model prediction failed');
      }

      const data = await response.json();
      
      router.push({
        pathname: '/recycling-tips',
        params: {
          imageUri: params.imageUri,
          prediction: JSON.stringify({
            prediction: data.prediction,
            confidence: data.confidence || 1,
            explanation: 'Offline mode - using local model prediction'
          }),
          model: 'offline'
        }
      });
    } catch (error) {
      console.error("Error getting offline prediction:", error);
      Alert.alert(
        "Error",
        "Failed to get offline prediction. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const renderUnknownContent = () => (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: params.imageUri }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.predictionContainer}>
        <Text style={styles.predictionTitle}>Prediction</Text>
        <Text style={styles.predictionText}>Unknown Item</Text>
        <Text style={styles.confidenceText}>
          Confidence: {Math.round(prediction.confidence * 100)}%
        </Text>
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.sectionTitle}>How to Handle Unknown Items</Text>
        
        <View style={styles.instructionSection}>
          <Text style={styles.instructionTitle}>Check for Recycling Symbols</Text>
          <Text style={styles.instructionText}>
            • Look for any recycling symbols or numbers on the item{'\n'}
            • Check for material type indicators (plastic, metal, paper, etc.){'\n'}
            • Note any specific disposal instructions
          </Text>
        </View>

        <View style={styles.instructionSection}>
          <Text style={styles.instructionTitle}>Identify Materials</Text>
          <Text style={styles.instructionText}>
            • Take note of the item's main material{'\n'}
            • Check if it can be disassembled into recyclable parts{'\n'}
            • Look for any hazardous material warnings
          </Text>
        </View>

        <View style={styles.instructionSection}>
          <Text style={styles.instructionTitle}>Next Steps</Text>
          <Text style={styles.instructionText}>
            • Contact your local recycling center for guidance{'\n'}
            • Check if there are special recycling programs for this type of item{'\n'}
            • Consider if the item can be reused or repurposed
          </Text>
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tips</Text>
          <Text style={styles.tipsText}>
            • Take photos of any recycling symbols or labels{'\n'}
            • Keep the item separate from other recyclables{'\n'}
            • When in doubt, contact local recycling authorities
          </Text>
        </View>
      </View>
    </View>
  );

  if (!instructions) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {prediction.prediction === 'unknown' ? (
          renderUnknownContent()
        ) : (
          <View style={styles.container}>
            <Text style={styles.title}>Unknown Material</Text>
            <Text style={styles.instructionText}>We couldn't determine the recycling instructions for this item.</Text>
            <Pressable 
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.closeButton,
                { opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <Text style={styles.closeButtonText}>Go Back</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#82C46B" />
        </Pressable>
        <Text style={styles.title}>Recycling Tips</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: params.imageUri }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.predictionContainer}>
          <Text style={styles.predictionTitle}>Prediction</Text>
          <Text style={styles.predictionText}>
            {showCustomModel ? customPrediction?.prediction : prediction.prediction}
          </Text>
          <Text style={styles.confidenceText}>
            Confidence: {Math.round(((showCustomModel ? customPrediction?.confidence : prediction.confidence) || 0) * 100)}%
          </Text>
          {prediction.points && (
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsText}>
                Points: {prediction.points}
              </Text>
              <Text style={styles.categoryText}>
                Category: {prediction.category}
              </Text>
            </View>
          )}
        </View>

        {params.model === 'gemini' && !showCustomModel && (
          <View style={styles.offlineButtonContainer}>
            <Pressable 
              onPress={handleOfflineMode}
              style={({ pressed }) => [
                styles.offlineButton,
                { opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <Text style={styles.offlineButtonText}>Use Offline Mode</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Steps:</Text>
          {instructions.instructions.map((instruction, index) => (
            <Text key={index} style={styles.instructionText}>• {instruction}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips:</Text>
          {instructions.tips.map((tip, index) => (
            <Text key={index} style={styles.instructionText}>• {tip}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disposal:</Text>
          <Text style={styles.instructionText}>{instructions.disposal}</Text>
        </View>

        {params.model === 'gemini' && prediction.explanation && !showCustomModel && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Explanation:</Text>
            <Text style={styles.instructionText}>{prediction.explanation}</Text>
          </View>
        )}

        {params.model === 'gemini' && !showCustomModel && (
          <View style={styles.bottomButtonContainer}>
            <Pressable 
              onPress={handleViewCustomModel}
              disabled={isLoadingCustom}
              style={({ pressed }) => [
                styles.customModelButton,
                { opacity: pressed ? 0.7 : 1 }
              ]}
            >
              {isLoadingCustom ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.customModelButtonText}>View Custom Model Prediction</Text>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  imageContainer: {
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: '#F5F5F5',
    alignSelf: 'center',
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  predictionContainer: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  predictionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#82C46B',
    marginBottom: 8,
  },
  predictionText: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  confidenceText: {
    fontSize: 14,
    color: '#666666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#82C46B',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 24,
  },
  closeButton: {
    backgroundColor: '#82C46B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsContainer: {
    padding: 20,
  },
  instructionSection: {
    marginBottom: 24,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#82C46B',
    marginBottom: 8,
  },
  tipsContainer: {
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#82C46B',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 24,
  },
  bottomButtonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  customModelButton: {
    backgroundColor: '#82C46B',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  customModelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  offlineButtonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  offlineButton: {
    backgroundColor: '#666666',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '80%',
  },
  offlineButtonText: {
    color: '#82C46B',
    fontSize: 16,
    fontWeight: '600',
  },
  pointsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  pointsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#82C46B',
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
}); 