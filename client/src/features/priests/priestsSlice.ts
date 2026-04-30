import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PriestsState {
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
}

const initialState: PriestsState = {
  searchResults: [],
  selectedPriest: null,
  filters: {
    ceremonyType: '',
    location: '',
    date: null,
    rating: 0,
  },
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  loading: false,
};

const priestsSlice = createSlice({
  name: 'priests',
  initialState,
  reducers: {
    setSearchResults: (
      state,
      action: PayloadAction<{ data: Record<string, unknown>[]; pagination?: Pagination }>
    ) => {
      state.searchResults = action.payload.data;
      state.pagination = action.payload.pagination || state.pagination;
    },
    setSelectedPriest: (state, action: PayloadAction<Record<string, unknown> | null>) => {
      state.selectedPriest = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<PriestsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setPagination: (state, action: PayloadAction<Partial<Pagination>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
});

export const { setSearchResults, setSelectedPriest, setFilters, setLoading, setPagination } =
  priestsSlice.actions;
export default priestsSlice.reducer;
