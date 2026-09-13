import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import * as Notifications from 'expo-notifications';
import { store, persistor } from '@/store';
import { RootNavigator } from '@/navigation';
import { pushNotificationService } from '@/services/pushNotifications';
import { setOnlineStatus, setSyncStatus } from '@/store/slices/sync';
import { apiClient } from '@/api/client';
import NetInfo from '@react-native-community/netinfo';

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    // Register for push notifications
    const platform = Platform.OS as 'ios' | 'android';
    await pushNotificationService.registerDevice(platform);

    // Set up notification listeners
    pushNotificationService.setupNotificationListeners(
      (notification) => {
        console.log('Notification received:', notification);
      },
      (response) => {
        const payload = pushNotificationService.parseNotificationPayload(
          response.notification
        );
        console.log('Notification tapped:', payload);
        // Navigation to venture/guide can be handled here
      }
    );

    // Set up network connectivity monitoring
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = state.isConnected === true;
      dispatch(setOnlineStatus(isOnline));
      apiClient.setOnlineStatus(isOnline);

      if (isOnline) {
        dispatch(setSyncStatus('syncing'));
      }
    });

    return () => {
      unsubscribe();
    };
  };

  return <RootNavigator />;
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}
