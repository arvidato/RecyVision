import { View, Text } from 'react-native';
import { Stack } from 'expo-router';

export default function Auth() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <Text>Auth Screen</Text>
    </View>
  );
} 