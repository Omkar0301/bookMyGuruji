import type { AxiosResponse } from 'axios';
import axiosInstance from '../axiosInstance';

export const bookingApi = {
  createBooking: (bookingData: Record<string, unknown>): Promise<AxiosResponse> =>
    axiosInstance.post('/bookings', bookingData),
  getMyBookings: (params: Record<string, unknown>): Promise<AxiosResponse> =>
    axiosInstance.get('/bookings', { params }),
  getBookingById: (id: string): Promise<AxiosResponse> => axiosInstance.get(`/bookings/${id}`),
  confirmBooking: (id: string): Promise<AxiosResponse> =>
    axiosInstance.patch(`/bookings/${id}/confirm`),
  declineBooking: (id: string, reason: string): Promise<AxiosResponse> =>
    axiosInstance.patch(`/bookings/${id}/decline`, { reason }),
  completeBooking: (id: string): Promise<AxiosResponse> =>
    axiosInstance.patch(`/bookings/${id}/complete`),
  cancelBooking: (id: string, reason: string): Promise<AxiosResponse> =>
    axiosInstance.patch(`/bookings/${id}/cancel`, { reason }),
  disputeBooking: (id: string, reason: string): Promise<AxiosResponse> =>
    axiosInstance.patch(`/bookings/${id}/dispute`, { reason }),
};

export default bookingApi;
