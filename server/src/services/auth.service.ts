import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import { User, IUser } from '../models/user.model';
import { PriestProfile } from '../models/priestProfile.model';
import { UserRole, VerificationStatus } from '../constants/enums';
import { AppError } from '../utils';
import { Email } from './email.service';

/**
 * Service for authentication business logic.
 */
export class AuthService {
  /**
   * Hash a token using SHA-256.
   */
  private static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Sign a JWT access token.
   */
  static signAccessToken(user: IUser): string {
    return jwt.sign({ id: user.id, role: user.role, email: user.email }, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES as SignOptions['expiresIn'],
    });
  }

  /**
   * Sign a JWT refresh token.
   */
  static signRefreshToken(user: IUser): string {
    return jwt.sign({ id: user.id, role: user.role, email: user.email }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES as SignOptions['expiresIn'],
    });
  }

  /**
   * Generate access and refresh tokens, and save hashed refresh token to user.
   */
  static async generateTokensAndSave(
    user: IUser
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.signAccessToken(user);
    const refreshToken = this.signRefreshToken(user);

    const hashedRefreshToken = this.hashToken(refreshToken);
    user.refreshTokens.push(hashedRefreshToken);

    // Limit number of refresh tokens
    if (user.refreshTokens.length > 5) {
      user.refreshTokens.shift();
    }

    await user.save();
    return { accessToken, refreshToken };
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

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedVerificationToken = this.hashToken(verificationToken);

    // Create user
    const user = await User.create({
      ...userData,
      emailVerificationToken: hashedVerificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // Generate tokens and save
    const { accessToken, refreshToken } = await this.generateTokensAndSave(user);

    // Send verification email
    const verificationUrl = `${env.CLIENT_URL}/api/v1/auth/verify-email/${verificationToken}`;
    try {
      await new Email(user, verificationUrl).sendWelcome();
    } catch (err: unknown) {
      console.error('Email could not be sent:', err);
      // We don't throw here as the user is already created and tokens issued
      // They can request another verification email if needed (to be implemented)
    }

    return { user, accessToken, refreshToken };
  }

  /**
   * Register a new priest.
   */
  static async registerPriest(
    userData: Record<string, unknown>
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    // Force role to priest
    userData.role = UserRole.PRIEST;

    const { user, accessToken, refreshToken } = await this.register(userData);

    // Create priest profile
    await PriestProfile.create({
      user: user.id,
      verificationStatus: VerificationStatus.PENDING,
    });

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

    // 2) Generate tokens and save
    const { accessToken, refreshToken } = await this.generateTokensAndSave(user);

    return { user, accessToken, refreshToken };
  }

  /**
   * Refresh access token using refresh token.
   */
  static async refresh(token: string): Promise<{ accessToken: string; newRefreshToken: string }> {
    // 1) Verify token
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string };

    // 2) Find user and check if hashed token exists in their refresh tokens
    const hashedToken = this.hashToken(token);
    const user = await User.findById(decoded.id).select('+refreshTokens');

    if (!user || !user.refreshTokens.includes(hashedToken)) {
      throw new AppError('Invalid refresh token', 401);
    }

    // 3) Rotate refresh token (remove old, generate new)
    user.refreshTokens = user.refreshTokens.filter((t) => t !== hashedToken);

    const { accessToken, refreshToken: newRefreshToken } = await this.generateTokensAndSave(user);

    return { accessToken, newRefreshToken };
  }

  /**
   * Logout user by removing the specific refresh token.
   */
  static async logout(id: string, refreshToken: string): Promise<void> {
    const user = await User.findById(id).select('+refreshTokens');
    if (user) {
      const hashedToken = this.hashToken(refreshToken);
      user.refreshTokens = user.refreshTokens.filter((t) => t !== hashedToken);
      await user.save();
    }
  }

  /**
   * Verify email using token.
   */
  static async verifyEmail(token: string): Promise<void> {
    const hashedToken = this.hashToken(token);
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
  }

  /**
   * Generate password reset token.
   */
  static async forgotPassword(email: string): Promise<string> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('No user found with that email address', 404);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = this.hashToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour

    await user.save();

    // Send password reset email
    const resetUrl = `${env.CLIENT_URL}/api/v1/auth/reset-password/${resetToken}`;
    try {
      await new Email(user, resetUrl).sendPasswordReset();
    } catch {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      throw new AppError('There was an error sending the email. Try again later!', 500);
    }

    return resetToken;
  }

  /**
   * Reset password using token.
   */
  static async resetPassword(token: string, password: string): Promise<void> {
    const hashedToken = this.hashToken(token);
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // Invalidate all existing refresh tokens for security
    user.refreshTokens = [];

    await user.save();

    // Send confirmation email
    try {
      await new Email(user, '').sendPasswordChanged();
    } catch (err) {
      console.error('Confirmation email could not be sent:', err);
    }
  }
}
