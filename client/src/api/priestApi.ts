import type { AxiosResponse } from 'axios';
import axiosInstance from './axiosInstance';

export const priestApi = {
  searchPriests: (params: Record<string, unknown>): Promise<AxiosResponse> =>
    axiosInstance.get('/priests', { params }),
  searchNearbyPriests: (params: Record<string, unknown>): Promise<AxiosResponse> =>
    axiosInstance.get('/priests/nearby', { params }),
  getPriestById: (id: string): Promise<AxiosResponse> => axiosInstance.get(`/priests/${id}`),
  getAvailability: (id: string, params: Record<string, unknown>): Promise<AxiosResponse> =>
    axiosInstance.get(`/priests/availability/${id}`, { params }),

  // Protected (Priest only)
  updateProfile: (data: Record<string, unknown>): Promise<AxiosResponse> =>
    axiosInstance.put('/priests/profile', data),
  updateServices: (services: Record<string, unknown>[]): Promise<AxiosResponse> =>
    axiosInstance.put('/priests/services', { services }),
  updateAvailability: (weeklySchedule: Record<string, unknown>): Promise<AxiosResponse> =>
    axiosInstance.put('/priests/availability', { weeklySchedule }),
  addAvailabilityOverride: (overrideData: Record<string, unknown>): Promise<AxiosResponse> =>
    axiosInstance.post('/priests/availability/override', overrideData),
};

export default priestApi;
