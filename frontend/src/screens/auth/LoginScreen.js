import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../redux/slices/authSlice';
import { loginSchema } from '../../utils/validation';
import { COLORS } from '../../theme/colors';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((s) => s.auth);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    const res = await dispatch(loginUser(data));
    if (loginUser.rejected.match(res)) {
      Alert.alert('Login Failed', res.payload);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSec}>
          <View style={styles.logoRing}>
            <View style={styles.logoBox}>
              <Text style={styles.logoIcon}>📄</Text>
            </View>
          </View>
          <Text style={styles.appName}>SmartCV <Text style={{color: COLORS.accent}}>Pro</Text></Text>
          <Text style={styles.appSub}>Craft your future with professional CVs</Text>
        </View>

        {/* Auth Container */}
        <View style={styles.authContainer}>
          <View style={styles.glassCard}>
            <Text style={styles.welcomeTxt}>Welcome Back</Text>
            <Text style={styles.loginSub}>Sign in to continue your journey</Text>

            <View style={styles.form}>
              <Controller name="emailOrPhone" control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <InputField 
                    label="Email or Phone" 
                    placeholder="Enter your email or phone"
                    value={value} 
                    onChangeText={onChange} 
                    onBlur={onBlur}
                    error={errors.emailOrPhone?.message} 
                    keyboardType="email-address" 
                    required 
                  />
                )} />

              <Controller name="password" control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <InputField 
                    label="Password" 
                    placeholder="••••••••"
                    value={value} 
                    onChangeText={onChange} 
                    onBlur={onBlur}
                    error={errors.password?.message} 
                    secureTextEntry 
                    required 
                  />
                )} />

              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              <Button 
                title="Sign In" 
                onPress={handleSubmit(onSubmit)} 
                loading={isLoading} 
                size="lg" 
                style={styles.mainBtn} 
              />
            </View>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.footer}>
              <Text style={styles.noAccount}>New to SmartCV?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.createLink}> Create an account</Text>
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
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
  logoRing: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.accentSoft,
    shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2, shadowRadius: 15,
    marginBottom: 20,
  },
  logoBox: {
    width: 62, height: 62, borderRadius: 20,
    backgroundColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center',
    elevation: 8, shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10,
  },
  logoIcon: { fontSize: 32 },
  appName: { fontSize: 32, fontWeight: '900', color: COLORS.white, letterSpacing: -1.5 },
  appSub: { fontSize: 14, color: COLORS.textMuted, marginTop: 8, fontWeight: '600', letterSpacing: 0.2 },
  
  authContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  glassCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 32,
    padding: 32,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4, shadowRadius: 30,
    elevation: 10,
  },
  welcomeTxt: { fontSize: 28, fontWeight: '800', color: COLORS.white, textAlign: 'center', letterSpacing: -0.5 },
  loginSub: { fontSize: 15, color: COLORS.textMuted, textAlign: 'center', marginTop: 8, marginBottom: 35, fontWeight: '500' },
  
  form: { gap: 12 },
  forgotBtn: { alignSelf: 'flex-end', paddingVertical: 8 },
  forgotText: { color: COLORS.accent, fontSize: 14, fontWeight: '700' },
  mainBtn: { marginTop: 15, borderRadius: 18, height: 58, backgroundColor: COLORS.accent },
  
  divider: { flexDirection: 'row', alignItems: 'center', gap: 15, marginVertical: 35 },
  line: { flex: 1, height: 1.2, backgroundColor: COLORS.border },
  dividerText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5 },
  
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 5 },
  noAccount: { color: COLORS.textDim, fontSize: 15, fontWeight: '500' },
  createLink: { color: COLORS.accent, fontSize: 15, fontWeight: '800' },
});
