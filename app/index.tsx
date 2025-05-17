import { Text, View, Image, TouchableOpacity, Dimensions, ScrollView, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { icons } from "@/constants/icons";
import Calendar from '../components/Calendar';
import { Ionicons } from '@expo/vector-icons';
import { UserStats } from '../components/UserStats';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Calculate responsive sizes
const getResponsiveSize = (baseSize: number) => {
    return Math.round((baseSize * height) / 812); // 812 is iPhone X height
};

const styles = StyleSheet.create({
    section: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 12,
    },
});

export default function Index() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
            {/* Top Navigation Bar */}
            <View 
                style={{
                    height: getResponsiveSize(60),
                    backgroundColor: 'white',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: getResponsiveSize(15),
                    borderBottomWidth: 1,
                    borderBottomColor: '#E5E5E5',
                }}
            >
                <Text 
                    style={{
                        flex: 1,
                        textAlign: 'center',
                        fontSize: getResponsiveSize(18),
                        fontWeight: '600',
                        color: '#1A1A1A',
                    }}
                >
                    Home
                </Text>
            </View>

            {/* Main Content */}
            <ScrollView className="flex-1">
                <View style={{ padding: getResponsiveSize(12) }}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Your Recycling Progress</Text>
                        <Calendar />
                    </View>

                    <UserStats />

                    {/* Leaderboard Button */}
                    <View>
                        <TouchableOpacity 
                            onPress={() => router.push('/leaderboard')}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#F0F9F0',
                                padding: getResponsiveSize(12),
                                borderRadius: getResponsiveSize(10),
                                marginTop: getResponsiveSize(12),
                            }}
                        >
                            <View style={{
                                width: getResponsiveSize(40),
                                height: getResponsiveSize(40),
                                borderRadius: getResponsiveSize(20),
                                backgroundColor: '#82C46B',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: getResponsiveSize(15),
                            }}>
                                <Ionicons name="trophy" size={24} color="white" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{
                                    fontSize: getResponsiveSize(16),
                                    fontWeight: '600',
                                    color: '#1A1A1A',
                                }}>
                                    View Leaderboard
                                </Text>
                                <Text style={{
                                    fontSize: getResponsiveSize(14),
                                    color: '#666',
                                }}>
                                    See top recyclers in your area
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#82C46B" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Navigation Bar */}
            <View 
                style={{
                    height: getResponsiveSize(85),
                    paddingTop: getResponsiveSize(5),
                    paddingBottom: getResponsiveSize(10),
                    backgroundColor: 'white',
                    borderTopWidth: 1,
                    borderTopColor: '#E5E5E5',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: getResponsiveSize(20),
                }}
            >
                {/* Map Tab */}
                <TouchableOpacity 
                    onPress={() => router.push('/(tabs)/map')}
                    style={{ 
                        alignItems: 'center',
                        height: getResponsiveSize(50),
                        justifyContent: 'center',
                        width: getResponsiveSize(80),
                    }}
                >
                    <Image
                        source={icons.map}
                        style={{
                            width: getResponsiveSize(30),
                            height: getResponsiveSize(30),
                            tintColor: "#82C46B",
                        }}
                    />
                    <Text style={{ 
                        color: "#82C46B",
                        fontSize: getResponsiveSize(16),
                        marginTop: getResponsiveSize(4),
                        textAlign: 'center',
                    }}>
                        Map
                    </Text>
                </TouchableOpacity>

                {/* Recycling Tab */}
                <TouchableOpacity 
                    onPress={() => router.push('/(tabs)/scan')}
                    style={{ 
                        alignItems: 'center',
                        height: getResponsiveSize(50),
                        justifyContent: 'center',
                        width: getResponsiveSize(80),
                    }}
                >
                    <View
                        style={{
                            width: getResponsiveSize(60),
                            height: getResponsiveSize(60),
                            borderRadius: getResponsiveSize(30),
                            backgroundColor: "#82C46B",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Image
                            source={icons.recycling}
                            style={{
                                width: getResponsiveSize(42),
                                height: getResponsiveSize(42),
                                tintColor: "white",
                            }}
                        />
                    </View>
                </TouchableOpacity>

                {/* Account Tab */}
                <TouchableOpacity 
                    onPress={() => router.push('/(tabs)/account')}
                    style={{ 
                        alignItems: 'center',
                        height: getResponsiveSize(50),
                        justifyContent: 'center',
                        width: getResponsiveSize(80),
                    }}
                >
                    <Image
                        source={icons.account}
                        style={{
                            width: getResponsiveSize(30),
                            height: getResponsiveSize(30),
                            tintColor: "#82C46B",
                        }}
                    />
                    <Text style={{ 
                        color: "#82C46B",
                        fontSize: getResponsiveSize(16),
                        marginTop: getResponsiveSize(4),
                        textAlign: 'center',
                    }}>
                        Account
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
} 