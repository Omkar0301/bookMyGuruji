import axiosInstance from '../axiosInstance';
import { IBooking } from '../../types/booking';

export const bookingApi = {
  createBooking: (bookingData: Record<string, unknown>): Promise<{ data: { data: IBooking } }> =>
    axiosInstance.post('/bookings', bookingData),
  getMyBookings: (params: Record<string, unknown>): Promise<{ data: { data: IBooking[] } }> =>
    axiosInstance.get('/bookings', { params }),
  getBookingById: (id: string): Promise<{ data: { data: IBooking } }> =>
    axiosInstance.get(`/bookings/${id}`),
  confirmBooking: (id: string): Promise<{ data: { data: IBooking } }> =>
    axiosInstance.patch(`/bookings/${id}/confirm`),
  declineBooking: (id: string, reason: string): Promise<{ data: { data: IBooking } }> =>
    axiosInstance.patch(`/bookings/${id}/decline`, { reason }),
  completeBooking: (id: string): Promise<{ data: { data: IBooking } }> =>
    axiosInstance.patch(`/bookings/${id}/complete`),
  cancelBooking: (id: string, reason: string): Promise<{ data: { data: IBooking } }> =>
    axiosInstance.patch(`/bookings/${id}/cancel`, { reason }),
  disputeBooking: (id: string, reason: string): Promise<{ data: { data: IBooking } }> =>
    axiosInstance.patch(`/bookings/${id}/dispute`, { reason }),
};

export default bookingApi;
