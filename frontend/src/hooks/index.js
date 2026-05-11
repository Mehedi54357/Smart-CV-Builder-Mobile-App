// useNetworkStatus.js — Offline detection
import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => setIsOnline(state.isConnected));
    return unsub;
  }, []);
  return isOnline;
};

// useFormDraft.js — Auto-save every 30s
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateFormData, markSaved } from '../redux/slices/builderSlice';
import { profileAPI } from '../api/profile.api';

export const useFormDraft = () => {
  const dispatch = useDispatch();
  const { isDirty } = useSelector(s => s.builder);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isDirty) return;
    timerRef.current = setTimeout(async () => {
      try {
        await dispatch(require('../redux/slices/builderSlice').saveDraftAll());
      } catch (e) { /* silent fail — save locally */ }
    }, 60000); // 60 seconds
    return () => clearTimeout(timerRef.current);
  }, [isDirty]);
};

// useToast.js — Toast notifications
import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toast, setToast] = useState(null);
  const show = useCallback((message, type = 'success', duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  }, []);
  return { toast, showToast: show };
};

// useImagePicker.js — Unified image picker
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export const useImagePicker = () => {
  const pickImage = async (options = {}) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      ...options,
    });
    if (result.canceled) return null;
    const file = result.assets[0];
    if (file.fileSize && file.fileSize > 5 * 1024 * 1024) {
      Alert.alert('File Too Large', 'Please select an image under 5MB.');
      return null;
    }
    return file;
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access.');
      return null;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (result.canceled) return null;
    return result.assets[0];
  };

  return { pickImage, takePhoto };
};
