import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import { OfflineBanner } from './src/components/ui/index';
import { registerForPushNotifications } from './src/services/notifications';

export default function App() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Offline detection
    const unsub = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    // Push notifications
    registerForPushNotifications().catch(() => {});
    return () => unsub();
  }, []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <StatusBar style="light" backgroundColor="#0A0D14" />
        <OfflineBanner visible={isOffline} />
        <AppNavigator />
      </Provider>
    </ErrorBoundary>
  );
}
