import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { COLORS } from '../../theme/colors';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import { authAPI } from '../../api/auth.api';

export default function ForgotPasswordScreen({ navigation }) {
  const { control, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async ({ emailOrPhone }) => {
    setLoading(true);
    try {
      await authAPI.forgotPassword({ emailOrPhone });
      Alert.alert('OTP Sent', 'Check your email/phone for the reset code', [
        { text: 'OK', onPress: () => navigation.navigate('OtpVerify', { email: emailOrPhone }) },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={{ color: COLORS.accent, fontSize: 16 }}>← Back</Text>
      </TouchableOpacity>
      <View style={styles.body}>
        <Text style={styles.icon}>🔑</Text>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.sub}>Enter your email or phone to receive a reset OTP</Text>

        <Controller name="emailOrPhone" control={control}
          rules={{ required: 'Email or phone required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <InputField label="Email or Phone" placeholder="email@example.com or 01XXXXXXXXX"
              value={value} onChangeText={onChange} onBlur={onBlur}
              error={errors.emailOrPhone?.message} required />
          )} />

        <Button title="Send OTP" onPress={handleSubmit(onSubmit)} loading={loading} size="lg" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg, padding: 24, paddingTop: 60 },
  back: { marginBottom: 32 },
  body: { flex: 1, justifyContent: 'center' },
  icon: { fontSize: 48, textAlign: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.white, textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
});
