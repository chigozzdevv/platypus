import api from './api';
import type { Signal } from '@/types/signals';
import type { Position, ExecuteTradeRequest, OpportunitiesResponse, PositionCalculation, AccountInfo } from '@/types/trading';

export const tradingService = {
  async getOpportunities(params?: {
    maxSymbols?: number;
    minVolume?: number;
    topCount?: number;
  }): Promise<OpportunitiesResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    return api.get(`/trading/opportunities?${searchParams.toString()}`);
  },

  async executeTrade(data: ExecuteTradeRequest): Promise<{ 
    success: boolean; 
    orderId?: string; 
    message: string;
    position?: Position;
  }> {
    return api.post('/trading/execute', data);
  },

  async calculatePositionSize(params: {
    entryPrice: number;
    stopLoss: number;
    leverage: number;
    symbol: string;
    riskPercentage?: number;
    winRate?: number;
  }): Promise<PositionCalculation> {
    return api.post('/trading/calculate-size', params);
  },

  async executeSignalTrade(signal: Signal, params: {
    riskPercentage: number;
    maxLeverage: number;
  }): Promise<{ success: boolean; orderId?: string; message: string }> {
    return api.post('/trading/execute-signal', {
      signal,
      riskPercentage: params.riskPercentage,
      maxLeverage: params.maxLeverage,
    });
  },

  async getPositions(): Promise<Position[]> {
    return api.get('/trading/positions');
  },

  async getAccountInfo(): Promise<AccountInfo> {
    return api.get('/trading/account-info');
  },

  async closePosition(symbol: string, percentage: number = 100): Promise<{
    success: boolean;
    message: string;
  }> {
    return api.post(`/trading/positions/${symbol}/close`, { percentage });
  },

  async setStopLossTakeProfit(symbol: string, params: {
    stopLoss?: number;
    takeProfit?: number;
  }): Promise<{ success: boolean; message: string }> {
    return api.post(`/trading/positions/${symbol}/sl-tp`, params);
  },
};