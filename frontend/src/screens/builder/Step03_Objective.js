// Step03_Objective.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { updateFormData, nextStep, prevStep, saveDraftAll } from '../../redux/slices/builderSlice';
import { COLORS } from '../../theme/colors';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import { StepHeader } from '../../components/common/StepIndicator';
import { Alert } from 'react-native';

export default function Step03_Objective({ navigation }) {
  const dispatch = useDispatch();
  const formData = useSelector(s => s.builder.formData);
  const isSaving = useSelector(s => s.builder.isSaving);
  const { control, handleSubmit, watch, setValue } = useForm({ defaultValues: formData });
  const objective = watch('objective', '');

  const onNext = async (data) => {
    dispatch(updateFormData(data));
    await dispatch(saveDraftAll());
    dispatch(nextStep());
    navigation.navigate('Step04');
  };

  const onSaveDraft = async (data) => {
    dispatch(updateFormData(data));
    await dispatch(saveDraftAll());
    Alert.alert('Success', 'Draft saved successfully!');
  };

  const handleMagicWrite = () => {
    const roles = ["Software Engineer", "Marketing Specialist", "Full Stack Developer", "UX Designer", "Accountant", "Fresh Graduate"];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    const generated = `Highly motivated ${randomRole} with a strong foundation in core industry principles. Proven ability to deliver high-quality results in fast-paced environments. Dedicated to continuous learning and professional growth within a forward-thinking organization.`;
    setValue('objective', generated, { shouldValidate: true, shouldDirty: true });
    Alert.alert('AI Generated', 'A professional objective has been generated based on industry standards.');
  };

  const suggestions = [
    "Motivated software engineer with 2+ years experience in building scalable web applications and leading cross-functional teams.",
    "Results-driven marketing professional with a proven track record of increasing brand awareness and driving user engagement.",
    "Dedicated fresh graduate seeking an entry-level position to apply technical skills and contribute to organizational success.",
  ];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StepHeader step={3} totalSteps={11} />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.tipBox}>
          <Text style={styles.tipText}>💡 A strong objective tells employers your value proposition in 2-3 sentences.</Text>
        </View>

        <Controller name="objective" control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <InputField label="Career Objective / Professional Summary" placeholder="Write 2-3 sentences..." required
                value={value} onChangeText={onChange} onBlur={onBlur} multiline numberOfLines={6} />
              
              <TouchableOpacity style={styles.magicBtn} onPress={handleMagicWrite}>
                <Text style={styles.magicText}>🪄 Magic Write with AI</Text>
              </TouchableOpacity>
            </View>
          )} />
        
        <Text style={styles.charCount}>{objective.length} / 500 characters</Text>

        <Text style={styles.suggestTitle}>Expert Samples:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {suggestions.map((s, i) => (
            <TouchableOpacity key={i} style={styles.suggestCard} onPress={() => { setValue('objective', s, { shouldValidate: true, shouldDirty: true }); Alert.alert('Success', 'Sample applied!'); }}>
              <Text style={styles.suggestText} numberOfLines={4}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
      <View style={styles.nav}>
        <Button title="← Back" variant="ghost" onPress={() => { dispatch(prevStep()); navigation.goBack(); }} style={{ flex: 1 }} disabled={isSaving} />
        <Button title={isSaving ? 'Saving...' : 'Save Draft'} variant="secondary" onPress={handleSubmit(onSaveDraft)} style={{ flex: 1 }} disabled={isSaving} />
        <Button title="Next →" onPress={handleSubmit(onNext)} style={{ flex: 1 }} disabled={isSaving} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tipBox: { backgroundColor: COLORS.accentSoft, borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: COLORS.borderActive },
  tipText: { color: COLORS.accent, fontSize: 13 },
  charCount: { fontSize: 11, color: COLORS.textMuted, textAlign: 'right', marginTop: -8, marginBottom: 16 },
  magicBtn: { backgroundColor: COLORS.accent + '20', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: -10, marginBottom: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: COLORS.accent },
  magicText: { color: COLORS.accent, fontWeight: '700', fontSize: 13 },
  suggestTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textDim, marginBottom: 12, textTransform: 'uppercase' },
  suggestCard: { backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 16, marginRight: 12, borderWidth: 1, borderColor: COLORS.border, width: 220 },
  suggestText: { fontSize: 12, color: COLORS.textDim, lineHeight: 18 },
  nav: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.bgCard },
});
