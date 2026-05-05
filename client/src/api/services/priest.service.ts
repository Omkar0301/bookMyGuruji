import type { AxiosResponse } from 'axios';
import axiosInstance from '../axiosInstance';
import {
  IWeeklySchedule,
  IService,
  IAvailabilityOverride,
  IPriestProfile,
} from '../../types/priest';

export const priestApi = {
  searchPriests: (params: Record<string, unknown>): Promise<AxiosResponse> =>
    axiosInstance.get('/priests', { params }),
  searchNearbyPriests: (params: Record<string, unknown>): Promise<AxiosResponse> =>
    axiosInstance.get('/priests/nearby', { params }),
  getPriestById: (id: string): Promise<AxiosResponse> => axiosInstance.get(`/priests/${id}`),
  getAvailability: (id: string, params: Record<string, unknown>): Promise<AxiosResponse> =>
    axiosInstance.get(`/priests/availability/${id}`, { params }),

  getMyProfile: (): Promise<AxiosResponse> => axiosInstance.get('/priests/me'),

  // Protected (Priest only)
  updateProfile: (data: Partial<IPriestProfile>): Promise<AxiosResponse> =>
    axiosInstance.put('/priests/profile', data),
  updateServices: (services: IService[]): Promise<AxiosResponse> =>
    axiosInstance.put('/priests/services', { services }),
  updateAvailability: (weeklySchedule: IWeeklySchedule[]): Promise<AxiosResponse> =>
    axiosInstance.put('/priests/availability', { weeklySchedule }),
  addAvailabilityOverride: (overrideData: IAvailabilityOverride): Promise<AxiosResponse> =>
    axiosInstance.post('/priests/availability/override', overrideData),
};

export default priestApi;
