import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { useAuthStore, type User as StoreUser } from '../store/authStore';
import { AxiosError } from 'axios';

export const useAuth = (): {
  user: StoreUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: Record<string, unknown>) => Promise<{ success: boolean; message?: string }>;
  register: (
    userData: Record<string, unknown>,
    isPriest?: boolean
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (
    token: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
} => {
  const [isLoading, setIsLoading] = useState(false);
  const { login: storeLogin, logout: storeLogout, user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const login = async (
    credentials: Record<string, unknown>
  ): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', credentials);
      const { user, accessToken } = data.data;
      storeLogin(user, accessToken);
      navigate('/dashboard');
      return { success: true };
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      return {
        success: false,
        message: error.response?.data?.message || 'Failed',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    userData: Record<string, unknown>,
    isPriest = false
  ): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const endpoint = isPriest ? '/auth/register/priest' : '/auth/register';
      const { data } = await api.post(endpoint, userData);
      const { user, accessToken } = data.data;
      storeLogin(user, accessToken);
      navigate(isPriest ? '/priest/onboarding' : '/dashboard');
      return { success: true };
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } finally {
      storeLogout();
      navigate('/login');
    }
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      await api.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset link',
      };
    }
  };

  const resetPassword = async (
    token: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      return { success: true };
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password',
      };
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  };
};
