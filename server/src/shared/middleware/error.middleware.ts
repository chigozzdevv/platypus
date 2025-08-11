import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { MongoError } from 'mongodb';
import { logger } from '@/shared/utils/logger';
import { sendError, sendValidationError } from '@/shared/utils/responses';
import { ERROR_CODES } from '@/shared/config/constants';
import { isDevelopment } from '@/shared/config/env';

export class CustomError extends Error {
  public statusCode: number;
  public code: string;
  public details: any;

  constructor(code: string, statusCode: number, message: string, details: any = null) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
  }
}

export const errorMiddleware = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error caught by middleware:', {
    error: error.message,
    stack: isDevelopment ? error.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Zod validation errors
  if (error instanceof ZodError) {
    const validationErrors = error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));
    
    sendValidationError(res, validationErrors);
    return;
  }

  // MongoDB errors
  if (error instanceof MongoError) {
    switch (error.code) {
      case '11000':
        sendError(res, 'DUPLICATE_KEY', 'Resource already exists', 409);
        return;
      case '11001':
        sendError(res, 'DUPLICATE_KEY', 'Duplicate key error', 409);
        return;
      default:
        sendError(res, 'DATABASE_ERROR', 'Database operation failed', 500);
        return;
    }
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    sendError(res, ERROR_CODES.UNAUTHORIZED, 'Invalid token', 401);
    return;
  }

  if (error.name === 'TokenExpiredError') {
    sendError(res, ERROR_CODES.UNAUTHORIZED, 'Token expired', 401);
    return;
  }

  // Custom application errors
  if (error.statusCode && error.code) {
    sendError(res, error.code, error.message, error.statusCode, error.details);
    return;
  }

  // Default server error
  const message = isDevelopment ? error.message : 'Internal server error';
  sendError(res, 'INTERNAL_ERROR', message, 500, isDevelopment ? error.stack : undefined);
};

export const notFoundMiddleware = (req: Request, res: Response): void => {
  sendError(res, ERROR_CODES.NOT_FOUND, `Route ${req.originalUrl} not found`, 404);
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};