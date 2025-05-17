import React from 'react';
import { Text, View, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { leaderboardService, LeaderboardEntry } from '../services/leaderboard';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Calculate responsive sizes
const getResponsiveSize = (baseSize: number) => {
    return Math.round((baseSize * height) / 812);
};

// TODO: Replace with actual user ID from your auth system
const CURRENT_USER_ID = "user1";

export default function Leaderboard() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        try {
            const data = await leaderboardService.getLeaderboard();
            setLeaderboardData(data);
            // Find current user's rank
            const userEntry = data.find(entry => entry.userId === CURRENT_USER_ID);
            setUserRank(userEntry || null);
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        try {
            setLoading(true);
            const data = await leaderboardService.getLeaderboard();
            setLeaderboardData(data);
        } catch (error) {
            console.error('Error refreshing leaderboard:', error);
            Alert.alert('Error', 'Failed to refresh leaderboard');
        } finally {
            setLoading(false);
        }
    };

    // const handleReset = async () => {
    //     try {
    //         setLoading(true);
    //         const data = await leaderboardService.resetLeaderboard();
    //         setLeaderboardData(data);
    //         Alert.alert('Success', 'Leaderboard has been reset');
    //     } catch (error) {
    //         console.error('Error resetting leaderboard:', error);
    //         Alert.alert('Error', 'Failed to reset leaderboard');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const renderUserRankCard = () => {
        if (!userRank) return null;

        return (
            <View style={{
                backgroundColor: '#E8F5E9',
                padding: getResponsiveSize(15),
                borderRadius: getResponsiveSize(10),
                marginBottom: getResponsiveSize(20),
                borderWidth: 2,
                borderColor: '#82C46B',
            }}>
                <Text style={{
                    fontSize: getResponsiveSize(16),
                    fontWeight: '600',
                    color: '#1A1A1A',
                    marginBottom: getResponsiveSize(10),
                }}>
                    Your Rank
                </Text>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    <View style={{
                        width: getResponsiveSize(40),
                        height: getResponsiveSize(40),
                        borderRadius: getResponsiveSize(20),
                        backgroundColor: '#82C46B',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: getResponsiveSize(15),
                    }}>
                        <Text style={{
                            color: 'white',
                            fontSize: getResponsiveSize(16),
                            fontWeight: 'bold',
                        }}>
                            {userRank.rank}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{
                            fontSize: getResponsiveSize(16),
                            fontWeight: '600',
                            color: '#1A1A1A',
                        }}>
                            {userRank.name}
                        </Text>
                        <Text style={{
                            fontSize: getResponsiveSize(14),
                            color: '#666',
                        }}>
                            {userRank.items} items recycled
                        </Text>
                    </View>
                    <Text style={{
                        fontSize: getResponsiveSize(18),
                        fontWeight: 'bold',
                        color: '#82C46B',
                    }}>
                        {userRank.points}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
            <Stack.Screen options={{ headerShown: false }} />
            
            {/* Header */}
            <View style={{
                height: getResponsiveSize(60),
                backgroundColor: 'white',
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: getResponsiveSize(15),
                borderBottomWidth: 1,
                borderBottomColor: '#E5E5E5',
            }}>
                <TouchableOpacity 
                    onPress={() => router.back()}
                    style={{ marginRight: getResponsiveSize(10) }}
                >
                    <Ionicons name="arrow-back" size={24} color="#82C46B" />
                </TouchableOpacity>
                <Text style={{
                    flex: 1,
                    textAlign: 'center',
                    fontSize: getResponsiveSize(18),
                    fontWeight: '600',
                    color: '#1A1A1A',
                }}>
                    Leaderboard
                </Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity 
                        onPress={handleRefresh}
                        style={styles.refreshButton}
                    >
                        <Ionicons name="refresh" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    {/* <TouchableOpacity 
                        onPress={handleReset}
                        style={styles.resetButton}
                    >
                        <Ionicons name="refresh-circle" size={24} color="#1A1A1A" />
                    </TouchableOpacity> */}
                </View>
            </View>

            {/* Leaderboard Content */}
            <ScrollView style={{ flex: 1, padding: getResponsiveSize(20) }}>
                <Text style={{
                    fontSize: getResponsiveSize(24),
                    fontWeight: 'bold',
                    color: '#1A1A1A',
                    marginBottom: getResponsiveSize(20),
                }}>
                    Top Recyclers
                </Text>

                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: getResponsiveSize(20) }}>
                        <ActivityIndicator size="large" color="#82C46B" />
                    </View>
                ) : leaderboardData.length === 0 ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: getResponsiveSize(20) }}>
                        <Text style={{ fontSize: getResponsiveSize(16), color: '#666', textAlign: 'center' }}>
                            No data available yet. Start recycling to appear on the leaderboard!
                        </Text>
                    </View>
                ) : (
                    <>
                        {renderUserRankCard()}
                        {leaderboardData.map((user) => (
                            <View
                                key={user.userId}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: getResponsiveSize(15),
                                    backgroundColor: user.userId === CURRENT_USER_ID 
                                        ? '#E8F5E9' 
                                        : user.rank <= 3 
                                            ? '#F0F9F0' 
                                            : 'white',
                                    borderRadius: getResponsiveSize(10),
                                    marginBottom: getResponsiveSize(10),
                                    borderWidth: 1,
                                    borderColor: user.userId === CURRENT_USER_ID 
                                        ? '#82C46B' 
                                        : '#E5E5E5',
                                }}
                            >
                                <View style={{
                                    width: getResponsiveSize(40),
                                    height: getResponsiveSize(40),
                                    borderRadius: getResponsiveSize(20),
                                    backgroundColor: user.userId === CURRENT_USER_ID 
                                        ? '#82C46B' 
                                        : user.rank <= 3 
                                            ? '#82C46B' 
                                            : '#E5E5E5',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: getResponsiveSize(15),
                                }}>
                                    <Text style={{
                                        color: user.userId === CURRENT_USER_ID || user.rank <= 3 
                                            ? 'white' 
                                            : '#666',
                                        fontSize: getResponsiveSize(16),
                                        fontWeight: 'bold',
                                    }}>
                                        {user.rank}
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{
                                        fontSize: getResponsiveSize(16),
                                        fontWeight: '600',
                                        color: '#1A1A1A',
                                    }}>
                                        {user.name}
                                    </Text>
                                    <Text style={{
                                        fontSize: getResponsiveSize(14),
                                        color: '#666',
                                    }}>
                                        {user.items} items recycled
                                    </Text>
                                </View>
                                <Text style={{
                                    fontSize: getResponsiveSize(18),
                                    fontWeight: 'bold',
                                    color: '#82C46B',
                                }}>
                                    {user.points}
                                </Text>
                            </View>
                        ))}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    refreshButton: {
        padding: 8,
    },
    resetButton: {
        padding: 8,
    },
}); 