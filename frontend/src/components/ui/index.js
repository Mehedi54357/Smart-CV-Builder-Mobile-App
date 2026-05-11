import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated,
  TouchableOpacity, Modal, ActivityIndicator,
  Platform, StatusBar,
} from 'react-native';
import { COLORS } from '../../theme/colors';

// ── Toast Notification ────────────────────────────────────────────
export const Toast = ({ toast }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (toast) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 30, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [toast]);

  if (!toast) return null;
  const colors = {
    success: { bg: '#065F46', border: COLORS.emerald, icon: '✅' },
    error:   { bg: '#9F1239', border: COLORS.rose,    icon: '❌' },
    warning: { bg: '#92400E', border: COLORS.gold,    icon: '⚠️' },
    info:    { bg: '#1E3A8A', border: COLORS.accent,  icon: 'ℹ️' },
  };
  const c = colors[toast.type] || colors.success;

  return (
    <Animated.View style={[styles.toast, { backgroundColor: c.bg, borderColor: c.border, opacity, transform: [{ translateY }] }]}>
      <Text style={styles.toastIcon}>{c.icon}</Text>
      <Text style={styles.toastMsg}>{toast.message}</Text>
    </Animated.View>
  );
};

// ── Offline Banner ─────────────────────────────────────────────────
export const OfflineBanner = ({ visible }) => {
  const translateY = useRef(new Animated.Value(-50)).current;
  useEffect(() => {
    Animated.timing(translateY, { toValue: visible ? 0 : -50, duration: 300, useNativeDriver: true }).start();
  }, [visible]);
  return (
    <Animated.View style={[styles.offlineBanner, { transform: [{ translateY }] }]}>
      <Text style={styles.offlineText}>📡  No internet connection</Text>
    </Animated.View>
  );
};

// ── Loading Overlay ────────────────────────────────────────────────
export const LoadingOverlay = ({ visible, message = 'Please wait...' }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.overlayCard}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.overlayMsg}>{message}</Text>
      </View>
    </View>
  </Modal>
);

// ── Empty State ────────────────────────────────────────────────────
export const EmptyState = ({ icon = '📭', title, subtitle, onAction, actionLabel }) => (
  <View style={styles.emptyBox}>
    <Text style={styles.emptyIcon}>{icon}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle ? <Text style={styles.emptySub}>{subtitle}</Text> : null}
    {onAction && (
      <TouchableOpacity style={styles.emptyBtn} onPress={onAction}>
        <Text style={styles.emptyBtnTxt}>{actionLabel || 'Get Started'}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ── Skeleton Loader ────────────────────────────────────────────────
export const Skeleton = ({ width = '100%', height = 16, borderRadius = 8, style }) => {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[{ width, height, borderRadius, backgroundColor: COLORS.surface, opacity }, style]} />
  );
};

// ── Section Header ─────────────────────────────────────────────────
export const SectionHeader = ({ title, subtitle, action, onAction }) => (
  <View style={styles.secHead}>
    <View>
      <Text style={styles.secTitle}>{title}</Text>
      {subtitle ? <Text style={styles.secSub}>{subtitle}</Text> : null}
    </View>
    {action && (
      <TouchableOpacity style={styles.secAction} onPress={onAction}>
        <Text style={styles.secActionTxt}>{action}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ── Badge ──────────────────────────────────────────────────────────
export const Badge = ({ label, color = COLORS.accent, small = false }) => (
  <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color + '40' }, small && styles.badgeSm]}>
    <Text style={[styles.badgeTxt, { color }, small && styles.badgeTxtSm]}>{label}</Text>
  </View>
);

// ── Divider ────────────────────────────────────────────────────────
export const Divider = ({ label }) => (
  <View style={styles.divider}>
    <View style={styles.divLine} />
    {label && <Text style={styles.divLabel}>{label}</Text>}
    {label && <View style={styles.divLine} />}
  </View>
);

// ── Screen Header ──────────────────────────────────────────────────
export const ScreenHeader = ({ title, subtitle, rightAction, onBack, navigation }) => (
  <View style={styles.screenHeader}>
    {(onBack || navigation) && (
      <TouchableOpacity style={styles.backBtn} onPress={onBack || (() => navigation.goBack())}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>
    )}
    <View style={{ flex: 1 }}>
      <Text style={styles.screenTitle}>{title}</Text>
      {subtitle ? <Text style={styles.screenSub}>{subtitle}</Text> : null}
    </View>
    {rightAction}
  </View>
);

const styles = StyleSheet.create({
  toast: {
    position: 'absolute', bottom: 32, left: 20, right: 20,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderRadius: 12, borderWidth: 1,
    zIndex: 9999,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 10,
  },
  toastIcon: { fontSize: 18 },
  toastMsg:  { color: '#FFFFFF', fontSize: 14, fontWeight: '600', flex: 1 },
  offlineBanner: {
    position: 'absolute', top: 0, left: 0, right: 0,
    backgroundColor: '#7F1D1D', padding: 10,
    alignItems: 'center', zIndex: 9998,
    paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 10,
  },
  offlineText: { color: '#FCA5A5', fontSize: 13, fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  overlayCard: { backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 32, alignItems: 'center', gap: 16, minWidth: 180, borderWidth: 1, borderColor: COLORS.border },
  overlayMsg: { color: COLORS.textDim, fontSize: 14, fontWeight: '500' },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 6, textAlign: 'center' },
  emptySub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  emptyBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
  emptyBtnTxt: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  secHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  secTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  secSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  secAction: { backgroundColor: COLORS.accentSoft, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: COLORS.borderActive },
  secActionTxt: { color: COLORS.accent, fontWeight: '700', fontSize: 12 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, borderWidth: 1 },
  badgeSm: { paddingHorizontal: 7, paddingVertical: 2 },
  badgeTxt: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  badgeTxtSm: { fontSize: 9 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 16 },
  divLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  divLabel: { color: COLORS.textMuted, fontSize: 12 },
  screenHeader: {
    backgroundColor: '#0F2044', paddingTop: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight || 0) + 16,
    paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: '#FFFFFF', fontSize: 20, fontWeight: '300' },
  screenTitle: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  screenSub: { fontSize: 12, color: '#93C5FD', marginTop: 2 },
});
