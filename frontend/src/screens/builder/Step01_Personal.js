import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { updateFormData, nextStep, saveDraftAll } from '../../redux/slices/builderSlice';
import ProfilePhotoUpload from '../auth/ProfilePhotoUpload';
import { personalSchema } from '../../utils/validation';
import { COLORS } from '../../theme/colors';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import { StepHeader } from '../../components/common/StepIndicator';
import { GENDERS, RELIGIONS, MARITAL_STATUS } from '../../utils/constants';
import { Alert } from 'react-native';

const SelectField = ({ label, options, value, onChange, error }) => (
  <View style={styles.selectWrap}>
    <Text style={styles.label}>{label} <Text style={{ color: COLORS.rose }}>*</Text></Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.optionRow}>
        {options.map(opt => (
          <TouchableOpacity key={opt} onPress={() => onChange(opt)}
            style={[styles.option, value === opt && styles.optionActive]}>
            <Text style={[styles.optionText, value === opt && styles.optionTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
    {error && <Text style={styles.error}>{error}</Text>}
  </View>
);

export default function Step01_Personal({ navigation }) {
  const dispatch = useDispatch();
  const formData = useSelector(s => s.builder.formData);
  const isSaving = useSelector(s => s.builder.isSaving);
  const isLoaded = useSelector(s => s.builder.isLoaded);

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(personalSchema),
    defaultValues: formData,
  });

  // Sync form when data is finally loaded from server
  React.useEffect(() => {
    if (isLoaded) {
      Object.keys(formData).forEach(key => {
        setValue(key, formData[key]);
      });
    }
  }, [isLoaded, formData, setValue]);

  const [mode, setMode] = React.useState(formData.cvMode || 'corporate');

  if (!isLoaded) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: COLORS.accent, fontSize: 16, fontWeight: '700' }}>Loading your profile...</Text>
      </View>
    );
  }

  const onNext = async (data) => {
    dispatch(updateFormData({ ...data, cvMode: mode }));
    await dispatch(saveDraftAll());
    dispatch(nextStep());
    navigation.navigate('Step02');
  };

  const onSaveDraft = async (data) => {
    dispatch(updateFormData({ ...data, cvMode: mode }));
    await dispatch(saveDraftAll());
    Alert.alert('Success', 'Draft saved successfully!');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <StepHeader step={1} totalSteps={11} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        
        {/* Mode Switcher */}
        <View style={styles.modeContainer}>
          <Text style={styles.modeTitle}>Select CV Purpose:</Text>
          <View style={styles.modeRow}>
            <TouchableOpacity onPress={() => setMode('corporate')} 
              style={[styles.modeBtn, mode === 'corporate' && styles.modeBtnActive]}>
              <Text style={[styles.modeBtnText, mode === 'corporate' && styles.modeBtnTextActive]}>💼 Corporate</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMode('govt')} 
              style={[styles.modeBtn, mode === 'govt' && styles.modeBtnActive]}>
              <Text style={[styles.modeBtnText, mode === 'govt' && styles.modeBtnTextActive]}>🏛 Govt/Local</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.modeHint}>
            {mode === 'corporate' ? 'Minimal personal info, focused on skills.' : 'Full bio-data including NID, Parents, Religion.'}
          </Text>
        </View>

        {/* Photo Upload */}
        <Controller name="profilePhoto" control={control}
          render={({ field: { onChange, value } }) => (
            <ProfilePhotoUpload value={value} onChange={onChange} />
          )} />

        {/* Basic Fields */}
        <Controller name="fullName" control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <InputField label="Full Name" placeholder="Md. Rakibul Islam" required
              value={value} onChangeText={onChange} onBlur={onBlur} error={errors.fullName?.message} />
          )} />

        {/* Govt Only Fields */}
        {mode === 'govt' && (
          <View>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Controller name="fatherName" control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <InputField label="Father's Name" placeholder="Father's full name" required
                      value={value} onChangeText={onChange} onBlur={onBlur} error={errors.fatherName?.message} />
                  )} />
              </View>
              <View style={{ flex: 1 }}>
                <Controller name="motherName" control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <InputField label="Mother's Name" placeholder="Mother's full name" required
                      value={value} onChangeText={onChange} onBlur={onBlur} error={errors.motherName?.message} />
                  )} />
              </View>
            </View>

            <Controller name="nid" control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField label="NID / Birth Certificate No." placeholder="10 or 17 digit NID" required
                  value={value} onChangeText={onChange} onBlur={onBlur} keyboardType="numeric" error={errors.nid?.message} />
              )} />
            
            <View style={styles.row}>
               <View style={{flex:1}}>
                  <Controller name="religion" control={control}
                    render={({ field: { onChange, value } }) => (
                      <SelectField label="Religion" options={RELIGIONS} value={value} onChange={onChange} />
                    )} />
               </View>
               <View style={{flex:1}}>
                  <Controller name="maritalStatus" control={control}
                    render={({ field: { onChange, value } }) => (
                      <SelectField label="Marital Status" options={MARITAL_STATUS} value={value} onChange={onChange} />
                    )} />
               </View>
            </View>
          </View>
        )}

        <Controller name="dob" control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <InputField label="Date of Birth" placeholder="YYYY-MM-DD" required
              value={value} onChangeText={onChange} onBlur={onBlur} error={errors.dob?.message} />
          )} />

        <Controller name="gender" control={control}
          render={({ field: { onChange, value } }) => (
            <SelectField label="Gender" options={GENDERS} value={value} onChange={onChange} error={errors.gender?.message} />
          )} />

        <Controller name="presentAddress" control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <InputField label="Present Address" placeholder="House, Road, Area, District" required
              value={value} onChangeText={onChange} onBlur={onBlur} multiline numberOfLines={3} error={errors.presentAddress?.message} />
          )} />

        {mode === 'govt' && (
          <Controller name="permanentAddress" control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField label="Permanent Address" placeholder="Village, P.O., Upazila, District" required
                value={value} onChangeText={onChange} onBlur={onBlur} multiline numberOfLines={3} error={errors.permanentAddress?.message} />
            )} />
        )}
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <Button title={isSaving ? 'Saving...' : 'Save Draft'} variant="ghost" onPress={handleSubmit(onSaveDraft)} style={{ flex: 1 }} disabled={isSaving} />
        <Button title="Next →" onPress={handleSubmit(onNext)} style={{ flex: 2 }} disabled={isSaving} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 20 },
  
  modeContainer: { backgroundColor: COLORS.bgCard, padding: 16, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  modeTitle: { fontSize: 13, fontWeight: '700', color: COLORS.white, marginBottom: 12, textTransform: 'uppercase' },
  modeRow: { flexDirection: 'row', gap: 10 },
  modeBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  modeBtnActive: { backgroundColor: COLORS.accentSoft, borderColor: COLORS.accent },
  modeBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
  modeBtnTextActive: { color: COLORS.accent, fontWeight: '800' },
  modeHint: { fontSize: 11, color: COLORS.textMuted, marginTop: 10, fontStyle: 'italic' },

  row: { flexDirection: 'row', gap: 10 },
  photoBox: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    borderWidth: 2, borderColor: COLORS.borderActive, borderStyle: 'dashed',
    padding: 24, alignItems: 'center', marginBottom: 16, gap: 6,
  },
  photoLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  photoSub: { fontSize: 11, color: COLORS.textMuted },
  selectWrap: { marginBottom: 14 },
  label: { fontSize: 11, fontWeight: '700', color: COLORS.textDim, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 },
  optionRow: { flexDirection: 'row', gap: 8 },
  option: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  optionActive: { backgroundColor: COLORS.accentSoft, borderColor: COLORS.borderActive },
  optionText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
  optionTextActive: { color: COLORS.accent, fontWeight: '700' },
  error: { fontSize: 11, color: COLORS.rose, marginTop: 4 },
  bottomNav: {
    flexDirection: 'row', gap: 10, padding: 16,
    borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.bgCard,
  },
});
