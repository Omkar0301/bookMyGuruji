import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface BookingWizard {
  step: number;
  selectedPriest: Record<string, unknown> | null;
  ceremony: Record<string, unknown> | null;
  slot: Record<string, unknown> | null;
  venue: Record<string, unknown> | null;
}

interface BookingState {
  bookingWizard: BookingWizard;
  myBookings: Record<string, unknown>[];
  currentBooking: Record<string, unknown> | null;
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
    setMyBookings: (state, action: PayloadAction<Record<string, unknown>[]>) => {
      state.myBookings = action.payload;
    },
    setCurrentBooking: (state, action: PayloadAction<Record<string, unknown> | null>) => {
      state.currentBooking = action.payload;
    },
  },
});

export const { setWizardStep, updateWizardData, resetWizard, setMyBookings, setCurrentBooking } =
  bookingSlice.actions;
export default bookingSlice.reducer;
