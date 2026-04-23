import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { User, IUser } from '../models/user.model';
import { AppError } from '../utils';

/**
 * Service for authentication business logic.
 */
export class AuthService {
  /**
   * Sign a JWT access token.
   */
  static signAccessToken(id: string): string {
    return jwt.sign({ id }, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES as SignOptions['expiresIn'],
    });
  }

  /**
   * Sign a JWT refresh token.
   */
  static signRefreshToken(id: string): string {
    return jwt.sign({ id }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES as SignOptions['expiresIn'],
    });
  }

  /**
   * Register a new user.
   */
  static async register(
    userData: Record<string, unknown>
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const existingPhone = await User.findOne({ phone: userData.phone });
    if (existingPhone) {
      throw new AppError('Phone number already registered', 409);
    }

    // Create user
    const user = await User.create(userData);

    // Generate tokens
    const accessToken = this.signAccessToken(user.id);
    const refreshToken = this.signRefreshToken(user.id);

    // Save refresh token to user
    user.refreshTokens.push(refreshToken);
    await user.save();

    return { user, accessToken, refreshToken };
  }

  /**
   * Login a user.
   */
  static async login(
    email: string,
    password: string
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    // 1) Find user and include password
    const user = await User.findOne({ email }).select('+password +refreshTokens');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account is deactivated. Please contact support.', 403);
    }

    // 2) Generate tokens
    const accessToken = this.signAccessToken(user.id);
    const refreshToken = this.signRefreshToken(user.id);

    // 3) Store refresh token (simple rotation logic could be added here)
    user.refreshTokens.push(refreshToken);
    await user.save();

    return { user, accessToken, refreshToken };
  }

  /**
   * Refresh access token using refresh token.
   */
  static async refresh(token: string): Promise<{ accessToken: string; newRefreshToken: string }> {
    // 1) Verify token
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string };

    // 2) Find user and check if token exists in their refresh tokens
    const user = await User.findById(decoded.id).select('+refreshTokens');
    if (!user || !user.refreshTokens.includes(token)) {
      throw new AppError('Invalid refresh token', 401);
    }

    // 3) Rotate refresh token (remove old, add new)
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    const accessToken = this.signAccessToken(user.id);
    const newRefreshToken = this.signRefreshToken(user.id);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    return { accessToken, newRefreshToken };
  }

  /**
   * Logout user by removing the specific refresh token.
   */
  static async logout(id: string, refreshToken: string): Promise<void> {
    const user = await User.findById(id).select('+refreshTokens');
    if (user) {
      user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
      await user.save();
    }
  }
}
