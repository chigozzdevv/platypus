import mongoose, { Schema, Document } from 'mongoose';

export interface TradeDocument extends Document {
  userId: string;
  signalId: string;
  exchange: 'hyperliquid';
  symbol: string;
  side: 'long' | 'short';
  size: number;
  leverage: number;
  entryPrice: number;
  exitPrice?: number;
  currentPrice?: number;
  unrealizedPnl: number;
  realizedPnl?: number;
  pnlPercentage: number;
  stopLoss?: number;
  takeProfit?: number;
  status: 'open' | 'closed' | 'pending' | 'cancelled';
  orderType: 'market' | 'limit';
  exchangeOrderId?: string;
  exchangeTxHash?: string;
  fees: {
    entry: number;
    exit?: number;
    funding?: number;
    total: number;
  };
  execution: {
    entryOrderId?: string;
    stopLossOrderId?: string;
    takeProfitOrderId?: string;
    exitOrderId?: string;
    slippage?: number;
  };
  risk: {
    riskAmount: number;
    riskPercentage: number;
    maxDrawdown: number;
    maxProfit: number;
  };
  timing: {
    signalCreatedAt: Date;
    orderPlacedAt?: Date;
    filledAt?: Date;
    exitedAt?: Date;
    duration?: number; // in milliseconds
  };
  performance: {
    roi: number;
    sharpeRatio?: number;
    maxDrawdownPct?: number;
    holdingPeriod?: number; // in hours
  };
}

const TradeSchema = new Schema<TradeDocument>(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
    },
    signalId: {
      type: String,
      ref: 'Signal',
      required: true,
    },
    exchange: {
      type: String,
      enum: ['hyperliquid'],
      default: 'hyperliquid',
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
    },
    side: {
      type: String,
      enum: ['long', 'short'],
      required: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    leverage: {
      type: Number,
      required: true,
      min: 1,
      max: 50,
    },
    entryPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    exitPrice: {
      type: Number,
      min: 0,
    },
    currentPrice: {
      type: Number,
      min: 0,
    },
    unrealizedPnl: {
      type: Number,
      default: 0,
    },
    realizedPnl: {
      type: Number,
    },
    pnlPercentage: {
      type: Number,
      default: 0,
    },
    stopLoss: {
      type: Number,
      min: 0,
    },
    takeProfit: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'pending', 'cancelled'],
      default: 'pending',
    },
    orderType: {
      type: String,
      enum: ['market', 'limit'],
      default: 'market',
    },
    exchangeOrderId: String,
    exchangeTxHash: String,
    fees: {
      entry: { type: Number, default: 0 },
      exit: { type: Number, default: 0 },
      funding: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    execution: {
      entryOrderId: String,
      stopLossOrderId: String,
      takeProfitOrderId: String,
      exitOrderId: String,
      slippage: Number,
    },
    risk: {
      riskAmount: { type: Number, required: true },
      riskPercentage: { type: Number, required: true },
      maxDrawdown: { type: Number, default: 0 },
      maxProfit: { type: Number, default: 0 },
    },
    timing: {
      signalCreatedAt: { type: Date, required: true },
      orderPlacedAt: Date,
      filledAt: Date,
      exitedAt: Date,
      duration: Number,
    },
    performance: {
      roi: { type: Number, default: 0 },
      sharpeRatio: Number,
      maxDrawdownPct: Number,
      holdingPeriod: Number,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        const { _id, __v, ...cleanRet } = ret;
        cleanRet.id = _id;
        return cleanRet;
      },
    },
  }
);

TradeSchema.index({ userId: 1 });
TradeSchema.index({ signalId: 1 });
TradeSchema.index({ symbol: 1 });
TradeSchema.index({ status: 1 });
TradeSchema.index({ createdAt: -1 });
TradeSchema.index({ 'timing.filledAt': -1 });
TradeSchema.index({ 'performance.roi': -1 });

export const Trade = mongoose.model<TradeDocument>('Trade', TradeSchema);