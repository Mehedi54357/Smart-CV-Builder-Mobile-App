import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setToken, fetchCurrentUser } from '../redux/slices/authSlice';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

export default function AppNavigator() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const [isInitializing, setIsInitializing] = React.useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          dispatch(setToken(token));
          await dispatch(fetchCurrentUser());
        }
      } catch (e) {
        console.log('Init error', e);
      } finally {
        setIsInitializing(false);
      }
    };
    checkToken();
  }, [dispatch]);

  if (isInitializing) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0D14', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#3b82f6', fontSize: 24, fontWeight: '900', letterSpacing: 2 }}>SMART CV</Text>
        <Text style={{ color: '#64748b', fontSize: 12, marginTop: 8, letterSpacing: 1 }}>PRO BUILDER</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
