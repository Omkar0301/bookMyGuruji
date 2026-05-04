import type { AxiosResponse } from 'axios';
import axiosInstance from '../axiosInstance';

export const adminApi = {
  // Priest Verification
  getVerifications: (): Promise<AxiosResponse> => axiosInstance.get('/admin/verifications'),
  approveVerification: (priestId: string): Promise<AxiosResponse> =>
    axiosInstance.patch(`/admin/verifications/${priestId}/approve`),
  rejectVerification: (priestId: string, reason: string): Promise<AxiosResponse> =>
    axiosInstance.patch(`/admin/verifications/${priestId}/reject`, { reason }),

  // User Management
  getUsers: (params?: Record<string, unknown>): Promise<AxiosResponse> =>
    axiosInstance.get('/admin/users', { params }),
  getUserById: (id: string): Promise<AxiosResponse> => axiosInstance.get(`/admin/users/${id}`),
  deactivateUser: (id: string): Promise<AxiosResponse> =>
    axiosInstance.patch(`/admin/users/${id}/deactivate`),
  activateUser: (id: string): Promise<AxiosResponse> =>
    axiosInstance.patch(`/admin/users/${id}/activate`),

  // Booking Management
  getBookings: (params?: Record<string, unknown>): Promise<AxiosResponse> =>
    axiosInstance.get('/admin/bookings', { params }),
  getBookingById: (id: string): Promise<AxiosResponse> =>
    axiosInstance.get(`/admin/bookings/${id}`),
  overrideBookingStatus: (
    id: string,
    data: { status: string; adminNote?: string }
  ): Promise<AxiosResponse> => axiosInstance.patch(`/admin/bookings/${id}/override-status`, data),

  // Dispute Resolution
  getDisputes: (): Promise<AxiosResponse> => axiosInstance.get('/admin/disputes'),
  resolveDispute: (bookingId: string, data: Record<string, unknown>): Promise<AxiosResponse> =>
    axiosInstance.patch(`/admin/disputes/${bookingId}/resolve`, data),

  // Analytics
  getAnalyticsOverview: (): Promise<AxiosResponse> =>
    axiosInstance.get('/admin/analytics/overview'),
  getRevenueAnalytics: (params?: { from?: string; to?: string }): Promise<AxiosResponse> =>
    axiosInstance.get('/admin/analytics/revenue', { params }),
  getTopPriests: (limit?: number): Promise<AxiosResponse> =>
    axiosInstance.get('/admin/analytics/top-priests', { params: { limit } }),
};

export default adminApi;
