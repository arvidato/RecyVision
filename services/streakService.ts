import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = '@recyvision_streak';

interface StreakData {
    lastScanDate: string;
    currentStreak: number;
    longestStreak: number;
}

export const streakService = {
    // Get streak data for a user
    async getStreakData(userId: string): Promise<StreakData> {
        try {
            const data = await AsyncStorage.getItem(`${STREAK_KEY}_${userId}`);
            if (data) {
                const parsedData = JSON.parse(data);
                // Validate the date is not in the future
                const lastScanDate = new Date(parsedData.lastScanDate);
                const now = new Date();
                if (lastScanDate > now) {
                    // If the date is in the future, reset it to now
                    return {
                        lastScanDate: now.toISOString(),
                        currentStreak: 1,
                        longestStreak: Math.max(1, parsedData.longestStreak || 0)
                    };
                }
                return parsedData;
            }
            // Initialize with current streak of 1 for first scan
            return {
                lastScanDate: new Date().toISOString(),
                currentStreak: 1,
                longestStreak: 1
            };
        } catch (error) {
            console.error('Error getting streak data:', error);
            return {
                lastScanDate: new Date().toISOString(),
                currentStreak: 1,
                longestStreak: 1
            };
        }
    },

    // Update streak and calculate streak bonus
    async updateStreak(userId: string): Promise<{ streakBonus: number; currentStreak: number }> {
        try {
            const streakData = await this.getStreakData(userId);
            const today = new Date();
            const lastScan = new Date(streakData.lastScanDate);
            
            // Ensure we're not dealing with future dates
            if (lastScan > today) {
                lastScan.setTime(today.getTime());
            }
            
            // Check if last scan was yesterday
            const isYesterday = 
                today.getFullYear() === lastScan.getFullYear() &&
                today.getMonth() === lastScan.getMonth() &&
                today.getDate() - lastScan.getDate() === 1;

            // Check if last scan was today
            const isToday = 
                today.getFullYear() === lastScan.getFullYear() &&
                today.getMonth() === lastScan.getMonth() &&
                today.getDate() === lastScan.getDate();

            let newStreak = streakData.currentStreak;
            let streakBonus = 0;

            if (isToday) {
                // Already scanned today, keep current streak
                streakBonus = this.calculateStreakBonus(newStreak);
            } else if (isYesterday) {
                // Scanned yesterday, increment streak
                newStreak += 1;
                streakBonus = this.calculateStreakBonus(newStreak);
            } else {
                // Streak broken, reset to 1
                newStreak = 1;
                streakBonus = this.calculateStreakBonus(newStreak);
            }

            // Update streak data
            const updatedStreakData: StreakData = {
                lastScanDate: today.toISOString(),
                currentStreak: newStreak,
                longestStreak: Math.max(newStreak, streakData.longestStreak)
            };

            await AsyncStorage.setItem(
                `${STREAK_KEY}_${userId}`,
                JSON.stringify(updatedStreakData)
            );

            return {
                streakBonus,
                currentStreak: newStreak
            };
        } catch (error) {
            console.error('Error updating streak:', error);
            return {
                streakBonus: 0,
                currentStreak: 1  // Return 1 instead of 0 for error case
            };
        }
    },

    // Calculate bonus points based on streak length
    calculateStreakBonus(streak: number): number {
        if (streak >= 7) return 50;  // 7+ days streak
        if (streak >= 5) return 30;  // 5-6 days streak
        if (streak >= 3) return 20;  // 3-4 days streak
        if (streak >= 2) return 10;  // 2 days streak
        return 5;                    // First day
    },

    // Debug function to check current streak data
    async debugStreakData(userId: string): Promise<StreakData | null> {
        try {
            const data = await AsyncStorage.getItem(`${STREAK_KEY}_${userId}`);
            console.log('Current streak data:', data);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting debug streak data:', error);
            return null;
        }
    },

    // Reset streak data for a user
    async resetStreakData(userId: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(`${STREAK_KEY}_${userId}`);
            console.log('Streak data reset for user:', userId);
        } catch (error) {
            console.error('Error resetting streak data:', error);
        }
    }
}; 