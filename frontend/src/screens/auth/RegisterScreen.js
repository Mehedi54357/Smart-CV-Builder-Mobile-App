import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../redux/slices/authSlice';
import { registerSchema } from '../../utils/validation';
import { COLORS } from '../../theme/colors';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';

export default function RegisterScreen({ navigation }) {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((s) => s.auth);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    const res = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(res)) {
      Alert.alert('Registration Successful', 'Your account has been created.');
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1500);
    } else {
      Alert.alert('Registration Failed', res.payload);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSec}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backTxt}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Join <Text style={{color: COLORS.accent}}>SmartCV</Text></Text>
          <Text style={styles.subtitle}>Let's build your professional identity together</Text>
        </View>

        <View style={styles.authContainer}>
          <View style={styles.glassCard}>
            <View style={styles.form}>
              <Controller name="fullName" control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <InputField label="Full Name" placeholder="Md. Rakibul Islam"
                    value={value} onChangeText={onChange} onBlur={onBlur}
                    error={errors.fullName?.message} required />
                )} />

              <Controller name="email" control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <InputField label="Email Address" placeholder="name@company.com"
                    value={value} onChangeText={onChange} onBlur={onBlur}
                    error={errors.email?.message} keyboardType="email-address" required />
                )} />

              <Controller name="phone" control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <InputField label="Mobile Number" placeholder="01XXXXXXXXX"
                    value={value} onChangeText={onChange} onBlur={onBlur}
                    error={errors.phone?.message} keyboardType="phone-pad" required />
                )} />

              <Controller name="password" control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <InputField label="Password" placeholder="••••••••"
                    value={value} onChangeText={onChange} onBlur={onBlur}
                    error={errors.password?.message} secureTextEntry required />
                )} />

              <Controller name="confirmPassword" control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <InputField label="Confirm Password" placeholder="••••••••"
                    value={value} onChangeText={onChange} onBlur={onBlur}
                    error={errors.confirmPassword?.message} secureTextEntry required />
                )} />

              <View style={styles.termsBox}>
                <Text style={styles.termsText}>
                  By creating an account, you agree to our{' '}
                  <Text style={styles.link}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={styles.link}>Privacy Policy</Text>
                </Text>
              </View>

              <Button 
                title="Create Account" 
                onPress={handleSubmit(onSubmit)} 
                loading={isLoading} 
                size="lg" 
                style={styles.mainBtn}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.hasAccount}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}> Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1 },
  headerSec: { 
    paddingTop: 70, 
    paddingBottom: 30, 
    paddingHorizontal: 28,
    backgroundColor: COLORS.bg,
  },
  backBtn: { marginBottom: 20, width: 60 },
  backTxt: { color: COLORS.textMuted, fontSize: 15, fontWeight: '700' },
  title: { fontSize: 34, fontWeight: '900', color: COLORS.white, letterSpacing: -1.5 },
  subtitle: { fontSize: 15, color: COLORS.textMuted, marginTop: 10, fontWeight: '600', letterSpacing: 0.2 },
  
  authContainer: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  glassCard: { 
    backgroundColor: COLORS.bgCard, 
    borderRadius: 32, 
    padding: 30, 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4, shadowRadius: 30,
    elevation: 10,
  },
  form: { gap: 8 },
  termsBox: { marginVertical: 20, paddingHorizontal: 10 },
  termsText: { fontSize: 12.5, color: COLORS.textMuted, lineHeight: 20, textAlign: 'center', fontWeight: '500' },
  link: { color: COLORS.accent, fontWeight: '700' },
  mainBtn: { marginTop: 15, borderRadius: 18, height: 58, backgroundColor: COLORS.accent },
  
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  hasAccount: { color: COLORS.textDim, fontSize: 15, fontWeight: '500' },
  loginLink: { color: COLORS.accent, fontSize: 15, fontWeight: '800' },
});
