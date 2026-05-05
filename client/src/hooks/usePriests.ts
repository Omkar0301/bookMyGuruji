import { useDispatch, useSelector } from 'react-redux';
import { priestApi } from '../api/services/priest.service';
import {
  setSearchResults,
  setSelectedPriest,
  setLoading,
  setFilters as setStoreFilters,
} from '../features/priests/priestsSlice';
import { RootState } from '../app/store';
import { toast } from 'react-toastify';
import { IPriestProfile, IWeeklySchedule, IService, ISlot } from '../types/priest';

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PriestsHook {
  searchResults: Record<string, unknown>[];
  selectedPriest: Record<string, unknown> | null;
  filters: {
    ceremonyType: string;
    location: string;
    date: string | null;
    rating: number;
  };
  pagination: Pagination;
  loading: boolean;
  searchPriests: (searchParams?: Record<string, unknown>) => Promise<void>;
  getPriestById: (id: string) => Promise<Record<string, unknown> | null>;
  getAvailability: (
    id: string,
    fromDate: string,
    toDate: string
  ) => Promise<Record<string, unknown> | null>;
  getMyProfile: () => Promise<IPriestProfile | null>;
  updateProfile: (data: Partial<IPriestProfile>) => Promise<{ success: boolean; message?: string }>;
  updateServices: (services: IService[]) => Promise<{ success: boolean; message?: string }>;
  updateAvailability: (
    weeklySchedule: IWeeklySchedule[]
  ) => Promise<{ success: boolean; message?: string }>;
  addAvailabilityOverride: (data: {
    date: string;
    isAvailable: boolean;
    slots?: ISlot[];
  }) => Promise<{ success: boolean; message?: string }>;
  setFilters: (newFilters: Partial<PriestsHook['filters']>) => void;
}

export const usePriests = (): PriestsHook => {
  const dispatch = useDispatch();
  const { searchResults, selectedPriest, filters, pagination, loading } = useSelector(
    (state: RootState) => state.priests
  );

  const searchPriests = async (searchParams?: Record<string, unknown>): Promise<void> => {
    dispatch(setLoading(true));
    try {
      const params = {
        ...filters,
        ...searchParams,
        page: pagination.page,
        limit: pagination.limit,
      };
      const { data } = await priestApi.searchPriests(params);
      dispatch(setSearchResults({ data: data.data, pagination: data.pagination }));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to search priests');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getPriestById = async (id: string): Promise<Record<string, unknown> | null> => {
    dispatch(setLoading(true));
    try {
      const { data } = await priestApi.getPriestById(id);
      dispatch(setSelectedPriest(data.data));
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to fetch priest details');
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getAvailability = async (
    id: string,
    fromDate: string,
    toDate: string
  ): Promise<Record<string, unknown> | null> => {
    try {
      const { data } = await priestApi.getAvailability(id, { fromDate, toDate });
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to fetch availability');
      return null;
    }
  };

  const setFilters = (newFilters: Partial<PriestsHook['filters']>): void => {
    dispatch(setStoreFilters(newFilters));
  };

  const getMyProfile = async (): Promise<IPriestProfile | null> => {
    dispatch(setLoading(true));
    try {
      const { data } = await priestApi.getMyProfile();
      return data.data as IPriestProfile;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to fetch your profile');
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateProfile = async (
    data: Partial<IPriestProfile>
  ): Promise<{ success: boolean; message?: string }> => {
    dispatch(setLoading(true));
    try {
      await priestApi.updateProfile(data);
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || 'Failed to update profile';
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateServices = async (
    services: IService[]
  ): Promise<{ success: boolean; message?: string }> => {
    dispatch(setLoading(true));
    try {
      const { data } = await priestApi.updateServices(services);
      toast.success('Services updated successfully');
      return { success: true, message: data.message };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to update services');
      return { success: false, message: error.response?.data?.message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateAvailability = async (
    weeklySchedule: IWeeklySchedule[]
  ): Promise<{ success: boolean; message?: string }> => {
    dispatch(setLoading(true));
    try {
      const { data } = await priestApi.updateAvailability(weeklySchedule);
      toast.success('Availability updated successfully');
      return { success: true, message: data.message };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to update availability');
      return { success: false, message: error.response?.data?.message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const addAvailabilityOverride = async (data: {
    date: string;
    isAvailable: boolean;
    slots?: ISlot[];
  }): Promise<{ success: boolean; message?: string }> => {
    dispatch(setLoading(true));
    try {
      await priestApi.addAvailabilityOverride(data);
      toast.success('Availability override added');
      return { success: true };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || 'Failed to add override';
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    searchResults,
    selectedPriest,
    filters,
    pagination,
    loading,
    searchPriests,
    getPriestById,
    getAvailability,
    getMyProfile,
    updateProfile,
    updateServices,
    updateAvailability,
    addAvailabilityOverride,
    setFilters,
  };
};
