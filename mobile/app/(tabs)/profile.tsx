import { View, Text } from 'react-native';

export default function ProfileScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-[var(--background)] p-5">
      <Text className="text-xl font-bold text-white mb-2">My Profile</Text>
      <Text className="text-center text-[var(--muted)]">User session context and settings mapping incoming.</Text>
    </View>
  );
}
