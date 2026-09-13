import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  token: string | null;
  userId: string | null;
  workspaceId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  userId: null,
  workspaceId: null,
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setAuthTokens: (
      state,
      action: PayloadAction<{ token: string; userId: string; workspaceId: string }>
    ) => {
      state.token = action.payload.token;
      state.userId = action.payload.userId;
      state.workspaceId = action.payload.workspaceId;
      state.error = null;
    },
    clearAuth: (state) => {
      state.token = null;
      state.userId = null;
      state.workspaceId = null;
      state.error = null;
    },
  },
});

export const { setLoading, setError, setAuthTokens, clearAuth } = authSlice.actions;
export default authSlice.reducer;
