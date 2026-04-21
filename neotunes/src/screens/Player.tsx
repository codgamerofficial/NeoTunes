import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Alert,
  Dimensions,
  Animated,
  Easing,
  Share,
  Modal,
  TextInput,
} from 'react-native';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronDown,
  Heart,
  ListMusic,
  Shuffle,
  Repeat,
  Repeat1,
  UsersRound,
  Share2,
} from 'lucide-react-native';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './Search';
import ProgressSlider from '../components/ProgressSlider';
import { shadow } from '../lib/shadow';
import { usePreferencesStore } from '../store/preferencesStore';
import { getThemePalette } from '../lib/themePalette';
import { useJamStore } from '../store/jamStore';

type PlayerScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Player'>;
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const ART_SIZE = Math.min(SCREEN_W - 56, SCREEN_H * 0.38, 340);

export default function PlayerScreen({ navigation }: PlayerScreenProps) {
  const themeMode = usePreferencesStore((state) => state.themeMode);
  const displayName = usePreferencesStore((state) => state.displayName);
  const palette = getThemePalette(themeMode);
  const isDark = themeMode === 'dark';

  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const nextTrack = usePlayerStore((state) => state.nextTrack);
  const prevTrack = usePlayerStore((state) => state.prevTrack);
  const queue = usePlayerStore((state) => state.queue);
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const shuffleEnabled = usePlayerStore((state) => state.shuffleEnabled);
  const repeatMode = usePlayerStore((state) => state.repeatMode);
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);
  const cycleRepeatMode = usePlayerStore((state) => state.cycleRepeatMode);

  const jamSessionCode = useJamStore((state) => state.sessionCode);
  const jamRole = useJamStore((state) => state.role);
  const jamConnected = useJamStore((state) => state.isConnected);
  const jamParticipantCount = useJamStore((state) => state.participantCount);
  const jamError = useJamStore((state) => state.error);
  const jamLastSyncAt = useJamStore((state) => state.lastSyncAt);
  const createSession = useJamStore((state) => state.createSession);
  const joinSession = useJamStore((state) => state.joinSession);
  const leaveSession = useJamStore((state) => state.leaveSession);
  const shareSession = useJamStore((state) => state.shareSession);
  const requestSync = useJamStore((state) => state.requestSync);

  const { user } = useAuthStore();
  const [isSaved, setIsSaved] = useState(false);
  const [jamModalVisible, setJamModalVisible] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [jamBusy, setJamBusy] = useState(false);

  const controlsLocked = jamConnected && jamRole === 'guest';
  const jamIdentity = displayName !== '' ? displayName : (user?.email?.split('@')[0] ?? 'Listener');

  const spinValue = useRef(new Animated.Value(0)).current;
  const spinRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isPlaying) {
      spinRef.current = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: false,
        })
      );
      spinRef.current.start();
    } else {
      spinRef.current?.stop();
    }
  }, [isPlaying, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!currentTrack) {
    navigation.goBack();
    return null;
  }

  const lockMessage = () => {
    Alert.alert('Jam Guest Mode', 'Only the host can control playback and queue changes in this Jam.');
  };

  const handleSaveTrack = async () => {
    if (!user) return Alert.alert('Error', 'You must be logged in to save tracks');
    setIsSaved(true);
    const { error } = await supabase.from('saved_tracks').insert([
      {
        user_id: user.id,
        track_id: currentTrack.id,
        title: currentTrack.title,
        artist: currentTrack.artist,
        artwork: currentTrack.artwork,
        color: currentTrack.color,
      },
    ]);
    if (error) {
      setIsSaved(false);
      Alert.alert('Error saving track', error.message);
    }
  };

  const handleShareTrack = async () => {
    try {
      await Share.share({
        message: `Listening to ${currentTrack.title} by ${currentTrack.artist} on NeoTunes`,
      });
    } catch {
      Alert.alert('Share Failed', 'Could not open share options right now.');
    }
  };

  const handleCreateJamSession = async () => {
    setJamBusy(true);
    const connected = await createSession(jamIdentity);
    setJamBusy(false);
    if (!connected) {
      Alert.alert('Jam Error', 'Could not create a Jam right now. Please try again.');
    }
  };

  const handleJoinJamSession = async () => {
    const normalizedCode = joinCodeInput.replace(/\s+/g, '').toUpperCase();
    if (normalizedCode.length !== 6) {
      Alert.alert('Invalid Code', 'Enter a 6-character room code.');
      return;
    }

    setJamBusy(true);
    const joined = await joinSession(normalizedCode, jamIdentity);
    setJamBusy(false);
    if (!joined) {
      Alert.alert('Jam Error', 'Could not join that room. Please check the code and try again.');
    }
  };

  const handleLeaveJamSession = async () => {
    setJamBusy(true);
    await leaveSession();
    setJamBusy(false);
    setJoinCodeInput('');
  };

  const handleStartJam = async () => {
    setJamModalVisible(true);
    if (!jamConnected) {
      await handleCreateJamSession();
    }
  };

  const handleTogglePlay = () => {
    if (controlsLocked) {
      lockMessage();
      return;
    }
    togglePlay();
  };

  const handleNextTrack = () => {
    if (controlsLocked) {
      lockMessage();
      return;
    }
    nextTrack();
  };

  const handlePrevTrack = () => {
    if (controlsLocked) {
      lockMessage();
      return;
    }
    prevTrack();
  };

  const handleShuffleToggle = () => {
    if (controlsLocked) {
      lockMessage();
      return;
    }
    toggleShuffle();
  };

  const handleRepeatCycle = () => {
    if (controlsLocked) {
      lockMessage();
      return;
    }
    cycleRepeatMode();
  };

  const jamSyncLabel = jamLastSyncAt
    ? new Date(jamLastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'not synced yet';
  const repeatIconColor = repeatMode === 'off' ? palette.text : '#0A0A0A';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 8,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.iconBtn, { backgroundColor: palette.surface, borderColor: isDark ? '#3C3C3E' : '#D1D5DB' }]}
        >
          <ChevronDown stroke={palette.text} size={26} />
        </TouchableOpacity>

        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              color: palette.textSubtle,
              fontWeight: '700',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: 4,
            }}
          >
            Now Playing
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleSaveTrack}
          style={[
            styles.iconBtn,
            { backgroundColor: palette.surface, borderColor: isDark ? '#3C3C3E' : '#D1D5DB' },
            isSaved && { backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' },
          ]}
        >
          <Heart stroke="#FFF" fill={isSaved ? '#FFF' : 'transparent'} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 28 }}>
          <View
            style={[
              {
                width: ART_SIZE + 24,
                height: ART_SIZE + 24,
                borderRadius: (ART_SIZE + 24) / 2,
                backgroundColor: palette.surface,
                borderWidth: 4,
                borderColor: currentTrack.color,
                alignItems: 'center',
                justifyContent: 'center',
              },
              shadow(`0 8px 32px ${currentTrack.color}60`, {
                shadowColor: currentTrack.color,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.5,
                shadowRadius: 20,
                elevation: 20,
              }),
            ]}
          >
            <Animated.View
              style={{
                width: ART_SIZE,
                height: ART_SIZE,
                borderRadius: ART_SIZE / 2,
                overflow: 'hidden',
                borderWidth: 6,
                borderColor: palette.background,
                transform: [{ rotate: spin }],
              }}
            >
              <Image source={{ uri: currentTrack.artwork }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            </Animated.View>

            <View
              style={{
                position: 'absolute',
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: palette.background,
                borderWidth: 3,
                borderColor: currentTrack.color,
              }}
            />
          </View>
        </View>

        <View style={{ marginBottom: 20 }}>
          <View style={{ width: 40, height: 4, backgroundColor: currentTrack.color, marginBottom: 10 }} />

          <Text
            style={{ color: palette.text, fontSize: 26, fontWeight: '900', textTransform: 'uppercase', letterSpacing: -0.5, lineHeight: 30 }}
            numberOfLines={2}
          >
            {currentTrack.title}
          </Text>
          <Text
            style={{ color: palette.textSubtle, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 3, marginTop: 8 }}
            numberOfLines={1}
          >
            {currentTrack.artist}
          </Text>
        </View>

        <View style={{ marginBottom: 28 }}>
          <ProgressSlider accentColor={currentTrack.color} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <TouchableOpacity
            onPress={handlePrevTrack}
            style={[
              styles.skipBtn,
              {
                backgroundColor: isDark ? '#FFF' : '#0A0A0A',
                borderColor: palette.border,
                opacity: controlsLocked ? 0.55 : 1,
              },
              shadow('4px 4px 0px rgba(255,255,255,1)', {
                shadowColor: '#FFF',
                shadowOffset: { width: 4, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 0,
              }),
            ]}
          >
            <SkipBack stroke={isDark ? '#0A0A0A' : '#FFF'} fill={isDark ? '#0A0A0A' : '#FFF'} size={22} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleTogglePlay}
            style={[
              styles.playBtn,
              { backgroundColor: currentTrack.color, borderColor: palette.border, opacity: controlsLocked ? 0.55 : 1 },
              shadow(`6px 6px 0px ${currentTrack.color}80`, {
                shadowColor: currentTrack.color,
                shadowOffset: { width: 6, height: 6 },
                shadowOpacity: 0.8,
                shadowRadius: 0,
              }),
            ]}
          >
            {isPlaying ? <Pause stroke="#FFF" fill="#FFF" size={32} /> : <Play stroke="#FFF" fill="#FFF" size={32} />}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNextTrack}
            style={[
              styles.skipBtn,
              {
                backgroundColor: isDark ? '#FFF' : '#0A0A0A',
                borderColor: palette.border,
                opacity: controlsLocked ? 0.55 : 1,
              },
              shadow('4px 4px 0px rgba(255,255,255,1)', {
                shadowColor: '#FFF',
                shadowOffset: { width: 4, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 0,
              }),
            ]}
          >
            <SkipForward stroke={isDark ? '#0A0A0A' : '#FFF'} fill={isDark ? '#0A0A0A' : '#FFF'} size={22} />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 22 }}>
          <TouchableOpacity
            onPress={handleShuffleToggle}
            style={[
              styles.modeBtn,
              { backgroundColor: palette.surface, borderColor: isDark ? '#3C3C3E' : '#D1D5DB', opacity: controlsLocked ? 0.55 : 1 },
              shuffleEnabled && { backgroundColor: '#00FF85', borderColor: '#00FF85' },
            ]}
          >
            <Shuffle stroke={shuffleEnabled ? '#0A0A0A' : palette.text} size={18} />
            <Text style={{ color: shuffleEnabled ? '#0A0A0A' : palette.text, fontWeight: '800', fontSize: 10, marginLeft: 6 }}>
              SHUFFLE
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRepeatCycle}
            style={[
              styles.modeBtn,
              { backgroundColor: palette.surface, borderColor: isDark ? '#3C3C3E' : '#D1D5DB', opacity: controlsLocked ? 0.55 : 1 },
              repeatMode !== 'off' && { backgroundColor: '#FFD700', borderColor: '#FFD700' },
            ]}
          >
            {repeatMode === 'one'
              ? <Repeat1 stroke={repeatIconColor} size={18} />
              : <Repeat stroke={repeatIconColor} size={18} />}
            <Text style={{ color: repeatIconColor, fontWeight: '800', fontSize: 10, marginLeft: 6 }}>
              {repeatMode === 'off' ? 'REPEAT OFF' : repeatMode === 'all' ? 'REPEAT ALL' : 'REPEAT ONE'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 14 }}>
          <TouchableOpacity
            onPress={handleStartJam}
            style={[styles.actionBtn, { borderColor: palette.accent, backgroundColor: palette.surface }]}
          >
            <UsersRound stroke={palette.accent} size={18} />
            <Text style={[styles.actionBtnText, { color: palette.accent }]}>{jamConnected ? 'MANAGE JAM' : 'START JAM'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShareTrack} style={[styles.actionBtn, { borderColor: palette.accent, backgroundColor: palette.surface }]}> 
            <Share2 stroke={palette.accent} size={18} />
            <Text style={[styles.actionBtnText, { color: palette.accent }]}>SHARE</Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            marginTop: 14,
            borderWidth: 2,
            borderColor: jamConnected ? palette.accentStrong : (isDark ? '#3C3C3E' : '#D1D5DB'),
            backgroundColor: palette.surface,
            padding: 12,
          }}
        >
          <Text style={{ color: jamConnected ? palette.accentStrong : palette.textSubtle, fontWeight: '900', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
            {jamConnected ? `Jam Live: ${jamSessionCode}` : 'Jam Session Offline'}
          </Text>
          <Text style={{ color: palette.textMuted, fontWeight: '700', fontSize: 10, marginTop: 6, textTransform: 'uppercase' }}>
            {jamConnected
              ? `${jamRole?.toUpperCase()} • ${jamParticipantCount} participant${jamParticipantCount === 1 ? '' : 's'} • Last sync ${jamSyncLabel}`
              : 'Create or join a room to sync playback and queue with friends.'}
          </Text>
        </View>

        <View style={{ marginTop: 22 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <ListMusic stroke={palette.accent} size={16} />
            <Text style={{ color: palette.accent, fontWeight: '800', fontSize: 12, letterSpacing: 2, marginLeft: 8 }}>
              QUEUE ({queue.length})
            </Text>
          </View>

          {queue.length === 0 ? (
            <Text style={{ color: palette.textSubtle, fontWeight: '700' }}>No tracks queued yet.</Text>
          ) : (
            queue.slice(0, 12).map((track, index) => {
              const isCurrent = track.id === currentTrack.id;
              return (
                <TouchableOpacity
                  key={track.id + index}
                  onPress={() => {
                    if (controlsLocked) {
                      lockMessage();
                      return;
                    }
                    if (!isCurrent) {
                      void setCurrentTrack(track);
                    }
                  }}
                  style={{
                    backgroundColor: isCurrent ? `${currentTrack.color}33` : palette.surface,
                    borderWidth: 2,
                    borderColor: isCurrent ? currentTrack.color : isDark ? '#2A2A2A' : '#D1D5DB',
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    marginBottom: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    opacity: controlsLocked ? 0.65 : 1,
                  }}
                >
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text numberOfLines={1} style={{ color: palette.text, fontWeight: '800', fontSize: 12 }}>
                      {track.title}
                    </Text>
                    <Text numberOfLines={1} style={{ color: palette.textMuted, fontWeight: '700', fontSize: 10, marginTop: 2 }}>
                      {track.artist}
                    </Text>
                  </View>
                  <Text style={{ color: isCurrent ? currentTrack.color : '#6B7280', fontWeight: '900', fontSize: 10 }}>
                    {isCurrent ? 'PLAYING' : `#${index + 1}`}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      <Modal visible={jamModalVisible} animationType="fade" transparent onRequestClose={() => setJamModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: palette.surface, borderWidth: 3, borderColor: palette.border, padding: 16 }}>
            <Text style={{ color: palette.text, fontWeight: '900', fontSize: 18, textTransform: 'uppercase' }}>Jam Session</Text>

            {jamError && (
              <Text style={{ color: '#FF6B6B', fontWeight: '700', fontSize: 11, marginTop: 8, textTransform: 'uppercase' }}>
                {jamError}
              </Text>
            )}

            {jamConnected ? (
              <View style={{ marginTop: 14 }}>
                <Text style={{ color: palette.text, fontWeight: '900', fontSize: 14, textTransform: 'uppercase' }}>
                  Room Code: {jamSessionCode}
                </Text>
                <Text style={{ color: palette.textMuted, fontWeight: '700', fontSize: 11, marginTop: 6, textTransform: 'uppercase' }}>
                  {jamRole?.toUpperCase()} • {jamParticipantCount} participant{jamParticipantCount === 1 ? '' : 's'}
                </Text>

                <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
                  <TouchableOpacity
                    disabled={jamBusy}
                    onPress={() => void shareSession()}
                    style={[styles.modalBtn, { borderColor: palette.accent, backgroundColor: palette.accent }]}
                  >
                    <Text style={[styles.modalBtnText, { color: '#0A0A0A' }]}>Share Code</Text>
                  </TouchableOpacity>

                  {jamRole === 'guest' && (
                    <TouchableOpacity
                      disabled={jamBusy}
                      onPress={() => void requestSync()}
                      style={[styles.modalBtn, { borderColor: '#FFD700', backgroundColor: '#FFD700' }]}
                    >
                      <Text style={[styles.modalBtnText, { color: '#0A0A0A' }]}>Sync Now</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  disabled={jamBusy}
                  onPress={handleLeaveJamSession}
                  style={[styles.modalBtn, { marginTop: 8, borderColor: '#FF6B6B', backgroundColor: '#FF6B6B' }]}
                >
                  <Text style={[styles.modalBtnText, { color: '#0A0A0A' }]}>{jamBusy ? 'Working...' : 'Leave Session'}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ marginTop: 14 }}>
                <TouchableOpacity
                  disabled={jamBusy}
                  onPress={handleCreateJamSession}
                  style={[styles.modalBtn, { borderColor: palette.accentStrong, backgroundColor: palette.accentStrong }]}
                >
                  <Text style={[styles.modalBtnText, { color: '#0A0A0A' }]}>{jamBusy ? 'Creating...' : 'Create New Jam'}</Text>
                </TouchableOpacity>

                <TextInput
                  value={joinCodeInput}
                  onChangeText={setJoinCodeInput}
                  autoCapitalize="characters"
                  maxLength={6}
                  placeholder="ENTER ROOM CODE"
                  placeholderTextColor="rgba(10,10,10,0.45)"
                  style={{
                    marginTop: 10,
                    borderWidth: 2,
                    borderColor: palette.border,
                    backgroundColor: '#FFFFFF',
                    color: '#0A0A0A',
                    fontWeight: '800',
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                />

                <TouchableOpacity
                  disabled={jamBusy}
                  onPress={handleJoinJamSession}
                  style={[styles.modalBtn, { marginTop: 8, borderColor: palette.accent, backgroundColor: palette.accent }]}
                >
                  <Text style={[styles.modalBtnText, { color: '#0A0A0A' }]}>{jamBusy ? 'Joining...' : 'Join With Code'}</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              onPress={() => setJamModalVisible(false)}
              style={[styles.modalBtn, { marginTop: 12, borderColor: palette.border, backgroundColor: palette.surfaceAlt }]}
            >
              <Text style={[styles.modalBtnText, { color: palette.text }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles: Record<string, any> = {
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtn: {
    width: 60,
    height: 60,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 2,
  },
  actionBtnText: {
    fontWeight: '900',
    fontSize: 10,
    marginLeft: 8,
    letterSpacing: 1,
  },
  modalBtn: {
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  modalBtnText: {
    fontWeight: '900',
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: 0.8,
  },
};
