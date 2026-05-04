import type { AxiosResponse } from 'axios';
import axiosInstance from '../axiosInstance';

export const authApi = {
  register: (userData: Record<string, unknown>): Promise<AxiosResponse> =>
    axiosInstance.post('/auth/register', userData),
  registerPriest: (priestData: Record<string, unknown>): Promise<AxiosResponse> =>
    axiosInstance.post('/auth/register/priest', priestData),
  login: (credentials: Record<string, unknown>): Promise<AxiosResponse> =>
    axiosInstance.post('/auth/login', credentials),
  logout: (): Promise<AxiosResponse> => axiosInstance.post('/auth/logout'),
  refreshToken: (): Promise<AxiosResponse> => axiosInstance.post('/auth/refresh'),
  verifyEmail: (token: string): Promise<AxiosResponse> =>
    axiosInstance.get(`/auth/verify-email/${token}`),
  forgotPassword: (email: string): Promise<AxiosResponse> =>
    axiosInstance.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string): Promise<AxiosResponse> =>
    axiosInstance.post(`/auth/reset-password/${token}`, { password }),
  getMe: (): Promise<AxiosResponse> => axiosInstance.get('/auth/me'),
};

export default authApi;
