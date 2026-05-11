import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { COLORS } from '../../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: 'Professional Templates',
    desc: 'Choose from a variety of ATS-friendly templates designed by career experts.',
    icon: '📄',
    color: COLORS.accent,
  },
  {
    id: 2,
    title: 'AI-Powered Writing',
    desc: 'Let our AI help you write compelling summaries and professional descriptions.',
    icon: '⚡',
    color: COLORS.gold,
  },
  {
    id: 3,
    title: 'Instant PDF Export',
    desc: 'Generate your professional CV in seconds and download it directly to your device.',
    icon: '🚀',
    color: COLORS.emerald,
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = async () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      navigation.replace('Login');
    }
  };

  const skip = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    navigation.replace('Login');
  };

  const slide = SLIDES[currentSlide];

  return (
    <View style={styles.root}>
      <TouchableOpacity style={styles.skipBtn} onPress={skip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={[styles.iconBox, { backgroundColor: slide.color + '20' }]}>
          <Text style={styles.icon}>{slide.icon}</Text>
        </View>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.desc}>{slide.desc}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, currentSlide === i && styles.dotActive]} />
          ))}
        </View>

        <TouchableOpacity style={[styles.nextBtn, { backgroundColor: slide.color }]} onPress={handleNext}>
          <Text style={styles.nextBtnText}>
            {currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg, padding: 24, justifyContent: 'center' },
  skipBtn: { position: 'absolute', top: 60, right: 24 },
  skipText: { color: COLORS.textMuted, fontSize: 16, fontWeight: '600' },
  content: { alignItems: 'center' },
  iconBox: {
    width: 160, height: 160, borderRadius: 80,
    alignItems: 'center', justifyContent: 'center', marginBottom: 40,
  },
  icon: { fontSize: 80 },
  title: { fontSize: 32, fontWeight: '900', color: COLORS.white, textAlign: 'center', marginBottom: 16 },
  desc: { fontSize: 16, color: COLORS.textDim, textAlign: 'center', lineHeight: 24, paddingHorizontal: 20 },
  footer: { position: 'absolute', bottom: 60, left: 24, right: 24, alignItems: 'center' },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 40 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.surface },
  dotActive: { width: 24, backgroundColor: COLORS.accent },
  nextBtn: { width: '100%', height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', elevation: 10 },
  nextBtnText: { color: COLORS.white, fontSize: 18, fontWeight: '800' },
});
