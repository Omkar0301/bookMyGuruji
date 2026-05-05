import { useState } from 'react';
import { adminApi } from '../api/services/admin.service';
import { toast } from 'react-toastify';
import { IPriestProfile } from '../types/priest';
import { IBooking } from '../types/booking';

export interface IAdminHook {
  loading: boolean;
  getVerifications: () => Promise<IPriestProfile[]>;
  approveVerification: (priestId: string) => Promise<boolean>;
  rejectVerification: (priestId: string, reason: string) => Promise<boolean>;
  getAnalyticsOverview: () => Promise<Record<string, unknown> | null>;
  getTopPriests: (limit?: number) => Promise<Record<string, unknown>[]>;
  getBookings: (params?: Record<string, unknown>) => Promise<{ data: IBooking[]; total: number }>;
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

  const getAnalyticsOverview = async (): Promise<Record<string, unknown> | null> => {
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

  const getTopPriests = async (limit?: number): Promise<Record<string, unknown>[]> => {
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

  return {
    loading,
    getVerifications,
    approveVerification,
    rejectVerification,
    getAnalyticsOverview,
    getTopPriests,
    getBookings,
  };
};
