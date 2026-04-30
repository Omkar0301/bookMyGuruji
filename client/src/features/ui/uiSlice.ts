import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface UiState {
  modals: Record<string, boolean>;
  globalLoading: boolean;
  toasts: Toast[];
}

const initialState: UiState = {
  modals: {},
  globalLoading: false,
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleModal: (state, action: PayloadAction<{ modalName: string; isOpen: boolean }>) => {
      const { modalName, isOpen } = action.payload;
      state.modals[modalName] = isOpen;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    addToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      state.toasts.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    removeToast: (state, action: PayloadAction<number>) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
  },
});

export const { toggleModal, setGlobalLoading, addToast, removeToast } = uiSlice.actions;
export default uiSlice.reducer;
