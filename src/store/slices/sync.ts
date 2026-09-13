import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  status: 'idle' | 'syncing' | 'synced' | 'error';
  offlineQueueLength: number;
  lastSyncTime: number | null;
  error: string | null;
}

const initialState: SyncState = {
  isOnline: true,
  isSyncing: false,
  status: 'idle',
  offlineQueueLength: 0,
  lastSyncTime: null,
  error: null,
};

export const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    setSyncing: (state, action: PayloadAction<boolean>) => {
      state.isSyncing = action.payload;
    },
    setSyncStatus: (
      state,
      action: PayloadAction<'idle' | 'syncing' | 'synced' | 'error'>
    ) => {
      state.status = action.payload;
      if (action.payload === 'synced') {
        state.lastSyncTime = Date.now();
      }
    },
    setOfflineQueueLength: (state, action: PayloadAction<number>) => {
      state.offlineQueueLength = action.payload;
    },
    setSyncError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setOnlineStatus,
  setSyncing,
  setSyncStatus,
  setOfflineQueueLength,
  setSyncError,
} = syncSlice.actions;
export default syncSlice.reducer;
