import {
  CameraType,
  CameraView,
  useCameraPermissions,
  Camera,
} from "expo-camera";
import * as Location from 'expo-location';
import * as ImageManipulator from 'expo-image-manipulator'; // ✅ Added
import { useEffect, useRef, useState } from "react";
import { Button, Pressable, StyleSheet, Text, View, Dimensions, Alert, ActivityIndicator, ScrollView } from "react-native";
import { Image } from "expo-image";
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome6 } from "@expo/vector-icons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { recordScanEvent } from "../../services/scanEvents";
import { getRecyclingInstructions } from "../../services/recyclingInstructions";
import { useRouter } from 'expo-router';
import { config } from '../config';
import { pointsSystem, RecyclableItem } from '../../services/pointsSystem';
import { leaderboardService } from '../../services/leaderboard';
import { streakService } from '../../services/streakService';
import { userSettingsService } from '../../services/userSettings';
import { uniqueItemsService } from '../../services/uniqueItemsService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Prediction {
  prediction: string;
  confidence: number;
}

const CLASS_MAPPING: Record<string, string> = {
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
  '29': 'tea_bags'
};

// Add classifyImage function
const classifyImage = async (imageUri: string) => {
  console.log('Classifying image with offline model...');
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'photo.jpg',
  } as any);

  const response = await fetch(`${config.API_URL}${config.API_ENDPOINTS.PREDICT}`, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.ok) {
    throw new Error('Offline model prediction failed');
  }

  const data = await response.json();
  console.log('Offline model response:', data);
  return data.prediction;
};

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [uri, setUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const ref = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const cameraStatus = await requestPermission();
      console.log("Camera permission status:", cameraStatus);

      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      console.log("Location permission status:", status);

      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Location permission is required for this app to work properly.", [{ text: "OK" }]);
      }
    })();
  }, []);

  const takePicture = async () => {
    try {
      if (!ref.current) return;

      const photo = await ref.current.takePictureAsync({ quality: 1, exif: true });
      console.log("Picture taken:", photo);

      const resized = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 512, height: 512 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      console.log("Resized image URI:", resized.uri);
      setUri(resized.uri);

      try {
        await recordScanEvent();
        console.log("Scan event recorded successfully");
      } catch (error) {
        console.error("Error recording scan event:", error);
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert("Error", "Failed to process the image. Please try again.");
    }
  };

  const handleCheck = async () => {
    try {
      console.log('Starting image processing...');
      if (!uri) {
        console.log('No image available');
        return;
      }

      // Prepare image data
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      console.log("Prepared image data:", { filename, type });

      formData.append('image', {
        uri: uri,
        name: filename,
        type: type
      } as any);
      console.log("FormData created with image");

      // Try Gemini API first
      console.log('Attempting to call Gemini API...');
      const response = await fetch(`${config.API_URL}${config.API_ENDPOINTS.PREDICT_GEMINI}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Gemini API response status:', response.status);
      const data = await response.json();
      console.log('Gemini API response:', data);

      if (data.error) {
        console.log('Gemini API error:', data.error);
        console.log('Falling back to offline model...');
        // Fall back to offline model
        const result = await classifyImage(uri);
        console.log('Offline model result:', result);
        setPrediction(result);
      } else {
        console.log('Gemini prediction successful:', data.prediction);
        setPrediction(data.prediction);
      }

      // Get user settings
      console.log('Getting user settings...');
      const userSettings = await userSettingsService.getUserSettings();
      const userId = userSettings.userId;
      console.log('User ID:', userId);

      // Calculate points
      console.log('Calculating points...');
      const itemType = data.prediction as RecyclableItem;
      console.log("Predicted item type:", itemType);
      const basePoints = pointsSystem.getPointsForItem(itemType);
      console.log("Base points:", basePoints);
      
      // Get streak bonus
      console.log("Calculating streak bonus...");
      const { streakBonus, currentStreak } = await streakService.updateStreak(userId);
      console.log("Streak bonus:", streakBonus, "Current streak:", currentStreak);
      
      const totalPoints = basePoints + streakBonus;
      console.log("Total points:", totalPoints);
      
      // Add points to leaderboard
      console.log("Adding points to leaderboard...");
      await leaderboardService.addPoints(userId, totalPoints, userSettings.name);
      console.log('Points added to leaderboard');

      // Track unique item
      console.log("Tracking unique item...");
      await uniqueItemsService.addUniqueItem(userId, itemType);
      console.log('Unique item tracked');

      // Navigate to recycling tips
      console.log('Navigating to recycling tips...');
      router.push({
        pathname: '/recycling-tips',
        params: {
          prediction: JSON.stringify({
            prediction: data.prediction,
            confidence: data.confidence || 1,
            explanation: data.explanation,
            points: totalPoints,
            category: pointsSystem.getCategoryForItem(itemType)
          }),
          model: 'gemini',
          imageUri: uri
        }
      });
      console.log('Navigation complete');

    } catch (error) {
      console.error('Error in handleCheck:', error);
      Alert.alert('Error', 'Failed to process image');
    }
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const renderInstructions = () => {
    if (!prediction) return null;

    const classId = Object.entries(CLASS_MAPPING).find(([_, value]) => value === prediction.prediction)?.[0];
    const instructions = classId ? getRecyclingInstructions(parseInt(classId)) : null;

    if (!instructions) {
      return (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Unknown Material</Text>
          <Text style={styles.instructionText}>We couldn't determine the recycling instructions for this item.</Text>
          <Pressable onPress={() => {
            setShowInstructions(false); setPrediction(null); setUri(null);
          }} style={({ pressed }) => [
            styles.closeButton,
            { opacity: pressed ? 0.7 : 1 }
          ]}>
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.instructionsContainer}>
        <ScrollView style={styles.instructionsScroll}>
          <Text style={styles.instructionsTitle}>{instructions.category} Recycling Instructions</Text>
          <Text style={styles.confidenceText}>
            Confidence: {Math.round(prediction.confidence * 100)}%
          </Text>

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
        </ScrollView>

        <Pressable onPress={() => {
          setShowInstructions(false); setPrediction(null); setUri(null);
        }} style={({ pressed }) => [
          styles.closeButton,
          { opacity: pressed ? 0.7 : 1 }
        ]}>
          <Text style={styles.closeButtonText}>Close</Text>
        </Pressable>
      </View>
    );
  };

  const renderPicture = () => {
    if (!uri) return null;
    if (showInstructions) return renderInstructions();

    return (
      <View style={styles.previewContainer}>
        <View style={styles.topSpacer} />
        <View style={styles.imageContainer}>
          <Image source={uri} contentFit="contain" style={styles.previewImage} />
        </View>
        <View style={styles.middleSpacer} />
        <View style={styles.photoActionContainer}>
          <Pressable onPress={() => setUri(null)} style={styles.actionButton}>
            <View style={styles.greenCircle}>
              <AntDesign name="close" size={24} color="white" />
            </View>
          </Pressable>
          <Pressable onPress={handleCheck} disabled={isProcessing} style={styles.actionButton}>
            <View style={styles.greenCircle}>
              {isProcessing ? <ActivityIndicator color="white" /> :
                <AntDesign name="check" size={24} color="white" />}
            </View>
          </Pressable>
        </View>
        <View style={styles.bottomSpacer} />
      </View>
    );
  };

  const renderCamera = () => (
    <View style={styles.cameraContainer}>
      <CameraView 
        style={styles.camera} 
        ref={ref} 
        facing={facing}
      >
        <View style={styles.shutterContainer}>
          <View style={styles.cameraControlButton} />
          <Pressable onPress={takePicture}>
            {({ pressed }) => (
              <View style={[styles.shutterBtn, { opacity: pressed ? 0.5 : 1 }]}>
                <View style={styles.shutterBtnInner} />
              </View>
            )}
          </Pressable>
          <Pressable onPress={toggleFacing} style={styles.cameraControlButton}>
            <FontAwesome6 name="rotate-left" size={28} color="white" />
          </Pressable>
        </View>
      </CameraView>
    </View>
  );

  if (!permission || !locationPermission) {
    return <View style={styles.container}><Text>Requesting permissions...</Text></View>;
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>We need your permission to use the camera</Text>
        <Button onPress={requestPermission} title="Grant camera permission" />
      </View>
    );
  }

  if (locationPermission !== 'granted') {
    return (
      <View style={styles.container}>
        <Text>We need your permission to access your location</Text>
        <Button onPress={async () => {
          const { status } = await Location.requestForegroundPermissionsAsync();
          setLocationPermission(status);
        }} title="Grant location permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {uri ? renderPicture() : renderCamera()}
    </View>
  );
}

const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  cameraContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  camera: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width,
    aspectRatio: 1,
  },
  shutterContainer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  cameraControlButton: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: 'transparent',
    justifyContent: 'center', alignItems: 'center'
  },
  shutterBtn: {
    height: 80, width: 80, borderRadius: 40, borderWidth: 4,
    borderColor: "white", justifyContent: "center", alignItems: "center"
  },
  shutterBtnInner: { height: 64, width: 64, borderRadius: 32, backgroundColor: "white" },
  previewContainer: { flex: 1, width: "100%", justifyContent: "center", alignItems: "center" },
  topSpacer: { flex: 0.2 }, imageContainer: { justifyContent: "center", alignItems: "center", flex: 0.4 },
  previewImage: { width: 300, height: 300, aspectRatio: 1 },
  middleSpacer: { flex: 0.05 }, bottomSpacer: { flex: 0.15 },
  photoActionContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '70%', alignItems: 'center', flex: 0.2 },
  actionButton: { justifyContent: 'center', alignItems: 'center', margin: 20 },
  greenCircle: {
    width: 70, height: 70, borderRadius: 35, backgroundColor: '#4CAF50',
    justifyContent: 'center', alignItems: 'center', elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 3.84,
  },
  instructionsContainer: { flex: 1, width: "100%", backgroundColor: "white", padding: 20 },
  instructionsScroll: { flex: 1 },
  instructionsTitle: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 10 },
  confidenceText: { fontSize: 16, color: "#666", marginBottom: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#333", marginBottom: 10 },
  instructionText: { fontSize: 16, color: "#444", marginBottom: 8, lineHeight: 22 },
  closeButton: { backgroundColor: "#4CAF50", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 20 },
  closeButtonText: { color: "white", fontSize: 16, fontWeight: "600" }
});