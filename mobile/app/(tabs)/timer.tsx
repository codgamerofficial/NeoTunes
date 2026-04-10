import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Play, Pause, RotateCcw } from "lucide-react-native";

export default function TimerScreen() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setTimeout(() => setIsActive(false), 0);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  function switchMode(newMode: 'focus' | 'break') {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <View className="flex-1 items-center justify-center p-5 bg-[var(--background)] space-y-12 gap-8">
      <View className="flex-row gap-4 p-1.5 bg-black/20 rounded-full">
        <TouchableOpacity 
          onPress={() => switchMode('focus')}
          className={`px-8 py-3 rounded-full ${mode === 'focus' ? 'bg-[var(--accent)]' : 'bg-transparent'}`}
        >
          <Text className={`font-bold ${mode === 'focus' ? 'text-white' : 'text-[var(--muted)]'}`}>Focus</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => switchMode('break')}
          className={`px-8 py-3 rounded-full ${mode === 'break' ? 'bg-[var(--accent)]' : 'bg-transparent'}`}
        >
          <Text className={`font-bold ${mode === 'break' ? 'text-white' : 'text-[var(--muted)]'}`}>Break</Text>
        </TouchableOpacity>
      </View>

      <View className="items-center justify-center p-12 bg-[var(--panel-strong)] rounded-full border-4 border-[var(--line)]">
        <Text className="text-7xl font-bold text-white tracking-tighter">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </Text>
      </View>

      <View className="flex-row gap-6">
        <TouchableOpacity 
          onPress={() => setIsActive(!isActive)}
          className="w-16 h-16 bg-[var(--accent)] items-center justify-center rounded-full shadow-lg"
        >
          {isActive ? <Pause color="white" size={32} /> : <Play color="white" size={32} style={{marginLeft: 4}} />}
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => { setIsActive(false); setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60); }}
          className="w-16 h-16 bg-[var(--panel-strong)] border border-[var(--line)] items-center justify-center rounded-full"
        >
          <RotateCcw color="#a6a198" size={28} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
