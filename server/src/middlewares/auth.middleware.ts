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
 * Token must be in Authorization: Bearer <token> header.
 */
export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const token = extractToken(req);

  if (!token) {
    return errorResponse(res, 'You are not logged in. Please log in to get access.', 401);
  }

  // 2) Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { id: string; iat: number };
  } catch {
    return errorResponse(res, 'Invalid token or token expired', 401);
  }

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id).select('+password');
  if (!currentUser) {
    return errorResponse(res, 'The user belonging to this token no longer exists.', 401);
  }

  // 4) Check if user changed password after the token was issued
  // (Optional: Implement passwordChangedAt check if needed)

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

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
