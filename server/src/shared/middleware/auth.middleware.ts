import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/shared/config/env';
import { sendUnauthorized, sendForbidden, sendError } from '@/shared/utils/responses';
import { AuthenticatedRequest } from '@/shared/types/api.types';
import { JWTPayload, AuthUser } from './auth.types';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendUnauthorized(res);
      return;
    }

    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    
    // Create user object from JWT payload
    const user: AuthUser = {
      id: decoded.userId,
      walletAddress: decoded.walletAddress,
    };

    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    sendUnauthorized(res);
  }
};

export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
      
      const user: AuthUser = {
        id: decoded.userId,
        walletAddress: decoded.walletAddress,
      };

      (req as AuthenticatedRequest).user = user;
    }
    
    next();
  } catch (error) {
    next();
  }
};