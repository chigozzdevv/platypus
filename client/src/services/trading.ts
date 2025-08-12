import api from './api';
import type { OpportunitiesResponse, ExecuteTradeRequest, Position } from '@/types/trading';

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

  async executeTrade(data: ExecuteTradeRequest): Promise<void> {
    return api.post('/trading/execute', data);
  },

  async getPositions(): Promise<{ positions: Position[] }> {
    return api.get('/trading/positions');
  },
};