import api from './api';
import type { PlatformAnalytics, SignalAnalytics, RevenueData } from '@/types/analytics';

export const analyticsService = {
  async getOverview(): Promise<PlatformAnalytics> {
    return api.get('/analytics/overview');
  },

  async getSignalAnalytics(timeframe?: '24h' | '7d' | '30d' | '90d' | '1y'): Promise<SignalAnalytics> {
    const params = timeframe ? `?timeframe=${timeframe}` : '';
    return api.get(`/analytics/signals${params}`);
  },

  async getRevenue(): Promise<RevenueData> {
    return api.get('/analytics/revenue');
  },
};