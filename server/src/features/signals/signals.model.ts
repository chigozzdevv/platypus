import mongoose, { Schema } from 'mongoose';
import { SignalDocument } from '@/shared/types/database.types';

const SignalSchema = new Schema<SignalDocument>(
  {
    creator: {
      type: String,
      ref: 'User',
      required: true,
    },
    aiModel: {
      type: String,
      enum: ['gpt-4o', 'gpt-4o-mini'],
      required: true,
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
    entryPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    stopLoss: {
      type: Number,
      required: true,
      min: 0,
    },
    takeProfit: {
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
    riskRewardRatio: {
      type: Number,
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    analysis: {
      technicalAnalysis: {
        type: String,
        required: true,
      },
      marketAnalysis: {
        type: String,
        required: true,
      },
      sentimentAnalysis: {
        type: String,
        required: true,
      },
      riskAssessment: {
        type: String,
        required: true,
      },
    },
    marketConditions: {
      fearGreedIndex: Number,
      volatility: Number,
      volume24h: Number,
      priceChange24h: Number,
    },
    aiInsights: {
      keyLevels: [Number],
      patternRecognition: String,
      volumeProfile: String,
      momentumIndicators: String,
    },
    performance: {
      outcome: {
        type: String,
        enum: ['pending', 'win', 'loss', 'breakeven'],
        default: 'pending',
      },
      actualReturn: {
        type: Number,
        default: 0,
      },
      executionPrice: Number,
      exitPrice: Number,
      exitReason: {
        type: String,
        enum: ['take-profit', 'stop-loss', 'manual', 'expired'],
      },
      executedAt: Date,
      closedAt: Date,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'executed', 'cancelled'],
      default: 'active',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    registeredAsIP: {
      type: Boolean,
      default: false,
    },
    ipTokenId: String,
    ipTransactionHash: String,
    totalUsage: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    improvements: [{
      user: {
        type: String,
        ref: 'User',
      },
      improvementType: {
        type: String,
        enum: ['entry-adjustment', 'stop-loss-adjustment', 'take-profit-adjustment', 'analysis-enhancement'],
      },
      originalValue: Schema.Types.Mixed,
      improvedValue: Schema.Types.Mixed,
      reasoning: String,
      qualityScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      revenueShare: {
        type: Number,
        min: 0,
        max: 1,
      },
      performance: {
        outcome: {
          type: String,
          enum: ['pending', 'better', 'worse', 'same'],
          default: 'pending',
        },
        returnImprovement: {
          type: Number,
          default: 0,
        },
      },
      registeredAsIP: {
        type: Boolean,
        default: false,
      },
      ipTokenId: String,
      ipTransactionHash: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    tags: [String],
    isPublic: {
      type: Boolean,
      default: true,
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

SignalSchema.index({ creator: 1 });
SignalSchema.index({ symbol: 1 });
SignalSchema.index({ status: 1 });
SignalSchema.index({ createdAt: -1 });
SignalSchema.index({ 'performance.outcome': 1 });
SignalSchema.index({ confidence: -1 });
SignalSchema.index({ totalUsage: -1 });

export const Signal = mongoose.model<SignalDocument>('Signal', SignalSchema);