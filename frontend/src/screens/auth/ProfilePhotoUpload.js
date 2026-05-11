import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, Alert, ActivityIndicator, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axiosInstance from '../../api/axiosInstance';
import { COLORS } from '../../theme/colors';

export default function ProfilePhotoUpload({ value, onChange }) {
  const [loading, setLoading] = useState(false);

  const pickAndUpload = async (source = 'library') => {
    let result;
    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow camera access in Settings.');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true, aspect: [1, 1], quality: 0.8,
      });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow photo library access in Settings.');
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true, aspect: [1, 1], quality: 0.8,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });
    }

    if (result.canceled) return;

    const file = result.assets[0];
    if (file.fileSize && file.fileSize > 5 * 1024 * 1024) {
      Alert.alert('Too Large', 'Maximum photo size is 5MB. Please choose a smaller image.');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      if (Platform.OS === 'web') {
        const response = await fetch(file.uri);
        const blob = await response.blob();
        fd.append('profilePhoto', blob, 'photo.jpg');
      } else {
        fd.append('profilePhoto', { uri: file.uri, name: 'photo.jpg', type: 'image/jpeg' });
      }
      const res = await axiosInstance.post('/profile/photo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Use Cloudinary URL if available, fallback to local URI
      onChange(res.data.photoUrl || file.uri);
    } catch (e) {
      console.warn('Photo upload failed, using local preview:', e?.message);
      // Even if upload fails, show local preview so user experience is not broken
      onChange(file.uri);
    } finally {
      setLoading(false);
    }
  };

  const showOptions = () => Alert.alert(
    'Profile Photo',
    'Your photo will appear in SmartPro & Creative CV templates.',
    [
      { text: '📷 Camera', onPress: () => pickAndUpload('camera') },
      { text: '🖼 Photo Library', onPress: () => pickAndUpload('library') },
      ...(value ? [{ text: '🗑 Remove Photo', style: 'destructive', onPress: () => onChange(null) }] : []),
      { text: 'Cancel', style: 'cancel' },
    ]
  );

  return (
    <TouchableOpacity style={s.container} onPress={showOptions} activeOpacity={0.8}>
      {loading
        ? <ActivityIndicator color={COLORS.accent} size="large" />
        : value
          ? <Image source={{ uri: value }} style={s.photo} />
          : (
            <View style={s.placeholder}>
              <Text style={{ fontSize: 36, marginBottom: 4 }}>📷</Text>
              <Text style={s.label}>Upload Photo</Text>
              <Text style={s.sub}>JPG/PNG · Max 5MB</Text>
              <Text style={s.hint}>Used in SmartPro & Creative templates</Text>
            </View>
          )
      }
      {value && !loading && (
        <View style={s.editBadge}>
          <Text style={{ fontSize: 13 }}>✏️</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: {
    width: 110, height: 110, borderRadius: 55,
    alignSelf: 'center', marginBottom: 20,
    overflow: 'hidden', borderWidth: 2,
    borderColor: COLORS.borderActive, borderStyle: 'dashed',
    backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  photo: { width: 110, height: 110, borderRadius: 55 },
  placeholder: { alignItems: 'center', paddingHorizontal: 8 },
  label: { fontSize: 11, fontWeight: '700', color: COLORS.accent },
  sub: { fontSize: 9, color: COLORS.textMuted, marginTop: 2 },
  hint: { fontSize: 8, color: COLORS.textMuted, marginTop: 2, textAlign: 'center' },
  editBadge: {
    position: 'absolute', bottom: 4, right: 4,
    backgroundColor: COLORS.accent, borderRadius: 12,
    width: 24, height: 24, alignItems: 'center', justifyContent: 'center',
  },
});
