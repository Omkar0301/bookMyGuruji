import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { catchAsync } from '../utils';
import { successResponse, errorResponse } from '../utils/response';
import { env } from '../config/env';

/**
 * Controller for authentication endpoints.
 */
export class AuthController {
  private static setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/v1/auth/refresh',
    });
  }

  /**
   * Register a new user.
   */
  static register = catchAsync(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await AuthService.register(req.body);

    AuthController.setAuthCookies(res, accessToken, refreshToken);

    return successResponse(res, { user, accessToken }, 'User created successfully', 201);
  });

  /**
   * Register a new priest.
   */
  static registerPriest = catchAsync(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await AuthService.registerPriest(req.body);

    AuthController.setAuthCookies(res, accessToken, refreshToken);

    return successResponse(res, { user, accessToken }, 'Priest registered successfully', 201);
  });

  /**
   * Login user.
   */
  static login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await AuthService.login(email, password);

    AuthController.setAuthCookies(res, accessToken, refreshToken);

    return successResponse(res, { user, accessToken }, 'Login successful');
  });

  /**
   * Verify email.
   */
  static verifyEmail = catchAsync(async (req: Request, res: Response) => {
    const { token } = req.params;
    if (!token) {
      return errorResponse(res, 'Verification token is required', 400);
    }
    await AuthService.verifyEmail(token as string);
    return successResponse(res, null, 'Email verified successfully');
  });

  /**
   * Forgot password.
   */
  static forgotPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    await AuthService.forgotPassword(email);
    return successResponse(res, null, 'Password reset link sent to your email');
  });

  /**
   * Reset password.
   */
  static resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;
    if (!token) {
      return errorResponse(res, 'Reset token is required', 400);
    }
    await AuthService.resetPassword(token as string, password);
    return successResponse(res, null, 'Password reset successfully');
  });

  /**
   * Handle Google OAuth success.
   */
  static googleAuthSuccess = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      return errorResponse(res, 'Google authentication failed', 401);
    }

    const { accessToken, refreshToken } = await AuthService.generateTokensAndSave(req.user);

    AuthController.setAuthCookies(res, accessToken, refreshToken);

    // Redirect to frontend with token or just respond success if it's a popup
    // Since it's a callback, usually we redirect to a frontend success page
    res.redirect(`${env.CLIENT_URL}/oauth-success?token=${accessToken}`);
  });

  /**
   * Refresh access token.
   */
  static refresh = catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return errorResponse(res, 'Refresh token missing', 401);
    }

    const { accessToken, newRefreshToken } = await AuthService.refresh(refreshToken);

    AuthController.setAuthCookies(res, accessToken, newRefreshToken);

    return successResponse(res, { accessToken }, 'Token refreshed');
  });

  /**
   * Logout user.
   */
  static logout = catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken && req.user) {
      await AuthService.logout(req.user.id, refreshToken);
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });

    return successResponse(res, null, 'Logged out successfully');
  });

  /**
   * Get current user profile (me).
   */
  static getMe = catchAsync(async (req: Request, res: Response) => {
    return successResponse(res, req.user, 'User profile fetched');
  });
}
