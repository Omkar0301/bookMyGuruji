import { useState } from 'react';
import { adminApi } from '../api/services/admin.service';
import { toast } from 'react-toastify';
import { IPriestProfile } from '../types/priest';
import { IBooking } from '../types/booking';
import { User as IUser } from '../features/auth/authSlice';

export interface IAdminHook {
  loading: boolean;
  getVerifications: () => Promise<IPriestProfile[]>;
  approveVerification: (priestId: string) => Promise<boolean>;
  rejectVerification: (priestId: string, reason: string) => Promise<boolean>;
  getAnalyticsOverview: () => Promise<IAdminAnalytics | null>;
  getTopPriests: (limit?: number) => Promise<IPriestProfile[]>;
  getBookings: (params?: Record<string, unknown>) => Promise<{ data: IBooking[]; total: number }>;
  getUsers: (params?: Record<string, unknown>) => Promise<{ data: IUser[]; total: number }>;
  deactivateUser: (id: string) => Promise<boolean>;
  activateUser: (id: string) => Promise<boolean>;
  getDisputes: () => Promise<IDispute[]>;
  resolveDispute: (
    id: string,
    resolution: string,
    note: string,
    refund?: number
  ) => Promise<boolean>;
}

export interface IAdminAnalytics {
  totalUsers: number;
  totalPriests: number;
  pendingVerifications: number;
  totalBookings: number;
  bookingsByStatus: Record<string, number>;
  totalRevenue: number;
  platformFeeCollected: number;
  newUsersThisMonth: number;
  bookingsThisMonth: number;
}

export interface IDispute extends IBooking {
  payments?: unknown[];
}

export const useAdmin = (): IAdminHook => {
  const [loading, setLoading] = useState(false);

  const getVerifications = async (): Promise<IPriestProfile[]> => {
    setLoading(true);
    try {
      const { data } = await adminApi.getVerifications();
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to fetch verifications');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const approveVerification = async (priestId: string): Promise<boolean> => {
    setLoading(true);
    try {
      await adminApi.approveVerification(priestId);
      toast.success('Priest approved successfully');
      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to approve priest');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const rejectVerification = async (priestId: string, reason: string): Promise<boolean> => {
    setLoading(true);
    try {
      await adminApi.rejectVerification(priestId, reason);
      toast.success('Priest rejected');
      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to reject priest');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getAnalyticsOverview = async (): Promise<IAdminAnalytics | null> => {
    setLoading(true);
    try {
      const { data } = await adminApi.getAnalyticsOverview();
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to fetch analytics');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getTopPriests = async (limit?: number): Promise<IPriestProfile[]> => {
    setLoading(true);
    try {
      const { data } = await adminApi.getTopPriests(limit);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to fetch top priests');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getBookings = async (
    params?: Record<string, unknown>
  ): Promise<{ data: IBooking[]; total: number }> => {
    setLoading(true);
    try {
      const { data } = await adminApi.getBookings(params);
      return { data: data.data, total: data.pagination?.total || 0 };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to fetch bookings');
      return { data: [], total: 0 };
    } finally {
      setLoading(false);
    }
  };

  const getUsers = async (
    params?: Record<string, unknown>
  ): Promise<{ data: IUser[]; total: number }> => {
    setLoading(true);
    try {
      const { data } = await adminApi.getUsers(params);
      return { data: data.data, total: data.pagination?.total || 0 };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to fetch users');
      return { data: [], total: 0 };
    } finally {
      setLoading(false);
    }
  };

  const deactivateUser = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      await adminApi.deactivateUser(id);
      toast.success('User deactivated');
      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to deactivate user');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const activateUser = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      await adminApi.activateUser(id);
      toast.success('User activated');
      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to activate user');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getDisputes = async (): Promise<IDispute[]> => {
    setLoading(true);
    try {
      const { data } = await adminApi.getDisputes();
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to fetch disputes');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const resolveDispute = async (
    id: string,
    resolution: string,
    note: string,
    refund?: number
  ): Promise<boolean> => {
    setLoading(true);
    try {
      await adminApi.resolveDispute(id, { resolution, note, refund });
      toast.success('Dispute resolved');
      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to resolve dispute');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getVerifications,
    approveVerification,
    rejectVerification,
    getAnalyticsOverview,
    getTopPriests,
    getBookings,
    getUsers,
    deactivateUser,
    activateUser,
    getDisputes,
    resolveDispute,
  };
};
