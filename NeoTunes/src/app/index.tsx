import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>N</Text>
            </View>
            <Text style={styles.brandTitle}>
              NEO <Text style={styles.brandAccent}>TUNES</Text>
            </Text>
          </View>
          
          <View style={styles.enginePill}>
            <Text style={styles.engineText}>N/OS SPATIAL</Text>
          </View>
        </View>

        {/* Hero Artwork Composition */}
        <View style={styles.heroContainer}>
          <View style={styles.artworkWrapper}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80' }}
              style={styles.heroArtwork}
            />
            <View style={styles.badgeOverlay}>
              <Text style={styles.audioFormatBadge}>24-BIT / 96KHZ SPATIAL</Text>
            </View>
          </View>
        </View>

        {/* Main Headline */}
        <View style={styles.textSection}>
          <Text style={styles.mainHeadline}>
            YOUR MUSIC. YOUR MOOD.{'\n'}
            <Text style={styles.universeAccent}>your universe.</Text>
          </Text>

          <Text style={styles.subtitle}>
            Discover music, build your library, and listen your way with Hi-Res spatial soundscapes and intelligent recommendations.
          </Text>

          <Text style={styles.microSubtitle}>
            Personal recommendations • Spatial audio • Smart discovery
          </Text>
        </View>

        {/* CTAs */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => router.push('/home')}
          >
            <Text style={styles.primaryButtonText}>GET STARTED →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={() => router.push('/auth')}
          >
            <Text style={styles.secondaryButtonText}>I already have an account</Text>
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <Text style={styles.footerText}>
          By continuing, you agree to our <Text style={styles.linkText}>Terms of Service</Text> and <Text style={styles.linkText}>Privacy Policy</Text>.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05070B',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 90,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#00D9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#05070B',
    fontWeight: '900',
    fontSize: 18,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: 1,
  },
  brandAccent: {
    color: '#DFFF00',
  },
  enginePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  engineText: {
    color: '#DFFF00',
    fontSize: 9,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  heroContainer: {
    marginVertical: 12,
    alignItems: 'center',
  },
  artworkWrapper: {
    width: 200,
    height: 200,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  },
  heroArtwork: {
    width: '100%',
    height: '100%',
  },
  badgeOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(5, 7, 11, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(223, 255, 0, 0.3)',
  },
  audioFormatBadge: {
    color: '#DFFF00',
    fontSize: 8.5,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  textSection: {
    alignItems: 'center',
    marginVertical: 12,
  },
  mainHeadline: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 28,
    letterSpacing: 0.5,
  },
  universeAccent: {
    color: '#00D9FF',
    textTransform: 'lowercase',
  },
  subtitle: {
    color: '#A1A1A6',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 290,
    lineHeight: 17,
  },
  microSubtitle: {
    color: '#DFFF00',
    fontSize: 9.5,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  ctaContainer: {
    width: '100%',
    gap: 10,
    marginVertical: 14,
  },
  primaryButton: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    backgroundColor: '#DFFF00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#05070B',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  secondaryButton: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  footerText: {
    color: '#A1A1A6',
    fontSize: 10.5,
    textAlign: 'center',
    marginTop: 4,
  },
  linkText: {
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
});
