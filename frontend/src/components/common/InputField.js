import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';

export default function InputField({
  label, placeholder, value, onChangeText, onBlur,
  error, secureTextEntry, keyboardType = 'default',
  multiline = false, numberOfLines = 1,
  leftIcon, rightIcon, required = false, editable = true,
  style, inputStyle,
}) {
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={{ color: COLORS.rose }}> *</Text>}
        </Text>
      )}
      <View style={[
        styles.inputBox,
        focused && styles.inputFocused,
        !!error && styles.inputError,
        !editable && styles.inputDisabled,
      ]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onBlur={() => { setFocused(false); onBlur?.(); }}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={secureTextEntry && !showPass}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          style={[
            styles.input,
            leftIcon && { paddingLeft: 8 },
            (rightIcon || secureTextEntry) && { paddingRight: 8 },
            multiline && { height: numberOfLines * 24, textAlignVertical: 'top' },
            inputStyle,
          ]}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.rightIcon}>
            <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>{showPass ? 'HIDE' : 'SHOW'}</Text>
          </TouchableOpacity>
        )}
        {rightIcon && !secureTextEntry && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: {
    fontSize: 11, fontWeight: '700', color: COLORS.textDim,
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, minHeight: 46,
  },
  inputFocused: { borderColor: COLORS.borderActive, backgroundColor: COLORS.surfaceHover },
  inputError: { borderColor: COLORS.rose + '80' },
  inputDisabled: { opacity: 0.5 },
  input: { flex: 1, color: COLORS.text, fontSize: 14, paddingVertical: 10 },
  leftIcon: { marginRight: 8 },
  rightIcon: { marginLeft: 8 },
  error: { fontSize: 11, color: COLORS.rose, marginTop: 4 },
});
