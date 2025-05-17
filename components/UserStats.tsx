import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { streakService } from '../services/streakService';
import { leaderboardService } from '../services/leaderboard';
import { uniqueItemsService } from '../services/uniqueItemsService';
import { userSettingsService } from '../services/userSettings';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

export const UserStats = () => {
    const router = useRouter();
    const [streak, setStreak] = useState(0);
    const [points, setPoints] = useState(0);
    const [uniqueItems, setUniqueItems] = useState(0);
    const [userId, setUserId] = useState('');

    useEffect(() => {
        loadUserSettings();
    }, []);

    // Add focus effect to reload stats when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            if (userId) {
                loadUserStats(userId);
            }
        }, [userId])
    );

    const loadUserSettings = async () => {
        try {
            const settings = await userSettingsService.getUserSettings();
            setUserId(settings.userId);
            loadUserStats(settings.userId);
        } catch (error) {
            console.error('Error loading user settings:', error);
        }
    };

    const loadUserStats = async (currentUserId: string) => {
        try {
            // Get streak data
            const streakData = await streakService.getStreakData(currentUserId);
            setStreak(streakData.currentStreak);

            // Get points from leaderboard
            const leaderboard = await leaderboardService.getLeaderboard();
            const userEntry = leaderboard.find(entry => entry.userId === currentUserId);
            if (userEntry) {
                setPoints(userEntry.points);
            }

            // Get unique items count
            const uniqueItemsCount = await uniqueItemsService.getUniqueItemsCount(currentUserId);
            setUniqueItems(uniqueItemsCount);
        } catch (error) {
            console.error('Error loading user stats:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{points}</Text>
                    <Text style={styles.statLabel}>Total Points</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                        {streak > 0 ? `🔥 ${streak}` : '0'}
                    </Text>
                    <Text style={styles.statLabel}>Day Streak</Text>
                </View>
            </View>
            
            <TouchableOpacity 
                style={styles.uniqueItemsCard}
                onPress={() => router.push('/unique-items')}
            >
                <View style={styles.uniqueItemsContent}>
                    <Text style={styles.statValue}>{uniqueItems}</Text>
                    <Text style={styles.statLabel}>Unique Items</Text>
                </View>
                <Ionicons name="ellipsis-horizontal" size={20} color="#82C46B" style={styles.arrowIcon} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 8,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#F0F9F0',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    uniqueItemsCard: {
        backgroundColor: '#F0F9F0',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        position: 'relative',
    },
    uniqueItemsContent: {
        alignItems: 'center',
        gap: 4,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#82C46B',
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
    },
    arrowIcon: {
        position: 'absolute',
        right: 16,
    }
}); 