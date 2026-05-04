import type { AxiosResponse } from 'axios';
import axiosInstance from '../axiosInstance';

export const paymentApi = {
  createOrder: (data: Record<string, unknown>): Promise<AxiosResponse> =>
    axiosInstance.post('/payments/create-order', data),
  verifyPayment: (data: Record<string, unknown>): Promise<AxiosResponse> =>
    axiosInstance.post('/payments/verify', data),
};

export default paymentApi;
