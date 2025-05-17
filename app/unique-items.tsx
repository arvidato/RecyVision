import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { uniqueItemsService } from '../services/uniqueItemsService';
import { userSettingsService } from '../services/userSettings';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Calculate responsive sizes
const getResponsiveSize = (baseSize: number) => {
    return Math.round((baseSize * height) / 812);
};

interface ItemCount {
    itemType: string;
    count: number;
}

export default function UniqueItems() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [uniqueItems, setUniqueItems] = useState<string[]>([]);
    const [allItemCounts, setAllItemCounts] = useState<ItemCount[]>([]);
    const [userId, setUserId] = useState('');

    useEffect(() => {
        loadUserSettings();
    }, []);

    const loadUserSettings = async () => {
        try {
            const settings = await userSettingsService.getUserSettings();
            setUserId(settings.userId);
            loadData(settings.userId);
        } catch (error) {
            console.error('Error loading user settings:', error);
        }
    };

    const loadData = async (currentUserId: string) => {
        try {
            const [items, counts] = await Promise.all([
                uniqueItemsService.getUniqueItems(currentUserId),
                uniqueItemsService.getAllClassesWithCounts(currentUserId)
            ]);
            setUniqueItems(items);
            setAllItemCounts(counts);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const formatItemName = (item: string) => {
        return item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Stack.Screen options={{ headerShown: false }} />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#82C46B" />
                </TouchableOpacity>
                <Text style={styles.title}>Unique Items</Text>
                <View style={styles.backButton} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.statsCard}>
                    <Text style={styles.statsValue}>{uniqueItems.length}</Text>
                    <Text style={styles.statsLabel}>Total Unique Items</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Item Collection</Text>
                    <View style={styles.itemsContainer}>
                        {uniqueItems.map((item, index) => (
                            <View key={index} style={styles.itemCard}>
                                <Text style={styles.itemText}>{formatItemName(item)}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>All Classes</Text>
                    <View style={styles.achievementsContainer}>
                        {allItemCounts.map((item, index) => (
                            <View key={index} style={[
                                styles.achievementCard,
                                item.count === 0 && styles.unscannedCard
                            ]}>
                                <View style={styles.achievementHeader}>
                                    <Text style={[
                                        styles.achievementTitle,
                                        item.count === 0 && styles.unscannedText
                                    ]}>
                                        {formatItemName(item.itemType)}
                                    </Text>
                                    <View style={[
                                        styles.countBadge,
                                        item.count === 0 && styles.unscannedBadge
                                    ]}>
                                        <Text style={styles.countText}>{item.count}</Text>
                                    </View>
                                </View>
                                <View style={styles.progressBar}>
                                    <View 
                                        style={[
                                            styles.progressFill,
                                            { width: `${Math.min((item.count / 100) * 100, 100)}%` }
                                        ]} 
                                    />
                                </View>
                                <Text style={styles.progressText}>
                                    {item.count} / 100 scans
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
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
    content: {
        flex: 1,
        padding: 20,
    },
    statsCard: {
        backgroundColor: '#F0F9F0',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    statsValue: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#82C46B',
        marginBottom: 8,
    },
    statsLabel: {
        fontSize: 16,
        color: '#666',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    itemsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    itemCard: {
        width: '48%',
        backgroundColor: '#F0F9F0',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        alignItems: 'center',
    },
    itemText: {
        fontSize: 16,
        color: '#1A1A1A',
        textAlign: 'center',
    },
    achievementsContainer: {
        gap: 12,
    },
    achievementCard: {
        backgroundColor: '#F0F9F0',
        padding: 16,
        borderRadius: 12,
    },
    unscannedCard: {
        backgroundColor: '#F5F5F5',
    },
    achievementHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    achievementTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        flex: 1,
    },
    unscannedText: {
        color: '#999',
    },
    countBadge: {
        backgroundColor: '#82C46B',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    unscannedBadge: {
        backgroundColor: '#999',
    },
    countText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    progressBar: {
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#82C46B',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'right',
    },
}); 