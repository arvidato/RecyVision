import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_SETTINGS_KEY = '@recyvision_user_settings';

interface UserSettings {
    name: string;
    userId: string;
    email: string;
}

export const userSettingsService = {
    // Get user settings
    async getUserSettings(): Promise<UserSettings> {
        try {
            const data = await AsyncStorage.getItem(USER_SETTINGS_KEY);
            if (data) {
                return JSON.parse(data);
            }
            // Default settings
            return {
                name: 'Recycler',
                userId: 'user1',
                email: ''
            };
        } catch (error) {
            console.error('Error getting user settings:', error);
            return {
                name: 'Recycler',
                userId: 'user1',
                email: ''
            };
        }
    },

    // Update user settings
    async updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
        try {
            const currentSettings = await this.getUserSettings();
            const updatedSettings = { ...currentSettings, ...settings };
            await AsyncStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(updatedSettings));
            return updatedSettings;
        } catch (error) {
            console.error('Error updating user settings:', error);
            throw error;
        }
    },

    // Update user name
    async updateUserName(name: string): Promise<UserSettings> {
        return this.updateUserSettings({ name });
    },

    // Update user email
    async updateUserEmail(email: string): Promise<UserSettings> {
        return this.updateUserSettings({ email });
    }
}; 