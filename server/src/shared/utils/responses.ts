import { Response } from 'express';
import { ERROR_CODES } from '@/shared/config/constants';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export const createResponse = <T>(
  success: boolean,
  data?: T,
  error?: { code: string; message: string; details?: any }
): ApiResponse<T> => ({
  success,
  ...(data !== undefined && { data }),
  ...(error && { error }),
  meta: {
    timestamp: new Date().toISOString(),
  },
});

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  statusCode: number = 200
): Response => {
  return res.status(statusCode).json(createResponse(true, data));
};

export const sendError = (
  res: Response,
  code: string,
  message: string,
  statusCode: number = 400,
  details?: any
): Response => {
  return res.status(statusCode).json(
    createResponse(false, undefined, { code, message, details })
  );
};

export const sendValidationError = (
  res: Response,
  details: any
): Response => {
  return sendError(
    res,
    ERROR_CODES.VALIDATION_ERROR,
    'Validation failed',
    400,
    details
  );
};

export const sendUnauthorized = (res: Response): Response => {
  return sendError(
    res,
    ERROR_CODES.UNAUTHORIZED,
    'Authentication required',
    401
  );
};

export const sendForbidden = (res: Response): Response => {
  return sendError(
    res,
    ERROR_CODES.FORBIDDEN,
    'Access denied',
    403
  );
};

export const sendNotFound = (res: Response, resource: string = 'Resource'): Response => {
  return sendError(
    res,
    ERROR_CODES.NOT_FOUND,
    `${resource} not found`,
    404
  );
};

export const sendIPAccessRequired = (res: Response): Response => {
  return sendError(
    res,
    ERROR_CODES.IP_ACCESS_REQUIRED,
    'Purchase signal access to continue',
    402
  );
};