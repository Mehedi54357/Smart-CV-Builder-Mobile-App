import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { COLORS } from '../../theme/colors';

export default function Button({
  title, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, icon, style, textStyle,
}) {
  const isDisabled = disabled || loading;

  const variants = {
    primary: { bg: COLORS.accent, text: COLORS.white, border: COLORS.accent },
    secondary: { bg: 'transparent', text: COLORS.accent, border: COLORS.borderActive },
    ghost: { bg: 'transparent', text: COLORS.textDim, border: COLORS.border },
    danger: { bg: COLORS.rose, text: COLORS.white, border: COLORS.rose },
    success: { bg: COLORS.emerald, text: COLORS.white, border: COLORS.emerald },
  };

  const sizes = {
    sm: { px: 12, py: 8, fontSize: 12, height: 36 },
    md: { px: 20, py: 12, fontSize: 14, height: 46 },
    lg: { px: 28, py: 16, fontSize: 16, height: 54 },
  };

  const v = variants[variant];
  const s = sizes[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          paddingHorizontal: s.px,
          paddingVertical: s.py,
          height: s.height,
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <View style={styles.row}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={[styles.text, { color: v.text, fontSize: s.fontSize }, textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconWrap: { marginRight: 4 },
  text: { fontWeight: '600', letterSpacing: 0.2 },
});
