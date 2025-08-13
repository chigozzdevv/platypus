import { Request } from 'express';
import { AuthUser } from '@/shared/middleware/auth.types';

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

export interface PaginationQuery {
  page: number;
  limit: number;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export type SignalDirection = 'long' | 'short';
export type SignalTimeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
export type SignalType = 'base' | 'improved';
export type TradeStatus = 'open' | 'closed' | 'pending' | 'cancelled';
export type UsageType = 'view' | 'copy' | 'follow' | 'execute';