import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authApi } from '../api/authApi';
import { setCredentials, logout as storeLogout, setLoading } from '../features/auth/authSlice';
import { AxiosError } from 'axios';

// Define the User interface locally or import it if shared
export interface User {
  id: string;
  email: string;
  role: 'user' | 'priest' | 'admin';
  name: { first: string; last: string };
  avatar?: string;
  isEmailVerified: boolean;
}

interface RootState {
  auth: {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
  };
}

export interface AuthHookReturn {
  user: User | null;
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
}

export const useAuth = (): AuthHookReturn => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    loading: isLoading,
  } = useSelector((state: RootState) => state.auth);

  const login = async (
    credentials: Record<string, unknown>
  ): Promise<{ success: boolean; message?: string }> => {
    dispatch(setLoading(true));
    try {
      const { data } = await authApi.login(credentials);
      const { user, accessToken } = data.data;
      dispatch(setCredentials({ user, accessToken }));
      navigate('/dashboard');
      return { success: true };
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const register = async (
    userData: Record<string, unknown>,
    isPriest = false
  ): Promise<{ success: boolean; message?: string }> => {
    dispatch(setLoading(true));
    try {
      const response = isPriest
        ? await authApi.registerPriest(userData)
        : await authApi.register(userData);

      const { user, accessToken } = response.data.data;
      dispatch(setCredentials({ user, accessToken }));
      navigate(isPriest ? '/priest/onboarding' : '/dashboard');
      return { success: true };
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } finally {
      dispatch(storeLogout());
      navigate('/login');
    }
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
    dispatch(setLoading(true));
    try {
      await authApi.forgotPassword(email);
      return { success: true };
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset link',
      };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const resetPassword = async (
    token: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    dispatch(setLoading(true));
    try {
      await authApi.resetPassword(token, password);
      return { success: true };
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password',
      };
    } finally {
      dispatch(setLoading(false));
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
