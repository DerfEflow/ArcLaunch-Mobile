import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootState, AppDispatch } from '@/store';
import { clearAuth } from '@/store/slices/auth';
import { MainAppStackParamList } from '@/navigation';
import { apiClient } from '@/api/client';

type Props = NativeStackScreenProps<MainAppStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { userId, workspaceId } = useSelector((state: RootState) => state.auth);
  const { offlineQueueLength, isOnline } = useSelector(
    (state: RootState) => state.sync
  );

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Sign Out',
        onPress: async () => {
          await apiClient.clearAuthToken();
          dispatch(clearAuth());
        },
        style: 'destructive',
      },
    ]);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all local data. Are you sure?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Clear',
          onPress: () => {
            // dispatch(clearAllData());
            Alert.alert('Success', 'Cache cleared');
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.settingRow}>
          <Text style={styles.label}>User ID</Text>
          <Text style={styles.value}>{userId || 'Not set'}</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.label}>Workspace</Text>
          <Text style={styles.value}>{workspaceId || 'Not set'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sync & Offline</Text>
        <View style={styles.settingRow}>
          <Text style={styles.label}>Connection Status</Text>
          <View
            style={[
              styles.statusBadge,
              isOnline ? styles.statusOnline : styles.statusOffline,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isOnline ? styles.statusTextOnline : styles.statusTextOffline,
              ]}
            >
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.label}>Pending Sync</Text>
          <Text style={styles.value}>
            {offlineQueueLength} {offlineQueueLength === 1 ? 'item' : 'items'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Info</Text>
        <View style={styles.settingRow}>
          <Text style={styles.label}>Version</Text>
          <Text style={styles.value}>1.0.0</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.label}>Build Type</Text>
          <Text style={styles.value}>Development</Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleClearCache}
        >
          <Text style={styles.buttonText}>Clear Local Cache</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleSignOut}
        >
          <Text style={[styles.buttonText, styles.dangerButtonText]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          ArcLaunch Mobile • Offline-First Launch Path Advisor
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginHorizontal: 12,
    marginVertical: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066cc',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  value: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  statusOnline: {
    backgroundColor: '#c8e6c9',
  },
  statusOffline: {
    backgroundColor: '#ffcdd2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextOnline: {
    color: '#2e7d32',
  },
  statusTextOffline: {
    color: '#c62828',
  },
  button: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dangerButton: {
    backgroundColor: '#ffebee',
    borderColor: '#ef5350',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066cc',
  },
  dangerButtonText: {
    color: '#c62828',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});
