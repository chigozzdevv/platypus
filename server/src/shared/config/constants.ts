export const API_ROUTES = {
  AUTH: '/api/auth',
  SIGNALS: '/api/signals',
  TRADING: '/api/trading',
  IP: '/api/ip',
  ANALYTICS: '/api/analytics',
} as const;

export const IP_USAGE_CONFIG = {
  DEFAULT_PRICE_USDC: 1, // $1 USDC per signal use
  DEFAULT_DURATION: 86400, // 24 hours access
  PLATFORM_FEE_BPS: 3000, // 30% platform fee
  CREATOR_SHARE_BPS: 7000, // 70% to creators (split between AI + human)
} as const;

export const SIGNAL_CONFIG = {
  MAX_PARENT_SIGNALS: 8,
  MIN_CONFIDENCE: 0,
  MAX_CONFIDENCE: 100,
  SUPPORTED_TIMEFRAMES: ['1m', '5m', '15m', '1h', '4h', '1d'] as const,
  USAGE_POINTS: {
    VIEW: 1,
    COPY: 3,
    FOLLOW: 2,
    EXECUTE: 5,
  },
} as const;

export const TRADING_CONFIG = {
  DEFAULT_LEVERAGE: 3,
  MAX_LEVERAGE: 20,
  MIN_POSITION_SIZE_USD: 10,
  SUPPORTED_RISK_PERCENTAGES: [1, 2, 5, 10] as const,
  DEFAULT_RISK_PERCENTAGE: 2,
} as const;

export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  TRADING_ERROR: 'TRADING_ERROR',
  IP_REGISTRATION_FAILED: 'IP_REGISTRATION_FAILED',
  IP_ACCESS_REQUIRED: 'IP_ACCESS_REQUIRED',
} as const;

export const SUCCESS_MESSAGES = {
  USER_AUTHENTICATED: 'User authenticated successfully',
  SIGNAL_CREATED: 'Signal created successfully',
  SIGNAL_IMPROVED: 'Signal improved successfully',
  TRADE_EXECUTED: 'Trade executed successfully',
  IP_REGISTERED: 'IP registered successfully',
  IP_ACCESS_PURCHASED: 'Signal access purchased successfully',
} as const;

export const CACHE_TTL = {
  USER_PROFILE: 300, // 5 minutes
  SIGNALS: 60, // 1 minute
  MARKET_DATA: 30, // 30 seconds
  SUBSCRIPTION_STATUS: 300, // 5 minutes
} as const;