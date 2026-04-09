import { View, Text } from 'react-native';

export default function HomeworkScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-[var(--background)] p-5">
      <Text className="text-xl font-bold text-white mb-2">Homework Solver</Text>
      <Text className="text-center text-[var(--muted)]">Step-by-step logic and text extraction tools mapping incoming.</Text>
    </View>
  );
}
