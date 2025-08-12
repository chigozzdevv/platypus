export const APP_CONFIG = {
  name: 'Platypus',
  description: 'AI-Enhanced Trading IP Platform',
  version: '1.0.0',
};

export const TRADING_CONFIG = {
  minSignalConfidence: 50,
  improvementQualityThreshold: 50,
  maxSignalsPerUser: 100,
  signalExpiryHours: 24,
  revenueShare: {
    creator: 0.4,
    improver: 0.6,
    platform: 0.02,
  },
};

export const ROUTES = {
  landing: '/',
  auth: '/auth',
  dashboard: {
    overview: '/dashboard',
    marketplace: '/dashboard/marketplace',
    signals: '/dashboard/signals',
    royalties: '/dashboard/royalties',
    mySignals: '/dashboard/my-signals',
    profile: '/dashboard/profile',
    settings: '/dashboard/settings',
  },
};

export const API_ENDPOINTS = {
  auth: {
    generateNonce: '/auth/generate-nonce',
    connect: '/auth/connect',
    profile: '/auth/profile',
    exchangeConnect: '/auth/exchange/connect',
    exchangeStatus: '/auth/exchange',
  },
  signals: {
    base: '/signals',
    public: '/signals/public',
    improvable: '/signals/improvable',
    user: '/signals/user/signals',
    improve: (id: string) => `/signals/${id}/improve`,
  },
  marketplace: {
    base: '/ip/marketplace',
    register: '/ip/register',
    purchase: '/ip/purchase',
    userAssets: '/ip/user/assets',
  },
  trading: {
    opportunities: '/trading/opportunities',
    execute: '/trading/execute',
    positions: '/trading/positions',
  },
  analytics: {
    overview: '/analytics/overview',
    signals: '/analytics/signals',
    revenue: '/analytics/revenue',
  },
};

export const SIGNAL_TYPES = {
  base: 'base',
  improvement: 'improvement',
} as const;

export const IMPROVEMENT_TYPES = {
  entryAdjustment: 'entry-adjustment',
  stopLossAdjustment: 'stop-loss-adjustment',
  takeProfitAdjustment: 'take-profit-adjustment',
  analysisEnhancement: 'analysis-enhancement',
} as const;

export const ORDER_TYPES = {
  market: 'market',
  limit: 'limit',
} as const;

export const POSITION_SIDES = {
  long: 'long',
  short: 'short',
} as const;