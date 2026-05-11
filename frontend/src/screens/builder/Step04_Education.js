import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { addEducation, removeEducation, nextStep, prevStep, saveDraftAll } from '../../redux/slices/builderSlice';
import { educationSchema } from '../../utils/validation';
import { COLORS } from '../../theme/colors';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import { StepHeader } from '../../components/common/StepIndicator';
import { EDUCATION_TYPES, BOARDS } from '../../utils/constants';

const TypePicker = ({ value, onChange }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {EDUCATION_TYPES.map(t => (
        <TouchableOpacity key={t} onPress={() => onChange(t)}
          style={{
            paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100,
            backgroundColor: value === t ? COLORS.accentSoft : COLORS.surface,
            borderWidth: 1, borderColor: value === t ? COLORS.borderActive : COLORS.border,
          }}>
          <Text style={{ color: value === t ? COLORS.accent : COLORS.textMuted, fontWeight: '600', fontSize: 13 }}>{t}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </ScrollView>
);

const EduCard = ({ edu, onDelete }) => {
  const colors = { SSC: COLORS.gold, HSC: COLORS.accent, BSc: COLORS.emerald, MSc: COLORS.violet, Diploma: COLORS.rose, Other: COLORS.textMuted };
  const c = colors[edu.type] || COLORS.accent;
  return (
    <View style={[styles.eduCard, { borderLeftColor: c }]}>
      <View style={styles.eduHeader}>
        <View style={[styles.eduBadge, { backgroundColor: c + '20' }]}>
          <Text style={[styles.eduBadgeText, { color: c }]}>{edu.type}</Text>
        </View>
        <TouchableOpacity onPress={() => Alert.alert('Delete?', 'Remove this education?', [
          { text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => onDelete(edu.id) }
        ])}>
          <Text style={{ color: COLORS.rose, fontSize: 18 }}>🗑</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.eduDegree}>{edu.degree}</Text>
      <Text style={styles.eduInst}>{edu.institution}</Text>
      <View style={styles.eduMeta}>
        <Text style={styles.eduMetaText}>GPA: {edu.gpa}</Text>
        <Text style={styles.eduMetaText}>{edu.passingYear}</Text>
      </View>
    </View>
  );
};

export default function Step04_Education({ navigation }) {
  const dispatch = useDispatch();
  const educations = useSelector(s => s.builder.educations);
  const [modalVisible, setModalVisible] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(educationSchema),
    defaultValues: { type: 'SSC' },
  });

  const onAdd = (data) => {
    dispatch(addEducation(data));
    reset({ type: 'SSC' });
    setModalVisible(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StepHeader step={4} totalSteps={11} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.topRow}>
          <Text style={styles.sectionTitle}>{educations.length} Education Added</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.addBtnText}>+ Add More</Text>
          </TouchableOpacity>
        </View>

        {educations.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 36, marginBottom: 12 }}>🎓</Text>
            <Text style={styles.emptyTitle}>No education added</Text>
            <Text style={styles.emptyText}>Start with your SSC / HSC</Text>
            <TouchableOpacity style={styles.addBtnLarge} onPress={() => setModalVisible(true)}>
              <Text style={styles.addBtnLargeText}>+ Add Education</Text>
            </TouchableOpacity>
          </View>
        )}

        {educations.map(edu => (
          <EduCard key={edu.id} edu={edu} onDelete={(id) => dispatch(removeEducation(id))} />
        ))}
      </ScrollView>

      <View style={styles.nav}>
        <Button title="← Back" variant="ghost" onPress={() => { dispatch(prevStep()); navigation.goBack(); }} style={{ flex: 1 }} />
        <Button title="Save Draft" variant="secondary" onPress={async () => { await dispatch(saveDraftAll()); Alert.alert('Success', 'Draft saved successfully!'); }} style={{ flex: 1 }} />
        <Button title="Next →" onPress={async () => { await dispatch(saveDraftAll()); dispatch(nextStep()); navigation.navigate('Step05'); }} style={{ flex: 1 }} />
      </View>

      {/* Add Education Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Education</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ color: COLORS.textMuted, fontSize: 24 }}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={styles.fieldLabel}>Education Type *</Text>
            <Controller name="type" control={control}
              render={({ field: { onChange, value } }) => <TypePicker value={value} onChange={onChange} />} />

            <Controller name="degree" control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField label="Degree Name" placeholder="e.g. B.Sc. in CSE" required
                  value={value} onChangeText={onChange} onBlur={onBlur} error={errors.degree?.message} />
              )} />

            <Controller name="subject" control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField label="Subject / Department" placeholder="Computer Science & Engineering"
                  value={value} onChangeText={onChange} onBlur={onBlur} />
              )} />

            <Controller name="institution" control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField label="Institution Name" placeholder="BUET / Dhaka College" required
                  value={value} onChangeText={onChange} onBlur={onBlur} error={errors.institution?.message} />
              )} />

            <Controller name="board" control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField label="Board / University" placeholder="Dhaka Board / BUET"
                  value={value} onChangeText={onChange} onBlur={onBlur} />
              )} />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Controller name="gpa" control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <InputField label="GPA / CGPA" placeholder="5.00" required
                      value={value?.toString()} onChangeText={v => onChange(parseFloat(v))}
                      onBlur={onBlur} keyboardType="decimal-pad" error={errors.gpa?.message} />
                  )} />
              </View>
              <View style={{ flex: 1 }}>
                <Controller name="passingYear" control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <InputField label="Passing Year" placeholder="2022" required
                      value={value?.toString()} onChangeText={v => onChange(parseInt(v))}
                      onBlur={onBlur} keyboardType="number-pad" error={errors.passingYear?.message} />
                  )} />
              </View>
            </View>

            <Button title="Add Education" onPress={handleSubmit(onAdd)} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  addBtn: { backgroundColor: COLORS.accentSoft, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.borderActive },
  addBtnText: { color: COLORS.accent, fontWeight: '700', fontSize: 13 },
  emptyBox: { alignItems: 'center', padding: 40, backgroundColor: COLORS.bgCard, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  emptyText: { fontSize: 13, color: COLORS.textMuted, marginBottom: 20 },
  addBtnLarge: { backgroundColor: COLORS.accent, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  addBtnLargeText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  eduCard: { backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 4 },
  eduHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  eduBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  eduBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  eduDegree: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  eduInst: { fontSize: 13, color: COLORS.textDim, marginBottom: 6 },
  eduMeta: { flexDirection: 'row', gap: 16 },
  eduMetaText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  nav: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.bgCard },
  modal: { flex: 1, backgroundColor: COLORS.bg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.bgCard },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textDim, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
});
