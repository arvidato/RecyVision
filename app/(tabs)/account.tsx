import { View, Text, TouchableOpacity, Image, TextInput, Modal, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { userSettingsService } from '../../services/userSettings';
import { leaderboardService } from '../../services/leaderboard';

//STILL IN PROGRESS, NEED TO ADD GOOGLE LINKING AND EMAIL SENDING, RIGHT NOW
//IT JUST SAVES THE EMAIL AND NAME TO THE LOCAL STORAGE

const Account = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isLoading, setIsLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const languages = ['English'];

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const settings = await userSettingsService.getUserSettings();
      setName(settings.name);
      setEmail(settings.email);
    } catch (error) {
      console.error('Error loading user settings:', error);
      Alert.alert('Error', 'Failed to load user settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    try {
      setIsLoading(true);
      // Update user settings
      const updatedSettings = await userSettingsService.updateUserName(name.trim());
      
      // Get current leaderboard
      const leaderboard = await leaderboardService.getLeaderboard();
      const userEntry = leaderboard.find(entry => entry.userId === updatedSettings.userId);
      
      // Update leaderboard entry if it exists
      if (userEntry) {
        await leaderboardService.updateEntry({
          ...userEntry,
          name: name.trim()
        });
      }
      
      setIsEditingName(false);
      Alert.alert('Success', 'Name updated successfully');
    } catch (error) {
      console.error('Error updating name:', error);
      Alert.alert('Error', 'Failed to update name');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEmail = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Email cannot be empty');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      await userSettingsService.updateUserEmail(email.trim());
      setIsEditingEmail(false);
      Alert.alert('Success', 'Email updated successfully');
    } catch (error) {
      console.error('Error updating email:', error);
      Alert.alert('Error', 'Failed to update email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#82C46B" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white p-4">
      {/* Profile Section */}
      <View className="items-center mt-8">
        <View className="w-24 h-24 rounded-full items-center justify-center mb-6" style={{ backgroundColor: '#82C46B' }}>
          <Text className="text-white text-3xl">
            {name ? name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) : '?'}
          </Text>
        </View>
      </View>

      {/* User Info */}
      <View className="mt-8">
        <View className="mb-10">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-500 text-sm">Name</Text>
            <TouchableOpacity 
              onPress={() => setIsEditingName(true)}
              className="px-3 py-1 rounded-full border border-gray-200"
            >
              <Text className="text-sm" style={{ color: '#82C46B' }}>Edit</Text>
            </TouchableOpacity>
          </View>
          {isEditingName ? (
            <View className="flex-row items-center">
              <TextInput
                value={name}
                onChangeText={setName}
                className="flex-1 text-black text-lg border-b border-gray-300 pb-1"
                autoFocus
                placeholder="Enter your name"
              />
              <TouchableOpacity 
                onPress={handleSaveName}
                className="ml-4 px-4 py-2 rounded-lg"
                style={{ backgroundColor: '#82C46B' }}
              >
                <Text className="text-white">Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row items-center justify-between">
              <Text className="text-black text-lg">
                {name || 'Add your name'}
              </Text>
              <TouchableOpacity 
                onPress={() => setIsEditingName(true)}
                className="px-3 py-1 rounded-full border border-gray-200"
              >
                <Text className="text-sm" style={{ color: '#82C46B' }}>Edit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View className="mb-10">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-500 text-sm">Email Address</Text>
            <TouchableOpacity 
              onPress={() => setIsEditingEmail(true)}
              className="px-3 py-1 rounded-full border border-gray-200"
            >
              <Text className="text-sm" style={{ color: '#82C46B' }}>Edit</Text>
            </TouchableOpacity>
          </View>
          {isEditingEmail ? (
            <View className="flex-row items-center">
              <TextInput
                value={email}
                onChangeText={setEmail}
                className="flex-1 text-black text-lg border-b border-gray-300 pb-1"
                autoFocus
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity 
                onPress={handleSaveEmail}
                className="ml-4 px-4 py-2 rounded-lg"
                style={{ backgroundColor: '#82C46B' }}
              >
                <Text className="text-white">Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text className="text-black text-lg">
              {email || 'Add your email'}
            </Text>
          )}
        </View>

        <View className="mb-10">
          <Text className="text-gray-500 text-sm mb-2">Language</Text>
          <TouchableOpacity 
            className="flex-row justify-between items-center py-2 border-b border-gray-200"
            onPress={() => setShowLanguageModal(true)}
          >
            <Text className="text-black text-lg">{selectedLanguage}</Text>
            <Text className="text-gray-400">▼</Text>
          </TouchableOpacity>
        </View>

        {/* Language Selection Modal */}
        <Modal
          visible={showLanguageModal}
          transparent={true}
          animationType="slide"
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-semibold">Select Language</Text>
                <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                  <Text className="text-gray-500 text-lg">✕</Text>
                </TouchableOpacity>
              </View>
              {languages.map((language) => (
                <TouchableOpacity
                  key={language}
                  className="py-3 border-b border-gray-100"
                  onPress={() => {
                    setSelectedLanguage(language);
                    setShowLanguageModal(false);
                  }}
                >
                  <Text className={`text-lg ${selectedLanguage === language ? 'text-green-500' : 'text-black'}`}>
                    {language}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 15,
  },
  nameContainer: {
    backgroundColor: '#F8F8F8',
    padding: 15,
    borderRadius: 10,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  nameDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  editButton: {
    padding: 5,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginRight: 10,
  },
  saveButton: {
    padding: 10,
  },
});

export default Account;
