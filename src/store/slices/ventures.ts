import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Venture {
  id: string;
  title: string;
  description?: string;
  status?: string;
  path_json?: any;
  updatedAt: string;
}

export interface VenturesState {
  list: Venture[];
  current: Venture | null;
  isLoading: boolean;
  error: string | null;
  isSynced: boolean;
}

const initialState: VenturesState = {
  list: [],
  current: null,
  isLoading: false,
  error: null,
  isSynced: false,
};

export const venturesSlice = createSlice({
  name: 'ventures',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setVenturesList: (state, action: PayloadAction<Venture[]>) => {
      state.list = action.payload;
      state.isSynced = true;
    },
    setCurrentVenture: (state, action: PayloadAction<Venture>) => {
      state.current = action.payload;
    },
    updateVentureField: (
      state,
      action: PayloadAction<{ field: string; value: any }>
    ) => {
      if (state.current) {
        (state.current as any)[action.payload.field] = action.payload.value;
      }
    },
    confirmPathStep: (
      state,
      action: PayloadAction<{ stepId: string; answer: any }>
    ) => {
      if (state.current?.path_json) {
        const step = state.current.path_json.stages?.find(
          (s: any) => s.id === action.payload.stepId
        );
        if (step) {
          step.completed = true;
          step.answer = action.payload.answer;
        }
      }
    },
  },
});

export const {
  setLoading,
  setError,
  setVenturesList,
  setCurrentVenture,
  updateVentureField,
  confirmPathStep,
} = venturesSlice.actions;
export default venturesSlice.reducer;
