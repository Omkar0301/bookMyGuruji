import { adminApi } from '../api/services/admin.service';
import { toast } from 'react-toastify';
import { useState } from 'react';

interface AdminHook {
  loading: boolean;
  getVerifications: () => Promise<Record<string, unknown>[]>;
  approvePriest: (priestId: string) => Promise<boolean>;
  rejectPriest: (priestId: string, reason: string) => Promise<boolean>;
  getUsers: (params?: Record<string, unknown>) => Promise<Record<string, unknown> | null>;
  getBookings: (params?: Record<string, unknown>) => Promise<Record<string, unknown> | null>;
  getAnalyticsOverview: () => Promise<Record<string, unknown> | null>;
}

export const useAdmin = (): AdminHook => {
  const [loading, setLoading] = useState(false);

  const getVerifications = async (): Promise<Record<string, unknown>[]> => {
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

  const approvePriest = async (priestId: string): Promise<boolean> => {
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

  const rejectPriest = async (priestId: string, reason: string): Promise<boolean> => {
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

  const getUsers = async (
    params?: Record<string, unknown>
  ): Promise<Record<string, unknown> | null> => {
    setLoading(true);
    try {
      const { data } = await adminApi.getUsers(params);
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to fetch users');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getBookings = async (
    params?: Record<string, unknown>
  ): Promise<Record<string, unknown> | null> => {
    setLoading(true);
    try {
      const { data } = await adminApi.getBookings(params);
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to fetch bookings');
      return null;
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

  return {
    loading,
    getVerifications,
    approvePriest,
    rejectPriest,
    getUsers,
    getBookings,
    getAnalyticsOverview,
  };
};
