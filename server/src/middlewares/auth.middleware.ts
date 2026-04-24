import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User, IUser } from '../models/user.model';
import { catchAsync } from '../utils';
import { errorResponse } from '../utils/response';
import { extractToken } from './extractToken.middleware';

// Extend Express Request type to include user
declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser;
  }
}

/**
 * Middleware to protect routes — verifies JWT access token.
 */
export const protect: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = extractToken(req);

    if (!token) {
      return errorResponse(res, 'You are not logged in. Please log in to get access.', 401);
    }

    // 2) Verify token
    let decoded: { id: string; role: string; email: string };
    try {
      decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
        id: string;
        role: string;
        email: string;
      };
    } catch {
      return errorResponse(res, 'Invalid token or token expired', 401);
    }

    // 3) Check if user still exists and is active
    // Exclude password and refreshTokens by default (not selecting them)
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return errorResponse(res, 'The user belonging to this token no longer exists.', 401);
    }

    if (!currentUser.isActive) {
      return errorResponse(res, 'This user account is deactivated.', 403);
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  }
);

/**
 * Middleware to restrict access based on user roles.
 */
export const restrictTo = (...roles: string[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, 'You do not have permission to perform this action', 403);
    }
    next();
  };
};

/**
 * Alias for restrictTo to match requested strategy naming.
 */
export const authorize = restrictTo;
