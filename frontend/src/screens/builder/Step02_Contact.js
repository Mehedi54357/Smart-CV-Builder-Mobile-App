// ─── STEP 02: Contact Information ────────────────────────────────
import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { updateFormData, nextStep, prevStep, saveDraftAll } from '../../redux/slices/builderSlice';
import { COLORS } from '../../theme/colors';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import { StepHeader } from '../../components/common/StepIndicator';
import { Alert } from 'react-native';

export default function Step02_Contact({ navigation }) {
  const dispatch = useDispatch();
  const formData = useSelector(s => s.builder.formData);
  const isSaving = useSelector(s => s.builder.isSaving);

  const { control, handleSubmit, formState: { errors } } = useForm({ defaultValues: formData });

  const onNext = async (data) => {
    dispatch(updateFormData(data));
    await dispatch(saveDraftAll());
    dispatch(nextStep());
    navigation.navigate('Step03');
  };

  const onSaveDraft = async (data) => {
    dispatch(updateFormData(data));
    await dispatch(saveDraftAll());
    Alert.alert('Success', 'Draft saved successfully!');
  };

  const onBack = () => { dispatch(prevStep()); navigation.goBack(); };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StepHeader step={2} totalSteps={11} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        <Controller name="phone" control={control} rules={{ required: 'Mobile number required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <InputField label="Mobile Number (BD)" placeholder="01XXXXXXXXX" required
              value={value} onChangeText={onChange} onBlur={onBlur}
              keyboardType="phone-pad" error={errors.phone?.message} />
          )} />

        <Controller name="altPhone" control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <InputField label="Alternative Number (Optional)" placeholder="01XXXXXXXXX"
              value={value} onChangeText={onChange} onBlur={onBlur} keyboardType="phone-pad" />
          )} />

        <Controller name="email" control={control} rules={{ required: 'Email required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <InputField label="Email Address" placeholder="email@example.com" required
              value={value} onChangeText={onChange} onBlur={onBlur}
              keyboardType="email-address" error={errors.email?.message} />
          )} />

        <Controller name="linkedin" control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <InputField label="LinkedIn Profile URL (Optional)" placeholder="linkedin.com/in/yourname"
              value={value} onChangeText={onChange} onBlur={onBlur} />
          )} />

        <Controller name="github" control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <InputField label="GitHub Profile (Optional)" placeholder="github.com/yourname"
              value={value} onChangeText={onChange} onBlur={onBlur} />
          )} />

        <Controller name="portfolio" control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <InputField label="Portfolio Website (Optional)" placeholder="https://yoursite.com"
              value={value} onChangeText={onChange} onBlur={onBlur} />
          )} />
      </ScrollView>

      <View style={styles.bottomNav}>
        <Button title="← Back" variant="ghost" onPress={onBack} style={{ flex: 1 }} disabled={isSaving} />
        <Button title={isSaving ? 'Saving...' : 'Save Draft'} variant="secondary" onPress={handleSubmit(onSaveDraft)} style={{ flex: 1 }} disabled={isSaving} />
        <Button title="Next →" onPress={handleSubmit(onNext)} style={{ flex: 1 }} disabled={isSaving} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 20 },
  bottomNav: {
    flexDirection: 'row', gap: 8, padding: 16,
    borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.bgCard,
  },
});
