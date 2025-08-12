import { create } from 'zustand';
import type { Position, TradingOpportunity } from '@/types/trading';
import { tradingService } from '@/services/trading';

interface TradingState {
  positions: Position[];
  opportunities: TradingOpportunity[];
  isLoading: boolean;
  error: string | null;
  loadPositions: () => Promise<void>;
  loadOpportunities: () => Promise<void>;
  executeTrade: (symbol: string, side: 'buy' | 'sell', size: number, price?: number) => Promise<void>;
}

export const useTradingStore = create<TradingState>((set, get) => ({
  positions: [],
  opportunities: [],
  isLoading: false,
  error: null,

  loadPositions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await tradingService.getPositions();
      set({ positions: response.positions, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load positions', isLoading: false });
      console.error('Failed to load positions:', error);
    }
  },

  loadOpportunities: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await tradingService.getOpportunities();
      set({ opportunities: response.opportunities, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load opportunities', isLoading: false });
      console.error('Failed to load opportunities:', error);
    }
  },

  executeTrade: async (symbol: string, side: 'buy' | 'sell', size: number, price?: number) => {
    set({ isLoading: true, error: null });
    try {
      await tradingService.executeTrade({
        symbol,
        side,
        size,
        orderType: price ? 'limit' : 'market',
        price,
      });
      
      // Reload positions after successful trade
      await get().loadPositions();
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Failed to execute trade', isLoading: false });
      console.error('Failed to execute trade:', error);
      throw error;
    }
  },
}));