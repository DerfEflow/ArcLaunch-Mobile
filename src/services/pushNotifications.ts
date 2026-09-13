import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { apiClient } from '@/api/client';

// Notification handler setup
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class PushNotificationService {
  private deviceToken: string | null = null;

  async requestPermission(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Must use physical device for push notifications');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  async getDeviceToken(): Promise<string | null> {
    if (this.deviceToken) {
      return this.deviceToken;
    }

    try {
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ||
        Constants.expoConfig?.extra?.projectId;

      if (!projectId) {
        console.error('No Expo project ID configured');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({ projectId });
      this.deviceToken = token.data;
      return this.deviceToken;
    } catch (error) {
      console.error('Failed to get push token:', error);
      return null;
    }
  }

  async registerDevice(platform: 'ios' | 'android'): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.log('Push notification permission denied');
        return false;
      }

      const token = await this.getDeviceToken();
      if (!token) {
        console.log('Failed to get device token');
        return false;
      }

      // Register with backend
      await apiClient.post('/users/push-tokens', {
        device_token: token,
        platform,
      });

      console.log('Device registered for push notifications');
      return true;
    } catch (error) {
      console.error('Failed to register device:', error);
      return false;
    }
  }

  // Set up notification listeners
  setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationTapped?: (response: Notifications.NotificationResponse) => void
  ) {
    // Listen for notifications when app is in foreground
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        if (onNotificationReceived) {
          onNotificationReceived(notification);
        }
      }
    );

    // Listen for taps on notifications
    const subscription2 = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        if (onNotificationTapped) {
          onNotificationTapped(response);
        }
      }
    );

    return () => {
      subscription.remove();
      subscription2.remove();
    };
  }

  // Handle notification payload and navigate accordingly
  parseNotificationPayload(notification: Notifications.Notification) {
    const { data } = notification.request.content;
    return {
      ventureId: data?.venture_id,
      messageType: data?.message_type, // 'guide_reply', 'venture_update'
      conversationId: data?.conversation_id,
    };
  }
}

export const pushNotificationService = new PushNotificationService();
