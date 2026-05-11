// OtpVerifyScreen.js
import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOTP } from '../../redux/slices/authSlice';
import { COLORS } from '../../theme/colors';
import Button from '../../components/common/Button';

export default function OtpVerifyScreen({ route, navigation }) {
  const { email, phone } = route.params || {};
  const dispatch = useDispatch();
  const { isLoading } = useSelector(s => s.auth);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const refs = useRef([]);

  const handleChange = (val, idx) => {
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleSubmit = async () => {
    const code = otp.join('');
    if (code.length < 6) return Alert.alert('Enter full 6-digit OTP');
    const res = await dispatch(verifyOTP({ otp: code, email, phone }));
    if (verifyOTP.rejected.match(res)) Alert.alert('Invalid OTP', res.payload);
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.icon}>✉️</Text>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.sub}>A 6-digit code was sent to{'\n'}{email || phone}</Text>
      </View>
      <View style={styles.otpRow}>
        {otp.map((val, i) => (
          <TextInput key={i} ref={r => refs.current[i] = r}
            value={val} onChangeText={v => handleChange(v.slice(-1), i)}
            keyboardType="number-pad" maxLength={1}
            style={[styles.otpBox, val && styles.otpFilled]}
            selectionColor={COLORS.accent}
          />
        ))}
      </View>
      <Button title="Verify & Continue" onPress={handleSubmit} loading={isLoading} size="lg" style={styles.btn} />
      <TouchableOpacity style={styles.resendBtn}>
        <Text style={styles.resendText}>Didn't receive? <Text style={{ color: COLORS.accent }}>Resend OTP</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg, padding: 28, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.white, marginBottom: 8 },
  sub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 32 },
  otpBox: {
    width: 46, height: 56, borderRadius: 10, borderWidth: 2,
    borderColor: COLORS.border, backgroundColor: COLORS.surface,
    textAlign: 'center', fontSize: 22, fontWeight: '800', color: COLORS.text,
  },
  otpFilled: { borderColor: COLORS.accent, backgroundColor: COLORS.accentSoft },
  btn: { marginHorizontal: 0 },
  resendBtn: { alignItems: 'center', marginTop: 20 },
  resendText: { color: COLORS.textMuted, fontSize: 14 },
});
