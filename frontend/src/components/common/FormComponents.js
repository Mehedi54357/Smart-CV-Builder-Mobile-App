import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Modal, TextInput, FlatList,
} from 'react-native';
import { COLORS } from '../../theme/colors';

// ── Pill Selector (single/multi) ───────────────────────────────────
export const PillSelect = ({ label, options, value, onChange, multi = false, required, error }) => (
  <View style={styles.wrap}>
    {label && (
      <Text style={styles.label}>{label}{required && <Text style={{ color: COLORS.rose }}> *</Text>}</Text>
    )}
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.row}>
        {options.map(opt => {
          const isActive = multi ? (value || []).includes(opt) : value === opt;
          return (
            <TouchableOpacity key={opt} onPress={() => {
              if (multi) {
                const curr = value || [];
                onChange(isActive ? curr.filter(v => v !== opt) : [...curr, opt]);
              } else { onChange(opt); }
            }}
              style={[styles.pill, isActive && styles.pillActive]}>
              <Text style={[styles.pillTxt, isActive && styles.pillTxtActive]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
    {error && <Text style={styles.error}>{error}</Text>}
  </View>
);

// ── Simple Dropdown ────────────────────────────────────────────────
export const DropDown = ({ label, options, value, onChange, placeholder = 'Select...', required, error }) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.wrap}>
      {label && <Text style={styles.label}>{label}{required && <Text style={{ color: COLORS.rose }}> *</Text>}</Text>}
      <TouchableOpacity style={[styles.dropdown, open && styles.dropdownOpen]} onPress={() => setOpen(p => !p)}>
        <Text style={value ? styles.dropdownVal : styles.dropdownPh}>{value || placeholder}</Text>
        <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdownMenu}>
          <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
            {options.map(opt => (
              <TouchableOpacity key={opt} style={[styles.dropdownItem, value === opt && styles.dropdownItemActive]}
                onPress={() => { onChange(opt); setOpen(false); }}>
                <Text style={[styles.dropdownItemTxt, value === opt && { color: COLORS.accent, fontWeight: '700' }]}>{opt}</Text>
                {value === opt && <Text style={{ color: COLORS.accent }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

// ── Tag Input (skills) ─────────────────────────────────────────────
export const TagInput = ({ label, tags = [], onAdd, onRemove, placeholder = 'Type and press Enter', color = COLORS.accent, suggestions = [] }) => {
  const [input, setInput] = useState('');
  const [showSuggest, setShowSuggest] = useState(false);
  const filtered = suggestions.filter(s => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s));

  return (
    <View style={styles.wrap}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.tagBox}>
        {tags.map((t, i) => (
          <TouchableOpacity key={i} onPress={() => onRemove(i)}
            style={[styles.tag, { backgroundColor: color + '18', borderColor: color + '40' }]}>
            <Text style={[styles.tagTxt, { color }]}>{t}</Text>
            <Text style={[styles.tagX, { color }]}>✕</Text>
          </TouchableOpacity>
        ))}
        <TextInput
          value={input}
          onChangeText={v => { setInput(v); setShowSuggest(v.length > 0); }}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          style={styles.tagInput}
          onSubmitEditing={() => { if (input.trim() && !tags.includes(input.trim())) { onAdd(input.trim()); setInput(''); setShowSuggest(false); } }}
          returnKeyType="done"
        />
      </View>
      {showSuggest && filtered.length > 0 && (
        <View style={styles.suggestBox}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.row}>
              {filtered.slice(0, 8).map(s => (
                <TouchableOpacity key={s} style={styles.suggestPill}
                  onPress={() => { onAdd(s); setInput(''); setShowSuggest(false); }}>
                  <Text style={styles.suggestTxt}>+ {s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

// ── Year Picker ────────────────────────────────────────────────────
export const YearPicker = ({ label, value, onChange, required, error, minYear = 1990 }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - minYear + 2 }, (_, i) => (currentYear + 1 - i).toString());
  return <DropDown label={label} options={years} value={value?.toString()} onChange={v => onChange(parseInt(v))} placeholder="Select year" required={required} error={error} />;
};

// ── Range Slider (GPA) ─────────────────────────────────────────────
export const GPAInput = ({ label, value, onChange, error, max = 5 }) => (
  <View style={styles.wrap}>
    {label && <Text style={styles.label}>{label}</Text>}
    <View style={styles.gpaRow}>
      <TextInput
        value={value?.toString() || ''}
        onChangeText={v => { const n = parseFloat(v); if (!isNaN(n) && n >= 0 && n <= max) onChange(n); else if (v === '' || v === '.') onChange(v); }}
        placeholder={`0.00 – ${max}.00`}
        placeholderTextColor={COLORS.textMuted}
        keyboardType="decimal-pad"
        style={styles.gpaInput}
      />
      <View style={styles.gpaScale}>
        {[...Array(max + 1)].map((_, i) => (
          <TouchableOpacity key={i} onPress={() => onChange(i)}
            style={[styles.gpaDot, value >= i && { backgroundColor: COLORS.accent }]}>
            <Text style={[styles.gpaDotTxt, value >= i && { color: COLORS.accent }]}>{i}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
    {error && <Text style={styles.error}>{error}</Text>}
  </View>
);

// ── Duration Picker ────────────────────────────────────────────────
export const DurationRow = ({ fromValue, toValue, onFromChange, onToChange, isCurrent, onCurrentToggle }) => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const years = Array.from({ length: 35 }, (_, i) => (new Date().getFullYear() - i).toString());
  const options = months.flatMap(m => years.map(y => `${m} ${y}`));
  return (
    <View>
      <View style={styles.row2}>
        <View style={{ flex: 1 }}>
          <DropDown label="From" options={options} value={fromValue} onChange={onFromChange} placeholder="Month Year" />
        </View>
        <View style={{ flex: 1 }}>
          <DropDown label="To" options={options} value={toValue} onChange={onToChange} placeholder="Month Year" editable={!isCurrent} />
        </View>
      </View>
      <TouchableOpacity style={styles.currentRow} onPress={onCurrentToggle}>
        <View style={[styles.checkbox, isCurrent && styles.checkboxActive]}>
          {isCurrent && <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>✓</Text>}
        </View>
        <Text style={styles.currentTxt}>Currently working here</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '700', color: COLORS.textDim, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  error: { fontSize: 11, color: COLORS.rose, marginTop: 4 },
  row:  { flexDirection: 'row', gap: 8 },
  row2: { flexDirection: 'row', gap: 10 },
  pill: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 100, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  pillActive: { backgroundColor: COLORS.accentSoft, borderColor: COLORS.borderActive },
  pillTxt:    { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
  pillTxtActive: { color: COLORS.accent, fontWeight: '700' },
  dropdown: { backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, padding: 13, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdownOpen: { borderColor: COLORS.borderActive },
  dropdownVal: { color: COLORS.text, fontSize: 14 },
  dropdownPh:  { color: COLORS.textMuted, fontSize: 14 },
  dropdownMenu: { backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.borderActive, marginTop: 4, overflow: 'hidden', zIndex: 99, elevation: 10 },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dropdownItemActive: { backgroundColor: COLORS.accentSoft },
  dropdownItemTxt: { fontSize: 14, color: COLORS.text },
  tagBox: { backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, padding: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 8, minHeight: 48 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100, borderWidth: 1 },
  tagTxt: { fontSize: 13, fontWeight: '600' },
  tagX:   { fontSize: 10, fontWeight: '900' },
  tagInput: { color: COLORS.text, fontSize: 13, minWidth: 120, paddingVertical: 2 },
  suggestBox: { marginTop: 6 },
  suggestPill: { backgroundColor: COLORS.surface, borderRadius: 100, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.border },
  suggestTxt: { fontSize: 12, color: COLORS.textDim },
  gpaRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  gpaInput: { backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, padding: 12, color: COLORS.text, fontSize: 18, fontWeight: '800', width: 100, textAlign: 'center' },
  gpaScale: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center' },
  gpaDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  gpaDotTxt: { fontSize: 10, color: COLORS.textMuted, fontWeight: '700' },
  currentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.surface, padding: 12, borderRadius: 10, marginBottom: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  currentTxt: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
});
