import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './slices/auth';
import venturesReducer from './slices/ventures';
import guideReducer from './slices/guide';
import syncReducer from './slices/sync';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'ventures', 'guide', 'sync'],
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);
const persistedVenturesReducer = persistReducer(persistConfig, venturesReducer);
const persistedGuideReducer = persistReducer(persistConfig, guideReducer);
const persistedSyncReducer = persistReducer(persistConfig, syncReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    ventures: persistedVenturesReducer,
    guide: persistedGuideReducer,
    sync: persistedSyncReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
