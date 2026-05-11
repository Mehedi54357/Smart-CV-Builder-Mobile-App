// SplashScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setToken } from '../../redux/slices/authSlice';
import { COLORS } from '../../theme/colors';

export default function SplashScreen({ navigation }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const init = async () => {
      await new Promise(r => setTimeout(r, 2000));
      const token = await AsyncStorage.getItem('authToken');
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');

      if (token) {
        dispatch(setToken(token));
        // Navigation is usually handled by AppNavigator when token state changes, 
        // but if it's not automatic, we should ensure it goes to Dashboard.
      } else if (!hasSeenOnboarding) {
        navigation.replace('Onboarding');
      } else {
        navigation.replace('Login');
      }
    };
    init();
  }, []);

  return (
    <View style={styles.root}>
      <View style={styles.logoBox}>
        <Text style={styles.logoIcon}>⊞</Text>
      </View>
      <Text style={styles.appName}>SmartCV</Text>
      <Text style={styles.appSub}>Builder Pro</Text>
      <ActivityIndicator color={COLORS.accent} style={{ marginTop: 40 }} size="large" />
      <Text style={styles.tagline}>Professional CVs for Bangladesh</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F2044', alignItems: 'center', justifyContent: 'center' },
  logoBox: { width: 80, height: 80, borderRadius: 20, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  logoIcon: { fontSize: 36, color: COLORS.white },
  appName: { fontSize: 36, fontWeight: '900', color: COLORS.white, letterSpacing: -1 },
  appSub: { fontSize: 18, color: '#93C5FD', fontWeight: '300', letterSpacing: 4, textTransform: 'uppercase' },
  tagline: { position: 'absolute', bottom: 40, color: '#64748B', fontSize: 12 },
});
