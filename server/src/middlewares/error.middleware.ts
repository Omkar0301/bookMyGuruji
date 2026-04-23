import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import { errorResponse } from '../utils/response';

interface IExtendedError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: number;
  keyValue?: Record<string, string>;
  path?: string;
  value?: string;
  errors?: Record<string, { path: string; message: string }>;
}

/**
 * Global error handler — MUST be the last middleware registered.
 * Distinguishes operational errors (expected) from programmer errors (unexpected).
 */
export const errorHandler = (
  err: IExtendedError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;

  logger.error({
    err: {
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
    },
    url: req.originalUrl,
    method: req.method,
  });

  // Development: send full error details
  if (env.NODE_ENV === 'development') {
    res.status(statusCode).json({
      success: false,
      message: err.message,
      stack: err.stack,
    });
    return;
  }

  // Production: hide internals
  if (err.isOperational) {
    errorResponse(res, err.message, statusCode);
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError' && err.errors) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    errorResponse(res, 'Validation failed', 400, errors);
    return;
  }

  // Mongoose duplicate key
  if (err.code === 11000 && err.keyValue) {
    const field = Object.keys(err.keyValue)[0];
    errorResponse(res, `${field} already exists`, 409);
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    errorResponse(res, `Invalid ${err.path}: ${err.value}`, 400);
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    errorResponse(res, 'Invalid token', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    errorResponse(res, 'Token expired', 401);
    return;
  }

  // Generic server error
  errorResponse(res, 'Something went wrong.', 500);
};
