import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { IBooking } from '../../types/booking';

interface BookingWizard {
  step: number;
  selectedPriest: Record<string, unknown> | null;
  ceremony: Record<string, unknown> | null;
  slot: Record<string, unknown> | null;
  venue: Record<string, unknown> | null;
}

interface BookingState {
  bookingWizard: BookingWizard;
  myBookings: IBooking[];
  currentBooking: IBooking | null;
  loading: boolean;
}

const initialState: BookingState = {
  bookingWizard: {
    step: 1,
    selectedPriest: null,
    ceremony: null,
    slot: null,
    venue: null,
  },
  myBookings: [],
  currentBooking: null,
  loading: false,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setWizardStep: (state, action: PayloadAction<number>) => {
      state.bookingWizard.step = action.payload;
    },
    updateWizardData: (state, action: PayloadAction<Partial<BookingWizard>>) => {
      state.bookingWizard = { ...state.bookingWizard, ...action.payload };
    },
    resetWizard: (state) => {
      state.bookingWizard = initialState.bookingWizard;
    },
    setMyBookings: (state, action: PayloadAction<IBooking[]>) => {
      state.myBookings = action.payload;
    },
    setCurrentBooking: (state, action: PayloadAction<IBooking | null>) => {
      state.currentBooking = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setWizardStep,
  updateWizardData,
  resetWizard,
  setMyBookings,
  setCurrentBooking,
  setLoading,
} = bookingSlice.actions;
export default bookingSlice.reducer;
