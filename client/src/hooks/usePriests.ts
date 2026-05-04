import { useDispatch, useSelector } from 'react-redux';
import { priestApi } from '../api/services/priest.service';
import {
  setSearchResults,
  setSelectedPriest,
  setLoading,
  setFilters as setStoreFilters,
} from '../features/priests/priestsSlice';
import type { RootState } from '../app/store';
import { toast } from 'react-toastify';

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

  return {
    searchResults,
    selectedPriest,
    filters,
    pagination,
    loading,
    searchPriests,
    getPriestById,
    getAvailability,
    setFilters,
  };
};
