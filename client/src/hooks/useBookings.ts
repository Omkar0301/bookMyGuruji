import { useDispatch, useSelector } from 'react-redux';
import { bookingApi } from '../api/services/booking.service';
import { setMyBookings, setCurrentBooking, setLoading } from '../features/booking/bookingSlice';
import type { RootState } from '../app/store';
import { toast } from 'react-toastify';

interface BookingsHook {
  bookings: Record<string, unknown>[];
  selectedBooking: Record<string, unknown> | null;
  loading: boolean;
  fetchMyBookings: (params?: Record<string, unknown>) => Promise<void>;
  fetchBookingById: (id: string) => Promise<Record<string, unknown> | null>;
  createBooking: (bookingData: Record<string, unknown>) => Promise<Record<string, unknown> | null>;
  updateBookingStatus: (
    id: string,
    action: 'confirm' | 'decline' | 'complete' | 'cancel' | 'dispute',
    reason?: string
  ) => Promise<Record<string, unknown> | null>;
}

export const useBookings = (): BookingsHook => {
  const dispatch = useDispatch();
  const {
    myBookings: bookings,
    currentBooking: selectedBooking,
    loading,
  } = useSelector((state: RootState) => state.booking);

  const fetchMyBookings = async (params?: Record<string, unknown>): Promise<void> => {
    dispatch(setLoading(true));
    try {
      const { data } = await bookingApi.getMyBookings(params || {});
      dispatch(setMyBookings(data.data));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchBookingById = async (id: string): Promise<Record<string, unknown> | null> => {
    dispatch(setLoading(true));
    try {
      const { data } = await bookingApi.getBookingById(id);
      dispatch(setCurrentBooking(data.data));
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to fetch booking details');
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const createBooking = async (
    bookingData: Record<string, unknown>
  ): Promise<Record<string, unknown> | null> => {
    dispatch(setLoading(true));
    try {
      const { data } = await bookingApi.createBooking(bookingData);
      toast.success('Booking created successfully');
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to create booking');
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateBookingStatus = async (
    id: string,
    action: 'confirm' | 'decline' | 'complete' | 'cancel' | 'dispute',
    reason?: string
  ): Promise<Record<string, unknown> | null> => {
    dispatch(setLoading(true));
    try {
      let response;
      switch (action) {
        case 'confirm':
          response = await bookingApi.confirmBooking(id);
          break;
        case 'decline':
          response = await bookingApi.declineBooking(id, reason || '');
          break;
        case 'complete':
          response = await bookingApi.completeBooking(id);
          break;
        case 'cancel':
          response = await bookingApi.cancelBooking(id, reason || '');
          break;
        case 'dispute':
          response = await bookingApi.disputeBooking(id, reason || '');
          break;
      }
      toast.success(`Booking ${action}ed successfully`);
      return response?.data?.data || null;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || `Failed to ${action} booking`);
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    bookings,
    selectedBooking,
    loading,
    fetchMyBookings,
    fetchBookingById,
    createBooking,
    updateBookingStatus,
  };
};
