import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://arclaunch.net';
const TOKEN_STORAGE_KEY = 'auth_tokens';
const OFFLINE_QUEUE_KEY = 'offline_queue';

export interface OfflineRequest {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  timestamp: number;
  retries: number;
}

// Callback for auth failures (called by app when 401 received)
let onAuthFailure: (() => void) | null = null;

// Callback for sync status updates
let onSyncStatusChange: ((status: 'syncing' | 'synced' | 'error') => void) | null = null;

// Callback for offline queue length updates
let onQueueLengthChange: ((length: number) => void) | null = null;

export class APIClient {
  private axios: AxiosInstance;
  private offlineQueue: OfflineRequest[] = [];
  private isOnline = true;
  private isSyncing = false;

  constructor() {
    this.axios = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor: add auth token
    this.axios.interceptors.request.use(
      async (config) => {
        const token = await this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: handle 401
    this.axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401 && onAuthFailure) {
          onAuthFailure();
        }
        return Promise.reject(error);
      }
    );

    this.loadOfflineQueue();
  }

  setAuthFailureCallback(callback: () => void): void {
    onAuthFailure = callback;
  }

  setSyncStatusCallback(callback: (status: 'syncing' | 'synced' | 'error') => void): void {
    onSyncStatusChange = callback;
  }

  setQueueLengthCallback(callback: (length: number) => void): void {
    onQueueLengthChange = callback;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
      return token;
    } catch {
      return null;
    }
  }

  async setAuthToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, token);
    } catch (error) {
      console.error('Failed to store auth token:', error);
    }
  }

  async clearAuthToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
    } catch {
      // Token might not exist
    }
  }

  private async loadOfflineQueue(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (stored) {
        this.offlineQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }

  private async saveOfflineQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  private async addToOfflineQueue(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    data?: any
  ): Promise<void> {
    const request: OfflineRequest = {
      id: `${Date.now()}-${Math.random()}`,
      method,
      url,
      data,
      timestamp: Date.now(),
      retries: 0,
    };
    this.offlineQueue.push(request);
    await this.saveOfflineQueue();
    if (onQueueLengthChange) onQueueLengthChange(this.offlineQueue.length);
  }

  async request(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    data?: any
  ): Promise<any> {
    try {
      const response = await this.axios.request({
        method,
        url,
        data,
      });
      return response.data;
    } catch (error) {
      if (!this.isOnline) {
        // Queue request if offline (except GET)
        if (method !== 'GET') {
          await this.addToOfflineQueue(method, url, data);
        }
        throw error;
      }
      throw error;
    }
  }

  async get(url: string): Promise<any> {
    return this.request('GET', url);
  }

  async post(url: string, data?: any): Promise<any> {
    return this.request('POST', url, data);
  }

  async put(url: string, data?: any): Promise<any> {
    return this.request('PUT', url, data);
  }

  async delete(url: string): Promise<any> {
    return this.request('DELETE', url);
  }

  async patch(url: string, data?: any): Promise<any> {
    return this.request('PATCH', url, data);
  }

  setOnlineStatus(isOnline: boolean): void {
    this.isOnline = isOnline;
    if (isOnline && this.offlineQueue.length > 0 && !this.isSyncing) {
      this.syncOfflineQueue();
    }
  }

  private async syncOfflineQueue(): Promise<void> {
    if (this.isSyncing || this.offlineQueue.length === 0) {
      return;
    }

    this.isSyncing = true;
    if (onSyncStatusChange) onSyncStatusChange('syncing');

    try {
      const toSync = [...this.offlineQueue];
      const failed: OfflineRequest[] = [];

      for (const request of toSync) {
        try {
          await this.axios.request({
            method: request.method,
            url: request.url,
            data: request.data,
          });
          // Remove from queue on success
          this.offlineQueue = this.offlineQueue.filter((r) => r.id !== request.id);
        } catch (error) {
          request.retries++;
          if (request.retries < 3) {
            failed.push(request);
          } else {
            console.error(`Request failed after 3 retries:`, request);
          }
        }
      }

      this.offlineQueue = failed;
      await this.saveOfflineQueue();
      if (onQueueLengthChange) onQueueLengthChange(this.offlineQueue.length);
      if (onSyncStatusChange) {
        onSyncStatusChange(this.offlineQueue.length === 0 ? 'synced' : 'error');
      }
    } catch (error) {
      console.error('Offline queue sync error:', error);
      if (onSyncStatusChange) onSyncStatusChange('error');
    } finally {
      this.isSyncing = false;
    }
  }

  getOfflineQueueLength(): number {
    return this.offlineQueue.length;
  }

  async clearOfflineQueue(): Promise<void> {
    this.offlineQueue = [];
    await this.saveOfflineQueue();
    if (onQueueLengthChange) onQueueLengthChange(0);
  }
}

export const apiClient = new APIClient();
