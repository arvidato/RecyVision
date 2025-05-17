import AsyncStorage from '@react-native-async-storage/async-storage';
import { userSettingsService } from './userSettings';

const LEADERBOARD_KEY = '@recyvision_leaderboard';

export interface LeaderboardEntry {
    rank: number;
    name: string;
    points: number;
    items: number;
    userId: string;
    lastUpdated: string;
}

export const leaderboardService = {
    // Get all leaderboard entries
    async getLeaderboard(): Promise<LeaderboardEntry[]> {
        try {
            const data = await AsyncStorage.getItem(LEADERBOARD_KEY);
            if (data) {
                const leaderboard = JSON.parse(data);
                // Update user's name in leaderboard if it exists
                const userSettings = await userSettingsService.getUserSettings();
                const userEntry = leaderboard.find(entry => entry.userId === userSettings.userId);
                if (userEntry && userEntry.name !== userSettings.name) {
                    userEntry.name = userSettings.name;
                    await AsyncStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
                }
                return leaderboard;
            }
            // Initialize with default entries if none exist
            const userSettings = await userSettingsService.getUserSettings();
            const defaultEntries: LeaderboardEntry[] = [
                {
                    rank: 1,
                    name: userSettings.name,
                    points: 100,
                    items: 10,
                    userId: userSettings.userId,
                    lastUpdated: new Date().toISOString()
                },
                {
                    rank: 2,
                    name: "Raffaele",
                    points: 89,
                    items: 8,
                    userId: "user2",
                    lastUpdated: new Date().toISOString()
                },
                {
                    rank: 3,
                    name: "Youssef",
                    points: 68,
                    items: 6,
                    userId: "user3",
                    lastUpdated: new Date().toISOString()
                },
                {
                    rank: 4,
                    name: "Hang",
                    points: 53,
                    items: 6,
                    userId: "user4",
                    lastUpdated: new Date().toISOString()
                }
            ];
            await AsyncStorage.setItem(LEADERBOARD_KEY, JSON.stringify(defaultEntries));
            return defaultEntries;
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            return [];
        }
    },

    // Add or update a leaderboard entry
    async updateEntry(entry: Omit<LeaderboardEntry, 'rank' | 'lastUpdated'>): Promise<LeaderboardEntry[]> {
        try {
            const currentLeaderboard = await this.getLeaderboard();
            
            // Find if user already exists
            const existingIndex = currentLeaderboard.findIndex(e => e.userId === entry.userId);
            
            if (existingIndex !== -1) {
                // Update existing entry
                currentLeaderboard[existingIndex] = {
                    ...entry,
                    rank: currentLeaderboard[existingIndex].rank,
                    lastUpdated: new Date().toISOString()
                };
            } else {
                // Add new entry
                currentLeaderboard.push({
                    ...entry,
                    rank: currentLeaderboard.length + 1,
                    lastUpdated: new Date().toISOString()
                });
            }

            // Sort by points and update ranks
            const sortedLeaderboard = currentLeaderboard
                .sort((a, b) => b.points - a.points)
                .map((entry, index) => ({
                    ...entry,
                    rank: index + 1
                }));

            // Save updated leaderboard
            await AsyncStorage.setItem(LEADERBOARD_KEY, JSON.stringify(sortedLeaderboard));
            return sortedLeaderboard;
        } catch (error) {
            console.error('Error updating leaderboard:', error);
            return [];
        }
    },

    // Add points to a user's score
    async addPoints(userId: string, points: number, userName: string): Promise<LeaderboardEntry[]> {
        try {
            const currentLeaderboard = await this.getLeaderboard();
            const userEntry = currentLeaderboard.find(entry => entry.userId === userId);

            if (userEntry) {
                // Update existing entry
                return this.updateEntry({
                    ...userEntry,
                    points: userEntry.points + points,
                    items: userEntry.items + 1,
                    name: userName
                });
            } else {
                // Create new entry
                return this.updateEntry({
                    name: userName,
                    points: points,
                    items: 1,
                    userId: userId
                });
            }
        } catch (error) {
            console.error('Error adding points:', error);
            return [];
        }
    },

    // Clear leaderboard data
    async clearLeaderboard(): Promise<void> {
        try {
            await AsyncStorage.removeItem(LEADERBOARD_KEY);
        } catch (error) {
            console.error('Error clearing leaderboard:', error);
        }
    },

    // Clear leaderboard data and reinitialize
    async resetLeaderboard(): Promise<LeaderboardEntry[]> {
        try {
            await AsyncStorage.removeItem(LEADERBOARD_KEY);
            return this.getLeaderboard(); // This will create new entries with updated names
        } catch (error) {
            console.error('Error resetting leaderboard:', error);
            return [];
        }
    }
}; 