import { View, Text } from 'react-native';

export default function PerformanceScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-[var(--background)] p-5">
      <Text className="text-xl font-bold text-white mb-2">Performance Dashboard</Text>
      <Text className="text-center text-[var(--muted)]">Charts and study planning will render here natively.</Text>
    </View>
  );
}
